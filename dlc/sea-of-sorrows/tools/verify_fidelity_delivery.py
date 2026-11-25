#!/usr/bin/env python3
"""Audit this exact directory, including a final extracted copy. Does not modify it."""
from pathlib import Path
import hashlib,json,re,sys
R=Path(__file__).resolve().parents[1];checks=[]
def check(n,b):checks.append({'name':n,'pass':bool(b)})
def j(p):return json.loads((R/p).read_text())
def sha(p):return hashlib.sha256((R/p).read_bytes()).hexdigest()
try:
 d=j('data/campaign.json');manifest=j('MANIFEST_SHA256.json');v=d['meta']['version'];check('Version 0.10.0',v=='0.10.0');check('Package version',j('package.json')['version']==v);check('Installer descriptor',j('integration/host-descriptor.json')['version']==v)
 actual={p.relative_to(R).as_posix()for p in R.rglob('*')if p.is_file()and p.name!='MANIFEST_SHA256.json'and '__pycache__'not in p.parts}
 listed={a['path']for a in manifest['files']};check('Manifest version',manifest['version']==v);check('Manifest exhaustif',actual==listed);check('Manifest unique',len(listed)==len(manifest['files']));check('Manifest toutes tailles',all((R/a['path']).stat().st_size==a['bytes']for a in manifest['files']));check('Manifest toutes empreintes',all(sha(a['path'])==a['sha256']for a in manifest['files']))
 check('Aucune police redistribuée',not any(Path(p).suffix.lower()in['.ttf','.otf','.woff','.woff2']for p in actual));check('Aucun lien symbolique',not any(p.is_symlink()for p in R.rglob('*')))
 check('50 salles',len(d['rooms'])==50);check('59 liaisons',len(d['edges'])==59);check('54 réciproques',sum(e['bidirectional']for e in d['edges'])==54);check('5 transferts à sens unique',sum(not e['bidirectional']for e in d['edges'])==5);check('113 seuils',sum(len(r['doors'])for r in d['rooms'])==113);check('Tous les seuils classés',all(p.get('portal')for r in d['rooms']for p in r['doors']));check('98 coordonnées déplacées',len(j('reports/v0100/door-diff-final.json'))==98);check('126 dossiers',len(d['codex'])==126);check('18 chapitres',len(d['chapters'])==18);check('33 objectifs',sum(len(c['objectives'])for c in d['chapters'])==33);check('Registre synchronisé',j('data/fidelity.json')==d['fidelity']);check('Texte intégral non comparé explicite',d['fidelity']['fullTextCompared']is False);check('Aucun pourcentage fictif',d['fidelity']['canonicalCoveragePercent']is None)
 H=(R/'MER_DES_CHAGRINS_JOUABLE.html').read_text();check('HTML sans scripts distants','<script src='not in H);check('HTML sans CSS distant','<link rel="stylesheet"'not in H)
 for n in ['data','core','render','world-art','tactics-art','controls','support','soundscape','main']:
  t=(R/f'src/{n}.js').read_text().replace('</script','<\\/script');check('Module embarqué exact '+n,'<script>\n'+t+'\n</script>'in H)
 for p in ['reports/v0100/browser.json','reports/v0100/regression/browser.json']:
  a=j(p);check(p+' même HTML',a['html_sha256']==sha('MER_DES_CHAGRINS_JOUABLE.html'));check(p+' aucun échec',a['failed']==0)
 b=j('reports/v0100/browser.json');a=j('reports/v0100/regression/browser.json');check('201 contrôles navigateur',a['passed']+b['passed']==201);check('Native refusé déclaré',all('ERR_BLOCKED_BY_ADMINISTRATOR'in s for s in b['native_attempts'].values()))
 for c in b['captures']:check('Capture PNG exacte '+c['file'],sha('reports/v0100/captures/'+c['file'])==c['sha256'])
 c=j('reports/v0100/campaign.json');check('Six parcours gagnés',len(c['outcomes'])==6 and all(o['passed']and o['objectives']==33 and len(o['rooms'])==50 for o in c['outcomes']));check('198 exports d’objectifs',len(list((R/'qa/fidelity-fixtures').glob('HYBRID-*-??.json')))+len(list((R/'qa/fidelity-fixtures').glob('CLASSIC-*-??.json')))==198)
 for p,h in c['source_sha256'].items():check('Source de parcours '+p,sha(p)==h)
 docs=j('reports/v0100/documents/checks.json');check('28 contrôles documentaires',docs['passed']==28 and docs['failed']==0)
 for p,h in docs['source_sha256'].items():check('Document contrôlé exact '+p,sha(p)==h)
 n=(R/'reports/v0100/node-final.txt').read_text();check('461 tests Node courants','# pass 461'in n and '# fail 0'in n);check('Schéma 8',d['meta']['schemaVersion']==8);check('Hôte non raccordé',j('integration/host-descriptor.json')['nativeHostAdapterImplemented']is False)
except Exception as e:check('Exception: '+str(e),False)
out=dict(version='0.10.0',root=str(R),passed=sum(x['pass']for x in checks),failed=sum(not x['pass']for x in checks),checks=checks);print(json.dumps(out,ensure_ascii=False,indent=2));sys.exit(bool(out['failed']))
