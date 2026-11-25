/** Additional local delivery checks. Annex tests start from explicit story fixtures;
 * travel is simulated using normal movement and interact inputs, no teleport between exits. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {DATA} from '../src/oth-v1/oth-data.js';
import * as E from '../src/oth-v1/oth-engine.js';
const checks=[];
async function test(name,fn){try{const details=await fn();checks.push({name,ok:true,details:details??null});}catch(e){checks.push({name,ok:false,error:e.stack});}}
const goals=DATA.chapters.flatMap(c=>c.objectives);
function fixture(n,id){let s=E.createState('assisted');s.room=id;s.completed=goals.slice(0,n).map(o=>o.id);s=E.restore(E.serialize(s));s.player.x=E.ROOM[id].width/2;s.player.y=88;return s;}
function walk(s,x,y=88){let frames=0;while(Math.hypot(s.player.x-x,s.player.y-y)>5){if(++frames>4000)throw new Error('Trajet bloqué '+s.room);E.step(s,{x:Math.max(-1,Math.min(1,(x-s.player.x)/15)),y:Math.max(-1,Math.min(1,(y-s.player.y)/15)),sprint:true},.05);assert.ok(!s.dead);}return frames;}
function cross(s,p){let frames=walk(s,p.x,p.y),old=s.room;while(s.room===old){if(++frames>4100)throw new Error('Porte inactive '+p.id);E.step(s,{interact:true},.05);if(s.reading)s.reading=null;}assert.equal(s.room,p.target);return frames;}
for(const [id,n] of [['rec',0],['maintenance',9],['drain',21],['alcove',27]]){
 for(const p of E.ROOM[id].portals.filter(p=>!p.repair)){await test('Passage physique aller-retour : '+id+' ↔ '+p.target,()=>{const s=fixture(n,id);let frames=cross(s,p);const back=E.ROOM[s.room].portals.find(q=>q.edge===p.edge);frames+=cross(s,back);assert.equal(s.room,id);return{frames,transitions:2,seededGoals:n};});}
}
const server=spawn(process.execPath,[new URL('../tools/serve.mjs',import.meta.url).pathname,'4179'],{stdio:['ignore','pipe','pipe']});
let stderr='';server.stderr.on('data',x=>stderr+=x);
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Serveur : timeout '+stderr)),5000);server.once('error',reject);server.stdout.once('data',()=>{clearTimeout(timeout);resolve();});});
 const base='http://127.0.0.1:4179';
 await test('Serveur local : page autonome en HTTP 200',async()=>{const r=await fetch(base);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);const body=await r.text();assert.ok(body.includes('Les archives noyées'));return{bytes:Buffer.byteLength(body)};});
 await test('Serveur local : entrée modulaire et modules accessibles',async()=>{for(const p of ['/dlc/alien-hors-des-ombres/index.html','/src/oth-v1/oth-ui.js','/src/oth-v1/oth-ui.css']){const r=await fetch(base+p);assert.equal(r.status,200);assert.ok((await r.text()).length>30);}});
 await test('Serveur local : fichier absent répond 404',async()=>assert.equal((await fetch(base+'/does-not-exist')).status,404));
 await test('Serveur local : HEAD sans corps',async()=>{const r=await fetch(base,{method:'HEAD'});assert.equal(r.status,200);assert.equal(await r.text(),'');});
 await test('Serveur local : méthode POST refusée',async()=>assert.equal((await fetch(base,{method:'POST'})).status,405));
 await test('Serveur local : parcours hors racine refusé',async()=>{const r=await fetch(base+'/%2e%2e%2f%2e%2e%2fetc%2fpasswd');assert.equal(r.status,404);assert.ok(!(await r.text()).includes('root:'));});
}catch(e){checks.push({name:'Disponibilité serveur',ok:false,error:e.stack});}finally{server.kill();}
const report={suite:'delivery-v0.3',tests:checks.length,passed:checks.filter(x=>x.ok).length,failed:checks.filter(x=>!x.ok).length,checks};
await fs.writeFile(new URL('./delivery-results-v02.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
