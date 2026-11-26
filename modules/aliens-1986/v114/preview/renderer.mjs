import {human,filmProp,filmBackdrop} from './film-renderer-v114.mjs';
import {drawTactics} from './tactical-renderer.mjs';
import * as B from '../src/beacons-v114.mjs';
import {renderLighting} from './lighting-renderer.mjs';
/* Canvas renderer shared by the playable preview and browser capture recipe.
   All foreground projections derive from world x/z, never from actor height/jump. */
import {observed,hatchBox} from '../src/contact-v114.mjs';
import {STOCK as ENGINEERING_STOCK,RULES as ENGINEERING_RULES} from '../src/engineering-v114.mjs';
import {distance,visible} from '../src/spatial-core-v108.mjs';
import {exitsFor,extraction} from '../src/operation-scenes-v114.mjs';
const palettes={workshop:{bg:'#172633',far:'#3c5764',wall:'#3a535b',trim:'#a9c3be',light:'#b5dbe0',floor:'#293d43',rust:'#b18e55'},conduit:{bg:'#242b2a',far:'#495f59',wall:'#526960',trim:'#aabca4',light:'#c8c19c',floor:'#303f38',rust:'#ac8153'},logistics:{bg:'#182930',far:'#45616a',wall:'#455b62',trim:'#b8b59b',light:'#b8d2ce',floor:'#293f43',rust:'#aa8952'},reserve:{bg:'#202c28',far:'#455a50',wall:'#566655',trim:'#c6c5a0',light:'#d9d8ac',floor:'#2e4137',rust:'#aa945b'},operations:{bg:'#142822',far:'#3c5546',wall:'#435343',trim:'#b1b28b',light:'#c6d198',floor:'#2a3b2e',rust:'#8a7750'},service:{bg:'#282a23',far:'#555748',wall:'#606153',trim:'#bfb295',light:'#d5bc7d',floor:'#3b3c2e',rust:'#a88554'},colony:{bg:'#172623',far:'#394943',wall:'#36423b',trim:'#919179',light:'#9aab89',floor:'#25322c',rust:'#716044'},medical:{bg:'#1e3439',far:'#527073',wall:'#657d7a',trim:'#aec9bb',light:'#b6e0d2',floor:'#344747',rust:'#857e60'},sentry:{bg:'#182824',far:'#364e3e',wall:'#3e4d3c',trim:'#99a97e',light:'#b4c286',floor:'#25362b',rust:'#856c3e'},hangar:{bg:'#1b2830',far:'#445864',wall:'#475a64',trim:'#91a5aa',light:'#b3cfd3',floor:'#2c3a41',rust:'#8c7b55'}};
Object.assign(palettes,{
 gateway:{bg:'#1f3443',far:'#4d707b',wall:'#68808a',trim:'#c2d3c9',light:'#d0e6df',floor:'#334a51',rust:'#9ca386'},
 sulaco:{bg:'#172c3b',far:'#4f6c7c',wall:'#617c82',trim:'#bacbc7',light:'#d0ece3',floor:'#314850',rust:'#abb292'},
 armory:{bg:'#132725',far:'#3f5851',wall:'#5d7062',trim:'#b4b695',light:'#d5d8ad',floor:'#304139',rust:'#8d7851'},
 cockpit:{bg:'#132936',far:'#304f5b',wall:'#4f6670',trim:'#b2c7ba',light:'#c4e4c9',floor:'#293e44',rust:'#acaa85'},
 processor:{bg:'#252e2e',far:'#52695f',wall:'#465c51',trim:'#bac2a5',light:'#bfcda5',floor:'#304239',rust:'#a4825b'},
 hive:{bg:'#122720',far:'#304735',wall:'#445540',trim:'#8f9e73',light:'#acbf85',floor:'#283a2c',rust:'#807949'},
 exterior:{bg:'#10242e',far:'#33484c',wall:'#4b6663',trim:'#92b1a9',light:'#c8d9c7',floor:'#263b3e',rust:'#9b8870'}});
