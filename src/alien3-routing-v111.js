/** Bounded route choice for the existing prisoners, not a new graph or a new mission.
 * A route is a transient plan; actors always move through the original canonical legs.
 * Never treats art as collision, opens a door, enters a vent, or changes an arrival flag.
 */
import {center105,feet105,finite105,delta105,clamp105,gateOpenV105,closedBetweenV105,moveActorV105} from './alien3-navigation-v105.js';
import {unsafeCrewStepV110,safeCrewMoveV110} from './alien3-traffic-v110.js';
import {STEAM_RULES_V109} from './alien3-steam-v109.js';
export const ROUTE_RULES_V111=Object.freeze({reviewSeconds:.45,choiceAdvantage:.40,doorPatience:1.2,maxRatio:2.5,maxExtra:1800,noticeCooldown:6.5,noticeDistance:440,noticeHeight:30,bodySample:16});
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),integer=x=>Number.isSafeInteger(x)&&x>=0&&x<=1e7;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),footPoint=a=>({x:center105(a),y:feet105(a)}),poseAt=(a,p)=>({...a,x:p.x-a.w/2,y:p.y-a.h});
export function canonicalLegsV111(model,fromId,toId,edge){const a=model.nodeById.get(fromId),b=model.nodeById.get(toId);if(!a||!b||!edge)return null;
 if(!((edge.from===fromId&&edge.to===toId)||(!edge.oneWay&&edge.to===fromId&&edge.from===toId)))return null;
 if(['ladder','lift','vent'].includes(edge.kind)&&a.y!==b.y){const from=model.nodeById.get(edge.from),to=model.nodeById.get(edge.to),x=finite105(edge.connectorOffsetFromTo)?to.x+edge.connectorOffsetFromTo:(from.x+to.x)/2;return [{x,y:a.y},{x,y:b.y},{x:b.x,y:b.y}];}return [{x:b.x,y:b.y}];}
export function pathLengthV111(start,points){let n=0,a=start;for(const b of points){n+=distance(a,b);a=b;}return n;}
function segmentRisk(actor,a,b,doors,fields){const A=poseAt(actor,a),B=poseAt(actor,b),door=closedBetweenV105({x:a.x,y:a.y-actor.h*.5},{x:b.x,y:b.y-actor.h*.5},doors,actor.w/2);if(door)return {type:'door',id:door.id};
 // Use the same body/steam test as the movement guard. Split long inside exits so a path
 // cannot claim to "leave" a plume by crossing through its hotter centre.
 const length=distance(a,b),steps=Math.max(1,Math.ceil(length/ROUTE_RULES_V111.bodySample));let before=A;
 for(let j=1;j<=steps;j++){const t=j/steps,after=j===steps?B:poseAt(actor,{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});const risk=unsafeCrewStepV110(before,after,fields);if(risk)return {type:'steam',id:risk.id,remaining:Math.max(0,(risk.remaining||0)-STEAM_RULES_V109.tailSeconds)};before=after;}return null;}
export function routeRiskV111(actor,start,points,doors,fields){let a=start;for(const b of points){const risk=segmentRisk(actor,a,b,doors,fields);if(risk)return risk;a=b;}return null;}
function edgeAllowed(model,actor,id,link,doors,fields){if(link.edge.kind==='vent')return false;const door=doors.find(d=>d.id===(link.edge.gateId||link.edge.id));if(door&&!gateOpenV105(door))return false;const a=model.nodeById.get(id),pts=canonicalLegsV111(model,id,link.next,link.edge);return pts&&!routeRiskV111(actor,a,pts,doors,fields);}
export function routingGraphV111(model,actor,doors=[],fields=[]){const adj=new Map();for(const n of model.nodes)adj.set(n.id,(model.adj.get(n.id)||[]).filter(l=>edgeAllowed(model,actor,n.id,l,doors,fields)));return {...model,adj};}
export function routeV111(model,from,to){if(!model.nodeById.has(from)||!model.nodeById.has(to))return null;if(from===to)return{nodes:[from],edges:[],length:0};const open=new Set([from]),cost=new Map([[from,0]]),previous=new Map();let visits=0;
 while(open.size&&visits++<=model.nodes.length*3){let id=null;for(const x of open)if(id===null||cost.get(x)<cost.get(id)-1e-8||Math.abs(cost.get(x)-cost.get(id))<1e-8&&x<id)id=x;open.delete(id);if(id===to)break;for(const l of model.adj.get(id)||[]){const points=canonicalLegsV111(model,id,l.next,l.edge);if(!points)continue;const nextCost=cost.get(id)+pathLengthV111(model.nodeById.get(id),points);if(nextCost<(cost.get(l.next)??Infinity)-1e-8){cost.set(l.next,nextCost);previous.set(l.next,{id,edge:l.edge.id});open.add(l.next);}}}
 if(!previous.has(to))return null;const nodes=[to],edges=[];let id=to;for(let n=0;id!==from&&n<=model.nodes.length;n++){const p=previous.get(id);if(!p)return null;nodes.unshift(p.id);edges.unshift(p.edge);id=p.id;}return id===from?{nodes,edges,length:cost.get(to)}:null;}
