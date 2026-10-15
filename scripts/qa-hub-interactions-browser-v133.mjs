import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname,isAbsolute,join,relative,resolve } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEX_BY_ID_V71,createHubCommercialStateV71 } from '../src/tantalus-hub-expansion-v71.js';
import { HUB_LOADER_ROOM_V132 } from '../src/hub-training-v132.js';
import { WORLDS } from '../src/content.js';

// All fixtures enter through the actual Save file picker. They contain a valid
// idle annex pose, no exercise progress or certificate. Runtime evaluations
// only observe state; every exercise action uses keyboard or a visible button.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),baseUrl=process.env.ATF_BASE_URL||'http://127.0.0.1:4173';
const output=resolve(process.env.ATF_HUB_INTERACTIONS_QA_OUTPUT||join(tmpdir(),`atf-hub-interactions-v133-${Date.now()}`));
const rel=relative(root,output);if(!rel||!rel.startsWith('..')&&!isAbsolute(rel))throw Error('QA evidence must remain outside the checkout.');
const report={status:'running',startedAt:new Date().toISOString(),checks:[],pageErrors:[],requestFailures:[],serviceEvidence:[],
  method:'Imported idle human profiles and physical annex fixtures; actual keyboard and visible command buttons; observations only, with no engine property or method injection.'};
let browser,page;
async function playwright(){try{return await import('playwright');}catch(error){
  if(process.env.ATF_PLAYWRIGHT_MODULE)return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'__hub_qa__.cjs'))('playwright');
  throw Error('Existing Playwright installation required',{cause:error});}}
function observed(){const hub=globalThis.__ATF_HUB__;return hub?{running:hub.running,book:structuredClone(hub.hubTrainingV132),
  player:{x:hub.player?.x,y:hub.player?.y,health:hub.player?.health},annex:hub.currentAnnexV71?.()?.id,prompt:hub.statusPrompt?.(),
  doors:hub.doorStates?.map(door=>({id:door.id,progress:door.progress})),gameRunning:globalThis.__ATF_GAME__?.running,
  campaign:globalThis.__ATF_GAME__?.campaign?.id}:null;}
const snapshot=()=>page.evaluate(observed);
function fixture(annexId){const save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='hub';
  save.galaxy.unlockedWorldIds=WORLDS.map(world=>world.id);
  const annex=HUB_ANNEX_BY_ID_V71[annexId],deck=HUB_DECKS.findIndex(deck=>deck.id===annex.parentDeck),room=HUB_DECKS[deck].rooms.find(room=>room.id===annex.parentRoomId);
  const commercial=createHubCommercialStateV71();Object.assign(commercial,{activeAnnexId:annexId,lastAnnexId:annexId,
    annexPositionX:Math.round(annex.station.bounds.x+annex.station.bounds.w+8),annexPositionY:532,annexClimbing:false,
    returnContext:{deckId:annex.parentDeck,roomId:annex.parentRoomId,x:Math.round(room.xStart+180),facing:1}});
  commercial.annexes[annexId].visited=true;commercial.visitedAnnexIds.push(annexId);
  Object.assign(save.hub,{deck,roomId:room.id,positionX:room.xStart+180,positionY:532,commercialV71:commercial});return save;}
