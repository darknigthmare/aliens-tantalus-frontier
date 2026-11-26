"""Served Alien: Isolation DLC: launch, real input and save isolation.

Only fixtures: valid native Tantalus profiles in a fresh browser context.
No DLC state, position, resources, outcomes, clock or rendering are injected.
window.__isolation is inspected read-only; actions use the public UI and keys.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import functools
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import math
import os
from pathlib import Path
import subprocess
import threading
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


DLC_KEY = "tantalus.dlc.alien-isolation.v1"
DLC_KEYS = {DLC_KEY, DLC_KEY + ".backups.v1", DLC_KEY + ".preferences.v1"}
DLC_ROUTE = "/dlc/alien-isolation/index.html"


@contextmanager
def static_site(root, base):
    if base:
        yield base.rstrip("/")
        return

    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Handler, directory=str(root))
    )
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)


def native_sentinels(source_root):
    save_module = (source_root / "src/save.js").as_uri()
    profile_module = (source_root / "src/save-profile-v78.js").as_uri()
    code = (
        "import {createDefaultSave,SAVE_PREFIX} from " + json.dumps(save_module) + ";"
        "import {SAVE_PROFILE_IDS_V78,SAVE_SELECTED_PROFILE_KEY_V78,inspectSaveSlotV78} from "
        + json.dumps(profile_module) + ";"
        "const v={[SAVE_SELECTED_PROFILE_KEY_V78]:'1'};"
        "for(const p of SAVE_PROFILE_IDS_V78){const s=createDefaultSave(p);"
        "s.needsPlayerCreationV84=false;s.statistics.playSeconds=17;"
        "s.player.name='QA Alien Isolation '+p;const raw=JSON.stringify(s);"
        "if(inspectSaveSlotV78(raw).status!=='ready')throw Error('Invalid native fixture');"
        "v[SAVE_PREFIX+p]=raw;}console.log(JSON.stringify(v));"
    )
    result = subprocess.run(
        ["node", "--input-type=module", "-e", code],
        cwd=source_root, text=True, capture_output=True, check=True,
    )
    return json.loads(result.stdout)


def checkpoint_projection(state):
    """Fields that must survive load; transient AI/timers are normalized by load."""
    keys = ("room", "x", "y", "goal", "chapter", "completed", "visited",
            "inventory", "tools", "spatial", "health", "checkpointCount")
    return {key: state[key] for key in keys}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--source-root", type=Path)
    parser.add_argument("--base")
    parser.add_argument("--output", type=Path, default=Path.cwd() / ".qa/alien-isolation-integration")
    parser.add_argument("--skip-title", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    source = (args.source_root or Path(__file__).resolve().parent.parent).resolve()
    output = args.output.resolve()
    immutable = (source / "modules/alien-isolation/v0.8").resolve()
    if output == immutable or immutable in output.parents:
        parser.error("Evidence must not overwrite the recovered corpus")
    if not (root / "dlc/alien-isolation/index.html").is_file() and not args.base:
        parser.error("The served root must contain the built Alien: Isolation launcher")
    output.mkdir(parents=True, exist_ok=True)

    tests, errors, consoles, requests, http_errors, shots, exports = [], [], [], [], [], [], []
    phase = {"name": "setup"}
    receipt = {
        "schema": 1, "startedAt": datetime.now(timezone.utc).isoformat(),
        "scope": "Served standalone DLC, public UI journey, real save terminal and host navigation; not native campaign gameplay",
        "fixtures": {
            "native": "createDefaultSave for all three profiles, validated by inspectSaveSlotV78; started profiles, QA player names, 17 prior play seconds and selected profile 1",
            "dlc": "None; new game, real keyboard movement, save terminal and public menus only",
            "clock": "Real requestAnimationFrame and wall clock",
            "observations": "Read-only window.__isolation state and localStorage reads",
        },
        "parentTitleRequested": not args.skip_title,
        "nativeTantalusGameplayTested": False, "physicalPhoneTested": False,
        "tests": tests, "pageErrors": errors, "consoleErrors": consoles,
        "requestFailures": requests, "httpErrors": http_errors,
        "captures": shots, "downloads": exports, "sourceHashes": {},
    }
    for relative in ["dlc/alien-isolation/index.html", "dlc/alien-isolation/game.html",
                     "index.html", "src/dlc-menu.js", "src/title-screen-v61.js"]:
        path = root / relative
        if path.is_file():
            receipt["sourceHashes"][relative] = hashlib.sha256(path.read_bytes()).hexdigest()

    def clean_message(value):
        text = str(value)
        for path, label in sorted(
            [(str(source), "<source-root>"), (str(root), "<served-root>"),
             (str(output), "<output>")], key=lambda item: len(item[0]), reverse=True,
        ):
            text = text.replace(path, label)
        return text

    def flush():
        (output / "browser-integration.json").write_text(
            json.dumps(receipt, ensure_ascii=False, indent=2) + "\n"
        )

    def check(name, ok, detail=None):
        tests.append({"name": name, "ok": bool(ok), "detail": detail})
        flush()
        print(("PASS " if ok else "FAIL ") + name, flush=True)
        if not ok:
            raise AssertionError(name)

    def screenshot(page, name, meaning):
        path = output / name
        page.screenshot(path=str(path))
        shots.append({"file": name, "meaning": meaning,
                      "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "imageEdited": False})
        flush()

    def frame(page):
        element = page.locator("iframe#isolation-game")
        element.wait_for(state="visible")
        child = element.element_handle().content_frame()
        if child is None:
            raise AssertionError("Isolation iframe has no document")
        child.locator('body[data-ready="true"]').wait_for(state="attached")
        child.locator("#newGame").wait_for(state="visible")
        return child

    def state(child):
        return child.evaluate("JSON.parse(JSON.stringify(window.__isolation.engine.s))")

    def storage(page):
        return page.evaluate("Object.fromEntries(Object.entries(localStorage))")

    def pause(child):
        child.locator('[data-panel="pause"]').click()
        child.locator('[data-action="export"]').wait_for(state="visible")

    def close_panel(child):
        child.locator("#closeModal").click()
        child.locator("#modal").wait_for(state="hidden")

    def export_checkpoint(page, child, name):
        if not child.locator('[data-action="export"]').is_visible():
            pause(child)
        with page.expect_download() as event:
            child.locator('[data-action="export"]').click()
        path = output / (name + ".json")
        event.value.save_as(str(path))
        exports.append({"file": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
        flush()
        return json.loads(path.read_text())

    def walk_to_terminal(page, child, target):
        samples = []
        for _ in range(35):
            current = state(child)
            dx, dy = target["x"] - current["x"], target["y"] - current["y"]
            samples.append({"x": current["x"], "y": current["y"]})
            if math.hypot(dx, dy) < 10:
                receipt["saveTerminalApproach"] = {"terminal": target["id"], "samples": samples}
                return current
            keys = []
            if abs(dx) > 5:
                keys.append("d" if dx > 0 else "a")
            if abs(dy) > 5:
                keys.append("s" if dy > 0 else "w")
            try:
                for key in keys:
                    page.keyboard.down(key)
                page.wait_for_timeout(min(180, max(45, math.hypot(dx, dy) / 170 * 1000)))
            finally:
                for key in keys:
                    page.keyboard.up(key)
        receipt["saveTerminalApproach"] = {"terminal": target["id"], "samples": samples}
        raise AssertionError("Keyboard movement did not reach the save terminal")

    try:
        sentinels = native_sentinels(source)
        receipt["fixtures"]["seededKeys"] = sorted(sentinels)
        with static_site(root, args.base) as base, sync_playwright() as pw:
            executable = os.environ.get("ATF_CHROMIUM_EXECUTABLE")
            launch = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
            if executable:
                launch["executable_path"] = executable
            browser = pw.chromium.launch(**launch)
            receipt["browser"] = {"version": browser.version,
                                  "executableKind": "ATF_CHROMIUM_EXECUTABLE" if executable else "Playwright-managed"}
            receipt["baseURL"] = base
            context = browser.new_context(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
            origin = "{}://{}".format(urlsplit(base).scheme, urlsplit(base).netloc)
            context.add_init_script(
                "if(window===window.top && location.origin===" + json.dumps(origin)
                + " && !sessionStorage.getItem('qa-isolation-seeded')){"
                + "for(const [k,v] of Object.entries(" + json.dumps(sentinels)
                + "))localStorage.setItem(k,v);"
                + "sessionStorage.setItem('qa-isolation-seeded','true');}"
            )
            page = context.new_page()
            page.set_default_timeout(20000)
            page.on("pageerror", lambda error: errors.append({"phase": phase["name"], "message": clean_message(error)}))
            page.on("console", lambda message: consoles.append({"phase": phase["name"], "message": clean_message(message.text)}) if message.type == "error" else None)
            page.on("requestfailed", lambda request: requests.append({"phase": phase["name"], "url": request.url, "failure": request.failure}))
            page.on("response", lambda response: http_errors.append({"phase": phase["name"], "url": response.url, "status": response.status}) if response.status >= 400 else None)
            phase["name"] = "dlc"
            response = page.goto(base + DLC_ROUTE, wait_until="load")
            check("La route Isolation répond en HTTP", response is not None and response.status == 200)
            child = frame(page)
            check("Le jeu 0.8.0 est chargé dans son iframe", child.evaluate("__isolation.CONTENT.meta.version==='0.8.0'") and "0.8.0" in child.locator(".pill").inner_text())
            check("Les trois profils natifs sont inchangés au chargement", storage(page) == sentinels)
            check("Aucune reprise DLC fabriquée avant la première partie", child.locator("#continueGame").is_disabled() and DLC_KEY not in storage(page))
            screenshot(page, "01-isolation-menu.png", "Menu réel de la version récupérée, servi dans le lanceur du dépôt")
            child.locator("#difficulty").select_option("recit")
            child.locator("#newGame").click()
            child.wait_for_function("__isolation.started && !!localStorage.getItem(__isolation.CONTENT.meta.saveKey)")
            initial = state(child)
            initial_checkpoint = storage(page)[DLC_KEY]
            check("Nouvelle partie réelle à bord du Torrens", initial["room"] == "t_cryo" and initial["goal"] == 0 and initial["actor"] == "Amanda")
            check("Seules les clés propres au DLC sont créées", {key: value for key, value in storage(page).items() if key not in DLC_KEYS} == sentinels)
            try:
                page.keyboard.down("d")
                page.wait_for_timeout(350)
            finally:
                page.keyboard.up("d")
            moved = state(child)
            check("Amanda se déplace réellement au clavier", moved["x"] > initial["x"] + 12 and moved["room"] == initial["room"], {"beforeX": initial["x"], "afterX": moved["x"]})

            pause(child)
            paused_time = child.evaluate("__isolation.engine.s.time")
            page.wait_for_timeout(220)
            check("Le menu Pause arrête effectivement la simulation", child.evaluate("__isolation.engine.paused") and child.evaluate("__isolation.engine.s.time") == paused_time)
            close_panel(child)
            child.locator('[data-panel="map"]').click()
            before_map = checkpoint_projection(state(child))
            check("La carte expose les 76 lieux du corpus", child.locator("#spatialRoomSelect option").count() == 76)
            child.locator("#spatialRoomSelect").select_option("m_morgue")
            check("Le plan de la morgue expose ses deux passages", child.locator(".portal-list article").count() == 2)
            child.locator('[data-waypoint="m_morgue"]').click()
            after_map = checkpoint_projection(state(child))
            check("Le repère ne téléporte pas Amanda et ne valide aucun objectif", after_map["spatial"]["waypoint"] == "m_morgue" and all(after_map[key] == before_map[key] for key in before_map if key != "spatial"))
            screenshot(page, "02-isolation-local-map.png", "Plan local inspecté depuis la première pièce, sans déplacement ou progression injectés")
            close_panel(child)
            child.locator('[data-panel="inventory"]').click()
            inventory_time = child.evaluate("__isolation.engine.s.time")
            page.wait_for_timeout(220)
            check("L'équipement s'ouvre en laissant le temps passer", "ÉQUIPEMENT" in child.locator("#modalTitle").inner_text() and not child.evaluate("__isolation.engine.paused") and child.evaluate("__isolation.engine.s.time") > inventory_time)
            close_panel(child)

            terminal = child.evaluate("""()=>{const e=__isolation.engine,p=__isolation.CONTENT.rooms.find(r=>r.id===e.s.room).props.find(p=>p.interactive==='save');return {id:p.id,x:p.x,y:p.y};}""")
            arrived = walk_to_terminal(page, child, terminal)
            check("La borne de cryostase est atteinte par déplacement réel", arrived["room"] == "t_cryo" and math.hypot(arrived["x"] - terminal["x"], arrived["y"] - terminal["y"]) < 10)
            count_before = arrived["checkpointCount"]
            try:
                page.keyboard.down("e")
                child.wait_for_function("n=>__isolation.engine.s.checkpointCount>n", arg=count_before, timeout=10000)
            finally:
                page.keyboard.up("e")
            child.wait_for_function("old=>localStorage.getItem(__isolation.CONTENT.meta.saveKey)!==old", arg=initial_checkpoint)
            pause(child)
            checkpoint = storage(page)[DLC_KEY]
            saved = json.loads(checkpoint)
            check("Maintenir E enregistre un nouveau point à la borne", saved["state"]["checkpointCount"] > count_before and saved["state"]["spatial"]["waypoint"] == "m_morgue")
            exported = export_checkpoint(page, child, "03-terminal-checkpoint")
            check("L'export public correspond au point persisté", exported == saved)
            check("Les profils Tantalus restent intacts après déplacement et sauvegarde", {key: value for key, value in storage(page).items() if key not in DLC_KEYS} == sentinels)

            page.reload(wait_until="load")
            child = frame(page)
            check("Reprendre devient disponible après rechargement réel", child.locator("#continueGame").is_enabled())
            check("Le rechargement conserve les octets de la sauvegarde DLC", storage(page).get(DLC_KEY) == checkpoint)
            child.locator("#continueGame").click()
            pause(child)
            restored = export_checkpoint(page, child, "04-after-reload")
            check("La reprise conserve position, progression, stocks et repère", checkpoint_projection(state(child)) == checkpoint_projection(saved["state"]) and checkpoint_projection(restored["state"]) == checkpoint_projection(saved["state"]))
            check("Reprendre ne réécrit aucun profil natif", {key: value for key, value in storage(page).items() if key not in DLC_KEYS} == sentinels)
            screenshot(page, "03-isolation-reloaded.png", "Pause après rechargement et Reprendre, avec le point enregistré par E")
            dlc_errors = [entry for entry in errors + consoles + http_errors if entry["phase"] == "dlc"]
            dlc_requests = [entry for entry in requests if entry["phase"] == "dlc" and entry["failure"] != "net::ERR_ABORTED"]
            check("Aucune erreur JavaScript ou ressource pendant le parcours DLC", not dlc_errors and not dlc_requests, {"errors": dlc_errors, "requests": dlc_requests})

            phase["name"] = "parent-return"
            with page.expect_navigation(wait_until="domcontentloaded"):
                page.locator("#return-tantalus").click()
            check("Retour au Tantalus par le lien du lanceur", urlsplit(page.url).path in ("/", "/index.html"))
            if args.skip_title:
                receipt["parentTitleUnexecuted"] = "Requested --skip-title; native title readiness and gallery navigation are not claimed"
            else:
                page.locator("#title-screen").wait_for(state="visible", timeout=60000)
                page.locator("#intro-v188").wait_for(state="detached", timeout=30000)
                if page.locator("#title-start").is_visible():
                    page.locator("#title-start").click()
                page.locator("#title-dlc").wait_for(state="visible", timeout=30000)
                page.locator("#title-dlc").click()
                launch_button = page.locator('[data-dlc-launch="alien-isolation"]')
                launch_button.wait_for(state="visible")
                check("La galerie Extensions propose Isolation", page.locator('[data-dlc="alien-isolation"]').is_visible())
                screenshot(page, "04-tantalus-extensions.png", "Entrée Isolation dans la galerie Extensions du vrai titre Tantalus")
                with page.expect_navigation(wait_until="load"):
                    launch_button.click()
                child = frame(page)
                check("La galerie ouvre la bonne route Isolation", urlsplit(page.url).path == DLC_ROUTE)
                child.locator("#continueGame").click()
                pause(child)
                returned = export_checkpoint(page, child, "05-after-title-roundtrip")
                check("La reprise survit à l'aller-retour Tantalus", checkpoint_projection(state(child)) == checkpoint_projection(saved["state"]) and checkpoint_projection(returned["state"]) == checkpoint_projection(saved["state"]) and storage(page).get(DLC_KEY) == checkpoint)
                check("Les profils natifs restent inchangés après la galerie", all(storage(page).get(key) == value for key, value in sentinels.items()))
                check("Aucune exception JavaScript pendant la navigation du titre", not [entry for entry in errors if entry["phase"] == "parent-return"], [entry for entry in errors if entry["phase"] == "parent-return"])
            receipt["ok"] = all(test["ok"] for test in tests)
            receipt["finishedAt"] = datetime.now(timezone.utc).isoformat()
            browser.close()
    except Exception as error:
        receipt["ok"] = False
        receipt["failure"] = clean_message(error)
        receipt["finishedAt"] = datetime.now(timezone.utc).isoformat()
        flush()
        raise
    finally:
        flush()
    print(json.dumps({"ok": receipt["ok"], "checks": len(tests), "report": "browser-integration.json"}))


if __name__ == "__main__":
    main()
