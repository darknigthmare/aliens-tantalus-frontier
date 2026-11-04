import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_ANNEX_ENTRANCES_V133 } from '../src/hub-navigation-layout-v133.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { getHubDoorFaceV142 } from '../src/hub-door-passage-v142.js';
import { getHubCirculationPlanV137, getHubCirculationSolidReservationsV138 } from '../src/hub-circulation-v137.js';
import { HubGame as ProductionHub } from '../src/hub-opening-v88.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

// The fixture uses real production composition and physics with declared
// EventTarget/RAF/image-header/Canvas doubles; it is not Chromium or pixel QA.
const workshop = HUB_DECKS[2].rooms.find(room => room.id === 'workshop');
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-6, `${a} differs from ${b}`);
const advance = (hub,seconds,visit=()=>{}) => { for(let t=0;t<seconds-1e-9;t+=1/60){hub.update(Math.min(1/60,seconds-t));visit(hub.player);} };
function nativeHost() {
  const root = fileURLToPath(new URL('../', import.meta.url)), events = new EventTarget();
  for (const method of ['addEventListener', 'removeEventListener']) globalThis[method] = events[method].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) {
      this._src = source; let descriptor;
      try {
        descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
        const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
        if (header.subarray(1, 4).toString() === 'PNG') [this.naturalWidth, this.naturalHeight] = [header.readUInt32BE(16), header.readUInt32BE(20)];
        else if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') {
          this.naturalWidth = header.readUIntLE(24, 3) + 1; this.naturalHeight = header.readUIntLE(27, 3) + 1;
        }
      } catch {} finally { if (descriptor !== undefined) closeSync(descriptor); }
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing fixture image'); }
  };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event);
  };
  return { canvas, key };
}


async function fixture(localX, y=532, resumedClimbing=false, roomId='workshop') {
  const browser=nativeHost(),raw=createDefaultSave();raw.needsPlayerCreationV84=false;
  const deck=HUB_DECKS.findIndex(entry=>entry.rooms.some(room=>room.id===roomId));
  const room=HUB_DECKS[deck].rooms.find(entry=>entry.id===roomId);
  Object.assign(raw.hub,{deck,roomId,positionX:room.xStart+localX,positionY:y,climbing:resumedClimbing});
  const save=migrateSave(raw);
  const hub=new ProductionHub(browser.canvas,{onAction(){},onPersist(){},onStatus(){}});
  hub.start(save.hub,{routineContextV62:{save}});
  for(let i=0;i<8;i++)await Promise.resolve();
  return {...browser,hub,save};
}
function hold(subject,code,seconds){subject.key('keydown',code);advance(subject.hub,seconds);subject.key('keyup',code);advance(subject.hub,.1);}
function walk(subject,target){
  const code=target>subject.hub.player.x?'KeyD':'KeyA';subject.key('keydown',code);
  for(let step=0;step<1000&&Math.abs(target-subject.hub.player.x)>5;step++)subject.hub.update(1/60);
  subject.key('keyup',code);advance(subject.hub,.2);assert.ok(Math.abs(target-subject.hub.player.x)<30,`walk stopped at ${subject.hub.player.x}, target ${target}`);
}
function landing(hub,y){near(hub.player.y+hub.player.h,y);assert.equal(hub.player.climbing,false);assert.equal(hub.player.grounded,true);}
function climbTo(subject,code,y){
  subject.key('keydown',code);
  for(let step=0;step<300&&(Math.abs(subject.hub.player.y+subject.hub.player.h-y)>1e-6
    ||subject.hub.player.climbing||!subject.hub.player.grounded);step++)subject.hub.update(1/60);
  subject.key('keyup',code);advance(subject.hub,.1);landing(subject.hub,y);
}

