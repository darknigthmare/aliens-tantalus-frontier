import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125, drawPlayerBodyRigV125 } from './player-body-rig-v125.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125, drawHeldWeaponV125, translateHeldWeaponPoseV125 } from './held-weapon-renderer-v125.js';
import { weaponImageReadyV125 } from './weapon-image-cache-v125.js';
import { getUserEquipmentV95 } from './user-equipment-v95.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import { constrainPlayerMuzzleV124 } from './player-control-v124.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const point = value => value ? { x: value.x, y: value.y } : null;

/** One weapon/body transform for the actual operator, guide, accepted shot,
 * receiver port and brief muzzle light. The solver is independent of drawing;
 * simulation owns travelled distance, weapon changes and accepted-shot recoil.
 */
export function withPlayerWeaponRigV125(Base) {
  return class PlayerWeaponRuntimeV125 extends Base {
    playerWeaponActorsV125() {
      return [this.player, this.coopEnabled ? this.coop : null].filter(Boolean);
    }

    heldWeaponDescriptorV125(actor = this.player) {
      if (!actor || actor !== this.player && actor !== this.coop || actor.squadMember) return null;
      const custom = getUserEquipmentV95(actor.userEquipmentV95?.weaponId);
      if (custom?.kind === 'weapon') return custom;
      if (actor.weaponMode === 'unarmed' || actor.crewV85?.personalEquipment && !actor.crewV85.weaponRuntime) return null;
      return this.weaponDescriptorV124(actor);
    }

    playerWeaponSurfaceV125(surface) {
      return surface || (this.bioforgeLevelV80 ? 'bioforge' : 'mission');
    }

    preparePlayerWeaponAssetsV125() {
      const assets = [];
      for (const actor of this.playerWeaponActorsV125()) {
        const body = resolvePlayerBodyRigV125({ actor, surface: this.playerWeaponSurfaceV125(),
          timeSeconds: finite(this.animationTime), neuroActive: Boolean(this.neuro?.active && actor === this.player) });
        const profile = resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor));
        if (body.eligible && profile?.portable) assets.push(...PLAYER_BODY_RIG_ASSETS_V125, profile);
      }
      if (!this.weaponPickup?.taken && this.weaponVisual?.path) assets.push(this.weaponVisual);
      return this.weaponImageCacheV125?.retain(assets) || null;
    }

    resetPlayerWeaponRigV125() {
      this.playerWeaponLightsV125 = new WeakMap();
      for (const actor of [this.player, this.coop].filter(Boolean)) {
        delete actor.weaponRigMotionV125;
        actor.heldWeaponVisualV125 = null;
      }
    }

    resetSceneWeaponEffectsV124() {
      const result = super.resetSceneWeaponEffectsV124();
      this.resetPlayerWeaponRigV125();
      return result;
    }

    advancePlayerWeaponActorV125(actor) {
      if (!actor) return null;
      const profile = resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor));
      const weaponId = profile?.weaponId || null;
      const now = finite(this.animationTime), x = finite(actor.x), y = finite(actor.y);
      let motion = actor.weaponRigMotionV125;
      const changed = motion && motion.weaponId !== weaponId;
      if (!motion || changed || now < motion.time || Math.hypot(x - motion.x, y - motion.y) > 160) {
        if (changed) {
          cancelTacticalReloadV77(actor, 'weapon-changed');
          actor.actionClock = Math.min(finite(actor.actionClock), .22);
        }
        motion = { schema: 125, weaponId, distance: 0, shotAt: -Infinity, shotSerial: finite(actor.shots), time: now, x, y };
        actor.weaponRigMotionV125 = motion;
      } else {
        const travelled = Math.abs(x - motion.x);
        // A lift can carry an idle operator. Only genuine ground locomotion
        // advances the legs, including during a real reload transaction.
        if (actor.grounded && !actor.climbing && !actor.ventTransit && !actor.inVehicle
          && Math.abs(finite(actor.vx)) > (actor.crouching ? 8 : 12)) motion.distance += travelled;
        Object.assign(motion, { time: now, x, y });
      }
      return motion;
    }

    beginPlayerWeaponShotV125(actor) {
      if (actor !== this.player && actor !== this.coop) return;
      this.ensureSceneWeaponEffectsV124();
      const motion = this.advancePlayerWeaponActorV125(actor);
      if (motion) { motion.shotAt = finite(this.animationTime); motion.shotSerial = finite(actor.shots); }
    }

    start(options = {}) {
      const result = super.start(options);
      for (const actor of this.playerWeaponActorsV125()) this.advancePlayerWeaponActorV125(actor);
      this.preparePlayerWeaponAssetsV125();
      return result;
    }

    stop(...args) {
      const result = super.stop(...args);
      this.weaponImageCacheV125?.clear();
      this.resetPlayerWeaponRigV125();
      return result;
    }

    interact(actor = this.player) {
      const result = super.interact(actor);
      if (result) {
        this.advancePlayerWeaponActorV125(actor);
        this.preparePlayerWeaponAssetsV125();
      }
      return result;
    }

    resolvePlayerWeaponRigV125(actor = this.player, { surface, sample = null } = {}) {
      if (!actor || actor !== this.player && actor !== this.coop || actor === this.coop && !this.coopEnabled) return null;
      const descriptor = this.heldWeaponDescriptorV125(actor);
      const profile = resolveHeldWeaponProfileV125(descriptor);
      if (!profile?.portable) return null;
      const options = { actor, sample, surface: this.playerWeaponSurfaceV125(surface), images: this.images,
        timeSeconds: finite(this.animationTime), reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion || this.reducedMotion),
        neuroActive: Boolean(this.neuro?.active && actor === this.player) };
      const eligibility = resolvePlayerBodyRigV125(options);
      if (!eligibility.eligible) return null;
      this.preparePlayerWeaponAssetsV125();
      const image = this.ensureWeaponImageV125(profile);
      const bodyRig = resolvePlayerBodyRigV125(options);
      if (!bodyRig.ready || !weaponImageReadyV125(image, profile)) return null;
      return { ...bodyRig, bodyRig, descriptor, profile, weaponImage: image };
    }

    resolvePlayerWeaponPoseV125(actor = this.player, aim = actor?.combatAimV83, options = {}) {
      const rig = this.resolvePlayerWeaponRigV125(actor, options);
      if (!rig) return null;
      let pose = getHeldWeaponPoseV125({ actor, descriptor: rig.descriptor, aim, bodyRig: rig.bodyRig,
        surface: rig.surface, timeSeconds: finite(this.animationTime),
        reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion || this.reducedMotion) });
      if (!pose) return null;
      const shoulder = rig.shoulders.near;
      const muzzle = { ...pose.muzzle, pivotX: shoulder.x, pivotY: shoulder.y };
      const direction = { x: pose.aimX, y: pose.aimY };
      const bounded = constrainPlayerMuzzleV124(this, actor, direction, muzzle);
      if (bounded.obstructedV124) pose = translateHeldWeaponPoseV125(pose, bounded.x - muzzle.x, bounded.y - muzzle.y);
      // Retract the whole receiver and both hand targets, not just the round.
      // Keep the collision ray rooted on the actual body-side shoulder.
      pose.muzzle = { ...pose.muzzle, pivotX: shoulder.x, pivotY: shoulder.y,
        barrelLength: Math.hypot(pose.muzzle.x - shoulder.x, pose.muzzle.y - shoulder.y),
        ...(bounded.obstructedV124 ? { obstructedV124: true } : {}) };
      return { ...pose, bodyRig: rig.bodyRig, weaponImage: rig.weaponImage, surface: rig.surface };
    }

    drawPlayerWeaponRigV125(ctx, actor = this.player, options = {}) {
      const pose = this.resolvePlayerWeaponPoseV125(actor, actor?.combatAimV83, options);
      if (!pose) { if (actor) actor.heldWeaponVisualV125 = null; return null; }
      const render = drawPlayerBodyRigV125(ctx, { actor, ...options, images: this.images,
        bodyRig: pose.bodyRig, weaponPose: pose, drawWeapon: () => drawHeldWeaponV125(ctx, pose.weaponImage, pose) });
      if (!render.drawn) { actor.heldWeaponVisualV125 = null; return null; }
      actor.heldWeaponVisualV125 = { schema: 125, weaponId: pose.profile.weaponId, path: pose.path,
        surface: pose.surface, bodySheetId: render.sheetId, bodyFrame: render.frame,
        grip: point(pose.grip), support: point(pose.support), muzzle: { ...pose.muzzle },
        reloadPort: point(pose.reloadPort), ejectionPort: point(pose.ejectionPort), matrix: { ...pose.matrix },
        nearHand: point(render.arms.near.hand), farHand: point(render.arms.far.hand),
        nearReachError: render.arms.near.reachError, farReachError: render.arms.far.reachError,
        nearShoulderShift: point(render.arms.near.shoulderShift), nearShiftLimited: render.arms.near.shiftLimited,
        reloadPhase: pose.reloadPhase, reloadProgress: pose.reloadProgress, recoil: pose.recoil,
        visualStatus: render.visualStatus };
      return render;
    }

    emitCommittedWeaponShotV124(actor, bullet, descriptor, options) {
      const previous = new Set(this.weaponEffectsV124?.lights || []);
      const accepted = super.emitCommittedWeaponShotV124(actor, bullet, descriptor, options);
      if (!accepted || !this.resolvePlayerWeaponPoseV125(actor, actor?.combatAimV83)) return accepted;
      this.playerWeaponLightsV125 ||= new WeakMap();
      const weaponId = resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor))?.weaponId;
      for (const light of this.weaponEffectsV124.lights) if (!previous.has(light)) {
        light.sourceX = light.x; light.sourceY = light.y;
        this.playerWeaponLightsV125.set(light, { actor, weaponId });
      }
      return accepted;
    }

    advanceSceneWeaponEffectsV124(delta) {
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return;
      this.ensureSceneWeaponEffectsV124();
      for (const actor of this.playerWeaponActorsV125()) this.advancePlayerWeaponActorV125(actor);
      this.preparePlayerWeaponAssetsV125();
      super.advanceSceneWeaponEffectsV124(delta);
      for (const light of this.weaponEffectsV124?.lights || []) {
        const binding = this.playerWeaponLightsV125?.get(light);
        if (!binding) continue;
        const pose = this.resolvePlayerWeaponPoseV125(binding.actor, binding.actor.combatAimV83);
        if (!pose || pose.profile.weaponId !== binding.weaponId) { this.playerWeaponLightsV125.delete(light); continue; }
        light.x = pose.muzzle.x; light.y = pose.muzzle.y;
        light.aimX = pose.aimX; light.aimY = pose.aimY;
      }
    }

    playerWeaponRigSnapshotV125() {
      return { schema: 125, images: this.weaponImageCacheV125?.snapshot() || null,
        operators: this.playerWeaponActorsV125().map(actor => ({ id: actor.operatorId || actor.crewId || (actor === this.player ? 'player' : 'coop'),
          weaponId: resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor))?.weaponId || null,
          visual: actor.heldWeaponVisualV125 || null })) };
    }
  };
}
