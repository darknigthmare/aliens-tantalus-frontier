'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),D=require('../src/river-of-pain/data.js');
const {runCampaign}=require('./traversal.cjs'),cases=[];
for(const difficulty of ['story','standard','nightmare'])for(const mode of ['hybrid','classic']){
 try{const {state,...r}=runCampaign(mode,difficulty,true,true);assert.equal(Object.keys(state.life.contacts).length,12);assert.equal(Object.values(state.life.contacts).reduce((n,v)=>n+v.topics.length,0),24);assert.equal(state.life.stats.opened,12);assert.equal(state.life.stats.crafted,3);assert.equal(state.life.stats.deployed,3);assert.equal(r.visited,42);assert.equal(r.detours.length,6);cases.push(r);console.log('PASS',mode,difficulty,r.life);}
 catch(e){cases.push({mode,difficulty,passed:false,error:e.message});console.error('FAIL',mode,difficulty,e.stack);}
}
fs.writeFileSync(path.join(__dirname,'../docs/TRAVERSAL_LIFE_RESULTS.json'),JSON.stringify({version:D.manifest.version,passed:cases.every(c=>c.passed),cases,scope:'Pilot starts a new campaign, walks/interacts, meets 12 residents with 24 topics, opens 12 finite containers, builds and deploys 3 decoys at the 3 benches, completes 6 detours and the main campaign. Early civilian tour; no enemy attraction claim from this early tour.'},null,2));if(cases.some(c=>!c.passed))process.exitCode=1;
