#!/usr/bin/env python3
"""Verify and reconstruct the preserved Mer des Chagrins originals, offline."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import tempfile

ARCHIVE_ROOT = "archives/mer-des-chagrins-20261125"
MAX_PART_BYTES = 8 * 1024 * 1024
BLOCK_BYTES = 1024 * 1024
SAFE_COMPONENT = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*\Z")
SHA256 = re.compile(r"[0-9a-f]{64}\Z")

class ArchiveError(ValueError):
    """Invalid archive, unsafe path, or conflicting destination."""

def require(condition, message):
    if not condition:
        raise ArchiveError(message)

def absolute(path):
    # Resolving first would hide symlinks.
    return Path(os.path.abspath(os.fspath(path)))

def check_no_symlinks(path):
    path = absolute(path)
    for item in reversed((path, *path.parents)):
        try:
            info = item.lstat()
        except FileNotFoundError:
            continue
        require(not stat.S_ISLNK(info.st_mode), f"Symlink refused: {item}")
        if item != path:
            require(stat.S_ISDIR(info.st_mode), f"Non-directory ancestor: {item}")
    return path

def open_regular(path):
    path = check_no_symlinks(path)
    require(stat.S_ISREG(path.lstat().st_mode), f"Not a regular file: {path}")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_NONBLOCK", 0)
    descriptor = os.open(path, flags)
    try:
        require(stat.S_ISREG(os.fstat(descriptor).st_mode), f"Not a regular file: {path}")
        return os.fdopen(descriptor, "rb")
    except BaseException:
        os.close(descriptor)
        raise

def digest_file(path):
    digest, size = hashlib.sha256(), 0
    with open_regular(path) as stream:
        for block in iter(lambda: stream.read(BLOCK_BYTES), b""):
            digest.update(block)
            size += len(block)
    return size, digest.hexdigest()

def unique_json_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"Duplicate JSON key: {key}")
        result[key] = value
    return result

def safe_component(value):
    require(isinstance(value, str) and SAFE_COMPONENT.fullmatch(value) is not None
            and value not in {".", ".."} and not value.endswith("."),
            f"Unsafe path component: {value!r}")
    # Avoid device names and trailing-dot aliases on Windows too.
    require(value.split(".")[0].upper() not in
            {"CON", "PRN", "AUX", "NUL", *(f"COM{x}" for x in range(1, 10)),
             *(f"LPT{x}" for x in range(1, 10))}, f"Reserved filename: {value}")
    return value

def safe_member_path(value):
    require(isinstance(value, str) and "\\" not in value, f"Unsafe member path: {value!r}")
    for piece in value.split("/"):
        safe_component(piece)
    path = PurePosixPath(value)
    require(not path.is_absolute() and str(path) == value, f"Unsafe member path: {value!r}")
    require(value.startswith(ARCHIVE_ROOT + "/"), f"Member outside archive root: {value}")
    require(value != ARCHIVE_ROOT + "/MANIFEST.json", "Manifest cannot list itself")
    return value

def validate_size_and_hash(record):
    require(type(record.get("sizeBytes")) is int and record["sizeBytes"] >= 0,
            "sizeBytes must be a non-negative integer")
    require(isinstance(record.get("sha256"), str) and SHA256.fullmatch(record["sha256"]),
            "sha256 must contain 64 lowercase hexadecimal characters")

def load_manifest(repo_root):
    repo_root = check_no_symlinks(repo_root)
    root = check_no_symlinks(repo_root / ARCHIVE_ROOT)
    require(root.is_dir(), "Archive directory is missing")
    with open_regular(root / "MANIFEST.json") as stream:
        manifest = json.load(stream, object_pairs_hook=unique_json_object)
    require(isinstance(manifest, dict), "Manifest must be an object")
    require(set(manifest) == {"schemaVersion", "root", "artifactCount", "totalOriginalBytes",
                              "files", "artifacts"}, "Unexpected manifest fields")
    require(type(manifest["schemaVersion"]) is int and manifest["schemaVersion"] == 1,
            "Unsupported manifest schema")
    require(manifest["root"] == ARCHIVE_ROOT, "Unexpected archive root")
    require(isinstance(manifest["files"], list) and isinstance(manifest["artifacts"], list),
            "Manifest files and artifacts must be arrays")
    require(type(manifest["artifactCount"]) is int and
            manifest["artifactCount"] == len(manifest["artifacts"]) > 0, "Artifact count mismatch")
    require(type(manifest["totalOriginalBytes"]) is int and manifest["totalOriginalBytes"] >= 0,
            "Invalid totalOriginalBytes")
    members, folded_paths = {}, set()
    for member in manifest["files"]:
        require(isinstance(member, dict) and set(member) == {"path", "sizeBytes", "sha256"},
                "Unexpected member fields")
        name = safe_member_path(member["path"])
        validate_size_and_hash(member)
        require(name.casefold() not in folded_paths, f"Duplicate member path: {name}")
        folded_paths.add(name.casefold())
        members[name] = member
    names, used_parts, total = set(), set(), 0
    for artifact in manifest["artifacts"]:
        require(isinstance(artifact, dict) and set(artifact) ==
                {"originalName", "sizeBytes", "sha256", "parts"}, "Unexpected artifact fields")
        name = safe_component(artifact["originalName"])
        require(name.casefold() not in names, f"Duplicate original filename: {name}")
        names.add(name.casefold())
        validate_size_and_hash(artifact)
        parts = artifact["parts"]
        require(isinstance(parts, list) and len(parts) > 0, f"Missing parts: {name}")
        part_size = 0
        for index, part in enumerate(parts, start=1):
            part = safe_member_path(part)
            require(part in members, f"Part absent from files: {part}")
            require(part not in used_parts, f"Part reused across artifacts: {part}")
            used_parts.add(part)
            relative = PurePosixPath(part).relative_to(ARCHIVE_ROOT)
            require(len(relative.parts) == 3 and relative.parts[0] == "artifacts" and
                    relative.parts[1] in {"archives", "documents", "captures"},
                    f"Part outside artifact directories: {part}")
            expected = name if len(parts) == 1 else f"{name}.part{index:03d}"
            require(relative.name == expected, f"Unexpected part name or order: {part}")
            require(members[part]["sizeBytes"] <= MAX_PART_BYTES, f"Part exceeds 8 MiB: {part}")
            part_size += members[part]["sizeBytes"]
        require(part_size == artifact["sizeBytes"], f"Combined part size mismatch: {name}")
        total += artifact["sizeBytes"]
    require(total == manifest["totalOriginalBytes"], "Total original byte count mismatch")
    listed_parts = {name for name in members if name.startswith(ARCHIVE_ROOT + "/artifacts/")}
    require(listed_parts == used_parts, "Unassigned artifact members")
    require(set(members) - used_parts == {ARCHIVE_ROOT + "/README.md", ARCHIVE_ROOT + "/INVENTAIRE.json"},
            "Public README and inventory must be the only non-artifact members")
    return manifest, members

def check_exact_source_tree(repo_root, members):
    root = check_no_symlinks(repo_root / ARCHIVE_ROOT)
    expected = set(members) | {ARCHIVE_ROOT + "/MANIFEST.json"}
    directories = set()
    for name in expected:
        parent = PurePosixPath(name).parent
        while str(parent).startswith(ARCHIVE_ROOT):
            directories.add(str(parent))
            parent = parent.parent
    actual = set()
    for directory, dirs, files in os.walk(root, followlinks=False):
        current = check_no_symlinks(directory)
        for name in dirs:
            child = check_no_symlinks(current / name)
            relative = child.relative_to(repo_root).as_posix()
            require(relative in directories, f"Unlisted directory: {relative}")
        for name in files:
            child = check_no_symlinks(current / name)
            require(stat.S_ISREG(child.lstat().st_mode), f"Not a regular archive member: {child}")
            actual.add(child.relative_to(repo_root).as_posix())
    require(actual == expected,
            f"Source inventory mismatch; missing={sorted(expected - actual)}, extra={sorted(actual - expected)}")

def stream_artifact(repo_root, artifact, members, sink=None):
    whole_digest, whole_size = hashlib.sha256(), 0
    for part in artifact["parts"]:
        digest, size = hashlib.sha256(), 0
        with open_regular(repo_root / part) as stream:
            for block in iter(lambda: stream.read(BLOCK_BYTES), b""):
                digest.update(block)
                whole_digest.update(block)
                size += len(block)
                whole_size += len(block)
                if sink is not None:
                    sink.write(block)
        expected = members[part]
        require((size, digest.hexdigest()) == (expected["sizeBytes"], expected["sha256"]),
                f"Part checksum mismatch: {part}")
    require((whole_size, whole_digest.hexdigest()) == (artifact["sizeBytes"], artifact["sha256"]),
            f"Reconstructed checksum mismatch: {artifact['originalName']}")

def verify_archive(repo_root):
    repo_root = check_no_symlinks(repo_root)
    manifest, members = load_manifest(repo_root)
    check_exact_source_tree(repo_root, members)
    for name, member in members.items():
        require(digest_file(repo_root / name) == (member["sizeBytes"], member["sha256"]),
                f"Member checksum mismatch: {name}")
    for artifact in manifest["artifacts"]:
        stream_artifact(repo_root, artifact, members)
    return manifest, members

def destination_matches(path, artifact):
    if not os.path.lexists(path):
        return False
    require(digest_file(path) == (artifact["sizeBytes"], artifact["sha256"]),
            f"Existing destination differs; refusing overwrite: {path}")
    return True

def restore_one(repo_root, output, artifact, members):
    output = check_no_symlinks(output)
    target = output / artifact["originalName"]
    if destination_matches(target, artifact):
        return False
    descriptor, temporary = tempfile.mkstemp(prefix=".restore-mer-", dir=output)
    temporary = Path(temporary)
    try:
        with os.fdopen(descriptor, "wb") as sink:
            stream_artifact(repo_root, artifact, members, sink)
            sink.flush()
            os.fsync(sink.fileno())
        check_no_symlinks(output)
        try:
            # Same filesystem: atomically publish the checked file without overwrite.
            # A filesystem without hard-link support fails safely; no rename fallback.
            os.link(temporary, target, follow_symlinks=False)
        except FileExistsError:
            destination_matches(target, artifact)
            return False
        return True
    finally:
        temporary.unlink(missing_ok=True)

def run(repo_root, output=None, verify_only=False):
    repo_root = check_no_symlinks(repo_root)
    require(verify_only or output is not None, "--output is required unless --verify-only is used")
    manifest, members = verify_archive(repo_root)
    result = {"status": "verified", "artifactsVerified": len(manifest["artifacts"]),
              "membersVerified": len(members), "totalOriginalBytes": manifest["totalOriginalBytes"],
              "restored": 0, "alreadyPresent": 0}
    if verify_only:
        return result
    output = check_no_symlinks(output)
    source = repo_root / ARCHIVE_ROOT
    require(output != source and source not in output.parents, "Output must be outside the archive directory")
    if output.exists():
        require(output.is_dir(), "Output path is not a directory")
    for artifact in manifest["artifacts"]:
        destination_matches(output / artifact["originalName"], artifact)
    output.mkdir(parents=True, exist_ok=True)
    check_no_symlinks(output)
    for artifact in manifest["artifacts"]:
        created = restore_one(repo_root, output, artifact, members)
        result["restored" if created else "alreadyPresent"] += 1
    result["status"] = "restored"
    return result

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).absolute().parent.parent)
    parser.add_argument("--output", type=Path, help="Directory receiving the original filenames")
    parser.add_argument("--verify-only", action="store_true", help="Validate without writing restored files")
    args = parser.parse_args(argv)
    try:
        result = run(args.repo_root, args.output, args.verify_only)
    except (ArchiveError, OSError, json.JSONDecodeError, UnicodeDecodeError) as error:
        print(f"Archive refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
