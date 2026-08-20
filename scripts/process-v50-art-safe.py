"""Non-destructive entry point for the v50 art normalizer.

Raw ImageGen project copies stay untouched. Runtime-ready derivatives are
written below ``assets/openai/sprites/normalized`` and beside the traversal
master with a ``-clean`` suffix.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path


SCRIPT = Path(__file__).with_name("process-v50-art.py")
SPEC = importlib.util.spec_from_file_location("v50_art_pipeline", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Unable to load the v50 art pipeline")
PIPELINE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PIPELINE)


def main() -> None:
    normalized_root = PIPELINE.SPRITE_ROOT / "normalized"
    sources = [
        source for source in sorted(PIPELINE.SPRITE_ROOT.rglob("*.png"))
        if normalized_root not in source.parents
    ]
    sprite_reports = []
    for source in sources:
        destination = normalized_root / source.relative_to(PIPELINE.SPRITE_ROOT)
        sprite_reports.append(PIPELINE.normalize_atlas(source, destination))

    traversal_source = PIPELINE.METROIDVANIA_ROOT / "props" / "tantalus-traversal-kit-atlas.png"
    traversal_clean = PIPELINE.METROIDVANIA_ROOT / "props" / "tantalus-traversal-kit-atlas-clean.png"
    traversal_report = PIPELINE.normalize_atlas(traversal_source, traversal_clean)
    props = PIPELINE.extract_traversal_props(traversal_clean)

    report = {
        "pipeline": "OpenAI ImageGen + deterministic non-destructive Pillow flood-fill, stable-scale repack and guard validation",
        "grid": {
            "columns": PIPELINE.GRID,
            "rows": PIPELINE.GRID,
            "cellSize": PIPELINE.CELL_SIZE,
            "guard": PIPELINE.GUARD,
        },
        "rawMastersPreserved": True,
        "spriteAtlases": sprite_reports,
        "traversalAtlas": traversal_report,
        "traversalProps": props,
    }
    destination = PIPELINE.ROOT / "assets" / "openai" / "v50-art-normalization-report.json"
    destination.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({
        "sprites": len(sprite_reports),
        "props": len(props),
        "rawMastersPreserved": True,
        "report": destination.relative_to(PIPELINE.ROOT).as_posix(),
    }))


if __name__ == "__main__":
    main()
