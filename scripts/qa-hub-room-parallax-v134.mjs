import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createDefaultSave} from '../src/save.js';
import {HUB_DECKS} from '../src/hub-game.js';
import {HUB_ANNEX_BY_ID_V87,createHubCommercialStateV87} from '../src/hub-annex-registry-v87.js';

// Idle checkpoints are imported through the actual Save file picker. Native
// keyboard movement, F7, Settings checkbox and H control every journey.
// Browser evaluations read production snapshots; no engine or Canvas injection.
const root=fileURLToPath(new URL('../',import.meta.url)),base=process.env.ATF_BASE_URL||'http://127.0.0.1:4173';
const output=resolve(process.env.ATF_PARALLAX_QA_OUTPUT||join(tmpdir(),`atf-parallax-v134-${Date.now()}`));
const rel=relative(root,output);if(!rel||!rel.startsWith('..')&&!isAbsolute(rel))throw Error('QA evidence must remain outside the checkout.');
const report={status:'running',startedAt:new Date().toISOString(),checks:[],pageErrors:[],requestFailures:[],
  method:'Four valid idle checkpoints through the Save picker; native keyboard walking, F7, H and visible reduced-motion setting; published snapshots observed only.'};
let browser,page;
async function playwright(){try{return await import('playwright');}catch(error){
  if(process.env.ATF_PLAYWRIGHT_MODULE)return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'__parallax__.cjs'))('playwright');
  throw Error('Existing Playwright installation required',{cause:error});}}
function fixture(roomId,annexId=null){const save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='hub';
  const deck=HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===roomId)),room=HUB_DECKS[deck].rooms.find(r=>r.id===roomId);
  Object.assign(save.hub,{deck,roomId,positionX:room.xStart+180,positionY:532});
  if(annexId){const annex=HUB_ANNEX_BY_ID_V87[annexId],commercial=createHubCommercialStateV87();
    Object.assign(commercial,{activeAnnexId:annexId,lastAnnexId:annexId,annexPositionX:180,annexPositionY:532,annexClimbing:false,
      returnContext:{deckId:annex.parentDeck,roomId:annex.parentRoomId,x:room.xStart+180,facing:1}});
    commercial.annexes[annexId].visited=true;commercial.visitedAnnexIds.push(annexId);save.hub.commercialV71=commercial;}
  return save;}
const observed=()=>page.evaluate(()=>{const h=globalThis.__ATF_HUB__;return{running:h.running,deck:h.state.deck,room:h.currentRoom()?.id,annex:h.currentAnnexV71?.()?.id||null,
  player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health,shockHits:h.player.shockHits},camera:h.isAnnexActiveV71?.()?h.annexCameraV71.x:h.camera.x,
  parallax:h.getSnapshot().hubRoomParallaxV134,training:h.getSnapshot().hubTrainingV132,reducedMotion:h.reducedMotion,depth:h.depthPresentationV116};});
function inspect(sample,id){const model=sample.parallax?.current;assert.ok(model,id+' has no production parallax snapshot');assert.equal(model.id,id);
  assert.equal(model.nativeReady,true);assert.equal(model.layers.length,3);assert.equal(model.collidable,false);
  let area=0;for(const tile of model.nativeTiles){const s=tile.source,t=tile.target;
    assert.ok(Math.abs(t.w/s.w-t.h/s.h)<1e-8,id+' stretches native pixels');assert.ok(tile.scaleX<=1+1e-8);
    assert.ok(s.x>=-1e-6&&s.y>=0&&s.x+s.w<=tile.naturalWidth+1e-5&&s.y+s.h<=tile.naturalHeight+1e-5);
    assert.ok(t.x>=model.bounds.x-1e-6&&t.x+t.w<=model.bounds.x+model.bounds.w+1e-6);
    area+=t.w*t.h;}
  assert.ok(Math.abs(area-model.bounds.w*model.bounds.h)<1e-4);
  assert.ok(model.equipmentPanels?.length>=1,id+' has no actual generated rear-equipment bay');
  for(const panel of model.equipmentPanels){const s=panel.source,t=panel.target;assert.equal(panel.exact,false);assert.equal(panel.collidable,false);
    assert.ok(Math.abs(t.w/s.w-t.h/s.h)<1e-8);assert.ok(panel.scaleX<=1);assert.ok(t.w<=650);assert.equal(t.y+t.h,model.bounds.y+model.bounds.h);}
  return model;}
