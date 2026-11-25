'use strict';
/* Isolated encounter: import an earned equipped save, enter s30 directly for the
   test, then use movement and controls. No position, HP, ammunition or enemy edit.
   The room entry is a prepared scenario, NOT a whole-campaign path. */
const fs=require('node:fs'),path=require('node:path'),C=require('../src/core.js');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'qa/rearguard-rerun-fixtures');fs.mkdirSync(dir,{recursive:true});
const g=new C.Game();g.importSave(fs.readFileSync(path.join(root,'qa/fixtures-v030/played-HYBRID-07.json'),'utf8'));g.enter('s30');g.toggleCompanion();
const s=g.room.shutters[0],n=g.shutterControls(s)[0],log=[],snapshots=[];
function save(key){fs.writeFileSync(path.join(dir,key+'.json'),g.exportSave());snapshots.push({key,room:g.state.room,objectiveIndex:g.state.objectiveIndex,time:g.state.stats.time,source:'prepared s30 entry from equipped save, all subsequent movement and damage simulated'});}
function tick(input={}){g.step(.05,input);g.drainEvents();if(!g.validate(g.state))throw Error('Invalid state');if(g.state.failed)throw Error(g.state.failed);}
for(let i=0;i<250&&g.distance(g.p,n)>20;i++)tick({right:true});
for(let i=0;i<55;i++)tick({shutter:true});
if(g.rs.shutters[s.id].status!=='closed')throw Error('Gate did not close');save('scenario-closed');
let strike=false,partial=false;
for(let i=0;i<700&&g.rs.shutters[s.id].status==='closed';i++){
 tick({focus:true});
 const e=g.rs.enemies.find(e=>e.breach&&e.breach.remaining<.55);
 if(e&&!strike){save('scenario-impact');strike=true;}
 if(g.rs.shutters[s.id].integrity<100&&!partial){save('scenario-damaged');partial=true;}
 if(i%10===0)log.push({time:g.state.stats.time,gateIntegrity:g.rs.shutters[s.id].integrity,hp:g.p.hp,positions:g.rs.enemies.map(e=>({x:e.x,z:e.z,mode:e.mode,breach:e.breach}))});
}
if(g.rs.shutters[s.id].status!=='broken')throw Error('Gate not breached');save('scenario-broken');
const source_sha256=Object.fromEntries(['src/core.js','src/data.js','qa/tactical.cjs'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const result={version:require('../data/campaign.json').meta.version,source_sha256,passed:strike&&partial&&g.rs.shutters[s.id].status==='broken',provenance:'Isolated scenario: direct s30 entry only, no position/health/progress edits after earned save. Not a continuous full run.',gate:g.rs.shutters[s.id],playerHP:g.p.hp,stats:g.state.stats,log,snapshots};fs.writeFileSync(path.join(root,'reports/breach-scenario.json'),JSON.stringify(result,null,2));console.log('BREACH SCENARIO',result.passed,'HP',g.p.hp,'status',result.gate.status);
