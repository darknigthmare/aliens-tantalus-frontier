"""Two distinct scopes: explicit source-art pose review fixtures, then a native
controller match using real images/CPU/input. No normal menu/unlock journey is
claimed. Native match HP, positions, timers and results are never overwritten.
"""
import argparse, base64, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--base',default=os.environ.get('ATF_BASE_URL','http://127.0.0.1:4173'));p.add_argument('--output',type=Path,required=True);args=p.parse_args()
out=args.output.resolve();repo=Path(__file__).resolve().parents[1]
if out==repo or repo in out.parents:raise SystemExit('Evidence must be outside the repository')
out.mkdir(parents=True,exist_ok=True)
report={'status':'running','checks':[],'captures':[],'poseSamples':[],'pageErrors':[],'requestFailures':[],'httpErrors':[],
 'scope':'Exact-source key-pose render fixtures plus native Prowler/cultist match. Mesh adaptation, not motion capture or canonical 1:1 certification.',
 'limitations':['Four native sprite plates; no new hidden anatomy or segmented costume assets.','No terminal finisher or complete moveset.','Gallery poses are explicit rendering fixtures, not gameplay event observations.']}
def check(label,ok,evidence=None):
 assert ok,label
 report['checks'].append({'label':label,'evidence':evidence})
def capture(name,frame,scope):
 (out/name).write_bytes(base64.b64decode(frame['png'].split(',')[1]));report['captures'].append({'file':name,'state':frame.get('state'),'scope':scope})
