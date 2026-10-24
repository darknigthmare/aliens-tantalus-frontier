"""Native visual matrix for the three delivered title compositions.

Profiles are declared initial JSON inputs. Evaluation only observes the title,
its assets, focus and profile; it never calls a controller or changes runtime.
This matrix does not turn three presets into the missing twenty art presets.
"""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--stage', choices=['before', 'after'], default='after')
parser.add_argument('--viewports', nargs='+', choices=['desktop', 'mobile'], default=['desktop', 'mobile'])
parser.add_argument('--prepare-only', action='store_true')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
presets = ['frontier-night', 'storm-terminator', 'ember-quarantine']
modes = ['full', 'reduced', 'static']
# Authored exterior compositions (catalogue V79/V87). Static intentionally
# omits the near-star layers and image scan sweep; its retained procedural VFX
# is frozen by the native static mode. A layer-count minimum cannot express it.
COMMON_LAYERS = {
    'deep-space': 'space', 'stars-far': 'stars', 'frontier-nebula': 'nebula',
    'frontier-world': 'planet', 'terminator-glow': 'atmosphere',
    'storm-bands': 'clouds', 'sensor-sweep': 'vfx',
    'bitmap-space-01-deep-frontier': 'space', 'bitmap-stars-01-distant-field': 'stars',
    'bitmap-nebula-01-cold-ion': 'nebula'}
MOTION_LAYERS = {'stars-near': 'stars', 'bitmap-stars-02-near-sparks': 'stars',
                 'bitmap-vfx-03-scan-sweep': 'vfx'}
PRESET_LAYERS = {
    'frontier-night': {'shipId': 'uss-sulaco',
        'shipAssetIds': ['orbitals-uss-sulaco-reference-v87', 'orbitals-uss-sulaco-rear-quarter-v90'], 'layers': {
        'bitmap-planet-01-acheron': 'planet', 'bitmap-atmosphere-02-acheron-storm': 'atmosphere',
        'bitmap-clouds-01-acheron-storm': 'clouds'}},
    'storm-terminator': {'shipId': 'uscss-nostromo',
        'shipAssetIds': ['orbitals-uscss-nostromo-reference-v87', 'orbitals-uscss-nostromo-front-quarter-v90'], 'layers': {
        'bitmap-planet-02-ceto-basin': 'planet', 'bitmap-atmosphere-01-ceto-cyan': 'atmosphere'}},
    'ember-quarantine': {'shipId': 'narcissus',
        'shipAssetIds': ['orbitals-narcissus-reference-v87', 'orbitals-narcissus-front-quarter-v90', 'orbitals-narcissus-side-quarter-v90'], 'layers': {
        'bitmap-planet-03-mire-9': 'planet', 'bitmap-atmosphere-03-mire-9': 'atmosphere'}}}


def expected_composition(preset, mode, ship_asset_id):
    expected = {**COMMON_LAYERS, **PRESET_LAYERS[preset]['layers'],
                'bitmap-' + ship_asset_id: 'orbitals'}
    if mode != 'static':
        expected.update(MOTION_LAYERS)
    return expected


def composition_matches(before, preset, mode):
    scene = before['title']['scene']
    expected = expected_composition(preset, mode, scene['shipAssetId'])
    layers = before['layers']
    return (scene['presetId'] == preset and scene['mode'] == mode
            and scene['shipId'] == PRESET_LAYERS[preset]['shipId']
            and scene['shipAssetId'] in PRESET_LAYERS[preset]['shipAssetIds']
            and before['sceneData']['mode'] == mode
            and scene['layerCount'] == len(layers) == len(expected)
            and {layer['id']: layer['role'] for layer in layers} == expected
            and set(scene['roles']) == set(expected.values())
            and len(before['images']) == sum(layer_id.startswith('bitmap-') for layer_id in expected)
            and all(layer['renderer'] == ('image' if layer['id'].startswith('bitmap-') else 'procedural')
                    and (not layer['id'].startswith('bitmap-') or layer['assetId'] == layer['id'][7:])
                    for layer in layers))


