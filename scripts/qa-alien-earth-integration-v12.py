#!/usr/bin/env python3
"""Real Chromium smoke/regression test for the Alien: Earth integration.

Only initial, declared storage fixtures are injected. Gameplay uses actual DOM
buttons and keyboard events. The opt-in QA observer is read only in this test;
findPath plans keyboard travel and never teleports or advances objectives.
Detached canvas probes exercise production renderers without altering gameplay.
"""

import argparse
import base64
import functools
import hashlib
import http.server
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import threading
import time
import traceback

from playwright.sync_api import sync_playwright


EARTH_KEY = "atf.dlc.alien-earth.s1.profile-1"
NATIVE_KEYS = [f"atf-v47-profile-{i}" for i in (1, 2, 3)]
SELECTED_KEY = "atf-v78-selected-profile"


def fixtures(source_root):
    script = """
const {createDefaultSave}=await import(process.argv[2]);
const {newState,sanitizeSave}=await import(process.argv[3]);
const {EARTH_RASTER_ASSETS_V12}=await import(process.argv[4]);
const entries={};
for(const i of [1,2,3]){
  const s=createDefaultSave(i);
  s.createdAt=1700000000000+i;s.updatedAt=1700000000000+i;
  entries['atf-v47-profile-'+i]=JSON.stringify(s);
}
entries['atf-v78-selected-profile']='2';
const earth=newState();
earth.playSeconds=12.5;
sanitizeSave(earth);
const zoo=newState();zoo.chapter=4;zoo.room='R18';zoo.visited=['R18'];
zoo.completed=Array.from({length:16},(_,i)=>'AE-'+String(i+1).padStart(2,'0'));
zoo.resonance=true;zoo.player.x=700;zoo.player.z=185;
sanitizeSave(zoo);
process.stdout.write(JSON.stringify({native:entries,earth:JSON.stringify(earth),rasterSpecs:Object.values(EARTH_RASTER_ASSETS_V12).map(({id,path,width,height})=>({id,path,width,height})),
  zoo:JSON.stringify(zoo),
  declaration:'Fresh valid native profiles 1–3; selected profile 2; fresh Earth R01 fixture with 12.5 elapsed seconds and no completed objective. A separate R18 visual fixture starts chapter 5 with AE-01..AE-16 marked complete solely to inspect the Zoo; it is not evidence of a campaign playthrough.'}));
"""
    done = subprocess.run(
        [shutil.which("node") or "node", "--input-type=module", "-",
         (source_root / "src/save.js").as_uri(),
         (source_root / "modules/alien-earth/v12/src/alien-earth-core.js").as_uri(),
         (source_root / "modules/alien-earth/v12/src/alien-earth-raster-v12.js").as_uri()],
        input=script, text=True, capture_output=True, check=True,
    )
    return json.loads(done.stdout)


def read_storage(page, keys):
    return page.evaluate("ks=>Object.fromEntries(ks.map(k=>[k,localStorage.getItem(k)]))", keys)


def document_observation(page):
    """Read document, history-entry and audio identity without changing state."""
    return page.evaluate("""() => {
      const api=globalThis.navigation, entry=api?.currentEntry;
      const audio=globalThis.__ATF_AUDIO_V77__;
      const timing=performance.getEntriesByType('navigation')[0];
      return {
        url:location.href, referrer:document.referrer,
        timeOrigin:performance.timeOrigin, navigationType:timing?.type??null,
        historyLength:history.length,
        navigationEntry:entry?{key:entry.key,id:entry.id,index:entry.index,url:entry.url}:null,
        navigationEntryCount:typeof api?.entries==='function'?api.entries().length:null,
        pageShowEvents:(globalThis.__ATF_QA_PAGESHOWS||[]).map(event=>({...event})),
        audio:audio?{disposed:audio.disposed,unlockStatus:audio.unlockStatus,
          scene:audio.scene,contextState:audio.context?.state??null,musicStatus:audio.musicStatus}:null
      };
    }""")


def state(page):
    return page.evaluate("()=>window.__EARTH_QA.state()")


def compact_route(points):
    """Keep turns; remove collinear intermediate grid nodes."""
    if len(points) < 3:
        return points
    result = [points[0]]
    for before, point, after in zip(points, points[1:], points[2:]):
        if not (before["x"] == point["x"] == after["x"] or
                before["z"] == point["z"] == after["z"]):
            result.append(point)
    result.append(points[-1])
    return result


