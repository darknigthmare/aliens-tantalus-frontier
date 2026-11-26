import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const JOURNAL='.alien-earth-v11-install.json',BACKUP='.alien-earth-v11-index-before.html',SUB='dlc/alien-earth-v11';
const OWNED=[`${SUB}/JOUER_ALIEN_EARTH_V11.html`,`${SUB}/launcher.js`];
const MARKER='<!-- ALIEN_EARTH_V11_BEGIN -->\n<script defer src="./dlc/alien-earth-v11/launcher.js"></script>\n<!-- ALIEN_EARTH_V11_END -->\n';
export const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
function atomic(file,data){const tmp=file+'.earth-tmp';try{fs.writeFileSync(tmp,data,{flag:'wx'});fs.renameSync(tmp,file);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
export function hostPreflight(root){
 root=fs.realpathSync(root);const p=JSON.parse(read(path.join(root,'package.json')));
 if(p.name!=='aliens-tantalus-frontier')throw new Error('Le dossier cible n’est pas le projet aliens-tantalus-frontier.');
 const index=read(path.join(root,'index.html'));
 if(!index.includes('id="title-menu"')||!index.includes('data-panel="operations"')||!index.includes('</body>'))throw new Error('Les points d’entrée vérifiés du jeu hôte sont absents. Aucune modification.');
 for(const relative of ['dlc',SUB]){const dest=path.join(root,relative);if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw new Error('Un dossier de destination est un lien symbolique. Aucune modification.');}
 return {root,index};
}
export function install(root,{apply=false,source=HERE}={}){
 const host=hostPreflight(root);root=host.root;
 if(['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10'].some(v=>host.index.includes('ALIEN_EARTH_'+v+'_BEGIN')||fs.existsSync(path.join(root,'.alien-earth-'+v.toLowerCase()+'-install.json'))))throw new Error('Un ancien lanceur V1, V2, V3, V4, V5, V6, V7, V8, V9 ou V10 est encore installé. Désinstallez-le avec le script de votre ancien paquet avant d’installer la V11. Les sauvegardes locales ne sont pas supprimées.');
 const journalPath=path.join(root,JOURNAL);
 if(fs.existsSync(journalPath)){
  const j=JSON.parse(read(journalPath));
  if(j.dlc!=='alien-earth-s1'||j.marker!==MARKER||!host.index.includes(MARKER))throw new Error('Journal d’installation incompatible ou lanceur modifié.');
  for(const file of OWNED)if(!fs.existsSync(path.join(root,file))||sha(fs.readFileSync(path.join(root,file)))!==j.files?.[file])throw new Error('Installation existante modifiée : '+file);
  return {status:'already-installed',changed:[],apply};
 }
 if(host.index.includes('ALIEN_EARTH_V11_BEGIN'))throw new Error('Un marqueur Alien: Earth existe sans journal ; arrêt sans modification.');
 for(const dest of [...OWNED,JOURNAL,BACKUP])if(fs.existsSync(path.join(root,dest)))throw new Error('Un fichier de destination existe déjà : '+dest);
 const sourceFiles=[path.join(source,'JOUER_ALIEN_EARTH_V11.html'),path.join(source,'integration','launcher.js')];
 const bytes=sourceFiles.map(f=>fs.readFileSync(f));
 const patched=host.index.replace('</body>',MARKER+'</body>');
 const j={dlc:'alien-earth-s1',version:'11.0.0',marker:MARKER,originalIndexHash:sha(host.index),patchedIndexHash:sha(patched),files:Object.fromEntries(OWNED.map((f,i)=>[f,sha(bytes[i])]))};
 if(!apply)return {status:'dry-run',changed:['index.html',...OWNED,JOURNAL,BACKUP],apply:false};
 let indexChanged=false;const created=[];
 try{
  fs.mkdirSync(path.join(root,SUB),{recursive:true});
  fs.writeFileSync(path.join(root,BACKUP),host.index,{flag:'wx'});created.push(BACKUP);
  OWNED.forEach((name,i)=>{fs.writeFileSync(path.join(root,name),bytes[i],{flag:'wx'});created.push(name);});
  fs.writeFileSync(journalPath,JSON.stringify(j,null,2),{flag:'wx'});created.push(JOURNAL);
  if(sha(read(path.join(root,'index.html')))!==j.originalIndexHash)throw new Error('index.html a changé pendant la préparation. Aucune version concurrente ne sera remplacée.');
  atomic(path.join(root,'index.html'),patched);indexChanged=true;
 }catch(e){
  if(indexChanged)atomic(path.join(root,'index.html'),host.index);
  for(const f of created.reverse())if(fs.existsSync(path.join(root,f)))fs.unlinkSync(path.join(root,f));
  throw e;
 }
 return {status:'installed',changed:['index.html',...OWNED,JOURNAL,BACKUP],apply:true};
}
export function uninstall(root,{apply=false}={}){
 const host=hostPreflight(root);root=host.root;const jp=path.join(root,JOURNAL);
 if(!fs.existsSync(jp))throw new Error('Aucune installation journalisée dans ce projet.');
 const j=JSON.parse(read(jp));if(j.dlc!=='alien-earth-s1'||j.marker!==MARKER)throw new Error('Journal incompatible.');
 if(host.index.split(MARKER).length!==2)throw new Error('Le bloc du lanceur a été modifié. Arrêt pour préserver vos changements.');
 for(const file of OWNED)if(!fs.existsSync(path.join(root,file))||sha(fs.readFileSync(path.join(root,file)))!==j.files?.[file])throw new Error('Fichier modifié, suppression refusée : '+file);
 if(!fs.existsSync(path.join(root,BACKUP))||sha(fs.readFileSync(path.join(root,BACKUP)))!==j.originalIndexHash)throw new Error('Copie de sécurité absente ou modifiée.');
 if(!apply)return {status:'dry-run-uninstall',changed:['index.html',...OWNED,JOURNAL,BACKUP],apply:false};
 // Strip only this exact block. Edits to other parts of index.html are preserved.
 if(read(path.join(root,'index.html'))!==host.index)throw new Error('index.html a changé pendant la préparation. Relancez la vérification.');
 atomic(path.join(root,'index.html'),host.index.replace(MARKER,''));
 for(const f of [...OWNED,JOURNAL,BACKUP])fs.unlinkSync(path.join(root,f));
 if(fs.readdirSync(path.join(root,SUB)).length===0)fs.rmdirSync(path.join(root,SUB));
 return {status:'uninstalled',changed:['index.html',...OWNED,JOURNAL,BACKUP],apply:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),root=args.find(x=>!x.startsWith('--'));
 if(!root){console.error('Usage : node scripts/install-alien-earth.mjs <dossier-du-jeu> [--apply] [--uninstall]\nSans --apply : lecture et simulation uniquement.');process.exitCode=2;}
 else try{console.log(JSON.stringify(args.includes('--uninstall')?uninstall(root,{apply:args.includes('--apply')}):install(root,{apply:args.includes('--apply')}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
