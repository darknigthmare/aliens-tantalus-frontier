"""Native BISHOP journey: disclosed 05h profile, real 4h command, paired door,
durable mid-door reload, annex conversation, return with occupied destination.
Evaluations observe actual engine/canvas only; no state/clock/RAF writes.
"""
import argparse
import base64
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Production app and disclosed 05h laboratory profile imported through Save picker; native strategy commands advance to09h and12h; keyboard walking, E conversation, paired portal, occupied doorway, actual exit/reload/resume. Engine evaluations only observe.',
          'limitations': ['Automated native controls and screenshots, not human participants.',
                         'One BISHOP laboratory/synthetic-bay route; no lift, quarantine or other annex journey claimed.',
                         'The four hours spent in a native strategy command are not four hours of observed crew travel.',
                         'Closed-door coordinate handoff is an explicit portal, not drawn back-facing locomotion.',
                         'Native routine handoff after arrival preserves other duties; its subsequent travel is not observed.',
                         'Static captures and technical tests do not establish canonical motion or artistic1:1 approval.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


OBSERVE = '''() => {
 const h=__ATF_HUB__,snap=h.getSnapshot(),r=snap.npcAnnexCirculationV159,a=h.npcAnnexActorV159;
 const annex=h.currentAnnexV71?.()?.id||null;
 const visible=annex?h.activeAnnexNpcsV141():h.npcs;
 return {route:structuredClone(r),running:h.running,deck:h.state.deck,annex,
  player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health},
  camera:{...h.camera},clock:structuredClone(h.npcRoutineContextV62.clock),
  actualActor:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,vx:a.vx,facing:a.facing}:null,
  visibleCount:visible.filter(n=>n.crewId==='crew-05-bishop-9').length,
  visibleSingleton:visible.filter(n=>n.crewId==='crew-05-bishop-9').every(n=>n===a),
  presentation:structuredClone(snap.roomPresentationV119),
  interaction:structuredClone(h.hubNpcInteractions['crew-05-bishop-9']||null),
  prompt:h.statusPrompt(),action:h.nearestInteraction()?.action||null,
  doors:[...(h.hubDoorDrawsV142?.values()||[])].filter(d=>d.annexId==='synthetic-bay'),
  strategy:{serial:__ATF_V51__.saveSystem.data.strategy.serial,actions:__ATF_V51__.saveSystem.data.statistics.strategicActions}};
}'''


def observed(page):
    return page.evaluate(OBSERVE)


def capture(page, name):
    page.locator('#hub-canvas').screenshot(path=str(output / name))
    report['captures'].append(name)


def open_view(page, view):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'[data-view="{view}"]').click()


