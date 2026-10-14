import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import {
  PLAYER_BODY_RIG_ASSETS_V125, PLAYER_ARM_PARTS_V125,
  playerBodyRigImageReadyV125, resolvePlayerArmPoseV125
} from './player-body-rig-v125.js';
import { getPlayerColonialTorsoV129, getPlayerColonialArmsV129,
  getPlayerColonialHelmetV129, getPlayerColonialBackV129,
  PLAYER_COLONIAL_LEG_DEFINITIONS_V129 } from './player-colonial-art-v129.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const validPoint = p => Number.isFinite(p?.x) && Number.isFinite(p?.y);
const imageFrom = (images, key) => images?.get?.(key) || images?.[key] || null;
const descriptor = (kind, imageKey, sha256) => freeze({
  id: `player.echo9-marine.modular-v126.${kind}`, rigType: 'echo9', kind, imageKey,
  path: `/assets/openai/sprites/player/rig-v126/echo9-${kind}-v126.png`,
  sourceWidth: 1254, sourceHeight: 1254, width: 1254, height: 1254,
  sourceFacing: 1, sha256, exact: false, visualStatus: 'adapted-separated-echo9-parts'
});

/** Three reviewed imagegen adaptations of the V125 Echo9 references. The
 * transparent PNGs contain actual separated parts. The utility torso sleeves
 * were removed in a second edit; both empty helmet face apertures were opened
 * in alpha in a second edit. No generated full body, baked gun or old helmet
 * is drawn beneath a selected part. Source dimensions are measured, not a
 * nominal grid size. Components may cross the nominal 4x4 cell boundaries.
 */
export const PLAYER_MODULAR_RIG_ASSETS_V126 = freeze([
  descriptor('upper-parts', 'playerUpperPartsV126', '5c8b3a6e993bfb2d6b0b1cabb37b84aa734af829f8dd391170720380f0d66dc0'),
  descriptor('lower-parts', 'playerLowerPartsV126', '424346ab875e97db848268bfd04e77736e44482afe7d70f6df7a45d47f1da97c'),
  descriptor('head-back-parts', 'playerHeadBackPartsV126', 'ac3bfbffd40fa16ee10fdcad1fe6f0818a0af1aeaa5b116cba402fd5927dd450')
]);
const [UPPER, LOWER, HEAD_BACK] = PLAYER_MODULAR_RIG_ASSETS_V126;
const MARINE_ARMS = PLAYER_BODY_RIG_ASSETS_V125[2];

const part = (bounds, extra = {}) => {
  const [left, top, right, bottom] = bounds;
  return { alphaBounds: bounds, source: { x: left - 2, y: top - 2,
    width: right - left + 4, height: bottom - top + 4 }, width: right - left, ...extra };
};
const torso = (bounds, near, far, waist) => part(bounds, {
  joints: { near: point(...near), far: point(...far), waist: point(...waist) }
});
const arm = (bounds, proximal, distal) => part(bounds, { proximal: point(...proximal), distal: point(...distal) });

/** Absolute native image measurements. A 32/255 alpha threshold is used only
 * for measurement, never to rewrite pixels; tight source rectangles keep the
 * faint generation residue in otherwise empty cells outside rendered parts.
 */
