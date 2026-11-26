import {writeFile} from 'node:fs/promises';
import {ROOMS,LINKS,OPERATION_ROOMS,exitsFor,auditArchitecture,TEAM,OBJECTIVES} from '../src/operation-scenes-v114.mjs';
import * as O from '../src/operation-v114.mjs';
import * as S from '../src/spatial-core-v108.mjs';
import {LOCATIONS,CHARACTERS,EQUIPMENT,CONTINUITY,SOURCES} from '../src/fidelity-v114.mjs';
import {WEAPONS,CACHES} from '../src/arsenal-v114.mjs';
import {hatchBox} from '../src/contact-v114.mjs';
const architecture=auditArchitecture(),failures=[...architecture.errors],resources=[];
for(const scene of ROOMS){failures.push(...S.validateScene(scene).map(x=>scene.id+': '+x));
 for(const prop of scene.props){if(!prop.supportId)continue;const body=scene.solids.find(b=>b.id===prop.supportId);if(!body)failures.push(scene.id+'/'+prop.id+': support absent');else if(prop.x<body.x||prop.x>body.x+body.w||prop.z<body.z||prop.z>body.z+body.d)failures.push(scene.id+'/'+prop.id+': hors emprise');}
 const session=O.createSession({mode:'inspection',roomId:scene.id});if(!O.importSession(O.exportSession(session)).ok)failures.push(scene.id+': import état neuf');
 // Hatch threshold is blocked when closed, but every explicit arrival must always be legal.
 for(const end of exitsFor(scene.id)){if(!S.canStand(session.worlds[scene.id],end.arrival,15))failures.push(end.id+': arrivée non libre');}
}
for(const c of CACHES){const r=ROOMS.find(r=>r.id===c.roomId),body=r.solids.find(b=>b.id===c.bodyId),w=O.createSession({mode:'inspection',roomId:r.id}).worlds[r.id];let approach=null;
 for(let n=0;n<64&&!approach;n++){const angle=n*Math.PI*2/64,point={x:c.x+Math.cos(angle)*(c.reach-5),z:c.z+Math.sin(angle)*(c.reach-5)};if(S.canStand(w,point,15)&&!S.activeSolids(w).some(b=>b.id!==c.bodyId&&S.segmentBox(point,c,b,0)!==null))approach=point;}
 const valid=!!body&&c.x>=body.x&&c.x<=body.x+body.w&&c.z>=body.z&&c.z<=body.z+body.d&&!!approach;resources.push({id:c.id,bodyId:c.bodyId,approach,valid});if(!valid)failures.push(c.id+': support/approche');}
const counts={inspectableRooms:ROOMS.length,operationRooms:OPERATION_ROOMS.length,addedInspections:15,additionalOperationRooms:2,reciprocalLinks:LINKS.length,directedFaces:LINKS.length*2,operationLinks:LINKS.filter(l=>!l.inspectionOnly).length,internalDoors:architecture.doors.length,vestibules:architecture.vestibules.length,fixedSolids:ROOMS.reduce((n,r)=>n+r.solids.length,0),props:ROOMS.reduce((n,r)=>n+r.props.length,0),enemies:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.kind==='enemy').length,0),sentries:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.role==='sentry').length,0),namedNPCs:ROOMS.reduce((n,r)=>n+r.actors.filter(a=>a.id.startsWith('npc-')).length,0),characterProfiles:CHARACTERS.length,weaponProfiles:Object.keys(WEAPONS).length,equipmentReferences:EQUIPMENT.length,locationReferences:LOCATIONS.length,mappedLocationReferences:LOCATIONS.filter(l=>l.rooms.length).length,absentLocationReferences:LOCATIONS.filter(l=>!l.rooms.length).length,objectives:OBJECTIVES.length};
const data={version:O.VERSION,schema:O.SCHEMA,contract:O.CONTRACT,scope:'Branche autonome V113 poursuivie. Plans interprétés ; inspections et cinq objectifs locaux séparés ; aucune fusion native ni prétention 1:1.',counts,architecture,resources,locations:LOCATIONS,characters:CHARACTERS,equipment:EQUIPMENT,continuity:CONTINUITY,sources:SOURCES,weapons:WEAPONS,caches:CACHES,operationRooms:OPERATION_ROOMS,links:LINKS,objectives:OBJECTIVES,team:TEAM,rooms:ROOMS.map(r=>({...r,connectedOperation:OPERATION_ROOMS.includes(r.id),exits:exitsFor(r.id),hatches:exitsFor(r.id).map(e=>({...hatchBox(e),exitId:e.id,linkId:e.linkId}))})),validation:{ok:!failures.length,failures}};
await writeFile(new URL('../report/CONTRATS_LEVEL_DESIGN_V114.json',import.meta.url),JSON.stringify(data,null,2));console.log(JSON.stringify({counts,validation:data.validation},null,2));if(failures.length)process.exitCode=1;
