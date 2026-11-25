'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{traverse}=require('./tactical.cjs');
for(const presentation of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
 test(`${presentation} / ${difficulty} : campagne et six annexes, reprises réelles après chaque objectif`,()=>{
  const r=traverse(presentation,false,difficulty,{defensive:true,fullTour:true,resumeEach:true});
  A.equal(r.passed,true);A.equal(r.objectives,33);A.equal(r.rooms.length,46);A.equal(r.stats.deaths,0);A.equal(r.convoy.aboard,true);A.equal(r.saves.length,33);A.ok(r.stats.dodges>0);A.equal(r.stats.devices,13);
 });
}
