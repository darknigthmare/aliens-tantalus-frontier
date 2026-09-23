import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ENEMY_USER_CASTES_V87 } from '../src/enemy-user-castes-v87.js';

// Private browser proof. Keep this harness and every QA artifact out of public releases.
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v87-castes-20260923/browser-private', process.env.QA_RUN || 'run-01');
await mkdir(output, { recursive: true });
const port = process.env.QA_CDP_PORT || '9239';
const info = await fetch(`http://127.0.0.1:${port}/json/version`).then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map(), errors = [], responses = [], pressed = new Set();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data), job = pending.get(message.id);
  if (job) { pending.delete(message.id); clearTimeout(job.timer); message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result); }
  if (message.sessionId !== session) return;
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  if (message.method === 'Network.responseReceived') {
    const response = message.params.response;
    responses.push({ url: response.url, status: response.status, mime: response.mimeType });
    if (response.status >= 400 && !response.url.endsWith('/favicon.ico')) errors.push(response.status + ' ' + response.url);
  }
  if (message.method === 'Network.loadingFailed' && !message.params.canceled) errors.push('Network failure: ' + message.params.errorText);
});
function cdp(method, params = {}, browser = false) { return new Promise((resolveJob, reject) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 30000);
  pending.set(id, { resolve: resolveJob, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
const wait = duration => new Promise(resolveWait => setTimeout(resolveWait, duration));
async function until(expression, label, timeout = 30000) {
  const end = Date.now() + timeout; let last;
  while (Date.now() < end) { last = await read(expression); if (last) return last; await wait(60); }
  throw Error('Timeout ' + label + ': ' + JSON.stringify(last));
}
const special = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9], Home: ['Home', 36], ArrowDown: ['ArrowDown', 40], ArrowUp: ['ArrowUp', 38] };
async function key(code, down, modifiers = 0) {
  const [value, virtual] = special[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)];
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: value, code, windowsVirtualKeyCode: virtual, modifiers });
  down ? pressed.add(code) : pressed.delete(code);
}
async function press(code, duration = 30, modifiers = 0) { await key(code, true, modifiers); if (duration) await wait(duration); await key(code, false, modifiers); }
async function pointClick(x, y) {
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
}
async function click(selector) {
  await read(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})`);
  await wait(80);
  const box = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return {x,y,width:r.width,height:r.height,hit:h===e||e.contains(h)};})()`);
  assert.ok(box?.width && box?.height && box.hit, 'Clickable control ' + selector + ': ' + JSON.stringify(box));
  await pointClick(box.x, box.y); await wait(80);
}
async function select(selector, value) {
  const index = await read(`[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(option=>option.value===${JSON.stringify(value)})`);
  assert.ok(index >= 0, 'Available profile ' + value);
  await click(selector); await press('Home', 0);
  for (let i = 0; i < index; i++) await press('ArrowDown', 0);
  await press('Enter', 0); await press('Tab', 0); await wait(60);
  assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`), value);
}
async function number(selector, value) {
  await click(selector); await press('KeyA', 20, 2); await cdp('Input.insertText', { text: String(value) }); await press('Tab');
  assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`), String(value));
}
async function viewport(width, height) { await cdp('Emulation.setDeviceMetricsOverride', { width, height, mobile: false, deviceScaleFactor: 1 }); await wait(120); }
async function canvasFocus() { await read("document.querySelector('#bioforge-canvas-v80').focus({preventScroll:true})"); }
async function holdUntil(code, expression, label, timeout = 12000) {
  await key(code, true); try { await until(expression, label, timeout); } finally { await key(code, false); }
}
const R = '__ATF_BIOFORGE_V80__.runtime';
const NEW = 'castes-film_warrior_aliens_1986', OLD = 'enemy-005-warrior';
const pose = `(()=>{const r=${R};return {snapshot:r.getBioforgeSnapshotV80(),player:{x:r.player?.x,y:r.player?.y,health:r.player?.health,armor:r.player?.armor,ammo:r.player?.ammo,reserve:r.player?.ammoReserve,shots:r.player?.shots,grounded:r.player?.grounded},paused:r.paused,physical:r.captureBioforgeRuntimeStateV81()?.physicalV87,actors:r.enemies.map(e=>({id:e.id,profileId:e.profileId,x:e.x,y:e.y,facing:e.facing,health:e.health,alive:e.alive,visualMode:e.visualMode,animationStatus:e.animationStatus,visualSheetId:e.visualSheetId,visualImageKey:e.visualImageKey})),draws:globalThis.__QA_CASTES_DRAW_V87__};})()`;
const fingerprint = `(()=>{const s=__ATF_V51__.saveSystem.data,statistics={...s.statistics};delete statistics.playSeconds;return structuredClone({clock:s.clock,worldId:s.worldId,campaignId:s.campaignId,player:s.player,crew:s.crew,galaxy:s.galaxy,strategy:s.strategy,statistics,animals:s.shipAnimalsV1,refuge:s.refugeV87});})()`;
const report = { ok: false, base, browser: info.Browser, scope: [
  'Fresh Chromium context/storage. Onboarding fixture and BIOFORGE opening use the shipped QA API, not a full ship-access walkthrough.',
  'All 35 profile choices, composition, launch, airlocks, walking, crossing, shots, pause, purge and page reload use real CDP input and normal requestAnimationFrame.',
  'Read-only canvas draw observation delegates unchanged to the original drawImage; no game actor, health, ammo, clock or save injection after the initial onboarding fixture.',
  'All 35 supplied assets are checked as native single-pose previews. Real mixed combat tests the old and new Warrior; this is not proof of specialized behaviours or animations for all 35.'
], checks: {}, profiles: [], screenshots: [], errors };
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ stage: name, ok: true })); }
async function capture(name) {
  const response = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 90, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(response.data, 'base64')); report.screenshots.push(name + '.jpg');
}
async function captureCanvas(name) {
  // Native canvas export complements (never replaces) the viewport screenshot.
  // It reveals actors behind DOM without altering the UI or game rendering.
  const native = await read("document.querySelector('#bioforge-canvas-v80').toDataURL('image/jpeg',.92)");
  assert.ok(native.startsWith('data:image/jpeg;base64,'));
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(native.split(',')[1], 'base64'));
  report.screenshots.push(name + '.jpg');
}
async function boot() {
  await until('!globalThis.__QA_OLD_DOCUMENT_V87__&&globalThis.__ATF_BIOFORGE_V80__&&globalThis.__ATF_V51__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")', 'boot', 60000);
}
async function pause() { await canvasFocus(); if (!await read(`${R}.paused`)) await press('KeyP'); await until(`${R}.paused`, 'paused'); }
async function resume() { await canvasFocus(); if (await read(`${R}.paused`)) await press('KeyP'); await until(`!${R}.paused`, 'unpaused'); }
async function uncoveredActors() {
  const actors = await read(`(()=>{const r=${R},c=document.querySelector('#bioforge-canvas-v80'),b=c.getBoundingClientRect();return r.enemies.filter(e=>e.alive).map(e=>{const x=b.x+(e.x+e.w/2-r.camera.x)*b.width/c.width,y=b.y+(e.y+e.h/2)*b.height/c.height,hit=document.elementFromPoint(x,y);return {profileId:e.profileId,x,y,uncovered:hit===c,hitId:hit?.id||null};});})()`);
  assert.equal(actors.length, 2); assert.ok(actors.every(actor => actor.uncovered), 'Both physical Warriors are visible outside terminal overlay: ' + JSON.stringify(actors));
  return actors;
}
const preview = `(()=>{const image=document.querySelector('#bioforge-profile-preview-v80'),thumb=document.querySelector('#bioforge-profile-thumbnail-v80'),line=document.querySelector('#bioforge-composition-v87 .bioforge-line-thumbnail-v87'),style=getComputedStyle(thumb),rect=thumb.getBoundingClientRect();return {selected:document.querySelector('#bioforge-profile-v80').value,src:image.currentSrc||image.src,complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,alt:image.alt,columns:thumb.dataset.atlasColumns,rows:thumb.dataset.atlasRows,backgroundImage:style.backgroundImage,backgroundSize:style.backgroundSize,backgroundPosition:style.backgroundPosition,thumbnail:{width:rect.width,height:rect.height},line:line?{columns:line.dataset.atlasColumns,rows:line.dataset.atlasRows,backgroundSize:getComputedStyle(line).backgroundSize}:null,label:document.querySelector('#bioforge-profile-name-v80').textContent,disclosure:document.querySelector('#bioforge-cost-v80').textContent};})()`;
const drawObserver = `(()=>{const native=CanvasRenderingContext2D.prototype.drawImage;globalThis.__QA_CASTES_DRAW_V87__={};CanvasRenderingContext2D.prototype.drawImage=function(image,...args){const src=typeof image?.src==='string'?image.src:'';if(this.canvas?.id==='bioforge-canvas-v80'&&src.includes('/assets/user/castes-v87/')){const d=globalThis.__QA_CASTES_DRAW_V87__[src]||={count:0,argCounts:[],facings:[],sizes:[],natural:[image.naturalWidth,image.naturalHeight]};d.count++;if(!d.argCounts.includes(args.length))d.argCounts.push(args.length);const facing=Math.sign(this.getTransform().a);if(!d.facings.includes(facing))d.facings.push(facing);const size=args.slice(-2).join('x');if(!d.sizes.includes(size))d.sizes.push(size);}return Reflect.apply(native,this,[image,...args]);};})()`;

