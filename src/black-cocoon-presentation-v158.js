import { resolvePlayerBodyRigV125, resolvePlayerArmPoseV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ANCHORS_V126, resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { prepareBiologicalArtV188, drawHumanResinSupportV188 } from './biological-art-v188.js';

/** Dedicated presentation of the requested human resin captivity. This is an
 * original environment animation with an empty raster wall support, not the
 * Romulus specimen or a claim of canonical reproduction. Native V121 owns every
 * interaction, injury, resource, release, checkpoint and extraction. */
export const BLACK_COCOON_PRESENTATION_V158 = Object.freeze({
  schema: 158, operationId: 'black-cocoon', source: 'original-resin-support-with-native-human-binding',
  animationStatus: 'dedicated-procedural-animation', canonExact: false,
  wakeDuration: 1.4, releaseDuration: .9, strandCount: 9,
  remaining: Object.freeze(['extended-survivor-campaign', 'complete-dedicated-mission-art'])
});
const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, finite(n, low)));
const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
const point = (x, y) => ({ x, y });
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** Pure observation: draw frequency, tab visibility and wall clocks cannot
 * advance the presentation. An old freed save has no release timestamp and is
 * already settled; it never replays an apparent second escape. */
export function resolveBlackCocoonPresentationV158(state, anchor, { reducedMotion = false } = {}) {
  if (!state || state.operationId !== 'black-cocoon' || !anchor
    || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.groundY)) return null;
  const elapsed = Math.max(0, finite(state.elapsed));
  const cut = clamp(state.cocoonProgress / 4);
  const freed = state.freed === true;
  const wake = smooth(elapsed / BLACK_COCOON_PRESENTATION_V158.wakeDuration);
  const release = freed ? state.freedAtV158 == null ? 1
    : smooth((elapsed - state.freedAtV158) / BLACK_COCOON_PRESENTATION_V158.releaseDuration) : 0;
  const working = !freed && ['cut', 'force'].includes(state.action?.kind);
  return freeze({ schema: 158, kind: 'human-resin-binding',
    phase: freed ? release < 1 ? 'release' : 'settled'
      : working ? state.action.kind : wake < 1 ? 'awakening' : 'bound',
    elapsed, wake, cut, release, freed, working, forced: working && state.action.kind === 'force',
    reducedMotion: Boolean(reducedMotion),
    anchor: { x: anchor.x, groundY: anchor.groundY },
    // Arms can strain while captivity still owns the physical actor. Nothing
    // here immobilizes a released operator or turns its ordinary body invulnerable.
    actorPose: !freed && !state.boarded,
    visible: !state.boarded,
    artStatus: BLACK_COCOON_PRESENTATION_V158.animationStatus, canonExact: false });
}

function limitedHand(target, shoulder, lengths) {
  const radius = (lengths.upper + lengths.fore) * .88;
  const dx = target.x - shoulder.x, dy = target.y - shoulder.y, distance = Math.hypot(dx, dy);
  return distance > radius ? point(shoulder.x + dx * radius / distance, shoulder.y + dy * radius / distance) : target;
}

/** Render-only native kit geometry. No pretend inventory action, borrowed
 * person, actor transform, weapon change or additional body is installed. */
