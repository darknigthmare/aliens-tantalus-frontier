import { DATA } from './oth-data.js';
import {ROOM,PROP,currentObjective,activeEdges,nearby,roomWorld,route,crewInRoom,activeHazards,lightAt,stealthStatus,doorStatus,nearestBulkhead,serviceStatus,incomingThreats,listenReport,maintenanceStatus,maintenanceRoute,excursionStatus,excursionOperation,floodAt,roomGeometry,cartsInRoom,nearestCart,cartPosition,actorAppearance} from './oth-engine.js';
let W=1280; const H=650,Z=1.22;
const palette={ship:['#071017','#172d36','#78aaa9','#d4b277'],industrial:['#101617','#283738','#91ada2','#d4a568'],hangar:['#080f16','#243542','#79959f','#dfa45b'],wreck:['#140d0b','#31251e','#ad8971','#f1a662'],medical:['#121e20','#435256','#bdcbc5','#d6c6a0'],server:['#050f10','#162c2d','#709b83','#cbb673'],surface:['#181811','#666151','#aa9c78','#edcb89'],mine:['#0c1110','#34382c','#889074','#e0ba6d'],cavern:['#0a1113','#283239','#799092','#d1b778'],derelict:['#0b0e13','#232934','#817f94','#cdb594'],hive:['#0b0f11','#25312e','#8b9c83','#d4bc92']};
const rand=(i)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function rect(c,x,y,w,h,fill,stroke){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x+.5,y+.5,w-1,h-1);}}
function line(c,pts,color,width=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();c.lineWidth=1;}
function ellipse(c,x,y,rx,ry,color,stroke){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function text(c,t,x,y,size=11,col='#c3d1c8',align='left'){c.font=`${size}px "Courier New",monospace`;c.fillStyle=col;c.textAlign=align;c.fillText(t,x,y);}
function gradient(c,x,y,w,h,a,b){const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,a);g.addColorStop(1,b);rect(c,x,y,w,h,g);}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function planet(c,x,y,r){c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();const g=c.createLinearGradient(x-r,y-r,x+r,y+r);g.addColorStop(0,'#b2b8ad');g.addColorStop(.2,'#737c79');g.addColorStop(.53,'#353f3d');g.addColorStop(.77,'#0c171c');g.addColorStop(1,'#04090d');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);for(let i=0;i<18;i++){c.globalAlpha=.10;line(c,[[x-r,y-r+i*r/8],[x-r*.2,y-r+i*r/8+r*.1],[x+r,y-r+i*r/8-r*.18]],i%2?'#acb19b':'#030b10',6+i%5);}c.restore();c.beginPath();c.arc(x,y,r,Math.PI*1.05,Math.PI*1.7);c.strokeStyle='#c5c1a580';c.lineWidth=2;c.stroke();c.lineWidth=1;}
function ship(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(c,0,15,215,15,'#03070bc0');poly(c,[[-220,-30],[-170,-96],[-80,-112],[138,-100],[216,-50],[226,-17],[90,-4],[-198,-6]],'#34414a','#819199');poly(c,[[-160,-88],[-75,-106],[43,-102],[48,-73],[-147,-62]],'#08161f','#607278');for(let i=0;i<6;i++){rect(c,60+i*20,-77,14,27,'#192832','#495962');}poly(c,[[-220,-28],[-50,-39],[88,-29],[215,-43],[226,-17],[90,-4],[-198,-6]],'#1d2b33','#516269');line(c,[[-167,-58],[111,-62],[183,-41]],'#abb3aa',2);for(const k of [-150,145]){rect(c,k,-6,9,30,'#63716f');rect(c,k-20,21,51,5,'#1b2328');}rect(c,-30,-32,72,26,'#10191d','#91a397');text(c,'SAMSON',66,-45,14,'#d2cbbb');text(c,'CARGO / 02',-137,-20,9,'#c6b67a');c.restore();}
function rock(c,x,y,w,h,seed,color='#30372f'){const pts=[];for(let i=0;i<9;i++){const a=i/9*Math.PI*2;pts.push([x+Math.cos(a)*w*(.72+rand(seed+i)*.24),y+Math.sin(a)*h*(.7+rand(seed+i*3)*.28)]);}poly(c,pts,color,'#63726555');line(c,[pts[1],[x-10,y+8],pts[6]],'#8f95834d',1);}
function backdrop(c,r,cam,t,s){const p=palette[r.style];gradient(c,0,0,W,H,p[0],p[1]);
 if(['ship','hangar','wreck'].includes(r.style)){
  for(let i=0;i<70;i++){const x=(rand(i+10)*W-cam*.04+W*3)%W,y=rand(i+900)*310;rect(c,x,y,1+(i%7===0),1,'#bac1b08a');}
  if(['nav','flight','dock'].includes(r.motif))planet(c,850-cam*.055,148,250);
  for(let i=-1;i<7;i++){const x=i*310-(cam*.22)%310;poly(c,[[x,28],[x+240,28],[x+282,65],[x+282,311],[x+15,311],[x,290]],'#17303b20','#61737975');line(c,[[x+15,293],[x+265,293]],'#96b1af45',3);}
  if(r.motif==='hangar'){ship(c,810-cam*.3,330,1.5);line(c,[[760-cam*.3,0],[760-cam*.3,170]],'#151e21',10);rect(c,735-cam*.3,140,51,22,'#43473c','#9c9672');}
  if(r.motif==='dock'&&!s.flags.narcissusReleased){const dx=810-cam*.3;c.save();c.translate(dx,320);poly(c,[[-177,-11],[-136,-88],[-73,-126],[49,-130],[158,-94],[196,-22],[180,2],[-178,2]],'#415052','#9ba29a');poly(c,[[-72,-116],[-50,-92],[82,-89],[48,-123]],'#0c1a22','#778e8e');for(let i=0;i<5;i++)rect(c,-120+i*54,-60,36,16,'#253b40','#a0aaa066');rect(c,-59,-52,58,46,'#17272b','#84988c');line(c,[[-146,-12],[150,-12]],'#9eaaa0',3);text(c,'NARCISSUS',32,-27,12,'#dbd4b8');c.restore();}
  if(r.zone==='samson'&&r.motif==='shuttle'){gradient(c,0,43,W,370,'#2b3f3f','#132625');for(let i=-1;i<9;i++){const xx=i*205-(cam*.3)%205;poly(c,[[xx,86],[xx+170,96],[xx+180,373],[xx-5,373]],'#32473f','#9aa69255');for(let k=0;k<9;k++)line(c,[[xx+12,125+k*24],[xx+152,125+k*24]],'#162b29',5);line(c,[[xx+17,101],[xx+151,365]],'#ae9b6270',6);line(c,[[xx+153,101],[xx+17,365]],'#ae9b6270',6);rect(c,xx+76,206,19,37,'#101f24','#c6b376');}text(c,'SAMSON / CARGO',64,182,22,'#aabdab55');}
  if(r.style==='wreck'){poly(c,[[700-cam*.2,0],[1000-cam*.2,35],[880-cam*.2,140],[1050-cam*.2,260],[650-cam*.2,337],[760-cam*.2,110]],'#03070a','#725746');glow(c,890-cam*.2,355,230,'#dd6d2720');}
 }
 if(r.style==='surface'){
  gradient(c,0,0,W,410,'#4b514b','#9c9271');planet(c,965,5,124);
  for(let k=0;k<3;k++){const pts=[[0,430]];for(let i=0;i<=15;i++)pts.push([i*100,230+k*62-rand(i+k*11)*100]);pts.push([W,430]);poly(c,pts,['#72725f','#505747','#363e34'][k]);}
  for(let i=0;i<6;i++){const x=i*320-(cam*.27)%320;rect(c,x,310,260,84,'#303e37','#85826a');rect(c,x+23,329,66,42,'#101e20','#65746b');rect(c,x+150,330,87,50,'#3b4b3c','#969879');}
 }
 if(['mine','cavern'].includes(r.style)){
  for(let layer=0;layer<3;layer++){
   const factor=[.07,.17,.29][layer];const points=[[0,0],[W,0],[W,200+layer*35]];
   for(let j=14;j>=0;j--)points.push([j*100,80+layer*50+rand(j+layer*97)*110]);
   poly(c,points,['#121d1c','#202c26','#2e3429'][layer],'#6d756533');
   for(let i=0;i<8;i++){const x=i*270-(cam*factor)%270;rock(c,x,345,180,150,layer*81+i,['#16231f','#1e2c23','#293528'][layer]);}
  }
  for(let i=0;i<8;i++){const x=i*290-(cam*.3)%290;poly(c,[[x,310],[x+20,251],[x+36,281],[x+29,316]],'#97aaa360','#bcd2ba50');}
 }
 if(['derelict','hive'].includes(r.style)){
  for(let i=-1;i<9;i++){const x=i*220-(cam*.24)%220;c.beginPath();c.moveTo(x-30,430);c.bezierCurveTo(x+10,200,x-80,73,x+90,-45);c.strokeStyle='#11181d';c.lineWidth=48;c.stroke();c.strokeStyle='#5b68655e';c.lineWidth=2;c.stroke();c.lineWidth=1;for(let j=0;j<7;j++){c.beginPath();c.moveTo(x+5+j*3,370-j*29);c.quadraticCurveTo(x+140,370-j*30,x+183,235-j*20);c.strokeStyle='#5c6c6355';c.stroke();}}
  glow(c,890-cam*.15,260,340,r.style==='hive'?'#7a99601e':'#9c87b421');
 }
 if(['medical','server','industrial'].includes(r.style)){
  for(let i=-1;i<9;i++){const x=i*200-(cam*.35)%200;gradient(c,x+4,28,185,348,r.style==='medical'?'#73827a':'#273c3a',r.style==='medical'?'#354a47':'#162729');rect(c,x+15,49,161,253,'#1b302d30','#a3aaa23e');for(let j=0;j<7;j++)line(c,[[x+26,195+j*13],[x+156,195+j*13]],'#08191d70');rect(c,x+34,68,119,14,'#c2cbb175');glow(c,x+96,91,90,'#c3e2cb13');}
 }
 // Continuous utility ceiling, scaled wall supports and clear horizontal rear edge.
 if(['surface','cavern','derelict','hive'].includes(r.style)){for(let i=0;i<12;i++){const xx=i*145-(cam*.12)%145;rock(c,xx,-12,120,50+rand(i)*26,i+420,r.style==='surface'?'#394438':'#101b1d');}}else{gradient(c,0,0,W,37,'#050a0b','#25302f');rect(c,0,37,W,6,'#6e786a');rect(c,0,44,W,3,'#111c1c');}
 if(!['surface','cavern','derelict','hive'].includes(r.style))for(let i=-1;i<7;i++){
  const x=i*300-(cam*.70)%300;poly(c,[[x,48],[x+20,48],[x+34,380],[x+2,418]],'#152321','#66766a77');rect(c,x+24,63,125,7,p[2]+'7a');glow(c,x+89,75,190,p[3]+'15');
  line(c,[[x+26,83],[x+245,83]],'#718178',8);line(c,[[x+26,81],[x+245,81]],'#9ca796',2);for(let k=0;k<4;k++)rect(c,x+45+k*50,75,6,18,'#263e3b','#95a09155');
  poly(c,[[x+38,77],[x+128,77],[x+230,420],[x-50,420]],p[3]+'05');
 }
 const organic=['derelict','hive'].includes(r.style),natural=['surface','cavern'].includes(r.style);
 if(organic){
  gradient(c,0,408,W,242,'#253532','#071112');
  for(let i=-2;i<22;i++){const xx=i*104-(cam*Z)%104;c.beginPath();c.moveTo(xx,414);c.bezierCurveTo(xx+52,474,xx-18,551,xx-81,650);c.strokeStyle='#0d1e20';c.lineWidth=22;c.stroke();c.strokeStyle='#6e89805e';c.lineWidth=2;c.stroke();c.lineWidth=1;}
  for(let i=0;i<40;i++){const xx=(rand(i+410)*W-cam*.94+W*10)%W,yy=434+rand(i+991)*172;ellipse(c,xx,yy,18+rand(i)*45,3+rand(i+73)*7,'#07171e6a','#7796821c');}
 }else if(natural){
  gradient(c,0,408,W,242,r.style==='surface'?'#4b5140':'#263729','#0c1818');
  for(let i=0;i<90;i++){const xx=(rand(i+500)*W-cam*Z+W*30)%W,yy=417+rand(i+911)*230;rock(c,xx,yy,2+rand(i)*15,1+rand(i+37)*4,i,r.style==='surface'?'#b2a47647':'#72876c3d');}
 }else{
  gradient(c,0,415,W,235,'#202a26','#080e11');line(c,[[0,415],[W,415]],'#718176',3);line(c,[[0,423],[W,423]],'#080e0f',5);
  for(let i=-1;i<16;i++){const x=i*150-(cam*Z)%150;line(c,[[x,426],[x-210,650]],'#8997841f');}
  for(let i=0;i<9;i++){const y=435+i*i*3;line(c,[[0,y],[W,y]],'#8290841f');}
  for(let i=0;i<80;i++){const x=(rand(i+500)*W-cam*.94+W*10)%W,y=430+rand(i+750)*210;rect(c,x,y,rand(i+90)*15+2,1,'#9c9d7930');}
 }
 if(['haul','ore','ascent','fall'].includes(r.motif)){for(const y of [510,545]){line(c,[[0,y],[W,y]],'#181d1b',10);line(c,[[0,y-3],[W,y-3]],'#81887a',2);}for(let i=0;i<25;i++){const x=i*75-(cam*Z)%75;rect(c,x,508,12,42,'#292e22','#686c4944');}}
 // Light falloff is restrained so navigation remains readable.
 const shade=c.createLinearGradient(0,300,0,H);shade.addColorStop(0,'#01070b00');shade.addColorStop(1,'#00060b5a');rect(c,0,300,W,350,shade);
}
function propShape(c,type,w,h,variant,active,t){
 if(detailProp(c,type,w,h,active,t,variant))return;
 const metal='#52655f',dark='#1a2929',edge='#9ba593',light='#d5c796';
 if(['crate','pallet','barrel','locker','rack','cabinet','generator','console','workbench','toolcart','bed','cryopod','medpod','cell','catbox'].includes(type)){
  if(type==='barrel'){rect(c,-w/2,-h+5,w,h-8,'#596150');ellipse(c,0,-h+5,w/2,5,'#84907a','#bec5a060');ellipse(c,0,-4,w/2,4,'#353f34');for(const y of [-h*.8,-h*.22])rect(c,-w/2-1,y,w+2,3,'#172a28','#9ba68c');rect(c,-w*.24,-h*.58,w*.48,h*.27,'#c2a25b');text(c,'!',0,-h*.37,10,'#323528','center');return;}
  if(type==='pallet'){rect(c,-w/2,-8,w,8,'#807052','#a69b72');for(let i=0;i<4;i++)rect(c,-w/2+3+i*w/4,-6,w/8,5,'#242a20');return;}
  if(type==='bed'||type==='medpod'||type==='cryopod'){
   for(const x of [-w*.36,w*.36])rect(c,x,-h*.35,4,h*.35,'#879a92');poly(c,[[-w/2,-h*.48],[w/2,-h*.48],[w/2+7,-h*.21],[-w/2+7,-h*.21]],'#26393a',edge);
   if(type==='bed'){rect(c,-w/2,-h*.62,w,h*.18,'#8c9e94','#c6c5ab');rect(c,-w*.45,-h*.75,w*.21,h*.16,'#b1bdae');}
   else {c.beginPath();c.moveTo(-w/2,-h*.45);c.bezierCurveTo(-w*.48,-h*1.2,w*.35,-h*1.13,w/2,-h*.45);c.closePath();c.fillStyle='#91b9b645';c.fill();c.strokeStyle='#afc6b5';c.stroke();poly(c,[[-w*.3,-h*.49],[-w*.2,-h*.68],[w*.25,-h*.7],[w*.32,-h*.49]],'#536660','#c1d7c15c');rect(c,w*.4,-h*.36,8,8,'#b5d1a4');}return;
  }
  if(type==='cell'){poly(c,[[-w/2,-h*.2],[-w/2,-h*.85],[-w*.32,-h],[w/2,-h*.9],[w/2,-h*.2]],'#87917a','#d7d2ad');for(let i=0;i<5;i++)rect(c,-w*.35+i*w*.14,-h*.8,w*.09,h*.54,'#23372e','#a9baa0');rect(c,-w*.2,-h*.47,w*.45,3,'#cfb65e');return;}
  if(type==='catbox'){rect(c,-w/2,-h,w,h,'#81937e','#c4cab0');rect(c,-w*.4,-h*.82,w*.65,h*.57,'#23312d');for(let i=0;i<4;i++)rect(c,-w*.32+i*w*.14,-h*.83,1,h*.58,'#bdc5af');ellipse(c,0,-h*.43,5,4,'#bc965d');poly(c,[[-4,-h*.53],[-5,-h*.7],[-1,-h*.55]],'#bc965d');poly(c,[[2,-h*.55],[5,-h*.7],[6,-h*.5]],'#bc965d');return;}
  gradient(c,-w/2,-h,w,h,metal,dark);rect(c,-w/2,-h,w,h,'#40534d66',edge);
  if(type==='crate'){for(const x of [-w*.35,w*.25])rect(c,x,-h,5,h,'#b1a77d');for(const y of [-h*.83,-h*.17])rect(c,-w/2,y,w,3,'#20382f');rect(c,-w*.15,-h*.61,w*.37,h*.24,'#b7ab79');text(c,'M',0,-h*.42,8,'#29362d','center');}
  if(type==='locker'||type==='cabinet'){rect(c,-w*.4,-h*.94,w*.8,h*.87,'#34504a','#879c8b');for(let i=0;i<5;i++)rect(c,-w*.28,-h*.84+i*3,w*.5,1,'#162926');rect(c,w*.18,-h*.53,3,8,'#e3d2a4');if(type==='cabinet'){rect(c,-w*.29,-h*.77,w*.58,h*.4,'#92b4a261');line(c,[[-w*.2,-h*.5],[w*.23,-h*.5]],'#e1d3b1');}}
  if(type==='rack'){rect(c,-w*.43,-h*.94,w*.86,h*.85,'#112b2a');for(let i=0;i<6;i++){rect(c,-w*.34,-h*.87+i*h*.13,w*.65,h*.09,'#394d48','#7e968050');rect(c,w*.2,-h*.85+i*h*.13,2,2,i%3?'#adbf8e':'#cca66d');}}
  if(type==='generator'){for(let i=0;i<5;i++){ellipse(c,-w*.28+i*w*.14,-h*.55,4,h*.29,'#697e6b','#a9b59a');}rect(c,-w/2,-h*.17,w,h*.17,'#233831');rect(c,w*.25,-h*.83,w*.14,h*.23,'#b8c6a1');}
  if(type==='console'){poly(c,[[-w/2,-h],[w*.5,-h],[w*.4,-h*.5],[-w*.5,-h*.5]],'#182d2c',edge);rect(c,-w*.35,-h*.9,w*.43,h*.24,'#8fad93');for(let i=0;i<6;i++)rect(c,-w*.34+i*w*.10,-h*.47,2,2,'#c4b180');}
  if(type==='workbench'||type==='toolcart'){rect(c,-w*.55,-h,w*1.1,4,'#a4aa86');for(let i=0;i<3;i++)rect(c,-w*.35,-h*.81+i*h*.22,w*.7,h*.15,'#233931','#829e8155');line(c,[[-w*.3,-h],[-w*.3,-h-18],[-w*.1,-h-25],[w*.1,-h-20]],'#8b9b81',2);ellipse(c,w*.1,-h-20,8,3,light);}
  return;
 }
 if(type==='terminal'){
  rect(c,-w*.18,-h*.5,w*.36,h*.5,'#344f47','#8fa995');poly(c,[[-w*.6,-h*.92],[w*.45,-h],[w*.58,-h*.48],[-w*.5,-h*.42]],'#263d38','#a0b3a0');rect(c,-w*.38,-h*.87,w*.72,h*.29,active?'#dfc87b':'#789786');for(let i=0;i<4;i++)rect(c,-w*.30,-h*.80+i*3,w*.52*(.6+rand(i)*.4),1,'#122c24');rect(c,-w*.40,-h*.52,w*.70,3,'#c2c7a0');return;
 }
 if(type==='chair'||type==='bench'){
  for(const x of [-w*.35,w*.35])rect(c,x,-h*.48,3,h*.48,'#80927e');rect(c,-w/2,-h*.53,w,5,'#455e50','#a6ad89');if(type==='chair'){rect(c,w*.29,-h,w*.16,h*.5,'#63705c','#b5b598');}return;
 }
 if(type==='pipe'||type==='cable'||type==='rail'||type==='strap'){
  line(c,[[-w/2,-h],[w/2,-h]],type==='cable'?'#455856':'#81968b',type==='pipe'?8:3);if(type==='pipe')for(let i=0;i<4;i++)rect(c,-w*.4+i*w*.24,-h-6,4,12,'#b4bca1');return;
 }
 if(type==='beam'||type==='rib'){
  if(type==='rib'){c.beginPath();c.moveTo(-9,0);c.bezierCurveTo(25,-h*.25,-28,-h*.62,15,-h);c.strokeStyle='#405248';c.lineWidth=15;c.stroke();c.strokeStyle='#98a288';c.lineWidth=2;c.stroke();c.lineWidth=1;}
  else{poly(c,[[-w*.5,0],[-w*.25,-h],[w*.3,-h],[w*.5,0]],'#605e46','#a1a184');for(let i=0;i<6;i++)rect(c,-w*.6,-h*.1-i*h*.16,w*1.2,5,'#25392f','#8f957250');}return;
 }
 if(type==='vent'){rect(c,-w/2,-h,w,h,'#1a2e2e','#94a28b');for(let i=0;i<6;i++)rect(c,-w*.4,-h*.9+i*h*.14,w*.8,2,'#536c5d');return;}
 if(type==='valve'){rect(c,-w*.11,-h,w*.22,h,'#78917a');c.beginPath();c.arc(0,-h*.7,w*.5,0,Math.PI*2);c.strokeStyle='#c0a767';c.lineWidth=3;c.stroke();line(c,[[-w*.48,-h*.7],[w*.48,-h*.7]],'#c0a767',2);line(c,[[0,-h*.7-w*.48],[0,-h*.7+w*.48]],'#c0a767',2);return;}
 if(type==='extinguisher'||type==='beacon'){rect(c,-w*.5,-h,w,h,type==='extinguisher'?'#a76c50':'#839685','#c4baa0');rect(c,-w*.5,-h*.75,w,4,'#d5cfac');if(type==='beacon'){glow(c,0,-h,40,'#eacc7940');ellipse(c,0,-h,w,4,'#e9d296');}return;}
 if(['forklift','drill','minecart','winch','pump'].includes(type)){
  for(const x of [-w*.32,w*.32]){ellipse(c,x,-9,w*.15,10,'#152b27','#839580');ellipse(c,x,-9,4,4,'#799482');}
  rect(c,-w*.45,-h*.68,w*.9,h*.46,'#6c7152','#acaa76');rect(c,-w*.34,-h*.57,w*.62,h*.27,'#2a4234','#a9ab7850');
  if(type==='minecart'){poly(c,[[-w*.5,-h*.3],[-w*.6,-h*.85],[w*.6,-h*.85],[w*.5,-h*.3]],'#64755b','#b4b994');for(let i=0;i<5;i++)rock(c,-w*.38+i*w*.18,-h*.8,w*.12,h*.18,i+variant,'#99a28b');}
  if(type==='forklift'){rect(c,w*.43,-h,w*.08,h,'#93a078');line(c,[[w*.5,0],[w*.85,0]],'#acb393',4);rect(c,-w*.35,-h*.95,4,h*.6,'#bbbc93');rect(c,-w*.40,-h,w*.75,6,'#5a6650','#b2b69a');}
  if(type==='drill'){line(c,[[0,-h*.5],[w*.4,-h*.9],[w*.75,-h*.7]],'#a2aa83',9);poly(c,[[w*.67,-h*.85],[w*.94,-h*.7],[w*.67,-h*.55]],'#949f85','#c3c9aa');}
  if(type==='winch'){ellipse(c,0,-h*.65,w*.28,h*.27,'#849178','#c0c4a0');for(let i=0;i<5;i++)line(c,[[-w*.21+i*w*.10,-h*.89],[-w*.21+i*w*.10,-h*.42]],'#334e3c',3);line(c,[[0,-h*.89],[0,-h-80]],'#90a188',3);}
  if(type==='pump'){ellipse(c,0,-h*.55,w*.28,h*.24,'#839785','#bbcab0');ellipse(c,0,-h*.55,w*.16,h*.15,'#233e36','#b1bba0');line(c,[[-w*.6,-h*.2],[-w*.6,-h*.6],[-w*.28,-h*.6]],'#9aa98c',8);line(c,[[w*.28,-h*.6],[w*.6,-h*.6],[w*.6,0]],'#758b75',8);}return;
 }
 if(['rock','ore','debris','resin','fossil','egg'].includes(type)){
  if(type==='egg'){c.beginPath();c.moveTo(-w*.42,0);c.bezierCurveTo(-w*.63,-h*.4,-w*.43,-h*.97,0,-h);c.bezierCurveTo(w*.40,-h,w*.6,-h*.42,w*.4,0);c.closePath();const g=c.createLinearGradient(-w/2,-h,w/2,0);g.addColorStop(0,'#667562');g.addColorStop(.35,'#aaa48a');g.addColorStop(.64,'#445847');g.addColorStop(1,'#253a30');c.fillStyle=g;c.fill();c.strokeStyle='#bdba9566';c.stroke();line(c,[[0,-h],[5,-h*.7],[0,-h*.35]],'#263729',2);line(c,[[-w*.3,-h*.8],[0,-h],[w*.3,-h*.8]],'#c0b18d',2);return;}
  if(type==='fossil'){
   // Fallen, long-limbed non-human remains. No named species or official reconstruction implied.
   const bone='#a5aa98',edge='#d0c6aa';
   line(c,[[-w*.4,-h*.24],[-w*.17,-h*.48],[w*.15,-h*.48],[w*.32,-h*.51]],bone,3);
   for(let i=0;i<7;i++){const x=-w*.15+i*w*.04;c.beginPath();c.moveTo(x,-h*.48);c.bezierCurveTo(x-9,-h*.72,x+16,-h*.64,x+12,-h*.26);c.strokeStyle=bone;c.lineWidth=2;c.stroke();c.lineWidth=1;}
   poly(c,[[w*.16,-h*.62],[w*.2,-h*.79],[w*.35,-h*.8],[w*.4,-h*.67],[w*.5,-h*.61],[w*.49,-h*.5],[w*.31,-h*.49]],'#89998c',edge);
   ellipse(c,w*.3,-h*.66,w*.04,h*.06,'#1a2b28');line(c,[[w*.33,-h*.48],[w*.46,-h*.45],[w*.5,-h*.49]],edge,2);
   for(let i=0;i<4;i++)rect(c,w*.38+i*w*.025,-h*.52,1,4,'#d9ceaf');
   for(const side of [-1,1]){line(c,[[w*.05,-h*.42],[w*.15+side*w*.13,-h*.1],[w*.36+side*w*.12,-h*.05]],bone,3);line(c,[[-w*.23,-h*.4],[-w*.34,-h*.18],[-w*.43,-h*.025]],bone,4);}
   for(let i=0;i<3;i++)line(c,[[w*.47,-h*.05],[w*.53+i*2,-h*.015-i*2]],edge,1);return;
  }
  if(type==='resin'){for(let i=0;i<7;i++){c.beginPath();c.moveTo(-w/2+i*w/7,0);c.bezierCurveTo(-w/2+i*w/7-15,-h*.5,w/2-i*w/7,-h*.65,0,-h);c.strokeStyle=i%2?'#7c947d':'#344d3a';c.lineWidth=4;c.stroke();}c.lineWidth=1;return;}
  rock(c,0,-h*.45,w*.5,h*.5,variant*93,type==='ore'?'#889f8d':type==='debris'?'#746d51':'#465c45');return;
 }
}
function human(c,x,y,face,walk,t,character,hurt=false,carry=false,crouch=false,hasTorch=false,signal=false,gripping=null,look=null){
 const aLook=look||DATA.appearance[character]||DATA.appearance.hoop;
 c.save();c.translate(x,y);c.scale(face*(aLook.sx||1),(crouch?.72:1)*(aLook.sy||1));
 const a=walk?Math.sin(t*(aLook.injury==='ankle'?6:9))*6:0,suit=aLook.suit,skin=aLook.skin,hair=aLook.hair;
 // Civilian coveralls, work boots and cloth pockets, not Colonial Marine armour.
 line(c,[[-6,-27],[-8+a,-13],[-8+a*.5,-3]],suit,9);line(c,[[6,-27],[8-a,-13],[10-a*.5,-3]],suit,9);
 line(c,[[-11+a*.5,-2],[0+a*.5,-2]],'#252b2b',5);line(c,[[7-a*.5,-2],[20-a*.5,-2]],'#303535',5);
 poly(c,[[-11,-52],[-14,-40],[-10,-26],[10,-26],[13,-43],[8,-53]],suit,'#c4c2ae66');
 line(c,[[0,-50],[0,-28]],'#d3c4a380',1);rect(c,-11,-35,23,3,'#515451');rect(c,-9,-47,6,7,'#00000025');rect(c,4,-47,6,7,'#00000025');
 if(gripping){line(c,[[-10,-48],[gripping.x*.35,-37],[gripping.x,gripping.y+3]],suit,6);line(c,[[9,-48],[gripping.x*.6,-40],[gripping.x,gripping.y-2]],suit,6);ellipse(c,gripping.x,gripping.y,3.4,4.4,skin);}
 else{line(c,[[-10,-48],[-16,-34],[-6,-28]],suit,6);if(signal)line(c,[[9,-48],[18,-53],[13,-63]],suit,5);else line(c,[[9,-48],[17,-37],[27,-37]],suit,6);ellipse(c,signal?13:27,signal?-63:-37,3,3,skin);}
 // Named profiles remain explicitly provisional unless a source verifies a trait.
 ellipse(c,0,-59,8,10,skin);poly(c,[[5,-63],[12,-57],[6,-54]],skin);rect(c,5,-61,2,1.6,'#252b2a');
 if(aLook.cut==='curly'){for(const [xx,yy,rr] of [[-8,-65,5],[-3,-69,5],[4,-69,5],[8,-65,4],[-10,-59,4],[-8,-54,4],[-5,-64,5]])ellipse(c,xx,yy,rr,rr,hair);}
 else if(aLook.cut==='tied'){poly(c,[[-9,-59],[-9,-66],[-3,-69],[6,-67],[9,-63],[0,-64],[-5,-59]],hair);ellipse(c,-11,-61,5,6,hair);}
 else if(aLook.cut==='balding'){line(c,[[-8,-65],[-9,-58],[-7,-54]],hair,3);line(c,[[3,-67],[7,-64]],hair,2);}
 else poly(c,[[-9,-58],[-9,-65],[-3,-68],[5,-67],[9,-63],[1,-63],[-5,-60]],hair);
 if(['kasyanov','garcia'].includes(character)){rect(c,-7,-47,6,6,'#d5dbcb');line(c,[[-4,-46],[-4,-42]],'#6b7871',1.4);line(c,[[-6,-44],[-2,-44]],'#6b7871',1.4);}
 if(aLook.injury==='arm'){poly(c,[[-10,-35],[14,-40],[9,-26]],'#cabfa9','#e3d7c0');line(c,[[-8,-51],[12,-30]],'#d8d0bb',2);}
 if(aLook.injury==='ankle'){rect(c,-12+a*.5,-13,9,7,'#cabfa9');line(c,[[-15+a*.5,-21],[-15+a*.5,-2]],'#909584',3);}
 if(aLook.injury==='head')line(c,[[-7,-63],[7,-65]],'#ddd3b8',3);
 if(hasTorch&&!carry)toolInHand(c,'torch');
 if(carry){c.save();c.translate(25,-28);propShape(c,'cell',28,21,0,false,t);c.restore();}
 if(hurt){c.globalAlpha=.16;ellipse(c,0,-36,18,32,'#e5d3a0');}c.restore();
}
function toolInHand(c,id){
 if(id==='torch'){rect(c,22,-41,24,7,'#384e4e','#c3c5ad');rect(c,41,-41,12,3,'#d6cdb3');line(c,[[27,-34],[26,-23],[13,-25]],'#98886d',2);}
 if(id==='pick'){line(c,[[16,-15],[39,-84]],'#9b805b',4);line(c,[[22,-84],[41,-88],[59,-79]],'#bdc9c2',5);rect(c,22,-41,8,7,'#baa58c');}
 if(id==='thumper'){rect(c,18,-44,29,12,'#67786b','#c4c4a4');rect(c,45,-43,22,7,'#304c52','#b1bbb4');rect(c,23,-33,7,12,'#364a48');ellipse(c,34,-38,6,6,'#ac9b73','#e1d1a3');}
 if(id==='net'){ellipse(c,30,-40,15,10,'#60757a','#c8d2c4');for(let i=-2;i<3;i++){line(c,[[19+i*4,-49],[32+i*4,-32]],'#c4c7b7',1);line(c,[[17+i*4,-33],[34+i*4,-48]],'#c4c7b7',1);}}
 if(id==='acid'){rect(c,15,-44,23,14,'#657a68','#b9cba0');rect(c,38,-41,17,5,'#9da997');rect(c,20,-30,10,11,'#65724c');line(c,[[25,-38],[30,-38]],'#dece8a',2);}
}

