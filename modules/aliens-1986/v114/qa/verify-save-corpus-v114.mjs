import {readdir,readFile,writeFile} from 'node:fs/promises';
import * as O from '../src/operation-v114.mjs';
const root=new URL('../report/',import.meta.url),checks=[];let expected=0;
for(const dir of await readdir(root)){if(!dir.includes('states-v114')&&!dir.includes('states-v113'))continue;
 for(const file of await readdir(new URL(dir+'/',root))){if(!file.endsWith('.json'))continue;const raw=JSON.parse(await readFile(new URL(dir+'/'+file,root),'utf8'));if(![113,114].includes(raw.schema))continue;const result=raw.schema===113?O.importV113(raw):O.importSession(raw);checks.push({file:dir+'/'+file,schema:raw.schema,ok:result.ok,reason:result.reason||null});expected++;}}
await writeFile(new URL('save-corpus-v114.json',root),JSON.stringify({description:'Exports intacts des pilotes courants et de la distribution V113. Tests de lecture, pas parcours complets.',checks},null,2));console.log(JSON.stringify({exports:expected,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));// Historical states colliding with newly built walls are deliberately refused, never teleported.
if(checks.some(c=>c.schema===114&&!c.ok))process.exitCode=1;
