import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.APP_URL || 'http://127.0.0.1:4189';
const subject = process.env.QA_ANIMAL === 'brume'
  ? { id: 'animal-brume', name: 'Brume', meetingX: 1435, berthX: 1160, price: 300 }
  : { id: 'animal-moka', name: 'Moka', meetingX: 990, berthX: 690, price: 220 };
const animalExpression = '__ATF_V51__.saveSystem.data.shipAnimalsV1.animals[' + JSON.stringify(subject.id) + ']';
const output = resolve(process.env.QA_OUTPUT || 'I:/CodexQA/AliensTantalus/v87-port-20260919/e2e', process.env.QA_RUN || 'run-01');
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:9236/json/version').then(r => r.json());
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
const report = { ok: false, base, subject, browser: info.Browser, scope: 'One explicit initial fixture only: completed onboarding, fitted animal berths, player in hangar at x24. All later docking, trading, pickup, movement, ladders/lifts, delivery and reload use actual mouse/keyboard and normal RAF. No actor position assignment after the fixture.', checks: {}, path: [], screenshots: [], errors };
function brief(data) {
  const result = structuredClone(data);
  if (result?.animal?.delivery?.waypoints) result.animal.delivery.waypointCount = result.animal.delivery.waypoints.length;
  if (result?.animal?.delivery) delete result.animal.delivery.waypoints;
  return result;
}
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ stage: name, data: brief(data) })); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg'); }
const poseExpression = `(()=>{const h=__ATF_HUB__,s=__ATF_V51__.saveSystem.data,a=s.shipAnimalsV1?.animals?.[${JSON.stringify(subject.id)}];return {x:h.player.x+h.player.w/2,y:h.player.y,feet:h.player.y+h.player.h,vx:h.player.vx,vy:h.player.vy,grounded:h.player.grounded,climbing:h.player.climbing,deck:h.state.deck,room:h.currentAnnexV71()?.id||h.currentRoom().id,health:h.player.health,running:h.running,transition:h.annexTransitionV71,prompt:h.statusPrompt(),animal:a?{location:a.location,delivery:a.deliveryV87,activity:a.activity}:null,toast:document.querySelector('#toast-region')?.innerText,hidden:document.hidden};})()`;
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
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  ({ targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true));
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=port-v87' }); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'boot');
  milestone('boot', await read('({title:document.title,text:document.body.innerText.length,buttons:document.querySelectorAll("button").length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})'));
  assert.ok(report.checks.boot.text > 100 && !report.checks.boot.overlay);
  await capture('00-title');
  milestone('fixture', await read(`(async()=>{const s=__ATF_V51__.saveSystem,m=await import('/src/ship-animal-habitat-v87.js');__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');let working=structuredClone(s.data);for(const habitat of m.getShipAnimalHabitatsV87(working)){const fitted=m.installShipAnimalHabitatV87(working,habitat.id,{roomId:'animal-care',playerX:habitat.installX,feetY:624,artReady:true});if(!fitted.ok)throw Error(fitted.code);working=fitted.save;}s.commit({shipAnimalsV1:working.shipAnimalsV1,onboardingV84:null,needsPlayerCreationV84:false,scene:'hub',hub:{...s.data.hub,deck:3,roomId:'dropship-hangar',positionX:24,facing:1}});__ATF_V51__.showView('hub');__ATF_HUB__.canvas.focus();return {owned:Object.keys(s.data.shipAnimalsV1.animals).length,credits:s.data.galaxy.resources.credits,phase:s.data.shipPortV1?.phase};})()`));
  assert.equal(report.checks.fixture.owned, 0); assert.equal(report.checks.fixture.credits, 3200);
  await wait(450); milestone('terminalApproach', await snapshot()); await press('KeyE');
  await until('document.querySelector("dialog.ship-port-v87")?.open', 'terminal open');
  await capture('01-terminal'); await click('[data-port-action="dock"]');
  await until('__ATF_V51__.saveSystem.data.shipPortV1.phase==="approach"&&__ATF_V51__.saveSystem.data.shipPortV1.elapsedSeconds>=.6&&!document.querySelector("dialog.ship-port-v87").open', 'abortable physical approach');
  await press('KeyE'); await until('document.querySelector("dialog.ship-port-v87")?.open', 'reopen moving port terminal');
  await capture('01b-abortable-approach'); await click('[data-port-action="abort"]');
  await until('__ATF_V51__.saveSystem.data.shipPortV1.phase==="undocked"', 'abort returns to undocked');
  milestone('abortApproach', await read('({port:structuredClone(__ATF_V51__.saveSystem.data.shipPortV1),owned:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals).length,credits:__ATF_V51__.saveSystem.data.galaxy.resources.credits,position:__ATF_HUB__.player.x})'));
  assert.equal(report.checks.abortApproach.owned, 0); assert.equal(report.checks.abortApproach.credits, 3200);
  assert.equal(Object.values(report.checks.abortApproach.port.commands).filter(c=>c.action==="abort").length, 1);
  await capture('01c-aborted');
  if (process.env.QA_ABORT_ONLY === '1') { assert.deepEqual(errors, []); report.ok = true; }
  else {
  if (!await read('document.querySelector("dialog.ship-port-v87")?.open')) {
    await press('KeyE'); await until('document.querySelector("dialog.ship-port-v87")?.open', 'reopen terminal after abort');
  }
  await click('[data-port-action="dock"]');
  await until('__ATF_V51__.saveSystem.data.shipPortV1.phase==="approach"&&!document.querySelector("dialog.ship-port-v87").open', 'dock begun and dialog closed');
  await until('__ATF_V51__.saveSystem.data.shipPortV1.elapsedSeconds>=1.4', 'mid-approach');
  milestone('midApproachBeforeReload', await read('structuredClone(__ATF_V51__.saveSystem.data.shipPortV1)'));
  await reloadAndContinue('mid-approach reload');
  milestone('midApproachReload', await read('structuredClone(__ATF_V51__.saveSystem.data.shipPortV1)'));
  assert.equal(report.checks.midApproachReload.phase, 'approach');
  assert.ok(report.checks.midApproachReload.elapsedSeconds >= report.checks.midApproachBeforeReload.elapsedSeconds);
  await until('__ATF_V51__.saveSystem.data.shipPortV1.phase==="docked"', 'physical dock complete', 25000);
  milestone('docked', await snapshot()); await capture('02-docked-hangar');
  await walk(108, 'approach physical port gangway');
  await press('KeyE');
  await until('__ATF_HUB__.currentAnnexV71()?.id==="frontier-civil-counter"&&!__ATF_HUB__.annexTransitionV71', 'enter port');
  await until('[...__ATF_HUB__.getAnnexAssetGroupV71("frontier-civil-counter").values()].every(i=>i.complete&&i.naturalWidth>0)', 'all port art');
  milestone('portArt', await read('Object.fromEntries([...__ATF_HUB__.getAnnexAssetGroupV71("frontier-civil-counter")].map(([k,v])=>[k,{width:v.naturalWidth,height:v.naturalHeight}]))'));
  await walk(subject.meetingX, 'walk to ' + subject.name + ' meeting'); await press('KeyE');
  await until('document.querySelector("dialog.ship-port-v87")?.open', subject.name + ' dossier open');
  await click('[data-port-action="examine"]'); await capture('03-companion-dossier');
  assert.equal(await read('document.querySelector("[data-port-action=buy]").disabled'), false);
  await click('[data-port-action="buy"]');
  await until(animalExpression + '?.deliveryV87?.phase==="awaiting-pickup"', 'purchase committed');
  milestone('purchase', await read('({credits:__ATF_V51__.saveSystem.data.galaxy.resources.credits,animals:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals),receipts:__ATF_V51__.saveSystem.data.shipAnimalsV1.receipts,stock:__ATF_V51__.saveSystem.data.shipAnimalsV1.stock})'));
  assert.equal(report.checks.purchase.credits, 3200 - subject.price); assert.deepEqual(report.checks.purchase.animals, [subject.id]);
  assert.equal(Object.keys(report.checks.purchase.receipts).length, 1);
  assert.equal(Object.values(report.checks.purchase.receipts)[0].costCredits, subject.price);
  assert.equal(Object.values(report.checks.purchase.receipts)[0].animalId, subject.id);
  assert.equal(report.checks.purchase.stock['offer-' + subject.id].status, 'sold');
  await capture('04-awaiting-crate'); await press('KeyE');
  await until(animalExpression + '.deliveryV87.phase==="carried"', 'pickup');
  milestone('pickup', await snapshot()); await capture('05-carried');
  await walk(160, 'carry to port exit'); await wait(300); await press('KeyE');
  await until('!__ATF_HUB__.isAnnexActiveV71()&&!__ATF_HUB__.annexTransitionV71', 'return with crate to hangar');
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
  await walk(subject.berthX, 'carry to ' + subject.name + ' fitted berth'); await wait(450);
  milestone('berth', await snapshot());
  assert.equal(report.checks.berth.animal.delivery.checkpoints.length, 4);
  await press('KeyE');
  await until(animalExpression + '.location.kind==="intake"', 'intake started');
  await capture('06-intake'); milestone('intake', await snapshot());
  await until(animalExpression + '.location.kind==="acclimating"', 'arrival check');
  milestone('acclimating', await snapshot()); await capture('07-acclimation');
  await until(animalExpression + '.location.kind==="resident"', 'resident after active stages');
  milestone('resident', await snapshot()); await capture('08-resident');
  await press('KeyE'); await until(animalExpression + '.activity==="pet"', 'nearby pet animation');
  milestone('pet', await snapshot()); await capture('09-pet');
  await until(animalExpression + '.activity==="walk"', 'resident starts real walk', 16000);
  milestone('routineWalk', await snapshot()); await capture('10-routine');
  assert.ok(Math.abs(report.checks.routineWalk.animal.location.x - report.checks.resident.animal.location.x) > 0, 'Routine moves the resident physically');
  await reloadAndContinue('resident reload');
  milestone('residentReload', await snapshot());
  assert.equal(report.checks.residentReload.animal.delivery.phase, 'delivered');
  assert.equal(report.checks.residentReload.animal.location.kind, 'resident');
  assert.equal(await read('__ATF_V51__.saveSystem.data.galaxy.resources.credits'), 3200 - subject.price);
  assert.equal(await read('Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.receipts).length'), 1);
  await capture('11-reloaded-companion'); assert.deepEqual(errors, []); report.ok = true;
  }
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
