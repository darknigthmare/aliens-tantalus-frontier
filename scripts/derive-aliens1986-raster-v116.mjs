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
export const SOURCE_FILES_V118=Object.freeze(['modules/aliens-1986/v118/raster-props-v118.mjs']);
export const SOURCE_FILES_V119=Object.freeze(['modules/aliens-1986/v119/raster-furniture-v119.mjs']);
export const SOURCE_FILES_V120=Object.freeze(['modules/aliens-1986/v120/raster-furniture-v120.mjs']);
export const MANIFEST_PATH_V116='docs/development/aliens-1986-sprites-v116/manifest.json';
export const MANIFEST_SHA256_V116='b9213752445a01e293f44bccface374d3d3882e8ae071baefaa75bf04d589af6';
export const SUPPLEMENT_PATH_V117='docs/development/aliens-1986-sprites-v117/manifest.json';
export const SUPPLEMENT_SHA256_V117='09df948f5ee55c2b9b2494924475b7113468edddfa4d803caaf1323ee4804a62';
export const SUPPLEMENT_IDS_V117=Object.freeze([
  'door-leaf-damaged','door-leaf-reinforced','door-leaf-breached','meal-tray-food',
  'supply-case-medical-empty','supply-case-ammo-closed','supply-case-ammo-empty'
]);
export const SUPPLEMENT_PATH_V118='docs/development/aliens-1986-sprites-v118/manifest.json';
export const SUPPLEMENT_PATHS_V118=Object.freeze(Object.fromEntries([
  ['engineering-case-stocked','props'],['gateway-inquiry-display','props'],
  ['service-control-pedestal','props'],['medical-counter-terminal','props'],
  ['optics-calibration-terminal','props'],['valve-indicator-panel','props'],
  ['sulaco-briefing-terminal','props'],['operations-table-terminal','props'],
  ['sentry-aim-front-right','equipment'],['sentry-aim-rear-right','equipment'],
  ['sentry-aim-rear','equipment'],
].map(([id,category])=>[id,'assets/dlc/aliens-1986/v118/'+category+'/'+id+'.png'])));
export const SUPPLEMENT_IDS_V118=Object.freeze(Object.keys(SUPPLEMENT_PATHS_V118));
export const SUPPLEMENT_SHA256_V118='ba671cbbd67b8d16fe7b1173fb0f61240e05d0379431589b35a7a81dec963d9e';
export const SUPPLEMENT_PATH_V119='docs/development/aliens-1986-sprites-v119/manifest.json';
export const SUPPLEMENT_IDS_V119=Object.freeze([
  'medlab-bed','medlab-storage-cabinet','reserve-service-locker',
  'operations-storage-rack','sulaco-mess-table','operations-command-table',
]);
export const SUPPLEMENT_PATHS_V119=Object.freeze(Object.fromEntries(SUPPLEMENT_IDS_V119.map(id=>
  [id,'assets/dlc/aliens-1986/v119/furniture/'+id+'.png'])));
export const SUPPLEMENT_SHA256_V119='ea0eac131e69262aafb1a08398013b941d0cb028c831892752dd6a9ca3c19fb0';
export const SUPPLEMENT_PATH_V120='docs/development/aliens-1986-sprites-v120/manifest.json';
export const SUPPLEMENT_IDS_V120=Object.freeze([
  'reserve-medical-counter','utility-storage-cabinet','optics-workbench','operations-display-bank',
]);
export const SUPPLEMENT_PATHS_V120=Object.freeze(Object.fromEntries(SUPPLEMENT_IDS_V120.map(id=>
  [id,'assets/dlc/aliens-1986/v120/furniture/'+id+'.png'])));
export const V114_HTML_PATH='modules/aliens-1986/v114/JOUER_ALIENS_V114.html';
export const V114_HTML_SHA256='9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d';
const hash=value=>createHash('sha256').update(value).digest('hex');

/** The V117 prop supplement only appends reviewed keys. The published V116
 * manifest and all 123 original asset records retain their exact bytes. */
