import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { getHubLadderMountV139 } from '../src/hub-support-planes-v139.js';
import { npcClimbLandingXV165 } from '../src/npc-cal-climb-rig-v165.js';
import { JUN_CLIMB_ASSET_V165 as asset, JUN_CLIMB_BODY_V165 as body,
  JUN_CLIMB_PARTS_V165 as parts, resolveJunClimbRigV165, drawJunClimbRigV165,
  junClimbImageReadyV165 } from '../src/npc-jun-climb-rig-v165.js';

// Decode the actual unmodified RGBA PNG rather than trusting claimed pivots.
function rgbaPng(bytes) {
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),chunks=[];
  assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
  for(let offset=8;offset<bytes.length;) {
    const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);
    if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));
    offset+=length+12;
  }
  const packed=inflateSync(Buffer.concat(chunks)),stride=width*4,out=new Uint8Array(stride*height);
  let cursor=0;
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++) {
    const filter=packed[cursor++];assert.ok(filter<=4);
    for(let x=0;x<stride;x++) {
      const i=y*stride+x,a=x>=4?out[i-4]:0,b=y?out[i-stride]:0,c=y&&x>=4?out[i-stride-4]:0;
      const prediction=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c);
      out[i]=(packed[cursor++]+prediction)&255;
    }
  }
  return {width,height,pixel:(x,y)=>out.subarray((y*width+x)*4,(y*width+x)*4+4),data:out};
}
const bytes=readFileSync(new URL('..'+asset.path,import.meta.url)),image=rgbaPng(bytes);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ladders=buildHubTraversalGeometryV87(1).ladders.filter(item=>['quarters-floor','quarters-tier'].includes(item.id));
const actor=(ladder,F)=>{const m=getHubLadderMountV139(ladder);return {
  crewId:'crew-11-jun-park',x:m.left-body.waistStandoff-22,y:F-92,w:44,h:92,facing:1,ladderId:ladder.id};};

test('Jun image is the unchanged raw generation with exact dimensions and source provenance',()=>{
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.equal(image.width,1254);assert.equal(image.height,1254);
  assert.equal(asset.originalSourcePngsChanged,false);assert.equal(asset.canonicalExact,false);
  const refs=[['jun-park-locomotion-sheet.png','4d1c10d371f1079178ca7d5f744ae85fa91f319e48379f7cdbbbed42853642ea'],
    ['jun-park-mission-sheet.png','f1bae4263f30e386be2454a79f015f7f8feba2bbe867ac8621067ff67a05ce5a']];
  for(const [name,sha] of refs)assert.equal(createHash('sha256').update(
    readFileSync(new URL('../assets/openai/sprites/npcs/'+name,import.meta.url))).digest('hex'),sha);
});

test('Jun has real transparent holes and every measured pivot and shoe support lands on opaque source art',()=>{
  for(const [x,y] of [[0,0],[300,300],[625,500],[620,720],[950,750],[650,1100],[1000,1100],
    [1220,1000],[300,900],[600,1100],[150,385]])assert.equal(image.pixel(x,y)[3],0,`${x},${y}`);
  const points=[parts.torso.waist,...Object.values(parts.torso.shoulders),parts.pelvis.waist,
    ...Object.values(parts.pelvis.hips),...['near','far'].flatMap(side=>Object.values(parts[side])
      .flatMap(part=>[part.proximal,part.distal]))];
  for(const p of points)assert.ok(image.pixel(p.x,p.y)[3]>=240,JSON.stringify(p));
  let transparent=0,brightOpaque=0;
  for(let i=0;i<image.data.length;i+=4) {
    if(image.data[i+3]===0)transparent++;
    if(image.data[i+3]>=240&&image.data[i]>230&&image.data[i+1]>230&&image.data[i+2]>230)brightOpaque++;
  }
  assert.ok(transparent>1_100_000);assert.ok(brightOpaque<100,'no opaque white background patch');
});

