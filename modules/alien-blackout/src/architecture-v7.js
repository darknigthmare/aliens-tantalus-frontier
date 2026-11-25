/* V7 projection expansion and transactional save envelope. All V6 resources retained. */
(()=>{'use strict';const D=BO_DATA,Parent=BO.BlackoutEngine,copy=BO.clone;
 class MendelEngine extends Parent{
  snapshot(){const p=super.snapshot();p.schema=7;p.version='0.7.0';p.state.v7={constructionRevision:1};return p;}
  restore(payload){const native=payload?.schema===7&&payload?.version==='0.7.0';
   if(native&&(!payload.state?.v7||payload.state.v7.constructionRevision!==1||Object.keys(payload.state.v7).length!==1))throw Error('Révision de construction v7 invalide.');
   if(!native&&(!Number.isInteger(payload?.schema)||payload.schema<1||payload.schema>6||payload.version!==`0.${payload.schema}.0`))throw Error('Sauvegarde Blackout v0.1 à v0.7 attendue.');
   const base=copy(payload);if(native){base.schema=6;base.version='0.6.0';delete base.state.v7;}
   const candidate=new Parent();candidate.restore(base);
   for(const c of candidate.crew){const d=D.crew.find(d=>d.id===c.id);c.role=d.role;c.fullName=d.fullName;c.description=d.description;c.local=[];c.pathKey=null;}
   for(const a of candidate.aliens){a.local=[];a.pathKey=null;}
   const cb=this.onEvent;for(const k of Object.keys(candidate))if(k!=='onEvent')this[k]=candidate[k];this.onEvent=cb;this.paused=true;
   this.emit('restore',native?'Liaison v0.7 restaurée en pause.':'Liaison importée en v0.7 : ressources conservées, trajets locaux recalculés.');return true;
  }
 }
 BO.BlackoutEngine=MendelEngine;BO.VERSION='0.7.0';
 const cache=new Map();
 function boxes(index){return new Map(D.chapters[index].rooms.map(id=>{const r=BO.rooms.get(id);return[id,{x:70+r.map[0]*218,y:61+r.map[1]*172,w:160,h:108}];}));}
 function anchor(b,side){return side==='W'?[b.x,b.y+b.h/2]:side==='E'?[b.x+b.w,b.y+b.h/2]:side==='N'?[b.x+b.w/2,b.y]:[b.x+b.w/2,b.y+b.h];}
 const shift=(p,s,k=23)=>[p[0]+(s==='W'?-k:s==='E'?k:0),p[1]+(s==='N'?-k:s==='S'?k:0)];
 function inRect(p,b,margin=8){return p[0]>b.x-margin&&p[0]<b.x+b.w+margin&&p[1]>b.y-margin&&p[1]<b.y+b.h+margin;}
 function segmentHits(a,b,r,margin=8){if(Math.abs(a[0]-b[0])<.01)return a[0]>r.x-margin&&a[0]<r.x+r.w+margin&&Math.max(a[1],b[1])>r.y-margin&&Math.min(a[1],b[1])<r.y+r.h+margin;return a[1]>r.y-margin&&a[1]<r.y+r.h+margin&&Math.max(a[0],b[0])>r.x-margin&&Math.min(a[0],b[0])<r.x+r.w+margin;}
 function route(index,ed){const bs=boxes(index),list=[...bs.values()],a=anchor(bs.get(ed.a),ed.pa),b=anchor(bs.get(ed.b),ed.pb),start=shift(a,ed.pa),end=shift(b,ed.pb);
  const xs=[...new Set([start[0],end[0],22,978,...list.flatMap(r=>[r.x-23,r.x+r.w+23])])].sort((a,b)=>a-b),ys=[...new Set([start[1],end[1],30,620,...list.flatMap(r=>[r.y-23,r.y+r.h+23])])].sort((a,b)=>a-b);
  const nodes=new Map();for(let xi=0;xi<xs.length;xi++)for(let yi=0;yi<ys.length;yi++){const p=[xs[xi],ys[yi]];if(p[0]>=16&&p[0]<=984&&p[1]>=28&&p[1]<=622&&!list.some(r=>inRect(p,r)))nodes.set(`${xi},${yi}`,{p,xi,yi,cost:Infinity,prev:null});}
  const sk=`${xs.indexOf(start[0])},${ys.indexOf(start[1])}`,ek=`${xs.indexOf(end[0])},${ys.indexOf(end[1])}`;if(!nodes.has(sk)||!nodes.has(ek))throw Error('Ancrage sans dégagement : '+ed.id);
  nodes.get(sk).cost=0;const todo=new Set(nodes.keys());
  while(todo.size){let u=null;for(const k of todo)if(u===null||nodes.get(k).cost<nodes.get(u).cost)u=k;const n=nodes.get(u);if(!Number.isFinite(n.cost))break;todo.delete(u);if(u===ek)break;
   for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const nk=`${n.xi+dx},${n.yi+dy}`,v=nodes.get(nk);if(!v||!todo.has(nk)||list.some(r=>segmentHits(n.p,v.p,r)))continue;const cost=n.cost+Math.hypot(n.p[0]-v.p[0],n.p[1]-v.p[1]);if(cost<v.cost){v.cost=cost;v.prev=u;}}
  }
  if(!Number.isFinite(nodes.get(ek).cost))throw Error('Raccord impossible : '+ed.id);
  const inner=[];for(let k=ek;k;k=nodes.get(k).prev)inner.unshift(nodes.get(k).p);const raw=[a,...inner,b],out=[];
  for(const p of raw){while(out.length>=2){const q=out.at(-1),z=out.at(-2);if((p[0]-q[0])*(q[1]-z[1])===(p[1]-q[1])*(q[0]-z[0]))out.pop();else break;}out.push(p);}
  return {edge:ed.id,a:ed.a,b:ed.b,points:out,returnGallery:ed.pa===ed.pb};
 }
 function routes(index){if(!cache.has(index))cache.set(index,D.edges.filter(e=>e.chapter===index).map(e=>route(index,e)));return cache.get(index);}
 function audit(engine){const results=[],add=(name,pass,detail='')=>results.push({name,pass:!!pass,detail});
  add('56 identifiants de pièce uniques',D.rooms.length===56&&new Set(D.rooms.map(r=>r.id)).size===56);
  add('66 identifiants de cloison uniques',D.edges.length===66&&new Set(D.edges.map(e=>e.id)).size===66);
  for(const r of D.rooms){add(r.id+' / embranchements cohérents',r.view==='DEPTH'||(!r.ports.N&&!r.ports.S));
   const targets=[...r.construction.thresholds.map(t=>({id:t.edge,p:{x:t.foot[0],y:t.foot[1]}})),...r.hide.map(([x,y],i)=>({id:'casier-'+i,p:{x,y}})),...r.hide.map((p,i)=>({id:'poste-'+i,p:{x:r.terminal[0]+(i-1.5)*32,y:r.terminal[1]}}))];
   for(const t of r.construction.thresholds){const pt=BO.port(r.id,t.side);add(r.id+' / '+t.edge+' / paroi et physique',pt.x===t.foot[0]&&pt.y===t.foot[1]&&t.mount.startsWith('paroi-'));const [ox,oy]=t.opening;add(r.id+' / '+t.edge+' / ouverture dans sa paroi',(t.side==='W'&&ox===50||t.side==='E'&&ox===950||t.side==='N'&&oy===340||t.side==='S'&&oy===502)&&Math.hypot(ox-pt.x,oy-pt.y)<=15);}
   for(const t of targets)add(r.id+' / '+t.id+' / dégagement',BO.validPoint(r.id,t.p));
   for(const t of targets)for(const u of r.construction.thresholds){const start=BO.port(r.id,u.side),p=BO.localPath(r.id,start,t.p);let prev=start;const ok=p&&p.every(q=>{const good=BO.validPoint(r.id,q)&&!r.obstacles.some(o=>BO.blocked(prev,q,o));prev=q;return good;});add(r.id+' / '+u.edge+' → '+t.id,ok);}
   for(const o of r.obstacles)add(r.id+' / '+o.id+' / rendu-sol',r.props.some(p=>p.obstacleId===o.id&&p.x===o.x&&p.y===o.y+o.h));
   if(engine)for(let i=0;i<4;i++){const p=engine.carePoint(r.id,i);add(r.id+' / point de soins '+i,!!p&&BO.validPoint(r.id,p));}
  }
  for(const ed of D.edges){const a=BO.rooms.get(ed.a),b=BO.rooms.get(ed.b);add(ed.id+' / réciprocité',a?.ports[ed.pa]?.edge===ed.id&&b?.ports[ed.pb]?.edge===ed.id&&a.ports[ed.pa].room===b.id&&b.ports[ed.pb].room===a.id);add(ed.id+' / même secteur',a?.chapter===b?.chapter&&a?.chapter===ed.chapter);}
  const reach=(start,goal,withTransfers=false)=>{const visited=new Set([start]),queue=[start];while(queue.length){const id=queue.shift();if(id===goal)return true;const next=Object.values(BO.rooms.get(id).ports).map(p=>p.room);if(withTransfers)next.push(...D.fidelity.transfers.filter(t=>t.from===id).map(t=>t.to));for(const n of next)if(!visited.has(n)){visited.add(n);queue.push(n);}}return false;};
  for(const ch of D.chapters){for(const a of ch.rooms)for(const b of ch.rooms)add(ch.id+' / connexité '+a+' → '+b,reach(a,b));for(const [a,b]of ch.vents)add(ch.id+' / gaine '+a+' ↔ '+b,ch.rooms.includes(a)&&ch.rooms.includes(b)&&a!==b);
   for(const rr of routes(ch.number*1-1)){const bs=boxes(ch.number*1-1);let ok=true;for(let i=1;i<rr.points.length;i++){const a=rr.points[i-1],b=rr.points[i];for(const [id,r]of bs){if(i===1&&id===rr.a||i===rr.points.length-1&&id===rr.b)continue;if(segmentHits(a,b,r,0))ok=false;}}add(rr.edge+' / raccord hors volumes',ok);}
  }
  for(const r of D.rooms)add('Progression station vers '+r.id,reach(D.chapters[0].entry,r.id,true));
  const failed=results.filter(r=>!r.pass);return{version:'0.7.0',scope:'Construction du module seulement ; pas validation des plans officiels.',passed:results.length-failed.length,failed:failed.length,tests:results};
 }
 globalThis.BO_ARCH={audit,routes,boxes,anchor,segmentHits};
})();
