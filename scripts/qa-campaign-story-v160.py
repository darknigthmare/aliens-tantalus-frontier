"""QZ-18 through production UI, native travel/readers and actual operation results.
Evaluations observe only. Explicit profile fixtures enter through the Save picker.
ROOT owns Chromium execution; this script is never run by a child agent.
"""
import argparse
import hashlib
import json
import math
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
          'method': 'Production title/Save picker, disclosed unplayed QZ18 plan, preparation choice, real pause/reload, keyboard floor/gallery travel, six local readers, wrong and correct verdicts, native extraction, durable return dialogue, replay skip/retreat and a disclosed legacy resume derived from the actual native mid-level save.',
          'limitations': ['Automated native controls, not human QA or film/canonical1:1 certification.',
                          'One authored original Tantalus investigation; other campaigns are not certified by this journey.',
                          'The legacy fixture copies a native mid-level save actually created in this run and removes insertionState to model an older version; no earlier travel is fabricated.',
                          'Illustrated ship/approach shots are not recovered film clips or voice recordings; deployment uses the same QZ18 scene renderer as the level.']}


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
    return {str(path.relative_to(repo)): hashlib.sha256(path.read_bytes()).hexdigest() for path in files}


def observed(page):
    return page.evaluate('''()=>{const s=__ATF_V51__.saveSystem.data,e=__ATF_GAME__;return {
      save:structuredClone(s),running:e.running,paused:e.paused,mission:e.mission?.state,
      player:e.player?{x:e.player.x,y:e.player.y,w:e.player.w,h:e.player.h,vx:e.player.vx,climbing:e.player.climbing}:null,
      camera:{...e.camera},archive:e.archiveRelayV122?structuredClone(e.archiveRelayV122):null,
      presentation:e.running?e.getSnapshot().archiveRelayPresentationV160||null:null,
      insertionVisible:!document.querySelector('#mission-insertion-v62')?.hidden,
      panel:document.querySelector('.view.active')?.dataset.panel};}''')


def open_view(page, view):
    target = page.locator(f'[data-panel="{view}"].active')
    if target.is_visible():
        return
    # The fullscreen ship owns a visible exit; its hidden navigation is not a
    # route a player can use. Exit to command before choosing another panel.
    exit_hub = page.locator('#exit-hub')
    if exit_hub.is_visible():
        exit_hub.click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
        if target.is_visible():
            return
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{view}"]').click()


def capture(page, name, selector='#game-canvas'):
    page.locator(selector).screenshot(path=str(output / name))
    report['captures'].append(name)


def import_profile(page, raw, name):
    open_view(page, 'settings')
    page.locator('#save-import').set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function("()=>document.querySelector('#save-import').value==='' ")


def open_plan(page):
    open_view(page, 'command')
    page.locator('[data-panel="command"].active #operation-launch').wait_for(state='visible')


def continue_existing_profile(page):
    # The first title button opens the title menu; CONTINUER owns resumption.
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-continue').click()


def advance_to_insertion_phase(page, target):
    # The native mission can insert its own causal incident between approach
    # and deployment. Follow the real displayed phase and its actual button.
    for _ in range(7):
        root = page.locator('#mission-insertion-v62')
        current = root.get_attribute('data-insertion-phase')
        if current == target:
            return
        if current == 'incident':
            report.setdefault('nativeIncidentsVisited', []).append(current)
        page.locator('[data-insertion-action="advance"]').click()
        page.wait_for_function('previous=>document.querySelector("#mission-insertion-v62").dataset.insertionPhase!==previous', arg=current)
    raise AssertionError('Insertion did not reach its native ' + target + ' phase.')


