"""Rebuild only the V161 workbook from its reviewed JSON; runtime pins stay fixed."""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('directory', type=Path, nargs='?', default=Path(__file__).resolve().parents[1] / 'docs/forge/xeno-trials')
args = parser.parse_args()
spec = importlib.util.spec_from_file_location('audit_workbook_engine_v159', Path(__file__).with_name('generate-audit-continuation-v159.py'))
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
print(json.dumps(engine.rebuild(args.directory, 'V161'), ensure_ascii=False))
