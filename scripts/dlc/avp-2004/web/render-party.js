
/* Depth-sorted companions and rendezvous markers, using existing, separate SVG art. */
(function(G){'use strict';const D=G.AVP_DATA,Base=G.AVP_RENDERER;
class PartyRenderer extends Base{
 sceneObjects(game){const out=super.sceneObjects(game);
  for(const a of game.conversationActors())out.push({y:a.y,draw:()=>this.actor(a.asset,a,a.asset==='scar'?146:110,game)});
  const seb=game.companionActors().find(a=>a.id==='sebastian');if(seb)out.push({y:seb.y,draw:()=>this.actor('sebastian',seb,110,game)});
  for(const s of D.studies.filter(s=>s.room===game.s.room&&game.s.flags[s.after]&&!game.s.flags[s.before]))out.push({y:game.isSide?144:s.y,draw:()=>{
   const p=this.point(s.x,game.isSide?144:s.y),done=game.s.studies.includes(s.id),c=this.ctx;
   this.sprite('tablet',s.x,game.isSide?144:s.y,46,1,.9);c.save();c.strokeStyle=done?'#96c7b8':'#dec791';c.lineWidth=1.5;c.strokeRect(p.x-8,p.y+8,16,11);
   if(done){c.beginPath();c.moveTo(p.x-5,p.y+13);c.lineTo(p.x-1,p.y+17);c.lineTo(p.x+6,p.y+9);c.stroke();}
   if(!done&&game.near(s,100)){c.font='12px system-ui';c.textAlign='center';c.fillStyle='#e8dec0';c.fillText('U · '+s.title,p.x,p.y-148*this.zoom);}
   if(game._studyTarget===s.id&&game._studyHold>0){c.strokeStyle='#dac087';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y-30*this.zoom,21,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,game._studyHold/s.hold));c.stroke();}c.restore();
  }});
  return out;
 }
 operationMarkers(game){super.operationMarkers(game);const t=game.nearestConversation();if(!t||game._talk)return;const a=game.encounterPosition(t),p=this.point(a.x,a.y),c=this.ctx;c.save();c.textAlign='center';c.font='12px system-ui';c.fillStyle='#e7d5a7';c.fillText('U · '+t.name,p.x,p.y-(t.actor==='scar'?158:124)*this.zoom);c.restore();}
}
G.AVP_RENDERER=PartyRenderer;
})(globalThis);

