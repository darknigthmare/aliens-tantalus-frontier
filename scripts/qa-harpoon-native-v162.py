"""Four catalogue Harpoons through native procurement, equipment and QZ-18 play.
Only disclosed initial profiles enter through the Save file input. JavaScript
observes state; controls own all gameplay, pause, save and resume mutations.
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
parser.add_argument('--identities', nargs='+', default=['024', '064', '104', '144'], choices=['024', '064', '104', '144'])
parser.add_argument('--prepare-only', action='store_true', help='Write disclosed initial profiles without starting Chromium.')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'phase': 'fixture generation', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [], 'identities': [],
          'method': 'Disclosed new profile JSON via native Save input, actual catalogue procurement/equipment, native non-Forge QZ18 launch, mouse aim plus keyboard fire/walk/E, native pause/save/page reload. JavaScript observations only.',
          'limitations': ['Automated Chromium, not human QA or franchise1:1 certification.',
                          'QZ18 is a native original Tantalus noncombat operation; no combat kill, grappling traversal or external prop dimensions are certified.',
                          'All four IDs share existing native project-design art. Generic reference geometry is not canonical evidence.',
                          'Coop ownership/wall-occlusion adversarial cases belong to the separately declared Node regression coverage; browser journey uses the actual primary operator.']}


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def check(label, passed):
    assert passed, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def fixture(number):
    code = """import{createDefaultSave,getProcurementQuote}from'./src/save.js';import{WEAPONS}from'./src/content.js';
