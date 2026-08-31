"""Deterministic PNG alpha, white-background, halo and grid audit for V62.

The audit deliberately distinguishes opaque scene art from composited sprites,
props and UI layers. It never rewrites source images. The committed report can
be regenerated with:

    py scripts/audit-png-alpha-v62.py

Use ``--fail-on error`` in CI when confirmed production errors must fail a gate.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REPORT = ROOT / "docs" / "references" / "V62_PNG_ALPHA_AUDIT.json"
ASSET_ROOT = ROOT / "assets" / "openai"
MANIFEST = ASSET_ROOT / "sprites" / "manifest.json"

NEAR_WHITE = 245
LIGHT_EDGE = 220
LOW_CHROMA_SPREAD = 28
MIN_WHITE_COMPONENT_PIXELS = 256
MIN_WHITE_COMPONENT_RATIO = 0.002
MIN_HALO_PIXELS = 40
MIN_HALO_RATIO = 0.25


RULES = (
    {
        "id": "normalized-sprite",
        "expectation": "transparent-required",
        "pattern": "assets/openai/sprites/normalized/**/*.png",
        "reason": "Runtime sprite cells are composited over gameplay backgrounds.",
    },
    {
        "id": "hub-composite-layer",
        "expectation": "transparent-required",
        "pattern": "assets/openai/hub/layers/**/*-(mid|foreground|overhead).png",
        "reason": "Room mid/foreground/overhead layers are composited over the far layer.",
    },
    {
        "id": "runtime-prop",
        "expectation": "transparent-required",
        "pattern": "assets/openai/{hub/props,metroidvania/props}/**/*.png (clean/runtime variants)",
        "reason": "Independent props must not carry a rectangular source background.",
    },
    {
        "id": "metroidvania-composite",
        "expectation": "transparent-required",
        "pattern": "assets/openai/metroidvania/{drops,hazards,terminals}/**/*.png and non-far layers",
        "reason": "Drops, effects, terminals and near layers are composited at runtime.",
    },
    {
        "id": "ui-cutout",
        "expectation": "transparent-required",
        "pattern": "assets/openai/ui/customization/**/*.png",
        "reason": "Customization mannequins are presented over UI backgrounds.",
    },
    {
        "id": "opaque-scene",
        "expectation": "opaque-expected",
        "pattern": "title/dialogue/room/far/parallax/insertion/vent scene images",
        "reason": "Full-frame scenes intentionally fill their viewport and do not require alpha.",
    },
    {
        "id": "raw-master-exclusion",
        "expectation": "excluded-master",
        "pattern": "raw sprite directories and *-atlas.png when a normalized/*-clean runtime file exists",
        "reason": "Masters are retained for provenance; runtime uses normalized or clean derivatives.",
    },
)


def posix(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def canonical_asset_path(path: Path, asset_root: Path) -> str:
    """Return a stable project-style path, including for temporary test roots."""

    return f"assets/openai/{path.resolve().relative_to(asset_root.resolve()).as_posix()}"


def load_manifest(manifest_path: Path = MANIFEST) -> dict[str, Any]:
    return json.loads(manifest_path.read_text(encoding="utf-8"))


def normalized_contracts(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    contracts: dict[str, dict[str, Any]] = {}
    grids = manifest.get("contracts", {}).get("grids", {})
    for sheet in manifest.get("sheets", []):
        normalized = sheet.get("files", {}).get("normalized")
        grid = grids.get(sheet.get("grid"), {})
        if not normalized or not grid:
            continue
        rel = str(normalized).lstrip("/").replace("\\", "/")
        contracts[rel] = {
            "sheetId": sheet.get("id"),
            "gridId": sheet.get("grid"),
            "columns": int(grid["columns"]),
            "rows": int(grid["rows"]),
            "cellWidth": int(grid["cellWidth"]),
            "cellHeight": int(grid["cellHeight"]),
            "guard": int(grid.get("guard", 0)),
        }
    return contracts


def is_raw_master(rel: str) -> bool:
    if rel.startswith("assets/openai/sprites/") and not rel.startswith(
        "assets/openai/sprites/normalized/"
    ):
        return True
    return rel.endswith("hub-modular-props-atlas.png") or rel.endswith(
        "tantalus-traversal-kit-atlas.png"
    )


def classify_asset(rel: str, normalized: dict[str, dict[str, Any]]) -> tuple[str, str] | None:
    """Return (rule id, expectation) for a production-audited asset."""

    if rel in normalized:
        return "normalized-sprite", "transparent-required"
    if is_raw_master(rel):
        return None

    if rel.startswith("assets/openai/hub/layers/"):
        return (
            ("opaque-scene", "opaque-expected")
            if rel.endswith("-far.png")
            else ("hub-composite-layer", "transparent-required")
        )
    if rel.startswith("assets/openai/hub/props/"):
        return "runtime-prop", "transparent-required"
    if rel.startswith("assets/openai/metroidvania/props/"):
        return "runtime-prop", "transparent-required"
    if any(
        rel.startswith(prefix)
        for prefix in (
            "assets/openai/metroidvania/drops/",
            "assets/openai/metroidvania/hazards/",
            "assets/openai/metroidvania/terminals/",
        )
    ):
        return "metroidvania-composite", "transparent-required"
    if rel.startswith("assets/openai/metroidvania/"):
        if rel.endswith("-far.png"):
            return "opaque-scene", "opaque-expected"
        if rel.endswith(("-mid.png", "-foreground.png", "-overhead.png")):
            return "metroidvania-composite", "transparent-required"
    if rel.startswith("assets/openai/ui/customization/"):
        return "ui-cutout", "transparent-required"

    opaque_prefixes = (
        "assets/openai/hub/rooms/",
        "assets/openai/hub/parallax/",
        "assets/openai/hub/vents/",
        "assets/openai/mission/insertion/",
        "assets/openai/ui/title/",
        "assets/openai/ui/dialogue/",
    )
    if any(rel.startswith(prefix) for prefix in opaque_prefixes):
        return "opaque-scene", "opaque-expected"
    return None


def has_alpha_channel(image: Image.Image) -> bool:
    return "A" in image.getbands() or (
        image.mode == "P" and image.info.get("transparency") is not None
    )


def connected_edge_white(mask: np.ndarray) -> int:
    """Count near-white pixels 4-connected to any image edge."""

    if not mask.any():
        return 0
    # ``fromarray`` may expose a read-only buffer; floodfill otherwise returns
    # without changing it on Pillow/Windows.
    binary = Image.fromarray((mask.astype(np.uint8) * 255), mode="L").copy()
    pixels = binary.load()
    width, height = binary.size
    seeds: list[tuple[int, int]] = []
    for x in range(width):
        seeds.extend(((x, 0), (x, height - 1)))
    for y in range(1, height - 1):
        seeds.extend(((0, y), (width - 1, y)))
    for seed in seeds:
        if pixels[seed] == 255:
            ImageDraw.floodfill(binary, seed, 128, thresh=0)
    return int(np.count_nonzero(np.asarray(binary) == 128))


def adjacent_to(mask: np.ndarray) -> np.ndarray:
    adjacent = np.zeros(mask.shape, dtype=bool)
    adjacent[1:, :] |= mask[:-1, :]
    adjacent[:-1, :] |= mask[1:, :]
    adjacent[:, 1:] |= mask[:, :-1]
    adjacent[:, :-1] |= mask[:, 1:]
    return adjacent


def finding(code: str, severity: str, message: str, evidence: dict[str, Any]) -> dict[str, Any]:
    return {
        "code": code,
        "severity": severity,
        "message": message,
        "evidence": evidence,
    }


def audit_image(
    path: Path,
    report_path: str,
    rule_id: str,
    expectation: str,
    grid: dict[str, Any] | None = None,
) -> dict[str, Any]:
    with Image.open(path) as source:
        mode = source.mode
        width, height = source.size
        channel_alpha = has_alpha_channel(source)
        rgba = np.asarray(source.convert("RGBA"), dtype=np.uint8)

    rgb = rgba[:, :, :3]
    alpha = rgba[:, :, 3]
    total = width * height
    transparent = alpha < 255
    transparent_zero = alpha == 0
    semitransparent = (alpha > 0) & (alpha < 255)
    findings: list[dict[str, Any]] = []

    edge_white_pixels = 0
    halo_pixels = 0
    alpha_boundary_pixels = 0
    if expectation == "transparent-required":
        if not channel_alpha or not transparent.any():
            findings.append(
                finding(
                    "missing-alpha",
                    "error",
                    "This composited runtime asset has no effective transparency.",
                    {"mode": mode, "transparentPixels": int(transparent.sum())},
                )
            )

        near_white = (
            (rgb[:, :, 0] >= NEAR_WHITE)
            & (rgb[:, :, 1] >= NEAR_WHITE)
            & (rgb[:, :, 2] >= NEAR_WHITE)
            & (alpha >= 240)
        )
        edge_white_pixels = connected_edge_white(near_white)
        edge_white_ratio = edge_white_pixels / total
        if (
            edge_white_pixels >= MIN_WHITE_COMPONENT_PIXELS
            and edge_white_ratio >= MIN_WHITE_COMPONENT_RATIO
        ):
            findings.append(
                finding(
                    "edge-connected-near-white",
                    "error",
                    "A near-white opaque component is connected to the image border.",
                    {
                        "pixels": edge_white_pixels,
                        "ratio": round(edge_white_ratio, 6),
                        "rgbThreshold": NEAR_WHITE,
                    },
                )
            )

        transparent_core = alpha <= 16
        alpha_boundary = adjacent_to(transparent_core) & (alpha > 16) & (alpha < 240)
        alpha_boundary_pixels = int(alpha_boundary.sum())
        spread = rgb.max(axis=2).astype(np.int16) - rgb.min(axis=2).astype(np.int16)
        light_low_chroma = (
            (rgb.min(axis=2) >= LIGHT_EDGE) & (spread <= LOW_CHROMA_SPREAD)
        )
        dark_opaque = (alpha >= 200) & (rgb.mean(axis=2) <= 170)
        # A bright semitransparent contour alone can be a legitimate white
        # object. Requiring an adjacent darker opaque subject makes the signal
        # considerably more specific to a retained white matte.
        halo = alpha_boundary & light_low_chroma & adjacent_to(dark_opaque)
        halo_pixels = int(halo.sum())
        halo_ratio = halo_pixels / max(1, alpha_boundary_pixels)
        # This is deliberately a review candidate, not an asserted bug: white
        # armour or lamps can legitimately meet transparent boundaries.
        if halo_pixels >= MIN_HALO_PIXELS and halo_ratio >= MIN_HALO_RATIO:
            findings.append(
                finding(
                    "light-alpha-edge-review",
                    "review",
                    "Light low-chroma pixels touch transparent edges; inspect at gameplay scale for a halo.",
                    {
                        "pixels": halo_pixels,
                        "boundaryPixels": alpha_boundary_pixels,
                        "ratio": round(halo_ratio, 6),
                    },
                )
            )

    if grid:
        expected_width = grid["columns"] * grid["cellWidth"]
        expected_height = grid["rows"] * grid["cellHeight"]
        if (width, height) != (expected_width, expected_height):
            findings.append(
                finding(
                    "grid-dimension-mismatch",
                    "error",
                    "Sprite sheet dimensions do not match its declared grid.",
                    {
                        "actual": [width, height],
                        "expected": [expected_width, expected_height],
                        "gridId": grid["gridId"],
                    },
                )
            )

    return {
        "path": report_path,
        "rule": rule_id,
        "expectation": expectation,
        "mode": mode,
        "width": width,
        "height": height,
        "aspectRatio": round(width / height, 6),
        "hasAlphaChannel": channel_alpha,
        "transparentPixels": int(transparent.sum()),
        "transparentRatio": round(float(transparent.sum()) / total, 6),
        "fullyTransparentPixels": int(transparent_zero.sum()),
        "semitransparentPixels": int(semitransparent.sum()),
        "edgeConnectedNearWhitePixels": edge_white_pixels,
        "lightAlphaEdgePixels": halo_pixels,
        "alphaBoundaryPixels": alpha_boundary_pixels,
        "grid": grid,
        "findings": findings,
    }


LAYER_SUFFIX = re.compile(r"-(far|mid|foreground|overhead)\.png$")
RUNTIME_COVER_NORMALIZATION_CONTRACTS = {
    "assets/openai/metroidvania/tantalus-mission": {
        "id": "tantalus-mission-runtime-cover-v62",
        "targetAspect": 2.0,
        "layers": (
            "assets/openai/metroidvania/tantalus-mission-far.png",
            "assets/openai/metroidvania/tantalus-mission-mid.png",
            "assets/openai/metroidvania/tantalus-mission-foreground.png",
        ),
    }
}


def runtime_cover_crop(width: int, height: int, target_aspect: float) -> dict[str, float]:
    source_aspect = width / height
    if source_aspect > target_aspect:
        crop_width = height * target_aspect
        source_x = (width - crop_width) / 2
        source_y = 0.0
        crop_height = float(height)
    else:
        crop_width = float(width)
        crop_height = width / target_aspect
        source_x = 0.0
        source_y = (height - crop_height) / 2
    return {
        "sourceX": round(source_x, 6),
        "sourceY": round(source_y, 6),
        "sourceWidth": round(crop_width, 6),
        "sourceHeight": round(crop_height, 6),
    }


def add_cohort_findings(assets: list[dict[str, Any]]) -> None:
    cohorts: dict[str, list[dict[str, Any]]] = {}
    for asset in assets:
        path = asset["path"]
        if "/hub/layers/" not in path and "/metroidvania/" not in path:
            continue
        key = LAYER_SUFFIX.sub("", path)
        if key != path:
            cohorts.setdefault(key, []).append(asset)
    for cohort_key, members in cohorts.items():
        dimensions = sorted({(item["width"], item["height"]) for item in members})
        if len(members) < 2:
            continue
        contract = RUNTIME_COVER_NORMALIZATION_CONTRACTS.get(cohort_key)
        if contract:
            actual_layers = sorted(item["path"] for item in members)
            expected_layers = sorted(contract["layers"])
            if actual_layers != expected_layers:
                evidence = {
                    "contractId": contract["id"],
                    "actualLayers": actual_layers,
                    "expectedLayers": expected_layers,
                }
                for item in members:
                    item["findings"].append(
                        finding(
                            "runtime-cover-contract-mismatch",
                            "error",
                            "The runtime cover cohort does not match its declared layer set.",
                            evidence,
                        )
                    )
                continue
            for item in members:
                item["runtimeCoverNormalization"] = {
                    "id": contract["id"],
                    "mode": "centered-cover",
                    "targetAspect": contract["targetAspect"],
                    "sourceCrop": runtime_cover_crop(
                        item["width"], item["height"], contract["targetAspect"]
                    ),
                }
            continue
        if len(dimensions) == 1:
            continue
        evidence = {"cohort": [item["path"] for item in members], "dimensions": dimensions}
        for item in members:
            item["findings"].append(
                finding(
                    "layer-dimension-mismatch",
                    "error",
                    "Parallax layers in the same scene do not share dimensions.",
                    evidence,
                )
            )


def add_v62_scene_findings(assets: list[dict[str, Any]]) -> None:
    for asset in assets:
        path = asset["path"]
        if not (
            "/mission/insertion/" in path
            or path.endswith("/hub/vents/tantalus-duct-interior-v62.png")
            or path.endswith("/ui/title/tantalus-frontier-title-background-v61.png")
        ):
            continue
        ratio = asset["aspectRatio"]
        if asset["width"] < 1280 or asset["height"] < 720 or abs(ratio - (16 / 9)) > 0.03:
            asset["findings"].append(
                finding(
                    "scene-dimension-review",
                    "error",
                    "Full-frame scene does not meet the minimum 16:9 production contract.",
                    {
                        "actual": [asset["width"], asset["height"]],
                        "aspectRatio": ratio,
                        "minimum": [1280, 720],
                    },
                )
            )


def build_report(asset_root: Path = ASSET_ROOT, manifest_path: Path = MANIFEST, *, ignored_production_prefixes: tuple[str, ...] = ()) -> dict[str, Any]:
    manifest = load_manifest(manifest_path)
    normalized = normalized_contracts(manifest)
    assets: list[dict[str, Any]] = []
    excluded = 0
    unclassified = 0

    png_paths = [path for path in asset_root.rglob("*.png") if not path.relative_to(asset_root).as_posix().startswith(ignored_production_prefixes)]
    for path in sorted(png_paths, key=lambda item: item.as_posix().lower()):
        rel = canonical_asset_path(path, asset_root)
        classification = classify_asset(rel, normalized)
        if classification is None:
            if is_raw_master(rel):
                excluded += 1
            else:
                unclassified += 1
            continue
        rule_id, expectation = classification
        assets.append(audit_image(path, rel, rule_id, expectation, normalized.get(rel)))

    add_cohort_findings(assets)
    add_v62_scene_findings(assets)
    findings = [
        {"path": asset["path"], **item}
        for asset in assets
        for item in asset["findings"]
    ]
    severity = Counter(item["severity"] for item in findings)
    rules = Counter(asset["rule"] for asset in assets)
    expectations = Counter(asset["expectation"] for asset in assets)

    return {
        "schemaVersion": 1,
        "release": "v62",
        "generatedBy": "scripts/audit-png-alpha-v62.py",
        "thresholds": {
            "nearWhiteRgb": NEAR_WHITE,
            "edgeWhiteMinimumPixels": MIN_WHITE_COMPONENT_PIXELS,
            "edgeWhiteMinimumRatio": MIN_WHITE_COMPONENT_RATIO,
            "haloLightRgb": LIGHT_EDGE,
            "haloMaximumChannelSpread": LOW_CHROMA_SPREAD,
            "haloMinimumPixels": MIN_HALO_PIXELS,
            "haloMinimumBoundaryRatio": MIN_HALO_RATIO,
        },
        "rules": list(RULES),
        "summary": {
            "pngFilesDiscovered": len(png_paths),
            "assetsAudited": len(assets),
            "rawMastersExcluded": excluded,
            "unclassifiedNotAsserted": unclassified,
            "runtimeCoverNormalizedAssets": sum(
                1 for asset in assets if asset.get("runtimeCoverNormalization")
            ),
            "byRule": dict(sorted(rules.items())),
            "byExpectation": dict(sorted(expectations.items())),
            "findings": {
                "error": severity.get("error", 0),
                "review": severity.get("review", 0),
            },
        },
        "findings": findings,
        "assets": assets,
    }


def write_report(report: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-root", type=Path, default=ASSET_ROOT)
    parser.add_argument("--manifest", type=Path, default=MANIFEST)
    parser.add_argument("--output", type=Path, default=DEFAULT_REPORT)
    parser.add_argument(
        "--fail-on",
        choices=("never", "error", "review"),
        default="never",
        help="Exit non-zero for confirmed errors, or for errors and review candidates.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    report = build_report(args.asset_root, args.manifest)
    write_report(report, args.output)
    summary = report["summary"]
    print(
        f"Audited {summary['assetsAudited']} runtime PNGs: "
        f"{summary['findings']['error']} error(s), "
        f"{summary['findings']['review']} halo review candidate(s); "
        f"{summary['rawMastersExcluded']} raw master(s) excluded by rule."
    )
    errors = summary["findings"]["error"]
    reviews = summary["findings"]["review"]
    if args.fail_on == "error" and errors:
        raise SystemExit(1)
    if args.fail_on == "review" and (errors or reviews):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
