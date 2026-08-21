import { GameEngine as ResumeGameEngine } from './game-production-resume.js';

export * from './game-production-resume.js';

const runtimeCheckpointId = /^(?:power|archive|beacon-\d{1,4})$/;

export class GameEngine extends ResumeGameEngine {
  applyResumeState(rawState) {
    const source = rawState && typeof rawState === 'object' && !Array.isArray(rawState)
      ? rawState.checkpoint
      : null;
    const checkpointId = typeof source?.id === 'string' ? source.id : '';
    if (!runtimeCheckpointId.test(checkpointId)) return super.applyResumeState(rawState);

    const previousCheckpoint = this.checkpoint;
    this.checkpoint = { ...previousCheckpoint, id: checkpointId };
    const result = super.applyResumeState(rawState);
    if (!result.applied) this.checkpoint = previousCheckpoint;
    return result;
  }
}
