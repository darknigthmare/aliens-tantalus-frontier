"""Production Xeno Trials UI journey in isolated browser storage.
Keyboard/menu actions drive combat. Evaluations are read-only observations.
No injected fighter stats, clock, result, progress or skipped introductions.
"""
import argparse
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
              'Automated isolated local duels, not a campaign walkthrough or physical peripheral test.',
              'One standard duel is abandoned; a second 1 HP duel ends through actual CPU combat.',
              'Image quality and every fighter are not exhaustively reviewed.']}

READ = '() => globalThis.__ATF_XENO_TRIALS_V96__?.snapshot()'

def state(page):
    return page.evaluate(READ)

def check(label, condition, evidence=None):
    assert condition, label
    report['checks'].append({'label': label, 'evidence': evidence})

def screenshot(page, name):
    page.screenshot(path=str(output/name), full_page=True)
    report['captures'].append(name)

def setup_duel(page, rules):
    page.locator('[data-xt-branch="on-demand"]').click()
    page.locator('[data-xt="form"] [name="factionId"]').select_option('pursuit')
    page.locator('[data-xt="form"] [name="opponentId"]').select_option('runner')
    page.locator('[data-xt="form"] [name="requestedRules"]').select_option(rules)
    page.locator('[data-xt="confirm-target"]').click()
    page.locator('[data-xt-fighter="warrior"]').click()
    page.locator('[data-xt="confirm-fighters"]').click()
    page.locator('[data-xt="form"] [name="stageId"]').select_option('containment-deck')
    page.locator('[data-xt="start"]').click()
    page.wait_for_function('''() => {
        const m = globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;
        return m && !m.paused && !m.presentation.blocksSimulation;
    }''', timeout=45000)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']}
                                  if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(15000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    try:
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#nav [data-view="xenotrials"]').click()
        original = state(page)['progress']
        setup_duel(page, 'standard')
        canvas = page.locator('[data-xt="canvas"]')
        check('The real menu creates a saved ticket before the standard duel', state(page)['progress']['pending'] is not None)
        canvas.focus()
        page.keyboard.down('ArrowRight')
        page.wait_for_timeout(80)
        # The legacy help is hidden in full-screen combat. Use the actual
        # visible return button, focus only: do not navigate or alter the UI.
        menu = page.locator('[data-xt="return"]')
        assert menu.is_visible()
        menu.focus()
        page.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.paused')
        frozen = state(page)['match']
        page.wait_for_timeout(250)
        check('Moving keyboard focus to a menu pauses combat and its clock', state(page)['match']['tick'] == frozen['tick'])
        screenshot(page, 'trials-focus-pause.png')
        page.keyboard.down('ArrowRight')
        page.locator('[data-xt="resume-overlay"]').click()
        page.wait_for_timeout(100)
        check('Resume does not replay the held movement key', not state(page)['match']['fighters'][0]['previousInput']['right'])
        page.keyboard.up('ArrowRight')
        guard = page.locator('[data-xeno-action="guard"]')
        guard.focus()
        page.keyboard.down('Space')
        page.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.fighters[0].guard')
        check('Combat buttons remain keyboard accessible', not state(page)['match']['paused'])
        page.keyboard.up('Space')
        canvas.focus()
        page.keyboard.press('KeyP')
        page.locator('[data-xt="abandon-overlay"]').click()
        page.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match === null')
        abandoned = state(page)['progress']
        check('Abandonment clears only the duel ticket without a reward', abandoned['pending'] is None
              and abandoned['credits'] == original['credits'] and abandoned['ledger'][-1]['winner'] == 'abandoned')
        page.locator('[data-xt="return"]').click()
        page.locator('#nav [data-view="xenotrials"]').click()
        setup_duel(page, 'one-hp')
        check('The on-demand 1 HP rule reaches both real fighters', all(f['hp'] == 1 for f in state(page)['match']['fighters']))
        canvas.focus()
        held = False
        deadline = time.monotonic() + 90
        while time.monotonic() < deadline:
            match = state(page)['match']
            if match['phase'] == 'match-over':
                break
            active = match['phase'] == 'active' and not match['presentation']['blocksSimulation'] and not match['paused']
            if active and not held:
                page.keyboard.down('ArrowRight'); held = True
            elif not active and held:
                page.keyboard.up('ArrowRight'); held = False
            page.wait_for_timeout(100)
        page.keyboard.up('ArrowRight')
        final = state(page)
        check('Actual CPU combat finishes the two-round evaluation', final['match']['phase'] == 'match-over', final['match']['result'])
        page.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().progress.pending === null')
        settled = state(page)['progress']
        receipt = settled['ledger'][-1]
        check('The matching terminal result pays exactly its single receipt', len(settled['ledger']) == len(abandoned['ledger']) + 1
              and settled['credits'] == abandoned['credits'] + receipt['credits']
              and receipt['matchId'] == final['match']['result']['matchId'])
        screenshot(page, 'trials-settled-result.png')
        page.wait_for_timeout(600)
        check('The result and reward remain stable on the terminal screen', state(page)['progress'] == settled)
        page.reload(wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#nav [data-view="xenotrials"]').click()
        restored = state(page)
        check('A real reload preserves the reward without resuming or paying the completed duel', restored['progress'] == settled and restored['match'] is None)
        check('No browser exception or missing HTTP resource', not report['pageErrors'] and not report['httpErrors'])
        # Intentional reload can abort in-flight thumbnails; retain them rather than
        # mislabeling browser navigation cancellations as absent game assets.
        failures = [r for r in report['requestFailures'] if r['failure'] != 'net::ERR_ABORTED']
        check('No failed request other than an explicit navigation cancellation', not failures, report['requestFailures'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        try:
            report['failureState'] = state(page)
            screenshot(page, 'failure.png')
        except Exception:
            pass
        raise
    finally:
        (output/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
