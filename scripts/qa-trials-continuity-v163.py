"""ROOT-run production journeys for final-bomb and spatial-exit continuity.

All live progression uses native menu, keyboard and pointer controls. Browser
evaluation reads snapshots only. Declared initial Save imports grant four
historical Trials pilots, without fabricating a duel, projectile or result.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[1]
HUMANS = ['dd-darwin-era-cultist', 'import-game-dd-wy-commando', 'import-game-dd-guardian']
READ_TRIALS = '()=>globalThis.__ATF_XENO_TRIALS_V96__?.snapshot()'


def fixture(name, broodstorm=False):
    code = """import{createDefaultSave}from'./src/save.js';import{XENO_TRIALS_FIGHTERS_V96 as roster}from'./src/xeno-trials-data-v96.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name=process.argv[1];s.scene='command';s.settings.reducedMotion=false;if(process.argv[2]==='broodstorm')s.strategy.plannedCampaignId='special-broodstorm-v131';else s.xenoTrialsV96.unlocked=[...new Set([...s.xenoTrialsV96.unlocked,...JSON.parse(process.argv[2])])];console.log(JSON.stringify({save:s,roster:roster.map(f=>({id:f.id,label:f.label,family:f.family}))}));"""
    result = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code, name,
        'broodstorm' if broodstorm else json.dumps([*HUMANS, 'prowler'])], cwd=REPO))
    return json.dumps(result['save']).encode(), result['roster']


