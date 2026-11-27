/* Field readability: exact physical footprints, annex details, encounter cues and aiming ray. */
(function(root){'use strict';const P=root.ROP_Renderer.prototype,D=root.ROP_DATA,X=root.ROP_EXPLORATION;
const oldProp=P.prop;
P.prop=function(p,r,s){
 if(!p.collidable||!p.footprint)return oldProp.call(this,p,r,s);
 const c=p.footprint,k=this.scale,g=this.ctx,v=this.project(p.x,p.z),back=this.project(p.x,p.z-c.d/2),front=this.project(p.x,p.z+c.d/2),half=c.w*k/2;
 const table=['table','bed','bench','cart','lab-bench','pallet'].includes(p.kind),tank=['tank','pump-motor','coil','wheel'].includes(p.kind),tall=['fridge','cupboard','vending','transformer','specimen','arcade'].includes(p.kind);
 const h=(table?43:tall?115:75)*k;
 g.save();if(Math.abs(s.player.x-p.x)<c.w/2+35&&s.player.z<p.z)g.globalAlpha=.35;
 // The bottom contact polygon is the exact footprint used by collision and local plans.
 this.rect(v.x-half-2,back.y-2,half*2+4,front.y-back.y+4,'#405a5744','#a5b68a60');
 if(table){for(const xx of [-half*.85,half*.85]){this.line(v.x+xx,front.y,v.x+xx,front.y-h,'#768b80',4*k);this.circle(v.x+xx,front.y,3*k,'#14252a');}
  this.path([[v.x-half,back.y-h],[v.x+half,back.y-h],[v.x+half,front.y-h],[v.x-half,front.y-h]],p.kind==='bed'?'#92a99a':'#687e70','#a6b8a0');
  this.rect(v.x-half,front.y-h,half*2,7*k,'#3f584f','#839c86');if(p.kind==='bed')this.rect(v.x-half+5*k,back.y-h+3*k,35*k,Math.max(6*k,front.y-back.y-6*k),'#c4cbb2');
 }else if(tank){this.ellipse(v.x,front.y-8*k,half,9*k,'#1b353c');const grad=g.createLinearGradient(v.x-half,0,v.x+half,0);grad.addColorStop(0,'#2d484c');grad.addColorStop(.48,'#8b9e91');grad.addColorStop(1,'#243d46');this.rect(v.x-half,front.y-h,half*2,h-8*k,grad);this.ellipse(v.x,front.y-h,half,Math.max(5*k,(front.y-back.y)/2),'#9aa897');
  this.rect(v.x-half,front.y-h*.67,half*2,5*k,'#19323b');this.rect(v.x-half,front.y-h*.3,half*2,5*k,'#19323b');this.circle(v.x+half*.45,front.y-h*.6,10*k,'#263c42');this.line(v.x+half*.45,front.y-h*.6,v.x+half*.5,front.y-h*.66,'#d0c296',2*k);
 }else{this.rect(v.x-half,back.y-h,half*2,h+front.y-back.y,'#20383e','#879b84');this.rect(v.x-half+6*k,back.y-h+6*k,half*2-12*k,h*.78,'#3d5655','#739180');
  for(let i=0;i<5;i++)this.line(v.x-half+14*k,back.y-h+22*k+i*11*k,v.x+half-14*k,back.y-h+22*k+i*11*k,'#142d35',3*k);
  this.path([[v.x-half,back.y-h],[v.x+half,back.y-h],[v.x+half,front.y-h],[v.x-half,front.y-h]],'#657c6d','#a1ad8b');this.circle(v.x+half-19*k,back.y-h+16*k,3*k,root.ROP_COLONY.isPowered(s,r)?'#abc8a0':'#bda16d');
 }
 this.text(p.kind==='bed'?'MED':p.kind==='table'?'HAB':p.kind==='tank'?'RETOUR':'SERVICE',v.x,front.y-12*k,8*k,'#bac8aa99','center');g.restore();
};
const overlay=P.colonyOverlays;
P.colonyOverlays=function(sim){overlay.call(this,sim);const s=sim.s,r=sim.room,k=this.scale,g=this.ctx;
 for(const e of D.encounters.filter(e=>e.room===s.room)){const v=s.exploration.encounters[e.id];if(v?.stage!=='warning')continue;const p=this.project(e.spawnX,s.mode==='classic'?.7:e.spawnZ),pulse=this.reduced?.6:.5+.5*Math.sin(this.time*6);
  if(e.type==='intrusion'){this.rect(p.x-34*k,p.y-185*k,68*k,125*k,'#0d2129','#94a394');for(let i=0;i<7;i++)this.line(p.x-26*k,p.y-169*k+i*14*k,p.x+26*k,p.y-169*k+i*14*k,'#577470',4*k);this.glow(p.x,p.y-100*k,80*k,`rgba(207,165,99,${.08+pulse*.1})`);this.text('VIBRATIONS',p.x,p.y-199*k,9*k,'#dabd8e','center');}
  else if(e.type==='shadow'){this.rect(p.x-100*k,p.y-152*k,200*k,78*k,'#12232d','#4b6865');g.save();g.globalAlpha=.55;g.beginPath();g.ellipse(p.x-45*k+Math.sin(this.time)*35*k,p.y-117*k,59*k,14*k,-.1,0,Math.PI*2);g.fillStyle='#060e17';g.fill();g.restore();for(let i=0;i<15;i++)this.line(p.x-95*k+i*14*k,p.y-150*k,p.x-95*k+i*14*k,p.y-76*k,'#829483',3*k);}
 }
 if(r.annex){const job=D.jobs.find(j=>j.room===r.id),progress=X.jobStep(s,job.id);const p=this.project(r.width-470,s.mode==='classic'||r.minZ===r.maxZ?.7:.81);if(progress===3){this.text('SERVICE RÉTABLI',p.x,p.y-130*k,9*k,'#aacb9e','center');this.circle(p.x,p.y-112*k,4*k,'#b5d7a5');}}
 if(s.exploration.aiming&&sim.character.weapon&&!s.systems.hiding){const a=s.exploration.aim,origin=this.project(s.player.x,s.player.z),target=this.project(s.player.x+a.x*220,s.player.z+a.z*220/600);g.save();g.setLineDash([4*k,7*k]);this.line(origin.x,origin.y-43*k,target.x,target.y-43*k,'#cde0b448',1*k);g.setLineDash([]);this.line(target.x-7*k,target.y-43*k,target.x+7*k,target.y-43*k,'#d5deb5',1*k);this.line(target.x,target.y-50*k,target.x,target.y-36*k,'#d5deb5',1*k);g.restore();}
};
})(globalThis);
