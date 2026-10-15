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
const output = resolve(process.env.ATF_SQUAD_QA_OUTPUT || join(tmpdir(), `atf-squad-v132-${Date.now()}`));
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) {
  throw new Error('ATF_SQUAD_QA_OUTPUT must be outside the repository.');
}
async function playwrightModule() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
      return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__squad_qa__.cjs'))('playwright');
    }
    throw new Error('Use an existing Playwright and Chromium installation for browser QA.', { cause: error });
  }
}
const report = { startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  scenario: 'Standard ship operation launched through Command after importing a legacy profile through the real save picker. No mission actor or runtime state is injected.' };
let browser, page;
const snapshot = () => page.evaluate(() => {
  const e = globalThis.__ATF_GAME__;
  return e && e.player ? { running:e.running, paused:e.paused, loading:!!(e.enemyAtlasLoadingPausedV65 || e.userCasteLoadingV88),
    mission:e.mission.state, resume:e.lastResumeResult, player:{x:e.player.x,y:e.player.y,w:e.player.w,h:e.player.h,grounded:e.player.grounded,health:e.player.health,alive:e.player.alive},
    actors:e.squadActors.map(actor=>({id:actor.crewId,x:actor.x,y:actor.y,w:actor.w,h:actor.h,alive:actor.alive,team:actor.squadTeamV132,navigation:actor.levelNavigation?.mode})),
    squad:e.getSquadDoctrineSnapshotV132(), vertical:e.getVerticalWorldSnapshotV130(),
    ladders:e.ladders.map(ladder=>({id:ladder.id,x:ladder.x,top:ladder.top,bottom:ladder.bottom})) } : null;
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
  let state=await snapshot(); assert.equal(state.squad.active,true); assert.ok(state.actors.length>=2);
  check('Standard operation exposes the transverse doctrine for its actual imported crew',state);
  await page.keyboard.press('KeyC'); const dock=page.locator('.squad-command-v132'); await dock.waitFor({state:'visible'});
  await dock.locator('[data-squad-action="formation"][data-squad-value="column"]').click();
  await dock.locator('[data-squad-action="doctrine"][data-squad-value="discreet"]').click();
  await dock.locator('[data-squad-action="order"][data-squad-value="hold"]').click();
  state=await snapshot(); assert.equal(state.squad.formation,'column'); assert.equal(state.squad.doctrine,'discreet');
  assert.equal(state.squad.teams.alpha.order,'hold'); assert.equal(state.squad.teams.bravo.order,'hold');
  const desktopBounds=await dock.evaluate(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,viewport:innerWidth,scroll:node.scrollWidth,client:node.clientWidth};});
  assert.ok(desktopBounds.right<=desktopBounds.viewport+1); assert.ok(desktopBounds.scroll<=desktopBounds.client+1);
  await page.screenshot({path:output+'/01-doctrine-fullpage.png',fullPage:true});
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(250);
  const mobileBounds=await dock.evaluate(node=>{const r=node.getBoundingClientRect();return{x:r.x,right:r.right,width:r.width,viewport:innerWidth,scroll:node.scrollWidth,client:node.clientWidth};});
  assert.ok(mobileBounds.x>=0 && mobileBounds.right<=mobileBounds.viewport+1); assert.ok(mobileBounds.scroll<=mobileBounds.client+1);
  await page.screenshot({path:output+'/01-doctrine-mobile.png',fullPage:true});
  check('Desktop and 390px command dock stay within the viewport without horizontal clipping',{desktopBounds,mobileBounds});
  await page.setViewportSize({width:1600,height:1000}); await page.waitForTimeout(150);
  await capture('01-doctrine-panel.png');
  check('Real command buttons select column, fire discipline and a reserved hold location',state.squad);
  await page.keyboard.press('Escape'); await dock.waitFor({state:'hidden'});
  assert.equal(await page.locator('#game-canvas').evaluate(node=>node===document.activeElement),true);
  const held=await snapshot(); await page.waitForTimeout(450); state=await snapshot();
  held.actors.forEach((actor,index)=>assert.ok(Math.abs(state.actors[index].x-actor.x)<2));
  check('Escape returns canvas focus and the original crew physically hold their positions',state.actors);
  await page.locator('#mission-squad-command-v132').click(); await dock.waitFor({state:'visible'});
  await dock.locator('[data-squad-action="formation"][data-squad-value="pairs"]').click();
  await dock.locator('[data-squad-action="order"][data-squad-value="follow"]').click();
  await page.keyboard.press('Escape');
  state=await snapshot(); const lift=state.vertical.lifts[0];
  await page.keyboard.down('KeyD');
  await page.waitForFunction(x=>globalThis.__ATF_GAME__.player.x+globalThis.__ATF_GAME__.player.w/2>=x-18,lift.x+72);
  await page.keyboard.up('KeyD'); await page.waitForTimeout(550);
  await page.keyboard.press('KeyE');
  await page.waitForFunction(()=>Math.abs(globalThis.__ATF_GAME__.lifts[0].y-504)<.1,null,{timeout:12000});
  await page.waitForTimeout(450); state=await snapshot(); assert.ok(Math.abs(state.player.y+state.player.h-504)<2);
  check('J1 reaches the middle storey using the actual elevator button',state);
  // Walk onto the left landing and its service ladder. No actor or objective is
  // assigned through evaluate; the only mission writes are actual inputs/UI.
  await page.keyboard.down('KeyA');
  await page.waitForFunction(x=>globalThis.__ATF_GAME__.player.x<=x,lift.x-80);
  await page.keyboard.up('KeyA'); await page.waitForTimeout(250);
  state=await snapshot(); const ladder=state.ladders.find(item=>item.id.includes('service-ladder')&&item.bottom===504);
  assert.ok(ladder); const direction=state.player.x+state.player.w/2>ladder.x?'KeyA':'KeyD';
  await page.keyboard.down(direction);
  await page.waitForFunction(({x,direction})=>direction==='KeyA'?globalThis.__ATF_GAME__.player.x+globalThis.__ATF_GAME__.player.w/2<=x+6:globalThis.__ATF_GAME__.player.x+globalThis.__ATF_GAME__.player.w/2>=x-6,{x:ladder.x,direction});
  await page.keyboard.up(direction); await page.waitForTimeout(180); await page.keyboard.down('KeyW');
  await page.waitForFunction(()=>globalThis.__ATF_GAME__.player.y+globalThis.__ATF_GAME__.player.h<=141,null,{timeout:10000});
  await page.keyboard.up('KeyW'); await page.waitForTimeout(300);
  state=await snapshot(); assert.ok(Math.abs(state.player.y+state.player.h-140)<2);
  check('The human reaches the upper deck through the real service ladder',state);
  await page.waitForFunction(()=>globalThis.__ATF_GAME__.squadActors.some(actor=>actor.alive&&actor.y+actor.h<505),null,{timeout:25000});
  state=await snapshot(); assert.ok(state.squad.telemetry.traversals>0);
  check('An original teammate follows through a physical elevator or ladder route',state.actors);
  await capture('02-upper-squad.png');
  await page.keyboard.press('KeyP'); state=await snapshot(); assert.equal(state.paused,true);
  const paused=state; await page.waitForTimeout(450); state=await snapshot();
  assert.deepEqual(state.actors,paused.actors); assert.deepEqual(state.squad,paused.squad);
  check('Pause freezes original crew positions and doctrine clocks',state);
  await page.locator('#mission-save-v86').click(); await page.getByText('Sauvegarde locale confirmée.',{exact:true}).waitFor();
  const saved=await snapshot(); check('Actual mission save writes the complete doctrine checkpoint',saved.squad);
  await page.reload({waitUntil:'domcontentloaded'}); await page.locator('#title-start').click({timeout:45000});
  if(await page.locator('#title-continue').isVisible()) await page.locator('#title-continue').click();
  await page.locator('[data-view="command"]').click(); await page.locator('#continue-operation').click();
  for(let i=0;i<16;i++) { if(await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running)) break;
    const advance=page.locator('[data-insertion-action="advance"]'); if(await advance.isVisible()) await advance.click(); await page.waitForTimeout(350); }
  await page.waitForFunction(()=>globalThis.__ATF_GAME__?.running&&!globalThis.__ATF_GAME__.enemyAtlasLoadingPausedV65,null,{timeout:45000});
  state=await snapshot(); assert.equal(state.resume.applied,true); assert.equal(state.squad.formation,saved.squad.formation);
  assert.equal(state.squad.doctrine,saved.squad.doctrine); assert.deepEqual(state.squad.assignments,saved.squad.assignments);
  assert.ok(Math.abs(state.player.y-saved.player.y)<2); assert.deepEqual(state.actors.map(actor=>actor.id),saved.actors.map(actor=>actor.id));
  check('Reload and Continue restore the same doctrine, crew identities and authored elevation',state);
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
