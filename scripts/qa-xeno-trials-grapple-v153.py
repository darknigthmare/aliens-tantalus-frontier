"""Native controller integration, NOT an unlock/menu/progression playthrough.
The small HTML host selects an existing human and Prowler via ordinary constructor
config. Actual built modules, sprites, CPU, HP and timers run unchanged afterwards.
No HP/position/clock/meter/result injection. All actions use keyboard or host buttons.
"""
import argparse, base64, json, os, time
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--base',default=os.environ.get('ATF_BASE_URL','http://127.0.0.1:4173'));p.add_argument('--output',type=Path,required=True);args=p.parse_args()
out=args.output.resolve();repo=Path(__file__).resolve().parents[1]
if out==repo or repo in out.parents:raise SystemExit('Evidence must be outside the repository')
out.mkdir(parents=True,exist_ok=True)
report={'status':'running','checks':[],'captures':[],'pageErrors':[],'requestFailures':[],'httpErrors':[],
 'scope':'Native runtime in an isolated HTML test host, not a normal menu/unlock journey or canonical animation.',
 'limitations':['Existing fixed character art. No articulated pin or 1:1 certification.','One human-vs-Prowler browser matchup; three target IDs have separate unit tests.','No saved profile, cloud account, hardware gamepad or phone tested.']}
def check(label,condition,evidence=None):
 assert condition,label
 report['checks'].append({'label':label,'evidence':evidence})
HOST='''<!doctype html><html lang="fr"><meta charset="utf-8"><title>Native Trials restraint test host</title><style>body{margin:0;background:#071119;color:white;font:16px monospace}canvas{display:block;width:100%;height:auto}button{padding:16px;margin:10px}</style><canvas id="arena" width="1000" height="560"></canvas><button id="pause">Pause</button><button id="resume">Reprendre</button><button id="stop">Fermer</button></html>'''
READ='() => window.__grappleRuntime.getState()'
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
 context=browser.new_context(viewport={'width':1200,'height':850},service_workers='block')
 page=context.new_page();page.set_default_timeout(20000)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 page.on('requestfailed',lambda r:report['requestFailures'].append({'url':r.url,'failure':r.failure}))
 page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 try:
  page.route(args.base.rstrip('/')+'/',lambda route:route.fulfill(status=200,content_type='text/html',body=HOST))
  page.goto(args.base.rstrip('/')+'/',wait_until='domcontentloaded')
  ready=page.evaluate('''async () => {
   const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');
   const canvas=document.querySelector('#arena');
   window.__grappleRuntime=createXenoTrialsRuntimeV96({canvas,config:{playerId:'dd-darwin-era-cultist',opponentId:'prowler',difficulty:'hard',roundSeconds:120,seed:153}});
   document.querySelector('#pause').onclick=()=>window.__grappleRuntime.pause();
   document.querySelector('#resume').onclick=()=>window.__grappleRuntime.resume();
   document.querySelector('#stop').onclick=()=>window.__grappleRuntime.stop();
   return await window.__grappleRuntime.start();
  }''')
  check('Native built controller loads the two real admitted sprites',ready)
  page.wait_for_function('() => !window.__grappleRuntime.getState().presentation.blocksSimulation')
  initial=page.evaluate(READ)
  check('Fresh constructor supplies ordinary HP and no existing hold',initial['fighters'][0]['hp']==180 and initial['fighters'][1]['hp']==185 and not initial.get('grappleV153'))
  page.locator('#arena').focus()
  page.wait_for_function('() => !!window.__grappleRuntime.getState().grappleV153',timeout=45000,polling='raf')
  frame=page.evaluate('''() => ({state:window.__grappleRuntime.getState(),png:document.querySelector('#arena').toDataURL('image/png')})''')
  (out/'native-restraint-v153.png').write_bytes(base64.b64decode(frame['png'].split(',')[1]))
  report['captures'].append({'file':'native-restraint-v153.png','state':frame['state']})
  check('CPU closes and captures the human without state injection',frame['state']['grappleV153']['target']=='player' and frame['state']['fighters'][1]['stats'].get('grapplesV153',0)==1)
  page.keyboard.press('KeyP');frozen=page.evaluate(READ)
  check('Pause is accepted while restrained',frozen['paused'] and bool(frozen.get('grappleV153')))
  page.wait_for_timeout(350);check('Pause freezes the entire simulation snapshot',page.evaluate(READ)==frozen)
  page.keyboard.press('KeyP');page.keyboard.down('KeyS');page.keyboard.down('ArrowRight')
  page.wait_for_function('() => (window.__grappleRuntime.getState().grappleV153?.escapeProgress || 0) > 12',polling='raf')
  working=page.evaluate(READ)
  check('Holding the ordinary guard advances the escape, without a mashing shortcut',working['grappleViewV153']['escapeRatio']>0 and working['grappleViewV153']['escapeRatio']<1)
  page.wait_for_function('() => window.__grappleRuntime.getState().fighters[0].stats.grappleEscapesV153 === 1',polling='raf')
  released=page.evaluate(READ)
  check('Escape releases both actors and records exactly one success',not released.get('grappleV153') and any(e.get('reason')=='escaped' for e in released['events']))
  check('Damage is real and bounded rather than immunity during the hold',released['fighters'][0]['hp']<initial['fighters'][0]['hp'] and released['fighters'][0]['hp']>0)
  page.wait_for_timeout(320);after=page.evaluate(READ)
  check('Held movement from the restraint is not replayed after release',after['fighters'][0]['x']==released['fighters'][0]['x'])
  page.keyboard.up('ArrowRight');page.keyboard.up('KeyS');page.keyboard.down('ArrowLeft');page.wait_for_timeout(150);page.keyboard.up('ArrowLeft')
  moving=page.evaluate(READ);check('A fresh key press restores ordinary movement',moving['fighters'][0]['x']<after['fighters'][0]['x'])
  page.keyboard.press('KeyP');page.locator('#arena').screenshot(path=str(out/'native-released-v153.png'));report['captures'].append({'file':'native-released-v153.png','state':page.evaluate(READ)})
  page.locator('#stop').click();stopped=page.evaluate(READ);page.wait_for_timeout(300);check('Closing the native host cannot tick or recreate the hold',page.evaluate(READ)==stopped)
  check('No exception, failed request or HTTP error',not(report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
  report['status']='passed'
 except Exception as error:
  report['status']='failed';report['error']=str(error)
  try:report['failureState']=page.evaluate(READ);page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'report':str(out/'report.json')}))
raise SystemExit(0 if report['status']=='passed' else 1)
