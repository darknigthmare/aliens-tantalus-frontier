"""Run regression and investigation paths with finite resources, on the actual current engine."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,json
R=Path(__file__).resolve().parents[1]
CASES=[('story',[]),('normal',['--normal']),('main',['--main-only'])]+[(kind+('-normal' if normal else ''),['--'+kind]+(['--normal'] if normal else [])) for kind in ['services','containment','sensors','ducts','investigations','security','fidelity'] for normal in [False,True]]
def run(case):
 label,args=case
 with (R/f'docs/v11/campaign-{label}.log').open('w') as log:
  p=subprocess.run(['node','tests/campaign_v11.mjs',*args],cwd=R,stdout=log,stderr=subprocess.STDOUT,timeout=120)
 print(label,p.returncode,flush=True);return {'case':label,'exitCode':p.returncode}
with ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(run,CASES))
(R/'docs/v11/CAMPAIGN_BATCH.json').write_text(json.dumps(results,indent=2))
if any(r['exitCode'] for r in results):raise SystemExit(1)
