/* Dedicated room architecture and independent props. Procedural art, not film assets. */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
const PALETTES={
 medical:['#131f25','#354b51','#b0c7c3'],industrial:['#101c21','#3d4a4d','#b5a97e'],warm:['#241f1c','#575048','#c6b38c'],
 day:['#203332','#657569','#c5c3a1'],forest:['#152822','#415646','#a5b78c'],night:['#0d1c28','#293e48','#94afa9'],
 stone:['#182321','#49554b','#b4b197'],alien:['#121f22','#35494b','#a3b4a1'],amber:['#242520','#504f3b','#ccbd8e'],
 fire:['#1c2629','#524638','#deb56e'],storm:['#101f2b','#3b5262','#b8cbc4'],alarm:['#1c2427','#475658','#bd9680']
};
class CovenantRendererV2 extends root.CovenantRenderer{
 constructor(canvas,engine){super(canvas,engine);this.palette=PALETTES.medical;}
 propPoint(o){if(this.engine.room.view==='side'&&o.z<.25)return{x:o.x-this.camera,y:535+o.z*130,s:.76+o.z*.3};return this.project(o.x,o.z);}
 sky(d,night=false){
  const c=this.c,W=this.W,r=this.engine.room;const storm=r.theme==='lifter';
  this.rect(0,0,W,555,this.grad(0,0,0,560,[[0,night||storm?'#0f1c28':'#39545a'],[.52,night||storm?'#374753':'#90a49a'],[1,'#8b9a81']]));
  if(night)for(const[x,y,rad]of d.stars)this.ellipse((x-this.camera*.035)%(W+50),y*.75,rad*.5,rad*.5,'#c9dfce65');
  for(let j=0;j<3;j++){
   const shift=-this.camera*(.045+j*.075),pts=[[-450,560],...d.mountains[j].map(([x,y],i)=>[x+shift,y-15+j*12+Math.sin(i*2.7)*45]),[5000,560]];
   this.poly(pts,[night?'#46575c':'#6f8580',night?'#32464c':'#506b62','#243e38'][j]);
   for(let i=2;i<d.mountains[j].length;i+=3){let[x,y]=d.mountains[j][i];this.poly([[x+shift,y-14+j*12],[x+shift-60,y+100],[x+shift+12,y+54],[x+shift+130,y+180]],j===0?'#c1cbbb22':'#b6bf9920');}
  }
  // Cloud bands use feathered gradients rather than giant opaque ellipses.
  for(let i=0;i<5;i++){const y=90+i*65;this.rect(0,y,W,85,this.grad(0,y,0,y+85,[[0,'#bbc5bd00'],[.55,night?'#a3b8c20d':'#d5dfca18'],[1,'#b7c5c000']]));}
  if(!night&&!storm)this.glow(W*.78,150,250,'#ecdfae24');
 }
 tree(x,y,h,col='#1a2c29',seed=0){
  const c=this.c,w=Math.max(12,h*.034);c.fillStyle=col;c.beginPath();c.moveTo(x-w,y);c.bezierCurveTo(x+w*.5,y-h*.3,x-w*.8,y-h*.65,x+2,y-h);c.bezierCurveTo(x+w*1.7,y-h*.65,x+w*.6,y-h*.27,x+w*1.8,y);c.closePath();c.fill();
  this.line([[x-w*.25,y-15],[x+w*.2,y-h*.35],[x-w*.3,y-h*.66]],'#82907918',Math.max(1,h*.005));
  for(let j=0;j<8;j++){const yy=y-h*(.20+j*.095),side=j%2?1:-1,l=h*(.14+(j%3)*.04);this.line([[x,yy+30],[x+side*l*.52,yy-8],[x+side*l,yy-28-j%3*7]],col,Math.max(2,9-j*.8));
   for(let k=0;k<6;k++){const xx=x+side*(l*.22+k*l*.14),cy=yy-12-k*4;this.curve([[xx-side*23,cy+12],[xx-side*18,cy-8,xx+side*2,cy-27-(k%2)*13,xx+side*13,cy-10],[xx+side*21,cy-2,xx+side*31,cy+5,xx+side*30,cy+11],[xx+side*8,cy+7,xx-side*12,cy+15,xx-side*23,cy+12]],null,0,col);for(let n=0;n<4;n++)this.line([[xx+n*3,cy+7],[xx+side*(11+n*4),cy-14+n*4]],col,2);}}
  this.line([[x-w,y-7],[x-h*.10,y+9],[x-h*.17,y+10]],col,w*.6);this.line([[x+w,y-10],[x+h*.12,y+11]],col,w*.6);
 }
 ship(d,theme){
  const c=this.c,r=this.engine.room,P=PALETTES[r.visual?.palette]||PALETTES.medical,W=this.W;this.palette=P;
  this.rect(0,0,W,550,this.grad(0,0,0,550,[[0,P[0]],[.65,P[1]],[1,'#172f30']]));
  if(theme==='bridge'){
   c.save();c.beginPath();c.moveTo(0,105);c.lineTo(W,105);c.lineTo(W,380);c.quadraticCurveTo(W*.5,445,0,380);c.closePath();c.clip();
   this.rect(0,90,W,350,'#071824');for(const[x,y,s]of d.stars)this.ellipse((x-this.camera*.025)%(W+100),80+y*.7,s*.65,s*.65,'#d1ded780');
   const px=W*.7-this.camera*.06;this.ellipse(px,300,280,280,this.grad(px-220,110,px+200,430,[[0,'#a1b7b5'],[.4,'#5e848a'],[1,'#152e46']]));
   for(let i=0;i<18;i++)this.line([[px-205+i*12,130+i*13],[px-75+i*10,135+i*13],[px+90+i*9,95+i*16]],'#d4dec320',4+i%3*3);
   c.restore();this.line([[0,100],[W,100]],'#afbeb4',8);this.line([[0,383],[W*.22,418],[W*.77,418],[W,383]],'#839d94',9);
   for(let x=130-this.camera*.38;x<W+350;x+=400)this.line([[x,100],[x-60,409]],'#324c55',25);
  }else{
   for(let x=-this.camera*.55-250;x<W+380;x+=340){
    this.poly([[x,110],[x+280,110],[x+310,150],[x+310,425],[x+14,425]],this.grad(x,110,x+300,425,[[0,'#4a61613d'],[.48,'#1d32346d'],[1,'#8ca09716']]),'#a1b6ad28',2);
    for(let j=0;j<3;j++)this.line([[x+18,255+j*35],[x+296,255+j*35]],'#9daaa226',1);
    this.rect(x+16,360,100,38,'#12282f');this.text(r.id==='corridor'?'SEAL / 04':'COV / SYS',x+24,384,10,'#90aca7');
   }
  }
  // Continuous ceiling and vertical supports terminate at the back edge of the floor.
  for(let x=-this.camera*.52-80;x<W+300;x+=390){
   this.poly([[x-24,0],[x+12,0],[x+29,467],[x+55,519],[x-42,519],[x-16,466]],this.grad(x-30,0,x+42,0,[[0,'#152a30'],[.47,'#7b928e'],[.58,'#31484d'],[1,'#182e33']]),'#9db2ab25');
   this.rect(x+65,58,225,7,P[2]);this.glow(x+170,72,220,'#bbded518');
  }
  this.rect(0,0,W,52,'#0c1c23');for(let i=0;i<4;i++)this.line([[0,17+i*7],[W,17+i*7]],'#7a939130',2);
  this.rect(0,491,W,23,'#10272d');for(let x=-this.camera*.52;x<W+230;x+=220)this.rect(x+35,501,106,4,r.id==='corridor'?'#c1846260':'#8db4ac45');
 }
 temple(d,theme){
  const c=this.c,r=this.engine.room,W=this.W,P=PALETTES[r.visual?.palette]||PALETTES.stone;this.palette=P;
  const outside=['necropolis','garden'].includes(theme)||r.id==='court';if(outside)this.sky(d,theme==='necropolis');else this.rect(0,0,W,540,this.grad(0,0,0,540,[[0,P[0]],[.7,P[1]],[1,'#243b33']]));
  if(outside){for(let x=-250-this.camera*.15;x<W+700;x+=490){this.poly([[x,520],[x+20,250],[x+80,160],[x+300,150],[x+350,240],[x+425,520]],'#263d3a','#71817433',3);for(let n=0;n<7;n++)this.rect(x+90+n*32,224,17,164,'#112b2d');this.ellipse(x+205,165,112,50,'#354b44');}}
  if(theme==='necropolis'){
   // An open skyline, not an indoor row of arches. A single far gate gives the city a destination.
   const gate=r.width*.79-this.camera*.31;
   this.poly([[gate-240,518],[gate-223,216],[gate-154,168],[gate+154,168],[gate+221,214],[gate+240,518]],'#2c433c','#82907950',5);
   this.poly([[gate-121,518],[gate-121,271],[gate-70,213],[gate+70,213],[gate+121,271],[gate+121,518]],'#112b2b','#6f806b66',4);
   for(let j=0;j<6;j++)this.line([[gate-197+j*13,230],[gate-197+j*13,492]],'#8b97713d',3);
   this.poly([[gate-183,516],[gate-60,461],[gate+70,461],[gate+263,516]],'#8b927541');
   for(let j=0;j<26;j++){const x=j*123-this.camera*.41,y=492+(j*11%22);this.ellipse(x,y,22+j%4*6,4,'#1a2c295f');this.curve([[x-15,y],[x-9,y-10,x+7,y-11,x+17,y-3]],'#79826a55',3);}
   return;
  }
  for(let x=-260-this.camera*.50;x<W+580;x+=520){
   c.save();if(outside){c.translate(0,181);c.scale(1,.65);}

   c.beginPath();c.moveTo(x+10,515);c.lineTo(x+10,260);c.bezierCurveTo(x+18,75,x+171,42,x+220,40);c.bezierCurveTo(x+320,80,x+438,127,x+432,278);c.lineTo(x+434,515);c.closePath();c.fillStyle=outside?'#162e2f':'#132a27';c.fill();c.lineWidth=16;c.strokeStyle='#8c927a33';c.stroke();
   for(let j=0;j<4;j++){this.line([[x-11+j*8,100],[x-4+j*8,499]],j%2?'#142e28':'#89947a3b',5);this.line([[x+451+j*7,98],[x+450+j*7,500]],'#74857131',4);}
   this.rect(x-45,496,107,18,'#526452');this.rect(x+425,496,94,18,'#526452');
   if(['gallery','nave'].includes(r.id))this.stoneHead(x+210,450,185+(r.id==='gallery'?90:0));c.restore();
  }
  if(!outside)for(let x=250-this.camera*.4;x<W+500;x+=640){this.poly([[x-10,18],[x+20,18],[x+230,515],[x-120,515]],this.grad(x,20,x,515,[[0,'#d2d3ad18'],[1,'#e0deaf00']]));}
 }
 background(){
  super.background();this.palette=PALETTES[this.engine.room.visual?.palette]||PALETTES.stone;
  const c=this.c,r=this.engine.room,W=this.W,arch=r.visual?.architecture,t=this.engine.state.time;
  c.save();c.beginPath();c.rect(0,0,W,517);c.clip();
  const anchor=(x)=>x-this.camera*.52;
  const tank=(x,w,h)=>{x=anchor(x);this.ellipse(x,468,w*.5,35,'#172d32');this.rect(x-w*.5,468-h,w,h,'#415b5e');this.ellipse(x,468-h,w*.5,36,'#78918e');for(let j=0;j<4;j++)this.rect(x-w*.5,468-h+25+j*(h-30)/4,w,8,'#1b333b');this.line([[x-w*.28,468-h+14],[x-w*.28,455]],'#c1cbb448',5);};
  if(['cryovault','sleep'].includes(arch)){
   for(let j=0;j<2;j++)for(let i=0;i<7;i++){const x=anchor(120+i*270),y=275+j*136;this.rect(x,y,225,83,'#607c7b');this.poly([[x+10,y+10],[x+199,y+10],[x+215,y+40],[x+190,y+65],[x+8,y+65]],'#213f49','#bad0c233',2);this.ellipse(x+51,y+42,14,9,'#9fae9c62');this.rect(x+209,y+63,9,5,'#b6d9cb');this.text(String(i+1+j*7).padStart(2,'0'),x+13,y+80,10,'#ced9c6');}
  }
  if(arch==='cooling'){tank(460,335,225);tank(1370,370,250);for(let j=0;j<5;j++)this.line([[0,125+j*14],[W,125+j*14]],j%2?'#96a59b':'#2a444b',8);}
  if(arch==='quarters'){
   let x=anchor(550);this.rect(x-380,125,610,360,'#403e38');this.rect(x-348,154,543,282,'#152d30');this.rect(x-348,370,543,66,'#647774');this.rect(x-335,376,155,24,'#c7c8ac');for(let j=0;j<8;j++)this.line([[x+100+j*8,159],[x+100+j*8,433]],'#737963',5);this.glow(x-70,180,230,'#eac99727');
  }
  if(arch==='communications'){
   const x=anchor(1290);this.rect(x-310,138,480,198,'#12282f');this.rect(x-297,148,453,163,'#06202a');for(let j=0;j<3;j++){const pts=[];for(let i=0;i<100;i++)pts.push([x-285+i*4.3,177+j*49+Math.sin(i*.32+t*2)*Math.sin(i*.065)*15]);this.line(pts,['#a7c9b3','#9ebdd0','#cab78e'][j],1.7);}this.text('SIGNAL / 03',x-288,327,11,'#a9bfb6');
  }
  if(['shore','field','marsh','extraction','woodland','gorge'].includes(arch)){
   if(arch==='shore'){this.rect(0,395,W,120,this.grad(0,395,0,515,[[0,'#a0b7b37a'],[1,'#43665d']]));for(let j=0;j<38;j++){let x=(j*197-this.camera*.12+t*6)%(W+150)-80;this.line([[x,408+j%18*6],[x+35+j%7*18,408+j%18*6]],'#d1d8b936',1);}}
   if(arch==='field'||arch==='marsh'){for(let i=0;i<210;i++){const x=i*20-this.camera*.45,y=518,h=arch==='field'?45+(i*13%65):50+i*19%98;this.line([[x,y],[x+Math.sin(t+i)*5,y-h]],arch==='field'?'#aaac7544':'#71998a50',2);}}
   if(arch==='gorge'){this.poly([[-200,0],[260,0],[320,180],[233,450],[340,517],[-200,517]],'#274139','#8a987433',4);this.poly([[W-100,0],[W+200,0],[W+200,517],[W-160,517],[W-88,400],[W-187,217]],'#294037');}
   if(arch==='extraction'){const x=anchor(2090);this.poly([[x-190,115],[x-65,115],[x+315,510],[x-150,510]],this.grad(x,120,x,515,[[0,'#d7e4ca28'],[1,'#d7e4ca00']]));}
  }
  if(['laboratory','sealed'].includes(arch)){
   const start=arch==='sealed'?560:650;
   for(let j=0;j<(arch==='sealed'?1:3);j++){const x=anchor(start+j*500);this.rect(x-195,163,310,275,'#2c3b2d');for(let i=0;i<9;i++){const px=x-181+(i%3)*100,py=181+Math.floor(i/3)*84;this.poly([[px,py],[px+83,py-3],[px+85,py+71],[px-3,py+68]],'#b4ad85bb','#d4c79760',1);this.line([[px+17,py+48],[px+37,py+12],[px+60,py+18],[px+35,py+32],[px+62,py+57]],'#4a4b35',2);for(let n=0;n<3;n++)this.line([[px+11,py+53+n*4],[px+33,py+53+n*4]],'#68694f',1);}}
   this.glow(anchor(1050),236,310,'#d9bc6926');
  }
  if(arch==='courtyard'||arch==='cloister'){const x=anchor(r.width*.53);this.ellipse(x,447,300,55,'#63705a');this.ellipse(x,439,275,39,'#172f2b');this.ellipse(x,441,234,24,arch==='cloister'?'#7b9b8750':'#101f1d');this.line([[x-295,451],[x-295,489],[x+295,489],[x+295,451]],'#a5a07a50',5);}
  if(arch==='cathedral'){const x=anchor(1420);this.ellipse(x,140,170,124,'#a4af8d42');this.ellipse(x,140,143,101,'#162e2c');for(let i=0;i<9;i++){let a=i*Math.PI*2/9;this.line([[x,140],[x+Math.cos(a)*144,140+Math.sin(a)*105]],'#a4a47c64',7);}this.poly([[x-90,234],[x+110,230],[x+510,515],[x-380,515]],'#b9c3970c');}
  if(arch==='navigation'){const x=anchor(740);this.ellipse(x,452,315,75,'#102a2b','#8b9c88');this.ellipse(x,442,263,53,'#3f5752');this.line([[x-185,453],[x-170,292],[x-95,208],[x+31,157],[x+126,209],[x+161,408]],'#819188',27);this.line([[x-182,454],[x-150,316],[x-69,244],[x+41,224],[x+82,390]],'#213f40',17);}
  if(arch==='quarantine'){const x=anchor(990);this.rect(x-430,72,620,430,'#78968d');this.rect(x-406,106,569,345,'#132d37');this.rect(x-393,118,541,320,'#9dbbad28');this.line([[x-111,107],[x-111,450]],'#b9cbc2',15);this.line([[x-405,282],[x+160,282]],'#718f91',12);this.glow(x-110,335,230,'#dba18118');this.text('ISOLATION',x-130,93,14,'#153039','center');}
  if(arch==='surgery'){const x=anchor(940);this.line([[x-400,39],[x-215,39],[x-182,175],[x+50,178],[x+87,294]],'#a8bfba',14);this.ellipse(x+87,302,71,16,'#354f58');this.ellipse(x+87,309,55,9,'#d0e5d2');this.glow(x+87,355,140,'#d1f0dc1a');}
  if(arch==='containment'){const x=anchor(1450);this.poly([[x-205,507],[x-205,180],[x-145,106],[x+135,106],[x+199,180],[x+199,507]],'#172c34','#9eb3ac90',7);this.rect(x-161,170,310,331,'#405456');for(let i=0;i<6;i++)this.line([[x-155,193+i*47],[x+149,193+i*47]],'#102930',10);this.rect(x-40,137,80,7,'#e6a377');}
  if(arch==='embryobank'){
   for(let x=anchor(190);x<W+350;x+=270){this.rect(x,85,236,410,'#526c73');this.rect(x+13,99,210,380,'#172e39');for(let i=0;i<28;i++){const xx=x+24+i%4*48,yy=115+Math.floor(i/4)*48;this.rect(xx,yy,36,37,'#839b954d');this.rect(xx+9,yy+10,15,19,'#b6c8a777');this.rect(xx+22,yy+30,6,2,'#cfdbb7');}}}
  if(arch==='terraforming'){
   const x=anchor(2220),seq=this.engine.state.sequence,open=seq?.kind==='airlock'?clamp((seq.t-.5)/1.8,0,1):0;
   this.poly([[x-155,514],[x-155,114],[x-93,43],[x+297,43],[x+360,110],[x+360,514]],'#0b1e2d','#8ba59f',13);
   this.rect(x-128,103,460,408,'#041320');for(const[sx,sy,rad]of this.scene(r).stars)if(sx<455&&sy<390)this.ellipse(x-128+sx,110+sy,rad*.7,rad*.7,'#c6d8d1a0');
   c.save();c.beginPath();c.rect(x-126,104,460,409);c.clip();this.rect(x-126-230*open,104,230,409,'#4f6a72');this.rect(x+104+230*open,104,230,409,'#354f59');for(let j=0;j<8;j++){this.line([[x-120-230*open,139+j*45],[x+99-230*open,139+j*45]],'#9cb3a445',4);this.line([[x+109+230*open,139+j*45],[x+327+230*open,139+j*45]],'#9cb3a445',4);}c.restore();
  }
  c.restore();
  if(['flightdeck','terraforming'].includes(arch)){for(let z of[.27,.76]){let y=this.foot(z);this.line([[0,y],[W,y]],'#b3bd9a35',7);for(let x=-this.camera;x<W+170;x+=170)this.line([[x,y-5],[x+44,y+6]],'#d8bd7157',6);}}
  if(r.visual?.floor==='stone'){for(let i=0;i<38;i++){const x=i*123-this.camera,y=560+(i*37%135);this.line([[x,y],[x+24,y+8],[x+39,y+5]],'#c7c59c21',1);}}
 }
 prop(o){
  const advanced=new Set(['locker','coolant','toolcart','wallpanel','bed','personal','rack','seat','reeds','fern','log','root','rubble','canopy','cargoCrate','dais','lantern','tarp','basin','chain','pallet','cargoLifter']);
  const q=this.engine.state.sequence;
  if(o.kind==='crane'){this.crane(o);return;}
  if(o.kind==='terraformer'&&(q?.kind==='airlock'||this.engine.done('cargo-a3'))){if(!q)return;const phase=clamp((q.t-2.4)/3,0,1);super.prop({...o,x:o.x+phase*1600,z:o.z+phase*.19,w:o.w*(1-phase*.6),h:o.h*(1-phase*.6)});return;}
  if(o.damaged&&o.kind==='lander'){
   const c=this.c,pt=this.propPoint(o);c.save();c.translate(pt.x,pt.y);c.rotate(-.09);c.translate(-pt.x,-pt.y);super.prop(o);c.restore();
   c.save();c.translate(pt.x,pt.y);this.poly([[-55,-180],[-125,-140],[-28,-122],[-72,-46],[35,-62],[59,-179]],'#0c1d20');this.line([[-50,-171],[-91,-137],[-22,-119],[-54,-66]],'#c6ac8233',6);c.restore();return;
  }
  if(!advanced.has(o.kind)){
   if(this.engine.room.view==='side'&&o.z<.25){const c=this.c,base=this.project(o.x,o.z),pt=this.propPoint(o);c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);c.translate(-base.x,-base.y);super.prop(o);c.restore();}
   else super.prop(o);return;
  }
  const c=this.c,pt=this.propPoint(o),w=o.w,h=o.h;if(pt.x<-w-100||pt.x>this.W+w+100)return;
  c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);this.ellipse(5,6,w*.48,Math.min(18,w*.12),'#020e1259');
  const metal=this.grad(-w/2,-h,w/2,0,[[0,'#798d87'],[.3,'#405d5e'],[1,'#243d44']]);
  switch(o.kind){
   case'locker':case'rack':
    this.rect(-w/2,-h,w,h,metal);this.rect(-w/2+7,-h+8,w-14,h-17,'#142c34');
    if(o.kind==='locker'){for(let j=0;j<2;j++){const x=-w/2+10+j*(w-20)/2;this.rect(x,-h+12,(w-22)/2,h-26,'#526d6b');for(let k=0;k<5;k++)this.rect(x+7,-h+25+k*6,(w-44)/2,2,'#122d35');this.rect(x+(w-36)/2,-h*.48,4,20,'#b7c6b8');}}
    else{for(let j=0;j<4;j++){let yy=-h+22+j*(h-23)/4;this.rect(-w/2+10,yy,w-20,4,'#a8b7a486');for(let i=0;i<4;i++){this.rect(-w/2+14+i*(w-25)/4,yy+8,(w-37)/4,h/4-16,j%2?'#76978a55':'#a2b09936');this.rect(-w/2+19+i*(w-25)/4,yy+15,9,3,'#afc5a9');}}}break;
   case'coolant':
    this.rect(-w*.43,-h*.85,w*.86,h*.75,metal);this.ellipse(-w*.43,-h*.48,w*.07,h*.38,'#243b43');this.ellipse(w*.43,-h*.48,w*.07,h*.38,'#839b96');for(let i=0;i<4;i++)this.rect(-w*.34+i*w*.22,-h*.86,8,h*.75,'#112933');this.line([[-w*.32,-h*.1],[-w*.32,0],[w*.32,0],[w*.32,-h*.1]],'#748e85',6);break;
   case'toolcart':
    this.line([[-w*.44,-4],[-w*.44,-h],[w*.44,-h],[w*.44,-4]],'#9ba79a',5);for(let yy of[-h*.84,-h*.28]){this.rect(-w/2,yy,w,7,'#58726b');for(let j=0;j<5;j++)this.rect(-w*.4+j*w*.15,yy-10-j%2*8,w*.12,10+j%2*8,'#b8b9a0');}this.ellipse(-w*.4,0,7,7,'#142c34');this.ellipse(w*.4,0,7,7,'#142c34');break;
   case'wallpanel':
    this.rect(-w/2,-h,w,h,'#677f7a');this.rect(-w*.45,-h*.94,w*.9,h*.87,'#102c38');for(let j=0;j<8;j++){this.rect(-w*.35,-h*.84+j*h*.09,w*(.35+j%3*.15),2,'#9ebcaba1');this.rect(w*.32,-h*.84+j*h*.09,7,3,j%3?'#82afad':'#c8b483');}break;
   case'bed':
    this.rect(-w/2,-h,w,h*.9,'#273b3d');this.rect(-w*.47,-h*.9,w*.91,h*.36,'#101f26');this.rect(-w*.46,-h*.5,w*.9,h*.32,'#788b84');this.rect(-w*.42,-h*.65,w*.23,h*.18,'#c6c9b7');this.line([[-w/2,-h*.1],[-w/2,0],[w/2,0],[w/2,-h*.1]],'#9cafa1',7);for(let j=0;j<5;j++)this.line([[w*.12+j*9,-h*.47],[w*.12+j*9,-h*.2]],'#a5b8a147',2);break;
   case'personal':
    this.rect(-w*.4,-h*.5,w*.7,h*.5,'#5b6250');this.poly([[-w*.2,-h*.47],[-w*.27,-h*.85],[w*.05,-h*.96],[w*.14,-h*.51]],'#c6c0a0');this.line([[-w*.16,-h*.62],[-w*.04,-h*.81],[w*.02,-h*.63]],'#5b6956',2);this.rect(w*.2,-h*.44,w*.21,h*.42,'#c4c5ac');this.ellipse(w*.37,-h*.23,w*.11,h*.13,'#b7b998');this.ellipse(w*.37,-h*.23,w*.07,h*.09,'#354744');break;
   case'seat':
    this.line([[0,0],[0,-h*.3]],'#738b83',9);this.line([[-w*.4,0],[w*.4,0]],'#b2beb0',6);this.poly([[-w*.42,-h*.33],[-w*.36,-h],[w*.30,-h],[w*.42,-h*.34]],'#2f4148','#9db0aa',4);this.rect(-w*.38,-h*.45,w*.77,h*.15,'#8b9c91');break;
   case'reeds':
    for(let i=0;i<35;i++){const xx=-w/2+i*w/35,hh=h*(.45+(i*17%31)/55),sway=this.reduceFX?0:Math.sin(this.engine.state.time*.9+i*.3)*7;this.line([[xx,0],[xx+sway*.4,-hh*.45],[xx+sway,-hh]],'#6a897165',2);this.line([[xx,-hh*.45],[xx+(i%2?1:-1)*20,-hh*.68]],'#81967783',2);this.line([[xx+sway,-hh],[xx+sway*.9,-hh-14]],'#bfba8d9a',3);}break;
   case'fern':
    for(let i=0;i<9;i++){const side=i%2?1:-1,hh=h*(.5+i%4*.12),xx=(i-4)*w*.035;this.line([[0,0],[xx+side*w*.12,-hh*.55],[xx+side*w*.3,-hh]],'#69886d',2);for(let j=1;j<7;j++){const t=j/7,x=xx+side*w*.30*t,y=-hh*t;this.line([[x,y],[x-side*20*(1-t+.2),y-7]],'#718f6c',3);this.line([[x,y],[x+side*21*(1-t+.2),y+1]],'#486e59',3);}}break;
   case'log':
    this.poly([[-w/2,0],[-w*.52,-h*.55],[-w*.40,-h],[w*.43,-h*.76],[w/2,-h*.27],[w*.44,0]],'#364a3b','#8e937051',2);for(let i=0;i<5;i++)this.line([[-w*.43,-h*.17-i*h*.13],[w*.44,-h*.11-i*h*.12]],'#a7a37730',2);this.ellipse(w*.43,-h*.45,w*.054,h*.4,'#88846a');this.ellipse(w*.43,-h*.45,w*.032,h*.28,'#475840');break;
   case'root':
    for(let i=0;i<6;i++){c.beginPath();c.moveTo(-w*.4+i*w*.14,-h);c.bezierCurveTo(-w*.47+i*w*.12,-h*.6,w*.22-i*w*.09,-h*.37,w*.42-i*w*.12,0);c.strokeStyle=i%2?'#54644d':'#283e32';c.lineWidth=8+i%3*4;c.stroke();}break;
   case'rubble':
    for(let i=0;i<8;i++){const xx=-w*.48+i*w*.12,hh=h*(.3+i%3*.22);this.poly([[xx-8,0],[xx-17,-hh*.6],[xx+6,-hh],[xx+28,-hh*.5],[xx+38,0]],i%2?'#536653':'#6c7760','#aab28d24',1);}break;
   case'canopy':
    this.line([[-w/2,0],[-w/2,-h],[w/2,-h],[w/2,0]],'#78938e',11);this.line([[-w/2,-h*.9],[w/2,-h*.9]],'#a8b9a9',3);break;
   case'cargoCrate':
    this.rect(-w/2,-h,w,h,metal);for(let i=0;i<6;i++)this.rect(-w*.45+i*w*.155,-h+7,5,h-14,'#a3b19b55');this.rect(-w*.27,-h*.72,w*.55,h*.28,'#b8b58a');this.text('CARGO',0,-h*.51,Math.min(16,w*.1),'#314943','center');this.line([[-w/2,-h],[w/2,-h]],'#bcc6ab',4);break;
   case'dais':
    this.poly([[-w/2,0],[-w*.45,-h*.23],[w*.43,-h*.23],[w/2,0]],'#5b6e5a','#acaf8750',2);this.stoneHead(0,-h*.22,h*.78);break;
   case'lantern':
    this.rect(-w*.5,-h*.7,w,h*.65,'#c1b782');this.rect(-w*.34,-h*.63,w*.68,h*.46,'#cfbf7799');this.line([[-w*.4,-h*.7],[-w*.4,-h],[w*.4,-h],[w*.4,-h*.7]],'#7b896d',3);this.glow(0,-h*.4,100,'#dcc5882c');break;
   case'tarp':
    this.poly([[-w/2,-h*.45],[-w*.29,-h*.98],[-w*.08,-h],[w*.06,-h*.91],[w*.35,-h*.76],[w*.51,-h*.34],[w*.36,0],[-w*.42,-3]],'#919584','#ced0b050',2);for(let i=0;i<5;i++)this.line([[-w*.22+i*w*.13,-h*.75],[w*.01+i*w*.09,-4]],'#354d414e',3);break;
   case'basin':
    this.ellipse(0,-h*.4,w*.5,h*.3,'#728571');this.rect(-w*.44,-h*.39,w*.88,h*.35,'#465f51');this.ellipse(0,-h*.43,w*.42,h*.21,'#1a3b35');this.ellipse(0,-h*.4,w*.33,h*.12,'#688b6b40');break;
   case'chain':
    for(let i=0;i<20;i++){const yy=-h+i*h/20;c.beginPath();c.ellipse(Math.sin(i*.5)*3,yy,i%2?2.4:5.1,h/26,0,0,Math.PI*2);c.lineWidth=2;c.strokeStyle='#9da8916e';c.stroke();}break;
   case'pallet':
    for(let j=0;j<6;j++)this.rect(-w/2+j*w/6,-h,w/7,h*.7,'#77846e');this.rect(-w/2,-h*.15,w,h*.18,'#354e40');break;
   case'cargoLifter':
    this.poly([[-w*.5,0],[-w*.5,-h*.28],[-w*.34,-h*.44],[-w*.25,-h*.81],[w*.22,-h*.81],[w*.37,-h*.40],[w*.5,-h*.30],[w*.5,0]],metal,'#b2c2b9',3);
    this.rect(-w*.12,-h*.70,w*.23,h*.23,'#0e2a3b');for(const side of[-1,1]){this.rect(side*w*.37-w*.08,-h*.59,w*.16,h*.45,'#293f49');this.ellipse(side*w*.37,-h*.55,w*.08,h*.07,'#879f9b');this.glow(side*w*.37,-h*.05,75,'#d3d8b32e');this.line([[side*w*.39,-h*.14],[side*w*.49,9]],'#a1b6ab',8);}this.rect(-w*.29,-h*.31,w*.59,h*.18,'#1a343c');break;
  }c.restore();
 }
 crane(o){
  const c=this.c,pt=this.project(o.x,o.z),q=this.engine.state.sequence,w=o.w,h=o.h;
  c.save();c.translate(pt.x,pt.y);const active=q?.kind==='crane',phase=active?q.t:0,closed=this.engine.done('lifter-a3')||phase>2.4;
  const grabX=active?q.x-o.x:w*.48,drop=active?Math.min(1,phase/1.8):0;
  this.line([[-w*.35,0],[-w*.35,-h*.91],[w*.12,-h],[Math.max(w*.48,grabX),-h*.87]],'#738f91',24);
  this.line([[-w*.35,-h*.75],[w*.1,-h*.88],[Math.max(w*.48,grabX),-h*.87]],'#b0bda2',8);
  let y=-h*.25+drop*40;if(phase>3)y-=Math.min(180,(phase-3)*83);
  this.line([[grabX,-h*.87],[grabX,y]],'#b1c2b3',3);const spread=closed?10:47;
  for(const s of[-1,1])this.line([[grabX+s*6,y],[grabX+s*spread,y+34],[grabX+s*(spread-6),y+75],[grabX+s*12,y+84]],'#b1c0a9',11);
  this.rect(-w*.52,-26,w*.44,30,'#54716d');this.rect(-w*.39,-55,36,31,'#263e43');c.restore();
 }
 portal(e){
  if(e.travel==='remontee'){
   const c=this.c,pt=this.project(e.x,e.z),ok=this.engine.exitAvailable(e);c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);
   this.ellipse(0,4,48,12,ok?'#b8cbb51a':'#9d876510');
   for(let j=0;j<3;j++)this.line([[-30,-5+j*7],[0,4+j*7],[30,-5+j*7]],ok?'#bdcaa37a':'#9d876558',3);
   this.text('↑',0,-19,22,ok?'#c0d7b5':'#9a9475','center');this.text('EMBARQUEMENT',0,47,10,'#a7b99d','center');c.restore();return;
  }
  super.portal(e);
 }
 human(actor,role='daniels',moving=false){
  const c=this.c,p=this.project(actor.x,actor.z);const crouch=role==='daniels'&&this.engine.motion.crouch,heal=role==='daniels'&&this.engine.healing>0;
  c.save();if(crouch||heal){c.translate(p.x,p.y);c.scale(1,.72);c.translate(-p.x,-p.y);}super.human(actor,role,moving&&!this.engine.paused);c.restore();
  if(role==='daniels'&&this.engine.reloadTime>0){const t=1-this.engine.reloadTime/1.25;this.line([[p.x+15*actor.facing,p.y-64],[p.x+(29+Math.sin(t*Math.PI)*14)*actor.facing,p.y-48]],'#c7b795',5);}
  if(role==='daniels'&&this.engine.state.flashlight){const face=actor.facing||1,y=p.y-(crouch?48:73),gx=p.x+face*40;
   c.save();c.globalCompositeOperation='screen';this.poly([[gx,y],[gx+face*490,y-105],[gx+face*490,y+82]],this.grad(gx,y,gx+face*490,y,[[0,'#d4e5c721'],[1,'#d4e5c700']]));this.glow(gx,y,17,'#e9edc958');c.restore();}
 }
 curve(points,stroke,width=1,fill=null){const c=this.c;c.beginPath();c.moveTo(points[0][0],points[0][1]);for(const point of points.slice(1)){if(point.length===6)c.bezierCurveTo(...point);else if(point.length===4)c.quadraticCurveTo(...point);else c.lineTo(...point);}if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}}
 creature(e){
  const q=this.engine.state.sequence,copy={...e},c=this.c;
  if(q&&q.enemy===e.id){const phase=q.t;if(q.kind==='crane'){copy.x=q.x;copy.z=q.z;copy.y=phase>3?Math.min(215,(phase-3)*83):0;}else{copy.x=q.x+Math.max(0,phase-2.4)*470;copy.y=Math.max(0,phase-2.4)*17;}}
  const pt=this.project(copy.x,copy.z);if(pt.x<-280||pt.x>this.W+280)return;
  const t=this.engine.state.time,face=e.facing||-1,neo=e.kind==='neomorph',small=e.kind==='facehugger';
  this.ellipse(pt.x,pt.y+6,small?35:55*pt.s,small?4:10,'#020c11ad');
  c.save();c.translate(pt.x,pt.y-(copy.y||0));c.scale(pt.s*face,pt.s);
  const moving=['chase','investigate','lunge'].includes(e.phase),stride=moving?Math.sin(t*(neo?12:9))*18:Math.sin(t*1.7)*1.2;
  const attacking=['windup','lunge'].includes(e.phase),lean=e.phase==='lunge'?29:e.phase==='windup'?12:0;
  if(!e.alive){c.globalAlpha=.52;c.translate(-20,-8);c.rotate(-Math.PI/2);c.scale(.64,.82);}
  if(small){
   const walk=moving?Math.sin(t*24)*6:Math.sin(t*4)*1.5;
   this.curve([[-7,-18],[-38,-24,-57,-2,-72,-11],[-99,-27,-109,-12,-100,-2]],'#b8a781',4);
   for(let n=0;n<4;n++){const start=-15+n*9,phase=Math.sin(t*14+n)*walk;
    this.curve([[start,-16],[start+8,-32-n*2,start+21,-38,35+n*8,-17],[42+n*7+phase,-6,41+n*10+phase,0]],'#796d56',4);
    this.curve([[start,-13],[start-12,-28,-36+n*3,-29,-43+n*3,-17],[-48+n*4+phase,-7,-46+n*5+phase,1]],'#cabb98',3.5);
   }
   this.ellipse(1,-19,23,11,this.grad(-24,-20,24,-11,[[0,'#aa9971'],[.52,'#dacbac'],[1,'#99896d']]));
   this.ellipse(10,-20,8,6,'#b7a78a');for(let n=0;n<5;n++)this.curve([[-14+n*6,-25],[-17+n*6,-19,-16+n*6,-14]],'#75674b',1);
   c.restore();return;
  }
  const dark=neo?'#7c8074':'#122d37',mid=neo?'#b6bcaa':'#355563',light=neo?'#e4e0cb':'#95afa9',rib=neo?'#a2a691':'#5a7d80';
  // Tail: a tapering curve, visibly separate from the pelvis and feet.
  const tailWave=Math.sin(t*2)*13;
  this.curve([[-18,-68],[-48,-21,-103,-10,-149,-33],[-182,-54,-185,-66+tailWave,-202,-66+tailWave]],dark,12);
  this.curve([[-17,-71],[-53,-26,-111,-17,-150,-38],[-180,-57,-184,-65+tailWave,-203,-66+tailWave]],mid,6);
  this.poly([[-202,-66+tailWave],[-215,-72+tailWave],[-211,-53+tailWave]],mid);
  for(let n=0;n<10;n++)this.line([[-42-n*12,-41+Math.sin(n*.28)*15],[-48-n*12,-32+Math.sin(n*.28)*15]],neo?'#d6d6bd33':'#92a9a355',1);
  // Far leg then pelvis, near leg. Knees and raised heels keep the pose digitigrade.
  const leg=(far)=>{const k=far?-1:1,off=far?-11:10,v=far?dark:mid;
   this.curve([[off,-69],[off+28*k,-50,off+29*k,-31,off+9*k+stride*k,-26],[off+2*k+stride*k,-14,off+22*k-stride*k*.25,-6]],v,far?10:13);
   this.curve([[off+22*k-stride*k*.25,-6],[off+30*k-stride*k*.25,-2,off+41*k-stride*k*.25,-2]],far?mid:light,3);
   for(let n=0;n<3;n++)this.line([[off+26*k-stride*k*.25,-3],[off+40*k+5*n-stride*k*.25,2+n]],far?mid:light,1.4);
   this.ellipse(off+25*k,-39,5,8,dark);
  };leg(true);
  const breath=Math.sin(t*3)*1.5,shift=neo?15:0;
  c.save();c.translate(lean,breath+shift);
  // Ribbed, forward leaning thorax with narrow waist.
  this.curve([[-22,-71],[-30,-93,-32,-116,-12,-137],[8,-144,28,-129,24,-111],[20,-94,5,-86,6,-69],[-4,-59,-16,-61,-22,-71]],light,1,this.grad(-31,-130,24,-78,[[0,dark],[.5,mid],[.8,mid],[1,dark]]));
  for(let n=0;n<8;n++){const yy=-128+n*7;this.curve([[-18,yy],[0,yy+8,13,yy+4,21-n*.7,yy-1]],rib,neo?1.8:3.2);this.curve([[-19,yy-1],[-28,yy+3,-24,yy+8]],neo?'#d6d9bd75':'#acc3b23f',1);}
  this.curve([[-18,-129],[-16,-105,-8,-91,-9,-76]],neo?'#c1c6b2':'#809e92',2);
  if(!neo){for(let n=0;n<4;n++){
   this.curve([[-23,-124+n*9],[-37,-152+n*10,-61,-149+n*10,-54,-123+n*8]],'#426773',8-n*.8);
   this.curve([[-25,-125+n*9],[-37,-148+n*10,-57,-146+n*10]],'#9aaea15f',2);
  }}else{for(let n=0;n<4;n++)this.curve([[-18,-101+n*7],[-5,-90+n*5,0,-86+n*5,5,-81+n*4]],'#8b8e7a55',1);}
  // Long forearms and fingers, not mitten placeholders.
  const arm=(near)=>{const ax=near?19:-20,hand=near?(attacking?92:57):-51,hy=attacking?-88:-41;
   this.curve([[ax,-122],[ax+(near?25:-21),-117,ax+(near?36:-30),-97,ax+(near?30:-25),-91],[hand-14,hy-11,hand,hy]],near?mid:dark,near?10:8);
   this.ellipse(hand,hy,5,8,near?mid:dark);for(let n=0;n<4;n++)this.curve([[hand,hy+n*2],[hand+8+n*3,hy+1+n*3,hand+13+n*4,hy+12],[hand+12+n*4,hy+16]],near?light:rib,1.7);
   this.curve([[ax+2,-119],[ax+(near?32:-28),-94,hand-4,hy-1]],near?'#c6d5ba40':'#455c62',2);
  };arm(false);
  // Smooth, eyeless domes; skull volume is drawn with curves and a specular ridge.
  if(!neo){
   this.curve([[-36,-144],[-71,-153,-76,-170,-56,-181],[-39,-193,20,-184,48,-169],[68,-158,69,-146,49,-141],[17,-131,-11,-133,-36,-144]],'#91aca166',1.4,this.grad(-62,-184,36,-135,[[0,'#244654'],[.35,'#567b82'],[.52,'#36545f'],[.78,'#142e39'],[1,'#09202b']]));
   this.curve([[-62,-171],[-40,-186,22,-176,48,-159]],'#a2c0b76a',3);
   this.curve([[-42,-142],[-24,-153,7,-146,18,-137]],'#29434e',6);
  }else{
   this.curve([[-20,-133],[-51,-142,-54,-154,-38,-168],[-19,-189,17,-184,36,-163],[47,-151,62,-137,43,-126],[24,-117,3,-119,-20,-133]],'#dadfbe88',1,this.grad(-40,-180,39,-124,[[0,'#ece6d3'],[.35,'#d8d7c1'],[.73,'#acb5a2'],[1,'#77897a']]));
   this.curve([[-39,-157],[-25,-177,3,-179,23,-163]],'#fcf2d777',2);
   this.curve([[-28,-136],[-12,-148,13,-143,25,-133]],'#a0b19a',3);
  }
  const jawY=neo?-125:-139,mouth=attacking?13:5;
  this.curve([[20,jawY],[34,jawY-5,46,jawY-2,51,jawY+5],[43,jawY+mouth+8,28,jawY+mouth+7,20,jawY]],neo?'#7d8877':'#688d86',2,'#071820');
  for(let n=0;n<6;n++){this.line([[24+n*4,jawY+1],[26+n*4,jawY+6]],'#d7d8c7',1);this.line([[28+n*3,jawY+mouth+6],[29+n*3,jawY+mouth+1]],'#d7d8c7',1);}
  if(attacking&&!neo)this.line([[37,jawY+8],[60,jawY+10]],'#b4c3bb',4);
  this.curve([[48,jawY+4],[55,jawY+16,49,jawY+28,53,jawY+40]],'#b9cdb33b',1);
  arm(true);c.restore();leg(false);
  c.restore();
  if(e.alive&&e.phase==='windup'&&e.attack){const target=this.project(e.attack.x,e.attack.z);c.save();c.setLineDash([7,9]);this.line([[pt.x,pt.y+9],[target.x,target.y+9]],'#d7b08d8a',2);c.setLineDash([]);c.beginPath();c.ellipse(target.x,target.y+8,33,9,0,0,Math.PI*2);c.strokeStyle='#e6c6a792';c.lineWidth=1.5;c.stroke();c.restore();}
 }
 supply(box){
  const c=this.c,s=this.engine.state,pt=this.project(box.x,box.z),used=s.collected.includes(box.id);if(pt.x<-70||pt.x>this.W+70)return;
  c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);this.ellipse(0,4,28,6,'#04141780');this.rect(-25,-33,50,32,used?'#374e47':'#657e75');this.rect(-22,-30,44,7,'#a8b7a1');this.line([[-24,-33],[-25-(used?8:0),-33-(used?28:0)],[25+(used?8:0),-33-(used?28:0)],[25,-33]],used?'#81967f':'#b6c3a6',4);
  if(!used){this.text(box.kind==='medkit'?'+':box.kind==='ammo'?'II':'· ·',0,-9,19,'#d0d8bc','center');if(this.engine.distance(box)<115)this.text('E',0,-53,14,'#dde2b8','center');}c.restore();
 }
 frame(dt=1/60,input={}){
  super.frame(dt,input);const c=this.c,r=this.engine.room,s=this.engine.state,p=s.player;
  for(const l of this.engine.lures){const pt=this.project(l.x,l.z),arc=l.landed?0:Math.sin(Math.min(1,l.t/.65)*Math.PI)*125;
   this.ellipse(pt.x,pt.y-arc-10,4,2,'#d2d9c4');if(l.landed){c.beginPath();c.ellipse(pt.x,pt.y+5,30+(l.t-.65)*34,7+(l.t-.65)*5,0,0,Math.PI*2);c.strokeStyle='#a1c2b255';c.lineWidth=1;c.stroke();}}
  if(s.sequence){const q=s.sequence,amount=q.t/q.duration;
   if(q.kind==='airlock'&&q.t>1.5){for(let i=0;i<46;i++){const x=(i*91+q.t*1000)%(this.W+400)-200,y=200+i*19%460;this.line([[x,y],[x+110,y-9]],'#d4e6da24',1+i%2);}}
   if(q.kind==='crane'){const pt=this.project(p.x,p.z);this.line([[pt.x-18,pt.y-47],[pt.x-120,520]],'#bdcba681',2);}
   this.rect(0,0,this.W,3,'#152e36');this.rect(0,0,this.W*amount,3,'#bfd1bba0');
  }
  // Sparse foreground branches; distance-based fade preserves silhouettes and targets.
  if(['forest','night','garden','planet'].includes(r.theme)){
   for(let i=0;i<Math.ceil(r.width/780);i++){const x=140+i*780-this.camera*1.08,playerX=this.project(p.x,p.z).x,opacity=Math.abs(x-playerX)<160?.14:.46;c.save();c.globalAlpha=opacity;
    for(let j=0;j<7;j++)this.line([[x+j*8,768],[x-27+j*14,703-j%3*17],[x-55+j*19,683-j%4*15]],'#122e29',2+j%2);c.restore();}}
 }
}
root.CovenantRenderer=CovenantRendererV2;
})(globalThis);
