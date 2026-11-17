import { PLAYER_MODULAR_SOURCE_ANCHORS_V160, getPlayerTorsoAxisV160 } from './player-human-proportions-v160.js';

// Original Tantalus pressure suit, not a franchise costume. Source measurements
// retain the complete connected alpha edge of all nineteen separate pieces.
// No source PNG, actor collision or persisted appearance is rewritten here.
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const transform = (m, p) => point(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f);
const imageFrom = (images, key) => images?.get?.(key) || images?.[key] || null;
const asset = (kind, imageKey, filename, sha256) => ({
  id: `player.hadal.v188.${kind}`, kind, imageKey, path: `/assets/abyss/v188/${filename}.png`,
  width: 1254, height: 1254, sourceWidth: 1254, sourceHeight: 1254, sourceFacing: 1,
  sha256, exact: false, canonExact: false, visualStatus: 'original-tantalus-hadal-parts'
});
export const HADAL_PLAYER_ART_V188 = freeze([
  asset('upper-parts', 'hadalPlayerUpperV188', 'hadal-upper-parts', '0756d843650c31bcddb4eef1dc8e432901527520f6251900ab86d6b01e7c4b1b'),
  asset('leg-parts', 'hadalPlayerLegsV188', 'hadal-leg-parts', 'e7e2ae1e4e996c94ce327ec2e91c2550291627ac58860b2ce856946ca36ea480'),
  asset('helmet', 'hadalPlayerHelmetV188', 'hadal-helmet', '94a728c58b324f0bb8403a0cee2ba7dd1002483a14741fce5e5674784e56c2b2')
]);
const [UPPER, LEGS, HELMET] = HADAL_PLAYER_ART_V188;
const part = (rect, width, extra = {}) => ({ source: { x: rect[0], y: rect[1], width: rect[2], height: rect[3] }, width, ...extra });
const torso = (rect, width, near, far, waist, neck) => part(rect, width, {
  joints: { near: point(...near), far: point(...far), waist: point(...waist) }, neckClosure: point(...neck)
});
const segment = (rect, width, proximal, distal, extra = {}) => part(rect, width, {
  proximal: point(...proximal), distal: point(...distal), ...extra
});
export const HADAL_PLAYER_PARTS_V188 = freeze({
  torso: {
    upright: torso([97,9,244,304], 226, [151,130], [313,105], [224,286], [240,35]),
    forward: torso([490,20,254,299], 242, [548,138], [720,120], [607,289], [656,53]),
    compact: torso([883,45,283,281], 268, [964,162], [1142,148], [989,297], [1095,89])
  },
  arms: {
    near: {
      upper: segment([141,337,174,293],163,[290,396],[190,580]),
      fore: segment([544,341,155,286],139,[636,369],[625,592]),
      grip: segment([962,360,180,244],169,[1029,403],[1054,510]),
      service: segment([141,650,193,268],179,[222,686],[217,805])
    },
    far: {
      upper: segment([526,639,180,291],165,[683,692],[577,878]),
      fore: segment([957,639,151,295],135,[1040,668],[1040,896]),
      grip: segment([158,964,170,244],159,[224,1008],[244,1110]),
      service: segment([515,957,216,281],195,[619,996],[618,1110])
    }
  },
  legs: {
    pelvis: part([29,211,297,251],286,{waist:point(180,312),belt:point(180,283),
      waistCoupling:point(183,239),near:point(80,388),far:point(307,373)}),
    near: {
      upper: segment([382,143,201,422],192,[554,218],[462,505]),
      lower: segment([670,149,176,418],165,[768,182],[748,527]),
      boot: segment([936,263,290,270],280,[1014,430],[1112,526],{
        ankle:point(1014,430),sole:point(1112,526),heel:point(955,516),toe:point(1210,513)})
    },
    far: {
      upper: segment([382,688,201,427],191,[554,765],[462,1057]),
      lower: segment([669,702,179,419],166,[768,731],[748,1078]),
      boot: segment([931,814,294,269],282,[1012,982],[1112,1078],{
        ankle:point(1012,982),sole:point(1112,1078),heel:point(955,1067),toe:point(1210,1065)})
    }
  },
  helmet: part([256,141,741,924],731,{alphaBounds:[261,146,992,1061],
    neckSeal:point(618,1020),ear:point(465,577),visorCenter:point(820,540),
    respiratoryReference:point(850,600),respiratoryRect:{x:820,y:580,width:60,height:40}})
});
export const HADAL_PLAYER_LEG_DEFINITIONS_V188 = freeze({
  'legs-hadal-v188': { asset: LEGS, parts: HADAL_PLAYER_PARTS_V188.legs }
});
export const HADAL_PLAYER_POSTURE_V188 = freeze({
  referenceStandingHeight: 96.5, helmetHeight: 18.5, respiratoryInsetY: .75,
  thoraxScale: .75, pelvisBelowWaist: 9,
  sourceMeasurementSha256: '6bf72c8bd86d3614b4f58857ded0c3a60bfcd1c31f3d0551cb9570950ecf210f',
  source: 'measured-neck-seal-and-opaque-visor-area', animation: 'native-locomotion-actions-and-transits-no-authored-swim-cycle'
});

