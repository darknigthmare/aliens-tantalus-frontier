"""Bind release sources and actual test receipts; never rewrites test evidence."""
from pathlib import Path
import json,hashlib,re,subprocess,ast,base64
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text());sha=lambda b:hashlib.sha256(b).hexdigest();checks=[]
def ck(name,ok):
 checks.append({'name':name,'ok':bool(ok)})
 if not ok:raise AssertionError(name)
for p in sorted(R.rglob('*.mjs')):ck('Syntaxe '+p.relative_to(R).as_posix(),subprocess.run(['node','--check',str(p)],capture_output=True).returncode==0)
for p in sorted(R.rglob('*.py')):ast.parse(p.read_text());ck('Syntaxe '+p.relative_to(R).as_posix(),True)
tap=(R/'report/node-tests-v114.txt').read_text();passed=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1))
ck('665 tests sans exclusion',passed==665 and all(re.search(r'^# '+k+r' 0$',tap,re.M) for k in ['fail','cancelled','skipped','todo']))
B=J('report/browser-results-v114.json');F=J('report/browser-fidelity-v114.json');S=J('report/distribution-smoke-v114.json');C=J('report/CONTRATS_LEVEL_DESIGN_V114.json');D=J('report/fidelity-drive-v114.json');V=J('baseline/SOURCES_PRESERVEES_V113.json')
html=(R/'JOUER_ALIENS_V114.html').read_bytes();h=sha(html)
ck('HTML exact testé par toutes les recettes',h==B['htmlSha256']==F['htmlSHA256']==S['htmlSha256'])
registry=json.JSONDecoder().raw_decode(html.decode().split('const registry=',1)[1])[0];ck('46 modules embarqués',len(registry)==46)
for rel,e in registry.items():
 raw=(R/rel).read_bytes();ck('Source exacte '+rel,e['source'].encode()==raw and e['sha256']==sha(raw));ck('Imports résolus '+rel,all(x in registry for x in e['deps'].values()))
seen=set();stack=set()
def walk(key):
 if key in stack:raise AssertionError('Cycle '+key)
 if key in seen:return
 stack.add(key)
 for dep in registry[key]['deps'].values():walk(dep)
 stack.remove(key);seen.add(key)
for k in registry:walk(k)
ck('Chargeur Blob sans cycle',len(seen)==46)
ck('CSS exact embarqué','<style>'+(R/'preview/style.css').read_text()+'</style>' in html.decode())
ck('377 contrôles navigateur',len(B['tests'])+len(F['tests'])==377 and all(x['ok'] for x in B['tests']+F['tests']))
ck('Aucune erreur JS/console',all(not d[k] for d in [B,F,S] for k in ['pageErrors','consoleErrors']))
for part,count in [('core',17),('tail',11),('contact-a',15),('contact-b',11),('touch',10),('logistics',39),('engineering',45),('lighting',39),('beacons',49),('tactics',55),('fidelity',86)]:
 d=J(f'report/browser-{part}-v114.json');ck('Recette finale '+part,len(d['tests'])==count and all(t['ok'] for t in d['tests']) and d['htmlSHA256']==h)
ck('25 contrôles de distribution séparés',len(S['checks'])==25 and all(t['ok'] for t in S['checks']))
ck('Distribution sans requête externe',not S['externalRequests'])
ck('Codex et rapport exacts testés',S['codexSha256']==sha((R/'CODEX_LEVEL_DESIGN_V114.html').read_bytes()) and S['reportSha256']==sha((R/'RAPPORT_ILLUSTRE_V114.html').read_bytes()))
complete=[]
for name in ['operation','logistics','breach','lighting','beacon','tactics']:
 d=J(f'report/{name}-drive-v114.json');variants=d.get('results',[d]);ck('Parcours conservé '+name,all(v['complete'] for v in variants));complete+=variants
