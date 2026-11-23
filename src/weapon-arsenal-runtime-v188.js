/** V188 arsenal runtime (spec 014). Native bridge for the non-box feeds the
 * arsenal profile names (tube, cylinder, belt, tank, single), plus the
 * presentation gaps of the V131 action weapons.
 *
 * Feed contract: the V171 pure state machine (weapon-special-feeds-v171.js) is
 * the mechanism engine; `bridgeTemplateId` names that state machine, never the
 * source of the weapon. The V77 tactical reload keeps owning the clock and the
 * final numeric transfer; this layer only advances the interruptible beats
 * strictly before completion (a tube keeps the shells already inserted, a
 * cylinder its loaded rounds, a belt/tank its replenished feed), so the sum
 * ammo + reserve is conserved at every step. A tube demands a pump stroke
 * after each accepted shot. Detachable box magazines stay with V167/V193 (the
 * four reviewed M41A identities only): no physical magazine is invented here.
 *
 * Presentation: V131 rounds (shot, flame, rockets, energy) did not reach the
 * V188 muzzle pass, rockets left no trail, wall hits of V131 projectiles and
 * explosions that touched nobody showed nothing. Those are emitted here from
 * accepted events only. Pending-plaque additions draw a named Canvas
 * placeholder silhouette (no image). Audio reuses existing original cues.
 */
import { getArsenalProfileV188 } from './weapon-arsenal-v188.js';
import { resolveWeaponActionProfileV131 } from './weapon-actions-v131.js';
import { createSpecialFeedV171, fireSpecialFeedV171, cycleSpecialFeedV171, beginSpecialReloadV171,
  advanceSpecialReloadV171, cancelSpecialReloadV171, captureSpecialFeedV171, restoreSpecialFeedV171,
  validateSpecialFeedV171 } from './weapon-special-feeds-v171.js';

export const ARSENAL_RUNTIME_SCHEMA_V188 = 188;
// Owner decision 2026-11-23 (A5): the pump stays automatic by default; a manual pump on a dedicated,
// rebindable key (default B, `pump` in accessibility-v188.js) is an option. The stroke keeps the same
// minimum cycle time as the automatic one (no rate-of-fire advantage); a press made early is kept.
export const PUMP_ACTION_CODE_V188 = 'KeyB';
export const PUMP_PROMPT_V188 = Object.freeze({ fr: 'POMPER', en: 'PUMP' });
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const rounds = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const ROCKET_TRAIL_SECONDS = 0.035; // [PROPOSÉ] smoke puff spacing

/** Named Canvas placeholder slots for weapons without a native plaque. */
export const ARSENAL_PLACEHOLDER_SLOTS_V188 = Object.freeze({
  'held-weapon-placeholder-shotgun'(ctx, length) {
    ctx.fillStyle = '#3b3f3c'; ctx.fillRect(-length * 0.18, -3, length * 1.0, 5);   // barrel + tube
    ctx.fillStyle = '#5b4632'; ctx.fillRect(length * 0.28, 2, length * 0.3, 4);     // pump fore-end
    ctx.fillStyle = '#2a2c2b'; ctx.fillRect(-length * 0.3, -2, length * 0.16, 9);   // pistol grip
  },
  'held-weapon-placeholder-flamethrower'(ctx, length) {
    ctx.fillStyle = '#4a4d47'; ctx.fillRect(-length * 0.2, -4, length * 1.05, 7);
    ctx.fillStyle = '#8a3b22'; ctx.beginPath(); ctx.arc(length * 0.1, 7, 6, 0, Math.PI * 2); ctx.fill(); // fuel canister
    ctx.fillStyle = '#ffb34d'; ctx.fillRect(length * 0.82, -2, 3, 3);              // pilot light
  }
});

