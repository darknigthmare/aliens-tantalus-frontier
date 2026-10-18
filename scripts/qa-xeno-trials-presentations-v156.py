"""Three explicitly separate scopes: twenty declared render fixtures, a real
CPU/keyboard controller duel including the V157 spatial exit, and a deterministic engine-only draw fixture.
No actor, HP, result, position, timer, meter or RNG is rewritten after creation.
No menu/unlock/save journey or canonical 1:1 animation is claimed.
"""
import argparse, base64, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

p = argparse.ArgumentParser()
p.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
p.add_argument('--output', type=Path, required=True)
a = p.parse_args()
out = a.output.resolve()
repo = Path(__file__).resolve().parents[1]
if out == repo or repo in out.parents:
    raise SystemExit('Evidence must be outside the repository')
out.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'scope': '20 exact-source presentation definitions plus 16 V157 exit-step render fixtures; native CPU/keyboard duel with finite spatial exit; separately declared engine-only draw fixture.',
          'limitations': ['Four admitted source plates only; zero canonical or artistic completion certification.',
                         'Native duel uses the ordinary 1 HP rule selected at construction. No cloud reward or menu journey.',
                         'Draw is an engine-only deterministic no-input fixture, not an asserted native CPU outcome.',
                         'V157 exit is a bounded native-mesh adaptation, not complete locomotion. Prowler steps only the rear supports; turning is a stationary facing cross-dissolve.']}


def check(label, ok, evidence=None):
    assert ok, label
    report['checks'].append({'label': label, 'evidence': evidence})


def capture(name, frame, scope):
    (out / name).write_bytes(base64.b64decode(frame.pop('png').split(',')[1]))
    report['captures'].append({'file': name, 'scope': scope, 'state': frame})


