/* Original vector scenery and animated camera feeds. No official game art is bundled. */
(()=>{'use strict';
const D=BO_DATA,R=BO.rooms,E=BO.edges;
const palettes={engineering:['#091a20','#456367','#b5aa7f'],office:['#151c20','#69757a','#b29b71'],transit:['#101b21','#42606a','#c3a567'],lab:['#102127','#557c83','#b7cab9'],habitat:['#1b1c1d','#78786d','#c5ac83'],core:['#081b1e','#41666a','#a8c7ad'],research:['#172026','#55777c','#b4c6bb']};
function poly(c,pts,fill,stroke){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function rect(c,x,y,w,h,fill,stroke){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x,y,w,h);}}
function text(c,s,x,y,size=14,color='#cfdfdc',align='left'){c.font=`${size<=11?'500':'600'} ${size}px ui-monospace,monospace`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);c.textAlign='left';}
function line(c,a,b,color,width=1){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke();c.lineWidth=1;}
const imgs={};const ready=Promise.all(Object.entries(BO_ASSETS).map(([k,s])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{imgs[k]=im;resolve();};im.onerror=resolve;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);}))); 
function legacyHuman(c,a,scale,selected){c.save();c.translate(a.x,a.y);c.scale(scale,scale);if(a.incapacitated&&a.alive){
 c.translate(0,a.carried?-28:0);c.strokeStyle=a.color;c.lineWidth=7;c.lineCap='round';
 c.beginPath();c.moveTo(-22,-5);c.lineTo(14,-8);c.lineTo(27,-1);c.stroke();
 c.fillStyle='#c8b49a';c.beginPath();c.arc(-28,-8,6,0,Math.PI*2);c.fill();
 c.strokeStyle='#d1b081';c.lineWidth=1;c.strokeRect(-37,-19,73,25);
 c.fillStyle='#f0c99a';c.font='8px monospace';c.fillText(a.carried?'TRANSPORT':'AU SOL',-25,-25);c.restore();return;
}const moving=(!!a.goal&&!a.work)||a.action==='manual'||a.action==='following',s=moving?Math.sin(a.walk)*6:0;if(a.hidden){c.globalAlpha=.65;rect(c,-6,-8,12,4,a.color);c.restore();return;}
 c.fillStyle='#010a0dc0';c.beginPath();c.ellipse(0,0,18,5,0,0,Math.PI*2);c.fill();
 if(!a.alive){c.rotate(-Math.PI/2);c.translate(16,-10);c.globalAlpha=.45;}
 line(c,[-7,-26],[-10+s,-4],'#273c41',9);line(c,[6,-26],[9-s,-4],'#1e3136',9);line(c,[-13+s,-3],[-4+s,-3],'#0a1316',5);line(c,[4-s,-3],[14-s,-3],'#0a1316',5);
 poly(c,[[-13,-55],[9,-55],[13,-26],[-11,-26]],a.color,'#15292d');rect(c,-11,-39,22,3,'#323b37');rect(c,-5,-48,6,5,'#d4d7bb');rect(c,-14,-51,3,20,'#142a30');
 line(c,[-13,-51],[-16-s*.5,-33],a.color,7);line(c,[11,-51],[16+s*.5,-33],a.color,7);line(c,[-16-s*.5,-33],[-11-s*.5,-27],'#b49e84',5);line(c,[16+s*.5,-33],[12+s*.5,-27],'#b49e84',5);
 rect(c,-5,-60,10,8,'#af9780');c.fillStyle='#c0a88c';c.beginPath();c.ellipse(0,-66,8,10,0,0,7);c.fill();c.fillStyle=a.id==='saito'?'#161d21':a.id==='yutani'?'#262019':'#554d3a';c.beginPath();c.ellipse(0,-71,8,5,0,Math.PI,Math.PI*2);c.fill();rect(c,-8,-68,2,8,'#3e4744');rect(c,4,-67,4,2,'#293738');
 if(a.work){rect(c,10,-34,12,8,'#85bca8');}if(selected&&a.alive){line(c,[-18,5],[18,5],'#f0ca84',2);line(c,[-18,5],[-18,0],'#f0ca84',2);line(c,[18,5],[18,0],'#f0ca84',2);}c.restore();
 if(a.alive){text(c,a.name,a.x,a.y+18,10,selected?'#f2cf95':'#b6cdca','center');if(a.spotted>0)text(c,'REPÉRÉ',a.x,a.y-scale*88,10,'#f3957c','center');}}
