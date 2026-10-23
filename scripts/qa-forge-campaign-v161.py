"""Local Forge campaign through native workspace import/buttons, gameplay and reload.
All page evaluations observe; no actor, storage, clock or engine mutations.
"""
import argparse
import hashlib
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
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'phase': 'setup', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Native isolated profile/workspace imports; ordered campaign creation; native keyboard walking, authored story buttons, Mission extraction and Ship completion; real page reload; read-only observations.',
          'limitations': ['Automated Chromium, not human QA or physical mobile validation.',
                          'Two disclosed compact authored fixtures reuse admitted native assets; no franchise1:1 artwork certification.',
                          'Completed stage boundaries only; independent equipment and narrative items per stage; no cloud, script freeform or branching.']}


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def check(label, passed):
    assert passed, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def fixture(kind):
    floor = 16 if kind == 'mission' else 15
    cells = [{'id': f'floor-{x}', 'x': x, 'y': floor, 'type': 'floor', 'layer': 'structure'} for x in range(32)]
    cells += [{'id': 'spawn', 'x': 1, 'y': floor-1, 'type': 'spawn', 'layer': 'gameplay'},
              {'id': 'goal', 'x': 6, 'y': floor-1, 'type': 'objective', 'layer': 'gameplay'},
              {'id': 'terminal', 'x': 3, 'y': floor-1, 'type': 'terminal', 'layer': 'gameplay', 'narrative': {
                  'schema': 1, 'title': 'Relais de campagne', 'start': 'start', 'items': [{'id': 'badge', 'label': 'Badge de cette étape'}],
                  'nodes': [{'id': 'start', 'text': 'Confirmer la transmission de ce relais.', 'choices': [
                      {'id': 'report', 'label': 'Transmettre le rapport', 'next': 'done', 'rewardItemId': 'badge', 'rewardObjectiveId': 'goal'}]},
                            {'id': 'done', 'text': 'Transmission locale enregistrée.', 'choices': []}]}}]
    return {'id': f'qa-campaign-{kind}', 'schema': 3, 'kind': kind, 'name': f'QA campagne {kind} V161',
            'activeRoomId': 'a', 'links': [], 'rooms': [{'id': 'a', 'name': 'Relais', 'size': [32, 18], 'cells': cells}]}


def upload(page, selector, value, name):
    page.locator(selector).set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': json.dumps(value).encode()})
    page.wait_for_function('(selector)=>document.querySelector(selector).value===""', arg=selector)


def campaign(page):
    return page.evaluate('()=>JSON.parse(localStorage.getItem("atf:forge-campaign:v161"))')


def profile(page):
    return page.evaluate('()=>localStorage.getItem("atf-v47-profile-1")')


def observe(page, kind):
    return page.evaluate('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__,s=e.forgeSessionV141;
      return {running:e.running,paused:!!e.paused,kind:s?.kind,complete:!!s?.complete,mission:e.mission?.state,
        projectName:s?.project.name,health:e.player.health,items:[...(s?.narrativeInventoryV157||[])],
        completed:[...(s?.completedObjectives||[])],history:structuredClone(s?.narrativeV156||[]),
        otherRunning:kind==='mission'?__ATF_HUB__.running:__ATF_GAME__.running};}''', kind)


def capture(page, name):
    page.screenshot(path=str(output/name), full_page=True)
    report['captures'].append(name)


def enter_forge(page):
    page.locator('#title-start:visible, #title-forge:visible').first.wait_for(state='visible', timeout=45000)
    if page.locator('#title-start').is_visible():
        page.locator('#title-start').click()
    page.locator('#title-forge').click()
    page.locator('#editor-canvas').wait_for(state='visible')


def panel(page, kind=None):
    view = 'editor' if kind is None else ('play' if kind == 'mission' else 'hub')
    result = page.locator(f'[data-panel="{view}"] .forge-campaign-v161')
    if result.locator('details').get_attribute('open') is None:
        result.locator('[data-forge-campaign-toggle-v161]').click()
    return result


def close_panel(page, kind):
    item = page.locator(f'[data-panel="{"play" if kind == "mission" else "hub"}"] .forge-campaign-v161')
    if item.locator('details').get_attribute('open') is not None:
        item.locator('[data-forge-campaign-toggle-v161]').click()


def wait_engine(page, kind):
    page.locator('#game-canvas' if kind == 'mission' else '#hub-canvas').wait_for(state='visible', timeout=90000)
    page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
      return e.running&&e.forgeSessionV141&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&e.player.grounded;}''', arg=kind, timeout=90000)


