/** Independent exploration/escort samples. Deaths remain results, not hidden test successes. */
import {traverse} from './campaign.mjs';
import {writeFileSync, mkdirSync} from 'node:fs';
const root=new URL('../qa/',import.meta.url);mkdirSync(root,{recursive:true});const rows=[];
for(const seed of [20141007,42,29102026]){
 const r=traverse({active:true,difficulty:'recit',seed,explore:true,rescue:true});
 const file=`rescue-campaign-${seed}.json`;writeFileSync(new URL(file,root),JSON.stringify(r,null,2));
 rows.push({seed,ok:r.ok,complete:r.ok&&r.rescued.length===2&&r.optional.length===20&&r.visited.length===64,goals:r.goals,rooms:r.visited.length,optional:r.optional.length,rescued:r.rescued,failure:r.failure,file});
 console.log(JSON.stringify(rows.at(-1)));
}
writeFileSync(new URL('rescue-sweep.json',root),JSON.stringify(rows,null,2));
