"""Native outfit/equipment UI and actions, with separately labelled art fixtures.

The existing editor imports are disclosed QA floors, not new Forge features.
Evaluations read live state/canvases or render isolated source-image fixtures;
they never set an actor, equipment, action clock, projectile or game geometry.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--base',default='http://127.0.0.1:4173')
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--expect-build',required=True)
parser.add_argument('--expect-harness',required=True)
parser.add_argument('--costumes',nargs='+',help='Optional exact costume IDs; all admitted outfits run by default.')
args=parser.parse_args()
repo=Path(__file__).resolve().parents[1];output=args.output.resolve()
if output==repo or repo in output.parents:raise SystemExit('Keep QA artifacts outside the repository.')
output.mkdir(parents=True,exist_ok=True)
if (output/'report.json').exists():raise SystemExit('Preserve an existing QA observation; use a new output folder.')
sha=lambda raw:hashlib.sha256(raw).hexdigest()
git=lambda *a:subprocess.check_output(['git',*a],cwd=repo,text=True).strip()


def identity():
 with urllib.request.urlopen(args.base.rstrip('/')+'/build-info.json',timeout=30) as response:raw=response.read()
 data=json.loads(raw);return {'sourceCommit':data['sourceCommit'],'buildId':data['buildId'],'buildInfoSha256':sha(raw)}


def source_map():
 files=[repo/name for name in git('ls-files').splitlines() if name.endswith(('.js','.mjs','.py','.css','.html','.json'))
        or name.startswith(('assets/openai/sprites/player/costumes-v165/','assets/openai/sprites/player/costume-parts-v165/'))]
 return {str(path.relative_to(repo)):sha(path.read_bytes()) for path in files if path.is_file()}


report={'schema':165,'status':'running','checks':[],'captures':[],'nativeOutfits':[],
 'pageErrors':[],'httpErrors':[],'requestFailures':[],'dialogs':[],
 'method':'Native Save import and costume/equipment buttons, physical hub walking, real preview controls and keyboard/mouse actions on disclosed editor floors. Separate original-image fixtures on light/dark backgrounds.',
 'limitations':['Automated Chromium, no human participants or canonical1:1 certification.',
  'Only the declared modular adaptations are observed. The240precomposed reference cells are not playable skins and never count as240native actions.',
  'The14armory preview modes are presentation observations, separate from native mission actions.',
  'Reference boards retain their illustrative baked props; live outfits instead use separate parts and real held equipment.',
  'The imported QA floor and enemy encounter use the existing editor. They are not campaign or Forge feature completion.']}


def check(label,condition):
 if not condition:raise AssertionError(label)
 report['checks'].append(label);print('PASS '+label,flush=True)


def open_view(page,view):
 if view!='hub' and page.locator('#exit-hub').is_visible():page.locator('#exit-hub').click()
 menu=page.locator('#menu-toggle')
 if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():menu.click()
 page.locator('[data-view="'+view+'"]').click()


def save_png(name,data,kind,state=None):
 raw=base64.b64decode(data.split(',',1)[1]);assert raw[:8]==b'\x89PNG\r\n\x1a\n'
 path=output/name;assert not path.exists();path.write_bytes(raw)
 report['captures'].append({'file':name,'kind':kind,'sha256':sha(raw),**({'state':state} if state is not None else {})})


def screenshot(page,selector,name,kind):
 path=output/name;page.locator(selector).screenshot(path=str(path))
 report['captures'].append({'file':name,'kind':kind,'sha256':sha(path.read_bytes())})


def inventory(page):
 return page.evaluate('''()=>{const s=__ATF_V51__.saveSystem.data;return {
 resources:structuredClone(s.galaxy.resources),weaponIds:[...s.player.weaponIds],equipmentIds:[...s.player.equipmentIds],
 ammo:structuredClone(s.player.ammo),userEquipment:structuredClone(s.player.userEquipmentV95),
 identity:structuredClone(s.onboardingV84?.identity),coopAppearance:structuredClone(s.player.coopAppearanceV126)};}''')


def native_state(page,hub=False):
 return page.evaluate('''hub=>{const e=hub?__ATF_HUB__:__ATF_GAME__,p=e.player;
 return {running:e.running,paused:e.paused,player:{x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,vy:p.vy,facing:p.facing,
 grounded:p.grounded,costumeId:p.costumeId,shots:p.shots,ammo:p.ammo,ammoReserve:p.ammoReserve,
 reloading:p.reloading,toolUseClock:p.toolUseClock,interactionClock:p.interactionClock,meleeClock:p.meleeClock},
 appearance:structuredClone(p.playerAppearanceVisualV126),action:structuredClone(p.playerActionVisualV127),
 weapon:structuredClone(p.heldWeaponVisualV125),visual:structuredClone(p.playerVisualV81)};}''',hub)


def capture_native(page,name,hub=False):
 frame=page.evaluate('''hub=>{const e=hub?__ATF_HUB__:__ATF_GAME__,p=e.player;
 return {png:document.querySelector(hub?'#hub-canvas':'#game-canvas').toDataURL('image/png'),
 state:{running:e.running,paused:e.paused,player:{x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,vy:p.vy,facing:p.facing,
 grounded:p.grounded,costumeId:p.costumeId,shots:p.shots,ammo:p.ammo,reloading:p.reloading},
 appearance:structuredClone(p.playerAppearanceVisualV126),action:structuredClone(p.playerActionVisualV127),
 weapon:structuredClone(p.heldWeaponVisualV125)}};}''',hub)
 save_png(name,frame['png'],'native-hub' if hub else 'native-mission',frame['state']);return frame['state']


def observe_action(page,condition):
 page.evaluate('''condition=>{window.__COSTUME_V165_OBSERVER__=new Promise((resolve,reject)=>{
 const started=performance.now();const ready=new Function('e','p','return ('+condition+')');
 function tick(){const e=globalThis.__ATF_GAME__,p=e?.player;
  if(e&&p&&p.playerAppearanceVisualV126?.drawn&&ready(e,p)){
   resolve({png:document.querySelector('#game-canvas').toDataURL('image/png'),state:{
    player:{x:p.x,y:p.y,w:p.w,h:p.h,facing:p.facing,grounded:p.grounded,costumeId:p.costumeId,
     shots:p.shots,ammo:p.ammo,ammoReserve:p.ammoReserve,reloading:p.reloading},
    appearance:structuredClone(p.playerAppearanceVisualV126),action:structuredClone(p.playerActionVisualV127),
    weapon:structuredClone(p.heldWeaponVisualV125)}});return;}
  if(performance.now()-started>15000){reject(Error('Native costume action was not observed: '+condition));return;}
  requestAnimationFrame(tick);
 }requestAnimationFrame(tick);});window.__COSTUME_V165_OBSERVER__.catch(()=>{});}''',condition)


def finish_action(page,name):
 frame=page.evaluate('()=>window.__COSTUME_V165_OBSERVER__')
 save_png(name,frame['png'],'native-mission-action',frame['state']);return frame['state']


def walk_to(page,target,hub=False):
 accessor='__ATF_HUB__' if hub else '__ATF_GAME__'
 current=page.evaluate('()=>'+accessor+'.player.x');key='KeyD' if target>current else 'KeyA'
 page.locator('#hub-canvas' if hub else '#game-canvas').focus();page.keyboard.down(key)
 try:page.wait_for_function('c=>c.right?'+accessor+'.player.x>=c.x:'+accessor+'.player.x<=c.x',arg={'x':target,'right':target>current},timeout=30000)
 finally:page.keyboard.up(key)
 page.wait_for_function('()=>Math.abs('+accessor+'.player.vx)<1')


def fixture():
 script="""import{createDefaultSave}from'./src/save.js';
