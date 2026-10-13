import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createDefaultSave } from '../src/save.js';

// Production UI, imported legacy profile and real keyboard controls. All game
// evaluations below are observations; no engine property or method is changed.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_OPERATIONS_QA_OUTPUT || join(tmpdir(), `atf-operations-v131-${Date.now()}`));
const rel = relative(root, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the repository.');
const operations = ['jeri-false-son','atax-false-queen','eloise-uncrowned-queen','protocol-z110','titan-equalizer',
  'queen-mother-song','hive-world','pangaea-second-extinction','mire-archive-001','black-abyss','broodstorm'];
const report = { startedAt:new Date().toISOString(), status:'running', checks:[], failures:[], pageErrors:[], requestFailures:[],
  method:'Each chapter launches from the real Command picker after a legacy profile is imported through Save. The fixture unlocks routes in the imported profile. Mission state, positions, actors and results are never injected.' };
let browser, page;
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); }
  catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'__operations_qa__.cjs'))('playwright');
    throw Error('An existing Playwright and Chromium installation is required.',{cause:error});
  }
}
function observation() {
  const e=globalThis.__ATF_GAME__, p=e?.player;
  if (!p) return null;
  const states=[e.hiveV131,e.mechaMissionV131,e.ecosystemV131,e.legacyMissionV131].filter(Boolean);
  const owned=states[0];
  return { campaignId:e.campaign?.id, operationId:owned?.operationId, running:e.running, paused:e.paused,
    loading:!!(e.enemyAtlasLoadingPausedV65||e.userCasteLoadingV88), state:e.mission?.state,
    player:{x:p.x,y:p.y,w:p.w,h:p.h,alive:p.alive,health:p.health,grounded:p.grounded,shots:p.shots,inVehicle:p.inVehicle},
    vehicle:e.vehicle && {x:e.vehicle.x,y:e.vehicle.y,w:e.vehicle.w,h:e.vehicle.h,hull:e.vehicle.hull},
    mission:owned && structuredClone(owned), actors:e.enemies?.length, prompt:e.getInteractionPrompt?.(),
    bounds:e.missionLevelBounds, activeOperationIds:states.map(state=>state.operationId) };
}
const snapshot = () => page.evaluate(observation);
async function launch(operationId) {
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});
  page=await context.newPage(); page.setDefaultTimeout(20000);
  page.on('pageerror',error=>report.pageErrors.push({operationId,message:error.message}));
  page.on('requestfailed',request=>report.requestFailures.push({operationId,url:request.url(),error:request.failure()?.errorText}));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  await page.locator('#title-start').click({timeout:45000}); await page.locator('#title-options').click();
  const save=createDefaultSave(); save.needsPlayerCreationV84=false; save.scene='command';
  save.galaxy.unlockedWorldIds=WORLDS.map(world=>world.id);
  const campaign=CAMPAIGNS.find(entry=>entry.specialOperationId===operationId);
  assert.ok(campaign,operationId);
  await page.locator('#save-import').setInputFiles({name:'operations-qa-legacy-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).waitFor();
  await page.locator('[data-view="command"]').click();
  await page.locator('#command-mission-v110').selectOption(campaign.id);
  await page.locator('#operation-launch').click();
  for (let index=0;index<20;index++) {
    if (await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running)) break;
    const advance=page.locator('[data-insertion-action="advance"]');
    if (await advance.isVisible()) await advance.click();
    await page.waitForTimeout(300);
  }
  await page.locator('#game-canvas').waitFor({state:'visible'});
  await page.waitForFunction(()=>{const e=globalThis.__ATF_GAME__;return e?.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88;},null,{timeout:45000});
  await page.locator('#game-canvas').focus();
  return context;
}
async function moveRightTo(centerX) {
  const before=await snapshot();
  if (before.player.x+before.player.w/2>=centerX-10) return;
  await page.keyboard.down('KeyD');
  try { await page.waitForFunction(target=>{const p=globalThis.__ATF_GAME__.player;return p.x+p.w/2>=target-8;},centerX,{timeout:5000}); }
  finally { await page.keyboard.up('KeyD'); }
}
async function hold(code, milliseconds) {
  await page.keyboard.down(code);
  try { await page.waitForTimeout(milliseconds); } finally { await page.keyboard.up(code); }
}
async function holdUntil(code, condition, argument) {
  await page.keyboard.down(code);
  try { await page.waitForFunction(condition,argument,{timeout:15000}); }
  finally { await page.keyboard.up(code); }
}
async function scenario(operationId,index) {
  let context;
  try {
    context=await launch(operationId);
    const initial=await snapshot();
    assert.equal(initial.operationId,operationId); assert.deepEqual(initial.activeOperationIds,[operationId]);
    assert.equal(initial.state,'active'); assert.equal(initial.mission.complete,false); assert.equal(initial.mission.rewardClaimed,false);
    assert.ok(initial.bounds.width>0); assert.ok(initial.player.alive);
    await page.locator('#game-canvas').screenshot({path:join(output,`${String(index+1).padStart(2,'0')}-${operationId}-start.png`)});
    if (['jeri-false-son','atax-false-queen','eloise-uncrowned-queen'].includes(operationId)) {
      await moveRightTo(240);
      await holdUntil('KeyE',()=>globalThis.__ATF_GAME__.hiveV131.commissioned);
      assert.equal((await snapshot()).mission.commissioned,true,'The physical interface must finish after held E.');
      await holdUntil('KeyC',()=>document.querySelector('.hive-command-v131')?.hidden===false);
      const dock=page.locator('.hive-command-v131'); await dock.waitFor({state:'visible'});
      if (operationId==='jeri-false-son') {
        const profile=dock.locator('[data-hive-command-action="profile"]:not([disabled])').first();
        const selected=await profile.getAttribute('data-hive-command-value');
        await profile.click(); assert.equal((await snapshot()).mission.profile,selected);
      } else if (operationId==='eloise-uncrowned-queen') {
        await dock.locator('[data-hive-command-action="consciousness"][data-hive-command-value="hybrid"]').click();
        assert.equal((await snapshot()).mission.consciousness,'hybrid');
      } else {
        assert.equal(await dock.locator('[data-hive-command-action="order"]').first().isDisabled(),true,'Orders require a living recruited actor.');
      }
      await page.screenshot({path:join(output,`${String(index+1).padStart(2,'0')}-${operationId}-commands.png`),fullPage:true});
      await dock.locator('[data-hive-command-action="close"]').click();
      await page.locator('#game-canvas').focus();
    } else if (['protocol-z110','titan-equalizer'].includes(operationId)) {
      await holdUntil('KeyD',loadout=>globalThis.__ATF_GAME__.mechaMissionV131.loadoutId!==loadout,initial.mission.loadoutId);
      assert.notEqual((await snapshot()).mission.loadoutId,initial.mission.loadoutId,'The hangar accepts an actual loadout key.');
      await page.keyboard.press('KeyE'); await page.waitForTimeout(200);
      assert.equal((await snapshot()).mission.mounted,true,'E mounts the local prototype.');
      if (operationId==='protocol-z110') {
        await holdUntil('KeyS',()=>globalThis.__ATF_GAME__.mechaMissionV131.route==='black');
        assert.equal((await snapshot()).mission.route,'black');
        await page.keyboard.press('KeyE'); await page.waitForTimeout(200);
        assert.equal((await snapshot()).mission.phase,'siege');
      }
    } else if (['queen-mother-song','hive-world','pangaea-second-extinction'].includes(operationId)) {
      await moveRightTo(350); await page.keyboard.press('KeyE'); await page.waitForTimeout(200);
      assert.equal((await snapshot()).mission.supplyTaken,true,'The local finite supply cache accepts E.');
    } else {
      await holdUntil('KeyE',()=>globalThis.__ATF_GAME__.legacyMissionV131.stage>=1);
      assert.equal((await snapshot()).mission.stage,1,'Held E advances the actual first briefing station.');
    }
    const interacted=await snapshot();
    const beforeMove=interacted.mission.aboard?interacted.vehicle.x:interacted.player.x;
    await holdUntil('KeyD',x=>{const e=globalThis.__ATF_GAME__;return (e.legacyMissionV131?.aboard?e.vehicle.x:e.player.x)>x+12;},beforeMove);
    const moved=await snapshot(), afterMove=moved.mission.aboard?moved.vehicle.x:moved.player.x;
    assert.ok(afterMove>beforeMove+10,'Actual directional input advances the actor.');
    await page.keyboard.press('KeyP'); await page.waitForFunction(()=>globalThis.__ATF_GAME__.paused);
    const paused=await snapshot(); await hold('KeyF',250); await hold('KeyE',150);
    const afterPause=await snapshot();
    assert.deepEqual(afterPause.mission,paused.mission,'Paused resources and chapter progress remain frozen.');
    assert.deepEqual(afterPause.player,paused.player,'Paused actor and shots remain frozen.');
    await page.keyboard.press('KeyP'); await page.waitForFunction(()=>!globalThis.__ATF_GAME__.paused);
    await page.locator('#game-canvas').screenshot({path:join(output,`${String(index+1).padStart(2,'0')}-${operationId}-interacted.png`)});
    report.checks.push({operationId,initial,interacted,moved,paused});
  } catch (error) {
    const state=await snapshot().catch(()=>null);
    report.failures.push({operationId,message:error.message,stack:error.stack,state});
    console.log(JSON.stringify({operationId,error:error.message}));
    await page?.screenshot({path:join(output,`${String(index+1).padStart(2,'0')}-${operationId}-failure.png`),fullPage:true}).catch(()=>{});
  } finally { await context?.close(); }
}
async function main() {
  await fs.mkdir(output,{recursive:true});
  const module=await playwright(), {chromium}=module.chromium?module:module.default;
  browser=await chromium.launch({headless:true,...(process.env.ATF_CHROMIUM_EXECUTABLE?{executablePath:process.env.ATF_CHROMIUM_EXECUTABLE}:{})});
  const selected=process.env.ATF_OPERATIONS_QA_IDS?operations.filter(id=>process.env.ATF_OPERATIONS_QA_IDS.split(',').includes(id)):operations;
  for (const [index,operationId] of selected.entries()) {
    await scenario(operationId,index);
    await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({operationId,passed:report.checks.length,failed:report.failures.length}));
  }
  report.status=report.failures.length||report.pageErrors.length||report.requestFailures.length?'failed':'passed';
  if (report.status!=='passed') process.exitCode=1;
}
main().catch(error=>{report.status='failed';report.fatal={message:error.message,stack:error.stack};process.exitCode=1;})
  .finally(async()=>{report.finishedAt=new Date().toISOString();await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
    await browser?.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures.length,report:join(output,'report.json')}));});
