
/* Hand-authored scene dressing and runtime animation. No prerendered screenshot is used as a game background. */
(function(G){
'use strict';const C=G.AVP_CORE,D=G.AVP_DATA,Base=G.AVP_RENDERER,TAU=Math.PI*2;
const polygon=(c,points,fill,stroke)=>{c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}};
class ExpandedRenderer extends Base{
 constructor(canvas){super(canvas);this.poseCache=new Map();}
 background(room,time){
  super.background(room,time);const c=this.ctx,w=this.w,h=this.h,pan=this.cam*this.zoom,t=this.reduced?0:time;
  c.save();c.beginPath();c.rect(0,0,w,h*.594);c.clip();
  // High-volume architecture stays behind the playable floor and behind actors.
  if(['temple','maze','hive'].includes(room.biome)){
   for(let i=-1;i<13;i++){
    const x=i*210*this.zoom-(pan*.38)%(210*this.zoom);
    this.line(x,0,x+38,h*.6,'#091b2660',8*this.zoom);
    for(let j=0;j<6;j++){const y=j*h*.102;this.line(x,y,x+210*this.zoom,y+8,'#d0c49a19',1);}
    if(i%2===0){this.glyph(x+80*this.zoom,h*.23,30*this.zoom,i,'#adb8913d');this.glyph(x+80*this.zoom,h*.35,20*this.zoom,i+1,'#acba9733');}
   }
   for(let i=0;i<4;i++){const x=(i+.1)*w*.36-(pan*.18)%170;this.line(x,0,x+24,h*.6,'#132c3688',16*this.zoom);this.line(x+12,0,x+36,h*.6,'#83958633',2*this.zoom);}
  }
  if(room.biome==='timber'){
   for(let i=-1;i<18;i++){const x=i*76*this.zoom-(pan*.32)%(76*this.zoom);this.line(x,0,x,h*.6,'#111e2388',3);this.line(x+4,0,x+4,h*.6,'#bba78233',1);}
   this.line(0,h*.1,w,h*.1,'#2c3534',24*this.zoom);this.line(0,h*.115,w,h*.115,'#98998144',2);
   for(let i=0;i<5;i++)this.line((i*.4-.2)*w,0,(i*.4+.05)*w,h*.24,'#1b2b2f88',18*this.zoom);
  }
  if(room.id==='engine'){
   for(let i=0;i<4;i++){const y=h*(.16+i*.067);this.line(0,y,w,y,'#101f27',22*this.zoom);this.line(0,y-5,w,y-5,'#829c9a88',3*this.zoom);}
   const x=w*.62-pan*.06;this.glow(x,h*.5,h*.4,'#d7a26722');
   for(let i=0;i<12;i++){const v=(t*18+i*23)%170;c.globalAlpha=(1-v/170)*.055;this.ellipse(x+Math.sin(i*3+t*.4)*45,h*.54-v,30+v*.22,16+v*.18,'#cfe4de');}c.globalAlpha=1;
  }
  if(room.id==='tower'){
   const x=w*.1-pan*.06;c.fillStyle='#89a4a5';c.fillRect(x,h*.12,w*.74,h*.39);
   for(let i=0;i<3;i++)polygon(c,[[x,h*.50],[x+w*.1,h*(.34-i*.01)],[x+w*.26,h*.43],[x+w*.43,h*.29],[x+w*.72,h*.43],[x+w*.74,h*.51]],['#708d96','#5e7d87','#436675'][i]);
   for(let i=0;i<5;i++)this.line(x+i*w*.185,h*.12,x+i*w*.185,h*.51,'#293e46',12*this.zoom);
   this.line(x,h*.325,x+w*.74,h*.325,'#344d53',9*this.zoom);
  }
  if(room.id==='weights'){
   for(const pr of room.props.filter(p=>p.asset==='counterweight')){
    const x=this.point(pr.x,pr.y).x;
    c.fillStyle='#0c202b';c.fillRect(x-90*this.zoom,0,180*this.zoom,h*.593);
    this.line(x-93*this.zoom,0,x-93*this.zoom,h*.592,'#83938988',5*this.zoom);
    this.line(x+93*this.zoom,0,x+93*this.zoom,h*.592,'#83938966',5*this.zoom);
   }
  }
  if(room.id==='astrarium'){
   const x=w*.55-pan*.03,y=h*.31,r=h*.265;c.save();c.translate(x,y);
   for(let i=0;i<4;i++){c.strokeStyle=i%2?'#bdad785e':'#95ada540';c.lineWidth=i===0?13:3;c.beginPath();c.arc(0,0,r-i*25,0,TAU);c.stroke();}
   for(let i=0;i<18;i++){const a=i*TAU/18;this.glyph(Math.cos(a)*r*.79,Math.sin(a)*r*.79,18,i,'#d4bd8588');}
   c.rotate((this.currentGame?.phase||0)*TAU/3);polygon(c,[[0,-r*.57],[r*.5,r*.32],[-r*.5,r*.32]],null,'#cbb681');c.restore();
  }
  if(room.id==='incubator'){
   for(let i=0;i<3;i++){const y=h*(.18+i*.12);this.line(0,y,w,y,'#071c26',20*this.zoom);this.line(0,y-7,w,y-7,'#869d9366',4*this.zoom);}
   for(let i=-1;i<14;i++){const x=i*150*this.zoom-(pan*.43)%(150*this.zoom);c.fillStyle='#162c36';c.fillRect(x,h*.12,34*this.zoom,h*.45);this.glyph(x+17*this.zoom,h*.24,15,1,'#afb28f55');}
  }
  if(room.id==='gantry'||room.id==='queenhold'){
   for(let i=-1;i<6;i++){const x=i*w*.28-(pan*.21)%90;this.line(x,0,x+60,h*.59,'#061923',15*this.zoom);this.line(x+8,0,x+68,h*.59,'#8b9b9066',2*this.zoom);
    for(let j=0;j<14;j++){const y=j*h*.041;c.strokeStyle='#8da59a66';c.lineWidth=2;c.beginPath();c.ellipse(x+90,y,7*this.zoom,11*this.zoom,0,0,TAU);c.stroke();}}
  }
  c.restore();
  // Ground scratches and material edges do not conceal interaction markers.
  if(!['snow','dock'].includes(room.biome)){
   for(let i=0;i<40;i++){const x=((i*167.19-pan*.5)%(w+60)+w+60)%(w+60),y=h*.63+(i*53.37)%(h*.29);this.line(x,y,x+13+(i%7)*3,y+1,'#c8c0a319',1);}
  }
 }
 prop(p){
  if(p.asset==='counterweight'&&this.currentGame?.room.id==='weights'){
   const i=this.currentGame.room.props.filter(q=>q.asset==='counterweight').indexOf(p),n=this.currentGame.s.balance[i]||0;
   this.sprite(p.asset,p.x,p.y-45+n*15,240*p.scale);return;
  }
  const heights={boiler:242,pipebank:220,switchboard:150,antenna:237,counterweight:240,calendar:170,winchstone:157,pulley:240,tablet:133,worklamp:189,floodlight:209,locker:179,coat:146,frostwindow:164,toolrack:166,eggtrack:114,grate:83,cablecoil:73,journal:48,anchor:152,hook:220,braziertall:205};
  if(heights[p.asset]){this.sprite(p.asset,p.x,p.y,heights[p.asset]*p.scale);if(['worklamp','floodlight','braziertall'].includes(p.asset)){const q=this.point(p.x,p.y);this.glow(q.x,q.y-heights[p.asset]*.62*p.scale*this.zoom,100*this.zoom,'#ecd49c16');}return;}
  super.prop(p);
 }
 door(d,game){
  if(this.architecturalDoor)return this.architecturalDoor(d,game);
  if(!['ship','timber'].includes(game.room.biome)&&!['vent','stairs'].includes(d.kind)){super.door(d,game);return;}
  const c=this.ctx,p=this.point(d.x,d.y),s=this.depth(d.y)*this.zoom,closed=game.gate(d),vent=d.kind==='vent',stairs=d.kind==='stairs',bw=vent?110:88,bh=vent?72:170;
  c.save();c.translate(p.x,p.y);c.scale(s,s);c.fillStyle=game.room.biome==='timber'?'#574d3e':'#53696c';c.fillRect(-bw*.6,-bh,bw*1.2,bh+6);
  c.fillStyle=closed?'#30434a':'#0b202a';c.fillRect(-bw*.45,-bh+8,bw*.9,bh-8);this.line(-bw*.45,-bh+8,bw*.45,-bh+8,'#aeb6a177',2);
  if(vent||closed){for(let i=0;i<6;i++)this.line(-bw*.43,-bh+19+i*(bh-23)/6,bw*.43,-bh+19+i*(bh-23)/6,closed?'#68746e':'#82948c',3);}
  if(stairs&&!closed){for(let i=0;i<7;i++){const y=-18-i*16;this.line(-bw*.43,y,bw*.43-i*7,y,'#91aaa377',3);}}
  if(!closed){this.line(-bw*.44,1,bw*.44,1,'#d0c398',2);this.glow(0,-bh*.4,bw*.68,'#a7c4b522');}
  if(game.near(d,140)){c.font='11px system-ui';c.textAlign='center';c.fillStyle='#c9d6c8';c.fillText(d.label.split(' · ').pop().slice(0,33),0,-bh-16);}
  c.restore();
 }
 actor(asset,a,height,game,animate=false,alpha=1){
  const c=this.ctx,p=this.point(a.x,a.y),k=this.depth(a.y)*this.zoom,img=this.images[G.AVP_FIDELITY?.asset(asset,game.s)||asset];
  if(['lex','scar','celtic','sebastian','weyland','elder'].includes(asset)&&img&&a.hp!==0){
   const key=a===game.s.player?'player':a===game.scar?'ally':asset,old=this.poseCache.get(key);
   const changed=old&&old.room===game.s.room&&Math.hypot(a.x-old.x,a.y-old.y)>.04;
   const walking=!this.reduced&&(animate?game.moving:changed),phase=game.s.worldTime*13,step=walking?Math.sin(phase):0,hh=height*k,ww=hh*img.width/img.height;
   this.poseCache.set(key,{x:a.x,y:a.y,room:game.s.room});
   if(!walking||['scar','celtic','elder'].includes(asset)){super.actor(asset,a,height,game,walking,alpha);return;}
   this.ellipse(p.x,p.y+2,24*k,6*k,'#06141f60');c.save();c.globalAlpha=alpha;c.translate(p.x,p.y);c.scale(a.face||1,1);
   const hip=-hh*.38,feet=2;
   for(const side of [-1,1]){
    const stride=step*side*hh*.13,kneeX=side*hh*.055+stride*.45,footX=side*hh*.06+stride,footY=feet-Math.max(0,step*side)*hh*.065;
    c.strokeStyle=asset==='lex'?'#84272d':asset==='sebastian'?'#74705d':asset==='weyland'?'#343b43':'#69716b';c.lineWidth=hh*.082;c.lineCap='round';c.beginPath();c.moveTo(side*hh*.055,hip);c.lineTo(kneeX,-hh*.19);c.lineTo(footX,footY-4);c.stroke();
    c.strokeStyle='#112734';c.lineWidth=hh*.057;c.beginPath();c.moveTo(footX-4,footY-1);c.lineTo(footX+hh*.07,footY-1);c.stroke();
   }
   c.save();const bob=walking?Math.abs(step)*hh*.017:0;c.translate(0,-bob);c.beginPath();c.rect(-ww*.7,-hh-5,ww*1.4,hh*.655+5);c.clip();c.drawImage(img,-ww/2,-hh,ww,hh);c.restore();c.restore();return;
  }
  const rt=game.runtime[a.id];if(rt?.windup>0&&a.hp>0){this.ellipse(p.x,p.y+2,34*k,8*k,'#d2a77566');this.sprite(asset,a.x,a.y+5,height*.94,a.face||1,alpha,-.07*(a.face||1));return;}
  super.actor(asset,a,height,game,animate,alpha);
 }
 sceneObjects(game){
  const objects=[];
  for(const m of game.slabs())objects.push({y:m.y+m.h*.5,draw:()=>{
   const c=this.ctx,p=this.point(m.x,m.y),q=this.point(m.x+m.w,m.y+m.h),height=178*this.zoom,lift=m.closed?0:height*.89;
   // Footprint and warning correspond to the exact blocking rectangle in simulation.
   c.fillStyle=m.warning?'#d0aa6440':m.closed?'#30495166':'#96b3a217';c.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);c.strokeStyle=m.warning?'#deb473':'#91ada65e';c.lineWidth=1;c.strokeRect(p.x,p.y,q.x-p.x,q.y-p.y);
   const x=(p.x+q.x)/2,y=(p.y+q.y)/2;
   this.line(x-23,0,x-23,y-lift,'#69847c77',3);this.line(x+23,0,x+23,y-lift,'#69847c77',3);
   polygon(c,[[p.x,y-height-lift],[q.x,y-height-lift],[q.x,y-lift],[p.x,y-lift]],m.closed?'#455f60':'#3b525680','#9aaa9588');
   this.glyph(x,y-height*.45-lift,27*this.zoom,m.closed?2:1,m.warning?'#edc085':'#b2aa85');
   if(m.warning||m.held){c.font='11px system-ui';c.textAlign='center';c.fillStyle='#ecd8af';c.fillText(m.held?'PASSAGE OCCUPÉ':'FERMETURE',x,p.y+22*this.zoom);}
  }});
  for(const e of D.eggs.filter(e=>e.room===game.s.room&&game.s.flags[e.after])){
   const st=game.s.eggs[e.id]?.state||'intact',y=game.isSide?144:e.y;
   objects.push({y,draw:()=>{const p=this.point(e.x,y);this.sprite(st==='destroyed'?'egg-broken':st==='spent'?'egg-open':'egg',e.x,y,st==='destroyed'?51:76,1,1);if(st==='opening')this.glow(p.x,p.y-35*this.zoom,45*this.zoom,'#d8cf8944');}});
  }
  return objects;
 }
 operationMarkers(game){const c=this.ctx;
  for(const o of game.availableOperations){const p=this.point(o.x,game.isSide?144:o.y),main=!!o.forFlag,near=game.near(o,90),done=game.operationReason(o);
   c.save();c.translate(p.x,p.y+15);c.strokeStyle=done?'#9c9281':main?'#d6bd87':'#95bfb5';c.lineWidth=1.5;c.beginPath();c.arc(0,0,main?7:5,0,TAU);c.stroke();if(!done){c.fillStyle=main?'#e0c890':'#8fbaaf';c.fillRect(-1.5,-1.5,3,3);}c.restore();
   if(near&&game.hold>0&&game.holdTarget===o.id){c.strokeStyle='#ecd29c';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y-35,18,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,game.hold/o.hold));c.stroke();}
  }
  if(game.scar&&game.s.ally.order==='hold'){const p=this.point(game.scar.x,game.scar.y);c.strokeStyle='#afc4ba';c.strokeRect(p.x-8,p.y+9,16,8);}
 }
 duelScene(game){const t=game.s.duelTime,x=t<5?910+t*18:t<10?1000:1000+(t-10)*6;
  this.actor('celtic',{x,y:85,face:1,hp:t>13?0:100},146,game,false,t>14?.62:1);this.sprite('chopper',730,70,138,1,.68,Math.PI/2);
  if(t>5&&t<11){const grid=game.enemies.find(e=>e.kind==='grid');if(grid){const p=this.point(grid.x,grid.y),s=this.zoom;this.ctx.save();this.ctx.globalAlpha=.65;for(let i=-3;i<=3;i++){this.line(p.x-34*s,p.y-(65+i*12)*s,p.x+43*s,p.y-(33+i*12)*s,'#c6b492',1.3);this.line(p.x-34*s,p.y-(33+i*12)*s,p.x+43*s,p.y-(65+i*12)*s,'#c6b492',1.3);}this.ctx.restore();}}
 }
 queenFall(game){
  const c=this.ctx,w=this.w,h=this.h,t=game.s.scene.t,progress=C.clamp(t/7.5,0,1),u=C.clamp((t-1.3)/3.8,0,1);
  for(const p of game.room.props.filter(p=>p.asset!=='tank'))this.prop(p);
  const start=game.s.rig?.sceneQueen||{x:1760,y:155},slide=C.clamp(t/1.3,0,1);const qx=start.x+u*210,qy=start.y+u*600,tx=340+(1510-340)*slide+u*400,ty=70+(160-70)*slide+u*590;
  const qa=this.point(qx,qy),ta=this.point(tx,ty);
  c.save();c.beginPath();c.rect(0,0,w,h*.878);c.clip();
  this.sprite('queen',qx,qy,315,-1,1,u*.3);this.sprite('tank',tx,ty,168,1,1,u*.48);
  this.line(qa.x-35*this.zoom,qa.y-69*this.zoom,ta.x,ta.y-48*this.zoom,'#ced4be',3*this.zoom);
  for(let i=0;i<12;i++){const a=i/12;this.ellipse(qa.x-35+(ta.x-qa.x+35)*a,qa.y-69+(ta.y-qa.y+21)*a,4*this.zoom,2*this.zoom,'#9fb2a5');}
  c.restore();
  const lx=game.s.rig?.sceneLex||{x:1790,y:145},sc=game.s.rig?.sceneScar||{x:980,y:170},back=C.clamp(t/1.1,0,1);this.actor('lex',{x:lx.x+(1230-lx.x)*back,y:lx.y+(145-lx.y)*back,face:1,hp:game.s.player.hp},114,game);this.sprite('scar',sc.x,sc.y,145,1,.85,Math.PI/2*C.clamp(t/1.8,0,1));
  if(t>3.6){for(let i=0;i<25;i++){const a=i*2.399,r=(t-3.6)*31+(i%4)*9;this.ellipse(w*.78+Math.cos(a)*r,h*.875+Math.sin(a)*r*.14,3,2,'#c5dcce70');}}
  this.atmosphere(game.room,game);c.fillStyle='#061822';c.fillRect(0,h*.92,w,h*.08);this.glow(w*.8,h*.90,180,'#a1c2c324');
  c.font='12px system-ui';c.fillStyle='#d8ddd0';c.textAlign='center';c.fillText(progress<.24?'LA CHAÎNE SE TEND':progress<.78?'LE POIDS FAIT LE RESTE':'L’EAU NOIRE SE REFERME',w*.5,h*.09);
 }
 collapse(game){const c=this.ctx,w=this.w,h=this.h,t=game.s.scene.t,f=Math.sin(Math.min(1,t/4.2)*Math.PI);
  c.fillStyle=`rgba(132,151,144,${f*.29})`;c.fillRect(0,0,w,h);
  const count=this.reduced?12:65;for(let i=0;i<count;i++){const x=(i*347.29)%w,y=((t*145+i*83.41)%(h+80))-40;polygon(c,[[x,y],[x+4+i%7,y+3],[x+8,y+16]],'#c7d1bf55');}
  this.glow(w*.7,h*.29,h*.65,`rgba(217,222,198,${f*.13})`);
 }
}
G.AVP_RENDERER=ExpandedRenderer;
})(globalThis);