HOST = '''<!doctype html><html lang="fr"><meta charset="utf-8"><title>Trials V156 review</title>
<style>body{margin:0;background:#071119;color:#deeceb;font:16px monospace}canvas{display:block;max-width:100%;height:auto}button{min-height:44px;padding:12px;margin:10px}#review[hidden]{display:none}</style>
<canvas id="review" width="720" height="620" hidden></canvas><canvas id="arena" width="1000" height="560"></canvas>
<button data-xt="pause" id="pause">Pause</button><button data-xt="resume-overlay" id="resume">Reprendre</button>
<button data-xt="skip-sequence" id="skip">Passer</button><button data-xt="taunt" id="taunt">T · Défi</button><button id="stop">Fermer</button></html>'''

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    context = browser.new_context(viewport={'width': 1200, 'height': 850}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(20000)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    page.on('requestfailed', lambda r: report['requestFailures'].append({'url': r.url, 'failure': r.failure}))
    page.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
    try:
        page.route(a.base.rstrip('/') + '/', lambda route: route.fulfill(status=200, content_type='text/html', body=HOST))
        page.goto(a.base.rstrip('/') + '/', wait_until='domcontentloaded')
        entries = page.evaluate('''async()=>{
          window.S=await import('/src/xeno-trials-sequences-v155.js');window.R=await import('/src/xeno-trials-rig-v154.js');window.M=await import('/src/xeno-trials-scale-v110.js');window.images=new Map();
          for(const r of R.XENO_TRIALS_RIGS_V154){const image=new Image();image.src=r.path;await image.decode();images.set(r.id,image);}
          window.review=({id,progress,facing,reduced=false,cue=null})=>{
            const s=S.XENO_TRIALS_SEQUENCES_V156.find(s=>s.id===id),r=R.XENO_TRIALS_RIGS_V154.find(r=>r.id===s.rigId),image=images.get(r.id),canvas=document.querySelector('#review'),ctx=canvas.getContext('2d');
            const height=r.fighterId==='prowler'?400:560,width=height*r.sourceWidth/r.sourceHeight,m={width,height,pivotX:.5,bottom:1};
            const native=()=>{ctx.clearRect(0,0,720,620);ctx.save();ctx.translate(360,590);ctx.scale(facing*r.sourceFacing,1);ctx.drawImage(image,-width*.5,-height,width,height);ctx.restore();};
            native();const baseline=ctx.getImageData(0,0,720,620).data;ctx.clearRect(0,0,720,620);
            const sampled=cue||{clip:s.kind,progress,elapsed:progress*s.durationMs/1000,opponentFamily:'human'};
            const frame=S.sampleXenoTrialsSequenceV155(r,sampled,reduced);
            const receipt=R.drawXenoTrialsRigV154(ctx,r,image,frame,m,360,590,facing);if(!receipt)native();
            const after=ctx.getImageData(0,0,720,620).data;let changed=0;for(let i=0;i<after.length;i+=4)if(after[i]!==baseline[i]||after[i+1]!==baseline[i+1]||after[i+2]!==baseline[i+2]||after[i+3]!==baseline[i+3])changed++;
            return{png:canvas.toDataURL('image/png'),receipt,changed,sequence:id,beat:frame.beatV155,progress:sampled.progress,facing};
          };
          window.reviewExit=({id,direction,distance})=>{
            const rig=R.XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===id),image=images.get(rig.id),canvas=document.querySelector('#review'),ctx=canvas.getContext('2d');
            const native=M.getXenoTrialsRenderMetricsV110(id),height=rig.fighterId==='prowler'?400:560,width=height*rig.sourceWidth/rig.sourceHeight,m={width,height,pivotX:native.pivotX,bottom:native.bottom};
            const view={rigId:rig.id,distance,stride:id==='prowler'?20:40,footLift:id==='prowler'?2:3.2};
            const pose=R.sampleXenoTrialsExitPoseV157(rig,view,m);
            ctx.clearRect(0,0,720,620);ctx.fillStyle='#071119';ctx.fillRect(0,0,720,620);ctx.fillStyle='#8baa9b';ctx.fillRect(0,590,720,2);
            const receipt=R.drawXenoTrialsRigV154(ctx,rig,image,pose,m,360+direction*distance,590,direction);
            return{png:canvas.toDataURL('image/png'),fighterId:id,direction,distance,receipt,pose:pose?.exitPoseV157,canonExact:false,fullLocomotion:false};
          };
          window.frame=()=>({state:r.getState(),results:structuredClone(results),png:document.querySelector('#arena').toDataURL('image/png')});
          window.physical=s=>JSON.stringify({tick:s.tick,time:s.timeRemaining,result:s.result,fighters:s.fighters,events:s.events,wins:s.wins,rng:s.rng,projectiles:s.projectiles});
          return S.XENO_TRIALS_ADDED_SEQUENCES_V156.map(s=>({id:s.id,kind:s.kind}));
        }''')
        check('Prepared fixture scope: exactly20 newly admitted exact-identity definitions', len(entries) == 20)
        for seq in entries:
            for face in [-1, 1]:
                start = page.evaluate('x=>review(x)', {'id': seq['id'], 'progress': 0, 'facing': face})
                mid = page.evaluate('x=>review(x)', {'id': seq['id'], 'progress': .47, 'facing': face})
                end = page.evaluate('x=>review(x)', {'id': seq['id'], 'progress': 1, 'facing': face})
                initial_ok = start['changed'] > 50 if seq['kind'] == 'outro' else start['changed'] == 0
                check(seq['id'] + '/' + str(face) + ': prepared keyed movement and neutral endpoint', initial_ok and mid['changed'] > 50 and bool(mid['receipt']) and end['changed'] == 0)
                if face == 1:
                    capture(seq['id'].replace('::', '-') + '.png', mid, 'Prepared sequence render fixture; not a gameplay event')
            reduced = page.evaluate('x=>review(x)', {'id': seq['id'], 'progress': .47, 'facing': 1, 'reduced': True})
            check(seq['id'] + ': reduced fixture restores exact native pixels', reduced['changed'] == 0 and reduced['receipt'] is None)

        for rig_id in ['prowler', 'dd-darwin-era-cultist', 'import-game-dd-wy-commando', 'import-game-dd-guardian']:
            stride = 20 if rig_id == 'prowler' else 40
            for direction in [-1, 1]:
                for beat, fraction in [('stance', .12), ('swing', .4)]:
                    stepped = page.evaluate('x=>reviewExit(x)', {'id': rig_id, 'direction': direction, 'distance': stride * fraction})
                    check(rig_id + '/' + str(direction) + '/' + beat + ': exact native mesh draws bounded exit step', bool(stepped['receipt']) and stepped['receipt']['clip'] == 'spatial-exit-v157' and stepped['pose']['bodyDrop'] <= 1.51)
                    capture('fixture-exit-v157-' + rig_id + '-' + str(direction) + '-' + beat + '.png', stepped, 'Prepared exact-source V157 exit render fixture; not a combat outcome or full locomotion certification')

        ready = page.evaluate('''async()=>{
          const {createXenoTrialsRuntimeV96}=await import('/src/xeno-trials-runtime-v96.js');window.results=[];window.firstTerminalPhysical=null;
          window.r=createXenoTrialsRuntimeV96({canvas:document.querySelector('#arena'),config:{playerId:'dd-darwin-era-cultist',opponentId:'prowler',seed:155,difficulty:'hard',rulesV119:{initialHp:1},roundSeconds:30},
            onState:s=>{if(s.phase==='match-over'&&!firstTerminalPhysical)firstTerminalPhysical=physical(s);},onResult:x=>results.push(structuredClone(x))});
          for(const [id,method] of [['pause','pause'],['resume','resume'],['skip','skipSequence'],['taunt','taunt'],['stop','stop']])document.querySelector('#'+id).onclick=()=>r[method]();
          return await r.start();
        }''')
        check('Native controller scope: ordinary1HP ticket starts with real source images', ready)
        rival = page.wait_for_function("()=>r.getState().rigViewsV154.some(v=>v.sequenceIdV156?.endsWith('::intro-rival'))?frame():null", polling='raf').json_value()
        check('Native responding rig uses the actual opponent introduction', rival['state']['presentation']['fighterSlot'] == 0 and rival['state']['tick'] == 0)
        capture('native-intro-rival-v156.png', rival, 'Native CPU controller initial introduction; PNG and state captured in one browser task')
        page.locator('#skip').click()
        page.locator('#skip').click()
        check('Skipping both entries preserves the mandatory countdown', page.evaluate("()=>r.getState().presentation.phase==='countdown'&&r.getState().tick===0"))
        page.wait_for_function('()=>r.getState().canTauntV156', polling='raf')
        page.locator('#arena').focus()
        page.keyboard.press('KeyT')
        challenged = page.wait_for_function("()=>{const s=r.getState();return s.tauntV156?.phase==='playing'&&s.tauntV156.elapsedMs>=100&&s.rigViewsV154.some(v=>v.sequenceIdV156?.endsWith('::taunt'))?frame():null}", polling='raf').json_value()
        check('Real keyboardT drives the admitted player sequence while combat ticks continue', challenged['state']['tick'] > 0 and challenged['state']['tauntV156']['elapsedMs'] >= 100)
        capture('native-taunt-keyboard-v156.png', challenged, 'Native keyboard commandT; combat remains active')
        page.keyboard.press('KeyP')
        paused = page.evaluate('()=>frame()')
        check('Keyboard pause occurs during the real taunt', paused['state']['paused'] and paused['state']['tauntV156']['phase'] == 'playing')
        frozen = paused['state']
        capture('native-taunt-paused-v156.png', paused, 'Native keyboardP duringT; one-task PNG/state receipt')
        page.wait_for_timeout(250)
        check('Pause freezes both physical combat and the independent taunt clock', page.evaluate('()=>r.getState()') == frozen)
        page.keyboard.press('KeyP')
        page.emulate_media(reduced_motion='reduce')
        page.wait_for_function("()=>r.getState().tauntV156?.reducedMotion&&r.getState().tauntV156.phase==='complete'", polling='raf')
        reduced = page.evaluate('()=>frame()')
        check('Live reduced-motion preference ends the taunt without stopping active combat', reduced['state']['phase'] == 'active' and not any(v.get('sequenceIdV156', '').endswith('::taunt') for v in reduced['state']['rigViewsV154']))
        capture('native-taunt-reduced-v156.png', reduced, 'Native browser reduced-motion preference; no pose injection')
        page.emulate_media(reduced_motion='no-preference')
        check('Restoring motion does not resurrect the completed taunt', page.evaluate("()=>r.getState().tauntV156.phase==='complete'"))
        page.wait_for_function('()=>r.getState().canTauntV156', polling='raf')
        page.locator('#taunt').click()
        check('The explicit button invokes the same real presentation command', page.evaluate("()=>r.getState().tauntV156.phase==='playing'"))
        page.locator('#arena').focus()
        page.keyboard.down('ArrowRight')
        cancelled = page.wait_for_function("()=>r.getState().tauntV156?.phase==='cancelled'?frame():null", polling='raf').json_value()
        page.keyboard.up('ArrowRight')
        check('A real movement press cancels the visual challenge', cancelled['state']['tauntV156']['phase'] == 'cancelled' and cancelled['state']['fighters'][0]['previousInput']['right'])
        capture('native-taunt-movement-cancel-v156.png', cancelled, 'Native ArrowRight cancelsT; no actor displacement injection')
        rematch = page.wait_for_function("()=>r.getState().rigViewsV154.some(v=>v.sequenceIdV156?.endsWith('::rematch'))?frame():null", polling='raf', timeout=60000).json_value()
        check('A real completed round resets the engine then presents the next-round countdown', rematch['state']['round'] >= 2 and rematch['state']['presentation']['phase'] == 'countdown')
        capture('native-rematch-v156.png', rematch, 'Actual CPU round outcome and engine-owned next round')
        exit_frame = page.wait_for_function("()=>{const s=r.getState();return s.terminalV156?.kind==='outro'&&s.terminalV156.phase==='playing'&&s.terminalV156.elapsedMs>=60&&s.rigViewsV154.some(v=>v.sequenceIdV156?.endsWith('::outro'))?frame():null}", polling='raf', timeout=60000).json_value()
        check('The native terminal exit follows a delivered result without changing the completed engine', len(exit_frame['results']) == 1 and page.evaluate('()=>physical(r.getState())===firstTerminalPhysical'))
        capture('native-outro-v156.png', exit_frame, 'Actual CPU final result; short exit observed atomically from state and canvas')
        spatial = page.wait_for_function("()=>{const s=r.getState();return s.exitV157?.phase==='playing'&&s.exitViewsV157.some(v=>v.distance>20)&&s.rigViewsV154.some(v=>v.exitV157?.stepped)?frame():null}", polling='raf', timeout=30000).json_value()
        check('V157 native CPU result leads to real render travel with fixed engine coordinates and a single result', len(spatial['results']) == 1 and page.evaluate('()=>physical(r.getState())===firstTerminalPhysical') and any(abs(v['x'] - v['startX']) > 20 for v in spatial['state']['exitViewsV157']))
        capture('native-spatial-exit-v157.png', spatial, 'Native CPU result; detached render travel; no actor, HP, outcome or RNG write')
        page.locator('#arena').focus()
        page.keyboard.press('KeyP')
        paused_exit = page.evaluate('()=>frame()')
        frozen_exit = paused_exit['state']
        check('Native P pauses the actual spatial exit', frozen_exit['paused'] and frozen_exit['exitV157']['phase'] == 'playing')
        capture('native-spatial-exit-paused-v157.png', paused_exit, 'Native keyboard pause during real render travel')
        page.wait_for_timeout(250)
        check('Paused native exit retains the exact camera, support coordinates, engine and result', page.evaluate('()=>r.getState()') == frozen_exit)
        page.keyboard.press('KeyP')
        page.wait_for_function("()=>r.getState().exitV157?.phase==='complete'", polling='raf', timeout=30000)
        ended = page.evaluate('()=>r.getState()')
        check('All admitted native participants reach offscreen and leave no standing rendered sprite', all(not v['visible'] for v in ended['exitViewsV157']) and not ended['rigViewsV154'])
        end_capture = page.evaluate('()=>frame()')
        capture('native-spatial-exit-complete-v157.png', end_capture, 'Native finite exit endpoint; empty arena and one engine-owned verdict')
        page.wait_for_timeout(250)
        check('Finite exit stops all further frames and cannot emit a second result', page.evaluate('()=>r.getState()') == ended and page.evaluate('()=>results.length===1&&r.resume()===false&&physical(r.getState())===firstTerminalPhysical'))
        page.locator('#stop').click()
        check('Closing clears taunt, terminal presentation and rendered receipts', page.evaluate('()=>r.getState().tauntV156===null&&r.getState().terminalV156===null&&r.getState().exitV157===null&&r.getState().rigViewsV154.length===0'))

        draws = page.evaluate('''async()=>{
          const E=await import('/src/xeno-trials-engine-v96.js');
          const m=E.createXenoTrialsMatchV96({playerId:'dd-darwin-era-cultist',opponentId:'prowler',introSeconds:0,roundSeconds:15,roundsToWin:1,holdRoundTransition:true,seed:156});
          const observations=[];let roundFrame=null;
          for(let round=1;round<=3;round++){
            for(let i=0;i<2000&&m.phase==='active';i++)E.stepXenoTrialsMatchV96(m,.1,{},{});
            observations.push({round:m.round,phase:m.phase,winner:m.roundWinner,reason:m.roundReason,wins:{...m.wins},tick:m.tick});
            if(m.phase==='round-over'){
              E.stepXenoTrialsMatchV96(m,.4,{},{});
              if(!roundFrame){const r=R.XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===m.fighters[0].id),cue=S.getXenoTrialsSequenceCueV156(r,m,m.fighters[0],null);roundFrame={...review({id:r.fighterId+'::draw',facing:1,cue}),engine:E.getXenoTrialsSnapshotV96(m)};}
              if(!E.nextXenoTrialsRoundV96(m))throw new Error('Real drawn round failed to reset');
            }
          }
          if(m.phase!=='match-over'||m.result?.winner!=='draw')throw new Error('No natural engine-only draw');
          const before=JSON.stringify(m);let t=S.createXenoTrialsTerminalV156(m,'draw');t=S.advanceXenoTrialsOutroV155(t,100);t=S.advanceXenoTrialsOutroV155(t,100);
          const r=R.XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===m.fighters[0].id),cue=S.getXenoTrialsSequenceCueV156(r,m,m.fighters[0],null,t);
          const terminalFrame={...review({id:r.fighterId+'::draw',facing:1,cue}),engine:E.getXenoTrialsSnapshotV96(m),terminal:t};
          return{observations,roundFrame,terminalFrame,physicalUnchanged:JSON.stringify(m)===before};
        }''')
        check('Declared engine-only fixture yields three real time-limit draws with no winner points', len(draws['observations']) == 3 and all(v['winner'] == 'draw' and v['reason'] == 'time' and v['wins'] == {'player': 0, 'opponent': 0} for v in draws['observations']))
        check('Engine-only round draw actually selects the draw sequence', bool(draws['roundFrame']['receipt']) and draws['roundFrame']['receipt']['clip'] == 'draw')
        capture('fixture-engine-round-draw-v156.png', draws['roundFrame'], 'Declared deterministic engine-only fixture: neutral inputs for both sides; no CPU/menu journey')
        check('Engine-only terminal recovery preserves the true completed draw and all physical data', draws['physicalUnchanged'] and bool(draws['terminalFrame']['receipt']) and draws['terminalFrame']['engine']['result']['winner'] == 'draw')
        capture('fixture-engine-terminal-draw-v156.png', draws['terminalFrame'], 'Declared engine-only final draw; unchanged engine sampled into the presentation renderer')
        check('No browser exception, failed request or HTTP error', not (report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
        report['status'] = 'passed'
    except Exception as e:
        report['status'] = 'failed'
        report['error'] = str(e)
        try:
            report['failureState'] = page.evaluate('()=>window.r?.getState()')
            page.screenshot(path=str(out / 'failure.png'))
        except Exception:
            pass
    finally:
        (out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        browser.close()
print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'report': str(out / 'report.json')}))
raise SystemExit(0 if report['status'] == 'passed' else 1)
