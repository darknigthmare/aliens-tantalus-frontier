import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ENEMY_HISTORICAL_VARIANTS_V95, ARACHNOID_PROFILE_ID_V95 } from '../src/enemy-historical-variants-v95.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const origin = 'https://atf-offline.example';
const pngs = ['/assets/openai/sprites/static-enemy-v95/ref-56-xeno-defender.png',
  ENEMY_HISTORICAL_VARIANTS_V95[ARACHNOID_PROFILE_ID_V95].states.find(s=>s.id==='purple').path];
function worker() {
  const stores=new Map(),listeners=new Map();let offline=false,claimed=0;
  const key=r=>new URL(typeof r==='string'?r:r.url,origin).href;
  const caches={
    async open(name){if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return {
      async addAll(paths){for(const path of paths)m.set(key(path),new Response('shell:'+path));},
      async put(request,response){m.set(key(request),response.clone());},
      async match(request){return m.get(key(request))?.clone();}};},
    async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);},
    async match(request){for(const m of stores.values()){const r=m.get(key(request));if(r)return r.clone();}}
  };
  const context=vm.createContext({URL,Response,Request,Headers,caches,
    fetch:async request=>{if(offline)throw Error('Network offline');return new Response('native:'+key(request),{headers:{'content-type':'image/png'}});},
    self:{location:{origin},skipWaiting:async()=>{},clients:{claim:async()=>{claimed++;}},addEventListener:(name,listener)=>listeners.set(name,listener)}});
  vm.runInContext(source,context);
  const constants=vm.runInContext('({cache:CACHE,shell:[...SHELL]})',context);
  async function event(name,request){const jobs=[];let result;listeners.get(name)({request,waitUntil:p=>jobs.push(p),respondWith:p=>{result=p;}});if(result)result=await result;await Promise.all(jobs);return result;}
  return {constants,caches,event,stores,setOffline:()=>{offline=true;},claims:()=>claimed};
}
test('V95 shell precaches every new module, but native Defender/Purple stay on demand',()=>{
  const w=worker();assert.equal(w.constants.cache,'atf-v86-ceto-final-v102-shell-1');
  for(const path of ['/src/user-reference-art-v95.js','/src/enemy-user-creations-v95.js','/src/enemy-historical-variants-v95.js'])assert.ok(w.constants.shell.includes(path));
  for(const path of pngs)assert.equal(w.constants.shell.includes(path),false);
});
test('build includes the reviewed exact Purple variant but rejects lookalike and candidate files',()=>{
  const filter=createBuildAssetFilter(process.cwd());
  for(const path of pngs)assert.equal(filter(resolve(process.cwd(),path.slice(1))),true,path);
  for(const path of ['arachnoid-purple-v95-copy.png','candidate.png','private/arachnoid-purple-v95.png'])
    assert.equal(filter(resolve(process.cwd(),'assets/openai/sprites/static-enemy-v95',path)),false,path);
});
test('real fetch listener caches visited V95 PNG responses and returns them offline, never HTML for an unvisited image',async()=>{
  const w=worker();await w.event('install');
  for(const path of pngs){const r=await w.event('fetch',new Request(origin+path));assert.equal(await r.text(),'native:'+origin+path);}
  w.setOffline();
  for(const path of pngs){const r=await w.event('fetch',new Request(origin+path));assert.equal(r.headers.get('content-type'),'image/png');assert.equal(await r.text(),'native:'+origin+path);}
  const missing=await w.event('fetch',new Request(origin+'/assets/unvisited.png'));assert.equal(missing.type,'error');
  const navigation=await w.event('fetch',{url:origin+'/?new-offline-route',method:'GET',mode:'navigate',headers:new Headers()});
  assert.equal(await navigation.text(),'shell:/index.html');
});
test('real activation removes the previous app cache only after new shell installation and claims the page',async()=>{
  const w=worker();await w.caches.open('atf-v86-user-creatures-v95-shell-2');await w.event('install');await w.event('activate');
  assert.deepEqual(await w.caches.keys(),['atf-v86-ceto-final-v102-shell-1']);assert.equal(w.claims(),1);
  assert.ok(await w.caches.match('/src/enemy-historical-variants-v95.js'));
});
