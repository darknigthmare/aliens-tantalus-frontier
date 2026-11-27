import { EARTH_DATA } from './alien-earth-data.js';
import { drawEarthRasterHumanV12, drawEarthRasterBackdropV12 } from './alien-earth-raster-v12.js';
import { drawReferenceHumanV10, drawReferenceWeaponV10, drawReferencePortalV10, drawReferenceBackdropV10 } from './alien-earth-reference-art-v10.js';
const v11rr=(c,x,y,w,h,r=3)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const v11line=(c,x,y,u,v,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke();};
const v11txt=(c,t,x,y,s=10,col='#ccd6c8',a='left')=>{c.font=`${s}px monospace`;c.fillStyle=col;c.textAlign=a;c.fillText(t,x,y);c.textAlign='left';};
const v11oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
export function drawReferenceWeaponV11(c,x,y,id){
 if(!['maxim9','kriss'].includes(id))return drawReferenceWeaponV10(c,x,y,id);
 c.save();c.translate(x,y);
 if(id==='maxim9'){
  c.fillStyle='#1a2023';v11rr(c,-14,-6,49,11,3);c.fillStyle='#50585a';v11rr(c,3,-3,27,5,1);c.fillStyle='#262d30';v11rr(c,-5,4,9,17,2);c.fillStyle='#717979';v11rr(c,30,-4,30,7,2);v11line(c,18,-8,31,-8,'#a3aaa3',2);c.fillStyle='#88b2ad';v11rr(c,7,-10,13,4,1);
 }else{
  c.fillStyle='#181f23';v11rr(c,-18,-8,61,16,4);c.fillStyle='#454f51';v11rr(c,-11,-5,19,10,3);c.fillStyle='#242a2d';v11rr(c,13,4,8,19,2);v11rr(c,-8,4,8,19,2);c.fillStyle='#6c7472';v11rr(c,34,-4,29,6,2);c.fillStyle='#88aaa5';v11rr(c,11,-12,24,5,1);
 }
 c.restore();
}
export function drawReferenceHumanV11(c,x,y,role,pose={}){
 if(drawEarthRasterHumanV12(c,x,y,role,pose))return;
 const weapon=pose.weapon==='maxim9'||pose.weapon==='kriss'?pose.weapon:pose.weapon;
 drawReferenceHumanV10(c,x,y,role,{...pose,weapon});
 if(weapon==='maxim9'||weapon==='kriss'){
  c.save();c.translate(x,y);const f=pose.facing||1,low=pose.lowPassage?32:pose.crouching?21:0;c.scale((pose.scale||1)*f,pose.scale||1);drawReferenceWeaponV11(c,27,-64+low,weapon);c.restore();
 }
 if(['zaveri','rahim','chibuzo','shmuel','malachite','clem','petrovich','teng','sullivan'].includes(role)){
  c.save();c.translate(x,y);c.scale((pose.scale||1)*(pose.facing||1),pose.scale||1);c.fillStyle='#d9d2a7';v11rr(c,-13,-77+(pose.crouching?21:0),10,7,1);v11txt(c,'MGT',-12,-72+(pose.crouching?21:0),5,'#4d5148');c.restore();
 }
}
export const drawReferencePortalV11=(renderer,d,engine)=>drawReferencePortalV10(renderer,d,engine);
export function drawReferenceBackdropV11(renderer,engine){
 drawReferenceBackdropV10(renderer,engine);const c=renderer.c,r=engine.room,cam=renderer.camera,tag=r.setDressing;
 drawEarthRasterBackdropV12(c,r,cam);
 if(!['medbay','engine-room','maginot-containment','neverland-lobby','neverland-atrium','talking-room','neverland-medbay','secure-lab','cryo-extended','engineering-corridor'].includes(tag))return;
 c.save();
 if(tag==='medbay'||tag==='neverland-medbay'){
  c.fillStyle=tag==='medbay'?'#9fa28d':'#d5dccf';v11rr(c,180-cam,176,r.width-360,214,12);for(let j=0;j<5;j++){c.fillStyle=tag==='medbay'?'#3f4d47':'#627e78';v11rr(c,235+j*330-cam,235,250,87,5);v11line(c,248+j*330-cam,249,465+j*330-cam,249,'#d7d9c5',2);}v11txt(c,tag==='medbay'?'MAGINOT / MEDBAY ONE':'NEVERLAND / MEDICAL BAY',r.width/2-cam,210,20,tag==='medbay'?'#e0d7b6':'#28494b','center');
 }else if(tag==='engine-room'||tag==='engineering-corridor'){
  c.fillStyle='#172721';v11rr(c,160-cam,148,r.width-320,260,4);for(let j=0;j<6;j++){const x=230+j*310-cam;v11line(c,x,155,x,403,'#72806e',9);v11line(c,x+35,155,x+35,403,'#364d43',4);for(let k=0;k<5;k++)v11oval(c,x+18,190+k*42,6,6,k%2?'#ca9e5f':'#688b75');}v11txt(c,tag==='engine-room'?'ENGINE ROOM / AUXILIAIRES':'COURSIVE D’INGÉNIERIE',r.width/2-cam,132,18,'#d6ca9d','center');
 }else if(tag==='maginot-containment'){
  c.fillStyle='#1b2a26';v11rr(c,205-cam,190,r.width-410,210,7);for(let j=0;j<4;j++){const x=350+j*420-cam;v11line(c,x,195,x,374,'#a49a78',5);c.strokeStyle='#a49a78';c.beginPath();c.arc(x,330,45,0,Math.PI);c.stroke();c.fillStyle='#31433e';v11rr(c,x-62,275,124,90,5);}v11txt(c,'USCSS MAGINOT / CONTAINMENT ROOM',r.width/2-cam,165,19,'#d3c897','center');
 }else if(tag==='neverland-lobby'){
  c.fillStyle='#ced9cd';v11rr(c,140-cam,170,r.width-280,226,16);c.fillStyle='#809d91';v11rr(c,290-cam,230,530,95,9);v11txt(c,'NEVERLAND / LOBBY',r.width/2-cam,205,24,'#24484a','center');for(let j=0;j<5;j++)v11oval(c,1060+j*170-cam,274,45,70,j%2?'#7fa58e':'#597f70');
 }else if(tag==='neverland-atrium'){
  c.fillStyle='#b8ccc1';v11rr(c,170-cam,165,r.width-340,230,18);for(let j=0;j<7;j++){const x=270+j*290-cam;v11line(c,x,165,x+90,395,'#688d7f',4);v11oval(c,x+80,225,54,66,'#638a70');}v11txt(c,'NEVERLAND / ATRIUM',r.width/2-cam,195,24,'#234c49','center');
 }else if(tag==='talking-room'){
  c.fillStyle='#d8ded1';v11rr(c,250-cam,195,r.width-500,200,18);c.fillStyle='#83968d';v11rr(c,r.width/2-320-cam,300,640,44,20);v11txt(c,'TALKING ROOM',r.width/2-cam,234,22,'#354d4a','center');
 }else if(tag==='secure-lab'){
  c.fillStyle='#203a3c';v11rr(c,165-cam,155,r.width-330,250,9);for(let j=0;j<5;j++){const x=300+j*380-cam;c.fillStyle='#8aa7a07a';v11rr(c,x,225,210,125,10);v11oval(c,x+105,307,24,34,'#a99b70');v11line(c,x+105,284,x+105,335,'#6d6a56',2);}v11txt(c,'SECURE LAB / EGG ROOM',r.width/2-cam,190,20,'#c5d8c8','center');
 }else if(tag==='cryo-extended'){
  for(let j=0;j<6;j++){const x=220+j*300-cam;c.fillStyle='#ccd3c4';v11rr(c,x,230,220,115,50);c.fillStyle='#607d78';v11rr(c,x+18,245,184,65,32);}v11txt(c,'MAGINOT / CRYOGENIC CHAMBER',r.width/2-cam,195,20,'#d8d0aa','center');
 }
 c.restore();
}
