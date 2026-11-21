"""V186 integration QA, native browser UI and controls.
Only two fixtures: standard Gamepad API events, and an ordinary save imported
through System UI with 30,000 Trials credits to purchase Queen for the boss run.
No fighter, clock, outcome, damage or director state is injected.
"""
import argparse, json, time, subprocess, hashlib, os
from pathlib import Path
from playwright.sync_api import sync_playwright
P = argparse.ArgumentParser()
P.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
P.add_argument('--output', type=Path, required=True)
P.add_argument('--mode', choices=['checkpoint', 'boss', 'all'], default='all')
a = P.parse_args()
REPO = Path(__file__).resolve().parents[1]
OUT = a.output.resolve()
if OUT == REPO or REPO in OUT.parents:
    raise SystemExit('Keep browser evidence outside the repository.')
OUT.mkdir(parents=True, exist_ok=True)
R = {'status': 'running', 'mode': a.mode, 'checks': [], 'captures': [], 'pageErrors': [], 'httpErrors': [], 'requestFailures': [], 'observations': [], 'fixtures': ['A mock standard Gamepad through navigator.getGamepads plus gamepadconnected/gamepaddisconnected; not a physical controller.', 'Boss scenario only: createDefaultSave imported using the native System file input, with 30,000 Trials credits, player setup complete and a QA name. Queen remains locked until purchased with the native unlock button.'], 'limits': ['Local Chromium154 automated native UI/keyboard and simulated Gamepad; no human art or peripheral qualification.', 'Samples one synthetic horde checkpoint, one major-contact finale, board pagination and mobile CSS; does not certify all eighty protocols played.', 'No game actors, RNG, clocks, damage, director, progression result or outcome is written by JavaScript. Read-only snapshots and geometry support observations.']}
READ = '() => globalThis.__ATF_XENO_TRIALS_V96__?.snapshot()'
PAD = "(()=>{let connected=false;const pad={id:'QA standard controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),timestamp:0};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>connected?[pad]:[]});globalThis.__QA_STANDARD_PAD_V186__={set(next){if(next.axes)pad.axes=[...next.axes];if(next.buttons){pad.buttons=Array.from({length:17},(_,i)=>({pressed:(next.buttons[i]||0)>=.5,touched:(next.buttons[i]||0)>0,value:next.buttons[i]||0}));}pad.timestamp=performance.now();if(typeof next.connected==='boolean'&&next.connected!==connected){connected=next.connected;pad.connected=connected;dispatchEvent(new Event(connected?'gamepadconnected':'gamepaddisconnected'));}return{connected,axes:pad.axes,buttons:pad.buttons.map(b=>b.value)}}};})()"

def state(p):
    return p.evaluate(READ)

def check(label, condition, evidence=None):
    if not condition:
        raise AssertionError(label)
    R['checks'].append({'label': label, 'evidence': evidence})
    print('PASS ' + label, flush=True)

def cap(p, name):
    p.screenshot(path=str(OUT / name), full_page=True)
    R['captures'].append(name)

def enter(p, s):
    p.locator(s).wait_for(state='visible')
    p.locator(s).focus()
    p.keyboard.press('Enter')

def open_system(p, reload=False):
    if reload:
        p.reload(wait_until='domcontentloaded')
    else:
        p.goto(a.base, wait_until='domcontentloaded')
    p.locator('#title-start').click(timeout=45000)
    p.locator('#title-options').click()
    p.wait_for_timeout(350)

def open_trials(p):
    enter(p, '#nav [data-view="xenotrials"]')
    p.wait_for_timeout(350)

def wait_active(p):
    p.wait_for_function('()=>{const m=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation;}', timeout=45000)

def pad(p, connected=None, axis=0, buttons=None):
    data = {'axes': [axis, 0, 0, 0], 'buttons': {str(k): v for k, v in (buttons or {}).items()}}
    if connected is not None:
        data['connected'] = connected
    p.evaluate('(next)=>__QA_STANDARD_PAD_V186__.set(next)', data)

def pause(p):
    p.locator('[data-xt="canvas"]').focus()
    p.keyboard.press('KeyP')
    p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.paused')

def release(p):
    for k in ['ArrowLeft', 'ArrowRight', 'KeyJ', 'KeyK', 'KeyL', 'KeyS']:
        p.keyboard.up(k)

