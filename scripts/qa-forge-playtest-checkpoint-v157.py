"""Forge local checkpoint journey through production buttons and real reload.
Evaluations only observe. Authored documents and isolated campaign profile use
their native file inputs. No actor, storage, clock or RNG injection is used.
"""
import argparse
import importlib.metadata
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
          'phase': 'browser setup',
          'method': 'Production app; native profile/project imports, actual keyboard walking/fire, checkpoint buttons, real page reload and routing; evaluations observe only.',
          'limitations': ['Automated Chromium journey, not a human usability study.',
                          'Local device checkpoint only; no cloud or campaign-progress migration.',
                          'Node production tests additionally cover wounds, crew, equipment, projectiles, owner references, native RNG and adversarial payloads.']}


def fixture(kind):
    floor = 16 if kind == 'mission' else 15
    cells = [{'id': f'floor-{x}', 'x': x, 'y': floor, 'type': 'floor', 'layer': 'structure'} for x in range(32)]
    cells += [{'id': 'spawn', 'x': 1, 'y': floor - 1, 'type': 'spawn', 'layer': 'gameplay'},
              {'id': 'goal', 'x': 28, 'y': floor - 1, 'type': 'objective', 'layer': 'gameplay'},
              {'id': 'terminal', 'x': 4, 'y': floor - 1, 'type': 'terminal', 'layer': 'gameplay', 'narrative': {
                  'schema': 1, 'title': 'Registre de reprise', 'start': 'start', 'items': [{'id': 'badge', 'label': 'Badge du relais'}],
                  'nodes': [{'id': 'start', 'text': 'Enregistrez ce badge avant de fermer le test.', 'choices': [
                      {'id': 'take', 'label': 'Prendre le badge', 'next': 'done', 'rewardItemId': 'badge', 'rewardObjectiveId': 'goal'}]},
                            {'id': 'done', 'text': 'Badge enregistré une seule fois.', 'choices': []}]}}]
    return {'schema': 3, 'kind': kind, 'name': f'QA checkpoint {kind} V157', 'activeRoomId': 'a', 'links': [],
            'rooms': [{'id': 'a', 'name': 'Registre', 'size': [32, 18], 'cells': cells}]}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def annotation_message(value):
    return str(value).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')


def upload(page, selector, value, name):
    page.locator(selector).set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': json.dumps(value).encode()})
    page.wait_for_function('(selector) => document.querySelector(selector).value === ""', arg=selector)


def observed(page, kind):
    return page.evaluate('''kind => {
      const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__,s=e.forgeSessionV141;
      return {running:e.running,room:s.currentRoomId,items:[...(s.narrativeInventoryV157||[])],
        seconds:s.narrativePlaySecondsV157||0,completed:[...s.completedObjectives],history:structuredClone(s.narrativeV156||[]),
        health:e.player.health,armor:e.player.armor??null,ammo:e.player.ammo??null,reserve:e.player.ammoReserve??null,
        x:e.player.x,y:e.player.y};
    }''', kind)


def checkpoint_panel(page, kind=None):
    view = 'editor' if kind is None else ('play' if kind == 'mission' else 'hub')
    panel = page.locator(f'[data-panel="{view}"] .forge-checkpoint-v157')
    if panel.locator('details').get_attribute('open') is None:
        panel.locator('[data-forge-checkpoint-toggle-v157]').click()
    return panel


def pointer_action(page, panel, action):
    """Native pointer activation; bounds/hit tests happen before any click.
    This deliberately avoids Locator.click's automatic scrollIntoView."""
    phase(f'{report.get("kind", "runtime")} {page.viewport_size}: pointer {action}')
    details = panel.locator('details')
    if details.get_attribute('open') is None:
        target = panel.locator('[data-forge-checkpoint-toggle-v157]')
        point = target.evaluate('''node=>{const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
          return {x,y,within:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,hit:document.elementFromPoint(x,y)===node};}''')
        assert point['within'] and point['hit'], 'compact checkpoint disclosure must be reachable without scrolling'
        page.mouse.click(point['x'], point['y'])
    target = panel.locator(f'[data-forge-checkpoint-v157="{action}"]')
    point = target.evaluate('''node=>{const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);
      return {x,y,within:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,hit:hit===node||node.contains(hit)};}''')
    assert point['within'] and point['hit'], f'{action}: must be visible, fully within viewport and above canvas'
    page.mouse.click(point['x'], point['y'])
    page.wait_for_function('node=>node.getAttribute("aria-busy")==="false"', arg=panel.element_handle())
    return point


