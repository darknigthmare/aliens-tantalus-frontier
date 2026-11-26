'use strict';const fs=require('node:fs');const {run}=require('./playthrough.cjs');
const profiles=[
 {name:'base-explorer',difficulty:'explorer',pace:'run'},
 {name:'base-standard',difficulty:'standard',pace:'run'},
 {name:'base-survival',difficulty:'survival',pace:'walk'},
 {name:'base-discretion',difficulty:'standard',pace:'crouch'},
 {name:'field',fieldwork:true},{name:'network',fieldwork:true,networkwork:true},
 {name:'maintenance',fieldwork:true,networkwork:true,maintenancework:true},
 ...['explorer','standard'].map(difficulty=>({name:'archaeology-'+difficulty,difficulty,fieldwork:true,networkwork:true,maintenancework:true,archaeologywork:true})),
 ...['explorer','standard'].map(difficulty=>({name:'atmosphere-'+difficulty,difficulty,fieldwork:true,networkwork:true,maintenancework:true,archaeologywork:true,atmospherework:true})),
 ...['explorer','standard'].map(difficulty=>({name:'freight-'+difficulty,difficulty,fieldwork:true,networkwork:true,maintenancework:true,archaeologywork:true,atmospherework:true,freightwork:true})),
 ...['explorer','standard'].map(difficulty=>({name:'fidelity-'+difficulty,difficulty,fieldwork:true,networkwork:true,maintenancework:true,archaeologywork:true,atmospherework:true,freightwork:true,fidelitywork:true}))
];
const out=[];for(const pr of profiles){const r=run({difficulty:'standard',pace:'run',...pr,name:'v10-'+pr.name});out.push({...r,final:undefined});console.log(JSON.stringify({name:r.name,ok:r.ok,rooms:r.visited,actions:r.actions,supplies:r.collected,simulationSeconds:r.simulationSeconds,controls:r.controls,failure:r.failure}));}const dir=process.env.COVENANT_QA_OUTPUT||require('node:path').join(require('node:os').tmpdir(),'covenant-v011-qa');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(require('node:path').join(dir,'release-playthroughs.json'),JSON.stringify(out,null,2));process.exitCode=out.every(x=>x.ok)?0:1;
