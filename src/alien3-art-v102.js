/** Shared Canvas renderer: this exact module is imported by the DLC and the visual bench.
 * No generated screenshots, no independent Python re-illustration of the game state. */
import {clamp102,foregroundOpacityV102,isDecorVisibleV102,sectorAt102} from './alien3-dlc-v102.js';
const TAU=Math.PI*2;
const rect=(c,x,y,w,h,fill,stroke)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=.7;c.strokeRect(x+.3,y+.3,w-.6,h-.6);}};
const line=(c,x,y,x2,y2,s='#858477',w=1)=>{c.beginPath();c.strokeStyle=s;c.lineWidth=w;c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
const ellipse=(c,x,y,rx,ry,fill,stroke)=>{c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}};
const path=(c,points,fill,stroke)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}};
function metal(c,x,y,w,h,warm=false){const g=c.createLinearGradient(x,y,x+w,y);g.addColorStop(0,warm?'#322b25':'#242d2c');g.addColorStop(.16,warm?'#8f7960':'#6f7d77');g.addColorStop(.45,warm?'#5f5241':'#46514e');g.addColorStop(.8,warm?'#857258':'#65746d');g.addColorStop(1,'#1b2423');rect(c,x,y,w,h,g,'#141c1b');}
function bolts(c,x,y,w,h){for(const xx of [x+3,x+w-3])for(const yy of [y+3,y+h-3]){ellipse(c,xx,yy,1.4,1.4,'#afa48a','#242823');line(c,xx-1,yy,xx+1,yy,'#282d28',.5);}}
function grille(c,x,y,w,h){rect(c,x,y,w,h,'#111b1b','#65716a');for(let yy=y+3;yy<y+h-2;yy+=4)line(c,x+3,yy,x+w-3,yy,'#5d675e',1);bolts(c,x,y,w,h);}
function glow(c,x,y,r,alpha=.35,warm=false){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,warm?`rgba(241,133,40,${alpha})`:`rgba(178,205,156,${alpha})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function pipe(c,x,y,w,h){metal(c,x,y,w,h);if(w>h){for(let xx=x+4;xx<x+w-2;xx+=26){rect(c,xx,y-1,3,h+2,'#758176','#202b28');line(c,xx+1,y,xx+1,y+h,'#a8aa8e',.5);}}else for(let yy=y+6;yy<y+h-2;yy+=22)rect(c,x-1,yy,w+2,3,'#707d72','#202c27');}
function screen(c,x,y,w,h){metal(c,x,y,w,h);rect(c,x+3,y+4,w-6,h-8,'#0d2320','#839382');for(let yy=y+7;yy<y+h-5;yy+=5)line(c,x+6,yy,x+w-8-(yy%9),yy,'#5b876b',.6);rect(c,x+w-9,y+h-3,2,1,'#c6b268');}
function wear(c,seed){c.save();c.globalAlpha=.25;for(let i=0;i<9;i++){const x=(seed*13+i*19)%94,y=(seed*11+i*29)%92;line(c,x,y,Math.min(99,x+6+i%8),Math.min(99,y+4),'#aa835d',.55);}c.restore();}
export function drawAlien3PropV102(c,p,{time=0,flags={},detail='high'}={}){
 if(!isDecorVisibleV102(p,flags))return false;
 c.save();c.translate(p.x,p.y);c.scale(p.w/100,p.h/100);
 // Clip primitives to declared bounds: rendering cannot silently exceed placement audits.
 c.beginPath();c.rect(0,0,100,100);c.clip();
 switch(p.kind){
 case 'pipe': pipe(c,2,3,96,94);break;
 case 'support':metal(c,8,0,84,100,true);line(c,25,0,25,100,'#beb297',2);rect(c,0,88,100,12,'#55594b');break;
 case 'duct':metal(c,0,2,100,96);for(let x=12;x<96;x+=22){line(c,x,3,x,97,'#a59c82',1.5);line(c,x+2,3,x+2,97,'#182321',1.2);}bolts(c,0,2,100,96);break;
 case 'junction':metal(c,2,1,96,98);rect(c,10,9,80,68,'#2b3530','#9b9b81');grille(c,16,15,64,25);for(let i=0;i<3;i++)ellipse(c,23+24*i,58,5,5,i===1?'#b99442':'#466a55','#101916');rect(c,62,83,17,7,'#c3b58c');bolts(c,3,2,94,95);break;
 case 'fan':{metal(c,0,0,100,100);ellipse(c,50,50,46,46,'#080f11','#909184');c.save();c.translate(50,50);c.rotate(time*.6);for(let i=0;i<5;i++){c.rotate(TAU/5);path(c,[[0,0],[7,-13],[40,-19],[38,-2],[16,10]],'#536059','#839081');}c.restore();ellipse(c,50,50,9,9,'#7b8473','#232e2c');for(let yy=9;yy<94;yy+=9)line(c,6,yy,94,yy,'rgba(19,26,24,.85)',1);bolts(c,0,0,100,100);break;}
 case 'valve': pipe(c,42,4,16,93);ellipse(c,50,51,40,40,null,'#7c4636');ellipse(c,50,51,35,35,null,'#bc8a5c');for(let i=0;i<5;i++){let a=i*TAU/5;line(c,50,51,50+34*Math.cos(a),51+34*Math.sin(a),'#9b7351',5);}ellipse(c,50,51,10,10,'#ae9674','#252923');break;
 case 'gauge':ellipse(c,50,50,48,48,'#9a9781','#1a2420');ellipse(c,50,50,40,40,'#c2bba2','#444c41');for(let i=0;i<10;i++){const a=2.2+i*.49;line(c,50+30*Math.cos(a),50+30*Math.sin(a),50+37*Math.cos(a),50+37*Math.sin(a),'#313b31',2);}line(c,50,50,73,25,'#693528',3);ellipse(c,50,50,4,4,'#303b32');break;
 case 'cable':c.strokeStyle='#1b211c';c.lineWidth=15;c.beginPath();c.moveTo(3,5);c.bezierCurveTo(11,89,84,21,96,96);c.stroke();c.strokeStyle='#827d5e';c.lineWidth=5;c.stroke();break;
 case 'grille':case 'drain':grille(c,1,3,98,95);break;
 case 'stencil':rect(c,1,1,98,97,'#6e6a4e','#ada280');c.fillStyle='#252e23';c.font='bold 40px sans-serif';c.textAlign='center';c.fillText(p.label||'161',50,47,88);for(let x=9;x<96;x+=15)rect(c,x,67,7,14,'#30382b');break;
 case 'lamp':metal(c,0,0,100,94);rect(c,7,28,86,48,'#d7d3a4','#9a9476');for(let x=15;x<97;x+=18)line(c,x,8,x,90,'#454f43',3);break;
 case 'eev':path(c,[[2,29],[22,2],[76,0],[97,28],[100,88],[76,100],[17,92],[0,63]],'#777263','#b5ae91');path(c,[[7,34],[25,10],[68,7],[92,29],[91,79],[70,89],[21,84],[6,62]],'#273231','#a2977c');for(let i=0;i<3;i++){metal(c,18+i*25,24,20,47);rect(c,21+i*25,30,14,27,'#122020','#6b8176');rect(c,22+i*25,63,12,3,'#b4a97b');}path(c,[[1,27],[17,19],[12,37],[21,50],[0,63]],'#34352d','#a78865');line(c,4,57,14,65,'#dcc095',1);bolts(c,13,14,68,64);break;
 case 'cabinet':metal(c,2,0,96,100);rect(c,9,9,82,77,'#566258','#242f28');line(c,50,10,50,89,'#bbc0a0',1);rect(c,41,42,3,19,'#acb49a');rect(c,56,42,3,19,'#acb49a');rect(c,15,2,70,5,'#8c7457');rect(c,9,94,13,6,'#414a3e');rect(c,77,94,13,6,'#414a3e');break;
 case 'gurney':metal(c,1,26,98,22);rect(c,5,10,83,19,'#a39c81','#d0c5a0');path(c,[[6,11],[78,10],[87,15],[80,26],[8,25]],'#bbb499','#d3c8a2');line(c,14,45,19,83,'#8b9d8c',4);line(c,83,45,79,83,'#8b9d8c',4);line(c,17,65,81,65,'#52655a',3);ellipse(c,19,89,7,11,'#162020','#889486');ellipse(c,80,89,7,11,'#162020','#889486');break;
 case 'monitor':screen(c,0,0,100,100);break;
 case 'console':metal(c,2,36,96,64);path(c,[[3,35],[14,4],[86,4],[98,35]],'#647568','#a6aa8e');rect(c,15,10,31,15,'#18382d','#a4b09a');for(let i=0;i<5;i++)ellipse(c,55+i*7,21,2.5,2.5,i%2?'#b3a364':'#9fa98b');grille(c,14,51,72,33);bolts(c,3,36,94,61);break;
 case 'sink':case 'basin':metal(c,5,41,89,24);ellipse(c,49,40,41,14,'#afbaa2','#43544b');ellipse(c,49,42,26,8,'#24342f');pipe(c,79,4,6,30);line(c,80,6,63,6,'#b7baa0',5);pipe(c,39,65,11,32);line(c,9,66,13,97,'#738674',3);break;
 case 'bottle':path(c,[[30,1],[70,1],[70,17],[92,31],[92,95],[8,95],[8,31],[30,17]],'#5c8779','#a4b9a0');rect(c,30,0,40,13,'#b3b6a0');rect(c,18,49,64,27,'#d0c9aa');break;
 case 'tray':metal(c,1,8,98,84);rect(c,9,18,82,59,'#9eaa98','#44584a');break;
 case 'cell':metal(c,0,0,100,100,true);rect(c,9,8,82,86,'#071313','#858979');rect(c,15,74,74,14,'#434b39');for(let x=19;x<89;x+=13){metal(c,x,9,3,84);line(c,x,10,x,93,'#abae8c',.8);}line(c,10,43,91,43,'#697662',3);line(c,10,73,91,73,'#697662',3);break;
 case 'bunk':for(let i=0;i<2;i++){metal(c,1,26+i*46,98,6);rect(c,5,16+i*46,87,10,'#a59d7e','#c3b49a');rect(c,8,14+i*46,23,4,'#b6b29b');}for(let x of [3,94])pipe(c,x,1,3,97);line(c,50,4,50,92,'#5e7061',2);for(let y=13;y<95;y+=13)line(c,45,y,61,y,'#87957d',2);break;
 case 'blanket':rect(c,0,0,100,100,'#8c8470','#b8a488');for(let x=8;x<100;x+=17)line(c,x,0,x-5,99,'#52584a',1);break;
 case 'cup':metal(c,7,10,66,83);ellipse(c,40,10,33,9,'#202c25','#b5b59e');ellipse(c,75,48,22,28,null,'#84907b');break;
 case 'bowl':ellipse(c,50,56,48,41,'#8b977f','#bcc2a2');ellipse(c,50,33,47,27,'#26372b','#bdc1a0');break;
 case 'table':case 'bench':case 'altar':metal(c,0,12,100,19,true);for(const x of [9,84])metal(c,x,32,7,68);line(c,12,84,90,84,'#5b6e5a',4);if(p.kind==='altar')rect(c,8,0,85,20,'#978c71','#c5b18d');break;
 case 'rack':metal(c,1,0,7,100);metal(c,92,0,7,100);for(let y=3;y<100;y+=29){metal(c,3,y,94,4);for(let x=13;x<80;x+=25){rect(c,x,y+8,19,18,'#4d5d4d','#89957b');rect(c,x+5,y+13,10,3,'#c6b48a');}}break;
 case 'candle':rect(c,25,15,50,85,'#c1b590','#817e65');ellipse(c,50,8,16,8,'#edce80');break;
 case 'book':path(c,[[0,18],[43,0],[50,13],[57,0],[100,18],[100,92],[57,81],[50,94],[43,81],[0,92]],'#b2aa8d','#5f6050');line(c,50,17,50,90,'#3b4634',2);break;
 case 'pump':metal(c,11,77,78,23);ellipse(c,37,50,32,32,'#536754','#a3a88b');ellipse(c,37,50,20,20,'#344d40','#8d9e86');metal(c,62,27,35,46);for(let x=68;x<99;x+=7)line(c,x,31,x,70,'#203b31',3);pipe(c,18,3,13,27);bolts(c,13,79,74,20);break;
 case 'tank':metal(c,7,12,86,79);ellipse(c,50,12,43,12,'#7f8b76','#9ca185');ellipse(c,50,90,43,9,'#465b4c','#8a967a');for(let y of [31,64])rect(c,5,y,90,5,'#343f32','#a6a284');pipe(c,45,0,10,10);rect(c,22,94,11,6,'#505d47');rect(c,72,94,11,6,'#505d47');break;
 case 'toolboard':rect(c,0,0,100,100,'#4d5748','#9b9b7c');for(let x=10;x<96;x+=19){line(c,x,22,x,86,'#a7ac8c',4);ellipse(c,x,18,6,10,null,'#929e7a');}break;
 case 'case':metal(c,1,0,98,100,p.condition!=='company');for(let x of [6,86])rect(c,x,3,8,94,'#28372d','#979980');rect(c,32,3,36,14,'#243429','#8d9c86');rect(c,28,44,42,19,'#b4af8d');bolts(c,4,4,92,92);break;
 case 'barrel':metal(c,2,9,96,83,true);ellipse(c,50,9,48,8,'#9b9074','#5c5846');for(let y of [27,66,87])rect(c,0,y,100,4,'#3b4537','#a49a7b');rect(c,28,37,45,21,'#a79d7d');break;
 case 'spool':ellipse(c,50,50,46,45,'#484d38','#a7a585');ellipse(c,50,50,33,31,'#172a23','#607565');for(let r of [11,18,25])ellipse(c,50,50,r,r,null,'#768872');ellipse(c,50,50,5,6,'#acb293');break;
 case 'stool':ellipse(c,50,14,47,13,'#929376','#bac0a0');for(let x of [12,83])line(c,50,27,x,99,'#71836b',5);break;
 case 'crucible':path(c,[[3,11],[97,11],[81,93],[70,100],[28,100],[17,93]],'#77614a','#b5a282');metal(c,11,15,77,11,true);ellipse(c,50,12,47,11,'#26291d','#aaa185');ellipse(c,50,12,36,6,flags.leadHot?'#e7b15b':'#635d3d');for(let x of [17,81])metal(c,x,44,6,30,true);line(c,25,30,34,87,'#aa8a68',1.2);break;
 case 'gantry':for(let x of [0,94])metal(c,x,3,6,96,true);metal(c,0,0,100,8,true);for(let x=4;x<97;x+=20){line(c,x,0,x+16,8,'#b0966b',1);}bolts(c,0,0,100,9);break;
 case 'hoist':pipe(c,44,0,10,65);metal(c,26,4,48,23,true);c.beginPath();c.strokeStyle='#9b987d';c.lineWidth=7;c.arc(54,78,18,-Math.PI/2,Math.PI*.85);c.stroke();break;
 case 'ladle':metal(c,44,2,14,58,true);ellipse(c,50,79,47,20,'#8a6f4e','#b09a6f');ellipse(c,50,70,44,11,'#31281c','#a68c5d');break;
 case 'slag':path(c,[[4,19],[97,19],[85,100],[16,100]],'#4e503e','#a49879');for(let i=0;i<6;i++)path(c,[[i*15+3,26],[i*15+13,5+i%3*5],[i*15+29,27]],'#55503d','#796c53');break;
 case 'piston':metal(c,9,87,81,13,true);metal(c,22,38,56,48);metal(c,38,2,24,39);metal(c,18,34,64,9,true);for(let y of [47,68,81])line(c,24,y,75,y,'#afb292',2);rect(c,36,0,28,5,'#c0c4aa');bolts(c,10,87,78,12);break;
 case 'mold':metal(c,0,9,100,91,true);path(c,[[6,18],[94,18],[89,73],[11,73]],'#212b23','#a78a5f');path(c,[[16,27],[84,27],[79,61],[21,61]],flags.leadHot?'#ce9747':'#53452c','#846a43');for(let x of [5,86])metal(c,x,74,10,20);break;
 case 'furnace':metal(c,0,0,100,100,true);for(let y=1;y<100;y+=13)line(c,1,y,99,y,'#312e22',1);ellipse(c,50,56,43,40,'#262b1e','#a18755');ellipse(c,50,56,35,33,'#3f2a12','#cc9450');{const g=c.createRadialGradient(50,57,2,50,57,33);g.addColorStop(0,flags.leadHot?'#fff3a2':'#bd8030');g.addColorStop(.42,'#c77925');g.addColorStop(1,'#391f0c');ellipse(c,50,57,31,29,g);}for(let i=0;i<10;i++){const a=i*TAU/10;line(c,50+35*Math.cos(a),56+33*Math.sin(a),50+41*Math.cos(a),56+39*Math.sin(a),'#bf9b62',2);}grille(c,9,88,82,10);break;
 case 'recovery':metal(c,0,0,100,100);rect(c,8,6,84,87,'#1a2926','#b4c3b1');for(let x=14;x<97;x+=18)pipe(c,x,7,3,84);metal(c,30,35,40,23);bolts(c,1,0,97,100);break;
 case 'lampstand':metal(c,43,12,15,71);line(c,50,80,0,100,'#9fab99',7);line(c,50,80,100,100,'#9fab99',7);rect(c,0,0,100,22,'#d1d7b6','#566753');rect(c,9,3,82,14,'#f1e9be');break;
 case 'clamp':metal(c,0,0,100,100);rect(c,30,24,41,76,'#13231d');break;
 case 'winch':metal(c,0,71,100,29);ellipse(c,20,43,17,35,'#899279','#a9b195');ellipse(c,80,43,17,35,'#788870','#a9b195');metal(c,20,19,60,49);for(let x=29;x<81;x+=7)line(c,x,21,x,65,'#2e4838',3);break;
 default: // deliberate marker: unknown shapes are reported by QA, not silently "accepted".
  rect(c,1,1,98,98,'#5c3542','#dab3bc');break;
 }
 if(detail==='high'&&!['lamp','monitor','cable','cup','bottle','gauge'].includes(p.kind))wear(c,p.variant||1);
 c.restore();return true;
}
function drawBackdropPass(c,{camera={x:0,y:0},width=1280,height=720,scene,time=0,flags={},focusOverride=null}){
 const cx=Number.isFinite(camera.x)?camera.x:0,cy=Number.isFinite(camera.y)?camera.y:0;
 const focus=focusOverride||sectorAt102(cx+width*.4);const warm=focus.x0>=4020,coast=focus.id==='hybrid-storm-yard';const medical=focus.id==='hybrid-eev-infirmary',cells=focus.id==='hybrid-cellblock',service=focus.id==='hybrid-service-tunnels';
 c.save();const base=c.createLinearGradient(0,0,0,height);base.addColorStop(0,coast?'#202f2e':warm?'#302a20':'#172522');base.addColorStop(.65,coast?'#546055':warm?'#51422b':'#3c4637');base.addColorStop(1,'#121c18');c.fillStyle=base;c.fillRect(0,0,width,height);
 // Distant walls: camera-continuous, cover y=0 rather than floating below a fixed offset.
 const shift=-((cx*.14)%235);for(let x=shift-235;x<width+235;x+=235){
  rect(c,x,0,219,height,warm?'rgba(84,64,38,.23)':'rgba(46,66,51,.26)');
  for(let y=-((cy*.08)%35);y<height;y+=35){line(c,x,y,x+219,y,'rgba(9,21,17,.25)',2);const offset=(Math.round(y/35)%2)*38;for(let k=x+offset;k<x+219;k+=76)line(c,k,y,k,y+35,'rgba(12,26,19,.19)',1);}
  metal(c,x+207,0,13,height,warm);
  if(cells){ellipse(c,x+103,114,64,61,'rgba(6,15,13,.7)','#5f6953');rect(c,x+39,115,128,148,'rgba(6,15,13,.7)');for(let xx=x+46;xx<x+164;xx+=19)line(c,xx,103,xx,259,'#4c5c48',3);}
  else if(warm){
   metal(c,x+40,104,119,211,true);ellipse(c,x+99,105,59,20,'#6c6046','#8b7c59');ellipse(c,x+99,313,59,16,'#3e402b','#726d4c');
   for(let yy=137;yy<304;yy+=51){rect(c,x+34,yy,130,8,'#353e2b','#817b57');bolts(c,x+34,yy,130,8);}pipe(c,x+170,78,17,280);line(c,x+40,90,x+161,90,'#73734f',3);
   if(flags.leadHot)glow(c,x+106,248,116,.12,true);
  }else if(service){pipe(c,x+26,119,157,29);pipe(c,x+173,119,19,244);pipe(c,x+58,80,11,260);grille(c,x+78,192,71,94);}
  else if(medical){path(c,[[x+19,275],[x+19,154],[x+55,99],[x+150,99],[x+189,154],[x+189,275]],'rgba(15,28,23,.30)','#687660');rect(c,x+59,138,91,98,'rgba(121,129,105,.09)');line(c,x+64,242,x+155,242,'#839178',3);}
  else if(!coast){grille(c,x+36,153,120,71);pipe(c,x+176,90,13,223);line(c,x+34,283,x+167,283,'#6e7e62',3);}
 }
 // Far overhead collector and roof ribs; never a second background bitmap on top.
 pipe(c,-40-((cx*.28)%220),24,width+300,20);pipe(c,-30,57,width+60,9);
 for(let x=-((cx*.18)%312);x<width+312;x+=312){metal(c,x,0,17,101,warm);path(c,[[x,94],[x+142,154],[x+147,143],[x+16,74]],'#394a39','#72816a');}
 if(coast){c.save();c.strokeStyle='rgba(174,190,167,.22)';c.lineWidth=1;for(let i=0;i<64;i++){let x=(i*119+time*31)%width,y=(i*67+time*201)%height;line(c,x,y,x-7,y+27,'rgba(183,198,175,.21)',1);}c.restore();}
 const v=c.createRadialGradient(width*.5,height*.5,110,width*.5,height*.5,width*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,8,5,.62)');c.fillStyle=v;c.fillRect(0,0,width,height);c.restore();
 return {top:0,sectorId:focus.id};
}
export function drawAlien3BackdropV102(c,options={}){
 const width=options.width||1280,focusX=(options.camera?.x||0)+width*.4;
 const left=sectorAt102(focusX-96),right=sectorAt102(focusX+96);
 if(left.id===right.id)return drawBackdropPass(c,options);
 const raw=Math.max(0,Math.min(1,(focusX-(right.x0-96))/192)),blend=raw*raw*(3-2*raw);
 drawBackdropPass(c,{...options,focusOverride:left});
 c.save();c.globalAlpha*=blend;drawBackdropPass(c,{...options,focusOverride:right});c.restore();
 return {top:0,sectorId:sectorAt102(focusX).id,blend};
}
export function drawAlien3SceneryV102(c,scene,{camera={x:0,y:0},width=1280,height=720,time=0,flags={},detail='high'}={}){
 const left=camera.x-80,right=camera.x+width+80;let count=0;
 c.save();
 for(const g of scene.groups){
  if(g.x+g.w<left||g.x>right||!isDecorVisibleV102(g,flags))continue;
  // Explicit recessed bay and a visible bearing ledge. It is behind, not on, the walk lane.
  const top=g.y-g.h-12;rect(c,g.x-7,top,g.w+14,g.h+12,'rgba(5,16,13,.76)','#626c53');
  rect(c,g.x-5,g.y-4,g.w+10,4,'#849076','#344936');
  for(let yy=top+19;yy<g.y-8;yy+=23)line(c,g.x-3,yy,g.x+g.w+3,yy,'rgba(139,129,97,.10)',.7);
 }
 for(const p of scene.props){if(p.x+p.w<left||p.x>right||p.y+p.h<camera.y-60||p.y>camera.y+height+60)continue;if(drawAlien3PropV102(c,p,{time,flags,detail}))count++;}
 for(const p of scene.props.filter(p=>['lamp','lampstand','candle'].includes(p.kind))){if(p.x+p.w<left||p.x>right||!isDecorVisibleV102(p,flags))continue;glow(c,p.x+p.w/2,p.y+p.h,Math.min(113,Math.max(48,p.w*1.9)),.10,p.kind==='candle');}
 c.restore();return count;
}
export function drawAlien3ForegroundV102(c,{camera={x:0,y:0},actors=[],width=1280,height=720,coast=false}={}){
 c.save();let n=0;
 // Screen-edge framing only, with automatic silhouette clearance, never an opaque UI mask.
 for(let wx=Math.floor(camera.x/570)*570;wx<camera.x+width+570;wx+=570){
  const sx=wx-camera.x;const b={x:sx-7,y:0,w:14,h:151};const screenActors=actors.map(a=>a?{...a,x:a.x-camera.x,y:a.y-camera.y}:null);
  c.globalAlpha=foregroundOpacityV102(b,screenActors,.26);pipe(c,b.x,b.y,b.w,b.h);n++;
 }
 c.globalAlpha=1;c.restore();return n;
}
export const ALIEN3_RENDER_KINDS_V102=Object.freeze(['pipe','support','duct','junction','fan','valve','gauge','cable','grille','drain','stencil','lamp','eev','cabinet','gurney','monitor','console','sink','basin','bottle','tray','cell','bunk','blanket','cup','bowl','table','bench','altar','rack','candle','book','pump','tank','toolboard','case','barrel','spool','stool','crucible','gantry','hoist','ladle','slag','piston','mold','furnace','recovery','lampstand','clamp','winch']);
