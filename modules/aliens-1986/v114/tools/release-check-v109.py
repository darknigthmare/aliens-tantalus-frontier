"""Compare delivered source, HTML, captures and results before an explicit seal.
This does not recreate or modify the integrity manifest."""
from pathlib import Path
import hashlib,json,re,subprocess,base64,ast
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
checks=[]
def ck(name,ok):
 checks.append({'name':name,'ok':bool(ok)});assert ok,name
for p in sorted(R.rglob('*.mjs')):
 ck('Syntaxe '+p.relative_to(R).as_posix(),subprocess.run(['node','--check',str(p)],capture_output=True).returncode==0)
for p in sorted(R.rglob('*.py')):
 ast.parse(p.read_text());ck('Syntaxe '+p.relative_to(R).as_posix(),True)
tap=(R/'report/node-tests-v109.tap').read_text();passed=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1))
ck('260 tests sans exclusion',passed==260 and all(re.search(r'^# '+k+r' 0$',tap,re.M) for k in ['fail','cancelled','skipped','todo']))
B=J('report/browser-results-v109.json');S=J('report/distribution-smoke-v109.json');D=J('report/operation-drive-v109.json');L=J('report/logistics-drive-v109.json');P=J('report/pursuit-drive-v109.json');C=J('report/CONTRATS_LEVEL_DESIGN_V109.json');V=J('baseline/SOURCES_PRESERVEES_V108.json')
html=(R/'JOUER_ALIENS_V109.html').read_bytes();h=sha(html)
ck('Le document testé est exactement celui livré',h==B['htmlSha256']==S['htmlSha256'])
registry=json.JSONDecoder().raw_decode(html.decode().split('const registry=',1)[1])[0]
ck('Quatorze modules de la chaîne réelle',len(registry)==14)
for rel,entry in registry.items():
 source=(R/rel).read_bytes();ck('Module exact '+rel,entry['source'].encode()==source and entry['sha256']==sha(source));ck('Imports résolus '+rel,all(p in registry for p in entry['deps'].values()))
ck('103 contrôles gameplay navigateur',len(B['tests'])==103 and all(x['ok'] for x in B['tests']))
ck('Aucune erreur navigateur observée',not B['pageErrors'] and not B['consoleErrors'])
ck('20 contrôles distribution séparés',len(S['checks'])==20 and all(x['ok'] for x in S['checks']))
ck('Aucune requête externe à la distribution',not S['externalRequests'] and not S['pageErrors'] and not S['consoleErrors'])
ck('Deux anciens itinéraires toujours terminables',len(D['results'])==2 and all(v['complete'] for v in D['results']))
ck('Deux nouvelles variantes complètes',len(L['results'])==2 and all(v['complete'] for v in L['results']))
for v in L['results']:
 ck('Réserves conservées '+v['variant'],v['logistics']['collected']==3 and v['logistics']['spent']=={'ammo':1,'medical':1,'sentry':1} and v['logistics']['stock']=={'ammo':2,'medical':1,'sentry':0})
 ck('Newt non armée '+v['variant'],next(a for a in v['team'] if a['id']=='newt')['ammo']==0)
ck('Poursuite réexécutée',P['ok'] and P['enemyTransfers']==2)
ck('Géométrie et arrivées contrôlées',C['validation']['ok'] and not C['validation']['failures'])
ck('8 pièces 7 reliées 2 nouvelles',C['counts']['inspectableRooms']==8 and C['counts']['connectedOperationRooms']==7 and C['counts']['newRooms']==2)
ck('8 liaisons 16 volumes de seuil',C['counts']['reciprocalLinks']==8 and C['counts']['derivedThresholdVolumes']==16)
ck('3 réserves et 1 diagnostic',C['counts']['finiteStockCaches']==3 and C['counts']['diagnosticAlarms']==1)
ck('5 jalons locaux conservés',C['counts']['localObjectives']==5)
selection=J('report/report-selection-v109.json');report=(R/'RAPPORT_ILLUSTRE_V109.html').read_text()
images=[base64.b64decode(s) for s in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report)]
ck('12 PNG sélectionnés non retouchés',len(images)==12 and sorted(map(sha,images))==sorted(sha((R/'report/captures-v109'/f).read_bytes()) for f in selection['files']))
ck('25 captures uniques toutes présentes',len(B['captures'])==len(set(c['file'] for c in B['captures']))==25 and all((R/'report/captures-v109'/c['file']).is_file() for c in B['captures']))
ck('Huit fiches de Codex',(R/'CODEX_LEVEL_DESIGN_V109.html').read_text().count('<article class="room')==8)
for item in V['files']:ck('Préservation '+item['path'],sha((R/item['path']).read_bytes())==item['sha256'])
ck('Treize sources et tests préservés',len(V['files'])==13)
ck('Aucune police distribuée',not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in R.rglob('*')))
ck('Aucun lien symbolique',not any(p.is_symlink() for p in R.rglob('*')))
ck('Version et commandes de distribution exactes',J('package.json')['version']=='109.0.0-rc.1' and 'JOUER_ALIENS_V109.html' in (R/'JOUER_WINDOWS.bat').read_text())
# Tests of read-only verification live outside the release directory; no reference regeneration.
out={'ok':all(x['ok'] for x in checks),'version':'109.0.0-rc.1','htmlSha256':h,'baselineSha256':V['sha256'],'contract':C['contract'],'nativeActivated':False,'nativeCampaignRuns':0,'nodeTestsPassed':passed,'gameBrowserChecksPassed':len(B['tests']),'separateDistributionChecksPassed':len(S['checks']),'automatedFullOperations':4,'pursuitEnemyTransfers':P['enemyTransfers'],'directBrowserCaptures':len(B['captures']),'embeddedReportCaptures':len(images),'directFileNavigation':S['transport']['directFileNavigation'],'checks':checks}
(R/'report/RELEASE_CHECK_V109.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='checks'},ensure_ascii=False,indent=2))
