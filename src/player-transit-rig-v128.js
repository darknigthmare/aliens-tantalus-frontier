import { getPlayerTorsoAxisV160 } from './player-human-proportions-v160.js';
import { HUMAN_LEG_DIMENSIONS_V136, humanFootTravelV136 } from './human-motion-v136.js';
import { getPlayerCostumeSkinV119 } from './player-costume-skins-v119.js';
import { PLAYER_ARM_FLEXION_LIMITS_V160 } from './player-arm-constraints-v160.js';
import { PLAYER_VISUAL_CONTRACT_V81 } from './player-visual-contract-v81.js';
import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { resolvePlayerBodyRigV125, resolvePlayerArmPoseV125, solvePlayerArmIKV125,
  playerBodyRigImageReadyV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ANCHORS_V126, resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from './player-modular-rig-v126.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, finite(value, low)));
const point = (x, y) => ({ x, y });
const validPoint = value => Number.isFinite(value?.x) && Number.isFinite(value?.y);
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a, b, p) => a + (b - a) * p;
const mixPoint = (a, b, p) => point(mix(a.x, b.x, p), mix(a.y, b.y, p));
const transform = (m, p) => point(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f);
const imageFrom = (images, key) => images?.get?.(key) || images?.[key] || null;
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** One reviewed, unmodified imagegen adaptation. Fourteen genuinely separate
 * components, measured in the native PNG; no ladder, body, arm or weapon is
 * cropped from an older complete person. The marine near boot crosses the
 * nominal cell edge, so measurements deliberately include its whole sole. */
export const PLAYER_TRANSIT_RIG_ASSETS_V128 = freeze([{
  id: 'player.echo9-marine.modular-v128.leg-parts', kind: 'leg-parts', rigType: 'echo9',
  imageKey: 'playerLegPartsV128', path: '/assets/openai/sprites/player/rig-v128/echo9-leg-parts-v128.png',
  sourceWidth: 1254, sourceHeight: 1254, width: 1254, height: 1254, sourceFacing: 1,
  sha256: 'b21eaa6697beae3bdc153820ec39837e7399cc350fe095d82e168ac4c27ac6ed',
  exact: false, visualStatus: 'adapted-separated-echo9-leg-parts'
}]);
const LEG_ASSET = PLAYER_TRANSIT_RIG_ASSETS_V128[0];
const piece = (bounds, extra) => ({ alphaBounds: bounds, width: bounds[2] - bounds[0],
  source: { x: bounds[0] - 2, y: bounds[1] - 2,
    width: bounds[2] - bounds[0] + 4, height: bounds[3] - bounds[1] + 4 }, ...extra });
const segment = (bounds, proximal, distal) => piece(bounds, { proximal: point(...proximal), distal: point(...distal) });
const boot = (bounds, ankle, sole, heel, toe) => piece(bounds, { ankle: point(...ankle), sole: point(...sole),
  proximal: point(...ankle), distal: point(...sole), heel: point(...heel), toe: point(...toe) });
const pelvis = (bounds, waist, near, far) => piece(bounds, { waist: point(...waist), near: point(...near), far: point(...far) });

export const PLAYER_LEG_PARTS_V128 = freeze({
  'legs-marine-v126': {
    pelvis: {...pelvis([69,109,291,265], [181,176], [118,229], [258,226]), belt:point(181,145)},
    near: {
      upper: segment([413,63,579,308], [490,102], [516,277]),
      lower: segment([715,62,845,303], [786,112], [777,276]),
      boot: boot([1028,175,1201,324], [1079,259], [1138,322], [1047,310], [1184,310])
    },
    far: {
      upper: segment([97,375,285,599], [169,414], [225,572]),
      lower: segment([431,364,561,600], [501,411], [486,573]),
      boot: boot([722,480,895,617], [770,555], [834,615], [741,603], [879,603])
    }
  },
  'legs-utility-v126': {
    pelvis: {...pelvis([69,721,293,874], [181,787], [118,840], [258,837]), belt:point(181,756)},
    near: {
      upper: segment([414,660,580,913], [490,701], [516,881]),
      lower: segment([714,658,845,907], [784,707], [777,880]),
      boot: boot([1028,787,1201,931], [1079,868], [1136,929], [1047,918], [1184,918])
    },
    far: {
      upper: segment([97,948,290,1187], [169,992], [229,1159]),
      lower: segment([430,942,562,1188], [500,992], [486,1161]),
      boot: boot([722,1061,900,1199], [771,1137], [838,1197], [741,1185], [883,1185])
    }
  }
});

