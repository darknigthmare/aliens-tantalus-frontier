"""Nine native Xeno Trials opponents through the real menus and CPU combat.
Only UI input drives state. No fighter, clock, result or saved progress is injected.
Frame captures are read-only observations, not new authored animation assets.
"""
import argparse
import base64
import json
import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
output = args.output.resolve()
repo = Path(__file__).resolve().parents[1]
if output == repo or repo in output.parents:
    raise SystemExit('QA output must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'base': args.base, 'checks': [], 'captures': [], 'pageErrors': [],
          'requestFailures': [], 'httpErrors': [], 'limitations': [
              'Nine CPU opponents in isolated fresh profiles, not 189 finished movesets.',
              'Existing admitted static character images; no new character animation or 1:1 certification.',
              'The nine pilots use existing arenas. Six arena functions have separate unit tests; Burster death splash is checked separately in boundary tests.',
              'No physical phone/gamepad, cloud account or hosted deployment review.']}
pilots = [
    ('drive-v123-fte-pathogen-brute-profile-v13', 'pathogen', 'pathogen-brute-ground-impact', 'ground-wave', 'containment-deck'),
    ('drive-v123-fte-pathogen-queen-right-v13', 'pathogen', 'pathogen-queen-acid-cluster', 'acid-cluster', 'hive-vault'),
    ('import-game-afe2-warden', 'xenomorph', 'afe2-warden-acid', 'aimed-acid', 'reactor-ring'),
    ('import-game-afe2-exploder', 'xenomorph', 'afe2-exploder-detonation', 'detonation', 'tantalus-cargo'),
    ('import-game-afe2-harbinger', 'pathogen', 'afe2-harbinger-leap', 'leap', 'planet-surface'),
    ('prowler', 'xenomorph', 'fte-prowler-ambush-leap', 'leap', 'tantalus-cargo'),
    ('drive-v123-afe-runner', 'xenomorph', 'fte-runner-tail-sweep', 'tail-sweep', 'hive-vault'),
    ('drive-v123-afe-spitter', 'xenomorph', 'fte-spitter-aimed-acid', 'aimed-acid', 'reactor-ring'),
    ('burster', 'xenomorph', 'fte-burster-close-assault', 'ram', 'containment-deck'),
]
READ = '() => globalThis.__ATF_XENO_TRIALS_V96__?.snapshot()'

def check(label, condition, evidence=None):
    assert condition, label
    report['checks'].append({'label': label, 'evidence': evidence})