function human(c,a,scale,selected){return BO_SCENE7.human(c,a,scale,selected);}
function alien(c,a,scale){c.save();c.translate(a.x,a.y);c.scale(scale,scale);const p=Math.sin(a.walk)*8; c.fillStyle='#000b0dcc';c.beginPath();c.ellipse(5,0,31,8,0,0,7);c.fill();
 c.beginPath();c.moveTo(-4,-42);c.bezierCurveTo(-65,-22,-70,17,-112+p,-17);c.bezierCurveTo(-120+p,-30,-117+p,-50,-126,-50);c.strokeStyle='#080e11';c.lineWidth=9;c.stroke();c.strokeStyle='#658080';c.lineWidth=2;c.stroke();
 for(let i=0;i<4;i++)line(c,[-8-i*2,-77+i*10],[-29-i*2,-89+i*8],'#293f46',5);
 line(c,[-6,-43],[-20+p,-23],'#344951',11);line(c,[-20+p,-23],[-10-p,0],'#20363d',8);line(c,[-10-p,0],[-25-p,2],'#617779',3);
 line(c,[8,-43],[27-p,-25],'#354951',10);line(c,[27-p,-25],[20+p,0],'#1f363e',7);line(c,[20+p,0],[33+p,2],'#617779',3);
 c.fillStyle='#263d44';c.beginPath();c.ellipse(0,-64,14,28,-.1,0,7);c.fill();for(let i=0;i<6;i++){c.beginPath();c.ellipse(0,-80+i*7,13-i*.4,4,0,0,Math.PI);c.strokeStyle='#637b7d';c.lineWidth=2;c.stroke();}
 line(c,[9,-82],[30,-59+p*.3],'#344b51',8);line(c,[30,-59+p*.3],[39,-36],'#21373e',6);for(let i=0;i<4;i++)line(c,[37+i,-37],[39+i*3,-25+i],'#93a4a0',1.5);
 line(c,[-9,-81],[-24,-65-p*.3],'#344b51',7);line(c,[-24,-65-p*.3],[-31,-45],'#253b42',5);
 c.save();c.translate(0,-97);c.rotate(-.13);const g=c.createLinearGradient(-32,-14,28,10);g.addColorStop(0,'#10252d');g.addColorStop(.45,'#6b858b');g.addColorStop(.65,'#2b434d');g.addColorStop(1,'#12232d');c.fillStyle=g;c.beginPath();c.ellipse(-7,-5,37,15,0,0,7);c.fill();c.strokeStyle='#91a6a4';c.lineWidth=1;c.stroke();poly(c,[[16,1],[28,5],[22,14],[11,11]],'#273d43');for(let i=0;i<5;i++)line(c,[16+i*2,8],[16+i*2,11],'#dce2c9');c.restore();c.restore();}
