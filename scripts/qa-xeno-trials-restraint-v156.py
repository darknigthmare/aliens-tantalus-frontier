# V163 compatibility: this isolated V156 host deliberately rejects the optional
# V163 atlas, testing the supported historical fallback. Full-pose capture is
# covered separately by qa-xeno-trials-capture-v163.py through production menus.
"""Declared render fixtures plus three native CPU matches. No menu journey,
canonical choreography, edited HP/positions, or complete floor pin is claimed."""
import argparse, base64, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--base',default=os.environ.get('ATF_BASE_URL','http://127.0.0.1:4173'));p.add_argument('--output',type=Path,required=True);p.add_argument('--fixtures-only',action='store_true');args=p.parse_args()
out=args.output.resolve();repo=Path(__file__).resolve().parents[1]
if out==repo or repo in out.parents:raise SystemExit('Evidence must stay outside the repository')
out.mkdir(parents=True,exist_ok=True)
report={'status':'running','checks':[],'captures':[],'pageErrors':[],'requestFailures':[],'httpErrors':[],
 'scope':'Six exact-source render fixtures (three targets, two facings), then three native CPU holds and guard escapes. Original supported lowering, not a complete prone pin or canonical 1:1 match.'}
def check(label,ok,evidence=None):
 assert ok,label
 report['checks'].append({'label':label,'evidence':evidence})
def capture(name,frame,scope):
 (out/name).write_bytes(base64.b64decode(frame['png'].split(',')[1]));report['captures'].append({'file':name,'state':frame.get('state'),'scope':scope})
