from pathlib import Path
import json,hashlib,zipfile,tempfile,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent;archive=OUT/'ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip'
H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
result={'version':'11.0.0','archive':archive.name,'archiveSha256':H(archive),'archiveBytes':archive.stat().st_size,'checks':[],'commands':[],'success':False}
def check(name,ok,detail=''):
 result['checks'].append({'name':name,'pass':bool(ok),'detail':str(detail)});print(('PASS ' if ok else 'FAIL ')+name)
 if not ok:raise AssertionError(name+' '+str(detail))
def run(cmd,cwd,timeout=180):
 p=subprocess.run(cmd,cwd=cwd,text=True,capture_output=True,timeout=timeout)
 result['commands'].append({'cmd':' '.join(cmd),'returncode':p.returncode,'stdoutTail':p.stdout[-3000:],'stderrTail':p.stderr[-3000:]})
 if p.returncode: raise RuntimeError('command failed: '+' '.join(cmd)+'\n'+p.stdout[-1000:]+'\n'+p.stderr[-1000:])
 return p
with zipfile.ZipFile(archive) as z:
 check('ZIP CRC valid',z.testzip() is None)
 roots={n.split('/')[0] for n in z.namelist() if n}
 check('Single V11 root',roots=={'ALIEN_EARTH_DLC_V11'},roots)
with tempfile.TemporaryDirectory(prefix='alien-earth-v11-verify-') as td:
 td=Path(td)
 with zipfile.ZipFile(archive) as z:z.extractall(td)
 game=td/'ALIEN_EARTH_DLC_V11';manifest=json.loads((game/'MANIFEST_SHA256.json').read_text())
 check('Manifest version',manifest['version']=='11.0.0')
 bad=[]
 for rel,m in manifest['files'].items():
  p=game/rel
  if not p.is_file() or p.stat().st_size!=m['bytes'] or H(p)!=m['sha256']:bad.append(rel)
 check('All manifest entries exact',not bad,bad[:10])
 before=H(game/'JOUER_ALIEN_EARTH_V11.html');check('Bundle matches manifest',before==manifest['bundleSha256'])
 run(['npm','test'],game,180);check('Extracted Node suite passes',True)
 run(['npm','run','test:campaign:survie'],game,180);check('Extracted Survie fidelity campaign passes',True)
 run(['npm','run','data'],game,60);run(['npm','run','build'],game,60)
 check('Regenerated data/build matches exact tested bundle',H(game/'JOUER_ALIEN_EARTH_V11.html')==before==manifest['bundleSha256'])
 run(['npm','run','test:report'],game,120);check('Extracted report/audit render checks pass',True)
 result['success']=True
validation=OUT/'ALIEN_EARTH_V11_VALIDATION_ARCHIVE.json';validation.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
if not result['success']:raise SystemExit(1)
print(json.dumps({'success':True,'checks':len(result['checks']),'archiveSha256':result['archiveSha256']},indent=2))