const doorBayCasesV182 = [
  {roomId:'briefing',annexId:'mire-archives',lowId:'briefing-low',highId:'briefing-high',floorId:'briefing-floor',tierId:'briefing-tier',legacyX:330,lowY:496},
  {roomId:'cryo-bay',annexId:'escape-pods',lowId:'cryo-low',highId:'cryo-high',floorId:'cryo-floor',tierId:'cryo-tier',legacyX:260,lowY:500},
  {roomId:'medical',annexId:'morgue',lowId:'medical-low',highId:'medical-high',floorId:'medical-floor',tierId:'medical-tier',legacyX:260,lowY:500},
  {roomId:'quarantine',annexId:'bioforge',lowId:'quarantine-low',highId:'quarantine-high',floorId:'quarantine-floor',tierId:'quarantine-tier',legacyX:220,lowY:500}
];
for(const config of doorBayCasesV182){
  const deck=HUB_DECKS.findIndex(entry=>entry.rooms.some(room=>room.id===config.roomId));
  const room=HUB_DECKS[deck].rooms.find(entry=>entry.id===config.roomId);
  test(`V182 ${config.annexId}: complete paired door bay clears native supports and their drawn steel`,()=>{
    const annex=HUB_ANNEX_BY_ID_V137[config.annexId],entry=HUB_ANNEX_ENTRANCES_V133[config.annexId];
    const bounds={x:room.xStart+entry.centerX-annex.entrance.w/2,y:entry.bottom-annex.entrance.h,w:annex.entrance.w,h:annex.entrance.h};
    const local={x:annex.entranceLocalX-annex.entrance.w/2,y:annex.entrance.y,w:annex.entrance.w,h:annex.entrance.h};
    const before=structuredClone({annex,entry}),face=getHubDoorFaceV142(bounds,local,annex.art.alphaBounds.door);
    const paired=getHubDoorFaceV142(local,bounds,annex.art.alphaBounds.door),bay={x:face.target.x-7,y:face.target.y-7,w:face.target.w+14,h:face.target.h+14};
    near(face.target.h,156);near(face.target.y+face.target.h,624);assert.deepEqual(face.pairedSize,paired.pairedSize);
    assert.ok(face.opening.w>=44&&face.opening.h>=92);
    const geometry=buildHubTraversalGeometryV87(deck);
    for(const platform of geometry.platforms.filter(surface=>surface.roomId===room.id)){
      assert.equal(overlap(platform,bay),false,platform.id+' collision crosses the complete door bay');
      for(const depthEnabled of [true,false])for(const steel of getHubCirculationSolidReservationsV138(platform,{...geometry,room,depthEnabled}))
        assert.equal(overlap(steel,bay),false,platform.id+' '+steel.role+' crosses the paired face');
    }
    const low=geometry.platforms.find(entry=>entry.id===config.lowId),floor=geometry.ladders.find(entry=>entry.id===config.floorId);
    assert.ok(floor.x-low.x>=40&&low.x+low.w-floor.x>=40,'Both landing margins keep the complete standing body supported');
    assert.deepEqual({annex,entry},before);
  });
  test(`V182 ${config.annexId}: historical landing and climbing saves retain position then fall under native gravity`,async()=>{
    for(const pose of [{y:config.lowY-92,climbing:false},{y:460,climbing:true}]){
      const subject=await fixture(config.legacyX-22,pose.y,pose.climbing,room.id),hub=subject.hub;
      try{
        near(hub.player.x,room.xStart+config.legacyX-22);near(hub.player.y,pose.y);assert.equal(hub.player.climbing,false);
        const original={x:hub.player.x,resources:structuredClone(subject.save.galaxy.resources),clock:structuredClone(subject.save.clock)};
        let last=hub.player.y,maxStep=0;
        advance(hub,1,player=>{near(player.x,original.x);assert.ok(player.y>=last-1e-6);maxStep=Math.max(maxStep,player.y-last);last=player.y;});
        landing(hub,624);assert.ok(maxStep<20,'No teleport to the new support is allowed');
        assert.equal(hub.player.health,100);assert.deepEqual(subject.save.galaxy.resources,original.resources);assert.deepEqual(subject.save.clock,original.clock);
      }finally{hub.stop();}
    }
  });
  test(`V182 ${config.annexId}: native keys climb both service decks and traverse the paired doorway in both directions`,async()=>{
    const entry=HUB_ANNEX_ENTRANCES_V133[config.annexId],subject=await fixture(entry.centerX-22,532,false,room.id),hub=subject.hub;
    const geometry=buildHubTraversalGeometryV87(deck),low=geometry.platforms.find(p=>p.id===config.lowId),high=geometry.platforms.find(p=>p.id===config.highId);
    const floor=geometry.ladders.find(l=>l.id===config.floorId),tier=geometry.ladders.find(l=>l.id===config.tierId);
    const before={resources:structuredClone(subject.save.galaxy.resources),clock:structuredClone(subject.save.clock)};
    try{
      walk(subject,floor.x-22);climbTo(subject,'KeyW',low.y);
      walk(subject,tier.x-22);climbTo(subject,'KeyW',high.y);
      climbTo(subject,'KeyS',low.y);walk(subject,floor.x-22);climbTo(subject,'KeyS',624);
      walk(subject,room.xStart+entry.centerX-22);assert.equal(hub.nearestParentAnnexDoorV71()?.annexId,config.annexId);
      const pair=hub.hubDoorPairV142(HUB_ANNEX_BY_ID_V137[config.annexId]);
      const openingCenter=pair.parent.opening.x+pair.parent.opening.w/2,halfSpan=(pair.parent.opening.w-hub.player.w)/2;
      // Braking can leave a body just outside the narrower BIOFORGE aperture.
      // Approach through real key taps before asserting an unclamped round trip.
      for(let step=0;step<12&&Math.abs(hub.player.x+22-openingCenter)>halfSpan-2;step++){
        hold(subject,hub.player.x+22<openingCenter?'KeyD':'KeyA',.04);advance(hub,.2);
      }
      assert.ok(Math.abs(hub.player.x+22-openingCenter)<=halfSpan-2,'The entire source body fits the paired opening');
      const origin={x:hub.player.x,y:hub.player.y};
      const offset=origin.x+22-(pair.parent.opening.x+pair.parent.opening.w/2);
      subject.key('keydown','KeyE');subject.key('keyup','KeyE');advance(hub,1.2);assert.equal(hub.currentAnnexV71()?.id,config.annexId);landing(hub,624);
      near(hub.player.x+22-(pair.local.opening.x+pair.local.opening.w/2),offset);
      subject.key('keydown','KeyE');subject.key('keyup','KeyE');advance(hub,1.2);assert.equal(hub.currentAnnexV71(),null);landing(hub,624);
      near(hub.player.x,origin.x);near(hub.player.y,origin.y);assert.equal(hub.player.w,44);assert.equal(hub.player.h,92);assert.equal(hub.player.health,100);
      assert.deepEqual(subject.save.galaxy.resources,before.resources);assert.deepEqual(subject.save.clock,before.clock);
    }finally{hub.stop();}
  });
}