test('four authored keys and ten independent source crops stay separated, with Jun-specific measured registration',()=>{
  assert.equal(parts.referenceKeys.length,4);assert.equal(body.width,44);assert.equal(body.height,92);
  assert.ok(Math.abs(body.torsoScale*(751-510)-41)<1e-9);
  assert.ok(Math.abs((body.hipOffsets.near.x-body.hipOffsets.far.x)/(518-448)-body.torsoScale)<.002);
  const pieces=[parts.torso,parts.pelvis,...['near','far'].flatMap(side=>Object.values(parts[side]))];
  assert.equal(pieces.length,10);
  for(let i=0;i<pieces.length;i++) {
    const a=pieces[i].source;assert.ok(a.x>=0&&a.y>=0&&a.x+a.w<=1254&&a.y+a.h<=1254);
    for(let j=i+1;j<pieces.length;j++) {
      const b=pieces[j].source;assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);
    }
  }
});

test('Jun keeps fixed human bones and planted hands/shoes on both true centered quarters ladders',()=>{
  assert.equal(ladders.length,2);
  for(const ladder of ladders) {
    const mount=getHubLadderMountV139(ladder);
    for(let F=ladder.bottom;F>=ladder.top;F-=.25) {
      const rig=resolveJunClimbRigV165(actor(ladder,F),ladder,{centered:true});
      assert.ok(rig);assert.equal(rig.eligible,true,JSON.stringify({F,reason:rig.reason,arms:rig.arms,legs:rig.legs}));
      assert.equal(rig.layers.length,10);assert.equal(rig.standingHeight,92);
      for(const [type,upper,lower] of [['arms',body.upperArm,body.forearm],['legs',body.thigh,body.shinBoot]])
        for(const limb of Object.values(rig[type])) {
          assert.equal(limb.reachClamped,false);assert.ok(Math.abs(distance(limb.shoulder,limb.elbow)-upper)<1e-6);
          assert.ok(Math.abs(distance(limb.elbow,limb.hand)-lower)<1e-6);
        }
      let planted=0;
      for(const contact of [...Object.values(rig.contacts.hands),...Object.values(rig.contacts.feet)]) {
        if(!contact.planted)continue;planted++;
        assert.equal(contact.support,'ladder-rung');
        const rung=mount.rungs.find(item=>item.index===contact.rungIndex);assert.ok(rung);
        assert.ok(Math.abs(contact.point.y-rung.y)<1e-7);
        assert.ok(contact.point.x>=rung.x&&contact.point.x<=rung.x+rung.w);
      }
      assert.ok(planted>=2);
      for(const layer of rig.layers)assert.ok(Object.values(layer.matrix).every(Number.isFinite));
    }
  }
});

test('pausing and reversing Jun cannot advance a planted grip through a render clock',()=>{
  const ladder=ladders[0];let previous=null,stableSupports=0;
  for(let F=ladder.bottom;F>=ladder.top;F-=.25) {
    const a=actor(ladder,F),rig=resolveJunClimbRigV165(a,ladder,{centered:true});
    assert.deepEqual(resolveJunClimbRigV165(a,ladder,{centered:true}),rig);
    if(previous)for(const kind of ['hands','feet'])for(const side of ['near','far']) {
      const before=previous.contacts[kind][side],after=rig.contacts[kind][side];
      if(before.planted&&after.planted&&before.rungIndex===after.rungIndex) {
        assert.deepEqual(after.point,before.point);stableSupports++;
      }
    }
    previous=rig;
  }
  assert.ok(stableSupports>500);
});

test('Jun keeps the real contact at the previously blocked586.5/588 heights within unchanged elbow limits',()=>{
  const ladder=ladders.find(item=>item.id==='quarters-floor');
  for(const F of [586.5,588]) {
    const rig=resolveJunClimbRigV165(actor(ladder,F),ladder,{centered:true});
    assert.ok(rig);assert.equal(rig.eligible,true,JSON.stringify(rig.arms));
    for(const side of ['near','far']) {
      const limb=rig.arms[side],contact=rig.contacts.hands[side];
      assert.equal(limb.upper,22);assert.equal(limb.fore,22);
      assert.equal(limb.reachClamped,false);assert.ok(distance(limb.hand,contact.point)<1e-6);
      assert.ok(limb.flexionDegrees>=5-1e-6&&limb.flexionDegrees<=145+1e-6);
    }
  }
});

