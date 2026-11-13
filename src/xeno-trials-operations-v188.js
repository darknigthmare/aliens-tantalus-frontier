import {XENO_TRIALS_BOSS_STAGES_V179 as STAGES} from './xeno-trials-boss-stages-v179.js';
import {getXenoTrialsBodyBoundsV105} from './xeno-trials-geometry-v105.js';
import {getArbiterOperationV191} from './xeno-arbiter-protocols-v191.js';

// Original Tantalus objective simulations. The existing horde supplies pressure;
// physical objectives decide the outcome independently of the remaining kills.
// Local deterministic state only: no DOM, wall clock, storage or random source.
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const clone=value=>JSON.parse(JSON.stringify(value));
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
const names={escort:'CONVOI DE CONFINEMENT',relay:'RELAIS DE SECOURS',purge:'PURGE DES CONDUITS',beacon:'BALISES SYNCHRONISÉES',extraction:'RÉCUPÉRATION DE CAISSONS'};
const ambient={escort:'incoming',relay:'blackout',purge:'acid',beacon:'quarantine',extraction:'extraction'};
const instructions={
 escort:'Maintenez E près du chariot et accompagnez-le jusqu’au sas. Sa progression s’arrête dès que vous vous éloignez. Les ennemis proches endommagent le chariot.',
 relay:'Ralliez les trois relais dans l’ordre indiqué et maintenez E pour les charger. Quitter une charge inachevée la fait redescendre.',
 purge:'Maintenez E près des conduits pour les purger et les sceller. Les foyers inachevés se régénèrent ; chaque foyer ouvert affaiblit le confinement.',
 beacon:'Maintenez E près d’une balise pendant sa fenêtre verte. Une charge inachevée retombe hors de cette fenêtre. Synchronisez les trois balises.',
 extraction:'Maintenez E près d’un caisson, rapportez-le au dépôt et maintenez E pour le livrer. Transportez un seul caisson à la fois, puis rejoignez le sas.'
};
const kinds=Object.keys(names);
export const XENO_TRIALS_OPERATIONS_V188=freeze(kinds.flatMap((kind,family)=>Array.from({length:8},(_,variant)=>{
 const level=variant+1,reverse=variant%2===1,offset=((variant%4)-1.5)*20;
 let positions=[150+offset,650,1150-offset];
 if(reverse)positions=positions.reverse();
 if(variant>=4)positions=[positions[1],positions[0],positions[2]];
 const requiredTicks=kind==='escort'?900+variant*60:kind==='relay'?180+variant*12:kind==='purge'?210+variant*12:kind==='beacon'?108+variant*6:36+variant*3;
 const objectives=kind==='escort'?[{id:'cargo-route',kind:'cargo',label:'Chariot de confinement',x:reverse?250:1250,y:0,radius:155,requiredTicks}]
  :positions.map((x,index)=>({id:`${kind}-${index+1}`,kind:kind==='relay'?'terminal':kind==='purge'?'vent':kind==='beacon'?'beacon':'supply',
    label:`${kind==='relay'?'Relais':kind==='purge'?'Conduit':kind==='beacon'?'Balise':'Caisson'} ${index+1}`,x,y:0,radius:92,requiredTicks,
    ...(kind==='beacon'?{periodTicks:720+variant*24,windowStartTicks:60+index*150,windowTicks:240}:{} )}));
 return{id:`xto188-${kind}-${level}`,kind,title:`${names[kind]} · ${String(level).padStart(2,'0')}`,label:`${names[kind]} · ${level}`,
  stageId:STAGES[family*8+variant].id,hordeProtocolId:`xth180-${ambient[kind]}-${variant>=5?2:1}`,
  description:instructions[kind],instruction:instructions[kind],roundSeconds:140+variant*10,reward:280+level*35,
  difficulty:variant<2?'easy':variant>=6?'hard':'normal',factionId:kind==='relay'?'rival-lab':'containment',
  startX:kind==='escort'?(reverse?1250:250):500,cargoStartX:reverse?1250:250,cargoEndX:reverse?250:1250,
  depot:{id:'depot',kind:'depot',label:'Dépôt de récupération',x:500,y:0,radius:105,requiredTicks:60},
  exit:{id:'exit',kind:'exit',label:'Sas d’extraction',x:1350,y:0,radius:110,requiredTicks:180+variant*12},
  objectives,canonStatus:'original-tantalus-simulation',canonExact:false,revision:188};
})));
const catalogue=new Map(XENO_TRIALS_OPERATIONS_V188.map(entry=>[entry.id,entry]));
export const getXenoTrialsOperationV188=id=>catalogue.get(id)||getArbiterOperationV191(id);
export const XENO_TRIALS_OPERATION_LIMITS_V188=freeze({schema:188,maxObjectives:3,ticksPerSecond:120,maxIntegrity:100,cargoPressureTicks:120,purgePressureTicks:240});
const stateKeys=['schema','operationId','matchId','seed','status','failureReason','elapsedTicks','startedTick','lastTick','completedTick','progress','completed','integrity','cargoTravelTicks','cargoX','carrying','delivered','depotTicks','exitTicks'];
const integer=(value,min,max)=>Number.isSafeInteger(value)&&value>=min&&value<=max;
const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
function configEntry(config){
 const entry=getXenoTrialsOperationV188(config?.activityV119?.branch==='operations'?config.activityV119.id:config?.operationV188?.id);
 return entry&&typeof config.matchId==='string'&&/^[a-zA-Z0-9_-]{1,96}$/.test(config.matchId)
  &&integer(config.seed,1,0x7fffffff)&&config.stageId===entry.stageId?entry:null;
}

