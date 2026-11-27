/* Separate maintenance-mouth render pass. Diagnostic animation uses real queue state. */
(function(root){'use strict';
const R=root.ROP_Renderer.prototype,V=root.ROP_DUCTS,D=root.ROP_DATA;
R.ductDraws=function(sim,draw){for(const d of D.ducts.mouths)if(d.room===sim.s.room)draw.push({z:d.z-.015,run:()=>this.ductMouth(d,sim)});};
R.ductMouth=function(d,sim){
 const g=this.ctx,k=this.scale,p=this.project(d.x,d.z),v=sim.s.ducts.mouths[d.id],t=V.incoming(sim.s,d.id);
 const warning=t&&t.remaining===0&&t.announced,shake=warning&&!this.reduced?Math.sin(this.time*14)*1.2*k:0;
 const x=p.x+shake,y=p.y,w=98*k,h=d.height*k,closed=v.state==='closed',broken=v.state==='broken';g.save();
 // Anchored on a service riser; foot is not an extra invisible collision box.
 this.ellipse(x,y+2*k,70*k,12*k,'#020c1099');
 this.path([[x-56*k,y],[x-56*k,y-h-21*k],[x-35*k,y-h-47*k],[x+39*k,y-h-47*k],[x+57*k,y-h-20*k],[x+57*k,y]],'#1d343d','#5c7c7b',1.3*k);
 this.rect(x-w/2-7*k,y-h-6*k,w+14*k,h+6*k,'#314c55','#a0b3a2');
 this.rect(x-w/2,y-h,w,h-10*k,'#030c13','#587975');
 for(let i=0;i<4;i++)this.rect(x-w/2+(10+i*7)*k,y-h+(9+i*5)*k,w-(20+i*14)*k,h-(28+i*10)*k,null,'#436067'+(i?'66':'aa'));
 if(!closed&&!broken){
  // Grille folded upward, aperture itself remains visible.
  this.path([[x-w/2,y-h],[x+w/2,y-h],[x+w*.58,y-h-20*k],[x-w*.42,y-h-20*k]],'#657d79','#b0b69a',k);
  for(let i=0;i<5;i++)this.line(x-w/2+9*k,y-h-i*4*k,x+w/2+5*k,y-h-i*4*k,'#172e3c',k);
 }else if(closed){
  for(let yy=10;yy<d.height-12;yy+=11)this.rect(x-w/2+4*k,y-h+yy*k,w-8*k,5*k,'#69837f','#243c47');
  this.line(x-27*k,y-h+12*k,x-27*k,y-17*k,'#a1afa1',3*k);this.line(x+27*k,y-h+12*k,x+27*k,y-17*k,'#a1afa1',3*k);
  this.rect(x-38*k,y-h*.54,76*k,11*k,'#b5a56e','#e2c687');
  this.rect(x-10*k,y-h*.57,20*k,21*k,'#526670','#c9c48a');
  if(v.hp<100)for(let i=0;i<Math.ceil((100-v.hp)/28);i++)this.line(x-31*k,y-h+(27+i*23)*k,x+34*k,y-h+(37+i*23)*k,'#e7ad7e',2*k);
 }else{
  for(let i=0;i<5;i++)this.path([[x-w/2+i*19*k,y-5*k],[x-w/2+(i*19+24)*k,y+6*k],[x-w/2+(i*19+9)*k,y-15*k]],'#758580','#b2af90',k);
 }
 this.rect(x-48*k,y-h-40*k,96*k,18*k,'#213d48','#839d95');this.text(d.code+'  /  AIR',x,y-h-27*k,10*k,'#d4dbba','center');
 const color=warning?'#e9b57b':closed?'#ccac71':'#86bdb2';this.circle(x+40*k,y-24*k,4*k,color);
 if(Math.abs(sim.s.player.x-d.x)<450){this.text(closed?'VERROUILLÉE '+Math.ceil(v.hp)+' %':broken?'GRILLE ARRACHÉE':'RETOUR D’AIR',x,y+24*k,9*k,color,'center');if(V.near(sim,d))this.text('4 · EXAMINER',x,y+38*k,8*k,'#e0d7ab','center');}
 if(warning){
  const top=y-h-67*k;this.rect(x-99*k,top-13*k,198*k,23*k,'#172630ee','#a78060');
  this.text(closed?'COUPS DANS LA GAINE':'SORTIE EN MOUVEMENT',x,top+2*k,9.5*k,'#efc29a','center');
  if(!closed){this.rect(x-43*k,top+16*k,86*k,4*k,'#213b42');this.rect(x-43*k,top+16*k,86*k*(1-t.warning/V.rules.warningDuration),4*k,'#d9b083');}
  if(!this.reduced)for(let i=0;i<7;i++){const age=(this.time*.55+i*.143)%1;this.circle(x+(i-3)*14*k,y-h+age*105*k,1.2*k,'#ccbc9766');}
 }
 g.restore();
};
const base=R.creature;
R.creature=function(e){
 if(e.ductEntry?.stage==='entering'){this.ctx.save();this.ctx.globalAlpha=.25+.75*(e.ductEntry.remaining/V.rules.entryDuration);base.call(this,e);this.ctx.restore();const p=this.project(e.x,e.z);this.text('DANS LA GAINE',p.x,p.y-94*this.scale,8*this.scale,'#a7c3b7','center');}
 else base.call(this,e);
};
})(globalThis);
