import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { SHIP_ANIMAL_DEFINITIONS_V87, SHIP_ANIMAL_OFFERS_V87, getShipAnimalOfferMembersV87 } from '../src/ship-animal-state-v87.js';
import { SHIP_ANIMAL_HABITATS_V87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_MEETINGS_V87 } from '../src/ship-port-room-v87.js';
import { SHIP_ANIMAL_ROUTINE_BODIES_V87 } from '../src/ship-animal-routines-v87.js';
import { SHIP_ANIMAL_ATLASES_V87 } from '../src/ship-animal-art-v87.js';
import { SHIP_ANIMAL_ENCLOSURE_CROPS_V87 } from '../src/ship-animal-enclosure-art-v87.js';
import { SHIP_BONDED_CARRIER_PRESENTATION_V87 } from '../src/ship-carrier-presentation-v87.js';
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const selectedId = (process.env.QA_ANIMAL || 'noisette').replace(/^(?!animal-)/, 'animal-');
const definition = SHIP_ANIMAL_DEFINITIONS_V87[selectedId];
const offer = Object.values(SHIP_ANIMAL_OFFERS_V87).find(entry => getShipAnimalOfferMembersV87(entry).includes(selectedId));
const ids = getShipAnimalOfferMembersV87(offer);
const meetings = SHIP_PORT_MEETINGS_V87.filter(entry => entry.offerId === offer?.id);
const habitat = SHIP_ANIMAL_HABITATS_V87.find(entry => entry.id === definition?.defaultHabitatId);
assert.ok(definition && offer && ids.length === 2 && meetings.length === 2
  && habitat?.navigationDomain === 'enclosure-volume' && habitat.capacity === 2,
'QA_ANIMAL must name Noisette/Café or Tic/Tac. Singleton regressions remain in browser-ship-port-v87.mjs.');
assert.equal(Object.keys(SHIP_ANIMAL_DEFINITIONS_V87).length, 7, 'This source palette contains exactly seven authored individuals');
const subject = { ids, leaderId: ids[0], names: ids.map(id => SHIP_ANIMAL_DEFINITIONS_V87[id].name),
  meetingX: meetings[0].x, receivingX: habitat.receivingPoint.x, habitatId: habitat.id,
  offerId: offer.id, price: offer.costCredits, vendorId: offer.vendorId };
const animalExpression = '__ATF_V51__.saveSystem.data.shipAnimalsV1.animals[' + JSON.stringify(subject.leaderId) + ']';
const output = resolve(process.env.QA_OUTPUT || 'I:/CodexQA/AliensTantalus/v87-bonded-20260920/e2e', process.env.QA_RUN || 'run-01');
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
const report = { ok: false, base, subject, browser: info.Browser, scope: 'One explicit initial fixture only: completed onboarding, empty registry, no fitted habitats, player in crew quarters at x682. All later installation, docking, trade, pickup, movement, ladders/lifts, reception, observation and reload use actual mouse/keyboard and normal RAF. Read-only canvas instrumentation measures rendering; no actor or animal position assignment after the fixture.', checks: {}, path: [], screenshots: [], errors };
function brief(data) {
  const result = structuredClone(data);
  if (result?.animal?.delivery?.waypoints) result.animal.delivery.waypointCount = result.animal.delivery.waypoints.length;
  if (result?.animal?.delivery) delete result.animal.delivery.waypoints;
  for (const animal of Object.values(result?.animals || {})) if (animal?.delivery?.waypoints) {
    animal.delivery.waypointCount = animal.delivery.waypoints.length; delete animal.delivery.waypoints;
  }
  return result;
}
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ stage: name, data: brief(data) })); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg'); }
const poseExpression = `(()=>{const h=__ATF_HUB__,s=__ATF_V51__.saveSystem.data;return {x:h.player.x+h.player.w/2,y:h.player.y,feet:h.player.y+h.player.h,vx:h.player.vx,vy:h.player.vy,grounded:h.player.grounded,climbing:h.player.climbing,deck:h.state.deck,room:h.currentAnnexV71()?.id||h.currentRoom().id,health:h.player.health,running:h.running,transition:h.annexTransitionV71,prompt:h.statusPrompt(),animals:Object.fromEntries(${JSON.stringify(ids)}.map(id=>{const a=s.shipAnimalsV1?.animals?.[id];return [id,a?{id:a.id,name:a.name,familyId:a.familyId,bondedGroupId:a.bondedGroupId,habitatId:a.habitatId,location:a.location,delivery:a.deliveryV87,activity:a.activity,needs:a.needs,acquisition:a.acquisition}:null]})),toast:document.querySelector('#toast-region')?.innerText,hidden:document.hidden};})()`;

