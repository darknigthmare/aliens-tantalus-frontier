import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, join, relative, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { WORLDS } from '../src/content.js';

// Genuine launch/import/save controls and keyboard input. Runtime observations
// below are read-only: no actor, objective, resource or engine flag is injected.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(process.env.ATF_JERI_QA_OUTPUT || '/tmp/atf-jeri-surface-v135');
const rel=relative(root,output);if(!rel || !rel.startsWith('..')&&!isAbsolute(rel))throw Error('Evidence belongs outside the checkout.');
const report={status:'running',checks:[],pageErrors:[],requestFailures:[],method:'A new profile with unlocked worlds is imported through the real Save picker. Jeri launches from Command. All poses, adhesion, progress, pause and save/reload use real UI/keyboard. No completion is claimed.'};
let browser,page;
const observation=()=>{
  const e=globalThis.__ATF_GAME__,p=e?.player;
  return e&&p?{running:e.running,paused:e.paused,loading:!!(e.enemyAtlasLoadingPausedV65||e.userCasteLoadingV88),operationId:e.hiveV131?.operationId,
    player:{x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,vy:p.vy,alive:p.alive,health:p.health,grounded:p.grounded,climbing:p.climbing},
    transit:structuredClone(p.playerTransitVisualV128),appearance:structuredClone(p.appearanceV126),surface:structuredClone(e.jeriSurfaceV135),hive:structuredClone(e.hiveV131),state:e.mission?.state,
    doors:e.doors?.map(d=>({id:d.id,open:d.open})),prompt:e.getInteractionPrompt?.()}:null;
};
const snapshot=()=>page.evaluate(observation);
async function check(name,data){report.checks.push({name,...data});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));console.log(name);}
async function capture(name){await page.locator('#game-canvas').screenshot({path:join(output,`${name}.png`)});}
async function hold(code,milliseconds){await page.keyboard.down(code);try{await page.waitForTimeout(milliseconds);}finally{await page.keyboard.up(code);}}
async function until(code,predicate,arg,timeout=10000){await page.keyboard.down(code);try{await page.waitForFunction(predicate,arg,{timeout});}finally{await page.keyboard.up(code);}}
async function main(){
  await fs.mkdir(output,{recursive:true});
  let pw;try{pw=await import('playwright');}catch{pw=createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules','__jeriqa__.cjs'))('playwright');}
  browser=await pw.chromium.launch({headless:true,executablePath:process.env.ATF_CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});
  page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',error=>report.pageErrors.push(error.message));
  page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  await page.goto(process.env.ATF_BASE_URL||'http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
  await page.locator('#title-start').click();await page.locator('#title-options').click();
  const save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='command';save.galaxy.unlockedWorldIds=WORLDS.map(w=>w.id);
  await page.locator('#save-import').setInputFiles({name:'jeri-new-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).last().waitFor();
  await page.locator('[data-view="command"]').click();await page.locator('#command-mission-v110').selectOption('special-jeri-v131');
  await page.locator('#operation-launch').click();
  for(let i=0;i<20;i++){
    if(await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running))break;
    const advance=page.locator('[data-insertion-action="advance"]');if(await advance.isVisible())await advance.click();await page.waitForTimeout(300);
  }
  await page.locator('#game-canvas').waitFor({state:'visible'});
  await page.waitForFunction(()=>{const e=globalThis.__ATF_GAME__;return e?.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88;},null,{timeout:45000});
  await page.locator('#game-canvas').focus();
  const start=await snapshot();assert.equal(start.operationId,'jeri-false-son');assert.equal(start.surface.mode,'free');
  await capture('01-insertion');
  await until('KeyD',()=>globalThis.__ATF_GAME__.player.x+21>=232);
  await until('KeyE',()=>globalThis.__ATF_GAME__.hiveV131.commissioned);
  await until('KeyD',()=>globalThis.__ATF_GAME__.player.x>=957.9);
  await page.waitForTimeout(150);const wall=await snapshot();assert.equal(wall.player.x,958);assert.deepEqual(wall.hive.inspections,[]);
  await hold('KeyW',300);assert.equal((await snapshot()).player.y,668,'An unlatched body does not fly up the shutter.');
  await page.keyboard.press('KeyV');assert.equal((await snapshot()).surface.face,'left');
  await hold('KeyW',550);const climbing=await snapshot();assert.ok(climbing.player.y<630&&climbing.player.y>482);assert.equal(climbing.player.x,958);assert.equal(climbing.transit?.kind,'climb','The modular articulated pose replaces the painted ladder fallback.');
  await capture('02-wall');await check('closed-shutter-wall-attachment',{start,wall,climbing});
  await page.keyboard.press('KeyE');const refused=await snapshot();assert.deepEqual(refused.hive.inspections,[]);assert.equal(refused.hive.channel,null);
  await until('KeyW',()=>globalThis.__ATF_GAME__.jeriSurfaceV135.face==='underside');
  await until('KeyA',()=>globalThis.__ATF_GAME__.player.x<800);
  const ceiling=await snapshot();assert.equal(ceiling.player.y,482);assert.equal(ceiling.surface.surfaceId,'hive-service');
  await capture('03-ceiling');
  await until('KeyD',()=>globalThis.__ATF_GAME__.player.x>=957.9);
  await hold('KeyD',250);assert.equal((await snapshot()).player.x,958,'Ceiling movement cannot cross a closed inspection gate.');
  await until('KeyA',()=>globalThis.__ATF_GAME__.player.x<800);
  await page.keyboard.press('KeyP');const paused=await snapshot();assert.equal(paused.paused,true);
  await hold('KeyD',300);await page.keyboard.press('KeyV');await page.keyboard.press('Space');
  const frozen=await snapshot();assert.deepEqual(frozen.player,paused.player);assert.deepEqual(frozen.surface,paused.surface);assert.deepEqual(frozen.hive,paused.hive);
  await capture('04-paused');await check('ceiling-gate-collision-and-pause',{ceiling,paused,frozen});
  await page.locator('#mission-save-v86').click();await page.getByText('Sauvegarde locale confirmée.',{exact:true}).last().waitFor();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#title-start').click();await page.locator('#title-continue').click();
  await page.locator('[data-view="command"]').click();await page.locator('#continue-operation').click();
  for(let i=0;i<20;i++){
    if(await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running))break;
    const advance=page.locator('[data-insertion-action="advance"]');if(await advance.isVisible())await advance.click();await page.waitForTimeout(250);
  }
  await page.locator('#game-canvas').waitFor({state:'visible'});
  await page.waitForFunction(()=>{const e=globalThis.__ATF_GAME__;return e?.running&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88;},null,{timeout:45000});
  await page.locator('#game-canvas').focus();
  let resumed=await snapshot();if(resumed.paused){await page.keyboard.press('KeyP');resumed=await snapshot();}
  assert.equal(resumed.surface.mode,'attached');assert.equal(resumed.surface.face,'underside');assert.equal(resumed.player.climbing,true);
  assert.ok(Math.abs(resumed.player.x-paused.player.x)<.01);assert.equal(resumed.player.y,482);assert.deepEqual(resumed.hive.inspections,[]);
  await capture('05-real-reload');await check('actual-save-and-reload-attached',{resumed});
  await page.keyboard.press('Space');await page.waitForFunction(()=>globalThis.__ATF_GAME__.player.grounded);
  const dropped=await snapshot();assert.equal(dropped.surface.mode,'free');assert.equal(dropped.player.y,668);assert.equal(dropped.player.alive,true);
  assert.deepEqual(dropped.hive.inspections,[]);assert.equal(dropped.hive.bossReleased,false);assert.equal(dropped.hive.rewardClaimed,false);
  await capture('06-release');await check('space-release-safe-fall-without-objective-credit',{dropped});
  // The native touch V button invokes the same toggleVehicle entry as KeyV.
  await until('KeyD',()=>globalThis.__ATF_GAME__.player.x>=957.9);
  await page.setViewportSize({width:640,height:900});await page.locator('#mission-vehicle').click();
  assert.equal((await snapshot()).surface.mode,'attached');await capture('07-native-touch-v');
  await page.locator('#mission-vehicle').click();await page.waitForFunction(()=>globalThis.__ATF_GAME__.jeriSurfaceV135.mode==='free');
  await page.setViewportSize({width:1600,height:1000});await page.locator('#game-canvas').focus();
  await page.waitForTimeout(400);await page.keyboard.press('KeyE');await page.waitForFunction(()=>globalThis.__ATF_GAME__.hiveV131.inspections.includes('inspection-worker'));
  const inspected=await snapshot();assert.equal(inspected.doors.find(d=>d.id==='hive-gate-worker').open,true);
  assert.equal(inspected.hive.complete,false);assert.equal(inspected.hive.rewardClaimed,false);await capture('08-inspection-required');
  await check('native-touch-toggle-and-physical-worker-inspection',{inspected});
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';
}
main().catch(async error=>{report.status='failed';report.failure={message:error.message,stack:error.stack,state:await snapshot().catch(()=>null)};await page?.screenshot({path:join(output,'failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;})
.finally(async()=>{report.finishedAt=new Date().toISOString();await fs.mkdir(output,{recursive:true});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await browser?.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,report:join(output,'report.json'),failure:report.failure?.message}));});
