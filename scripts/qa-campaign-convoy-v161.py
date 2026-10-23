"""Original convoy story via production UI and native keys.

Only an unplayed profile is imported through the Save picker. Evaluations read
state; they never change actors, timers, results, mission methods or resources.
The root agent owns browser execution and review of the resulting screenshots.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
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
          'method': 'Native Save import of an unplayed convoy plan, five-phase insertion and choice, actual pause/reload, real keyboard M577 course, native extraction, committed reading and replay retreat.',
          'limitations': ['Automated controls, not human QA or canonical artwork approval.',
                         'One original Tantalus operation; no complete campaign or franchise1:1 claim.',
                         'The bounded debrief follows strategy.lastOperation and can be replaced by a later operation.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def step(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def manifest():
    paths = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'package.json', Path(__file__).resolve()])
    return {str(path.relative_to(repo)): hashlib.sha256(path.read_bytes()).hexdigest() for path in paths}


def observe(page):
    return page.evaluate('''()=>{const e=__ATF_GAME__,s=__ATF_V51__.saveSystem.data;return {
      save:structuredClone(s),running:e.running,paused:e.paused,mission:e.mission?.state,
      loading:!!(e.enemyAtlasLoadingPausedV65||e.userCasteLoadingV88),
      convoy:e.apcConvoyV121?structuredClone(e.apcConvoyV121):null,
      course:e.apcCourseStateV131?structuredClone(e.apcCourseStateV131):null,
      vehicle:e.vehicle?{hull:e.vehicle.hull,fuel:e.vehicle.fuel,ammo:e.vehicle.turretAmmo,reserve:e.vehicle.turretReserve}:null,
      enemies:(e.enemies||[]).filter(a=>a.alive).map(a=>({id:a.id,x:a.x,role:a.apcConvoyRoleV121,lane:a.apcLaneV131})),
      driver:e.player?{health:e.player.health,alive:e.player.alive}:null};}''')


def open_view(page, name):
    if page.locator(f'[data-panel="{name}"].active').is_visible():
        return
    if page.locator('#exit-hub').is_visible():
        page.locator('#exit-hub').click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
    if page.locator(f'[data-panel="{name}"].active').is_visible():
        return
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{name}"]').click()


def open_plan(page):
    open_view(page, 'command')
    selector = page.locator('#command-mission-v110')
    # An active operation locks its own campaign picker. It is already on the
    # correct convoy plan after insertion pause/reload, so no selection gesture
    # is available or necessary in that state.
    if selector.input_value() != 'special-apc-convoy':
        assert selector.is_enabled(), 'An active foreign operation owns the locked campaign picker.'
        selector.select_option('special-apc-convoy')
    page.locator('#operation-launch').wait_for(state='visible')


def continue_profile(page):
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-continue').click()


def capture(page, name, selector='#game-canvas'):
    page.locator(selector).screenshot(path=str(output / name))
    report['captures'].append(name)


def economy(save):
    return {key: json.loads(json.dumps(value)) for key, value in {
        'clock': save['clock'], 'resources': save['galaxy']['resources'], 'systems': save['hub']['systems'],
        'crew': save['crew'], 'statistics': {key: value for key, value in save['statistics'].items() if key != 'playSeconds'}}.items()}


def preparation(save, returned=False):
    operation = save['strategy']['lastOperation' if returned else 'currentOperation']
    return next(phase for phase in operation['insertionState']['phases'] if phase['kind'] == 'preparation')['payload']


def advance_to(page, target):
    for _ in range(8):
        phase = page.locator('#mission-insertion-v62').get_attribute('data-insertion-phase')
        if phase == target:
            return
        page.locator('[data-insertion-action="advance"]').click()
        page.wait_for_function('previous=>document.querySelector("#mission-insertion-v62").dataset.insertionPhase!==previous', arg=phase)
    raise AssertionError('Insertion phase unavailable: ' + target)


source_start = manifest()
(output / 'profile-source-start.json').write_text(json.dumps(source_start, indent=2))
script = """import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA CONVOY V161';s.strategy.plannedCampaignId='special-apc-convoy';s.worldId='world-05-lethe';s.scene='hub';console.log(JSON.stringify(s));"""
raw = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo, capture_output=True, text=True, check=True).stdout.encode()
(output / 'disclosed-unplayed-convoy-plan.json').write_bytes(raw)
report['fixtureSha256'] = hashlib.sha256(raw).hexdigest()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    held = set()

    def controls(desired):
        desired = set(desired)
        for code in sorted(held - desired):
            page.keyboard.up(code)
            held.remove(code)
        for code in sorted(desired - held):
            page.keyboard.down(code)
            held.add(code)

    try:
        step('original convoy briefing, optional reading choice and actual insertion reload')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'unplayed-convoy-plan.json', 'mimeType': 'application/json', 'buffer': raw})
        page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA CONVOY V161'")
        open_plan(page)
        page.locator('#operation-launch').click()
        page.locator('#mission-insertion-v62[data-insertion-phase="briefing"]').wait_for(state='visible')
        check('a new solo APC operation enters its own original briefing', 'Ramener le blindé' in page.locator('#mission-insertion-v62').inner_text())
        capture(page, '01-convoy-briefing.png', '#mission-insertion-v62')
        advance_to(page, 'preparation')
        before = observe(page)['save']
        page.locator('[data-story-protocol="route-review"]').click()
        chosen = observe(page)['save']
        check('the preparation selects route review without spending or awarding anything', preparation(chosen)['convoyStoryV161']['protocolId'] == 'route-review' and economy(chosen) == economy(before))
        capture(page, '02-route-review-choice.png', '#mission-insertion-v62')
        page.locator('[data-insertion-action="pause"]').click()
        paused = observe(page)['save']
        check('pausing insertion preserves the active operation and selected protocol', paused['strategy']['currentOperation']['insertionState']['paused'])
        page.reload(wait_until='domcontentloaded')
        continue_profile(page)
        open_plan(page)
        page.locator('#operation-launch').click()
        page.locator('[data-insertion-action="resume"]').click()
        check('actual reload restores the same operation and selected preparation', observe(page)['save']['strategy']['currentOperation']['id'] == paused['strategy']['currentOperation']['id'] and page.locator('[data-story-protocol="route-review"]').get_attribute('aria-pressed') == 'true')
        advance_to(page, 'deployment')
        check('APC deployment never paints the QZ18 investigation scene', page.locator('[data-native-relay-shot]').count() == 0)
        capture(page, '03-convoy-deployment.png', '#mission-insertion-v62')
        advance_to(page, 'player-control')
        page.locator('[data-insertion-action="advance"]').click()
        page.wait_for_function('()=>__ATF_GAME__.running&&__ATF_GAME__.isApcConvoyV121?.()&&!__ATF_GAME__.enemyAtlasLoadingPausedV65')
        page.locator('#game-canvas').focus()
        initial = observe(page)
        check('the real three-lane M577 waits for E with its finite issued resources', not initial['convoy']['briefed'] and initial['vehicle']['hull'] == 340 and initial['vehicle']['ammo'] == 110 and initial['course']['lane'] == 1)
        capture(page, '04-convoy-instruments-start.png')
        page.keyboard.press('KeyE')
        page.wait_for_function('()=>__ATF_GAME__.apcConvoyV121.briefed')
        step('native keyboard finite course, seven actual radio milestones and extraction')
        cooling = False
        deadline = time.monotonic() + 210
        radio_samples = []
        seen_phases = set()
        while time.monotonic() < deadline:
            state = observe(page)
            if state['mission'] != 'active':
                break
            convoy, course, vehicle = state['convoy'], state['course'], state['vehicle']
            if convoy['phase'] not in seen_phases:
                seen_phases.add(convoy['phase'])
                capture(page, f'05-course-{convoy["phase"]}.png')
                radio_samples.append({'phase': convoy['phase'], 'radio': page.locator('#mission-log').inner_text(), 'journal': convoy['journal']})
            if convoy['heat'] > 80 or convoy['overheated']:
                cooling = True
            if convoy['heat'] < 30 and not convoy['overheated']:
                cooling = False
            targets = sorted(state['enemies'], key=lambda enemy: (enemy['role'] == 'horde', -enemy['x']))
            target = targets[0] if targets else None
            desired = ['KeyE'] if convoy['phase'] == 'evacuation' else ['Space']
            # V131 deliberately accepts one lane per physical press. Holding
            # W/S cannot cross two lanes. Alternate a release frame whenever
            # the same direction is still needed, allowing the native
            # previousKeys latch to rearm before the next actual keydown.
            if target and target['lane'] < course['lane'] and 'KeyW' not in held:
                desired.append('KeyW')
            if target and target['lane'] > course['lane'] and 'KeyS' not in held:
                desired.append('KeyS')
            if target and not cooling and vehicle['ammo'] > 0:
                desired.append('KeyF')
            if vehicle['ammo'] < 18 and vehicle['reserve'] > 0:
                desired.append('KeyR')
            controls(desired)
            page.wait_for_timeout(60)
        controls([])
        final = observe(page)
        report['nativeCourse'] = {'state': final, 'seenPhases': sorted(seen_phases), 'radioSamples': radio_samples}
        check('actual inputs cross both Crushers and the final barrage and confirm the physical M577 extraction', final['mission'] == 'complete' and final['convoy']['complete'] and final['convoy']['crushersDefeated'] == [True, True] and final['convoy']['queenDefeated'] and final['vehicle']['hull'] > 0)
        check('the departure transmission belongs to the real convoy journal', 'depart' in final['convoy']['journal'] and any('Rook' in item['radio'] for item in radio_samples))
        capture(page, '06-native-convoy-return.png')
        returned = final['save']['strategy']['lastOperation']
        check('native resolution binds the convoy result to the same selected insertion', returned['success'] is True and returned['id'] == chosen['strategy']['currentOperation']['id'] and preparation(final['save'], returned=True)['convoyStoryV161']['protocolId'] == 'route-review')
        page.locator('#retreat-mission').click()
        open_plan(page)
        page.locator('[data-convoy-story-return]').wait_for(state='visible')
        check('real return opens route review with the two cleared barricades', page.locator('[data-convoy-story-answer="route"]').count() == 1 and '2/2' in page.locator('[data-convoy-story-return]').inner_text())
        capture(page, '07-convoy-debrief.png', '#operation-plan')
        before_reading = economy(observe(page)['save'])
        for topic in ['vehicle', 'route', 'return', 'return']:
            page.locator(f'[data-convoy-story-topic="{topic}"]').click()
            saved = observe(page)['save']
            ledger = preparation(saved, returned=True)['convoyReturnV161']
            focused = page.evaluate('(topic)=>document.activeElement?.dataset.convoyStoryTopic===topic', topic)
            check('persisted reading and focus: ' + topic + ' / ' + str(len(report['checks'])), topic in ledger['readTopics'] and ledger['activeTopic'] == topic and focused and economy(saved) == before_reading)
        before_reload = observe(page)['save']
        page.reload(wait_until='domcontentloaded')
        continue_profile(page)
        open_plan(page)
        reloaded = observe(page)['save']
        check('all reading topics and the actual convoy reward survive reload', preparation(reloaded, returned=True)['convoyReturnV161'] == preparation(before_reload, returned=True)['convoyReturnV161'] and reloaded['galaxy']['resources'] == before_reload['galaxy']['resources'] and reloaded['strategy']['lastOperation']['missionRewardsV121'] == before_reload['strategy']['lastOperation']['missionRewardsV121'] and all('RELU' in page.locator(f'[data-convoy-story-topic="{topic}"]').inner_text() for topic in ['vehicle', 'route', 'return']))
        capture(page, '08-convoy-debrief-reloaded.png', '#operation-plan')
        step('new replay skip and native retreat remain failures, not another return reward')
        page.locator('#operation-launch').click()
        page.locator('[data-insertion-action="skip"]').wait_for(state='visible')
        page.locator('[data-insertion-action="skip"]').click()
        page.wait_for_function('()=>__ATF_GAME__.running&&__ATF_GAME__.isApcConvoyV121?.()&&!__ATF_GAME__.enemyAtlasLoadingPausedV65')
        replay = observe(page)['save']
        check('the replay skip does not inherit the previous route-review selection', 'convoyStoryV161' not in preparation(replay))
        page.locator('#retreat-mission').click()
        open_plan(page)
        failed = observe(page)['save']
        check('native retreat gives a new failed operation and no confirmed vehicle return', failed['strategy']['lastOperation']['id'] != returned['id'] and failed['strategy']['lastOperation']['success'] is False and 'RETOUR NON CONFIRMÉ' in page.locator('[data-convoy-story-return]').inner_text())
        capture(page, '09-convoy-retreat-debrief.png', '#operation-plan')
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            controls([])
            report['failureState'] = observe(page)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception:
            pass
        raise
    finally:
        source_end = manifest()
        report['sourceUnchanged'] = source_end == source_start
        report['sourceStartSha256'] = hashlib.sha256(json.dumps(source_start, sort_keys=True).encode()).hexdigest()
        if not report['sourceUnchanged'] or report['pageErrors'] or report['requestFailures'] or report['httpErrors']:
            report['status'] = 'failed'
        (output / 'profile-source-end.json').write_text(json.dumps(source_end, indent=2))
        (output / 'report.json').write_text(json.dumps(report, indent=2))
        browser.close()
        print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'captures': len(report['captures']), 'report': str(output / 'report.json')}), flush=True)
        if report['status'] != 'passed':
            raise SystemExit(1)