test('the complete paired DURANDAL doorway clears actual workshop deck collision, front steel and brackets',()=>{
  const annex=HUB_ANNEX_BY_ID_V137.durandal,entry=HUB_ANNEX_ENTRANCES_V133.durandal;
  const bounds={x:workshop.xStart+entry.centerX-annex.entrance.w/2,y:entry.bottom-annex.entrance.h,w:annex.entrance.w,h:annex.entrance.h};
  const local={x:annex.entranceLocalX-annex.entrance.w/2,y:annex.entrance.y,w:annex.entrance.w,h:annex.entrance.h};
  const before=structuredClone({annex,entry}),parentFace=getHubDoorFaceV142(bounds,local,annex.art.alphaBounds.door),localFace=getHubDoorFaceV142(local,bounds,annex.art.alphaBounds.door);
  assert.deepEqual(parentFace.pairedSize,localFace.pairedSize);near(parentFace.target.h,156);near(parentFace.target.y+parentFace.target.h,624);
  assert.ok(parentFace.opening.w>=44&&parentFace.opening.h>=92);
  const bay={x:parentFace.target.x-7,y:parentFace.target.y-7,w:parentFace.target.w+14,h:parentFace.target.h+14};
  const geometry=buildHubTraversalGeometryV87(2);
  for(const platform of geometry.platforms.filter(surface=>surface.roomId==='workshop')){
    assert.equal(overlap(platform,bay),false,platform.id+' collision crosses the whole door bay');
    const plan=getHubCirculationPlanV137(platform,{...geometry,room:workshop});
    assert.deepEqual(plan.sourceBounds,{x:platform.x,y:platform.y,w:platform.w,h:platform.h},'The painter must retain the complete live support');
    for(const steel of getHubCirculationSolidReservationsV138(platform,{...geometry,room:workshop}))
      assert.equal(overlap(steel,bay),false,platform.id+' '+steel.role+' crosses the paired face');
  }
  assert.deepEqual({annex,entry},before,'No door socket, crop, face size or pairing is changed');
});

