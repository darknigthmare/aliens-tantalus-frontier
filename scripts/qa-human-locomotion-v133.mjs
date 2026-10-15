import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// Human QA #3 uses the real save picker, hub/Command UI and keyboard. Every
// browser evaluation only reads the rendered runtime or its actual framebuffer.
const baseUrl=process.env.ATF_BASE_URL||'http://127.0.0.1:4173';
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(process.env.ATF_HUMAN_QA_OUTPUT||join(tmpdir(),`atf-human-locomotion-v133-${Date.now()}`));
const relativeOutput=relative(repository,output);
if(!relativeOutput||!relativeOutput.startsWith('..')&&!isAbsolute(relativeOutput))throw new Error('Human QA captures must be outside the repository.');
async function playwright(){if(process.env.ATF_PLAYWRIGHT_MODULE)return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try{return await import('playwright');}catch(error){if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'__human_qa__.cjs'))('playwright');throw error;}}
const report={schema:133,qaHumanNumber:3,startedAt:new Date().toISOString(),checks:[],captures:[],pageErrors:[],requestFailures:[],
  limitations:['Legacy human profile imported through the real save UI with local co-op enabled. No editor mission or runtime actor is injected.',
    'The short bridge walk and standard ship insertion exercise gait. Hub station/focus/circuit and broader mission completion are covered by separate human QA runs.',
    'Native images remain project adaptations; this is not a motion-capture or canon animation claim.']};
