import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUMAN_VISUAL_CONTRACT_V133 } from '../src/human-visual-contract-v133.js';

// Real application and save picker, visible settings and native keyboard input.
// Browser evaluation only observes the resulting actors and published render
// geometry. No engine state, scene fixture or drawing method is injected.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(process.env.ATF_HUMAN_QA_OUTPUT||join(tmpdir(),`atf-human-v133-${Date.now()}`));
const rel=relative(root,output);if(!rel||!rel.startsWith('..')&&!isAbsolute(rel))throw Error('QA evidence must remain outside the checkout.');
const baseUrl=process.env.ATF_BASE_URL||'http://127.0.0.1:4173';
const report={status:'running',startedAt:new Date().toISOString(),checks:[],pageErrors:[],requestFailures:[],
  method:'Valid default save imported by native file picker; real hub and ordinary mission; native J1/J2 movement, crouch and pause; read-only render observations.'};
let browser,page;
async function playwright(){try{return await import('playwright');}catch(error){
  if(process.env.ATF_PLAYWRIGHT_MODULE)return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'__human_qa__.cjs'))('playwright');
  throw Error('Existing Playwright installation required',{cause:error});}}
const check=(label,evidence)=>report.checks.push({label,evidence});
const hubSnapshot=()=>page.evaluate(()=>{const e=globalThis.__ATF_HUB__;return {running:e.running,player:{x:e.player.x,y:e.player.y,w:e.player.w,h:e.player.h,
  visual:e.player.playerAppearanceVisualV126?.humanVisualV133},npcs:e.npcs.filter(a=>a.humanVisualV133).map(a=>({id:a.crewId||a.id,x:a.x,y:a.y,w:a.w,h:a.h,
    animation:a.v52Animation,visual:a.humanVisualV133})),camera:e.camera};});
const missionSnapshot=()=>page.evaluate(()=>{const e=globalThis.__ATF_GAME__;const pick=a=>({x:a.x,y:a.y,w:a.w,h:a.h,alive:a.alive,
  crouching:a.crouching,grounded:a.grounded,visual:a.playerAppearanceVisualV126?.humanVisualV133,locomotion:a.playerLocomotionVisualV129});
  return {running:e.running,paused:e.paused,time:e.animationTime,mission:e.mission.state,coopEnabled:e.coopEnabled,
    player:pick(e.player),coop:pick(e.coop),crew:e.activeSquadActors().map(a=>({id:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,alive:a.alive,
      visual:a.humanVisualV133})),camera:e.camera};});
function verifyHuman(subject,physicalHeight=92){assert.ok(subject.visual);assert.equal(subject.h,physicalHeight);assert.equal(subject.visual.standingHeight,HUMAN_VISUAL_CONTRACT_V133.standingHeight);
  assert.ok(Math.abs(subject.visual.pivot.y-subject.y-subject.h)<.05);
  if(subject.visual.scaleX!==undefined)assert.ok(Math.abs(subject.visual.scaleX-subject.visual.scaleY)<1e-8);
  if(subject.visual.visible)assert.ok(Math.abs(subject.visual.visible.y+subject.visual.visible.height-subject.y-subject.h)<.05);}