def choose_protocol(p, id):
    selector = f'[data-xt-activity="{id}"]'
    while not p.locator(selector).count():
        if p.locator('[data-xt="program-next"]').is_disabled():
            raise AssertionError('Protocol absent from native paginated board: ' + id)
        enter(p, '[data-xt="program-next"]')
    enter(p, selector)

def start_horde(p, id):
    enter(p, '[data-xt-branch="horde"]')
    p.locator('[data-xt="program-filter"]').select_option('boss' if id.startswith('xth186-') else 'standard')
    choose_protocol(p, id)
    enter(p, '[data-xt="confirm-fighters"]')
    enter(p, '[data-xt="start"]')
    wait_active(p)

def watch(p, seconds, condition):
    end = time.monotonic() + seconds
    last = None
    while time.monotonic() < end:
        last = state(p)
        if condition(last):
            return last
        p.wait_for_timeout(35)
    raise AssertionError('Read-only native condition not observed before its time budget; last=' + json.dumps(last.get('match', {}).get('hordeV180')))

def diff(x, y, path=''):
    if type(x) != type(y):
        return [(path, x, y)]
    if isinstance(x, dict):
        out = []
        for k in sorted(set(x) | set(y)):
            if k not in x or k not in y:
                out.append((path + '.' + k, x.get(k), y.get(k)))
            else:
                out.extend(diff(x[k], y[k], path + '.' + k))
        return out
    if isinstance(x, list):
        if len(x) != len(y):
            return [(path + '.length', len(x), len(y))]
        return [d for i, (a, b) in enumerate(zip(x, y)) for d in diff(a, b, path + f'[{i}]')]
    return [] if x == y else [(path, x, y)]

def protected(m, keys):
    out = json.loads(json.dumps({k: m[k] for k in keys}))
    out['paused'] = True
    out['accumulator'] = 0
    for k in ['previousInput', 'rearmControls']:
        out['fighters'][0].pop(k, None)
    return out

def hud_layout(p):
    return p.evaluate('()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};const find=key=>document.querySelector(`[data-xt="${key}"]`);const boss=find(\'boss-hud\');return{viewport:{width:innerWidth,height:innerHeight},parentIsHud:Boolean(boss.closest(\'[data-xt="combat-hud"]\')),boss:rect(boss),player:rect(find(\'player-vitals\')),population:rect(find(\'horde-hud\')),hidden:boss.hidden,healthMaximum:find(\'boss-hp\').max,healthValue:find(\'boss-hp\').value,healthText:find(\'boss-hp-value\').textContent,phase:find(\'boss-phase\').textContent};}')

def separated(a, b):
    return min(a['x'] + a['width'], b['x'] + b['width']) <= max(a['x'], b['x']) or min(a['y'] + a['height'], b['y'] + b['height']) <= max(a['y'], b['y'])

