"""Native NPC dialogue checks plus explicitly separate rendering fixtures.

Save imports, walking and E use public controls. Runtime evaluation only reads
game state. The final source/render boards are declared canvas fixtures, not
screenshots of four additional gameplay journeys.
"""
import argparse
import base64
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--stage', choices=['before', 'after'], required=True)
parser.add_argument('--expect-build', required=True)
parser.add_argument('--expect-harness', required=True)
parser.add_argument('--fixture-dir', type=Path,
                    help='Reuse the exact four disclosed initial saves from a prior observation.')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    parser.error('Keep evidence outside the repository.')
if output.exists() and any(output.iterdir()):
    parser.error('Use an empty evidence directory; retain previous attempts.')
output.mkdir(parents=True, exist_ok=True)
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda raw: hashlib.sha256(raw).hexdigest()
git = lambda *cmd: subprocess.check_output(['git', *cmd], cwd=repo, text=True).strip()
configs = [
    dict(id='maksim', crew='crew-08-maksim-orlov', speaker='Orlov',
         deck=3, room='dropship-hangar', player=225, route='maksim-arrival',
         annex='arrival-airlock', parentDoor=1018, hour=10.5,
         action='[data-strategy-action="salvage-run"]'),
    dict(id='inez', crew='crew-09-inez-harlow', speaker='Harlow',
         deck=2, room='quarantine', player=783, route='inez-bioforge',
         annex='bioforge', parentDoor=318, hour=10.5,
         action='[data-strategy-action="salvage-run"]'),
    dict(id='asha', crew='crew-12-asha-mbaye', speaker='Mbaye',
         deck=1, room='crew-quarters', player=479, route='asha-refuge',
         annex='personal-refuge', parentDoor=1187, hour=17.5, research=20,
         action='[data-research-id="vehicle-doctrine"]'),
    dict(id='mara', crew='crew-01-mara-vega', speaker='Vega',
         deck=0, room='bridge', player=300, route='mara-archives',
         annex='mire-archives', parentDoor=1558, hour=10.5,
         action='[data-strategy-action="salvage-run"]'),
]
configs.append({**configs[1], 'id': 'inez-mobile', 'character': 'Inez',
                'viewport': {'width': 390, 'height': 844}})
report = dict(status='running', startedAt=now(), stage=args.stage,
              sourceCommit=args.expect_build, harnessCommit=args.expect_harness,
              checks=[], captures=[], pageErrors=[], requestFailures=[], httpErrors=[],
              nativeDialogues=[], renderingFixtures=[], characters=[],
              method='Disclosed 05h30 Save imports, actual 5h salvage or 12h research command, observed native NPC outbound walk, player walking/E and existing annex dialogue. Separate source/render fixtures use the production drawable resolver.',
              limitations=['Automated Chromium, no human participants or artistic 1:1 approval.',
                           'Four NPCs and sixteen curated cells only; exterior fringes and other poses remain open.',
                           'The Asha save adds20research for the existing12h research command; other resources retain their native defaults.',
                           'Strategic elapsed hours are not observed walking hours. Return journeys are outside this focused alpha check.',
                           'The source/render boards are explicit fixtures, not additional gameplay journeys.',
                           'Before observations and V163 counts are not current V164 test totals.'])


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def identity():
    raw = urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20).read()
    data = json.loads(raw)
    assert data['sourceCommit'] == args.expect_build, 'Unexpected served build'
    return dict(sourceCommit=data['sourceCommit'], buildId=data['buildId'],
                buildInfoSha256=sha(raw))


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('scripts/*.mjs'),
                    *repo.glob('scripts/*.py'), *repo.glob('*.css'),
                    repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', repo / 'package-lock.json',
                    *[repo / ('assets/openai/sprites/normalized/npcs/' + name + '-locomotion-sheet.png')
                      for name in ['maksim-orlov', 'inez-harlow', 'asha-mbaye', 'mara-vega']]])
    return {str(p.relative_to(repo)): sha(p.read_bytes()) for p in files}


def fixture(config):
    script = """import {createDefaultSave} from './src/save.js';
const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA NPC matte V164';
s.settings.reducedMotion=false;s.clock.hour=5.5;
Object.assign(s.hub,{deck:c.deck,roomId:c.room,positionX:c.player,positionY:532});
if(c.research)s.galaxy.resources.research=c.research;
s.crew.find(m=>m.id===c.crew).appearanceV110={schema:110,markingId:'olive'};
console.log(JSON.stringify(s));"""
    name = config['id'] + '-disclosed-native0530.json'
    if args.fixture_dir:
        source = args.fixture_dir.resolve() / name
        raw = source.read_bytes()
        assert json.loads(raw)['player']['name'] == 'QA NPC matte V164'
        report.setdefault('reusedFixtures', []).append(dict(
            source=str(source), sha256=sha(raw)))
    else:
        raw = subprocess.check_output(['node', '--input-type=module', '-e', script,
                                       json.dumps(config)], cwd=repo)
    (output / name).write_bytes(raw)
    report.setdefault('fixtures', []).append(dict(file=name, sha256=sha(raw)))
    return raw