report = {'status': 'running', 'stage': args.stage, 'phase': 'prepare', 'checks': [], 'captures': [], 'rows': [],
          'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Declared initial profile via native Save file input; actual title preview, keyboard menu and Options/return controls; read-only title/profile observations.',
          'limitations': ['Automated Chromium, not human QA or canonical1:1 certification.',
                         'Only the three existing dedicated compositions are represented. The seventeen additional planet art sets and35 historical art slots are not supplied by this matrix.',
                         'No fallback asset failure is induced; production asset readiness is measured.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def profile_changes(before, after, path=''):
    """Retain every changed JSON value; expected commit fields stay visible."""
    missing = object()

    def visit(left, right, pointer):
        if type(left) is type(right) and not isinstance(left, (dict, list)) and left == right:
            return []
        if isinstance(left, dict) and isinstance(right, dict):
            result = []
            for key in sorted(set(left) | set(right)):
                token = str(key).replace('~', '~0').replace('/', '~1')
                result.extend(visit(left.get(key, missing), right.get(key, missing), pointer + '/' + token))
            return result
        if isinstance(left, list) and isinstance(right, list):
            result = []
            for index in range(max(len(left), len(right))):
                result.extend(visit(left[index] if index < len(left) else missing,
                                    right[index] if index < len(right) else missing, pointer + '/' + str(index)))
            return result
        change = {'path': pointer, 'beforePresent': left is not missing, 'afterPresent': right is not missing}
        if left is not missing:
            change['before'] = left
        if right is not missing:
            change['after'] = right
        return [change]

    return visit(before, after, path)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'],
            'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def fixture(preset, mode):
    code = """import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();
s.needsPlayerCreationV84=false;s.player.name='QA Title '+process.argv[1]+' '+process.argv[2]+' V163';
s.settings.reducedMotion=false;s.settings.quality='high';s.scene='command';
s.presentation={...s.presentation,titleScene:{presetId:process.argv[1],motionMode:process.argv[2],seed:'native-title-composition-v163'}};
console.log(JSON.stringify(s));"""
    raw = subprocess.run(['node', '--input-type=module', '-e', code, preset, mode], cwd=repo,
                         capture_output=True, check=True).stdout.strip()
    profile = json.loads(raw)
    (output / f'initial-{preset}-{mode}.json').write_bytes(raw)
    return raw, profile


fixtures = {(preset, mode): fixture(preset, mode) for preset in presets for mode in modes}
report['fixtures'] = [{'preset': key[0], 'mode': key[1], 'sha256': hashlib.sha256(value[0]).hexdigest(),
                      'declaredChanges': ['named isolated existing identity', 'needsPlayerCreationV84=false', 'scene=command',
                                          'reducedMotion=false', 'quality=high', 'explicit existing title preset/mode and fixed presentation seed']}
                     for key, value in fixtures.items()]
if args.prepare_only:
    report['status'] = 'fixtures-prepared-no-browser'
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'status': report['status'], 'fixtures': len(fixtures)}))
    raise SystemExit(0)
report['identityBefore'] = identity()

OBSERVE = """()=>{const t=__ATF_V61__.snapshot(),root=document.querySelector('#title-scene-v79');
 return {title:t,focus:document.activeElement?.id,sceneData:{...root.dataset},
 flight:{x:root.style.getPropertyValue('--title-flight-x-v88'),y:root.style.getPropertyValue('--title-flight-y-v88')},
 layers:[...root.children].map(n=>({id:n.dataset.layerId,role:n.dataset.role,renderer:n.dataset.renderer,assetId:n.dataset.assetId||null})),
 images:[...root.querySelectorAll('[data-renderer="image"]')].map(n=>({id:n.dataset.assetId,status:n.dataset.assetStatus,
 hidden:n.hidden,angle:n.dataset.shipAngle,background:getComputedStyle(n).backgroundImage})),
 controls:[...document.querySelectorAll('#title-menu button')].filter(n=>!n.hidden).map(n=>{const r=n.getBoundingClientRect();
 return{id:n.id,disabled:n.disabled,x:r.x,y:r.y,w:r.width,h:r.height,visible:!!n.getClientRects().length};}),
 profile:structuredClone(__ATF_V51__.saveSystem.data)};}"""


def observed(page):
    return page.evaluate(OBSERVE)


def capture(page, name):
    page.locator('#title-screen').screenshot(path=str(output / name))
    report['captures'].append(name)


def open_settings(page):
    if page.locator('[data-panel="settings"].active').is_visible():
        return
    exit_hub = page.locator('#exit-hub')
    if exit_hub.is_visible():
        exit_hub.click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('#nav [data-view="settings"]').click()


