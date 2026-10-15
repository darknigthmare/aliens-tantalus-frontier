import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { WEAPONS } from '../src/content-core-v50.js';
import { PLAYER_APPEARANCE_PRESETS_V129, normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_ACTION_PROP_ASSETS_V127, resolvePlayerActionRigV127, drawPlayerActionRigV127 } from '../src/player-action-rig-v127.js';
import { resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { PLAYER_APPEARANCE_PREVIEW_MODES_V128, samplePlayerAppearancePreviewV128 } from '../src/player-appearance-preview-v126.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129, PLAYER_COLONIAL_LEG_DEFINITIONS_V129 } from '../src/player-colonial-art-v129.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V141, PLAYER_COLONIAL_REFERENCES_V141,
  PLAYER_COLONIAL_TORSOS_V141, getPlayerColonialTorsoV141 } from '../src/player-colonial-art-v141.js';

// Read only. Tests never write, normalize, recolor, resize or re-encode art.
const asset = PLAYER_COLONIAL_RIG_ASSETS_V141[0];
const bytes = readFileSync(fileURLToPath(new URL(`..${asset.path}`, import.meta.url)));
const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), stride = width * 4;
const chunks = [];
for (let at = 8; at < bytes.length;) {
  const size = bytes.readUInt32BE(at);
  if (bytes.subarray(at + 4, at + 8).toString() === 'IDAT') chunks.push(bytes.subarray(at + 8, at + 8 + size));
  at += size + 12;
}
const raw = inflateSync(Buffer.concat(chunks)), pixels = Buffer.alloc(stride * height);
const paeth = (a,b,c) => { const p=a+b-c, da=Math.abs(p-a), db=Math.abs(p-b), dc=Math.abs(p-c);
  return da <= db && da <= dc ? a : db <= dc ? b : c; };
for (let y=0; y<height; y++) {
  const row=y*stride, src=y*(stride+1), filter=raw[src]; assert.ok(filter <= 4);
  for (let x=0; x<stride; x++) {
    const l=x>=4?pixels[row+x-4]:0, u=y?pixels[row+x-stride]:0, ul=y&&x>=4?pixels[row+x-stride-4]:0;
    pixels[row+x]=(raw[src+x+1]+(filter===0?0:filter===1?l:filter===2?u:filter===3?Math.floor((l+u)/2):paeth(l,u,ul)))&255;
  }
}
const alpha = p => pixels[(Math.round(p.y)*width+Math.round(p.x))*4+3];
const entries = Object.entries(PLAYER_COLONIAL_TORSOS_V141['torso-hudson-calendar-v141'])
  .flatMap(([side,poses])=>Object.entries(poses).map(([pose,value])=>({side,pose,...value})));

test('the candidate is the original native imagegen RGBA PNG, with explicit incomplete fidelity', () => {
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.deepEqual([width,height,bytes[24],bytes[25],bytes[28]],[1536,1024,8,6,0]);
  assert.equal(asset.exact,false); assert.equal(asset.imageEditsAfterGeneration,false);
  assert.equal(asset.admission,'reviewed-adapted-variant');
  assert.ok(asset.unverified.includes('calendar-placement'));
  assert.ok(PLAYER_COLONIAL_REFERENCES_V141.some(ref=>ref.imageAvailable===false&&ref.verification==='UNVERIFIED'));
  let transparent=0, garment=0;
  for (let i=3;i<pixels.length;i+=4) { transparent+=pixels[i]===0; garment+=pixels[i]>=220; }
  assert.ok(transparent>width*height*.35); assert.ok(garment>width*height*.4);
});

test('the six native source cuts contain one whole torso each and preserve transparent apertures', () => {
  const labels=new Uint8Array(width*height),queue=new Uint32Array(width*height),components=[];
  for(let start=0;start<labels.length;start++) {
    if(labels[start]||pixels[start*4+3]<128)continue;
    const id=components.length+1; let head=0,tail=1,minx=width,miny=height,maxx=0,maxy=0;
    queue[0]=start;labels[start]=id;
    while(head<tail) {
      const at=queue[head++],x=at%width,y=Math.floor(at/width);
      minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);
      for(const next of [x?at-1:-1,x+1<width?at+1:-1,y?at-width:-1,y+1<height?at+width:-1]) {
        if(next<0||labels[next]||pixels[next*4+3]<128)continue;
        labels[next]=id;queue[tail++]=next;
      }
    }
    components.push({id,count:tail,bounds:[minx,miny,maxx+1,maxy+1]});
  }
  const garments=components.filter(c=>c.count>1000);assert.equal(garments.length,6);assert.equal(entries.length,6);
  for(const {side,pose,part}of entries) {
    const r=part.source, counts=new Map();
    assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=width&&r.y+r.height<=height);
    for(let y=r.y;y<r.y+r.height;y++)for(let x=r.x;x<r.x+r.width;x++) {
      const id=labels[y*width+x];if(id)counts.set(id,(counts.get(id)||0)+1);
    }
    const selected=garments.filter(c=>counts.get(c.id));assert.equal(selected.length,1,`${side}/${pose}: no adjacent torso`);
    assert.equal(counts.get(selected[0].id),selected[0].count,`${side}/${pose}: complete silhouette`);
    assert.deepEqual(part.alphaBounds,selected[0].bounds);
    for(const p of Object.values(part.apertures))assert.ok(alpha(p)<8,`${side}/${pose}: transparent opening`);
    const {near,far,waist}=part.joints,det=(far.x-near.x)*(waist.y-near.y)-(far.y-near.y)*(waist.x-near.x);
    assert.ok(Math.abs(det)>10000);assert.equal(Math.sign(far.x-near.x),side==='right'?1:-1);
  }
});

