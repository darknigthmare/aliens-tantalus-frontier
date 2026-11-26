"""Six destructive verification trials on a disposable independent copy."""
from pathlib import Path
import tempfile,shutil,hashlib,subprocess,json
R=Path(__file__).resolve().parent.parent;checks=[]
def ck(name,condition):
 checks.append({'name':name,'ok':bool(condition)})
 if not condition:raise AssertionError(name)
with tempfile.TemporaryDirectory(prefix='aliens-v114-probe-') as t:
 dest=Path(t)/'package';shutil.copytree(R,dest,ignore=shutil.ignore_patterns('__pycache__'))
 manifest=(dest/'PACKAGE_MANIFEST.json').read_bytes()
 def verify():return subprocess.run(['python',str(dest/'tools/verify-package.py')],capture_output=True).returncode
 ck('Paquet intact accepté',verify()==0)
 ck('Manifeste strictement inchangé',manifest==(dest/'PACKAGE_MANIFEST.json').read_bytes())
 p=dest/'src/arsenal-v114.mjs';original=p.read_bytes();p.write_bytes(original+b'\n// tampered proof\n');ck('Composant modifié refusé',verify()!=0);p.write_bytes(original)
 unknown=dest/'UNLISTED.txt';unknown.write_text('probe');ck('Fichier non listé refusé',verify()!=0);unknown.unlink()
 p.unlink();ck('Composant requis absent refusé',verify()!=0);p.write_bytes(original)
 ck('Restauration des octets acceptée',verify()==0)
out={'version':'114.0.0-rc.1','ok':all(x['ok'] for x in checks),'scope':'Independent copy; six integrity probes, not gameplay tests','checks':checks}
(R/'report/integrity-probe-v114.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