export function compileAliens1986RasterSupplementV117(baseText,supplementText) {
  if(hash(baseText)!==MANIFEST_SHA256_V116)throw new Error('The preserved V116 manifest failed its immutable hash.');
  const base=JSON.parse(baseText),supplement=JSON.parse(supplementText);
  if(supplement.schema!=='aliens1986-raster-supplement-v117' || supplement.version!==117 || supplement.presentationVersion!==116)throw new Error('Unsupported V117 raster supplement.');
  const predecessor=supplement.baseManifest;
  if(predecessor?.path!==MANIFEST_PATH_V116 || predecessor.sha256!==MANIFEST_SHA256_V116 || predecessor.assetCount!==123 || base.assets.length!==123)throw new Error('Broken V117 raster manifest predecessor.');
  if(!Array.isArray(supplement.assets) || supplement.assets.length!==SUPPLEMENT_IDS_V117.length)throw new Error('V117 must contain the seven reviewed prop variants.');
  if(supplement.counts?.base!==123 || supplement.counts.added!==7 || supplement.counts.total!==130)throw new Error('V117 raster supplement counts disagree.');
  for(const asset of supplement.assets) {
    if(!asset || !SUPPLEMENT_IDS_V117.includes(asset.id))throw new Error('Unreviewed V117 sprite id.');
    if(typeof asset.path!=='string' || !/^assets\/dlc\/aliens-1986\/v117\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.png$/.test(asset.path))throw new Error('Invalid V117 sprite path: '+asset.id);
    if(asset.runtimeEligible!==true)throw new Error('V117 prop variant must remain eligible: '+asset.id);
    if(!/^[a-f0-9]{64}$/.test(asset.sha256||'') || !Number.isSafeInteger(asset.bytes) || asset.bytes<=0)throw new Error('Invalid V117 sprite integrity record: '+asset.id);
  }
  const assets=[...base.assets,...supplement.assets],ids=new Set(),paths=new Set();
  for(const asset of assets) {
    if(ids.has(asset.id))throw new Error('Duplicate raster id across V116 and V117: '+asset.id);
    if(paths.has(asset.path))throw new Error('Duplicate raster path across V116 and V117: '+asset.path);
    ids.add(asset.id);paths.add(asset.path);
  }
  const entries=validateSpriteEntriesV116(assets);
  return {assets,entries,baseAssetCount:base.assets.length,supplementAssetCount:supplement.assets.length};
}

/** V118 preserves both published manifests and appends only the eleven reviewed
 * presentation assets. A changed predecessor cannot authorize a replacement. */
export function compileAliens1986RasterSupplementV118(baseText,previousText,supplementText) {
  if(hash(previousText)!==SUPPLEMENT_SHA256_V117)throw new Error('The preserved V117 manifest failed its immutable hash.');
  const previous=compileAliens1986RasterSupplementV117(baseText,previousText),supplement=JSON.parse(supplementText);
  if(supplement.schema!=='aliens1986-raster-supplement-v118' || supplement.version!==118 || supplement.presentationVersion!==118)throw new Error('Unsupported V118 raster supplement.');
  const expected=[
    {path:MANIFEST_PATH_V116,sha256:MANIFEST_SHA256_V116,assetCount:123},
    {path:SUPPLEMENT_PATH_V117,sha256:SUPPLEMENT_SHA256_V117,assetCount:7},
  ];
  if(!Array.isArray(supplement.baseManifests) || supplement.baseManifests.length!==2 || expected.some((base,index)=>
    Object.entries(base).some(([key,value])=>supplement.baseManifests[index]?.[key]!==value)))throw new Error('Broken V118 raster manifest predecessors.');
  if(!Array.isArray(supplement.assets) || supplement.assets.length!==11)throw new Error('V118 must contain the eleven reviewed prop and sentry images.');
  if(supplement.counts?.base!==130 || supplement.counts.added!==11 || supplement.counts.total!==141)throw new Error('V118 raster supplement counts disagree.');
  for(const asset of supplement.assets) {
    if(!asset || !SUPPLEMENT_IDS_V118.includes(asset.id))throw new Error('Unreviewed V118 sprite id.');
    if(asset.path!==SUPPLEMENT_PATHS_V118[asset.id])throw new Error('Invalid V118 sprite path: '+asset.id);
    if(asset.runtimeEligible!==true)throw new Error('V118 presentation image must remain eligible: '+asset.id);
    if(!/^[a-f0-9]{64}$/.test(asset.sha256||'') || !Number.isSafeInteger(asset.bytes) || asset.bytes<=0)throw new Error('Invalid V118 sprite integrity record: '+asset.id);
  }
  const assets=[...previous.assets,...supplement.assets],ids=new Set(),paths=new Set();
  for(const asset of assets) {
    if(ids.has(asset.id))throw new Error('Duplicate raster id across V116, V117 and V118: '+asset.id);
    if(paths.has(asset.path))throw new Error('Duplicate raster path across V116, V117 and V118: '+asset.path);
    ids.add(asset.id);paths.add(asset.path);
  }
  return {assets,entries:validateSpriteEntriesV116(assets),baseAssetCount:130,supplementAssetCount:11};
}

