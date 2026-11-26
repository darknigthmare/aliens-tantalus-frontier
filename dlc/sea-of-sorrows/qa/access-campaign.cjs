'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{traverse}=require('./tactical.cjs'),{CueBus}=require('../src/soundscape.js');
const root=path.resolve(__dirname,'..'),out=path.join(root,'reports/v090'),dir=path.join(root,'qa/access-fixtures');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(dir,{recursive:true});
const outcomes=[],snapshots=[],seen=new Set();
function capture(g,key){if(seen.has(key)||!g.validate(g.state))return;seen.add(key);const raw=g.exportSave();fs.writeFileSync(path.join(dir,key+'.json'),raw);snapshots.push({key,room:g.room.id,time:g.state.stats.time,objective:g.state.objectiveIndex,sha256:crypto.createHash('sha256').update(raw).digest('hex'),method:'Ordinary-input continuous traversal. No positions, HP, resources or objectives injected.'});}
for(const mode of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
 const bus=new CueBus(),counts={};let ticks=0,invariance=0;
 try{
  const r=traverse(mode,false,difficulty,{fullTour:true,defensive:true,resumeEach:true,fieldFeatures:true,pursuitTour:true,sensorTour:true,lightingTour:true,storageTour:true,
   featureSnapshot:mode==='HYBRID'&&difficulty==='survival'?capture:null,
   observeEvents(g,events){for(const e of events)bus.event(e,g);},
   observe(g){const before=++ticks%250===0?g.exportSave():null;bus.update(g);for(const c of bus.drain())counts[c.kind]=(counts[c.kind]||0)+1;bus.captionsAt(g.state.stats.time);if(before){assert.equal(g.exportSave(),before);invariance++;}}
  });
  for(let n=0;n<r.saves.length;n++)fs.writeFileSync(path.join(dir,`${mode}-${difficulty}-${String(n+1).padStart(2,'0')}.json`),r.saves[n]);
  outcomes.push({...r,saves:undefined,cueCounts:counts,observationsWithoutMutation:invariance});console.log(mode,difficulty,'FINISHED',r.objectives,'objectives',r.rooms.length,'rooms',JSON.stringify(counts));
 }catch(e){outcomes.push({presentation:mode,difficulty,passed:false,reason:e.message});console.error(mode,difficulty,e.stack);}
}
const files=['src/core.js','src/data.js','src/support.js','src/soundscape.js','qa/tactical.cjs','qa/access-campaign.cjs'];const source_sha256=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(out,'campaign.json'),JSON.stringify({version:'0.9.0',source_sha256,outcomes,snapshots,method:'Six full tours with read-only cue observation, 50 rooms / 33 objectives, ten lockers, legacy mechanics and 198 round-trip saves. Navigation uses engine path planner. Not human playtests.'},null,2));
if(outcomes.some(o=>!o.passed||o.rooms?.length!==50||o.objectives!==33))process.exitCode=1;
