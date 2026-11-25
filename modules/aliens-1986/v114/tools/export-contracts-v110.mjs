import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {ROOMS,LINKS,TEAM,OBJECTIVES,OPERATION_ROOMS,exitsFor,extraction,STOCKS,ALARMS} from '../src/operation-scenes-v109.mjs';
import {VERSION,SCHEMA,CONTRACT} from '../src/operation-v110.mjs';
import {RULES,hatchBox} from '../src/contact-v110.mjs';
import {validateScene,createWorld,canStand,planRoute} from '../src/spatial-core.mjs';
import {RULES as LOGISTICS_RULES} from '../src/logistics-v110.mjs';
import {RULES as ENGINEERING_RULES,STOCK as ENGINEERING_STOCK} from '../src/engineering-v110.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const failures=[];
for(const scene of ROOMS){
  failures.push(...validateScene(scene).map(e=>`${scene.id}: ${e}`));
  for(const prop of scene.props){
    if(prop.supportId){const support=scene.solids.find(b=>b.id===prop.supportId);if(!support)failures.push(`${scene.id}/${prop.id}: support absent`);
      else if(prop.x<support.x||prop.x>support.x+support.w||prop.z<support.z||prop.z>support.z+support.d)failures.push(`${scene.id}/${prop.id}: hors du support`);
    }
  }
  const w=createWorld(scene);
  for(const end of exitsFor(scene.id)){
    if(!canStand(w,end,15)||!canStand(w,end.arrival,15))failures.push(`${end.id}: seuil ou arrivée obstrué`);
  }
}
for(const resource of [...STOCKS,...ALARMS,ENGINEERING_STOCK]){
 const scene=ROOMS.find(r=>r.id===resource.roomId),body=scene?.solids.find(b=>b.id===resource.bodyId),w=scene&&createWorld(scene);
 if(!body)failures.push(resource.id+': aucune emprise physique');
 if(body&&(resource.x<body.x||resource.x>body.x+body.w||resource.z<body.z||resource.z>body.z+body.d))failures.push(resource.id+': sprite hors du support');
 if(w&&!canStand(w,{x:resource.x-60,z:resource.z},15))failures.push(resource.id+': approche de travail obstruée');
 if(resource.emitter&&w&&!canStand(w,resource.emitter,4))failures.push(resource.id+': émetteur sonore obstrué');
}
const inventory={version:VERSION,schema:SCHEMA,contract:CONTRACT,
  scope:'Branche autonome V109 poursuivie. Aucune salle nouvelle : intégrité partagée des huit sas, trois plaques finies et gestes exposés. Aucune fusion Tantalus native.',
  counts:{inspectableRooms:ROOMS.length,connectedOperationRooms:OPERATION_ROOMS.length,newRooms:0,inheritedRooms:8,finiteEngineeringKits:1,finiteEngineeringPlates:3,destructibleLinkHatches:LINKS.length,finiteStockCaches:STOCKS.length,diagnosticAlarms:ALARMS.length,sharedLinkHatches:LINKS.length,derivedThresholdVolumes:LINKS.length*2,reciprocalLinks:LINKS.length,directedEndpoints:LINKS.length*2,localObjectives:OBJECTIVES.length,
    solids:ROOMS.reduce((n,r)=>n+r.solids.length,0),doorVolumes:ROOMS.reduce((n,r)=>n+r.doors.length,0),decorativeProps:ROOMS.reduce((n,r)=>n+r.props.length,0),observationNodes:ROOMS.reduce((n,r)=>n+r.nodes.length,0),circuits:ROOMS.reduce((n,r)=>n+r.circuits.length,0),controls:ROOMS.reduce((n,r)=>n+r.controls.length,0),enemies:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.kind==='enemy').length,0),sentries:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.role==='sentry').length,0)},
  operationRooms:OPERATION_ROOMS,resources:STOCKS,alarms:ALARMS,logisticsRules:LOGISTICS_RULES,engineeringRules:ENGINEERING_RULES,engineeringStock:ENGINEERING_STOCK,objectives:OBJECTIVES,extraction,team:TEAM,links:LINKS,
  contracts:{openingSeconds:.88,playerFireInterval:.16,portalReach:60,groupGatherRadius:165,sourceThresholdThreatRadius:155,localRoomAIOnly:false,inactiveCombatFrozen:false,contacts:RULES,breachRules:'warriors only, physical arrival at closed hatch, remembered trail, open route preferred, .8s telegraph, .7s recovery, fixed 28 impact; no actors spawned',reinforcementRules:'72 protection for one plate; cut opens and consumes no extra plate; no refund; repair closes only if both sides clear',enemyTransfers:'at most once per simulation substep, only after reaching an open threshold',playerKnowledge:'line of sight; tracker quantized motion only; no enemy list on map',transition:'coupure de scène après regroupement physique, arrivée libre vérifiée',nativeProgression:false,nativeAdapterActivated:false,saveImportPaused:true,v106ImportMode:'inspection only',newtArmed:false},
  rooms:ROOMS.map(r=>({...r,connected:OPERATION_ROOMS.includes(r.id),exits:exitsFor(r.id),hatches:exitsFor(r.id).map(e=>({...hatchBox(e),linkId:e.linkId,portalId:e.id}))})),validation:{ok:!failures.length,failures}};
await writeFile(join(root,'report/CONTRATS_LEVEL_DESIGN_V110.json'),JSON.stringify(inventory,null,2)+'\n');
console.log(JSON.stringify({ok:!failures.length,counts:inventory.counts,contract:CONTRACT,failures},null,2));
if(failures.length)process.exitCode=1;
