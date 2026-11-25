'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{traverse}=require('./tactical.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'qa/trace-fixtures');fs.mkdirSync(dir,{recursive:true});const outcomes=[],snapshots=[],taken=new Set();
function capture(g,key){if(taken.has(key)||!g.validate(g.state))return;taken.add(key);const raw=g.exportSave();fs.writeFileSync(path.join(dir,key+'.json'),raw);snapshots.push({key,room:g.room.id,time:g.state.stats.time,objectiveIndex:g.state.objectiveIndex,sha256:crypto.createHash('sha256').update(raw).digest('hex'),source:'Continuous input driver. No position/HP/flag injection. Fire discipline, walking, regrouping and door interaction are ordinary game commands.'});}
for(const presentation of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
 try{const r=traverse(presentation,false,difficulty,{fullTour:true,defensive:true,resumeEach:true,fieldFeatures:true,pursuitTour:true,featureSnapshot:presentation==='HYBRID'&&difficulty==='survival'?capture:null});
  for(let i=0;i<r.saves.length;i++)fs.writeFileSync(path.join(dir,`${presentation}-${difficulty}-${String(i+1).padStart(2,'0')}.json`),r.saves[i]);outcomes.push({...r,saves:undefined});console.log(presentation,difficulty,'completed',r.objectives,'rooms',r.rooms.length,'pursuits',r.stats.pursuitArrivals);
 }catch(e){outcomes.push({presentation,difficulty,passed:false,reason:e.message});console.error(presentation,difficulty,e.message);}
}
const source_sha256=Object.fromEntries(['src/core.js','src/data.js','qa/tactical.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(root,'reports/trace-campaign.json'),JSON.stringify({version:'0.5.0',source_sha256,method:'6 continuous runs: all objectives, optional tour, old field features and a real pursued retreat; 33 export/imports each. Not human playtests.',outcomes,snapshots},null,2));
if(outcomes.some(o=>!o.passed||o.stats.pursuitArrivals<1))process.exitCode=1;
