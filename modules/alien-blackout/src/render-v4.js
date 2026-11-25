/* Surveillance overlays and the final continuous side-view. No promotional art. */
(()=>{'use strict';
 const base=BO_RENDER.drawScene,D=BO_DATA,R=BO.rooms;
 const text=(c,s,x,y,size=13,col='#cfddd0')=>{c.fillStyle=col;c.font=`${size}px ui-monospace,monospace`;c.fillText(s,x,y);};
 function escapeScene(canvas,e,options={}){
  const c=canvas.getContext('2d'),s=e.v4.escape,cam=Math.max(0,Math.min(D.escape.length-1000,s.x-315));
  c.clearRect(0,0,1000,560);const bg=c.createLinearGradient(0,0,0,560);bg.addColorStop(0,'#051016');bg.addColorStop(1,'#233b3c');c.fillStyle=bg;c.fillRect(0,0,1000,560);
  c.save();c.translate(-cam,0);
  c.fillStyle='#0e262d';c.fillRect(0,130,D.escape.length,325);
  for(let x=0;x<D.escape.length;x+=150){c.fillStyle='#284047';c.fillRect(x,115,15,350);c.fillStyle='#3b5a5e';c.fillRect(x+15,140,4,302);c.fillStyle='#0a1b20';c.fillRect(x+30,176,93,96);c.strokeStyle='#3e6065';c.strokeRect(x+30,176,93,96);for(let y=188;y<260;y+=12){c.fillStyle='#20404a';c.fillRect(x+41,y,72,3);}c.fillStyle='#91b6a4';c.fillRect(x+48,146,67,4);text(c,String(Math.floor(x/150)+1).padStart(2,'0'),x+36,304,10,'#71998f');}
  c.fillStyle='#3a5352';c.fillRect(0,453,D.escape.length,13);c.fillStyle='#112b32';c.fillRect(0,466,D.escape.length,94);
  for(let x=0;x<D.escape.length;x+=25){c.strokeStyle='#547472';c.beginPath();c.moveTo(x,469);c.lineTo(x-45,547);c.stroke();}
  for(let y=82;y<125;y+=14){c.fillStyle='#486162';c.fillRect(0,y,D.escape.length,7);}
  for(const [i,g]of D.escape.gates.entries()){
   const relocked=s.x>g.x+60&&s.enemyGates[i]<2,open=s.gates[i]>=g.seconds&&!relocked,h=open?35:300;c.fillStyle='#718079';c.fillRect(g.x-12,151,26,h);c.fillStyle='#1b343b';c.fillRect(g.x-7,155,16,h-7);
   c.strokeStyle='#bfaa73';c.lineWidth=4;c.beginPath();c.arc(g.x-54,360,18,0,Math.PI*2);c.stroke();
   const a=(s.gates[i]/g.seconds)*Math.PI*5;c.beginPath();c.moveTo(g.x-54+Math.cos(a)*15,360+Math.sin(a)*15);c.lineTo(g.x-54-Math.cos(a)*15,360-Math.sin(a)*15);c.stroke();
   text(c,g.label,g.x-82,327,11);c.fillStyle='#081b20';c.fillRect(g.x-95,290,80,7);c.fillStyle='#b8c788';c.fillRect(g.x-95,290,80*s.gates[i]/g.seconds,7);
   if(s.gates[i]<g.seconds)text(c,'MAINTENIR E',g.x-110,492,12,'#e4c491');else if(relocked)text(c,'RETARD AUTOMATIQUE',g.x-104,492,10,'#e4c491');
  }
  const fx=D.escape.fan.x;c.fillStyle='#0a1a20';c.fillRect(fx-34,165,72,287);c.strokeStyle='#749193';c.lineWidth=7;c.beginPath();c.arc(fx,330,81,0,Math.PI*2);c.stroke();c.save();c.translate(fx,330);c.rotate(e.fanActive?s.elapsed*6:0);for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillStyle=e.fanActive?'#98a7a0':'#466866';c.fillRect(-10,0,20,68);}c.restore();text(c,e.fanActive?'ROTATION / ATTENDRE':'COUPURE / PASSAGE',fx-100,215,12,e.fanActive?'#e0ab80':'#b5d5a0');
  c.fillStyle='#88a99b';c.fillRect(D.escape.exit-4,145,16,310);c.fillStyle='#bed8bd';c.fillRect(D.escape.exit+12,145,60,310);text(c,'HALDIN / SAS',D.escape.exit-97,122,16,'#e1e5c1');
  BO_RENDER.human(c,{id:'amanda',name:'Amanda',alive:true,x:s.x,y:450,color:'#cab891',hidden:false,goal:null,work:false,action:'manual',walk:s.x*.06},1.2,true);
  BO_RENDER.alien(c,{x:s.enemyX,y:450,walk:s.elapsed*4},1.45);
  c.restore();
  c.fillStyle='#06131bee';c.fillRect(0,0,1000,70);text(c,'AMANDA RIPLEY / RETOUR AU HALDIN',24,30,17);text(c,'CONDUIT DE MAINTENANCE · TRAVERSÉE CONTINUE',24,52,10,'#86aaa0');
  text(c,Math.ceil(s.left)+' s',877,38,28,'#e1c790');
  c.fillStyle='#07161fea';c.fillRect(0,512,1000,48);const idx=e.nearbyCrank;
  text(c,idx>=0?'MANIVELLE À PORTÉE / ARRÊTEZ-VOUS ET MAINTENEZ E':'← → / A D / Q D : avancer     E : manivelle     P : pause',24,543,13,'#d3d5b1');
  const gap=Math.max(0,s.x-s.enemyX);text(c,gap<190?'CHOCS TOUT PRÈS':'BRUITS DERRIÈRE',775,543,12,gap<190?'#f1ab82':'#91b4a3');
  if(options.inspection){c.fillStyle='#3f2b20e0';c.fillRect(290,74,420,24);text(c,'INSPECTION PRÉPARÉE / HORS PROGRESSION',320,91,12,'#edcb8d');}
 }
 BO_RENDER.drawScene=(canvas,e,options={})=>{
  if(e.escapeActive||e.v4?.escape.phase==='failed'||e.v4?.escape.phase==='complete'){escapeScene(canvas,e,options);return;}
  if(!options.refuge&&e.v4&&!e.cameraAvailable()){
   const proxy=Object.create(e);proxy.brokenCamera=e.camera;base(canvas,proxy,options);const c=canvas.getContext('2d');
   const msg=e.v4.cameraDelay>0?'ACCORD VIDÉO / '+e.v4.cameraDelay.toFixed(1)+' s':e.isSignalLost(e.camera)?'RELAIS BROUILLÉ / MAINTENANCE LOCALE':'FLUX INDISPONIBLE';
   c.fillStyle='#092029';c.fillRect(190,246,620,62);text(c,msg,232,282,18,'#c9ceae');return;
  }
  base(canvas,e,options);
  if(e.v4&&e.incidentActive&&e.incident.kind==='steam'&&e.camera===e.incident.room&&!options.refuge){const c=canvas.getContext('2d');
   for(let i=0;i<10;i++){const x=(i*130+e.t*20)%1100-50,y=425-Math.sin(i+e.t*.4)*50,gr=c.createRadialGradient(x,y,5,x,y,140);gr.addColorStop(0,'#c2d5c32b');gr.addColorStop(1,'#c2d5c300');c.fillStyle=gr;c.fillRect(x-150,y-150,300,260);}
   text(c,'VAPEUR / DÉPLACEMENTS ET TRAVAUX RALENTIS',30,85,13,'#e2caa4');
  }
 };
 BO_RENDER.escapeScene=escapeScene;
})();