def open_hub(page, art=True):
    open_view(page, 'hub')
    page.wait_for_function('''()=>__ATF_HUB__?.running&&__ATF_HUB__.getSnapshot().npcAnnexCirculationV159?.actor''', timeout=90000)
    if art:
        page.wait_for_function('()=>__ATF_HUB__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
    page.locator('#hub-canvas').focus()


def walk_to(page, x):
    current = observed(page)['player']['x']
    if abs(current - x) < 4:
        return
    key = 'KeyD' if x > current else 'KeyA'
    page.locator('#hub-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function('''t=>t.right?__ATF_HUB__.player.x>=t.x-3:__ATF_HUB__.player.x<=t.x+3''',
                               arg={'x': x, 'right': x > current}, timeout=90000)
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1', timeout=30000)


def collect(page, name, stop, move_to=None):
    phase(name)
    page.evaluate('''opts=>{ window.__ATF_V159_COLLECTION__=new Promise((resolve,reject)=>{
      const rows=[],frames={},h=__ATF_HUB__;
      const timer=setTimeout(()=>reject(Error('Native annex journey timed out: '+opts.name)),240000);
      function frame(){
        const snap=h.getSnapshot().npcAnnexCirculationV159,a=snap.actor;
        const row={actor:a?structuredClone(a):null,handoff:structuredClone(snap.nativeHandoff),
          reserved:snap.reserved,occlusion:structuredClone(snap.occlusion),
          player:{x:h.player.x,y:h.player.y},clock:structuredClone(h.npcRoutineContextV62.clock)};
        rows.push(row);
        if(a){
          const key=a.roomId+':'+a.stage;
          if(!frames[key]&&(['covering','revealing'].includes(a.stage)||a.stage==='service'))
            frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};
        }
        const done=opts.stop==='mid-cover'&&a?.stage==='covering'&&a.doorProgress>.35&&a.doorProgress<.7
          ||opts.stop==='annex-service'&&a?.roomId==='synthetic-bay'&&a.stage==='service'&&a.arrivals>=1
          ||opts.stop==='handoff'&&snap.nativeHandoff?.fromRoomId==='science-lab';
        if(done){clearTimeout(timer);resolve({rows,frames});return;}
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }); }''', {'name': name, 'stop': stop})
    # Keep observing before the player clears a reserved opening. Walking first
    # can legitimately let the whole door cycle finish before collection starts.
    if move_to is not None:
        walk_to(page, move_to)
    result = page.evaluate('()=>window.__ATF_V159_COLLECTION__')
    rows = result['rows']
    (output / (name + '.json')).write_text(json.dumps(rows, indent=2))
    continuous = True
    transfers = 0
    for first, second in zip(rows, rows[1:]):
        a, b = first['actor'], second['actor']
        if not a or not b:
            continue
        if a['roomId'] == b['roomId']:
            continuous &= abs(b['x'] - a['x']) <= 27 * (b['time'] - a['time']) + .03
        else:
            transfers += 1
            continuous &= a['stage'] == 'covering' and b['stage'] == 'revealing' and b['doorProgress'] == 0 and b['crossings'] == a['crossings'] + 1
    report.setdefault('observedPortalTransfers', {})[name] = transfers
    check(name + ': actual floor walking and covered portal coordinate handoff are distinct', continuous)
    check(name + ': every owned pose keeps native feet and physical dimensions', all(
        not row['actor'] or row['actor']['y'] == 532 for row in rows))
    for key, frame in result['frames'].items():
        file = name + '-' + key.replace(':', '-') + '.png'
        (output / file).write_bytes(base64.b64decode(frame['png'].split(',')[1]))
        report['captures'].append(file)
    return rows


def fixture():
    script = '''import {createDefaultSave} from './src/save.js';
const s=createDefaultSave();s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA annexe BISHOP V159';
s.settings.reducedMotion=false;s.clock.hour=5;
Object.assign(s.hub,{deck:1,roomId:'science-lab',positionX:4950,positionY:532});
s.crew.find(m=>m.id==='crew-05-bishop-9').appearanceV110={schema:110,markingId:'olive'};
console.log(JSON.stringify(s));'''
    result = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo, capture_output=True, text=True, check=True)
    raw = result.stdout.encode()
    (output / 'disclosed-native-laboratory-05h.json').write_bytes(raw)
    report['fixtureSha256'] = hashlib.sha256(raw).hexdigest()
    return raw


source_start = manifest()
(output / 'runtime-source-start-v159.json').write_text(json.dumps(source_start, indent=2))
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        phase('native import at real laboratory05h')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'bishop05h-v159.json', 'mimeType': 'application/json', 'buffer': fixture()})
        page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA annexe BISHOP V159'")
        open_hub(page)
        initial = observed(page)
        check('05h adopts the actual native BISHOP laboratory body and no pre-load journey',
              initial['route']['actor']['roomId'] == 'science-lab' and initial['visibleCount'] == 1 and initial['visibleSingleton']
              and initial['route']['preLoadTravelObserved'] is False)
        check('both rooms use their effective whole-room2D presentation', all(
            row['mode'] == '2d' and row['mixedProjectionAllowed'] is False for row in initial['route']['presentation']))
        check('native BISHOP stature stays44x92 on floor624', initial['actualActor']['w'] == 44 and initial['actualActor']['h'] == 92 and initial['actualActor']['y'] == 532)
        capture(page, '01-laboratory-native05h.png')
        page.locator('#exit-hub').click()
        before_command = observed(page)
        open_view(page, 'command')
        page.locator('[data-strategy-action="colony-relief"]').click()
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===9')
        open_hub(page)
        after_command = observed(page)
        check('native four-hour strategy action changes time without moving the owned body to the sampled annex post',
              after_command['clock']['hour'] == 9 and after_command['route']['actor']['roomId'] == 'science-lab'
              and abs(after_command['route']['actor']['x'] - before_command['route']['actor']['x']) <= 27 * (after_command['route']['actor']['time'] - before_command['route']['actor']['time']) + .03
              and after_command['strategy']['actions'] == before_command['strategy']['actions'] + 1)
        collect(page, '02-real-outbound-and-mid-door', 'mid-cover')
        # Exit promptly; the collector already retained the real door canvas.
        # A screenshot round trip here can consume the remaining door cycle.
        page.locator('#exit-hub').click()
        paused = observed(page)
        durable = page.evaluate("()=>JSON.parse(localStorage.getItem('atf-v47-profile-1')).hub.npcAnnexCirculationV159")
        check('native exit saves the exact durable door phase and supported body',
              durable['actor'] == paused['route']['actor'] and durable['actor']['stage'] in ['covering', 'revealing'])
        (output / 'durable-covered-door.json').write_text(json.dumps(durable, indent=2))
        phase('real reload of the actual covered-door save')
        page.reload(wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        # Observe synchronously after the native nav handler, before any RAF.
        # A later Playwright read can legitimately see the resumed door finish
        # and walking begin; that is not the persisted restoration state.
        page.evaluate('''() => { const read = ''' + OBSERVE + ''';
          document.addEventListener('click', function recordNativeResume(event) {
            if (event.target.closest('[data-view]')?.dataset.view !== 'hub') return;
            window.__ATF_V159_RESUME_OBSERVATION__ = read();
            document.removeEventListener('click', recordNativeResume);
          });
        }''')
        open_hub(page, art=False)
        restored = page.evaluate('()=>window.__ATF_V159_RESUME_OBSERVATION__')
        (output / 'native-synchronous-resume.json').write_text(json.dumps(restored, indent=2))
        check('native reload restores the exact saved actor and door phase before its first resumed frame',
              restored['running'] and restored['route']['actor'] == durable['actor'])
        collect(page, '04-resumed-through-annex-arrival', 'annex-service')
        arrived = observed(page)
        check('full outbound completes through one physical portal and the admitted safe service post',
              arrived['route']['actor']['crossings'] == 1 and 433.85 <= arrived['route']['actor']['x'] <= 439.48)
        walk_to(page, 4178)
        page.keyboard.press('KeyE')
        page.wait_for_function("()=>__ATF_HUB__.currentAnnexV71?.()?.id==='synthetic-bay'&& !__ATF_HUB__.annexTransitionV71", timeout=45000)
        visible = observed(page)
        check('native player entry sees the same unique BISHOP body in the annex', visible['visibleCount'] == 1 and visible['visibleSingleton'])
        capture(page, '05-annex-actual-service-post.png')
        walk_to(page, 375)
        page.keyboard.press('KeyE')
        page.locator('#hub-dialogue').wait_for(state='visible')
        talking = observed(page)
        check('native E opens BISHOP existing dialogue at the actual annex post', 'BISHOP' in page.locator('#hub-dialogue-speaker').inner_text() and not talking['running'])
        page.wait_for_timeout(250)
        frozen = observed(page)
        check('dialogue freezes the actual owned feet and door time', frozen['route']['actor'] == talking['route']['actor'])
        capture(page, '06-native-bishop-dialogue.png')
        page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
        after_choice = observed(page)
        check('native conversation choice rebuilds intentions without replacing the owned annex body', after_choice['route']['actor'] == frozen['route']['actor'] and after_choice['visibleSingleton'])
        page.locator('#hub-dialogue-continue').click()
        page.wait_for_function('()=>__ATF_HUB__.running')
        walk_to(page, 122)
        page.keyboard.press('KeyE')
        page.wait_for_function('()=>!__ATF_HUB__.currentAnnexV71?.()&& !__ATF_HUB__.annexTransitionV71', timeout=45000)
        walk_to(page, 4178)
        page.locator('#exit-hub').click()
        open_view(page, 'command')
        page.locator('[data-strategy-action="frontier-recon"]').click()
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===12')
        open_hub(page)
        phase('return waits for the real player occupying the destination opening')
        page.wait_for_function("()=>__ATF_HUB__.getSnapshot().npcAnnexCirculationV159.actor?.reason==='occupied'", timeout=90000)
        occupied = observed(page)
        page.wait_for_timeout(400)
        waiting = observed(page)
        check('occupied destination prevents the return portal hop and keeps the source feet',
              occupied['route']['actor']['roomId'] == 'synthetic-bay' and waiting['route']['actor']['roomId'] == 'synthetic-bay'
              and occupied['route']['actor']['x'] == waiting['route']['actor']['x']
              and waiting['route']['actor']['crossings'] == 1)
        capture(page, '07-player-blocks-return-sas.png')
        returning = collect(page, '08-return-through-real-paired-sas', 'handoff', move_to=4450)
        last = next(row['actor'] for row in reversed(returning) if row['actor'])
        handoff = observed(page)['route']['nativeHandoff']
        check('return really reaches its laboratory home before native quarantine handoff',
              last['roomId'] == 'science-lab' and abs(last['x'] - last['homeX']) < .25
              and last['crossings'] == 2 and last['arrivals'] == 2
              and handoff['fromRoomId'] == 'science-lab' and handoff['toRoomId'] == 'quarantine'
              and handoff['observedTravel'] is False)
        check('continuous return observations include the actual fully covered portal handoff',
              report['observedPortalTransfers']['08-return-through-real-paired-sas'] == 1)
        capture(page, '09-parent-after-explicit-native-handoff.png')
        check('native page and assets remain free of runtime and HTTP errors', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        report['lastPassedCheck'] = report['checks'][-1] if report['checks'] else None
        try:
            report['failureState'] = observed(page)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        print('::error file=scripts/qa-npc-annex-circulation-v159.py::' + str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise
    finally:
        browser.close()
        source_end = manifest()
        (output / 'runtime-source-end-v159.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