async function importFixture(annexId){
  if(await page.locator('#exit-hub').isVisible())await page.locator('#exit-hub').click();
  await page.locator('[data-view="settings"]').click();
  await page.locator('#save-import').setInputFiles({name:'hub-idle-annex-qa.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture(annexId)))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).last().waitFor();await page.locator('[data-view="hub"]').click();
  await page.locator('#hub-canvas').waitFor({state:'visible'});await page.waitForFunction(id=>globalThis.__ATF_HUB__?.running&&globalThis.__ATF_HUB__.currentAnnexV71?.()?.id===id,annexId);
  await page.locator('#hub-canvas').focus();return snapshot();}
async function holdUntil(code,predicate,value,timeout=20000){await page.keyboard.down(code);try{await page.waitForFunction(predicate,value,{timeout,polling:'raf'});}finally{await page.keyboard.up(code);}}
async function driveTo(x){const before=await snapshot(),old=before.book.course.loader.x;if(Math.abs(old-x)<5)return;
  const code=x>old?'KeyD':'KeyA';await holdUntil(code,target=>{const c=globalThis.__ATF_HUB__.hubTrainingV132.course;
    return target.right?c.loader.x>=target.x-3:c.loader.x<=target.x+3;},{x,right:x>old},30000);
  assert.ok(Math.abs((await snapshot()).book.course.loader.x-x)<9);}
async function liftTo(height){const before=(await snapshot()).book.course.loader.lift;if(Math.abs(before-height)<2)return;
  await holdUntil(height>before?'KeyW':'KeyS',target=>{const h=globalThis.__ATF_HUB__.hubTrainingV132.course.loader.lift;
    return target.up?h>=target.height-1:h<=target.height+1;},{height,up:height>before});}
async function persisted(){return page.evaluate(()=>JSON.parse(localStorage.getItem('atf-v47-profile-1')));}
async function walkToStationSide(){
  const target=await page.evaluate(()=>{const hub=globalThis.__ATF_HUB__,room=hub.currentRoom(),bounds=room.propInteractionBounds;
    const candidates=Array.from({length:Math.floor((bounds.w-64)/16)+1},(_,index)=>bounds.x+32+index*16);
    return candidates.filter(x=>hub.doorStates.every(door=>!door.lift||door.roomId!==room.id||Math.abs(x-door.x)>=140))
      .map(x=>({x,distance:Math.min(...hub.npcs.map(npc=>Math.abs(x-npc.x-npc.w/2)))}))
      .sort((a,b)=>b.distance-a.distance)[0].x;});
  let center=await page.evaluate(()=>{const p=globalThis.__ATF_HUB__.player;return p.x+p.w/2;});
  if(Math.abs(center-target)>36){const code=target>center?'KeyD':'KeyA';await holdUntil(code,value=>{const p=globalThis.__ATF_HUB__.player,center=p.x+p.w/2;
    return value.right?center>=value.x-28:center<=value.x+28;},{x:target,right:target>center});await page.waitForTimeout(200);}
  for(let attempt=0;attempt<20;attempt++){
    center=await page.evaluate(()=>{const p=globalThis.__ATF_HUB__.player;return p.x+p.w/2;});if(Math.abs(center-target)<5)break;
    const code=center<target?'KeyD':'KeyA';await page.keyboard.down(code);await page.waitForTimeout(40);await page.keyboard.up(code);await page.waitForTimeout(160);
  }
  assert.equal(await page.evaluate(()=>!!globalThis.__ATF_HUB__.nearestInteraction()),true,'The keyboard must reach the physical station bounds.');
  assert.equal(await page.evaluate(()=>!!globalThis.__ATF_HUB__.nearestHubNpc()),false,'The free side must select the station rather than a colleague.');
  assert.equal(await page.evaluate(()=>!!globalThis.__ATF_HUB__.nearestLift()),false,'The actual station must be selected away from the adjacent lift.');
}

async function importRoomFixture(roomId){
  if(await page.locator('#exit-hub').isVisible())await page.locator('#exit-hub').click();
  await page.locator('[data-view="settings"]').click();
  const save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='hub';
  save.crew[0].health=50;save.crew[0].fatigue=50;save.crew[0].stress=50;
  Object.assign(save.hub.systems,{power:50,oxygen:50,quarantine:40});save.hub.playerHealth=50;
  const deck=HUB_DECKS.findIndex(entry=>entry.rooms.some(room=>room.id===roomId)),room=HUB_DECKS[deck].rooms.find(room=>room.id===roomId);
  Object.assign(save.hub,{deck,roomId,positionX:room.xStart+180,positionY:532});
  await page.locator('#save-import').setInputFiles({name:'hub-idle-services-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).last().waitFor();await page.locator('[data-view="hub"]').click();
  await page.waitForFunction(id=>globalThis.__ATF_HUB__?.running&&globalThis.__ATF_HUB__.currentRoom().id===id,roomId);
  await page.locator('#hub-canvas').focus();
  // Native acceleration and deceleration remain active during this approach.
  await walkToStationSide();
}
async function verifyPhysicalServices(){
  const cases=[['mess','service:rest','supplies',2],['medical','service:medical','medical',1],['quarantine','service:quarantine','supplies',3],['reactor','service:power','fuel',2],['life-support','service:oxygen','supplies',2]];
  for(const [roomId,action,currency,cost] of cases){
    await importRoomFixture(roomId);const before=await persisted(),pose=await snapshot();
    await page.keyboard.press('KeyE');await page.waitForFunction(key=>JSON.parse(localStorage.getItem('atf-v47-profile-1')).hub.services[key]!==undefined,action);
    const after=await persisted(),now=await snapshot();
    const resources=currency==='supplies'?before.hub.systems:before.galaxy.resources,afterResources=currency==='supplies'?after.hub.systems:after.galaxy.resources;
    assert.ok(resources[currency]-afterResources[currency]>=cost,`${roomId}: personal ship stock must pay the actual service`);
    assert.equal(after.clock.hour,before.clock.hour+1);assert.equal(after.hub.services[action],Math.floor(((before.clock.day-1)*24+before.clock.hour)/6));
    if(action==='service:rest'){assert.ok(after.crew[0].fatigue<before.crew[0].fatigue);assert.ok(after.crew[0].stress<before.crew[0].stress);}
    if(action==='service:medical'){assert.ok(after.crew[0].health>=before.crew[0].health+14);assert.equal(after.hub.playerHealth,Math.min(100,before.hub.playerHealth+35));assert.equal(now.player.health,after.hub.playerHealth);}
    if(action==='service:quarantine')assert.ok(after.hub.systems.quarantine>before.hub.systems.quarantine+10);
    if(action==='service:power')assert.ok(after.hub.systems.power>before.hub.systems.power+10);
    if(action==='service:oxygen')assert.ok(after.hub.systems.oxygen>before.hub.systems.oxygen+14);
    await page.locator('#hub-canvas').focus();await walkToStationSide();await page.keyboard.press('KeyE');await page.waitForTimeout(120);const repeated=await persisted();
    assert.deepEqual(repeated.clock,after.clock);assert.deepEqual(repeated.galaxy.resources,after.galaxy.resources);assert.deepEqual(repeated.hub.systems,after.hub.systems);
    assert.ok(now.running&&Math.abs(now.player.x-pose.player.x)<1);
    await page.locator('#hub-canvas').screenshot({path:join(output,`service-${roomId}.png`)});
    report.serviceEvidence.push({roomId,action,pose,before:{clock:before.clock,resources:before.galaxy.resources,systems:before.hub.systems,crew:before.crew[0]},after:{clock:after.clock,resources:after.galaxy.resources,systems:after.hub.systems,crew:after.crew[0]},repeatedClock:repeated.clock});
    report.checks.push(`${roomId}: actual E service pays stock, changes the intended system, advances one hour and rejects duplicate use in the same watch.`);
    if(action==='service:medical') {
      const reloadPose=await snapshot();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#title-start').click({timeout:45000});
      await page.locator('#title-continue').click();
      if(await page.locator('[data-view="hub"]').isVisible())await page.locator('[data-view="hub"]').click();
      await page.waitForFunction(()=>globalThis.__ATF_HUB__?.running);const restored=await snapshot(),saved=await persisted();
      assert.equal(restored.player.health,after.hub.playerHealth);assert.equal(saved.galaxy.resources.medical,after.galaxy.resources.medical);
      assert.deepEqual(saved.clock,after.clock);assert.ok(Math.abs(restored.player.x-reloadPose.player.x)<2);
      report.checks.push('Medical healing, personal medical stock and the reached physical pose survive an actual browser reload.');
    }
  }
  for(const [roomId,view] of [['crew-quarters','crew'],['armory','armory']]){
    await importRoomFixture(roomId);const before=await snapshot();await page.keyboard.press('KeyE');
    await page.waitForFunction(view=>document.documentElement.dataset.hubStation===view||!document.querySelector('#hub-dialogue').hidden,view);
    if(await page.locator('#hub-dialogue').isVisible())await page.locator('#hub-dialogue-continue').click();
    await page.locator(`[data-panel="${view}"].station-overlay`).waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>globalThis.__ATF_HUB__.running),false);
    await page.screenshot({path:join(output,`station-${roomId}.png`),fullPage:true});
    await page.locator(`[data-panel="${view}"] [data-close-hub-station]`).click();await page.waitForFunction(()=>globalThis.__ATF_HUB__.running);
    const after=await snapshot();assert.ok(Math.abs(after.player.x-before.player.x)<1);assert.ok(Math.abs(after.player.y-before.player.y)<1);
    report.checks.push(`${roomId}: physical station opens its real ${view} controls and returns to the same actor pose.`);
  }
}

async function main(){await fs.mkdir(output,{recursive:true});const module=await playwright(),{chromium}=module.chromium?module:module.default;
  browser=await chromium.launch({headless:true,...(process.env.ATF_CHROMIUM_EXECUTABLE?{executablePath:process.env.ATF_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(25000);
  page.on('pageerror',error=>report.pageErrors.push(error.message));page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});await page.locator('#title-start').click({timeout:45000});await page.locator('#title-options').click();
  await verifyPhysicalServices();
  await importFixture('proving-ground');
  const initial=await persisted(),resources=structuredClone(initial.galaxy.resources),crew=structuredClone(initial.crew),operator=initial.player.name;
  await page.keyboard.press('KeyH');await page.waitForFunction(()=>globalThis.__ATF_HUB__.hubTrainingV132.active);
  await page.locator('#hub-canvas').screenshot({path:join(output,'01-p5000-enter.png')});
  await holdUntil('KeyD',()=>globalThis.__ATF_HUB__.player.x>=175);
  await page.keyboard.press('KeyE');assert.equal((await snapshot()).book.course.mounted,true);
  await page.keyboard.press('KeyP');const paused=await snapshot();await page.waitForTimeout(500);assert.deepEqual((await snapshot()).book,paused.book);
  await page.keyboard.press('KeyP');assert.equal((await snapshot()).running,true);report.checks.push('Pause freezes and resumes the same training session.');
  for(const cargo of HUB_LOADER_ROOM_V132.cargo){
    await liftTo(0);await driveTo(cargo.x-110);await page.keyboard.press('KeyE');assert.equal((await snapshot()).book.course.heldId,cargo.id);
    if(cargo.id==='training-cargo-b'){await liftTo(100);await driveTo(1203);}
    await driveTo(cargo.targetX-110);await liftTo(566-cargo.targetY);await page.keyboard.press('KeyE');
    assert.equal((await snapshot()).book.course.cargo.find(item=>item.id===cargo.id).placed,true);
    report.checks.push(`${cargo.id} physically lifted, transported and placed.`);
    await page.locator('#hub-canvas').screenshot({path:join(output,`02-${cargo.id}.png`)});
  }
  await driveTo(230);await page.keyboard.press('KeyE');assert.equal((await snapshot()).book.course.phase,'confirm');
  await page.keyboard.press('KeyE');await page.waitForFunction(()=>globalThis.__ATF_HUB__.hubTrainingV132.course.complete);
  const complete=await persisted();assert.ok(complete.hub.loaderQualificationV132.receipt);assert.equal(complete.hub.loaderQualificationV132.receipt.placements,3);
  assert.deepEqual(complete.galaxy.resources,resources);assert.deepEqual(complete.crew,crew);assert.equal(complete.player.name,operator);
  report.checks.push('A physical qualification persists without a resource reward or crew/identity change.');
  await page.locator('#hub-canvas').screenshot({path:join(output,'03-qualified.png')});
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#title-start').click({timeout:45000});
  await page.locator('#title-continue').click();
  if(await page.locator('[data-view="hub"]').isVisible())await page.locator('[data-view="hub"]').click();
  await page.waitForFunction(()=>globalThis.__ATF_HUB__.hubTrainingV132.course?.complete);
  assert.equal((await persisted()).hub.loaderQualificationV132.receipt.id,complete.hub.loaderQualificationV132.receipt.id);
  await page.keyboard.press('Escape');report.checks.push('Reload preserves the same qualified receipt and safe parent annex.');
  await importFixture('cctv');await page.keyboard.press('KeyN');assert.equal((await snapshot()).book.cameraIndex,1);
  const toggle=page.locator('[data-hub-training-command-v132="door-toggle"][data-hub-training-value-v132="command:hub-central-bulkhead"]');
  await toggle.click();assert.ok((await snapshot()).book.lockedDoorIds.includes('command:hub-central-bulkhead'));
  await page.screenshot({path:join(output,'04-cctv-lock.png'),fullPage:true});
  const unsafe=page.locator('[data-hub-training-command-v132="door-toggle"][data-hub-training-value-v132="command:hub-west-bulkhead"]');assert.equal(await unsafe.isDisabled(),true);
  report.checks.push('CCTV changes a real persisted door lock; a lock that isolates the bridge is disabled.');
  await importFixture('mire-archives');await page.locator('[data-hub-training-command-v132="mire-replay"]').click();
  for(let index=0;index<20;index++){
    if(await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running))break;
    const advance=page.locator('[data-insertion-action="advance"]');if(await advance.isVisible())await advance.click();await page.waitForTimeout(200);
  }
  await page.waitForFunction(()=>globalThis.__ATF_GAME__?.running&&globalThis.__ATF_GAME__.campaign?.id==='special-nostromo-v131');
  await page.locator('#game-canvas').screenshot({path:join(output,'05-mire-native-replay.png')});report.checks.push('The MIRE physical console starts the actual native Nostromo chapter.');
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';
}
await main().catch(async error=>{report.status='failed';report.error={message:error.message,stack:error.stack};process.exitCode=1;
  if(page){report.failureState=await snapshot().catch(()=>null);await page.screenshot({path:join(output,'failure.png'),fullPage:true}).catch(()=>{});}}).finally(async()=>{
  report.finishedAt=new Date().toISOString();await fs.mkdir(output,{recursive:true});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
  await browser?.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,error:report.error?.message,report:join(output,'report.json')}));
});
