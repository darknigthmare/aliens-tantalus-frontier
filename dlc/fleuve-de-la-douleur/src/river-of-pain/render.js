/* Original, code-drawn scenery. No concept-art screenshot or third-party image is used as gameplay. */
(function(root){'use strict';
const C=root.ROP_CORE,D=root.ROP_DATA;
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,97);
const noise=(n,s=0)=>{let v=Math.sin(n*127.1+s*311.7)*43758.5453;return v-Math.floor(v);};
const lerp=(a,b,t)=>a+(b-a)*t;
class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.cam=0;this.room='';this.time=0;this.w=1440;this.h=810;this.scale=1;this.reduced=false;}
 resize(){const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(2,root.devicePixelRatio||1);this.w=Math.max(320,rect.width);this.h=Math.max(240,rect.height);this.scale=this.h/760;
  const w=Math.round(this.w*dpr),h=Math.round(this.h*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.ctx.setTransform(dpr,0,0,dpr,0,0);}
 rect(x,y,w,h,fill,stroke){const g=this.ctx;if(fill){g.fillStyle=fill;g.fillRect(x,y,w,h);}if(stroke){g.strokeStyle=stroke;g.strokeRect(x+.5,y+.5,w-1,h-1);}}
 path(points,fill,stroke,width=1){const g=this.ctx;g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.lineWidth=width;g.strokeStyle=stroke;g.stroke();}}
 line(x,y,x2,y2,color,width=1){const g=this.ctx;g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();}
 text(text,x,y,size=12,color='#bccbc8',align='left',font='monospace'){const g=this.ctx;g.fillStyle=color;g.font=`${size}px ${font}`;g.textAlign=align;g.fillText(text,x,y);}
 circle(x,y,r,color){const g=this.ctx;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=color;g.fill();}
 ellipse(x,y,rx,ry,color){const g=this.ctx;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);g.fillStyle=color;g.fill();}
 glow(x,y,r,color){const g=this.ctx,gradient=g.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,color);gradient.addColorStop(1,'transparent');g.fillStyle=gradient;g.fillRect(x-r,y-r,r*2,r*2);}
 project(x,z){return {x:(x-this.cam)*this.scale,y:this.h*.625+z*this.h*.31};}
 render(sim,dt=0){
  this.resize();const g=this.ctx,s=sim.s,r=sim.room,w=sim.ensureRoom();this.classic=s.mode==='classic';this.time+=this.reduced?0:dt;const W=this.w,H=this.h,k=this.scale;
  let desired=C.clamp(s.player.x-W/k*.43,0,Math.max(0,r.width-W/k));if(this.room!==r.id||this.reduced){this.cam=desired;this.room=r.id;}else this.cam=lerp(this.cam,desired,1-Math.exp(-dt*9));
  this.background(r,s);
  this.architecture?.(r,s);
  // Floor has screen-space vanishing rays and world-space grated sections, not lane overlays.
  const fy=H*.68, grad=g.createLinearGradient(0,fy,0,H);grad.addColorStop(0,r.kind==='exterior'?'#283a3e':'#263739');grad.addColorStop(1,'#101a1c');g.fillStyle=grad;g.fillRect(0,fy,W,H-fy);
  this.line(0,fy,W,fy,'#596766',2);
  for(let y=fy+17;y<H;y+=12+(y-fy)*.04)this.line(0,y,W,y,'#52615a25',1);
  const stride=110*k,offset=(this.cam*k)%stride;
  for(let x=-stride-offset;x<W+stride;x+=stride){this.line(x,fy,W*.48+(x-W*.48)*1.17,H,'#080f13',1.4);this.line(x+3,fy,W*.48+(x-W*.48)*1.17+3,H,'#6b7d7c25',1);}
  for(let x=-((this.cam*k)% (480*k));x<W;x+=480*k){this.rect(x,H*.91,240*k,3*k,'#c1a14f44');this.text(r.kind==='exterior'?'LV-426':r.building.toUpperCase(),x+8,H*.94,10*k,'#8b9a9760');}
  this.roadGround?.(sim);
  // Structural portals and mounted furniture use the same transform as their interactions.
  for(const portal of r.portals)this.portal(portal,r,s);
  for(const prop of r.props.filter(p=>p.layer!=='ACTORS'))this.prop(prop,r,s);
  if(r.kind==='vent')this.vent(r,s);
  const draw=[];
  for(const prop of r.props.filter(p=>p.layer==='ACTORS'))draw.push({z:prop.z,run:()=>this.prop(prop,r,s)});
  this.lifeDraws?.(sim,draw);this.defenseDraws?.(sim,draw);this.ductDraws?.(sim,draw);this.mobilityDraws?.(sim,draw);
  for(const a of w.acid){const p=this.project(a.x,a.z);this.ellipse(p.x,p.y,46*k,11*k,'#778f3966');this.glow(p.x,p.y,38*k,'#97b64b28');for(let i=0;i<6;i++)this.circle(p.x+(noise(i,hash(r.id))-.5)*75*k,p.y+(noise(i+9)-.5)*16*k,2*k,'#c5d37699');}
  for(const f of w.flares){const p=this.project(f.x,f.z);this.rect(p.x-14*k,p.y-3*k,24*k,4*k,'#e4a468');this.glow(p.x+10*k,p.y-7*k,130*k,'#ed793365');this.circle(p.x+10*k,p.y-4*k,4*k,'#ffe8b0');for(let i=0;i<4;i++){const t=(this.time*30+i*11)%60;this.circle(p.x+10*k+Math.sin(t+i)*t*.1,p.y-t*k,1.8*k,'#e4a155'+(f.ttl>2?'99':'44'));}}
  for(const o of r.objects){if(o.phaseMax!==undefined&&s.phase>o.phaseMax)continue;if(o.kind==='side-task'&&!root.ROP_EXPLORATION.available(s,o))continue;const active=o.chapter===s.chapter&&sim.objective?.id===o.id,found=s.collected.includes(o.id)||s.archives.includes(o.id);
   if(o.chapter!==undefined&&!active)continue;draw.push({z:o.z,run:()=>this.object(o,active,found,r,s)});}
  for(const e of w.enemies)draw.push({z:e.z+.001,run:()=>this.creature(e)});
  if(s.escort)draw.push({z:s.escort.z+.002,run:()=>{this.person(s.escort,s.escort.name==='Luisa'?'luisa':'civilian',false);const p=this.project(s.escort.x,s.escort.z);this.text(s.escort.name,p.x,p.y-84*k,11*k,'#c7ddca','center');}});
  if(!root.ROP_MOBILITY?.mounted(s))draw.push({z:s.player.z+.003,run:()=>{g.save();if(s.systems.hiding)g.globalAlpha=.13;this.person({...s.player,aim:s.exploration.aiming?s.exploration.aim:null},s.character,true);g.restore();}});
  draw.sort((a,b)=>a.z-b.z).forEach(d=>d.run());
  for(const b of sim.bullets){const p=this.project(b.x,b.z),tail=this.project(b.x-b.vx*28,b.z-b.vz*28/600);this.line(tail.x,tail.y-43*k,p.x,p.y-43*k,'#ffe4a7',2.5*k);this.glow(p.x,p.y-43*k,12*k,'#e4b65988');}
  this.colonyOverlays?.(sim);this.mobilityOverlay?.(sim);
  this.foreground(r,s);
  // Sparse atmospheric light and vignetting preserve the playable floor.
  if(r.kind==='exterior')this.rain();
  const v=g.createRadialGradient(W*.5,H*.52,H*.15,W*.5,H*.5,W*.69);v.addColorStop(0,'transparent');v.addColorStop(1,'#01080c94');g.fillStyle=v;g.fillRect(0,0,W,H);
  if(s.phase>=2&&r.kind!=='exterior'){g.fillStyle='#0c122318';g.fillRect(0,0,W,H);}
  if(s.player.hurt>0&&!this.reduced){g.fillStyle='#8b1d191f';g.fillRect(0,0,W,H);}
  // Current objective indicator is tied to an object, never a full-screen targeting overlay.
  const current=sim.candidates()[0];if(current){const p=this.project(current.ref.x,this.classic?.7:current.ref.z);this.circle(p.x,p.y-18*k,4*k,'#dce8ce');}
 }
 background(r,s){
  const g=this.ctx,W=this.w,H=this.h,k=this.scale,seed=hash(r.id),out=r.kind==='exterior';
  const bg=g.createLinearGradient(0,0,0,H*.72);bg.addColorStop(0,out?'#0b1a25':'#0b151a');bg.addColorStop(.6,out?'#33484b':'#263437');bg.addColorStop(1,'#141f23');g.fillStyle=bg;g.fillRect(0,0,W,H);
  if(out){
   // HORIZON / SKYLINE / FAR / MID: storm clouds, mountain silhouettes, colony silhouettes.
   for(let j=0;j<4;j++){
    const pts=[[0,H*.68]];for(let x=-100;x<W+140;x+=70){const world=x+this.cam*(.035+j*.035)*k;const peak=Math.sin(world*.003+seed)*30+noise(Math.floor(world/70),seed+j)*80;pts.push([x,H*(.32+j*.075)-peak*k]);}pts.push([W,H*.7]);this.path(pts,['#364a4d','#273b40','#1c3036','#11262f'][j]);}
   for(let i=-2;i<14;i++){const x=i*240*k-(this.cam*.25*k)%(240*k),y=H*.52,high=(60+noise(i+30,seed)*130)*k;
    this.rect(x,y-high,180*k,high,'#172a32','#354449');this.rect(x-4*k,y-high,188*k,7*k,'#516366');
    for(let wx=x+16*k;wx<x+170*k;wx+=23*k)for(let yy=y-high+22*k;yy<y;yy+=27*k)this.rect(wx,yy,10*k,5*k,noise(wx,yy)>.6?'#b9b58555':'#6f8a8740');
    this.line(x+160*k,y-high,x+160*k,y-high-65*k,'#253e43',3*k);this.circle(x+160*k,y-high-64*k,2*k,s.phase<3?'#edb46e':'#be5649');}
   if(['approach','pad','road'].includes(r.id)){
    const x=W*.78-this.cam*.04*k;this.rect(x-90*k,H*.16,180*k,H*.46,'#1c3038','#5b6e6e');
    this.path([[x-100*k,H*.17],[x-60*k,H*.10],[x+63*k,H*.10],[x+102*k,H*.17]],'#20363c','#586f70');
    for(let i=0;i<7;i++){this.rect(x-81*k+i*25*k,H*.19,12*k,H*.39,'#101f27','#4a6068');}this.text('ATMOSPHERE',x,H*.29,12*k,'#6e8b90','center');
    this.glow(x,H*.16,85*k,'#85c4bf16');}
   this.text('HADLEY’S HOPE',W*.08-this.cam*.06*k,H*.36,36*k,'#a9c1bd22','left','Arial, sans-serif');
  }else{
   const rib=r.kind==='derelict'||r.kind==='hive';
   if(rib){for(let i=-1;i<15;i++){
    const x=i*230*k-(this.cam*k)%(230*k);g.strokeStyle=r.kind==='derelict'?'#52615e':'#3e4d49';g.lineWidth=18*k;g.beginPath();g.moveTo(x-35*k,H*.70);g.bezierCurveTo(x+100*k,H*.43,x+60*k,H*.07,x+190*k,H*.04);g.stroke();
    g.strokeStyle='#9b9d7733';g.lineWidth=4*k;g.stroke();for(let j=0;j<6;j++)this.line(x+j*21*k,H*.16+j*H*.075,x+28*k+j*15*k,H*.23+j*H*.075,'#0b191e',3*k);}
   }else{
    const spacing=210*k,offset=(this.cam*k)%spacing;
    for(let x=-spacing-offset,i=-1;x<W+spacing;x+=spacing,i++){
     this.rect(x+8*k,H*.12,spacing-12*k,H*.55,'#25363a','#475759');this.rect(x+16*k,H*.135,spacing-28*k,H*.26,'#2d404344','#54656730');
     this.rect(x+20*k,H*.45,spacing-42*k,H*.13,'#12272d','#42585c');for(let a=0;a<5;a++)this.line(x+25*k,H*.47+a*12*k,x+spacing-30*k,H*.47+a*12*k,'#354b4f',2*k);
     this.rect(x,H*.04,10*k,H*.645,'#101e26','#4d6263');
     for(const y of [H*.15,H*.42,H*.61]){this.circle(x+5*k,y,2*k,'#758680');}
     const light=s.phase>=2&&i%3===0?'#e1926277':'#cce4d5';this.rect(x+26*k,H*.12,120*k,5*k,light);this.glow(x+85*k,H*.14,100*k,s.phase>=2?'#b2673b0d':'#b2d9c716');
    }
    this.rect(0,H*.56,W,14*k,'#8c9b8833');this.rect(0,H*.56+14*k,W,3*k,'#070e12');
   }
   this.text(r.name.toUpperCase(),W*.10-this.cam*.05*k,H*.29,Math.min(36*k,W*.04),'#c3d4c32c','left','Arial, sans-serif');
   this.text(`${r.building.toUpperCase()}    /    ${r.floor===0?'NIVEAU PRINCIPAL':r.floor>0?'NIVEAU +'+r.floor:'SOUS-NIVEAU '+Math.abs(r.floor)}`,W*.10-this.cam*.05*k,H*.33,12*k,'#899d8d66');
  }
  // Ceiling services and continuous upper edge; no rectangular empty region above the playfield.
  if(r.kind!=='exterior')for(let i=0;i<4;i++){const y=(18+i*14)*k;this.rect(0,y,W,7*k,'#0a151a');this.line(0,y,W,y,'#5f70634d',1.5*k);for(let x=-((this.cam*k)% (280*k));x<W;x+=280*k)this.rect(x,y-3*k,9*k,13*k,'#20333a','#66756b');}
 }
 portal(p,r,s){const pt=this.project(p.x,this.classic?.7:p.z),k=this.scale,g=this.ctx,child=p.childOnly,locked=p.requires&&!s.flags[p.requires],sealed=s.doors[[r.id,p.to].sort().join('|')]==='sealed';
  const w=(child?54:94)*k,h=(child?35:133)*k;const left=pt.x-w/2,top=pt.y-h;
  this.ellipse(pt.x,pt.y,w*.7,8*k,'#01060988');this.rect(left-8*k,top-8*k,w+16*k,h+8*k,'#112229','#516365');
  if(child){this.rect(left,top,w,h,'#02080d','#778483');for(let y=top+6*k;y<pt.y;y+=6*k)this.line(left+4*k,y,left+w-4*k,y,'#607372',2*k);}
  else{
   this.path([[left,top+13*k],[left+11*k,top],[left+w-11*k,top],[left+w,top+13*k],[left+w,pt.y],[left,pt.y]],'#132329','#657a75');
   this.rect(left+7*k,top+7*k,w-14*k,h-7*k,'#26393f','#435b5d');this.line(pt.x,top+6*k,pt.x,pt.y,'#030a0d',3*k);
   for(let i=0;i<3;i++)this.rect(left+15*k,top+25*k+i*20*k,w-30*k,4*k,'#4b666a');
   this.rect(left-14*k,top+h*.56,9*k,20*k,'#10232a','#5f7573');this.circle(left-10*k,top+h*.56+6*k,2.5*k,locked?'#d66752':sealed?'#e3b966':'#9acaad');
   for(let i=0;i<7;i++)this.path([[left-8*k+i*15*k,top-8*k],[left+4*k+i*15*k,top-8*k],[left-3*k+i*15*k,top-1*k],[left-15*k+i*15*k,top-1*k]],i%2?'#a59054':'#263233');
   if(sealed){this.line(left+6*k,top+h*.35,left+w-6*k,top+h*.8,'#d6a869',4*k);this.line(left+6*k,top+h*.8,left+w-6*k,top+h*.35,'#6d8078',4*k);}
  }
  const dest=C.roomDef(p.to);let label=dest.name;this.text(label.length>26?label.slice(0,24)+'…':label,pt.x,top-18*k,10*k,'#c6d6c3','center');
  this.text(p.kind.toUpperCase(),pt.x,pt.y+15*k,8*k,'#91a397','center');
  if(p.kind==='escalier'||p.kind==='échelle'||p.kind==='monte-charge'){
   const direction=dest.floor>r.floor?'↑':dest.floor<r.floor?'↓':'↔';this.text(direction,pt.x,top+h*.75,22*k,'#b7c3ae','center');}
 }
 prop(p,r,s){
  if(this.extraProp?.(p,r,s))return;
  const v=this.project(p.x,p.z),baseScale=this.scale*(.8+p.z*.28),g=this.ctx;g.save();g.translate(v.x,v.y);g.scale(baseScale,baseScale);
  if(p.collidable){const near=Math.abs(s.player.x-p.x)<160&&s.player.z<p.z;if(near)g.globalAlpha=.38;}
  const kind=p.kind,seed=hash(p.id),x=0,y=0;
  const rr=(x,y,w,h,c,b)=>this.rect(x,y,w,h,c,b),line=(x,y,a,b,c,w)=>this.line(x,y,a,b,c,w);
  // Shared manufacturing parts; each semantic prop has its own silhouette, mounting and scale.
  const box=(w,h)=>{this.path([[-w/2,-h],[-w/2+10,-h-6],[w/2+10,-h-6],[w/2,-h]],'#53605b','#708278');rr(-w/2,-h,w,h,'#394b49','#718075');this.path([[w/2,-h],[w/2+10,-h-6],[w/2+10,-6],[w/2,0]],'#1b2e31','#4d6360');};
  const screen=(w=66,h=39)=>{rr(-w/2,-h-38,w,h,'#08171b','#778579');rr(-w/2+5,-h-33,w-10,h-10,'#164345');for(let i=0;i<4;i++)rr(-w/2+9,-h-27+i*6,(w-22)*( .2+noise(i,seed)*.8),2,'#99cba78b');rr(-3,-38,6,26,'#65786b');};
  this.ellipse(0,1,45,7,'#01080b44');
  switch(kind){
   case 'console':case 'radio':case 'panel':case 'monitor':case 'microscope':
    box(80,53);screen(kind==='radio'?48:70,kind==='radio'?25:40);this.path([[-40,-52],[40,-52],[50,-40],[-35,-40]],'#65756b','#97a18c');for(let i=0;i<8;i++)rr(-30+i*8,-47,4,3,i%3?'#213536':'#d2b882');if(kind==='radio'){line(24,-91,24,-135,'#98a698',2);}break;
   case 'screen':case 'map':
    rr(-90,-160,180,104,'#122b31','#738780');rr(-83,-153,166,90,kind==='map'?'#2b514d':'#0b262c');
    for(let i=0;i<9;i++){if(kind==='map')line(-80,-147+i*10,80,-135+i*8,'#abc89a44',1);else rr(-72,-141+i*8,130*noise(i,seed),2,'#99caa799');}
    if(kind==='map'){this.path([[-58,-98],[-35,-112],[-5,-93],[24,-132],[60,-116]],null,'#d5c598',2);}break;
   case 'bed':
    rr(-75,-36,150,25,'#a6b5a2','#dae0c0');rr(-73,-28,100,19,s.phase<2?'#566d69':'#524b3e');rr(32,-40,36,13,'#c8d2bb','#75877a');rr(-80,-21,161,9,'#3a5159','#8a9b97');for(const x of [-67,62])rr(x,-13,7,22,'#47575b');line(-81,-39,-81,0,'#869d98',4);break;
   case 'table':
    this.path([[-87,-45],[64,-54],[90,-35],[-65,-29]],'#667369','#9ca68c');rr(-64,-29,8,29,'#364f51');rr(60,-39,8,39,'#364f51');rr(-42,-57,13,14,'#9baf9e','#d0d4b8');rr(12,-52,27,4,'#a29b7a');break;
   case 'bench':case 'seat':
    rr(-64,-37,125,10,'#65756c','#a1ac8d');rr(-64,-69,125,24,'#2a4a4d','#607b75');for(let i=0;i<5;i++)line(-52+i*23,-65,-52+i*23,-49,'#4b6a66',2);rr(-48,-27,7,27,'#385359');rr(40,-27,7,27,'#385359');break;
   case 'locker':case 'cupboard':case 'fridge':case 'hab-door':
    rr(-45,-158,90,158,'#33494a','#687b6e');rr(-38,-149,76,142,'#2a4043','#83948266');line(2,-146,2,-8,'#152c31',2);rr(9,-78,4,20,'#a2b5a0');for(let j=0;j<4;j++)rr(-29,-135+j*7,51,2,'#142b2e');this.text(kind==='hab-door'?'HAB '+(seed%50+1):'STOCK',0,-98,9,'#c3c4a2','center');break;
   case 'rack':case 'shelf':case 'medicine':
    rr(-62,-170,124,170,'#162c31','#647e78');for(let j=0;j<4;j++){const yy=-151+j*40;rr(-59,yy+27,118,5,'#7d8c7b');for(let i=0;i<5;i++)rr(-52+i*21,yy,16,27,['#546663','#7c8167','#304d51'][i%3],'#a1a68855');}break;
   case 'tank':case 'transformer':case 'turbine':case 'coil':case 'tower':
    if(kind==='turbine'){rr(-112,-173,224,172,'#203a3e','#70887c');this.circle(0,-95,75,'#11292f');this.circle(0,-95,67,'#456360');for(let i=0;i<12;i++){const a=i*Math.PI/6;line(Math.cos(a)*22,-95+Math.sin(a)*22,Math.cos(a+.28)*62,-95+Math.sin(a+.28)*62,'#172e35',9);}this.circle(0,-95,23,'#718475');}
    else {rr(-54,-170,108,160,'#3c5757','#8a9b88');this.ellipse(0,-170,54,12,'#7b8d7e');this.ellipse(0,-10,54,12,'#283e42');for(let j=0;j<6;j++)rr(-55,-148+j*23,110,5,'#1b3439','#718172');rr(-13,-112,26,31,'#082e33','#a7b39c');rr(-8,-108,16,18,'#649e8c');if(kind==='transformer')for(let j=0;j<5;j++)rr(57+j*4,-146,2,120,'#586e66');}
    break;
   case 'pipe':case 'cable':case 'valve':
    line(-120,-103,98,-103,'#0c1c23',18);line(-120,-106,96,-106,'#57736b',10);line(90,-104,90,0,'#364e52',14);
    for(let x=-90;x<100;x+=55)rr(x,-117,9,27,'#78917e','#adb699');if(kind==='valve'){this.circle(0,-103,28,'#293940');g.strokeStyle='#b7a270';g.lineWidth=5;g.beginPath();g.arc(0,-103,25,0,Math.PI*2);g.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;line(0,-103,Math.cos(a)*25,-103+Math.sin(a)*25,'#b7a270',4);}}break;
   case 'crate':case 'pallet':case 'fuel':case 'cart':
    box(kind==='cart'?150:96,kind==='cart'?55:67);for(let i=0;i<3;i++)rr(-38+i*31,-66,6,66,'#172d2f');rr(-20,-49,40,18,'#b7aa73');this.text(kind==='fuel'?'FUEL':'W-Y',0,-37,10,'#2d3e39','center');if(kind==='cart'){for(const x of [-58,58])this.circle(x,5,9,'#182c32');line(75,-50,85,-85,'#7c8f84',4);}break;
   case 'tractor':case 'wreck':
    this.ellipse(0,3,180,12,'#01070888');for(const x of [-125,-68,74,132]){this.circle(x,-19,29,'#091820');this.circle(x,-19,20,'#34464c');this.circle(x,-19,12,'#73817a');}
    this.path([[-165,-35],[-143,-89],[-50,-100],[-17,-83],[140,-79],[163,-35]],'#697465','#a5aa89');rr(-105,-143,108,63,'#445c5b','#a2ad92');this.path([[-96,-136],[-11,-136],[-8,-93],[-105,-93]],'#0e2b35','#879d9b');line(-53,-136,-53,-93,'#6b8d85',4);rr(30,-95,95,12,'#87917b');rr(-164,-57,24,7,'#ded8a4');rr(142,-56,17,9,'#cc7758');for(let i=0;i<6;i++)rr(15+i*19,-65,13,19,'#344d4e');break;
   case 'shuttle':
    this.path([[-230,-25],[-197,-128],[-93,-178],[130,-145],[230,-61],[217,-20]],'#536963','#9eac92');this.path([[42,-136],[122,-127],[184,-79],[35,-82]],'#183b46','#92b5b3');this.path([[-197,-108],[-128,-129],[-122,-40],[-205,-40]],'#223e45','#8c9f87');rr(-121,-93,101,62,'#344e52','#a8b39e');for(let i=0;i<7;i++)rr(-114+i*13,-84,7,39,'#17313b');for(const x of [-153,164]){rr(x,-23,13,29,'#70857b');rr(x-24,3,61,8,'#202f34');}break;
   case 'gantry':
    for(const x of [-110,110])rr(x,-237,13,237,'#3f5758','#738777');rr(-110,-237,233,20,'#7a8265','#b3b08b');line(-2,-220,-2,-130,'#a4ac92',3);this.path([[-6,-133],[-6,-118],[8,-118],[12,-127]],null,'#879782',5);break;
   case 'beacon':case 'lamp':case 'antenna':
    rr(-5,-126,10,126,'#475e62','#8ca292');rr(-18,-142,36,20,'#758071','#bcb695');this.glow(0,-136,70,s.phase<2?'#d8bd6d20':'#e0814922');rr(-14,-138,28,10,s.phase<2?'#e4d29e':'#d79666');if(kind==='antenna'){line(0,-147,0,-230,'#778d7d',3);line(-40,-197,40,-197,'#778d7d',3);}break;
   case 'fan':case 'wheel':
    rr(-60,-155,120,120,'#152b32','#718b7e');this.circle(0,-95,49,'#526d66');for(let i=0;i<6;i++){const a=i*Math.PI/3+(this.reduced||!root.ROP_COLONY.isPowered(s,r)?0:this.time*.55);this.path([[0,-95],[Math.cos(a)*43,-95+Math.sin(a)*43],[Math.cos(a+.6)*32,-95+Math.sin(a+.6)*32]],'#163039');}this.circle(0,-95,10,'#8ca289');break;
   case 'vending':case 'arcade':case 'washer':
    box(kind==='washer'?105:82,kind==='washer'?98:170);if(kind==='washer'){this.circle(0,-58,33,'#9aa998');this.circle(0,-58,26,'#163b43');this.ellipse(3,-54,16,11,'#728f7d');}else {rr(-32,-143,64,79,'#102d35','#9aaa91');for(let j=0;j<3;j++)for(let i=0;i<4;i++)rr(-25+i*14,-130+j*22,8,15,['#ae9b67','#637d6f','#748d91'][j]);rr(-28,-52,39,7,'#12272e');rr(23,-45,7,7,'#b5bc98');}break;
   case 'specimen':case 'egg':case 'cocoon':case 'resin':case 'rib':case 'fossil':
    if(kind==='specimen'){rr(-32,-94,64,94,'#3a5c5966','#a5b7a0');this.ellipse(0,-94,32,9,'#789087');this.ellipse(0,-2,32,9,'#354e50');this.path([[-17,-38],[-5,-69],[11,-66],[21,-34],[9,-16],[-8,-17]],'#acaf7566','#aeba9699');line(-23,-85,-23,-12,'#c5ddbd99',2);}
    else if(kind==='egg'){this.ellipse(0,-27,26,35,'#425a46');this.ellipse(0,-45,21,10,'#778b62');for(let i=-1;i<=1;i++)line(i*9,-75,i*7,-36,'#152b2c',3);}
    else if(kind==='cocoon'){this.ellipse(0,-88,38,82,'#33473d');for(let i=0;i<12;i++)line(-32+noise(i,seed)*14,-163+i*12,30,-143+i*11,'#8b957a55',3);this.ellipse(0,-121,12,17,'#8c97788c');}
    else if(kind==='fossil'){this.ellipse(0,-95,79,33,'#6c7561');this.path([[-60,-112],[-35,-170],[8,-171],[51,-140],[59,-108]],'#566457','#8f9b78');line(10,-102,70,-25,'#87927a',18);}
    else {g.strokeStyle=kind==='rib'?'#84937a':'#465e4c';g.lineWidth=12;g.beginPath();g.moveTo(-85,0);g.bezierCurveTo(-2,-190,60,-150,110,0);g.stroke();g.lineWidth=3;g.strokeStyle='#a3ad8166';g.stroke();for(let i=0;i<9;i++)line(-90+i*20,-noise(i,seed)*83,18+i*8,-155+noise(i+9,seed)*120,'#60785266',4);}
    break;
   case 'grille':rr(-67,-65,134,65,'#081921','#66877a');for(let i=0;i<9;i++)rr(-61+i*14,-61,5,57,'#4d6e6b');break;
   case 'window':rr(-105,-175,210,122,'#122e38','#6c8e85');for(let i=0;i<3;i++)rr(-95+i*65,-165,56,99,'#284c5866','#78958d66');line(-101,-170,94,-69,'#92aaa533',2);break;
   case 'rock':this.path([[-86,0],[-63,-35],[-22,-62],[33,-73],[74,-34],[89,3]],'#374847','#6c7664');this.path([[-22,-62],[12,-34],[74,-34],[33,-73]],'#4e5b52');break;
   case 'drawing':rr(-33,-117,67,57,'#beb695','#7d8f7d');this.circle(15,-100,7,'#b49558');this.path([[-26,-69],[-9,-102],[13,-71]],null,'#697858',2);this.text('HOME',0,-75,9,'#667250','center');break;
   case 'toy':this.ellipse(0,-17,10,15,'#c5b091');this.circle(0,-39,10,'#cdb69a');line(-9,-25,-20,-15,'#9b8a71',4);line(9,-25,20,-15,'#9b8a71',4);line(-4,-3,-10,7,'#9b8a71',4);line(4,-3,10,7,'#9b8a71',4);break;
   case 'blanket':this.path([[-50,0],[-26,-25],[37,-21],[53,2]],'#6b7868','#99a58c');break;
   case 'plant':box(34,33);for(let i=0;i<5;i++)line(0,-33,(i-2)*15,-75-noise(i)*30,'#6d8662',6);break;
   case 'linen':box(83,58);for(let i=0;i<4;i++)rr(-36,-65-i*8,72,9,'#a8b29a','#6e877a');break;
   case 'stove':case 'sink':box(100,72);rr(-50,-78,100,7,'#9fae9c');if(kind==='sink'){this.ellipse(0,-76,33,9,'#1c3a42');line(14,-75,14,-107,'#abb5a4',4);line(14,-107,0,-107,'#abb5a4',4);}else for(let i=0;i<3;i++)this.circle(-30+i*29,-77,10,'#22373c');break;
   case 'rifle-rack':rr(-58,-134,116,123,'#263e43','#718775');for(let i=0;i<4;i++){rr(-44+i*25,-122,7,91,'#111f27','#7c9085');rr(-45+i*25,-53,19,8,'#61746c');}break;
   case 'hatch':case 'shower':box(105,164);rr(-39,-147,78,140,'#19373e','#7b9484');break;
   case 'tools':case 'ration':case 'sign':default:
    if(kind==='sign'){rr(-85,-170,170,40,'#274649','#9cb09a');this.text('HADLEY’S HOPE',0,-144,13,'#cbd6bc','center');}
    else{box(58,34);rr(-19,-26,37,11,'#b8bd92');this.text(kind==='ration'?'FOOD':'SERVICE',0,-18,7,'#314a3f','center');}break;
  }
  g.restore();
 }
 object(o,active,found,r,s){const p=this.project(o.x,this.classic?.7:o.z),k=this.scale,g=this.ctx;if(found){if(o.kind!=='pickup')this.rect(p.x-10*k,p.y-6*k,20*k,4*k,'#71908255');return;}
  if(o.kind==='side-task'){this.prop({...o,kind:o.hardware,z:this.classic?.7:o.z},r,s);this.text(o.step===1?'□':'◇',p.x,p.y-135*k,14*k,'#90c9d0','center');this.line(p.x-15*k,p.y+5*k,p.x+15*k,p.y+5*k,'#89c1c7',2*k);return;}
  if(o.kind==='hide'){this.prop({...o,kind:'hide-locker',z:this.classic?.7:o.z},r,s);return;}
  if(['talk','escort'].includes(o.kind)){
   const person=o.id==='newt_escape'||o.id==='luisa'?'newt':o.id==='welcome'?'paris':o.id==='family'?'brackett':'anne';this.person({x:o.x,z:this.classic?.7:o.z,facing:-1,walk:0},person,false);
  }else{
   const theme={terminal:'console',power:'panel',valve:'valve',seal:'tools',supply:'crate',scan:'radio',beacon:'beacon',vehicle:'tools',launch:'console',archive:'radio',stash:'ration',trace:'drawing',listen:'grille',pickup:'medicine'}[o.kind]||'console';
   this.prop({id:o.id,kind:theme,x:o.x,z:this.classic?.7:o.z,layer:'ACTORS'},r,s);
  }
  if(active){this.glow(p.x,p.y-30*k,52*k,'#bfd19a12');this.line(p.x-12*k,p.y+4*k,p.x+12*k,p.y+4*k,'#cbd29b',2*k);this.text('◆',p.x,p.y-(o.kind==='talk'||o.kind==='escort'?110:130)*k,13*k,'#d5dca4','center');}
  else if(o.kind==='archive'){this.text('▤',p.x,p.y-105*k,14*k,'#9cbdaf','center');}
 }
 person(p,id,player=false,mul=1){
  const def=p.appearance?{...p.appearance,weapon:null}:(D.characters[id]||D.characters.anne),v=this.project(p.x,p.z),g=this.ctx,k=this.scale*(.82+p.z*.28)*mul,height=def.height,walk=p.walk||0,crouch=p.crouch? .67:1;
  g.save();g.translate(v.x,v.y);g.scale(k,k);this.ellipse(0,1,25,6,'#01070cb0');g.scale(p.facing||1,1);
  const leg=Math.sin(walk)*11,hip=-height*.43*crouch,shoulder=-height*.78*crouch;
  // Boots, trousers, articulated joints, harness, helmet / hair, hands and the separate weapon silhouette.
  for(const [side,shade]of [[1,'#31454a'],[-1,'#202f39']]){
   const knee=side*6+side*leg*.6,foot=side*9+side*leg;this.line(side*5,hip,knee,-height*.2,shade,10);this.line(knee,-height*.2,foot,-6,shade,9);this.rect(foot-5,-7,16,8,'#0b1822','#526461');this.rect(knee-4,-height*.23,9,9,'#667568');}
  this.path([[-12,shoulder],[-17,hip],[12,hip],[16,shoulder+3]],def.color,'#273f40');
  if(def.weapon){this.rect(-11,shoulder+4,25,height*.25,'#3e534c','#9ba17b');this.line(-10,shoulder+5,12,hip,'#8d9878',4);this.rect(-9,hip-12,10,9,'#273c3c','#788778');this.rect(-22,shoulder+8,9,25,'#586751');}
  const face=p.appearance?.skin||(id==='paris'?'#96765a':'#cab095');this.ellipse(0,shoulder-13,10,12,face);this.rect(5,shoulder-16,9,5,'#b8ae89');
  if(def.weapon){this.ellipse(-1,shoulder-22,13,8,'#737e63');this.rect(-14,shoulder-22,26,7,'#76846b','#b0ae8c');this.rect(5,shoulder-19,7,4,'#0e303a');}
  else if(p.appearance){this.ellipse(-2,shoulder-22,11,6,'#594a40');if(def.hair==='tied')this.circle(-13,shoulder-17,6,'#58483d');if(def.hair==='cap'){this.rect(-12,shoulder-24,25,6,def.color);this.line(7,shoulder-20,18,shoulder-20,'#b3b99a',3);}}
  else{this.ellipse(-3,shoulder-22,11,7,id==='newt'?'#a2936a':'#73604b');this.rect(-13,shoulder-21,7,20,id==='newt'?'#ae9b70':'#73604b');}
  if(def.weapon&&!p.stowed){g.save();if(p.aim){const angle=Math.atan2(p.aim.z*.393,Math.abs(p.aim.x));g.translate(12,shoulder+9);g.rotate(angle);g.translate(-12,-shoulder-9);}this.line(10,shoulder+9,23,shoulder+26,def.color,9);this.line(23,shoulder+26,42,shoulder+25,face,6);this.rect(22,shoulder+15,55,10,'#36464c','#8d967a');this.rect(63,shoulder+17,29,4,'#091b23');this.rect(36,shoulder+24,11,13,'#273b42');this.rect(20,shoulder+19,14,9,'#707967');this.rect(39,shoulder+12,21,4,'#233840');g.restore();}
  else{this.line(12,shoulder+8,15+Math.sin(walk)*4,hip+8,def.color,8);this.circle(15+Math.sin(walk)*4,hip+10,4,face);}
  if(player){this.rect(-7,shoulder+5,5,5,'#c1e0ba');if(p.hurt>0)this.glow(0,shoulder+20,35,'#e2a27b22');}
  g.restore();
 }
 creature(e){
  const p=this.project(e.x,e.z),g=this.ctx,k=this.scale*(.82+e.z*.28);g.save();g.translate(p.x,p.y);g.scale(k,k);this.ellipse(0,1,32,7,'#00090dc9');g.scale(e.facing||-1,1);
  if(e.hp<=0){g.rotate(-Math.PI/2);g.scale(.85,.65);g.translate(18,4);}
  const t=this.reduced?0:this.time*(e.state==='chase'?9:3),step=Math.sin(t);
  if(e.kind==='facehugger'){
   for(let i=0;i<4;i++){const a=-12+i*8;this.path([[a,-9],[a-15,-20+step*4],[a-26,-2]],null,'#b9aa79',3);this.path([[a,-7],[a+16,-20-step*3],[a+28,0]],null,'#97835d',3);}
   this.ellipse(0,-12,22,11,'#b3a074');g.beginPath();g.moveTo(-20,-12);g.bezierCurveTo(-78,-38,-75,15,-40,1);g.strokeStyle='#b8aa80';g.lineWidth=4;g.stroke();
  }else{
   // Tail, biomechanical ribs, long dome and dorsal tubes remain readable at play scale.
   g.beginPath();g.moveTo(-15,-45);g.bezierCurveTo(-55,-45,-77,21,-115,-17+step*7);g.strokeStyle='#14262f';g.lineWidth=11;g.stroke();g.strokeStyle='#758c88';g.lineWidth=2;g.stroke();
   for(let i=0;i<6;i++)this.line(-38-i*10,-18+Math.sin(i*.8)*12,-42-i*10,-24+Math.sin(i*.8)*12,'#9aaba022',2);
   for(let i=0;i<3;i++){this.path([[-9,-75+i*9],[-36-i*4,-97+i*10],[-36-i*4,-85+i*10]],null,'#415b60',7);}
   for(const side of [-1,1]){this.line(-6,-46,side*14+step*9,-24,'#172e39',12);this.line(side*14+step*9,-24,side*24-step*13,-5,'#263f48',8);this.line(side*24-step*13,-5,side*24-step*13+18,0,'#678680',3);}
   this.path([[-16,-80],[-19,-51],[-4,-38],[14,-48],[16,-76],[5,-85]],'#182d38','#68837c');for(let i=0;i<5;i++){this.line(-14,-74+i*6,10,-69+i*6,'#7e95875c',2);this.line(-2,-80,-2,-45,'#6c8880',2);}
   this.ellipse(18,-96,42,15,'#162d38');this.ellipse(17,-101,35,8,'#66868b66');g.beginPath();g.ellipse(18,-96,42,15,0,Math.PI,Math.PI*1.8);g.strokeStyle='#b5c7b27a';g.lineWidth=2;g.stroke();this.rect(33,-85,17,8,'#142b34');for(let i=0;i<6;i++)this.line(35+i*2.5,-84,35+i*2.5,-79,'#a6b7a8',1);
   const lunge=e.state==='windup'?27:0;this.line(12,-74,29+lunge,-51,'#34515a',9);this.line(29+lunge,-51,49+lunge,-64+step*5,'#36545d',6);for(let i=0;i<4;i++)this.line(48+lunge,-63+i*3,63+lunge,-61+i*3,'#9bb0a1',2);
  }
  if(e.state==='windup'){this.glow(25,-50,52,'#d7894524');this.text('!',5,-127,18,'#eed1a2','center');}
  g.restore();
 }
 vent(r,s){const W=this.w,H=this.h,k=this.scale;this.rect(0,H*.16,W,H*.45,'#07141bda');this.rect(0,H*.19,W,8*k,'#5b746b');this.rect(0,H*.54,W,12*k,'#667a6b');
  for(let x=-((this.cam*k)%(280*k));x<W;x+=280*k){this.rect(x,H*.16,19*k,H*.44,'#1c333b','#5e7a70');for(let i=0;i<9;i++)this.circle(x+8*k,H*.22+i*H*.038,2*k,'#8d9d83');}
  this.text(r.name.toUpperCase(),W*.07,H*.4,26*k,'#68837d55');
 }
 foreground(r,s){const W=this.w,H=this.h,k=this.scale,g=this.ctx;if(r.kind==='exterior'||r.kind==='vent')return;
  const spacing=940*k, offset=(this.cam*k*1.035)%spacing;
  for(let x=-offset;x<W+spacing;x+=spacing){const px=this.project(s.player.x,s.player.z).x;g.save();g.globalAlpha=Math.abs(x-px)<100*k?.12:.36;
   this.rect(x,0,34*k,H,'#09151d','#3e5356');this.path([[x+34*k,0],[x+105*k,0],[x+34*k,H*.18]],'#08151c','#354950');this.rect(x-5*k,H*.58,46*k,14*k,'#3b4c47');g.restore();}
  this.rect(0,H-7*k,W,7*k,'#071218');
 }
 rain(){const g=this.ctx,W=this.w,H=this.h;if(this.reduced)return;g.save();g.strokeStyle='#c0d5d021';g.lineWidth=1;for(let i=0;i<90;i++){const x=(noise(i,9)*W+this.time*115)%W,y=(noise(i,4)*H+this.time*490)%H;g.beginPath();g.moveTo(x,y);g.lineTo(x-8,y+24);g.stroke();}g.restore();}
}
root.ROP_Renderer=Renderer;
})(globalThis);
