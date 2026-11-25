"""Read-only gates across sources, exact delivered document and executed proofs.
The JSON receipt is explicitly written; the integrity manifest is never rewritten."""
from pathlib import Path
import json,hashlib,re,subprocess,ast,base64
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text()); sha=lambda b:hashlib.sha256(b).hexdigest();checks=[]
def ck(name,ok):
 checks.append({'name':name,'ok':bool(ok)})
 if not ok:raise AssertionError(name)
for p in sorted(R.rglob('*.mjs')):ck('Syntaxe '+p.relative_to(R).as_posix(),subprocess.run(['node','--check',str(p)],capture_output=True).returncode==0)
for p in sorted(R.rglob('*.py')):ast.parse(p.read_text());ck('Syntaxe '+p.relative_to(R).as_posix(),True)
tap=(R/'report/node-tests-v111.txt').read_text();passed=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1));ck('408 tests sans exclusion',passed==408 and all(re.search(r'^# '+k+r' 0$',tap,re.M) for k in ['fail','cancelled','skipped','todo']))
B=J('report/browser-results-v111.json');S=J('report/distribution-smoke-v111.json');D=J('report/operation-drive-v111.json');L=J('report/logistics-drive-v111.json');H=J('report/breach-drive-v111.json');P=J('report/pursuit-drive-v111.json');N=J('report/lighting-drive-v111.json');C=J('report/CONTRATS_LEVEL_DESIGN_V111.json');V=J('baseline/SOURCES_PRESERVEES_V110.json')
html=(R/'JOUER_ALIENS_V111.html').read_bytes();h=sha(html);ck('Document testé égal au livré',h==B['htmlSha256']==S['htmlSha256']);ck('Version actuelle du reçu',B['version']==S['version']=='111.0.0-rc.1')
registry=json.JSONDecoder().raw_decode(html.decode().split('const registry=',1)[1])[0];ck('24 modules réels embarqués',len(registry)==24)
for rel,e in registry.items():
 raw=(R/rel).read_bytes();ck('Module exact '+rel,e['source'].encode()==raw and e['sha256']==sha(raw));ck('Imports résolus '+rel,all(p in registry for p in e['deps'].values()))
style=(R/'preview/style.css').read_text();ck('Feuille style exacte dans HTML',('<style>'+style+'</style>') in html.decode())
ck('187 contrôles gameplay navigateur',len(B['tests'])==187 and all(x['ok'] for x in B['tests']));ck('Aucune erreur JS/console observée',not B['pageErrors'] and not B['consoleErrors'])
for part,count in [('core',17),('tail',11),('contact-a',15),('contact-b',11),('touch',10),('logistics',39),('engineering',45),('lighting',39)]:
 d=J(f'report/browser-{part}-v111.json');ck('Recette exacte '+part,len(d['tests'])==count and all(t['ok'] for t in d['tests']) and d['htmlSHA256']==h)