export const PLAYER_MODULAR_RIG_PARTS_V126 = freeze({
  torso: {
    'torso-marine-v126': {
      upright: torso([45,61,269,312], [103,175], [236,153], [169,281]),
      forward: torso([362,63,595,320], [425,179], [554,164], [478,287]),
      compact: torso([675,104,913,330], [744,221], [871,188], [784,297])
    },
    'torso-utility-v126': {
      upright: torso([992,64,1209,319], [1037,174], [1173,153], [1116,283]),
      forward: torso([73,380,283,633], [144,488], [259,462], [175,597]),
      compact: torso([371,405,602,641], [434,521], [566,488], [478,609])
    }
  },
  arms: {
    near: {
      upper: arm([733,370,870,657], [800,402], [801,605]),
      fore: arm([1030,391,1166,657], [1090,437], [1127,616]),
      grip: arm([102,717,262,941], [163,747], [184,857]),
      service: arm([370,716,555,955], [457,748], [458,871])
    },
    far: {
      upper: arm([725,687,876,970], [806,718], [786,924]),
      fore: arm([1045,712,1178,970], [1120,752], [1100,933]),
      grip: arm([75,1005,234,1209], [175,1035], [148,1147]),
      service: arm([384,1014,558,1230], [484,1043], [475,1165])
    }
  },
  lower: [
    [82,97,235,311], [401,96,547,311], [709,97,860,311], [1029,97,1178,311],
    [39,405,293,611], [370,403,602,611], [671,405,921,613], [1004,403,1232,611],
    [101,769,247,915], [391,741,573,916], [720,692,882,879], [1056,741,1190,914],
    [81,1048,247,1197], [385,1034,572,1198], [708,1021,893,1213]
  ].map(bounds => part(bounds)),
  head: {
    upright: part([73,79,256,303], { neck: point(143,292), ear: point(132,188), nose: point(237,195) }),
    forward: part([377,105,586,308], { neck: point(451,291), ear: point(450,220), nose: point(559,229) })
  },
  helmet: {
    'helmet-marine-v126': part([651,64,909,309], { ear: point(746,201) }),
    'helmet-patrol-v126': part([974,85,1226,282], { ear: point(1042,221) })
  },
  mask: part([69,468,255,607], { nose: point(234,493) }),
  back: {
    'back-field-pack-v126': part([353,374,594,649], { mount: point(568,421) }),
    'back-radio-v126': part([706,360,890,657], { mount: point(865,443) })
  },
  straps: {
    'back-field-pack-v126': part([1066,376,1205,661], { mount: point(1105,404), end: point(1130,627) }),
    'back-radio-v126': part([466,696,566,972], { mount: point(500,720), end: point(516,941) })
  }
});

const anchors = (neck, waist, cut, legBounds, family = 'compact') => ({
  neck: point(...neck), waist: point(...waist), cut: cut.map(p => point(...p)), legBounds, family
});
const idle = offset => anchors([146 + offset,108], [140 + offset,173],
  [[92 + offset,185],[181 + offset,185],[205 + offset,188]], [91 + offset,185,201 + offset,304], 'upright');
const walk = (offset, left, right) => anchors([176 + offset,418], [151 + offset,486],
  [[109 + offset,502],[146 + offset,500],[177 + offset,496],[201 + offset,508]], [left,496,right,613], 'forward');

/** The seam follows the waistband and raised thigh, not a fixed horizontal
 * crop through a crouched leg. All coordinates stay in the V125 source frame;
 * the supplied V125 matrix, feet, shoulders and IK lengths remain unchanged.
 */
export const PLAYER_MODULAR_RIG_ANCHORS_V126 = freeze({
  locomotion: [
    idle(0), idle(314), idle(628), idle(942),
    walk(0,60,241), walk(313,380,550), walk(627,690,868), walk(940,1008,1177),
    anchors([165,790],[136,855],[[90,875],[123,874],[152,859],[186,861],[201,875]],[99,859,197,928]),
    anchors([486,784],[449,848],[[378,864],[431,864],[463,855],[494,850],[520,860]],[382,850,515,927]),
    anchors([788,706],[753,776],[[699,795],[743,795],[773,779],[801,782],[825,795]],[704,779,820,878]),
    anchors([1107,746],[1075,813],[[1020,832],[1062,831],[1091,812],[1126,814],[1142,830]],[1025,812,1138,900]),
    anchors([161,1112],[128,1176],[[79,1193],[110,1193],[139,1182],[164,1163],[208,1167]],[85,1163,206,1237]),
    anchors([483,1101],[448,1164],[[380,1184],[418,1184],[454,1168],[478,1159],[522,1169]],[387,1159,520,1237])
  ],
  combat: { 3: anchors([1096,114],[1076,173],
    [[1007,190],[1055,189],[1084,190],[1116,185],[1148,199]],[1012,185,1145,295], 'forward') }
});