def checkpoint_case(browser):
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
    context.add_init_script(PAD)
    p = context.new_page()
    hook(p)
    try:
        open_system(p)
        p.locator('#language-select-v185').select_option('en')
        open_trials(p)
        enter(p, '[data-xt-branch="horde"]')
        check('Horde board reports eighty protocols in native English UI', '80' in p.locator('[data-xt="activity-count"]').inner_text())
        ids = []
        indices = []
        while True:
            ids.extend(p.locator('[data-xt-activity]').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.xtActivity)'))
            indices.extend(p.locator('.xt-activity-image>span').all_inner_texts())
            if p.locator('[data-xt="program-next"]').is_disabled():
                break
            enter(p, '[data-xt="program-next"]')
        check('Seven native pages expose every protocol once without loss or duplication', len(ids) == 80 and len(set(ids)) == 80, {'ids': ids, 'indices': indices})
        p.locator('[data-xt="program-filter"]').select_option('boss')
        check('Boss filter keeps forty finales and bounded twelve-card pages', p.locator('[data-xt-activity]').count() == 12 and '/ 40' in p.locator('[data-xt="program-page"]').inner_text() and all((x.startswith('xth186-') for x in p.locator('[data-xt-activity]').evaluate_all('(n)=>n.map(e=>e.dataset.xtActivity)'))))
        check('Boss filter and final-health descriptions translate dynamically', 'Boss finales' in p.locator('[data-xt="program-filter"]').inner_text() and p.locator('.xt-boss-order-v186').first.inner_text().endswith('140 HP'))
        p.set_viewport_size({'width': 390, 'height': 844})
        p.wait_for_timeout(200)
        cap(p, '01-mobile-boss-board-en.png')
        overflow = p.locator('#xeno-trials-v96').evaluate('(e)=>({scroll:e.scrollWidth,client:e.clientWidth})')
        check('Mobile protocol board has no horizontal content overflow', overflow['scroll'] <= overflow['client'] + 1, overflow)
        p.set_viewport_size({'width': 1440, 'height': 1000})
        p.locator('[data-xt="program-filter"]').select_option('standard')
        check('Standard filter exposes the forty preserved protocols', '/ 40' in p.locator('[data-xt="program-page"]').inner_text())
        choose_protocol(p, 'xth180-blackout-1')
        enter(p, '[data-xt="confirm-fighters"]')
        enter(p, '[data-xt="start"]')
        wait_active(p)
        p.locator('[data-xt="canvas"]').focus()
        pad(p, True, axis=1)
        p.wait_for_timeout(100)
        m = state(p)['match']
        check('A newly connected held standard pad is gated until neutral', m['gamepadV186']['connected'] and m['gamepadV186']['needsNeutral'] and (not m['fighters'][0]['previousInput']['right']))
        pad(p, axis=0)
        p.wait_for_timeout(60)
        pad(p, axis=1)
        p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.fighters[0].previousInput.right')
        check('After a neutral sample the standard pad drives native movement', state(p)['match']['fighters'][0]['previousInput']['right'])
        pad(p, axis=1, buttons={9: 1})
        p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.paused')
        frozen = state(p)['match']['tick']
        p.wait_for_timeout(160)
        check('Holding Start pauses once and does not immediately resume', state(p)['match']['paused'] and state(p)['match']['tick'] == frozen)
        pad(p, axis=1)
        p.wait_for_timeout(70)
        pad(p, axis=0)
        p.wait_for_timeout(70)
        pad(p, axis=1, buttons={9: 1})
        wait_active(p)
        pad(p, axis=1)
        p.wait_for_timeout(80)
        check('Start resume does not replay a held movement axis', state(p)['match']['gamepadV186']['needsNeutral'] and (not state(p)['match']['fighters'][0]['previousInput']['right']))
        pad(p, axis=0)
        p.wait_for_timeout(70)
        pad(p, axis=-1)
        p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.fighters[0].previousInput.left')
        pad(p, False, axis=-1)
        p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.paused')
        m = state(p)['match']
        check('Disconnect pauses and clears native combat input', not m['gamepadV186']['connected'] and (not any(m['fighters'][0]['previousInput'].values())))
        pad(p, True, axis=1)
        p.wait_for_timeout(80)
        check('A held reconnect remains paused and gated', state(p)['match']['paused'] and state(p)['match']['gamepadV186']['needsNeutral'])
        pad(p, axis=0)
        p.wait_for_timeout(80)
        pad(p, buttons={9: 1})
        wait_active(p)
        pad(p)
        p.locator('[data-xt="canvas"]').focus()
        native = watch(p, 25, lambda s: bool(s['match']['projectiles']) and any((f['attack'] for f in s['match']['fighters'])) and (s['match']['fighters'][0]['hp'] < 220))
        pause(p)
        paused = state(p)
        cp = paused['progress']['pending'].get('checkpointV186')
        check('Native pause saves a real mid-wave checkpoint with projectile and attack state', cp is not None and bool(cp['snapshot']['projectiles']) and any((f['attack'] for f in cp['snapshot']['fighters'])), {'tick': cp and cp['tick'], 'projectiles': cp and cp['snapshot']['projectiles']})
        expected = protected(cp['snapshot'], cp['snapshot'].keys())
        actual = protected(paused['match'], cp['snapshot'].keys())
        d = diff(expected, actual)
        check('Stored checkpoint equals the paused native physical state', not d, d)
        check('Checkpoint notice translates to English', 'CHECKPOINT SAVED' in p.locator('[data-xt="checkpoint-status"]').inner_text().upper())
        check('Dynamic player HP and native pause abandonment are translated to English', p.locator('[data-xt="player-hp-value"]').inner_text().endswith('HP') and p.locator('[data-xt="abandon-overlay"]').inner_text() == 'ABANDON · NO REWARD')
        placement = p.evaluate('()=>Object.fromEntries([\'checkpoint-status\',\'input-device\'].map(key=>[key,Boolean(document.querySelector(`[data-xt="${key}"]`).closest(\'[data-xt="combat-hud"]\'))]))')
        check('Checkpoint and input-device notices belong to the visible HUD layer', all(placement.values()), placement)
        (OUT / 'native-midwave-checkpoint.json').write_text(json.dumps(cp, ensure_ascii=False, indent=2))
        cap(p, '02-midwave-checkpoint-en.png')
        open_system(p, reload=True)
        open_trials(p)
        restored = state(p)
        check('Actual page reload retains the checkpoint ticket and earned state', restored['progress']['pending']['checkpointV186'] == cp and restored['progress']['credits'] == paused['progress']['credits'])
        check('Recovery button is translated and preserves the authored wave', p.locator('[data-xt="restart"]').inner_text().startswith('RESUME WAVE'))
        enter(p, '[data-xt="restart"]')
        p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match?.resumedV186===true')
        restored = state(p)['match']
        d = diff(expected, protected(restored, cp['snapshot'].keys()))
        check('Native resume restores HP positions counters RNG AI attacks and projectiles exactly', restored['paused'] and (not d), d)
        p.wait_for_timeout(220)
        check('Restored pause advances neither projectile nor attack clock', not diff(expected, protected(state(p)['match'], cp['snapshot'].keys())))
        check('Restored recovery notice is dynamically translated', 'Wave checkpoint restored.' in p.locator('[data-xt="checkpoint-status"]').inner_text())
        p.set_viewport_size({'width': 390, 'height': 844})
        p.wait_for_timeout(150)
        cap(p, '03-mobile-restored-pause-en.png')
        check('Mobile restored pause keeps a visible reachable resume action', p.locator('[data-xt="resume-overlay"]').is_visible())
        p.set_viewport_size({'width': 1440, 'height': 1000})
        enter(p, '[data-xt="return"]')
        enter(p, '#exit-hub')
        enter(p, '#nav [data-view="settings"]')
        p.locator('#language-select-v185').select_option('fr')
        open_trials(p)
        check('Returning to French updates recovery controls without losing the checkpoint', p.locator('[data-xt="restart"]').inner_text().startswith('REPRENDRE LA VAGUE') and state(p)['progress']['pending']['checkpointV186']['tick'] == cp['tick'])
        enter(p, '[data-xt="restart"]')
        p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match?.resumedV186===true')
        pad(p, True)
        p.wait_for_timeout(80)
        pad(p, buttons={9: 1})
        wait_active(p)
        pad(p)
        p.wait_for_function('(tick)=>globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.tick>tick+10', arg=cp['tick'])
        check('The restored evaluation resumes through standard Start input', not state(p)['match']['paused'])
        pause(p)
        cap(p, '04-restored-resumed-fr.png')
    except Exception:
        try:
            R.setdefault('scenarioFailureStates', []).append(state(p))
            cap(p, 'failure-scenario-' + a.mode + '.png')
        except Exception:
            pass
        raise
    finally:
        context.close()

