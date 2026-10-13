import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// Functional browser QA: a standard campaign and real keyboard input.
// The legacy profile fixture is imported through the actual save picker.
// Mission evaluations read state only; no positions or objectives are injected.
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_FRONTIER_QA_OUTPUT || join(tmpdir(), `atf-frontier-v130-${Date.now()}`));
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) {
  throw new Error('ATF_FRONTIER_QA_OUTPUT must be outside the repository.');
}
async function playwrightModule() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
      return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__frontier_qa__.cjs'))('playwright');
    }
    throw new Error('Use an existing Playwright and Chromium installation for browser QA.', { cause: error });
  }
}
const report = { startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  scenario: 'Standard ship operation launched through Command after importing a legacy profile through the real save picker. No mission actor or runtime state is injected.' };
let browser, page;
const snapshot = () => page.evaluate(() => {
  const e = globalThis.__ATF_GAME__, p = e?.player;
  return e && p ? { running: e.running, paused: e.paused, phase: e.mission?.state,
    loading: !!(e.enemyAtlasLoadingPausedV65 || e.userCasteLoadingV88),
    player: { x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,vy:p.vy,health:p.health,alive:p.alive,
      grounded:p.grounded,shots:p.shots,aim:p.combatAimV83,aiming:p.aimingV124 },
    vertical:e.getVerticalWorldSnapshotV130(), scenery:e.getDestructibleScenerySnapshotV130(),
    tactics:e.enemyTacticsSnapshotV130(), weapon:e.weaponActionsSnapshotV130() } : null;
});
const check = (label, evidence) => report.checks.push({ label, evidence });
async function capture(file) { await page.locator('#game-canvas').screenshot({path:output+'/'+file}); }
async function main() {
  await fs.mkdir(output,{recursive:true});
  const module = await playwrightModule();
  const { chromium } = module.chromium ? module : module.default;
  browser=await chromium.launch({headless:true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? {executablePath:process.env.ATF_CHROMIUM_EXECUTABLE} : {})});
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});
  page=await context.newPage(); page.setDefaultTimeout(20000);
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  await page.locator('#title-start').click({timeout:45000}); await page.locator('#title-options').click();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'frontier-qa-legacy-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).waitFor();
  await page.locator('[data-view="command"]').click();
  await page.locator('#command-mission-v110').selectOption('pair-004-frontier');
  await page.locator('#operation-launch').click();
  for(let i=0;i<16;i++) {
    const ready=await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running);
    if(ready) break;
    const advance=page.locator('[data-insertion-action="advance"]');
    if(await advance.isVisible()) await advance.click();
    await page.waitForTimeout(350);
  }
  await page.locator('#game-canvas').waitFor({state:'visible'});
  await page.waitForFunction(()=>{
    const e=globalThis.__ATF_GAME__;
    return e?.running && !e.paused && !e.enemyAtlasLoadingPausedV65 && !e.userCasteLoadingV88 && e.player?.grounded;
  },null,{timeout:45000});
  await page.locator('#game-canvas').focus();
  let state=await snapshot();
  assert.equal(state.vertical.active,true); assert.equal(state.vertical.lifts.length,2);
  assert.ok(Object.values(state.vertical.readiness).every(Boolean));
  assert.equal(state.scenery.counts.objects,3);
  check('Standard ship deploys three reachable decks, two clear lift shafts and three destructible materials',state);
  await capture('01-lower-deck.png');
  const lift=state.vertical.lifts[0], middle=504, upper=140;
  await page.keyboard.down('KeyD');
  await page.waitForFunction(x=>globalThis.__ATF_GAME__.player.x+globalThis.__ATF_GAME__.player.w/2>=x-18,lift.x+72);
  await page.keyboard.up('KeyD'); await page.waitForTimeout(250);
  await page.keyboard.press('KeyE');
  await page.waitForFunction(y=>Math.abs(globalThis.__ATF_GAME__.lifts[0].y-y)<.05,middle,{timeout:12000});
  await page.waitForTimeout(350); state=await snapshot();
  assert.ok(Math.abs(state.player.y+state.player.h-middle)<2);
  check('E transports the real operator continuously to the middle deck',state);
  await capture('02-middle-deck.png');
  await page.keyboard.press('KeyW',{delay:100});
  await page.waitForFunction(y=>Math.abs(globalThis.__ATF_GAME__.lifts[0].y-y)<.05,upper,{timeout:12000});
  await page.waitForTimeout(550); state=await snapshot();
  assert.ok(Math.abs(state.player.y+state.player.h-upper)<2);
  assert.ok(state.player.y-state.vertical.cameraY>=190, 'The upper operator must remain visible below the HUD.');
  check('Up reaches the upper landing; the camera and independent depth layers follow the elevation',state);
  await capture('03-upper-deck.png');
  const glass=state.scenery.objects.find(o=>o.material==='glass');
  await page.keyboard.down('KeyD');
  await page.waitForFunction(x=>globalThis.__ATF_GAME__.player.x>=x,glass.x-70).catch(async error=>{
    throw new Error('The upper route to the glass was blocked: '+JSON.stringify(await snapshot()),{cause:error});
  });
  await page.keyboard.up('KeyD'); await page.waitForTimeout(150);
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyD'); await page.waitForTimeout(100);
  await page.keyboard.up('KeyD'); state=await snapshot();
  assert.equal(state.player.aim.direction,'right'); assert.equal(state.player.aim.latchedV130,true);
  check('Held aim retains the selected direction after direction keys are released',state.player);
  const shotsBefore=state.player.shots, hitsBefore=state.scenery.hits;
  await page.keyboard.down('KeyF');
  await page.waitForFunction(id=>globalThis.__ATF_GAME__.getDestructibleScenerySnapshotV130().objects.find(o=>o.id===id)?.destroyed,glass.id,{timeout:10000});
  await page.keyboard.up('KeyF'); await page.keyboard.up('ShiftLeft');
  state=await snapshot(); assert.ok(state.scenery.hits>hitsBefore); assert.ok(state.player.shots>shotsBefore);
  check('Real fire breaks the upper glass and removes its solid collider',state.scenery);
  await capture('04-broken-glass.png');
  await page.keyboard.down('KeyD');
  await page.waitForFunction(x=>globalThis.__ATF_GAME__.player.x>x,glass.x+glass.w+12,{timeout:8000});
  await page.keyboard.up('KeyD'); state=await snapshot();
  check('The operator physically walks through the opening created by the shots',state.player);
  assert.ok(state.tactics.enemies.some(e=>e.state));
  assert.ok(state.tactics.enemies.some(e=>e.rear));
  check('The same operation observes patrol states and authored rear entrances',state.tactics);
  await page.keyboard.press('KeyP'); const paused=await snapshot(); await page.waitForTimeout(350);
  const after=await snapshot(); assert.equal(after.tactics.time,paused.tactics.time);
  assert.equal(after.vertical.cameraY,paused.vertical.cameraY);
  check('Pause freezes tactical time and vertical camera together',after);
  assert.equal(report.pageErrors.length,0); assert.equal(report.requestFailures.length,0);
  report.status='passed';
}
main().catch(async error=>{
  report.status='failed'; report.error={message:error.message,stack:error.stack};
  if(page) {report.lastState=await snapshot().catch(()=>null);await page.screenshot({path:output+'/failure.png',fullPage:true}).catch(()=>{});}
  process.exitCode=1;
}).finally(async()=>{
  report.finishedAt=new Date().toISOString(); await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2));
  await browser?.close(); console.log(JSON.stringify({status:report.status,checks:report.checks.length,error:report.error?.message,report:output+'/report.json'}));
});
