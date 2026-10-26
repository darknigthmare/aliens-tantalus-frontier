import { solvePlayerArmIKV125 } from './player-body-rig-v125.js';
import { humanFootTravelV136 } from './human-motion-v136.js';
import { getHubLadderMountV139 } from './hub-support-planes-v139.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const mix = (a, b, p) => a + (b - a) * p;
const mixPoint = (a, b, p) => point(mix(a.x, b.x, p), mix(a.y, b.y, p));

/** One unmodified imagegen adaptation of Cal's two real project atlases.
 * The top row has four separately authored climb keys. The actual renderer
 * uses the independently painted components below it so planted grips do
 * not slide with a full-body cell. No ladder pixels occur in this asset. */
export const CAL_CLIMB_ASSET_V165 = freeze({
  id: 'npc.cal-mercer.climb-parts-v165', imageKey: 'calClimbPartsV165',
  path: '/assets/openai/sprites/npcs/rig-v165/cal-mercer-climb-parts-v165.png',
  width: 1254, height: 1254, sourceWidth: 1254, sourceHeight: 1254,
  sha256: 'aaa08c3289f2490d31fe1448cca1c0e3197251c28d7bc2077971219f9aaff665',
  referencePaths: ['/assets/openai/sprites/normalized/npcs/cal-mercer-locomotion-sheet.png',
    '/assets/openai/sprites/normalized/npcs/cal-mercer-mission-sheet.png'],
  artStatus: 'adapted-original-Cal-four-climb-keys-and-separated-parts',
  originalSourcePngsChanged: false, canonicalExact: false
});
const part = (bounds, proximal, distal, thickness) => ({
  bounds, source: { x: bounds[0] - 2, y: bounds[1] - 2,
    w: bounds[2] - bounds[0] + 4, h: bounds[3] - bounds[1] + 4 },
  proximal: point(...proximal), distal: point(...distal), thickness
});
export const CAL_CLIMB_PARTS_V165 = freeze({
  referenceKeys: [[65,55,270,390], [386,40,575,390], [698,41,902,391], [1010,32,1210,390]],
  torso: { source: { x: 80, y: 430, w: 178, h: 232 }, waist: point(173, 655),
    shoulders: { near: point(145, 542), far: point(205, 536) } },
  pelvis: { source: { x: 392, y: 533, w: 199, h: 145 }, waist: point(492, 563),
    // The painted outside protectors are not the femoral sockets. The actual
    // profile hip attachments stay inside that same uncompressed belt.
    hips: { near: point(510, 640), far: point(474, 640) } },
  near: {
    upperArm: part([709,466,877,638], [749,510], [849,610], 80),
    forearm: part([1013,484,1206,602], [1046,568], [1198,522], 60),
    thigh: part([703,714,872,925], [744,757], [823,893], 90),
    shinBoot: part([1025,711,1199,933], [1057,744], [1185,911], 66)
  },
  far: {
    upperArm: part([94,736,245,898], [128,773], [217,865], 78),
    forearm: part([390,785,593,871], [424,826], [583,831], 60),
    thigh: part([80,965,251,1178], [123,1006], [205,1145], 88),
    shinBoot: part([432,955,583,1185], [459,990], [571,1175], 60)
  }
});
export const CAL_CLIMB_BODY_V165 = freeze({ standingHeight: 92, width: 44, height: 92,
  waistStandoff: 18, waistHeight: 51, torsoScale: 41 / 223,
  upperArm: 19, forearm: 19, thigh: 22, shinBoot: 22.5,
  armLimits: { minFlexionDegrees: 5, maxFlexionDegrees: 145 },
  legLimits: { minFlexionDegrees: 3, maxFlexionDegrees: 145 } });

/** Pure, height-owned contact. Half a stride stays on one actual painted
 * rung; only the other half transfers. Pausing or reversing cannot run a
 * cosmetic time cycle under a planted hand or shoe. */