function alien(c,x,y,e,t){c.save();c.translate(x,y);c.scale(e.dir||1,1);
 if(e.type==='hugger'){const wig=Math.sin(t*12)*4;line(c,[[-3,-7],[-30,-8],[-46,-2],[-54,-5]],'#b9ab85',3);ellipse(c,0,-8,11,7,'#c6b48b','#efddac');for(let i=0;i<4;i++){line(c,[[-7+i*5,-7],[-15+i*10,-15-wig],[-23+i*14,0]],'#d4c79a',2);}c.restore();return;}
 const swing=Math.sin(t*6)*6,steel='#596c69';
 c.beginPath();c.moveTo(-6,-35);c.bezierCurveTo(-55,-5,-72,-35,-98,-12);c.bezierCurveTo(-75,-4,-72,2,-64,6);c.strokeStyle='#223536';c.lineWidth=7;c.stroke();c.strokeStyle='#7c918458';c.lineWidth=1;c.stroke();
 line(c,[[-8,-36],[-14-swing,-21],[-22-swing*.5,-3],[-11-swing*.5,-1]],'#243b39',7);line(c,[[8,-35],[21+swing,-21],[8+swing*.5,-3],[21+swing*.5,-1]],'#314542',8);
 poly(c,[[-12,-64],[-14,-48],[-9,-34],[6,-32],[15,-54],[7,-68]],'#182c2f',steel);
 for(let i=0;i<7;i++){line(c,[[-10,-58+i*3],[3,-55+i*3],[11,-61+i*3]],'#84938970',1);}
 for(let i=0;i<3;i++){line(c,[[-10,-59+i*7],[-24,-69+i*7],[-29,-64+i*7]],'#4b6260',4);}
 line(c,[[-9,-60],[-22,-44],[-21-swing,-28]],'#415956',5);line(c,[[10,-62],[25,-47],[35+swing,-33]],'#4b6360',5);
 for(let i=0;i<3;i++)line(c,[[35+swing,-33],[36+i*3+swing,-22+i]],'#84998b',1);
 const g=c.createLinearGradient(-28,-88,26,-68);g.addColorStop(0,'#42585a');g.addColorStop(.28,'#728984');g.addColorStop(.53,'#22363b');g.addColorStop(1,'#111f25');
 c.beginPath();c.moveTo(-35,-77);c.bezierCurveTo(-43,-102,17,-96,34,-79);c.lineTo(33,-69);c.bezierCurveTo(12,-64,-7,-69,-35,-77);c.fillStyle=g;c.fill();c.strokeStyle='#91a89a83';c.stroke();line(c,[[20,-67],[34,-65],[38,-70]],'#aebfa8',1);for(let i=0;i<5;i++)rect(c,23+i*2,-70,1,3,'#c8d0b2');c.restore();}
