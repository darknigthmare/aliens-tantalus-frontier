
/* Uses existing actor art and draw primitives. No new raster art claimed. */
(function(G){'use strict';const Base=G.AVP_RENDERER,D=G.AVP_DATA;
class EvacuationRenderer extends Base{
 sceneObjects(game){const out=super.sceneObjects(game);
  for(const spot of game.evacuationSpots()){
   const y=game.isSide?144:spot.y;
   out.push({y:y-.3,draw:()=>{const c=this.ctx,p=this.point(spot.x,y),s=this.zoom*this.depth(y),near=game.near(spot,235),active=!!game.s.evacuation.haul;
    c.save();c.strokeStyle=active?'#d9c8a0':'#8ca59780';c.lineWidth=1.5;c.setLineDash([9*s,7*s]);c.beginPath();c.ellipse(p.x,p.y+4*s,69*s,16*s,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
    for(const side of [-1,1]){c.beginPath();c.moveTo(p.x+side*49*s,p.y+4*s);c.lineTo(p.x+side*35*s,p.y+4*s);c.stroke();}
    c.fillStyle=active?'#ebdbb9':'#aebcb0';c.font='10px system-ui';c.textAlign='center';
    if(near||active)c.fillText('POINT DE REGROUPEMENT',p.x,p.y+34*s);
    c.restore();}});
  }
  const h=game.s.evacuation.haul,a=h&&game.companionBody(h.id);
  if(a)out.push({y:Math.max(game.s.player.y,a.y)+.3,draw:()=>{
   const c=this.ctx,p=this.point(game.s.player.x,game.s.player.y),q=this.point(a.x,a.y),s=this.zoom*this.depth(a.y);
   c.save();c.lineCap='round';c.lineWidth=6*s;c.strokeStyle='#263c46';
   c.beginPath();c.moveTo(p.x,p.y-68*s);c.lineTo(p.x+(q.x-p.x)*.43,p.y-43*s);c.lineTo(q.x,q.y-22*s);c.stroke();
   c.strokeStyle='#cfb989';c.lineWidth=2*s;c.beginPath();c.moveTo(p.x+(q.x-p.x)*.5,p.y-42*s);c.lineTo(q.x,q.y-24*s);c.stroke();c.restore();
  }});
  return out;
 }
 actor(asset,a,height,game,animate=false,alpha=1){
  if(a===game.s.player&&(game.s.evacuation.haul||game._haulHold)){
   const c=this.ctx,p=this.point(a.x,a.y);c.save();c.translate(p.x,p.y);c.rotate((a.face||1)*-.055);c.translate(-p.x,-p.y);
   super.actor(asset,a,height*.94,game,animate,alpha);c.restore();return;
  }
  super.actor(asset,a,height,game,animate,alpha);
 }
}
G.AVP_RENDERER=EvacuationRenderer;
})(globalThis);