test('a historical workshop landing pose above DURANDAL falls continuously to the real floor, without an invisible old deck',async()=>{
  const subject=await fixture(360-22,500-92),hub=subject.hub;
  try{
    near(hub.player.y+hub.player.h,500);const beforeX=hub.player.x;let previous=hub.player.y,maxStep=0;
    advance(hub,1,player=>{assert.ok(player.y>=previous-1e-6,'No upward snap is allowed');maxStep=Math.max(maxStep,player.y-previous);previous=player.y;});
    landing(hub,624);near(hub.player.x,beforeX);assert.ok(maxStep<20,'Restore must use native gravity, not a position rewrite');
    assert.equal(hub.player.w,44);assert.equal(hub.player.h,92);assert.equal(hub.player.health,100);
  }finally{hub.stop();}
});

for(const pose of [{name:'old west low deck',localX:200,y:408,climbing:false},
  {name:'old floor ladder',localX:250-22,y:460,climbing:true}]){
  test(`migrated Save at the ${pose.name} resumes at the same position and releases stale climbing through native gravity`,async()=>{
    const subject=await fixture(pose.localX,pose.y,pose.climbing),hub=subject.hub;
    try{
      near(hub.player.x,workshop.xStart+pose.localX);near(hub.player.y,pose.y);
      assert.equal(hub.player.climbing,false);assert.equal(hub.player.grounded,false);
      const before={x:hub.player.x,resources:structuredClone(subject.save.galaxy.resources),clock:structuredClone(subject.save.clock)};
      let previous=hub.player.y,maxStep=0;
      advance(hub,1,player=>{near(player.x,before.x);assert.equal(player.climbing,false);assert.ok(player.y>=previous-1e-6);
        maxStep=Math.max(maxStep,player.y-previous);previous=player.y;});
      landing(hub,624);assert.ok(maxStep<20,'No instant move to the replacement ladder or floor is allowed');
      assert.deepEqual(subject.save.galaxy.resources,before.resources);assert.deepEqual(subject.save.clock,before.clock);
    }finally{hub.stop();}
  });
}

