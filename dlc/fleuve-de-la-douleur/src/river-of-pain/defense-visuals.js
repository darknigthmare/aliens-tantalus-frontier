/* Mechanical partitions and local sounders. Their floor footprint is the collision geometry. */
(function(root){'use strict';
const P=root.ROP_Renderer.prototype,F=root.ROP_DEFENSE,D=root.ROP_DATA;
P.defenseDraws=function(sim,draw){
 for(const d of D.defense.shutters.filter(d=>d.room===sim.s.room)){const geom=F.geometry(sim.s,d),v=sim.s.defense.shutters[d.id];draw.push({z:geom.z+geom.d/2+.001,run:()=>this.shutter(d,geom,v,sim)});for(const control of d.controls)draw.push({z:control.z-.001,run:()=>this.shutterControl(control,sim)});}
 for(const d of D.defense.alarms.filter(d=>d.room===sim.s.room))draw.push({z:d.z+.001,run:()=>this.alarm(d,sim.s.defense.alarms[d.id],sim)});
};
P.shutter=function(d,g,v,sim){
 const k=this.scale,p=this.project(g.x,g.z),front=this.project(g.x,g.z+g.d/2),back=this.project(g.x,g.z-g.d/2),h=d.height*k,half=g.w*k/2;
 const metal=v.hp<45?'#80786a':'#66858a',highlight='#c3c6a6',ctx=this.ctx,closed=v.state==='closed',broken=v.state==='broken';
 ctx.save();
 // Exact floor rectangle and open-side controls remain visible in all states.
 this.path([[p.x-half,back.y],[p.x+half,back.y],[p.x+half,front.y],[p.x-half,front.y]],closed?'#172b31dd':'#19303366','#8fa88c77',1.2*k);
 for(const y of [back.y,front.y]){
  this.rect(p.x-half-5*k,y-h,8*k,h,'#29434e','#89a69a');this.rect(p.x+half-3*k,y-h,8*k,h,'#29434e','#89a69a');
  this.rect(p.x-half-9*k,y,16*k,5*k,'#798e84');this.rect(p.x+half-7*k,y,16*k,5*k,'#798e84');
 }
 this.path([[p.x-half-6*k,back.y-h-9*k],[p.x+half+6*k,back.y-h-9*k],[p.x+half+6*k,front.y-h-9*k],[p.x-half-6*k,front.y-h-9*k]],'#6b8482','#a2b39e',k);
 if(closed){
  this.path([[p.x-half,back.y-h],[p.x+half,back.y-h],[p.x+half,front.y-h],[p.x-half,front.y-h]],metal,highlight);
  this.path([[p.x-half,back.y-h],[p.x-half,front.y-h],[p.x-half,front.y-9*k],[p.x-half,back.y-9*k]],'#526d77','#a3b6a7');
  this.path([[p.x+half,back.y-h],[p.x+half,front.y-h],[p.x+half,front.y-9*k],[p.x+half,back.y-9*k]],'#38545e','#8eaaa1');
  this.rect(p.x-half,front.y-h,g.w*k,h-9*k,metal,highlight);
  for(let y=14;y<d.height-12;y+=15){this.line(p.x-half,front.y-h+y*k,p.x+half,front.y-h+y*k,'#1c3448',2*k);this.line(p.x-half,back.y-h+y*k,p.x-half,front.y-h+y*k,'#162e44',1.2*k);}
  this.rect(p.x-half,front.y-31*k,g.w*k,16*k,'#a7a575');
  for(let x=-g.w/2;x<g.w/2;x+=16)this.path([[p.x+x*k,front.y-31*k],[p.x+(x+7)*k,front.y-31*k],[p.x+(x+16)*k,front.y-15*k],[p.x+(x+9)*k,front.y-15*k]],'#293940');
  if(v.hp<100)for(let i=0;i<Math.ceil((100-v.hp)/18);i++){const y=front.y-h+(28+i*21)*k;this.path([[p.x-12*k,y],[p.x+8*k,y+3*k],[p.x-2*k,y+10*k]],null,'#182e3c',2*k);}
  this.text('CF',p.x,front.y-h+37*k,13*k,'#e4dfb7','center');
 }else if(broken){
  for(let i=0;i<5;i++)this.path([[p.x-half+i*10*k,front.y-8*k],[p.x-half+(i*10+23)*k,front.y+(i%2?10:3)*k],[p.x-half+(i*10+16)*k,front.y-18*k]],'#6d807c','#a8aa8c');
  this.rect(p.x-half,front.y-h,g.w*k,22*k,'#526d73','#b5b497');
 }else{
  this.rect(p.x-half,front.y-h,g.w*k,26*k,metal,highlight);for(let i=0;i<4;i++)this.line(p.x-half,front.y-h+(4+i*5)*k,p.x+half,front.y-h+(4+i*5)*k,'#223d4e',k);
 }

 if(Math.abs(sim.s.player.x-d.x)<530){const y=back.y-h-39*k;this.text(d.label.toUpperCase(),p.x,y,10*k,'#d9dcc5','center');
  this.text(broken?'MÉCANISME DÉTRUIT':closed?'FERMÉ · '+Math.ceil(v.hp)+' %':'OUVERT · '+Math.ceil(v.hp)+' %',p.x,y+15*k,8*k,broken?'#d29b75':'#a8c6b9','center');
  if(closed){this.rect(p.x-38*k,y+20*k,76*k,3*k,'#182f3e');this.rect(p.x-38*k,y+20*k,.76*v.hp*k,3*k,v.hp<40?'#c89564':'#9ebfa0');}
 }
 ctx.restore();
};
P.shutterControl=function(control,sim){const k=this.scale;const a=this.project(control.x,sim.s.mode==='classic'?.7:control.z),near=sim.near(sim.s.player,control,96);
  this.line(a.x,a.y,a.x,a.y-66*k,'#5e8086',4*k);this.rect(a.x-12*k,a.y-78*k,24*k,27*k,'#1b3546','#91ae9e');this.circle(a.x,a.y-65*k,7*k,'#9aae8c');this.circle(a.x,a.y-65*k,3.2*k,'#2d4e59');
  this.line(a.x,a.y-65*k,a.x+5*k,a.y-68*k,'#d1d3ac',2*k);
  this.rect(a.x-11*k,a.y-15*k,22*k,7*k,'#6eaa9d');this.text('LIBÉRER',a.x,a.y-19*k,5.8*k,'#b0d2b3','center');
  if(near)this.text('E / ENTRÉE',a.x,a.y-93*k,8.5*k,'#d9e2bf','center');
};
P.alarm=function(d,v,sim){const p=this.project(d.x,d.z),k=this.scale,powered=root.ROP_COLONY.isPowered(sim.s,sim.room),color=v.broken?'#655b54':v.delay?'#bea16b':v.buzz?'#ead1a1':powered?'#93b7a2':'#506270';
 this.line(p.x,p.y,p.x,p.y-123*k,'#6e8c8e',6*k);this.rect(p.x-22*k,p.y-126*k,44*k,30*k,'#355868','#9bb2a2');
 this.path([[p.x-15*k,p.y-108*k],[p.x-27*k,p.y-93*k],[p.x+27*k,p.y-93*k],[p.x+15*k,p.y-108*k]],'#526d74','#b2b79e');
 for(let i=-2;i<=2;i++)this.line(p.x+i*8*k,p.y-105*k,p.x+i*8*k,p.y-96*k,'#173041',2*k);
 this.rect(p.x-12*k,p.y-67*k,24*k,35*k,'#223d50','#94ab91');this.circle(p.x,p.y-55*k,6*k,color);this.rect(p.x-7*k,p.y-43*k,14*k,5*k,'#beb88e');
 this.text('ALARME',p.x,p.y-143*k,9*k,'#becfbc','center');
 if(v.delay>0)this.text('DÉLAI '+Math.ceil(v.delay)+' s',p.x,p.y-156*k,9*k,color,'center');
 if(v.buzz>0&&!this.reduced){for(let i=1;i<=3;i++){const radius=(i*15+(.28-v.buzz)*38)*k;const ctx=this.ctx;ctx.beginPath();ctx.strokeStyle='#e2bd7377';ctx.lineWidth=1.4*k;ctx.arc(p.x,p.y-105*k,radius,-.6,.6);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y-105*k,radius,Math.PI-.6,Math.PI+.6);ctx.stroke();}}
 if(v.broken){this.line(p.x-16*k,p.y-124*k,p.x+13*k,p.y-96*k,'#bd8b68',3*k);this.text('HORS SERVICE',p.x,p.y-16*k,7*k,'#c19578','center');}
 else if(sim.near(sim.s.player,d,120))this.text('E / ENTRÉE · '+(2-v.uses)+'/2',p.x,p.y-17*k,8*k,color,'center');
};
const base=P.creature;
P.creature=function(e){base.call(this,e);if(e.bash&&e.hp>0){const p=this.project(e.x,e.z),k=this.scale;this.text('FRAPPE IMMINENTE',p.x,p.y-91*k,8*k,'#e1b48d','center');this.rect(p.x-26*k,p.y-84*k,52*k,3*k,'#1b3040');this.rect(p.x-26*k,p.y-84*k,52*k*(1-e.bash.timer/.85),3*k,'#ce9d71');}};
})(globalThis);