def open_view(page, view):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('[data-view="' + view + '"]').click()


def observe(page, crew):
    return page.evaluate("""crew => {
      const h=__ATF_HUB__, visible=h.currentAnnexV71?.()?h.activeAnnexNpcsV141():h.npcs;
      const peers=visible.filter(n=>n.crewId===crew), a=peers[0];
      return {running:h.running, visibleCount:peers.length,
        actor:a?{x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId}:null,
        player:{x:h.player.x,y:h.player.y,vx:h.player.vx},
        clock:structuredClone(__ATF_V51__.saveSystem.data.clock),
        resources:structuredClone(__ATF_V51__.saveSystem.data.galaxy.resources)};
    }""", crew)


def walk_to(page, target):
    current = page.evaluate('()=>__ATF_HUB__.player.x')
    page.locator('#hub-canvas').focus()
    if abs(current-target) >= 4:
        key = 'KeyD' if target > current else 'KeyA'
        page.keyboard.down(key)
        try:
            page.wait_for_function(
                'c=>c.right?__ATF_HUB__.player.x>=c.x-3:__ATF_HUB__.player.x<=c.x+3',
                arg=dict(x=target, right=target > current), timeout=90000)
        finally:
            page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1')


def capture(page, locator, name, kind):
    page.locator(locator).screenshot(path=str(output / name))
    report['captures'].append(dict(file=name, kind=kind,
                                   sha256=sha((output / name).read_bytes())))