const transformPoint = (m, p) => point(m.a*p.x + m.c*p.y + m.e, m.b*p.x + m.d*p.y + m.f);
const compose = (left, right) => ({
  a: left.a*right.a + left.c*right.b, b: left.b*right.a + left.d*right.b,
  c: left.a*right.c + left.c*right.d, d: left.b*right.c + left.d*right.d,
  e: left.a*right.e + left.c*right.f + left.e, f: left.b*right.e + left.d*right.f + left.f
});
function attachment(source, target, sx, sy = sx, angle = 0) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const a = cos*sx, b = sin*sx, c = -sin*sy, d = cos*sy;
  return { a,b,c,d,e:target.x-a*source.x-c*source.y,f:target.y-b*source.x-d*source.y };
}
function triangle(source, target) {
  const p=source.near,q=source.far,r=source.waist;
  const u=target.near,v=target.far,w=target.waist;
  const sx=q.x-p.x,sy=q.y-p.y,tx=r.x-p.x,ty=r.y-p.y,det=sx*ty-sy*tx;
  const a=((v.x-u.x)*ty-(w.x-u.x)*sy)/det;
  const c=(-(v.x-u.x)*tx+(w.x-u.x)*sx)/det;
  const b=((v.y-u.y)*ty-(w.y-u.y)*sy)/det;
  const d=(-(v.y-u.y)*tx+(w.y-u.y)*sx)/det;
  return {a,b,c,d,e:u.x-a*p.x-c*p.y,f:u.y-b*p.x-d*p.y};
}
const layer = (id,slot,itemId,asset,partName,definition,matrix,extra={}) => ({
  id,slot,itemId,imageKey:asset.imageKey,asset,part:partName,sourceRect:definition.source,matrix,...extra
});
// V128 supplies a complete, already solved lower body made from actual
// separated pelvis/leg/boot art. This hook accepts no partial substitute and
// does not change the original locomotion or firing geometry.
function validLowerLayersV128(layers, itemId) {
  return Array.isArray(layers) && layers.length === 7
    && new Set(layers.map(entry => entry.id)).size === layers.length
    && layers.every(entry => {
      const source = entry?.sourceRect, asset = entry?.asset, matrix = entry?.matrix;
      return entry?.slot === 'legs' && entry.itemId === itemId
        && entry.imageKey === asset?.imageKey && source && asset && matrix
        && [source.x, source.y, source.width, source.height,
          asset.sourceWidth, asset.sourceHeight].every(Number.isFinite)
        && source.x >= 0 && source.y >= 0 && source.width > 0 && source.height > 0
        && source.x + source.width <= asset.sourceWidth
        && source.y + source.height <= asset.sourceHeight
        && ['a','b','c','d','e','f'].every(key => Number.isFinite(matrix[key]))
        && Math.abs(matrix.a * matrix.d - matrix.b * matrix.c) > 1e-12;
    });
}
// An eight-source-pixel seam overlap is hidden under the independent waistband.
// It closes the real alpha edge of both tops without moving feet, shoulders,
// resizing the torso or extending any native cut as far up as the old pack.
const WAIST_OVERLAP = 8;
const nativeSeamPolygon = (bodyRig, anatomical) => {
  const source=bodyRig.source,bottom=bodyRig.sourceFrame.support.y+3;
  const cut=anatomical.cut.map(p=>point(p.x,p.y-WAIST_OVERLAP));
  return [point(source.x,cut[0].y),...cut,
    point(source.x+source.width,cut.at(-1).y),point(source.x+source.width,bottom),point(source.x,bottom)];
};

/** This resolver is pure and deliberately accepts the existing body rig. A
 * cosmetic choice cannot alter the V125 firing origin, collision or pose.
 * Readiness is all-or-nothing, independently of the numeric body geometry.
 */