export const PLAYER_TRANSIT_PRESENTATION_V128 = freeze({
  schema: 128, downDuration: .42, deathDuration: .48, reviveDuration: .48,
  rungSpacing: 22, firstRung: 11, climbWaistStandoff: 28, ...HUMAN_LEG_DIMENSIONS_V136,
  artStatus: 'separated-pieces-with-constant-length-leg-ik'
});
const C = PLAYER_TRANSIT_PRESENTATION_V128;

function activeKind(actor) {
  if (actor?.downed && finite(actor.bleedOut) > 0) return 'downed';
  if (actor?.alive === false) return 'death';
  if (actor?.climbing) return 'climb';
  return null;
}
function acceptedActivity(actor, previous) {
  return finite(actor.shots) > finite(previous?.shots) || Math.abs(finite(actor.vx)) > 3
    || actor.grounded === false || actor.climbing || actor.reloading || actor.aimingV124 || actor.aiming
    || actor.fieldActionV124?.phase === 'working' || actor.placeableActionV124
    || finite(actor.meleeClock) > 0 || finite(actor.toolUseClock) > 0 || finite(actor.interactionClock) > 0
    || finite(actor.v52FireClock) > 0;
}

/** A pure observation clock. Call after simulation, never from a draw loop.
 * A restored fallen actor starts in its settled pose. Only an observed impact
 * or revival starts a cosmetic transition; drawing grants no revive or delay. */
export function advancePlayerTransitStateV128(previous, actor, timeSeconds, { context = '', ladder = null } = {}) {
  if (!actor || ![actor.x, actor.y, actor.w, actor.h, timeSeconds].every(Number.isFinite)
    || actor.w <= 0 || actor.h <= 0 || timeSeconds < 0) return null;
  const now = timeSeconds, rawKind = activeKind(actor);
  const discontinuity = !previous || previous.context !== context || now < previous.time
    || Math.hypot(actor.x - previous.x, actor.y - previous.y) > 160;
  const prior = discontinuity ? null : previous;
  const alive = actor.alive !== false && !actor.downed;
  const grounded = actor.grounded === true;
  const airborneTravel = prior && prior.kind === rawKind && !prior.grounded
    ? finite(prior.airborneTravel) + Math.abs(actor.y - prior.y) : 0;
  let kind = rawKind, elapsed = 0, duration = 0, observed = false;
  if (!rawKind && alive && prior && (prior.downed || prior.kind === 'revive') && !acceptedActivity(actor, prior)) {
    kind = 'revive'; duration = C.reviveDuration; observed = true;
    elapsed = prior.kind === 'revive' ? prior.elapsed + Math.max(0, now - prior.time) : 0;
    if (elapsed >= duration) { kind = null; elapsed = duration = 0; observed = false; }
  } else if (rawKind === 'downed' || rawKind === 'death') {
    duration = rawKind === 'downed' ? C.downDuration : C.deathDuration;
    // Resume restores physical support on the first world tick. A stationary
    // confirmation is not a new impact; actual observed descent is required
    // to animate a body that was restored in mid-air and then lands.
    const entered = prior && (prior.alive || prior.kind !== rawKind
      || !prior.grounded && grounded && airborneTravel > .01);
    observed = Boolean(entered || prior?.kind === rawKind && prior.observed);
    elapsed = !grounded ? 0 : entered ? 0 : prior?.kind === rawKind && observed
      ? Math.min(duration, prior.elapsed + Math.max(0, now - prior.time)) : duration;
  }
  const progress = duration > 0 ? clamp(elapsed / duration) : 0;
  const direction = Math.sign(finite(actor.vy));
  return freeze({ schema: 128, kind, phase: kind === 'climb' ? direction < 0 ? 'ascending' : direction > 0 ? 'descending' : 'holding'
    : !grounded && kind ? 'airborne' : duration && progress < 1 ? kind === 'revive' ? 'rising' : 'settling'
      : kind ? 'settled' : 'inactive',
    elapsed, duration, progress, time: now, context, x: actor.x, y: actor.y,
    alive, downed: Boolean(actor.downed), grounded, shots: finite(actor.shots), observed, airborneTravel,
    ladderId: kind === 'climb' ? String(ladder?.id || actor.ladderId || '') || null : null });
}