def source_manifest():
    paths = sorted([*REPO.glob('src/**/*.js'), *REPO.glob('*.css'), REPO / 'index.html', REPO / 'sw.js',
                    REPO / 'package.json', REPO / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(REPO)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}


def open_view(page, view):
    target = page.locator(f'[data-panel="{view}"].active')
    if target.is_visible():
        return
    if page.locator('#exit-hub').is_visible():
        page.locator('#exit-hub').click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
        if target.is_visible():
            return
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{view}"]').click()


def open_title_menu_after_intro(page, timeout=45000):
    # The fading intro admits mouse clicks while still capturing keyboard
    # input. Wait before entering the menu, hence before any restored flight
    # can advance. Detachment and the existing click share its original budget.
    deadline = time.monotonic() + timeout / 1000

    def remaining():
        milliseconds = int((deadline - time.monotonic()) * 1000)
        if milliseconds <= 0:
            raise TimeoutError('Title entry exceeded its original intro and click budget.')
        return milliseconds

    page.locator('#intro-v188').wait_for(state='detached', timeout=remaining())
    page.locator('#title-start').click(timeout=remaining())


def import_initial(page, base, raw, name):
    page.goto(base, wait_until='domcontentloaded')
    open_title_menu_after_intro(page)
    page.locator('#title-options').click()
    page.locator('#save-import').set_input_files({'name': name + '.json', 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg=name)


def brood(page):
    return page.evaluate('''()=>{const e=__ATF_GAME__;return {save:structuredClone(__ATF_V51__.saveSystem.data),
      running:e.running,paused:e.paused,loading:!!(e.enemyAtlasLoadingPausedV65||e.userCasteLoadingV88),
      mission:e.mission?{state:e.mission.state,failureReason:e.mission.failureReason}:null,
      legacy:e.legacyMissionV131?structuredClone(e.legacyMissionV131):null,
      bombs:structuredClone(e.legacyBombsV131||[]),resume:e.lastResumeResult?structuredClone(e.lastResumeResult):null,
      ready:Boolean(e.canPerformGameplayAction?.(e.player,{allowVent:true,allowSquadTask:true})),
      savePolicy:e.missionSavePolicyV188?.(),camera:{...e.camera},
      contacts:(e.enemies||[]).filter(n=>n.alive).map(n=>({id:n.id,x:n.x,y:n.y,w:n.w,h:n.h,health:n.health})),
      vehicle:e.vehicle?{x:e.vehicle.x,y:e.vehicle.y,w:e.vehicle.w,h:e.vehicle.h,vx:e.vehicle.vx,vy:e.vehicle.vy,hull:e.vehicle.hull,fuel:e.vehicle.fuel,turretAmmo:e.vehicle.turretAmmo}:null,
      player:e.player?{x:e.player.x,y:e.player.y,w:e.player.w,h:e.player.h,health:e.player.health,alive:e.player.alive,inVehicle:e.player.inVehicle}:null};}''')


def paused_brood(value):
    return {k: value[k] for k in ['paused', 'mission', 'legacy', 'bombs', 'vehicle', 'player']}


def wait_brood_runtime(page, runtime_ready, timeout=45000):
    # Fresh launches now play the V188 flight before engine.start. Use its
    # visible public control; a checkpoint resume can already be in the game.
    # Observation, click and the original readiness check share one budget.
    deadline = time.monotonic() + timeout / 1000

    def remaining():
        milliseconds = int((deadline - time.monotonic()) * 1000)
        if milliseconds <= 0:
            raise TimeoutError('Broodstorm runtime readiness exceeded its launch budget.')
        return milliseconds

    skip_selector = '.insertion-cinematic-v188[data-direction="insertion"] .insertion-skip-v188'
    page.wait_for_function(f'''()=>{{
      const skip = document.querySelector('{skip_selector}');
      return ({runtime_ready})() || Boolean(skip && skip.getClientRects().length
        && getComputedStyle(skip).visibility !== 'hidden');
    }}''', timeout=remaining())
    skip = page.locator(skip_selector)
    if skip.is_visible():
        skip.click(timeout=remaining())
    page.wait_for_function(runtime_ready, timeout=remaining())


def pause_brood_for_checkpoint(page, report, phase, timeout=30000):
    # A KeyP sent while another control owns focus can be rejected by the
    # native input guard. Observe acceptance immediately; never blindly toggle
    # again or spend the entire projectile lifetime waiting for a lost key.
    started = time.monotonic()
    deadline = started + timeout / 1000
    evidence = {'phase': phase, 'timeLimitSeconds': timeout / 1000, 'attemptLimit': 3, 'attempts': []}
    report.setdefault('nativePauseAcquisition', []).append(evidence)
    probe = '''()=>{const e=__ATF_GAME__,canvas=document.querySelector('#game-canvas');
      const visible=n=>Boolean(n&&!n.hidden&&n.getClientRects().length
        &&getComputedStyle(n).visibility!=='hidden'&&getComputedStyle(n).display!=='none');
      const active=document.activeElement;
      return {running:e.running,paused:e.paused,mission:e.mission?.state,kind:e.legacyMissionV131?.kind,
        canvasVisible:visible(canvas),canvasFocused:active===canvas,documentFocused:document.hasFocus(),
        modalVisible:[...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')].some(visible),
        handoverBlocking:Boolean(e.dropshipHandoverBlocksV188?.()),
        focusOwner:active?{tag:active.tagName,id:active.id||null}:null,
        liveBombCount:(e.legacyBombsV131||[]).length,payload:e.legacyMissionV131?.bombs,
        nests:e.legacyMissionV131?.nests?.slice(),observedAtMs:performance.now()};}'''

    def remaining():
        milliseconds = int((deadline - time.monotonic()) * 1000)
        if milliseconds <= 0:
            raise TimeoutError('Broodstorm pause exceeded its original acquisition budget.')
        return milliseconds

    def admitted(state):
        assert state['running'] and state['kind'] == 'broodstorm' and state['mission'] == 'active', 'Pause belongs to the active native Broodstorm mission.'
        if state['paused']:
            evidence['acquired'] = True
            evidence['elapsedSeconds'] = time.monotonic() - started
            return True
        assert state['canvasVisible'] and not state['modalVisible'] and not state['handoverBlocking'], 'The visible native flight must own pause input.'
        return False

    for _ in range(evidence['attemptLimit']):
        remaining()
        attempt = {'before': page.evaluate(probe)}
        evidence['attempts'].append(attempt)
        if admitted(attempt['before']):
            return
        page.locator('#game-canvas').focus(timeout=remaining())
        attempt['focused'] = page.evaluate(probe)
        if admitted(attempt['focused']):
            return
        assert attempt['focused']['canvasFocused'] and attempt['focused']['documentFocused'], 'The native canvas must actually own keyboard focus.'
        remaining()
        page.keyboard.press('KeyP')
        attempt['key'] = 'KeyP'
        attempt['after'] = page.evaluate(probe)
        remaining()
        if admitted(attempt['after']):
            return
    raise AssertionError('Native KeyP was rejected after three observed focus acquisitions.')


def steer_brood(page, x, y, deadline=None):
    held = set()
    deadline = time.monotonic() + 45 if deadline is None else deadline

    def remaining():
        milliseconds = int((deadline - time.monotonic()) * 1000)
        if milliseconds <= 0:
            raise TimeoutError('Native flight exceeded its original 45 second budget.')
        return milliseconds

    page.locator('#game-canvas').focus(timeout=remaining())
    try:
        while time.monotonic() < deadline:
            state = brood(page)
            assert state['mission']['state'] == 'active' and state['player']['alive'], 'Native flight remains active.'
            if not state['ready']:
                page.wait_for_timeout(min(25, remaining()))
                continue
            vehicle = state['vehicle']
            dx, dy = x - vehicle['x'] - vehicle['w'] / 2, y - vehicle['y'] - vehicle['h'] / 2
            wanted = set()
            if abs(dx) > 14:
                wanted.add('KeyD' if dx > 0 else 'KeyA')
            if abs(dy) > 14:
                wanted.add('KeyS' if dy > 0 else 'KeyW')
            if not wanted:
                break
            # Release each physical pulse before observing again. A slow read
            # must not extend a held direction and oscillate across the nest.
            axes = [abs(value) for value in [dx, dy] if abs(value) > 14]
            speed = 300 / (2 ** .5 if len(axes) == 2 else 1)
            pulse = max(1, min(100, int((min(axes) - 7) / speed * 1000)))
            held = wanted
            for key in held:
                page.keyboard.down(key)
            page.wait_for_timeout(min(pulse, remaining()))
            for key in held:
                page.keyboard.up(key)
            held = set()
            page.wait_for_function('()=>Math.abs(__ATF_GAME__.vehicle.vx)<1e-6&&Math.abs(__ATF_GAME__.vehicle.vy)<1e-6', timeout=min(30000, remaining()))
        else:
            raise AssertionError('Native flight did not reach its visible bombardment position.')
    finally:
        for key in held:
            page.keyboard.up(key)
    # Releasing a direction does not erase the previous physical velocity until
    # the next native update. Waiting for rest avoids bombing with inherited vx.
    page.wait_for_function('()=>Math.abs(__ATF_GAME__.vehicle.vx)<1e-6&&Math.abs(__ATF_GAME__.vehicle.vy)<1e-6', timeout=min(30000, remaining()))


def secure_brood_save(page, deadline, report):
    """Protect the real escort and clear the six finite fighter waves with F.

    An alerted fighter forbids saving even outside the nearby-threat radius.
    Spend only the remainder of the second flight's original 45 second budget;
    the final bomb is still aboard throughout combat and the return to its nest.
    """
    held, aiming = set(), False
    trace = []
    report['nativeBroodstormSaveWindow'] = {'flightBudgetSeconds': 45, 'observations': trace}
    previous = None

    def remaining():
        milliseconds = int((deadline - time.monotonic()) * 1000)
        if milliseconds <= 0:
            raise TimeoutError('Native Broodstorm flight and save clearance exceeded the original 45 second budget.')
        return milliseconds

    def release():
        nonlocal held, aiming
        for key in held:
            page.keyboard.up(key)
        held = set()
        if aiming:
            page.mouse.up(button='right')
            aiming = False

    page.locator('#game-canvas').focus(timeout=remaining())
    try:
        while True:
            remaining()
            state = brood(page)
            legacy, vehicle = state['legacy'], state['vehicle']
            assert state['running'] and state['player']['alive'] and state['mission']['state'] == 'active', 'Native flight remains active.'
            assert legacy['stage'] == 1 and legacy['bombs'] == 1 and legacy['nests'] == [0, 70] and not state['bombs'], \
                'Escort protection must preserve the last finite charge and exact nest damage.'
            target = min(state['contacts'], key=lambda n: (n['x'] - vehicle['x']) ** 2 + (n['y'] - vehicle['y']) ** 2, default=None)
            flags = (legacy['wave'], target['id'] if target else None, state['ready'], state['savePolicy']['allowed'])
            if flags != previous:
                trace.append({'flightWallSeconds': 45 - (deadline - time.monotonic()), 'wave': legacy['wave'],
                              'target': target, 'vehicle': vehicle, 'escort': legacy['escort'],
                              'ready': state['ready'], 'savePolicy': state['savePolicy']})
                previous = flags
            if legacy['wave'] == 6 and not target and state['savePolicy']['allowed']:
                break
            if not state['ready']:
                release()
                page.wait_for_timeout(min(25, remaining()))
                continue
            # Intercept each fighter at turret height. Between contacts, hold
            # ahead of the escort's 650px advance radius so the transport does
            # not reach its destination before the saved final bomb is tested.
            goal_x = target['x'] + target['w'] / 2 + 250 if target else legacy['escort']['x'] + 700
            goal_y = target['y'] + target['h'] / 2 + 15 if target else legacy['escort']['y'] + 58
            dx, dy = goal_x - vehicle['x'] - vehicle['w'] / 2, goal_y - vehicle['y'] - vehicle['h'] / 2
            wanted = set()
            if abs(dx) > 14:
                wanted.add('KeyD' if dx > 0 else 'KeyA')
            if abs(dy) > 14:
                wanted.add('KeyS' if dy > 0 else 'KeyW')
            if target:
                box = page.locator('#game-canvas').bounding_box()
                assert box, 'The native Cheyenne canvas must remain visible.'
                # An off-screen contact must not receive a mouse-down outside
                # the canvas. Clip its ray from the real turret pivot, keeping
                # the direction that the native eight-way aim will resolve.
                ox = vehicle['x'] + vehicle['w'] / 2 - state['camera']['x']
                oy = vehicle['y'] + 28 - state['camera']['y']
                ax = target['x'] + target['w'] / 2 - state['camera']['x'] - ox
                ay = target['y'] + target['h'] / 2 - state['camera']['y'] - oy
                scale = 1
                for origin, direction, limit in [(ox, ax, 1280), (oy, ay, 720)]:
                    if direction > 0:
                        scale = min(scale, (limit - 4 - origin) / direction)
                    elif direction < 0:
                        scale = min(scale, (4 - origin) / direction)
                assert scale > 0, 'The native turret pivot must remain inside its viewport.'
                page.mouse.move(box['x'] + (ox + ax * scale) * box['width'] / 1280,
                                box['y'] + (oy + ay * scale) * box['height'] / 720)
                if not aiming:
                    page.mouse.down(button='right')
                    aiming = True
                wanted.add('KeyF')
            elif aiming:
                page.mouse.up(button='right')
                aiming = False
            for key in held - wanted:
                page.keyboard.up(key)
            for key in wanted - held:
                page.keyboard.down(key)
            held = wanted
            page.wait_for_timeout(min(100, remaining()))
    finally:
        release()
    steer_brood(page, 1560, 550, deadline=deadline)
    state = brood(page)
    remaining()
    assert state['savePolicy']['allowed'] and not state['contacts'] and state['legacy']['wave'] == 6, \
        'The final drop requires a real admitted save window after the finite fighters.'
    report['nativeBroodstormSaveWindow']['beforeFinalDrop'] = {
        'flightWallSeconds': 45 - (deadline - time.monotonic()), 'savePolicy': state['savePolicy'],
        'vehicle': state['vehicle'], 'escort': state['legacy']['escort'], 'wave': state['legacy']['wave']}


def drop_brood(page, before_count, wait_impact=True):
    page.locator('#game-canvas').focus()
    page.keyboard.down('KeyB')
    try:
        page.wait_for_function('n=>__ATF_GAME__.legacyMissionV131.bombs===n-1', arg=before_count, timeout=15000)
    finally:
        page.keyboard.up('KeyB')
    if wait_impact:
        page.wait_for_function('()=>__ATF_GAME__.legacyBombsV131.length===0&&__ATF_GAME__.legacyMissionV131.bombClock===0', timeout=30000)


def physical_match(value):
    return {k: value[k] for k in ['tick', 'timeRemaining', 'result', 'fighters', 'events', 'wins', 'rng', 'projectiles'] if k in value}


def navigation_observation(page):
    return page.evaluate('''()=>{const match=__ATF_XENO_TRIALS_V96__.snapshot().match;
      const rect=selector=>{const e=document.querySelector(selector);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);
        return{left:r.left,top:r.top,width:r.width,height:r.height,hidden:e.hidden,display:s.display,visibility:s.visibility,pointerEvents:s.pointerEvents,onclick:typeof e.onclick};};
      const active=document.activeElement;return{activeView:document.querySelector('.view.active')?.dataset.panel,
        activeElement:{tag:active?.tagName,id:active?.id,xt:active?.dataset?.xt},
        returnButton:rect('[data-xt="return"]'),pauseOverlay:rect('[data-xt="pause-overlay"]'),
        match:match?{phase:match.phase,paused:match.paused,tick:match.tick,
          exit:match.exitV157?{phase:match.exitV157.phase,paused:match.exitV157.paused,elapsedMs:match.exitV157.elapsedMs}:null}:null};}''')


def trace_native_navigation(page):
    # Telemetry only: capture actual DOM dispatch in both phases. No listener
    # cancels an event, focuses a control or writes a game/runtime/save field.
    page.evaluate('''()=>{
      const rows=[];globalThis.__ATF_CONTINUITY_NAV_TRACE_V163__=rows;
      const identity=e=>e?{tag:e.tagName,id:e.id||null,xt:e.dataset?.xt||null}:null;
      for(const capture of [true,false])for(const type of ['pointerdown','mousedown','focusout','focusin','pointerup','mouseup','click','keydown'])
        document.addEventListener(type,event=>{
          if(rows.length>=160)return;
          const s=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot(),m=s?.match;
          const overlay=document.querySelector('[data-xt="pause-overlay"]');
          const button=document.querySelector('[data-xt="return"]'),r=button?.getBoundingClientRect();
          rows.push({type,capture,trusted:event.isTrusted,target:identity(event.target),related:identity(event.relatedTarget),
            active:identity(document.activeElement),code:event.code||null,defaultPrevented:event.defaultPrevented,
            x:event.clientX??null,y:event.clientY??null,time:performance.now(),overlayHidden:overlay?.hidden,
            returnRect:r?{left:r.left,top:r.top,width:r.width,height:r.height}:null,
            topAtReturnCenter:r?identity(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)):null,
            phase:m?.phase||null,paused:m?.paused??null,exit:m?.exitV157?{phase:m.exitV157.phase,elapsedMs:m.exitV157.elapsedMs}:null});
        },{capture});
    }''')


def tab_to_native_return(page):
    page.locator('[data-xt="canvas"]').focus()
    for _ in range(24):
        page.keyboard.press('Shift+Tab')
        if page.evaluate('()=>document.activeElement?.dataset?.xt==="return"'):
            return
    raise AssertionError('Native Shift+Tab could not reach the visible Return action.')


def run_brood(page, args, out, report, check, capture):
    name = 'QA Broodstorm continuity V163'
    raw, _ = fixture(name, broodstorm=True)
    (out / 'disclosed-unplayed-broodstorm-profile.json').write_bytes(raw)
    report['fixtures'].append({'name': name, 'file': 'disclosed-unplayed-broodstorm-profile.json',
        'sha256': hashlib.sha256(raw).hexdigest(), 'changes': ['onboarding bypass', 'player name', 'scene=command', 'existing Broodstorm plan selected'],
        'noCompletedMissionOrBombState': True})
    print('STEP Broodstorm: native launch, six finite drops, save final bomb in flight', flush=True)
    import_initial(page, args.base, raw, name)
    open_view(page, 'command'); page.locator('#operation-launch').click()
    wait_brood_runtime(page, '()=>__ATF_GAME__?.running&&__ATF_GAME__.legacyMissionV131?.kind==="broodstorm"&&!__ATF_GAME__.enemyAtlasLoadingPausedV65', timeout=45000)
    page.locator('#game-canvas').focus()
    page.keyboard.down('KeyE')
    try:
        page.wait_for_function('()=>__ATF_GAME__.legacyMissionV131.stage===1')
    finally:
        page.keyboard.up('KeyE')
    page.keyboard.press('KeyQ')
    capture(page, '01-broodstorm-native-launch.png', '#game-canvas')
    check('Broodstorm starts its actual finite six-bomb chapter with native launch and suppression',
        brood(page)['legacy']['bombs'] == 6 and brood(page)['legacy']['wingMode'] == 'suppress')
    # Two actual misses leave exactly four charges for the two native nests.
    drop_brood(page, 6); drop_brood(page, 5)
    check('two real missed drops consume finite payload without altering nest health', brood(page)['legacy']['bombs'] == 4 and brood(page)['legacy']['nests'] == [140, 140])
    steer_brood(page, 960, 550)
    drop_brood(page, 4); drop_brood(page, 3)
    check('two native swept impacts destroy the first nest', brood(page)['legacy']['nests'] == [0, 140])
    final_flight_deadline = time.monotonic() + 45
    steer_brood(page, 1560, 550, deadline=final_flight_deadline)
    drop_brood(page, 2)
    check('the third useful impact leaves exactly one charge and half of the second nest', brood(page)['legacy']['bombs'] == 1 and brood(page)['legacy']['nests'] == [0, 70])
    secure_brood_save(page, final_flight_deadline, report)
    drop_brood(page, 1, wait_impact=False)
    pause_brood_for_checkpoint(page, report, 'before-final-bomb-save')
    frozen = brood(page)
    check('native pause catches the last finite charge in flight, with zero charges refunded', frozen['legacy']['bombs'] == 0 and len(frozen['bombs']) == 1 and frozen['legacy']['nests'] == [0, 70] and frozen['mission']['state'] == 'active')
    check('the paused final charge has an admitted native save window after all six fighter waves',
        frozen['savePolicy']['allowed'] and frozen['legacy']['wave'] == 6 and not frozen['contacts'])
    capture(page, '02-final-native-bomb-paused.png', '#game-canvas')
    for key in ['KeyB', 'KeyF', 'KeyE']:
        page.keyboard.press(key)
    page.wait_for_timeout(200)
    check('paused firing, interaction and bomb keys change neither flight nor chapter resources', paused_brood(brood(page)) == paused_brood(frozen))
    page.locator('#mission-save-v160').click()
    saved = brood(page)['save']
    operation = saved['strategy']['currentOperation']
    saved_bombs = operation['resumeState']['specialOperation']['legacyBombsV157']
    check('the visible save control stores the exact last projectile and exhausted payload', saved_bombs == frozen['bombs'] and operation['resumeState']['specialOperation']['legacyMissionV131']['bombs'] == 0)
    (out / 'observed-native-final-bomb-checkpoint.json').write_text(json.dumps(saved, ensure_ascii=False, indent=2))
    page.reload(wait_until='domcontentloaded')
    open_title_menu_after_intro(page); page.locator('#title-continue').click()
    open_view(page, 'command'); page.locator('#operation-launch').click()
    wait_brood_runtime(page, '()=>__ATF_GAME__?.running&&__ATF_GAME__.legacyMissionV131?.kind==="broodstorm"', timeout=45000)
    pause_brood_for_checkpoint(page, report, 'after-final-bomb-resume')
    restored = brood(page)
    check('real reload admits the same native checkpoint and operation with no refund or result', restored['resume']['applied'] is True and restored['save']['strategy']['currentOperation']['id'] == operation['id'] and restored['save']['strategy']['currentOperation']['resumeState']['specialOperation']['legacyBombsV157'] == saved_bombs and restored['legacy']['bombs'] == 0 and restored['legacy']['nests'] == [0, 70] and len(restored['bombs']) == 1 and restored['mission']['state'] == 'active')
    original, flying = saved_bombs[0], restored['bombs'][0]
    dt = original['life'] - flying['life']
    expected_y = original['y'] + original['vy'] * dt + 75 * dt * dt
    # Explicit Euler with native substeps <=1/60 has a known upper error of
    # 75*dt/60 in y; this is a physics bound, not a loose screenshot tolerance.
    ballistic = 0 <= dt < original['life'] and abs(flying['x'] - original['x'] - original['vx'] * dt) < 1e-6 and abs(flying['vy'] - original['vy'] - 150 * dt) < 1e-6 and -1e-6 <= flying['y'] - expected_y <= 75 * dt / 60 + 1e-6
    report['projectileContinuity'] = {'saved': original, 'observedAfterReload': flying, 'nativeFlightDeltaSeconds': dt,
        'analyticY': expected_y, 'maximumEulerYError': 75 * dt / 60, 'equationsHold': ballistic}
    check('restored charge continues the same finite ballistic trajectory', ballistic)
    capture(page, '03-final-bomb-native-reload-paused.png', '#game-canvas')
    page.wait_for_timeout(200)
    check('pause also freezes the restored native projectile exactly', paused_brood(brood(page)) == paused_brood(restored))
    page.locator('#game-canvas').focus(); page.keyboard.press('KeyP')
    page.wait_for_function('()=>__ATF_GAME__.legacyMissionV131.nests.every(hp=>hp===0)', timeout=30000)
    impact = brood(page)
    check('the restored last charge really collides and opens stage2 without a victory or duplicate projectile', impact['legacy']['stage'] == 2 and impact['legacy']['bombs'] == 0 and not impact['bombs'] and impact['mission']['state'] == 'active' and not impact['legacy']['complete'])
    check('reload and native impact cannot award strategic money or replay deployment cost', impact['save']['galaxy'] == saved['galaxy'] and impact['save']['clock'] == saved['clock'] and impact['save']['strategy']['currentOperation']['id'] == operation['id'])
    capture(page, '04-last-charge-native-impact.png', '#game-canvas')
    report['broodstorm'] = {'operationId': operation['id'], 'checkpointBombs': saved_bombs,
        'afterImpact': {k: impact[k] for k in ['mission', 'legacy', 'bombs', 'vehicle']}, 'fullChapterClaimed': False}
    page.locator('#retreat-mission').click()
    check('leaving the partial Broodstorm chapter records a native retreat without a victory', brood(page)['save']['strategy']['lastOperation']['id'] == operation['id'] and brood(page)['save']['strategy']['lastOperation']['success'] is False)


def run_exit(page, args, out, report, check, capture, player_id, index):
    slug = player_id.replace('import-game-dd-', '').replace('dd-darwin-era-', '')
    name = 'QA Trials continuity V163 ' + slug
    raw, roster = fixture(name)
    path = 'disclosed-unplayed-trials-' + slug + '.json'; (out / path).write_bytes(raw)
    report['fixtures'].append({'name': name, 'file': path, 'sha256': hashlib.sha256(raw).hexdigest(),
        'changes': ['onboarding bypass', 'player name', 'scene=command', 'four historical Trials pilots unlocked'],
        'unearnedUnlocks': [*HUMANS, 'prowler'], 'hpResultSeedOrClockInjected': False})
    print('STEP spatial exit: production menu ' + player_id + ' vs Prowler', flush=True)
    import_initial(page, args.base, raw, name); open_view(page, 'xenotrials')
    initial_progress = page.evaluate(READ_TRIALS)['progress']
    page.locator('[data-xt-branch="on-demand"]').click()
    form = page.locator('[data-xt="form"]')
    form.locator('[name="opponentFamily"]').select_option(next(f['family'] for f in roster if f['id'] == 'prowler'))
    form.locator('[name="opponentId"]').select_option('prowler')
    form.locator('[name="requestedRules"]').select_option('one-hp')
    page.locator('[data-xt="confirm-target"]').click()
    page.locator('[data-xt="family"]').select_option('all')
    page.locator('[data-xt="search"]').fill(next(f['label'] for f in roster if f['id'] == player_id))
    page.locator('[data-xt-fighter="' + player_id + '"]').click()
    form.locator('[name="difficulty"]').select_option('hard')
    page.locator('[data-xt="confirm-fighters"]').click()
    form.locator('[name="stageId"]').select_option('tantalus-cargo')
    form.locator('[name="roundSeconds"]').select_option('30')
    page.locator('[data-xt="start"]').click()
    page.wait_for_function('()=>{const m=__ATF_XENO_TRIALS_V96__.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation;}', timeout=45000)
    start = page.evaluate(READ_TRIALS)
    check(slug + ': the real on-demand rule creates a native 1PV ticket without runtime stat injection', start['progress']['pending'] is not None and all(f['hp'] == 1 for f in start['match']['fighters']) and [f['id'] for f in start['match']['fighters']] == [player_id, 'prowler'])
    capture(page, '05-' + slug + '-native-menu-duel.png', '[data-xt="canvas"]')
    # No player attack is synthesized. Real movement approaches the CPU, whose
    # actual contacts decide the result; no winner or terminal time is assigned.
    held = None; deadline = time.monotonic() + 150
    try:
        while time.monotonic() < deadline:
            state = page.evaluate(READ_TRIALS); match = state['match']
            if match['phase'] == 'match-over':
                break
            active = match['phase'] == 'active' and not match['presentation']['blocksSimulation'] and not match['paused']
            wanted = None
            if active:
                wanted = 'ArrowRight' if match['fighters'][1]['x'] > match['fighters'][0]['x'] else 'ArrowLeft'
            if wanted != held:
                if held:
                    page.keyboard.up(held)
                held = wanted
                if held:
                    page.locator('[data-xt="canvas"]').focus(); page.keyboard.down(held)
            page.wait_for_timeout(50)
        else:
            raise AssertionError('Actual CPU duel did not reach its own native terminal result.')
    finally:
        if held:
            page.keyboard.up(held)
    terminal = page.evaluate(READ_TRIALS)
    physical = physical_match(terminal['match'])
    page.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
    settled = page.evaluate(READ_TRIALS)['progress']
    receipt = settled['ledger'][-1]
    check(slug + ': one native final result pays its one matching simulation receipt', len(settled['ledger']) == len(initial_progress['ledger']) + 1 and settled['credits'] == initial_progress['credits'] + receipt['credits'] and receipt['matchId'] == terminal['match']['result']['matchId'])
    page.wait_for_function('()=>{const m=__ATF_XENO_TRIALS_V96__.snapshot().match;return m.exitV157?.phase==="playing"&&m.exitViewsV157.some(v=>v.distance>20)&&m.rigViewsV154.some(v=>v.exitV157?.stepped);}', timeout=30000)
    page.locator('[data-xt="canvas"]').focus(); page.keyboard.press('KeyP')
    page.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().match.paused===true')
    frozen = page.evaluate(READ_TRIALS)
    camera = frozen['match']['cameraV119']
    views = frozen['match']['exitViewsV157']
    check(slug + ': both admitted identities enter a measured native spatial exit without moving the completed engine', len(views) == 2 and {v['fighterId'] for v in views} == {player_id, 'prowler'} and physical_match(frozen['match']) == physical and frozen['progress'] == settled)
    check(slug + ': native render coordinates equal their measured direction and distance', all(abs(v['x'] - v['startX'] - v['direction'] * v['distance']) < 1e-6 and v['ground'] == 450 for v in views))
    capture(page, '06-' + slug + '-spatial-exit-paused.png', '[data-xt="canvas"]')
    page.wait_for_timeout(200)
    check(slug + ': public P freezes the full native exit, support coordinates, camera and single receipt', page.evaluate(READ_TRIALS) == frozen)
    viewport = [{'width': 1280, 'height': 800}, {'width': 1024, 'height': 768}, {'width': 390, 'height': 844}][index]
    page.set_viewport_size(viewport)
    page.wait_for_timeout(100)
    resized = page.evaluate(READ_TRIALS)
    check(slug + ': CSS viewport changes preserve the exact paused world camera, exit travel and economic state', resized == frozen)
    box = page.locator('[data-xt="canvas"]').bounding_box()
    style = page.locator('[data-xt="canvas"]').evaluate('canvas=>({objectFit:getComputedStyle(canvas).objectFit,objectPosition:getComputedStyle(canvas).objectPosition,width:canvas.width,height:canvas.height})')
    # Fullscreen canvas uses object-fit:contain. Its CSS element may be much
    # taller than the actual1000x560 image; project through that letterboxed
    # content rectangle, not an assumed stretched element rectangle.
    scale = min(box['width'] / style['width'], box['height'] / style['height'])
    content = {'x': box['x'] + (box['width'] - style['width'] * scale) / 2,
        'y': box['y'] + (box['height'] - style['height'] * scale) / 2,
        'width': style['width'] * scale, 'height': style['height'] * scale}
    projected = []
    for view in views:
        endpoint = (view['endX'] - camera['center']) * camera['zoom'] + 500
        css_endpoint = content['x'] + endpoint * scale
        clears = endpoint <= -view['offscreenMargin'] + 1e-6 if view['direction'] < 0 else endpoint >= 1000 + view['offscreenMargin'] - 1e-6
        projected.append({'fighterId': view['fighterId'], 'direction': view['direction'], 'canvasEndX': endpoint,
            'cssEndX': css_endpoint, 'offscreenCanvasMargin': view['offscreenMargin'], 'fullNativePlateClearsCanvas': clears})
    check(slug + ': frozen world endpoints project beyond the resized native image with the full plate margin',
        all(p['fullNativePlateClearsCanvas'] for p in projected) and style['objectFit'] == 'contain'
        and style['objectPosition'] == '50% 50%' and content['width'] > 0 and content['height'] > 0
        and content['width'] <= box['width'] + 1e-6 and content['height'] <= box['height'] + 1e-6
        and abs(content['width'] / content['height'] - 1000 / 560) < 1e-6)
    capture(page, '07-' + slug + '-spatial-exit-resized-paused.png', '[data-xt="canvas"]')
    details = {'fighterId': player_id, 'matchId': receipt['matchId'], 'viewport': viewport, 'canvasBox': box,
        'canvasStyle': style, 'containedImageRectangle': content,
        'camera': camera, 'pausedExitViews': views, 'projectedEndpoints': projected, 'receipt': receipt}
    if index == 1:
        # The modal owns input while paused. Resume through its visible native
        # control before using the real return button during the moving exit.
        page.locator('[data-xt="resume-overlay"]').click()
        check(slug + ': explicit resume reopens the current finite exit before navigation', page.evaluate(READ_TRIALS)['match']['exitV157']['phase'] == 'playing')
        trace_native_navigation(page)
        navigation = {'before': navigation_observation(page)}
        report.setdefault('navigationDiagnostics', {})[slug] = navigation
        try:
            page.locator('[data-xt="return"]').click()
            navigation['afterClick'] = navigation_observation(page)
            page.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().match===null')
        finally:
            navigation['afterWait'] = navigation_observation(page)
            navigation['events'] = page.evaluate('()=>globalThis.__ATF_CONTINUITY_NAV_TRACE_V163__||[]')
            (out / ('navigation-events-' + slug + '.json')).write_text(json.dumps(navigation, ensure_ascii=False, indent=2))
        page.wait_for_timeout(200)
        check(slug + ': visible return navigation destroys the resumed exit without replaying its reward', page.evaluate(READ_TRIALS)['progress'] == settled)
        open_view(page, 'xenotrials')
        check(slug + ': reopening the real menu does not resurrect or repay an old spatial exit', page.evaluate(READ_TRIALS)['match'] is None and page.evaluate(READ_TRIALS)['progress'] == settled)
        details['returnDuringResumedExit'] = True
    else:
        page.locator('[data-xt="resume-overlay"]').click()
        if index == 2:
            trace_native_navigation(page)
            tab_to_native_return(page)
            keyboard_focus = page.evaluate(READ_TRIALS)
            check(slug + ': real Tab focus leaves Return activatable during spatial travel without opening a pause modal',
                not keyboard_focus['match']['paused'] and keyboard_focus['match']['exitV157']['phase'] == 'playing'
                and page.evaluate('()=>document.activeElement?.isConnected&&document.activeElement.dataset.xt==="return"'))
            page.locator('[data-xt="canvas"]').focus()
        page.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().match.exitV157?.phase==="complete"', timeout=30000)
        ended = page.evaluate(READ_TRIALS)
        check(slug + ': native finite exit clears every participant and retains the exact engine verdict and one receipt', all(not v['visible'] for v in ended['match']['exitViewsV157']) and not ended['match']['rigViewsV154'] and physical_match(ended['match']) == physical and ended['progress'] == settled)
        capture(page, '08-' + slug + '-spatial-exit-native-complete.png', '[data-xt="canvas"]')
        page.wait_for_timeout(250)
        check(slug + ': completed exit has no further simulation, render journey or repeat payment', page.evaluate(READ_TRIALS) == ended)
        if index == 2:
            tab_to_native_return(page)
            page.keyboard.press('Enter')
            details['keyboardReturnActivation'] = 'Native Shift+Tab and Enter; no programmatic click.'
        else:
            page.locator('[data-xt="return"]').click()
        page.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().match===null')
        if index == 2:
            details['keyboardNavigationEvents'] = page.evaluate('()=>globalThis.__ATF_CONTINUITY_NAV_TRACE_V163__||[]')
            (out / 'navigation-events-guardian-keyboard.json').write_text(json.dumps(details['keyboardNavigationEvents'], ensure_ascii=False, indent=2))
    # A real reload exercises the saved result rather than only a live module.
    page.reload(wait_until='domcontentloaded')
    open_title_menu_after_intro(page); page.locator('#title-continue').click()
    open_view(page, 'xenotrials')
    check(slug + ': native reload preserves the saved single receipt without reopening a completed duel', page.evaluate(READ_TRIALS)['match'] is None and page.evaluate(READ_TRIALS)['progress'] == settled)
    report['spatialExits'].append(details)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--only', choices=['all', 'broodstorm', 'exits'], default='all', help='A subset is a diagnostic preview, not the complete profile.')
    parser.add_argument('--exits', nargs='+', choices=['all', 'cultist', 'wy-commando', 'guardian'], default=['all'])
    args = parser.parse_args()
    out = args.output.resolve()
    if out == REPO or REPO in out.parents:
        raise SystemExit('Evidence must remain outside the repository.')
    out.mkdir(parents=True, exist_ok=True)
    report = {'status': 'running', 'profile': 'trials-continuity-v163',
        'requestedScope': {'only': args.only, 'exits': args.exits,
            'fullProfileRequested': args.only == 'all' and 'all' in args.exits},
        'priorityLinks': ['broodstorm-resume-projectile', 'trials-spatial-exit'], 'checks': [], 'captures': [], 'fixtures': [],
        'pageErrors': [], 'requestFailures': [], 'httpErrors': [], 'spatialExits': [],
        'method': 'Production title and Save picker; fresh native Broodstorm flight and six finite drops, actual last-charge quick-save/reload/ballistic impact; three production on-demand duels with public 1PV rule, CPU-decided results, four admitted spatial-exit identities, public pause/viewport/navigation and result reload.',
        'limitations': ['Automated native controls, not human QA or canonical1:1 animation certification.',
            'Broodstorm coverage ends after the restored last bomb destroys the second nest; escort, queen and final chapter extraction are not claimed.',
            'Trials1PV is selected in the existing production menu, not injected into a running match; fixture unlocks four historical pilots without earning them.',
            'Only the four existing spatial-exit identities are covered. New dedicated art, audio, back-facing turns, full authored locomotion and other identities remain outside this continuity regression.',
            'CSS endpoint projections substantiate viewport geometry; screenshots and native receipts retain the actual observed rendered states.']}
    def check(label, ok):
        assert ok, label
        report['checks'].append(label); print('PASS ' + label, flush=True)
    def capture(page, name, selector):
        path = out / name
        locator = page.locator(selector)
        # Preserve the actual canvas pixels behind the accessible pause modal,
        # then the CSS-sized viewport screenshot separately. Neither is a
        # reconstructed pose, fixture draw or runtime mutation.
        png = locator.evaluate("canvas=>canvas.toDataURL('image/png')")
        path.write_bytes(base64.b64decode(png.split(',', 1)[1]))
        report['captures'].append({'file': name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'scope': report.get('phase'), 'kind': 'native-canvas-pixels'})
        ui_name = name.replace('.png', '.ui.png'); ui_path = out / ui_name
        locator.screenshot(path=str(ui_path))
        report['captures'].append({'file': ui_name, 'sha256': hashlib.sha256(ui_path.read_bytes()).hexdigest(),
            'scope': report.get('phase'), 'kind': 'actual-css-viewport-including-modal'})
    start = source_manifest(); (out / 'runtime-source-start-v163.json').write_text(json.dumps(start, indent=2))
    page = None
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
        def context_page():
            ctx = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block', reduced_motion='no-preference')
            value = ctx.new_page(); value.set_default_timeout(30000)
            value.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
            value.on('requestfailed', lambda r: report['requestFailures'].append({'url': r.url, 'failure': r.failure}))
            value.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
            value.on('dialog', lambda d: d.accept())
            return ctx, value
        try:
            if args.only in ['all', 'broodstorm']:
                report['phase'] = 'broodstorm-final-bomb'
                context, page = context_page(); run_brood(page, args, out, report, check, capture); context.close()
            if args.only in ['all', 'exits']:
                for index, fighter_id in enumerate(HUMANS):
                    slug = fighter_id.replace('import-game-dd-', '').replace('dd-darwin-era-', '')
                    if 'all' not in args.exits and slug not in args.exits:
                        continue
                    report['phase'] = 'spatial-exit-' + fighter_id
                    context, page = context_page(); run_exit(page, args, out, report, check, capture, fighter_id, index); context.close()
            check('all native journeys have no JavaScript exception or failed application request', not report['pageErrors'] and not report['httpErrors'] and not [r for r in report['requestFailures'] if r['failure'] != 'net::ERR_ABORTED'])
            report['status'] = 'passed'
        except Exception as error:
            report['status'] = 'failed'; report['error'] = str(error)
            if page:
                try:
                    page.screenshot(path=str(out / 'failure.png'), full_page=True)
                    (out / 'failure-state.json').write_text(json.dumps({'brood': brood(page), 'trials': page.evaluate(READ_TRIALS)}, ensure_ascii=False, indent=2))
                except Exception:
                    pass
            raise
        finally:
            end = source_manifest(); (out / 'runtime-source-end-v163.json').write_text(json.dumps(end, indent=2))
            report['sourceUnchanged'] = start == end
            (out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
            browser.close()
    if not report['sourceUnchanged']:
        raise SystemExit('Runtime or QA source changed during this journey.')


if __name__ == '__main__':
    main()
