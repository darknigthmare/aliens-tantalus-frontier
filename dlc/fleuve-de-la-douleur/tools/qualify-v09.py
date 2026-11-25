import subprocess,json,pathlib,time,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
(root/'qa-v09').mkdir(exist_ok=True)
results=[]
suites=['core.cjs','colony.cjs','exploration.cjs','passages.cjs','persistence.cjs','life.cjs','defense.cjs','ducts.cjs','mobility.cjs','fidelity.cjs','traversal.cjs','traversal-exploration.cjs','traversal-life.cjs','traversal-defense.cjs','traversal-ducts.cjs','traversal-mobility.cjs','traversal-fidelity.cjs','installer.mjs']
hashes={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (root/'src').rglob('*') if p.is_file()}
for name in suites:
 a=time.monotonic();p=subprocess.run(['node','tests/'+name],cwd=root,text=True,capture_output=True)
 (root/'qa-v09'/('final-'+name+'.log')).write_text(p.stdout+'\n'+p.stderr)
 results.append(dict(suite=name,returncode=p.returncode,seconds=round(time.monotonic()-a,3),tail=(p.stdout+'\n'+p.stderr)[-1800:]))
 (root/'qa-v09/QUALIFICATION_MODEL.json').write_text(json.dumps(dict(complete=False,hashes=hashes,results=results),indent=2))
(root/'qa-v09/QUALIFICATION_MODEL.json').write_text(json.dumps(dict(complete=True,passed=all(r['returncode']==0 for r in results),hashes=hashes,results=results),indent=2))

(root/'docs/QUALIFICATION_MODEL.json').write_text((root/'qa-v09/QUALIFICATION_MODEL.json').read_text())
