import { HUB_DECKS, HubGame as HubGameV71 } from './hub-v71-runtime.js';
import {
  PROVING_GROUND_ASSETS_V81,
  PROVING_GROUND_ASSET_LIST_V81
} from './proving-ground-assets-v81.js';
import {
  PROVING_GROUND_RELOAD_SECONDS_V81,
  PROVING_GROUND_STATE_KEY_V81,
  abortProvingGroundSessionV81,
  armProvingGroundSessionV81,
  beginProvingGroundSessionV81,
  claimProvingGroundCompletionV81,
  createProvingGroundSessionStateV81,
  fireProvingGroundShotV81,
  getCurrentProvingGroundTargetV81,
  registerProvingGroundTargetHitV81,
  requestProvingGroundReloadV81,
  tickProvingGroundSessionV81
} from './proving-ground-session-v81.js';
import {
  PROVING_GROUND_ANNEX_ID_V81,
  PROVING_GROUND_FIRING_PAD_V81,
  PROVING_GROUND_TARGETS_V81,
  getProvingGroundAimVectorV81,
  getProvingGroundTargetV81
} from './tantalus-proving-ground-v81.js';

export * from './hub-v71-runtime.js';
export * from './proving-ground-assets-v81.js';
export * from './proving-ground-session-v81.js';
export * from './tantalus-proving-ground-v81.js';

export const HUB_PROVING_GROUND_RUNTIME_SCHEMA_V81 = 81;

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const PROJECTILE_SPEED_V81 = 860;
const PROJECTILE_LIFETIME_V81 = 1.55;
const FIRE_INTERVAL_V81 = 0.13;
const CHECKPOINT_SECONDS_V81 = 1;
const TARGET_VIEW_MARGIN_V81 = 36;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const overlaps = (left, right) => Boolean(left && right
  && left.x < right.x + right.w
  && left.x + left.w > right.x
  && left.y < right.y + right.h
  && left.y + left.h > right.y);
const imageReady = (image) => Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);

function createImageV81(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}