export function sampleNpcLadderContactV165(ladder, cursor, offset, x, lift = 3, { centered = false } = {}) {
  const mount = getHubLadderMountV139(ladder, { centered });
  if (!mount || ![cursor, offset, x, lift].every(Number.isFinite) || !mount.rungs.length) return null;
  const first = mount.rungOriginY, spacing = mount.rungSpacing, stride = spacing * 2;
  const phase = (cursor - first - offset) / stride, whole = Math.floor(phase), p = phase - whole;
  const low = mount.rungs[0].index, high = mount.rungs.at(-1).index;
  const from = clamp(whole * 2 + Math.round(offset / spacing), low, high);
  const to = clamp(whole * 2 + Math.round(offset / spacing) + 2, low, high);
  const moving = p >= .5 && from !== to;
  const swing = moving ? humanFootTravelV136((p - .5) * 2) : 0;
  const y = mix(first + from * spacing, first + to * spacing, swing);
  const planted = !moving || swing === 0 || swing === 1;
  return { point: point(x - Math.sin(Math.PI * swing) * lift, y), planted,
    support: planted ? 'ladder-rung' : null,
    rungIndex: planted ? swing === 1 ? to : from : null,
    rungY: planted ? y : null, phase: p, swing };
}
function interpolateContact(from, to, p) {
  if (p <= 0) return { ...from, point: { ...from.point } };
  if (p >= 1) return { ...to, point: { ...to.point } };
  return { point: mixPoint(from.point, to.point, smooth(p)), planted: false,
    support: null, rungIndex: null, rungY: null };
}
const freeContact = p => ({ point: p, planted: false, support: null, rungIndex: null, rungY: null });
const floorContact = p => ({ point: p, planted: true, support: 'physical-platform', floorY: p.y,
  rungIndex: null, rungY: null });

/** World-space LEFT of the same44px collider during the real top transfer.
 * A controller consumes this position after swept occupancy checks; drawing
 * itself never moves the actor or manufactures the upper landing. */
export function npcClimbLandingXV165(baseX,landingX,kind,progress) {
  if(![baseX,landingX,progress].every(Number.isFinite)||progress<0||progress>1
    ||!['top-mount','top-dismount'].includes(kind))return null;
  const p=kind==='top-dismount'?progress:1-progress;
  return mix(baseX,landingX,smooth(p));
}
function transform(matrix, p) { return point(matrix.a * p.x + matrix.c * p.y + matrix.e,
  matrix.b * p.x + matrix.d * p.y + matrix.f); }
function triangle(source, target) {
  const [p,q,r] = source, [u,v,w] = target;
  const sx=q.x-p.x, sy=q.y-p.y, tx=r.x-p.x, ty=r.y-p.y, det=sx*ty-sy*tx;
  const a=((v.x-u.x)*ty-(w.x-u.x)*sy)/det, c=(-(v.x-u.x)*tx+(w.x-u.x)*sx)/det;
  const b=((v.y-u.y)*ty-(w.y-u.y)*sy)/det, d=(-(v.y-u.y)*tx+(w.y-u.y)*sx)/det;
  return { a,b,c,d,e:u.x-a*p.x-c*p.y,f:u.y-b*p.x-d*p.y };
}
function segmentMatrix(descriptor, from, to, width) {
  const dx=descriptor.distal.x-descriptor.proximal.x, dy=descriptor.distal.y-descriptor.proximal.y;
  const length=Math.hypot(dx,dy), ux=dx/length, uy=dy/length;
  const tx=to.x-from.x, ty=to.y-from.y, targetLength=Math.hypot(tx,ty), wx=tx/targetLength, wy=ty/targetLength;
  const along=targetLength/length, across=width/descriptor.thickness;
  const a=wx*along*ux+wy*across*uy, b=wy*along*ux-wx*across*uy;
  const c=wx*along*uy-wy*across*ux, d=wy*along*uy+wx*across*ux;
  return { a,b,c,d,e:from.x-a*descriptor.proximal.x-c*descriptor.proximal.y,
    f:from.y-b*descriptor.proximal.x-d*descriptor.proximal.y };
}

