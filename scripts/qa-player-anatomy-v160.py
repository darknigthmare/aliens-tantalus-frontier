"""Observe real locomotion cycles and eight aimed poses through native controls.

The imported Forge floor is a disclosed fixture, not a campaign level. Evaluation
only observes the runtime/canvas and stores an independent RAF observer promise.
"""
import argparse
import base64
import hashlib
import json
import math
import os
from pathlib import Path
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--comparison-stage', choices=['before', 'after'], required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep visual evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'],
            'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


report = {'status': 'running', 'stage': args.comparison_stage, 'checks': [], 'captures': [],
          'pageErrors': [], 'httpErrors': [], 'requestFailures': [], 'identityBefore': identity(),
          'method': 'Disclosed Forge floor imported through the native editor; keyboard movement and eight Shift aim directions. Read-only runtime/canvas observations.',
          'limitations': ['Automated Chromium observation, not human QA.',
                         'This floor is a declared test project, not the Tantalus interior.',
                         'Eight phase bins compare the same action and gait phase; wall-clock frames are not forced or injected.',
                         'Geometry and visual comparison do not certify franchise or human-motion1:1.']}


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


OBSERVE = '''() => {
 const e=__ATF_GAME__,a=e.player;
 return {time:e.animationTime,running:e.running,paused:e.paused,
   player:{x:a.x,y:a.y,w:a.w,h:a.h,vx:a.vx,vy:a.vy,facing:a.facing,
     grounded:a.grounded,crouching:a.crouching,aim:a.combatAimV83},
   visual:structuredClone(a.playerAppearanceVisualV126),
   weapon:structuredClone(a.heldWeaponVisualV125),
   camera:{x:e.camera.x,y:e.camera.y}};
}'''


def save_frame(name, frame):
    png = frame.pop('png')
    (output / name).write_bytes(base64.b64decode(png.split(',')[1]))
    report['captures'].append({'file': name, 'state': frame})


def capture(page, name):
    frame = page.evaluate('''() => {const row=(''' + OBSERVE + ''')();
      return {...row,png:document.querySelector('#game-canvas').toDataURL('image/png')};}''')
    save_frame(name, frame)


def cycle(page, direction):
    page.evaluate('''direction => {window.__V160_ANATOMY_OBSERVER__=new Promise((resolve,reject)=>{
      const rows=[],frames={},started=performance.now();let firstTime=null;
      function frame(){const row=(''' + OBSERVE + ''')(),l=row.visual?.locomotion;
        if(row.visual?.drawn&&l?.drawn&&l.mode==='run'&&Math.sign(row.player.vx)===direction){
          firstTime??=row.time;rows.push(row);const bin=Math.floor(l.phase*8)%8;
          if(!frames[bin])frames[bin]={...row,png:document.querySelector('#game-canvas').toDataURL('image/png')};
          if(Object.keys(frames).length===8&&row.time-firstTime>1.25){resolve({rows,frames});return;}}
        if(performance.now()-started>15000){reject(Error('Eight actual gait phases were not observed'));return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''', direction)
    key = 'KeyD' if direction == 1 else 'KeyA'
    page.locator('#game-canvas').focus()
    page.keyboard.down(key)
    try:
        observed = page.evaluate('()=>window.__V160_ANATOMY_OBSERVER__')
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_GAME__.player.vx)<1')
    label = 'right' if direction == 1 else 'left'
    (output / ('cycle-' + label + '.json')).write_text(json.dumps(observed['rows'], indent=2))
    check(label + ': eight phases come from actual floor displacement', len(observed['frames']) == 8
          and len(observed['rows']) > 20
          and abs(observed['rows'][-1]['player']['x'] - observed['rows'][0]['player']['x']) > 100)
    for bin_index, frame in observed['frames'].items():
        save_frame('cycle-' + label + '-' + bin_index + '.png', frame)
    flexions, below_floor = [], []
    for row in observed['rows']:
        locomotion = row['visual']['locomotion']
        floor = row['player']['y'] + row['player']['h']
        for leg in locomotion['legs'].values():
            u = [leg['hip'][axis] - leg['knee'][axis] for axis in ['x', 'y']]
            v = [leg['ankle'][axis] - leg['knee'][axis] for axis in ['x', 'y']]
            lengths = math.hypot(*u) * math.hypot(*v)
            flexions.append(180 - math.degrees(math.acos(max(-1, min(1, sum(a*b for a,b in zip(u,v))/lengths)))))
            below_floor.append(max(leg['toe']['y'], leg['heel']['y']) - floor)
    check(label + ': actual knees remain finite and soles stay above the floor',
          all(math.isfinite(x) for x in flexions) and max(below_floor) < 1)
    report.setdefault('measurements', {})[label] = {'frames': len(observed['rows']),
        'kneeFlexionDegrees': [min(flexions), max(flexions)], 'maximumSoleBelowFloor': max(below_floor)}


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page.set_default_timeout(30000)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    page.on('requestfailed', lambda q: report['requestFailures'].append({'url': q.url, 'failure': q.failure}))
    page.on('response', lambda q: report['httpErrors'].append({'url': q.url, 'status': q.status}) if q.status >= 400 else None)
    page.on('dialog', lambda d: d.accept() if d.type == 'confirm' and 'Remplacer le projet ouvert' in d.message else d.dismiss())
    try:
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-forge').click()
        plan = {'schema': 2, 'kind': 'mission', 'name': 'Sol de comparaison anatomique V160', 'size': [64, 18],
                'tiles': [{'position': str(x)+':16', 'type': 'floor'} for x in range(64)]
                + [{'position': '12:15', 'type': 'spawn'}, {'position': '62:15', 'type': 'objective'}]}
        (output / 'disclosed-forge-floor.json').write_text(json.dumps(plan, indent=2))
        page.locator('#editor-import').set_input_files({'name': 'anatomy-floor.json', 'mimeType': 'application/json', 'buffer': json.dumps(plan).encode()})
        page.wait_for_function("()=>document.querySelector('#editor-import').value===''")
        page.locator('#editor-play').click()
        page.wait_for_function('()=>__ATF_GAME__?.running&&__ATF_GAME__.player?.grounded&&__ATF_GAME__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
        capture(page, 'idle-before-motion.png')
        cycle(page, 1)
        capture(page, 'idle-after-right.png')
        cycle(page, -1)
        capture(page, 'idle-after-left.png')
        page.keyboard.down('ShiftLeft')
        directions = [('right', ['KeyD']), ('up-right', ['KeyW', 'KeyD']), ('up', ['KeyW']),
                      ('up-left', ['KeyW', 'KeyA']), ('left', ['KeyA']), ('down-left', ['KeyS', 'KeyA']),
                      ('down', ['KeyS']), ('down-right', ['KeyS', 'KeyD'])]
        try:
            for name, keys in directions:
                for key in keys:
                    page.keyboard.down(key)
                page.wait_for_timeout(160)
                capture(page, 'aim-' + name + '.png')
                for key in keys:
                    page.keyboard.up(key)
        finally:
            page.keyboard.up('ShiftLeft')
        check('Eight native aim directions keep the operator on its actual floor', all(
            x['state']['player']['grounded'] and abs(x['state']['player']['vx']) < 1
            for x in report['captures'] if x['file'].startswith('aim-')))
        check('No browser or asset request error was observed', not report['pageErrors'] and not report['httpErrors'] and not report['requestFailures'])
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
            raise AssertionError('The served distribution changed during observation.')
print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'captures': len(report['captures'])}))
