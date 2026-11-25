'use strict';
// Isolated fixtures, not playthroughs. Pose/actors are prepared explicitly here.
const {test}=require('node:test'),A=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../src/core.js'),I=require('../src/controls.js');
function base(room='s09',mode='HYBRID'){
 const g=new C.Game();g.importSave(fs.readFileSync(path.join(__dirname,`fixtures/played-${mode}-07.json`),'utf8'));g.enter(room);g.drainEvents();return g;
}
function place(g,x=800,z=.55){g.p.x=x;g.p.z=z;g.cooldowns.sensor=0;A.equal(g.sensorAction(),true,g.sensorPlacement().reason);return g.state.sensors.find(b=>b.room===g.room.id&&Math.abs(b.x-x)<1);}
function scan(g,dt=.25){g.state.stats.time+=dt;g.time=g.state.stats.time;g.stepSensors(dt);}
for(const mode of ['HYBRID','CLASSIC']){
 test(mode+' : les trois appareils ont une identité fixe et une charge limitée',()=>{const g=base('s09',mode);A.equal(g.state.sensors.length,3);A.ok(g.state.sensors.every(b=>b.charge===180&&!b.powered&&b.room===null));A.ok(g.validate(g.state));});
 test(mode+' : pose et récupération sans recharge ni création de matériel',()=>{const g=base('s09',mode),b=place(g);scan(g,3);const charge=b.charge;g.cooldowns.sensor=0;A.ok(g.sensorAction());A.equal(b.room,null);A.equal(b.charge,charge);scan(g,2);A.equal(b.charge,charge);A.equal(g.state.sensors.length,3);A.equal(g.state.stats.sensorsRecovered,1);A.ok(g.validate(g.state));});
 test(mode+' : le joueur en mouvement déclenche un vrai contact non identifié',()=>{const g=base('s09',mode),b=place(g);scan(g);g.p.x+=40;scan(g);A.ok(b.lastPulse>=0);A.equal(b.count,1);A.equal(g.state.stats.sensorSignals,1);A.ok(g.drainEvents().some(e=>e.type==='sensor-signal'));});
 test(mode+' : une silhouette immobile ne déclenche aucun signal',()=>{const g=base('s24',mode),b=place(g);g.rs.enemies[0].moving=true;for(let n=0;n<8;n++)scan(g);A.equal(b.lastPulse,-1);A.equal(g.state.stats.sensorSignals,0);});
 test(mode+' : mouvement réel d’un adulte détecté sans exposer son identité',()=>{const g=base('s24',mode),b=place(g),e=g.rs.enemies[0];e.x=930;e.z=.55;scan(g);e.x+=20;scan(g);A.equal(b.count,1);const reports=g.sensorReports();A.equal(reports[0].room,'s24');A.ok(!('enemies'in reports[0]));A.ok(!('x'in reports[0]));A.ok(!JSON.stringify(reports).includes(e.id));});
 test(mode+' : un adulte mort ou capturé est exclu',()=>{const g=base('s24',mode),b=place(g),e=g.rs.enemies[0];e.x=930;e.z=.55;scan(g);e.hp=0;e.x+=20;scan(g);A.equal(b.lastPulse,-1);});
 test(mode+' : une cloison masque le mouvement de l’autre côté',()=>{const g=base('s17',mode),gate=g.room.shutters[0],b=place(g,gate.x-200);g.p.x=gate.x+120;g.p.z=.55;g.rs.shutters[gate.id].status='closed';scan(g);g.p.x+=30;scan(g);A.equal(b.lastPulse,-1);});
 test(mode+' : la portée de mesure n’est pas illimitée',()=>{const g=base('s09',mode),b=place(g,500);g.p.x=1300;scan(g);g.p.x+=20;scan(g);A.equal(b.lastPulse,-1);});
 test(mode+' : la veille coupée n’émet et ne consomme rien',()=>{const g=base('s09',mode),b=place(g);A.ok(g.toggleSensor(b.id));const charge=b.charge;scan(g);g.p.x+=20;scan(g);A.equal(b.lastPulse,-1);A.equal(b.charge,charge);A.equal(b.powered,false);});
 test(mode+' : les capteurs rangés préservent leur batterie',()=>{const g=base('s09',mode);scan(g,180);A.ok(g.state.sensors.every(b=>b.charge===180));});
 test(mode+' : la batterie épuisée coupe la veille sans disparition',()=>{const g=base('s09',mode),b=place(g);scan(g,180);A.equal(b.charge,0);A.equal(b.powered,false);A.equal(b.room,'s09');A.equal(g.toggleSensor(b.id),false);A.ok(g.validate(g.state));});
 test(mode+' : relire une sauvegarde conserve charge, position et dernière observation',()=>{const g=base('s09',mode),b=place(g);scan(g);g.p.x+=30;scan(g);const before=JSON.stringify(g.state.sensors);g.importSave(g.exportSave());A.equal(JSON.stringify(g.state.sensors),before);A.ok(g.validate(g.state));});
}
test('Aucun appareil utilisable dans le prologue civil',()=>{const g=new C.Game();A.equal(g.sensorPlacement().ok,false);A.equal(g.sensorAction(),false);A.equal(g.sensorReports().length,0);A.equal(g.state.stats.sensorsPlaced,0);});
test('La pose refuse un seuil',()=>{const g=base();g.p.x=g.room.doors[0].x;g.p.z=.55;A.equal(g.sensorAction(),false);A.ok(g.state.sensors.every(b=>b.room===null));});
test('La pose refuse la course d’une cloison même ouverte',()=>{const g=base('s17');g.p.x=g.room.shutters[0].x;g.p.z=.55;A.equal(g.sensorAction(),false);});
test('La pose refuse un vrai obstacle',()=>{const g=base();const o=g.room.obstacles[0];g.p.x=o.x;g.p.z=o.z;A.equal(g.sensorAction(),false);});
test('Les trois poses ne permettent pas d’obtenir un quatrième appareil',()=>{const g=base();for(const x of [500,1000,1700])place(g,x);g.cooldowns.sensor=0;g.p.x=1200;A.equal(g.sensorAction(),false);A.equal(g.state.sensors.filter(b=>b.room).length,3);});
test('Une double activation immédiate ne pose/récupère pas le même capteur',()=>{const g=base(),b=place(g);A.equal(g.sensorAction(),false);A.equal(b.room,'s09');});
test('Liaison atténante compatible, pas de radio à travers le monde',()=>{const g=base('s24'),b=place(g);g.enter('s22');A.equal(g.sensorLinked(b),true);g.enter('s09');A.equal(g.sensorLinked(b),false);A.equal(g.toggleSensor(b.id),false);});
test('Les capteurs hors liaison consomment leur charge mais ne pistent pas un acteur figé',()=>{const g=base('s24'),b=place(g);g.enter('s09');scan(g,6);A.equal(b.charge,174);A.equal(b.lastPulse,-1);});
test('Le premier scan après reprise n’invente pas un mouvement',()=>{const g=base(),b=place(g);scan(g);g.importSave(g.exportSave());scan(g);A.equal(g.state.sensors[0].lastPulse,-1);});
test('Un mouvement continu ne remplit pas le journal à chaque scan',()=>{const g=base(),b=place(g);scan(g);for(let i=0;i<12;i++){g.p.x+=10;scan(g);}A.ok(b.lastPulse>2);A.equal(g.state.stats.sensorSignals,1);A.equal(g.state.pursuit.journal.filter(j=>j.type==='sensor-signal').length,1);});
test('Après deux secondes de silence un nouveau déplacement émet un nouveau fait',()=>{const g=base();place(g);scan(g);g.p.x+=20;scan(g);for(let i=0;i<10;i++)scan(g);g.p.x+=20;scan(g);A.equal(g.state.stats.sensorSignals,2);});
test('La méthode de scan restitue toujours la salle réelle après le contexte distant',()=>{const g=base('s24');place(g);g.enter('s22');scan(g);A.equal(g.state.room,'s22');});
for(const [label,mutate]of [
 ['charge négative',s=>s.sensors[0].charge=-1],['charge artificielle',s=>s.sensors[0].charge=999],['id dupliqué',s=>s.sensors[1].id=s.sensors[0].id],['coordonnée non finie',s=>s.sensors[0].x=null],['salle inconnue',s=>s.sensors[0].room='inconnue'],['capteur rangé allumé',s=>s.sensors[1].powered=true],['observation future',s=>s.sensors[0].lastPulse=9999999],['comptage négatif',s=>s.sensors[0].count=-1],['suppression de pool',s=>s.sensors.pop()],['statistique truquée',s=>s.stats.sensorsPlaced=-1]
])test('Import atomique refuse '+label,()=>{const g=base();place(g);const original=g.exportSave(),bad=JSON.parse(original);mutate(bad.state);A.throws(()=>g.importSave(JSON.stringify(bad)));A.equal(g.exportSave(),original);});
test('Les 198 sauvegardes de schéma 5 migrent sans altérer les blessures, poursuites ou positions',()=>{
 let n=0;for(const f of fs.readdirSync(path.join(__dirname,'trace-fixtures')).filter(f=>/^(HYBRID|CLASSIC)-(exploration|survival|oppression)-\d\d\.json$/.test(f))){
  const raw=fs.readFileSync(path.join(__dirname,'trace-fixtures',f),'utf8'),before=JSON.parse(raw).state,g=new C.Game();A.equal(before.schema,5);g.importSave(raw);A.equal(g.state.schema,8);A.deepEqual(g.state.completed,before.completed);A.deepEqual(g.state.pursuit,before.pursuit);A.equal(g.p.hp,before.player.hp);A.equal(g.p.reserve,before.player.reserve);A.ok(g.state.sensors.every(b=>b.charge===180&&b.room===null));A.ok(g.validate(g.state));n++;
 }A.equal(n,198);
});
const raw=(buttons=[],axes=[0,0,0,0])=>({connected:true,index:0,id:'Standard test fixture',mapping:'standard',axes,buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))});
test('Zone morte radiale supprime une dérive de stick',()=>{A.deepEqual(I.stick(.05,.13),{x:0,y:0});});
test('Le stick diagonal est borné à une vitesse normalisée',()=>{const a=I.stick(1,1);A.ok(Math.abs(Math.hypot(a.x,a.y)-1)<1e-9);});
test('Valeurs de stick illisibles ne contaminent pas le moteur',()=>{A.deepEqual(I.stick(NaN,Infinity),{x:0,y:0});});
test('Connexion avec gâchette maintenue attend une position neutre',()=>{const p=new I.PadInput();A.ok(p.read(raw([7])).blocked);A.equal(p.read(raw([])).blocked,false);A.ok(p.read(raw([7])).edges[7]);});
test('Une pression maintenue produit un seul front de bouton',()=>{const p=new I.PadInput();p.read(raw());A.ok(p.read(raw([0])).edges[0]);A.equal(p.read(raw([0])).edges[0],false);A.ok(p.read(raw([0])).buttons[0]);});
test('Réarmer après une pause interdit le tir fantôme',()=>{const p=new I.PadInput();p.read(raw());p.read(raw([7]));p.rearm();A.ok(p.read(raw([7])).blocked);A.equal(p.read(raw([7])).buttons[7],false);});
test('Déconnexion est un événement unique',()=>{const p=new I.PadInput();p.read(raw());A.equal(p.read(null).disconnected,true);A.equal(p.read(null).disconnected,false);});
test('Un profil non standard ne reçoit pas un faux mapping de commandes',()=>{const p=new I.PadInput();const v=raw([7]);v.mapping='';A.equal(p.read(v).connected,false);});
test('Changer d’identité de manette réarme les commandes',()=>{const p=new I.PadInput();p.read(raw());const v=raw([7]);v.index=1;A.equal(p.read(v).blocked,true);});
test('Les huit directions sélectionnent les huit secteurs de la roue',()=>{for(let i=0;i<8;i++){const a=i*Math.PI/4;A.equal(I.wheelIndex(Math.sin(a),-Math.cos(a)),i);}A.equal(I.wheelIndex(0,0),null);});
test('La marche analogique respecte les mêmes collisions que les touches',()=>{const g=base();g.p.x=700;g.p.z=.55;const x=g.p.x;g.step(.05,{moveX:.5,moveZ:0});A.ok(Math.abs(g.p.x-x-5.125)<.01);A.ok(g.validate(g.state));});