function ownsSource(image, descriptor) {
  const source = image?.currentSrc || image?.src;
  if (typeof source !== 'string' || source.includes('\\')) return false;
  try {
    const origin = globalThis.location?.origin;
    const url = new URL(source, origin && origin !== 'null' ? `${origin}/` : 'https://hadal.invalid/');
    return ['http:', 'https:'].includes(url.protocol) && !url.search && !url.hash && !url.username && !url.password
      && (!origin || origin === 'null' || url.origin === origin) && url.pathname === descriptor.path;
  } catch { return false; }
}
export function hadalPlayerSourceReadyV188(image, descriptor) {
  return Boolean(image?.complete && Number(image.naturalWidth ?? image.width) === descriptor.sourceWidth
    && Number(image.naturalHeight ?? image.height) === descriptor.sourceHeight && ownsSource(image, descriptor));
}
const allParts = [
  ...Object.values(HADAL_PLAYER_PARTS_V188.torso).map(piece => [UPPER, piece]),
  ...Object.values(HADAL_PLAYER_PARTS_V188.arms).flatMap(side => Object.values(side).map(piece => [UPPER, piece])),
  [LEGS,HADAL_PLAYER_PARTS_V188.legs.pelvis],
  ...['near','far'].flatMap(side => Object.values(HADAL_PLAYER_PARTS_V188.legs[side]).map(piece => [LEGS,piece])),
  [HELMET,HADAL_PLAYER_PARTS_V188.helmet]
];
export function hadalPlayerArtReadyV188(images) {
  return HADAL_PLAYER_ART_V188.every(descriptor => hadalPlayerSourceReadyV188(imageFrom(images, descriptor.imageKey), descriptor))
    && allParts.every(([descriptor, piece]) => {
      const r = piece.source;
      return [r.x,r.y,r.width,r.height].every(Number.isFinite) && r.x >= 0 && r.y >= 0
        && r.width > 0 && r.height > 0 && r.x + r.width <= descriptor.sourceWidth
        && r.y + r.height <= descriptor.sourceHeight;
    });
}

/** The engine supplies the actual owner separately from a presentation copy.
 * Native body/action/transit eligibility still decides whether this context
 * may be consumed; no class, costume or capability is granted here. */
export function resolveHadalPlayerContextV188({ owner, player, legacyMission, surface = 'mission',
  neuroActive = false, artAdmitted = true } = {}) {
  if (!owner || owner !== player || legacyMission?.kind !== 'abyss' || surface !== 'mission'
    || legacyMission.aboard || owner.inVehicle || owner.ventTransit || owner.vehicleAccessPhase
    || neuroActive || owner.neuroActive || owner.playerClass === 'neuro-xeno' || owner.visualForm === 'xenomorph'
    || owner.userEquipmentV95?.armorId || owner.squadMember
    || ![owner.x,owner.y,owner.w,owner.h].every(Number.isFinite)) return null;
  return freeze({ schema:188, kind:'abyss-hadal', artAdmitted:Boolean(artAdmitted),
    oxygenProbe:{x:owner.x+owner.w/2-3,y:owner.y+12,w:6,h:12} });
}

