import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {ROOMS,LINKS,TEAM,OBJECTIVES,OPERATION_ROOMS,exitsFor,extraction} from '../src/operation-scenes-v107.mjs';
import {VERSION,SCHEMA,CONTRACT} from '../src/operation-v108.mjs';
import {RULES,hatchBox} from '../src/contact-v108.mjs';
import {validateScene,createWorld,canStand,planRoute} from '../src/spatial-core.mjs';
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
const inventory={version:VERSION,schema:SCHEMA,contract:CONTRACT,
  scope:'Branche autonome issue de V106 Passages RC1, pas les 64 salles natives Tantalus.',
  counts:{inspectableRooms:ROOMS.length,connectedOperationRooms:OPERATION_ROOMS.length,newRooms:0,inheritedRooms:6,sharedLinkHatches:LINKS.length,derivedThresholdVolumes:LINKS.length*2,reciprocalLinks:LINKS.length,directedEndpoints:LINKS.length*2,localObjectives:OBJECTIVES.length,
    solids:ROOMS.reduce((n,r)=>n+r.solids.length,0),doorVolumes:ROOMS.reduce((n,r)=>n+r.doors.length,0),decorativeProps:ROOMS.reduce((n,r)=>n+r.props.length,0),observationNodes:ROOMS.reduce((n,r)=>n+r.nodes.length,0),circuits:ROOMS.reduce((n,r)=>n+r.circuits.length,0),controls:ROOMS.reduce((n,r)=>n+r.controls.length,0),enemies:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.kind==='enemy').length,0),sentries:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.role==='sentry').length,0)},
  operationRooms:OPERATION_ROOMS,objectives:OBJECTIVES,extraction,team:TEAM,links:LINKS,
  contracts:{openingSeconds:.88,playerFireInterval:.16,portalReach:60,groupGatherRadius:165,sourceThresholdThreatRadius:155,localRoomAIOnly:false,inactiveCombatFrozen:false,contacts:RULES,enemyTransfers:'at most once per simulation substep, only after reaching an open threshold',playerKnowledge:'line of sight; tracker quantized motion only; no enemy list on map',transition:'coupure de scène après regroupement physique, arrivée libre vérifiée',nativeProgression:false,nativeAdapterActivated:false,saveImportPaused:true,v106ImportMode:'inspection only',newtArmed:false},
  rooms:ROOMS.map(r=>({...r,connected:OPERATION_ROOMS.includes(r.id),exits:exitsFor(r.id),hatches:exitsFor(r.id).map(e=>({...hatchBox(e),linkId:e.linkId,portalId:e.id}))})),validation:{ok:!failures.length,failures}};
await writeFile(join(root,'report/CONTRATS_LEVEL_DESIGN_V108.json'),JSON.stringify(inventory,null,2)+'\n');
console.log(JSON.stringify({ok:!failures.length,counts:inventory.counts,contract:CONTRACT,failures},null,2));
if(failures.length)process.exitCode=1;
