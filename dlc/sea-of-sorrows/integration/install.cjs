#!/usr/bin/env node
'use strict';
/* Installs a standalone route only; NEVER edits the host game or its save schema. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const FILES=['index.html','styles.css','src/data.js','src/core.js','src/render.js','src/world-art.js','src/tactics-art.js','src/controls.js','src/support.js','src/soundscape.js','src/main.js','MER_DES_CHAGRINS_JOUABLE.html'];
const RECEIPT='.sorrows-install.json',NAME='sea-of-sorrows';
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function safeDir(p){if(fs.existsSync(p)&&(!fs.lstatSync(p).isDirectory()||fs.lstatSync(p).isSymbolicLink()))throw Error('Répertoire non sûr : '+p);}
function readReceipt(dest){const file=path.join(dest,RECEIPT);if(!fs.existsSync(file))throw Error('Destination existante sans reçu : aucune modification.');const r=JSON.parse(fs.readFileSync(file,'utf8'));if(r.id!==NAME||!r.files||Object.keys(r.files).sort().join('|')!==FILES.slice().sort().join('|'))throw Error('Reçu incompatible.');return r;}
function walk(p,base=p){return fs.readdirSync(p).flatMap(n=>{const f=path.join(p,n),s=fs.lstatSync(f);if(s.isSymbolicLink())throw Error('Lien symbolique refusé : '+f);return s.isDirectory()?walk(f,base):[path.relative(base,f).split(path.sep).join('/')];});}
function verifyOwned(dest,r){for(const f of FILES){const full=path.join(dest,f);if(!fs.existsSync(full)||sha(full)!==r.files[f])throw Error('Fichier local modifié ou absent : '+f);}const extras=walk(dest).filter(f=>f!==RECEIPT&&!FILES.includes(f));if(extras.length)throw Error('Fichiers additionnels présents : désinstallation refusée.');}
function install(target,uninstall=false){
 if(!target)throw Error('Usage : node integration/install.cjs CHEMIN_DU_PROJET [--uninstall]');
 const project=path.resolve(target);safeDir(project);if(!fs.existsSync(path.join(project,'index.html')))throw Error('Le projet cible doit posséder un index.html.');
 const parent=path.join(project,'dlc'),dest=path.join(parent,NAME);safeDir(parent);safeDir(dest);
 if(uninstall){if(!fs.existsSync(dest))return {status:'already-absent'};const r=readReceipt(dest);verifyOwned(dest,r);fs.rmSync(dest,{recursive:true});return {status:'uninstalled',hostModified:false};}
 const hashes=Object.fromEntries(FILES.map(f=>[f,sha(path.join(ROOT,f))]));
 if(fs.existsSync(dest)){const r=readReceipt(dest);verifyOwned(dest,r);if(FILES.some(f=>r.files[f]!==hashes[f]))throw Error('Une autre version est présente : conserver vos fichiers avant de remplacer.');return {status:'already-installed',route:'/dlc/sea-of-sorrows/',hostModified:false};}
 fs.mkdirSync(parent,{recursive:true});const stage=fs.mkdtempSync(path.join(parent,'.sorrows-staging-'));
 try{for(const f of FILES){const to=path.join(stage,f);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(ROOT,f),to);if(sha(to)!==hashes[f])throw Error('Contrôle de copie en échec : '+f);}
 fs.writeFileSync(path.join(stage,RECEIPT),JSON.stringify({id:NAME,version:'0.10.0',hostModified:false,files:hashes},null,2));fs.renameSync(stage,dest);
 }catch(e){fs.rmSync(stage,{recursive:true,force:true});throw e;}
 return {status:'installed',route:'/dlc/sea-of-sorrows/',hostModified:false};
}
if(require.main===module){try{console.log(JSON.stringify(install(process.argv[2],process.argv.includes('--uninstall')),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={install,FILES};
