import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Private, deterministic rendering fixture, NOT a claim of a full player journey.
// Uses unmodified real mission geometry, native images and production update/draw.
const base = process.env.APP_URL || 'http://127.0.0.1:4197';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v90-campaign-20260923/browser-private');
await mkdir(output, { recursive: true });
const info = await fetch(`http://127.0.0.1:${process.env.QA_CDP_PORT || 9239}/json/version`).then(r => r.json());
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', fail, { once: true }); });
let serial = 0, session, context;
const pending = new Map(), errors = [], report = { ok: false, base, browser: info.Browser,
  scope: 'Deterministic rendering fixture: actual mission geometry, actual production engine, manual time steps and player placement. Not a full input journey.', checks: [], screenshots: [], errors };
ws.addEventListener('message', event => {
  const m = JSON.parse(event.data), job = pending.get(m.id);
  if (job) { clearTimeout(job.timer); pending.delete(m.id); m.error ? job.reject(Error(m.error.message)) : job.resolve(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push(`${m.params.response.status} ${m.params.response.url}`);
});
function cdp(method, params = {}, browser = false) { return new Promise((resolveJob, reject) => {
  const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error('Timeout ' + method)); }, 30000);
  pending.set(id, { resolve: resolveJob, reject, timer }); ws.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function until(expression, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const r = await read(expression); if (r) return r; await new Promise(ok => setTimeout(ok, 80)); }
  throw Error('Condition timed out: ' + expression);
}
async function capture(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 92, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg');
}
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=behaviors-v90' });
  await until('globalThis.__ATF_V51__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")');
  assert.ok(await read('document.body.innerText.length>100&&!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")'));
  await capture('boot');
  await read(`(async()=>{const {GameEngine}=await import('/src/game-production-runtime.js');const {createDefaultSave}=await import('/src/save.js');
    const s=createDefaultSave();s.onboardingV84=null;s.openingV88=null;s.openingExerciseV89=null;s.needsPlayerCreationV84=false;s.scene='hub';
    __ATF_V51__.saveSystem.commit(s);__ATF_V61__.titleScreen.hide();__ATF_V51__.renderAll();__ATF_V51__.showView('play');__ATF_V51__.engine.stop();
    globalThis.__V90_EVENTS=[];globalThis.__V90_ENGINE=new GameEngine(document.querySelector('#game-canvas'),{onEvent:e=>__V90_EVENTS.push(e)});
  })()`);
  for (const basename of ['game_pathogen_queen', 'game_pathogen_runner']) {
    await read(`(async()=>{const {WORLDS,CAMPAIGNS,ENEMIES,LEVEL_SEEDS,WEAPONS}=await import('/src/content.js');
      const {ENEMY_USER_CAMPAIGN_V88}=await import('/src/enemy-user-campaign-v88.js');const {buildMissionLevelV52}=await import('/src/mission-levels-v52.js');
      const d=ENEMY_USER_CAMPAIGN_V88.find(d=>d.basename===${JSON.stringify(basename)}),world=WORLDS.find(w=>w.id===d.encounterWorldIds[0]);
      const campaign=CAMPAIGNS.find(c=>c.worldId===world.id&&!/survival|prologue/i.test(c.id))||CAMPAIGNS[0];
      const seed=ENEMY_USER_CAMPAIGN_V88.filter(d=>d.encounterWorldIds.includes(world.id)).findIndex(e=>e.id===d.id);
      const plan=buildMissionLevelV52({world,campaign,levelSeeds:LEVEL_SEEDS,templateId:'colony-multiroute',variant:0});
      const e=__V90_ENGINE;e.start({userCasteCampaignV88:true,operationId:'operation-0-browser-v90',world,campaign,seed,enemyCatalog:ENEMIES,weapon:WEAPONS[0],difficulty:'standard',levelSeed:{...plan.levelSeed,seed},missionLevel:plan});
      e.running=false;globalThis.__V90_ACTOR=e.enemies.find(a=>a.profileId===d.id);globalThis.__V90_DEF=d;
    })()`);
    await until('!__V90_ENGINE.refreshUserCasteLoadingV88()');
    await read(`(()=>{const e=__V90_ENGINE,a=__V90_ACTOR,p=e.player,d=__V90_DEF,gap=d.basename.includes('queen')?210:65;
      Object.assign(p,{x:a.x+a.w/2-gap-p.w/2,y:a.y+a.h-p.h,armor:0,health:100,inCover:false,grounded:true,facing:1});
      a.userCasteCombatV89.clock=0;e.camera.x=Math.max(0,Math.min(a.x-650,e.missionLevelBounds.width-1280));
      e.camera.y=Math.max(0,Math.min(a.y+a.h-620,e.missionLevelBounds.height-720));
      e.updateEnemy(a,.01);e.draw();document.querySelector('#game-canvas').scrollIntoView({block:'center'});
    })()`);
    assert.equal(await read('__V90_ACTOR.userCasteCombatV89.phase'), 'windup');
    assert.ok(await read('__V90_ACTOR.x>=__V90_ENGINE.camera.x&&__V90_ACTOR.x+__V90_ACTOR.w<__V90_ENGINE.camera.x+1280&&__V90_ACTOR.y>=__V90_ENGINE.camera.y&&__V90_ACTOR.y+__V90_ACTOR.h<__V90_ENGINE.camera.y+720'), 'Actor must be in the captured camera');
    await capture(basename + '-telegraph');
    await read(`(()=>{const e=__V90_ENGINE,a=__V90_ACTOR;for(let t=0;t<__V90_DEF.behaviorContractV90.windup+.001;t+=.01)e.updateEnemy(a,.01);e.draw();})()`);
    await capture(basename + '-impact');
    if (basename.includes('queen')) {
      assert.equal(await read('__V90_ENGINE.userCasteEffectsV89.length'), 3);
      await read('for(let i=0;i<45;i++)__V90_ENGINE.updateHostileProjectiles(.01);__V90_ENGINE.draw()');
      await capture('queen-three-globs-in-flight');
      await read('for(let i=0;i<65;i++)__V90_ENGINE.updateHostileProjectiles(.01);__V90_ENGINE.draw()');
      await capture('queen-spent-no-pool');
      assert.equal(await read('__V90_ENGINE.userCasteEffectsV89.length'), 0);
    }
    const check = await read('({id:__V90_ACTOR.id,alive:__V90_ACTOR.alive,health:__V90_ENGINE.player.health,phase:__V90_ACTOR.userCasteCombatV89.phase,effects:__V90_ENGINE.userCasteEffectsV89.map(e=>e.kind),nativeLoaded:!__V90_ENGINE.userCasteLoadingV88})');
    assert.ok(check.health < 100); report.checks.push(check); console.log(JSON.stringify(check));
    if (basename.includes('runner')) {
      const movement = await read(`(()=>{const e=__V90_ENGINE,a=__V90_ACTOR,p=e.player;
        Object.assign(p,{x:a.x-240,y:a.y+a.h-p.h});a.userCasteCombatV89.clock=2;
        globalThis.__V90_GAIT_START=a.x;const x=[];for(let i=0;i<16;i++){e.updateEnemy(a,.05);x.push(a.x)}e.draw();
        return {start:__V90_GAIT_START,positions:x,stride:a.userCasteCombatV89.strideStep};})()`);
      assert.ok(movement.positions.at(-1) < movement.start);
      assert.ok(movement.positions.some((x,i)=>i&&x===movement.positions[i-1]));
      report.checks.push({ gait: movement }); await capture('runner-grounded-irregular-gait');
    }
  }
  assert.deepEqual(errors, []); report.ok = true;
} catch (e) { report.failure = { message: e.message }; try { await capture('failure'); } catch {} throw e;
} finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  try { if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true); } catch {}
  ws.close();
}
console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, screenshots: report.screenshots.length, output }));
