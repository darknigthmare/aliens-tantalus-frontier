import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125, drawPlayerBodyRigV125 } from './player-body-rig-v125.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125, drawHeldWeaponV125, translateHeldWeaponPoseV125 } from './held-weapon-renderer-v125.js';
import { weaponImageReadyV125 } from './weapon-image-cache-v125.js';
import { getUserEquipmentV95 } from './user-equipment-v95.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import { constrainPlayerMuzzleV124, resolvePlayerCoverV124,
  resolvePlayerProjectileFootprintV124 } from './player-control-v124.js';
import { firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { getPlayerArmJointAnglesV160 } from './player-arm-constraints-v160.js';
import { resolveCombatAimV83, readKeyboardCombatAimV83, COMBAT_AIM_KEY_BINDINGS_V83 } from './combat-aim-v83.js';
import { previewCombatPointerAimV160 } from './mission-input-v77.js';

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

    collectPlayerWeaponAssetsV125() {
      const assets = [];
      for (const actor of this.playerWeaponActorsV125()) {
        const body = resolvePlayerBodyRigV125({ actor, surface: this.playerWeaponSurfaceV125(),
          timeSeconds: finite(this.animationTime), neuroActive: Boolean(this.neuro?.active && actor === this.player) });
        const profile = resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor));
        if (body.eligible && profile?.portable) assets.push(...PLAYER_BODY_RIG_ASSETS_V125, profile);
      }
      if (!this.weaponPickup?.taken && this.weaponVisual?.path) assets.push(this.weaponVisual);
      return assets;
    }

    preparePlayerWeaponAssetsV125() {
      return this.weaponImageCacheV125?.retain(this.collectPlayerWeaponAssetsV125()) || null;
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
      this.releasePlayerWeaponPresentationV125();
      return result;
    }

    draw(...args) {
      // A queued redraw cannot reacquire operator or pickup images after stop.
      // Bioforge owns its separate static preparation renderer and lifecycle.
      if (!this.running) return;
      return super.draw(...args);
    }

    releasePlayerWeaponPresentationV125() {
      this.weaponImageCacheV125?.clear();
      this.resetPlayerWeaponRigV125();
    }

    interact(actor = this.player) {
      const result = super.interact(actor);
      if (result) {
        this.advancePlayerWeaponActorV125(actor);
        this.preparePlayerWeaponAssetsV125();
      }
      return result;
    }

    resolvePlayerWeaponRigV125(actor = this.player, { surface, sample = null, requireReady = true,
      shotPreviewV160 = false, aimPreviewV160 = null } = {}) {
      if (!actor || actor !== this.player && actor !== this.coop || actor === this.coop && !this.coopEnabled) return null;
      const descriptor = this.heldWeaponDescriptorV125(actor);
      const profile = resolveHeldWeaponProfileV125(descriptor);
      if (!profile?.portable) return null;
      const admittedActor = shotPreviewV160 ? this.previewPlayerWeaponActorV160?.(actor) || actor : actor;
      const projectedInput = shotPreviewV160 ? this.previewPlayerWeaponInputV160(actor, aimPreviewV160) : null;
      const presentationActor = shotPreviewV160 ? { ...admittedActor, weaponRigMotionV125: { ...admittedActor.weaponRigMotionV125,
        shotAt: finite(this.animationTime), time: finite(this.animationTime), weaponId: profile.weaponId },
        facing: projectedInput.aim.facing, aimingV124: projectedInput.aiming,
        combatAimV83: projectedInput.aim } : actor;
      if (shotPreviewV160 && !this.weaponActionProfileV131?.(actor)) {
        presentationActor.coverV124 = resolvePlayerCoverV124(presentationActor, this.findCover(actor),
          projectedInput.aim, { fire: true,
            busy: Boolean(this.isPlaceableBusyV86?.(actor) || this.isFieldActionBusyV124?.(actor)),
            projectileFootprint: resolvePlayerProjectileFootprintV124(this, actor) });
        presentationActor.inCover = Boolean(presentationActor.coverV124 && !presentationActor.coverV124.peeking);
      }
      const options = { actor: presentationActor, sample, surface: this.playerWeaponSurfaceV125(surface), images: this.images,
        timeSeconds: finite(this.animationTime), reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion || this.reducedMotion),
        neuroActive: Boolean(this.neuro?.active && actor === this.player) };
      const eligibility = resolvePlayerBodyRigV125(options);
      if (!eligibility.eligible) return null;
      if (requireReady) this.preparePlayerWeaponAssetsV125();
      const image = requireReady ? this.ensureWeaponImageV125(profile) : this.images?.get?.(profile.imageKey) || null;
      const rawBodyRig = eligibility;
      // The same final pelvis/thorax registration must own the shot before a
      // draw. Applying the appearance composition only in the renderer left
      // accepted rounds and hand targets on the old, unshifted shoulders.
      const bodyRig = this.decoratePlayerAppearanceBodyV129?.(presentationActor, rawBodyRig) || rawBodyRig;
      // Image readiness gates drawing only. The admitted body's measured
      // geometry still owns a shot while its PNGs are loading or unavailable.
      if (requireReady && (!bodyRig.ready || !weaponImageReadyV125(image, profile))) return null;
      return { ...bodyRig, bodyRig, descriptor, profile, weaponImage: image, presentationActorV160: presentationActor };
    }

    resolvePlayerWeaponPoseV125(actor = this.player, aim = actor?.combatAimV83, options = {}) {
      const rig = this.resolvePlayerWeaponRigV125(actor, { ...options, aimPreviewV160: aim });
      if (!rig) return null;
      const poseOptions = { actor: rig.presentationActorV160, descriptor: rig.descriptor, aim, bodyRig: rig.bodyRig,
        surface: rig.surface, timeSeconds: finite(this.animationTime),
        reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion || this.reducedMotion) };
      let pose = getHeldWeaponPoseV125(poseOptions);
      if (!pose) return null;
      const shoulder = rig.shoulders.near;
      const direction = { x: pose.aimX, y: pose.aimY };
      const world = { walls: [...(this.walls || []), ...(this.covers || [])],
        doors: this.closedDoorColliders?.() || this.doors || [], platforms: this.platforms || [] };
      // The visual weapon uses actual points; projectile AABB inflation is a
      // separate collision concern and must not teleport its rigid receiver.
      const origin = { x: shoulder.x, y: shoulder.y, w: 0, h: 0 }, planes = [], faces = [];
      for (let attempt = 0; attempt < 4; attempt++) {
        const muzzle = { ...pose.muzzle, pivotX: shoulder.x, pivotY: shoulder.y };
        const bounded = constrainPlayerMuzzleV124(this, actor, direction, muzzle);
        const hit = [muzzle, ...pose.visibleBounds.corners].map(corner => firstProjectileObstacleV83(origin,
          { x: corner.x - shoulder.x, y: corner.y - shoulder.y }, world)).filter(Boolean)
          .sort((first, second) => first.t - second.t)[0];
        if (!hit) break;
        const normal = { x: finite(hit?.normalX), y: finite(hit?.normalY) };
        if (Math.hypot(normal.x, normal.y) < .5) {
          // An origin already inside a collider has no admitted free-side
          // plane. Retain the safe projectile clamp and expose the bad reach.
          pose = translateHeldWeaponPoseV125(pose, bounded.x - muzzle.x, bounded.y - muzzle.y);
          break;
        }
        const face = { normal, offset: normal.x > 0 ? hit.target.x + hit.target.w
          : normal.x < 0 ? -hit.target.x : normal.y > 0 ? hit.target.y + hit.target.h : -hit.target.y };
        faces.push(face);
        const offset = face.offset + .05 - Math.min(...pose.visibleBounds.corners.map(corner =>
          normal.x * (corner.x - pose.grip.x) + normal.y * (corner.y - pose.grip.y)));
        const previous = planes.find(plane => plane.normal.x === normal.x && plane.normal.y === normal.y);
        if (previous) previous.offset = Math.max(previous.offset, offset);
        else planes.push({ normal, offset });
        const candidate = getHeldWeaponPoseV125({ ...poseOptions, obstaclePlanesV160: planes });
        if (!candidate?.armReachV160?.feasible) {
          // Impossible imported/contact geometry stays explicit; do not put a
          // round behind the wall or lengthen a bone to conceal the mismatch.
          pose = translateHeldWeaponPoseV125(pose, bounded.x - muzzle.x, bounded.y - muzzle.y);
          break;
        }
        // Recompute the service hand from its body pouch after the rigid gun
        // moves. Translating a previously interpolated hand moved the pouch
        // along with the receiver and could fold the elbow into the shoulder.
        pose = candidate;
      }
      const finalMuzzle = { ...pose.muzzle, pivotX: shoulder.x, pivotY: shoulder.y };
      const finalBound = constrainPlayerMuzzleV124(this, actor, direction, finalMuzzle);
      if (finalBound.obstructedV124 && !pose.armReachV160.feasible) {
        pose = translateHeldWeaponPoseV125(pose, finalBound.x - finalMuzzle.x, finalBound.y - finalMuzzle.y);
      }
      if (faces.length) {
        // A rigid rifle cannot always retain its firing direction between a
        // shoulder and a close wall. Withdraw it toward the floor while both
        // hands remain attached; no round may be committed from this pose.
        const facing = rig.bodyRig.facing, requested = Math.atan2(poseOptions.aim?.y || 0,
          (poseOptions.aim?.x ?? facing) * facing);
        const targetAngle = faces.some(face => face.normal.y < 0) && requested > 0 ? 0 : Math.PI / 2;
        const towardFloor = targetAngle - requested;
        const freePose = getHeldWeaponPoseV125(poseOptions);
        const withdrawalDemand = Math.max(...faces.map(face => {
          const extent = Math.max(.001, -Math.min(...freePose.visibleBounds.corners.map(corner =>
            face.normal.x * (corner.x - shoulder.x) + face.normal.y * (corner.y - shoulder.y))));
          const clearance = face.normal.x * shoulder.x + face.normal.y * shoulder.y - face.offset;
          const t = Math.max(0, Math.min(1, (extent * .85 - clearance) / Math.max(1, extent * .4)));
          return t * t * (3 - 2 * t);
        }));
        const candidateAt = amount => {
          const angle = requested + towardFloor * amount;
          const withdrawnOptions = { ...poseOptions, aim: { x: facing * Math.cos(angle), y: Math.sin(angle), facing } };
          const base = getHeldWeaponPoseV125(withdrawnOptions);
          const safePlanes = faces.map(face => ({ normal: face.normal, offset: face.offset + .05
            - Math.min(...base.visibleBounds.corners.map(corner => face.normal.x * (corner.x - base.grip.x)
              + face.normal.y * (corner.y - base.grip.y))) }));
          // Keep the withdrawn trigger below the shoulder, rather than in the
          // disconnected over-the-head pocket of the same two-link arm.
          safePlanes.push({ normal: { x: 0, y: 1 }, offset: shoulder.y });
          const candidate = getHeldWeaponPoseV125({ ...withdrawnOptions, obstaclePlanesV160: safePlanes });
          if (!candidate?.armReachV160?.feasible) return null;
          return [candidate.muzzle, ...candidate.visibleBounds.corners].some(corner => firstProjectileObstacleV83(origin,
            { x: corner.x - shoulder.x, y: corner.y - shoulder.y }, world)) ? null : candidate;
        };
        const needsWithdrawal = withdrawalDemand > 0 || !pose.armReachV160.feasible;
        let low = withdrawalDemand, high = withdrawalDemand, withdrawn = needsWithdrawal ? candidateAt(withdrawalDemand) : null;
        if (needsWithdrawal && !withdrawn) for (let step = 1; step <= 16; step++) {
          high = withdrawalDemand + (1 - withdrawalDemand) * step / 16;
          withdrawn = candidateAt(high);
          if (withdrawn) break;
          low = high;
        }
        if (withdrawn && high > withdrawalDemand) {
          for (let iteration = 0; iteration < 12; iteration++) {
            const middle = (low + high) / 2, candidate = candidateAt(middle);
            if (candidate) { high = middle; withdrawn = candidate; } else low = middle;
          }
        }
        if (withdrawn) {
          pose = { ...withdrawn, inputAimX: pose.inputAimX, inputAimY: pose.inputAimY,
            weaponWithdrawalV160: { active: true, amount: high, reason: 'rigid-contact-obstructed' } };
        }
      }
      // Retract the whole receiver and both hand targets, not just the round.
      // Keep the collision ray rooted on the actual body-side shoulder.
      // A successful clearance correction can leave a completely free shot
      // above cover. Do not retain the old obstruction that caused the solve;
      // the guide sweeps the final projectile for any obstacle farther away.
      const fireObstructed = pose.weaponWithdrawalV160?.active || !pose.armReachV160.feasible;
      pose.muzzle = { ...pose.muzzle, pivotX: shoulder.x, pivotY: shoulder.y,
        barrelLength: Math.hypot(pose.muzzle.x - shoulder.x, pose.muzzle.y - shoulder.y),
        ...(fireObstructed ? { obstructedV124: true } : {}) };
      return { ...pose, bodyRig: rig.bodyRig, weaponImage: rig.weaponImage, surface: rig.surface };
    }

    previewPlayerWeaponInputV160(actor = this.player, aim = null) {
      const keyboard = readKeyboardCombatAimV83(this.keys,
        actor === this.coop ? COMBAT_AIM_KEY_BINDINGS_V83.coop : COMBAT_AIM_KEY_BINDINGS_V83.player);
      const pointer = actor === this.player ? previewCombatPointerAimV160(this.canvas, this) || actor.pointerAimV83 : actor.pointerAimV83;
      const input = [pointer, actor.gamepadAimV83].find(value => value && Math.hypot(value.x || 0, value.y || 0) > .25) || keyboard;
      // Deferred charge/burst cycles retain x/y only. Their admission preview
      // must keep the body on the same side as the stored firing direction.
      const resolvedAim = aim ? { ...aim, facing: aim.facing ?? (Math.abs(finite(aim.x)) > 1e-8
        ? Math.sign(aim.x) : actor.facing < 0 ? -1 : 1) } : resolveCombatAimV83({ ...input, facing: actor.facing });
      return { aim: resolvedAim,
        aiming: Boolean(pointer || actor.gamepadAimV83 || actor.gamepadAimHeldV124
          || this.keys?.has(actor.coop ? 'ShiftRight' : 'ShiftLeft')) };
    }

    playerWeaponFireBlockedV160(actor = this.player, aim = null) {
      if (!actor || actor.inVehicle || this.neuro?.active && actor === this.player) return false;
      const descriptor = resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor));
      if (!descriptor?.portable || descriptor.type === 'melee' || this.weaponActionProfileV130?.(actor)) return false;
      const direction = this.previewPlayerWeaponInputV160(actor, aim).aim;
      for (const shotPreviewV160 of [false, true]) {
        const pose = this.resolvePlayerWeaponPoseV125(actor, direction, { requireReady: false, shotPreviewV160 });
        if (pose && (pose.weaponWithdrawalV160?.active || pose.armReachV160?.feasible === false)) return true;
      }
      return false;
    }

    drawPlayerBodyCompositionV125(ctx, actor, options) {
      return drawPlayerBodyRigV125(ctx, { actor, ...options });
    }

    drawPlayerWeaponRigV125(ctx, actor = this.player, options = {}) {
      const pose = this.resolvePlayerWeaponPoseV125(actor, actor?.combatAimV83, { ...options, requireReady: true });
      if (!pose) { if (actor) actor.heldWeaponVisualV125 = null; return null; }
      const render = this.drawPlayerBodyCompositionV125(ctx, actor, { ...options, images: this.images,
        bodyRig: pose.bodyRig, weaponPose: pose, drawWeapon: () => drawHeldWeaponV125(ctx, pose.weaponImage, pose) });
      if (!render.drawn) { actor.heldWeaponVisualV125 = null; return null; }
      const jointAxes = pose.bodyRig.torsoAxisV160 || {
        forward: { x: pose.bodyRig.matrix.a, y: pose.bodyRig.matrix.b },
        down: { x: pose.bodyRig.matrix.c, y: pose.bodyRig.matrix.d }
      };
      const jointAngles = Object.fromEntries(['near', 'far'].map(side => [side,
        getPlayerArmJointAnglesV160(render.arms[side].shoulder, render.arms[side].hand,
          pose.bodyRig.armLengths[side], jointAxes, pose.bodyRig.facing, pose.armBendsV160?.[side])
      ]));
      // Observation is stamped only after the body and held weapon were drawn.
      // A pointer shot can be accepted between animation frames; its live state
      // must not be confused with the previously drawn framebuffer.
      actor.heldWeaponVisualV125 = { schema: 125, shotSerial: finite(actor.shots), timeSeconds: finite(this.animationTime),
        weaponId: pose.profile.weaponId, path: pose.path,
        surface: pose.surface, bodySheetId: render.sheetId, bodyFrame: render.frame,
        grip: point(pose.grip), support: point(pose.support), muzzle: { ...pose.muzzle },
        reloadPort: point(pose.reloadPort), ejectionPort: point(pose.ejectionPort), matrix: { ...pose.matrix },
        nearHand: point(render.arms.near.hand), farHand: point(render.arms.far.hand),
        nearShoulder: point(render.arms.near.shoulder), farShoulder: point(render.arms.far.shoulder),
        nearElbow: point(render.arms.near.elbow), farElbow: point(render.arms.far.elbow),
        armJointAnglesV160: jointAngles, armBendsV160: { ...pose.armBendsV160 }, armReachV160: { ...pose.armReachV160 },
        weaponWithdrawalV160: pose.weaponWithdrawalV160 ? { ...pose.weaponWithdrawalV160 } : null,
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