import{createPlayerOnboardingV84,normalizePlayerOnboardingV84}from'./src/player-onboarding-v84.js';
const s=createDefaultSave();s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA Costumes V165';
s.onboardingV84=normalizePlayerOnboardingV84({...createPlayerOnboardingV84({name:s.player.name,callsign:'COST165'}),phase:'complete'});
s.player.weaponIds=['weapon-001-m41a-pulse-rifle'];s.settings.reducedMotion=false;s.settings.coop=false;
console.log(JSON.stringify(s));"""
 raw=subprocess.check_output(['node','--input-type=module','-e',script],cwd=repo)
 path=output/'disclosed-native-setup.json';path.write_bytes(raw)
 report['initialFixture']={'file':path.name,'sha256':sha(raw),
  'scope':'Default resources/owned inventory; completed Echo9 onboarding, selected native M41A, coop disabled. M37 acquisition later uses real cost/button.'}
 return raw


def import_plan(page,plan,name):
 (output/name).write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
 page.locator('#editor-import').set_input_files({'name':name,'mimeType':'application/json','buffer':json.dumps(plan).encode()})
 page.wait_for_function("()=>document.querySelector('#editor-import').value===''")
 page.locator('#editor-play').click()
 page.wait_for_function('()=>__ATF_GAME__?.running&&__ATF_GAME__.player?.grounded&&__ATF_GAME__.player.playerAppearanceVisualV126?.drawn',timeout=90000)


def reference_fixtures(page,slug):
 rows=page.evaluate('''async slug=>{
  const {getPlayerCostumePreviewSkinV165}=await import('/src/player-costume-atlases-v165.js');
  const {PLAYER_COSTUME_PARTS_V165}=await import('/src/player-costume-parts-v165.js');
  const {PLAYER_COLONIAL_RIG_ASSETS_V129}=await import('/src/player-colonial-art-v129.js');
  const skin=getPlayerCostumePreviewSkinV165('franchise-'+slug),kit=PLAYER_COSTUME_PARTS_V165[slug];
  const sources=kit?[...(skin?.atlases||[]),kit.upperAsset,kit.legAsset,...Object.values(kit.helmet||{}).map(row=>row.asset)]:PLAYER_COLONIAL_RIG_ASSETS_V129;
  const unique=new Map(sources.map(a=>[a.path,a]));
  const result=[];
  for(const asset of unique.values()){
   const response=await fetch(asset.path);if(!response.ok)throw Error('Missing costume fixture '+asset.path);
   const raw=await response.arrayBuffer(),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw))).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(digest!==asset.sha256)throw Error('Served costume bytes differ: '+asset.path);
   const image=new Image();image.src=asset.path;await image.decode();
   if(image.naturalWidth!==asset.sourceWidth||image.naturalHeight!==asset.sourceHeight)throw Error('Wrong costume dimensions');
   for(const [background,color]of[['dark','#0b1215'],['light','#e6e2d7']]){
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);
    result.push({path:asset.path,kind:asset.kind,background,sha256:digest,width:canvas.width,height:canvas.height,
     role:asset.frames?'reference-board-not-live-animation':'separated-live-parts',png:canvas.toDataURL('image/png')});
   }
  }return result;
 }''',slug)
 for row in rows:
  png=row.pop('png');kind=row['kind'].replace('costume-','').replace('-parts','')
  save_png(slug+'-'+kind+'-'+row['background']+'-source-fixture.png',png,'source-composition-fixture',row)
 expected=16 if slug=='sevastopol-security' else 14 if slug in ['amanda-working','working-joe-uniform'] else 10 if slug in ['hicks-combat','hudson-combat'] else 4
 check(slug+': declared source art keeps exact served bytes on light/dark fixtures',len(rows)==expected)


browser=None
pw=None
try:
 check('Harness is the exact clean declared commit',git('rev-parse','HEAD')==args.expect_harness and not git('status','--porcelain'))
 report['identityBefore']=identity();check('The served build is the declared candidate',report['identityBefore']['sourceCommit']==args.expect_build)
 report['sourceStart']=source_map();initial=fixture()
 outfits=json.loads(subprocess.check_output(['node','--input-type=module','-e',
  "import{PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165}from'./src/player-costume-outfits-v165.js';console.log(JSON.stringify(PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165))"],cwd=repo))
 if args.costumes:
  check('Requested costume IDs are exact admitted outfits',len(set(args.costumes))==len(args.costumes) and set(args.costumes)<={row['costumeId'] for row in outfits})
  outfits=[row for row in outfits if row['costumeId'] in args.costumes]
 report['declaredOutfits']=[row['costumeId'] for row in outfits]
 modes=['idle','walk','crouch','aim','reload','medical','deploy','interact','melee','climb-up','climb-down','downed','death','revive']
 pw=sync_playwright().start()
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE','/usr/bin/chromium'))
 report['chromium']=browser.version
 for outfit in outfits:
  slug=outfit['slug'];report['phase']=slug+': import and real outfit button';print('STEP '+report['phase'],flush=True)
  context=browser.new_context(viewport={'width':1600,'height':1000},service_workers='block');page=context.new_page();page.set_default_timeout(45000)
  page.on('pageerror',lambda error:report['pageErrors'].append(str(error)))
  page.on('requestfailed',lambda request:report['requestFailures'].append({'url':request.url,'failure':request.failure}))
  page.on('response',lambda response:report['httpErrors'].append({'url':response.url,'status':response.status}) if response.status>=400 else None)
  page.on('dialog',lambda dialog:(report['dialogs'].append({'type':dialog.type,'message':dialog.message}),dialog.accept()))
  page.goto(args.base,wait_until='domcontentloaded');page.locator('#title-start').click();page.locator('#title-options').click()
  page.locator('#save-import').set_input_files({'name':'costumes-v165.json','mimeType':'application/json','buffer':initial})
  page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA Costumes V165'")
  # Costume archives are part of Echo-9, not the mission Archives view.
  before=inventory(page);open_view(page,'crew')
  page.locator('[data-panel="crew"] #costume-archives-v119').wait_for(state='visible')
  page.locator('#costume-archives-v119 [data-costume-id="'+outfit['costumeId']+'"]').click()
  selection=page.evaluate('o=>{const p=__ATF_V51__.saveSystem.data.player;return {expected:o,actual:{costumeId:p.costumeId,slots:structuredClone(p.appearanceV126.slots)},equal:JSON.stringify(p.appearanceV126.slots)===JSON.stringify(o.slots)};}',outfit)
  report.setdefault('buttonSelections',[]).append(selection);print('SELECTION '+json.dumps(selection,ensure_ascii=False),flush=True)
  # Preserve the optional null slots across the polling utility context.
  # Passing the nested dictionary directly drops those entries in this
  # tooling version; the six-slot native result must still match exactly.
  page.wait_for_function('raw=>{const o=JSON.parse(raw),p=__ATF_V51__.saveSystem.data.player,s=p.appearanceV126.slots;return p.costumeId===o.costumeId&&Object.keys(s).length===Object.keys(o.slots).length&&Object.entries(o.slots).every(([k,v])=>Object.hasOwn(s,k)&&s[k]===v);}',arg=json.dumps(outfit))
  check(slug+': real costume button equips all six parts without identity/resources/issued gear/J2 changes',inventory(page)==before)
  screenshot(page,'[data-archive-costume="'+outfit['costumeId']+'"]',slug+'-native-archive-card.png','native-archive-ui')
  open_view(page,'hub');page.wait_for_function('()=>__ATF_HUB__?.running&&__ATF_HUB__.player.playerAppearanceVisualV126?.drawn')
  start=native_state(page,True);capture_native(page,slug+'-native-hub-idle.png',True)
  walk_to(page,start['player']['x']+85,True);capture_native(page,slug+'-native-hub-right.png',True)
  walk_to(page,start['player']['x']+10,True);left=capture_native(page,slug+'-native-hub-left.png',True)
  check(slug+': native hub walking keeps the selected separate parts and no baked weapon',
   left['appearance']['selected']['slots']==outfit['slots'] and left['player']['w']==44 and left['player']['h']==92
   and not any(layer['slot']=='weapon' for layer in left['appearance']['layers']))
  open_view(page,'armory')
  for weapon_id,search in [('weapon-001-m41a-pulse-rifle','M41A Pulse Rifle'),('weapon-007-m37a2-pump-shotgun','M37A2 Pump Shotgun'),('weapon-003-m4a3-service-pistol','M4A3 Service Pistol')]:
   report['phase']=slug+': real equipment and14preview modes '+weapon_id;print('STEP '+report['phase'],flush=True)
   page.locator('#armory-kind').select_option('weapon');page.locator('#armory-search').fill(search)
   page.locator('[data-catalog-entry="'+weapon_id+'"]').click()
   buy=page.locator('#armory-catalog-detail [data-procure-id="'+weapon_id+'"]')
   if buy.count() and buy.is_enabled():buy.click()
   equip=page.locator('#armory-catalog-detail [data-equip-id="'+weapon_id+'"]')
   if equip.is_enabled():equip.click()
   page.wait_for_function('id=>__ATF_V51__.saveSystem.data.player.weaponIds.at(-1)===id',arg=weapon_id)
   for mode in modes:
    page.locator('#player-appearance-animation-v127').select_option(mode)
    page.wait_for_function("m=>{const c=document.querySelector('#player-appearance-preview-v126');return c?.dataset.appearanceReadyV126==='true'&&c.dataset.appearanceAnimationV127===m;}",arg=mode)
    for facing in [1,-1]:
     page.locator('[data-appearance-facing-v126="'+str(facing)+'"]').click()
     frame=page.locator('#player-appearance-preview-v126').evaluate('''c=>({png:c.toDataURL('image/png'),
      animation:c.dataset.appearanceAnimationV127,ready:c.dataset.appearanceReadyV126,
      selected:structuredClone(__ATF_V51__.saveSystem.data.player.appearanceV126),weapons:[...__ATF_V51__.saveSystem.data.player.weaponIds]})''')
     png=frame.pop('png');frame['facing']=facing
     save_png(slug+'-'+weapon_id+'-'+mode+('-right' if facing==1 else '-left')+'-armory-preview.png',png,'native-armory-preview',frame)
   check(slug+': all14real preview controls render both orientations with actual '+weapon_id,
    page.evaluate('()=>__ATF_V51__.saveSystem.data.player.appearanceV126.slots')==outfit['slots'])
  reference_fixtures(page,slug)
  report['phase']=slug+': native mission movement and tools';print('STEP '+report['phase'],flush=True)
  page.locator('#return-title').click();page.locator('#title-start').click();page.locator('#title-forge').click()
  plan={'schema':2,'kind':'mission','name':'QA tenue modulaire V165','size':[48,18],
   'tiles':[{'position':str(x)+':16','type':'floor'} for x in range(48)]+[{'position':'2:15','type':'spawn'},{'position':'46:15','type':'objective'},{'position':'4:15','type':'terminal'}]}
  import_plan(page,plan,slug+'-disclosed-floor.json');canvas=page.locator('#game-canvas');capture_native(page,slug+'-native-mission-idle.png')
  p0=native_state(page);walk_to(page,p0['player']['x']+110);capture_native(page,slug+'-native-mission-walk.png')
  canvas.focus();page.mouse.move(1200,500);page.mouse.down(button='right');page.wait_for_function('()=>__ATF_GAME__.player.heldWeaponVisualV125?.visible')
  capture_native(page,slug+'-native-mission-aim.png');shots=native_state(page)['player']['shots']
  observe_action(page,'p.shots>'+str(shots)+'&&p.heldWeaponVisualV125?.visible');page.mouse.down(button='left');fired=finish_action(page,slug+'-native-mission-fire.png');page.mouse.up(button='left');page.mouse.up(button='right')
  check(slug+': native firing uses the actual issued handgun and keeps the selected six parts',
   fired['weapon']['weaponId']=='weapon-003-m4a3-service-pistol' and fired['appearance']['selected']['slots']==outfit['slots'])
  canvas.focus();observe_action(page,'p.reloading');page.keyboard.press('KeyR');finish_action(page,slug+'-native-mission-reload.png');page.wait_for_function('()=>!__ATF_GAME__.player.reloading')
  observe_action(page,"p.playerActionVisualV127?.kind==='motion-tracker'");page.keyboard.press('KeyQ');tracker=finish_action(page,slug+'-native-mission-tracker.png')
  check(slug+': real motion detector uses its own implement with the same clothing',tracker['appearance']['selected']['slots']==outfit['slots'] and any(prop['itemId']=='tool.motion-tracker' for prop in tracker['action']['props']))
  page.wait_for_function('()=>!(__ATF_GAME__.player.toolUseClock>0)')
  walk_to(page,p0['player']['x']+70);observe_action(page,'p.interactionClock>0');page.keyboard.press('KeyE');finish_action(page,slug+'-native-mission-interaction.png')
  page.locator('#retreat-mission').click();page.locator('#editor-canvas').wait_for(state='visible')
  melee={**plan,'tiles':[tile for tile in plan['tiles'] if tile['type']!='terminal']+[{'position':'2:14','type':'enemy'}]}
  import_plan(page,melee,slug+'-disclosed-melee.json')
  page.wait_for_function('''()=>{const e=__ATF_GAME__,p=e.player;return e.canPerformGameplayAction(p)&&!p.reloading&&!(p.v52HurtClock>0)&&!(p.fireClock>0)&&e.enemies.some(n=>n.alive&&Math.abs(n.x+n.w/2-p.x-p.w/2)<90&&Math.abs(n.y+n.h/2-p.y-p.h/2)<94&&e.enemyMeleePathClearV64(p,n));}''',timeout=30000)
  observe_action(page,'p.meleeClock>0');canvas.click(button='middle',position={'x':24,'y':24});melee_frame=finish_action(page,slug+'-native-mission-melee.png')
  check(slug+': native CQC draws independent selected arms and keeps the outfit',melee_frame['appearance']['selected']['slots']==outfit['slots'])
  page.locator('#retreat-mission').click();report['nativeOutfits'].append({'costumeId':outfit['costumeId'],'outfitId':outfit['id'],'slots':outfit['slots'],'nativeMissionWeapon':'weapon-003-m4a3-service-pistol','armoryWeapons':3,'previewModes':14,'facings':2})
  context.close()
 check('All declared modular outfits completed native UI/hub/mission observations',len(report['nativeOutfits'])==len(outfits))
 check('No browser, asset or HTTP error',not report['pageErrors'] and not report['httpErrors'] and not [x for x in report['requestFailures'] if x['failure']!='net::ERR_ABORTED'])
 report['status']='passed'
except Exception as error:
 report['status']='failed';report['error']=str(error);raise
finally:
 if browser:browser.close()
 if pw:pw.stop()
 report['identityAfter']=identity();report['sourceEnd']=source_map();report['harnessSha256']=sha(Path(__file__).read_bytes())
 stable=report.get('identityBefore')==report['identityAfter'] and report.get('sourceStart')==report['sourceEnd']
 report['sourceAndDistributionUnchanged']=stable
 if not stable:report['status']='failed';report['error']='Source or served build changed during observation.'
 (output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 if not stable:raise AssertionError(report['error'])
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'captures':len(report['captures']),'nativeOutfits':len(report['nativeOutfits'])}))
