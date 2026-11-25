
/* v0.5 scenery is drawn from the same geometry used by footsteps and devices.
 * No image screenshot is used as a level background; every utility is a separate SVG.
 */
(function(G){'use strict';const Base=G.AVP_RENDERER,D=G.AVP_DATA,C=G.AVP_CORE,TAU=Math.PI*2;
const polygon=(c,points,fill,stroke)=>{c.beginPath();c.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))c.lineTo(p.x,p.y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}};
class TerrainRenderer extends Base{
 background(room,time){
  super.background(room,time);const c=this.ctx,g=this.currentGame;
  for(const z of D.terrainZones.filter(z=>z.room===room.id)){
   const pts=[[z.x,z.y],[z.x+z.w,z.y],[z.x+z.w,z.y+z.h],[z.x,z.y+z.h]].map(([x,y])=>this.point(x,y));
   const fills={metal:'#1b343dd9',water:'#51889965',shards:'#857d6040',resin:'#273c355f',snow:'#c8d7d033'};
   c.save();polygon(c,pts,fills[z.material],z.material==='metal'?'#93a8a488':null);c.clip();
   if(z.material==='metal'){
    for(let x=z.x;x<z.x+z.w;x+=19){const a=this.point(x,z.y),b=this.point(x,z.y+z.h);this.line(a.x,a.y,b.x,b.y,'#adc0b948',2*this.zoom);}
    for(let y=z.y+10;y<z.y+z.h;y+=14){const a=this.point(z.x,y),b=this.point(z.x+z.w,y);this.line(a.x,a.y,b.x,b.y,'#96afac50',1.5*this.zoom);}
    for(const p of pts)this.ellipse(p.x,p.y,3*this.zoom,1.7*this.zoom,'#d2d2b899');
   }else if(z.material==='water'){
    const t=this.reduced?0:time;for(let i=0;i<18;i++){const x=z.x+((i*67+t*13)%z.w),y=z.y+((i*29)%z.h),a=this.point(x,y);this.ellipse(a.x,a.y,(14+(i%3)*12)*this.zoom,1.3*this.zoom,'#b4d8d74a');}
   }else if(z.material==='shards'){
    for(let i=0;i<28;i++){const x=z.x+((i*47.81)%z.w),y=z.y+((i*23.19)%z.h),a=this.point(x,y),r=(4+i%6)*this.zoom;polygon(c,[{x:a.x-r,y:a.y},{x:a.x-r*.2,y:a.y-r*.25},{x:a.x+r,y:a.y+2},{x:a.x,y:a.y+r*.25}],i%3?'#96a3936b':'#273f457d','#bcc0a642');}
   }else if(z.material==='resin'){
    for(let i=0;i<12;i++){const a=this.point(z.x+i*z.w/12,z.y);c.strokeStyle='#749b894a';c.lineWidth=3*this.zoom;c.beginPath();c.moveTo(a.x,a.y);const b=this.point(z.x+(i+.6)*z.w/12,z.y+z.h);c.bezierCurveTo(a.x+37,a.y+9,b.x-40,b.y-10,b.x,b.y);c.stroke();}
   }else{for(let i=0;i<25;i++){const a=this.point(z.x+i*z.w/25,z.y+(i*7)%z.h);this.ellipse(a.x,a.y,14*this.zoom,1.5*this.zoom,'#dce2d934');}}
   c.restore();
  }
  if(!g||room.id!==g.s.room)return;
  // A practical lamp's floor footprint is clipped against actual collision volumes.
  for(const d of D.devices.filter(d=>d.room===room.id&&d.kind==='lamp'&&g.deviceActive(d))){
   const source={x:d.fx,y:g.isSide?144:d.fy},p=this.point(source.x,source.y),points=[];
   for(let i=0;i<=40;i++){
    const a=i/40*TAU,dx=Math.cos(a)*d.radius,dy=Math.sin(a)*155;let end={...source};
    for(let n=1;n<=30;n++){const q={x:source.x+dx*n/30,y:C.clamp(source.y+dy*n/30,42,247)};if(!g.los(source,q))break;end=q;}points.push(this.point(end.x,end.y));
   }
   c.save();polygon(c,points);c.clip();const grad=c.createRadialGradient(p.x,p.y,1,p.x,p.y,d.radius*this.zoom);grad.addColorStop(0,'#e3d89b32');grad.addColorStop(.8,'#e3dba90c');grad.addColorStop(1,'transparent');c.fillStyle=grad;c.fillRect(p.x-d.radius*this.zoom,p.y-250*this.zoom,2*d.radius*this.zoom,500*this.zoom);c.restore();
  }
 }
 sceneObjects(g){const out=super.sceneObjects(g);
  for(const d of D.devices.filter(d=>d.room===g.s.room&&(!d.after||g.s.flags[d.after]))){const y=g.isSide?144:d.y;
   out.push({y:y-1,draw:()=>this.device(d,g)});
  }
  if(g.s.room==='icebattle'&&g.s.operations.includes('harpoon'))out.push({y:142,draw:()=>{this.sprite('utility-piton',900,144,80);}});
  return out;
 }
 device(d,g){
  const c=this.ctx,y=g.isSide?144:d.y,v=g.deviceState(d),active=g.deviceActive(d),p=this.point(d.x,y),s=this.zoom*this.depth(y);
  const art=d.kind==='lamp'?(active?'utility-lamp':'utility-lamp-off'):d.kind==='radio'?(active?'utility-radio-on':'utility-radio'):d.kind==='mist'?'utility-valve':'utility-chain';
  if(d.kind==='rattle'){const q=this.point(d.fx,g.isSide?144:d.fy);this.line(p.x,p.y-78*s,q.x,q.y-133*s,'#739890a0',3*s);this.sprite('utility-bracket',d.fx,g.isSide?144:d.fy,135);}
  if(d.kind==='mist'){
   const q=this.point(d.fx,g.isSide?144:d.fy);this.line(p.x,p.y-20*s,q.x,q.y-16*s,'#1a3441',11*s);this.line(p.x,p.y-23*s,q.x,q.y-19*s,'#829a99',2*s);}
  this.sprite(art,d.x,y,d.kind==='lamp'?149:d.kind==='radio'?76:131);
  if(d.kind==='lamp'&&active)this.glow(p.x,p.y-125*s,90*s,'#e4dfb034');
  const armed=v.activeAt>g.s.worldTime&&v.until>g.s.worldTime;
  if(active&&d.kind!=='lamp'){
   const q=this.point(d.fx,g.isSide?144:d.fy);for(let i=0;i<2;i++){const r=(this.reduced?35:(g.s.worldTime*35+i*24)%72)*s;c.save();c.strokeStyle='#d6c18a55';c.lineWidth=1.5;c.beginPath();c.ellipse(q.x,q.y-53*s,r,r*.55,0,0,TAU);c.stroke();c.restore();}}
  if(armed){c.save();c.textAlign='center';c.fillStyle='#ead69e';c.font=12*s+'px system-ui';c.fillText(Math.ceil(v.activeAt-g.s.worldTime)+' s',p.x,p.y-151*s);c.restore();}
  if(g.nearestDevice()?.id===d.id){
   c.save();c.textAlign='center';c.fillStyle='#dacc9a';c.font=10*s+'px system-ui';c.fillText('T · '+(d.kind==='lamp'?'ÉCLAIRAGE':d.kind==='mist'?'PURGE':'LEURRE'),p.x,p.y+15*s);
   if(g._utilityTarget===d.id&&g._utilityHold>0){c.strokeStyle='#e3cc8f';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y-65*s,29*s,-Math.PI/2,-Math.PI/2+TAU*g._utilityHold/d.hold);c.stroke();}c.restore();
  }
 }
 draw(g,options={}){
  super.draw(g,options);if(options.title||options.epilogue||g.s.scene)return;
  const c=this.ctx,w=this.w,h=this.h;
  for(const m of g.activeMists()){
   const d=D.devices.find(d=>d.id===m.id),state=g.deviceState(d),age=g.s.worldTime-state.activeAt,alpha=Math.min(1,age/.45,(state.until-g.s.worldTime)/1.4),x=this.point(m.x,144).x;
   c.save();for(let i=0;i<13;i++){
    const flow=this.reduced?0:Math.sin(g.s.worldTime*1.4+i)*12,xx=x+(i%5)*m.w*this.zoom/4+flow*this.zoom,yy=this.point(0,58+(i*53)%178).y-(50+(i%3)*36)*this.zoom;
    const radius=(72+(i%3)*14)*this.zoom,grad=c.createRadialGradient(xx,yy,0,xx,yy,radius);grad.addColorStop(0,`rgba(151,186,186,${alpha*.44})`);grad.addColorStop(1,'rgba(90,145,158,0)');c.fillStyle=grad;c.fillRect(xx-radius,yy-radius,radius*2,radius*2);
   }c.restore();
  }
  if(g.s.room==='icebattle'&&g.s.operations.includes('harpoon')){
   const q=g.enemies.find(e=>e.id===D.rigSpec.id),rig=g.s.rig;
   // The marked band is an interaction condition, not a hidden collision wall.
   const x1=this.point(D.rigSpec.minimumX,105),x2=this.point(D.rigSpec.maximumX,216);
   c.save();c.strokeStyle=rig.tethered?'#d5bb7f77':'#87a9ab44';c.lineWidth=2;c.setLineDash([12,9]);c.strokeRect(x1.x,x1.y,x2.x-x1.x,x2.y-x1.y);c.setLineDash([]);
   c.fillStyle='#c6bea48e';c.font='10px system-ui';c.textAlign='center';c.fillText('ZONE DE TRACTION',(x1.x+x2.x)/2,x2.y+16);c.restore();
   if(rig.bolt){const b=rig.bolt;this.sprite('utility-bolt',b.x,b.y-63,9,b.face);}
   if(rig.tethered&&q){const a=this.point(D.rigSpec.anchor.x,D.rigSpec.anchor.y),b=this.point(q.x,q.y);c.save();c.strokeStyle='#c2b58a';c.lineWidth=2.5*this.zoom;c.beginPath();c.moveTo(a.x,a.y-33*this.zoom);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+10*this.zoom,b.x,b.y-59*this.zoom);c.stroke();for(let i=0;i<16;i++){const t=i/16;this.ellipse(a.x+(b.x-a.x)*t,a.y-33*this.zoom+(b.y-a.y-26*this.zoom)*t+Math.sin(t*Math.PI)*23*this.zoom,4*this.zoom,2*this.zoom,'#cfcca97a');}c.restore();}
   if(q&&!rig.tethered){const rt=g.runtime[q.id],p=this.point(q.x,q.y);if(p.x>25&&p.x<w-25){c.save();c.strokeStyle=rt.charge>0||rt.telegraph>0?'#c2796377':'#d8ca8cbb';c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y-87*this.zoom,22*this.zoom,0,TAU);c.stroke();this.line(p.x-30*this.zoom,p.y-87*this.zoom,p.x+30*this.zoom,p.y-87*this.zoom,c.strokeStyle,1);c.restore();}}
  }
  // Off projectors change their local scene's reading without making navigation black.
  const lamps=D.devices.filter(d=>d.room===g.s.room&&d.kind==='lamp'&&g.deviceAvailable(d));
  if(lamps.length&&!lamps.some(d=>g.deviceActive(d))){c.save();c.fillStyle='#06142626';c.fillRect(0,0,w,h);c.restore();}
 }
}
G.AVP_RENDERER=TerrainRenderer;
})(globalThis);

