/* Room-specific additions. All positions/state come from the simulation.
   This is authored Canvas artwork; no film stills or final sprite claim. */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
class CovenantThresholdRenderer extends root.CovenantRenderer {
 background(){
  super.background();const r=this.engine.room,c=this.c,t=this.engine.state.time,W=this.W,arch=r.visual?.architecture;
  if(['cistern','undercroft'].includes(arch)){
   this.rect(0,520,W,240,this.grad(0,520,0,760,[[0,'#2b3c38'],[1,'#152b2b']]));
   for(let i=0;i<60;i++){const x=i*79-this.camera,y=538+i*31%204;this.line([[x,y],[x+29,y+9],[x+49,y+5],[x+72,y+13]],'#b5b79929',1.2);this.line([[x+29,y+9],[x+20,y+27]],'#071b223b',1);}
  }
  if(['catwalk','relay'].includes(arch)){
   // The floor terminates under the feet; the service void extends below it.
   this.rect(0,649,W,111,this.grad(0,649,0,760,[[0,'#112a30'],[1,'#030d17']]));
   this.line([[0,646],[W,646]],'#9eb4ae',5);this.line([[0,658],[W,658]],'#2a4148',12);
   for(let x=-this.camera;x<W+180;x+=155){this.line([[x,660],[x+84,744],[x+145,660]],'#415760',7);this.line([[x+6,670],[x+70,735]],'#778c8736',2);}
   const label=arch==='catwalk'?'COLLECTEUR // PASSERELLE +01':'FRET // DISTRIBUTION +01';
   this.text(label,Math.max(28,190-this.camera*.5),135,14,'#c0b595');
   if(arch==='relay'){for(let i=0;i<6;i++){const x=130+i*300-this.camera*.53;this.rect(x,170,218,278,'#294049');this.rect(x+14,184,190,104,'#09212d');for(let n=0;n<7;n++)this.line([[x+30,199+n*12],[x+169,199+n*12]],'#88b4b85a',1.4);this.line([[x+26,315],[x+181,315]],'#829991',6);this.text('BUS '+String(i+1).padStart(2,'0'),x+29,365,13,'#9bb6ad');this.ellipse(x+180,405,5,5,this.engine.done('relay-a1')?'#aad4b5':'#d2aa69');}}
  }
  if(arch==='response'){
   const x=980-this.camera*.52;this.rect(x-230,96,430,395,'#2b4244');this.line([[x-212,125],[x+178,125],[x+178,465]],'#a7b7a16a',7);
   this.text('INTERVENTION / 01',x-200,165,16,'#c9c7a3');this.line([[x-163,380],[x-163,223],[x+107,223],[x+107,420]],'#738b8b',17);
   for(let n=0;n<4;n++){this.ellipse(x-98+n*68,293,23,23,'#11252b');this.ellipse(x-98+n*68,293,19,19,'#c6c7a4');this.line([[x-98+n*68,293],[x-86+n*68,281]],'#2a494b',2);}
  }
  if(arch==='cistern'){
   // Continuous ribbed water chamber, no modern lighting or freestanding sky portal.
   for(let x=-200-this.camera*.5;x<W+450;x+=370){c.beginPath();c.moveTo(x-30,502);c.bezierCurveTo(x-10,110,x+155,74,x+315,502);c.strokeStyle='#99a2922d';c.lineWidth=12;c.stroke();this.line([[x,490],[x+27,379]],'#85928260',6);}
   const active=!this.engine.done('cistern-a1'),x1=675-this.camera,x2=1425-this.camera,y1=this.foot(.47),y2=this.foot(.83);
   this.poly([[x1,y1],[x2,y1],[x2+35,y2],[x1-35,y2]],active?'#377275c4':'#112d3285','#b2b99645',3);
   const count=active?21:6;for(let i=0;i<count;i++){let x=x1+(i*97)%(x2-x1),y=y1+9+(i*19)%Math.max(10,y2-y1-11);this.line([[x,y],[Math.min(x2,x+32+Math.sin(t*1.5+i)*14),y]],active?'#b3d5c177':'#78978b40',1);}
   if(active)for(let i=0;i<5;i++){const x=x1+80+i*145;this.line([[x,y1+4],[x+22,y2-9]],'#9ebca73b',5);}
   this.text(active?'BASSIN EN CHARGE':'DÉRIVATION OUVERTE',(x1+x2)/2,y2+23,11,'#aebcac','center');
  }
  if(arch==='undercroft'){
   this.rect(0,0,W,180,this.grad(0,0,0,180,[[0,'#061414'],[1,'#1c2a27ee']]));
   for(let x=-this.camera*.52-100;x<W+400;x+=375){this.poly([[x,514],[x+72,169],[x+92,124],[x+121,167],[x+174,514]],this.grad(x,0,x+174,0,[[0,'#112b28'],[.45,'#697064'],[1,'#253c35']]));this.line([[x+71,207],[x+35,504]],'#acb09445',3);this.line([[x+108,178],[x+148,504]],'#101f20',9);}
  }
  if(arch==='stores'){
   this.text('MAGASIN / C-04',Math.max(25,300-this.camera*.50),110,18,'#c8c6a8');
   for(let x=-this.camera*.52+70;x<W+320;x+=320){this.rect(x,170,210,270,'#142c32');for(let n=0;n<3;n++){this.line([[x,208+n*88],[x+210,208+n*88]],'#91a398',7);for(let j=0;j<3;j++){this.rect(x+9+j*64,152+n*88,51,53,['#64766c','#506a71','#78795d'][j]);this.rect(x+16+j*64,165+n*88,18,7,'#c1c3a460');}}}
  }
 }
 prop(o){
  if(!['pipebundle','railing','grate','steamvent','column','drainwheel','switchboard','channelrim','slab','stair'].includes(o.kind))return super.prop(o);
  const c=this.c,p=this.propPoint(o);if(p.x<-o.w||p.x>this.W+o.w)return;c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);const w=o.w,h=o.h,t=this.engine.state.time;
  switch(o.kind){
   case'slab':
    this.poly([[-w/2,0],[-w/2+9,-h],[w/2-14,-h+5],[w/2,0]],'#57685a','#90947b',2);this.line([[-w*.3,-h+4],[-w*.16,-h*.45],[w*.09,-h*.2]],'#1a322a',3);break;
   case'stair':
    for(let j=0;j<7;j++){const x=-w/2+j*w/8,y=-j*h/7;this.rect(x,y,w-j*w/8,8,'#5c7069');this.line([[x,y],[w/2,y]],'#adb2a27a',2);}break;
   case'channelrim':
    this.poly([[-w/2-34,27],[-w/2,-27],[w/2,-27],[w/2+34,27]],null,'#b4b6a065',4);this.line([[-w/2-34,31],[w/2+34,31]],'#0c252b',5);break;
   case'pipebundle':
    for(let n=0;n<5;n++){const y=-h+20+n*(h-28)/5;this.line([[-w/2,y],[w*.34,y],[w*.44,y+15],[w/2,y+15]],n%2?'#304a54':'#789395',11);this.line([[-w/2,y-3],[w*.34,y-3]],'#c8d3be52',2);for(let j=0;j<3;j++)this.line([[-w*.32+j*w*.3,y-8],[-w*.32+j*w*.3,y+8]],'#263b43',5);}
    break;
   case'railing':
    c.globalAlpha=Math.abs(o.x-this.engine.state.player.x)<180?.25:.72;this.line([[-w/2,-h],[w/2,-h]],'#9fb6ae',5);this.line([[-w/2,-h/2],[w/2,-h/2]],'#627d77',3);for(let x=-w/2;x<=w/2;x+=w/5)this.line([[x,0],[x,-h]],'#6b8a87',4);break;
   case'grate':
    this.rect(-w/2,-h,w,h,'#0f262d');for(let n=0;n<9;n++)this.line([[-w/2+6,-h+8+n*(h-12)/9],[w/2-6,-h+8+n*(h-12)/9]],'#78938c',3);break;
   case'steamvent':{
    this.ellipse(0,0,w*.5,12,'#152c33');this.ellipse(0,-3,w*.45,8,'#668484');for(let i=0;i<8;i++)this.line([[-w*.35+i*w*.1,-8],[-w*.32+i*w*.1,4]],'#0b2029',3);
    if(!this.engine.done('evaclocker-a1')){for(let i=0;i<12;i++){const phase=(t*.38+i/12)%1;c.globalAlpha=(1-phase)*.13;this.ellipse(Math.sin(i*2+t)*phase*80,-phase*170-10,16+phase*43,10+phase*26,'#d2e1d7');}c.globalAlpha=1;}break;}
   case'column':
    this.poly([[-w*.55,0],[-w*.46,-h*.08],[-w*.38,-h*.91],[-w*.53,-h],[w*.50,-h],[w*.37,-h*.91],[w*.45,-h*.08],[w*.54,0]],this.grad(-w/2,0,w/2,0,[[0,'#152e2b'],[.38,'#697368'],[.52,'#a4a891'],[1,'#253d38']]),'#a1ae8e45',2);
    for(let i=0;i<5;i++)this.line([[-w*.28+i*w*.13,-h*.9],[-w*.3+i*w*.14,-h*.09]],'#172b2d77',3);this.line([[-w*.4,-h*.08],[w*.4,-h*.08]],'#acb49180',4);break;
   case'drainwheel':{
    this.line([[0,0],[0,-h*.76]],'#52695d',11);const a=this.engine.state.workProgress['cistern-a1']||0;c.save();c.translate(0,-h*.7);c.rotate(a*Math.PI*1.8);c.beginPath();c.arc(0,0,w*.36,0,Math.PI*2);c.strokeStyle='#b2ad80';c.lineWidth=6;c.stroke();for(let j=0;j<6;j++){let n=j*Math.PI/3;this.line([[0,0],[Math.cos(n)*w*.36,Math.sin(n)*w*.36]],'#82947e',4);}this.ellipse(0,0,10,10,'#cfca9b');c.restore();break;}
   case'switchboard':
    this.rect(-w/2,-h,w,h,'#29404a');this.line([[-w/2,-h],[-w/2,0],[w/2,0],[w/2,-h]],'#879f96',4);for(let i=0;i<12;i++){const x=-w*.43+(i%4)*w*.23,y=-h*.84+Math.floor(i/4)*h*.25;this.rect(x,y,w*.17,h*.17,'#101f28');this.ellipse(x+w*.13,y+h*.07,3,3,this.engine.done('relay-a1')?'#bfd2a0':'#c39b66');this.line([[x+9,y+10],[x+9,y+h*.12]],'#879c92',4);}break;
  }c.restore();
 }
 portal(e){
  const E=this.engine,r=E.room,pt=this.project(e.x,e.z),c=this.c;if(pt.x<-200||pt.x>this.W+200)return;
  if(!e.doorId){super.portal(e);if(e.stairs){c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);for(let i=0;i<6;i++)this.line([[-44+i*7,12-i*6],[44+i*4,12-i*6]],'#9faaa366',2);this.text(E.rooms.get(e.to).layout.level>r.layout.level?'↑ ÉTAGE':'↓ NIVEAU',0,-182,11,'#c3c8b2','center');c.restore();}}
  else{
   const door=E.state.doors[e.doorId],def=E.doorDefs.get(e.doorId),stone=def.kind==='stonegate',h=e.stairs?173:189,w=e.stairs?106:112,unlocked=E.doorUnlocked(e.doorId);
   c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);this.poly([[-w/2-10,2],[-w/2-10,-h+12],[-w/2+6,-h-8],[w/2-6,-h-8],[w/2+10,-h+12],[w/2+10,2]],stone?'#414f42':'#51676a','#a1b2a080',4);this.rect(-w/2,-h+6,w,h-6,'#061923');
   c.save();c.beginPath();c.rect(-w/2,-h+6,w,h-6);c.clip();const slide=door.amount*(w*.52);
   for(const dir of [-1,1]){const x=dir<0?-w/2-slide:slide;this.rect(x,-h+7,w/2,h,stone?'#6b7160':this.grad(x,0,x+w/2,0,[[0,'#273d45'],[.5,'#708b88'],[1,'#354e55']]));for(let j=0;j<8;j++)this.line([[x+4,-h+27+j*19],[x+w/2-4,-h+27+j*19]],stone?'#333e35':'#a6b6a865',stone?5:2);}
   if(e.stairs&&door.amount>.6)for(let i=0;i<7;i++)this.line([[-42+i*4,-i*11],[42-i*4,-i*11]],'#98afa75a',3);c.restore();
   const status=!unlocked?'VERROU INTÉRIEUR':door.open?(door.amount<.94?'OUVERTURE':'PASSAGE LIBRE'):door.amount>.05?'FERMETURE':'FERMÉ';
   if(!stone){this.ellipse(w/2+9,-h*.48,5,5,!unlocked?'#99745e':door.open?'#afd1ae':'#dcac73');this.rect(-w/2+8,-h-23,w-16,10,'#111f27');}
   this.text(status,0,-h-13,9,!unlocked?'#be9c7d':door.open?'#bdcbb5':'#e0bc89','center');
   if(door.stress>0){const ratio=door.stress/(def.breakTime||1);this.line([[-w*.42,11],[w*.42,11]],'#6f433c',3);this.line([[-w*.42,11],[-w*.42+w*.84*(1-ratio),11]],'#e9c586',3);if(!this.reduceFX)this.line([[-13,-h*.6],[5+Math.sin(E.state.time*28)*3,-h*.54],[1,-h*.25]],'#e0c39095',2);}
   c.restore();
  }
  if(E.distance(e)<235){const name=E.rooms.get(e.to).name;this.text(name.length>29?name.slice(0,27)+'…':name,clamp(pt.x,120,this.W-120),pt.y+34,11,'#c5d2c2','center');}
 }
 shelter(h){
  const c=this.c,p=this.project(h.x,h.z),inside=this.engine.state.hidden?.id===h.id;if(p.x<-190||p.x>this.W+190)return;c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);const w=h.w,ht=h.h;
  this.rect(-w/2,-ht,w,ht,this.grad(-w/2,0,w/2,0,[[0,'#3d5760'],[.55,'#7c9189'],[1,'#1b3640']]));this.rect(-w/2+10,-ht+9,w-20,ht-11,'#071a23');
  this.rect(-w/2+12,-ht+11,inside?w-24:w*.31,ht-15,'#536c72');for(let j=0;j<8;j++)this.line([[-w/2+18,-ht+27+j*11],[inside?w/2-17:-w/2+37,-ht+27+j*11]],'#192f3b',3);
  this.rect(inside?w/2-22:-w/2+38,-ht*.42,5,21,'#bccbbb');this.line([[-w/2,3],[w/2,3]],'#869a91',3);
  this.text(inside?'À L’ABRI':'V · ABRI',0,-ht-14,11,inside?'#d8d4ae':'#afc3be','center');if(inside&&this.engine.state.hidden.knownBy.length)this.text('ENTRÉE VUE',0,-ht-29,10,'#ddac89','center');c.restore();
 }
 human(actor,role='daniels',moving=false){if(role==='daniels'&&this.engine.state.hidden)return;super.human(actor,role,role==='daniels'?this.engine.motion.moving:moving);
  if(role==='daniels'&&this.engine.work){const p=this.project(actor.x,actor.z),v=Math.sin(this.engine.state.time*6)*8;this.line([[p.x+10,p.y-70],[p.x+37,p.y-60+v]],'#c5c4a4',5);this.line([[p.x+34,p.y-70+v],[p.x+42,p.y-47+v]],'#9db5b5',4);}
 }
 frame(dt,input){super.frame(dt,input);const E=this.engine,p=E.state.player;if(E.work){const a=E.room.actions.find(a=>a.id===E.work.id),at=this.project(a.x,a.z),progress=E.state.workProgress[a.id]||0;this.line([[at.x-39,at.y-167],[at.x+39,at.y-167]],'#243f46',4);this.line([[at.x-39,at.y-167],[at.x-39+78*progress,at.y-167]],'#ccd4ac',4);}
  if(E.motion.moving&&E.hazardsAt().some(h=>h.kind==='water')){const at=this.project(p.x,p.z),a=(E.state.time*2)%1;this.c.beginPath();this.c.ellipse(at.x,at.y+4,12+a*22,3+a*5,0,0,Math.PI*2);this.c.strokeStyle='#c4d6cb8c';this.c.lineWidth=1;this.c.stroke();}
 }
}
root.CovenantRenderer=CovenantThresholdRenderer;
})(globalThis);
