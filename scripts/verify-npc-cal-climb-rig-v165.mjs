import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubLadderMountV139 } from '../src/hub-support-planes-v139.js';
import { CAL_CLIMB_ASSET_V165 as asset, CAL_CLIMB_BODY_V165 as body, CAL_CLIMB_PARTS_V165 as parts,
  resolveCalClimbRigV165, drawCalClimbRigV165 } from '../src/npc-cal-climb-rig-v165.js';

const annex=getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137.logistics);
const ladder=annex.ladders.find(item=>item.id==='logistics-ladder');
const mount=getHubLadderMountV139(ladder,{centered:false});
const actor=F=>({crewId:'crew-16-cal-mercer',x:mount.left-body.waistStandoff-22,y:F-92,
  w:44,h:92,facing:1,ladderId:ladder.id});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function actualRgba(bytes) {
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),chunks=[];
  assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
  for(let offset=8;offset<bytes.length;) {
    const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);
    if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));offset+=length+12;
  }
  const packed=inflateSync(Buffer.concat(chunks)),stride=width*4,data=new Uint8Array(stride*height);let cursor=0;
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++) {
    const filter=packed[cursor++];assert.ok(filter<=4);
    for(let x=0;x<stride;x++) {
      const i=y*stride+x,a=x>=4?data[i-4]:0,b=y?data[i-stride]:0,c=y&&x>=4?data[i-stride-4]:0;
      const prediction=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c);
      data[i]=(packed[cursor++]+prediction)&255;
    }
  }
  return{data,pixel:p=>data.subarray((p.y*width+p.x)*4,(p.y*width+p.x)*4+4)};
}
function assertPose(rig) {
  assert.ok(rig); assert.equal(rig.eligible,true,JSON.stringify({reason:rig.reason,arms:rig.arms,legs:rig.legs}));
  assert.equal(rig.standingHeight,92); assert.equal(rig.layers.length,10);
  for(const limb of Object.values(rig.arms)) {
    assert.equal(limb.reachClamped,false); assert.ok(Math.abs(distance(limb.shoulder,limb.elbow)-body.upperArm)<1e-6);
    assert.ok(Math.abs(distance(limb.elbow,limb.hand)-body.forearm)<1e-6);
    assert.ok(limb.flexionDegrees>=body.armLimits.minFlexionDegrees-1e-6);
    assert.ok(limb.flexionDegrees<=body.armLimits.maxFlexionDegrees+1e-6);
  }
  for(const limb of Object.values(rig.legs)) {
    assert.equal(limb.reachClamped,false); assert.ok(Math.abs(distance(limb.shoulder,limb.elbow)-body.thigh)<1e-6);
    assert.ok(Math.abs(distance(limb.elbow,limb.hand)-body.shinBoot)<1e-6);
    assert.ok(limb.flexionDegrees>=body.legLimits.minFlexionDegrees-1e-6);
    assert.ok(limb.flexionDegrees<=body.legLimits.maxFlexionDegrees+1e-6);
  }
  let planted=0;
  for(const contact of [...Object.values(rig.contacts.hands),...Object.values(rig.contacts.feet)]) {
    if(!contact.planted)continue; planted++;
    if(contact.support==='ladder-rung') {
      const rung=mount.rungs.find(item=>item.index===contact.rungIndex);assert.ok(rung);
      assert.ok(Math.abs(contact.point.y-rung.y)<1e-7);
      assert.ok(contact.point.x>=rung.x-1e-7&&contact.point.x<=rung.x+rung.w+1e-7);
    } else {
      assert.equal(contact.support,'physical-platform');
      assert.ok([ladder.top,ladder.bottom].includes(contact.point.y));
    }
  }
  assert.ok(planted>=2,'the braced Cal pose retains at least two real supports');
  for(const layer of rig.layers)assert.ok(Object.values(layer.matrix).every(Number.isFinite));
}

test('Cal climb uses one unchanged transparent adaptation, four authored reference keys and ten independently painted parts',()=>{
  const png=readFileSync(new URL('..'+asset.path,import.meta.url));
  assert.equal(createHash('sha256').update(png).digest('hex'),asset.sha256);
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(png.readUInt32BE(16),1254);assert.equal(png.readUInt32BE(20),1254);
  assert.equal(parts.referenceKeys.length,4);assert.equal(asset.originalSourcePngsChanged,false);assert.equal(asset.canonicalExact,false);
  for(const part of [parts.torso,parts.pelvis,...['near','far'].flatMap(side=>Object.values(parts[side]))]) {
    const b=part.source;assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=asset.width&&b.y+b.h<=asset.height);
  }
});

