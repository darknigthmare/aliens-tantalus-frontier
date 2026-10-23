"""Native Idris/Leila service routes via disclosed05h Save imports, actual
strategy/research commands, walking/E, leaf phases, exit/reload and return.
Browser evaluations observe engine/canvas; no actor, clock or method writes.
"""
import argparse
import base64
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--route', choices=['all', 'idris-engine', 'leila-galley'], default='all')
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
ROUTES = [
    {'id': 'idris-engine', 'crew': 'crew-03-idris-kwan', 'speaker': 'Kwan', 'deck': 3,
     'parent': 'reactor', 'annex': 'engine-room', 'home': 1886, 'post': 1407.9507829977629,
     'parentDoor': 1678, 'annexDoor': 122, 'hour': 9, 'returnHour': 12,
     'action': '[data-strategy-action="colony-relief"]', 'returnAction': '[data-strategy-action="frontier-recon"]'},
    {'id': 'leila-galley', 'crew': 'crew-15-leila-s-rensen', 'speaker': 'Sørensen', 'deck': 1,
     'parent': 'mess', 'annex': 'galley-service', 'home': 1955, 'post': 417,
     'parentDoor': 1488, 'annexDoor': 122, 'hour': 17, 'returnHour': 20,
     'action': '[data-research-id="xeno-containment"]', 'returnAction': '[data-strategy-action="frontier-recon"]'}]
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'comparisonStage': args.comparison_stage, 'routes': [],
          'method': 'Disclosed05h native Save imports; native4h strategy(Idris) or12h research(Leila), keyboard/E, portal occupation, real exit/reload/resume. Evaluations only observe.',
          'limitations': ['Automated native controls, not human participants.',
                         'Two bounded parent/annex routes; no lift or cross-deck locomotion claimed.',
                         'Native strategy elapsed hours are not observed walking hours.',
                         'Source/destination coordinates change behind fully covering native leaves, not drawn back-facing locomotion.',
                         'Subsequent native timetable handoffs explicitly have observedTravel:false.',
                         'Leila fixture adds30research/2pathogen solely to afford the real12h research command.',
                         'No new art, canonical motion or artistic1:1 approval. Before-stage images are comparisons, not V161 feature checks.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


OBSERVE = '''c => {
 const h=__ATF_HUB__,snap=h.getSnapshot(),r=snap.npcServiceRoutesV161?.routes?.[c.id]||null;
 const annex=h.currentAnnexV71?.()?.id||null, visible=annex?h.activeAnnexNpcsV141():h.npcs;
 const a=h.getNpcServiceActorV161?.(c.id)||visible.find(n=>n.crewId===c.crew)||null;
 return {route:r?structuredClone(r):null,running:h.running,deck:h.state.deck,annex,
  player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health},
  camera:{...h.camera},clock:structuredClone(h.npcRoutineContextV62.clock),
  actualActor:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,vx:a.vx,facing:a.facing,
    animation:structuredClone(a.v52Animation||null),human:structuredClone(a.humanVisualV133||null)}:null,
  visibleCount:visible.filter(n=>n.crewId===c.crew).length,
  visibleSingleton:visible.filter(n=>n.crewId===c.crew).every(n=>n===a),
  interaction:structuredClone(h.hubNpcInteractions[c.crew]||null),
  inputGuards:{keys:[...(h.keys||[])],activeElement:document.activeElement?.id||document.activeElement?.tagName,
    transition:Boolean(h.annexTransitionV71),closing:Boolean(h.hubDoorClosingV142),readOnly:Boolean(h.annexStateReadOnlyV87),
    nearestCrew:h.nearestAnnexNpcV141?.()?.crewId||null,playerAlive:h.player.alive,playerVx:h.player.vx,
    training:Boolean(h.hubTrainingV132?.active)},
  prompt:h.statusPrompt(),action:h.nearestInteraction()?.action||null,
  doors:[...(h.hubDoorDrawsV142?.values()||[])].filter(d=>d.annexId===c.annex),
  strategy:{serial:__ATF_V51__.saveSystem.data.strategy.serial,actions:__ATF_V51__.saveSystem.data.statistics.strategicActions}};
}'''


def observed(page, config):
    return page.evaluate(OBSERVE, config)


def capture(page, name):
    page.locator('#hub-canvas').screenshot(path=str(output / name))
    report['captures'].append(name)


def open_view(page, view):
    menu = page.locator('#mobile-menu')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'[data-view="{view}"]').click()