def walk_to(page, target, report):
    """Feedback control using held real arrow keys, never writes game state."""
    start = state(page)["player"]
    pulses = 0
    deadline = time.monotonic() + 24
    while time.monotonic() < deadline:
        observed = state(page)
        player = observed["player"]
        dx, dz = target["x"] - player["x"], target["z"] - player["z"]
        if abs(dx) <= 7 and abs(dz) <= 5:
            report["walk"].append({"from": start, "to": target, "arrived": player, "pulses": pulses})
            return
        assert page.locator("#shell").get_attribute("data-state") == "playing", "Unexpected modal during keyboard travel"
        axis = "x" if abs(dx) > 7 else "z"
        delta = dx if axis == "x" else dz
        key = ("ArrowRight" if delta > 0 else "ArrowLeft") if axis == "x" else ("ArrowDown" if delta > 0 else "ArrowUp")
        duration = min(180, max(16, abs(delta) * (4 if axis == "x" else 6)))
        page.keyboard.down(key)
        page.wait_for_timeout(duration)
        page.keyboard.up(key)
        pulses += 1
    raise AssertionError(f"Keyboard travel timed out: target={target}, current={state(page)['player']}")


def cross_door(page, destination, report):
    plan = page.evaluate("""async destination=>{
      const q=window.__EARTH_QA,e=q.engine();
      const door=e.room.portals.find(p=>p.to===destination&&p.kind==='door');
      if(!door)throw new Error('Door missing: '+destination);
      const {findPath}=await import('./src/alien-earth-core.js');
      return {from:e.room.id,to:destination,door,path:findPath(e.room,e.player,door)};
    }""", destination)
    assert plan["path"], f"No walkable route to {destination}"
    report["routes"].append(plan)
    for point in compact_route(plan["path"]):
        walk_to(page, point, report)
    before = state(page)
    assert before["completed"] == [], "Navigation unexpectedly completed an objective"
    page.keyboard.press("e")
    page.wait_for_function("id=>window.__EARTH_QA.state().room===id", arg=destination, timeout=7000)
    after = state(page)
    assert after["completed"] == [], "Door crossing unexpectedly completed an objective"
    return after


def wait_rasters_ready(page):
    """Poll resolved values: Playwright waitForFunction treats a Promise as truthy."""
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        assets = page.evaluate("""async()=>{
          const r=await import('./src/alien-earth-raster-v12.js');
          r.preloadEarthRasterV12();return r.getEarthRasterDiagnosticsV12().assets;
        }""")
        assert not any(row["status"] in ("error", "unavailable") for row in assets), f"Raster load rejected: {assets}"
        if len(assets) >= 8 and all(row["status"] == "ready" for row in assets):
            return assets
        page.wait_for_timeout(50)
    raise AssertionError(f"Raster loading timeout: {assets}")


