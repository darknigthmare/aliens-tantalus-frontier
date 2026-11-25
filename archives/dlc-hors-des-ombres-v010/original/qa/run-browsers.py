"""Execute actual UI regressions; Playwright and Chromium required."""
import subprocess,sys,time,json
from pathlib import Path
r=Path(__file__).resolve().parents[1];runs=[]
for v in ['02','03','04','05','06','07','08','09','010']:
 start=time.time();result=subprocess.run([sys.executable,str(r/f'qa/browser-v{v}.py')],cwd=r)
 runs.append({'suite':v,'exit':result.returncode,'seconds':time.time()-start})
 (r/'qa/browser-execution-v010.json').write_text(json.dumps(runs,indent=2))
 if result.returncode:raise SystemExit(result.returncode)
