import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,readFile,rm,access,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {install} from '../tools/install.mjs';
const root=await mkdtemp(join(tmpdir(),'rop-installer-')),results=[];
const HTML='<!doctype html><html><body><nav id="title-menu"></nav><section data-panel="archives"></section><script type="module" src="/src/app.js"></script></body></html>';
const oldPackage=JSON.stringify({name:'aliens-tantalus-frontier',version:'86.0.0'});
async function test(name,fn){try{await fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:e.message});console.error('FAIL',name,e.message);}}
async function fixture(name){const p=join(root,name);await mkdir(join(p,'src'),{recursive:true});await writeFile(join(p,'index.html'),HTML);await writeFile(join(p,'package.json'),oldPackage);await writeFile(join(p,'src','content.js'),'export const sentinel = "CATALOGUE_INCHANGE";');return p;}
try{
 const p=await fixture('regular');
 await test('Installation additive sur fixture des ancrages observés',async()=>{const r=await install(p);assert.equal(r.action,'installed');const h=await readFile(join(p,'index.html'),'utf8');assert.ok(h.includes('/src/river-of-pain/launcher.js'));assert.equal(await readFile(join(p,'package.json'),'utf8'),oldPackage);assert.equal(await readFile(join(p,'src','content.js'),'utf8'),'export const sentinel = "CATALOGUE_INCHANGE";');});
 await test('Deuxième exécution sans doublon',async()=>{assert.equal((await install(p)).action,'already-installed');assert.equal((await readFile(join(p,'index.html'),'utf8')).match(/src="\/src\/river-of-pain\/launcher.js"/g).length,1);});
 await test('Retrait restauré octet pour octet',async()=>{assert.equal((await install(p,{remove:true})).action,'removed');assert.equal(await readFile(join(p,'index.html'),'utf8'),HTML);await assert.rejects(access(join(p,'src','river-of-pain')));});
 const conflict=await fixture('conflict');await install(conflict);
 await test('Refus si index modifié après installation',async()=>{await writeFile(join(conflict,'index.html'),(await readFile(join(conflict,'index.html'),'utf8'))+'<!--change-->');await assert.rejects(install(conflict,{remove:true}),/index.html a changé/);assert.ok((await readFile(join(conflict,'index.html'),'utf8')).endsWith('<!--change-->'));});
 const payloadConflict=await fixture('payload-conflict');await install(payloadConflict);
 await test('Refus si un module du DLC a été modifié',async()=>{await writeFile(join(payloadConflict,'src/river-of-pain/core.js'),'// custom');await assert.rejects(install(payloadConflict,{remove:true}),/divergent/);assert.equal(await readFile(join(payloadConflict,'src/river-of-pain/core.js'),'utf8'),'// custom');});
 const failure=await fixture('failure');
 await test('Échec injecté après copie : restauration',async()=>{await assert.rejects(install(failure,{failAfterCopy:true}),/TEST_ONLY/);assert.equal(await readFile(join(failure,'index.html'),'utf8'),HTML);await assert.rejects(access(join(failure,'src/river-of-pain')));});
 const occupied=await fixture('occupied');await mkdir(join(occupied,'src/river-of-pain'));
 await test('Dossier inconnu existant jamais écrasé',async()=>{await writeFile(join(occupied,'src/river-of-pain/custom.txt'),'keep');await assert.rejects(install(occupied),/existe déjà/);assert.equal(await readFile(join(occupied,'src/river-of-pain/custom.txt'),'utf8'),'keep');});
 const symlinked=await fixture('symlink');await symlink(join(root,'regular','src'),join(symlinked,'src/river-of-pain'));
 await test('Lien symbolique de destination refusé',async()=>{await assert.rejects(install(symlinked),/symbolique/);assert.equal(await readFile(join(symlinked,'index.html'),'utf8'),HTML);});
 const other=await fixture('other');await writeFile(join(other,'package.json'),JSON.stringify({name:'other'}));
 await test('Autre projet refusé',async()=>{await assert.rejects(install(other),/n’est pas le projet/);assert.equal(await readFile(join(other,'index.html'),'utf8'),HTML);});
 const absent=await fixture('absent');await writeFile(join(absent,'index.html'),'<html><body>Another shell</body></html>');
 await test('Ancrages manquants refusés',async()=>{await assert.rejects(install(absent),/Structure hôte inconnue/);await assert.rejects(access(join(absent,'src/river-of-pain')));});
 const versionOld='0.1.0-candidate.1',newJournal='.dlc-installations/river-of-pain-v0.9.0.json',oldJournal='.dlc-installations/river-of-pain-v0.1.0.json';
 const hash=b=>createHash('sha256').update(b).digest('hex');
 async function legacy(name){const p=await fixture(name),code='// Old v01 payload fixture, not the native host runtime.\n',injected=HTML.replace('</body>','<!-- RIVER-OF-PAIN-LAUNCHER v0.1.0 -->\n<script type="module" src="/src/river-of-pain/launcher.js"></script>\n<!-- /RIVER-OF-PAIN-LAUNCHER -->\n</body>');await mkdir(join(p,'src/river-of-pain'));await writeFile(join(p,'src/river-of-pain/core.js'),code);await mkdir(join(p,'.dlc-installations'));await mkdir(join(p,'.dlc-backups/river-of-pain-v0.1.0'),{recursive:true});await writeFile(join(p,'.dlc-backups/river-of-pain-v0.1.0/index.html'),HTML);await writeFile(join(p,'index.html'),injected);await writeFile(join(p,oldJournal),JSON.stringify({id:'river-of-pain',version:versionOld,indexBefore:hash(HTML),indexAfter:hash(injected),files:[{path:'core.js',size:Buffer.byteLength(code),sha256:hash(code)}]}));return p;}
 const old=await legacy('upgrade');
 await test('v01 : mise à niveau exige --upgrade',async()=>{await assert.rejects(install(old),/--upgrade/);assert.ok((await readFile(join(old,'src/river-of-pain/core.js'),'utf8')).includes('Old v01'));});
 await test('v01 vers v09 : pas de double lanceur ni ancien journal actif',async()=>{assert.equal((await install(old,{upgrade:true})).action,'upgraded');const h=await readFile(join(old,'index.html'),'utf8');assert.equal(h.match(/src="\/src\/river-of-pain\/launcher.js"/g).length,1);assert.ok(h.includes('v0.9.0'));assert.ok((await readFile(join(old,'src/river-of-pain/colony.js'),'utf8')).includes('ROP_COLONY'));await assert.rejects(access(join(old,oldJournal)));assert.equal(await readFile(join(old,'src/content.js'),'utf8'),'export const sentinel = "CATALOGUE_INCHANGE";');});
 await test('Retrait après upgrade : retour au shell pré-DLC',async()=>{assert.equal((await install(old,{remove:true})).action,'removed');assert.equal(await readFile(join(old,'index.html'),'utf8'),HTML);});
 const postFail=await legacy('upgrade-failure'),beforeIndex=await readFile(join(postFail,'index.html')),beforeState=await readFile(join(postFail,oldJournal)),beforeCore=await readFile(join(postFail,'src/river-of-pain/core.js'));
 await test('Upgrade interrompue après commit : journal v01, index et modules restaurés',async()=>{await assert.rejects(install(postFail,{upgrade:true,failAfterCommit:true}),/TEST_ONLY/);assert.deepEqual(await readFile(join(postFail,'index.html')),beforeIndex);assert.deepEqual(await readFile(join(postFail,oldJournal)),beforeState);assert.deepEqual(await readFile(join(postFail,'src/river-of-pain/core.js')),beforeCore);await assert.rejects(access(join(postFail,newJournal)));});
 await test('Nouvelle tentative après rollback réussit',async()=>{assert.equal((await install(postFail,{upgrade:true})).action,'upgraded');});
 // A v02 transaction has the same documented journal format but a different backup location.
 async function legacy02(name){const p=await legacy(name),old=JSON.parse(await readFile(join(p,oldJournal),'utf8'));old.version='0.2.0-candidate.1';await mkdir(join(p,'.dlc-backups/river-of-pain-v0.2.0'),{recursive:true});await writeFile(join(p,'.dlc-backups/river-of-pain-v0.2.0/index.html'),HTML);await writeFile(join(p,'.dlc-installations/river-of-pain-v0.2.0.json'),JSON.stringify(old));await rm(join(p,oldJournal));return p;}
 const v02=await legacy02('version02'),journal02='.dlc-installations/river-of-pain-v0.2.0.json';
 await test('v02 : remplacement exige aussi --upgrade',async()=>{await assert.rejects(install(v02),/--upgrade/);await access(join(v02,journal02));});
 await test('v02 vers v04 : nouveaux modules, un seul journal actif',async()=>{assert.equal((await install(v02,{upgrade:true})).action,'upgraded');const j=JSON.parse(await readFile(join(v02,newJournal),'utf8'));assert.equal(j.upgradedFrom,'0.2.0-candidate.1');await access(join(v02,'src/river-of-pain/exploration.js'));await access(join(v02,'src/river-of-pain/field-visuals.js'));await assert.rejects(access(join(v02,journal02)));assert.equal(await readFile(join(v02,'src/content.js'),'utf8'),'export const sentinel = "CATALOGUE_INCHANGE";');});
 await test('Retrait du remplacement v02→v04 : shell initial exact',async()=>{await install(v02,{remove:true});assert.equal(await readFile(join(v02,'index.html'),'utf8'),HTML);});
 const fail02=await legacy02('failure02'),snapshot02={index:await readFile(join(fail02,'index.html')),journal:await readFile(join(fail02,journal02)),core:await readFile(join(fail02,'src/river-of-pain/core.js'))};
 await test('Échec après commit v02→v04 : toutes les empreintes restaurées',async()=>{await assert.rejects(install(fail02,{upgrade:true,failAfterCommit:true}),/TEST_ONLY/);assert.deepEqual(await readFile(join(fail02,'index.html')),snapshot02.index);assert.deepEqual(await readFile(join(fail02,journal02)),snapshot02.journal);assert.deepEqual(await readFile(join(fail02,'src/river-of-pain/core.js')),snapshot02.core);await assert.rejects(access(join(fail02,newJournal)));});
 const concurrent=await legacy02('concurrent');await writeFile(join(concurrent,oldJournal),await readFile(join(concurrent,journal02)));
 await test('Deux journaux anciens concurrents : refus sans mutation',async()=>{const h=await readFile(join(concurrent,'index.html'));await assert.rejects(install(concurrent,{upgrade:true}),/concurrents/);assert.deepEqual(await readFile(join(concurrent,'index.html')),h);});
 const invalidOptions=await fixture('invalid-options');await test('Retrait et upgrade simultanés refusés',async()=>{await assert.rejects(install(invalidOptions,{remove:true,upgrade:true}),/pas les deux/);assert.equal(await readFile(join(invalidOptions,'index.html'),'utf8'),HTML);});
 const noOld=await fixture('no-old');await test('Pas de faux upgrade sans version antérieure',async()=>{await assert.rejects(install(noOld,{upgrade:true}),/Aucune version/);assert.equal(await readFile(join(noOld,'index.html'),'utf8'),HTML);});
 const extra=await fixture('extra');await install(extra);await writeFile(join(extra,'src/river-of-pain/personal.txt'),'keep');
 await test('Fichier personnel ajouté au DLC préservé',async()=>{await assert.rejects(install(extra,{remove:true}),/supplémentaires/);assert.equal(await readFile(join(extra,'src/river-of-pain/personal.txt'),'utf8'),'keep');});
 const corrupt=await legacy('corrupt-backup');await writeFile(join(corrupt,'.dlc-backups/river-of-pain-v0.1.0/index.html'),'modified');
 await test('Backup v01 altérée : aucun upgrade',async()=>{await assert.rejects(install(corrupt,{upgrade:true}),/altérée/);await access(join(corrupt,oldJournal));});
 const malicious=await legacy('malicious'),j=JSON.parse(await readFile(join(malicious,oldJournal),'utf8'));j.files[0].path='../outside';await writeFile(join(malicious,oldJournal),JSON.stringify(j));
 await test('Chemin sortant dans un journal : refus avant lecture ou écrasement',async()=>{await assert.rejects(install(malicious,{upgrade:true}),/Chemin/);assert.equal(await readFile(join(malicious,'package.json'),'utf8'),oldPackage);});
 const removal=await fixture('failed-removal');await install(removal);const removalIndex=await readFile(join(removal,'index.html'));
 await test('Retrait interrompu après commit : v04 restaurée',async()=>{await assert.rejects(install(removal,{remove:true,failAfterCommit:true}),/TEST_ONLY/);assert.deepEqual(await readFile(join(removal,'index.html')),removalIndex);assert.equal((await install(removal)).action,'already-installed');});
 const freshFail=await fixture('fresh-commit-failure');
 await test('Installation neuve interrompue après commit : shell initial restauré',async()=>{await assert.rejects(install(freshFail,{failAfterCommit:true}),/TEST_ONLY/);assert.equal(await readFile(join(freshFail,'index.html'),'utf8'),HTML);await assert.rejects(access(join(freshFail,'src/river-of-pain')));});
 const dual=await legacy('dual');await writeFile(join(dual,newJournal),'{}');
 await test('Journaux concurrents : arrêt sans suppression',async()=>{await assert.rejects(install(dual,{upgrade:true}),/concurrents/);await access(join(dual,oldJournal));await access(join(dual,newJournal));});

}finally{await rm(root,{recursive:true,force:true});}
await writeFile(join(dirname(fileURLToPath(import.meta.url)),'../docs/INSTALLER_TEST_RESULTS.json'),JSON.stringify({passed:results.every(r=>r.passed),cases:results.length,scope:'Fixtures using the observed host DOM, not the complete Tantalus repository',results},null,2));
console.log(results.filter(x=>x.passed).length+'/'+results.length+' installer cases passed');if(results.some(x=>!x.passed))process.exitCode=1;
