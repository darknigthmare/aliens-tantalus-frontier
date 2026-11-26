
/* World-space architectural anchors and reference-informed stage appearances. */
(function(G){'use strict';const Base=G.AVP_RENDERER,C=G.AVP_CORE,D=G.AVP_DATA,F=G.AVP_FIDELITY;
const poly=(c,pts,fill,stroke)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke();}};
class FidelityRenderer extends Base{
 sprite(asset,x,y,height,face=1,alpha=1,rotate=0){return super.sprite(F.asset(asset,this.currentGame?.s||{flags:{}},this.fidelityOptions),x,y,height,face,alpha,rotate);}
 draw(game,options={}){this.fidelityOptions=options;super.draw(game,options);if(options.epilogue){const t=this.reduced?1:.9+Math.sin(game.s.worldTime*3)*.1;this.sprite('film-newborn',837,89,56*t,1,.94);}}
 background(room,time){
  super.background(room,time);const c=this.ctx,w=this.w,h=this.h;
  // The navigable façade uses world coordinates, never camera-relative parallax.
  if(room.id==='station'){
   c.save();const bottom=this.point(0,65).y;
   for(const d of room.doors.filter(d=>d.arch.facade)){
    const p=this.point(d.x,65),bw=445*this.zoom,bh=320*this.zoom;
    poly(c,[[p.x-bw/2,bottom],[p.x-bw/2,bottom-bh],[p.x,bottom-bh-62*this.zoom],[p.x+bw/2,bottom-bh],[p.x+bw/2,bottom]],'#303f43','#7b8884');
    for(let xx=p.x-bw/2+12*this.zoom;xx<p.x+bw/2;xx+=19*this.zoom)this.line(xx,bottom-bh+12*this.zoom,xx,bottom,'#8f8e773e');
    this.line(p.x-bw/2-14*this.zoom,bottom-bh,p.x,bottom-bh-62*this.zoom,'#b1c1bd',5*this.zoom);this.line(p.x,bottom-bh-62*this.zoom,p.x+bw/2+14*this.zoom,bottom-bh,'#b1c1bd',5*this.zoom);
    for(const off of [-140,140]){c.fillStyle='#1a3039';c.fillRect(p.x+off*this.zoom-28*this.zoom,bottom-bh+76*this.zoom,56*this.zoom,74*this.zoom);this.line(p.x+off*this.zoom,bottom-bh+76*this.zoom,p.x+off*this.zoom,bottom-bh+150*this.zoom,'#768c90',3*this.zoom);}
    c.textAlign='center';c.font=`${12*this.zoom}px system-ui`;c.fillStyle='#bac1ad';c.fillText(d.label.split(' · ').pop().toUpperCase(),p.x,bottom-228*this.zoom);
   }c.restore();
  }
  if(room.id==='maru'){
   const a=this.point(250,65),b=this.point(1320,65),top=Math.max(0,a.y-360*this.zoom);c.fillStyle='#344a50';c.fillRect(a.x,top,b.x-a.x,a.y-top);this.line(a.x,top,b.x,top,'#b0b7a9',5*this.zoom);this.line(a.x,a.y,b.x,a.y,'#101f27',6*this.zoom);
   for(let x=300;x<1300;x+=180){const q=this.point(x,65);c.fillStyle='#8da6a9';c.fillRect(q.x-45*this.zoom,top+45*this.zoom,90*this.zoom,62*this.zoom);this.line(q.x,top+45*this.zoom,q.x,top+107*this.zoom,'#1d353f',5*this.zoom);}
  }
  if(room.id==='bridge'){
   const y=h*.18,bottom=h*.50;c.fillStyle='#0f2d3d';c.fillRect(0,y,w,bottom-y);
   for(let i=0;i<8;i++){const q=this.point(150+i*250,65);this.line(q.x,y,q.x,bottom,'#6b8388',12*this.zoom);this.line(q.x+3,y,q.x+3,bottom,'#b2b7aa',2*this.zoom);}
   for(let i=0;i<6;i++)this.line(0,h*(.32+i*.023),w,h*(.32+i*.023),'#91b7bd20');this.line(0,bottom,w,bottom,'#94aba9',8*this.zoom);
  }
  if(room.id==='shaft'){
   const a=this.point(800,40),b=this.point(1330,100),left=a.x-75*this.zoom,right=b.x+75*this.zoom;
   poly(c,[[left,0],[right,0],[right,b.y-26*this.zoom],[left,b.y-26*this.zoom]],'#07151f','#697c7e');
   for(let i=0;i<7;i++){const y=h*.08+i*61*this.zoom;this.line(left,y,right,y,'#52686b77',12*this.zoom);this.line(left+45*this.zoom,0,left+45*this.zoom,b.y,'#85928b88',3*this.zoom);this.line(right-45*this.zoom,0,right-45*this.zoom,b.y,'#85928b88',3*this.zoom);}
   for(let x=left;x<right;x+=55*this.zoom)this.line(x,b.y-80*this.zoom,x,b.y-4*this.zoom,'#7a8e87',4*this.zoom);
   this.line(left,b.y-80*this.zoom,right,b.y-80*this.zoom,'#9bad9f',6*this.zoom);
  }
  if(room.id==='queenhold'&&!this.currentGame.s.flags.bomb)this.sprite('film-ovipositor',1480,58,115,-1,.80);
  if(room.id==='eggworks'){
   const a=this.point(260,76),b=this.point(1740,76);this.line(a.x,a.y-32*this.zoom,b.x,b.y-32*this.zoom,'#192c32',16*this.zoom);this.line(a.x,a.y-24*this.zoom,b.x,b.y-24*this.zoom,'#a1ad99',4*this.zoom);
   // Endless visual circulation, not extra spawning; actual dangerous eggs are defined separately.
   for(let i=0;i<6;i++){const x=280+((i*235+(this.reduced?0:time*22))%1430);this.sprite('egg',x,64,64,1,.65);}
  }
 }
 architecturalDoor(d,g){
  const a=d.arch;if(!a)return;const c=this.ctx,q=this.point(d.x,d.y),s=this.depth(d.y)*this.zoom,locked=g.gate(d),room=g.room;
  if(a.type==='transport'){
   this.sprite('film-helicopter',d.x+(a.anchor==='left'?115:-95),75,190,1,.94);
   const pt=this.point(d.x,g.isSide?144:d.y);this.ellipse(pt.x,pt.y,46*s,11*s,'#adb99b40');
   if(g.near(d,170)){c.save();c.textAlign='center';c.font='12px system-ui';c.fillStyle='#e3d8b8';c.fillText(locked?'Préparer l’expédition avant l’embarquement':'E · Embarquer — trajet abrégé',pt.x,pt.y-180*s);c.restore();}return;
  }
  if(a.type==='path'){
   const side=a.anchor==='left'?-1:a.anchor==='right'?1:0,dy=a.anchor==='front'?150:14;
   poly(c,[[q.x-39*s,q.y-9*s],[q.x+39*s,q.y-9*s],[q.x+side*165*s+65*s,q.y+dy*s],[q.x+side*165*s-65*s,q.y+dy*s]],'#88a39b26');
   this.line(q.x-47*s,q.y+8*s,q.x+47*s,q.y+8*s,locked?'#946647':'#c4c9a2',2*s);
   if(g.near(d,160)){c.save();c.font='12px system-ui';c.textAlign='center';c.fillStyle='#d9decc';c.fillText('→ '+d.label.split(' · ').pop(),q.x,q.y-20*s);c.restore();}return;
  }
  if(a.type==='rope'){
   const p=this.point(d.x,d.y);this.ellipse(p.x,p.y,59*s,21*s,'#0d2735');this.ellipse(p.x,p.y,44*s,13*s,'#071922');this.line(p.x-48*s,p.y-3*s,p.x-48*s,p.y-74*s,'#788f8b',6*s);this.line(p.x+48*s,p.y-3*s,p.x+48*s,p.y-74*s,'#788f8b',6*s);this.line(p.x-53*s,p.y-71*s,p.x+53*s,p.y-71*s,'#bdbaa4',5*s);
   this.line(p.x-9*s,p.y+3*s,p.x-9*s,0,'#aaa99a',2.5*s);this.line(p.x+4*s,p.y+3*s,p.x+4*s,0,'#677f80',2.5*s);
   if(g.near(d,155)){c.save();c.font='12px system-ui';c.textAlign='center';c.fillStyle='#d6d8bf';c.fillText((d.levelDelta>0?'↑ Remontée':'↓ Descente')+' · E',p.x,p.y-90*s);c.restore();}return;
  }
  const width=a.width*s,height=a.height*s,wall=a.material==='wood'?'#4e5148':a.material==='steel'?'#38505b':'#30494e',highlight=a.material==='wood'?'#8e8970':'#7f938e';
  c.save();
  // Return walls reach the shell. Not a free-standing arch in an open floor area.
  if(a.anchor==='left'||a.anchor==='right'){
   const edge=this.point(a.anchor==='left'?48:room.width-48,40),sign=a.anchor==='left'?-1:1;
   poly(c,[[edge.x+sign*85*s,0],[q.x+sign*width*.54,0],[q.x+sign*width*.54,q.y+3*s],[edge.x+sign*85*s,edge.y]],wall,highlight);
   poly(c,[[q.x-sign*width*.56,0],[q.x+sign*width*.56,0],[q.x+sign*width*.56,q.y-height],[q.x-sign*width*.56,q.y-height]],wall);
   for(let y=30*this.zoom;y<q.y-height;y+=65*this.zoom)this.line(q.x-width*.6,y,q.x+width*.6,y,'#7e958840');
  }else if(a.anchor==='front'){
   // A near-side return corridor, visually open toward the foreground.
   const rear=this.point(d.x,40),end=this.point(d.x,250);
   poly(c,[[q.x-76*s,rear.y],[q.x-53*s,q.y],[q.x-53*s,end.y+72*s],[q.x-82*s,end.y+72*s]],wall,highlight);
   poly(c,[[q.x+76*s,rear.y],[q.x+53*s,q.y],[q.x+53*s,end.y+72*s],[q.x+82*s,end.y+72*s]],wall,highlight);
  }else{
   // Back aperture is cut into the existing wall/façade: no column through the roof.
   c.fillStyle=wall;c.fillRect(q.x-width*.65,q.y-height-8*s,width*1.30,13*s);
   this.line(q.x-width*.72,q.y-height,q.x+width*.72,q.y-height,highlight,5*s);
  }
  c.translate(q.x,q.y);c.scale(s,s);
  const ww=a.width,hh=a.height;
  c.fillStyle=wall;c.fillRect(-ww*.64,-hh-10,ww*1.28,hh+10);c.fillStyle=locked?'#233638':'#071a25';c.fillRect(-ww*.43,-hh+10,ww*.86,hh-10);
  this.line(-ww*.44,-hh+9,-ww*.44,0,highlight,4);this.line(ww*.44,-hh+9,ww*.44,0,'#192e35',5);this.line(-ww*.44,-hh+9,ww*.44,-hh+9,highlight,4);
  // Visible inner jambs and tunnel/stair flight terminate in a dark landing.
  if(!locked){poly(c,[[-ww*.41,-hh+13],[-ww*.25,-hh+24],[-ww*.25,-8],[-ww*.41,0]],'#445d60');
   poly(c,[[ww*.41,-hh+13],[ww*.27,-hh+24],[ww*.27,-8],[ww*.41,0]],'#253c44');
   if(a.type.startsWith('stair')){const up=a.type==='stair-up';for(let i=0;i<7;i++){const y=-7-i*17;this.line(-ww*.25,y,ww*(.34-i*.027),y,'#91a199',3);if(up)this.line(-ww*.20,y,-ww*.20,y-17,'#314b50',2);}}
   else {this.line(-ww*.25,-8,ww*.27,-8,'#9cab984d',2);this.glow(0,-hh*.34,ww*.38,'#839e9f19');}
  }
  if(a.type==='duct')for(let i=0;i<5;i++)this.line(-ww*.41,-hh+17+i*10,ww*.4,-hh+17+i*10,'#728982',2);
  if(locked&&!g.portalFor(d))for(let i=0;i<5;i++)this.line(-ww*.4,-hh+18+i*(hh-27)/5,ww*.4,-hh+18+i*(hh-27)/5,'#596f69',4);
  this.line(-ww*.51,1,ww*.51,1,locked?'#b18966':'#c6d4be',2.5);
  if(g.near(d,155)){c.font='11px system-ui';c.textAlign='center';c.fillStyle=locked?'#c1a986':'#d7decb';const indicator=d.levelDelta>0?'↑ ':d.levelDelta<0?'↓ ':'';c.fillText(indicator+d.label.split(' · ').pop().slice(0,34),0,-hh-26);}
  c.restore();
 }
 sceneObjects(g){const out=super.sceneObjects(g);
  if(g.s.room==='gear')for(const t of D.fidelityBenches)out.push({y:t.y,draw:()=>{
   const c=this.ctx,a=this.point(t.x,t.y),b=this.point(t.x+t.w,t.y),z=this.zoom,h=t.lift*z;
   // Shared table collision is at its floor footprint; objects are above the top, not floating.
   for(const x of [a.x+12*z,b.x-12*z]){this.line(x,a.y,x,a.y-h,'#263d46',7*z);this.line(x+2*z,a.y,x+2*z,a.y-h,'#8d9d92',2*z);}
   poly(c,[[a.x,a.y-h],[b.x,a.y-h],[b.x+8*z,a.y-h+10*z],[a.x-8*z,a.y-h+10*z]],'#68776e','#b0b4a0');
   this.line(a.x-8*z,a.y-h+10*z,b.x+8*z,a.y-h+10*z,'#21363e',6*z);
  }});

  for(const p of F.props(g.s))out.push({y:p.y+.5,draw:()=>{
   this.ctx.save();this.ctx.translate(0,-(p.lift||0)*this.zoom);this.sprite(p.asset,p.x,p.y,p.height,1,1);this.ctx.restore();
  }});
  if(g.scar&&g.s.party.scar?.stance!=='silent'&&!g.companionDown('scar')){
   const a=g.scar,t=g.enemies.find(e=>e.hp>0&&!e.unique&&Math.abs(e.x-a.x)<500&&(g.isSide||Math.abs(e.y-a.y)<42)&&g.los(a,e));
   if(t)out.push({y:t.y+1,draw:()=>{const q=this.point(t.x,t.y),z=this.zoom;for(const [x,y] of [[-3,0],[3,0],[0,-6]])this.ellipse(q.x+x*z,q.y-85*z+y*z,1.6*z,1.6*z,'#ca4d37');}});
  }
  for(const a of F.actors(g.s))out.push({y:a.y+(a.pose==='cocoon'?2:0),draw:()=>{
   this.actor(a.asset,{...a,face:a.pose==='cocoon'?1:-1},a.height,g,false,.97);
   if(a.pose==='cocoon'){const c=this.ctx,pt=this.point(a.x,a.y),z=this.zoom;for(let i=0;i<5;i++)this.line(pt.x-19*z,pt.y-(14+i*12)*z,pt.x+20*z,pt.y-(18+i*12)*z,'#536d6799',5*z);}
  }});
  return out;
 }
}
G.AVP_RENDERER=FidelityRenderer;
})(globalThis);

