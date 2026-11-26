"""Rebuild the cumulative 0.8 data and standalone HTML from the authored generators."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
for script in ['make_content.py','extend_content_v02.py','extend_content_v03.py','extend_content_v04.py','extend_content_v05.py','extend_content_v06.py','extend_content_v07.py','extend_content_v08.py','make_assets.py','make_assets_v06.py','make_ui_assets_v07.py','build.py']:
 subprocess.run([sys.executable,str(root/'tools'/script)],cwd=root,check=True)
