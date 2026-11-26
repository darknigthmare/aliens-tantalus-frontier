
/* State-driven care props and depth-sorted companion conditions.
   Existing sprite sources are reused; this is not a new art pack. */
(function(G) {
  'use strict';
  const D=G.AVP_DATA, Base=G.AVP_RENDERER;
  class RescueRenderer extends Base {
    actor(asset, a, height, game, animate=false, alpha=1) {
      const id=a.id, rule=D.rescueRules[id], vital=rule&&game.s.party?.[id] ? game.companionVital(id) : null;
      if (vital?.hp===0) {
        const c=this.ctx,p=this.point(a.x,a.y),s=this.depth(a.y)*this.zoom,im=this.images[G.AVP_FIDELITY?.asset(asset,game.s)||asset];
        this.ellipse(p.x,p.y+2,54*s,10*s,'#07141e');
        if(im){const hh=height*.88*s,ww=hh*im.width/im.height;c.save();c.translate(p.x,p.y-ww*.20);c.rotate(-Math.PI/2);c.globalAlpha=.92;c.drawImage(im,-ww*.5,-hh*.5,ww,hh);c.restore();}
        c.save();c.textAlign='center';c.font='600 11px system-ui';c.fillStyle='#f2b29b';c.fillText(game.s.evacuation?.haul?.id===id?'TRACTION · I POUR DÉPOSER':'À TERRE · I',p.x,p.y-38*s);c.restore();
      } else super.actor(asset,a,height,game,animate,alpha);
      if(vital && vital.hp>0 && vital.hp<rule.maxHp) {
        const c=this.ctx,p=this.point(a.x,a.y),s=this.depth(a.y)*this.zoom,w=54*s;
        c.save();c.fillStyle='#091c24';c.fillRect(p.x-w/2,p.y-(height+12)*s,w,5);
        c.fillStyle=vital.hp<rule.woundBelow?'#dc947f':'#a8c5ac';c.fillRect(p.x-w/2,p.y-(height+12)*s,w*vital.hp/rule.maxHp,5);c.restore();
      }
    }
    sceneObjects(game) {
      const result=super.sceneObjects(game);
      for(const st of D.careStations.filter(s=>game.careStationAvailable(s))) {
        const y=game.isSide?144:st.y;
        result.push({y,draw:()=>{
          const used=game.s.rescue.usedStations.includes(st.id),c=this.ctx,p=this.point(st.x,y),z=this.zoom*this.depth(y);
          this.ellipse(p.x,p.y+3,41*z,8*z,'#07151b');
          this.sprite('medkit',st.x,y,48,1,used?.45:1);
          c.save();c.strokeStyle=used?'#617979':'#d5c39a';c.lineWidth=2;
          // The open, displaced lid and empty strap remain visible after consumption.
          if(used){c.beginPath();c.moveTo(p.x-31*z,p.y-34*z);c.lineTo(p.x-47*z,p.y-55*z);c.lineTo(p.x+2*z,p.y-55*z);c.stroke();}
          c.font='10px system-ui';c.textAlign='center';c.fillStyle=used?'#92a69e':'#daceac';
          if(game.near(st,175))c.fillText(used?'RÉSERVE ÉPUISÉE':'I · DÉPLOYER LES SOINS',p.x,p.y-64*z);
          c.restore();
        }});
      }
      return result;
    }
    operationMarkers(game) {
      super.operationMarkers(game);
      const action=game._aid;if(!action||game.s.traversal)return;
      const p=this.point(game.s.player.x,game.s.player.y),c=this.ctx;
      c.save();c.strokeStyle='#d6c297';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y-137*this.zoom,23,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,action.progress/action.hold));c.stroke();
      c.fillStyle='#eadbb4';c.font='11px system-ui';c.textAlign='center';c.fillText(Math.floor(action.progress/action.hold*100)+' %',p.x,p.y-133*this.zoom);c.restore();
    }
  }
  G.AVP_RENDERER=RescueRenderer;
})(globalThis);

