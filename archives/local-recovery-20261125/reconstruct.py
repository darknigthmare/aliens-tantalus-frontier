#!/usr/bin/env python3
"""Verify or restore preserved ZIP archives without extracting their contents.

Python 3.10+; standard library only. Source files are always opened read-only.
"""
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

BUFFER_BYTES = 4 * 1024 * 1024
SHA256 = re.compile(r"[0-9a-f]{64}\Z")
IDENTIFIER = re.compile(r"[a-z0-9][a-z0-9-]*\Z")
ZIP_NAME = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]*\.zip\Z")


class ArchiveError(Exception):
    """The archive cannot be verified or safely installed."""


def require_hash(value: object, label: str) -> str:
    if not isinstance(value, str) or not SHA256.fullmatch(value):
        raise ArchiveError(f"Invalid SHA-256 for {label}")
    return value


def require_size(value: object, label: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ArchiveError(f"Invalid byte count for {label}")
    return value


def relative_part(root: Path, value: object) -> Path:
    if not isinstance(value, str) or not value or "\\" in value:
        raise ArchiveError("Invalid part path")
    parsed = PurePosixPath(value)
    if parsed.is_absolute() or parsed.as_posix() != value or any(
        part in (".", "..") for part in parsed.parts
    ):
        raise ArchiveError(f"Unsafe part path: {value!r}")
    current = root
    for component in parsed.parts:
        current = current / component
        if current.is_symlink():
            raise ArchiveError(f"Symlink is not an archive part: {value!r}")
    try:
        current.resolve(strict=True).relative_to(root)
    except (OSError, ValueError) as exc:
        raise ArchiveError(f"Missing or escaped part: {value!r}") from exc
    if not stat.S_ISREG(current.stat().st_mode):
        raise ArchiveError(f"Part is not a regular file: {value!r}")
    return current


def load_manifest(root: Path) -> list[dict]:
    manifest_path = root / "MANIFEST.json"
    if manifest_path.is_symlink():
        raise ArchiveError("The manifest must not be a symlink")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise ArchiveError(f"Cannot read manifest: {exc}") from exc
    if manifest.get("schema_version") != 1:
        raise ArchiveError("Unsupported manifest schema")
    archives = manifest.get("archives")
    if not isinstance(archives, list) or not archives:
        raise ArchiveError("Manifest contains no archives")
    seen_ids: set[str] = set()
    seen_names: set[str] = set()
    seen_parts: set[str] = set()
    for archive in archives:
        if not isinstance(archive, dict):
            raise ArchiveError("Invalid archive entry")
        identity, name = archive.get("id"), archive.get("original_name")
        if not isinstance(identity, str) or not IDENTIFIER.fullmatch(identity):
            raise ArchiveError("Invalid archive identifier")
        if identity in seen_ids:
            raise ArchiveError(f"Duplicate archive identifier: {identity}")
        seen_ids.add(identity)
        if not isinstance(name, str) or not ZIP_NAME.fullmatch(name):
            raise ArchiveError(f"Unsafe output filename: {name!r}")
        if name in seen_names:
            raise ArchiveError(f"Duplicate output filename: {name}")
        seen_names.add(name)
        require_hash(archive.get("sha256"), identity)
        size = require_size(archive.get("size_bytes"), identity)
        parts = archive.get("parts")
        if not isinstance(parts, list) or not parts:
            raise ArchiveError(f"Missing parts: {identity}")
        total = 0
        for part in parts:
            if not isinstance(part, dict):
                raise ArchiveError(f"Invalid part: {identity}")
            path = part.get("path")
            relative_part(root, path)
            if path in seen_parts:
                raise ArchiveError(f"Duplicate part path: {path}")
            seen_parts.add(path)
            total += require_size(part.get("size_bytes"), str(path))
            require_hash(part.get("sha256"), str(path))
        if total != size:
            raise ArchiveError(f"Part byte counts do not match archive: {identity}")
    if manifest.get("archive_count") != len(archives):
        raise ArchiveError("Archive count differs from the manifest")
    if manifest.get("total_source_bytes") != sum(a["size_bytes"] for a in archives):
        raise ArchiveError("Total bytes differ from the manifest")
    return archives


def stream_archive(root: Path, archive: dict, output=None) -> None:
    total_hash = hashlib.sha256()
    total_size = 0
    for part in archive["parts"]:
        path = relative_part(root, part["path"])
        flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(path, flags)
        part_hash = hashlib.sha256()
        part_size = 0
        with os.fdopen(descriptor, "rb") as source:
            before = os.fstat(source.fileno())
            if not stat.S_ISREG(before.st_mode):
                raise ArchiveError(f"Part is no longer a regular file: {part['path']}")
            if before.st_size != part["size_bytes"]:
                raise ArchiveError(f"Part byte count differs: {part['path']}")
            while block := source.read(BUFFER_BYTES):
                part_hash.update(block)
                total_hash.update(block)
                part_size += len(block)
                total_size += len(block)
                if output is not None:
                    output.write(block)
            after = os.fstat(source.fileno())
        if (before.st_ino, before.st_size, before.st_mtime_ns) != (
            after.st_ino, after.st_size, after.st_mtime_ns
        ):
            raise ArchiveError(f"Part changed during reading: {part['path']}")
        if part_size != part["size_bytes"] or part_hash.hexdigest() != part["sha256"]:
            raise ArchiveError(f"Part SHA-256 differs: {part['path']}")
    if total_size != archive["size_bytes"] or total_hash.hexdigest() != archive["sha256"]:
        raise ArchiveError(f"Archive SHA-256 differs: {archive['id']}")


def prepare_output(root: Path, value: str) -> Path:
    output = Path(value).expanduser().absolute()
    for component in (output, *output.parents):
        if component.is_symlink():
            raise ArchiveError("The output path must not contain symlinks")
    output = output.resolve()
    if output == root or root in output.parents:
        raise ArchiveError("Restore outside the preserved source directory")
    for parent in (root, *root.parents):
        if (parent / ".git").exists() and (output == parent or parent in output.parents):
            raise ArchiveError("Restore outside this Git repository")
    output.mkdir(parents=True, exist_ok=True)
    if not output.is_dir():
        raise ArchiveError("The output path is not a directory")
    return output


def restore_archive(root: Path, archive: dict, output_dir: Path) -> Path:
    destination = output_dir / archive["original_name"]
    if os.path.lexists(destination):
        raise ArchiveError(f"Refusing to overwrite: {destination}")
    descriptor, temp_name = tempfile.mkstemp(prefix=".archive-", suffix=".partial", dir=output_dir)
    temporary = Path(temp_name)
    try:
        with os.fdopen(descriptor, "wb") as output:
            stream_archive(root, archive, output)
            output.flush()
            os.fsync(output.fileno())
        # Atomic no-replace installation: a hard link fails if the name exists.
        # Unlike rename/replace on POSIX, it can never overwrite a concurrent file.
        os.link(temporary, destination)
        temporary.unlink()
        return destination
    finally:
        temporary.unlink(missing_ok=True)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--list", action="store_true", help="List preserved archives")
    action.add_argument("--verify", action="store_true", help="Verify every part and complete archive hash")
    action.add_argument("--archive", metavar="ID", help="Restore one archive identifier")
    action.add_argument("--all", action="store_true", help="Restore all sixteen archives")
    parser.add_argument("--output-dir", help="External directory for restored ZIP files; existing files are refused")
    args = parser.parse_args(argv)
    if (args.archive or args.all) and not args.output_dir:
        parser.error("Restoration requires --output-dir")
    if (args.list or args.verify) and args.output_dir:
        parser.error("--output-dir is only used for restoration")
    root = Path(__file__).resolve().parent
    try:
        archives = load_manifest(root)
        if args.list:
            for archive in archives:
                print(f"{archive['id']}  {archive['size_bytes']} bytes  {archive['original_name']}")
            return 0
        selected = archives if not args.archive else [a for a in archives if a["id"] == args.archive]
        if not selected:
            raise ArchiveError(f"Unknown archive identifier: {args.archive}")
        if args.verify:
            for archive in selected:
                stream_archive(root, archive)
                print(f"VERIFIED {archive['id']} {archive['sha256']}")
        else:
            output = prepare_output(root, args.output_dir)
            # Refuse existing targets before starting a multi-archive operation.
            existing = [a["original_name"] for a in selected if os.path.lexists(output / a["original_name"])]
            if existing:
                raise ArchiveError("Refusing to overwrite: " + ", ".join(existing))
            for archive in selected:
                path = restore_archive(root, archive, output)
                print(f"RESTORED {archive['id']} {path}")
        return 0
    except (ArchiveError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
