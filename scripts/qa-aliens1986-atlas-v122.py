"""Inspect the served V122 reference atlas with unmodified PNGs in Chromium.

Uses only public menu, search and tab actions. A separate fresh context blocks
one PNG to check the readable fallback. No game state, clock or image is edited.
"""
from __future__ import annotations
import argparse
import base64
from contextlib import contextmanager
from datetime import datetime, timezone
import functools
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright


@contextmanager
def static_site(root):
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


OBSERVER = r"""(() => {
  const stats={draws:[],errors:[]};window.__atlasRasterQaV122=stats;
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args){
    const result=original.apply(this,args),figure=this.canvas.closest?.('[data-atlas-asset]');
    if(figure){const image=args[0];stats.draws.push({id:figure.dataset.atlasAsset,
      location:figure.closest('[data-atlas-location]')?.dataset.atlasLocation,
      src:image.currentSrc||image.src,width:image.naturalWidth,height:image.naturalHeight,
      arguments:args.slice(1),canvas:[this.canvas.width,this.canvas.height]});}
    return result;
  };
})();"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root, source, output = args.root.resolve(), args.source_root.resolve(), args.output.resolve()
    if source == output or source in output.parents:
        parser.error("Browser evidence must be outside the source tree")
    output.mkdir(parents=True, exist_ok=True)
    manifest_path = "docs/development/aliens-1986-sprites-v122/manifest.json"
    manifest = json.loads((source / manifest_path).read_text())
    assets = {asset["id"]: asset for asset in manifest["assets"]}
    expected_placements = sum(len(binding["assetIds"]) for binding in manifest["atlasBindings"])
    expected_locations = {binding["locationId"] for binding in manifest["atlasBindings"]}
    receipt = {"schema": 1, "startedAt": datetime.now(timezone.utc).isoformat(),
               "scope": "Actual Chromium, served reference atlas and its failure fallback; no campaign completion claim",
               "fixtures": "Public menu/search/tab actions; second fresh context aborts only the Narcissus PNG request",
               "sourceCommit": os.environ.get("GITHUB_SHA"), "tests": [], "captures": [],
               "manifestSha256": hashlib.sha256((source / manifest_path).read_bytes()).hexdigest(),
               "gameSha256": hashlib.sha256((root / "dlc/aliens-1986/game.html").read_bytes()).hexdigest(),
               "assets": [], "desktop": {}, "mobile": {}, "pageErrors": []}

    def flush():
        (output / "atlas-v122.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")

    def check(name, ok, detail=None):
        receipt["tests"].append({"name": name, "ok": bool(ok), "detail": detail})
        flush()
        print(("PASS " if ok else "FAIL ") + name, flush=True)
        assert ok, (name, detail)

    def capture(locator, name):
        path = output / name
        locator.screenshot(path=str(path))
        receipt["captures"].append({"file": name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "imageEdited": False})
        flush()
        print("ALIENS_V122_VISUAL:" + path.stem + ":" + base64.b64encode(locator.screenshot(type="jpeg", quality=70)).decode("ascii"), flush=True)

    try:
        with static_site(root) as base, sync_playwright() as pw:
            executable = os.environ.get("ATF_CHROMIUM_EXECUTABLE")
            browser = pw.chromium.launch(headless=True, **({"executable_path": executable} if executable else {}))
            for name, viewport in [("desktop", {"width": 1440, "height": 1000}), ("mobile", {"width": 390, "height": 844})]:
                context = browser.new_context(viewport=viewport, device_scale_factor=1)
                context.add_init_script(OBSERVER)
                page = context.new_page()
                page.set_default_timeout(25000)
                page.on("pageerror", lambda e: receipt["pageErrors"].append(str(e)))
                requests = []
                page.on("request", lambda req: requests.append(req.url) if "/v122/" in req.url else None)
                page.goto(base + "/dlc/aliens-1986/game.html", wait_until="networkidle")
                page.locator("#atlas-menu").wait_for(state="visible")
                check(name + " defers V122 requests until atlas is opened", not requests)
                before = page.evaluate("Object.fromEntries(Object.entries(localStorage))")
                page.locator("#atlas-menu").click()
                page.wait_for_function("n=>document.querySelectorAll('[data-atlas-state=ready]').length===n", arg=expected_placements)
                rows = page.locator("[data-atlas-asset]").evaluate_all("es=>es.map(e=>({id:e.dataset.atlasAsset,state:e.dataset.atlasState,location:e.closest('[data-atlas-location]').dataset.atlasLocation}))")
                check(name + " loads every declared atlas placement", len(rows) == expected_placements and {r["id"] for r in rows} == set(assets) and {r["location"] for r in rows} == expected_locations, rows)
                check(name + " preserves all 28 location cards", page.locator("#atlas-content [data-atlas-location]").count() == 28)
                check(name + " does not invent a Narcissus inspection room", page.locator('[data-atlas-location="narcissus"] [data-visit]').count() == 0)
                draws = page.evaluate("window.__atlasRasterQaV122.draws")
                correct = True
                for draw in draws:
                    asset = assets[draw["id"]]
                    a = draw["arguments"]
                    correct = correct and draw["width"] == asset["width"] and draw["height"] == asset["height"]
                    correct = correct and len(a) == 8 and abs(a[6] / a[2] - a[7] / a[3]) < 1e-9
                    correct = correct and draw["src"] == base + "/" + asset["path"] and draw["canvas"] == [640, 360]
                check(name + " draws native dimensions with uniform scaling", correct and len(draws) == expected_placements)
                check(name + " shares image requests across repeated cards", len(requests) == len(assets) and len(set(requests)) == len(assets), requests)
                overflow = page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")
                check(name + " atlas stays within viewport width", not overflow)
                if name == "desktop":
                    for asset_id in assets:
                        capture(page.locator('[data-atlas-asset="' + asset_id + '"]').first, "atlas-" + asset_id + ".png")
                else:
                    capture(page.locator('[data-atlas-asset="narcissus-shuttle"]').first, "atlas-mobile-narcissus.png")
                    capture(page.locator('[data-atlas-asset="gateway-orbital-backdrop"]').first, "atlas-mobile-gateway.png")
                page.locator("#atlas-search").fill("Narcissus")
                page.wait_for_function("document.querySelectorAll('[data-atlas-state=ready]').length===1")
                check(name + " search keeps the matching illustration", page.locator("[data-atlas-asset]").count() == 1 and page.locator('[data-atlas-asset="narcissus-shuttle"]').count() == 1)
                page.locator("#atlas-search").fill("")
                page.locator('[data-atlas="equipment"]').click()
                check(name + " equipment tab has no misplaced location images", page.locator("[data-atlas-asset]").count() == 0 and page.locator("#atlas-content .atlas-card").count() == 24)
                page.locator('[data-atlas="places"]').click()
                page.wait_for_function("n=>document.querySelectorAll('[data-atlas-state=ready]').length===n", arg=expected_placements)
                check(name + " tab round trip reuses decoded images", len(requests) == len(assets))
                check(name + " atlas leaves persistence unchanged", page.evaluate("Object.fromEntries(Object.entries(localStorage))") == before)
                page.locator("#atlas-panel [data-close]").click()
                page.locator("#atlas-panel").wait_for(state="hidden")
                draw_count = page.evaluate("window.__atlasRasterQaV122.draws.length")
                page.wait_for_timeout(200)
                check(name + " closed atlas stops drawing", page.evaluate("window.__atlasRasterQaV122.draws.length") == draw_count)
                receipt[name] = {"viewport": viewport, "placements": rows, "initialDraws": draws, "imageRequests": requests}
                context.close()

            # Independently verify exact served PNG bytes, not just a successful decode.
            context = browser.new_context(viewport={"width": 1280, "height": 900})
            for asset in assets.values():
                response = context.request.get(base + "/" + asset["path"])
                body = response.body()
                receipt["assets"].append({"id": asset["id"], "status": response.status, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()})
            check("every served PNG matches the pinned native bytes", all(r["status"] == 200 and r["bytes"] == assets[r["id"]]["bytes"] and r["sha256"] == assets[r["id"]]["sha256"] for r in receipt["assets"]))
            context.route("**/v122/exteriors/narcissus-shuttle.png", lambda route: route.abort("failed"))
            page = context.new_page()
            page.on("pageerror", lambda e: receipt["pageErrors"].append(str(e)))
            page.goto(base + "/dlc/aliens-1986/game.html", wait_until="networkidle")
            page.locator("#atlas-menu").click()
            page.locator('[data-atlas-asset="narcissus-shuttle"][data-atlas-state="error"]').wait_for()
            fallback = page.locator('[data-atlas-asset="narcissus-shuttle"]')
            check("a failed PNG leaves a readable reference card", fallback.locator("p").is_visible() and "indisponible" in fallback.inner_text() and not fallback.locator("canvas").is_visible())
            page.wait_for_function("n=>document.querySelectorAll('[data-atlas-state=ready]').length===n", arg=expected_placements - 1)
            check("one failed image does not block other atlas cards", page.locator('[data-atlas-state="ready"]').count() == expected_placements - 1)
            capture(fallback, "atlas-narcissus-fallback.png")
            check("all browser contexts have no script errors", not receipt["pageErrors"], receipt["pageErrors"])
            context.close()
            browser.close()
        receipt["ok"] = True
    except Exception as exc:
        receipt["ok"] = False
        receipt["error"] = str(exc)
        raise
    finally:
        receipt["finishedAt"] = datetime.now(timezone.utc).isoformat()
        receipt["passed"] = sum(1 for test in receipt["tests"] if test["ok"])
        receipt["total"] = len(receipt["tests"])
        flush()
        print("ALIENS_V122_RESULT:" + json.dumps({"ok": receipt.get("ok", False), "passed": receipt["passed"], "total": receipt["total"]}), flush=True)


if __name__ == "__main__":
    main()
