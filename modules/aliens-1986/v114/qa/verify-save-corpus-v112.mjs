// Re-read public-drive exports with the real current validator. Separate from gameplay counts.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import * as O from '../src/operation-v112.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'), checks=[];
for (const dir of (await readdir(join(root,'report'))).sort()) {
  if(!dir.endsWith('-v112')||!dir.includes('states'))continue;
  for(const name of (await readdir(join(root,'report',dir))).sort()){
    if(!name.endsWith('.json'))continue;
    const raw=JSON.parse(await readFile(join(root,'report',dir,name),'utf8'));
    const result=O.importSession(raw);
    checks.push({file:dir+'/'+name,ok:result.ok,reason:result.reason});
    if(!result.ok)throw new Error(dir+'/'+name+': '+result.reason);
  }
}
await writeFile(join(root,'report/save-corpus-v112.json'),JSON.stringify({version:'112.0.0-rc.1',scope:'saved public-drive exports validated by current importer, not playthrough counts',checks},null,2)+'\n');
console.log(JSON.stringify({valid:checks.every(x=>x.ok),files:checks.length}));
