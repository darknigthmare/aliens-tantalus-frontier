import{traverse}from'./campaign.mjs';import{writeFileSync,mkdirSync}from'node:fs';
const root=new URL('../qa/',import.meta.url);mkdirSync(root,{recursive:true});const summary=[];
for(const seed of [20141007,42,29102026]){const r=traverse({active:true,difficulty:'recit',explore:true,seed});const name=`exploration-recit-${seed}.json`;writeFileSync(new URL(name,root),JSON.stringify(r,null,2));summary.push({seed,ok:r.ok,goals:r.goals,optional:r.optional.length,rooms:r.visited.length,transitions:r.transitions,failure:r.failure,file:name});console.log(summary.at(-1));if(seed===42)writeFileSync(new URL('campaign-active-explore.json',root),JSON.stringify(r,null,2));}
writeFileSync(new URL('exploration-sweep.json',root),JSON.stringify(summary,null,2));
// Exploratory balancing sample: deaths are data, not a unit-test pass/fail assertion.