HOST='''<!doctype html><html lang="fr"><meta charset="utf-8"><title>V156 restraint review</title><style>body{margin:0;background:#071119;color:#deeceb;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{padding:16px;margin:10px}</style><canvas id="review" width="1300" height="680"></canvas><canvas id="arena" width="1000" height="560"></canvas><button id="stop">Fermer</button></html>'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
 context=browser.new_context(viewport={'width':1300,'height':900},service_workers='block');page=context.new_page();page.set_default_timeout(20000)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 page.on('requestfailed',lambda r:report['requestFailures'].append({'url':r.url,'failure':r.failure}))
 page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 try:
  page.route(args.base.rstrip('/')+'/',lambda route:route.fulfill(status=200,content_type='text/html',body=HOST))
  page.goto(args.base.rstrip('/')+'/',wait_until='domcontentloaded')
  targets=page.evaluate('''async()=>{
   window.R=await import('/src/xeno-trials-rig-v154.js');window.S=await import('/src/xeno-trials-scale-v110.js');window.V=await import('/src/xeno-trials-restraint-pose-v156.js');window.rigImages=new Map();
   for(const r of R.XENO_TRIALS_RIGS_V154){const image=new Image();image.src=r.path;await image.decode();rigImages.set(r.id,image);}
   window.reviewPose=({id,facing})=>{
    const r=R.XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===id),image=rigImages.get(r.id),c=document.querySelector('#review'),ctx=c.getContext('2d'),height=560,width=height*r.sourceWidth/r.sourceHeight,nativeMetrics=S.getXenoTrialsRenderMetricsV110(id),m={width,height,pivotX:nativeMetrics.pivotX,bottom:nativeMetrics.bottom};
    ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#071119';ctx.fillRect(0,0,c.width,c.height);ctx.font='18px monospace';const receipts=[];
    const cues=[{clip:'restraint',progress:0,elapsed:0,role:'captive'},{clip:'struggle',progress:.5,elapsed:.5,role:'captive'},{clip:'release',progress:.5,elapsed:.125,heldSeconds:.5,releaseFrom:'struggle',role:'captive'}];
    for(const[index,cue]of cues.entries()){
     const x=220+index*430,y=620,frame=R.sampleXenoTrialsRigV154(r,cue);ctx.fillStyle='#8fa39d';ctx.fillRect(x-180,y,360,2);ctx.fillStyle='#e3eae2';ctx.fillText(['Avant (source native)','Maintien abaissé','Retour après libération'][index],x-180,32);
     const receipt=R.drawXenoTrialsRigV154(ctx,r,image,frame,m,x,y,facing);receipts.push(receipt);
     if(!receipt){ctx.save();ctx.translate(x,y);ctx.scale(facing*r.sourceFacing,1);ctx.drawImage(image,-width*m.pivotX,-height*m.bottom,width,height);ctx.restore();}
    }
    return{receipts,png:c.toDataURL('image/png')};
   };
   return V.XENO_TRIALS_RESTRAINT_POSE_V156.targets.map(t=>({id:t.fighterId,lowering:t.lowering}));
  }''')
  check('Three exact admitted targets; full floor pin remains explicitly false',len(targets)==3 and page.evaluate('()=>V.XENO_TRIALS_RESTRAINT_POSE_V156.fullFloorPin===false'))
  for t in targets:
   for facing in [-1,1]:
    frame=page.evaluate('x=>reviewPose(x)',{'id':t['id'],'facing':facing});receipts=frame['receipts'];hold=receipts[1];release=receipts[2]
    check(t['id']+' / '+str(facing)+': native support, lowering and partial return draw',receipts[0] is None and hold['drawn'] and release['drawn'] and hold['restraintPoseV156']['sourceLowering']==t['lowering'] and 0<release['restraintPoseV156']['sourceLowering']<t['lowering'])
    for foot in ['footNear','footFar']:check(t['id']+' / '+str(facing)+' / '+foot+': release keeps the same support',abs((release['contacts'][foot][0]-hold['contacts'][foot][0])-430)<1e-7 and abs(release['contacts'][foot][1]-hold['contacts'][foot][1])<1e-7)
    capture(t['id']+('-left' if facing<0 else '-right')+'-fixture.png',frame,'Explicit render fixture: before, original native-supported lowering, half return. Not a gameplay contact observation.')
  for index,t in enumerate([] if args.fixtures_only else targets):
   ready=page.evaluate('''async id=>{
    const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');window.nativeReceipts={};
    window.rigRuntime=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),loadImage:async path=>{if(path.includes('/trials-v163/'))throw Error('Declared legacy fallback: V163 atlas deliberately unavailable');const image=new Image();image.src=path;await image.decode();return image;},config:{playerId:id,opponentId:'prowler',difficulty:'hard',roundSeconds:120,seed:153},onState:s=>{
     const v=s.rigViewsV154.find(r=>r.side==='player');
     if(v?.restraintPoseV156&&['restraint','struggle','release'].includes(v.clip)&&!nativeReceipts[v.clip])nativeReceipts[v.clip]={state:s,png:document.querySelector('#arena').toDataURL('image/png')};
    }});document.querySelector('#stop').onclick=()=>rigRuntime.stop();return await rigRuntime.start();
   }''',t['id'])
   check(t['id']+': unmodified native controller starts',ready)
   page.wait_for_function('()=>!rigRuntime.getState().presentation.blocksSimulation',polling='raf');page.locator('#arena').focus()
   page.wait_for_function("()=>{const s=rigRuntime.getState();return s.grappleV153 && s.tick-s.grappleV153.bornTick>=36 && s.rigViewsV154.some(r=>r.side==='player'&&r.restraintPoseV156?.gain===1)}",timeout=60000,polling='raf')
   frame=page.evaluate("()=>({state:rigRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})");capture(t['id']+'-native-hold.png',frame,'Actual native CPU grapple; match HP/position/timers unchanged by QA')
   view=next(r for r in frame['state']['rigViewsV154'] if r['side']=='player');check(t['id']+': naturally obtained restraint reaches the reviewed supported lowering',view['restraintPoseV156']['sourceLowering']==t['lowering'] and view['restraintPoseV156']['fullFloorPin'] is False)
   page.keyboard.press('KeyP');frozen=page.evaluate('()=>rigRuntime.getState()');page.wait_for_timeout(200)
   check(t['id']+': pause freezes joints, match and contacts',page.evaluate('()=>rigRuntime.getState()')==frozen)
   if index==0:
    page.emulate_media(reduced_motion='reduce');page.keyboard.press('KeyP');page.wait_for_function("()=>rigRuntime.getState().grappleV153&&!rigRuntime.getState().rigViewsV154.some(v=>v.restraintPoseV156)",polling='raf')
    page.keyboard.press('KeyP');reduced=page.evaluate("()=>({state:rigRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})");capture('native-reduced-motion.png',reduced,'Actual paused hold after reduced-motion preference: source-pose fallback')
    check('Reduced motion removes the procedural lowering without releasing or altering the hold',bool(reduced['state'].get('grappleV153')) and not any(r.get('restraintPoseV156') for r in reduced['state']['rigViewsV154']))
    page.emulate_media(reduced_motion='no-preference')
   page.keyboard.press('KeyP');page.keyboard.down('KeyS')
   page.wait_for_function("()=>Boolean(nativeReceipts.struggle)",polling='raf')
   struggle=page.evaluate('()=>nativeReceipts.struggle');capture(t['id']+'-native-struggle.png',struggle,'Actual guard input after native capture')
   check(t['id']+': actual guard input selects the supported struggle',struggle['state']['grappleV153']['escapeProgress']>0)
   page.wait_for_function("()=>Boolean(nativeReceipts.release)&&rigRuntime.getState().fighters[0].stats.grappleEscapesV153===1",polling='raf');page.keyboard.up('KeyS')
   release=page.evaluate('()=>nativeReceipts.release');capture(t['id']+'-native-release.png',release,'Actual engine release after guard escape; continuous return, not a synthetic result')
   check(t['id']+': ordinary escape drives the continuous rise exactly once',release['state']['fighters'][0]['stats']['grappleEscapesV153']==1 and not release['state'].get('grappleV153') and next(r for r in release['state']['rigViewsV154'] if r['side']=='player')['restraintPoseV156']['stage']=='rising')
   page.locator('#stop').click();stopped=page.evaluate('()=>rigRuntime.getState()');page.wait_for_timeout(100)
   check(t['id']+': stop clears receipts and cannot restart a pose',not stopped['rigViewsV154'] and page.evaluate('()=>rigRuntime.getState()')==stopped)
  check('No browser exception, failed request or HTTP error',not(report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
  report['status']='passed'
 except Exception as error:
  report['status']='failed';report['error']=str(error)
  try:report['failureState']=page.evaluate('()=>window.rigRuntime?.getState()');page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'captures':len(report['captures']),'report':str(out/'report.json')}))
raise SystemExit(0 if report['status']=='passed' else 1)
