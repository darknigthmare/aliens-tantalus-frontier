 'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),D=require('../src/river-of-pain/data.js');
const {runCampaign}=require('./traversal.cjs'),cases=[];
for(const difficulty of ['story','standard','nightmare'])for(const mode of ['hybrid','classic']){
 try{const {state,...r}=runCampaign(mode,difficulty,true,true,true);assert.equal(r.defense.length,11);assert.equal(state.defense.stats.closed,14);assert.equal(state.defense.stats.opened,14);assert.equal(state.defense.stats.alarms,4);assert.equal(r.visited,42);assert.equal(r.detours.length,6);assert.equal(state.life.stats.opened,12);cases.push(r);console.log('PASS',mode,difficulty,r.defense.length,state.defense.stats);}
 catch(e){cases.push({mode,difficulty,passed:false,error:e.stack});console.error('FAIL',mode,difficulty,e.stack);}
}
fs.writeFileSync(path.join(__dirname,'../docs/TRAVERSAL_DEFENSE_RESULTS.json'),JSON.stringify({version:D.manifest.version,passed:cases.every(c=>c.passed),cases,scope:'New-game pilot walks/interacts with 7 early-access shutters from both controls (14 closures/reopens); hangar shutter is separately fixture-tested after its story authorization, arms the 4 alarms once, then completes the colony tour, 6 detours and main campaign. Early calm tour. Enemy interaction tested separately in explicit fixtures; no teleport/objective/health writes.'},null,2));if(cases.some(c=>!c.passed))process.exitCode=1;