export function resolveNpcClimbRigV165(actor, ladder, profile, { kind = 'climb', progress = 1,
  centered = false, baseX = null, landingX = null } = {}) {
  const C=profile?.body,P=profile?.parts,mount=getHubLadderMountV139(ladder,{centered});
  if(!C||!P||!profile.asset)return null;
  if (actor?.crewId !== profile.crewId || !mount || ![actor.x,actor.y,actor.w,actor.h,progress].every(Number.isFinite)
    || actor.w !== C.width || actor.h !== C.height || progress < 0 || progress > 1
    || !['climb','floor-mount','floor-dismount','top-mount','top-dismount'].includes(kind)) return null;
  const F=actor.y+actor.h, center=actor.x+actor.w/2, waist=point(center,F-C.waistHeight), s=C.torsoScale;
  const naturalBaseX=mount.left-C.waistStandoff-actor.w/2;
  const actualBaseX=Number.isFinite(baseX)?baseX:naturalBaseX;
  const transferring=Number.isFinite(landingX)&&kind.startsWith('top-')&&Math.abs(landingX-actualBaseX)>.001;
  const expectedX=transferring?npcClimbLandingXV165(actualBaseX,landingX,kind,progress):actualBaseX;
  if (Math.abs(actualBaseX-naturalBaseX)>.26||Math.abs(actor.x-expectedX)>.26 || F<ladder.top-.01 || F>ladder.bottom+.01
    || actor.facing===-1 || actor.ladderId && actor.ladderId!==ladder.id
    || kind.startsWith('floor-') && Math.abs(F-ladder.bottom)>.01
    || kind.startsWith('top-') && Math.abs(F-ladder.top)>.01) return null;
  // Shift the rigid torso/pelvis down slightly while transferring weight
  // sideways onto an upper landing. The feet and retained rung grips stay
  // fixed; bending the real knees keeps the rear elbow from being folded
  // beyond its anatomical limit as the shoulder passes beside its hand.
  const transferP=kind==='top-dismount'?progress:1-progress;
  const transferCrouch=transferring&&Number.isFinite(C.topTransferCrouch)
    ?clamp(C.topTransferCrouch,0,8)*Math.sin(Math.PI*transferP)**2:0;
  waist.y+=transferCrouch;
  const torsoMatrix={a:s,b:0,c:0,d:s,e:waist.x-P.torso.waist.x*s,
    f:waist.y-P.torso.waist.y*s};
  const shoulders=Object.fromEntries(Object.entries(P.torso.shoulders).map(([side,p])=>[side,transform(torsoMatrix,p)]));
  const offsets=C.hipOffsets||{near:{x:2.5,y:8},far:{x:-2.5,y:8}};
  const hips=Object.fromEntries(['near','far'].map(side=>[side,point(center+offsets[side].x,waist.y+offsets[side].y)]));
  let hands={},feet={};
  for (const side of ['near','far']) {
    const offset=side==='near'?mount.rungSpacing:0;
    hands[side]=sampleNpcLadderContactV165(ladder,F-(C.handCursorOffset??73),offset,mount.left+(side==='near'?6:11),2.5,{centered});
    feet[side]=sampleNpcLadderContactV165(ladder,F-(C.footCursorOffset??13),offset,mount.left+(side==='near'?10:6),4,{centered});
  }
  if (kind!=='climb') {
    const floorKind=kind.startsWith('floor-'), entering=kind==='floor-mount'||kind==='top-mount';
    const p=entering?progress:1-progress;
    for (const side of ['near','far']) {
      const standingHand=freeContact(point(shoulders[side].x+10,shoulders[side].y+24));
      const standingFoot=floorContact(point(center+(side==='near'?8:-4),F));
      const handP=floorKind?clamp((p-(side==='near'?0:.15))/.4):clamp(p/.3);
      const footP=floorKind?clamp((p-(side==='near' ? .55 : .8))/.2)
        :clamp((p-(side==='near' ? .7 : .35))/.3);
      hands[side]=interpolateContact(standingHand,hands[side],handP);
      feet[side]=interpolateContact(standingFoot,feet[side],footP);
    }
  }
  if(transferring) {
    // First plant beside the real upper edge, then bring the rear foot onto
    // the landing, then take the short second step. A full-body sideways
    // slide would carry planted shoes across the platform and leave both
    // feet unsupported between the ladder and the real upper floor.
    const p=kind==='top-dismount'?progress:1-progress;
    const landingCenter=landingX+actor.w/2;
    const nearFootEnd=Number.isFinite(C.topTransferFootEnd)?clamp(C.topTransferFootEnd,.75,.95):.95;
    const farHandStart=Number.isFinite(C.topReleaseFarStart)?clamp(C.topReleaseFarStart,nearFootEnd,.95):.95;
    const initialHands={},initialFeet={};
    for(const side of ['near','far']) {
      const offset=side==='near'?mount.rungSpacing:0;
      initialHands[side]=sampleNpcLadderContactV165(ladder,F-(C.handCursorOffset??73),offset,
        mount.left+(side==='near'?6:11),2.5,{centered});
      initialFeet[side]=sampleNpcLadderContactV165(ladder,F-(C.footCursorOffset??13),offset,
        mount.left+(side==='near'?10:6),4,{centered});
      const rest=freeContact(point(shoulders[side].x+10,shoulders[side].y+24));
      const release=side==='near'?clamp((p-.65)/.3):clamp((p-farHandStart)/(1-farHandStart));
      hands[side]=interpolateContact(initialHands[side],rest,release);
      const arc=C.topReleaseArcs?.[side];
      if(Number.isFinite(arc)&&release>0&&release<1) {
        // A released hand moves around the shoulder rather than straight
        // through it. This arc never modifies a retained, planted grip.
        const dx=rest.point.x-initialHands[side].point.x,dy=rest.point.y-initialHands[side].point.y;
        const length=Math.hypot(dx,dy),lift=clamp(arc,-20,20)*Math.sin(Math.PI*release);
        if(length>1e-8)hands[side].point=point(hands[side].point.x+dy/length*lift,hands[side].point.y-dx/length*lift);
      }
    }
    const firstFoot=floorContact(point(mount.left+5,F));
    const farLanding=floorContact(point(landingCenter-4,F));
    const nearLanding=floorContact(point(landingCenter+8,F));
    feet.far=interpolateContact(initialFeet.far,farLanding,clamp((p-.4)/.3));
    if(p<=.35)feet.near=interpolateContact(initialFeet.near,firstFoot,p/.35);
    else if(p<=.7)feet.near=firstFoot;
    else if(p<nearFootEnd) {
      const q=(p-.7)/(nearFootEnd-.7);
      feet.near=freeContact(point(mix(firstFoot.point.x,nearLanding.point.x,smooth(q)),F-5*Math.sin(Math.PI*q)));
    } else feet.near=nearLanding;
  }
  const arms={},legs={},layers=[];
  for (const side of ['far','near']) {
    arms[side]=solvePlayerArmIKV125(shoulders[side],hands[side].point,{upper:C.upperArm,fore:C.forearm},1,C.armLimits);
    legs[side]=solvePlayerArmIKV125(hips[side],feet[side].point,{upper:C.thigh,fore:C.shinBoot},-1,C.legLimits);
  }
  const addSegment=(side,name,from,to,width)=>layers.push({ id:side+'-'+name,source:P[side][name].source,
    matrix:segmentMatrix(P[side][name],from,to,C.partWidths?.[side]?.[name]??width) });
  addSegment('far','upperArm',shoulders.far,arms.far.elbow,9);
  addSegment('far','forearm',arms.far.elbow,arms.far.hand,7.5);
  for(const side of ['far','near']) {
    addSegment(side,'thigh',hips[side],legs[side].elbow,side==='near'?13:12.5);
    addSegment(side,'shinBoot',legs[side].elbow,legs[side].hand,8.5);
    if(feet[side].planted&&feet[side].support==='physical-platform')layers.at(-1).platformClipY=feet[side].point.y;
  }
  const pelvis=P.pelvis;
  layers.push({id:'pelvis',source:pelvis.source,matrix:triangle([pelvis.waist,pelvis.hips.near,pelvis.hips.far],
    [waist,hips.near,hips.far])});
  layers.push({id:'head-torso',source:P.torso.source,matrix:torsoMatrix});
  addSegment('near','upperArm',shoulders.near,arms.near.elbow,10);
  addSegment('near','forearm',arms.near.elbow,arms.near.hand,7.8);
  const clamped=[...Object.values(arms),...Object.values(legs)].some(limb=>limb.reachClamped);
  return freeze({schema:165,eligible:!clamped,reason:clamped?'unreachable-real-contact':null,
    crewId:actor.crewId,kind,progress,standingHeight:92,waist,shoulders,hips,arms,legs,
    contacts:{hands,feet,ladderId:ladder.id},layers,asset:profile.asset,
    landing:transferring?{baseX:actualBaseX,landingX,actorX:expectedX,transferCrouch}:null,
    source:profile.source||'separated-npc-parts-position-owned-real-rungs',canonicalExact:false});
}

