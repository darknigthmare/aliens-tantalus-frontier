"""Current-repository PNG audit for release V64, reusing the verified detector."""

from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
from collections import Counter
from pathlib import Path

from PIL import Image

from v64_sprite_cell_quality import (
    ALPHA_THRESHOLD,
    MAX_ROW_RELATIVE_AREA,
    MIN_CELL_DIMENSION,
    MIN_FOREGROUND_PIXELS,
    MIN_ROW_RELATIVE_AREA,
    analyze_v64_cells,
)

ROOT = Path(__file__).resolve().parents[1]
BASE_AUDIT = Path(__file__).with_name("audit-png-alpha-v62.py")
DEFAULT_REPORT = ROOT / "docs" / "references" / "V64_PNG_ALPHA_AUDIT.json"
V64_SHEET_IDS = {
    "enemy.newborn.action.v64",
    "enemy.offspring.action.v64",
    "enemy.predalien.action.v64",
}
IGNORED_PRODUCTION_PREFIXES = tuple(
    f"sprites/{directory}/{version}/"
    for version in ("v65", "v66", "v73", "v74")
    for directory in ("frames", "reference-masters", "previews", "metadata")
) + (
    "sprites/normalized/enemy-clips-v66/",
    "sprites/normalized/enemy-motion-v66/",
    "sprites/normalized/enemy-profiles-v66/",
)


def load_base_audit():
    spec = importlib.util.spec_from_file_location("png_alpha_v64", BASE_AUDIT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared PNG audit")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def build_scoped_report(asset_root: Path, manifest_path: Path, repository_root: Path = ROOT) -> dict:
    """Keep runtime checks strict without counting unpublished local backups.

    Git controls only the inventory of non-runtime masters/unclassified files.
    Every runtime-classified PNG is audited, including newly untracked files.
    A source export without .git retains the deterministic filesystem scan.
    """
    audit = load_base_audit()
    exclusions = list(IGNORED_PRODUCTION_PREFIXES)
    if (repository_root / ".git").exists():
        relative_root = asset_root.resolve().relative_to(repository_root.resolve()).as_posix()
        result = subprocess.run(
            ["git", "-C", str(repository_root), "ls-files", "-z", "--", relative_root],
            capture_output=True, check=False,
        )
        if result.returncode:
            raise RuntimeError("Cannot inspect Git PNG inventory: " + result.stderr.decode("utf-8", errors="replace"))
        tracked = {
            (repository_root / name.decode("utf-8")).resolve()
            for name in result.stdout.split(b"\0") if name
        }
        normalized = audit.normalized_contracts(audit.load_manifest(manifest_path))
        paths = list(asset_root.rglob("*.png"))
        runtime_paths = [path.relative_to(asset_root).as_posix() for path in paths
            if audit.classify_asset(audit.canonical_asset_path(path, asset_root), normalized) is not None]
        for path in paths:
            relative = path.relative_to(asset_root).as_posix()
            if relative.startswith(IGNORED_PRODUCTION_PREFIXES) or path.resolve() in tracked:
                continue
            canonical = audit.canonical_asset_path(path, asset_root)
            if audit.classify_asset(canonical, normalized) is None:
                # The shared API accepts prefixes. A pathological filename
                # collision must fail instead of masking a runtime PNG sibling.
                if any(runtime.startswith(relative) for runtime in runtime_paths):
                    raise RuntimeError("Unpublished PNG prefix overlaps a runtime asset: " + relative)
                exclusions.append(relative)
    return audit.build_report(asset_root, manifest_path, ignored_production_prefixes=tuple(exclusions))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_REPORT)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate that the committed report matches the current assets without rewriting it.",
    )
    parser.add_argument("--fail-on", choices=("never", "error", "review"), default="never")
    return parser.parse_args()


def add_v64_cell_quality(report: dict) -> None:
    report["thresholds"]["v64CellQuality"] = {
        "alphaThreshold": ALPHA_THRESHOLD,
        "minimumForegroundPixels": MIN_FOREGROUND_PIXELS,
        "minimumCellDimension": MIN_CELL_DIMENSION,
        "minimumRowRelativeArea": MIN_ROW_RELATIVE_AREA,
        "maximumRowRelativeArea": MAX_ROW_RELATIVE_AREA,
    }
    for asset in report["assets"]:
        sheet_id = (asset.get("grid") or {}).get("sheetId")
        if sheet_id not in V64_SHEET_IDS:
            continue
        path = ROOT / asset["path"]
        with Image.open(path) as source:
            quality = analyze_v64_cells(source)
        asset["cellQuality"] = {
            "cells": quality["cells"],
            "rowMedianForegroundPixels": quality["rowMedianForegroundPixels"],
        }
        for finding in quality["findings"]:
            asset["findings"].append({
                "code": f"v64-{finding['code']}",
                "severity": "error",
                "message": finding["message"],
                "evidence": finding["evidence"],
            })

    findings = [
        {"path": asset["path"], **finding}
        for asset in report["assets"]
        for finding in asset["findings"]
    ]
    severity = Counter(finding["severity"] for finding in findings)
    report["findings"] = findings
    report["summary"]["findings"] = {
        "error": severity.get("error", 0),
        "review": severity.get("review", 0),
    }


def main() -> None:
    args = parse_args()
    audit = load_base_audit()
    # Future production candidates are not V64 runtime PNGs. The separate
    # V65/V66 gates verify accepted WebP pixels, alpha, cell geometry and sources.
    # Ignore production candidates before even the historical excluded count.
    report = build_scoped_report(audit.ASSET_ROOT, audit.MANIFEST)
    add_v64_cell_quality(report)
    report["release"] = "v64"
    report["generatedBy"] = "scripts/audit-png-alpha-v64.py"
    serialized = json.dumps(report, indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not args.output.is_file():
            raise SystemExit(f"PNG audit report is missing: {args.output}")
        if args.output.read_text(encoding="utf-8") != serialized:
            raise SystemExit(
                "PNG audit report is stale; regenerate it with "
                "`py scripts/audit-png-alpha-v64.py --fail-on error`."
            )
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(serialized, encoding="utf-8")
    summary = report["summary"]
    errors = summary["findings"]["error"]
    reviews = summary["findings"]["review"]
    print(
        f"Audited {summary['assetsAudited']} runtime PNGs for V64: "
        f"{errors} error(s), {reviews} halo review candidate(s); "
        f"{summary['rawMastersExcluded']} raw master(s) excluded by rule"
        f"{' and report synchronized' if args.check else ''}."
    )
    if args.fail_on == "error" and errors:
        raise SystemExit(1)
    if args.fail_on == "review" and (errors or reviews):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
