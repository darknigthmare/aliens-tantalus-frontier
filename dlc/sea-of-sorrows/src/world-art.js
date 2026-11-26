/* Authored geometric scenery, separate from collision and narrative data.
 * Every dressing placement lives outside the playable strip. Lighting is decorative:
 * gameplay perception uses core.js, never framebuffer brightness. */
(function(root){'use strict';
const R=root.SoSRenderer.prototype,clamp=root.SoSCore.clamp;
const organic=k=>['alien','silica','hive','queen','ossuary','ruins','derelict'].includes(k);
const palette=k=>k==='sand'?['#343739','#7c7461','#4b4538','#c2ac75']:
 ['silica','alien'].includes(k)?['#171b1e','#655843','#332e26','#d0a461']:
 ['hive','queen'].includes(k)?['#0d151b','#344339','#1a2a27','#8ba99a']:
 ['ruins','ossuary','derelict'].includes(k)?['#141e27','#415456','#283c40','#839c9d']:
 ['medical','decon'].includes(k)?['#17232d','#425d62','#263d43','#a7d5cd']:
 ['power','workshop','lift','stairs'].includes(k)?['#151f29','#445255','#2a353d','#bbaa74']:
 ['home','office'].includes(k)?['#1a222a','#5f6258','#3a443e','#ccc3a0']:
 ['hangar','ship','armory'].includes(k)?['#101e2d','#3e5562','#253948','#b2ccd0']:
 ['#16242b','#425952','#293d38','#a1beaa'];
R.pickTarget=function(cx,cy){
 const rect=this.canvas.getBoundingClientRect(),x=(cx-rect.left)/rect.width*this.W,y=(cy-rect.top)/rect.height*this.H,g=this.game;
 this.hoverTarget=null;
 const candidates=g.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured').sort((a,b)=>g.zFor(b)-g.zFor(a));
 for(const e of candidates){const q=this.pos(e.x,g.zFor(e)),s=this.unit*(.85+g.zFor(e)*.33)*(e.kind==='queen'?2.23:1),f=e.facing||1;
  const minX=q.x+(f>0?-52:-60)*s,maxX=q.x+(f>0?60:52)*s,ht=(e.kind==='facehugger'?36:160)*s;
  if(x>=minX&&x<=maxX&&y>=q.y-ht&&y<=q.y+10){this.hoverTarget=e.id;return{x:e.x,z:g.zFor(e)};}}
 for(const w of g.rs.weakpoints){if(w.hp<=0)continue;const q=this.pos(w.x,g.zFor(w));if(Math.abs(x-q.x)<36&&y>q.y-165*this.unit&&y<q.y+12){this.hoverTarget=w.id||"attache-"+g.rs.weakpoints.indexOf(w);return{x:w.x,z:g.zFor(w)};}}
 return this.mouse(cx,cy);
};
R.backdrop=function(t){
 const c=this.ctx,{W,H,camera}=this,r=this.game.room,P=palette(r.kind),sand=r.kind==='sand',org=organic(r.kind);
 const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,P[0]);gr.addColorStop(.6,P[1]);gr.addColorStop(1,P[2]);c.fillStyle=gr;c.fillRect(0,0,W,H);
 if(sand){
  const sun=c.createRadialGradient(W*.77,H*.23,4,W*.77,H*.23,H*.35);sun.addColorStop(0,'#e3c88a44');sun.addColorStop(1,'#c4b78c00');c.fillStyle=sun;c.fillRect(0,0,W,H*.65);
  this.ellipse(W*.77,H*.23,H*.043,H*.043,'#c8bc997a');
  for(let l=0;l<4;l++){const pts=[[-90,H*.7]];for(let x=-90;x<W+100;x+=22){const wx=x+camera*(.065+l*.055);pts.push([x,H*(.42+l*.055)+Math.sin(wx*.005+l*1.73)*H*.035+Math.cos(wx*.013+l)*H*.015]);}pts.push([W+100,H*.8]);this.path(pts,['#60655e','#575b51','#4b5148','#3d443e'][l]);}
  for(let i=-1;i<10;i++){const x=i*380-camera*.19;this.rect(x,H*.31,65,H*.18,'#344340');this.rect(x+8,H*.285,8,H*.04,'#3b4a46');this.rect(x+67,H*.38,102,H*.12,'#354640');this.line(x+96,H*.38,x+111,H*.28,'#798379',1);for(let k=0;k<5;k++){this.rect(x+10+k*10,H*.375,3,3,'#b9d2ae55');this.line(x,H*.32+k*H*.025,x+65,H*.32+k*H*.025,'#80928326');}}
  for(let i=0;i<6;i++)this.ellipse((i*313-camera*.05+(this.reduced?0:t*3))%(W+250),H*(.22+i*.031),200,9,'#ddd0a512');
 }else if(org){
  // Continuous large spans are behind the gameplay wall, not isolated pillars in the walking strip.
  for(let l=0;l<2;l++)for(let i=-2;i<10;i++){
   const x=i*(l?430:590)-camera*(l?.43:.17),base=H*.625,ht=H*(l?.63:.51);c.beginPath();c.moveTo(x-70,base);c.bezierCurveTo(x-15,base-ht*.75,x+80,base-ht,x+230,base-ht*.92);c.bezierCurveTo(x+410,base-ht*.67,x+405,base-ht*.28,x+440,base);c.strokeStyle=l?'#233833':'#17282a';c.lineWidth=(l?33:54)*this.unit;c.stroke();c.strokeStyle=P[3]+'37';c.lineWidth=3*this.unit;c.stroke();
   for(let j=0;j<4;j++){c.beginPath();c.moveTo(x-55+j*8,base);c.bezierCurveTo(x+40+j*9,base-ht*.6,x+80+j*13,base-ht*.85,x+236+j*8,base-ht*.9);c.strokeStyle=P[3]+'15';c.lineWidth=2;c.stroke();}}
  for(let i=0;i<30;i++){const x=(i*173.7-camera*.19)%(W+140);this.ellipse(x,H*(.12+(i%5)*.086),1.5,1.5,P[3]+'55');}
  if(r.kind==='silica'){for(let i=-1;i<6;i++){const x=i*670-camera*.11;c.beginPath();c.moveTo(x,H*.63);c.bezierCurveTo(x+70,H*.1,x+180,H*.25,x+195,-40);c.strokeStyle='#cfb7780b';c.lineWidth=50;c.stroke();}}
 }else{
  for(let i=-2;i<15;i++){const x=i*300-camera*.34;
   this.rect(x,0,294,H*.61,P[0],P[3]+'25');this.rect(x+13,H*.09,268,H*.32,'#1b2d35',P[3]+'35');
   this.rect(x+24,H*.106,246,H*.011,P[3]+'23');
   if(['ship','office','home'].includes(r.kind)){
    this.rect(x+40,H*.15,214,H*.19,'#0a1c27','#6e898b');for(let k=0;k<16;k++){const xx=x+43+(k*51)%202,yy=H*(.17+(k%7)*.021);this.rect(xx,yy,k%4===0?2:1,1,'#bdd8d8');}
    if(r.id==='s39'){this.ellipse(x+167,H*.25,H*.062,H*.078,'#83967a');this.ellipse(x+152,H*.244,H*.028,H*.05,'#69816c');if(this.game.state.flags.strike_seen)this.ellipse(x+190,H*.236,7,9,'#ffe0a8');}
   }else{for(let j=0;j<7;j++)this.rect(x+24+j*34,H*.15,20,H*.17,j%3?'#283d41':'#314e50');}
   for(let j=0;j<5;j++)this.line(x+20,H*(.46+j*.017),x+260,H*(.46+j*.017),P[3]+'23',2);
   for(const xx of [x+7,x+288])for(const yy of [H*.07,H*.38,H*.56])this.ellipse(xx,yy,2.2,2.2,P[3]+'60');
  }
  this.rect(0,0,W,H*.045,'#0b161e');this.line(0,H*.047,W,H*.047,P[3]+'77',2);
 }
};
R.floor=function(){const c=this.ctx,{W,H,camera}=this,r=this.game.room,P=palette(r.kind),sand=r.kind==='sand',org=organic(r.kind),y=H*.605;
 const grad=c.createLinearGradient(0,y,0,H);grad.addColorStop(0,P[1]);grad.addColorStop(.3,P[2]);grad.addColorStop(1,'#111e23');c.fillStyle=grad;c.fillRect(0,y,W,H-y);
 if(org){
  for(let i=-2;i<25;i++){const x=i*105-camera%105,yy=H*(.65+(i%5)*.055);c.beginPath();c.moveTo(x-140,yy+40);c.bezierCurveTo(x-50,yy-11,x+85,yy+12,x+260,yy-20);c.strokeStyle=P[3]+'16';c.lineWidth=i%3?2:5;c.stroke();}
  for(let i=0;i<30;i++){const x=(i*159.31-camera)%(W+150),yy=H*(.64+(i%7)*.047);this.ellipse(x,yy,31+(i%4)*8,3,P[3]+'12');}
 }else if(sand){for(let i=0;i<110;i++){const x=(i*93.31-camera*.93)%(W+100),yy=H*(.62+((i*17)%36)/100);this.line(x,yy,x+25+i%7*5,yy-2,'#dbcfac17',1);}for(let i=0;i<35;i++){const x=(i*187.1-camera)%(W+100);this.path([[x,H*(.65+i%7*.04)],[x+8,H*(.648+i%7*.04)],[x+15,H*(.65+i%7*.04)]],'#172a2780');}
 }else{
  for(let i=-2;i<22;i++){const x=i*120-camera%120;this.line((x-W/2)*.8+W/2,y,x,H,'#b2c8c822',1);}
  for(let i=0;i<11;i++){const yy=y+(H-y)*Math.pow(i/10,1.55);this.line(0,yy,W,yy,'#a7c7cf1a',1);}
  this.rect(0,H*.618,W,H*.012,'#0b2028');for(let i=-1;i<70;i++){const x=i*27-camera%27;this.line(x,H*.619,x+11,H*.628,'#97b7ba36',2);}
  // The marked wall service strip remains outside the character's minimum depth.
  for(let i=-2;i<10;i++){const x=i*230-camera%230;this.rect(x,H*.649,66,3,'#c7b26840');}
 }
 this.line(0,y,W,y,P[3]+'39',2);
};
R.architecture=function(t){const {W,H,camera,unit:u}=this,r=this.game.room,P=palette(r.kind),c=this.ctx;
 if(!organic(r.kind)&&r.kind!=='sand'){
  for(let j=0;j<3;j++){const y=H*(.085+j*.025);this.line(0,y,W,y,'#0b1b24',10*u);this.line(0,y-2,W,y-2,P[3]+'30',2);}
  for(let i=-1;i<Math.ceil(r.width/500);i++){const x=i*500-camera;this.rect(x-12,0,24,H*.615,'#1a3037','#60787b50');this.rect(x-4,0,8,H*.615,'#87928b23');this.rect(x-20,H*.60,40,H*.02,'#536969');}
 }
 for(const ratio of r.lightPositions){const x=r.width*ratio-camera;if(x<-220||x>W+220)continue;const y=H*(organic(r.kind)||r.kind==='sand'?.4:.16);this.rect(x-29,y-8,58,13,'#19292e','#6b8180');this.rect(x-23,y-5,46,6,P[3]);const g=c.createRadialGradient(x,y,3,x,y,210*u);g.addColorStop(0,P[3]+'2c');g.addColorStop(1,P[3]+'00');c.fillStyle=g;c.fillRect(x-210*u,y-170*u,420*u,410*u);
  if(organic(r.kind)||r.kind==='sand'){this.line(x,y+5,x,H*.62,'#304744',5);this.line(x,H*.60,x-19,H*.626,'#87968b',2);this.line(x,H*.60,x+19,H*.626,'#87968b',2);}
 }
 if(!organic(r.kind)&&r.kind!=='sand'){const x=r.width*.48-camera;this.rect(x-107,H*.30,214,41*u,'#162d35','#7c9291');this.text(r.floorLabel||r.id.toUpperCase(),x,H*.30+25*u,15*u,P[3],'center');}
};
R.worldDressing=function(t,front){const r=this.game.room,c=this.ctx;for(const a of r.dressing||[]){if((a.layer==='foreground')!==front)continue;const x=a.x-this.camera;if(x<-550||x>this.W+550)continue;const y=front?this.H*1.01:this.H*.615;c.save();c.translate(x,y);c.scale(this.unit*(a.scale||1),this.unit*(a.scale||1));if(front)c.globalAlpha=.26;this.decor(a.kind,t);c.restore();}};
R.decor=function(kind,t){const c=this.ctx,P=palette(this.game.room.kind),metal='#344951',edge='#7c9190',dark='#142731',lite=P[3];
 const panel=(x,y,w,h)=>{this.rect(x,y,w,h,metal,edge);this.rect(x+7,y+7,w-14,h-14,dark,edge+'50');for(const xx of[x+4,x+w-4])for(const yy of[y+4,y+h-4])this.ellipse(xx,yy,1.6,1.6,lite);};
 const screen=(x,y,w,h)=>{panel(x,y,w,h);this.rect(x+8,y+8,w-16,h-16,'#132d32');for(let j=0;j<5;j++)this.line(x+13,y+14+j*6,x+w-15-(j%3)*8,y+14+j*6,lite+'aa',1);};
 const cylinder=(x,y,w,h)=>{this.rect(x-w/2,y-h,w,h,metal,edge);this.ellipse(x,y-h,w/2,7,'#a1b1a4');this.ellipse(x,y,w/2,7,'#2b4344');this.line(x-w*.23,y-h+5,x-w*.23,y-8,lite+'77',3);this.rect(x-w*.5-4,y-h*.69,w+8,9,dark);};
 const wheel=(x,y,rad=23)=>{this.ellipse(x,y,rad,rad,dark);this.ellipse(x,y,rad*.7,rad*.7,edge);this.ellipse(x,y,rad*.35,rad*.35,metal);};
 const rib=(x,ht=285)=>{c.beginPath();c.moveTo(x-30,0);c.bezierCurveTo(x+38,-ht*.4,x-33,-ht*.88,x+20,-ht);c.bezierCurveTo(x+101,-ht*.85,x+30,-ht*.23,x+71,0);c.closePath();c.fillStyle='#253c37';c.fill();c.strokeStyle=lite+'80';c.lineWidth=2;c.stroke();for(let j=0;j<5;j++){c.beginPath();c.moveTo(x-20+j*18,0);c.quadraticCurveTo(x+52,-ht*.5,x+20+j*4,-ht*.93);c.strokeStyle=lite+'33';c.lineWidth=2;c.stroke();}};
 switch(kind){
 case 'checkpoint':case 'fence':
  for(let i=0;i<4;i++){this.rect(-175+i*100,-158,6,158,edge);for(let j=0;j<9;j++)this.line(-170+i*100,-150+j*16,-74+i*100,-145+j*16,lite+'22',1);}if(kind==='checkpoint'){panel(-25,-155,95,85);this.text('ICC',22,-118,24,lite,'center');this.text('SECTEUR 04',22,-95,8,lite,'center');}break;
 case 'drill':
  this.line(-155,0,-91,-330,metal,22);this.line(158,0,89,-330,metal,22);this.line(-93,-330,93,-330,edge,18);for(let j=0;j<6;j++)this.line(-135+j*7,-j*50,135-j*7,-j*50-46,edge,5);panel(-40,-268,80,156);this.line(0,-110,0,10,dark,24);for(let j=0;j<9;j++)this.line(-13,-j*12,13,-j*12-8,lite,3);panel(-190,-42,94,38);wheel(-154,0,20);break;
 case 'reel':case 'cable':
  wheel(-42,-64,56);this.rect(-110,-10,134,10,metal);this.line(-105,0,-58,-65,edge,8);this.line(12,0,-30,-65,edge,8);for(let j=0;j<5;j++)this.ellipse(-42,-64,45-j*7,45-j*7,'#14282c18');c.beginPath();c.moveTo(10,-55);c.bezierCurveTo(78,-57,38,12,151,-3);c.strokeStyle=kind==='cable'?lite:edge;c.lineWidth=5;c.stroke();break;
 case 'medical':case 'triage':
  panel(-123,-64,172,44);this.path([[-128,-66],[33,-66],[65,-48],[-118,-48]],'#c2d5cf',edge);this.rect(-118,-72,30,8,'#d4dbcc');for(const x of[-105,35]){this.line(x,-21,x,-5,edge,7);wheel(x,0,9);}screen(80,-169,83,64);this.line(120,-106,120,-4,edge,6);this.line(95,-3,145,-3,edge,5);if(kind==='triage'){c.beginPath();c.moveTo(110,-117);c.bezierCurveTo(30,-120,104,-39,15,-65);c.strokeStyle='#a9c5b5';c.lineWidth=3;c.stroke();}break;
 case 'locker':case 'armory':
  panel(-156,-193,312,193);for(let j=0;j<4;j++){panel(-144+j*76,-184,65,171);this.rect(-93+j*76,-102,4,20,lite);for(let k=0;k<3;k++)this.line(-134+j*76,-170+k*5,-98+j*76,-170+k*5,lite+'55',2);if(kind==='armory'){this.line(-125+j*76,-144,-125+j*76,-38,edge,9);this.rect(-126+j*76,-82,25,8,edge);this.rect(-132+j*76,-47,15,15,dark);}}break;
 case 'office':case 'briefing':case 'terminal':
  panel(-156,-72,308,13);for(const x of[-138,130])this.rect(x,-58,10,58,metal);screen(-135,-150,109,73);screen(-14,-142,101,65);this.rect(98,-88,40,15,'#b7bfb2');this.rect(-105,-57,47,47,metal,edge);if(kind==='briefing'){this.rect(-48,-224,198,55,dark,edge);this.text('EXPÉDITION / 178',50,-192,13,lite,'center');}break;
 case 'home':
  panel(-170,-92,280,77);this.rect(-158,-78,109,48,'#657873',edge);this.rect(-37,-78,136,48,'#566b65',edge);this.rect(-165,-18,10,18,metal);this.rect(85,-18,10,18,metal);panel(154,-62,69,57);this.line(185,-62,185,-156,edge,4);this.path([[161,-156],[170,-194],[200,-194],[211,-156]],'#a9b49e');break;
 case 'wash':case 'filters':case 'valve':
  for(let j=0;j<3;j++){cylinder(-75+j*67,-7,43,148+j%2*32);this.line(-75+j*67,-159,-75+j*67,-203,edge,9);}this.line(-80,-204,100,-204,edge,9);wheel(127,-129,25);this.line(100,-202,127,-129,metal,10);panel(-123,-58,48,50);break;
 case 'seal-equipment':case 'quarantine-instruments':
  panel(-147,-144,255,140);for(let j=0;j<3;j++){cylinder(-111+j*62,-12,38,86);this.line(-111+j*62,-107,-111+j*62,-168,edge,6);}screen(86,-124,100,89);this.line(-117,-168,140,-168,metal,10);this.text(kind==='quarantine-instruments'?'ANALYSE / QUARANTAINE':'PRESSION / FILTRATION',0,-193,11,lite,'center');break;
 case 'dropship':case 'landing':
  this.path([[-270,-40],[-217,-162],[-64,-224],[157,-211],[304,-131],[336,-56],[240,-37]],'#364c56',edge,3);this.path([[105,-192],[162,-190],[261,-135],[106,-131]],'#122f3d',edge,2);panel(-195,-161,181,121);this.rect(-181,-147,151,102,'#10252b');this.path([[-184,-42],[-28,-42],[48,0],[-231,0]],'#65766e',edge,2);for(let j=0;j<4;j++)this.line(-211+j*8,-j*9,35-j*15,-j*9,dark,2);this.line(-246,-50,-256,0,edge,12);this.line(261,-49,275,0,edge,12);this.rect(-149,-214,163,7,lite+'40');this.text('SERVICE COLONIAL',185,-88,10,lite,'center');break;
 case 'cargo':case 'battery':
  for(let j=0;j<3;j++){panel(-154+j*105,-73-j%2*24,96,70+j%2*24);this.rect(-112+j*105,-66-j%2*24,12,60+j%2*24,'#a9a57a');this.text(kind==='battery'?'CELL':'ICC',-106+j*105,-26,10,dark,'center');}break;
 case 'antenna':
  this.line(0,0,0,-305,edge,10);this.line(-65,0,0,-182,metal,8);this.line(65,0,0,-182,metal,8);c.save();c.translate(0,-244);c.rotate(-.42);this.ellipse(0,0,70,39,'#8b9d98');this.ellipse(0,-5,61,32,'#364e55');this.line(0,-6,0,-55,edge,3);c.restore();panel(36,-86,100,83);screen(47,-75,77,45);this.ellipse(0,-310,5,5,'#d8ab72');break;
 case 'hoist-drive':case 'winch':
  panel(-140,-137,280,98);wheel(-58,-95,48);wheel(43,-95,33);this.line(-58,-145,-58,-320,edge,5);this.line(43,-132,43,-320,edge,4);this.rect(-105,-34,21,34,metal);this.rect(100,-34,21,34,metal);screen(109,-129,71,73);this.text('TREUIL / MOTORISATION',0,-175,10,lite,'center');break;
 case 'workbench':
  panel(-155,-79,310,15);this.rect(-141,-64,19,64,metal);this.rect(122,-64,19,64,metal);panel(-135,-61,71,57);this.rect(74,-103,48,25,edge);this.rect(91,-115,11,37,metal);this.line(-112,-238,-112,-172,edge,3);this.rect(-161,-168,258,10,metal);for(let j=0;j<9;j++){this.line(-149+j*26,-148,-149+j*26,-119,edge,4);this.line(-153+j*26,-145,-145+j*26,-141,edge,3);}break;
 case 'generator':case 'pump':
  panel(-163,-171,213,162);cylinder(89,-6,76,135);wheel(-58,-91,53);for(let j=0;j<8;j++){const a=j*Math.PI/4+(this.reduced?0:t*.18);this.line(-58,-91,-58+Math.cos(a)*43,-91+Math.sin(a)*43,edge,3);}for(let j=0;j<4;j++)this.rect(-140+j*23,-153,12,28,edge);this.line(96,-141,148,-192,metal,19);this.line(146,-189,221,-189,edge,15);screen(128,-95,61,64);break;
 case 'carene':
  c.beginPath();c.moveTo(-520,0);c.bezierCurveTo(-400,-307,215,-427,580,0);c.closePath();c.fillStyle='#23383d';c.fill();c.strokeStyle='#91a4a1';c.lineWidth=8;c.stroke();for(let j=0;j<11;j++){const xx=-440+j*88;c.beginPath();c.moveTo(xx,0);c.quadraticCurveTo(xx-45,-185,135,-280);c.strokeStyle='#81948c44';c.lineWidth=8;c.stroke();}this.ellipse(105,-65,67,72,dark);break;
 case 'rib':case 'breach':case 'membrane':
  rib(-125,315);rib(107,278);if(kind!=='rib'){this.ellipse(41,-91,88,126,'#0a2027');if(kind==='membrane')for(let j=0;j<10;j++){this.line(-50,-190+j*17,106,-46-j*16,lite+'45',4);}}break;
 case 'excavator':case 'survey':
  this.rect(-156,-72,248,35,metal,edge);for(let j=0;j<6;j++)wheel(-138+j*39,-24,23);panel(-113,-147,111,74);this.rect(-95,-134,55,34,'#162e3b',edge);this.line(18,-88,80,-230,edge,17);this.line(80,-230,203,-128,metal,14);this.path([[190,-125],[250,-136],[231,-60],[194,-74]],'#526765',edge,3);if(kind==='survey'){screen(-171,-207,83,57);this.line(-130,-150,-130,-84,edge,4);}break;
 case 'monolith':
  for(let j=0;j<3;j++){const x=-139+j*133,ht=280-j%2*60;this.path([[x-39,0],[x-53,-ht+35],[x-24,-ht],[x+33,-ht+15],[x+49,0]],'#3b5357',edge,2);for(let k=0;k<9;k++){this.line(x-20,-ht+43+k*22,x+21,-ht+39+k*22,lite+'30',2);this.line(x-10+k%3*12,-ht+43+k*22,x-10+k%3*12,-ht+52+k*22,lite+'40',2);}}break;
 case 'ossuary':
  rib(-134,257);this.ellipse(35,-27,145,26,'#697e78');this.ellipse(97,-58,56,40,'#a0b0a2');this.ellipse(116,-60,24,19,dark);for(let j=0;j<8;j++)this.line(-85+j*21,-46,-111+j*23,-6,'#93a69a',6);this.line(-84,-47,61,-33,'#c0c5af',6);break;
 case 'bridge':case 'stairs':
  for(let j=0;j<13;j++){const xx=-205+j*36,yy=kind==='stairs'?-j*14:-50;this.rect(xx,yy,39,8,edge);this.line(xx+4,yy,xx+4,yy-67,metal,4);}this.line(-201,kind==='stairs'?-67:-117,266,kind==='stairs'?-249:-117,lite,5);this.line(-205,kind==='stairs'?8:-42,263,kind==='stairs'?-174:-42,metal,10);break;
 case 'silica':case 'amber':
  for(let j=0;j<4;j++){const x=-166+j*92,ht=190+j%3*74;this.path([[x-32,0],[x-45,-ht*.55],[x-16,-ht],[x+17,-ht*.95],[x+42,-ht*.3],[x+38,0]],'#564d37',lite+'66',2);this.path([[x-16,-ht],[x+5,-ht*.41],[x+38,0],[x+42,-ht*.3],[x+17,-ht*.95]],'#b195573f');this.line(x-16,-ht,x-5,-8,'#e3c38960',3);}
  if(kind==='amber'){const gr=c.createRadialGradient(30,-99,2,30,-99,120);gr.addColorStop(0,'#d4a55233');gr.addColorStop(1,'#d4a55200');c.fillStyle=gr;c.fillRect(-100,-227,260,225);}break;
 case 'cocoon':case 'eggs':case 'throne':
  if(kind==='cocoon'){for(let j=0;j<3;j++){const x=-117+j*108;rib(x-42,232);this.ellipse(x,-132,32,67,'#718578');for(let k=0;k<7;k++)this.line(x-33,-185+k*17,x+31,-139+k*7,'#284d3d',5);this.ellipse(x,-187,14,18,'#a5b396');}}
  else {if(kind==='throne'){rib(-208,380);rib(140,395);this.ellipse(15,-90,191,96,'#2e4537');}for(let j=0;j<5;j++){const x=-123+j*63;this.ellipse(x,-31,27,40,'#4f6648');this.line(x-17,-60,x,-45,lite+'a0',2);this.line(x,-65,x,-38,dark,4);this.line(x+19,-58,x,-45,lite+'70',2);}}break;
 case 'ravine':
  this.path([[-306,0],[-222,-141],[-62,-219],[18,-50],[110,-265],[184,-137],[314,0]],'#2b3d3c','#718679',3);for(let j=0;j<8;j++)this.line(-183+j*44,-72-j%3*43,-102+j*43,0,'#b0b89a24',2);break;
 case 'captureBay':
  panel(-188,-234,376,225);for(let j=0;j<11;j++)this.line(-167+j*33,-215,-167+j*33,-20,edge,4);this.rect(-193,-249,386,13,'#b9b277');screen(207,-122,59,64);this.text('MANUTENTION BIOLOGIQUE',0,-267,12,lite,'center');break;
 case 'viewport':
  panel(-189,-270,378,224);this.rect(-175,-255,348,194,'#0b1a2a');this.ellipse(43,-157,67,67,'#829b8e');this.ellipse(15,-155,48,65,'#637c7b');for(let j=0;j<25;j++)this.rect(-169+j*61%327,-248+j*23%173,1.5,1.5,'#d5ded3');break;
 case 'cryo':
  for(let j=0;j<2;j++){const x=-146+j*169;panel(x,-78,150,60);this.path([[x,-79],[x+24,-155],[x+109,-155],[x+150,-79]],'#769fa459','#abc7c4',2);this.rect(x+35,-86,76,11,'#c2d6cc');this.rect(x+128,-61,10,27,'#8fad93');}break;
 case 'cableTray':case 'resinCable':
  for(let j=0;j<4;j++){c.beginPath();c.moveTo(-96,-7-j*4);c.bezierCurveTo(-21,-48-j*5,6,-5,120,-21-j*4);c.strokeStyle=kind==='resinCable'?P[3]+'40':'#8b9d9960';c.lineWidth=kind==='resinCable'?5:3;c.stroke();}break;
 case 'silicaShard':
  for(let j=0;j<4;j++)this.path([[-55+j*28,0],[-63+j*28,-36-j%2*29],[-48+j*28,-44-j%2*22],[-27+j*28,0]],'#81734e',lite+'50');break;
 case 'warningStripe':
  panel(-76,-24,152,23);for(let j=0;j<9;j++)this.path([[-69+j*16,-22],[-61+j*16,-22],[-71+j*16,-3],[-79+j*16,-3]],'#b0a169');break;
 default: panel(-70,-100,140,95);screen(-54,-86,108,60);
 }
};
R.stretcher=function(a,t){const g=this.game,depth=a.displayZ??g.zFor(a),q=this.pos(a.x,depth),c=this.ctx,s=this.unit*(.83+depth*.3);this.shadow(q,76*s);c.save();c.translate(q.x,q.y);c.scale(s,s);
 this.line(-63,-23,-52,-4,'#8aa09b',7);this.line(55,-23,44,-4,'#8aa09b',7);for(const x of[-55,48]){this.ellipse(x,-3,10,10,'#112c32');this.ellipse(x,-3,5,5,'#9bac9d');if(a.moving&&!this.reduced)this.line(x-5,-3,x+5,-3,'#dae1ce',2);}
 this.rect(-76,-37,152,16,'#8d9a88','#d1d0ad');this.rect(-67,-58,108,22,'#344e4e','#607777');this.path([[-64,-57],[-39,-70],[23,-61],[44,-45],[-65,-39]],'#657e6a','#95a390');const profile=SoSData.fidelity.characters[a.id];this.ellipse(53,-57,14,13,profile.skin);this.ellipse(46,-65,9,6,profile.hair);
 this.ctx.save();if(a.id==='adams'){this.ctx.translate(55,-62);this.ctx.scale(1.27,1.27);this.ctx.translate(-55,62);this.path([[39,-73],[60,-76],[65,-48],[40,-45]],'#b1a27b88');}
 this.ellipse(55,-62,13,7,'#c2ac7f');for(let j=0;j<4;j++){this.line(48+j*4,-62,39+j*6,-73-j%2*3,'#b2a074',2);this.line(48+j*4,-59,40+j*6,-45+j%2*3,'#c3ac7f',2);}this.ctx.beginPath();this.ctx.moveTo(43,-61);this.ctx.bezierCurveTo(33,-56,39,-36,22,-47);this.ctx.strokeStyle='#b6a075';this.ctx.lineWidth=3;this.ctx.stroke();this.ctx.restore();this.line(56,-49,76,-35,'#aec4b1',2);this.rect(-68,-79,19,15,'#213e43','#88a996');this.rect(-63,-75,10,3,a.integrity<40?'#d77c5c':'#a4cca1');
 this.line(-74,-31,-91,-38,'#c4ccbb',3);this.line(76,-31,91,-38,'#c4ccbb',3);
 if(g.distance(a,g.p)<270||a.status==='waiting'||a.status==='ready'){this.text(a.name.toUpperCase(),0,-90,10,'#d5dbc2','center');this.rect(-33,-84,66,3,'#18372d');this.rect(-33,-84,66*a.integrity/100,3,a.integrity<40?'#d77c5c':'#a4b591');}
 c.restore();};
R.device=function(d,t){const g=this.game,q=this.pos(d.x,g.zFor(d)),c=this.ctx,u=this.unit,done=!!g.state.optional[d.id];this.shadow(q,26);this.rect(q.x-31,q.y-61*u,62,60*u,'#334c55','#8daaaa');this.rect(q.x-23,q.y-51*u,46,24*u,'#182e38','#7eaaaa');this.rect(q.x-17,q.y-46*u,33,3,done?'#8bc6a0':'#d8b278');this.rect(q.x-17,q.y-37*u,24,3,'#b7c9b8');this.ellipse(q.x+16,q.y-14*u,4,4,done?'#8bc6a0':'#e0c188');if(!done){this.line(q.x-8,q.y-20*u,q.x+1,q.y-11*u,'#d3c290',2);this.line(q.x+1,q.y-20*u,q.x-8,q.y-11*u,'#d3c290',2);}if(g.distance(d,g.p)<125){this.text(done?'TERMINÉ':'MAINTENIR E',q.x,q.y-77*u,10,done?'#a4ccae':'#e5c589','center');}};
R.emitter=function(n,t){const q=this.pos(n.x,this.game.zFor(n)),u=this.unit;this.rect(q.x-9,q.y-17*u,18,17*u,'#687b80','#c5d0b3');this.ellipse(q.x,q.y-17*u,3,3,'#deb97a');if(!this.reduced){const radius=12+(t%1)*35;this.ctx.save();this.ctx.globalAlpha=.4*(1-t%1);this.ctx.beginPath();this.ctx.ellipse(q.x,q.y,radius,radius*.3,0,0,Math.PI*2);this.ctx.strokeStyle='#dabc83';this.ctx.lineWidth=1.3;this.ctx.stroke();this.ctx.restore();}};
R.grain=function(){const c=this.ctx,{W,H}=this;
 if(!this._texture){const tile=document.createElement('canvas');tile.width=128;tile.height=128;const ct=tile.getContext('2d'),im=ct.createImageData(128,128);let seed=98373;for(let i=0;i<im.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=seed>>>24;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=13;}ct.putImageData(im,0,0);this._texture=c.createPattern(tile,'repeat');}c.save();c.globalAlpha=this.reduced?.5:.8;c.fillStyle=this._texture;c.fillRect(0,0,W,H);c.restore();
 if(this.exposure!==1){c.save();c.globalCompositeOperation=this.exposure>1?'screen':'multiply';c.globalAlpha=Math.abs(this.exposure-1)*.3;c.fillStyle=this.exposure>1?'#d5e5df':'#071d27';c.fillRect(0,0,W,H);c.restore();}
};
/* Field hazards use the simulation's footprints and clocks. No rendering-only damage zones. */
R.fieldGround=function(t){
 const g=this.game,c=this.ctx,u=this.unit;
 for(const h of g.room.hazards||[]){
  const st=g.hazardStatus(h),z=g.mode==='SIDE'?.55:h.z,q=this.pos(h.x,z),half=g.mode==='SIDE'?this.H*.023:this.H*.16*h.d;
  const color=st.phase==='stopped'?'#739b8c':st.phase==='active'?'#ec8a57':st.phase==='warning'?'#edc474':'#928c68';
  c.save();c.globalAlpha=st.phase==='active'?.26:.12;this.rect(q.x-h.w/2,q.y-half,h.w,2*half,color);c.restore();
  this.line(q.x-h.w/2,q.y-half,q.x+h.w/2,q.y-half,color,1.5);this.line(q.x-h.w/2,q.y+half,q.x+h.w/2,q.y+half,color,1.5);
  for(let x=q.x-h.w/2;x<q.x+h.w/2;x+=22){this.line(x,q.y+half,x+9,q.y+half-8,color,2);this.line(x,q.y-half,x+9,q.y-half+8,color,2);}
  const sy=q.y-117*u;
  // Wall source and emergency indicator tell the player what causes the danger.
  this.line(q.x-46,sy-78*u,q.x-46,sy,h.kind==='arc'?'#3e4743':'#658180',9*u);
  this.line(q.x-46,sy,q.x,sy,'#79918a',9*u);this.rect(q.x-12,sy-7*u,23,15*u,'#a8aba1','#273e3b');
  this.rect(q.x-81,sy-44*u,25,42*u,'#1b393c','#829588');this.ellipse(q.x-68,sy-29*u,4,4,color);
  if(st.phase==='active'){
   if(h.kind==='arc'){
    let phase=this.reduced?0:Math.floor(t*12)%3;
    for(let j=0;j<3;j++){const pts=[[q.x,sy],[q.x-31+phase*8+j*11,sy+34*u],[q.x+15-j*18,sy+56*u],[q.x-55+j*48,q.y]];for(let i=1;i<pts.length;i++)this.line(...pts[i-1],...pts[i],'#cee5db',2);}
   }else{
    c.save();c.globalAlpha=.26;
    for(let j=0;j<8;j++){const phase=this.reduced?.5:(t*.7+j*.13)%1;this.ellipse(q.x+(j%2?-1:1)*(20+phase*65),q.y-12*u-phase*91*u,23+phase*28,12+phase*22,h.kind==='gas'?'#b3aa73':'#b5c9c5');}c.restore();
   }
  }
  if(Math.abs(q.x-this.W/2)<this.W*.7){this.text(st.phase==='stopped'?'CONSIGNÉ':st.phase==='active'?'DANGER':st.phase==='warning'?'PRESSION ↑':'INTERVALLE LIBRE',q.x,sy-22*u,9,color,'center');}
 }
};
R.fieldWarnings=function(t){
 const g=this.game,c=this.ctx;
 for(const e of g.rs.enemies){if(!e.attack||e.hp<=0)continue;const a=e.attack,q=this.pos(a.x,g.zFor(a)),radius=e.kind==='queen'?150:e.kind==='facehugger'?48:72;
  const frac=1-a.remaining/a.duration;c.save();c.globalAlpha=.25;this.ellipse(q.x,q.y,radius,g.mode==='SIDE'?11:radius*this.H*.32/470,'#ea9c62');c.restore();
  c.strokeStyle='#efd1a0';c.lineWidth=2;c.beginPath();c.ellipse(q.x,q.y,radius*(1-.30*frac),g.mode==='SIDE'?10:radius*this.H*.32/470*(1-.30*frac),0,0,Math.PI*2);c.stroke();
  const p=this.pos(e.x,g.zFor(e));this.text('!',p.x,p.y-(e.kind==='queen'?358:166)*this.unit,21,'#f1ca8f','center');
 }
 const route=g.routeTo();if(route?.length){const d=route[0],q=this.pos(d.x,g.zFor(d));if(q.x>40&&q.x<this.W-40){this.path([[q.x-7,q.y+21],[q.x,q.y+30],[q.x+7,q.y+21]],'#c1dfc5');this.text('REPÈRE',q.x,q.y+46,9,'#d2e8ce','center');}}
};
const legacyDevice=R.device;
R.device=function(d,t){
 if(!['isolation','parts'].includes(d.kind)){legacyDevice.call(this,d,t);return;}
 const g=this.game,q=this.pos(d.x,g.zFor(d)),u=this.unit,done=!!g.state.optional[d.id],c=this.ctx;
 this.shadow(q,37);
 if(d.kind==='parts'){
  this.rect(q.x-41,q.y-37*u,82,36*u,'#405e5a','#99afa0');this.rect(q.x-37,q.y-32*u,74,26*u,'#132c31');
  this.path([[q.x-42,q.y-38*u],[q.x-36,q.y-(done?83:49)*u],[q.x+38,q.y-(done?79:49)*u],[q.x+41,q.y-38*u]],'#5b7164','#afbb9e');
  if(!done){this.line(q.x-25,q.y-22*u,q.x+16,q.y-18*u,'#c2c4ad',6);this.line(q.x-16,q.y-14*u,q.x+26,q.y-27*u,'#8a9b89',5);}
 }else{
  this.line(q.x,q.y,q.x,q.y-113*u,'#536e6c',13);this.line(q.x-46,q.y-42*u,q.x+46,q.y-42*u,'#899c8e',14);
  this.rect(q.x-26,q.y-116*u,52,38*u,'#1f393d','#839588');this.rect(q.x-19,q.y-108*u,39,20*u,done?'#89b59a':'#d9af73');
  c.save();c.translate(q.x,q.y-51*u);c.rotate(done?Math.PI/4:0);c.strokeStyle='#bcc4ab';c.lineWidth=4;c.beginPath();c.arc(0,0,22,0,Math.PI*2);c.stroke();this.line(-22,0,22,0,'#adb69f',3);this.line(0,-22,0,22,'#adb69f',3);c.restore();
 }
 if(g.distance(d,g.p)<145)this.text(done?(d.kind==='parts'?'VIDE':'CONSIGNÉ'):'MAINTENIR E',q.x,q.y-(d.kind==='parts'?95:133)*u,10,done?'#a8c8b2':'#e4c690','center');
};

})(globalThis);