export function npcClimbImageReadyV165(image,asset) {
  return Boolean(asset&&image?.complete&&image.naturalWidth===asset.width&&image.naturalHeight===asset.height);
}
export function drawNpcClimbRigV165(ctx,image,rig) {
  if (!ctx||!rig?.eligible||!npcClimbImageReadyV165(image,rig.asset)) return false;
  for(const layer of rig.layers) {
    const m=layer.matrix,b=layer.source;
    ctx.save();
    if(Number.isFinite(layer.platformClipY)){ctx.beginPath();ctx.rect(-100000,-100000,200000,100000+layer.platformClipY);ctx.clip();}
    ctx.transform(m.a,m.b,m.c,m.d,m.e,m.f);
    ctx.drawImage(image,b.x,b.y,b.w,b.h,b.x,b.y,b.w,b.h);ctx.restore();
  }
  return true;
}

export const CAL_CLIMB_PROFILE_V165 = freeze({crewId:'crew-16-cal-mercer',asset:CAL_CLIMB_ASSET_V165,
  body:CAL_CLIMB_BODY_V165,parts:CAL_CLIMB_PARTS_V165,source:'separated-Cal-parts-position-owned-real-rungs'});
export function sampleCalLadderContactV165(...args){return sampleNpcLadderContactV165(...args);}
export function resolveCalClimbRigV165(actor,ladder,options={}){return resolveNpcClimbRigV165(actor,ladder,CAL_CLIMB_PROFILE_V165,options);}
export function calClimbImageReadyV165(image){return npcClimbImageReadyV165(image,CAL_CLIMB_ASSET_V165);}
export function drawCalClimbRigV165(ctx,image,rig){
  return rig?.crewId===CAL_CLIMB_PROFILE_V165.crewId&&rig?.asset?.sha256===CAL_CLIMB_ASSET_V165.sha256
    ?drawNpcClimbRigV165(ctx,image,rig):false;
}
