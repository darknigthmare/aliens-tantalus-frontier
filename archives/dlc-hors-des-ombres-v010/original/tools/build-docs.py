"""Compatibility entry point for the current V0.10 delivery."""
from pathlib import Path
import runpy

if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).with_name('build-docs-v010.py')), run_name="__main__")
