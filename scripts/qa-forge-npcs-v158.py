"""Native authoring and playtest journey for physical Forge conversation partners.
All mutations use native controls/file inputs/keys. Evaluations observe only.
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
report = {'status': 'running', 'phase': 'browser setup', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Production app; actual brush placement, inspector edits, clipboard/undo/redo, native exports/imports, keyboard walking, named dialogue controls, physical doors and JSON checkpoint reload. Evaluations observe only.',
          'limitations': ['Automated Chromium journey, not a human usability study or touchscreen certification.',
                          'Stationary noncombatant local characters reuse existing colonial personnel atlases; no campaign recruitment, NPC patrol, arbitrary scripts or cloud service is claimed.']}


def fixture(kind):
    floor = 15 if kind == 'ship' else 16
    rooms = []
    for room_id in ['a', 'b']:
        cells = [{'id': f'{room_id}-f{x}', 'x': x, 'y': floor, 'type': 'floor', 'layer': 'structure'} for x in range(32)]
        cells += [{'id': f'{room_id}-spawn', 'x': 1, 'y': floor-1, 'type': 'spawn', 'layer': 'gameplay'},
                  {'id': f'{room_id}-goal', 'x': 28, 'y': floor-1, 'type': 'objective', 'layer': 'gameplay'},
                  {'id': f'{room_id}-door', 'x': 12 if room_id == 'a' else 2, 'y': floor-1, 'type': 'door', 'layer': 'gameplay'},
                  {'id': f'{room_id}-npc', 'x': 4 if room_id == 'a' else 6, 'y': floor-1, 'type': 'npc', 'layer': 'gameplay',
                   'npc': {'schema': 1, 'name': 'Agent du relais' if room_id == 'a' else 'Responsable de relève',
                           'presetId': 'colonial-technician' if room_id == 'a' else 'colonial-medic', 'facing': -1},
                   'narrative': {'schema': 1, 'title': 'Transmission de service', 'start': 'start',
                                 **({'items': [{'id': 'badge', 'label': 'Badge du relais'}]} if room_id == 'a' else {}),
                                 'nodes': [{'id': 'start', 'text': 'Remettez ce badge au relais suivant.' if room_id == 'a' else 'Avez-vous le badge du relais ?',
                                            'choices': [{'id': 'take', 'label': 'Prendre le badge', 'next': 'done', 'rewardItemId': 'badge'} if room_id == 'a' else
                                                        {'id': 'deliver', 'label': 'Remettre le badge', 'next': 'done', 'requiresItemId': 'badge', 'consumeRequiredItem': True,
                                                         'requiresPlaySeconds': 1, 'rewardObjectiveId': 'b-goal'}]},
                                           {'id': 'done', 'text': 'Transmission enregistrée.', 'choices': []}]}}]
        rooms.append({'id': room_id, 'name': f'Relais {room_id}', 'size': [32, 18], 'cells': cells})
    return {'schema': 3, 'kind': kind, 'name': f'QA PNJ {kind} V158', 'activeRoomId': 'a', 'rooms': rooms,
            'links': [{'id': 'ab', 'from': {'roomId': 'a', 'cellId': 'a-door'}, 'to': {'roomId': 'b', 'cellId': 'b-door'}, 'bidirectional': True}]}


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def upload(page, selector, value, name):
    page.locator(selector).set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': json.dumps(value).encode()})
    page.wait_for_function('(selector)=>document.querySelector(selector).value===""', arg=selector)


def authored(page):
    return page.evaluate('()=>structuredClone(__ATF_V51__.editor.model.data)')


def observe(page, kind):
    return page.evaluate('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__,s=e.forgeSessionV141;
      return {room:s.currentRoomId,open:e.forgeNarrativeOpenV156,paused:!!e.paused,running:e.running,
        actors:structuredClone(e.forgeNpcsV158||[]),render:(e.forgeNpcRenderV158||[]).map(d=>({cellId:d.cellId,drawn:d.drawn,height:d.geometry?.standingHeight})),
        player:{x:e.player.x,y:e.player.y,health:e.player.health,ammo:e.player.ammo??null,reserve:e.player.ammoReserve??null},
        seconds:s.narrativePlaySecondsV157||0,items:[...(s.narrativeInventoryV157||[])],history:structuredClone(s.narrativeV156||[]),completed:[...s.completedObjectives],
        terminals:kind==='mission'?Number(!!e.powerNode)+Number(!!e.archiveTerminal):e.v51Terminals.length};}''', kind)


def capture(page, name):
    page.screenshot(path=str(output/name), full_page=True)
    report['captures'].append(name)


def point(page, x, y):
    return page.evaluate('''({x,y})=>{const e=__ATF_V51__.editor,m=e.matrix(),r=e.canvas.getBoundingClientRect();
      return {x:(m.x+(x+.5)*m.scale)/e.canvas.width*r.width,y:(m.y+(y+.5)*m.scale)/e.canvas.height*r.height};}''', {'x': x, 'y': y})


def enter_forge(page):
    page.locator('#title-start:visible, #title-forge:visible').first.wait_for(state='visible', timeout=45000)
    if page.locator('#title-start').is_visible():
        page.locator('#title-start').click()
    page.locator('#title-forge').click()
    page.locator('#editor-canvas').wait_for(state='visible')


def walk(page, kind, target, direction=1):
    code = 'KeyD' if direction > 0 else 'KeyA'
    page.keyboard.down(code)
    try:
        page.wait_for_function('''({kind,target})=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;
          return kind==='ship'?e.nearestForgeInteractionV141()?.type===target
            :target==='npc'?!!e.forgeNarrativeNpcV158():!!e.forgeLinkedDoorV141();}''',
                               arg={'kind': kind, 'target': target}, timeout=90000)
    finally:
        page.keyboard.up(code)


def checkpoint_panel(page, kind=None):
    view = 'editor' if kind is None else ('play' if kind == 'mission' else 'hub')
    panel = page.locator(f'[data-panel="{view}"] .forge-checkpoint-v157')
    if panel.locator('details').get_attribute('open') is None:
        panel.locator('summary').click()
    return panel


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    context = browser.new_context(viewport={'width': 1600, 'height': 1050}, service_workers='block', accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        phase('import isolated profile through native settings')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        upload(page, '#save-import', {'schema': 52, 'needsPlayerCreationV84': False, 'player': {'name': 'QA PNJ Forge'},
                                     'settings': {'reducedMotion': True}}, 'qa-pnj-profile.json')
        page.wait_for_function('''()=>{const s=JSON.parse(localStorage.getItem('atf-v47-profile-1')),m=window.__ATF_V51__?.saveSystem?.data;
          return s?.player?.name==='QA PNJ Forge'&&m?.player?.name==='QA PNJ Forge'&&s.needsPlayerCreationV84===false&&m.needsPlayerCreationV84===false
            &&s.settings?.reducedMotion===true&&m.settings?.reducedMotion===true&&document.querySelector('#setting-motion')?.checked===true
            &&document.documentElement.classList.contains('reduced-motion');}''')
        page.locator('#return-title').click()
        enter_forge(page)
        for kind in ['mission', 'ship']:
            floor = 15 if kind == 'ship' else 16
            phase(kind + ': import authored rooms and place a new PNJ with the real brush')
            source = fixture(kind)
            (output/f'{kind}-input.json').write_text(json.dumps(source, ensure_ascii=False, indent=2))
            upload(page, '#editor-import', source, f'qa-pnj-{kind}.json')
            page.locator('.forge-message-v130').get_by_text('Projet importé.', exact=False).wait_for()
            page.locator('[data-editor-tool="npc"]').click()
            canvas = page.locator('#editor-canvas')
            canvas.click(position=point(page, 8, floor-1))
            created = next(c for c in authored(page)['rooms'][0]['cells'] if c['type']=='npc' and c['x']==8)
            page.locator(f'[data-forge-action="focus"][data-cell="{created["id"]}"]').click()
            page.locator('[data-forge-field="npc-name"]').fill('Relève posée à la main')
            page.locator('[data-forge-field="npc-name"]').press('Tab')
            page.locator('[data-forge-field="npc-preset"]').select_option('colonial-medic')
            page.locator('[data-forge-field="npc-facing"]').select_option('-1')
            page.locator('[data-forge-action="story-create"]').click()
            page.locator('[data-forge-field="story-title"]').fill('Dialogue posé dans l’atelier')
            page.locator('[data-forge-field="story-text"]').fill('Ce personnage a été posé et écrit avec les vrais outils.')
            page.locator('[data-forge-action="story-save"]').click()
            placed = next(c for c in authored(page)['rooms'][0]['cells'] if c['id']==created['id'])
            check(kind + ': brush placement and actual inspector create a named physical PNJ with its own appearance, facing and editable dialogue',
                  placed['npc']=={'schema':1,'name':'Relève posée à la main','presetId':'colonial-medic','facing':-1}
                  and placed['narrative']['title']=='Dialogue posé dans l’atelier' and placed['type']=='npc')
            capture(page, f'{kind}-01-placed-inspector.png')
            phase(kind + ': native copy/paste and undo/redo')
            page.locator('[data-forge-action="copy"]').click()
            canvas.hover(position=point(page, 10, floor-1))
            page.locator('[data-forge-action="paste"]').click()
            copied = next(c for c in authored(page)['rooms'][0]['cells'] if c['type']=='npc' and c['x']==10)
            check(kind + ': native clipboard preserves speaker identity and the complete dialogue graph', copied['npc']==placed['npc'] and copied['narrative']==placed['narrative'])
            canvas.focus()
            page.keyboard.press('Control+z')
            check(kind + ': real undo removes only the copied PNJ', not any(c['id']==copied['id'] for c in authored(page)['rooms'][0]['cells']))
            page.keyboard.press('Control+Shift+z')
            check(kind + ': real redo restores that PNJ and its authored graph', next(c for c in authored(page)['rooms'][0]['cells'] if c['id']==copied['id'])==copied)
            for cell_id in [copied['id'], created['id']]:
                page.locator(f'[data-forge-action="focus"][data-cell="{cell_id}"]').click()
                page.locator('[data-forge-action="delete"]').click()
            page.locator('[data-forge-action="focus"][data-cell="a-npc"]').click()
            page.locator('[data-forge-field="npc-name"]').fill(f'Agent {kind} <QA>')
            page.locator('[data-forge-field="npc-name"]').press('Tab')
            page.locator('[data-forge-field="npc-preset"]').select_option('colonial-officer')
            page.locator('[data-forge-field="story-title"]').fill(f'Transmission {kind} éditée')
            page.locator('[data-forge-action="story-save"]').click()
            edited = authored(page)
            with page.expect_download() as info:
                page.locator('#editor-export').click()
            exported = output/f'{kind}-authored-export.json'
            info.value.save_as(str(exported))
            check(kind + ': export contains the exact named PNJ in both rooms, linked doors and actual dialogue data', json.loads(exported.read_text())==edited)
            phase(kind + ': reject invalid imported PNJ without changing the document')
            bad = json.loads(exported.read_text())
            next(c for c in bad['rooms'][0]['cells'] if c['id']=='a-npc')['npc']['presetId']='/untrusted-art.png'
            upload(page, '#editor-import', bad, 'invalid-npc.json')
            page.locator('.forge-message-v130').get_by_text('apparence ou orientation invalide', exact=False).wait_for()
            check(kind + ': bad NPC import preserves the complete previously authored document', authored(page)==edited)
            # setupEditor autosaves each committed authoring change. Observe its
            # actual durable record rather than invoking a campaign save button.
            page.wait_for_function('''()=>{const store=window.__ATF_V62__?.forgeSaveSystem,doc=window.__ATF_V51__?.editor?.model?.data;
              if(!store?.lastWriteV130?.persisted||!doc)return false;
              const saved=JSON.parse(localStorage.getItem(store.key)),record=saved?.projects.find(p=>p.id===saved.activeProjectId);
              const content=p=>Object.fromEntries(['schema','kind','name','activeRoomId','rooms','links'].map(k=>[k,p?.[k]]));
              return saved.activeProjectId===store.data.activeProjectId&&JSON.stringify(content(record))===JSON.stringify(content(doc));}''')
            campaign = page.evaluate('()=>localStorage.getItem("atf-v47-profile-1")')
            phase(kind + ': start the real native playtest and reach the human speaker')
            page.locator('#editor-play').click()
            game_canvas = page.locator('#game-canvas' if kind=='mission' else '#hub-canvas')
            game_canvas.wait_for(state='visible')
            page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;return e.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&e.player.grounded;}''', arg=kind, timeout=90000)
            game_canvas.focus()
            if kind=='mission':
                ammunition = observe(page, kind)['player']['ammo']
                page.keyboard.down('KeyF')
                try:
                    page.wait_for_function('ammo=>__ATF_GAME__.player.ammo<ammo', arg=ammunition)
                finally:
                    page.keyboard.up('KeyF')
            walk(page, kind, 'npc')
            page.wait_for_function('''kind=>{const e=kind==='mission'?__ATF_GAME__:__ATF_HUB__;return e.forgeNpcRenderV158?.some(d=>d.cellId==='a-npc'&&d.drawn);}''', arg=kind)
            before = observe(page, kind)
            check(kind + ': the authored body is rendered with the human stature and without any terminal substitute',
                  before['actors'][0]['cellId']=='a-npc' and before['actors'][0]['name']==f'Agent {kind} <QA>'
                  and before['render'][0]['height']==96.5 and before['terminals']==0)
            capture(page, f'{kind}-02-physical-person.png')
            page.keyboard.press('KeyE')
            dialog = page.locator('[data-forge-narrative-v156] [role="dialog"]')
            dialog.wait_for(state='visible')
            check(kind + ': E opens a named character exchange and escapes the authored name as text',
                  dialog.get_attribute('aria-label')==f'Dialogue avec Agent {kind} <QA>'
                  and dialog.locator('[data-forge-speaker-v158]').inner_text()==f'Agent {kind} <QA> · Personnel du plan Forge'
                  and dialog.locator('img').count()==0)
            frozen = observe(page, kind)
            page.keyboard.down('KeyD'); page.keyboard.down('KeyF'); page.wait_for_timeout(250)
            page.keyboard.up('KeyF'); page.keyboard.up('KeyD')
            after = observe(page, kind)
            check(kind + ': movement, fire and active story clock remain frozen while speaking', frozen['player']==after['player'] and frozen['seconds']==after['seconds'])
            for width, height in [(1600,900),(390,844)]:
                page.set_viewport_size({'width':width,'height':height})
                bounds = dialog.evaluate('node=>{const r=node.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};}')
                check(f'{kind}: named dialogue remains inside the {width}x{height} viewport', bounds['left']>=0 and bounds['top']>=0 and bounds['right']<=width and bounds['bottom']<=height)
                capture(page, f'{kind}-dialogue-{width}x{height}.png')
            page.set_viewport_size({'width':1600,'height':1050})
            dialog.locator('[data-story-choice="answer-1"]').click()
            check(kind + ': the edited PNJ response grants its single authored story token', observe(page,kind)['items']==['badge'])
            page.keyboard.press('Escape'); dialog.wait_for(state='detached')
            phase(kind + ': traverse the real door and meet the second authored character')
            walk(page,kind,'door'); page.keyboard.press('KeyE')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.currentRoomId==='b' ''',arg=kind)
            walk(page,kind,'npc'); page.keyboard.press('KeyE'); dialog.wait_for(state='visible')
            check(kind + ': another room compiles its own person and dialogue, retaining the first person’s token',
                  observe(page,kind)['actors'][0]['cellId']=='b-npc' and dialog.get_attribute('aria-label')=='Dialogue avec Responsable de relève'
                  and not dialog.locator('[data-story-choice="deliver"]').is_disabled())
            dialog.locator('[data-story-choice="deliver"]').click()
            check(kind + ': the second PNJ consumes the token and validates only its authored objective', observe(page,kind)['items']==[] and observe(page,kind)['completed']==['b-goal'])
            page.keyboard.press('Escape'); dialog.wait_for(state='detached')
            capture(page,f'{kind}-03-second-person.png')
            phase(kind + ': checkpoint, stop and actual page reload')
            panel=checkpoint_panel(page,kind)
            panel.locator('[data-forge-checkpoint-v157="save"]').click()
            panel.locator('[role="status"]').get_by_text('Checkpoint de playtest enregistré',exact=False).wait_for()
            saved=observe(page,kind)
            page.locator('#retreat-mission' if kind=='mission' else '#exit-hub').click()
            page.locator('#editor-canvas').wait_for(state='visible')
            check(kind + ': stopping preserves both the author document and campaign bytes', authored(page)==edited and page.evaluate('()=>localStorage.getItem("atf-v47-profile-1")')==campaign)
            page.reload(wait_until='domcontentloaded'); enter_forge(page)
            panel=checkpoint_panel(page)
            panel.locator('[data-forge-checkpoint-v157="resume"]').click()
            game_canvas=page.locator('#game-canvas' if kind=='mission' else '#hub-canvas')
            game_canvas.wait_for(state='visible',timeout=90000)
            restored=observe(page,kind)
            check(kind + ': JSON reload reconstructs the right physical PNJ and preserves wounds/ammunition, completed goals and history without replay',
                  restored['room']=='b' and restored['actors']==saved['actors'] and restored['player']==saved['player']
                  and restored['history']==saved['history'] and restored['completed']==saved['completed'] and restored['items']==[])
            game_canvas.focus(); page.keyboard.press('KeyE'); dialog.wait_for(state='visible')
            check(kind + ': resumed PNJ keeps its finished cursor and cannot repeat the exchange', dialog.locator('[data-story-choice]').count()==0 and observe(page,kind)['items']==[])
            capture(page,f'{kind}-04-reloaded-dialogue.png')
            page.keyboard.press('Escape'); dialog.wait_for(state='detached')
            walk(page,kind,'door',-1); page.keyboard.press('KeyE')
            page.wait_for_function('''kind=>(kind==='mission'?__ATF_GAME__:__ATF_HUB__).forgeSessionV141.currentRoomId==='a' ''',arg=kind)
            walk(page,kind,'npc',-1); page.keyboard.press('KeyE'); dialog.wait_for(state='visible')
            check(kind + ': returning to the first person retains that person’s own finished dialogue and no duplicate token',
                  dialog.get_attribute('aria-label')==f'Dialogue avec Agent {kind} <QA>' and dialog.locator('[data-story-choice]').count()==0 and observe(page,kind)['items']==[])
            page.keyboard.press('Escape'); dialog.wait_for(state='detached')
            page.locator('#retreat-mission' if kind=='mission' else '#exit-hub').click()
            page.locator('#editor-canvas').wait_for(state='visible')
            check(kind + ': complete multi-room conversation journey leaves campaign and author data unchanged', authored(page)==edited and page.evaluate('()=>localStorage.getItem("atf-v47-profile-1")')==campaign)
            panel=checkpoint_panel(page)
            panel.locator('[data-forge-checkpoint-v157="clear"]').click()
        check('no uncaught browser exception',not report['pageErrors'])
        check('no HTTP error or failed request except intentional navigation cancellation',not report['httpErrors'] and not [r for r in report['requestFailures'] if r['failure']!='net::ERR_ABORTED'])
        report['status']='passed'
    except Exception as error:
        report['status']='failed';report['error']=str(error)
        detail=f'{report["tooling"]} | {report["phase"]} | last passed: {report["checks"][-1] if report["checks"] else "none"} | {type(error).__name__}: {error}'
        print('::error title=Forge NPC::'+detail.replace('%','%25').replace('\r','%0D').replace('\n','%0A'),flush=True)
        try:
            report['failureContext']=page.evaluate('''()=>({focus:{tag:document.activeElement?.tagName,id:document.activeElement?.id,documentFocused:document.hasFocus()},views:[...document.querySelectorAll('.view.active')].map(n=>n.dataset.panel),messages:[...document.querySelectorAll('.forge-message-v130')].map(n=>n.textContent)})''')
            capture(page,'failure.png')
        except Exception:
            pass
        raise
    finally:
        (output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        context.close();browser.close()
