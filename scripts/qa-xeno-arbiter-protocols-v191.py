"""Native V191 ARBITER protocol and drawn-pose browser evidence.

Only ordinary profile imports and native buttons/keys/touch change game state.
The disclosed 30000 Trials credits do not grant any ARBITER return. Genuine
campaign returns are earned and exported using the real System download.
The optional earned-profile argument accepts that exported profile together
with its provenance sidecar; it never constructs completion from receipts.
A read-only RAF observer records last-drawn receipts and copies real Canvas
pixels for short animation phases. It never replaces RAF or changes gameplay.
"""
import argparse
import ast
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from urllib.parse import unquote, urlparse

from playwright.sync_api import sync_playwright

PARSER = argparse.ArgumentParser()
PARSER.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
PARSER.add_argument('--output', type=Path, required=True)
PARSER.add_argument('--mode', choices=['campaign', 'protocols', 'combat', 'special', 'all'], default='all')
PARSER.add_argument('--earned-profile', type=Path)
PARSER.add_argument('--fighters', default='')
PARSER.add_argument('--allow-changing-sources', action='store_true')
ARGS = PARSER.parse_args()
REPO = Path(os.environ.get('ATF_QA_REPO', Path(__file__).resolve().parents[1])).resolve()
OUT = ARGS.output.resolve()
if OUT == REPO or REPO in OUT.parents:
    raise SystemExit('Keep browser evidence outside the repository.')
OUT.mkdir(parents=True, exist_ok=True)
HELPER_PATHS = ['scripts/qa-xeno-arbiter-stages-v190.py', 'scripts/qa-xeno-trials-animation-audio-v189.py',
                'scripts/qa-xeno-trials-operations-v188.py', 'scripts/qa-xeno-trials-capture-v163.py']
REPORT = {'status': 'running', 'mode': ARGS.mode, 'checks': [], 'captures': [], 'pageErrors': [], 'httpErrors': [],
          'requestFailures': [], 'httpBodies': {}, 'missions': [], 'stages': [], 'scenarios': {}, 'exports': [],
          'drawnWitnesses': {}, 'fixtures': ['An unplayed default profile is imported through System with QA name, setup complete, Lethe selected, music0/effects0.35 and 30000 Trials credits. No campaign return is prefilled; all fighter unlocks use native purchase buttons.'],
          'nativeControlMethod': 'Keyboard, native pointer/touch input; fixed-aim Shift settles mission walking before held E. A read-only RAF observer samples the existing runtime and exports the actual Canvas on the first drawn phase. Neither game state nor scheduler is replaced.',
          'limits': ['Automated Chromium inputs are not physical controller or human gameplay certification.',
                     'Admitted source poses and actually observed native poses are counted separately.',
                     'Combat animation checks stop after a natural first-round KO, then abandon; special checks are partial duels.',
                     'No actor, HP, position, velocity, match clock, RNG, objective, receipt or result is assigned.']}
R = REPORT


def inherit_functions(relative, names):
    """Reuse selected versioned helpers, without running their old CLI/main."""
    tree = ast.parse((REPO / relative).read_text())
    selected = [node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name in names]
    if {node.name for node in selected} != set(names):
        raise RuntimeError('Required native helper missing in ' + relative)
    exec(compile(ast.Module(body=selected, type_ignores=[]), str(REPO / relative), 'exec'), globals())


inherit_functions(HELPER_PATHS[0], ['node_json', 'observe', 'arbiter_state', 'trials', 'enter', 'open_view', 'open_plan',
    'release', 'advance_insertion', 'wait_mission', 'move_to', 'complete_station', 'probe_locked_route',
    'reload_checkpoint', 'verify_campaign_scenery', 'campaign_journey', 'trials_home', 'abandon_trial'])
inherit_functions(HELPER_PATHS[1], ['Keys', 'diff', 'protected'])
inherit_functions(HELPER_PATHS[2], ['Touch'])


def write_report():
    (OUT / 'report.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=2) + '\n')


def check(label, condition, evidence=None):
    if not condition:
        raise AssertionError(label)
    REPORT['checks'].append({'label': label, 'evidence': evidence})
    print('PASS ' + label, flush=True)
    write_report()


def settle_view(page):
    page.wait_for_function('''()=>[...document.querySelectorAll('.view.active')].every(e=>
      !e.getAnimations().some(a=>a.animationName==='enter'&&a.playState==='running'))''', timeout=4000)
    page.evaluate('()=>document.fonts.ready')


def capture(page, name, selector=None):
    settle_view(page)
    if name.startswith('08-local-mire'):
        details = page.locator('.xt-arbiter-dossier-v190')
        if details.is_visible() and details.get_attribute('open') is None:
            enter(page, '.xt-arbiter-dossier-v190 > summary')
        page.wait_for_function("()=>document.querySelector('[data-xt=\"arbiter-dossier\"]')?.innerText.includes('COPIE MIRE ISOLÉE')")
    if selector:
        page.locator(selector).screenshot(path=str(OUT / name))
    else:
        page.screenshot(path=str(OUT / name), full_page=True)
    REPORT['captures'].append(name)


def source_manifest():
    paths = [*REPO.glob('src/**/*.js'), *REPO.glob('*.css'), REPO / 'index.html', REPO / 'sw.js',
             REPO / 'package.json', REPO / 'package-lock.json', Path(__file__).resolve(), *[REPO / p for p in HELPER_PATHS]]
    for namespace in ['assets/openai/sprites/xeno-trials-v191', 'assets/openai/stages/xeno-trials-v190',
                      'assets/openai/campaign/xeno-arbiter-v190']:
        paths.extend(p for p in (REPO / namespace).glob('**/*') if p.is_file())
    return {str(p.relative_to(REPO)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths))}


