"""Declared pose fixtures + native controller result journey. No post-construction
HP, position, timer, result or meter injection. The four authored meshes remain
adaptations of the project's source plates, not canonical motion capture.
"""
import argparse, base64, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--base',default=os.environ.get('ATF_BASE_URL','http://127.0.0.1:4173'));p.add_argument('--output',type=Path,required=True);a=p.parse_args()
out=a.output.resolve();root=Path(__file__).resolve().parents[1]
if out==root or root in out.parents:raise SystemExit('Evidence must be outside the repository')
out.mkdir(parents=True,exist_ok=True)
report={'status':'running','checks':[],'captures':[],'pageErrors':[],'requestFailures':[],'httpErrors':[],
 'scope':'Twenty declared sequence render fixtures; isolated native controller with real Prowler/cultist and ordinary 1 HP rule. Not the full unlock/reward UI journey.',
 'limitations':['Original source-plate deformation; no new anatomy, full fall, voiced line or canonical certification.','Native result callback is observed, not a real cloud account or deployment.']}
def check(label,ok,evidence=None):
 assert ok,label
 report['checks'].append({'label':label,'evidence':evidence})
def capture(name,frame,scope):
 (out/name).write_bytes(base64.b64decode(frame.pop('png').split(',')[1]));report['captures'].append({'file':name,'scope':scope,'state':frame})
