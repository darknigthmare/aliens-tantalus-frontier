import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { SHIP_ANIMAL_DEFINITIONS_V87 as DEFINITIONS, SHIP_ANIMAL_OFFERS_V87 as OFFERS } from '../src/ship-animal-state-v87.js';
import { SHIP_ANIMAL_HABITATS_V87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_MEETINGS_V87 } from '../src/ship-port-room-v87.js';
import { SHIP_ANIMAL_ATLASES_V87 } from '../src/ship-animal-art-v87.js';
import { SHIP_ANIMAL_TERRARIUM_ASSET_V87, SHIP_ANIMAL_TERRARIUM_CROPS_V87 } from '../src/ship-animal-terrarium-art-v87.js';
import { SHIP_CARRIER_PRESENTATION_V87 } from '../src/ship-carrier-presentation-v87.js';
import { SHIP_MICA_TERRARIUM_GRAPH_V87 as GRAPH, isMicaTerrariumPointV87, sampleMicaTerrariumRouteV87 } from '../src/ship-animal-terrarium-navigation-v87.js';
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const animalId = 'animal-mica', definition = DEFINITIONS[animalId], offer = OFFERS['offer-animal-mica'];
const habitat = SHIP_ANIMAL_HABITATS_V87.find(h => h.id === definition?.defaultHabitatId);
const meeting = SHIP_PORT_MEETINGS_V87.find(m => m.animalId === animalId), atlas = SHIP_ANIMAL_ATLASES_V87[animalId];
assert.ok(definition && offer && habitat && meeting && atlas, 'Mica must be fully integrated, never a fallback companion');
assert.equal(offer.vendorId, 'station-shop'); assert.equal(offer.costCredits, 180); assert.equal(meeting.x, 810);
assert.equal(habitat.navigationDomain, 'terrarium-volume'); assert.equal(habitat.capacity, 1);
assert.equal(habitat.location.y, 612); assert.equal(habitat.receivingPoint.y, 624);
assert.ok(atlas.clips.climbUp?.frames.length && atlas.clips.climbDown?.frames.length, 'Dedicated up/down climbing clips');
assert.equal(atlas.frames.length, 48, 'Use approved 48-pose Mica, not an earlier candidate');
const subject = { id: animalId, name: definition.name, offerId: offer.id, price: offer.costCredits,
  meetingX: meeting.x, receivingX: habitat.receivingPoint.x, habitatId: habitat.id, atlas: atlas.path };
const animalExpression = '__ATF_V51__.saveSystem.data.shipAnimalsV1.animals["animal-mica"]';
const output = resolve(process.env.QA_OUTPUT || 'I:/CodexQA/AliensTantalus/v87-mica-20260920/e2e', process.env.QA_RUN || 'run-01');
await mkdir(output, { recursive: true });
const cdpPort = Number(process.env.QA_CDP_PORT || 9237);
const info = await fetch('http://127.0.0.1:' + cdpPort + '/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context, targetId; const pending = new Map(), errors = [], pressed = new Set();
socket.addEventListener('message', event => {
  const msg = JSON.parse(event.data), job = pending.get(msg.id);
  if (job) { pending.delete(msg.id); clearTimeout(job.timer); msg.error ? job.reject(Error(msg.error.message)) : job.resolve(msg.result); }
  if (msg.sessionId !== session) return;
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
  if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) errors.push(msg.params.response.status + ' ' + msg.params.response.url);
});
function cdp(method, params = {}, browser = false) { return new Promise((resolve, reject) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 30000);
  pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; }