ck('27 contrôles de distribution séparés',len(S['checks'])==27 and all(x['ok'] for x in S['checks']));ck('Pas de réseau requis en distribution',not S['externalRequests'] and not S['pageErrors'] and not S['consoleErrors'])
ck('Deux routes historiques terminées',len(D['results'])==2 and all(v['complete'] for v in D['results']));ck('Deux routes logistiques terminées',len(L['results'])==2 and all(v['complete'] for v in L['results']))
for v in L['results']:ck('Stocks logistiques '+v['variant'],v['logistics']['spent']=={'ammo':1,'medical':1,'sentry':1} and v['logistics']['stock']=={'ammo':2,'medical':1,'sentry':0})
ck('Opération brèche terminée sans perte de mécaniques',H['complete'] and H['engineering']['metrics']['enemyHits']==4 and H['engineering']['metrics']['breaches']==1 and H['engineering']['plates']==1)
ck('Parcours nocturne terminé depuis insertion',N['complete'] and N['inputs']>3000 and N['lighting']['metrics']['completed']==3 and N['lighting']['metrics']['torchSwitches']==2)
ck('Six passages ennemis dans parcours noir',N['enemyTransfers']==6)
ck('Hudson blessé, Newt non armée',next(a for a in N['team'] if a['id']=='hudson')['hp']==86 and next(a for a in N['team'] if a['id']=='newt')['ammo']==0)
ck('Retour Operations rétabli, sentinelle laissée dans le noir',N['darkRooms']==['v106-sentry'])
a=J('report/lighting-states-v111/09-ligne-sans-lampes.json');z=J('report/lighting-states-v111/10-defense-tenue-noir.json')
# Ammo comparison from actual world registry.
aa=[t for t in a['worlds']['v106-sentry']['actors'] if t.get('kind')=='sentry'];zz=[t for t in z['worlds']['v106-sentry']['actors'] if t.get('kind')=='sentry']
if not aa:aa=[t for t in a['worlds']['v106-sentry']['actors'] if 'sentry' in t.get('id','')];zz=[t for t in z['worlds']['v106-sentry']['actors'] if 'sentry' in t.get('id','')]
ck('120 vers116 cartouches dans défense sombre',len(aa)==len(zz)==1 and aa[0]['ammo']==120 and zz[0]['ammo']==116 and not a['worlds']['v106-sentry']['circuits']['service'] and not z['worlds']['v106-sentry']['circuits']['service'])
ck('Poursuite conservée séparément',P['ok'] and P['enemyTransfers']==2)
ck('Catalogue validé',C['validation']['ok'] and not C['validation']['failures'])
expected={'lightingProfiles':8,'serviceLightingControls':8,'existingServiceLamps':13,'inspectableRooms':8,'connectedOperationRooms':7,'newRooms':0,'localObjectives':5,'enemies':11}
for k,v in expected.items():ck('Catalogue '+k,C['counts'][k]==v)
selection=J('report/report-selection-v111.json');report=(R/'RAPPORT_ILLUSTRE_V111.html').read_text();images=[base64.b64decode(x) for x in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report)]
ck('10 PNG exacts dans rapport',len(images)==10 and list(map(sha,images))==[sha((R/'report/captures-v111'/f).read_bytes()) for f in selection['files']])
ck('43 captures présentes et uniques',len(B['captures'])==len(set(c['file'] for c in B['captures']))==43 and all((R/'report/captures-v111'/c['file']).is_file() for c in B['captures']))
for c in B['captures']:ck('Provenance '+c['file'],bool(c['origin']) and c.get('imageEdited') is False and c.get('nativeTantalus') is False)
ck('Codex 8 lieux /36 règles',(R/'CODEX_LEVEL_DESIGN_V111.html').read_text().count('<article class="room')==8 and selection['rules']==36)
for rel,hash_ in V.items():ck('Hérité exact '+rel,sha((R/rel).read_bytes())==hash_)
ck('23 sources/tests V110 conservés',len(V)==23)
ck('Pas de police distribuée',not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in R.rglob('*')))
ck('Pas de lien symbolique',not any(p.is_symlink() for p in R.rglob('*')))
ck('Version et raccourci',J('package.json')['version']=='111.0.0-rc.1' and 'JOUER_ALIENS_V111.html' in (R/'JOUER_WINDOWS.bat').read_text())
out={'ok':all(x['ok'] for x in checks),'version':'111.0.0-rc.1','htmlSha256':h,'sourceArchiveSha256':'ef3c6ce0db9d561314f2b40ea45581c44ec503a24d3dd28bf6b0bd70614acdce','contract':C['contract'],'nativeActivated':False,'nativeCampaignRuns':0,'nodeTestsPassed':passed,'gameBrowserChecksPassed':len(B['tests']),'separateDistributionChecksPassed':len(S['checks']),'automatedFullOperations':6,'pursuitEnemyTransfers':P['enemyTransfers'],'lightingOperationEnemyTransfers':N['enemyTransfers'],'directBrowserCaptures':len(B['captures']),'embeddedReportCaptures':len(images),'directFileNavigation':S['transport']['directFileNavigation'],'checks':checks}
(R/'report/RELEASE_CHECK_V111.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='checks'},ensure_ascii=False,indent=2))
