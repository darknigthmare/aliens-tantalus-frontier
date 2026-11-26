/** Active fresh campaigns: both rescues, both projects, all optional tasks. */
import {traverse} from './campaign.mjs';
import {writeFileSync} from 'node:fs';
const rows=[];
for(const seed of [20141007,42,29102026]){
 const r=traverse({active:true,difficulty:'recit',seed,explore:true,rescue:true,projects:true});
 const file=`projects-campaign-${seed}.json`;writeFileSync(new URL('../qa/'+file,import.meta.url),JSON.stringify(r,null,2));
 const installed=Object.values(r.refuges.stations).filter(s=>s.installed).length;
 const row={seed,ok:r.ok,complete:r.ok&&r.rescued.length===2&&installed===2&&r.optional.length===20&&r.visited.length===64,goals:r.goals,rooms:r.visited.length,tasks:r.optional.length,rescued:r.rescued,installed,transitions:r.transitions,failure:r.failure,file};rows.push(row);console.log(JSON.stringify(row));
}
writeFileSync(new URL('../qa/projects-sweep.json',import.meta.url),JSON.stringify(rows,null,2));
