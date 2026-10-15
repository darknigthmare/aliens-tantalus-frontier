import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HUB_ANNEX_BY_ID_V71 } from './tantalus-hub-expansion-v71.js';
import { buildHubTopologyV58, buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { getHubDoorBounds } from './hub-profiles-v53.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';
import { sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { resolveHubRoomArtV56 } from './hub-art-runtime-v56.js';
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';
import { resolveSpriteSheet } from './sprite-animation-runtime.js';
import { resolveHumanAtlasGeometryV133, drawHumanAtlasV133 } from './human-visual-contract-v133.js';

export const HUB_LOADER_COURSE_V132 = 'p5000-human-handling-v132';
export const HUB_LOADER_VEHICLE_V132 = 'vehicle-007-p-5000-powered-work-loader';
export const HUB_LOADER_ART_V132 = '/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-action-sheet.png';
export const HUB_LOADER_ROOM_V132 = Object.freeze({ width: 2600, height: 720, floorY: 624,
  loaderWidth: 76, loaderHeight: 148, dockX: 230, consoleX: 120, maximumLift: 180,
  obstacles: Object.freeze([
    Object.freeze({ id: 'loader-overhead-a', x: 790, y: 280, w: 170, h: 182 }),
    Object.freeze({ id: 'loader-overhead-b', x: 1220, y: 270, w: 90, h: 185 }),
    Object.freeze({ id: 'loader-end-stop', x: 2320, y: 552, w: 86, h: 72 })
  ]),
  cargo: Object.freeze([
    Object.freeze({ id: 'training-cargo-a', x: 450, y: 566, w: 58, h: 58, targetX: 700, targetY: 512 }),
    Object.freeze({ id: 'training-cargo-b', x: 1140, y: 566, w: 58, h: 58, targetX: 1340, targetY: 416 }),
    Object.freeze({ id: 'training-cargo-c', x: 1810, y: 566, w: 58, h: 58, targetX: 2130, targetY: 486 })
  ]) });
const clone = value => structuredClone(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, low, high) => Number.isFinite(value) && value >= low && value <= high;
const integer = (value, high = 999999) => Number.isInteger(value) && value >= 0 && value <= high;
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const clamp = (value,low,high) => Math.max(low,Math.min(high,value));
const center = actor => ({ x:actor.x+actor.w/2,y:actor.y+actor.h/2 });
const loaderBox = course => ({ x:course.loader.x,y:624-148,w:76,h:148 });
const cargoBox = course => course.heldId ? { ...HUB_LOADER_ROOM_V132.cargo.find(cargo=>cargo.id===course.heldId),
  x:course.loader.x+110,y:566-course.loader.lift } : null;
const equal = (a,b) => JSON.stringify(a)===JSON.stringify(b);
function hash(value) { let result=2166136261;for(const char of JSON.stringify(value)){result^=char.charCodeAt(0);result=Math.imul(result,16777619);}return (result>>>0).toString(36); }
export function createHubLoaderTrainingV132(serial=1,operatorId='hub-human-primary') {
  return {schema:132,courseId:HUB_LOADER_COURSE_V132,sessionId:`${HUB_LOADER_COURSE_V132}:session-${serial}`,
    serial,operatorId,operatorMode:'human',vehicleId:HUB_LOADER_VEHICLE_V132,phase:'board',elapsed:0,
    mounted:false,heldId:null,boardings:0,unmountedAtDock:false,parked:false,energy:100,hydraulics:100,
    loader:{x:230,lift:0,facing:1},human:{x:120,y:532},
    cargo:HUB_LOADER_ROOM_V132.cargo.map(cargo=>({id:cargo.id,x:cargo.x,y:cargo.y,status:'waiting',distance:0,maxLift:0,picked:false,placed:false,clearancePassed:false})),
    placements:[],distance:0,collisionStops:0,complete:false,qualified:false,returnPose:null};
}
export function validateHubLoaderTrainingV132(raw) {
  if(!record(raw)||raw.schema!==132||raw.courseId!==HUB_LOADER_COURSE_V132||!integer(raw.serial)||raw.serial<1
    ||raw.sessionId!==`${HUB_LOADER_COURSE_V132}:session-${raw.serial}`||raw.vehicleId!==HUB_LOADER_VEHICLE_V132
    ||raw.operatorMode!=='human'||typeof raw.operatorId!=='string'||!raw.operatorId||raw.operatorId.length>100
    ||!['board','handling','return','confirm','complete','aborted','failed'].includes(raw.phase)
    ||!['mounted','unmountedAtDock','parked','complete','qualified'].every(key=>typeof raw[key]==='boolean')
    ||!bounded(raw.elapsed,0,3600)||!bounded(raw.energy,0,100)||!bounded(raw.hydraulics,0,100)
    ||!integer(raw.boardings,32)||!integer(raw.collisionStops,999999)||!bounded(raw.distance,0,100000)
    ||!record(raw.loader)||!bounded(raw.loader.x,24,2500)||!bounded(raw.loader.lift,0,180)||![-1,1].includes(raw.loader.facing)
    ||!record(raw.human)||!bounded(raw.human.x,24,2532)||raw.human.y!==532
    ||raw.returnPose!==null&&(!record(raw.returnPose)||!bounded(raw.returnPose.x,24,1880)||!bounded(raw.returnPose.y,0,532)||![-1,1].includes(raw.returnPose.facing))
    ||!Array.isArray(raw.cargo)||raw.cargo.length!==3||!Array.isArray(raw.placements)||raw.placements.length>3)
    return {valid:false,reason:'loader-training-schema'};
  const state=clone(raw),held=state.cargo.filter(cargo=>cargo.status==='held');
  if(held.length!==Number(Boolean(state.heldId))||held[0]?.id!==state.heldId&&state.heldId!==null
    ||state.heldId&&!state.mounted||state.complete!==state.qualified||state.complete!==(state.phase==='complete')
    ||state.mounted&&state.boardings<1||state.cargo.some((cargo,index)=>{
      const authored=HUB_LOADER_ROOM_V132.cargo[index];
      return cargo.id!==authored.id||!['waiting','held','placed'].includes(cargo.status)||typeof cargo.picked!=='boolean'||typeof cargo.placed!=='boolean'
        ||!bounded(cargo.x,0,2542)||!bounded(cargo.y,386,566)||!bounded(cargo.distance,0,100000)||!bounded(cargo.maxLift,0,180)
        ||cargo.placed!==(cargo.status==='placed')||cargo.status==='waiting'&&(cargo.picked||cargo.x!==authored.x||cargo.y!==authored.y)
        ||cargo.status==='held'&&(!cargo.picked||Math.abs(cargo.x-(state.loader.x+110))>.001||Math.abs(cargo.y-(566-state.loader.lift))>.001)
        ||typeof cargo.clearancePassed!=='boolean'||cargo.id==='training-cargo-b'&&cargo.placed&&!cargo.clearancePassed
        ||cargo.placed&&(!cargo.picked||cargo.x!==authored.targetX||cargo.y!==authored.targetY
          ||cargo.distance<Math.abs(authored.targetX-authored.x)-45||cargo.maxLift<566-authored.targetY-8);
    })||state.placements.length!==state.cargo.filter(cargo=>cargo.placed).length
    ||state.placements.some((id,index)=>id!==state.cargo.filter(cargo=>cargo.placed)[index]?.id)
    ||state.distance+.01<state.cargo.reduce((sum,cargo)=>sum+cargo.distance,0)
    ||['return','confirm','complete'].includes(state.phase)&&state.placements.length!==3
    ||state.complete&&(!state.parked||!state.unmountedAtDock||state.mounted||state.heldId||state.boardings<1
      ||Math.abs(state.loader.x-230)>38||Math.abs(state.human.x+22-120)>86||state.energy<=0||state.hydraulics<=0)
    ||HUB_LOADER_ROOM_V132.obstacles.some(obstacle=>overlap(loaderBox(state),obstacle)
      ||cargoBox(state)&&overlap(cargoBox(state),obstacle)))return {valid:false,reason:'loader-training-progress'};
  return {valid:true,state};
}
export function createHubLoaderReceiptV132(course) {
  const checked=validateHubLoaderTrainingV132(course);
  if(!checked.valid||!course.complete)return null;
  return {schema:132,type:'human-loader-qualification',courseId:HUB_LOADER_COURSE_V132,
    id:`${course.sessionId}:qualification`,sessionId:course.sessionId,serial:course.serial,operatorId:course.operatorId,
    operatorMode:'human',vehicleId:HUB_LOADER_VEHICLE_V132,qualified:true,proofHash:hash(checked.state),
    placements:3,carriedDistance:checked.state.cargo.reduce((sum,cargo)=>sum+cargo.distance,0),state:checked.state};
}
export function validateHubLoaderReceiptV132(receipt,pending=null) {
  const checked=validateHubLoaderTrainingV132(receipt?.state);
  if(!checked.valid||!checked.state.complete)return {valid:false,reason:'loader-receipt-state'};
  const expected=createHubLoaderReceiptV132(checked.state);
  if(!equal(receipt,expected)||pending!==null&&!equal(pending,expected))return {valid:false,reason:'loader-receipt-affinity'};
  return {valid:true,state:checked.state,receipt:expected};
}
export function normalizeHubTrainingV132(raw) {
  const result={schema:132,serial:0,active:false,course:null,cameraIndex:0,lockedDoorIds:[],pendingReceipt:null,claimedReceiptIds:[]};
  if(!record(raw)||raw.schema!==132)return result;
  result.serial=integer(raw.serial)?raw.serial:0;
  const checked=raw.course&&validateHubLoaderTrainingV132(raw.course);
  if(checked?.valid){result.course=checked.state;result.serial=Math.max(result.serial,checked.state.serial);result.active=raw.active===true;}
  result.cameraIndex=integer(raw.cameraIndex,15)?raw.cameraIndex:0;
  const graph=buildHubTopologyV58(HUB_DECKS,HUB_WORLD),doors=graph.edges.filter(edge=>edge.kind==='bulkhead').map(edge=>edge.id);
  const locks=Array.isArray(raw.lockedDoorIds)?[...new Set(raw.lockedDoorIds.filter(id=>doors.includes(id)))]:[];
  result.lockedDoorIds=hubSecurityRoutesValidV132(locks)?locks:[];
  result.claimedReceiptIds=Array.isArray(raw.claimedReceiptIds)?[...new Set(raw.claimedReceiptIds.filter(id=>typeof id==='string'
    &&/^p5000-human-handling-v132:session-[1-9]\d{0,5}:qualification$/.test(id)))].slice(-32):[];
  if(validateHubLoaderReceiptV132(raw.pendingReceipt).valid&&result.course&&equal(raw.pendingReceipt.state,result.course)
    &&!result.claimedReceiptIds.includes(raw.pendingReceipt.id))result.pendingReceipt=clone(raw.pendingReceipt);
  return result;
}
export function hubSecurityRoutesValidV132(lockedDoorIds=[]) {
  const graph=buildHubTopologyV58(HUB_DECKS,HUB_WORLD),lifts=new Set(graph.edges.filter(edge=>edge.kind==='lift').flatMap(edge=>[edge.from,edge.to]));
  const adjacency=new Map(graph.nodes.map(node=>[node.id,[]]));
  for(const edge of graph.edges)if(!lockedDoorIds.includes(edge.id)){adjacency.get(edge.from)?.push(edge.to);adjacency.get(edge.to)?.push(edge.from);}
  return graph.nodes.every(node=>{const queue=[node.id],seen=new Set(queue);while(queue.length){const id=queue.shift();if(lifts.has(id))return true;
    for(const next of adjacency.get(id)||[])if(!seen.has(next)){seen.add(next);queue.push(next);}}return false;});
}
function swept(box,motion,obstacles) {
  let fraction=1;for(const obstacle of obstacles){const hit=sweepProjectileAabbV83(box,motion,obstacle);if(hit)fraction=Math.min(fraction,Math.max(0,hit.t-.00001));}
  return fraction;
}

export function withHubTrainingV132(Base) {
  if(Base.hubTrainingRuntimeV132)return Base;
  return class HubTrainingV132 extends Base {
    static hubTrainingRuntimeV132=true;
    constructor(canvas,options={}) {
      super(canvas,options);this.hubTrainingV132=normalizeHubTrainingV132();this.trainingImageV132=null;
      this.onTrainingEventV132=options.onTrainingEventV132||this.onAction;
      globalThis.addEventListener?.('keydown',event=>{
        if(event.repeat||!this.state)return;
        if(this.hubTrainingV132?.active&&event.code==='KeyP'){event.preventDefault?.();this.running?this.pause():this.resume();return;}
        if(!this.running)return;
        if(event.code==='KeyH'&&this.hubTrainingContactV132('proving-ground')){event.preventDefault?.();this.startHubLoaderTrainingV132();}
        if(event.code==='Escape'&&this.hubTrainingV132?.active){event.preventDefault?.();this.leaveHubLoaderTrainingV132();}
        if(event.code==='KeyN'&&this.hubTrainingContactV132('cctv'))this.executeHubTrainingCommandV132('camera-next');
        if(event.code==='KeyM'&&this.hubTrainingContactV132('mire-archives'))this.executeHubTrainingCommandV132('mire-replay');
      });
    }
    start(hubState={},options={}) {
      const restored=normalizeHubTrainingV132(hubState.hubTrainingV132);
      this.trainingOperatorIdV132=String(options.trainingOperatorIdV132||options.onboardingV84?.identity?.id||'hub-human-primary').slice(0,100);
      this.hubTrainingV132={...restored,active:false};super.start(hubState,options);
      this.trainingPersistClockV132=0;this.trainingReceiptAttemptV132=null;
      if(restored.active&&restored.course&&this.currentAnnexV71?.()?.id==='proving-ground'
        &&restored.course.operatorId===this.trainingOperatorIdV132){this.hubTrainingV132=restored;this.restoreTrainingHumanV132();this.ensureTrainingArtV132();}
      this.enforceSecurityLocksV132();this.deliverHubLoaderReceiptV132();this.emitStatus();this.draw();
    }
    hubTrainingContactV132(annexId) {
      return Boolean(this.running&&!this.hubTrainingV132?.active&&!this.annexTransitionV71&&!this.editorPlaytest
        &&this.player?.alive&&this.currentAnnexV71?.()?.id===annexId&&this.nearestAnnexStationV71?.());
    }
    startHubLoaderTrainingV132() {
      if(!this.hubTrainingContactV132('proving-ground')||['armed','active'].includes(this.provingGroundStateV81?.phase)
        ||this.openingV88&&this.openingV88.phase!=='complete')return {started:false,reason:'training-unavailable'};
      const book=this.hubTrainingV132,course=createHubLoaderTrainingV132(Math.min(999999,book.serial+1),this.trainingOperatorIdV132);
      if(book.serial>=999999)return {started:false,reason:'training-session-limit'};
      course.returnPose={x:this.player.x,y:this.player.y,facing:this.player.facing};
      book.serial=course.serial;book.active=true;book.course=course;book.pendingReceipt=null;
      this.keys.clear();this.jumpQueued=0;this.restoreTrainingHumanV132();this.ensureTrainingArtV132();this.persist();
      this.onTrainingEventV132?.({action:'hub:loader-training-started-v132',sessionId:course.sessionId,operatorId:course.operatorId});
      this.emitStatus();return {started:true,state:clone(course)};
    }
    ensureTrainingArtV132(){if(!this.trainingImageV132){this.trainingImageV132=new Image();this.trainingImageV132.src=HUB_LOADER_ART_V132;}}
    restoreTrainingHumanV132(){const course=this.hubTrainingV132.course;if(course)Object.assign(this.player,{...course.human,vx:0,vy:0,grounded:true,climbing:false,crouching:false});}
    leaveHubLoaderTrainingV132() {
      const book=this.hubTrainingV132;if(!book?.active)return false;
      const course=book.course;book.active=false;
      if(!course.complete){course.phase='aborted';course.mounted=false;course.heldId=null;for(const cargo of course.cargo)if(cargo.status==='held'){
      const original=HUB_LOADER_ROOM_V132.cargo.find(item=>item.id===cargo.id);Object.assign(cargo,{x:original.x,y:original.y,status:'waiting',picked:false,distance:0,maxLift:0,clearancePassed:false});}}
      const pose=course.returnPose||{x:560,y:532,facing:1},annex=HUB_ANNEX_BY_ID_V71['proving-ground'];
      const safe=this.restoreAnnexPlayerPoseV71?.(annex,{annexPositionX:pose.x,annexPositionY:pose.y})||pose;
      Object.assign(this.player,safe,{vx:0,vy:0,facing:pose.facing});this.keys.clear();this.jumpQueued=0;this.persist();this.emitStatus();return true;
    }
    isProvingGroundActiveV81(){return !this.hubTrainingV132?.active&&super.isProvingGroundActiveV81();}
    useLift(direction,wrap){return this.hubTrainingV132?.active?false:super.useLift(direction,wrap);}
    fire(){return this.hubTrainingV132?.active?false:super.fire();}
    setControl(control,active){if(!this.hubTrainingV132?.active)return super.setControl(control,active);
      if(control==='interact'&&active)return this.interact();const code={left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'}[control];
      if(code)(active?this.keys.add(code):this.keys.delete(code));}
    interact(){
      if(!this.hubTrainingV132?.active)return super.interact();
      if(!this.running||!this.player?.alive)return false;const course=this.hubTrainingV132.course;
      if(['failed','aborted'].includes(course.phase))return false;
      if(course.complete)return this.leaveHubLoaderTrainingV132();
      if(!course.mounted){
        if(course.phase==='confirm'&&Math.abs(this.player.x+22-120)<86){course.complete=true;course.qualified=true;course.phase='complete';
          this.hubTrainingV132.pendingReceipt=createHubLoaderReceiptV132(course);this.persist();this.deliverHubLoaderReceiptV132();this.emitStatus();return true;}
        if(Math.abs(this.player.x+22-(course.loader.x+38))<110&&course.phase!=='confirm'){
          course.mounted=true;course.boardings++;course.phase=course.placements.length===3?'return':'handling';this.keys.clear();this.persist();return true;}
        return false;
      }
      if(course.placements.length===3&&!course.heldId&&Math.abs(course.loader.x-230)<=38){
        course.mounted=false;course.parked=true;course.unmountedAtDock=true;course.phase='confirm';
        course.human={x:course.loader.x-68,y:532};this.restoreTrainingHumanV132();this.persist();return true;}
      if(course.heldId){
        const cargo=course.cargo.find(cargo=>cargo.id===course.heldId),authored=HUB_LOADER_ROOM_V132.cargo.find(item=>item.id===cargo.id);
        if(Math.abs(cargo.x-authored.targetX)>24||Math.abs(cargo.y-authored.targetY)>8||cargo.distance<Math.abs(authored.targetX-authored.x)-45)return false;
        Object.assign(cargo,{x:authored.targetX,y:authored.targetY,status:'placed',placed:true});course.heldId=null;
        course.placements=course.cargo.filter(cargo=>cargo.placed).map(cargo=>cargo.id);
        course.phase=course.placements.length===3?'return':'handling';this.persist();return true;
      }
      const front={x:course.loader.x+110,y:566-course.loader.lift,w:58,h:58};
      const cargo=course.cargo.find(cargo=>cargo.status==='waiting'&&Math.hypot(front.x-cargo.x,front.y-cargo.y)<40);
      if(!cargo||course.hydraulics<6)return false;
      const obstacles=HUB_LOADER_ROOM_V132.obstacles;
      if(swept(front,{x:cargo.x-front.x,y:cargo.y-front.y},obstacles)<1)return false;
      course.hydraulics-=6;course.heldId=cargo.id;Object.assign(cargo,{x:front.x,y:front.y,status:'held',picked:true});this.persist();return true;
    }
    update(delta){
      if(!this.running||!Number.isFinite(delta)||delta<=0)return;
      if(!this.hubTrainingV132?.active){this.enforceSecurityLocksV132();const result=super.update(delta);this.enforceSecurityLocksV132();return result;}
      const course=this.hubTrainingV132.course;if(course.complete||course.phase==='failed')return;
      let remaining=Math.min(delta,.25);while(remaining>1e-9){const dt=Math.min(remaining,1/120);remaining-=dt;this.animationTime+=dt;course.elapsed+=dt;
        const direction=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'));
        if(course.mounted){
          const body=loaderBox(course),held=cargoBox(course),motion={x:direction*(held?108:142)*dt,y:0};
          const obstacles=[...HUB_LOADER_ROOM_V132.obstacles,...course.cargo.filter(cargo=>cargo.status==='waiting').map(cargo=>({...cargo,w:58,h:58}))];
          let fraction=swept(body,motion,obstacles);if(held)fraction=Math.min(fraction,swept(held,motion,obstacles));
          const old=course.loader.x;course.loader.x=clamp(old+motion.x*fraction,24,2500);
          const moved=Math.abs(course.loader.x-old);course.distance+=moved;course.energy=Math.max(0,course.energy-moved*.009);
          if(direction)course.loader.facing=direction;if(fraction<1&&Math.abs(motion.x)>.01)course.collisionStops++;
          const liftDirection=Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'))-Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'));
          const desired=clamp(course.loader.lift+liftDirection*62*dt,0,180);
          const liftFraction=held?swept(held,{x:0,y:course.loader.lift-desired},HUB_LOADER_ROOM_V132.obstacles):1;
          const oldLift=course.loader.lift;course.loader.lift+= (desired-oldLift)*liftFraction;
          course.hydraulics=Math.max(0,course.hydraulics-Math.abs(course.loader.lift-oldLift)*.015);
          if(held){const cargo=course.cargo.find(cargo=>cargo.id===course.heldId);cargo.x=course.loader.x+110;cargo.y=566-course.loader.lift;cargo.distance+=moved;cargo.maxLift=Math.max(cargo.maxLift,course.loader.lift);
            if(cargo.id==='training-cargo-b'&&held.x<1311&&cargo.x>=1311&&course.loader.lift<=111) cargo.clearancePassed=true;}
          course.human={x:course.loader.x+16,y:532};this.restoreTrainingHumanV132();
        }else{
          const body={x:this.player.x,y:532,w:44,h:92},motion={x:direction*220*dt,y:0};
          const obstacles=[...HUB_LOADER_ROOM_V132.obstacles,loaderBox(course),...course.cargo.filter(cargo=>cargo.status==='waiting').map(cargo=>({...cargo,w:58,h:58}))];
          this.player.x=clamp(this.player.x+motion.x*swept(body,motion,obstacles),24,2532);if(direction)this.player.facing=direction;
          course.human={x:this.player.x,y:532};
        }
        if(course.energy<=0||course.hydraulics<=0||course.elapsed>=3600){course.phase='failed';this.keys.clear();break;}
      }
      this.trainingPersistClockV132=(this.trainingPersistClockV132||0)+Math.min(delta,.25);
      if(this.trainingPersistClockV132>=1){this.trainingPersistClockV132%=1;this.persist();}
      this.emitStatus();
    }
    deliverHubLoaderReceiptV132(){const book=this.hubTrainingV132,receipt=book?.pendingReceipt;
      if(!receipt||receipt.operatorId!==this.trainingOperatorIdV132||book.claimedReceiptIds.includes(receipt.id)||!validateHubLoaderReceiptV132(receipt).valid)return false;
      if(this.trainingReceiptAttemptV132===receipt.id)return false;this.trainingReceiptAttemptV132=receipt.id;
      const issued=this.onTrainingEventV132?.({action:'hub:loader-training-issued-v132',receipt:clone(receipt),state:clone(book.course)});
      if(issued===false){this.trainingReceiptAttemptV132=null;return false;}
      const accepted=this.onTrainingEventV132?.({action:'hub:loader-training-qualified-v132',receipt:clone(receipt),state:clone(book.course)});
      if(accepted===false){this.trainingReceiptAttemptV132=null;return false;}
      book.claimedReceiptIds=[...book.claimedReceiptIds,receipt.id].slice(-32);book.pendingReceipt=null;this.persist();return true;
    }
    getHubTrainingCommandsV132(){
      const context=this.hubTrainingV132?.active?'loader-exercise':this.hubTrainingContactV132('proving-ground')?'loader-console'
        :this.hubTrainingContactV132('cctv')?'security-console':this.hubTrainingContactV132('mire-archives')?'mire-console':null;
      const feeds=HUB_DECKS.flatMap((deck,deckIndex)=>deck.rooms.map(room=>({id:room.id,name:room.name,deckIndex,visited:this.state?.visited?.includes(room.id)||false,
        actors:deckIndex===this.state?.deck?(this.npcs||[]).filter(actor=>actor.x>=room.xStart&&actor.x<room.xEnd).length:null})));
      const topology=buildHubTopologyV58(HUB_DECKS,HUB_WORLD),locks=this.hubTrainingV132?.lockedDoorIds||[];
      const doors=topology.edges.filter(edge=>edge.kind==='bulkhead').map(edge=>({id:edge.id,from:edge.from,to:edge.to,locked:locks.includes(edge.id),
        canLock:hubSecurityRoutesValidV132([...locks,edge.id])}));
      return {schema:132,context,active:this.hubTrainingV132?.active||false,course:clone(this.hubTrainingV132?.course||null),
        feeds,selectedFeed:feeds[this.hubTrainingV132?.cameraIndex||0],doors,
        commands:context==='loader-console'?[{id:'loader-start',label:'P-5000 humain · H'}]:context==='loader-exercise'?[{id:'loader-exit',label:'Retour · Échap'}]
          :context==='security-console'?[{id:'camera-next',label:'Caméra suivante · N'},...doors.map(door=>({id:'door-toggle',value:door.id,label:`${door.locked?'Ouvrir':'Verrouiller'} ${door.from} ↔ ${door.to}`,enabled:door.locked||door.canLock}))]
            :context==='mire-console'?[{id:'mire-replay',label:'Rejouer MIRE · Nostromo · M'}]:[]};
    }
    executeHubTrainingCommandV132(id,value=null){
      if(id==='loader-start')return this.startHubLoaderTrainingV132();if(id==='loader-exit')return this.leaveHubLoaderTrainingV132();
      if(id==='mire-replay'){if(!this.hubTrainingContactV132('mire-archives'))return false;this.persist();
        return this.onTrainingEventV132?.({action:'hub:mire-replay-v132',campaignId:'special-nostromo-v131',preserveIdentity:true})!==false;}
      if(!this.hubTrainingContactV132('cctv'))return false;
      const book=this.hubTrainingV132;
      if(id==='camera-next'){book.cameraIndex=(book.cameraIndex+1)%16;this.persist();this.emitStatus();return true;}
      if(id==='door-toggle'){
        const model=this.getHubTrainingCommandsV132().doors.find(door=>door.id===value);if(!model)return false;
        const existing=book.lockedDoorIds.includes(value),next=existing?book.lockedDoorIds.filter(id=>id!==value):[...book.lockedDoorIds,value];
        if(!hubSecurityRoutesValidV132(next))return false;
        const deck=HUB_DECKS.find(deck=>value.startsWith(`${deck.id}:`)),door=deck&&buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,HUB_DECKS.indexOf(deck)).find(door=>door.id===value);
        const bounds=door&&getHubBulkheadColliderV134(door),actors=[this.player,...(this.npcs||[])];
        if(!existing&&bounds&&deck?.id===HUB_DECKS[this.state.deck]?.id&&actors.some(actor=>actor.alive!==false&&overlap(actor,bounds)))return false;
        book.lockedDoorIds=next;this.enforceSecurityLocksV132();this.persist();this.onTrainingEventV132?.({action:'hub:security-lock-v132',doorId:value,locked:!existing});return true;
      }
      return false;
    }
    enforceSecurityLocksV132(){for(const door of this.doorStates||[])if(this.hubTrainingV132?.lockedDoorIds.includes(door.id)){
      const bounds=getHubBulkheadColliderV134(door);if(![this.player,...(this.npcs||[])].filter(Boolean).some(actor=>actor.alive!==false&&overlap(actor,bounds)))door.progress=0;}}
    persist(){if(!this.hubTrainingV132||!this.state||!this.player)return super.persist();
      const sink=this.onPersist,active=this.hubTrainingV132.active,pose={x:this.player.x,y:this.player.y},parent=this.hubTrainingV132.course?.returnPose,snapshot=clone(this.hubTrainingV132);
      this.onPersist=patch=>sink({...patch,hubTrainingV132:snapshot});
      if(active&&parent){this.hubTrainingV132.active=false;this.player.x=parent.x;this.player.y=parent.y;}
      try{return super.persist();}finally{this.hubTrainingV132.active=active;Object.assign(this.player,pose);this.onPersist=sink;}
    }
    hubTrainingSnapshotV132(){return {...clone(this.hubTrainingV132),commands:this.getHubTrainingCommandsV132()};}
    getSnapshot(){return {...super.getSnapshot(),hubTrainingV132:this.hubTrainingSnapshotV132()};}
    statusPrompt(){if(this.hubTrainingV132?.active){const state=this.hubTrainingV132.course;
      if(state.complete)return 'QUALIFICATION P-5000 VALIDÉE · E / ÉCHAP — RETOUR AU TERRAIN';
      if(state.phase==='failed')return 'EXERCICE INTERROMPU · ÉCHAP — RETOUR SANS CERTIFICAT';
      if(state.phase==='confirm')return 'E — CONFIRMER LA QUALIFICATION AU PUPITRE';
      if(state.phase==='return')return 'A / D — RAMENER LE P-5000 AU MARQUAGE INITIAL · E — DÉBARQUER';
      return state.mounted?'A / D — CONDUIRE · W / S — LEVER / BAISSER · E — GRIPPER / PLACER · ÉCHAP — QUITTER'
        :'A / D — REJOINDRE LE P-5000 · E — MONTER';}
      const base=super.statusPrompt();return this.hubTrainingContactV132('proving-ground')?`${base} · H — P-5000 HUMAIN`
        :this.hubTrainingContactV132('cctv')?`${base} · N — CAMÉRAS`:this.hubTrainingContactV132('mire-archives')?`${base} · M — REJOUER NOSTROMO`:base;}
    emitStatus(){if(!this.hubTrainingV132?.active)return super.emitStatus();if(!this.player||!this.state)return;
      const payload={deck:this.state.deck,deckName:'USS TANTALUS',roomId:'loader-training-v132',roomName:'P-5000 · MANUTENTION HUMAINE',
        prompt:this.statusPrompt(),health:this.player.health,threats:0,visited:this.state.visited?.length||0,hubTrainingV132:this.hubTrainingSnapshotV132()};
      const key=JSON.stringify(payload);if(key!==this.statusKey){this.statusKey=key;this.onStatus(payload);}}
    draw(){if(!this.hubTrainingV132?.active){super.draw();this.drawSecurityFeedV132();return;}
      if(!this.player)return;const ctx=this.ctx,state=this.hubTrainingV132.course,camera=clamp(state.mounted?state.loader.x-420:this.player.x-420,0,1320);
      ctx.save();ctx.clearRect(0,0,1280,720);ctx.fillStyle='#101d23';ctx.fillRect(0,0,1280,720);
      for(let x=0;x<1280;x+=128){ctx.fillStyle='#2c3c40';ctx.fillRect(x,160,4,465);}ctx.translate(-camera,0);
      ctx.fillStyle='#394548';ctx.fillRect(0,624,2600,96);
      for(const obstacle of HUB_LOADER_ROOM_V132.obstacles){ctx.fillStyle='#627575';ctx.fillRect(obstacle.x,obstacle.y,obstacle.w,obstacle.h);}
      ctx.fillStyle='#82b8ad';ctx.fillRect(230,620,76,4);ctx.fillStyle='#79a7a5';ctx.fillRect(102,568,36,56);
      for(const authored of HUB_LOADER_ROOM_V132.cargo){ctx.strokeStyle='#759387';ctx.strokeRect(authored.targetX-8,authored.targetY-8,74,74);
        ctx.fillStyle='#496065';ctx.fillRect(authored.targetX-10,authored.targetY+58,80,5);ctx.font='11px monospace';ctx.fillStyle='#c3d5ca';
        ctx.fillText(`PLACEMENT ${HUB_LOADER_ROOM_V132.cargo.indexOf(authored)+1}`,authored.targetX-14,authored.targetY-20);}
      for(const cargo of state.cargo){ctx.fillStyle=cargo.placed?'#829d71':'#b5a879';ctx.fillRect(cargo.x,cargo.y,58,58);ctx.strokeStyle='#e2dca5';ctx.strokeRect(cargo.x+6,cargo.y+6,46,46);}
      const image=this.trainingImageV132;
      if(image?.complete&&image.naturalWidth){const frame=state.mounted&&(this.keys.has('KeyA')||this.keys.has('KeyD'))?4+Math.floor(this.animationTime*8)%4:state.heldId?8+Math.floor(this.animationTime*5)%4:Math.floor(this.animationTime*4)%4;
        const sheet=resolveSpriteSheet('vehicle.p5000-powered-work-loader.action');
        ctx.drawImage(resolveSpriteDrawableV134(image),frame%sheet.columns*sheet.cellWidth,Math.floor(frame/sheet.columns)*sheet.cellHeight,sheet.cellWidth,sheet.cellHeight,
          state.loader.x+38-75,624-180,150,192);}
      ctx.strokeStyle='#c6b477';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(state.loader.x+38,570);ctx.lineTo(state.loader.x+110,595-state.loader.lift);
      ctx.lineTo(state.loader.x+165,595-state.loader.lift);ctx.stroke();
      if(!state.mounted)this.drawPlayer(ctx);
      else this.player.supportShadowV139={schema:139,drawn:false,contactY:null,
        frameTime:this.animationTime,omittedReason:'vehicle-mounted'};
      ctx.translate(camera,0);
      ctx.fillStyle='#081315ed';ctx.fillRect(18,18,1244,112);ctx.fillStyle='#d5e0d9';ctx.font='700 15px monospace';
      ctx.fillText(`P-5000 HUMAIN · CHARGES ${state.placements.length}/3 · ÉNERGIE ${Math.ceil(state.energy)}% · HYDRAULIQUE ${Math.ceil(state.hydraulics)}% · FOURCHES ${Math.round(state.loader.lift)}`,32,43);
      ctx.font='12px monospace';ctx.fillText(this.statusPrompt(),32,70);ctx.fillText('Ajuster les fourches sous les poutres. Les emplacements sont des niches de réception derrière la voie de circulation.',32,94);
      ctx.fillText('Le déplacement automatique du fret reste un service distinct. Cet exercice exige la conduite de l’opérateur.',32,116);ctx.restore();
    }
    drawSecurityFeedV132() {
      if (!this.hubTrainingContactV132('cctv')) return;
      const feed = this.getHubTrainingCommandsV132().selectedFeed;
      const deck = HUB_DECKS[feed.deckIndex], room = deck.rooms.find(room => room.id === feed.id);
      if (!room) return;
      const ctx = this.ctx, currentDeck = feed.deckIndex === this.state.deck;
      ctx.save();
      ctx.fillStyle = '#071719ee'; ctx.fillRect(700, 105, 550, 245);
      ctx.save(); ctx.beginPath(); ctx.rect(710, 116, 530, 180); ctx.clip();
      ctx.translate(710, 116); ctx.scale(530 / (room.profile?.worldWidth || HUB_WORLD.roomWidth), 180 / 720);
      ctx.translate(-room.xStart, 0);
      this.drawRoomModule(ctx, room, this.farLayers.get(deck.farBackground));
      ctx.fillStyle = '#1b2928'; ctx.fillRect(room.xStart, HUB_WORLD.floorY, HUB_WORLD.roomWidth, 96);
      ctx.fillStyle = '#829789'; ctx.fillRect(room.xStart, HUB_WORLD.floorY, HUB_WORLD.roomWidth, 4);
      if (room.id !== DROPSHIP_HANGAR_ART_V55.roomId) this.drawInteractionProp(ctx, room);
      for (const obstacle of buildHubObstacleGeometryV87(feed.deckIndex)) {
        if (obstacle.roomId === room.id) this.drawObstacle(ctx, obstacle);
      }
      if (currentDeck) {
        for (const door of this.doorStates || []) {
          const bounds = getHubDoorBounds(door);
          if (!door.lift && bounds.x + bounds.w > room.xStart && bounds.x < room.xEnd) this.drawDoor(ctx, door, 'back');
        }
        for (const npc of this.npcs || []) {
          if (npc.alive === false || npc.x + npc.w <= room.xStart || npc.x >= room.xEnd) continue;
          // Observe the last physical sprite sample. A camera never advances
          // the NPC animation controller or emits another movement event.
          const cached = npc.v52Animation, sheet = cached?.sheetId && resolveSpriteSheet(cached.sheetId);
          const image = this.npcImagesBySheetId?.get(cached?.sheetId) || this.npcSheets[npc.sheet] || this.crewSheet;
          if (!image?.complete || !image.naturalWidth) continue;
          const columns = sheet?.columns || 4, rows = sheet?.rows || 4;
          const column = cached?.column ?? (this.reducedMotion ? 0 : Math.floor(this.animationTime * 8 + npc.sheet) % columns);
          const row = cached?.row ?? 1, width = 92, height = 128;
          const x = npc.x + npc.w / 2 - width / 2, y = npc.y + npc.h - height * (240 / 256);
          this.drawDepthContactShadowV116(ctx, npc, npc.y + npc.h);
          const facing = npc.lifeV136 ? npc.facing : npc.vx < 0 ? -1 : 1;
          const human = resolveHumanAtlasGeometryV133({ actor: { ...npc, facing },
            sheet: sheet || { path: image.src?.replace(/^https?:\/\/[^/]+/, ''), sourceFacing: 1 }, column, row, surface: 'hub' });
          if (drawHumanAtlasV133(ctx, image, human)) continue;
          ctx.save();
          if (facing < 0) { ctx.translate(x + width, y); ctx.scale(-1, 1); }
          ctx.drawImage(resolveSpriteDrawableV134(image), column * image.naturalWidth / columns, row * image.naturalHeight / rows,
            image.naturalWidth / columns, image.naturalHeight / rows,
            facing < 0 ? 0 : x, facing < 0 ? 0 : y, width, height);
          ctx.restore();
        }
        for (const door of this.doorStates || []) {
          const bounds = getHubDoorBounds(door);
          if (bounds.x + bounds.w > room.xStart && bounds.x < room.xEnd) this.drawDoor(ctx, door);
        }
      }
      if (room.id === DROPSHIP_HANGAR_ART_V55.roomId) this.drawModularHangar(ctx, room, 'front');
      else if (resolveHubRoomArtV56(room.id)) this.drawModularRoomV56(ctx, room, 'front');
      ctx.restore();
      ctx.fillStyle = '#c4dcd5'; ctx.font = '12px monospace';
      const presence = `${feed.actors} MEMBRE${feed.actors === 1 ? '' : 'S'} PRÉSENT${feed.actors === 1 ? '' : 'S'}`;
      ctx.fillText(`CCTV · ${feed.name} · ${currentDeck ? presence : 'AUTRE PONT · DÉCOR'}`, 714, 319);
      ctx.fillText('N — CAMÉRA SUIVANTE · COMMANDES DE VERROUILLAGE AU PUPITRE', 714, 338);
      ctx.restore();
    }
  };
}