def import_profile(page, raw, name):
    open_view(page, 'settings')
    page.locator('#save-import').set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': raw})
    expected = json.loads(raw)['player']['name']
    page.wait_for_function('name=>__ATF_V51__.saveSystem.data.player.name===name', arg=expected)


def fixture(page):
    raw = subprocess.check_output(['node', '--input-type=module', '-e',
      "import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA_ARBITER_V191';s.worldId='world-05-lethe';s.scene='command';s.settings.music=0;s.settings.effects=.35;s.settings.reducedMotion=false;s.xenoTrialsV96.credits=30000;console.log(JSON.stringify(s));"], cwd=REPO)
    (OUT / 'unplayed-credit-profile.json').write_bytes(raw)
    REPORT['initialFixtureSha256'] = hashlib.sha256(raw).hexdigest()
    import_profile(page, raw, 'unplayed-credit-profile.json')


def export_profile(page, name):
    release(page)
    open_view(page, 'settings')
    settle_view(page)
    before = observe(page)['save']
    with page.expect_download() as download_info:
        enter(page, '#save-export')
    download = download_info.value
    path = OUT / name
    download.save_as(path)
    actual = json.loads(path.read_text())
    check('Native System export ' + name + ' preserves the actual campaign and Trials state',
          actual['xenoArbiterV190'] == before['xenoArbiterV190'] and actual['xenoTrialsV96'] == before['xenoTrialsV96'])
    metadata = {'kind': 'native-system-download', 'file': name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                'completedReturns': len(actual['xenoArbiterV190']['returns']), 'player': actual['player']['name'],
                'evidenceRun': str(OUT), 'nativeMissionReturnsInThisRun': [m['return'] for m in REPORT['missions']],
                'pendingTrials': actual['xenoTrialsV96']['pending'] is not None}
    if REPORT.get('earnedProfileImport'):
        metadata['earnedProfileOrigin'] = REPORT['earnedProfileImport']
    path.with_suffix('.provenance.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    REPORT['exports'].append(metadata)
    write_report()
    return path


def use_earned_profile(page):
    path = ARGS.earned_profile.resolve()
    raw = path.read_bytes()
    provenance = json.loads(path.with_suffix('.provenance.json').read_text())
    actual = json.loads(raw)
    if (provenance['kind'] != 'native-system-download' or provenance['sha256'] != hashlib.sha256(raw).hexdigest()
        or provenance['completedReturns'] != 6 or len(actual['xenoArbiterV190']['returns']) != 6
        or provenance.get('nativeMissionReturnsInThisRun') != actual['xenoArbiterV190']['returns']):
        raise AssertionError('The earned profile must be an unchanged native System export with six genuine returns.')
    import_profile(page, raw, path.name)
    REPORT['earnedProfileImport'] = {'path': str(path), 'sha256': provenance['sha256'], 'evidenceRun': provenance['evidenceRun']}
    REPORT['fixtures'].append('The six-return profile is an unchanged native System download from the separately identified genuine campaign run; no return or ledger is reconstructed.')
    check('Import restores the six genuine exported ARBITER returns unchanged', observe(page)['save']['xenoArbiterV190'] == actual['xenoArbiterV190'])
    open_view(page, 'xenotrials')
    trials_home(page)
    capture(page, '08-local-mire-earned-profile.png')


def gate_case(page, required=True):
    open_view(page, 'xenotrials')
    trials_home(page)
    button = page.locator('[data-xt-branch="arbiter-archives"]')
    if not button.count() and not required:
        REPORT.setdefault('preparationNotes', []).append('The V191 UI branch was not yet integrated during this genuine campaign preparation.')
        return
    check('The archive catalog explains the six-return requirement before acquisition', button.count() == 1 and '0/6' in button.inner_text())
    before = trials(page)['progress']
    enter(page, '[data-xt-branch="arbiter-archives"]')
    cards = page.locator('[data-xt-activity]')
    check('The visible archive programs are natively disabled before six validated returns', cards.count() > 0
          and all(cards.nth(i).is_disabled() for i in range(cards.count())))
    box = cards.first.bounding_box()
    page.mouse.click(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
    page.wait_for_timeout(100)
    check('A native attempt at the locked archives creates no ticket, serial, payment or reward', trials(page)['progress'] == before and before['pending'] is None)
    trials_home(page)
    check('The historical on-demand program stays accessible before archive acquisition', not page.locator('[data-xt-branch="on-demand"]').is_disabled())
    for branch, expected in [('horde', 80), ('operations', 40)]:
        enter(page, '[data-xt-branch="' + branch + '"]')
        count = page.locator('[data-xt="activity-count"]').inner_text()
        check('The historical ' + branch + ' board keeps its original ' + str(expected) + ' programs before acquisition', count.startswith(str(expected)))
        trials_home(page)
    open_view(page, 'settings')
    page.locator('#language-select-v185').select_option('en')
    open_view(page, 'xenotrials')
    page.wait_for_function("()=>document.querySelector('[data-xt-branch=\"arbiter-archives\"]')?.innerText.includes('ARBITER ARCHIVES')")
    enter(page, '[data-xt-branch="arbiter-archives"]')
    page.wait_for_function("()=>document.querySelector('[data-xt-activity]')?.innerText.includes('SEALED')")
    check('The real English catalog translates the closed archive and its dynamic six-return notice',
          '0/6' in page.locator('[data-xt="activity-count"]').inner_text() and 'SEALED' in page.locator('[data-xt-activity]').first.inner_text())
    capture(page, 'archive-gate-closed-english.png')
    open_view(page, 'settings')
    page.locator('#language-select-v185').select_option('fr')


CATALOG = node_json("import{XENO_TRIALS_FIGHTERS_V96 as f,getXenoTrialsArtV96 as a}from'./src/xeno-trials-data-v96.js';console.log(JSON.stringify(f.map(x=>({id:x.id,label:x.label,hp:x.hp,family:x.family,profileId:x.profileId,artPath:a(x.id).path}))));")
BY_ID = {entry['id']: entry for entry in CATALOG}


def wait_active(page):
    page.wait_for_function('()=>{const m=__ATF_XENO_TRIALS_V96__.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation}', timeout=45000)
    page.locator('[data-xt="canvas"]').focus()


def buy_profile(page, fighter_id):
    page.locator('[data-xt="search"]').fill(BY_ID[fighter_id]['label'])
    before = trials(page)['progress']
    if fighter_id not in before['unlocked']:
        enter(page, '[data-xt-unlock="' + fighter_id + '"]')
        after = trials(page)['progress']
        check(fighter_id + ': native purchase unlocks only the selected fighter and debits its real price', fighter_id in after['unlocked'] and after['credits'] < before['credits'])
    enter(page, '[data-xt-fighter="' + fighter_id + '"]')


def start_duel(page, fighter_id, opponent='ultramorph'):
    open_view(page, 'xenotrials')
    trials_home(page)
    enter(page, '[data-xt-branch="on-demand"]')
    page.locator('[name="opponentFamily"]').select_option(BY_ID[opponent]['family'])
    page.locator('[name="opponentId"]').select_option(opponent)
    page.locator('[name="difficulty"]').select_option('easy')
    enter(page, '[data-xt="confirm-target"]')
    buy_profile(page, fighter_id)
    enter(page, '[data-xt="confirm-fighters"]')
    enter(page, '[data-xt="start"]')
    wait_active(page)


POSE_OBSERVER = r'''fighterId=>{
  globalThis.__QA_POSES_V191__?.stop();
  const records={},images={},baseline={fighterId},phaseOf=id=>id.startsWith('special-windup')?'windup':id.startsWith('special-active')?'contact':id.startsWith('special-recovery')?'recovery':null;
  let alive=true,raf=null,startupWitness=null;
  function step(){
    if(!alive)return;
    const m=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;
    if(m){for(const r of m.rigViewsV154||[]){const a=r.spriteAtlasV191;if(!a||r.side!=='player'||a.fighterId!==fighterId)continue;
      const f=m.fighters.find(f=>f.side==='player'),key=a.fighterId+':'+a.kind+':'+a.frameId;
      if(!startupWitness&&fighterId==='prowler'&&globalThis.__QA_STARTUP_WITNESS_V191__)startupWitness=__QA_STARTUP_WITNESS_V191__(m,f,r);
      if(!records[key])records[key]={tick:m.tick,receipt:r,actor:{id:f.id,x:f.x,y:f.y,vy:f.vy,hp:f.hp,stamina:f.stamina,attack:f.attack,guard:f.guard},camera:m.cameraV119};
      const phase=a.kind==='special'?phaseOf(a.frameId):(['windup','contact','recovery'].includes(a.phase)?a.phase:null);
      if(phase&&!images[phase]){const canvas=document.querySelector('[data-xt="canvas"]');images[phase]={tick:m.tick,frameId:a.frameId,png:canvas.toDataURL('image/png')};}
    }}raf=requestAnimationFrame(step);
  }
  globalThis.__QA_POSES_V191__={read:()=>({records,images,baseline,startupWitness}),stop(){alive=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;}};
  raf=requestAnimationFrame(step);
}'''


def start_pose_observer(page, fighter_id):
    tree = ast.parse((REPO / HELPER_PATHS[3]).read_text())
    assigned = next(node for node in tree.body if isinstance(node, ast.Assign)
                    and any(isinstance(target, ast.Name) and target.id == 'DRAWN_STARTUP_WITNESS_V191' for target in node.targets))
    witness = ast.literal_eval(assigned.value)
    page.evaluate('()=>{globalThis.__QA_STARTUP_WITNESS_V191__=(' + witness + ');}')
    page.evaluate(POSE_OBSERVER, fighter_id)


def finish_pose_observer(page, label):
    payload = page.evaluate('()=>{const q=__QA_POSES_V191__;q.stop();return q.read()}')
    for key, value in payload['records'].items():
        REPORT['drawnWitnesses'].setdefault(key, {'scenario': label, **value})
    image_receipts = {}
    for phase, value in payload['images'].items():
        name = label + '-' + phase + '-native-canvas.png'
        (OUT / name).write_bytes(base64.b64decode(value['png'].split(',', 1)[1]))
        REPORT['captures'].append(name)
        image_receipts[phase] = {'file': name, 'tick': value['tick'], 'frameId': value['frameId'], 'method': 'Read-only pixel export of the actual native game Canvas.'}
    return {'records': payload['records'], 'phaseImages': image_receipts, 'independentStartupWitness': payload['startupWitness']}


def body_gap(page, match):
    return page.evaluate("async fs=>(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyGapV105(fs[0],fs[1])", match['fighters'][:2])


def combat_cases(page):
    ids = ARGS.fighters.split(',') if ARGS.fighters else ['defender', 'chrysalis', 'smasher', 'user-brute']
    for fighter_id in ids:
        label = 'combat-' + fighter_id
        start_duel(page, fighter_id)
        start_pose_observer(page, fighter_id)
        page.wait_for_timeout(120)
        keys = Keys(page)
        page.keyboard.down('KeyS')
        page.wait_for_timeout(180)
        page.keyboard.up('KeyS')
        last_attack = -1000
        deadline = time.monotonic() + 14
        while time.monotonic() < deadline:
            match = trials(page)['match']
            player, enemy = match['fighters'][:2]
            phases = page.evaluate('()=>Object.keys(__QA_POSES_V191__.read().images)')
            if len(phases) == 3 or player['hp'] <= 0:
                break
            gap = body_gap(page, match)
            keys.use(['ArrowRight' if enemy['x'] > player['x'] else 'ArrowLeft'] if gap > 30 else [])
            if gap < 125 and not player['attack'] and player['stun'] <= 0 and match['tick'] - last_attack >= 180:
                page.keyboard.press('KeyK', delay=35)
                last_attack = match['tick']
            page.wait_for_timeout(18)
        keys.clear()
        deadline = time.monotonic() + 90
        while time.monotonic() < deadline:
            match = trials(page)['match']
            records = page.evaluate('()=>__QA_POSES_V191__.read().records')
            if any(r['receipt']['spriteAtlasV191']['frameId'] == 'ko-ground' and r['actor']['hp'] <= 0 for r in records.values()):
                break
            if match['phase'] == 'match-over':
                break
            page.wait_for_timeout(35)
        observed = finish_pose_observer(page, label)
        values = list(observed['records'].values())
        frames = {r['receipt']['spriteAtlasV191']['frameId'] for r in values}
        check(fighter_id + ': accepted heavy attack uses drawn windup, contact and recovery', set(observed['phaseImages']) == {'windup', 'contact', 'recovery'}, observed['phaseImages'])
        check(fighter_id + ': native guarding uses its new drawn stance', 'guard' in frames)
        check(fighter_id + ': real enemy damage selects the recoil drawing', any(r['receipt']['spriteAtlasV191']['frameId'] == 'hit-recoil' and r['actor']['hp'] < BY_ID[fighter_id]['hp'] for r in values))
        check(fighter_id + ': a natural first-round defeat draws falling and grounded KO', {'ko-fall', 'ko-ground'} <= frames
              and any(r['receipt']['spriteAtlasV191']['frameId'] == 'ko-ground' and r['actor']['hp'] <= 0 for r in values))
        capture(page, label + '-natural-first-round-ko.png')
        REPORT['scenarios'][label] = {**observed, 'ending': 'Natural first-round KO followed by native abandonment, not a complete match victory.'}
        abandon_trial(page)


def special_cases(page):
    ids = ARGS.fighters.split(',') if ARGS.fighters else ['warrior', 'runner', 'prowler', 'spitter']
    for fighter_id in ids:
        label = 'special-' + fighter_id
        start_duel(page, fighter_id)
        start_pose_observer(page, fighter_id)
        page.keyboard.press('KeyL', delay=30)
        deadline = time.monotonic() + 5
        while time.monotonic() < deadline:
            current = page.evaluate('()=>({phases:Object.keys(__QA_POSES_V191__.read().images),attack:__ATF_XENO_TRIALS_V96__.snapshot().match?.fighters[0].attack})')
            if len(current['phases']) == 3 and not current['attack']:
                break
            page.wait_for_timeout(20)
        observed = finish_pose_observer(page, label)
        check(fighter_id + ': one real accepted special draws all three native phases', set(observed['phaseImages']) == {'windup', 'contact', 'recovery'}, observed['phaseImages'])
        values = list(observed['records'].values())
        check(fighter_id + ': special pictures follow the actual special attack rather than replacing another action',
              values and all(r['actor']['attack'] is not None and r['actor']['attack']['kind'] == 'special' for r in values))
        if fighter_id == 'prowler':
            airborne = [r for r in values if r['receipt']['spriteAtlasV191']['frameId'].startswith('special-active')]
            check('Prowler drawn active keys require the real native leap above the floor', airborne and all(r['actor']['y'] > 0 and not r['receipt']['spriteAtlasV191']['grounded'] for r in airborne))
            check('The independent capture-workbench observer recognizes the same real drawn Prowler startup',
                  observed['independentStartupWitness'] is not None and observed['independentStartupWitness']['kind'] == 'drawn-atlas-v191', observed['independentStartupWitness'])
        REPORT['scenarios'][label] = {**observed, 'ending': 'Accepted native special, then abandonment; no victory claimed.'}
        abandon_trial(page)


def response_receipt(response):
    path = unquote(urlparse(response.url).path).lstrip('/')
    if response.status >= 400:
        REPORT['httpErrors'].append({'url': response.url, 'status': response.status})
    if not any(version in path for version in ['v190', 'v191']) or not path.endswith(('.js', '.png', '.webp', '.css')):
        return
    local = REPO / path
    if local.is_file():
        try:
            body = response.body()
            REPORT['httpBodies'][path] = {'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(), 'matchesDisk': body == local.read_bytes()}
        except Exception as error:
            REPORT.setdefault('responseReceiptErrors', []).append({'path': path, 'error': str(error)})


def protocol_cases(page):
    open_view(page, 'settings')
    page.locator('#language-select-v185').select_option('en')
    open_view(page, 'xenotrials')
    trials_home(page)
    check('Six genuine campaign returns are present before starting recovered programs',
          len(observe(page)['save']['xenoArbiterV190']['returns']) == 6)
    programs = node_json("import{ARBITER_PROGRAMS_V191 as p}from'./src/xeno-arbiter-protocols-v191.js';console.log(JSON.stringify(p));")
    enter(page, '[data-xt-branch="arbiter-archives"]')
    page.wait_for_function("()=>document.querySelector('[data-xt=\"activity-count\"]')?.innerText.includes('20 OPERATIONS')")
    check('The native English recovered counter shows its translated forty-program status',
          '40 DOSSIERS / 20 HORDES / 20 OPERATIONS' in page.locator('[data-xt="activity-count"]').inner_text())
    check('The native recovered-program cards become enabled after the actual six returns',
          page.locator('[data-xt-activity]').count() > 0 and not page.locator('[data-xt-activity]').first.is_disabled())
    found, pages = [], []
    while True:
        found.extend(page.locator('[data-xt-activity]').evaluate_all('(es)=>es.map(e=>e.dataset.xtActivity)'))
        pages.append(page.locator('[data-xt="program-page"]').inner_text())
        if page.locator('[data-xt="program-next"]').is_disabled():
            break
        enter(page, '[data-xt="program-next"]')
    check('The native archive board exposes forty unique programs on four real pages',
          len(found) == 40 and len(set(found)) == 40 and len(pages) == 4 and set(found) == {p['id'] for p in programs},
          {'ids': found, 'pages': pages})
    check('Recovered archive programs contain twenty hordes and twenty physical-objective operations',
          sum(p['branch'] == 'horde' for p in programs) == 20 and sum(p['branch'] == 'operations' for p in programs) == 20)
    REPORT['programBoard'] = {'ids': found, 'pages': pages}
    capture(page, 'archive-forty-program-board-english.png')
    open_view(page, 'settings')
    page.locator('#language-select-v185').select_option('fr')
    open_view(page, 'xenotrials')
    trials_home(page)
    start_program(page, 'xth191-arbiter-vault-1')
    before = trials(page)['progress']
    check('A recovered horde uses its canonical native horde ticket and corporate setting',
          before['pending']['config']['activityV119']['branch'] == 'horde'
          and before['pending']['config']['stageId'] == 'xt190-adjudication-vault')
    ended = clear_contacts(page, 'archive-horde-native-win', terminal=True)
    check('Native keyboard combat completes the new twelve-contact two-wave horde',
          ended['result']['winner'] == 'player' and ended['result']['hordeV180']['kills'] == 12
          and ended['result']['hordeV180']['wavesCleared'] == 2, ended['result'])
    settle_and_reload(page, 'archive-horde-native-win', before, ended)
    start_program(page, 'xto191-arbiter-vault-escort')
    before = trials(page)['progress']
    ended = run_objective(page, 'archive-escort-native-win', checkpoint=True, touch=True)
    check('The new archive escort wins through real cargo interaction and extraction',
          ended['result']['winner'] == 'player' and ended['operationV188']['status'] == 'completed', ended['result'])
    settle_and_reload(page, 'archive-escort-native-win', before, ended)
    open_view(page, 'settings')
    page.locator('#setting-motion').check()
    check('The real accessibility control persists reduced motion before the second archive operation',
          observe(page)['save']['settings']['reducedMotion'] is True)
    open_view(page, 'xenotrials')
    start_program(page, 'xto191-arbiter-vault-relay')
    before = trials(page)['progress']
    clean = clear_contacts(page, 'archive-relay-pressure-cleared')
    check('The relay pressure is cleared only through accepted native attacks', clean['hordeV180']['phase'] == 'complete'
          and clean['hordeV180']['totalKills'] == clean['hordeV180']['totalEnemies'] and clean['operationV188']['status'] == 'active')
    hazard_probe(page)
    ended = run_objective(page, 'archive-relay-native-win', touch=True)
    check('The new archive relay wins after all three real stations are charged', ended['result']['winner'] == 'player'
          and all(ended['operationV188']['completed']), ended['result'])
    settle_and_reload(page, 'archive-relay-native-win', before, ended)
    open_view(page, 'settings')
    page.locator('#setting-motion').uncheck()
    export_profile(page, 'earned-protocol-results-profile.json')
    page.set_viewport_size({'width': 1440, 'height': 1000})


def choose_program(page, program_id):
    while not page.locator('[data-xt-activity="' + program_id + '"]').count():
        if page.locator('[data-xt="program-next"]').is_disabled():
            raise AssertionError('Program absent from the native board: ' + program_id)
        enter(page, '[data-xt="program-next"]')
    enter(page, '[data-xt-activity="' + program_id + '"]')


def start_program(page, program_id):
    open_view(page, 'xenotrials')
    trials_home(page)
    enter(page, '[data-xt-branch="arbiter-archives"]')
    choose_program(page, program_id)
    if not REPORT.get('rosterBoard'):
        roster_pages(page)
    buy_profile(page, 'queen')
    enter(page, '[data-xt="confirm-fighters"]')
    prior = trials(page)['progress']
    enter(page, '[data-xt="start"]')
    wait_active(page)
    current = trials(page)['progress']
    check(program_id + ': start creates one canonical ticket without an entry charge',
          current['serial'] == prior['serial'] + 1 and current['credits'] == prior['credits']
          and current['pending']['config']['activityV119']['id'] == program_id
          and current['pending']['config']['activityV119']['branch'] == ('horde' if program_id.startswith('xth') else 'operations'))


def roster_pages(page):
    enter(page, '[data-xt="reset-filters"]')
    found, pages = [], []
    while True:
        found.extend(page.locator('[data-xt-fighter]').evaluate_all('(es)=>es.map(e=>e.dataset.xtFighter)'))
        pages.append(page.locator('[data-xt="roster-page"]').inner_text())
        if page.locator('[data-xt="roster-next"]').is_disabled():
            break
        enter(page, '[data-xt="roster-next"]')
    check('The recovered-program roster preserves all189 exact fighter IDs on five native pages of40',
          len(found) == 189 and len(set(found)) == 189 and len(pages) == 5 and set(found) == set(BY_ID),
          {'ids': found, 'pages': pages})
    REPORT['rosterBoard'] = {'ids': found, 'pages': pages}
    enter(page, '[data-xt="reset-filters"]')


def geometry(page, match):
    return page.evaluate("async fs=>{const m=await import('/src/xeno-trials-geometry-v105.js');return fs.map(f=>m.getXenoTrialsBodyBoundsV105(f));}", match['fighters'])


def clear_contacts(page, label, terminal=False, limit=155):
    keys = Keys(page)
    heavy, light, special = -1000, -1000, -1000
    deadline = time.monotonic() + limit
    page.locator('[data-xt="canvas"]').focus()
    samples = []
    while time.monotonic() < deadline:
        match = trials(page)['match']
        if match['phase'] == 'match-over' or not terminal and match['hordeV180']['phase'] == 'complete':
            keys.clear()
            REPORT['scenarios'][label] = {'result': match.get('result'), 'horde': match['hordeV180'], 'samples': samples,
                                         'ending': 'Complete native horde victory.' if terminal else 'All pressure cleared; objective remains active.'}
            if terminal:
                capture(page, label + '.png')
            return match
        if match['paused'] or match['presentation']['blocksSimulation'] or match['hordeV180']['phase'] != 'active' or len(match['fighters']) < 2:
            keys.clear()
            page.wait_for_timeout(45)
            continue
        player = match['fighters'][0]
        enemies = sorted(match['fighters'][1:], key=lambda f: abs(f['x'] - player['x']))
        nearest = enemies[0]
        bodies = geometry(page, {'fighters': [player, nearest]})
        gap = max(0, bodies[1]['left'] - bodies[0]['right'], bodies[0]['left'] - bodies[1]['right'])
        keys.use(['ArrowRight' if nearest['x'] > player['x'] else 'ArrowLeft'] if gap > 40 else [])
        if gap < 125 and not player['attack'] and player['stun'] <= 0:
            if match['tick'] - heavy >= 180 and player['stamina'] >= 25:
                page.keyboard.press('KeyK', delay=35)
                heavy = match['tick']
            elif match['tick'] - light >= 180 and match['tick'] - heavy >= 75 and player['stamina'] >= 12:
                page.keyboard.press('KeyJ', delay=35)
                light = match['tick']
            elif match['tick'] - special >= 300 and match['tick'] - heavy >= 90 and player['stamina'] >= 25:
                page.keyboard.press('KeyL', delay=35)
                special = match['tick']
        if not samples or match['hordeV180']['totalKills'] != samples[-1]['kills']:
            samples.append({'tick': match['tick'], 'kills': match['hordeV180']['totalKills'], 'hp': player['hp']})
        page.wait_for_timeout(35)
    keys.clear()
    raise AssertionError('Native keyboard combat exceeded its budget: ' + label)


def pause_trial(page):
    page.locator('[data-xt="canvas"]').focus()
    if not trials(page)['match']['paused']:
        page.keyboard.press('KeyP')
        page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().match.paused')


def reload_system(page):
    page.reload(wait_until='domcontentloaded')
    enter(page, '#title-start')
    enter(page, '#title-options')
    settle_view(page)


def restore_checkpoint(page):
    pause_trial(page)
    release(page)
    paused = trials(page)
    checkpoint = paused['progress']['pending']['checkpointV186']
    expected = protected(checkpoint['snapshot'], checkpoint['snapshot'].keys())
    delta = diff(expected, protected(paused['match'], checkpoint['snapshot'].keys()))
    check('Native archive pause stores the exact objective, horde, actor and physical-hazard checkpoint',
          not delta and checkpoint['snapshot']['operationV188']['cargoTravelTicks'] > 0, delta)
    (OUT / 'archive-native-checkpoint.json').write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + '\n')
    capture(page, 'archive-checkpoint-paused.png')
    open_view(page, 'settings')
    reload_system(page)
    open_view(page, 'xenotrials')
    check('The real page reload retains the canonical pending ticket and checkpoint without a reward',
          trials(page)['progress']['pending']['checkpointV186'] == checkpoint and trials(page)['progress']['ledger'] == paused['progress']['ledger'])
    enter(page, '[data-xt="restart"]')
    page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().match?.resumedV186===true')
    restored = trials(page)['match']
    check('The recovered archive restores every admitted checkpoint field in pause', restored['paused']
          and not diff(expected, protected(restored, checkpoint['snapshot'].keys())))
    page.wait_for_timeout(180)
    check('The restored pause freezes objective, horde, actors and danger cadence',
          not diff(expected, protected(trials(page)['match'], checkpoint['snapshot'].keys())))
    page.set_viewport_size({'width': 390, 'height': 844})
    capture(page, 'archive-checkpoint-mobile.png')
    enter(page, '[data-xt="resume-overlay"]')
    wait_active(page)
    REPORT['archiveCheckpoint'] = {'tick': checkpoint['tick'], 'operationId': checkpoint['snapshot']['operationV188']['operationId'],
                                   'comparedFields': list(checkpoint['snapshot']), 'fixtureExclusions': ['paused and accumulator canonicalized', 'player previousInput/rearmControls only']}


def run_objective(page, label, checkpoint=False, touch=False, limit=155):
    keys = Keys(page)
    toucher = Touch(page) if touch else None
    deadline = time.monotonic() + limit
    checkpoint_done = False
    touch_witness = None
    page.locator('[data-xt="canvas"]').focus()
    try:
        while time.monotonic() < deadline:
            match = trials(page)['match']
            operation = match['operationV188']
            player = match['fighters'][0]
            if match['phase'] == 'match-over':
                keys.clear()
                if toucher:
                    toucher.use(False)
                REPORT['scenarios'][label] = {'result': match['result'], 'operation': operation, 'touchWitness': touch_witness,
                                             'ending': 'Complete native physical-objective result.'}
                if touch:
                    check(label + ': trusted touch input reaches the real interaction control and advances its objective',
                          touch_witness is not None and touch_witness['input']['interact'] is True, touch_witness)
                capture(page, label + '.png')
                return match
            if match['paused'] or match['presentation']['blocksSimulation']:
                keys.clear()
                page.wait_for_timeout(45)
                continue
            if checkpoint and not checkpoint_done and operation['cargoTravelTicks'] >= 180:
                keys.clear()
                if toucher:
                    toucher.use(False)
                restore_checkpoint(page)
                checkpoint_done = True
                continue
            target = match['operationViewV188']['target']
            bounds = geometry(page, {'fighters': [player]})[0]
            destination = operation['cargoX'] + 45 if operation['operationId'].endswith('-escort') else target['x']
            dx = destination - bounds['center']
            moving = abs(dx) > 35
            wanted = {'ArrowRight' if dx > 0 else 'ArrowLeft'} if moving else set()
            interact = operation['operationId'].endswith('-escort') or not moving
            if toucher:
                toucher.use(interact)
                if interact and player['previousInput'].get('interact') and any(operation['progress']) and touch_witness is None:
                    touch_witness = {'tick': match['tick'], 'input': player['previousInput'], 'operation': operation}
                    capture(page, label + '-trusted-touch.png')
            elif interact:
                wanted.add('KeyE')
            keys.use(wanted)
            page.wait_for_timeout(45)
        raise AssertionError('Native objective exceeded its budget: ' + label)
    finally:
        keys.clear()
        if toucher:
            toucher.use(False)


def settle_and_reload(page, label, before, ended):
    page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
    settled = trials(page)['progress']
    entry = settled['ledger'][-1]
    check(label + ': exactly one settled ticket pays its actual unique native prime',
          len(settled['ledger']) == len(before['ledger']) + 1 and entry['winner'] == 'player'
          and settled['credits'] == before['credits'] + entry['credits'] and settled['pending'] is None,
          {'ledgerEntry': entry, 'beforeCredits': before['credits'], 'afterCredits': settled['credits']})
    open_view(page, 'settings')
    reload_system(page)
    open_view(page, 'xenotrials')
    check(label + ': page reload preserves the exact result and cannot pay it twice', trials(page)['progress'] == settled and trials(page)['match'] is None)
    REPORT.setdefault('settlements', []).append({'scenario': label, 'ledger': entry, 'credits': settled['credits']})


def hazard_probe(page):
    keys = Keys(page)
    first = trials(page)['match']
    baseline = first['stageHazardsV188']['playerDamage']
    definition = node_json("import{getXenoTrialsStageHazardV188 as g}from'./src/xeno-trials-stage-hazards-v188.js';console.log(JSON.stringify(g('xt190-adjudication-vault')));")
    seed = first['stageHazardsV188']['seed']
    hit, avoid = None, None
    deadline = time.monotonic() + 55
    page.locator('[data-xt="canvas"]').focus()
    try:
        while time.monotonic() < deadline:
            match = trials(page)['match']
            hazard = match['stageHazardViewV188']
            bounds = geometry(page, {'fighters': [match['fighters'][0]]})[0]
            if match['result']:
                raise AssertionError('The physical hazard probe reached an unintended terminal outcome.')
            if hit is None and match['stageHazardsV188']['playerDamage'] > baseline:
                hit = {'tick': match['tick'], 'damage': match['stageHazardsV188']['playerDamage'] - baseline,
                       'hp': match['fighters'][0]['hp'], 'hazard': hazard}
                keys.clear()
                capture(page, 'archive-real-hazard-contact.png')
            if avoid and match['tick'] >= avoid['endsTick']:
                avoid.update({'endsDamage': match['stageHazardsV188']['playerDamage'], 'body': bounds, 'endTick': match['tick']})
                break
            if not hazard:
                keys.clear()
                page.wait_for_timeout(40)
                continue
            if hit is None:
                if not hazard['zones']:
                    keys.clear()
                    page.wait_for_timeout(40)
                    continue
                zone = hazard['zones'][0]
                destination = (zone['left'] + zone['right']) / 2
            elif avoid is None:
                # Move to the next authored warning band during the idle gap,
                # then actually withdraw from that band after its warning.
                next_cycle = hit['hazard']['cycle'] + 1
                destination = definition['anchors'][(next_cycle + seed % len(definition['anchors'])) % len(definition['anchors'])]
                if hazard['cycle'] > hit['hazard']['cycle'] and hazard['phase'] == 'warning' and hazard['zones']:
                    zone = hazard['zones'][0]
                    half_width = max(bounds['center'] - bounds['left'], bounds['right'] - bounds['center'])
                    safe = zone['left'] - half_width - 45 if bounds['center'] <= (zone['left'] + zone['right']) / 2 else zone['right'] + half_width + 45
                    avoid = {'cycle': hazard['cycle'], 'startsDamage': match['stageHazardsV188']['playerDamage'], 'warningTick': match['tick'],
                             'startsTick': hazard['startsTick'], 'endsTick': hazard['endsTick'], 'from': bounds, 'hazard': hazard,
                             'safeDestination': max(100, min(1250, safe))}
                    capture(page, 'archive-physical-warning-reduced-motion.png')
                    destination = avoid['safeDestination']
            else:
                destination = avoid['safeDestination']
                if hazard['cycle'] == avoid['cycle'] and hazard['phase'] == 'active':
                    avoid['hazard'] = hazard
            dx = destination - bounds['center']
            keys.use(['ArrowRight' if dx > 0 else 'ArrowLeft'] if abs(dx) > 30 else [])
            page.wait_for_timeout(40)
    finally:
        keys.clear()
    check('A new corporate physical hazard damages the real fighter at its accepted contact', hit is not None and hit['damage'] == 6, hit)
    check('Native movement during the following warning avoids its entire active window', avoid is not None and 'endTick' in avoid
          and avoid['startsDamage'] == avoid['endsDamage']
          and avoid['from']['left'] < avoid['hazard']['zones'][0]['right'] and avoid['from']['right'] > avoid['hazard']['zones'][0]['left']
          and abs(avoid['body']['center'] - avoid['from']['center']) > 50
          and (avoid['body']['right'] <= avoid['hazard']['zones'][0]['left'] or avoid['body']['left'] >= avoid['hazard']['zones'][0]['right']), avoid)
    scene = trials(page)['match']['stageSceneV190']['rear']
    check('Reduced motion suppresses cosmetic background events while physical danger warnings remain meaningful', scene['reducedMotion']
          and not scene['drawnEvents'] and hit['hazard']['phase'] == 'active')
    REPORT['scenarios']['archive-hazards'] = {'contact': hit, 'dodge': avoid, 'reducedMotionScene': scene}


before = source_manifest()
(OUT / 'source-start.json').write_text(json.dumps(before, indent=2) + '\n')
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, has_touch=True, service_workers='block', accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: REPORT['pageErrors'].append(str(error)))
    page.on('response', response_receipt)
    page.on('requestfailed', lambda request: REPORT['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        page.goto(ARGS.base, wait_until='domcontentloaded')
        enter(page, '#title-start')
        enter(page, '#title-options')
        fixture(page)
        if ARGS.mode in ['campaign', 'protocols', 'all']:
            gate_case(page, required=ARGS.mode != 'campaign')
            if ARGS.earned_profile:
                use_earned_profile(page)
                export_profile(page, 'earned-six-return-profile.json')
            else:
                campaign_journey(page)
                export_profile(page, 'earned-six-return-profile.json')
        if ARGS.mode in ['protocols', 'all']:
            protocol_cases(page)
        if ARGS.mode in ['combat', 'all']:
            combat_cases(page)
        if ARGS.mode in ['special', 'all']:
            special_cases(page)
        atlases = node_json("import{XENO_TRIALS_SPRITE_ATLASES_V191 as a}from'./src/xeno-trials-sprite-atlas-v191.js';console.log(JSON.stringify(a.map(x=>({fighterId:x.fighterId,kind:x.kind,path:x.texture.path,frames:x.frames.map(f=>f.id)}))));")
        REPORT['animationCoverage'] = {'admittedAtlases': len(atlases), 'admittedFrames': sum(len(a['frames']) for a in atlases),
            'observedDistinctV191Frames': len(REPORT['drawnWitnesses']),
            'observedByFighter': {fighter: sum(k.startswith(fighter + ':') for k in REPORT['drawnWitnesses']) for fighter in sorted({a['fighterId'] for a in atlases})},
            'scope': 'Admission counts come from the reviewed source registry. Native observations are distinct last-draw receipts, not all admitted source pixels.'}
        if ARGS.mode == 'all':
            observed_pngs = {p for p in REPORT['httpBodies'] if p.startswith('assets/openai/sprites/xeno-trials-v191/') and p.endswith('.png')}
            check('The eight new atlas PNG responses match the eight actual admitted textures',
                  len(atlases) == 8 and sum(len(a['frames']) for a in atlases) == 80
                  and observed_pngs == {a['path'].lstrip('/') for a in atlases})
        export_profile(page, 'final-native-profile.json')
        check('Chromium reports no JavaScript, HTTP or request failures', not REPORT['pageErrors'] and not REPORT['httpErrors'] and not REPORT['requestFailures'])
        check('Every received V190/V191 module and PNG matches its actual source bytes', REPORT['httpBodies'] and all(v['matchesDisk'] for v in REPORT['httpBodies'].values()) and not REPORT.get('responseReceiptErrors'))
        after = source_manifest()
        changed = sorted(p for p in set(before) | set(after) if before.get(p) != after.get(p))
        REPORT['sourceReceipt'] = {'beforeFiles': len(before), 'afterFiles': len(after), 'unchanged': not changed, 'changed': changed,
                                   'harnessSha256': before[str(Path(__file__).resolve().relative_to(REPO))]}
        if not ARGS.allow_changing_sources:
            check('All browser-owned sources and admitted V191 PNGs remain frozen through the run', not changed)
        REPORT['status'] = 'exploratory-passed' if ARGS.allow_changing_sources else 'passed'
    except Exception as error:
        REPORT['status'] = 'failed'
        REPORT['error'] = str(error)
        try:
            capture(page, 'failure.png')
            REPORT['failureState'] = {'campaign': observe(page), 'trials': trials(page)}
        except Exception:
            pass
        raise
    finally:
        write_report()
        browser.close()
