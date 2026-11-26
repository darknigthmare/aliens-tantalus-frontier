import{traverse}from'./campaign.mjs';import{writeFileSync}from'node:fs';
const results=[];
for(const difficulty of ['recit','survie','cauchemar'])for(const seed of [20141007,42,29102026]){
 const r=traverse({active:true,difficulty,seed});
 const name=`campaign-${difficulty}-${seed}.json`;writeFileSync(new URL('../qa/'+name,import.meta.url),JSON.stringify(r,null,2));
 const row={difficulty,seed,file:name,ok:r.ok,goals:r.goals,health:r.health,time:r.time,damage:r.stats.damage,flameUses:r.stats.flameUses,crafted:r.stats.crafted,alienSteps:r.stats.alienSteps,detections:r.stats.detections,failure:r.failure};results.push(row);console.log(JSON.stringify(row));
}
writeFileSync(new URL('../qa/sweep.json',import.meta.url),JSON.stringify(results,null,2));
