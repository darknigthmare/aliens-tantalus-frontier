"""Read-only comparison of source, HTML, results and pictures before seal.
Writing the receipt below is explicit; this never rewrites PACKAGE_MANIFEST."""
from pathlib import Path
import hashlib,json,re,subprocess,base64,ast
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text());sha=lambda b:hashlib.sha256(b).hexdigest();checks=[]
def ck(name,ok):checks.append({'name':name,'ok':bool(ok)});assert ok,name
for p in sorted(R.rglob('*.mjs')):ck('Syntaxe '+p.relative_to(R).as_posix(),subprocess.run(['node','--check',str(p)],capture_output=True).returncode==0)
for p in sorted(R.rglob('*.py')):ast.parse(p.read_text());ck('Syntaxe '+p.relative_to(R).as_posix(),True)
tap=(R/'report/node-tests-v110.tap').read_text();passed=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1));ck('343 tests sans exclusion',passed==343 and all(re.search(r'^# '+k+r' 0$',tap,re.M) for k in ['fail','cancelled','skipped','todo']))
B=J('report/browser-results-v110.json');S=J('report/distribution-smoke-v110.json');D=J('report/operation-drive-v110.json');L=J('report/logistics-drive-v110.json');H=J('report/breach-drive-v110.json');P=J('report/pursuit-drive-v110.json');C=J('report/CONTRATS_LEVEL_DESIGN_V110.json');V=J('baseline/SOURCES_PRESERVEES_V109.json')
html=(R/'JOUER_ALIENS_V110.html').read_bytes();h=sha(html);ck('Document testé exactement égal au livré',h==B['htmlSha256']==S['htmlSha256'])
registry=json.JSONDecoder().raw_decode(html.decode().split('const registry=',1)[1])[0];ck('Dix-huit modules réels de validation et jeu',len(registry)==18)
for rel,e in registry.items():
 raw=(R/rel).read_bytes();ck('Module exact '+rel,e['source'].encode()==raw and e['sha256']==sha(raw));ck('Imports résolus '+rel,all(p in registry for p in e['deps'].values()))
ck('148 contrôles gameplay navigateur',len(B['tests'])==148 and all(x['ok'] for x in B['tests']));ck('Aucune erreur navigateur observée',not B['pageErrors'] and not B['consoleErrors'])
for part,count in [('core',17),('tail',11),('contact-a',15),('contact-b',11),('touch',10),('logistics',39),('engineering',45)]:
 d=J('report/browser-'+part+'-v110.json');ck('Recette exacte '+part,len(d['tests'])==count and all(t['ok'] for t in d['tests']) and d['htmlSHA256']==h)
ck('24 contrôles de distribution séparés',len(S['checks'])==24 and all(x['ok'] for x in S['checks']));ck('Pas de demande externe nécessaire',not S['externalRequests'] and not S['pageErrors'] and not S['consoleErrors'])
ck('Deux itinéraires historiques terminables',len(D['results'])==2 and all(v['complete'] for v in D['results']))
ck('Deux boucles logistiques terminables',len(L['results'])==2 and all(v['complete'] for v in L['results']))
for v in L['results']:
 ck('Stocks logistiques conservés '+v['variant'],v['logistics']['collected']==3 and v['logistics']['spent']=={'ammo':1,'medical':1,'sentry':1} and v['logistics']['stock']=={'ammo':2,'medical':1,'sentry':0})
 ck('Newt jamais armée '+v['variant'],next(a for a in v['team'] if a['id']=='newt')['ammo']==0)
ck('Opération entière de brèche terminée',H['complete'] and H['inputs']>3000)
e=H['engineering'];m=e['metrics'];ck('Une brèche réelle, réparation et renfort finis',m['breaches']==1 and m['enemyHits']==4 and m['repaired']==1 and m['reinforced']==1 and m['cut']==1)
ck('Deux plaques utilisées, une restante',e['plates']==1 and e['spent']==2 and e['collected'])
ck('Identités traversent sans nouvelles vagues',H['enemyTransfers']>=1 and P['ok'] and P['enemyTransfers']==2)
ck('Géométrie/arrivées validées',C['validation']['ok'] and not C['validation']['failures'])
ck('8 pièces dont 7 reliées, aucune nouvelle',C['counts']['inspectableRooms']==8 and C['counts']['connectedOperationRooms']==7 and C['counts']['newRooms']==0)
ck('8 sas / 16 volumes dérivés',C['counts']['destructibleLinkHatches']==8 and C['counts']['derivedThresholdVolumes']==16)
ck('Kit unique de 3 plaques',C['counts']['finiteEngineeringKits']==1 and C['engineeringStock']['grant']==3)
ck('Cinq jalons locaux conservés',C['counts']['localObjectives']==5)
selection=J('report/report-selection-v110.json');report=(R/'RAPPORT_ILLUSTRE_V110.html').read_text()
images=[base64.b64decode(s) for s in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report)]
ck('12 PNG embarqués inchangés',len(images)==12 and sorted(map(sha,images))==sorted(sha((R/'report/captures-v110'/f).read_bytes()) for f in selection['files']))
ck('34 captures uniques présentes',len(B['captures'])==len(set(c['file'] for c in B['captures']))==34 and all((R/'report/captures-v110'/c['file']).is_file() for c in B['captures']))
for c in B['captures']:ck('Provenance '+c['file'],bool(c['origin']) and c.get('imageEdited') is False and c.get('nativeTantalus') is False)
ck('Codex : 8 lieux et 26 règles',(R/'CODEX_LEVEL_DESIGN_V110.html').read_text().count('<article class="room')==8 and selection['rules']==26)
for f in V['preserved']:ck('Source/test V109 conservé '+f['path'],sha((R/f['path']).read_bytes())==f['sha256'])
ck('Dix-huit fichiers historiques préservés',len(V['preserved'])==18)
ck('Pas de police distribuée',not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in R.rglob('*')))
ck('Pas de lien symbolique',not any(p.is_symlink() for p in R.rglob('*')))
ck('Version et raccourci exacts',J('package.json')['version']=='110.0.0-rc.1' and 'JOUER_ALIENS_V110.html' in (R/'JOUER_WINDOWS.bat').read_text())
out={'ok':all(x['ok'] for x in checks),'version':'110.0.0-rc.1','htmlSha256':h,'sourceArchiveSha256':V['sha256'],'contract':C['contract'],'nativeActivated':False,'nativeCampaignRuns':0,'nodeTestsPassed':passed,'gameBrowserChecksPassed':len(B['tests']),'separateDistributionChecksPassed':len(S['checks']),'automatedFullOperations':5,'pursuitEnemyTransfers':P['enemyTransfers'],'breachOperationEnemyTransfers':H['enemyTransfers'],'directBrowserCaptures':len(B['captures']),'embeddedReportCaptures':len(images),'directFileNavigation':S['transport']['directFileNavigation'],'checks':checks}
(R/'report/RELEASE_CHECK_V110.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='checks'},ensure_ascii=False,indent=2))
