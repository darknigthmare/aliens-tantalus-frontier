"""Six prepared native-texture comparisons, then three real CPU receptions.
No actor/HP/position/attack/result/RNG field is injected. The public pause API
freezes the first observed receipt for inspection; browser RAF is unchanged.
This isolated host bypasses unlock menus and proves no canonical or full pin art.
"""
import argparse, base64, hashlib, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
p = argparse.ArgumentParser()
p.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
p.add_argument('--output', type=Path, required=True)
p.add_argument('--fixtures-only', action='store_true')
a = p.parse_args()
out = a.output.resolve()
repo = Path(__file__).resolve().parents[1]
if out == repo or repo in out.parents:
    raise SystemExit('Evidence must be outside the repository')
out.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'scope': 'Six explicit before/after render fixtures on the three exact native sources, four reception beats, both facings; then three native CPU contacts and guard escapes on real browser RAF.',
          'limits': ['Original simulation choreography; no canonical timings or frame1:1 approval.',
                     'No full prone body, floor pin, new painted frame, or substitute identity.',
                     'Isolated controller host bypasses menus/unlocks/rewards; not human gameplay QA.',
                     'The public pause API freezes the first real reception receipt; no scheduler or engine field is rewritten.']}
def check(label, ok, evidence=None):
    assert ok, label
    report['checks'].append({'label': label, 'evidence': evidence})
def capture(name, value, scope):
    image = base64.b64decode(value.pop('png').split(',')[1])
    (out / name).write_bytes(image)
    report['captures'].append({'file': name, 'sha256': hashlib.sha256(image).hexdigest(), 'scope': scope, 'data': value})
