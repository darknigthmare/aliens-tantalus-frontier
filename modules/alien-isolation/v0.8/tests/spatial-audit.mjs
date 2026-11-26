import fs from 'node:fs';
import {CONTENT} from '../src/content.js';
import {IsolationEngine,ROOMS,doors,route,walkable,pathTo,distance,safePosition} from '../src/engine.js';
const failures=[], rows=[], assertion=(ok,text)=>{if(!ok)failures.push(text);return !!ok;};
const e=new IsolationEngine();let anchors=0,localPaths=0,segments=0;
function segment(room,a,b){const n=Math.max(1,Math.ceil(distance(a,b)/4));for(let i=0;i<=n;i++){segments++;if(!walkable(room,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,14))return false;}return true;}
for(const r of CONTENT.rooms){const before=failures.length,ds=doors(r.id),targets=[...ds.map(d=>({...d.point,id:d.id,type:'door'})),...CONTENT.goals.filter(g=>g.room===r.id),...CONTENT.optional.filter(g=>g.room===r.id),...CONTENT.logs.filter(g=>g.room===r.id).map(g=>({...g,x:r.w*.38,y:r.view==='SIDE'?300:170,type:'archive'})),...r.props.filter(p=>p.interactive).map(p=>({...p,type:'prop'}))];
 assertion(route('t_cryo',r.id,e.s,true)!==null,`${r.id}: disconnected`);
 for(const d of ds){const m=d.portal;anchors++;
 assertion(m&&m.labelId===d.spatial.labelId,`${r.id}/${d.id}: missing descriptor`);
 assertion(m.wall==='L'?m.x===35:m.wall==='R'?m.x===r.w-35:m.y===100,`${r.id}/${d.id}: opening not on wall`);
 assertion(walkable(r.id,d.point.x,d.point.y),`${r.id}/${d.id}: blocked approach`);
 assertion(segment(r.id,d.point,m.arrival),`${r.id}/${d.id}: blocked arrival corridor`);
 assertion(doors(d.destination).some(x=>x.id===d.id&&x.destination===r.id),`${r.id}/${d.id}: non-reciprocal`);
 }
 const rear=ds.filter(d=>d.point.wall==='N');for(let a=0;a<rear.length;a++)for(let b=a+1;b<rear.length;b++)assertion(Math.abs(rear[a].portal.x-rear[b].portal.x)>=205,`${r.id}: overlapping facades ${rear[a].id}/${rear[b].id}`);
 for(const start of ds){for(const t of targets){localPaths++;const end=safePosition(r.id,t),p=pathTo(r.id,start.portal.arrival,end);if(!assertion(p.length>0,`${r.id}: no route ${start.id} -> ${t.id}`))continue;
 let last=start.portal.arrival;for(const q of p){if(!assertion(segment(r.id,last,q),`${r.id}: path crosses obstacle ${start.id} -> ${t.id} (${last.x},${last.y} -> ${q.x},${q.y})`))break;last=q;}
 assertion(distance(end,{x:t.x,y:r.view==='SIDE'?300:t.y})<87,`${r.id}/${t.id}: no usable interaction proximity`);
 }}
 rows.push({id:r.id,name:r.name,deck:r.deck,view:r.view,doors:ds.length,targets:targets.length,pass:before===failures.length,failures:failures.slice(before)});
}
for(const l of CONTENT.links){if(l.kind==='door')assertion(ROOMS[l.a].deck===ROOMS[l.b].deck,`${l.id}: ordinary door changes level`);if(l.kind==='stairs')assertion(ROOMS[l.a].deck!==ROOMS[l.b].deck,`${l.id}: stair at same level`);}
const report={version:CONTENT.meta.version,rooms:rows.length,links:CONTENT.links.length,anchors,localPaths,samples:segments,failures,pass:!failures.length,rows,scope:'Structural graph ignores story locks. Local routes use real player radius and sampled path segments. This is not a full active-enemy campaign.'};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/spatial-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,rows:undefined,failures:failures.slice(0,30)},null,2));process.exitCode=failures.length?1:0;
