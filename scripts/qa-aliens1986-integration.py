"""Served Aliens 1986 DLC: UI journey, checkpoint and native-save isolation.

Only fixtures: fresh valid native profiles in an isolated browser context.
No DLC state/position/resource/outcome injection, no mocked clock or rendering.
"""
from __future__ import annotations
import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import functools
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import shutil
import subprocess
import threading
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

DLC_KEY = "aliens_1986_v114_fidelity_checkpoint"

@contextmanager
def static_site(root, base):
    if base:
        yield base.rstrip("/")
        return
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            pass
    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(root)))
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)

def native_sentinels(source_root):
    module = (source_root / "src/save.js").as_uri()
    code = (
        "import {createDefaultSave} from " + json.dumps(module) + ";"
        "const v={'atf-v78-selected-profile':'1'};"
        "for(const p of [1,2,3]) {const s=createDefaultSave(p);"
        "s.player.name='QA Aliens 1986 '+p;v['atf-v47-profile-'+p]=JSON.stringify(s);}"
        "console.log(JSON.stringify(v));"
    )
    result = subprocess.run(["node", "--input-type=module", "-e", code], cwd=source_root, text=True, capture_output=True, check=True)
    return json.loads(result.stdout)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--source-root", type=Path)
    parser.add_argument("--base")
    parser.add_argument("--output", type=Path, default=Path.cwd()/".qa/aliens1986-integration")
    parser.add_argument("--skip-title", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    source = (args.source_root or Path(__file__).resolve().parent.parent).resolve()
    output = args.output.resolve()
    immutable = (source/"modules/aliens-1986/v114").resolve()
    if output == immutable or immutable in output.parents:
        parser.error("Evidence must not overwrite the recovered corpus")
    output.mkdir(parents=True, exist_ok=True)
    sentinels = native_sentinels(source)
    tests, errors, consoles, failed_requests, shots, exports = [], [], [], [], [], []
    phase = {"name":"dlc"}
    receipt = {
        "schema":1, "startedAt":datetime.now(timezone.utc).isoformat(),
        "scope":"Served standalone DLC, launch navigation and persistence isolation; not native campaign gameplay",
        "fixtures":{"native":"createDefaultSave(1..3), QA player names, selected profile 1, isolated Chromium context",
                    "seededKeys":sorted(sentinels), "dlc":"None; new operation and public UI input only",
                    "clock":"Real requestAnimationFrame and wall clock"},
        "parentTitleRequested":not args.skip_title, "nativeTantalusGameplayTested":False, "physicalPhoneTested":False,
        "tests":tests, "pageErrors":errors, "consoleErrors":consoles, "requestFailures":failed_requests,
        "captures":shots, "downloads":exports, "sourceHashes":{}
    }
    for rel in ["dlc/aliens-1986/index.html","dlc/aliens-1986/game.html","index.html","src/title-screen-v61.js"]:
        p=root/rel
        if p.is_file(): receipt["sourceHashes"][rel]=hashlib.sha256(p.read_bytes()).hexdigest()
    def flush():
        (output/"browser-integration.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
    def check(name, ok, detail=None):
        tests.append({"name":name,"ok":bool(ok),"detail":detail})
        flush()
        print(("PASS " if ok else "FAIL ")+name,flush=True)
        assert ok,(name,detail)
    def screenshot(page,name,meaning):
        p=output/name
        page.screenshot(path=str(p))
        shots.append({"file":name,"meaning":meaning,"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),"imageEdited":False})
        flush()
    def frame(page):
        child=page.locator("#aliens1986-game").element_handle().content_frame()
        child.locator("#start-operation").wait_for(state="visible")
        child.locator("[data-sector]").first.wait_for(state="attached")
        return child
    def export(page,child,name):
        if not child.locator("#pause-panel").is_visible(): child.locator("#pause-open").click()
        with page.expect_download() as event: child.locator("#export").click()
        p=output/(name+".json")
        event.value.save_as(str(p))
        exports.append({"file":p.name,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()})
        return json.loads(p.read_text())
    def resume(child): child.locator("#pause-panel [data-close]").first.click()
    def storage(page): return page.evaluate("Object.fromEntries(Object.entries(localStorage))")
    def player(state): return next(a for a in state["team"] if a["id"]=="ripley")
    try:
        with static_site(root,args.base) as base, sync_playwright() as pw:
            executable=os.environ.get("ATF_CHROMIUM_EXECUTABLE") or shutil.which("chromium")
            launch={"headless":True,"args":["--no-sandbox","--disable-dev-shm-usage"]}
            if executable: launch["executable_path"]=executable
            browser=pw.chromium.launch(**launch)
            receipt["browser"]={"version":browser.version,"executable":executable or "Playwright-managed"}
            receipt["baseURL"]=base
            context=browser.new_context(viewport={"width":1440,"height":1000},accept_downloads=True)
            origin="{}://{}".format(urlsplit(base).scheme,urlsplit(base).netloc)
            context.add_init_script(
                "if(window===window.top && location.origin==="+json.dumps(origin)+
                " && !sessionStorage.getItem('qa-aliens1986-seeded')) {"+
                "for(const [k,v] of Object.entries("+json.dumps(sentinels)+"))localStorage.setItem(k,v);"+
                "sessionStorage.setItem('qa-aliens1986-seeded','true');}"
            )
            page=context.new_page()
            page.set_default_timeout(20000)
            page.on("pageerror",lambda e:errors.append({"phase":phase["name"],"message":str(e)}))
            page.on("console",lambda m:consoles.append({"phase":phase["name"],"message":m.text}) if m.type=="error" else None)
            page.on("requestfailed",lambda r:failed_requests.append({"phase":phase["name"],"url":r.url,"failure":r.failure}))
            response=page.goto(base+"/dlc/aliens-1986/",wait_until="load")
            check("La route DLC repond en HTTP",response.status==200)
            child=frame(page)
            check("Le jeu V114 charge avec 25 inspections",child.locator("[data-sector]").count()==25 and "V114" in child.locator(".stamp").inner_text())
            check("Les profils natifs restent identiques au chargement",storage(page)==sentinels)
            screenshot(page,"01-dlc-menu.png","Route servie et vrai menu V114 dans l'iframe")
            child.locator("#start-operation").click()
            initial=export(page,child,"01-initial")
            check("Nouvelle operation reelle a Hadley",initial["schema"]==114 and initial["roomId"]=="v106-hadley" and initial["mode"]=="operation" and initial["step"]==0)
            check("Export des 25 lieux",len(initial["worlds"])==25)
            resume(child)
            page.keyboard.press("h")
            page.keyboard.down("d");page.wait_for_timeout(320);page.keyboard.up("d")
            state=export(page,child,"02-movement")
            check("Deplacement reel de Ripley au clavier",player(state)["x"]>player(initial)["x"]+15,{"before":player(initial)["x"],"after":player(state)["x"]})
            h0=next(a for a in initial["team"] if a["id"]=="hicks")
            h1=next(a for a in state["team"] if a["id"]=="hicks")
            check("Ordre Tenir accepte sans deplacer Hicks",h1["order"]=="hold" and h1["x"]==h0["x"] and h1["z"]==h0["z"])
            for attempt in range(24):
                x=player(state)["x"]
                if abs(x-559)<10:break
                resume(child)
                key="d" if x<559 else "a"
                page.keyboard.down(key);page.wait_for_timeout(min(650,max(65,abs(559-x)/172*1000*.9)));page.keyboard.up(key)
                state=export(page,child,f"approach-{attempt:02d}")
            check("Approche physique du sas",abs(player(state)["x"]-559)<12,player(state))
            resume(child);page.keyboard.press("e");page.wait_for_timeout(70)
            pending=export(page,child,"03-opening-pending")
            check("E engage une ouverture differee",pending["action"] is not None and not pending["worlds"]["v106-hadley"]["doors"]["service-gate"]["open"],pending["action"])
            page.wait_for_timeout(220)
            check("Pause exacte du geste",export(page,child,"04-paused")==pending)
            state=pending
            for attempt in range(8):
                resume(child);page.wait_for_timeout(450)
                state=export(page,child,f"opening-{attempt:02d}")
                if state["worlds"]["v106-hadley"]["doors"]["service-gate"]["open"]:break
            check("Le sas s'ouvre apres le temps reellement joue",state["worlds"]["v106-hadley"]["doors"]["service-gate"]["open"] and state["action"] is None)
            resume(child)
            screenshot(page,"02-hadley-gate-open.png","Sas ouvert par deplacements et E depuis une nouvelle operation")
            saved=export(page,child,"05-before-save")
            child.locator("#save").click()
            checkpoint=storage(page).get(DLC_KEY)
            check("Conserver un point ecrit seulement la cle DLC",checkpoint is not None and {k:v for k,v in storage(page).items() if k!=DLC_KEY}==sentinels)
            check("Checkpoint identique a l'export public",json.loads(checkpoint)==saved)
            page.reload(wait_until="load")
            child=frame(page);child.locator("#load-menu").click()
            child.locator("#pause-panel").wait_for(state="visible")
            restored=export(page,child,"06-after-reload")
            check("Reprise exacte apres rechargement",restored==saved)
            check("Porte, equipe et reserves conservees",restored["worlds"]["v106-hadley"]["doors"]["service-gate"]["open"] and restored["team"]==saved["team"] and restored["arsenal"]==saved["arsenal"])
            check("Aucun profil Tantalus ecrit par le DLC",{k:v for k,v in storage(page).items() if k!=DLC_KEY}==sentinels)
            check("Aucune erreur JavaScript ou console DLC",not errors and not consoles,{"pageErrors":errors[:],"consoleErrors":consoles[:]})
            phase["name"]="parent-return"
            with page.expect_navigation(wait_until="domcontentloaded"):page.locator("#return-tantalus").click()
            check("Retour a la racine Tantalus",urlsplit(page.url).path in ("/","/index.html"))
            if args.skip_title:
                receipt["parentTitleUnexecuted"]="Requested --skip-title; native shell launch is not claimed"
            else:
                page.locator("#title-screen").wait_for(state="visible",timeout=60000)
                if page.locator("#title-start").is_visible():page.locator("#title-start").click()
                page.locator("#title-aliens1986").wait_for(state="visible",timeout=30000)
                screenshot(page,"03-tantalus-title-dlc.png","Entree DLC dans le vrai menu titre Tantalus")
                with page.expect_navigation(wait_until="load"):page.locator("#title-aliens1986").click()
                child=frame(page)
                check("Le bouton titre lance la route DLC",urlsplit(page.url).path=="/dlc/aliens-1986/" and child.locator("#start-operation").is_visible())
                child.locator("#load-menu").click()
                check("Checkpoint conserve apres aller-retour titre",export(page,child,"07-after-title-roundtrip")==saved)
                check("Aucune erreur JavaScript de navigation parent",not [e for e in errors if e["phase"]=="parent-return"],errors)
            receipt["finishedAt"]=datetime.now(timezone.utc).isoformat()
            receipt["ok"]=all(t["ok"] for t in tests)
            browser.close()
    except Exception as e:
        receipt["ok"]=False;receipt["failure"]=str(e);receipt["finishedAt"]=datetime.now(timezone.utc).isoformat()
        flush()
        raise
    finally:flush()
    print(json.dumps({"ok":receipt["ok"],"checks":len(tests),"output":str(output)}))

if __name__=="__main__":main()