try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: drawObserver });
  await viewport(1280, 720);
  await cdp('Page.navigate', { url: base + '/?qa=user-castes-v87' }); await cdp('Page.bringToFront'); await boot();
  const initial = await read('({title:document.title,text:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
  assert.ok(initial.text > 100 && !initial.overlay); milestone('boot', initial);
  await read(`(()=>{const s=__ATF_V51__.saveSystem;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');s.commit({onboardingV84:null,needsPlayerCreationV84:false,scene:'hub'});__ATF_BIOFORGE_V80__.open();})()`);
  await until(`${R}.getBioforgeSnapshotV80().assets.ready===6&&document.querySelector('#bioforge-ui-v80').classList.contains('active')`, 'six native lab assets');
  const before = await read(fingerprint);
  const options = await read("[...document.querySelector('#bioforge-profile-v80').options].map(option=>({value:option.value,text:option.textContent}))");
  assert.equal(options.length, 46); assert.equal(new Set(options.map(option => option.value)).size, 46);
  for (const definition of ENEMY_USER_CASTES_V87) assert.ok(options.some(option => option.value === definition.id));
  assert.match(options.find(option => option.value === OLD).text, /Altered/i);
  assert.doesNotMatch(options.find(option => option.value === NEW).text, /Altered/i);
  milestone('coexistingRoster', { total: options.length, imported: ENEMY_USER_CASTES_V87.length, old: options.find(option => option.value === OLD), new: options.find(option => option.value === NEW) });

  for (const definition of ENEMY_USER_CASTES_V87) {
    await select('#bioforge-profile-v80', definition.id);
    await until(`(()=>{const i=document.querySelector('#bioforge-profile-preview-v80');return i.complete&&i.naturalWidth===${definition.sourceWidth}&&i.naturalHeight===${definition.sourceHeight}&&new URL(i.currentSrc||i.src).pathname===${JSON.stringify(definition.path)};})()`, 'decoded preview ' + definition.id);
    const observed = await read(preview);
    assert.equal(new URL(observed.src).pathname, definition.path);
    assert.equal(observed.columns, '1'); assert.equal(observed.rows, '1');
    assert.equal(observed.backgroundSize, 'contain'); assert.equal(observed.line.columns, '1'); assert.equal(observed.line.rows, '1'); assert.equal(observed.line.backgroundSize, 'contain');
    assert.ok(Math.abs(observed.thumbnail.width - observed.thumbnail.height) < 1, 'Square contain container, not stretched pixels');
    assert.equal(observed.width / observed.height, definition.basename.includes('ovomorphe') ? 2 / 3 : 1.5);
    assert.match(observed.disclosure, /pose fixe/i); assert.match(observed.disclosure, /animations manquantes/i);
    assert.match(observed.disclosure, /comportement labo simplifié/i);
    assert.doesNotMatch(observed.alt, /plaque validée/i);
    report.profiles.push({ id: definition.id, ...observed });
    if (['film_ovomorphe_aliens_1986', 'film_queen_aliens_1986', 'game_xenoborg_avp1999', 'game_avp_capcom_arachnoid'].includes(definition.basename)) await capture('preview-' + definition.basename);
    console.log(JSON.stringify({ stage: 'profile', checked: report.profiles.length, total: 35, id: definition.id }));
  }
  milestone('all35NativePreviews', { checked: report.profiles.length, landscapeRatio: 1.5, portraitEggRatio: 2 / 3 });
  const requested = new Set(responses.filter(response => response.url.includes('/assets/user/castes-v87/')).map(response => new URL(response.url).pathname));
  assert.deepEqual([...requested].sort(), ENEMY_USER_CASTES_V87.map(definition => definition.path).sort());
  milestone('all35NativeRequests', { count: requested.size, paths: [...requested].sort() });

  const responsive = [];
  for (const [width, height, id] of [[1920,1080,NEW],[390,844,'castes-film_ovomorphe_aliens_1986'],[844,390,'castes-film_queen_aliens_1986']]) {
    await viewport(width, height); await select('#bioforge-profile-v80', id);
    await read("document.querySelector('#bioforge-cost-v80').scrollIntoView({block:'center',behavior:'instant'})");
    const layout = await read(`(()=>{const panel=document.querySelector('.bioforge-terminal-v80'),r=panel.getBoundingClientRect(),cost=document.querySelector('#bioforge-cost-v80'),c=cost.getBoundingClientRect(),hit=document.elementFromPoint(c.x+c.width/2,c.y+c.height/2);return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,panel:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,clientWidth:panel.clientWidth,scrollWidth:panel.scrollWidth},disclosure:{width:c.width,height:c.height,visible:!!c.width&&!!c.height&&(hit===cost||cost.contains(hit)),text:cost.textContent}};})()`);
    assert.ok(layout.documentWidth <= width + 1, 'No page horizontal overflow');
    assert.ok(layout.panel.left >= -1 && layout.panel.right <= width + 1, 'Panel remains inside viewport');
    assert.ok(layout.panel.scrollWidth <= layout.panel.clientWidth + 1, 'No panel horizontal overflow');
    assert.ok(layout.disclosure.visible, 'Static-pose disclosure is visible, not hidden on small screens');
    responsive.push(layout); await capture(`responsive-${width}x${height}`);
  }
  milestone('responsiveLargePortraitLandscape', responsive);
  await viewport(1280, 720);
  await select('#bioforge-profile-v80', OLD); await number('#bioforge-quantity-v80', 1); await number('#bioforge-max-concurrent-v87', 2);
  await click('#bioforge-add-line-v87'); await select('#bioforge-profile-v80', NEW);
  const draft = await read('__ATF_BIOFORGE_V80__.ui.readSelection()');
  assert.deepEqual(draft.composition.map(line => line.profileId), [OLD, NEW]); assert.equal(draft.maxConcurrent, 2);
  const oldThumb = await read(`(()=>{const t=document.querySelector('#bioforge-composition-v87 [data-profile-id="${OLD}"]');return {columns:t.dataset.atlasColumns,rows:t.dataset.atlasRows,backgroundSize:getComputedStyle(t).backgroundSize};})()`);
  assert.equal(oldThumb.columns, '4'); assert.equal(oldThumb.rows, '8'); assert.notEqual(oldThumb.backgroundSize, 'contain');
  milestone('mixedComposition', { draft, oldThumb }); await capture('mixed-composition');
  await click('#bioforge-start-v80'); await until(`${R}.running`, 'session start'); await canvasFocus();
  const startingPlayer = await read(`({health:${R}.player.health,armor:${R}.player.armor})`);
  for (const [x, stage] of [[345,1],[555,2],[1020,3]]) {
    await holdUntil('KeyD', `${R}.player.x>=${x}`, 'physical airlock ' + stage);
    await press('KeyE'); await until(`${R}.bioforgeTransferStageV80===${stage}`, 'airlock opened ' + stage);
  }
  await holdUntil('KeyD', `${R}.getBioforgeSnapshotV80().phase==='sealing'`, 'physical arena entrance');
  await until(`${R}.getBioforgeSnapshotV80().printed===2&&${R}.enemies.filter(e=>e.alive).length===2`, 'both coexisting Warriors printed');
  await pause();
  const printed = await read(pose), newActor = printed.actors.find(actor => actor.profileId === NEW), oldActor = printed.actors.find(actor => actor.profileId === OLD);
  assert.ok(newActor && oldActor && newActor.id !== oldActor.id);
  assert.equal(newActor.visualSheetId, null); assert.equal(newActor.visualMode, 'static-pose'); assert.equal(newActor.animationStatus, 'missing');
  assert.equal(newActor.visualImageKey, 'user-caste:film_warrior_aliens_1986'); assert.ok(oldActor.visualSheetId);
  assert.equal(newActor.facing, -1);
  assert.equal(await read("document.querySelector('#bioforge-ui-v80').dataset.terminalCompact"), 'true');
  printed.visibleActors = await uncoveredActors();
  await click('#bioforge-terminal-toggle-v87');
  assert.equal(await read("document.querySelector('#bioforge-terminal-toggle-v87').getAttribute('aria-expanded')"), 'true');
  assert.equal(await read("document.querySelector('#bioforge-ui-v80').dataset.terminalCompact"), 'false');
  await capture('combat-terminal-expanded');
  await click('#bioforge-terminal-toggle-v87');
  assert.equal(await read("document.querySelector('#bioforge-ui-v80').dataset.terminalCompact"), 'true');
  milestone('accessibleTerminalToggle', { expandedAndCollapsed: true, visibleActors: await uncoveredActors() });
  const loaded = await read(`(()=>{const i=${R}.images.get(${JSON.stringify(newActor.visualImageKey)});return {complete:i?.complete,width:i?.naturalWidth,height:i?.naturalHeight,src:i?.src};})()`);
  assert.equal(loaded.width, 1536); assert.equal(loaded.height, 1024); assert.ok(loaded.complete); assert.equal(new URL(loaded.src).pathname, '/assets/user/castes-v87/film_warrior_aliens_1986.png');
  milestone('bothPrintedWithOwnAssets', { printed, loaded }); await capture('combat-facing-left'); await captureCanvas('canvas-facing-left');
  await resume(); await until(`${R}.enemies.find(e=>e.profileId===${JSON.stringify(NEW)}).x<${newActor.x - 3}`, 'native static-pose physical movement'); await pause();
  const moved = await read(pose); milestone('realMovement', { initialX: newActor.x, after: moved.actors.find(actor => actor.profileId === NEW) });
  // Cross first: from the right, the imported second spawn is the nearest target.
  // A shot from the original left side could correctly hit the old Warrior first.
  await resume();
  await holdUntil('KeyD', `${R}.player.x>${R}.enemies.find(e=>e.profileId===${JSON.stringify(NEW)}).x+130`, 'cross imported Warrior using real walking');
  await until(`${R}.enemies.find(e=>e.profileId===${JSON.stringify(NEW)}).facing===1`, 'native pose mirrors toward right');
  await pause(); const crossed = await read(pose); crossed.visibleActors = await uncoveredActors(); milestone('realFacingRight', crossed); await capture('combat-facing-right'); await captureCanvas('canvas-facing-right');
  const draw = Object.values(crossed.draws).find(entry => entry.natural?.[0] === 1536);
  assert.ok(draw?.count > 0); assert.deepEqual(draw.argCounts, [4], 'Whole native image draw, never cropped borrowed frames');
  assert.deepEqual([...draw.facings].sort(), [-1,1]); assert.deepEqual(draw.sizes, ['210x140']);
  milestone('uncroppedDrawBothOrientations', draw);
  const healthBeforeShot = crossed.actors.find(actor => actor.profileId === NEW).health;
  // The left-side terminal can cover a target under the pointer. Native A+F
  // aims left and fires through the shipped keyboard path without UI interception.
  await resume(); await key('KeyA', true); await press('KeyF', 60); await key('KeyA', false);
  await until(`${R}.enemies.find(e=>e.profileId===${JSON.stringify(NEW)}).health<${healthBeforeShot}`, 'real bullet damage on imported Warrior', 8000); await pause();
  const damaged = await read(pose); assert.ok(damaged.player.shots >= 1); assert.ok(damaged.player.ammo < 12); milestone('realBulletDamage', damaged);
  if (crossed.player.health + crossed.player.armor >= startingPlayer.health + startingPlayer.armor) {
    await resume(); await until(`${R}.player.health+${R}.player.armor<${startingPlayer.health + startingPlayer.armor}`, 'real enemy damage', 8000); await pause();
  }
  const physical = await read(pose); assert.ok(physical.player.health + physical.player.armor < startingPlayer.health + startingPlayer.armor); milestone('realEnemyDamage', physical.player);
  const saved = await read('__ATF_BIOFORGE_V80__.snapshot().state.runtimeV81.physicalV87');
  assert.ok(saved?.enemies?.some(enemy => enemy.profileId === NEW));
  await read('globalThis.__QA_OLD_DOCUMENT_V87__=true'); await cdp('Page.reload', { ignoreCache: true }); await boot();
  const restored = await read(`(()=>{__ATF_V61__.titleScreen.hide();__ATF_BIOFORGE_V80__.open();return ${pose};})()`);
  assert.equal(restored.snapshot.phase, 'combat'); assert.equal(restored.snapshot.printed, 2);
  assert.deepEqual(restored.physical.enemies, saved.enemies);
  for (const field of ['health','armor','ammo','ammoReserve','shots']) assert.equal(restored.physical.player[field], saved.player[field], 'Real page reload preserves ' + field);
  assert.deepEqual(restored.physical.enemies.map(enemy => enemy.profileId).sort(), [OLD,NEW].sort());
  milestone('actualReloadSamePhysicalIdentities', restored);
  await until(`${R}.getBioforgeSnapshotV80().assets.ready===6`, 'lab assets decoded after reload');
  await until(`(()=>{const i=${R}.images.get('user-caste:film_warrior_aliens_1986');return i?.complete&&i.naturalWidth===1536;})()`, 'native Warrior decoded after reload');
  const animationTime = await read(`${R}.animationTime`); await until(`${R}.animationTime>${animationTime}+.1`, 'normal simulation resumes after reload');
  await pause(); await capture('combat-real-reload');
  await click('#bioforge-purge-v80'); await until(`${R}.getBioforgeSnapshotV80().phase==='return'&&!${R}.running`, 'normal atomic purge');
  assert.deepEqual(await read(fingerprint), before); milestone('strategicIsolation', { unchanged: true });
  assert.deepEqual(errors, []); milestone('browserErrors', { count: 0 }); report.ok = true;
} catch (error) {
  report.failure = error.stack || String(error);
  try { await capture('failure'); report.lastState = await read(pose); } catch {}
  throw error;
} finally {
  report.finishedAt = new Date().toISOString(); report.nativeAssetResponses = responses.filter(response => response.url.includes('/assets/user/castes-v87/'));
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  for (const code of pressed) try { await key(code, false); } catch {}
  if (context) try { await cdp('Target.disposeBrowserContext', { browserContextId: context }, true); } catch {}
  socket.close(); console.log(JSON.stringify({ ok: report.ok, profiles: report.profiles.length, checks: Object.keys(report.checks).length, output, errors: errors.length }));
}
