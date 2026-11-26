"""Release gates bind actual sources, distributed HTML and executed evidence.
Writes a receipt only; never alters an integrity manifest or test result.
"""
from pathlib import Path
import json,hashlib,re,subprocess,ast,base64
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text());sha=lambda b:hashlib.sha256(b).hexdigest();checks=[]
def ck(name,ok):
 checks.append({'name':name,'ok':bool(ok)})
 if not ok:raise AssertionError(name)
for p in sorted(R.rglob('*.mjs')):ck('Syntaxe '+p.relative_to(R).as_posix(),subprocess.run(['node','--check',str(p)],capture_output=True).returncode==0)
for p in sorted(R.rglob('*.py')):ast.parse(p.read_text());ck('Syntaxe '+p.relative_to(R).as_posix(),True)
tap=(R/'report/node-tests-v113.txt').read_text();passed=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1))
ck('579 tests sans exclusion',passed==579 and all(re.search(r'^# '+k+r' 0$',tap,re.M) for k in ['fail','cancelled','skipped','todo']))
B=J('report/browser-results-v113.json');S=J('report/distribution-smoke-v113.json');D=J('report/operation-drive-v113.json');L=J('report/logistics-drive-v113.json');H=J('report/breach-drive-v113.json');P=J('report/pursuit-drive-v113.json');N=J('report/lighting-drive-v113.json');K=J('report/beacon-drive-v113.json');C=J('report/CONTRATS_LEVEL_DESIGN_V113.json');V=J('baseline/SOURCES_PRESERVEES_V112.json');T=J('report/tactics-drive-v113.json')
html=(R/'JOUER_ALIENS_V113.html').read_bytes();h=sha(html);ck('HTML livré testé exactement',h==B['htmlSha256']==S['htmlSha256']);ck('Version actuelle des reçus',B['version']==S['version']=='113.0.0-rc.1')
registry=json.JSONDecoder().raw_decode(html.decode().split('const registry=',1)[1])[0];ck('34 modules réels embarqués',len(registry)==34)
for rel,e in registry.items():
 raw=(R/rel).read_bytes();ck('Module exact '+rel,e['source'].encode()==raw and e['sha256']==sha(raw));ck('Imports résolus '+rel,all(p in registry for p in e['deps'].values()))
# Explicit dependency DFS; recursive Blob loading must be acyclic.
visited=set();pending=set()
def walk(key):
 if key in pending:raise AssertionError('Cycle de modules '+key)
 if key in visited:return
 pending.add(key)
 for v in registry[key]['deps'].values():walk(v)
 pending.remove(key);visited.add(key)
for key in registry:walk(key)
ck('Graphe Blob acyclique',len(visited)==len(registry))
style=(R/'preview/style.css').read_text();ck('CSS embarqué égal au fichier',('<style>'+style+'</style>') in html.decode())
ck('291 contrôles navigateur réussis',len(B['tests'])==291 and all(t['ok'] for t in B['tests']));ck('Aucune erreur JS/console',not B['pageErrors'] and not B['consoleErrors'])
for part,count in [('core',17),('tail',11),('contact-a',15),('contact-b',11),('touch',10),('logistics',39),('engineering',45),('lighting',39),('beacons',49),('tactics',55)]:
 d=J(f'report/browser-{part}-v113.json');ck('Recette finale '+part,len(d['tests'])==count and all(t['ok'] for t in d['tests']) and d['htmlSHA256']==h)
ck('34 contrôles de distribution séparés',len(S['checks'])==34 and all(t['ok'] for t in S['checks']));ck('Distribution sans réseau ni erreurs',not S['externalRequests'] and not S['pageErrors'] and not S['consoleErrors']);ck('Documents de recette identiques aux livrés',S['codexSha256']==sha((R/'CODEX_LEVEL_DESIGN_V113.html').read_bytes()) and S['reportSha256']==sha((R/'RAPPORT_ILLUSTRE_V113.html').read_bytes()))
ck('Deux anciennes routes terminées',len(D['results'])==2 and all(v['complete'] for v in D['results']))
ck('Deux variantes logistiques terminées',len(L['results'])==2 and all(v['complete'] for v in L['results']))
for v in L['results']:ck('Logistique finie '+v['variant'],v['logistics']['stock']=={'ammo':2,'medical':1,'sentry':0} and v['logistics']['spent']=={'ammo':1,'medical':1,'sentry':1})
ck('Génie historique terminé',H['complete'] and H['engineering']['metrics']['enemyHits']==4 and H['engineering']['metrics']['breaches']==1 and H['engineering']['plates']==1)
ck('Noir historique terminé',N['complete'] and N['lighting']['metrics']['completed']==3 and N['lighting']['metrics']['torchSwitches']==2 and N['enemyTransfers']==6)
ck('Poursuite distincte conservée',P['ok'] and P['enemyTransfers']==2)
ck('Opération tactique complète',T['complete'] and T['inputs']>3000 and len(T['saves'])==11)
ck('Six postes, six arrivées et quatre secteurs',T['orders']['metrics']['postOrders']==6 and T['orders']['metrics']['arrivals']==6 and T['orders']['metrics']['sectorOrders']==4)
ck('Affût tourné une fois sans crédit gratuit',T['orders']['metrics']['turnsStarted']==1 and T['orders']['metrics']['turnsCompleted']==1 and T['orders']['metrics']['turnsInterrupted']==0 and T['sentryAmmo']==111)
ck('Newt non armée au repli tactique',next(a for a in T['team'] if a['id']=='newt')['ammo']==0)
ck('Aucun tir manuel dans la défense dirigée',J('report/tactics-states-v113/08-axes-libres.json')['team'][0]['ammo']==J('report/tactics-states-v113/09-defense-dirigee.json')['team'][0]['ammo'])
ck('Reprises tactiques réellement à mi-chemin/rotation',not J('report/tactics-states-v113/02-deplacement-ordonne.json')['tactics']['posts']['hicks']['arrived'] and J('report/tactics-states-v113/06-affut-en-rotation.json')['action']['kind']=='sentry-orient')

