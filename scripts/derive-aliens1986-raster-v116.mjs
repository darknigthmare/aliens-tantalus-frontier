#!/usr/bin/env node
import {readFile,writeFile,mkdir,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateSpriteEntriesV116} from '../modules/aliens-1986/v116/sprite-loader-v116.mjs';
export const SOURCE_FILES_V116=Object.freeze([
  'modules/aliens-1986/v116/sprite-loader-v116.mjs',
  'modules/aliens-1986/v116/raster-renderer-v116.mjs'
]);
export const MANIFEST_PATH_V116='docs/development/aliens-1986-sprites-v116/manifest.json';
export const V114_HTML_PATH='modules/aliens-1986/v114/JOUER_ALIENS_V114.html';
export const V114_HTML_SHA256='9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d';
const hash=value=>createHash('sha256').update(value).digest('hex');
export function parseAliens1986RegistryV116(html) {
  const start=html.indexOf('const registry=')+'const registry='.length,end=html.indexOf(', urls=new Map();',start);
  if(start<'const registry='.length || end<start)throw new Error('V114 embedded module registry was not found.');
  return {registry:JSON.parse(html.slice(start,end)),start,end};
}
function replaceOnce(source,needle,replacement) {
  const first=source.indexOf(needle);
  if(first<0 || source.indexOf(needle,first+needle.length)>=0)throw new Error('V114 presentation anchor changed: '+needle);
  return source.slice(0,first)+replacement+source.slice(first+needle.length);
}
export async function renderAliens1986RasterV116({root=process.cwd()}={}) {
  const base=await readFile(resolve(root,V114_HTML_PATH),'utf8');
  if(hash(base)!==V114_HTML_SHA256)throw new Error('The preserved V114 HTML failed its immutable hash.');
  const manifestText=await readFile(resolve(root,MANIFEST_PATH_V116),'utf8'),manifest=JSON.parse(manifestText);
  if(!Array.isArray(manifest.assets))throw new Error('Missing raster asset manifest.');
  const entries=validateSpriteEntriesV116(manifest.assets),assets=[],sourceHashes={},seenPaths=new Set();
  const canonicalRoot=await realpath(resolve(root)),assetScope=resolve(canonicalRoot,'assets')+sep;
  for(const entry of entries) {
    const original=manifest.assets.find(a=>a.id===entry.id);
    if(!/^[0-9a-f]{64}$/.test(original.sha256||''))throw new Error('Missing sprite hash: '+entry.id);
    if(seenPaths.has(entry.path))throw new Error('Duplicate raster path in manifest: '+entry.path);
    seenPaths.add(entry.path);
    const assetPath=resolve(canonicalRoot,entry.path),stat=await lstat(assetPath),canonicalAsset=await realpath(assetPath);
    if(!stat.isFile() || canonicalAsset!==assetPath || !canonicalAsset.startsWith(assetScope))throw new Error('Raster asset must be a regular file without aliases inside the repository assets directory: '+entry.path);
    const bytes=await readFile(assetPath),sha256=hash(bytes);
    if(sha256!==original.sha256 || original.bytes!==undefined&&original.bytes!==bytes.length)throw new Error('Raster file failed integrity validation: '+entry.path);
    assets.push({id:entry.id,path:entry.path,sha256,bytes:bytes.length});
  }
  const {registry,start,end}=parseAliens1986RegistryV116(base);
  const runtimeKeys=['v116/sprite-loader-v116.mjs','v116/raster-renderer-v116.mjs'];
  for(let index=0;index<SOURCE_FILES_V116.length;index++) {
    const path=SOURCE_FILES_V116[index],source=await readFile(resolve(root,path),'utf8'),sha256=hash(source);
    sourceHashes[path]=sha256;
    registry[runtimeKeys[index]]={source,sha256,deps:index?{'./sprite-loader-v116.mjs':'v116/sprite-loader-v116.mjs'}:{}};
  }
  const renderer=registry['preview/renderer.mjs'];
  if(!renderer)throw new Error('V114 renderer was not found.');
  renderer.source=replaceOnce(renderer.source,
    "import {human,filmProp,filmBackdrop} from './film-renderer-v114.mjs';",
    "import {human,filmProp,filmBackdrop,weapon as rasterFallbackWeaponV116} from './film-renderer-v114.mjs';\nimport {installRasterRendererV116} from '../v116/raster-renderer-v116.mjs';");
  renderer.source=replaceOnce(renderer.source,
    '      if(structural){const box=hatchBox(e)',
    '      this.rasterHatchSurfaceV116(hatchBox(e),{structural,linkOpen,opening});\n      if(structural){const box=hatchBox(e)');
  renderer.source+='\ninstallRasterRendererV116(Renderer,'+JSON.stringify(entries)+',{fallbackWeapon:rasterFallbackWeaponV116});\n';
  renderer.deps['../v116/raster-renderer-v116.mjs']='v116/raster-renderer-v116.mjs';
  renderer.sha256=hash(renderer.source);
  const app=registry['preview/app.mjs'];
  app.source=replaceOnce(app.source,'Les costumes sont distincts mais restent procéduraux stylisés.',
    'Les images disponibles habillent les personnages et objets ; les poses absentes gardent le rendu de secours. Les clés de pose ne constituent pas des cycles animés complets.');
  app.sha256=hash(app.source);
  const fidelity=registry['src/fidelity-v114.mjs'];
  fidelity.source=replaceOnce(fidelity.source,'Œufs et ovipositeur procéduraux','Œufs et ovipositeur de décor');
  fidelity.sha256=hash(fidelity.source);
  let html=base.slice(0,start)+JSON.stringify(registry).replace(/<\//g,'<\\/')+base.slice(end);
  html=replaceOnce(html,'<title>','<meta name="aliens-raster-version" content="116"><title>');
  return {html,sha256:hash(html),assets,sourceHashes,manifestSha256:hash(manifestText),baseSha256:V114_HTML_SHA256};
}
export async function writeAliens1986RasterV116({root=process.cwd(),destination=resolve(root,'dist/dlc/aliens-1986/game.html')}={}) {
  if([V114_HTML_PATH,'dlc/aliens-1986/game.html'].some(path=>resolve(destination)===resolve(root,path)))throw new Error('Cannot overwrite a preserved V114 source HTML.');
  const result=await renderAliens1986RasterV116({root});
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,result.html,'utf8');
  return {...result,destination};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const result=await writeAliens1986RasterV116();
  process.stdout.write(JSON.stringify({path:result.destination,sha256:result.sha256,assets:result.assets.length,sourceHashes:result.sourceHashes})+'\n');
}
