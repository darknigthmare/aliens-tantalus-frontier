import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Private QA. Fresh browser context and QA-only save fixture; no combat state injection.
const base = process.env.APP_URL || 'http://127.0.0.1:4306';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v96-xeno-trials-20260926');
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:9266/json/version').then(r => r.json());
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map(), errors = [], responses = [], pressed = new Set();
const report = { ok: false, phase: process.env.QA_PHASE || 'full', browser: info.Browser, base, scope: [
  'Isolated browser storage. Default save fixture skips onboarding only in this QA context; not a full campaign walkthrough.',
  'Actual navigation click, form selection, keyboard movement and attacks, pause, completed duel, result persistence and reload.',
  'No fighter position/health, match result or clock injected. Read-only runtime snapshots. No public deployment claim.',
  'Service worker bypassed for this runtime test; separate precache contract tests cover modules.'
], checks: {}, errors };
ws.addEventListener('message', event => {
  const m = JSON.parse(event.data), request = pending.get(m.id);
  if (request) { pending.delete(m.id); clearTimeout(request.timer); m.error ? request.fail(Error(m.error.message)) : request.ok(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived') { const r = m.params.response; responses.push({ url: r.url, status: r.status }); if (r.status >= 400 && !r.url.endsWith('favicon.ico')) errors.push(r.status + ' ' + r.url); }
});
function cdp(method, params = {}, browser = false) { return new Promise((ok, fail) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); fail(Error('Timeout ' + method)); }, 30000);
  pending.set(id, { ok, fail, timer }); ws.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
}); }
async function read(expression) { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label, timeout = 30000) { const end = Date.now() + timeout; let last; while (Date.now() < end) { last = await read(expression); if (last) return last; await wait(80); } throw Error('Timeout ' + label + ' ' + JSON.stringify(last)); }
const special = { Home: ['Home',36], ArrowDown: ['ArrowDown',40], Enter: ['Enter',13], Tab: ['Tab',9], Space: [' ',32] };
async function key(code, down) { const [value, virtual] = special[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)]; await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: value, code, windowsVirtualKeyCode: virtual }); down ? pressed.add(code) : pressed.delete(code); }
async function press(code) { await key(code, true); await key(code, false); }
async function click(selector) {
  await read(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',behavior:'instant'})`); await wait(50);
  const b = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return {x,y,w:r.width,h:r.height,hit:h===e||e.contains(h)};})()`);
  assert.ok(b?.w && b?.h && b.hit, 'Clickable ' + selector + ': ' + JSON.stringify(b));
  await cdp('Input.dispatchMouseEvent', { type:'mousePressed',x:b.x,y:b.y,button:'left',buttons:1,clickCount:1 });
  await cdp('Input.dispatchMouseEvent', { type:'mouseReleased',x:b.x,y:b.y,button:'left',buttons:0,clickCount:1 }); await wait(60);
}
async function select(selector, value) { const index = await read(`[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(o=>o.value===${JSON.stringify(value)})`); assert.ok(index >= 0); await click(selector); await press('Home'); for (let n=0;n<index;n++) await press('ArrowDown'); await press('Enter'); await press('Tab'); assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`),value); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format:'png',captureBeyondViewport:false }); await writeFile(resolve(output, name + '.png'), Buffer.from(r.data,'base64')); }
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ check:name,ok:true })); }
const S = '__ATF_XENO_TRIALS_V96__.snapshot()';
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext',{},true));
  const { targetId } = await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);
  ({ sessionId:session } = await cdp('Target.attachToTarget',{targetId,flatten:true},true));
  for (const domain of ['Page','Runtime','Network']) await cdp(domain + '.enable');
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'globalThis.__QA_TRIALS_BOOT_V96__=crypto.randomUUID();'});
  await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:base+'/?qa=xeno-trials-v96'}); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_XENO_TRIALS_V96__&&!document.querySelector("#boot")','boot',60000);
  const boot = await read('({title:document.title,body:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]"),buttons:[...document.querySelectorAll("button")].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>e.textContent)})');
  assert.ok(boot.body>100 && !boot.overlay && boot.buttons.length); milestone('boot',boot); await capture('01-boot');
  if (process.env.QA_PHASE !== 'boot') {
    await read(`(async()=>{const {createDefaultSave}=await import('/src/save.js');const s=createDefaultSave();s.onboardingV84=null;s.openingV88=null;s.portMeridienV90=null;s.needsPlayerCreationV84=false;s.shipPortV1=null;s.scene='hub';__ATF_V51__.saveSystem.commit(s);__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');})()`);
    await click('[data-view="xenotrials"]');
    await until('document.querySelector("#xeno-trials-v96").classList.contains("active")','module');
    await until('[...document.querySelectorAll(".xt-portraits img")].every(i=>i.complete&&i.naturalWidth)','selected portraits');
    const roster = await read(`({progress:${S}.progress,count:document.querySelectorAll('.xt-fighter').length,images:[...document.querySelectorAll('.xt-fighter img')].map(i=>({src:i.currentSrc,w:i.naturalWidth,h:i.naturalHeight})),text:document.querySelector('.xt-notice').textContent})`);
    assert.equal(roster.count,33); assert.equal(roster.progress.unlocked.length,3); milestone('rosterAndDisclosure',roster); await capture('02-roster');
    await select('[data-xt="family"]','synthetic');
    assert.equal(await read('document.querySelectorAll(".xt-fighter").length'),9);
    await select('[data-xt="sort"]','name'); await capture('02b-synthetics');
    await select('[data-xt="family"]','all'); await select('[data-xt="sort"]','catalog');
    milestone('rosterFilters',{synthetics:9,total:33});
    if (report.phase !== 'layout') {
    await click('[data-xt-fighter="arachnoid"]'); await select('[name="playerVariant"]','purple');
    await until('document.querySelector("[data-xt-fighter=arachnoid] img").src.includes("arachnoid-purple")','purple preview');
    await select('[name="factionId"]','pursuit'); await select('[name="opponentId"]','runner'); await select('[name="difficulty"]','easy');
    assert.equal(await read(`${S}.progress.pending`),null);
    await click('[data-xt="confirm-fighters"]');
    assert.equal(await read('document.querySelector("[data-xt=arena-config]").hidden'),false);
    assert.equal(await read('document.querySelector("[data-xt=stable]").hidden'),true);
    await select('[name="stageId"]','reactor-ring'); await capture('02c-arena-selection');
    await click('[data-xt="back-fighters"]');
    assert.equal(await read('document.querySelector("[data-xt-fighter=arachnoid]").getAttribute("aria-pressed")'),'true');
    await click('[data-xt="confirm-fighters"]'); await select('[name="roundSeconds"]','60');
    await click('[data-xt="start"]');
    await until(`${S}.match?.presentation?.phase==='intro-player'`,'intro player');
    const intro=await read(`${S}.match`); assert.equal(intro.timeRemaining,60); assert.equal(intro.tick,0);
    await capture('02d-intro');
    await until(`${S}.match?.presentation?.phase==='intro-opponent'`,'intro opponent');
    await until(`${S}.match?.presentation?.phase==='countdown'`,'countdown');
    await click('[data-xt=pause]'); const frozen=await read(`${S}.match`); await wait(250);
    assert.deepEqual((await read(`${S}.match`)).presentation,frozen.presentation);
    assert.equal((await read(`${S}.match`)).timeRemaining,60); await click('[data-xt=pause]');
    await until(`${S}.match?.presentation?.phase==='active'`,'duel active');
    milestone('introCountdownPause',{first:intro.presentation,paused:frozen.presentation,roundSeconds:60});
    await click('[data-xt="canvas"]');
    const start = await read(S); assert.equal(start.progress.pending.config.playerVariant,'purple'); assert.equal(start.match.fighters[0].id,'arachnoid');
    await key('KeyD',true); await wait(300); await key('KeyD',false);
    const moved = await read(S); assert.ok(moved.match.fighters[0].x>start.match.fighters[0].x); milestone('keyboardMovement', {from:start.match.fighters[0].x,to:moved.match.fighters[0].x});
    await press('KeyP'); await until(`${S}.match.paused`,'pause');
    const paused=await read(`${S}.match`); await wait(350); const still=await read(`${S}.match`); assert.equal(paused.timeRemaining,still.timeRemaining); assert.deepEqual(paused.fighters,still.fighters); milestone('pauseFreezes',paused.timeRemaining); await capture('03-paused');
    await press('KeyP');
    const deadline=Date.now()+240000; let actions=0;
    while(Date.now()<deadline) {
      const s=await read(S); if(s.match?.phase==='match-over')break;
      if(s.match?.paused) await press('KeyP');
      if(s.match?.phase==='round-over') { await click('[data-xt="next"]'); await click('[data-xt="canvas"]'); }
      if(s.match?.phase==='active') {
        const direction=s.match.fighters[0].x<s.match.fighters[1].x?'KeyD':'KeyQ';
        const attack=actions%4===0?'KeyL':actions%2===0?'KeyK':'KeyJ';
        await key(direction,true); await key(attack,true); await wait(85); await key(attack,false);
        await wait(245); await key(direction,false); actions++;
      } else await wait(100);
    }
    for(const code of [...pressed])await key(code,false);
    const completed=await until(`${S}.match?.phase==='match-over'&&${S}.progress.pending===null&&${S}`,'saved result');
    assert.equal(completed.progress.ledger.length,1); assert.equal(completed.progress.wins+completed.progress.losses+completed.progress.draws,1);
    assert.ok(completed.match.result.playerStats.hits>0); milestone('realDuelSaved',{...completed,keyboardActions:actions});
    await capture('04-completed');
    const before=completed.progress, pageId=await read('globalThis.__QA_TRIALS_BOOT_V96__');
    await cdp('Page.reload',{ignoreCache:true});
    await until(`globalThis.__ATF_XENO_TRIALS_V96__&&globalThis.__QA_TRIALS_BOOT_V96__!==${JSON.stringify(pageId)}&&!document.querySelector('#boot')`,'reload');
    assert.deepEqual(await read(`${S}.progress`),before); milestone('reloadPersistsExactlyOnce',before);
    await read("__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings')"); await click('[data-view="xenotrials"]');
    await click('[data-xt="confirm-fighters"]'); await click('[data-xt="start"]'); await until(`${S}.match?.phase==='active'`,'second duel');
    const ticket=(await read(S)).progress.pending; assert.ok(ticket);
    await click('[data-view="settings"]'); assert.equal((await read(S)).match,null);
    await click('[data-view="xenotrials"]'); assert.equal((await read(S)).progress.pending.matchId,ticket.matchId);
    await click('[data-xt="abandon"]'); const abandoned=await read(S); assert.equal(abandoned.progress.pending,null); assert.equal(abandoned.progress.credits,before.credits); milestone('viewCleanupAndAbandon',abandoned.progress);
    }
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await read('document.querySelector("#xeno-trials-v96").scrollIntoView({block:"start",behavior:"instant"})'); await wait(150);
    const mobile=await read('({viewport:innerWidth,scroll:document.documentElement.scrollWidth,title:document.querySelector("#view-title").getBoundingClientRect().toJSON(),bar:document.querySelector(".topbar").getBoundingClientRect().toJSON(),controls:[...document.querySelectorAll("[data-xeno-action]")].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))})');
    assert.ok(mobile.scroll<=mobile.viewport+1); // Combat controls are intentionally hidden at the selection step.
    assert.ok(mobile.title.top>=mobile.bar.top && mobile.title.bottom<=mobile.bar.bottom,'header title must not overflow');
    milestone('mobileLayout',mobile); await capture('05-mobile');
  }
  assert.deepEqual(errors,[]); report.ok=true;
} catch(error) { report.failure=error.stack; try{await capture('failure');}catch{} throw error; }
finally {
  report.responses=responses;
  await writeFile(resolve(output,`browser-${report.phase}.json`),JSON.stringify(report,null,2));
  if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});
  ws.close();
}
