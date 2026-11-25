#!/usr/bin/env python3
"""Current entry point. Historical checker is preserved under docs/historique."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('verify_fidelity_delivery.py')),run_name='__main__')
