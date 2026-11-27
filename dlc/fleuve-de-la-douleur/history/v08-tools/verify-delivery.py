#!/usr/bin/env python3
"""Check current artifacts and byte relationships; no remote publishing."""
from pathlib import Path
import json,hashlib,subprocess,re,base64,sys
R=Path(__file__).resolve().parents[1];sha=lambda b:hashlib.sha256(b).hexdigest();cases=[];version='0.8.0-candidate.1'
def check(name,condition):
 if not condition:raise AssertionError(name)
 cases.append({'name':name,'passed':True})
read=lambda p:json.loads((R/p).read_text());js=R/'src/river-of-pain'
source=(js/'index.html').read_text();modules=re.findall(r'<script src="([^"]+)"></script>',source)
source=source.replace('<link rel="stylesheet" href="style.css">','<style>'+(js/'style.css').read_text()+'</style>')
for name in modules:source=source.replace(f'<script src="{name}"></script>','<script>\n'+re.sub(r'</script',r'<\\/script',(js/name).read_text(),flags=re.I)+'\n</script>')
check('Standalone égale ses 23 modules et son CSS',len(modules)==23 and source.encode()==(R/'JOUER.html').read_bytes())
check('Aucun script ou stylesheet externe requis',not re.search(r'<script[^>]+src=|<link[^>]+stylesheet',source))
for p in sorted(js.glob('*.js')):
 q=subprocess.run(['node','--check',str(p)],capture_output=True,text=True);check('Syntaxe '+p.name,q.returncode==0)
