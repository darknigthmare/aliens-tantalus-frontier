"""Verify current release evidence against packaged sources before sealing.
Does not regenerate integrity references. Writes only its release-check result.
"""
from pathlib import Path
import hashlib,json,re,subprocess
R=Path(__file__).resolve().parent.parent
J=lambda rel:json.loads((R/rel).read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
checks=[]
def ck(name,ok):
 checks.append({'name':name,'ok':bool(ok)});assert ok,name
for p in sorted(R.rglob('*.mjs')):
 result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 ck('Syntaxe '+p.relative_to(R).as_posix(),result.returncode==0)
tap=(R/'report/node-tests-v108.tap').read_text()
passed=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1))
ck('Tests Node complets et sans exclusion',passed==180 and all(re.search(r'^# '+k+r' 0$',tap,re.M) for k in ['fail','cancelled','skipped','todo']))
browser=J('report/browser-results-v108.json');dist=J('report/distribution-smoke-v108.json');ops=J('report/operation-drive-v108.json');pursuit=J('report/pursuit-drive-v108.json');contract=J('report/CONTRATS_LEVEL_DESIGN_V108.json')
html=(R/'JOUER_ALIENS_V108.html').read_bytes();html_hash=sha(html)
ck('HTML joué identique à la livraison',html_hash==browser['htmlSha256']==dist['htmlSha256'])
registry=json.JSONDecoder().raw_decode(html.decode().split('const registry=',1)[1])[0]
ck('Dix modules dans le document',len(registry)==10)
for rel,entry in registry.items():
 source=(R/rel).read_bytes()
 ck('Module distribué exact '+rel,entry['source'].encode()==source and entry['sha256']==sha(source))
 ck('Imports résolus '+rel,all(dep in registry for dep in entry['deps'].values()))
ck('64 contrôles navigateur réussis',len(browser['tests'])==64 and all(x['ok'] for x in browser['tests']))
ck('Aucune erreur observée navigateur',not browser['pageErrors'] and not browser['consoleErrors'])
ck('Douze contrôles distribution réussis',len(dist['checks'])==12 and all(x['ok'] for x in dist['checks']) and not dist['pageErrors'] and not dist['externalRequests'])
ck('Deux parcours locaux terminés',len(ops['results'])==2 and all(x['complete'] for x in ops['results']))
ck('Parcours distinct de poursuite',pursuit['ok'] and pursuit['enemyTransfers']==2)
ck('Six lieux hérités dont cinq reliés',contract['counts']['inspectableRooms']==6 and contract['counts']['connectedOperationRooms']==5 and contract['counts']['newRooms']==0)
ck('Cinq sas réciproques et dix volumes dérivés',contract['counts']['sharedLinkHatches']==5 and contract['counts']['derivedThresholdVolumes']==10)
ck('Six fiches Codex', (R/'CODEX_LEVEL_DESIGN_V108.html').read_text().count('class="room"')==6)
ck('Seize captures uniques',len(browser['captures'])==len(set(x['file'] for x in browser['captures']))==16)
# Compare each embedded report image to its direct screenshot file, byte for byte.
import base64
report=(R/'RAPPORT_ILLUSTRE_V108.html').read_text()
images=[base64.b64decode(s) for s in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report)]
raw_captures=[(R/'report/captures-v108'/x['file']).read_bytes() for x in browser['captures']]
ck('Captures sans recomposition dans le rapport',sorted(map(sha,images))==sorted(map(sha,raw_captures)))
preserved=J('baseline/SOURCES_PRESERVEES_V107.json')
for item in preserved['files']:
 ck('Source héritée préservée '+item['path'],sha((R/item['path']).read_bytes())==item['sha256'])
ck('Aucune police incluse',not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in R.rglob('*')))
ck('Aucun lien symbolique',not any(p.is_symlink() for p in R.rglob('*')))
out={'ok':all(x['ok'] for x in checks),'version':'108.0.0-rc.1','htmlSha256':html_hash,'baselineSha256':preserved['sha256'],'contract':contract['contract'],'nativeActivated':False,'nativeCampaignRuns':0,'nodeTestsPassed':passed,'gameBrowserChecksPassed':len(browser['tests']),'separateDistributionChecksPassed':len(dist['checks']),'automatedFullOperations':len(ops['results']),'pursuitEnemyTransfers':pursuit['enemyTransfers'],'directBrowserCaptures':len(raw_captures),'directFileNavigation':dist['transport']['directFileNavigation'],'checks':checks}
(R/'report/RELEASE_CHECK_V108.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='checks'},ensure_ascii=False,indent=2))
