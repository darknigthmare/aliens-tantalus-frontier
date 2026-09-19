import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Private evidence only: explicit initial fixtures, then physical CDP keys and
// normal RAF. Observers forward real sample/draw/event calls without resampling.
const base = process.env.APP_URL || 'http://127.0.0.1:4193';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:' + (process.env.QA_CDP_PORT || '9237');
const output = resolve(process.env.QA_OUTPUT || 'I:/CodexQA/AliensTantalus/v87-player-air-20260919', process.env.QA_RUN || 'browser-01');
const info = await fetch(endpoint + '/json/version').then(r => { assert.equal(r.status, 200); return r.json(); });
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map(), errors = [], pressed = new Set();
socket.addEventListener('message', event => {
  const m = JSON.parse(event.data), job = pending.get(m.id);
  if (job) { pending.delete(m.id); clearTimeout(job.timer); m.error ? job.reject(Error(m.error.message)) : job.resolve(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push(m.params.response.status + ' ' + m.params.response.url);
});
function cdp(method, params = {}, browser = false) { return new Promise((ok, fail) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); fail(Error('CDP timeout ' + method)); }, 30000);
  pending.set(id, { resolve: ok, reject: fail, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
const run = (fn, ...args) => read('(' + fn.toString() + ')(...' + JSON.stringify(args) + ')');
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const value = await read(expression); if (value) return value; await wait(35); }
  throw Error('Timeout: ' + label);
}
async function key(code, down) {
  const special = { Space: [' ', 32], Escape: ['Escape', 27] };
  const [value, virtual] = special[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)];
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', code, key: value, windowsVirtualKeyCode: virtual });
  down ? pressed.add(code) : pressed.delete(code);
}
async function releaseAll() { for (const code of [...pressed]) await key(code, false); }
const report = { ok: false, base, endpoint, browser: info.Browser,
  scope: 'Real mission J1/J2 and hub J1 keyboard jumps and native-platform walk-offs, isolated storage, actual samples and canvas blits. Separate initial falling/hurt fixture. Hub has no playable J2; none fabricated. Existing cells 9/10/11 reused; not new artwork or full campaign certification.',
  fixtures: [], checks: {}, traces: {}, screenshots: [], errors };
async function capture(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg');
}

function installObserver(surface) {
  const q = globalThis.__QA_PLAYER_AIR_V87__ ||= { label: 'warmup', draws: [], events: [], serial: 0, active: null };
  const engine = surface === 'mission' ? __ATF_GAME__ : __ATF_HUB__;
  const controller = surface === 'mission' ? engine.spriteAnimation : engine.playerAnimationV81;
  if (!controller) throw Error('Missing actual animation controller');
  const pose = a => ({ x: a.x, y: a.y, feet: a.y + a.h, vx: a.vx, vy: a.vy, grounded: a.grounded,
    climbing: a.climbing, alive: a.alive, health: a.health, hurt: a.v52HurtClock || 0, shock: a.shockClock || 0 });
  if (!controller.__qaAirObserved) {
    const sample = controller.sample, onEvent = controller.onEvent;
    controller.sample = function (...args) {
      const result = sample.apply(this, args);
      if (q.active?.surface === surface && result) q.active.sample = {
        entityId: result.entityId, sheetId: result.sheet.id, clipId: result.clip.id, frame: result.frame,
        column: result.column, row: result.row, elapsed: result.elapsed,
        motion: result.motionV87 ? structuredClone(result.motionV87) : null,
        events: result.events?.map(event => ({ ...event })) || [] };
      return result;
    };
    controller.onEvent = function (event) {
      q.events.push({ ...event, label: q.label, surface, clock: engine.animationTime });
      return onEvent.call(this, event);
    };
    controller.__qaAirObserved = true;
  }
  if (!engine.ctx.__qaAirObserved) {
    const draw = engine.ctx.drawImage;
    engine.ctx.drawImage = function (...args) {
      if (q.active?.surface === surface && args.length === 9) {
        const image = args[0], path = new URL(image.currentSrc || image.src, location.href).pathname;
        if (path.includes('/normalized/player/')) q.active.blits.push({ path, source: args.slice(1, 5),
          destination: args.slice(5), width: image.naturalWidth, height: image.naturalHeight });
      }
      return draw.apply(this, args);
    };
    engine.ctx.__qaAirObserved = true;
  }
  const method = surface === 'mission' ? 'drawActor' : 'drawPlayer';
  if (!engine[method].__qaAirObserved) {
    const draw = engine[method];
    const observer = function (...args) {
      const actor = surface === 'mission' ? args[1] : this.player;
      if (actor !== this.player && actor !== this.coop) return draw.apply(this, args);
      const previous = q.active;
      const row = { serial: ++q.serial, label: q.label, surface, role: actor === this.coop ? 'J2' : 'J1',
        clock: this.animationTime, pose: pose(actor), sample: null, blits: [] };
      q.active = row;
      try { return draw.apply(this, args); }
      finally {
        row.visual = actor.playerVisualV81 ? { ...actor.playerVisualV81 } : null;
        q.draws.push(row); if (q.draws.length > 18000) throw Error('QA draw buffer exhausted');
        q.active = previous;
      }
    };
    observer.__qaAirObserved = true; engine[method] = observer;
  }
  return { surface, observing: true };
}
const label = value => run(value => { __QA_PLAYER_AIR_V87__.label = value; }, value);
const records = value => run(value => ({ draws: __QA_PLAYER_AIR_V87__.draws.filter(r => r.label === value),
  events: __QA_PLAYER_AIR_V87__.events.filter(r => r.label === value) }), value);