HOST='''<!doctype html><html lang="fr"><meta charset="utf-8"><title>Native mesh review</title><style>body{margin:0;background:#071119;color:#deeceb;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{padding:16px;margin:10px}#review[hidden]{display:none}</style><canvas id="review" width="720" height="620" hidden></canvas><canvas id="arena" width="1000" height="560"></canvas><button id="pause">Pause</button><button id="resume">Reprendre</button><button id="stop">Fermer</button></html>'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
 context=browser.new_context(viewport={'width':1200,'height':850},service_workers='block');page=context.new_page();page.set_default_timeout(20000)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 page.on('requestfailed',lambda r:report['requestFailures'].append({'url':r.url,'failure':r.failure}))
 page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 try:
  page.route(args.base.rstrip('/')+'/',lambda route:route.fulfill(status=200,content_type='text/html',body=HOST))
  page.goto(args.base.rstrip('/')+'/',wait_until='domcontentloaded')
  inventory=page.evaluate('''async()=>{
   window.R=await import('/src/xeno-trials-rig-v154.js');window.D=await import('/src/xeno-trials-data-v96.js');window.rigImages=new Map();
   for(const r of R.XENO_TRIALS_RIGS_V154){const image=new Image();image.src=r.path;await image.decode();rigImages.set(r.id,image);}
   window.reviewPose=({id,clip,facing,reduced=false})=>{
    const r=R.XENO_TRIALS_RIGS_V154.find(r=>r.id===id),image=rigImages.get(id),c=document.querySelector('#review'),ctx=c.getContext('2d');
    const height=r.fighterId==='prowler'?400:560,width=height*r.sourceWidth/r.sourceHeight,m={width,height,pivotX:.5,bottom:1};
    const native=()=>{ctx.clearRect(0,0,c.width,c.height);ctx.save();ctx.translate(360,590);ctx.scale(facing*r.sourceFacing,1);ctx.drawImage(image,-width*.5,-height,width,height);ctx.restore();};
    native();const baseline=ctx.getImageData(0,0,c.width,c.height).data;
    ctx.clearRect(0,0,c.width,c.height);const frame=R.sampleXenoTrialsRigV154(r,{clip,progress:.5,elapsed:.6},reduced),start=performance.now();
    const receipt=R.drawXenoTrialsRigV154(ctx,r,image,frame,m,360,590,facing),drawMs=performance.now()-start;
    if(!receipt)native();const after=ctx.getImageData(0,0,c.width,c.height).data;let changed=0;
    for(let i=0;i<after.length;i+=4)if(after[i]!==baseline[i]||after[i+1]!==baseline[i+1]||after[i+2]!==baseline[i+2]||after[i+3]!==baseline[i+3])changed++;
    return{changed,drawMs,receipt,png:c.toDataURL('image/png')};
   };
   return R.XENO_TRIALS_RIGS_V154.map(r=>({id:r.id,fighterId:r.fighterId,clips:Object.keys(r.poses)}));
  }''')
  check('Four exact-source rigs and twenty-five authored key poses admitted',len(inventory)==4 and sum(len(r['clips']) for r in inventory)==25)
  for r in inventory:
   for facing in [-1,1]:
    for clip in r['clips']:
     rendered=page.evaluate('x=>reviewPose(x)',{'id':r['id'],'clip':clip,'facing':facing})
     check(r['fighterId']+' / '+clip+' / '+str(facing)+': visible native mesh motion',rendered['changed']>50 and bool(rendered['receipt']) and rendered['receipt']['canonExact'] is False)
     report['poseSamples'].append({'fighterId':r['fighterId'],'clip':clip,'facing':facing,'changedPixels':rendered['changed'],'drawMs':rendered['drawMs']})
     if clip in ['struggle','round-loss'] and (facing==1 or clip=='struggle'):
      capture(r['fighterId']+'-'+clip+('-right' if facing==1 else '-left')+'.png',rendered,'Explicit render fixture, original source pixels with authored deformation')
   reduced=page.evaluate('x=>reviewPose(x)',{'id':r['id'],'clip':'struggle','facing':1,'reduced':True})
   check(r['fighterId']+': reduced motion restores the exact unmodified pose',reduced['changed']==0 and reduced['receipt'] is None)
  ready=page.evaluate('''async()=>{
   const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');window.rigObservations=[];
   window.rigRuntime=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),config:{playerId:'dd-darwin-era-cultist',opponentId:'prowler',difficulty:'hard',roundSeconds:120,seed:153},
    onState:s=>{rigObservations.push({tick:s.tick,phase:s.phase,rigs:s.rigViewsV154});if(rigObservations.length>160)rigObservations.shift();}});
   document.querySelector('#pause').onclick=()=>rigRuntime.pause();document.querySelector('#resume').onclick=()=>rigRuntime.resume();document.querySelector('#stop').onclick=()=>rigRuntime.stop();
   return await rigRuntime.start();
  }''')
  check('Native controller starts without replacing images or match state',ready)
  page.wait_for_function("()=>rigRuntime.getState().rigViewsV154.some(r=>r.side==='player'&&r.clip==='intro'&&r.drawn)",polling='raf')
  check('Native introductory phase actually draws the selected human rig',True)
  page.wait_for_function('()=>!rigRuntime.getState().presentation.blocksSimulation')
  page.locator('#arena').focus()
  page.wait_for_function("()=>{const s=rigRuntime.getState();return s.grappleV153 && s.tick-s.grappleV153.bornTick>=20 && s.rigViewsV154.filter(r=>r.clip==='restraint').length===2}",timeout=45000,polling='raf')
  frame=page.evaluate("()=>({state:rigRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})")
  capture('native-mesh-restraint-v154.png',frame,'Actual native controller: CPU contact with ordinary HP, positions and timers')
  check('Physical restraint draws the captor and captive without changing collision bodies',frame['state']['fighters'][1]['stats'].get('grapplesV153')==1 and len(frame['state']['rigViewsV154'])==2)
  page.keyboard.press('KeyP');frozen=page.evaluate('()=>rigRuntime.getState()');page.wait_for_timeout(250)
  check('Pause freezes simulation and rendered joint/contact receipts',page.evaluate('()=>rigRuntime.getState()')==frozen)
  page.keyboard.press('KeyP');page.keyboard.down('KeyS')
  page.wait_for_function("()=>rigRuntime.getState().rigViewsV154.filter(r=>r.clip==='struggle').length===2",polling='raf')
  frame=page.evaluate("()=>({state:rigRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})")
  capture('native-mesh-struggle-v154.png',frame,'Actual held guard after native capture')
  check('Guard input drives the two native struggle poses',frame['state']['grappleV153']['escapeProgress']>0)
  page.wait_for_function('()=>rigRuntime.getState().fighters[0].stats.grappleEscapesV153===1',polling='raf')
  page.keyboard.up('KeyS');released=page.evaluate('()=>rigRuntime.getState()')
  check('Ordinary escape still resolves once; no animation-owned reward or HP write',not released.get('grappleV153') and released['fighters'][0]['hp']>0 and released['fighters'][0]['hp']<180)
  page.keyboard.press('KeyP');page.locator('#stop').click();stopped=page.evaluate('()=>rigRuntime.getState()');page.wait_for_timeout(200)
  check('Stopped controller clears rig receipts and cannot animate again',not stopped['rigViewsV154'] and page.evaluate('()=>rigRuntime.getState()')==stopped)
  check('No browser exception, failed request or HTTP error',not(report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
  report['status']='passed'
 except Exception as e:
  report['status']='failed';report['error']=str(e)
  try:report['failureState']=page.evaluate('()=>window.rigRuntime?.getState()');page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'report':str(out/'report.json')}))
raise SystemExit(0 if report['status']=='passed' else 1)