function identityRejection(actor, sample, surface, neuroActive) {
  if (!actor || ![actor.x, actor.y, actor.w, actor.h].every(Number.isFinite) || actor.w <= 0 || actor.h <= 0) return 'invalid-actor';
  if (!PLAYER_VISUAL_CONTRACT_V81.surfaces[surface]) return 'unsupported-surface';
  if (actor.inVehicle || actor.ventTransit || actor.vehicleAccessPhase) return 'authored-transit';
  if (actor.squadMember || actor.spriteId && !String(actor.spriteId).startsWith('player.echo9-marine.')) return 'other-character-art';
  if (neuroActive || actor.neuroActive || actor.playerClass === 'neuro-xeno' || actor.visualForm === 'xenomorph') return 'neuro-art';
  if (getPlayerCostumeSkinV119(actor.costumeId)) return 'dedicated-costume';
  if (actor.userEquipmentV95?.armorId) return 'custom-armor';
  const sheetId = sample?.sheet?.id || sample?.sheetId;
  if (sample?.skinId || sheetId && !/^player\.echo9-marine\.(locomotion|combat|melee|interaction|tool-use)$/.test(sheetId)) return 'other-pose-art';
  return null;
}
function ladderRungGrid(ladder) {
  return {
    spacing: ladder?.rungSpacing === undefined ? C.rungSpacing : ladder.rungSpacing,
    first: ladder?.firstRung === undefined ? C.firstRung : ladder.firstRung,
    // A renderer may provide actual rungs extending above the upper landing.
    // Never infer those grips for an older ladder that does not draw them.
    top: ladder?.rungTop === undefined ? ladder?.top : ladder.rungTop,
    // New contracts name the last painted rung itself (inclusive). Historical
    // ladders keep their physical bottom as an exclusive rung-loop boundary.
    bottom: ladder?.rungBottom === undefined ? ladder?.bottom : ladder.rungBottom,
    bottomInclusive: ladder?.rungBottom !== undefined
  };
}
function validLadder(ladder) {
  const { spacing, first, top, bottom } = ladderRungGrid(ladder);
  // Authored world-pixel grids may differ between locations. Reject invalid
  // overrides rather than silently planting on a default grid that is not drawn.
  return ladder && [ladder.x, ladder.top, ladder.bottom, spacing, first, top, bottom].every(Number.isFinite)
    && spacing >= 1 && spacing <= 128 && first > 0 && first <= spacing
    && top <= ladder.top
    && bottom <= ladder.bottom && bottom >= ladder.top + first
    && ladder.bottom - ladder.top >= first + 1
    && (ladder.w === undefined || Number.isFinite(ladder.w) && ladder.w > 14);
}