export function selectHadalPlayerPoseV188(nativePose, context) {
  if (context?.kind !== 'abyss-hadal' || nativePose.gait !== 'airborne') return nativePose;
  // Only the upper reference is upright in free suspension. The native lower
  // frame and velocity-driven legs remain available for complete fallback.
  return {...nativePose,atlas:'locomotion',frame:0,nativeFallbackFrameV188:nativePose.frame};
}
const translated = (m, x, y) => ({...m,e:m.e+x,f:m.f+y});
function scaledAt(m, scale, pivot) {
  return {a:m.a*scale,b:m.b*scale,c:m.c*scale,d:m.d*scale,
    e:pivot.x+(m.e-pivot.x)*scale,f:pivot.y+(m.f-pivot.y)*scale};
}
function rotatedAt(m, angle, pivot) {
  const c=Math.cos(angle),s=Math.sin(angle);
  return {a:c*m.a-s*m.b,b:s*m.a+c*m.b,c:c*m.c-s*m.d,d:s*m.c+c*m.d,
    e:pivot.x+c*(m.e-pivot.x)-s*(m.f-pivot.y),f:pivot.y+s*(m.e-pivot.x)+c*(m.f-pivot.y)};
}
function inversePoint(m, p) {
  const det=m.a*m.d-m.b*m.c,x=p.x-m.e,y=p.y-m.f;
  return point((m.d*x-m.c*y)/det,(-m.b*x+m.a*y)/det);
}
function similarity(from, to, start, end, facing) {
  const sx=(to.x-from.x)*facing,sy=to.y-from.y,dx=end.x-start.x,dy=end.y-start.y;
  const scale=Math.hypot(dx,dy)/Math.hypot(sx,sy),angle=Math.atan2(dy,dx)-Math.atan2(sy,sx);
  const c=Math.cos(angle),s=Math.sin(angle),a=facing*c*scale,b=facing*s*scale,cc=-s*scale,d=c*scale;
  return {a,b,c:cc,d,e:start.x-a*from.x-cc*from.y,f:start.y-b*from.x-d*from.y};
}
function helmetAt(neck, body, anatomical, matrix) {
  const helmet=HADAL_PLAYER_PARTS_V188.helmet,waist=transform(matrix,anatomical.waist);
  const angle=Math.atan2(waist.y-neck.y,waist.x-neck.x)-Math.PI/2;
  const scale=body.standingHeight/HADAL_PLAYER_POSTURE_V188.referenceStandingHeight
    *HADAL_PLAYER_POSTURE_V188.helmetHeight/(helmet.alphaBounds[3]-helmet.alphaBounds[1]);
  const c=Math.cos(angle),s=Math.sin(angle),a=body.facing*c*scale,b=body.facing*s*scale,cc=-s*scale,d=c*scale;
  return {a,b,c:cc,d,e:neck.x-a*helmet.neckSeal.x-cc*helmet.neckSeal.y,
    f:neck.y-b*helmet.neckSeal.x-d*helmet.neckSeal.y};
}
const rectCorners = r => [point(r.x,r.y),point(r.x+r.width,r.y),point(r.x,r.y+r.height),point(r.x+r.width,r.y+r.height)];
function bounds(matrix, rect) {
  const p=rectCorners(rect).map(value=>transform(matrix,value));
  return {x:Math.min(...p.map(p=>p.x)),y:Math.min(...p.map(p=>p.y)),
    width:Math.max(...p.map(p=>p.x))-Math.min(...p.map(p=>p.x)),height:Math.max(...p.map(p=>p.y))-Math.min(...p.map(p=>p.y))};
}

/** One registration for the chest, neck, shoulders, real arms and real gun.
 * Images are deliberately absent from this calculation. A repeated decorator
 * starts from the same native base; no actor, timer or collision is mutated. */
