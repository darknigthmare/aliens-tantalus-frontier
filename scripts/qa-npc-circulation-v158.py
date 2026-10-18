"""Production ECHO-A circuit through native import, walking, conversation,
medical service, lift and reload. Evaluations only observe the running engine;
no actor/storage/clock/RNG writes, manual update calls or patched animation RAF.
"""
import argparse
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
    raise SystemExit('QA evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Disclosed idle-post campaign checkpoint through Save picker; native real-time ECHO-A walk, E dialogue, reload, player A/D/S/W walking/lift and medical service advancing campaign time from 13 to 14. Runtime evaluations only observe.',
          'limitations': ['Automated native-control QA, not a human usability study.',
                          'The fixture begins with ECHO-A still at its existing briefing work post after an elapsed campaign-hour change; prior travel is not claimed.',
                          'Only the authored briefing/centre tactique circuit is continuous. Other crew retain contextual native lives; annex/lift journeys by ECHO-A remain outside this delivery.']}


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
  const h=__ATF_HUB__,s=h.getSnapshot().npcCirculationV158,a=h.npcCirculationActorV158;
  return {state:structuredClone(s),running:h.running,deck:h.state.deck,annex:h.currentAnnexV71?.()?.id||null,
    clock:structuredClone(h.npcRoutineContextV62.clock),player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health},
    camera:{...h.camera},visible:h.npcs.filter(n=>n.crewId==='crew-14-echo-a').length,
    sameObject:h.npcs.find(n=>n.crewId==='crew-14-echo-a')===a,
    animation:a?.v52Animation?structuredClone(a.v52Animation):null,
    human:a?.humanVisualV133?structuredClone(a.humanVisualV133):null,
    interaction:structuredClone(h.hubNpcInteractions['crew-14-echo-a']||null),
    prompt:h.statusPrompt(),nearestNpc:h.nearestHubNpc()?.crewId||null,
    interactionAction:h.nearestInteraction()?.action||null};
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


def open_hub(page):
    open_view(page, 'hub')
    page.wait_for_function('''()=>__ATF_HUB__?.running&&__ATF_HUB__.npcCirculationActorV158
      &&__ATF_HUB__.player.playerAppearanceVisualV126?.drawn''', timeout=90000)
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
                               arg={'x': x, 'right': x > current}, timeout=180000)
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1', timeout=30000)


def collect(page, name, destination=None, seconds=None):
    """A local observer owns only its evidence arrays. Actual engine time,
    native canvas and actors are read together in each ordinary animation frame.
    """
    phase(name)
    result = page.evaluate('''opts=>new Promise((resolve,reject)=>{
      const rows=[],h=__ATF_HUB__,start=h.npcCirculationStateV158.time;
      let crossing=null;
      const timer=setTimeout(()=>reject(Error('Native circulation observation timed out: '+opts.name)),480000);
      function frame(){
        const s=h.getSnapshot().npcCirculationV158,a=s.actor,d=s.doors[0],p=h.player;
        const row={...a,door:d?.progress||0,demandedBy:d?.demandedBy||null,
          playerX:p.x,playerDistance:Math.abs(p.x+p.w/2-d.x),running:h.running,
          visible:h.npcs.filter(n=>n.crewId==='crew-14-echo-a').length,
          ownObject:h.npcs.find(n=>n.crewId==='crew-14-echo-a')===h.npcCirculationActorV158};
        rows.push(row);
        if(!crossing&&a.x+44>d.x-8&&a.x<d.x+8){
          crossing={row:{...row},png:document.querySelector('#hub-canvas').toDataURL('image/png')};
        }
        if(opts.seconds!==null&&a.time-start>=opts.seconds
          ||opts.destination&&a.mode==='service'&&a.roomId===opts.destination){
          clearTimeout(timer);resolve({rows,crossing});return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })''', {'name': name, 'destination': destination, 'seconds': seconds})
    rows = result['rows']
    (output / f'{name}.json').write_text(json.dumps(rows, indent=2))
    check(name + ': each sampled movement belongs to actual elapsed engine time', all(
        abs(b['x'] - a['x']) <= 27 * (b['time'] - a['time']) + .015
        for a, b in zip(rows, rows[1:])))
    check(name + ': body keeps the authored floor and unique actual identity', all(
        r['y'] == 532 and r['visible'] == 1 and r['ownObject'] for r in rows))
    crossing = result['crossing']
    if crossing:
        import base64
        file = name + '-crossing.png'
        (output / file).write_bytes(base64.b64decode(crossing['png'].split(',')[1]))
        report['captures'].append(file)
        check(name + ': actual NPC opens and crosses the native leaf while the player remains outside its proximity trigger',
              crossing['row']['door'] >= .82 and crossing['row']['playerDistance'] >= 182
              and crossing['row']['demandedBy'] == 'crew-14-echo-a')
    return result