HOST='''<!doctype html><html lang="fr"><meta charset="utf-8"><title>Trials sequences review</title><style>body{margin:0;background:#071119;color:#deeceb;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{min-height:44px;padding:12px;margin:10px}#review[hidden]{display:none}</style><canvas id="review" width="720" height="620" hidden></canvas><canvas id="arena" width="1000" height="560"></canvas><button data-xt="pause" id="pause">Pause</button><button data-xt="resume-overlay" id="resume">Reprendre</button><button data-xt="skip-sequence" id="skip">Passer</button><button id="stop">Fermer</button></html>'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
 context=browser.new_context(viewport={'width':1200,'height':850},service_workers='block');page=context.new_page();page.set_default_timeout(20000)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 page.on('requestfailed',lambda r:report['requestFailures'].append({'url':r.url,'failure':r.failure}))
 page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 try:
  page.route(a.base.rstrip('/')+'/',lambda route:route.fulfill(status=200,content_type='text/html',body=HOST))
  page.goto(a.base.rstrip('/')+'/',wait_until='domcontentloaded')
  entries=page.evaluate('''async()=>{
   window.S=await import('/src/xeno-trials-sequences-v155.js');window.R=await import('/src/xeno-trials-rig-v154.js');window.images=new Map();
   for(const r of R.XENO_TRIALS_RIGS_V154){const image=new Image();image.src=r.path;await image.decode();images.set(r.id,image);}
   window.review=({id,progress,facing,reduced=false})=>{
    const s=S.XENO_TRIALS_SEQUENCES_V155.find(s=>s.id===id),r=R.XENO_TRIALS_RIGS_V154.find(r=>r.id===s.rigId),image=images.get(r.id),canvas=document.querySelector('#review'),ctx=canvas.getContext('2d');
    const height=r.fighterId==='prowler'?400:560,width=height*r.sourceWidth/r.sourceHeight,m={width,height,pivotX:.5,bottom:1};
    const native=()=>{ctx.clearRect(0,0,720,620);ctx.save();ctx.translate(360,590);ctx.scale(facing*r.sourceFacing,1);ctx.drawImage(image,-width*.5,-height,width,height);ctx.restore();};
    native();const baseline=ctx.getImageData(0,0,720,620).data;ctx.clearRect(0,0,720,620);
    const frame=S.sampleXenoTrialsSequenceV155(r,{clip:s.kind,progress,elapsed:progress*s.durationMs/1000},reduced);
    const receipt=R.drawXenoTrialsRigV154(ctx,r,image,frame,m,360,590,facing);if(!receipt)native();
    const after=ctx.getImageData(0,0,720,620).data;let changed=0;for(let i=0;i<after.length;i+=4)if(after[i]!==baseline[i]||after[i+1]!==baseline[i+1]||after[i+2]!==baseline[i+2]||after[i+3]!==baseline[i+3])changed++;
    return{png:canvas.toDataURL('image/png'),receipt,changed,sequence:id,beat:frame.beatV155,progress,facing};
   };
   return S.XENO_TRIALS_SEQUENCES_V155.map(s=>({id:s.id,kind:s.kind}));
  }''')
  check('Twenty exact source-identity sequence definitions',len(entries)==20)
  for s in entries:
   for face in [-1,1]:
    start=page.evaluate('x=>review(x)',{'id':s['id'],'progress':0,'facing':face})
    mid=page.evaluate('x=>review(x)',{'id':s['id'],'progress':.24,'facing':face})
    end=page.evaluate('x=>review(x)',{'id':s['id'],'progress':1,'facing':face})
    check(s['id']+' / '+str(face)+': neutral entry, real deformation and correct endpoint',start['changed']==0 and mid['changed']>50 and bool(mid['receipt']) and (end['changed']>50 if s['kind'].startswith('outro-') else end['changed']==0))
    if s['kind'] in ['intro','outro-win','outro-loss'] and face==1:capture(s['id'].replace('::','-')+'.png',mid,'Explicit key-sequence render fixture')
   reduced=page.evaluate('x=>review(x)',{'id':s['id'],'progress':.24,'facing':1,'reduced':True})
   check(s['id']+': reduced motion exactly preserves native pixels',reduced['changed']==0 and reduced['receipt'] is None)
  ready=page.evaluate('''async()=>{
   const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');window.results=[];
   window.r=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),config:{playerId:'dd-darwin-era-cultist',opponentId:'prowler',seed:155,difficulty:'hard',rulesV119:{initialHp:1},roundSeconds:30},onResult:x=>results.push(structuredClone(x))});
   for(const [id,method] of [['pause','pause'],['resume','resume'],['skip','skipSequence'],['stop','stop']])document.querySelector('#'+id).onclick=()=>r[method]();
   return await r.start();
  }''')
  check('Native controller starts on the real source images',ready)
  page.wait_for_function("()=>r.getState().rigViewsV154.some(v=>v.sequenceIdV155?.endsWith('::intro'))",polling='raf')
  page.locator('#skip').click();check('UI skip moves to the second entry without consuming a match tick',page.evaluate("()=>r.getState().presentation.phase==='intro-opponent'&&r.getState().tick===0"))
  page.locator('#skip').click();check('The mandatory countdown remains after both skips',page.evaluate("()=>r.getState().presentation.phase==='countdown'&&r.getState().tick===0"))
  page.wait_for_function("()=>r.getState().phase==='match-over'&&r.getState().outroV155?.phase==='playing'",polling='raf',timeout=60000)
  page.keyboard.press('KeyP');frozen=page.evaluate('()=>r.getState()')
  check('Final result is emitted before the skippable animation completes',page.evaluate('()=>results.length===1') and frozen['outroV155']['phase']=='playing')
  page.wait_for_timeout(250);check('Keyboard pause freezes the terminal timeline and match',page.evaluate('()=>r.getState()')==frozen)
  page.keyboard.press('KeyP')
  page.wait_for_function("()=>r.getState().outroV155.elapsedMs>=300&&r.getState().rigViewsV154.some(v=>v.sequenceIdV155?.endsWith('::outro-win'))",polling='raf')
  page.keyboard.press('KeyP')
  frame=page.evaluate("()=>({state:r.getState(),results:structuredClone(results),png:document.querySelector('#arena').toDataURL('image/png')})")
  check('Both terminal reactions are drawn and physical combat remains frozen',len(frame['state']['rigViewsV154'])==2 and frame['state']['tick']==frozen['tick'] and frame['state']['fighters']==frozen['fighters'])
  capture('native-outro-paused-v155.png',frame,'Native CPU outcome, paused by keyboard; no result/HP injection')
  page.keyboard.press('KeyP');page.locator('#skip').click()
  ended=page.evaluate('()=>r.getState()');check('Skip settles the terminal pose without restarting or re-paying',ended['outroV155']['phase']=='complete' and ended['outroV155']['skipped'] and page.evaluate('()=>results.length===1&&r.resume()===false'))
  page.wait_for_timeout(250);check('No frame-rate work after final completion',page.evaluate('()=>r.getState()')==ended)
  capture('native-outro-complete-v155.png',page.evaluate("()=>({state:r.getState(),png:document.querySelector('#arena').toDataURL('image/png')})"),'Native terminal pose after explicit skip')
  page.locator('#stop').click();check('Close clears terminal and rig receipts',page.evaluate('()=>r.getState().outroV155===null&&r.getState().rigViewsV154.length===0'))
  check('No browser exception, failed request or HTTP error',not(report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
  report['status']='passed'
 except Exception as e:
  report['status']='failed';report['error']=str(e)
  try:report['failureState']=page.evaluate('()=>window.r?.getState()');page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'report':str(out/'report.json')}))
raise SystemExit(0 if report['status']=='passed' else 1)