def fixture():
    code = "import{createDefaultSave}from'./src/save.js';import{getXenoTrialsFighterV96}from'./src/xeno-trials-data-v96.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA_BOSS_V186';s.scene='command';s.xenoTrialsV96.credits=30000;console.log(JSON.stringify({save:s,queen:getXenoTrialsFighterV96('queen')}));"
    data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code], cwd=REPO, text=True))
    raw = json.dumps(data['save'], ensure_ascii=False).encode()
    (OUT / 'queen-credit-fixture.json').write_bytes(raw)
    R['bossFixture'] = {'file': 'queen-credit-fixture.json', 'sha256': hashlib.sha256(raw).hexdigest(), 'queenId': data['queen']['id'], 'queenHp': data['queen']['hp'], 'credits': 30000}
    return (raw, data['queen'])

def native_combat(p, limit=150):
    deadline = time.monotonic() + limit
    held = None
    last_heavy = -500
    last_light = -500
    boss_seen = None
    boss_damaged = None
    ghost_seen = None
    ghost_expired = None
    first_ghost_tick = None
    last_wave = 1
    p.locator('[data-xt="canvas"]').focus()
    while time.monotonic() < deadline:
        m = state(p)['match']
        h = m['hordeV180']
        player = m['fighters'][0]
        boss = m.get('bossV186')
        ghosts = m.get('defeatedViewsV186', [])
        obs = {'tick': m['tick'], 'wave': h['wave'], 'phase': m['phase'], 'hp': player['hp'], 'kills': h['totalKills'], 'boss': boss, 'ghosts': ghosts, 'alive': [{'id': f['id'], 'instance': f.get('instanceIdV180'), 'hp': f['hp'], 'maxHp': f.get('maxHpV180'), 'rank': f.get('enemyRankV186')} for f in m['fighters'][1:]]}
        R['observations'].append(obs)
        if ghosts and ghost_seen is None:
            ghost_seen = ghosts[0]
            first_ghost_tick = m['tick']
            cap(p, '05-native-supported-ko-ghost.png')
        if ghost_seen and m['tick'] > first_ghost_tick + 80 and all((g['instanceId'] != ghost_seen['instanceId'] for g in ghosts)):
            ghost_expired = {'tick': m['tick'], 'instanceId': ghost_seen['instanceId']}
        if boss and boss['phase'] == 'active':
            if boss_seen is None:
                p.wait_for_function('()=>document.querySelector(\'[data-xt="boss-phase"]\').textContent.includes(\'ACTIVE\')')
                boss_seen = {'tick': m['tick'], 'view': boss, 'actors': obs['alive'], 'desktopHud': hud_layout(p)}
                cap(p, '06-boss-native-active.png')
                release(p)
                held = None
                p.set_viewport_size({'width': 390, 'height': 844})
                p.wait_for_timeout(80)
                boss_seen['mobileHud'] = hud_layout(p)
                cap(p, '06-mobile-boss-native-active.png')
                p.set_viewport_size({'width': 1440, 'height': 1000})
                p.locator('[data-xt="canvas"]').focus()
            if boss['hp'] < boss['maxHp']:
                boss_damaged = {'tick': m['tick'], 'view': boss}
        if h['wave'] != last_wave:
            last_wave = h['wave']
        if m['phase'] == 'match-over':
            release(p)
            return (m, {'bossSeen': boss_seen, 'bossDamaged': boss_damaged, 'ghostSeen': ghost_seen, 'ghostExpired': ghost_expired})
        active = not m['paused'] and (not m['presentation']['blocksSimulation']) and (h['phase'] == 'active')
        if not active or len(m['fighters']) < 2:
            if held:
                p.keyboard.up(held)
                held = None
            p.wait_for_timeout(80)
            continue
        nearest = min(m['fighters'][1:], key=lambda f: abs(f['x'] - player['x']))
        direction = 'ArrowRight' if nearest['x'] > player['x'] else 'ArrowLeft'
        gap = p.evaluate("async fighters=>{const e=fighters.slice(1).sort((a,b)=>Math.abs(a.x-fighters[0].x)-Math.abs(b.x-fighters[0].x))[0];return(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyGapV105(fighters[0],e);}", m['fighters'])
        desired = direction if gap > 40 else None
        if desired != held:
            if held:
                p.keyboard.up(held)
            if desired:
                p.keyboard.down(desired)
            held = desired
        if gap < 125 and (not player['attack']) and (player['stun'] <= 0):
            if m['tick'] - last_heavy >= 180 and player['stamina'] >= 25:
                p.keyboard.press('KeyK', delay=45)
                last_heavy = m['tick']
            elif m['tick'] - last_light >= 180 and m['tick'] - last_heavy >= 75 and (player['stamina'] >= 12):
                p.keyboard.press('KeyJ', delay=45)
                last_light = m['tick']
        p.wait_for_timeout(70)
    release(p)
    raise AssertionError('Native boss run exceeded its real-time input budget')

