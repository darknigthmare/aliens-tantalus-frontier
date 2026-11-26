from pathlib import Path
import subprocess,json,sys
R=Path(__file__).resolve().parents[1]
res=[]
for f in ['browser_smoke_v11.py']:
 p=subprocess.run([sys.executable,'tests/'+f],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=240)
 (R/'docs/v11'/('regression-'+f+'.log')).write_text(p.stdout);print(f,p.returncode,flush=True);res.append({'suite':f,'exitCode':p.returncode})
(R/'docs/v11/BROWSER_BATCH.json').write_text(json.dumps(res,indent=2))
if any(r['exitCode'] for r in res):raise SystemExit(1)