export function withArsenalFeedsV188(Base) {
  if (Base.arsenalFeedsRuntimeV188) return Base;
  return class ArsenalFeedsRuntimeV188 extends Base {
    static arsenalFeedsRuntimeV188 = true;

    bind() {
      super.bind();
      globalThis.addEventListener?.('keydown', (event) => {
        if (!this.running || event.repeat || event.code !== PUMP_ACTION_CODE_V188 || !this.canRouteGameplayKey(event)) return;
        if (this.requestPumpV188(this.player)) event.preventDefault?.();
      });
    }

    /** Manual pump option: read live from the host (settings), false when the host supplies nothing. */
    pumpManualV188(actor = this.player) {
      return actor === this.player && this.pumpInputV188?.manual?.() === true;
    }
    /** The dedicated pump action (key or touch button). True when a stroke is owed and was performed or queued. */
    requestPumpV188(actor = this.player) {
      const record = actor?.arsenalFeedV188;
      if (!this.pumpManualV188(actor) || !record?.feed.needsCycle || this.paused || this.mission?.state !== 'active') return false;
      record.pumpRequestedV188 = true;
      this.advanceArsenalPumpV188(actor);
      return true;
    }
    /** True while the player's tube-fed weapon waits for a manual stroke (HUD prompt, touch button). */
    pumpDueV188(actor = this.player) {
      return Boolean(this.pumpManualV188(actor) && actor?.arsenalFeedV188?.feed.needsCycle && !actor.reloading);
    }

    start(options = {}) {
      this.arsenalFeedsEnabledV188 = options.arsenalFeedsV188 !== false;
      this.arsenalStatsV188 = { shots: 0, pumps: 0, reloads: 0, interrupted: 0, resyncs: 0, capacityNormalized: 0,
        muzzle: 0, trails: 0, wallImpacts: 0, explosions: 0, placeholders: 0 };
      this.arsenalTrackedV188 = new Map();
      for (const actor of [this.player, this.coop]) if (actor) delete actor.arsenalFeedV188;
      const result = super.start(options);
      for (const actor of [this.player, this.coop]) if (actor) delete actor.arsenalFeedV188;
      this.syncArsenalFeedsV188();
      return result;
    }

    arsenalRoleV188(actor) {
      return actor && actor === this.player ? 'player' : actor && actor === this.coop && this.coopEnabled ? 'coop' : null;
    }

    /** The arsenal profile of the primary weapon the actor is holding, or null. */
    arsenalProfileForV188(actor) {
      if (!actor || actor.inVehicle || actor.weaponMode !== 'rifle' || this.neuro?.active && actor === this.player) return null;
      return getArsenalProfileV188(this.reloadWeaponV77?.(actor)) || null;
    }

    arsenalBridgeProfileV188(actor) {
      if (!this.arsenalFeedsEnabledV188 || !this.arsenalRoleV188(actor)) return null;
      const profile = this.arsenalProfileForV188(actor);
      return profile?.feed.nativeBridge ? profile : null;
    }

    createArsenalFeedV188(actor, profile, role) {
      const capacity = profile.feed.runtimeCapacity;
      const feed = createSpecialFeedV171({ ownerId: role, weaponInstanceId: role + ':' + profile.weaponId,
        weaponDefinitionId: profile.feed.bridgeTemplateId, loaded: rounds(actor.ammo), reserve: rounds(actor.ammoReserve), capacity });
      actor.arsenalFeedV188 = feed ? { schema: 188, weaponId: profile.weaponId, kind: profile.feed.nativeBridge,
        templateId: profile.feed.bridgeTemplateId, feed, lastShots: finite(actor.shots), cycleDue: null,
        reloadSerial: 0, reloadState: null, trailClock: 0 } : null;
      return actor.arsenalFeedV188;
    }

    /** Reconcile one actor with its numeric ammunition. Never creates rounds. */
    syncArsenalFeedV188(actor) {
      const role = this.arsenalRoleV188(actor);
      if (!role) return null;
      const profile = this.arsenalBridgeProfileV188(actor);
      if (!profile) {
        // A secondary weapon or vehicle keeps the dormant primary feed; a different primary drops it.
        if (actor.arsenalFeedV188 && actor.weaponMode === 'rifle' && !actor.inVehicle) delete actor.arsenalFeedV188;
        return null;
      }
      const reloading = actor.tacticalReload?.phase === 'reloading';
      const capacity = profile.feed.runtimeCapacity;
      if (rounds(actor.magazineSize) !== capacity && !reloading) {
        // Mechanism capacity (one rocket in the tube, six chambers): move the
        // surplus to the reserve; the total is unchanged.
        const total = rounds(actor.ammo) + rounds(actor.ammoReserve);
        actor.magazineSize = capacity;
        actor.ammo = Math.min(capacity, rounds(actor.ammo));
        actor.ammoReserve = total - actor.ammo;
        this.arsenalStatsV188.capacityNormalized++;
        if (actor.arsenalFeedV188) delete actor.arsenalFeedV188;
      }
      let record = actor.arsenalFeedV188;
      if (record && (record.weaponId !== profile.weaponId || !validateSpecialFeedV171(record.feed))) record = null;
      if (!record) return this.createArsenalFeedV188(actor, profile, role);
      const feed = record.feed;
      if (feed.loaded !== rounds(actor.ammo) || feed.reserve !== rounds(actor.ammoReserve)) {
        if (feed.pending && reloading) return record; // reload beat in progress; settled after the update
        this.arsenalStatsV188.resyncs++;
        const cycle = record.feed.needsCycle && rounds(actor.ammo) === feed.loaded ? record.cycleDue : null;
        const next = this.createArsenalFeedV188(actor, profile, role);
        if (next && cycle !== null && next.kind === 'tube') { next.feed.needsCycle = true; next.feed.spentCases = 1; next.cycleDue = cycle; }
        return next;
      }
      return record;
    }

    syncArsenalFeedsV188() {
      for (const actor of [this.player, this.coop]) if (actor) this.syncArsenalFeedV188(actor);
    }

    /** Spend one feed unit per accepted shot serial (single shots, bursts, V131 cycles). */
    consumeArsenalShotsV188(actor) {
      const record = actor?.arsenalFeedV188;
      if (!record) return;
      const shots = finite(actor.shots);
      for (let serial = Math.floor(record.lastShots) + 1; serial <= shots; serial++) {
        const shot = fireSpecialFeedV171(record.feed, 'shot-' + serial);
        if (!shot) { this.arsenalStatsV188.resyncs++; break; }
        this.arsenalStatsV188.shots++;
        if (shot.requiresCycle) record.cycleDue = finite(this.animationTime) + finite(getArsenalProfileV188(record.weaponId)?.feed.pumpCycleSeconds, 0.4);
      }
      record.lastShots = shots;
      if (record.feed.loaded !== rounds(actor.ammo) || record.feed.reserve !== rounds(actor.ammoReserve)) this.syncArsenalFeedV188(actor);
    }

    fire(actor = this.player) {
      const record = this.syncArsenalFeedV188(actor);
      // A tube-fed receiver cannot fire again before the pump stroke.
      if (record?.feed.needsCycle) return false;
      const profile = this.arsenalProfileForV188(actor);
      if (this.audio && profile?.audio.shot) this.audio.nextShotCueV188 = profile.audio.shot;
      const result = super.fire(actor);
      this.consumeArsenalShotsV188(actor);
      return result;
    }

    reload(actor = this.player) {
      this.syncArsenalFeedV188(actor);
      return super.reload(actor);
    }

    advanceArsenalReloadV188(actor, delta) {
      const record = actor?.arsenalFeedV188, state = actor?.tacticalReload;
      if (!record || state?.phase !== 'reloading') return;
      const feed = record.feed;
      if (!feed.pending || record.reloadState !== state) {
        if (feed.pending) cancelSpecialReloadV171(feed, 'r' + record.reloadSerial);
        if (feed.needsCycle && this.pumpArsenalFeedV188(actor, record) === false) return;
        record.reloadSerial++;
        record.reloadState = state;
        if (!beginSpecialReloadV171(feed, 'r' + record.reloadSerial)) return;
      }
      const progress = Math.min(0.999, Math.max(feed.pending.progress, (finite(state.elapsed) + Math.max(0, finite(delta))) / state.completeAt));
      if (advanceSpecialReloadV171(feed, 'r' + record.reloadSerial, progress)) {
        actor.ammo = feed.loaded; actor.ammoReserve = feed.reserve;
      }
    }

    settleArsenalReloadV188(actor) {
      const record = actor?.arsenalFeedV188;
      if (!record?.feed.pending) return;
      const phase = actor.tacticalReload?.phase;
      if (phase === 'reloading' && record.reloadState === actor.tacticalReload) return;
      if (phase === 'complete') {
        // V77 performed the remaining numeric transfer; the feed follows the numbers.
        this.arsenalStatsV188.reloads++;
        record.feed.pending = null;
        const profile = this.arsenalBridgeProfileV188(actor), role = this.arsenalRoleV188(actor);
        if (profile && role) this.createArsenalFeedV188(actor, profile, role);
      } else {
        this.arsenalStatsV188.interrupted++;
        cancelSpecialReloadV171(record.feed, 'r' + record.reloadSerial);
      }
      record.reloadState = null;
    }

    pumpArsenalFeedV188(actor, record) {
      const done = cycleSpecialFeedV171(record.feed, 'pump-' + finite(actor.shots));
      if (!done) return false;
      record.cycleDue = null; record.pumpRequestedV188 = false;
      this.arsenalStatsV188.pumps++;
      if (actor === this.player) this.audio?.cue?.(getArsenalProfileV188(record.weaponId)?.audio.cycle || 'weapon-dry-fire');
      this.onEvent?.({ type: 'weapon-pump-v188', weaponId: record.weaponId, coop: Boolean(actor.coop) });
      return true;
    }

    advanceArsenalPumpV188(actor) {
      const record = actor?.arsenalFeedV188;
      if (!record?.feed.needsCycle || record.cycleDue === null) return;
      const busy = actor.reloading || actor.climbing || actor.alive === false || actor.downed
        || finite(actor.toolUseClock) > 0 || finite(actor.interactionClock) > 0 || finite(actor.meleeClock) > 0;
      if (busy || finite(this.animationTime) + 1e-9 < record.cycleDue) return;
      // Manual option: the stroke waits for the player's pump action (kept when pressed early).
      if (this.pumpManualV188(actor) && !record.pumpRequestedV188) return;
      this.pumpArsenalFeedV188(actor, record);
    }

    update(delta) {
      const live = this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && this.mission?.state === 'active';
      if (live) for (const actor of [this.player, this.coop]) {
        if (!this.arsenalRoleV188(actor)) continue;
        this.syncArsenalFeedV188(actor);
        this.advanceArsenalReloadV188(actor, delta);
      }
      const before = live ? this.observeArsenalProjectilesV188() : null;
      const result = super.update(delta);
      if (live) {
        for (const actor of [this.player, this.coop]) {
          if (!this.arsenalRoleV188(actor)) continue;
          this.settleArsenalReloadV188(actor);
          this.consumeArsenalShotsV188(actor);
          this.advanceArsenalPumpV188(actor);
        }
        this.presentArsenalProjectilesV188(before, delta);
      }
      return result;
    }

    // —— presentation (accepted events only) ——
    observeArsenalProjectilesV188() {
      const seen = this.arsenalTrackedV188 ||= new Map();
      for (const projectile of this.weaponProjectilesV131 || []) if (!seen.has(projectile)) seen.set(projectile, { x: projectile.x, y: projectile.y });
      return seen;
    }

    presentArsenalProjectilesV188(seen, delta) {
      if (!seen) return;
      const live = new Set(this.weaponProjectilesV131 || []);
      for (const [projectile, last] of seen) {
        if (live.has(projectile)) {
          last.x = projectile.x; last.y = projectile.y;
          if (['rocket', 'launcher'].includes(projectile.kind) && this.vfxV188Enabled) {
            projectile.arsenalTrailV188 = finite(projectile.arsenalTrailV188) + finite(delta);
            if (projectile.arsenalTrailV188 >= ROCKET_TRAIL_SECONDS) {
              projectile.arsenalTrailV188 = 0; this.arsenalStatsV188.trails++;
              this.vfxEmitV188?.('smoke', projectile.x + projectile.w / 2 - Math.sign(finite(projectile.vx)) * 8, projectile.y + projectile.h / 2,
                { angle: Math.atan2(-finite(projectile.vy), -finite(projectile.vx) || -1), spread: .5, speed: 22, life: .55, size: 5 });
            }
          }
          continue;
        }
        seen.delete(projectile);
        // A projectile that ended with no enemy contact before its range struck a surface.
        if (!projectile.resolved || projectile.hits > 0 || ['rocket', 'launcher'].includes(projectile.kind)
          || finite(projectile.remaining) <= 1e-6 || !this.vfxV188Enabled) continue;
        const profile = getArsenalProfileV188(projectile.weaponId), action = resolveWeaponActionProfileV131(projectile.weaponId);
        if (profile && action && finite(projectile.travelled) < finite(action.range, Infinity) * 0.98) {
          this.arsenalStatsV188.wallImpacts++;
          const kind = profile.vfx.impact === 'energy-scorch' ? 'ember' : 'spark';
          this.vfxEmitV188?.(kind, finite(projectile.x), finite(projectile.y),
            { count: 3, angle: Math.atan2(-finite(projectile.vy), -finite(projectile.vx) || -1), spread: 1.1, speed: 160, life: .25, size: 5 });
        }
      }
    }

    commitWeaponRoundV131(actor, profile, aim) {
      const accepted = super.commitWeaponRoundV131(actor, profile, aim);
      if (accepted && this.vfxV188Enabled && typeof this.vfxMuzzleV188 === 'function') {
        const muzzle = this.resolvePlayerMuzzleV124?.(actor, aim);
        if (muzzle && Number.isFinite(muzzle.x) && Number.isFinite(muzzle.y)) {
          this.arsenalStatsV188.muzzle++;
          this.vfxMuzzleV188({ sourceX: muzzle.x, sourceY: muzzle.y, x: muzzle.x, y: muzzle.y,
            vx: finite(aim?.x, actor.facing < 0 ? -1 : 1), vy: finite(aim?.y), family: profile.family });
        }
      }
      return accepted;
    }

    explodeGrenadeV130(projectile, profile) {
      const was = Boolean(projectile?.resolved);
      const result = super.explodeGrenadeV130(projectile, profile);
      if (!was && projectile?.resolved && this.vfxV188Enabled && !projectile.vfxExplodedV188 && typeof this.vfxExplosionV188 === 'function') {
        projectile.vfxExplodedV188 = true; this.arsenalStatsV188.explosions++;
        this.vfxExplosionV188(finite(projectile.x) + finite(projectile.w) / 2, finite(projectile.y) + finite(projectile.h) / 2);
      }
      return result;
    }

    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      this.drawArsenalPlaceholdersV188(ctx);
      this.drawPumpPromptV188(ctx);
      return result;
    }

    /** Manual option: a text prompt above the marine while a stroke is owed (text, not colour alone). */
    drawPumpPromptV188(ctx) {
      const actor = this.player;
      if (!ctx || !this.pumpDueV188(actor) || actor.alive === false || typeof ctx.fillText !== 'function') return;
      const en = this.pumpInputV188?.language?.() === 'en', key = this.pumpInputV188?.keyLabel?.() || 'B';
      const text = `${en ? PUMP_PROMPT_V188.en : PUMP_PROMPT_V188.fr} [${key}]`;
      ctx.save();
      ctx.font = '700 13px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const x = finite(actor.x) + finite(actor.w) / 2, y = finite(actor.y) - 14, width = (ctx.measureText?.(text)?.width || text.length * 8) + 14;
      ctx.fillStyle = 'rgba(2, 8, 7, .82)'; ctx.fillRect(x - width / 2, y - 15, width, 21);
      ctx.strokeStyle = '#e7c86a'; ctx.lineWidth = 1; ctx.strokeRect(x - width / 2 + 0.5, y - 14.5, width - 1, 20);
      ctx.fillStyle = '#f2e3a6'; ctx.fillText(text, x, y);
      ctx.restore();
    }

    /** Pending-plaque weapons: a named Canvas silhouette along the aim, never an image. */
    drawArsenalPlaceholdersV188(ctx) {
      for (const actor of [this.player, this.coop]) {
        if (!ctx || !this.arsenalRoleV188(actor) || actor.alive === false) continue;
        const profile = this.arsenalProfileForV188(actor);
        const slot = profile?.held.placeholderSlot && ARSENAL_PLACEHOLDER_SLOTS_V188[profile.held.placeholderSlot];
        if (!slot) continue;
        const aim = actor.combatAimV83 || { x: actor.facing < 0 ? -1 : 1, y: 0 };
        const muzzle = this.resolvePlayerMuzzleV124?.(actor, aim);
        if (!muzzle || !Number.isFinite(muzzle.x)) continue;
        const angle = Math.atan2(finite(aim.y), finite(aim.x, 1)), length = 46;
        ctx.save();
        ctx.translate(muzzle.x - Math.cos(angle) * length * 0.85, muzzle.y - Math.sin(angle) * length * 0.85);
        ctx.rotate(angle);
        slot(ctx, length);
        ctx.restore();
        this.arsenalStatsV188.placeholders++;
      }
    }

    // —— persistence ——
    captureResumeState() {
      const state = super.captureResumeState();
      for (const role of ['player', 'coop']) {
        const record = this[role]?.arsenalFeedV188, feed = record && captureSpecialFeedV171(record.feed);
        if (state?.[role] && feed) state[role].arsenalFeedV188 = { schema: 188, weaponId: record.weaponId, kind: record.kind,
          templateId: record.templateId, lastShots: record.lastShots, cycleDue: record.cycleDue, feed };
      }
      return state;
    }

    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      if (!result?.applied) return result;
      const arsenalFeedRestoredV188 = {};
      for (const role of ['player', 'coop']) {
        const actor = this[role];
        arsenalFeedRestoredV188[role] = false;
        if (!actor) continue;
        delete actor.arsenalFeedV188;
        // Normalize the mechanism capacity first (the generic resume restores the catalogue magazine).
        const record = this.syncArsenalFeedV188(actor);
        const profile = this.arsenalBridgeProfileV188(actor), raw = rawState?.[role]?.arsenalFeedV188;
        if (record && profile && raw?.schema === 188 && raw.weaponId === profile.weaponId
          && raw.templateId === profile.feed.bridgeTemplateId) {
          const feed = restoreSpecialFeedV171(raw.feed, { ownerId: role, weaponDefinitionId: profile.feed.bridgeTemplateId,
            expectedTotal: rounds(actor.ammo) + rounds(actor.ammoReserve) });
          if (feed && feed.loaded === rounds(actor.ammo) && feed.capacity === profile.feed.runtimeCapacity) {
            // An interrupted reload transaction is not resumed by the feed: the
            // inserted rounds are already in `loaded`; V77 restarts or settles the clock.
            feed.pending = null;
            record.feed = feed;
            record.cycleDue = feed.needsCycle ? finite(this.animationTime) : null;
            arsenalFeedRestoredV188[role] = true;
          }
        }
      }
      return { ...result, arsenalFeedRestoredV188 };
    }

    /** Read-only state for HUD, QA and the dev shooting range. */
    getArsenalStateV188(role = 'player') {
      const actor = this[role], record = actor?.arsenalFeedV188, profile = this.arsenalProfileForV188(actor);
      return { profile, bridged: Boolean(record), kind: record?.kind || null, loaded: record?.feed.loaded ?? null,
        reserve: record?.feed.reserve ?? null, capacity: record?.feed.capacity ?? null, needsCycle: Boolean(record?.feed.needsCycle),
        spentCases: record?.feed.spentCases ?? 0, pending: record?.feed.pending ? { ...record.feed.pending } : null,
        events: record ? record.feed.events.map(event => ({ ...event })) : [], stats: { ...(this.arsenalStatsV188 || {}) } };
    }
  };
}