def frame(page):
    return page.evaluate('''() => ({state: globalThis.__ATF_XENO_TRIALS_V96__?.snapshot(),
      png: document.querySelector('[data-xt="canvas"]').toDataURL('image/png')})''')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']}
                                  if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    page = None
    try:
        for fighter, family, signature, style, stage in pilots:
            # Fresh contexts prevent the previous duel's credits, unlocks or inputs
            # influencing a pilot. They never touch the user's normal browser.
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(15000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda r: report['requestFailures'].append({'url': r.url, 'failure': r.failure}))
            page.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#nav [data-view="xenotrials"]').click()
            original = page.evaluate(READ)['progress']
            page.locator('[data-xt-branch="on-demand"]').click()
            form = page.locator('[data-xt="form"]')
            form.locator('[name="opponentFamily"]').select_option(family)
            form.locator('[name="opponentId"]').select_option(fighter)
            form.locator('[name="requestedRules"]').select_option('standard')
            page.locator('[data-xt="confirm-target"]').click()
            page.locator('[data-xt-fighter="warrior"]').click()
            form.locator('[name="difficulty"]').select_option('hard')
            page.locator('[data-xt="confirm-fighters"]').click()
            form.locator('[name="stageId"]').select_option(stage)
            page.locator('[data-xt="start"]').click()
            page.wait_for_function('''() => {
              const m=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;
              return m && !m.paused && !m.presentation.blocksSimulation;
            }''', timeout=45000)
            canvas = page.locator('[data-xt="canvas"]')
            canvas.focus()
            start = page.evaluate(READ)['match']
            entry = start['combatSignaturesV147'][1]
            check(f'{fighter}: exact menu selection reaches the admitted pilot', entry['id'] == signature
                  and not entry['canonExact'] and start['fighters'][1]['id'] == fighter)
            emitted = None
            deadline = time.monotonic() + 45
            while time.monotonic() < deadline:
                current = frame(page)
                m = current['state']['match']
                cpu = m['fighters'][1]
                shots = [b for b in m['projectiles'] if b.get('signatureIdV147') == signature]
                observed = bool(shots) if style in ('ground-wave', 'acid-cluster', 'aimed-acid') else (
                    any(e['type'] == 'xeno-detonation' and e.get('side') == 'opponent' for e in m['events'])
                    if style == 'detonation' else cpu['y'] > 0 and (cpu.get('attack') or {}).get('kind') == 'special')
                if style in ('ram', 'tail-sweep'):
                    attack = cpu.get('attack') or {}
                    observed = attack.get('kind') == 'special' and attack.get('hit') is True
                if observed:
                    emitted = current
                    break
                # The native runtime advances between rounds. Do not race its
                # automatic transition with a queued next-round button click.
                if m['phase'] == 'match-over':
                    break
                page.wait_for_timeout(30)
            check(f'{fighter}: CPU physically executes its signature', emitted is not None)
            state = emitted['state']['match']
            check(f'{fighter}: actual signature acceptance is recorded', any(
                e.get('signatureIdV147') == signature and e['type'] == 'attack' for e in state['events']))
            name = f'{signature}.png'
            (output/name).write_bytes(base64.b64decode(emitted['png'].split(',', 1)[1]))
            report['captures'].append({'file': name, 'state': state, 'method': 'Live read-only canvas and simulation observation'})
            # V152: actual Queen projectile residue, not a spawned test hazard.
            if signature == 'pathogen-queen-acid-cluster':
                page.wait_for_function("""() => {
                  const m=globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match;
                  return (m.acidPoolsV152 || []).some(p=>m.tick>=p.armedTick && m.tick<p.expiresTick);
                }""", timeout=20000)
                page.wait_for_function("""() => {
                  const m=globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match;
                  return m.events.some(e=>e.type==='acid-contact-v152' && e.side==='player');
                }""", timeout=20000)
                residue = frame(page)
                m = residue['state']['match']
                check('Queen residue reaches the floor and damages through the native simulation',
                      bool(m.get('acidPoolsV152')) and m['fighters'][1]['stats'].get('acidTicksV152', 0) > 0)
                name = 'queen-persistent-acid-v152.png'
                (output/name).write_bytes(base64.b64decode(residue['png'].split(',', 1)[1]))
                report['captures'].append({'file': name, 'state': m, 'method': 'Actual CPU projectile, falling residue and damaging floor pool; no injected state'})
            # V148 observes a naturally earned CPU super. The player remains
            # idle: no meter, clock, HP, outcome or save values are assigned.
            if fighter == 'import-game-afe2-warden':
                check('Warrior has no invented super button', page.locator('[data-xeno-action="super"]').is_hidden())
                check('Warden has a native HTML meter', page.locator('[data-xt="opponent-super"]').is_visible())
                super_frame = None
                deadline = time.monotonic() + 80
                while time.monotonic() < deadline:
                    current = frame(page)
                    m = current['state']['match']
                    if any(b.get('superIdV148') == 'warden-acid-barrage' for b in m['projectiles']):
                        super_frame = current
                        break
                    if m['phase'] == 'match-over':
                        break
                    page.wait_for_timeout(30)
                check('Warden earns and physically emits its original versus super', super_frame is not None)
                m = super_frame['state']['match']
                cpu = m['fighters'][1]
                check('A real super consumes its earned meter and records one acceptance',
                      cpu['superMeterV148'] == 0 and cpu['stats'].get('supersV148', 0) == 1
                      and cpu['stats']['damage'] > 0
                      and any(e.get('superIdV148') == 'warden-acid-barrage' for e in m['events']))
                name = 'warden-earned-super-v148.png'
                (output/name).write_bytes(base64.b64decode(super_frame['png'].split(',', 1)[1]))
                report['captures'].append({'file': name, 'state': m, 'method': 'Real idle-player duel: CPU earned meter; no injected state'})
                # The HTML observer is throttled independently from physics.
                # Wait for its actual value, without changing the meter or using
                # screenshot CSS to manufacture a non-empty progress bar.
                page.wait_for_function("""document.querySelector('[data-xt=\"opponent-super\"]').value === 0""")
                meter_reading = page.locator('[data-xt="opponent-super"]').evaluate('(element) => ({max:element.max,value:element.value})')
                check('The visible opponent meter reflects the spent resource', meter_reading == {'max': 100, 'value': 0}, meter_reading)
                # Real page resizing, no DOM/layout edits. These are browser
                # viewports, not claims of physical phone/gamepad validation.
                for width, height in [(1440, 1000), (390, 844), (844, 390)]:
                    page.set_viewport_size({'width': width, 'height': height})
                    bar = page.locator('[data-xt="opponent-super"]')
                    bar.wait_for(state='visible')
                    geometry = bar.evaluate("""e => {
                      const r=e.getBoundingClientRect(), parent=e.closest('.xt-match-hud').getBoundingClientRect();
                      return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right,
                        hudBottom:parent.bottom, hidden:e.hidden, max:e.max, value:e.value};
                    }""")
                    check(f'Super meter has real visible area at {width}x{height}',
                          not geometry['hidden'] and geometry['width'] > 0 and geometry['height'] >= 5
                          and geometry['x'] >= 0 and geometry['right'] <= width + 1
                          and geometry['bottom'] <= min(height, geometry['hudBottom']) + 1, geometry)
                    if width == 1440:
                        name='warden-super-hud-v149.png'
                        page.screenshot(path=str(output/name))
                        report['captures'].append({'file':name, 'method':'Unmodified live page screenshot including native HUD',
                                                   'state':page.evaluate(READ)['match']})
                page.set_viewport_size({'width':1440,'height':1000})
            # Pause still works after an emitted projectile or between rounds.
            live = page.evaluate(READ)['match']
            if live['phase'] != 'match-over':
                canvas.focus()
                page.keyboard.press('KeyP')
                page.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.paused')
                frozen = page.evaluate(READ)['match']
                page.wait_for_timeout(180)
                still = page.evaluate(READ)['match']
                check(f'{fighter}: pause freezes physical effects and background motion', frozen['tick'] == still['tick']
                      and frozen['projectiles'] == still['projectiles']
                      and frozen.get('acidPoolsV152') == still.get('acidPoolsV152')
                      and frozen.get('acidDropsV152') == still.get('acidDropsV152')
                      and frozen['stageAnimationV147'] == still['stageAnimationV147']
                      and frozen['stageCueV149'] == still['stageCueV149'])
                page.emulate_media(reduced_motion='reduce')
                reduced = page.evaluate(READ)['match']['stageAnimationV147']
                check(f'{fighter}: reduced motion uses a static background', reduced['time'] == 0)
                page.locator('[data-xt="abandon-overlay"]').click()
                page.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match === null')
                result = page.evaluate(READ)['progress']
                check(f'{fighter}: abandonment does not pay a reward', result['pending'] is None
                      and result['credits'] == original['credits'])
            else:
                check(f'{fighter}: terminal scene has no surviving projectiles', not live['projectiles'])
            context.close()
            page = None
        check('No browser exception or missing HTTP response', not report['pageErrors'] and not report['httpErrors'])
        failures = [r for r in report['requestFailures'] if r['failure'] != 'net::ERR_ABORTED']
        check('No failed requests other than context-close cancellations', not failures, report['requestFailures'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        if page is not None:
            try:
                report['failureState'] = page.evaluate(READ)
                report['failureMeters'] = page.locator('.xt-match-hud progress').evaluate_all(
                    """els=>els.map(e=>({id:e.dataset.xt,hidden:e.hidden,rect:e.getBoundingClientRect().toJSON(),
                      display:getComputedStyle(e).display,height:getComputedStyle(e).height,value:e.value}))""")
                page.screenshot(path=str(output/'failure.png'), full_page=True)
            except Exception:
                pass
        raise
    finally:
        (output/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