def walk_center(page, x):
    player = observed(page)['player']
    current = player['x'] + player['w'] / 2
    if abs(current - x) < 4:
        return
    key = 'KeyD' if x > current else 'KeyA'
    page.locator('#game-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function('''target=>{const p=__ATF_GAME__.player,c=p.x+p.w/2;return target.right?c>=target.x-3:c<=target.x+3}''',
                               arg={'x': x, 'right': x > current}, timeout=45000)
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_GAME__.player.vx)<1', timeout=15000)


def hold_until(page, key, condition, timeout=15000):
    page.locator('#game-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function(condition, timeout=timeout)
    finally:
        page.keyboard.up(key)


def read_station(page):
    page.locator('#game-canvas').focus()
    page.keyboard.press('e')
    page.locator('[data-qz18-control]').first.wait_for(state='visible')
    ids = page.locator('[data-qz18-control]').evaluate_all('(nodes)=>nodes.map(node=>node.dataset.qz18Control)')
    for document_id in ids:
        page.locator(f'[data-qz18-control="{document_id}"]').click()
    page.get_by_role('button', name='FERMER ET REPRENDRE', exact=True).click()
    page.locator('#game-canvas').focus()


def start_runtime(page):
    page.locator('[data-insertion-action="advance"]').click()
    page.wait_for_function('()=>__ATF_GAME__?.running&&__ATF_GAME__.isArchiveRelayV122?.()&&!document.querySelector("#mission-runtime-v62").hidden')
    page.wait_for_function('()=>__ATF_GAME__.getSnapshot().archiveRelayPresentationV160?.ready===true')
    page.locator('#game-canvas').focus()


def protected(save):
    result = {key: save[key] for key in ['clock', 'galaxy', 'hub', 'crew', 'statistics', 'archiveRelayArchivesV122']}
    result['archiveRelayArchivesV122'] = json.loads(json.dumps(result['archiveRelayArchivesV122']))
    ledger = result['archiveRelayArchivesV122'].get('lastReturnV160', {}).get('ledger')
    if isinstance(ledger, dict):
        # These two explicit reading fields are checked against their complete
        # expected values after every click. Evidence, receipt and all other
        # durable return fields remain inside this strict protected projection.
        ledger.pop('readTopics', None)
        ledger.pop('activeTopic', None)
    return result


def return_ledgers(save):
    archived = save['archiveRelayArchivesV122'].get('lastReturnV160', {})
    current = save['strategy'].get('lastOperation')
    insertion = current.get('insertionState') if current and current.get('id') == archived.get('operationId') else None
    preparation = next((item for item in insertion['phases'] if item['kind'] == 'preparation'), None) if insertion else None
    return {'durable': archived.get('ledger'),
            'latestOperation': preparation.get('payload', {}).get('campaignStoryReturnV160') if preparation else None,
            'latestOperationMatches': bool(current and current.get('id') == archived.get('operationId'))}


def protected_difference(before, after, path=''):
    if isinstance(before, dict) and isinstance(after, dict):
        rows = []
        for key in sorted(set(before) | set(after)):
            location = path + '/' + key
            if key not in before or key not in after:
                rows.append({'path': location, 'before': before.get(key), 'after': after.get(key)})
            else:
                rows.extend(protected_difference(before[key], after[key], location))
        return rows
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        return [row for index, (left, right) in enumerate(zip(before, after))
                for row in protected_difference(left, right, path + '/' + str(index))]
    return [] if before == after else [{'path': path, 'before': before, 'after': after}]


source_start = manifest()
(output / 'profile-source-start.json').write_text(json.dumps(source_start, indent=2))
script = """import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA QZ18 V160';s.strategy.plannedCampaignId='special-archive-relay';s.worldId='world-05-lethe';s.scene='hub';s.settings.reducedMotion=false;console.log(JSON.stringify(s));"""
raw = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo, capture_output=True, text=True, check=True).stdout.encode()
(output / 'disclosed-unplayed-qz18-plan.json').write_bytes(raw)
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
    try:
        phase('new QZ18 operation and native preparation choice')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'unplayed-qz18-plan.json', 'mimeType': 'application/json', 'buffer': raw})
        page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA QZ18 V160'")
        open_plan(page)
        page.locator('#operation-launch').click()
        page.locator('#mission-insertion-v62[data-insertion-phase="briefing"]').wait_for(state='visible')
        check('a new solo QZ18 operation actually enters its authored insertion', 'Ramenez les relevés' in page.locator('#mission-insertion-v62').inner_text())
        actual_insertion = observed(page)['save']['strategy']['currentOperation']['insertionState']
        report['nativeInsertionPhaseKinds'] = [item['kind'] for item in actual_insertion['phases']]
        check('the journey observes the real native phase sequence, including any causal incident', report['nativeInsertionPhaseKinds'] in [
            ['briefing', 'preparation', 'approach', 'deployment', 'player-control'],
            ['briefing', 'preparation', 'approach', 'incident', 'deployment', 'player-control']])
        capture(page, '01-authored-briefing.png', '#mission-insertion-v62')
        page.locator('[data-insertion-action="advance"]').click()
        before_choice = observed(page)['save']
        page.locator('[data-story-protocol="technical-audit"]').click()
        choice = observed(page)['save']
        selected = next(item for item in choice['strategy']['currentOperation']['insertionState']['phases'] if item['kind'] == 'preparation')['payload']['campaignStoryV160']
        check('actual preparation selection persists without paying a premature bonus', selected['protocolId'] == 'technical-audit' and protected(choice) == protected(before_choice))
        capture(page, '02-protocol-selected.png', '#mission-insertion-v62')
        page.locator('[data-insertion-action="pause"]').click()
        page.locator('[data-panel="command"].active').wait_for(state='visible')
        paused = observed(page)['save']
        check('pause returns to the real command plan with the same active operation', paused['strategy']['currentOperation']['insertionState']['paused'] is True)
        page.reload(wait_until='domcontentloaded')
        continue_existing_profile(page)
        open_plan(page)
        page.locator('#operation-launch').click()
        page.locator('[data-insertion-action="resume"]').click()
        check('reload restores the selected preparation and its clock, not a fresh deployment cost', page.locator('[data-story-protocol="technical-audit"]').get_attribute('aria-pressed') == 'true' and observed(page)['save']['clock'] == paused['clock'])
        advance_to_insertion_phase(page, 'approach')
        capture(page, '03-approach.png', '#mission-insertion-v62')
        advance_to_insertion_phase(page, 'deployment')
        page.locator('[data-native-relay-shot][data-presentation-ready="true"]').wait_for()
        capture(page, '04-native-deployment-shot.png', '#mission-insertion-v62')
        advance_to_insertion_phase(page, 'player-control')
        start_runtime(page)
        initial = observed(page)
        check('mission scene loads the shared frontal layout and keeps both actual elevations', initial['presentation']['ready'] and initial['presentation']['projection'] == 'whole-room-2d' and {p['contactY'] for p in initial['presentation']['layout']['primary']} == {355, 570})
        capture(page, '05-native-west-quay.png')

        phase('actual floor and gallery journey with six local documents')
        walk_center(page, 140); read_station(page)
        walk_center(page, 330)
        hold_until(page, 'KeyE', '()=>__ATF_GAME__.archiveRelayV122.power===true')
        walk_center(page, 445)
        hold_until(page, 'KeyW', '()=>__ATF_GAME__.player.y+__ATF_GAME__.player.h<=355.5')
        page.wait_for_function('()=>Math.abs(__ATF_GAME__.player.y+__ATF_GAME__.player.h-355)<2&&!__ATF_GAME__.player.climbing')
        walk_center(page, 570); read_station(page)
        walk_center(page, 880); read_station(page)
        capture(page, '06-native-gallery.png')
        check('engineering and security were reached on their real gallery', abs(observed(page)['player']['y'] + observed(page)['player']['h'] - 355) < 2)
        walk_center(page, 445)
        hold_until(page, 'KeyS', '()=>__ATF_GAME__.player.y+__ATF_GAME__.player.h>=569.5')
        walk_center(page, 1010); read_station(page)
        hold_until(page, 'KeyF', '()=>__ATF_GAME__.archiveRelayV122.restoredDraft===true')
        read_station(page)
        check('six real local documents are read before any verdict', len(observed(page)['archive']['readIds']) == 6 and observed(page)['archive']['verdict'] is None)
        walk_center(page, 1150)
        page.keyboard.press('e')
        page.locator('[data-qz18-control="clock-failure"]').click()
        check('the contradicted technical explanation is rejected without a false culprit', observed(page)['archive']['verdict'] is None and observed(page)['archive']['rejectedVerdicts'] >= 1)
        capture(page, '07-contradicted-verdict.png', '[role="dialog"]:visible')
        page.locator('[data-qz18-control="delayed-distress"]').click()
        page.get_by_role('button', name='FERMER ET REPRENDRE', exact=True).click()
        check('only the supported verdict opens the actual return gate', observed(page)['archive']['verdict'] == 'delayed-distress')
        walk_center(page, 1680)
        far = observed(page)
        check('the far bay uses the real camera instead of a fixed oversized backdrop', far['camera']['x'] > 400 and far['presentation']['layout']['primary'][0]['x'] < 150)
        capture(page, '08-native-return-bay.png')
        hold_until(page, 'KeyE', '()=>__ATF_V51__.saveSystem.data.strategy.lastOperation?.success===true&&!__ATF_V51__.saveSystem.data.strategy.currentOperation')
        victory = observed(page)['save']
        returned = victory['strategy']['lastOperation']
        ledger = next(item for item in returned['insertionState']['phases'] if item['kind'] == 'preparation')['payload']['campaignStoryReturnV160']
        check('actual extraction transfers six records and pays only the selected technical protocol', len(victory['archiveRelayArchivesV122']['case']['documentIds']) == 6 and victory['archiveRelayArchivesV122']['case']['operationId'] == returned['id'] and ledger['receipt']['protocolId'] == 'technical-audit' and ledger['receipt']['amount'] == 2)
        check('a durable victory offers an explicit return aboard instead of retreat', page.locator('#retreat-mission').inner_text().strip() == 'RETOUR À BORD')
        # Mission mode owns its visible exit; navigation is available afterward.
        page.locator('#retreat-mission').click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("mission-mode")')
        back_aboard = observed(page)['save']
        board_ledger = next(item for item in back_aboard['strategy']['lastOperation']['insertionState']['phases'] if item['kind'] == 'preparation')['payload']['campaignStoryReturnV160']
        check('the actual return aboard keeps the victory receipt and cannot repay it', back_aboard['strategy']['currentOperation'] is None and back_aboard['strategy']['lastOperation']['id'] == returned['id'] and back_aboard['strategy']['lastOperation']['success'] is True and back_aboard['galaxy']['resources'] == victory['galaxy']['resources'] and back_aboard['archiveRelayArchivesV122'] == victory['archiveRelayArchivesV122'] and board_ledger['receipt'] == ledger['receipt'])
        open_plan(page)
        check('return dialogue distinguishes documented cause and unidentified author', 'l’identité de son auteur reste inconnue' in page.locator('[data-campaign-story-return]').inner_text())
        capture(page, '09-return-dialogue.png', '#operation-plan')
        # Native hub exit persists the actual hub pose before command becomes
        # active. Isolate the question clicks from that earlier navigation.
        question_save = observed(page)['save']
        before_questions = protected(question_save)
        ledger_baseline = return_ledgers(question_save)
        expected_reads = list(ledger_baseline['durable']['readTopics'])
        report['questionInvariants'] = {
            'fields': list(before_questions),
            'readingFieldsComparedSeparately': ['/archiveRelayArchivesV122/lastReturnV160/ledger/readTopics', '/archiveRelayArchivesV122/lastReturnV160/ledger/activeTopic'],
            'ledgerBeforeQuestions': ledger_baseline,
            'afterReturnBeforeCommand': protected(back_aboard),
            'beforeQuestionsAfterCommand': before_questions,
            'navigationDifference': protected_difference(protected(back_aboard), before_questions),
            'observations': []}
        for topic in ['chronology', 'identity', 'return']:
            page.locator(f'[data-campaign-story-topic="{topic}"]').click()
            actual_save = observed(page)['save']
            current = protected(actual_save)
            if topic not in expected_reads:
                expected_reads.append(topic)
            expected_ledger = {**ledger_baseline['durable'], 'readTopics': list(expected_reads), 'activeTopic': topic}
            actual_ledgers = return_ledgers(actual_save)
            focus_preserved = page.evaluate('topic => { const active = document.activeElement; return Boolean(active?.isConnected && active.dataset.campaignStoryTopic === topic); }', topic)
            ledgers_match = actual_ledgers['durable'] == expected_ledger and actual_ledgers['latestOperationMatches'] and actual_ledgers['latestOperation'] == expected_ledger
            report['questionInvariants']['observations'].append({'pass': 'first-reading', 'topic': topic,
                'expectedLedger': expected_ledger, 'actualLedgers': actual_ledgers, 'ledgersMatchExactly': ledgers_match, 'focusPreserved': focus_preserved,
                'protectedSnapshot': current, 'differenceFromBeforeQuestions': protected_difference(before_questions, current)})
        after_reading = observed(page)['save']
        for topic in ['chronology', 'identity', 'return']:
            page.locator(f'[data-campaign-story-topic="{topic}"]').click()
            actual_save = observed(page)['save']
            current = protected(actual_save)
            expected_ledger = {**ledger_baseline['durable'], 'readTopics': list(expected_reads), 'activeTopic': topic}
            actual_ledgers = return_ledgers(actual_save)
            focus_preserved = page.evaluate('topic => { const active = document.activeElement; return Boolean(active?.isConnected && active.dataset.campaignStoryTopic === topic); }', topic)
            ledgers_match = actual_ledgers['durable'] == expected_ledger and actual_ledgers['latestOperationMatches'] and actual_ledgers['latestOperation'] == expected_ledger
            report['questionInvariants']['observations'].append({'pass': 'repeated-reading', 'topic': topic,
                'expectedLedger': expected_ledger, 'actualLedgers': actual_ledgers, 'ledgersMatchExactly': ledgers_match, 'focusPreserved': focus_preserved,
                'protectedSnapshot': current, 'differenceFromBeforeQuestions': protected_difference(before_questions, current)})
        check('first and repeated questions preserve strategy while updating both reading ledgers exactly', all(not row['differenceFromBeforeQuestions'] and row['ledgersMatchExactly'] for row in report['questionInvariants']['observations']))
        check('first and repeated native question activations retain focus on the connected replacement button', all(row['focusPreserved'] for row in report['questionInvariants']['observations']))
        before_reload = observed(page)['save']
        topics_before_reload = {topic: page.locator(f'[data-campaign-story-topic="{topic}"]').inner_text() for topic in ['chronology', 'identity', 'return']}
        reload_started = time.monotonic()
        session_before_reload = page.evaluate('()=>({epochMillis:Date.now(),timeOrigin:performance.timeOrigin,pageAgeMillis:performance.now()})')
        page.reload(wait_until='domcontentloaded')
        continue_existing_profile(page)
        open_plan(page)
        after_reload = observed(page)['save']
        reload_interval = time.monotonic() - reload_started
        session_after_reload = page.evaluate('()=>({epochMillis:Date.now(),timeOrigin:performance.timeOrigin,pageAgeMillis:performance.now()})')
        # beforeunload persists actual wall-clock playSeconds since this page's
        # session start. Its start cannot predate the observed page lifetime.
        # The ceil bound includes the measured reload/navigation interval, not
        # strategic hours or an arbitrary allowance for resource changes.
        maximum_play_seconds_delta = math.ceil(session_before_reload['pageAgeMillis'] / 1000 + reload_interval)
        old_seconds, new_seconds = before_reload['statistics']['playSeconds'], after_reload['statistics']['playSeconds']
        play_seconds_valid = type(old_seconds) is int and type(new_seconds) is int and 0 <= new_seconds - old_seconds <= maximum_play_seconds_delta
        old_npc_time = before_reload['hub']['npcCirculationV158']['actor']['time']
        new_npc_time = after_reload['hub']['npcCirculationV158']['actor']['time']
        npc_time_valid = (type(old_npc_time) in [int, float] and type(new_npc_time) in [int, float]
                          and math.isfinite(old_npc_time) and math.isfinite(new_npc_time) and new_npc_time >= old_npc_time)
        differences = protected_difference(protected(before_reload), protected(after_reload))
        allowed_paths = {'/statistics/playSeconds', '/hub/npcCirculationV158/actor/time'}
        unexpected_differences = [row for row in differences if row['path'] not in allowed_paths]
        last_before, last_after = before_reload['strategy']['lastOperation'], after_reload['strategy']['lastOperation']
        ledger_before = next(item for item in last_before['insertionState']['phases'] if item['kind'] == 'preparation')['payload']['campaignStoryReturnV160']
        ledger_after = next(item for item in last_after['insertionState']['phases'] if item['kind'] == 'preparation')['payload']['campaignStoryReturnV160']
        durable_ledgers_before, durable_ledgers_after = return_ledgers(before_reload), return_ledgers(after_reload)
        topics_after_reload = {topic: page.locator(f'[data-campaign-story-topic="{topic}"]').inner_text() for topic in ['chronology', 'identity', 'return']}
        report['reloadInvariants'] = {
            'before': protected(before_reload), 'after': protected(after_reload), 'differences': differences,
            'unexpectedDifferences': unexpected_differences,
            'ledgerBefore': ledger_before, 'ledgerAfter': ledger_after,
            'durableLedgersBefore': durable_ledgers_before, 'durableLedgersAfter': durable_ledgers_after,
            'subjectsBefore': topics_before_reload, 'subjectsAfter': topics_after_reload,
            'sessionTiming': {'before': session_before_reload, 'after': session_after_reload,
                              'reloadAndNativeNavigationMonotonicSeconds': reload_interval},
            'preciseSessionExceptions': [
                {'path': '/statistics/playSeconds', 'before': old_seconds, 'after': new_seconds,
                 'maximumMeasuredDeltaSeconds': maximum_play_seconds_delta, 'accepted': play_seconds_valid,
                 'reason': 'Actual page-unload wall-clock play duration; non-regressing integer bounded by observed old page age plus measured reload/native navigation interval.'},
                {'path': '/hub/npcCirculationV158/actor/time', 'before': old_npc_time, 'after': new_npc_time,
                 'accepted': npc_time_valid, 'reason': 'Finite, non-regressing NPC animation clock persisted during the real new hub session; no other NPC field is excepted.'}]}
        check('the return reading ledger, payment and strategic state survive reload with only measured session clocks advancing',
              not unexpected_differences and play_seconds_valid and npc_time_valid
              and ledger_after == ledger_before and last_after['id'] == last_before['id'] and last_after['success'] is True
              and durable_ledgers_after == durable_ledgers_before and durable_ledgers_after['durable'] == ledger_after
              and topics_after_reload == topics_before_reload and all('RELU' in text for text in topics_after_reload.values()))

        phase('native campaign selection keeps QZ18 return attached to its own plan')
        before_selection = observed(page)['save']
        page.locator('#command-world-v110').select_option('')
        candidates = page.locator('#command-mission-v110 option').evaluate_all('(nodes)=>nodes.map(node=>node.value).filter(value=>value&&value!=="special-archive-relay")')
        check('an unlocked alternative can be selected without deploying it', bool(candidates))
        other_campaign = candidates[0]
        page.locator('#command-mission-v110').select_option(other_campaign)
        page.wait_for_function('id=>__ATF_V51__.saveSystem.data.strategy.plannedCampaignId===id', arg=other_campaign)
        check('another campaign plan does not display the QZ18 debrief', page.locator('[data-campaign-story-return]').count() == 0 and observed(page)['save']['strategy']['currentOperation'] is None)
        page.locator('#command-mission-v110').select_option('special-archive-relay')
        page.locator('[data-campaign-story-return]').wait_for(state='visible')
        after_selection = observed(page)['save']
        report['planSelection'] = {'alternativeCampaignId': other_campaign,
            'protectedDifferences': protected_difference(protected(before_selection), protected(after_selection)),
            'ledgersBefore': return_ledgers(before_selection), 'ledgersAfter': return_ledgers(after_selection)}
        check('returning to the QZ18 plan retains exact topics and receipt without another operation or reward',
              not report['planSelection']['protectedDifferences'] and return_ledgers(before_selection) == return_ledgers(after_selection)
              and all('RELU' in page.locator(f'[data-campaign-story-topic="{topic}"]').inner_text() for topic in ['chronology', 'identity', 'return'])
              and after_selection['strategy']['currentOperation'] is None)

        phase('native replay skip, reduced motion, retreat and an explicitly disclosed legacy resume')
        open_view(page, 'settings')
        page.locator('#setting-motion').check()
        open_plan(page); page.locator('#operation-launch').click()
        page.locator('[data-insertion-action="advance"]').click()
        page.locator('[data-story-protocol="crew-prevention"]').click()
        check('the next operation can choose the other protocol with reduced motion', page.locator('#mission-insertion-v62').get_attribute('data-reduced-motion') == 'true')
        page.locator('[data-insertion-action="skip"]').click()
        page.wait_for_function('()=>__ATF_GAME__.running&&__ATF_GAME__.mission.state==="active"&&!document.querySelector("#mission-runtime-v62").hidden')
        check('replay skip transfers control without a second research payment', observed(page)['save']['galaxy']['resources']['research'] == victory['galaxy']['resources']['research'])
        walk_center(page, 240)
        mission_save = page.locator('#mission-save-v160')
        check('the mission exposes its own visible native save control', mission_save.is_visible() and mission_save.inner_text().strip() == 'SAUVEGARDER')
        mission_save.click()
        mid = observed(page)['save']
        check('a legacy fixture basis comes from an actual native mid-level checkpoint', mid['strategy']['currentOperation']['resumeState'] is not None and observed(page)['player']['x'] > 150)
        page.locator('#retreat-mission').click()
        failed = observed(page)['save']
        check('native retreat retains injuries and grants no protocol victory or new dossier', failed['strategy']['lastOperation']['success'] is False and any(member['injuries'] for member in failed['crew']) and failed['galaxy']['resources']['research'] == victory['galaxy']['resources']['research'] and failed['archiveRelayArchivesV122']['case']['operationId'] == returned['id'])
        open_plan(page)
        capture(page, '10-retreat-epilogue.png', '#operation-plan')
        legacy = json.loads(json.dumps(mid)); legacy['strategy']['currentOperation']['insertionState'] = None
        legacy['player']['name'] = 'QA QZ18 legacy observed V160'
        legacy_raw = json.dumps(legacy).encode(); (output / 'disclosed-legacy-from-native-mid-save.json').write_bytes(legacy_raw)
        report['legacyFixtureBasis'] = 'Actual native quick-save from this run; only player name and currentOperation.insertionState differ.'
        import_profile(page, legacy_raw, 'legacy-observed-qz18.json')
        open_plan(page); page.locator('#operation-launch').click()
        page.wait_for_function('()=>__ATF_GAME__.running&&__ATF_GAME__.isArchiveRelayV122?.()&&!document.querySelector("#mission-runtime-v62").hidden')
        resumed = observed(page)
        check('an old QZ18 resume enters its actual saved level without a retroactive briefing or protocol', not resumed['insertionVisible'] and resumed['save']['strategy']['currentOperation']['insertionState'] is None and abs(resumed['player']['x'] - mid['strategy']['currentOperation']['resumeState']['player']['x']) < 5)
        capture(page, '11-legacy-mid-level-resume.png')
        page.locator('#retreat-mission').click()
        check('no browser exception or failed HTTP request occurred', not report['pageErrors'] and not report['httpErrors'] and not [item for item in report['requestFailures'] if item['failure'] != 'net::ERR_ABORTED'])
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
        end = manifest(); (output / 'profile-source-end.json').write_text(json.dumps(end, indent=2))
        report['sourceUnchanged'] = source_start == end
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
if not report['sourceUnchanged']:
    raise SystemExit('Runtime or QA source changed during this journey.')
