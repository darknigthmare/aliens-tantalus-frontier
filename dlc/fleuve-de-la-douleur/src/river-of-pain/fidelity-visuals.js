/* v0.9: architecturally supported thresholds, explicit people and source-labelled visual references. */
(function(root){'use strict';
const P=root.ROP_Renderer.prototype,D=root.ROP_DATA,C=root.ROP_CORE,A=root.ROP_ARMORY;
const originalPerson=P.person,oldProp=P.prop,oldRender=P.render,oldObject=P.object;
P.render=function(sim,dt){this.fidelitySim=sim;oldRender.call(this,sim,dt);this.armoryEffects(sim);};
P.portal=function(p,r,s){
 const cfg=p.architecture,v=this.project(p.x,this.classic?.7:p.z),k=this.scale,g=this.ctx;
 if(v.x<-300*k||v.x>this.w+300*k)return;
 const type=cfg.type,child=p.childOnly,locked=p.requires&&!s.flags[p.requires],sealed=s.doors[[r.id,p.to].sort().join('|')]==='sealed',dest=C.roomDef(p.to);
 g.save();g.translate(v.x,v.y);g.scale(k,k);
 const trim=locked?'#b18663':sealed?'#d2b074':'#91b8a6',w=child?66:112,h=child?57:153;
 const label=dest.name.length>30?dest.name.slice(0,28)+'…':dest.name;
 if(type==='track'){
  // Open exterior path: wheel marks, marker post and a continuation line. No door.
  const dir=p.x<r.width*.45?-1:1;
  this.path([[-90,6],[90,6],[126,29],[-126,29]],'#7d816d28');
  this.line(-90,16,90,16,'#b3b29688',3);
  for(let i=0;i<5;i++)this.line(dir*(i*24-48),10,dir*(i*24-42),21,'#dad5a866',2);
  this.rect(-8,-88,8,88,'#687a75','#9baba0');this.rect(-65,-91,142,23,'#1c3239','#97a58d');
  this.text(dir<0?'← PISTE':'PISTE →',5,-74,12,'#d4d6b4','center');
  this.text(label,0,-106,10,'#d1d5bd','center');g.restore();return;
 }
 if(type==='organic'){
  // Ribbed opening is continuous with the alien hull. Human locks aren't drawn here.
  this.ellipse(0,-93,105,123,'#203334');this.ellipse(0,-85,76,102,'#060f15');
  for(let i=0;i<7;i++){
   g.beginPath();g.ellipse(0,-90,83+i*6,103+i*4,0,Math.PI,Math.PI*2.04);
   g.strokeStyle=i%2?'#6e827b':'#344c4a';g.lineWidth=i%2?3:8;g.stroke();
  }
  this.path([[-82,0],[-68,-45],[-58,-77],[-55,0]],'#334945','#7b8c7c');
  this.path([[82,0],[70,-43],[61,-76],[56,0]],'#253b3d','#637d75');
  this.line(-70,3,70,3,'#a2a88a',3);this.text(label,0,-225,11,'#c2cbb1','center');
  this.text('OUVERTURE DE COQUE',0,22,8,'#9fac98','center');g.restore();return;
 }

 if(type==='rope'){
  this.ellipse(0,-32,88,45,'#0b1519');this.ellipse(0,-34,78,37,'#263b37');
  this.ellipse(0,-40,64,24,'#030b10');this.path([[-86,-38],[-80,1],[-63,12],[-57,-30]],'#536c59','#87957b');
  this.path([[85,-38],[80,1],[60,12],[55,-30]],'#425d53','#81957e');
  g.beginPath();g.moveTo(-47,-51);g.bezierCurveTo(-37,-137,10,-151,14,-38);g.strokeStyle='#819a80';g.lineWidth=9;g.stroke();
  this.line(12,-114,12,4,'#c2b78d',3);for(let y=-105;y<0;y+=17)this.line(8,y,16,y+5,'#736952',2);
  this.text(label,0,-161,10,'#c5ccaf','center');this.text('CORDE / N'+r.floor+' → N'+dest.floor,0,30,8,'#b2ba9b','center');g.restore();return;
 }
 // A continuous pier/head joins the opening to the ceiling/rear wall. Side
 // thresholds receive a return wall to the room boundary; central ones are inset bays.
 const top=Math.min(-h-42,(this.h*.20-v.y)/k);
 if(cfg.mount==='side-bulkhead'){
  const dir=p.x<r.width/2?-1:1,edge=dir<0?-p.x:r.width-p.x;
  this.path([[dir*(w/2+20),0],[edge,0],[edge,top],[dir*(w/2+20),top]],'#213338','#556e6c');
  for(let y=top+30;y<-8;y+=56)this.line(dir*(w/2+22),y,edge,y,'#8b9a8733',1);
 }
 this.rect(-w/2-27,top,22,-top,'#344b4d','#748981');
 this.rect(w/2+5,top,22,-top,'#2c4345','#6e827e');
 this.rect(-w/2-8,top,w+16,-h-top-12,'#20363c','#607873');
 this.rect(-w/2-8,-h-15,w+16,15,'#708078','#b0b49a');
 this.rect(-w/2,-h,w,h,'#06131b','#587771');
 this.path([[-w/2-8,0],[w/2+8,0],[w/2+27,12],[-w/2-27,12]],'#5b7068','#a3ad8d');
 if(type==='stairs'){
  const up=dest.floor>r.floor;
  for(let n=0;n<8;n++){
   const y=-n*16,xx=-44+n*3;
   this.rect(xx,y-10,88-n*6,11,up?'#586b68':'#3c5154','#859887');
   this.line(xx,y-10,xx+88-n*6,y-10,'#a8b19a',2);
  }
  this.line(-48,0,-26,-149,'#9aab9b',4);this.line(48,0,26,-149,'#9aab9b',4);
  this.text(up?'↑':'↓',0,-135,20,'#d6d8b1','center');
 }else if(type==='ladder'){
  this.rect(-32,-h+5,64,h-5,'#071017');
  this.line(-25,0,-25,-h+12,'#92a69a',5);this.line(25,0,25,-h+12,'#92a69a',5);
  for(let y=-8;y>-h+12;y-=17)this.line(-25,y,25,y,'#b7bf9c',4);
  this.line(43,0,43,-h-15,'#769283',3);this.line(-43,0,-43,-h-15,'#769283',3);
 }else if(type==='lift'){
  this.rect(-49,-146,98,139,'#10232a','#788d83');
  this.line(-34,-140,-34,0,'#afbdad',3);this.line(34,-140,34,0,'#afbdad',3);
  for(let i=0;i<8;i++)this.line(-48+i*14,-139,-48+i*14,-9,'#829a8e88',2);
  this.rect(-49,-10,98,11,'#7b8875','#b9bea0');this.rect(-11,-177,22,17,'#334749','#abc2a6');
  this.line(0,top,0,-178,'#85948e',4);this.text('N'+dest.floor,0,-164,9,'#cfdbc1','center');
 }else if(type==='duct'){
  this.rect(-29,-49,58,46,'#08161c','#929f8f');
  for(let y=-43;y<-6;y+=8)this.line(-25,y,25,y,'#a1af9b',4);
  this.rect(-12,-h-20,24,8,'#a9b292');this.text('NEWT',0,-h-27,8,'#c3cda8','center');
 }else if(type==='gangway'||type==='corridor'){
  for(let n=0;n<7;n++)this.line(-45+n*3,-n*13,45-n*3,-n*13,'#637e76',3);
  this.line(-47,0,-26,-145,'#97b19c',3);this.line(47,0,26,-145,'#97b19c',3);
  this.line(-47,-38,-26,-165,'#97b19c',3);this.line(47,-38,26,-165,'#97b19c',3);
 }else{
  this.rect(-w/2+6,-h+8,w-12,h-11,type==='airlock'?'#475b5c':'#32494d','#879c8d');
  this.line(0,-h+10,0,-4,'#07151c',4);this.rect(-w/2+15,-h+25,w-30,20,'#112a35','#729790');
  for(let i=0;i<4;i++)this.line(-w/2+10,-h+66+i*13,w/2-10,-h+66+i*13,'#70867955',2);
  if(sealed){this.line(-41,-124,41,-21,'#d8a65e',4);this.line(-41,-21,41,-124,'#ba9d66',3);}
 }
 if(!child&&type!=='stairs'&&type!=='ladder'){
  this.rect(w/2+10,-81,13,27,'#112c33','#a1b39b');this.circle(w/2+16,-74,3,trim);
 }
 this.text(label,0,-h-29,10,'#d7dbc0','center');
 const description=type==='stairs'||type==='ladder'||type==='lift'
  ?(r.floor===dest.floor?'PALIER LOCAL · '+(cfg.localRiseM||0)+' m simulés':'N'+r.floor+' → N'+dest.floor)
  :type==='duct'?'CONDUIT FIXÉ À LA PAROI':type==='gangway'?'PASSERELLE AVEC GARDE-CORPS':'SEUIL ARCHITECTURAL';
 this.text(description,0,27,8,'#a6b5a3','center');
 g.restore();
};
P.person=function(p,id,player=false,mul=1){
 if(p.appearance||!D.appearances[id])return originalPerson.call(this,p,id,player,mul);
 const def=D.appearances[id],sim=this.fidelitySim,s=sim?.s,v=this.project(p.x,p.z),g=this.ctx,k=this.scale*(.82+p.z*.28)*mul,h=def.height,crouch=p.crouch?.67:1,walk=this.reduced?0:p.walk||0;
 const armed=['brackett','paris'].includes(id),weapon=player&&s?A.active(s):'pulse',helmet=armed,skin=def.skin;
 g.save();g.translate(v.x,v.y);g.scale(k,k);this.ellipse(0,2,armed?24:18,5,'#01080dc0');g.scale(p.facing||1,1);
 const hip=-h*.43*crouch,shoulder=-h*.79*crouch,head=shoulder-13,width=13*def.build,stride=Math.sin(walk)*9;
 for(const n of [-1,1]){
  const knee=n*7+stride*n*.5,foot=n*9+stride*n;
  this.line(n*5,hip,knee,-h*.23,def.pants,9*def.build);
  this.line(knee,-h*.23,foot,-7,def.pants,8*def.build);g.lineWidth=1;this.rect(foot-5,-7,15,8,'#1c292c','#6f7a6d');
  if(armed)this.rect(knee-4,-h*.24,9,9,'#7f856e','#2d4441');
 }
 this.path([[-width,shoulder],[-width-2,hip],[width,hip],[width+2,shoulder+5]],def.color,'#354d4b',1);
 if(def.wardrobe==='overalls'){
  this.rect(-width+2,shoulder+19,width*2-2,hip-shoulder-19,def.pants);
  this.rect(-width+3,shoulder+5,5,24,'#526c7a','#839594');
  if(!s||s.phase<3)this.rect(width-3,shoulder+5,4,24,'#526c7a','#839594');
  else this.line(width,shoulder+24,width+9,shoulder+35,'#708b93',3);
  this.rect(-4,shoulder+25,11,10,'#425d6d','#8a9b95');
 }else if(def.wardrobe==='medical'){
  this.path([[-width,shoulder+6],[-width-5,hip+12],[width+3,hip+12],[width,shoulder+6]],def.color,'#8ba39b');
  this.line(0,shoulder+5,0,hip+12,'#748f86',1.5);this.rect(5,shoulder+20,10,11,'#aabfb2','#71938a');this.circle(9,shoulder+23,2,'#649086');
 }else if(armed){
  this.path([[-width,shoulder+5],[-width+1,hip-5],[width-1,hip-5],[width+1,shoulder+5]],'#4d6050','#b0b08c',1.5);
  this.line(-10,shoulder+8,8,hip-7,'#a2a48a',4);
  for(let i=0;i<3;i++)this.rect(-width+1+i*9,hip-12,8,11,'#384d43','#83917a');
  this.rect(-width-11,shoulder+8,10,29,'#50624b','#849478');
  this.rect(-8,shoulder+10,17,6,'#233930');this.text(id==='paris'?'PARIS':'BRACKETT',0,shoulder+15,3.6,'#c7c3a1','center');
 }else{
  this.line(-width+5,shoulder+2,-width+5,hip,'#d3c39955',2);this.rect(3,shoulder+17,9,10,'#5c675b','#a4ac8b');
 }
 // Hair silhouettes are profile-specific, not the same patch recoloured.
 const long=['long','curls'].includes(def.hairstyle);
 if(long){
  if(def.hairstyle==='long')this.path([[-14,head-7],[-9,head-21],[8,head-20],[15,head-7],[9,head+24],[-15,head+18]],def.hair,'#6e6854');
  else for(let i=0;i<11;i++){const a=i/10*Math.PI*1.8;this.circle(Math.cos(a)*13,head-5+Math.sin(a)*14,6,def.hair);}
 }
 this.ellipse(0,head,9.6,12,skin);
 this.path([[6,head-5],[13,head-1],[9,head+2],[8,head+8],[2,head+10]],skin,'#8e7868',.7);
 this.line(4,head-5,9,head-4,'#63584b',1.3);this.circle(7.5,head-2,1.4,def.eyes||'#344747');
 this.line(5,head+6,9,head+6,'#866b58',.7);
 if(def.hairstyle==='curls'){
  for(let i=0;i<9;i++){const a=Math.PI+i*Math.PI/8;this.circle(Math.cos(a)*11,head-8+Math.sin(a)*9,5.1,def.hair);}
  this.circle(-12,head+7,6,def.hair);
 }else if(def.hairstyle==='long'){
  this.path([[-11,head-15],[-2,head-20],[9,head-14],[5,head-9],[-5,head-10],[-8,head+10],[-15,head+18]],def.hair);
  for(let i=0;i<4;i++)this.line(-13+i*2,head-4,-14+i*2,head+19,'#d3c29655',.7);
 }else{
  this.ellipse(-2,head-12,11,6,def.hair);
  if(def.hairstyle==='tied')this.ellipse(-13,head-5,6,11,def.hair);
  if(def.hairstyle==='scruffy')for(let i=0;i<5;i++)this.line(-3+i*2,head+8,-2+i*2,head+10,'#665b50',1);
 }
 if(helmet){
  this.ellipse(-1,head-15,14,9,'#788569');this.rect(-15,head-14,29,6,'#747f62','#a0a18a');
  this.path([[-12,head-18],[-2,head-23],[4,head-18]],'#a0a383');this.rect(9,head-10,6,5,'#253b3e');
  this.line(-10,head-5,-7,head+8,'#475d4f',2);
 }
 const handY=shoulder+26;
 if(armed&&!p.stowed){
  g.save();if(p.aim){g.translate(16,shoulder+15);g.rotate(Math.atan2(p.aim.z*.393,Math.abs(p.aim.x)));g.translate(-16,-shoulder-15);}
  this.line(width,shoulder+9,24,handY,def.color,8);this.line(24,handY,27,handY,skin,6);g.lineWidth=1;g.translate(-15,0);g.scale(.52,1);
  if(weapon==='flame'){
   this.rect(20,shoulder+12,61,15,'#4a5946','#a6a27d');this.rect(68,shoulder+15,21,11,'#2b3634','#829285');
   this.rect(31,shoulder+28,12,13,'#303b38');this.rect(33,shoulder+6,28,5,'#253632','#829078');this.line(34,shoulder+11,34,shoulder+5,'#a9af99',2);this.line(58,shoulder+11,58,shoulder+5,'#a9af99',2);
   this.rect(87,shoulder+20,11,5,'#93917b');this.line(21,shoulder+24,9,hip-1,'#202e2d',4);
  }else{
   this.path([[18,shoulder+13],[36,shoulder+10],[63,shoulder+13],[73,shoulder+21],[63,shoulder+26],[19,shoulder+24]],'#576349','#aca789');
   this.rect(70,shoulder+16,26,5,'#283a3b','#7f9692');
   this.rect(48,shoulder+25,41,9,'#46574b','#7f8e7a');for(let i=0;i<5;i++)this.line(51+i*5,shoulder+26,51+i*5,shoulder+32,'#9ba38b',1);
   this.rect(28,shoulder+25,12,14,'#2a3c38');this.rect(40,shoulder+10,18,4,'#1a3035');this.rect(52,shoulder+16,8,5,'#0b2124');
   this.text(String(player&&s?s.player.ammo:30).padStart(2,'0'),56,shoulder+20,4,'#d97857','center');
  }
  g.restore();
 }else{this.line(width,shoulder+9,width+3+stride*.3,hip+8,def.color,8*def.build);this.circle(width+3+stride*.3,hip+9,3.7,skin);}
 if(s?.phase>=2){for(const [x,y]of [[-7,hip-6],[8,shoulder+8],[-5,head+1]])this.rect(x,y,4,2,'#423e3399');}
 if(player)this.rect(-7,shoulder+6,4,4,'#cbdab0');
 g.restore();
};
P.object=function(o,active,found,r,s){
 if(o.kind==='archive'&&r.kind==='derelict'){
  if(!found){const p=this.project(o.x,this.classic?.7:o.z);this.text('◇',p.x,p.y-12*this.scale,17*this.scale,'#bac7a477','center');}
  return;
 }
 if(['talk','escort','lore-contact'].includes(o.kind)&&o.actorId&&!found){
  this.person({x:o.x,z:this.classic?.7:o.z,facing:-1,walk:0},o.actorId,false);
  if(o.id==='stretcher')this.prop({id:'return-stretcher',kind:'bed',x:o.x+103,z:this.classic?.7:o.z},r,s);
  const q=this.project(o.x,this.classic?.7:o.z),k=this.scale;this.text(D.appearances[o.actorId].name,q.x,q.y-110*k,10*k,'#d1d8bb','center');
  if(active)this.text('◆',q.x,q.y-128*k,12*k,'#d3d7b2','center');return;
 }
 if(o.kind==='armory'){this.prop({...o,kind:'weapon-rack',z:this.classic?.7:o.z},r,s);return;}
 if(o.kind==='inspection'){const q=this.project(o.x,this.classic?.7:o.z);this.text('▤',q.x,q.y-80*this.scale,14*this.scale,'#c3dac5','center');return;}
 oldObject.call(this,o,active,found,r,s);
};
P.prop=function(p,r,s){
 const types=['egg-bed','pilot-seat','sealed-egg','weapon-rack','natal-unit','white-monitor','named-doctor'];

 if(!types.includes(p.kind)){
  if(p.collidable&&p.footprint&&r.kind==='derelict'){
   const v=this.project(p.x,p.z),a=this.project(p.x,p.z-p.footprint.d/2),b=this.project(p.x,p.z+p.footprint.d/2),k=this.scale,w=p.footprint.w*k/2,h=65*k;
   this.path([[v.x-w,b.y],[v.x-w,a.y],[v.x-w*.55,a.y-h],[v.x+w*.34,a.y-h*1.13],[v.x+w,a.y],[v.x+w,b.y]],'#334a42','#7a8e75',2*k);
   this.path([[v.x-w,b.y],[v.x-w*.24,a.y-h*.79],[v.x+w*.35,b.y]],'#51645044','#8c9b7644');
   return;
  }
  return oldProp.call(this,p,r,s);
 }
 if(p.kind==='named-doctor'){if((s?.phase??this.fidelitySim?.s.phase??0)<=1)this.person({...p,facing:1},'komiskey');return;}
 const v=this.project(p.x,p.z),k=this.scale*(.8+p.z*.28),g=this.ctx;g.save();g.translate(v.x,v.y);g.scale(k,k);
 if(p.kind==='weapon-rack'){
  this.rect(-65,-139,130,139,'#1b3037','#93a293');this.rect(-57,-132,114,123,'#0c2028');
  for(let i=0;i<3;i++){this.rect(-45+i*35,-108,9,80,'#58684e','#a3ab8c');this.rect(-42+i*35,-119,5,22,'#344747');this.rect(-53+i*35,-72,12,9,'#73805e');}
  this.rect(-60,-18,120,17,'#334c4b','#8ca087');this.text('DOTATION / 6',0,-146,9,'#d2d8b6','center');
 }else if(p.kind==='natal-unit'){
  this.path([[-93,-16],[-83,-73],[71,-73],[86,-16]],'#aab8ab','#d3d9c3');
  this.rect(-83,-20,159,21,'#6e8580','#c3ccae');this.rect(-74,-25,146,9,'#d6d9c0');this.rect(-55,-6,12,9,'#465e60');this.rect(59,-6,12,9,'#465e60');
  const gr=g.createLinearGradient(-80,-98,75,-30);gr.addColorStop(0,'#91c4c156');gr.addColorStop(.7,'#27586365');gr.addColorStop(1,'#b2d0c188');
  this.path([[-85,-76],[-68,-109],[49,-109],[78,-74],[74,-27],[-78,-27]],gr,'#b7d0be',2);
  this.line(-55,-98,32,-98,'#d6e9d277',2);this.rect(87,-86,24,35,'#c2cdbb','#7c9993');this.rect(91,-81,16,19,'#143b48');this.line(100,-50,100,-8,'#6c8985',5);
  this.text('UNITÉ OBSTÉTRICALE',0,-123,9,'#d4dfc8','center');
 }else if(p.kind==='white-monitor'){
  this.line(0,0,0,-73,'#aabdaf',6);this.rect(-26,-103,53,37,'#ced5c0','#e1e2cc');this.rect(-20,-97,41,24,'#12343e');
  this.path([[-17,-83],[-8,-83],[-4,-90],[0,-77],[5,-85],[18,-85]],null,'#80caba',1.4);
 }else if(p.kind==='sealed-egg'){
  this.ellipse(0,1,23,8,'#18251b');this.ellipse(0,-33,22,34,'#536448');this.ellipse(-5,-39,15,24,'#83907366');
  this.path([[-18,-47],[-6,-68],[0,-56],[7,-68],[19,-45],[3,-50]],'#3f5543','#a2a58a',1.1);
  for(let i=0;i<6;i++)this.line(-17+i*6,-42,-19+i*7,-5,'#2c423588',1.4);

 }else if(p.kind==='egg-bed'){
  const w=p.footprint.w/2;
  this.ellipse(0,0,w,15,'#23372ecc');
  for(let x=-w;x<w;x+=29)this.path([[x,-8],[x+15,-14],[x+36,1],[x+11,12]],'#415940','#85917366');
 }else{
  // Seated fossil merged into its station, not a standing humanoid statuette.
  this.ellipse(0,0,156,29,'#273b34');this.ellipse(0,-9,144,25,'#61745b');this.ellipse(0,-17,124,21,'#384f44');
  for(let i=0;i<18;i++){const a=i*Math.PI/9;this.line(Math.cos(a)*81,-15+Math.sin(a)*12,Math.cos(a)*149,-4+Math.sin(a)*26,'#93a27c',3);}
  this.path([[-57,-15],[-78,-62],[-69,-120],[-54,-162],[-23,-177],[12,-157],[34,-110],[71,-68],[50,-23]],'#5d7259','#a7b08c',2);
  // Spine, arched chest and the opened fossil rib cage.
  this.line(-45,-151,-25,-57,'#adb799',10);
  for(let y=-137,n=0;y<-65;y+=10,n++)this.path([[-41,y],[-11,y-5],[20+n*3,y+15],[13+n*3,y+22],[-22,y+6]],null,'#b0b895',3);
  this.ellipse(5,-104,15,21,'#111f20');this.path([[1,-125],[14,-119],[18,-99],[7,-88],[-6,-106]],'#1e2e29','#71896d',2);
  this.ellipse(-43,-169,35,26,'#8b9c79');this.ellipse(-49,-177,29,14,'#a0ad88');
  this.path([[-17,-176],[16,-159],[28,-129],[15,-115],[3,-130],[-1,-149],[-21,-149]],'#809472','#b9c19b',2);
  // Arms rest forwards at the station, legs remain folded into the seat.
  this.line(-45,-119,-5,-63,'#899b76',14);this.line(-5,-63,68,-82,'#a7b58e',11);
  this.line(-21,-145,29,-111,'#849970',12);this.line(29,-111,72,-102,'#acb890',9);
  this.path([[-24,-61],[27,-45],[57,-21],[106,-20]],null,'#8fa47d',17);
  // Angled biomechanical sight/console attached to the fossil chair.
  this.path([[53,-73],[53,-105],[109,-159],[138,-143],[86,-86],[89,-70]],'#5c765e','#a6b38c',2);
  this.path([[105,-161],[136,-190],[161,-166],[139,-143]],'#7a9070','#b6c198',2);
  for(let i=0;i<5;i++)this.line(64+i*11,-99-i*11,87+i*11,-77-i*11,'#a3b38b',3);
  this.ellipse(149,-176,22,12,'#293d32');this.ellipse(149,-176,12,7,'#111f1d');
  this.text('POSTE DU PILOTE',0,-222,10,'#bac7a6','center');

 }
 g.restore();
};

const beforePlants=P.prop;
P.prop=function(p,r,s){
 if(p.kind!=='planter')return beforePlants.call(this,p,r,s);
 const q=this.project(p.x,p.z),k=this.scale,g=this.ctx,w=(p.footprint?.w||210)/2;
 g.save();g.translate(q.x,q.y);g.scale(k,k);
 this.ellipse(0,3,w+5,16,'#13262099');
 this.path([[-w,-34],[w,-34],[w-8,2],[-w+8,2]],'#4d6552','#9da485',1.5);
 this.ellipse(0,-34,w,13,'#2b3429','#77816a');
 for(let x=-w+14;x<w;x+=27){const h=32+Math.abs(Math.sin(x)) *18;
   this.line(x,-35,x,-35-h,'#8caa64',2);
   for(let n=0;n<3;n++){let y=-42-n*10;this.ellipse(x-8,y,11,4,'#567b47');this.ellipse(x+7,y-5,10,4,'#88a559');}
 }
 g.restore();
};
const baseBg=P.background,baseGround=P.roadGround,baseForeground=P.foreground,baseArchitecture=P.architecture;
P.background=function(r,s){
 if(r.id==='greenhouse'){
  const g=this.ctx,W=this.w,H=this.h,k=this.scale;
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#142833');bg.addColorStop(.65,'#677763');bg.addColorStop(1,'#2c453b');g.fillStyle=bg;g.fillRect(0,0,W,H);
  // Curved glass panels supported by continuous arcs, not a flat warehouse roof.
  for(let n=-4;n<9;n++){const cx=n*230*k-this.cam*k*.3;
   g.beginPath();g.moveTo(cx-190*k,H*.69);g.bezierCurveTo(cx-160*k,-40*k,cx+140*k,-40*k,cx+190*k,H*.69);
   g.strokeStyle='#9aaaa288';g.lineWidth=7*k;g.stroke();
   for(let m=1;m<5;m++){let y=H*.1+m*H*.11;this.line(cx-170*k,y,cx+170*k,y,'#b9c9b64a',2*k);}
  }
  for(let n=0;n<95;n++){const x=(n*137-this.cam*k*.14)%(W+80),y=(n*79)%(H*.65);this.line(x,y,x-7*k,y+23*k,'#c5d6c525',1);}
  this.rect(0,H*.64,W,H*.07,'#2f4e49','#91a395');return;
 }
 if(r.kind!=='derelict')return baseBg.call(this,r,s);
 const g=this.ctx,W=this.w,H=this.h,k=this.scale;
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#081216');bg.addColorStop(.52,'#263c36');bg.addColorStop(1,'#111f21');g.fillStyle=bg;g.fillRect(0,0,W,H);
 const span=410*k,offset=(this.cam*k*.9)%span;
 for(let x=-span-offset;x<W+span;x+=span){
  for(let n=0;n<7;n++){g.beginPath();g.moveTo(x-110*k+n*10*k,H*.72);g.bezierCurveTo(x-50*k,H*.38,x+80*k,H*.15,x+260*k+n*8*k,H*.02);
   g.strokeStyle=n%2?'#70816a38':'#1a2d2a';g.lineWidth=(n%2?4:15)*k;g.stroke();}
  for(let y=H*.20;y<H*.64;y+=41*k)this.line(x+20*k,y,x+65*k,y+17*k,'#6e896026',3*k);
 }
 const mist=g.createRadialGradient(W*.5,H*.67,0,W*.5,H*.67,W*.6);mist.addColorStop(0,'#6b84613f');mist.addColorStop(1,'transparent');g.fillStyle=mist;g.fillRect(0,0,W,H);
};
P.roadGround=function(sim){
 if(sim.room.kind!=='derelict')return baseGround.call(this,sim);
 const g=this.ctx,W=this.w,H=this.h,k=this.scale,fy=H*.68;
 const gr=g.createLinearGradient(0,fy,0,H);gr.addColorStop(0,'#344b3a');gr.addColorStop(1,'#142827');g.fillStyle=gr;g.fillRect(0,fy,W,H-fy);
 for(let n=0;n<8;n++){const y=fy+n*n*4*k;g.beginPath();g.moveTo(0,y);for(let x=0;x<W+80;x+=80)g.lineTo(x,y+Math.sin(x*.008+this.cam*.001+n)*7*k);g.strokeStyle=n%2?'#7f906a38':'#0f2324';g.lineWidth=3*k;g.stroke();}
 for(let i=0;i<24;i++){const x=(i*83-this.cam*k*.95)%(W+100);this.line(x,fy+20*k+(i%5)*35*k,x+39*k,fy+28*k+(i%5)*35*k,'#73826235',2*k);}
};
P.foreground=function(r,s){
 if(r.id==='greenhouse')return;
 if(r.kind!=='derelict')return baseForeground.call(this,r,s);
 const k=this.scale;this.path([[0,0],[15*k,0],[32*k,this.h*.22],[12*k,this.h],[0,this.h]],'#0d201e77');
};
P.architecture=function(r,s){
 if(r.id==='greenhouse')return;
 baseArchitecture.call(this,r,s);
 if(r.id!=='armory')return;
 const k=this.scale,g=this.ctx,fy=this.h*.681;
 for(let x=240;x<r.width-200;x+=340){const p=this.project(x,.2),xx=p.x;
  this.rect(xx-80*k,fy-300*k,160*k,175*k,'#10252b','#6f8d80');
  for(let n=0;n<7;n++)this.line(xx-73*k+n*22*k,fy-295*k,xx-73*k+n*22*k,fy-130*k,'#506e6555',1);
  for(let y=fy-285*k;y<fy-130*k;y+=19*k)this.line(xx-77*k,y,xx+77*k,y,'#77907a33',1);
  this.ellipse(xx,fy-264*k,27*k,20*k,'#778263');this.rect(xx-31*k,fy-256*k,62*k,9*k,'#90987b');
  this.path([[xx-27*k,fy-230*k],[xx-41*k,fy-208*k],[xx-30*k,fy-154*k],[xx+30*k,fy-154*k],[xx+41*k,fy-208*k],[xx+27*k,fy-230*k]],'#52684f','#b0b492');
  this.line(xx-24*k,fy-224*k,xx+21*k,fy-161*k,'#a5ac86',4*k);
  this.rect(xx-31*k,fy-174*k,20*k,17*k,'#314c43','#7e977d');this.rect(xx+11*k,fy-174*k,20*k,17*k,'#314c43','#7e977d');
  this.text('PROTECTION / STOCK',xx,fy-310*k,9*k,'#acbaa0','center');
 }
};

P.armoryEffects=function(sim){
 const k=this.scale,g=this.ctx,fl=sim.flameVisual;
 if(fl?.ttl>0&&fl.room===sim.s.room){
  const source={x:fl.x,z:fl.z},start=this.project(fl.x,fl.z),angle=Math.atan2(fl.az,fl.ax),points=[[start.x,start.y-44*k]];
  for(let i=0;i<=10;i++){
   const a=angle-.42+i*.084,end={x:fl.x+Math.cos(a)*350,z:fl.z+Math.sin(a)*350/600};
   const wall=C.segmentHit(sim.collisionRoom,source,end),t=wall?Math.max(0,wall.t-.006):1;
   const pt=this.project(fl.x+(end.x-fl.x)*t,fl.z+(end.z-fl.z)*t);points.push([pt.x,pt.y-44*k]);
  }
  this.path(points,'#ee993e55');for(let i=1;i<points.length;i++)this.line(start.x,start.y-44*k,points[i][0],points[i][1],i%2?'#e9b06377':'#f7d18b55',5*k);
 }
 for(const q of sim.s.armory.projectiles){const v=this.project(q.x,q.z),arc=Math.sin(q.distance/560*Math.PI)*35*k;this.circle(v.x,v.y-43*k-arc,4*k,'#eacb81');this.ellipse(v.x,v.y,7*k,2*k,'#111d24');}
 const b=sim.blastVisual;if(b?.ttl>0&&b.room===sim.s.room){const v=this.project(b.x,b.z);g.save();g.globalAlpha=b.ttl/.5;this.glow(v.x,v.y-35*k,110*k,'#d49f5377');this.ellipse(v.x,v.y,135*k,30*k,'#b59b5622');g.restore();}
};
})(globalThis);
