/** V4 draw routines; each device is an independent prop, not a baked illustration. */
const v4Stroke=(c,x,y,xx,yy,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const v4Rect=(c,x,y,w,h,col,r=3)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const v4Text=(c,s,x,y,n=9,col='#d3ceab')=>{c.font=n+'px monospace';c.fillStyle=col;c.fillText(s,x,y);};
const v4Lamp=(c,x,y,on,col='#c6dcb9')=>{c.fillStyle=on?col:'#263c3c';c.beginPath();c.arc(x,y,3.4,0,Math.PI*2);c.fill();if(on){c.fillStyle=col+'20';c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.fill();}};
export function drawServiceWiringV4(renderer,e){
 const c=renderer.c,r=e.room,w=r.wiring;if(!w)return;const x=w.startX-renderer.camera,xx=w.endX-renderer.camera;
 const cols=['#c6ba80','#83bca4','#a5baca'];
 c.save();for(let j=0;j<3;j++){const on=e.channelOn(w.branches[j]);v4Stroke(c,x,w.height+j*8,xx,w.height+j*8,'#0b1b20',6);v4Stroke(c,x,w.height+j*8,xx,w.height+j*8,on?cols[j]:'#3a4f4e',2);}
 for(const p of r.props.filter(p=>['powercab-v4','cameraConsole-v4','security-camera-v4','service-light-v4'].includes(p.type))){const sx=p.x+p.w*.5-renderer.camera;if(sx<0||sx>1280)continue;v4Stroke(c,sx,100,sx,148,'#0e2427',8);v4Stroke(c,sx-2,100,sx-2,148,'#6d8781',2);}
 if(x>-180&&x<1100){v4Rect(c,x,109,173,24,'#11282de8');v4Text(c,r.chapter+' / 2 DEPARTS SUR 3',x+9,125,9);}
 c.restore();
}
export function drawServicePropV4(c,p,x,y,w,h,e,time){
 if(!p.type.endsWith('-v4'))return false;
 c.save();
 if(p.type==='service-light-v4'){
  const yy=147,on=e.channelOn('light')&&e.powered;
  v4Rect(c,x,yy,w,23,'#1a3033');v4Rect(c,x+8,yy+6,w-16,9,on?'#d8dcc3':'#4b625d');
  if(on){const g=c.createRadialGradient(x+w/2,yy+15,4,x+w/2,yy+35,90);g.addColorStop(0,'#ccdbc72a');g.addColorStop(1,'#ccdbc700');c.fillStyle=g;c.fillRect(x-60,yy-50,w+120,180);}
 }else if(p.type==='security-camera-v4'){
  const yy=158,on=e.channelOn('surveillance');v4Rect(c,x+28,yy-28,9,28,'#78918b');v4Stroke(c,x+32,yy-15,x+14,yy-1,'#58736d',5);
  v4Rect(c,x-15,yy-6,51,24,'#88998c');v4Rect(c,x-18,yy-3,9,18,'#101e21');v4Lamp(c,x-15,yy+5,on,'#c3d5a8');
  v4Stroke(c,x-6,yy-2,x+23,yy-2,'#c4c9b7',2);v4Text(c,p.camera,x-24,yy+34,8,'#a7b8a3');
 }else if(p.type==='powercab-v4'){
  v4Rect(c,x+3,y-h,w-6,h,'#1d3438',5);v4Rect(c,x+10,y-h+6,w-20,h-18,'#627b73',3);v4Rect(c,x+15,y-h+15,w-30,20,'#132c30');v4Text(c,e.network.id,x+22,y-h+28,10);
  for(let j=0;j<3;j++){const yy=y-h+49+j*21;v4Rect(c,x+17,yy-6,34,13,'#1a3135');v4Stroke(c,x+22,yy+2,x+45,yy+2,'#d0cba866',2);v4Lamp(c,x+w-24,yy,e.channelOn(['light','extraction','surveillance'][j]));v4Text(c,['L','E','S'][j],x+w-15,yy+3,7);}
  v4Rect(c,x+12,y-18,w-24,8,'#283c3d');for(let j=0;j<5;j++)v4Stroke(c,x+15+j*10,y-18,x+20+j*10,y-10,'#bfac72',3);
  for(const dx of [13,w-15])for(const dy of [-h+7,-10])v4Stroke(c,x+dx-1,y+dy,x+dx+1,y+dy,'#c9cbb1',2);
 }else if(p.type==='workbench-v4'){
  v4Rect(c,x+5,y-h+26,9,h-20,'#566f69');v4Rect(c,x+w-15,y-h+26,9,h-20,'#566f69');v4Rect(c,x,y-h+16,w,15,'#859483');v4Rect(c,x+10,y-15,w-20,9,'#25413e');
  v4Rect(c,x+5,y-h-9,26,28,'#314c4b');v4Rect(c,x+3,y-h-11,31,9,'#a6aea0');v4Stroke(c,x+16,y-h+3,x+46,y-h+3,'#c4c7a6',3);v4Stroke(c,x+41,y-h-5,x+41,y-h+12,'#8c9c86',3);
  v4Rect(c,x+62,y-h+3,37,11,'#3a5952');for(let j=0;j<4;j++)v4Stroke(c,x+67+j*7,y-h+3,x+67+j*7,y-h+10,'#d0bd84',2);v4Text(c,'SERVICE',x+43,y-h+43,8);
 }else if(p.type==='cameraConsole-v4'){
  v4Rect(c,x+14,y-h+45,w-26,h-43,'#304c4c');v4Rect(c,x+1,y-h,w-2,70,'#657e75',7);v4Rect(c,x+8,y-h+8,w-16,47,'#0a2228');
  const on=e.channelOn('surveillance');
  if(on){v4Stroke(c,x+14,y-h+27,x+w-18,y-h+27,'#78a490',1);v4Stroke(c,x+37,y-h+13,x+37,y-h+49,'#78a490',1);v4Lamp(c,x+23,y-h+36,true);v4Lamp(c,x+52,y-h+21,true);v4Text(c,'CAM',x+16,y-h+18,7);}
  else{v4Stroke(c,x+19,y-h+20,x+w-19,y-h+43,'#99725e',2);v4Text(c,'OFF',x+27,y-h+18,7,'#b18d71');}
  v4Rect(c,x-1,y-h+64,w+2,14,'#99a18a');for(let j=0;j<7;j++)v4Rect(c,x+8+j*8,y-h+67,5,3,'#344d45',0);v4Lamp(c,x+w-13,y-26,on);
 }else if(p.type==='scrap-v4'){
  const empty=e.state.salvaged.includes(p.utility);v4Rect(c,x,y-25,w,25,'#526d65');v4Rect(c,x+3,y-22,w-6,18,'#132e32');
  if(!empty){for(let j=0;j<4;j++){v4Rect(c,x+7+j*9,y-19,5,12,'#c5b886',1);v4Stroke(c,x+6+j*9,y-14,x+13+j*9,y-14,'#6e9186',2);}v4Rect(c,x-1,y-31,w+2,7,'#849b88');}
  else{v4Rect(c,x,y-49,w,25,'#809383');v4Rect(c,x+4,y-44,w-8,14,'#3e5a54');v4Text(c,'VIDE',x+9,y-9,8);}
  v4Rect(c,x+19,y-1,10,4,'#bac09f',1);
 }
 c.restore();return true;
}
export function drawCarriedV4(renderer,e){
 const f=e.carrying;if(!f)return;
 const c=renderer.c,p=e.player,scale=.86+p.z*.00105;c.save();c.translate(p.x-renderer.camera,renderer.foot(p.z)-79*scale);c.scale(p.facing*scale,scale);
 // Adult body supported across both shoulders. Separate from the carrier's body/health.
 v4Stroke(c,-30,-5,30,-14,'#4f6966',20);v4Stroke(c,-32,-5,-50,16,'#354c4b',10);v4Stroke(c,-50,16,-55,36,'#263c3c',9);
 v4Stroke(c,-25,2,-31,24,'#47605b',9);v4Stroke(c,-31,24,-38,42,'#263c3c',9);v4Rect(c,-63,33,15,7,'#172a2c');v4Rect(c,-44,39,15,7,'#172a2c');
 v4Stroke(c,8,-16,33,2,'#acb7a6',9);v4Stroke(c,33,2,41,20,'#99aaa0',8);v4Rect(c,37,17,8,9,'#bba78d');
 c.fillStyle='#bba88e';c.beginPath();c.ellipse(38,-16,12,14,.3,0,Math.PI*2);c.fill();v4Stroke(c,30,-28,43,-29,'#52645b',7);v4Text(c,'SECOURS',-21,-35,7,'#d6d4b4');c.restore();
}
export function drawServiceActionV4(renderer,e){
 const a=e.serviceAction;if(!a)return;const c=renderer.c,x=e.player.x-renderer.camera,y=renderer.foot(e.player.z)+29;
 c.save();v4Rect(c,x-56,y,112,7,'#0d2529');v4Rect(c,x-56,y,Math.max(1,112*Math.min(1,a.time/a.duration)),7,'#d3c192',1);v4Text(c,{interact:'E',repair:'M',carry:'P',sensor:'1'}[a.key]+' MAINTENU',x-27,y+20,8);c.restore();
}
