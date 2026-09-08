import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:57239';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4176/';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v77-browser-qa');
const info = await fetch(`${endpoint}/json/version`).then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
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
async function until(expression, label, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await evaluate(expression)) return; await wait(40); }
  throw new Error(`Audio settings timeout: ${label}; ${errors.join('; ')}`);
}
async function pointFor(selector) {
  return evaluate(`(() => {
    const element=document.querySelector(${JSON.stringify(selector)}); if(!element) throw new Error('Missing UI element');
    element.scrollIntoView({block:'center',behavior:'instant'}); const r=element.getBoundingClientRect();
    const x=r.left+r.width/2,y=r.top+r.height/2;
    if(!(r.width>0&&r.height>0)||document.elementFromPoint(x,y)!==element) throw new Error('UI element is not accessible: '+element.id);
    return {x,y};
  })()`);
}
async function click(selector) {
  const point = await pointFor(selector);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
}
async function key(code, key = code) {
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
}
async function range(selector, steps) {
  await click(selector); await key('Home');
  for (let index=0; index<steps; index++) await key('ArrowRight');
  return evaluate(`Number(document.querySelector(${JSON.stringify(selector)}).value)`);
}
async function snapshot() {
  return evaluate(`(() => {
    const a=__ATF_AUDIO_V77__,s=__ATF_V51__.saveSystem.data.settings;
    return {panel:document.querySelector('.view.active')?.dataset.panel,scene:a.scene,
      volumes:{...a.volumes},saved:{effects:s.effects,music:s.music},
      controls:{effects:Number(document.querySelector('#setting-effects').value),music:Number(document.querySelector('#setting-music').value)},
      contextState:a.context?.state||null,manifestStatus:a.manifestStatus,
      musicSources:Object.values(a.manifest.tracks.music).reduce((count,track)=>count+track.sources.length,0),
      musicVoices:a.musicVoices.size,musicStatus:a.musicStatus,effectVoices:a.effectVoices.size,timers:a.timers.size};
  })()`);
}
async function options() {
  await until(`Boolean(globalThis.__ATF_AUDIO_V77__&&globalThis.__ATF_V61__&&!document.querySelector('#boot'))`, 'application ready');
  await click('#title-start');
  await until(`!document.querySelector('#title-menu').hidden`, 'title menu');
  await click('#title-options');
  await until(`document.querySelector('.view.active')?.dataset.panel==='settings'&&__ATF_AUDIO_V77__.context?.state==='running'`, 'settings opened after trusted gesture');
  // Silence the test output at a separate final gain. The actual settings/master gains remain intact.
  await evaluate(`(() => {const a=__ATF_AUDIO_V77__,sink=a.context.createGain();sink.gain.value=0;a.master.disconnect();a.master.connect(sink);sink.connect(a.context.destination);globalThis.__QA_AUDIO_SILENT_SINK_V77__=sink;return true;})()`);
}
const report = {ok:false,url:appUrl,scope:'Real application, isolated browser storage. Trusted mouse/keyboard slider input and reload persistence. Controlled mission setup and production showView transitions (not a walked campaign). Delayed alarm scheduled by the actual director; final audio bank absent. Test output muted via a separate final gain.'};
try {
  await mkdir(output,{recursive:true});
  ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));
  ({targetId:target}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true));
  ({sessionId:session}=await cdp('Target.attachToTarget',{targetId:target,flatten:true},true));
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,mobile:false,deviceScaleFactor:1});
  await cdp('Page.navigate',{url:`${appUrl}?qa=audio-settings-v77-${Date.now()}`});
  await options();
  report.initial=await snapshot();
  assert.equal(report.initial.scene,'menu');
  assert.equal(await range('#setting-effects',5),0.25);
  const before=await snapshot();
  assert.equal(await range('#setting-music',16),0.8);
  report.changed=await snapshot();
  assert.equal(report.changed.volumes.music,0.8);assert.equal(report.changed.saved.music,0.8);
  assert.equal(report.changed.volumes.effects,0.25);assert.equal(report.changed.saved.effects,0.25);
  assert.equal(report.changed.volumes.effects,before.volumes.effects);
  assert.equal(await range('#setting-music',0),0);
  report.muted=await snapshot();
  assert.equal(report.muted.volumes.effects,0.25);assert.equal(report.muted.volumes.music,0);
  assert.equal(await range('#setting-music',16),0.8);
  const screenshot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:72,captureBeyondViewport:false});
  await writeFile(resolve(output,'audio-settings.jpg'),Buffer.from(screenshot.data,'base64'));
  await cdp('Page.reload',{ignoreCache:true});
  await until(`document.readyState==='complete'&&Boolean(globalThis.__ATF_AUDIO_V77__)&&!document.querySelector('#boot')&&!document.querySelector('#title-screen').hidden`, 'fresh application after reload');
  report.reloadedBeforeGesture=await snapshot();
  assert.equal(report.reloadedBeforeGesture.contextState,null);
  await options();
  report.persisted=await snapshot();
  assert.deepEqual(report.persisted.saved,{effects:0.25,music:0.8});
  assert.deepEqual(report.persisted.controls,{effects:0.25,music:0.8});
  assert.equal(report.persisted.volumes.effects,0.25);assert.equal(report.persisted.volumes.music,0.8);
  await evaluate(`(async () => {
    const c=await import('/src/content.js'),g=__ATF_GAME__,w=c.WORLDS.find(x=>x.biomes.includes('industrial'))||c.WORLDS[0];
    __ATF_V51__.showView('play');
    const options={seed:770078,world:w,crew:c.CREW,vehicle:c.VEHICLES.find(x=>x.family==='ground'),
      campaign:{...c.CAMPAIGNS[0],id:'browser-audio-v77',worldId:w.id,objective:'restore atmospheric processing'},
      levelSeed:{...c.LEVEL_SEEDS[0],id:'browser-audio-level-v77',seed:770078,worldId:w.id,objective:'restore atmospheric processing'},
      enemyCatalog:c.ENEMIES.slice(0,52),weapon:c.WEAPONS[0],difficulty:'standard'};
    g.start(options);
    g.enemies=[];g.hazards=[];g.squadActors=[];g.hostileProjectiles=[];g.setCoop(false);g.paused=false;
    const a=__ATF_AUDIO_V77__,oldTone=a.tone.bind(a),q=globalThis.__QA_AUDIO_SETTINGS_V77__={tones:[],options};
    a.tone=(frequency,...args)=>{q.tones.push({frequency,scene:a.scene,time:performance.now()});return oldTone(frequency,...args);};
    return true;
  })()`);
  await until(`__ATF_GAME__.running&&__ATF_AUDIO_V77__.scene==='mission'`, 'actual mission running');
  report.transitions=[];
  for(const destination of ['operations','settings']) {
    report.transitions.push(await evaluate(`(() => {
      const a=__ATF_AUDIO_V77__,q=__QA_AUDIO_SETTINGS_V77__,g=__ATF_GAME__;__ATF_V51__.showView('play');
      if(!g.running){g.start(q.options);g.enemies=[];g.hazards=[];g.squadActors=[];g.hostileProjectiles=[];g.setCoop(false);g.paused=false;}
      q.tones=[];
      a.alarm();const scheduled={timers:a.timers.size,voices:a.effectVoices.size,tones:q.tones.slice(),scene:a.scene,running:g.running};
      __ATF_V51__.showView(${JSON.stringify(destination)});
      return {destination:${JSON.stringify(destination)},scheduled,after:{scene:a.scene,timers:a.timers.size,voices:a.effectVoices.size,running:__ATF_GAME__.running}};
    })()`));
    const transition=report.transitions.at(-1);
    assert.equal(transition.scheduled.scene,'mission');assert.equal(transition.scheduled.running,true);assert.equal(transition.scheduled.timers,1);
    assert.equal(transition.scheduled.tones.length,1);assert.equal(transition.scheduled.tones[0].frequency,160);
    assert.deepEqual(transition.after,{scene:'menu',timers:0,voices:0,running:false});
    await wait(450);
    transition.settled=await evaluate(`({scene:__ATF_AUDIO_V77__.scene,tones:__QA_AUDIO_SETTINGS_V77__.tones,timers:__ATF_AUDIO_V77__.timers.size,voices:__ATF_AUDIO_V77__.effectVoices.size})`);
    assert.equal(transition.settled.scene,'menu');assert.equal(transition.settled.tones.length,1);
    assert.equal(transition.settled.timers,0);assert.equal(transition.settled.voices,0);
  }
  await click('[data-view="operations"]');
  assert.equal((await snapshot()).scene,'menu');
  await click('[data-view="settings"]');
  report.final=await snapshot();
  assert.equal(report.final.panel,'settings');assert.equal(report.final.scene,'menu');
  assert.deepEqual(report.final.saved,{effects:0.25,music:0.8});
  assert.equal(report.final.musicSources,0);assert.equal(report.final.musicVoices,0);
  assert.deepEqual(errors,[]);
  report.errors=errors;report.ok=true;
  await writeFile(resolve(output,'audio-settings-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} catch(error) {
  report.failure=error.stack;report.errors=errors;
  try {report.lastState=await snapshot();} catch {}
  await writeFile(resolve(output,'audio-settings-browser-failure.json'),JSON.stringify(report,null,2)+'\n');
  throw error;
} finally {
  try {if(target) await cdp('Target.closeTarget',{targetId:target},true);if(context) await cdp('Target.disposeBrowserContext',{browserContextId:context},true);} catch {}
  socket.close();
}