function door(c,p,r,cam,allowed,target,next,state){const x=(p.x-cam)*Z,y=415+(p.y-25)*.91,deep=p.y<30,s=(.91+p.y/700)*Z; c.save();c.translate(x,y);c.scale(s,s);const h=p.kind==='lift'?111:93,w=p.kind==='shuttle'?84:59;
 if(['derelict','hive','cavern'].includes(r.style)&&!doorStatus(state,p.edge).equipped){const h=105,w=76;c.beginPath();c.moveTo(-w/2,0);c.bezierCurveTo(-w/2-22,-60,-20,-h,0,-h-9);c.bezierCurveTo(32,-h,50,-34,w/2,0);c.closePath();c.fillStyle='#03090c';c.fill();c.strokeStyle='#526c65';c.lineWidth=9;c.stroke();c.lineWidth=1;for(let i=0;i<6;i++)line(c,[[-w/2-8,-12-i*12],[-w/2+2,-18-i*12]],'#9faaa15e');if(next)text(c,'PASSAGE',0,-124,9,'#e4ca8b','center');c.restore();return;}
 poly(c,[[-w/2-7,0],[-w/2-7,-h+10],[-w/2+4,-h-2],[w/2-4,-h-2],[w/2+7,-h+10],[w/2+7,0]],'#0e1f21','#789082');
 rect(c,-w/2,-h+4,w,h-4,'#1d3434','#4e7061');for(const side of [-1,1])poly(c,[[side*2,0],[side*2,-h+12],[side*(w/2-5),-h+5],[side*(w/2-5),0]],'#354b44','#79917955');
 line(c,[[0,-h+8],[0,-4]],'#08181b',3);rect(c,-w/2,-h-10,w,5,allowed?'#b7c690':'#806659');text(c,target.deck,0,-h+22,9,'#b8c5a8','center');
 if(p.kind==='lift'){for(const xx of [-w/2+9,w/2-9])line(c,[[xx,0],[xx,-h+10]],'#aebaa2',2);text(c,'↕',0,-35,18,'#d6c9a4','center');}
 rect(c,w/2+11,-h*.48,8,15,'#152a26','#647b65');rect(c,w/2+13,-h*.45,4,3,allowed?'#bad396':'#d89e67');
 const repair=p.repair?maintenanceStatus(state,p.repair):null;
 if(repair){rect(c,-w/2+2,-h*.47,w-4,11,repair.done?'#577e6e':'#b1844f','#ddc391');if(!repair.done)for(let i=0;i<5;i++)line(c,[[-w/2+3+i*10,-h*.47],[-w/2+9+i*10,-h*.47+11]],'#1b302d',3);text(c,repair.done?'SERVICE OK':'SERVICE '+repair.stage+'/3',0,-h-23,9,repair.done?'#bbd9bd':'#e3bb80','center');if(repair.stage===1)rect(c,w/2+9,-64,20,37,'#071a20','#c0a570');if(repair.stage>=2){rect(c,w/2+12,-61,5,20,'#91b9a0');rect(c,w/2+21,-61,5,20,'#bdb184');}if(state.maintenance.tracked===repair.id&&!repair.done){text(c,'◇',-w/2-18,-h,19,'#92ceca','center');}}
 const latch=doorStatus(state,p.edge);
 if(latch.equipped){
  rect(c,-w/2+2,-h*.5,w-4,8,latch.sealed?'#b48549':'#405d51','#c8b67f');
  ellipse(c,w/2+17,-h*.55,9,9,'#182e2d',latch.jammed?'#d99273':'#dbc789');
  line(c,[[w/2+11,-h*.55],[w/2+23,-h*.55]],'#d7c48c',2);
  if(latch.sealed){for(let i=0;i<4;i++)line(c,[[-w/2+4+i*13,-h*.5],[-w/2+10+i*13,-h*.5+8]],'#172325',3);text(c,Math.ceil(latch.remaining)+' s',0,-h*.7,13,'#ead196','center');}
  if(latch.strain>0){line(c,[[-w/2,-h-15],[-w/2+(w*Math.min(1,latch.strain/5.5)),-h-15]],'#f4b47d',3);text(c,'PRESSION',0,-h-27,9,'#ecc099','center');}
  if(latch.jammed>0)text(c,'VERROU HS',0,-h-15,8,'#d9a089','center');
 }
 if(next){line(c,[[-w/2,-h-18],[w/2,-h-18]],'#e4c787',2);text(c,'PASSAGE',0,-h-23,8,'#e6ca8c','center');}
 c.restore();
}
export function draw(canvas,s,options={}){
 W=Math.max(360,Math.min(1280,Math.round(canvas.width/canvas.height*H)));
 const c=canvas.getContext('2d',{alpha:false}),r=roomGeometry(s),p=s.player;
 c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);c.clearRect(0,0,W,H);
 const cam=Math.max(0,Math.min(r.width-W/Z,(options.cameraX??p.x)-W/(2*Z))),t=s.elapsed,ambientTime=s.reducedMotion?0:t;
 backdrop(c,r,cam,ambientTime,s);architecture(c,r,cam,ambientTime,s);dockingArchitecture(c,r,cam,ambientTime,s);excursionArchitecture(c,r,cam,ambientTime,s);if(s.lightsOff.includes(r.id))rect(c,0,0,W,H,'#01070b86');localDetails(c,r,cam,ambientTime,s);
 const o=currentObjective(s),path=o?route(s,o.room):[],allowed=activeEdges(s);
 for(const po of r.portals){portalStructure(c,po,r,cam);
  // po.x/po.y is the reachable approach point; the leaf is mounted at the rear wall,
  // not standing independently on that approach square in the circulation lane.
  const leaf=po.mount&&po.mount.type!=='rear-wall'?{...po,y:0}:po;
  door(c,leaf,r,cam,allowed.some(e=>e.id===po.edge),ROOM[po.target],path?.[0]?.edge===po.edge,s);
  if(po.mount&&po.mount.type!=='rear-wall'){const xx=(po.x-cam)*Z,yy=415+(po.y-25)*.91;line(c,[[xx-17,yy],[xx,yy-10],[xx+17,yy]],'#aab49b66',1.5);}
 }
 drawCombatRemains(c,s,r,cam);drawEvidence(c,s,r,cam);drawFlood(c,s,r,cam,ambientTime);drawHandlingFloor(c,s,cam);
 const objs=r.props.map(prop=>({kind:'prop',y:prop.y,obj:prop}));
 for(const npc of crewInRoom(s))objs.push({kind:'npc',y:npc.y,obj:npc});
 for(const a of DATA.interactables){if(a.room!==r.id||a.kind==='armament'&&s.chapter<a.minChapter||s.records.includes(a.id)||a.kind==='valve'&&s.disabledHazards.includes(a.hazard))continue;objs.push({kind:'activity',y:a.y-46,obj:{...a,y:a.y-46,empty:s.collected.includes(a.id)||s.maintenance.salvaged.includes(a.id)||s.gear.collected.includes(a.id)}});}

 if(o?.room===r.id&&!options.cinematic){const node=r.nodes.find(n=>n.id===o.node);objs.push({kind:'goal',y:node.y-48,obj:{...node,y:node.y-48}});}
 const recorder=s.excursion.recorder;if(recorder&&!recorder.carried&&recorder.room===r.id)objs.push({kind:'recorder',y:recorder.y,obj:recorder});
 const world=roomWorld(s);for(const e of world.enemies)objs.push({kind:'enemy',y:e.y,obj:e});
 objs.push({kind:'player',y:p.y,obj:p});
 for(const lure of s.lures.filter(l=>l.room===s.room))objs.push({kind:'decoy',y:lure.y,obj:lure});
 objs.sort((a,b)=>a.y-b.y||({prop:0,activity:1,goal:2,npc:3,enemy:4,player:5,decoy:6,recorder:7}[a.kind]-{prop:0,activity:1,goal:2,npc:3,enemy:4,player:5,decoy:6,recorder:7}[b.kind]));
 for(const ent of objs){const obj=ent.obj,x=(obj.x-cam)*Z,fy=415+(obj.y-25)*.91,scale=(.91+obj.y/700)*Z;if(x<-150||x>W+170)continue;
  c.save();c.translate(x,fy);c.scale(scale,scale);c.globalAlpha=occlusionAlpha(s,ent.kind,obj);
  if(ent.kind==='prop'){const def=PROP[obj.type];if(def.kind!=='decor')ellipse(c,2,1,def.width*.64,5,'#00080b80');if(obj.movable)cartSprite(c,s,obj,scale);else propShape(c,obj.type,def.width,def.height,obj.variant,false,t);}
  if(ent.kind==='goal'){ellipse(c,0,2,26,5,'#00080b90');const ty=({valve:'valve',carry:'cell',repair:'generator',install:'cell',release:'winch',seal:'valve',lure:'beacon'})[o.action]||(s.room==='fossils'?'fossil':s.room==='eggs'?'egg':s.room==='narcissus'?'catbox':s.room==='medical'?'medpod':'terminal');const pd=PROP[ty];propShape(c,ty,pd.width,pd.height,0,true,t);line(c,[[-19,-58],[-19,-69],[-8,-69]],'#ecd28e');line(c,[[19,-58],[19,-69],[8,-69]],'#ecd28e');text(c,'◆',0,-72,11,'#e7d39d','center');}
  if(ent.kind==='activity'){ellipse(c,0,2,18,4,'#00070b88');if(obj.kind==='armament'){armamentRack(c,obj,t);}else if(obj.kind==='excursion'){excursionSprite(c,s,obj,t);}else if(obj.kind==='light'||obj.kind==='machine'){serviceSprite(c,obj,serviceStatus(s,obj),t);}else if(obj.kind==='salvage'||obj.kind==='fabricator'){maintenanceSprite(c,obj,t);}else if(obj.kind==='archive'){rect(c,-10,-36,20,29,'#4e665d','#b6b799');rect(c,-7,-32,14,16,'#152a29','#819e84');for(let i=0;i<4;i++)rect(c,-5,-29+i*3,9-i,1,'#b1c09c');line(c,[[-5,-12],[5,-12]],'#d7c08c');}else if(obj.kind==='cache'){propShape(c,'supplyChest',43,31,0,obj.empty,t);if(!obj.empty){rect(c,-5,-27,10,9,'#d3c493');if(obj.resource==='kits'){rect(c,-1,-25,2,6,'#596d58');rect(c,-3,-23,6,2,'#596d58');}}}else if(obj.kind==='hide'){propShape(c,'hideNiche',68,106,['hive','derelict','cavern'].includes(r.style)?1:0,!!p.hidden,t);}else propShape(c,'valve',32,45,0,false,t);const close=Math.abs(obj.x-p.x)<90;if(!obj.empty&&obj.kind!=='excursion')text(c,close?'E':'·',0,obj.kind==='hide'?-116:obj.kind==='machine'?-109:obj.kind==='light'?-88:-48,close?11:13,'#d3c28e','center');else if(obj.empty&&close)text(c,'VIDE',0,-52,9,'#91a392','center');}
  if(ent.kind==='npc'){ellipse(c,0,2,22,5,'#00070baa');if(obj.pose==='rest'){c.save();c.translate(0,r.id==='narcissus'?-22:r.id==='medical'?-14:-2);patient(c,obj.character);c.restore();}else human(c,0,0,obj.dynamic?obj.face:Math.sin(obj.x)>0?1:-1,!!obj.moving,t,obj.character,false,false,obj.crouch||obj.pose==='injured',false,obj.alert>0,null,actorAppearance(s,obj.character));if(Math.abs(obj.x-p.x)<150){const name=DATA.dialogues[obj.character]?.[0]?.[0]||obj.character;text(c,name.toUpperCase()+(obj.dynamic?' · '+(obj.mode==='wait'?'ATTEND':obj.alert>0?'PRUDENCE':'SUIT'):''),0,-82,9,'#c5cbb2','center');} }
  if(ent.kind==='enemy'){ellipse(c,0,1,26,5,'#00090a88');c.save();if(obj.attack>0){c.translate(-obj.dir*9,2);c.rotate(-obj.dir*.08);}alien(c,0,0,obj,t);c.restore();if(obj.netted>0){for(let k=-3;k<4;k++){line(c,[[-29+k*8,-89],[15+k*8,-8]],'#becbbdab',1.2);line(c,[[-30+k*8,-8],[20+k*8,-89]],'#becbbdab',1.2);}text(c,'FILET',0,-112,9,'#d6ddc4','center');}if(obj.attack>0){line(c,[[-28,-105],[0,-115],[28,-105]],'#eac196',2);text(c,'!',0,-121,17,'#f4d5a0','center');}}
  if(ent.kind==='recorder'){recorderShape(c,false,t);text(c,'E · REPRENDRE',0,-49,9,'#dfd0a3','center');}
  if(ent.kind==='player'){if(p.hidden)c.globalAlpha=.27;ellipse(c,2,2,21,5,'#00070bba');let hands=null;if(s.handling.grip){const grip=s.handling.grip,cart=cartsInRoom(s).find(a=>a.id===grip.id);if(cart){const cs=(.91+cart.y/700)*Z,hx=(cart.x+grip.side*(cart.width/2+6)-cam)*Z,hy=415+(cart.y-25)*.91-43*cs;hands={x:(hx-x)/scale*p.face,y:(hy-fy)/scale};}}human(c,0,0,p.face,s.handling.grip?s.gripMoved:options.moving,t,DATA.chapters[s.chapter].actor,s.invuln>0,s.flags.cellCarried,p.crouch,s.gear.selected==='torch'&&s.flags.torchReady&&!s.flags.carryRipley&&!p.hidden&&!s.handling.grip,s.listening,hands,actorAppearance(s,DATA.chapters[s.chapter].actor));if(s.gear.selected!=='torch'&&!s.flags.carryRipley&&!s.flags.cellCarried&&!s.excursion.recorder?.carried&&!s.handling.grip){c.save();c.scale(p.face,1);toolInHand(c,s.gear.selected);c.restore();}if(s.excursion.recorder?.carried){c.save();c.translate(-p.face*13,-30);c.scale(.52,.52);recorderShape(c,true,t);c.restore();}if(floodAt(s,r.id,p.x,p.y)>.08){ellipse(c,0,3,23,4,'#98c6bf26','#bce3d644');}if(s.flags.carryRipley){c.save();c.translate(p.face*10,-29);c.scale(p.face,.9);patient(c,'ripley');c.restore();}if(s.flame>0){const lg=c.createLinearGradient(24*p.face,-37,200*p.face,-37);lg.addColorStop(0,'#f9e6a2dd');lg.addColorStop(.3,'#efa962bb');lg.addColorStop(1,'#e97e2b00');poly(c,[[34*p.face,-40],[205*p.face,-68],[185*p.face,-14],[34*p.face,-35]],lg);glow(c,98*p.face,-34,90,'#f6b45a4a');}}
  if(ent.kind==='decoy'){rect(c,-6,-7,12,7,'#8d9d7b','#ddcb9e');c.beginPath();c.ellipse(0,0,22+(Math.sin(t*4)+1)*18,5,0,0,Math.PI*2);c.strokeStyle='#d4c37a70';c.stroke();}
  c.restore();
 }
 if(s.weaponShot){const shot=s.weaponShot,y=415+(shot.y-25)*.91-46;line(c,[[(shot.x-cam)*Z,y],[(shot.end-cam)*Z,y]],shot.kind==='acid'?'#c2d992':shot.kind==='net'?'#c6d0c080':'#efd3a3',shot.kind==='acid'?5:2);}
 for(const h of activeHazards(s)){const x=(h.x-cam)*Z,y=415+(h.y-25)*.91;const active=h.active||h.warning;if(x<-140||x>W+140)continue;rect(c,x-h.width*.5,y+3,h.width,4,h.warning?'#d8bc69':'#70876c44');if(active){c.save();for(let i=0;i<(h.active?14:4);i++){const q=(ambientTime*1.4+i*.17)%1.6;glow(c,x+Math.sin(i*2.1+q)*20,y-q*105,18+q*16,h.active?'#d8e4d112':'#c7dfc008');}c.restore();if(Math.abs(h.x-p.x)<250)text(c,h.active?'PRESSION':'DÉTENTE',x,y-135,9,'#d8c995','center');}}
 const bp=nearestBulkhead(s);if(bp&&!options.menu){const d=doorStatus(s,bp.edge),xx=(bp.x-cam)*Z,yy=415+(bp.y-25)*.91-166;
 const label=d.jammed>0?'VERROU ENDOMMAGÉ · '+Math.ceil(d.jammed)+' s':d.sealed?'B / E · LIBÉRER':'B MAINTENU · VERROUILLER';
 text(c,label,Math.max(150,Math.min(W-150,xx)),yy,10,'#e5cc92','center');
 if(s.doorHold>0){const bw=96*Math.min(1,s.doorHold/(d.sealed?.35:.85));rect(c,xx-48,yy+8,96,3,'#203d36');rect(c,xx-48,yy+8,bw,3,'#edc884');}}
 // Horizontal flashlight: local visibility without painting an opaque cone over the scene.
 if(s.flash&&!p.hidden){const x=(p.x-cam)*Z,y=415+(p.y-25)*.91-48;c.save();c.globalCompositeOperation='screen';glow(c,x+p.face*85,y,180,'#c2d2a810');c.restore();}
 // Foreground never covers the full playfield or the HUD.
 gradient(c,0,601,W,49,'#07121000','#02090be0');line(c,[[0,615],[W,615]],'#73847838',3);
 for(let i=0;i<8;i++){const x=i*230-(cam*1.12)%230;if(['derelict','hive','cavern','surface'].includes(r.style)){rock(c,x,661,160,32,i+392,'#0b181b');}else{rect(c,x,624,160,24,'#081315');rect(c,x+5,626,150,2,'#49645970');}}
 const v=c.createRadialGradient(W/2,H*.54,260,W/2,H*.5,810);v.addColorStop(0,'#00000000');v.addColorStop(1,'#00040bb0');rect(c,0,0,W,H,v);
 if(['surface','mine','cavern'].includes(r.style))for(let i=0;i<30;i++){const x=(rand(i+101)*W+ambientTime*(r.style==='surface'?17:2)+W)%W,y=rand(i+121)*H;rect(c,x,y,r.style==='surface'?8:2,1,'#d7ceac2f');}
 if(s.listening&&!options.menu)drawListening(c,s);
 if(s.maintenanceHold>0&&s.maintenanceTarget){const ms=maintenanceStatus(s,s.maintenanceTarget);const bx=(p.x-cam)*Z,by=415+(p.y-25)*.91+53;rect(c,bx-52,by,104,5,'#142d2b');rect(c,bx-52,by,104*Math.min(1,s.maintenanceHold/ms.hold),5,'#a9d1bd');}
 if(s.excursionHold>0&&s.excursionTarget){const a=DATA.interactables.find(a=>a.id===s.excursionTarget);const bx=(p.x-cam)*Z,by=415+(p.y-25)*.91+49;rect(c,bx-52,by,104,6,'#132d31');rect(c,bx-52,by,104*Math.min(1,s.excursionHold/a.hold),6,'#98d4c3');}
 const gripNear=nearestCart(s);if(!options.menu&&!s.listening&&(s.handling.grip||gripNear)){const xx=Math.max(125,Math.min(W-125,(p.x-cam)*Z)),yy=415+(p.y-25)*.91+32;text(c,s.handling.grip?"X MAINTENU · DÉPLACER":"MAINTENIR X · POIGNÉE",xx,yy,11,"#e5cf9a","center");if(s.handling.grip)text(c,"RELÂCHER POUR FREINER",xx,yy+17,9,"#b6cec0","center");}
 const near=nearby(s);if(near&&!s.handling.grip&&!gripNear&&!options.menu&&!s.listening){const x=(p.x-cam)*Z,y=415+(p.y-25)*.91+27;const label=near.kind==='objective'?'MAINTENIR E':near.kind==='activity'?(near.item.kind==='excursion'?((s.excursionPressDone?'RELÂCHER E · ':'E · ')+excursionOperation(s,near.item.operation).label.toUpperCase()):near.item.kind==='hide'?(p.hidden?'E · SORTIR / MOUVEMENT':'E · SE CACHER'):'E · '+near.item.title.toUpperCase()):near.kind==='recorder'?'E · REPRENDRE L’ENREGISTREUR':near.kind==='crew'?'E · PARLER':near.item.repair&&!maintenanceStatus(s,near.item.repair).done?(s.maintenancePressDone?'RELÂCHER E':'E · '+maintenanceStatus(s,near.item.repair).label.toUpperCase()):near.locked?'PASSAGE FERMÉ':'E · '+ROOM[near.item.target].name.toUpperCase();if(s.contrast){c.font='12px monospace';const tw=Math.min(W-18,c.measureText(label).width+28);rect(c,Math.max(4,Math.min(W-tw-4,x-tw/2)),y-16,tw,24,'#061017ed','#d8c78c');}text(c,label,Math.max(120,Math.min(W-120,x)),y,s.contrast?12:10,near.locked?'#b2b09c':'#e8d4a7','center');if(s.hold>0&&['objective','activity','crew'].includes(near.kind)){rect(c,x-40,y+6,80,3,'#1b312b');rect(c,x-40,y+6,80*Math.min(1,s.hold/(near.item.hold||.35)),3,'#e6cb88');}}
 // Restrained signage occupies the architectural wall, never the gameplay floor.
 text(c,r.deck+'  /  '+r.name.toUpperCase(),34,114,13,palette[r.style][2]);text(c,r.zone==='marion'?'DSMO MARION  ·  INDUSTRIAL OPERATIONS':r.zone==='derelict'?'SIGNAL PERDU':r.zone==='mine'?'LV-178  /  CONCESSION MINIÈRE':'LV-178  /  NAVIGATION LOCALE',34,135,9,'#96a890');
}
export function fitCanvas(canvas){const b=canvas.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);const w=Math.max(1,Math.round(b.width*d)),h=Math.max(1,Math.round(b.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}

function architecture(c,r,cam,t,s){
 const px=x=>(x-cam*.42)*Z;
 if(r.id==='rec'){
  gradient(c,0,170,W,240,'#2c3832','#182724');const x=px(720);
  rect(c,x-360,215,620,22,'#6a6550','#aaa380');rect(c,x-343,246,575,106,'#132a2b','#677f72');
  for(let i=0;i<14;i++){const xx=x-320+i*37;rect(c,xx,270,12,45,'#445d51','#8b9874');rect(c,xx+3,259,6,12,'#a4976b');rect(c,xx-1,293,14,10,'#b7a876');}
  rect(c,x-355,342,635,14,'#a49b79');rect(c,x-355,356,635,38,'#233631','#789279');text(c,'BEEBEE’S',x-20,191,32,'#d3b981','center');text(c,'LAISSEZ VOS OUTILS À L’ENTRÉE',x-20,214,9,'#b2baa7','center');
  for(let i=0;i<6;i++){ellipse(c,x-240+i*87,383,18,6,'#8b7a5d','#aca583');rect(c,x-242+i*87,387,4,24,'#50685e');}
 }
 if(r.id==='medical'){
  const x=px(1280);rect(c,x-120,170,240,132,'#13262b','#b8c4b3');rect(c,x-109,180,218,99,'#071c22','#657f75');
  for(let lane=0;lane<3;lane++){const points=[];for(let i=0;i<90;i++){const xx=x-98+i*2,yy=195+lane*23+Math.sin(i*.22+t*.8)*2+((i+Math.floor(t*8))%40===0?-14:0);points.push([xx,yy]);}line(c,points,s.completed.length>=42?'#b58467':'#9fb997',1.5);}
  text(c,s.completed.length>=42?'COMMANDE PERDUE':'UNITÉ MÉDICALE / LOCAL',x-99,293,9,'#ced5bf');
  for(let i=0;i<5;i++){const xx=px(200+i*315);line(c,[[xx,150],[xx,369]],'#72928790',2);poly(c,[[xx,150],[xx+115,155],[xx+112,365],[xx,372]],'#a4b7aa19','#a1b6a759');}
 }
 if(['maintenance','engineering','pump','drain'].includes(r.id)){
  for(let i=0;i<4;i++){const x=px(280+i*590);line(c,[[x,305],[x,188],[x+200,188],[x+200,365]],'#162a2b',25);line(c,[[x,304],[x,189],[x+199,189],[x+199,364]],'#7c8b7c',12);for(const yy of [239,277,325]){rect(c,x-13,yy,26,8,'#435d52','#b2b59a');for(const xx of [x-10,x+8])rect(c,xx,yy+2,3,3,'#c4c9ac');}ellipse(c,x+98,188,23,23,'#172b2d','#9ea887');ellipse(c,x+98,188,17,17,'#a6b099');const a=-1+t*.12;line(c,[[x+98,188],[x+98+Math.cos(a)*12,188+Math.sin(a)*12]],'#253f33',2);}
  if(r.id==='drain'){for(let i=0;i<9;i++){const x=i*180-cam*.85%180;ellipse(c,x,546,110,12,'#829b9120','#9dbbb018');}text(c,'DÉCANTATION / NIVEAU BAS',36,177,12,'#c8bd8e');}
 }
 if(['fossils','alcove'].includes(r.id)){
  const x=px(1040);rock(c,x,405,245,22,240,'#243330');c.save();c.translate(x,402);c.scale(2.4,2.4);propShape(c,'fossil',170,86,0,false,t);c.restore();
  for(let i=0;i<18;i++){const xx=px(180+i*140),yy=195+Math.sin(i*1.3)*40;c.beginPath();c.moveTo(xx,yy);c.bezierCurveTo(xx+24,yy-40,xx+60,yy+50,xx+100,yy+90);c.strokeStyle='#9897a021';c.lineWidth=4;c.stroke();c.lineWidth=1;}
 }
 if(r.id==='vein'){
  const x=px(1200);poly(c,[[x-230,360],[x-112,180],[x+15,211],[x+121,101],[x+274,370]],'#50665b55','#b4c5aa60');
  for(let i=0;i<12;i++){const xx=x-130+i*31,yy=300-Math.sin(i*.7)*45;poly(c,[[xx,yy],[xx+8,yy-68],[xx+23,yy-104],[xx+33,yy-38],[xx+22,yy+8]],'#9fae955e','#e1d3a457');}
 }
 if(r.id==='bridge'&&s.completed.length>=5){for(let i=0;i<6;i++){const x=px(340+i*301);line(c,[[x,98],[x+39,160],[x+6,197],[x+89,260]],'#ababa647',2);}glow(c,px(940),260,180,'#d8955520');}
 if(r.id==='server'&&s.completed.length>=30&&!s.flags.ashPurged){const x=px(780);rect(c,x-100,170,205,85,'#07171c','#879c78');text(c,'ORDRE PRIORITAIRE',x,199,12,'#c7c49c','center');text(c,'AUTORITÉ DISTANTE',x,224,9,'#95a38d','center');}
 if(s.flags.narcissusReleased&&r.id==='dock'){const x=px(740);text(c,'COLLIER OUVERT',x,280,17,'#ccd1b0','center');}
}

// Dedicated resting pose: hands on the torso and a continuous support line.
function patient(c,character){
 const look=DATA.appearance[character]||DATA.appearance.ripley,cloth=look.suit;
 line(c,[[5,-6],[18,-5],[29,-2]],'#45594d',6);line(c,[[6,-9],[22,-8],[32,-5]],'#5e6c59',6);rect(c,28,-6,7,4,'#263d36');
 poly(c,[[-20,-9],[-13,-15],[5,-13],[12,-7],[5,-3],[-17,-3]],cloth,'#d0d0ae');
 ellipse(c,-26,-8,7,7,look.skin,'#d8c7a5');poly(c,[[-32,-10],[-31,-15],[-25,-16],[-20,-11],[-23,-10],[-26,-13]],look.hair);
 line(c,[[-14,-12],[-4,-9],[6,-10]],'#d0c5a1',4);rect(c,-7,-9,4,3,'#e0c7a3');
}

/** Functional additions: deliberately separate silhouettes rather than generic boxes. */
function detailProp(c,type,w,h,active,t,variant=0){
 if(type==='hideNiche'&&variant===1){
  c.beginPath();c.moveTo(-w*.55,0);c.bezierCurveTo(-w*.6,-h*.7,-w*.5,-h*1.2,0,-h);c.bezierCurveTo(w*.5,-h,w*.7,-h*.5,w*.55,0);c.closePath();c.fillStyle='#030b10';c.fill();c.strokeStyle='#4f6c62';c.lineWidth=9;c.stroke();c.lineWidth=1;
  for(let i=0;i<7;i++){const y=-h*.15-i*12;line(c,[[-w*.54,y],[-w*.27,y-8]],'#91a29166',2);line(c,[[w*.5,y-2],[w*.24,y-8]],'#698b7a55',2);}return true;
 }
 if(type==='hideNiche'){
  poly(c,[[-w*.55,0],[-w*.55,-h+9],[-w*.39,-h],[w*.4,-h],[w*.55,-h+9],[w*.55,0]],'#354740','#8ea392');
  gradient(c,-w*.4,-h+7,w*.8,h-7,'#02070a','#0b1a20');
  for(let i=0;i<5;i++){const x=-w*.33+i*w*.16;line(c,[[x,-h+12],[x+5,-h*.68],[x-3,-h*.3],[x,0]],'#334742',3);}
  rect(c,-w*.55,-10,w*1.1,5,'#849681');line(c,[[-w*.55,-h+5],[w*.55,-h+5]],active?'#d7cb91':'#6a8b77',3);return true;
 }
 if(type==='cableSpool'){
  ellipse(c,0,-h*.44,w*.31,h*.35,'#182a2c');for(let i=0;i<9;i++)ellipse(c,-w*.24+i*w*.06,-h*.45,w*.16,h*.38,'#263c3a','#6b8074');
  for(const x of [-w*.4,w*.4]){ellipse(c,x,-h*.47,w*.14,h*.45,'#827953','#b6a97c');ellipse(c,x,-h*.47,w*.04,5,'#253d33');}
  line(c,[[w*.38,-h*.23],[w*.52,-2],[w*.7,0]],'#9f9b73',2);return true;
 }
 if(type==='sampleRack'){
  for(const x of [-w*.49,w*.45])rect(c,x,-h,4,h,'#879789','#bfd0b3');
  for(let k=0;k<3;k++){const y=-h+14+k*22;rect(c,-w/2,y,w,4,'#afb697');for(let i=0;i<4;i++){rect(c,-w*.4+i*w*.23,y-16,9,15,'#314c45','#a4b4a0');poly(c,[[-w*.39+i*w*.23,y-3],[-w*.36+i*w*.23,y-13],[-w*.30+i*w*.23,y-5]],'#b5bea173');}}
  return true;
 }
 if(type==='bioTendrils'){
  for(let i=0;i<8;i++){const x=(i-3.5)*w/8;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+w*.35,-h*.23,x-w*.43,-h*.57,x*.65,-h+Math.abs(i-4)*6);c.strokeStyle=i%2?'#233834':'#4a6154';c.lineWidth=7;c.stroke();c.strokeStyle='#b2bda14c';c.lineWidth=1;c.stroke();}
  for(let i=0;i<4;i++)ellipse(c,-w*.24+i*w*.15,-h*.42-i*5,4,11,'#71847060');return true;
 }
 if(type==='serviceHatch'){
  rect(c,-w/2,-h,w,h,'#243a36','#91a392');rect(c,-w*.43,-h*.92,w*.86,h*.83,'#162b2c','#6f8f7e');
  for(let i=0;i<8;i++)rect(c,-w*.35,-h*.83+i*7,w*.7,2,'#658175');
  for(const x of [-w*.44,w*.42])for(const y of [-h+4,-5])rect(c,x,y,3,3,'#c5cbb0');rect(c,w*.23,-25,4,13,'#aab797');return true;
 }
 if(type==='supplyChest'){
  poly(c,[[-w*.5,0],[-w*.5,-h*.65],[w*.5,-h*.65],[w*.5,0]],'#57715b','#b9c2a0');
  rect(c,-w*.41,-h*.56,w*.82,h*.41,'#102829');
  if(active){poly(c,[[-w*.5,-h*.65],[-w*.47,-h*1.52],[w*.48,-h*1.5],[w*.5,-h*.65]],'#344e42','#b8bb92');line(c,[[-w*.38,-h*1.39],[w*.36,-h*1.37]],'#829c7b',2);}
  else{rect(c,-w*.5,-h,w,h*.4,'#899473','#cfcb99');rect(c,-4,-h*.73,8,12,'#34493e','#c8c5a0');}
  for(const x of [-w*.4,w*.35])rect(c,x,-h*.5,3,h*.38,'#a0ac84');return true;
 }
 if(type==='portableLamp'){
  for(const x of [-w*.45,w*.45])line(c,[[0,-h*.43],[x,0]],'#9aa991',3);
  line(c,[[0,0],[0,-h]],'#a3b4a0',3);rect(c,-w*.43,-h-10,w*.86,19,'#293f39','#b5c4a6');rect(c,-w*.35,-h-7,w*.7,12,'#e7d8a8');return true;
 }
 return false;
}
function localDetails(c,r,cam,t,s){
 const organic=['derelict','hive','cavern'].includes(r.style),surface=r.style==='surface';
 for(const light of r.lighting?.pools||[]){
  const x=(light.x-cam)*Z,y=415+(light.y-25)*.91;
  if(s.lightsOff.includes(r.id)){rect(c,x-21,180,42,4,'#526456');rect(c,x-17,181,8,2,'#b39c64');continue;}
  if(x<-light.radius||x>W+light.radius)continue;
  if(!organic&&!surface){
   rect(c,x-42,168,84,14,'#243e37','#afbc9f');rect(c,x-35,171,70,7,'#e4d5a3');
   poly(c,[[x-33,184],[x+33,184],[x+light.radius*.55,y+20],[x-light.radius*.55,y+20]],'#d7d39d07');
  }
  glow(c,x,y-70,light.radius*.62,organic?'#9eafa812':'#e2d5a616');ellipse(c,x,y,light.radius*.62,33,organic?'#6f918009':'#dac78a0a');
 }
 if(!organic&&!surface){
  for(let i=0;i<Math.ceil(r.width/380);i++){
   const x=(i*380+100-cam)*Z;if(x<-100||x>W+100)continue;
   line(c,[[x,43],[x,142]],'#172c29',4);rect(c,x-11,138,22,14,'#466459','#9eae8b');
   for(let k=0;k<7;k++)rect(c,x-44+k*14,395,8,5,'#b6a05f50');
   text(c,String(i+1).padStart(2,'0'),x,375,9,'#8faaa168','center');
   if(['engineering','workshop','maintenance'].includes(r.id))for(let k=0;k<3;k++)line(c,[[x-160,211+k*9],[x+149,211+k*9]],k%2?'#96745375':'#61846d70',2);
  }
 }
 // Sealed/powered objectives leave a small, persistent physical indication.
 const done=new Set(s.completed);
 for(const n of r.nodes){if(!DATA.chapters.some(ch=>ch.objectives.some(o=>o.room===r.id&&o.node===n.id&&done.has(o.id))))continue;const x=(n.x-cam)*Z,y=415+(n.y-25)*.91-54;if(x<0||x>W)continue;rect(c,x-8,y,16,7,'#263e32','#738e71');rect(c,x-5,y+2,10,3,'#a8c78d');}
 if(s.contrast){const p=s.player,x=(p.x-cam)*Z,y=415+(p.y-25)*.91;c.beginPath();c.ellipse(x,y+3,20,5,0,0,Math.PI*2);c.strokeStyle='#e8d498';c.lineWidth=2;c.stroke();c.lineWidth=1;}
}