export class HubGame extends HubGameV71 {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.provingGroundStateV81 = createProvingGroundSessionStateV81();
    this.provingGroundImagesV81 = new Map();
    this.provingProjectilesV81 = [];
    this.provingImpactsV81 = [];
    this.provingAimControlsV81 = new Set();
    this.provingFireCooldownV81 = 0;
    this.provingCheckpointClockV81 = 0;
    this.provingReceiptAttemptedV81 = null;
    this.provingStatusKeyV81 = '';
    this.lastHubStatusV81 = null;
    globalThis.addEventListener?.('keydown', (event) => {
      if (!this.running || event.repeat || event.code !== 'KeyR') return;
      if (!this.isProvingGroundActiveV81()) return;
      event.preventDefault?.();
      this.requestProvingGroundReloadV81();
    });
  }

  start(hubState = {}, options = {}) {
    this.provingGroundStateV81 = createProvingGroundSessionStateV81(
      hubState[PROVING_GROUND_STATE_KEY_V81]
      || hubState.provingRangeV81
    );
    this.provingProjectilesV81 = [];
    this.provingImpactsV81 = [];
    this.provingAimControlsV81.clear();
    this.provingFireCooldownV81 = 0;
    this.provingCheckpointClockV81 = 0;
    this.provingReceiptAttemptedV81 = null;
    this.provingStatusKeyV81 = '';
    this.lastHubStatusV81 = null;
    super.start(hubState, options);
    if (this.isProvingGroundActiveV81()) {
      this.ensureProvingGroundAssetsV81();
      if (this.provingGroundStateV81.phase === 'active') this.lockPlayerToFiringPadV81();
    } else if (['armed', 'active'].includes(this.provingGroundStateV81.phase)) {
      this.provingGroundStateV81 = abortProvingGroundSessionV81(this.provingGroundStateV81);
    }
    this.deliverProvingGroundReceiptV81();
    this.statusKey = '';
    this.emitStatus();
    this.draw();
  }

  isProvingGroundActiveV81() {
    return this.currentAnnexV71()?.id === PROVING_GROUND_ANNEX_ID_V81;
  }

  ensureProvingGroundAssetsV81() {
    if (!this.provingGroundImagesV81.size) {
      for (const asset of PROVING_GROUND_ASSET_LIST_V81) {
        this.provingGroundImagesV81.set(asset.runtimeId, createImageV81(asset.src));
      }
    }
    return this.provingGroundImagesV81;
  }

  activateAnnexV71(annex) {
    super.activateAnnexV71(annex);
    if (annex?.id === PROVING_GROUND_ANNEX_ID_V81) this.ensureProvingGroundAssetsV81();
  }

  deactivateAnnexV71(annex) {
    if (annex?.id === PROVING_GROUND_ANNEX_ID_V81
      && ['armed', 'active'].includes(this.provingGroundStateV81.phase)) {
      this.provingGroundStateV81 = abortProvingGroundSessionV81(this.provingGroundStateV81);
      this.provingProjectilesV81 = [];
      this.provingImpactsV81 = [];
    }
    super.deactivateAnnexV71(annex);
  }

  confirmHubPhysicalUpgradeV71(annexId = this.currentAnnexV71()?.id) {
    if (annexId === PROVING_GROUND_ANNEX_ID_V81 && this.isProvingGroundActiveV81()) {
      return {
        applied: false,
        deferred: true,
        reason: 'qualification-required-v81',
        state: clone(this.hubCommercialStateV71),
        station: clone(this.currentAnnexV71()?.station || null),
        effect: null
      };
    }
    return super.confirmHubPhysicalUpgradeV71(annexId);
  }

  armProvingGroundV81() {
    if (!this.running || !this.isProvingGroundActiveV81() || !this.nearestAnnexStationV71()) {
      return { armed: false, reason: 'station-out-of-range', state: clone(this.provingGroundStateV81) };
    }
    if (['armed', 'active'].includes(this.provingGroundStateV81.phase)) {
      return { armed: false, reason: 'session-already-live', state: clone(this.provingGroundStateV81) };
    }
    this.provingGroundStateV81 = armProvingGroundSessionV81(this.provingGroundStateV81);
    this.provingProjectilesV81 = [];
    this.provingImpactsV81 = [];
    this.provingReceiptAttemptedV81 = null;
    this.onAction({
      type: 'hub:proving-ground-armed',
      action: 'hub:proving-ground-armed',
      annexId: PROVING_GROUND_ANNEX_ID_V81,
      sessionId: this.provingGroundStateV81.sessionId,
      weaponId: this.provingGroundStateV81.weaponId,
      noMenu: true
    });
    this.audio?.ui?.();
    this.persist();
    this.statusKey = '';
    this.emitStatus();
    return { armed: true, reason: null, state: clone(this.provingGroundStateV81) };
  }

  interact() {
    if (!this.isProvingGroundActiveV81() || this.annexTransitionV71) {
      super.interact();
      return;
    }
    if (this.nearestAnnexExitV71()) {
      if (['armed', 'active'].includes(this.provingGroundStateV81.phase)) {
        this.provingGroundStateV81 = abortProvingGroundSessionV81(this.provingGroundStateV81);
        this.provingProjectilesV81 = [];
        this.provingImpactsV81 = [];
        this.persist();
      }
      super.interact();
      return;
    }
    if (this.nearestAnnexStationV71()) this.armProvingGroundV81();
  }

  statusPrompt() {
    if (!this.isProvingGroundActiveV81()) return super.statusPrompt();
    if (this.annexTransitionV71) return super.statusPrompt();
    const state = this.provingGroundStateV81;
    if (this.nearestAnnexExitV71()) {
      return ['armed', 'active'].includes(state.phase)
        ? 'E — ABANDONNER LA QUALIFICATION ET SORTIR'
        : 'E — SORTIR VERS ARMORY';
    }
    if (state.phase === 'armed') return 'REJOIGNEZ LA LIGNE DE TIR SUR LA PASSERELLE';
    if (state.phase === 'active') {
      if (state.reload.active) return `RECHARGEMENT M41A · ${state.reload.remainingSeconds.toFixed(1)} S`;
      if (state.ammo.magazine <= 0) return 'R — RECHARGER LE M41A';
      return 'F — TIRER · W/S — VISER HAUT/BAS · R — RECHARGER';
    }
    if (this.nearestAnnexStationV71()) {
      return state.phase === 'idle'
        ? 'E — ARMER LA QUALIFICATION M41A'
        : 'E — REJOUER LA QUALIFICATION M41A';
    }
    if (state.phase === 'completed') return `QUALIFIÉ · SCORE ${state.score}`;
    if (state.phase === 'failed') return `NON QUALIFIÉ · ${state.hits}/9 CIBLES`;
    if (state.phase === 'aborted') return 'QUALIFICATION ABANDONNÉE';
    return super.statusPrompt();
  }

  emitStatus() {
    const originalOnStatus = this.onStatus;
    let inheritedPayload = null;
    this.onStatus = (payload) => { inheritedPayload = payload; };
    try { super.emitStatus(); }
    finally { this.onStatus = originalOnStatus; }
    if (inheritedPayload) this.lastHubStatusV81 = inheritedPayload;
    const base = inheritedPayload || this.lastHubStatusV81;
    if (!base || !this.state || !this.player) return;
    const state = this.provingGroundStateV81 || createProvingGroundSessionStateV81();
    const targetsRemaining = state.targets.filter((target) => (
      target.status === 'queued' || target.status === 'active'
    )).length;
    const payload = {
      ...base,
      deckName: base.deckName || HUB_DECKS[this.state.deck]?.name || '',
      provingGroundActiveV81: this.isProvingGroundActiveV81(),
      provingGroundPhaseV81: state.phase,
      provingGroundScoreV81: state.score,
      provingGroundTargetsRemainingV81: targetsRemaining,
      provingGroundMagazineV81: state.ammo.magazine,
      provingGroundReserveV81: state.ammo.reserve,
      provingGroundReloadingV81: state.reload.active,
      provingGroundAimV81: this.currentProvingAimV81()
    };
    const key = JSON.stringify(payload);
    if (key === this.provingStatusKeyV81) return;
    this.provingStatusKeyV81 = key;
    originalOnStatus(payload);
  }

  setControl(control, active) {
    if (this.annexTransitionV71) return;
    if (!this.isProvingGroundActiveV81()) {
      super.setControl(control, active);
      return;
    }
    const highAim = control === 'aim-high' || control === 'aim-up';
    const lowAim = control === 'aim-low' || control === 'aim-down';
    if (highAim || lowAim) {
      const lane = highAim ? 'high' : 'low';
      active ? this.provingAimControlsV81.add(lane) : this.provingAimControlsV81.delete(lane);
      return;
    }
    if (control === 'reload') {
      if (active) this.requestProvingGroundReloadV81();
      return;
    }
    if (control === 'fire') {
      if (active) this.fire();
      return;
    }
    if (this.provingGroundStateV81.phase === 'active') {
      if (control === 'up' || control === 'down') {
        const lane = control === 'up' ? 'high' : 'low';
        active ? this.provingAimControlsV81.add(lane) : this.provingAimControlsV81.delete(lane);
      }
      return;
    }
    super.setControl(control, active);
  }

  currentProvingAimV81() {
    const high = this.provingAimControlsV81.has('high')
      || this.keys.has('KeyW') || this.keys.has('ArrowUp');
    const low = this.provingAimControlsV81.has('low')
      || this.keys.has('KeyS') || this.keys.has('ArrowDown');
    if (high === low) return 'level';
    return high ? 'high' : 'low';
  }

  requestProvingGroundReloadV81() {
    if (!this.isProvingGroundActiveV81()) return { started: false, reason: 'wrong-room' };
    const receipt = requestProvingGroundReloadV81(this.provingGroundStateV81);
    this.provingGroundStateV81 = receipt.state;
    if (receipt.started) {
      this.audio?.ui?.();
      this.onAction({
        type: 'hub:proving-ground-reload',
        action: 'hub:proving-ground-reload',
        annexId: PROVING_GROUND_ANNEX_ID_V81,
        sessionId: this.provingGroundStateV81.sessionId,
        durationSeconds: PROVING_GROUND_RELOAD_SECONDS_V81,
        noMenu: true
      });
      this.persist();
    }
    this.statusKey = '';
    this.emitStatus();
    return { ...receipt, state: clone(receipt.state) };
  }

  fire() {
    if (!this.isProvingGroundActiveV81()) return super.fire();
    if (this.provingFireCooldownV81 > 0) return false;
    const aim = this.currentProvingAimV81();
    const receipt = fireProvingGroundShotV81(this.provingGroundStateV81, aim);
    this.provingGroundStateV81 = receipt.state;
    if (!receipt.fired) {
      this.statusKey = '';
      this.emitStatus();
      return false;
    }
    const vector = getProvingGroundAimVectorV81(aim, this.player.facing);
    this.provingProjectilesV81.push({
      x: this.player.x + this.player.w / 2 + this.player.facing * 24,
      y: this.player.y + 34,
      w: 18,
      h: 5,
      vx: vector.x * PROJECTILE_SPEED_V81,
      vy: vector.y * PROJECTILE_SPEED_V81,
      life: PROJECTILE_LIFETIME_V81,
      targetId: receipt.shot.targetId,
      aim
    });
    this.player.fireClock = Math.max(Number(this.player.fireClock) || 0, 0.18);
    this.provingFireCooldownV81 = FIRE_INTERVAL_V81;
    this.audio?.shot?.();
    this.statusKey = '';
    return clone(receipt.shot);
  }

  update(delta) {
    const elapsed = clamp(delta, 0, 0.25);
    super.update(delta);
    if (!this.isProvingGroundActiveV81() || this.annexTransitionV71) return;
    this.player.fireClock = Math.max(0, Number(this.player.fireClock || 0) - elapsed);
    if (this.provingGroundStateV81.phase === 'armed' && this.playerOnFiringPadV81()) {
      this.provingGroundStateV81 = beginProvingGroundSessionV81(this.provingGroundStateV81);
      this.lockPlayerToFiringPadV81();
      this.onAction({
        type: 'hub:proving-ground-started',
        action: 'hub:proving-ground-started',
        annexId: PROVING_GROUND_ANNEX_ID_V81,
        sessionId: this.provingGroundStateV81.sessionId,
        weaponId: this.provingGroundStateV81.weaponId,
        noMenu: true
      });
      this.persist();
    }
    if (this.provingGroundStateV81.phase === 'active') {
      this.provingFireCooldownV81 = Math.max(0, this.provingFireCooldownV81 - elapsed);
      this.updateProvingCourseV81(elapsed);
      this.provingCheckpointClockV81 += elapsed;
      if (this.provingCheckpointClockV81 >= CHECKPOINT_SECONDS_V81) {
        this.provingCheckpointClockV81 %= CHECKPOINT_SECONDS_V81;
        this.persist();
      }
    }
    this.updateProvingImpactsV81(elapsed);
    if (['completed', 'failed', 'aborted'].includes(this.provingGroundStateV81.phase)) {
      this.provingAimControlsV81.clear();
    }
    this.deliverProvingGroundReceiptV81();
    this.statusKey = '';
    this.emitStatus();
  }

  updateAnnexPhysicsV71(delta) {
    if (!this.isProvingGroundActiveV81() || this.provingGroundStateV81.phase !== 'active') {
      super.updateAnnexPhysicsV71(delta);
      return;
    }
    this.animationTime += delta;
    this.lockPlayerToFiringPadV81();
    const cameraTargetX = this.provingGroundCameraTargetV81();
    this.annexCameraV71.x += (
      cameraTargetX - this.annexCameraV71.x
    ) * Math.min(1, delta * (this.reducedMotion ? 12 : 6));
    const activeTarget = getCurrentProvingGroundTargetV81(this.provingGroundStateV81);
    const target = activeTarget && getProvingGroundTargetV81(activeTarget.id);
    if (target) {
      const maximumCameraX = this.currentAnnexV71().world.width - VIEW_WIDTH;
      const minimumVisibleX = clamp(
        target.bounds.x + target.bounds.w + TARGET_VIEW_MARGIN_V81 - VIEW_WIDTH,
        0,
        maximumCameraX
      );
      const maximumVisibleX = clamp(
        target.bounds.x - TARGET_VIEW_MARGIN_V81,
        minimumVisibleX,
        maximumCameraX
      );
      this.annexCameraV71.x = clamp(this.annexCameraV71.x, minimumVisibleX, maximumVisibleX);
    }
    this.hubCommercialStateV71.annexPositionX = Math.round(this.player.x);
    this.hubCommercialStateV71.annexPositionY = Math.round(this.player.y);
    this.hubCommercialStateV71.annexClimbing = false;
  }

  provingGroundCameraTargetV81() {
    const annex = this.currentAnnexV71();
    const maximumCameraX = Math.max(0, Number(annex?.world?.width || VIEW_WIDTH) - VIEW_WIDTH);
    const playerCenterX = this.player.x + this.player.w / 2;
    const activeTarget = getCurrentProvingGroundTargetV81(this.provingGroundStateV81);
    const target = activeTarget && getProvingGroundTargetV81(activeTarget.id);
    if (!target) return clamp(playerCenterX - VIEW_WIDTH / 2, 0, maximumCameraX);
    const targetCenterX = target.bounds.x + target.bounds.w / 2;
    return clamp((playerCenterX + targetCenterX) / 2 - VIEW_WIDTH / 2, 0, maximumCameraX);
  }

  playerOnFiringPadV81() {
    if (!this.player) return false;
    const pad = PROVING_GROUND_FIRING_PAD_V81;
    const center = this.player.x + this.player.w / 2;
    return center >= pad.x && center <= pad.x + pad.w
      && Math.abs(this.player.y + this.player.h - pad.surfaceY) <= 12;
  }

  lockPlayerToFiringPadV81() {
    if (!this.player) return;
    Object.assign(this.player, {
      ...PROVING_GROUND_FIRING_PAD_V81.playerPose,
      vx: 0,
      vy: 0,
      grounded: true,
      climbing: false,
      crouching: false
    });
  }

  updateProvingCourseV81(delta) {
    const steps = Math.max(1, Math.ceil(delta / (1 / 120)));
    const stepDelta = delta / steps;
    for (let step = 0; step < steps && this.provingGroundStateV81.phase === 'active'; step += 1) {
      const targetState = getCurrentProvingGroundTargetV81(this.provingGroundStateV81);
      const target = targetState && getProvingGroundTargetV81(targetState.id);
      for (const projectile of this.provingProjectilesV81) {
        projectile.x += projectile.vx * stepDelta;
        projectile.y += projectile.vy * stepDelta;
        projectile.life -= stepDelta;
        if (!target || projectile.targetId !== target.id || projectile.hit || !overlaps(projectile, target.bounds)) continue;
        const hit = registerProvingGroundTargetHitV81(this.provingGroundStateV81, target.id);
        if (!hit.applied) continue;
        this.provingGroundStateV81 = hit.state;
        projectile.hit = true;
        this.provingImpactsV81.push({
          x: projectile.x + projectile.w / 2,
          y: projectile.y + projectile.h / 2,
          age: 0,
          duration: 0.48
        });
        this.audio?.ui?.();
      }
      this.provingProjectilesV81 = this.provingProjectilesV81.filter((projectile) => (
        !projectile.hit
        && projectile.life > 0
        && projectile.x > -100
        && projectile.x < this.currentAnnexV71().world.width + 100
        && projectile.y > -100
        && projectile.y < VIEW_HEIGHT + 100
      ));
      this.provingGroundStateV81 = tickProvingGroundSessionV81(this.provingGroundStateV81, stepDelta);
    }
    if (this.provingGroundStateV81.phase !== 'active') {
      this.provingProjectilesV81 = [];
      this.persist();
    }
  }

  updateProvingImpactsV81(delta) {
    for (const impact of this.provingImpactsV81) impact.age += delta;
    this.provingImpactsV81 = this.provingImpactsV81.filter((impact) => impact.age < impact.duration);
  }

  deliverProvingGroundReceiptV81() {
    const receipt = this.provingGroundStateV81.completionReceipt;
    if (!receipt || this.provingGroundStateV81.claimedReceiptIds.includes(receipt.id)) return false;
    if (this.provingReceiptAttemptedV81 === receipt.id) return false;
    this.provingReceiptAttemptedV81 = receipt.id;
    const accepted = this.onAction({
      type: 'hub:proving-ground-qualified',
      action: 'hub:proving-ground-qualified',
      annexId: PROVING_GROUND_ANNEX_ID_V81,
      sessionId: receipt.sessionId,
      idempotencyKey: receipt.idempotencyKey,
      receipt: clone(receipt),
      noMenu: true
    });
    if (accepted === false) return false;
    const claimed = claimProvingGroundCompletionV81(this.provingGroundStateV81, receipt.id);
    if (!claimed.applied) return false;
    this.provingGroundStateV81 = claimed.state;
    this.persist();
    return true;
  }

  persist() {
    if (!this.state || !this.player) return;
    const originalOnPersist = this.onPersist;
    let inheritedPatch = null;
    this.onPersist = (patch) => { inheritedPatch = patch; };
    try { super.persist(); }
    finally { this.onPersist = originalOnPersist; }
    originalOnPersist({
      ...(inheritedPatch || {}),
      [PROVING_GROUND_STATE_KEY_V81]: clone(this.provingGroundStateV81)
    });
  }

  getAssetReport() {
    const report = super.getAssetReport();
    const ready = [...(this.provingGroundImagesV81?.values() || [])].filter(imageReady).length;
    return {
      ...report,
      provingGroundAssetCountV81: PROVING_GROUND_ASSET_LIST_V81.length,
      provingGroundAssetsLoadedV81: this.provingGroundImagesV81?.size || 0,
      provingGroundAssetsReadyV81: ready,
      totalReadyAssetCount: (report.totalReadyAssetCount || 0) + ready
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    return {
      ...snapshot,
      provingGroundActiveV81: this.isProvingGroundActiveV81(),
      provingGroundV81: clone(this.provingGroundStateV81),
      provingProjectileCountV81: this.provingProjectilesV81.length,
      provingImpactCountV81: this.provingImpactsV81.length,
      provingAimV81: this.currentProvingAimV81(),
      provingGroundAssetsReadyV81: this.getAssetReport().provingGroundAssetsReadyV81
    };
  }

  drawAnnexGeometryV71(ctx, annex) {
    super.drawAnnexGeometryV71(ctx, annex);
    if (annex?.id !== PROVING_GROUND_ANNEX_ID_V81) return;
    this.ensureProvingGroundAssetsV81();
    const pad = PROVING_GROUND_FIRING_PAD_V81;
    ctx.save();
    ctx.fillStyle = 'rgba(185, 197, 112, .24)';
    ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
    ctx.strokeStyle = '#d7d37a';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad.x + 0.5, pad.y + 0.5, pad.w - 1, pad.h - 1);
    ctx.fillStyle = '#d7dca8';
    ctx.font = '700 11px ui-monospace, monospace';
    ctx.fillText('LIGNE M41A', pad.x + 33, pad.y + 20);
    ctx.setLineDash?.([8, 12]);
    ctx.strokeStyle = 'rgba(170, 211, 176, .22)';
    for (const lane of ['high', 'level', 'low']) {
      const vector = getProvingGroundAimVectorV81(lane);
      ctx.beginPath();
      ctx.moveTo(pad.muzzle.x, pad.muzzle.y);
      ctx.lineTo(pad.muzzle.x + vector.x * 900, pad.muzzle.y + vector.y * 900);
      ctx.stroke();
    }
    ctx.setLineDash?.([]);
    ctx.restore();
    this.drawProvingTargetsV81(ctx);
    this.drawProvingProjectilesV81(ctx);
    this.drawProvingImpactsV81(ctx);
  }

  drawAnnexPropLayerV71(ctx, annex, image) {
    if (annex?.id !== PROVING_GROUND_ANNEX_ID_V81) {
      super.drawAnnexPropLayerV71(ctx, annex, image);
      return;
    }
    this.ensureProvingGroundAssetsV81();
    const consoleImage = this.provingGroundImagesV81.get(PROVING_GROUND_ASSETS_V81.console.runtimeId);
    const station = annex.station.bounds;
    const bounds = { x: station.x + 17, y: station.y + 34, w: 148, h: 148 };
    if (imageReady(consoleImage)) ctx.drawImage(consoleImage, bounds.x, bounds.y, bounds.w, bounds.h);
    else super.drawAnnexPropLayerV71(ctx, annex, image);
    if (this.nearestAnnexStationV71()) {
      ctx.save();
      ctx.strokeStyle = '#d9ca79';
      ctx.lineWidth = 3;
      ctx.strokeRect(station.x - 6, station.y - 6, station.w + 12, station.h + 12);
      ctx.restore();
    }
  }

  drawProvingTargetsV81(ctx) {
    const image = this.provingGroundImagesV81.get(PROVING_GROUND_ASSETS_V81.target.runtimeId);
    const states = new Map(this.provingGroundStateV81.targets.map((target) => [target.id, target]));
    for (const target of PROVING_GROUND_TARGETS_V81) {
      const state = states.get(target.id);
      const status = state?.status || 'queued';
      let frame = status === 'active' ? 3 : status === 'hit' ? 5 : status === 'missed' ? 6 : 0;
      if (status === 'active') {
        const emerged = 5.5 - Number(state.exposureRemaining || 0);
        if (emerged < 0.12) frame = 1;
        else if (emerged < 0.24) frame = 2;
      }
      if (imageReady(image)) {
        const atlas = PROVING_GROUND_ASSETS_V81.target.atlas;
        const column = frame % atlas.columns;
        const row = Math.floor(frame / atlas.columns);
        ctx.drawImage(
          image,
          column * atlas.frameWidth,
          row * atlas.frameHeight,
          atlas.frameWidth,
          atlas.frameHeight,
          target.bounds.x,
          target.bounds.y,
          target.bounds.w,
          target.bounds.h
        );
      } else {
        ctx.fillStyle = status === 'active' ? '#d6d87a' : status === 'hit' ? '#8c5142' : '#39443f';
        ctx.fillRect(target.bounds.x, target.bounds.y, target.bounds.w, target.bounds.h);
      }
      if (status === 'active') {
        ctx.save();
        ctx.strokeStyle = '#f4e786';
        ctx.lineWidth = 3;
        ctx.strokeRect(target.bounds.x - 4, target.bounds.y - 4, target.bounds.w + 8, target.bounds.h + 8);
        ctx.restore();
      }
    }
  }

  drawProvingProjectilesV81(ctx) {
    ctx.save();
    ctx.fillStyle = '#f0e58a';
    ctx.shadowColor = '#f0a95b';
    ctx.shadowBlur = 8;
    for (const projectile of this.provingProjectilesV81) {
      ctx.fillRect(projectile.x, projectile.y, projectile.w, projectile.h);
    }
    ctx.restore();
  }

  drawProvingImpactsV81(ctx) {
    const image = this.provingGroundImagesV81.get(PROVING_GROUND_ASSETS_V81.impact.runtimeId);
    for (const impact of this.provingImpactsV81) {
      const progress = clamp(impact.age / impact.duration, 0, 0.999);
      const frame = Math.min(7, Math.floor(progress * 8));
      const size = 72;
      if (imageReady(image)) {
        const atlas = PROVING_GROUND_ASSETS_V81.impact.atlas;
        const column = frame % atlas.columns;
        const row = Math.floor(frame / atlas.columns);
        ctx.drawImage(
          image,
          column * atlas.frameWidth,
          row * atlas.frameHeight,
          atlas.frameWidth,
          atlas.frameHeight,
          impact.x - size / 2,
          impact.y - size / 2,
          size,
          size
        );
      } else {
        ctx.fillStyle = `rgba(242, 193, 91, ${1 - progress})`;
        ctx.fillRect(impact.x - 4, impact.y - 4, 8, 8);
      }
    }
  }

  drawAnnexHudV71(ctx) {
    if (!this.isProvingGroundActiveV81()) {
      super.drawAnnexHudV71(ctx);
      return;
    }
    const state = this.provingGroundStateV81;
    ctx.fillStyle = 'rgba(2, 8, 7, .92)';
    ctx.fillRect(18, 18, 760, 96);
    ctx.strokeStyle = '#718e76';
    ctx.strokeRect(18.5, 18.5, 760, 96);
    ctx.fillStyle = '#9adbac';
    ctx.font = '700 13px ui-monospace, monospace';
    ctx.fillText('USS TANTALUS // PROVING GROUND // QUALIFICATION M41A', 36, 41);
    ctx.fillStyle = '#e2eadf';
    ctx.font = '700 16px ui-monospace, monospace';
    ctx.fillText(`${state.phase.toUpperCase()} · CIBLES ${state.hits}/9 · SCORE ${state.score}`, 36, 68);
    ctx.fillStyle = state.ammo.magazine > 0 ? '#d4dba5' : '#e48b72';
    ctx.font = '700 13px ui-monospace, monospace';
    ctx.fillText(`M41A ${state.ammo.magazine}/${state.ammo.reserve}`, 526, 68);
    ctx.fillStyle = '#a9c9ae';
    ctx.fillText(`TEMPS ${state.remainingSeconds.toFixed(1)} S · VISÉE ${this.currentProvingAimV81().toUpperCase()}`, 36, 94);
    if (state.reload.active) {
      const progress = 1 - state.reload.remainingSeconds / state.reload.durationSeconds;
      ctx.fillStyle = '#253a2d';
      ctx.fillRect(526, 84, 220, 10);
      ctx.fillStyle = '#d4c778';
      ctx.fillRect(526, 84, 220 * clamp(progress, 0, 1), 10);
    }
    this.drawSinglePromptV71(ctx, this.statusPrompt());
  }
}