new=next(x for x in D['results'] if x['name']=='operation-m240');complete.append(new)
ck('9 opérations complètes',len(complete)==9 and all(v['complete'] for v in complete))
ck('Nouvelle opération par entrées publiques',new['publicInputs']==5041 and new['arsenal']['remaining']['ripley']['fuel']==57 and new['arsenal']['spent']['ripley']['fuel']==23)
ck('Newt reste non armée',all(next(x for x in v.get('team',v.get('ammunition',[])) if x['id']=='newt')['ammo']==0 for v in complete))
clusters=[x for x in D['results'] if x['name'].endswith('-inspections')];ck('3 circuits d’inspection réciproques',len(clusters)==3 and sorted(x['transitions'] for x in clusters)==[2,6,6])
weapon=next(x for x in clusters if x['name']=='sulaco-inspections');ck('8 profils réellement déclenchés',len(weapon['shots'])==8 and all(x['after']==x['before']-1 for x in weapon['shots'] if x['id']!='knife'))
pursuit=J('report/pursuit-drive-v114.json');ck('Exercice de poursuite séparé conservé',pursuit['ok'])
corpus=J('report/save-corpus-v114.json')['checks'];current=[x for x in corpus if x['schema']==114];legacy=[x for x in corpus if x['schema']==113]
ck('110 exports courants valides',len(current)==110 and all(x['ok'] for x in current))
ck('84 anciennes migrations réussies, une incompatibilité déclarée',len(legacy)==85 and sum(x['ok'] for x in legacy)==84 and [x['file'] for x in legacy if not x['ok']]==['states-v113/03-relais.json'])
ck('Architecture et ressources validées',C['validation']['ok'] and not C['validation']['failures'])
expected={'inspectableRooms':25,'operationRooms':11,'reciprocalLinks':20,'directedFaces':40,'internalDoors':25,'fixedSolids':202,'props':135,'enemies':13,'sentries':1,'namedNPCs':12,'characterProfiles':16,'weaponProfiles':8,'equipmentReferences':24,'locationReferences':28,'mappedLocationReferences':20,'absentLocationReferences':8,'objectives':5}
for k,v in expected.items():ck('Catalogue '+k,C['counts'][k]==v)
selection=J('report/report-selection-v114.json');report=(R/'RAPPORT_ILLUSTRE_V114.html').read_text();images=[base64.b64decode(x) for x in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report)]
ck('12 PNG exacts embarqués',len(images)==12 and list(map(sha,images))==[sha((R/'report/captures-v114'/f).read_bytes()) for f in selection['files']])
allcaps=B['captures']+F['captures'];ck('76 captures présentes et uniques',len(allcaps)==len(set(x['file'] for x in allcaps))==76 and all((R/'report/captures-v114'/x['file']).is_file() for x in allcaps))
ck('Codex 80 règles et25 plans',selection['rules']==80 and selection['rooms']==25)
ck('30 sources V113 préservées',len(V)==30)
for rel,v in V.items():ck('Source historique intacte '+rel,sha((R/rel).read_bytes())==v)
ck('Aucune police distribuée',not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in R.rglob('*')))
ck('Aucun lien symbolique',not any(p.is_symlink() for p in R.rglob('*')))
ck('Lanceur et version actuels',J('package.json')['version']=='114.0.0-rc.1' and 'JOUER_ALIENS_V114.html' in (R/'JOUER_WINDOWS.bat').read_text())
out={'ok':True,'version':'114.0.0-rc.1','contract':C['contract'],'htmlSha256':h,'nativeActivated':False,'completeLocalOperationVariants':9,'inspectionRoundTrips':3,'separatePursuitExercises':1,'nodeTestsPassed':passed,'browserChecksPassed':377,'distributionChecksPassed':25,'currentSaveImports':110,'legacySuccessfulImports':84,'legacyRefusedImports':1,'captures':76,'checks':checks}
(R/'report/release-check-v114.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in out.items() if k!='checks'},ensure_ascii=False,indent=2));print('release gates',len(checks))
