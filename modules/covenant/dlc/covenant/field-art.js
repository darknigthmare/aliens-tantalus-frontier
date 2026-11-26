/* v0.4 field presentation. Every marker reads engine state; no hidden progression. */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
class CovenantFieldRenderer extends root.CovenantRenderer{
 drawWeapon(actor,pt,draw){const c=this.c,aim=this.engine.aim;c.save();if(aim){const q=this.project(aim.x,aim.z),dx=(q.x-pt.x)*(actor.facing||1),dy=(q.y-(aim.height||72)*q.s)-(pt.y-72*pt.s);c.translate(21,-72);c.rotate(clamp(Math.atan2(dy,Math.max(35,dx)),-.7,.7));c.translate(-21,72);}draw();c.restore();}
 pointerWorld(clientX,clientY){
  const box=this.canvas.getBoundingClientRect(),sx=(clientX-box.left)/box.width*this.W,sy=(clientY-box.top)/box.height*this.H,r=this.engine.room;
  // Directly pointing at a visible silhouette picks its ground lane ONCE, never tracks it.
  const hovered=this.engine.enemies().filter(e=>{if(!e.alive||!this.engine.lineClear(this.engine.state.player,e,80))return false;const p=this.project(e.x,e.z),small=e.kind==='facehugger';return Math.abs(sx-p.x)<(small?48:58)*p.s&&sy<p.y&&sy>p.y-(small?42:188)*p.s;}).sort((a,b)=>Math.abs(sx-this.project(a.x,a.z).x)-Math.abs(sx-this.project(b.x,b.z).x))[0];
  if(hovered)return {x:hovered.x,z:hovered.z,height:hovered.kind==='facehugger'?20:95};
  return {x:clamp(sx+this.camera,0,r.width),z:r.view==='side'?.5:clamp((sy-468.84)/128.4,.08,.92)};
 }
 drawCrew(actor){const c=this.c,p=this.project(actor.x,actor.z),E=this.engine,near=E.distance(actor)<145;if(p.x<-120||p.x>this.W+120)return;
  c.save();if(actor.phase==='caution'){c.translate(p.x,p.y);c.scale(1,.76);c.translate(-p.x,-p.y);}this.human(actor,E.crewRole(actor),actor.phase==='walk');c.restore();
  if(near){this.text('T · '+E.crewName(actor),clamp(p.x,85,this.W-85),p.y-139,12,'#d9dfc2','center');this.ellipse(p.x,p.y+6,29,6,'#b4c9c349');}
 }
 human(actor,role='daniels',moving=false){super.human(actor,role,moving);if(role!=='daniels'||this.engine.state.hidden)return;const E=this.engine,p=this.project(actor.x,actor.z),c=this.c;
  if(E.scanning){c.save();c.translate(p.x,p.y);c.scale(p.s*actor.facing,p.s);this.line([[12,-83],[30,-65],[41,-74]],'#c4bda0',7);this.poly([[29,-87],[52,-84],[50,-65],[30,-69]],'#233b43','#b4cdc2',1.5);this.rect(34,-82,12,10,'#87c7b1');c.restore();}
  if(E.shoveCooldown>1.08){const amount=(1.5-E.shoveCooldown)/.42;c.save();c.translate(p.x,p.y);c.scale(p.s*actor.facing,p.s);this.line([[8,-82],[29+Math.sin(amount*Math.PI)*23,-70],[49+Math.sin(amount*Math.PI)*37,-72]],'#c6c3a5',9);this.line([[42,-62],[73,-60]],'#7e9690',7);c.restore();}
 }
 frame(dt,input){super.frame(dt,input);const E=this.engine,s=E.state,c=this.c;
  for(const v of E.room.surveys||[]){const p=this.project(v.x,v.z);if(p.x<15||p.x>this.W-15)continue;const done=s.surveys.includes(v.id),near=E.distance(v)<v.radius;
   this.poly([[p.x-8,p.y-115],[p.x,p.y-123],[p.x+8,p.y-115],[p.x,p.y-107]],done?'#6e8c8233':'#b1d0c24d',done?'#799b88':'#b9d2c6',1.5);
   if(near&&!done)this.text('N · RELEVÉ',clamp(p.x,90,this.W-90),p.y-133,11,'#c6ddd1','center');
   if(E.scanning===v.id){const t=s.surveyProgress[v.id]||0;c.save();c.beginPath();c.arc(p.x,p.y-115,18,-Math.PI/2,-Math.PI/2+t*Math.PI*2);c.strokeStyle='#dce3b5';c.lineWidth=3;c.stroke();c.restore();this.ellipse(p.x,p.y+5,38,8,'#b7d5c53c');}
  }
  if(E.aim&&!s.hidden&&!E.busy){const aim=E.aim,p=this.project(aim.x,aim.z),y=p.y-(aim.height||72)*p.s;c.save();this.line([[p.x-13,y],[p.x-5,y]],'#d0e3cfb0',1.3);this.line([[p.x+5,y],[p.x+13,y]],'#d0e3cfb0',1.3);this.line([[p.x,y-13],[p.x,y-5]],'#d0e3cfb0',1.3);this.line([[p.x,y+5],[p.x,y+13]],'#d0e3cfb0',1.3);this.ellipse(p.x,p.y+4,8,2,'#abc9b888');this.line([[p.x,p.y],[p.x,y+17]],'#acccc138',1);c.restore();}
 }
}
root.CovenantRenderer=CovenantFieldRenderer;
})(globalThis);