def raster_probe(page, output):
    wait_rasters_ready(page)
    result = page.evaluate("""async()=>{
      const r=await import('./src/alien-earth-raster-v12.js');
      const {drawReferenceHumanV11}=await import('./src/alien-earth-reference-art-v11.js');
      const {EARTH_DATA}=await import('./src/alien-earth-data.js');
      const extraRoles=['wendy','kirsh','curly','nibs'].filter(role=>r.EARTH_RASTER_ASSETS_V12[role+'-idle']);
      const cv=document.createElement('canvas');cv.width=1100;cv.height=extraRoles.length?540:300;
      const c=cv.getContext('2d');c.fillStyle='#21332e';c.fillRect(0,0,cv.width,cv.height);
      const calls=[],original=c.drawImage.bind(c);
      c.drawImage=(...args)=>{calls.push(args[0].src||'canvas');return original(...args);};
      drawReferenceHumanV11(c,120,240,'joe',{weapon:'mcsx',chapter:1});
      const joeCalls=calls.splice(0);
      drawReferenceHumanV11(c,280,240,'arthur',{weapon:'none'});
      const arthurCalls=calls.splice(0);
      r.drawEarthRasterWeaponV12(c,440,190,'mcsx');
      r.drawEarthRasterCreatureV12(c,610,235,{kind:'tick',facing:1},0,1);
      const room=EARTH_DATA.rooms.find(x=>x.id==='R18');
      const selections=EARTH_DATA.rooms.flatMap(room=>room.props.map(prop=>({room:room.id,id:prop.id,asset:r.selectEarthRasterPropV12(prop,room)}))).filter(x=>x.asset);
      const declared=Object.keys(r.EARTH_RASTER_PROP_OVERRIDES_V12).sort();
      const table=room.props.find(p=>p.id==='R18-island');
      r.drawEarthRasterPropV12(c,table,740,240,table.w,table.h,{room});
      const extraHumans=[];
      for(const [index,role] of extraRoles.entries()){
        calls.length=0;
        drawReferenceHumanV11(c,160+index*240,490,role,{weapon:'none',chapter:2,initial:false});
        extraHumans.push({role,asset:role+'-idle',calls:calls.splice(0),moving:r.selectEarthRasterHumanV12(role,{weapon:'none',chapter:2,initial:false,moving:true})});
      }
      let lampPreview=null;
      if(r.EARTH_RASTER_ASSETS_V12['zoo-wall-light']){
        const lamp=room.props.find(p=>p.id==='R18-wall0');
        calls.length=0;
        const lit=r.drawEarthRasterPropV12(c,lamp,960,245,lamp.w,lamp.h,{room,powered:true});
        const litCalls=calls.splice(0);
        const unlit=r.drawEarthRasterPropV12(c,lamp,1040,245,lamp.w,lamp.h,{room,powered:false});
        lampPreview={declaration:'Detached previews of lit and unlit variants at real 55px prop size; do not energize the real R18 scene.',hasOffAsset:!!r.EARTH_RASTER_ASSETS_V12['zoo-wall-light-off'],lit,litCalls,unlit,unlitCalls:calls.splice(0)};
      }
      c.fillStyle='#cbd8cf';c.font='13px sans-serif';
      for(const [text,x,y] of [['Joe / MCS-X',75,265],['Arthur',258,265],['MCS-X',430,265],['Species 19',580,265],['Zoo table',800,265],...extraRoles.map((role,i)=>[role,138+i*240,515])])c.fillText(text,x,y);
      if(lampPreview){c.fillText('Lampe ON',955,265);c.fillText('OFF',1055,265);}
      const idle=r.selectEarthRasterHumanV12('joe',{weapon:'mcsx',chapter:1});
      const exclusions=['moving','crouching','lowPassage','carrying'].map(key=>({key,asset:r.selectEarthRasterHumanV12('joe',{weapon:'mcsx',chapter:1,[key]:true})}));
      const creatureExclusions=['eye_host','eye_caged','orchid','xeno'].map(kind=>({kind,asset:r.selectEarthRasterCreatureV12({kind})}));
      const dimensions=await Promise.all(Object.values(r.EARTH_RASTER_ASSETS_V12).map(asset=>new Promise((resolve,reject)=>{
        const image=new Image();image.onload=()=>resolve({id:asset.id,actual:[image.naturalWidth,image.naturalHeight],expected:[asset.width,asset.height],exact:asset.exact});image.onerror=()=>reject(new Error(asset.id));image.src=r.resolveEarthRasterURLV12(asset.id);
      })));
      const awakening=r.selectEarthRasterHumanV12('wendy',{weapon:'none',chapter:0,initial:true});
      return {diagnostics:r.getEarthRasterDiagnosticsV12(),joeCalls,arthurCalls,extraHumans,lampPreview,awakening,idle,exclusions,creatureExclusions,selections,declared,dimensions,image:cv.toDataURL('image/png')};
    }""")
    png = result.pop("image")
    (output / "earth-raster-browser-atlas.png").write_bytes(base64.b64decode(png.split(",", 1)[1]))
    (output / "earth-raster-probe.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    assert result["idle"] == "joe-mcsx-idle"
    assert len(result["joeCalls"]) == 1 and "joe-mcsx-idle.png" in result["joeCalls"][0], "Joe or his weapon drawn twice"
    assert len(result["arthurCalls"]) == 1 and "arthur-idle.png" in result["arthurCalls"][0]
    assert result["awakening"] is None, "Rescue uniform substituted during Wendy awakening scene"
    for human in result["extraHumans"]:
        assert len(human["calls"]) == 1 and human["asset"] + ".png" in human["calls"][0], f"Unexpected raster draw for {human['role']}"
        assert human["moving"] is None, f"Static raster selected for walking {human['role']}"
    if result["lampPreview"] is not None:
        lamp = result["lampPreview"]
        assert lamp["lit"] is True and len(lamp["litCalls"]) == 1
        assert "zoo-wall-light.png" in lamp["litCalls"][0]
        if lamp["hasOffAsset"]:
            assert lamp["unlit"] is True and len(lamp["unlitCalls"]) == 1 and "zoo-wall-light-off.png" in lamp["unlitCalls"][0], "Unpowered preview did not choose the original off PNG"
        else:
            assert lamp["unlit"] is False and lamp["unlitCalls"] == [], "Lit lamp raster used with power off"
    assert all(row["asset"] is None for row in result["exclusions"]), "Static human raster used during movement/low posture"
    assert all(row["asset"] is None for row in result["creatureExclusions"]), "Unrelated creature raster substituted"
    assert all(row["room"] == "R18" for row in result["selections"]), "Zoo props leaked to unrelated rooms"
    assert sorted(row["id"] for row in result["selections"]) == result["declared"], "Prop overrides mismatch actual data"
    assert all(row["actual"] == row["expected"] and row["exact"] is False for row in result["dimensions"])
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", type=Path, required=True, help="Built static site root")
    ap.add_argument("--source-root", type=Path, required=True, help="Repository root containing modules and native save factory")
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--base", default="/", help="Path prefix under the served static root")
    ap.add_argument("--skip-title", action="store_true", help="Skip host launch/return only; all DLC checks still run")
    ap.add_argument("--standalone", type=Path, help="Optional portable HTML to exercise over file:// without HTTP requests")
    ap.add_argument("--expected-raster-count", type=int, help="Pin admitted PNG count to detect a stale build")
    ap.add_argument("--trace-mode", choices=("full", "light"), default="full", help="Light mode keeps assertions and explicit captures but omits automatic screenshots/DOM snapshots")
    ap.add_argument("--scenario", choices=("all", "portable", "host-roundtrips"), default="all", help="Run a remaining scenario in isolation; coverage is explicit in the report")
    ap.add_argument("--software-gpu", action="store_true", help="Declare --disable-gpu for a targeted software-rendering browser check")
    args = ap.parse_args()
    args.root = args.root.resolve();args.source_root = args.source_root.resolve();args.output = args.output.resolve()
    args.output.mkdir(parents=True, exist_ok=True)
    executable = os.environ.get("ATF_CHROMIUM_EXECUTABLE") or os.environ.get("CHROMIUM_PATH") or shutil.which("chromium") or shutil.which("google-chrome")
    assert executable and Path(executable).is_file(), "Set ATF_CHROMIUM_EXECUTABLE to a real Chromium binary"
    fixture = fixtures(args.source_root)
    (args.output / "fixtures.json").write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + "\n")
    browser_args = ["--no-sandbox"]
    if args.software_gpu:
        browser_args.append("--disable-gpu")
    report = {"ok": False, "browser": None, "browserArguments": browser_args,
              "functionalIgnoredDefaultArguments": ["--disable-dev-shm-usage"],
              "ordinaryRoundtripIgnoredDefaultArguments": ["--disable-dev-shm-usage", "--disable-back-forward-cache"],
              "sharedMemory": "/dev/shm", "functionalBackForwardCache": "Playwright default disabled; the separate ordinary roundtrip scenario removes that automation flag",
              "scenario": args.scenario, "traceMode": args.trace_mode, "freshBrowserBetweenScenarios": True, "expectedRasterCount": args.expected_raster_count, "root": str(args.root), "sourceRoot": str(args.source_root),
              "skipHost": args.skip_title, "fixtureDeclaration": fixture["declaration"],
              "checks": [], "walk": [], "routes": [], "pageErrors": [], "resourceErrors": [], "consoleErrors": []}
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(args.root))
    class QuietHandler(handler.func):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(args.root), **kw)
        def log_message(self, *_):
            pass
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True);thread.start()
    origin = f"http://127.0.0.1:{server.server_port}"
    prefix = "/" + args.base.strip("/") + "/" if args.base.strip("/") else "/"
    host_url = origin + prefix
    earth_url = host_url + "dlc/alien-earth/v12/index.html"
    report["urls"] = {"host": host_url, "earth": earth_url}
    contexts = []
    page = None
    p = None
    infrastructure_crash = False
    status = 1
    try:
        p = sync_playwright().start()
        def launch_browser(ordinary=False):
            ignored = ["--disable-dev-shm-usage"]
            if ordinary:
                ignored.append("--disable-back-forward-cache")
            return p.chromium.launch(executable_path=executable, headless=True, args=browser_args, ignore_default_args=ignored)
        browser = launch_browser()
        report["browser"] = browser.version
        def new_context(with_earth=False, earth_override=None):
            storage = dict(fixture["native"])
            if with_earth:
                storage[EARTH_KEY] = earth_override if earth_override is not None else fixture["earth"]
            context = browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True,
                storage_state={"cookies": [], "origins": [{"origin": origin, "localStorage": [{"name": k, "value": v} for k, v in storage.items()]}]})
            context.tracing.start(screenshots=args.trace_mode == "full", snapshots=args.trace_mode == "full", sources=False)
            contexts.append(context)
            pg = context.new_page()
            pg.on("pageerror", lambda error: report["pageErrors"].append(str(error)))
            pg.on("console", lambda msg: report["consoleErrors"].append(msg.text) if msg.type == "error" else None)
            def response_check(response):
                if response.status >= 400 and not response.url.endswith("/favicon.ico"):
                    report["resourceErrors"].append({"status": response.status, "url": response.url})
            pg.on("response", response_check)
            pg.on("requestfailed", lambda req: report["resourceErrors"].append({"url": req.url, "failure": req.failure}))
            return context, pg
        def passed(name, **details):
            report["checks"].append({"name": name, "ok": True, **details})
            (args.output / "earth-v12-browser-progress.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
            print("PASS " + name, flush=True)
        def native_intact(pg):
            actual = read_storage(pg, list(fixture["native"]))
            assert actual == fixture["native"], "Native profile bytes or selected-profile marker changed"

        if args.scenario == "all":
            existing_context, page = new_context(with_earth=True)
            if not args.skip_title:
                page.goto(host_url, wait_until="networkidle")
                page.locator('#title-start').click()
                page.locator('#title-alien-earth').wait_for()
                native_intact(page)
                page.locator('#title-alien-earth').click()
                page.wait_for_url("**/dlc/alien-earth/v12/**", timeout=15000)
                passed("host UI launches Earth")
            else:
                page.goto(earth_url, wait_until="networkidle")
            page.locator('#shell[data-state="title"]').wait_for()
            assert page.evaluate("()=>typeof window.__EARTH_QA") == "undefined", "QA observer exposed on normal route"
            assert "12.0.0" in page.locator("#panel").inner_text(), "Title version is not 12.0.0"
            page.evaluate("()=>document.dispatchEvent(new Event('visibilitychange'))")
            page.wait_for_timeout(200)
            assert read_storage(page, [EARTH_KEY])[EARTH_KEY] == fixture["earth"], "Title/visibility overwrote existing Earth save"
            native_intact(page)
            passed("normal title preserves existing Earth/native bytes and omits QA observer")
            page.screenshot(path=str(args.output / "earth-title.png"))
            existing_context.tracing.stop(path=str(args.output / "title-trace.zip"))
            existing_context.close();contexts.remove(existing_context)
            browser.close();browser = launch_browser()

            context, page = new_context()
            page.goto(earth_url + "?qa=1", wait_until="networkidle")
            page.wait_for_function("()=>!!window.__EARTH_QA")
            page.evaluate("()=>document.dispatchEvent(new Event('visibilitychange'))")
            assert read_storage(page, [EARTH_KEY])[EARTH_KEY] is None, "Title created an Earth save before play"
            native_intact(page)
            passed("fresh title does not create a save")
            page.locator('[data-act="new"]').click()
            if page.locator('[data-act="confirmNew"]').count():
                page.locator('[data-act="confirmNew"]').click()
            page.locator('[data-act="start"]').click()
            page.locator('#shell[data-state="playing"]').wait_for()
            initial = state(page)
            assert initial["room"] == "R01" and initial["completed"] == []
            page.keyboard.down("ArrowRight");page.wait_for_timeout(360);page.keyboard.up("ArrowRight")
            moved = state(page)
            assert moved["player"]["x"] > initial["player"]["x"] + 10 and moved["completed"] == []
            passed("new game and movement use actual UI/keyboard", xBefore=initial["player"]["x"], xAfter=moved["player"]["x"])
            cross_door(page, "R02", report)
            cross_door(page, "R01", report)
            returned = state(page)
            assert "R02" in returned["visited"] and returned["completed"] == []
            passed("physical R01 to R02 and back; no remote objective completion")
            page.keyboard.press("Escape")
            page.locator('#shell[data-state="pause"]').wait_for()
            paused = state(page)
            page.wait_for_timeout(350)
            assert state(page)["playSeconds"] == paused["playSeconds"], "Pause advanced simulation"
            with page.expect_download() as pending:
                page.locator('[data-act="export"]').click()
            export_path = args.output / "earth-export.json"
            pending.value.save_as(str(export_path))
            exported = json.loads(export_path.read_text())
            assert exported["schema"] == 11 and exported["room"] == "R01" and exported["completed"] == [] and exported["playSeconds"] > 0
            assert exported["player"]["x"] == paused["player"]["x"]
            passed("pause freezes simulation and UI export preserves current position")
            page.locator('[data-act="title"]').click()
            saved_raw = read_storage(page, [EARTH_KEY])[EARTH_KEY]
            assert saved_raw is not None
            page.reload(wait_until="networkidle")
            assert read_storage(page, [EARTH_KEY])[EARTH_KEY] == saved_raw, "Reload title modified serialized save"
            page.locator('[data-act="continue"]').click()
            page.keyboard.press("Escape")
            reloaded = state(page)
            assert reloaded["room"] == "R01" and reloaded["completed"] == [] and abs(reloaded["player"]["x"] - exported["player"]["x"]) < 0.001
            passed("save/reload/continue preserves room and exact position")
            with page.expect_file_chooser() as chooser:
                page.locator('[data-act="import"]').click()
            chooser.value.set_files(str(export_path))
            page.wait_for_function("()=>document.getElementById('toast').textContent.includes('importée')")
            imported = state(page)
            assert imported["room"] == exported["room"] and imported["completed"] == exported["completed"] and imported["player"] == exported["player"]
            assert imported["playSeconds"] == exported["playSeconds"]
            native_intact(page)
            passed("real file chooser import restores exported state; native profiles remain untouched")
            report["raster"] = raster_probe(page, args.output)
            if args.expected_raster_count is not None:
                assert len(report["raster"]["dimensions"]) == args.expected_raster_count, "Built raster count differs from release admission"
            passed("all raster PNGs decode at declared dimensions; real Canvas draws and fallback selectors are correct", assets=len(report["raster"]["dimensions"]))
            page.screenshot(path=str(args.output / "earth-pause-desktop.png"))
            page.set_viewport_size({"width": 390, "height": 844})
            page.wait_for_timeout(250)
            mobile = page.evaluate("""()=>{
              const p=document.getElementById('panel').getBoundingClientRect();
              return {viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,panel:{x:p.x,right:p.right,width:p.width,height:p.height},canvas:{width:document.getElementById('game').width,height:document.getElementById('game').height}};
            }""")
            assert mobile["pageWidth"] <= 391 and mobile["panel"]["x"] >= -1 and mobile["panel"]["right"] <= 391, f"Mobile menu overflow: {mobile}"
            page.screenshot(path=str(args.output / "earth-pause-mobile.png"), full_page=True)
            passed("390px mobile pause menu stays within viewport", geometry=mobile)
            page.locator('[data-act="resume"]').click()
            page.wait_for_timeout(200)
            assert page.locator("#game").is_visible()
            page.screenshot(path=str(args.output / "earth-game-mobile.png"))
            page.keyboard.press("Escape")
            native_intact(page)
            report["finalState"] = state(page)
            if not args.skip_title:
                page.locator('[data-act="title"]').click()
                link = page.locator('[data-act="host"]')
                assert link.count(), "Missing real host return button"
                link.first.click()
                page.wait_for_url(lambda url: "/dlc/alien-earth/" not in url, timeout=15000)
                assert "/dlc/alien-earth/" not in page.url, "Host return link did not leave DLC"
                native_intact(page)
                passed("host return link works and preserves native profiles")
            assert report["pageErrors"] == [], f"Browser page errors: {report['pageErrors']}"
            assert report["resourceErrors"] == [], f"{len(report['resourceErrors'])} failed resources; first five: {report['resourceErrors'][:5]} (full list in JSON report)"
            passed("no JavaScript exceptions or failed application resources")
            context.tracing.stop(path=str(args.output / "game-trace.zip"))
            context.close();contexts.remove(context)
            browser.close();browser = launch_browser()

            # Explicit synthetic checkpoint, kept separate from the physical R01/R02
            # journey above. No QA mutator, teleporter or progression action is used.
            scene_context, page = new_context(with_earth=True, earth_override=fixture["zoo"])
            page.goto(earth_url + "?qa=1", wait_until="networkidle")
            page.locator('[data-act="continue"]').click()
            page.wait_for_function("()=>window.__EARTH_QA.state().room==='R18'")
            wait_rasters_ready(page)
            page.wait_for_timeout(180)
            report["zooScene"] = page.evaluate("""async()=>{
              const r=await import('./src/alien-earth-raster-v12.js');
              const e=window.__EARTH_QA.engine();
              return {declaration:'Separate initial R18 visual fixture, loaded through Continue; not a campaign progression proof.',room:e.room.id,powered:e.powered,player:{...e.player},diagnostics:r.getEarthRasterDiagnosticsV12()};
            }""")
            zoo_assets = {row["id"]: row for row in report["zooScene"]["diagnostics"]["assets"]}
            assert zoo_assets["zoo-lab-table"]["draws"] > 0, "Zoo table did not render in real scene"
            for asset in ("zoo-pipette", "zoo-microscope"):
                if asset in zoo_assets:
                    assert zoo_assets[asset]["draws"] > 0, f"Admitted {asset} did not render in Zoo fixture"
            if "zoo-wall-light" in zoo_assets and not report["zooScene"]["powered"]:
                assert zoo_assets["zoo-wall-light"]["draws"] == 0, "Lit lamp drawn in unpowered real R18 scene"
                if "zoo-wall-light-off" in zoo_assets:
                    assert zoo_assets["zoo-wall-light-off"]["draws"] > 0, "Original unlit lamp PNG was not used in real R18"
            page.locator("#game").screenshot(path=str(args.output / "earth-zoo-fixture.png"))
            page.keyboard.press("Escape")
            native_intact(page)
            passed("declared R18 checkpoint renders actual Zoo props without QA mutators")
            scene_context.tracing.stop(path=str(args.output / "zoo-fixture-trace.zip"))
            scene_context.close();contexts.remove(scene_context)

        if not args.skip_title and args.scenario in ("all", "host-roundtrips"):
            # One ordinary browser/context for both complete round trips: no
            # reload by the harness, cache reset, route interception or fixture
            # reinjection between cycles. This specifically covers the earlier
            # crash observed after loading the host's decoded image atlases.
            browser.close();browser = launch_browser(ordinary=True)
            repeated_context, page = new_context(with_earth=True)
            page.add_init_script("""window.__ATF_QA_PAGESHOWS=[];addEventListener('pageshow',e=>window.__ATF_QA_PAGESHOWS.push({persisted:e.persisted,url:location.href,timeOrigin:performance.timeOrigin}));""")
            report["hostDocumentObservations"] = []
            cycles = []
            report["sameBrowserRoundTrips"] = {"cycles": cycles, "browserResetBetweenCycles": False, "backForwardCacheDisableFlagRemoved": True, "status": "running"}
            page.goto(host_url, wait_until="networkidle")
            for cycle in (1, 2):
                page.locator('#title-start:visible, #title-alien-earth:visible').first.wait_for()
                if page.locator('#title-start').is_visible():
                    page.locator('#title-start').click()
                page.locator('#title-alien-earth').wait_for()
                native_intact(page)
                assert read_storage(page, [EARTH_KEY])[EARTH_KEY] == fixture["earth"]
                native_before = document_observation(page)
                report["hostDocumentObservations"].append({"cycle": cycle, "stage": "native-before-earth", **native_before})
                page.locator('#title-alien-earth').click()
                page.wait_for_url("**/dlc/alien-earth/v12/**", timeout=15000)
                page.locator('#shell[data-state="title"]').wait_for()
                page.wait_for_timeout(500)
                assert read_storage(page, [EARTH_KEY])[EARTH_KEY] == fixture["earth"], "Repeated title visit changed Earth bytes"
                native_intact(page)
                report["hostDocumentObservations"].append({"cycle": cycle, "stage": "earth-title", **document_observation(page)})
                if cycle == 1:
                    page.locator('[data-act="host"]').click()
                    return_method = "UI host button"
                else:
                    page.go_back(wait_until="commit")
                    return_method = "real browser history back"
                page.wait_for_url(lambda url: "/dlc/alien-earth/" not in url, wait_until="commit", timeout=15000)
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(300)
                native_intact(page)
                assert read_storage(page, [EARTH_KEY])[EARTH_KEY] == fixture["earth"], "Repeated return changed Earth bytes"
                native_after = document_observation(page)
                report["hostDocumentObservations"].append({"cycle": cycle, "stage": "native-after-return", **native_after})
                page_shows = page.evaluate("()=>window.__ATF_QA_PAGESHOWS||[]")
                entry_before = (native_before.get("navigationEntry") or {}).get("key")
                entry_after = (native_after.get("navigationEntry") or {}).get("key")
                cycles.append({"cycle": cycle, "url": page.url, "returnMethod": return_method, "pageShowEvents": page_shows, "earthBytesPreserved": True, "nativeBytesPreserved": True,
                    "nativeTimeOriginBefore": native_before["timeOrigin"], "nativeTimeOriginAfter": native_after["timeOrigin"],
                    "sameNativeDocumentAfterReturn": native_before["timeOrigin"] == native_after["timeOrigin"],
                    "nativeEntryKeyBefore": entry_before, "nativeEntryKeyAfter": entry_after,
                    "sameNativeHistoryEntryAfterReturn": entry_before == entry_after if entry_before and entry_after else None})
            report["sameBrowserRoundTrips"] = {"cycles": cycles, "browserResetBetweenCycles": False, "backForwardCacheDisableFlagRemoved": True, "status": "complete", "pageshowPersistedObserved": any(event.get("persisted") is True for cycle_result in cycles for event in cycle_result["pageShowEvents"])}
            assert report["pageErrors"] == [] and report["resourceErrors"] == [], "Repeated navigation produced browser/resource errors"
            passed("two consecutive host/Earth/host round trips in one ordinary browser preserve all save bytes", cycles=2)
            repeated_context.tracing.stop(path=str(args.output / "same-browser-roundtrips-trace.zip"))
            repeated_context.close();contexts.remove(repeated_context)

        if args.standalone and args.scenario in ("all", "portable"):
            browser.close();browser = launch_browser()
            portable = args.standalone.resolve()
            assert portable.is_file(), f"Portable HTML missing: {portable}"
            portable_context, page = new_context()
            remote_requests = []
            page.on("request", lambda req: remote_requests.append(req.url) if req.url.startswith(("https://", "http://")) else None)
            page.add_init_script("""window.__EARTH_RASTER_QA_EVENTS=[];document.addEventListener('earth-raster-ready-v12',e=>window.__EARTH_RASTER_QA_EVENTS.push({...e.detail}));""")
            page.goto(portable.as_uri() + "?qa=1", wait_until="load")
            page.locator('[data-act="new"]').click()
            page.locator('[data-act="start"]').click()
            page.locator('#shell[data-state="playing"]').wait_for()
            first = state(page)
            page.keyboard.down("ArrowRight");page.wait_for_timeout(360);page.keyboard.up("ArrowRight")
            assert state(page)["player"]["x"] > first["player"]["x"] + 10
            page.keyboard.press("Escape")
            decoded = page.evaluate("""async specs=>{
              const inline=globalThis.EARTH_RASTER_INLINE_V12||{};
              return Promise.all(specs.map(async spec=>{
                const source=inline[spec.path];
                if(typeof source!=='string'||!source.startsWith('data:image/png;base64,'))throw new Error('Missing inline PNG '+spec.id);
                const image=new Image();image.src=source;await image.decode();
                return {id:spec.id,path:spec.path,expected:[spec.width,spec.height],actual:[image.naturalWidth,image.naturalHeight]};
              }));
            }""", fixture["rasterSpecs"])
            assert all(row["actual"] == row["expected"] for row in decoded), "Portable inline PNG dimensions mismatch"
            page.locator('#panel [data-act="fidelity"]').click()
            page.locator('#panel [data-act="fidelity"][data-tab="cast"]').click()
            requested = ["wendy-idle", "kirsh-idle", "arthur-idle", "curly-idle", "nibs-idle"]
            page.wait_for_function("""ids=>ids.every(id=>window.__EARTH_RASTER_QA_EVENTS.some(e=>e.id===id&&e.status==='ready'))""", arg=requested, timeout=20000)
            inline = page.evaluate("""()=>({paths:Object.keys(globalThis.EARTH_RASTER_INLINE_V12||{}),events:window.__EARTH_RASTER_QA_EVENTS,state:window.__EARTH_QA.state()})""")
            assert inline["state"]["room"] == "R01" and inline["state"]["completed"] == []
            assert not remote_requests, f"Portable HTML made remote requests: {remote_requests}"
            if args.expected_raster_count is not None:
                assert len(inline["paths"]) == args.expected_raster_count, "Portable raster count differs from release admission"
            assert all(event["status"] == "ready" for event in inline["events"]), "Inline raster loader rejected an image"
            page.screenshot(path=str(args.output / "earth-portable-file.png"))
            page.locator('#panel [data-act="close"]').first.click()
            page.keyboard.press("Escape")
            page.locator('#panel [data-act="title"]').click()
            saved_file_raw = read_storage(page, [EARTH_KEY])[EARTH_KEY]
            assert saved_file_raw is not None
            saved_file = json.loads(saved_file_raw)
            assert saved_file["room"] == "R01" and saved_file["completed"] == []
            page.reload(wait_until="load")
            page.locator('[data-act="continue"]').wait_for()
            assert read_storage(page, [EARTH_KEY])[EARTH_KEY] == saved_file_raw, "Portable reload modified save bytes on title"
            page.locator('[data-act="continue"]').click();page.keyboard.press("Escape")
            assert abs(state(page)["player"]["x"] - saved_file["player"]["x"]) < 0.001
            assert not remote_requests, "Portable reload made an HTTP request"
            report["standalone"] = {"path": str(portable), "sha256": hashlib.sha256(portable.read_bytes()).hexdigest(), "remoteRequests": remote_requests,
                "inlineDecodeScope": "All admitted embedded PNG data URLs independently decoded using real Image.decode; this does not preload the application cache.",
                "decoded": decoded, "actualUiLoaderScope": "Five admitted portraits requested by real catalogue buttons and acknowledged by production loader events.",
                "requestedUiAssets": requested, "saveReloadPreserved": True, "savedPlayerX": saved_file["player"]["x"], **inline}
            passed("portable file:// UI and save/reload work; all inline PNGs decode and requested catalogue portraits load without HTTP", assets=len(inline["paths"]))
            portable_context.tracing.stop(path=str(args.output / "portable-trace.zip"))
            portable_context.close();contexts.remove(portable_context)

        assert report["pageErrors"] == [], f"Browser page errors: {report['pageErrors']}"
        assert report["resourceErrors"] == [], f"{len(report['resourceErrors'])} failed resources; first five: {report['resourceErrors'][:5]} (full list in JSON report)"
        browser.close()
        report["ok"] = True;status = 0
    except Exception as error:
        report["error"] = str(error)
        report["traceback"] = traceback.format_exc()
        infrastructure_crash = "crash" in str(error).lower()
        report["infrastructureCrash"] = infrastructure_crash
        (args.output / "earth-v12-browser.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        if page is not None and not infrastructure_crash:
            try:
                report["failureURL"] = page.url
                report["failureState"] = page.evaluate("()=>window.__EARTH_QA?.state?.()||null")
                page.screenshot(path=str(args.output / "failure.png"))
            except Exception:
                pass
        print(report["traceback"], file=sys.stderr, flush=True)
    finally:
        if not infrastructure_crash:
            for i, context in enumerate(contexts):
                try:
                    context.tracing.stop(path=str(args.output / f"failure-trace-{i}.zip"));context.close()
                except Exception:
                    pass
        if p is not None and not infrastructure_crash:
            p.stop()
        server.shutdown();server.server_close()
        report["fixtureHashes"] = {k: hashlib.sha256(v.encode()).hexdigest() for k, v in fixture["native"].items()}
        (args.output / "earth-v12-browser.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"ok": report["ok"], "browser": report["browser"], "checks": len(report["checks"]), "report": str(args.output / "earth-v12-browser.json")}), flush=True)
    return status


if __name__ == "__main__":
    sys.exit(main())
