'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../src/river-of-pain/data.js'),C=require('../src/river-of-pain/core.js'),A=require('../src/river-of-pain/armory.js');
const cases=[];const clone=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){try{fn();cases.push({name,passed:true});}catch(e){cases.push({name,passed:false,error:e.stack});console.error('FAIL',name,e.message);}}
function ticks(sim,t,input={}){for(let i=0;i<Math.ceil(t*60);i++)sim.update(1/60,input);}
function scene(room='armory',mode='hybrid',chapter=0,x=1080,z=.28){
 const s=C.createState('story',mode),ch=D.chapters[chapter],p=D.characters[ch.character];
 Object.assign(s,{room,chapter,character:ch.character,phase:ch.phase,visited:[room]});
 Object.assign(s.player,{x,z:mode==='classic'?.7:z,ammo:p.clip,reserve:p.reserve,medkits:p.medkits,flares:p.flares});
 s.flags.scienceClearance=true;
 for(const j of D.jobs)s.exploration.jobs[j.id]=3;
 return new C.Simulation(s);
}
function issue(sim){assert.equal(sim.useArmory('issue'),true);ticks(sim,2.1);assert.equal(A.kit(sim.s).issued,true);}
const enemy=(x,z=.7,hp=72,id='test-adult')=>({id,x,z,hp,kind:'adult',state:'patrol',facing:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x,z},memory:{x,z,ttl:0}});
test('Actual counts, no promise of complete novel coverage',()=>{
 assert.equal(D.rooms.length,47);assert.equal(D.manifest.counts.links,64);assert.equal(D.manifest.counts.architecturalEndpoints,128);
 assert.equal(D.fidelity.completeNovelConsulted,false);assert.equal(D.appearances.komiskey.hairstyle,'curls');
 assert.equal(D.appearances.anne.hairstyle,'curls');assert.notEqual(D.appearances.luisa.hairstyle,D.appearances.newt.hairstyle);
 assert.equal(D.fidelity.coverage.length,93);assert.ok(D.fidelity.coverage.some(v=>v.id==='orbital_medical'&&v.status==='manquant'));
});
test('All room IDs, map positions and global object IDs unique',()=>{
 for(const list of [D.rooms.map(r=>r.id),D.rooms.map(r=>r.map.join(',')),D.rooms.flatMap(r=>r.objects.map(o=>o.id))])assert.equal(new Set(list).size,list.length);
});
test('One fossil only in pilot chamber; eggs are not repeated at the threshold',()=>{
 const all=D.rooms.flatMap(r=>r.props.filter(p=>p.kind==='pilot-seat').map(p=>r.id));assert.deepEqual(all,['pilot_chamber']);
 assert.equal(C.roomDef('derelict').props.some(p=>['egg','fossil','pilot-seat','sealed-egg'].includes(p.kind)),false);
 assert.equal(C.roomDef('egg_vault').props.filter(p=>p.kind==='sealed-egg').length,8);
});
test('Protagonist and escort identity bindings',()=>{
 const objects=D.rooms.flatMap(r=>r.objects);
 for(const [id,actor] of Object.entries({family:'russ',welcome:'paris',luisa:'luisa',civilian:'civilian',stretcher:'komiskey',newt_escape:'newt'}))
  assert.equal(objects.find(o=>o.id===id).actorId,actor);
 assert.equal(objects.find(o=>o.id==='hidalgo').kind,'terminal');
});
test('Greenhouse presence is sourced; its exact plan is authored',()=>{
 const r=C.roomDef('greenhouse');assert.equal(r.architecture.style,'greenhouse');assert.equal(r.portals.length,2);
 assert.equal(r.fidelity.plan,'original_non_mesure');assert.ok(D.fidelity.coverage.find(c=>c.id===r.id).sources.includes('R1'));
});
test('Named source contacts distinct from original local routines',()=>{
 assert.equal(D.canonicalContacts.length,5);assert.equal(D.life.residents.length,12);
 for(const c of D.canonicalContacts){assert.ok(D.appearances[c.actorId]);assert.equal(c.phaseMax,1);assert.ok(c.note.includes('2173'));assert.ok(c.note.includes('2179'));}
});
for(const mode of ['hybrid','classic'])for(const r of D.rooms)for(const p of r.portals){
 test('Physical endpoint via E · '+mode+' · '+p.id,()=>{
  const back=C.roomDef(p.to).portals.find(b=>b.to===r.id);assert.ok(back);assert.equal(back.childOnly,p.childOnly);assert.equal(back.requires,p.requires);
  const a=p.architecture;assert.equal(a.reciprocal,back.id);assert.equal(a.originFloor,r.floor);assert.equal(a.destinationFloor,C.roomDef(p.to).floor);
  assert.equal(a.approachX,p.x);assert.equal(a.approachZ,p.z);
  assert.ok(a.type==='track'?a.mount==='terrain':a.support==='attached_structure');
  if(a.type==='stairs'||a.type==='lift')assert.notEqual(a.originFloor,a.destinationFloor);
  const sim=scene(r.id,mode,p.childOnly||r.kind==='vent'?6:0,p.x,p.z);
  assert.equal(C.obstacleAt(sim.collisionRoom,sim.s.player.x,sim.s.player.z,14),false);
  sim.interact();ticks(sim,7);assert.equal(sim.s.room,p.to);
  const dest=C.roomDef(p.to),z=mode==='classic'?.7:back.z;
  let x=C.clamp(back.x+(back.x<dest.width/2?75:-75),45,dest.width-45);
  if(C.obstacleAt(dest,x,z))x=back.x;
  assert.ok(C.dist(sim.s.player,{x,z})<1);
  assert.equal(C.obstacleAt(sim.collisionRoom,sim.s.player.x,sim.s.player.z,14),false);
 });
}
for(const mode of ['hybrid','classic']){
 test(mode+' · issue requires time and gives no main objective',()=>{const sim=scene('armory',mode),before=sim.s.objective;sim.useArmory('issue');ticks(sim,.8);assert.equal(A.kit(sim.s).issued,false);ticks(sim,1.3);assert.equal(A.kit(sim.s).fuel,60);assert.equal(sim.s.objective,before);assert.equal(sim.s.armory.stats.issued,1);});
 test(mode+' · repeated issue never replenishes',()=>{const sim=scene('armory',mode);issue(sim);sim.useArmory('flame');ticks(sim,.5);sim.fire();const fuel=A.kit(sim.s).fuel;assert.equal(sim.useArmory('issue'),false);assert.equal(A.kit(sim.s).fuel,fuel);});
 test(mode+' · remote rack rejected',()=>{assert.equal(scene('med',mode).useArmory('issue'),false);assert.equal(scene('armory',mode,0,170).useArmory('issue'),false);});
 test(mode+' · movement cancels without supplies',()=>{const sim=scene('armory',mode);sim.useArmory('issue');ticks(sim,.6,{x:1});assert.equal(sim.s.work,null);assert.equal(A.kit(sim.s).issued,false);});
 test(mode+' · damage cancels without supplies',()=>{const sim=scene('armory',mode);sim.useArmory('issue');sim.hit(8);ticks(sim,3);assert.equal(A.kit(sim.s).issued,false);});
 for(const ch of [1,6])test(mode+' · adult civilian / child never receives weapon · '+ch,()=>{const sim=scene('armory',mode,ch);assert.equal(sim.useArmory('issue'),false);assert.equal(sim.useArmory('flame'),false);assert.equal(sim.useArmory('grenade'),false);assert.equal(sim.fire(),false);});
 test(mode+' · Paris has separate finite kit',()=>{const sim=scene('armory',mode,8);issue(sim);assert.equal(sim.s.armory.kits.paris.fuel,60);assert.equal(sim.s.armory.kits.brackett.issued,false);});
 test(mode+' · flame consumes fuel, not pulse ammunition',()=>{const sim=scene('armory',mode);issue(sim);const ammo=sim.s.player.ammo;sim.useArmory('flame');ticks(sim,.5);assert.equal(sim.fire(),true);assert.equal(A.kit(sim.s).fuel,59);assert.equal(sim.s.player.ammo,ammo);assert.equal(sim.reload(),false);});
 test(mode+' · flame kills existing adult, no duplication',()=>{const sim=scene('armory',mode,0,700,.7);sim.s.player.x=1080;sim.s.player.z=mode==='classic'?.7:.28;issue(sim);Object.assign(sim.s.player,{x:700,z:.7,facing:1});sim.ensureRoom().enemies=[enemy(900,.7,10)];sim.useArmory('flame');ticks(sim,.5);sim.fire();assert.equal(sim.ensureRoom().enemies[0].hp,0);assert.equal(sim.s.stats.kills,1);assert.equal(sim.ensureRoom().enemies[0].ductEntry,null);});
 test(mode+' · flame obeys closed barrier',()=>{const sim=scene('armory',mode);issue(sim);sim.s.room='med';Object.assign(sim.s.player,{x:376,z:.7,facing:1});sim.s.defense.shutters['shutter-med'].state='closed';sim.ensureRoom().enemies=[enemy(565,.7)];sim.useArmory('flame');ticks(sim,.5);const hp=sim.ensureRoom().enemies[0].hp;sim.fire();assert.equal(sim.ensureRoom().enemies[0].hp,hp);});
 test(mode+' · no fire with empty tank, switch back permitted',()=>{const sim=scene('armory',mode);issue(sim);sim.useArmory('flame');ticks(sim,.5);A.kit(sim.s).fuel=0;assert.equal(sim.fire(),false);assert.equal(sim.useArmory('pulse'),true);ticks(sim,.7);assert.equal(sim.fire(),true);});
 test(mode+' · serialized grenade preserves count and owner',()=>{const sim=scene('armory',mode);issue(sim);Object.assign(sim.s.player,{x:700,z:.7,facing:1});assert.equal(sim.useArmory('grenade'),true);ticks(sim,.12);const text=sim.save(),restored=new C.Simulation();restored.load(text);assert.equal(restored.s.armory.projectiles.length,1);assert.equal(A.kit(restored.s).grenades,2);assert.equal(restored.s.armory.stats.grenades,1);ticks(restored,1.1);assert.equal(restored.s.armory.projectiles.length,0);assert.equal(A.kit(restored.s).grenades,2);});
 test(mode+' · grenade cannot open menus/leave room via E during flight',()=>{const sim=scene('armory',mode);issue(sim);const portal=sim.room.portals[0];Object.assign(sim.s.player,{x:portal.x,z:mode==='classic'?.7:portal.z,facing:1});sim.useArmory('grenade');sim.interact();assert.equal(sim.s.room,'armory');assert.equal(sim.s.passages.transit,null);});
 test(mode+' · grenade kills a contacted adult',()=>{const sim=scene('armory',mode);issue(sim);Object.assign(sim.s.player,{x:700,z:.7,facing:1});sim.ensureRoom().enemies=[enemy(1080,.7)];sim.useArmory('grenade');ticks(sim,.7);assert.equal(sim.ensureRoom().enemies[0].hp,0);assert.equal(sim.s.stats.kills,1);});
 test(mode+' · explosion stopped by a closed shutter; shooter can be hurt',()=>{const sim=scene('armory',mode);issue(sim);sim.s.room='med';Object.assign(sim.s.player,{x:376,z:.7,facing:1});sim.s.defense.shutters['shutter-med'].state='closed';sim.ensureRoom().enemies=[enemy(530,.7)];const before=sim.s.player.hp;sim.useArmory('grenade');ticks(sim,.18);assert.equal(sim.ensureRoom().enemies[0].hp,72);assert.ok(sim.s.player.hp<before);assert.equal(sim.s.defense.shutters['shutter-med'].hp,60);});
 test(mode+' · unissued and negative stock imports rejected',()=>{for(const mutate of [k=>k.fuel=-1,k=>k.fuel=61,k=>k.grenades=4,k=>{k.issued=false;k.fuel=2},k=>k.selected='smartgun']){const sim=scene('armory',mode);issue(sim);const save=JSON.parse(sim.save());mutate(save.state.armory.kits.brackett);assert.throws(()=>C.parseSave(JSON.stringify(save)));}});
 test(mode+' · malformed / duplicate grenade imports rejected',()=>{const sim=scene('armory',mode);issue(sim);sim.useArmory('grenade');const good=JSON.parse(sim.save());for(const edit of [a=>a.projectiles.push(clone(a.projectiles[0])),a=>a.projectiles[0].owner='newt',a=>a.projectiles[0].room='med',a=>a.projectiles[0].life=22,a=>a.projectiles[0].vx=4]){const s=clone(good);edit(s.state.armory);assert.throws(()=>C.parseSave(JSON.stringify(s)));}});
}
for(let v=1;v<=8;v++)test('Actual export 0.'+v+' migration without free armament',()=>{
 const text=fs.readFileSync(path.join(__dirname,'fixtures/real-v0'+v+'-save.json'),'utf8'),old=JSON.parse(text).state,s=C.parseSave(text).state;
 assert.deepEqual(s.armory,A.initial());for(const k of ['room','chapter','objective','archives','collected'])assert.deepEqual(s[k],old[k]);
 assert.equal(s.player.ammo,old.player.ammo);if(v===8){assert.equal(s.mobility.rover.speed,old.mobility.rover.speed);assert.equal(s.mobility.rover.driver,old.mobility.rover.driver);}
});
const report={version:D.manifest.version,passed:cases.every(c=>c.passed),cases,method:'Architecture and armament fixtures. Every directed endpoint uses E and normal simulation time; fixture setup grants prerequisite flags explicitly. Not complete human playthroughs.'};
fs.writeFileSync(path.join(__dirname,'../docs/FIDELITY_TEST_RESULTS.json'),JSON.stringify(report,null,2));
console.log(`${cases.filter(c=>c.passed).length}/${cases.length} fidelity and armament tests`);if(!report.passed)process.exitCode=1;