export function adaptHadalPlayerBodyV188(bodyRig, { context, preserveContacts = false } = {}) {
  if (context?.kind !== 'abyss-hadal' || !bodyRig?.eligible || bodyRig.rigType !== 'echo9') return bodyRig;
  const anatomical=bodyRig.modularAnchorsV127 || PLAYER_MODULAR_SOURCE_ANCHORS_V160[bodyRig.atlas]?.[bodyRig.frame];
  if (!anatomical?.neck || !anatomical.waist || !bodyRig.matrix) return bodyRig;
  const family=anatomical.family,part=HADAL_PLAYER_PARTS_V188.torso[family];
  if (!part) return bodyRig;
  let matrix=bodyRig.matrix,neck=transform(matrix,anatomical.neck),waist=transform(matrix,anatomical.waist);
  if (!preserveContacts) {
    const desired=Math.PI/2+bodyRig.facing*finite(bodyRig.actionV127?.angle);
    matrix=rotatedAt(matrix,desired-Math.atan2(waist.y-neck.y,waist.x-neck.x),waist);
    neck=transform(matrix,anatomical.neck);
    const helmet=helmetAt(neck,bodyRig,anatomical,matrix);
    const breath=transform(helmet,HADAL_PLAYER_PARTS_V188.helmet.respiratoryReference);
    const probe=context.oxygenProbe,target=point(probe.x+probe.w/2,probe.y+HADAL_PLAYER_POSTURE_V188.respiratoryInsetY);
    matrix=translated(matrix,target.x-breath.x,target.y-breath.y);
    neck=transform(matrix,anatomical.neck);waist=transform(matrix,anatomical.waist);
    // The source seam includes lower-jacket overlap hidden by the native
    // supported belt. Calibrate the complete new thorax uniformly instead of
    // carrying that full overlap down into the hips. The authored family and
    // service tilt remain; sourceScaleY is the immutable native reference so
    // repeat decoration cannot shrink the body again. Arm and leg lengths,
    // physical sole plane and the closed helmet registration are unchanged.
    const fit=bodyRig.sourceScaleY*HADAL_PLAYER_POSTURE_V188.thoraxScale/Math.hypot(matrix.c,matrix.d);
    if (Number.isFinite(fit) && fit>0) {
      matrix=scaledAt(matrix,fit,neck);
      waist=transform(matrix,anatomical.waist);
    }
  }
  const torsoMatrix=similarity(part.joints.waist,part.neckClosure,waist,neck,bodyRig.facing);
  const helmetMatrix=helmetAt(neck,bodyRig,anatomical,matrix);
  const shoulders=preserveContacts?bodyRig.shoulders:{near:transform(torsoMatrix,part.joints.near),far:transform(torsoMatrix,part.joints.far)};
  const sourceShoulders=preserveContacts?bodyRig.sourceFrame.sourceShoulders:
    Object.fromEntries(Object.entries(shoulders).map(([side,p])=>[side,inversePoint(matrix,p)]));
  const marker={schema:188,kind:'abyss-hadal',context,family,torsoMatrix,helmetMatrix,
    breathingPoint:transform(helmetMatrix,HADAL_PLAYER_PARTS_V188.helmet.respiratoryReference),
    breathingBounds:bounds(helmetMatrix,HADAL_PLAYER_PARTS_V188.helmet.respiratoryRect),
    helmetBounds:bounds(helmetMatrix,{x:261,y:146,width:731,height:915}),neckSeal:neck,waist,
    preserveContacts,pelvis:preserveContacts?null:point(waist.x,waist.y+HADAL_PLAYER_POSTURE_V188.pelvisBelowWaist*bodyRig.scale)};
  return {...bodyRig,matrix,shoulders,sourceFrame:{...bodyRig.sourceFrame,sourceShoulders},
    torsoAxisV160:getPlayerTorsoAxisV160(matrix,anatomical,bodyRig.facing),
    neutralGrip:preserveContacts?bodyRig.neutralGrip:point(shoulders.near.x+bodyRig.facing*30*bodyRig.scale,shoulders.near.y+11*bodyRig.scale),
    sprite:preserveContacts?bodyRig.sprite:bounds(matrix,bodyRig.source),hadalPresentationV188:marker};
}

/** V129 may carry the whole upper skeleton by a small supported weight shift.
 * Its pixels and the measured visor must follow that same final transform. */
export function finalizeHadalPlayerBodyV188(bodyRig) {
  const marker=bodyRig?.hadalPresentationV188,shift=bodyRig?.weightTransferV160;
  if (!marker || !shift || marker.preserveContacts || marker.finalized) return bodyRig;
  const dx=finite(shift.x),dy=finite(shift.y),move=p=>point(p.x+dx,p.y+dy),box=r=>({...r,x:r.x+dx,y:r.y+dy});
  return {...bodyRig,hadalPresentationV188:{...marker,finalized:true,
    torsoMatrix:translated(marker.torsoMatrix,dx,dy),helmetMatrix:translated(marker.helmetMatrix,dx,dy),
    breathingPoint:move(marker.breathingPoint),breathingBounds:box(marker.breathingBounds),
    helmetBounds:box(marker.helmetBounds),neckSeal:move(marker.neckSeal),waist:move(marker.waist)}};
}

export function hadalPlayerKitStatusV188(bodyRig, images) {
  const marker=bodyRig?.hadalPresentationV188;
  return marker ? {schema:188,active:true,kitReady:Boolean(marker.context.artAdmitted && hadalPlayerArtReadyV188(images)),
    cacheAdmitted:marker.context.artAdmitted,oxygenProbe:marker.context.oxygenProbe,
    breathingPoint:marker.breathingPoint,breathingBounds:marker.breathingBounds,helmetBounds:marker.helmetBounds,
    neckSeal:marker.neckSeal,waist:marker.waist,preserveContacts:marker.preserveContacts} : null;
}

export const HADAL_PLAYER_RENDER_SLOTS_V188 = freeze({
  torso:'torso-hadal-v188',arms:'arms-hadal-v188',legs:'legs-hadal-v188',helmet:'helmet-hadal-v188',mask:null,back:null
});
