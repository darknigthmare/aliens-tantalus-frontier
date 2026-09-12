import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:56907';
const base = process.env.APP_URL || 'http://127.0.0.1:4176/';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v78-browser-qa/final-local');
await mkdir(output, { recursive: true });
const downloads = resolve(output, 'downloads');
await mkdir(downloads, { recursive: true });
const version = await fetch(endpoint + '/json/version').then(response => response.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context, target;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) {
    const request = pending.get(message.id); pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(argument => argument.value || argument.description).join(' '));
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push('HTTP ' + message.params.response.status + ' ' + message.params.response.url);
});
function cdp(method, params = {}, browser = false) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function until(expression, label, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const value = await evaluate(expression); if (value) return value; await wait(20); }
  throw new Error('Timeout: ' + label);
}
async function press(code, { repeat = false, shift = false, release = true } = {}) {
  const key = { Space: ' ', ArrowDown: 'ArrowDown', ArrowUp: 'ArrowUp', Escape: 'Escape', Tab: 'Tab', Enter: 'Enter' }[code] || code.replace(/^Key/, '').toLowerCase();
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', code, key, autoRepeat: repeat, modifiers: shift ? 8 : 0 });
  if (release) await cdp('Input.dispatchKeyEvent', { type: 'keyUp', code, key, modifiers: shift ? 8 : 0 });
}
async function release(code) { await cdp('Input.dispatchKeyEvent', { type: 'keyUp', code, key: code === 'Space' ? ' ' : code }); }
async function click(selector) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)}), box = element?.getBoundingClientRect();
    return box && { x: box.x + box.width/2, y: box.y + box.height/2, width: box.width, height: box.height,
      hit: document.elementFromPoint(box.x + box.width/2, box.y + box.height/2) === element };
  })()`);
  assert.ok(point && point.width && point.height && point.hit, 'Button inaccessible: ' + selector + ' ' + JSON.stringify(point));
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, x: point.x, y: point.y });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: point.x, y: point.y });
}
async function tap(selector) {
  const point=await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e};})()`);
  assert.ok(point.hit,'Touch target inaccessible: '+selector);
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:point.x,y:point.y,radiusX:2,radiusY:2,force:1}]});
  await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
