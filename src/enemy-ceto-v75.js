// Ceto051 only. Habitat bounds are explicit level data, never inferred from a name.
export const CETO_V75 = Object.freeze({
  profileId: 'enemy-051-ceto-reef-predator', sheetId: 'enemy.profile.enemy-051-ceto-reef-predator.v66',
  pivot: Object.freeze({ x: 128, y: 192 }), pivotId: 'ceto-aquatic-keel-v75',
  renderWidth: 384, renderHeight: 384, bodyWidth: 156, bodyHeight: 100,
  fps: 12, windup: 3 / 12, impact: 4 / 12, duration: 8 / 12,
  stopSurface: 121, biteSurface: 127, lunge: 64, cooldown: 1.4, speed: 105,
  verticalReach: 60, detection: 560, corpseLifetime: 2.8
});
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const overlaps = (a,b) => a && b && a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const center = a => ({x:a.x+a.w/2,y:a.y+a.h/2});
export const isCetoV75 = enemy => enemy?.visualSheetId === CETO_V75.sheetId;

// Persist only a bounded recovery and an interruption marker. A pending bite
// belongs to the current simulation and must never survive a mission restore.
export function captureCetoResumeV75(enemy) {
  return isCetoV75(enemy) ? {
    attackClock: clamp(n(enemy.attackClock), 0, CETO_V75.cooldown),
    cetoAttackActiveV75: Boolean(enemy.cetoAttackV75)
  } : {};
}
export function restoreCetoResumeV75(enemy, source = {}) {
  if (!isCetoV75(enemy)) return false;
  const existing = clamp(n(enemy.attackClock), 0, CETO_V75.cooldown);
  enemy.attackClock = Math.max(clamp(n(source?.attackClock, existing), 0, CETO_V75.cooldown),
    source?.cetoAttackActiveV75 === true ? CETO_V75.duration : 0);
  enemy.cetoAttackV75 = null;
  enemy.attacking = false;
  enemy.attackAnimationClock = 0;
  enemy.attackWindupClock = 0;
  enemy.pendingMelee = false;
  enemy.pendingMeleeTargetId = null;
  enemy.vx = 0;
  enemy.vy = 0;
  return true;
}

// New authored tidal alcove, not a claim that the old 20px flood hazards were
// swimmable. Only Ceto's planetary cave-a -> cave-b room receives it. The water
// ends at the highest existing bed platform; other routes and floors stay intact.
export function buildCetoHabitatsV75({world, templateId, geometry, graph} = {}) {
  if(world?.id !== 'world-10-ceto' || templateId !== 'planet-exterior') return Object.freeze([]);
  const a=graph?.nodes?.find(node=>node.id==='planet-cave-a');
  const b=graph?.nodes?.find(node=>node.id==='planet-cave-b');
  if(!a||!b||b.x-a.x<500) return Object.freeze([]);
  const x=a.x-80,w=b.x-a.x+160;
  const bed=(geometry?.platforms||[]).filter(p=>p.zoneId==='planet-caves'&&p.x<x+w&&p.x+p.w>x);
  if(!bed.length)return Object.freeze([]);
  const floor=Math.min(...bed.map(p=>p.y));
  const waterline=floor-136;
  if(waterline<0)return Object.freeze([]);
  return Object.freeze([Object.freeze({id:'ceto-cave-tidal-basin-v75',kind:'water',worldId:world.id,
    zoneId:'planet-caves',x,y:waterline,w,h:136,active:true,sourceNodeIds:Object.freeze([a.id,b.id]),
    sourcePlatformIds:Object.freeze(bed.map(p=>p.id)),
    surfacePlatformId:bed.find(p=>p.y===floor).id,
    spawnRoot:Object.freeze({x:(a.x+b.x)/2,y:floor-12}),
    authoredAddition:true,marineMode:'wading-on-existing-bed',freeSwimImplemented:false})]);
}
export function cetoHabitatHazardsV75(habitats) {
  return habitats.map(v=>Object.freeze({...v,id:v.id+'-waterline',kind:'flood',effect:'drag',
    damage:0,slow:0.7,cetoHabitatId:v.id,visualOnlyWaterVolume:false}));
}
export const containsCetoBodyV75 = (v,a) => Boolean(v?.active && a && a.x>=v.x-1e-6
  && a.x+a.w<=v.x+v.w+1e-6&&a.y>=v.y-1e-6&&a.y+a.h<=v.y+v.h+1e-6);
