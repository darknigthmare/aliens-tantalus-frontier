
/* v0.3: stateful props, local architectural continuity, trace rendering and readable stealth. */
(function(G){'use strict';const Base=G.AVP_RENDERER,D=G.AVP_DATA,C=G.AVP_CORE;
class TracesRenderer extends Base{
 background(room,t){super.background(room,t);const c=this.ctx,w=this.w,h=this.h,g=this.currentGame;
  c.save();c.beginPath();c.rect(0,0,w,h*.596);c.clip();
  if(['dormitory','mess'].includes(room.id)){
   for(let i=-1;i<12;i++){const x=i*220*this.zoom-(this.cam*this.zoom*.34)%(220*this.zoom);this.line(x,0,x+72,h*.596,'#172b34',16*this.zoom);this.line(x+15,0,x+84,h*.596,'#a0a08755',2);}
   if(room.id==='dormitory'){const y=h*.17;this.line(0,y,w,y,'#182d33',24*this.zoom);this.line(0,y+14,w,y+14,'#b4a88255',2);}
  }
  if(room.id==='cellar'){c.fillStyle='#0a20254a';c.fillRect(0,0,w,h*.594);for(let i=0;i<9;i++){const x=i*w*.2-this.cam*this.zoom*.12;this.line(x,0,x,h*.6,'#192e34',24*this.zoom);this.line(x+13,0,x+13,h*.6,'#8a9c8355',3);}}
  if(room.id==='balcony'){
   c.fillStyle='#0a202c';c.fillRect(0,h*.14,w,h*.455);
   for(let i=-1;i<6;i++){const x=i*w*.32-this.cam*this.zoom*.14;this.line(x,h*.26,x+w*.22,h*.53,'#435d6666',70*this.zoom);for(let j=0;j<6;j++)this.line(x-70,h*(.32+j*.04),x+w*.34,h*(.32+j*.04),'#94a99a33',2);}
   this.glow(w*.5,h*.3,h*.8,'#99b6bf0e');
  }
  if(room.id==='drain'){for(let i=0;i<2;i++)this.line(0,h*(.40+i*.1),w,h*(.40+i*.1),'#0a2331',30*this.zoom);}
  if(room.id==='cloister'){for(let i=-1;i<8;i++){const x=i*320*this.zoom-(this.cam*this.zoom*.35)%(320*this.zoom);c.fillStyle='#122a3699';c.fillRect(x,h*.08,135*this.zoom,h*.515);this.line(x,h*.08,x,h*.596,'#95a48b33',7);}}
  // Actual operation state lights the portable group, not the ancient boiler.
  if(room.id==='engine'&&g?.s.operations.includes('power'))this.glow(this.point(1310,68).x,h*.48,140*this.zoom,'#c4d9a631');
  if(room.id==='tower'&&g?.s.operations.includes('antenna')){this.glow(this.point(900,64).x,h*.49,120*this.zoom,'#99cdb729');}
  c.restore();
  for(const f of g?.footprints||[])if(f.room===room.id&&g.s.worldTime-f.t<22){const a=Math.max(0,.18-(g.s.worldTime-f.t)*.007),q=this.point(f.x,f.y);c.save();c.globalAlpha=a;c.translate(q.x,q.y);c.rotate(f.face*.2);this.ellipse(-4,-2,6*this.zoom,2.7*this.zoom,'#bed2d0');this.ellipse(6,4,6*this.zoom,2.7*this.zoom,'#bed2d0');c.restore();}
 }
 prop(p){const g=this.currentGame;this.ctx.save();if(p.y>210&&g&&Math.abs(g.s.player.x-p.x)<160&&g.s.player.y<p.y)this.ctx.globalAlpha=.34;const sizes={bunk:205,stove:189,shelf:202,diningtable:135,mug:36,boots:62,bedroll:60,suitcase:82,'crates-stack':144,stonearch:255,railingstone:152,waterchannel:95};
  if(sizes[p.asset])this.sprite(p.asset,p.x,p.y,sizes[p.asset]*p.scale);else super.prop(p);this.ctx.restore();
 }
 actor(asset,a,height,game,...rest){if(a===game.s.player&&game.s.hidden)return;super.actor(asset,a,height,game,...rest);}
 sceneObjects(game){const out=super.sceneObjects?super.sceneObjects(game):[];
  for(const o of D.interactables.filter(o=>o.room===game.s.room)){
   const py=game.isSide?144:o.y;
   out.push({y:py-4,draw:()=>{
    if(o.kind==='cache'){this.sprite(game.s.opened.includes(o.id)?'case-field-open':'case-field',o.x,py,68);}
    else if(o.kind==='clue'&&!game.s.clues.includes(o.id))this.sprite('field-page',o.x,py,32);
    else if(o.kind==='hide'){this.sprite(game.room.biome==='timber'?'locker':'hide-niche',o.x,py-20,169);if(game.s.hidden?.id===o.id){const p=this.point(o.x,py);this.glow(p.x,p.y-68*this.zoom,35*this.zoom,'#b8d7cb12');}}
   }});
  }
  return out;
 }
 draw(game,options={}){super.draw(game,options);if(options.title||options.epilogue||game.s.scene)return;
  const c=this.ctx,p=game.s.player,w=this.w,h=this.h;
  if(game.s.flags.gear&&game.s.lamp&&!game.s.hidden){
   const origin=this.point(p.x,p.y),rays=[],reach=450;
   for(let i=0;i<=18;i++){const dy=(i/18-.5)*138;let end={x:p.x+p.face*reach,y:C.clamp(p.y+dy,48,245)};
    const n=60;for(let j=1;j<=n;j++){const q={x:p.x+(end.x-p.x)*j/n,y:p.y+(end.y-p.y)*j/n};if(game.collisionRoom.solids.some(b=>q.x>b.x&&q.x<b.x+b.w&&q.y>b.y&&q.y<b.y+b.h)){end=q;break;}}
    const q=this.point(end.x,end.y);rays.push({x:q.x,y:q.y-75*this.zoom});
   }
   c.save();c.beginPath();c.moveTo(origin.x,origin.y-82*this.zoom);for(const q of rays)c.lineTo(q.x,q.y);c.closePath();const grad=c.createLinearGradient(origin.x,0,origin.x+p.face*reach*this.zoom,0);grad.addColorStop(0,'#d6e1b418');grad.addColorStop(1,'#d6e1b400');c.fillStyle=grad;c.fill();c.restore();
  }
  const door=game.nextWaypointDoor;
  if(door){const q=this.point(door.x,game.isSide?144:door.y),sx=C.clamp(q.x,24,w-24),sy=C.clamp(q.y-200*this.zoom,70,h-80);c.save();c.translate(sx,sy);c.strokeStyle='#d7c895';c.fillStyle='#10232dde';c.lineWidth=2;c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ead9a7';c.font='16px system-ui';c.textAlign='center';c.fillText(q.x<0?'←':q.x>w?'→':'↓',0,5);c.restore();}
  // Telegraph markers match state, not an always-on enemy map.
  for(const e of game.enemies.filter(e=>e.hp>0&&!e.unique)){
   const rt=game.runtime[e.id],q=this.point(e.x,e.y);if(!rt||!['pursue','search','investigate'].includes(rt.mode)||Math.abs(e.x-p.x)>700)continue;
   c.font=`${15*this.zoom}px system-ui`;c.textAlign='center';c.fillStyle=rt.mode==='pursue'?'#d9a789':'#bbccba';c.fillText(rt.mode==='pursue'?'!':'?',q.x,q.y-145*this.zoom);
  }
 }
}
G.AVP_RENDERER=TracesRenderer;
})(globalThis);

