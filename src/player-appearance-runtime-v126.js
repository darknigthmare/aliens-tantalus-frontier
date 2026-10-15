import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { resolvePlayerActionStateV127, resolvePlayerActionRigV127, drawPlayerActionRigV127 } from './player-action-rig-v127.js';
import { advancePlayerTransitStateV128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from './player-transit-rig-v128.js';
import { advancePlayerLocomotionStateV129, resolvePlayerLocomotionRigV129 } from './player-locomotion-rig-v129.js';
import { PLAYER_COLONIAL_LEG_DEFINITIONS_V129 } from './player-colonial-art-v129.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const own = (value, key) => Boolean(value && Object.hasOwn(value, key));
const bodyAssetKeys = new Set(PLAYER_BODY_RIG_ASSETS_V125.map(asset => asset.imageKey));
// Two independently dressed operators can share old and new pieces, opposite
// facing torso pages, two carried weapons, a pickup and two active implements.
export const PLAYER_APPEARANCE_IMAGE_LIMIT_V129 = 16;

/** Only actual collision surfaces at the actor's resolved support plane may
 * claim a planted sole. Adjacent platforms remain independent segments. */
export function playerAppearanceGroundSupportV129(actor, surfaces = []) {
  if (!actor || actor.grounded !== true) return [];
  const floor = actor.y + actor.h;
  return surfaces.filter(surface => [surface?.x, surface?.y, surface?.w].every(Number.isFinite)
    && surface.w > 0 && Math.abs(surface.y - floor) < .01)
    .map(surface => ({ left: surface.x, right: surface.x + surface.w, y: surface.y }));
}

export function playerAppearanceVisualIsCurrentV129(last, status) {
  return Boolean(last?.supported && status.supported && status.ready
    && JSON.stringify(last.selected) === JSON.stringify(status.selected)
    && last.bodyFrame === status.bodyFrame && last.bodyAtlas === status.bodyAtlas
    && last.action?.kind === status.action?.kind && last.action?.serial === status.action?.serial
    && last.transit?.kind === status.transit?.kind && last.transit?.phase === status.transit?.phase
    && last.locomotion?.mode === status.locomotion?.mode && last.locomotion?.phase === status.locomotion?.phase
    && JSON.stringify(last.locomotion?.contacts) === JSON.stringify(status.locomotion?.contacts)
    && (!(status.action || status.transit || status.locomotion) || last.sampledAt === status.sampledAt));
}
const actionStatusV127 = (action, render) => !action?.eligible ? null : {
  schema: 127, kind: action.kind, mode: action.mode, phase: action.phase,
  progress: action.progress, elapsed: action.elapsed, duration: action.duration,
  serial: action.serial, source: action.source, firing: false,
  drawn: Boolean(render?.drawn && render.actionV127),
  props: action.props.map(prop => ({ itemId: prop.itemId, imageKey: prop.imageKey,
    path: prop.asset.path, grip: { ...prop.grip }, support: prop.support ? { ...prop.support } : null, firing: false })),
  target: action.target ? { ...action.target } : null
};
const transitStatusV128 = (transit, render) => !transit?.eligible ? null : {
  schema: 128, kind: transit.kind, mode: transit.mode, phase: transit.phase,
  progress: transit.progress, source: transit.source, firing: false,
  drawn: Boolean(render?.drawn && render.transitV128),
  state: transit.state, legs: transit.legs, contacts: transit.contacts
};

/** Selection is persistent, while readiness and the last rendered layers are
 * transient. Neither clothing nor image readiness owns combat geometry. */
export function playerAppearanceStatusV126({ actor, appearance = actor?.appearanceV126,
  bodyRig, images, render = null, actionRig = null, transitRig = null } = {}) {
  const selected = normalizePlayerAppearanceV126(appearance);
  const modular = bodyRig?.eligible
    ? resolvePlayerModularRigV126({ bodyRig, appearance: selected, images }) : null;
  const supported = Boolean(bodyRig?.eligible && modular?.eligible);
  const ready = supported && Boolean(modular?.ready) && (!actionRig?.eligible || actionRig.ready)
    && (!transitRig?.eligible || transitRig.ready);
  return { schema: 126, selected, supported, ready,
    drawn: Boolean(ready && render?.drawn && render.schema === 126),
    reason: !bodyRig?.eligible ? bodyRig?.reason || 'body-unavailable'
      : !supported || !ready ? (transitRig?.eligible ? transitRig.reason : null)
        || (actionRig?.eligible ? actionRig.reason : null) || modular?.reason || 'appearance-images-unavailable'
        : render && !render.drawn ? render.reason || 'appearance-not-drawn' : null,
    surface: bodyRig?.surface || null, bodyFrame: bodyRig?.frame ?? null,
    bodyAtlas: bodyRig?.atlas || null,
    humanVisualV133: bodyRig?.eligible ? {
      schema: 133, standingHeight: bodyRig.standingHeight, poseHeight: bodyRig.poseHeight,
      pivot: { ...bodyRig.pivot }, scaleX: bodyRig.sourceScaleX, scaleY: bodyRig.sourceScaleY
    } : null,
    action: actionStatusV127(actionRig, render), sampledAt: bodyRig?.timeSeconds ?? null,
    transit: transitStatusV128(transitRig, render),
    locomotion: bodyRig?.locomotionV129 ? { ...bodyRig.locomotionV129,
      drawn: Boolean(ready && render?.schema === 126 && render.drawn) } : null,
    layers: render?.schema === 126 && render.drawn ? render.layers || [] : [],
    visualStatus: render?.schema === 126 && render.drawn ? render.visualStatus : null };
}

/** This mixin adds appearance to the existing weapon rig through composition
 * hooks. The accepted-shot path, arm solver and weapon affine remain V125's. */
export function withPlayerAppearanceV126(Base) {
  return class PlayerAppearanceRuntimeV126 extends Base {
    configurePlayerAppearanceV126(options = {}) {
      this.playerAppearanceDefaultsV126 = {
        player: normalizePlayerAppearanceV126(options.playerAppearanceV126),
        coop: normalizePlayerAppearanceV126(options.coopAppearanceV126)
      };
      return this.playerAppearanceDefaultsV126;
    }

    createPlayer(...args) {
      const actor = super.createPlayer(...args);
      if (actor) actor.appearanceV126 = normalizePlayerAppearanceV126(
        this.playerAppearanceDefaultsV126?.[actor.coop ? 'coop' : 'player']);
      return actor;
    }

    start(options = {}) {
      this.configurePlayerAppearanceV126(options);
      const result = super.start(options);
      this.preparePlayerWeaponAssetsV125();
      return result;
    }

    playerAppearanceRigOptionsV127(actor = this.player, options = {}) {
      return { actor, sample: options.sample || null,
        surface: this.playerWeaponSurfaceV125(options.surface), images: this.images,
        timeSeconds: finite(this.animationTime),
        reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion || this.reducedMotion),
        neuroActive: Boolean(this.neuro?.active && actor === this.player) };
    }

    playerAppearanceLadderV128(actor) {
      const ladder = actor?.climbing && actor.ladderId
        ? this.ladders?.find(candidate => candidate.id === actor.ladderId) : null;
      return ladder ? { id: ladder.id, x: ladder.x, top: ladder.top, bottom: ladder.bottom, w: ladder.w } : null;
    }

    observePlayerTransitV128(actor) {
      return advancePlayerTransitStateV128(actor?.playerTransitStateV128, actor, finite(this.animationTime), {
        context: this.playerAppearanceContextV129(), ladder: this.playerAppearanceLadderV128(actor)
      });
    }

    playerAppearanceContextV129() {
      return `${this.playerWeaponSurfaceV125()}:${this.missionLevelRuntime?.currentRoomId || this.activeRoomId || this.room || ''}`;
    }

    observePlayerLocomotionV129(actor) {
      return advancePlayerLocomotionStateV129(actor?.playerLocomotionStateV129, actor, finite(this.animationTime), {
        context: this.playerAppearanceContextV129(), surface: this.playerWeaponSurfaceV125()
      });
    }

    decoratePlayerAppearanceBodyV129(actor, bodyRig) {
      return resolvePlayerLocomotionRigV129({ actor, bodyRig, appearance: actor?.appearanceV126,
        images: this.images, locomotionState: actor?.playerLocomotionStateV129,
        legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129,
        groundSupport: playerAppearanceGroundSupportV129(actor,
          [...(this.platforms || []), ...(this.walls || []), ...(this.covers || []),
            ...(this.closedDoorColliders?.() || [])].filter(surface => !surface.destroyed)) }).bodyRig;
    }

    advancePlayerWeaponActorV125(actor) {
      const motion = super.advancePlayerWeaponActorV125(actor);
      if (actor) {
        actor.playerTransitStateV128 = this.observePlayerTransitV128(actor);
        actor.playerLocomotionStateV129 = this.observePlayerLocomotionV129(actor);
      }
      return motion;
    }

    resolvePlayerAppearanceTransitV128(actor = this.player, options = {}) {
      return resolvePlayerTransitRigV128({ ...this.playerAppearanceRigOptionsV127(actor, options),
        appearance: actor?.appearanceV126, ladder: this.playerAppearanceLadderV128(actor),
        transitState: this.observePlayerTransitV128(actor), legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129 });
    }

    resolvePlayerAppearanceActionV127(actor = this.player, options = {}) {
      const fieldTask = this.fieldActionsV124?.get(actor);
      const placeableTask = this.placeableTasksV86?.get(String(actor?.crewId || actor?.operatorId || ''));
      const target = fieldTask?.target || placeableTask;
      const actionTarget = target && target !== actor ? {
        id: target.id || target.instanceId || null, x: target.x, y: target.y, w: target.w, h: target.h
      } : null;
      return resolvePlayerActionRigV127({ ...this.playerAppearanceRigOptionsV127(actor, options),
        appearance: actor?.appearanceV126, weaponDescriptor: this.heldWeaponDescriptorV125(actor), actionTarget,
        decorateBodyRigV129: bodyRig => this.decoratePlayerAppearanceBodyV129(actor, bodyRig) });
    }

    resolvePlayerAppearanceBodyV126(actor = this.player, options = {}) {
      const transit = this.resolvePlayerAppearanceTransitV128(actor, options);
      if (transit.eligible) return transit.bodyRig;
      const action = this.resolvePlayerAppearanceActionV127(actor, options);
      return action?.eligible ? action.bodyRig : this.decoratePlayerAppearanceBodyV129(actor,
        resolvePlayerBodyRigV125(this.playerAppearanceRigOptionsV127(actor, options)));
    }

    beginPlayerWeaponShotV125(actor) {
      // Gameplay already accepted this response shot. End only Echo9's
      // cosmetic injury pose before V125 resolves the authoritative muzzle;
      // health, damage, electrical stun and action admission remain untouched.
      // Otherwise an allowed shot could leave an apparently holstered weapon.
      if ((actor === this.player || actor === this.coop) && finite(actor?.v52HurtClock) > 0
        && !(finite(actor.shockClock) > 0)) {
        const action = resolvePlayerActionStateV127(this.playerAppearanceRigOptionsV127(actor));
        if (action.eligible && action.mode === 'hurt') actor.v52HurtClock = 0;
      }
      return super.beginPlayerWeaponShotV125(actor);
    }

    collectPlayerWeaponAssetsV125() {
      // The base contributes the carried weapons and selected pickup. Body
      // pages are retained below from each admitted pose and selected pieces.
      const assets = super.collectPlayerWeaponAssetsV125().filter(asset => !bodyAssetKeys.has(asset.imageKey));
      for (const actor of this.playerWeaponActorsV125()) {
        const transit = this.resolvePlayerAppearanceTransitV128(actor);
        const action = transit.eligible ? null : this.resolvePlayerAppearanceActionV127(actor);
        const bodyRig = transit.eligible ? transit.bodyRig : action?.eligible ? action.bodyRig
          : this.decoratePlayerAppearanceBodyV129(actor, resolvePlayerBodyRigV125(this.playerAppearanceRigOptionsV127(actor)));
        if (bodyRig?.eligible) {
          const modular = resolvePlayerModularRigV126({ bodyRig, appearance: actor.appearanceV126, images: this.images });
          assets.push(...bodyRig.requiredAssets, ...modular.requiredAssets);
          // Keep the actual carried weapon warm while the hands work with a
          // tool. Returning to the weapon must not reload its sprite page.
          const weapon = resolveHeldWeaponProfileV125(this.heldWeaponDescriptorV125(actor));
          if (weapon?.portable) assets.push(weapon);
        }
        if (action?.eligible) assets.push(...action.requiredAssets);
        if (transit.eligible) assets.push(...transit.requiredAssets);
      }
      return [...new Map(assets.map(asset => [asset.imageKey, asset])).values()];
    }

    preparePlayerWeaponAssetsV125() {
      if (this.weaponImageCacheV125) this.weaponImageCacheV125.maxImages = PLAYER_APPEARANCE_IMAGE_LIMIT_V129;
      return super.preparePlayerWeaponAssetsV125();
    }

    drawPlayerBodyCompositionV125(ctx, actor, options) {
      const bodyRig = this.decoratePlayerAppearanceBodyV129(actor, options.bodyRig);
      const render = drawPlayerModularRigV126(ctx, { ...options, bodyRig, appearance: actor.appearanceV126 });
      actor.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor,
        bodyRig, images: this.images, render });
      actor.playerLocomotionVisualV129 = actor.playerAppearanceVisualV126.locomotion;
      return render.drawn ? render : super.drawPlayerBodyCompositionV125(ctx, actor, options);
    }

    drawPlayerWeaponRigV125(ctx, actor = this.player, options = {}) {
      if (!actor || actor !== this.player && actor !== this.coop
        || actor === this.coop && !this.coopEnabled) return null;
      const transit = this.resolvePlayerAppearanceTransitV128(actor, options);
      if (transit.eligible) {
        this.preparePlayerWeaponAssetsV125();
        const readyTransit = this.resolvePlayerAppearanceTransitV128(actor, options);
        const render = drawPlayerTransitRigV128(ctx, { transitRig: readyTransit,
          appearance: actor.appearanceV126, images: this.images });
        const status = playerAppearanceStatusV126({ actor, bodyRig: readyTransit.bodyRig,
          images: this.images, render, transitRig: readyTransit });
        actor.playerAppearanceVisualV126 = status;
        actor.playerTransitVisualV128 = status.transit;
        actor.playerActionVisualV127 = null;
        actor.playerLocomotionVisualV129 = null;
        actor.heldWeaponVisualV125 = null;
        actor.heldWeaponVisualV95 = null;
        return render.drawn ? render : null;
      }
      actor.playerTransitVisualV128 = null;
      const action = this.resolvePlayerAppearanceActionV127(actor, options);
      if (action.eligible) {
        this.preparePlayerWeaponAssetsV125();
        const readyAction = this.resolvePlayerAppearanceActionV127(actor, options);
        const render = drawPlayerActionRigV127(ctx, { actionRig: readyAction,
          appearance: actor.appearanceV126, images: this.images });
        const status = playerAppearanceStatusV126({ actor, bodyRig: readyAction.bodyRig,
          images: this.images, render, actionRig: readyAction });
        actor.playerAppearanceVisualV126 = status;
        actor.playerActionVisualV127 = status.action;
        actor.playerLocomotionVisualV129 = status.locomotion;
        actor.heldWeaponVisualV125 = null;
        actor.heldWeaponVisualV95 = null;
        return render.drawn ? render : null;
      }
      actor.playerActionVisualV127 = null;
      const bodyRig = this.resolvePlayerAppearanceBodyV126(actor, options);
      actor.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor, bodyRig, images: this.images });
      actor.playerLocomotionVisualV129 = actor.playerAppearanceVisualV126.locomotion;
      const held = super.drawPlayerWeaponRigV125(ctx, actor, options);
      if (held) return held;

      const descriptor = this.heldWeaponDescriptorV125(actor);
      const profile = resolveHeldWeaponProfileV125(descriptor);
      // Loading a portable weapon must not make an armed operator look unarmed.
      // The complete existing renderer remains the fallback for that interval.
      if (descriptor && (!profile || profile.portable)) return null;
      if (!bodyRig.eligible) return null;
      this.preparePlayerWeaponAssetsV125();
      const readyBody = this.resolvePlayerAppearanceBodyV126(actor, options);
      const render = drawPlayerModularRigV126(ctx, { bodyRig: readyBody,
        appearance: actor.appearanceV126, images: this.images });
      actor.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor,
        bodyRig: readyBody, images: this.images, render });
      actor.playerLocomotionVisualV129 = actor.playerAppearanceVisualV126.locomotion;
      actor.heldWeaponVisualV125 = null;
      return render.drawn ? render : null;
    }

    captureResumeState() {
      const state = super.captureResumeState();
      for (const role of ['player', 'coop']) if (state[role] && this[role]) {
        state[role].appearanceV126 = normalizePlayerAppearanceV126(this[role].appearanceV126);
      }
      return state;
    }

    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      if (!result?.applied) return result;
      for (const role of ['player', 'coop']) if (this[role] && own(rawState?.[role], 'appearanceV126')) {
        this[role].appearanceV126 = normalizePlayerAppearanceV126(rawState[role].appearanceV126);
        this[role].playerAppearanceVisualV126 = null;
      }
      for (const actor of [this.player, this.coop].filter(Boolean)) {
        delete actor.playerTransitStateV128;
        delete actor.playerLocomotionStateV129;
        actor.playerTransitVisualV128 = null;
        actor.playerLocomotionVisualV129 = null;
        actor.playerTransitStateV128 = this.observePlayerTransitV128(actor);
        actor.playerLocomotionStateV129 = this.observePlayerLocomotionV129(actor);
      }
      this.preparePlayerWeaponAssetsV125();
      return result;
    }

    resetPlayerWeaponRigV125() {
      super.resetPlayerWeaponRigV125();
      for (const actor of [this.player, this.coop].filter(Boolean)) {
        actor.playerAppearanceVisualV126 = null;
        actor.playerActionVisualV127 = null;
        actor.playerTransitVisualV128 = null;
        actor.playerLocomotionVisualV129 = null;
        delete actor.playerTransitStateV128;
        delete actor.playerLocomotionStateV129;
      }
    }

    playerAppearanceSnapshotV126() {
      return { schema: 126, images: this.weaponImageCacheV125?.snapshot() || null,
        operators: this.playerWeaponActorsV125().map(actor => {
          const transit = this.resolvePlayerAppearanceTransitV128(actor);
          const action = this.resolvePlayerAppearanceActionV127(actor);
          const bodyRig = transit.eligible ? transit.bodyRig : action.eligible ? action.bodyRig : this.resolvePlayerAppearanceBodyV126(actor);
          const status = playerAppearanceStatusV126({ actor, bodyRig, images: this.images,
            actionRig: transit.eligible ? null : action, transitRig: transit });
          const last = actor.playerAppearanceVisualV126;
          const same = playerAppearanceVisualIsCurrentV129(last, status);
          return { id: actor.operatorId || actor.crewId || (actor === this.player ? 'player' : 'coop'),
            role: actor === this.player ? 'player' : 'coop', selected: status.selected,
            visual: same ? { ...last, ready: status.ready } : status };
        }) };
    }
  };
}