async function hold(code,predicate,value){await page.keyboard.down(code);try{await page.waitForFunction(predicate,value,{timeout:15000,polling:'raf'});}finally{await page.keyboard.up(code);}}
async function main(){await fs.mkdir(output,{recursive:true});const module=await playwright(),{chromium}=module.chromium?module:module.default;
  browser=await chromium.launch({headless:true,...(process.env.ATF_CHROMIUM_EXECUTABLE?{executablePath:process.env.ATF_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(25000);
  page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});await page.locator('#title-start').click({timeout:45000});await page.locator('#title-options').click();
  const save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='hub';
  await page.locator('#save-import').setInputFiles({name:'human-visual-default-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).waitFor();await page.locator('#setting-coop').check();
  await page.locator('[data-view="hub"]').click();await page.locator('#hub-canvas').waitFor({state:'visible'});
  await page.waitForFunction(()=>globalThis.__ATF_HUB__?.player?.playerAppearanceVisualV126?.drawn);
  await page.locator('#hub-canvas').focus();await hold('KeyD',()=>globalThis.__ATF_HUB__.player.x>=380);await page.waitForTimeout(350);
  let hub=await hubSnapshot();verifyHuman(hub.player);assert.ok(hub.npcs.length>=1);for(const npc of hub.npcs)verifyHuman(npc);
  await page.locator('#hub-canvas').screenshot({path:join(output,'01-hub-humans.png')});check('Hub marine and actual personnel share a grounded isotropic human reference',hub);
  await page.locator('#exit-hub').click();await page.locator('[data-view="command"]').click();
  await page.locator('#command-mission-v110').selectOption('pair-004-frontier');await page.locator('#operation-launch').click();
  for(let i=0;i<20;i++){if(await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running))break;
    const advance=page.locator('[data-insertion-action="advance"]');if(await advance.isVisible())await advance.click();await page.waitForTimeout(200);}
  await page.waitForFunction(()=>{const e=globalThis.__ATF_GAME__;return e?.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88
    &&e.player.grounded&&e.player.playerAppearanceVisualV126?.drawn&&e.coopEnabled&&e.coop?.playerAppearanceVisualV126?.drawn;},null,{timeout:45000});
  await page.locator('#game-canvas').focus();await page.keyboard.press('KeyC');const dock=page.locator('.squad-command-v132');await dock.waitFor({state:'visible'});
  await dock.locator('[data-squad-action="order"][data-squad-value="hold"]').click();await page.keyboard.press('Escape');
  await hold('KeyD',()=>globalThis.__ATF_GAME__.player.x>=335);await hold('KeyL',()=>globalThis.__ATF_GAME__.coop.x>=480);await page.waitForTimeout(300);
  let mission=await missionSnapshot();report.lastMissionObservation=mission;
  await page.locator('#game-canvas').screenshot({path:join(output,'02-mission-humans.png')});
  verifyHuman(mission.player);verifyHuman(mission.coop);assert.ok(mission.crew.length>=2);
  for(const member of mission.crew)verifyHuman(member,90);
  await page.locator('#game-canvas').screenshot({path:join(output,'02-mission-humans.png')});check('Native J1/J2 and deployed crew preserve stature, physics and their floor support',mission);
  await page.keyboard.down('KeyS');await page.waitForFunction(()=>globalThis.__ATF_GAME__.player.crouching&&globalThis.__ATF_GAME__.player.playerAppearanceVisualV126?.drawn);
  await page.waitForTimeout(150);const crouched=await missionSnapshot();verifyHuman(crouched.player);
  assert.ok(crouched.player.visual.poseHeight<mission.player.visual.poseHeight*.85);
  assert.equal(crouched.player.y+crouched.player.h,mission.player.y+mission.player.h);
  await page.locator('#game-canvas').screenshot({path:join(output,'03-native-crouch.png')});await page.keyboard.up('KeyS');
  await page.waitForFunction(()=>!globalThis.__ATF_GAME__.player.crouching);check('Native crouch shortens the visible posture with the same human scale and floor',crouched.player);
  await page.keyboard.press('KeyP');await page.waitForFunction(()=>globalThis.__ATF_GAME__.paused);const paused=await missionSnapshot();
  await page.waitForTimeout(300);const frozen=await missionSnapshot();assert.equal(frozen.time,paused.time);
  assert.deepEqual(frozen.player.visual,paused.player.visual);assert.deepEqual(frozen.coop.visual,paused.coop.visual);
  await page.keyboard.press('KeyP');await page.waitForFunction(()=>!globalThis.__ATF_GAME__.paused);check('Pause preserves the same geometry and resumes ordinary play',{time:paused.time});
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';
}
await main().catch(e=>{report.status='failed';report.error={message:e.message,stack:e.stack};process.exitCode=1;}).finally(async()=>{
  report.finishedAt=new Date().toISOString();await fs.mkdir(output,{recursive:true});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
  await browser?.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,error:report.error?.message,report:join(output,'report.json')}));
});