export function createXenoTrialsOperationStateV188(id,config){
 const entry=getXenoTrialsOperationV188(id);if(!entry||configEntry(config)!==entry)return null;
 return{schema:188,operationId:id,matchId:config.matchId,seed:config.seed,status:'active',failureReason:null,
  elapsedTicks:0,startedTick:0,lastTick:0,completedTick:null,progress:entry.objectives.map(()=>0),completed:entry.objectives.map(()=>false),
  integrity:100,cargoTravelTicks:0,cargoX:entry.cargoStartX,carrying:-1,delivered:entry.objectives.map(()=>false),depotTicks:0,exitTicks:0};
}
function nearby(player,target){
 if(!player||player.hp<=0||player.y!==0||!Number.isFinite(player.x))return false;
 const body=getXenoTrialsBodyBoundsV105(player);
 return Number.isFinite(body?.left)&&Number.isFinite(body?.right)&&body.left<=target.x+target.radius&&body.right>=target.x-target.radius;
}
function windowOpen(objective,ticks){
 const phase=ticks%objective.periodTicks;
 return phase>=objective.windowStartTicks&&phase<objective.windowStartTicks+objective.windowTicks;
}
function finish(state,status,reason,emit){
 state.status=status;state.failureReason=reason;state.completedTick=state.lastTick;
 emit?.(status==='completed'?'operation-complete-v188':'operation-failed-v188',{operationId:state.operationId,reason});
}
const doneCount=state=>state.completed.filter(Boolean).length;

/** Mutates only the supplied local operation state, once per native fixed tick.
 * Pause/repeated rendering cannot add work; the caller owns actor physics/HP. */
