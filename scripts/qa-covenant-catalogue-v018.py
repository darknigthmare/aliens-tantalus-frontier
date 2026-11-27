#!/usr/bin/env python3
"""Inspect the V018 source catalogue; this does not claim a gameplay walkthrough."""
from pathlib import Path
import argparse
import hashlib
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--browser', required=True)
args = parser.parse_args()
qa = ROOT / 'docs/covenant/qa/v018'
qa.mkdir(parents=True, exist_ok=True)
manifest = json.loads((ROOT / 'assets/openai/sprites/alien-covenant-v018/manifest.json').read_text())
expected = manifest['assets'] + manifest['documentaryCandidates']
errors = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser, headless=True,
                                args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 1365, 'height': 1000}, device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto((ROOT / 'docs/covenant/BIBLE_COVENANT_V018.html').as_uri(), wait_until='load')
    images = page.locator('img[data-asset]').evaluate_all('(nodes) => nodes.map(i => ({id:i.dataset.asset,complete:i.complete,width:i.naturalWidth,height:i.naturalHeight,shown:i.getBoundingClientRect().width>0}))')
    assert len(images) == 2
    for actual, row in zip(images, expected):
        assert actual == {'id':row['id'], 'complete':True, 'width':row['width'], 'height':row['height'], 'shown':True}
    backgrounds = []
    for name in ['light', 'dark', 'checker']:
        page.locator(f'button[data-bg="{name}"]').click()
        assert page.locator('body').get_attribute('data-bg') == name
        assert page.locator('button[aria-pressed="true"]').count() == 1
        backgrounds.append(name)
    page.screenshot(path=str(qa / 'catalogue-desktop.png'), full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.wait_for_timeout(100)
    overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
    assert not overflow
    assert page.locator('img[data-asset]').count() == 2
    assert not errors
    version = browser.version
    browser.close()
receipt = {'schemaVersion':1, 'ok':True, 'scope':'source-catalogue-only',
           'browserEngine':'Chromium', 'browserVersion':version, 'images':images,
           'backgroundsChecked':backgrounds, 'desktopViewport':[1365,1000],
           'mobileViewport':[390,844], 'mobileHorizontalOverflow':overflow,
           'pageErrors':errors, 'gameplayWalkthroughRun':False,
           'screenshot':{'path':'docs/covenant/qa/v018/catalogue-desktop.png',
                         'sha256':hashlib.sha256((qa / 'catalogue-desktop.png').read_bytes()).hexdigest()},
           'nativeImageHashes':{row['id']:row['sha256'] for row in expected}}
(qa / 'browser.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'ok':True, 'images':len(images), 'backgrounds':len(backgrounds),
                  'mobileHorizontalOverflow':overflow, 'pageErrors':len(errors), 'gameplayWalkthroughRun':False}))
