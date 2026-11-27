"""Covenant: real controls and reached rooms, plus declared art fixtures.

The primary journey uses the public UI and real keyboard input. It never
teleports, edits resources, marks actions complete or advances a synthetic
clock. Read-only QA observations expose the actual engine. Separate browser
contexts contain prepared creature poses and deliberate image failures.
Screenshots and receipts are evidence for the tested files, not 1:1 certification.
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
import subprocess
import tempfile
import threading
import time
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

DLC_KEY = "atf.mire.covenant.v1"


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


def native_sentinels(source_root, standalone):
    if standalone:
        return {"atf-v78-selected-profile": "1", **{
            f"atf-v47-profile-{index}": json.dumps({"covenantIsolationSentinel": index})
            for index in (1, 2, 3)
        }}
    module = (source_root / "src/save.js").as_uri()
    code = (
        "import {createDefaultSave} from " + json.dumps(module) + ";"
        "const values={'atf-v78-selected-profile':'1'};"
        "for(const p of [1,2,3]){const s=createDefaultSave(p);"
        "s.player.name='QA Covenant '+p;values['atf-v47-profile-'+p]=JSON.stringify(s);}"
        "console.log(JSON.stringify(values));"
    )
    result = subprocess.run(["node", "--input-type=module", "-e", code],
                            cwd=source_root, text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def observation(page):
    return page.evaluate("""() => {
      const q=window.__COVENANT_QA__, e=q.engine;
      return {room:e.room.id,view:e.room.view,player:{...e.state.player},
        actions:e.state.actions.slice(),visited:e.state.visited.slice(),
        paused:e.paused,dead:e.dead,grounded:e.grounded(),work:!!e.work,
        solids:e.solidProps().filter(p=>p.solid).map(p=>({x:p.x,z:p.z,w:p.w,h:p.h})),
        spriteDraws:{...q.renderer.spriteDrawsV011},
        cycleFrameDraws:{...q.renderer.spriteFrameDrawsV012}};
    }""")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--source-root", type=Path)
    parser.add_argument("--base")
    parser.add_argument("--output", type=Path, default=Path(tempfile.gettempdir()) / "covenant-v011-browser")
    parser.add_argument("--skip-title", action="store_true",
                        help="Validate the standalone module only; do not claim host-menu coverage.")
    args = parser.parse_args()
    root = args.root.resolve()
    source = (args.source_root or Path(__file__).resolve().parent.parent).resolve()
    output = args.output.resolve()
    if output == source or output.is_relative_to(source / "modules") or output.is_relative_to(source / "dlc"):
        raise ValueError("QA evidence must stay outside editable runtime and public DLC files")
    output.mkdir(parents=True, exist_ok=True)
    sentinels = native_sentinels(source, args.skip_title)
    receipt = {
        "startedAt": datetime.now(timezone.utc).isoformat(), "ok": False,
        "scope": "Covenant visual loading, actual opening-room traversal, save isolation and declared pose fixtures",
        "hostMenuRequested": not args.skip_title, "nativeTantalusGameplayTested": False,
        "filmFidelityCertified": False, "physicalPhoneTested": False,
        "fixtures": {
            "primaryJourney": "No gameplay state injection; UI start and real keyboard events",
            "observations": "Existing qa=1 read-only engine/snapshot API; explicit pause for renderer-purity check",
            "nativeStorage": "Opaque sentinel values" if args.skip_title else "createDefaultSave(1..3), QA names, selected profile 1",
            "creatureCaptures": "Separate browser context; existing go(room,true), explicit enemy pose and camera placement; not a playthrough",
            "walkCostumes": "Daniels field at landing and EVA at sailaccess use separate prepared rooms and empty hands; movement then uses real keyboard/RAF. David uses the public isolated prologue button, without campaign injection.",
            "npcWalking": "Walter is observed on his original opening cryo patrol before any player movement; no actor, route, speed, phase or clock injection.",
            "background": "The prepared landing room checks a sky-only PNG before native world geometry; it does not claim campaign traversal to the planet.",
            "missingImages": "Separate browser context; PNG requests deliberately aborted",
            "clock": "Real requestAnimationFrame and wall clock",
            "alphaPolicy": {"supportThreshold": 32, "opaqueThresholdReported": 240, "opacityRatioInformational": True,
                            "opaqueBackground": "Explicit background kind only; every pixel alpha must equal 255"},
            "serviceWorkers": "Blocked in isolated QA contexts"
        },
        "tests": [], "reachedRooms": [], "controls": {"keyTransitions": 0, "jumps": 0},
        "captures": [], "pageErrors": [], "httpErrors": [], "assetDecoding": [],
        "preparedCreaturePoses": [], "preparedPropPoses": [], "walkCycles": [], "npcWalkCycles": [],
        "preparedBackgrounds": [],
        "incompleteWalkCycles": [], "sourceHashes": {}
    }
    for relative in ("dlc/covenant/index.html", "dlc/covenant/sprites-v011.json", "index.html",
                     "src/title-screen-v61.js", "docs/covenant/RUNTIME_SOURCE_V011.json"):
        candidate = root / relative
        if candidate.is_file():
            receipt["sourceHashes"][relative] = hashlib.sha256(candidate.read_bytes()).hexdigest()

    def flush():
        (output / "browser-integration.json").write_text(
            json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def check(name, ok, detail=None):
        receipt["tests"].append({"name": name, "ok": bool(ok), "detail": detail})
        flush()
        print(("PASS " if ok else "FAIL ") + name, flush=True)
        assert ok, (name, detail)

    def capture(page, name, meaning):
        target = output / (name + ".png")
        page.screenshot(path=str(target))
        preview = output / (name + ".jpg")
        page.screenshot(path=str(preview), type="jpeg", quality=65)
        receipt["captures"].append({"file": target.name, "preview": preview.name,
            "meaning": meaning, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(), "imageEdited": False})
        flush()

    def storage(page):
        return page.evaluate("Object.fromEntries(Object.entries(localStorage))")

    def host_preserved(page):
        current = storage(page)
        return all(current.get(key) == value for key, value in sentinels.items())

    def release(page, held):
        for key in sorted(held):
            page.keyboard.up(key)
        held.clear()

    def move_to(page, target):
        held = set()
        deadline = time.monotonic() + 30
        last_jump = 0.0
        try:
            while time.monotonic() < deadline:
                state = observation(page)
                if state["dead"] or state["paused"]:
                    raise AssertionError(("Movement interrupted", state))
                player = state["player"]
                dx, dz = target["x"] - player["x"], target.get("z", .5) - player["z"]
                if abs(dx) <= 15 and abs(dz) <= .025 and state["grounded"]:
                    return state
                desired = set()
                if dx > 10:
                    desired.add("ArrowRight")
                elif dx < -10:
                    desired.add("ArrowLeft")
                if state["view"] != "side":
                    if dz > .018:
                        desired.add("ArrowDown")
                    elif dz < -.018:
                        desired.add("ArrowUp")
                if abs(dx) > 130:
                    desired.add("Shift")
                for key in sorted(held - desired):
                    page.keyboard.up(key)
                    receipt["controls"]["keyTransitions"] += 1
                for key in sorted(desired - held):
                    page.keyboard.down(key)
                    receipt["controls"]["keyTransitions"] += 1
                held = desired
                direction = 1 if dx > 0 else -1
                obstacle = any(
                    0 < (solid["x"] - player["x"]) * direction < solid["w"] / 2 + 85
                    and abs(solid["z"] - player["z"]) < .2 and player["y"] < solid["h"]
                    for solid in state["solids"]
                )
                if state["view"] == "side" and obstacle and state["grounded"] and time.monotonic() - last_jump > .65:
                    page.keyboard.press("Space")
                    receipt["controls"]["jumps"] += 1
                    last_jump = time.monotonic()
                page.wait_for_timeout(55)
            raise AssertionError(("Movement timeout", target, observation(page)))
        finally:
            release(page, held)

    def observe_walk_cycle(page, cycle, prepared):
        """Observe actual drawImage transforms while keyboard input moves the player.

        The temporary wrapper records renderer calls; it never edits simulation,
        player position, motion flags, costume selection or the simulation clock.
        """
        key = cycle["key"]
        initial = page.evaluate("""() => {
          const q=__COVENANT_QA__,e=q.engine,p=e.appearance(e.state.player,'daniels');
          q.renderer.walkObservedV013=[];
          q.renderer.walkOriginalV013=q.renderer.drawPose;
          q.renderer.drawPose=function(sprite,height,anchor){
            if(sprite.cycle){const m=this.c.getTransform();this.walkObservedV013.push({
              id:sprite.entry.id,cycle:sprite.cycle,a:m.a,d:m.d,facing:e.state.player.facing,
              moving:e.motion.moving,time:e.state.time});}
            return this.walkOriginalV013(sprite,height,anchor);
          };
          return {room:e.room.id,profile:p.id,x:e.state.player.x,weapon:e.state.weapon,
            safePresentation:!!e.room.safePresentation,crawl:!!e.room.crawl};
        }""")
        check("Walk costume is the real profile in its permitted room: " + key,
              initial["profile"] == key and initial["room"] in cycle["rooms"]
              and not initial["crawl"] and (not initial["weapon"] or initial["safePresentation"]), initial)
        try:
            page.keyboard.down("ArrowRight")
            try:
                page.wait_for_function("""ids=>ids.every(id=>__COVENANT_QA__.renderer.walkObservedV013
                  .some(row=>row.id===id&&row.a>0&&row.d>0&&row.facing===1&&row.moving))""",
                  arg=cycle["frames"])
                pause = page.evaluate("""key=>{
                  const q=__COVENANT_QA__,e=q.engine;q.freeze();
                  return {time:e.state.time,x:e.state.player.x,moving:e.motion.moving,
                    before:JSON.stringify(q.snapshot()),
                    frame:CovenantSpritesV011.entry('human',key,'walk',e.room.id,e.state.time).id};
                }""", key)
            finally:
                page.keyboard.up("ArrowRight")
            right_draws = page.evaluate("__COVENANT_QA__.renderer.walkObservedV013.slice()")
            check("Keyboard movement draws all eight right-facing phases: " + key,
                  pause["x"] > initial["x"] + 10 and pause["moving"]
                  and all(any(row["id"] == identity and row["a"] > 0 and row["moving"]
                              for row in right_draws) for identity in cycle["frames"]),
                  {"startX": initial["x"], "endX": pause["x"], "frames": cycle["frames"]})
            page.wait_for_timeout(160)
            paused = page.evaluate("""key=>{
              const q=__COVENANT_QA__,e=q.engine;q.renderer.frame(0,{});
              return {time:e.state.time,after:JSON.stringify(q.snapshot()),
                frame:CovenantSpritesV011.entry('human',key,'walk',e.room.id,e.state.time).id};
            }""", key)
            check("Pause keeps the costume phase and exact simulation unchanged: " + key,
                  pause["time"] == paused["time"] and pause["frame"] == paused["frame"]
                  and pause["before"] == paused["after"])
            capture(page, "walk-" + key + "-right",
                    ("Prepared costume room; " if prepared else "Public independent prologue; ")
                    + "real keyboard walk paused; not a campaign-completion proof")
            page.evaluate("__COVENANT_QA__.renderer.walkObservedV013=[];__COVENANT_QA__.resume()")
            before_left = observation(page)["player"]["x"]
            page.keyboard.down("ArrowLeft")
            try:
                page.wait_for_function("""ids=>ids.every(id=>__COVENANT_QA__.renderer.walkObservedV013
                  .some(row=>row.id===id&&row.a<0&&row.d>0&&row.facing===-1&&row.moving))""",
                  arg=cycle["frames"])
                page.evaluate("__COVENANT_QA__.freeze()")
            finally:
                page.keyboard.up("ArrowLeft")
            after_left = observation(page)["player"]["x"]
            left_draws = page.evaluate("__COVENANT_QA__.renderer.walkObservedV013.slice()")
            check("Keyboard return draws eight reflected phases with unchanged costume: " + key,
                  after_left < before_left - 10
                  and all(any(row["id"] == identity and row["a"] < 0 and row["moving"]
                              for row in left_draws) for identity in cycle["frames"]),
                  {"startX": before_left, "endX": after_left, "frames": cycle["frames"]})
            capture(page, "walk-" + key + "-left", "Real opposite keyboard movement; Canvas reflection observed")
            receipt["walkCycles"].append({"id": cycle["id"], "key": key, "room": initial["room"],
                "gameplayStateInjected": prepared, "clockInjected": False,
                "observedRightFrames": sorted(set(row["id"] for row in right_draws if row["a"] > 0)),
                "observedLeftFrames": sorted(set(row["id"] for row in left_draws if row["a"] < 0)),
                "rightDraws": right_draws, "leftDraws": left_draws,
                "pausedFrame": pause["frame"], "pausedTime": pause["time"]})
            flush()
        finally:
            page.keyboard.up("ArrowLeft")
            page.keyboard.up("ArrowRight")
            page.evaluate("""()=>{const q=__COVENANT_QA__;
              q.renderer.drawPose=q.renderer.walkOriginalV013;
              delete q.renderer.walkOriginalV013;delete q.renderer.walkObservedV013;q.resume();}""")

    def observe_native_npc(page, cycle):
        """Observe an existing patrol after its room is reached by real controls."""
        config = {"walter": {"actor": "walter-cryo", "room": "cryo", "speed": 26},
                  "upworth": {"actor": "upworth-comms", "room": "comms", "speed": 22}}[cycle["key"]]
        config = {**config, "key": cycle["key"], "cycle": cycle["id"]}
        name = cycle["key"].capitalize()
        initial = observation(page)
        page.evaluate("""cfg => {
          const q=__COVENANT_QA__,e=q.engine;
          q.renderer.npcObservedV017=[];q.renderer.npcOriginalDrawV017=q.renderer.drawPose;
          q.renderer.drawPose=function(sprite,height,anchor){
            if(sprite.cycle===cfg.cycle){
              const actor=e.state.crew[cfg.actor],m=this.c.getTransform();
              this.npcObservedV017.push({id:sprite.entry.id,actor:actor.id,room:e.room.id,
                profile:e.appearance(actor,e.crewRole(actor)).id,x:actor.x,z:actor.z,
                phase:actor.phase,facing:actor.facing,time:e.state.time,a:m.a,d:m.d,
                moved:!!this.npcWalkObservationV014?.moving});
            }return this.npcOriginalDrawV017(sprite,height,anchor);
          };
        }""", config)
        draws_by_direction = {}
        try:
            for facing, label in ((1, "right"), (-1, "left")):
                page.wait_for_function("""({ids,facing,actor})=>{
                  const q=__COVENANT_QA__,a=q.engine.state.crew[actor];
                  const complete=a.phase==='walk'&&a.facing===facing&&ids.every(id=>q.renderer.npcObservedV017
                    .some(row=>row.id===id&&row.facing===facing&&row.a*facing>0&&row.d>0&&row.moved));
                  if(complete)q.freeze();return complete;
                }""", arg={"ids": cycle["frames"], "facing": facing, "actor": config["actor"]}, timeout=90000)
                paused = page.evaluate("""actor=>{
                  const q=__COVENANT_QA__,e=q.engine;q.freeze();q.renderer.frame(0,{});
                  return {time:e.state.time,before:JSON.stringify(q.snapshot()),
                    actor:{phase:e.state.crew[actor].phase,facing:e.state.crew[actor].facing},
                    last:q.renderer.npcObservedV017.at(-1)};
                }""", config["actor"])
                rows = page.evaluate("__COVENANT_QA__.renderer.npcObservedV017.slice()")
                selected = [row for row in rows if row["facing"] == facing]
                check("Native " + name + " patrol draws eight " + label + "-facing phases without actor edits",
                      all(any(row["id"] == identity and row["moved"] and row["a"] * facing > 0
                              and row["profile"] == config["key"] and row["actor"] == config["actor"]
                              and row["room"] == config["room"] and row["phase"] == "walk" for row in selected)
                          for identity in cycle["frames"]),
                      {"frames": cycle["frames"], "nativeSpeed": config["speed"], "angularFrequency": cycle["angularFrequency"]})
                page.wait_for_timeout(160)
                repeated = page.evaluate("""()=>{
                  const q=__COVENANT_QA__;q.renderer.frame(0,{});
                  return {time:q.engine.state.time,after:JSON.stringify(q.snapshot()),last:q.renderer.npcObservedV017.at(-1)};
                }""")
                check("Paused " + name + " keeps the observed frame and exact simulation: " + label,
                      paused["time"] == repeated["time"] and paused["before"] == repeated["after"]
                      and paused["actor"] == {"phase": "walk", "facing": facing}
                      and repeated["last"]["time"] == paused["time"]
                      and paused["last"]["id"] == repeated["last"]["id"]
                      and repeated["last"]["facing"] == facing and repeated["last"]["moved"])
                capture(page, "walk-" + config["key"] + "-" + label,
                        "Native patrol in a room reached by real controls; no actor, route or clock injection")
                draws_by_direction[label] = selected
                page.evaluate("__COVENANT_QA__.resume()")
            after = observation(page)
            check("Observing " + name + " leaves the player and reached progression untouched",
                  after["room"] == initial["room"] == config["room"]
                  and after["player"]["x"] == initial["player"]["x"]
                  and after["player"]["z"] == initial["player"]["z"]
                  and after["actions"] == initial["actions"])
            receipt["npcWalkCycles"].append({"id": cycle["id"], "key": config["key"], "actor": config["actor"],
                "room": config["room"], "gameplayStateInjected": False, "clockInjected": False,
                "nativeSpeed": config["speed"], "angularFrequency": cycle["angularFrequency"],
                "observedRightFrames": sorted({row["id"] for row in draws_by_direction["right"]}),
                "observedLeftFrames": sorted({row["id"] for row in draws_by_direction["left"]}),
                "rightDraws": draws_by_direction["right"], "leftDraws": draws_by_direction["left"]})
            flush()
        finally:
            page.evaluate("""()=>{const q=__COVENANT_QA__;
              q.renderer.drawPose=q.renderer.npcOriginalDrawV017;
              delete q.renderer.npcOriginalDrawV017;delete q.renderer.npcObservedV017;q.resume();}""")

    page = None
    try:
        with static_site(root, args.base) as base, sync_playwright() as pw:
            launch = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
            executable = os.environ.get("ATF_CHROMIUM_EXECUTABLE")
            if executable:
                launch["executable_path"] = executable
            browser = pw.chromium.launch(**launch)
            receipt["browser"] = {"version": browser.version, "executable": executable or "Playwright-managed"}
            origin = "{}://{}".format(urlsplit(base).scheme, urlsplit(base).netloc)
            context = browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
            context.add_init_script(
                "if(window===window.top && location.origin===" + json.dumps(origin) +
                " && !sessionStorage.getItem('qa-covenant-seeded')){"
                "for(const [k,v] of Object.entries(" + json.dumps(sentinels) + "))localStorage.setItem(k,v);"
                "sessionStorage.setItem('qa-covenant-seeded','true');}"
            )
            page = context.new_page()
            page.set_default_timeout(20000)
            page.on("pageerror", lambda error: receipt["pageErrors"].append(str(error)))
            page.on("response", lambda response: receipt["httpErrors"].append({
                "url": response.url, "status": response.status
            }) if response.status >= 400 and (
                "/dlc/covenant/" in response.url or "/alien-covenant-v011/" in response.url
                or "/alien-covenant-v012/" in response.url or "/alien-covenant-v013/" in response.url
                or "/alien-covenant-v014/" in response.url or "/alien-covenant-v016/" in response.url or "/alien-covenant-v017/" in response.url) else None)
            response = page.goto(base + "/dlc/covenant/?qa=1&from=tantalus", wait_until="load")
            check("Served Covenant route returns HTTP 200", response is not None and response.status == 200)
            page.wait_for_function("!!window.__COVENANT_QA__ && !!window.CovenantSpritesV011")
            check("Production renderer includes the final sprite layer", page.evaluate(
                "__COVENANT_QA__.renderer instanceof CovenantSpriteRendererV011"))
            check("Loading the module preserves host profiles", host_preserved(page))
            page.locator("#difficulty").select_option("explorer")
            page.locator("#begin").click()
            page.wait_for_function("__COVENANT_QA__.engine.room.id === 'cryo' && !__COVENANT_QA__.engine.paused")
            page.wait_for_function("CovenantSpritesV011.inspect().images.some(v=>v.id==='daniels-work' && v.status==='ready')")
            initial = observation(page)
            check("New expedition starts through the public UI", initial["room"] == "cryo" and initial["actions"] == [])
            before_draws = initial["spriteDraws"]["human"]
            page.wait_for_timeout(300)
            check("A fresh live frame draws the neutral human PNG", observation(page)["spriteDraws"]["human"] > before_draws)
            capture(page, "01-reached-cryo", "Fresh campaign reached by clicking Commencer; real PNG and room render")
            receipt["reachedRooms"].append("cryo")

            walk_cycles = page.evaluate("CovenantSpritesV011.inspect().cycles || []")
            player_cycles = [cycle for cycle in walk_cycles if cycle.get("consumer") == "player"]
            check("Four complete player walk cycles are declared with distinct costume scopes",
                  len(player_cycles) == 4
                  and {cycle.get("key") for cycle in player_cycles} == {"daniels-work", "daniels", "daniels-eva", "david-young"}
                  and all(len(cycle["frames"]) == 8 and cycle["rooms"] for cycle in player_cycles),
                  [{"id": cycle["id"], "key": cycle.get("key"), "rooms": cycle.get("rooms")} for cycle in player_cycles])
            npc_cycles = [cycle for cycle in walk_cycles if cycle.get("consumer") == "npc"]
            check("NPC cycles are restricted to the existing unarmed Walter and Upworth presences",
                  len(npc_cycles) == 2 and {row["id"] for row in npc_cycles} == {"walter-walk", "upworth-walk"}
                  and all(row["actors"] == [{"walter": "walter-cryo", "upworth": "upworth-comms"}[row["key"]]]
                          and row["rooms"] == [{"walter": "cryo", "upworth": "comms"}[row["key"]]] for row in npc_cycles), npc_cycles)
            observe_native_npc(page, next(row for row in npc_cycles if row["key"] == "walter"))
            opening_cycle = next(cycle for cycle in walk_cycles if cycle["key"] == "daniels-work")
            if walk_cycles:
                before_walk = observation(page)
                page.keyboard.down("ArrowRight")
                try:
                    page.wait_for_function("""(ids) => ids.every(id =>
                        (__COVENANT_QA__.renderer.spriteFrameDrawsV012[id] || 0) > 0)""",
                        arg=opening_cycle["frames"])
                    pause = page.evaluate("""() => {
                      const q=__COVENANT_QA__, e=q.engine;q.freeze();
                      return {time:e.state.time, moving:e.motion.moving, before:JSON.stringify(q.snapshot()),
                        frame:CovenantSpritesV011.entry('human','daniels-work','walk',e.room.id,e.state.time).id};
                    }""")
                finally:
                    page.keyboard.up("ArrowRight")
                check("Actual unarmed keyboard walking draws all eight supplied phases",
                      observation(page)["player"]["x"] > before_walk["player"]["x"] + 10
                      and pause["moving"], observation(page)["cycleFrameDraws"])
                page.wait_for_timeout(180)
                paused = page.evaluate("""() => {
                  const q=__COVENANT_QA__, e=q.engine;q.renderer.frame(0,{});
                  return {time:e.state.time, after:JSON.stringify(q.snapshot()),
                    frame:CovenantSpritesV011.entry('human','daniels-work','walk',e.room.id,e.state.time).id};
                }""")
                check("Pausing a real walk freezes its phase without changing simulation",
                      pause["time"] == paused["time"] and pause["frame"] == paused["frame"]
                      and pause["before"] == paused["after"])
                receipt["walkCycles"] = [{"id": opening_cycle["id"], "key": "daniels-work", "room": "cryo",
                    "observedFrameDraws": {identity: observation(page)["cycleFrameDraws"].get(identity, 0)
                                           for identity in opening_cycle["frames"]},
                    "pausedFrame": pause["frame"], "time": pause["time"],
                    "gameplayStateInjected": False}]
                capture(page, "01a-paused-real-walk", "Real keyboard walking paused for phase and renderer-purity inspection")
                page.evaluate("__COVENANT_QA__.resume()")

            for room_id, destination in (("cryo", "service"), ("service", "bridge"), ("bridge", "comms")):
                check("Actual room before traversal: " + room_id, observation(page)["room"] == room_id)
                actions = page.evaluate("__COVENANT_QA__.engine.room.actions.filter(a=>a.required).map(a=>({id:a.id,x:a.x,z:a.z}))")
                for action in actions:
                    move_to(page, action)
                    page.keyboard.press("e")
                    page.wait_for_function("(id)=>__COVENANT_QA__.engine.done(id)", arg=action["id"], timeout=12000)
                    check("Action completed through keyboard interaction: " + action["id"], action["id"] in observation(page)["actions"])
                doorway = page.evaluate(
                    "(to)=>{const e=__COVENANT_QA__.engine.room.exits.find(e=>e.to===to);return {id:e.id,x:e.x,z:e.z}}",
                    destination)
                move_to(page, doorway)
                page.keyboard.press("e")
                page.wait_for_function("(id)=>__COVENANT_QA__.engine.room.id===id", arg=destination)
                receipt["reachedRooms"].append(destination)
                page.wait_for_timeout(300)
                capture(page, "02-reached-" + destination, "Real keyboard traversal from " + room_id)
            check("Opening journey crosses the real service obstruction", receipt["controls"]["jumps"] > 0)
            check("Six mandatory actions were actually completed", len(observation(page)["actions"]) == 6)
            observe_native_npc(page, next(row for row in npc_cycles if row["key"] == "upworth"))
            check("New visuals preserve host profiles during play", host_preserved(page))

            page.keyboard.press("Escape")
            page.locator('[data-do="save"]').click()
            saved = json.loads(storage(page)[DLC_KEY])
            check("Pause UI writes the existing Covenant save format",
                  saved["format"] == "ATF-COVENANT" and saved["version"] == 1 and saved["revision"] == 10)
            (output / "reached-comms-save.json").write_text(json.dumps(saved, ensure_ascii=False, indent=2) + "\n")
            page.reload(wait_until="load")
            page.locator("#resume").click()
            page.wait_for_function("__COVENANT_QA__.engine.room.id === 'comms'")
            resumed = page.evaluate("__COVENANT_QA__.snapshot()")
            check("Reload and Reprendre preserve room, actions, position and ammunition",
                  resumed["state"]["room"] == saved["state"]["room"]
                  and resumed["state"]["actions"] == saved["state"]["actions"]
                  and abs(resumed["state"]["player"]["x"] - saved["state"]["player"]["x"]) < 1
                  and abs(resumed["state"]["player"]["z"] - saved["state"]["player"]["z"]) < .001
                  and resumed["state"]["ammo"] == saved["state"]["ammo"]
                  and resumed["state"]["reserve"] == saved["state"]["reserve"])
            capture(page, "03-resumed-comms", "Saved campaign resumed through the public resume button")
            pure = page.evaluate("""() => {
              const q=__COVENANT_QA__;q.freeze();const before=JSON.stringify(q.snapshot());
              q.renderer.frame(0,{});const after=JSON.stringify(q.snapshot());
              return {equal:before===after,room:q.engine.room.id};
            }""")
            check("Rendering the reached room cannot change the exported simulation", pure["equal"], pure)

            receipt["assetDecoding"] = page.evaluate("""async () => {
              const rows=[];
              for(const entry of CovenantSpritesV011.entries()){
                const response=await fetch(entry.path,{credentials:'same-origin'});
                if(!response.ok)throw Error('PNG request failed: '+entry.id);
                const bytes=await response.arrayBuffer();
                const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))]
                  .map(v=>v.toString(16).padStart(2,'0')).join('');
                const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
                try {
                  const image=new Image();image.src=url;await image.decode();
                  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
                  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
                  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
                  let left=canvas.width,top=canvas.height,right=0,bottom=0,visible=0,opaque=0,zeros=0,edgeAbove16=0,nonOpaque=0;
                  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
                    const alpha=data[(y*canvas.width+x)*4+3];
                    if(alpha===0)zeros++;
                    if(alpha!==255)nonOpaque++;
                    if((x===0||y===0||x===canvas.width-1||y===canvas.height-1)&&alpha>16)edgeAbove16++;
                    if(alpha>=32){visible++;if(alpha>=240)opaque++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
                  }
                  const bounds=[left,top,right,bottom];
                  const background=entry.kind==='background'&&entry.imagePolicy==='opaque-background';
                  rows.push({id:entry.id,width:canvas.width,height:canvas.height,sha256,
                    bytes:bytes.byteLength,alphaBounds:bounds,zeroAlphaPixels:zeros,
                    visiblePixels:visible,opaqueFraction:visible?opaque/visible:0,edgeAbove16,nonOpaquePixels:nonOpaque,
                    imagePolicy:background?'opaque-background':'transparent-sprite',
                    ok:sha256===entry.sha256 && bytes.byteLength===entry.bytes
                      && canvas.width===entry.width && canvas.height===entry.height
                      && JSON.stringify(bounds)===JSON.stringify(entry.alphaBounds)
                      && visible>0 && (background?nonOpaque===0:zeros>0&&edgeAbove16===0)});
                  canvas.width=1;canvas.height=1;
                } finally {URL.revokeObjectURL(url);}
              }return rows;
            }""")
            check("Every admitted PNG is decoded from served original bytes with its explicit alpha policy and bounds",
                  bool(receipt["assetDecoding"]) and all(row["ok"] for row in receipt["assetDecoding"]),
                  {"images": len(receipt["assetDecoding"]),
                   "failures": [row["id"] for row in receipt["assetDecoding"] if not row["ok"]]})

            page.evaluate("__COVENANT_QA__.resume()")
            page.keyboard.press("Escape")
            page.locator('[data-do="title"]').click()
            stored_before_tableau = storage(page)[DLC_KEY]
            page.locator("#prologueFront").click()
            page.wait_for_function("__COVENANT_QA__.engine.room.id === 'whiteroom'")
            page.wait_for_timeout(300)
            check("White-room tableau does not overwrite the reached campaign", storage(page)[DLC_KEY] == stored_before_tableau)
            young_cycle = next((cycle for cycle in walk_cycles if cycle.get("key") == "david-young"), None)
            if young_cycle:
                observe_walk_cycle(page, young_cycle, prepared=False)
                check("Walking David through the public tableau preserves the reached campaign bytes",
                      storage(page)[DLC_KEY] == stored_before_tableau)
            capture(page, "04-public-prologue-tableau", "Public isolated prologue button; campaign save remains unchanged")
            page.locator("#leaveScene").click()
            check("Leaving the tableau preserves the exact campaign bytes", storage(page)[DLC_KEY] == stored_before_tableau)
            if not args.skip_title:
                page.locator("#returnHost").click()
                page.locator("#title-start").wait_for(state="visible")
                page.locator("#title-start").click()
                page.locator("#title-covenant").wait_for(state="visible")
                check("Host title returns with Covenant in its public menu", page.locator("#title-covenant").is_visible())
                page.locator("#title-covenant").click()
                page.wait_for_url("**/dlc/covenant/?from=tantalus")
                page.locator("#resume").wait_for(state="visible")
                check("Host menu opens the preserved Covenant campaign", storage(page)[DLC_KEY] == stored_before_tableau)
            check("All host profiles remain byte-identical", host_preserved(page))

            fixture_context = browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
            fixture_page = fixture_context.new_page()
            fixture_page.set_default_timeout(20000)
            fixture_page.on("pageerror", lambda error: receipt["pageErrors"].append("pose fixture: " + str(error)))
            fixture_page.goto(base + "/dlc/covenant/?qa=1", wait_until="load")
            fixture_page.wait_for_function("!!window.__COVENANT_QA__")
            for key, room in (("daniels", "landing"), ("daniels-eva", "sailaccess")):
                cycle = next((row for row in walk_cycles if row.get("key") == key), None)
                if not cycle:
                    continue
                fixture_page.evaluate("""room=>{
                  const q=__COVENANT_QA__;q.go(room,true);q.engine.state.weapon=false;
                  q.resume();
                }""", room)
                observe_walk_cycle(fixture_page, cycle, prepared=True)
                if room == "landing":
                    fixture_page.wait_for_function("CovenantSpritesV011.inspect().images.some(row=>row.id==='background-planet4-lake'&&row.status==='ready')")
                    background = fixture_page.evaluate("""()=>{
                      const q=__COVENANT_QA__,r=q.renderer,c=r.c;q.freeze();
                      const before=JSON.stringify(q.snapshot()),events=[];
                      const draw=c.drawImage,fillRect=c.fillRect,portal=r.portal,prop=r.prop;
                      c.drawImage=function(image,...args){
                        if(image.src?.endsWith('/background-planet4-lake.png'))events.push({kind:'lake',rect:args});
                        return draw.call(this,image,...args);
                      };
                      c.fillRect=function(x,y,w,h){
                        if(x===0&&y===514&&h>=200)events.push({kind:'floor'});
                        return fillRect.call(this,x,y,w,h);
                      };
                      r.portal=function(exit){events.push({kind:'portal',id:exit.id});return portal.call(this,exit)};
                      r.prop=function(object){events.push({kind:'prop',id:object.id});return prop.call(this,object)};
                      try{r.frame(0,{})}finally{c.drawImage=draw;c.fillRect=fillRect;r.portal=portal;r.prop=prop}
                      return {room:q.engine.room.id,pure:before===JSON.stringify(q.snapshot()),events,
                        expectedPortals:q.engine.room.exits.map(exit=>exit.id),
                        sourceSize:[1914,822],logicalSkyHeight:555,gameplayStateInjected:true};
                    }""")
                    events = background["events"]
                    lake_index = next((index for index, event in enumerate(events) if event["kind"] == "lake"), -1)
                    floor_index = next((index for index, event in enumerate(events) if event["kind"] == "floor"), -1)
                    portals = {event["id"] for event in events if event["kind"] == "portal"}
                    check("Prepared landing draws the lake before its original floor, portals and independent props",
                          background["pure"] and background["room"] == "landing"
                          and 0 <= lake_index < floor_index
                          and portals == set(background["expectedPortals"])
                          and all(index > floor_index for index, event in enumerate(events)
                                  if event["kind"] in ("portal", "prop")), background)
                    receipt["preparedBackgrounds"].append(background)
                    capture(fixture_page, "fixture-landing-lake", "Prepared landing room; distant lake PNG precedes unchanged native playable geometry")
                    fixture_page.evaluate("__COVENANT_QA__.resume()")
            available = fixture_page.evaluate("CovenantSpritesV011.entries().filter(e=>e.kind==='creature').map(e=>({id:e.id,key:e.key,state:e.state}))")
            for entry in available:
                prepared = fixture_page.evaluate("""(entry) => {
                  const q=__COVENANT_QA__, room=CovenantData.rooms.find(r=>r.enemies.some(e=>e.kind===entry.key));
                  if(!room)return null;
                  q.go(room.id,true);q.freeze();
                  const enemy=q.engine.enemies().find(e=>e.kind===entry.key);
                  enemy.phase=entry.state==='attack'?'lunge':'idle';enemy.stun=0;enemy.alive=true;
                  q.engine.state.sequence=null;
                  q.engine.state.player.x=Math.max(40,enemy.x-220);
                  q.engine.state.player.z=enemy.z;q.engine.state.weapon=false;
                  q.renderer.camera=Math.max(0,Math.min(room.width-q.renderer.W,enemy.x-q.renderer.W*.58));
                  q.renderer.frame(0,{});
                  return {room:room.id,enemy:enemy.id,phase:enemy.phase,fixture:true};
                }""", entry)
                check("Creature fixture has an original encounter: " + entry["id"], prepared is not None)
                fixture_page.wait_for_function(
                    "(id)=>CovenantSpritesV011.inspect().images.some(v=>v.id===id&&v.status==='ready')", arg=entry["id"])
                result = fixture_page.evaluate("""() => {
                  const q=__COVENANT_QA__, before=JSON.stringify(q.snapshot()),count=q.renderer.spriteDrawsV011.creature;
                  q.renderer.frame(0,{});
                  return {pure:before===JSON.stringify(q.snapshot()),drawn:q.renderer.spriteDrawsV011.creature>count};
                }""")
                check("Prepared pose draws without editing simulation: " + entry["id"], result["pure"] and result["drawn"])
                receipt["preparedCreaturePoses"].append({**entry, **prepared})
                capture(fixture_page, "fixture-" + entry["id"], "Prepared creature pose; not a gameplay-reached combat state")
            props = fixture_page.evaluate("""CovenantSpritesV011.entries().filter(e=>
                e.kind==='prop'&&(e.path.startsWith('/assets/openai/sprites/alien-covenant-v012/')||e.id==='world-planet4-shore-rock'))
                .map(e=>({id:e.id,key:e.key,rooms:e.rooms}))""")
            for entry in props:
                prepared = fixture_page.evaluate("""(entry) => {
                  const q=__COVENANT_QA__, room=CovenantData.rooms.find(r=>
                    entry.rooms.includes(r.id)&&r.props.some(o=>o.id===entry.key));
                  if(!room)return null;
                  q.go(room.id,true);q.freeze();
                  const object=q.engine.room.props.find(o=>o.id===entry.key);
                  q.engine.state.player.x=40;
                  q.renderer.camera=Math.max(0,Math.min(room.width-q.renderer.W,object.x-q.renderer.W*.58));
                  q.renderer.frame(0,{});
                  return {room:room.id,instance:object.id,kind:object.kind,fixture:true};
                }""", entry)
                check("Prop fixture uses the exact existing instance: " + entry["id"], prepared is not None)
                fixture_page.wait_for_function(
                    "(id)=>CovenantSpritesV011.inspect().images.some(v=>v.id===id&&v.status==='ready')", arg=entry["id"])
                rendered = fixture_page.evaluate("""(key) => {
                  const q=__COVENANT_QA__, before=JSON.stringify(q.snapshot()),count=q.renderer.spriteDrawsV011.prop;
                  const object=q.engine.room.props.find(o=>o.id===key),point=q.renderer.propPoint(object);
                  const original=q.renderer.drawPose;let geometry=null;
                  q.renderer.drawPose=function(sprite,height,anchor){
                    if(sprite.entry.id==='world-planet4-shore-rock'){
                      const e=sprite.entry,b=e.alphaBounds,m=this.c.getTransform(),scale=height/(b[3]-b[1]);
                      // Canvas pixels include the frame's viewport scale; native
                      // propPoint and footprint limits use logical scene units.
                      const canvasScale=this.scale;
                      geometry={width:(b[2]-b[0])*scale*m.a/canvasScale,height:height*m.d/canvasScale,
                        foot:(m.f+(b[3]-(anchor||e.anchor)[1])*scale*m.d)/canvasScale,canvasScale,
                        nativeFoot:point.y,limitWidth:object.w*point.s,limitHeight:object.h*point.s,
                        solid:object.solid};
                    }return original.call(this,sprite,height,anchor);
                  };
                  try{q.renderer.prop(object)}finally{q.renderer.drawPose=original}
                  return {pure:before===JSON.stringify(q.snapshot()),drawn:q.renderer.spriteDrawsV011.prop>count,geometry};
                }""", entry["key"])
                check("Prepared prop draws without editing simulation: " + entry["id"],
                      rendered["pure"] and rendered["drawn"])
                if entry["id"] == "world-planet4-shore-rock":
                    geometry = rendered["geometry"]
                    check("The promoted shore rock keeps its foot on the native shore and fits its non-solid footprint",
                          geometry is not None and abs(geometry["foot"] - geometry["nativeFoot"]) < 1e-6
                          and 0 < geometry["width"] <= geometry["limitWidth"] + 1e-6
                          and 0 < geometry["height"] <= geometry["limitHeight"] + 1e-6
                          and geometry["solid"] is False, geometry)
                receipt["preparedPropPoses"].append({**entry, **prepared, "geometry": rendered["geometry"]})
                capture(fixture_page, "fixture-" + entry["id"], "Prepared exact prop instance; not a gameplay-reached room")
            fixture_context.close()

            for cycle in walk_cycles:
                partial_context = browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
                partial_page = partial_context.new_page()
                partial_page.set_default_timeout(20000)
                partial_errors = []
                partial_page.on("pageerror", lambda error: partial_errors.append(str(error)))
                missing_phase = cycle["frames"][-1]
                missing_path = page.evaluate("id=>CovenantSpritesV011.entries().find(row=>row.id===id).path", missing_phase)
                partial_page.route("**" + missing_path, lambda route: route.abort("failed"))
                partial_page.goto(base + "/dlc/covenant/?qa=1", wait_until="load")
                partial_page.wait_for_function("!!window.__COVENANT_QA__")
                key = cycle.get("key", "daniels-work")
                prepared = key in ("daniels", "daniels-eva", "upworth")
                npc = cycle.get("consumer") == "npc"
                actor_id = cycle["actors"][0] if npc else None
                if key in ("daniels-work", "walter"):
                    partial_page.locator("#begin").click()
                elif key == "david-young":
                    partial_page.locator("#prologueFront").click()
                else:
                    room = {"daniels": "landing", "daniels-eva": "sailaccess", "upworth": "comms"}[key]
                    partial_page.evaluate("""room=>{const q=__COVENANT_QA__;
                        q.go(room,true);q.engine.state.weapon=false;q.resume();}""", room)
                before = observation(partial_page)
                before_npc = partial_page.evaluate("id=>__COVENANT_QA__.engine.state.crew[id].x", actor_id) if npc else None
                if not npc:
                    partial_page.keyboard.down("ArrowRight")
                try:
                    partial_page.wait_for_function("""(id)=>CovenantSpritesV011.inspect().images
                        .some(v=>v.id===id&&v.status==='unavailable')""", arg=missing_phase)
                    partial_page.wait_for_timeout(750)
                finally:
                    if not npc:
                        partial_page.keyboard.up("ArrowRight")
                after = observation(partial_page)
                after_npc = partial_page.evaluate("id=>__COVENANT_QA__.engine.state.crew[id].x", actor_id) if npc else None
                partial_status = partial_page.evaluate("CovenantSpritesV011.inspect()")
                status = next(row for row in partial_status["cycles"] if row["id"] == cycle["id"])
                movement = abs(after_npc - before_npc) > 10 if npc else after["player"]["x"] > before["player"]["x"] + 10
                complete_fallback = (movement
                    and all(not after["cycleFrameDraws"].get(identity, 0) for identity in cycle["frames"])
                    and not partial_errors and not status["ready"])
                check("One unavailable phase keeps the entire cycle procedural during real movement: " + key,
                      complete_fallback, {"blockedPhase": missing_phase, "expectedPNGFailure": True,
                      "gameplayStateInjected": prepared, "nativeNpcPatrol": npc, "pageErrors": partial_errors})
                receipt["incompleteWalkCycles"].append({"id": cycle["id"], "blockedPhase": missing_phase,
                    "room": before["room"], "gameplayStateInjected": prepared, "nativeNpcPatrol": npc, "passed": complete_fallback})
                capture(partial_page, "fixture-incomplete-" + cycle["id"],
                        "One PNG deliberately blocked; no phase of that cycle is drawn")
                partial_context.close()

            lake_context = browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
            lake_page = lake_context.new_page()
            lake_errors = []
            lake_page.on("pageerror", lambda error: lake_errors.append(str(error)))
            lake_page.route("**/assets/openai/sprites/alien-covenant-v014/background-planet4-lake.png",
                            lambda route: route.abort("failed"))
            lake_page.goto(base + "/dlc/covenant/?qa=1", wait_until="load")
            lake_page.wait_for_function("!!window.__COVENANT_QA__")
            lake_page.evaluate("""()=>{const q=__COVENANT_QA__;
                q.go('landing',true);q.engine.state.weapon=false;q.resume();}""")
            lake_page.wait_for_function("CovenantSpritesV011.inspect().images.some(row=>row.id==='background-planet4-lake'&&row.status==='unavailable')")
            before_lake = observation(lake_page)
            lake_page.keyboard.down("ArrowRight")
            try:
                lake_page.wait_for_timeout(300)
            finally:
                lake_page.keyboard.up("ArrowRight")
            after_lake = observation(lake_page)
            check("An unavailable lake PNG retains the native landing background and real movement",
                  after_lake["player"]["x"] > before_lake["player"]["x"] + 10
                  and after_lake["spriteDraws"]["background"] == 0 and not lake_errors,
                  {"expectedPNGFailure": True, "gameplayStateInjected": True, "pageErrors": lake_errors})
            capture(lake_page, "fixture-missing-lake", "Prepared landing with only its lake PNG blocked; native sky fallback")
            lake_context.close()

            missing_context = browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
            missing_page = missing_context.new_page()
            fallback_errors = []
            missing_page.on("pageerror", lambda error: fallback_errors.append(str(error)))
            for version in ("v011", "v012", "v013", "v014", "v016", "v017"):
                missing_page.route("**/assets/openai/sprites/alien-covenant-" + version + "/*.png",
                                   lambda route: route.abort("failed"))
            missing_page.goto(base + "/dlc/covenant/?qa=1", wait_until="load")
            missing_page.locator("#begin").click()
            missing_page.wait_for_function(
                "CovenantSpritesV011.inspect().images.some(v=>v.id==='daniels-work'&&v.status==='unavailable')")
            before = observation(missing_page)
            missing_page.keyboard.down("ArrowRight")
            missing_page.wait_for_timeout(300)
            missing_page.keyboard.up("ArrowRight")
            after = observation(missing_page)
            check("Failed PNG requests retain procedural rendering and playable movement",
                  after["player"]["x"] > before["player"]["x"] + 10
                  and after["spriteDraws"]["human"] == 0 and not fallback_errors,
                  {"expectedPNGFailures": True, "pageErrors": fallback_errors})
            capture(missing_page, "fixture-missing-images", "Deliberate PNG failures in a separate context; procedural fallback")
            missing_page.evaluate("""()=>{const q=__COVENANT_QA__;q.go('landing',true);q.freeze();
                q.renderer.camera=950;q.renderer.frame(0,{});}""")
            missing_page.wait_for_function("CovenantSpritesV011.inspect().images.some(v=>v.id==='world-planet4-shore-rock'&&v.status==='unavailable')")
            fallback_rock = missing_page.evaluate("""()=>{
              const q=__COVENANT_QA__,parent=Object.getPrototypeOf(CovenantSpriteRendererV011.prototype);
              const original=parent.prop,before=JSON.stringify(q.snapshot()),count=q.renderer.spriteDrawsV011.prop;
              let native=false;parent.prop=function(o){if(o.id==='landing-light2')native=true;return original.call(this,o)};
              try{q.renderer.prop(q.engine.room.props.find(o=>o.id==='landing-light2'))}finally{parent.prop=original}
              return {native,pure:before===JSON.stringify(q.snapshot()),noPNG:count===q.renderer.spriteDrawsV011.prop};
            }""")
            check("A missing shore-rock image retains its native rendering and exact simulation",
                  all(fallback_rock.values()) and not fallback_errors, fallback_rock)
            capture(missing_page, "fixture-missing-shore-rock", "Prepared landing; all PNG requests blocked, exact rock uses native Canvas")
            missing_context.close()
            check("No unexpected Covenant page or asset errors", not receipt["pageErrors"] and not receipt["httpErrors"],
                  {"pageErrors": receipt["pageErrors"], "httpErrors": receipt["httpErrors"]})
            receipt["ok"] = True
            receipt["finishedAt"] = datetime.now(timezone.utc).isoformat()
            flush()
            context.close()
            browser.close()
    except Exception as error:
        receipt["failure"] = str(error)
        receipt["finishedAt"] = datetime.now(timezone.utc).isoformat()
        flush()
        if page is not None:
            try:
                capture(page, "failure", "Failure state; no completion claimed")
            except Exception:
                pass
        raise
    finally:
        flush()
    print(json.dumps({"ok": receipt["ok"], "tests": len(receipt["tests"]),
                      "reachedRooms": receipt["reachedRooms"], "decodedSprites": len(receipt["assetDecoding"]),
                      "preparedCreaturePoses": len(receipt["preparedCreaturePoses"]),
                      "preparedPropPoses": len(receipt["preparedPropPoses"]),
                      "walkCycles": len(receipt["walkCycles"]),
                      "npcWalkCycles": len(receipt["npcWalkCycles"]),
                      "preparedBackgrounds": len(receipt["preparedBackgrounds"]),
                      "hostMenuValidated": not args.skip_title}), flush=True)


if __name__ == "__main__":
    main()