export function resolveBlackCocoonPlayerRigV158({ actor, presentation, images, appearance = actor?.appearanceV126 } = {}) {
  if (!presentation?.actorPose || !actor?.alive || actor.downed || actor.inVehicle || actor.ventTransit
    || actor.v52HurtClock > 0 || actor.shockClock > 0) return { eligible: false, reason: 'native-body-priority' };
  const observed = { ...actor, vx: 0, vy: 0, grounded: true, climbing: false, crouching: false,
    aiming: false, aimingV124: false, coverV124: null, reloading: false, tacticalReload: null,
    fieldActionV124: null, placeableActionV124: null, meleeClock: 0, toolUseClock: 0,
    interactionClock: 0, v52FireClock: 0, weaponRigMotionV125: { distance: 0, shotAt: -Infinity } };
  const base = resolvePlayerBodyRigV125({ actor: observed, images, surface: 'mission', timeSeconds: 0, reducedMotion: true });
  if (!base.eligible) return base;
  const anatomical = PLAYER_MODULAR_RIG_ANCHORS_V126[base.atlas]?.[base.frame];
  if (!anatomical) return { eligible: false, reason: 'native-body-unavailable' };
  const { elapsed, wake, working, forced, reducedMotion } = presentation;
  const strain = working && !reducedMotion ? Math.sin(elapsed * (forced ? 17 : 8)) : 0;
  const angle = .045 * (1 - wake) + (working ? .025 : 0);
  const cos = Math.cos(angle), sin = Math.sin(angle), waist = anatomical.waist;
  const rotate = p => point(waist.x + (p.x - waist.x) * cos - (p.y - waist.y) * sin,
    waist.y + (p.x - waist.x) * sin + (p.y - waist.y) * cos);
  const transform = p => point(base.matrix.a * p.x + base.matrix.c * p.y + base.matrix.e,
    base.matrix.b * p.x + base.matrix.d * p.y + base.matrix.f);
  const sourceShoulders = Object.fromEntries(Object.entries(base.sourceFrame.sourceShoulders).map(([side, p]) => [side, rotate(p)]));
  const shoulders = Object.fromEntries(Object.entries(sourceShoulders).map(([side, p]) => [side, transform(p)]));
  const bodyRig = { ...base, shoulders, sourceFrame: { ...base.sourceFrame, sourceShoulders },
    modularAnchorsV127: { ...anatomical, neck: rotate(anatomical.neck), headAngle: .17 * (1 - wake) },
    stance: 'resin-bound' };
  const s = base.scale, f = base.facing;
  const local = (side, x, y) => point(shoulders[side].x + f * x * s, shoulders[side].y + y * s);
  const near = local('near', working ? 33 + strain * 3 : 17 + wake * 6, working ? 18 + strain * 2 : 34);
  const far = local('far', working ? 24 - strain * 2 : 9 + wake * 4, working ? 25 - strain : 40);
  const handPose = { unarmed: true, visible: false,
    grip: limitedHand(near, shoulders.near, base.armLengths.near),
    support: limitedHand(far, shoulders.far, base.armLengths.far), handKinds: { near: 'service', far: 'service' } };
  const arms = resolvePlayerArmPoseV125(bodyRig, handPose);
  const modular = resolvePlayerModularRigV126({ bodyRig, images, appearance });
  const validArms = arms && ['near', 'far'].every(side => arms[side].reachError <= .01);
  return { schema: 158, eligible: modular.eligible && Boolean(validArms), ready: modular.ready && Boolean(validArms),
    reason: !validArms ? 'binding-arm-pose-unavailable' : modular.reason,
    bodyRig, handPose, arms, requiredAssets: modular.requiredAssets, firing: false };
}

function layerBounds(layer) {
  const source = layer?.sourceRect, m = layer?.matrix; if (!source || !m) return null;
  const corners = [[source.x, source.y], [source.x + source.width, source.y],
    [source.x, source.y + source.height], [source.x + source.width, source.y + source.height]]
    .map(([x, y]) => point(m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f));
  const x = Math.min(...corners.map(p => p.x)), y = Math.min(...corners.map(p => p.y));
  return { x, y, width: Math.max(...corners.map(p => p.x)) - x, height: Math.max(...corners.map(p => p.y)) - y };
}

/** The support belongs to the wall, not the player's changing pose. Measure a
 * neutral, upright version of the same native rig at the original anchor.
 * This is stable across wake/struggle, release, walking, crouching and old saves;
 * it never changes the real actor, its costume, injury priority or collision. */
export function resolveBlackCocoonResinLayoutV158({ actor, presentation, images } = {}) {
  if (!actor || !presentation?.visible) return null;
  const { x, groundY } = presentation.anchor;
  const observed = { ...actor, x: x - actor.w / 2, y: groundY - actor.h,
    alive: true, downed: false, inVehicle: false, ventTransit: null, vehicleAccessPhase: null,
    v52HurtClock: 0, shockClock: 0, climbing: false, vx: 0, vy: 0, grounded: true, crouching: false };
  const reference = { ...presentation, actorPose: true, wake: 1, working: false, forced: false, elapsed: 0, reducedMotion: true };
  const native = resolveBlackCocoonPlayerRigV158({ actor: observed, presentation: reference, images });
  const modular = native.bodyRig && resolvePlayerModularRigV126({ bodyRig: native.bodyRig, appearance: observed.appearanceV126, images });
  const head = layerBounds(modular?.layers?.find(layer => layer.id === 'bare-head'));
  const crown = modular?.layers?.filter(layer => layer.slot === 'head' || layer.slot === 'helmet')
    .map(layerBounds).filter(Boolean) || [];
  const headTop = crown.length ? Math.min(...crown.map(bound => bound.y)) : groundY - Math.max(48, finite(actor.h, 92));
  const height = clamp(groundY - headTop, 48, 180), width = height * .62, detailScale = height / 146;
  const shoulders = native.bodyRig?.shoulders;
  const shoulderY = shoulders ? Math.max(shoulders.near.y, shoulders.far.y) : groundY - height * .68;
  const headBottom = head ? head.y + head.height : groundY - height * .8;
  return freeze({ height, width, detailScale,
    // The shallow up-curve and its round stroke must also clear the face.
    bandTop: Math.max(shoulderY + 5 * detailScale, headBottom + 11 * detailScale),
    bandBottom: groundY - height * .1, headBounds: head, shoulderY,
    reference: 'native-standing-modular-anchors' });
}

