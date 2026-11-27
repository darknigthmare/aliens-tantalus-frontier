/* Surveillance presentation — same room geometry, bounded camera observation.
 * This renderer does not tick, spawn, teleport or write quest/saved state.
 */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
const Base=root.CovenantRenderer;
class CovenantNetworkRenderer extends Base {
 prop(o){
  const E=this.engine,c=this.c;
  if(o.kind==='lamp'&&!E.roomPower().lights){const p=this.propPoint(o);c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);this.rect(-o.w/2,-o.h,o.w,8,'#314848');this.rect(-o.w*.2,-o.h+3,o.w*.4,3,'#b28e55');c.restore();return;}
  if(!['cctvTerminal','cctvCamera','ceilingSpeaker'].includes(o.kind))return super.prop(o);
  const p=this.project(o.x,o.z);if(p.x<-140||p.x>this.W+140)return;
  c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);
  if(o.kind==='cctvTerminal'){
   this.ellipse(0,4,48,8,'#06141ac0');this.poly([[-24,0],[-20,-78],[22,-78],[31,0]],'#40555b','#90a69a',1.5);
   this.poly([[-52,-62],[-57,-144],[51,-144],[58,-65]],this.grad(-55,0,55,0,[[0,'#56716b'],[.4,'#87958a'],[1,'#2d4c50']]),'#a7b6a5',2);
   this.rect(-42,-132,80,51,'#0a242c');for(let i=0;i<5;i++)this.line([[-34,-122+i*8],[25-(i%2)*15,-122+i*8]],'#8ec4b382',1.5);
   this.rect(-31,-73,55,6,'#bdc7ab');this.ellipse(40,-112,3,3,'#cbd99a');
   for(let i=0;i<6;i++)this.rect(-28+i*11,-54,7,4,'#132d33');
  } else if(o.kind==='cctvCamera'){
   const d=E.systemDefs.cameras.find(x=>x.id===o.systemId),on=d&&E.state.network.circuits[d.circuit].cameras;
   this.line([[-8,-245],[-8,-221],[14,-221]],'#6d8b83',7);
   this.poly([[-19,-225],[28,-222],[40,-203],[-16,-207]],'#718982','#b4c7ae',1.5);
   this.ellipse(28,-213,13,9,'#0c252b');this.ellipse(30,-213,6,5,on?'#7abdad':'#263f45');this.ellipse(-13,-213,2,2,on?'#c2d28d':'#634831');
  } else if(o.kind==='ceilingSpeaker'){
   const d=E.systemDefs.speakers.find(x=>x.id===o.systemId),active=E.state.network.signals.some(s=>s.id===o.systemId);
   this.line([[0,-282],[0,-242]],'#6c867b',4);this.poly([[-14,-254],[-14,-234],[33,-221],[33,-267]],'#536d71','#a2b6a5',2);
   this.ellipse(34,-243,9,22,'#0b242f');this.ellipse(34,-243,5,15,'#4c7775');
   if(active){for(let i=0;i<3;i++){const phase=(E.state.time*.8+i/3)%1;c.beginPath();c.arc(29,-243,21+phase*65,-.65,.65);c.strokeStyle=`rgba(201,210,158,${(1-phase)*.6})`;c.lineWidth=2;c.stroke();}}
   if(d&&!E.state.network.circuits[d.circuit].speakers)this.ellipse(-11,-244,3,3,'#70594a');
  }
  c.restore();
 }
 emergencyLight(){if(this.engine.roomPower().lights)return;this.rect(0,0,this.W,this.H,this.contrast?'#06172345':'#030e1b85');for(let x=100-this.camera%300;x<this.W;x+=300)this.rect(x,697,45,2,'#c99d7044');}
 frame(dt,input){super.frame(dt,input);this.emergencyLight();
  const t=this.engine.nearestTerminal();if(t&&!this.engine.state.hidden){const p=this.project(t.x,t.z);this.text('U · TERMINAL',clamp(p.x,94,this.W-94),p.y-163,12,'#cedcc2','center');}
 }
 drawNetworkFeed(canvas,view){
  const width=Math.max(2,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2))),height=Math.round(width*760/1400);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  const c=canvas.getContext('2d',{alpha:false});
  if(!view.available){c.setTransform(1,0,0,1,0,0);c.fillStyle='#07141c';c.fillRect(0,0,width,height);c.strokeStyle='#304b493f';for(let y=0;y<height;y+=18){c.beginPath();c.moveTo(0,y);c.lineTo(width,y);c.stroke();}c.fillStyle='#adc1b0';c.textAlign='center';c.font=`${Math.max(12,width*.024)}px monospace`;c.fillText('SIGNAL INDISPONIBLE',width/2,height*.47);c.font=`${Math.max(10,width*.016)}px monospace`;c.fillText(view.reason||'Capteur indisponible',width/2,height*.56);return;}
  const source=this.engine,cam=view.camera;
  if(!this.feedRenderer||this.feedRenderer.canvas!==canvas){const fac=Object.create(source);this.feedRenderer=new root.CovenantRenderer(canvas,fac);}
  const f=this.feedRenderer,fac=Object.create(source);
  Object.defineProperty(fac,'room',{get:()=>view.room});
  fac.state={...source.state,room:cam.room,player:view.player||{x:cam.x,z:cam.z,y:0,hp:100,facing:1},hidden:null};
  fac.motion={moving:false,run:false,crouch:false};fac.aim=null;fac.scanning=null;fac.work=null;fac.healing=0;fac.networkSession=null;
  fac.distance=()=>1e9;fac.enemies=()=>view.enemies;fac.crew=()=>[];fac.nearestTerminal=()=>null;
  f.engine=fac;f.W=1400;f.H=760;f.scale=width/1400;f.camera=cam.left;f.reduceFX=true;f.contrast=this.contrast;
  c.setTransform(f.scale,0,0,f.scale,0,0);c.globalAlpha=1;f.background();
  const elements=[...view.room.props.map(o=>({z:o.z,draw:()=>f.prop(o)})),...view.room.exits.map(e=>({z:e.z-.03,draw:()=>f.portal(e)})),
   ...(view.room.supplies||[]).map(s=>({z:s.z,draw:()=>f.supply(s)})),...(view.room.shelters||[]).map(s=>({z:s.z,draw:()=>f.shelter(s)})),
   ...view.enemies.map(e=>({z:e.z,draw:()=>f.creature(e)}))];
  if(view.player)elements.push({z:view.player.z,draw:()=>f.human(view.player,'daniels',false)});
  elements.sort((a,b)=>a.z-b.z).forEach(e=>e.draw());f.emergencyLight();
  // Deliberately no enemy markers behind opaque geometry, no objective markers.
  for(let y=0;y<760;y+=6)f.rect(0,y,1400,1,'#081b2535');
  f.line([[22,66],[22,22],[112,22]],'#bed4b997',2);f.line([[1378,66],[1378,22],[1288,22]],'#bed4b997',2);
  f.text(cam.name.toUpperCase(),42,47,16,'#d7e0c4');f.text('DIRECT · '+Math.floor(view.time).toString().padStart(5,'0')+' S',1357,47,15,'#d7e0c4','right');
  f.text('CHAMP FIXE / RECONSTITUTION 2.5D',42,725,13,'#bbcdb7');
  f.text(view.enemies.length?'MOUVEMENT DANS LE CHAMP':'AUCUN MOUVEMENT VISIBLE',1357,725,13,view.enemies.length?'#dfbc88':'#a9c0b3','right');
 }
}
root.CovenantRenderer=CovenantNetworkRenderer;
})(globalThis);
