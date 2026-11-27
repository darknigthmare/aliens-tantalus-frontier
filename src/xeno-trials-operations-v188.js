import {XENO_TRIALS_BOSS_STAGES_V179 as STAGES} from './xeno-trials-boss-stages-v179.js';
import {getXenoTrialsBodyBoundsV105} from './xeno-trials-geometry-v105.js';
import {getArbiterOperationV191} from './xeno-arbiter-protocols-v191.js';
import {getXenoTrialsIsolationOperationV212,XENO_TRIALS_ISOLATION_OPERATIONS_V212} from './xeno-trials-stage-isolation-v212.js';
import {XENO_TRIALS_CARGO_OPERATION_V213} from './xeno-trials-cargo-interlock-v213.js';
import {getXenoTrialsHordeProtocolV180,XENO_TRIALS_HORDE_LIMITS_V180} from './xeno-trials-horde-v180.js';
import {getXenoTrialsHordeBossViewV186} from './xeno-trials-horde-bosses-v186.js';
import {getXenoTrialsStageHazardViewV188} from './xeno-trials-stage-hazards-v188.js';

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
const relayOrders='Réarmez les trois relais dans l’ordre. Un contact hostile au sol dans le périmètre d’un relais bloque sa charge. Écartez-le ou neutralisez-le, puis reprenez la charge.';
export const XENO_TRIALS_RELAY_OPERATION_V218=freeze({
 id:'xto218-bridge-relays',kind:'relay',title:'RELAIS SOUS SIÈGE',label:'RELAIS SOUS SIÈGE',stageId:'xt179-bridge',
 hordeProtocolId:'xth218-bridge-retake',difficulty:'easy',factionId:'containment',roundSeconds:150,reward:450,
 instruction:relayOrders,description:relayOrders,startX:180,cargoStartX:180,cargoEndX:180,relayPressureV218:true,
 objectives:[
  {id:'bridge-relay-west',kind:'terminal',label:'Relais ouest',x:230,y:0,radius:98,pressureRadius:192,requiredTicks:300},
  {id:'bridge-relay-central',kind:'terminal',label:'Relais central',x:650,y:0,radius:90,pressureRadius:184,requiredTicks:144},
  {id:'bridge-relay-east',kind:'terminal',label:'Relais est',x:1130,y:0,radius:98,pressureRadius:192,requiredTicks:132}
 ],canonExact:false,canonStatus:'original-tantalus-simulation',revision:218
});
const batteryOrders='Synchronisez les trois balises pendant leurs fenêtres vertes. La première balise lance la réserve commune de neuf secondes. Choisissez votre départ selon les fenêtres.';
export const XENO_TRIALS_BEACON_OPERATION_V219=freeze({
 id:'xto219-battery-triangulation',kind:'beacon',title:'TRIANGULATION SUR BATTERIE',label:'TRIANGULATION SUR BATTERIE',stageId:'xt179-sensors',
 hordeProtocolId:'xth218-bridge-retake',difficulty:'easy',factionId:'containment',roundSeconds:150,reward:470,
 instruction:batteryOrders,description:batteryOrders,startX:175,cargoStartX:175,cargoEndX:175,batteryTicksV219:1080,
 objectives:[
  {id:'battery-west',kind:'beacon',label:'Balise ouest',x:175,y:0,radius:88,requiredTicks:84,periodTicks:720,windowStartTicks:0,windowTicks:220},
  {id:'battery-central',kind:'beacon',label:'Balise centrale',x:650,y:0,radius:88,requiredTicks:90,periodTicks:720,windowStartTicks:240,windowTicks:215},
  {id:'battery-east',kind:'beacon',label:'Balise est',x:1135,y:0,radius:88,requiredTicks:84,periodTicks:720,windowStartTicks:490,windowTicks:220}
 ],canonExact:false,canonStatus:'original-tantalus-simulation',revision:219
});
const reliefOrders='Neutralisez le dernier contact près du poste indiqué, puis maintenez Interagir pendant la relève. La vague suivante coupe la charge partielle. Les postes restent disponibles après la dernière vague.';
export const XENO_TRIALS_RELIEF_OPERATION_V220=freeze({
 id:'xto220-relief-corridor',kind:'relay',title:'COULOIR DE RELÈVE',label:'COULOIR DE RELÈVE',stageId:'xt179-ship-extraction',
 hordeProtocolId:'xth220-evac-relief',difficulty:'easy',factionId:'containment',roundSeconds:175,reward:520,
 instruction:reliefOrders,description:reliefOrders,startX:225,cargoStartX:225,cargoEndX:225,reliefV220:true,
 objectives:[
  {id:'relief-west',kind:'terminal',label:'Poste ouest',x:185,y:0,radius:90,requiredTicks:66},
  {id:'relief-central',kind:'terminal',label:'Poste central',x:650,y:0,radius:94,requiredTicks:72},
  {id:'relief-east',kind:'terminal',label:'Poste est',x:1150,y:0,radius:90,requiredTicks:78}
 ],canonExact:false,canonStatus:'original-tantalus-simulation',revision:220
});
const bypassOrders='Neutralisez le vigile, puis alimentez le volet du hangar depuis le poste de dérivation. Rejoignez la borne de sortie après son ouverture.';
export const XENO_TRIALS_BYPASS_OPERATION_V221=freeze({
 id:'xto221-hangar-bypass',kind:'relay',title:'DÉRIVATION DU HANGAR',label:'DÉRIVATION DU HANGAR',stageId:'xt179-hangar',
 hordeProtocolId:'xth221-hangar-watch',difficulty:'easy',factionId:'containment',roundSeconds:170,reward:540,
 instruction:bypassOrders,description:bypassOrders,startX:390,cargoStartX:390,cargoEndX:390,bypassOpeningTicksV221:72,
 objectives:[
  {id:'hangar-bypass',kind:'terminal',label:'Poste de dérivation',x:390,y:0,radius:96,requiredTicks:96},
  {id:'hangar-exit',kind:'terminal',label:'Borne de sortie',x:1125,y:0,radius:98,requiredTicks:90}
 ],canonExact:false,canonStatus:'original-tantalus-simulation',revision:221
});
const gantryOrders='Escortez le chariot. Aux deux arrêts, rejoignez la borne indiquée et maintenez Interagir pour autoriser le passage. Revenez au chariot après chaque contrôle. Les contacts proches continuent à l’endommager.';
const gantryRoute=[
 {startTick:0,endTick:216,fromX:175,toX:455},
 {startTick:216,endTick:312,fromX:455,toX:455,stationIndex:1},
 {startTick:312,endTick:540,fromX:455,toX:875},
 {startTick:540,endTick:648,fromX:875,toX:875,stationIndex:2},
 {startTick:648,endTick:888,fromX:875,toX:1340}
];
export const XENO_TRIALS_GANTRY_OPERATION_V222=freeze({
 id:'xto222-gantry-convoy',kind:'escort',title:'CONVOI AUX PORTIQUES',label:'CONVOI AUX PORTIQUES',stageId:'xt179-logistics',
 hordeProtocolId:'xth222-logistics-watch',difficulty:'easy',factionId:'containment',roundSeconds:165,reward:555,
 instruction:gantryOrders,description:gantryOrders,startX:gantryRoute[0].fromX,
 cargoStartX:gantryRoute[0].fromX,cargoEndX:gantryRoute.at(-1).toX,gantryRouteV222:gantryRoute,
 objectives:[
  {id:'logistics-haul',kind:'cargo',label:'Chariot logistique',x:gantryRoute.at(-1).toX,y:0,radius:96,requiredTicks:gantryRoute.at(-1).endTick},
  {id:'gantry-west',kind:'terminal',label:'Borne ouest',x:145,y:0,radius:58,requiredTicks:gantryRoute[1].endTick-gantryRoute[1].startTick},
  {id:'gantry-east',kind:'terminal',label:'Borne est',x:1175,y:0,radius:58,requiredTicks:gantryRoute[3].endTick-gantryRoute[3].startTick}
 ],canonExact:false,canonStatus:'original-tantalus-simulation',revision:222
});
const groundingOrders='Attirez un contact dans la bande pendant la décharge pour alimenter le sas. Si tous les contacts sont neutralisés, réarmez la borne manuellement. Validez la sortie après l’ouverture.';
export const XENO_TRIALS_GROUNDING_OPERATION_V223=freeze({
 id:'xto223-grounding-transfer',kind:'relay',title:'PRISE DE TERRE',label:'PRISE DE TERRE',stageId:'xt179-reactor',
 hordeProtocolId:'xth223-reactor-patrol',difficulty:'easy',factionId:'containment',roundSeconds:165,reward:550,
 instruction:groundingOrders,description:groundingOrders,startX:550,cargoStartX:550,cargoEndX:550,groundingOpeningTicksV223:54,
 objectives:[
  {id:'reactor-ground',kind:'terminal',label:'Borne de réarmement',x:540,y:0,radius:82,requiredTicks:132},
  {id:'reactor-exit',kind:'terminal',label:'Sas du réacteur',x:1140,y:0,radius:96,requiredTicks:84}
 ],canonExact:false,canonStatus:'original-tantalus-simulation',revision:223
});
export const XENO_TRIALS_OPERATION_BOARD_V212=Object.freeze([...XENO_TRIALS_ISOLATION_OPERATIONS_V212,...XENO_TRIALS_OPERATIONS_V188]);
export const XENO_TRIALS_OPERATION_BOARD_V213=Object.freeze([XENO_TRIALS_RELAY_OPERATION_V218,XENO_TRIALS_BEACON_OPERATION_V219,XENO_TRIALS_RELIEF_OPERATION_V220,XENO_TRIALS_BYPASS_OPERATION_V221,
 XENO_TRIALS_GANTRY_OPERATION_V222,XENO_TRIALS_GROUNDING_OPERATION_V223,XENO_TRIALS_CARGO_OPERATION_V213,...XENO_TRIALS_OPERATION_BOARD_V212]);
