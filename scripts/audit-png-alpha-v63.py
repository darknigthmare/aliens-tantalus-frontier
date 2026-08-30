"""Current-repository PNG audit for release V63, reusing the verified V62 detector."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASE_AUDIT = Path(__file__).with_name("audit-png-alpha-v62.py")
DEFAULT_REPORT = ROOT / "docs" / "references" / "V63_PNG_ALPHA_AUDIT.json"


def load_base_audit():
    spec = importlib.util.spec_from_file_location("png_alpha_v63", BASE_AUDIT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared PNG audit")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_REPORT)
    parser.add_argument(
        "--fail-on",
        choices=("never", "error", "review"),
        default="never",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    audit = load_base_audit()
    report = audit.build_report(audit.ASSET_ROOT, audit.MANIFEST)
    report["release"] = "v63"
    report["generatedBy"] = "scripts/audit-png-alpha-v63.py"
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    summary = report["summary"]
    errors = summary["findings"]["error"]
    reviews = summary["findings"]["review"]
    print(
        f"Audited {summary['assetsAudited']} runtime PNGs for V63: "
        f"{errors} error(s), {reviews} halo review candidate(s); "
        f"{summary['rawMastersExcluded']} raw master(s) excluded by rule."
    )
    if args.fail_on == "error" and errors:
        raise SystemExit(1)
    if args.fail_on == "review" and (errors or reviews):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
