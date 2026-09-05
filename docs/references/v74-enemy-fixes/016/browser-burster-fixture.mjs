import { GameEngine } from '../../../../src/game-v51-runtime.js';
import { GameEngine as ProductionEngine } from '../../../../src/game-production-runtime.js';
import { GameEngine as ResumeEngine } from '../../../../src/game-production-resume.js';
import { ENEMIES } from '../../../../src/content-core-v50.js';
import { resolveSpriteSheet, resolveEnemyAnimation, SpriteAnimationController } from '../../../../src/sprite-animation-runtime.js';
import { BURSTER_COMBAT_V74 as contract, getBursterTerminalAnimationV74, getEnemyBatchAttackFrameV66 } from '../../../../src/enemy-batch-combat-v66.js';

const check = (value, label) => { if (!value) throw new Error(label); };
const near = (a,b) => Math.abs(a-b)<1e-6;
const actor = (x) => ({x,y:838,w:42,h:92,alive:true,health:100,maxHealth:100,armor:0,maxArmor:100,kills:0,damageTaken:0,facing:-1,vx:0,vy:0,grounded:true});
const storageSnapshot = () => JSON.stringify(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]));
async function loadImage(path) {const image=new Image();image.src=path;await image.decode();return image;}

export function createBursterBrowserFixture(Engine=ProductionEngine,facing=1,centerDistance=78) {
  const engine=Object.create(Engine.prototype),events=[],damage=[];
  Object.assign(engine,{
    animationTime:0,random:()=>0.5,images:new Map(),particles:[],drops:[],enemies:[],
    player:actor(0),coop:actor(1600),coopEnabled:false,squadActors:[],walls:[],covers:[],doors:[],ladders:[],lifts:[],
    missionLevelBounds:{width:6200,height:1080},platforms:[{id:'floor',x:0,y:930,w:6200,h:40}],
    stealthRuntime:{detectionRadius:900,spottedBy:new Set(),visibility:100,noise:0},
    resumeIdentity:{seed:16},mission:{state:'active',phase:'insertion',objectives:{},elapsed:0,retries:0,casualties:0},
    onEvent(event){events.push(event);},
    damagePlayer(target,amount){target.health-=amount;damage.push({route:'player',amount});},
    damageSquadMember(target,amount){target.health-=amount;damage.push({route:'squad',amount});},
    damageVehicle(amount){this.vehicle.hull-=amount;damage.push({route:'vehicle',amount});}
  });
  if(Engine===ProductionEngine){engine.missionLevelRuntime={};engine.missionVentNetworkV62={id:'burster-v74-fixture'};}
  else engine.activeSquadActors=function(){return this.squadActors;};
  const source=ENEMIES.find(entry=>entry.id===contract.profileId);
  const enemy=GameEngine.prototype.createEnemy.call(engine,source,0,600,930);
  Object.assign(enemy,{alert:true,facing,attackClock:0,
    levelNavigation:{mode:'surface',surfaceId:'floor',connectorId:null,destinationY:null,riding:false,lastSafeX:600,lastSafeY:842}});
  engine.player.x=enemy.x+enemy.w/2+facing*centerDistance-engine.player.w/2;
  engine.player.facing=-facing;
  engine.enemies.push(enemy);
  const step=(delta)=>{
    // The shipped main update owns corpse countdown; updateEnemy does not.
    // Isolate that same countdown while retaining real enemy behavior below.
    if(!enemy.alive)enemy.deathClock=Math.max(0,enemy.deathClock-Math.max(0,delta));
    engine.animationTime+=delta;engine.updateEnemy(enemy,delta);
  };
  const arm=()=>{step(0);check(enemy.batchAttackV66?.targetId==='player','dedicated Burster did not arm');};
  return {engine,enemy,events,damage,step,arm};
}

