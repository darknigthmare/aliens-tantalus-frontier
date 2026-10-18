"""Native Forge UI journey for story tokens and simulation-time prerequisites.
Imports are authored documents through the file input. Browser evaluations only
observe production state; no actor/session/clock/storage injection is used.
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
          'method': 'Production page; native profile/project file inputs, inspector edits, JSON export, real keyboard walking and modal buttons; evaluations observe only.',
          'limitations': ['Automated browser journey, not a human study or screen-reader certification.',
                          'Story items are authored tokens; no campaign equipment, free scripting or cloud progression is exercised.']}


def fixture(kind):
    floor = 16 if kind == 'mission' else 15
    cells = [{'id': f'floor-{x}', 'x': x, 'y': floor, 'type': 'floor', 'layer': 'structure'} for x in range(32)]
    cells += [{'id': 'spawn', 'x': 1, 'y': floor - 1, 'type': 'spawn', 'layer': 'gameplay'},
              {'id': 'goal', 'x': 28, 'y': floor - 1, 'type': 'objective', 'layer': 'gameplay'}]
    cells += [{'id': 'supply', 'x': 4, 'y': floor - 1, 'type': 'terminal', 'layer': 'gameplay', 'narrative': {
        'schema': 1, 'title': 'Délivrance du badge', 'start': 'start', 'items': [{'id': 'badge', 'label': 'Badge du relais'}],
        'nodes': [{'id': 'start', 'text': 'Un badge de récit attend votre confirmation.', 'choices': [
            {'id': 'take', 'label': 'Prendre le badge de récit', 'next': 'done', 'rewardItemId': 'badge'}]},
                  {'id': 'done', 'text': 'Badge reçu. Rejoignez le relais.', 'choices': []}]}},
        {'id': 'relay', 'x': 9, 'y': floor - 1, 'type': 'terminal', 'layer': 'gameplay', 'narrative': {
            'schema': 1, 'title': 'Relais différé', 'start': 'start', 'items': [{'id': 'report', 'label': 'Accusé de réception'}],
            'nodes': [{'id': 'start', 'text': 'La transmission attend le badge et le prochain créneau.', 'choices': [
                {'id': 'exchange', 'label': 'Remettre le badge et transmettre', 'next': 'done', 'requiresItemId': 'badge',
                 'consumeRequiredItem': True, 'rewardItemId': 'report', 'requiresPlaySeconds': 12, 'rewardObjectiveId': 'goal'}]},
                      {'id': 'done', 'text': 'Rapport reçu. Badge remis au relais.', 'choices': []}]}}]
    return {'schema': 3, 'kind': kind, 'name': f'QA conditions {kind} V157', 'activeRoomId': 'a', 'links': [],
            'rooms': [{'id': 'a', 'name': 'Relais', 'size': [32, 18], 'cells': cells}]}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def upload(page, selector, value, name):
    page.locator(selector).set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': json.dumps(value).encode()})
    page.wait_for_function('(selector) => document.querySelector(selector).value === ""', arg=selector)


def observed(page, kind):
    return page.evaluate('''kind => {
      const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__,s=e.forgeSessionV141;
      return {running:e.running,open:e.forgeNarrativeOpenV156,seconds:s.narrativePlaySecondsV157||0,
        items:[...(s.narrativeInventoryV157||[])],completed:[...s.completedObjectives],history:structuredClone(s.narrativeV156||[]),
        player:{x:e.player.x,y:e.player.y,health:e.player.health,ammo:e.player.ammo,reserve:e.player.reserve}};
    }''', kind)


def walk(page, kind, target):
    page.keyboard.down('KeyD')
    try:
        page.wait_for_function('''({kind,target})=>{
          const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
          return kind==='mission'?e.forgeNarrativeTerminalV156()?.forgeCellIdV141===target
            :e.nearestForgeInteractionV141()?.entity.cellId===target;
        }''', arg={'kind': kind, 'target': target}, timeout=120000)
    finally:
        page.keyboard.up('KeyD')


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
               'player': {'name': 'QA conditions'}, 'settings': {'reducedMotion': True}}, 'isolated-qa-profile.json')
        page.get_by_text('Sauvegarde importée et migrée.', exact=True).wait_for()
        page.locator('#return-title').click()
        if page.locator('#title-start').is_visible():
            page.locator('#title-start').click()
        page.locator('#title-forge').click()
        page.locator('#editor-canvas').wait_for(state='visible')
        for kind in ['mission', 'ship']:
            source = fixture(kind)
            (output / f'{kind}-input.json').write_text(json.dumps(source, ensure_ascii=False, indent=2))
            upload(page, '#editor-import', source, f'{kind}-conditions.json')
            page.locator('.forge-message-v130').get_by_text('Projet importé.', exact=False).wait_for()
            page.locator('[data-forge-action="focus"][data-cell="relay"]').click()
            page.locator('[data-forge-field="story-items"]').fill('report | Rapport confirmé')
            page.locator('[data-forge-action="story-items-save"]').click()
            page.locator('[data-forge-field="story-choice-0-seconds"]').fill('14')
            page.locator('[data-forge-field="story-choice-0-item-requires"]').select_option('badge')
            page.locator('[data-forge-field="story-choice-0-item-consume"]').select_option('yes')
            page.locator('[data-forge-field="story-choice-0-item-reward"]').select_option('report')
            page.locator('[data-forge-action="story-save"]').click()
            edited = page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)')
            with page.expect_download() as download:
                page.locator('#editor-export').click()
            export_path = output / f'{kind}-authored-export.json'
            download.value.save_as(str(export_path))
            exported = json.loads(export_path.read_text())
            choice = next(c for c in exported['rooms'][0]['cells'] if c['id'] == 'relay')['narrative']['nodes'][0]['choices'][0]
            check(kind + ': real inspector and JSON export retain token consumption, reward and edited simulation threshold',
                  exported == edited and choice['requiresPlaySeconds'] == 14 and choice['consumeRequiredItem'] is True
                  and choice['requiresItemId'] == 'badge' and choice['rewardItemId'] == 'report')
            capture(page, f'{kind}-01-authoring.png')
            before_campaign = page.evaluate('() => JSON.parse(localStorage.getItem("atf-v47-profile-1"))')
            page.locator('#editor-play').click()
            canvas = page.locator('#game-canvas' if kind == 'mission' else '#hub-canvas')
            canvas.wait_for(state='visible')
            page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
              return e.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&e.player.grounded;}''', arg=kind, timeout=60000)
            canvas.focus()
            walk(page, kind, 'supply')
            page.keyboard.press('KeyE')
            dialog = page.locator('[data-forge-narrative-v156] [role="dialog"]')
            dialog.wait_for(state='visible')
            dialog.locator('[data-story-choice="take"]').click()
            check(kind + ': native terminal grants its exact authored token once', observed(page, kind)['items'] == ['badge'])
            page.keyboard.press('KeyE')
            dialog.wait_for(state='detached')
            walk(page, kind, 'relay')
            page.keyboard.press('KeyE')
            dialog.wait_for(state='visible')
            check(kind + ': time-gated response is disabled with remaining active game seconds and the readable inventory',
                  dialog.locator('[data-story-choice]').first.is_disabled()
                  and 'Temps de jeu actif requis' in dialog.inner_text() and 'Badge du relais' in dialog.inner_text())
            before = observed(page, kind)
            page.keyboard.down('KeyD')
            page.keyboard.down('KeyF')
            page.wait_for_timeout(1200)
            page.keyboard.up('KeyD')
            page.keyboard.up('KeyF')
            check(kind + ': reading and real movement/fire input cannot advance time, consume the token, reward the objective or move the actor',
                  observed(page, kind) == before and before['completed'] == [])
            capture(page, f'{kind}-02-waiting.png')
            page.keyboard.press('Escape')
            dialog.wait_for(state='detached')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.narrativePlaySecondsV157>=14.05''', arg=kind, timeout=240000)
            page.keyboard.press('KeyE')
            dialog.wait_for(state='visible')
            check(kind + ': only resumed native simulation admits the unchanged response', dialog.locator('[data-story-choice]').first.is_enabled())
            page.keyboard.press('Digit1')
            rewarded = observed(page, kind)
            check(kind + ': accepted native response consumes the badge and grants only the authored report and objective',
                  rewarded['items'] == ['report'] and rewarded['completed'] == ['goal'])
            capture(page, f'{kind}-03-exchange.png')
            page.keyboard.press('KeyE')
            dialog.wait_for(state='detached')
            page.keyboard.press('KeyE')
            dialog.wait_for(state='visible')
            check(kind + ': reopening preserves its final page with no replayable reward',
                  dialog.locator('[data-story-choice]').count() == 0 and observed(page, kind)['items'] == ['report'])
            page.keyboard.press('Escape')
            page.locator('#retreat-mission' if kind == 'mission' else '#exit-hub').click()
            page.locator('#editor-canvas').wait_for(state='visible')
            check(kind + ': leaving preserves the authored document and campaign profile',
                  page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)') == edited
                  and page.evaluate('() => JSON.parse(localStorage.getItem("atf-v47-profile-1"))') == before_campaign)
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