export function stepXenoTrialsOperationV188(state,match,dt,input={},emit=null){
 const entry=getXenoTrialsOperationV188(state?.operationId);
 if(!entry||state.status!=='active'||match?.paused||match?.phase!=='active'||!Number.isFinite(dt)||dt<=0||dt>1/60
  ||!integer(match?.tick,1,10000000)||match.tick<=state.lastTick)return state;
 if(state.elapsedTicks===0)state.startedTick=match.tick-1;
 state.lastTick=match.tick;state.elapsedTicks++;
 const player=match.fighters?.[0],interact=input.interact===true;
 if(!player||player.hp<=0){finish(state,'failed','player-ko',emit);return state;}
 if(state.elapsedTicks>=entry.roundSeconds*120||match.timeRemaining<=0){finish(state,'failed','time',emit);return state;}
 const charging=index=>interact&&nearby(player,entry.objectives[index]);
 const complete=index=>{state.completed[index]=true;state.progress[index]=entry.objectives[index].requiredTicks;
  emit?.('operation-objective-v188',{operationId:entry.id,objectiveId:entry.objectives[index].id,index});};
 if(entry.kind==='escort'){
  const cargo={x:state.cargoX,radius:entry.objectives[0].radius};
  if(interact&&nearby(player,cargo)){state.cargoTravelTicks=Math.min(entry.objectives[0].requiredTicks,state.cargoTravelTicks+1);state.progress[0]=state.cargoTravelTicks;}
  state.cargoX=entry.cargoStartX+(entry.cargoEndX-entry.cargoStartX)*state.cargoTravelTicks/entry.objectives[0].requiredTicks;
  if(state.elapsedTicks%120===0){const pressure=(match.fighters||[]).slice(1).filter(enemy=>enemy.hp>0&&enemy.y===0&&nearby(enemy,{x:state.cargoX,radius:65})).length;
   state.integrity=Math.max(0,state.integrity-Math.min(3,pressure)*3);}
  if(state.cargoTravelTicks===entry.objectives[0].requiredTicks)complete(0);
 }else if(entry.kind==='relay'){
  const index=state.completed.findIndex(value=>!value);
  if(index>=0){state.progress[index]=charging(index)?state.progress[index]+1:Math.max(0,state.progress[index]-2);if(state.progress[index]>=entry.objectives[index].requiredTicks)complete(index);}
 }else if(entry.kind==='purge'){
  for(let index=0;index<entry.objectives.length;index++)if(!state.completed[index]){
   if(charging(index))state.progress[index]++;
   else if(state.elapsedTicks%18===0)state.progress[index]=Math.max(0,state.progress[index]-1);
   if(state.progress[index]>=entry.objectives[index].requiredTicks)complete(index);
  }
  if(state.elapsedTicks%240===0)state.integrity=Math.max(0,state.integrity-entry.objectives.length+doneCount(state));
 }else if(entry.kind==='beacon'){
  for(let index=0;index<entry.objectives.length;index++)if(!state.completed[index]){
   state.progress[index]=charging(index)&&windowOpen(entry.objectives[index],state.elapsedTicks)?state.progress[index]+1:Math.max(0,state.progress[index]-2);
   if(state.progress[index]>=entry.objectives[index].requiredTicks)complete(index);
  }
 }else if(entry.kind==='extraction'){
  if(state.carrying<0){
   for(let index=0;index<entry.objectives.length;index++)if(!state.completed[index]){
    state.progress[index]=charging(index)?state.progress[index]+1:Math.max(0,state.progress[index]-2);
    if(state.progress[index]>=entry.objectives[index].requiredTicks){complete(index);state.carrying=index;break;}
   }
   state.depotTicks=0;
  }else{
   state.depotTicks=interact&&nearby(player,entry.depot)?state.depotTicks+1:0;
   if(state.depotTicks>=entry.depot.requiredTicks){state.delivered[state.carrying]=true;state.carrying=-1;state.depotTicks=0;
    emit?.('operation-delivery-v188',{operationId:entry.id,delivered:state.delivered.filter(Boolean).length});}
  }
  if(state.delivered.every(Boolean))state.exitTicks=interact&&nearby(player,entry.exit)?Math.min(entry.exit.requiredTicks,state.exitTicks+1):0;
 }
 if(state.integrity<=0){finish(state,'failed','structure-destroyed',emit);return state;}
 const objectivesDone=entry.kind==='extraction'?state.delivered.every(Boolean)&&state.exitTicks===entry.exit.requiredTicks:state.completed.every(Boolean);
 if(objectivesDone)finish(state,'completed',null,emit);
 return state;
}

