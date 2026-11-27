/* v0.10 — source-aware silhouettes and architectural seams.
   Original Canvas art. Screen costumes inspire shape/color; likeness and set metrics are not certified. */
(function(root){'use strict';const {clamp}=root.CovenantCore;
class FidelityRenderer extends root.CovenantRenderer {
 background(){
  const r=this.engine.room,a=r.visual?.architecture,c=this.c,W=this.W;
  if(a==='whiteroom'){
   this.rect(0,0,W,760,'#d4d7d1');this.rect(0,0,W,130,'#e5e5de');this.rect(0,490,W,270,this.grad(0,490,0,760,[[0,'#d8d9d3'],[1,'#afbbb8']]));
   const x=180-this.camera*.45;this.rect(x,140,Math.max(590,W*.57),335,'#899e9c');this.rect(x+15,154,Math.max(560,W*.57-30),302,this.grad(0,154,0,460,[[0,'#b6c3c2'],[.6,'#abb9ae'],[1,'#506c64']]));
   for(let i=0;i<9;i++)this.poly([[x+i*160-120,455],[x+i*160,255+i%3*40],[x+i*160+140,455]],i%2?'#5a716c':'#7e9288');
   this.line([[0,489],[W,489]],'#a5b1ad',3);for(let x=-this.camera*.3;x<W+200;x+=190)this.line([[x,500],[x-80,760]],'#98a7a146',1);return;
  }
  if(a==='sailaccess'){
   this.rect(0,0,W,760,'#06101b');for(let i=0;i<85;i++){const x=(i*193.3-this.camera*.08)%(W+80),y=20+(i*67)%455;this.ellipse(x,y,.7+i%3*.2,.7,'#b0c3c799');}
   const sx=1070-this.camera*.22;this.poly([[sx-740,115],[sx+430,35],[sx+580,495],[sx-610,405]],this.grad(sx,100,sx,500,[[0,'#503e29'],[.4,'#c3a160'],[1,'#665638']]),'#ddc995',4);
   for(let i=0;i<24;i++){let x=sx-730+i*52;this.line([[x,115-i*3],[x+130,406+i*3]],'#d8bd7d5c',2);}for(let i=0;i<10;i++)this.line([[sx-720+i*12,130+i*29],[sx+450+i*13,55+i*45]],'#201f2170',2);
   this.rect(0,645,W,20,'#85969a');this.rect(0,665,W,95,'#101f2b');for(let x=-this.camera;x<W+230;x+=200){this.line([[x,665],[x+90,752],[x+190,665]],'#46606b',8);this.line([[x,490],[x,644]],'#6b838b',6);}this.line([[0,490],[W,490]],'#adc1c3',5);return;
  }
  super.background();
  if(['funeral','evaprep','landerhold','landercockpit','landermed','washroom','colonistvault'].includes(a)){
   this.rect(0,45,W,462,this.grad(0,45,0,507,[[0,'#293e43'],[.75,'#5b716f'],[1,'#253d43']]));
   const step=a==='colonistvault'?300:380;for(let x=-this.camera;x<W+step;x+=step){this.line([[x,88],[x+30,65],[x+step-30,65],[x+step,90],[x+step,508]],'#c1ccc055',7);this.line([[x+15,495],[x+step-15,495]],'#adbaaa80',5);}
   this.rect(0,505,W,140,this.grad(0,505,0,645,[[0,'#253e45'],[1,'#3d5659']]));
   for(let x=-this.camera;x<W+100;x+=95)this.line([[x,530],[x-25,640]],'#9aaea325',2);
   if(a==='funeral'){const x=1180-this.camera*.55;this.rect(x-190,90,370,395,'#152b32');this.poly([[x-175,473],[x-175,138],[x-140,105],[x+135,105],[x+169,138],[x+169,473]],'#637577','#c6caba',5);this.line([[x,105],[x,473]],'#243c41',5);this.text('SAS EXTÉRIEUR / CONDAMNÉ',x,340,12,'#e4d5ad','center');}
   if(a==='landercockpit'){const x=920-this.camera*.30;this.poly([[x-340,470],[x-300,138],[x-150,90],[x+195,90],[x+330,169],[x+350,470]],'#678e8c','#d2dbcc',8);this.poly([[x-270,370],[x-50,199],[x+99,350],[x+200,220],[x+330,425]],'#577368');this.line([[x-26,100],[x-40,448]],'#324d56',13);}
   if(a==='colonistvault'){for(let i=0;i<20;i++){let x=80+i*180-this.camera*.34;for(let j=0;j<3;j++){this.rect(x,155+j*95,125,61,'#213940');this.rect(x+10,160+j*95,105,46,'#91b8aa42');this.ellipse(x+100,201+j*95,3,3,'#b7d6ba');}}this.text('CRYOVAULT / POPULATION COLONIALE',Math.max(30,420-this.camera*.4),117,16,'#ccdad2');}
   if(a==='washroom'){for(let x=190-this.camera;x<W+350;x+=310){this.rect(x,173,220,316,'#85a8a142');this.line([[x,160],[x+220,160],[x+220,497]],'#b7cfbf',6);this.line([[x+95,230],[x+95,181],[x+142,181]],'#c5d3cb',7);this.line([[x,495],[x+230,495]],'#d4d8c5',4);}}
   if(a==='evaprep')this.text('EVA / CONTRÔLE DES ATTACHES',Math.max(25,320-this.camera*.4),125,15,'#d2dccf');
  }
  if(['davidquarters','musicroom'].includes(a)){
   this.rect(0,20,W,493,this.grad(0,20,0,510,[[0,'#1c2424'],[.8,'#5c6251'],[1,'#283b31']]));for(let x=-this.camera*.75-80;x<W+350;x+=330){this.line([[x,506],[x+12,208],[x+90,109],[x+224,111],[x+305,212],[x+310,509]],'#a4a68b40',23);this.line([[x+38,509],[x+47,227],[x+114,144]],'#122e2b',8);}this.rect(0,515,W,130,'#3b493b');
  }
 }
 portal(e){
  const E=this.engine,r=E.room,t=e.threshold;if(!t)return super.portal(e);const c=this.c,p=this.project(e.x,e.z),ok=E.exitAvailable(e),col=ok?'#b7ccc0':'#cfad7f';if(p.x<-290||p.x>this.W+290)return;
  if(['path','ramp','embarkation'].includes(t.type)){
   c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);this.poly([[-62,21],[-25,-56],[27,-56],[66,21]],'#91a9a223');
   if(t.type==='ramp'){this.poly([[-70,5],[-43,-96],[43,-96],[70,5]],'#617979','#c4ccbb',3);for(let i=0;i<8;i++)this.line([[-66+i*3,-i*12],[66-i*3,-i*12]],'#b1c0b28a',3);this.line([[-80,5],[-49,-97]],'#2b444b',9);this.line([[80,5],[49,-97]],'#2b444b',9);}
   else if(t.type==='embarkation'){this.line([[-89,12],[89,12]],'#b3c9b5',4);this.line([[-70,-40],[-70,12],[70,12],[70,-40]],'#668383',5);this.text('EMBARQUEMENT',0,-51,10,col,'center');}
   else{for(let j=0;j<3;j++)this.line([[-15,-16-j*14],[0,-25-j*14],[15,-16-j*14]],col+'88',2);}
   if(E.distance(e)<220)this.text(E.rooms.get(e.to).name,0,48,11,col,'center');c.restore();return;
  }
  const rear=t.support==='rear-wall',foot=rear?(r.view==='side'?512:this.foot(.07)):p.y,bio=t.material==='biomechanical',stone=t.material==='stone'||bio,duct=t.type==='duct-mouth',stair=t.type==='stairs';const w=duct?146:stair?153:123,h=duct?104:226,top=foot-h;
  c.save();
  // Rear-plane wall remains joined to the architecture; the floor apron ends at the actual E contact.
  if(rear){this.poly([[p.x-w*.55,foot],[p.x+w*.55,foot],[p.x+79,p.y+9],[p.x-79,p.y+9]],stone?'#78806d22':'#a5b6ac22');this.line([[p.x-w*.55,foot],[p.x-79,p.y+9]],'#98afa546',2);this.line([[p.x+w*.55,foot],[p.x+79,p.y+9]],'#98afa546',2);}
  const sw=rear?w+140:195;this.rect(p.x-sw/2,75,sw,foot-75,stone?this.grad(p.x-sw/2,0,p.x+sw/2,0,[[0,'#37473b'],[.5,'#65705b'],[1,'#35443a']]):this.grad(p.x-sw/2,0,p.x+sw/2,0,[[0,'#2c434a'],[.5,'#6b807c'],[1,'#253d46']]));
  if(bio){for(let y=104;y<foot;y+=24){this.line([[p.x-sw/2,y+6],[p.x-sw*.31,y],[p.x+sw*.31,y],[p.x+sw/2,y+6]],'#969d8170',6);}}
  else if(stone){for(let y=117;y<foot;y+=59)this.line([[p.x-sw/2,y],[p.x+sw/2,y+3]],'#151f2066',3);}
  else{this.line([[p.x-sw/2+5,77],[p.x-sw/2+5,foot]],'#aebbae6a',5);this.line([[p.x+sw/2-5,77],[p.x+sw/2-5,foot]],'#132a33',8);this.line([[p.x-sw/2,77],[p.x+sw/2,77]],'#b2bcb17a',6);}
  this.poly([[p.x-w/2-10,foot],[p.x-w/2-10,top+20],[p.x-w/2+9,top],[p.x+w/2-9,top],[p.x+w/2+10,top+20],[p.x+w/2+10,foot]],'#061821',stone?'#b3b49a':'#b1c7bf',4);this.rect(p.x-w/2,top+18,w,h-18,'#0b2028');
  const door=e.doorId&&E.state.doors[e.doorId],amount=door?.amount??1;
  c.save();c.beginPath();c.rect(p.x-w/2,top+18,w,h-18);c.clip();
  if(stair){for(let j=0;j<8;j++){const y=foot-j*19;this.line([[p.x-w/2+j*6,y],[p.x+w/2-j*6,y]],'#aab9a97f',5);}}
  if(door){for(const dir of [-1,1]){const xx=dir<0?p.x-w/2-amount*w*.53:p.x+amount*w*.53;this.rect(xx,top+18,w/2,h-18,stone?'#687061':'#57716f');for(let j=0;j<7;j++)this.line([[xx+3,top+37+j*26],[xx+w/2-3,top+37+j*26]],stone?'#2d3d36':'#a2b5a586',3);}}
  if(duct)for(let j=0;j<5;j++){let y=top+30+j*17;this.line([[p.x-w/2-amount*w,y],[p.x+w/2-amount*w,y]],'#a3b8ab',4);}
  c.restore();this.line([[p.x-w/2-10,foot+2],[p.x+w/2+10,foot+2]],'#c1c5ad',5);
  if(!stone)this.ellipse(p.x+w/2+23,top+h*.7,4,4,col);
  if(door?.stress>0){const k=door.stress/(E.doorDefs.get(e.doorId).breakTime||1);this.line([[p.x-w/2,foot+8],[p.x+w/2,foot+8]],'#423735',4);this.line([[p.x-w/2,foot+8],[p.x+w/2-k*w,foot+8]],'#dfbc7d',4);}
  if(E.distance(e)<230){this.text(E.rooms.get(e.to).name.length>35?E.rooms.get(e.to).name.slice(0,33)+'…':E.rooms.get(e.to).name,clamp(p.x,125,this.W-125),p.y+32,11,col,'center');this.text(door?(door.open?(amount<.94?'OUVERTURE':'OUVERT'):'FERMÉ'):stair?'CHANGEMENT DE NIVEAU':'E · PASSAGE',p.x,top-13,10,col,'center');}
  c.restore();
 }
 gun(id,x=19,y=-73,scale=1){const c=this.c;c.save();c.translate(x,y);c.scale(scale,scale);const dark='#17292e',mid='#50686b',bright='#a4b8ae';
  if(['beretta','inox','eaa'].includes(id)){this.poly([[0,-8],[28,-8],[34,-4],[32,1],[17,1],[12,18],[5,18],[8,1],[0,1]],id==='inox'?'#bfc9bf':dark,bright,1.2);this.rect(4,-12,20,4,mid);this.line([[22,-7],[29,-7]],'#deccb3',1.5);}
  else if(id==='shotgun'){this.poly([[-10,-1],[4,-5],[14,-8],[39,-8],[44,-2],[16,2],[9,7],[-14,8]],'#4b5044',bright,1);this.rect(37,-9,42,4,dark);this.rect(35,-3,41,3,mid);this.rect(43,-5,18,8,'#808373');for(let i=0;i<5;i++)this.line([[45+i*3,-4],[45+i*3,2]],dark,1);this.line([[14,1],[13,15]],dark,6);}
  else if(id==='ar15'){this.poly([[-11,-6],[5,-7],[13,-11],[35,-11],[40,-6],[69,-6],[69,0],[31,0],[22,3],[8,2],[-11,6]],mid,bright,1);this.rect(33,-1,10,22,dark);this.line([[17,1],[12,15]],dark,6);this.rect(69,-6,12,3,dark);this.rect(28,-16,12,4,bright);this.line([[48,-4],[62,-4]],'#c4d0bd',1);}
  else { // Bullpup: magazine is behind the trigger, not an AR magazine ahead of it.
   this.poly([[-9,-7],[17,-11],[37,-9],[51,-4],[72,-4],[75,0],[48,3],[30,0],[21,5],[-9,4]],mid,bright,1.1);this.rect(-1,2,11,19,dark);this.line([[23,2],[24,14]],dark,6);this.rect(13,-19,26,5,dark);this.line([[14,-14],[14,-8],[36,-8],[36,-14]],bright,2);
   if(id==='sl40'){this.rect(38,6,37,9,dark);this.rect(42,14,8,12,mid);for(let i=0;i<4;i++)this.line([[45+i*6,7],[45+i*6,13]],bright,1);}
  }c.restore();}
 human(actor,role='daniels',moving=false){
  const E=this.engine,pr=E.appearance(actor,role),c=this.c,p=this.project(actor.x,actor.z);if(E.state.hidden&&role==='daniels'&&!actor.id)return;if(p.x<-200||p.x>this.W+200)return;
  // Keep previously tested special poses; recoloring is handled in their source routines.
  if(role==='daniels'&&(E.room.crawl||E.grip)){super.human(actor,role,moving);return;}
  const t=E.state.time,walking=moving&&E.motion?.moving||actor.phase==='walk',stride=walking?Math.sin(t*11)*14:Math.sin(t*1.7)*.7,face=actor.facing||1,build=pr.build||1;
  this.ellipse(p.x,p.y+6,23*p.s*build,6*p.s,'#06101599');c.save();c.translate(p.x,p.y-(actor.y||0));c.scale(p.s*face,p.s);
  this.line([[-7,-44],[-10-stride*.4,-23],[-11+stride*.7,-5]],pr.pants,12);this.line([[8,-44],[12+stride*.4,-23],[13-stride*.7,-5]],pr.pants,13);this.line([[-11+stride*.7,-4],[-22+stride*.7,-4]],'#192a2c',8);this.line([[13-stride*.7,-4],[23-stride*.7,-4]],'#203334',8);
  if(pr.cloak)this.poly([[-16,-93],[-31,-23],[-35,-8],[8,-16],[24,-5],[22,-90]],'#7b7e69','#a6a98e55',1);
  this.poly([[-15*build,-89],[-9,-94],[10,-92],[17*build,-87],[20*build,-47],[8,-40],[-16,-42],[-20*build,-67]],this.grad(-20,-80,20,-42,[[0,pr.coat],[.62,pr.coat],[1,'#334951']]),'#c4cec057',1);
  this.line([[0,-89],[0,-50]],'#c3cec48a',1.5);this.rect(-17,-51,34,5,'#283c3a');this.rect(12,-53,8,11,'#4f5950');this.rect(-13,-79,8,10,'#bbbf9f');this.rect(5,-80,10,7,'#364d50');this.text('C',-9,-72,6,'#254347','center');
  if(pr.vest){this.rect(-15,-83,28,25,'#394b43');for(let i=0;i<3;i++)this.rect(-13+i*9,-65,7,13,'#687160');this.line([[-11,-88],[-11,-52]],'#aeb49b',3);}
  const eva=pr.head==='eva';if(eva){this.rect(-25,-80,10,40,'#657a78');this.line([[-17,-89],[-13,-51],[14,-51],[18,-88]],'#b8c6b0',4);for(let i=0;i<5;i++)this.line([[-17,-71+i*4],[16,-71+i*4]],'#759593',1);}
  const h=pr.skin;this.rect(-5,-98,11,10,h);this.poly([[-10,-103],[-10,-111],[-5,-119],[5,-118],[12,-112],[12,-106],[16,-103],[11,-100],[9,-92],[2,-91],[-6,-95]],h,'#695b5040',1);this.ellipse(-8,-103,3,5,h);this.line([[7,-108],[11,-107]],'#343733',1.3);this.line([[8,-109],[12,-109]],pr.hair,1.6);this.line([[8,-98],[12,-98]],'#8a6855',1);
  if(pr.head==='long'){this.poly([[-12,-101],[-13,-116],[-3,-122],[10,-118],[13,-111],[3,-110],[-1,-101],[-8,-87],[-15,-88]],pr.hair);this.line([[-9,-114],[-10,-91]],'#d3c4a785',2);}
  else if(pr.head==='tied'){this.poly([[-12,-100],[-13,-114],[-5,-122],[7,-120],[12,-111],[1,-111],[-5,-102]],pr.hair);this.ellipse(-17,-110,6,9,pr.hair);}
  else if(pr.head==='bob'){this.poly([[-13,-94],[-15,-111],[-8,-122],[6,-121],[12,-114],[8,-109],[-5,-108],[-4,-94]],pr.hair);}
  else{this.poly([[-12,-103],[-12,-114],[-5,-121],[7,-120],[13,-113],[10,-109],[2,-112],[-4,-109],[-8,-100]],pr.hair);if(pr.head==='slick')this.line([[-9,-116],[6,-117],[10,-113]],'#c4b79755',1);}
  if(pr.beard)this.poly([[-6,-100],[0,-98],[10,-100],[10,-94],[3,-90],[-5,-94]],pr.hair);
  if(pr.head==='cap'){this.poly([[-12,-113],[-11,-125],[7,-126],[14,-117],[24,-114],[24,-111],[-11,-111]],pr.coat,'#b2beb27a',1);this.poly([[-13,-115],[-17,-86],[-4,-88],[-5,-113]],pr.coat);this.rect(1,-122,6,5,'#d0d2b1');}
  if(pr.head==='hat'){this.ellipse(0,-118,27,5,'#898672');this.poly([[-13,-119],[-12,-134],[4,-131],[13,-134],[15,-119]],'#81816b');this.line([[-13,-120],[15,-120]],'#344640',4);}
  if(pr.necklace){this.line([[-7,-91],[0,-71],[7,-91]],'#c5c2b1',1);this.line([[0,-73],[0,-65]],'#d1c9b6',2);this.line([[-2,-73],[3,-73]],'#cfc4ac',1.4);}
  if(eva){this.ellipse(1,-104,21,25,'#364e5575');c.beginPath();c.ellipse(1,-104,21,25,0,0,Math.PI*2);c.strokeStyle='#b6c8c1';c.lineWidth=4;c.stroke();this.ellipse(5,-104,16,20,'#3e6a6880');this.line([[-12,-89],[17,-89]],'#cad4ca',4);this.line([[-13,-119],[12,-124],[17,-116]],'#b5ded8cc',2);this.rect(-14,-133,11,6,'#d2e4d4');}
  // Anatomical left-arm state is stored in the profile, not selected by the screen direction.
  this.line([[-12,-86],[-20,-66],[-16,-48]],pr.coat,8);if(!pr.missingLeft)this.ellipse(-16,-46,4,5,h);else{this.line([[-20,-66],[-17,-55]],pr.coat,9);this.rect(-20,-57,7,4,'#d0cdbc');}
  const weapon=role==='daniels'&&!actor.id?(E.state.weapon&&!E.detector&&!E.work&&!E.scanning&&!E.healing&&!E.rotating&&!E.room.safePresentation?E.currentWeapon().id:null):pr.gun;
  if(weapon){this.line([[11,-86],[21,-70],[35,-72]],pr.coat,9);this.drawWeapon(actor,p,()=>{this.gun(weapon);if(!pr.missingLeft)this.line([[-11,-79],[3,-63],[39,-70]],pr.coat,8);});}
  else{this.line([[13,-86],[20,-66],[17,-46]],pr.coat,9);this.ellipse(17,-44,4,5,h);}
  if(E.scanning&&role==='daniels'){this.line([[11,-84],[28,-68],[41,-76]],pr.coat,8);this.rect(30,-88,24,19,'#24434a');this.rect(35,-84,14,10,'#a3d5bd');}
  if(E.rotating&&role==='daniels'){this.line([[10,-84],[28,-70],[40,-76]],pr.coat,8);this.line([[-10,-81],[9,-61],[34,-65]],pr.coat,8);}
  if(E.shoveCooldown>1.08&&role==='daniels'){this.line([[10,-83],[43,-72],[68,-74]],pr.coat,10);}
  c.restore();
 }
 referenceProp(o){
  const kinds=['chair','wastecase','recordingscreen','eaarack','utilityknife','flare','urnplatform','fuelcase','optics','damagedpod','embryotray','bandages','fieldradio','navigationdisplay','cabindrawing','specimencage','urnrack','eggsupport','identification'];if(!kinds.includes(o.kind))return false;
  const p=this.propPoint(o),c=this.c,w=o.w,h=o.h;if(p.x<-w||p.x>this.W+w)return true;c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);
  switch(o.kind){
   case'chair':this.line([[-w*.3,0],[-w*.32,-h*.45],[w*.2,-h*.45],[w*.3,0]],'#839990',7);this.poly([[-w*.30,-h*.47],[-w*.39,-h*.98],[w*.18,-h],[w*.24,-h*.46]],'#2c444c','#a5b7ab',3);break;
   case'eaarack':this.rect(-w*.5,-h,w,h,'#263e45');this.gun('eaa',-w*.36,-h*.48,2.0);this.text('SÉCURITÉ',0,-h+14,8,'#bac8b5','center');break;
   case'utilityknife':this.rect(-w*.48,-h*.7,w*.96,h*.45,'#66786c');this.line([[-w*.3,-h*.5],[-w*.02,-h*.5]],'#2e4445',9);this.poly([[-w*.02,-h*.55],[w*.36,-h*.6],[w*.26,-h*.46],[-w*.02,-h*.45]],'#c0c5b3');break;
   case'flare':this.line([[-w*.18,-h*.32],[w*.22,-h*.6]],'#ba8b62',10);this.gun('beretta',-w*.32,-h*.3,1.25);this.rect(-w*.15,-h*.82,w*.3,11,'#bf7654');break;
   case'wastecase':case'fuelcase':this.rect(-w*.45,-h*.85,w*.9,h*.85,'#647b76');this.line([[-w*.4,-h*.9],[w*.4,-h*.9]],'#c4c9af',6);this.rect(-w*.25,-h*.55,w*.5,h*.23,o.kind==='fuelcase'?'#9e7757':'#aaa476');this.text(o.kind==='fuelcase'?'FUEL':'BIO',0,-h*.39,12,'#243b37','center');break;
   case'optics':this.rect(-w*.4,-h*.55,w*.8,h*.45,'#2b4346');this.line([[-w*.3,-h*.7],[w*.25,-h*.7]],'#96a893',12);this.ellipse(w*.24,-h*.7,9,10,'#345e66');this.line([[-w*.2,-h*.36],[w*.27,-h*.36]],'#c0c7b5',7);break;
   case'recordingscreen':case'navigationdisplay':case'cabindrawing':this.rect(-w*.5,-h,w,h,'#466362');this.rect(-w*.44,-h*.94,w*.88,h*.83,o.kind==='cabindrawing'?'#c4bea0':'#1a353e');
    if(o.kind==='recordingscreen'){this.poly([[-w*.28,-h*.13],[-w*.26,-h*.42],[0,-h*.53],[w*.24,-h*.38],[w*.29,-h*.13]],'#829b90');this.ellipse(0,-h*.67,w*.12,h*.18,'#c3a88e');this.poly([[-w*.11,-h*.69],[-w*.1,-h*.87],[w*.07,-h*.87],[w*.11,-h*.75]],'#443d31');this.text(o.referenceIds?.includes('ACOV-005')?'J. BRANSON / ARCHIVE':'SIGNAL / ARCHIVE',0,-h*.06,8,'#d1d8ba','center');}
    else if(o.kind==='cabindrawing'){this.line([[-w*.32,-h*.27],[-w*.32,-h*.59],[0,-h*.82],[w*.32,-h*.60],[w*.32,-h*.28],[-w*.32,-h*.27]],'#53634f',2);this.line([[0,-h*.65],[0,-h*.3]],'#6e7b5a',2);}
    else {for(let i=0;i<4;i++){const x=-w*.33+i*w*.2;this.ellipse(x,-h*.63,w*.04,h*.07,'#aac4ae');this.line([[x,-h*.55],[x+w*.14,-h*.31]],'#839d91',1);}this.text('ORIGAE-6 / DESTINATION',0,-h*.16,9,'#c1d0b7','center');}break;
   case'damagedpod':this.poly([[-w*.5,-h*.18],[-w*.42,-h*.83],[w*.4,-h*.85],[w*.5,-h*.26]],'#5b6862','#99aba0',3);this.poly([[-w*.39,-h*.3],[-w*.31,-h*.7],[w*.31,-h*.7],[w*.4,-h*.3]],'#262d29');this.line([[-w*.35,-h*.69],[-w*.12,-h*.35],[w*.1,-h*.61],[w*.32,-h*.3]],'#998679',3);break;
   case'embryotray':this.rect(-w*.5,-h,w,h,'#3e5c62');for(let i=0;i<24;i++){const x=-w*.42+i%6*w*.14,y=-h*.89+Math.floor(i/6)*h*.22;this.rect(x,y,w*.11,h*.16,'#729a9245');this.ellipse(x+w*.055,y+h*.08,3,5,'#b2bc9d');}break;
   case'bandages':this.rect(-w*.5,-h*.34,w,h*.34,'#3f5a5b');for(let i=0;i<3;i++)this.ellipse(-w*.22+i*w*.22,-h*.52,12,14,'#d5d6bd');this.rect(-w*.45,-h*.93,w*.26,h*.22,'#aebab1');break;
   case'fieldradio':this.rect(-w*.31,-h*.78,w*.62,h*.71,'#304c4e');this.line([[w*.19,-h*.7],[w*.24,-h*1.15]],'#c0c7b2',4);this.rect(-w*.2,-h*.67,w*.39,h*.21,'#abcbb7');for(let i=0;i<4;i++)this.line([[-w*.2,-h*.37+i*6],[w*.2,-h*.37+i*6]],'#8fa997',2);break;
   case'specimencage':this.rect(-w*.5,-h,w,h,'#112727');this.ellipse(0,-h*.40,w*.23,h*.22,'#8f9b7a');for(let i=0;i<7;i++)this.line([[-w*.5+i*w/6,-h],[-w*.5+i*w/6,0]],'#748876',4);this.line([[-w*.5,-h],[w*.5,-h]],'#bcc1a6',5);break;
   case'urnplatform':case'urnrack':for(let i=0;i<4;i++){const x=-w*.36+i*w*.24;this.rect(x-w*.07,-h*.70,w*.14,h*.58,'#697860');this.ellipse(x,-h*.7,w*.07,7,'#acb193');this.line([[x,-h*.1],[x,-h*.58]],'#283d36',2);}this.rect(-w*.5,-h*.08,w,h*.08,'#8c9476');break;
   case'eggsupport':this.poly([[-w*.5,0],[-w*.38,-h],[w*.34,-h],[w*.5,0]],'#52684f');this.ellipse(0,-h,w*.34,8,'#273f33');break;
   case'identification':this.line([[-w*.18,-h],[w*.22,-h],[-w*.18,-h*.21]],'#b8beaa',2);this.rect(-w*.25,-h*.34,w*.5,h*.28,'#b4baa6');this.text('SHAW',0,-h*.19,8,'#385548','center');break;
  }c.restore();return true;
 }

 prop(o){
  if(o.renderSuppressedByExit && this.engine.room.exits.some(e=>e.id===o.renderSuppressedByExit))return;
  if(o.renderSuppressedBy && this.engine.room.props.some(p=>p.id===o.renderSuppressedBy))return;
  if(this.referenceProp(o))return;
  const list=['shroud','evasuit','evahelmet','tether','repairtool','gunrack','harnessrack','glasspartition','medtray','bedroll','notebook','cloakstand','flute','shower','piano','teaset','classicalstatue','memorial','microscope','surgicaltray','coveredremains','recorder','necklace'];if(!list.includes(o.kind))return super.prop(o);
  const c=this.c,p=this.propPoint(o),w=o.w,h=o.h;if(p.x<-w||p.x>this.W+w)return;c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);
  if(o.mount==='floor-stand'){this.line([[0,0],[0,-h*.60]],'#718a86',6);this.line([[-w*.36,0],[w*.36,0]],'#aebcb0',7);}
  switch(o.kind){
   case'gunrack':this.rect(-w/2,-h,w,h,'#17323b');this.line([[-w/2,-h],[w/2,-h],[w/2,0],[-w/2,0],[-w/2,-h]],'#a0b5b0',5);['f90','ar15','shotgun','beretta'].forEach((k,i)=>this.gun(k,-w/2+24,-h+37+i*42,1.5));break;
   case'evasuit':this.line([[0,-h],[0,-h+18]],'#b8c9bb',5);this.poly([[-w*.28,-h*.78],[w*.28,-h*.78],[w*.33,-h*.42],[w*.2,-h*.35],[-w*.2,-h*.35]],'#536e72','#a4b8b1',2);for(const f of[-1,1]){this.line([[f*w*.23,-h*.7],[f*w*.42,-h*.45],[f*w*.39,-h*.28]],'#789087',17);this.line([[f*w*.14,-h*.36],[f*w*.15,-12]],'#4d686d',20);}this.ellipse(0,-h*.91,30,33,'#63827e');this.ellipse(5,-h*.93,23,22,'#294c52');this.line([[-22,-h*.70],[-20,-h*.37],[20,-h*.37],[22,-h*.70]],'#bec9b2',4);break;
   case'evahelmet':this.ellipse(0,-h*.47,w*.38,h*.45,'#567376');this.ellipse(5,-h*.5,w*.28,h*.33,'#294e55');this.line([[-w*.28,-h*.68],[0,-h*.86],[w*.21,-h*.72]],'#c4ebe1',3);this.rect(-w*.35,-10,w*.7,13,'#a6b7ac');break;
   case'tether':c.beginPath();c.ellipse(0,-h*.5,w*.30,h*.40,0,0,7);c.strokeStyle='#baac7b';c.lineWidth=6;c.stroke();this.line([[w*.27,-h*.64],[w*.40,-h*.38],[w*.3,-h*.26]],'#c7cfc1',6);break;
   case'repairtool':case'recorder':this.rect(-w*.4,-h*.7,w*.8,h*.6,'#354f54');this.rect(-w*.3,-h*.6,w*.48,h*.32,'#a2c4b5');this.line([[w*.32,-h*.52],[w*.48,-h*.85]],'#c0c9b8',6);break;
   case'shroud':case'coveredremains':this.line([[-w*.35,0],[-w*.35,-h*.35],[w*.35,-h*.35],[w*.35,0]],'#78908b',8);this.poly([[-w*.48,-h*.40],[-w*.39,-h*.86],[-w*.25,-h],[-w*.05,-h*.68],[w*.29,-h*.56],[w*.5,-h*.37]],'#c0c4b5','#e0dfc9',2);for(let i=0;i<5;i++)this.line([[-w*.3+i*w*.14,-h*.6],[w*(-.25+i*.14),-h*.37]],'#77887c',2);break;
   case'harnessrack':case'cloakstand':this.line([[0,0],[0,-h]],'#819186',5);this.line([[-w/2,-h],[w/2,-h]],'#a8b3a5',6);this.poly([[-w*.34,-h+10],[w*.34,-h+10],[w*.48,-18],[0,-30],[-w*.42,-10]],o.kind==='cloakstand'?'#828674':'#5d7069');this.line([[-w*.22,-h+15],[-w*.19,-35],[w*.2,-35],[w*.2,-h+15]],'#baa77b',5);break;
   case'glasspartition':case'shower':this.rect(-w/2,-h,w,h,'#afc9bc23');this.line([[-w/2,0],[-w/2,-h],[w/2,-h],[w/2,0]],'#b9cabb',5);this.line([[-w*.3,-h*.8],[w*.1,-h*.3]],'#c9ddd040',12);break;
   case'bedroll':this.ellipse(0,-13,w*.5,18,'#686d58');this.rect(-w*.5,-h,w*.3,h,'#b2b19a');this.line([[-w*.12,-22],[w*.42,-18]],'#949680',2);break;
   case'notebook':case'flute':case'necklace':case'medtray':case'surgicaltray':case'teaset':this.line([[-w*.38,0],[-w*.38,-h*.4],[w*.38,-h*.4],[w*.38,0]],'#526c69',5);this.poly([[-w*.5,-h*.40],[-w*.45,-h*.58],[w*.4,-h*.58],[w*.5,-h*.4]],'#acb1a1','#d4d4bb',1);
    if(o.kind==='notebook'){this.poly([[-w*.3,-h*.60],[-w*.32,-h*.95],[w*.28,-h*.93],[w*.3,-h*.6]],'#c6bea1','#625947',2);for(let i=0;i<4;i++)this.line([[-w*.2,-h*.68-i*4],[w*.18,-h*.68-i*4]],'#696d54',1);}
    else if(o.kind==='flute'){this.line([[-w*.36,-h*.61],[w*.35,-h*.75]],'#968060',6);for(let i=0;i<6;i++)this.ellipse(-w*.24+i*w*.09,-h*.64-i*1.5,2,2,'#252c21');}
    else if(o.kind==='necklace'){c.beginPath();c.ellipse(0,-h*.75,18,16,0,0,7);c.strokeStyle='#d0c1a0';c.lineWidth=2;c.stroke();this.line([[0,-h*.60],[0,-h*.41]],'#bbb8a4',3);}
    else if(o.kind==='teaset'){this.ellipse(0,-h*.73,18,15,'#d6ddd3');this.ellipse(28,-h*.63,9,6,'#eef0dc');this.line([[12,-h*.74],[25,-h*.8]],'#ccd3c5',5);}
    else{for(let i=0;i<4;i++)this.line([[-w*.28+i*w*.17,-h*.56],[-w*.18+i*w*.17,-h*.87]],'#c6d3c5',3);}break;
   case'microscope':this.rect(-w*.4,-8,w*.8,8,'#c8c5ad');this.line([[0,-9],[w*.2,-h*.35],[w*.17,-h*.67],[-w*.07,-h*.78]],'#718579',13);this.line([[-w*.18,-h*.53],[0,-h]],'#c4c4aa',16);this.line([[-w*.4,-h*.34],[w*.30,-h*.34]],'#a7b1a1',6);break;
   case'memorial':this.poly([[-w*.46,0],[-w*.3,-h*.67],[0,-h],[w*.31,-h*.77],[w*.45,0]],'#929681','#c2c3a3',2);this.line([[0,-h*.78],[0,-h*.32]],'#3f5548',5);this.line([[-w*.17,-h*.61],[w*.17,-h*.61]],'#435549',4);break;
   case'piano':this.poly([[-w*.48,-h*.48],[-w*.45,-h],[w*.08,-h],[w*.46,-h*.74],[w*.28,-h*.44]],'#131f22','#728685',2);this.line([[-w*.42,-h*.95],[w*.19,-h*1.08],[w*.28,-h*.52]],'#243438',7);for(let i=0;i<22;i++)this.rect(-w*.44+i*w*.026,-h*.46,w*.024,20,i%3===1?'#40504d':'#e8e8da');for(let x of[-w*.37,w*.18])this.line([[x,-h*.42],[x,0]],'#1c3032',10);break;
   case'classicalstatue':this.rect(-w*.42,-35,w*.84,35,'#c8cbbd');this.line([[-14,-53],[-5,-144],[7,-214]],'#d6d8c9',22);this.line([[15,-52],[24,-137],[11,-216]],'#c1c9bd',21);this.poly([[-22,-204],[-28,-278],[3,-290],[27,-272],[24,-204],[0,-189]],'#d9dac9');this.ellipse(0,-311,21,25,'#dedecb');this.line([[-21,-274],[-37,-248],[-26,-213]],'#d6d9cb',13);this.line([[21,-274],[45,-253],[30,-229]],'#ccd1c2',13);break;
  }c.restore();
 }
}
root.CovenantRenderer=FidelityRenderer;
})(globalThis);