export function actorEndpointsV111(actor,model){const n=actor?.nav;if(!n||!model.nodeById.has(n.nodeId))return[];if(!n.nextId){const a=model.nodeById.get(n.nodeId);return distance(footPoint(actor),a)<=4?[{id:n.nodeId,reverse:false,points:[],length:0}]:[];}
 const edge=model.edges.find(e=>e.id===n.edgeId),points=canonicalLegsV111(model,n.nodeId,n.nextId,edge);if(!points||!Number.isInteger(n.leg)||n.leg<0||n.leg>=points.length)return[];const here=footPoint(actor),start=model.nodeById.get(n.nodeId),remaining=points.slice(n.leg);const out=[{id:n.nextId,reverse:false,points:remaining,length:pathLengthV111(here,remaining)}];
 if(!edge.oneWay){const reverse=[{x:start.x,y:start.y},...points.slice(0,n.leg)].reverse();out.push({id:n.nodeId,reverse:true,points:reverse,length:pathLengthV111(here,reverse)});}return out;}
function bestCandidate(actor,goal,model,doors,fields){let best=null;for(const end of actorEndpointsV111(actor,model)){if(routeRiskV111(actor,footPoint(actor),end.points,doors,fields))continue;const route=routeV111(model,end.id,goal);if(!route)continue;const length=end.length+route.length,c={endpoint:end.id,reverse:end.reverse,approach:end.points,route,length};if(!best||length<best.length-1e-7)best=c;}return best;}
export function chooseCrewRouteV111(actor,goal,model,doors,fields,{speed=105}={}){if(!actor?.alive||!model.nodeById.has(goal)||!finite105(speed)||speed<=0)return {choice:'wait',reason:'invalid'};
 const hot=fields.filter(f=>f.hot&&f.w>0),normal=routingGraphV111(model,actor,doors,[]),safe=hot.length?routingGraphV111(model,actor,doors,hot):normal;
 const base=bestCandidate(actor,goal,normal,doors,[]),candidate=bestCandidate(actor,goal,safe,doors,hot);if(!candidate)return{choice:'wait',reason:base?'steam':'door',baseline:base};
 // If the baseline is safe already, preserving it avoids needless circuiting.
 let risks=[];if(base){let point=footPoint(actor);for(const p of base.approach){const risk=routeRiskV111(actor,point,[p],doors,hot);if(risk)risks.push(risk);point=p;}
 for(let j=0;j<base.route.edges.length;j++){const edge=model.edges.find(e=>e.id===base.route.edges[j]),a=model.nodeById.get(base.route.nodes[j]);const risk=routeRiskV111(actor,a,canonicalLegsV111(model,a.id,base.route.nodes[j+1],edge),doors,hot);if(risk)risks.push(risk);}}
 const hotWait=Math.max(0,...risks.map(r=>r.remaining||0)),waitETA=(base?.length??Infinity)/speed+hotWait,detourETA=candidate.length/speed;
 if(base&&candidate.length>base.length*ROUTE_RULES_V111.maxRatio&&candidate.length-base.length>ROUTE_RULES_V111.maxExtra)return{choice:'wait',reason:'long-detour',baseline:base};
 if(base&&risks.length&&detourETA+ROUTE_RULES_V111.choiceAdvantage>=waitETA)return{choice:'wait',reason:'short-jet',baseline:base,waitETA,detourETA};
 return {choice:risks.length||candidate.reverse?'detour':'clear',reason:candidate.reverse?'return-to-junction':risks.length?'avoid-heat':'passable',plan:candidate,graph:safe,waitETA,detourETA};}
