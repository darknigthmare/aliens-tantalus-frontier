"""Native browser evidence for the fifty franchise-stage adaptations V192.

A disclosed unplayed profile with Trials credits is imported through System.
All stage choices, purchases, movement, combat, pauses and abandonments use
native buttons, keys or trusted touch. Reads never replace RAF, input ownership,
actors, HP, velocity, RNG, timers or results. Fifty short visits are not wins.
"""
import argparse
import ast
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from urllib.parse import unquote, urlparse

from playwright.sync_api import sync_playwright

PARSER = argparse.ArgumentParser()
PARSER.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
PARSER.add_argument('--output', type=Path, required=True)
PARSER.add_argument('--mode', choices=['all', 'stages', 'ui', 'checks', 'victory'], default='all')
PARSER.add_argument('--stages', default='', help='Comma-separated real admitted stage IDs; exploratory subset only.')
PARSER.add_argument('--allow-changing-sources', action='store_true')
ARGS = PARSER.parse_args()
REPO = Path(os.environ.get('ATF_QA_REPO', Path(__file__).resolve().parents[1])).resolve()
OUT = ARGS.output.resolve()
if OUT == REPO or REPO in OUT.parents:
    raise SystemExit('Keep native evidence outside the repository.')
OUT.mkdir(parents=True, exist_ok=True)
HELPERS = ['scripts/qa-xeno-arbiter-stages-v190.py', 'scripts/qa-xeno-trials-animation-audio-v189.py']
REPORT = {'status': 'running', 'mode': ARGS.mode, 'checks': [], 'captures': [], 'canvasExports': [], 'stages': [],
          'pageErrors': [], 'httpErrors': [], 'requestFailures': [], 'httpBodies': {}, 'exports': [],
          'fixtures': ['An unplayed default profile is imported through the real System picker: QA name, setup complete, Lethe selected, music0/effects0.2, reducedMotion false and30000 Trials credits. No campaign return, unlock, win, ledger entry or pending ticket is prefilled.'],
          'nativeControlMethod': 'Native keyboard/buttons and Chromium trusted touch; read-only snapshots and atomic exports of existing Canvas pixels. No actor, position, health, RNG, timer, scheduler or result assignment.',
          'limits': ['Generated scenery is a project side-view adaptation, not measured franchise1:1 architecture.',
                     'Short stage visits ending in native abandonment are reported separately from a completed match.',
                     'A restored on-demand ticket restarts its saved configuration; no unsupported physical duel checkpoint is claimed.',
                     'Automated Chromium inputs do not certify physical controllers or human gameplay.']}


def inherit(relative, names):
    tree = ast.parse((REPO / relative).read_text())
    nodes = [node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name in names]
    if {node.name for node in nodes} != set(names):
        raise RuntimeError('Native helper missing: ' + relative)
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(REPO / relative), 'exec'), globals())


inherit(HELPERS[0], ['node_json', 'trials', 'enter', 'open_view', 'release', 'trials_home', 'abandon_trial', 'plane_displacement'])
inherit(HELPERS[1], ['Keys'])

_historical_trials_home = trials_home


def trials_home(page):
    # The historical helper starts at the fighter/program screens. Reach that
    # screen through the real back/continue controls when leaving arena/results.
    for selector in ['[data-xt="new-duel"]', '[data-xt="back-fighters"]']:
        control = page.locator(selector)
        if control.is_visible() and control.is_enabled():
            enter(page, selector)
    _historical_trials_home(page)


