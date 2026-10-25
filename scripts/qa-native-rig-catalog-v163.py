"""Explicit native-art comparisons plus 15 actual controller intros/results.
No menu/unlock journey, full walk, capture choreography or source-game1:1 claim.
The controller owns all RAF, actor, HP, result and presentation state.
"""
import argparse,base64,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--base',default=os.environ.get('ATF_BASE_URL','http://127.0.0.1:4173'));p.add_argument('--output',type=Path,required=True);p.add_argument('--ids',nargs='+',help='Preview only: exact fighter IDs, space separated. Default executes all15. Subset reports are ineligible for final recipe evidence.');args=p.parse_args()
out=args.output.resolve();repo=Path(__file__).resolve().parents[1]
if out==repo or repo in out.parents:raise SystemExit('Evidence must remain outside the repository')
out.mkdir(parents=True,exist_ok=True)
report={'schema':163,'status':'running','releaseEvidenceEligible':not bool(args.ids),'selectedIds':args.ids,'scope':'15 explicitly labelled source-pixel render fixtures and native controller introductions/results on the public one-HP rule; not a menu/unlock, gameplay-capture or complete locomotion certification.','limitations':['Native source pixels with small authored upper-body poses.','Hidden limbs, costume art and full walks are not reconstructed.','Fixture poses are separate from actual native RAF introductions and CPU outcomes.','One native terminal per identity is observed; deterministic Node fixtures separately cover both wins/losses and draws.','Canonical source-game1:1 remains unapproved.'],'profiles':[],'checks':[],'captures':[],'poseSamples':[],'nativeTerminals':[],'pageErrors':[],'requestFailures':[],'httpErrors':[]}
def check(label,ok,evidence=None):
 if not ok:raise AssertionError(label)
 report['checks'].append({'status':'passed','label':label,'evidence':evidence})
def capture(name,frame,scope):
 (out/name).write_bytes(base64.b64decode(frame['png'].split(',')[1]));report['captures'].append({'file':name,'state':frame.get('state'),'scope':scope})