function triangle(source, target) {
  const [p,q,r] = source, [u,v,w] = target;
  const sx = q.x-p.x, sy = q.y-p.y, tx = r.x-p.x, ty = r.y-p.y, det = sx*ty-sy*tx;
  if (Math.abs(det) < 1e-8) return null;
  const a = ((v.x-u.x)*ty-(w.x-u.x)*sy)/det, c = (-(v.x-u.x)*tx+(w.x-u.x)*sx)/det;
  const b = ((v.y-u.y)*ty-(w.y-u.y)*sy)/det, d = (-(v.y-u.y)*tx+(w.y-u.y)*sx)/det;
  return { a,b,c,d,e:u.x-a*p.x-c*p.y,f:u.y-b*p.x-d*p.y };
}
function segmentMatrix(part, from, to, width, facing) {
  const sx = part.distal.x-part.proximal.x, sy = part.distal.y-part.proximal.y;
  const sourceLength = Math.hypot(sx,sy), dx = to.x-from.x, dy = to.y-from.y, length = Math.hypot(dx,dy);
  const ux=sx/sourceLength, uy=sy/sourceLength, wx=dx/length, wy=dy/length;
  const along=length/sourceLength, across=width/part.width*facing;
  const a=wx*along*ux+wy*across*uy, b=wy*along*ux-wx*across*uy;
  const c=wx*along*uy-wy*across*ux, d=wy*along*uy+wx*across*ux;
  return {a,b,c,d,e:from.x-a*part.proximal.x-c*part.proximal.y,f:from.y-b*part.proximal.x-d*part.proximal.y};
}
function legLayer(id, itemId, partName, part, matrix, asset=LEG_ASSET) {
  return { id, slot:'legs', itemId, imageKey:asset.imageKey, asset,
    part:partName, sourceRect:part.source, matrix, sourceSeparation:'independent-articulated-leg-part' };
}

function rotateLocal(origin, x, y, s, facing, angle=0) {
  const cos=Math.cos(angle), sin=Math.sin(angle);
  return point(origin.x+facing*(cos*x-sin*y)*s, origin.y+(sin*x+cos*y)*s);
}
function footFromSole(sole, s, facing, angle=0) {
  const offset=rotateLocal(point(0,0),9,11,s,facing,angle);
  const ankle=point(sole.x-offset.x,sole.y-offset.y);
  return {ankle,sole,heel:rotateLocal(ankle,-10,11,s,facing,angle),toe:rotateLocal(ankle,23,11,s,facing,angle)};
}
function footFromAnkle(ankle, s, facing, angle=0) {
  return footFromSole(rotateLocal(ankle,9,11,s,facing,angle),s,facing,angle);
}
function solveLeg(hip, foot, s, facing) {
  const solved=solvePlayerArmIKV125(hip,foot.ankle,{upper:C.upperLeg*s,fore:C.lowerLeg*s},-facing);
  const correction=point(solved.hand.x-foot.ankle.x,solved.hand.y-foot.ankle.y);
  const shifted=Object.fromEntries(['ankle','sole','heel','toe'].map(key=>[key,
    point(foot[key].x+correction.x,foot[key].y+correction.y)]));
  return {hip,knee:solved.elbow,...shifted,upper:C.upperLeg*s,lower:C.lowerLeg*s,
    reachClamped:solved.reachClamped,reachError:solved.reachError};
}

/** Position-driven stair function: each limb keeps one real rung through half
 * a stride, then travels to the next one. Reversing motion retraces the same
 * path; stopping cannot move a planted hand or boot, even with advancing time. */
function rungContact(ladder,cursor,offset,x,lift,facing) {
  const grid=ladderRungGrid(ladder),first=ladder.top+grid.first,stride=grid.spacing*2;
  const phase=(cursor-first-offset)/stride, whole=Math.floor(phase), p=phase-whole;
  const minimum=Math.min(0,Math.ceil((grid.top-first)/grid.spacing));
  const last=Math.max(0,grid.bottomInclusive?Math.floor((grid.bottom-first)/grid.spacing)
    :Math.ceil((grid.bottom-first)/grid.spacing)-1);
  const startIndex=clamp(whole*2+Math.round(offset/grid.spacing),minimum,last);
  const nextIndex=clamp(whole*2+Math.round(offset/grid.spacing)+2,minimum,last);
  // Keep acceleration continuous at release/contact without the sharp speed
  // peak of a whole-swing smoothstep. Height still owns phase, so holding or
  // reversing cannot slide a planted grip or introduce a render-clock cycle.
  const moving=p>=.5 && startIndex!==nextIndex, swing=moving?humanFootTravelV136((p-.5)*2):0;
  const y=mix(first+startIndex*grid.spacing,first+nextIndex*grid.spacing,swing);
  return {point:point(x-facing*Math.sin(Math.PI*swing)*lift,y),planted:!moving,
    rungIndex:!moving?startIndex:null,rungY:!moving?y:null,phase:p,swing};
}