export function parseAliens1986RegistryV116(html) {
  const start=html.indexOf('const registry=')+'const registry='.length,end=html.indexOf(', urls=new Map();',start);
  if(start<'const registry='.length || end<start)throw new Error('V114 embedded module registry was not found.');
  return {registry:JSON.parse(html.slice(start,end)),start,end};
}

/** V119 adds only the six furniture records. The three predecessor manifests
 * remain immutable, and the physical V114 scene definitions remain untouched. */
export function compileAliens1986RasterSupplementV119(baseText,v117Text,v118Text,supplementText) {
  if(hash(v118Text)!==SUPPLEMENT_SHA256_V118)throw new Error('The preserved V118 manifest failed its immutable hash.');
  const previous=compileAliens1986RasterSupplementV118(baseText,v117Text,v118Text),supplement=JSON.parse(supplementText);
  if(supplement.schema!=='aliens1986-raster-supplement-v119' || supplement.version!==119 || supplement.presentationVersion!==119)throw new Error('Unsupported V119 raster supplement.');
  const expected=[
    {path:MANIFEST_PATH_V116,sha256:MANIFEST_SHA256_V116,assetCount:123},
    {path:SUPPLEMENT_PATH_V117,sha256:SUPPLEMENT_SHA256_V117,assetCount:7},
    {path:SUPPLEMENT_PATH_V118,sha256:SUPPLEMENT_SHA256_V118,assetCount:11},
  ];
  if(!Array.isArray(supplement.baseManifests) || supplement.baseManifests.length!==3 || expected.some((base,index)=>
    Object.entries(base).some(([key,value])=>supplement.baseManifests[index]?.[key]!==value)))throw new Error('Broken V119 raster manifest predecessors.');
  if(!Array.isArray(supplement.assets) || supplement.assets.length!==6)throw new Error('V119 must contain the six reviewed furniture images.');
  if(supplement.counts?.base!==141 || supplement.counts.added!==6 || supplement.counts.total!==147)throw new Error('V119 raster supplement counts disagree.');
  for(const asset of supplement.assets) {
    if(!asset || !SUPPLEMENT_IDS_V119.includes(asset.id))throw new Error('Unreviewed V119 sprite id.');
    if(asset.path!==SUPPLEMENT_PATHS_V119[asset.id])throw new Error('Invalid V119 sprite path: '+asset.id);
    if(asset.runtimeEligible!==true || asset.frameCount!==1 || asset.animated!==false || asset.filmFidelityValidated!==false)throw new Error('Unsupported V119 presentation claim: '+asset.id);
    if(!/^[a-f0-9]{64}$/.test(asset.sha256||'') || !Number.isSafeInteger(asset.bytes) || asset.bytes<=0)throw new Error('Invalid V119 sprite integrity record: '+asset.id);
  }
  const assets=[...previous.assets,...supplement.assets],ids=new Set(),paths=new Set();
  for(const asset of assets) {
    if(ids.has(asset.id))throw new Error('Duplicate raster id across V116–V119: '+asset.id);
    if(paths.has(asset.path))throw new Error('Duplicate raster path across V116–V119: '+asset.path);
    ids.add(asset.id);paths.add(asset.path);
  }
  return {assets,entries:validateSpriteEntriesV116(assets),baseAssetCount:141,supplementAssetCount:6};
}

/** V120 appends four furniture images. Six new placements also reuse a V119
 * rack and share one cabinet; reuse does not duplicate catalog records. */