test('native workshop controls climb both connected service decks, approach the retained vent, return and traverse DURANDAL both ways',async()=>{
  const subject=await fixture(360-22),hub=subject.hub,resources=structuredClone(subject.save.galaxy.resources);
  const geometry=buildHubTraversalGeometryV87(2),low=geometry.platforms.find(p=>p.id==='workshop-low'),high=geometry.platforms.find(p=>p.id==='workshop-high');
  const floor=geometry.ladders.find(l=>l.id==='workshop-floor'),tier=geometry.ladders.find(l=>l.id==='workshop-tier'),vent=geometry.vents.find(v=>v.id==='workshop-vent');
  try{
    walk(subject,floor.x-22);hold(subject,'KeyW',1.2);landing(hub,low.y);
    walk(subject,tier.x-22);hold(subject,'KeyW',1.2);landing(hub,high.y);
    // Standing bodies stop at the solid hatch edge. Its real C approach is
    // reachable; this route does not claim to enter the separate duct level.
    walk(subject,vent.x-hub.player.w-2);landing(hub,high.y);assert.equal(hub.nearbyCrawlVentV138()?.id,vent.id);
    walk(subject,tier.x-22);hold(subject,'KeyS',1.2);landing(hub,low.y);
    walk(subject,floor.x-22);hold(subject,'KeyS',1.2);landing(hub,624);
    walk(subject,workshop.xStart+360-22);landing(hub,624);assert.equal(hub.nearestParentAnnexDoorV71()?.annexId,'durandal');
    const origin={x:hub.player.x,y:hub.player.y},pair=hub.hubDoorPairV142(HUB_ANNEX_BY_ID_V137.durandal);
    const sourceOffset=origin.x+hub.player.w/2-(pair.parent.opening.x+pair.parent.opening.w/2);
    subject.key('keydown','KeyE');subject.key('keyup','KeyE');advance(hub,1.2);assert.equal(hub.currentAnnexV71()?.id,'durandal');landing(hub,624);
    const arrived=hub.player.x+hub.player.w/2-(pair.local.opening.x+pair.local.opening.w/2);
    near(arrived,sourceOffset);
    subject.key('keydown','KeyE');subject.key('keyup','KeyE');advance(hub,1.2);assert.equal(hub.currentAnnexV71(),null);landing(hub,624);
    near(hub.player.x,origin.x);near(hub.player.y,origin.y);assert.deepEqual(subject.save.galaxy.resources,resources);assert.equal(hub.player.health,100);
  }finally{hub.stop();}
});

