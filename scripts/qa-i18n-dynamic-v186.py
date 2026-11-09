"""Chromium checks: isolated DOM fixtures with production i18n modules, then
the real title/System UI. No gameplay state is injected; this is not a mission
walkthrough or a linguistic review of the entire catalogue.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--auto-module', default='/src/i18n-auto-v185.js',
                    help='Override only for a disclosed before/after fixture comparison')
parser.add_argument('--fixtures-only', action='store_true')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep browser evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {
    'status': 'running', 'checks': [], 'pageErrors': [], 'captures': [],
    'sourceCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip(),
    'autoModule': args.auto_module,
    'sourceSha256': {p: hashlib.sha256((repo / p).read_bytes()).hexdigest() for p in
                     ['src/i18n-v185.js', 'src/i18n-auto-v185.js', 'src/i18n-en-catalog-v185.js',
                      'scripts/qa-i18n-dynamic-v186.py']},
    'scope': 'Native Chromium MutationObserver on synthetic DOM fixtures; real title/System language selector and reload.',
    'limits': ['No full first-hour/mission walkthrough, mobile, screen reader or native-English editorial review.',
               'DOM fixtures deliberately mutate displayed text/attributes; no campaign/save fixtures or gameplay injection.'],
}


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


try:
    with urlopen(args.base.rstrip('/') + args.auto_module) as response:
        report['servedAutoModuleSha256'] = hashlib.sha256(response.read()).hexdigest()
    report['servedSourceSha256'] = {}
    for source in ['src/i18n-v185.js', 'src/i18n-en-catalog-v185.js']:
        with urlopen(args.base.rstrip('/') + '/' + source) as response:
            report['servedSourceSha256'][source] = hashlib.sha256(response.read()).hexdigest()
    check('served dictionaries match the recorded source bytes', all(
        digest == report['sourceSha256'][source] for source, digest in report['servedSourceSha256'].items()))
    if args.auto_module == '/src/i18n-auto-v185.js':
        check('served automatic layer matches the recorded source bytes',
              report['servedAutoModuleSha256'] == report['sourceSha256']['src/i18n-auto-v185.js'])
    with sync_playwright() as p:
        launch = {'headless': True}
        executable = os.environ.get('ATF_CHROMIUM_EXECUTABLE')
        if executable:
            launch['executable_path'] = executable
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
        page = context.new_page()
        page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
        fixture_url = args.base.rstrip('/') + '/__i18n_fixture_v186__'
        page.route(fixture_url, lambda route: route.fulfill(
            content_type='text/html', body='<!doctype html><html lang="fr"><title>I18n DOM fixture</title><body>'
            '<p id="label">ACQUIS</p><input id="field" title="ACQUIS"></body></html>'))
        page.goto(fixture_url)
        page.evaluate('''async modulePath => {
          window.lang = await import('/src/i18n-v185.js');
          const layer = await import(modulePath);
          await layer.loadCatalogV185();
          layer.installAutoTranslationV185();
          window.switchLanguage = code => lang.setLanguageV185(code, {persist:false});
          window.settle = () => new Promise(resolve => setTimeout(resolve, 0));
          window.resetFixture = async () => {
            switchLanguage('fr'); await settle();
            document.querySelector('#label').textContent = 'ACQUIS';
            document.querySelector('#field').setAttribute('title', 'ACQUIS');
            switchLanguage('en'); await settle();
          };
          await resetFixture();
        }''', args.auto_module)
        check('known fixture text and attribute translate in Chromium',
              page.locator('#label').inner_text() == 'OWNED' and page.locator('#field').get_attribute('title') == 'OWNED')
        page.evaluate('''async () => {
          document.querySelector('#label').textContent='Note de relève personnalisée Ω';
          document.querySelector('#field').setAttribute('title','Note de relève personnalisée Ω');
          await settle(); switchLanguage('fr'); await settle();
        }''')
        check('unknown dynamic text and attribute survive return to French',
              page.locator('#label').inner_text() == 'Note de relève personnalisée Ω'
              and page.locator('#field').get_attribute('title') == 'Note de relève personnalisée Ω')
        page.evaluate('''async () => {
          await resetFixture();
          document.querySelector('#label').textContent='ACTIF';
          document.querySelector('#field').setAttribute('title','ACTIF');
          await settle();
        }''')
        check('new known French values receive their current English translation',
              page.locator('#label').inner_text() == 'ACTIVE' and page.locator('#field').get_attribute('title') == 'ACTIVE')
        page.evaluate("async () => { switchLanguage('fr'); await settle(); }")
        check('French restores the latest source rather than the initial source',
              page.locator('#label').inner_text() == 'ACTIF' and page.locator('#field').get_attribute('title') == 'ACTIF')
        page.evaluate('''async () => {
          await resetFixture();
          document.querySelector('#label').textContent='';
          document.querySelector('#field').removeAttribute('title');
          await settle(); switchLanguage('fr'); await settle();
        }''')
        check('cleared text and removed attribute stay absent after switching',
              page.locator('#label').inner_text() == '' and page.locator('#field').get_attribute('title') is None)
        page.evaluate('''async () => {
          await resetFixture();
          document.querySelector('#label').textContent='Immediate replacement';
          document.querySelector('#field').setAttribute('title','Immediate replacement');
          switchLanguage('fr'); await settle();
        }''')
        check('same-task source replacement survives a switch before observer delivery',
              page.locator('#label').inner_text() == 'Immediate replacement'
              and page.locator('#field').get_attribute('title') == 'Immediate replacement')
        page.evaluate('''async () => {
          switchLanguage('fr'); await settle();
          const label=document.querySelector('#label');
          label.dataset.i18n='settings.heading'; label.textContent='Système';
          switchLanguage('en'); await settle();
        }''')
        check('explicit dictionary remains authoritative in English', page.locator('#label').inner_text() == 'System')
        page.evaluate("async () => { switchLanguage('fr'); await settle(); }")
        check('explicit dictionary remains authoritative in French', page.locator('#label').inner_text() == 'Système')
        page.evaluate('''async () => {
          document.body.setAttribute('title','ACQUIS');
          switchLanguage('en'); await settle();
        }''')
        check('root element attribute translates', page.locator('body').get_attribute('title') == 'OWNED')
        page.evaluate("async () => { switchLanguage('fr'); await settle(); }")
        check('root element attribute restores', page.locator('body').get_attribute('title') == 'ACQUIS')
        page.close()

        if not args.fixtures_only:
            page = context.new_page()
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('[data-panel="settings"].active').wait_for()
            selector = page.locator('#language-select-v185')
            selector.select_option('en')
            page.wait_for_function("document.documentElement.lang === 'en' && document.querySelector('[data-i18n=\"settings.heading\"]').textContent === 'System'")
            check('real System UI selects English and updates document language', selector.input_value() == 'en')
            page.wait_for_function("document.querySelector('#cloud-profiles-v119 h3')?.textContent === 'FRONTIER LINK · PROFILES'")
            check('observed cloud profile heading is translated',
                  page.locator('#cloud-profiles-v119 h3').inner_text() == 'FRONTIER LINK · PROFILES')
            profile_text = page.locator('#profile-list').inner_text()
            cloud_text = page.locator('#cloud-profiles-v119').inner_text()
            check('all three visible profile slots have English labels and preserve status',
                  all('PROFILE ' + str(slot) in profile_text and 'PROFILE ' + str(slot) in cloud_text for slot in [1, 2, 3])
                  and 'ACTIVE' in profile_text and 'ACTIF' not in profile_text)
            page.screenshot(path=str(output / 'system-en.png'), full_page=True)
            report['captures'].append('system-en.png')
            page.reload(wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('[data-panel="settings"].active').wait_for()
            page.wait_for_function("document.documentElement.lang === 'en'")
            check('English device preference persists through a real reload', page.locator('#language-select-v185').input_value() == 'en')
            page.locator('#language-select-v185').select_option('fr')
            page.wait_for_function("document.documentElement.lang === 'fr' && document.querySelector('[data-i18n=\"settings.heading\"]').textContent === 'Système'")
            check('real System UI returns to French', page.locator('#language-select-v185').input_value() == 'fr')
            page.wait_for_function("document.querySelector('#cloud-profiles-v119 h3')?.textContent === 'LIAISON FRONTIER · PROFILS'")
            check('profile labels and heading return to their original French',
                  all('PROFIL ' + str(slot) in page.locator('#profile-list').inner_text() for slot in [1, 2, 3]))
            page.screenshot(path=str(output / 'system-fr.png'), full_page=True)
            report['captures'].append('system-fr.png')
        check('no JavaScript page errors', not report['pageErrors'])
        browser.close()
    report['status'] = 'passed'
except Exception as error:
    report['status'] = 'failed'
    report['error'] = str(error)
    raise
finally:
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
