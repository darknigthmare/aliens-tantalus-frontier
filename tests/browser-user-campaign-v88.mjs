import { ENEMY_ADDITIONAL_POSES_V94 as ADDITIONAL } from '../src/enemy-additional-poses-v94.js';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ENEMY_USER_CASTES_V87 } from '../src/enemy-user-castes-v87.js';

// Private browser proof. Keep this harness and every QA artifact out of public releases.
const base = process.env.APP_URL || 'http://127.0.0.1:4197';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v88-campaign-20260923/browser-private', process.env.QA_RUN || 'run-01');
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
async function canvasFocus() { await read("document.querySelector('#game-canvas').focus({preventScroll:true})"); }
async function holdUntil(code, expression, label, timeout = 12000) {
  await key(code, true); try { await until(expression, label, timeout); } finally { await key(code, false); }
}
const R = '__ATF_V51__.engine';
const NEW = 'castes-film_warrior_aliens_1986', OLD = 'enemy-005-warrior';
const report = { ok:false, base, browser:info.Browser, scope:[
  'Fresh Chromium context. One initial default-save fixture disables onboarding/opening and selects a source-compatible Acheron operation/serial; launch uses the actual application campaign handler.',
  'Insertion, movement, shooting, pause, save, encyclopedia search and page reload use real browser input. The shipped QA view API opens the encyclopedia from a paused mission; no actor, health, ammo or discovery injection.',
  'All35 encyclopedia records are rendered; one real campaign demonstrates native contact and discovery persistence. Exhaustive reachability/combat/geometry is covered separately by production-engine tests.'
],checks:{},screenshots:[],errors};
function milestone(name,data){report.checks[name]=data;console.log(JSON.stringify({stage:name,ok:true}));}
async function capture(name){const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:90,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(r.data,'base64'));report.screenshots.push(name+'.jpg');}
async function boot(){await until('!globalThis.__QA_OLD_DOCUMENT_V88__&&globalThis.__ATF_V51__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','boot',60000);}
async function query(text){await click('#enemy-search');await press('KeyA',0,2);await cdp('Input.insertText',{text});await wait(120);}
async function pause(){await canvasFocus();if(!await read(`${R}.paused`))await press('KeyP');await until(`${R}.paused`,'pause');}
async function resume(){await canvasFocus();if(await read(`${R}.paused`))await press('KeyP');await until(`!${R}.paused`,'resume');}
const actors = `${R}.enemies.filter(e=>e.campaignCasteV88).map(e=>({id:e.id,profileId:e.profileId,x:e.x,y:e.y,health:e.health,alive:e.alive,animationStatus:e.animationStatus,image:e.visualImageKey}))`;
const observer = `(()=>{const f=CanvasRenderingContext2D.prototype.drawImage;globalThis.__QA_NATIVE_DRAWS_V88__={};CanvasRenderingContext2D.prototype.drawImage=function(i,...a){if(this.canvas.id==='game-canvas'&&i?.src&&${JSON.stringify(ENEMY_USER_CASTES_V87.map(d => d.path))}.includes(new URL(i.src,location.href).pathname)){const d=__QA_NATIVE_DRAWS_V88__[i.src]||={count:0,args:[],facings:[]};d.count++;if(!d.args.includes(a.length))d.args.push(a.length);const v=Math.sign(this.getTransform().a);if(!d.facings.includes(v))d.facings.push(v);}return Reflect.apply(f,this,[i,...a]);};})()`;
try{
  ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));
  const {targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);
  ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));
  for(const domain of ['Page','Runtime','Network'])await cdp(domain+'.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Page.addScriptToEvaluateOnNewDocument',{source:observer});
  await viewport(1440,900);await cdp('Page.navigate',{url:base+'/?qa=campaign-castes-v88'});await boot();
  assert.ok(await read('document.body.innerText.trim().length>100&&!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")'));
  await capture('boot');milestone('boot',{loaded:true});
  const fixture=await read(`(async()=>{const {createDefaultSave}=await import('/src/save.js');const {WORLDS,CAMPAIGNS,LEVEL_SEEDS}=await import('/src/content.js');const {buildMissionLevelV52}=await import('/src/mission-levels-v52.js');const {ENEMY_USER_CAMPAIGN_V88}=await import('/src/enemy-user-campaign-v88.js');const s=createDefaultSave();s.onboardingV84=null;s.openingV88=null;s.needsPlayerCreationV84=false;s.scene='hub';s.shipPortV1=null;const world=WORLDS[0],c=CAMPAIGNS.find(c=>c.worldId===world.id&&!c.specialOperationId);const level=buildMissionLevelV52({world,campaign:c,levelSeeds:LEVEL_SEEDS,variant:0});const list=ENEMY_USER_CAMPAIGN_V88.filter(d=>d.encounterWorldIds.includes(world.id)),i=list.findIndex(d=>d.id==='${NEW}');s.strategy.serial=(i-level.levelSeed.seed-1)%list.length;if(s.strategy.serial<0)s.strategy.serial+=list.length;s.strategy.plannedCampaignId=c.id;__ATF_V51__.saveSystem.commit(s);__ATF_V61__.titleScreen.hide();__ATF_V51__.renderAll();__ATF_V51__.showView('bestiary');return {campaignId:c.id,worldId:world.id,seed:level.levelSeed.seed,serial:s.strategy.serial};})()`);
  milestone('campaignFixture',fixture);
  const previews=[];
  for(const d of ENEMY_USER_CASTES_V87){
    await query(d.id);await until(`document.querySelector('[data-catalog-entry="${d.id}"]')`,'encyclopedia '+d.id);await click(`[data-catalog-entry="${d.id}"]`);
    const p=await until(`(()=>{const root=document.querySelector('#enemy-catalog-detail'),i=root.querySelector('[data-visual-mode="static-pose"] img');return i?.complete&&i.naturalWidth?{id:'${d.id}',src:i.currentSrc||i.src,width:i.naturalWidth,height:i.naturalHeight,fit:getComputedStyle(i).objectFit,text:root.innerText,discovery:root.querySelector('[data-discovery-status]')?.dataset.discoveryStatus}:null;})()`,'native PNG '+d.id);
    assert.equal(new URL(p.src).pathname,d.path);assert.equal(p.width,d.sourceWidth);assert.equal(p.height,d.sourceHeight);assert.equal(p.fit,'contain');assert.equal(p.discovery,'undiscovered');assert.match(p.text,/Pose fixe native.*animations manquantes/);previews.push({id:p.id,src:p.src,width:p.width,height:p.height});
  }
  milestone('all35Encyclopedia',previews);await query(OLD);assert.match(await read("document.querySelector('#enemy-catalog-detail').innerText"),/Altered/);await capture('encyclopedia-old-altered');
  assert.equal(await read(`__ATF_V51__.launchCampaign()`),true);
  for(let i=0;i<10&&!await read(`${R}.running`);i++){
    await until('document.querySelector("[data-insertion-action=advance]")&&!document.querySelector("[data-insertion-action=advance]").disabled','insertion advance',20000);
    await click('[data-insertion-action=advance]');await wait(150);
  }
  await until(`${R}.running&&!${R}.userCasteLoadingV88`,'native campaign loaded');await canvasFocus();
  const starting=await read(actors);assert.ok(starting.some(a=>a.profileId===NEW));assert.ok(starting.length<=2);milestone('realMissionContacts',starting);
  await capture('mission-start');
  await holdUntil('KeyD',`Boolean(__ATF_V51__.saveSystem.data.enemyDiscoveryV88.entries['${NEW}']?.seen)`,'physical discovery',20000);
  await capture('native-campaign-unpaused');
  await read(`(()=>{const r=${R},original=r.applyEnemyDamage;globalThis.__QA_CASTE_HITS_V88__=[];r.applyEnemyDamage=function(e,n,s){const hp=e?.health,result=Reflect.apply(original,this,[e,n,s]);if(e?.campaignCasteV88&&s?.owner===this.player&&result>0)__QA_CASTE_HITS_V88__.push({profileId:e.profileId,before:hp,after:e.health,damage:result});return result;};})()`);
  await key('KeyF',true);try{await holdUntil('KeyD','__QA_CASTE_HITS_V88__.length>0','physical native impact',10000);}finally{await key('KeyF',false);}
  await capture('native-campaign-combat');await pause();
  const hits=await read(`({hits:__QA_CASTE_HITS_V88__,shots:${R}.player.shots})`);assert.ok(hits.shots>0&&hits.hits[0].before>hits.hits[0].after);milestone('physicalNativeCombat',hits);
  await pause();const discovered=await read(`__ATF_V51__.saveSystem.data.enemyDiscoveryV88.entries['${NEW}']`);assert.equal(discovered.seen,true);milestone('physicalDiscovery',discovered);await capture('native-campaign-contact');
  const drawn=await read('__QA_NATIVE_DRAWS_V88__');assert.ok(Object.keys(drawn).some(k=>k.includes('film_warrior_aliens_1986')));assert.ok(Object.values(drawn).every(d=>d.args.every(n=>n===4)));milestone('nativeFullPngDraw',drawn);
  await click('#mission-save-v86');const saved=await read(`({operation:__ATF_V51__.saveSystem.data.strategy.currentOperation,discovery:__ATF_V51__.saveSystem.data.enemyDiscoveryV88,actors:${actors}})`);
  assert.ok(saved.operation.resumeState.userCasteCampaignV88.entries.some(e=>e.profileId===NEW));milestone('savedNativeManifest',saved.operation.resumeState.userCasteCampaignV88);
  await read("__ATF_V51__.showView('bestiary')");await query(NEW);await click(`[data-catalog-entry="${NEW}"]`);assert.equal(await read("document.querySelector('#enemy-catalog-detail [data-discovery-status]').dataset.discoveryStatus"),'observed');await capture('encyclopedia-discovered');
  assert.match(await read("document.querySelector('#enemy-count-v88').textContent"),new RegExp(`^${606 + ADDITIONAL.length} DOSSIERS`));
  await viewport(390,844);await read("document.querySelector('#enemy-catalog-detail').scrollIntoView({block:'start',behavior:'instant'})");await capture('encyclopedia-mobile');assert.ok(await read('document.documentElement.scrollWidth<=innerWidth+1'));await viewport(1440,900);
  await read('globalThis.__QA_OLD_DOCUMENT_V88__=true');await cdp('Page.reload',{ignoreCache:true});await boot();
  const restored=await read('__ATF_V51__.saveSystem.data');assert.deepEqual(restored.enemyDiscoveryV88,saved.discovery);assert.equal(restored.strategy.currentOperation.id,saved.operation.id);
  await read("__ATF_V61__.titleScreen.hide()");assert.equal(await read('__ATF_V51__.launchCampaign()'),true);await until(`${R}.running&&!${R}.userCasteLoadingV88`,'restored mission');await pause();
  const final=await read(`({actors:${actors},result:${R}.lastResumeResult,manifest:${R}.userCasteCampaignV88})`);assert.equal(final.result.applied,true);assert.deepEqual(final.actors.map(a=>a.id),saved.actors.map(a=>a.id));assert.deepEqual(final.manifest,saved.operation.resumeState.userCasteCampaignV88);milestone('reloadSameOperationAndIdentities',final);await capture('mission-reloaded');
  assert.deepEqual(errors,[]);report.ok=true;console.log(JSON.stringify({ok:true,checks:Object.keys(report.checks).length,output}));
}catch(error){report.failure={message:error.message,stack:error.stack};try{report.last=await read(`({text:document.body.innerText,player:${R}?.player,actors:${actors},operation:__ATF_V51__.saveSystem.data.strategy.currentOperation})`);await capture('failure');}catch{}throw error;
}finally{
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
  for(const code of pressed)try{await key(code,false);}catch{}
  try{if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true);}catch{}socket.close();
}
