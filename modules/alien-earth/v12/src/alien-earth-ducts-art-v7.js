import { ductFanStateV7 } from './alien-earth-ducts-v7.js';
const ductInkV7={metal:'#466568',edge:'#8fa5a0',pale:'#c7d1bc',gold:'#deb76f',danger:'#e6a47d',black:'#081619'};
const ductTextV7=(c,t,x,y,size=11,col=ductInkV7.pale,align='left')=>{c.fillStyle=col;c.font=`600 ${size}px monospace`;c.textAlign=align;c.fillText(t,x,y);c.textAlign='left';};
const ductRectV7=(c,x,y,w,h,rad=4)=>{c.beginPath();c.roundRect(x,y,w,h,rad);};
const ductLineV7=(c,x,y,xx,yy,col,width=1)=>{c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=col;c.lineWidth=width;c.stroke();};
export function drawDuctBackdropV7(v,e){
 if(!e.room.duct)return false;
 const c=v.c,cam=v.camera,r=e.room,ground=v.foot(125),mag=r.kit==='maginot',lab=r.kit==='lab';
 c.fillStyle=lab?'#192b2b':mag?'#1b2722':'#111f26';c.fillRect(0,0,1280,720);
 const shades=c.createLinearGradient(0,0,0,ground);shades.addColorStop(0,'#041014');shades.addColorStop(.65,lab?'#355251':'#283b40');shades.addColorStop(1,'#081416');c.fillStyle=shades;c.fillRect(0,0,1280,ground);
 // Service machinery above the low passage gives the cross section a physical roof.
 for(let i=Math.floor(cam/250)-1;i<(cam+1280)/250+1;i++){
  const x=i*250-cam;c.fillStyle=lab?'#354d4d':'#2a3a3d';ductRectV7(c,x+7,46,236,244,14);c.fill();
  c.strokeStyle='#79909044';c.lineWidth=2;c.stroke();
  for(const bx of [x+20,x+230])for(const by of [59,279]){c.fillStyle='#a6ad9c';c.beginPath();c.arc(bx,by,3,0,Math.PI*2);c.fill();}
  c.fillStyle='#0e2124';ductRectV7(c,x+27,112,202,101,14);c.fill();
  for(let j=0;j<10;j++)ductLineV7(c,x+38+j*18,125,x+38+j*18,200,'#577073',5);
  ductTextV7(c,mag?'AUX / MAGINOT':lab?'PRODIGY / SERVICE':'SECOURS / EXTRACTION',x+28,83,10,'#bdc5b2');
  ductTextV7(c,'NO STEP · ACCÈS SOUS CARTER',x+29,255,9,'#a5b6a1');
 }
 for(let j=0;j<4;j++){
  const yy=315+j*23;ductLineV7(c,0,yy,1280,yy,lab?'#0c2325':'#122326',19);ductLineV7(c,0,yy-4,1280,yy-4,j===1?'#ae825c':'#668080',4);
  for(let x=-cam%190;x<1280;x+=190){c.fillStyle='#193135';c.fillRect(x,yy-12,13,25);c.fillStyle='#80948d';c.fillRect(x+4,yy-12,3,25);}
 }
 // Empty volume is exactly above the playable lane, not a solid wall painted across it.
 c.fillStyle='#030e12';c.fillRect(0,423,1280,139);
 const inside=c.createLinearGradient(0,428,0,565);inside.addColorStop(0,'#0f242a');inside.addColorStop(.7,'#233b40');inside.addColorStop(1,'#4c6461');c.fillStyle=inside;c.fillRect(0,432,1280,129);
 for(let x=-cam%100;x<1380;x+=100){ductLineV7(c,x,435,x-18,562,'#79908933',1);ductLineV7(c,x,480,x+95,480,'#81968f22',1);}
 c.fillStyle='#64756c';c.fillRect(0,417,1280,8);c.fillStyle='#0a1b21';c.fillRect(0,425,1280,7);
 const floor=c.createLinearGradient(0,ground,0,720);floor.addColorStop(0,'#526964');floor.addColorStop(.2,'#24383b');floor.addColorStop(1,'#08171d');c.fillStyle=floor;c.fillRect(0,ground,1280,720-ground);
 for(let x=-cam%28;x<1280;x+=28){ductLineV7(c,x,ground+5,x+15,ground+35,'#91a69b33',2);}
 c.fillStyle='#0a181e';c.fillRect(0,ground+43,1280,17);ductLineV7(c,0,ground+44,1280,ground+44,'#738b823d',3);
 for(let x=-cam%175;x<1280;x+=175){c.fillStyle='#2a403f';ductRectV7(c,x+15,628,150,80,8);c.fill();for(let y=647;y<700;y+=15)ductLineV7(c,x+25,y,x+155,y,'#5b726543',3);}
 const sign=205-cam;
 if(sign>-400&&sign<1280){c.fillStyle='#071b20';ductRectV7(c,sign,370,365,42,3);c.fill();ductTextV7(c,r.duct.id+' / '+r.title.toUpperCase(),sign+12,387,10);ductTextV7(c,'PASSAGE BAS · PRENDRE LES PORTES POUR PORTER',sign+12,402,9,ductInkV7.gold);}
 return true;
}
export function drawDuctPropV7(v,p,e){
 if(!p.type?.endsWith('-v7'))return false;
 const c=v.c,x=p.x-v.camera,y=v.foot(125);
 if(p.type==='duct-hatch-v7')return true; // Its reciprocal interactive portal draws the exact same location once.
 if(p.type==='duct-rib-v7'){
  c.fillStyle='#172e31';c.beginPath();c.moveTo(x-12,409);c.lineTo(x+22,409);c.lineTo(x+30,444);c.lineTo(x+20,444);c.lineTo(x+18,425);c.lineTo(x,425);c.lineTo(x-2,444);c.lineTo(x-12,444);c.closePath();c.fill();ductLineV7(c,x-8,411,x+19,411,'#a2b0a5',2);
 }else if(p.type==='duct-cable-v7'){
  c.strokeStyle='#152629';c.lineWidth=6;c.beginPath();c.moveTo(x,434);c.bezierCurveTo(x+40,450,x+125,450,x+p.w,432);c.stroke();c.strokeStyle='#849a8388';c.lineWidth=1;c.stroke();
 }else if(p.type==='duct-brake-v7'){
  const stop=e.state.completed.includes(e.room.task.id);c.fillStyle='#253f3f';ductRectV7(c,x,y-57,40,56,4);c.fill();c.strokeStyle='#9ca997';c.lineWidth=2;c.stroke();c.fillStyle=stop?'#9ccab2':'#d6b77e';c.fillRect(x+5,y-51,30,8);
  ductLineV7(c,x+20,y-16,x+(stop?10:32),y-35,'#beb99b',5);c.fillStyle='#a66f48';c.beginPath();c.arc(x+(stop?10:32),y-35,5,0,Math.PI*2);c.fill();
  ductTextV7(c,stop?'ARRÊT':'FREIN',x+20,y-66,10,stop?'#b9dbc0':ductInkV7.gold,'center');
 }else if(p.type==='duct-motor-v7'){
  const f=ductFanStateV7(e.state,e.room),cx=x+34,cy=y-54;
  c.fillStyle='#091c23';ductRectV7(c,x-12,y-114,92,116,8);c.fill();c.strokeStyle='#78908d';c.lineWidth=4;c.stroke();
  for(const side of [x-18,x+80])for(let j=0;j<6;j++){c.fillStyle=j%2?'#d1ab69':'#172a30';c.fillRect(side,y-109+j*18,6,18);}
  c.save();c.beginPath();c.ellipse(cx,cy,35,48,0,0,Math.PI*2);c.clip();c.fillStyle=f.active?'#1a333b':'#061318';c.fillRect(cx-40,cy-54,80,108);
  c.save();c.translate(cx,cy);c.scale(.72,1);c.rotate(f.active&&!v.reduced?e.state.playSeconds*12:Math.PI*.22);
  if(f.active)for(let i=0;i<5;i++){c.rotate(Math.PI*2/5);c.fillStyle=i%2?'#9dafa2':'#516e72';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(25,-40,46,-28);c.lineTo(31,-5);c.quadraticCurveTo(14,3,0,0);c.fill();}
  c.restore();c.restore();
  if(!f.active){ductLineV7(c,cx-25,y-110,cx-25,y-83,'#8ca6a4',5);ductLineV7(c,cx+25,y-110,cx+25,y-83,'#8ca6a4',5);}else{c.fillStyle='#d3cbb0';c.beginPath();c.ellipse(cx,cy,8,11,0,0,Math.PI*2);c.fill();}
  c.fillStyle='#06141b';ductRectV7(c,cx-97,y-176,194,47,4);c.fill();ductTextV7(c,f.label,cx,y-155,12,f.active?ductInkV7.danger:f.warning?ductInkV7.gold:'#a6d8b8','center');
  ductTextV7(c,f.stopped?'ARRÊT MÉCANIQUE ACQUIS':(f.active?'REPOS DANS ':'DÉPART DANS ')+Math.ceil(f.remaining)+' S',cx,y-140,9,'#c2d4c7','center');
 }
 return true;
}
export function drawDuctHatchV7(v,d,e){
 if(!d.hatchKey)return false;const c=v.c,x=d.x-v.camera,y=v.foot(d.z),open=e.hatchOpen(d),allowed=d.requires.every(g=>e.state.completed.includes(g));
 c.fillStyle='#092027';ductRectV7(c,x-43,y-73,86,75,9);c.fill();c.strokeStyle=allowed?'#b6c9b6':'#a78068';c.lineWidth=3;c.stroke();
 if(!open){for(let j=0;j<6;j++)ductLineV7(c,x-32,y-62+j*10,x+32,y-62+j*10,'#7c9998',5);for(const xx of [-32,32])for(const yy of [-65,-10]){c.fillStyle='#e0c897';c.fillRect(x+xx-2,y+yy-2,4,4);}}
 else{c.fillStyle='#000b10';ductRectV7(c,x-33,y-62,66,60,8);c.fill();c.strokeStyle='#557877';c.lineWidth=2;c.stroke();ductTextV7(c,'↔',x,y-23,19,'#b5d6bc','center');}
 ductTextV7(c,open?'GRILLE DÉPOSÉE':'GRILLE BOULONNÉE',x,y-102,9,ductInkV7.gold,'center');
 const destination=d.label.replace(/^.*? · /,'').toUpperCase();ductTextV7(c,destination.slice(0,32),x,y-87,9,'#bfd2c8','center');
 if(Math.abs(e.player.x-d.x)<86&&Math.abs(e.player.z-d.z)<31)ductTextV7(c,allowed?(open?'E · PASSER':'E · DÉVISSER'):'COMMANDE LOCALE REQUISE',x,y+24,10,ductInkV7.gold,'center');
 return true;
}