async function snapshot() { return read(poseExpression); }
async function walk(target, label = 'walk', { jump = false } = {}) {
  const start = await snapshot(), direction = start.x < target ? 1 : -1, code = direction > 0 ? 'KeyD' : 'KeyA';
  let lastX = start.x, lastProgress = Date.now(), jumps = 0;
  await key(code, true);
  if (jump) { await press('Space'); jumps++; }
  try {
    const deadline = Date.now() + 28000;
    while (Date.now() < deadline) {
      await wait(90); const state = await snapshot();
      assert.equal(state.health, 100, 'Unexpected damage during ' + label);
      if (Math.abs(state.x - lastX) > 3) { lastX = state.x; lastProgress = Date.now(); }
      if (direction > 0 ? state.x >= target : state.x <= target) break;
      if (!state.running) throw Error('Runtime stopped during ' + label + ': ' + JSON.stringify(brief(state)));
      if (Date.now() - lastProgress > 750 && state.grounded && jumps < 4) {
        report.path.push({ label, recovery: 'real-space-jump', state }); await press('Space'); jumps++; lastProgress = Date.now();
      } else if (Date.now() - lastProgress > 2700) throw Error('Physical blockage ' + label + ': ' + JSON.stringify(brief(state)));
      if (Date.now() + 100 >= deadline) throw Error('Walk timeout ' + label + ': ' + JSON.stringify(brief(state)));
    }
  } finally { await key(code, false); await wait(220); }
  const end = await snapshot(); report.path.push({ label, start, end, jumps }); return end;
}
async function reloadAndContinue(label) {
  const origin = await read('performance.timeOrigin');
  await cdp('Page.reload', { ignoreCache: true });
  await until('performance.timeOrigin!==' + origin + '&&globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', label + ' boot');
  await click('#title-start'); await click('#title-continue');
  await until('__ATF_HUB__.running', label + ' running');
}
async function ledger() {
  return read('(()=>{const s=__ATF_V51__.saveSystem.data;return {credits:s.galaxy.resources.credits,state:structuredClone(s.shipAnimalsV1)}})()');
}
function assertOwnership(data) {
  assert.equal(data.credits, 3200 - subject.price);
  assert.deepEqual(Object.keys(data.state.animals), ids);
  assert.equal(Object.keys(data.state.receipts).length, 1, 'One indivisible contract');
  const receipt = Object.values(data.state.receipts)[0];
  assert.deepEqual(receipt.animalIds, ids); assert.equal(receipt.costCredits, subject.price);
  assert.equal(receipt.habitatId, subject.habitatId);
  assert.equal(Object.keys(data.state.reservations).length, 2, 'Both individual places are reserved');
  for (const id of ids) {
    const animal = data.state.animals[id];
    assert.equal(animal.id, id); assert.equal(animal.name, SHIP_ANIMAL_DEFINITIONS_V87[id].name);
    assert.equal(animal.habitatId, subject.habitatId);
    assert.equal(animal.bondedGroupId, habitat.designatedGroupId);
  }
  assert.equal(data.state.animals[ids[0]].acquisition.transactionId, data.state.animals[ids[1]].acquisition.transactionId);
  for (const entry of Object.values(SHIP_ANIMAL_OFFERS_V87))
    assert.equal(data.state.stock[entry.id].status, entry.id === subject.offerId ? 'sold' : 'available');
}
function assertInside(state, { exactAnchors = false } = {}) {
  const bounds = habitat.enclosureBounds;
  for (const id of ids) {
    const animal = state.animals[id], point = animal.location, body = SHIP_ANIMAL_ROUTINE_BODIES_V87[id];
    assert.equal(point.roomId, 'animal-care'); assert.equal(point.deckId, 'habitat');
    assert.equal(animal.habitatId, habitat.id);
    assert.ok(point.x - body.w / 2 >= bounds.x - 1e-6 && point.x + body.w / 2 <= bounds.x + bounds.w + 1e-6);
    assert.ok(point.y - body.h >= bounds.y - 1e-6 && point.y <= bounds.y + bounds.h + 1e-6);
    if (exactAnchors) {
      assert.equal(point.x, habitat.memberLocations[id].x); assert.equal(point.y, 612);
    }
  }
  const [left, right] = ids;
  assert.ok(state.animals[left].location.x + SHIP_ANIMAL_ROUTINE_BODIES_V87[left].w / 2
    <= state.animals[right].location.x - SHIP_ANIMAL_ROUTINE_BODIES_V87[right].w / 2 + 1e-6, 'Two distinct non-overlapping bodies');
}
async function pairPhase(kind, label) {
  await until(JSON.stringify(ids) + '.every(id=>__ATF_V51__.saveSystem.data.shipAnimalsV1.animals[id]?.location.kind==='
    + JSON.stringify(kind) + ')', label);
}
async function climb(code, expression, label) {
  await key(code, true);
  try { await until(expression, label, 9000); } finally { await key(code, false); }
}
async function installRenderObservers() {
  const paths = Object.fromEntries(ids.map(id => [id, SHIP_ANIMAL_ATLASES_V87[id].path]));
  const crop = SHIP_ANIMAL_ENCLOSURE_CROPS_V87.carrier, layout = SHIP_BONDED_CARRIER_PRESENTATION_V87;
  const instrument = function(paths, crop, layout) {
    const hub = __ATF_HUB__;
    const metrics = globalThis.__QA_BONDED_DRAW_V87__ = { carrierFrames: 0, movingFrames: 0, left: 0, right: 0, maxCarriersPerFrame: 0,
      maxHorizontalError: 0, maxVerticalError: 0, maxWidthError: 0, bodyFrames: {}, pairedBodyFrames: 0 };
    const carried = hub.drawCarriedCompanionV87, companions = hub.drawCompanionsV87;
    hub.drawCarriedCompanionV87 = function(ctx) {
      const draw = ctx.drawImage, samples = [];
      ctx.drawImage = function(...args) {
        if (args.length === 9 && String(args[0]?.currentSrc || args[0]?.src).split(/[?#]/)[0].endsWith('/ship-animals/v87/enclosure-props.png')
          && crop.every((n, i) => args[i + 1] === n)) samples.push(args.slice(5));
        return draw.apply(this, args);
      };
      try { carried.call(this, ctx); } finally { ctx.drawImage = draw; }
      metrics.maxCarriersPerFrame = Math.max(metrics.maxCarriersPerFrame, samples.length);
      for (const [x, y, w, h] of samples) {
        const p = this.player; metrics.carrierFrames++; metrics[p.facing < 0 ? 'left' : 'right']++;
        if (Math.abs(p.vx) > 10) metrics.movingFrames++;
        metrics.maxHorizontalError = Math.max(metrics.maxHorizontalError, Math.abs(x + w / 2 - (p.x + p.w / 2) - p.facing * layout.sideOffset));
        metrics.maxVerticalError = Math.max(metrics.maxVerticalError, Math.abs(y + h - (p.y + p.h) + layout.lift));
        metrics.maxWidthError = Math.max(metrics.maxWidthError, Math.abs(w - layout.width));
      }
    };
    hub.drawCompanionsV87 = function(ctx) {
      const draw = ctx.drawImage, seen = new Set();
      ctx.drawImage = function(...args) {
        if (hub.currentAnnexV71()?.id === 'animal-care' && args.length === 9) {
          const path = String(args[0]?.currentSrc || args[0]?.src).split(/[?#]/)[0];
          for (const [id, suffix] of Object.entries(paths)) if (path.endsWith(suffix)) seen.add(id);
        }
        return draw.apply(this, args);
      };
      try { companions.call(this, ctx); } finally { ctx.drawImage = draw; }
      for (const id of seen) metrics.bodyFrames[id] = (metrics.bodyFrames[id] || 0) + 1;
      if (seen.size === 2) metrics.pairedBodyFrames++;
    };
    return true;
  };
  await read('(' + instrument.toString() + ')(' + [paths, crop, layout].map(JSON.stringify).join(',') + ')');
}


try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  ({ targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true));
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=bonded-v87' }); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'boot');
  milestone('boot', await read('({title:document.title,text:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})'));
  assert.ok(report.checks.boot.text > 100 && !report.checks.boot.overlay); await capture('00-title');
  milestone('fixture', await read("(()=>{const s=__ATF_V51__.saveSystem;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');s.commit({onboardingV84:null,needsPlayerCreationV84:false,scene:'hub',hub:{...s.data.hub,deck:1,roomId:'crew-quarters',positionX:682,facing:1}});__ATF_V51__.showView('hub');__ATF_HUB__.canvas.focus();return {owned:Object.keys(s.data.shipAnimalsV1.animals).length,credits:s.data.galaxy.resources.credits,habitats:structuredClone(s.data.shipAnimalsV1.habitats),phase:s.data.shipPortV1.phase};})()"));
  assert.equal(report.checks.fixture.owned, 0); assert.equal(report.checks.fixture.credits, 3200);
  assert.ok(Object.values(report.checks.fixture.habitats || {}).every(h => !h.installed));
  assert.equal(report.checks.fixture.phase, 'undocked');
  await wait(450); await press('KeyE');
  await until('__ATF_HUB__.currentAnnexV71()?.id==="animal-care"&&!__ATF_HUB__.annexTransitionV71', 'enter care to prepare two real places');
  await until('[...__ATF_HUB__.getAnnexAssetGroupV71("animal-care").values()].every(i=>i.complete&&i.naturalWidth>0)', 'care art');
  await walk(subject.receivingX, 'walk to empty two-place pen');
  milestone('beforeInstallation', await snapshot()); await capture('01-empty-pen');
  assert.match(report.checks.beforeInstallation.prompt, /INSTALLER/);
  await press('KeyE');
  await until('__ATF_V51__.saveSystem.data.shipAnimalsV1.habitats[' + JSON.stringify(habitat.id) + ']?.installed===true', 'physical two-place installation');
  const fitted = await ledger(); assert.equal(fitted.credits, 3200); assert.deepEqual(fitted.state.animals, {});
  assert.deepEqual(Object.keys(fitted.state.habitats).filter(id => fitted.state.habitats[id].installed), [habitat.id]);
  milestone('installed', { habitatId: habitat.id, places: habitat.capacity, pose: await snapshot(), credits: fitted.credits });
  await capture('02-fitted-pen');
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
  await until('[...__ATF_HUB__.getAnnexAssetGroupV71("frontier-civil-counter").values()].every(i=>i.complete&&i.naturalWidth>0)', 'all seven animal atlases and compartment art');
  milestone('portArt', await read('Object.fromEntries([...__ATF_HUB__.getAnnexAssetGroupV71("frontier-civil-counter")].map(([k,v])=>[k,{width:v.naturalWidth,height:v.naturalHeight}]))'));
  for (const entry of SHIP_PORT_MEETINGS_V87) assert.ok(report.checks.portArt[entry.imageRole]?.width > 0);
  assert.equal(report.checks.portArt.enclosure.width, 1536);
  await walk(subject.meetingX, 'meet ' + subject.names.join(' and ')); await press('KeyE');
  await until('document.querySelector("dialog.ship-port-v87")?.open', 'colonial group dossier');
  milestone('meetingDossier', await read('({heading:document.querySelector("dialog.ship-port-v87 h2")?.textContent,tabs:[...document.querySelectorAll("dialog.ship-port-v87 [role=tab]")].map(el=>({id:el.dataset.animalId,hidden:el.hidden,selected:el.getAttribute("aria-selected")})),confirmDisabled:document.querySelector("[data-port-action=buy]").disabled,owned:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals)})'));
  assert.deepEqual(report.checks.meetingDossier.tabs.map(t => t.id), Object.keys(SHIP_ANIMAL_DEFINITIONS_V87));
  const colonialIds = Object.values(SHIP_ANIMAL_OFFERS_V87).filter(o => o.vendorId === 'colony-shelter').flatMap(getShipAnimalOfferMembersV87);
  assert.deepEqual(report.checks.meetingDossier.tabs.filter(t => !t.hidden).map(t => t.id), colonialIds);
  assert.deepEqual(report.checks.meetingDossier.tabs.filter(t => t.selected === 'true').map(t => t.id), [ids[0]]);
  assert.equal(report.checks.meetingDossier.confirmDisabled, true); assert.deepEqual(report.checks.meetingDossier.owned, []);
  await click('[data-port-action="examine"]');
  milestone('twoDossiers', await read('({members:[...document.querySelectorAll(".ship-port-v87__member")].map(el=>({id:el.dataset.animalId,text:el.innerText})),confirm:document.querySelector("[data-port-action=buy]").textContent,disabled:document.querySelector("[data-port-action=buy]").disabled})'));
  assert.deepEqual(report.checks.twoDossiers.members.map(m => m.id), ids);
  for (const member of report.checks.twoDossiers.members) {
    assert.ok(member.text.includes(SHIP_ANIMAL_DEFINITIONS_V87[member.id].name));
    assert.ok(member.text.includes(SHIP_ANIMAL_DEFINITIONS_V87[member.id].appearance));
  }
  assert.match(report.checks.twoDossiers.confirm, /duo/); assert.equal(report.checks.twoDossiers.disabled, false);
  await capture('05-two-dossiers'); await click('[data-port-action="buy"]');
  await until(animalExpression + '?.deliveryV87?.phase==="awaiting-pickup"', 'one atomic group purchase');
  const purchased = await ledger(); assertOwnership(purchased);
  milestone('purchase', purchased); await capture('06-one-double-crate');
  const deliveries = await read("(async()=>{const m=await import('/src/ship-animal-delivery-v87.js');return m.sampleShipAnimalDeliveriesV87(__ATF_V51__.saveSystem.data)})()");
  assert.equal(deliveries.length, 1); assert.deepEqual(deliveries[0].animalIds, ids); assert.equal(deliveries[0].carried, false);
  milestone('sharedTransportUnit', deliveries[0]);
  await press('KeyE'); await until(animalExpression + '.deliveryV87.phase==="carried"', 'take the double-compartment carrier');
  await installRenderObservers(); milestone('pickup', await snapshot()); await capture('07-pickup');
  await walk(160, 'carry both members to port exit'); await wait(300); await press('KeyE');
  await until('!__ATF_HUB__.isAnnexActiveV71()&&!__ATF_HUB__.annexTransitionV71', 'return with pair to hangar');
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


  await walk(subject.receivingX, 'carry both members to their fitted pen'); await wait(450);
  milestone('receivingPoint', await snapshot());
  assert.equal(report.checks.receivingPoint.animals[ids[0]].delivery.checkpoints.length, 4);
  assert.equal(report.checks.receivingPoint.animals[ids[1]].delivery.leaderId, ids[0]);
  const projection = await read('structuredClone(__QA_BONDED_DRAW_V87__)');
  milestone('doubleCarrierProjection', projection);
  assert.ok(projection.carrierFrames > 300 && projection.movingFrames > 100, 'Measure actual moving canvas frames');
  assert.ok(projection.left > 10 && projection.right > 10, 'Both facings were drawn');
  assert.equal(projection.maxCarriersPerFrame, 1, 'Exactly one carried bitmap for the indivisible pair');
  assert.ok(projection.maxHorizontalError < 1e-6 && projection.maxVerticalError < 1e-6 && projection.maxWidthError < 1e-6,
    'Double carrier uses the exact live-feet presentation contract');
  await press('KeyE'); await pairPhase('intake', 'both enter intake together');
  milestone('intake', await snapshot()); assertInside(report.checks.intake, { exactAnchors: true }); await capture('09-intake-two-anchors');
  await pairPhase('acclimating', 'both complete the actual arrival check');
  milestone('acclimating', await snapshot()); assertInside(report.checks.acclimating, { exactAnchors: true });
  await capture('10-acclimation');
  await pairPhase('resident', 'both complete active acclimation');
  milestone('resident', await snapshot()); assertInside(report.checks.resident, { exactAnchors: true });
  assert.equal(report.checks.resident.animals[ids[0]].delivery.phase, 'delivered');
  await capture('11-two-residents');
  const social = Object.fromEntries(ids.map(id => [id, report.checks.resident.animals[id].needs.social]));
  await press('KeyE');
  await until(JSON.stringify(subject.names) + '.every(name=>document.querySelector("#toast-region")?.innerText.includes(name))', 'observe both real residents');
  milestone('observation', await snapshot());
  for (const id of ids) {
    assert.notEqual(report.checks.observation.animals[id].activity, 'pet');
    assert.equal(report.checks.observation.animals[id].needs.social, social[id], 'Observation never grants contact through the grille');
  }
  await until(JSON.stringify(ids) + '.some(id=>__ATF_V51__.saveSystem.data.shipAnimalsV1.animals[id]?.activity==="walk")', 'real independent routines begin', 16000);
  const movement = [];
  for (let index = 0; index < 20; index++) {
    const state = await snapshot(); assertInside(state); assert.equal(state.health, 100);
    movement.push({ animals: state.animals }); await wait(100);
  }
  assert.ok(ids.every(id => new Set(movement.map(s => s.animals[id].location.x)).size > 2), 'Both bodies really move, not one shared proxy');
  milestone('confinedRoutines', { samples: movement.length, first: movement[0], last: movement.at(-1) });
  await capture('12-confined-routines');
  const graphics = await read('structuredClone(__QA_BONDED_DRAW_V87__)');
  assert.ok(graphics.pairedBodyFrames > 20 && ids.every(id => graphics.bodyFrames[id] > 20), 'Both dedicated bitmaps were drawn together in the real room');
  milestone('twoRenderedBodies', graphics);
  const beforeReload = await ledger(); assertOwnership(beforeReload);
  await reloadAndContinue('resident pair reload');
  milestone('residentReload', await snapshot()); assertInside(report.checks.residentReload);
  const reloaded = await ledger(); assertOwnership(reloaded);
  assert.deepEqual(reloaded.state.receipts, beforeReload.state.receipts);
  assert.deepEqual(reloaded.state.reservations, beforeReload.state.reservations);
  for (const id of ids) {
    assert.equal(reloaded.state.animals[id].location.kind, 'resident');
    assert.deepEqual(reloaded.state.animals[id].acquisition, beforeReload.state.animals[id].acquisition);
    assert.equal(reloaded.state.animals[id].bondedGroupId, habitat.designatedGroupId);
  }
  assert.equal(reloaded.state.animals[ids[0]].deliveryV87.phase, 'delivered');
  assert.equal(reloaded.state.animals[ids[1]].deliveryV87.leaderId, ids[0]);
  await capture('13-reloaded-pair'); assert.deepEqual(errors, []); report.ok = true;

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