function bodyFrame(base,waist,angle,kind) {
  const anatomical=PLAYER_MODULAR_RIG_ANCHORS_V126.locomotion[0], f=base.facing;
  const cos=Math.cos(angle), sin=Math.sin(angle), sx=base.sourceScaleX, sy=base.sourceScaleY;
  const a=f*cos*sx,b=sin*sx,c=-f*sin*sy,d=cos*sy;
  const matrix={a,b,c,d,e:waist.x-a*anatomical.waist.x-c*anatomical.waist.y,
    f:waist.y-b*anatomical.waist.x-d*anatomical.waist.y};
  const shoulders=Object.fromEntries(Object.entries(base.sourceFrame.sourceShoulders).map(([side,p])=>[side,transform(matrix,p)]));
  return {...base,matrix,shoulders,torsoAxisV160:getPlayerTorsoAxisV160(matrix,anatomical,f),atlas:'transit-v128',frame:kind==='climb'?0:kind==='downed'?1:kind==='death'?2:3,
    modularAnchorsV127:{...anatomical,family:kind==='climb'?'upright':'compact'},
    neutralGrip:point(shoulders.near.x+f*25*base.scale,shoulders.near.y+20*base.scale),
    gait:kind,stance:kind,moving:kind==='climb',sourceFrame:{...base.sourceFrame},
    visualStatus:'adapted-separated-echo9-transit-rig'};
}

/** The same measured seven-piece attachment is shared by transit and ordinary
 * locomotion. Additional outfits provide their own native pixels and measured
 * anchors; the caller owns that catalogue, avoiding a costume/renderer cycle.
 * An invalid or incomplete definition is omitted so the compositor can use its
 * complete native fallback instead of producing half a pair of trousers. */
export function buildPlayerArticulatedLowerLayersV128({waist,hips,legs,scale:s,facing,
  legDefinitions={},pelvisBelt=false,projectedHipSpread=1}={}) {
  const result={};
  const definitions={...Object.fromEntries(Object.entries(PLAYER_LEG_PARTS_V128)
    .map(([itemId,parts])=>[itemId,{parts,asset:LEG_ASSET}])),...legDefinitions};
  for(const [itemId,definition] of Object.entries(definitions)) {
    const {parts,asset}=definition||{};
    const measured=[parts?.pelvis,...['near','far'].flatMap(side=>
      [parts?.[side]?.upper,parts?.[side]?.lower,parts?.[side]?.boot])];
    if(!asset?.imageKey || ![asset.sourceWidth,asset.sourceHeight].every(n=>Number.isFinite(n)&&n>0)
      || measured.some(part=>!part?.source || !(part.width>0)
        || ![part.source.x,part.source.y,part.source.width,part.source.height].every(Number.isFinite))
      || !['waist','near','far'].every(key=>validPoint(parts.pelvis[key]))
      || ['near','far'].some(side=>['upper','lower','boot'].some(key=>
        !validPoint(parts[side][key].proximal)||!validPoint(parts[side][key].distal)
        || Math.hypot(parts[side][key].distal.x-parts[side][key].proximal.x,
          parts[side][key].distal.y-parts[side][key].proximal.y)<1e-6)))continue;
    const layers=[];
    for(const side of ['far','near']) {
      const pose=legs[side],p=parts[side];
      layers.push(legLayer(`${side}-thigh`,itemId,`${side}-upper-leg`,p.upper,
        segmentMatrix(p.upper,pose.hip,pose.knee,25*s,facing),asset));
      layers.push(legLayer(`${side}-shin`,itemId,`${side}-lower-leg`,p.lower,
        segmentMatrix(p.lower,pose.knee,pose.ankle,20*s,facing),asset));
      layers.push(legLayer(`${side}-boot`,itemId,`${side}-boot`,p.boot,
        segmentMatrix(p.boot,pose.ankle,pose.sole,32*s,facing),asset));
    }
    const p=parts.pelvis;
    // The pelvis overlaps the real round proximal ends of both thighs. V142
    // ground locomotion uses its measured belt and separates the jacket above
    // it; dedicated transit retains the reviewed original waist registration.
    // The old outside hip-protector pins encoded a wide three-quarter stance.
    // A profile pose projects the femoral sockets closer together inside that
    // same opaque cloth. Contract source and target depth together so a side
    // step does not squash the complete pelvis into a thin vertical strip.
    const sourceCenter=(p.near.x+p.far.x)/2;
    const sourceSpread=Number.isFinite(projectedHipSpread)&&projectedHipSpread>0?projectedHipSpread:1;
    const sourceHip=side=>sourceSpread!==1 ? point(sourceCenter+(p[side].x-sourceCenter)
      *sourceSpread,p[side].y) : p[side];
    layers.push(legLayer('pelvis',itemId,'pelvis',p,triangle([
      pelvisBelt && validPoint(p.belt) ? p.belt : p.waist,sourceHip('near'),sourceHip('far')],[waist,hips.near,hips.far]),asset));
    result[itemId]=layers;
  }
  return result;
}

