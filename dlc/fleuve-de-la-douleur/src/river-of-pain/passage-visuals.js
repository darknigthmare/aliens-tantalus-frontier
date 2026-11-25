/* Draws the actual bounded connector state; no image substitutes for gameplay. */
(function(root){'use strict';
const R=root.ROP_Renderer.prototype,P=root.ROP_PASSAGES,C=root.ROP_CORE;
const oldRender=R.render;
R.connectorActor=function(x,y,id,walk=0,facing=1,stowed=false){const project=this.project;this.project=()=>({x,y});try{this.person({x:0,z:.7,facing,walk,stowed},id,true,1.02);}finally{this.project=project;}};
R.render=function(sim,dt){oldRender.call(this,sim,dt);this.thresholdView(sim);};
R.thresholdView=function(sim){
 const s=sim.s,a=s.passages,g=this.ctx,W=this.w,H=this.h,k=this.scale;
 if(!a)return;
 // Active listening remains in the exposed world, with a diegetic ring at the threshold.
 const q=a.listening;if(q){const portal=sim.room.portals.find(p=>p.to===q.to),p=this.project(portal.x,s.mode==='classic'?.7:portal.z);
  g.save();g.strokeStyle='#b7d4bd';g.lineWidth=2*k;g.beginPath();g.arc(p.x,p.y-82*k,31*k,-Math.PI/2,-Math.PI/2+Math.PI*2*q.timer/1.6);g.stroke();this.text('ÉCOUTE',p.x,p.y-128*k,10*k,'#d6dec2','center');g.restore();}
 const t=a.transit;
 if(!t){
  const near=sim.candidates().find(c=>c.type==='portal');if(near){const q=P.latest(s,near.ref);if(q&&s.elapsed-q.when<35){const p=this.project(near.ref.x,s.mode==='classic'?.7:near.ref.z);this.text(q.level==='danger'?'MOUVEMENT RAPIDE':q.level==='movement'?'MOUVEMENT PERÇU':'RELEVÉ SANS CERTITUDE',p.x,p.y-153*k,9*k,q.level==='danger'?'#d7a27c':'#b4cbb4','center');}}
  return;
 }
 if(t.stage==='boarding'){
  const p=this.project(s.player.x,s.player.z),d=P.config(sim.room.portals.find(p=>p.id===t.portalId)),progress=t.timer/d.boarding;
  this.rect(p.x-40*k,p.y+13*k,80*k,4*k,'#152b31');this.rect(p.x-40*k,p.y+13*k,80*k*progress,4*k,'#c3cda0');return;
 }
 const rope=C.roomDef(t.from).portals.find(p=>p.id===t.portalId)?.kind==='corde';
 const u=Math.min(1,t.timer/t.duration),drawU=this.reduced?.5:u,from=C.roomDef(t.from),to=C.roomDef(t.to),ascending=to.floor>from.floor;
 const left=W*.17,right=W*.83,top=H*.21,bottom=H*.88;
 g.save();this.rect(0,0,W,H,'#050f16');
 const bg=g.createLinearGradient(left,top,right,bottom);bg.addColorStop(0,'#22383e');bg.addColorStop(1,'#0c1d27');this.rect(left-40*k,top-26*k,right-left+80*k,bottom-top+38*k,bg,'#586e68');
 for(let x=left-30*k;x<right+40*k;x+=72*k){this.line(x,top-26*k,x,bottom+10*k,'#36504e',1*k);for(let y=top;y<bottom;y+=80*k)this.circle(x+10*k,y,2*k,'#7d8e7c');}
 this.text(rope?'RACCORDEMENT À LA CORDE':t.type==='lift'?'PUITS DE MANUTENTION':t.type==='stairs'?'CIRCULATION VERTICALE':t.type==='ladder'?'ACCÈS TECHNIQUE':'CHAMBRE DE TRANSFERT',W*.5,top+6*k,14*k,'#c9d2b3','center');
 this.text('NIVEAU '+from.floor+'  →  NIVEAU '+to.floor,W*.5,top+31*k,11*k,'#8fb4aa','center');
 const floorY=bottom-50*k,cx=W*.5;
 if(t.type==='lift'){
  const cw=Math.min(390*k,(right-left)*.7),ch=260*k;
  for(const x of[cx-cw*.66,cx+cw*.66]){this.rect(x-7*k,top+54*k,14*k,bottom-top-80*k,'#101c24','#77928b');this.line(x,top+54*k,x,bottom-26*k,'#bac1a1',2*k);}
  const shift=(drawU*170*k)*(ascending?1:-1);for(let n=-3;n<6;n++){const y=top+n*130*k+shift;g.save();g.beginPath();g.rect(left,top+60*k,right-left,bottom-top-80*k);g.clip();this.rect(left,y,right-left,12*k,'#425b59','#7b8a77');this.text('GUIDAGE · '+String(Math.abs(n)+1).padStart(2,'0'),right-12*k,y-8*k,8*k,'#6f8b80','right');g.restore();}
  const cy=H*.70+(ascending?-1:1)*(drawU-.5)*34*k;
  for(const x of[cx-cw*.42,cx+cw*.42])this.line(x,top+52*k,x,cy-ch,'#9ba799',3*k);
  this.rect(cx-cw/2,cy-ch,cw,ch,'#192e39','#99a891');
  for(let x=cx-cw/2+10*k;x<cx+cw/2;x+=30*k)this.line(x,cy-ch+8*k,x,cy-16*k,'#3a5256',1*k);
  this.rect(cx-cw/2,cy-17*k,cw,17*k,'#526e6b','#9cac8c');
  this.rect(cx-cw/2,cy-ch,cw,14*k,'#6a8580');this.glow(cx,cy-ch+25*k,90*k,t.emergency?'#c8a05640':'#98c4a440');
  this.connectorActor(cx,cy-17*k,s.character,this.reduced?0:drawU*5);
  if(s.escort)this.connectorActor(cx-85*k,cy-17*k,s.escort.name==='Luisa'?'luisa':'civilian',0);
  for(let i=0;i<8;i++)this.line(cx-cw/2+i*cw/8,cy-10*k,cx-cw/2+i*cw/8+15*k,cy,'#cbba74',4*k);
  this.text(t.emergency?'ENTRAÎNEMENT DE SECOURS':'TREUIL EN MOUVEMENT',cx,cy+26*k,10*k,t.emergency?'#d2bb82':'#aac8ac','center');
 }else if(t.type==='stairs'){
  const x1=left+45*k,x2=right-50*k,y1=ascending?floorY:floorY-185*k,y2=ascending?floorY-185*k:floorY,steps=12,dx=(x2-x1)/steps,dy=(y2-y1)/steps;
  for(let i=0;i<steps;i++){const x=x1+i*dx,y=y1+i*dy;this.rect(x,y,dx+2*k,13*k,'#5d7773','#98a98d');this.line(x,y+13*k,x,y+38*k,'#1c323b',5*k);}
  this.line(x1-10*k,y1-95*k,x2+20*k,y2-95*k,'#a1b2a0',4*k);for(let i=0;i<=4;i++){const u=i/4,x=x1+(x2-x1)*u,y=y1+(y2-y1)*u;this.line(x,y-95*k,x,y,'#718b82',3*k);}
  this.connectorActor(x1+(x2-x1)*drawU,y1+(y2-y1)*drawU,s.character,this.reduced?0:u*26);
  if(s.escort){const v=Math.max(0,drawU-.12);this.connectorActor(x1+(x2-x1)*v,y1+(y2-y1)*v,s.escort.name==='Luisa'?'luisa':'civilian',this.reduced?0:u*26);}
 }else if(rope){
  // Curved hull, anchored rope, no colonial steel ladder inside the derelict.
  this.rect(left-39*k,top+46*k,right-left+78*k,bottom-top-72*k,'#182b29');
  for(let n=0;n<9;n++)this.path([[left+n*15*k,bottom-30*k],[left+n*9*k,top+100*k],[right-n*18*k,top+55*k]],null,n%2?'#5a6e51':'#304837',9*k);
  const y1=floorY,y2=top+180*k;
  this.line(cx,top+65*k,cx,y1+4*k,'#c1ad7e',4*k);
  this.circle(cx,top+75*k,9*k,null,'#d2be91',3*k);
  for(let y=top+105*k;y<y1;y+=34*k)this.circle(cx,y,3*k,'#b8a778');
  this.connectorActor(cx,ascending?y1+(y2-y1)*drawU:y2+(y1-y2)*drawU,s.character,this.reduced?0:u*25,1,true);
  this.path([[cx+36*k,y2-84*k],[right-25*k,y2-90*k],[right-25*k,y2-64*k],[cx+36*k,y2-65*k]],'#496048','#9ba68c');
 }else if(t.type==='ladder'){
  const y1=floorY,y2=top+175*k;for(const x of[cx-35*k,cx+35*k])this.rect(x-5*k,y2-45*k,10*k,y1-y2+62*k,'#89a398','#bdc9aa');
  for(let y=y1;y>y2-40*k;y-=25*k)this.line(cx-35*k,y,cx+35*k,y,'#91a999',5*k);
  this.connectorActor(cx,ascending?y1+(y2-y1)*drawU:y2+(y1-y2)*drawU,s.character,this.reduced?0:u*25,1,true);
  this.rect(left+40*k,y1+7*k,cx-left-70*k,16*k,'#526d67');this.rect(cx+40*k,y2-80*k,right-cx-65*k,16*k,'#526d67');
 }else{
  const wide=Math.min(390*k,(right-left)*.75),cy=floorY;
  this.rect(cx-wide/2-25*k,cy-260*k,wide+50*k,280*k,'#273d42','#839d8f');this.rect(cx-wide/2,cy-240*k,wide,242*k,'#091e29','#688f83');
  this.connectorActor(cx,cy,s.character,0);if(s.escort)this.connectorActor(cx-75*k,cy,s.escort.name==='Luisa'?'luisa':'civilian',0);
  const shutter=(1-Math.abs(drawU*2-1))*wide*.49;
  for(const sign of[-1,1])this.rect(sign===-1?cx-wide/2:cx+wide/2-shutter,cy-240*k,shutter,242*k,'#3c5559','#8da798');
  this.text('CYCLE INTERVERROUILLÉ',cx,cy-258*k,10*k,'#c4c79c','center');
 }
 this.rect(left,bottom-9*k,right-left,3*k,'#314b4b');this.rect(left,bottom-9*k,(right-left)*u,3*k,'#b9c899');
 const label=to.name.length>37?to.name.slice(0,35)+'…':to.name;this.text(label,W*.5,bottom+20*k,13*k,'#d6dcb9','center');g.restore();
};
})(globalThis);
