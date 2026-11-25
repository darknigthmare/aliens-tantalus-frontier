/** Reversible additive installation. No network and no overwrite of existing DLC files. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const marker='\n<!-- OTH MARION V1 BEGIN -->\n<script type="module" src="/src/oth-v1/oth-bridge.js"></script>\n<!-- OTH MARION V1 END -->\n';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const backupDir='.dlc-backups/alien-out-of-shadows-v1';
const payload=['oth-data.js','oth-engine.js','oth-render.js','oth-ui.css','oth-ui.js','oth-bridge.js'].map(p=>'src/oth-v1/'+p).concat('dlc/alien-hors-des-ombres/index.html');
async function exists(p){try{await fs.lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function safe(root,relative){const full=path.resolve(root,relative);if(!full.startsWith(root+path.sep))throw new Error('Chemin hors du projet');let at=root;for(const part of relative.split('/')){at=path.join(at,part);if(await exists(at)){if((await fs.lstat(at)).isSymbolicLink())throw new Error('Lien symbolique refusé : '+relative);}}return full;}
export async function install(rootInput,{remove=false,check=false,upgrade=false}={}){
 const root=await fs.realpath(rootInput);if(root===source)throw new Error('Choisissez une copie de Tantalus Frontier, pas le dossier du DLC.');
 const packagePath=await safe(root,'package.json'),indexPath=await safe(root,'index.html');
 const pkg=JSON.parse(await fs.readFile(packagePath,'utf8'));if(pkg.name!=='aliens-tantalus-frontier')throw new Error('Le dossier cible ne porte pas le nom de projet attendu.');
 const index=await fs.readFile(indexPath,'utf8');if(!index.includes('data-panel="operations"')||!index.includes('</body>'))throw new Error('Point d’entrée Opérations introuvable. Aucune modification.');
 const journalPath=await safe(root,backupDir+'/installation.json');
 if(await exists(journalPath)){
  const journal=JSON.parse(await fs.readFile(journalPath,'utf8'));
  if(sha(index)!==journal.indexAfter)throw new Error('index.html a changé depuis l’installation. Réconciliez les modifications avant de retirer le DLC.');
  for(const p of payload){const file=await safe(root,p);if(!(await exists(file))||sha(await fs.readFile(file))!==journal.files[p])throw new Error('Un fichier du DLC a changé : '+p);}
  if(upgrade&&!remove){
   const updates=new Map(),prior=new Map();for(const p of payload){const bytes=await fs.readFile(path.join(source,p));updates.set(p,bytes);prior.set(p,await fs.readFile(await safe(root,p)));}
   if([...updates].every(([p,b])=>sha(b)===journal.files[p]))return {ok:true,alreadyCurrent:true,version:'0.10.0'};
   if(check)return {ok:true,upgradeAvailable:true,version:'0.10.0',files:payload.length};
   const backup=await safe(root,backupDir+'/before-v10');if(await exists(backup))throw new Error('Une sauvegarde before-v10 existe déjà. Aucune écriture.');
   await fs.mkdir(backup,{recursive:true});
   try{
    for(const [p,b] of prior){const dest=path.join(backup,p);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,b,{flag:'wx'});}
    await fs.writeFile(path.join(backup,'installation.json'),JSON.stringify(journal,null,2),{flag:'wx'});
    for(const [p,b] of updates)await fs.writeFile(await safe(root,p),b);
    await fs.writeFile(journalPath,JSON.stringify({...journal,version:'0.10.0',files:Object.fromEntries([...updates].map(([p,b])=>[p,sha(b)])),upgradeBackup:backupDir+'/before-v10'},null,2));
    return {ok:true,upgraded:true,version:'0.10.0',files:payload.length};
   }catch(e){for(const [p,b] of prior)await fs.writeFile(await safe(root,p),b);await fs.writeFile(journalPath,JSON.stringify(journal,null,2));await fs.rm(backup,{recursive:true,force:true});throw e;}
  }
  if(!remove)return {ok:true,alreadyInstalled:true,files:payload.length,hostVersion:pkg.version,version:journal.version||'0.1.0',upgradeCommand:'--upgrade'};
  const original=await fs.readFile(await safe(root,backupDir+'/index.before.html'),'utf8');if(sha(original)!==journal.indexBefore)throw new Error('Sauvegarde index invalide');
  if(!check){await fs.writeFile(indexPath,original);for(const p of payload)await fs.unlink(await safe(root,p));await fs.unlink(journalPath);await fs.unlink(path.join(root,backupDir,'index.before.html'));}
  return {ok:true,removed:!check,files:payload.length};
 }
 if(remove)throw new Error('Aucune installation enregistrée dans ce projet.');
 if(index.includes('OTH MARION V1 BEGIN'))throw new Error('Une balise existe sans journal. Réconciliez cette installation.');
 const bytes=new Map();for(const p of payload){const target=await safe(root,p);if(await exists(target))throw new Error('Refus d’écraser un fichier existant : '+p);bytes.set(p,await fs.readFile(path.join(source,p)));}
 if(check)return {ok:true,compatibleEntryPoint:true,files:payload.length,hostVersion:pkg.version,fullGameIntegrationCertified:false};
 const patched=index.replace('</body>',marker+'</body>');
 const written=[];let indexWritten=false;
 try{
  const backup=await safe(root,backupDir);await fs.mkdir(backup,{recursive:true});
  // Exclusive creation prevents a silent overwrite of an unjournalled backup.
  await fs.writeFile(path.join(backup,'index.before.html'),index,{flag:'wx'});
  for(const [relative,data]of bytes){const target=await safe(root,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data,{flag:'wx'});written.push(relative);}
  await fs.writeFile(indexPath,patched);indexWritten=true;
  const journal={schema:1,version:'0.10.0',hostVersion:pkg.version,indexBefore:sha(index),indexAfter:sha(patched),files:Object.fromEntries([...bytes].map(([k,v])=>[k,sha(v)])),scope:'isolated-runtime-launcher-not-native-engine-merge'};
  await fs.writeFile(journalPath,JSON.stringify(journal,null,2),{flag:'wx'});
  return {ok:true,installed:true,files:payload.length,hostVersion:pkg.version,fullGameIntegrationCertified:false};
 }catch(e){if(indexWritten&&sha(await fs.readFile(indexPath))===sha(patched))await fs.writeFile(indexPath,index);for(const p of written)await fs.unlink(path.join(root,p));throw e;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),target=args.find(x=>!x.startsWith('--'));
 if(!target){console.error('Usage : node tools/install.mjs /chemin/vers/tantalus [--check | --upgrade | --uninstall]');process.exitCode=2;}
 else try{console.log(JSON.stringify(await install(target,{check:args.includes('--check'),remove:args.includes('--uninstall'),upgrade:args.includes('--upgrade')}),null,2));}catch(e){console.error('Installation arrêtée : '+e.message);process.exitCode=1;}
}
