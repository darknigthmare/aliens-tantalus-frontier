"""Check a real delivered 0.7 archive -> 0.8 launcher upgrade, on a temporary host.
Usage: python3 tools/verify_upgrade_v07.py PATH_TO_V07_ZIP
Never touches an actual Tantalus checkout. Requires Node >=20.
"""
from pathlib import Path, PurePosixPath
import tempfile, zipfile, hashlib, json, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
def digest(data): return hashlib.sha256(data).hexdigest()
def main():
    if len(sys.argv)!=2: raise SystemExit(__doc__)
    archive=Path(sys.argv[1]).resolve()
    if not archive.is_file(): raise SystemExit('Archive 0.7 introuvable.')
    checks=[]
    def check(name, ok):
        checks.append({'name':name,'ok':bool(ok)})
        if not ok: raise AssertionError(name)
    with tempfile.TemporaryDirectory(prefix='isolation-upgrade-') as tmp:
        temp=Path(tmp);old=temp/'old';host=temp/'host';host.mkdir()
        # Only the exact necessary files are extracted, without trusting ZIP paths.
        required=['tools/install.mjs','JOUER_ISOLATION.html','integration/dlc-manifest.json']
        with zipfile.ZipFile(archive) as z:
            for rel in required:
                candidates=[n for n in z.namelist() if n.endswith('/'+rel)]
                if len(candidates)!=1: raise ValueError('Entrée ambiguë : '+rel)
                target=old/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(candidates[0]))
        old_manifest=json.loads((old/'integration/dlc-manifest.json').read_text())
        check('Archive source réellement en 0.7.0',old_manifest['version']=='0.7.0')
        (host/'package.json').write_text(json.dumps({'name':'aliens-tantalus-frontier','version':'fixture-not-production'}))
        (host/'src').mkdir();(host/'src/DO_NOT_CHANGE.txt').write_text('Moteur hôte témoin, hors périmètre de l’installation.\n')
        originals={str(p.relative_to(host)):p.read_bytes() for p in host.rglob('*') if p.is_file()}
        def run(tool, action):
            r=subprocess.run(['node',str(tool),action,str(host)],capture_output=True,text=True,check=True,timeout=20)
            return json.loads(r.stdout)
        r1=run(old/'tools/install.mjs','install');dest=host/'public/dlc/alien-isolation'
        check('Installation du véritable HTML 0.7', (dest/'index.html').read_bytes()==(old/'JOUER_ISOLATION.html').read_bytes())
        r2=run(ROOT/'tools/install.mjs','upgrade')
        check('Version et transition 0.7 vers 0.8',r2['from']=='0.7.0' and r2['version']=='0.8.0')
        check('HTML 0.8 installé sans transformation',(dest/'index.html').read_bytes()==(ROOT/'JOUER_ISOLATION.html').read_bytes())
        backup=host/'public/dlc/alien-isolation.previous'
        check('Ancien HTML 0.7 conservé octet par octet',(backup/'index.html').read_bytes()==(old/'JOUER_ISOLATION.html').read_bytes())
        r3=run(ROOT/'tools/install.mjs','rollback')
        check('Retour arrière restaure la 0.7 exacte',r3['version']=='0.7.0' and (dest/'index.html').read_bytes()==(old/'JOUER_ISOLATION.html').read_bytes())
        run(ROOT/'tools/install.mjs','uninstall')
        check('Désinstallation du lanceur seul',not dest.exists())
        check('Fichiers hôtes inchangés',all((host/k).read_bytes()==v for k,v in originals.items()))
        result={'version':'0.8.0','sourceArchive':archive.name,'sourceSha256':digest(archive.read_bytes()),'newHtmlSha256':digest((ROOT/'JOUER_ISOLATION.html').read_bytes()),'checks':checks,'pass':sum(c['ok'] for c in checks),'fail':sum(not c['ok'] for c in checks),'scope':'Original 0.7 launcher bytes on a temporary host fixture, not a production Tantalus merge.'}
    (ROOT/'qa/upgrade-real-v07.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
