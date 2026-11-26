"""Restore only the pinned Alien Isolation V0.8 package from its Git archive."""
from pathlib import Path, PurePosixPath
import hashlib
import io
import json
import shutil
import stat
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
REF = "6b46eaf8f574871e39487e0a10ef46acfb1f41a6"
ARCHIVE = "ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip"
ARCHIVE_SHA256 = "880f74e69551afd41af36b62c34778dd239a10386f573cb86eb170641855a978"
MANIFEST_SHA256 = "6b95945eec2a27741eadc8c36da51729a5bcac0f54aae4d4ea8506dfa4357bde"
GAME_SHA256 = "e21c5a50305e392dd8ee324783f2e6b9448f78001e342255a34c024440928df9"
ARCHIVE_ROOT = "archives/dlc-source-recovery-20261126/alien-isolation"
DEST = ROOT / "modules/alien-isolation/v0.8"
MANIFEST = DEST.parent / "RECOVERY_MANIFEST.json"
GAME = ROOT / "dlc/alien-isolation/game.html"
digest = lambda data: hashlib.sha256(data).hexdigest()

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)

def main():
    if MANIFEST.exists():
        if digest(MANIFEST.read_bytes()) != MANIFEST_SHA256:
            raise RuntimeError("A different recovery manifest already exists.")
        subprocess.run(["node", "scripts/public-alien-isolation-dlc-admissions.mjs"], cwd=ROOT, check=True)
        print("The exact source package is already present.")
        return
    if DEST.exists() or GAME.exists():
        raise RuntimeError("Refusing to overwrite a partial or unrelated recovery.")
    try:
        git("cat-file", "-e", REF + "^{commit}")
    except subprocess.CalledProcessError:
        subprocess.run(["git", "fetch", "--no-tags", "--depth=1", "--filter=blob:none", "origin", REF], cwd=ROOT, check=True)
    archive = b"".join(git("show", f"{REF}:{ARCHIVE_ROOT}/parts/{ARCHIVE}.part-{i:03d}") for i in range(9))
    if len(archive) != 85001778 or digest(archive) != ARCHIVE_SHA256:
        raise RuntimeError("Archive size or digest mismatch.")
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        members = z.infolist()
        if len(members) != 646 or sum(m.file_size for m in members) != 107266357:
            raise RuntimeError("Unexpected archive inventory.")
        seen = set()
        for member in members:
            path = PurePosixPath(member.filename)
            if path.is_absolute() or ".." in path.parts or "\\" in member.filename:
                raise RuntimeError("Unsafe archive path.")
            if path.parts[0] != "ALIEN_ISOLATION_DLC_V0_8" or member.filename in seen:
                raise RuntimeError("Unexpected or duplicate archive member.")
            if stat.S_ISLNK(member.external_attr >> 16) or member.is_dir():
                raise RuntimeError("Unexpected archive member type.")
            seen.add(member.filename)
        if z.testzip() is not None:
            raise RuntimeError("Archive CRC verification failed.")
        with tempfile.TemporaryDirectory(prefix="isolation-recovery-") as temporary:
            z.extractall(temporary)
            source = Path(temporary) / "ALIEN_ISOLATION_DLC_V0_8"
            files = [{"path": p.relative_to(source).as_posix(), "bytes": p.stat().st_size,
                      "sha256": digest(p.read_bytes())}
                     for p in sorted(source.rglob("*")) if p.is_file()]
            manifest = {"schema": 1, "module": "alien-isolation", "version": "0.8.0",
                "sourceArchive": {"name": ARCHIVE, "bytes": 85001778, "sha256": ARCHIVE_SHA256,
                    "recoveryCommit": REF, "recoveryPath": ARCHIVE_ROOT + "/",
                    "pullRequest": "https://github.com/darknigthmare/aliens-tantalus-frontier/pull/73"},
                "fileCount": len(files), "uncompressedBytes": sum(f["bytes"] for f in files),
                "historicalEvidenceTransferred": False, "files": files}
            encoded = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            if digest(encoded) != MANIFEST_SHA256:
                raise RuntimeError("Recovered inventory differs from the locally verified inventory.")
            game = (source / "JOUER_ISOLATION.html").read_bytes()
            if len(game) != 1107027 or digest(game) != GAME_SHA256:
                raise RuntimeError("Recovered playable HTML differs from the verified version.")
            DEST.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(source, DEST)
            MANIFEST.write_bytes(encoded)
            GAME.parent.mkdir(parents=True, exist_ok=True)
            GAME.write_bytes(game)
    subprocess.run(["node", "scripts/public-alien-isolation-dlc-admissions.mjs"], cwd=ROOT, check=True)
    print(json.dumps({"recoveredFiles": 646, "recoveredBytes": 107266357,
                      "archiveSha256": ARCHIVE_SHA256, "manifestSha256": MANIFEST_SHA256}))

if __name__ == "__main__":
    main()
