#!/usr/bin/env node
/** Additive, byte-verified installation. v01/v02/v03 upgrade requires --upgrade; all rollback bytes are checked. */
import {readFile,writeFile,cp,mkdir,rm,lstat,realpath,readdir,rename,mkdtemp} from 'node:fs/promises';
import {resolve,join,dirname,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const packageRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..'),payload=join(packageRoot,'src/river-of-pain');
const VERSION='0.9.0-candidate.1',MARKER='<!-- RIVER-OF-PAIN-LAUNCHER v0.9.0 -->';
const VERSIONS=['0.9.0','0.8.0','0.7.0','0.6.0','0.5.0','0.4.0','0.3.0','0.2.0','0.1.0'];
const injection=`${MARKER}\n  <script type="module" src="/src/river-of-pain/launcher.js"></script>\n  <!-- /RIVER-OF-PAIN-LAUNCHER -->\n`;
const sha=b=>createHash('sha256').update(b).digest('hex');
async function exists(p){try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
function safeRelative(p){return typeof p==='string'&&p.length>0&&p.length<240&&!isAbsolute(p)&&!/[\\:]/.test(p)&&p.split('/').every(c=>c&&c!=='.'&&c!=='..');}
async function noLinks(root,rel){if(!safeRelative(rel))throw Error('Chemin refusé : '+rel);let p=root;for(const part of rel.split('/')){p=join(p,part);if(await exists(p)&&(await lstat(p)).isSymbolicLink())throw Error('Lien symbolique refusé : '+p);}}
async function inventory(dir,prefix=''){const out=[];for(const x of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const rel=prefix+x.name;if(x.isSymbolicLink())throw Error('Lien symbolique refusé dans le DLC.');if(x.isDirectory())out.push(...await inventory(join(dir,x.name),rel+'/'));else if(x.isFile()){const b=await readFile(join(dir,x.name));out.push({path:rel,size:b.length,sha256:sha(b)});}}return out;}
function journal(s,version){if(!s||s.version!==version||s.id!=='river-of-pain'||!Array.isArray(s.files)||s.files.length<1||s.files.length>1000||!/^[a-f0-9]{64}$/.test(s.indexBefore)||!/^[a-f0-9]{64}$/.test(s.indexAfter))throw Error('Journal d’installation incompatible.');if(new Set(s.files.map(f=>f.path)).size!==s.files.length||s.files.some(f=>!safeRelative(f.path)||!/^[a-f0-9]{64}$/.test(f.sha256)||!Number.isInteger(f.size)||f.size<0))throw Error('Chemin ou empreinte de journal invalide.');return s;}
async function checkFiles(dest,files){for(const f of files){await noLinks(dest,f.path);if(!await exists(join(dest,f.path)))throw Error('Fichier divergent : '+f.path);const bytes=await readFile(join(dest,f.path));if(bytes.length!==f.size||sha(bytes)!==f.sha256)throw Error('Fichier divergent : '+f.path);}const actual=await inventory(dest);if(actual.length!==files.length)throw Error('Des fichiers supplémentaires sont présents dans le DLC.');}
export async function install(target,{remove=false,upgrade=false,failAfterCopy=false,failAfterCommit=false}={}){
 if(!target)throw Error('Indiquez le dossier du projet Tantalus Frontier.');
 const root=await realpath(resolve(target));if(root===packageRoot)throw Error('La destination doit être Tantalus, pas cette archive.');
 if(remove&&upgrade)throw Error('Choisissez --remove ou --upgrade, pas les deux.');
 const versions=VERSIONS.map(v=>({version:v+'-candidate.1',rel:'.dlc-installations/river-of-pain-v'+v+'.json',backRel:'.dlc-backups/river-of-pain-v'+v+'/index.html'}));
 for(const rel of ['index.html','package.json','src/river-of-pain',...versions.flatMap(v=>[v.rel,v.backRel])])await noLinks(root,rel);
 for(const v of versions){v.path=join(root,v.rel);v.text=await exists(v.path)?await readFile(v.path,'utf8'):null;}
 const registered=versions.filter(v=>v.text!==null);if(registered.length>1)throw Error('Journaux concurrents : vérifiez la dernière installation avant de continuer.');
 const currentVersion=versions[0],newPath=currentVersion.path,backupPath=join(root,currentVersion.backRel);
 const dest=join(root,'src/river-of-pain'),indexPath=join(root,'index.html');
 const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));if(pkg.name!=='aliens-tantalus-frontier')throw Error('Ce dossier n’est pas le projet aliens-tantalus-frontier.');
 const current=await readFile(indexPath,'utf8'),entry=registered[0],active=entry?journal(JSON.parse(entry.text),entry.version):null;
 const isCurrent=active?.version===VERSION;
 let original=current;
 if(active){if(sha(current)!==active.indexAfter)throw Error('index.html a changé depuis l’installation. Opération refusée pour préserver vos modifications.');await checkFiles(dest,active.files);original=await readFile(join(root,entry.backRel),'utf8');if(sha(original)!==active.indexBefore)throw Error('Sauvegarde de index.html altérée.');
  if(isCurrent&&!remove){const expected=await inventory(payload);if(JSON.stringify(expected)!==JSON.stringify(active.files))throw Error('Cette version porte des fichiers différents : aucune substitution silencieuse.');return {ok:true,action:'already-installed',files:active.files.length};}
  if(!isCurrent&&!remove&&!upgrade)throw Error('Version '+active.version+' détectée. Relancez avec --upgrade pour la remplacer sans toucher aux autres DLC.');
 }else{if(remove)throw Error('Aucune installation enregistrée à retirer.');if(upgrade)throw Error('Aucune version antérieure enregistrée à mettre à niveau.');if(!current.includes('/src/app.js')||!current.includes('id="title-menu"')||!current.includes('data-panel="archives"')||!/<\/body>/i.test(current))throw Error('Structure hôte inconnue. Aucun fichier n’a été changé.');if(current.includes('RIVER-OF-PAIN-LAUNCHER')||await exists(dest))throw Error('Un DLC ou un marqueur existe déjà sans journal reconnu. Aucun écrasement.');}
 const files=remove?[]:await inventory(payload),after=original.replace(/<\/body>/i,injection+'</body>');
 if(!remove&&await exists(backupPath)&&sha(await readFile(backupPath))!==sha(original))throw Error('Une sauvegarde antérieure différente existe. Elle ne sera pas écrasée.');
 await mkdir(join(root,'.dlc-installations'),{recursive:true});const tx=await mkdtemp(join(root,'.dlc-installations/rop-txn-'));
 let oldMoved=false,newMoved=false,indexChanged=false,backupCreated=false,committed=false;
 try{
  if(!remove){await cp(payload,join(tx,'next'),{recursive:true,errorOnExist:true,force:false});await checkFiles(join(tx,'next'),files);}
  if(failAfterCopy)throw Error('TEST_ONLY_FAILURE_AFTER_COPY');
  if(active){await rename(dest,join(tx,'previous'));oldMoved=true;}
  if(!remove){await mkdir(dirname(dest),{recursive:true});await rename(join(tx,'next'),dest);newMoved=true;if(!await exists(backupPath)){await mkdir(dirname(backupPath),{recursive:true});await writeFile(backupPath,original,{flag:'wx'});backupCreated=true;}}
  await writeFile(join(tx,'next-index'),remove?original:after);await rename(join(tx,'next-index'),indexPath);indexChanged=true;
  if(remove){await rm(entry.path);}else{
   const state={id:'river-of-pain',version:VERSION,observedHostVersion:pkg.version,referenceCommit:'496996f5ea557d970ec625aa346876f3eaed1c5f',upgradedFrom:active?.version||null,indexBefore:sha(original),indexAfter:sha(after),files};
   await writeFile(join(tx,'next-state'),JSON.stringify(state,null,2));await rename(join(tx,'next-state'),newPath);if(entry&&entry.path!==newPath)await rm(entry.path);
  }
  if(failAfterCommit)throw Error('TEST_ONLY_FAILURE_AFTER_COMMIT');
  committed=true;return {ok:true,action:remove?'removed':active?'upgraded':'installed',version:VERSION,files:remove?active.files.length:files.length,hostVersion:pkg.version,qualification:'Fixtures and additive launcher only; native Tantalus build and deployment not certified.'};
 }catch(error){
  if(newMoved)await rm(dest,{recursive:true,force:true});if(oldMoved)await rename(join(tx,'previous'),dest);if(indexChanged)await writeFile(indexPath,current);
  for(const v of versions){if(v.text!==null)await writeFile(v.path,v.text);else await rm(v.path,{force:true});}
  if(backupCreated)await rm(backupPath,{force:true});throw error;
 }finally{if(committed||(!oldMoved||await exists(dest)))await rm(tx,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),unknown=args.filter(a=>a.startsWith('--')&&!['--remove','--upgrade'].includes(a));if(unknown.length)throw Error('Option inconnue : '+unknown.join(', '));const targets=args.filter(a=>!a.startsWith('--'));if(targets.length!==1)throw Error('Usage : node tools/install.mjs DOSSIER_TANTALUS [--upgrade | --remove]');console.log(JSON.stringify(await install(targets[0],{remove:args.includes('--remove'),upgrade:args.includes('--upgrade')}),null,2));}
 catch(e){console.error('Installation arrêtée : '+e.message);process.exitCode=1;}
}