export function compileAliens1986RasterSupplementV120(baseText,v117Text,v118Text,v119Text,supplementText) {
  if(hash(v119Text)!==SUPPLEMENT_SHA256_V119)throw new Error('The preserved V119 manifest failed its immutable hash.');
  const previous=compileAliens1986RasterSupplementV119(baseText,v117Text,v118Text,v119Text),supplement=JSON.parse(supplementText);
  if(supplement.schema!=='aliens1986-raster-supplement-v120' || supplement.version!==120 || supplement.presentationVersion!==120)throw new Error('Unsupported V120 raster supplement.');
  const expected=[
    {path:MANIFEST_PATH_V116,sha256:MANIFEST_SHA256_V116,assetCount:123},
    {path:SUPPLEMENT_PATH_V117,sha256:SUPPLEMENT_SHA256_V117,assetCount:7},
    {path:SUPPLEMENT_PATH_V118,sha256:SUPPLEMENT_SHA256_V118,assetCount:11},
    {path:SUPPLEMENT_PATH_V119,sha256:SUPPLEMENT_SHA256_V119,assetCount:6},
  ];
  if(!Array.isArray(supplement.baseManifests) || supplement.baseManifests.length!==4 || expected.some((base,index)=>
    Object.entries(base).some(([key,value])=>supplement.baseManifests[index]?.[key]!==value)))throw new Error('Broken V120 raster manifest predecessors.');
  if(!Array.isArray(supplement.assets) || supplement.assets.length!==4)throw new Error('V120 must contain the four reviewed furniture images.');
  if(supplement.counts?.base!==147 || supplement.counts.added!==4 || supplement.counts.total!==151)throw new Error('V120 raster supplement counts disagree.');
  for(const asset of supplement.assets) {
    if(!asset || !SUPPLEMENT_IDS_V120.includes(asset.id))throw new Error('Unreviewed V120 sprite id.');
    if(asset.path!==SUPPLEMENT_PATHS_V120[asset.id])throw new Error('Invalid V120 sprite path: '+asset.id);
    if(asset.runtimeEligible!==true || asset.frameCount!==1 || asset.animated!==false || asset.filmFidelityValidated!==false)throw new Error('Unsupported V120 presentation claim: '+asset.id);
    if(!/^[a-f0-9]{64}$/.test(asset.sha256||'') || !Number.isSafeInteger(asset.bytes) || asset.bytes<=0)throw new Error('Invalid V120 sprite integrity record: '+asset.id);
  }
  const assets=[...previous.assets,...supplement.assets],ids=new Set(),paths=new Set();
  for(const asset of assets) {
    if(ids.has(asset.id))throw new Error('Duplicate raster id across V116–V120: '+asset.id);
    if(paths.has(asset.path))throw new Error('Duplicate raster path across V116–V120: '+asset.path);
    ids.add(asset.id);paths.add(asset.path);
  }
  return {assets,entries:validateSpriteEntriesV116(assets),baseAssetCount:147,supplementAssetCount:4};
}
function replaceOnce(source,needle,replacement) {
  const first=source.indexOf(needle);
  if(first<0 || source.indexOf(needle,first+needle.length)>=0)throw new Error('V114 presentation anchor changed: '+needle);
  return source.slice(0,first)+replacement+source.slice(first+needle.length);
}
export async function renderAliens1986RasterV116({root=process.cwd()}={}) {
  const base=await readFile(resolve(root,V114_HTML_PATH),'utf8');
  if(hash(base)!==V114_HTML_SHA256)throw new Error('The preserved V114 HTML failed its immutable hash.');
  const manifestText=await readFile(resolve(root,MANIFEST_PATH_V116),'utf8'),supplementText=await readFile(resolve(root,SUPPLEMENT_PATH_V117),'utf8');
  const supplementV118Text=await readFile(resolve(root,SUPPLEMENT_PATH_V118),'utf8');
  const supplementV119Text=await readFile(resolve(root,SUPPLEMENT_PATH_V119),'utf8');
  const supplementV120Text=await readFile(resolve(root,SUPPLEMENT_PATH_V120),'utf8');
  const {assets:manifestAssets,entries}=compileAliens1986RasterSupplementV120(manifestText,supplementText,supplementV118Text,supplementV119Text,supplementV120Text);
  const assets=[],sourceHashes={},seenPaths=new Set();
  const canonicalRoot=await realpath(resolve(root)),assetScope=resolve(canonicalRoot,'assets')+sep;
  for(const entry of entries) {
    const original=manifestAssets.find(a=>a.id===entry.id);
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
  for(const path of SOURCE_FILES_V118) {
    const source=await readFile(resolve(root,path),'utf8'),sha256=hash(source);
    sourceHashes[path]=sha256;
    registry['v118/raster-props-v118.mjs']={source,sha256,deps:{'../v116/sprite-loader-v116.mjs':'v116/sprite-loader-v116.mjs'}};
  }
  for(const path of SOURCE_FILES_V119) {
    const source=await readFile(resolve(root,path),'utf8'),sha256=hash(source);
    sourceHashes[path]=sha256;
    registry['v119/raster-furniture-v119.mjs']={source,sha256,deps:{'../v116/sprite-loader-v116.mjs':'v116/sprite-loader-v116.mjs'}};
  }
  for(const path of SOURCE_FILES_V120) {
    const source=await readFile(resolve(root,path),'utf8'),sha256=hash(source);
    sourceHashes[path]=sha256;
    registry['v120/raster-furniture-v120.mjs']={source,sha256,deps:{'../v116/sprite-loader-v116.mjs':'v116/sprite-loader-v116.mjs'}};
  }
  const renderer=registry['preview/renderer.mjs'];
  if(!renderer)throw new Error('V114 renderer was not found.');
  renderer.source=replaceOnce(renderer.source,
    "import {human,filmProp,filmBackdrop} from './film-renderer-v114.mjs';",
    "import {human,filmProp,filmBackdrop,weapon as rasterFallbackWeaponV116} from './film-renderer-v114.mjs';\nimport {installRasterRendererV116} from '../v116/raster-renderer-v116.mjs';\nimport {installRasterPropsV118} from '../v118/raster-props-v118.mjs';\nimport {installRasterFurnitureV119} from '../v119/raster-furniture-v119.mjs';\nimport {installRasterFurnitureV120} from '../v120/raster-furniture-v120.mjs';");
  renderer.source=replaceOnce(renderer.source,
    '      if(structural){const box=hatchBox(e)',
    '      this.rasterHatchSurfaceV116(hatchBox(e),{structural,linkOpen,opening});\n      if(structural){const box=hatchBox(e)');
  renderer.source+='\ninstallRasterRendererV116(Renderer,'+JSON.stringify(entries)+',{fallbackWeapon:rasterFallbackWeaponV116});\n';
  renderer.source+='installRasterPropsV118(Renderer,'+JSON.stringify(entries)+');\n';
  renderer.source+='installRasterFurnitureV119(Renderer,'+JSON.stringify(entries)+');\n';
  renderer.source+='installRasterFurnitureV120(Renderer,'+JSON.stringify(entries)+');\n';
  renderer.deps['../v116/raster-renderer-v116.mjs']='v116/raster-renderer-v116.mjs';
  renderer.deps['../v118/raster-props-v118.mjs']='v118/raster-props-v118.mjs';
  renderer.deps['../v119/raster-furniture-v119.mjs']='v119/raster-furniture-v119.mjs';
  renderer.deps['../v120/raster-furniture-v120.mjs']='v120/raster-furniture-v120.mjs';
  renderer.sha256=hash(renderer.source);
  const app=registry['preview/app.mjs'];
  app.source=replaceOnce(app.source,'Les costumes sont distincts mais restent procéduraux stylisés.',
    'Les images disponibles habillent les personnages et objets ; les poses absentes gardent le rendu de secours. Les clés de pose ne constituent pas des cycles animés complets.');
  app.sha256=hash(app.source);
  const fidelity=registry['src/fidelity-v114.mjs'];
  fidelity.source=replaceOnce(fidelity.source,'Œufs et ovipositeur procéduraux','Œufs et ovipositeur de décor');
  fidelity.sha256=hash(fidelity.source);
  let html=base.slice(0,start)+JSON.stringify(registry).replace(/<\//g,'<\\/')+base.slice(end);
  html=replaceOnce(html,'<title>','<meta name="aliens-raster-version" content="116"><meta name="aliens-raster-extension-version" content="120"><meta name="aliens-raster-asset-version" content="120"><title>');
  return {html,sha256:hash(html),assets,sourceHashes,manifestSha256:hash(manifestText),supplementManifestSha256:hash(supplementText),supplementManifestSha256V118:hash(supplementV118Text),supplementManifestSha256V119:hash(supplementV119Text),supplementManifestSha256V120:hash(supplementV120Text),presentationExtensionRevision:120,assetRevision:120,baseSha256:V114_HTML_SHA256};
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
  process.stdout.write(JSON.stringify({path:result.destination,sha256:result.sha256,assets:result.assets.length,assetRevision:result.assetRevision,sourceHashes:result.sourceHashes})+'\n');
}
