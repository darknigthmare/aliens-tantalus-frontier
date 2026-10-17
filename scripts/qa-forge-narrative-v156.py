"""Production Forge authoring and narrative journeys. Only native UI changes state.
Evaluations observe published engines/documents; no actor, session or storage injection.
"""
import argparse
import json
import os
from pathlib import Path
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
          'method': 'Production page; native profile/project file inputs, actual inspector edits, exports, physical keyboard walking, DOM dialogue controls; observations only.',
          'limitations': ['A browser journey, not a human study or a screen-reader certification.',
                          'Narrative progression belongs to the current playtest; no durable checkpoint or cloud account is claimed.']}


def fixture(kind):
    floor = 16 if kind == 'mission' else 15
    rooms = []
    for room_id in ['a', 'b']:
        def cell(suffix, x, y, tile, layer='gameplay'):
            return {'id': f'{room_id}-{suffix}', 'x': x, 'y': y, 'type': tile, 'layer': layer}
        cells = [cell(f'floor-{x}', x, floor, 'floor', 'structure') for x in range(32)]
        cells += [cell('spawn', 1, floor - 1, 'spawn'), cell('goal', 3, floor - 1, 'objective'),
                  cell('door', 10 if room_id == 'a' else 2, floor - 1, 'door')]
        if room_id == 'a':
            terminal = cell('terminal', 6, floor - 1, 'terminal')
            terminal['narrative'] = {'schema': 1, 'title': 'Ordre du relais', 'start': 'start', 'nodes': [
                {'id': 'start', 'text': 'Le relevé A doit être validé avant transmission.', 'choices': [
                    {'id': 'transmit', 'label': 'Transmettre au relais B', 'next': 'done',
                     'requiresObjectiveId': 'a-goal', 'rewardObjectiveId': 'b-goal'},
                    {'id': 'instructions', 'label': 'Lire les consignes', 'next': 'instructions'}]},
                {'id': 'done', 'text': 'Le relais B confirme la réception.', 'choices': []},
                {'id': 'instructions', 'text': 'Validez le relevé dans cette salle.', 'choices': []}]}
            cells.append(terminal)
        rooms.append({'id': room_id, 'name': f'Salle {room_id}', 'size': [32, 18], 'cells': cells})
    return {'schema': 3, 'kind': kind, 'name': f'QA récit {kind} V156', 'activeRoomId': 'a', 'rooms': rooms,
            'links': [{'id': 'ab', 'from': {'roomId': 'a', 'cellId': 'a-door'},
                       'to': {'roomId': 'b', 'cellId': 'b-door'}, 'bidirectional': True}]}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def upload(page, selector, value, name):
    page.locator(selector).set_input_files({'name': name, 'mimeType': 'application/json',
                                          'buffer': json.dumps(value).encode()})
    page.wait_for_function('(selector) => document.querySelector(selector).value === ""', arg=selector)


def authored(page):
    return page.evaluate('() => structuredClone(globalThis.__ATF_V51__.editor.model.data)')


def observed(page, kind):
    return page.evaluate('''kind => {
      const e=kind==='mission'?globalThis.__ATF_GAME__:globalThis.__ATF_HUB__,s=e.forgeSessionV141;
      return {running:e.running, paused:!!e.paused,room:s?.currentRoomId,
        player:{x:e.player.x,y:e.player.y,health:e.player.health,ammo:e.player.ammo},
        elapsed:kind==='mission'?e.mission.elapsed:e.animationTime,
        completed:[...(s?.completedObjectives||[])],history:structuredClone(s?.narrativeV156||[]),
        open:e.forgeNarrativeOpenV156,transitions:s?.transitions,
        objective:kind==='mission'?!!e.objective?.complete:e.v51Objectives.map(o=>({id:o.cellId,complete:!!o.complete}))};
    }''', kind)


def walk(page, kind, direction, target):
    code = 'KeyD' if direction > 0 else 'KeyA'
    page.keyboard.down(code)
    try:
        page.wait_for_function('''({kind,target})=>{
          const e=kind==='mission'?globalThis.__ATF_GAME__:globalThis.__ATF_HUB__;
          if(kind==='ship')return e.nearestForgeInteractionV141()?.type===target;
          if(target==='terminal')return !!e.forgeNarrativeTerminalV156();
          if(target==='door')return !!e.forgeLinkedDoorV141();
          return Math.abs(e.player.x+e.player.w/2-e.objective.x-e.objective.w/2)<80;
        }''', arg={'kind': kind, 'target': target}, timeout=40000)
    finally:
        page.keyboard.up(code)


