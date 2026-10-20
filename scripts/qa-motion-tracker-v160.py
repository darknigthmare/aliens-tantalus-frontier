"""Native M314 dotation in the ship, observed against BISHOP's real travel.

One disclosed05h laboratory Save is imported through the native picker. A real
four-hour strategy command schedules BISHOP; no actor or clock is injected into
the running engine. Browser evaluation only observes the runtime and canvas.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence belongs outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'httpErrors': [], 'requestFailures': [],
          'method': 'Disclosed05h laboratory Save picker, native four-hour command, A/D facing, keyboard Q and native tactile detector control. Read-only observations of an actual moving BISHOP body.',
          'limitations': ['Automated native-control scenario, not human QA.',
                         'The four strategic hours are not observed physical travel.',
                         'One ship route and local detector session; no canonical M314 specification or artistic1:1 certification.',
                         'Audio scheduling is tested separately; this scenario does not claim a human heard the beep.']}


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'], 'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def check(label, value):
    if not value:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def open_view(page, name):
    if page.locator('#menu-toggle').is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        page.locator('#menu-toggle').click()
    page.locator('[data-view="' + name + '"]').click()


def capture(page, name, frame=None):
    if frame:
        png = frame.pop('png')
        (output / name).write_bytes(base64.b64decode(png.split(',')[1]))
    else:
        page.locator('#hub-canvas').screenshot(path=str(output / name))
        frame = page.evaluate('''()=>{const h=__ATF_HUB__;return {tracker:h.motionTrackerSnapshotV160(),
          player:{x:h.player.x,y:h.player.y,facing:h.player.facing},bishop:structuredClone(h.npcAnnexStateV159)}}''')
    report['captures'].append({'file': name, 'state': frame})


script = '''import {createDefaultSave} from './src/save.js';const s=createDefaultSave();
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA détecteur V160';s.clock.hour=5;
s.settings.reducedMotion=false;Object.assign(s.hub,{deck:1,roomId:'science-lab',positionX:4500,positionY:532});
console.log(JSON.stringify(s));'''
raw = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo, capture_output=True, text=True, check=True).stdout.encode()
(output / 'disclosed-laboratory05h.json').write_bytes(raw)
report['identityBefore'] = identity()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, service_workers='block', has_touch=True)
    page.set_default_timeout(30000)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    page.on('requestfailed', lambda q: report['requestFailures'].append({'url': q.url, 'failure': q.failure}))
    page.on('response', lambda q: report['httpErrors'].append({'url': q.url, 'status': q.status}) if q.status >= 400 else None)
    page.on('dialog', lambda d: d.accept())
    try:
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'tracker05h.json', 'mimeType': 'application/json', 'buffer': raw})
        page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA détecteur V160'")
        open_view(page, 'hub')
        page.wait_for_function('()=>__ATF_HUB__?.running&&__ATF_HUB__.npcAnnexActorV159&&__ATF_HUB__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
        check('An idle scene has no acquired or active detector echoes', page.evaluate('''()=>{const m=__ATF_HUB__.motionTrackerSnapshotV160();return !m.active&&!m.contacts.length}'''))
        page.locator('#exit-hub').click()
        open_view(page, 'command')
        page.locator('[data-strategy-action="colony-relief"]').click()
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===9')
        open_view(page, 'hub')
        page.wait_for_function('()=>__ATF_HUB__.running&&__ATF_HUB__.npcAnnexActorV159?.vx<-.1')
        canvas = page.locator('#hub-canvas')
        canvas.focus()
        page.keyboard.down('KeyA')
        try:
            page.wait_for_function('()=>__ATF_HUB__.player.facing===-1')
        finally:
            page.keyboard.up('KeyA')
        page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1')
        capture(page, '00-laboratory-before-scan.png')
        start_x = page.evaluate('()=>__ATF_HUB__.npcAnnexActorV159.x')
        canvas.focus()
        page.keyboard.press('KeyQ')
        handle = page.wait_for_function('''()=>{const h=__ATF_HUB__,m=h.motionTrackerSnapshotV160(),a=h.player;
          if(!m.active||!m.contacts.some(c=>c.sector==='front')||!a.playerActionVisualV127?.drawn)return false;
          return {tracker:m,player:{x:a.x,y:a.y,facing:a.facing,toolUseClock:a.toolUseClock,
            action:structuredClone(a.playerActionVisualV127),heldWeapon:structuredClone(a.heldWeaponVisualV125)},
            bishop:structuredClone(h.npcAnnexStateV159),png:document.querySelector('#hub-canvas').toDataURL('image/png')};}''', polling='raf', timeout=15000)
        try:
            frame = handle.json_value()
        finally:
            handle.dispose()
        check('Keyboard Q acquires an actual moving front contact rather than labelling a species', frame['bishop']['x'] < start_x
              and all(not any(k in c for k in ['species', 'threat', 'crewId', 'name', 'faction']) for c in frame['tracker']['contacts']))
        check('The accepted scan holds the real detector implement and removes the carried firearm',
              frame['player']['action']['kind'] == 'motion-tracker' and frame['player']['heldWeapon'] is None)
        capture(page, '01-native-front-scan-and-handheld.png', frame)
        page.wait_for_function('()=>__ATF_HUB__.hubMotionTrackerCooldownV160===0')
        canvas.focus()
        page.keyboard.down('KeyD')
        try:
            page.wait_for_function('()=>__ATF_HUB__.player.facing===1')
        finally:
            page.keyboard.up('KeyD')
        page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1')
        page.set_viewport_size({'width': 390, 'height': 844})
        button = page.locator('[data-hub-control="depth"]')
        button.tap()
        page.wait_for_function("()=>__ATF_HUB__.motionTrackerSnapshotV160().contacts.some(c=>c.sector==='rear')")
        capture(page, '02-native-rear-sector.png')
        check('The native tactile control acquires the rear sector after the actual facing change', page.evaluate("()=>{const m=__ATF_HUB__.motionTrackerSnapshotV160();return m.active&&m.heading===1&&m.contacts.some(c=>c.sector==='rear')}"))
        page.locator('#exit-hub').click()
        check('Leaving the active ship view stops the displayed detector', page.evaluate('()=>!__ATF_HUB__.motionTrackerSnapshotV160().active'))
        open_view(page, 'hub')
        page.wait_for_function('()=>__ATF_HUB__.running')
        check('A reopened scene starts without stale acquired echoes', page.evaluate('()=>{const m=__ATF_HUB__.motionTrackerSnapshotV160();return !m.active&&!m.contacts.length}'))
        check('No browser or asset-request errors occurred', not report['pageErrors'] and not report['httpErrors'] and not report['requestFailures'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        raise
    finally:
        browser.close()
        report['identityAfter'] = identity()
        report['distributionIdentityUnchanged'] = report['identityBefore'] == report['identityAfter']
        report['captureSha256'] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in output.glob('*.png')}
        report['scriptSha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
        if not report['distributionIdentityUnchanged']:
            raise AssertionError('Distribution changed during the detector scenario.')
print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'captures': len(report['captures'])}))