const txt=(c,text,x,y,size=12,color='#cfdbcc',align='left')=>{c.fillStyle=color;c.font=`${size<12?'500':'600'} ${size}px ui-monospace,Consolas,monospace`;c.textAlign=align;c.fillText(text,x,y);};
const line=(c,x1,y1,x2,y2,col,width=1)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
const rect=(c,x,y,w,h,fill,stroke=null)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);}};
function circle(c,x,y,r,fill,stroke){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.camera=0;this.width=1280;this.height=720;canvas.width=1280;canvas.height=720;this.reducedMotion=false;this.highContrast=false;this.lastGeometry=null;}
  project(p){return {x:p.x-this.camera,y:265+p.z*.86};}
  localPoint(px,py){const b=this.canvas.getBoundingClientRect(),scale=Math.min(b.width/1280,b.height/720),left=b.left+(b.width-1280*scale)/2;return {x:(px-left)/scale,y:(py-b.top)/scale};}
  unproject(px,py){const p=this.localPoint(px,py);return {x:p.x+this.camera,z:Math.max(0,Math.min(380,(p.y-265)/.86))};}
  aimAt(px,py,world){const p=this.localPoint(px,py),targets=world.actors.filter(a=>a.alive&&a.kind==='enemy'&&observed(this.session,world,a)).map(a=>({a,p:this.project(a)})).filter(t=>Math.abs(t.p.x-p.x)<t.a.radius+30&&p.y>t.p.y-(t.a.role==='facehugger'?35:118)&&p.y<t.p.y+10).sort((a,b)=>Math.abs(a.p.x-p.x)-Math.abs(b.p.x-p.x));return targets.length?{x:targets[0].a.x,z:targets[0].a.z}:this.unproject(px,py);}
  box(b,pal){const c=this.c,p=this.project({x:b.x,z:b.z+b.d}),top=this.project(b),h=b.h||72,depth=b.d*.86;
    if(b.material==='glass'){rect(c,top.x,top.y-h,b.w,depth+h,'#4f899834','#b6dfd04d');for(let y=top.y-h;y<p.y;y+=24)line(c,top.x+3,y,top.x+b.w-3,y-9,'#b9e2d82a');line(c,top.x,top.y-h,top.x,p.y,pal.trim,3);line(c,top.x+b.w,top.y-h,top.x+b.w,p.y,pal.trim,3);return;}
    rect(c,p.x+5,p.y-5,b.w+14,17,'#00000048');rect(c,top.x,top.y-h,b.w,depth,pal.trim+'80');rect(c,p.x,p.y-h,b.w,h,b.material==='medical'?'#70847c':pal.wall,pal.trim+'7d');
    const key=b.id||'';
    if(/bed|ops-table/.test(key)||b.material==='medical'||key.startsWith('v114-')&&h<=50){
      const medical=/bed/.test(key)||b.material==='medical',color=medical?'#aec1b3':'#496251';
      rect(c,top.x+7,top.y-h+6,b.w-14,Math.max(10,depth-11),color,'#a4b59a');
      for(const dx of [12,b.w-24]){rect(c,p.x+dx,p.y-h+5,12,h-5,'#6d8072','#aab7a4');}
      if(medical){rect(c,top.x+13,top.y-h+11,31,Math.max(10,depth-22),'#d1d5c2','#8b9a88');for(let z=15;z<depth-12;z+=14)line(c,top.x+50,top.y-h+z,top.x+b.w-17,top.y-h+z,'#5e827166');}
      else{rect(c,top.x+24,top.y-h+14,Math.min(96,b.w-50),Math.max(13,depth-26),'#0b2520','#a2b590');for(let i=0;i<4;i++){line(c,top.x+30,top.y-h+20+i*10,top.x+95+i*4,top.y-h+20+i*10,'#789b72',1);}rect(c,p.x+10,p.y-h+8,b.w-20,11,'#111f18');}
      return;
    }
    if(/pump-foundation/.test(key)){
      for(let i=0;i<2;i++){const x=p.x+38+i*70,y=p.y-h*.48;circle(c,x,y,29,'#7c8170','#bdb596');circle(c,x,y,20,'#273931','#a1a18a');for(let n=0;n<8;n++){const a=n*Math.PI/4;circle(c,x+Math.cos(a)*24,y+Math.sin(a)*24,2,'#25332b');}line(c,x,y-29,x,top.y-h+8,'#929580',10);}
      rect(c,p.x+9,p.y-12,b.w-18,9,'#1b2d24');return;
    }
    if(/transformer/.test(key)){
      for(let i=0;i<5;i++){const x=p.x+13+i*24;rect(c,x,p.y-h+16,16,h-31,'#394a3b','#8c967d');for(let j=0;j<6;j++)line(c,x,p.y-h+26+j*17,x+16,p.y-h+26+j*17,'#c0b18b',2);}
      rect(c,p.x+10,p.y-h-12,b.w-20,13,'#9a9879','#d7c9a4');txt(c,'RELAIS',p.x+b.w/2,p.y-17,10,'#d0c3a0','center');return;
    }
    if(/crate|cargo-(west|east)|ammo-rack|east-rack/.test(key)){
      const height=h;for(const dx of [0,b.w-12])rect(c,p.x+dx,p.y-h,12,h,'#26382c','#7d8e71');
      rect(c,p.x+18,p.y-height+18,b.w-36,Math.min(35,height-28),'#203a2c','#81956b');
      txt(c,/ammo/.test(key)?'MUNITIONS':'FRET',p.x+b.w/2,p.y-height+34,9,'#c2bb90','center');
      line(c,p.x+13,p.y-height+8,p.x+b.w-14,p.y-11,pal.rust,4);line(c,p.x+b.w-14,p.y-height+8,p.x+13,p.y-11,pal.rust,4);
      rect(c,p.x+9,p.y-7,b.w-18,5,'#111f18');return;
    }
    if(/cabinet|service-rack|ops-rack/.test(key)){
      for(let i=0;i<3;i++){const hh=(h-16)/3,y=p.y-h+8+i*hh;rect(c,p.x+7,y,b.w-14,hh-5,'#526951','#a1b494');rect(c,p.x+b.w-20,y+hh*.3,5,14,'#26382b');}
      return;
    }
    const slats=Math.max(2,Math.floor(b.w/27));for(let i=1;i<slats;i++)line(c,p.x+b.w*i/slats,p.y-h+5,p.x+b.w*i/slats,p.y-5,'#0b15185e');line(c,p.x,p.y-h+6,p.x+b.w,p.y-h+6,pal.trim+'90',2);line(c,p.x+4,p.y-4,p.x+b.w-4,p.y-4,'#0a1718',3);
    for(const dx of [7,b.w-7])for(const dy of [10,h-10])circle(c,p.x+dx,p.y-h+dy,2,'#141b1a');
    if(h>100){rect(c,p.x+6,p.y-h+18,Math.max(8,b.w-12),19,'#0d1b1ad0');for(let i=0;i<3;i++)rect(c,p.x+10+i*11,p.y-h+25,6,4,pal.light+'a0');}
    if(h<70&&b.material!=='medical'){for(let i=0;i<b.w;i+=19){c.fillStyle='#b8a87166';c.beginPath();c.moveTo(p.x+i,p.y-h);c.lineTo(p.x+Math.min(b.w,i+8),p.y-h);c.lineTo(p.x+Math.min(b.w,i+20),p.y-h+12);c.lineTo(p.x+Math.min(b.w,i+12),p.y-h+12);c.fill();}}
  }
  actor(a,world){const c=this.c,p=this.project(a),time=this.reducedMotion?0:world.time,dead=!a.alive;
    if(dead){ellipse(c,p.x,p.y,24,8,a.kind==='enemy'?'#2e4030':'#384238');return;}
    ellipse(c,p.x,p.y+3,a.radius+8,6,'#00000068');const breath=Math.sin(time*2+a.x*.01)*1.3;
    if(a.role==='sentry'){line(c,p.x,p.y-24,p.x-22,p.y+4,'#738775',4);line(c,p.x,p.y-24,p.x+22,p.y+4,'#657462',4);rect(c,p.x-19,p.y-55,35,29,'#6d8066','#a4b38b');const config=this.session?.tactics?.sentries[a.id],turn=this.session?.action?.kind==='sentry-orient'&&this.session.action.id===a.id?this.session.action:null;let angle=config?.angle??0;if(turn){const diff=Math.atan2(Math.sin(turn.angle-angle),Math.cos(turn.angle-angle));angle+=diff*Math.min(1,turn.elapsed/turn.duration);}const muzzle={x:p.x+Math.cos(angle)*63,y:p.y-47+Math.sin(angle)*25};line(c,p.x+Math.cos(angle)*12,p.y-47+Math.sin(angle)*4,muzzle.x,muzzle.y,'#b1bd90',9);line(c,p.x+Math.cos(angle)*12,p.y-47+Math.sin(angle)*4,muzzle.x,muzzle.y,'#293d31',6);rect(c,p.x-5,p.y-72,17,19,'#4d6452','#8eaa87');circle(c,p.x+11,p.y-43,3,a.ammo?'#bee582':'#bf694c');return;}
    if(a.kind==='enemy'){
      if(a.role==='facehugger'){const flutter=a.phase==='windup'?Math.sin(time*20)*6:0;for(let i=0;i<4;i++){const dy=(i-1.5)*6;line(c,p.x,p.y-8,p.x-20-i*3,p.y+dy+flutter,'#a58b62',3);line(c,p.x,p.y-8,p.x+20+i*3,p.y+dy-flutter,'#bb9b6d',2);}ellipse(c,p.x,p.y-9,13,9,'#9f8154');c.strokeStyle='#b29362';c.lineWidth=4;c.beginPath();c.moveTo(p.x+8,p.y-8);c.quadraticCurveTo(p.x+55,p.y-38,p.x+57,p.y-8);c.stroke();}
      else{const h=96,lean=(a.phase==='windup'||this.session?.engineering?.attacks[a.id]?.phase==='windup')?-8:this.session?.contacts?.brains?.[a.id]?.mode==='search'?Math.sin(time*1.5)*4:0;c.save();c.translate(p.x+lean,p.y);c.strokeStyle='#6e8b7c';c.lineWidth=4;c.beginPath();c.moveTo(6,-30);c.bezierCurveTo(56,4,66,-50,104,-42);c.stroke();
        line(c,-9,-44,-17,-18,'#31473d',9);line(c,-17,-18,-30,-2,'#547364',5);line(c,9,-44,25,-25,'#324a40',10);line(c,25,-25,32,0,'#647f70',5);
        ellipse(c,0,-58+breath,17,30,'#142b25');for(let i=0;i<6;i++){c.strokeStyle='#658072';c.lineWidth=1.5;c.beginPath();c.ellipse(0,-73+i*6,15,5,.1,0,Math.PI*2);c.stroke();}
        line(c,-13,-79,-32,-45,'#405b4f',6);line(c,-32,-45,-45,-36,'#78907e',3);line(c,14,-75,30,-52,'#3b554a',6);line(c,30,-52,43,-54,'#718877',3);
        const grad=c.createLinearGradient(-38,-108,25,-83);grad.addColorStop(0,'#263f36');grad.addColorStop(.4,'#9daf9e');grad.addColorStop(.53,'#3d5e4f');grad.addColorStop(1,'#12251f');c.fillStyle=grad;c.beginPath();c.ellipse(-5,-97+breath,39,13,-.17,0,Math.PI*2);c.fill();for(let i=0;i<9;i++){const xx=-36+i*7;c.beginPath();c.strokeStyle=i%2?'#95a9a5':'#293d45';c.lineWidth=2;c.moveTo(xx,-99+Math.sin(i*.3)*3);c.lineTo(xx+2,-107+Math.sin(i*.8)*3);c.lineTo(xx+7,-102);c.stroke();}for(let i=0;i<3;i++)line(c,11,-78-i*6,26+i*8,-97-i*5,'#42605e',4);line(c,-34,-94,-14,-87,'#b3c5bd',2);c.restore();}
      const pressure=this.session?.engineering?.attacks[a.id];if(pressure){const pct=pressure.phase==='windup'?1-pressure.remaining/ENGINEERING_RULES.windup:0;c.strokeStyle=pressure.phase==='windup'?'#e7b477':'#778981';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,31,Math.PI,Math.PI+Math.PI*Math.max(.1,pct));c.stroke();if(pressure.phase==='windup')txt(c,'FRAPPE DU SAS',p.x,p.y-125,8,'#d5ab7d','center');}
      if(a.phase==='windup'){c.strokeStyle='#db956b';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,27,Math.PI,Math.PI+Math.PI*Math.max(.1,a.clock/.65));c.stroke();}
      return;
    }
    human(this,a,world);
  }
  prop(p,world,pal){const c=this.c,body=world.scene.solids.find(b=>b.id===p.bodyId),pos=this.project(body?{x:p.x,z:body.z+body.d}:p),x=pos.x,y=pos.y-(p.elevation||0);
    if(filmProp(this,p,world,pal,x,y))return;
    if(p.id===ENGINEERING_STOCK.propId&&world.scene.id===ENGINEERING_STOCK.roomId){const used=this.session?.engineering?.collected;rect(c,x-23,y-38,52,38,used?'#39433c':'#8b7952','#d6c69e');if(used){rect(c,x-21,y-46,48,10,'#8c815e','#b3a988');rect(c,x-17,y-32,38,17,'#13271e');}else{for(let i=0;i<3;i++)rect(c,x-17+i*13,y-31,9,24,'#bcc2a8','#525d50');line(c,x-23,y-9,x+29,y-9,'#d3b469',4);}txt(c,used?'PLAQUES · VIDE':'RENFORTS × 3',x,y-56,9,used?'#8b9d87':'#e0c18d','center');}
    else if(p.type==='beacon-case'){const used=this.session?.beacons?.collected;rect(c,x-34,y-51,68,51,used?'#30433f':'#677e74','#bbd3b8');rect(c,x-28,y-43,56,30,'#142e28','#89a798');if(used){rect(c,x-34,y-66,68,13,'#7d9283','#c1d1ba');rect(c,x-24,y-36,48,20,'#061b17');}else{for(let i=0;i<4;i++){rect(c,x-22+i*12,y-35,8,21,'#9cb4a0','#283f36');circle(c,x-18+i*12,y-31,2,'#d9d8ae');}rect(c,x-5,y-51,10,51,'#bca06a');}txt(c,used?'BALISES · COFFRET VIDE':'SECOURS · 4 BALISES',x,y-79,9,used?'#96b4a6':'#d9d7ad','center');}
    else if(p.type==='lamp'){const on=world.circuits[p.circuit]!==false;rect(c,x-24,y-186,48,13,'#5e7468','#adb39b');rect(c,x-18,y-183,36,5,on?pal.light:'#283935');if(on)glow(c,x,y-150,95,pal.light+'19');}
    else if(p.type==='console'){rect(c,x-23,y-61,48,61,'#41574b','#79907d');rect(c,x-19,y-58,40,28,'#081b16','#aac3a4');for(let i=0;i<4;i++)rect(c,x-14,y-54+i*5,15+i*5,2,'#86ad89');for(let i=0;i<5;i++)circle(c,x-14+i*7,y-20,2,'#bbc698');}
    else if(p.type==='supply'){const used=this.session?.logistics?.collected.includes(p.stockId),medical=p.stockId?.includes('medical'),active=this.session?.action?.id===p.stockId;
      rect(c,x-34,y-43,68,43,used?'#263630':medical?'#b0bba3':'#667762','#c4c7a1');line(c,x-31,y-34,x+31,y-34,'#304638',4);if(used){rect(c,x-31,y-48,64,9,'#657963','#acb99e');rect(c,x-26,y-35,52,15,'#13261c');}else{rect(c,x-4,y-42,8,43,'#cbb37a');if(medical){rect(c,x-17,y-30,34,10,'#394d3d');rect(c,x-5,y-41,10,32,'#394d3d');}}
      const tag=used?'VIDE':medical?'SECOURS':'RÉSERVE';txt(c,tag,x,y-57,9,used?'#839581':'#e3d3a3','center');if(active){rect(c,x-32,y+8,64,5,'#172b21');rect(c,x-32,y+8,64*this.session.action.elapsed/this.session.action.duration,5,'#d9d7a1');}
    }
    else if(p.type==='alarm'){const a=this.session?.logistics?.alarms[p.alarmId],active=a?.remaining>0;rect(c,x-28,y-64,56,64,'#435953','#aaba9c');rect(c,x-21,y-57,42,25,'#0c2821','#718a78');txt(c,active?'TEST ACTIF':'DIAG',x,y-39,8,'#bfd7ac','center');circle(c,x,y-86,15,active?'#cbab65':'#4d6554','#d1c098');if(active){glow(c,x,y-86,70,'#cfa65e44');for(let i=0;i<3;i++){c.strokeStyle='#c8b17555';c.beginPath();c.arc(x,y-86,22+i*10,0,Math.PI*2);c.stroke();}}txt(c,a?.cooldown>0?Math.ceil(a.cooldown)+' s':'E · DIAGNOSTIC',x,y+15,9,'#cabd97','center');}
    else if(p.type==='tug'){rect(c,x-70,y-38,135,32,'#5e7374','#a0b6a8');rect(c,x-39,y-88,58,56,'#708986','#c6c8a6');rect(c,x-33,y-82,47,33,'#132e35','#a7c9c0');line(c,x-10,y-81,x-10,y-49,'#709395',3);for(const dx of [-54,45]){circle(c,x+dx,y-4,15,'#132321','#809386');circle(c,x+dx,y-4,6,'#62796d');}line(c,x+62,y-31,x+78,y-7,'#9da87e',8);line(c,x+78,y-7,x+88,y-7,'#a8b28d',5);txt(c,'TRACTEUR 04',x+34,y-23,8,'#cbd1b7','center');}
    else if(p.type==='tank'){rect(c,x-22,y-116,44,113,'#355453','#8ba8a0');rect(c,x-17,y-106,34,92,'#92bdae24','#a4d0bc');ellipse(c,x,y-66,12,24,'#849576');line(c,x-8,y-69,x-14,y-39,'#bdc1a0',3);rect(c,x-25,y-5,50,8,'#425d55');}
    else if(p.type==='loader'){line(c,x-23,y-44,x-28,y,'#baa85a',14);line(c,x+22,y-44,x+34,y,'#bba251',14);rect(c,x-34,y-112,68,75,'#aa9241','#e5c978');rect(c,x-24,y-107,48,45,'#132626','#b5b687');line(c,x-29,y-92,x-67,y-57,'#c5a84f',14);line(c,x+29,y-92,x+71,y-52,'#c3a749',14);line(c,x-67,y-57,x-80,y-95,'#857536',9);line(c,x+71,y-52,x+80,y-91,'#857536',9);txt(c,'P-5000',x,y-121,11,'#cec796','center');}
    else if(p.type==='pipe'){for(let i=0;i<4;i++){line(c,x+i*17,y-185,x+i*17,y-10,'#687f6e',7);line(c,x+i*17-3,y-150,x+i*17+4,y-150,'#bcc1a2',3);}}
    else {rect(c,x-20,y-33,40,33,pal.wall,pal.trim);line(c,x-16,y-28,x+16,y-7,pal.rust,3);}
  }
  door(d,world,pal){const c=this.c,s=world.doors[d.id],p=this.project({x:d.x,z:d.z+d.d}),back=this.project(d),h=d.h||170;
    if(s.open){rect(c,back.x-7,back.y-h,10,p.y-back.y+h,pal.trim);rect(c,p.x+d.w-3,back.y-h,10,p.y-back.y+h,pal.trim);line(c,back.x,back.y-h,p.x+d.w,back.y-h,pal.light,6);for(let i=0;i<d.w;i+=16)rect(c,p.x+i,p.y-2,8,3,'#b6c9a1');}
    else{const g=c.createLinearGradient(p.x,p.y-h,p.x+d.w,p.y);g.addColorStop(0,'#2a413a');g.addColorStop(.5,pal.wall);g.addColorStop(1,'#243730');rect(c,back.x,back.y-h,d.w,p.y-back.y+h,g,pal.trim);for(let y=back.y-h+14;y<p.y;y+=14)line(c,p.x+3,y,p.x+d.w-3,y,'#a4b39b30');line(c,p.x+d.w/2,back.y-h,p.x+d.w/2,p.y,'#14251d',3);}
    const act=this.session?.action,active=act?.id===d.id&&act?.roomId===world.scene.id;
    if(active){const progress=Math.min(1,act.elapsed/act.duration);rect(c,p.x-10,p.y-21,Math.max(50,d.w+20),9,'#071b12','#839272');rect(c,p.x-8,p.y-19,Math.max(48,d.w+16)*progress,5,'#d7cb9c');line(c,p.x+d.w*.18,p.y-h+progress*45,p.x+d.w*.82,p.y-h+progress*45,'#d7cb9c',3);}
    const name=d.critical?'SAS · COMMANDE PRINCIPALE':active?'OUVERTURE EN COURS':s.open?'PASSAGE OUVERT':'PORTE FERMÉE';const xx=p.x+d.w/2,yy=back.y-h-14;rect(c,xx-100,yy-15,200,24,'#071711df','#526b5b');txt(c,name,xx,yy+1,10,s.open?'#b7d6a4':'#d2b38a','center');
    circle(c,p.x-14,p.y-65,5,s.open?'#aad18a':'#c09b65');
  }
  render(world,{aim=null,objective=true,session=null}={}){this.session=session;const c=this.c,s=world.scene,pal=palettes[s.family]||palettes.colony,player=world.actors.find(a=>a.kind==='player');this.camera=Math.max(0,Math.min(s.width-1280,(player?.x||0)-550));
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,pal.bg);sky.addColorStop(.36,pal.wall);sky.addColorStop(1,'#101e1b');c.fillStyle=sky;c.fillRect(0,0,1280,720);
    // Distant masses only: independent from jump and near-floor collision geometry.
    for(let i=-1;i<9;i++){let x=i*184-(this.camera*.18)%184;rect(c,x,22,151,187,pal.far+'99','#5c736038');rect(c,x+17,54,116,108,'#0b1e21');for(let j=0;j<4;j++){line(c,x+17+j*30,54,x+17+j*30,162,'#596f625e',2);}rect(c,x+5,209,143,9,'#121f1a');}
    for(let i=0;i<4;i++){const y=28+i*16;line(c,0,y,1280,y,'#111e1bcc',9);line(c,0,y-3,1280,y-3,pal.trim+'66',2);}for(let i=0;i<11;i++){const x=i*137-this.camera*.48;rect(c,x,0,7,252,'#20342dda');rect(c,x+1,0,2,252,pal.trim+'60');}
    if(s.family==='operations'){
      rect(c,460-this.camera*.32,58,360,131,'#0d1d16','#8a9c7888');
      const px=490-this.camera*.32;for(let i=0;i<5;i++){rect(c,px+i*61,86+(i%2)*35,41,29,'#3c5532','#8eaf7666');if(i<4)line(c,px+i*61+41,101+(i%2)*35,px+(i+1)*61,101+((i+1)%2)*35,'#6c915d',2);}
      txt(c,session?.flags.relay?'LIAISON RÉTABLIE':'RELAIS À RÉTABLIR',640-this.camera*.32,172,11,session?.flags.relay?'#d1e7a5':'#c5a87f','center');
    }
    if(s.family==='logistics'){
      for(let i=0;i<4;i++){const x=80+i*340-this.camera*.24;rect(c,x,61,222,143,'#20363d','#74898a66');for(let j=0;j<6;j++)line(c,x+7,76+j*20,x+215,76+j*20,'#67878b55',4);txt(c,'FRET '+String(i+1).padStart(2,'0'),x+110,125,19,'#9ba99a','center');}
      line(c,0,218,1280,218,'#b6a061',8);for(let x=-40;x<1300;x+=72)line(c,x,218,x+18,228,'#273b36',11);
    }
    if(s.family==='reserve'){rect(c,758-this.camera*.27,73,350,121,'#233f34','#b4b99477');txt(c,'STOCK LIMITÉ / ÉQUIPEMENTS',932-this.camera*.27,110,13,'#cdd2b0','center');txt(c,'USCM  ·  SECOURS / DÉFENSE',932-this.camera*.27,151,10,'#a9bba2','center');}
    if(s.family==='workshop'){for(let i=0;i<4;i++){const x=210+i*260-this.camera*.20;rect(c,x-73,58,150,126,'#233c49','#688e9588');for(let j=0;j<3;j++){circle(c,x-35+j*37,118,13,'#0d242a','#9eccc388');circle(c,x-35+j*37,118,5,'#638d92');}txt(c,'CALIBRATION 0'+(i+1),x,167,9,'#9dbdc1','center');}txt(c,'OPTICAL SERVICE / SECOURS LOCAUX',48-this.camera*.28,217,12,'#bfd1c1');}
    if(s.family==='conduit'){for(let i=0;i<6;i++){const y=75+i*20;line(c,0,y,1280,y,'#283e39',15);line(c,0,y-5,1280,y-5,'#84978877',2);for(let x=80;x<1400;x+=260){rect(c,x-this.camera*.22,y-11,12,24,'#50685a','#a3b39755');}}for(let x=100;x<1400;x+=410){circle(c,x-this.camera*.20,175,24,'#304b3f','#a7b49b');circle(c,x-this.camera*.20,175,14,'#697764');}txt(c,'DÉRIVATION / ÉCHANGEURS DU BLOC',48-this.camera*.3,217,12,'#c4c6a3');}
    if(s.family==='service'){
      for(let i=0;i<3;i++){const x=540+i*208-this.camera*.18;circle(c,x,146,48,'#1e3028','#89917b');for(let n=0;n<5;n++){const t=(this.reducedMotion?0:world.time*.45)+n*Math.PI*2/5;c.save();c.translate(x,146);c.rotate(t);rect(c,8,-7,34,14,'#62725c');c.restore();}circle(c,x,146,12,'#293d2c','#b0ac83');}
      txt(c,'ALIMENTATION / DÉRIVATION DU BLOC',56-this.camera*.32,204,12,'#c5bda1');
    }
    filmBackdrop(this,world,pal);
    txt(c,s.title.toUpperCase(),45-this.camera*.32,236,19,pal.trim);txt(c,'WEYLAND–YUTANI  /  '+s.subtitle.toUpperCase(),47-this.camera*.32,253,9,'#b8c2bba0');
    const floor=c.createLinearGradient(0,265,0,670);floor.addColorStop(0,pal.floor);floor.addColorStop(1,'#172821');rect(c,0,265,1280,410,floor);line(c,0,265,1280,265,pal.trim,3);
    for(let x=-this.camera%90;x<1320;x+=90)line(c,x,265,x,672,'#78857526');for(let z=0;z<400;z+=38)line(c,0,265+z*.86,1280,265+z*.86,'#b1bda827');
    for(let x=20-this.camera;x<s.width;x+=140){rect(c,x,586,100,16,'#0c1c18','#425849');for(let j=0;j<10;j++)rect(c,x+5+j*9,589,4,10,'#69775c5e');}
    // Physical end points, shared with the transfer registry. These are scene
    // thresholds, not random decorative doors or map-only shortcuts.
    for(const e of exitsFor(s.id)){
      const structural=session?.engineering?.links[e.linkId];const p=this.project(e),near=distance(player,e)<80,linkOpen=session?.contacts?.links[e.linkId]?.open!==false,opening=session?.action?.kind==='link-open'&&session.action.id===e.id;
      if(!linkOpen){const hb=hatchBox(e),base=this.project({x:hb.x,z:hb.z+hb.d}),far=this.project(hb),lift=opening?session.action.elapsed/session.action.duration:0;rect(c,base.x,far.y-hb.h,hb.w,base.y-far.y+hb.h*(1-lift),'#40524b','#bfa778');for(let yy=far.y-hb.h+10;yy<base.y-hb.h*lift;yy+=16)line(c,base.x+2,yy,base.x+hb.w-2,yy,'#85957b',1);line(c,base.x-4,far.y-hb.h,base.x-4,base.y,'#91a187',3);line(c,base.x+hb.w+4,far.y-hb.h,base.x+hb.w+4,base.y,'#91a187',3);}
      if(structural){const box=hatchBox(e),a=this.project(box),b=this.project({x:box.x+box.w,z:box.z+box.d}),top=a.y-box.h;
        if(!linkOpen&&structural.hp<100){line(c,a.x+3,top+22,b.x-2,top+67,'#1c2921',3);line(c,b.x-2,top+67,a.x+6,top+100,'#bc9371',2);line(c,a.x+6,top+100,b.x-4,b.y-8,'#16231b',3);}
        if(structural.brace>0){line(c,a.x-4,top+18,b.x+4,b.y-16,'#c2a263',6);line(c,b.x+4,top+18,a.x-4,b.y-16,'#8d7247',6);for(const [x,y] of [[a.x,top+18],[b.x,top+18],[a.x,b.y-16],[b.x,b.y-16]])circle(c,x,y,3,'#d8c39b','#57472e');}
        if(structural.breached){line(c,a.x-4,top,a.x-10,top+44,'#b8a17c',4);line(c,b.x+4,b.y,b.x+13,b.y-27,'#9c8564',5);for(let i=0;i<4;i++)line(c,p.x-27+i*16,p.y+8,p.x-17+i*16,p.y+13,'#9d8e76',3);}
        if(!this.reducedMotion&&structural.lastImpact>0&&session.elapsed-structural.lastImpact<.35){for(let i=0;i<5;i++){const y=top+45+i*17;line(c,a.x-14-i*2,y,b.x+17+i*3,y-6,'#e0c6a3aa',1);}}
      }
      c.save();c.globalAlpha=near?1:.72;
      ellipse(c,p.x,p.y,35,12,'#61785536');
      line(c,p.x-28,p.y-9,p.x+28,p.y-9,pal.light,2);
      const signX=Math.max(110,Math.min(1170,p.x)),signY=p.y-135;
      if(e.x<100||e.x>1340){line(c,p.x-19,p.y-84,p.x-19,p.y+2,pal.trim,4);line(c,p.x+19,p.y-84,p.x+19,p.y+2,pal.trim,4);line(c,p.x-19,p.y-84,p.x+19,p.y-84,pal.light,4);}
      else{line(c,p.x-36,p.y-18,p.x-36,p.y+10,pal.trim,3);line(c,p.x+36,p.y-18,p.x+36,p.y+10,pal.trim,3);}
      rect(c,signX-95,signY-18,190,33,'#0b2119df','#586e4a');txt(c,e.label.toUpperCase(),signX,signY-3,10,'#cfdbc2','center');
      txt(c,structural?.breached?'BRÈCHE · J POUR RÉPARER':structural?.brace?'SOUDÉ · U POUR DÉCOUPER':opening?'RÉOUVERTURE · '+Math.round(session.action.elapsed/.88*100)+'%':!linkOpen?'ISOLÉ · R POUR OUVRIR':near?('E PASSER · R ISOLER'):'LIAISON OUVERTE',signX,signY+9,8,linkOpen?'#a7b496':'#dab587','center');if(near&&structural)txt(c,'BATTANT '+structural.hp+'%'+(structural.brace?'  RENFORT '+structural.brace:''),signX,signY+25,8,'#c2baa4','center');c.restore();
    }
    if(session?.mode==='operation'&&session.step===4&&s.id===extraction.room){const p=this.project(extraction);ellipse(c,p.x,p.y,56,17,'#a0bd6633');line(c,p.x-48,p.y,p.x+48,p.y,'#d9d4a5',3);txt(c,'POINT DE REPLI',p.x,p.y-125,13,'#dae0b1','center');}
    // Support footprints are fixed in scene coordinates.
    for(const b of s.solids){const p=this.project(b);rect(c,p.x,p.y,b.w,b.d*.86,'#08191370');}
    for(const n of s.nodes){if(world.visited.includes(n.id))continue;const p=this.project(n);line(c,p.x-13,p.y,p.x+13,p.y,'#d6c89730');}
    const items=[...s.props.map(p=>({z:p.bodyId?(s.solids.find(b=>b.id===p.bodyId).z+s.solids.find(b=>b.id===p.bodyId).d+.01):p.z,fn:()=>this.prop(p,world,pal)})),...s.solids.filter(b=>!b.visual||b.visual==='vestibule-return').map(b=>({z:b.z+b.d,fn:()=>{const occluding=world.actors.some(a=>a.alive&&a.kind!=='enemy'&&a.x>b.x-50&&a.x<b.x+b.w+50&&a.z<b.z+b.d&&a.z>b.z-130);c.save();if(occluding)c.globalAlpha=.23;this.box(b,pal);c.restore();}})),...s.doors.map(d=>({z:d.z+d.d,fn:()=>this.door(d,world,pal)})),...world.actors.filter(a=>a.kind!=='enemy'||observed(session,world,a)).map(a=>({z:a.z,fn:()=>this.actor(a,world)}))];
    items.sort((a,b)=>a.z-b.z);for(const it of items)it.fn();
    for(const tr of world.traces){const a=this.project(tr.a),b=this.project(tr.b);const flame=tr.style==='flame',knife=tr.style==='knife';line(c,a.x,a.y-42,b.x,b.y-35,flame?'#e0903799':knife?'#adcbcd':'#e8d4a0',flame?14:knife?5:2);if(flame)line(c,a.x,a.y-42,b.x,b.y-35,'#ffe19aac',4);glow(c,a.x,a.y-42,flame?44:25,'#f9d98e71');circle(c,b.x,b.y-35,flame?7:3,'#fff3bc');}
    for(const f of session?.arsenal?.flights||[]){if(f.roomId!==s.id)continue;const t=Math.max(0,Math.min(1,(session.elapsed-f.started)/(f.ends-f.started))),p=this.project({x:f.from.x+(f.target.x-f.from.x)*t,z:f.from.z+(f.target.z-f.from.z)*t});circle(c,p.x,p.y-8-Math.sin(t*Math.PI)*76,4,'#d8c799','#fff1b5');}
    for(const e of session?.weaponEffects||[]){if(e.roomId!==s.id)continue;const p=this.project(e),t=Math.max(0,(e.until-session.elapsed)/.32);c.save();c.globalAlpha=t*.45;ellipse(c,p.x,p.y-16,e.radius*(1.1-t*.4),e.radius*.5,'#daa45e');c.restore();}
    if(aim&&!world.paused&&player?.alive){const a=this.project(aim);line(c,a.x-6,a.y-45,a.x+6,a.y-45,'#b9c9a89a');line(c,a.x,a.y-51,a.x,a.y-39,'#b9c9a89a');}
    for(const a of world.actors){if(a.kind==='enemy'||!a.alive)continue;const p=this.project(a),near=distance(player,a)<180; if(a.kind==='player')continue;if(near){txt(c,a.name+(a.order==='cover'?' · couvre':a.waiting&&a.role!=='sentry'?' · reste':''),p.x,p.y-(a.kind==='escort'?70:104),10,'#b1c4a7','center');}}
    const nearest=s.doors.map(d=>({...d,dist:distance(player,{x:d.x+d.w/2,z:d.z+d.d/2})})).filter(d=>d.dist<d.reach).sort((a,b)=>a.dist-b.dist)[0];if(nearest&&!world.paused){const p=this.project(player);const str=nearest.critical?'Commande du sas réservée':session?.action?'GESTE EN COURS · E annule':'E · '+(world.doors[nearest.id].open?'Fermer':'Ouvrir');rect(c,p.x-92,p.y+20,184,25,'#0a1918e8','#8b9a77');txt(c,str,p.x,p.y+37,11,'#d1ddc1','center');}
    const action=session?.action;
    if(action&&['medical','ammo','sentry'].includes(action.kind)){const target=world.actors.find(a=>a.id===action.targetId);if(target){const a=this.project(player),b=this.project(target);line(c,a.x,a.y-28,b.x,b.y-28,'#a6d4b099',2);const pct=action.elapsed/action.duration;rect(c,b.x-34,b.y-111,68,7,'#173527','#89ae90');rect(c,b.x-32,b.y-109,64*pct,3,'#d2dfae');txt(c,action.kind==='medical'?'SOINS':'RAVITAILLEMENT',b.x,b.y-120,9,'#d0dfb4','center');}}
    if(action&&['brace','cut-brace','repair-hatch'].includes(action.kind)){const e=exitsFor(s.id).find(e=>e.id===action.id);if(e){const a=this.project(player),b=this.project(e),f=action.elapsed/action.duration;line(c,a.x,a.y-49,b.x,b.y-52,'#b9a16e',3);circle(c,b.x,b.y-52,4,'#f3dcaa');glow(c,b.x,b.y-52,this.reducedMotion?30:42+Math.sin(world.time*12)*5,'#d9b77155');if(!this.reducedMotion)for(let i=0;i<5;i++){const t=world.time*4+i;line(c,b.x,b.y-51,b.x+Math.sin(t)*25,b.y-26+i*5,'#e5bd75aa',1);}/* Progress remains in the external action bar, not over hatch signage. */}}
    // Edge foreground attenuated near the actor. No full-screen decorative mask.
    for(const side of [0,1246]){const near=Math.abs(this.project(player).x-side)<120;c.globalAlpha=near?.12:.46;rect(c,side,140,34,580,'#051410');line(c,side+12,146,side+12,690,pal.trim,4);}c.globalAlpha=1;
    if(!this.reducedMotion){const t=world.time;for(let i=0;i<14;i++){const x=(i*103+Math.sin(t*.2+i)*9)%1280,y=120+(i*73)%450;circle(c,x,y,1,'#ced5b22c');}}
    const vignette=c.createRadialGradient(640,370,250,640,370,860);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#030b0878');c.fillStyle=vignette;c.fillRect(0,0,1280,720);if(this.highContrast){c.strokeStyle='#bacda4';c.lineWidth=1;for(const b of s.solids){const p=this.project({x:b.x,z:b.z+b.d});c.strokeRect(p.x,p.y-(b.h||72),b.w,b.h||72);}}
    renderLighting(this,world,session);
    // Small puck body stays attached to its true floor, after local illumination.
    for(const b of session?.beacons?.markers||[]){if(b.roomId!==s.id||!visible(world,player,b))continue;const p=this.project(b),live=b.expiresAt>session.elapsed,alpha=live?B.strength(session,b):0;ellipse(c,p.x,p.y+2,10,4,'#071514a0');rect(c,p.x-7,p.y-9,14,9,live?'#75887b':'#34473f','#9bb09a');circle(c,p.x,p.y-8,4,live?'#f0d6a0':'#4f6256');if(live){glow(c,p.x,p.y-8,20,'#ddaf6370');if(distance(player,b)<210)txt(c,Math.ceil(b.expiresAt-session.elapsed)+' s',p.x,p.y+21,9,'#c9c5a4','center');}}
    if(session?.action?.kind==='beacon-throw'){const dest=B.landing(world,player,session.action.aim);if(dest){const a=this.project(player),b=this.project(dest);c.save();c.setLineDash([4,7]);line(c,a.x,a.y-42,b.x,b.y-8,'#c5b78b88',1);c.setLineDash([]);ellipse(c,b.x,b.y,14,6,'#bdb08244');line(c,a.x,a.y-54,a.x+(player.facing||1)*28,a.y-42,'#a5b49a',6);rect(c,a.x+(player.facing||1)*28-4,a.y-46,8,13,'#dfca9a','#5d755f');c.restore();}}

    drawTactics(this,world,session);

  }
}
