#!/usr/bin/env python3
"""Real-HTTP browser QA for the installed Hors des ombres DLC.

Run with python3 (Playwright and its Chromium installed), optionally --base-url.
All output and the temporary persistent browser profile live outside the checkout.
No progression injection, mocked storage, set_content, network stubs, or QA API.
The only storage fixture is a clearly named unrelated sentinel, used to prove
that DLC actions preserve other keys alongside the host's own real save keys.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from functools import partial
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import importlib.metadata
import json
import os
from pathlib import Path
import platform
import tempfile
import threading
import time
import traceback
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
SAVE_KEY = "atf:mire:out-of-shadows:v1"
SENTINEL = "atf:qa:hors-des-ombres:unrelated-profile"
SENTINEL_VALUE = '{"fixture":"unrelated profile preserved","revision":1}'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=os.environ.get("HORS_DES_OMBRES_BASE_URL"))
    parser.add_argument("--output", type=Path, default=Path(os.environ.get(
        "HORS_DES_OMBRES_QA_OUTPUT", str(ROOT.parent / "audit" / "hors-des-ombres"))))
    parser.add_argument("--chromium", default=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE"))
    args = parser.parse_args()
    output = args.output.resolve()
    if output == ROOT or ROOT in output.parents:
        parser.error("--output must be outside the repository")
    output.mkdir(parents=True, exist_ok=True)
    shots = output / "screenshots"
    shots.mkdir(exist_ok=True)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "suite": "hors-des-ombres-native-http-integration",
        "environment": {"python": platform.python_version(), "platform": platform.platform()},
        "method": {
            "transport": "real HTTP", "browser": "real headless Chromium",
            "storage": "native localStorage, temporary persistent profile reused after browser shutdown",
            "network_stubs": False, "set_content": False, "qa_api": False,
            "progression_injections": [],
            "fixtures": [{"kind": "unrelated localStorage sentinel", "key": SENTINEL, "value": SENTINEL_VALUE}],
            "inputs": "UI clicks, actual keyboard keydown/keyup, viewport resizing; initial sequence skipped through its visible UI button",
            "scope": "title-menu launch, new campaign movement, save/reload/restart, isolation, map/codex, mobile controls, return to host",
        },
        "checks": [], "page_errors": [], "console_errors": [], "failed_requests": [],
        "http_errors": [], "screenshots": [], "source_hashes": {},
    }
    for rel in ["index.html", "src/app.js", "src/title-screen-v61.js",
                "src/hors-des-ombres-launch-v010.js", "src/oth-v1/oth-ui.js",
                "src/oth-v1/oth-data.js", "src/oth-v1/oth-engine.js",
                "src/oth-v1/oth-render.js", "src/oth-v1/oth-ui.css",
                "dlc/alien-hors-des-ombres/index.html",
                "scripts/qa-hors-des-ombres-integration.py"]:
        path = ROOT / rel
        if path.is_file():
            report["source_hashes"][rel] = hashlib.sha256(path.read_bytes()).hexdigest()
    server = None
    context = None
    page = None
    profile = tempfile.TemporaryDirectory(prefix="oth-chromium-", dir=output)
    current_check = None

    def check(name, fn):
        nonlocal current_check
        current_check = name
        start = time.monotonic()
        try:
            details = fn()
            report["checks"].append({"name": name, "ok": True,
                "duration_seconds": round(time.monotonic() - start, 3), "details": details})
            print("PASS " + name, flush=True)
            current_check = None
            return details
        except Exception as exc:
            report["checks"].append({"name": name, "ok": False,
                "duration_seconds": round(time.monotonic() - start, 3),
                "error": str(exc), "traceback": traceback.format_exc()})
            print("FAIL " + name + ": " + str(exc), flush=True)
            current_check = None
            raise

    def shot(name):
        path = shots / (name + ".png")
        page.screenshot(path=str(path), full_page=True)
        report["screenshots"].append({"file": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})

    def observe(p):
        p.on("pageerror", lambda err: report["page_errors"].append({"url": p.url, "error": str(err)}))
        p.on("console", lambda msg: report["console_errors"].append(
            {"url": p.url, "message": msg.text, "location": msg.location}) if msg.type == "error" else None)
        p.on("requestfailed", lambda req: report["failed_requests"].append(
            {"url": req.url, "method": req.method, "failure": req.failure}))
        p.on("response", lambda res: report["http_errors"].append(
            {"url": res.url, "status": res.status}) if res.status >= 400 else None)

    def storage():
        return page.evaluate("() => Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))")

    def foreign_storage():
        return {key: value for key, value in storage().items() if not key.startswith(SAVE_KEY)}

    def saved_state():
        raw = page.evaluate("(key) => localStorage.getItem(key)", SAVE_KEY)
        assert raw, "DLC save absent from native localStorage"
        return json.loads(raw)

    def signature(state):
        return {"schema": state["schema"], "room": state["room"],
                "player": {k: state["player"].get(k) for k in ["x", "y", "hp", "fuel", "kits", "decoys"]},
                "completed": state["completed"], "gear": state.get("gear")}

    def close_dialog():
        dialog = page.locator(".oth-dialog")
        if dialog.get_attribute("open") is not None:
            button = dialog.locator("[data-close]")
            if button.count():
                button.click()
            else:
                page.keyboard.press("Escape")

    def save_through_ui():
        close_dialog()
        page.locator('.oth-head [data-panel="pause"]').click()
        page.locator('.oth-dialog [data-action="save"]').click()
        return saved_state()

    def enter_dlc():
        page.locator('.oth-title [data-action="continue"]').click()
        page.wait_for_function("() => document.querySelector('.oth-title')?.hidden === true")
        page.wait_for_timeout(300)
        skip = page.locator('.oth-dialog [data-action="sequence-skip"]')
        if skip.count() and skip.is_visible():
            skip.click()
        close_dialog()
        page.locator(".oth-canvas").click()
        return {"room_label": page.locator("#oth-roomcode").inner_text()}

    def open_host_menu():
        page.wait_for_function("() => [document.querySelector('#title-start'), document.querySelector('#title-hors-des-ombres')].some(el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')", timeout=60000)
        start = page.locator("#title-start")
        if start.is_visible():
            start.click()
        page.locator("#title-hors-des-ombres").wait_for(state="visible", timeout=60000)

    def assert_title():
        page.locator(".oth-title").wait_for(state="visible")
        text = page.locator(".oth-title h1").inner_text()
        assert "HORS" in text and "OMBRES" in text, text
        assert "V0.10" in page.locator(".version-mark").inner_text()
        return {"title": page.title(), "url": page.url}

    try:
        from playwright.sync_api import sync_playwright
        report["environment"]["playwright"] = importlib.metadata.version("playwright")
        if args.base_url:
            base_url = args.base_url.rstrip("/") + "/"
        else:
            class QuietHandler(SimpleHTTPRequestHandler):
                def log_message(self, *_):
                    pass
            server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
            threading.Thread(target=server.serve_forever, daemon=True).start()
            base_url = "http://127.0.0.1:" + str(server.server_address[1]) + "/"
        report["base_url"] = base_url
        with sync_playwright() as playwright:
            launch = {"headless": True, "viewport": {"width": 1280, "height": 820},
                      "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
            if args.chromium:
                launch["executable_path"] = args.chromium
            context = check("Chromium persistent context starts",
                            lambda: playwright.chromium.launch_persistent_context(profile.name, **launch))
            # BrowserContext is not JSON serializable; keep only observed version.
            report["checks"][-1]["details"] = {"profile": "temporary, reused in this run"}
            report["environment"]["chromium"] = context.browser.version if context.browser else "persistent Chromium"
            page = context.pages[0] if context.pages else context.new_page()
            observe(page)
            page.set_default_timeout(30000)

            def host_title():
                response = page.goto(base_url, wait_until="domcontentloaded")
                assert response and response.status == 200
                open_host_menu()
                button = page.locator("#title-hors-des-ombres")
                button.wait_for(state="visible", timeout=60000)
                assert button.is_enabled()
                shot("01-tantalus-title")
                return {"status": response.status, "button": button.inner_text()}
            check("Host title exposes a real enabled DLC button", host_title)

            def launch_from_title():
                page.locator("#title-hors-des-ombres").click()
                page.wait_for_url("**/dlc/alien-hors-des-ombres/**", timeout=30000)
                result = assert_title()
                shot("02-dlc-title")
                return result
            check("Native title callback opens the installed DLC", launch_from_title)
            check("DLC starts through its visible UI", enter_dlc)
            page.evaluate("([key, value]) => localStorage.setItem(key, value)", [SENTINEL, SENTINEL_VALUE])
            foreign_before = foreign_storage()
            before = save_through_ui()
            close_dialog()

            def movement():
                page.locator(".oth-canvas").click()
                page.keyboard.down("ArrowRight")
                try:
                    page.wait_for_timeout(700)
                finally:
                    page.keyboard.up("ArrowRight")
                after = save_through_ui()
                assert after["player"]["x"] > before["player"]["x"] + 10, (before["player"], after["player"])
                assert after["completed"] == before["completed"] == []
                assert after["room"] == "bridge"
                shot("03-marion-after-keyboard")
                return {"before": signature(before), "after": signature(after)}
            check("Keyboard moves the player and UI saves actual position", movement)
            stable = signature(saved_state())

            def map_check():
                close_dialog()
                page.locator('.oth-head [data-panel="map"]').click()
                assert page.locator("#oth-dialog-title").inner_text() == "Plan du site"
                assert page.locator(".local-plan svg").count() == 1
                shot("04-map")
                close_dialog()
                return {"local_map": True}
            check("Map opens from live campaign", map_check)

            def codex_check():
                page.locator('.oth-head [data-panel="codex"]').click()
                assert page.locator("#oth-dialog-title").inner_text() == "Carnet du Marion"
                count = page.locator(".oth-codex-card").count()
                assert count > 0
                page.locator("#oth-search").fill("Marion")
                filtered = page.locator(".oth-codex-card").count()
                assert filtered > 0
                shot("05-codex")
                close_dialog()
                return {"initial_cards": count, "marion_cards": filtered}
            check("Codex renders and filters its real entries", codex_check)

            def isolation():
                actual = foreign_storage()
                assert actual == foreign_before, {"before": foreign_before, "after": actual}
                return {"unchanged_keys": sorted(actual), "sentinel": actual.get(SENTINEL)}
            check("DLC actions preserve all unrelated localStorage keys", isolation)
            stable = signature(save_through_ui())

            def reload_check():
                page.reload(wait_until="domcontentloaded")
                assert_title()
                assert signature(saved_state()) == stable
                enter_dlc()
                current = signature(save_through_ui())
                assert current == stable, {"expected": stable, "actual": current}
                return current
            check("Native localStorage survives a real page reload", reload_check)
            context.close()
            context = None
            context = playwright.chromium.launch_persistent_context(profile.name, **launch)
            page = context.pages[0] if context.pages else context.new_page()
            observe(page)
            page.set_default_timeout(30000)

            def restart_check():
                page.goto(urljoin(base_url, "dlc/alien-hors-des-ombres/"), wait_until="domcontentloaded")
                assert_title()
                assert signature(saved_state()) == stable
                assert foreign_storage() == foreign_before
                enter_dlc()
                current = signature(save_through_ui())
                assert current == stable
                shot("06-after-browser-restart")
                return current
            check("Save and unrelated keys survive full Chromium shutdown and restart", restart_check)

            def mobile_check():
                close_dialog()
                page.set_viewport_size({"width": 390, "height": 844})
                page.wait_for_timeout(250)
                right = page.locator('.oth-touch [data-touch="d"]')
                assert right.is_visible()
                rect = right.bounding_box()
                assert rect and rect["width"] > 20 and rect["height"] > 20
                before_touch = save_through_ui()
                close_dialog()
                rect = right.bounding_box()
                page.mouse.move(rect["x"] + rect["width"]/2, rect["y"] + rect["height"]/2)
                page.mouse.down()
                try:
                    page.wait_for_timeout(400)
                finally:
                    page.mouse.up()
                after_touch = save_through_ui()
                assert after_touch["player"]["x"] > before_touch["player"]["x"] + 5
                close_dialog()
                width = page.evaluate("() => ({viewport:innerWidth, document:document.documentElement.scrollWidth})")
                assert width["document"] <= width["viewport"] + 2, width
                page.locator('.oth-head [data-panel="map"]').click()
                assert page.locator("#oth-dialog-title").inner_text() == "Plan du site"
                shot("07-mobile-map")
                close_dialog()
                return {"viewport": width, "control_input": "real pointer hold on touch control", "before_x": before_touch["player"]["x"], "after_x": after_touch["player"]["x"]}
            check("Mobile layout and visible directional control work", mobile_check)

            def return_to_host():
                page.set_viewport_size({"width": 1280, "height": 820})
                close_dialog()
                page.locator('.oth-head [data-panel="pause"]').click()
                page.locator('.oth-dialog [data-action="exit"]').click()
                page.wait_for_url(lambda url: "/dlc/" not in str(url), timeout=30000)
                open_host_menu()
                button = page.locator("#title-hors-des-ombres")
                button.wait_for(state="visible", timeout=60000)
                assert page.evaluate("(key) => localStorage.getItem(key)", SENTINEL) == SENTINEL_VALUE
                shot("08-return-tantalus")
                return {"url": page.url, "button": button.inner_text()}
            check("Pause exit returns to the real Tantalus title", return_to_host)

            def no_runtime_errors():
                assert not report["page_errors"], report["page_errors"]
                assert not report["console_errors"], report["console_errors"]
                assert not report["http_errors"], report["http_errors"]
                failures = [x for x in report["failed_requests"] if x["failure"] != "net::ERR_ABORTED"]
                assert not failures, failures
                return {"page_errors": 0, "console_errors": 0, "http_errors": 0,
                        "navigation_cancellations": len(report["failed_requests"]) - len(failures)}
            check("No uncaught runtime errors, HTTP errors, or failed resources", no_runtime_errors)
            context.close()
            context = None
    except Exception as exc:
        report["fatal_error"] = {"error": str(exc), "traceback": traceback.format_exc()}
        if not report["checks"] or report["checks"][-1]["ok"]:
            report["checks"].append({"name": current_check or "Browser scenario setup", "ok": False, "error": str(exc)})
        if page:
            try:
                shot("failure")
            except Exception:
                pass
    finally:
        if context:
            try:
                context.close()
            except Exception as cleanup_error:
                report.setdefault("cleanup_notes", []).append(str(cleanup_error))
        if server:
            server.shutdown()
            server.server_close()
        profile.cleanup()
        report["tests"] = len(report["checks"])
        report["passed"] = sum(1 for check_ in report["checks"] if check_["ok"])
        report["failed"] = report["tests"] - report["passed"]
        (output / "browser-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({"tests": report["tests"], "passed": report["passed"], "failed": report["failed"],
                          "report": str(output / "browser-results.json")}), flush=True)
    return 1 if report["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
