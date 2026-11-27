"""Chromium qualification of the derived Fleuve presentation.

The playable journey uses native UI, input, save/export and reload. A separately
labelled Canvas fixture calls the real rendering methods for each admitted PNG;
it does not modify the live simulation or stand in for a campaign playthrough.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import tempfile
import threading
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[1]
ROUTE = "/dlc/fleuve-de-la-douleur/"
DERIVED = ROUTE + "visual-v1/JOUER.html"
PREFIX = "atf.dlc.river-of-pain."


def storage(frame, dlc=False):
    return frame.evaluate("""({prefix,dlc}) => Object.fromEntries(
      Object.keys(localStorage).sort().filter(k=>k.startsWith(prefix)===dlc)
      .map(k=>[k,localStorage.getItem(k)]))""", {"prefix": PREFIX, "dlc": dlc})


def observed(frame):
    return frame.evaluate("""() => {
      const s=ROP_APP.simulation.s;
      return {chapter:s.chapter,objective:s.objective,character:s.character,
        room:s.room,mode:s.mode,difficulty:s.difficulty,elapsed:s.elapsed,
        player:{x:s.player.x,z:s.player.z,hp:s.player.hp,ammo:s.player.ammo,
          reserve:s.player.reserve,medkits:s.player.medkits,flares:s.player.flares},
        visited:[...s.visited],collected:[...s.collected],archives:[...s.archives]};
    }""")


def game_frame(page):
    iframe = page.locator("#river-of-pain-game")
    iframe.wait_for(state="attached")
    frame = iframe.element_handle().content_frame()
    if frame is None:
        raise AssertionError("DLC frame did not initialize.")
    frame.wait_for_function("Boolean(globalThis.ROP_APP && globalThis.ROP_DATA)")
    return frame


COMPOSITION = r"""() => {
  const registry=ROP_SPRITES, liveBefore=JSON.stringify(ROP_APP.simulation.s);
  const entries=registry.entries.filter(entry=>entry.status==='ready');
  const columns=4, width=300, height=240, header=45;
  const canvas=document.createElement('canvas');
  canvas.width=columns*width; canvas.height=header+Math.max(1,Math.ceil(entries.length/columns))*height;
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.fillStyle='#10242b';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#e3ead8';ctx.font='16px monospace';
  ctx.fillText('PRESENTATION FIXTURE / actual renderer / no campaign-state changes',16,28);
  const results=[];
  entries.forEach((entry,index)=>{
    const a=entry.asset, id=a.targetIds[0], left=(index%columns)*width, top=header+Math.floor(index/columns)*height;
    ctx.save();
    try{
    ctx.textAlign='left';
    for(let y=0;y<height;y+=20)for(let x=0;x<width;x+=20){
      ctx.fillStyle=((x/20+y/20)%2)?'#284047':'#1c3239';
      ctx.fillRect(left+x,top+y,20,20);
    }
    ctx.fillStyle='#dce6d3';ctx.font='12px monospace';ctx.fillText(a.id,left+10,top+20);
    ctx.fillStyle='#9ab9ab';ctx.font='10px monospace';ctx.fillText(a.category+' / '+a.pose+' / '+a.weapon,left+10,top+36);
    const renderer=new ROP_Renderer(canvas), position={x:left+width*.5,y:top+height-26};
    const factor=a.category==='person'||a.category==='creature'?(.82+.7*.28)
      :a.category==='prop'?(.8+.7*.28):1;
    const extent=Math.max(a.anchor.x-a.bounds.x,a.bounds.x+a.bounds.w-a.anchor.x)*a.height/a.bounds.h;
    const above=(a.anchor.y-a.bounds.y)*a.height/a.bounds.h+(a.category==='prop'&&id==='glass'?53:0);
    const inventory=a.category==='weapon'||a.category==='item';
    const below=(a.bounds.y+a.bounds.h-a.anchor.y)*a.height/a.bounds.h;
    const contentTop=52, contentBottom=height-18;
    renderer.w=width;renderer.h=height;
    renderer.scale=Math.min(1.3,(width/2-18)/Math.max(1,extent*factor),inventory
      ?(contentBottom-contentTop)/Math.max(1,(above+below)*factor)
      :(height-75)/Math.max(1,above*factor));
    // Inventory anchors are near the image centre, not its feet. Centre the
    // visible alpha bounds in the cell without covering the following row.
    if(inventory)position.y=top+(contentTop+contentBottom)/2+(above-below)*renderer.scale*factor/2;
    renderer.reduced=true;
    renderer.project=()=>position;
    // This is a separate presentation context, not ROP_APP.simulation.s.
    renderer.fidelitySim={s:{room:'presentation-fixture',character:id,phase:0,status:'playing',player:{x:0,z:.7},
      passages:{transit:null},armory:{kits:{brackett:{selected:a.weapon},paris:{selected:a.weapon}}}},cooldown:0};
    let draws=0;
    const drawImage=ctx.drawImage;
    ctx.drawImage=function(){draws++;return drawImage.apply(this,arguments);};
    try{
      const body={x:0,z:.7,facing:a.facing||1,walk:0,hp:100};
      if(a.category==='person'){
        const resident=ROP_DATA.life.residents.find(def=>def.id===id);
        if(resident)body.appearance=resident;
        body.crouch=a.pose==='crouch';body.stowed=a.pose==='stowed';
        if(resident&&a.accessory)renderer.resident({...body,wait:1,alarm:0},resident,renderer.fidelitySim);
        else renderer.person(body,resident?'anne':id,Boolean(ROP_DATA.characters[id]));
      }else if(a.category==='creature'){
        renderer.creature({...body,id:'presentation-'+id,kind:id,hp:72,state:'patrol'});
      }else if(a.category==='prop'){
        const native=ROP_DATA.rooms.flatMap(room=>room.props).find(prop=>prop.kind===id);
        renderer.prop({...native,...body,id:'presentation-'+id,kind:id,collidable:Boolean(native?.collidable)},
          {kind:'depth'},renderer.fidelitySim.s);
      }else if(a.category==='weapon'||a.category==='item'){
        registry.draw(ctx,entry,{...position,scale:renderer.scale,facing:0});
      }
    }finally{ctx.drawImage=drawImage;}
    ctx.strokeStyle='#b3a277';ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(position.x-12,position.y);ctx.lineTo(position.x+12,position.y);
    ctx.moveTo(position.x,position.y-4);ctx.lineTo(position.x,position.y+4);ctx.stroke();
    results.push({id:a.id,category:a.category,target:id,accessory:a.accessory||null,pngDraws:draws});
    }finally{ctx.restore();}
  });
  // A file:// image may taint this Canvas without preventing its display.
  // Keep browser origin protections intact and let Playwright capture the
  // displayed element instead of reading its pixels through Canvas export.
  canvas.id='river-sprite-composition-fixture';
  canvas.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;display:block;'
    +'width:'+canvas.width+'px;height:'+canvas.height+'px;max-width:none;max-height:none;pointer-events:none';
  document.body.appendChild(canvas);
  return {canvasId:canvas.id,width:canvas.width,height:canvas.height,results,
    liveStateUnchanged:JSON.stringify(ROP_APP.simulation.s)===liveBefore};
}"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=REPO / "dist")
    parser.add_argument("--output", type=Path, default=Path(tempfile.gettempdir()) / "river-sprites-browser")
    parser.add_argument("--executable", type=Path, help="Chromium binary; otherwise ATF_CHROMIUM_EXECUTABLE or Playwright.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dlc-only", action="store_true", help="Wrapper and DLC only; no host title/return claim.")
    mode.add_argument("--file-only", action="store_true", help="Open the derived HTML directly as file://; no wrapper or host claim.")
    args = parser.parse_args()
    root, output = args.root.resolve(), args.output.resolve()
    if output == REPO or REPO in output.parents or output == root or root in output.parents:
        parser.error("Evidence must be written outside the checkout and served distribution.")
    output.mkdir(parents=True, exist_ok=True)
    mode_name = "file" if args.file_only else "dlc-only" if args.dlc_only else "integration"
    report = {"status": "running", "mode": mode_name, "checks": [], "captures": [], "pageErrors": [],
        "httpErrors": [], "requestFailures": [], "assets": [],
        "method": "Native game controls and storage; separate labelled real-Canvas presentation fixture.",
        "limitations": [
            "No complete campaign or animation coverage is claimed.",
            "The presentation fixture draws admitted states; it is not a saved gameplay scenario.",
            "Service workers are blocked in this isolated sprite journey; no offline precache claim.",
            "This journey starts a fresh browser profile. Existing populated-host save qualification is the separate qa-river-of-pain.py suite.",
            "PNG composition must be visually reviewed from the emitted images before declaring an artistic fidelity result."]}
    if args.dlc_only or args.file_only:
        report["limitations"].append("Host title, established Frontier save and return are outside this mode.")
    started = time.monotonic()
    server = browser = context = page = None
    browser_started = False

    def check(name, condition):
        report["checks"].append({"name": name, "passed": bool(condition)})
        if not condition:
            raise AssertionError(name)

    def screenshot(name):
        page.screenshot(path=str(output / name), full_page=True)
        report["captures"].append({"file": name, "kind": "native-browser-screenshot"})

    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            pass

        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

    try:
        from playwright.sync_api import sync_playwright
        derived = root / DERIVED.lstrip("/")
        check("Derived standalone exists", derived.is_file())
        report["derivedSHA256"] = hashlib.sha256(derived.read_bytes()).hexdigest()
        report["playwrightVersion"] = importlib.metadata.version("playwright")
        if not args.file_only:
            check("Integration wrapper exists", (root / ROUTE.lstrip("/") / "index.html").is_file())
            server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(root)))
            server.daemon_threads = True
            threading.Thread(target=server.serve_forever, daemon=True).start()
            base = "http://127.0.0.1:" + str(server.server_port)
        else:
            base = None
        with sync_playwright() as pw:
            executable = str(args.executable) if args.executable else os.environ.get("ATF_CHROMIUM_EXECUTABLE")
            launch = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
            if executable:
                launch["executable_path"] = executable
            browser = pw.chromium.launch(**launch)
            browser_started = True
            report["browserVersion"] = browser.version
            context = browser.new_context(viewport={"width": 1440, "height": 1000},
                locale="fr-FR", accept_downloads=True, service_workers="block")
            page = context.new_page()
            page.set_default_timeout(20000)
            page.on("pageerror", lambda error: report["pageErrors"].append(str(error)))
            page.on("response", lambda response: report["httpErrors"].append(
                {"path": urlparse(response.url).path, "status": response.status})
                if response.status >= 400 and not response.url.endswith("/favicon.ico") else None)
            page.on("requestfailed", lambda request: report["requestFailures"].append(
                {"path": urlparse(request.url).path, "failure": request.failure})
                if request.failure != "net::ERR_ABORTED" and not request.url.endswith("/favicon.ico") else None)
            if args.file_only:
                page.goto(derived.as_uri(), wait_until="domcontentloaded")
                frame = page
                frame.wait_for_function("Boolean(globalThis.ROP_APP && globalThis.ROP_SPRITES)")
            else:
                if args.dlc_only:
                    page.goto(base + ROUTE, wait_until="domcontentloaded")
                else:
                    check("Built host index exists", (root / "index.html").is_file())
                    page.goto(base + "/", wait_until="domcontentloaded")
                    page.locator("#title-start").click(timeout=60000)
                    page.locator("#title-river-of-pain").wait_for(state="visible", timeout=60000)
                    page.locator("#title-river-of-pain").click()
                    page.wait_for_url(base + ROUTE)
                    check("Native host title opens DLC wrapper", page.url == base + ROUTE)
                frame = game_frame(page)
                check("Wrapper selects the derived standalone", urlparse(frame.url).path == DERIVED)
            baseline = storage(frame)
            frame.evaluate("() => ROP_SPRITES.settled")
            assets = frame.evaluate("""() => ROP_SPRITES.entries.map(e=>({
              id:e.asset.id,file:e.asset.file,category:e.asset.category,targetIds:e.asset.targetIds,
              sha256:e.asset.sha256,status:e.status,error:e.error,
              width:e.image?.naturalWidth||0,height:e.image?.naturalHeight||0,
              url:e.image?.src||''}))""")
            check("Production manifest is nonempty", bool(assets))
            check("All declared PNGs decode in Chromium", all(a["status"] == "ready" for a in assets))
            for asset in assets:
                expected = (derived.parent / asset["file"]).resolve()
                check("PNG bytes match manifest: " + asset["id"],
                    hashlib.sha256(expected.read_bytes()).hexdigest() == asset["sha256"])
                if args.file_only:
                    check("Local relative PNG resolves: " + asset["id"], asset["url"] == expected.as_uri())
                else:
                    check("HTTP relative PNG resolves: " + asset["id"],
                        urlparse(asset["url"]).path == ROUTE + "visual-v1/" + asset["file"])
                report["assets"].append({k: v for k, v in asset.items() if k != "url"})
            frame.locator("#difficulty").select_option("story")
            frame.locator("#start").click()
            frame.get_by_role("button", name="PRENDRE LE CONTRÔLE", exact=True).click()
            frame.wait_for_function("ROP_APP.started && !ROP_APP.modal")
            initial = observed(frame)
            frame.locator("#scene").focus()
            page.keyboard.down("KeyD")
            page.wait_for_timeout(300)
            page.keyboard.up("KeyD")
            page.wait_for_timeout(150)
            screenshot("01-derived-native-scene.png")
            page.keyboard.press("Escape")
            frame.wait_for_function("ROP_APP.modal==='pause'")
            expected_state = observed(frame)
            check("Native movement remains playable", expected_state["player"]["x"] > initial["player"]["x"])
            check("Presentation preserves non-DLC storage", storage(frame) == baseline)
            with page.expect_download() as downloaded:
                frame.get_by_role("button", name="EXPORTER", exact=True).click()
            export = output / "native-dlc-export.json"
            downloaded.value.save_as(str(export))
            exported = json.loads(export.read_text())
            check("Native export retains the observed position",
                exported["state"]["player"]["x"] == expected_state["player"]["x"])
            frame.get_by_role("button", name="MENU PRINCIPAL", exact=True).click()
            frame.locator("#continue").wait_for(state="visible")
            check("Native DLC save slots exist", any(k.endswith((".slot0", ".slot1")) for k in storage(frame, True)))
            page.reload(wait_until="domcontentloaded")
            frame = page if args.file_only else game_frame(page)
            frame.locator("#continue").click()
            frame.get_by_role("button", name="REPRENDRE LE PARCOURS", exact=True).wait_for(state="visible")
            check("Actual reload restores the same observed state", observed(frame) == expected_state)
            check("Actual reload preserves non-DLC storage", storage(frame) == baseline)
            frame.evaluate("() => ROP_SPRITES.settled")
            original_viewport = page.viewport_size
            fixture_id = "river-sprite-composition-fixture"
            try:
                composition = frame.evaluate(COMPOSITION)
                check("Presentation fixture leaves live simulation unchanged", composition["liveStateUnchanged"])
                check("Every admitted asset reaches its renderer", all(row["pngDraws"] == 1 for row in composition["results"]))
                # The native game is paused. Extra vertical room also contains
                # the wrapper header so its iframe cannot crop the fixture.
                page.set_viewport_size({
                    "width": max(original_viewport["width"], composition["width"] + 32),
                    "height": max(original_viewport["height"], composition["height"] + 160),
                })
                frame.locator("#" + composition["canvasId"]).screenshot(
                    path=str(output / "02-renderer-composition.png"))
                report["composition"] = composition["results"]
                report["captures"].append({"file": "02-renderer-composition.png", "kind": "labelled-canvas-presentation-fixture"})
            finally:
                try:
                    frame.evaluate("id => document.getElementById(id)?.remove()", fixture_id)
                finally:
                    page.set_viewport_size(original_viewport)
            declared_items = {identity for a in assets if a["category"] == "item" for identity in a["targetIds"]}
            if declared_items:
                frame.get_by_role("button", name="REPRENDRE LE PARCOURS", exact=True).click()
                frame.locator("#scene").focus()
                page.keyboard.press("KeyI")
                frame.wait_for_function("ROP_APP.modal==='equipment'")
                # Rations are eaten in supply dialogs, never carried as an
                # invented inventory stack. Their real supply markup is covered
                # by the Node UI suite; this browser step uses the live kit.
                expected_items = declared_items & {"cell", "wire", "casing", "decoy", "medkit", "flare", "light", "tracker", "weld"}
                if "ammo" in declared_items and frame.evaluate("ROP_APP.simulation.character.weapon && ROP_ARMORY.active(ROP_APP.simulation.s)==='pulse'"):
                    expected_items.add("ammo")
                frame.wait_for_function("""wanted => wanted.every(id =>
                  [...document.querySelectorAll('img[data-river-item]')].some(image =>
                    image.dataset.riverItem===id && image.complete && image.naturalWidth>0))""",
                    arg=sorted(expected_items))
                shown = frame.locator("img[data-river-item]").evaluate_all("images => images.map(image=>image.dataset.riverItem)")
                check("Declared equipment PNGs appear beside native controls and counts", expected_items.issubset(set(shown)))
                report["nativeInventoryImages"] = sorted(set(shown))
                screenshot("03-native-inventory.png")
            if not args.file_only:
                frame.locator("#scene").focus()
                page.keyboard.press("F6")
                check("F6 remains available from derived iframe",
                    page.evaluate("document.activeElement?.id==='river-return-tantalus'"))
                dlc_saved = storage(frame, True)
                departure_state = observed(frame)
                page.locator("#river-original-game").click()
                original = game_frame(page)
                original.wait_for_url(base + ROUTE + "JOUER.html", wait_until="load")
                original.wait_for_function("Boolean(globalThis.ROP_APP && globalThis.ROP_DATA)")
                check("Original entry loads exact archived route", urlparse(original.url).path == ROUTE + "JOUER.html")
                check("Original entry contains no PNG adapter", original.evaluate("!globalThis.ROP_SPRITES"))
                after_departure = storage(original, True)
                report["nativeDlcDepartureFlush"] = {"changedKeys": sorted(
                    key for key in set(dlc_saved) | set(after_departure)
                    if dlc_saved.get(key) != after_departure.get(key))}
                original.locator("#continue").click()
                original.get_by_role("button", name="REPRENDRE LE PARCOURS", exact=True).wait_for(state="visible")
                check("Original entry resumes the derived native state", observed(original) == departure_state)
                check("Original entry preserves non-DLC storage", storage(original) == baseline)
                original.locator("#scene").focus()
                page.keyboard.press("F6")
                check("F6 remains available from original iframe",
                    page.evaluate("document.activeElement?.id==='river-return-tantalus'"))
                if not args.dlc_only:
                    page.locator("#river-return-tantalus").click()
                    page.wait_for_url(base + "/")
                    page.locator("#title-start").wait_for(state="visible", timeout=60000)
                    check("Return opens native host title", page.locator("#title-screen").is_visible())
                    check("Host return preserves non-DLC storage", storage(page) == baseline)
            check("No page JavaScript errors", not report["pageErrors"])
            check("No failed game HTTP responses", not report["httpErrors"])
            check("No failed game network requests", not report["requestFailures"])
            report["status"] = "passed"
    except Exception as error:
        report["status"] = "failed" if browser_started or isinstance(error, AssertionError) else "blocked"
        # Full host paths and transient browser profile identifiers do not belong
        # in a committed evidence report. Keep the first useful error line only.
        report["failure"] = str(error).splitlines()[0]
        if page is not None:
            try:
                screenshot("failure.png")
            except Exception:
                pass
    finally:
        for resource in (context, browser):
            if resource is not None:
                try:
                    resource.close()
                except Exception:
                    pass
        if server is not None:
            server.shutdown()
            server.server_close()
        report["elapsedSeconds"] = round(time.monotonic() - started, 3)
        (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({"status": report["status"], "mode": report["mode"],
            "checks": len(report["checks"]), "failure": report.get("failure")}, ensure_ascii=False))
    return 0 if report["status"] == "passed" else 2 if report["status"] == "blocked" else 1


if __name__ == "__main__":
    raise SystemExit(main())