def write_report():
    (OUT / 'report.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=2) + '\n')


def check(label, condition, evidence=None):
    if not condition:
        REPORT['failedCheck'] = {'label': label, 'evidence': evidence}
        write_report()
        raise AssertionError(label)
    REPORT['checks'].append({'label': label, 'evidence': evidence})
    print('PASS ' + label, flush=True)
    write_report()


def source_manifest():
    paths = [*REPO.glob('src/**/*.js'), *REPO.glob('*.css'), REPO / 'index.html', REPO / 'sw.js',
             REPO / 'package.json', REPO / 'package-lock.json', Path(__file__).resolve(), *[REPO / path for path in HELPERS]]
    for namespace in ['assets/openai/stages/xeno-trials-v192', 'assets/openai/stages/xeno-trials-v190',
                      'assets/openai/sprites/xeno-trials-v191']:
        paths.extend(path for path in (REPO / namespace).glob('**/*') if path.is_file())
    return {str(path.relative_to(REPO)): hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(set(paths))}


def settle(page):
    page.wait_for_function("()=>[...document.querySelectorAll('.view.active')].every(e=>!e.getAnimations().some(a=>a.animationName==='enter'&&a.playState==='running'))", timeout=5000)
    page.evaluate('()=>document.fonts.ready')


def capture(page, name):
    settle(page)
    page.screenshot(path=str(OUT / name), full_page=True)
    REPORT['captures'].append(name)


def fixture(page):
    raw = subprocess.check_output(['node', '--input-type=module', '-e',
        "import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA_STAGES_V192';s.worldId='world-05-lethe';s.scene='command';s.settings.music=0;s.settings.effects=.2;s.settings.reducedMotion=false;s.xenoTrialsV96.credits=30000;console.log(JSON.stringify(s));"], cwd=REPO)
    (OUT / 'unplayed-credit-profile.json').write_bytes(raw)
    REPORT['fixtureSha256'] = hashlib.sha256(raw).hexdigest()
    page.locator('#save-import').set_input_files({'name': 'unplayed-credit-profile.json', 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function("__ATF_V51__.saveSystem.data.player.name==='QA_STAGES_V192'")


def response_receipt(response):
    path = unquote(urlparse(response.url).path).lstrip('/')
    if response.status >= 400:
        REPORT['httpErrors'].append({'url': response.url, 'status': response.status})
    if not path.endswith(('.js', '.css', '.png')) or not ('v192' in path or path in ['src/xeno-trials-runtime-v96.js', 'src/xeno-trials-ui-v96.js', 'src/xeno-trials-data-v96.js']):
        return
    local = REPO / path
    if not local.is_file():
        return
    try:
        data = response.body()
        digest = hashlib.sha256(data).hexdigest()
        REPORT['httpBodies'][path] = {'sha256': digest, 'bytes': len(data), 'matchesDisk': digest == hashlib.sha256(local.read_bytes()).hexdigest(), 'status': response.status}
    except Exception as error:
        REPORT.setdefault('responseReceiptErrors', []).append({'path': path, 'error': str(error)})


CATALOG = node_json("import{XENO_TRIALS_STAGES_V96 as stages,XENO_TRIALS_FIGHTERS_V96 as fighters}from'./src/xeno-trials-data-v96.js';console.log(JSON.stringify({stages,fighters:fighters.map(({id,label,family})=>({id,label,family}))}));")
STAGES = CATALOG['stages']
ADDITIONS = [stage for stage in STAGES if stage.get('stageRevision') == 192]
BY_ID = {stage['id']: stage for stage in STAGES}
FIGHTERS = {fighter['id']: fighter for fighter in CATALOG['fighters']}
requested = ARGS.stages.split(',') if ARGS.stages else [stage['id'] for stage in ADDITIONS]
if not requested or any(stage not in BY_ID or BY_ID[stage].get('stageRevision') != 192 for stage in requested):
    raise SystemExit('This run needs existing, genuinely admitted V192 stage IDs.')
if ARGS.mode == 'all' and (ARGS.stages or len(ADDITIONS) != 50 or len(STAGES) != 100):
    raise SystemExit('Final all-mode requires the complete fifty-stage admission and historical hundred-stage catalog.')
REPRESENTATIVES = {stage['media']: stage['id'] for stage in reversed(ADDITIONS)}


def wait_active(page):
    page.wait_for_function('()=>{const m=__ATF_XENO_TRIALS_V96__.snapshot().match;return m&&!m.paused&&m.presentation.phase==="active"}', timeout=45000)
    page.locator('[data-xt="canvas"]').focus()


def arena_setup(page, fighter_id='warrior', opponent='runner'):
    open_view(page, 'xenotrials')
    trials_home(page)
    enter(page, '[data-xt-branch="on-demand"]')
    page.locator('[name="opponentFamily"]').select_option(FIGHTERS[opponent]['family'])
    page.locator('[name="opponentId"]').select_option(opponent)
    page.locator('[name="difficulty"]').select_option('easy')
    enter(page, '[data-xt="confirm-target"]')
    page.locator('[data-xt="search"]').fill(FIGHTERS[fighter_id]['label'])
    if fighter_id not in trials(page)['progress']['unlocked']:
        before = trials(page)['progress']
        enter(page, '[data-xt-unlock="' + fighter_id + '"]')
        after = trials(page)['progress']
        check(fighter_id + ': the real purchase adds only this unlocked specimen and debits its price', set(after['unlocked']) == set(before['unlocked']) | {fighter_id} and after['credits'] < before['credits'])
    enter(page, '[data-xt-fighter="' + fighter_id + '"]')
    enter(page, '[data-xt="confirm-fighters"]')


def begin_stage(page, stage_id, fighter_id='warrior', opponent='runner'):
    arena_setup(page, fighter_id, opponent)
    page.locator('[name="stageId"]').select_option(stage_id)
    check(stage_id + ': native stage selection reveals the selected exact card', page.locator('[data-xt-arena="' + stage_id + '"]').count() == 1 and page.locator('[data-xt-arena="' + stage_id + '"]').get_attribute('aria-pressed') == 'true')
    before = trials(page)['progress']
    enter(page, '[data-xt="start"]')
    wait_active(page)
    current = trials(page)
    check(stage_id + ': the native start creates its canonical saved ticket without an entry charge', current['match']['config']['stageId'] == stage_id and current['progress']['pending']['config']['stageId'] == stage_id and current['progress']['credits'] == before['credits'])
    return current['match']


def scene(match):
    return match['stageSceneV192']


def atomic_canvas(page, stage_id):
    packet = page.evaluate("()=>({match:__ATF_XENO_TRIALS_V96__.snapshot().match,png:document.querySelector('[data-xt=\"canvas\"]').toDataURL('image/png')})")
    data = base64.b64decode(packet['png'].split(',', 1)[1])
    name = stage_id + '-native-canvas.png'
    (OUT / name).write_bytes(data)
    REPORT['canvasExports'].append({'file': name, 'sha256': hashlib.sha256(data).hexdigest(), 'stageId': stage_id, 'tick': packet['match']['tick'], 'method': 'Atomic read of the actual runtime snapshot and existing Canvas pixels; no composition or scheduler replacement.'})
    return packet['match']


def verify_scene(stage, match):
    current = scene(match)
    rear, front = current['rear'], current['front']
    planes = rear['drawnPlanes'] + front['drawnPlanes']
    expected = stage['atlasV192']
    check(stage['id'] + ': the actual renderer submits its three admitted unequal source bands', len(planes) == 3 and [plane['id'] for plane in planes] == ['far', 'middle', 'foreground'] and not rear['proceduralFallback'] and not front['proceduralFallback'] and all(plane['drawn'] and plane['stageId'] == stage['id'] and plane['path'] == stage['backdrop'] and plane['expectedSourceSha256'] == expected['sha256'] and plane['sourceIdentity'] == 'admitted-registry-expected-sha256' and plane['sourceRect'] == expected['sourceRects'][index] and 0 < plane['tiles'] <= 2 and plane['renderTick'] == rear['renderTick'] for index, plane in enumerate(planes)), planes)
    check(stage['id'] + ': rear and foreground clipping preserve the real fighting plane', rear['rearClip']['height'] == rear['floor'] and front['frontClip']['y'] == front['floor'] + 8 and rear['affectsCombat'] is False and front['affectsCombat'] is False)
    check(stage['id'] + ': a location-specific cosmetic incident is actually drawn under the match clock', bool(rear['eventReceipts']) and all(event['drawn'] and event['kind'] in stage['sceneV192']['eventKinds'] and event['renderTick'] == rear['renderTick'] and event['affectsCombat'] is False for event in rear['eventReceipts']), rear['eventReceipts'])
    response = REPORT['httpBodies'].get(stage['backdrop'].lstrip('/'))
    check(stage['id'] + ': independent HTTP bytes corroborate the expected source hash of the drawn image', response is not None and response['matchesDisk'] and response['sha256'] == expected['sha256'], response)
    return current


def pause_trial(page):
    release(page)
    page.locator('[data-xt="canvas"]').focus()
    if not trials(page)['match']['paused']:
        page.keyboard.press('KeyP')
        page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().match.paused')


def representative_case(page, stage_id):
    first = trials(page)['match']
    page.keyboard.down('ArrowLeft')
    page.wait_for_timeout(1000)
    release(page)
    left = trials(page)['match']
    page.keyboard.down('ArrowRight')
    page.keyboard.press('Space', delay=35)
    page.wait_for_timeout(1600)
    release(page)
    right = trials(page)['match']
    cameras = [first['cameraV119']['center'], left['cameraV119']['center'], right['cameraV119']['center']]
    old_planes = scene(first)['rear']['drawnPlanes'] + scene(first)['front']['drawnPlanes']
    later = right if abs(cameras[2] - cameras[0]) > abs(cameras[1] - cameras[0]) else left
    new_planes = scene(later)['rear']['drawnPlanes'] + scene(later)['front']['drawnPlanes']
    depths = [plane_displacement(a, b) for a, b in zip(old_planes, new_planes)]
    check(stage_id + ': real bidirectional movement advances the camera and three different image depths', left['fighters'][0]['x'] < first['fighters'][0]['x'] and right['fighters'][0]['x'] > left['fighters'][0]['x'] and max(cameras) - min(cameras) > 5 and 0 < depths[0] < depths[1] < depths[2], {'cameras': cameras, 'planeDisplacements': depths, 'positions': [first['fighters'][0]['x'], left['fighters'][0]['x'], right['fighters'][0]['x']]})
    pause_trial(page)
    paused = trials(page)['match']
    page.wait_for_timeout(400)
    still = trials(page)['match']
    check(stage_id + ': native pause freezes the exact scenery and simulation tick', paused['tick'] == still['tick'] and scene(paused) == scene(still))
    capture(page, stage_id + '-native-pause.png')
    REPORT.setdefault('representativeChecks', {})[stage_id] = {'media': BY_ID[stage_id]['media'], 'cameras': cameras, 'planeDisplacements': depths, 'pausedScene': scene(paused)}
    enter(page, '[data-xt="resume-overlay"]')
    wait_active(page)


def stage_visits(page):
    for stage_id in requested:
        print('STEP Native stage ' + stage_id, flush=True)
        begin_stage(page, stage_id)
        match = atomic_canvas(page, stage_id)
        first = verify_scene(BY_ID[stage_id], match)
        page.wait_for_function('tick=>__ATF_XENO_TRIALS_V96__.snapshot().match.tick>tick', arg=match['tick'], timeout=5000)
        advanced = trials(page)['match']
        check(stage_id + ': the background schedule follows accepted native ticks', advanced['tick'] > match['tick'] and scene(advanced)['rear']['renderTick'] > first['rear']['renderTick'])
        if ARGS.mode == 'checks' or ARGS.mode == 'all' and stage_id in REPRESENTATIVES.values():
            representative_case(page, stage_id)
        REPORT['stages'].append({'stageId': stage_id, 'media': BY_ID[stage_id]['media'], 'first': first, 'camera': match['cameraV119'], 'tick': match['tick'], 'ending': 'Partial native visit followed by real abandonment; no match victory.'})
        abandon_trial(page)
        check(stage_id + ': native abandonment clears the ticket without a win', trials(page)['progress']['pending'] is None and trials(page)['progress']['ledger'][-1]['winner'] == 'abandoned')


def page_rows(page):
    return page.locator('[data-xt-arena]').evaluate_all("es=>es.map(e=>({id:e.dataset.xtArena,selected:e.getAttribute('aria-pressed'),viewBox:e.querySelector('svg')?.getAttribute('viewBox'),path:e.querySelector('svg image')?.getAttribute('href')||e.querySelector('img')?.getAttribute('src')}))")


def ui_cases(page):
    arena_setup(page)
    saved = trials(page)['progress']
    options = page.locator('[name="stageId"] option').evaluate_all('(es)=>es.map(e=>e.value)')
    check('The native stage selector keeps every historical and admitted new stage ID', options == [stage['id'] for stage in STAGES])
    seen, pages = [], []
    while True:
        rows = page_rows(page)
        check('The native arena page is bounded to twelve cards', 0 < len(rows) <= 12)
        new_rows = [row for row in rows if BY_ID[row['id']].get('stageRevision') == 192]
        if new_rows:
            check('The actual native thumbnails expose only each admitted first image band', all(row['path'] == BY_ID[row['id']]['backdrop'] and [int(value) for value in row['viewBox'].split()] == BY_ID[row['id']]['atlasV192']['sourceRects'][0] for row in new_rows), new_rows)
        seen.extend(row['id'] for row in rows)
        pages.append(page.locator('[data-xt="stage-page"]').inner_text())
        if page.locator('[data-xt="stage-next"]').is_disabled():
            break
        enter(page, '[data-xt="stage-next"]')
    check('Every arena is reachable exactly once through native pagination', seen == [stage['id'] for stage in STAGES], {'pages': pages, 'ids': seen})
    media_data = {}
    original = page.locator('[name="stageId"]').input_value()
    for media in ['film', 'series', 'game', 'comic', 'novel', 'simulation']:
        page.locator('[data-xt="stage-media"]').select_option(media)
        collected = []
        while True:
            rows = page_rows(page)
            check('The ' + media + ' filter keeps native card count bounded', len(rows) <= 12)
            collected.extend(row['id'] for row in rows)
            if page.locator('[data-xt="stage-next"]').is_disabled():
                break
            enter(page, '[data-xt="stage-next"]')
        expected = [stage['id'] for stage in STAGES if stage.get('media', 'simulation') == media]
        check('The ' + media + ' filter exposes only its exact stages and preserves selection', collected == expected and page.locator('[name="stageId"]').input_value() == original, collected)
        media_data[media] = collected
    enter(page, '[data-xt="arena-selection"]')
    check('Find selected arena restores the complete filter and focused current card', page.locator('[data-xt="stage-media"]').input_value() == 'all' and page.locator('[data-xt-arena="' + original + '"]').get_attribute('aria-pressed') == 'true')
    check('Reading every arena page and filter creates no ticket, debit or reward', trials(page)['progress'] == saved)
    capture(page, 'arena-catalog-fr.png')
    REPORT['catalog'] = {'total': len(STAGES), 'new': len(ADDITIONS), 'pages': pages, 'media': media_data}
    trials_home(page)



def language_case(page):
    open_view(page, 'settings')
    page.locator('#language-select-v185').select_option('en')
    arena_setup(page)
    selected = ADDITIONS[0]
    page.locator('[name="stageId"]').select_option(selected['id'])
    page.wait_for_function("value=>document.querySelector('[data-xt-arena=\"'+value.id+'\"] strong')?.textContent.trim()===value.labelEn", arg=selected)
    check('The native English card and stage selector translate the selected franchise location', page.locator('[name="stageId"] option:checked').text_content().strip() == selected['labelEn'] and page.locator('[data-xt-arena="' + selected['id'] + '"] strong').text_content().strip() == selected['labelEn'])
    check('The native selected-arena preview uses its exact first-band viewport', [int(value) for value in page.locator('[data-xt="stage-preview"] svg').get_attribute('viewBox').split()] == selected['atlasV192']['sourceRects'][0])
    capture(page, 'arena-franchise-selection-english.png')
    trials_home(page)
    open_view(page, 'settings')
    page.locator('#language-select-v185').select_option('fr')
    open_view(page, 'xenotrials')


def legacy_cases(page):
    visits = []
    for stage_id in ['containment-deck', 'xt179-workshop', 'xt190-adjudication-vault']:
        begin_stage(page, stage_id)
        current = atomic_canvas(page, stage_id)
        check(stage_id + ': the historical arena keeps its own renderer and never draws V192 planes', current['stageSceneV192'] == {'rear': None, 'front': None})
        if stage_id.startswith('xt190-'):
            old = current['stageSceneV190']
            check('The historical corporate atlas retains its three V190 image planes', len(old['rear']['drawnPlanes']) + len(old['front']['drawnPlanes']) == 3)
        visits.append({'stageId': stage_id, 'tick': current['tick'], 'ending': 'Native partial visit followed by abandonment, not a victory.'})
        abandon_trial(page)
    REPORT['legacyVisits'] = visits


def resume_case(page, stage_id):
    begin_stage(page, stage_id)
    pause_trial(page)
    before = trials(page)['progress']
    open_view(page, 'settings')
    page.reload(wait_until='domcontentloaded')
    enter(page, '#title-start')
    enter(page, '#title-options')
    open_view(page, 'xenotrials')
    restored = trials(page)['progress']
    check('A real reload retains the exact stage ticket, ledger and economy', restored == before and page.locator('[name="stageId"]').input_value() == stage_id)
    enter(page, '[data-xt="restart"]')
    wait_active(page)
    current = trials(page)
    check('The native saved-duel restart uses the same stage, match ID and seed', current['match']['config']['stageId'] == stage_id and current['match']['config']['matchId'] == before['pending']['matchId'] and current['match']['config']['seed'] == before['pending']['config']['seed'] and current['progress'] == before)
    REPORT['ticketReload'] = {'stageId': stage_id, 'pending': before['pending'], 'resumeKind': 'Saved on-demand configuration restart, not a physical checkpoint.'}
    abandon_trial(page)


def reduced_motion_case(page, stage_id):
    open_view(page, 'settings')
    page.locator('#setting-motion').check()
    open_view(page, 'xenotrials')
    begin_stage(page, stage_id)
    first = trials(page)['match']
    page.wait_for_timeout(350)
    page.wait_for_function('tick=>__ATF_XENO_TRIALS_V96__.snapshot().match.tick>tick', arg=first['tick'], timeout=5000)
    later = trials(page)['match']
    rear = scene(later)['rear']
    check('The real reduced-motion setting preserves all image planes and freezes decorative cadence only', rear['reducedMotion'] and rear['motionTick'] == 0 and not rear['eventReceipts'] and len(rear['drawnPlanes']) + len(scene(later)['front']['drawnPlanes']) == 3 and later['tick'] > first['tick'] and rear['renderTick'] > scene(first)['rear']['renderTick'])
    capture(page, 'arena-native-reduced-motion.png')
    abandon_trial(page)
    open_view(page, 'settings')
    page.locator('#setting-motion').uncheck()
    open_view(page, 'xenotrials')


def touch_case(page, stage_id):
    page.set_viewport_size({'width': 390, 'height': 844})
    begin_stage(page, stage_id)
    button = page.locator('[data-xeno-action="left"]')
    button.scroll_into_view_if_needed()
    box = button.bounding_box()
    before = trials(page)['match']
    session = page.context.new_cdp_session(page)
    session.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': box['x'] + box['width'] / 2, 'y': box['y'] + box['height'] / 2, 'id': 1}]})
    page.wait_for_timeout(450)
    session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    after = trials(page)['match']
    check('Trusted native touch on the mobile control moves the actual fighter in a franchise arena', after['fighters'][0]['x'] < before['fighters'][0]['x'] and after['tick'] > before['tick'])
    capture(page, 'arena-native-mobile-touch.png')
    abandon_trial(page)
    page.set_viewport_size({'width': 1440, 'height': 1000})


def victory_case(page, stage_id):
    begin_stage(page, stage_id, 'queen', 'boiler')
    before = trials(page)['progress']
    keys = Keys(page)
    last_heavy, last_light = -1000, -1000
    deadline = time.monotonic() + 170
    try:
        while time.monotonic() < deadline:
            match = trials(page)['match']
            stamp = [match['round'], match['phase'], match['tick'] // 600, match['paused']]
            trace = REPORT.setdefault('combatTrace', [])
            if not trace or trace[-1]['stamp'] != stamp:
                trace.append({'stamp': stamp, 'tick': match['tick'], 'wins': match['wins'], 'actors': [{key: actor.get(key) for key in ['id', 'x', 'hp', 'stamina', 'attack', 'stun']} for actor in match['fighters'][:2]]})
                write_report()
            if match['phase'] == 'match-over':
                break
            if match['phase'] == 'round-over':
                keys.clear()
                enter(page, '[data-xt="next"]')
                page.locator('[data-xt="canvas"]').focus()
                advanced = trials(page)['match']
                check('The native next-round button advances without an accidental focus pause', advanced['round'] == match['round'] + 1 and not advanced['paused'], {'beforeRound': match['round'], 'afterRound': advanced['round'], 'paused': advanced['paused']})
                continue
            if match['paused'] or match['presentation']['blocksSimulation']:
                keys.clear()
                page.wait_for_timeout(40)
                continue
            player, enemy = match['fighters'][:2]
            gap = page.evaluate("async fighters=>(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyGapV105(fighters[0],fighters[1])", match['fighters'])
            keys.use(['ArrowRight' if enemy['x'] > player['x'] else 'ArrowLeft'] if gap > 35 else [])
            if gap < 125 and not player['attack'] and player['stun'] <= 0:
                if match['tick'] - last_heavy >= 180 and player['stamina'] >= 25:
                    page.keyboard.press('KeyK', delay=35)
                    last_heavy = match['tick']
                elif match['tick'] - last_light >= 180 and match['tick'] - last_heavy >= 75 and player['stamina'] >= 12:
                    page.keyboard.press('KeyJ', delay=35)
                    last_light = match['tick']
            page.wait_for_timeout(35)
    finally:
        keys.clear()
    final = trials(page)
    check('A complete native best-of-three duel is genuinely won in a new franchise stage', final['match']['phase'] == 'match-over' and final['match']['result']['winner'] == 'player' and final['match']['wins']['player'] == 2, final['match']['result'])
    page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
    settled = trials(page)['progress']
    check('The complete native victory settles its actual ticket exactly once', settled['wins'] == before['wins'] + 1 and settled['ledger'][-1]['matchId'] == before['pending']['matchId'] and settled['ledger'][-1]['winner'] == 'player')
    capture(page, 'arena-complete-native-victory.png')
    REPORT['completeNativeMatches'] = [{'stageId': stage_id, 'result': final['match']['result'], 'settledLedger': settled['ledger'][-1]}]
    trials_home(page)


def export_profile(page):
    open_view(page, 'settings')
    before = page.evaluate('()=>structuredClone(__ATF_V51__.saveSystem.data)')
    with page.expect_download() as info:
        enter(page, '#save-export')
    path = OUT / 'final-native-profile.json'
    info.value.save_as(path)
    actual = json.loads(path.read_text())
    check('The final System download preserves the genuinely played Trials state', actual['xenoTrialsV96'] == before['xenoTrialsV96'] and actual['xenoArbiterV190'] == before['xenoArbiterV190'])
    REPORT['exports'].append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'kind': 'native-system-download', 'pending': actual['xenoTrialsV96']['pending'], 'wins': actual['xenoTrialsV96']['wins']})


before = source_manifest()
(OUT / 'source-start.json').write_text(json.dumps(before, indent=2) + '\n')
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, has_touch=True, service_workers='block', accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: REPORT['pageErrors'].append(str(error)))
    page.on('response', response_receipt)
    page.on('requestfailed', lambda request: REPORT['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        page.goto(ARGS.base, wait_until='domcontentloaded')
        enter(page, '#title-start')
        enter(page, '#title-options')
        fixture(page)
        if ARGS.mode in ['all', 'ui', 'checks']:
            ui_cases(page)
            language_case(page)
        if ARGS.mode in ['all', 'stages', 'checks']:
            stage_visits(page)
        if ARGS.mode in ['all', 'checks']:
            resume_case(page, requested[-1])
            reduced_motion_case(page, REPRESENTATIVES.get('film', requested[0]))
            touch_case(page, REPRESENTATIVES.get('comic', requested[-1]))
            victory_case(page, REPRESENTATIVES.get('game', requested[-1]))
        if ARGS.mode == 'victory':
            victory_case(page, requested[0])
        if ARGS.mode == 'checks':
            legacy_cases(page)
        if ARGS.mode == 'all':
            legacy_cases(page)
            observed = {path for path in REPORT['httpBodies'] if path.startswith('assets/openai/stages/xeno-trials-v192/')}
            check('Every one of the fifty newly drawn stage PNGs has independently verified HTTP bytes', len(observed) == 50 and observed == {stage['backdrop'].lstrip('/') for stage in ADDITIONS})
            check('All fifty newly admitted stages have a native rendered visit, separately from the completed duel', len(REPORT['stages']) == 50 and {stage['stageId'] for stage in REPORT['stages']} == {stage['id'] for stage in ADDITIONS})
        export_profile(page)
        check('Chromium reports no JavaScript, HTTP or failed requests', not REPORT['pageErrors'] and not REPORT['httpErrors'] and not REPORT['requestFailures'])
        check('Every captured HTTP module and image matches the actual local source bytes', REPORT['httpBodies'] and all(value['matchesDisk'] for value in REPORT['httpBodies'].values()) and not REPORT.get('responseReceiptErrors'))
        after = source_manifest()
        changed = sorted(path for path in set(before) | set(after) if before.get(path) != after.get(path))
        REPORT['sourceReceipt'] = {'beforeFiles': len(before), 'afterFiles': len(after), 'unchanged': not changed, 'changed': changed, 'harnessSha256': before[str(Path(__file__).resolve().relative_to(REPO))]}
        if not ARGS.allow_changing_sources:
            check('All browser-owned sources and new stage images remain frozen throughout the native run', not changed)
        REPORT['status'] = 'exploratory-passed' if ARGS.allow_changing_sources else 'passed'
    except Exception as error:
        REPORT['status'] = 'failed'
        REPORT['error'] = str(error)
        try:
            capture(page, 'failure.png')
            REPORT['failureState'] = trials(page)
        except Exception:
            pass
        raise
    finally:
        write_report()
        browser.close()

summary = {
    'status': REPORT['status'], 'mode': ARGS.mode, 'assertions': len(REPORT['checks']),
    'nativePageScreenshots': len(REPORT['captures']), 'nativeCanvasExports': len(REPORT['canvasExports']),
    'nativeV192StageVisits': len(REPORT['stages']), 'nativeV192StageIds': [entry['stageId'] for entry in REPORT['stages']],
    'completeNativeMatches': REPORT.get('completeNativeMatches', []), 'legacyVisits': REPORT.get('legacyVisits', []),
    'representativeMedia': {stage_id: entry['media'] for stage_id, entry in REPORT.get('representativeChecks', {}).items()},
    'sourceReceipt': REPORT['sourceReceipt'], 'httpBodies': len(REPORT['httpBodies']),
    'newPngBodies': len([path for path in REPORT['httpBodies'] if path.startswith('assets/openai/stages/xeno-trials-v192/')]),
    'httpMatch': all(value['matchesDisk'] for value in REPORT['httpBodies'].values()),
    'errors': {key: len(REPORT[key]) for key in ['pageErrors', 'httpErrors', 'requestFailures']},
    'exports': REPORT['exports'], 'fixtures': REPORT['fixtures'], 'limits': REPORT['limits']}
(OUT / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
(OUT / 'source-receipt.json').write_text(json.dumps(REPORT['sourceReceipt'], indent=2) + '\n')
