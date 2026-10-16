"""Real two-tab profile recovery through the production UI, in isolated storage.
Read-only evaluations observe state; save fixtures enter via the native file input.
This tests sequential stale writers, not atomic simultaneous localStorage commits.
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
output = args.output.resolve()
repo = Path(__file__).resolve().parents[1]
if output == repo or repo in output.parents:
    raise SystemExit('QA output must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'base': args.base, 'checks': [], 'captures': [], 'pageErrors': [],
          'limitations': ['Isolated local profiles, not real cloud accounts.',
                          'Sequential cross-tab edits, not an atomic simultaneous-write guarantee.']}

def check(label, condition):
    assert condition, label
    report['checks'].append(label)

def state(page):
    return page.evaluate('''() => {
      const {saveSystem:s,engine:e,hubEngine:h,bioforgeRuntimeV80:b}=globalThis.__ATF_V51__;
      return {name:s.data.player.name,profile:s.profile,recovery:s.recoveryNeeded,
        raw:localStorage.getItem(s.key()), mission:e.running,hub:h.running,
        panel:document.querySelector('.view.active')?.dataset.panel,
        forge:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('atf-frontier-forge'))
          .map(k=>[k,localStorage.getItem(k)]))};
    }''')

def settings(page):
    page.goto(args.base, wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    page.locator('[data-panel="settings"].active').wait_for()

def import_save(page, payload):
    page.locator('#save-import').set_input_files({'name':'isolated-qa-profile.json',
        'mimeType':'application/json','buffer':json.dumps(payload).encode()})
    page.wait_for_function("document.querySelector('#save-import').value === ''")

def export_json(page, selector):
    with page.expect_download() as info:
        page.locator(selector).click()
    download = info.value
    data = json.loads(Path(download.path()).read_text())
    download.delete()
    return data

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({'executable_path':os.environ['ATF_CHROMIUM_EXECUTABLE']}
                                    if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    context = browser.new_context(viewport={'width':1440,'height':1000}, service_workers='block')
    pages = []
    try:
        first = context.new_page(); pages.append(first)
        first.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
        settings(first)
        release = first.request.get(args.base.rstrip('/') + '/build-info.json').json()
        badge = first.locator('#runtime-version-v143')
        check('Visible runtime badge, title and HTML metadata identify the actual built release',
              badge.inner_text() == 'v' + release['version']
              and badge.get_attribute('title') == release['buildId']
              and first.locator('meta[name="atf-release"]').get_attribute('content') == release['buildId']
              and release['buildId'] in first.locator('.title-build').inner_text())
        fixture = {'schema':52,'player':{'name':'Session Alpha'},'statistics':{'kills':3},
                   'settings':{'reducedMotion':True},'needsPlayerCreationV84':False}
        import_save(first, fixture)
        first.wait_for_function("globalThis.__ATF_V51__.saveSystem.data.player.name === 'Session Alpha'")
        second = context.new_page(); pages.append(second)
        second.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
        settings(second)
        check('Second tab loads the same saved profile through normal startup', state(second)['name']=='Session Alpha')
        forge_before = state(second)['forge']
        second.locator('#nav [data-view="hub"]').click()
        second.wait_for_function('globalThis.__ATF_HUB__.running')
        second.locator('#hub-canvas').focus()
        second.keyboard.down('KeyD'); second.wait_for_timeout(120); second.keyboard.up('KeyD')
        fixture['player']['name']='Session Bravo'; fixture['statistics']['kills']=9
        import_save(first, fixture)
        second.wait_for_function("globalThis.__ATF_V51__.saveSystem.recoveryNeeded?.status === 'conflict'")
        second.locator('#save-session-export-v144').wait_for(state='visible')
        current = state(second)
        check('External replacement stops the live hub and opens recovery without auto-loading',
              current['panel']=='settings' and not current['hub'] and not current['mission'] and current['name']=='Session Alpha')
        check('Newer disk save is preserved', json.loads(current['raw'])['player']['name']=='Session Bravo')
        check('Autosave controls are disabled while recovery is pending', second.locator('#quick-save').is_disabled())
        local = export_json(second, '#save-session-export-v144')
        disk = export_json(second, '#save-export')
        check('Separate exports retain both timelines', local['player']['name']=='Session Alpha' and disk['player']['name']=='Session Bravo')
        check('Forge projects remain byte-identical', state(second)['forge']==forge_before)
        second.screenshot(path=str(output/'two-tab-recovery.png'), full_page=True)
        report['captures'].append('two-tab-recovery.png')
        second.locator('[data-profile="1"]').click()
        second.wait_for_function('!globalThis.__ATF_V51__.saveSystem.recoveryNeeded')
        check('Explicit reload adopts the current profile and clears recovery', state(second)['name']=='Session Bravo')
        check('Session-copy control disappears after successful reload', second.locator('#save-session-export-v144').is_hidden())
        before = state(second)['raw']
        import_save(second, {'schema':999,'player':{'name':'Future save'}})
        second.get_by_text('Cette sauvegarde nécessite une version plus récente du jeu. Le fichier original et la partie active sont conservés.', exact=True).last.wait_for()
        check('Future-format native file import cannot replace the profile', state(second)['raw']==before and state(second)['name']=='Session Bravo')
        second.locator('#save-import').set_input_files({'name':'oversize.json','mimeType':'application/json',
                                                       'buffer':b' '*(16*1024*1024+1)})
        second.get_by_text('Fichier trop volumineux (16 Mio maximum). La partie active est conservée.', exact=True).last.wait_for()
        check('Oversized native file input is rejected without altering the slot', state(second)['raw']==before)
        second.screenshot(path=str(output/'recovered-profile.png'), full_page=True)
        report['captures'].append('recovered-profile.png')
        check('No browser exception during the profile journey', not report['pageErrors'])
        report['status']='passed'
    except Exception as error:
        report['status']='failed'; report['error']=str(error)
        for index,page in enumerate(pages):
            try:
                page.screenshot(path=str(output/f'failure-{index}.png'), full_page=True)
                report[f'state-{index}']=state(page)
            except Exception:
                pass
        raise
    finally:
        (output/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        context.close(); browser.close()
