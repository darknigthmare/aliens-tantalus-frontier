import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createLocalServer} from '../tools/serve.mjs';
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
async function fixture(fn){const root=await mkdtemp(join(tmpdir(),'isolation-server-'));await mkdir(join(root,'src'));await writeFile(join(root,'JOUER_ISOLATION.html'),'<title>isolation</title>');await writeFile(join(root,'src/app.js'),'export const ready=true;');const server=createLocalServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
 const request=(path='/',options={})=>new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port,path,...options},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text:Buffer.concat(chunks).toString()}));});req.on('error',reject);req.end();});
 try{await fn({root,request,server});}finally{await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true});}}
test('Serveur local : racine autonome et absence de cache',()=>fixture(async({request})=>{const r=await request();assert.equal(r.status,200);assert(r.text.includes('isolation'));assert.equal(r.headers['cache-control'],'no-store');}));
test('Serveur local : source ES module avec type JavaScript',()=>fixture(async({request})=>{const r=await request('/src/app.js');assert.equal(r.status,200);assert(r.headers['content-type'].includes('javascript'));}));
test('Serveur local : aucune exposition des sauvegardes/tests/outils',()=>fixture(async({request,root})=>{await writeFile(join(root,'private.json'),'SECRET');for(const p of ['/private.json','/qa/browser-export.json','/tools/serve.mjs','/../private.json','/%2e%2e/private.json','/src/../../private.json'])assert.equal((await request(p)).status,404,p);}));
test('Serveur local : POST refusé, aucun fichier écrit',()=>fixture(async({request})=>{assert.equal((await request('/',{method:'POST'})).status,405);}));
test('Serveur local : HEAD sans corps',()=>fixture(async({request})=>{const r=await request('/',{method:'HEAD'});assert.equal(r.status,200);assert.equal(r.text,'');}));
test('Serveur local : adresse mal encodée refusée proprement',()=>fixture(async({request})=>{assert.equal((await request('/%ZZ')).status,400);}));
test('Serveur local : Host étranger refusé',()=>fixture(async({request})=>{assert.equal((await request('/',{headers:{Host:'foreign.invalid'}})).status,403);}));
test('Serveur local : ne suit pas un lien symbolique hors du projet',()=>fixture(async({request,root})=>{const other=await mkdtemp(join(tmpdir(),'isolation-private-'));try{await writeFile(join(other,'secret.js'),'SECRET');await symlink(join(other,'secret.js'),join(root,'src/secret.js'));assert.equal((await request('/src/secret.js')).status,403);}finally{await rm(other,{recursive:true,force:true});}}));
test('Serveur local : interface réseau limitée à la boucle locale',()=>fixture(async({server})=>{assert.equal(server.address().address,'127.0.0.1');}));