test('separate candidate ID retains all three families and both independently drawn directions', () => {
  for(const facing of [-1,1])for(const family of ['upright','forward','compact']) {
    const torso=getPlayerColonialTorsoV141('torso-hudson-calendar-v141',facing,family);
    assert.ok(torso);assert.equal(torso.asset,asset);assert.ok(Object.isFrozen(torso.part));
  }
  assert.equal(getPlayerColonialTorsoV141('torso-hudson-v129'),null);
  assert.equal(getPlayerColonialTorsoV141('torso-hudson-calendar-v141',1,'missing'),null);
});

test('all fourteen real compositor modes retain the body, limb, hand and muzzle geometry in both directions',()=>{
  const descriptor=WEAPONS[0],weapon=resolveHeldWeaponProfileV125(descriptor);
  const images=new Map([...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126,
    ...PLAYER_TRANSIT_RIG_ASSETS_V128,...PLAYER_ACTION_PROP_ASSETS_V127,...PLAYER_COLONIAL_RIG_ASSETS_V129,
    ...PLAYER_COLONIAL_RIG_ASSETS_V141,weapon].map(a=>[a.imageKey,{complete:true,naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight}]));
  const preset=PLAYER_APPEARANCE_PRESETS_V129.find(p=>p.id==='uscm-hudson-v129');
  const render=(mode,facing,torso)=>{
    const appearance=normalizePlayerAppearanceV126({schema:126,slots:{...preset.slots,torso}});
    const sample=samplePlayerAppearancePreviewV128({appearance,animation:mode.id,timeSeconds:mode.fixedTime,facing,weaponDescriptor:descriptor});
    const options={actor:sample.actor,appearance,images,timeSeconds:sample.timeSeconds,surface:'mission'};
    const decorate=bodyRig=>resolvePlayerLocomotionRigV129({...options,bodyRig,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129}).bodyRig;
    const transit=sample.transit?resolvePlayerTransitRigV128({...options,ladder:sample.ladder,transitState:sample.transitState,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129}):null;
    const action=sample.action?resolvePlayerActionRigV127({...options,weaponDescriptor:descriptor,decorateBodyRigV129:decorate}):null;
    const body=transit?.bodyRig||action?.bodyRig||decorate(resolvePlayerBodyRigV125(options));
    const ctx={save(){},restore(){},transform(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};
    let result,weaponPose;
    if(transit?.eligible)result=drawPlayerTransitRigV128(ctx,{transitRig:transit,appearance,images});
    else if(action?.eligible)result=drawPlayerActionRigV127(ctx,{actionRig:action,appearance,images});
    else{weaponPose=sample.profile?getHeldWeaponPoseV125({actor:sample.actor,descriptor,bodyRig:body,timeSeconds:sample.timeSeconds,surface:'mission'}):null;
      result=drawPlayerModularRigV126(ctx,{bodyRig:body,appearance,images,...(weaponPose?{weaponPose,drawWeapon(){}}:{})});}
    assert.equal(result.drawn,true,`${mode.id}/${facing}: ${result.reason}`);
    return{body,result,weaponPose};
  };
  let count=0;const families=new Set();
  for(const facing of [-1,1])for(const mode of PLAYER_APPEARANCE_PREVIEW_MODES_V128){
    const old=render(mode,facing,'torso-hudson-v129'),next=render(mode,facing,'torso-hudson-calendar-v141');
    assert.deepEqual(next.body.matrix,old.body.matrix);assert.deepEqual(next.body.shoulders,old.body.shoulders);
    assert.deepEqual(next.body.pivot,old.body.pivot);assert.equal(next.body.standingHeight,96.5);
    assert.deepEqual(next.weaponPose,old.weaponPose);assert.deepEqual(next.result.arms,old.result.arms);
    assert.deepEqual(next.result.layers.filter(l=>l.slot!=='torso'),old.result.layers.filter(l=>l.slot!=='torso'));
    const torso=next.result.layers.find(l=>l.id==='torso');assert.equal(torso.imageKey,asset.imageKey);families.add(torso.part);
    const m=torso.matrix;assert.ok(m.a*m.d-m.b*m.c>0,'Lettering is not reflected.');
    const definition=getPlayerColonialTorsoV141('torso-hudson-calendar-v141',facing,torso.part).part;
    for(const side of ['near','far']){const p=definition.joints[side];
      assert.ok(Math.hypot(m.a*p.x+m.c*p.y+m.e-next.body.shoulders[side].x,m.b*p.x+m.d*p.y+m.f-next.body.shoulders[side].y)<1e-7);}
    count++;
  }
  assert.equal(count,28);assert.deepEqual([...families].sort(),['compact','forward','upright']);
});