const record=(label,evidence)=>report.checks.push({label,evidence});
async function screenshot(name){await page.locator('#hub-canvas').screenshot({path:join(output,name)});}
async function imported(roomId,annexId=null){if(await page.locator('#exit-hub').isVisible())await page.locator('#exit-hub').click();
  await page.locator('[data-view="settings"]').click();const save=fixture(roomId,annexId);
  await page.locator('#save-import').setInputFiles({name:'parallax-idle.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).last().waitFor();await page.locator('#setting-motion').uncheck();
  await page.locator('[data-view="hub"]').click();await page.locator('#hub-canvas').waitFor({state:'visible'});await page.locator('#hub-canvas').focus();
  await page.waitForFunction(target=>{const h=globalThis.__ATF_HUB__,m=h?.getSnapshot().hubRoomParallaxV134?.current;return h?.running&&(h.currentAnnexV71?.()?.id||h.currentRoom()?.id)===target&&m?.nativeReady&&m.equipmentPanels?.length;},annexId||roomId);
  await page.waitForTimeout(300);return observed();}
async function walkTo(x){const before=await observed(),right=x>before.player.x,key=right?'KeyD':'KeyA';
  await page.keyboard.down(key);try{await page.waitForFunction(target=>{const p=globalThis.__ATF_HUB__.player;return target.right?p.x>=target.x:p.x<=target.x;},{x,right},{timeout:18000,polling:'raf'});}
  finally{await page.keyboard.up(key);}await page.waitForTimeout(450);const after=await observed();assert.equal(after.player.y,532);assert.equal(after.player.health,100);assert.equal(after.player.shockHits,0);return after;}
async function main(){await fs.mkdir(output,{recursive:true});const module=await playwright(),{chromium}=module.chromium?module:module.default;
  browser=await chromium.launch({headless:true,executablePath:process.env.ATF_CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#title-start').click();await page.locator('#title-options').click();
  let before=await imported('bridge');let a=inspect(before,'bridge');await screenshot('01-bridge-before.png');let after=await walkTo(960),b=inspect(after,'bridge');
  assert.equal(b.presentationMode,'2.5d');assert.ok(after.camera-before.camera>200);const delta=b.layers.map((l,i)=>l.drift-a.layers[i].drift);
  assert.ok(delta[0]>delta[1]&&delta[1]>delta[2]&&delta[2]>0);await screenshot('02-bridge-after.png');
  record('Bridge has three different room-local camera depths and isotropic native wall pixels',{before,after,delta});
  await page.keyboard.press('F7');await page.waitForFunction(()=>!globalThis.__ATF_HUB__.depthPresentationV116);let flat=await observed();inspect(flat,'bridge');
  assert.ok(flat.parallax.current.layers.every(l=>l.drift===0&&l.factor===0));const disabled=flat;flat=await walkTo(740);
  assert.ok(flat.parallax.current.layers.every(l=>l.drift===0));await page.keyboard.press('F7');await page.waitForFunction(()=>globalThis.__ATF_HUB__.depthPresentationV116);
  record('Native F7 flattens all decorative camera layers and restores depth without moving the player plane',{disabled,afterWalking:flat});
  before=await imported('workshop','logistics');a=inspect(before,'logistics');await screenshot('03-logistics-before.png');after=await walkTo(1270);b=inspect(after,'logistics');
  assert.equal(b.bounds.x,0);assert.equal(b.bounds.w,1920);assert.ok(after.camera-before.camera>400);assert.ok(b.nativeTiles.length>=2);
  const annexDelta=b.layers.map((l,i)=>l.drift-a.layers[i].drift);assert.ok(annexDelta[0]>annexDelta[1]&&annexDelta[1]>annexDelta[2]&&annexDelta[2]>0);
  await screenshot('04-logistics-after.png');record('Large logistics annex repeats native bays with distinct depth rather than stretching one room image',{before,after,delta:annexDelta});
  before=await imported('medical');a=inspect(before,'medical');const medical=HUB_DECKS[1].rooms.find(r=>r.id==='medical');after=await walkTo(medical.xStart+1000);b=inspect(after,'medical');
  assert.equal(b.presentationMode,'2d');assert.deepEqual(a.layers,b.layers);await screenshot('05-medical-frontal.png');
  record('Compact medical room retains frontal 2D art, native aspect and the physical walk rail',{before,after});
  await imported('bridge');await page.locator('#exit-hub').click();await page.locator('[data-view="settings"]').click();await page.locator('#setting-motion').check();
  await page.locator('[data-view="hub"]').click();await page.locator('#hub-canvas').focus();await page.waitForFunction(()=>globalThis.__ATF_HUB__.reducedMotion);
  before=await observed();a=inspect(before,'bridge');after=await walkTo(950);b=inspect(after,'bridge');assert.deepEqual(a.layers,b.layers);assert.ok(b.layers.every(l=>l.drift===0));
  record('Visible reduced-motion setting freezes depth parallax while native movement remains available',{before,after});
  before=await imported('vehicle-bay','proving-ground');const ground=HUB_ANNEX_BY_ID_V87['proving-ground'];await walkTo(ground.station.bounds.x+ground.station.bounds.w+8);
  await page.keyboard.press('KeyH');await page.waitForFunction(()=>{const h=globalThis.__ATF_HUB__,m=h?.getSnapshot().hubRoomParallaxV134?.current;
    return h?.hubTrainingV132?.active&&m?.context==='loader-training'&&m.nativeReady&&m.equipmentPanels?.length;});
  after=await observed();b=inspect(after,'proving-ground');assert.equal(b.context,'loader-training');assert.equal(b.bounds.y,132);assert.equal(b.bounds.y+b.bounds.h,370);
  assert.equal(b.bounds.w,2600);assert.ok(b.nativeTiles.length>=2);await screenshot('06-p5000-native-walls.png');
  // The real parked loader is a physical obstacle. Approach its control seat,
  // board with E, then drive it; walking through its hull is not a valid test.
  const atEntry=after.player.x;await page.keyboard.down('KeyD');try{await page.waitForFunction(x=>globalThis.__ATF_HUB__.player.x>x+50,atEntry,{timeout:8000});}finally{await page.keyboard.up('KeyD');}
  await page.keyboard.press('KeyE');await page.waitForFunction(()=>globalThis.__ATF_HUB__.hubTrainingV132.course.mounted);
  const loaderStart=await page.evaluate(()=>globalThis.__ATF_HUB__.hubTrainingV132.course.loader.x);
  await page.keyboard.down('KeyD');try{await page.waitForFunction(x=>globalThis.__ATF_HUB__.hubTrainingV132.course.loader.x>x+100,loaderStart,{timeout:8000});}finally{await page.keyboard.up('KeyD');}
  after=await observed();inspect(after,'proving-ground');await screenshot('07-p5000-native-driving.png');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!globalThis.__ATF_HUB__.hubTrainingV132?.active);
  record('P5000 background stays above the maximum load while native boarding, driving and course exit remain available',{before,course:after,returned:await observed()});
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';}
await main().catch(async error=>{report.status='failed';report.error={message:error.message,stack:error.stack};process.exitCode=1;
  try{await screenshot('failure.png');report.lastObservation=await observed();}catch{}}).finally(async()=>{
  report.finishedAt=new Date().toISOString();await fs.mkdir(output,{recursive:true});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
  await browser?.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,error:report.error?.message,report:join(output,'report.json')}));});
