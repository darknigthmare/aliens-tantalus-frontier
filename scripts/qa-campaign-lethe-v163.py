"""ROOT-run production-browser journey for the original Dossier de Lethe.

Only native buttons/keys/pointer events change game state. Evaluation observes.
The fresh profile and the legacy resume derived from its real checkpoint are
declared imports; no earlier QZ18/APC/colony travel is fabricated by this pilot.
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
    raise SystemExit('Keep evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Production title/Save picker; disclosed unplayed default profile; native Dossier plan buttons; authored C12 preparation, pause/reload; complete C12 keyboard/pointer combat and extraction; three return questions; reload; authored Cocon opening, real resin release, native save/retreat, legacy resume imported from that actual checkpoint.',
          'limitations': ['Automated native controls, not human QA or canonical/film1:1 certification.',
                          'This run completes C12 freshly. It does not claim a fresh QZ18/APC victory or full Cocon colony/quarantine traversal.',
                          'The legacy fixture copies the actual Cocon native save produced here; only its player name and insertionState are changed.',
                          'Illustrated radio scenes use existing project assets; missing Blackout/Earth archives are not recreated.',
                          'The Dossier covers four original operations. Other catalogue campaigns remain outside this evidence.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def manifest():
    paths = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}


def observed(page):
    return page.evaluate('''()=>{const s=__ATF_V51__.saveSystem.data,e=__ATF_GAME__;return {
      save:structuredClone(s),running:e.running,paused:e.paused,mission:e.mission?.state,
      player:e.player?{x:e.player.x,y:e.player.y,w:e.player.w,h:e.player.h,vx:e.player.vx,
        health:e.player.health,armor:e.player.armor,ammo:e.player.ammo,alive:e.player.alive}:null,
      camera:{...e.camera},c12:e.c12HordeV121?structuredClone(e.c12HordeV121):null,
      cocoon:e.blackCocoonV121?structuredClone(e.blackCocoonV121):null,
      target:e.enemies?.filter(n=>n.alive).sort((a,b)=>Math.abs(a.x-e.player.x)-Math.abs(b.x-e.player.x))
        .map(n=>({x:n.x+n.w/2,y:n.y+n.h/2}))[0]||null,
      insertionVisible:!document.querySelector('#mission-insertion-v62')?.hidden,
      canvas:{width:e.canvas.width,height:e.canvas.height}};}''')


def open_view(page, view):
    target = page.locator(f'[data-panel="{view}"].active')
    if target.is_visible():
        return
    if page.locator('#exit-hub').is_visible():
        page.locator('#exit-hub').click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
        if target.is_visible():
            return
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{view}"]').click()


def open_plan(page):
    open_view(page, 'command')
    page.locator('[data-panel="command"].active #operation-launch').wait_for(state='visible')


def capture(page, name, selector='#game-canvas'):
    page.locator(selector).screenshot(path=str(output / name))
    report['captures'].append(name)


def continue_profile(page):
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-continue').click()


def import_profile(page, raw, name):
    open_view(page, 'settings')
    page.locator('#save-import').set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function("()=>document.querySelector('#save-import').value==='' ")


def advance_to(page, target):
    for _ in range(8):
        current = page.locator('#mission-insertion-v62').get_attribute('data-insertion-phase')
        if current == target:
            return
        page.locator('[data-insertion-action="advance"]').click()
        page.wait_for_function('previous=>document.querySelector("#mission-insertion-v62").dataset.insertionPhase!==previous', arg=current)
    raise AssertionError('Insertion did not reach ' + target)


def start_runtime(page, campaign):
    advance_to(page, 'player-control')
    page.locator('[data-insertion-action="advance"]').click()
    page.wait_for_function('''id=>__ATF_GAME__?.running&&__ATF_GAME__.mission?.state==="active"
      &&__ATF_V51__.saveSystem.data.strategy.currentOperation?.campaignId===id
      &&!document.querySelector('#mission-runtime-v62').hidden''', arg=campaign)
    page.locator('#game-canvas').focus()


def protected(save):
    # Compare every economic/progression field owned by the operation. Hub
    # animation clocks are not an economic authority and run during navigation.
    return {key: save[key] for key in ['clock', 'galaxy', 'crew', 'player', 'archiveRelayArchivesV122',
                                     'convoyReturnHistoryV162', 'strategy']}


def question_protected(save):
    copy = json.loads(json.dumps(save))
    # SaveSystem owns this wall-clock write timestamp; every other field stays
    # in the strict equality comparison, apart from the two reading fields.
    copy.pop('updatedAt', None)
    for row in copy['letheContinuityV163']['chapters'].values():
        for kind in ['firstSuccess', 'latestReturn']:
            if row[kind]:
                row[kind].pop('readTopics', None)
                row[kind].pop('activeTopic', None)
    return copy


def hold_until(page, key, condition, timeout=30000):
    page.locator('#game-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function(condition, timeout=timeout)
    finally:
        page.keyboard.up(key)


def complete_c12(page):
    held = set()
    checkpoints = []
    start = time.monotonic()
    page.locator('#game-canvas').focus()
    first = observed(page)
    box = page.locator('#game-canvas').bounding_box()
    page.mouse.move(box['x'] + 50 * box['width'] / first['canvas']['width'],
                    box['y'] + 520 * box['height'] / first['canvas']['height'])
    page.mouse.down(button='right')
    try:
        while time.monotonic() - start < 600:
            state = observed(page)
            if state['save']['strategy']['currentOperation'] is None:
                break
            check_live = state['running'] and state['player']['alive'] and state['mission'] == 'active'
            assert check_live, 'Native C12 operator must remain alive in its active operation.'
            c12 = state['c12']
            wanted = set()
            if not c12['activated']:
                wanted.add('KeyE')
            else:
                wanted.add('KeyF')
                if state['player']['x'] < 1110:
                    wanted.add('KeyD')
                if c12['defenceElapsed'] >= 45:
                    wanted.add('KeyE')
                if state['player']['ammo'] == 0:
                    page.keyboard.press('KeyR')
            for key in held - wanted:
                page.keyboard.up(key)
            for key in wanted - held:
                page.keyboard.down(key)
            held = wanted
            target = state['target']
            if target:
                box = page.locator('#game-canvas').bounding_box()
                page.mouse.move(box['x'] + (target['x'] - state['camera']['x']) * box['width'] / state['canvas']['width'],
                                box['y'] + (target['y'] - state['camera']['y']) * box['height'] / state['canvas']['height'])
            bucket = int(c12['defenceElapsed'] // 10)
            if not checkpoints or checkpoints[-1]['bucket'] != bucket:
                checkpoints.append({'bucket': bucket, 'defenceElapsed': c12['defenceElapsed'], 'emitted': c12['emitted'],
                                    'player': state['player'], 'elapsedWallSeconds': time.monotonic() - start})
                if bucket in [1, 3]:
                    capture(page, f'04-c12-native-defence-{bucket}.png')
            page.wait_for_timeout(100)
        else:
            raise AssertionError('Native C12 journey exceeded 600 wall seconds.')
    finally:
        for key in held:
            page.keyboard.up(key)
        page.mouse.up(button='right')
    report['nativeC12Observations'] = checkpoints


source_start = manifest()
(output / 'runtime-source-start-v163.json').write_text(json.dumps(source_start, indent=2))
script = """import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA Lethe V163';s.strategy.plannedCampaignId='special-c12-horde';s.worldId='world-05-lethe';s.scene='hub';s.settings.reducedMotion=false;console.log(JSON.stringify(s));"""
raw = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo, capture_output=True, text=True, check=True).stdout.encode()
(output / 'disclosed-unplayed-lethe-profile.json').write_bytes(raw)
report['fixtureSha256'] = hashlib.sha256(raw).hexdigest()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    page.on('requestfailed', lambda r: report['requestFailures'].append({'url': r.url, 'failure': r.failure}))
    page.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
    page.on('dialog', lambda d: d.accept())
    try:
        phase('native unplayed Dossier and plan ownership')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'unplayed-lethe.json', 'mimeType': 'application/json', 'buffer': raw})
        page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA Lethe V163'")
        open_plan(page)
        check('four original chapter cards begin without fabricated progress', page.locator('[data-lethe-chapter]').count() == 4 and page.locator('[data-lethe-chapter-count]').get_attribute('data-lethe-chapter-count') == '0')
        capture(page, '01-dossier-unplayed.png', '[data-lethe-continuity]')
        before_plan = observed(page)['save']
        page.locator('[data-lethe-plan="special-c12-horde"]').click()
        after_plan = observed(page)['save']
        expected_plan = json.loads(json.dumps(before_plan)); expected_plan['strategy']['plannedCampaignId'] = 'special-c12-horde'
        check('chapter preparation selects only the existing native plan', protected(after_plan) == protected(expected_plan) and after_plan['strategy']['currentOperation'] is None)

        phase('C12 authored choice and actual insertion pause/reload')
        page.locator('#operation-launch').click()
        page.locator('#mission-insertion-v62').wait_for(state='visible')
        capture(page, '02-c12-authored-briefing.png', '#mission-insertion-v62')
        advance_to(page, 'preparation')
        before_choice = observed(page)['save']
        page.locator('[data-story-protocol="lift-review"]').click()
        selected = observed(page)['save']
        payload = next(p for p in selected['strategy']['currentOperation']['insertionState']['phases'] if p['kind'] == 'preparation')['payload']['letheStoryV163']
        check('preparation stores only its explicit reading protocol without changing rewards', payload['protocolId'] == 'lift-review' and selected['galaxy'] == before_choice['galaxy'] and selected['clock'] == before_choice['clock'])
        page.locator('[data-insertion-action="pause"]').click()
        paused = observed(page)['save']
        page.reload(wait_until='domcontentloaded'); continue_profile(page); open_plan(page)
        page.locator('#operation-launch').click()
        page.locator('[data-insertion-action="resume"]').click()
        resumed = observed(page)['save']
        check('reload restores the same insertion phase, choice, operation and strategic payment', page.locator('[data-story-protocol="lift-review"]').get_attribute('aria-pressed') == 'true' and resumed['strategy']['currentOperation']['id'] == paused['strategy']['currentOperation']['id'] and resumed['galaxy'] == paused['galaxy'] and resumed['clock'] == paused['clock'])
        capture(page, '03-c12-preparation-resumed.png', '#mission-insertion-v62')
        start_runtime(page, 'special-c12-horde')
        complete_c12(page)
        victory = observed(page)['save']
        check('real C12 controls and sas extraction persist one native confirmed return', victory['strategy']['lastOperation']['success'] is True and victory['strategy']['lastOperation']['campaignId'] == 'special-c12-horde' and victory['letheContinuityV163']['chapters']['c12']['firstSuccess']['operationId'] == victory['strategy']['lastOperation']['id'])
        capture(page, '05-c12-native-extracted.png')
        page.locator('#retreat-mission').click(); open_plan(page)
        check('only C12 is confirmed after its genuine native return', page.locator('[data-lethe-chapter-count]').get_attribute('data-lethe-chapter-count') == '1' and page.locator('[data-lethe-chapter="c12"]').get_attribute('data-complete') == 'true')
        page.locator('[data-lethe-chapter="c12"] summary').click()
        capture(page, '06-c12-return-dossier.png', '[data-lethe-continuity]')
        before_questions = observed(page)['save']
        for topic in ['objective', 'conduct', 'return', 'objective', 'conduct', 'return']:
            button = page.locator(f'[data-lethe-chapter="c12"] [data-lethe-review="{topic}"]')
            button.click()
            check('native question ' + topic + ' preserves focus, payment and operation facts',
                  page.evaluate('topic=>document.activeElement?.isConnected&&document.activeElement.dataset.letheReview===topic', topic)
                  and question_protected(observed(page)['save']) == question_protected(before_questions))
        read_save = observed(page)['save']
        check('three explicit question topics are recorded without an automatic reading', read_save['letheContinuityV163']['chapters']['c12']['latestReturn']['readTopics'] == ['objective', 'conduct', 'return'])
        page.reload(wait_until='domcontentloaded'); continue_profile(page); open_plan(page)
        reloaded = observed(page)['save']
        check('notebook, native receipt and economy survive a real profile reload', reloaded['letheContinuityV163'] == read_save['letheContinuityV163'] and reloaded['galaxy'] == read_save['galaxy'] and reloaded['clock'] == read_save['clock'] and reloaded['strategy']['lastOperation']['id'] == read_save['strategy']['lastOperation']['id'])

        phase('Cocon native opening, partial return and genuine older checkpoint compatibility')
        page.locator('[data-lethe-plan="special-black-cocoon"]').click(); page.locator('#operation-launch').click()
        page.locator('#mission-insertion-v62').wait_for(state='visible')
        capture(page, '07-cocoon-authored-briefing.png', '#mission-insertion-v62')
        advance_to(page, 'preparation'); page.locator('[data-story-protocol="quarantine-review"]').click()
        start_runtime(page, 'special-black-cocoon')
        hold_until(page, 'KeyE', '()=>__ATF_GAME__.blackCocoonV121.freed===true', 90000)
        page.locator('#mission-save-v160').click()
        mid = observed(page)['save']
        check('legacy fixture basis is an actual native freed Cocon checkpoint', mid['strategy']['currentOperation']['resumeState']['specialOperation']['blackCocoonV121']['freed'] is True)
        capture(page, '08-cocoon-native-release.png')
        page.locator('#retreat-mission').click(); open_plan(page)
        retreat = observed(page)['save']
        check('Cocon retreat keeps C12 confirmed, records partial facts and never certifies quarantine', retreat['letheContinuityV163']['chapters']['c12']['firstSuccess'] is not None and retreat['letheContinuityV163']['chapters']['cocoon']['firstSuccess'] is None and retreat['letheContinuityV163']['chapters']['cocoon']['latestReturn']['summary']['freed'] is True and retreat['letheContinuityV163']['chapters']['cocoon']['latestReturn']['summary']['quarantineComplete'] is False)
        legacy = json.loads(json.dumps(mid)); legacy['strategy']['currentOperation']['insertionState'] = None; legacy['player']['name'] = 'QA Lethe native legacy V163'
        legacy_raw = json.dumps(legacy).encode(); (output / 'disclosed-legacy-from-native-cocoon-save.json').write_bytes(legacy_raw)
        report['legacyFixtureSha256'] = hashlib.sha256(legacy_raw).hexdigest()
        import_profile(page, legacy_raw, 'legacy-native-cocoon.json'); open_plan(page); page.locator('#operation-launch').click()
        page.wait_for_function('()=>__ATF_GAME__.running&&__ATF_GAME__.isBlackCocoonV121?.()&&!document.querySelector("#mission-runtime-v62").hidden')
        legacy_state = observed(page)
        check('an older saved Cocon level bypasses the new opening and preserves its exact operation ownership', not legacy_state['insertionVisible'] and legacy_state['save']['strategy']['currentOperation']['insertionState'] is None and legacy_state['save']['strategy']['currentOperation']['id'] == mid['strategy']['currentOperation']['id'] and legacy_state['cocoon']['freed'] is True and abs(legacy_state['player']['x'] - mid['strategy']['currentOperation']['resumeState']['player']['x']) < 5)
        capture(page, '09-cocoon-native-legacy-resume.png')
        page.locator('#retreat-mission').click(); open_plan(page)
        check('legacy partial return cannot repay the previous C12 victory or become a full Cocon return', observed(page)['save']['letheContinuityV163']['chapters']['c12']['firstSuccess']['operationId'] == read_save['strategy']['lastOperation']['id'] and observed(page)['save']['letheContinuityV163']['chapters']['cocoon']['firstSuccess'] is None)
        capture(page, '10-dossier-retained-after-legacy-return.png', '[data-lethe-continuity]')
        check('native journey has no JavaScript exception or failed application request', not report['pageErrors'] and not report['httpErrors'] and not [r for r in report['requestFailures'] if r['failure'] != 'net::ERR_ABORTED'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        try:
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
            report['captures'].append('failure.png')
            (output / 'failure-state.json').write_text(json.dumps(observed(page), indent=2))
        except Exception:
            pass
        raise
    finally:
        source_end = manifest(); (output / 'runtime-source-end-v163.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
if not report['sourceUnchanged']:
    raise SystemExit('Runtime or QA source changed during this journey.')
