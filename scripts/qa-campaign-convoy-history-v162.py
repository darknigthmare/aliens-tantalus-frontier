"""Current-candidate native convoy prelude, then its real saved return in Archives.

The unmodified victorious JSON comes from this run's V161 browser prelude, never
from a manufactured terminal object or a historical delivery. Browser evaluations
only observe. Root controls execution; the two Chromium sessions are sequential.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4187'))
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
prelude_output = output / 'prelude'
prelude_output.mkdir(exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'This candidate first completes the real native V161 convoy browser journey. Its exact victorious save is then imported unchanged through the Save picker. Native return readings, a different actual operation and retreat, independent archived reading and profile reload follow.',
          'dependencies': ['scripts/qa-campaign-convoy-v161.py'],
          'limitations': ['Automated native controls, not human QA or franchise1:1 approval.',
                         'Eight compact convoy records maximum; archive reading never replays operations, rewards or live reading receipts.',
                         'Prelude controls and captures are supplementary and are not added to this profile’s own totals.']}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def prelude_manifest():
    paths = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'package.json',
                    repo / 'scripts/qa-campaign-convoy-v161.py'])
    return {str(path.relative_to(repo)): digest(path) for path in paths}


def manifest():
    paths = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', Path(__file__).resolve(), repo / 'scripts/qa-campaign-convoy-v161.py'])
    return {str(path.relative_to(repo)): digest(path) for path in paths}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def observe(page):
    return page.evaluate('''()=>({save:structuredClone(__ATF_V51__.saveSystem.data),
      running:__ATF_GAME__.running,mission:__ATF_GAME__.mission?.state,
      campaignId:__ATF_GAME__.campaign?.id})''')


def open_view(page, name):
    if page.locator(f'[data-panel="{name}"].active').is_visible():
        return
    if page.locator('#exit-hub').is_visible():
        page.locator('#exit-hub').click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
    if page.locator(f'[data-panel="{name}"].active').is_visible():
        return
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{name}"]').click()


def open_plan(page, campaign=None):
    open_view(page, 'command')
    if campaign is not None:
        selector = page.locator('#command-mission-v110')
        if selector.input_value() != campaign:
            assert selector.is_enabled(), 'A different active operation owns the campaign picker.'
            selector.select_option(campaign)
    page.locator('#operation-launch').wait_for(state='visible')


def capture(page, name, selector='#operation-plan'):
    page.locator(selector).screenshot(path=str(output / name))
    report['captures'].append(name)


def protected(save):
    return json.loads(json.dumps({
        'clock': save['clock'], 'galaxy': save['galaxy'], 'systems': save['hub']['systems'],
        'crew': save['crew'], 'player': save['player'], 'strategy': save['strategy'],
        'statistics': {key: value for key, value in save['statistics'].items() if key != 'playSeconds'},
        'archive': save['convoyReturnHistoryV162']}))


source_start = manifest()
(output / 'profile-source-start.json').write_text(json.dumps(source_start, indent=2))
browser = None
playwright = None
page = None
try:
    print('STEP current candidate native convoy prelude', flush=True)
    with (prelude_output / 'console.log').open('w') as console:
        result = subprocess.run([sys.executable, '-B', str(repo / 'scripts/qa-campaign-convoy-v161.py'),
                                 '--base', args.base, '--output', str(prelude_output)], cwd=repo,
                                stdout=console, stderr=subprocess.STDOUT, timeout=420)
    prelude_path = prelude_output / 'report.json'
    prelude = json.loads(prelude_path.read_text())
    current_prelude_manifest = prelude_manifest()
    start_prelude = json.loads((prelude_output / 'profile-source-start.json').read_text())
    end_prelude = json.loads((prelude_output / 'profile-source-end.json').read_text())
    check('the sequential native prelude passes on this unchanged candidate source tree',
          result.returncode == 0 and prelude['status'] == 'passed' and prelude['sourceUnchanged']
          and not prelude['pageErrors'] and not prelude['requestFailures'] and not prelude['httpErrors']
          and start_prelude == end_prelude == current_prelude_manifest)
    victory = prelude['nativeCourse']['state']['save']
    native_operation = victory['strategy']['lastOperation']
    native_id = native_operation['id']
    check('the imported fixture is the current prelude’s actual completed convoy and native payout',
          native_operation['campaignId'] == 'special-apc-convoy' and native_operation['success'] is True
          and native_operation['resumeState']['mission']['state'] == 'complete'
          and native_operation['resumeState']['specialOperation']['deploymentOperationIdV121'] == native_id)
    raw = json.dumps(victory, ensure_ascii=False, separators=(',', ':')).encode()
    fixture_path = output / 'native-victory-import-unchanged.json'
    fixture_path.write_bytes(raw)
    report['supplements'] = {
        'nativePrelude': {'report': 'prelude/report.json', 'sha256': digest(prelude_path),
                          'sourceStart': 'prelude/profile-source-start.json',
                          'sourceStartSha256': digest(prelude_output / 'profile-source-start.json'),
                          'sourceEnd': 'prelude/profile-source-end.json',
                          'sourceEndSha256': digest(prelude_output / 'profile-source-end.json'),
                          'checks': len(prelude['checks']), 'captures': ['prelude/' + name for name in prelude['captures']],
                          'countsIncludedInArchiveProfile': False},
        'fixture': {'path': fixture_path.name, 'sha256': digest(fixture_path),
                    'sourceJsonPointer': '/nativeCourse/state/save', 'operationId': native_id,
                    'semanticProjectionUnchanged': json.loads(raw) == victory}}
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    page.goto(args.base, wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    page.locator('#save-import').set_input_files({'name': fixture_path.name, 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function('id=>__ATF_V51__?.saveSystem.data.strategy.lastOperation?.id===id', arg=native_id)
    open_plan(page, 'special-apc-convoy')
    check('the real convoy return is archived without another payment during native Save import',
          observe(page)['save']['galaxy']['resources'] == victory['galaxy']['resources']
          and observe(page)['save']['convoyReturnHistoryV162']['entries'][0]['operationId'] == native_id)
    for topic in ['vehicle', 'route', 'return']:
        page.locator(f'[data-convoy-story-topic="{topic}"]').click()
    after_reading = observe(page)['save']
    archived = after_reading['convoyReturnHistoryV162']['entries'][0]
    check('all three actual return readings update the same bounded archive receipt',
          archived['operationId'] == native_id and archived['readTopics'] == ['vehicle', 'route', 'return']
          and archived['activeTopic'] == 'return' and archived['summary']['returnConfirmed'] is True)
    capture(page, '01-live-return-and-history.png')
    expected_archive = json.loads(json.dumps(after_reading['convoyReturnHistoryV162']))
    open_plan(page, 'special-c12-horde')
    page.locator('#operation-launch').click()
    page.wait_for_function('()=>__ATF_GAME__.running&&__ATF_GAME__.isC12HordeV121?.()')
    second_operation = observe(page)['save']['strategy']['currentOperation']['id']
    check('a different native operation starts without altering the convoy archive',
          second_operation != native_id and observe(page)['save']['convoyReturnHistoryV162'] == expected_archive)
    page.locator('#retreat-mission').click()
    open_plan(page)
    after_other = observe(page)['save']
    check('the other operation really replaces lastOperation while the convoy facts and readings survive',
          after_other['strategy']['lastOperation']['id'] == second_operation
          and after_other['strategy']['lastOperation']['campaignId'] == 'special-c12-horde'
          and after_other['strategy']['lastOperation']['success'] is False
          and after_other['convoyReturnHistoryV162'] == expected_archive
          and page.locator('[data-convoy-story-return]').count() == 0)
    card = page.locator(f'[data-convoy-history-entry="{native_id}"]')
    card.locator('summary').click()
    capture(page, '02-history-after-other-operation.png')
    protected_before = protected(observe(page)['save'])
    for index, topic in enumerate(['vehicle', 'route', 'return', 'return']):
        card.locator(f'[data-convoy-history-topic="{topic}"]').click()
        focused = page.evaluate('(topic)=>document.activeElement?.dataset.convoyHistoryTopic===topic', topic)
        check('archived reading is local and preserves the profile exactly: ' + str(index) + ' / ' + topic,
              card.locator(f'[data-convoy-history-answer="{topic}"]').count() == 1
              and focused and protected(observe(page)['save']) == protected_before)
    check('the original three reading receipts remain visible without replaying an active return',
          '3/3' in card.locator('summary').inner_text()
          and observe(page)['save']['strategy']['currentOperation'] is None)
    capture(page, '03-archive-read-only-questions.png')
    page.set_viewport_size({'width': 390, 'height': 844})
    # Open through the actual details summary at the new viewport. Archive
    # navigation remains local even when CSS changes its question layout.
    if card.get_attribute('open') is not None:
        card.locator('summary').click()
    card.locator('summary').click()
    mobile_topics = []
    for topic in ['vehicle', 'route', 'return']:
        card.locator(f'[data-convoy-history-topic="{topic}"]').click()
        visible = card.locator(f'[data-convoy-history-answer="{topic}"]').is_visible()
        mobile_topics.append({'topic': topic, 'visible': visible})
        check('390px native archive question remains readable: ' + topic, visible)
    mobile_geometry = page.evaluate('''id=>{
      const section=document.querySelector('[data-convoy-return-history]');
      const card=[...section.querySelectorAll('[data-convoy-history-entry]')]
        .find(node=>node.dataset.convoyHistoryEntry===id);
      const bounds=node=>{const r=node.getBoundingClientRect();return {
        left:r.left,right:r.right,width:r.width,height:r.height,
        clientWidth:node.clientWidth,scrollWidth:node.scrollWidth};};
      return {viewportWidth:innerWidth,documentClientWidth:document.documentElement.clientWidth,
        documentScrollWidth:document.documentElement.scrollWidth,open:card.open,
        section:bounds(section),card:bounds(card),
        questions:[...card.querySelectorAll('[data-convoy-history-topic]')].map(node=>({
          topic:node.dataset.convoyHistoryTopic,...bounds(node)}))};}''', native_id)
    report['mobileArchive'] = {'geometry': mobile_geometry, 'questions': mobile_topics}
    check('390px archive fits horizontally with three native targets at least44px high',
          mobile_geometry['viewportWidth'] == 390 and mobile_geometry['open']
          and mobile_geometry['documentScrollWidth'] <= mobile_geometry['documentClientWidth']
          and all(mobile_geometry[key]['scrollWidth'] <= mobile_geometry[key]['clientWidth']
                  and mobile_geometry[key]['left'] >= 0
                  and mobile_geometry[key]['right'] <= mobile_geometry['documentClientWidth']
                  for key in ['section', 'card'])
          and len(mobile_geometry['questions']) == 3
          and all(button['height'] >= 44 and button['width'] > 0
                  and button['left'] >= 0 and button['right'] <= mobile_geometry['documentClientWidth']
                  for button in mobile_geometry['questions']))
    page.locator('[data-convoy-return-history]').scroll_into_view_if_needed()
    page.wait_for_function('()=>!document.querySelector("#toast-region")?.children.length', timeout=8000)
    page.screenshot(path=str(output / '04-archive-mobile-390.png'))
    report['captures'].append('04-archive-mobile-390.png')
    check('mobile viewport and archive reading preserve the entire protected profile and economy',
          protected(observe(page)['save']) == protected_before)
    page.set_viewport_size({'width': 1600, 'height': 1000})
    before_reload = observe(page)['save']
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-continue').click()
    open_plan(page)
    reloaded = observe(page)['save']
    check('profile reload keeps the former convoy and the newer operation without awarding or restoring either mission',
          reloaded['convoyReturnHistoryV162'] == expected_archive
          and reloaded['strategy']['lastOperation']['id'] == second_operation
          and reloaded['strategy']['currentOperation'] is None
          and reloaded['galaxy']['resources'] == before_reload['galaxy']['resources'])
    card = page.locator(f'[data-convoy-history-entry="{native_id}"]')
    card.locator('summary').click()
    capture(page, '05-history-after-profile-reload.png')
    report['nativeOperationIds'] = {'convoy': native_id, 'laterOperation': second_operation}
    report['archiveBeforeLaterOperation'] = expected_archive
    report['archiveAfterReload'] = reloaded['convoyReturnHistoryV162']
    report['status'] = 'passed'
except Exception as error:
    report['status'] = 'failed'
    report['error'] = str(error)
    if page:
        try:
            report['failureState'] = observe(page)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception:
            pass
    raise
finally:
    if browser:
        browser.close()
    if playwright:
        playwright.stop()
    source_end = manifest()
    report['sourceUnchanged'] = source_start == source_end
    report['sourceStartSha256'] = hashlib.sha256(json.dumps(source_start, sort_keys=True).encode()).hexdigest()
    if not report['sourceUnchanged'] or report['pageErrors'] or report['requestFailures'] or report['httpErrors']:
        report['status'] = 'failed'
    (output / 'profile-source-end.json').write_text(json.dumps(source_end, indent=2))
    (output / 'report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'captures': len(report['captures']),
                      'report': str(output / 'report.json')}), flush=True)
    if report['status'] != 'passed':
        raise SystemExit(1)