function serviceSprite(c,a,status,t){
 if(a.kind==='light'){
  line(c,[[0,0],[0,-75]],'#647b6b',5);rect(c,-27,-77,54,56,'#29453e','#b2b998');rect(c,-21,-70,42,14,'#0a211f','#80967e');
  for(let i=0;i<3;i++)rect(c,-16+i*13,-66,7,5,status.active?'#c8d795':'#8b7558');
  line(c,[[-13,-38],[12,-48]],status.active?'#e3c997':'#74877c',6);text(c,'LUX',0,-28,8,'#d7c89d','center');text(c,status.active?'RAMPES':'SECOURS',0,-96,8,'#c9c8a0','center');
 }else{
  ellipse(c,0,1,43,6,'#071718');rect(c,-41,-54,82,49,'#394e43','#9fa984');rect(c,-35,-47,70,35,'#112b2b','#799578');
  for(const x of [-21,21]){ellipse(c,x,-30,14,14,'#263e38','#8da28a');for(let k=0;k<4;k++){const angle=k*Math.PI/2+(status.active?t*6:0);line(c,[[x,-30],[x+Math.cos(angle)*12,-30+Math.sin(angle)*12]],'#9caa83',4);}}
  rect(c,-34,-71,68,15,'#9a976d','#d1c496');text(c,status.active?'EN CYCLE':'ESSAI',0,-60,9,'#1c3430','center');
  for(const x of [-37,33])rect(c,x,-7,7,7,'#829179');line(c,[[32,-59],[57,-64],[58,-89]],'#668774',5);
  if(status.active){c.beginPath();c.ellipse(0,-22,56+Math.sin(t*5)*5,42,0,0,Math.PI*2);c.strokeStyle='#d1bd7355';c.stroke();}
  text(c,status.label,0,-98,8,'#d5c999','center');
 }
}