def capture(page, name):
    page.screenshot(path=str(output / name), full_page=True)
    report['captures'].append(name)


def enter_forge(page):
    page.locator('#title-start:visible, #title-forge:visible').first.wait_for(state='visible', timeout=45000)
    if page.locator('#title-start').is_visible():
        page.locator('#title-start').click()
    page.locator('#title-forge').wait_for(state='visible', timeout=45000)
    page.locator('#title-forge').click()
    page.locator('#editor-canvas').wait_for(state='visible')


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']}
                              if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    context = browser.new_context(viewport={'width': 1600, 'height': 1050}, service_workers='block', accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        phase('load title and import isolated profile')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        upload(page, '#save-import', {'schema': 52, 'needsPlayerCreationV84': False,
               'player': {'name': 'QA checkpoint'}, 'settings': {'reducedMotion': True}}, 'isolated-checkpoint-profile.json')
        page.get_by_text('Sauvegarde importée et migrée.', exact=True).wait_for()
        page.locator('#return-title').click()
        if page.locator('#title-start').is_visible():
            page.locator('#title-start').click()
        enter_forge(page)
        for kind in ['mission', 'ship']:
            report['kind'] = kind
            phase(kind + ': import authored document')
            source = fixture(kind)
            (output / f'{kind}-input.json').write_text(json.dumps(source, ensure_ascii=False, indent=2))
            upload(page, '#editor-import', source, f'{kind}-checkpoint.json')
            page.locator('.forge-message-v130').get_by_text('Projet importé.', exact=False).wait_for()
            authored = page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)')
            campaign = page.evaluate('() => localStorage.getItem("atf-v47-profile-1")')
            phase(kind + ': launch and wait for native grounded player')
            page.locator('#editor-play').click()
            canvas = page.locator('#game-canvas' if kind == 'mission' else '#hub-canvas')
            canvas.wait_for(state='visible')
            page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
              return e.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&e.player.grounded;}''', arg=kind, timeout=90000)
            canvas.focus()
            if kind == 'mission':
                phase(kind + ': hold native fire until ammunition is consumed')
                ammo = observed(page, kind)['ammo']
                page.keyboard.down('KeyF')
                try:
                    page.wait_for_function('(ammo)=>__ATF_GAME__.player.ammo<ammo', arg=ammo)
                finally:
                    page.keyboard.up('KeyF')
            phase(kind + ': walk to the narrative terminal')
            page.keyboard.down('KeyD')
            try:
                page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
                  return kind==='mission'?e.forgeNarrativeTerminalV156()?.forgeCellIdV141==='terminal'
                    :e.nearestForgeInteractionV141()?.entity.cellId==='terminal';}''', arg=kind, timeout=180000)
            finally:
                page.keyboard.up('KeyD')
            phase(kind + ': open story and take the authored item')
            page.keyboard.press('KeyE')
            dialog = page.locator('[data-forge-narrative-v156] [role="dialog"]')
            dialog.wait_for(state='visible')
            dialog.locator('[data-story-choice="take"]').click()
            page.keyboard.press('Escape')
            dialog.wait_for(state='detached')
            page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
              return e.player.grounded&&!e.player.reloading&&!e.isPlaceableBusyV86?.(e.player);}''', arg=kind)
            phase(kind + ': save checkpoint through native control')
            panel = checkpoint_panel(page, kind)
            panel.locator('[data-forge-checkpoint-v157="save"]').click()
            panel.locator('[role="status"]').get_by_text('Checkpoint de playtest enregistré', exact=False).wait_for()
            saved = observed(page, kind)
            raw = page.evaluate('() => localStorage.getItem("atf:forge-playtest-checkpoint:v157")')
            saved['checkpointSeconds'] = page.evaluate('''async()=>{
              const {inspectForgePlaytestCheckpointV157}=await import('/src/forge-playtest-checkpoint-v157.js');
              return (await inspectForgePlaytestCheckpointV157(localStorage.getItem('atf:forge-playtest-checkpoint:v157'),
                __ATF_V51__.editor.model.data)).data.session.narrativePlaySecondsV157||0;
            }''')
            check(kind + ': explicit button writes a bounded isolated checkpoint with real story progress',
                  saved['items'] == ['badge'] and saved['completed'] == ['goal'] and len(raw.encode()) < 4 * 1024 * 1024)
            (output / f'{kind}-saved-observation.json').write_text(json.dumps(saved, indent=2))
            capture(page, f'{kind}-01-saved.png')
            phase(kind + ': stop playtest and check document/campaign isolation')
            page.locator('#retreat-mission' if kind == 'mission' else '#exit-hub').click()
            page.locator('#editor-canvas').wait_for(state='visible')
            check(kind + ': stopping returns to the same author document without touching campaign',
                  page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)') == authored
                  and page.evaluate('() => localStorage.getItem("atf-v47-profile-1")') == campaign)
            phase(kind + ': real page reload and reopen Forge')
            page.reload(wait_until='domcontentloaded')
            enter_forge(page)
            phase(kind + ': resume stored checkpoint from editor')
            panel = checkpoint_panel(page)
            panel.locator('[data-forge-checkpoint-v157="resume"]').click()
            canvas = page.locator('#game-canvas' if kind == 'mission' else '#hub-canvas')
            canvas.wait_for(state='visible', timeout=90000)
            checkpoint_panel(page, kind).locator('[role="status"]').get_by_text('Checkpoint de playtest repris', exact=False).wait_for()
            restored = observed(page, kind)
            check(kind + ': actual page reload resumes through the hidden-canvas admission and correct visible game',
                  restored['running'] and restored['room'] == saved['room'] and restored['items'] == saved['items']
                  and restored['completed'] == saved['completed'] and restored['history'] == saved['history']
                  and restored['health'] == saved['health'] and restored['ammo'] == saved['ammo']
                  and restored['reserve'] == saved['reserve'] and abs(restored['x'] - saved['x']) < 1
                  and abs(restored['y'] - saved['y']) < 1 and restored['seconds'] >= saved['checkpointSeconds'])
            check(kind + ': browser checkpoint restoration leaves the campaign profile byte-identical',
                  page.evaluate('() => localStorage.getItem("atf-v47-profile-1")') == campaign)
            capture(page, f'{kind}-02-reloaded.png')
            for width, height in [(1280, 720), (1600, 900), (390, 844)]:
                phase(f'{kind} {width}x{height}: resize responsive runtime')
                page.set_viewport_size({'width': width, 'height': height})
                panel = page.locator(f'[data-panel="{"play" if kind == "mission" else "hub"}"] .forge-checkpoint-v157')
                before = observed(page, kind)
                positions = {action: pointer_action(page, panel, action) for action in ['save', 'resume', 'clear']}
                check(f'{kind} {width}x{height}: real pointer save/resume/erase controls are inside the viewport and above the canvas without scrolling',
                      all(point['within'] and point['hit'] for point in positions.values())
                      and page.evaluate('() => localStorage.getItem("atf:forge-playtest-checkpoint:v157")') is None)
                after = observed(page, kind)
                check(f'{kind} {width}x{height}: active resume preserves resources, story and campaign at the exact aspect ratio',
                      all(after[key] == before[key] for key in ['room', 'items', 'completed', 'history', 'health', 'ammo', 'reserve'])
                      and page.evaluate('() => localStorage.getItem("atf-v47-profile-1")') == campaign)
                pointer_action(page, panel, 'save')
                capture(page, f'{kind}-layout-{width}x{height}-open.png')
                phase(f'{kind} {width}x{height}: Escape/Enter disclosure keyboard behavior')
                page.keyboard.press('Escape')
                check(f'{kind} {width}x{height}: Escape closes to one compact control and native Enter reopens it without pausing gameplay',
                      panel.locator('details').get_attribute('open') is None
                      and page.evaluate('kind=>(kind==="mission"?__ATF_GAME__:__ATF_HUB__).paused!==true', kind))
                page.keyboard.press('Enter')
                panel.locator('[data-forge-checkpoint-v157="save"]').wait_for(state='visible')
                page.keyboard.press('Tab')
                phase(f'{kind} {width}x{height}: no gameplay input through focused checkpoint controls')
                protected = observed(page, kind)
                page.keyboard.down('KeyD')
                page.keyboard.down('KeyF')
                page.wait_for_timeout(150)
                page.keyboard.up('KeyF')
                page.keyboard.up('KeyD')
                check(f'{kind} {width}x{height}: focused checkpoint commands keep movement and fire from leaking to the game',
                      observed(page, kind)['x'] == protected['x'] and observed(page, kind)['ammo'] == protected['ammo'])
                page.keyboard.press('Escape')
                capture(page, f'{kind}-layout-{width}x{height}-closed.png')
            raw = page.evaluate('() => localStorage.getItem("atf:forge-playtest-checkpoint:v157")')
            page.set_viewport_size({'width': 1600, 'height': 1050})
            page.locator('#retreat-mission' if kind == 'mission' else '#exit-hub').click()
            page.locator('#editor-canvas').wait_for(state='visible')
            phase(kind + ': refuse a changed plan without losing document/checkpoint/campaign')
            page.locator('[data-forge-field="room-name"]').fill('Plan modifié après checkpoint')
            page.locator('[data-forge-field="room-name"]').press('Tab')
            changed = page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)')
            panel = checkpoint_panel(page)
            panel.locator('[data-forge-checkpoint-v157="resume"]').click()
            panel.locator('[role="status"]').get_by_text('le projet a changé', exact=False).wait_for()
            check(kind + ': changed-plan refusal preserves editor, modified document, old checkpoint and campaign',
                  page.locator('#editor-canvas').is_visible()
                  and page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)') == changed
                  and page.evaluate('() => localStorage.getItem("atf:forge-playtest-checkpoint:v157")') == raw
                  and page.evaluate('() => localStorage.getItem("atf-v47-profile-1")') == campaign)
            capture(page, f'{kind}-03-refused.png')
            phase(kind + ': erase the isolated checkpoint')
            panel.locator('[data-forge-checkpoint-v157="clear"]').click()
            panel.locator('[role="status"]').get_by_text('Checkpoint de playtest effacé', exact=False).wait_for()
            check(kind + ': explicit erase removes only the checkpoint and disables resume',
                  page.evaluate('() => localStorage.getItem("atf:forge-playtest-checkpoint:v157")') is None
                  and panel.locator('[data-forge-checkpoint-v157="resume"]').is_disabled()
                  and page.evaluate('() => structuredClone(__ATF_V51__.editor.model.data)') == changed)
        phase('continue the native campaign with Forge controls hidden')
        page.locator('#return-title').click()
        page.locator('#title-start:visible, #title-continue:visible').first.wait_for(state='visible')
        if page.locator('#title-start').is_visible():
            page.locator('#title-start').click()
        page.locator('#title-continue').click()
        page.locator('#hub-canvas').wait_for(state='visible', timeout=90000)
        check('native campaign continuation hides every Forge checkpoint control through the immediate CSS scope guard',
              page.evaluate('''()=>!document.documentElement.classList.contains('forge-mode')&&
                [...document.querySelectorAll('.forge-checkpoint-v157')].every(node=>getComputedStyle(node).display==='none')'''))
        capture(page, 'campaign-controls-absent.png')
        check('no uncaught browser exceptions', not report['pageErrors'])
        failures = [entry for entry in report['requestFailures'] if entry['failure'] != 'net::ERR_ABORTED']
        check('no HTTP error or failed request outside intentional navigation cancellation', not failures and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        detail = f'{report["tooling"]} | {report["phase"]} | last passed: {report["checks"][-1] if report["checks"] else "none"} | {type(error).__name__}: {error}'
        try:
            report['failureContext'] = page.evaluate('''()=>({
              focus:{tag:document.activeElement?.tagName,id:document.activeElement?.id},
              controls:[...document.querySelectorAll('.view.active .forge-checkpoint-v157')].map(n=>({
                status:n.querySelector('[role="status"]')?.textContent,open:n.querySelector('details')?.open,
                busy:n.getAttribute('aria-busy')})),
              engines:[window.__ATF_GAME__,window.__ATF_HUB__].filter(Boolean).map(e=>({
                running:e.running,paused:e.paused,loading:e.enemyAtlasLoadingPausedV65||e.userCasteLoadingV88,
                room:e.forgeSessionV141?.currentRoomId,player:{x:e.player?.x,y:e.player?.y,
                  grounded:e.player?.grounded,health:e.player?.health,ammo:e.player?.ammo},keys:[...(e.keys||[])]}))
            })''')
            detail += ' | observed: ' + json.dumps(report['failureContext'], ensure_ascii=False)
        except Exception:
            pass
        print('::error title=Forge checkpoint::' + annotation_message(detail[:6000]), flush=True)
        try:
            capture(page, 'failure.png')
        except Exception:
            pass
        raise
    finally:
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        context.close()
        browser.close()
