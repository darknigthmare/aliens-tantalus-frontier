import { drawReferenceHumanV11, drawReferencePortalV11, drawReferenceBackdropV11 } from './alien-earth-reference-art-v11.js';
import { drawEarthRasterCreatureV12, drawEarthRasterPropV12, isEarthRasterActionActiveV12 } from './alien-earth-raster-v12.js';
import { drawSecurityGroundV9, drawSecurityDeviceV9 } from './alien-earth-security-art-v9.js';
import { drawDuctBackdropV7, drawDuctPropV7, drawDuctHatchV7 } from './alien-earth-ducts-art-v7.js';
import { drawContainmentPadV5 } from './alien-earth-containment-art-v5.js';
import { drawServiceWiringV4, drawServicePropV4, drawCarriedV4, drawServiceActionV4 } from './alien-earth-scenery-v4.js';
import { drawFloorV3, drawPortalStateV3, drawFieldActionV3 } from './alien-earth-scenery-v3.js';
import { drawRoomArchitectureV2, drawPropV2, drawGroundSystemsV2, drawGateV2 } from './alien-earth-scenery-v2.js';
import { drawSensorV6 } from './alien-earth-sensors-art-v6.js';
import { EARTH_DATA } from './alien-earth-data.js';
import { clamp, near } from './alien-earth-core.js';

