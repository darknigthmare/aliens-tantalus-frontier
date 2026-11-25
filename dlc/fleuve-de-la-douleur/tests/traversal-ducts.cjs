'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),D=require('../src/river-of-pain/data.js'),{runCampaign}=require('./traversal.cjs');
const cases=[];
for(const mode of ['hybrid','classic'])for(const difficulty of ['story','standard','nightmare']){
 try{const {state,...r}=runCampaign(mode,difficulty,true,true,true,true);assert.equal(r.ducts.length,10);assert.equal(state.ducts.stats.closed,10);assert.equal(state.ducts.stats.opened,10);assert.equal(state.ducts.stats.listened,10);assert.equal(r.visited,42);assert.equal(state.stats.escorts,2);assert.equal(state.stats.chapters.length,16);cases.push({...r,ductStats:state.ducts.stats});console.log('PASS',mode,difficulty,state.ducts.stats);}
 catch(e){cases.push({mode,difficulty,passed:false,error:e.stack});console.error('FAIL',mode,difficulty,e.stack);}
}
const out={version:D.manifest.version,passed:cases.every(c=>c.passed),cases,scope:'New-game pilot physically walks to all 10 grilles early, closes/reopens/listens through gameplay commands, then completes all main objectives, two escorts, six detours and inherited life/defense tours. Enemy vent entries, emergence and pressure are localized fixtures, not claimed in this calm tour.'};
fs.writeFileSync(require('node:path').join(__dirname,'../docs/TRAVERSAL_DUCT_RESULTS.json'),JSON.stringify(out,null,2));if(!out.passed)process.exitCode=1;
