'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{traverse}=require('./tactical.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'qa/storage-fixtures'),out=path.join(root,'reports/v080');fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(out,{recursive:true});
const outcomes=[],snapshots=[],seen=new Set();
function capture(g,key){if(seen.has(key)||!g.validate(g.state))return;seen.add(key);const raw=g.exportSave();fs.writeFileSync(path.join(dir,key+'.json'),raw);snapshots.push({key,room:g.room.id,time:g.state.stats.time,objective:g.state.objectiveIndex,sha256:crypto.createHash('sha256').update(raw).digest('hex'),method:'Continuous ordinary-input run. No injected positions, HP, enemy state, flags or resources.'});}
for(const mode of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
 try{const r=traverse(mode,false,difficulty,{fullTour:true,defensive:true,resumeEach:true,fieldFeatures:true,pursuitTour:true,sensorTour:true,lightingTour:true,storageTour:true,featureSnapshot:mode==='HYBRID'&&difficulty==='survival'?capture:null});
 for(let i=0;i<r.saves.length;i++)fs.writeFileSync(path.join(dir,`${mode}-${difficulty}-${String(i+1).padStart(2,'0')}.json`),r.saves[i]);
 outcomes.push({...r,saves:undefined});console.log(mode,difficulty,'FINISHED',r.rooms.length,'rooms',r.objectives,'objectives',r.stats.lockersOpened,'lockers',r.stats.storageTransfers,'transfers');
 }catch(e){outcomes.push({presentation:mode,difficulty,passed:false,reason:e.message});console.error(mode,difficulty,e.message);}
}
const source_sha256=Object.fromEntries(['src/core.js','src/data.js','qa/tactical.cjs','qa/storage-campaign.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(out,'campaign.json'),JSON.stringify({version:'0.8.0',source_sha256,outcomes,snapshots,method:'Six full tours with 50 rooms, 33 objectives, ten physical locker openings and local stock transfers. Legacy field features, pursuit and sensors exercised. Not human playtests.'},null,2));
if(outcomes.some(o=>!o.passed||o.rooms?.length!==50||o.stats?.lockersOpened!==10||o.stats?.storageTransfers<10))process.exitCode=1;