def ready(page):
    page.wait_for_function('''()=>{const t=__ATF_V61__?.snapshot(),r=document.querySelector('#title-scene-v79');
      return t?.visible&&t.scene?.active&&t.scene.status==='ready'&&t.scene.readyAssetCount>0
        &&![...r.querySelectorAll('[data-renderer="image"]')].some(n=>n.dataset.assetStatus==='loading');}''', timeout=90000)


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for viewport in args.viewports:
            size = {'width': 1600, 'height': 1000} if viewport == 'desktop' else {'width': 390, 'height': 844}
            for preset in presets:
                for mode in modes:
                    label = f'{viewport}-{preset}-{mode}'
                    phase(label + ': native import, preview and keyboard menu')
                    context = browser.new_context(viewport=size, service_workers='block', reduced_motion='no-preference')
                    page = context.new_page()
                    page.set_default_timeout(30000)
                    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
                    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
                    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
                    page.on('dialog', lambda dialog: dialog.accept())
                    raw, initial = fixtures[(preset, mode)]
                    page.goto(args.base, wait_until='domcontentloaded')
                    page.locator('#title-start').click(timeout=45000)
                    page.locator('#title-options').click()
                    page.locator('#save-import').set_input_files({'name': label + '.json', 'mimeType': 'application/json', 'buffer': raw})
                    page.wait_for_function('name=>__ATF_V51__.saveSystem.data.player.name===name', arg=initial['player']['name'])
                    open_settings(page)
                    page.locator('#setting-title-preview-v87').click()
                    ready(page)
                    if observed(page)['title']['state'] == 'idle':
                        page.keyboard.press('Enter')
                    page.wait_for_function('()=>__ATF_V61__.snapshot().state==="menu"')
                    before = observed(page)
                    report['activeCompositionContract'] = {'id': label, 'preset': preset, 'mode': mode,
                        'shipId': PRESET_LAYERS[preset]['shipId'],
                        'expectedLayerRoles': expected_composition(preset, mode, before['title']['scene']['shipAssetId'])}
                    check(label + ': actual delivered layered preset and requested motion mode',
                          composition_matches(before, preset, mode))
                    check(label + ': production images decoded without fallback failure', before['title']['scene']['missingAssetCount'] == 0
                          and before['title']['scene']['readyAssetCount'] >= 4 and not before['title']['scene']['fallbackVisible']
                          and all(image['status'] == 'ready' for image in before['images']))
                    check(label + ': every visible menu control fits viewport', all(not c['visible'] or (c['x'] >= 0 and c['y'] >= 0
                          and c['x'] + c['w'] <= size['width'] + .5 and c['y'] + c['h'] <= size['height'] + .5) for c in before['controls']))
                    capture(page, label + '-menu.png')
                    # Real arrow keys exercise the complete focus ring including
                    # the deferred Forge button without entering that workspace.
                    page.keyboard.press('Home')
                    page.wait_for_function('()=>document.activeElement?.id==="title-continue"')
                    focus_order = []
                    for _ in range(4):
                        focus_order.append(observed(page)['focus'])
                        page.keyboard.press('ArrowDown')
                    check(label + ': native keyboard reaches each existing menu action once', focus_order == ['title-continue', 'title-new', 'title-forge', 'title-options'])
                    page.keyboard.press('End')
                    page.keyboard.press('Enter')
                    page.wait_for_function('()=>!__ATF_V61__.snapshot().visible&&document.querySelector("[data-panel=settings]").classList.contains("active")')
                    page.locator('#return-title').click()
                    ready(page)
                    page.wait_for_function('()=>document.activeElement?.id==="title-options"')
                    after = observed(page)
                    # Return to title invokes the real commitCurrentRuntimeV78:
                    # SaveSystem updates the root save timestamp and migration
                    # provenance. Retain all values before asserting so any
                    # unexpected gameplay or metadata mutation remains visible.
                    changes = profile_changes(before['profile'], after['profile'])
                    report['rows'].append({'id': label, 'initialProfileSha256': hashlib.sha256(raw).hexdigest(),
                                           'before': before, 'after': after, 'focusOrder': focus_order,
                                           'profileChanges': changes,
                                           'expectedNativeCommitMetadata': {
                                               'updatedAt': 'finite nondecreasing root save timestamp',
                                               'migratedFrom': before['profile']['release']}})
                    check(label + ': Options returns to the same native composition and focus', after['title']['state'] == 'menu'
                          and after['focus'] == 'title-options' and all(before['title']['scene'][key] == after['title']['scene'][key]
                          for key in ['presetId', 'mode', 'placementId', 'shipAssetId', 'shipAngleId']))
                    check(label + ': native title return writes only the declared commit metadata',
                          type(after['profile'].get('updatedAt')) is int
                          and after['profile']['updatedAt'] >= before['profile']['updatedAt']
                          and after['profile'].get('migratedFrom') == before['profile']['release'])
                    expected_profile = {**before['profile'], 'updatedAt': after['profile']['updatedAt'],
                                        'migratedFrom': before['profile']['release']}
                    check(label + ': title and Options preserve every other exact profile value',
                          not profile_changes(expected_profile, after['profile']))
                    capture(page, label + '-options-return.png')
                    context.close()
        check('no browser runtime, network or HTTP error during delivered title matrix', not report['pageErrors']
              and not report['requestFailures'] and not report['httpErrors'])
        report['identityAfter'] = identity()
        check('the same served build completed every matrix case', report['identityAfter'] == report['identityBefore'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = repr(error)
        if 'page' in locals() and not page.is_closed():
            try:
                page.screenshot(path=str(output / 'failure.png'), full_page=True)
                report['failureObservation'] = observed(page)
            except Exception:
                pass
        raise
    finally:
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
