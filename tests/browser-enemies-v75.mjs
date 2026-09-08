import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDir = resolve(process.env.QA_OUTPUT || 'docs/references/v76-browser-qa');
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4176/';
await mkdir(outputDir, { recursive: true });
const info = await fetch(endpoint + '/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let serial = 0, session, context, target;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (pending.has(data.id)) {
    const request = pending.get(data.id); pending.delete(data.id);
    data.error ? request.reject(new Error(data.error.message)) : request.resolve(data.result);
  }
  if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
  if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') errors.push(data.params.args.map(a => a.value || a.description).join(' '));
});
function cdp(method, params = {}, browser = false) {
  const id = ++serial;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const reply = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (reply.exceptionDetails) throw new Error(reply.exceptionDetails.exception?.description || reply.exceptionDetails.text);
  return reply.result.value;
}
async function waitFor(expression) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('Browser prerequisite timed out: ' + expression + '\n' + errors.join('\n'));
}
async function capture(name) {
  const result = await cdp('Page.captureScreenshot', { format: name.endsWith('.jpg') ? 'jpeg' : 'png',
    ...(name.endsWith('.jpg') ? { quality: 80 } : {}), captureBeyondViewport: false });
  await writeFile(resolve(outputDir, name), Buffer.from(result.data, 'base64'));
  return name;
}
const report = { scope: 'Two accepted profiles: decoded atlas, production renderer, explicit Ceto basin spawn. This is not a full campaign playthrough.', ok: false, screenshots: [] };
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  ({ targetId: target } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true));
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId: target, flatten: true }, true));
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: appUrl + '?qa=enemies-v75-' + Date.now() });
  await waitFor('Boolean(globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot"))');
  report.habitat = await evaluate(`(async () => {
    const content = await import('/src/content.js');
    const missions = await import('/src/mission-levels-v52.js');
    const cetoModule = await import('/src/enemy-ceto-v75.js');
    const sprites = await import('/src/sprite-animation-runtime.js');
    const game = globalThis.__ATF_GAME__;
    globalThis.__ATF_V61__.titleScreen.hide();
    globalThis.__ATF_V51__.showView('play');
    globalThis.__ATF_HUB__.stop();
    const world = content.WORLDS.find(entry => entry.id === 'world-10-ceto');
    const campaign = { ...content.CAMPAIGNS[0], id: 'qa-ceto-v75', worldId: world.id, objective: 'survey the tidal caves', mode: 'FRONTIER' };
    const plan = missions.buildMissionLevelV52({ campaign, world, levelSeeds: content.LEVEL_SEEDS, templateId: 'planet-exterior', variant: 75 });
    game.start({ seed: plan.levelSeed.seed, campaign, world, levelSeed: plan.levelSeed, missionLevel: plan,
      weapon: content.WEAPONS[0], enemyCatalog: content.ENEMIES,
      vehicle: content.VEHICLES.find(entry => entry.family === 'ground') || content.VEHICLES[0],
      equipment: content.EQUIPMENT.slice(0, 8), crew: content.CREW, difficulty: 'standard' });
    game.stop(); game.paused = false;
    const enemies = game.enemies.filter(cetoModule.isCetoV75);
    const enemy = enemies[0], habitat = plan.aquaticHabitats[0];
    await game.ensureEnemyAtlas(sprites.resolveSpriteSheet(cetoModule.CETO_V75.sheetId));
    globalThis.__QA_ENEMIES_V75__ = { content, sprites, cetoModule, game, plan };
    if (enemy) {
      game.camera.x = Math.max(0, enemy.x - 600);
      game.camera.y = Math.max(0, enemy.y - 320);
      game.enemyAtlasLoadingPausedV65 = false;
      game.draw();
    }
    return { worldId: world.id, templateId: plan.templateId, count: enemies.length,
      habitat, contained: enemy && cetoModule.containsCetoBodyV75(habitat, enemy),
      enemy: enemy && { id: enemy.id, x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h, sheetId: enemy.visualSheetId } };
  })()`);
  assert.equal(report.habitat.count, 1); assert.equal(report.habitat.contained, true);
  assert.equal(report.habitat.enemy.w, 156); assert.equal(report.habitat.enemy.h, 100);
  assert.equal(report.habitat.habitat.freeSwimImplemented, false);
  report.screenshots.push(await capture('ceto-v75-production-basin.jpg'));
  report.profiles = [];
  for (const profile of [
    { id: 'enemy-015-prowler', sha: '5462eb30975dcdf83b29e02bf5aff8e65de5fbe92aecb0958c09af1e887e6b52', width: 96, height: 88 },
    { id: 'enemy-051-ceto-reef-predator', sha: '0f40a56669c6a151ea02ffdcdf9ee18331bf495545a816eab75572c062142168', width: 156, height: 100 }
  ]) {
    const result = await evaluate(`(async () => {
      const profile = ${JSON.stringify(profile)};
      const { game, content, sprites } = globalThis.__QA_ENEMIES_V75__;
      const sheetId = 'enemy.profile.' + profile.id + '.v66';
      const sheet = sprites.resolveSpriteSheet(sheetId);
      const response = await fetch(sheet.path);
      const bytes = await response.arrayBuffer();
      const sha = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), v => v.toString(16).padStart(2, '0')).join('');
      const image = await game.ensureEnemyAtlas(sheet);
      const source = content.ENEMIES.find(entry => entry.id === profile.id);
      const enemy = game.createEnemy(source, 0, 0, 240);
      const cell = document.createElement('canvas'); cell.width = 256; cell.height = 256;
      const ctx = cell.getContext('2d', { willReadFrequently: true });
      const fingerprints = [], rendered = [];
      for (let frame = 0; frame < 32; frame += 1) {
        ctx.clearRect(0, 0, 256, 256);
        ctx.drawImage(image, frame % sheet.columns * sheet.cellWidth, Math.floor(frame / sheet.columns) * sheet.cellHeight,
          sheet.cellWidth, sheet.cellHeight, 0, 0, 256, 256);
        const rgba = ctx.getImageData(0, 0, 256, 256).data;
        const alphaPixels = rgba.reduce((count, value, index) => count + (index % 4 === 3 && value > 0 ? 1 : 0), 0);
        const signature = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', rgba)), v => v.toString(16).padStart(2, '0')).join('');
        fingerprints.push({ frame, alphaPixels, signature });
        const clipId = ['idle','move','attack','death'][Math.floor(frame / 8)];
        const sample = new sprites.SpriteAnimationController().sample('qa-' + profile.id + '-' + frame, { sheetId, clipId, frame }, 0);
        for (const facing of [1, -1]) {
          const target = { ...enemy, facing };
          rendered.push({ frame, facing, drawn: game.drawSpriteSample(ctx, sample, target), flip: target.spriteHitbox?.flip,
            sheetId: sample.sheet.id, sampledFrame: sample.frame });
        }
      }
      document.querySelector('#qa-enemy-panel')?.remove();
      const stage = document.createElement('canvas'); stage.id = 'qa-enemy-panel'; stage.width = 1280; stage.height = 720;
      stage.style.cssText = 'position:fixed;inset:0;z-index:10000;width:100vw;height:100vh;background:#091015';
      document.body.append(stage);
      const view = stage.getContext('2d');
      view.fillStyle = '#091015'; view.fillRect(0,0,1280,720);
      view.fillStyle = '#b7dbce'; view.font = '18px monospace';
      view.fillText(profile.id + ' | production renderer | attack 1,3,5,8 | right / left', 22, 32);
      for (let row = 0; row < 2; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const frame = 16 + [0,2,4,7][col];
          const actor = { ...enemy, x: col * 320 + 160 - enemy.w / 2, y: 60 + row * 320 + 240 - enemy.h,
            facing: row ? -1 : 1, alive: true, attacking: true, alert: false };
          if (profile.id === 'enemy-015-prowler') actor.batchAttackV66 = { elapsed: (frame - 16 + 0.01) / 12 };
          else actor.cetoAttackV75 = { elapsed: (frame - 16 + 0.01) / 12 };
          game.animationTime = 1;
          const request = sprites.resolveEnemyAnimation(actor);
          view.strokeStyle = '#294139'; view.strokeRect(col * 320 + 1, 60 + row * 320, 318, 315);
          view.fillStyle = '#779c8d'; view.font = '14px monospace'; view.fillText('frame ' + request.frame + ' / facing ' + actor.facing, col * 320 + 14, 82 + row * 320);
          game.drawEnemy(view, actor);
        }
      }
      return { id: profile.id, httpStatus: response.status, sha, imageWidth: image.naturalWidth, imageHeight: image.naturalHeight,
        body: { width: enemy.w, height: enemy.h }, uniqueFrames: new Set(fingerprints.map(f => f.signature)).size,
        emptyFrames: fingerprints.filter(f => f.alphaPixels === 0).map(f => f.frame),
        renderedCount: rendered.length, rendered, fingerprints };
    })()`);
    assert.equal(result.httpStatus, 200); assert.equal(result.sha, profile.sha);
    assert.deepEqual(result.body, { width: profile.width, height: profile.height });
    assert.equal(result.imageWidth, 1024); assert.equal(result.imageHeight, 2048);
    assert.equal(result.uniqueFrames, 32); assert.deepEqual(result.emptyFrames, []);
    assert.equal(result.renderedCount, 64);
    for (const sample of result.rendered) {
      assert.equal(sample.drawn, true); assert.equal(sample.sampledFrame, sample.frame);
      assert.equal(sample.sheetId, 'enemy.profile.' + profile.id + '.v66');
      assert.equal(sample.flip, sample.facing < 0);
    }
    report.profiles.push(result);
    report.screenshots.push(await capture(profile.id + '-browser-render.png'));
  }
  assert.deepEqual(errors, []);
  report.errors = errors; report.ok = true;
  await writeFile(resolve(outputDir, 'enemies-v75-browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, profiles: report.profiles.map(({ rendered, fingerprints, ...summary }) => summary) }, null, 2));
} finally {
  try { if (target) await cdp('Target.closeTarget', { targetId: target }, true); if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true); } catch {}
  socket.close();
}
