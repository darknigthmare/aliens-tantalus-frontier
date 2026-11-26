import subprocess,json,os
os.chdir(__import__('pathlib').Path(__file__).resolve().parents[1])
from pathlib import Path
results=[]
for p in ['browser.py','browser_v04.py','browser_v05.py','browser_v06.py','browser_v07.py','browser_v08.py']:
 with open('qa/'+p+'.v08.log','w') as f:
  r=subprocess.run(['python','tests/'+p],stdout=f,stderr=subprocess.STDOUT)
 results.append({'script':p,'exitCode':r.returncode})
 Path('qa/browser-suites-v08.json').write_text(json.dumps(results,indent=2))

raise SystemExit(any(r["exitCode"] for r in results))