test('the real544→580 quarters transfer plants shoes on the authored upper platform and retains stationary rung grips',()=>{
  const traversal=buildHubTraversalGeometryV87(1),ladder=ladders.find(item=>item.id==='quarters-tier');
  const platform=traversal.platforms.find(item=>item.id==='quarters-high'),mount=getHubLadderMountV139(ladder);
  assert.equal(platform.x,580);assert.equal(platform.y,ladder.top);
  const baseX=mount.left-body.waistStandoff-22,landingX=platform.x;
  assert.equal(baseX,544);assert.equal(landingX,580);
  for(const kind of ['top-dismount','top-mount']) {
    let previous=null,retainedGrips=0,retainedShoes=0;
    for(let i=0;i<=400;i++) {
      const progress=i/400,x=npcClimbLandingXV165(baseX,landingX,kind,progress);
      const a={...actor(ladder,ladder.top),x};
      const rig=resolveJunClimbRigV165(a,ladder,{kind,progress,centered:true,baseX,landingX});
      assert.ok(rig);assert.equal(rig.eligible,true,JSON.stringify({kind,progress,arms:rig.arms,legs:rig.legs}));
      assert.equal(rig.landing.actorX,x);
      assert.ok(rig.landing.transferCrouch>=0&&rig.landing.transferCrouch<=6);
      for(const [type,upper,lower,limits] of [['arms',body.upperArm,body.forearm,body.armLimits],
        ['legs',body.thigh,body.shinBoot,body.legLimits]])for(const limb of Object.values(rig[type])) {
        assert.equal(limb.reachClamped,false);assert.ok(Math.abs(distance(limb.shoulder,limb.elbow)-upper)<1e-6);
        assert.ok(Math.abs(distance(limb.elbow,limb.hand)-lower)<1e-6);
        assert.ok(limb.flexionDegrees>=limits.minFlexionDegrees-1e-6);
        assert.ok(limb.flexionDegrees<=limits.maxFlexionDegrees+1e-6);
      }
      let supports=0;
      for(const type of ['hands','feet'])for(const side of ['near','far']) {
        const contact=rig.contacts[type][side];if(!contact.planted)continue;supports++;
        if(contact.support==='physical-platform') {
          assert.equal(type,'feet');assert.equal(contact.point.y,platform.y);
          assert.ok(contact.point.x>=platform.x&&contact.point.x<=platform.x+platform.w);
        } else {
          assert.equal(contact.support,'ladder-rung');
          const rung=mount.rungs.find(item=>item.index===contact.rungIndex);assert.ok(rung);
          assert.equal(contact.point.y,rung.y);assert.ok(contact.point.x>=rung.x&&contact.point.x<=rung.x+rung.w);
        }
        const before=previous?.contacts[type][side];
        if(before?.planted&&before.support===contact.support&&before.rungIndex===contact.rungIndex) {
          assert.deepEqual(before.point,contact.point);
          if(type==='hands')retainedGrips++;else retainedShoes++;
        }
      }
      assert.ok(supports>=2);
      const p=kind==='top-dismount'?progress:1-progress;
      if(p<.8)assert.equal(rig.contacts.hands.far.planted,true);
      if(p>=.8)for(const foot of Object.values(rig.contacts.feet))assert.equal(foot.support,'physical-platform');
      previous=rig;
    }
    assert.ok(retainedGrips>300);assert.ok(retainedShoes>100);
  }
});

test('Jun renderer rejects a foreign actor and unready atlas, and paints exactly ten independent layers',()=>{
  const ladder=ladders[0],a=actor(ladder,560),rig=resolveJunClimbRigV165(a,ladder,{centered:true});
  assert.equal(resolveJunClimbRigV165({...a,crewId:'crew-16-cal-mercer'},ladder,{centered:true}),null);
  const ready={complete:true,naturalWidth:1254,naturalHeight:1254},calls=[];
  const ctx={save(){calls.push('save');},restore(){calls.push('restore');},
    transform(...m){assert.ok(m.every(Number.isFinite));},drawImage(){calls.push('draw');}};
  assert.equal(junClimbImageReadyV165(ready),true);
  assert.equal(drawJunClimbRigV165(ctx,{...ready,naturalWidth:1024},rig),false);
  assert.equal(drawJunClimbRigV165(ctx,ready,rig),true);
  assert.equal(calls.filter(x=>x==='draw').length,10);
  assert.equal(calls.filter(x=>x==='save').length,calls.filter(x=>x==='restore').length);
});