const actorExpression = (surface, role) => surface === 'hub' ? '__ATF_HUB__.player' : role === 'J2' ? '__ATF_GAME__.coop' : '__ATF_GAME__.player';

async function missionFixture(kind) {
  await releaseAll();
  report.fixtures.push(await run(async kind => {
    const c = await import('/src/content.js'), g = __ATF_GAME__;
    __ATF_V61__.titleScreen.hide(); __ATF_V51__.showView('play'); __ATF_HUB__.stop();
    const world = c.WORLDS.find(w => w.biomes.includes('industrial')) || c.WORLDS[0];
    g.start({ seed: 870091, world, crew: c.CREW, enemyCatalog: [], weapon: c.WEAPONS.find(w => w.id.includes('m41a')) || c.WEAPONS[0],
      campaign: { ...c.CAMPAIGNS[0], id: 'qa-player-air-v87', objective: 'restore atmospheric processing', worldId: world.id },
      levelSeed: { ...c.LEVEL_SEEDS[0], id: 'qa-player-air-v87', worldId: world.id }, difficulty: 'standard', aimAssist: 'off' });
    // Explicit threat-free fixture only. Native platforms/walls/doors and their
    // collision/rendering stay unchanged; no fake floor or manual physics tick.
    g.enemies = []; g.hazards = []; g.hostileProjectiles = []; g.squadActors = []; g.setCoop(true);
    const floor = g.platforms.find(p => p.floor), platform = g.platforms.find(p => p.x === 340 && p.y === 816 && p.w === 290);
    if (!floor || !platform) throw Error('Native mission fixture geometry changed');
    for (const [i, a] of [g.player, g.coop].entries()) Object.assign(a, {
      x: kind === 'drop' ? 575 - i * 80 : 180 + i * 80, y: (kind === 'drop' ? platform.y : floor.y) - a.h,
      vx: 0, vy: 0, grounded: true, climbing: false, alive: true, health: 100, fireClock: 0, actionClock: 0,
      jumpBuffer: 0, v52HurtClock: 0, shockClock: 0 });
    // Separate explicit initial falling/injured actor, not damage caused by input.
    if (kind === 'hurt-fall') Object.assign(g.player, { x: 180, y: 350, vy: 90, grounded: false, health: 99, v52HurtClock: .25 });
    g.canvas.focus();
    return { kind, surface: 'mission', floor: { ...floor }, platform: { ...platform },
      poses: [g.player, g.coop].map(a => ({ x: a.x, y: a.y, vy: a.vy, grounded: a.grounded, health: a.health, hurt: a.v52HurtClock })) };
  }, kind));
  await run(installObserver, 'mission');
  // A start fixture can legitimately settle onto its floor. Finish that initial
  // contact before attributing subsequent partner animation to the tested jump.
  if (kind !== 'hurt-fall') await until('__ATF_GAME__.running&&!__ATF_GAME__.paused&&!__ATF_GAME__.enemyAtlasLoadingPausedV65&&[__ATF_GAME__.player,__ATF_GAME__.coop].every(a=>a.grounded&&a.playerVisualV81?.fallback===false&&a.v52Animation?.motionV87?.phase==="grounded")', 'mission ready');
}
async function hubFixture(kind) {
  await releaseAll();
  report.fixtures.push(await run(kind => {
    __ATF_V61__.titleScreen.hide(); __ATF_GAME__.stop(); __ATF_V51__.showView('settings');
    const s = __ATF_V51__.saveSystem, state = structuredClone(s.data.hub);
    for (const k of ['hubCommercialV71','hubExpansionV71','commercialV71']) if (state[k]) { state[k].activeAnnexId = null; state[k].returnContext = null; }
    s.commit({ onboardingV84: null, needsPlayerCreationV84: false, scene: 'hub',
      hub: { ...state, deck: 1, roomId: 'crew-quarters', positionX: 440, facing: 1 } });
    __ATF_V51__.showView('hub');
    const h = __ATF_HUB__, p = h.v51Platforms.find(p => p.id === 'quarters-low');
    if (!p || p.x !== 110 || p.y !== 500 || p.w !== 520) throw Error('Native quarters platform changed');
    Object.assign(h.player, { x: kind === 'drop' ? 160 : 440, y: p.y - h.player.h, vx: 0, vy: 0,
      grounded: true, climbing: false, alive: true, health: 100, shockClock: 0 });
    h.canvas.focus(); return { kind, surface: 'hub', platform: { ...p }, pose: { x: h.player.x, y: h.player.y, grounded: true }, playableJ2: false };
  }, kind));
  await run(installObserver, 'hub');
  await until('__ATF_HUB__.running&&__ATF_HUB__.player.grounded&&__ATF_HUB__.player.playerVisualV81?.fallback===false&&__ATF_HUB__.playerAnimationV81.snapshot().some(s=>s.motionV87?.phase==="grounded")', 'hub ready');
}
function verifyDraws(draws, surface, role) {
  const own = draws.filter(row => row.surface === surface && row.role === role);
  assert.ok(own.length > 3, surface + ' ' + role + ' real rendered samples');
  for (const row of own) {
    assert.equal(row.visual?.fallback, false, 'No placeholder'); assert.ok(row.sample, 'Real sample observed inside actor draw');
    const blit = row.blits.find(b => b.source[0] === row.sample.column * 256 && b.source[1] === row.sample.row * 256
      && b.source[2] === 256 && b.source[3] === 256);
    assert.ok(blit, 'Actual drawImage matches sampled cell'); assert.equal(blit.width, 1024); assert.equal(blit.height, 1024);
    if (row.sample.sheetId === 'player.echo9-marine.locomotion' && !row.pose.grounded && !row.pose.climbing) {
      assert.notEqual(row.sample.frame, 8, 'No crouched preparation in flight');
      assert.notEqual(row.sample.frame, 11, 'No landing sprite while airborne');
    }
  }
  return own;
}
function phase(row) { return row.sample?.motion?.phase || row.sample?.clipId; }
function physicalEvents(trace, entityId) {
  return trace.events.filter(e => e.entityId === entityId && ['jump:impulse','jump:apex','ground:contact'].includes(e.event));
}
async function jump(surface, role) {
  const name = surface + '-' + role + '-jump', a = actorExpression(surface, role), code = role === 'J2' ? 'KeyU' : 'Space';
  await label(name); const start = await read('({feet:' + a + '.y+' + a + '.h,health:' + a + '.health})');
  await key(code, true); await wait(55); await key(code, false);
  await until(a + '.vy>70&&!'+a+'.grounded', name + ' descent'); await capture(name + '-fall');
  await until(a + '.grounded', name + ' contact'); await wait(180);
  const trace = await records(name), own = verifyDraws(trace.draws, surface, role);
  const positions = ['takeoff','rise','apex','fall','land'].map(p => own.findIndex(row => phase(row) === p));
  assert.ok(positions.every(i => i >= 0), name + ' all phases');
  assert.ok(positions.every((index, i) => !i || index > positions[i-1]), name + ' physics phase order');
  assert.ok(own.some(r => phase(r) === 'takeoff' && r.pose.vy < 0 && !r.pose.grounded && r.sample.frame === 9));
  assert.ok(own.some(r => phase(r) === 'rise' && r.pose.vy < 0 && !r.pose.grounded && r.sample.frame === 9));
  assert.ok(own.some(r => phase(r) === 'apex' && Math.abs(r.pose.vy) <= 100 && !r.pose.grounded && r.sample.frame === 10));
  assert.ok(own.some(r => phase(r) === 'fall' && r.pose.vy > 0 && !r.pose.grounded && r.sample.frame === 10));
  assert.ok(own.some(r => phase(r) === 'land' && r.pose.vy === 0 && r.pose.grounded && r.sample.frame === 11));
  assert.ok(own.every(r => r.pose.alive && r.pose.health === start.health));
  const end = await read('({feet:' + a + '.y+' + a + '.h,vy:' + a + '.vy})');
  assert.ok(Math.abs(end.feet - start.feet) < 1); assert.equal(end.vy, 0);
  if (surface === 'mission') {
    assert.deepEqual(physicalEvents(trace, own[0].sample.entityId).map(e => e.event), ['jump:impulse','jump:apex','ground:contact']);
    const other = trace.draws.filter(r => r.role !== role);
    assert.ok(other.length && other.every(r => r.pose.grounded), 'Independent partner stays grounded');
    assert.ok(other.every(r => !['takeoff','rise','apex','fall','land'].includes(phase(r))), 'Partner does not replay jumper clips');
  } else {
    const edges = own.flatMap(r => r.sample.motion?.events || []);
    assert.deepEqual(edges, ['jump:impulse','jump:apex','ground:contact'], 'Exact hub edges with draw emit:false');
  }
  report.traces[name] = trace; report.checks[name] = { frames: own.length, phases: positions, start, end };
  // Screenshots happen after recovery; the trace, not this still, proves cell 11.
  await capture(name + '-after-landing'); console.log(JSON.stringify({ stage: name, ok: true }));
}
async function drop(surface, role) {
  const name = surface + '-' + role + '-walk-off', a = actorExpression(surface, role);
  const code = surface === 'hub' ? 'KeyA' : role === 'J2' ? 'KeyL' : 'KeyD';
  await label(name); const feet = await read(a + '.y+' + a + '.h');
  await key(code, true);
  try { await until('!' + a + '.grounded&&' + a + '.vy>50', name + ' leaves native platform'); }
  finally { await key(code, false); }
  await until(a + '.grounded&&' + a + '.y+' + a + '.h>' + (feet+40), name + ' lands below'); await wait(180);
  const trace = await records(name), own = verifyDraws(trace.draws, surface, role);
  assert.ok(own.some(r => phase(r) === 'fall' && r.pose.vy > 0 && r.sample.frame === 10));
  assert.ok(own.some(r => phase(r) === 'land' && r.pose.grounded && r.sample.frame === 11));
  assert.ok(own.every(r => !['takeoff','rise'].includes(phase(r))), 'Walk-off is not a jump');
  const events = physicalEvents(trace, own[0].sample.entityId);
  assert.ok(events.every(e => !['jump:impulse','jump:apex'].includes(e.event)), 'No jump events on walk-off');
  if (surface === 'mission') assert.deepEqual(events.map(e => e.event), ['ground:contact']);
  else assert.deepEqual(own.flatMap(r => r.sample.motion?.events || []), ['ground:contact'], 'Hub walk-off has contact only');
  assert.ok(own.every(r => r.pose.alive && r.pose.health === 100));
  report.traces[name] = trace; report.checks[name] = { frames: own.length, initialFeet: feet, finalFeet: own.at(-1).pose.feet };
  await capture(name + '-after-landing'); console.log(JSON.stringify({ stage: name, ok: true }));
}
try {
  await mkdir(output, { recursive: true });
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page','Runtime','Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.navigate', { url: base.replace(/\/$/, '') + '/?qa=player-air-v87' }); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_GAME__&&globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'boot', 45000);
  report.checks.boot = await read('({title:document.title,text:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
  assert.ok(report.checks.boot.text > 100); assert.equal(report.checks.boot.overlay, false); await capture('00-title');
  await missionFixture('jump'); await jump('mission','J1'); await jump('mission','J2');
  await missionFixture('drop'); await drop('mission','J1'); await drop('mission','J2');
  await missionFixture('hurt-fall'); await label('mission-J1-hurt-fall');
  await until('__ATF_GAME__.player.grounded', 'separate hurt/fall fixture lands'); await wait(150);
  const trace = await records('mission-J1-hurt-fall'), own = verifyDraws(trace.draws, 'mission', 'J1');
  assert.ok(own.some(r => r.sample.clipId === 'hurt' && [12,13].includes(r.sample.frame) && !r.pose.grounded), 'Living hurt during falling physics');
  assert.ok(own.some(r => phase(r) === 'fall' && r.pose.vy > 0 && r.sample.frame === 10), 'Hurt expiry resumes descent');
  assert.ok(own.every(r => r.pose.alive && r.pose.health === 99 && r.sample.clipId !== 'death'));
  assert.deepEqual(physicalEvents(trace, own[0].sample.entityId).map(e => e.event), ['ground:contact'], 'Hurt fall does not invent a takeoff or apex');
  report.traces['mission-J1-hurt-fall'] = trace; report.checks['mission-J1-hurt-fall'] = { frames: own.length };
  await capture('mission-J1-hurt-fall-after-landing');
  await hubFixture('jump'); await jump('hub','J1');
  await hubFixture('drop'); await drop('hub','J1');
  assert.deepEqual(errors, []); report.ok = true;
} catch (error) {
  report.failure = error.stack; process.exitCode = 1; console.error(error);
  try { report.failureTrace = await read('({label:__QA_PLAYER_AIR_V87__?.label,draws:__QA_PLAYER_AIR_V87__?.draws.slice(-100),events:__QA_PLAYER_AIR_V87__?.events.slice(-40)})'); await capture('failure'); } catch {}
} finally {
  await releaseAll().catch(() => {});
  await mkdir(output, { recursive: true }); await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  socket.close(); console.log(JSON.stringify({ ok: report.ok, output, checks: Object.keys(report.checks), errors, failure: report.failure }, null, 2));
}
