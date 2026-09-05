import {
  GameEngine as ProductionCoreEngine,
  buildEnemyEncounterEligibility as buildCoreEnemyEncounterEligibility
} from './game-production-core.js';
import { withV52MissionRuntime } from './game-v52-runtime.js';
import { withV52LevelRuntime } from './game-v52-level-runtime.js';
import { withCargoBrutalRuntimeV67 } from './cargo-brutal-runtime-v67.js';
import { withNarrativeCollectablesRuntimeV68 } from './narrative-collectables-runtime-v68.js';
import { withAlphaBravoCoopRuntimeV69 } from './alpha-bravo-coop-runtime-v69.js';
import { withAlienSurvivalRuntimeV70 } from './alien-survival-runtime-v70.js';
import { captureGameplaySupportV72, restoreGameplaySupportV72 } from './gameplay-support-v72.js';

export * from './game-production-core.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const V52ProductionEngine = withV52MissionRuntime(withV52LevelRuntime(ProductionCoreEngine));
const V67ProductionEngine = withCargoBrutalRuntimeV67(V52ProductionEngine);
const V68ProductionEngine = withNarrativeCollectablesRuntimeV68(V67ProductionEngine);
const V69ProductionEngine = withAlphaBravoCoopRuntimeV69(V68ProductionEngine);
const V70ProductionEngine = withAlienSurvivalRuntimeV70(V69ProductionEngine);

export function buildEnemyEncounterEligibility(enemy = {}, context = {}) {
  const result = buildCoreEnemyEncounterEligibility(enemy, context);
  const adapted = /vacuum-adapted|cryo-adapted/i.test(String(enemy.modifier || ''));
  if (result.eligible || !adapted || !result.modifierMatch) return result;
  return Object.freeze({
    ...result,
    eligible: true,
    reasons: Object.freeze(result.reasons.filter((reason) => reason !== 'world-mismatch' && reason !== 'habitat-mismatch').concat('adaptation-override'))
  });
}

export class GameEngine extends V70ProductionEngine {
  start(options = {}) {
    const snapshot = super.start(options);
    this.canvas.focus?.({ preventScroll: true });
    return snapshot;
  }

  captureResumeState() {
    return { ...super.captureResumeState(), gameplaySupportV72: captureGameplaySupportV72(this) };
  }

  applyResumeState(rawState) {
    const result = super.applyResumeState(rawState);
    if (!result?.applied) return result;
    const supportRestoredV72 = restoreGameplaySupportV72(this, rawState?.gameplaySupportV72);
    return { ...result, supportRestoredV72 };
  }

  canPerformGameplayAction(actor = this.player) {
    return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65
      && this.mission?.state === 'active' && actor?.alive
      && (actor !== this.coop || this.coopEnabled));
  }

  // Guard the outermost runtime so keyboard, touch/UI and internal dispatch share the same contract.
  interact(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.interact(actor) : false;
  }

  fire(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.fire(actor) : false;
  }

  reload(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.reload(actor) : false;
  }

  useMedkit(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.useMedkit(actor) : false;
  }

  activateTracker(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.activateTracker(actor) : false;
  }

  toggleVehicle(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.toggleVehicle(actor) : false;
  }

  useEquipment(equipmentId, actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.useEquipment(equipmentId, actor) : false;
  }

  activateNeuroCountermeasure(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.activateNeuroCountermeasure(actor) : false;
  }

  applyCostumeRuntime() {
    if (!this.costumeRuntime?.active || !this.player) return;
    this.player.maxArmor = 100 + this.costumeRuntime.armor;
    this.player.armor = clamp(this.player.armor + this.costumeRuntime.armor, 0, this.player.maxArmor);
    this.player.costumeId = this.costumeRuntime.id;
    this.player.costumeMobility = this.costumeRuntime.mobility;
    this.player.stealthRating = this.costumeRuntime.stealth;
    this.player.factionMarking = this.costumeRuntime.faction;
  }
}
