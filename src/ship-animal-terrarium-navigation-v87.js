// Authored, visible terrarium supports. Speeds are gameplay values, not care advice.
// Saves retain node identities and time, never mutable support geometry.
const freeze = value => { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } return value; };
export const SHIP_MICA_TERRARIUM_GRAPH_V87 = freeze({
  schema: 87, id: 'mica-terrarium-supports-v87', habitatId: 'mica-terrarium-v87', actorId: 'animal-mica',
  hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care',
  bounds: { x: 1790, y: 548, w: 104, h: 64 }, body: { w: 20, h: 10 },
  nodes: [{ id: 'bed', x: 1800, y: 612 }, { id: 'food', x: 1816, y: 612 },
    { id: 'branch-foot', x: 1830, y: 612 }, { id: 'branch-top', x: 1864, y: 582 }, { id: 'perch', x: 1880, y: 582 }],
  edges: [{ id: 'floor-bed-food', from: 'bed', to: 'food', movement: 'walk', speed: 10 },
    { id: 'floor-food-branch', from: 'food', to: 'branch-foot', movement: 'walk', speed: 10 },
    { id: 'inclined-branch', from: 'branch-foot', to: 'branch-top', movement: 'climb', speed: 7 },
    { id: 'raised-perch', from: 'branch-top', to: 'perch', movement: 'walk', speed: 10 }]
});
const G = SHIP_MICA_TERRARIUM_GRAPH_V87, EPS = 1e-7;
const finite = v => typeof v === 'number' && Number.isFinite(v);
const near = (a,b) => finite(a) && finite(b) && Math.abs(a-b) <= EPS;
const record = v => v && typeof v === 'object' && !Array.isArray(v);
const place = n => ({ kind: 'resident', hubId: G.hubId, deckId: G.deckId, roomId: G.roomId, x: n.x, y: n.y });
const nodeFor = p => G.nodes.find(n => near(n.x,p?.x) && near(n.y,p?.y));
const nodeId = key => G.nodes.find(n => n.id === key);
const inside = p => record(p) && p.hubId === G.hubId && p.deckId === G.deckId && p.roomId === G.roomId
  && finite(p.x) && finite(p.y) && p.x-G.body.w/2 >= G.bounds.x-EPS && p.x+G.body.w/2 <= G.bounds.x+G.bounds.w+EPS
  && p.y-G.body.h >= G.bounds.y-EPS && p.y <= G.bounds.y+G.bounds.h+EPS;
export function getMicaTerrariumTargetV87(next) {
  const n = nodeId(next === 'food' ? 'food' : next === 'stroll' ? 'perch' : next === 'bed' ? 'bed' : null);
  return n ? place(n) : null;
}
export function isMicaTerrariumPointV87(p, { stationary = false } = {}) {
  if (!inside(p) || (p.kind !== undefined && p.kind !== 'resident')) return false;
  if (stationary) return Boolean(nodeFor(p));
  return G.edges.some(e => { const a=nodeId(e.from), b=nodeId(e.to), t=(p.x-a.x)/(b.x-a.x);
    return t>=-EPS && t<=1+EPS && near(p.y,a.y+(b.y-a.y)*t); });
}
function segmentsFor(fromId,toId) {
  let i=G.nodes.findIndex(n=>n.id===fromId); const last=G.nodes.findIndex(n=>n.id===toId);
  if(i<0||last<0)return null;
  const direction=Math.sign(last-i),segments=[];
  while(i!==last) { const next=i+direction,a=G.nodes[i],b=G.nodes[next],e=G.edges[Math.min(i,next)];
    segments.push({id:e.id,from:a,to:b,duration:Math.hypot(b.x-a.x,b.y-a.y)/e.speed,facing:direction,
      clipId:e.movement==='climb'?(b.y<a.y?'climbUp':'climbDown'):'walk'}); i=next; }
  return segments;
}
const ROUTE_KEYS = ['schema','kind','graphId','actorId','habitatId','fromNodeId','toNodeId','duration','elapsed','simulationTime','status'];
function validRoute(r) {
  if(!record(r)||Object.keys(r).some(k=>!ROUTE_KEYS.includes(k))||r.schema!==87||r.kind!=='terrarium-volume'||r.graphId!==G.id||r.actorId!==G.actorId||r.habitatId!==G.habitatId
    ||!['moving','arrived'].includes(r.status)||!finite(r.elapsed)||r.elapsed<0||!finite(r.duration)||r.duration<0
    ||!finite(r.simulationTime)||r.simulationTime<0||r.elapsed>r.duration+EPS||r.simulationTime+EPS<r.elapsed)return null;
  const s=segmentsFor(r.fromNodeId,r.toNodeId);
  if(!s||!near(r.duration,s.reduce((n,e)=>n+e.duration,0))||(r.status==='arrived')!==(r.elapsed>=r.duration))return null;
  return s;
}
export function planMicaTerrariumRouteV87(from,to,{ simulationTime=0 }={}) {
  if(!isMicaTerrariumPointV87(from,{stationary:true})||!isMicaTerrariumPointV87(to,{stationary:true})||!finite(simulationTime)||simulationTime<0)
    return {ok:false,reason:'terrarium-support-required'};
  const fromNodeId=nodeFor(from).id,toNodeId=nodeFor(to).id,duration=segmentsFor(fromNodeId,toNodeId).reduce((n,e)=>n+e.duration,0);
  return {ok:true,state:{schema:87,kind:'terrarium-volume',graphId:G.id,actorId:G.actorId,habitatId:G.habitatId,
    fromNodeId,toNodeId,duration,elapsed:0,simulationTime,status:duration===0?'arrived':'moving'}};
}
export function sampleMicaTerrariumRouteV87(r) {
  const segments=validRoute(r); if(!segments)return null;
  if(r.status==='arrived')return {location:place(nodeId(r.toNodeId)),clipId:'idle',facing:segments.at(-1)?.facing||1,segmentId:null,elapsed:0};
  let elapsed=r.elapsed;
  for(const s of segments){ if(elapsed>=s.duration){elapsed-=s.duration;continue;} const t=elapsed/s.duration;
    return {location:place({x:s.from.x+(s.to.x-s.from.x)*t,y:s.from.y+(s.to.y-s.from.y)*t}),clipId:s.clipId,
      facing:s.facing,segmentId:s.id,elapsed}; }
  return null;
}
export function stepMicaTerrariumRouteV87(r,delta,{ paused=false,blocked=false }={}) {
  if(!validRoute(r)||!finite(delta)||delta<0||delta>.25)return {ok:false,reason:'invalid-terrarium-route'};
  const state=structuredClone(r);
  if(paused||blocked||delta===0||state.status==='arrived')return {ok:true,changed:false,state,consumed:0};
  const consumed=Math.min(delta,state.duration-state.elapsed); state.elapsed+=consumed; state.simulationTime+=consumed;
  if(state.elapsed+EPS>=state.duration){state.elapsed=state.duration;state.status='arrived';}
  return {ok:true,changed:true,state,consumed};
}