export function resolvePlayerModularRigV126({bodyRig,appearance,images}={}) {
  const selected=normalizePlayerAppearanceV126(appearance), slots=selected.slots;
  const anatomical=bodyRig?.modularAnchorsV127 || PLAYER_MODULAR_RIG_ANCHORS_V126[bodyRig?.atlas]?.[bodyRig?.frame];
  const lowerLayers=bodyRig?.modularLowerLayersV128?.[slots.legs];
  const reason=!bodyRig?.eligible ? bodyRig?.reason || 'body-rig-ineligible'
    : bodyRig.rigType!=='echo9' || !anatomical || !validPoint(bodyRig.shoulders?.near)
      || !validPoint(bodyRig.shoulders?.far) || !bodyRig.matrix ? 'modular-pose-unavailable'
      : (bodyRig.modularLowerLayersV128 || PLAYER_COLONIAL_LEG_DEFINITIONS_V129[slots.legs])
        && !validLowerLayersV128(lowerLayers,slots.legs)
        ? 'modular-lower-body-unavailable' : null;
  if(reason) return freeze({schema:126,eligible:false,ready:false,reason,fallbackReason:reason,
    requestedSlots:slots,effectiveSlots:null,requiredAssets:[],layers:[],bodyRig});
  const m=bodyRig.matrix,sourceShoulders=bodyRig.sourceFrame.sourceShoulders;
  const colonialTorso=getPlayerColonialTorsoV129(slots.torso,bodyRig.facing,anatomical.family);
  const torsoPart=colonialTorso?.part || PLAYER_MODULAR_RIG_PARTS_V126.torso[slots.torso][anatomical.family];
  const torsoMatrix=compose(m,triangle(torsoPart.joints,{...sourceShoulders,waist:anatomical.waist}));
  const upright=anatomical.family==='upright', headPart=PLAYER_MODULAR_RIG_PARTS_V126.head[upright?'upright':'forward'];
  const headMatrix=compose(m,attachment(headPart.neck,anatomical.neck,.255,.255,finite(anatomical.headAngle)));
  const lean=Math.atan2(anatomical.neck.x-anatomical.waist.x,anatomical.waist.y-anatomical.neck.y);
  const layers=[];
  if(slots.back) {
    const colonialBack=getPlayerColonialBackV129(slots.back,bodyRig.facing);
    const p=colonialBack?.part || PLAYER_MODULAR_RIG_PARTS_V126.back[slots.back];
    const anchor=point(sourceShoulders.near.x-8,sourceShoulders.near.y-12);
    layers.push(layer('back','back',slots.back,colonialBack?.asset || HEAD_BACK,
      colonialBack?'film-back-attachment':'pack',p,
      compose(m,attachment(p.mount,anchor,
        (p.scaleX ?? .155)*(p.sourceFacing ?? 1),p.scaleY ?? .24,lean))));
  }
  const seam=lowerLayers ? null : nativeSeamPolygon(bodyRig,anatomical);
  if(lowerLayers) {
    layers.push(...lowerLayers);
  } else if(slots.legs==='legs-marine-v126') {
    const top=Math.min(...anatomical.cut.map(p=>p.y))-WAIST_OVERLAP,source=bodyRig.source;
    const crop={source:{x:source.x,y:top,width:source.width,height:bodyRig.sourceFrame.support.y-top+3}};
    layers.push(layer('legs','legs',slots.legs,bodyRig.asset,'native-lower-body',crop,m,
      {clipPolygon:seam,clipMatrix:m,sourceSeparation:'anatomical-waist-cut'}));
  } else {
    const p=PLAYER_MODULAR_RIG_PARTS_V126.lower[bodyRig.atlas==='combat'?14:bodyRig.frame];
    const [left,top,right,bottom]=p.alphaBounds, [nl,nt,nr,nb]=anatomical.legBounds;
    // The torso owns the belt. The independent trouser piece begins beneath
    // its own belt, so mixing tops cannot render two waistbands.
    const trouserTop=top+12, nativeTop=nt-WAIST_OVERLAP, sx=(nr-nl)/(right-left),sy=(nb-nativeTop)/(bottom-trouserTop);
    const crop={source:{x:left-2,y:trouserTop,width:right-left+4,height:bottom-trouserTop+2}};
    layers.push(layer('legs','legs',slots.legs,LOWER,'utility-lower-body',crop,
      compose(m,attachment(point(left,trouserTop),point(nl,nativeTop),sx,sy)),
      {clipPolygon:seam,clipMatrix:m,sourceSeparation:'authored-trouser-piece'}));
  }
  // Neck is behind the selected collar; no old head remains underneath it.
  layers.push(layer('bare-head','head',null,HEAD_BACK,upright?'bare-head-upright':'bare-head-forward',headPart,headMatrix));
  layers.push(layer('torso','torso',slots.torso,colonialTorso?.asset || UPPER,anatomical.family,torsoPart,torsoMatrix));
  if(slots.helmet) {
    const colonialHelmet=getPlayerColonialHelmetV129(slots.helmet,bodyRig.facing);
    const p=colonialHelmet?.part || PLAYER_MODULAR_RIG_PARTS_V126.helmet[slots.helmet];
    layers.push(layer('helmet','helmet',slots.helmet,colonialHelmet?.asset || HEAD_BACK,'open-helmet',p,
      compose(headMatrix,attachment(p.ear,headPart.ear,
        (p.fitScale ?? 1)*(p.sourceFacing ?? 1),p.fitScale ?? 1,upright?0:.14))));
  }
  if(slots.mask) {
    const p=PLAYER_MODULAR_RIG_PARTS_V126.mask;
    layers.push(layer('mask','mask',slots.mask,HEAD_BACK,'respirator',p,
      compose(headMatrix,attachment(p.nose,headPart.nose,.62,.62,upright?0:.14))));
  }
  if(slots.back && PLAYER_MODULAR_RIG_PARTS_V126.straps[slots.back]) {
    const p=PLAYER_MODULAR_RIG_PARTS_V126.straps[slots.back];
    const anchor=point(sourceShoulders.far.x-4,sourceShoulders.far.y-16);
    layers.push(layer('back-strap','back',slots.back,HEAD_BACK,'front-strap',p,
      compose(m,attachment(p.mount,anchor,.055,.245,lean))));
  }
  const colonialArms=getPlayerColonialArmsV129(slots.arms);
  const armAsset=colonialArms?.asset || (slots.arms==='arms-marine-v126'?MARINE_ARMS:UPPER);
  const armParts=colonialArms?.parts || (slots.arms==='arms-marine-v126'?PLAYER_ARM_PARTS_V125:PLAYER_MODULAR_RIG_PARTS_V126.arms);
  const requiredAssets=[...new Map([...layers.map(l=>l.asset),armAsset].map(a=>[a.imageKey,a])).values()];
  const missingAssets=requiredAssets.filter(a=>!playerBodyRigImageReadyV125(imageFrom(images,a.imageKey),a));
  return freeze({schema:126,eligible:true,ready:missingAssets.length===0,
    reason:missingAssets.length?'modular-images-unavailable':null,
    fallbackReason:missingAssets.length?'modular-images-unavailable':null,
    requestedSlots:slots,effectiveSlots:missingAssets.length?null:{...slots},requiredAssets,missingAssets,
    layers,bodyRig,armAsset,armParts,anatomical,
    visualStatus:requiredAssets.some(asset=>asset.provenance==='film-reference-adaptation')
      ?'film-reference-separated-costume':'adapted-separated-echo9-parts',
    sourceSeparation:lowerLayers?'independent-parts-and-segmented-legs':'independent-parts-and-native-leg-cuts'});
}

