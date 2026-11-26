import {traverse} from './campaign.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
const out=new URL('../qa/',import.meta.url);mkdirSync(out,{recursive:true});const runs=[];
for(const scanner of ['audible','silent'])for(const seed of [20141007,42,29102026]){
 const r=traverse({active:true,difficulty:'recit',seed,scanner});
 writeFileSync(new URL(`signals-${scanner}-${seed}.json`,out),JSON.stringify(r,null,2));
 const brief={scanner,seed,ok:r.ok,failure:r.failure,goals:r.goals,health:r.health,time:r.time,signals:r.signals,stats:r.stats};runs.push(brief);console.log(JSON.stringify(brief));
}
writeFileSync(new URL('signals-sweep.json',out),JSON.stringify({version:'0.8.0',method:'Pilote interne, Récit, détecteur maintenu levé après acquisition, remplacements Y finis avant les objectifs si charge <25. IA et dégâts actifs. Aucun objectif ni ressource injecté.',runs},null,2));
