
/* v0.10 · Cues and poses drawn in the real game; reuses existing sprites. */
(function(G){'use strict';const Base=G.AVP_RENDERER,D=G.AVP_DATA,C=G.AVP_CORE,R=D.encounterRules;
class EncounterRenderer extends Base{
 sceneObjects(g){const out=super.sceneObjects(g);
  if(g.s.traversal||g.s.scene)return out;
  for(const d of D.enemyDucts.filter(d=>d.room===g.s.room&&g.s.flags[d.after]))for(const end of ['a','b']){
   const point=d[end],y=g.isSide?144:point.y,inside=Object.values(g.s.encounter?.actors||{}).find(v=>v.duct?.id===d.id),v=inside?.duct;
   const active=v&&(v.phase==='outlet'&&v.from!==end||v.phase==='inlet'&&v.from===end);
   out.push({y:y-.2,draw:()=>{const p=this.point(point.x,y),s=this.zoom*this.depth(y),c=this.ctx;
    c.save();c.translate(p.x,p.y);c.scale(s,s);this.ellipse(0,4,57,15,'#05151bb0');this.ellipse(0,1,39,11,'#010a10');
    c.lineWidth=2;c.strokeStyle=active?'#d5b576':'#61796e';c.beginPath();c.ellipse(0,2,44,13,0,0,Math.PI*2);c.stroke();
    for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*10,-10);c.lineTo(i*10+7,11);c.stroke();}
    c.strokeStyle='#354c47';c.lineWidth=5;for(const f of [-1,1]){c.beginPath();c.moveTo(f*42,5);c.quadraticCurveTo(f*66,-5,f*63,-28);c.stroke();}
    if(active){const t=g.s.worldTime;for(let k=0;k<8;k++){const x=Math.sin(k*6.2+t*1.4)*35,yy=-10-((k*8+t*20)%45);this.ellipse(x,yy,1.6,2.8,'#d9c494a0');}c.strokeStyle='#e8c987aa';c.lineWidth=1;c.beginPath();c.ellipse(0,3,49+(Math.sin(t*4)+1)*5,16,0,0,Math.PI*2);c.stroke();}
    c.restore();}});
  }
  for(const e of g.enemies){const a=g.s.encounter?.actors[e.id]?.action;if(!a||a.phase!=='windup'||!g.encounterVisible(e))continue;
   out.push({y:-5,draw:()=>{const c=this.ctx,end=a.kind==='tail'?{x:a.origin.x+a.face*R.tail.reach,y:a.origin.y}:a.aim,start=a.origin;let t=1;
    while(t>.04&&!G.AVP_EVACUATION.clearSegment(g.collisionRoom,start,{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t},2))t-=.04;
    const q={x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t},p=this.point(start.x,start.y),b=this.point(q.x,q.y),z=this.zoom;
    c.save();c.strokeStyle=a.kind==='pounce'?'#ebc58c':'#efa28e';c.lineWidth=2;c.setLineDash([7*z,6*z]);c.beginPath();c.moveTo(p.x,p.y+4);c.lineTo(b.x,b.y+4);c.stroke();c.setLineDash([]);
    this.ellipse(b.x,b.y+4,(a.kind==='pounce'?34:25)*z,10*z,a.kind==='pounce'?'#e3c78630':'#ee927833');
    const side=b.x>p.x?1:-1;c.beginPath();c.moveTo(b.x-side*13*z,b.y-3*z);c.lineTo(b.x,b.y+4);c.lineTo(b.x-side*13*z,b.y+11*z);c.stroke();c.restore();}});
  }
  return out;
 }
 actor(asset,e,height,g,animate=false,alpha=1){
  const st=e.id&&g.s.encounter?.actors[e.id],a=st?.action,v=st?.duct;
  if(a?.kind==='pounce'&&a.phase==='flight'){
   const p=this.point(e.x,e.y),z=this.zoom*this.depth(e.y),lift=Math.sin(Math.min(1,a.t/R.pounce.flight)*Math.PI)*58*z;
   this.ellipse(p.x,p.y+2,24*z,6*z,'#03131899');this.ctx.save();this.ctx.translate(0,-lift);this.sprite(asset,e.x,e.y,height,e.face,alpha,-e.face*.12);this.ctx.restore();return;
  }
  if(v?.phase==='inlet'){this.ctx.save();const p=this.point(e.x,e.y);this.ctx.translate(0,v.t/R.duct.inlet*26*this.zoom);super.actor(asset,e,height*(1-v.t/R.duct.inlet*.4),g,animate,alpha*(1-v.t/R.duct.inlet));this.ctx.restore();return;}
  super.actor(asset,e,height,g,animate,alpha);
  if(a?.phase==='windup'){
   const c=this.ctx,p=this.point(e.x,e.y),s=this.zoom*this.depth(e.y),r=R[a.kind];c.save();
   c.strokeStyle=a.kind==='pounce'?'#dfc397':'#d89d85';c.lineWidth=2.5*s;c.beginPath();c.arc(p.x,p.y-(a.kind==='pounce'?53:144)*s,12*s,-Math.PI/2,-Math.PI/2+(a.t/r.windup)*Math.PI*2);c.stroke();
   if(a.kind==='tail'){c.strokeStyle='#9bada1';c.lineWidth=5*s;c.beginPath();c.moveTo(p.x-e.face*22*s,p.y-51*s);c.bezierCurveTo(p.x-e.face*91*s,p.y-62*s,p.x-e.face*81*s,p.y-141*s,p.x+e.face*34*s,p.y-112*s);c.stroke();c.strokeStyle='#dcc9a4';c.lineWidth=2*s;c.stroke();}
   c.restore();
  }
 }
}
G.AVP_RENDERER=EncounterRenderer;
})(globalThis);