def transmit(page, kind):
    canvas = page.locator('#game-canvas' if kind == 'mission' else '#hub-canvas')
    close_panel(page, kind)
    canvas.focus()
    page.keyboard.down('KeyD')
    try:
        page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
          return kind==='mission'?e.forgeNarrativeTerminalV156()?.forgeCellIdV141==='terminal'
            :e.nearestForgeInteractionV141()?.entity.cellId==='terminal';}''', arg=kind, timeout=90000)
    finally:
        page.keyboard.up('KeyD')
    page.keyboard.press('KeyE')
    dialog = page.locator('[data-forge-narrative-v156] [role="dialog"]')
    dialog.wait_for(state='visible')
    dialog.locator('[data-story-choice="report"]').click()
    capture(page, f'{kind}-native-story.png')
    page.keyboard.press('Escape')
    dialog.wait_for(state='detached')
    if kind == 'mission':
        canvas.focus()
        page.keyboard.down('KeyD')
        try:
            page.wait_for_function('''()=>{const e=__ATF_GAME__,a=e.player,b=e.objective;
              return Math.hypot(a.x+a.w/2-b.x-b.w/2,a.y+a.h/2-b.y-b.h/2)<85;}''', timeout=90000)
        finally:
            page.keyboard.up('KeyD')
        page.keyboard.press('KeyE')
        page.wait_for_function('()=>__ATF_GAME__.mission.state==="complete"')


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
        phase('isolated profile and two authored saved projects')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        upload(page, '#save-import', {'schema': 52, 'needsPlayerCreationV84': False,
               'player': {'name': 'QA campagne Forge'}, 'settings': {'reducedMotion': True}}, 'qa-forge-campaign-profile.json')
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.player.name==="QA campagne Forge"')
        page.locator('#return-title').click()
        enter_forge(page)
        projects = [fixture('mission'), fixture('ship')]
        workspace = {'schema': 1, 'projects': projects, 'activeProjectId': projects[0]['id']}
        (output/'workspace-input.json').write_text(json.dumps(workspace, ensure_ascii=False, indent=2))
        page.locator('[data-work-action="tab"][data-tab="projects"]').click()
        upload(page, '[data-work-field="workspace-import"]', workspace, 'qa-campaign-workspace.json')
        page.wait_for_function('()=>__ATF_V51__.forgeSaveSystem?.data?.projects?.some(p=>p.name==="QA campagne ship V161") || [...document.querySelectorAll("[data-forge-campaign-project-v161] option")].some(o=>o.textContent.includes("QA campagne ship V161"))')
        before_profile = profile(page)
        phase('create ordered frozen Mission to Ship campaign with native controls')
        controls = panel(page)
        controls.locator('[data-forge-campaign-name-v161]').fill('QA relais V161')
        select = controls.locator('[data-forge-campaign-project-v161]')
        for kind in ['mission', 'ship']:
            option = select.locator('option', has_text=f'QA campagne {kind} V161')
            select.select_option(option.get_attribute('value'))
            controls.locator('[data-forge-campaign-v161="add"]').click()
        controls.locator('[data-forge-campaign-v161="create"]').click()
        page.wait_for_function('()=>JSON.parse(localStorage.getItem("atf:forge-campaign:v161"))?.stages.length===2')
        initial = campaign(page)
        check('native builder stores exactly two ordered frozen projects without completing either',
              [entry['project']['kind'] for entry in initial['stages']] == ['mission', 'ship'] and all(entry['result'] is None for entry in initial['stages']))
        capture(page, '01-created.png')
        controls.locator('[data-forge-campaign-v161="launch"]').click()
        wait_engine(page, 'mission')
        check('first stage owns native Mission and no hidden Hub continues running', not observe(page, 'mission')['otherRunning'])
        phase('native Mission story, extraction and automatic persisted stage result')
        transmit(page, 'mission')
        page.wait_for_function('()=>JSON.parse(localStorage.getItem("atf:forge-campaign:v161")).stages[0].result!==null')
        first = campaign(page)
        check('Mission native extraction persists objective and exact chosen answer, unlocking only Ship',
              first['revision'] == 1 and first['stages'][0]['result']['objectiveIds'] == ['goal']
              and first['stages'][0]['result']['narrative'][0]['history'] == [{'nodeId': 'start', 'choiceId': 'report'}]
              and first['stages'][1]['result'] is None)
        check('first stage and its rewards leave campaign profile byte-identical', profile(page) == before_profile)
        capture(page, '02-mission-completed.png')
        phase('real page reload retains completed boundary and unlocks second frozen stage')
        page.reload(wait_until='domcontentloaded')
        enter_forge(page)
        controls = panel(page)
        check('reload preserves exact completed result and pending Ship stage', campaign(page) == first)
        capture(page, '03-after-reload.png')
        controls.locator('[data-forge-campaign-v161="launch"]').click()
        wait_engine(page, 'ship')
        second_entry = observe(page, 'ship')
        check('next-stage launch uses native Ship only and does not transfer previous story items',
              second_entry['kind'] == 'ship' and not second_entry['otherRunning'] and second_entry['items'] == [])
        phase('compact and intermediate native disclosure hitboxes')
        for width, height in [(721, 900), (390, 844)]:
            page.set_viewport_size({'width': width, 'height': height})
            toggle = page.locator('[data-panel="hub"] [data-forge-campaign-toggle-v161]')
            point = toggle.evaluate('''node=>{const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
              return {x,y,within:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,hit:document.elementFromPoint(x,y)===node};}''')
            check(f'{width}px campaign disclosure is visible and receives native pointer without checkpoint overlap', point['within'] and point['hit'])
            page.mouse.click(point['x'], point['y'])
            controls = page.locator('[data-panel="hub"] .forge-campaign-v161')
            controls.locator('[data-forge-campaign-v161="retry"]').click()
            check(f'{width}px early retry does not complete pending stage', campaign(page)['stages'][1]['result'] is None)
            capture(page, f'04-ship-controls-{width}.png')
            controls.locator('[data-forge-campaign-toggle-v161]').click()
        page.set_viewport_size({'width': 1600, 'height': 1050})
        phase('native Ship story finishes the final stage automatically')
        transmit(page, 'ship')
        page.wait_for_function('()=>JSON.parse(localStorage.getItem("atf:forge-campaign:v161")).stages.every(s=>s.result!==null)')
        final = campaign(page)
        check('Ship native authored success completes local campaign with two result receipts', final['revision'] == 2 and all(stage['result'] for stage in final['stages']))
        controls = panel(page, 'ship')
        check('completed local campaign offers no extra stage launch', controls.locator('[data-forge-campaign-v161="launch"]').is_disabled())
        check('entire local campaign leaves profile byte-identical after native reload and both results', profile(page) == before_profile)
        capture(page, '05-complete.png')
        phase('native JSON export preserves frozen stages and completion receipts')
        with page.expect_download() as received:
            controls.locator('[data-forge-campaign-v161="export"]').click()
        exported = output/'campaign-export.json'
        received.value.save_as(str(exported))
        check('native campaign export matches actual durable record', json.loads(exported.read_text()) == final)
        report['campaign'] = final
        check('browser reports no script, HTTP or request failures', not report['pageErrors'] and not report['httpErrors'] and not report['requestFailures'])
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
        (output/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