async function reloadPage() {
  await cdp('Page.reload',{ignoreCache:true});
  await until('Boolean(globalThis.__ATF_V61__ && !document.querySelector("#boot") && !document.querySelector("#title-screen").hidden)','page reload title',45000);
  await until('document.activeElement?.id === "title-start"','reload start focus');
}
async function importFile(path) {
  await evaluate('document.querySelectorAll("#toast-region .toast").forEach(element => element.remove())');
  await cdp('DOM.enable'); const {root}=await cdp('DOM.getDocument');
  const {nodeId}=await cdp('DOM.querySelector',{nodeId:root.nodeId,selector:'#save-import'});
  await cdp('DOM.setFileInputFiles',{nodeId,files:[resolve(path)]});
  await wait(120);
  if (!await evaluate('Boolean(document.querySelector("#toast-region .toast"))')) {
    await evaluate('document.querySelector("#save-import").dispatchEvent(new Event("change", { bubbles: true }))');
  }
  const feedback = await until('document.querySelector("#toast-region .toast")?.textContent || ""','invalid import feedback');
  assert.match(feedback, /Fichier de sauvegarde invalide/i);
  return feedback;
}
async function nextDownload(beforeNames, label, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const names = await readdir(downloads);
    const name = names.find(entry => !beforeNames.has(entry) && !entry.endsWith('.crdownload'));
    if (name) {
      const bytes = await readFile(resolve(downloads, name));
      return { name, text: bytes.toString('utf8'), byteLength: bytes.length, bytesBase64: bytes.toString('base64') };
    }
    await wait(40);
  }
  throw new Error('Timeout: ' + label);
}
async function installSimulatedStandardPad(pressed = []) {
  await evaluate(`(() => {
    const pressed = new Set(${JSON.stringify(pressed)});
    globalThis.__ATF_V78_QA_PAD__ = { index:0, id:'QA standard mapped controller', mapping:'standard', connected:true,
      buttons:Array.from({length:17},(_,index)=>({pressed:pressed.has(index),value:pressed.has(index)?1:0})), axes:[0,0,0,0] };
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[globalThis.__ATF_V78_QA_PAD__]});
  })()`);
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
}
async function setSimulatedPad(pressed = [], axes = [0, 0]) {
  await evaluate(`(() => {
    const pad=globalThis.__ATF_V78_QA_PAD__, pressed=new Set(${JSON.stringify(pressed)});
    pad.buttons=Array.from({length:17},(_,index)=>({pressed:pressed.has(index),value:pressed.has(index)?1:0}));
    pad.axes=[${Number(axes[0]) || 0},${Number(axes[1]) || 0},0,0];
  })()`);
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
}
async function removeSimulatedPad() {
  await evaluate(`(() => { delete navigator.getGamepads; delete globalThis.__ATF_V78_QA_PAD__; })()`);
}
async function capture(name) {
  const image = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 68, captureBeyondViewport: false });
  const bytes = Buffer.from(image.data, 'base64'); await writeFile(resolve(output, name), bytes);
  report.screenshots.push({ name, bytes: bytes.length });
}
async function state() {
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  return evaluate(`(() => {
    const title = document.querySelector('#title-screen'), save = __ATF_V51__.saveSystem.data;
    const active = document.activeElement;
    return { title: document.title, titleVisible: !title.hidden, titleState: title.dataset.state,
      menuVisible: !document.querySelector('#title-menu').hidden, activeId: active?.id, activeTag: active?.tagName,
      activeText: active?.textContent?.trim().slice(0,80), focusInTitle: title.contains(active),
      view: document.querySelector('.view.active')?.dataset.panel, appHidden: document.querySelector('#app').hidden,
      confirmation: document.querySelector('#title-new').dataset.confirm,
      save: { profile: save.profile, playerName: save.player.name, kills: save.statistics.kills,
        playSeconds: save.statistics.playSeconds, scene: save.scene, music: save.settings.music,
        currentOperation: save.strategy.currentOperation?.id || null },
      game: { running: __ATF_GAME__.running, paused: __ATF_GAME__.paused }, hubRunning: __ATF_HUB__.running };
  })()`);
}
async function geometry() {
  return evaluate(`(() => {
    const root = document.querySelector('#title-screen');
    const ids = ['title-start','title-continue','title-new','title-forge','title-options','title-profile-status'];
    const boxes = ids.map(id => {
      const element = document.getElementById(id), r = element.getBoundingClientRect(), style = getComputedStyle(element);
      const visible = r.width > 0 && r.height > 0 && style.visibility !== 'hidden';
      return { id, text: element.textContent.trim(), left: r.left, top: r.top, right: r.right, bottom: r.bottom,
        width: r.width, height: r.height, visible,
        fullyInViewport: !visible || (r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight),
        hit: !visible || document.elementFromPoint(r.x+r.width/2,r.y+r.height/2) === element };
    });
    const copy = document.querySelector('.title-screen-copy'), r = copy.getBoundingClientRect();
    const image = document.querySelector('.title-background');
    return { viewport: { width: innerWidth, height: innerHeight, coarse: matchMedia('(pointer:coarse)').matches },
      boxes, copy: { top:r.top,bottom:r.bottom,height:r.height,scrollHeight:copy.scrollHeight,clientHeight:copy.clientHeight,overflow:getComputedStyle(copy).overflow },
      root: { scrollHeight: root.scrollHeight,clientHeight:root.clientHeight,overflow:getComputedStyle(root).overflow },
      background: { complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,src:image.currentSrc } };
  })()`);
}
async function returnTitle() {
  // This reset is a test setup convenience, not a substitute for the tested return button below.
  await evaluate('__ATF_V61__.showTitleScreen()');
  await until('document.activeElement?.id === "title-start"', 'title start focus');
}
async function openMenu() { await press('Enter'); await until('document.activeElement?.id === "title-continue" || (!document.querySelector("#title-menu").hidden && document.querySelector("#title-continue").disabled)', 'menu focus established'); }
function check(ok, id, detail) { if (!ok) report.issues.push({ id, detail }); }
const report = { ok: false, base, scope: 'Isolated browser storage; real CDP keyboard/mouse/touch; standard-mapping gamepad is simulated and explicitly not a physical controller; controlled save and hub-position fixtures are labelled; insertion phases are advanced through their native DOM button after focus assertions; no runtime edits.', checks: {}, layouts: [], screenshots: [], issues: [] };
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  await cdp('Browser.setDownloadBehavior', { behavior:'allow', downloadPath:downloads, browserContextId:context }, true);
  ({ targetId: target } = await cdp('Target.createTarget', { url:'about:blank', browserContextId:context }, true));
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId:target, flatten:true }, true));
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Log.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled:true }); await cdp('Network.setBypassServiceWorker', { bypass:true });
  await cdp('Emulation.setDeviceMetricsOverride', { width:1280,height:720,mobile:false,deviceScaleFactor:1 });
  await cdp('Page.navigate', { url:base + '?qa=title-v78-' + Date.now() });
  await until('Boolean(globalThis.__ATF_V61__ && !document.querySelector("#boot") && !document.querySelector("#title-screen").hidden)', 'title initialized', 45000);
  await until('document.activeElement?.id === "title-start"', 'initial start focus');
  report.initial = await state();
  report.checks.pageHealth = await evaluate(`(() => ({
    bodyTextLength: document.body.innerText.trim().length,
    errorOverlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    release: document.querySelector('meta[name="atf-release"]')?.content || document.title
  }))()`);
  check(report.checks.pageHealth.bodyTextLength > 100 && !report.checks.pageHealth.errorOverlay, 'page-health', report.checks.pageHealth);
  check(/v79/i.test(report.initial.title), 'wrong-browser-release-title', report.initial.title);
  await capture('desktop-idle.jpg');
  for (const viewport of [{name:'desktop',width:1280,height:720,mobile:false},{name:'portrait',width:390,height:844,mobile:true},{name:'landscape',width:844,height:390,mobile:true},{name:'compact-landscape',width:480,height:320,mobile:true}]) {
    await cdp('Emulation.setDeviceMetricsOverride', {width:viewport.width,height:viewport.height,screenWidth:viewport.width,screenHeight:viewport.height,mobile:viewport.mobile,deviceScaleFactor:1});
    await cdp('Emulation.setTouchEmulationEnabled',{enabled:viewport.mobile,maxTouchPoints:5});
    await returnTitle();
    if(viewport.mobile) {await tap('#title-start'); await until('document.activeElement?.id === "title-continue"','touch menu focus');}
    else await openMenu();
    const layout = await geometry(); report.layouts.push({name:viewport.name,...layout});
    check(layout.background.complete && layout.background.width > 0, 'title-background-' + viewport.name, layout.background);
    for (const box of layout.boxes.filter(box=>box.visible)) check(box.fullyInViewport && (box.id === 'title-profile-status' || box.hit), 'title-clipped-' + viewport.name + '-' + box.id, box);
    await capture('title-menu-' + viewport.name + '.jpg');
    if(viewport.mobile) {
      await tap('#title-options'); const settings=await state();
      check(settings.view==='settings'&&!settings.titleVisible,'touch-options-'+viewport.name,settings);
      await tap('#return-title'); await until('document.activeElement?.id === "title-start"','touch return focus');
    }
  }
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});
  await returnTitle(); await openMenu();
  report.checks.titleScenePresets = [];
  for (const preset of [
    { name:'acheron', worldId:'world-01-acheron-lv-426', presetId:'frontier-night', imageCount:14, proceduralFallbackCount:2 },
    { name:'ceto', worldId:'world-10-ceto', presetId:'storm-terminator', imageCount:13, proceduralFallbackCount:3 },
    { name:'mire-9', worldId:'world-26-mire-9', presetId:'ember-quarantine', imageCount:13, proceduralFallbackCount:3 }
  ]) {
    await evaluate(`(() => {
      const save=structuredClone(__ATF_V51__.saveSystem.data);
      save.worldId=${JSON.stringify(preset.worldId)};
      save.presentation={...(save.presentation||{}),titleScene:{presetId:null,motionMode:'full',seed:'qa-v79'}};
      __ATF_V61__.titleScreen.scene.show(save);
    })()`);
    await until(`(() => {
      const root=document.querySelector('#title-scene-v79');
      return root?.dataset.preset===${JSON.stringify(preset.presetId)}
        && !root.querySelector('[data-renderer="image"][data-asset-status="loading"]');
    })()`, 'V79 preset assets '+preset.name);
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    await wait(120);
    const scene=await evaluate(`(() => {
      const root=document.querySelector('#title-scene-v79');
      const images=[...root.querySelectorAll('[data-renderer="image"]')];
      const procedural=[...root.querySelectorAll('[data-renderer="procedural"]')];
      return {preset:root.dataset.preset,mode:root.dataset.mode,degraded:root.dataset.degraded,
        imageCount:images.length,readyCount:images.filter(layer=>layer.dataset.assetStatus==='ready'&&!layer.hidden).length,
        missingCount:images.filter(layer=>layer.dataset.assetStatus==='missing').length,
        runtimeIds:images.map(layer=>layer.dataset.runtimeId),
        sources:images.map(layer=>layer.querySelector('img')?.getAttribute('src')),
        proceduralFallbacks:procedural.filter(layer=>!layer.hidden).map(layer=>layer.dataset.layerId),
        fallbackVisible:!document.querySelector('#title-background-fallback-v61').hidden};
    })()`);
    report.checks.titleScenePresets.push({name:preset.name,...scene});
    check(scene.preset===preset.presetId&&scene.mode==='full','title-scene-preset-'+preset.name,scene);
    check(scene.imageCount===preset.imageCount&&scene.readyCount===preset.imageCount&&scene.missingCount===0,'title-scene-assets-'+preset.name,scene);
    check(scene.proceduralFallbacks.length===preset.proceduralFallbackCount&&!scene.fallbackVisible&&scene.degraded==='false','title-scene-fallback-'+preset.name,scene);
    check(new Set(scene.runtimeIds).size===scene.imageCount&&scene.sources.every(src=>src?.startsWith('/assets/openai/ui/title/v79/')&&!src.includes('comms-relay')),'title-scene-contract-'+preset.name,scene);
    await capture('title-preset-'+preset.name+'.jpg');
  }
  await returnTitle(); await openMenu();
  await until('document.activeElement?.id === "title-continue"', 'menu focus');
  report.checks.directionalKeys = [];
  for (const [code,id] of [['ArrowDown','title-new'],['End','title-options'],['ArrowDown','title-continue'],['Home','title-continue'],['ArrowUp','title-options']]) {
    await press(code); const focused=await state(); report.checks.directionalKeys.push({code,...focused}); check(focused.activeId===id,'keyboard-'+code,focused);
  }
  await press('Home');
  report.checks.tabOrder = [];
  for (let index=0;index<5;index++) { await press('Tab'); const focus=await state(); report.checks.tabOrder.push(focus); check(focus.focusInTitle,'menu-tab-escapes',focus); }
  await press('Escape'); report.checks.escape = await state();
  check(report.checks.escape.titleState === 'idle' && report.checks.escape.activeId === 'title-start','escape-does-not-close-menu',report.checks.escape);
  await returnTitle();
  await press('Enter',{release:false}); await until('document.activeElement?.id === "title-continue"','held start initial edge');
  await press('Enter',{repeat:true,release:false}); await release('Enter');
  report.checks.heldStart = await state();
  check(report.checks.heldStart.titleVisible && report.checks.heldStart.menuVisible,'held-enter-skips-menu',report.checks.heldStart);

  // Standard gamepad mapping is simulated in the isolated page. This validates
  // the browser polling/edge contract without claiming a physical controller.
  await returnTitle();
  await installSimulatedStandardPad();
  const padHasFocus = await evaluate('document.hasFocus()');
  await setSimulatedPad([0]);
  await until('document.querySelector("#title-screen").dataset.state === "menu"', 'simulated gamepad opens menu');
  await setSimulatedPad([]);
  await setSimulatedPad([13]);
  await until('document.activeElement?.id === "title-new"', 'simulated gamepad moves down');
  await setSimulatedPad([]);
  const padSaveBefore = await evaluate('__ATF_V51__.saveSystem.export()');
  await setSimulatedPad([0]);
  await until('document.querySelector("#title-new").dataset.confirm === "true"', 'simulated gamepad requests confirmation');
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))))');
  const padHeld = await state();
  check(padHeld.titleVisible && padHeld.confirmation === 'true' && await evaluate('__ATF_V51__.saveSystem.export()') === padSaveBefore,
    'simulated-gamepad-hold-confirms-destructive-action', padHeld);
  await setSimulatedPad([]);
  await setSimulatedPad([1]);
  await until('document.querySelector("#title-new").dataset.confirm === "false"', 'simulated gamepad cancels confirmation');
  await setSimulatedPad([]);
  await setSimulatedPad([1]);
  await until('document.querySelector("#title-screen").dataset.state === "idle"', 'simulated gamepad closes menu');
  await setSimulatedPad([]);
  report.checks.simulatedStandardGamepad = { mode: 'simulated-standard-mapping', physicalDevice: false, documentHadFocus: padHasFocus,
    openedMenu: true, movedToNewGame: true, heldAcceptDidNotConfirm: padHeld.confirmation === 'true', cancelEdgeWorked: true, backEdgeWorked: true };
  check(padHasFocus, 'simulated-gamepad-page-not-focused', report.checks.simulatedStandardGamepad);
  await removeSimulatedPad();

  await returnTitle(); await openMenu();
  await evaluate('__ATF_V51__.saveSystem.data.statistics.playSeconds = 98765; document.querySelector("#title-new").focus()');
  await press('Enter',{release:false});
  report.checks.newFirstEdge = await state();
  await press('Enter',{repeat:true,release:false}); await release('Enter');
  report.checks.newHeldRepeat = await state();
  check(report.checks.newHeldRepeat.titleVisible && report.checks.newHeldRepeat.confirmation === 'true' && report.checks.newHeldRepeat.save.playSeconds === 98765,'held-enter-confirms-destructive-new-game',report.checks.newHeldRepeat);
  await returnTitle(); await openMenu(); await click('#title-options');
  report.checks.options = await state();
  check(report.checks.options.view === 'settings' && !report.checks.options.titleVisible,'options-wrong-view',report.checks.options);
  check(await evaluate('document.querySelector("[data-panel=settings]").contains(document.activeElement)'),'options-focus-not-restored',report.checks.options);
  await evaluate('document.querySelector("#setting-music").focus()'); await press('ArrowUp');
  report.checks.musicAfterKey = await state();
  await click('#return-title'); report.checks.returnButton = await state();
  check(report.checks.returnButton.titleVisible,'return-button-does-not-return',report.checks.returnButton);
  await until('document.activeElement?.id === "title-start"','return focus'); await openMenu(); await click('#title-options');
  report.checks.musicReopened = await state();
  check(report.checks.musicReopened.save.music === report.checks.musicAfterKey.save.music,'music-not-preserved',report.checks.musicReopened);
  await click('#return-title'); await until('document.activeElement?.id === "title-start"','title after options');
  await openMenu();
  const beforeNewTimeline = await evaluate('__ATF_V51__.saveSystem.export()');
  await click('#title-new'); report.checks.newConfirmation = await state();
  check(report.checks.newConfirmation.titleVisible && report.checks.newConfirmation.confirmation === 'true','new-game-not-confirmed',report.checks.newConfirmation);
  await press('Escape'); report.checks.newCancelled = await state();
  check(report.checks.newCancelled.titleVisible && report.checks.newCancelled.confirmation === 'false'
    && await evaluate('__ATF_V51__.saveSystem.export()') === beforeNewTimeline, 'new-game-cancel-mutates-save', report.checks.newCancelled);
  await click('#title-new');
  await click('#title-new'); report.checks.newConfirmed = await state();
  check(!report.checks.newConfirmed.titleVisible && report.checks.newConfirmed.view === 'hub'
    && report.checks.newConfirmed.save.playSeconds === 0 && report.checks.newConfirmed.activeId === 'hub-canvas',
    'new-game-not-entering-fresh-focused-hub',report.checks.newConfirmed);
  await returnTitle(); await openMenu(); await click('#title-continue'); report.checks.continueHub = await state();
  check(report.checks.continueHub.view === 'hub' && report.checks.continueHub.hubRunning && report.checks.continueHub.activeId === 'hub-canvas',
    'continue-hub-not-running-or-focused',report.checks.continueHub);

  // Enter a real campaign mission from the running hub. The insertion owns
  // focus while it is interactive, keeps it across rerenders, then hands it
  // back to the game canvas when player control actually starts.
  const missionLaunched=await evaluate('__ATF_V51__.launchCampaign()');
  await until('!document.querySelector("#mission-insertion-v62").hidden','mission insertion visible');
  const insertionInitial=await evaluate(`(() => {const root=document.querySelector('#mission-insertion-v62'),active=document.activeElement;
    return {activeId:active?.id||'',action:active?.dataset?.insertionAction||'',inside:root.contains(active),phase:root.dataset.insertionPhase,status:root.dataset.insertionStatus};})()`);
  check(missionLaunched && insertionInitial.inside && insertionInitial.action === 'advance','mission-insertion-focus-missing',{missionLaunched,insertionInitial});
  await evaluate('document.querySelector(\'[data-insertion-action="advance"]\').click()');
  const insertionAfterRerender=await until(`(() => {const root=document.querySelector('#mission-insertion-v62'),active=document.activeElement;
    return root.contains(active) && active?.dataset?.insertionAction ? {activeId:active.id||'',action:active.dataset.insertionAction,inside:true,phase:root.dataset.insertionPhase,status:root.dataset.insertionStatus} : null;})()`,
    'mission insertion focus after rerender');
  check(insertionAfterRerender.inside && insertionAfterRerender.action === 'advance','mission-insertion-rerender-lost-focus',insertionAfterRerender);
  const insertionSteps=[{stage:'initial',...insertionInitial},{stage:'after-rerender',...insertionAfterRerender}];
  for(let index=0;index<12 && !await evaluate('__ATF_GAME__.running');index++) {
    const before=await evaluate(`(() => {const root=document.querySelector('#mission-insertion-v62'),button=root.querySelector('[data-insertion-action="advance"]');
      return {phase:root.dataset.insertionPhase,status:root.dataset.insertionStatus,hasAdvance:Boolean(button),focused:document.activeElement===button};})()`);
    if(!before.hasAdvance) break;
    await evaluate('document.querySelector(\'[data-insertion-action="advance"]\').click()');
    await wait(40);
    const after=await evaluate(`(() => {const root=document.querySelector('#mission-insertion-v62'),active=document.activeElement;
      return {phase:root.dataset.insertionPhase,status:root.dataset.insertionStatus,gameRunning:__ATF_GAME__.running,
        activeId:active?.id||'',action:active?.dataset?.insertionAction||'',inside:root.contains(active)};})()`);
    insertionSteps.push({stage:'advance-'+(index+2),before,after});
  }
  await until('__ATF_GAME__.running && document.querySelector(".view.active")?.dataset.panel === "play" && document.activeElement?.id === "game-canvas"',
    'mission runtime game canvas focus',20000);
  report.checks.missionFocus={launched:missionLaunched,initial:insertionInitial,afterRerender:insertionAfterRerender,steps:insertionSteps,runtime:await state()};
  check(report.checks.missionFocus.runtime.activeId === 'game-canvas' && report.checks.missionFocus.runtime.game.running,
    'mission-runtime-canvas-not-focused',report.checks.missionFocus);
  await capture('mission-game-canvas-focus.jpg');
  await returnTitle(); await openMenu(); await click('#title-forge'); report.checks.forge = await state();
  check(report.checks.forge.view === 'editor' && !report.checks.forge.titleVisible,'forge-not-opening',report.checks.forge);
  await click('#return-title'); report.checks.forgeReturn = await state();
  check(report.checks.forgeReturn.titleVisible,'forge-not-returning',report.checks.forgeReturn);
  await until('document.activeElement?.id === "title-start"','forge return focus');
  report.checks.profiles = [];
  for (const profile of [2,3]) {
    await openMenu(); await click('#title-options');
    await click('[data-profile="'+profile+'"]');
    await until(`__ATF_V51__.saveSystem.profile === ${profile}`,'profile selection');
    await evaluate('document.querySelector("#setting-music").focus()'); await press('ArrowUp');
    const before=await state();
    await click('#return-title'); await until('document.activeElement?.id === "title-start"','profile title');
    await reloadPage(); const after=await state();
    const marker=await evaluate('localStorage.getItem("atf-v78-selected-profile")');
    report.checks.profiles.push({profile,before,after,marker});
    check(after.save.profile===profile&&marker===String(profile),'selected-profile-not-persistent-'+profile,{before,after,marker});
    check(after.save.music===before.save.music,'profile-options-not-durable-'+profile,{before,after});
  }
  await openMenu(); await click('#title-options');
  const beforeImport=await evaluate('({data:__ATF_V51__.saveSystem.export(),slots:Object.fromEntries([1,2,3].map(id=>[id,localStorage.getItem("atf-v47-profile-"+id)])),profile:__ATF_V51__.saveSystem.profile,game:__ATF_GAME__.running,hub:__ATF_HUB__.running})');
  const invalidImportFeedback = await importFile('docs/references/v78-browser-qa/fixtures/invalid-true.json');
  const afterImport=await evaluate('({data:__ATF_V51__.saveSystem.export(),slots:Object.fromEntries([1,2,3].map(id=>[id,localStorage.getItem("atf-v47-profile-"+id)])),profile:__ATF_V51__.saveSystem.profile,game:__ATF_GAME__.running,hub:__ATF_HUB__.running})');
  report.checks.invalidImport={unchanged:JSON.stringify(beforeImport)===JSON.stringify(afterImport),profile:afterImport.profile,
    runtimeFlagsUnchanged: beforeImport.game === afterImport.game && beforeImport.hub === afterImport.hub,
    toast: invalidImportFeedback, beforeRuntime:{game:beforeImport.game,hub:beforeImport.hub}, afterRuntime:{game:afterImport.game,hub:afterImport.hub}};
  check(report.checks.invalidImport.unchanged,'invalid-import-mutates-state',report.checks.invalidImport);
  check(report.checks.invalidImport.runtimeFlagsUnchanged,'invalid-import-changes-runtime-state',report.checks.invalidImport);
  await click('#return-title'); await until('document.activeElement?.id === "title-start"','title after invalid import');
  await openMenu(); await click('#title-continue'); await click('#exit-hub');
  const timelineBefore=await evaluate(`(() => {
    const save=__ATF_V51__.saveSystem;
    save.data.player.name='V78 QA TIMELINE PRESERVED';
    save.data.statistics.kills=78;
    save.commit();
    return {profile:save.data.profile,playerName:save.data.player.name,kills:save.data.statistics.kills};
  })()`);
  await click('#new-timeline'); const timeline=await state();
  check(timeline.titleVisible&&timeline.confirmation==='true'&&timeline.save.profile===timelineBefore.profile
    &&timeline.save.playerName===timelineBefore.playerName&&timeline.save.kills===timelineBefore.kills,
    'legacy-new-timeline-bypasses-confirmation',{timelineBefore,timeline});
  await press('Escape'); report.checks.legacyTimelineCancelled=await state();
  check(report.checks.legacyTimelineCancelled.titleVisible&&report.checks.legacyTimelineCancelled.confirmation==='false'
    &&report.checks.legacyTimelineCancelled.save.profile===timelineBefore.profile
    &&report.checks.legacyTimelineCancelled.save.playerName===timelineBefore.playerName
    &&report.checks.legacyTimelineCancelled.save.kills===timelineBefore.kills,
    'legacy-new-timeline-cancel-failed',{timelineBefore,cancelled:report.checks.legacyTimelineCancelled});
  await evaluate('document.querySelectorAll("#toast-region .toast").forEach(element => element.remove())');

  // Browser-level table traversal uses the actual V78 hub loop and real CDP
  // keyboard events. Only the starting pose is a controlled isolated fixture.
  await evaluate(`(() => {
    const hub=__ATF_HUB__, table=hub.obstacles.find(entry=>entry.roomId==='briefing'&&entry.collisionMode==='one-way-top');
    if (!table) throw new Error('V78 briefing one-way table collider not found');
    globalThis.__ATF_V78_QA_TABLE__={...table};
    Object.assign(__ATF_V51__.saveSystem.data.hub,{deck:0,roomId:'briefing',positionX:table.x-94,visited:['bridge','briefing'],playerHealth:100});
  })()`);
  await click('#title-continue');
  await until('__ATF_HUB__.running && document.querySelector(".view.active")?.dataset.panel === "hub"','briefing hub running');
  const briefingStart=await evaluate(`(() => ({player:{...__ATF_HUB__.player},table:{...__ATF_V78_QA_TABLE__},floor:624,
    controlledFixture:'deck 0 / briefing / 94px left of authored one-way tabletop'}))()`);
  await press('KeyD',{release:false});
  await until('__ATF_HUB__.player.x > __ATF_V78_QA_TABLE__.x + __ATF_V78_QA_TABLE__.w * 0.42','marine reaches table foreground',5000);
  const briefingFront=await evaluate(`(() => { const p=__ATF_HUB__.player,t=__ATF_V78_QA_TABLE__; return {player:{x:p.x,y:p.y,w:p.w,h:p.h},table:{...t},
    horizontalOverlap:p.x<t.x+t.w&&p.x+p.w>t.x,feet:p.y+p.h,grounded:p.grounded}; })()`);
  await capture('briefing-pass-in-front.jpg');
  await until('__ATF_HUB__.player.x > __ATF_V78_QA_TABLE__.x + __ATF_V78_QA_TABLE__.w','marine passes whole table',5000);
  await release('KeyD');
  const briefingPassed=await evaluate(`(() => { const p=__ATF_HUB__.player,t=__ATF_V78_QA_TABLE__; return {player:{x:p.x,y:p.y,w:p.w,h:p.h},table:{...t},feet:p.y+p.h,
    floor:624,grounded:p.grounded,roomId:__ATF_HUB__.state.roomId}; })()`);
  check(briefingFront.horizontalOverlap && Math.abs(briefingFront.feet-624)<2,'briefing-player-not-in-front-on-deck',briefingFront);
  check(briefingPassed.player.x>briefingPassed.table.x+briefingPassed.table.w && Math.abs(briefingPassed.feet-briefingPassed.floor)<2,
    'briefing-table-blocks-horizontal-passage',briefingPassed);

  await evaluate(`(() => { const hub=__ATF_HUB__,t=__ATF_V78_QA_TABLE__,p=hub.player;
    Object.assign(p,{x:t.x+t.w/2-p.w/2,y:624-p.h,vx:0,vy:0,grounded:true,climbing:false,crouching:false});
    hub.coyoteTime=.1; hub.jumpQueued=0; hub.keys.clear(); hub.draw(); })()`);
  await press('Space');
  let airborne=false, landed=false, highestFeet=624, landing=null;
  const jumpDeadline=Date.now()+4000;
  while(Date.now()<jumpDeadline){
    const pose=await evaluate(`(() => {const p=__ATF_HUB__.player,t=__ATF_V78_QA_TABLE__;return {feet:p.y+p.h,y:p.y,vy:p.vy,grounded:p.grounded,tableTop:t.y};})()`);
    highestFeet=Math.min(highestFeet,pose.feet); airborne ||= !pose.grounded;
    if(airborne&&pose.grounded&&Math.abs(pose.feet-pose.tableTop)<2){landed=true;landing=pose;break;}
    await wait(16);
  }
  if(landed) await capture('briefing-landed-on-table.jpg');
  check(airborne&&landed&&highestFeet<(landing?.tableTop??624)-10,'briefing-jump-does-not-land-on-table',{airborne,landed,highestFeet,landing});
  if(landed){
    await press('KeyD',{release:false});
    await until('__ATF_HUB__.player.x > __ATF_V78_QA_TABLE__.x + __ATF_V78_QA_TABLE__.w','marine walks off tabletop',5000);
    await release('KeyD');
    await until('Math.abs((__ATF_HUB__.player.y+__ATF_HUB__.player.h)-624)<2 && __ATF_HUB__.player.grounded','marine returns to deck',3000);
  }
  report.checks.briefingTable={start:briefingStart,foreground:briefingFront,passed:briefingPassed,jump:{airborne,landed,highestFeet,landing},
    afterWalkOff:await evaluate('({x:__ATF_HUB__.player.x,feet:__ATF_HUB__.player.y+__ATF_HUB__.player.h,grounded:__ATF_HUB__.player.grounded})')};
  await returnTitle();

  // Seed malformed data only at the next document start, after old-page unload saves.
  const corruptRaw='{ "qa": "V78 malformed original",';
  const seed=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('atf-v47-profile-3',${JSON.stringify(corruptRaw)});localStorage.setItem('atf-v78-selected-profile','3');`});
  await reloadPage(); await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:seed.identifier});
  const recovery=await evaluate(`({status:__ATF_V51__.saveSystem.recoveryNeeded,raw:localStorage.getItem('atf-v47-profile-3'),warning:document.querySelector('#title-recovery-warning')?.textContent,warningVisible:!document.querySelector('#title-recovery-warning')?.hidden,continueDisabled:document.querySelector('#title-continue').disabled})`);
  report.checks.corruptBoot=recovery;
  check(recovery.raw===corruptRaw&&recovery.status?.profile===3&&recovery.status?.status==='corrupt'&&recovery.warningVisible&&recovery.continueDisabled,'corrupt-boot-not-protected',recovery);
  await capture('title-corrupt-profile.jpg');
  await openMenu(); await click('#title-options');
  const recoveryOptions=await evaluate(`({notice:document.querySelector('#save-recovery-notice')?.textContent,noticeVisible:!document.querySelector('#save-recovery-notice')?.hidden,raw:localStorage.getItem('atf-v47-profile-3'),exportText:document.querySelector('#save-export').textContent})`);
  report.checks.recoveryOptions=recoveryOptions;
  check(recoveryOptions.noticeVisible&&recoveryOptions.raw===corruptRaw,'recovery-options-overwrite',recoveryOptions);
  const downloadsBefore=new Set(await readdir(downloads));
  await click('#save-export');
  const rawExport=await nextDownload(downloadsBefore,'raw corrupt profile export');
  const expectedRawBytes=Buffer.from(corruptRaw,'utf8');
  report.checks.rawCorruptExport={name:rawExport.name,text:rawExport.text,byteLength:rawExport.byteLength,
    expectedByteLength:expectedRawBytes.length,byteIdentical:rawExport.bytesBase64===expectedRawBytes.toString('base64')};
  check(rawExport.name.includes('profile-3-original')&&report.checks.rawCorruptExport.byteIdentical,
    'raw-corrupt-export-not-byte-identical',report.checks.rawCorruptExport);
  await click('#return-title'); await until('document.activeElement?.id === "title-start"','recovery return');
  await openMenu(); await click('#title-new'); await press('Escape');
  report.checks.corruptCancelled=await state();
  check(await evaluate(`localStorage.getItem('atf-v47-profile-3')===${JSON.stringify(corruptRaw)}`),'corrupt-confirm-cancel-overwrites',report.checks.corruptCancelled);
  await reloadPage();
  check(await evaluate(`localStorage.getItem('atf-v47-profile-3')===${JSON.stringify(corruptRaw)}`),'corrupt-unload-overwrites',await state());
  report.errors = errors; check(errors.length === 0,'browser-errors',errors); report.ok = report.issues.length === 0;
  await writeFile(resolve(output,'title-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({ok:report.ok,title:report.initial.title,issues:report.issues,checkGroups:Object.keys(report.checks),screenshots:report.screenshots,errors},null,2));
  if (!report.ok) process.exitCode = 1;
} catch(error) {
  report.failure = error.stack; report.errors = errors;
  try {report.lastState = await state(); await capture('failure.jpg');} catch {}
  await writeFile(resolve(output,'title-browser-failure.json'),JSON.stringify(report,null,2)+'\n');
  throw error;
} finally {
  try { await removeSimulatedPad(); } catch {}
  try { if(target) await cdp('Target.closeTarget',{targetId:target},true); if(context) await cdp('Target.disposeBrowserContext',{browserContextId:context},true); } catch {}
  socket.close();
}