D=read('docs/CONTENT_MANIFEST.json');c=D['manifest']['counts'];check('Version exacte',D['manifest']['version']==version)
for k,n in [('rooms',len(D['rooms'])),('props',sum(len(r['props']) for r in D['rooms'])),('links',sum(len(r['portals']) for r in D['rooms'])//2),('objectives',sum(len(ch['objectives']) for ch in D['chapters'])),('archives',len(D['archives'])),('optionalSteps',sum(len(j['steps']) for j in D['jobs'])),('maintenanceDucts',len(D['ducts']['routes'])),('ductMouths',len(D['ducts']['mouths'])),('driveableVehicles',1),('drivingRooms',len(D['mobility']['rooms'])),('vehicleServiceStations',len(D['mobility']['stations'])),('drivingSurfaces',len(D['mobility']['surfaces']))]:check('Comptage réel '+k,c[k]==n)
check('Campagne préservée',c['rooms']==42 and c['links']==57 and c['objectives']==49 and c['optionalSteps']==18)
check('Cinq gaines restent séparées du graphe joueur',c['maintenanceDucts']==5 and c['ductMouths']==10)
check('Héritage des volets et avertisseurs',len(D['defense']['shutters'])==8 and len(D['defense']['alarms'])==4)
rooms={r['id']:r for r in D['rooms']}
for pair in D['mobility']['links']:
 check('Route réutilise une connexion existante '+str(pair),all(any(p['to']==b for p in rooms[a]['portals']) for a,b in [pair,pair[::-1]]))
for station in D['mobility']['stations']:check('Borne dans une vraie pièce de conduite '+station['id'],station['room'] in D['mobility']['rooms'] and station['repairKits']==station['charges']==1)
check('Identité unique du véhicule',D['mobility']['rover']['id']=='prospector-01')
check('Pas de véhicule décoratif dupliqué dans les lieux concernés',all(p['kind'] not in ['tractor','rover','vehicle'] for r in D['rooms'] if r['id'] in ['road','plateau','garage'] for p in r['props']))
model_reports=['CORE_TEST_RESULTS','COLONY_TEST_RESULTS','EXPLORATION_TEST_RESULTS','PASSAGES_TEST_RESULTS','PERSISTENCE_TEST_RESULTS','LIFE_TEST_RESULTS','DEFENSE_TEST_RESULTS','DUCT_TEST_RESULTS','MOBILITY_TEST_RESULTS']
count=0
for n in model_reports:
 q=read('docs/'+n+'.json');rows=q.get('results',q.get('cases'));check('Suite courante achevée '+n,q['passed'] and isinstance(rows,list) and all(t['passed'] for t in rows));count+=len(rows)
check('Total modèle dérivé des neuf suites',count==read('docs/DOCUMENTATION_BUILD.json')['modelChecks'])
traversals=0
for n in ['TRAVERSAL_RESULTS','TRAVERSAL_EXPLORATION_RESULTS','TRAVERSAL_LIFE_RESULTS','TRAVERSAL_DEFENSE_RESULTS','TRAVERSAL_DUCT_RESULTS','TRAVERSAL_MOBILITY_RESULTS']:
 q=read('docs/'+n+'.json');rows=q if isinstance(q,list) else q['cases'];check('Pilotes achevés '+n,len(rows)==6 and all(t['passed'] for t in rows));traversals+=len(rows)
check('Total pilotes dérivé',traversals==read('docs/DOCUMENTATION_BUILD.json')['completeTraversals'])
for i in range(1,8):
 f=R/f'tests/fixtures/real-v0{i}-save.json';q=json.loads(f.read_text());check('Version authentique déclarée '+f.name,q['id']=='river-of-pain' and q['state']['version']==f'0.{i}.0-candidate.1')
 result=subprocess.run(['node','-e',"require('./src/river-of-pain/core.js').parseSave(require('fs').readFileSync(process.argv[1],'utf8'))",str(f)],cwd=R,capture_output=True,text=True);check('Ancien fichier passe le codec actuel '+f.name,result.returncode==0)
caprows=[]
for part in 'ABC':
 q=read(f'docs/BROWSER_V08{part}.json');check('Navigateur final '+part,q['passed'] and not q['errors'] and q['htmlSHA256']==sha((R/'JOUER.html').read_bytes()));caprows+=q['captures']
for cap in caprows:
 p=R/cap['file'];check('Capture PNG et provenance '+p.name,p.is_file() and p.read_bytes().startswith(b'\x89PNG\r\n\x1a\n') and bool(cap['setup']))
for p in sorted((R/'captures').glob('*.json')):
 result=subprocess.run(['node','-e',"const C=require('./src/river-of-pain/core.js');const s=C.parseSave(require('fs').readFileSync(process.argv[1],'utf8'));if(s.state.version!=='0.8.0-candidate.1')process.exit(2)",str(p)],cwd=R,capture_output=True,text=True);check('Vrai export courant relu '+p.name,result.returncode==0)
encoded=re.findall(r'<img src="data:image/png;base64,([^"]+)"',(R/'RAPPORT_ILLUSTRE.html').read_text());digests={sha((R/t['file']).read_bytes()) for t in caprows}
check('Douze figures exactes sans substitution',len(encoded)==12 and {sha(base64.b64decode(b)) for b in encoded}==digests)
q=read('docs/REPORT_VISUAL_RESULTS.json');check('Rapport visuel qualifié sur ses bytes',q['passed'] and q['reportSHA256']==sha((R/'RAPPORT_ILLUSTRE.html').read_bytes()))
binding=read('docs/QUALIFICATION_MODEL.json');actual={p.relative_to(R).as_posix():sha(p.read_bytes()) for p in sorted(js.iterdir()) if p.is_file()}
check('Empreintes du code qualifié identiques',binding['passed'] and binding['sourceDigests']==actual)
check('Qualification comprend la mobilité et le vrai payload',binding['realPreviousPayloadTested'] and any('tests/mobility.cjs' in t['command'] for t in binding['runs']))
for n in ['INSTALLER_TEST_RESULTS','REAL_UPGRADE_TEST_RESULTS']:check('Installation réellement vérifiée '+n,read('docs/'+n+'.json')['passed'])
check('Notice README actuelle et retrait valide','0.8.0' in (R/'README.md').read_text().split('\n')[0] and '--remove' in (R/'README.md').read_text() and '--uninstall' not in (R/'README.md').read_text())
check('Installateur numéro courant',"const VERSION = '0.8.0-candidate.1'" in (R/'tools/install.mjs').read_text() or "'0.8.0-candidate.1'" in (R/'tools/install.mjs').read_text())
for name in ['README.md','docs/CODEX_LEVEL_DESIGN.md','docs/QA_REPORT.md','docs/SOURCE_V08.json','docs/DOCTRINE_V08.md','docs/SOURCES_ET_CONTINUITE.md','LICENSE_NOTICE.md']:check('Document réel non vide '+name,(R/name).stat().st_size>100)
files=['src/river-of-pain/data.js','docs/CONTENT_MANIFEST.json','JOUER.html'];before={p:sha((R/p).read_bytes()) for p in files}
subprocess.run([sys.executable,'tools/build-content.py'],cwd=R,check=True,capture_output=True);subprocess.run([sys.executable,'tools/build-standalone.py'],cwd=R,check=True,capture_output=True)
check('Reconstruction reproductible données et HTML',before=={p:sha((R/p).read_bytes()) for p in files})
result={'version':version,'passed':True,'cases':cases,'standaloneSHA256':before['JOUER.html'],'sourceDigests':actual,'scope':'Current source syntax, data, true test results and deterministic artifacts. Distinct from gameplay and report checks.'}
(R/'docs/DELIVERY_VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(len(cases),'delivery checks PASS')
