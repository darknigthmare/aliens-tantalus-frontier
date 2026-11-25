// Browser fixtures prepared in the model, not in the running browser session.
'use strict';
const fs=require('node:fs'),path=require('node:path'),C=require('../src/river-of-pain/core.js'),D=require('../src/river-of-pain/data.js'),V=require('../src/river-of-pain/ducts.js');
function base(room,chapter=0,x=300){const s=C.createState('story','hybrid'),c=D.chapters[chapter],ch=D.characters[c.character];Object.assign(s,{room,visited:[room],chapter,character:c.character,phase:c.phase});Object.assign(s.player,{x,z:.7,ammo:ch.clip,reserve:ch.reserve,medkits:ch.medkits,flares:ch.flares});for(const r of D.rooms)s.world[r.id]={enemies:[],acid:[],flares:[],spawnPhase:3};return new C.Simulation(s);}
const out=path.join(__dirname,'fixtures/v07');fs.mkdirSync(out,{recursive:true});
function save(name,sim){const text=sim.save();C.parseSave(text);fs.writeFileSync(path.join(out,name+'.json'),text);}
const d=V.mouths.get('duct-service');save('open-grille',base(d.room,0,d.x));
let sim=base(d.room,0,d.x);sim.s.ducts.mouths[d.id]={state:'closed',hp:66};save('damaged-grille',sim);
sim=base(d.room,14,d.x);save('newt-listening',sim);
sim=base(d.room,7,d.x-850);const e={id:'v07-observed-specimen',x:d.x+5,z:.7,hp:46,kind:'adult',state:'patrol',facing:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:d.x+5,z:.7},memory:{x:d.x+5,z:.7,ttl:0}};sim.ensureRoom().enemies.push(e);save('entry-observation',sim);
for(let i=0;i<30;i++)sim.update(.05,{});if(sim.s.ducts.transits.length!==1)throw Error('Fixture must transfer one existing specimen through real AI before export');
const dest=V.other(d.id);sim.s.room=dest.room;sim.s.player.x=dest.x-140;sim.s.player.z=.7;sim.ensureRoom();save('incoming-near',sim);
sim.s.player.x=dest.x-500;sim.s.systems.tracker=true;sim.s.ducts.transits[0].remaining=.2;save('warning-tracker',sim);
sim.s.ducts.mouths[dest.id].state='closed';sim.s.ducts.transits[0].remaining=0;save('pressure-closed',sim);
sim=base('briefing',0,700);sim.s.flags.welder=true;save('regression-briefing',sim);
fs.writeFileSync(path.join(out,'README.txt'),'Localized test states built by fixtures-v07.cjs, not manual progression. Empty prepared populations isolate one real enemy transferred by update; room and player locations are set only while building fixture. Browser actions use ordinary import and controls. Narrative chapter/location associations are not claimed as canonical.\n');
