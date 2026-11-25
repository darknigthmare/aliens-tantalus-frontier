
(function(G){
'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,TAU=Math.PI*2;
const palettes={ship:['#142833','#385463','#50666a','#c38d59'],snow:['#142b3a','#5c8291','#9bb8be','#cfb58b'],timber:['#1d282d','#4e524c','#696d61','#cd955d'],ice:['#153547','#406c80','#7299a4','#a8d7dd'],pyramid:['#112933','#375762','#607b7e','#c6a879'],temple:['#12282d','#3e5557','#63716b','#c6995b'],maze:['#12282e','#31464c','#566767','#d8a56b'],hive:['#0d2128','#223e44','#365158','#b6c795'],dock:['#112c3c','#3a667a','#8facb6','#dfbc8b'],alienShip:['#121e29','#304659','#536a79','#beaa7d']};
const ctxPath=(ctx,pts,fill,stroke=null,width=1)=>{ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}};
class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.images={};this.frame=0;this.reduced=false;
  this.ready=Promise.all(Object.entries(G.AVP_ASSETS).map(([id,svg])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[id]=img;resolve();};img.onerror=resolve;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);})));}
 resize(){const box=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.6);const w=Math.max(1,Math.round(box.width*dpr)),h=Math.max(1,Math.round(box.height*dpr));if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h;}this.w=box.width;this.h=box.height;this.dpr=dpr;}
 point(x,y){return {x:(x-this.cam)*this.zoom,y:this.h*.60+(y-40)*this.h*.0013};}
 depth(y){return .84+(y-40)/210*.27;}
 line(x1,y1,x2,y2,col,lw=1){const c=this.ctx;c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
 ellipse(x,y,rx,ry,col){const c=this.ctx;c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
 glow(x,y,r,color){const c=this.ctx,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 glyph(x,y,size,seed=0,color='#c0aa7b'){
  const c=this.ctx;c.save();c.translate(x,y);c.scale(size/24,size/24);c.strokeStyle=color;c.lineWidth=1.4;c.beginPath();
  c.moveTo(-8,-10);c.lineTo(8,-10);c.lineTo(8,4);c.lineTo(-4,4);c.lineTo(-4,10);c.moveTo(-8,-3);c.lineTo(2,-3);c.lineTo(2,-10);c.moveTo(-8,10);c.lineTo(-8,4);
  if(seed%2){c.moveTo(12,-7);c.lineTo(16,0);c.lineTo(12,7);}else{c.moveTo(-12,-11);c.lineTo(-12,10);}c.stroke();c.restore();
 }
 background(room,time){
  const c=this.ctx,w=this.w,h=this.h,bi=room.biome,p=palettes[bi]||palettes.temple;this.palette=p;
  const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,p[0]);bg.addColorStop(.56,p[1]);bg.addColorStop(1,p[0]);c.fillStyle=bg;c.fillRect(0,0,w,h);
  const pan=this.cam*this.zoom;
  if(room.id==='maru'){
   this.glow(w*.72,h*.11,h*.50,'#9eb6bd22');
   for(let i=0;i<3;i++){const y=h*(.37+i*.07);ctxPath(c,[[-100,y],[w*.12,y-32],[w*.28,y-50],[w*.38,y-17],[w*.61,y-26],[w*.78,y-10],[w+100,y],[w+100,h*.61],[-100,h*.61]],['#344e60','#436577','#557983'][i]);}
   c.fillStyle='#213e50';c.fillRect(0,h*.48,w,h*.15);
   for(let y=h*.48;y<h*.62;y+=9)this.line(0,y,w,y,'#8baaaa22',1);
   for(let x=-60-(pan*.35)%95;x<w+100;x+=95){this.line(x,h*.38,x,h*.61,'#92a4a1',3);this.line(x+2,h*.38,x+2,h*.61,'#20353d',2);}
   this.line(0,h*.38,w,h*.38,'#94aaa9',4);this.line(0,h*.49,w,h*.49,'#647f89',3);
   const sx=w*.68-pan*.12;c.fillStyle='#314b55';c.fillRect(sx,0,520,h*.61);c.fillStyle='#1c323f';c.fillRect(sx+24,h*.14,430,h*.16);
   for(let x=sx+28;x<sx+458;x+=76){c.fillStyle='#68868c';c.fillRect(x,h*.14,3,h*.16);}
   this.line(sx,0,sx,h*.61,'#9aaaa5',4);this.line(sx,h*.34,sx+520,h*.34,'#152c37',8);this.line(sx-12,h*.075,sx+520,h*.075,'#819e9e',6);
  }else if(['snow','dock'].includes(bi)){
   this.glow(w*.73,h*.10,h*.55,'#9eb9c125');
   for(let layer=0;layer<3;layer++){
    const points=[[-200,h*.63]];for(let i=-2;i<13;i++){const x=i*w/9-(pan*(.04+layer*.045))%(w/9);const y=h*(.30+layer*.09)-Math.sin(i*2.81+layer)*h*(.10-layer*.016);points.push([x,y],[x+w/17,y+h*.09]);}points.push([w+300,h*.68]);ctxPath(c,points,["#233f50","#39596a","#567483"][layer]);
   }
   if(room.id==='elder'){
    this.glow(w*.57,-h*.08,h*.95,'#bad6cd25');ctxPath(c,[[w*.35,-10],[w*.65,-10],[w*.83,h*.70],[w*.12,h*.70]],'#accab916');
    ctxPath(c,[[w*.28,8],[w*.40,h*.065],[w*.67,h*.06],[w*.82,10]],'#1d313c','#6d9097',2);
   }
   if(room.id!=='landing'&&room.id!=='elder'){
    for(let i=-1;i<5;i++){
     const x=i*470*this.zoom-pan*.22,y=h*.49,bw=365*this.zoom,bh=h*.27;
     ctxPath(c,[[x,y],[x+22,y-bh],[x+bw*.48,y-bh-55],[x+bw,y-bh+15],[x+bw,y]],'#273d48','#79929a55',1);
     for(let xx=x+18;xx<x+bw;xx+=22*this.zoom)this.line(xx,y-bh+18,xx-3,y,'#788b8d22');
     for(let j=0;j<4;j++){c.fillStyle='#101f28';c.fillRect(x+40+j*65*this.zoom,y-bh+40,38*this.zoom,51*this.zoom);this.line(x+40+j*65*this.zoom,y-bh+63,x+78+j*65*this.zoom,y-bh+63,'#77949655');}
     this.line(x-15,y-bh+7,x+bw*.48,y-bh-64,'#b8cdcc99',5);
    }
   }
  }else if(bi==='pyramid'){
   this.glow(w*.53,h*.13,h*.6,'#87abb426');
   for(let i=-1;i<8;i++){const x=i*w/5-(pan*.08)%(w/5);ctxPath(c,[[x,0],[x+w/8,0],[x+w/10,h*.22],[x+w/14,h*.30]],'#152c38','#41616c',1);}
   const cx=this.point(room.doors.find(d=>d.to==='vestibule')?.x||2195,65).x,baseY=this.point(0,65).y,bw=1900*this.zoom,bh=h*.54;
   for(let i=0;i<7;i++){const yy=baseY-i*bh/7,ww=bw*(1-i*.12),stepH=bh/7;
    ctxPath(c,[[cx-ww/2,yy],[cx-ww/2+stepH*.26,yy-stepH],[cx+ww/2-stepH*.26,yy-stepH],[cx+ww/2,yy]],i%2?'#354f59':'#3d5a62','#71858666',1);
    for(let x=cx-ww/2+25;x<cx+ww/2;x+=85)this.line(x,yy-stepH+4,x+4,yy-3,'#182f3970');
   }
   ctxPath(c,[[cx-66,baseY],[cx-49,baseY-bh*.33],[cx+49,baseY-bh*.33],[cx+66,baseY]],'#091d27','#9c9f8377',5);
   for(let i=0;i<8;i++)this.line(cx-95-i*17,baseY+i*4,cx+95+i*17,baseY+i*4,'#8b9d9166',2);
   this.glyph(cx,baseY-bh*.39,28,1,'#c7b88d');
  }else if(bi==='ice'){
   const center=w*.48;ctxPath(c,[[0,0],[w,0],[center+w*.16,h*.57],[center-w*.09,h*.57]],'#375e74');
   for(let i=0;i<8;i++){const x=i*w/6-pan*.08;ctxPath(c,[[x,0],[x+w*.14,0],[center+(x-center)*.4,h*.57],[center+(x-center)*.32,h*.57]],i%2?'#4e7a8b55':'#112f4666');}
   for(let i=0;i<9;i++)this.line(w*.88-i*9,h*.14+i*44,w*.34-i*9,h*.71+i*15,'#9fbbbb32',2);
   this.line(-50,h*.05,w+100,h*.52,'#afbbae88',3);this.line(-50,h*.07,w+100,h*.54,'#83969388',2);
   this.glow(w*.87,h*.2,h*.48,'#82b5c82d');
  }else if(bi==='ship'){
   c.fillStyle='#213944';c.fillRect(0,0,w,h*.60);
   for(let x=-200-(pan*.1)%250;x<w+300;x+=250){c.fillStyle='#1a303c';c.fillRect(x,0,18,h*.61);this.line(x+18,0,x+18,h*.61,'#94adb04b',2);
    c.fillStyle='#0d242e';c.fillRect(x+47,h*.15,142,h*.22);c.strokeStyle='#738c9588';c.strokeRect(x+43,h*.145,150,h*.23);this.line(x+113,h*.15,x+113,h*.37,'#80999c55',3);
   }
   for(let y of [.11,.44,.55]){this.line(0,h*y,w,h*y,'#142b34',14);this.line(0,h*y-4,w,h*y-4,'#81959960',2);}
   for(let x=100;x<w;x+=410){c.fillStyle='#cdd7c3';c.fillRect(x,h*.07,110,4);this.glow(x+55,h*.1,150,'#c6d5be17');}
  }else if(bi==='timber'){
   for(let y=0;y<h*.6;y+=26*this.zoom){c.fillStyle=Math.floor(y/26)%2?'#414b48':'#394642';c.fillRect(0,y,w,24*this.zoom);this.line(0,y+23*this.zoom,w,y+23*this.zoom,'#a1a69322');}
   for(let x=-100-(pan*.1)%330;x<w+350;x+=330){c.fillStyle='#293b3c';c.fillRect(x,0,26,h*.61);c.fillStyle='#617e86';c.fillRect(x+100,h*.12,133,h*.24);ctxPath(c,[[x+100,h*.36],[x+115,h*.29],[x+144,h*.31],[x+183,h*.19],[x+232,h*.16],[x+232,h*.36]],'#b4c6c14d');c.strokeStyle='#263c40';c.lineWidth=12;c.strokeRect(x+99,h*.12,135,h*.24);this.line(x+165,h*.12,x+165,h*.36,'#2f4448',9);}
  }else if(bi==='alienShip'){
   for(let i=-1;i<10;i++){const x=i*w/7-pan*.06;c.save();c.translate(x,h*.35);c.strokeStyle='#7898a33b';c.lineWidth=8;c.beginPath();c.ellipse(0,0,w*.14,h*.58,0,Math.PI,TAU);c.stroke();c.restore();}
   this.glow(w*.6,h*.3,h*.5,'#799ea72f');
  }else{
   // Continuous stone shell extends to the upper edge of the entire playfield.
   const blockW=154*this.zoom,blockH=67*this.zoom,off=(pan*.10)%blockW;
   for(let row=0;row<Math.ceil(h*.61/blockH);row++)for(let col=-2;col<w/blockW+2;col++){
    const x=col*blockW+(row%2)*blockW*.5-off,y=row*blockH;
    c.fillStyle=['#344c50','#385256','#3c5558','#314b50'][(row*7+col+20)%4];c.fillRect(x+1,y+1,blockW-3,blockH-3);
    this.line(x+3,y+2,x+blockW-3,y+2,'#93a29a24');this.line(x+blockW-2,y+8,x+blockW-2,y+blockH-2,'#142e37',2);
    if((row+col)%4===0){this.line(x+blockW*.62,y+2,x+blockW*.54,y+blockH*.36,'#132c3699');this.line(x+blockW*.54,y+blockH*.36,x+blockW*.6,y+blockH*.52,'#132c3699');}
   }
   // Monumental continuous frieze and pilasters instead of empty rectangles.
   const fy=h*.155;c.fillStyle='#1a333b';c.fillRect(0,fy-25,w,59);this.line(0,fy-26,w,fy-26,'#9ca88e55',3);this.line(0,fy+36,w,fy+36,'#87958755',3);
   for(let x=-60-(pan*.14)%80;x<w+80;x+=80)this.glyph(x,fy+3,21,Math.floor(x/80),bi==='hive'?'#78908466':'#bdad7caa');
   for(let x=-140-(pan*.2)%370;x<w+370;x+=370){ctxPath(c,[[x,0],[x+62,0],[x+75,h*.61],[x-15,h*.61]],'#213b42','#7f949377',2);for(let y=h*.24;y<h*.5;y+=55)this.glyph(x+30,y,19,Math.floor(y));c.fillStyle='#506969';c.fillRect(x-20,h*.59,100,16);}
   if(bi==='maze'){for(let i=0;i<3;i++){const x=i*w*.45-(pan*.08)%180+Math.sin(time*.07+i)*9;c.fillStyle='#10283066';c.fillRect(x,0,36,h*.60);this.line(x+36,0,x+36,h*.6,'#91a59544',3);}}
   if(bi==='hive'){
    for(let i=-1;i<12;i++){const x=i*w/8-(pan*.08)%(w/8);c.strokeStyle='#132b35';c.lineWidth=29;c.beginPath();c.moveTo(x,h*.6);c.bezierCurveTo(x+80,h*.42,x-80,h*.17,x+50,-25);c.stroke();c.strokeStyle='#78949a55';c.lineWidth=3;c.stroke();}
    this.glow(w*.63,h*.48,h*.4,'#aac2830c');
   }
  }
  // Perspective floor. Lines and material edges belong to the floor, not HUD overlays.
  const horizon=h*.598,floor=c.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,bi==='snow'?'#7899a2':bi==='dock'?'#678b9b':'#3b5357');floor.addColorStop(.50,bi==='snow'?'#526f7b':bi==='dock'?'#355465':'#263e47');floor.addColorStop(1,'#102632');c.fillStyle=floor;c.fillRect(0,horizon,w,h-horizon);
  if(!['snow','dock','ice'].includes(bi)){
   const vp=w*.51-pan*.045;for(let x=-w;x<2*w;x+=115*this.zoom)this.line(vp+(x-vp)*.22,horizon,x,h,'#a1a58c1a',1);
   for(let i=0;i<7;i++){const y=horizon+(h-horizon)*Math.pow(i/7,1.55);this.line(0,y,w,y,'#85968d2e',1);}
  }else{
   for(let i=0;i<22;i++){const x=((i*223.61-pan*.24)%(w+200)+w+200)%(w+200)-100,y=horizon+(i*47.3)%(h-horizon);this.line(x,y,x+65+(i%4)*36,y-2,'#bacdce22',1);}
   if(bi==='dock'){ctxPath(c,[[0,h*.88],[w*.25,h*.85],[w*.38,h*.89],[w*.61,h*.86],[w,h*.9],[w,h],[0,h]],'#0b2636');for(let i=0;i<9;i++)this.line(0,h*(.9+i*.012),w,h*(.9+i*.012),'#84b8ca15');}
  }
  this.line(0,horizon,w,horizon,'#abb6a144',1);
 }
 sprite(asset,x,y,height,face=1,alpha=1,rotate=0){const img=this.images[asset];if(!img)return;const c=this.ctx,p=this.point(x,y),s=this.depth(y)*this.zoom,hh=height*s,ww=hh*img.width/img.height;c.save();c.globalAlpha=alpha;c.translate(p.x,p.y);c.scale(face,1);c.rotate(rotate);c.drawImage(img,-ww/2,-hh,ww,hh);c.restore();}
 actor(asset,a,height,game,animate=false,alpha=1){
  const p=this.point(a.x,a.y),s=this.depth(a.y)*this.zoom;cAlpha(this.ctx,.25*alpha,()=>this.ellipse(p.x,p.y+2,31*s,7*s,'#07141e'));
  const moving=animate&&game.moving&&!this.reduced,bob=moving?Math.sin(game.s.worldTime*15)*2.2:Math.sin(game.s.worldTime*2.1)*.55;
  this.sprite(asset,a.x,a.y+bob,height,a.face||1,alpha,a.hp===0?Math.PI/2:0);
 }
 door(d,game){
  if(this.architecturalDoor)return this.architecturalDoor(d,game);
  const c=this.ctx,p=this.point(d.x,d.y),s=this.depth(d.y)*this.zoom,locked=game.gate(d),back=d.y<100,bw=(back?98:92)*s,bh=(back?158:178)*s;
  c.save();c.translate(p.x,p.y);ctxPath(c,[[-bw*.65,7],[-bw*.56,-bh],[-bw*.43,-bh-10],[bw*.43,-bh-10],[bw*.56,-bh],[bw*.65,7]],'#486168','#8aa09566',2);
  ctxPath(c,[[-bw*.41,0],[-bw*.38,-bh+12],[bw*.38,-bh+12],[bw*.41,0]],'#061823');
  const shade=c.createLinearGradient(-bw*.4,0,bw*.4,0);shade.addColorStop(0,'#000b14');shade.addColorStop(.5,locked?'#24323a':'#416870');shade.addColorStop(1,'#001420');c.fillStyle=shade;c.fillRect(-bw*.38,-bh+12,bw*.76,bh-12);
  if(locked){c.fillStyle='#20353e';for(let i=0;i<5;i++){c.fillRect(-bw*.39,-bh+18+i*bh*.17,bw*.78,4*s);}this.glyph(0,-bh*.48,21,0,'#a27861');}
  else {this.glow(0,-bh*.42,bw*.7,'#91bbc22d');this.line(-bw*.4,0,bw*.4,0,'#b6cdbd88',2);}
  if(d.phases){this.glyph(0,-bh-25,18,game.phase,locked?'#977c60':'#d5b37a');}
  if(game.near(d,130)&&!game.s.completed){c.font=`${11*s}px system-ui`;c.textAlign='center';c.fillStyle=locked?'#bea590':'#dbe8df';const text=d.label.split(' · ').pop();c.fillText(text.slice(0,33),0,-bh-20*s);}
  c.restore();
 }
 prop(p){let h=120;
  if(['statue','obelisk','slab','pillar','chain'].includes(p.asset))h=168;
  if(['net','bones','rope','rubble'].includes(p.asset))h=78;
  if(p.asset==='tank')h=137;if(p.asset==='medkit')h=58;if(p.asset==='resin')h=196;
  this.sprite(p.asset,p.x,p.y,h*p.scale,1);
 }
 draw(game,options={}){
  this.resize();const c=this.ctx,w=this.w,h=this.h;c.setTransform(this.dpr,0,0,this.dpr,0,0);this.zoom=h/670;this.frame++;
  const room=options.title?C.ROOMS.get('forecourt'):options.epilogue?C.ROOMS.get('vessel'):game.room;
  const viewport=w/this.zoom;this.cam=room.width<viewport?(room.width-viewport)/2:C.clamp((options.title?1180:options.epilogue?800:game.s.player.x)-viewport*.44,0,room.width-viewport);
  this.currentGame=game;this.background(room,game.s.worldTime);
  if(game.s.scene?.id==='queen-fall'&&!options.title&&!options.epilogue&&this.queenFall){this.queenFall(game);return;}
  if(options.title){for(const p of room.props)this.prop(p);this.atmosphere(room,game);return;}
  if(options.epilogue){for(const p of room.props)this.prop(p);this.sprite('scar',800,90,145,1,1,Math.PI/2);this.glow(this.point(830,90).x,this.point(830,90).y-35,100,'#aec5b313');this.atmosphere(room,game);return;}
  for(const d of room.doors)this.door(d,game);
  if(room.id==='queenhold'){
   this.sprite('queen',1750,55,320,-1,.90);for(let i=0;i<4;i++)this.sprite('chain',1620+i*75,60,250,1,.88);
  }
  if(room.id==='duel'&&!game.s.flags.duel&&this.duelScene)this.duelScene(game);
  if(!game.conversationActors&&room.id==='refuge'&&!game.s.flags.weyland)this.actor('weyland',{x:470,y:122,face:1},112,game);
  if(!game.conversationActors&&room.id==='brief')this.actor('weyland',{x:900,y:110,face:-1},110,game);
  if(!game.conversationActors&&['glyphs','forecourt'].includes(room.id)&&!game.s.flags.alliance)this.actor('sebastian',{x:game.objective?.room===room.id?game.objective.x+70:970,y:108,face:-1},110,game);
  if(room.id==='hunter'&&!game.s.flags.alliance)this.actor('scar',{x:1040,y:108,face:-1},147,game);
  if(room.id==='nursery')this.sprite('cocoon',1710,85,145);
  if(room.id==='elder'){this.actor('elder',{x:1070,y:95,face:-1},151,game);this.sprite('scar',1280,165,142,1,.85,Math.PI/2);}
  const drawables=room.props.map(p=>({y:p.y,draw:()=>this.prop(p)}));
  if(this.sceneObjects)drawables.push(...this.sceneObjects(game));
  for(const e of game.enemies)drawables.push({y:e.y,draw:()=>this.actor(e.kind,e,e.kind==='queen'?315:e.kind==='facehugger'?42:139,game,false,e.hp===0?.45:1)});
  if(game.scar)drawables.push({y:game.scar.y,draw:()=>this.actor('scar',game.scar,146,game)});
  drawables.push({y:game.s.player.y,draw:()=>{
   const p=game.s.player;this.actor('lex',p,114,game,true,game.invuln>0?(.77+Math.sin(game.s.worldTime*32)*.12):1);
   if(game.s.flags.gear&&!game.s.hidden&&!game._aid&&!game.s.evacuation?.haul&&!game._haulHold){const pt=this.point(p.x,p.y),s=this.zoom*this.depth(p.y);c.save();c.translate(pt.x,pt.y-38*s);c.scale(p.face*s,s);
    if(game.s.flags.alliance){const spear=this.images['film-tail-spear'];if(spear){c.save();c.translate(game.attackTime>0?27:0,3);c.rotate(game.attackTime>0?.14:-.28);c.drawImage(spear,-10,-73,127,75);c.restore();}
     const skull=this.images['film-shield'];if(skull){c.save();c.translate(-10,-14);c.rotate(-.14);c.drawImage(skull,-18,-37,38,71);c.restore();}else{c.fillStyle='#334c58';c.fillRect(-20,-40,22,54);}}
    else{const axe=this.images['film-iceaxe'];if(axe){c.save();c.translate(game.attackTime>0?24:0,0);c.rotate(game.attackTime>0?.18:-.17);c.drawImage(axe,-3,-68,83,70);c.restore();}}
    c.restore();
   }
  }});
  for(const a of game.acids){const p=this.point(a.x,a.y);this.ellipse(p.x,p.y+2,38*this.zoom,11*this.zoom,`rgba(169,180,74,${Math.min(.35,a.life*.1)})`);}
  drawables.sort((a,b)=>a.y-b.y);for(const obj of drawables)obj.draw();
  for(const shot of game.shots){const p=this.point(shot.x,shot.y);this.glow(p.x,p.y-66*this.zoom,33*this.zoom,'#bdf8ff99');this.ellipse(p.x,p.y-66*this.zoom,12*this.zoom,4*this.zoom,'#d8fbff');}
  for(const f of game.flares){const p=this.point(f.x,f.y);this.glow(p.x,p.y-8,160,'#e99d4433');this.ellipse(p.x,p.y-6,5,9,'#ffe4a0');for(let i=0;i<6;i++)this.ellipse(p.x+Math.sin(i*8+game.s.worldTime*5)*12,p.y-8-((game.s.worldTime*30+i*9)%44),1.5,2,'#ffd79f');}
  for(const e of game.enemies){const rt=game.runtime[e.id];if(e.kind==='queen'&&rt?.telegraph>0){const p=this.point(e.x,rt.chargeY);c.fillStyle='#d9926232';c.fillRect(0,p.y-20*this.zoom,w,40*this.zoom);this.line(0,p.y-20*this.zoom,w,p.y-20*this.zoom,'#e9a77a88',1);}}
  for(const fx of game.effect){const p=this.point(fx.x,fx.y);this.glow(p.x,p.y-55,40,fx.kind==='plasma'?'#b8efffab':'#bca98666');}
  // Discrete ground markers, not permanent opaque instruction boxes.
  if(game.guide?.room===room.id){const o=game.guide,p=this.point(o.x,game.isSide?144:o.y);c.save();c.translate(p.x,p.y+17);ctxPath(c,[[0,-5],[5,0],[0,5],[-5,0]],'#d8b778','#efe0b5',1);c.restore();if(game.hold>0){c.strokeStyle='#e5c186';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y-35,18,-Math.PI/2,-Math.PI/2+TAU*game.hold/o.hold);c.stroke();}}
  for(const q of room.collectibles.filter(q=>!game.s.logs.includes(q.id))){const p=this.point(q.x,game.isSide?144:q.y);c.strokeStyle='#a4c7bc';c.lineWidth=1;c.strokeRect(p.x-4,p.y+10,8,9);}
  if(game.attackTime>0){const p=this.point(game.s.player.x,game.s.player.y),r=game.s.flags.alliance?132:89;c.strokeStyle='#e0d4ab88';c.lineWidth=3;c.beginPath();c.ellipse(p.x+game.s.player.face*r*.55*this.zoom,p.y-50*this.zoom,r*.48*this.zoom,40*this.zoom,0,-1.5,1.4);c.stroke();}
  if(this.operationMarkers)this.operationMarkers(game);
  this.atmosphere(room,game);
  if(game.s.scene?.id==='collapse'&&this.collapse)this.collapse(game);
  if(game.flash>0&&!this.reduced){c.fillStyle=`rgba(209,183,147,${Math.min(.20,game.flash*.24)})`;c.fillRect(0,0,w,h);}
 }
 atmosphere(room,game){const c=this.ctx,w=this.w,h=this.h,t=this.reduced?0:game.s.worldTime;
  if(['snow','dock','ice','pyramid'].includes(room.biome)){
   c.fillStyle=room.biome==='pyramid'?'#b6d2d52b':'#d8e6e464';for(let i=0;i<70;i++){const x=((i*179.27+t*(i%3+1)*18)%(w+200))-100,y=((i*67.12+t*22)%(h+60))-20;const size=(i%3)*.7+.6;c.fillRect(x,y,size*2,size);}
  }else{c.fillStyle='#adc4bc2b';for(let i=0;i<24;i++){const x=(i*247.51+Math.sin(t*.3+i)*20)%w,y=(i*149.11-t*8+h*20)%h;c.fillRect(x,y,1.5,1.5);}}
  const vignette=c.createRadialGradient(w*.5,h*.47,h*.15,w*.5,h*.49,w*.69);vignette.addColorStop(0,'transparent');vignette.addColorStop(.64,'#04131a05');vignette.addColorStop(1,'#020b1590');c.fillStyle=vignette;c.fillRect(0,0,w,h);
  const grad=c.createLinearGradient(0,h*.90,0,h);grad.addColorStop(0,'transparent');grad.addColorStop(1,'#05152177');c.fillStyle=grad;c.fillRect(0,h*.90,w,h*.1);
 }
}
function cAlpha(ctx,a,fn){ctx.save();ctx.globalAlpha=a;fn();ctx.restore();}
G.AVP_RENDERER=Renderer;
})(globalThis);