test('Cal anatomical pins and shoe contacts belong to opaque paint in the real PNG, with transparent room around every part',()=>{
  const decoded=actualRgba(readFileSync(new URL('..'+asset.path,import.meta.url)));
  const pins=[parts.torso.waist,...Object.values(parts.torso.shoulders),parts.pelvis.waist,
    ...Object.values(parts.pelvis.hips),...['near','far'].flatMap(side=>Object.values(parts[side]).flatMap(p=>[p.proximal,p.distal]))];
  for(const pin of pins)assert.ok(decoded.pixel(pin)[3]>=240,JSON.stringify(pin));
  for(const p of[{x:4,y:4},{x:300,y:700},{x:650,y:800},{x:960,y:1040}])assert.equal(decoded.pixel(p)[3],0);
  let transparent=0,brightOpaque=0;
  for(let i=0;i<decoded.data.length;i+=4) {
    if(decoded.data[i+3]===0)transparent++;
    if(decoded.data[i+3]>=240&&decoded.data[i]>230&&decoded.data[i+1]>230&&decoded.data[i+2]>230)brightOpaque++;
  }
  assert.ok(transparent>1_100_000);assert.ok(brightOpaque<256,'bright paint remains limited to small original highlights');
});

test('every quarter pixel of the actual624→468 ladder keeps fixed bones, human joint angles and two real planted supports',()=>{
  for(let F=ladder.bottom;F>=ladder.top;F-=.25)assertPose(resolveCalClimbRigV165(actor(F),ladder));
});

test('both mountings and both dismountings transfer support without floating or borrowing a floor from the sprite',()=>{
  for(const kind of ['floor-mount','floor-dismount','top-mount','top-dismount']) {
    const F=kind.startsWith('floor-')?ladder.bottom:ladder.top;
    for(let i=0;i<=100;i++)assertPose(resolveCalClimbRigV165(actor(F),ladder,{kind,progress:i/100}));
  }
});

test('stopping and reversing are position-owned; planted rung coordinates stay fixed through their stance interval',()=>{
  let prior=null,stanceSamples=0;
  for(let F=623.75;F>=468;F-=.25) {
    const rig=resolveCalClimbRigV165(actor(F),ladder);assert.deepEqual(resolveCalClimbRigV165(actor(F),ladder),rig);
    if(prior)for(const type of ['hands','feet'])for(const side of ['near','far']) {
      const before=prior.contacts[type][side],after=rig.contacts[type][side];
      if(before.planted&&after.planted&&before.rungIndex===after.rungIndex) {
        assert.deepEqual(after.point,before.point);stanceSamples++;
      }
    }
    prior=rig;
  }
  assert.ok(stanceSamples>1000);
  for(const F of [468,479,500,545,589,611,624])assert.deepEqual(
    resolveCalClimbRigV165(actor(F),ladder),resolveCalClimbRigV165(actor(F),ladder));
});

test('only Cal on the declared physical ladder may acquire the clean climb renderer',()=>{
  const good=actor(545);
  for(const patch of [{crewId:'crew-11-jun-park'},{x:good.x+3},{facing:-1},{w:40},{h:91},{ladderId:'foreign'}])
    assert.equal(resolveCalClimbRigV165({...good,...patch},ladder),null);
  assert.equal(resolveCalClimbRigV165(good,ladder,{kind:'floor-mount',progress:.5}),null);
  assert.equal(resolveCalClimbRigV165(good,ladder,{kind:'top-mount',progress:.5}),null);
  assert.equal(resolveCalClimbRigV165(actor(625),ladder),null);
});

test('the draw path uses only the declared Cal image and its separate source pieces, with balanced transforms',()=>{
  const rig=resolveCalClimbRigV165(actor(545),ladder),calls=[];
  const ctx={save(){calls.push('save');},restore(){calls.push('restore');},transform(...m){assert.ok(m.every(Number.isFinite));},
    drawImage(image,...args){calls.push('paint');assert.equal(args.length,8);assert.equal(image,ready);}};
  const ready={complete:true,naturalWidth:1254,naturalHeight:1254};
  assert.equal(drawCalClimbRigV165(ctx,{...ready,naturalHeight:1024},rig),false);
  assert.equal(drawCalClimbRigV165(ctx,ready,rig),true);
  assert.equal(calls.filter(value=>value==='paint').length,10);
  assert.equal(calls.filter(value=>value==='save').length,calls.filter(value=>value==='restore').length);
});
