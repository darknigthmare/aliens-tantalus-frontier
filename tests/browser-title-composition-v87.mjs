import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237';
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const baseline = process.env.QA_BASELINE === '1';
const portraitContrastOnly = process.env.QA_PORTRAIT_CONTRAST_ONLY === '1';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v87-title-20260920', baseline ? 'before' : 'after');
await mkdir(output, { recursive: true });
const version = await fetch(endpoint + '/json/version').then(r => r.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map();
const report = { baseline, scope: portraitContrastOnly ? 'portrait-contrast-only' : 'full-composition-and-fleet', ok: false, errors: [], cases: [], shipContexts: [], screenshots: [] };
socket.addEventListener('message', event => {
  const m = JSON.parse(event.data);
  const request = pending.get(m.id);
  if (request) { pending.delete(m.id); m.error ? request.reject(new Error(m.error.message)) : request.resolve(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') report.errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') report.errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) report.errors.push(m.params.response.status + ' ' + m.params.response.url);
});
const cdp = (method, params = {}, browser = false) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 20000);
  pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
  socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
});
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression, label, timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await wait(60); }
  throw new Error('Timeout: ' + label);
}
async function capture(name) {
  await cdp('Page.bringToFront');
  await evaluate('Promise.all([...document.querySelectorAll("#title-scene-v79 img")].map(i=>i.decode())).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
  const image = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 78, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(image.data, 'base64')); report.screenshots.push(name + '.jpg');
}
try {
  context = (await cdp('Target.createBrowserContext', {}, true)).browserContextId;
  const target = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  session = (await cdp('Target.attachToTarget', { targetId: target.targetId, flatten: true }, true)).sessionId;
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + '/?qa-title-composition-v87=1' });
  await until('Boolean(globalThis.__ATF_V61__ && !document.querySelector("#title-screen").hidden && !document.querySelector("#boot"))', 'title boot');
  await until('Array.from(document.querySelectorAll("#title-scene-v79 img")).every(i=>i.complete)', 'initial image loads');
  await capture('boot-1280');
  report.boot = await evaluate('({title:document.title, start:!!document.querySelector("#title-start"), fallback:getComputedStyle(document.querySelector("#title-background-fallback-v61")).display})');
  assert.equal(report.boot.start, true);
  assert.equal(report.boot.fallback, 'none');
  // Presentation fixture only: render each authored preset with the real controller.
  // No save, game state, image content or CSS is modified by the harness.
  await evaluate("(async()=>{ const {TitleSceneControllerV79}=await import(\"/src/title-scene-v79.js\");\nglobalThis.__showTitleQaV87=({preset,placement,shipId,shipName})=>{\n  globalThis.__titleQa?.dispose();\n  const random={starboard:0,center:.5,port:.999}[placement];\n  globalThis.__titleQa=new TitleSceneControllerV79({root:document.querySelector(\"#title-scene-v79\"),fallback:document.querySelector(\"#title-background-fallback-v61\"),random:()=>random});\n  __titleQa.show({presentation:{titleScene:{presetId:preset,motionMode:\"full\",shipId,shipName}},settings:{quality:\"high\"}});\n}; })()");
  const sizes = portraitContrastOnly ? [{ width: 390, height: 844 }] : [{ width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 844, height: 390 }];
  for (const size of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1, mobile: false });
    for (const preset of ['frontier-night', 'storm-terminator', 'ember-quarantine']) {
      for (const placement of portraitContrastOnly ? ['port'] : ['starboard','center','port']) {
      await evaluate('globalThis.__showTitleQaV87(' + JSON.stringify({preset,placement}) + ')');
      await until('Array.from(document.querySelectorAll("#title-scene-v79 img")).every(i=>i.complete)', 'preset images');
      await wait(100);
      const state = await evaluate(`(()=>{
        const root=document.querySelector('#title-scene-v79');
        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
        return {snapshot:__titleQa.getSnapshot(), viewport:{w:innerWidth,h:innerHeight},
          layers:[...root.children].filter(e=>!e.hidden).map(e=>({id:e.dataset.assetId||e.dataset.layerId,role:e.dataset.role,renderer:e.dataset.renderer,planetAnchor:e.dataset.planetAnchor,box:rect(e),image:e.querySelector('img')?rect(e.querySelector('img')):null,natural:e.querySelector('img')?{w:e.querySelector('img').naturalWidth,h:e.querySelector('img').naturalHeight}:null,opacity:getComputedStyle(e).opacity,animation:getComputedStyle(e).animationName,transform:getComputedStyle(e).transform,backface:getComputedStyle(e).backfaceVisibility})),
          overflow:document.documentElement.scrollWidth>innerWidth,
          fallback:getComputedStyle(document.querySelector('#title-background-fallback-v61')).display};
      })()`);
      report.cases.push({ preset, placement, size, ...state });
      await capture(preset + '-' + placement + '-' + size.width);
      if (!baseline) {
        assert.equal(state.snapshot.missingAssetCount, 0);
        assert.equal(state.fallback, 'none');
        assert.equal(state.overflow, false);
        assert.equal(state.snapshot.placementId, placement);
        const ships = state.layers.filter(l => l.role === 'orbitals');
        assert.equal(ships.length, 1, 'one real ship, no extra craft');
        assert.equal(ships[0].renderer, 'image');
        assert.equal(state.layers.some(l=>l.role==='traffic'||l.id==='vfx-01-ion-exhaust'),false);
        assert.ok(Math.abs(ships[0].image.w / ships[0].image.h - ships[0].natural.w / ships[0].natural.h)<.001,'native ship aspect');
        for (const layer of state.layers) assert.equal(layer.backface, 'visible', 'no 3D backface culling of 2D art');
        const sphere = state.layers.filter(l => l.planetAnchor === 'true');
        for (const layer of sphere) {
          assert.ok(Math.abs(layer.box.w-layer.box.h)<.1, 'a circular shared planet frame');
          assert.equal(layer.transform, 'none', 'no independently drifting/rotating spherical layers');
        }
        const planet = sphere.find(l => l.role === 'planet');
        for (const layer of sphere) for(const axis of ['x','y','w','h']) assert.ok(Math.abs(layer.box[axis]-planet.box[axis])<.1,'shared sphere registration '+axis);
      }
      }
    }
  }
  await cdp('Emulation.setDeviceMetricsOverride', { width:1280,height:720,deviceScaleFactor:1,mobile:false });
  const shipOptions = portraitContrastOnly ? [] : await evaluate('import("/src/title-scene-catalog-v79.js").then(m=>m.getTitleSceneShipOptionsV87())');
  for (const option of shipOptions) {
    await evaluate('globalThis.__showTitleQaV87('+JSON.stringify({preset:'frontier-night',placement:'center',shipId:option.shipId,shipName:option.canRename?'SULACO':null})+')');
    await until('Array.from(document.querySelectorAll("#title-scene-v79 img")).every(i=>i.complete)', 'ship images');
    await capture('ship-'+option.shipId);
    const ship = await evaluate(`(()=>{
      const layers=[...document.querySelectorAll('#title-scene-v79 [data-role=orbitals]')];
      const node=layers[0],image=node.querySelector('img'),mark=node.querySelector('.title-ship-marking-v87');
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
      return {snapshot:__titleQa.getSnapshot(),count:layers.length,box:rect(node),image:rect(image),natural:{w:image.naturalWidth,h:image.naturalHeight},mark:mark?{text:mark.textContent,box:rect(mark),visibility:getComputedStyle(mark).visibility}:null};
    })()`);
    report.shipContexts.push({shipId:option.shipId,...ship});
    assert.equal(ship.count,1);
    assert.equal(ship.snapshot.shipId,option.shipId);
    assert.equal(ship.snapshot.placementId,'center');
    assert.equal(ship.snapshot.missingAssetCount,0);
    assert.ok(Math.abs(ship.image.w/ship.image.h-ship.natural.w/ship.natural.h)<.001);
    if(option.canRename) {
      assert.equal(ship.mark.text,'SULACO');
      assert.equal(ship.mark.visibility,'visible');
      assert.ok(ship.mark.box.x>=ship.box.x && ship.mark.box.y>=ship.box.y);
      assert.ok(ship.mark.box.x+ship.mark.box.w<=ship.box.x+ship.box.w+.1);
      assert.ok(ship.mark.box.y+ship.mark.box.h<=ship.box.y+ship.box.h+.1);
    } else assert.equal(ship.mark,null);
  }
  await evaluate('__titleQa.show({presentation:{titleScene:{presetId:"frontier-night"}},settings:{reducedMotion:true}})');
  await until('Array.from(document.querySelectorAll("#title-scene-v79 img")).every(i=>i.complete)', 'static load');
  report.static = await evaluate('({snapshot:__titleQa.getSnapshot(),running:document.querySelector("#title-scene-v79").getAnimations({subtree:true}).filter(a=>a.playState==="running").length})');
  assert.equal(report.static.running, 0);
  await capture('reduced-motion-static');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await evaluate('__titleQa.show({presentation:{titleScene:{presetId:"frontier-night"}},settings:{quality:"high"}})');
  await until('Array.from(document.querySelectorAll("#title-scene-v79 img")).every(i=>i.complete)', 'motion sample load');
  await wait(2200);
  await capture('frontier-night-motion-2s');
  report.motion = await evaluate('({sphere:[...document.querySelectorAll("#title-scene-v79 [data-renderer=image]")].filter(e=>["planet","clouds","atmosphere"].includes(e.dataset.role)).map(e=>({role:e.dataset.role,transform:getComputedStyle(e).transform})),beforePause:document.querySelector("#title-scene-v79").getAnimations({subtree:true}).filter(a=>a.playState==="running").length})');
  if (!baseline) for (const layer of report.motion.sphere) assert.equal(layer.transform, 'none');
  assert.ok(report.motion.beforePause > 0);
  await evaluate('__titleQa.hide()');
  assert.equal(await evaluate('document.querySelector("#title-scene-v79").getAnimations({subtree:true}).filter(a=>a.playState==="running").length'), 0);
  assert.deepEqual(report.errors, []);
  report.ok = true;
} catch (error) { report.failure = error.stack || String(error); throw error; }
finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(()=>{});
  socket.close();
  console.log(JSON.stringify({ ok:report.ok, cases:report.cases.length, ships:report.shipContexts.length, errors:report.errors.length, output, failure:report.failure || null }));
}
