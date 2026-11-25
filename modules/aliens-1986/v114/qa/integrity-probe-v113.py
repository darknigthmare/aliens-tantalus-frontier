"""Test the read-only verifier on a disposable copy, never falsify references."""
from pathlib import Path
import tempfile,shutil,subprocess,json,hashlib
R=Path(__file__).resolve().parent.parent
checks=[]
def ck(name,ok):
 checks.append({'name':name,'ok':bool(ok)});print(name,bool(ok),flush=True);assert ok,name
with tempfile.TemporaryDirectory(prefix='aliens-v113-integrity-') as td:
 D=Path(td)/'copy';shutil.copytree(R,D,ignore=shutil.ignore_patterns('__pycache__'))
 run=lambda:subprocess.run(['python',str(D/'tools/verify-package.py')],capture_output=True,text=True)
 h=lambda:hashlib.sha256((D/'PACKAGE_MANIFEST.json').read_bytes()).hexdigest()
 before=h();ck('Paquet intact accepté',run().returncode==0);ck('Manifeste non réécrit',h()==before)
 target=D/'src/tactics-v113.mjs';raw=target.read_bytes();target.write_bytes(raw+b'\n// unexpected change\n');ck('Composant modifié refusé',run().returncode!=0);target.write_bytes(raw)
 extra=D/'unexpected.txt';extra.write_text('unlisted');ck('Fichier non listé refusé',run().returncode!=0);extra.unlink()
 target.unlink();ck('Composant requis absent refusé',run().returncode!=0);target.write_bytes(raw)
 ck('Restauration des octets acceptée',run().returncode==0 and h()==before)
(R/'report/integrity-probe-v113.json').write_text(json.dumps({'version':'113.0.0-rc.1','scope':'independent package integrity, not gameplay','checks':checks},ensure_ascii=False,indent=2)+'\n')