let browser,page;
async function snapshot(kind='mission'){
  return page.evaluate(kind=>{
    const engine=kind==='hub'?globalThis.__ATF_HUB__:globalThis.__ATF_GAME__;
    if(!engine?.player)return null;
    const read=actor=>actor&&({x:actor.x,y:actor.y,w:actor.w,h:actor.h,vx:actor.vx,vy:actor.vy,facing:actor.facing,
      grounded:actor.grounded,climbing:actor.climbing,alive:actor.alive,shots:actor.shots,ammo:actor.ammo,
      state:actor.playerLocomotionStateV129||null,locomotion:actor.playerLocomotionVisualV129||null,
      appearance:actor.playerAppearanceVisualV126||null,heldWeapon:actor.heldWeaponVisualV125||null,
      transit:actor.playerTransitVisualV128||null,humanVisual:actor.humanVisualV133||null});
    return {kind,running:engine.running,paused:engine.paused,loading:!!(engine.enemyAtlasLoadingPausedV65||engine.userCasteLoadingV88),
      time:engine.animationTime,camera:{x:engine.camera?.x,y:engine.camera?.y},player:read(engine.player),
      coop:engine.coopEnabled?read(engine.coop):null,npcs:(kind==='hub'?engine.npcs||[]:engine.squadActors||[]).map(actor=>({id:actor.id||actor.crewId,x:actor.x,y:actor.y,w:actor.w,h:actor.h,vx:actor.vx,visual:actor.humanVisualV133||null})),
      npcCadences:[...((kind==='hub'?engine.hubNpcAnimation:engine.spriteAnimation)?.humanPatrolStatesV133?.entries()||[])].map(([id,state])=>({id,...state})),
      mission:engine.mission?.state,canvas:document.querySelector(kind==='hub'?'#hub-canvas':'#game-canvas').toDataURL('image/png')};
  },kind);
}
function evidence(frame){if(!frame)return null;const{canvas,...state}=frame;return state;}
const check=(label,state)=>report.checks.push({label,evidence:state});
async function capture(file,kind){const frame=await snapshot(kind);await fs.writeFile(join(output,file),Buffer.from(frame.canvas.split(',')[1],'base64'));report.captures.push({file,kind,state:evidence(frame)});return frame;}
async function gaitSamples(kind,key,frames=18){
  const observations=[];await page.keyboard.down(key);
  try{for(let n=0;n<frames;n++){await page.waitForTimeout(16);const frame=await snapshot(kind);observations.push(evidence(frame));if([0,6,12,17].includes(n)){
      const file=`${kind}-${key.toLowerCase()}-${String(n).padStart(2,'0')}.png`;await fs.writeFile(join(output,file),Buffer.from(frame.canvas.split(',')[1],'base64'));report.captures.push({file,kind,state:evidence(frame)});}}}
  finally{await page.keyboard.up(key);}return observations;
}
function certifyGait(samples,label){
  const moving=samples.filter(sample=>sample.player.state?.moving&&sample.player.locomotion?.drawn);assert.ok(moving.length>8,`${label}: actual rendered grounded movement is required.`);
  const speed= Math.max(...moving.map(sample=>Math.abs(sample.player.vx)));assert.ok(speed>130);
  const steps=moving.map(sample=>sample.player.locomotion.presentationV133?.stepsPerSecond);assert.ok(steps.every(value=>Number.isFinite(value)&&value<5.2));
  let planted=0,hips=0,maximumSlide=0,maxLift=0;
  for(let n=0;n<samples.length;n++){
    const current=samples[n].player,previous=samples[n-1]?.player,rig=current.locomotion;if(!rig?.drawn)continue;
    assert.ok(Math.abs(rig.presentationV133.standingHeight-96.5)<.01);
    for(const side of ['near','far']){const leg=rig.legs[side],contact=rig.contacts.feet[side];maxLift=Math.max(maxLift,contact.lift||0);
      assert.ok(!leg.reachClamped);assert.ok(leg.heel.y<=current.y+current.h+.001&&leg.toe.y<=current.y+current.h+.001);
      if(previous?.locomotion?.contacts.feet[side].planted&&contact.planted&&Math.abs(previous.y-current.y)<.01&&previous.facing===current.facing){
        const old=previous.locomotion.contacts.feet[side].point;maximumSlide=Math.max(maximumSlide,Math.hypot(old.x-contact.point.x,old.y-contact.point.y));planted++;
      }hips++;
    }
  }
  assert.ok(planted>3,`${label}: verify actual consecutive foot contacts.`);assert.ok(maximumSlide<.01);assert.ok(maxLift<=6.01);
  return {actualSamples:samples.length,movingSamples:moving.length,groundedContacts:planted,checkedLegs:hips,maximumSlide,maxLift,maxSpeed:speed,maxStepsPerSecond:Math.max(...steps),start:samples[0].player.x,end:samples.at(-1).player.x};
}
async function main(){
  await fs.mkdir(output,{recursive:true});const module=await playwright(),{chromium}=module.chromium?module:module.default;
  browser=await chromium.launch({headless:true,...(process.env.ATF_CHROMIUM_EXECUTABLE?{executablePath:process.env.ATF_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(25000);
  page.on('pageerror',error=>report.pageErrors.push(error.message));page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});await page.locator('#title-start').click({timeout:45000});await page.locator('#title-options').click();
  const save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='command';save.settings.coop=true;
  await page.locator('#save-import').setInputFiles({name:'human-gait-idle-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.getByText('Sauvegarde importée et migrée.',{exact:true}).waitFor();await page.locator('[data-view="hub"]').click();
  await page.waitForFunction(()=>globalThis.__ATF_HUB__?.running&&globalThis.__ATF_HUB__.player?.playerAppearanceVisualV126?.drawn);
  await page.locator('#hub-canvas').focus();await capture('01-bridge-idle.png','hub');
  const hubRight=await gaitSamples('hub','KeyD');check('Bridge walking has measured ground support, subdued boot lift and distance-driven human cadence',certifyGait(hubRight,'hub right'));
  await page.waitForTimeout(450);let stopped=await snapshot('hub');assert.equal(stopped.player.state.moving,false);assert.equal(stopped.player.locomotion.presentationV133.stepsPerSecond,0);
  const phase=stopped.player.state.cycles;await page.waitForTimeout(200);closePhase((await snapshot('hub')).player.state.cycles,phase);check('Releasing movement settles the boots once without walking in place',evidence(stopped));
  const hubLeft=await gaitSamples('hub','KeyA');check('The mirrored return keeps native proportions and planted world contacts',certifyGait(hubLeft,'hub left'));
  const npcCadences=[...hubRight,...hubLeft].flatMap(sample=>sample.npcCadences||[]).filter(state=>state.moving&&state.distance>1);
  assert.ok(npcCadences.length>2,'Actual moving bridge NPCs need a measured distance-driven atlas cycle.');
  assert.ok(npcCadences.every(state=>state.stepsPerSecond>0&&state.stepsPerSecond<5.2));
  check('Bridge NPC patrol frames advance through their observed physical distance rather than a fixed fast clock',{samples:npcCadences.length,maxStepsPerSecond:Math.max(...npcCadences.map(state=>state.stepsPerSecond)),distance:Math.max(...npcCadences.map(state=>state.distance))});
  await page.waitForTimeout(350);await capture('02-bridge-return.png','hub');await page.locator('#exit-hub').click();
  await page.locator('#command-mission-v110').selectOption('pair-004-frontier');await page.locator('#operation-launch').click();
  for(let n=0;n<16;n++){if(await page.evaluate(()=>!!globalThis.__ATF_GAME__?.running))break;const advance=page.locator('[data-insertion-action="advance"]');if(await advance.isVisible())await advance.click();await page.waitForTimeout(350);}
  await page.waitForFunction(()=>{const e=globalThis.__ATF_GAME__;return e?.running&&!e.paused&&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&e.player?.grounded&&e.player.playerAppearanceVisualV126?.drawn;},null,{timeout:45000});
  await page.locator('#game-canvas').focus();const deployed=await capture('03-standard-ship-j1-j2.png','mission');assert.ok(deployed.coop?.appearance?.drawn);
  assert.equal(deployed.player.locomotion.presentationV133.standingHeight,deployed.coop.locomotion.presentationV133.standingHeight);
  check('Actual J1 and J2 deployment retains identities and the bridge stature',evidence(deployed));
  const mission=await gaitSamples('mission','KeyD');check('The same human gait runs through actual ship collision physics',certifyGait(mission,'ship'));
  await page.waitForTimeout(300);await page.keyboard.press('Space');
  await page.waitForFunction(()=>globalThis.__ATF_GAME__.player.grounded===false);const air=await capture('04-real-jump.png','mission');
  assert.equal(air.player.locomotion.contacts.floorY,null);assert.ok(Object.values(air.player.locomotion.contacts.feet).every(foot=>!foot.planted));
  await page.waitForFunction(()=>globalThis.__ATF_GAME__.player.grounded===true);check('Actual jump preserves articulated anatomy and invents no airborne floor contacts',evidence(air));
  await page.keyboard.down('ShiftLeft');await page.keyboard.press('KeyD');await page.keyboard.down('KeyF');await page.waitForTimeout(180);await page.keyboard.up('KeyF');await page.keyboard.up('ShiftLeft');
  const fired=await capture('05-actual-aimed-fire.png','mission');assert.ok(fired.player.shots>deployed.player.shots);
  assert.ok(fired.player.heldWeapon&&fired.player.heldWeapon.nearReachError<1e-5&&fired.player.heldWeapon.farReachError<1e-5);
  check('Actual aimed fire keeps the muzzle, rigid weapon and both articulated hand contacts coherent',evidence(fired));
  await page.keyboard.press('KeyP');const pause=await snapshot('mission');await page.waitForTimeout(300);const after=await snapshot('mission');
  assert.deepEqual(after.player.state,pause.player.state);assert.deepEqual(after.player.locomotion,pause.player.locomotion);check('Pause leaves both distance phase and rendered foot rig unchanged',evidence(after));
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';
}
function closePhase(a,b){assert.ok(Math.abs(a-b)<1e-9);}
await main().catch(async error=>{report.status='failed';report.error={message:error.message,stack:error.stack};process.exitCode=1;if(page){report.lastHub=evidence(await snapshot('hub').catch(()=>({})));report.lastMission=evidence(await snapshot('mission').catch(()=>({})));await page.screenshot({path:join(output,'failure.png'),fullPage:true}).catch(()=>{});}}).finally(async()=>{report.finishedAt=new Date().toISOString();await fs.mkdir(output,{recursive:true});await fs.writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await browser?.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,error:report.error?.message,report:join(output,'report.json')}));});
