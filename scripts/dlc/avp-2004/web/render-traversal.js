
/* Dedicated real-time crossing views. Existing character SVGs are reused, not
 * presented as a new animation pack. Geometry, route and threat volumes share
 * the same normalized canonical progress as the simulation. */
(function(G){'use strict';const Base=G.AVP_RENDERER,D=G.AVP_DATA,C=G.AVP_CORE;
const mix=(a,b,t)=>a+(b-a)*t;
class CrossingRenderer extends Base{
 direct(asset,x,y,height,face=1,angle=0,alpha=1){const img=this.images[G.AVP_FIDELITY?.asset(asset,this.currentGame?.s||{flags:{}})||asset];if(!img)return;const c=this.ctx,w=height*img.width/img.height;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);c.scale(face,1);c.drawImage(img,-w/2,-height,w,height);c.restore();}
 crossingPoint(t,canonical,lane=0){const w=this.w<600?Math.max(150,this.w-160):this.w<1200?this.w-250:this.w,h=this.h,a=t.points[0],b=t.points[1],s=this.crossingScale;
  const sway=t.kind==='rappel'?Math.sin(canonical*Math.PI)*w*.075:t.kind==='chain'?Math.sin(canonical*Math.PI)*w*.025:0;
  return {x:mix(a[0],b[0],canonical)*w+sway+(t.axis==='y'?lane*58*s:0),y:mix(a[1],b[1],canonical)*h+(t.axis==='x'?lane*34*s:0)};
 }
 rockFace(t,x,y,w,h,seed){const c=this.ctx,ice=t.biome==='ice',hive=t.biome==='hive';
  const vertices=[[x,y],[x+w*.85,y-18],[x+w,y+h*.32],[x+w*.94,y+h],[x+w*.10,y+h+12],[x-14,y+h*.43]];
  c.beginPath();vertices.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();
  c.fillStyle=ice?['#254758','#31576a','#1b3e50','#3d6172'][seed%4]:hive?['#1b302e','#253b35','#1a2c2e','#354137'][seed%4]:['#353d3c','#454945','#293535','#3d4440'][seed%4];c.fill();
  c.strokeStyle=ice?'#9abfc343':hive?'#a0b39824':'#c3b9a128';c.lineWidth=1;c.stroke();
  for(let j=0;j<4;j++){const k=(seed*13+j*17)%83/100;c.strokeStyle=ice?'#accbd62c':'#0b1b2144';c.beginPath();c.moveTo(x+w*k,y+14);c.lineTo(x+w*(k+.1),y+h*.45);c.lineTo(x+w*(k-.06),y+h*.91);c.stroke();}
 }
 crossingBackdrop(game,t){const c=this.ctx,w=this.w,h=this.h,s=this.crossingScale,time=this.reduced?0:game.s.worldTime;
  const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,t.biome==='ice'?'#163c50':t.biome==='metal'?'#1d3b4c':'#172c31');g.addColorStop(.55,'#07191f');g.addColorStop(1,t.biome==='hive'?'#203932':'#0c232e');c.fillStyle=g;c.fillRect(0,0,w,h);
  this.glow(w*.62,h*.45,w*.52,t.biome==='ice'?'#7196a51c':'#a5b39a10');
  const v=game.s.traversal,z=this.crossingCanonicalFor(v);
  // Distant faces are offset slightly; traversal route and collisions never move.
  for(let layer=0;layer<2;layer++)for(let row=-1;row<7;row++){
   const yy=row*h*.21+(layer?20:-22)-z*h*.035*(layer+1),ww=w*(layer?.19:.28),xx=(layer?w*.84:-w*.03);
   this.rockFace(t,xx+Math.sin(row*2.7+layer)*w*.025,yy,ww,h*.26,row+8+layer*2);
  }
  if(t.biome==='metal'){
   for(let i=0;i<6;i++){const x=w*.72+i*25*s;c.fillStyle=i%2?'#354e58':'#203743';c.fillRect(x,0,17*s,h);}
   for(let i=0;i<5;i++){this.line(w*.69,i*h*.25,w*.99,(i+.8)*h*.25,'#60757b',5*s);this.line(w*.7,i*h*.25,w*.99,i*h*.25,'#3d545f',9*s);}
   for(let i=0;i<50;i++){const x=(i*173+time*39)%w,y=(i*97+time*23)%h;this.line(x,y,x+16*s,y+3*s,'#b7d1d247',1);}
  }else if(t.biome==='hive'){
   for(let i=0;i<14;i++){const x=w*(.04+i*.073);c.strokeStyle=i%2?'#60796c36':'#142b27';c.lineWidth=(5+i%4)*s;c.beginPath();c.moveTo(x,-20);c.bezierCurveTo(x+Math.sin(i)*120*s,h*.3,x-50*s,h*.53,x+Math.cos(i)*70*s,h+40);c.stroke();}
   this.glow(w*.74,h*.12,h*.3,'#c4c89617');
  }else{
   for(let i=0;i<34;i++){const x=(i*139+Math.sin(time*.3+i)*15)%w,y=(i*97+time*(t.biome==='ice'?16:5))%h;this.ellipse(x,y,(i%3+1)*s,1.5*s,t.biome==='ice'?'#b7d3d34f':'#b4ba9732');}
  }
  const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#020e1744');shade.addColorStop(.5,'#06151d00');shade.addColorStop(1,'#021018b0');c.fillStyle=shade;c.fillRect(0,0,w,h);
 }
 crossingCanonicalFor(v){const t=G.AVP_TRAVERSAL.defs.get(v.id);return v.door===t.a?v.progress:1-v.progress;}
 crossingStructure(t){const c=this.ctx,s=this.crossingScale,a=this.crossingPoint(t,0),b=this.crossingPoint(t,1);
  // Broad platforms physically coincide with the rendered endpoints.
  for(const [p,side] of [[a,-1],[b,1]]){
   c.fillStyle='#1a313c';c.strokeStyle='#7b8c873d';c.lineWidth=2*s;
   c.beginPath();c.moveTo(p.x-125*s,p.y+10*s);c.lineTo(p.x+125*s,p.y+10*s);c.lineTo(p.x+170*s,p.y+56*s);c.lineTo(p.x-160*s,p.y+56*s);c.closePath();c.fill();c.stroke();
   this.line(p.x-125*s,p.y+11*s,p.x+125*s,p.y+11*s,t.biome==='ice'?'#a8c5c6':'#9b9d87',4*s);
   this.direct(t.kind==='rappel'?'rope':t.biome==='metal'?'pylon':'obelisk',p.x+side*100*s,p.y+5*s,75*s,1,0,.85);
  }
  if(t.kind==='ladder'||t.kind==='chain'){
   for(const off of [-35,35]){this.line(a.x+off*s,a.y,b.x+off*s,b.y,'#05121b',9*s);this.line(a.x+off*s,a.y,b.x+off*s,b.y,t.kind==='chain'?'#7e9186':'#9ba6a0',3.5*s);}
   for(let p=.01;p<1;p+=.043){const q=this.crossingPoint(t,p);this.line(q.x-34*s,q.y,q.x+34*s,q.y,'#101e25',8*s);this.line(q.x-34*s,q.y-1*s,q.x+34*s,q.y-1*s,'#9daba2',3*s);}
   if(t.kind==='chain'){this.direct('winch',b.x+75*s,b.y-27*s,105*s,1,0,.95);for(let p=.04;p<.96;p+=.05){const q=this.crossingPoint(t,p);c.strokeStyle='#b0b494';c.lineWidth=2*s;c.beginPath();c.ellipse(q.x-35*s,q.y,5*s,10*s,0,0,Math.PI*2);c.stroke();}}
  }else if(t.kind==='rappel'){
   for(const off of [-3,3]){c.strokeStyle=off<0?'#b5bdac':'#4f6b73';c.lineWidth=2*s;c.beginPath();for(let i=0;i<=100;i++){const q=this.crossingPoint(t,i/100);i?c.lineTo(q.x+off*s,q.y-38*s):c.moveTo(q.x+off*s,q.y-38*s);}c.stroke();}
   for(const p of [a,b]){c.strokeStyle='#d2c1a0';c.lineWidth=4*s;c.beginPath();c.arc(p.x,p.y-38*s,12*s,0,Math.PI*2);c.stroke();}
  }else if(t.kind==='ledge'){
   c.strokeStyle='#0a1820';c.lineWidth=58*s;c.beginPath();c.moveTo(a.x,a.y+18*s);c.lineTo(b.x,b.y+18*s);c.stroke();c.strokeStyle='#6c7770';c.lineWidth=13*s;c.stroke();
   for(let p=0;p<=1;p+=.075){const q=this.crossingPoint(t,p);this.line(q.x-13*s,q.y+12*s,q.x+8*s,q.y+20*s,'#acada082',2*s);this.line(q.x,q.y-35*s,q.x,q.y+8*s,'#828c7d',3*s);}
   this.line(a.x,a.y-35*s,b.x,b.y-35*s,'#7d9388',2*s);
  }else{
   this.line(a.x,a.y-24*s,b.x,b.y-24*s,'#0c151a',156*s);this.line(a.x,a.y+12*s,b.x,b.y+12*s,'#455d55',24*s);
   for(let p=0;p<=1;p+=.058){const q=this.crossingPoint(t,p);c.strokeStyle=p>.5?'#607d6a':'#354e49';c.lineWidth=7*s;c.beginPath();c.ellipse(q.x,q.y-43*s,14*s,66*s,-.05,Math.PI*.95,Math.PI*2.04);c.stroke();}
  }
 }
 crossingHazards(game,t){const c=this.ctx,s=this.crossingScale,v=game.s.traversal;
  for(const h of t.hazards){const a=v.hazards[h.id];if(!a||a.state==='done')continue;const p=this.crossingPoint(t,h.at,h.lane),warn=a.state==='warning';
   this.glow(p.x,p.y-35*s,100*s,warn?'#d5b97928':'#cfd49938');c.save();c.strokeStyle=warn?'#d6b77a':'#e5dcc0';c.lineWidth=2*s;c.setLineDash(warn?[5*s,6*s]:[]);c.beginPath();c.ellipse(p.x,p.y-33*s,43*s,64*s,0,0,Math.PI*2);c.stroke();c.restore();
   c.font=`${12*s}px system-ui`;c.textAlign='center';c.fillStyle='#e6d4aa';c.fillText(warn?'! '+({ice:'GLACE',stone:'PIERRE',wind:'RAFALE',acid:'GOUTTES',steam:'JET'})[h.type]:'DANGER',p.x,p.y-115*s);
   if(!warn){for(let i=0;i<12;i++){const f=(a.t/.85+i*.11)%1,xx=p.x+(Math.sin(i*13)*35)*s,yy=p.y-130*s+f*155*s;
    if(['steam','wind'].includes(h.type)){this.line(xx-28*s+f*60*s,yy,xx+12*s+f*60*s,yy-8*s,'#b5cabe9b',3*s);}else{c.fillStyle=h.type==='acid'?'#c0bf78':'#b5cbd0';c.fillRect(xx,yy,(i%3+2)*s,(i%5+3)*s);}}
   }else for(let i=0;i<5;i++)this.ellipse(p.x+Math.sin(i*5)*28*s,p.y-95*s+(a.t*18+i*19)%70*s,1.4*s,2*s,'#a8b5b97a');
  }
 }

 climber(game,t,p){const c=this.ctx,s=this.crossingScale,v=game.s.traversal,img=this.images[G.AVP_FIDELITY?.asset('lex',game.s)||'lex'];if(!img)return;
  const gait=this.reduced?0:Math.sin(game.s.worldTime*(v.advance?7:1.5))*(v.advance?1:.07),face=t.axis==='x'?(v.door===t.a?1:-1):1;
  const hipY=p.y-38*s,hipX=p.x,rope=t.kind==='rappel',crawl=t.kind==='crawl';
  c.save();c.translate(hipX,hipY);c.scale(face*s,s);c.lineCap='round';c.lineJoin='round';
  const limb=(points,color,width)=>{c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);c.strokeStyle='#0b1b24';c.lineWidth=width+3;c.stroke();c.strokeStyle=color;c.lineWidth=width;c.stroke();};
  if(rope){
   limb([[-8,0],[13,17],[40,27]],'#6f222b',10);limb([[6,1],[24,24],[49,14]],'#902c2f',11);
   limb([[36,28],[51,29]],'#111f27',8);limb([[44,15],[59,19]],'#111f27',8);
  }else if(crawl){
   limb([[-5,1],[-24,16],[-51,16]],'#6f222b',10);limb([[4,3],[-8,28],[-27,29]],'#902c2f',11);
  }else{
   limb([[-8,0],[-18,16-gait*8],[-25,37-gait*5]],'#6f222b',10);limb([[7,1],[22,19+gait*9],[26,36+gait*5]],'#8c2a2e',11);
   limb([[-25,37-gait*5],[-13,38-gait*5]],'#111f28',7);limb([[26,36+gait*5],[39,35+gait*5]],'#111f28',7);
  }
  // Crop the inherited torso/head; limbs below are posed procedurally, not a new sprite sheet.
  c.save();c.rotate(rope?-.36:crawl?1.05:0);c.drawImage(img,42,0,71,182,-17,-72,30,75);c.restore();
  if(rope){limb([[-11,-46],[-38,-38],[-52,-57]],'#87272b',8);limb([[-6,-43],[-10,-18],[8,-5]],'#a63632',8);limb([[-52,-57],[-47,-59]],'#263b42',7);}
  else if(crawl){limb([[34,-25],[46,-10],[52,21]],'#a63632',8);limb([[25,-32],[45,-24],[63,9]],'#87272b',7);}
  else {limb([[-8,-49],[-28,-34+gait*12],[-34,-54+gait*12]],'#87272b',8);limb([[9,-47],[28,-45-gait*10],[34,-69-gait*10]],'#a63632',8);limb([[-35,-54+gait*12],[-28,-55+gait*12]],'#233840',6);limb([[34,-69-gait*10],[27,-69-gait*10]],'#233840',6);}
  c.strokeStyle='#cfbd8e';c.lineWidth=2.2;c.beginPath();c.moveTo(-16,-4);c.lineTo(15,-1);c.lineTo(7,11);c.lineTo(-10,9);c.closePath();c.stroke();
  c.fillStyle='#d6c594';c.beginPath();c.arc(13,-2,3,0,Math.PI*2);c.fill();c.restore();
 }

 drawTraversal(game){this.resize();const c=this.ctx,w=this.w,h=this.h;c.setTransform(this.dpr,0,0,this.dpr,0,0);this.zoom=h/670;this.crossingScale=Math.min(Math.max(.55,w/1200),h/550);this.currentGame=game;this.frame++;
  const v=game.s.traversal,t=G.AVP_TRAVERSAL.defs.get(v.id),q=this.crossingCanonicalFor(v),s=this.crossingScale;
  this.crossingBackdrop(game,t);this.crossingStructure(t);
  // Visible companions only when their committed connection is the same one.
  for(const [id,travel] of Object.entries(game.s.partyTraversals||{})){if(travel.id!==t.id)continue;const a=this.crossingPoint(t,this.crossingCanonicalFor(travel),-.65);this.direct(id,a.x,a.y,id==='scar'?123*s:93*s,1,0,.7);}
  const p=this.crossingPoint(t,q,v.lane),jiggle=this.reduced?0:Math.sin(game.s.worldTime*9)*(v.advance?2:0)*s;
  if(t.kind==='rappel'){const rope=this.crossingPoint(t,q);this.line(rope.x,rope.y-38*s,p.x+13*s,p.y-40*s,'#ccb88e',2*s);}
  this.glow(p.x,p.y-58*s,82*s,'#c8d9b710');
  this.climber(game,t,{x:p.x+jiggle,y:p.y});
  this.crossingHazards(game,t);
  c.textAlign='left';c.font=`${11*Math.max(.8,s)}px system-ui`;c.fillStyle='#a2b6b5';c.fillText('FRANCHISSEMENT  /  '+t.kind.toUpperCase(),24,h-30);
  // Dark frame leaves room for the HTML controls without hiding the route.
  const vg=c.createLinearGradient(0,0,w,0);vg.addColorStop(0,'#05151e66');vg.addColorStop(.3,'#05151e00');vg.addColorStop(.7,'#05151e00');vg.addColorStop(1,'#05151e77');c.fillStyle=vg;c.fillRect(0,0,w,h);
  if(game.flash>0&&!this.reduced){c.fillStyle=`rgba(222,190,134,${Math.min(.18,game.flash*.26)})`;c.fillRect(0,0,w,h);}
 }
 draw(game,options={}){if(game.s.traversal&&!options.title&&!options.epilogue)this.drawTraversal(game);else super.draw(game,options);}
 door(d,game){super.door(d,game);const t=game.traversalFor(d);if(!t)return;const c=this.ctx,p=this.point(d.x,d.y),s=this.zoom;c.save();c.strokeStyle='#d2c198';c.lineWidth=2*s;c.beginPath();c.arc(p.x+40*s,p.y-43*s,8*s,0,Math.PI*2);c.stroke();this.line(p.x+40*s,p.y-35*s,p.x+40*s,p.y-10*s,'#b0b7a2',2*s);c.restore();}
}
G.AVP_RENDERER=CrossingRenderer;
})(globalThis);

