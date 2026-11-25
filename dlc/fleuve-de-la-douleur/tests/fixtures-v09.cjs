
const fs=require('node:fs'),path=require('node:path'),C=require('../src/river-of-pain/core.js'),D=require('../src/river-of-pain/data.js');
const dir=path.join(__dirname,'fixtures/v09');fs.mkdirSync(dir,{recursive:true});
function scene(name,room,x,z=.7,ch=0,edit=null){
 let s=C.createState('story');const chapter=D.chapters[ch];s.chapter=ch;s.objective=0;s.character=chapter.character;s.phase=chapter.phase;s.room=room;s.visited=[room];
 const p=D.characters[s.character];Object.assign(s.player,{x,z,ammo:p.clip,reserve:p.reserve,medkits:p.medkits,flares:p.flares});
 const sim=new C.Simulation(s);if(edit)edit(sim);C.parseSave(sim.save());fs.writeFileSync(path.join(dir,name+'.json'),sim.save());
}
scene('armory','armory',1010,.28);
scene('medical','med',1900,.76,4);
scene('family','jorden',330,.81,1);
scene('newt','vent_hab',460,.7,6);
scene('greenhouse','greenhouse',1400,.81,0);
scene('rope','pilot_chamber',2830,.69,3);
scene('pilot','pilot_chamber',1500,.78,3);
scene('vault','egg_vault',1470,.81,3);
scene('road','road',1120,.7,3);
scene('stairs','science',1780,.7,0);
scene('colony','ops',970,.80,0);
scene('flame','armory',780,.7,0,sim=>{Object.assign(sim.s.armory.kits.brackett,{issued:true,selected:'flame',fuel:60,grenades:3});sim.s.armory.stats.issued=1;sim.ensureRoom().enemies=[{id:'fixture-adult',x:1090,z:.7,kind:'adult',hp:72,state:'patrol',facing:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:1090,z:.7}}];});


scene('grenade','armory',700,.7,0,sim=>{Object.assign(sim.s.armory.kits.brackett,{issued:true,selected:'pulse',fuel:53,grenades:3});sim.s.armory.stats.issued=1;sim.ensureRoom().enemies=[{id:'fixture-grenade-adult',x:1090,z:.7,kind:'adult',hp:72,state:'patrol',facing:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:1090,z:.7}}];});
scene('armory-door','briefing',1230,.7,0);
scene('greenhouse-door','wash',1030,.81,0);
scene('medical-unit','med',2280,.32,4);
scene('anne-arsenal','armory',1080,.28,1);

console.log('fixtures',fs.readdirSync(dir).length);