source_start = manifest()
report['sourceStart'] = source_start
try:
    check('Harness is the exact clean declared commit',
          git('rev-parse', 'HEAD') == args.expect_harness and not git('status', '--porcelain'))
    report['identityBefore'] = identity()
    with sync_playwright() as pw:
        options = {'headless': True}
        if os.environ.get('ATF_CHROMIUM_EXECUTABLE'):
            options['executable_path'] = os.environ['ATF_CHROMIUM_EXECUTABLE']
        browser = pw.chromium.launch(**options)
        report['chromium'] = browser.version
        try:
            for config in configs:
                report['phase'] = config['id'] + ': native import and dialogue'
                context = browser.new_context(viewport=config.get('viewport', {'width': 1600, 'height': 1000}),
                                              service_workers='block')
                page = context.new_page()
                page.set_default_timeout(45000)
                page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
                page.on('requestfailed', lambda request: report['requestFailures'].append(
                    dict(url=request.url, failure=request.failure)))
                page.on('response', lambda response: report['httpErrors'].append(
                    dict(url=response.url, status=response.status)) if response.status >= 400 else None)
                page.on('dialog', lambda dialog: dialog.accept())
                page.goto(args.base, wait_until='domcontentloaded')
                page.locator('#title-start').click()
                page.locator('#title-options').click()
                page.locator('#save-import').set_input_files(
                    dict(name=config['id'] + '.json', mimeType='application/json',
                         buffer=fixture(config)))
                page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA NPC matte V164'")
                open_view(page, 'hub')
                page.wait_for_function('()=>__ATF_HUB__?.running')
                page.wait_for_function('crew=>__ATF_HUB__.npcs.some(n=>n.crewId===crew)',
                                       arg=config['crew'])
                before = observe(page, config['crew'])
                check(config['id'] + ': one physical 44x92 body at the native floor',
                      before['visibleCount'] == 1 and before['actor']['w'] == 44
                      and before['actor']['h'] == 92 and before['actor']['y'] == 532)
                page.locator('#exit-hub').click()
                open_view(page, 'command')
                page.locator(config['action']).click()
                page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour',
                                       arg=config['hour'])
                open_view(page, 'hub')
                page.wait_for_function('()=>__ATF_HUB__?.running')
                report['phase'] = config['id'] + ': observed native outbound walk'
                print('STEP ' + report['phase'], flush=True)
                page.wait_for_function("""c=>{
                  const a=__ATF_HUB__.getSnapshot().npcAnnexRoutesV163?.routes?.[c.route]?.actor;
                  return a?.stage==='service'&&a.roomId===c.annex;
                }""", arg=config, polling=100, timeout=240000)
                walk_to(page, config['parentDoor'])
                page.keyboard.press('KeyE', delay=80)
                page.wait_for_function("""id=>__ATF_HUB__.currentAnnexV71?.()?.id===id
                  &&!__ATF_HUB__.annexTransitionV71&&!__ATF_HUB__.hubDoorClosingV142""",
                                       arg=config['annex'])
                arrived = observe(page, config['crew'])
                check(config['id'] + ': native walking reaches the matching physical annex service',
                      arrived['visibleCount'] == 1 and arrived['actor']
                      and arrived['actor']['roomId'] == config['annex'])
                walk_to(page, arrived['actor']['x']-84)
                page.wait_for_function("""crew=>{
                  const h=__ATF_HUB__;return h.running&&!h.hubDoorClosingV142
                    &&h.nearestAnnexNpcV141?.()?.crewId===crew;
                }""", arg=config['crew'])
                before = observe(page, config['crew'])
                capture(page, '#hub-canvas', config['id'] + '-native-hub.png', 'native-canvas')
                page.keyboard.press('KeyE', delay=80)
                page.locator('#hub-dialogue').wait_for(state='visible')
                check(config['id'] + ': E selects the requested speaker before inspecting its image',
                      config['speaker'] in page.locator('#hub-dialogue-speaker').inner_text())
                page.wait_for_function("""()=>{const i=document.querySelector('#hub-dialogue-image');
                  return i.complete&&i.naturalWidth===1024;}""")
                if args.stage == 'after':
                    page.wait_for_function("""()=>getComputedStyle(
                      document.querySelector('#hub-dialogue-image')).maskImage!=='none'""")
                portrait = page.locator('#hub-dialogue-image').evaluate("""i=>{
                  const frame=i.parentElement,canvas=frame?.querySelector('canvas[data-dialogue-avatar-v168]');
                  return {source:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,
                    hidden:i.hidden,mask:getComputedStyle(i).maskImage,
                    clip:getComputedStyle(i).clipPath,
                    bounds:i.getBoundingClientRect().toJSON(),
                    avatar:canvas?{hidden:canvas.hidden,sourceRect:canvas.dataset.portraitSourceRectV168||null,
                      crew:frame?.dataset.dialoguePortraitCrewV168||'',
                      state:frame?.dataset.dialoguePortraitStateV168||''}:null};
                }""")
                after = observe(page, config['crew'])
                check(config['id'] + ': real E opens the matching NPC dialogue',
                      config['speaker'] in page.locator('#hub-dialogue-speaker').inner_text()
                      and not after['running'])
                character = config.get('character', config['id'].capitalize())
                if character not in report['characters']:
                    report['characters'].append(character)
                check(config['id'] + ': dialogue retains the body, strategic time and resources',
                      after['actor']['w'] == before['actor']['w']
                      and after['actor']['h'] == before['actor']['h']
                      and after['actor']['y'] == before['actor']['y']
                      and after['clock'] == before['clock']
                      and after['resources'] == before['resources'])
                # V168 draws the admitted head-and-shoulders crop to a canvas,
                # keeping the original 1024px atlas hidden. The legacy V164
                # implementation exposed the same atlas with a CSS cell clip.
                expected_crop = page.evaluate("""async crew=>{
                  const m=await import('/src/npc-dialogue-portraits-v168.js');
                  return m.getNpcDialoguePortraitV168(crew)?.crop||null;
                }""", config['crew'])
                avatar = portrait['avatar']
                native_canvas = bool(avatar and portrait['hidden']
                  and avatar['hidden'] is False and avatar['state'] == 'ready'
                  and avatar['crew'] == config['crew'] and expected_crop
                  and avatar['sourceRect'] and json.loads(avatar['sourceRect']) == expected_crop)
                legacy_cell = portrait['clip'] != 'none' and not avatar
                check(config['id'] + ': native portrait retains its original atlas and reviewed crop',
                      portrait['source'].endswith('-locomotion-sheet.png')
                      and portrait['width'] == 1024 and portrait['height'] == 1024
                      and (native_canvas or legacy_cell))
                if args.stage == 'after':
                    check(config['id'] + ': curated portrait mask is actually active',
                          'data:image/svg+xml' in portrait['mask'])
                    snapshot = page.evaluate("""async()=>(
                      await import('/src/npc-matte-apertures-v164.js')).getNpcMatteApertureSnapshotV164()""")
                    check(config['id'] + ': world draw and portrait share a validated bounded correction',
                          snapshot['correctedDrawRequests'] > 0 and snapshot['domCorrections'] > 0
                          and snapshot['failures'] == 0 and snapshot['sourceMismatches'] == 0
                          and snapshot['retainedBytes'] <= 16 * 1024 * 1024)
                else:
                    snapshot = None
                    check(config['id'] + ': historical portrait has no new aperture mask',
                          portrait['mask'] == 'none')
                capture(page, '#hub-dialogue', config['id'] + '-native-dialogue.png', 'native-dialogue')
                report['nativeDialogues'].append(dict(id=config['id'], before=before,
                    after=after, portrait=portrait, correction=snapshot))
                if args.stage == 'after':
                    boards = page.evaluate("""async()=>{
                      const m=await import('/src/npc-matte-apertures-v164.js'), rows=[];
                      for(const p of m.NPC_MATTE_APERTURES_V164){
                        const image=new Image();image.src=p.path;await image.decode();
                        const drawable=m.resolveHumanSpriteDrawableV164(image);
                        const a=document.createElement('canvas');a.width=p.width;a.height=p.height;
                        const b=a.cloneNode();const ac=a.getContext('2d'),bc=b.getContext('2d');
                        ac.drawImage(image,0,0);bc.drawImage(drawable,0,0);
                        const source=ac.getImageData(0,0,p.width,p.height).data;
                        const result=bc.getImageData(0,0,p.width,p.height).data;
                        const admitted=new Set();
                        for(const f of p.frames)for(const r of f.regions)
                          for(const [y,x0,x1] of r.runs)for(let x=x0;x<x1;x++)admitted.add(y*p.width+x);
                        let removed=0,otherAlphaChanges=0;
                        for(let k=0;k<source.length;k+=4){
                          if(admitted.has(k/4)){if(source[k+3]===255&&result[k+3]===0)removed++;}
                          else if(source[k+3]!==result[k+3])otherAlphaChanges++;
                        }
                        for(const f of p.frames){
                          const c=document.createElement('canvas');c.width=512;c.height=256;
                          const ctx=c.getContext('2d');ctx.fillStyle='#0b1114';ctx.fillRect(0,0,512,256);
                          const x=(f.index%4)*256,y=Math.floor(f.index/4)*256;
                          ctx.drawImage(image,x,y,256,256,0,0,256,256);
                          ctx.drawImage(drawable,x,y,256,256,256,0,256,256);
                          rows.push({id:p.id,frame:f.index,png:c.toDataURL('image/png'),
                            removedPixels:removed,admittedPixels:admitted.size,otherAlphaChanges});
                        }
                      }
                      const reused=new Image();
                      m.setNpcPortraitSourceV164(reused,m.NPC_MATTE_APERTURES_V164[0].path);
                      m.setNpcPortraitSourceV164(reused,'/assets/openai/hub/props/bridge-terminal.png');
                      await reused.decode();
                      return {rows,reused:{source:reused.src,mask:reused.style.maskImage}};
                    }""") if config['id'] == 'mara' else None
                    if boards:
                        check('Reused non-NPC portrait clears its preceding mask and pending load',
                              boards['reused']['mask'] in ['', 'none']
                              and boards['reused']['source'].endswith('/bridge-terminal.png'))
                        for row in boards['rows']:
                            check(row['id'] + '/' + str(row['frame']) + ': only admitted opaque alpha is removed',
                                  row['removedPixels'] == row['admittedPixels'] > 0
                                  and row['otherAlphaChanges'] == 0)
                            name = row['id'].replace('.', '-') + '-frame-' + str(row['frame']) + '-source-render-fixture.png'
                            raw = base64.b64decode(row.pop('png').split(',')[1])
                            (output / name).write_bytes(raw)
                            report['captures'].append(dict(file=name,kind='source-render-fixture',
                                                           sha256=sha(raw)))
                            report['renderingFixtures'].append(dict(file=name,**row))
                context.close()
        finally:
            browser.close()
    report['identityAfter'] = identity()
    check('The same served build completed every native dialogue',
          report['identityBefore'] == report['identityAfter'])
    report['sourceEnd'] = manifest()
    check('Harness and source bytes stayed unchanged during the complete observation',
          source_start == report['sourceEnd'] and git('rev-parse','HEAD') == args.expect_harness
          and not git('status','--porcelain'))
    check('No page, request or HTTP error', not report['pageErrors']
          and not report['requestFailures'] and not report['httpErrors'])
    report['status'] = 'passed'
except Exception as error:
    report['status'] = 'failed'
    report['error'] = str(error)
    if os.environ.get('GITHUB_ACTIONS') == 'true':
        detail = (report.get('phase', '') + ': ' + str(error))[:1800]
        detail = detail.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
        print('::error file=scripts/qa-npc-matte-apertures-v164.py,title=NPC matte native QA::' + detail,
              flush=True)
    raise
finally:
    report['finishedAt'] = now()
    (output / 'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