def capture(page, name):
    page.screenshot(path=str(output / name), full_page=True)
    report['captures'].append(name)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']}
                              if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    context = browser.new_context(viewport={'width': 1600, 'height': 1050}, service_workers='block', accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        upload(page, '#save-import', {'schema': 52, 'needsPlayerCreationV84': False,
               'player': {'name': 'QA Forge récit'}, 'settings': {'reducedMotion': True}}, 'isolated-qa-profile.json')
        page.get_by_text('Sauvegarde importée et migrée.', exact=True).wait_for()
        page.locator('#return-title').click()
        if page.locator('#title-start').is_visible():
            page.locator('#title-start').click()
        page.locator('#title-forge').click()
        page.locator('#editor-canvas').wait_for(state='visible')
        for kind in ['mission', 'ship']:
            source = fixture(kind)
            (output / f'{kind}-input.json').write_text(json.dumps(source, ensure_ascii=False, indent=2))
            upload(page, '#editor-import', source, f'{kind}-narrative.json')
            page.locator('.forge-message-v130').get_by_text('Projet importé.', exact=False).wait_for()
            page.locator('[data-forge-action="focus"][data-cell="a-terminal"]').click()
            page.locator('[data-forge-field="story-title"]').fill(f'Relais {kind} édité')
            page.locator('[data-forge-field="story-text"]').fill('Relevé A requis. Transmission au relais B après validation.')
            page.locator('[data-forge-action="story-save"]').click()
            edited = authored(page)
            with page.expect_download() as info:
                page.locator('#editor-export').click()
            exported_path = output / f'{kind}-authored-export.json'
            info.value.save_as(str(exported_path))
            check(kind + ': true inspector edits and JSON export preserve the authored graph', json.loads(exported_path.read_text()) == edited)
            capture(page, f'{kind}-01-authoring.png')
            before_campaign = page.evaluate('() => JSON.parse(localStorage.getItem("atf-v47-profile-1"))')
            page.locator('#editor-play').click()
            canvas = page.locator('#game-canvas' if kind == 'mission' else '#hub-canvas')
            canvas.wait_for(state='visible')
            page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
              return e.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&e.player.grounded;}''', arg=kind, timeout=60000)
            canvas.focus()
            walk(page, kind, 1, 'terminal')
            page.keyboard.press('KeyE')
            dialog = page.locator('[data-forge-narrative-v156] [role="dialog"]')
            dialog.wait_for(state='visible')
            check(kind + ': unmet authored prerequisite disables its exact response', dialog.locator('[data-story-choice]').first.is_disabled())
            paused = observed(page, kind)
            page.keyboard.down('KeyD')
            page.keyboard.down('KeyF')
            page.wait_for_timeout(250)
            page.keyboard.up('KeyD')
            page.keyboard.up('KeyF')
            still = observed(page, kind)
            check(kind + ': real movement/fire keys leave the world and resources frozen during reading',
                  paused['player'] == still['player'] and paused['elapsed'] == still['elapsed'])
            capture(page, f'{kind}-02-locked-choice.png')
            # Focus starts on the available alternative; Shift+Tab wraps to Close.
            page.keyboard.press('Shift+Tab')
            check(kind + ': focus remains trapped on the actual Close button', page.locator('[data-story-close]').evaluate('(node)=>node===document.activeElement'))
            page.keyboard.press('Enter')
            dialog.wait_for(state='detached')
            check(kind + ': Tab and Enter close the dialog without choosing a branch', observed(page, kind)['history'][0]['history'] == [])
            canvas.focus()
            walk(page, kind, -1, 'objective')
            page.keyboard.press('KeyE')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.completedObjectives.includes('a-goal')''', arg=kind)
            walk(page, kind, 1, 'terminal')
            page.keyboard.press('KeyE')
            dialog.wait_for(state='visible')
            check(kind + ': completing the real objective admits the conditional response', dialog.locator('[data-story-choice]').first.is_enabled())
            page.keyboard.press('Tab')
            page.keyboard.press('Shift+Tab')
            page.keyboard.press('Enter')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.completedObjectives.includes('b-goal')''', arg=kind)
            chosen = observed(page, kind)
            check(kind + ': keyboard activation rewards the authored remote objective once', chosen['completed'].count('b-goal') == 1 and len(chosen['history'][0]['history']) == 1)
            capture(page, f'{kind}-03-reward.png')
            page.keyboard.press('KeyE')
            dialog.wait_for(state='detached')
            walk(page, kind, 1, 'door')
            page.keyboard.press('KeyE')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.currentRoomId==='b' ''', arg=kind)
            arrived = observed(page, kind)
            check(kind + ': native door travel synchronizes the remote objective', arrived['objective'] is True if kind == 'mission' else any(o['id'] == 'b-goal' and o['complete'] for o in arrived['objective']))
            page.keyboard.press('KeyE')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.currentRoomId==='a' ''', arg=kind)
            walk(page, kind, -1, 'terminal')
            page.keyboard.press('KeyE')
            dialog.wait_for(state='visible')
            check(kind + ': return and reopening keep the same completed page without replaying a reward',
                  'confirme la réception' in dialog.inner_text() and observed(page, kind)['completed'].count('b-goal') == 1 and dialog.locator('[data-story-choice]').count() == 0)
            capture(page, f'{kind}-04-return.png')
            page.keyboard.press('Escape')
            dialog.wait_for(state='detached')
            page.locator('#retreat-mission' if kind == 'mission' else '#exit-hub').click()
            page.locator('#editor-canvas').wait_for(state='visible')
            check(kind + ': leaving playtest preserves the whole authored document and campaign profile',
                  authored(page) == edited and page.evaluate('() => JSON.parse(localStorage.getItem("atf-v47-profile-1"))') == before_campaign)
        check('no uncaught browser exceptions', not report['pageErrors'])
        failures = [entry for entry in report['requestFailures'] if entry['failure'] != 'net::ERR_ABORTED']
        check('no HTTP error or failed request outside intentional navigation cancellation', not failures and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            capture(page, 'failure.png')
        except Exception:
            pass
        raise
    finally:
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        context.close()
        browser.close()
