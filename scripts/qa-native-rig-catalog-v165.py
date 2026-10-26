"""Explicit native-art fixtures, all new controller intros and ten representative native results.
No menu/unlock journey, full walk, capture choreography or source-game1:1 claim.
The controller owns all RAF, actor, HP, result and presentation state.
"""
import argparse,base64,json,os,hashlib,subprocess,datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--base',default=os.environ.get('ATF_BASE_URL','http://127.0.0.1:4173'));p.add_argument('--output',type=Path,required=True);p.add_argument('--ids',nargs='+',help='Preview only: exact fighter IDs, space separated. Default executes every currently admitted V165 presentation rig. Subset reports are ineligible for final recipe evidence.');p.add_argument('--expect-build',help='Exact served source commit required for final evidence');p.add_argument('--expect-harness',help='Exact clean committed QA driver required for final evidence');p.add_argument('--comparison-stage',choices=['before','after'],default='after');args=p.parse_args()
out=args.output.resolve();repo=Path(__file__).resolve().parents[1]
if out==repo or repo in out.parents:raise SystemExit('Evidence must remain outside the repository')
out.mkdir(parents=True,exist_ok=True)
if (out/'report.json').exists():raise SystemExit('Preserve preceding QA report; use a fresh output directory')
report={'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'schema':165,'comparisonStage':args.comparison_stage,'status':'running','releaseEvidenceEligible':not bool(args.ids) and bool(args.expect_build and args.expect_harness),'selectedIds':args.ids,'scope':'All admitted V165 source-pixel presentation fixtures and actual controller introductions. Ten explicitly selected native CPU outcomes use the public one-HP rule. No menu/unlock, complete walk, floor-capture or artistic1:1 certification.','limitations':['Before reads only local fixture identities and imports no V165 source module or new rig into the historical game. After requires actual native V165 admission.','Native phase timing is observed, not forced to a pixel-identical clock. Fixture poses use their explicit fixed progress.','Native source pixels with small authored upper-body poses.','Hidden limbs, costume art and full walks are not reconstructed.','Fixture poses are separate from actual native RAF introductions and CPU outcomes.','Native introductions cover every selected new rig; only the ten listed representative identities run a native terminal duel. Render fixtures are not gameplay outcomes.','Canonical source-game1:1 remains unapproved.'],'profiles':[],'checks':[],'captures':[],'poseSamples':[],'nativeTerminals':[],'nativeIntros':[],'terminalSelection':['runner','rhino','queen','xenoborg','mecha-2','albino-combat-synth','import-engineer-ceremonialsuit','import-engineer-wararmor','afe2-engineer-hybrid','import-game-afe2-harbinger'],'pageErrors':[],'requestFailures':[],'httpErrors':[]}
def check(label,ok,evidence=None):
 if not ok:raise AssertionError(label)
 report['checks'].append({'status':'passed','label':label,'evidence':evidence})
def capture(name,frame,scope):
 raw=base64.b64decode(frame['png'].split(',')[1],validate=True)
 if raw[:8]!=b'\x89PNG\r\n\x1a\n':raise AssertionError('Native capture is not a PNG')
 destination=out/name
 if destination.exists():raise AssertionError('Preserve preceding capture: '+str(destination))
 destination.write_bytes(raw);report['captures'].append({'file':name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'width':int.from_bytes(raw[16:20],'big'),'height':int.from_bytes(raw[20:24],'big'),'state':frame.get('state'),'scope':scope})
HOST='''<!doctype html><html lang="fr"><meta charset="utf-8"><title>V165 supported presentation rig review</title><style>body{margin:0;background:#071119;color:#deeceb;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{padding:16px;margin:10px}#review[hidden]{display:none}</style><canvas id="review" width="960" height="640" hidden></canvas><canvas id="arena" width="1000" height="560"></canvas><button id="pause">Pause</button><button id="resume">Reprendre</button><button id="next">Manche suivante</button><button id="stop">Fermer</button></html>'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']}if os.environ.get('ATF_CHROMIUM_EXECUTABLE')else{}))
 context=browser.new_context(viewport={'width':1200,'height':850},service_workers='block');page=context.new_page();page.set_default_timeout(20000)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)));page.on('requestfailed',lambda r:report['requestFailures'].append({'url':r.url,'failure':r.failure}));page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status})if r.status>=400 else None)
 try:
  page.route(args.base.rstrip('/')+'/',lambda route:route.fulfill(status=200,content_type='text/html',body=HOST));page.goto(args.base.rstrip('/')+'/',wait_until='domcontentloaded')
  driver_head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();driver_status=subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True)
  report['harnessCommit']=driver_head;report['harnessClean']=not bool(driver_status);report['driverSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
  if args.expect_harness:check('QA driver is the exact clean declared commit',driver_head==args.expect_harness and not driver_status)
  def identity():
   payload=page.evaluate("async()=>{const r=await fetch('/build-info.json',{cache:'no-store'});if(!r.ok)throw new Error('Missing build-info');const raw=await r.text();return {raw,info:JSON.parse(raw)}}");return {'sourceCommit':payload['info'].get('sourceCommit'),'buildId':payload['info'].get('buildId'),'buildInfoSha256':hashlib.sha256(payload['raw'].encode()).hexdigest()}
  report['identityBefore']=identity();report['sourceCommit']=report['identityBefore']['sourceCommit']
  if args.expect_build:check('Served build is the exact declared source commit',report['sourceCommit']==args.expect_build)
  metadata_path=repo/'src/xeno-trials-rig-data-v165.js';metadata_text=metadata_path.read_text();marker='export const XENO_TRIALS_RIG_DATA_V165 = freeze(';metadata_rows=json.loads(metadata_text.split(marker,1)[1].rsplit(');',1)[0])
  declared=[{**{key:r[key] for key in ['id','fighterId','profileId','path','sourceFacing','sourceWidth','sourceHeight','sourceSha256']},'clips':list(r['poses'])} for r in metadata_rows]
  report['fixtureMetadata']={'path':str(metadata_path),'sha256':hashlib.sha256(metadata_path.read_bytes()).hexdigest(),'identities':len(declared),'scope':'Identity, dimensions and clip labels only; no V165 code or rig is installed into the before game.'}
  inventory=page.evaluate('''async payload=>{
   window.R=await import('/src/xeno-trials-rig-v154.js');window.isRigBaseline=payload.stage==='before';
   window.C=isRigBaseline?{XENO_TRIALS_RIG_DATA_V165:payload.metadata}:await import('/src/xeno-trials-rig-data-v165.js');window.rigImages=new Map();
   const definitions=await import('/src/xeno-trials-data-v96.js');window.rigSourceBindings=[];
   if(C.XENO_TRIALS_RIG_DATA_V165.length!==payload.metadata.length)throw new Error('Served rig catalogue differs from declared harness identities');
   for(const r of C.XENO_TRIALS_RIG_DATA_V165){
    const declared=payload.metadata.find(x=>x.id===r.id),definition=definitions.XENO_TRIALS_FIGHTERS_V96.find(f=>f.id===r.fighterId),art=definitions.getXenoTrialsArtV96(r.fighterId);
    if(!declared||!definition||!art||['profileId','path','sourceFacing','sourceWidth','sourceHeight'].some(key=>art[key==='profileId'?'id':key]!==r[key])||declared.sourceSha256!==r.sourceSha256)throw new Error('Native identity/source metadata differs');
    const admitted=R.getXenoTrialsRigV154(definition,art);
    if(isRigBaseline?admitted!==null:admitted!==r)throw new Error('Wrong native rig admission for comparison stage');
   }
   window.prepareRigImage=async id=>{
    const r=C.XENO_TRIALS_RIG_DATA_V165.find(r=>r.id===id);
    rigImages.clear();
    const response=await fetch(r.path,{cache:'no-store'});if(!response.ok)throw new Error('Missing native source PNG');
    const bytes=await response.arrayBuffer(),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
    if(digest!==r.sourceSha256)throw new Error('Served native source bytes differ');
    const image=new Image();image.src=r.path;await image.decode();
    if(image.naturalWidth!==r.sourceWidth||image.naturalHeight!==r.sourceHeight)throw new Error('Native image dimensions differ');
    rigImages.set(r.id,image);rigSourceBindings.push({fighterId:r.fighterId,path:r.path,sha256:digest,rigAdmitted:!isRigBaseline});
    return{width:image.naturalWidth,height:image.naturalHeight,retainedQaImageEntries:rigImages.size};
   };
   window.reviewPose=({id,clip,facing,reduced=false})=>{
    const r=C.XENO_TRIALS_RIG_DATA_V165.find(r=>r.id===id),image=rigImages.get(id),canvas=document.querySelector('#review'),ctx=canvas.getContext('2d');
    const height=Math.min(560,860*r.sourceHeight/r.sourceWidth),width=height*r.sourceWidth/r.sourceHeight,m={width,height,pivotX:.5,bottom:1};
    const native=()=>{ctx.clearRect(0,0,960,640);ctx.save();ctx.translate(480,610);ctx.scale(facing*r.sourceFacing,1);ctx.drawImage(image,-width*.5,-height,width,height);ctx.restore();};
    native();const before=ctx.getImageData(0,0,960,640).data;
    const baseline=canvas.toDataURL('image/png');ctx.clearRect(0,0,960,640);
    const f=isRigBaseline?null:R.sampleXenoTrialsRigV154(r,{clip,progress:.5,elapsed:.6},reduced),begin=performance.now();
    const receipt=R.drawXenoTrialsRigV154(ctx,r,image,f,m,480,610,facing),drawMs=performance.now()-begin;if(!receipt)native();
    const after=ctx.getImageData(0,0,960,640).data;let changed=0;
    for(let i=0;i<after.length;i+=4)if(after[i]!==before[i]||after[i+1]!==before[i+1]||after[i+2]!==before[i+2]||after[i+3]!==before[i+3])changed++;
    return{receipt,changed,drawMs,baseline,png:canvas.toDataURL('image/png')};
   };
   return C.XENO_TRIALS_RIG_DATA_V165.map(r=>({id:r.id,fighterId:r.fighterId,clips:r.clips||Object.keys(r.poses),sourceSha256:r.sourceSha256}));
  }''',{'stage':args.comparison_stage,'metadata':declared})
  check('At least40 exact new V165 presentation bindings are present',len(inventory)>=40)
  if args.ids:
   check('Preview subset uses exact, known and unique fighter IDs',len(set(args.ids))==len(args.ids)and set(args.ids)<=set(r['fighterId']for r in inventory),{'requestedIds':args.ids})
   inventory=[r for r in inventory if r['fighterId']in args.ids]
   report['scope']='PREVIEW SUBSET ONLY, ineligible for the final full-catalogue recipe. '+report['scope']
  for rig in inventory:
   prepared=page.evaluate('id=>prepareRigImage(id)',rig['id']);check(rig['fighterId']+': native image decoded with one retained QA image',prepared['retainedQaImageEntries']==1)
   profile='native-rig::'+rig['fighterId'];report['profiles'].append({'name':profile,'sourceSha256':rig['sourceSha256'],'fighterId':rig['fighterId']})
   for facing in [-1,1]:
    for clip in rig['clips']:
     frame=page.evaluate('x=>reviewPose(x)',{'id':rig['id'],'clip':clip,'facing':facing})
     if args.comparison_stage=='after':check(profile+'/'+clip+'/'+str(facing)+': visible, valid source-pixel mesh',bool(frame['receipt'])and frame['changed']>20 and frame['receipt']['sourceSha256']==rig['sourceSha256'])
     else:check(profile+'/'+clip+'/'+str(facing)+': historical source remains undeformed without a V165 rig',frame['receipt'] is None and frame['changed']==0)
     report['poseSamples'].append({'profile':profile,'facing':facing,'clip':clip,'changedPixels':frame['changed'],'drawMs':frame['drawMs']})
     if clip=='struggle'and facing==1:
      capture(rig['fighterId']+'-source.png',{'png':frame['baseline']},'Explicit undeformed source-art fixture, same source hash, camera and scale as the after fixture.')
      if args.comparison_stage=='after':capture(rig['fighterId']+'-struggle-fixture.png',frame,'Explicit authored source-pixel render fixture, not a gameplay capture event.')
   reduced=page.evaluate('x=>reviewPose(x)',{'id':rig['id'],'clip':'struggle','facing':1,'reduced':True});check(profile+': reduced motion restores exact native pixels',reduced['changed']==0 and reduced['receipt']is None)
   ready=page.evaluate('''async id=>{
    window.rigRuntime?.stop();const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');
    const {normalizeXenoTrialsRulesV119}=await import('/src/xeno-trials-modes-v119.js');window.rigResults=[];
    window.rigRuntime=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),config:{playerId:id,opponentId:'prowler',difficulty:'hard',roundSeconds:15,roundsToWin:1,rulesV119:normalizeXenoTrialsRulesV119({initialHp:1}),seed:165},onResult:result=>rigResults.push(structuredClone(result))});
    document.querySelector('#pause').onclick=()=>rigRuntime.pause();document.querySelector('#resume').onclick=()=>rigRuntime.resume();document.querySelector('#next').onclick=()=>rigRuntime.nextRound();document.querySelector('#stop').onclick=()=>rigRuntime.stop();return await rigRuntime.start();
   }''',rig['fighterId']);check(profile+': actual native controller starts',ready)
   if args.comparison_stage=='after':page.wait_for_function("id=>rigRuntime.getState().rigViewsV154.some(v=>v.side==='player'&&v.rigId==='rig-v165-'+id&&v.clip==='intro'&&v.drawn)",arg=rig['fighterId'],polling='raf')
   else:page.wait_for_function("()=>{const s=rigRuntime.getState();return s.presentation.fighterSlot===0&&s.presentation.blocksSimulation&&s.tick===0&&!s.rigViewsV154.some(v=>v.side==='player')}",polling='raf')
   frame=page.evaluate("()=>({state:rigRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})")
   check(profile+': actual intro blocks engine ticks without injected actor/HP/clock',frame['state']['tick']==0 and frame['state']['presentation']['blocksSimulation'])
   check(profile+': actual intro uses the expected rig admission',any(v['side']=='player' and v['rigId']=='rig-v165-'+rig['fighterId'] and v['drawn'] for v in frame['state']['rigViewsV154']) if args.comparison_stage=='after' else not any(v['side']=='player' for v in frame['state']['rigViewsV154']))
   capture(rig['fighterId']+'-native-intro.png',frame,'Actual native controller and browser RAF; source image, ordinary rules and unmodified engine. Separate from render fixtures.')
   page.locator('#pause').click();frozen=page.evaluate('()=>rigRuntime.getState()');page.wait_for_timeout(80);check(profile+': native pause freezes snapshot',page.evaluate('()=>rigRuntime.getState()')==frozen)
   check(profile+': one-HP rule belongs to the normalized constructor configuration',frozen['config']['rulesV119']['initialHp']==1 and all(f['hp']==1 for f in frozen['fighters']))
   report['nativeIntros'].append({'fighterId':rig['fighterId'],'sourceSha256':rig['sourceSha256'],'tick':frozen['tick'],'nativePauseVerified':True,'comparisonStage':args.comparison_stage,'rigAdmitted':args.comparison_stage=='after'})
   if rig['fighterId'] not in report['terminalSelection']:
    page.locator('#stop').click();check(profile+': nonterminal intro stops and clears native rig receipts',not page.evaluate('()=>rigRuntime.getState().rigViewsV154'));continue
   page.locator('#resume').click();page.locator('#arena').focus()
   page.wait_for_function('()=>!rigRuntime.getState().presentation.blocksSimulation',polling='raf')
   # A genuine keyboard approach meets the native CPU. Public constructor rules
   # shorten the duel; no health, clock, position or result is assigned by QA.
   for round_attempt in range(3):
    page.keyboard.down('KeyD')
    page.wait_for_function("()=>['round-over','match-over'].includes(rigRuntime.getState().phase)",polling='raf',timeout=75000)
    page.keyboard.up('KeyD')
    if page.evaluate("()=>rigRuntime.getState().phase==='match-over'"):break
    # A legitimate draw can need another native round. This fixture's button
    # invokes the same public nextRound API; it does not replace match state.
    page.locator('#next').click();page.locator('#arena').focus()
    page.wait_for_function('()=>!rigRuntime.getState().presentation.blocksSimulation',polling='raf')
   page.wait_for_function("()=>rigRuntime.getState().phase==='match-over'&&rigResults.length===1",polling='raf')
   terminal=page.evaluate("()=>({state:rigRuntime.getState(),results:structuredClone(rigResults),png:document.querySelector('#arena').toDataURL('image/png')})")
   check(profile+': native CPU result reaches its callback exactly once',terminal['state']['result']['completed'] and len(terminal['results'])==1)
   for key in ['outroV155','terminalV156','landingV157','exitV157']:
    phase=terminal['state'].get(key)
    check(profile+': no unsupported historical '+key,not phase or all(p['fighterId']!=rig['fighterId'] for p in phase.get('participants',[])))
   capture(rig['fighterId']+'-native-terminal.png',terminal,'Actual native CPU outcome after keyboard approach and normalized public one-HP rule. No match state or result injection; any historical Prowler sequence remains separately admitted.')
   report['nativeTerminals'].append({'profile':profile,'winner':terminal['state']['result']['winner'],'tick':terminal['state']['tick'],'resultCallbacks':len(terminal['results'])})
   page.wait_for_function("()=>{const s=rigRuntime.getState();return ![s.outroV155,s.terminalV156,s.landingV157,s.exitV157].some(v=>v?.phase==='playing')}",polling='raf',timeout=25000)
   final=page.evaluate('()=>rigRuntime.getState()');page.keyboard.press('KeyJ');page.wait_for_timeout(80)
   check(profile+': terminal controls cannot replay a result or reopen combat',page.evaluate('()=>rigResults.length')==1 and page.evaluate('()=>rigRuntime.getState().tick')==final['tick'])
   page.locator('#stop').click();stopped=page.evaluate('()=>rigRuntime.getState()');check(profile+': native stop clears rig receipts',not stopped['rigViewsV154'])
  report['sourceBindings']=page.evaluate('()=>structuredClone(rigSourceBindings)')
  check('Every observed identity retains original served PNG bytes and expected stage admission',len(report['sourceBindings'])==len(inventory) and all(x['rigAdmitted']==(args.comparison_stage=='after') for x in report['sourceBindings']))
  report['identityAfter']=identity();check('Same served build before and after every observation',report['identityAfter']==report['identityBefore'])
  if args.expect_harness:check('QA source remained at its exact clean commit',subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==driver_head and not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True))
  report['finishedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
  check('No browser exception, failed request or HTTP error',not(report['pageErrors']or report['requestFailures']or report['httpErrors']));report['status']='passed' if report['releaseEvidenceEligible'] else 'passed-preview'
 except Exception as e:
  report['status']='failed';report['error']=str(e)
  try:report['failureState']=page.evaluate('()=>window.rigRuntime?.getState()');page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'profiles':len(report['profiles']),'report':str(out/'report.json')}))
raise SystemExit(0 if report['status']in['passed','passed-preview']else 1)