function drawEvidence(c,s,r,cam){
 for(const q of s.residue[r.id]||[]){
  const x=(q.x-cam)*Z,y=415+(q.y-25)*.91,scale=(.91+q.y/700)*Z;
  if(x<-100||x>W+100)continue;c.save();c.translate(x,y);c.scale(scale,scale);
  if(q.kind==='scorch'){
   ellipse(c,0,1,38,9,'#01050799');
   for(let i=0;i<14;i++){const dx=(rand(i+q.x)-.5)*74,dy=(rand(i+q.y)-.5)*12;line(c,[[dx,dy],[dx+7,dy+2]],i%3?'#111816cc':'#89816b55',1);}
  }else if(q.kind==='decoy'){
   ellipse(c,0,2,12,3,'#02070bbc');poly(c,[[-7,0],[-4,-7],[6,-6],[8,0]],'#5b6358','#9da18a');
   line(c,[[-4,-5],[4,-5]],'#383e38',2);line(c,[[6,-3],[15,-9],[21,-7]],'#73766b',1);
  }else{
   for(let i=0;i<4;i++)line(c,[[-13+i*9,-82+i*3],[-20+i*10,-43+i*2],[-17+i*10,-28]],'#c9c2a399',1.6);
   for(let i=0;i<5;i++)poly(c,[[-20+i*10,3],[-17+i*10,-2],[-14+i*10,2]],'#7b8171');
  }c.restore();
 }
}
function drawListening(c,s){
 const report=listenReport(s),width=Math.min(340,W-36),x=(W-width)/2,y=184;
 rect(c,x,y,width,report.signals.length?105:86,'#07151ced','#9da786');
 text(c,'ÉCOUTE / MAINTENIR V',x+17,y+21,10,'#d9cfa9');
 const strength=report.masked?.4:Math.max(.05,...report.signals.map(q=>q.strength));
 for(let i=0;i<22;i++){const h=(s.reducedMotion?8:4+Math.abs(Math.sin(s.elapsed*3+i*.8))*20)*strength;rect(c,x+16+i*(width-32)/22,y+43-h,3,h,'#a8c0a799');}
 if(report.signals.length){report.signals.slice(0,2).forEach((q,i)=>text(c,(q.direction==='gauche'?'← ':q.direction==='droite'?'→ ':'↔ ')+q.label.toUpperCase(),x+17,y+66+i*20,10,'#dad6b6'));}
 else {const label=report.masked?'LE MOTEUR MASQUE LES PAS':'AUCUN BRUIT DISTINCT';text(c,label,x+17,y+66,10,'#b8c7b1');}
}

