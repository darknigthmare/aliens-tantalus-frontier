/** Recover the exact original ZIP from bounded Git blobs; never overwrite a destination. */
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { open, mkdir, lstat, link, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reviewedHorsDesOmbresV010 } from './hors-des-ombres-admission-v010.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),target=process.argv[2];
if(!target){console.error('Usage: npm run archive:dlc:hors-des-ombres -- /destination/ALIEN_HORS_DES_OMBRES_V0_10.zip');process.exitCode=2;}
else{
 const destination=resolve(target),temporary=destination+'.'+randomUUID()+'.partial';
 const {manifest}=reviewedHorsDesOmbresV010(),entries=new Map(manifest.files.map(e=>[e.path,e]));
 const totalHash=createHash('sha256');let total=0,handle;
 try{
  await mkdir(dirname(destination),{recursive:true});
  try{await lstat(destination);throw new Error('Destination already exists; no overwrite performed.');}catch(error){if(error.code!=='ENOENT')throw error;}
  handle=await open(temporary,'wx');
  for(const path of manifest.sourceArchive.chunks){
   const e=entries.get(path);if(!e)throw new Error('Unreviewed chunk: '+path);
   const p=join(root,path),stat=await lstat(p);if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Invalid chunk: '+path);
   const hash=createHash('sha256');let bytes=0;
   for await(const buffer of createReadStream(p)){hash.update(buffer);totalHash.update(buffer);bytes+=buffer.length;total+=buffer.length;await handle.writeFile(buffer);}
   if(bytes!==e.sizeBytes||hash.digest('hex')!==e.sha256)throw new Error('Damaged chunk: '+path);
  }
  const sha256=totalHash.digest('hex');
  if(total!==manifest.sourceArchive.sizeBytes||sha256!==manifest.sourceArchive.sha256)throw new Error('Original ZIP checksum mismatch.');
  await handle.sync();await handle.close();handle=null;
  await link(temporary,destination);
  console.log(JSON.stringify({ok:true,file:destination,sizeBytes:total,sha256},null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
 finally{await handle?.close();await rm(temporary,{force:true});}
}
