/* All images below are original runtime vector artwork. No photogrammetry, film frames,
 * copied concept art, or pre-rendered fake gameplay is used. */
(function(root){'use strict';
const {clamp}=root.SoSCore;
class Renderer{
 constructor(canvas,game){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.game=game;this.W=1600;this.H=820;this.camera=0;this.effects=[];this.reduced=false;this.focus=false;this.lastRoom='';this.pointer=null;this.exposure=1;this.highContrast=false;this.resize();}
 resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.round(r.width*dpr));this.canvas.height=Math.max(1,Math.round(r.height*dpr));this.W=Math.min(1600,Math.max(600,Math.max(1,r.width)/Math.max(1,r.height)*1100));this.H=this.W*Math.max(1,r.height)/Math.max(1,r.width);this.unit=this.H/800;}
 pos(x,z){return {x:x-this.camera,y:this.H*(.59+.32*z)};}
 mouse(clientX,clientY){const r=this.canvas.getBoundingClientRect();return {x:(clientX-r.left)/r.width*this.W+this.camera,z:clamp(((clientY-r.top)/r.height-.59)/.32,.13,.89)};}
 rect(x,y,w,h,fill,stroke=null){const c=this.ctx;c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x,y,w,h);}}
 line(x1,y1,x2,y2,color,width=1){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
 text(t,x,y,size=13,color='#c9d3b9',align='left'){const c=this.ctx;c.font=`${size}px Arial`;c.textAlign=align;c.fillStyle=color;c.fillText(t,x,y);}
 ellipse(x,y,rx,ry,fill){const c=this.ctx;c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 path(points,fill,stroke=null,width=1){const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 sensor(b,t){
  const g=this.game,c=this.ctx,q=this.pos(b.x,g.zFor(b)),u=this.unit,signal=b.powered&&b.lastPulse>=0&&g.state.stats.time-b.lastPulse<2;
  c.save();this.ellipse(q.x,q.y+1,21*u,7*u,'#0007');
  this.path([[q.x-19*u,q.y],[q.x-10*u,q.y-15*u],[q.x+13*u,q.y-15*u],[q.x+21*u,q.y],[q.x,q.y+7*u]],'#3c5556','#9ea98b',1.2);
  this.rect(q.x-3*u,q.y-39*u,5*u,26*u,'#718681','#bcd3c3');this.line(q.x-12*u,q.y-40*u,q.x+14*u,q.y-40*u,'#aebba4',2);
  this.ellipse(q.x+9*u,q.y-8*u,3*u,3*u,signal?'#efd28a':b.powered?'#8bc9b3':'#665e4e');
  if(signal){c.strokeStyle='#e5cb91';c.lineWidth=1.4;c.beginPath();c.ellipse(q.x,q.y,(this.reduced?37:30+Math.sin(t*4)*8)*u,12*u,0,0,Math.PI*2);c.stroke();}
  if(g.distance(g.p,b)<300){this.text('CAPTEUR '+b.id.slice(-1)+' · '+Math.ceil(b.charge)+' s',q.x,q.y-56*u,10,'#d0e0ce','center');if(g.distance(g.p,b)<85)this.text('P · RÉCUPÉRER',q.x,q.y+25*u,10,'#e0ce9b','center');}
  c.restore();
 }

 locker(l){
  const g=this.game,a=g.rs.lockers[l.id],c=this.ctx,q=this.pos(l.x,l.bodyZ),u=this.unit,open=a.opened?1:a.progress/l.duration*.55,empty=a.opened&&Object.values(a.contents).every(n=>n===0),color=a.opened?(empty?'#738589':'#91c9b1'):'#dfb679';
  c.save();this.ellipse(q.x,q.y+4*u,68*u,10*u,'#0008');
  this.rect(q.x-60*u,q.y-97*u,120*u,99*u,'#293d43','#7c999c');this.rect(q.x-52*u,q.y-88*u,104*u,79*u,'#091a21','#4d6a72');
  for(let i=0;i<3;i++){this.line(q.x-49*u,q.y-(67-i*23)*u,q.x+49*u,q.y-(67-i*23)*u,'#5f7e83',3*u);if(!empty)this.rect(q.x+(-37+(i%2)*19)*u,q.y-(84-i*23)*u,37*u,14*u,['#a08e61','#758b85','#8a785e'][i]);}
  for(const sign of [-1,1]){
   const hinge=q.x+sign*57*u,extent=sign*(open*43-(1-open)*56)*u;
   this.path([[hinge,q.y-94*u],[hinge+extent,q.y-(94+open*13)*u],[hinge+extent,q.y-(3+open*13)*u],[hinge,q.y-3*u]],'#3e545a','#8a9c99',1.2*u);
   if(open<.8)this.line(hinge+extent*.83,q.y-61*u,hinge+extent*.83,q.y-39*u,color,3*u);
  }
  this.rect(q.x-30*u,q.y-106*u,60*u,7*u,color);this.text(l.id.slice(-2),q.x,q.y-112*u,12*u,color,'center');
  if(g.distance(g.p,l)<230)this.text(a.opened?(empty?'VIDE · DÉPÔT POSSIBLE':'OUVERT · RÉSERVES'):'SCELLÉ',q.x,q.y-134*u,10*u,color,'center');
  c.restore();
 }

 draw(time,dt=0){
  const g=this.game,r=g.room,p=g.p,c=this.ctx,W=this.W,H=this.H;
  const desired=clamp(p.x-W*.40,0,Math.max(0,r.width-W));
  if(this.lastRoom!==r.id){this.camera=desired;this.lastRoom=r.id;this.effects=[];}
  else this.camera+= (desired-this.camera)*(this.reduced?1:1-Math.exp(-Math.max(dt,.016)*7));
  c.setTransform(this.canvas.width/W,0,0,this.canvas.height/H,0,0);c.globalAlpha=1;
  this.backdrop(time);this.floor(time);this.architecture(time);this.worldDressing(time,false);this.fieldGround(time);this.tacticalGround(time);
  const sorted=[];
  for(const l of r.lockers||[])sorted.push({z:l.bodyZ,draw:()=>this.locker(l)});
  if(r.lighting)sorted.push({z:g.zFor(r.lighting),draw:()=>this.lightPanel(r.lighting,time)});
  for(const s of r.shutters||[])sorted.push({z:.94,draw:()=>this.shutter(s,time)});
  for(const b of r.obstacles)sorted.push({z:b.z,draw:()=>{c.save();if([p,...g.state.rescue.actors.filter(a=>a.room===r.id)].some(a=>b.z>g.zFor(a)&&Math.abs(b.x-a.x)<b.w*.65+75))c.globalAlpha=.25;this.prop(b);c.restore();}});
  for(const d of r.doors)sorted.push({z:g.zFor(d)-.03,draw:()=>this.door(d)});
  for(const o of r.interactables)if(o.type!=='rescue')sorted.push({z:g.zFor(o),draw:()=>this.object(o)});
  for(const d of r.devices||[])sorted.push({z:g.zFor(d),draw:()=>this.device(d,time)});
  for(const a of g.state.rescue.actors)if(a.room===r.id&&g.state.objectiveIndex>=24)sorted.push({z:g.zFor(a),draw:()=>this.stretcher(a,time)});
  for(const b of g.state.sensors.filter(b=>b.room===r.id))sorted.push({z:g.zFor(b),draw:()=>this.sensor(b,time)});
  for(const n of g.rs.noises)if(n.kind==='decoy')sorted.push({z:g.zFor(n),draw:()=>this.emitter(n,time)});
  if(!g.state.archives.includes(r.archive.id))sorted.push({z:g.zFor(r.archive),draw:()=>this.archive(r.archive)});
  if(r.supply)sorted.push({z:.55,draw:()=>this.supply()});
  for(const a of g.rs.acid)if(a.time>0){const q=this.pos(a.x,g.zFor(a));this.ellipse(q.x,q.y,44,10,'#a5b45470');this.line(q.x-40,q.y+8,q.x+40,q.y+8,'#c3cb7d',1.5);for(let j=0;j<4;j++){this.ellipse(q.x-27+j*18,q.y-4-(this.reduced?2:(time*12+j*7)%14),2.5,2.5,'#d0d79799');}if(g.distance(a,p)<240)this.text('ACIDE',q.x,q.y+25,9,'#d7d7a1','center');}
  for(const b of g.rs.corpses)sorted.push({z:g.zFor(b),draw:()=>this.corpse(b)});
  for(const w of g.rs.weakpoints)sorted.push({z:g.zFor(w),draw:()=>this.weakpoint(w)});
  for(const e of g.rs.enemies)if(e.hp>0&&e.mode!=='captured')sorted.push({z:g.zFor(e),draw:()=>this.alien(e,time)});
  if(g.state.flags.equipped&&g.chapter.number<17)sorted.push({z:g.zFor(g.state.companion),draw:()=>this.human(g.state.companion,time,'manning')});
  for(const a of g.castForRoom())sorted.push({z:g.zFor(a),draw:()=>this.human(a,time,a.id)});
  if(r.stasisDisplays&&g.state.flags.specimens_delivered)for(const slot of r.stasisDisplays)sorted.push({z:slot.z,draw:()=>this.stasisDisplay(slot,time)});
  if(r.armoryRack)sorted.push({z:r.armoryRack.bodyZ,draw:()=>this.armoryRack(r.armoryRack)});
  sorted.push({z:p.z,draw:()=>this.human(p,time,'decker')});
  sorted.sort((a,b)=>a.z-b.z);for(const item of sorted)item.draw();
  this.drawEffects(dt);this.atmosphere(time);this.foreground(time);this.worldDressing(time,true);this.grain(time);this.lightOverlay(time);this.fieldWarnings(time);this.tacticalOverlay(time);
  if(this.focus){const hint=g.empathyHint();if(hint){const q=this.pos(p.x,p.z),direction=hint.direction;c.save();c.globalAlpha=.5;c.strokeStyle=p.stress>75?'#b77754':'#d6c488';c.lineWidth=2;c.beginPath();c.arc(q.x,q.y-55*this.unit,82*this.unit,direction>=0?-.65:Math.PI-.65,direction>=0?.65:Math.PI+.65);c.stroke();c.restore();}}
  if(g.current?.type==='boss'&&r.id==='s33'&&!g.state.flags.queen_down){const e=g.rs.enemies.find(e=>e.kind==='queen');const active=g.rs.weakpoints.filter(w=>w.hp>0).length;this.rect(W/2-160,21,320,4,'#16251b');this.rect(W/2-160,21,320*e.hp/340,4,'#9a916c');this.text(active?`${active} attache${active>1?'s':''} de résine`:'Manning ouvre le feu',W/2,44,12,'#ddd1ac','center');}
 }
 backdrop(t){
  const c=this.ctx,{W,H,camera}=this,r=this.game.room;
  const outdoor=r.kind==='sand';const organic=['alien','silica','hive','queen','ossuary','ruins','derelict'].includes(r.kind);
  let grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,outdoor?'#222d29':organic?'#101b19':'#101f20');grad.addColorStop(.57,outdoor?'#a4976a':organic?'#354538':'#35453e');grad.addColorStop(1,'#141b13');c.fillStyle=grad;c.fillRect(0,0,W,H);
  if(outdoor){
   const sun=c.createRadialGradient(W*.73,H*.22,2,W*.73,H*.22,H*.40);sun.addColorStop(0,'#d7c79077');sun.addColorStop(1,'#d7c79000');c.fillStyle=sun;c.fillRect(0,0,W,H*.7);
   this.ellipse(W*.76,H*.23,H*.053,H*.053,'#c5bb9088');
   for(let layer=0;layer<3;layer++){
    const pts=[[-100,H*.7]];for(let x=-100;x<W+150;x+=35){const wx=x+camera*(.09+layer*.09);const y=H*(.45+layer*.072)+Math.sin(wx*.003+layer*2)*H*.049+Math.sin(wx*.008+layer)*H*.016;pts.push([x,y]);}pts.push([W+150,H*.85]);this.path(pts,['#526054','#454e3d','#393f2d'][layer]);
   }
   for(let i=-1;i<9;i++){const x=i*265-camera*.16;this.rect(x,H*.32,52,H*.16,'#38473d');this.rect(x+8,H*.3,12,H*.05,'#3c4b40');this.rect(x+56,H*.40,91,H*.1,'#3b4739');this.line(x+90,H*.41,x+90,H*.245,'#465343',2);this.line(x+77,H*.31,x+102,H*.31,'#76816a',1);for(let k=0;k<5;k++)this.rect(x+5+k*9,H*.37,3,2,'#a5ae8677');}
   for(let i=0;i<9;i++){let x=(i*247+t*4-camera*.05)%(W+350)-120;this.ellipse(x,H*(.14+(i%3)*.06),140,7,'#c8cba711');}
  }else if(organic){
   for(let i=-1;i<9;i++){
    const x=i*280-camera*.27,y=H*.6,w=260;
    c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-45,H*.18,x+110,-H*.12,x+w*.52,H*.12);c.bezierCurveTo(x+w*.85,H*.28,x+w+25,H*.5,x+w,y);c.strokeStyle='#3b4b3c';c.lineWidth=34*this.unit;c.stroke();c.strokeStyle='#75816b36';c.lineWidth=3;c.stroke();
    for(let j=0;j<6;j++){c.beginPath();c.moveTo(x+25+j*27,H*.6);c.bezierCurveTo(x-20+j*25,H*.36,x+40+j*26,H*.12,x+150+j*13,H*.29);c.strokeStyle='#53634a35';c.lineWidth=4;c.stroke();}
   }
   for(let i=0;i<30;i++){const x=(i*143.7-camera*.2)%W;this.ellipse(x,H*(.19+(i%5)*.09),2,2,'#a8bd7066');}
  }else{
   for(let i=-1;i<9;i++){
    const x=i*290-camera*.42;this.rect(x,0,278,H*.58,'#1b302c','#3b5244');this.rect(x+19,H*.07,240,H*.33,'#142622','#41574b');
    this.path([[x+23,H*.075],[x+255,H*.075],[x+234,H*.11],[x+45,H*.11]],'#56665335');
    for(let j=0;j<7;j++)this.line(x+33,H*(.445+j*.013),x+240,H*(.445+j*.013),'#5a695142',2);
    this.rect(x+34,H*.12,65,H*.19,'#1c3935');this.rect(x+40,H*.129,52,H*.16,'#69816d27');
    this.rect(x+112,H*.12,122,H*.19,'#0a1a19','#53614f');
    if(['home','office'].includes(r.kind))for(let k=0;k<7;k++){this.rect(x+116+k*16,H*(.23-(k%3)*.025),10,H*.08,'#354b41');this.rect(x+119+k*16,H*.245,2,2,'#debe7977');}
    if(r.id==='s39'){this.ellipse(x+175,H*.27,H*.12,H*.12,'#747d5366');if(this.game.state.flags.strike_seen)this.ellipse(x+173,H*.26,12,9,'#ffe0a8b0');}
   }
   this.rect(0,H*.015,W,H*.038,'#0c1917');this.line(0,H*.056,W,H*.056,'#85937680',2);
  }
 }
 floor(t){
  const c=this.ctx,{W,H,camera}=this,r=this.game.room;const y=H*.595;const outdoor=r.kind==='sand';
  const grad=c.createLinearGradient(0,y,0,H);grad.addColorStop(0,outdoor?'#67684b':'#485240');grad.addColorStop(.35,outdoor?'#3b422e':'#2a3b2d');grad.addColorStop(1,'#141f17');c.fillStyle=grad;c.fillRect(0,y,W,H-y);
  if(!outdoor){for(let x=-400-camera%160;x<W+300;x+=160)this.line((x-W/2)*.78+W/2,y,x,H,'#9da48225',1);for(let i=0;i<11;i++){const yy=y+(H-y)*Math.pow(i/10,1.5);this.line(0,yy,W,yy,'#b5b78b19',1);}this.line(0,y,W,y,'#9ca58155',2);}
  else{for(let i=0;i<120;i++){const x=(i*73.9-camera*.85)%(W+100);const yy=H*(.62+((i*17)%36)/100);this.line(x,yy,x+18+(i%4)*12,yy-2,'#bbc39913',1);}for(let i=0;i<40;i++){const x=(i*197.9-camera)%(W+50);const yy=H*(.63+(i%7)*.044);this.ellipse(x,yy,4+(i%5),2,'#0d201a55');}}
 }
 architecture(t){
  const r=this.game.room,c=this.ctx,{W,H,camera,unit:u}=this;
  for(const ratio of r.lightPositions){const x=r.width*ratio-camera;const y=H*.36;this.rect(x-26,y-6,52,10,'#a1ae8388');this.rect(x-20,y-4,40,4,'#d9d5a2');const grad=c.createLinearGradient(x,y,x,H*.8);grad.addColorStop(0,'#dce4a22c');grad.addColorStop(1,'#dce4a200');this.path([[x-20,y],[x+20,y],[x+180,H*.86],[x-120,H*.86]],grad);if(r.kind==='sand'||['silica','ruins','hive','queen','derelict','alien','ossuary'].includes(r.kind)){this.line(x,y-4,x,H*.64,'#283a29',5);this.rect(x-23,H*.64,46,9,'#536346');}else this.line(x,y-5,x,0,'#1b291d',3);}
  if(['medical','home','office','armory','workshop','camp','relay','power','decon'].includes(r.kind)){
   for(let i=0;i<Math.ceil(r.width/350);i++){
    const x=120+i*350-camera,y=H*.61;const k=r.kind;
    if(k==='medical'){
     this.path([[x,y-58*u],[x+120,y-58*u],[x+142,y-36*u],[x+6,y-34*u]],'#97a18a','#bac3a8',1);this.rect(x+10,y-35*u,120,22*u,'#4d6355');this.line(x+16,y-15*u,x+16,y+13*u,'#6a7c65',5);this.line(x+120,y-15*u,x+120,y+13*u,'#6a7c65',5);this.rect(x+91,y-57*u,25,8*u,'#d7d7b7');this.rect(x+149,y-120*u,45,37*u,'#111f1b','#73826b');this.line(x+151,y-100*u,x+192,y-104*u,'#96c490',1);this.line(x+172,y-80*u,x+172,y+6*u,'#718064',4);
    }else if(k==='home'){this.rect(x,y-64*u,150,56*u,'#465845','#839074');this.rect(x+7,y-58*u,64,36*u,'#5b6c55');this.rect(x+79,y-58*u,64,36*u,'#5b6c55');this.line(x+20,y-5*u,x+20,y+12*u,'#192a1b',7);this.line(x+133,y-5*u,x+133,y+12*u,'#192a1b',7);this.rect(x+42,y-115*u,70,32*u,'#bfbd8966','#596846');}
    else if(['relay','office','camp'].includes(k)){
     this.rect(x,y-65*u,145,12*u,'#76866a');this.rect(x+8,y-54*u,14,62*u,'#324d3c');this.rect(x+124,y-54*u,14,62*u,'#324d3c');this.rect(x+70,y-119*u,62,49*u,'#112c22','#7b8a6a');this.rect(x+76,y-113*u,50,35*u,'#8ab17a33');for(let j=0;j<5;j++)this.line(x+81,y-(107-j*5)*u,x+110+(j%2)*12,y-(107-j*5)*u,'#a4b78280',1);this.rect(x+20,y-75*u,35,8*u,'#c2c2a3');
    }else if(k==='decon'){
     this.line(x,y-240*u,x,y+12*u,'#6b8070',8);this.line(x,y-232*u,x+122,y-232*u,'#607762',8);this.line(x+120,y-232*u,x+120,y+12*u,'#45644f',8);for(let j=0;j<4;j++){this.line(x+20+j*23,y-230*u,x+20+j*23,y-220*u,'#c2cbae',4);if(!this.reduced)this.line(x+20+j*23,y-210*u+(t*33%30),x+16+j*23,y-125*u+(t*33%30),'#b4cfb027',1);}
    }else{
     this.rect(x,y-152*u,137,150*u,'#304a38','#6b7e5a');this.rect(x+8,y-142*u,121,56*u,'#1c3027','#59764f');for(let k=0;k<8;k++)this.rect(x+14+k*14,y-125*u,8,30*u,k%2?'#839574':'#455c45');this.rect(x+8,y-77*u,121,64*u,'#223a2b','#53694d');for(let j=0;j<3;j++){this.ellipse(x+32+j*36,y-51*u,10,10,'#839771');this.ellipse(x+32+j*36,y-51*u,7,7,'#263e30');}this.rect(x+115,y-9*u,5,5,'#d4ac5e');
    }
   }
  }
  if(r.kind==='sand'){
   const y=H*.61;for(let i=0;i<8;i++){const x=i*400+70-camera;this.line(x,y-55*u,x,y+10*u,'#7f8360',5);this.rect(x-6,y-60*u,12,12,'#d7ad59');this.line(x,y-40*u,x+300,y-40*u,'#85896450',2);}
   if(r.id==='s02'){const x=r.width*.52-camera,y=H*.62;this.line(x-170,y,x-110,y-275*u,'#1d3026',22);this.line(x+130,y,x+75,y-275*u,'#21352b',22);this.line(x-115,y-275*u,x+75,y-275*u,'#93a082',18);for(let j=0;j<5;j++)this.line(x-105,y-(j*50)*u,x+72,y-(j*50+40)*u,'#566f53',7);this.rect(x-30,y-240*u,52,152*u,'#6e8061','#c3c8a2');this.line(x-4,y-88*u,x-4,y+18*u,'#192d24',22);for(let j=0;j<8;j++)this.line(x-17,y-(j*13)*u,x+10,y-(j*13+10)*u,'#91a279',4);this.rect(x-187,y-28*u,347,22*u,'#64735a');}
   if(['s11','s36'].includes(r.id)){const x=1150-camera;this.path([[x,H*.61],[x+20,H*.44],[x+275,H*.44],[x+290,H*.61]],'#2c4132','#879578',2);this.rect(x+30,H*.458,60,H*.07,'#bdc09c55');this.rect(x+113,H*.50,72,H*.11,'#111f18','#7e8d69');this.text('LV–178',x+218,H*.51,14,'#b3c299','center');}
  }
  if(r.kind==='lift'){
   const x=r.width*.61-camera,y=H*.72;this.rect(x-200,0,370,H*.72,'#060f0e99');for(let i=0;i<3;i++)this.line(x-120+i*105,0,x-120+i*105,y,'#93a183',3);
   this.rect(x-162,y-240*u,310,237*u,'#2a3a2a80','#85906a');this.line(x-162,y-236*u,x+145,y-236*u,'#b9bf90',9);for(let j=0;j<8;j++)this.line(x-140+j*38,y-230*u,x-140+j*38,y-10*u,'#3c5439',5);this.rect(x-175,y-5*u,338,18*u,'#788468');
  }
  if(r.kind==='derelict'){
   const x=r.width*.61-camera,y=H*.60;c.beginPath();c.moveTo(x-750,y);c.bezierCurveTo(x-560,H*.08,x+370,H*.01,x+690,y);c.fillStyle='#24392b';c.fill();c.strokeStyle='#61744e';c.lineWidth=10;c.stroke();for(let j=0;j<10;j++){const xx=x-600+j*118;c.beginPath();c.moveTo(xx,y);c.quadraticCurveTo(xx+40,H*.32,x+130,H*.19);c.strokeStyle='#8e9b622f';c.lineWidth=9;c.stroke();}this.ellipse(x-40,H*.50,88,91,'#07130f');this.line(x-138,H*.65,x+100,H*.65,'#a1a178',9);
  }
  if(['silica','hive','queen','alien','ossuary','ruins'].includes(r.kind)){
   for(let i=0;i<Math.ceil(r.width/330);i++){
    const x=i*330+110-camera;const base=H*.62;const ht=(230+(i%3)*70)*u;
    c.beginPath();c.moveTo(x-45,base);c.bezierCurveTo(x+60,base-ht*.3,x-42,base-ht*.8,x+24,base-ht);c.bezierCurveTo(x+97,base-ht*.7,x+14,base-ht*.3,x+52,base);const gr=c.createLinearGradient(x-40,0,x+90,0);gr.addColorStop(0,'#172f20');gr.addColorStop(.43,r.kind==='silica'?'#b3a96b8e':'#607746');gr.addColorStop(.6,'#344b2b');gr.addColorStop(1,'#0d2216');c.fillStyle=gr;c.fill();c.strokeStyle='#b7bd7558';c.lineWidth=2;c.stroke();
    if(['hive','queen'].includes(r.kind))for(let j=0;j<3;j++)this.egg({x:i*330+185+j*44,z:.20+(j%2)*.04},.8);
    if(r.kind==='ossuary'){this.ellipse(x+88,H*.61,48,13,'#899676');this.ellipse(x+92,H*.585,26,18,'#9eaa86');this.ellipse(x+104,H*.584,10,7,'#29382a');for(let j=0;j<5;j++)this.line(x+75+j*9,H*.62,x+60+j*10,H*.66,'#9caa82',4);}
   }
  }
  if(['stairs','bridge'].includes(r.kind)){
   if(r.kind==='stairs')for(let section=0;section<3;section++){
    const x=section*780+180-camera;for(let j=0;j<15;j++){const yy=H*.6-j*12*u;this.rect(x+j*34,yy,38,8*u,'#5e7554','#8b9b72');this.line(x+j*34+4,yy,x+j*34+4,yy-58*u,'#657c55',3);}this.line(x,H*.6-62*u,x+510,H*.6-242*u,'#9ead84',5);
   }else{for(let i=0;i<15;i++){const x=i*205-camera;this.line(x,H*.78,x,H*.61,'#758961',4);this.line(x,H*.635,x+205,H*.635,'#b7bf9170',3);}this.line(0,H*.81,W,H*.81,'#758060',8);}
  }
  if(r.kind==='hangar'){
   const x=r.width*.73-camera,y=H*.58;this.path([[x-260,y],[x-210,y-170*u],[x+140,y-215*u],[x+350,y-85*u],[x+370,y]],'#364c37','#8a9f74',3);this.path([[x+100,y-190*u],[x+180,y-167*u],[x+264,y-108*u],[x+105,y-110*u]],'#112721','#697f63',2);this.rect(x-160,y-115*u,155,115*u,'#0c1b14','#7b9465');this.path([[x-160,y],[x-5,y],[x+55,y+52*u],[x-185,y+52*u]],'#637656','#9ba77e');for(let j=0;j<4;j++)this.line(x-160,y+(j*12)*u,x+7+j*10,y+(j*12)*u,'#1c3125',2);
  }
 }
 shadow(q,w=35){this.ellipse(q.x,q.y+3, w,7*this.unit,'#020b078a');}
 prop(b){
  const q=this.pos(b.x,b.z),c=this.ctx,u=this.unit,scale=.83+b.z*.3,w=b.w*scale,h=b.h*u*scale;this.shadow(q,w*.58);
  if(['resin','silica-rubble','rib'].includes(b.kind)){
   if(b.kind==='silica-rubble'){
    for(let i=0;i<4;i++){const x=q.x-w*.5+i*w*.22,hh=h*(.62+(i%2)*.35);this.path([[x,q.y],[x-10,q.y-hh*.5],[x+15,q.y-hh],[x+w*.23,q.y-hh*.88],[x+w*.31,q.y]],'#526b45','#8f9e70',1.5);this.line(x+15,q.y-hh,x+24,q.y-9,'#b1b88255',2);}
   }else{
    c.beginPath();c.moveTo(q.x-w/2,q.y);c.bezierCurveTo(q.x-w*.62,q.y-h*.7,q.x-w*.25,q.y-h*1.4,q.x+w*.1,q.y-h);c.bezierCurveTo(q.x+w*.38,q.y-h*1.2,q.x+w*.6,q.y-h*.4,q.x+w/2,q.y);c.closePath();c.fillStyle='#28492f';c.fill();c.strokeStyle='#809260';c.lineWidth=2;c.stroke();
    for(let j=0;j<6;j++){const x=q.x-w*.40+j*w*.15;c.beginPath();c.moveTo(x,q.y-5);c.quadraticCurveTo(x+w*.22,q.y-h*.5,x+w*.02,q.y-h*(.6+(j%3)*.12));c.strokeStyle=b.kind==='rib'?'#a8ae7888':'#68885888';c.lineWidth=b.kind==='rib'?6:3;c.stroke();}
   }
  }else if(b.kind==='pipe'){
   this.rect(q.x-w/2,q.y-h,w,h,'#344a31','#89946e');for(let i=0;i<5;i++){this.rect(q.x-w/2+i*w/5,q.y-h,w/5-5,h,'#6d7b58');this.line(q.x-w/2+i*w/5+3,q.y-h+5,q.x-w/2+i*w/5+3,q.y-5,'#a7ae843f',3);}this.rect(q.x-w/2-5,q.y-h+12,w+10,10,'#253f2b');
  }else if(b.kind==='rack'){
   for(const x of [-w/2,w/2])this.rect(q.x+x,q.y-h,6,h,'#758965');for(let i=0;i<3;i++){this.rect(q.x-w/2,q.y-h*(i+1)/3,w,5,'#a0a982');this.rect(q.x-w*.4,q.y-h*(i+1)/3-23*u,w*.6,20*u,'#465a3e','#829369');}
  }else{
   this.path([[q.x-w/2,q.y-h],[q.x+w/2,q.y-h],[q.x+w/2+14,q.y-h-12],[q.x-w/2+14,q.y-h-12]],'#829471','#a5b085');this.rect(q.x-w/2,q.y-h,w,h,'#4a6142','#859574');this.rect(q.x-w/2+10,q.y-h+10,w-20,h-20,'#3a5136','#7a8c60');this.line(q.x-w/2+18,q.y-h+18,q.x+w/2-18,q.y-18,'#9ba97944',5);this.rect(q.x-20,q.y-h+5,40,14,'#b8b88b');this.text('F / 178',q.x,q.y-h+16,9,'#243928','center');
  }
 }
 door(d){
  const g=this.game,c=this.ctx,u=this.unit,p=d.portal||{},m=p.mount||'back',type=p.type||'bulkhead',near=g.distance(d,g.p)<175;
  const approach=this.pos(d.x,g.zFor(d)),q=this.pos(d.x,p.apertureZ??g.zFor(d)),h=152*u,w=(p.width||110)*u,status=g.doorStatus(d),color=status.open?'#abc9bb':'#d39474';
  c.save();
  // Every aperture is bound to an enclosing wall, shaft, ramp or path.
  // The line joining an approach and its aperture is a floor marking, not a floating door.
  if(['transit','interlude','urban-transit','boarding'].includes(type)){
   this.path([[q.x-w*.95,q.y],[q.x+w*.95,q.y],[q.x+w*.65,q.y-36*u],[q.x-w*.65,q.y-36*u]],'#536468','#a9bab4',2);
   if(type==='boarding'){
    this.path([[q.x-170*u,q.y-70*u],[q.x-130*u,q.y-160*u],[q.x+80*u,q.y-160*u],[q.x+172*u,q.y-110*u],[q.x+155*u,q.y-70*u]],'#293b46','#849b9e',2);
    this.rect(q.x-42*u,q.y-139*u,79*u,64*u,'#081720','#8da5a5');this.rect(q.x+63*u,q.y-144*u,57*u,27*u,'#294c5b');
    this.path([[q.x-40*u,q.y-75*u],[q.x+34*u,q.y-75*u],[q.x+60*u,q.y-16*u],[q.x-67*u,q.y-16*u]],'#617271','#b8bb9c',2);
   }else{
    this.line(q.x-w,q.y-4*u,q.x+w,q.y-4*u,'#e2c486',4*u);
    this.text(type==='urban-transit'?'TRAJET URBAIN':type==='interlude'?'SÉQUENCE DE TRANSITION':'TRANSPORT SANITAIRE',q.x,q.y-67*u,11*u,color,'center');
   }
   if(near){this.text(d.label,q.x,q.y-190*u,12*u,color,'center');this.text('VOYAGE / ELLIPSE · PAS UN COULOIR',q.x,q.y-170*u,9*u,'#b4c9c7','center');}
   c.restore();return;
  }
  if(type==='exterior-path'){
   const sign=m==='left'?-1:1;
   for(const z of[-16,16])this.line(q.x-sign*95*u,q.y+z*u,q.x+sign*90*u,q.y+z*u,'#a99a7766',4*u);
   this.path([[q.x+sign*80*u,q.y],[q.x+sign*50*u,q.y-12*u],[q.x+sign*50*u,q.y+12*u]],color);
   if(near)this.text(d.label,q.x,q.y-45*u,12*u,color,'center');c.restore();return;
  }
  if(m==='front'&&Math.abs(g.p.x-d.x)<170)c.globalAlpha=.42;
  // Three-quarter lateral wall, or continuous rear/foreground wall with an inset bay.
  if(m==='left'||m==='right'){
   const sign=m==='left'?-1:1,outer=this.pos(m==='left'?0:g.room.width,.94),back=this.pos(m==='left'?0:g.room.width,.105);
   this.path([[back.x,back.y-h*1.3],[q.x,q.y-h],[q.x,q.y],[outer.x,outer.y],[back.x,back.y]],'#1c303b','#687e86',1.5);
   this.path([[q.x-sign*16*u,q.y-h],[q.x+sign*40*u,q.y-h-29*u],[q.x+sign*40*u,q.y-16*u],[q.x-sign*16*u,q.y]],'#0a1a22','#b0c2bf',3*u);
   for(let j=0;j<4;j++)this.line(q.x+sign*45*u,q.y-h-24*u+j*36*u,q.x+sign*84*u,q.y-h-45*u+j*36*u,'#7c93914d',1);
  }else{
   const front=m==='front',wallZ=front?.95:.10,left=this.pos(0,wallZ),right=this.pos(g.room.width,wallZ);
   const keep=c.globalAlpha,rock=['rock-breach','crawl-opening'].includes(type),wallH=h*1.13;
   // Foreground facade is a continuous cutaway wall, not a free-standing rectangle.
   if(front)c.globalAlpha=.48;
   const fill=rock?'#273d38':'#243e49';
   this.rect(left.x,q.y-wallH,Math.max(0,q.x-w*.61-left.x),wallH+this.H*.12,fill);
   this.rect(q.x+w*.61,q.y-wallH,Math.max(0,right.x-q.x-w*.61),wallH+this.H*.12,fill);
   for(let x=left.x+25*u;x<right.x;x+=140*u){if(Math.abs(x-q.x)<w*.8)continue;this.line(x,q.y-wallH+5*u,x,q.y+this.H*.11,rock?'#5d796e':'#718a91',4*u);this.line(x+7*u,q.y-wallH+5*u,x+7*u,q.y+this.H*.11,'#0c2028',2*u);}
   this.line(left.x,q.y,right.x,q.y,'#9bafa7',4*u);c.globalAlpha=keep;
   this.line(left.x,q.y-h*1.13,right.x,q.y-h*1.13,'#758c93',3*u);
   if(!rock){this.rect(q.x-w*.60,q.y-h*1.08,w*1.2,h*1.08,'#52666a','#adc0b9');this.rect(q.x-w*.5,q.y-h,w,h,'#081a23','#8fa8a7');}
   this.line(approach.x-28*u,approach.y, q.x-28*u,q.y,'#e6c48c99',2*u);this.line(approach.x+28*u,approach.y,q.x+28*u,q.y,'#e6c48c99',2*u);
  }
  if(type==='rock-breach'||type==='crawl-opening'){
   const ht=type==='crawl-opening'?h*.47:h,ww=w*.6;
   this.path([[q.x-ww,q.y],[q.x-ww*1.22,q.y-ht*.65],[q.x-ww*.51,q.y-ht*1.10],[q.x+ww*.63,q.y-ht*1.02],[q.x+ww*1.1,q.y-ht*.55],[q.x+ww,q.y]],'#0c1b20','#758781',9*u);
   if(!status.open)for(let j=0;j<5;j++)this.line(q.x-ww,q.y-ht*.12-j*ht*.15,q.x+ww,q.y-ht*.86+j*ht*.16,'#7c8269',3*u);
  }else if(type==='lift-cage'){
   for(const sign of[-1,1])this.line(q.x+sign*w*.68,0,q.x+sign*w*.68,q.y,'#a0b5b3',3*u);
   this.rect(q.x-w*.55,q.y-h,w*1.1,h,'#1c343f','#a2b9b5');for(let j=0;j<8;j++)this.line(q.x-w*.45+j*w*.13,q.y-h+8*u,q.x-w*.45+j*w*.13,q.y-10*u,'#93aaa7',2*u);
   this.rect(q.x-w*.65,q.y-5*u,w*1.3,9*u,'#c5bc93');
   if(!status.open)this.text('CAGE INDISPONIBLE',q.x,q.y-h-15*u,9*u,'#e7b18e','center');
  }else if(type==='stairwell'){
   for(let j=0;j<9;j++){const yy=q.y-j*h*.09,ww=w*(1-j*.055);this.rect(q.x-ww/2,yy-9*u,ww,10*u,'#657c82','#a1bab7');}
   this.line(q.x-w*.61,q.y,q.x-w*.36,q.y-h,'#bdc9b5',3*u);this.line(q.x+w*.61,q.y,q.x+w*.36,q.y-h,'#bdc9b5',3*u);
  }else if(type==='boarding-ramp'){
   this.path([[q.x-w*.8,q.y],[q.x+w*.8,q.y],[q.x+w*.5,q.y-h*.47],[q.x-w*.5,q.y-h*.47]],'#596e73','#bec5ac',2*u);
   for(let j=0;j<7;j++)this.line(q.x-w*.65,q.y-j*9*u,q.x+w*.65,q.y-j*9*u,'#9bafa766',2*u);
  }else if(m==='back'||m==='front'){
   this.rect(q.x-w*.48,q.y-h+5*u,w*.96,h-10*u,status.open?'#091c24':'#425e67');
   if(!status.open)this.line(q.x,q.y-h,q.x,q.y,'#b6c5b4',2*u);
  }
  if(type==='building-entrance'){
   this.path([[q.x-w*1.3,q.y-h],[q.x-w,q.y-h*1.35],[q.x+w,q.y-h*1.35],[q.x+w*1.3,q.y-h]],'#53666a','#9cada8',2*u);
  }
  c.globalAlpha=1;this.ellipse(approach.x,approach.y,23*u,5*u,color+'66');
  if(near){const tx=Math.max(this.camera+155,Math.min(g.room.width-150,d.x))-this.camera;
   this.rect(tx-148,q.y-h-49*u,296,39*u,'#071923eb');this.text(d.label,tx,q.y-h-32*u,11*u,color,'center');
   this.text(({left:'PAROI GAUCHE',right:'PAROI DROITE',back:'PAROI DE FOND',front:'PREMIER PLAN'})[m]+' · '+({ 'lift-cage':'CAGE','stairwell':'PALIER','crawl-opening':'CONDUIT','rock-breach':'BRÈCHE','boarding-ramp':'RAMPE'}[type]||'PASSAGE'),tx,q.y-h-17*u,9*u,'#a7bfbc','center');}
  c.restore();
 }
 stasisDisplay(slot,time){const g=this.game,a=g.state.rescue.actors.find(a=>a.id===slot.id);if(!a)return;const q=this.pos(slot.x,slot.z),u=this.unit;this.stretcher({...a,x:slot.x,z:slot.z,displayZ:slot.z,moving:false},time);this.path([[q.x-104*u,q.y],[q.x-100*u,q.y-93*u],[q.x-77*u,q.y-122*u],[q.x+72*u,q.y-122*u],[q.x+102*u,q.y-91*u],[q.x+105*u,q.y]],'#8ed5d51a','#91b2b3',2*u);this.line(q.x-106*u,q.y+10*u,q.x+106*u,q.y+10*u,'#8ba8a6',7*u);this.text(a.name+' · STASE / PARASITE CONSERVÉ',q.x,q.y-139*u,10*u,'#c1d7ce','center');}
 armoryRack(a){const g=this.game,q=this.pos(a.x,a.bodyZ),u=this.unit;
  this.rect(q.x-117*u,q.y-145*u,234*u,146*u,'#1b313d','#889f9d');
  for(let j=0;j<2;j++){const yy=q.y-(107-j*54)*u;this.rect(q.x-90*u,yy,145*u,17*u,g.state.armory.claimed?'#273c45':j?'#8fa9a9':'#798d75');this.rect(q.x+50*u,yy+4*u,44*u,6*u,'#637c80');this.rect(q.x-30*u,yy+17*u,15*u,19*u,'#6b858b');}
  this.text(g.state.armory.claimed?'ALLOCATION RETIRÉE':'DOTATION · IMPULSIONS / PLASMA',q.x,q.y-159*u,10*u,'#d9c295','center');
  const at=this.pos(a.x,g.zFor(a));this.line(q.x, q.y,at.x,at.y,'#acb99555',1.5);this.ellipse(at.x,at.y,24,5,'#c3a86f55');
 }

 object(o){
  const g=this.game,q=this.pos(o.x,g.zFor(o)),u=this.unit,done=!!g.state.flags[o.flag],active=g.current?.id===o.id;
  if(o.type==='boss')return;
  if(o.type==='rescue'){
   this.shadow(q,65);this.rect(q.x-60,q.y-30*u,120,15*u,'#7d916d');this.rect(q.x-51,q.y-49*u,84,19*u,'#425a3c');this.ellipse(q.x+38,q.y-48*u,14*u,11*u,'#9f9c6d');this.line(q.x-54,q.y-15*u,q.x-54,q.y,'#b3bf93',4);this.line(q.x+53,q.y-15*u,q.x+53,q.y,'#b3bf93',4);if(!done)this.ellipse(q.x+38,q.y-55*u,15,7,'#827e42');
  }else if(o.type==='capture'){
   this.shadow(q,135);this.rect(q.x-122,q.y-125*u,244,124*u,'#203b28c0','#9fac7e');for(let j=0;j<9;j++)this.line(q.x-110+j*27,q.y-116*u,q.x-110+j*27,q.y-6*u,'#91a77690',4);this.line(q.x-125,q.y-128*u,q.x+125,q.y-128*u,'#c1c49b',8);this.rect(q.x-134,q.y-44*u,27,40*u,'#596f45');if(done){this.ellipse(q.x,q.y-75*u,65,21,'#152319');this.text('VERROUILLÉ',q.x,q.y-138*u,10,'#e0d195','center');}
  }else if(['sample','scan','survey','recover','brood','sense'].includes(o.type)){
   this.shadow(q,32);this.rect(q.x-30,q.y-26*u,60,25*u,'#627755','#a4b38b');this.rect(q.x-22,q.y-33*u,44,8*u,'#a4b485');this.ellipse(q.x+3,q.y-45*u,12,10,'#d1cf9580');
  }else if(o.type==='sleep'){
   this.rect(q.x-63,q.y-58*u,125,48*u,'#607a59','#c8d3a7');this.path([[q.x-63,q.y-58*u],[q.x-43,q.y-100*u],[q.x+41,q.y-100*u],[q.x+62,q.y-58*u]],'#a2baa333','#aabe98');this.rect(q.x-35,q.y-65*u,72,8*u,'#c8d1a8');
  }else{
   this.shadow(q,30);this.rect(q.x-8,q.y-82*u,16,83*u,'#5b7753');this.rect(q.x-36,q.y-111*u,72,47*u,'#2b4331','#8eab7e');this.rect(q.x-28,q.y-102*u,56,29*u,done?'#688665':'#94b27b');for(let j=0;j<4;j++)this.line(q.x-23,q.y-(96-j*5)*u,q.x+18+(j%2)*4,q.y-(96-j*5)*u,'#243c2b',1);this.rect(q.x-27,q.y-61*u,54,10*u,'#68835a');
  }
  if(active){const yy=q.y-148*u;this.path([[q.x,yy+9],[q.x-5,yy],[q.x+5,yy]],'#f0d385');this.ellipse(q.x,q.y,25,4,'#d8c77044');}
 }
 archive(a){const q=this.pos(a.x,this.game.zFor(a)),u=this.unit;this.rect(q.x-16,q.y-38*u,32,37*u,'#314c36','#bbba83');this.rect(q.x-10,q.y-32*u,20,18*u,'#8da875');this.line(q.x-6,q.y-27*u,q.x+6,q.y-27*u,'#213c27',1);this.line(q.x-6,q.y-22*u,q.x+4,q.y-22*u,'#213c27',1);}
 supply(){const q=this.pos(320,.55),u=this.unit;this.rect(q.x-43,q.y-43*u,86,42*u,'#6f7850','#a4b183');this.rect(q.x-35,q.y-35*u,70,18*u,this.game.rs.supplyUsed?'#223d27':'#4c6541');this.rect(q.x-6,q.y-34*u,12,24*u,'#d1d0a0');this.rect(q.x-12,q.y-28*u,24,12*u,'#d1d0a0');}
 human(a,t,role){
  const q=this.pos(a.x,this.game.zFor(a)),c=this.ctx,g=this.game;let s=this.unit*(.82+this.game.zFor(a)*.30);if(role==='decker'&&(g.p.crouch||g.p.dodgeTime>0))s*=.78;
  const profile=SoSData.fidelity.characters[role]||SoSData.fidelity.characters.worker;const f=a.facing||1,walk=!!a.moving;
  const swing=walk&&!this.reduced?Math.sin(t*9)*7:0;this.shadow(q,24*s);c.save();c.translate(q.x,q.y);c.scale(s*f*profile.build,s);
  const jacket=profile.jacket,skin=profile.skin;
  this.line(-10,-35,-13+swing,-8,'#263c32',12);this.line(10,-35,13-swing,-8,'#304637',12);this.line(-13+swing,-6,-22+swing,-5,'#14231e',9);this.line(13-swing,-6,23-swing,-5,'#14231e',9);
  this.path([[-18,-77],[13,-78],[24,-48],[14,-29],[-16,-29],[-23,-52]],jacket,'#a7ab7d',1);this.rect(-18,-65,37,9,'#314437');this.line(0,-71,1,-35,'#c0b38166',1);this.rect(-22,-62,8,29,'#233c30');this.rect(9,-48,9,12,'#b2a577');
  this.line(-14,-67,-21,-42,jacket,10);this.line(-21,-42,-10,-34,skin,7);this.line(13,-66,26,-52,jacket,10);this.line(26,-52,37,-56,skin,7);
  if(role==='manning'||role==='decker'&&g.state.inventory.pistol){this.rect(27,-61,32,8,'#172c24');this.rect(31,-56,7,14,'#1b3027');this.line(54,-58,65,-58,'#677b63',4);this.rect(33,-63,11,2,'#9bb485');if(role==='decker'&&['pulse','plasma'].includes(g.p.weapon)){this.rect(24,-65,61,14,g.p.weapon==='plasma'?'#526d7c':'#55665e');this.rect(77,-61,18,6,'#b3c6c3');this.rect(36,-51,15,15,'#3b5056');if(g.p.weapon==='plasma'){this.rect(29,-63,11,4,g.state.armory.locked?'#da8a68':'#84d4e4');this.ellipse(-23,-58,9,20,'#5a7380');}}if(role==='decker'&&g.p.weapon==='foam')this.ellipse(33,-51,13,7,'#a4ac70');if(role==='decker'&&g.p.weapon==='flame')this.ellipse(-23,-56,8,19,'#657953');}
  this.rect(-5,-87,11,11,skin);this.ellipse(0,-93,12,15,skin);this.path([[-13,-92],[-13,-103],[-7,-110],[8,-108],[14,-98],[10,-95],[3,-102],[-6,-98]],profile.hair);this.line(5,-94,9,-94,'#1a3024',2);this.line(5,-86,9,-86,'#6f6549',1);
  if(role==='manning'){for(let j=0;j<5;j++)this.line(-10+j*4,-106,-12+j*4,-99,'#b4b7b1',1.7);if(g.state.flags.queen_down){this.rect(-17,-24,15,10,'#bdba9c');this.rect(7,-24,15,10,'#bdba9c');}}
  if(role==='adams'){for(const [x,y]of[[2,-91],[7,-90],[4,-88]])this.ellipse(x,y,1,1,'#795442');}
  if(profile.style==='corporate'){this.path([[-11,-75],[0,-56],[9,-76],[0,-69]],'#acb9b0');this.line(0,-67,0,-48,'#232f38',3);}
  if(role==='decker'){this.rect(-14,-71,12,7,'#bbd1c1');if(g.state.flags.accident&&!g.state.flags.equipped)this.rect(-16,-26,14,11,'#bdb9a3');}
  if(role==='decker'&&g.state.flags.equipped&&g.p.lamp){this.line(8,-84,19,-78,'#394d35',2);this.ellipse(20,-77,3,3,'#e0d08b');const beam=c.createLinearGradient(45,-62,350,-24);beam.addColorStop(0,'#e1e6ad19');beam.addColorStop(1,'#e1e6ad00');this.path([[38,-61],[350,-109],[350,8]],beam);}
  c.restore();
  if(role!=='decker'&&g.distance(a,g.p)<290){this.text(profile.name,q.x,q.y-126*this.unit,11,'#d4dcce','center');}
 }
 alien(e,t){
  const q=this.pos(e.x,this.game.zFor(e)),c=this.ctx,g=this.game;const f=e.facing||1;let s=this.unit*(.85+g.zFor(e)*.33);if(e.kind==='queen')s*=2.23;
  this.shadow(q,(e.kind==='queen'?85:45)*this.unit);c.save();c.translate(q.x,q.y);c.scale(s*f,s);
  if(e.kind==='facehugger'){
   for(let j=0;j<4;j++){const swing=this.reduced?0:Math.sin(t*14+j)*4;this.line(-10+j*7,-14,-26+j*11,-1+swing,'#c1b77e',3);this.line(-10+j*7,-17,-28+j*13,-28-swing,'#979a65',3);}this.ellipse(0,-17,15,9,'#b4b27c');c.beginPath();c.moveTo(-10,-17);c.bezierCurveTo(-36,-16,-57,-4,-68,-14);c.strokeStyle='#969b60';c.lineWidth=4;c.stroke();c.restore();return;
  }
  const stride=this.reduced?0:Math.sin(t*(e.mode==='hunt'?10:3))*9;
  c.beginPath();c.moveTo(-14,-42);c.bezierCurveTo(-79,-26,-93,-105,-134,-81);c.strokeStyle='#14271c';c.lineWidth=11;c.stroke();c.strokeStyle='#8ea079';c.lineWidth=2;c.stroke();
  for(let j=0;j<4;j++){c.beginPath();c.moveTo(-16+j*3,-74-j*4);c.quadraticCurveTo(-41-j*5,-100-j*5,-41-j*6,-116-j*2);c.strokeStyle='#2d4732';c.lineWidth=7;c.stroke();c.strokeStyle='#809471';c.lineWidth=1;c.stroke();}
  this.line(-6,-39,-25+stride,-23,'#304d36',11);this.line(-25+stride,-23,-14+stride,-3,'#516c49',7);this.line(14,-43,33-stride,-26,'#29462e',11);this.line(33-stride,-26,25-stride,-2,'#6c8057',6);
  this.path([[-16,-91],[15,-93],[28,-69],[18,-37],[-3,-29],[-21,-53]],'#233b28','#829a6c',1);
  for(let j=0;j<6;j++){c.beginPath();c.moveTo(-16,-82+j*7);c.quadraticCurveTo(2,-72+j*7,21,-84+j*7);c.strokeStyle=j%2?'#769065':'#485f42';c.lineWidth=3;c.stroke();}
  this.line(12,-85,37,-70,'#4a6848',9);this.line(37,-70,44,-44,'#2b472f',7);this.line(-13,-83,-30,-65,'#4c6c49',9);this.line(-30,-65,-30,-35,'#2a462e',6);for(let j=0;j<3;j++){this.line(43,-44,48+j*5,-33+j*3,'#aac08b',2);this.line(-30,-35,-35-j*4,-28+j*4,'#8ea77b',2);}
  const head=c.createLinearGradient(-38,-141,50,-104);head.addColorStop(0,'#223f2f');head.addColorStop(.45,'#a0b294');head.addColorStop(.56,'#617d61');head.addColorStop(1,'#142b1c');
  c.beginPath();c.moveTo(-40,-114);c.bezierCurveTo(-52,-148,22,-153,42,-129);c.bezierCurveTo(56,-117,41,-104,18,-101);c.lineTo(-23,-104);c.closePath();c.fillStyle=head;c.fill();c.strokeStyle='#b5c3a0';c.lineWidth=1;c.stroke();
  this.path([[18,-110],[37,-113],[32,-99],[15,-100]],'#0a1e14');for(let j=0;j<5;j++)this.line(18+j*3,-108,19+j*3,-102,'#c3d1b7',1);
  if(e.kind==='queen'){
   this.path([[-46,-122],[-68,-174],[-38,-157],[-38,-191],[-10,-158],[4,-183],[20,-157],[50,-172],[36,-136],[54,-143],[32,-117]],'#355534','#a5b384',1.3);for(let j=0;j<4;j++)this.line(-37+j*18,-151,-18+j*11,-118,'#658356',2);
  }
  if(e.foam>.1){c.globalAlpha=clamp(e.foam,.2,.85);this.ellipse(0,-25,45,22,'#c6cba3');this.ellipse(-14,-42,23,18,'#c6cba3');c.globalAlpha=1;}
  c.restore();
 }
 egg(a,sc=1){const q=this.pos(a.x,a.z),c=this.ctx,u=this.unit*sc;const gr=c.createLinearGradient(q.x-20,0,q.x+20,0);gr.addColorStop(0,'#263f23');gr.addColorStop(.55,'#7f9255');gr.addColorStop(1,'#172f1e');this.ellipse(q.x,q.y-28*u,23*u,34*u,gr);this.line(q.x,q.y-60*u,q.x,q.y-37*u,'#223c25',3);this.line(q.x-14*u,q.y-56*u,q.x,q.y-47*u,'#9aab6a',2);}
 corpse(e){const q=this.pos(e.x,this.game.zFor(e));this.ellipse(q.x,q.y-4,47,9,'#11261a');this.line(q.x-32,q.y-7,q.x+40,q.y+3,'#79936655',3);}
 weakpoint(w){const q=this.pos(w.x,this.game.zFor(w)),c=this.ctx,u=this.unit;this.line(q.x,q.y-2,q.x-20,q.y-160*u,w.hp>0?'#a6a15d':'#303e27',12);this.line(q.x+12,q.y-2,q.x+35,q.y-141*u,w.hp>0?'#7a8750':'#283b24',7);if(w.hp>0){this.ellipse(q.x,q.y-72*u,18,24,'#b6b77b');this.ellipse(q.x,q.y-72*u,9,17,'#d9c675');}else this.ellipse(q.x,q.y-8,38,8,'#667337');}
 addEffect(e){if(e.type==='shot')this.effects.push({...e,ttl:.13,max:.13});if(e.type==='hit'||e.type==='spark')this.effects.push({...e,ttl:.22,max:.22});}
 drawEffects(dt){for(const e of this.effects){e.ttl-=dt;if(e.ttl<=0)continue;const c=this.ctx;c.save();c.globalAlpha=e.ttl/e.max;if(e.type==='shot'){const a=this.pos(e.from.x,this.game.mode==='SIDE'?.55:e.from.z),b=this.pos(e.to.x,this.game.mode==='SIDE'?.55:e.to.z);const col=e.weapon==='flame'?'#f7c268':e.weapon==='foam'?'#c9d4b0':'#e8dcb2';this.line(a.x+25,a.y-61*this.unit,b.x,b.y-62*this.unit,col,e.weapon==='flame'?13:e.weapon==='foam'?9:1.7);this.ellipse(a.x+29,a.y-61*this.unit,13,6,col);}else{const a=this.pos(e.x,this.game.mode==='SIDE'?.55:e.z);for(let j=0;j<7;j++){const an=j*.89,rr=(1-e.ttl/e.max)*60;this.line(a.x,a.y-60*this.unit,a.x+Math.cos(an)*rr,a.y-60*this.unit+Math.sin(an)*rr,'#c2cf82',2);}}c.restore();}this.effects=this.effects.filter(x=>x.ttl>0);}
 atmosphere(t){
  const c=this.ctx,{W,H}=this;const sand=this.game.room.kind==='sand';
  for(let i=0;i<(sand?58:25);i++){const x=(i*113.97+(this.reduced?0:t*(sand?44:9)))%(W+60)-30;const y=H*(.10+((i*31)%82)/100);this.line(x,y,x+(sand?12:2),y+(sand?-2:0),sand?'#dcd7a71b':'#d9e0b230',sand?1:2);}
  const vignette=c.createRadialGradient(W*.5,H*.6,W*.25,W*.5,H*.6,W*.71);vignette.addColorStop(0,'#00110c00');vignette.addColorStop(1,'#00110c75');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 }
 foreground(t){
  const c=this.ctx,{W,H}=this,r=this.game.room;if(r.kind==='sand'){for(let i=0;i<15;i++){const x=i*151-this.camera*1.12%151;this.line(x,H,x+9,H-27-(i%3)*8,'#1a2a1977',3);}return;}
  this.path([[0,H],[0,H*.83],[20,H*.83],[48,H*.93],[110,H]],'#0a1810a0');this.path([[W,H],[W,H*.83],[W-30,H*.83],[W-57,H*.95],[W-124,H]],'#0a1810a0');
 }
}
root.SoSRenderer=Renderer;
})(globalThis);