/** Interactive foreground objects fade on projected overlap, not only generic props. */
export function occlusionAlpha(s,kind,obj){
 if(!['prop','activity','goal'].includes(kind)||obj.y<=s.player.y)return 1;
 if(kind==='activity'&&obj.kind==='hide'&&s.player.hidden===obj.id)return 1;
 const widths={light:54,machine:82,hide:68,cache:43,archive:20,valve:32};
 const width=kind==='prop'?(PROP[obj.type]?.width||50):kind==='activity'?(widths[obj.kind]||54):90;
 if(Math.abs(obj.x-s.player.x)>width*.6+18)return 1;
 if((obj.y-s.player.y)*.91>125)return 1;
 return .3;
}

function maintenanceSprite(c,a,t){
 if(a.kind==='salvage'){
  rect(c,-26,-39,52,37,'#4a5449','#b6a779');rect(c,-22,-29,44,21,'#243a37','#758778');
  if(a.empty){poly(c,[[-27,-40],[-20,-66],[27,-59],[26,-39]],'#33483f','#b6aa80');rect(c,-18,-27,36,12,'#0b1e20');}
  else{rect(c,-29,-45,58,11,'#8c7750','#d1bb83');for(let i=0;i<3;i++){rect(c,-17+i*13,-30,9,20,'#b4b9a1','#d7d4b0');line(c,[[-14+i*13,-26],[-14+i*13,-14]],'#38504b',2);}}
  text(c,'M / 03',0,-7,8,'#dbd3b2','center');
 }else{
  rect(c,-47,-42,94,9,'#748475','#c8c3a3');for(const x of [-39,32])rect(c,x,-33,7,34,'#455e56','#9ea38e');
  rect(c,-42,-83,84,40,'#253f3c','#859b8a');for(let i=0;i<7;i++)for(let j=0;j<3;j++)rect(c,-35+i*10,-74+j*8,2,2,'#8a9c84');
  rect(c,10,-67,23,20,'#071e22','#b0b492');for(let i=0;i<4;i++)rect(c,13,-62+i*3,11-i*2,1,'#95c3a3');
  rect(c,-27,-51,21,7,'#b3ae85','#ddd1a0');line(c,[[-26,-65],[-18,-54]],'#c9c4a4',3);ellipse(c,-28,-65,4,4,'#394f43','#cfc391');
  text(c,'RÉASSEMBLAGE',0,-92,8,'#ccbd89','center');
 }
}


