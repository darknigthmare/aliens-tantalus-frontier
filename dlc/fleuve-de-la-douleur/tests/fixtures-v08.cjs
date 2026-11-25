'use strict';
const fs=require('fs'),path=require('path'),C=require('../src/river-of-pain/core.js');
const dir=path.join(__dirname,'fixtures/v08');fs.mkdirSync(dir,{recursive:true});
function make(name,edit){const s=C.createState('story','hybrid');s.chapter=3;s.character='anne';s.room='road';s.objective=2;s.phase=0;s.collected=['coordinates','tractor'];s.visited=['survey','garage','road'];Object.assign(s.player,{x:460,z:.79,ammo:0,reserve:0});edit?.(s);const sim=new C.Simulation(s);const file=path.join(dir,name+'.json');fs.writeFileSync(file,sim.save());return sim;}
make('parked');make('classic',s=>{s.mode='classic';s.player.z=.7;});
make('station',s=>{s.player.x=900;s.player.z=.38;Object.assign(s.mobility.rover,{x:900,z:.79,hp:38,battery:25});});
make('damaged',s=>{s.player.x=900;s.player.z=.38;Object.assign(s.mobility.rover,{x:900,z:.79,hp:0,battery:0});});
make('driving',s=>{Object.assign(s.mobility.rover,{x:810,z:.79,driver:'anne',speed:180});Object.assign(s.player,{x:810,z:.79});});
make('newt',s=>{s.chapter=6;s.character='newt';s.objective=0;s.player.hp=100;});
make('threat',s=>{s.chapter=7;s.character='brackett';s.objective=0;s.phase=2;Object.assign(s.player,{x:750,z:.79,ammo:30,reserve:60});Object.assign(s.mobility.rover,{x:750,z:.79,driver:'brackett'});s.world.road={spawnPhase:2,enemies:[{id:'rover-threat',x:970,z:.79,hp:72,kind:'adult',state:'patrol',facing:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:970,z:.79}}],acid:[],flares:[]};});
console.log('Written 7 localized fixtures, not full playthroughs.');
