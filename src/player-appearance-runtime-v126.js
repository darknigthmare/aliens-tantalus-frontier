import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const own = (value, key) => Boolean(value && Object.hasOwn(value, key));

/** Selection is persistent, while readiness and the last rendered layers are
 * transient. Neither clothing nor image readiness owns combat geometry. */
export function playerAppearanceStatusV126({ actor, appearance = actor?.appearanceV126,
  bodyRig, images, render = null } = {}) {
  const selected = normalizePlayerAppearanceV126(appearance);
  const modular = bodyRig?.eligible
    ? resolvePlayerModularRigV126({ bodyRig, appearance: selected, images }) : null;
  const supported = Boolean(bodyRig?.eligible && modular?.eligible);
  const ready = supported && Boolean(modular?.ready);
  return { schema: 126, selected, supported, ready,
    drawn: Boolean(ready && render?.drawn && render.schema === 126),
    reason: !bodyRig?.eligible ? bodyRig?.reason || 'body-unavailable'
      : !supported || !ready ? modular?.reason || 'appearance-images-unavailable'
        : render && !render.drawn ? render.reason || 'appearance-not-drawn' : null,
    surface: bodyRig?.surface || null, bodyFrame: bodyRig?.frame ?? null,
    bodyAtlas: bodyRig?.atlas || null,
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

    resolvePlayerAppearanceBodyV126(actor = this.player, options = {}) {
      return resolvePlayerBodyRigV125({ actor, sample: options.sample || null,
        surface: this.playerWeaponSurfaceV125(options.surface), images: this.images,
        timeSeconds: finite(this.animationTime),
        reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion || this.reducedMotion),
        neuroActive: Boolean(this.neuro?.active && actor === this.player) });
    }

    collectPlayerWeaponAssetsV125() {
      const assets = super.collectPlayerWeaponAssetsV125();
      for (const actor of this.playerWeaponActorsV125()) {
        // An unarmed operator still has clothing. All operators share the same
        // three modular pages, so six slots do not create six loads per actor.
        if (this.resolvePlayerAppearanceBodyV126(actor).eligible) {
          assets.push(...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126);
        }
      }
      return [...new Map(assets.map(asset => [asset.imageKey, asset])).values()];
    }

    drawPlayerBodyCompositionV125(ctx, actor, options) {
      const render = drawPlayerModularRigV126(ctx, { ...options, appearance: actor.appearanceV126 });
      actor.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor,
        bodyRig: options.bodyRig, images: this.images, render });
      return render.drawn ? render : super.drawPlayerBodyCompositionV125(ctx, actor, options);
    }

    drawPlayerWeaponRigV125(ctx, actor = this.player, options = {}) {
      if (!actor || actor !== this.player && actor !== this.coop
        || actor === this.coop && !this.coopEnabled) return null;
      const bodyRig = this.resolvePlayerAppearanceBodyV126(actor, options);
      actor.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor, bodyRig, images: this.images });
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
      this.preparePlayerWeaponAssetsV125();
      return result;
    }

    resetPlayerWeaponRigV125() {
      super.resetPlayerWeaponRigV125();
      for (const actor of [this.player, this.coop].filter(Boolean)) actor.playerAppearanceVisualV126 = null;
    }

    playerAppearanceSnapshotV126() {
      return { schema: 126, images: this.weaponImageCacheV125?.snapshot() || null,
        operators: this.playerWeaponActorsV125().map(actor => {
          const bodyRig = this.resolvePlayerAppearanceBodyV126(actor);
          const status = playerAppearanceStatusV126({ actor, bodyRig, images: this.images });
          const last = actor.playerAppearanceVisualV126;
          const same = last && last.supported && status.supported && status.ready
            && JSON.stringify(last.selected) === JSON.stringify(status.selected)
            && last.bodyFrame === status.bodyFrame && last.bodyAtlas === status.bodyAtlas;
          return { id: actor.operatorId || actor.crewId || (actor === this.player ? 'player' : 'coop'),
            role: actor === this.player ? 'player' : 'coop', selected: status.selected,
            visual: same ? { ...last, ready: status.ready } : status };
        }) };
    }
  };
}