def boss_case(browser):
    raw, queen = fixture()
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
    p = context.new_page()
    hook(p)
    try:
        open_system(p)
        p.locator('#language-select-v185').select_option('en')
        p.locator('#save-import').set_input_files({'name': 'queen-credit-fixture.json', 'mimeType': 'application/json', 'buffer': raw})
        p.wait_for_function("globalThis.__ATF_V51__?.saveSystem.data.player.name==='QA_BOSS_V186'")
        open_trials(p)
        enter(p, '[data-xt-branch="horde"]')
        p.locator('[data-xt="program-filter"]').select_option('boss')
        enter(p, '[data-xt-activity="xth186-incoming-1"]')
        p.locator('[data-xt="search"]').fill(queen['label'])
        check('Queen starts locked in the declared credit fixture', 'queen' not in state(p)['progress']['unlocked'])
        enter(p, '[data-xt-unlock="queen"]')
        enter(p, '[data-xt-fighter="queen"]')
        check('The native purchase unlocks Queen and charges Trials credits', 'queen' in state(p)['progress']['unlocked'] and state(p)['progress']['credits'] == 28600)
        enter(p, '[data-xt="confirm-fighters"]')
        enter(p, '[data-xt="start"]')
        wait_active(p)
        before = state(p)['progress']
        m, witness = native_combat(p)
        R['bossWitness'] = witness
        check('Native combat reaches the authored final boss above the weak-troop HP cap', witness['bossSeen'] is not None and witness['bossSeen']['view']['maxHp'] == 140 and any((f['rank'] == 'boss' and f['maxHp'] == 140 for f in witness['bossSeen']['actors'])), witness['bossSeen'])
        check('The real boss HP meter reflects damage before its defeat', witness['bossDamaged'] is not None, witness['bossDamaged'])
        layouts = [witness['bossSeen']['desktopHud'], witness['bossSeen']['mobileHud']]
        check('Desktop and mobile boss telemetry paints in the HUD layer and preserves the major-contact HP scale', all((h['parentIsHud'] and (not h['hidden']) and (h['healthMaximum'] == 140) and h['healthText'].endswith('HP') and (h['boss']['width'] > 0) and (h['boss']['x'] >= 0) and (h['boss']['x'] + h['boss']['width'] <= h['viewport']['width'] + 1) for h in layouts)), layouts)
        check('Boss telemetry never overlaps the native player and population bars', all((separated(h['boss'], h['player']) and separated(h['boss'], h['population']) for h in layouts)), layouts)
        check('Native troop defeat leaves a presentation-only supported KO ghost', witness['ghostSeen'] is not None and all((f.get('instanceIdV180') != witness['ghostSeen']['instanceId'] for f in m['fighters'])), witness['ghostSeen'])
        check('That defeated ghost expires after active simulation advances', witness['ghostExpired'] is not None, witness['ghostExpired'])
        check('The Queen wins the complete fifteen-enemy boss protocol through native controls', m['result']['winner'] == 'player' and m['result']['hordeV180']['kills'] == 15 and m['result']['hordeV180']['bossFinaleV186']['defeated'], m['result'])
        p.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
        won = state(p)['progress']
        check('Boss completion settles its single saved ticket', won['ledger'][-1]['winner'] == 'player' and 'xth186-incoming-1' in won['modesV119']['hordeCleared'] and (len(won['ledger']) == len(before['ledger']) + 1))
        p.set_viewport_size({'width': 390, 'height': 844})
        p.wait_for_timeout(120)
        cap(p, '07-mobile-boss-native-result.png')
        open_system(p, reload=True)
        open_trials(p)
        check('Reload preserves the boss reward without replaying or paying it again', state(p)['progress'] == won and state(p)['match'] is None)
    except Exception:
        try:
            R.setdefault('scenarioFailureStates', []).append(state(p))
            cap(p, 'failure-scenario-' + a.mode + '.png')
        except Exception:
            pass
        raise
    finally:
        context.close()

