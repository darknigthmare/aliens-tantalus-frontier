#!/usr/bin/env python3
"""Two sequential independent real Chromium sessions, aggregated only after both complete."""
from pathlib import Path
import subprocess, sys, json
R=Path(__file__).resolve().parents[1]
for part in ['a','b']:
 result=subprocess.run([sys.executable,str(R/'tests'/f'browser-v06-{part}.py')])
 if result.returncode:raise SystemExit(result.returncode)
a=json.loads((R/'docs/BROWSER_V06A_TEST_RESULTS.json').read_text());b=json.loads((R/'docs/BROWSER_V06B_TEST_RESULTS.json').read_text())
out={**a,'method':'Two sequential independent Chromium sessions on exact standalone via set_content; normal keyboard/buttons and actual JSON imports/exports. Prepared late fixtures labelled. No origin or policy changes.','cases':a['cases']+b['cases'],'captures':a['captures']+b['captures'],'errors':a['errors']+b['errors'],'passed':a['passed'] and b['passed']}
(R/'docs/BROWSER_V06_TEST_RESULTS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('V06 BROWSER',len(out['cases']),len(out['captures']),out['passed'])