// Original V0.7 room silhouettes, all drawn live at the same camera scale.
function excursionArchitecture(c,r,cam,t,s){
 if(!DATA.excursion.rooms.includes(r.id))return;
 const px=x=>(x-cam*.44)*Z,st=excursionStatus(s);
 if(r.id==='return_gallery'){
  for(let i=0;i<5;i++){const x=px(80+i*420);line(c,[[x,388],[x,173],[x+250,173],[x+300,235]],'#09191d',33);line(c,[[x,388],[x,173],[x+250,173],[x+300,235]],'#51665b',20);line(c,[[x+5,376],[x+5,180],[x+238,180]],'#b3b7a260',3);rect(c,x-21,267,42,12,'#384d48','#819587');}
  const cut=px(1470);if(!s.excursion.done.includes('isolate'))for(let i=0;i<12;i++){const yy=280+((t*87+i*14)%123);line(c,[[cut-10+Math.sin(i*2)*17,yy],[cut-12+Math.sin(i*2)*17,yy+22]],'#b7d9cf55',2);}
  text(c,'RETOUR / CONDUITE 04',px(350),228,16,'#bdc6ad');text(c,'BANDE HAUTE →',px(800),340,12,'#b9c8a4');
 }
 if(r.id==='exchanger'){
  for(let i=0;i<3;i++){const x=px(280+i*590);rect(c,x-114,155,220,242,'#14292d','#76968b');ellipse(c,x-4,156,110,27,'#49695f','#8fa996');ellipse(c,x-4,396,110,19,'#142b2d','#829e8b');for(let k=0;k<12;k++)line(c,[[x-83,181+k*17],[x+78,181+k*17]],'#8da8973b',4);rect(c,x-32,185,56,119,'#081a20','#839b8b');rect(c,x-26,193,44,103*(1-st.water),'#95c4b278');text(c,'HX / '+(i+1),x-4,331,20,'#c8ccb0','center');}
  const x=px(1220);rect(c,x-103,45,212,73,'#081a22','#6b9587');text(c,st.drained?'NIVEAU BAS':st.pumping?'POMPAGE ACTIF':'NIVEAU HAUT',x,74,15,'#cecea5','center');text(c,st.pumping?Math.ceil(st.remaining)+' s / CYCLE LOCAL':st.drained?'TRAVERSE LIBÉRÉE':'COMMANDES SUR PLACE',x,98,10,'#98baad','center');
 }
 if(r.id==='survey'){
  for(let i=0;i<4;i++){const x=px(220+i*340);rect(c,x-98,155,197,125,'#0c1c26','#7a9e8c');rect(c,x-86,165,173,99,'#092321');for(let j=0;j<6;j++)line(c,[[x-75,182+j*12],[x+72,182+j*12]],'#577f6740');const linepts=[];for(let j=0;j<50;j++)linepts.push([x-73+j*3,216+Math.sin(j*.3+i)*13+Math.cos(j*.8)*5]);line(c,linepts,st.stage>=7?'#b8d2aa':'#728e8a',1.5);text(c,['NIVEAU / RETOUR','ÉCHANGEURS','MÉMOIRE LOCALE','RÉSEAU ISOLÉ'][i],x,300,11,'#bdc7a5','center');}
  text(c,'POSTE DE RELEVÉ / PAS DE LIAISON EXTERNE',px(300),353,12,'#809e8b');
 }
 if(r.id==='specimen_store'){
  for(let i=0;i<5;i++){const x=px(220+i*350);rect(c,x-70,160,140,230,'#213636','#8b9d8d');rect(c,x-60,173,120,200,'#092225','#719485');for(let k=0;k<3;k++){rect(c,x-61,220+k*65,121,5,'#97a58b');for(let j=0;j<5;j++){const xx=x-48+j*22;rect(c,xx,180+k*65,13,35,'#54796a4d','#8da79577');poly(c,[[xx+2,212+k*65],[xx+4,187+k*65],[xx+10,196+k*65],[xx+10,212+k*65]],'#a4aa8170');}}text(c,'CAROTTES '+(i+1),x,405,10,'#b6bd9e','center');}
 }
}
function drawFlood(c,s,r,cam,t){
 const f=DATA.excursion.floods.find(f=>f.room===r.id);if(!f)return;const st=excursionStatus(s),left=(f.left-cam)*Z,right=(f.right-cam)*Z,top=415+(f.front-25)*.91;
 rect(c,left,top,right-left,72,'#061c21aa');line(c,[[left,top],[right,top]],'#829d8966',3);
 const alpha=st.water;rect(c,left,top+5,(right-left),65,'#446f712e');
 if(alpha>.015){c.save();c.beginPath();c.rect(left,top+3,right-left,63);c.clip();c.globalAlpha=.4+alpha*.6;for(let i=0;i<18;i++){const xx=left+i*130+Math.sin(t+i)*17,yy=top+11+(i%4)*13;line(c,[[xx,yy],[xx+85,yy+Math.sin(t*.7+i)*2]],'#bad7c65b',1);line(c,[[xx+19,yy+3],[xx+63,yy+4]],'#6c9b9566',2);}c.restore();}
 else for(let i=0;i<12;i++)ellipse(c,left+50+i*154,top+35+(i%2)*12,33,4,'#759f9530');
 text(c,st.drained?'CANIVEAU VIDÉ':'EAU '+Math.round(alpha*100)+' % · PASSERELLE AU FOND',Math.max(150,Math.min(W-160,(left+right)/2)),top+85,10,'#a8c5b7','center');
}
function recorderShape(c,carried,t){
 rect(c,-22,-31,44,30,'#9a9878','#c9c6a0');rect(c,-18,-27,36,19,'#29453f','#91aa94');rect(c,-12,-22,13,9,'#122e30');rect(c,4,-21,8,3,'#c6cba0');for(const x of [-18,16])rect(c,x,-29,3,27,'#526958');line(c,[[-11,-32],[-11,-39],[11,-39],[11,-32]],'#a9b79e',3);if(carried)line(c,[[-23,-32],[19,-2]],'#27372b',3);
}
function excursionSprite(c,s,a,t){
 const done=s.excursion.done.includes(a.operation),status=excursionOperation(s,a.operation),op=DATA.excursion.ops.find(o=>o.id===a.operation),st=excursionStatus(s);
 if(op.visual==='valve'){line(c,[[0,1],[0,-51]],'#79978b',9);ellipse(c,0,-43,23,23,'#142b2c',done?'#9fc7a6':'#d6a676');const angle=done?Math.PI/4:0;for(let k=0;k<4;k++){const z=angle+k*Math.PI/2;line(c,[[0,-43],[Math.cos(z)*20,-43+Math.sin(z)*20]],done?'#9dc6a5':'#d6a676',3);}rect(c,-15,-6,30,7,'#416353');}
 else if(op.visual==='cabinet'){rect(c,-28,-69,56,70,'#405d53','#b4c2a0');rect(c,-23,-64,46,53,'#102b2c','#869f89');if(done)poly(c,[[26,-65],[43,-59],[43,-6],[26,-10]],'#799484','#bbc5a2');else{rect(c,-20,-37,40,7,'#b29463');text(c,'SEC',0,-48,10,'#d7c295','center');}}
 else if(op.visual==='recorder'){rect(c,-32,-8,64,8,'#456555','#bac7a3');if(!done)recorderShape(c,false,t);else text(c,'VIDE',0,-17,9,'#9bab8d','center');}
 else{rect(c,-28,-53,56,52,'#3a594e','#a9b99b');rect(c,-21,-46,42,24,'#0b272c','#779c82');if(op.visual==='reader'&&st.stage>=6){c.save();c.translate(0,-51);c.scale(.65,.65);recorderShape(c,false,t);c.restore();}else{text(c,op.visual==='pump'?(st.drained?'SEC':st.pumping?Math.ceil(st.remaining)+' s':'STOP'):done?'OK':'LOCAL',0,-30,10,'#b6cba3','center');}rect(c,13,-13,6,5,done?'#aacc9c':'#c6a46d');}
 if(status.ok){text(c,'◇',0,-91,13,'#d9c389','center');}else if(done)text(c,'✓',0,-81,12,'#adccb1','center');
}


/** V0.8: original staged vignettes, using a detached state and the game renderer. */
export function drawSequence(canvas,stage,sequence,index,seconds){
 const shot=sequence.shots[index],t=Math.min(16,Math.max(0,seconds));stage.elapsed=t;
 const pan=stage.reducedMotion?0:Math.sin(t*.12)*42;
 draw(canvas,stage,{menu:true,cinematic:true,cameraX:shot.x+pan});
 const c=canvas.getContext('2d'),w=W,h=H,fx=sequence.effect;
 c.save();c.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
 if(['establish','flight','release','signal'].includes(fx)&&index!==1){
  gradient(c,0,0,w,h,'#040a10','#182c34');
  for(let i=0;i<95;i++){const x=rand(i+82)*w,y=rand(i+351)*h;rect(c,x,y,i%9?1:2,1,'#bacfc06b');}
  planet(c,w*.76,h*.43,230);
  if(fx==='flight'){ship(c,w*.42+pan,h*.51,1.05);for(let i=0;i<8;i++){const y=90+i*50;line(c,[[0,y],[w,y+90]],'#a5bcb416',22);}}
  else if(fx==='release'){
   const away=stage.reducedMotion?35:Math.min(130,t*9),sx=w*.63+away;
   rect(c,-10,h*.3,w*.37,h*.24,'#172d34','#718a8d');rect(c,w*.34,h*.38,52,40,'#55706c','#b4b8a2');
   c.save();c.translate(sx,h*.48-away*.28);c.scale(.6-away*.001,.6-away*.001);
   poly(c,[[-177,-11],[-136,-88],[-73,-126],[49,-130],[158,-94],[196,-22],[180,2],[-178,2]],'#415052','#b1bba6');
   poly(c,[[-72,-116],[-50,-92],[82,-89],[48,-123]],'#0c1a22','#778e8e');text(c,'NARCISSUS',0,-34,17,'#d5d0b4','center');c.restore();
  }else{
   const x=w*.43,y=h*.49;marionHull(c,x+pan,y,.92);
  }
 }
 // Instruments and damage cues are restrained: no flashing white frames.
 if(fx==='impact'||fx==='blast'){
  gradient(c,0,0,w,h,'#240c051c','#22120969');
  for(let i=0;i<22;i++){const a=rand(i+19),x=a*w,y=(rand(i+11)*330+t*(8+i%6))%430;poly(c,[[x,y],[x+7,y+3],[x+2,y+10]],'#bc8b604a');}
  line(c,[[w*.12,90],[w*.19,170],[w*.17,275],[w*.32,354]],'#03090ac7',18);
 }
 if(fx==='lift'||fx==='loss'){
  for(let i=0;i<9;i++){const x=70+i*w/9;line(c,[[x,65],[x,h-100]],'#152a2ec4',12);}
  const sy=stage.reducedMotion?180:140+(t*22)%210;line(c,[[0,sy],[w,sy]],'#a0a69148',9);
 }
 if(fx==='purge'||fx==='signal'){
  const xx=w*.51,yy=150;rect(c,xx,yy,w*.35,193,'#031216e6','#6b958b');
  text(c,fx==='purge'?'ISOLATION / COMMANDE LOCALE':'ÉMISSION / PORTEUSE LOCALE',xx+18,yy+27,12,'#b3cbb6');
  for(let i=0;i<5;i++){const count=fx==='purge'?Math.max(0,12-Math.floor(t*.8)-i):3+i;rect(c,xx+19,yy+49+i*23,count*12,4,i%2?'#8bad97':'#d0bb80');}
  text(c,fx==='purge'?'COPIE DISTANTE : AUCUNE':'RÉPONSE CONFIRMÉE : AUCUNE',xx+18,yy+171,10,'#c9c4a2');
 }
 if(fx==='medical'){rect(c,w*.04,86,5,300,'#b89a7266');text(c,'ALIMENTATION LOCALE',w*.08,168,12,'#c2c7b2');text(c,'COMMANDE LOCALE PERDUE',w*.08,192,10,'#adad96');}
 // Letterbox and compositional markers. The caption is accessible DOM text below.
 gradient(c,0,0,w,110,'#02080de8','#02080d00');gradient(c,0,h-150,w,150,'#02080d00','#02080df0');
 rect(c,0,0,w,48,'#030a0ee6');rect(c,0,h-40,w,40,'#030a0ee6');
 text(c,'ARCHIVES DU MARION',30,29,10,'#b5c1b3');text(c,'MISE EN SCÈNE · '+String(index+1).padStart(2,'0'),w-30,29,10,'#caba95','right');
 c.restore();
}