const n=process.argv[1],s=createDefaultSave(),w=WEAPONS.find(w=>w.id.startsWith('weapon-'+n+'-'));
if(!w)throw Error('Unknown Harpoon ID');s.needsPlayerCreationV84=false;s.player.name='QA Harpoon '+n+' V162';
s.strategy.plannedCampaignId='special-archive-relay';s.worldId='world-05-lethe';s.scene='hub';s.settings.reducedMotion=true;
s.galaxy.resources.credits=50000;s.strategy.inventory.weaponIds=s.strategy.inventory.weaponIds.filter(id=>!id.includes('harpoon-gun'));
s.player.weaponIds=s.player.weaponIds.filter(id=>!id.includes('harpoon-gun'));s.player.ammo.primary=32;
console.log(JSON.stringify({profile:s,weapon:w,quote:getProcurementQuote(s,'weapon',w)}));"""
    data = json.loads(subprocess.run(['node', '--input-type=module', '-e', code, number], cwd=repo, capture_output=True, text=True, check=True).stdout)
    raw = json.dumps(data['profile'], ensure_ascii=False, separators=(',', ':')).encode()
    path = output/f'initial-profile-{number}.json'
    path.write_bytes(raw)
    (output/f'initial-fixture-{number}.json').write_text(json.dumps({'weapon': data['weapon'], 'quote': data['quote'],
            'profileSha256': hashlib.sha256(raw).hexdigest(), 'declaredChanges': ['needsPlayerCreationV84=false', 'named isolated profile',
            'unplayed QZ18 plan/Lethe', 'scene=hub', 'reduced motion', '50000 initial credits', 'Harpoons absent from owned/equipped inventory', '32 initial primary reserve']}, ensure_ascii=False, indent=2))
    return data, raw


fixtures = {number: fixture(number) for number in args.identities}
if args.prepare_only:
    print(json.dumps({'status': 'fixtures-prepared-no-browser', 'identities': args.identities, 'output': str(output)}))
    raise SystemExit(0)


def observe(page):
    return page.evaluate('''()=>{const e=__ATF_GAME__,s=__ATF_V51__.saveSystem.data,p=e.player;
      return {running:e.running,paused:e.paused,operation:s.strategy.currentOperation?.id,context:s.strategy.currentOperation?.context,
        kind:e.isArchiveRelayV122?.(),forge:!!e.forgeSessionV141,weaponId:e.weaponActionProfileV131?.()?.weaponId,
        player:p?{x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,grounded:p.grounded,ammo:p.ammo,reserve:p.ammoReserve,shots:p.shots,facing:p.facing,
          held:p.heldWeaponVisualV125?structuredClone(p.heldWeaponVisualV125):null}:null,
        camera:{...e.camera},projectiles:(e.weaponProjectilesV131||[]).map(v=>({id:v.id,weaponId:v.weaponId,x:v.x,y:v.y,vx:v.vx,vy:v.vy,remaining:v.remaining,ownerIsPlayer:v.owner===p})),
        recoverable:(e.recoverableWeaponsV131||[]).map(v=>({id:v.id,weaponId:v.weaponId,x:v.x,y:v.y,remaining:v.remaining,ownerIsPlayer:v.owner===p})),
        recoveryIndex:e.recoverableWeaponIndexV131?.()??-1,
        saved:s.strategy.currentOperation?.resumeState?structuredClone(s.strategy.currentOperation.resumeState):null,
        inventory:[...s.strategy.inventory.weaponIds],equipped:[...s.player.weaponIds],credits:s.galaxy.resources.credits};}''')


def open_view(page, view):
    if page.locator(f'[data-panel="{view}"].active').is_visible():
        return
    exit_hub = page.locator('#exit-hub')
    if exit_hub.is_visible():
        exit_hub.click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{view}"]').click()


def capture(page, name, selector='#game-canvas'):
    page.locator(selector).screenshot(path=str(output/name))
    report['captures'].append(name)


def wait_runtime(page):
    page.wait_for_function('''()=>{const e=__ATF_GAME__;return e.running&&e.isArchiveRelayV122?.()
      &&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&!document.querySelector('#mission-runtime-v62').hidden&&e.player.grounded;}''', timeout=90000)
    if observe(page)['paused']:
        page.locator('#game-canvas').focus()
        page.keyboard.press('KeyP')
    page.wait_for_function('()=>__ATF_GAME__.player.heldWeaponVisualV125?.weaponId===__ATF_GAME__.weaponActionProfileV131()?.weaponId', timeout=90000)


def deploy(page):
    open_view(page, 'command')
    page.locator('#operation-launch').click()
    # Advance only native insertion controls; an ordinary first visit owns all
    # phases. The authored QZ18 preparation can be selected explicitly.
    for _ in range(12):
        root = page.locator('#mission-insertion-v62')
        if not root.is_visible():
            break
        if page.locator('[data-story-protocol="technical-audit"]').is_visible():
            page.locator('[data-story-protocol="technical-audit"]').click()
        advance = page.locator('[data-insertion-action="advance"]')
        advance.click()
        page.wait_for_timeout(80)
    wait_runtime(page)


def walk_to(page, center_x):
    state = observe(page)['player']
    current = state['x']+state['w']/2
    if abs(current-center_x) < 3:
        return
    key = 'KeyD' if center_x > current else 'KeyA'
    page.locator('#game-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function('''t=>{const p=__ATF_GAME__.player,c=p.x+p.w/2;return t.right?c>=t.x-2:c<=t.x+2;}''',
                               arg={'x': center_x, 'right': center_x > current}, timeout=30000)
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_GAME__.player.vx)<1')


def aim_world(page, x, y):
    point = page.locator('#game-canvas').evaluate('''(node,target)=>{const r=node.getBoundingClientRect(),c=__ATF_GAME__.camera;
      return {x:r.left+(target.x-c.x)/1280*r.width,y:r.top+(target.y-c.y)/720*r.height};}''', {'x': x, 'y': y})
    page.mouse.move(point['x'], point['y'])
    page.mouse.down(button='right')


def fire_one(page, number, label, target_x, target_y, pause=False):
    before = observe(page)
    aim_world(page, target_x, target_y)
    page.wait_for_function('()=>!!__ATF_GAME__.player.pointerAimV83&&__ATF_GAME__.player.heldWeaponVisualV125?.weaponId===__ATF_GAME__.weaponActionProfileV131()?.weaponId')
    capture(page, f'{number}-{label}-aim.png')
    page.keyboard.down('KeyF')
    try:
        page.wait_for_function('(shots)=>__ATF_GAME__.player.shots>shots', arg=before['player']['shots'])
    finally:
        page.keyboard.up('KeyF')
        page.mouse.up(button='right')
    if pause:
        page.keyboard.press('KeyP')
        page.wait_for_function('()=>__ATF_GAME__.paused')
    after = observe(page)
    check(f'{number} {label}: one native shot spends exactly one Harpoon',
          before['player']['ammo']+before['player']['reserve']-after['player']['ammo']-after['player']['reserve'] == 1)
    return after


def save_native(page):
    page.locator('#mission-save-v160').click()
    page.wait_for_function('()=>!!__ATF_V51__.saveSystem.data.strategy.currentOperation?.resumeState')
    return observe(page)


def reload_native(page):
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-continue').click()
    if not page.locator('#game-canvas').is_visible():
        open_view(page, 'command')
        page.locator('#operation-launch').click()
    wait_runtime(page)


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for number in args.identities:
            context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block', accept_downloads=True)
            page = context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
            page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('dialog', lambda dialog: dialog.accept())
            data, raw = fixtures[number]
            weapon_id = data['weapon']['id']
            row = {'number': number, 'weaponId': weapon_id, 'fixtureSha256': hashlib.sha256(raw).hexdigest(), 'observations': {}}
            report['identities'].append(row)
            phase(number+': import disclosed unplayed profile, buy and equip from actual armory')
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': f'qa-harpoon-{number}.json', 'mimeType': 'application/json', 'buffer': raw})
            page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg=data['profile']['player']['name'])
            open_view(page, 'armory')
            page.locator('#armory-search').fill(weapon_id)
            page.locator(f'[data-catalog-entry="{weapon_id}"]').click()
            acquisition = page.locator(f'#armory-catalog-detail [data-procure-id="{weapon_id}"]')
            check(number+': current native resolver permits acquisition, historical V61 blocker absent', acquisition.is_enabled())
            credits = observe(page)['credits']
            acquisition.click()
            page.wait_for_function('id=>__ATF_V51__.saveSystem.data.strategy.inventory.weaponIds.includes(id)', arg=weapon_id)
            check(number+': actual procurement charges exact current quote once', credits-observe(page)['credits'] == data['quote']['credits'])
            page.locator(f'#armory-catalog-detail [data-equip-id="{weapon_id}"]').click()
            page.wait_for_function('id=>__ATF_V51__.saveSystem.data.player.weaponIds.at(-1)===id', arg=weapon_id)
            capture(page, f'{number}-armory-equipped.png', '[data-panel="armory"]')
            phase(number+': deploy native non-Forge QZ18 and compare both held orientations')
            deploy(page)
            row['operationId'] = observe(page)['operation']
            check(number+': selected identity is actually held in the native non-Forge operation', observe(page)['weaponId'] == weapon_id and not observe(page)['forge'])
            walk_to(page, 400)
            for label, direction in [('right', 1), ('left', -1)]:
                phase(number+': '+label+' aim, floor impact and native recovery')
                player = observe(page)['player']
                fire_one(page, number, label, player['x']+player['w']/2+direction*140, player['y']+player['h']+25)
                page.wait_for_function('()=>__ATF_GAME__.recoverableWeaponsV131.length===1', timeout=15000)
                impact = observe(page)
                item = impact['recoverable'][0]
                check(f'{number} {label}: real impact creates exactly one owned recoverable with matching profile', item['ownerIsPlayer'] and item['weaponId'] == weapon_id)
                walk_to(page, item['x'])
                page.wait_for_function('()=>__ATF_GAME__.recoverableWeaponIndexV131()===0')
                if label == 'right':
                    # Preserve a real landed harpoon via ordinary UI, reload the
                    # page and recover the same saved ID in its original scene.
                    page.locator('#game-canvas').focus()
                    page.keyboard.press('KeyP')
                    page.wait_for_function('()=>__ATF_GAME__.paused')
                    landed_saved = save_native(page)
                    row['observations']['landedSaved'] = landed_saved
                    check(number+': native save includes the actual landed Harpoon ID',
                          landed_saved['saved']['weaponActionsV131']['recoverable'][0]['id'] == item['id'])
                    reload_native(page)
                    restored = observe(page)
                    row['observations']['landedRestored'] = restored
                    capture(page, f'{number}-right-restored.png')
                    check(number+': page reload restores one landed owned Harpoon without resource refill',
                          len(restored['recoverable']) == 1 and restored['recoverable'][0]['id'] == item['id'] and restored['recoverable'][0]['ownerIsPlayer']
                          and restored['player']['ammo']+restored['player']['reserve'] == landed_saved['player']['ammo']+landed_saved['player']['reserve'])
                    walk_to(page, restored['recoverable'][0]['x'])
                before_recovery = observe(page)
                capture(page, f'{number}-{label}-landed.png')
                page.locator('#game-canvas').focus()
                page.keyboard.press('KeyE')
                page.wait_for_function('()=>__ATF_GAME__.recoverableWeaponsV131.length===0')
                recovered = observe(page)
                check(f'{number} {label}: E recovers one Harpoon once to the real owner reserve', recovered['player']['reserve'] == before_recovery['player']['reserve']+1)
                page.keyboard.press('KeyE')
                check(f'{number} {label}: repeated E cannot mint a second Harpoon', observe(page)['player']['reserve'] == recovered['player']['reserve'])
                row['observations'][label] = {'impact': impact, 'recovered': recovered}
                capture(page, f'{number}-{label}-recovered.png')
                # Native interaction animation must finish before the next fire.
                page.wait_for_function('()=>!(__ATF_GAME__.player.interactionClock>0)&&!(__ATF_GAME__.player.fireClock>0)')
            phase(number+': real in-flight Harpoon pause/save/reload')
            walk_to(page, 400)
            flight = fire_one(page, number, 'flight', 1150, 480, pause=True)
            check(number+': native pause freezes an actual finite Harpoon in flight', len(flight['projectiles']) == 1 and flight['projectiles'][0]['ownerIsPlayer'])
            flight_saved = save_native(page)
            projectile_id = flight['projectiles'][0]['id']
            check(number+': native save records the actual projectile identity and owner',
                  any(item['id'] == projectile_id and item['ownerId'] == 'player' for item in flight_saved['saved']['weaponActionsV131']['projectiles']))
            row['observations']['flightSaved'] = flight_saved
            capture(page, f'{number}-flight-saved.png')
            reload_native(page)
            resumed = observe(page)
            row['observations']['flightResumed'] = resumed
            check(number+': resumed flight or its real impact keeps the same identity without resource refill',
                  sum(item['id'] == projectile_id for item in resumed['projectiles']+resumed['recoverable']) == 1
                  and resumed['player']['ammo']+resumed['player']['reserve'] == flight_saved['player']['ammo']+flight_saved['player']['reserve'])
            row['observations']['flightResumed'] = resumed
            capture(page, f'{number}-flight-resumed.png')
            context.close()
        check('no browser script, failed HTTP or request errors occurred', not report['pageErrors'] and not report['httpErrors'] and not report['requestFailures'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            capture(page, 'failure.png', 'body')
            (output/'failure-observation.json').write_text(json.dumps(observe(page), ensure_ascii=False, indent=2))
        except Exception:
            pass
        raise
    finally:
        (output/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
