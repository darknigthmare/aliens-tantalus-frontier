
/* Hardware is attached to the actual paired-door anchors. Not a backdrop collision proxy. */
(function(G){'use strict';const Base=G.AVP_RENDERER,D=G.AVP_DATA,C=G.AVP_CORE;
class HuntRenderer extends Base {
 door(d,g){
  super.door(d,g);const def=g.portalFor(d);if(!def)return;
  const v=g.portalState(d),c=this.ctx,q=this.point(d.x,d.y),s=this.depth(d.y)*this.zoom;
  const wooden=def.material==='timber',height=166,width=78,progress=v.status==='closed'?1:v.status==='closing'?Math.min(1,v.progress/.6):0;
  c.save();c.translate(q.x,q.y);c.scale(s,s);
  // Side rails and overhead drum remain in every state, including a destroyed leaf.
  c.fillStyle=wooden?'#887152':'#78908d';c.fillRect(-width/2-8,-height-8,7,height+12);c.fillRect(width/2+1,-height-8,7,height+12);
  c.fillStyle='#172a31';c.fillRect(-width/2-10,-height-18,width+20,20);
  this.line(-width/2-7,-height-13,width/2+7,-height-13,'#b2b598',3);
  if(v.status==='broken'){
   for(let i=0;i<7;i++){const x=-width/2+6+i*10;this.line(x,-height+4,x+(i%2?7:-5),-height+31+(i%3)*8,'#728783',4);this.line(x,0,x+(i%2?-9:6),-12-(i%3)*7,'#627976',4);}
   this.line(-36,-3,36,7,'#283e42',7);
  }else{
   c.save();c.beginPath();c.rect(-width/2,-height,width,height);c.clip();c.translate(0,-height*(1-progress));
   c.fillStyle=wooden?'#5b5041dd':'#152e3880';c.fillRect(-width/2,-height,width,height);
   if(wooden){for(let i=0;i<6;i++){c.fillStyle=i%2?'#6c614c':'#82765a';c.fillRect(-width/2+2+i*13,-height+4,10,height-8);}}
   else for(let i=0;i<8;i++){const x=-width/2+4+i*10;this.line(x,-height+3,x,-3,'#1b3038',7);this.line(x+1,-height+3,x+1,-3,'#91a39b',3);}
   for(const y of [-height+14,-height*.51,-8]){this.line(-width/2,y,width/2,y,wooden?'#b5a67e':'#708e8b',7);this.line(-width/2,y+4,width/2,y+4,'#20383b',2);}
   const damage=def.hp-v.hp;for(let i=0;i<damage;i++){const x=-22+i*23;this.line(x,-122,x+17,-100,'#e1c493',3);this.line(x+17,-100,x+2,-79,'#162c32',4);}
   c.restore();
  }
  if(progress>0&&g.s.worldTime-v.hitAt<.5){const fade=Math.max(0,1-(g.s.worldTime-v.hitAt)*2);this.glow(0,-height*.45,90,'#d99c5f'+Math.round(fade*58).toString(16).padStart(2,'0'));}
  // Small practical lever on the same side as the door label; never a floating objective.
  c.fillStyle='#314b4d';c.fillRect(width/2+12,-66,16,41);this.line(width/2+20,-54,width/2+27,-76,'#c8ba94',4);
  if(g.near(d,155)){
   c.textAlign='center';c.font='10px system-ui';c.fillStyle=v.status==='broken'?'#bd9277':'#d2c398';
   c.fillText(v.status==='broken'?'MÉCANISME BRISÉ':v.status==='closed'?'V · ROUVRIR':v.status==='closing'?(v.waiting?'PASSAGE OCCUPÉ · V':'V · ANNULER'):'V · FERMER',0,24);
   if(g._sealTarget===d.id&&g._sealHold>0){c.fillStyle='#132932';c.fillRect(-36,30,72,3);c.fillStyle='#cfb985';c.fillRect(-36,30,72*g._sealHold/.55,3);}
  }
  c.restore();
 }
 draw(g,options={}){
  super.draw(g,options);if(options.title||options.epilogue)return;
  const c=this.ctx,w=this.w,h=this.h;
  if(g.crossing&&!g.s.scene){const t=g.crossing.t/g.crossing.duration,a=Math.max(0,1-t);
   c.save();const grad=c.createLinearGradient(0,0,w,0);grad.addColorStop(0,'rgba(4,17,23,'+(a*.78)+')');grad.addColorStop(.42,'rgba(4,17,23,'+(a*.25)+')');grad.addColorStop(1,'rgba(4,17,23,'+(a*.78)+')');c.fillStyle=grad;c.fillRect(0,0,w,h);
   c.textAlign='center';c.font='12px system-ui';c.fillStyle='rgba(225,219,188,'+Math.min(1,a*2)+')';const k=g.crossing,dir=k.delta>0?'↑':k.delta<0?'↓':'→';c.fillText(dir+'  '+g.room.name.toUpperCase(),w/2,h*.14);c.restore();
  }
  const hint=g.listeningHint;
  if(hint){const d=g.room.doors.find(d=>d.id===hint.door);
   if(d){const q=this.point(d.x,d.y);c.save();const pulse=this.reduced?0:(g.s.worldTime%1.2)/1.2;
    for(let i=0;i<3;i++){c.strokeStyle=hint.level>1?'rgba(213,172,119,'+(.50-i*.1)+')':'rgba(160,198,184,'+(.35-i*.08)+')';c.lineWidth=1.5;const r=(18+i*15+pulse*12)*this.zoom;c.beginPath();c.ellipse(q.x,q.y-82*this.zoom,r,r*1.2,0,0,Math.PI*2);c.stroke();}c.restore();}
   c.save();const bw=Math.min(w-32,420),x=(w-bw)/2,y=h-82;c.fillStyle='#0b1e29ee';c.fillRect(x,y,bw,60);this.line(x,y,x+bw,y,hint.level>1?'#c8a073':'#698e86',2);c.fillStyle='#b6c9bc';c.font='10px system-ui';c.textAlign='center';c.fillText('ÉCOUTE AU SEUIL · X',w/2,y+20);c.fillStyle='#e0d2af';c.font='12px system-ui';c.fillText(hint.text,w/2,y+42);c.restore();
  }
 }
}
G.AVP_RENDERER=HuntRenderer;
})(globalThis);