function signature(doors,fields,a,goal){return JSON.stringify([goal,a.w,a.h,a.depth??1,doors.map(d=>[d.id,d.x,d.y,d.w,d.h,gateOpenV105(d)]),fields.filter(f=>f.hot).map(f=>[f.id,f.x,f.y,f.w,f.h,f.depth,f.foot])]);}
export function createRoutesV111(enc,model){return {schema:111,signature:model.signature,sequence:enc?.mode||'inspection',memory:{},noticeClock:0,stats:{reviews:0,detours:0,retreats:0,routeStops:0,waitChoices:0,arrivalsAfterDetour:0}};}
function commitActor(a,b){for(const k of ['x','y','vx','vy','facing','nav','moving','blocked'])a[k]=b[k];}
function reverseCurrent(a,model){const n=a.nav;if(!n?.nextId)return true;const e=model.edges.find(e=>e.id===n.edgeId);if(!e||e.oneWay)return false;const from=n.nodeId,to=n.nextId,leg=n.leg;n.nodeId=to;n.nextId=from;n.points=canonicalLegsV111(model,to,from,e);n.leg=Math.max(0,n.points.length-1-leg);return true;}
/** Commit only canonical navigation fields. The legacy owner still decides ready/armed/completed. */
function advanceRoute(a,goal,model,graph,doors,fields,dt,speed){let budget=speed*delta105(dt),moved=0,guard=0;const trial=structuredClone(a);trial.moving=false;trial.blocked=false;
 while(budget>1e-8&&guard++<16){const n=trial.nav;if(!n.nextId){if(n.nodeId===goal)break;const r=routeV111(graph,n.nodeId,goal);if(!r||r.nodes.length<2){trial.blocked=true;break;}const e=model.edges.find(e=>e.id===r.edges[0]);n.nextId=r.nodes[1];n.edgeId=e.id;n.points=canonicalLegsV111(model,n.nodeId,n.nextId,e);n.leg=0;}
 const point=n.points[n.leg],here=footPoint(trial),length=distance(here,point);if(length<.001){n.leg++;if(n.leg>=n.points.length){n.nodeId=n.nextId;n.nextId=null;n.edgeId=null;n.points=[];n.leg=0;}continue;}
 const amount=Math.min(length,budget),dest={x:here.x+(point.x-here.x)*amount/length,y:here.y+(point.y-here.y)*amount/length},next=poseAt(trial,dest),risk=routeRiskV111(trial,here,[dest],doors,fields);if(risk){commitActor(a,trial);a.moving=moved>0;a.blocked=risk.type==='door';if(!moved)a.vx=a.vy=0;return {moved,arrived:false,waiting:risk.type==='steam',siteId:risk.id,risk};}
 trial.x=next.x;trial.y=next.y;trial.vx=(dest.x-here.x)/delta105(dt);trial.vy=(dest.y-here.y)/delta105(dt);if(Math.abs(trial.vx)>.01)trial.facing=Math.sign(trial.vx);trial.moving=true;moved+=amount;budget-=amount;
 }
 if(!trial.moving)trial.vx=trial.vy=0;commitActor(a,trial);return {moved,arrived:a.nav.nodeId===goal&&!a.nav.nextId,waiting:false};}
export function routedCrewMoveV111(state,a,goal,model,doors,dt,fields,{speed=105,held=false}={}){const sec=delta105(dt);if(!sec||!a?.alive||!goal)return{moved:0,arrived:false,waiting:false};
 const mem=state.memory[a.id]||={cooldown:0,key:null,active:false,hasDetoured:false,decision:null,goal};if(held){a.moving=false;a.vx=a.vy=0;mem.cooldown=0;mem.key=null;return{moved:0,arrived:false,waiting:false,held:true};}
 mem.cooldown=Math.max(0,mem.cooldown-sec);const hot=fields.filter(f=>f.hot),key=signature(doors,hot,a,goal),changed=mem.key!==key||mem.goal!==goal;
 if(!hot.length&&!mem.active){const trial=structuredClone(a),result=safeCrewMoveV110(trial,goal,model,doors,sec,[],{speed});const risk=result.moved>0?routeRiskV111(a,footPoint(a),[footPoint(trial)],doors,[]):null;if((!trial.blocked||result.moved>0)&&!risk){commitActor(a,trial);return result;}a.blocked=true;a.moving=false;a.vx=a.vy=0;}
 if(changed||mem.cooldown<=0){const choice=chooseCrewRouteV111(a,goal,model,doors,hot,{speed});state.stats.reviews++;mem.cooldown=ROUTE_RULES_V111.reviewSeconds;mem.key=key;mem.goal=goal;mem.decision=choice.reason;
  if(choice.plan&&(choice.choice==='detour'||mem.active||a.blocked)){
   if(choice.plan.reverse&&a.nav.nextId){reverseCurrent(a,model);state.stats.retreats++;}
   if(!mem.active){state.stats.detours++;mem.hasDetoured=true;}
   mem.active=true;mem.graph=choice.graph;
  }else if(choice.choice==='wait'){
   if(mem.decision!==mem.previousWait)state.stats.waitChoices++;
   mem.previousWait=choice.reason;if(mem.active)state.stats.routeStops++;mem.active=false;mem.graph=null;
  }else if(mem.active)mem.graph=choice.graph;
 }
 let result;if(mem.active)result=advanceRoute(a,goal,model,mem.graph,doors,hot,sec,speed);else result=safeCrewMoveV110(a,goal,model,doors,sec,hot,{speed});
 // Per-step guard is unconditional; full searches stay cadence-bounded.
 if(result.arrived&&mem.hasDetoured){state.stats.arrivalsAfterDetour++;mem.hasDetoured=false;mem.active=false;}
 return {...result,decision:mem.decision,detouring:mem.active};}