/** A genuinely empty pair of hands, with the same two-bone solver and lengths
 * as held weapons. No inventory object or invisible weapon is required.
 */
export function createPlayerNeutralPoseV126(bodyRig) {
  if(!bodyRig?.eligible || !validPoint(bodyRig.shoulders?.near) || !validPoint(bodyRig.shoulders?.far)) return null;
  const s=bodyRig.scale,f=bodyRig.facing;
  const sway=bodyRig.moving?Math.sin(finite(bodyRig.timeSeconds)*4)*4*s:0;
  const grip=point(bodyRig.shoulders.near.x+f*(8*s+sway),bodyRig.shoulders.near.y+55*s);
  const support=point(bodyRig.shoulders.far.x-f*(8*s+sway),bodyRig.shoulders.far.y+55*s);
  return freeze({unarmed:true,visible:false,grip,support,serviceHand:support,translation:point(0,0)});
}

function armMatrix(p,from,to,width,facing) {
  const sx=p.distal.x-p.proximal.x,sy=p.distal.y-p.proximal.y,sourceLength=Math.hypot(sx,sy);
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);
  if(sourceLength<1e-8 || length<1e-8) return null;
  const ux=sx/sourceLength,uy=sy/sourceLength,wx=dx/length,wy=dy/length;
  const along=length/sourceLength,across=width/p.width*facing;
  const a=wx*along*ux+wy*across*uy,b=wy*along*ux-wx*across*uy;
  const c=wx*along*uy-wy*across*ux,d=wy*along*uy+wx*across*ux;
  return {a,b,c,d,e:from.x-a*p.proximal.x-c*p.proximal.y,f:from.y-b*p.proximal.x-d*p.proximal.y};
}
function drawLayer(ctx,images,l) {
  ctx.save();
  if(l.clipPolygon) {
    const poly=l.clipPolygon.map(p=>transformPoint(l.clipMatrix,p));
    ctx.beginPath();ctx.moveTo(poly[0].x,poly[0].y);
    for(const p of poly.slice(1))ctx.lineTo(p.x,p.y);
    ctx.closePath();ctx.clip();
  }
  const {a,b,c,d,e,f}=l.matrix,s=l.sourceRect;
  ctx.transform(a,b,c,d,e,f);
  ctx.drawImage(resolveSpriteDrawableV134(imageFrom(images, l.imageKey)),s.x,s.y,s.width,s.height,s.x,s.y,s.width,s.height);
  ctx.restore();
}

