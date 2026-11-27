import { EARTH_DATA } from './alien-earth-data.js';
import { drawEarthRasterWeaponV12 } from './alien-earth-raster-v12.js';
const faRect=(c,x,y,w,h,r=3)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const faLine=(c,x,y,u,v,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke();};
const faOval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const faText=(c,t,x,y,size=11,col='#c4d2cb',align='left')=>{c.font=`${size}px monospace`;c.fillStyle=col;c.textAlign=align;c.fillText(t,x,y);c.textAlign='left';};
export function drawReferenceWeaponV10(c,x,y,id){
 if(drawEarthRasterWeaponV12(c,x,y,id))return;
 c.save();c.translate(x,y);c.fillStyle='#19232b';
 if(id==='wy-pistol'){faRect(c,0,-5,26,9,2);c.fillStyle='#40484b';faRect(c,4,2,7,14,1);c.fillStyle='#92978e';faRect(c,3,-4,20,3,1);c.fillStyle='#91d1cf';faRect(c,14,5,11,3,1);}
 else if(id==='mcsx'){faRect(c,-17,-7,66,13,3);c.fillStyle='#5d6665';faRect(c,-15,-5,26,9,2);faRect(c,30,-4,18,7,1);c.fillStyle='#192426';faRect(c,7,5,6,13,2);faRect(c,-9,5,8,13,2);faRect(c,48,-2,14,4,1);faRect(c,9,-13,20,5,1);faLine(c,31,-5,43,-5,'#9aa496',2);}
 else if(id==='ksg-al'){faRect(c,-19,-9,61,17,4);c.fillStyle='#646a60';faRect(c,-17,-7,21,13,3);c.fillStyle='#253236';faRect(c,8,6,7,12,2);faRect(c,35,-6,18,5,1);faRect(c,35,2,18,5,1);c.fillStyle='#8dc9c3';faRect(c,23,-2,15,3,1);faLine(c,17,-11,37,-11,'#566966',3);}
 c.restore();
}
export function drawReferenceHumanV10(c,x,y,role,pose={}){
 const def=EARTH_DATA.referenceCast.find(p=>p.id===role)||{skin:'#c39d7e',hair:'#423530',coat:'#9caaa0',pants:'#525e57',style:'short',beard:false};
 const f=pose.facing||1,t=pose.time||0,walk=pose.moving?Math.sin(t*10):0,low=pose.lowPassage?32:pose.crouching?21:0,chapter=pose.chapter??0;
 let coat=def.coat,pants=def.pants,arms=coat;
 if(role==='wendy'){if(chapter===2){coat='#818785';pants='#6e7978';}else if(chapter===0&&pose.initial){coat='#e5e4d5';pants='#d8d8ca';}else arms=def.skin;}
 if(chapter===2&&['curly','nibs'].includes(role)){coat='#7b8280';pants='#585f5b';}
 if(role==='joe'&&chapter===6){coat='#6a6550';pants='#586451';}
 arms=coat;if(role==='wendy'&&chapter!==2&&!(chapter===0&&pose.initial))arms=def.skin;
 c.save();c.translate(x,y);c.scale((pose.scale||1)*f,pose.scale||1);
 faOval(c,0,1,25,6,'#0007');
 if(pose.lowPassage)c.transform(1,0,-.22,1,0,0);
 for(const side of [-1,1]){const step=walk*side*11,hx=side*8;faLine(c,hx,-46+low*.58,hx+step,-23,pants,11);faLine(c,hx+step,-23,hx-step,0,pants,9);c.fillStyle=role==='boy'?def.skin:'#28302f';faRect(c,hx-step-5,-6,17,7,3);}
 c.fillStyle=coat;faRect(c,-18,-87+low,36,45-low*.2,7);
 if(role==='boy'){c.fillStyle='#dcd3b5';faRect(c,-20,-81+low,11,69-low*.6,3);faRect(c,9,-81+low,11,69-low*.6,3);for(let k=0;k<5;k++){faLine(c,-18,-70+k*11+low,-12,-66+k*11+low,'#5b715a',2);faLine(c,12,-67+k*11+low,17,-72+k*11+low,'#5b715a',2);}faLine(c,-18,-45+low,20,-45+low,'#9d956f',3);}
 if(role==='wendy'&&chapter!==2&&!(chapter===0&&pose.initial)){c.fillStyle='#253449';faRect(c,-12,-78+low,24,29,2);faLine(c,-8,-49+low,9,-49+low,'#768599',1);}
 if(role==='joe'){c.fillStyle='#a5aaa0';faRect(c,-15,-82+low,29,27,3);c.fillStyle='#6c746e';faRect(c,-12,-71+low,8,13,2);faRect(c,4,-70+low,8,13,2);faLine(c,-14,-80+low,14,-80+low,'#d5d2bd',2);}
 if(role==='morrow'){c.fillStyle='#e4dec4';faRect(c,-14,-78+low,11,8,1);faText(c,'WY',-13,-72+low,6,'#645e50');faLine(c,3,-82+low,3,-47+low,'#77776b',1);c.fillStyle='#787561';faRect(c,7,-74+low,8,4,1);}
 if(role==='kirsh'){c.fillStyle='#202426';faRect(c,-8,-96+low,16,16,2);faLine(c,0,-83+low,0,-44+low,'#b5b7ad',1);}
 if(role==='sylvia'){c.fillStyle='#3d4141';faRect(c,-7,-87+low,14,17,2);for(let k=0;k<4;k++)faLine(c,-6,-85+k*4+low,6,-81+k*4+low,'#c79975',1);}
 if(role==='arthur'){faLine(c,-17,-70+low,17,-70+low,'#ca8c54',3);faLine(c,0,-84+low,0,-44+low,'#496e89',1);}
 let weapon=pose.weapon??(role==='joe'?'mcsx':role==='morrow'?'wy-pistol':'none');
 const armed=weapon!=='none'&&weapon!=='cutter'&&!pose.carrying&&!pose.lowPassage;
 faLine(c,-15,-80+low,armed?-8:-22-walk*4,-57+low,arms,8);faLine(c,15,-80+low,armed?26:22+walk*4,-65+low,arms,8);faLine(c,armed?26:22+walk*4,-65+low,armed?35:19+walk*6,-61+low,arms,7);faOval(c,armed?35:19+walk*6,-61+low,4,4.5,def.skin);
 if(armed)drawReferenceWeaponV10(c,27,-64+low,weapon);
 if(weapon==='cutter'&&!pose.carrying&&!pose.lowPassage&&pose.cutterIntact!==false){faLine(c,20,-61+low,43,-99+low,'#bcc4bd',5);faLine(c,19,-58+low,25,-69+low,'#4a4137',7);}
 c.fillStyle=def.skin;faRect(c,-4,-95+low,9,12,2);faOval(c,0,-106+low,12,15,def.skin);
 c.fillStyle=def.hair;const hy=-106+low;
 if(def.style==='bob'){c.beginPath();c.moveTo(-14,hy+13);c.lineTo(-14,hy-8);c.quadraticCurveTo(-5,hy-24,12,hy-13);c.lineTo(15,hy+13);c.lineTo(9,hy+13);c.lineTo(8,hy-7);c.lineTo(-7,hy-7);c.lineTo(-7,hy+14);c.closePath();c.fill();faLine(c,-8,hy-6,9,hy-6,def.hair,4);}
 else if(def.style==='braids'){faOval(c,0,hy-11,13,9,def.hair);for(const s of [-1,1])for(let j=0;j<7;j++)faOval(c,s*(10+j*.4),hy-2+j*5,3.5,4,def.hair);faLine(c,0,hy-17,-10,hy-4,def.hair,4);faLine(c,1,hy-17,10,hy-6,def.hair,3);}
 else if(def.style==='asymmetric'){for(let j=0;j<11;j++){const a=j*.43;faOval(c,-4+Math.cos(a)*14,hy-8+Math.sin(a)*13,7,7,def.hair);}faOval(c,-12,hy+6,6,10,def.hair);}
 else if(def.style==='spikes'){c.beginPath();c.moveTo(-13,hy-5);for(let j=0;j<8;j++){c.lineTo(-14+j*4,hy-15-(j%3)*3);c.lineTo(-11+j*4,hy-10);}c.lineTo(13,hy-4);c.closePath();c.fill();}
 else if(def.style==='curls'||def.style==='tousled'){for(let j=0;j<8;j++)faOval(c,-12+j*3.3,hy-10-Math.sin(j*.5)*5,5,5,def.hair);faOval(c,-12,hy-3,4,7,def.hair);if(role==='nibs')faOval(c,-13,hy+7,5,8,def.hair);}
 else {c.beginPath();c.ellipse(0,hy-9,12.5,8,0,Math.PI,Math.PI*2);c.lineTo(12,hy-5);c.lineTo(-12,hy-3);c.closePath();c.fill();if(def.style==='tied')faOval(c,-14,hy-9,7,7,def.hair);if(def.style==='sidepart')faLine(c,-8,hy-12,8,hy-6,def.hair,5);}
 if(def.beard){c.fillStyle=def.hair;c.beginPath();c.moveTo(-10,hy+3);c.quadraticCurveTo(0,hy+22,11,hy+4);c.lineTo(7,hy+14);c.lineTo(-7,hy+14);c.closePath();c.fill();}
 faLine(c,5,hy,9,hy,'#262925',1.3);faLine(c,11,hy+2,14,hy+6,def.skin,2);faLine(c,8,hy+10,12,hy+9,'#765c50',1);
 if(role==='arthur'){c.strokeStyle='#b4b1a0';c.lineWidth=1;c.beginPath();c.ellipse(7,hy,5.5,4,0,0,Math.PI*2);c.stroke();faLine(c,-8,hy-1,2,hy,'#b4b1a0',1);}
 c.restore();
}
export function drawReferencePortalV10(renderer,d,engine){
 const c=renderer.c,x=d.x-renderer.camera,y=renderer.foot(d.z),a=d.anchor;
 if(!a)return false;if(x<-190||x>1470)return true;
 const unlocked=(d.requires||[]).every(id=>engine.state.completed.includes(id)),col=unlocked?'#d4c294':'#b78065',dest=EARTH_DATA.rooms.find(r=>r.id===d.to),nearby=Math.abs(engine.player.x-d.x)<86&&Math.abs(engine.player.z-d.z)<31;
 if(a.kind==='duct-end')return false;
 c.save();
 if(a.kind==='transfer'){
  c.fillStyle='#354542';faRect(c,x-24,y-50,48,53,4);faLine(c,x,y-50,x,y-120,'#b9c8bb',3);faOval(c,x,y-120,7,7,col);for(let n=0;n<3;n++){c.strokeStyle=col+'80';c.beginPath();c.arc(x,y-120,16+n*7,-1.3,1.3);c.stroke();}
  faText(c,'LIAISON / TRANSFERT',x,y-158,10,col,'center');faText(c,'Changement de lieu ou de point de vue',x,y-141,8,'#c4d2cb','center');
 }else if(a.kind==='floor-hatch'){
  c.fillStyle='#131f23';c.beginPath();c.moveTo(x-51,y-18);c.lineTo(x+32,y-18);c.lineTo(x+55,y+17);c.lineTo(x-29,y+17);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=3;c.stroke();
  const open=engine.hatchOpen(d);if(!open)for(let j=0;j<6;j++)faLine(c,x-38+j*13,y-15,x-20+j*13,y+14,'#6b817b',3);else{for(let j=0;j<3;j++)faLine(c,x-20,y-9+j*9,x+20,y-9+j*9,'#9cae9f',2);c.fillStyle='#526b63';faRect(c,x-52,y-64,81,40,3);}
  faText(c,open?'TRAPPE OUVERTE':'TRAPPE BOULONNÉE',x,y-32,9,col,'center');faText(c,(dest?.title||'').slice(0,32),x,y+38,9,'#ccd6cb','center');
 }else{
  // Rear thresholds belong to a continuous back-wall recess. Edge doors belong to the room envelope.
  if(a.kind==='rear-wall'){
   c.fillStyle='#324c49';faRect(c,x-83,237,166,y-237,1);faLine(c,x-83,237,x-83,y,'#748a80',3);faLine(c,x+83,237,x+83,y,'#748a80',3);faLine(c,x-83,237,x+83,237,'#a0aea0',4);
   c.fillStyle='#13282b';faRect(c,x-49,y-153,98,151,5);
  }else{
   const left=a.kind==='left-wall',edge=left?35:engine.room.width-35,ex=edge-renderer.camera;
   c.fillStyle='#223b38';c.beginPath();c.moveTo(ex,170);c.lineTo(x+(left?-47:47),y-156);c.lineTo(x+(left?-47:47),y+5);c.lineTo(ex,y+79);c.closePath();c.fill();faLine(c,ex,170,x+(left?-47:47),y-156,'#7b9182',3);
  }
  c.fillStyle='#132329';faRect(c,x-45,y-151,90,154,6);c.strokeStyle=col+'b0';c.lineWidth=2;c.stroke();c.fillStyle='#516862';faRect(c,x-35,y-140,31,136,3);faRect(c,x+4,y-140,31,136,3);faLine(c,x,y-134,x,y-7,'#9baba0',2);c.fillStyle=col;faRect(c,x+24,y-67,5,13,1);faLine(c,x-52,y+4,x+52,y+4,col,3);
  if(a.structure==='stair-lift'){faText(c,'ESCALIER / PALIER',x,y-181,8,col,'center');for(let j=0;j<3;j++)faLine(c,x-24+j*15,y-117-j*9,x-9+j*15,y-117-j*9,'#c8cfbe',2);}
  faText(c,(dest?.title||d.label).slice(0,34).toUpperCase(),x,y-162,9,'#d0dacd','center');
 }
 if(nearby)faText(c,'E',x,y-35,19,col,'center');c.restore();return true;
}
export function drawReferenceBackdropV10(renderer,engine){
 const c=renderer.c,r=engine.room,cam=renderer.camera,tag=r.setDressing;
 if(!tag)return;
 c.save();
 if(['bridge','mother'].includes(tag)){
  c.fillStyle='#182d31';faRect(c,175-cam,128,r.width-350,260,10);
  if(tag==='bridge'){for(let j=0;j<4;j++){c.fillStyle='#061015';faRect(c,240+j*330-cam,148,276,165,5);for(let k=0;k<17;k++)faOval(c,255+j*330+(k*53)%242-cam,166+(k*23)%126,.8,.8,'#e1e3cd');faLine(c,240+j*330-cam,318,516+j*330-cam,318,'#a2ada0',3);}faText(c,'USCSS MAGINOT / NAVIGATION',280-cam,365,16,'#d4cc9e');}
  else {for(let j=0;j<25;j++){c.fillStyle=j%3?'#c5d3ad':'#be935f';faRect(c,240+j*55-cam,165,26,14,1);faRect(c,240+j*55-cam,208,26,8,1);faRect(c,240+j*55-cam,244,26,8,1);}faText(c,'MU / TH / UR',r.width/2-cam,317,30,'#e7dcb5','center');faText(c,'INTERFACE DE COMMUNICATION / JOURNAL DU BORD',r.width/2-cam,350,11,'#b8c8ad','center');}
 }else if(tag==='mess'){
  c.fillStyle='#bbc0a7';faRect(c,240-cam,240,r.width-480,90,10);for(let j=0;j<9;j++){c.fillStyle='#6e8075';faRect(c,270+j*175-cam,262,139,40,4);}faText(c,'MAGINOT / CARRÉ DE L’ÉQUIPAGE',r.width/2-cam,201,21,'#dddbc0','center');
 }else if(tag==='dormitory'){
  for(let j=0;j<5;j++){const x=220+j*290-cam;c.fillStyle='#bcc5b5';faRect(c,x,230,235,132,10);c.fillStyle='#405d5d';faRect(c,x+10,242,215,91,6);faText(c,['WENDY','CURLY','SMEE','SLIGHTLY','TOOTLES'][j],x+15,353,10,'#213b3f');}
 }else if(tag==='common'){
  faText(c,'PRODIGY / PAVILLON DES HYBRIDES',260-cam,225,22,'#c6d7c8');c.fillStyle='#2a4245';faRect(c,r.width-520-cam,284,215,109,5);faText(c,'MASSICOT — LAME DÉTACHABLE',r.width-413-cam,273,10,'#d5ca9d','center');faLine(c,r.width-495-cam,315,r.width-340-cam,303,'#d6dbcd',7);
 }else if(tag==='armory'){
  c.fillStyle='#1d3034';faRect(c,245-cam,215,1390,166,8);for(let j=0;j<7;j++){c.save();c.translate(310+j*175-cam,286);c.scale(1.7,1.7);drawReferenceWeaponV10(c,0,0,j<3?'ksg-al':'wy-pistol');c.restore();}faText(c,'CONFINEMENT / KSG-AL · ARME DE BORD',r.width/2-cam,192,19,'#ddc895','center');
 }else if(tag==='rescue-container'||tag==='recovery-bay'){
  const x=(tag==='rescue-container'?r.task.x-270:800)-cam,w=530;
  c.fillStyle='#624937';faRect(c,x,229,w,265,4);for(let j=0;j<19;j++)faLine(c,x+14+j*27,239,x+14+j*27,479,'#927557',5);
  c.fillStyle='#122025';faRect(c,x+w-198,255,181,240,3);c.fillStyle='#365051';faRect(c,x+w-196,255,53,234,2);faText(c,'CHARGEMENT / ACCÈS CONTENEUR',x+15,211,16,'#ccb891');
  if(tag==='rescue-container'){c.strokeStyle='#82938799';c.lineWidth=4;c.beginPath();c.moveTo(x+w-72,289);c.bezierCurveTo(x+w-230,340,x+w-15,419,x+w-100,470);c.stroke();faLine(c,x-55,314,x-55,443,'#b8b69e',5);c.strokeStyle='#b8b69e';c.beginPath();c.arc(x-46,443,11,0,Math.PI);c.stroke();faText(c,'CROCHET (DÉCOR)',x-60,475,8,'#c6cbbc','center');}
 }
 c.restore();
}
