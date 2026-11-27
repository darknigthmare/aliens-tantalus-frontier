/** Architectural signals tied to the actual V3 simulation, not decorative UI screenshots. */
export function drawFloorV3(renderer,engine){
 const c=renderer.c,cam=renderer.camera,r=engine.room;c.save();
 for(const s of r.floorRegions||[]){
  const x=s.x-cam,y=renderer.foot(s.z),h=s.d*1.08,w=s.w;if(x+w<0||x>1280)continue;
  c.fillStyle={quiet:'#81998a0d',tile:'#b0b69a09',grate:'#06141c70',glass:'#a9c2ba10',wet:'#061a254a',soil:'#40513542'}[s.material];c.fillRect(x,y,w,h);
  if(s.material==='grate'){
   c.strokeStyle='#70878138';c.lineWidth=1;
   for(let n=0;n<w;n+=10){c.beginPath();c.moveTo(x+n,y+3);c.lineTo(x+n,y+h-3);c.stroke();}
   for(const fy of [y,y+h]){c.strokeStyle='#83938655';c.lineWidth=2;c.beginPath();c.moveTo(x,fy);c.lineTo(x+w,fy);c.stroke();}
  }else if(s.material==='glass'){
   for(let n=0;n<21;n++){const px=x+12+(n*53)%213,py=y+8+(n*29)%49; c.beginPath();c.moveTo(px,py);c.lineTo(px+7+n%6,py+2);c.lineTo(px+4,py+8);c.closePath();c.fillStyle=n%3===0?'#b6ded657':'#789c9739';c.fill();c.strokeStyle='#c3dfc65b';c.lineWidth=.6;c.stroke();}
  }else if(s.material==='wet'){
   for(let n=0;n<4;n++){c.fillStyle='#92c4bf09';c.beginPath();c.ellipse(x+40+n*49,y+h*.55,34+n*3,11,0,0,Math.PI*2);c.fill();c.strokeStyle='#97bfb524';c.stroke();}
  }else if(s.material==='soil'){
   for(let n=0;n<24;n++){c.fillStyle=n%2?'#9faa7530':'#15231550';c.beginPath();c.ellipse(x+10+n*43%218,y+8+n*19%55,3+n%3,1.5,-n,0,Math.PI*2);c.fill();}
  }else if(s.material==='quiet'){
   c.setLineDash([3,4]);c.strokeStyle='#bac3ae2b';c.strokeRect(x+4,y+3,w-8,h-6);c.setLineDash([]);
  }else{c.strokeStyle='#a9b7a323';c.lineWidth=1;for(let j=0;j<=3;j++){c.beginPath();c.moveTo(x+j*w/3,y);c.lineTo(x+j*w/3,y+h);c.stroke();}}
 }
 // Vestibule markings exist at every actual portal, on its actual depth plane.
 for(const d of r.portals){
  const x=d.x-cam,y=renderer.foot(d.z);if(x<-100||x>1380)continue;
  c.strokeStyle=d.kind==='chapter'?'#c5af7950':'#a7bdad38';c.lineWidth=1;
  c.beginPath();c.moveTo(x-61,y-9);c.lineTo(x-61,y+19);c.lineTo(x+61,y+19);c.lineTo(x+61,y-9);c.stroke();
  for(let j=0;j<6;j++){c.fillStyle=j%2?'#9d98714b':'#13262650';c.fillRect(x-52+j*17,y+13,12,4);}
 }
 c.restore();
}
export function drawPortalStateV3(renderer,engine,d){
 const c=renderer.c,x=d.x-renderer.camera,y=renderer.foot(d.z),v=engine.sealState(d);if(x<-100||x>1380||d.kind!=='door')return;
 c.save();const incoming=engine.incomingForDoor(d);
 if(v.closed){
  c.strokeStyle='#d6aa78';c.lineWidth=6;c.beginPath();c.moveTo(x-36,y-88);c.lineTo(x+36,y-88);c.stroke();c.fillStyle='#a47e50';c.fillRect(x+24,y-99,13,23);
  c.fillStyle='#092426';c.fillRect(x-37,y-26,74,4);c.fillStyle=v.integrity>40?'#d2bd89':'#df8262';c.fillRect(x-37,y-26,74*v.integrity/100,4);
 }else if(v.integrity<=0){c.strokeStyle='#976d54';c.lineWidth=4;c.beginPath();c.moveTo(x-36,y-88);c.lineTo(x-10,y-75);c.moveTo(x+18,y-97);c.lineTo(x+34,y-82);c.stroke();}
 if(incoming){
  const t=renderer.reduced?1:.65+Math.sin(renderer.time*6)*.25;c.globalAlpha=t;c.strokeStyle='#f0b783';c.lineWidth=2;
  for(const n of [0,1]){c.beginPath();c.arc(x,y-180,9+n*5,-.6,Math.PI+.6);c.stroke();}c.globalAlpha=1;
 }
 const route=engine.routeToTracked();if(route?.[0]?.door===d.id){c.fillStyle='#a4d0bb';c.beginPath();c.moveTo(x,y+33);c.lineTo(x-7,y+44);c.lineTo(x+7,y+44);c.closePath();c.fill();}
 c.restore();
}
export function drawFieldActionV3(renderer,engine){
 const active=engine.actionV3?{...engine.actionV3,max:1}:engine.listenWork&&!engine.listenWork.done?{...engine.listenWork,max:1.5}:engine.calmWork&&!engine.calmWork.done?{...engine.calmWork,max:2}:null;
 if(!active)return;const c=renderer.c,x=engine.player.x-renderer.camera,y=renderer.foot(engine.player.z)+27;
 c.save();c.fillStyle='#0b2124';c.fillRect(x-48,y,96,5);c.fillStyle='#bfd7bf';c.fillRect(x-48,y,96*Math.min(active.time/active.max,1),5);c.restore();
}