// Run the actual Python walker against production Hub physics. The host owns
// a declared RAF schedule and input transport delay; no player field, collision
// method or integration step is replaced after the declared Save fixture starts.
async function nativeWalkQaDriverV182(root) {
  const assert = (await import('node:assert/strict')).default;
  const { HubGame } = await import(new URL('src/hub-opening-v88.js', root));
  const { createDefaultSave } = await import(new URL('src/save.js', root));
  const { hostV136 } = await import(new URL('scripts/forge-native-host-v136.mjs', root));
  const { createInterface } = await import('node:readline');
  const options = JSON.parse(process.argv[2]), host = hostV136();
  document.createElement = () => ({ ...host.canvas, style: {}, getContext: () => host.canvas.getContext('2d') });
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  Object.assign(save.hub, { deck: options.deck, roomId: options.roomId,
    positionX: options.x, positionY: options.standingY - 92 });
  const hub = new HubGame(host.canvas, { onAction() {}, onPersist() {}, onStatus() {} });
  hub.start(save.hub, { routineContextV62: { clock: save.clock, save }, onboardingV84: save.onboardingV84 });
  globalThis.__ATF_HUB__ = hub; globalThis.__ATF_V51__ = { saveSystem: { data: save } };
  host.canvas.focus(); hub.update(1 / 60);
  assert.equal(hub.player.x, options.x); assert.equal(hub.player.y + hub.player.h, options.standingY);
  const baseline = { resources: structuredClone(save.galaxy.resources), clock: structuredClone(save.clock) };
  const frameMs = options.frameMs || 1000 / 60, pulses = [], settledPositions = [];
  let elapsed = 0, nextFrame = options.phaseMs, frames = 0, maxSpeed = 0;
  const advanceWall = ms => {
    const end = elapsed + ms;
    while (nextFrame <= end + 1e-9) {
      const before = hub.player.x, moving = hub.player.vx !== 0;
      hub.update(Math.min(.034, frameMs / 1000)); frames++;
      assert.ok(Math.abs(hub.player.x - before) <= 270 * frameMs / 1000 + 1e-6);
      assert.equal(hub.player.w, 44); assert.equal(hub.player.h, 92); assert.equal(hub.player.health, 100);
      maxSpeed = Math.max(maxSpeed, Math.abs(hub.player.vx));
      if (moving && hub.player.vx === 0 && !hub.keys.has('KeyA') && !hub.keys.has('KeyD'))
        settledPositions.push({ x: hub.player.x, time: nextFrame });
      nextFrame += frameMs;
    }
    elapsed = end;
  };
  const until = (predicate, timeout) => {
    const deadline = elapsed + timeout;
    while (!predicate()) {
      if (elapsed >= deadline - 1e-9) throw Error('Native wait timed out');
      advanceWall(Math.min(Math.max(.01, nextFrame - elapsed), deadline - elapsed));
    }
  };
  const key = (type, code) => {
    assert.ok(['KeyA', 'KeyD'].includes(code), 'Only the real A/D controls may drive this fixture');
    advanceWall(options.keyLatencyMs || 0);
    host.events.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code, repeat: false }));
  };
  const snapshot = () => ({ elapsed, frames, maxSpeed, pulses, settledPositions,
    heldKeys: [...hub.keys], player: structuredClone(hub.player), baseline,
    resources: structuredClone(save.galaxy.resources), clock: structuredClone(save.clock) });
  console.log(JSON.stringify(snapshot()));
  for await (const line of createInterface({ input: process.stdin })) {
    const request = JSON.parse(line); let error = null, value = null;
    try {
      if (request.type === 'focus') host.canvas.focus();
      else if (request.type === 'key') {
        const start = { x: hub.player.x, frames, elapsed };
        key(request.down ? 'keydown' : 'keyup', request.key);
        if (request.press) {
          advanceWall(request.ms || 0); key('keyup', request.key);
          pulses.push({ key: request.key, requestedMs: request.ms, start,
            end: { x: hub.player.x, frames, elapsed } });
        }
      } else if (request.type === 'predicate') {
        const predicate = Function('return (' + request.expression + ')')();
        until(() => predicate(request.arg), request.timeout);
      } else if (request.type === 'evaluate') {
        value = await Function('return (' + request.expression + ')')()(request.arg);
      } else if (request.type === 'stop') break;
    } catch (failure) { error = failure.message; }
    console.log(JSON.stringify({ ...snapshot(), value: value ?? null, error }));
  }
}