def hook(p):
    p.set_default_timeout(20000)
    p.on('pageerror', lambda e: R['pageErrors'].append(str(e)))
    p.on('response', lambda r: R['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
    p.on('requestfailed', lambda r: R['requestFailures'].append({'url': r.url, 'failure': r.failure}))
with sync_playwright() as pw:
    launch = {'headless': True}
    executable = os.environ.get('ATF_CHROMIUM_EXECUTABLE')
    if executable:
        launch['executable_path'] = executable
    browser = pw.chromium.launch(**launch)
    try:
        if a.mode in ['checkpoint', 'all']:
            checkpoint_case(browser)
        if a.mode in ['boss', 'all']:
            boss_case(browser)
        check('No browser exceptions or missing HTTP assets occurred', not R['pageErrors'] and (not R['httpErrors']), {'pageErrors': R['pageErrors'], 'httpErrors': R['httpErrors']})
        failures = [r for r in R['requestFailures'] if r['failure'] != 'net::ERR_ABORTED']
        check('Only explicit page-navigation cancellations may interrupt requests', not failures, R['requestFailures'])
        R['status'] = 'passed'
    except Exception as error:
        R['status'] = 'failed'
        R['error'] = str(error)
        try:
            for i, context in enumerate(browser.contexts):
                for j, p in enumerate(context.pages):
                    R['failureState'] = state(p)
                    cap(p, f'failure-{i}-{j}.png')
        except Exception:
            pass
        raise
    finally:
        (OUT / 'report.json').write_text(json.dumps(R, ensure_ascii=False, indent=2))
        browser.close()