ck('Dérivation balisée complète',K['complete'] and K['inputs']>3000 and K['beacons']['routeVisited'] and K['beacons']['collected'])
ck('Trois balises dépensées et une restante',K['beacons']['charges']==1 and K['beacons']['spent']==3 and K['beacons']['metrics']=={'started':4,'completed':4,'interrupted':0,'stocks':1,'throws':3})
ck('Newt non armée au repli balisé',next(a for a in K['team'] if a['id']=='newt')['ammo']==0)
ck('Deux nouvelles salles et défense restent hors tension',K['darkRooms']==['v106-sentry','v112-workshop','v112-conduit'])
a=J('report/beacon-states-v113/11-sentinelle-balise.json');z=J('report/beacon-states-v113/12-defense-balisee.json')
sentry=lambda d:next(a for a in d['worlds']['v106-sentry']['actors'] if a['id']=='sentry-a')['ammo']
ck('Munitions réelles après dégagement de l’axe sous source',sentry(a)>sentry(z) and sentry(a)<=120 and not z['worlds']['v106-sentry']['circuits']['service'] and not z['lighting']['torch']['on'] and z['flags']['defense'])
ck('Sources antérieures expirées',z['beacons']['markers'][0]['expiresAt']<z['elapsed'] and z['beacons']['markers'][1]['expiresAt']<z['elapsed'] and z['beacons']['markers'][2]['expiresAt']>z['elapsed'])
ck('Deux reprises au milieu de gestes',J('report/beacon-states-v113/04-scelles-en-cours.json')['action']['kind']=='beacon-stock' and J('report/beacon-states-v113/06-amorcage.json')['action']['kind']=='beacon-throw')
corpus=J('report/save-corpus-v113.json');ck('159 exports et migrations de parcours validés',len(corpus['checks'])==159 and all(x['ok'] for x in corpus['checks']))
ck('Catalogue spatial validé',C['validation']['ok'] and not C['validation']['failures'])
expected={'lightingProfiles':10,'serviceLightingControls':10,'existingServiceLamps':17,'inspectableRooms':10,'connectedOperationRooms':9,'newRooms':0,'newLinks':0,'localObjectives':5,'enemies':13,'solids':60,'doorVolumes':11,'decorativeProps':54,'reciprocalLinks':11,'finiteBeaconCharges':4}
for k,v in expected.items():ck('Catalogue '+k,C['counts'][k]==v)
selection=J('report/report-selection-v113.json');report=(R/'RAPPORT_ILLUSTRE_V113.html').read_text();images=[base64.b64decode(x) for x in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report)]
ck('10 PNG exacts embarqués',len(images)==10 and list(map(sha,images))==[sha((R/'report/captures-v113'/f).read_bytes()) for f in selection['files']])
ck('63 captures uniques présentes',len(B['captures'])==len(set(c['file'] for c in B['captures']))==63 and all((R/'report/captures-v113'/c['file']).is_file() for c in B['captures']))
for c in B['captures']:ck('Provenance '+c['file'],bool(c['origin']) and c.get('imageEdited') is False and c.get('nativeTantalus') is False)
ck('Codex 10 fiches et60 règles',(R/'CODEX_LEVEL_DESIGN_V113.html').read_text().count('<article class="room')==10 and selection['rules']==60)
for rel,value in V.items():ck('Hérité exact '+rel,sha((R/rel).read_bytes())==value)
ck('37 sources/tests V112 préservés',len(V)==37)
ck('Pas de police distribuée',not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in R.rglob('*')))
ck('Aucun lien symbolique',not any(p.is_symlink() for p in R.rglob('*')))
ck('Version et lanceur corrects',J('package.json')['version']=='113.0.0-rc.1' and 'JOUER_ALIENS_V113.html' in (R/'JOUER_WINDOWS.bat').read_text())
source=Path('/mnt/data/ALIENS_1986_V112_BALISER_LE_REPLI_RC1.zip');sourcehash='c9c13930b5451af046a6e9d7a3e69bf90cc0fa2f42b0ed336b01be9d236f7c06'
if source.exists():ck('Source ZIP exacte',sha(source.read_bytes())==sourcehash)
out={'ok':all(x['ok'] for x in checks),'version':'113.0.0-rc.1','htmlSha256':h,'sourceArchiveSha256':sourcehash,'contract':C['contract'],'nativeActivated':False,'nativeCampaignRuns':0,'nodeTestsPassed':passed,'gameBrowserChecksPassed':len(B['tests']),'separateDistributionChecksPassed':len(S['checks']),'separateSaveCorpusChecks':len(corpus['checks']),'automatedFullOperations':8,'pursuitEnemyTransfers':P['enemyTransfers'],'beaconOperationEnemyTransfers':K['enemyTransfers'],'directBrowserCaptures':len(B['captures']),'embeddedReportCaptures':len(images),'directFileNavigation':S['transport']['directFileNavigation'],'checks':checks}
(R/'report/RELEASE_CHECK_V113.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='checks'},ensure_ascii=False,indent=2))
