/* Local settlement entities, rendered in the same depth-sorted actor pass. */
(function(root){'use strict';
const P=root.ROP_Renderer.prototype,L=root.ROP_LIFE,D=root.ROP_DATA;
P.lifeDraws=function(sim,draw){
 const s=sim.s;
 for(const {def,body} of L.visibleResidents(sim))draw.push({z:body.z+.001,run:()=>this.resident(body,def,sim)});
 for(const def of D.life.containers.filter(d=>d.room===s.room)){
  const body=L.effective(s,def);draw.push({z:body.z,run:()=>this.supplyContainer(body,L.containerState(s,def),sim)});
 }
 for(const def of D.life.benches.filter(d=>d.room===s.room)){
  const body=L.effective(s,def);draw.push({z:body.z-.001,run:()=>this.workbench(body,sim)});
 }
 for(const d of [...s.life.debris,...s.life.devices].filter(d=>d.room===s.room)){
  const body=L.effective(s,d);draw.push({z:body.z,run:()=>this.soundDevice(body)});
 }
};
P.resident=function(b,def,sim){
 const near=root.ROP_CORE.dist(b,sim.s.player)<250,k=this.scale,p=this.project(b.x,b.z);
 const waiting=b.wait>0||Math.abs(b.x-sim.s.player.x)<160;
 const cowering=b.alarm>0&&Math.abs(b.x-def.refuge.x)<18;
 this.person({...b,walk:waiting?0:b.walk,appearance:def,crouch:cowering},'anne');
 const g=this.ctx;g.save();g.translate(p.x,p.y);g.scale(k*(.82+b.z*.28),k*(.82+b.z*.28));
 g.scale(b.facing,1);const y=-def.height*(cowering?.38:.55);
 if(def.tool==='tablet'){this.rect(10,y-14,25,24,'#17323b','#8cafa4');this.rect(13,y-11,18,16,'#90b2a3');for(let i=0;i<3;i++)this.line(15,y-7+i*4,27,y-7+i*4,'#335b62',1);}
 if(def.tool==='tools'){this.line(18,y,31,y-17,'#a6b4ab',5);this.circle(33,y-19,6,'#a6b4ab');this.circle(34,y-20,3,'#26444b');}
 if(def.tool==='mug'){this.rect(15,y-6,13,18,'#afbdaf','#485e56');this.circle(28,y+3,5,'#bcc9bc');this.circle(28,y+3,3,'#28454a');}
 if(def.tool==='linen'){for(let i=0;i<3;i++)this.rect(9,y-5-i*7,30,6,'#c5c7ac','#889e8b');}
 g.restore();
 if(near){this.text(def.name,p.x,p.y-(def.height+30)*k,12*k,'#d2dccc','center');this.text(b.alarm>0?'CHERCHE UN ABRI':'E / P · ÉCHANGER',p.x,p.y-(def.height+14)*k,8.5*k,b.alarm>0?'#d6aa7b':'#91bbb0','center');}
};
P.supplyContainer=function(d,state,sim){
 const p=this.project(d.x,d.z),k=this.scale,g=this.ctx,empty=Object.values(state.remaining).every(n=>n===0),near=sim.near(sim.s.player,d,170);
 const tall=d.kind==='locker',h=tall?111:d.kind==='drawer'?68:45,w=tall?54:76;
 g.save();g.translate(p.x,p.y);g.scale(k,k);
 this.ellipse(0,3,w*.7,8,'#020d1488');
 this.path([[-w/2,-h],[w/2,-h],[w/2+10,-h-10],[-w/2+10,-h-10]],'#607d78','#94a79b');
 this.rect(-w/2,-h,w,h,'#2f5053','#9aaf98');
 this.rect(-w/2+6,-h+7,w-12,h-13,'#132e39','#496d70');
 if(tall){
  if(state.open){this.path([[w/2,-h],[w/2+27,-h-7],[w/2+27,-7],[w/2,0]],'#5c7773','#adba9e');this.line(-w/2+4,-h*.45,w/2-5,-h*.45,'#76968b',2);}
  else{this.rect(-w/2+4,-h+4,w-8,h-8,'#526e68','#8aa896');this.rect(w/2-15,-h*.53,4,16,'#c4c8a5');for(let i=0;i<4;i++)this.line(-w/2+12,-h+16+i*8,w/2-12,-h+16+i*8,'#253f47',2);}
 }else if(state.open){
  this.path([[-w/2,-h],[w/2,-h],[w/2+2,-h-38],[-w/2+7,-h-46]],'#4c706c','#b0b99f');
  this.path([[-w/2+7,-h-5],[w/2-5,-h-5],[w/2-4,-h-31],[-w/2+12,-h-37]],'#1b3941','#729b90');
  if(d.kind==='drawer')this.rect(-w/2-7,-h+14,w+3,22,'#718984','#b4c0a5');
 }else{this.rect(-w/2-2,-h-3,w+4,11,'#6d8c7d','#acb998');this.rect(-8,-h+4,16,10,'#bcb788','#374f51');}
 if(d.kind==='medical'){this.rect(-3,-29,6,18,'#c6d3bd');this.rect(-9,-23,18,6,'#c6d3bd');}
 if(state.open&&!empty){let i=0;for(const [key,n] of Object.entries(state.remaining)){if(!n)continue;this.rect(-w/2+12+i*16,-h+17,10,14,key==='cell'?'#c1b688':key==='medkit'?'#a9c0a1':'#748a91','#c7d0b0');i++;}}
 this.rect(-w/2+4,-14,w-8,8,empty?'#455f5d':'#93ab85');
 this.text(state.open?(empty?'VIDE':'OUVERT'):'SERVICE',0,-7,6.5,empty?'#9bad98':'#183d3c','center');
 if(near)this.text(state.open?(empty?'RÉSERVE ÉPUISÉE':'E · CONSULTER'):'E · OUVRIR',0,-h-(state.open&&!tall?58:26),9,'#cfdbc2','center');
 this.line(-30,8,30,8,'#9cb89966',2);g.restore();
};
P.workbench=function(d,sim){
 const p=this.project(d.x,d.z),k=this.scale,g=this.ctx;g.save();g.translate(p.x,p.y);g.scale(k,k);
 this.rect(-58,-85,118,64,'#203f46','#6e938b');for(let i=0;i<6;i++)this.line(-50+i*20,-82,-50+i*20,-35,'#517774',1);
 this.line(-50,0,-50,-56,'#8ba58f',6);this.line(50,0,50,-56,'#8ba58f',6);
 this.rect(-64,-58,128,8,'#a0ac98','#c2c7a3');this.rect(-43,-47,72,35,'#3a605b','#709287');
 this.rect(-49,-76,25,16,'#173542','#8bbaaa');this.circle(-36,-70,3,'#cce1b3');
 this.rect(17,-70,29,12,'#395858','#c3c299');this.line(21,-75,31,-81,'#a8bba8',3);
 this.line(45,-86,58,-104,'#788e81',3);this.rect(48,-106,24,6,'#bcc8a2');this.glow(49,-66,49,'#cde5bb19');
 this.text('MAINTENANCE',-2,-93,8,'#b4c4a9','center');
 if(sim.near(sim.s.player,d,170))this.text('E · ÉTABLI',0,-120,9,'#d2dfc0','center');
 g.restore();
};
P.soundDevice=function(d){
 const p=this.project(d.x,d.z),k=this.scale,g=this.ctx;g.save();g.translate(p.x,p.y);g.scale(k,k);
 this.ellipse(0,3,19,4,'#010c1288');
 const broken=d.reason,active=d.delay===0&&!broken;
 this.rect(-13,-20,26,19,broken?'#3f5252':'#566e67','#98b89e');this.rect(-9,-15,11,9,'#183c43');
 this.line(8,-18,broken?21:9,broken?-24:-42,'#8eac99',2);
 this.circle(6,-9,2,broken?'#4d665d':active?'#b3e4cd':'#d7b380');
 if(!broken){this.text(d.delay>0?Math.ceil(d.delay)+'s':'BIP',0,-49,8,active?'#c0dfc7':'#dabf8e','center');
 if(active&&(d.buzz>0||this.reduced)){g.strokeStyle='#9cddbd77';g.lineWidth=1.5;g.beginPath();g.ellipse(0,1,this.reduced?29:22+d.buzz*70,8,0,0,Math.PI*2);g.stroke();}}
 g.restore();
};
})(globalThis);
