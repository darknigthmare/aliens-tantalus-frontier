import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// Private, bounded QA fixture. Never imported by the application or shipped.
const base = (process.env.APP_URL || 'http://127.0.0.1:4308').replace(/\/$/, '');
const output = resolve(process.env.QA_OUTPUT || '.qa/v102/ceto-source');
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9267';
const publicRoot = resolve(process.env.PUBLIC_ROOT || '.');
const origin = new URL(base);
const local = ['127.0.0.1', 'localhost'].includes(origin.hostname) && origin.protocol === 'http:';
const production = origin.origin === 'https://aliens-tantalus-frontier.vercel.app';
assert.ok((local || production) && origin.pathname === '/' && !origin.search && !origin.hash,
  'Only loopback or the explicit Tantalus production origin is allowed');
assert.ok(!production || process.env.PUBLIC_ROOT, 'Production verification requires the exact prepared public build root');
await mkdir(output, { recursive: true });
const report = { ok: false, base, publicRoot, scope: [
  'Fresh disposable browser context; no user save is read or changed.',
  'Real application canvas, production engine and authored Ceto planet-exterior basin.',
  'Explicit fixture starts a Ceto survey mission, positions the marine at the basin bed and centers the camera. No campaign progression claim.',
  'Engine stopped for deterministic native water-frame screenshots. Only the visual animation clock is selected; normal game draw executes unchanged.',
  'Read-only drawImage interception forwards every call to the real canvas; confirms all eight native water crops within the real habitat.'
], checks: {}, screenshots: [], errors: [] };
for (const path of ['src/game-v51-runtime.js', 'src/mission-interactive-art-v56.js']) {
  const r = await fetch(base + '/' + path), actual = Buffer.from(await r.arrayBuffer());
  const expected = await readFile(resolve(publicRoot, path));
  const normalizeLines = bytes => bytes.toString('utf8').replace(/\r\n/g, '\n');
  assert.equal(r.status, 200); assert.equal(normalizeLines(actual), normalizeLines(expected), 'Served file must match prepared root: ' + path);
  report.checks[path] = { status: r.status, sha256: createHash('sha256').update(actual).digest('hex'),
    expectedSha256: createHash('sha256').update(expected).digest('hex'), exactBytes: actual.equals(expected),
    normalizedTextEqual: true, normalization: 'CRLF to LF only' };
}
const info = await fetch(endpoint + '/json/version').then(r => r.json()); report.browser = info.Browser;
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map();
socket.addEventListener('message', event => {
  const m = JSON.parse(event.data), request = pending.get(m.id);
  if (request) { pending.delete(m.id); clearTimeout(request.timer); m.error ? request.fail(Error(m.error.message)) : request.ok(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') report.errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') report.errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) report.errors.push(m.params.response.status + ' ' + m.params.response.url);
});
function cdp(method, params = {}, browser = false) { return new Promise((ok, fail) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); fail(Error('Timeout ' + method)); }, 30000);
  pending.set(id, { ok, fail, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label) {
  const end = Date.now() + 60000;
  while (Date.now() < end) { const r = await read(expression); if (r) return r; await wait(100); }
  throw Error('Timeout ' + label);
}
async function capture(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.png'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.png');
}
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=ceto-v102' }); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot")', 'boot');
  report.checks.boot = await read('({title:document.title,text:document.body.innerText.length,buttons:document.querySelectorAll("button").length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
  assert.ok(report.checks.boot.text > 100 && report.checks.boot.buttons > 0 && !report.checks.boot.overlay);
  await capture('00-title');
  report.checks.habitat = await read(`(async()=>{
    const content = await import('/src/content.js'), levels = await import('/src/mission-levels-v52.js');
    const ceto = await import('/src/enemy-ceto-v75.js'), sprites = await import('/src/sprite-animation-runtime.js');
    const art = await import('/src/mission-interactive-art-v56.js');
    const game = __ATF_GAME__; __ATF_V61__.titleScreen.hide(); __ATF_V51__.showView('play'); __ATF_HUB__.stop();
    const world = content.WORLDS.find(w=>w.id==='world-10-ceto');
    const campaign = {...content.CAMPAIGNS[0],id:'qa-ceto-v102',worldId:world.id,objective:'survey the tidal caves',mode:'FRONTIER'};
    const plan = levels.buildMissionLevelV52({campaign,world,levelSeeds:content.LEVEL_SEEDS,templateId:'planet-exterior',variant:75});
    game.start({seed:plan.levelSeed.seed,campaign,world,levelSeed:plan.levelSeed,missionLevel:plan,weapon:content.WEAPONS[0],enemyCatalog:content.ENEMIES,
      vehicle:content.VEHICLES.find(v=>v.family==='ground')||content.VEHICLES[0],equipment:content.EQUIPMENT.slice(0,8),crew:content.CREW,difficulty:'standard'});
    game.stop(); game.paused=false;
    const habitat=plan.aquaticHabitats[0], enemies=game.enemies.filter(ceto.isCetoV75), enemy=enemies[0];
    await game.ensureEnemyAtlas(sprites.resolveSpriteSheet(ceto.CETO_V75.sheetId));
    const water=game.images.get(art.MISSION_HAZARD_ART_V56.flood.world.key);
    const ripple=game.images.get(art.MISSION_HAZARD_ART_V56.flood.accent.key);
    await Promise.all([water.decode(),ripple.decode()]);
    game.enemyAtlasLoadingPausedV65=false;
    Object.assign(game.player,{x:habitat.x+70,y:habitat.y+habitat.h-game.player.h,vx:0,vy:0,grounded:true,inVehicle:false});
    game.camera.x=Math.max(0,habitat.x-130); game.camera.y=Math.max(0,habitat.y-300);
    window.__QA_CETO_V102__={game,habitat,plan,ceto,art};
    game.draw(); game.canvas.scrollIntoView({block:'center',behavior:'instant'});
    return {worldId:world.id,template:plan.templateId,count:enemies.length,habitat,contained:ceto.containsCetoBodyV75(habitat,enemy),
      hazard:game.hazards.find(h=>h.cetoHabitatId===habitat.id),enemy:{id:enemy.id,x:enemy.x,y:enemy.y,w:enemy.w,h:enemy.h},
      player:{x:game.player.x,y:game.player.y,w:game.player.w,h:game.player.h},water:{width:water.naturalWidth,height:water.naturalHeight},
      canvas:game.canvas.getBoundingClientRect().toJSON()};
  })()`);
  const h = report.checks.habitat;
  assert.equal(h.count, 1); assert.equal(h.contained, true); assert.equal(h.template, 'planet-exterior');
  assert.equal(h.habitat.freeSwimImplemented, false); assert.equal(h.hazard.kind, 'flood'); assert.equal(h.hazard.damage, 0);
  assert.equal(h.habitat.y + h.habitat.h, h.player.y + h.player.h);
  assert.deepEqual(h.water, { width: 1024, height: 512 }); assert.ok(h.canvas.width > 500 && h.canvas.height > 200);
  report.checks.frames = await read(`(()=>{
    const {game,habitat,art}=__QA_CETO_V102__,profile=art.MISSION_HAZARD_ART_V56.flood,original=game.ctx.drawImage,frames=[];
    let calls=[];
    game.ctx.drawImage=function(image,...args){if(image===game.images.get(profile.world.key))calls.push(args);return original.call(this,image,...args)};
    try {for(let frame=0;frame<8;frame++){calls=[];game.animationTime=frame/profile.fps;game.reducedMotion=false;game.draw();frames.push({frame,calls:calls.filter(a=>a[5]===habitat.y&&a[7]===habitat.h)})}}
    finally{game.ctx.drawImage=original;}
    game.animationTime=3/profile.fps;game.draw();return frames;
  })()`);
  const bands = [[150,198],[148,200],[144,205],[143,205],[142,207],[149,200],[137,211],[151,197]];
  for (const { frame, calls } of report.checks.frames) {
    assert.equal(calls.length, Math.ceil(h.habitat.w / 256));
    for (const [tile, args] of calls.entries()) assert.deepEqual(args, [(frame%4)*256+2,Math.floor(frame/4)*256+bands[frame][0],252,bands[frame][1]-bands[frame][0],h.habitat.x+tile*256,h.habitat.y,256,h.habitat.h]);
  }
  await capture('01-ceto-basin-native-water');
  report.checks.reducedMotion = await read(`(()=>{const {game}=__QA_CETO_V102__;game.reducedMotion=true;game.animationTime=200;game.draw();return {running:game.running,paused:game.paused,mission:game.mission.state,reducedMotion:game.reducedMotion};})()`);
  assert.equal(report.checks.reducedMotion.reducedMotion, true); assert.equal(report.checks.reducedMotion.mission, 'active');
  await capture('02-ceto-basin-reduced-motion');
  assert.deepEqual(report.errors, []); report.ok = true;
} catch (error) { report.failure = error.stack; await capture('failure').catch(()=>{}); throw error; }
finally {
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
  if (context) await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});
  for (const request of pending.values()) clearTimeout(request.timer);
  socket.close(); console.log(JSON.stringify({ok:report.ok,output,checks:Object.keys(report.checks),errors:report.errors,failure:report.failure},null,2));
}
