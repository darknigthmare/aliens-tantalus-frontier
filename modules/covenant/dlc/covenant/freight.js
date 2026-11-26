/* v0.9 — Rail-guided loads. One authoritative pose for bodies, rays and art.
 * Pure simulation, no DOM, no timer owned by a renderer. Never crushes an actor.
 */
(function(root){'use strict';
const clamp=(v,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const dist=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*510);
const defs=e=>e.data.freight||{carts:[],speed:68,handleOffset:32,grabRadius:62,depthTolerance:.065,noiseInterval:.65,noiseRadius:880};
const definition=(e,id)=>defs(e).carts.find(c=>c.id===id);
function fresh(e){return {version:1,carts:Object.fromEntries(defs(e).carts.map(c=>[c.id,{x:c.x}])),parked:[],distance:0};}
function sanitize(e,raw){const s=fresh(e),ids=new Set(defs(e).carts.map(c=>c.id));
 for(const c of defs(e).carts){const x=raw?.carts?.[c.id]?.x;s.carts[c.id].x=Number.isFinite(x)?clamp(x,c.min,c.max):c.x;}
 s.parked=[...new Set(Array.isArray(raw?.parked)?raw.parked.filter(id=>ids.has(id)):[])];s.distance=clamp(raw?.distance,0,1e8);return s;
}
function carts(e,room=e.room,state=e.state){return defs(e).carts.filter(c=>c.room===room.id).map(c=>({...c,x:state?.freight?.carts?.[c.id]?.x??c.x}));}
function solids(e,room=e.room,state=e.state){return carts(e,room,state).map(c=>({...c,solid:true,kind:'freight-cart',halfDepth:.105}));}
// Slab intersection on the finite x/z segment. Touching a corner is not occlusion.
function segmentHits(a,b,o){if(!a||!b||Math.hypot(a.x-b.x,a.z-b.z)<1e-10)return false;
 let lo=0,hi=1;for(const [axis,radius] of [['x',o.w/2+5],['z',.145]]){
  const delta=b[axis]-a[axis],min=o[axis]-radius,max=o[axis]+radius;
  if(Math.abs(delta)<1e-10){if(a[axis]<=min||a[axis]>=max)return false;continue;}
  let t0=(min-a[axis])/delta,t1=(max-a[axis])/delta;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(hi-lo<1e-8)return false;
 }return hi>1e-8&&lo<1-1e-8;
}
function handles(e,c){return [-1,1].map(side=>({id:c.id,side,x:c.x+side*(c.w/2+defs(e).handleOffset),z:c.z,name:c.name}));}
function nearest(e){const p=e.state.player;return carts(e).flatMap(c=>handles(e,c)).filter(h=>Math.abs(h.z-p.z)<defs(e).depthTolerance&&dist(h,p)<defs(e).grabRadius&&e.lineClear(p,h,40)).sort((a,b)=>dist(a,p)-dist(b,p))[0]||null;}
function release(e,reason=''){if(!e.grip)return false;e.grip=null;e.freightNoiseClock=0;e.freightBlocked=false;if(reason)e.emit('hint',reason);return true;}
function toggle(e){if(e.paused||e.dead||e.busy||e.networkSession)return false;if(e.grip){release(e,'Freins serrés. Vous lâchez les poignées.');return true;}
 if(e.state.hidden||e.room.crawl||!e.grounded()||e.state.player.y>1)return false;const h=nearest(e);if(!h)return false;
 if(e.collides(h.x,h.z)||e.enemies().some(a=>a.alive&&dist(a,h)<48)){e.emit('hint','La poignée est occupée. Dégagez votre appui.');return false;}
 e.cancelWork();e.cancelSurvey();e.stowDetector();e.healing=0;e.reloadTime=0;e.clearAim();
 Object.assign(e.state.player,{x:h.x,z:h.z,y:0,facing:-h.side});e.jumpVelocity=0;e.grip={id:h.id,side:h.side,room:e.room.id};e.freightNoiseClock=0;e.freightBlocked=false;
 e.unlock('freight-handling');e.unlock('freight-safety');e.emit('freight','Prise assurée. Gauche / droite : pousser ou tirer. P : relâcher.');return true;
}
function hitsStatic(e,c,x){const r=e.rooms.get(c.room);return [...r.props.filter(o=>o.solid),...solids(e,r).filter(o=>o.id!==c.id)].some(o=>Math.abs(o.x-x)<(c.w+o.w)/2+5&&Math.abs(o.z-c.z)<.25);}
function hitsBody(e,c,from,to){const min=Math.min(from,to)-c.w/2-22,max=Math.max(from,to)+c.w/2+22;
 const actors=[...Object.values(e.state.enemies).filter(a=>a.alive&&a.room===c.room),...Object.values(e.state.crew).filter(a=>a.room===c.room)];
 return actors.some(a=>a.x>min&&a.x<max&&Math.abs(a.z-c.z)<.155&&(a.y||0)<c.h);
}
function drive(e,dt,keys){if(!e.grip)return null;const q=e.grip,c=carts(e).find(c=>c.id===q.id),p=e.state.player,config=defs(e);
 if(!c||q.room!==e.room.id||e.networkSession||e.busy||e.dead||p.y>1){release(e);return null;}
 const h=handles(e,c).find(h=>h.side===q.side);if(dist(p,h)>4){release(e,'Prise interrompue. Les freins retiennent la charge.');return null;}
 const mx=(keys.right?1:0)-(keys.left?1:0),out={moved:false,distance:0};
 if(!mx||keys.up||keys.down)return out;
 if(p.stamina<.01){release(e,'Plus de souffle. Reprenez votre respiration.');return out;}
 const amount=Math.min(config.speed*dt,p.stamina/config.staminaRate*config.speed),target=clamp(c.x+mx*amount,c.min,c.max),delta=target-c.x;
 if(Math.abs(delta)<1e-8){if(!e.freightBlocked)e.emit('hint','Butée atteinte. Inversez le mouvement ou relâchez avec P.');e.freightBlocked=true;return out;}
 const px=target+q.side*(c.w/2+config.handleOffset);
 const playerBlocked=e.solidProps().some(o=>o.id!==c.id&&p.y<o.h&&Math.abs(px-o.x)<o.w/2+19&&Math.abs(c.z-o.z)<.145);
 if(hitsStatic(e,c,target)||hitsBody(e,c,c.x,target)||playerBlocked){if(!e.freightBlocked)e.emit('hint','Trajet occupé. La charge est freinée, aucun corps ne sera poussé.');e.freightBlocked=true;return out;}
 e.freightBlocked=false;e.state.freight.carts[c.id].x=target;p.x=px;p.z=c.z;p.facing=-q.side;out.moved=true;out.distance=Math.abs(delta);e.state.freight.distance+=out.distance;
 e.freightNoiseClock-=dt;if(e.freightNoiseClock<=0){e.freightNoiseClock=config.noiseInterval;e.noise(target,c.z,config.noiseRadius,'freight');e.emit('wheel','',{cart:c.id});}
 e.unlock('freight-sight');e.unlock('freight-cost');
 // Invalidate paths when their physical obstacle moves. No enemy is spawned here.
 for(const a of Object.values(e.state.enemies))if(a.room===c.room){a.nav=[];a.navClock=0;}
 if(Math.abs(target-c.dock)<=config.dockTolerance&&!e.state.freight.parked.includes(c.id)){e.state.freight.parked.push(c.id);e.unlock(c.codex);e.emit('freightDock',c.name+' : repère de parcage atteint. La fiche est conservée.',{cart:c.id});}
 return out;
}
function safeResume(e,state){const proxy=Object.create(e);proxy.state=state;
 const bodies=[state.player,...Object.values(state.enemies).filter(v=>v.alive),...Object.values(state.crew)];
 for(const body of bodies){const room=e.rooms.get(body===state.player?state.room:body.room);if(!room)continue;
  // Do not move ordinary saves merely because another live session has a load elsewhere.
  const overlap=(x,z)=>proxy.collisionIn(room,x,z,0);if(!overlap(body.x,body.z))continue;
  const original={x:body.x,z:body.z};let found=false;
  for(let i=1;i<Math.ceil(room.width/12)&&!found;i++)for(const side of [-1,1]){const x=clamp(original.x+side*i*12,40,room.width-40);if(!overlap(x,original.z)){body.x=x;found=true;break;}}
  if(!found&&room.view==='depth')for(const z of [.08,.92,.18,.82,.5])if(!overlap(original.x,z)){body.z=z;found=true;break;}
  if(!found)throw new Error('Aucun appui sûr autour de la charge importée.');body.y=0;
  if(body===state.player)state.hidden=null;
 }
}
const methods={freightCarts(room=this.room){return carts(this,room);},nearestFreight(){return nearest(this);},toggleFreight(){return toggle(this);},releaseFreight(reason=''){return release(this,reason);},freightParked(c){return Math.abs((this.state.freight.carts[c.id]?.x??c.x)-c.dock)<=defs(this).dockTolerance;}};
const API={fresh,sanitize,carts,solids,segmentHits,handles,nearest,release,toggle,drive,safeResume,methods};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.CovenantFreight=API;
})(globalThis);
