import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, unlinkSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEAPONS } from '../src/content-core-v50.js';
import { createDefaultSave, migrateSave, applyCostume } from '../src/save.js';
import { getCostumeV119, canEquipCostumeV119 } from '../src/franchise-costumes-v119.js';
import { getPlayerCostumeSkinV119, PLAYER_COSTUME_ASSETS_V119 } from '../src/player-costume-skins-v119.js';
import { PLAYER_COSTUME_SKINS_V165, PLAYER_COSTUME_ASSETS_V165,
  getPlayerCostumePreviewSkinV165 } from '../src/player-costume-atlases-v165.js';
import { PLAYER_COSTUME_OUTFITS_V165, PLAYER_COSTUME_LINKED_OUTFITS_V165, COSTUME_APPEARANCE_PRESETS_V165,
  applyCostumeOutfitV165 } from '../src/player-costume-outfits-v165.js';
import { PLAYER_COSTUME_PARTS_V165, PLAYER_COSTUME_PART_ASSETS_V165,
  PLAYER_COSTUME_LEG_DEFINITIONS_V165 } from '../src/player-costume-parts-v165.js';
import { normalizePlayerAppearanceV126, getPlayerAppearanceItemV126,
  PLAYER_APPEARANCE_PRESETS_V129, getPlayerAppearancePresetV129 } from '../src/player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_ACTION_PROP_ASSETS_V127, resolvePlayerActionRigV127, drawPlayerActionRigV127 } from '../src/player-action-rig-v127.js';
import { resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129 } from '../src/player-colonial-art-v129.js';
import { PLAYER_APPEARANCE_PREVIEW_MODES_V128, samplePlayerAppearancePreviewV128 } from '../src/player-appearance-preview-v126.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { renderCostumeArchiveCardV119, buildCostumeArchivesModelV119 } from '../src/costume-ui-v119.js';
import { publicCostumePathAdmissionV165, verifyPublicCostumeAdmissionsV165,
  PUBLIC_COSTUME_ASSET_PATHS_V165, PUBLIC_COSTUME_RUNTIME_PATHS_V165,
  PUBLIC_COSTUME_SCRIPT_PATHS_V165 } from './public-costume-admissions-v165.mjs';

const root = new URL('../', import.meta.url);
const allAssets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128, ...PLAYER_ACTION_PROP_ASSETS_V127,
  ...PLAYER_COLONIAL_RIG_ASSETS_V129, ...PLAYER_COSTUME_PART_ASSETS_V165];
const portable = [...new Map(WEAPONS.map(descriptor => ({ descriptor, profile: resolveHeldWeaponProfileV125(descriptor) }))
  .filter(row => row.profile?.portable).map(row => [row.profile.weaponId, row])).values()];
