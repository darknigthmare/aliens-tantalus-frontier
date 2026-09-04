import {
  GameEngine as ProductionCoreEngine,
  buildEnemyEncounterEligibility as buildCoreEnemyEncounterEligibility
} from './game-production-core.js';
import { withV52MissionRuntime } from './game-v52-runtime.js';
import { withV52LevelRuntime } from './game-v52-level-runtime.js';
import { withCargoBrutalRuntimeV67 } from './cargo-brutal-runtime-v67.js';
import { withNarrativeCollectablesRuntimeV68 } from './narrative-collectables-runtime-v68.js';

export * from './game-production-core.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const V52ProductionEngine = withV52MissionRuntime(withV52LevelRuntime(ProductionCoreEngine));
const V67ProductionEngine = withCargoBrutalRuntimeV67(V52ProductionEngine);
const V68ProductionEngine = withNarrativeCollectablesRuntimeV68(V67ProductionEngine);

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

export class GameEngine extends V68ProductionEngine {
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
