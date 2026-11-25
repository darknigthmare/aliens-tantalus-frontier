/* All medical and beacon icons refer to known crew orders, never hidden enemies. */
(()=>{'use strict';const scene=BO_RENDER.drawScene,map=BO_RENDER.drawMap;
 BO_RENDER.drawScene=function(canvas,e,options={}){const result=scene(canvas,e,options);if(!e.v6||options.refuge||e.escapeActive||!e.cameraAvailable())return result;
  const ctx=canvas.getContext('2d');ctx.save();
  for(const [i,p]of e.v6.plans.entries())if(p&&p.room===e.camera){const pt=e.carePoint(p.room,i);ctx.strokeStyle='#92d1b1';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.strokeRect(pt.x-30,pt.y-8,60,13);ctx.setLineDash([]);ctx.fillStyle='#92d1b1';ctx.fillRect(pt.x-3,pt.y-16,6,14);ctx.fillRect(pt.x-7,pt.y-12,14,6);ctx.font='10px ui-monospace,monospace';ctx.fillText('POINT DE SOINS',Math.min(840,pt.x+39),pt.y-4);}
  for(const b of e.v6.beacons)if(b.room===e.camera){const active=b.wait<=0&&b.life>0;ctx.fillStyle='#152c35';ctx.strokeStyle=b.life<=0?'#6a7c7c':active?'#e1b875':'#9ebce0';ctx.lineWidth=2;
   ctx.fillRect(b.x-9,b.y-16,18,14);ctx.strokeRect(b.x-9,b.y-16,18,14);ctx.beginPath();ctx.moveTo(b.x,b.y-16);ctx.lineTo(b.x,b.y-30);ctx.stroke();
   if(active){ctx.globalAlpha=.35+.3*Math.sin(e.t*5);ctx.beginPath();ctx.ellipse(b.x,b.y-7,24+(e.t%2)*12,12+(e.t%2)*5,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
   ctx.fillStyle='#081a22e8';ctx.fillRect(b.x-65,b.y-60,130,23);ctx.fillStyle=b.life<=0?'#9aaaae':'#ecd39c';ctx.font='11px ui-monospace,monospace';ctx.fillText(b.life<=0?'BALISE ÉPUISÉE':b.wait>0?'BALISE · '+Math.ceil(b.wait)+' s':'ÉMISSION · '+Math.ceil(b.life)+' s',b.x-59,b.y-44);
  }ctx.restore();return result;
 };
 BO_RENDER.drawMap=function(canvas,e){const result=map(canvas,e);if(!e.v6||e.escapeActive)return result;const ctx=canvas.getContext('2d');ctx.save();ctx.font='bold 13px ui-monospace,monospace';
  for(const room of e.v6.avoid){const [x,y]=result.center(room);ctx.strokeStyle='#dcb375';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+24,y-17);ctx.lineTo(x+33,y-8);ctx.moveTo(x+33,y-17);ctx.lineTo(x+24,y-8);ctx.stroke();}
  for(const b of e.v6.beacons)if(b.life>0){const [x,y]=result.center(b.room);ctx.fillStyle=b.wait>0?'#9bb9d5':'#edbd71';ctx.fillText('♪',x-31,y-10);}
  ctx.restore();return result;
 };
})();