/** Fixed support geometry. The right/left half of every cut strap retracts to
 * its wall attachment; the final fragments settle at that same wall/floor. */
export function blackCocoonResinGeometryV158(presentation, { height = 146, width = 86, bandTop = null, bandBottom = null, detailScale = height / 146 } = {}) {
  if (!presentation?.visible) return null;
  const h = clamp(height, 48, 240), w = clamp(width, 28, 150), k = clamp(detailScale, .3, 1.65);
  const { x, groundY } = presentation.anchor, top = groundY - h;
  const clearance = Math.max(4, 3.5 * k + .5);
  const upper = clamp(bandTop ?? top + h * .15, top, groundY - clearance - 4);
  const lower = clamp(bandBottom ?? top + h * .84, upper, groundY - clearance);
  const sway = !presentation.reducedMotion && !presentation.freed ? Math.sin(presentation.elapsed * 2.2) * .6 * k : 0;
  const release = presentation.release;
  const bands = Array.from({ length: BLACK_COCOON_PRESENTATION_V158.strandCount }, (_, index) => {
    const fraction = index / (BLACK_COCOON_PRESENTATION_V158.strandCount - 1);
    const y = upper + fraction * (lower - upper);
    const span = w * (.38 + .1 * Math.sin(fraction * Math.PI));
    const severed = smooth((presentation.cut - (.08 + index * .09)) / .12);
    const gap = (8 + severed * 23) * (1 + release * .6) * k;
    const drop = release * (groundY - y - clearance);
    return { index, y: y + drop, left: x - span, right: x + span,
      leftTip: x + 2 * k - (gap + 2 * k) * severed, rightTip: x - 2 * k + (gap + 2 * k) * severed, severed, drop,
      sag: severed * 10 * k * (1 - release) * (index % 2 ? 1 : -1), sway };
  });
  return { anchor: { x, groundY }, x, top, groundY, width: w, height: h, detailScale: k, clearance, bandTop: upper, bandBottom: lower, bands };
}