const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(expression, label, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const result = await read(expression); if (result) return result; await wait(90); }
  throw Error('Timeout ' + label);
}
async function key(code, down) {
  const special = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], ShiftLeft: ['Shift', 16] };
  const [value, virtual] = special[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)];
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: value, code, windowsVirtualKeyCode: virtual });
  down ? pressed.add(code) : pressed.delete(code);
}
async function press(code) { await key(code, true); await wait(65); await key(code, false); await wait(120); }
async function click(selector) {
  let box;
  for (let attempt = 0; attempt < 5; attempt++) {
    box = await read(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled)return null;const r=el.getBoundingClientRect(),d=el.closest('dialog')?.getBoundingClientRect();return r.width&&r.height?{x:r.x+r.width/2,y:r.y+r.height/2,top:d?.top||0,bottom:Math.min(innerHeight,d?.bottom||innerHeight)}:null})()`);
    assert.ok(box, 'Visible enabled control ' + selector);
    if (box.y > box.top + 12 && box.y < box.bottom - 12) break;
    await cdp('Input.dispatchMouseEvent', { type: 'mouseWheel', x: box.x, y: Math.max(box.top + 30, box.bottom - 50), deltaX: 0, deltaY: box.y >= box.bottom - 12 ? 380 : -380 });
    await wait(180);
  }
  assert.ok(box, 'Visible enabled control ' + selector);
  assert.ok(box.y > box.top && box.y < box.bottom, 'Control remains clipped ' + selector);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await wait(140);
}

const report = { ok: false, base, subject, browser: info.Browser,
  scope: 'One initial fixture: completed onboarding, empty animal registry, no fitted habitats, player at crew-quarters x682. Thereafter real mouse/keyboard and normal RAF only: installation, docking, purchase, carry, lifts, arrival, observation and reload. Read-only canvas/state/pixel instrumentation; no position or clock assignment after fixture and no asset readiness override.',
  checks: {}, path: [], screenshots: [], routineSamples: [], renderSegments: [], errors };
function brief(data) {
  const result = structuredClone(data);
  if (result?.animal?.deliveryV87?.waypoints) {
    result.animal.deliveryV87.waypointCount = result.animal.deliveryV87.waypoints.length;
    delete result.animal.deliveryV87.waypoints;
  }
  return result;
}
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ stage: name, data: brief(data) })); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg'); }
const poseExpression = `(()=>{const h=__ATF_HUB__,s=__ATF_V51__.saveSystem.data,a=s.shipAnimalsV1?.animals?.['animal-mica'];return {x:h.player.x+h.player.w/2,feet:h.player.y+h.player.h,vx:h.player.vx,vy:h.player.vy,grounded:h.player.grounded,climbing:h.player.climbing,deck:h.state.deck,room:h.currentAnnexV71()?.id||h.currentRoom().id,health:h.player.health,running:h.running,transition:h.annexTransitionV71,prompt:h.statusPrompt(),animal:a?structuredClone(a):null,simulationTime:s.shipAnimalsV1.lastSimulationTime,toast:document.querySelector('#toast-region')?.innerText,hidden:document.hidden}})()`;

async function snapshot() { return read(poseExpression); }
async function walk(target, label = 'walk', { jump = false } = {}) {
  const start = await snapshot(), direction = start.x < target ? 1 : -1, code = direction > 0 ? 'KeyD' : 'KeyA';
  let lastX = start.x, lastProgress = Date.now(), jumps = 0, reached = false;
  await key(code, true);
  if (jump) { await press('Space'); jumps++; }
  try {
    const deadline = Date.now() + 28000;
    while (Date.now() < deadline) {
      await wait(90); const state = await snapshot();
      assert.equal(state.health, 100, 'Unexpected damage during ' + label);
      if (Math.abs(state.x - lastX) > 3) { lastX = state.x; lastProgress = Date.now(); }
      if (direction > 0 ? state.x >= target : state.x <= target) { reached = true; break; }
      if (!state.running) throw Error('Runtime stopped during ' + label + ': ' + JSON.stringify(brief(state)));
      if (Date.now() - lastProgress > 750 && state.grounded && jumps < 4) {
        report.path.push({ label, recovery: 'real-space-jump', state }); await press('Space'); jumps++; lastProgress = Date.now();
      } else if (Date.now() - lastProgress > 2700) throw Error('Physical blockage ' + label + ': ' + JSON.stringify(brief(state)));
      if (Date.now() + 100 >= deadline) throw Error('Walk timeout ' + label + ': ' + JSON.stringify(brief(state)));
    }
    assert.ok(reached, 'Physical walk did not reach ' + label);
  } finally { await key(code, false); await wait(220); }
  const end = await snapshot(); report.path.push({ label, start, end, jumps }); return end;
}

async function climb(code, expression, label) {
  await key(code, true);
  try { await until(expression, label, 9000); } finally { await key(code, false); }
}

const ledger = () => read('(()=>{const s=__ATF_V51__.saveSystem.data;return {credits:s.galaxy.resources.credits,state:structuredClone(s.shipAnimalsV1)}})()');
function assertOwnership(data) {
  assert.equal(data.credits, 3200 - subject.price); assert.deepEqual(Object.keys(data.state.animals), [animalId]);
  assert.equal(Object.keys(data.state.receipts).length, 1); assert.equal(Object.keys(data.state.reservations).length, 1);
  const receipt = Object.values(data.state.receipts)[0];
  assert.equal(receipt.animalId, animalId); assert.equal(receipt.offerId, offer.id); assert.equal(receipt.costCredits, 180); assert.equal(receipt.habitatId, habitat.id);
  const animal = data.state.animals[animalId];
  assert.equal(animal.id, animalId); assert.equal(animal.name, definition.name); assert.equal(animal.familyId, 'gecko');
  assert.equal(animal.visualId, 'original-mica'); assert.equal(animal.habitatId, habitat.id); assert.equal(animal.bondedGroupId, undefined);
  assert.deepEqual(animal.preferences, definition.preferences);
  for (const entry of Object.values(OFFERS)) assert.equal(data.state.stock[entry.id].status, entry.id === offer.id ? 'sold' : 'available');
}
function assertSupported(state) {
  const animal = state.animal, location = animal.location;
  assert.equal(location.kind, 'resident'); assert.equal(animal.habitatId, habitat.id);
  assert.ok(isMicaTerrariumPointV87(location), 'Actual gecko stays on authored supports inside its terrarium');
  assert.equal(state.health, 100); assert.notEqual(animal.activity, 'pet');
  const route = animal.routineV87?.route;
  if (route) {
    const sample = sampleMicaTerrariumRouteV87(route); assert.ok(sample, 'Saved climbing route remains valid');
    assert.ok(Math.abs(sample.location.x - location.x) < 1e-6 && Math.abs(sample.location.y - location.y) < 1e-6);
    return sample.clipId;
  }
  return animal.routineV87?.phase || 'idle';
}
async function installRenderObserver() {
  const instrument = function(atlas, graph, terrariumAsset, terrainCrops, carrierLayout) {
    const hub = __ATF_HUB__, original = hub.drawCompanionsV87, originalCarried = hub.drawCarriedCompanionV87;
    const metrics = globalThis.__QA_MICA_DRAW_V87__ = { frames: 0, maxBodiesPerFrame: 0, surroundedFrames: 0,
      clipFrames: {}, sourceRects: {}, pixelEvidence: {}, terrainRoles: {}, terrainRects: {}, violations: [],
      carrierFrames: 0, carrierMovingFrames: 0, carrierLeft: 0, carrierRight: 0, maxCarriersPerFrame: 0, carrierError: 0 };
    hub.drawCarriedCompanionV87 = function(ctx) {
      const draw = ctx.drawImage, draws = [];
      ctx.drawImage = function(...args) {
        const path = String(args[0]?.currentSrc || args[0]?.src || '').split(/[?#]/)[0];
        if (args.length === 9 && path.endsWith(terrariumAsset) && terrainCrops.carrier.every((n, i) => n === args[i + 1])) draws.push(args.slice(5));
        return draw.apply(this, args);
      };
      try { originalCarried.call(this, ctx); } finally { ctx.drawImage = draw; }
      metrics.maxCarriersPerFrame = Math.max(metrics.maxCarriersPerFrame, draws.length);
      for (const [x, y, width, height] of draws) {
        const p = this.player; metrics.carrierFrames++; metrics[p.facing < 0 ? 'carrierLeft' : 'carrierRight']++;
        if (Math.abs(p.vx) > 10) metrics.carrierMovingFrames++;
        metrics.carrierError = Math.max(metrics.carrierError, Math.abs(x + width / 2 - (p.x + p.w / 2) - p.facing * carrierLayout.sideOffset),
          Math.abs(y + height - (p.y + p.h) + carrierLayout.lift), Math.abs(width - carrierLayout.width));
      }
    };
    const pixels = (image, rect) => {
      const key = rect.join(':'); if (metrics.pixelEvidence[key]) return metrics.pixelEvidence[key];
      // Diagnostic readback only: no exported/edited image, no runtime texture replacement.
      const canvas = document.createElement('canvas'); canvas.width = rect[2]; canvas.height = rect[3];
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, ...rect, 0, 0, rect[2], rect[3]);
      const bytes = ctx.getImageData(0, 0, rect[2], rect[3]).data;
      let opaque = 0, transparent = 0, minX = rect[2], maxX = -1, minY = rect[3], maxY = -1;
      for (let y = 0; y < rect[3]; y++) for (let x = 0; x < rect[2]; x++) {
        const alpha = bytes[(y * rect[2] + x) * 4 + 3];
        if (alpha > 16) { opaque++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
        else transparent++;
      }
      return metrics.pixelEvidence[key] = { opaque, transparent, minX, maxX, minY, maxY };
    };
    hub.drawCompanionsV87 = function(ctx) {
      if (this.currentAnnexV71()?.id !== 'animal-care') return original.call(this, ctx);
      const draw = ctx.drawImage, baseInverse = ctx.getTransform().inverse(), order = [];
      ctx.drawImage = function(...args) {
        const path = String(args[0]?.currentSrc || args[0]?.src || '').split(/[?#]/)[0];
        if (args.length === 9 && path.endsWith(terrariumAsset)) {
          order.push('terrarium'); const rect = args.slice(1, 5), key = path + ':' + rect.join(':');
          metrics.terrainRects[key] = (metrics.terrainRects[key] || 0) + 1;
          for (const [role, crop] of Object.entries(terrainCrops)) {
            if (Array.isArray(crop) && rect[0] >= crop[0] && rect[1] >= crop[1]
              && rect[0] + rect[2] <= crop[0] + crop[2] && rect[1] + rect[3] <= crop[1] + crop[3])
              metrics.terrainRoles[role] = (metrics.terrainRoles[role] || 0) + 1;
          }
        }
        if (args.length === 9 && path.endsWith(atlas.path)) {
          order.push('mica'); metrics.frames++;
          const rect = args.slice(1, 5), index = atlas.frames.findIndex(f => [f.x, f.y, f.w, f.h].every((v, i) => v === rect[i]));
          metrics.sourceRects[rect.join(':')] = (metrics.sourceRects[rect.join(':')] || 0) + 1;
          for (const [clip, value] of Object.entries(atlas.clips)) if (value.frames.includes(index)) metrics.clipFrames[clip] = (metrics.clipFrames[clip] || 0) + 1;
          const evidence = pixels(args[0], rect), transform = baseInverse.multiply(ctx.getTransform());
          const [dx, dy, dw, dh] = args.slice(5);
          const points = [[evidence.minX, evidence.minY], [evidence.maxX + 1, evidence.minY],
            [evidence.minX, evidence.maxY + 1], [evidence.maxX + 1, evidence.maxY + 1]]
            .map(([x, y]) => transform.transformPoint({ x: dx + dw * x / rect[2], y: dy + dh * y / rect[3] }));
          const bounds = { left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)),
            top: Math.min(...points.map(p => p.y)), bottom: Math.max(...points.map(p => p.y)) };
          if (index < 0 || !evidence.opaque || bounds.left < graph.bounds.x - .01 || bounds.right > graph.bounds.x + graph.bounds.w + .01
            || bounds.top < graph.bounds.y - .01 || bounds.bottom > graph.bounds.y + graph.bounds.h + 1)
            if (metrics.violations.length < 10) metrics.violations.push({ index, rect, bounds, evidence });
        }
        return draw.apply(this, args);
      };
      try { original.call(this, ctx); } finally { ctx.drawImage = draw; }
      const bodies = order.filter(x => x === 'mica').length; metrics.maxBodiesPerFrame = Math.max(metrics.maxBodiesPerFrame, bodies);
      const i = order.indexOf('mica');
      if (i > 0 && order.slice(0, i).includes('terrarium') && order.slice(i + 1).includes('terrarium')) metrics.surroundedFrames++;
    };
    return true;
  };
  await read('(' + instrument.toString() + ')(' + [atlas, GRAPH, SHIP_ANIMAL_TERRARIUM_ASSET_V87, SHIP_ANIMAL_TERRARIUM_CROPS_V87, SHIP_CARRIER_PRESENTATION_V87].map(JSON.stringify).join(',') + ')');
}
async function collectRendering() {
  const segment = await read('structuredClone(globalThis.__QA_MICA_DRAW_V87__)');
  if (segment) report.renderSegments.push(segment); return segment;
}
async function reloadWhileClimbing() {
  await capture('13-mid-climb-before-reload');
  // Visible exit persists and stops RAF. Never call pause/save/position setters in QA.
  await click('#exit-hub'); await until('!__ATF_HUB__.running', 'user-paused at command view');
  const before = await ledger(), held = before.state.animals[animalId];
  assert.equal(sampleMicaTerrariumRouteV87(held.routineV87.route)?.clipId, 'climbUp', 'Pause occurs on the inclined support');
  await collectRendering(); milestone('midClimbDurable', { animal: held, simulationTime: before.state.lastSimulationTime });
  const origin = await read('performance.timeOrigin'); await cdp('Page.reload', { ignoreCache: true });
  await until('performance.timeOrigin!==' + origin + '&&globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'mid-climb reload boot');
  const atTitle = await ledger(); assertOwnership(atTitle);
  assert.deepEqual(atTitle.state.animals[animalId], held, 'Reload preserves exact position, route, identity and clock');
  assert.equal(atTitle.state.lastSimulationTime, before.state.lastSimulationTime, 'No offline catch-up at title');
  assert.deepEqual(atTitle.state.receipts, before.state.receipts); assert.deepEqual(atTitle.state.reservations, before.state.reservations);
  await installRenderObserver(); await click('#title-start'); await click('#title-continue');
  if (!await read('__ATF_HUB__.running')) await click('.nav-button[data-view="hub"]');
  await until('__ATF_HUB__.running&&__ATF_HUB__.currentAnnexV71()?.id==="animal-care"', 'resume care annex');
  const after = await snapshot(); assertSupported(after); assert.equal(after.animal.deliveryV87.phase, 'delivered');
  assert.ok(after.animal.location.x >= held.location.x && after.animal.location.y <= held.location.y, 'Resume forward, not at home or human receiving floor');
  assert.ok(after.simulationTime - before.state.lastSimulationTime < 1.2, 'Only active RAF advances after re-entry');
  milestone('midClimbReload', after); await capture('14-mid-climb-restored');
}
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  ({ targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true));
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=mica-v87' }); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'boot');
  milestone('boot', await read('({title:document.title,text:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})'));
  assert.ok(report.checks.boot.text > 100 && !report.checks.boot.overlay); await capture('00-title');
  milestone('fixture', await read("(()=>{const s=__ATF_V51__.saveSystem;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');s.commit({onboardingV84:null,needsPlayerCreationV84:false,scene:'hub',hub:{...s.data.hub,deck:1,roomId:'crew-quarters',positionX:682,facing:1}});__ATF_V51__.showView('hub');__ATF_HUB__.canvas.focus();return {owned:Object.keys(s.data.shipAnimalsV1.animals).length,credits:s.data.galaxy.resources.credits,habitats:structuredClone(s.data.shipAnimalsV1.habitats),phase:s.data.shipPortV1.phase};})()"));
  assert.equal(report.checks.fixture.owned, 0); assert.equal(report.checks.fixture.credits, 3200);
  assert.ok(Object.values(report.checks.fixture.habitats || {}).every(h => !h.installed));
  assert.equal(report.checks.fixture.phase, 'undocked');
  await wait(450); await press('KeyE');
  await until('__ATF_HUB__.currentAnnexV71()?.id==="animal-care"&&!__ATF_HUB__.annexTransitionV71', 'enter care to prepare one real terrarium');
  await until('[...__ATF_HUB__.getAnnexAssetGroupV71("animal-care").values()].every(i=>i.complete&&i.naturalWidth>0)', 'care art');
  await walk(subject.receivingX, 'walk to empty terrarium');
  milestone('beforeInstallation', await snapshot()); await capture('01-empty-terrarium');
  assert.match(report.checks.beforeInstallation.prompt, /INSTALLER/);
  await press('KeyE');
  await until('__ATF_V51__.saveSystem.data.shipAnimalsV1.habitats[' + JSON.stringify(habitat.id) + ']?.installed===true', 'physical terrarium installation');
  const fitted = await ledger(); assert.equal(fitted.credits, 3200); assert.deepEqual(fitted.state.animals, {});
  assert.deepEqual(Object.keys(fitted.state.habitats).filter(id => fitted.state.habitats[id].installed), [habitat.id]);
  milestone('installed', { habitatId: habitat.id, places: habitat.capacity, pose: await snapshot(), credits: fitted.credits });
  await capture('02-fitted-terrarium');
  // Leave through the authored door, then take the real median lift downward.
  await walk(160, 'return to care exit'); await press('KeyE');
  await until('!__ATF_HUB__.isAnnexActiveV71()&&!__ATF_HUB__.annexTransitionV71', 'return to quarters');
  await walk(2372, 'walk from quarters to median lift');
  await until('__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing', 'grounded at habitat lift');
  await press('KeyS'); await until('__ATF_HUB__.state.deck===2', 'lift down to industrial'); await wait(300);
  await press('KeyS'); await until('__ATF_HUB__.state.deck===3', 'lift down to engineering'); await wait(300);
  milestone('outboundEngineeringLift', await snapshot());
  // Reverse of the established safe cargo route; never cross the live arc below.
  const egress = await read('__ATF_HUB__.v51Ladders.find(ladder=>ladder.id==="reactor-service-egress")');
  assert.ok(egress && egress.top === 492 && egress.bottom === 624, 'Use the authored reactor egress');
  // Its right approach is before the reactor console. A ladder clamps feet to
  // top + 10 while attached, so climbing must not wait for an impossible top.
  await walk(egress.x + 12, 'approach reactor egress ladder from its free right side');
  assert.equal(await read('__ATF_HUB__.nearestTraversalLadder()?.id'), egress.id);
  milestone('outboundReactorEgress', { ladder: egress, pose: await snapshot() });
  await climb('KeyW', '__ATF_HUB__.player.climbing&&__ATF_HUB__.player.y+__ATF_HUB__.player.h<=' + (egress.top + 12), 'climb onto reactor service deck');
  await walk(2160, 'jump west from egress ladder', { jump: true });
  await walk(1822, 'approach reactor upper tier ladder');
  await climb('KeyW', '__ATF_HUB__.player.climbing&&__ATF_HUB__.player.y+__ATF_HUB__.player.h<=384', 'climb reactor upper tier');
  await walk(1720, 'jump west onto reactor high balcony', { jump: true });
  await key('KeyC', true);
  try { await walk(1380, 'return through reactor conduit'); } finally { await key('KeyC', false); }
  await walk(1180, 'step onto hangar maintenance gantry', { jump: true });
  await walk(184, 'approach hangar observation ladder from above');
  await climb('KeyS', '__ATF_HUB__.player.climbing&&__ATF_HUB__.player.y+__ATF_HUB__.player.h>=623', 'descend to safe west hangar');
  await walk(50, 'jump west toward docking terminal', { jump: true });
  await until('__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing', 'grounded by docking terminal');
  milestone('terminalApproach', await snapshot()); await press('KeyE');
  await until('document.querySelector("dialog.ship-port-v87")?.open', 'physical docking terminal');
  await capture('03-terminal'); await click('[data-port-action="dock"]');
  await until('__ATF_V51__.saveSystem.data.shipPortV1.phase==="approach"&&!document.querySelector("dialog.ship-port-v87").open', 'dock begins and releases controls');
  await until('__ATF_V51__.saveSystem.data.shipPortV1.phase==="docked"', 'active local docking complete', 25000);
  milestone('docked', await snapshot()); await capture('04-docked');
  await walk(108, 'approach real gangway'); await press('KeyE');
  await until('__ATF_HUB__.currentAnnexV71()?.id==="frontier-civil-counter"&&!__ATF_HUB__.annexTransitionV71', 'enter civil counter');
  await until('[...__ATF_HUB__.getAnnexAssetGroupV71("frontier-civil-counter").values()].every(i=>i.complete&&i.naturalWidth>0)', 'all eight animal atlases and habitat art');
  milestone('portArt', await read('Object.fromEntries([...__ATF_HUB__.getAnnexAssetGroupV71("frontier-civil-counter")].map(([k,v])=>[k,{path:v.currentSrc||v.src,width:v.naturalWidth,height:v.naturalHeight}]))'));
  for (const entry of SHIP_PORT_MEETINGS_V87) assert.ok(report.checks.portArt[entry.imageRole]?.width > 0);
  assert.equal(report.checks.portArt.enclosure.width, 1536);

  assert.equal(report.checks.portArt[meeting.imageRole]?.width, atlas.width);
  assert.ok(report.checks.portArt[meeting.imageRole].path.split(/[?#]/)[0].endsWith(atlas.path), 'Correct Mica identity atlas');
  const terrariumImage = Object.values(report.checks.portArt).find(i => i.path.split(/[?#]/)[0].endsWith(SHIP_ANIMAL_TERRARIUM_ASSET_V87));
  assert.ok(terrariumImage && terrariumImage.width === 1536 && terrariumImage.height === 1024, 'Correct terrarium bitmap has completed loading');
  await walk(subject.meetingX, 'meet Mica'); await press('KeyE');
  await until('document.querySelector("dialog.ship-port-v87")?.open', 'Mica dossier');
  milestone('meetingDossier', await read('({tabs:[...document.querySelectorAll("dialog.ship-port-v87 [role=tab]")].filter(e=>!e.hidden).map(e=>({id:e.dataset.animalId,selected:e.getAttribute("aria-selected")})),disabled:document.querySelector("[data-port-action=buy]").disabled,owned:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals)})'));
  assert.deepEqual(report.checks.meetingDossier.tabs.map(t => t.id), Object.values(OFFERS).filter(o => o.vendorId === 'station-shop').map(o => o.animalId));
  assert.deepEqual(report.checks.meetingDossier.tabs.filter(t => t.selected === 'true').map(t => t.id), [animalId]);
  assert.equal(report.checks.meetingDossier.disabled, true); assert.deepEqual(report.checks.meetingDossier.owned, []);
  await click('[data-port-action="examine"]');
  const dossier = await read('({text:document.querySelector("dialog.ship-port-v87").innerText,disabled:document.querySelector("[data-port-action=buy]").disabled})');
  assert.ok(dossier.text.includes(definition.appearance) && dossier.text.includes(definition.biography)); assert.match(dossier.text, /180 CR/); assert.equal(dossier.disabled, false);
  milestone('examined', dossier); await capture('05-mica-dossier'); await click('[data-port-action="buy"]');
  await until(animalExpression + '?.deliveryV87?.phase==="awaiting-pickup"', 'Mica acquisition committed');
  const purchased = await ledger(); assertOwnership(purchased); milestone('purchase', purchased); await capture('06-awaiting-crate');
  await press('KeyE'); await until(animalExpression + '.deliveryV87.phase==="carried"', 'physical pickup');
  await installRenderObserver();
  milestone('pickup', await snapshot()); await capture('07-carried');
  await walk(160, 'carry Mica to port exit'); await wait(300); await press('KeyE');
  await until('!__ATF_HUB__.isAnnexActiveV71()&&!__ATF_HUB__.annexTransitionV71', 'return with Mica to hangar');
  await wait(450); milestone('hangarCarry', await snapshot());
  // Real maintenance route: the gantry bypasses the dropship and live arc.
  await walk(184, 'align with hangar observation ladder');
  await key('KeyW', true);
  try { await until('__ATF_HUB__.player.climbing&&__ATF_HUB__.player.y+__ATF_HUB__.player.h<=375', 'climb hangar observation ladder', 7000); }
  finally { await key('KeyW', false); }
  milestone('hangarLadderTop', await snapshot()); await capture('05b-hangar-ladder');
  await walk(300, 'jump off ladder onto maintenance gantry', { jump: true });
  await walk(1380, 'carry above live arc onto reactor balcony');
  milestone('reactorBalcony', await snapshot()); await capture('05c-reactor-balcony');
  await key('KeyC', true);
  try { await walk(1590, 'crouch through reactor conduit'); }
  finally { await key('KeyC', false); }
  await walk(2260, 'carry along reactor service deck to exit ladder');
  await key('KeyS', true);
  try { await until('__ATF_HUB__.player.climbing&&__ATF_HUB__.player.y+__ATF_HUB__.player.h>=623', 'descend reactor service ladder', 7000); }
  finally { await key('KeyS', false); }
  milestone('reactorLadderBottom', await snapshot());
  await walk(2372, 'jump off ladder toward midship lift', { jump: true });
  await until('__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing', 'land before lift transfer');
  milestone('midshipLift', await snapshot());
  await press('KeyW'); await until('__ATF_HUB__.state.deck===2', 'lift to industrial');
  await wait(300); milestone('industrialLift', await snapshot());
  await press('KeyW'); await until('__ATF_HUB__.state.deck===1', 'lift to habitat');
  await wait(300); milestone('habitatLift', await snapshot());
  await walk(704, 'carry from mess through quarters');
  await wait(300); await press('KeyE');
  await until('__ATF_HUB__.currentAnnexV71()?.id==="animal-care"&&!__ATF_HUB__.annexTransitionV71', 'enter care room');



  await walk(subject.receivingX, 'carry to fitted terrarium'); await wait(450); milestone('receivingPoint', await snapshot());
  assert.equal(report.checks.receivingPoint.animal.deliveryV87.checkpoints.length, 4); assert.equal(report.checks.receivingPoint.feet, 624);
  const carrying = await read('structuredClone(__QA_MICA_DRAW_V87__)');
  assert.ok(carrying.carrierFrames > 300 && carrying.carrierMovingFrames > 100 && carrying.carrierLeft > 10 && carrying.carrierRight > 10);
  assert.equal(carrying.maxCarriersPerFrame, 1); assert.ok(carrying.carrierError < 1e-6, 'Dedicated terrarium carrier follows real human feet');
  milestone('carrierProjection', { frames: carrying.carrierFrames, moving: carrying.carrierMovingFrames, error: carrying.carrierError });
  await press('KeyE'); await until(animalExpression + '.location.kind==="intake"', 'intake');
  milestone('intake', await snapshot()); assert.equal(report.checks.intake.animal.location.y, 612); await capture('08-intake');
  const intakeDrawing = await read("(async()=>{const m=await import('/src/ship-animal-delivery-v87.js');return m.sampleShipAnimalDeliveriesV87(__ATF_V51__.saveSystem.data)})()");
  assert.equal(intakeDrawing.length, 1); assert.equal(intakeDrawing[0].y, 624, 'Crate stays on human floor, not gecko support');
  await until(animalExpression + '.location.kind==="acclimating"', 'arrival check'); milestone('acclimating', await snapshot());
  await until(animalExpression + '.location.kind==="resident"', 'resident after active stages');
  milestone('resident', await snapshot()); assertSupported(report.checks.resident);
  assert.equal(report.checks.resident.animal.location.x, habitat.location.x); assert.equal(report.checks.resident.animal.location.y, 612);
  assert.equal(report.checks.resident.animal.deliveryV87.phase, 'delivered'); await capture('09-resident');
  const social = report.checks.resident.animal.needs.social;
  assert.match(report.checks.resident.prompt, /OBSERVER/); await press('KeyE');
  await until('document.querySelector("#toast-region")?.innerText.includes("Mica")', 'physical observation');
  milestone('observation', await snapshot()); assert.equal(report.checks.observation.animal.needs.social, social);
  assert.notEqual(report.checks.observation.animal.activity, 'pet'); await capture('10-observation');
  let up = 0, down = 0, previousClip = null, reloaded = false, done = false;
  const phases = new Set(), deadline = Date.now() + 220000;
  while (Date.now() < deadline) {
    const state = await snapshot(), clip = assertSupported(state); phases.add(clip);
    if (clip !== previousClip) {
      if (clip === 'climbUp') { up++; await capture('11-climb-up-' + up); }
      if (clip === 'climbDown') { down++; await capture('12-climb-down-' + down); }
      milestone('routineEdge' + report.routineSamples.length, { clip, up, down, location: state.animal.location, simulationTime: state.simulationTime });
    }
    previousClip = clip;
    report.routineSamples.push({ time: state.simulationTime, clip, location: state.animal.location,
      route: state.animal.routineV87?.route, phase: state.animal.activity });
    if (!reloaded && clip === 'climbUp' && state.animal.location.y < 606 && state.animal.location.y > 594) {
      await reloadWhileClimbing(); reloaded = true;
    }
    if (up >= 2 && down >= 2 && state.animal.location.y === 612 && clip === 'eat') { done = true; break; }
    await wait(150);
  }
  assert.ok(done && reloaded, 'Two real upward/downward cycles and mid-climb reload must complete');
  for (const clip of ['idle', 'walk', 'eat', 'sleep', 'climbUp', 'climbDown']) assert.ok(phases.has(clip), 'Actual runtime phase ' + clip);
  milestone('twoSupportedCycles', { up, down, samples: report.routineSamples.length, phases: [...phases] }); await collectRendering();
  const graphics = report.renderSegments.reduce((a, s) => {
    a.frames += s.frames; a.surroundedFrames += s.surroundedFrames; a.maxBodiesPerFrame = Math.max(a.maxBodiesPerFrame, s.maxBodiesPerFrame);
    a.violations.push(...s.violations); for (const [k, v] of Object.entries(s.clipFrames)) a.clips[k] = (a.clips[k] || 0) + v;
    for (const [k, v] of Object.entries(s.terrainRoles)) a.supports[k] = (a.supports[k] || 0) + v;
    Object.assign(a.rects, s.sourceRects); Object.assign(a.pixels, s.pixelEvidence); return a;
  }, { frames: 0, surroundedFrames: 0, maxBodiesPerFrame: 0, violations: [], clips: {}, rects: {}, pixels: {}, supports: {} });
  assert.ok(graphics.frames > 100 && graphics.surroundedFrames > 100, 'Real Mica drawn between terrarium panels');
  assert.equal(graphics.maxBodiesPerFrame, 1); assert.deepEqual(graphics.violations, []);
  assert.ok(graphics.clips.climbUp > 15 && graphics.clips.climbDown > 15, 'Dedicated climbing source frames were actually drawn');
  for (const clip of ['climbUp', 'climbDown']) assert.ok(atlas.clips[clip].frames.filter(i => {
    const f = atlas.frames[i]; return graphics.rects[[f.x, f.y, f.w, f.h].join(':')];
  }).length >= 3, 'Several genuine poses of ' + clip + ' were drawn');
  assert.ok(Object.values(graphics.pixels).every(p => p.opaque > 0 && p.transparent > 0), 'Real alpha pixels, no blank/substituted frames');
  assert.ok(graphics.supports.ramp > 20 && graphics.supports.perch > 20, 'The inclined support and elevated perch are actually visible bitmaps');
  milestone('renderedClimbingAndSupports', graphics);
  const final = await ledger(); assertOwnership(final); assert.deepEqual(final.state.receipts, purchased.state.receipts);
  assert.deepEqual(final.state.reservations, purchased.state.reservations); assert.equal(final.state.animals[animalId].needs.social, social);
  milestone('finalOwnership', { credits: final.credits, ids: Object.keys(final.state.animals), receipts: final.state.receipts, reservations: final.state.reservations });
  await capture('15-two-cycles-complete'); assert.deepEqual(errors, []); report.ok = true;

} catch (error) {
  report.failure = error.stack; report.lastState = await snapshot().catch(() => null);
  await capture('failure').catch(() => {}); process.exitCode = 1;
} finally {
  for (const code of [...pressed]) await key(code, false).catch(() => {});
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  for (const p of pending.values()) clearTimeout(p.timer);
  socket.close(); console.log(JSON.stringify({ ok: report.ok, output, checks: Object.keys(report.checks), errors, failure: report.failure, lastState: brief(report.lastState) }, null, 2));
}
