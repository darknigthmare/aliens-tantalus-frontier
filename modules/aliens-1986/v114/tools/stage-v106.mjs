/* Safe staging, NOT automatic activation in a native V105 engine.
   Native room coordinates could not be retrieved from the source ZIP.
   No native version, save, engine, service worker or other DLC is rewritten. */
import {readFile,writeFile,mkdir,lstat,rm,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';import {resolve,join,dirname,relative} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const HERE=dirname(fileURLToPath(import.meta.url)),PACK=resolve(HERE,'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function exists(p){try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export async function noLinks(root,path){const abs=resolve(path),base=resolve(root),rel=relative(base,abs);if(rel.startsWith('..')||rel.startsWith('/'))throw new Error('Chemin hors projet');let p=base;if((await lstat(base)).isSymbolicLink())throw new Error('Racine symbolique refusée');for(const part of rel.split('/').filter(Boolean)){p=join(p,part);if(await exists(p)){if((await lstat(p)).isSymbolicLink())throw new Error(`Lien symbolique refusé: ${p}`);}}}
async function payload(){const out={};for(const rel of ['src/spatial-core.mjs','src/aliens-1986-spatial-v106.mjs'])out[rel]=await readFile(join(PACK,rel));return out;}
export async function stage({root,apply=false,referenceHashes=null,postCheck=null}={}){
  root=resolve(root||'.');await noLinks(root,root);const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));if(pkg.name!=='aliens-tantalus-frontier'||pkg.version!=='105.0.0')throw new Error('Une copie native V105.0.0 intacte est nécessaire');
  const hashes=referenceHashes||JSON.parse(await readFile(join(PACK,'baseline/source-hashes-v105.json'),'utf8'));for(const [rel,expected] of Object.entries(hashes)){const p=join(root,rel);await noLinks(root,p);if(sha(await readFile(p))!==expected)throw new Error(`Source V105 différente: ${rel}`);}
  const files=await payload(),dest=join(root,'addons/aliens-1986-v106'),receiptPath=join(dest,'STAGING.json');await noLinks(root,dest);
  if(await exists(dest)){
    const receipt=JSON.parse(await readFile(receiptPath,'utf8'));for(const [rel,bytes] of Object.entries(files)){await noLinks(root,join(dest,rel));if(sha(await readFile(join(dest,rel)))!==sha(bytes)||receipt.files?.[rel]!==sha(bytes))throw new Error('Ajout existant modifié : aucune écriture');}
    return {ok:true,mode:'already-staged',nativeActivated:false,nativeFilesChanged:0};
  }
  if(!apply)return {ok:true,mode:'dry-run',nativeActivated:false,sourceFilesVerified:Object.keys(hashes).length,files:Object.keys(files)};
  await mkdir(dest,{recursive:true});try{
    for(const [rel,bytes] of Object.entries(files)){const p=join(dest,rel);await noLinks(root,p);await mkdir(dirname(p),{recursive:true});await writeFile(p,bytes,{flag:'wx'});}
    const receipt={release:'106.0.0-rc.1',nativeActivated:false,nativeFilesChanged:0,scope:'Staging only: reviewed native scene/movement mapping required',files:Object.fromEntries(Object.entries(files).map(([p,b])=>[p,sha(b)]))};
    await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
    if(postCheck)await postCheck();else if(pkg.scripts?.check){const r=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','check'],{cwd:root,encoding:'utf8',timeout:120000});if(r.status!==0)throw new Error('Contrôle de la copie cible échoué; dépôt natif non modifié');}
    return {ok:true,mode:'staged',nativeActivated:false,nativeFilesChanged:0,sourceFilesVerified:Object.keys(hashes).length};
  }catch(error){await rm(dest,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),i=args.indexOf('--root');stage({root:i>=0?args[i+1]:'.',apply:args.includes('--apply')}).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
}
