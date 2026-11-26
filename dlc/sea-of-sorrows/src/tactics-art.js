/* Original runtime vector mechanisms, not prerendered illustrations. Geometry comes
   directly from the authored shutters and the current simulation/save state. */
(function(root){'use strict';
const R=root.SoSRenderer.prototype;
R.tacticalGround=function(t){
 const g=this.game,c=this.ctx,u=this.unit;
 for(const s of g.room.shutters||[]){
  const a=g.rs.shutters[s.id],lo=g.mode==='SIDE'?.48:.13,hi=g.mode==='SIDE'?.62:.89;
  const q=this.pos(s.x,lo),p=this.pos(s.x,hi),color=a.status==='closed'?'#d9ad76':a.status==='broken'?'#8e7370':'#7ab2aa';
  c.save();c.strokeStyle=color;c.lineWidth=1.5;c.setLineDash([7,6]);c.strokeRect(q.x-56,q.y,112,p.y-q.y);c.setLineDash([]);
  for(let yy=q.y+6;yy<p.y;yy+=18)this.line(q.x-55,yy,q.x-43,yy-5,color,1.4);
  this.text('COURSE LIBRE REQUISE',q.x,p.y+20,8,color,'center');c.restore();
 }
 const rally=g.state.companion.rally;
 if(rally&&g.state.flags.equipped&&g.chapter.number<17){const q=this.pos(rally.x,g.zFor(rally));c.save();c.strokeStyle='#acd8dc';c.lineWidth=1.5;c.beginPath();c.ellipse(q.x,q.y,30,10,0,0,Math.PI*2);c.stroke();this.line(q.x-40,q.y,q.x-18,q.y,'#acd8dc');this.line(q.x+18,q.y,q.x+40,q.y,'#acd8dc');this.text('POSITION DE COUVERTURE',q.x,q.y+30,10,'#c1e0de','center');c.restore();}
 const echo=this.focus?g.readingHint():null;
 if(echo){const q=this.pos(echo.x,g.zFor(echo)),radius=34+(this.reduced?0:Math.sin(t*3)*5);c.save();c.strokeStyle='#d3b9df';c.lineWidth=1.6;c.setLineDash([5,9]);c.beginPath();c.ellipse(q.x,q.y,radius,radius*.32,0,0,Math.PI*2);c.stroke();c.setLineDash([]);this.line(q.x,q.y-116*u,q.x,q.y-134*u,'#d3b9df',1.3);this.text(echo.title.toUpperCase(),q.x,q.y-148*u,10,'#e1cce7','center');c.restore();}
};
R.shutter=function(s,t){
 const g=this.game,c=this.ctx,a=g.rs.shutters[s.id],u=this.unit;
 const far=this.pos(s.x,g.mode==='SIDE'?.55:.13),near=this.pos(s.x,g.mode==='SIDE'?.55:.89);
 if(far.x< -180||far.x>this.W+180)return;
 const roof=far.y-190*u,base=near.y,color=a.status==='closed'?'#c1a680':a.status==='broken'?'#925f50':'#97bab3';
 c.save();
 // Perspective-profile wall: narrow in x, extends across every navigable depth band.
 const occludes=[g.p,...g.state.rescue.actors.filter(p=>p.room===g.room.id)].some(p=>Math.abs(p.x-s.x)<95);
 if(occludes)c.globalAlpha=.50;
 this.rect(far.x-29,roof,58,base-roof,'#15292d99','#46626a');
 this.rect(far.x-29,roof,8,base-roof,'#395963','#89a8a8');this.rect(far.x+21,roof,8,base-roof,'#395963','#89a8a8');
 if(a.status==='closed'){
  const grad=c.createLinearGradient(far.x-18,roof,far.x+18,roof);grad.addColorStop(0,'#31474b');grad.addColorStop(.5,'#8a9f97');grad.addColorStop(1,'#283f48');
  this.rect(far.x-20,roof+16*u,40,base-roof-17*u,grad);
  for(let y=roof+24*u;y<base;y+=17*u){this.line(far.x-18,y,far.x+18,y,'#1d343c',3);this.line(far.x-18,y+3,far.x+18,y+3,'#b9c0a477',1);}
 }else if(a.status==='broken'){
  for(let i=0;i<4;i++)this.path([[near.x-45+i*14,base],[near.x-28+i*14,base-23-i%2*18],[near.x-10+i*10,base]],'#526866','#b18c67',1);
 }else{
  for(let i=0;i<4;i++)this.rect(far.x-20,roof+11*u+i*6*u,40,4*u,'#8a9f97','#263d45');
  this.line(far.x,roof+45*u,far.x,base,'#7ea79f33',1);
 }
 this.rect(far.x-68,roof-18*u,136,27*u,'#233d46','#71969b');this.text(s.id.replace('gate-','CP-').toUpperCase(),far.x,roof+1*u,11,'#e7d6a5','center');
 this.ellipse(far.x-43,roof-5*u,4,4,color);this.ellipse(far.x+43,roof-5*u,4,4,color);c.restore();
 if(Math.abs(s.x-g.p.x)<500){this.text(a.status==='closed'?'FERMÉE · '+Math.ceil(a.integrity)+' %':a.status==='broken'?'MÉCANISME ROMPU':'CLOISON OUVERTE',far.x-45,roof+58*u,10,color,'right');}
 for(const n of g.shutterControls(s)){
  const q=this.pos(n.x,g.zFor(n));this.rect(q.x-4,q.y-59*u,8,60*u,'#5b767a');this.rect(q.x-15,q.y-77*u,30,27*u,'#203b44','#9ab2ae');this.rect(q.x-10,q.y-71*u,20,8*u,color);this.line(q.x-9,q.y-55*u,q.x+9,q.y-55*u,'#d4c69e',1);
  if(g.distance(g.p,n)<150)this.text('G / E',q.x,q.y-127*u,11,'#ead6a5','center');
 }
};
R.tacticalOverlay=function(t){
 const g=this.game,c=this.ctx;
 for(const signal of g.pursuitSignals()){
  if(!signal.door)continue;const q=this.pos(signal.door.x,g.zFor(signal.door)),edge=q.x<24?24:q.x>this.W-24?this.W-24:q.x;
  c.save();c.globalAlpha=this.reduced?.9:.68+Math.sin(t*7)*.2;c.strokeStyle='#e8b77d';c.lineWidth=2.5;
  for(let i=0;i<3;i++){c.beginPath();c.arc(edge,q.y-100*this.unit,(24+i*12)*this.unit,-1,1);c.stroke();}c.restore();
  this.text(q.x<24?'← BRUITS AU SEUIL':q.x>this.W-24?'BRUITS AU SEUIL →':'BRUITS AU SEUIL',Math.max(95,Math.min(this.W-95,edge)),q.y-157*this.unit,11,'#f1c994','center');
 }
 for(const e of g.rs.enemies)if(e.hp>0&&e.breach){const s=g.room.shutters.find(s=>s.id===e.breach.gate);if(!s)continue;const q=this.pos(s.x,g.zFor(e));
  this.rect(q.x-52,q.y-124*this.unit,104,4,'#292a25');this.rect(q.x-52,q.y-124*this.unit,104*(1-e.breach.remaining/e.breach.duration),4,'#daa384');this.text('IMPACT SUR CLOISON',q.x,q.y-134*this.unit,10,'#e6b598','center');}
};
R.lightPanel=function(l,t){
 const g=this.game,c=this.ctx,q=this.pos(l.x,g.zFor(l)),u=this.unit,on=g.rs.lighting.on;
 c.save();this.rect(q.x-5*u,q.y-74*u,10*u,74*u,'#435e65');this.rect(q.x-22*u,q.y-101*u,44*u,39*u,'#19333d','#899f9d');
 this.rect(q.x-15*u,q.y-95*u,30*u,12*u,on?'#9ebca0':'#d3a66c');this.line(q.x,q.y-80*u,q.x+(on?9:-9)*u,q.y-69*u,'#e0ce9e',4*u);
 this.text('LUX',q.x,q.y-110*u,10,'#d7dfc7','center');if(g.distance(g.p,l)<140)this.text('E · MAINTENIR',q.x,q.y+28*u,10,'#e7d5ad','center');c.restore();
};
R.lightOverlay=function(t){
 const g=this.game,r=g.room,c=this.ctx,{W,H}=this,u=this.unit;if(!r.lighting)return;
 c.save();if(g.lightsOff()){
  const p=this.pos(g.p.x,g.zFor(g.p));
  // Readable emergency darkness; visual brightness is not the AI's perception range.
  const shade=c.createRadialGradient(p.x,p.y-65*u,50*u,p.x,p.y-65*u,(g.p.lamp?650:190)*u);
  shade.addColorStop(0,g.p.lamp?'#020e170c':'#020e1752');shade.addColorStop(1,'#020e17b0');c.fillStyle=shade;c.fillRect(0,0,W,H);
 }
 for(let x=220;x<r.width;x+=480){const q=this.pos(x,.15);if(q.x< -100||q.x>W+100)continue;
  const y=q.y-178*u,col=g.lightsOff()?'#dcae76':'#cfebd0';this.rect(q.x-35*u,y,70*u,6*u,col);
  const halo=c.createRadialGradient(q.x,y,2,q.x,y,95*u);halo.addColorStop(0,g.lightsOff()?'#e4a76a30':'#c6eec332');halo.addColorStop(1,'#ffffff00');c.fillStyle=halo;c.fillRect(q.x-95*u,y-95*u,190*u,190*u);
 }
 if(g.lightsOff())for(const door of r.doors){const p=this.pos(door.x,g.zFor(door));if(p.x<0||p.x>W)continue;this.text('ISSUE',p.x,p.y-112*u,10,'#d8c4a4','center');this.line(p.x-16,p.y-103*u,p.x+16,p.y-103*u,'#d8c4a4',2);}
 c.restore();
};
})(globalThis);