function drawProp(c,p){
 const im=imgs[p.type];if(!im)return;
 const w=p.w||({locker:125,console:100,vent:92,sign:106,light:120,pipe:110,core:110,rack:113,filter:105,bunks:137,labtable:118,bench:125,workbench:125,desk:110,resin:140}[p.type]||92),h=p.h||w*1.25;
 const grounded=p.layer==='back'||p.layer==='floor';
 const anchor={locker:194,console:188,crate:192,cart:195,bench:194,workbench:195,rack:194,filter:190,core:192,desk:194,labtable:194,bunks:194,fridge:194,batterycell:193,palletjack:193,server:195,washer:194,specimen:194,seatrow:186,trash:192,oxygen:194}[p.type]||194;
 const y=p.y-h+(grounded?(200-anchor)*w/160:0);
 if(grounded){c.fillStyle='#02101866';c.beginPath();c.ellipse(p.x+w*.5,p.y+1,w*.48,4,0,0,7);c.fill();}
 c.drawImage(im,p.x,y,w,h);
 if(p.type==='sign'&&p.facing){
  // Replace only the arrow, not the label: the shared asset points east by default.
  const cx=p.x+w*133/160,cy=y+h*107/200;
  rect(c,p.x+w*118/160,y+h*86/200,w*33/160,h*43/200,'#c4c2a7');
  c.save();c.translate(cx,cy);c.rotate(({E:0,W:Math.PI,N:-Math.PI/2,S:Math.PI/2})[p.facing]);
  line(c,[-w*.07,0],[w*.065,0],'#4c6051',Math.max(1,w*.027));
  line(c,[w*.065,0],[-w*.006,-w*.065],'#4c6051',Math.max(1,w*.027));
  line(c,[w*.065,0],[-w*.006,w*.065],'#4c6051',Math.max(1,w*.027));c.restore();
 }
}
function architecture(c,r,e) {
 const theme=e.chapter.theme;
 const glaze=(x,y,w,h)=>{rect(c,x,y,w,h,'#071823','#759895');const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#567d8428');g.addColorStop(.45,'#16394315');g.addColorStop(1,'#90bca94d');rect(c,x+4,y+4,w-8,h-8,g);};
 if(theme==='engineering') {
  for(const y of [204,225,246]){line(c,[305,y],[750,y],'#122a32',15);line(c,[308,y-3],[749,y-3],'#77908a',4);}
  for(const x of [350,500,733]){rect(c,x,190,8,73,'#958969');rect(c,x+2,193,2,65,'#d1bea1');}
  rect(c,354,282,230,35,'#112b31','#6a8a86');text(c,'AUXILIARY / 05 BUS',369,304,13,'#c7bb87');
 } else if(theme==='administration') {
  glaze(304,195,294,140);for(const x of [325,419,512]){rect(c,x,246,64,81,'#365459');rect(c,x+6,254,52,32,'#648782');}
  for(const x of [310,452,594])line(c,[x,194],[x,333],'#bac6b2',5);
  text(c,r.kit==='archive'?'PERSONNEL / RECORDS':'ADMINISTRATION / LOCAL ACCESS',460,222,12,'#c4d2bc','center');
 } else if(theme==='transit') {
  glaze(300,191,470,143);poly(c,[[329,271],[729,271],[764,330],[305,330]],'#233741');
  for(const x of [342,433,564,668])line(c,[480+(x-480)*.4,274],[x,328],'#9a9f87',4);
  for(let y=280;y<329;y+=12)line(c,[321,y],[748,y],'#4c6869',2);
  for(const x of [306,533,761])rect(c,x,192,7,143,'#8aa196');
  text(c,'HALDIN / TRANSIT SUSPENDU',531,223,13,'#c6caaf','center');
  if(r.kit==='transit')for(let i=0;i<3;i++){rect(c,363+i*87,239,64,21,'#73938e');rect(c,368+i*87,243,54,11,'#19363c');}
 } else if(theme==='laboratory') {
  rect(c,300,185,476,150,'#355247','#819580');
  for(let x=314;x<764;x+=55){rect(c,x,194,42,130,'#182f2c','#687c5e');for(let y=221;y<323;y+=34){line(c,[x+3,y+16],[x+37,y+16],'#90a079',4);for(let j=0;j<3;j++){const mx=x+7+j*12;line(c,[mx,y+14],[mx,y],'#b0ab8b',3);poly(c,[[mx-7,y+2],[mx-4,y-6],[mx+4,y-7],[mx+8,y+2]],'#aa9a7c');}}}
  text(c,'PHARMALAB / CULTURES MYCOLOGIQUES',539,177,10,'#d4d6b6','center');
 } else if(theme==='habitation') {
  rect(c,300,193,477,141,'#5d625b','#a7a88e');rect(c,317,211,214,112,'#2b393b','#8a998b');
  for(let x=332;x<520;x+=60){rect(c,x,229,47,31,'#bac0a1');rect(c,x+5,235,36,3,'#677e70');rect(c,x,266,47,33,'#8b9781');}
  rect(c,551,213,195,104,'#213238','#979d86');text(c,'CREW / QUIET HOURS',648,250,11,'#c5b793','center');text(c,'22:00 — 06:00',648,274,12,'#b3c0a4','center');
 } else if(theme==='core') {
  for(let j=0;j<3;j++){const x=309+j*130;rect(c,x,188,106,148,'#183138','#859e95');for(let y=201;y<330;y+=20){rect(c,x+9,y,85,12,'#091e27','#35585b');for(let i=0;i<5;i++)rect(c,x+16+i*12,y+4,4,3,((i+j+Math.floor(e.t))%5===0?'#bdab75':'#79b5a5'));}}
  line(c,[316,183],[694,183],'#a7beaf',5);text(c,'F.E.M.S / LOCAL AUTHORITY',507,176,10,'#a8c9bc','center');
 } else if(theme==='research') {
  glaze(306,192,470,143);for(let j=0;j<3;j++){const x=338+j*128;rect(c,x,214,80,117,'#203c41','#a4b5a2');c.fillStyle='#6b9d8e22';c.beginPath();c.ellipse(x+40,269,30,48,0,0,7);c.fill();c.beginPath();c.moveTo(x+35,303);c.bezierCurveTo(x+70,280,x+13,250,x+45,235);c.strokeStyle='#728f81';c.lineWidth=8;c.stroke();c.lineWidth=1;}
  text(c,'RESEARCH / SEALED SPECIMENS',539,207,11,'#c4cbb1','center');
 }
 if(r.kit==='duct'){rect(c,304,197,466,137,'#0c232d','#65847e');for(let x=317;x<761;x+=43){rect(c,x,211,18,112,'#395c61');line(c,[x+3,215],[x+3,320],'#6e9390',3);}text(c,'AIR HANDLING / MAINTENANCE',531,190,10,'#bec9ab','center');}
 if(r.kit==='battery'){rect(c,328,202,385,130,'#173139','#7f9e97');text(c,'RESERVE CELL / ISOLATED BUS',520,222,11,'#c8c49c','center');for(let x=350;x<709;x+=76){rect(c,x,243,50,76,'#4e706e','#b8c5ab');rect(c,x+7,252,35,7,'#b7c783');line(c,[x+8,318],[x+43,318],'#b6a56e',4);}}
}
function legacyBackground(c,r,engine){const theme={administration:'office',laboratory:'lab',habitation:'habitat'}[engine.chapter.theme]||engine.chapter.theme;const pal=palettes[r.kit]||palettes[theme]||palettes.engineering;
 const g=c.createLinearGradient(0,0,0,560);g.addColorStop(0,'#030a0e');g.addColorStop(.5,pal[0]);g.addColorStop(.86,'#172a2e');g.addColorStop(1,'#060f14');rect(c,0,0,1000,560,g);
 // Recessed hull, continuous structural bays and backed apertures.
 rect(c,20,90,960,354,'#1e343a','#496369');for(let x=30;x<980;x+=119){rect(c,x,105,108,280,pal[1]);const sh=c.createLinearGradient(x,0,x+108,0);sh.addColorStop(0,'#070f19dd');sh.addColorStop(.5,'#14273022');sh.addColorStop(1,'#00080c99');rect(c,x,105,108,280,sh);rect(c,x+8,113,90,197,'#13282d99','#456168');rect(c,x+8,319,90,46,'#21343b');for(let y=330;y<353;y+=6)line(c,[x+18,y],[x+83,y],'#07171c');rect(c,x+102,97,11,307,'#6d7c78');rect(c,x+105,102,3,290,'#233b3f');}
 for(let y=45;y<88;y+=12){line(c,[0,y],[1000,y+12],'#1e4248',4);line(c,[0,y-2],[1000,y+10],'#5e7371',1);}
 for(const x of [145,470,800]){rect(c,x,99,158,8,'#a9c5b9');const glow=c.createRadialGradient(x+80,115,1,x+80,230,215);glow.addColorStop(0,'#a1d8c324');glow.addColorStop(1,'#8acbbb00');rect(c,x-140,105,435,335,glow);}
 if(['bunks','mess'].includes(r.kit)){rect(c,380,160,170,98,'#061019','#8d9687');text(c,'SILENCE / CREW REST',465,211,14,'#a7b3a2','center');}
 if(['core','hive','cold'].includes(r.kit)){for(let x=70;x<975;x+=185){rect(c,x,142,93,92,'#071417','#537f81');for(let y=151;y<225;y+=12){line(c,[x+8,y],[x+68,y],'#25484c');rect(c,x+75,y,7,3,(y%2?'#c5b77b':'#90ccb4'));}}}
 architecture(c,r,engine);
 if(r.view==='DEPTH'){poly(c,[[21,340],[979,340],[1000,540],[0,540]],'#314448');for(let x=-550;x<=1600;x+=160)line(c,[500+(x-500)*.36,340],[x,545],'#77878155');for(let y=351;y<550;y+=24)line(c,[0,y],[1000,y],'#080e1577',2);poly(c,[[25,346],[975,346],[979,352],[21,352]],'#cab277');line(c,[30,360],[15,514],'#7f938a',3);line(c,[970,360],[985,514],'#7f938a',3);}
 else{rect(c,0,386,1000,92,'#1a2f35');for(let x=0;x<1000;x+=90){rect(c,x+1,430,88,45,'#30464a','#657976');for(let i=0;i<4;i++)line(c,[x+10,439+i*7],[x+70,439+i*7],'#11242a');}rect(c,0,478,1000,13,'#94a190');rect(c,0,491,1000,46,'#061319');for(let x=0;x<1000;x+=40)line(c,[x,492],[x+18,511],'#947e48',6);}
 // Recessed, labeled, physical room thresholds.
 for(const [side,p]of Object.entries(r.ports)){const pt=BO.port(r.id,side);
 if(side==='S'&&r.view==='DEPTH'){const x=pt.x,y=pt.y;poly(c,[[x-53,y-10],[x+53,y-10],[x+78,527],[x-78,527]],engine.doors[p.edge]?'#697a70':'#061116','#b0b395');for(let k=0;k<4;k++)line(c,[x-53-k*5,y-5+k*8],[x+53+k*5,y-5+k*8],engine.doors[p.edge]?'#213a3a':'#526860',3);line(c,[x-65,y-35],[x-77,525],'#9aac98',3);line(c,[x+65,y-35],[x+77,525],'#9aac98',3);rect(c,x+60,y-18,5,10,engine.doors[p.edge]?'#d49275':'#adcb9b');text(c,`D${p.edge.split('-d')[1]} / TRANSFERT ↓`,x,y-17,10,'#e0cd99','center');continue;}
 const dep=r.view==='DEPTH'&&side==='N',w=dep?90:86,h=dep?107:175;const x=pt.x-w/2,y=pt.y-h;poly(c,[[x-14,y-11],[x+w+14,y-11],[x+w+17,pt.y+3],[x-17,pt.y+3]],'#677978','#182f36');rect(c,x,y,w,h,'#030d12');rect(c,x+5,y+3,w-10,h-7,'#142830');if(engine.doors[p.edge]){const grad=c.createLinearGradient(x,0,x+w,0);grad.addColorStop(0,'#405957');grad.addColorStop(.5,'#85948c');grad.addColorStop(1,'#2c4848');rect(c,x+3,y+3,w-6,h-3,grad);line(c,[pt.x,y+7],[pt.x,pt.y],'#0c1b20',3);for(let q=0;q<3;q++)line(c,[x+11,y+37+q*34],[x+w-11,y+37+q*34],'#203b41',3);}else{poly(c,[[x+10,y+6],[x+w-10,y+6],[x+w-20,pt.y-20],[x+20,pt.y-20]],'#050e15');line(c,[x+16,pt.y-4],[x+w-16,pt.y-4],'#94a99b',3);}
 rect(c,x+w+4,y+45,5,24,engine.doors[p.edge]?'#ca7a61':'#a5ca9b');text(c,`D${p.edge.split('-d')[1]} / ${side}`,pt.x,y-18,11,'#d0c9a7','center');if(side==='S'&&r.view==='DEPTH')text(c,'↘ TRANSFERT',pt.x,pt.y+22,10,'#d2c4a2','center');}
 // Room identity stays in the camera header; no duplicated lettering behind wall fixtures.
 for(const p of r.props.filter(p=>p.layer==='back'))drawProp(c,p);
}
function background(c,r,e){return BO_SCENE7.background(c,r,e,drawProp,architecture);}
function drawScene(canvas,e,{refuge=false,inspection=false}={}){const c=canvas.getContext('2d');c.clearRect(0,0,1000,560);const r=R.get(e.camera);
 if(refuge||e.shield>0){refugeScene(c,e);}else if(!e.monitor||e.reboot>0||e.brokenCamera===e.camera){rect(c,0,0,1000,560,'#09151b');for(let y=0;y<560;y+=4)line(c,[0,y],[1000,y],'#33484a12');text(c,e.reboot>0?'REDÉMARRAGE DU RÉSEAU':e.brokenCamera===e.camera?'CAMÉRA HORS SERVICE':'IMAGE COUPÉE',500,240,26,'#c7bea0','center');text(c,e.brokenCamera===e.camera?'Envoyez quelqu’un réparer la caméra.':'Les ordres restent possibles tant que la liaison n’est pas scellée.',500,280,14,'#819e9e','center');if(e.shield<=0&&e.reboot<=0)text(c,'RÉACTIVER LE CANAL CAMÉRA DANS LES COMMANDES',500,316,12,'#adbaab','center');}
 else{background(c,r,e);const objects=r.props.filter(p=>p.layer!=='back'&&p.layer!=='wall').map(p=>({y:p.depth??p.y,draw:()=>drawProp(c,p)}));e.crew.filter(a=>a.room===r.id).forEach((a,i)=>objects.push({y:a.y,draw:()=>human(c,a,1.48*(r.view==='DEPTH'?.75+(a.y-340)/620:1),e.crew[e.selected]===a)}));e.aliens.filter(a=>a.room===r.id&&!a.inVent&&!a.refuge).forEach(a=>objects.push({y:a.y,draw:()=>alien(c,a,1.40*(r.view==='DEPTH'?.75+(a.y-340)/620:1))}));objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
  const t=e.currentTask;if(t?.room===r.id){const p=r.terminal;line(c,[p[0]-8,p[1]-63],[p[0]+8,p[1]-63],'#e4bb73',2);text(c,'TERMINAL',p[0],p[1]-78,10,'#e8c58c','center');}
  const service=e.chapter.services.find(s=>s.room===r.id);
  if(service){text(c,e.serviceState[service.id].done?'CIRCUIT UTILISÉ':'ANNEXE / '+(service.kind==='capacitor'?'ACCUMULATEUR':'CLAPET'),r.terminal[0],r.terminal[1]-144,10,e.serviceState[service.id].done?'#8aaa9a':'#bcd9c3','center');}
  const pressure=e.aliens.find(a=>a.pressure&&a.room===r.id);
  if(pressure){const p=pressure.pressure,ed=E.get(p.edge),pt=BO.port(r.id,ed.a===r.id?ed.pa:ed.pb);const left=Math.max(0,e.config.breachTime-p.progress);rect(c,Math.max(21,Math.min(800,pt.x-90)),pt.y-207,179,43,'#5e3029e8','#dca47e');text(c,`D${p.edge.split('-d')[1]} / FORÇAGE ${Math.ceil(left)} s`,Math.max(31,Math.min(810,pt.x-80)),pt.y-186,11,'#ffe0ac');}
  // Foreground hull and camera glass, never used as collision geometry.
  poly(c,[[0,0],[33,0],[19,535],[0,560]],'#01080cd9');poly(c,[[968,0],[1000,0],[1000,560],[981,535]],'#01080cd9');const vg=c.createRadialGradient(500,300,140,500,280,590);vg.addColorStop(0,'#00080b00');vg.addColorStop(.8,'#00080b18');vg.addColorStop(1,'#00080bb0');rect(c,0,0,1000,560,vg);
 }
 rect(c,0,0,1000,49,'#041016db');rect(c,0,527,1000,33,'#041016e5');text(c,refuge?'REFUGE / AMANDA RIPLEY':`CAM ${String(r.index+1).padStart(2,"0")} / ${r.name.toUpperCase()}`,24,30,13,'#d3ddcb');text(c,e.shield>0?`SCELLÉ ${Math.ceil(e.shield)} s`:(e.monitor?'● DIRECT':'○ HORS LIGNE'),974,30,12,e.shield>0?'#e5b977':'#a4c6b3','right');text(c,inspection?'INSPECTION · SCÈNE PRÉPARÉE · HORS PROGRESSION':r.view==='SIDE'?'PLAN LATÉRAL / SEUILS PHYSIQUES':'PLAN PROFOND / OBSTACLES PHYSIQUES',24,548,10,'#8aa6a1');text(c,`${Math.floor(e.t/60).toString().padStart(2,'0')}:${Math.floor(e.t%60).toString().padStart(2,'0')}  /  MENDEL SEC.`,973,548,11,'#9bb1a6','right');
 for(let y=50;y<525;y+=4)line(c,[0,y],[1000,y],'#00101712');if(e.ventCountdown>0){rect(c,24,66,480,39,'#672e25e8','#efaf87');text(c,`GAINE AMANDA / SCELLER · ${Math.ceil(e.ventCountdown)} s`,38,91,15,'#ffe0b5');}}
function refugeScene(c,e){rect(c,0,0,1000,560,'#051015');const pts=[[180,60],[820,60],[1000,535],[0,535]];poly(c,pts,'#233638');for(let i=0;i<6;i++){const x=115+i*43,y=110+i*25,w=770-i*86,h=410-i*57;rect(c,x,y,w,h,'#0d2028','#5a7576');}rect(c,375,260,250,152,e.shield>0?'#6c7770':'#02090c','#9aab98');if(e.shield>0){for(let x=390;x<619;x+=32)line(c,[x,266],[x,410],'#263f40',4);text(c,'VERROUILLÉ',500,340,20,'#e3c791','center');}else if(e.ventCountdown>0)alien(c,{x:525,y:408,walk:e.t*2},1);poly(c,[[180,470],[670,435],[820,560],[100,560]],'#263e40','#738b7b');rect(c,224,427,190,89,'#12272a','#729387');text(c,e.shield>0?'RÉSEAU ISOLÉ':'F.E.M.S · AUX',247,460,13,'#adc5a4');text(c,'ESPACE : SCELLER',247,486,11,'#dfc593');text(c,'AMANDA / POSTE DE MAINTENANCE',500,94,17,'#cad1b9','center');}
function drawMap(canvas,e){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);rect(c,0,0,w,h,'#091a22');
 const sx=w/1000,sy=(h-44)/622,bw=160*sx,bh=108*sy,dx=218*sx,dy=172*sy,ox=70*sx,oy=61*sy;
 const pos=id=>{const [x,y]=R.get(id).map;return{x:ox+x*dx,y:oy+y*dy};};
 const center=id=>{const p=pos(id);return[p.x+bw/2,p.y+bh/2];};
 for(let x=8;x<w;x+=12)for(let y=15;y<h-32;y+=12)rect(c,x,y,1,1,'#4b777922');
 const pathPoints=ed=>BO_ARCH.routes(e.chapterIndex).find(x=>x.edge===ed.id).points.map(([x,y])=>[x*sx,y*sy]);
 for(const ed of D.edges.filter(d=>d.chapter===e.chapterIndex)){
  const pts=pathPoints(ed),pushing=e.aliens.some(a=>a.pressure?.edge===ed.id),disabled=e.doorCooldown[ed.id]>0;
  for(let i=1;i<pts.length;i++)line(c,pts[i-1],pts[i],pushing?'#f2bc84':disabled?'#715d55':e.doors[ed.id]?'#bc8f67':'#4a7778',3);
  const q=pts.length>2?pts[1]:[(pts[0][0]+pts.at(-1)[0])/2,(pts[0][1]+pts.at(-1)[1])/2];
  rect(c,q[0]-11,q[1]-7,22,14,'#132c34');text(c,ed.id.split('-d')[1],q[0],q[1]+3,9,pushing?'#ffe2a6':'#c1d0bc','center');
 }
 if(e.v4){const q=e.v4.queues[e.selected];let room=e.crew[e.selected].room;c.setLineDash([2,5]);for(const it of [...(q.current?[q.current]:[]),...q.items]){if(!it.room)continue;const route=e.path(room,it.room);if(route)for(const n of route){const ed=E.get(n.edge);if(!ed)continue;const pts=pathPoints(ed);for(let j=1;j<pts.length;j++)line(c,pts[j-1],pts[j],'#9fb9e0',1.5);}room=it.room;}c.setLineDash([]);}
 const actor=e.crew[e.selected],route=actor?.goal?e.path(actor.room,actor.goal.room):null;
 if(route){c.setLineDash([3,4]);for(const n of route){const ed=E.get(n.edge);if(!ed)continue;const pts=pathPoints(ed);for(let i=1;i<pts.length;i++)line(c,pts[i-1],pts[i],'#f0ca82',1.5);}c.setLineDash([]);}
 for(const id of e.chapter.rooms){
  const r=R.get(id),p=pos(id),active=id===e.camera;
  rect(c,p.x,p.y,bw,bh,active?'#294c47':'#142f39',active?'#dfc593':'#527d7d');
  rect(c,p.x,p.y,3,bh,active?'#dfc593':'#345b61');text(c,String(r.index+1).padStart(2,'0'),p.x+7,p.y+12,9,'#b9caba');
  let words=r.name.split(' '),lines=[''];for(const word of words){if((lines.at(-1)+' '+word).length>10)lines.push(word);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;}
  lines.filter(Boolean).slice(0,2).forEach((v,i)=>text(c,v.length>11?v.slice(0,10)+'…':v,p.x+7,p.y+27+i*11,8,'#cbd6c4'));
  for(const [side,port]of Object.entries(r.ports)){const bx=side==='W'?p.x:side==='E'?p.x+bw:p.x+bw/2,by=side==='N'?p.y:side==='S'?p.y+bh:p.y+bh/2;rect(c,bx-2,by-2,4,4,e.doors[port.edge]?'#d6a476':'#b4d3a2');}if(e.currentTask?.room===id)text(c,'◆',p.x+bw-10,p.y+12,10,'#f3ce87','center');
  if(r.service)text(c,e.serviceState[r.service].done?'✓':'+',p.x+bw-11,p.y+12,11,'#aad6bf','center');
  if(id===e.chapter.exit)text(c,'↗',p.x+bw-10,p.y+bh-6,11,'#c5dbaa','center');
  if(e.v4&&e.incident.room===id&&!e.serviceState[e.incident.id].done)text(c,e.incidentActive?'!':'M',p.x+bw-24,p.y+12,10,'#e6bd88');
  if(e.brokenCamera===id)text(c,'!',p.x+bw-23,p.y+12,11,'#e9b086');
  e.crew.forEach((a,i)=>{if(a.room===id&&a.alive){c.beginPath();c.arc(p.x+12+i*12,p.y+bh-9,3.3,0,7);c.fillStyle=a.color;c.fill();if(i===e.selected){c.strokeStyle='#f5e3ba';c.stroke();}}});
  if(e.v4)e.contacts().filter(a=>a.room===id).forEach((a,i)=>{c.globalAlpha=Math.max(.2,1-a.age/9);rect(c,p.x+bw-10-i*8,p.y+bh-25,5,5,a.kind==='camera'?'#c5e9af':'#e2bc83');c.globalAlpha=1;});else if(e.sensor&&e.link)e.aliens.filter(a=>a.room===id&&!a.inVent&&!a.refuge).forEach((a,i)=>rect(c,p.x+bw-10-i*8,p.y+bh-25,5,5,'#f1ae85'));
 }
 text(c,e.v4?(e.sensor&&e.link?'BALAYAGE 2,5 s / ÉCHOS DATÉS':'CAPTEUR COUPÉ / ÉCHOS EN MÉMOIRE'):e.sensor?'CAPTEUR ACTIF / CONTACTS VISIBLES':'CAPTEUR COUPÉ / POSITIONS HOSTILES MASQUÉES',w/2,h-31,9,'#a6bdb2','center');
 text(c,e.gaitLockLabel,w/2,h-13,9,e.ventLock>0?'#d4cd91':'#729c96','center');
 return{hit(x,y){for(const id of e.chapter.rooms){const p=pos(id);if(x>=p.x&&x<=p.x+bw&&y>=p.y&&y<=p.y+bh)return id;}return null;},center};
}
globalThis.BO_RENDER={ready,drawScene,drawMap,human,alien};})();
