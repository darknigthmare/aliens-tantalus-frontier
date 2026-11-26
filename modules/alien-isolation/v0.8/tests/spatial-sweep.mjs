import {traverse} from './campaign.mjs';
import {writeFileSync} from 'node:fs';
const runs=[];
for(const config of [{active:false,classic:false,seed:20141007},{active:false,classic:true,seed:20141007},... [20141007,42,29102026].map(seed=>({active:true,seed}))]){
 const r=traverse({...config,difficulty:'recit',explore:true,rescue:true,projects:true,spatialExplore:true});
 const name=`spatial-campaign-${config.active?'live':'geometry'}-${config.classic?'classic-':''}${config.seed}.json`;
 writeFileSync(new URL('../qa/'+name,import.meta.url),JSON.stringify(r,null,2));
 const row={file:name,version:r.version,active:r.active,classic:r.classic,seed:r.seed,ok:r.ok,goals:r.goals,tasks:r.optional.length,rooms:r.visited.length,transitions:r.transitions,rescued:r.rescued,refuges:r.refuges,failure:r.failure};runs.push(row);console.log(JSON.stringify(row));
}
writeFileSync(new URL('../qa/spatial-sweep.json',import.meta.url),JSON.stringify(runs,null,2));
