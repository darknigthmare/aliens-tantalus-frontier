'use strict';
const fs=require('node:fs'),path=require('node:path'),{traverse}=require('./tactical.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'qa/rearguard-rerun-fixtures');fs.mkdirSync(dir,{recursive:true});
const outcomes=[],snapshots=[],taken=new Set();
function capture(g,key){if(taken.has(key)||!g.validate(g.state))return;taken.add(key);const raw=g.exportSave();fs.writeFileSync(path.join(dir,key+'.json'),raw);snapshots.push({key,room:g.state.room,time:g.state.stats.time,objectiveIndex:g.state.objectiveIndex,source:'continuous input driver; no position, HP or objective injection'});}
for(const presentation of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
 try{const r=traverse(presentation,false,difficulty,{fullTour:true,defensive:true,resumeEach:true,fieldFeatures:true,featureSnapshot:presentation==='HYBRID'&&difficulty==='survival'?capture:null});
  const label=presentation+'-'+difficulty;
  for(let i=0;i<r.saves.length;i++)fs.writeFileSync(path.join(dir,label+'-'+String(i+1).padStart(2,'0')+'.json'),r.saves[i]);
  outcomes.push({...r,saves:undefined,scope:'46 rooms, all 8 readings and all 8 shutters, resume after each objective'});console.log(label,r.passed,r.stats.shutterCycles+' cycles',r.stats.readings+' readings',r.stats.rallyOrders+' orders',r.stats.damage+' damage');
 }catch(e){outcomes.push({presentation,difficulty,passed:false,reason:e.message});console.error(presentation,difficulty,e.message);}
}
const source_sha256=Object.fromEntries(['src/core.js','src/data.js','qa/tactical.cjs'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(root,'reports/rearguard-campaign.json'),JSON.stringify({version:require('../data/campaign.json').meta.version,source_sha256,scope:'Automated, native simulation inputs with path planner, no injection. Not a complete human playtest.',outcomes,snapshots},null,2));
if(outcomes.some(o=>!o.passed))process.exitCode=1;