def open_hub(page, config, art=True):
    open_view(page, 'hub')
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    if args.comparison_stage == 'after':
        page.wait_for_function('id=>__ATF_HUB__.getSnapshot().npcServiceRoutesV161?.routes?.[id]?.actor', arg=config['id'])
    if art:
        page.wait_for_function('()=>__ATF_HUB__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
    page.locator('#hub-canvas').focus()


def walk_to(page, config, x):
    current = observed(page, config)['player']['x']
    if abs(current - x) < 4:
        return
    key = 'KeyD' if x > current else 'KeyA'
    page.locator('#hub-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function('t=>t.right?__ATF_HUB__.player.x>=t.x-3:__ATF_HUB__.player.x<=t.x+3',
                               arg={'x': x, 'right': x > current}, timeout=90000)
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1')


def collect(page, config, name, stop, move_to=None):
    phase(name)
    page.evaluate('''opts=>{ window.__ATF_V161_COLLECTION__=new Promise((resolve,reject)=>{
      const rows=[],frames={},h=__ATF_HUB__;
      const timer=setTimeout(()=>reject(Error('Native service route timed out: '+opts.name)),240000);
      function frame(){
        const snap=h.getSnapshot().npcServiceRoutesV161.routes[opts.id],a=snap.actor;
        const row={actor:a?structuredClone(a):null,handoff:structuredClone(snap.nativeHandoff),
          reserved:snap.reserved,occlusion:structuredClone(snap.occlusion),
          player:{x:h.player.x,y:h.player.y},clock:structuredClone(h.npcRoutineContextV62.clock)};
        rows.push(row);
        if(a){const key=a.roomId+':'+a.stage;
          if(!frames[key]&&(['covering','revealing'].includes(a.stage)||a.stage==='service'))
            frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};}
        const done=opts.stop==='mid-cover'&&a?.stage==='covering'&&a.doorProgress>.35&&a.doorProgress<.7
          ||opts.stop==='annex-service'&&a?.roomId===opts.annex&&a.stage==='service'&&a.arrivals>=1
          ||opts.stop==='handoff'&&snap.nativeHandoff?.fromRoomId===opts.parent;
        if(done){clearTimeout(timer);resolve({rows,frames});return;}
        requestAnimationFrame(frame);
      } requestAnimationFrame(frame);
    }); }''', {**config, 'name': name, 'stop': stop})
    if move_to is not None:
        walk_to(page, config, move_to)
    result = page.evaluate('()=>window.__ATF_V161_COLLECTION__')
    rows = result['rows']
    (output / (name + '.json')).write_text(json.dumps(rows, indent=2))
    continuous = True
    transfers = 0
    for first, second in zip(rows, rows[1:]):
        a, b = first['actor'], second['actor']
        if not a or not b:
            continue
        if a['roomId'] == b['roomId']:
            continuous &= abs(b['x'] - a['x']) <= 27 * (b['time'] - a['time']) + .03
        else:
            transfers += 1
            continuous &= a['stage'] == 'covering' and b['stage'] == 'revealing' and b['doorProgress'] == 0 and b['crossings'] == a['crossings'] + 1
    report.setdefault('observedPortalTransfers', {})[name] = transfers
    check(name + ': actual floor walking and closed-leaf coordinate handoff stay distinct', continuous)
    check(name + ': every pose retains native floor624', all(not row['actor'] or row['actor']['y'] == 532 for row in rows))
    for key, frame in result['frames'].items():
        file = name + '-' + key.replace(':', '-') + '.png'
        (output / file).write_bytes(base64.b64decode(frame['png'].split(',')[1]))
        report['captures'].append(file)
    return rows


def open_crew_dialogue(page, config):
    # A frame capture can leave focus with another control, and the arrival
    # animation has its own closing interval after the portal handoff. Wait
    # for the native gates and a real nearby speaker before a new key press.
    page.wait_for_function('''c=>{const h=__ATF_HUB__;return h.running&&!h.annexTransitionV71
      &&!h.hubDoorClosingV142&&!h.annexStateReadOnlyV87&&Math.abs(h.player.vx)<1
      &&h.nearestAnnexNpcV141?.()?.crewId===c.crew;}''', arg=config)
    page.locator('#hub-canvas').focus()
    report.setdefault('conversationAttempts', []).append({'route': config['id'], 'before': observed(page, config)})
    page.keyboard.press('KeyE', delay=80)
    page.locator('#hub-dialogue').wait_for(state='visible')


def fixture(config):
    script = '''import {createDefaultSave} from './src/save.js';
const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA service '+c.id+' V161';
s.settings.reducedMotion=false;s.clock.hour=5;
Object.assign(s.hub,{deck:c.deck,roomId:c.parent,positionX:1350,positionY:532});
s.crew.find(m=>m.id===c.crew).appearanceV110={schema:110,markingId:'olive'};
if(c.id==='leila-galley')Object.assign(s.galaxy.resources,{research:30,pathogen:2});
console.log(JSON.stringify(s));'''
    result = subprocess.run(['node', '--input-type=module', '-e', script, json.dumps(config)], cwd=repo, capture_output=True, text=True, check=True)
    raw = result.stdout.encode()
    name = config['id'] + '-disclosed-native05h.json'
    (output / name).write_bytes(raw)
    report.setdefault('fixtureSha256', {})[name] = hashlib.sha256(raw).hexdigest()
    return raw


source_start = manifest()
(output / 'runtime-source-start-v161.json').write_text(json.dumps(source_start, indent=2))
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for config in ROUTES:
            if args.route not in ['all', config['id']]:
                continue
            prefix = config['id']
            context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
            page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('dialog', lambda dialog: dialog.accept())
            phase(prefix + ': native05h import')
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': prefix + '.json', 'mimeType': 'application/json', 'buffer': fixture(config)})
            page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg='QA service ' + prefix + ' V161')
            open_hub(page, config)
            initial = observed(page, config)
            check(prefix + ': initial native body is unique,44x92 and supported in its true parent room',
                  initial['visibleCount'] == 1 and initial['visibleSingleton'] and initial['actualActor']['roomId'] == config['parent']
                  and initial['actualActor']['w'] == 44 and initial['actualActor']['h'] == 92 and initial['actualActor']['y'] == 532)
            capture(page, prefix + '-01-parent-native05h.png')
            page.locator('#exit-hub').click()
            open_view(page, 'command')
            page.locator(config['action']).click()
            page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=config['hour'])
            open_hub(page, config)
            if args.comparison_stage == 'after':
                active = observed(page, config)
                check(prefix + ': real elapsed-time command preserves owned parent origin instead of adopting a sampled annex post',
                      active['route']['actor']['roomId'] == config['parent'] and active['route']['actor']['crossings'] == 0
                      and active['route']['preLoadTravelObserved'] is False)
                check(prefix + ': both rooms keep complete2D presentation', all(row['mode'] == '2d' and not row['mixedProjectionAllowed'] for row in active['route']['presentation']))
                collect(page, config, prefix + '-02-outbound-mid-door', 'mid-cover')
                page.locator('#exit-hub').click()
                paused = observed(page, config)
                durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcServiceRoutesV161.routes[id]', config['id'])
                check(prefix + ': real exit persists supported actor and exact door phase', durable['actor'] == paused['route']['actor'] and durable['actor']['stage'] in ['covering', 'revealing'])
                (output / (prefix + '-durable-covered-door.json')).write_text(json.dumps(durable, indent=2))
                page.reload(wait_until='domcontentloaded')
                page.locator('#title-start').click(timeout=45000)
                page.locator('#title-options').click()
                page.evaluate('''c=>{const read=''' + OBSERVE + '''; document.addEventListener('click',function record(event){
                  if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
                  window.__ATF_V161_RESUME_OBSERVATION__=read(c);document.removeEventListener('click',record);
                });}''', config)
                open_hub(page, config, art=False)
                restored = page.evaluate('()=>window.__ATF_V161_RESUME_OBSERVATION__')
                check(prefix + ': reload restores exact saved door state before first resumed frame', restored['route']['actor'] == durable['actor'])
                collect(page, config, prefix + '-03-resumed-annex-arrival', 'annex-service')
                arrived = observed(page, config)
                check(prefix + ': complete outbound owns one portal and the existing safe service post', arrived['route']['actor']['crossings'] == 1 and abs(arrived['route']['actor']['x'] - config['post']) < .25)
            walk_to(page, config, config['parentDoor'])
            page.keyboard.press('KeyE')
            page.wait_for_function('id=>__ATF_HUB__.currentAnnexV71?.()?.id===id&&!__ATF_HUB__.annexTransitionV71', arg=config['annex'], timeout=45000)
            walk_to(page, config, config['post'] - 84)
            visible = observed(page, config)
            check(prefix + ': native player entry sees the same single service identity', visible['visibleCount'] == 1 and visible['visibleSingleton'])
            capture(page, prefix + '-04-annex-service-post.png')
            open_crew_dialogue(page, config)
            talking = observed(page, config)
            check(prefix + ': E opens the existing crew dialogue at the real post', config['speaker'] in page.locator('#hub-dialogue-speaker').inner_text() and not talking['running'])
            capture(page, prefix + '-05-native-dialogue.png')
            page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
            page.locator('#hub-dialogue-continue').click()
            page.wait_for_function('()=>__ATF_HUB__.running')
            if args.comparison_stage == 'after':
                check(prefix + ': dialogue retains the original actor, floor and crossing count', observed(page, config)['route']['actor']['crossings'] == 1)
                walk_to(page, config, config['annexDoor'])
                page.keyboard.press('KeyE')
                page.wait_for_function('()=>!__ATF_HUB__.currentAnnexV71?.()&&!__ATF_HUB__.annexTransitionV71', timeout=45000)
                walk_to(page, config, config['parentDoor'])
                page.locator('#exit-hub').click()
                open_view(page, 'command')
                page.locator(config['returnAction']).click()
                page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=config['returnHour'])
                open_hub(page, config)
                page.wait_for_function('id=>__ATF_HUB__.getSnapshot().npcServiceRoutesV161.routes[id].actor?.reason==="occupied"', arg=config['id'], timeout=120000)
                occupied = observed(page, config)
                page.wait_for_timeout(350)
                waiting = observed(page, config)
                check(prefix + ': actual destination occupant prevents return handoff', occupied['route']['actor']['roomId'] == config['annex']
                      and waiting['route']['actor']['roomId'] == config['annex'] and waiting['route']['actor']['crossings'] == 1
                      and waiting['route']['actor']['x'] == occupied['route']['actor']['x'])
                capture(page, prefix + '-06-occupied-return-opening.png')
                rows = collect(page, config, prefix + '-07-return-and-handoff', 'handoff', move_to=config['parentDoor'] + 600)
                last = next(row['actor'] for row in reversed(rows) if row['actor'])
                handoff = observed(page, config)['route']['nativeHandoff']
                check(prefix + ': real floor return reaches parent home before explicit unobserved native handoff',
                      last['roomId'] == config['parent'] and abs(last['x'] - last['homeX']) < .25
                      and last['crossings'] == 2 and last['arrivals'] == 2 and handoff['observedTravel'] is False)
                check(prefix + ': continuous return observes exactly one closed-leaf portal transfer', report['observedPortalTransfers'][prefix + '-07-return-and-handoff'] == 1)
                capture(page, prefix + '-08-parent-after-native-handoff.png')
            report['routes'].append({'id': prefix, 'status': 'passed'})
            context.close()
        check('native pages/assets have no runtime, HTTP or request errors', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        try:
            report['failureState'] = observed(page, config)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        print('::error file=scripts/qa-npc-service-routes-v161.py::' + str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise
    finally:
        browser.close()
        source_end = manifest()
        (output / 'runtime-source-end-v161.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
