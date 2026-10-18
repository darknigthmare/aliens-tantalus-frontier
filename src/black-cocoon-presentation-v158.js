import { resolvePlayerBodyRigV125, resolvePlayerArmPoseV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ANCHORS_V126, resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from './player-modular-rig-v126.js';

/** Dedicated presentation of the requested human resin captivity. This is an
 * original procedural environment animation, not the Romulus specimen, a new
 * bitmap corpus, or a claim of canonical reproduction. Native V121 owns every
 * interaction, injury, resource, release, checkpoint and extraction. */
export const BLACK_COCOON_PRESENTATION_V158 = Object.freeze({
  schema: 158, operationId: 'black-cocoon', source: 'original-procedural-human-resin-binding',
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

/** Fixed support geometry. The right/left half of every cut strap retracts to
 * its wall attachment; the final fragments settle at that same wall/floor. */
export function blackCocoonResinGeometryV158(presentation, { height = 146, width = 86 } = {}) {
  if (!presentation?.visible) return null;
  const h = clamp(height, 80, 240), w = clamp(width, 56, 150);
  const { x, groundY } = presentation.anchor, top = groundY - h;
  const sway = !presentation.reducedMotion && !presentation.freed ? Math.sin(presentation.elapsed * 2.2) * .6 : 0;
  const release = presentation.release;
  const bands = Array.from({ length: BLACK_COCOON_PRESENTATION_V158.strandCount }, (_, index) => {
    const fraction = index / (BLACK_COCOON_PRESENTATION_V158.strandCount - 1);
    const y = top + h * (.15 + fraction * .69);
    const span = w * (.38 + .1 * Math.sin(fraction * Math.PI));
    const severed = smooth((presentation.cut - (.08 + index * .09)) / .12);
    const gap = (8 + severed * 23) * (1 + release * .6);
    const drop = release * (groundY - y - 4);
    return { index, y: y + drop, left: x - span, right: x + span,
      leftTip: x + 2 - (gap + 2) * severed, rightTip: x - 2 + (gap + 2) * severed, severed, drop,
      sag: severed * 10 * (1 - release) * (index % 2 ? 1 : -1), sway };
  });
  return { anchor: { x, groundY }, x, top, groundY, width: w, height: h, bands };
}

export function drawBlackCocoonResinV158(ctx, presentation, { layer = 'front', height, width } = {}) {
  const geometry = blackCocoonResinGeometryV158(presentation, { height, width });
  if (!geometry || !ctx?.save) return null;
  const { x, top, groundY, width: w, height: h, bands } = geometry;
  // Every point in a cubic's convex hull, including its control points, stays
  // above the support. Four pixels include the widest 7px round stroke and AA.
  const supportedY = y => Math.min(groundY - 4, y);
  ctx.save(); ctx.lineCap = 'round';
  if (layer === 'back') {
    ctx.fillStyle = '#131d1af0'; ctx.strokeStyle = '#354438'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x - w * .52, groundY - 4);
    ctx.bezierCurveTo(x - w * .68, top + h * .5, x - w * .3, top - 9, x, top - 7);
    ctx.bezierCurveTo(x + w * .49, top - 8, x + w * .64, top + h * .6, x + w * .51, groundY - 4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const offset = (i - 3) * 7;
      ctx.strokeStyle = i % 2 ? '#465345' : '#28392f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + offset, groundY - 4);
      ctx.bezierCurveTo(x - w * .58 + offset, top + h * .6, x + w * .36 + offset, top + h * .13, x + offset * .5, top - 3); ctx.stroke();
    }
  } else {
    for (const band of bands) {
      const y = band.y, bend = band.sag + band.sway;
      for (const [color, thickness] of [['#1b281eea', 7], ['#58634a', 3.2], ['#a6ac7b99', .9]]) {
        ctx.strokeStyle = color; ctx.lineWidth = thickness;
        ctx.beginPath(); ctx.moveTo(band.left, supportedY(y));
        ctx.bezierCurveTo(band.left + 9, supportedY(y - 6), x - 12, supportedY(y + bend), band.leftTip, supportedY(y + bend)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(band.right, supportedY(y + 3 * (1 - presentation.release)));
        ctx.bezierCurveTo(band.right - 10, supportedY(y - 6), x + 12, supportedY(y - bend), band.rightTip, supportedY(y - bend)); ctx.stroke();
      }
      if (band.severed > 0 && band.severed < 1) {
        ctx.strokeStyle = '#bec48eaa'; ctx.lineWidth = .8;
        ctx.beginPath(); ctx.moveTo(band.leftTip, supportedY(y + bend)); ctx.lineTo(band.rightTip, supportedY(y - bend)); ctx.stroke();
      }
    }
    ctx.fillStyle = '#283a2ce8';
    ctx.beginPath(); ctx.ellipse(x, groundY - 4, w * .57, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore(); return geometry;
}

export function withBlackCocoonPresentationV158(Base) {
  if (Base.blackCocoonPresentationV158 === true) return Base;
  return class BlackCocoonPresentationV158 extends Base {
    static blackCocoonPresentationV158 = true;
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
      const dimensions = { height: 146, width: 86 };
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
