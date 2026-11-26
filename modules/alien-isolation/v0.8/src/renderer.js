import { drawSpatialArchitecture, drawMountedPortal } from './spatial-renderer.js';
import { ART } from './assets.js';
import { CONTENT } from './content.js';
import { ROOMS, doors, available, route, clamp } from './engine.js';
const palettes={medical:['#252f2c','#66766b','#a9bda4','#c5ba78'],hospital:['#222e2b','#586f66','#adc7ae','#c5a871'],pharmacy:['#212e28','#5e7563','#b3c4a3','#d1af69'],cryo:['#28342f','#718273','#c0c9ab','#d9c69b'],bridge:['#162621','#465b4c','#9caf94','#c3a06a'],terminal:['#152722','#466054','#b0c0a5','#ba995e'],transit:['#122523','#425d51','#afc6ad','#bb985d'],hive:['#071519','#213a37','#66857c','#988f57'],derelict:['#171d1a','#3b4b3e','#879584','#aa955a'],apollo:['#111e1c','#344b3f','#c1c99d','#a19859'],reactor:['#14221f','#304c41','#83a18c','#daa266'],exterior:['#0a1516','#253b32','#8baf9b','#d2b173'],planet:['#121619','#363b35','#818d7c','#bbab87']};
const bbox={medical_pack:176,engineering_pack:176,clinic_console:180,engineering_console:180,cabinet:100,locker:100,server:100,bench:177,terminal:183,kiosk:183,pilot:200,desk:183,workbench:201,counter:201,table:201,case:182,crate:182,container:182,chair:102,bed:211,gurney:211,cryopod:211,tank:130,turbine:212,pump:212,core:176,shelf:150,vending:150,water:150,cart:205,trolley:205,forklift:205,spool:160,barrier:205,pipe:220,fan:187,relay:121,save:84,poster:155,light:220,suit:101,iv:68,radio:152,bars:220,rock:235,rib:172,resin:172,egg:108,androidrack:112,gantry:213,antenna:213,planter:170};
export class IsolationRenderer{
 constructor(canvas,engine){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.engine=engine;this.camera=0;this.lastRoom=null;this.images={};this.ready=Promise.all(Object.entries(ART).map(([k,svg])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{this.images[k]=im;resolve();};im.onerror=resolve;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);})));this.w=1440;this.h=810;canvas.width=this.w;canvas.height=this.h;}
 project(x,y){let scale=this.engine.s.classic?.25:.63;return{x:x-this.camera,y:this.engine.room.view==='SIDE'?578:410+(y-100)*scale};}
 rect(x,y,w,h,fill,stroke=null,lw=1){const c=this.c;c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
 line(x,y,x2,y2,color,width=1){const c=this.c;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 text(text,x,y,size=14,color='#bcc8af',align='left'){const c=this.c;c.font=`${size}px "Courier New",monospace`;c.fillStyle=color;c.textAlign=align;c.fillText(text,x,y);c.textAlign='left';}
 space(time,planet=false){
 const c=this.c,g=c.createLinearGradient(0,0,0,810);g.addColorStop(0,'#030a0f');g.addColorStop(.6,planet?'#566356':'#152d30');g.addColorStop(1,'#081517');c.fillStyle=g;c.fillRect(0,0,1440,810);
 for(let i=0;i<130;i++){const x=(i*193.7)%1440,y=(i*i*21.91)%610;this.rect(x,y,i%5===0?2:1,1.3,i%3===0?'#9bb5a3':'#496f73');}
 if(!planet){c.save();c.translate(1100,295);c.rotate(-.26);c.beginPath();c.ellipse(0,0,476,245,0,0,Math.PI*2);c.clip();let g=c.createLinearGradient(0,-245,0,245);g.addColorStop(0,'#716e57');g.addColorStop(.3,'#b5aa7c');g.addColorStop(.63,'#6d8575');g.addColorStop(1,'#263f39');c.fillStyle=g;c.fillRect(-480,-250,960,500);for(let i=0;i<37;i++){c.strokeStyle=i%3===0?'#d2c29522':'#2b4b4533';c.lineWidth=3+i%8;c.beginPath();c.moveTo(-500,-240+i*14);c.bezierCurveTo(-160,-220+i*15,170,-250+i*13,500,-230+i*14);c.stroke();}c.restore();}
 else{for(let layer=0;layer<4;layer++){c.beginPath();c.moveTo(0,800);for(let x=0;x<=1450;x+=50)c.lineTo(x,340+layer*74+Math.sin(x*.009+layer*5)*55+Math.sin(x*.019)*27);c.lineTo(1440,810);c.fillStyle=['#263937','#202f2d','#172320','#101d1a'][layer];c.fill();}}
 }
 background(){
 const c=this.c,r=this.engine.room,p=palettes[r.kit]||['#192923','#4a6050','#a5b795','#c2a66b'],t=this.engine.s.time;this.space(t,r.kit==='planet');
 if(r.kit==='planet'){
  const base=r.view==='SIDE'?520:410;
  const ground=c.createLinearGradient(0,base,0,810);ground.addColorStop(0,'#39463b');ground.addColorStop(.45,'#26342b');ground.addColorStop(1,'#121e19');c.fillStyle=ground;c.fillRect(0,base,1440,810-base);
  for(let i=0;i<130;i++){const wx=(i*193.47)%(r.w+200),x=wx-this.camera,y=base+20+(i*i*11.83)%(790-base);this.line(x,y,x+8+i%17,y-3,'#6b78613b',1+i%3);}
  this.text('SOUVENIR DE MARLOW · SURFACE ROCHEUSE',54,110,12,'#b3c6b4');return;
 }
 if(r.kit==='derelict'){
  const base=r.view==='SIDE'?520:410,g=c.createLinearGradient(0,90,0,810);g.addColorStop(0,'#080e0d');g.addColorStop(.4,'#364438');g.addColorStop(1,'#14231a');c.fillStyle=g;c.fillRect(0,0,1440,810);
  for(let wx=0;wx<r.w+300;wx+=180){const x=wx-this.camera;c.beginPath();c.moveTo(x-90,base+25);c.bezierCurveTo(x+115,base-80,x-140,90,x+90,35);c.strokeStyle='#101e18';c.lineWidth=39;c.stroke();c.strokeStyle='#77806455';c.lineWidth=4;c.stroke();for(let j=0;j<6;j++)this.line(x+5+j*12,base-33-j*30,x+36+j*10,base-51-j*29,'#5e705233',2);}
  const floor=c.createLinearGradient(0,base,0,810);floor.addColorStop(0,'#374533');floor.addColorStop(1,'#101f16');c.fillStyle=floor;c.fillRect(0,base,1440,810-base);for(let i=0;i<35;i++){let x=i*83-this.camera;this.line(x,base+40,x+75,790,'#75806520',3);}
  this.text('STRUCTURE ORGANIQUE · RÉCIT DE MARLOW',54,110,12,'#b3c6b4');return;
 }
 if(r.exterior){const deckBase=r.view==='SIDE'?520:410;this.rect(0,deckBase,1440,810-deckBase,'#142821');for(let x=-this.camera%180;x<1440;x+=180){this.line(x,deckBase,x+120,810,'#45584b',2);this.rect(x,deckBase+81,132,7,'#829276');this.line(x+17,deckBase-47,x+17,deckBase+10,'#708574',5);}this.line(0,deckBase-24,1440,deckBase-24,'#aeb995',3);this.line(0,deckBase+8,1440,deckBase+8,'#627c65',3);this.text('COQUE EXTÉRIEURE · LIGNE DE VIE',54,110,12,'#b3c6b4');
 if(['g_hull','e_catwalk'].includes(r.id)){
  // The exterior doors terminate in hull volumes, never free-standing in space.
  for(const [wx,wide,label]of [[-120,430,r.id==='g_hull'?'KG-348 / SAS EXT.':'ATELIER / SAS'],[r.w-280,430,r.id==='g_hull'?'STATION / RETOUR':'ANTENNE / RETOUR']]){
   const x=wx-this.camera;this.rect(x,221,wide,382,'#1b302c','#607e6b',3);this.rect(x+17,246,wide-34,345,'#293d34','#84917a',2);
   for(let j=0;j<4;j++){this.rect(x+24+j*98,244,12,350,'#182923','#607460');this.line(x+32+j*98,274,x+32+j*98,560,'#7b8f7955',2);}
   this.rect(x+50,279,wide-100,28,'#0b221c','#8ba386');this.text(label,x+wide/2,298,12,'#c8d0ad','center');
   this.line(x+35,333,x+wide-35,333,'#c5caa233',4);this.line(x+31,587,x+wide-31,587,'#9eac90',7);
  }
  const lx=300-this.camera,rx=r.w-292-this.camera;this.line(lx,462,rx,462,'#7c9887',4);this.line(lx,489,rx,489,'#445f50',2);
  for(let wx=330;wx<r.w-300;wx+=190){const x=wx-this.camera;this.line(x,460,x,576,'#627e6b',4);this.rect(x-11,570,22,9,'#9ba98a');}
  this.text('LIGNE DE VIE / RETOUR STATION →',670-this.camera,685,13,'#c1caaa');
 }
 return;}
 this.rect(0,0,1440,96,p[0]);this.rect(0,77,1440,18,'#081813');this.line(0,94,1440,94,p[1],3);
 const wallBase=r.view==='SIDE'?520:410;
 const bg=c.createLinearGradient(0,95,0,wallBase);bg.addColorStop(0,p[0]);bg.addColorStop(.6,p[1]);bg.addColorStop(1,p[0]);c.fillStyle=bg;c.fillRect(0,95,1440,wallBase-95);
 const hasWindow=['bridge','terminal','transit','cryo'].includes(r.kit);
 for(let wx=0;wx<r.w+250;wx+=255){const x=wx-this.camera;
  if(x< -280||x>1460)continue;
  this.rect(x+9,125,226,wallBase-155,p[0],p[1],2);
  if(hasWindow&&wx>170&&wx<r.w-220){c.save();c.beginPath();c.roundRect(x+22,153,200,170,18);c.clip();this.space(t);c.restore();this.rect(x+22,153,200,170,'#314c411a',p[2],4);this.line(x+122,153,x+122,323,p[1],10);}
  else{this.rect(x+24,153,194,wallBase-219,p[1]+'70',p[2]+'30');for(let j=0;j<4;j++)this.line(x+42,wallBase-87-j*9,x+200,wallBase-87-j*9,p[0],3);this.text(('0'+Math.floor(wx/255)).slice(-2),x+41,179,13,p[2]);}
  // Riveted load-bearing rib; cream and dark metal rather than an empty rectangular background.
  this.rect(x-7,83,25,wallBase-55,p[0],p[2]+'55');this.rect(x,105,6,wallBase-85,p[2]+'55');
  for(let y=131;y<wallBase-10;y+=64)this.rect(x+10,y,3,3,p[2]);
  this.rect(x+40,108,149,8,'#cfdec0');const glow=c.createRadialGradient(x+112,111,0,x+112,140,170);glow.addColorStop(0,'#c0dc9e22');glow.addColorStop(1,'#c0dc9e00');c.fillStyle=glow;c.fillRect(x-70,85,365,280);
 }
 this.wallServices(r,wallBase,p);
 const floor=c.createLinearGradient(0,wallBase,0,810);floor.addColorStop(0,'#3c5045');floor.addColorStop(.6,'#233a30');floor.addColorStop(1,'#0c211d');c.fillStyle=floor;c.fillRect(0,wallBase,1440,810-wallBase);
 for(let yy=wallBase+18;yy<810;yy+=44){this.line(0,yy,1440,yy,'#b2b9a31a');this.line(0,yy+3,1440,yy+3,'#061e1799');}
 for(let x=-this.camera%128-128;x<1560;x+=128){this.line(x,wallBase,x+(x-720)*.25,810,'#829d7622',2);}
 this.rect(0,wallBase-5,1440,13,p[2]+'66');this.rect(0,wallBase+8,1440,8,p[0]);
 // Stencilled circulation bands occupy the floor, not UI space.
 this.rect(0,690,1440,3,p[3]+'80');this.rect(0,698,1440,1,p[3]+'60');
 for(let x=(-this.camera*.8)%330;x<1440;x+=330){this.text('KEEP CLEAR  //  '+r.sector,x,745,14,p[2]+'45');}
 if(r.view==='HYBRID'){
  for(const [left,right] of [[35,260],[r.w-260,r.w-35]]){const a=this.project(left,300),b=this.project(right,300);this.rect(a.x,a.y-18,b.x-a.x,36,'#455647bb');this.line(a.x,a.y-20,b.x,a.y-20,'#a7b18c',3);this.line(a.x,a.y+21,b.x,a.y+21,'#819876',3);this.text('PASSAGE',a.x+14,a.y+7,10,'#bbc29c');}
 }
 if(['hive','derelict'].includes(r.kit)){
  for(let i=0;i<18;i++){let x=i*139-this.camera;const y=130+(i%3)*21;c.strokeStyle='#192f27';c.lineWidth=25;c.beginPath();c.moveTo(x,wallBase+20);c.bezierCurveTo(x+180,320,x-80,y,x+130,y-80);c.stroke();c.strokeStyle='#70958155';c.lineWidth=3;c.stroke();}
 }
 if(r.kit==='apollo'){this.text('A P O L L O',r.w*.46-this.camera,172,35,'#d8d6ac','center');this.text('HUMAN CONSULTATION',r.w*.46-this.camera,193,10,'#b7c299','center');}
 if(['medical','hospital','pharmacy'].includes(r.kit)&&r.id!=='m_refuge'){this.rect(0,wallBase-50,1440,17,'#8b9f8050');this.text('+  SAN CRISTOBAL  /  MEDICAL FACILITY',r.w*.47-this.camera,216,15,'#d6d9b5','center');}
 if(['terminal','transit'].includes(r.kit)){this.rect(r.w*.5-this.camera-250,342,500,39,'#111e1a','#8b9c7766');this.text((r.sector+' / '+r.name.split(' · ').pop()).toUpperCase(),r.w*.5-this.camera,366,12,'#c4c8a5','center');}
 }
 doorway(e){drawMountedPortal(this,{...e,destinationName:ROOMS[e.destination].name.split(' · ').pop(),destinationDeck:ROOMS[e.destination].deck});}

 prop(p){const c=this.c,s=this.engine.s;let key=p.kind;const img=this.images['props/'+key+'.svg'];if(!img)return;const pt=this.project(p.x,p.y);if(pt.x< -320||pt.x>1740)return;const scale=.80+p.y/1300,dw=p.w*256/(bbox[key]||170)*scale;
 c.save();if(p.solid&&p.y>s.y&&Math.abs(p.x-s.x)<p.w/2+22&&p.y-s.y<135)c.globalAlpha=.48;if(p.kind==='poster'||p.kind==='light')pt.y=this.engine.room.view==='SIDE'?360:270;
 if(s.opened.includes(p.id)||(p.interactive==='supply'&&this.engine.refuges.collected(p.part))){c.translate(pt.x,pt.y);c.drawImage(img,-dw/2,-dw*232/256,dw,dw);c.fillStyle='#071911';c.fillRect(-dw*.22,-dw*.23,dw*.42,dw*.12);c.strokeStyle='#c6c2a2';c.lineWidth=3;c.beginPath();c.moveTo(-dw*.24,-dw*.28);c.lineTo(dw*.17,-dw*.39);c.stroke();}
 else c.drawImage(img,pt.x-dw/2,pt.y-dw*232/256,dw,dw);
 if(p.interactive==='refuge'){
  const st=this.engine.refuges.station(p.refuge),active=st.powered;
  this.rect(pt.x-18,pt.y-19,36,3,active?'#bbe2af':'#77624a');
  this.text(p.action==='power'?(active?'ACTIF':'RELAIS'):p.action==='install'?(st.installed?'INSTALLÉ':'PROJET'):(3-st.uses)+'/3 LOTS',pt.x,pt.y+16,9,active?'#cddfb9':'#cbb992','center');
 }
 if(p.interactive==='signal-charge'){const live=(s.systems[s.room]?.mode||0)===0;this.rect(pt.x-19,pt.y-20,38,4,live?'#c4deb0':'#966f52');this.text(live?'CHARGE / E':'HORS TENSION',pt.x,pt.y+17,9,live?'#c3d6b0':'#cdac81','center');}
 if(p.interactive==='rewire'){this.rect(pt.x-13,pt.y-28,26,4,['#adcfa4','#bf9d6a','#7bc9cd'][s.systems[s.room]?.mode||0]);this.text('CIRCUIT',pt.x,pt.y+13,9,'#b9cbb0','center');}
 if(s.optional.includes(p.interactive)){this.text('✓',pt.x,pt.y-55,18,'#b9cbb0','center');}
 if(p.interactive==='hide'&&s.hidden===p.id){this.rect(pt.x-8,pt.y-dw*.49,17,4,'#dbdabc');}
 c.restore();}
 character(e,kind){
 const c=this.c,s=this.engine.s;if(kind==='alien'&&e.mode==='vent')return;
 const pos=this.project(e.x,e.y);const contact=kind==='nora'||kind==='elias',low=kind==='amanda'?s.crouched:contact&&(e.careful||e.lowPose);const pose=low?'crouch':'walk',frame=kind==='amanda'?Math.floor(s.stats.distance/23)%8:contact?(e.stepDistance>0?Math.floor(e.travelled/23)%8:0):Math.floor(s.time*(kind==='alien'?7:4))%8;
 const eva=kind==='amanda'&&this.engine.room.exterior;let key=eva?`characters/eva_${pose}_${frame}.svg`:kind==='facehugger'?'characters/facehugger.svg':`characters/${kind}_${pose}_${frame}.svg`,img=this.images[key];if(!img)return;
 const scale=.80+e.y/1400,dh=(kind==='alien'?233:kind==='facehugger'?76:178)*(low?.86:1)*scale,dw=dh*(kind==='facehugger'?1:.8);
 c.save();c.translate(pos.x,pos.y);if((e.face||1)<0)c.scale(-1,1);c.drawImage(img,-dw*.5,-dh*(kind==='facehugger'?.86:.94),dw,dh);c.restore();
 if(kind==='human'&&e.hp>0&&e.disposition&&e.disposition!=='calm'){this.text(e.disposition==='warning'?'RECULEZ':'HOSTILE',pos.x,pos.y-172,10,e.disposition==='warning'?'#d6cb93':'#e7af82','center');}
 if(kind==='joe'&&e.stun>0){this.text('///',pos.x,pos.y-137,16,'#abdbdc','center');}
 }
 render(){
 const c=this.c,e=this.engine,s=e.s,r=e.room;
 const goalCam=clamp(s.x-650,0,Math.max(0,r.w-1440));this.camera=this.lastRoom===r.id?this.camera+(goalCam-this.camera)*.16:goalCam;this.lastRoom=r.id;
 this.background();drawSpatialArchitecture(this);this.protocolArchitecture();const ds=doors(s.room);for(const d of ds)this.doorway(d);
 for(const v of (r.exterior||r.kit==='derelict'?[]:r.vents)){const p=this.project(v.x,120);let y=r.view==='SIDE'?132:93;this.rect(p.x-51,y,102,31,'#182c24','#749179');for(let i=0;i<9;i++)this.line(p.x-42+i*10,y+5,p.x-42+i*10,y+26,'#526b56',2);
  if(s.alien.active&&s.alien.room===s.room&&s.alien.mode==='vent'){this.line(p.x+12,y+33,p.x+12,y+57+Math.sin(s.time*3)*7,'#bcc4a755',1);this.text('⋮',p.x+17,y+82,24,'#baccaa');}}
 this.hazardFloors();this.encounterArchitecture();this.refugeArchitecture();
 let drawables=r.props.map(p=>({y:p.y,run:()=>this.prop(p)}));
 if(!s.hidden)drawables.push({y:s.y,run:()=>this.character(s,s.actor==='Marlow'?'marlow':'amanda')});
 for(const en of s.enemies)if(en.room===s.room&&en.hp>0&&s.chapter>=en.min)drawables.push({y:en.y,run:()=>this.character(en,en.kind)});
 for(const n of s.encounters.rescues)if(n.room===s.room&&s.chapter>=e.encounters.spec(n.id).min)drawables.push({y:n.y,run:()=>this.rescueCharacter(n)});
 for(const en of s.enemies)if(en.room===s.room&&en.hp<=0&&en.kind==='human')drawables.push({y:en.y,run:()=>this.bodyCharacter(en)});
 if(s.alien.active&&s.alien.room===s.room&&s.alien.mode!=='vent')drawables.push({y:s.alien.y,run:()=>this.character(s.alien,'alien')});
 if(s.flags.lastThreat&&r.id==='t_return')drawables.push({y:300,run:()=>this.character({x:r.w-300,y:300,face:-1},'alien')});
 drawables.sort((a,b)=>a.y-b.y).forEach(p=>p.run());
 for(const d of s.decoys)if(d.room===s.room){const p=this.project(d.x,d.y);c.fillStyle=d.kind==='flare'?'#ffcb81':'#8be0d0';c.beginPath();c.arc(p.x,p.y-8,5,0,7);c.fill();const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,120);g.addColorStop(0,d.kind==='flare'?'#e2894155':'#7cd6c633');g.addColorStop(1,'#0000');c.fillStyle=g;c.fillRect(p.x-120,p.y-120,240,240);}
 this.flightObjects();
 for(const f of s.effects){if(f.room&&f.room!==s.room)continue;const p=this.project(f.x,f.y);if(f.kind==='flame'){c.save();c.translate(p.x,p.y-55);c.scale(f.face,1);let g=c.createLinearGradient(0,0,300,0);g.addColorStop(0,'#f3eed4');g.addColorStop(.25,'#ffc266dd');g.addColorStop(1,'#dd712b00');c.fillStyle=g;c.beginPath();c.moveTo(5,0);c.bezierCurveTo(100,-58,190,12,320,-20);c.bezierCurveTo(150,66,64,22,5,0);c.fill();c.restore();}else if(f.kind==='emp'){c.strokeStyle='#bae1da';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y-35,(1.2-f.life)*190,(1.2-f.life)*68,0,0,7);c.stroke();}else if(f.kind==='throw'){const t=1-f.life/.45,to=this.project(f.toX,f.toY),x=p.x+(to.x-p.x)*t,y=p.y+(to.y-p.y)*t-(1-t)*53-Math.sin(t*Math.PI)*72;this.rect(x-3,y-3,6,6,'#d6d6b3');}else if(f.kind==='shot'){const to=this.project(f.toX,f.toY);this.line(p.x,p.y-68,to.x,to.y-65,'#ead5a088',2);}}
 if(s.systems[s.room]?.mode===1){this.rect(0,95,1440,660,'#00090ebe');for(const d of ds){const dp=this.project(d.point.x,d.point.y);this.rect(dp.x-44,dp.y-190,88,4,'#a8cda577');}}
 if(s.torch&&s.tools.torch&&!s.hidden){const p=this.project(s.x,s.y);c.save();c.globalCompositeOperation='screen';c.translate(p.x,p.y-70);c.scale(s.face,1);let g=c.createLinearGradient(0,0,590,0);g.addColorStop(0,'#e7e7bc28');g.addColorStop(.6,'#e7e7bc18');g.addColorStop(1,'#f4f2bd00');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.lineTo(590,-100);c.lineTo(590,135);c.closePath();c.fill();c.restore();}
 // Foreground catwalk and hanging cables are decorative; never collide with the avatar.
 this.rect(0,788,1440,22,'#081914');if(!['planet','derelict'].includes(r.kit))this.line(0,788,1440,788,'#4a6653',3);
 const vig=c.createRadialGradient(720,405,270,720,405,880);vig.addColorStop(0,'#00000000');vig.addColorStop(.75,'#00120a22');vig.addColorStop(1,'#000906bf');c.fillStyle=vig;c.fillRect(0,0,1440,810);
 if(s.hidden){c.fillStyle='#030b0870';c.fillRect(0,0,1440,810);for(let i=0;i<5;i++)this.rect(0,125+i*130,1440,28,'#030c09bb');this.text('DANS LE CASIER',720,180,20,'#d4d1ae','center');this.text('B : retenir le souffle   |   E : sortir',720,209,12,'#c0c9ac','center');}
 if(s.tracker)this.tracker();else this.localMap();
 if(e.goal?.room===s.room){const p=this.project(e.goal.x,e.goal.y);if(p.x>20&&p.x<1420){this.line(p.x,p.y-86,p.x,p.y-60,'#dfdcb499');this.text('◇',p.x,p.y-91,21,'#dfdcb4','center');}}
 const target=e.targets()[0];if(target&&!s.dead&&!s.ended){const p=this.project(target.x,target.y);this.rect(p.x-19,p.y-50,38,25,'#051810dd','#a5c7a1');this.text('E',p.x,p.y-32,17,'#d3dbb3','center');}
 this.aimOverlay();this.pressureMarkers();
 if(s.alert>50){c.fillStyle='#b36c3620';c.fillRect(0,0,1440,6);}
 }
 wallServices(r,base,p){
 const c=this.c;
 // Wall-mounted services lie above the navigable band and never acquire collision boxes.
 const industrial=['maintenance','coolant','cargo','reactor','synthetic','engine','server','lab','apollo'].includes(r.kit);
 if(industrial){
  for(let i=0;i<3;i++){
   const y=235+i*17;this.line(-20,y,1460,y,'#102a22',10);this.line(-20,y-2,1460,y-2,p[2]+'44',2);
   for(let wx=75;wx<r.w;wx+=210){let x=wx-this.camera;this.rect(x,y-7,6,15,p[0]);this.rect(x-1,y-8,8,2,p[2]+'88');}
  }
  for(let wx=330;wx<r.w;wx+=540){const x=wx-this.camera;this.rect(x,290,113,72,'#182d26',p[2]+'55',2);for(let j=0;j<7;j++)this.line(x+13,300+j*7,x+99,300+j*7,'#060f0c',3);this.rect(x+95,350,7,4,'#a8bd88');}
 }else if(['medical','hospital','pharmacy'].includes(r.kit)){
  for(let wx=290;wx<r.w;wx+=610){let x=wx-this.camera;this.rect(x,242,87,42,'#d0d6b9cc');this.text('SAN CRISTOBAL',x+7,255,7,'#284038');this.text(r.kit==='pharmacy'?'CIRCUIT PROPRE':'SOINS / STAFF',x+7,272,8,'#284038');this.rect(x+126,248,37,51,'#6e8170','#c3d0ad88');this.rect(x+132,255,25,24,'#213c31');this.rect(x+134,260,20,3,'#b3c5a177');}
 }else if(['terminal','transit','shop','office','archive','marshal'].includes(r.kit)){
  for(let wx=370;wx<r.w;wx+=650){const x=wx-this.camera;this.rect(x,235,103,93,'#12281f','#91ab8177',2);this.text('SEEGSON',x+52,255,11,'#c5d2b1','center');this.line(x+18,270,x+83,270,'#829a73');this.text('TOMORROW',x+52,289,8,'#b1c5a3','center');this.text('TOGETHER',x+52,304,8,'#b1c5a3','center');}
 }
 if(r.addedV02||r.addedV03||r.addedV04||r.addedV05){const x=r.w*.52-this.camera;this.rect(x-187,101,374,31,'#071c14','#647f68');this.text(r.name.split(' · ')[1].toUpperCase(),x,122,13,'#c7d4b5','center');}
 }
 localMap(){
 const s=this.engine.s,r=this.engine.room,c=this.c,x=31,y=657,w=218,h=81;
 this.rect(x-8,y-23,w+16,h+45,'#071c17e8','#668d7866');this.text('SEEGSON / PLAN LOCAL',x,y-9,10,'#aabfaa');
 this.rect(x,y,w,h,'#16382e','#6c8d72');
 const px=v=>x+v/r.w*w,py=v=>y+(v-100)/300*h;
 for(const p of r.props)if(p.solid)this.rect(px(p.x-p.w/2),py(p.y-p.d/2),Math.max(2,p.w/r.w*w),Math.max(2,p.d/300*h),'#6c8574');
 for(const d of doors(r.id))this.rect(px(d.point.x)-2,py(d.point.y)-2,4,4,this.engine.sealed(d.id)?'#d9a266':available(d,s)?'#bdd3a8':'#776d4e');
 this.rect(px(s.x)-3,py(s.y)-3,6,6,'#e8dfb2');
 if(this.engine.goal?.room===s.room){const g=this.engine.goal;this.text('◇',px(g.x),py(g.y)+3,11,'#d8c89c','center');}
 this.text('NIVEAU '+r.deck+'  ·  '+r.view,x,y+h+14,9,'#a4b99e');
 }
 tracker(){
 const e=this.engine,s=e.s,c=this.c,x=29,y=607,w=258,h=137,range=e.signals.range;
 this.rect(x-5,y-5,w+10,h+30,'#13271bef','#a3b47b',2);this.rect(x,y,w,h,'#071c12','#6e985b');
 const cx=x+w/2,cy=y+h-8;
 c.save();c.beginPath();c.rect(x+2,y+2,w-4,h-4);c.clip();
 for(let rad=29;rad<180;rad+=30){c.strokeStyle='#6a925747';c.lineWidth=1;c.beginPath();c.arc(cx,cy,rad,Math.PI,2*Math.PI);c.stroke();}
 this.line(cx,y+3,cx,cy,'#82a36b44');const sweep=(e.signals.clock/e.signals.cfg.interval)*Math.PI+Math.PI;
 this.line(cx,cy,cx+Math.cos(sweep)*158,cy+Math.sin(sweep)*158,'#a7cd8270',2);
 for(const dot of e.detector()){const px=cx+dot.dx/range*117,py=cy-dot.distance/range*114;c.globalAlpha=.25+.75*dot.ttl/e.signals.cfg.echoLife;this.rect(px-3,py-3,6,6,'#e0f6a9');}c.restore();
 this.text('MOTION / '+(range===750?'750 U':'INTERFÉRENCES / 450 U'),x+8,y+17,10,'#bdd8a0');
 this.text('AUCUN ÉCHO ≠ AUCUNE PRÉSENCE',x+4,y+h+17,10,'#c7d3a6');
 } unproject(clientX,clientY){
  const b=this.canvas.getBoundingClientRect(),scale=Math.min(b.width/1440,b.height/810),ox=b.left+(b.width-1440*scale)/2,oy=b.top+(b.height-810*scale)/2;
  const x=(clientX-ox)/scale,y=(clientY-oy)/scale;if(x<0||x>1440||y<0||y>810)return null;
  return{x:x+this.camera,y:this.engine.room.view==='SIDE'?300:100+(y-410)/(this.engine.s.classic?.25:.63)};
 }
 protocolArchitecture(){
  const e=this.engine,s=e.s,r=e.room,c=this.c;
  if(r.id==='g_observation'){
   const x=530-this.camera,y=177,w=680,h=152;
   this.rect(x-10,y-10,w+20,h+23,'#172c28','#9ebbaa',3);this.rect(x,y,w,h,'#081f20');
   c.save();c.beginPath();c.rect(x+2,y+2,w-4,h-4);c.clip();
   const gradient=c.createLinearGradient(0,y,0,y+h);gradient.addColorStop(0,'#183932');gradient.addColorStop(1,'#061713');c.fillStyle=gradient;c.fillRect(x,y,w,h);
   for(let i=0;i<7;i++){this.line(x+i*108,y,x+i*108,y+h,'#44726355',3);this.rect(x+i*108+15,y+18,62,4,'#b4caae80');}
   this.line(x,y+117,x+w,y+117,'#718f7655',2);
   const a=s.alien;if(a.active&&a.room==='g_lab'&&a.mode!=='vent'&&!s.flags.detached){const image=this.images[`characters/alien_walk_${Math.floor(s.time*5)%8}.svg`];if(image){const px=x+35+(a.x/1910)*(w-70),py=y+132+(a.y-250)*.08;c.save();c.translate(px,py);c.scale(a.face||1,1);c.globalAlpha=.7;c.drawImage(image,-33,-91,66,98);c.restore();}}
   if(s.flags.detached){this.rect(x,y,w,h,'#020b0c');this.text('VOLUME DÉTACHÉ · AUCUNE LIAISON',x+w/2,y+86,16,'#b6b69c','center');}
   // Reflection is restrained so the actual creature remains readable.
   c.fillStyle='#a0c6a40a';c.beginPath();c.moveTo(x,y);c.lineTo(x+130,y);c.lineTo(x+310,y+h);c.lineTo(x+180,y+h);c.fill();c.restore();
   this.line(x+w/2,y,x+w/2,y+h,'#617e72',7);this.text('KG-348 / FENÊTRE DE CONTRÔLE',x+13,y-19,12,'#c0ceb0');
  }
  if(r.id==='g_airlock'){
   const x=730-this.camera;this.rect(x,195,415,143,'#0c221d','#9bb198',2);this.text('KG-348 / SÉCURITÉ DE SÉPARATION',x+16,218,12,'#c7d1b5');
   const a=s.alien,p=s.protocols.gemini;
   for(const [i,t,on]of [[0,'CONTACT AU SOL',a.room==='g_lab'&&a.mode!=='vent'&&a.active],[1,'SAS + CLAPETS',p.stage==='contained'||p.stage==='detached'],[2,'MODULE SÉPARÉ',p.stage==='detached']]){this.rect(x+17,236+i*28,9,9,on?'#bad79c':'#4c5848');this.text(t,x+42,245+i*28,11,on?'#d0d9b8':'#778c75');}
  }
  if(r.id==='a_samuels'){
   const xs=[1079,1322,783],m=s.protocols.samuels,ids=['C12_02','C12_03','C12_04'],labels=['D-01','C-02','P-03'];
   const cx=872-this.camera;this.rect(cx-169,153,338,103,'#112621','#8ea383',2);this.text('INTERFACE SAMUELS',cx,176,14,'#c2cdb0','center');this.text('D-01  →  C-02  →  P-03',cx,205,15,'#cdd2b2','center');
   this.rect(cx-140,225,280,6,'#2f4938');this.rect(cx-140,225,280*m.heat/100,6,m.heat>70?'#d8a465':'#9ac49a');
   for(let i=0;i<3;i++){const g=CONTENT.goals.find(g=>g.id===ids[i]),p=this.project(g.x,g.y),off=m.order.includes(ids[i]),x=xs[i]-this.camera;this.line(cx,259,x,289,off?'#667468':'#bdbb7477',2);this.line(x,289,x,p.y-81,off?'#667468':'#bdbb7477',2);this.rect(p.x-35,p.y-103,70,20,'#10271e',off?'#a9bf90':'#899c73');this.text(labels[i]+(off?' ✓':''),p.x,p.y-89,11,'#d9ddba','center');}
  }
  if(r.id==='n_coolant'){
   const x=665-this.camera;this.rect(x,195,372,103,'#112c28','#b5b698',2);this.text('RETOUR / CIRCUIT PRIMAIRE',x+18,218,12,'#d1d6b9');
   this.line(x+22,246,x+324,246,'#9eac8177',5);this.rect(x+168,232,27,28,s.protocols.anesidora.stabilized?'#9cc089':'#bfa06a');this.text(s.protocols.anesidora.stabilized?'ROBINET FERMÉ · RÉSERVE ÉPUISÉE':'ROBINET DE SECOURS · +40 S',x+18,279,11,'#d1cba9');
  }
  // Specific floor-wayfinding makes the new rooms legible without a menu.
  if(r.addedV03&&!r.exterior){const pt=this.project(350,375);this.line(70-this.camera,pt.y,r.w-70-this.camera,pt.y,'#b7ad7255',3);for(let wx=400;wx<r.w-100;wx+=470)this.text(r.sector==='ANESIDORA'?'→ SHUTTLE':'→ KG-348',wx-this.camera,pt.y+26,14,'#c4bc8877');}
 }
 hazardFloors(){
  const e=this.engine,c=this.c;
  for(const h of CONTENT.hazards){if(h.room!==e.s.room)continue;const phase=e.protocols.hazardPhase(h),a=this.project(h.x-h.w/2,h.y-h.d/2),b=this.project(h.x+h.w/2,h.y+h.d/2);if(phase==='off')continue;
   this.rect(a.x,a.y,b.x-a.x,Math.max(14,b.y-a.y),phase==='warning'?'#c7ad4833':'#e2aa7338',phase==='warning'?'#c3bc76':'#e0b683',1.4);
   const p=this.project(h.x,h.y);this.text(phase==='warning'?'PRESSION ↑':'VAPEUR',p.x,p.y+23,10,'#dcc8a4','center');
   if(phase==='on'){const reduced=globalThis.document?.body.classList.contains('reduced-effects');for(let i=0;i<8;i++){const t=e.s.time*(reduced?.25:1)+i*.6,px=p.x+Math.sin(t*1.8+i)*h.w*.36,py=p.y-12-(t%2.4)*54,rad=14+(t%2.4)*12;const g=c.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,'#d8daca24');g.addColorStop(1,'#ccd6c600');c.fillStyle=g;c.fillRect(px-rad,py-rad,rad*2,rad*2);}}
  }
 }
 aimOverlay(){
  const e=this.engine,a=e.aim;if(!a)return;const c=this.c,plan=e.throwPlan(a.target);if(!plan)return;
  c.save();c.setLineDash([5,5]);c.strokeStyle=plan.blocked?'#e0b174':'#c5d9bb';c.lineWidth=2;c.beginPath();
  plan.points.forEach((q,i)=>{const p=this.project(q.x,q.y),t=i/Math.max(1,plan.points.length-1),y=p.y-(1-t)*53-Math.sin(t*Math.PI)*72;i?c.lineTo(p.x,y):c.moveTo(p.x,y);});c.stroke();c.setLineDash([]);
  const p=this.project(plan.point.x,plan.point.y);c.beginPath();c.ellipse(p.x,p.y,16,6,0,0,Math.PI*2);c.stroke();
  if(plan.blocked){this.line(p.x-8,p.y-20,p.x+8,p.y-4,'#e0b174',2);this.line(p.x+8,p.y-20,p.x-8,p.y-4,'#e0b174',2);}
  this.rect(p.x-80,p.y+12,160,21,'#0d211de8');this.text((plan.blocked?'OBSTACLE · ':'')+Math.round(plan.distance)+' / 360',p.x,p.y+25,11,plan.blocked?'#e4b779':'#d0ddba','center');c.restore();
 }

 flightObjects(){
  const s=this.engine.s,c=this.c;
  for(const o of s.projectiles){if(o.room!==s.room)continue;const p=this.project(o.x,o.y),t=o.stage==='flight'?o.elapsed/o.duration:1;
   const height=o.stage==='flight'?(1-t)*53+Math.sin(t*Math.PI)*72:5;
   c.fillStyle='#030b0899';c.beginPath();c.ellipse(p.x,p.y,8,3,0,0,Math.PI*2);c.fill();
   c.save();c.translate(p.x,p.y-height);c.rotate(o.stage==='flight'?t*8:0);this.rect(-5,-4,10,8,o.kind==='emp'?'#a9dbe0':o.kind==='flare'?'#e5c29b':'#c7d3ad','#16342c',1);
   this.rect(-3,-2,6,2,o.kind==='emp'?'#376c80':'#4b7358');c.restore();
   if(o.stage==='armed'){const pulse=1-o.fuse/CONTENT.flight.fuse[o.kind];c.strokeStyle='#c7dcc2';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,9+pulse*9,4+pulse*3,0,0,Math.PI*2);c.stroke();}
  }
 }
 pressureMarkers(){
  const e=this.engine,s=e.s,c=this.c;
  for(const tank of e.room.props.filter(p=>p.interactive==='oxygen')){
   const p=this.project(tank.x,tank.y),used=s.lifeSupport.used.includes(tank.id);
   this.rect(p.x-32,p.y-111,64,20,used?'#2b2922':'#0b2925',used?'#8c866e':'#98c8b6');
   this.text(used?'VIDE':'O₂ +65',p.x,p.y-97,11,used?'#aaa28b':'#d7e8cc','center');
  }
  const a=s.lifeSupport.airlock;if(a&&a.room===s.room){
   const edge=doors(s.room).find(x=>x.id===a.id);if(!edge)return;const p=this.project(edge.point.x,edge.point.y);
   const close=a.stage==='cycling'?1-a.remaining/CONTENT.lifeSupport.airlockSeconds:1;
   this.rect(p.x-47,p.y-148,94,148*close,'#70887888');
   this.rect(p.x-60,p.y-179,120,24,'#071d19','#b2bea0');this.text(a.stage==='ready'?'PRESSION OK':a.remaining.toFixed(1)+' s',p.x,p.y-162,12,'#dfdec0','center');
  }
 }

 bodyCharacter(n){const p=this.project(n.x,n.y),c=this.c,img=this.images['characters/'+(n.id==='nora'||n.id==='elias'?n.id:'human')+'_walk_0.svg'];if(!img)return;c.save();c.translate(p.x,p.y-8);c.rotate(-Math.PI/2);c.globalAlpha=.65;c.drawImage(img,-27,-84,56,95);c.restore();}
 rescueCharacter(n){
  const e=this.engine,s=e.s,p=this.project(n.x,n.y),spec=e.encounters.spec(n.id),c=this.c;
  if(n.status==='sheltered'){this.rect(p.x-32,p.y-83,64,72,'#0b201b','#60785e');this.line(p.x-25,p.y-64,p.x+25,p.y-64,'#889e7355',3);this.rect(p.x-12,p.y-47,24,12,'#728e6e');this.text('APPEL / '+spec.name.split(' ')[0].toUpperCase(),p.x,p.y-99,10,'#c3d0a9','center');return;}
  if(n.status==='hiding'){this.text(n.exposed?'CACHE COMPROMISE':'ATTEND DANS LE CASIER',p.x,p.y-116,9,n.exposed?'#e2b180':'#b6c7a5','center');return;}
  if(n.status==='dead'||n.status==='down'){this.bodyCharacter(n);if(n.status==='down'){this.rect(p.x-77,p.y-63,154,25,'#31251aea','#c7a777');this.text('SOINS · '+Math.ceil(n.bleed)+' s',p.x,p.y-45,12,'#e1c99b','center');}}
  else this.character(n,n.id);
  if(n.status!=='dead'){this.text(spec.name.split(' ')[0].toUpperCase()+(n.status==='rescued'?' · AU REFUGE':n.careful?' · PAS PRUDENT':''),p.x,p.y-185,10,'#d5e0c5','center');this.rect(p.x-23,p.y-176,46,3,'#172c21');this.rect(p.x-23,p.y-176,46*n.health/70,3,'#bfd4aa');}
 }
 encounterArchitecture(){
  const e=this.engine,s=e.s,r=e.room,c=this.c;
  for(const p of r.props.filter(p=>p.interactive==='alarm')){const xy=this.project(p.x,p.y),a=s.encounters.alarms[p.id],on=a?.remaining>0;this.rect(xy.x-78,xy.y-130,156,23,on?'#3f2c21':'#142b23',on?'#dbb177':'#819373');this.text(on?'SIRÈNE · '+Math.ceil(a.remaining)+' s':'SIRÈNE DE SERVICE',xy.x,xy.y-114,10,on?'#e4c58f':'#c4d0ae','center');if(on){this.rect(0,105,1440,4,'#cca56877');this.text('SIGNAL ACOUSTIQUE LOCAL',720,137,11,'#e0bf83','center');}}
  if(['m_refuge','d_refuge'].includes(r.id)){
   const x=990-this.camera;this.rect(x-140,174,440,126,'#132b23','#829f7d',2);this.text('POSTE DE REPLI / ACCUEIL',x+80,202,17,'#d3dfbc','center');this.text('ATTENDRE LE CONTACT · CONFIRMER AVEC E',x+80,228,11,'#a9c19a','center');const n=s.encounters.rescues.find(n=>e.encounters.spec(n.id).home===r.id);this.text(n?.status==='rescued'?'PRÉSENCE CONFIRMÉE':'AUCUNE ARRIVÉE CONFIRMÉE',x+80,285,12,n?.status==='rescued'?'#d0deb3':'#b9ac83','center');
   const pt=this.project(1150,350);c.strokeStyle='#b8cc8c88';c.setLineDash([7,6]);c.strokeRect(pt.x-48,pt.y-13,96,25);c.setLineDash([]);
  }
 }

 refugeArchitecture(){
  const spec=CONTENT.refuges.find(r=>r.room===this.engine.s.room);if(!spec)return;
  const status=this.engine.refuges.status(spec.id),x=280-this.camera;
  this.rect(x,190,210,109,'#0e251e','#6a947e');
  this.text(spec.id==='medical'?'POSTE MÉDICAL':'ATELIER DE RELÈVE',x+14,214,14,'#cad9b1');
  this.text(status.powered?'CIRCUIT SOUS TENSION':'RELAIS HORS TENSION',x+14,238,11,status.powered?'#bbddac':'#c8b58a');
  this.text(status.installed?'PROJET INSTALLÉ':'COLIS '+status.parts.filter(p=>p.collected).length+' / 2 À RAPPORTER',x+14,261,11,'#b9cbb1');
  this.text('SERVICES '+status.remaining+'/3 · DÉTAILS J',x+14,284,10,'#9eb6a2');
 }

}
