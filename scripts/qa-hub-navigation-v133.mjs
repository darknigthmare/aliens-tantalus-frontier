import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join,relative,resolve,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createDefaultSave} from '../src/save.js';
import {HUB_DECKS} from '../src/hub-game.js';
import {HUB_ANNEXES_V87} from '../src/hub-annex-registry-v87.js';
import {requestShipPortDockV87,stepShipPortV87,SHIP_PORT_DEFINITION_V87} from '../src/ship-port-state-v87.js';

// One idle profile enters through the real file picker. Its local civil relay
// was docked by the native pure state machine before this navigation exercise.
// All subsequent movement, entries, exits and lifts use actual keyboard input.
// Runtime globals are observed only: no poses, flags or methods are injected.
const root=fileURLToPath(new URL('../',import.meta.url)),base=process.env.ATF_BASE_URL||'http://127.0.0.1:4173';
const output=resolve(process.env.ATF_HUB_NAV_QA_OUTPUT||join(tmpdir(),'atf-hub-navigation-v133'));
const rel=relative(root,output);if(!rel||!rel.startsWith('..')&&!isAbsolute(rel))throw Error('QA evidence must remain outside the checkout.');
const report={status:'running',startedAt:new Date().toISOString(),method:'One idle docked-profile fixture imported through the Save UI; continuous keyboard route; globals observed only.',rooms:[],annexes:[],lifts:[],checks:[],pageErrors:[],requestFailures:[]};
let browser,page;
async function playwright(){try{return await import('playwright');}catch(error){
 if(process.env.ATF_PLAYWRIGHT_MODULE)return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
 if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'__hub_nav__.cjs'))('playwright');
 throw Error('Existing Playwright installation required',{cause:error});}}
function fixture(){let save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='hub';
 const scope=SHIP_PORT_DEFINITION_V87,context={careReady:true,manifestReady:true,physical:{roomId:'dropship-hangar'},
  authorization:{granted:true,portId:scope.id,sectorId:scope.sectorId,campaignHours:6}};
 let result=requestShipPortDockV87(save,{transactionId:'hub-navigation-fixture-dock-v133',portId:scope.id},context);assert.equal(result.ok,true);save=result.save;
 for(let seconds=1;seconds<=14;seconds++){result=stepShipPortV87(save,{dtSeconds:1,simulationTime:seconds},context);assert.equal(result.ok,true);save=result.save;}
 assert.equal(save.shipPortV1.phase,'docked');Object.assign(save.hub,{deck:0,roomId:'bridge',positionX:180,positionY:532,visited:[]});return save;}
function observation(){const h=globalThis.__ATF_HUB__;return h?{running:h.running,deck:h.state.deck,roomId:h.currentRoom()?.id,
 activeAnnex:h.currentAnnexV71?.()?.id||null,transition:h.annexTransitionV71?.direction||null,
 player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health,shockHits:h.player.shockHits,alive:h.player.alive},
 visited:[...(h.state.visited||[])],visitedAnnexes:[...(h.hubCommercialStateV71?.visitedAnnexIds||[])],prompt:h.statusPrompt(),
 contact:h.nearestParentAnnexDoorV71?.()?.annexId||null,station:h.nearestAnnexStationV71?.()?.annexId||null,
 lift:h.nearestLift?.()?.shaftId||null,doors:h.doorStates.map(d=>({id:d.id,progress:d.progress}))}:null;}
