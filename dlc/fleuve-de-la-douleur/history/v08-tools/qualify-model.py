#!/usr/bin/env python3
"""Run current model/traversal/installer suites and bind outcomes to source hashes."""
from pathlib import Path
import argparse,subprocess,hashlib,json,time
R=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--previous',type=Path,help='Extracted authentic v0.7 package, for optional real-payload upgrade tests');args=ap.parse_args()
def hashes():return {p.relative_to(R).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((R/'src/river-of-pain').iterdir()) if p.is_file()}
before=hashes();runs=[]
commands=[['node','tests/'+n+'.cjs'] for n in ['core','colony','exploration','passages','persistence','life','defense','ducts','mobility','traversal','traversal-exploration','traversal-life','traversal-defense','traversal-ducts','traversal-mobility']]+[['node','tests/installer.mjs']]
if args.previous:commands.append(['node','tests/upgrade-real.mjs',str(args.previous.resolve())])
for cmd in commands:
 t=time.monotonic();p=subprocess.run(cmd,cwd=R,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=180)
 logfile='docs/run-'+Path(cmd[1]).stem+'.log';(R/logfile).write_text(p.stdout,encoding='utf-8')
 row={'command':cmd,'passed':p.returncode==0,'returncode':p.returncode,'wallSeconds':round(time.monotonic()-t,3),'log':logfile};runs.append(row);print('PASS' if row['passed'] else 'FAIL',cmd[1],flush=True)
 if not row['passed']:break
report={'version':'0.8.0-candidate.1','passed':len(runs)==len(commands) and all(q['passed'] for q in runs) and hashes()==before,'sourceDigests':before,'runs':runs,'sourceUnchangedDuringSuites':hashes()==before,'realPreviousPayloadTested':bool(args.previous),'scope':'Actual Node runs bound to these current runtime files; wallSeconds are machine test times, not human playtime.'}
(R/'docs/QUALIFICATION_MODEL.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if not report['passed']:raise SystemExit(1)