function buildGeometry(base,actor,state,ladder,reducedMotion,legDefinitions) {
  const s=base.scale,f=base.facing,F=actor.y+actor.h,center=actor.x+actor.w/2,kind=state.kind;
  const rungSpacing=ladderRungGrid(ladder).spacing;
  const p=smooth(state.progress),standing=kind==='revive'?p:1-p;
  let angle,waist,contacts={ladderId:null,floorY:kind==='climb'?null:F,feet:{near:null,far:null},hands:{near:null,far:null}};
  const wallGrip = Boolean(ladder?.physicalSurfaceIdV135
    && ['left','right'].includes(ladder.physicalSurfaceFaceV135));
  if(kind==='climb') {
    // Keep the complete chest/hips far enough from the ladder that its far
    // hand can hold a real rung without folding inside the elbow's minimum
    // reach. The former 20px canonical gap put that hand ~7 world px from its
    // shoulder (minimum9.67); moving the whole climbing posture back four
    // world px preserves the rung, fixed bones and 145-degree elbow bound.
    // Jeri's native wall lies beside the collider, unlike a ladder centred
    // through it. Bring the entire posture towards that admitted face so both
    // hands can meet the wall without extending bones or folding past145°.
    // Real ladder rungs and the underside retain their own28px registration.
    angle=.09;waist=point(center-f*(wallGrip?4:C.climbWaistStandoff)*s,F-98*s);contacts.ladderId=String(ladder.id||actor.ladderId||'')||null;
  } else if(kind==='death') {
    angle=mix(.57,Math.PI/2-.08,p);waist=point(center+f*mix(0,16,p)*s,F-mix(51,30,p)*s);
  } else {
    angle=mix(.57,0,standing);waist=point(center,F-mix(51,101,standing)*s);
  }
  let hips,legs,body;
  // The support correction concerns only the visual pelvis. Its bound keeps
  // kneecaps over the floor during a collapse; actor collision is never readjusted.
  for(let iteration=0;iteration<8;iteration++) {
    body=bodyFrame(base,waist,angle,kind);
    hips={near:rotateLocal(waist,-9,10,s,f,angle),far:rotateLocal(waist,12,10,s,f,angle)};
    legs={};
    for(const side of ['near','far']) {
      let foot;
      const hip=hips[side];
      if(kind==='climb') {
        const contact=rungContact(ladder,F,side==='near'?0:rungSpacing,
          ladder.x+(side==='near'?3:-4)*f,9*s,f);
        contacts.feet[side]=contact;foot=footFromSole(contact.point,s,f);
      } else {
        const kneelAnkle=point(hip.x-f*17.5*s,F-11*s);
        const standAnkle=point(center+f*(side==='near'?5:-9)*s,F-11*s);
        if(kind==='death') {
          const dy=(F-11*s-hip.y)/s;
          const length=C.upperLeg+C.lowerLeg-1;
          const reach=Math.sqrt(Math.max(0,length*length-dy*dy));
          const final=point(hip.x-f*reach*s,F-11*s);
          foot=footFromAnkle(mixPoint(kneelAnkle,final,p),s,f);
        } else foot=footFromAnkle(mixPoint(kneelAnkle,standAnkle,standing),s,f);
        contacts.feet[side]={point:foot.sole,planted:true,rungIndex:null,rungY:null};
      }
      legs[side]=solveLeg(hip,foot,s,f);
    }
    if(kind==='climb')break;
    const excess=Math.max(...Object.values(legs).map(leg=>leg.knee.y-(F-6*s)),0);
    if(excess<.001)break;
    waist=point(waist.x,waist.y-Math.min(excess,8*s));
  }
  for(const side of ['near','far']) {
    const contact=contacts.feet[side];
    if(legs[side].reachClamped)contacts.feet[side]={...contact,point:legs[side].sole,planted:false,
      rungIndex:null,rungY:null,reachClamped:true};
  }
  // A fully extended arm can hold an actual ladder rung. The remaining elbow
  // flexion envelope is the same as tools/weapons; contact resolution and draw
  // must use it together instead of applying a later, different IK clamp.
  const armLimits={...PLAYER_ARM_FLEXION_LIMITS_V160,minFlexionDegrees:kind==='climb'?0:5};
  const hands={};
  for(const side of ['near','far']) {
    if(kind==='climb') {
      const contact=rungContact(ladder,F-132*s,side==='near'?rungSpacing:0,
        wallGrip?ladder.x:ladder.x+(side==='near'?-5:5)*f,5*s,f);
      const shoulder=body.shoulders[side];
      const solved=solvePlayerArmIKV125(shoulder,contact.point,body.armLengths[side],f,armLimits);
      hands[side]=solved.hand;
      contacts.hands[side]={...contact,point:solved.hand,planted:contact.planted&&!solved.reachClamped,
        rungIndex:solved.reachClamped?null:contact.rungIndex,rungY:solved.reachClamped?null:contact.rungY,
        reachClamped:solved.reachClamped};
    } else {
      const shoulder=body.shoulders[side];
      const ground=point(waist.x+f*(kind==='death'?67:40)*s,F-7*s);
      const rest=point(shoulder.x+f*(side==='near'?7:-5)*s,shoulder.y+53*s);
      const target=kind==='death'?ground:mixPoint(ground,rest,standing);
      let resolvedTarget=target;
      let solved=solvePlayerArmIKV125(shoulder,resolvedTarget,body.armLengths[side],f,armLimits);
      // A prone arm may otherwise choose the elbow branch below the floor.
      // Move the free hand's target outward/upward until the bent elbow has
      // physical clearance; keep both bone lengths and the ground unchanged.
      for(let attempt=0;attempt<12 && solved.elbow.y>F-8*s;attempt++) {
        resolvedTarget=point(resolvedTarget.x+f*4*s,resolvedTarget.y-3*s);
        solved=solvePlayerArmIKV125(shoulder,resolvedTarget,body.armLengths[side],f,armLimits);
      }
      hands[side]=solved.hand;
      contacts.hands[side]={point:solved.hand,planted:false,rungIndex:null,rungY:null,reachClamped:solved.reachClamped};
    }
  }
  body.modularLowerLayersV128=buildPlayerArticulatedLowerLayersV128({waist,hips,legs,scale:s,facing:f,legDefinitions});
  const handPose={unarmed:true,visible:false,grip:hands.near,support:hands.far,serviceHand:hands.far,armJointLimitsV160:armLimits,
    translation:point(0,0),handKinds:{near:kind==='climb'?'grip':'service',far:kind==='climb'?'grip':'service'}};
  return {bodyRig:body,handPose,legs,contacts};
}