export const getXenoTrialsOperationV188=id=>id===XENO_TRIALS_GROUNDING_OPERATION_V223.id ? XENO_TRIALS_GROUNDING_OPERATION_V223
 :id===XENO_TRIALS_GANTRY_OPERATION_V222.id ? XENO_TRIALS_GANTRY_OPERATION_V222
 :id===XENO_TRIALS_BYPASS_OPERATION_V221.id ? XENO_TRIALS_BYPASS_OPERATION_V221
 :id===XENO_TRIALS_RELIEF_OPERATION_V220.id ? XENO_TRIALS_RELIEF_OPERATION_V220
 :id===XENO_TRIALS_BEACON_OPERATION_V219.id ? XENO_TRIALS_BEACON_OPERATION_V219
 :id===XENO_TRIALS_RELAY_OPERATION_V218.id ? XENO_TRIALS_RELAY_OPERATION_V218
 :id===XENO_TRIALS_CARGO_OPERATION_V213.id ? XENO_TRIALS_CARGO_OPERATION_V213
 :catalogue.get(id)||getArbiterOperationV191(id)||getXenoTrialsIsolationOperationV212(id);
export const XENO_TRIALS_OPERATION_LIMITS_V188=freeze({schema:188,maxObjectives:3,ticksPerSecond:120,maxIntegrity:100,cargoPressureTicks:120,purgePressureTicks:240,purgeRegrowTicks:18});
const stateKeys=['schema','operationId','matchId','seed','status','failureReason','elapsedTicks','startedTick','lastTick','completedTick','progress','completed','integrity','cargoTravelTicks','cargoX','carrying','delivered','depotTicks','exitTicks'];
const batteryStateKeys=[...stateKeys,'batteryStartedTickV219'];
const bypassStateKeys=[...stateKeys,'bypassStartedTickV221'];
const groundingStateKeys=[...stateKeys,'groundingActivationV223'];
const stateKeysFor=entry=>entry?.groundingOpeningTicksV223?groundingStateKeys:
 entry?.bypassOpeningTicksV221?bypassStateKeys:entry?.batteryTicksV219?batteryStateKeys:stateKeys;
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
  integrity:100,cargoTravelTicks:0,cargoX:entry.cargoStartX,carrying:-1,delivered:entry.objectives.map(()=>false),depotTicks:0,exitTicks:0,
  ...(entry.batteryTicksV219?{batteryStartedTickV219:null}:{}),...(entry.bypassOpeningTicksV221?{bypassStartedTickV221:null}:{}),
  ...(entry.groundingOpeningTicksV223?{groundingActivationV223:null}:{})};
}
function nearby(player,target){
 if(!player||player.hp<=0||player.y!==0||!Number.isFinite(player.x))return false;
 const body=getXenoTrialsBodyBoundsV105(player);
 return Number.isFinite(body?.left)&&Number.isFinite(body?.right)&&body.left<=target.x+target.radius&&body.right>=target.x-target.radius;
}
// Derive pressure from the current native actors. Paused and restored views
// need no extra timers, event replay, or saved pressure flags.
function relayContested(match,objective){
 const perimeter={x:objective.x,radius:objective.pressureRadius};
 return match.fighters?.some(fighter=>fighter.side==='opponent'&&nearby(fighter,perimeter))===true;
}
function reliefWindow(match){
 const horde=match.hordeV180;
 if(horde?.phase==='complete')return {phase:'secured',open:true,remainingTicks:null};
 if(horde?.phase==='intermission'&&horde.nextWaveTick>match.tick)
  return {phase:'relief',open:true,remainingTicks:horde.nextWaveTick-match.tick};
 return {phase:'combat',open:false,remainingTicks:null};
}
function isHangarWatchDefeated(match,entry){
 const horde=match.hordeV180;
 if(horde?.protocolId!==entry.hordeProtocolId)return false;
 const protocol=getXenoTrialsHordeProtocolV180(horde.protocolId);
 if(Array.isArray(match.fighters))return getXenoTrialsHordeBossViewV186(protocol,horde,match.fighters)?.defeated===true;
 // Progression validates a result summary, while checkpoints carry the actual
 // native slots. Require the authored boss identity on the terminal receipt.
 const boss=protocol.bossFinaleV186,receipt=horde.bossFinaleV186;
 const preceding=protocol.waves.slice(0,boss.wave-1).reduce((count,wave)=>count+wave.total,0);
 return receipt?.defeated===true&&receipt.phase==='defeated'&&receipt.hp===0&&receipt.instanceId===null
  &&receipt.fighterId===boss.fighterId&&receipt.maxHp===boss.hp&&receipt.wave===boss.wave
  &&horde.wavesCleared>=boss.wave-1&&horde.kills>preceding;
}
function hangarBypassStatus(state,match,entry){
 const startedTick=state.bypassStartedTickV221;
 if(startedTick===null)return {phase:isHangarWatchDefeated(match,entry)?'ready':'locked',opening:0};
 const opening=clamp((match.tick-startedTick)/entry.bypassOpeningTicksV221,0,1);
 return {phase:opening===1?'open':'opening',opening};
}
export function getXenoTrialsHangarBypassV221(match){
 const state=match?.operationV188,entry=XENO_TRIALS_BYPASS_OPERATION_V221;
 return state?.operationId===entry.id?hangarBypassStatus(state,match,entry):null;
}
const gantryLeg=(entry,ticks)=>entry.gantryRouteV222?.find(leg=>ticks<leg.endTick);
function escortPosition(entry,ticks){
 if(!entry.gantryRouteV222)return entry.cargoStartX+(entry.cargoEndX-entry.cargoStartX)*ticks/entry.objectives[0].requiredTicks;
 const leg=gantryLeg(entry,ticks);
 return leg?leg.fromX+(leg.toX-leg.fromX)*(ticks-leg.startTick)/(leg.endTick-leg.startTick):entry.cargoEndX;
}
export function getXenoTrialsGantryConvoyV222(match){
 const state=match?.operationV188,entry=XENO_TRIALS_GANTRY_OPERATION_V222;
 if(state?.operationId!==entry.id)return null;
 const ticks=state.cargoTravelTicks,stationIndex=gantryLeg(entry,ticks)?.stationIndex??null;
 // The portcullis is driven by the departure rail after its terminal has
 // authorized it. Both ends of the motion derive from the saved work cursor.
 const gantries=entry.gantryRouteV222.filter(leg=>leg.stationIndex).map(leg=>({
  id:entry.objectives[leg.stationIndex].id,
  phase:ticks>=leg.endTick?'authorized':ticks>=leg.startTick?'inspection':'locked',
  opening:clamp((ticks-leg.endTick)/64,0,1)
 }));
 return{stationIndex,gantries};
}
function groundingManualAvailable(match,entry){
 const horde=match?.hordeV180;
 if(horde?.protocolId!==entry.hordeProtocolId)return false;
 const protocol=getXenoTrialsHordeProtocolV180(horde.protocolId);
 return horde.wavesCleared===protocol.waves.length&&(horde.totalKills??horde.kills)===protocol.totalEnemies;
}
function groundingStatus(state,match,entry){
 const activation=state.groundingActivationV223;
 if(!activation)return{phase:groundingManualAvailable(match,entry)?'manual':'waiting',opening:0};
 const opening=clamp((match.tick-activation.tick)/entry.groundingOpeningTicksV223,0,1);
 return{phase:opening===1?'open':'opening',opening,method:activation.method};
}
export function getXenoTrialsGroundingDoorV223(match){
 const state=match?.operationV188,entry=XENO_TRIALS_GROUNDING_OPERATION_V223;
 return state?.operationId===entry.id?groundingStatus(state,match,entry):null;
}
function acceptedGroundingArc(match){
 return match.events?.some(event=>event.type==='stage-hazard-contact-v188'&&event.tick===match.tick&&event.kind==='arc'
  &&/^horde-[1-9]\d*$/.test(event.actorId)&&event.damage>0)===true;
}
function validGroundingState(state,entry,match){
 const activation=state.groundingActivationV223;
 const hazard=match?.stageHazardsV188;
 const hostileDamage=hazard&&hazard.totalDamage-hazard.playerDamage;
 if(activation===null)return !state.completed[0]&&(!match||((state.status!=='active'||hostileDamage===0)
  &&(state.progress[0]===0||groundingManualAvailable(match,entry))));
 if(!state.completed[0]||!record(activation)||Object.keys(activation).length!==2||!['arc','manual'].includes(activation.method)
  ||!integer(activation.tick,state.startedTick+entry.objectives[0].requiredTicks,state.lastTick)
  ||state.progress[1]>Math.max(0,state.lastTick-activation.tick-entry.groundingOpeningTicksV223+1))return false;
 if(!match)return true;
 if(activation.method==='manual')return hostileDamage===0&&groundingManualAvailable(match,entry);
 if(!(hostileDamage>0))return false;
 // The native arc clock survives checkpoints even after contact events have
 // left the bounded replay buffer. Require a live discharge at the onset.
 const atActivation=getXenoTrialsStageHazardViewV188({ tick:activation.tick,phase:'active',stageHazardsV188:hazard,
  config:{stageId:entry.stageId,operationV188:{id:entry.id}},operationV188:{operationId:entry.id,status:'active'} });
 return atActivation?.kind==='arc'&&atActivation.phase==='active';
}
function windowOpen(objective,ticks){
 const phase=ticks%objective.periodTicks;
 return windowPhaseOpen(objective,phase);
}
function windowPhaseOpen(objective,phase){
 return phase>=objective.windowStartTicks&&phase<objective.windowStartTicks+objective.windowTicks;
}
function beaconWindow(objective,ticks){
 const phase=ticks%objective.periodTicks,windowOpen=windowPhaseOpen(objective,phase);
 const windowRemainingTicks=windowOpen?objective.windowStartTicks+objective.windowTicks-phase:
  (objective.windowStartTicks-phase+objective.periodTicks)%objective.periodTicks;
 return{windowOpen,windowRemainingTicks};
}
function finish(state,status,reason,emit){
 state.status=status;state.failureReason=reason;state.completedTick=state.lastTick;
 emit?.(status==='completed'?'operation-complete-v188':'operation-failed-v188',{operationId:state.operationId,reason});
}
const doneCount=state=>state.completed.filter(Boolean).length;
function batteryStatus(state,entry){
 const armed=state.batteryStartedTickV219!==null,durationTicks=entry.batteryTicksV219;
 const remainingTicks=armed?Math.max(0,durationTicks-(state.lastTick-state.batteryStartedTickV219)):durationTicks;
 return{armed,remainingTicks,durationTicks};
}
const batteryIntegrity=({remainingTicks,durationTicks})=>Math.ceil(100*remainingTicks/durationTicks);