HOST = '''<!doctype html><html lang="fr"><meta charset="utf-8"><title>V158 native reception review</title>
<style>body{margin:0;background:#071119;color:#dcebe9;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{padding:14px;margin:10px;min-height:44px}</style>
<canvas id="review" width="2240" height="1280"></canvas><canvas id="arena" width="1000" height="560"></canvas><button id="stop">Fermer</button></html>'''
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    context = browser.new_context(viewport={'width': 2240, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(20000)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    page.on('requestfailed', lambda r: report['requestFailures'].append({'url': r.url, 'failure': r.failure}))
    page.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
    try:
        page.route(a.base.rstrip('/') + '/', lambda route: route.fulfill(status=200, content_type='text/html', body=HOST))
        page.goto(a.base.rstrip('/') + '/', wait_until='domcontentloaded')
        targets = page.evaluate('''async()=>{
          window.R=await import('/src/xeno-trials-rig-v154.js');window.M=await import('/src/xeno-trials-scale-v110.js');window.C=await import('/src/xeno-trials-capture-reception-v158.js');window.sources=new Map();
          for(const r of R.XENO_TRIALS_RIGS_V154){const image=new Image();image.src=r.path;await image.decode();sources.set(r.id,image);}
          window.reviewReception=({id,facing})=>{
            const r=R.XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===id),image=sources.get(r.id),canvas=document.querySelector('#review'),ctx=canvas.getContext('2d'),native=M.getXenoTrialsRenderMetricsV110(id);
            const height=540,width=height*r.sourceWidth/r.sourceHeight,metrics={width,height,pivotX:native.pivotX,bottom:native.bottom};
            ctx.fillStyle='#071119';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='17px monospace';const frames=[];
            for(const [index,seconds]of [.025,.095,.19,.295].entries()){
              const x=280+index*560,cue={clip:'restraint',elapsed:seconds,progress:0,role:'captive',contactDirectionV158:1,facingV158:facing};
              const samples=[R.sampleXenoTrialsRigV154(r,{...cue,contactDirectionV158:undefined}),R.sampleXenoTrialsRigV154(r,cue)];
              const pixels=[],receipts=[];
              for(const [row,frame]of samples.entries()){
                const y=615+row*625;ctx.fillStyle='#8faaa1';ctx.fillRect(x-270,y,540,2);ctx.fillStyle='#dbece7';ctx.fillText((row?'Réception V158 · ':'Base V156 · ')+C.XENO_TRIALS_CAPTURE_RECEPTION_V158.phases[index].id,x-270,row?665:40);
                receipts.push(R.drawXenoTrialsRigV154(ctx,r,image,frame,metrics,x,y,facing));
                pixels.push(ctx.getImageData(index*560,row*625+70,560,550).data);
              }
              let changed=0;for(let i=0;i<pixels[0].length;i+=4)if(pixels[0][i]!==pixels[1][i]||pixels[0][i+1]!==pixels[1][i+1]||pixels[0][i+2]!==pixels[1][i+2]||pixels[0][i+3]!==pixels[1][i+3])changed++;
              frames.push({seconds,phase:samples[1].captureReceptionV158?.phase,changed,baseline:receipts[0],reception:receipts[1]});
            }
            return{fighterId:id,facing,sourcePath:r.path,sourceSha256:r.sourceSha256,frames,png:canvas.toDataURL('image/png')};
          };
          window.frame=()=>({state:r.getState(),png:document.querySelector('#arena').toDataURL('image/png')});
          return C.XENO_TRIALS_CAPTURE_RECEPTION_V158.targets;
        }''')
        check('Exactly the three original target identities and task IDs are admitted', len(targets) == 3 and sorted(t['taskId'] for t in targets) == ['ART153-10', 'ART153-17', 'ART153-24'])
        source_hashes = {}
        for t in targets:
            for facing in [-1, 1]:
                fixture = page.evaluate('x=>reviewReception(x)', {'id': t['fighterId'], 'facing': facing})
                source_hashes[t['fighterId']] = fixture['sourceSha256']
                check(t['fighterId'] + '/' + str(facing) + ': four actual before/after textured beats draw', [v['phase'] for v in fixture['frames']] == ['prise', 'absorption', 'appuis', 'raccord'] and all(v['reception'] and v['reception']['captureReceptionV158']['taskId'] == t['taskId'] for v in fixture['frames']))
                check(t['fighterId'] + '/' + str(facing) + ': every prepared beat changes visible native pixels', all(v['changed'] > 50 for v in fixture['frames']), [v['changed'] for v in fixture['frames']])
                capture(t['fighterId'] + '-comparison-' + str(facing) + '.png', fixture, 'Explicit render fixture: same native image, camera and source hashes; four base-V156/reception-V158 comparisons. Not a claimed gameplay contact.')
        for index, t in enumerate([] if a.fixtures_only else targets):
            started = page.evaluate('''async id=>{
              const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');window.receipts={};window.results=[];window.frozeFirst=false;
              window.r=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),config:{playerId:id,opponentId:'prowler',seed:1,difficulty:'hard',roundSeconds:120},onState:s=>{
                const v=s.rigViewsV154.find(v=>v.side==='player');
                if(v?.captureReceptionV158&&!receipts.reception){receipts.reception=frame();if(!frozeFirst){frozeFirst=true;r.pause();}}
                if(v?.clip==='release'&&!receipts.release)receipts.release=frame();
              },onResult:result=>results.push(structuredClone(result))});
              document.querySelector('#stop').onclick=()=>r.stop();return await r.start();
            }''', t['fighterId'])
            check(t['fighterId'] + ': real CPU controller starts with ordinary health and source images', started)
            first = page.wait_for_function('()=>receipts.reception', polling='raf', timeout=60000).json_value()
            state = first['state']
            view = next(v for v in state['rigViewsV154'] if v['side'] == 'player')
            check(t['fighterId'] + ': actual CPU contact drives the original reception through the real grapple age', bool(state.get('grappleV153')) and abs(view['captureReceptionV158']['seconds'] - (state['tick'] - state['grappleV153']['bornTick']) / 120) < 1e-7 and view['sourceSha256'] == source_hashes[t['fighterId']] and view['captureReceptionV158']['taskId'] == t['taskId'])
            capture(t['fighterId'] + '-native-reception.png', first, 'Actual CPU contact, native browser RAF, ordinary health; public pause API called after this already-rendered receipt.')
            frozen = page.evaluate('()=>r.getState()')
            page.wait_for_timeout(200)
            check(t['fighterId'] + ': pause freezes the reception mesh, joints and authoritative match', frozen['paused'] and page.evaluate('()=>r.getState()') == frozen)
            if index == 0:
                page.emulate_media(reduced_motion='reduce')
                page.locator('#arena').focus()
                page.keyboard.press('KeyP')
                page.wait_for_function("()=>r.getState().grappleV153&&!r.getState().rigViewsV154.some(v=>v.captureReceptionV158)", polling='raf')
                page.keyboard.press('KeyP')
                reduced = page.evaluate('()=>frame()')
                check('Live reduced motion keeps the real hold while removing reception deformation', bool(reduced['state'].get('grappleV153')) and not any(v.get('captureReceptionV158') for v in reduced['state']['rigViewsV154']))
                capture('native-reception-reduced-motion.png', reduced, 'Actual browser motion preference; no actor, result, position, HP or clock rewrite.')
                page.emulate_media(reduced_motion='no-preference')
            page.locator('#arena').focus()
            page.keyboard.press('KeyP')
            page.wait_for_function('()=>{const s=r.getState();return s.grappleV153&&s.tick-s.grappleV153.bornTick>=48}', polling='raf')
            settled = page.evaluate('()=>frame()')
            check(t['fighterId'] + ': finite reception joins the existing supported hold without a lingering clip', not any(v.get('captureReceptionV158') for v in settled['state']['rigViewsV154']) and any(v.get('restraintPoseV156') for v in settled['state']['rigViewsV154']))
            capture(t['fighterId'] + '-native-settled-hold.png', settled, 'Native contact beyond the finite reception; unchanged V156 hold.')
            page.keyboard.down('KeyS')
            page.wait_for_function('()=>Boolean(receipts.release)&&r.getState().fighters[0].stats.grappleEscapesV153===1', polling='raf')
            page.keyboard.up('KeyS')
            release = page.evaluate('()=>receipts.release')
            check(t['fighterId'] + ': ordinary guard escape drives the native release once', release['state']['fighters'][0]['stats']['grappleEscapesV153'] == 1 and not release['state'].get('grappleV153'))
            capture(t['fighterId'] + '-native-release.png', release, 'Actual guard escape; no synthetic result or capture event.')
            page.locator('#stop').click()
            stopped = page.evaluate('()=>r.getState()')
            page.wait_for_timeout(100)
            check(t['fighterId'] + ': stop clears receipts and cannot leave a reception running', not stopped['rigViewsV154'] and page.evaluate('()=>r.getState()') == stopped)
        check('No browser exception, failed request or HTTP error', not (report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            report['failureState'] = page.evaluate('()=>window.r?.getState()')
            page.screenshot(path=str(out / 'failure.png'))
        except Exception:
            pass
    finally:
        (out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        browser.close()
print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'captures': len(report['captures']), 'report': str(out / 'report.json')}))
raise SystemExit(0 if report['status'] == 'passed' else 1)