/** Complete render geometry, independently of image readiness. V125's weapon
 * admission is unchanged: these observations cannot fire, heal or revive. */
export function resolvePlayerTransitRigV128({actor,appearance=actor?.appearanceV126,images=null,surface='mission',
  timeSeconds=0,reducedMotion=false,sample=null,ladder=null,transitState=null,neuroActive=false,legDefinitions={}}={}) {
  let reason=identityRejection(actor,sample,surface,neuroActive);
  const current=activeKind(actor);
  const state=transitState?.schema===128 && (current===transitState.kind || !current && transitState.kind==='revive')
    ? transitState : advancePlayerTransitStateV128(null,actor,Math.max(0,finite(timeSeconds)),{ladder});
  if(!reason && (!state?.kind || !current && state.kind==='revive' && acceptedActivity(actor,state)))reason='no-active-transit';
  if(!reason && state.kind==='climb' && (!validLadder(ladder)
    || actor.ladderId && String(actor.ladderId)!==String(ladder.id)))reason='ladder-unavailable';
  if(!reason && state.kind!=='climb' && actor.grounded!==true)reason='no-ground-support';
  if(reason)return freeze({schema:128,eligible:false,ready:false,reason,state,requiredAssets:[],missingAssets:[],firing:false});
  const observed={...actor,alive:true,downed:false,climbing:false,grounded:true,crouching:false,
    vx:0,vy:0,aiming:false,aimingV124:false,coverV124:null,reloading:false,tacticalReload:null,
    fieldActionV124:null,placeableActionV124:null,meleeClock:0,toolUseClock:0,interactionClock:0,
    v52HurtClock:0,shockClock:0,v52FireClock:0,weaponRigMotionV125:{distance:0,shotAt:-Infinity}};
  const base=resolvePlayerBodyRigV125({actor:observed,surface,images,timeSeconds:Math.max(0,finite(timeSeconds)),reducedMotion:true});
  if(!base.eligible)return freeze({schema:128,eligible:false,ready:false,reason:base.reason,state,requiredAssets:[],missingAssets:[],firing:false});
  const geometry=buildGeometry(base,actor,state,ladder,reducedMotion,legDefinitions);
  const selected=normalizePlayerAppearanceV126(appearance);
  const modular=resolvePlayerModularRigV126({bodyRig:geometry.bodyRig,appearance:selected,images});
  const requiredAssets=[...new Map([...base.requiredAssets,...modular.requiredAssets].map(a=>[a.imageKey,a])).values()];
  const missingAssets=requiredAssets.filter(a=>!playerBodyRigImageReadyV125(imageFrom(images,a.imageKey),a));
  const ready=modular.eligible&&modular.ready&&missingAssets.length===0;
  return freeze({schema:128,eligible:modular.eligible,ready,reason:!modular.eligible?modular.reason:!ready?'transit-images-unavailable':null,
    kind:state.kind,mode:state.kind==='climb'?state.phase:state.kind,phase:state.phase,progress:state.progress,
    source:state.kind==='climb'?'physical-ladder-position':'observed-actor-state',state,...geometry,
    arms:resolvePlayerArmPoseV125(geometry.bodyRig,geometry.handPose),requiredAssets,missingAssets,firing:false});
}

export function drawPlayerTransitRigV128(ctx,{transitRig,appearance,images}={}) {
  if(!transitRig?.eligible || !transitRig.ready)return {schema:126,drawn:false,fallback:true,
    reason:transitRig?.reason||'transit-unavailable',layers:[],effectiveSlots:null};
  const render=drawPlayerModularRigV126(ctx,{bodyRig:transitRig.bodyRig,appearance,images,handPose:transitRig.handPose});
  if(!render.drawn)return render;
  return {...render,transitV128:{schema:128,kind:transitRig.kind,mode:transitRig.mode,phase:transitRig.phase,
    progress:transitRig.progress,state:transitRig.state,legs:transitRig.legs,contacts:transitRig.contacts,firing:false}};
}
