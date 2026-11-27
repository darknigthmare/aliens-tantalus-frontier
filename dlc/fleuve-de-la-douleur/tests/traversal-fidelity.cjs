'use strict';
const fs=require('node:fs'),path=require('node:path'),{runCampaign}=require('./traversal.cjs');const cases=[];
for(const difficulty of ['story','standard','nightmare'])for(const mode of ['hybrid','classic']){
 try{const r=runCampaign(mode,difficulty,true,true,true,true,true,true);const {state,...report}=r;
  if(r.visited!==47||r.fidelity.length!==2||r.stats.escorts!==2)throw Error('Couverture incomplète '+r.visited);
  cases.push(report);console.log(mode,difficulty,'PASS',r.visited,r.fidelity.map(c=>c.stage));}
 catch(e){cases.push({mode,difficulty,passed:false,error:e.stack});console.error(mode,difficulty,'FAIL',e.stack);}
}
fs.writeFileSync(path.join(__dirname,'../docs/TRAVERSAL_FIDELITY_RESULTS.json'),JSON.stringify(cases,null,2));if(cases.some(c=>!c.passed))process.exitCode=1;