export function validateXenoTrialsOperationSnapshotV188(state,config,match=null){
 const entry=configEntry(config),max=entry?.roundSeconds*120;
 if(!entry||!record(state)||Object.keys(state).length!==stateKeys.length||stateKeys.some(key=>!Object.hasOwn(state,key))
  ||state.schema!==188||state.operationId!==entry.id||state.matchId!==config.matchId||state.seed!==config.seed
  ||!['active','completed','failed'].includes(state.status)||!integer(state.elapsedTicks,0,max)
  ||!integer(state.startedTick,0,max+600)||!integer(state.lastTick,0,max+600)
  ||(state.elapsedTicks>0&&state.lastTick-state.startedTick!==state.elapsedTicks)
  ||!integer(state.integrity,0,100)||!integer(state.cargoTravelTicks,0,entry.objectives[0].requiredTicks)
  ||!integer(state.carrying,-1,entry.objectives.length-1)||!integer(state.depotTicks,0,entry.depot.requiredTicks)
  ||!integer(state.exitTicks,0,entry.exit.requiredTicks))return false;
 for(const key of ['progress','completed','delivered'])if(!Array.isArray(state[key])||state[key].length!==entry.objectives.length)return false;
 for(let index=0;index<entry.objectives.length;index++)if(!integer(state.progress[index],0,entry.objectives[index].requiredTicks)
  ||typeof state.completed[index]!=='boolean'||typeof state.delivered[index]!=='boolean'
  ||state.completed[index]!== (state.progress[index]===entry.objectives[index].requiredTicks)
  ||state.progress[index]>state.elapsedTicks)return false;
 if(!Number.isFinite(state.cargoX)||Math.abs(state.cargoX-(entry.cargoStartX+(entry.cargoEndX-entry.cargoStartX)*state.cargoTravelTicks/entry.objectives[0].requiredTicks))>1e-7)return false;
 if(entry.kind!=='escort'&&(state.cargoTravelTicks!==0||state.cargoX!==entry.cargoStartX))return false;
 if(entry.kind==='escort'&&state.progress[0]!==state.cargoTravelTicks)return false;
 if(entry.kind!=='extraction'&&(state.carrying!==-1||state.delivered.some(Boolean)||state.depotTicks!==0||state.exitTicks!==0))return false;
 if(!['escort','purge'].includes(entry.kind)&&state.integrity!==100)return false;
 if(entry.kind==='extraction'){
  if(state.delivered.some((value,index)=>value&&!state.completed[index])||state.carrying>=0&&(!state.completed[state.carrying]||state.delivered[state.carrying]))return false;
  if(doneCount(state)!==state.delivered.filter(Boolean).length+(state.carrying>=0?1:0)||state.exitTicks>0&&!state.delivered.every(Boolean))return false;
  if(state.progress.reduce((sum,value)=>sum+value,0)+state.delivered.filter(Boolean).length*entry.depot.requiredTicks+state.depotTicks+state.exitTicks-1>state.elapsedTicks)return false;
 }
 if(entry.kind==='relay'){
  const next=state.completed.findIndex(value=>!value);
  if(next>=0&&state.progress.slice(next+1).some(value=>value!==0))return false;
  if(state.progress.reduce((sum,value)=>sum+value,0)>state.elapsedTicks)return false;
 }
 const done=entry.kind==='extraction'?state.delivered.every(Boolean)&&state.exitTicks===entry.exit.requiredTicks:state.completed.every(Boolean);
 if(state.status==='active'&&(state.failureReason!==null||state.completedTick!==null||done||state.integrity<=0||state.elapsedTicks>=max))return false;
 if(state.status==='completed'&&(!done||state.failureReason!==null||state.integrity<=0||state.completedTick!==state.lastTick||state.elapsedTicks===0))return false;
 if(state.status==='failed'&&(!['time','player-ko','structure-destroyed'].includes(state.failureReason)||state.completedTick!==state.lastTick
  ||state.failureReason==='structure-destroyed'&&state.integrity!==0||state.failureReason==='time'&&state.elapsedTicks<max&&!(match?.timeRemaining<=0)))return false;
 if(match&&(match.config&&(match.config.matchId!==config.matchId||match.config.seed!==config.seed||match.config.stageId!==entry.stageId)
  ||state.lastTick!==match.tick&&state.elapsedTicks>0||state.status==='active'&&match.fighters?.[0]?.hp<=0))return false;
 return true;
}

