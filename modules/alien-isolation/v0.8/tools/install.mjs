import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync,rmSync,lstatSync,renameSync,readdirSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const ID='tantalus.alien-isolation',NAMES=['index.html','manifest.json'],RECEIPT='.isolation-install.json';
export const sha=text=>createHash('sha256').update(text).digest('hex');
function noLink(path){
 let st;try{st=lstatSync(path);}catch(e){if(e.code==='ENOENT')return;throw e;}
 if(st.isSymbolicLink()||realpathSync(path)!==path)throw Error('Lien symbolique interdit dans le chemin de destination.');
}
function verify(path){
 noLink(path);if(!existsSync(path))throw Error('Installation absente : '+path);
 const actual=readdirSync(path);if(actual.some(n=>![...NAMES,RECEIPT].includes(n)))throw Error('Contenu supplémentaire : opération refusée.');
 for(const name of [...NAMES,RECEIPT]){const file=join(path,name);noLink(file);if(!existsSync(file)||!lstatSync(file).isFile())throw Error('Fichier manquant ou invalide : '+name);}
 const r=JSON.parse(readFileSync(join(path,RECEIPT),'utf8'));
 if(r.id!==ID||!r.files||Object.keys(r.files).length!==2||NAMES.some(n=>typeof r.files[n]!=='string'))throw Error('Reçu d’installation incompatible.');
 for(const name of NAMES)if(sha(readFileSync(join(path,name)))!==r.files[name])throw Error('Fichier modifié depuis installation : '+name+'. Rien n’a été supprimé.');
 const m=JSON.parse(readFileSync(join(path,'manifest.json'),'utf8'));
 if(m.id!==ID||m.version!==r.version)throw Error('Version incohérente dans le reçu.');
 return r;
}
function stage(temp){
 const bytes=readFileSync(join(ROOT,'JOUER_ISOLATION.html')),manifest=readFileSync(join(ROOT,'integration','dlc-manifest.json'));
 const m=JSON.parse(manifest);if(m.id!==ID)throw Error('Manifest de livraison incompatible.');
 noLink(temp);if(existsSync(temp))throw Error('Dossier temporaire déjà présent.');mkdirSync(temp);
 try{writeFileSync(join(temp,'index.html'),bytes);writeFileSync(join(temp,'manifest.json'),manifest);writeFileSync(join(temp,RECEIPT),JSON.stringify({id:ID,version:m.version,files:{'index.html':sha(bytes),'manifest.json':sha(manifest)}},null,2));verify(temp);}catch(err){rmSync(temp,{recursive:true,force:true});throw err;}
 return m.version;
}
/** Installs a separate launcher; does not modify host code, menus or saves.
 * Upgrade retains the complete verified prior folder. Rollback restores it.
 * Refuses modified/unknown files and symbolic links rather than overwriting them.
 */
export function install(host,action='install'){
 if(!['install','uninstall','upgrade','rollback'].includes(action))throw Error('Action inconnue.');
 host=realpathSync(resolve(host));const pkg=JSON.parse(readFileSync(join(host,'package.json'),'utf8'));
 if(pkg.name!=='aliens-tantalus-frontier')throw Error('Le dossier doit être une copie de aliens-tantalus-frontier.');
 const parent=join(host,'public','dlc'),target=join(parent,'alien-isolation'),backup=join(parent,'alien-isolation.previous');
 const temp=join(parent,'.alien-isolation-'+process.pid),swap=join(parent,'.alien-isolation-rollback-'+process.pid);
 for(const path of [join(host,'public'),parent,target,backup,temp,swap])noLink(path);
 const done=(extra={})=>({action,target,ok:true,url:'/dlc/alien-isolation/index.html',nativeIntegration:false,...extra});
 if(action==='uninstall'){
  if(existsSync(backup))throw Error('Une sauvegarde de mise à jour existe. Effectuez rollback avant désinstallation.');
  verify(target);rmSync(target,{recursive:true});return done();
 }
 if(action==='rollback'){
  const now=verify(target),old=verify(backup);if(existsSync(swap))throw Error('Dossier de récupération déjà présent.');
  renameSync(target,swap);
  try{renameSync(backup,target);}catch(err){renameSync(swap,target);throw err;}
  // Only the fully verified, superseded launcher is removed.
  rmSync(swap,{recursive:true});return done({from:now.version,version:old.version});
 }
 if(action==='upgrade'){
  const old=verify(target);if(existsSync(backup))throw Error('Une sauvegarde précédente existe déjà. Aucun remplacement.');
  const version=stage(temp);
  try{renameSync(target,backup);}catch(err){rmSync(temp,{recursive:true});throw err;}
  try{renameSync(temp,target);}catch(err){renameSync(backup,target);if(existsSync(temp))rmSync(temp,{recursive:true});throw err;}
  return done({from:old.version,version,backup});
 }
 if(existsSync(target))throw Error('La destination existe déjà. Utilisez upgrade pour conserver la version précédente.');
 if(existsSync(backup))throw Error('Une sauvegarde précédente existe sans installation active. Restaurez-la avant de continuer.');
 mkdirSync(parent,{recursive:true});const version=stage(temp);
 try{renameSync(temp,target);}catch(err){if(existsSync(temp))rmSync(temp,{recursive:true});throw err;}
 return done({version});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [action,host]=process.argv.slice(2);if(!action||!host){console.error('Usage : node tools/install.mjs install|upgrade|rollback|uninstall CHEMIN_VERS_TANTALUS');process.exitCode=2;}
 else try{console.log(JSON.stringify(install(host,action),null,2));}catch(error){console.error(error.message);process.exitCode=1;}
}
