/* Local medical and search feedback, only on an available camera. */
(()=>{'use strict';const base=BO_RENDER.drawScene;
BO_RENDER.drawScene=function(canvas,e,options={}){const result=base(canvas,e,options);if(options.refuge||e.escapeActive||!e.v5||!e.cameraAvailable())return result;
 const ctx=canvas.getContext('2d');ctx.save();ctx.font='11px ui-monospace,monospace';
 const box=(x,y,w,label,color='#ecd5a3')=>{ctx.fillStyle='#091b20ee';ctx.fillRect(x,y,w,23);ctx.fillStyle=color;ctx.fillText(label,x+6,y+15);};
 for(const h of Object.values(e.v5.hunters)){const k=h.check;if(!k||k.room!==e.camera)continue;const [x,y]=BO.rooms.get(k.room).hide[k.slot];ctx.strokeStyle='#e5b773';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.strokeRect(x-24,y-90,48,96);ctx.setLineDash([]);box(x-62,y-119,124,k.progress>0?'FOUILLE '+k.progress.toFixed(1)+' / 4,5':'APPROCHE CASIER');ctx.fillStyle='#dfb477';ctx.fillRect(x-57,y-98,114*Math.min(1,k.progress/4.5),3);}
 for(const c of e.crew){if(!c.alive||c.room!==e.camera)continue;const m=e.v5.members[c.id];if(m.down)box(c.x-39,c.y-63,78,Math.ceil(m.left)+' s · SECOURS');if(m.aid?.progress>0)box(c.x-66,c.y-102,132,(m.aid.kind==='carry'?'LEVAGE ':'SECOURS ')+m.aid.progress.toFixed(1)+' s');}
 ctx.restore();return result;};
})();
