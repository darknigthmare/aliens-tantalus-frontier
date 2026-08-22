"""Normalize one OpenAI 4x4 sprite master and refresh its QA report entry.

The generated master is kept as the raw project asset.  This wrapper reuses
the established v50 neutral/chroma extraction and repack pipeline, writes only the requested
runtime derivative, and updates the matching entry in the shared report.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PIPELINE_PATH = Path(__file__).with_name("process-v50-art.py")
REPORT_PATH = ROOT / "assets" / "openai" / "v50-art-normalization-report.json"


def load_pipeline():
    spec = importlib.util.spec_from_file_location("v54_sprite_pipeline", PIPELINE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the sprite normalization pipeline")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def project_path(value: str) -> Path:
    path = (ROOT / value).resolve()
    if path != ROOT and ROOT not in path.parents:
        raise ValueError(f"Path escapes project root: {value}")
    return path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", help="Raw master path relative to the project root")
    parser.add_argument("destination", help="Normalized path relative to the project root")
    args = parser.parse_args()

    source = project_path(args.source)
    destination = project_path(args.destination)
    if not source.exists():
        raise SystemExit(f"Missing source: {source}")

    pipeline = load_pipeline()
    entry = pipeline.normalize_atlas(source, destination)
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    entries = report.get("spriteAtlases", [])
    matching = [index for index, item in enumerate(entries) if item.get("file") == entry["file"]]
    if len(matching) > 1:
        raise ValueError(f"Expected at most one report entry for {entry['file']}, found {len(matching)}")
    if matching:
        entries[matching[0]] = entry
    else:
        entries.append(entry)
        entries.sort(key=lambda item: item.get("file", ""))
    report["release"] = "v54"
    report["spriteAtlasCount"] = len(entries)
    report["spriteCellCount"] = sum(len(item.get("cells", [])) for item in entries)
    report["pipeline"] = (
        "OpenAI ImageGen + deterministic neutral/chroma extraction, connected-component "
        "cell recovery, stable-scale repack and guard validation"
    )
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(entry, ensure_ascii=False))


if __name__ == "__main__":
    main()
