#!/usr/bin/env python3
"""Restore original archives after verifying every part and full SHA-256."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile

def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def restore(root, output):
    manifest = json.loads((root / "MANIFEST.json").read_text(encoding="utf-8"))
    output.mkdir(parents=True, exist_ok=True)
    rows = []
    for archive in manifest["archives"]:
        name = archive["filename"]
        if Path(name).name != name or name in {"", ".", ".."}:
            raise ValueError("Unsafe output name")
        target = output / name
        if target.exists():
            if target.stat().st_size != archive["sizeBytes"] or digest(target) != archive["sha256"]:
                raise ValueError("Refusing to replace different file: " + name)
            rows.append({"filename": name, "status": "verified_existing"})
            continue
        fd, temporary = tempfile.mkstemp(prefix=".restore-", dir=output)
        temp = Path(temporary)
        try:
            complete = hashlib.sha256()
            total = 0
            with os.fdopen(fd, "wb") as dest:
                for part in archive["parts"]:
                    relative = Path(part["path"])
                    if relative.is_absolute() or ".." in relative.parts:
                        raise ValueError("Unsafe part path")
                    source = root / relative
                    data = source.read_bytes()
                    if len(data) != part["sizeBytes"] or hashlib.sha256(data).hexdigest() != part["sha256"]:
                        raise ValueError("Part mismatch: " + part["path"])
                    if hashlib.sha1(b"blob " + str(len(data)).encode() + bytes([0]) + data).hexdigest() != part["gitBlobSha"]:
                        raise ValueError("Git blob mismatch: " + part["path"])
                    dest.write(data)
                    complete.update(data)
                    total += len(data)
            if total != archive["sizeBytes"] or complete.hexdigest() != archive["sha256"]:
                raise ValueError("Complete archive mismatch: " + name)
            os.link(temp, target)
            rows.append({"filename": name, "status": "restored_and_verified", "sizeBytes": total, "sha256": complete.hexdigest()})
        finally:
            temp.unlink(missing_ok=True)
    return rows

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    print(json.dumps(restore(Path(__file__).resolve().parent, args.output), indent=2))