const snapshot=()=>page.evaluate(observation);
async function capture(name){await page.locator('#hub-canvas').screenshot({path:join(output,name)});return name;}
async function walkTo(x){const before=await snapshot();if(Math.abs(before.player.x-x)<8)return;
 const direction=x>before.player.x?'KeyD':'KeyA',right=x>before.player.x;
 await page.keyboard.down('ShiftLeft');await page.keyboard.down(direction);
 try{await page.waitForFunction(target=>{const h=globalThis.__ATF_HUB__,p=h?.player;return p&&(target.right?p.x>=target.x-6:p.x<=target.x+6);},
  {x,right},{timeout:Math.max(12000,Math.abs(before.player.x-x)/190*1000+8000),polling:'raf'});
 }catch(error){const after=await snapshot();await capture('blocked-route.png');throw Error(`Walking route blocked: x${before.player.x} to ${x}; now ${after.player.x}, ${after.prompt}`,{cause:error});
 }finally{await page.keyboard.up(direction);await page.keyboard.up('ShiftLeft');}
 await page.waitForTimeout(180);const after=await snapshot();assert.ok(Math.abs(after.player.x-x)<55,`Unexpected walking overshoot: ${after.player.x} vs ${x}`);
 assert.equal(after.player.health,100);assert.equal(after.player.shockHits,0);assert.equal(after.player.y,532);
}
async function visitAnnex(annex){const door=await page.evaluate(id=>{const door=globalThis.__ATF_HUB__.getParentAnnexDoorV71(id);return {bounds:{...door.bounds},id:door.annexId};},annex.id);
 await walkTo(door.bounds.x+door.bounds.w/2-22);assert.equal((await snapshot()).contact,annex.id);
 const entry=await capture(`${annex.id}-door.png`);await page.keyboard.press('KeyE');
 await page.waitForFunction(id=>globalThis.__ATF_HUB__.currentAnnexV71?.()?.id===id&&!globalThis.__ATF_HUB__.annexTransitionV71,annex.id,{timeout:12000});
 const inside=await snapshot();await capture(`${annex.id}-inside.png`);
 const stationX=Math.max(100,Math.min(annex.world.width-100,annex.station.bounds.x+annex.station.bounds.w+10));
 await walkTo(stationX);const atStation=await snapshot();assert.equal(atStation.activeAnnex,annex.id);
 const station=await capture(`${annex.id}-station.png`);
 const exitX=annex.entranceLocalX+(annex.entranceSide==='west'?annex.entrance.w/2+16:-annex.entrance.w/2-60);
 await walkTo(exitX);await page.keyboard.press('KeyE');
 await page.waitForFunction(()=>!globalThis.__ATF_HUB__.currentAnnexV71?.()&&!globalThis.__ATF_HUB__.annexTransitionV71,{timeout:12000});
 const returned=await snapshot();assert.equal(returned.roomId,annex.parentRoomId);assert.equal(returned.player.y,532);
 report.annexes.push({id:annex.id,entry,station,inside,atStation,returned});console.log(JSON.stringify({annex:annex.id,status:'walked-and-returned'}));
}
async function main(){await fs.mkdir(output,{recursive:true});const module=await playwright(),{chromium}=module.chromium?module:module.default;
 browser=await chromium.launch({headless:true,executablePath:process.env.ATF_CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
 const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(30000);
 page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#title-start').click();await page.locator('#title-options').click();
 await page.locator('[data-view="settings"]').click();const idle=fixture();await fs.writeFile(join(output,'idle-profile-fixture.json'),JSON.stringify(idle,null,2));
 await page.locator('#save-import').setInputFiles({name:'hub-navigation-idle.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(idle))});
 await page.getByText('Sauvegarde importée et migrée.',{exact:true}).last().waitFor();await page.locator('[data-view="hub"]').click();
 await page.waitForFunction(()=>globalThis.__ATF_HUB__?.running);await page.locator('#hub-canvas').focus();
 for(let deck=0;deck<4;deck++){
  assert.equal((await snapshot()).deck,deck);const order=deck%2===0?[0,1,2,3]:[3,2,1,0];
  for(const index of order){const room=HUB_DECKS[deck].rooms[index];await walkTo(room.xStart+620);await page.waitForTimeout(180);
   assert.equal((await snapshot()).roomId,room.id);const image=await capture(`${room.id}-after.png`);report.rooms.push({id:room.id,image,state:await snapshot()});
   console.log(JSON.stringify({room:room.id,status:'walked'}));
   const annexes=HUB_ANNEXES_V87.filter(a=>a.parentRoomId===room.id);
   for(const annex of annexes)await visitAnnex(annex);
  }
  if(deck<3){const liftX=deck===1?2340:4914;await walkTo(liftX);const before=await snapshot();assert.ok(before.lift);await page.keyboard.press('KeyS');
   await page.waitForFunction(d=>globalThis.__ATF_HUB__.state.deck===d,deck+1,{timeout:10000});const after=await snapshot();
   assert.equal(after.player.health,100);assert.equal(after.player.y,532);report.lifts.push({from:deck,to:deck+1,shaft:before.lift,before,after});
  }
 }
 const end=await snapshot();assert.equal(new Set(report.rooms.map(r=>r.id)).size,16);assert.equal(new Set(report.annexes.map(a=>a.id)).size,13);
 assert.equal(new Set(end.visited).size,16);assert.equal(new Set(end.visitedAnnexes).size,13);
 report.checks.push('Sixteen rooms crossed through physical bulkheads.','Thirteen annexes entered, walked to their station and exited.','Three real lift transfers join the four decks.','Every everyday route keeps health100, shockHits0 and feet on floor624.');
 await page.locator('#exit-hub').click();const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('atf-v47-profile-1')));
 assert.equal(new Set(stored.hub.visited).size,16);assert.equal(new Set(stored.hub.hubCommercialV71?.visitedAnnexIds||stored.hub.commercialV71?.visitedAnnexIds||[]).size,13);
 assert.deepEqual(stored.galaxy.resources,idle.galaxy.resources);assert.deepEqual(stored.crew,idle.crew);assert.equal(stored.player.name,idle.player.name);
 report.checks.push('Visited rooms and annexes persist without identity, crew or resource changes.');
 assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';
}
await main().catch(async error=>{report.status='failed';report.error={message:error.message,stack:error.stack};process.exitCode=1;
 if(page){report.lastObservedState=await snapshot().catch(()=>null);await capture('failure-context.png').catch(()=>{});
  report.persistedFailureState=await page.evaluate(()=>JSON.parse(localStorage.getItem('atf-v47-profile-1'))).catch(()=>null);}
}).finally(async()=>{
 report.finishedAt=new Date().toISOString();await fs.mkdir(output,{recursive:true});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await browser?.close();
 console.log(JSON.stringify({status:report.status,rooms:report.rooms.length,annexes:report.annexes.length,lifts:report.lifts.length,error:report.error?.message,report:join(output,'report.json')}));
});
