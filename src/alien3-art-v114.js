import {CAST_V114} from './alien3-fidelity-v114.js';
import {WORLD_ROOMS_V114,activeForCutV114} from './alien3-world-v114.js';
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const stroke=(c,x,y,X,Y,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();};
const ellipse=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
function shell(c,kind,x,foot,alpha=1){c.save();c.globalAlpha=alpha;const top=foot-180;rect(c,x-170,top,340,180,'rgba(35,45,37,.78)');stroke(c,x-170,top,x+170,top,'#8d886e',3);for(let xx=x-150;xx<x+170;xx+=44)stroke(c,xx,top+2,xx,foot,'rgba(112,111,89,.28)',1);
 if(kind==='andrews-office'){rect(c,x-120,foot-77,240,14,'#5b5846');rect(c,x-90,foot-128,68,45,'#343d32');rect(c,x+15,foot-126,72,52,'#2c372e');for(let i=0;i<4;i++)rect(c,x-128+i*50,foot-45,32,37,'#4c5141');stroke(c,x-150,foot-156,x+150,foot-156,'#8b7e62',2);}
 else if(kind==='slaughterhouse'){stroke(c,x-145,top+28,x+145,top+28,'#80765c',7);for(let i=0;i<6;i++){const hx=x-120+i*48;stroke(c,hx,top+28,hx,foot-58,'#77715c',3);c.strokeStyle='#b2aa86';c.lineWidth=3;c.beginPath();c.arc(hx,foot-50,9,Math.PI*.25,Math.PI*1.5);c.stroke();}rect(c,x+90,foot-110,45,74,'#505948');ellipse(c,x+112,foot-84,16,16,'#252f28');}
 else if(kind==='golic-confinement'){for(let xx=x-115;xx<=x+115;xx+=23)stroke(c,xx,top+25,xx,foot,'#777a67',4);stroke(c,x-125,top+22,x+125,top+22,'#9a9273',5);rect(c,x-85,foot-37,130,21,'#5d5a48');rect(c,x-78,foot-54,104,16,'#77715c');}
 else if(kind==='dog-kennel'){rect(c,x-115,foot-72,230,68,'#4a5142');for(let xx=x-105;xx<x+110;xx+=21)stroke(c,xx,foot-69,xx,foot-4,'#8a876d',3);ellipse(c,x,foot-22,34,15,'#5b4d3c');ellipse(c,x+27,foot-30,14,12,'#5b4d3c');}
 else if(kind==='ox-approach'){stroke(c,x-135,foot-12,x+115,foot-12,'#655f4a',6);ellipse(c,x,foot-44,66,31,'#6d6250');ellipse(c,x+61,foot-52,26,22,'#6d6250');stroke(c,x+75,foot-62,x+92,foot-75,'#a79a77',3);stroke(c,x+75,foot-57,x+95,foot-50,'#a79a77',3);}
 else if(kind==='patna-interior'){rect(c,x-135,foot-150,270,146,'#606a5e');rect(c,x-112,foot-126,90,55,'#1c2a24');rect(c,x+12,foot-126,90,55,'#1c2a24');for(let i=0;i<3;i++)rect(c,x-95+i*70,foot-55,45,33,'#89917d');}
 c.restore();}
function simplePerson(c,id,x,foot,facing=1){const look=CAST_V114.find(a=>a.id===id);if(!look)return;c.save();c.translate(x,foot);c.scale(facing,1);ellipse(c,0,1,22,4,'rgba(0,0,0,.38)');stroke(c,-6,-39,-7,-5,look.cloth,9);stroke(c,7,-39,8,-5,look.cloth,9);rect(c,-13,-76,26,39,look.coat);stroke(c,-12,-70,-20,-46,look.cloth,8);stroke(c,12,-70,20,-48,look.cloth,8);ellipse(c,0,-88,9,11,look.skin);if(id==='golic')stroke(c,-7,-96,7,-96,'#594a36',2);if(id==='andrews')rect(c,-10,-99,20,4,'#7a7966');if(id==='clemens')stroke(c,-7,-97,4,-100,'#6b5d4c',2);c.restore();}
export function drawSupplementalWorldV114(c,scene,{cut='theatrical',camera={x:0},inspectionRoom=null,flags={},time=0}={}){
 const nodes=new Map(scene.nodes.map(n=>[n.id,n]));const visible=[];for(const r of WORLD_ROOMS_V114){if(r.kind!=='inspection-shell'||!activeForCutV114(r,cut))continue;const n=nodes.get(r.anchor);if(!n)continue;if(inspectionRoom&&inspectionRoom!==r.id)continue;if(!inspectionRoom&&Math.abs(n.x-(camera.x+640))>560)continue;shell(c,r.id,n.x,n.y,.96);visible.push(r.id);
  if(r.id==='andrews-office'){simplePerson(c,'andrews',n.x-35,n.y);simplePerson(c,'clemens',n.x+55,n.y,-1);}if(r.id==='golic-confinement')simplePerson(c,'golic',n.x,n.y);}
 // Strengthen command-center and final-arrival silhouettes without inventing routes.
 const comms=nodes.get('f161-comms-high');if(comms&&Math.abs(comms.x-(camera.x+640))<650){rect(c,comms.x-72,comms.y-127,144,52,'rgba(57,68,58,.78)');for(let i=0;i<3;i++){rect(c,comms.x-61+i*43,comms.y-116,31,24,'#14241c');stroke(c,comms.x-57+i*43,comms.y-105,comms.x-35+i*43,comms.y-105,'#829777',1);}}
 return visible;
}
export function drawCommandoUpgradeV114(c,a){if(!a)return;c.save();c.translate(a.x+a.w/2,a.y+a.h);c.scale(a.facing||-1,1);ellipse(c,0,-90,17,15,'#929b8b');c.fillStyle='rgba(63,76,70,.85)';c.beginPath();c.moveTo(-15,-92);c.lineTo(0,-104);c.lineTo(15,-92);c.lineTo(13,-80);c.lineTo(-13,-80);c.closePath();c.fill();rect(c,-14,-91,29,7,'#6c756c');rect(c,-12,-87,9,5,'#344a3e');rect(c,2,-87,9,5,'#344a3e');c.restore();}
