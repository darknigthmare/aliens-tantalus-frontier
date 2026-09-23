import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v87-bioforge-mix-20260920', process.env.QA_RUN || 'browser-private-01');
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:' + (process.env.QA_CDP_PORT || '9237') + '/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context; const pending = new Map(), errors = [], responses = [], pressed = new Set();
socket.addEventListener('message', event => {
  const msg = JSON.parse(event.data), job = pending.get(msg.id);
  if (job) { pending.delete(msg.id); clearTimeout(job.timer); msg.error ? job.reject(Error(msg.error.message)) : job.resolve(msg.result); }
  if (msg.sessionId !== session) return;
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
  if (msg.method === 'Network.responseReceived') {
    const r = msg.params.response; responses.push({ url: r.url, status: r.status, mime: r.mimeType });
    if (r.status >= 400 && !r.url.endsWith('/favicon.ico')) errors.push(r.status + ' ' + r.url);
  }
});
function cdp(method, params = {}, browser = false) { return new Promise((resolve, reject) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 30000);
  pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(expression, label, timeout = 30000) {
  const end = Date.now() + timeout; let last;
  while (Date.now() < end) { last = await read(expression); if (last) return last; await wait(75); }
  throw Error('Timeout ' + label + ' / ' + JSON.stringify(last));
}
const special = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9], Home: ['Home', 36], ArrowDown: ['ArrowDown', 40], ArrowUp: ['ArrowUp', 38] };
async function key(code, down, modifiers = 0) {
  const [value, virtual] = special[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)];
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: value, code, windowsVirtualKeyCode: virtual, modifiers });
  down ? pressed.add(code) : pressed.delete(code);
}
async function press(code, duration = 60, modifiers = 0) { await key(code, true, modifiers); await wait(duration); await key(code, false, modifiers); await wait(80); }
async function pointClick(x, y) {
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
}
async function click(selector) {
  // Bring a real scroll-container descendant into view before its CDP click.
  // This changes no game state and does not dispatch a synthetic click event.
  await read(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})`);
  await wait(100);
  let box;
  for (let attempt = 0; attempt < 16; attempt++) {
    box = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;const r=e.getBoundingClientRect(),s=e.closest('.bioforge-terminal-v80')?.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return r.width&&r.height?{x,y,top:Math.max(0,s?.top||0),bottom:Math.min(innerHeight,s?.bottom||innerHeight),hit:h===e||e.contains(h)}:null})()`);
    assert.ok(box, 'Visible enabled control ' + selector);
    if (box.y > box.top + 12 && box.y < box.bottom - 12 && box.hit) break;
    await cdp('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.min(380, box.x), y: Math.max(35, Math.min(650, box.bottom - 60)), deltaX: 0, deltaY: box.y >= box.bottom - 12 ? 290 : -290 });
    await wait(120);
  }
  assert.ok(box.hit, 'Control hit target ' + selector + JSON.stringify(box));
  await pointClick(box.x, box.y); await wait(130);
}
async function select(selector, value) {
  const index = await read(`[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(o=>o.value===${JSON.stringify(value)})`);
  assert.ok(index >= 0); await click(selector); await press('Home');
  for (let i = 0; i < index; i++) await press('ArrowDown', 20);
  await press('Enter'); await press('Tab');
  assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`), value);
}
async function number(selector, value) {
  await click(selector); await press('KeyA', 30, 2); await cdp('Input.insertText', { text: String(value) }); await press('Tab');
  assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`), String(value));
}
const R = '__ATF_BIOFORGE_V80__.runtime';
const pose = `(()=>{const r=${R};return {snapshot:r.getBioforgeSnapshotV80(),player:{x:r.player?.x,y:r.player?.y,health:r.player?.health,armor:r.player?.armor,ammo:r.player?.ammo,reserve:r.player?.ammoReserve,shots:r.player?.shots,grounded:r.player?.grounded},paused:r.paused,physical:r.captureBioforgeRuntimeStateV81()?.physicalV87};})()`;
const fingerprint = `(()=>{const s=__ATF_V51__.saveSystem.data,statistics={...s.statistics};delete statistics.playSeconds;return structuredClone({clock:s.clock,worldId:s.worldId,campaignId:s.campaignId,player:s.player,crew:s.crew,galaxy:s.galaxy,strategy:s.strategy,statistics,animals:s.shipAnimalsV1,refuge:s.refugeV87});})()`;
const report = { ok: false, base, browser: info.Browser, scope: [
  'Isolated Chromium context and storage. Initial fixture completes onboarding and opens BIOFORGE through its shipped QA API; not a ship-access E2E.',
  'Composition, launch, double airlocks, printer, arena entrance, firing, tactical reload, pause, reinforcement, cancellation and purge use real CDP keyboard/mouse input and normal RAF.',
  'Canvas focus and control scrolling use DOM only; no actor position, health, ammunition, queue or cycle injection. No accelerated kill/advance/step hooks.',
  'Actual page reload and normal open restore the persisted physical state. Unit suite separately proves48 allocation and12 simultaneous/cost12.'
], checks: {}, screenshots: [], errors };
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ stage: name, phase: data?.snapshot?.phase || data?.phase, ok: true })); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg'); }
async function canvasFocus() { await read(`document.querySelector('#bioforge-canvas-v80').focus({preventScroll:true})`); }
async function holdUntil(code, expression, label, timeout = 12000) {
  await key(code, true); try { await until(expression, label, timeout); } finally { await key(code, false); await wait(100); }
}
async function boot() { await until('!globalThis.__QA_OLD_DOCUMENT_V87__&&globalThis.__ATF_BIOFORGE_V80__&&globalThis.__ATF_V51__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")', 'boot', 60000); }
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=bioforge-mix-v87' }); await cdp('Page.bringToFront'); await boot();
  milestone('boot', await read('({title:document.title,text:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})'));
  assert.ok(report.checks.boot.text > 100 && !report.checks.boot.overlay);
  milestone('initialFixture', await read(`(()=>{const s=__ATF_V51__.saveSystem;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');s.commit({onboardingV84:null,needsPlayerCreationV84:false,scene:'hub'});__ATF_BIOFORGE_V80__.open();return {createdAt:s.data.createdAt,scene:s.data.scene};})()`));
  await until(`${R}.getBioforgeSnapshotV80().assets.ready===6&&document.querySelector('#bioforge-ui-v80').classList.contains('active')`, 'six decoded assets');
  const before = await read(fingerprint);
  const playSecondsBefore = await read('__ATF_V51__.saveSystem.data.statistics.playSeconds');
  milestone('assets', await read(`Object.fromEntries([...${R}.images].filter(([k])=>k.startsWith('bioforge:')).map(([k,v])=>[k,{width:v.naturalWidth,height:v.naturalHeight,complete:v.complete}]))`));
  await select('#bioforge-profile-v80', 'enemy-001-ovomorph'); await number('#bioforge-quantity-v80', 2); await number('#bioforge-max-concurrent-v87', 1);
  await click('#bioforge-add-line-v87'); await select('#bioforge-profile-v80', 'enemy-002-facehugger');
  milestone('mixedDraft', await read('__ATF_BIOFORGE_V80__.ui.readSelection()'));
  assert.equal(report.checks.mixedDraft.composition.length, 2); assert.equal(report.checks.mixedDraft.maxConcurrent, 1);
  await capture('01-composition'); await click('#bioforge-start-v80');
  await until(`${R}.running`, 'start'); await canvasFocus();
  const initialReserve = await read(`${R}.player.ammoReserve`);
  assert.ok(initialReserve > 0, 'The lab supplies a positive ammunition reserve');
  const initialY = await read(`${R}.player.y`); await press('Space');
  await until(`${R}.player.y<${initialY-10}`, 'real jump');
  await until(`${R}.player.grounded`, 'real landing'); milestone('jump', await read(pose));
  const transfers = [];
  for (const [x, stage] of [[345,1],[555,2],[1020,3]]) {
    await holdUntil('KeyD', `${R}.player.x>=${x}`, 'walk to interlock ' + stage);
    await press('KeyE'); await until(`${R}.bioforgeTransferStageV80===${stage}`, 'interlock ' + stage);
    transfers.push((await read(pose)).snapshot.doors.filter(d=>d.open).map(d=>d.id));
  }
  await holdUntil('KeyD', `${R}.getBioforgeSnapshotV80().phase==='sealing'`, 'physical containment');
  assert.deepEqual(transfers,[['control-seal'],['inner-interlock'],['arena-containment']]); milestone('physicalTransfer', { transfers, state: await read(pose) });
  await until(`${R}.getBioforgeSnapshotV80().printed===1&&${R}.getBioforgeSnapshotV80().printerBlocked==='active-count-capacity'`, 'progressive print then active cap');
  const saturated = await read(pose); await wait(650); const stillSaturated = await read(pose);
  assert.equal(saturated.snapshot.capacity.pending, 2); assert.equal(stillSaturated.snapshot.printed, 1); assert.equal(stillSaturated.snapshot.alive, 1);
  milestone('saturation', { printed: stillSaturated.snapshot.printed, capacity: stillSaturated.snapshot.capacity, egg: stillSaturated.physical.enemies[0] });
  const point = await read(`(()=>{const r=${R},e=r.enemies.find(e=>e.alive),c=document.querySelector('#bioforge-canvas-v80'),b=c.getBoundingClientRect();return {x:b.x+(e.x+e.w/2-r.camera.x)*b.width/c.width,y:b.y+(e.y+e.h/2)*b.height/c.height};})()`);
  await pointClick(point.x, point.y); await until(`${R}.player.shots>=1`, 'real mouse shot');
  const shot = await read(pose); assert.equal(shot.player.ammo, 11); assert.equal(shot.player.shots, 1); milestone('realShot', shot);
  await press('KeyR'); await until(`!${R}.player.reloading&&${R}.player.ammo===12`, 'real tactical reload');
  const reloaded = await read(pose); assert.equal(reloaded.player.reserve, initialReserve - 1); milestone('realReload', reloaded);
  await press('KeyP'); await until(`${R}.paused`, 'pause'); await capture('02-saturation');
  assert.equal(await read("document.querySelector('#bioforge-ui-v80').dataset.terminalCompact"), 'true');
  await click('#bioforge-terminal-toggle-v87');
  assert.equal(await read("document.querySelector('#bioforge-terminal-toggle-v87').getAttribute('aria-expanded')"), 'true');
  await click('#bioforge-reinforcements-v87 summary');
  await select('#bioforge-reinforcement-editor-v87 select', 'enemy-003-chestburster');
  await number('#bioforge-reinforcement-editor-v87 input', 2);
  await click('#bioforge-reinforce-v87'); await until(`${R}.bioforgeRootV80.activeSession.quantity===5`, 'reinforcements');
  milestone('reinforcements', (await read(pose)).snapshot);
  await click('#bioforge-queue-v87 li:first-child button');
  await until(`${R}.bioforgeRootV80.activeSession.queue.filter(e=>e.status==='cancelled').length===1`, 'cancel only old egg line');
  milestone('cancelLine', (await read(pose)).snapshot); assert.equal(report.checks.cancelLine.alive, 1);
  await click('#bioforge-terminal-toggle-v87');
  assert.equal(await read("document.querySelector('#bioforge-ui-v80').dataset.terminalCompact"), 'true');
  await canvasFocus(); await press('KeyP');
  const firstId = saturated.physical.enemies[0].id;
  for (let i=0;i<10;i++) {
    if (!await read(`${R}.enemies.find(e=>e.id===${JSON.stringify(firstId)}).alive`)) break;
    await pointClick(point.x,point.y); await wait(210);
  }
  await until(`!${R}.enemies.find(e=>e.id===${JSON.stringify(firstId)}).alive&&${R}.getBioforgeSnapshotV80().printed===2`, 'real egg neutralization frees next print', 8000);
  await canvasFocus(); await press('KeyP'); await until(`${R}.paused`, 'pause progressive proof');
  milestone('progressiveCombat', await read(pose)); assert.ok(report.checks.progressiveCombat.player.shots>=5);
  assert.equal(report.checks.progressiveCombat.snapshot.population.activeCount,1);
  assert.equal(report.checks.progressiveCombat.snapshot.capacity.pending,2);
  await capture('03-progressive-combat');
  await click('#bioforge-terminal-toggle-v87');
  assert.equal(await read("document.querySelector('#bioforge-terminal-toggle-v87').getAttribute('aria-expanded')"), 'true');
  await click('#bioforge-cancel-pending-v87'); await until(`${R}.getBioforgeSnapshotV80().capacity.pending===0`, 'cancel remaining only');
  const cancelled = await read(pose); assert.equal(cancelled.snapshot.alive,1); assert.equal(cancelled.snapshot.capacity.cancelled,3); milestone('cancelAll',cancelled.snapshot);
  await click('#bioforge-terminal-toggle-v87');
  assert.equal(await read("document.querySelector('#bioforge-ui-v80').dataset.terminalCompact"), 'true');
  const saved = await read('__ATF_BIOFORGE_V80__.snapshot().state.runtimeV81.physicalV87');
  await read('globalThis.__QA_OLD_DOCUMENT_V87__=true');
  await cdp('Page.reload', { ignoreCache: true }); await boot();
  const resumed = await read(`(()=>{__ATF_V61__.titleScreen.hide();__ATF_BIOFORGE_V80__.open();return ${pose};})()`);
  assert.equal(resumed.snapshot.phase,'combat'); assert.equal(resumed.snapshot.printed,2); assert.equal(resumed.snapshot.capacity.cancelled,3);
  assert.deepEqual(resumed.physical.enemies,saved.enemies);
  for(const field of ['health','armor','ammo','ammoReserve','shots']) assert.equal(resumed.physical.player[field],saved.player[field],field+' unchanged on actual page reload');
  milestone('actualPageReload',{snapshot:resumed.snapshot,player:resumed.player,identities:resumed.physical.enemies.map(e=>({id:e.id,alive:e.alive,health:e.health}))});
  await until(`${R}.getBioforgeSnapshotV80().assets.ready===6`, 'six assets decoded after actual page reload');
  const animationAfterLoad = await read(`${R}.animationTime`);
  await until(`${R}.animationTime>${animationAfterLoad}+.1`, 'restored combat advances through normal RAF');
  const playableResume = await read(pose);
  assert.equal(playableResume.snapshot.phase, 'combat');
  assert.equal(playableResume.snapshot.assets.ready, 6);
  assert.equal(playableResume.player.ammo, saved.player.ammo);
  assert.equal(playableResume.player.reserve, saved.player.ammoReserve);
  assert.ok(playableResume.player.health <= saved.player.health);
  assert.ok(playableResume.player.armor <= saved.player.armor);
  milestone('resumedSimulation', { snapshot: playableResume.snapshot, player: playableResume.player, animationAdvanced: true });
  await click('#bioforge-purge-v80'); await until(`${R}.getBioforgeSnapshotV80().phase==='return'&&!${R}.running`, 'real purge');
  const purged = await read(pose); assert.ok(Object.values(purged.snapshot.entities).every(n=>n===0)); assert.equal(purged.snapshot.lastPurge.completed,true);
  milestone('atomicPurge',purged.snapshot); await capture('04-purge');
  assert.deepEqual(await read(fingerprint),before);
  const playSecondsAfter = await read('__ATF_V51__.saveSystem.data.statistics.playSeconds');
  assert.ok(playSecondsAfter >= playSecondsBefore, 'normal unload play-time accounting never decreases');
  milestone('strategicIsolation',{unchanged:true,allowedWallClockAccounting:{playSecondsBefore,playSecondsAfter}});
  assert.deepEqual(errors,[]); milestone('browserErrors',{count:errors.length}); report.ok=true;
} catch(error) { report.failure=error.stack||String(error); try { await capture('failure'); report.lastState=await read(pose); }catch{}; throw error;
} finally {
  report.finishedAt=new Date().toISOString(); report.assetResponses=responses.filter(r=>r.url.includes('/assets/openai/bioforge/'));
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  for(const code of pressed)try{await key(code,false);}catch{}
  if(context)try{await cdp('Target.disposeBrowserContext',{browserContextId:context},true);}catch{}
  socket.close(); console.log(JSON.stringify({ok:report.ok,checks:Object.keys(report.checks).length,output,errors:errors.length}));
}
