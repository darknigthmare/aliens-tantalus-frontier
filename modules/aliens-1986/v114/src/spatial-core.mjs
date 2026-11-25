/* V106 — Authoritative local geometry, door state and save contracts.
   World axes: x = horizontal, z = floor depth, both in world units.
   No network, no global storage, no canonical mission progression. */
export const VERSION = '106.0.0-rc.1';
export const SCHEMA = 106;
const finite = x => typeof x === 'number' && Number.isFinite(x);
const clone = x => structuredClone(x);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const own = (o,k) => Object.hasOwn(o,k);
const record = o => o && typeof o === 'object' && !Array.isArray(o);
export const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
export function fingerprint(value) { // compatibility, not authentication / anti-cheat
  let h=2166136261; for(const c of JSON.stringify(value)){ h^=c.charCodeAt(0);h=Math.imul(h,16777619); } return (h>>>0).toString(16).padStart(8,'0');
}
export function validateScene(scene){
  const errors=[], ids=new Set();
  const id=x=>{if(typeof x!=='string'||!x.length||ids.has(x))errors.push(`Identifiant invalide/dupliqué: ${x}`);ids.add(x);};
  if(!record(scene)||typeof scene.id!=='string'||!finite(scene.width)||!finite(scene.depth)||scene.width<160||scene.depth<80)return ['Dimensions ou identifiant de salle invalides'];
  if(!['SIDE','DEPTH','HYBRID','SETPIECE'].includes(scene.mode))errors.push('Mode inconnu');
  for(const key of ['solids','doors','props','nodes'])if(!Array.isArray(scene[key]))errors.push(`${key} doit être un tableau`);
  if(errors.length)return errors;
  for(const b of [...scene.solids,...scene.doors]){id(b.id);if(![b.x,b.z,b.w,b.d].every(finite)||b.w<=0||b.d<=0||b.x<0||b.z<0||b.x+b.w>scene.width||b.z+b.d>scene.depth)errors.push(`Volume hors limites: ${b.id}`);}
  for(const p of scene.props){id(p.id);if(!finite(p.x)||!finite(p.z)||!p.support)errors.push(`Support/position manquant: ${p.id}`);}
  for(const p of scene.nodes){id(p.id);if(!finite(p.x)||!finite(p.z))errors.push(`Nœud invalide: ${p.id}`);}
  for(const c of scene.circuits||[]) {id(c.id);if(typeof c.initialOn!=='boolean')errors.push(`Circuit invalide: ${c.id}`);}
  for(const c of scene.controls||[]) {id(c.id);if(!finite(c.x)||!finite(c.z)||!(scene.circuits||[]).some(x=>x.id===c.circuit))errors.push(`Commande invalide: ${c.id}`);}
  for(const d of scene.doors)if(!finite(d.reach)||d.reach<=0||d.reach>200)errors.push(`Portée porte invalide: ${d.id}`);
  for(const a of scene.actors||[]){id(a.id);if(!['player','ally','escort','enemy'].includes(a.kind)||!finite(a.radius)||a.radius<=0||![a.x,a.z].every(finite)||(a.hp!==undefined&&(!finite(a.hp)||a.hp<0||a.hp>100))||(a.ammo!==undefined&&(!Number.isInteger(a.ammo)||a.ammo<0||a.ammo>999)))errors.push(`Acteur invalide: ${a.id}`);}
  return errors;
}
export function segmentBox(a,b,box,radius=0){
  let lo=0,hi=1; const dx=b.x-a.x,dz=b.z-a.z;
  for(const [p,q] of [[-dx,a.x-box.x+radius],[dx,box.x+box.w+radius-a.x],[-dz,a.z-box.z+radius],[dz,box.z+box.d+radius-a.z]]){
    if(Math.abs(p)<1e-12){if(q<0)return null;continue;} const t=q/p;
    if(p<0){if(t>hi)return null;lo=Math.max(lo,t);}else{if(t<lo)return null;hi=Math.min(hi,t);}
  }
  return lo>=0&&lo<=1?lo:null;
}
function segmentCircle(a,b,center,radius){
  const dx=b.x-a.x,dz=b.z-a.z,ox=a.x-center.x,oz=a.z-center.z,aa=dx*dx+dz*dz;
  if(ox*ox+oz*oz<=radius*radius)return 0;if(aa<=1e-12)return null;
  const bb=2*(ox*dx+oz*dz),cc=ox*ox+oz*oz-radius*radius,disc=bb*bb-4*aa*cc;
  if(disc<0)return null;const t=(-bb-Math.sqrt(disc))/(2*aa);return t>=0&&t<=1?t:null;
}
export function createWorld(scene){
  const errors=validateScene(scene);if(errors.length)throw new TypeError(errors.join('; '));
  const frozen=clone(scene);
  const world={scene:frozen,geometry:fingerprint(frozen),time:0,paused:false,revision:0,
    doors:Object.fromEntries(scene.doors.map(d=>[d.id,{open:Boolean(d.initialOpen),powered:d.powered!==false}])),
    circuits:Object.fromEntries((scene.circuits||[]).map(c=>[c.id,Boolean(c.initialOn)])),
    actors:(scene.actors||[]).map(a=>({...clone(a),hp:finite(a.hp)?a.hp:100,ammo:finite(a.ammo)?a.ammo:30,alive:a.hp!==0,invulnerable:0,phase:a.hp===0?'dead':'idle',clock:0,aim:null,route:[],routeRevision:-1,waiting:Boolean(a.waiting)})),
    visited:[],traces:[],events:[],stats:{shots:0,hits:0,doorUses:0,blockedMoves:0,committedMisses:0},checkpoint:null};
  for(const a of world.actors)if(!canStand(world,a,a.radius))throw new RangeError(`Spawn obstrué: ${a.id}`);
  world.checkpoint=exportState(world);return world;
}
export function activeSolids(world){return [...world.scene.solids,...world.scene.doors.filter(d=>!world.doors[d.id].open)];}
export function canStand(world,p,radius=0){return finite(p.x)&&finite(p.z)&&p.x>=radius&&p.x<=world.scene.width-radius&&p.z>=radius&&p.z<=world.scene.depth-radius&&!activeSolids(world).some(b=>p.x>b.x-radius&&p.x<b.x+b.w+radius&&p.z>b.z-radius&&p.z<b.z+b.d+radius);}
export function trace(world,a,b,radius=0,{query='movement'}={}){let hit=null;for(const box of activeSolids(world)){if(query==='sight'&&box.blocksSight===false)continue;if(query==='projectile'&&box.blocksProjectiles===false)continue;const t=segmentBox(a,b,box,radius);if(t!==null&&(!hit||t<hit.t))hit={box,t};}return hit;}
export function visible(world,a,b){return (!a.roomId||!b.roomId||a.roomId===b.roomId)&&trace(world,a,b,0,{query:'sight'})===null;}
export function move(world,actor,dx,dz){
  if(world.paused||!actor.alive||![dx,dz].every(finite))return false;
  const origin={x:actor.x,z:actor.z},end={x:clamp(actor.x+dx,actor.radius,world.scene.width-actor.radius),z:clamp(actor.z+dz,actor.radius,world.scene.depth-actor.radius)};
  const collision=trace(world,origin,end,actor.radius);let fraction=collision?Math.max(0,collision.t-0.001):1;
  actor.x=origin.x+(end.x-origin.x)*fraction;actor.z=origin.z+(end.z-origin.z)*fraction;
  if(collision)world.stats.blockedMoves++;return distance(origin,actor)>0.001;
}
export function setDoor(world,id,open,{actor=null,force=false}={}){
  if(world.paused&&!force)return {ok:false,reason:'Simulation en pause'};
  const d=world.scene.doors.find(d=>d.id===id),state=world.doors[id];if(!d||!state)return {ok:false,reason:'Porte inconnue'};
  if(typeof open!=='boolean')return {ok:false,reason:'Commande invalide'};
  if(actor&&!force&&(distance(actor,{x:d.x+d.w/2,z:d.z+d.d/2})>d.reach))return {ok:false,reason:'Approchez du contrôle'};
  if(open===state.open)return {ok:true,changed:false};
  if(open&&!state.powered&&!d.manual)return {ok:false,reason:'Alimentation coupée'};
  if(d.critical&&!force)return {ok:false,reason:'Commande réservée au scénario'};
  if(!open&&world.actors.some(a=>a.alive&&segmentBox(a,a,d,a.radius+3)!==null))return {ok:false,reason:'Passage occupé'};
  state.open=open;world.revision++;world.stats.doorUses++;world.events.push({type:'door',id,open,at:world.time});return {ok:true,changed:true};
}
export function interact(world,actor){
  if(world.paused||!actor?.alive)return {ok:false,reason:'Action indisponible'};
  const options=world.scene.doors.map(d=>({kind:'door',item:d,p:{x:d.x+d.w/2,z:d.z+d.d/2},reach:d.reach}));
  for(const c of world.scene.controls||[])options.push({kind:'control',item:c,p:c,reach:c.reach||72});
  const nearest=options.filter(o=>distance(actor,o.p)<=o.reach).sort((a,b)=>distance(actor,a.p)-distance(actor,b.p))[0];
  if(!nearest)return {ok:false,reason:'Aucune commande à portée'};
  if(nearest.kind==='door')return setDoor(world,nearest.item.id,!world.doors[nearest.item.id].open,{actor});
  if(!visible(world,actor,nearest.p))return {ok:false,reason:'Commande derrière une cloison'};
  const key=nearest.item.circuit;if(!own(world.circuits,key))return {ok:false,reason:'Circuit absent'};
  world.circuits[key]=!world.circuits[key];world.events.push({type:'circuit',id:key,on:world.circuits[key],at:world.time});return {ok:true,changed:true,reason:world.circuits[key]?'Éclairage de service rétabli':'Éclairage de service coupé'};
}
export function shoot(world,actor,aim,{damage=24,range=670}={}){
  if(world.paused||!actor.alive||actor.ammo<=0||!finite(aim?.x)||!finite(aim?.z)||!finite(damage)||damage<=0||damage>100||!finite(range)||range<=0||range>3000)return {ok:false};
  const dist=Math.max(1,distance(actor,aim)),end={x:actor.x+(aim.x-actor.x)*range/dist,z:actor.z+(aim.z-actor.z)*range/dist};
  const wall=trace(world,actor,end,0,{query:'projectile'});let t=wall?.t??1,target=null;
  for(const candidate of world.actors){if(!candidate.alive||candidate===actor||candidate.kind!=='enemy')continue;
    const hit=segmentCircle(actor,end,candidate,candidate.radius+2);if(hit!==null&&hit<t){t=hit;target=candidate;}}
  actor.ammo--;world.stats.shots++;world.traces.push({a:{x:actor.x,z:actor.z},b:{x:actor.x+(end.x-actor.x)*t,z:actor.z+(end.z-actor.z)*t},life:.09});
  if(target){target.hp=Math.max(0,target.hp-damage);target.alive=target.hp>0;world.stats.hits++;if(!target.alive){target.phase='dead';target.aim=null;}}
  return {ok:true,hit:target?.id??null,wall:target?null:wall?.box.id??null};
}
export function planRoute(world,start,goal,radius=12,{cell=32,maxExpanded=3000}={}){
  if(!canStand(world,start,radius)||!canStand(world,goal,radius))return [];
  if(!trace(world,start,goal,radius))return [clone(goal)];
  const nx=Math.floor((world.scene.width-2*radius)/cell),nz=Math.floor((world.scene.depth-2*radius)/cell);
  const point=(i,j)=>({x:radius+i*cell,z:radius+j*cell});const key=(i,j)=>i+':'+j;
  const near=p=>{let best=null;for(let di=-2;di<=2;di++)for(let dj=-2;dj<=2;dj++){
    const i=clamp(Math.round((p.x-radius)/cell)+di,0,nx),j=clamp(Math.round((p.z-radius)/cell)+dj,0,nz),pt=point(i,j),d=distance(p,pt);
    if(canStand(world,pt,radius)&&!trace(world,p,pt,radius)&&(!best||d<best.dist))best={i,j,pt,dist:d};}return best;};
  const s=near(start),g=near(goal);if(!s||!g)return [];
  const open=[{i:s.i,j:s.j,g:0,f:distance(s.pt,g.pt)}],scores=new Map([[key(s.i,s.j),0]]),parent=new Map(),closed=new Set();let count=0;
  while(open.length&&count++<maxExpanded){open.sort((a,b)=>a.f-b.f);const node=open.shift(),k=key(node.i,node.j);if(closed.has(k))continue;closed.add(k);
    if(node.i===g.i&&node.j===g.j){let p=k,result=[clone(goal),g.pt];while(parent.has(p)){p=parent.get(p);const [i,j]=p.split(':').map(Number);result.push(point(i,j));}result=result.reverse();
      const out=[];let anchor=start;while(result.length){let last=0;for(let i=0;i<result.length;i++){if(!trace(world,anchor,result[i],radius))last=i;else break;}anchor=result[last];out.push(anchor);result=result.slice(last+1);}return out;}
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
      const i=node.i+di,j=node.j+dj;if(i<0||i>nx||j<0||j>nz)continue;const nk=key(i,j),a=point(node.i,node.j),b=point(i,j);if(closed.has(nk)||!canStand(world,b,radius)||trace(world,a,b,radius))continue;
      const cost=node.g+distance(a,b);if(cost>=(scores.get(nk)??Infinity))continue;scores.set(nk,cost);parent.set(nk,k);open.push({i,j,g:cost,f:cost+distance(b,g.pt)});
    }
  }return [];
}
export function beginAttack(world,enemy,target,{windup=.65,range=78,damage=14}={}){
  if(world.paused||!finite(windup)||windup<=0||windup>5||!finite(range)||range<=0||range>150||!finite(damage)||damage<0||damage>40||!enemy.alive||enemy.phase==='windup'||enemy.clock>0||!target.alive||!visible(world,enemy,target)||trace(world,enemy,target)!==null||distance(enemy,target)>range)return false;
  enemy.phase='windup';enemy.clock=windup;enemy.aim={x:target.x,z:target.z,targetId:target.id,range,damage};return true;
}
export function followRoute(world,actor,goal,dt,speed){
  if(actor.waiting||!actor.alive)return;
  if(actor.routeRevision!==world.revision||!actor.route?.length||distance(actor.route.at(-1),goal)>40){actor.route=planRoute(world,actor,goal,actor.radius);actor.routeRevision=world.revision;}
  while(actor.route?.length&&distance(actor,actor.route[0])<3)actor.route.shift();const p=actor.route?.[0];if(!p)return;const d=distance(actor,p),step=Math.min(d,speed*dt);move(world,actor,(p.x-actor.x)/Math.max(1,d)*step,(p.z-actor.z)/Math.max(1,d)*step);
}
export function tick(world,delta,{ai=true}={}){
  if(world.paused)return;const dt=clamp(Number(delta)||0,0,.05);world.time+=dt;
  for(const tr of world.traces)tr.life-=dt;world.traces=world.traces.filter(t=>t.life>0);
  const player=world.actors.find(a=>a.kind==='player');
  for(const actor of world.actors){actor.invulnerable=Math.max(0,actor.invulnerable-dt);if(!actor.alive)continue;
    if(actor.phase==='windup'){
      actor.clock=Math.max(0,actor.clock-dt);if(actor.clock<=0){const aim=actor.aim,target=world.actors.find(a=>a.id===aim?.targetId),hit=target?.alive&&distance(target,aim)<target.radius+22&&distance(actor,target)<=aim.range+12&&visible(world,actor,target)&&trace(world,actor,target)===null;
        if(hit&&target.invulnerable<=0){target.hp=Math.max(0,target.hp-aim.damage);target.alive=target.hp>0;if(!target.alive){target.phase='dead';target.aim=null;}target.invulnerable=.9;world.events.push({type:'attack-hit',at:world.time});}else{world.stats.committedMisses++;world.events.push({type:'attack-miss',at:world.time});}
        actor.phase='recover';actor.clock=.85;actor.aim=null;}continue;
    }
    actor.clock=Math.max(0,actor.clock-dt);if(actor.phase==='recover'&&actor.clock===0)actor.phase='idle';
    if(!ai||!player?.alive)continue;
    if(actor.kind==='ally'&&actor.role==='sentry'){
      const target=world.actors.filter(a=>a.kind==='enemy'&&a.alive&&distance(actor,a)<=590&&visible(world,actor,a)&&trace(world,actor,a,0,{query:'projectile'})===null).sort((a,b)=>distance(actor,a)-distance(actor,b))[0];
      if(target&&actor.clock<=0&&actor.ammo>0){shoot(world,actor,target,{damage:18,range:600});actor.clock=.3;}continue;
    }
    if(actor.kind==='enemy'&&distance(actor,player)<560){if(!beginAttack(world,actor,player)&&actor.phase!=='recover')followRoute(world,actor,player,dt,actor.speed||58);}
    if((actor.kind==='ally'||actor.kind==='escort')&&distance(actor,player)>65){const slot=Math.max(0,world.actors.filter(a=>['ally','escort'].includes(a.kind)&&a.role!=='sentry').indexOf(actor));const goal={x:clamp(player.x-52-slot*35,actor.radius,world.scene.width-actor.radius),z:clamp(player.z+(slot%2?-26:26),actor.radius,world.scene.depth-actor.radius)};if(canStand(world,goal,actor.radius))followRoute(world,actor,goal,dt,actor.speed||100);}
  }
  if(player?.alive)for(const n of world.scene.nodes)if(!world.visited.includes(n.id)&&distance(player,n)<125&&visible(world,player,n))world.visited.push(n.id);
}
export function exportState(world){return {schema:SCHEMA,roomId:world.scene.id,geometry:world.geometry,time:world.time,doors:clone(world.doors),circuits:clone(world.circuits),visited:[...world.visited],stats:clone(world.stats),actors:world.actors.map(({id,x,z,hp,ammo,alive,invulnerable,phase,clock,aim,waiting})=>({id,x,z,hp,ammo,alive,invulnerable,phase,clock,aim:clone(aim),waiting}))};}
export function validateState(world,raw){
  const fail=m=>({ok:false,reason:m});
  if(!record(raw)||Object.keys(raw).some(k=>!['schema','roomId','geometry','time','doors','circuits','visited','stats','actors'].includes(k))||raw.schema!==SCHEMA||raw.roomId!==world.scene.id||raw.geometry!==world.geometry)return fail('Sauvegarde incompatible avec ce plan');
  if(!finite(raw.time)||raw.time<0||raw.time>1e8||!record(raw.doors)||!record(raw.circuits)||!Array.isArray(raw.actors)||raw.actors.length!==world.actors.length)return fail('Structure de sauvegarde invalide');
  if(Object.keys(raw.doors).length!==Object.keys(world.doors).length||Object.keys(raw.circuits).length!==Object.keys(world.circuits).length)return fail('Registre différent');
  for(const k of Object.keys(world.doors))if(!record(raw.doors[k])||Object.keys(raw.doors[k]).some(n=>!['open','powered'].includes(n))||typeof raw.doors[k].open!=='boolean'||typeof raw.doors[k].powered!=='boolean')return fail(`Porte invalide: ${k}`);
  for(const k of Object.keys(world.circuits))if(typeof raw.circuits[k]!=='boolean')return fail(`Circuit invalide: ${k}`);
  const shadow={...world,doors:raw.doors},seen=new Set();
  for(const a of raw.actors){if(!record(a)||Object.keys(a).some(k=>!['id','x','z','hp','ammo','alive','invulnerable','phase','clock','aim','waiting'].includes(k)))return fail('Propriété acteur inconnue');const def=world.actors.find(x=>x.id===a?.id);if(!def||seen.has(a.id))return fail('Acteur inconnu/dupliqué');seen.add(a.id);
    if(![a.x,a.z,a.hp,a.ammo,a.invulnerable,a.clock].every(finite)||a.hp<0||a.hp>100||a.ammo<0||a.ammo>999||!Number.isInteger(a.ammo)||a.invulnerable<0||a.invulnerable>2||a.clock<0||a.clock>10||typeof a.alive!=='boolean'||a.alive!==(a.hp>0)||typeof a.waiting!=='boolean')return fail(`État acteur invalide: ${a.id}`);
    if(!['idle','windup','recover','dead'].includes(a.phase)||(a.alive&&a.phase==='dead')||(!a.alive&&a.phase!=='dead')||!canStand(shadow,a,def.radius))return fail(`Position ou phase invalide: ${a.id}`);
    if(a.phase==='windup'){if(!record(a.aim)||Object.keys(a.aim).some(k=>!['x','z','targetId','range','damage'].includes(k))||![a.aim.x,a.aim.z,a.aim.range,a.aim.damage].every(finite)||!world.actors.some(t=>t.id===a.aim.targetId)||a.aim.range<1||a.aim.range>150||a.aim.damage<0||a.aim.damage>40)return fail('Attaque engagée invalide');}
    else if(a.aim!==null)return fail('Visée résiduelle invalide');
  }
  if(!Array.isArray(raw.visited)||raw.visited.some(id=>!world.scene.nodes.some(n=>n.id===id)))return fail('Carte invalide');
  if(!record(raw.stats)||Object.keys(raw.stats).length!==Object.keys(world.stats).length||Object.keys(world.stats).some(k=>!finite(raw.stats[k])||raw.stats[k]<0||raw.stats[k]>1e9))return fail('Statistiques invalides');
  return {ok:true};
}
export function importState(world,raw){const check=validateState(world,raw);if(!check.ok)return check;const value=clone(raw);world.time=value.time;world.doors=value.doors;world.circuits=value.circuits;world.visited=[...new Set(value.visited)];world.stats=value.stats;
  for(const state of value.actors){const a=world.actors.find(a=>a.id===state.id);Object.assign(a,state,{route:[],routeRevision:-1});}
  world.revision++;world.traces=[];world.events=[];world.paused=true;return {ok:true};
}
export function checkpoint(world){world.checkpoint=exportState(world);return clone(world.checkpoint);}
export function restart(world){return world.checkpoint?importState(world,world.checkpoint):{ok:false,reason:'Aucun point de reprise'};}