const images = new Map([...allAssets, ...portable.map(row => row.profile)].map(asset => [asset.imageKey,
  { src: asset.path, complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
const pngCache = new Map();
function png(asset) {
  if (pngCache.has(asset.path)) return pngCache.get(asset.path);
  const bytes = readFileSync(new URL('.' + asset.path, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.deepEqual([width,height], [asset.sourceWidth,asset.sourceHeight]);
  assert.equal(bytes[24],8); assert.equal(bytes[25],6); assert.equal(bytes[28],0);
  const chunks=[];
  for(let at=8;at<bytes.length;){const size=bytes.readUInt32BE(at);assert.ok(at+size+12<=bytes.length);
    if(bytes.toString('ascii',at+4,at+8)==='IDAT')chunks.push(bytes.subarray(at+8,at+8+size));at+=size+12;}
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,data=Buffer.alloc(width*height*4);
  assert.equal(raw.length,(stride+1)*height);
  const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
  for(let y=0;y<height;y++){const row=y*stride,start=y*(stride+1),filter=raw[start];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){const a=x>=4?data[row+x-4]:0,b=y?data[row+x-stride]:0,c=y&&x>=4?data[row+x-stride-4]:0;
      data[row+x]=(raw[start+x+1]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}}
  const decoded={width,height,data,alpha:(x,y)=>data[(Math.round(y)*width+Math.round(x))*4+3]};
  pngCache.set(asset.path,decoded);return decoded;
}
const host=()=>{const calls=[],stack=[];return {calls,stack,ctx:{save(){stack.push(1);},restore(){assert.ok(stack.pop());},
  transform(...values){assert.ok(values.every(Number.isFinite));},drawImage(...args){calls.push(args);},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}}};};
function render(preset, mode, facing=1, descriptor=portable[0].descriptor, selectedImages=images) {
  const appearance=normalizePlayerAppearanceV126({schema:126,slots:preset.slots});
  const sample=samplePlayerAppearancePreviewV128({appearance,animation:mode.id,timeSeconds:mode.fixedTime,facing,weaponDescriptor:descriptor});
  const options={actor:sample.actor,appearance,images:selectedImages,timeSeconds:sample.timeSeconds,surface:'mission'};
  const decorate=bodyRig=>resolvePlayerLocomotionRigV129({...options,bodyRig,legDefinitions:PLAYER_COSTUME_LEG_DEFINITIONS_V165}).bodyRig;
  const transit=sample.transit?resolvePlayerTransitRigV128({...options,ladder:sample.ladder,transitState:sample.transitState,
    legDefinitions:PLAYER_COSTUME_LEG_DEFINITIONS_V165}):null;
  const action=sample.action?resolvePlayerActionRigV127({...options,weaponDescriptor:descriptor,decorateBodyRigV129:decorate}):null;
  const body=transit?.bodyRig||action?.bodyRig||decorate(resolvePlayerBodyRigV125(options));
  const draw=host();let result,weaponPose;
  if(transit?.eligible)result=drawPlayerTransitRigV128(draw.ctx,{transitRig:transit,appearance,images:selectedImages});
  else if(action?.eligible)result=drawPlayerActionRigV127(draw.ctx,{actionRig:action,appearance,images:selectedImages});
  else{
    weaponPose=sample.profile?getHeldWeaponPoseV125({actor:sample.actor,descriptor,bodyRig:body,timeSeconds:sample.timeSeconds,surface:'mission'}):null;
    result=drawPlayerModularRigV126(draw.ctx,{bodyRig:body,appearance,images:selectedImages,
      ...(weaponPose?{weaponPose,drawWeapon(){}}:{})});
  }
  return {sample,body,result,weaponPose,draw};
}

test('V165 eight new outfits own six admitted cosmetic slots, distinct from the four historical film presets',()=>{
  assert.equal(PLAYER_COSTUME_OUTFITS_V165.length,8);assert.equal(PLAYER_APPEARANCE_PRESETS_V129.length,4);
  for(const outfit of PLAYER_COSTUME_OUTFITS_V165){
    assert.deepEqual(Object.keys(outfit.slots).sort(),['arms','back','helmet','legs','mask','torso']);
    assert.equal(outfit.exact,false);assert.equal(outfit.cosmeticOnly,true);
    assert.equal(getCostumeV119(outfit.costumeId).outfitId,outfit.id);assert.equal(canEquipCostumeV119(outfit.costumeId),true);
    for(const [slot,id]of Object.entries(outfit.slots))if(id!==null)assert.equal(getPlayerAppearanceItemV126(id)?.slot,slot);
    assert.deepEqual(normalizePlayerAppearanceV126({schema:126,slots:outfit.slots}).slots,outfit.slots);
  }
});

test('V165 full-body reference boards cannot become playable or baked-weapon fallbacks',()=>{
  assert.equal(PLAYER_COSTUME_ASSETS_V119.length,5);assert.equal(PLAYER_COSTUME_ASSETS_V165.length,15);
  assert.equal(getPlayerCostumeSkinV119('franchise-nostromo-crew').id,'player.nostromo-crew-v119');
  for(const skin of PLAYER_COSTUME_SKINS_V165){
    assert.equal(skin.admission,'reference-preview-only-not-playable-skin');assert.equal(skin.runtimeMode,'preview-only-v165');
    assert.equal(skin.atlases.reduce((sum,atlas)=>sum+atlas.frames.length,0),80);
    assert.equal(getPlayerCostumeSkinV119(skin.costumeId),null);assert.equal(getPlayerCostumePreviewSkinV165(skin.costumeId),skin);
    for(const atlas of skin.atlases){const image=png(atlas);for(const frame of atlas.frames){
      const r=frame.source;assert.ok(r.x>=0&&r.y>=0&&r.width>0&&r.height>0&&r.x+r.width<=image.width&&r.y+r.height<=image.height);}}
  }
});

test('V165 Hicks and Hudson archive application uses their exact existing V129 clothes without relabelling the Vasquez BDU',()=>{
  assert.equal(PLAYER_COSTUME_LINKED_OUTFITS_V165.length,2);
  for(const outfit of PLAYER_COSTUME_LINKED_OUTFITS_V165){
    const preset=getPlayerAppearancePresetV129(outfit.id);assert.ok(preset);
    assert.deepEqual(outfit.slots,preset.slots);assert.equal(outfit.sourceCharacter,preset.sourceCharacter);
    assert.equal(getCostumeV119(outfit.costumeId).outfitId,preset.id);
    const save=createDefaultSave(),before=structuredClone(save);applyCostume(save,outfit.costumeId);
    assert.deepEqual(save.player.appearanceV126.slots,preset.slots);
    assert.deepEqual(save.player.weaponIds,before.player.weaponIds);assert.deepEqual(save.galaxy.resources,before.galaxy.resources);
    assert.equal(getPlayerCostumeSkinV119(outfit.costumeId),null);
  }
  assert.equal(getCostumeV119('franchise-vasquez-bdu').outfitId,null);
  assert.equal(canEquipCostumeV119('franchise-vasquez-bdu'),false);
});

test('V165 seventeen original part PNGs have genuine transparency and measured torso/helmet apertures',()=>{
  assert.equal(PLAYER_COSTUME_PART_ASSETS_V165.length,17);
  for(const asset of PLAYER_COSTUME_PART_ASSETS_V165){const image=png(asset);let empty=0,solid=0;
    for(let at=3;at<image.data.length;at+=4){if(image.data[at]===0)empty++;if(image.data[at]>=128)solid++;}
    assert.ok(empty>image.width*image.height*.1);assert.ok(solid>image.width*image.height*.05);
  }
  for(const kit of Object.values(PLAYER_COSTUME_PARTS_V165)){
    const upper=png(kit.upperAsset),legs=png(kit.legAsset);
    for(const part of Object.values(kit.torso))for(const point of Object.values(part.apertures))assert.ok(upper.alpha(point.x,point.y)<=16);
    for(const side of ['near','far']){const part=kit.legs[side].boot;assert.ok(legs.alpha(part.sole.x,part.sole.y)>=128);
      assert.equal(part.sole.y,part.alphaBounds[3]-1);}
    for(const helmet of Object.values(kit.helmet||{})){const image=png(helmet.asset),p=helmet.part.apertures.face;assert.ok(image.alpha(p.x,p.y)<=16);}
  }
});

test('V165 actual costume application prepares all six pieces without resources, issued gear or J2 changes',()=>{
  for(const outfit of PLAYER_COSTUME_OUTFITS_V165){const save=createDefaultSave();save.needsPlayerCreationV84=false;
    const before=structuredClone(save);applyCostume(save,outfit.costumeId);
    assert.equal(save.player.costumeId,outfit.costumeId);assert.deepEqual(save.player.appearanceV126.slots,outfit.slots);
    for(const key of ['weaponIds','equipmentIds','ammo','userEquipmentV95','coopAppearanceV126'])assert.deepEqual(save.player[key],before.player[key]);
    assert.deepEqual(save.galaxy.resources,before.galaxy.resources);assert.deepEqual(save.crew,before.crew);
    const restored=migrateSave(JSON.parse(JSON.stringify(save)));assert.deepEqual(restored.player.appearanceV126,save.player.appearanceV126);
    save.strategy.currentOperation={id:'active'};const locked=structuredClone(save);
    assert.throws(()=>applyCostumeOutfitV165(save,outfit.costumeId),/Opération active/);assert.deepEqual(save,locked);
  }
});

test('V165 fourteen production preview modes retain each outfit and real independent arms in both orientations',()=>{
  for(const preset of COSTUME_APPEARANCE_PRESETS_V165)for(const facing of [-1,1])for(const mode of PLAYER_APPEARANCE_PREVIEW_MODES_V128){
    const {sample,body,result,draw}=render(preset,mode,facing);
    assert.equal(result.drawn,true,`${preset.id}/${facing}/${mode.id}: ${result.reason}`);
    assert.deepEqual(result.effectiveSlots,preset.slots);assert.equal(sample.actor.w,44);assert.equal(sample.actor.h,92);
    assert.ok(result.layers.some(layer=>layer.itemId===preset.slots.torso));
    assert.ok(result.layers.filter(layer=>layer.slot==='arms').every(layer=>layer.itemId===preset.slots.arms));
    assert.equal(result.layers.filter(layer=>layer.slot==='legs').length,7);
    assert.ok(result.layers.every(layer=>!String(layer.imageKey).startsWith('playerCostumeV165:')));
    assert.equal(draw.stack.length,0);assert.ok(draw.calls.length>8);assert.ok(body.eligible);
  }
});

test('V165 every portable weapon keeps its own held layer instead of the reference board rifle',()=>{
  assert.ok(portable.length>3);
  for(const preset of COSTUME_APPEARANCE_PRESETS_V165)for(const facing of [-1,1])for(const row of portable){
    const {result,weaponPose}=render(preset,{id:'aim',fixedTime:.7},facing,row.descriptor);
    assert.equal(result.drawn,true,`${preset.id}/${row.profile.weaponId}/${facing}: ${result.reason}`);
    assert.equal(weaponPose.profile.weaponId,row.profile.weaponId);
    assert.equal(result.layers.find(layer=>layer.slot==='weapon')?.itemId,row.profile.weaponId);
    assert.deepEqual(result.effectiveSlots,preset.slots);
  }
});

test('V165 unarmed and mixed saved pieces do not require a hidden firearm or a monolithic costume',()=>{
  const mixed={...COSTUME_APPEARANCE_PRESETS_V165[0],slots:{...COSTUME_APPEARANCE_PRESETS_V165[0].slots,
    arms:COSTUME_APPEARANCE_PRESETS_V165[1].slots.arms,legs:COSTUME_APPEARANCE_PRESETS_V165[2].slots.legs}};
  for(const facing of [-1,1]){const {result}=render(mixed,{id:'idle',fixedTime:.4},facing,null);
    assert.equal(result.drawn,true);assert.equal(result.unarmed,true);assert.deepEqual(result.effectiveSlots,mixed.slots);
    assert.equal(result.layers.some(layer=>layer.slot==='weapon'),false);}
});

test('V165 missing selected clothing fails before any partial outfit is drawn',()=>{
  for(const preset of COSTUME_APPEARANCE_PRESETS_V165){const kit=PLAYER_COSTUME_PARTS_V165[preset.id.slice(7,-5)];
    for(const asset of [kit.upperAsset,kit.legAsset,...Object.values(kit.helmet||{}).map(row=>row.asset)]){
      const broken=new Map(images);broken.delete(asset.imageKey);
      const {result,draw}=render(preset,{id:'idle',fixedTime:.4},1,null,broken);
      assert.equal(result.drawn,false);assert.equal(result.fallback,true);assert.equal(draw.calls.length,0);
    }
  }
});

test('V165 archives separate live modular clothing from illustrative full-body boards',()=>{
  assert.equal(buildCostumeArchivesModelV119().modularReadyCount,PLAYER_COSTUME_OUTFITS_V165.length+PLAYER_COSTUME_LINKED_OUTFITS_V165.length);
  for(const outfit of PLAYER_COSTUME_OUTFITS_V165){const html=renderCostumeArchiveCardV119(getCostumeV119(outfit.costumeId));
    assert.match(html,/TENUE MODULAIRE ADAPTÉE/);
    if(getPlayerCostumePreviewSkinV165(outfit.costumeId))assert.match(html,/Illustration de la tenue/);
    else{assert.match(html,/PIÈCES DISPONIBLES À L’ARMURERIE/);assert.doesNotMatch(html,/<image /);}
    assert.match(html,/data-costume-id=/);assert.match(html,/PERSONNALISER LES PIÈCES/);
    assert.doesNotMatch(html,/ATLAS JOUEUR DÉDIÉ ADAPTÉ/);}
  const outfit=PLAYER_COSTUME_OUTFITS_V165[0],entry=getCostumeV119(outfit.costumeId);
  const active=renderCostumeArchiveCardV119(entry,{selectedId:outfit.costumeId,appearanceSlots:outfit.slots});
  assert.match(active,/data-costume-id="[^"]+" disabled/);
  const mixed=renderCostumeArchiveCardV119(entry,{selectedId:outfit.costumeId,
    appearanceSlots:{...outfit.slots,legs:PLAYER_COSTUME_OUTFITS_V165[1].slots.legs}});
  assert.match(mixed,/>APPLIQUER LA TENUE<\/button>/);
});

test('V165 exact admission rejects extra costume assets and retains independent source checks',async()=>{
  for(const path of ['assets/openai/sprites/player/costumes-v165/extra.png','assets/openai/sprites/player/costume-parts-v165/sevastopol-security/unreviewed.png','../src/app.js'])
    assert.equal(publicCostumePathAdmissionV165(path),false);
  assert.equal(publicCostumePathAdmissionV165('src/unrelated.js'),null);
  const result=await verifyPublicCostumeAdmissionsV165(new URL('../',import.meta.url).pathname,{strict:true});
  assert.equal(result.nativePartAtlases,17);assert.equal(result.previewPoseCells,240);assert.equal(result.newPlayablePrecompositedSkins,0);
});

test('V165 built admission omits tooling while source QA and every runtime/PNG input remain mandatory',async()=>{
  const fixture=mkdtempSync(join(tmpdir(),'atf-costume-admission-v165-'));
  const copy=path=>{const target=join(fixture,path);mkdirSync(dirname(target),{recursive:true});
    copyFileSync(fileURLToPath(new URL('../'+path,import.meta.url)),target);};
  try{
    assert.equal(PUBLIC_COSTUME_ASSET_PATHS_V165.length,32);
    assert.equal(PUBLIC_COSTUME_RUNTIME_PATHS_V165.length,3);
    for(const path of [...PUBLIC_COSTUME_ASSET_PATHS_V165,...PUBLIC_COSTUME_RUNTIME_PATHS_V165])copy(path);
    const built=await verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built:true});
    assert.equal(built.nativePartAtlases,17);assert.equal(built.previewPoseCells,240);
    for(const path of PUBLIC_COSTUME_SCRIPT_PATHS_V165.filter(path=>!path.endsWith('.py')))copy(path);
    await assert.rejects(()=>verifyPublicCostumeAdmissionsV165(fixture,{strict:true}),/qa-costume-atlases-v165\.py/);
    copy('scripts/qa-costume-atlases-v165.py');
    assert.equal((await verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built:false})).ok,true);
    const runtime=PUBLIC_COSTUME_RUNTIME_PATHS_V165[1];unlinkSync(join(fixture,runtime));
    for(const built of [false,true])await assert.rejects(()=>verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built}),/ENOENT/);
    copy(runtime);
    const asset=PUBLIC_COSTUME_ASSET_PATHS_V165.at(-1);unlinkSync(join(fixture,asset));
    for(const built of [false,true])await assert.rejects(()=>verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built}),/ENOENT/);
  }finally{rmSync(fixture,{recursive:true,force:true});}
});