/** World-space compositor. The caller owns camera translation. With no weapon
 * pose AND no callback it draws relaxed hands; an incomplete armed request
 * falls back before any draw, as does a missing image, never a half body.
 */
export function drawPlayerModularRigV126(ctx,options={}) {
  const resolved=resolvePlayerModularRigV126(options),bodyRig=options.bodyRig;
  const hasWeapon=options.weaponPose!=null,hasCallback=typeof options.drawWeapon==='function';
  const hasAction=options.handPose!=null;
  const invalidWeapon=hasWeapon!==hasCallback || hasWeapon && options.weaponPose.visible===false
    || hasAction && (hasWeapon || hasCallback);
  const reason=!resolved.eligible || !resolved.ready ? resolved.reason
    : !ctx?.drawImage || !ctx?.transform || !ctx?.clip ? 'canvas-unavailable'
      : invalidWeapon?'weapon-pose-unavailable'
        : hasAction && (!validPoint(options.handPose.grip) || !validPoint(options.handPose.support))?'action-hands-unavailable':null;
  if(reason)return {...resolved,drawn:false,fallback:true,reason,fallbackReason:reason,effectiveSlots:null,layers:[]};
  const weaponPose=hasAction?options.handPose:hasWeapon?options.weaponPose:createPlayerNeutralPoseV126(bodyRig);
  const arms=resolvePlayerArmPoseV125(bodyRig,weaponPose);
  if(!arms)return {...resolved,drawn:false,fallback:true,reason:'arm-pose-invalid',fallbackReason:'arm-pose-invalid',layers:[]};
  const layers=[];
  const draw=l=>{drawLayer(ctx,options.images,l);layers.push(l);};
  const drawArm=(side,kind)=>{
    const arm=arms[side],isHand=kind==='hand';
    const type=isHand?(hasAction?options.handPose.handKinds?.[side]==='grip'?'grip':'service'
      :!hasWeapon || arm.service?'service':'grip'):kind;
    const p=resolved.armParts[side][type];
    const from=kind==='upper'?arm.shoulder:kind==='fore'?arm.elbow:arm.wrist;
    const to=kind==='upper'?arm.elbow:kind==='fore'?arm.wrist:arm.hand;
    const width=(kind==='upper'?15:kind==='fore'?11.5:10)*bodyRig.scale;
    const matrix=armMatrix(p,from,to,width,bodyRig.facing);
    if(matrix)draw(layer(`${side}-${kind}`,'arms',resolved.requestedSlots.arms,resolved.armAsset,`${side}-${type}`,p,matrix));
  };
  ctx.save();
  const back=resolved.layers.find(l=>l.id==='back');if(back)draw(back);
  drawArm('far','upper');drawArm('far','fore');drawArm('near','upper');
  for(const l of resolved.layers)if(l.id!=='back')draw(l);
  if(hasWeapon) {
    ctx.save();options.drawWeapon(ctx,weaponPose);ctx.restore();
    layers.push({id:'weapon',slot:'weapon',itemId:weaponPose.profile?.weaponId||null,
      imageKey:weaponPose.profile?.imageKey||null,part:'held-weapon',sourceRect:weaponPose.sourceRect||null});
  }
  // V127 action geometry supplies independent hand contacts and preflighted
  // props. It never masquerades as a firearm pose or receives firing events.
  if(hasAction && typeof options.drawActionProps==='function') {
    ctx.save();options.drawActionProps(ctx);ctx.restore();
    for(const prop of options.actionPropLayers || [])layers.push(prop);
  }
  drawArm('near','fore');drawArm('far','hand');drawArm('near','hand');
  ctx.restore();
  return {...resolved,drawn:true,fallback:false,reason:null,fallbackReason:null,arms,layers,
    sheetId:`player.echo9-marine.modular-v126.${bodyRig.atlas}`,frame:bodyRig.frame,
    facing:bodyRig.facing,pivot:bodyRig.pivot,unarmed:!hasWeapon,
    effectiveSlots:{...resolved.requestedSlots},hiddenBakedParts:['head','helmet','torso','arms','back']};
}