export function snapshotRoutesV111(s){return s?{schema:111,signature:s.signature,sequence:s.sequence,stats:structuredClone(s.stats)}:null;}
export function validateRoutesV111(raw,enc,model){const fail=reason=>({ok:false,reason});if(!object(raw)||raw.schema!==111||raw.signature!==model.signature||raw.sequence!==(enc?.mode||'inspection'))return fail('identity');const state=createRoutesV111(enc,model);if(!object(raw.stats)||Object.keys(state.stats).some(k=>!integer(raw.stats[k])))return fail('stats');if(raw.stats.detours>raw.stats.reviews||raw.stats.arrivalsAfterDetour>raw.stats.detours||raw.stats.retreats>raw.stats.reviews)return fail('accounting');state.stats=Object.fromEntries(Object.keys(state.stats).map(k=>[k,raw.stats[k]]));return{ok:true,state};}
export const ROUTE_DESIGN_V111=Object.freeze([
 ['choice','Choisir un passage','Les détenus peuvent comparer un détour praticable à l’attente devant un jet bref. Ni une nouvelle route ni un ordre de réussite ne sont créés.'],
 ['position','Partir du corps réel','Au milieu d’un segment, continuer ou revenir est évalué depuis la position courante. Les coordonnées ne sont jamais replacées sur un nœud.'],
 ['one-way','Sens de passage','Un segment à sens unique ne peut pas être inversé, même pour éviter une porte.'],
 ['vents','Conduits interdits au groupe','Les détenus n’empruntent pas les conduits du Runner.'],
 ['doors','Même porte pour le corps et le trajet','La géométrie du battant et son état coupent les segments praticables, pas seulement son identifiant de graphe.'],
 ['plume','Volume commun','Le volume chaud de V109 et la marge corporelle de V110 servent au choix comme au pas final.'],
 ['wait','Attendre peut rester le meilleur choix','Une courte purge peut finir avant qu’un grand détour soit terminé. L’algorithme garde alors l’attente prudente.'],
 ['ratio','Ne pas faire le tour du complexe','Un détour disproportionné est refusé au lieu d’envoyer le groupe à l’autre bout du niveau.'],
 ['review','Revoir à cadence bornée','Un changement de porte ou de volume déclenche une révision ; un état stable est réévalué au plus toutes les 0,45 secondes.'],
 ['hold','G reste prioritaire','Un ordre volontaire arrête immédiatement le déplacement et son choix de route. Repartir réévalue la situation sans oublier la pose.'],
 ['arrival','Tenir son poste physiquement','L’arrivée reste constatée par le propriétaire historique, au point réel et sans segment restant.'],
 ['pause','Pas de calcul actif dans les menus','Pause, plan, archives et chargement suspendent la navigation et ses alertes.'],
 ['save','Sauver la position, pas une ancienne route','Les poses et segments sont sauvegardés par V105 ; les caches de détour sont recalculés après import en pause.'],
 ['safe','Poste sûr indépendant','Le poste sûr conserve son registre propre et ne récupère pas les décisions de l’état courant.'],
 ['sound','Bruit de pas réel','La distance réellement parcourue alimente les pas ; réfléchir ou attendre reste silencieux.'],
 ['scope','Portée de cette passe','Navigation prudente des deux détenus, pas de panique, blessure, arme ou remplacement de l’IA du Runner.']
].map(([id,title,text])=>Object.freeze({id:'v111-'+id,title,text})));
