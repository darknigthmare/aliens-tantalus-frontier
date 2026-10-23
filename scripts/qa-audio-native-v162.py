"""Native audio QA: real controls, original banks and read-only runtime observations.

Root alone runs Chromium. The single controlled missing-manifest scenario uses
an HTTP404 route; no game/audio method, actor, clock, storage or visibility field
is replaced. Native browser tab/window controls request an actual hidden state.
"""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'controlledHttpResponses': [], 'audioResponses': [],
          'method': 'Native title/navigation, Save file input, keyboard sliders, held fire, real reload, native tab/window switching. Read-only audio observations. One disclosed HTTP404 manifest scenario.',
          'limitations': ['Automated Chromium, not human listening or physical speaker/headphone validation.',
                         'Five real AudioBuffers and three advancing original music loops prove decode/playback, not canonical franchise sound or recorded audible output.',
                         'No new audio asset, voice recording or artwork is introduced.',
                         'Background playback may continue or pause under browser policy; only an actually observed hidden state is counted as hidden-tab coverage.']}


def step(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def capture(page, name):
    page.screenshot(path=str(output / name), full_page=True)
    report['captures'].append(name)


OBSERVE = '''()=>{const a=globalThis.__ATF_AUDIO_V77__;return a?{
 enabled:a.enabled,disposed:a.disposed,context:a.context?.state||null,unlock:a.unlockStatus,
 manifestStatus:a.manifestStatus,manifest:structuredClone(a.manifest),scene:a.scene,generation:a.sceneGeneration,
 pending:a.musicPendingGeneration,status:a.musicStatus,volumes:{...a.volumes},
 effects:[...a.effectBuffers].map(([id,b])=>({id,duration:b.duration,channels:b.numberOfChannels,length:b.length})),
 voices:a.effectVoices.size,timers:a.timers.size,hidden:document.hidden,visibility:document.visibilityState,
 music:[...a.musicVoices].map(v=>({scene:v.scene,stopping:v.stopping,paused:v.audio.paused,
 time:v.audio.currentTime,duration:v.audio.duration,volume:v.audio.volume,readyState:v.audio.readyState})),
 codecs:['audio/wav','audio/ogg'].map(mime=>({mime,support:a.probe?.canPlayType?.(mime)||''})),
 running:!!globalThis.__ATF_GAME__?.running,mission:globalThis.__ATF_GAME__?.mission?.state,
 shots:globalThis.__ATF_GAME__?.player?.shots||0}:null}'''


def observed(page):
    return page.evaluate(OBSERVE)


def watch(page, scenario):
    page.on('pageerror', lambda e: report['pageErrors'].append({'scenario': scenario, 'error': str(e)}))
    page.on('requestfailed', lambda r: report['requestFailures'].append({'scenario': scenario, 'url': r.url, 'failure': r.failure}))

    def response_seen(response):
        path = urlparse(response.url).path
        if response.status >= 400:
            row = {'scenario': scenario, 'url': response.url, 'status': response.status}
            if scenario == 'missing-manifest-404' and path == '/assets/audio/manifest.json' and response.status == 404:
                report['controlledHttpResponses'].append(row)
            else:
                report['httpErrors'].append(row)
        if scenario == 'native-banks' and path.startswith('/assets/audio/') and path.endswith(('.wav', '.ogg')) and response.ok:
            try:
                raw = response.body()
                report['audioResponses'].append({'path': path, 'url': response.url, 'status': response.status,
                    'mime': response.headers.get('content-type', '').split(';')[0].lower(),
                    'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
            except Exception as error:
                report.setdefault('audioResponseReadErrors', []).append({'path': path, 'error': str(error)})
    page.on('response', response_seen)


def open_view(page, view):
    if page.locator(f'[data-panel="{view}"].active').is_visible():
        return
    if page.locator('#exit-hub').is_visible():
        page.locator('#exit-hub').click()
    if page.locator(f'[data-panel="{view}"].active').is_visible():
        return
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{view}"]').click()


def playing(page, scene):
    page.wait_for_function('''scene=>{const a=__ATF_AUDIO_V77__;return a.scene===scene&&a.musicStatus==='playing'
      &&[...a.musicVoices].some(v=>v.scene===scene&&!v.stopping&&!v.audio.paused
        &&Number.isFinite(v.audio.duration)&&v.audio.currentTime>.12&&v.audio.volume>0)}''', arg=scene, timeout=45000)
    state = observed(page)
    live = [v for v in state['music'] if v['scene'] == scene and not v['stopping']]
    check('Actual ' + scene + ' music decodes and advances after native gestures',
          len(live) == 1 and abs(live[0]['duration'] - 24) < .05 and live[0]['volume'] > 0)
    return state


def slider(page, selector, position):
    target = page.locator(selector)
    target.focus()
    page.keyboard.press('Home' if position == 0 else 'End')


def verify_bank_transfer(source, actual):
    expected = {key: source[key] for key in ['mime', 'bytes', 'sha256']}
    observed_transfer = {key: actual.get(key) for key in expected} if actual else None
    accepted_alias = bool(actual and source['mime'] == 'audio/wav' and actual['mime'] == 'audio/x-wav')
    return {'path': source['path'], 'expected': expected, 'actual': observed_transfer,
            'acceptedMimeAlias': 'audio/x-wav -> audio/wav' if accepted_alias else None,
            'mimeAccepted': bool(actual and (actual['mime'] == source['mime'] or accepted_alias)),
            'bytesAndSha256Exact': bool(actual and all(actual[key] == source[key] for key in ['bytes', 'sha256']))}


def native_hidden_probe(page, context):
    """Request native browser visibility; never assign document.hidden."""
    initial = observed(page)
    other = context.new_page()
    other.goto('about:blank')
    other.bring_to_front()
    method = 'native-second-tab'
    window_session = None
    window_id = None
    try:
        page.wait_for_function('()=>document.hidden', polling=100, timeout=3000)
    except Exception:
        # Native browser window minimization is a second actual browser action,
        # not a DOM override. Some headless providers do not expose windows.
        try:
            window_session = context.new_cdp_session(page)
            target_id = window_session.send('Target.getTargetInfo')['targetInfo']['targetId']
            window_id = window_session.send('Browser.getWindowForTarget', {'targetId': target_id})['windowId']
            window_session.send('Browser.setWindowBounds', {'windowId': window_id, 'bounds': {'windowState': 'minimized'}})
            page.wait_for_function('()=>document.hidden', polling=100, timeout=3000)
            method = 'native-window-minimization'
        except Exception as error:
            report.setdefault('visibilityLimitations', []).append(str(error))
    hidden = observed(page)
    # Read clocks before/after a short native background interval; no timer,
    # visibility, media or engine property is injected by this observation.
    page.wait_for_timeout(300)
    later = observed(page)
    if window_session is not None and window_id is not None:
        try:
            window_session.send('Browser.setWindowBounds', {'windowId': window_id, 'bounds': {'windowState': 'normal'}})
        except Exception as error:
            report.setdefault('visibilityLimitations', []).append(str(error))
    other.close()
    page.bring_to_front()
    page.wait_for_function('()=>!document.hidden', polling=100)
    restored = observed(page)
    actual = hidden['hidden'] is True and later['hidden'] is True
    report['visibilityJourney'] = {'method': method, 'actualHiddenStateObserved': actual,
                                   'before': initial, 'hidden': hidden, 'later': later, 'restored': restored}
    check('Native browser tab/window switching never adds duplicate or obsolete music owners',
          all(s['scene'] == 'mission' and len(s['music']) <= 2
              and all(v['scene'] == 'mission' or v['stopping'] for v in s['music']) for s in [initial, hidden, later, restored]))
    if actual:
        check('A real hidden browser state preserves the current bounded audio owner without delayed effects',
              hidden['generation'] == later['generation'] and later['timers'] == 0)
    else:
        report['limitations'].append('This browser did not expose an actual hidden state after native tab/window actions; hidden-tab audio behavior is not certified by this run.')


script = """import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;
s.player.name='QA audio V162';s.scene='command';s.strategy.plannedCampaignId='pair-004-frontier';
s.settings.reducedMotion=true;s.settings.music=.6;s.settings.effects=.7;console.log(JSON.stringify(s));"""
raw_profile = subprocess.run(['node', '--input-type=module', '-e', script], cwd=repo,
                             capture_output=True, text=True, check=True).stdout.encode()
(output / 'disclosed-audio-profile-v162.json').write_bytes(raw_profile)
report['fixtureSha256'] = hashlib.sha256(raw_profile).hexdigest()
source_paths = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'sw.js', repo / 'index.html', Path(__file__)])
source_start = {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
(output / 'profile-source-start.json').write_text(json.dumps(source_start, indent=2))

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=os.environ.get('ATF_QA_HEADLESS', '1') != '0',
        executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    report['tooling'] = {'chromium': browser.version}
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page = context.new_page(); page.set_default_timeout(30000); watch(page, 'native-banks')
    pending_menu = []
    hold_menu = [True]
    def delayed_menu(route):
        if hold_menu[0]:
            pending_menu.append(route)
        else:
            route.continue_()
    page.route('**/assets/audio/music/menu.ogg*', delayed_menu)
    try:
        step('native gesture unlock, real bank loading and mute during a disclosed pending music transfer')
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.wait_for_function('()=>__ATF_AUDIO_V77__?.context?.state==="running"&&__ATF_AUDIO_V77__.effectBuffers.size===5')
        deadline = time.monotonic() + 20
        while not pending_menu and time.monotonic() < deadline:
            page.wait_for_timeout(50)
        check('The native unlock requests the real menu bank before the controlled transfer is released', bool(pending_menu))
        slider(page, '#setting-music', 0)
        hold_menu[0] = False
        for route in pending_menu:
            route.continue_()
        page.wait_for_function('()=>__ATF_AUDIO_V77__.volumes.music===0&&!__ATF_AUDIO_V77__.musicVoices.size&&__ATF_AUDIO_V77__.musicPendingGeneration===-1')
        check('Muting during the real pending music transfer leaves no late media voice', observed(page)['music'] == [])
        slider(page, '#setting-music', 1)
        menu = playing(page, 'menu')
        check('Five shipped effects decode into bounded reusable native buffers',
              {e['id'] for e in menu['effects']} == {'shot', 'tracker', 'hit', 'ui', 'alarm'}
              and all(e['length'] > 0 and e['channels'] == 1 and math.isfinite(e['duration']) and e['duration'] > 0 for e in menu['effects']))
        capture(page, '01-original-menu-banks.png')

        step('native profile import and rapid scene changes')
        page.locator('#save-import').set_input_files({'name': 'audio-profile.json', 'mimeType': 'application/json', 'buffer': raw_profile})
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.player.name==="QA audio V162"')
        open_view(page, 'hub')
        page.wait_for_function('()=>__ATF_HUB__?.running')
        playing(page, 'hub')
        capture(page, '02-original-hub-music.png')
        for _ in range(2):
            page.locator('#exit-hub').click()
            open_view(page, 'hub')
            page.wait_for_function('()=>__ATF_HUB__.running')
        page.locator('#exit-hub').click()
        playing(page, 'menu')
        page.wait_for_function('()=>__ATF_AUDIO_V77__.musicVoices.size===1')
        check('Rapid real navigation retires old loops and leaves one current media element',
              len(observed(page)['music']) == 1 and observed(page)['music'][0]['scene'] == 'menu')
        open_view(page, 'command')
        selected = page.locator('#command-mission-v110')
        if selected.input_value() != 'pair-004-frontier':
            selected.select_option('pair-004-frontier')
        page.locator('#operation-launch').click()
        for _ in range(12):
            if page.evaluate('()=>!!__ATF_GAME__?.running&&__ATF_GAME__.mission?.state==="active"'):
                break
            advance = page.locator('[data-insertion-action="advance"]')
            if advance.is_visible():
                advance.click()
            else:
                page.wait_for_timeout(100)
        page.wait_for_function('()=>__ATF_GAME__?.running&&__ATF_GAME__.mission?.state==="active"&&!__ATF_GAME__.enemyAtlasLoadingPausedV65', timeout=90000)
        playing(page, 'mission')
        page.wait_for_function('()=>__ATF_AUDIO_V77__.musicVoices.size===1')
        before_fire = observed(page)
        page.locator('#game-canvas').click(position={'x': 420, 'y': 340})
        page.keyboard.down('KeyF')
        try:
            page.wait_for_function('''shots=>__ATF_GAME__.player.shots>shots
              &&__ATF_AUDIO_V77__.effectVoices.size>0''', arg=before_fire['shots'], timeout=10000)
            firing = observed(page)
        finally:
            page.keyboard.up('KeyF')
        check('A real mission firing gesture starts an actual bounded effect voice',
              firing['shots'] > before_fire['shots'] and 0 < firing['voices'] <= 24)
        report['nativeFire'] = {'before': before_fire, 'during': firing}
        capture(page, '03-original-mission-music.png')
        native_hidden_probe(page, context)
        # A real gesture owns any resume required by the browser's policy.
        page.locator('#game-canvas').click(position={'x': 420, 'y': 340})
        playing(page, 'mission')
        manifest = observed(page)['manifest']
        expected_sources = [source for kind in ['sfx', 'music'] for slot in manifest['tracks'][kind].values() for source in slot['sources']]
        received = {entry['path']: entry for entry in report['audioResponses']}
        report['bankTransferVerification'] = [verify_bank_transfer(source, received.get(source['path'])) for source in expected_sources]
        report['httpMimePolicy'] = {'exactTypes': ['audio/wav', 'audio/ogg'],
                                   'explicitAliases': {'audio/x-wav': 'audio/wav'},
                                   'unknownTypesAccepted': False, 'bytesAndSha256MustMatchExactly': True}
        check('All eight real WAV/OGG transfers match exact bytes/SHA256 and the declared MIME or explicit WAV alias',
              len(expected_sources) == 8 and all(row['mimeAccepted'] and row['bytesAndSha256Exact']
                                                for row in report['bankTransferVerification']))
        report['decodedNativeBanks'] = observed(page)

        step('native mute settings and actual reload')
        page.locator('#retreat-mission').click()
        open_view(page, 'settings')
        slider(page, '#setting-music', 0); slider(page, '#setting-effects', 0)
        page.wait_for_function('()=>!__ATF_AUDIO_V77__.musicVoices.size&&!__ATF_AUDIO_V77__.effectVoices.size&&!__ATF_AUDIO_V77__.timers.size')
        page.reload(wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        after_reload = observed(page)
        check('Native slider mute survives reload without reviving mission media or delayed effects',
              after_reload['volumes']['music'] == after_reload['volumes']['effects'] == 0
              and after_reload['music'] == [] and after_reload['voices'] == after_reload['timers'] == 0
              and page.locator('#setting-music').input_value() == '0' and page.locator('#setting-effects').input_value() == '0')
        capture(page, '04-muted-after-reload.png')
        slider(page, '#setting-effects', 1); slider(page, '#setting-music', 1)
        playing(page, 'menu')
        check('Unmuting after reload starts only the currently visible menu scene',
              all(v['scene'] == 'menu' or v['stopping'] for v in observed(page)['music']))

        step('controlled missing optional manifest preserves native controls and the unlocked audio context')
        fallback_context = browser.new_context(viewport={'width': 1280, 'height': 900}, service_workers='block')
        fallback = fallback_context.new_page(); fallback.set_default_timeout(30000); watch(fallback, 'missing-manifest-404')
        fallback.route('**/assets/audio/manifest.json', lambda route: route.fulfill(status=404, content_type='application/json', body='{}'))
        fallback.goto(args.base, wait_until='domcontentloaded')
        fallback.locator('#title-start').click(timeout=45000)
        fallback.locator('#title-options').click()
        fallback.wait_for_function('()=>__ATF_AUDIO_V77__.manifestStatus==="unavailable"&&__ATF_AUDIO_V77__.context?.state==="running"&&__ATF_AUDIO_V77__.musicStatus==="silent-missing"')
        state = observed(fallback)
        check('The controlled HTTP404 manifest leaves an unlocked context, no fake decoded bank and no music voice',
              len(report['controlledHttpResponses']) >= 1 and state['effects'] == [] and state['music'] == [] and state['context'] == 'running')
        slider(fallback, '#setting-music', 0); slider(fallback, '#setting-music', 1)
        fallback.wait_for_function('()=>__ATF_AUDIO_V77__.musicStatus==="silent-missing"')
        check('Native controls remain available and music stays silent with the optional manifest unavailable',
              fallback.locator('[data-panel="settings"].active').is_visible()
              and fallback.locator('#setting-effects').is_enabled()
              and observed(fallback)['manifestStatus'] == 'unavailable'
              and observed(fallback)['context'] == 'running' and observed(fallback)['music'] == [])
        capture(fallback, '05-controlled-manifest-absent.png')
        report['controlledFallback'] = observed(fallback)
        fallback_context.close()
        unexpected_requests = [e for e in report['requestFailures'] if e.get('failure') != 'net::ERR_ABORTED']
        check('No unexpected script, HTTP or request failures occur',
              not report['pageErrors'] and not report['httpErrors'] and not unexpected_requests and not report.get('audioResponseReadErrors'))
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        try:
            report['failureState'] = observed(page)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception:
            pass
        raise
    finally:
        for route in pending_menu:
            try:
                route.continue_()
            except Exception:
                pass
        source_end = {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
        (output / 'profile-source-end.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
            report['error'] = 'Source files changed during the native audio recipe.'
        report['captureSha256'] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in output.glob('*.png')}
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
    if report['status'] != 'passed':
        raise SystemExit(1)