function validBatteryState(state,entry){
 if(state.progress.reduce((total,progress)=>total+progress,0)>state.elapsedTicks)return false;
 const first=state.batteryStartedTickV219;
 if(first===null)return state.completed.every(done=>!done)&&state.integrity===100;
 if(!integer(first,state.startedTick+1,state.lastTick)||state.lastTick-first>entry.batteryTicksV219)return false;
 const firstElapsed=first-state.startedTick;
 // The clock can start only on the earliest possible completion of an
 // already-synchronized receiver, inside that receiver's green window.
 const canStart=entry.objectives.some((objective,index)=>{
  const phase=firstElapsed%objective.periodTicks;
  return state.completed[index]&&firstElapsed>=objective.requiredTicks&&windowPhaseOpen(objective,phase)
   &&phase-objective.windowStartTicks+1>=objective.requiredTicks;
 });
 return canStart&&state.integrity===batteryIntegrity(batteryStatus(state,entry));
}

/** Mutates only the supplied local operation state, once per native fixed tick.
 * Pause/repeated rendering cannot add work; the caller owns actor physics/HP. */
export function stepXenoTrialsOperationV188(state,match,dt,input={},emit=null){
 const entry=getXenoTrialsOperationV188(state?.operationId);
 if(!entry||state.status!=='active'||match?.paused||match?.phase!=='active'||!Number.isFinite(dt)||dt<=0||dt>1/60
  ||!integer(match?.tick,1,10000000)||match.tick<=state.lastTick)return state;
 if(state.elapsedTicks===0)state.startedTick=match.tick-1;
 state.lastTick=match.tick;state.elapsedTicks++;
 if(entry.batteryTicksV219)state.integrity=batteryIntegrity(batteryStatus(state,entry));
 const player=match.fighters?.[0],interact=input.interact===true;
 if(!player||player.hp<=0){finish(state,'failed','player-ko',emit);return state;}
 if(state.elapsedTicks>=entry.roundSeconds*120||match.timeRemaining<=0){finish(state,'failed','time',emit);return state;}
 if(entry.batteryTicksV219&&state.integrity===0){finish(state,'failed','structure-destroyed',emit);return state;}
 const charging=index=>interact&&nearby(player,entry.objectives[index]);
 const complete=index=>{state.completed[index]=true;state.progress[index]=entry.objectives[index].requiredTicks;
  if(entry.batteryTicksV219&&state.batteryStartedTickV219===null)state.batteryStartedTickV219=state.lastTick;
  if(entry.bypassOpeningTicksV221&&index===0)state.bypassStartedTickV221=state.lastTick;
  emit?.('operation-objective-v188',{operationId:entry.id,objectiveId:entry.objectives[index].id,index});};
 if(entry.kind==='escort'){
  const cargo={x:state.cargoX,radius:entry.objectives[0].radius};
  const leg=gantryLeg(entry,state.cargoTravelTicks),station=leg?.stationIndex;
  if(interact&&nearby(player,station?entry.objectives[station]:cargo)){
   state.cargoTravelTicks=Math.min(entry.objectives[0].requiredTicks,state.cargoTravelTicks+1);
   state.progress[0]=state.cargoTravelTicks;
   if(station){
    state.progress[station]=state.cargoTravelTicks-leg.startTick;
    if(state.cargoTravelTicks===leg.endTick)complete(station);
   }
  }
  state.cargoX=escortPosition(entry,state.cargoTravelTicks);
  if(state.elapsedTicks%120===0){const pressure=(match.fighters||[]).slice(1).filter(enemy=>enemy.hp>0&&enemy.y===0&&nearby(enemy,{x:state.cargoX,radius:65})).length;
   state.integrity=Math.max(0,state.integrity-Math.min(3,pressure)*3);}
  if(state.cargoTravelTicks===entry.objectives[0].requiredTicks)complete(0);
 }else if(entry.kind==='relay'){
  const index=state.completed.findIndex(value=>!value);
  if(index>=0){
   const objective=entry.objectives[index];
   const bypass=entry.bypassOpeningTicksV221?hangarBypassStatus(state,match,entry):null;
   const grounding=entry.groundingOpeningTicksV223?groundingStatus(state,match,entry):null;
   const canCharge=charging(index)&&(!entry.relayPressureV218||!relayContested(match,objective))
    &&(!bypass||bypass.phase===(index===0?'ready':'open'))&&(!grounding||grounding.phase===(index===0?'manual':'open'));
   const arc=index===0&&grounding&&acceptedGroundingArc(match);
   if(arc)state.progress[index]=objective.requiredTicks;
   else if(entry.reliefV220&&!reliefWindow(match).open)state.progress[index]=0;
   else state.progress[index]=canCharge?state.progress[index]+1:Math.max(0,state.progress[index]-2);
   if(state.progress[index]>=objective.requiredTicks){
    if(grounding&&index===0)state.groundingActivationV223={method:arc?'arc':'manual',tick:state.lastTick};
    complete(index);
   }
  }
 }else if(entry.kind==='purge'){
  for(let index=0;index<entry.objectives.length;index++)if(!state.completed[index]){
   if(charging(index))state.progress[index]++;
   else if(state.elapsedTicks%XENO_TRIALS_OPERATION_LIMITS_V188.purgeRegrowTicks===0)state.progress[index]=Math.max(0,state.progress[index]-1);
   if(state.progress[index]>=entry.objectives[index].requiredTicks)complete(index);
  }
  if(state.elapsedTicks%XENO_TRIALS_OPERATION_LIMITS_V188.purgePressureTicks===0)state.integrity=Math.max(0,state.integrity-entry.objectives.length+doneCount(state));
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
 const entry=configEntry(config),max=entry?.roundSeconds*120,keys=stateKeysFor(entry);
 if(!entry||!record(state)||Object.keys(state).length!==keys.length||keys.some(key=>!Object.hasOwn(state,key))
  ||state.schema!==188||state.operationId!==entry.id||state.matchId!==config.matchId||state.seed!==config.seed
  ||!['active','completed','failed'].includes(state.status)||!integer(state.elapsedTicks,0,max)
  ||!integer(state.startedTick,0,max+600)||!integer(state.lastTick,0,max+600)
  ||(state.elapsedTicks>0&&state.lastTick-state.startedTick!==state.elapsedTicks)
  ||!integer(state.integrity,0,100)||!integer(state.cargoTravelTicks,0,entry.objectives[0].requiredTicks)
  ||!integer(state.carrying,-1,entry.objectives.length-1)||!integer(state.depotTicks,0,entry.depot?.requiredTicks??0)
  ||!integer(state.exitTicks,0,entry.exit?.requiredTicks??0))return false;
 for(const key of ['progress','completed','delivered'])if(!Array.isArray(state[key])||state[key].length!==entry.objectives.length)return false;
 for(let index=0;index<entry.objectives.length;index++)if(!integer(state.progress[index],0,entry.objectives[index].requiredTicks)
  ||typeof state.completed[index]!=='boolean'||typeof state.delivered[index]!=='boolean'
  ||state.completed[index]!== (state.progress[index]===entry.objectives[index].requiredTicks)
  ||state.progress[index]>state.elapsedTicks)return false;
 if(!Number.isFinite(state.cargoX)||Math.abs(state.cargoX-escortPosition(entry,state.cargoTravelTicks))>1e-7)return false;
 if(entry.kind!=='escort'&&(state.cargoTravelTicks!==0||state.cargoX!==entry.cargoStartX))return false;
 if(entry.kind==='escort'&&state.progress[0]!==state.cargoTravelTicks)return false;
 if(entry.gantryRouteV222?.some(leg=>leg.stationIndex&&state.progress[leg.stationIndex]!==
  clamp(state.cargoTravelTicks-leg.startTick,0,leg.endTick-leg.startTick)))return false;
 if(entry.kind!=='extraction'&&(state.carrying!==-1||state.delivered.some(Boolean)||state.depotTicks!==0||state.exitTicks!==0))return false;
 if(entry.batteryTicksV219){if(!validBatteryState(state,entry))return false;}
 else if(!['escort','purge'].includes(entry.kind)&&state.integrity!==100)return false;
 if(entry.kind==='extraction'){
  if(state.delivered.some((value,index)=>value&&!state.completed[index])||state.carrying>=0&&(!state.completed[state.carrying]||state.delivered[state.carrying]))return false;
  if(doneCount(state)!==state.delivered.filter(Boolean).length+(state.carrying>=0?1:0)||state.exitTicks>0&&!state.delivered.every(Boolean))return false;
  if(state.progress.reduce((sum,value)=>sum+value,0)+state.delivered.filter(Boolean).length*entry.depot.requiredTicks+state.depotTicks+state.exitTicks-1>state.elapsedTicks)return false;
 }
 if(entry.kind==='relay'){
  const next=state.completed.findIndex(value=>!value);
  if(next>=0&&state.progress.slice(next+1).some(value=>value!==0))return false;
  if(state.progress.reduce((sum,value)=>sum+value,0)>state.elapsedTicks)return false;
  if(entry.groundingOpeningTicksV223&&!validGroundingState(state,entry,match))return false;
  if(entry.bypassOpeningTicksV221){
   const started=state.bypassStartedTickV221;
   const mayHold=match===null||isHangarWatchDefeated(match,entry);
   if(!mayHold&&state.progress[0]>0)return false;
   const timingMatches=state.completed[0]?integer(started,state.startedTick+entry.objectives[0].requiredTicks,state.lastTick):started===null;
   if(!timingMatches)return false;
   // Charge is possible on the first fully open tick, including that tick.
   if(state.progress[1]>0&&state.progress[1]>state.lastTick-started-entry.bypassOpeningTicksV221+1)return false;
  }
  if(entry.reliefV220&&match){
   const cleared=match.hordeV180?.wavesCleared,secured=doneCount(state);
   if(!Number.isSafeInteger(cleared)||secured>cleared)return false;
   if(state.status==='active'){
    const relief=reliefWindow(match),partial=state.progress[next]??0;
    const {intermissionTicks}=XENO_TRIALS_HORDE_LIMITS_V180;
    // Each relief can fit only one completion. When every cleared wave
    // supplied a post, account for the hold completed in the current window.
    const justSecured=secured>0&&secured===cleared?entry.objectives[secured-1].requiredTicks:0;
    if(!relief.open&&partial>0||relief.phase==='relief'&&partial+justSecured>intermissionTicks-relief.remainingTicks+1)return false;
   }
  }
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
 const state=Object.fromEntries(stateKeysFor(configEntry(config)).map(key=>[key,receipt[key]]));
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
 const entry=getXenoTrialsOperationV188(previous.operationId);
 if(entry?.gantryRouteV222&&next.cargoTravelTicks-previous.cargoTravelTicks>next.elapsedTicks-previous.elapsedTicks)return false;
 if(entry?.groundingOpeningTicksV223){
  const before=previous.groundingActivationV223,after=next.groundingActivationV223;
  if(before?after?.tick!==before.tick||after?.method!==before.method:after&&after.tick<=previous.lastTick)return false;
 }
 const timingKey=entry?.bypassOpeningTicksV221?'bypassStartedTickV221':entry?.batteryTicksV219?'batteryStartedTickV219':null;
 if(timingKey){
  const start=previous[timingKey],nextStart=next[timingKey];
  if(start!==null?nextStart!==start:nextStart!==null&&!(nextStart>previous.lastTick))return false;
 }
 if(next.lastTick===previous.lastTick)return stateKeysFor(entry).every(key=>JSON.stringify(previous[key])===JSON.stringify(next[key]));
 return previous.completed.every((done,index)=>!done||next.completed[index])&&previous.delivered.every((done,index)=>!done||next.delivered[index]);
}

/** Read-only world/HUD view. The renderer chooses existing prop artwork; the
 * authoritative positions, interaction radii and charge windows come from here. */
export function getXenoTrialsOperationViewV188(match){
 const state=match?.operationV188,entry=getXenoTrialsOperationV188(state?.operationId);if(!entry)return null;
 const nextRelay=entry.kind==='relay'?state.completed.findIndex(done=>!done):-1;
 const relief=entry.reliefV220?reliefWindow(match):null;
 const bypass=entry.bypassOpeningTicksV221?getXenoTrialsHangarBypassV221(match):null;
 const gantry=entry.gantryRouteV222?getXenoTrialsGantryConvoyV222(match):null;
 const grounding=entry.groundingOpeningTicksV223?getXenoTrialsGroundingDoorV223(match):null;
 let entities=entry.objectives.map((objective,index)=>{
  const active=!state.completed[index]&&(entry.kind!=='relay'||index===nextRelay);
  return {...objective,active,completed:state.completed[index],progress:state.progress[index],
   ...(entry.relayPressureV218?{contested:state.status==='active'&&active&&relayContested(match,objective)}:{}),
   ...(entry.kind==='beacon'?beaconWindow(objective,state.elapsedTicks):{})};
 });
 let target=entities.find(entity=>!entity.completed)||null;
 if(['beacon','purge'].includes(entry.kind)&&state.status==='active'){
  const player=match.fighters?.[0],remaining=entities.filter(entity=>!entity.completed);
  const touching=remaining.filter(entity=>nearby(player,entity));
  // All three receivers are valid starting points. Point toward the closest
  // unfinished one while travelling instead of prescribing the western route.
  if(entry.batteryTicksV219&&target&&Number.isFinite(player?.x))target=remaining.reduce((nearest,entity)=>
   Math.abs(entity.x-player.x)<Math.abs(nearest.x-player.x)?entity:nearest,target);
  target=touching.find(entity=>entity.windowOpen)||touching[0]||target;
 }
 if(entry.kind==='escort'){
  entities[0]={...entities[0],x:state.cargoX,destinationX:entry.cargoEndX,integrity:state.integrity};
  if(gantry){
   const targetIndex=gantry.stationIndex??0;
   entities=entities.map((entity,index)=>({...entity,active:!entity.completed&&index===targetIndex}));
   target=entities[targetIndex];
  }else{entities=[entities[0]];target=entities[0];}
 }
 if(entry.kind==='extraction'){
  entities=entities.map((entity,index)=>({...entity,active:state.carrying<0&&!state.completed[index],delivered:state.delivered[index],carried:state.carrying===index}));
  entities.push({...entry.depot,active:state.carrying>=0,completed:state.delivered.every(Boolean),progress:state.depotTicks},
   {...entry.exit,active:state.delivered.every(Boolean),completed:state.status==='completed',progress:state.exitTicks});
  target=state.carrying>=0?entities.find(entity=>entity.kind==='depot'):state.delivered.every(Boolean)?entities.find(entity=>entity.kind==='exit'):entities.find(entity=>entity.kind==='supply'&&!entity.completed);
  if(target?.kind==='supply'){
   target=entities.find(entity=>entity.kind==='supply'&&!entity.completed&&nearby(match.fighters?.[0],entity))||target;
  }
 }
 const done=entry.kind==='extraction'?state.delivered.filter(Boolean).length:doneCount(state);
 const failureLabel={'player-ko':'Spécimen neutralisé',time:'Temps écoulé',
  'structure-destroyed':entry.batteryTicksV219?'Batterie épuisée':'Intégrité épuisée'}[state.failureReason]||'Évaluation interrompue';
 return{id:entry.id,title:entry.title,kind:entry.kind,status:state.status,phase:state.status==='active'?(state.carrying>=0?'carrying':'objective'):state.status,
  ...(entry.isolationV212?{isolationV212:true}:{}),
  ...(entry.relayPressureV218?{relayPressureV218:true}:{}),
  ...(relief?{reliefV220:relief}:{}),
  ...(bypass?{bypassV221:bypass}:{}),
  ...(gantry?{gantryV222:gantry}:{}),
  ...(grounding?{groundingV223:grounding}:{}),
  ...(entry.batteryTicksV219?{batteryV219:{...batteryStatus(state,entry),depleted:state.failureReason==='structure-destroyed'}}:{}),
  instruction:entry.instruction,hint:state.status==='failed'?`Évaluation interrompue : ${failureLabel}.`:state.status==='completed'?'Objectifs validés.':
   target?.contested?'Écartez ou neutralisez les contacts dans le périmètre balisé.':
   relief&&!relief.open?'Placez-vous près du poste avant de neutraliser le dernier contact.':
   bypass?.phase==='locked'?'Neutralisez le vigile pour déverrouiller le poste.':
   bypass?.phase==='opening'?'Attendez la fin de l’ouverture du volet.':
   grounding?.phase==='waiting'?'Attirez un contact dans la bande balisée avant la décharge.':
   grounding?.phase==='opening'?'Attendez l’ouverture du sas.':
   target?`${target.label} · maintenez E à proximité${target.windowOpen===false?' pendant la fenêtre verte':''}.`:'Rejoignez le sas.',
  progress:{done,total:entry.objectives.length,label:entry.kind==='extraction'?`${done}/${entry.objectives.length} caissons livrés`:`${done}/${entry.objectives.length} objectifs validés`},
  timeRemaining:Math.max(0,entry.roundSeconds-state.elapsedTicks/120),integrity:state.integrity,carrying:state.carrying,entities,
  target:target?{x:target.x,radius:target.radius,label:target.label,
   ...(entry.kind==='beacon'?{id:target.id,windowOpen:target.windowOpen,windowRemainingTicks:target.windowRemainingTicks}:{}),
   ...(entry.relayPressureV218?{contested:target.contested}:{}),
   ...(['extraction','purge'].includes(entry.kind)||entry.isolationV212||entry.relayPressureV218||relief||bypass||gantry||grounding?{id:target.id,kind:target.kind,progress:target.progress,requiredTicks:target.requiredTicks}:{})}:null};
}
