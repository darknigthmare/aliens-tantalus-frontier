import { GameEngine as ObjectiveGameEngine } from './game-complete-core.js';

export { buildObjectiveRuntime } from './game-complete-core.js';

export class GameEngine extends ObjectiveGameEngine {
  activateTracker(player) {
    const activated = super.activateTracker(player);
    if (activated && this.objectiveRuntime?.action === 'track' && !this.objectiveState.trackedBossId) {
      this.objectiveState.trackedBossId = this.enemies.find((enemy) => enemy.isBoss && enemy.alive)?.id || null;
    }
    return activated;
  }

  missingObjectiveRequirement(options = {}) {
    const runtime = this.objectiveRuntime;
    if (runtime?.action === 'track') {
      if (this.tracker.pulses < runtime.trackerPulses) return `TRACES APEX ${this.tracker.pulses}/${runtime.trackerPulses}`;
      const target = this.enemies.find((enemy) => enemy.id === this.objectiveState.trackedBossId);
      return target?.alive ? 'MENACE ALPHA ENCORE ACTIVE' : '';
    }
    return super.missingObjectiveRequirement(options);
  }
}