export function drawBlackCocoonResinV158(ctx, presentation, { layer = 'front', images = null, ...dimensions } = {}) {
  const geometry = blackCocoonResinGeometryV158(presentation, dimensions);
  if (!geometry || !ctx?.save) return null;
  const { x, top, groundY, width: w, height: h, detailScale: k, clearance, bands } = geometry;
  if (layer === 'back' && drawHumanResinSupportV188(ctx, images, geometry)) return geometry;
  // Every point in a cubic's convex hull, including its control points, stays
  // above the support. Clearance includes the scaled round stroke and AA.
  const supportedY = y => Math.min(groundY - clearance, y);
  ctx.save(); ctx.lineCap = 'round';
  if (layer === 'back') {
    ctx.fillStyle = '#171512f0'; ctx.strokeStyle = '#3b3630'; ctx.lineWidth = 7 * k;
    ctx.beginPath(); ctx.moveTo(x - w * .52, groundY - clearance);
    ctx.bezierCurveTo(x - w * .68, top + h * .5, x - w * .3, top - 9, x, top - 7);
    ctx.bezierCurveTo(x + w * .49, top - 8, x + w * .64, top + h * .6, x + w * .51, groundY - clearance);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const offset = (i - 3) * 7 * k;
      ctx.strokeStyle = i % 2 ? '#645b50' : '#2d2823'; ctx.lineWidth = 2 * k;
      ctx.beginPath(); ctx.moveTo(x + offset, groundY - clearance);
      ctx.bezierCurveTo(x - w * .58 + offset, top + h * .6, x + w * .36 + offset, top + h * .13, x + offset * .5, top - 3); ctx.stroke();
    }
  } else {
    for (const band of bands) {
      const y = band.y, bend = band.sag + band.sway;
      for (const [color, thickness] of [['#211c17ee', 7], ['#655c50', 3.2], ['#a7a8a099', .9]]) {
        ctx.strokeStyle = color; ctx.lineWidth = thickness * k;
        ctx.beginPath(); ctx.moveTo(band.left, supportedY(y));
        ctx.bezierCurveTo(band.left + 9 * k, supportedY(y - 6 * k), x - 12 * k, supportedY(y + bend), band.leftTip, supportedY(y + bend)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(band.right, supportedY(y + 3 * k * (1 - presentation.release)));
        ctx.bezierCurveTo(band.right - 10 * k, supportedY(y - 6 * k), x + 12 * k, supportedY(y - bend), band.rightTip, supportedY(y - bend)); ctx.stroke();
      }
      if (band.severed > 0 && band.severed < 1) {
        ctx.strokeStyle = '#c2bbaaaa'; ctx.lineWidth = .8 * k;
        ctx.beginPath(); ctx.moveTo(band.leftTip, supportedY(y + bend)); ctx.lineTo(band.rightTip, supportedY(y - bend)); ctx.stroke();
      }
    }
    ctx.fillStyle = '#2e2822e8';
    ctx.beginPath(); ctx.ellipse(x, groundY - clearance, w * .57, 2.5 * k, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore(); return geometry;
}

export function withBlackCocoonPresentationV158(Base) {
  if (Base.blackCocoonPresentationV158 === true) return Base;
  return class BlackCocoonPresentationV158 extends Base {
    static blackCocoonPresentationV158 = true;
    start(options = {}) {
      const result = super.start(options);
      if (this.hasBlackCocoonPresentationV158()) prepareBiologicalArtV188(this.images, 'black-cocoon');
      return result;
    }
    hasBlackCocoonPresentationV158() { return Boolean(this.isBlackCocoonV121?.() && this.blackCocoonPropsV121?.cocoon); }
    blackCocoonPresentationV158() {
      return this.hasBlackCocoonPresentationV158() ? resolveBlackCocoonPresentationV158(this.blackCocoonV121,
        this.blackCocoonPropsV121.cocoon, { reducedMotion: this.accessibilityRuntime?.reducedMotion || this.reducedMotion }) : null;
    }
    heldWeaponDescriptorV125(actor = this.player) {
      // The sealed bag already gates firing/reload in V121. Preserve the actual
      // selected weapon and finite resources, and let V126 draw its native empty
      // hands until that same physical interaction restores equipment access.
      if (actor === this.player && this.isBlackCocoonV121?.() && !this.blackCocoonV121.equipmentRecovered) return null;
      return super.heldWeaponDescriptorV125(actor);
    }
    drawActor(ctx, actor) {
      const presentation = actor === this.player ? this.blackCocoonPresentationV158() : null;
      if (!presentation?.visible) return super.drawActor(ctx, actor);
      const dimensions = { ...resolveBlackCocoonResinLayoutV158({ actor, presentation, images: this.images }), images: this.images };
      drawBlackCocoonResinV158(ctx, presentation, { ...dimensions, layer: 'back' });
      const result = super.drawActor(ctx, actor);
      drawBlackCocoonResinV158(ctx, presentation, { ...dimensions, layer: 'front' });
      return result;
    }
    drawPlayerWeaponRigV125(ctx, actor, options) {
      const presentation = actor === this.player ? this.blackCocoonPresentationV158() : null;
      if (presentation?.actorPose) {
        this.preparePlayerWeaponAssetsV125?.();
        const rig = resolveBlackCocoonPlayerRigV158({ actor, presentation, images: this.images });
        if (rig.eligible && rig.ready) {
          const rendered = drawPlayerModularRigV126(ctx, { bodyRig: rig.bodyRig, handPose: rig.handPose,
            appearance: actor.appearanceV126, images: this.images });
          if (rendered.drawn) {
            actor.heldWeaponVisualV125 = null; actor.heldWeaponVisualV95 = null;
            actor.blackCocoonVisualV158 = { schema: 158, phase: presentation.phase, cut: presentation.cut,
              anchor: presentation.anchor, nativeBody: true, firing: false, effectiveSlots: rendered.effectiveSlots };
            return rendered;
          }
        }
      }
      if (actor) actor.blackCocoonVisualV158 = null;
      return super.drawPlayerWeaponRigV125(ctx, actor, options);
    }
    getSnapshot() {
      const snapshot = super.getSnapshot();
      return this.hasBlackCocoonPresentationV158() ? { ...snapshot, blackCocoonPresentationV158: this.blackCocoonPresentationV158() } : snapshot;
    }
  };
}