const PALETTES={
 neverland:{sky:'#8fbbb9',far:'#487879',wall:'#344a4c',edge:'#aec1b7',floor:'#314748',accent:'#eac779',light:'#dce8cf'},
 courtyard:{sky:'#668e8e',far:'#2d5551',wall:'#273b39',edge:'#719184',floor:'#283d37',accent:'#edcc81',light:'#c3dbb9'},
 city:{sky:'#131e2e',far:'#1c3448',wall:'#16252e',edge:'#426374',floor:'#17262e',accent:'#f5b95d',light:'#b5d0d8'},
 wreck:{sky:'#172533',far:'#213544',wall:'#26333a',edge:'#637d82',floor:'#202e31',accent:'#e7a46d',light:'#b6cab9'},
 tower:{sky:'#1c3042',far:'#2b4a56',wall:'#28383e',edge:'#819589',floor:'#253432',accent:'#edca80',light:'#c8d4c9'},
 dock:{sky:'#28424d',far:'#304f54',wall:'#243838',edge:'#547271',floor:'#243935',accent:'#edc579',light:'#c5d7c0'},
 lab:{sky:'#5f8c88',far:'#33554e',wall:'#1f3435',edge:'#62877d',floor:'#233939',accent:'#d8c679',light:'#adcfbd'},
 maginot:{sky:'#1b2423',far:'#283932',wall:'#25332c',edge:'#718272',floor:'#273b31',accent:'#ecb75d',light:'#b3c4a5'},
 tunnel:{sky:'#181f22',far:'#29302f',wall:'#273632',edge:'#5d7464',floor:'#283630',accent:'#d5af63',light:'#b3baa1'},
 jungle:{sky:'#2a3c41',far:'#203d36',wall:'#1d3b30',edge:'#426753',floor:'#22392a',accent:'#e3c68a',light:'#b4c4a0'}
};
const outdoor=k=>['city','courtyard','jungle','dock','wreck'].includes(k);
const hash=n=>{const s=Math.sin(n*917.31+42.713)*93417.171;return s-Math.floor(s);};
const rr=(c,x,y,w,h,r=5)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
const ellipse=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const line=(c,x,y,xx,yy,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
function text(c,str,x,y,size=12,color='#cfddd0',align='left',font='monospace'){
 c.fillStyle=color;c.font=`${size>=20?'600':'500'} ${size}px ${font}`;c.textAlign=align;c.fillText(str,x,y);c.textAlign='left';
}
function leaf(c,x,y,s,ang,col){c.save();c.translate(x,y);c.rotate(ang);c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(s*.5,-s*.5,s,0);c.quadraticCurveTo(s*.5,s*.3,0,0);c.fill();c.restore();}
function tree(c,x,ground,h,col,seed=0){
 c.strokeStyle=col;c.lineWidth=h*.056;c.beginPath();c.moveTo(x,ground);c.bezierCurveTo(x-15,ground-h*.3,x+22,ground-h*.68,x+12,ground-h);c.stroke();
 for(let j=0;j<7;j++){const yy=ground-h*(.46+j*.075),sign=j%2?1:-1,xx=x+sign*(h*.22);line(c,x+6,yy+25,xx,yy-14,col,h*.015);for(let k=0;k<5;k++)leaf(c,xx+(k-2)*14,yy-15,45+h*.13,(j*2+k)*.72,col);}
}
export function drawHuman(c,x,y,role,pose={}){return drawReferenceHumanV11(c,x,y,role,pose);}

function drawXeno(c,x,y,e,t,scale){
 const laboratory=e.kind==='xeno_neverland';if(laboratory)scale*=.93;
 c.save();c.translate(x,y);c.scale(scale*(e.facing||-1),scale);ellipse(c,0,0,31,10,'#000a');
 let bend=e.mode==='windup'?12:0,walk=Math.sin(t*(e.mode==='hunt'?9:3));
 // Tail is a separate silhouette behind the limbs.
 c.strokeStyle='#0b1515';c.lineWidth=10;c.beginPath();c.moveTo(-7,-43);c.bezierCurveTo(-60,-12,-105,-105,-139,-54+walk*5);c.stroke();
 c.strokeStyle='#536762';c.lineWidth=2;c.stroke();c.fillStyle='#1e302b';c.beginPath();c.moveTo(-132,-57);c.lineTo(-156,-47);c.lineTo(-145,-68);c.closePath();c.fill();
 for(const sign of [-1,1]){line(c,sign*9,-47,sign*(24+walk*6),-21,'#102121',12);line(c,sign*(24+walk*6),-21,sign*(28-walk*5),0,'#19302e',9);line(c,sign*11,-46,sign*(22+walk*6),-22,'#5f776f',2);line(c,sign*(28-walk*5),0,sign*43,0,'#243b37',5);}
 c.fillStyle='#112425';c.beginPath();c.ellipse(0,-80+bend,20,36,-.15,0,Math.PI*2);c.fill();
 for(let j=0;j<6;j++){c.strokeStyle=j%2?'#62766a':'#354e48';c.lineWidth=2;c.beginPath();c.ellipse(2,-65-j*6+bend,17,6,-.2,0,Math.PI);c.stroke();}
 for(let j=0;j<3;j++){line(c,-10,-91-j*4+bend,-30,-120-j*9+bend,'#172a29',6);line(c,-10,-91-j*4+bend,-30,-120-j*9+bend,'#62776a',1);}
 line(c,10,-98+bend,33,-70+bend,'#132b2c',9);line(c,33,-70+bend,47,-84+bend+walk*4,'#324a45',7);
 for(let k=0;k<3;k++)line(c,46,-84+bend+walk*4,59+k*3,-88+bend+k*4,'#587167',2);
 const gradient=c.createLinearGradient(-42,-149,40,-112);gradient.addColorStop(0,laboratory?'#849589':'#4e6660');gradient.addColorStop(.3,laboratory?'#526963':'#1c3635');gradient.addColorStop(.75,laboratory?'#213d3b':'#081a1b');gradient.addColorStop(1,laboratory?'#96a79a':'#506c61');
 c.fillStyle=gradient;c.beginPath();c.ellipse(2,-129+bend,47,19,-.13,0,Math.PI*2);c.fill();
 c.strokeStyle='#879b7b';c.lineWidth=1.3;c.beginPath();c.ellipse(4,-132+bend,41,14,-.13,Math.PI,Math.PI*1.85);c.stroke();
 c.fillStyle='#243e35';rr(c,24,-122+bend,20,10,3);c.fill();
 for(let j=0;j<6;j++)line(c,27+j*2,-120+bend,28+j*2,-114+bend,'#afbbb0',1.2);
 c.restore();
}
function drawCreature(c,x,y,e,t,scale){
 if(drawEarthRasterCreatureV12(c,x,y,e,t,scale))return;
 if(e.kind.startsWith('xeno')){drawXeno(c,x,y,e,t,scale);return;}
 c.save();c.translate(x,y);c.scale(scale,scale);
 if(e.kind==='facehugger'){
  ellipse(c,0,0,28,5,'#0009');c.strokeStyle='#a9976c';c.lineWidth=4;c.beginPath();c.moveTo(-3,-8);c.bezierCurveTo(-38,6,-60,-35,-77,-17);c.stroke();
  for(let i=0;i<4;i++)for(const s of [-1,1]){const yy=-13+i*3;line(c,s*8,yy,s*(24+i*2),yy+10+Math.sin(t*14+i)*4,'#bdb085',3);line(c,s*(24+i*2),yy+10+Math.sin(t*14+i)*4,s*34,0,'#7b8060',2);}
  ellipse(c,0,-10,11,14,'#c5b692');line(c,0,-23,0,-2,'#8b825e',3);
 }else if(e.kind==='fly'){
  const bob=Math.sin(t*5)*7;ellipse(c,0,0,20,5,'#0005');c.translate(0,-86+bob);
  for(let s of [-1,1]){c.save();c.rotate(s*(.3+Math.sin(t*41)*.18));ellipse(c,s*25,-11,33,11,'#bbd3c057');line(c,s*2,-5,s*48,-16,'#c7d8ae66',1);c.restore();}
  ellipse(c,0,0,12,24,'#777763');ellipse(c,0,-17,13,12,'#aeb18a');ellipse(c,-8,-19,6,7,'#594233');ellipse(c,8,-19,6,7,'#594233');line(c,0,-7,5,16,'#cdd5a6',2);
  for(let j=0;j<3;j++)for(let s of [-1,1])line(c,s*7,3+j*5,s*(18+j*6),18+j*5,'#859175',2);
 }else if(e.kind==='tick'){
  ellipse(c,0,0,21,6,'#0009');for(let i=0;i<4;i++)for(let s of [-1,1]){line(c,s*9,-15+i*4,s*(26+i),-18+i*5,'#886e55',4);line(c,s*(26+i),-18+i*5,s*(32+i),2,'#7a7a52',2);}
  ellipse(c,0,-17,17,20,'#776441');ellipse(c,0,-18,11,15,'#9b8763');c.fillStyle='#382f25';rr(c,-7,-35,14,8,3);c.fill();
 }else if(e.kind==='orchid'){
  c.strokeStyle='#4f7757';c.lineWidth=7;c.beginPath();c.moveTo(0,-310);c.bezierCurveTo(20,-230,-20,-195,0,-135);c.stroke();
  const length=e.mode==='cooldown'?68:0;c.translate(0,length);
  for(let i=0;i<7;i++){c.save();c.translate(0,-155);c.rotate(i*Math.PI*2/7);leaf(c,0,0,72,0,i%2?'#baaa93':'#907e79');c.restore();}
  ellipse(c,0,-148,23,29,'#341d2e');for(let j=0;j<8;j++)line(c,-16+j*4,-159,-15+j*4,-143,'#d2b9a3',1.5);
  for(let i=0;i<4;i++){c.strokeStyle='#c5b094';c.lineWidth=3;c.beginPath();c.moveTo((i-2)*10,-125);c.bezierCurveTo((i-2)*25,-95,(i-1)*26,-73,(i-2)*16,-53);c.stroke();}
 }else if(e.kind==='eye_caged'){
  ellipse(c,-5,0,38,8,'#0007');for(const x of [-27,-12,13,25])line(c,x,-30,x+2,0,'#6b736b',6);
  for(let i=0;i<12;i++)ellipse(c,(i%4)*15-29,-39+Math.floor(i/4)*-7,15,12,'#a8b3a0');ellipse(c,36,-58,14,12,'#6b776b');
  ellipse(c,42,-60,7,8,'#dfad7e');ellipse(c,44,-60,3,6,'#171d1e');
 }else if(e.kind==='eye_host'){
  c.restore();drawHuman(c,x,y,'arthur',{scale,time:t,moving:e.mode==='hunt',facing:e.facing||-1,raster:false});c.save();c.translate(x,y);c.scale(scale,scale);
  ellipse(c,-7,-101,8,10,'#c6a47e');ellipse(c,-7,-101,3,7,'#171e24');
 }
 c.restore();
}
export class EarthRenderer{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});canvas.width=1280;canvas.height=720;this.camera=0;this.lastRoom=null;this.time=0;this.reduced=false;this.flashlight=false;}
 resetCamera(engine){this.camera=clamp(engine.player.x-400,0,engine.room.width-1280);}
 foot(z){return 411+z*1.08;}
 backdrop(engine){
  if(drawDuctBackdropV7(this,engine))return;
  const c=this.c,r=engine.room,p=PALETTES[r.kit],cam=this.camera,t=this.time;
  const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,p.sky);sky.addColorStop(.65,p.wall);sky.addColorStop(1,'#101a1b');c.fillStyle=sky;c.fillRect(0,0,1280,720);
  // Distant landscape is independent of the playable layer.
  if(outdoor(r.kit)||['tower','neverland','lab'].includes(r.kit)){
   if(['city','tower','wreck'].includes(r.kit)){
    for(let layer=0;layer<3;layer++){
     const off=cam*(.07+layer*.075),count=22;c.fillStyle=layer===0?'#15333c':layer===1?p.far:'#294652';
     for(let i=-2;i<count;i++){const x=i*115-off%(115),h=80+hash(i+layer*41)*220,y=385-h;c.fillRect(x,y,84+hash(i)*22,h);
      for(let yy=y+15;yy<373;yy+=24)for(let xx=x+9;xx<x+74;xx+=19)if(hash(xx+yy+layer)>.52){c.fillStyle=hash(xx+yy)>.6?'#bfa77444':'#7bafa744';c.fillRect(xx,yy,6,9);c.fillStyle=layer===0?'#15333c':layer===1?p.far:'#294652';}
     }
    }
   }else{
    c.fillStyle=p.far;c.beginPath();c.moveTo(0,360);for(let x=0;x<=1280;x+=25)c.lineTo(x,262+Math.sin((x+cam*.13)*.005)*30+Math.cos(x*.018)*13);c.lineTo(1280,450);c.lineTo(0,450);c.fill();
    for(let j=-1;j<10;j++)tree(c,j*177-(cam*.2)%177,430,180+hash(j)*110,j%2?'#284b40':'#31584b',j);
   }
  }
  if(!outdoor(r.kit)){
   // Repeating architectural bays, not a painted rectangular wallpaper over the level.
   const cw=['maginot','tunnel'].includes(r.kit)?244:320;
   for(let i=Math.floor(cam/cw)-1;i<(cam+1280)/cw+1;i++){
    const x=i*cw-cam;
    if(['neverland','tower','lab'].includes(r.kit)){
     const grad=c.createLinearGradient(0,0,0,415);grad.addColorStop(0,'#111f25bb');grad.addColorStop(.55,'#223b3980');grad.addColorStop(1,'#21302bd9');c.fillStyle=grad;c.fillRect(x,34,cw,364);
     c.fillStyle=p.edge;rr(c,x+6,34,15,378,3);c.fill();c.fillStyle='#091d22';c.fillRect(x+21,33,7,378);
     c.fillStyle='#10242a';c.fillRect(x+26,55,cw-37,14);c.fillRect(x+26,268,cw-37,12);c.fillRect(x+26,375,cw-37,27);
     line(c,x+35,73,x+cw-24,242,'#c0d9c518',7);line(c,x+50,71,x+cw-12,212,'#e6efe51a',2);
     if(r.kit==='lab'){c.fillStyle='#09282299';c.fillRect(x+44,110,cw-75,145);text(c,'PRODIGY',x+58,134,10,'#a1bc8d');line(c,x+58,146,x+cw-48,146,'#76a49c55',1);}
    }else{
     c.fillStyle=p.wall;c.fillRect(x,0,cw,418);
     c.fillStyle='#17251f';rr(c,x+22,26,cw-44,345,44);c.fill();
     const g=c.createLinearGradient(x,0,x+cw,0);g.addColorStop(0,p.edge);g.addColorStop(.17,'#35463b');g.addColorStop(.84,'#14221d');g.addColorStop(1,p.edge);c.strokeStyle=g;c.lineWidth=17;rr(c,x+22,26,cw-44,373,50);c.stroke();
     for(let j=0;j<5;j++)line(c,x+32+j*6,97,x+32+j*6,320,'#779c6a22',1);
     c.fillStyle='#1c2c25';rr(c,x+57,108,cw-115,165,13);c.fill();
     for(let j=0;j<6;j++)line(c,x+67,128+j*22,x+cw-66,128+j*22,'#8ca87619',3);
     c.fillStyle=engine.powered?p.light:'#334c43';rr(c,x+60,33,cw-120,7,3);c.fill();
    }
   }
   // Cables and ceiling are grounded in the architecture.
   c.fillStyle='#101d24';c.fillRect(0,0,1280,26);c.fillStyle=p.edge;c.fillRect(0,26,1280,3);
   for(let j=0;j<3;j++){line(c,0,12+j*5,1280,12+j*5,'#53655d',2);}
   c.fillStyle='#1a2a2c';c.fillRect(0,398,1280,19);line(c,0,417,1280,417,p.edge,2);
  }else{
   if(r.kit==='courtyard'){
    for(let i=Math.floor(cam/650)-1;i<(cam+1280)/650+1;i++){const x=i*650-cam;c.fillStyle='#b1b7a399';c.fillRect(x,58,22,354);c.fillRect(x+430,58,22,354);line(c,x,65,x+450,65,'#a3b29d',18);line(c,x+11,75,x+195,170,'#859985',5);c.fillStyle='#20403a99';c.fillRect(x+35,186,375,153);for(let j=0;j<5;j++)line(c,x+45+j*82,185,x+45+j*82,340,'#638774',5);}
   }
   if(r.kit==='city'||r.kit==='wreck'){
    c.fillStyle='#12222c';c.fillRect(0,335,1280,87);
    for(let i=Math.floor(cam/340)-1;i<(cam+1280)/340+1;i++){const x=i*340-cam;c.fillStyle='#2b3e45';c.fillRect(x,80,24,340);line(c,x+25,82,x+148,30,'#3e5256',9);c.fillStyle='#859a9477';c.fillRect(x+47,345,260,47);for(let j=0;j<5;j++)line(c,x+62,351+j*7,x+295,351+j*7,'#1a3038',2);c.fillStyle='#e5ae7777';c.fillRect(x+100,318,95,14);text(c,'NEW SIAM',x+148,328,9,'#16282b','center');}
    if(r.kit==='wreck'){c.fillStyle='#09191ee0';c.beginPath();c.moveTo(0,30);c.lineTo(420,0);c.lineTo(850,185);c.lineTo(840,221);c.lineTo(445,80);c.lineTo(0,119);c.closePath();c.fill();for(let x=0;x<1000;x+=67)line(c,x,45,x+15,92,'#70888955',9);}
   }
   if(r.kit==='dock'){
    c.fillStyle='#182f36';c.fillRect(0,303,1280,122);
    for(let i=0;i<50;i++)line(c,hash(i)*1280,312+hash(i+2)*108,hash(i)*1280+40+Math.sin(t+i)*10,312+hash(i+2)*108,'#84adab22',1);
    for(let x=-cam%180;x<1280;x+=180){c.fillStyle='#617f74';c.fillRect(x,324,12,102);line(c,x,351,x+185,351,'#92a68b',4);line(c,x,387,x+185,387,'#738d82',3);}
   }
   if(r.kit==='jungle')for(let j=0;j<8;j++)tree(c,j*245-(cam*.75)%245,460,320+hash(j)*95,j%2?'#213e2d':'#2c5137');
  }
  drawRoomArchitectureV2(c,r,cam,t,engine.powered);
  // Floor begins exactly at the base of the structural wall.
  const fg=c.createLinearGradient(0,414,0,720);fg.addColorStop(0,p.floor);fg.addColorStop(1,'#132321');c.fillStyle=fg;c.fillRect(0,419,1280,301);
  for(let z=25;z<=225;z+=40){const y=this.foot(z);line(c,0,y,1280,y,'#afc2a616',1);}
  for(let x=Math.floor(cam/155)*155;x<cam+1500;x+=155){const sx=x-cam;line(c,sx,420,sx+(sx-640)*.19,720,'#abcdb312',1);}
  if(['city','wreck','dock'].includes(r.kit))for(let i=0;i<22;i++){const x=(i*139-cam*.9)%1500,y=472+hash(i)*190;ellipse(c,x,y,22+hash(i+1)*50,2+hash(i)*7,'#c7dcc614');}
  if(r.kit==='jungle')for(let i=0;i<45;i++)leaf(c,(i*87-cam)%1450,455+hash(i)*245,10+hash(i+10)*12,i,'#69895145');
  if(!r.duct){c.fillStyle='#2c4542';c.fillRect(0,419,1280,this.foot(25)-419);line(c,0,this.foot(25),1280,this.foot(25),'#758b7f',2);}
  drawReferenceBackdropV11(this,engine);
  // A wall sign locates the room without an oversized overlay.
  const sx=230-cam,sy=r.id==='R18'?146:304;if(sx>-220&&sx<1250){c.fillStyle='#101f24d9';rr(c,sx,sy,230,68,3);c.fill();c.fillStyle=p.accent;c.fillRect(sx,sy,3,68);text(c,engine.chapter.id+' / '+r.level,sx+17,sy+22,11,p.accent);text(c,r.title.toUpperCase(),sx+17,sy+47,r.id==='R18'?10:12,p.light);}
 }
 prop(p,engine){
  const c=this.c,cam=this.camera,x=p.x-cam,y=this.foot(p.z),palette=PALETTES[engine.room.kit],w=p.w,h=p.h,d=p.d*.9;
  if(x+w<-100||x>1380)return;
  c.save();
  const player=engine.player,occludes=p.z>player.z&&Math.abs(player.x-(p.x+p.w/2))<p.w/2+30;
  if(occludes)c.globalAlpha=.34;
  if(drawDuctPropV7(this,p,engine)){c.restore();return;}
  if(drawContainmentPadV5(this,p,engine,drawCreature)){c.restore();return;}
  if(drawServicePropV4(c,p,x,y,w,h,engine,this.time)){c.restore();return;}
  if(p.type.startsWith('wall-')){
   if(drawEarthRasterPropV12(c,p,x,y,w,h,engine)){c.restore();return;}
   const yy=225;if(p.type==='wall-light'){c.fillStyle='#172d2c';rr(c,x,yy,52,16,5);c.fill();c.fillStyle=engine.powered?palette.light:'#304846';rr(c,x+6,yy+4,40,6,2);c.fill();
    const g=c.createRadialGradient(x+26,yy+10,0,x+26,yy+10,90);g.addColorStop(0,palette.light+(engine.powered?'15':'00'));g.addColorStop(1,palette.light+'00');c.fillStyle=g;c.fillRect(x-65,yy-50,180,160);
   }else{c.fillStyle='#152727';rr(c,x,yy-15,55,57,3);c.fill();for(let j=0;j<5;j++)line(c,x+8,yy+j*6,x+44,yy+j*6,'#7d998355',2);}
   c.restore();return;
  }
  ellipse(c,x+w*.5,y+d,w*.56,11,'#0005');
  if(drawEarthRasterPropV12(c,p,x,y,w,h,engine)){c.restore();return;}
  if(drawPropV2(c,p,x,y,w,h,engine,this.time)){c.restore();return;}
  if(p.type==='tree'){tree(c,x+w*.5,y+d,h+150,'#183323');for(let j=0;j<4;j++)leaf(c,x+w*.5,y-h/2,70,j+Math.PI/2,'#456548');}
  else if(p.type==='planter'){
   c.fillStyle='#304839';rr(c,x+5,y-36,w-10,40+d,7);c.fill();c.fillStyle='#677963';rr(c,x,y-42,w,12,4);c.fill();
   for(let j=0;j<8;j++)leaf(c,x+w*.5+(j%3)*8,y-38,50+j*5,-Math.PI+j*.37,j%2?'#607d51':'#3b6147');
  }else if(p.type==='tank'){
   c.fillStyle='#152a28';rr(c,x+4,y-h,w-8,h+d,19);c.fill();
   const glass=c.createLinearGradient(x,0,x+w,0);glass.addColorStop(0,'#6d9c7977');glass.addColorStop(.45,'#35695a55');glass.addColorStop(.85,'#aac9a366');glass.addColorStop(1,'#142e29');c.fillStyle=glass;rr(c,x+15,y-h+15,w-30,h-27,17);c.fill();
   for(let j=0;j<8;j++)ellipse(c,x+28+hash(j+p.x)*60,y-h+28+((this.time*14+j*23)%(h-38)),2,2,'#aac29655');
   c.fillStyle='#869588';rr(c,x,y-h,w,15,4);c.fill();rr(c,x,y-13,w,20+d,4);c.fill();line(c,x+23,y-h+20,x+23,y-25,'#b5d6ae66',4);
  }else if(p.type==='console'&&w<70){
   c.fillStyle='#2e4741';rr(c,x+7,y-h,w-14,h+d,4);c.fill();c.fillStyle='#0e2729';rr(c,x+11,y-h+7,w-22,h*.44,2);c.fill();
   for(let j=0;j<3;j++)line(c,x+14,y-h+14+j*6,x+w-14,y-h+14+j*6,'#d0c48c',1);
   c.fillStyle='#c6bc84';c.fillRect(x+14,y-17,w-28,4);
  }else if(p.type==='console'){
   c.fillStyle='#334c45';c.beginPath();c.moveTo(x+8,y+d);c.lineTo(x+8,y-h*.55);c.lineTo(x+30,y-h);c.lineTo(x+w-12,y-h);c.lineTo(x+w,y+d);c.closePath();c.fill();
   c.fillStyle='#0d2424';rr(c,x+25,y-h+9,w-45,h*.43,4);c.fill();
   for(let j=0;j<4;j++){line(c,x+34,y-h+19+j*9,x+w-29-j*9,y-h+19+j*9,'#b7ca8b88',2);}
   for(let j=0;j<6;j++){c.fillStyle=j%3?'#9faa8c':'#d5b476';c.fillRect(x+23+j*12,y-42,6,5);}
   line(c,x+15,y-16,x+w-10,y-16,'#718e75',2);
  }else if(p.type==='bed'||p.type==='cryo'){
   c.fillStyle='#233a35';rr(c,x+9,y-h*.52,w-18,h*.56+d,16);c.fill();c.fillStyle='#738a7c';rr(c,x,y-h*.6,w,h*.28,12);c.fill();
   c.fillStyle=p.type==='cryo'?'#5d91784f':'#adbba2';rr(c,x+8,y-h*.72,w-16,h*.27,15);c.fill();
   c.fillStyle='#172c2a';rr(c,x+14,y-h*.78,35,17,5);c.fill();for(let j=0;j<4;j++)line(c,x+16+j*26,y-h*.36,x+16+j*26,y-h*.28,'#34483c',2);
  }else if(p.type==='sofa'||p.type==='bench'){
   c.fillStyle='#50605a';rr(c,x+10,y-64,w-20,42,7);c.fill();c.fillStyle='#879485';rr(c,x+5,y-41,w-10,30,7);c.fill();for(let j=0;j<3;j++)line(c,x+28+j*40,y-61,x+28+j*40,y-14,'#344841',1);
   c.fillStyle='#273c34';c.fillRect(x+13,y-13,8,20+d);c.fillRect(x+w-23,y-13,8,20+d);
  }else if(p.type==='barrier'){
   c.fillStyle='#2d403c';c.fillRect(x+8,y-66,8,75+d);c.fillRect(x+w-16,y-66,8,75+d);c.fillStyle='#b9af7c';c.fillRect(x,y-68,w,28);for(let j=0;j<w;j+=28){c.fillStyle='#344139';c.beginPath();c.moveTo(x+j,y-68);c.lineTo(x+j+14,y-68);c.lineTo(x+j+28,y-40);c.lineTo(x+j+14,y-40);c.fill();}
  }else if(p.type==='pipe'||p.type==='rib'){
   c.strokeStyle='#172822';c.lineWidth=32;c.beginPath();c.moveTo(x+16,y+d);c.lineTo(x+16,y-h+23);c.quadraticCurveTo(x+w*.5,y-h-34,x+w-12,y-h+10);c.stroke();c.strokeStyle='#6b8370';c.lineWidth=3;c.stroke();for(let j=0;j<5;j++)line(c,x-1,y-j*22,x+32,y-j*22,'#9caa8677',3);
  }else if(p.type==='wreck'){
   c.fillStyle='#4e625c';c.beginPath();c.moveTo(x,y+d);c.lineTo(x+7,y-38);c.lineTo(x+30,y-60);c.lineTo(x+w*.7,y-56);c.lineTo(x+w,y-20);c.lineTo(x+w,y+d);c.closePath();c.fill();c.fillStyle='#112930';c.beginPath();c.moveTo(x+33,y-53);c.lineTo(x+w*.62,y-52);c.lineTo(x+w*.75,y-30);c.lineTo(x+30,y-29);c.fill();ellipse(c,x+25,y+d-1,16,16,'#14231f');ellipse(c,x+w-25,y+d-1,16,16,'#14231f');line(c,x+4,y-21,x+w-4,y-20,'#bcc3a488',2);
  }else if(p.type==='rock'){
   c.fillStyle='#4d6050';c.beginPath();c.moveTo(x,y+d);c.lineTo(x+10,y-34);c.lineTo(x+53,y-61);c.lineTo(x+w-24,y-43);c.lineTo(x+w,y+d);c.fill();line(c,x+11,y-34,x+53,y-61,'#819176',3);
  }else{
   c.fillStyle='#273f35';rr(c,x,y-h*.8,w,h*.8+d,7);c.fill();c.fillStyle='#6a7b65';rr(c,x+5,y-h*.8+5,w-10,8,2);c.fill();line(c,x+w*.5,y-h*.8+18,x+w*.5,y-5,'#8e9e7e55',2);for(let j=0;j<3;j++){line(c,x+10,y-23-j*20,x+w-10,y-23-j*20,'#142920',3);}
   c.fillStyle='#c4b778';c.fillRect(x+12,y-50,22,13);text(c,'P',x+19,y-40,9,'#243c2a');
  }
  c.restore();
 }
 portal(d,engine){
  if(drawReferencePortalV11(this,d,engine)){if(d.kind==='door'&&!d.hatchKey)drawPortalStateV3(this,engine,d);return;}
  if(drawDuctHatchV7(this,d,engine))return;
  const c=this.c,x=d.x-this.camera,y=this.foot(d.z),active=near(engine.player,d),p=PALETTES[engine.room.kit];
  if(x<-120||x>1380)return;
  const done=!d.requires||d.requires.every(id=>engine.state.completed.includes(id)),col=done?p.accent:'#ad826a';
  c.fillStyle='#11232ab8';rr(c,x-44,y-154,88,156,13);c.fill();c.strokeStyle=col+'aa';c.lineWidth=2;c.stroke();
  const gradient=c.createLinearGradient(x-32,0,x+32,0);gradient.addColorStop(0,'#3e61595e');gradient.addColorStop(.5,'#213d3b44');gradient.addColorStop(1,'#9ab49b44');c.fillStyle=gradient;rr(c,x-32,y-137,64,137,8);c.fill();
  line(c,x,y-133,x,y-8,'#91af9a66',2);c.fillStyle=col;c.fillRect(x+22,y-67,4,13);
  line(c,x-50,y+4,x+50,y+4,col,3);
  if(d.kind==='chapter'){text(c,'TRANSFERT',x,y-164,10,col,'center');}
  else {const dest=EARTH_DATA.rooms.find(r=>r.id===d.to);text(c,(dest?.title||d.label).slice(0,27).toUpperCase(),x,y-164,9,'#bdccbe','center');if(d.shortcut)text(c,'PASSAGE DE SECOURS',x,y-179,8,'#a3c9b1','center');}
  drawPortalStateV3(this,engine,d);
  if(active){text(c,'E',x,y-58,20,col,'center');}
 }
 task(engine){
  if(engine.room.duct)return;
  const c=this.c,r=engine.room,t=r.task,x=t.x-this.camera,y=this.foot(t.z),done=engine.state.completed.includes(t.id),active=near(engine.player,t),p=PALETTES[r.kit];
  if(x<-130||x>1380)return;
  if(t.kind==='talk'&&t.speaker!=='Wendy'){
   const role=EARTH_DATA.speakerRoles[t.speaker]||'civil';drawHuman(c,x,y,role,{scale:.94,time:this.time,facing:-1,chapter:engine.state.chapter});
  }else if(t.kind==='rescue'){
   this.prop({x:t.x-52,z:t.z,w:95,d:18,h:73,type:'console'},engine);
   if(t.reward?.survivor&&!engine.state.survivors[t.reward.survivor])drawHuman(c,x-55,y,'civil',{scale:.9,time:0,crouching:true});
   if(t.id==='AE-11'&&!done)drawHuman(c,x-65,y,'joe',{scale:.85,time:0,crouching:!done,facing:1});
  }else this.prop({x:t.x-48,z:t.z,w:96,d:18,h:t.kind==='scan'?98:85,type:'console'},engine);
  if(!done){
   const bob=this.reduced?0:Math.sin(this.time*2)*3;
   c.strokeStyle=p.accent;c.lineWidth=1.7;c.save();c.translate(x,y-149+bob);c.rotate(Math.PI/4);c.strokeRect(-5,-5,10,10);c.restore();
   if(active)text(c,'E',x,y-165,16,p.accent,'center');
  }else{c.strokeStyle='#94c39b';c.lineWidth=2;line(c,x-5,y-139,x-1,y-135,'#94c39b',2);line(c,x-1,y-135,x+6,y-144,'#94c39b',2);}
 }
 draw(engine,dt=0){
  const c=this.c;this.time+=this.reduced?0:Math.min(dt,.05);
  if(this.lastRoom!==engine.room.id){this.lastRoom=engine.room.id;this.resetCamera(engine);}
  const target=clamp(engine.player.x-490,0,engine.room.width-1280);this.camera+= (target-this.camera)*Math.min(1,dt*7.5||1);
  this.backdrop(engine);drawServiceWiringV4(this,engine);drawFloorV3(this,engine);const r=engine.room,p=engine.player,palette=PALETTES[r.kit];
  if(engine.state.presentation==='CLASSIC'&&r.mode!=='SIDE'){
   for(const z of [50,125,200])line(c,0,this.foot(z)+8,1280,this.foot(z)+8,z===p.z?'#e4cc7d44':'#aac29f18',1);
   for(const px of r.passages){const x=px-this.camera;if(x>0&&x<1280){line(c,x,this.foot(50),x,this.foot(200),'#ddc77b38',3);text(c,'↕',x,this.foot(200)+24,17,'#c5b98777','center');}}
  }
  for(const h of engine.hazards){const x=h.x-this.camera,y=this.foot(h.z);ellipse(c,x,y,h.radius,20,'#b3b65744');ellipse(c,x+3,y-2,h.radius*.7,11,'#b7c36b55');}
  for(const e of engine.enemies)if(e.mode==='windup'){
   const x=e.kind==='fly'?e.target.x-this.camera:e.x-this.camera,y=this.foot(e.kind==='fly'?e.target.z:e.z);
   c.strokeStyle='#ef9e73';c.lineWidth=2;c.beginPath();c.ellipse(x,y,e.kind==='orchid'?85:55,22,0,0,Math.PI*2);c.stroke();text(c,'!',x,y-9,18,'#ffd6ab','center');
  }
  drawGroundSystemsV2(this,engine);drawSecurityGroundV9(this,engine);
  const queue=r.props.filter(o=>o.render!==false).map(o=>({z:o.z+o.d*.3,draw:()=>this.prop(o,engine)}));
  if(r.gate)queue.push({z:240,draw:()=>drawGateV2(this,engine)});
  for(const i of r.interactables||[]){if(engine.nearestInteraction()?.id===i.id)queue.push({z:i.z,draw:()=>text(c,'E',i.x-this.camera,this.foot(i.z)-110,15,palette.accent,'center')});}
  for(const d of r.portals)queue.push({z:d.z-7,draw:()=>this.portal(d,engine)});
  queue.push({z:r.task.z,draw:()=>this.task(engine)});
  const ar=r.archive;if(!engine.state.archives.includes(ar.id)){queue.push({z:ar.z,draw:()=>{
   const x=ar.x-this.camera,y=this.foot(ar.z);this.prop({x:ar.x-20,z:ar.z,w:40,d:10,h:56,type:'console'},engine);text(c,'▤',x,y-76,18,palette.accent,'center');
  }});}
  for(const e of engine.enemies)queue.push({z:e.z,draw:()=>{
   drawCreature(c,e.x-this.camera,this.foot(e.z),e,this.time,.86+e.z*.00105);
   if((engine.gear?.foamUntil[e.id]||0)>engine.state.playSeconds){c.fillStyle='#c9d7c088';c.beginPath();c.ellipse(e.x-this.camera,this.foot(e.z)-43,36,56,0,0,Math.PI*2);c.fill();text(c,'MOUSSE',e.x-this.camera,this.foot(e.z)-107,9,'#e0e6cb','center');}
   if(e.stun>0){c.strokeStyle='#92ccc5';c.lineWidth=2;c.beginPath();c.arc(e.x-this.camera,this.foot(e.z)-170,9,this.time*2,this.time*2+Math.PI*1.7);c.stroke();}
   if(e.kind==='eye_caged'){
    c.fillStyle='#6caa9230';rr(c,e.x-this.camera-82,this.foot(e.z)-145,164,151,14);c.fill();c.strokeStyle='#a7c6ae77';c.lineWidth=3;c.stroke();line(c,e.x-this.camera-60,this.foot(e.z)-124,e.x-this.camera-60,this.foot(e.z)-17,'#dde7cf55',3);
   }
  }});
  for(const f of Object.values(engine.state.survivors||{}))if(f.room===r.id&&engine.state.carryId!==f.id&&!['rescued','left'].includes(f.status))queue.push({z:f.z+.05,draw:()=>{
   drawHuman(c,f.x-this.camera,this.foot(f.z),'civil',{time:this.time,moving:f.moving,crouching:f.status==='down'||!!r.duct,lowPassage:!!r.duct,scale:.86+f.z*.00105,facing:f.x<p.x?1:-1});
   text(c,engine.survivorDef(f.id).name.toUpperCase(),f.x-this.camera,this.foot(f.z)-135,9,'#c5d2c2','center');
   if(f.stress>20&&f.status!=='down'){c.fillStyle='#132526';c.fillRect(f.x-this.camera-26,this.foot(f.z)-126,52,3);c.fillStyle=f.stress>=75?'#e4a17b':'#cabc8e';c.fillRect(f.x-this.camera-26,this.foot(f.z)-126,52*f.stress/100,3);}
   if(f.status==='down')text(c,'U KIT / P PORTER',f.x-this.camera,this.foot(f.z)-151,9,'#e6ba8d','center');
  }});
  if(engine.state.escort)queue.push({z:engine.escortActor.z,draw:()=>drawHuman(c,engine.escortActor.x-this.camera,this.foot(engine.escortActor.z),'joe',{time:this.time,moving:engine.moving,crouching:!!r.duct,lowPassage:!!r.duct,scale:.86+engine.escortActor.z*.00105,facing:p.facing})});
  queue.push({z:p.z+.1,draw:()=>{
   c.save();if(engine.hidden)c.globalAlpha=.22;else if(engine.iframe>0&&engine.iframe<.9)c.globalAlpha=.7+Math.sin(this.time*33)*.2;
   drawHuman(c,p.x-this.camera,this.foot(p.z),engine.character.id,{time:this.time,scale:.86+p.z*.00105,moving:engine.moving,acting:isEarthRasterActionActiveV12(engine),crouching:engine.crouching,lowPassage:!!r.duct,carrying:!!engine.carrying,facing:p.facing,chapter:engine.state.chapter,weapon:engine.weaponId,cutterIntact:engine.gear?.cutterIntact,initial:!engine.state.completed.includes('AE-01')});drawCarriedV4(this,engine);c.restore();
  }});
  for(const d of engine.localSensors())queue.push({z:d.z+.08,draw:()=>drawSensorV6(this,engine,d)});
  if(engine.localSecurity)queue.push({z:engine.localSecurity.sensor.z+.04,draw:()=>drawSecurityDeviceV9(this,engine)});
  queue.sort((a,b)=>a.z-b.z);queue.forEach(o=>o.draw());
  for(const b of engine.projectiles){const x=b.x-this.camera,y=this.foot(b.z)-65;if(b.kind==='bullet')line(c,x,y,x-Math.sign(b.dx)*20,y,'#e4d6a6',3);else ellipse(c,x,y,6,5,'#c8c782');}
  for(const effect of engine.effects){const x=effect.x-this.camera,y=this.foot(effect.z)-60;
   if(effect.kind==='resonance'||effect.kind==='push'){c.strokeStyle=effect.kind==='resonance'?'#a0dad9aa':'#efd598aa';c.lineWidth=2;c.beginPath();c.ellipse(x,y,(1.2-effect.ttl)*150+15,(1.2-effect.ttl)*85+10,0,0,Math.PI*2);c.stroke();}
   if(effect.kind==='arc-v10')line(c,x,y,effect.toX-this.camera,this.foot(effect.toZ)-65,'#b9e1e9',3);
   if(effect.kind==='blade-v10')line(c,x,y,x+p.facing*89,y-35,'#e1e4d3',3);
   if(effect.kind==='muzzle'){c.fillStyle='#f7dfab';c.beginPath();c.moveTo(x,y);c.lineTo(x+p.facing*30,y-5);c.lineTo(x+p.facing*18,y+3);c.lineTo(x+p.facing*33,y+11);c.closePath();c.fill();}
  }
  // Foreground tied to the scene. It never covers the entire playable surface.
  if(r.kit==='jungle')for(const sx of [20,1270]){for(let j=0;j<5;j++)leaf(c,sx,740,120,-1.8+j*.35,'#09251ad9');}
  else{c.fillStyle='#071617c9';c.fillRect(0,704,1280,16);line(c,0,704,1280,704,'#76957a44',2);}
  if(['city','wreck'].includes(r.kit)&&!this.reduced){
   for(let j=0;j<105;j++){const x=(hash(j)*1500-this.time*140)%1400,y=(hash(j+12)*900+this.time*630)%800;line(c,x,y,x-6,y+21,'#b7d1da22',1);}
  }
  if(!engine.powered){c.fillStyle='#00101735';c.fillRect(0,0,1280,720);}
  if(engine.state.lightOn){const x=p.x-this.camera,y=this.foot(p.z)-75;c.save();c.globalCompositeOperation='screen';const glow=c.createRadialGradient(x+p.facing*150,y,5,x+p.facing*150,y,220);glow.addColorStop(0,'#bdd6ba18');glow.addColorStop(1,'#bdd6ba00');c.fillStyle=glow;c.fillRect(x-250,y-250,500,500);c.restore();}
  const vignette=c.createRadialGradient(640,350,250,640,350,780);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,engine.powered?'#020c0a55':'#020c0a99');c.fillStyle=vignette;c.fillRect(0,0,1280,720);
  drawFieldActionV3(this,engine);drawServiceActionV4(this,engine);
  if(engine.hold){const x=p.x-this.camera,y=this.foot(p.z)+23;c.fillStyle='#132526';c.fillRect(x-46,y,92,5);c.fillStyle=palette.accent;c.fillRect(x-46,y,92*clamp(engine.hold.time/r.task.duration,0,1),5);}
 }
}