def fixture():
    script = '''import {createDefaultSave} from './src/save.js';
import {createNpcCirculationStateV158} from './src/npc-circulation-v158.js';
import {resolveNpcRoutineV62} from './src/npc-dialogue-v62.js';
const s=createDefaultSave();s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA circulation V158';
s.settings.reducedMotion=false;s.clock.hour=13;
Object.assign(s.hub,{deck:0,roomId:'briefing',positionX:2200,positionY:532});
s.hub.npcCirculationV158={schema:158,actor:createNpcCirculationStateV158({crewId:'crew-14-echo-a',
 roomId:'briefing',x:1849,y:532,w:44,h:92,facing:1,alive:true},
 resolveNpcRoutineV62('crew-14-echo-a',{clock:{day:1,hour:11}}))};
console.log(JSON.stringify(s));'''
    result = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo, capture_output=True, text=True, check=True)
    raw = result.stdout.encode()
    (output / 'disclosed-idle-briefing-checkpoint.json').write_bytes(raw)
    report['fixtureSha256'] = hashlib.sha256(raw).hexdigest()
    return raw


source_start = manifest()
(output / 'runtime-source-start-v158.json').write_text(json.dumps(source_start, indent=2))
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
        phase('native title and disclosed profile import')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'circulation-v158.json', 'mimeType': 'application/json', 'buffer': fixture()})
        page.wait_for_function('''()=>__ATF_V51__?.saveSystem.data.player.name==='QA circulation V158'
          &&JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.player.name==='QA circulation V158' ''')
        open_hub(page)
        partial = collect(page, '01-outbound-before-reload', seconds=15)
        check('ECHO-A starts from its persisted briefing post and walks toward the real door',
              partial['rows'][-1]['x'] > partial['rows'][0]['x'] + 200 and partial['rows'][-1]['x'] < 2508)
        page.locator('#exit-hub').click()
        paused = observed(page)
        durable = page.evaluate("()=>JSON.parse(localStorage.getItem('atf-v47-profile-1')).hub.npcCirculationV158")
        check('native exit commits the actual mid-route pose and waypoint',
              durable['actor']['x'] == paused['state']['actor']['x'] and durable['actor']['waypointIndex'] == paused['state']['actor']['waypointIndex'])
        phase('real page reload and native resume')
        page.reload(wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        open_hub(page)
        resumed = observed(page)['state']['actor']
        check('reload resumes actual progress rather than the 13:00 destination sample',
              abs(resumed['x'] - durable['actor']['x']) <= 27 * (resumed['time'] - durable['actor']['time']) + .02 and resumed['x'] < 3190)
        outbound = collect(page, '02-outbound-through-sas', destination='combat-information')
        check('outbound reaches the native tactical post after a visible real crossing',
              outbound['crossing'] is not None and abs(outbound['rows'][-1]['x'] - 3195) < .25)
        walk_to(page, 3165)
        page.keyboard.press('KeyE')
        page.locator('#hub-dialogue').wait_for(state='visible')
        before = observed(page)
        check('real E opens the existing ECHO-A conversation at its destination', 'ECHO-A' in page.locator('#hub-dialogue-speaker').inner_text() and not before['running'])
        page.wait_for_timeout(250)
        frozen = observed(page)
        check('dialogue pause freezes feet and circulation time', frozen['state']['actor'] == before['state']['actor'])
        page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
        after_choice = observed(page)
        check('a native conversation choice rebuilds intentions without replacing the actual post or trip',
              after_choice['state']['actor']['x'] == frozen['state']['actor']['x'] and after_choice['sameObject'])
        page.locator('#hub-dialogue-continue').click()
        page.wait_for_function('()=>__ATF_HUB__.running')
        capture(page, '03-tactical-post-after-native-dialogue.png')
        phase('real lift to Habitat and medical service advances the campaign to 14:00')
        walk_to(page, 2350)
        page.keyboard.press('KeyS')
        page.wait_for_function('()=>__ATF_HUB__.state.deck===1')
        # Bounds come from the current authored compartment through a read-only module.
        medical_x = page.evaluate('''async()=>{const {HUB_DECKS}=await import('/src/hub-game.js');
          const b=HUB_DECKS[1].rooms.find(r=>r.id==='medical').propInteractionBounds;return b.x+b.w/2-22;}''')
        walk_to(page, medical_x)
        check('medical service is the nearest real interaction, with ECHO-A still retained off deck',
              observed(page)['interactionAction'] == 'service:medical' and observed(page)['visible'] == 0)
        page.keyboard.press('KeyE')
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===14')
        offscreen = observed(page)
        check('native medical service changes the routine target while keeping ECHO-A at its real source position',
              offscreen['state']['actor']['roomId'] == 'combat-information' and offscreen['clock']['hour'] == 14)
        walk_to(page, 2350)
        page.keyboard.press('KeyW')
        page.wait_for_function('()=>__ATF_HUB__.state.deck===0')
        walk_to(page, 2200)
        returning = collect(page, '04-return-through-sas', destination='briefing')
        check('return reaches the original native briefing post, after actual travel and a second crossing',
              returning['crossing'] is not None and abs(returning['rows'][-1]['x'] - 1849) < .25
              and returning['rows'][-1]['arrivals'] == 2)
        capture(page, '05-returned-briefing-post.png')
        check('production page, asset requests and runtime remain error-free', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        report['lastPassedCheck'] = report['checks'][-1] if report['checks'] else None
        try:
            report['failureState'] = observed(page)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        message = f"{error}; phase={report.get('phase')}; lastPassedCheck={report['lastPassedCheck']}"
        print('::error file=scripts/qa-npc-circulation-v158.py::' + message.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise
    finally:
        browser.close()
        source_end = manifest()
        (output / 'runtime-source-end-v158.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
