// Lab awareness is saved against the existing physical population. A present
// malformed cursor is rejected, never clamped into a fresh attack opportunity.
import { ENEMY_PATROL_V140, restoreEnemyPatrolV140 } from './enemy-patrol-v140.js';
const record=value=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
const finite=(value,min=0,max=604800)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
const integer=(value,max=999999999)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
const keys=(value,allowed)=>Object.keys(value).every(key=>allowed.includes(key));
const modes=['patrol','suspicion','investigation','search','pursuit'];
const clone=value=>JSON.parse(JSON.stringify(value));
const box=value=>record(value)&&keys(value,['x','y','w','h','floorY'])&&finite(value.x,0,2880)&&finite(value.y,0,720)
  &&finite(value.w,1,1000)&&finite(value.h,1,720)&&value.x+value.w<=2880&&value.y+value.h<=720&&finite(value.floorY,0,720);
function patrolValid(value,actor) {
  const patrol=value.patrolV140;
  if(patrol===undefined||patrol===null)return true;
  if(value.mode!=='patrol'||!record(patrol)||patrol.schema!==140)return false;
  if(patrol.phase==='observe')return keys(patrol,['schema','phase','remaining'])
    &&finite(patrol.remaining,0,ENEMY_PATROL_V140.humanoidPause);
  return patrol.phase==='travel'&&keys(patrol,['schema','phase','fromX','toX','elapsed','speed'])
    &&finite(patrol.fromX,0,2880)&&finite(patrol.toX,0,2880)&&finite(patrol.speed,.001,1000)
    &&Boolean(restoreEnemyPatrolV140(patrol,actor,{left:value.left,right:value.right},value.direction,
      patrol.speed,ENEMY_PATROL_V140.humanoidPause));
}
function stateValid(value,serial,actor) {
  return record(value)&&keys(value,['schema','mode','clock','sight','lost','direction','homeX','homeY','left','right',
    'targetId','lastKnown','lastNoiseId','searchLeg','transitions','patrolV140'])&&value.schema===130&&modes.includes(value.mode)
    &&['clock','sight','lost'].every(key=>finite(value[key]))&&(value.direction===-1||value.direction===1)
    &&finite(value.homeX,0,2880)&&finite(value.homeY,0,720)&&finite(value.left,0,2880)&&finite(value.right,value.left,2880)
    &&(value.targetId===null||value.targetId==='player')&&(value.lastKnown===null||box(value.lastKnown))
    &&integer(value.lastNoiseId,serial)&&integer(value.searchLeg)&&integer(value.transitions)&&patrolValid(value,actor);
}
export function sanitizeBioforgeTacticsV132(raw,physical) {
  if(!record(raw)||raw.schema!==130||!keys(raw,['schema','time','noiseSerial','noises','entries','transitions','enemies'])
    ||!finite(raw.time)||!integer(raw.noiseSerial)||!integer(raw.entries)||!integer(raw.transitions)
    ||!Array.isArray(raw.noises)||raw.noises.length>32||!Array.isArray(raw.enemies)||raw.enemies.length>96
    ||!Array.isArray(physical?.enemies)) return null;
  const actors=new Map(physical.enemies.map(enemy=>[enemy.id,enemy])),seen=new Set(),noiseIds=new Set();
  for(const noise of raw.noises) {
    if(!record(noise)||!keys(noise,['id','x','y','floorY','radius','kind','remaining'])||!integer(noise.id,raw.noiseSerial)
      ||noise.id<1||noiseIds.has(noise.id)||!finite(noise.x,0,2880)||!finite(noise.y,0,720)||!finite(noise.floorY,0,720)
      ||!finite(noise.radius,60,1400)||typeof noise.kind!=='string'||!noise.kind||noise.kind.length>80
      ||!finite(noise.remaining,0,1.8)) return null;
    noiseIds.add(noise.id);
  }
  for(const row of raw.enemies) {
    if(!record(row)||!keys(row,['id','tactics'])||!actors.has(row.id)||seen.has(row.id)
      ||!stateValid(row.tactics,raw.noiseSerial,actors.get(row.id)))return null;
    seen.add(row.id);
  }
  return clone(raw);
}
export function captureBioforgeTacticsV132(engine,physical) {
  const runtime=engine.enemyTacticsV130||{};
  return sanitizeBioforgeTacticsV132({schema:130,time:runtime.time||0,noiseSerial:runtime.noiseSerial||0,
    noises:runtime.noises||[],entries:runtime.entries||0,transitions:runtime.transitions||0,
    enemies:engine.enemies.filter(enemy=>enemy.tacticsV130).map(enemy=>({id:enemy.id,tactics:enemy.tacticsV130}))},physical);
}
export function restoreBioforgeTacticsV132(engine,source,physical) {
  const safe=sanitizeBioforgeTacticsV132(source,physical);if(!safe)return false;
  const {enemies,...runtime}=safe;engine.enemyTacticsV130=runtime;
  const byId=new Map(engine.enemies.map(enemy=>[enemy.id,enemy]));
  for(const row of enemies)byId.get(row.id).tacticsV130=row.tactics;
  return true;
}
