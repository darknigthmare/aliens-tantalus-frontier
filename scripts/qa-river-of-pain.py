"""Real Frontier-to-DLC journey; evaluations only observe state and storage.

A declared Frontier fixture enters through the normal file chooser. All DLC
changes use ordinary controls. No simulation, health, objective, clock or
localStorage injection is used.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile
import threading
import time
import traceback
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[1]
PREFIX = "atf.dlc.river-of-pain."
ROUTE = "/dlc/fleuve-de-la-douleur/"
FIXTURE = {"schema":52, "player":{"name":"River QA Sentinel"},
           "statistics":{"kills":3}, "settings":{"reducedMotion":True},
           "needsPlayerCreationV84":False}

def storage(page, dlc=False):
    return page.evaluate("""({prefix,dlc}) => Object.fromEntries(
      Object.keys(localStorage).sort().filter(k=>k.startsWith(prefix)===dlc)
      .map(k=>[k,localStorage.getItem(k)]))""", {"prefix":PREFIX,"dlc":dlc})

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False,
                                    separators=(",",":")).encode()).hexdigest()

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
    el=page.locator("#river-of-pain-game")
    el.wait_for(state="attached",timeout=30000)
    frame=el.element_handle().content_frame()
    if frame is None: raise AssertionError("DLC iframe has no browsing context")
    frame.wait_for_function("Boolean(globalThis.ROP_APP && globalThis.ROP_DATA)",timeout=30000)
    return frame

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=REPO/"dist")
    parser.add_argument("--output",type=Path,default=Path(tempfile.gettempdir())/"atf-river-of-pain-qa")
    parser.add_argument("--dlc-only",action="store_true",
                        help="Isolated smoke; no claim about host launch, populated host saves or return.")
    parser.add_argument("--no-slash-only",action="store_true",
                        help="Serve the exact wrapper at the slashless URL without a redirect; test its absolute asset and return routes.")
    args=parser.parse_args()
    if args.dlc_only and args.no_slash_only:
        parser.error("Choose either isolated DLC smoke or the slashless route check.")
    root,output=args.root.resolve(),args.output.resolve()
    if output==REPO or REPO in output.parents:
        raise SystemExit("QA output must remain outside the repository.")
    output.mkdir(parents=True,exist_ok=True)
    report={"status":"running","mode":"no-slash" if args.no_slash_only else "dlc-only" if args.dlc_only else "integration",
      "checks":[],"captures":[],"pageErrors":[],"httpErrors":[],
      "requestFailures":[],"navigationAborts":[],
      "method":"Real HTTP, public import, keyboard menu, normal DLC controls, native storage and real reload. Evaluations observe only.",
      "limitations":["One isolated browser profile; not concurrent-tab, quota or hardware coverage.",
        "Service workers blocked to isolate this journey; no offline guarantee.",
        "Frontier unload flush precedes the byte-preservation baseline; changed keys are recorded separately."]}
    if args.dlc_only:
        report["limitations"].append("No host launch/return or populated Frontier-storage check in isolated DLC mode.")
    if args.no_slash_only:
        report["limitations"].append("Controlled HTTP alias serves the exact built wrapper at a slashless URL without redirecting. This isolates relative-URL regressions; it is not a claim about a hosting provider redirect policy.")
    start=time.monotonic()
    server=browser=context=page=None
    def check(name,condition):
        report["checks"].append({"name":name,"passed":bool(condition)})
        if not condition: raise AssertionError(name)
    def shot(name):
        page.screenshot(path=str(output/name),full_page=True)
        report["captures"].append(name)
    class Handler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if args.no_slash_only and urlparse(self.path).path==ROUTE.rstrip("/"):
                body=(root/ROUTE.strip("/")/"index.html").read_bytes()
                self.send_response(200)
                self.send_header("Content-Type","text/html; charset=utf-8")
                self.send_header("Content-Length",str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            super().do_GET()
        def log_message(self,*_args): pass
        def end_headers(self):
            self.send_header("Cache-Control","no-store")
            super().end_headers()
    try:
        from playwright.sync_api import sync_playwright
        check("Served root has an index",(root/"index.html").is_file())
        module=root if args.dlc_only and (root/"JOUER.html").is_file() else root/ROUTE.strip("/")
        check("Recovered playable HTML exists",(module/"JOUER.html").is_file())
        playable_sha=hashlib.sha256((module/"JOUER.html").read_bytes()).hexdigest()
        report["playableSHA256"]=playable_sha
        if (root/"build-info.json").is_file():
            report["buildInfo"]=json.loads((root/"build-info.json").read_text())
        elif not args.dlc_only:
            raise AssertionError("Integration QA requires build-info.json from a built distribution")
        server=ThreadingHTTPServer(("127.0.0.1",0),partial(Handler,directory=str(root)))
        server.daemon_threads=True
        threading.Thread(target=server.serve_forever,daemon=True).start()
        base=f"http://127.0.0.1:{server.server_port}"
        route="/" if module==root else ROUTE
        report["servedRoute"]=route
        with sync_playwright() as pw:
            executable=os.environ.get("ATF_CHROMIUM_EXECUTABLE") or pw.chromium.executable_path
            check("Chromium executable is installed",Path(executable).is_file())
            browser=pw.chromium.launch(headless=True,executable_path=executable,
                                      args=["--no-sandbox","--disable-dev-shm-usage"])
            report["browserVersion"]=browser.version
            context=browser.new_context(viewport={"width":1440,"height":900},locale="fr-FR",
                                        accept_downloads=True,service_workers="block")
            page=context.new_page()
            page.set_default_timeout(15000)
            page.on("pageerror",lambda e:report["pageErrors"].append(str(e)))
            page.on("response",lambda r:report["httpErrors"].append(
                {"path":urlparse(r.url).path,"status":r.status}) if r.status>=400 else None)
            def request_failed(r):
                record={"path":urlparse(r.url).path,"failure":r.failure}
                report["navigationAborts" if r.failure=="net::ERR_ABORTED" else "requestFailures"].append(record)
            page.on("requestfailed",request_failed)
            response=page.request.get(base+route+"JOUER.html")
            check("HTTP serves exact recovered playable bytes",
                  response.status==200 and hashlib.sha256(response.body()).hexdigest()==playable_sha)
            if args.no_slash_only:
                alias=base+ROUTE.rstrip("/")
                page.goto(alias,wait_until="domcontentloaded")
                frame=game_frame(page)
                check("Slashless request retains its URL without a redirect",page.url==alias)
                check("Slashless wrapper resolves exact playable route",
                      page.locator("#river-of-pain-game").evaluate("(el)=>el.src")==base+ROUTE+"visual-v1/JOUER.html")
                check("Slashless wrapper resolves its stylesheet",
                      page.locator('link[rel="stylesheet"]').evaluate("(el)=>el.href")==base+ROUTE+"integration.css")
                check("Slashless wrapper resolves its integration script",
                      page.locator('script[type="module"]').evaluate("(el)=>el.src")==base+ROUTE+"integration.js")
                # ROP_APP becomes available before the iframe's load event.
                # Wait for the real shell handler while its PNG requests finish.
                page.locator("#river-loading").wait_for(state="hidden",timeout=30000)
                check("Wrapper load handler has completed",page.locator("#river-loading").is_hidden())
                frame.locator("#difficulty").select_option("story")
                frame.locator("#start").click()
                frame.get_by_role("button",name="PRENDRE LE CONTRÔLE",exact=True).click()
                initial=observed(frame)
                frame.locator("#scene").focus()
                page.keyboard.down("KeyD")
                page.wait_for_timeout(300)
                page.keyboard.up("KeyD")
                page.keyboard.press("Escape")
                frame.wait_for_function("ROP_APP.modal==='pause'")
                check("Slashless launch accepts normal game input",
                      observed(frame)["player"]["x"]>initial["player"]["x"])
                page.keyboard.press("F6")
                check("Slashless wrapper has live return keyboard handling",
                      page.evaluate("document.activeElement?.id==='river-return-tantalus'"))
                check("Slashless return resolves to host root",
                      page.locator("#river-return-tantalus").evaluate("(el)=>el.href")==base+"/")
                shot("slashless-wrapper.png")
                check("No JavaScript page errors",not report["pageErrors"])
                check("No failed HTTP response",not report["httpErrors"])
                check("No failed non-navigation request",not report["requestFailures"])
                report["status"]="passed"
                context.close();context=None
                browser.close();browser=None
                return 0
            if args.dlc_only:
                page.goto(base+route,wait_until="domcontentloaded")
            else:
                page.goto(base+"/",wait_until="domcontentloaded")
                page.locator("#title-start").click(timeout=60000)
                page.locator("#title-options").click()
                page.locator('[data-panel="settings"].active').wait_for()
                page.locator("#save-import").set_input_files({"name":"river-qa-frontier-fixture.json",
                    "mimeType":"application/json","buffer":json.dumps(FIXTURE).encode()})
                page.wait_for_function("__ATF_V51__.saveSystem.data.player.name === 'River QA Sentinel'")
                report["fixture"]={"method":"Native Frontier file import","payload":FIXTURE}
                page.locator("#return-title").click()
                page.locator("#title-screen").wait_for(state="visible")
                if page.locator("#title-start").is_visible(): page.locator("#title-start").click()
                page.locator("#title-river-of-pain").wait_for(state="visible")
                before=storage(page)
                check("Native Frontier profile exists","atf-v47-profile-1" in before)
                check("Imported campaign identity is intact",
                      json.loads(before["atf-v47-profile-1"])["player"]["name"]=="River QA Sentinel")
                page.keyboard.press("Home")
                order=[]
                for _ in range(8):
                    focused=page.evaluate("document.activeElement?.id")
                    order.append(focused)
                    if focused=="title-river-of-pain": break
                    page.keyboard.press("ArrowDown")
                report["titleFocusOrder"]=order
                check("DLC reachable using native title keyboard controls",order[-1]=="title-river-of-pain")
                shot("01-frontier-dlc-menu.png")
                page.keyboard.press("Enter")
                page.wait_for_url(base+route)
            frame=game_frame(page)
            baseline=storage(page)
            if not args.dlc_only:
                report["nativeDepartureFlush"]={
                  "changedKeys":sorted(k for k in set(before)|set(baseline) if before.get(k)!=baseline.get(k)),
                  "beforeSHA256":digest(before),"afterSHA256":digest(baseline)}
                check("Host departure retains campaign identity",
                      json.loads(baseline["atf-v47-profile-1"])["player"]["name"]=="River QA Sentinel")
            report["frontierBaseline"]={"keys":sorted(baseline),"sha256":digest(baseline)}
            check("Recovered DLC boots in integration frame",
                  frame.evaluate("ROP_DATA.manifest.version==='0.9.0-candidate.1' && ROP_DATA.rooms.length===47"))
            frame.locator("#difficulty").select_option("story")
            frame.locator("#start").click()
            frame.get_by_role("button",name="PRENDRE LE CONTRÔLE",exact=True).click()
            frame.wait_for_function("ROP_APP.started && !ROP_APP.modal")
            initial=observed(frame)
            frame.locator("#scene").focus()
            page.keyboard.down("KeyD")
            page.wait_for_timeout(300)
            page.keyboard.up("KeyD")
            page.keyboard.press("Escape")
            frame.wait_for_function("ROP_APP.modal==='pause'")
            moved=observed(frame)
            check("Keyboard movement reaches game simulation",
                  moved["player"]["x"]>initial["player"]["x"] and moved["room"]==initial["room"])
            frame.locator("#high-contrast").check()
            check("DLC preferences use their own namespace",
                  any(k.endswith("preferences.v4") for k in storage(page,True)))
            check("Playing and preferences preserve all Frontier bytes",storage(page)==baseline)
            with page.expect_download() as download:
                frame.get_by_role("button",name="EXPORTER",exact=True).click()
            exported=output/"dlc-native-export.json"
            download.value.save_as(str(exported))
            payload=json.loads(exported.read_text())
            check("Native export contains the observed position",
                  payload["state"]["room"]==moved["room"] and payload["state"]["player"]["x"]==moved["player"]["x"])
            report["exportSHA256"]=hashlib.sha256(exported.read_bytes()).hexdigest()
            shot("02-dlc-pause-and-export.png")
            expected=observed(frame)
            frame.get_by_role("button",name="MENU PRINCIPAL",exact=True).click()
            frame.locator("#continue").wait_for(state="visible")
            check("Normal menu exit writes native DLC slots",
                  any(k.endswith(".slot0") or k.endswith(".slot1") for k in storage(page,True)))
            check("DLC save preserves all Frontier bytes",storage(page)==baseline)
            page.reload(wait_until="domcontentloaded")
            frame=game_frame(page)
            frame.locator("#continue").click()
            frame.get_by_role("button",name="REPRENDRE LE PARCOURS",exact=True).wait_for(state="visible")
            resumed=observed(frame)
            report["savedState"]=expected
            report["resumedState"]=resumed
            check("Actual page reload restores exact observed DLC state",resumed==expected)
            check("Ordinary preference survives reload",
                  frame.evaluate("document.documentElement.dataset.contrast==='high'"))
            check("DLC reload preserves all Frontier bytes",storage(page)==baseline)
            frame.get_by_role("button",name="REPRENDRE LE PARCOURS",exact=True).click()
            page.keyboard.press("Escape")
            frame.wait_for_function("ROP_APP.modal==='pause'")
            shot("03-dlc-reloaded.png")
            page.keyboard.press("F6")
            check("F6 reaches wrapper return control from game",
                  page.evaluate("document.activeElement?.id==='river-return-tantalus'"))
            if not args.dlc_only:
                page.keyboard.press("Enter")
                page.wait_for_url(base+"/")
                page.locator("#title-start").wait_for(state="visible",timeout=60000)
                page.wait_for_function("Boolean(globalThis.__ATF_V51__?.saveSystem)")
                check("Return opens actual Frontier title",page.locator("#title-screen").is_visible())
                check("Return preserves all Frontier bytes",storage(page)==baseline)
                check("Returned host loads original campaign identity",
                      page.evaluate("__ATF_V51__.saveSystem.data.player.name==='River QA Sentinel'"))
                check("Returned host retains independent DLC save",
                      any(k.endswith(".slot0") or k.endswith(".slot1") for k in storage(page,True)))
                shot("04-frontier-return.png")
            check("No JavaScript page errors",not report["pageErrors"])
            check("No failed HTTP response",not report["httpErrors"])
            check("No failed non-navigation request",not report["requestFailures"])
            report["status"]="passed"
            context.close(); context=None
            browser.close(); browser=None
    except Exception as error:
        report["status"]="failed"
        report["failure"]=str(error)
        report["traceback"]=traceback.format_exc()
        if page is not None:
            try: shot("failure.png")
            except Exception: pass
    finally:
        for resource in (context,browser):
            if resource is not None:
                try: resource.close()
                except Exception: pass
        if server is not None:
            server.shutdown()
            server.server_close()
        report["elapsedSeconds"]=round(time.monotonic()-start,3)
        (output/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps({"status":report["status"],"mode":report["mode"],
                          "checks":len(report["checks"]),"failure":report.get("failure")},ensure_ascii=False))
    return 0 if report["status"]=="passed" else 1

if __name__=="__main__":
    raise SystemExit(main())