export async function runBursterBrowserFixture(){
  const storageBefore=storageSnapshot();
  const sheet=resolveSpriteSheet(contract.sheetId);
  check(sheet?.renderWidth===256&&sheet?.renderHeight===256,'Burster isotropic256 runtime entry missing');
  const image=await loadImage(sheet.path);
  const marineSheet=resolveSpriteSheet('player.echo9-marine.locomotion');
  const marineImage=await loadImage(marineSheet.path);
  const canvas=document.querySelector('#timeline'),ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#152029';ctx.fillRect(0,0,canvas.width,canvas.height);
  const impactCanvas=document.querySelector('#impact'),impactCtx=impactCanvas.getContext('2d');
  impactCtx.imageSmoothingEnabled=false;impactCtx.fillStyle='#152029';impactCtx.fillRect(0,0,impactCanvas.width,impactCanvas.height);
  const cases=[],obstacles=[],resumes=[],triggerBounds=[];
  const setupRendering=(fix)=>{
    fix.engine.images.set(sheet.imageKey,image);fix.engine.images.set(marineSheet.imageKey,marineImage);
    fix.engine.spriteAnimation=new SpriteAnimationController();
  };
  const renderTimeline=(fix,index,label)=>{
    const left=index%4*340,top=Math.floor(index/4)*180,floor=top+155;
    ctx.save();ctx.translate(left+165-(fix.enemy.x+44),floor-930);
    fix.engine.drawEnemy(ctx,fix.enemy);
    ctx.strokeStyle='#ba9456';ctx.strokeRect(fix.enemy.x,fix.enemy.y,fix.enemy.w,fix.enemy.h);
    ctx.restore();ctx.strokeStyle='#507a88';ctx.beginPath();ctx.moveTo(left+8,floor);ctx.lineTo(left+332,floor);ctx.stroke();
    ctx.fillStyle='#e0e9ec';ctx.font='14px sans-serif';ctx.fillText(label,left+10,top+24);
  };
  for(const [label,Engine]of[['V51',GameEngine],['V52 production',ProductionEngine]]){
    for(const facing of[1,-1]){
      const fix=createBursterBrowserFixture(Engine,facing);setupRendering(fix);
      const {engine,enemy,events,damage,step,arm}=fix;
      check(near(enemy.w,88)&&near(enemy.h,88),'actual body differs from reviewed88x88');
      const origin={x:enemy.x,y:enemy.y};
      arm();const pressure=[getEnemyBatchAttackFrameV66(enemy)],death=[];
      if(Engine===ProductionEngine&&facing===1)renderTimeline(fix,0,'pression1 · vivant · 0dégât');
      for(let i=1;i<6;i++){
        step(1/12);pressure.push(getEnemyBatchAttackFrameV66(enemy));
        check(enemy.alive&&damage.length===0,'premature detonation');
        if(Engine===ProductionEngine&&facing===1)renderTimeline(fix,i,'pression'+(i+1)+' · vivant · 0dégât');
      }
      step(1/12);
      check(!enemy.alive&&enemy.bursterDetonatedV74===true,'real detonation did not defeat actor');
      pressure.push(getBursterTerminalAnimationV74(enemy).frame-16);
      if(Engine===ProductionEngine&&facing===1)renderTimeline(fix,6,'pression7 · explosion · acteur mort');
      const atImpact={hp:engine.player.health,hits:damage.length,damage:damage[0]?.amount,
        frame:resolveEnemyAnimation(enemy).frame,particles:engine.particles.length,deathClock:enemy.deathClock};
      if(Engine===ProductionEngine){
        const panel=facing===1?0:1,offsetX=panel*680+280-(enemy.x+44);
        impactCtx.save();impactCtx.translate(offsetX,280-930);
        engine.drawEnemy(impactCtx,enemy);
        const sample=engine.spriteAnimation.sample('marine'+facing,{sheetId:marineSheet.id,clipId:'idle',frame:0},0,{emit:false});
        engine.drawSpriteSample(impactCtx,sample,engine.player);
        // Visual diagnostic of ACTUAL spawnImpact particle data, no invented explosion sheet.
        for(const particle of engine.particles){
          impactCtx.globalAlpha=Math.min(1,particle.life*3);impactCtx.fillStyle=particle.color;
          impactCtx.fillRect(particle.x,particle.y,4,4);
        }
        impactCtx.globalAlpha=1;impactCtx.strokeStyle='#bfa064';impactCtx.strokeRect(enemy.x,enemy.y,enemy.w,enemy.h);
        impactCtx.restore();
        impactCtx.fillStyle='#dce9ed';impactCtx.font='15px sans-serif';
        impactCtx.fillText((facing===1?'→':'←')+' compression7 : '+atImpact.damage+'dégâts uniques /24particules',panel*680+20,320);
        check(near(enemy.spritePivot.world.x,enemy.x+44)&&near(enemy.spritePivot.world.y,930),'production root drift');
        atImpact.pivot={...enemy.spritePivot.world};
      }
      step(1/12);pressure.push(getBursterTerminalAnimationV74(enemy).frame-16);
      if(Engine===ProductionEngine&&facing===1)renderTimeline(fix,7,'pression8 · aucune2eexplosion');
      step(1/12);death.push(getBursterTerminalAnimationV74(enemy).frame);
      if(Engine===ProductionEngine&&facing===1)renderTimeline(fix,8,'mort1 · cellule24');
      for(let i=1;i<8;i++){
        step(0.1);death.push(getBursterTerminalAnimationV74(enemy).frame);
        if(Engine===ProductionEngine&&facing===1)renderTimeline(fix,8+i,'mort'+(i+1)+' · cellule'+(24+i));
      }
      step(1);
      const terminal=getBursterTerminalAnimationV74(enemy);
      const result={engine:label,facing,body:[enemy.w,enemy.h],pressure,death,atImpact,
        terminal,displacement:[enemy.x-origin.x,enemy.y-origin.y],totalHits:damage.length,
        detonationEvents:events.filter(e=>e.type==='enemy-detonation').length,
        killEvents:events.filter(e=>e.type==='kill').length,drops:engine.drops.length,
        repeatDetonationRejected:engine.detonateEnemy(enemy,engine.player)===false};
      check(pressure.join()==='0,1,2,3,4,5,6,7'&&death.join()==='24,25,26,27,28,29,30,31','missing pressure/death cells');
      check(result.totalHits===1&&result.detonationEvents===1&&result.killEvents===1&&result.drops===1
        &&terminal.frame===31&&result.repeatDetonationRejected&&result.displacement.every(v=>v===0),'terminal one-shot failed');
      cases.push(result);
    }
  }
  for(const facing of[1,-1]){
    for(const separation of[107,109]){
      const fix=createBursterBrowserFixture(ProductionEngine,facing,separation);fix.step(0);
      const armed=Boolean(fix.enemy.batchAttackV66);
      check(armed===(separation<contract.meleeRange),'asymmetric Burster trigger at center separation'+separation+' facing'+facing);
      triggerBounds.push({facing,centerSeparation:separation,armed});
    }
    for(const kind of['wall','door','cover']){
      const fix=createBursterBrowserFixture(ProductionEngine,facing);fix.arm();
      const block={id:'block',x:facing===1?694:592,y:790,w:2,h:140};
      if(kind==='wall')fix.engine.walls.push(block);
      if(kind==='door')fix.engine.doors.push({...block,progress:0});
      if(kind==='cover')fix.engine.covers.push({...block,destroyed:false});
      fix.step(contract.impact);
      const result={facing,kind,alive:fix.enemy.alive,damage:fix.damage.length,
        detonations:fix.events.filter(e=>e.type==='enemy-detonation').length,attackCancelled:!fix.enemy.batchAttackV66};
      check(result.alive&&result.damage===0&&result.detonations===0&&result.attackCancelled,'obstacle failed '+JSON.stringify(result));
      obstacles.push(result);
    }
  }
  for(const phase of['compression','detonated']){
    const original=createBursterBrowserFixture();original.arm();original.step(phase==='detonated'?contract.impact:0.25);
    const snapshot=JSON.parse(JSON.stringify(ResumeEngine.prototype.captureResumeState.call(original.engine)));
    const savedEnemy=snapshot.enemies[0];
    check(!('batchAttackV66'in savedEnemy)&&!('targetId'in savedEnemy)&&!('elapsed'in savedEnemy),'attack cursor leaked to snapshot');
    const restored=createBursterBrowserFixture();
    const restoration=ResumeEngine.prototype.applyResumeState.call(restored.engine,snapshot);
    check(restoration.applied&&restored.enemy.batchAttackV66===null,'real snapshot restoration failed');
    restored.step(0.5);
    const result={phase,applied:restoration.applied,alive:restored.enemy.alive,
      terminalFlag:savedEnemy.bursterDetonatedV74,newHits:restored.damage.length,
      newDetonations:restored.events.filter(e=>e.type==='enemy-detonation').length,
      pendingAttack:restored.enemy.batchAttackV66,corpseAnimation:getBursterTerminalAnimationV74(restored.enemy),
      drops:restored.engine.drops.length,snapshotContainsTargetOrCursor:false};
    check(result.newHits===0&&result.newDetonations===0&&result.alive===(phase==='compression'),'snapshot re-exploded');
    resumes.push(result);
  }
  const report={schema:1,profileId:contract.profileId,scope:'Isolated real createEnemy/update/detonate/defeat/captureResumeState/applyResumeState and V52 drawEnemy; no full campaign claim',
    sheet:contract.sheetId,render:[sheet.renderWidth,sheet.renderHeight],imageSize:[image.naturalWidth,image.naturalHeight],
    cases,obstacles,resumes,triggerBounds,storageUnchanged:storageBefore===storageSnapshot(),
    particlesAreActualEngineData:true,dedicatedExplosionSheet:false,registryMutations:false,acceptedByFixture:false};
  check(report.storageUnchanged,'persistent storage changed');
  globalThis.bursterFixtureReport=report;
  document.querySelector('#result').textContent=JSON.stringify(report,null,2);
  document.querySelector('#status').textContent='PASS — 4combats, 6obstacles, 2restaurations ; explosion unique, mort tenue, sauvegarde inchangée.';
  return report;
}