function marionHull(c,x,y,scale){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const box=(x,y,w,h,d=16)=>{poly(c,[[x,y],[x+d,y-d],[x+w+d,y-d],[x+w,y]],'#81918b','#b7b7a277');rect(c,x,y,w,h,'#3f535c','#869b97');poly(c,[[x+w,y],[x+w+d,y-d],[x+w+d,y+h-d],[x+w,y+h]],'#233b47','#6d8585');};
 // Broad transport spine, modular holds, radiators and a stepped command block.
 poly(c,[[-349,-14],[-292,-54],[244,-54],[352,-11],[288,57],[-309,57]],'#243b49','#7d9899');
 poly(c,[[-349,-14],[-290,-41],[287,-39],[352,-11],[300,5],[-313,5]],'#687e7e','#b7beb277');
 rect(c,-291,1,592,24,'#1b303d','#607c7d');
 for(let i=0;i<6;i++){const xx=-257+i*86;box(xx,-72,69,105,17);rect(c,xx+8,-56,53,54,'#263d47','#78948d77');for(let k=0;k<4;k++)line(c,[[xx+12,-45+k*11],[xx+56,-45+k*11]],'#64807866',2);rect(c,xx+8,8,54,6,'#a5aa81');line(c,[[xx+35,-66],[xx+35,29]],'#112833',3);for(const py of [-64,23])for(const px of [xx+4,xx+62])rect(c,px,py,3,3,'#b7b99c');}
 box(-75,-114,152,24,20);box(-41,-159,85,46,18);poly(c,[[-32,-145],[34,-145],[42,-128],[-36,-128]],'#0c2735','#9aafa8');for(let i=0;i<6;i++)line(c,[[-28+i*12,-142],[-30+i*12,-129]],'#738f8e',1);
 line(c,[[-4,-160],[-4,-213]],'#819794',3);line(c,[[-45,-177],[30,-177]],'#859c96',2);ellipse(c,-3,-205,9,3,'#a4b2a0');
 for(const yy of [38,77]){box(185,yy,95,25,8);for(let i=0;i<8;i++)line(c,[[193+i*10,yy+4],[193+i*10,yy+20]],'#132c3b',3);}
 box(-339,-27,58,47,9);for(const xx of [-333,-316,-299]){ellipse(c,xx,22,7,5,'#192e3c','#829a98');ellipse(c,xx,23,4,2,'#a6c9c254');}
 poly(c,[[298,-24],[377,-2],[373,12],[300,37]],'#506977','#abc0b1');rect(c,311,2,39,4,'#b7c6a052');
 for(let i=0;i<11;i++)line(c,[[-282+i*54,48],[-261+i*54,71],[-235+i*54,48]],'#628088',3);
 text(c,'DSMO / MARION',-140,98,15,'#c1c9b4');text(c,'ORE TRANSPORT · INDUSTRIAL SYSTEMS',-140,116,9,'#8ca99f');c.restore();
}


function cartSprite(c,s,obj,scale){
 const def=PROP[obj.type],w=def.width*Z/scale,h=def.height,gripped=s.handling.grip?.id===obj.movable;
 const phase=gripped&&s.gripMoved?s.handling.travelled/8:0;
 for(const x of [-w*.34,w*.34]){ellipse(c,x,-5,7,8,'#101c20','#748983');line(c,[[x+Math.cos(phase)*5,-5+Math.sin(phase)*5],[x-Math.cos(phase)*5,-5-Math.sin(phase)*5]],'#c3b187',1.5);}
 rect(c,-w/2,-14,w,7,'#475a56','#94a69a');
 if(obj.type==='oreTrolley'){
  poly(c,[[-w/2,-17],[-w/2-3,-h+13],[w/2+3,-h+13],[w/2,-17]],'#374c4a','#9dac9a');
  poly(c,[[-w/2-3,-h+13],[-w/2+7,-h],[w/2-3,-h],[w/2+3,-h+13]],'#1b2c2f','#82988c');
  for(let i=0;i<5;i++)rock(c,-w*.31+i*w*.15,-h+5,10,6,80+i,'#6f7f71');
  for(let i=0;i<4;i++)line(c,[[-w*.4+i*w*.26,-h+18],[-w*.4+i*w*.26,-23]],'#7e928a',3);
 }else{
  rect(c,-w/2,-h+6,w,h-21,'#385349','#a5b099');
  for(let i=0;i<3;i++){rect(c,-w/2+5,-h+10+i*11,w-10,9,'#263e3b','#769086');rect(c,-8,-h+12+i*11,16,2,'#c4ba91');}
  rect(c,-w/2-4,-h+2,w+8,5,'#a0a895','#d0ccb0');
  rect(c,-w*.25,-h-8,13,10,'#526d62','#adbbab');line(c,[[4,-h],[20,-h-4]],'#b0b59c',3);
 }
 const hw=6*Z/scale;for(const side of [-1,1]){line(c,[[side*w/2,-28],[side*(w/2+hw),-36],[side*(w/2+hw),-47],[side*(w/2-2),-47]],'#c6c4a5',3);}
 rect(c,w*.31,-18,9,4,gripped?'#8fc2ac':'#d9b47e');
 text(c,gripped?'LIBRE':'FREIN',0,-23,7,gripped?'#c0e1c6':'#dcc195','center');
 if(Math.abs(obj.x-s.player.x)<160)text(c,'X',0,-h-19,10,'#e3cb91','center');
}
function drawHandlingFloor(c,s,cam){
 for(const a of cartsInRoom(s)){
  const x=(a.bay.left-a.width/2-cam)*Z,xx=(a.bay.right+a.width/2-cam)*Z,y=415+(a.bay.back-43)*.91,yy=415+(a.bay.front-7)*.91;
  c.save();c.setLineDash([12,8]);c.strokeStyle='#c9b68055';c.lineWidth=1;c.strokeRect(x,y,xx-x,yy-y);c.setLineDash([]);
  for(const fx of [x,xx])for(const fy of [y,yy]){rect(c,fx-3,fy-2,6,5,'#c5ac796b');}
  text(c,'MANUTENTION',x+7,yy+12,8,'#c1b48c80');c.restore();
 }
}


function portalStructure(c,p,r,cam){
 const mount=p.mount;if(!mount)return;
 const X=x=>(x-cam)*Z,Y=y=>415+(y-25)*.91,front=Y(p.y),back=Y(0),left=X(p.x-70),right=X(p.x+70),height=125;
 if(right<-180||left>W+180)return;
 c.save();
 if(mount.type==='rear-wall'){
  // Same surface as the rear wall: lintel and jamb extensions, not an isolated frame.
  if(mount.organic){line(c,[[left,front+4],[left-18,front-height],[right+8,front-height-17],[right,front+4]],'#4d6263',13);}
  else{rect(c,left,front-height-12,right-left,12,'#425b62','#80918b');rect(c,left-12,front-height,14,height,'#2e484e');rect(c,right,front-height,14,height,'#2e484e');}
 }else{
  for(const side of [-1,1]){
   const xx=X(p.x+side*64),ww=12*Z,fy=Y(p.y-28);
   poly(c,[[xx-ww/2,back],[xx+ww/2,back],[xx+ww/2,fy],[xx-ww/2,fy]],'#111e22','#6f8b8555');
   if(mount.organic){poly(c,[[xx,fy],[xx-side*10,fy-height],[xx-side*24,back-height],[xx-side*25,back]],'#293939','#657c71');for(let i=0;i<5;i++)line(c,[[xx-8,fy-20-i*20],[xx+6,fy-28-i*20]],'#a0a99855',2);}
   else{poly(c,[[xx,fy],[xx,fy-height],[xx-side*12,back-height],[xx-side*12,back]],'#30474d','#80948c');line(c,[[xx,fy-height+17],[xx-side*12,back-height+17]],'#b6b99c',2);}
  }
  poly(c,[[left,front-height],[right,front-height],[right-12,back-height],[left+12,back-height]],mount.organic?'#2c3d3c':'#425b61','#80948c88');
  if(!mount.organic){line(c,[[left+10,front-height+7],[right-10,front-height+7]],'#acb99b',3);if(mount.type==='terminal-alcove'){const edge=X(p.x<r.width/2?28:r.width-28);rect(c,Math.min(edge,left),back-height,Math.max(2,Math.abs(edge-left)),12,'#344e54');}}
 }
 c.restore();
}
function armamentRack(c,a,t){
 rect(c,-65,-103,130,103,'#243b42','#9aaa98');rect(c,-58,-92,116,74,'#0b1c23','#556c68');rect(c,-60,-108,120,12,'#bead78');text(c,a.empty?'DOTATION RETIRÉE':'MATÉRIEL MINIER',0,-98,8,'#142725','center');
 const list=a.kit==='acid'?['acid']:['pick','thumper','net'];if(!a.empty)list.forEach((id,i)=>{c.save();c.translate(-61+i*42,-19);c.scale(.62,.62);toolInHand(c,id);c.restore();});
 for(const x of [-55,48])rect(c,x,-15,7,15,'#768b7c');
}
function drawCombatRemains(c,s,r,cam){
 const w=s.world[r.id];if(!w)return;
 for(const a of w.acid||[]){const x=(a.x-cam)*Z,y=415+(a.y-25)*.91;ellipse(c,x,y+1,a.radius*Z,9,'#9ebc603b','#cdd79588');if(!s.reducedMotion)for(let i=0;i<3;i++)ellipse(c,x-17+i*16,y-3-Math.sin(s.elapsed*4+i)*2,2,2,'#d2da9666');}
 for(const a of w.corpses||[]){const x=(a.x-cam)*Z,y=415+(a.y-25)*.91;c.save();c.translate(x,y);c.scale(1,.3);c.rotate(-Math.PI/2);alien(c,0,0,{type:a.type,dir:1},0);c.restore();}
}

export function drawPortrait(canvas,s,id){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const g=c.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,'#314a51');g.addColorStop(1,'#0d222a');c.fillStyle=g;c.fillRect(0,0,canvas.width,canvas.height);c.save();const z=canvas.height/82;c.translate(canvas.width/2,canvas.height-4);c.scale(z,z);human(c,0,0,1,false,0,id,false,false,false,false,false,null,actorAppearance(s,id));c.restore();}


/** Three reconstructed docking functions, not three copies of the cargo bay.
 * Windows and recessed panels are background surfaces; only registered returns collide.
 */
function dockingArchitecture(c,r,cam,t,s){
 if(!['boarding','docking_airlock','docking_arm'].includes(r.id))return;
 const X=x=>(x-cam)*Z;
 if(r.id==='boarding'){
  gradient(c,0,70,W,339,'#45565b','#1c3036');
  for(let i=-1;i<10;i++){
   const x=X(100+i*320),w=300*Z;if(x+w<-30||x>W+30)continue;
   poly(c,[[x,95],[x+30,76],[x+w-30,76],[x+w,95],[x+w,354],[x+w-17,392],[x+18,392],[x,354]],'#9aa7a14c','#aabbb378');
   rect(c,x+32,128,w-64,127,'#233d48','#c4d1c2');rect(c,x+42,138,w-84,108,'#040f1b');
   for(let j=0;j<11;j++)rect(c,x+48+rand(i*20+j)*Math.max(50,w-100),145+rand(i*19+j)*90,1,1,'#ced7ca99');
   line(c,[[x+46,145],[x+w-43,145]],'#8fadaa70',2);line(c,[[x+47,244],[x+w-44,244]],'#8fadaa70',2);
   rect(c,x+29,276,w-58,10,'#2c454a','#98ada2');rect(c,x+32,293,w-64,52,'#bdc3b332','#c8cdb459');
   for(let k=0;k<8;k++)line(c,[[x+42+k*(w-84)/8,310],[x+42+k*(w-84)/8,331]],'#263e43',3);
   line(c,[[x+20,372],[x+w-20,372]],'#b7ba9e',4);
  }
  rect(c,0,395,W,12,'#233e43','#8fa697');
  text(c,'VESTIBULE / RANGÉES FIXÉES AU PLANCHER',X(850),110,11,'#d7dbcb');
 }
 if(r.id==='docking_airlock'){
  gradient(c,0,55,W,357,'#64706a','#233c40');
  for(let i=-1;i<8;i++){
   const x=X(i*220);poly(c,[[x,70],[x+150,60],[x+175,110],[x+175,360],[x+153,410],[x-20,410],[x,360]],'#ccd0ba19','#c1c8b280');
   line(c,[[x+10,112],[x+140,112],[x+145,355]],'#1b363c',8);line(c,[[x+13,116],[x+136,116],[x+141,355]],'#91a994',2);
   rect(c,x+29,365,105,14,'#d6b56d');for(let k=0;k<7;k++)line(c,[[x+31+k*16,365],[x+43+k*16,379]],'#24383b',6);
  }
  const x=X(750);rect(c,x-128,192,256,149,'#18343b','#bfcebd');text(c,'AMARRAGE 02',x,215,12,'#e1d7b7','center');
  for(const dx of [-73,0,73]){ellipse(c,x+dx,253,23,23,'#aebcaa','#dee0c4');line(c,[[x+dx,253],[x+dx+12,241]],'#304b4b',3);text(c,dx===0?'LOCAL':dx<0?'MARION':'SAMSON',x+dx,294,8,'#ccdac4','center');}
  text(c,'LIAISON MÉCANIQUE · CIRCUIT FERMÉ',x,321,9,'#cfcca7','center');
 }
 if(r.id==='docking_arm'){
  gradient(c,0,57,W,351,'#102431','#050c16');
  for(let i=0;i<90;i++){const xx=(rand(i+762)*W-cam*.11+W*20)%W,yy=70+rand(i+100)*276;rect(c,xx,yy,i%17===0?2:1,1,'#d6e0d6a8');}
  for(let i=-1;i<12;i++){
   const x=X(i*205);rect(c,x,57,25,340,'#30474c','#91a39e');
   poly(c,[[x+24,58],[x+46,58],[x+205,350],[x+205,390]],'#405b5e','#9eafa0');
   line(c,[[x+23,73],[x+24,391]],'#c0cdb586',2);rect(c,x+25,72,166*Z,11,'#587374','#b3c7b1');
   rect(c,x+45,360,133*Z,33,'#182f35','#667d79');text(c,'02 / ACCOUPLEMENT',x+51,382,9,'#b3c5b1');
  }
  for(const yy of [54,397]){rect(c,0,yy,W,12,'#254049','#91a89e');line(c,[[0,yy+3],[W,yy+3]],'#c5c9ae',2);}
  for(const yy of [474,496])line(c,[[0,yy],[W,yy]],'#bdbca14d',2);
 }
}