export function getXenoTrialsOperationReceiptV188(state,config){
 if(!validateXenoTrialsOperationSnapshotV188(state,config))return null;
 const entry=getXenoTrialsOperationV188(state.operationId);
 return{...clone(state),kind:entry.kind,stageId:entry.stageId,totalObjectives:entry.objectives.length,
  completedObjectives:entry.kind==='extraction'?state.delivered.filter(Boolean).length:doneCount(state)};
}
export function validateXenoTrialsOperationReceiptV188(receipt,config){
 if(!record(receipt))return false;
 const state=Object.fromEntries(stateKeys.map(key=>[key,receipt[key]]));
 const expected=getXenoTrialsOperationReceiptV188(state,config);
 return Boolean(expected&&Object.keys(receipt).length===Object.keys(expected).length
  &&Object.keys(expected).every(key=>JSON.stringify(receipt[key])===JSON.stringify(expected[key])));
}

/** Charges may decay legitimately; sealed objectives, delivered/acquired cargo,
 * escort travel and lost integrity cannot be rolled back by a later checkpoint. */
export function isXenoTrialsOperationForwardV188(previous,next){
 if(!previous)return true;
 if(!record(next)||previous.operationId!==next.operationId||previous.matchId!==next.matchId||previous.seed!==next.seed
  ||next.lastTick<previous.lastTick||next.elapsedTicks<previous.elapsedTicks||next.integrity>previous.integrity
  ||next.cargoTravelTicks<previous.cargoTravelTicks||previous.status!=='active'&&next.status!==previous.status)return false;
 if(next.lastTick===previous.lastTick)return stateKeys.every(key=>JSON.stringify(previous[key])===JSON.stringify(next[key]));
 return previous.completed.every((done,index)=>!done||next.completed[index])&&previous.delivered.every((done,index)=>!done||next.delivered[index]);
}

/** Read-only world/HUD view. The renderer chooses existing prop artwork; the
 * authoritative positions, interaction radii and charge windows come from here. */
export function getXenoTrialsOperationViewV188(match){
 const state=match?.operationV188,entry=getXenoTrialsOperationV188(state?.operationId);if(!entry)return null;
 let entities=entry.objectives.map((objective,index)=>({...objective,active:!state.completed[index]&&(entry.kind!=='relay'||index===state.completed.findIndex(done=>!done)),completed:state.completed[index],progress:state.progress[index],
  ...(entry.kind==='beacon'?{windowOpen:windowOpen(objective,state.elapsedTicks)}:{})}));
 let target=entities.find(entity=>!entity.completed)||null;
 if(entry.kind==='escort'){entities=[{...entities[0],x:state.cargoX,destinationX:entry.cargoEndX,integrity:state.integrity}];target=entities[0];}
 if(entry.kind==='extraction'){
  entities=entities.map((entity,index)=>({...entity,active:!state.completed[index],delivered:state.delivered[index],carried:state.carrying===index}));
  entities.push({...entry.depot,active:state.carrying>=0,completed:state.delivered.every(Boolean),progress:state.depotTicks},
   {...entry.exit,active:state.delivered.every(Boolean),completed:state.status==='completed',progress:state.exitTicks});
  target=state.carrying>=0?entities.find(entity=>entity.kind==='depot'):state.delivered.every(Boolean)?entities.find(entity=>entity.kind==='exit'):entities.find(entity=>entity.kind==='supply'&&!entity.completed);
 }
 const done=entry.kind==='extraction'?state.delivered.filter(Boolean).length:doneCount(state);
 const failureLabel={'player-ko':'Spécimen neutralisé',time:'Temps écoulé','structure-destroyed':'Intégrité épuisée'}[state.failureReason]||'Évaluation interrompue';
 return{id:entry.id,title:entry.title,kind:entry.kind,status:state.status,phase:state.status==='active'?(state.carrying>=0?'carrying':'objective'):state.status,
  instruction:entry.instruction,hint:state.status==='failed'?`Évaluation interrompue : ${failureLabel}.`:state.status==='completed'?'Objectifs validés.':
   target?`${target.label} · maintenez E à proximité${target.windowOpen===false?' pendant la fenêtre verte':''}.`:'Rejoignez le sas.',
  progress:{done,total:entry.objectives.length,label:entry.kind==='extraction'?`${done}/${entry.objectives.length} caissons livrés`:`${done}/${entry.objectives.length} objectifs validés`},
  timeRemaining:Math.max(0,entry.roundSeconds-state.elapsedTicks/120),integrity:state.integrity,carrying:state.carrying,entities,
  target:target?{x:target.x,radius:target.radius,label:target.label}:null};
}