const volumes = e => (e.missionLevelRuntime?.aquaticHabitats || e.cetoHabitatsV75 || []).filter(v=>v.kind==='water'&&v.active&&v.w>=156&&v.h>=100);
const blockers = e => [...(e.walls||[]),...(e.covers||[]).filter(x=>!x.destroyed),
  ...(e.doors||[]).filter(x=>n(x.progress)<0.85),...(e.platforms||[])];
const valid = a => Boolean(a&&a.alive&&!a.downed&&!a.lost&&!a.ventTransit);
const pool = e => [e.player,e.coopEnabled?e.coop:null,...(typeof e.activeSquadActors==='function'?e.activeSquadActors():e.squadActors||[])].filter(valid);
const idOf = (e,a) => a===e.player?'player':a===e.coop?'coop':String(a.crewId||a.id||'');
const entityOf = (e,a) => a.inVehicle ? (e.vehicle?.active&&!e.vehicle.destroyed?e.vehicle:null) : a;
const surfaceGap = (enemy,target) => {
  const c=center(enemy).x;
  return target.x>c?target.x-c:target.x+target.w<c?c-target.x-target.w:0;
};
const direction = (enemy,target) => Math.sign(center(target).x-center(enemy).x)||enemy.facing||1;
function clearStrike(e,enemy,target) {
  const a=center(enemy),b=center(target);
  const left=Math.min(a.x,b.x),right=Math.max(a.x,b.x),top=Math.min(a.y,b.y)-3,bottom=Math.max(a.y,b.y)+3;
  return !blockers(e).some(ob=>ob.x<right&&ob.x+ob.w>left&&ob.y<bottom&&ob.y+ob.h>top);
}
function legalTarget(e,enemy,actor,volume) {
  const target=valid(actor)&&entityOf(e,actor);
  return target && overlaps(volume,target) && Math.abs(center(target).y-center(enemy).y)<=CETO_V75.verticalReach
    && clearStrike(e,enemy,target) ? target : null;
}
function cancel(enemy) {
  if(enemy.cetoAttackV75)enemy.attackClock=Math.max(n(enemy.attackClock),CETO_V75.cooldown);
  enemy.cetoAttackV75=null;enemy.attacking=false;enemy.vx=0;enemy.vy=0;
}
export function moveCetoWithinHabitatV75(engine,enemy,volume,dx,dy) {
  const start={x:enemy.x,y:enemy.y};
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/6));
  for(let i=0;i<steps;i++) {
    const next={...enemy,x:enemy.x+dx/steps,y:enemy.y+dy/steps};
    if(!containsCetoBodyV75(volume,next)||blockers(engine).some(b=>overlaps(next,b)))
      return {x:enemy.x-start.x,y:enemy.y-start.y,blocked:true};
    enemy.x=next.x;enemy.y=next.y;
  }
  return {x:enemy.x-start.x,y:enemy.y-start.y,blocked:false};
}
export function updateCetoV75(engine,enemy,delta) {
  if(!isCetoV75(enemy))return false;
  const dt=clamp(n(delta),0,0.5),start={x:enemy.x,y:enemy.y};
  const volume=volumes(engine).find(v=>v.id===enemy.cetoHabitatId&&containsCetoBodyV75(v,enemy))
    || volumes(engine).find(v=>containsCetoBodyV75(v,enemy));
  if(!volume){cancel(enemy);enemy.cetoHabitatBlockedV75=true;return true;}
  enemy.cetoHabitatId=volume.id;enemy.cetoHabitatBlockedV75=false;
  if(!enemy.alive){
    cancel(enemy);
    // Main engine owns deathClock. Sink only within the actual water column.
    moveCetoWithinHabitatV75(engine,enemy,volume,0,Math.min(dt*42,volume.y+volume.h-enemy.y-enemy.h));
    return true;
  }
  enemy.attackClock=Math.max(0,n(enemy.attackClock)-dt);
  if(enemy.dormant||enemy.ventTransit||['hurtClock','v52HurtClock','staggerClock','jammedClock'].some(k=>n(enemy[k])>0)){
    for(const k of ['hurtClock','v52HurtClock','staggerClock','jammedClock'])enemy[k]=Math.max(0,n(enemy[k])-dt);
    cancel(enemy);return true;
  }
  let attack=enemy.cetoAttackV75;
  let actor=attack?pool(engine).find(a=>idOf(engine,a)===attack.targetId):pool(engine)
    .filter(a=>legalTarget(engine,enemy,a,volume)).sort((a,b)=>surfaceGap(enemy,entityOf(engine,a))-surfaceGap(enemy,entityOf(engine,b)))[0];
  let target=legalTarget(engine,enemy,actor,volume);
  if(attack&&!target){cancel(enemy);return true;}
  if(!target){enemy.attacking=false;enemy.vx=0;enemy.vy=0;return true;}
  const facing=direction(enemy,target);
  if(attack&&facing!==attack.facing){cancel(enemy);return true;}
  enemy.facing=attack?.facing||facing;
  const gap=surfaceGap(enemy,target);
  if(!attack&&gap>CETO_V75.detection){enemy.vx=0;return true;}
  if(!attack&&enemy.attackClock===0&&gap<=CETO_V75.biteSurface+CETO_V75.lunge){
    attack=enemy.cetoAttackV75={targetId:idOf(engine,actor),elapsed:0,facing:enemy.facing,travelled:0,
      distance:Math.min(CETO_V75.lunge,Math.max(0,gap-CETO_V75.stopSurface)),impactConsumed:false};
    enemy.attacking=true;
  }
  if(attack){
    const before=attack.elapsed;attack.elapsed=Math.min(CETO_V75.duration,before+dt);enemy.attacking=true;
    if(attack.elapsed>CETO_V75.windup){
      const desired=attack.distance*clamp((attack.elapsed-CETO_V75.windup)/(CETO_V75.impact-CETO_V75.windup),0,1);
      const moved=moveCetoWithinHabitatV75(engine,enemy,volume,attack.facing*(desired-attack.travelled),0);
      attack.travelled+=Math.abs(moved.x);
      if(moved.blocked){cancel(enemy);return true;}
    }
    if(!attack.impactConsumed&&attack.elapsed+1e-9>=CETO_V75.impact){
      attack.impactConsumed=true; // latch BEFORE delivery protects callback re-entry.
      target=legalTarget(engine,enemy,actor,volume);
      if(target&&direction(enemy,target)===attack.facing&&surfaceGap(enemy,target)<=CETO_V75.biteSurface){
        if(actor.inVehicle)engine.damageVehicle?.(enemy.damage);
        else if(actor===engine.player||actor===engine.coop)engine.damagePlayer?.(actor,enemy.damage);
        else engine.damageSquadMember?.(actor,enemy.damage);
        engine.onEvent?.({type:'enemy-attack-impact',enemyId:enemy.id,profileId:CETO_V75.profileId,action:'aquatic-bite',targetId:attack.targetId,frame:4});
      }
    }
    if(attack.elapsed+1e-9>=CETO_V75.duration){enemy.cetoAttackV75=null;enemy.attacking=false;enemy.attackClock=CETO_V75.cooldown;}
  }else if(gap>CETO_V75.stopSurface){
    const dx=enemy.facing*Math.min(Math.max(0,gap-CETO_V75.stopSurface),CETO_V75.speed*dt);
    // A marine standing on the bed has a lower centre than this taller body.
    // Aim at the nearest reachable depth so downward intent at the bed cannot
    // reject an otherwise legal horizontal swimming step forever.
    const targetY=clamp(center(target).y-enemy.h/2,volume.y,volume.y+volume.h-enemy.h);
    const dy=clamp(targetY-enemy.y,-45*dt,45*dt);
    moveCetoWithinHabitatV75(engine,enemy,volume,dx,dy);
  }
  enemy.vx=dt?(enemy.x-start.x)/dt:0;enemy.vy=dt?(enemy.y-start.y)/dt:0;
  return true;
}
export function getCetoAnimationV75(enemy) {
  if(!isCetoV75(enemy))return null;
  if(!enemy.alive)return {sheetId:CETO_V75.sheetId,clipId:'death',
    frame:24+Math.min(7,Math.floor(Math.max(0,CETO_V75.corpseLifetime-n(enemy.deathClock))*10+1e-9))};
  if(enemy.cetoAttackV75)return {sheetId:CETO_V75.sheetId,clipId:'attack',
    frame:16+Math.min(7,Math.floor(n(enemy.cetoAttackV75.elapsed)*12+1e-9))};
  return {sheetId:CETO_V75.sheetId,clipId:Math.hypot(n(enemy.vx),n(enemy.vy))>8?'move':'idle'};
}