HOST='''<!doctype html><html lang="fr"><meta charset="utf-8"><title>V163 native rig review</title><style>body{margin:0;background:#071119;color:#deeceb;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{padding:16px;margin:10px}#review[hidden]{display:none}</style><canvas id="review" width="960" height="640" hidden></canvas><canvas id="arena" width="1000" height="560"></canvas><button id="pause">Pause</button><button id="resume">Reprendre</button><button id="next">Manche suivante</button><button id="stop">Fermer</button></html>'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']}if os.environ.get('ATF_CHROMIUM_EXECUTABLE')else{}))
 context=browser.new_context(viewport={'width':1200,'height':850},service_workers='block');page=context.new_page();page.set_default_timeout(20000)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)));page.on('requestfailed',lambda r:report['requestFailures'].append({'url':r.url,'failure':r.failure}));page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status})if r.status>=400 else None)
 try:
  page.route(args.base.rstrip('/')+'/',lambda route:route.fulfill(status=200,content_type='text/html',body=HOST));page.goto(args.base.rstrip('/')+'/',wait_until='domcontentloaded')
  inventory=page.evaluate('''async()=>{
   window.R=await import('/src/xeno-trials-rig-v154.js');window.C=await import('/src/xeno-trials-rig-data-v163.js');window.rigImages=new Map();
   for(const r of C.XENO_TRIALS_RIG_DATA_V163){const image=new Image();image.src=r.path;await image.decode();rigImages.set(r.id,image);}
   window.reviewPose=({id,clip,facing,reduced=false})=>{
    const r=C.XENO_TRIALS_RIG_DATA_V163.find(r=>r.id===id),image=rigImages.get(id),canvas=document.querySelector('#review'),ctx=canvas.getContext('2d');
    const height=Math.min(560,860*r.sourceHeight/r.sourceWidth),width=height*r.sourceWidth/r.sourceHeight,m={width,height,pivotX:.5,bottom:1};
    const native=()=>{ctx.clearRect(0,0,960,640);ctx.save();ctx.translate(480,610);ctx.scale(facing*r.sourceFacing,1);ctx.drawImage(image,-width*.5,-height,width,height);ctx.restore();};
    native();const before=ctx.getImageData(0,0,960,640).data;
    const baseline=canvas.toDataURL('image/png');ctx.clearRect(0,0,960,640);
    const f=R.sampleXenoTrialsRigV154(r,{clip,progress:.5,elapsed:.6},reduced),begin=performance.now();
    const receipt=R.drawXenoTrialsRigV154(ctx,r,image,f,m,480,610,facing),drawMs=performance.now()-begin;if(!receipt)native();
    const after=ctx.getImageData(0,0,960,640).data;let changed=0;
    for(let i=0;i<after.length;i+=4)if(after[i]!==before[i]||after[i+1]!==before[i+1]||after[i+2]!==before[i+2]||after[i+3]!==before[i+3])changed++;
    return{receipt,changed,drawMs,baseline,png:canvas.toDataURL('image/png')};
   };
   return C.XENO_TRIALS_RIG_DATA_V163.map(r=>({id:r.id,fighterId:r.fighterId,clips:Object.keys(r.poses),sourceSha256:r.sourceSha256}));
  }''')
  check('15 newly measured native source bindings are present',len(inventory)==15)
  if args.ids:
   check('Preview subset uses exact, known and unique fighter IDs',len(set(args.ids))==len(args.ids)and set(args.ids)<=set(r['fighterId']for r in inventory),{'requestedIds':args.ids})
   inventory=[r for r in inventory if r['fighterId']in args.ids]
   report['scope']='PREVIEW SUBSET ONLY, ineligible for the final full-catalogue recipe. '+report['scope']
  for rig in inventory:
   profile='native-rig::'+rig['fighterId'];report['profiles'].append({'name':profile,'sourceSha256':rig['sourceSha256'],'fighterId':rig['fighterId']})
   for facing in [-1,1]:
    for clip in rig['clips']:
     frame=page.evaluate('x=>reviewPose(x)',{'id':rig['id'],'clip':clip,'facing':facing})
     check(profile+'/'+clip+'/'+str(facing)+': visible, valid source-pixel mesh',bool(frame['receipt'])and frame['changed']>20 and frame['receipt']['sourceSha256']==rig['sourceSha256'])
     report['poseSamples'].append({'profile':profile,'facing':facing,'clip':clip,'changedPixels':frame['changed'],'drawMs':frame['drawMs']})
     if clip=='struggle'and facing==1:
      capture(rig['fighterId']+'-source.png',{'png':frame['baseline']},'Explicit undeformed source-art fixture, same source hash, camera and scale as the after fixture.')
      capture(rig['fighterId']+'-struggle-fixture.png',frame,'Explicit authored source-pixel render fixture, not a gameplay capture event.')
   reduced=page.evaluate('x=>reviewPose(x)',{'id':rig['id'],'clip':'struggle','facing':1,'reduced':True});check(profile+': reduced motion restores exact native pixels',reduced['changed']==0 and reduced['receipt']is None)
   ready=page.evaluate('''async id=>{
    window.rigRuntime?.stop();const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');
    const {normalizeXenoTrialsRulesV119}=await import('/src/xeno-trials-modes-v119.js');window.rigResults=[];
    window.rigRuntime=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),config:{playerId:id,opponentId:'prowler',difficulty:'hard',roundSeconds:15,roundsToWin:1,rulesV119:normalizeXenoTrialsRulesV119({initialHp:1}),seed:163},onResult:result=>rigResults.push(structuredClone(result))});
    document.querySelector('#pause').onclick=()=>rigRuntime.pause();document.querySelector('#resume').onclick=()=>rigRuntime.resume();document.querySelector('#next').onclick=()=>rigRuntime.nextRound();document.querySelector('#stop').onclick=()=>rigRuntime.stop();return await rigRuntime.start();
   }''',rig['fighterId']);check(profile+': actual native controller starts',ready)
   page.wait_for_function("id=>rigRuntime.getState().rigViewsV154.some(v=>v.side==='player'&&v.rigId==='rig-v163-'+id&&v.clip==='intro'&&v.drawn)",arg=rig['fighterId'],polling='raf')
   frame=page.evaluate("()=>({state:rigRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})")
   check(profile+': actual intro blocks engine ticks without injected actor/HP/clock',frame['state']['tick']==0 and frame['state']['presentation']['blocksSimulation'])
   capture(rig['fighterId']+'-native-intro.png',frame,'Actual native controller and browser RAF; source image, ordinary rules and unmodified engine. Separate from render fixtures.')
   page.locator('#pause').click();frozen=page.evaluate('()=>rigRuntime.getState()');page.wait_for_timeout(80);check(profile+': native pause freezes snapshot',page.evaluate('()=>rigRuntime.getState()')==frozen)
   check(profile+': one-HP rule belongs to the normalized constructor configuration',frozen['config']['rulesV119']['initialHp']==1 and all(f['hp']==1 for f in frozen['fighters']))
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
  check('No browser exception, failed request or HTTP error',not(report['pageErrors']or report['requestFailures']or report['httpErrors']));report['status']='passed-subset'if args.ids else'passed'
 except Exception as e:
  report['status']='failed';report['error']=str(e)
  try:report['failureState']=page.evaluate('()=>window.rigRuntime?.getState()');page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'profiles':len(report['profiles']),'report':str(out/'report.json')}))
raise SystemExit(0 if report['status']in['passed','passed-subset']else 1)