function runNativeWalkQaV182(cases) {
  const directory = mkdtempSync(join(tmpdir(), 'door-bay-native-walk-'));
  const root = new URL('../', import.meta.url).href, driver = join(directory, 'driver.mjs');
  const input = join(directory, 'input.json'), output = join(directory, 'output.json');
  const qa = process.env.ATF_QA_DOOR_SOURCE || fileURLToPath(new URL('qa-hub-door-bays-v182.py', import.meta.url));
  writeFileSync(driver, `(${nativeWalkQaDriverV182.toString()})(${JSON.stringify(root)});\n`);
  writeFileSync(input, JSON.stringify({ driver, qa, cases, node: process.execPath, output }));
  const python = String.raw`import ast, json, math, subprocess, sys
from pathlib import Path
from types import SimpleNamespace
spec = json.loads(Path(sys.argv[1]).read_text())
tree = ast.parse(Path(spec['qa']).read_text())
functions = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in ['walk_to', 'settle', 'observe', 'supported']]
observe = next(n for n in tree.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'OBSERVE' for t in n.targets))
module = ast.fix_missing_locations(ast.Module(body=[observe, *functions], type_ignores=[]))
class Page:
    def __init__(self, case):
        self.proc = subprocess.Popen([spec['node'], spec['driver'], json.dumps(case)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        self.keyboard = SimpleNamespace(
            press=lambda key, delay=0: self.call(type='key', key=key, down=True, press=True, ms=delay),
            down=lambda key: self.call(type='key', key=key, down=True),
            up=lambda key: self.call(type='key', key=key, down=False))
    def call(self, **request):
        self.proc.stdin.write(json.dumps(request) + '\n'); self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        if self.state.get('error'): raise AssertionError(self.state['error'])
        return self.state
    def locator(self, selector):
        assert selector == '#hub-canvas'
        return SimpleNamespace(focus=lambda: self.call(type='focus'))
    def evaluate(self, expression, arg=None):
        return self.call(type='evaluate', expression=expression, arg=arg)['value']
    def wait_for_function(self, expression, arg=None, timeout=30000):
        self.call(type='predicate', expression=expression, arg=arg, timeout=timeout)
    def close(self):
        self.proc.stdin.write('{"type":"stop"}\n'); self.proc.stdin.flush()
        self.proc.stdin.close(); self.proc.wait(timeout=5)
        self.proc.stdout.close(); self.proc.stderr.close()
results = []
for case in spec['cases']:
    page = Page(case)
    report = {'nativeMoves': [], 'checks': []}
    def check(label, condition):
        assert condition, label
        report['checks'].append(label)
    namespace = {'math': math, 'report': report, 'check': check}
    exec(compile(module, '<actual-native-door-bay-walker>', 'exec'), namespace)
    error = None
    try: namespace['walk_to'](page, case['target'], case['id'], case['roomId'], case['standingY'], case.get('tolerance', 3))
    except AssertionError as failure: error = str(failure)
    results.append({'case': case, **page.state, 'error': error, 'qaReport': report})
    page.close()
Path(spec['output']).write_text(json.dumps(results))
`;
  try {
    execFileSync('python3', ['-c', python, input], { stdio: 'inherit', timeout: 60000 });
    const results = JSON.parse(readFileSync(output, 'utf8'));
    if (process.env.ATF_QA_DOOR_EVIDENCE) writeFileSync(process.env.ATF_QA_DOOR_EVIDENCE, JSON.stringify(results, null, 2) + '\n');
    return results;
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('V182 actual QA walker converges on floor and upper platform in both directions across RAF phases', () => {
  const cases = [
    { id: 'workshop-upper-east', roomId: 'workshop', deck: 2, x: 3283.771920433868, target: 3290, standingY: 376 },
    { id: 'workshop-upper-west', roomId: 'workshop', deck: 2, x: 3296.228079566132, target: 3290, standingY: 376 },
    { id: 'medical-floor-east', roomId: 'medical', deck: 1, x: 3013.0951604272054, target: 3018, standingY: 624 },
    { id: 'medical-floor-west', roomId: 'medical', deck: 1, x: 3022.9048395727946, target: 3018, standingY: 624 }
  ].flatMap(config => [8, 15].flatMap(keyLatencyMs => [1, 8, 15].map(phaseMs => ({
    ...config, phaseMs, keyLatencyMs, tolerance: phaseMs === 1 ? 2.5 : 3 }))));
  const results = runNativeWalkQaV182(cases);
  for (const result of results) {
    const detail = JSON.stringify({ case: result.case, error: result.error, finalX: result.player.x,
      pulses: result.pulses, settledPositions: result.settledPositions });
    assert.equal(result.error, null, detail);
    assert.ok(Math.abs(result.player.x - result.case.target) <= result.case.tolerance, detail);
    assert.equal(result.player.y + result.player.h, result.case.standingY);
    assert.equal(result.player.grounded, true); assert.equal(result.player.climbing, false);
    assert.ok(result.pulses.length <= 24); assert.deepEqual(result.heldKeys, []);
    assert.ok(result.maxSpeed > 0 && result.maxSpeed <= 270);
    assert.deepEqual(result.resources, result.baseline.resources); assert.deepEqual(result.clock, result.baseline.clock);
    assert.equal(result.qaReport.checks.length, 2);
  }
});
