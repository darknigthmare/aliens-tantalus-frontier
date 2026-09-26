import { HubGame as PhysicalAnnexHub } from './hub-v71-runtime.js';
import { normalizeOpeningExerciseV89, OPENING_EXERCISE_SECONDS_V89 } from './opening-exercise-v89.js';

// Keep the V81 session authoritative. Only its simulation is suspended; the room remains physical.
export const withOpeningExerciseV89 = Base => class OpeningExerciseHubV89 extends Base {
  start(state = {}, options = {}) {
    this.openingExerciseV89 = normalizeOpeningExerciseV89(options.openingExerciseV89);
    this.exerciseRepairV89 = null;
    this.exerciseInterruptAttemptV89 = null;
    super.start(state, options);
  }
  setOpeningExerciseV89(state) {
    this.openingExerciseV89 = normalizeOpeningExerciseV89(state);
    this.exerciseRepairV89 = null;
    this.keys?.clear(); this.controls?.clear(); this.provingAimControlsV81?.clear();
    this.jumpQueued = 0;
    this.statusKey = ''; this.emitStatus();
  }
  exerciseSuspendedV89() {
    const state = this.openingExerciseV89, session = this.provingGroundStateV81;
    return !!state && state.phase !== 'complete' && this.openingV88?.phase === 'qualification'
      && this.onboardingV84?.phase === 'complete' && !this.editorPlaytest
      && this.isProvingGroundActiveV81() && session?.phase === 'active' && session.hits >= 3;
  }
  exerciseContactV89() {
    if (!this.exerciseSuspendedV89() || !this.running || !this.player?.alive || this.annexTransitionV71) return null;
    const phase = this.exercisePhaseV89();
    if (phase === 'console' && this.nearestAnnexStationV71()) return 'repair';
    if (phase === 'return' && this.playerOnFiringPadV81() && this.player.grounded) return 'resume';
    if (phase === 'pending') return 'interrupt';
    return null;
  }
  exercisePhaseV89() {
    const state = this.openingExerciseV89;
    return state?.phase !== 'complete' && state?.sessionId && state.sessionId !== this.provingGroundStateV81?.sessionId ? 'pending' : state?.phase;
  }
  submitExerciseV89(event) {
    return this.onAction({ action: `opening-exercise:${event}`, sessionId: this.provingGroundStateV81.sessionId });
  }
  updateProvingCourseV81(delta) {
    if (this.exerciseSuspendedV89()) return;
    super.updateProvingCourseV81(delta);
    if (this.exerciseSuspendedV89() && this.exerciseInterruptAttemptV89 !== this.provingGroundStateV81.sessionId) {
      this.exerciseInterruptAttemptV89 = this.provingGroundStateV81.sessionId;
      // The range makes already-fired rounds safe; spent ammunition is never refunded.
      this.provingProjectilesV81 = [];
      this.submitExerciseV89('interrupt');
    }
  }
  lockPlayerToFiringPadV81() { if (!this.exerciseSuspendedV89()) super.lockPlayerToFiringPadV81(); }
  updateAnnexPhysicsV71(delta) {
    if (this.exerciseSuspendedV89()) return PhysicalAnnexHub.prototype.updateAnnexPhysicsV71.call(this, delta);
    super.updateAnnexPhysicsV71(delta);
  }
  setControl(control, active) {
    if (this.exerciseSuspendedV89()) {
      if (['fire', 'reload', 'aim-up', 'aim-down', 'aim-high', 'aim-low'].includes(control)) return;
      return PhysicalAnnexHub.prototype.setControl.call(this, control, active);
    }
    super.setControl(control, active);
  }
  fire() { return this.exerciseSuspendedV89() ? false : super.fire(); }
  requestProvingGroundReloadV81() {
    return this.exerciseSuspendedV89() ? { started: false, reason: 'exercise-suspended' } : super.requestProvingGroundReloadV81();
  }
  interact() {
    const contact = this.exerciseContactV89();
    if (contact === 'repair') {
      if (!this.exerciseRepairV89) this.exerciseRepairV89 = { elapsed: 0, x: this.player.x, y: this.player.y, complete: false };
      return true;
    }
    if (contact) { this.submitExerciseV89(contact); return true; }
    return super.interact();
  }
  update(delta) {
    if (!this.running) return;
    super.update(delta);
    const task = this.exerciseRepairV89;
    if (!task || task.complete) return;
    if (this.exerciseContactV89() !== 'repair' || Math.abs(this.player.x - task.x) > 6 || Math.abs(this.player.y - task.y) > 6
      || ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'Space'].some(key => this.keys.has(key))) {
      this.exerciseRepairV89 = null;
      this.onAction({ action: 'opening-exercise:cancelled' }); return;
    }
    task.elapsed = Math.min(OPENING_EXERCISE_SECONDS_V89, task.elapsed + Math.max(0, Math.min(.1, Number(delta) || 0)));
    this.player.interactionClock = .2; this.statusKey = '';
    if (task.elapsed >= OPENING_EXERCISE_SECONDS_V89) {
      task.complete = true;
      if (this.submitExerciseV89('repair') !== true) this.exerciseRepairV89 = null;
    }
  }
  statusPrompt() {
    if (!this.exerciseSuspendedV89() || this.annexTransitionV71) return super.statusPrompt();
    if (this.nearestAnnexExitV71()) return 'E — ABANDONNER LA QUALIFICATION ET SORTIR';
    if (this.exerciseRepairV89) return `LIAISON · ${Math.round(this.exerciseRepairV89.elapsed / OPENING_EXERCISE_SECONDS_V89 * 100)} % · RESTEZ IMMOBILE`;
    const contact = this.exerciseContactV89();
    if (contact === 'repair') return 'E — RÉTABLIR LA LIAISON PRIORITAIRE · 3 S';
    if (contact === 'resume') return 'E — REPRENDRE LES CIBLES RESTANTES';
    if (contact === 'interrupt') return 'EXERCICE SUSPENDU · E POUR RÉESSAYER LA SAUVEGARDE';
    return this.exercisePhaseV89() === 'return' ? 'REJOIGNEZ LE PAS DE TIR EN HAUT DE L’ÉCHELLE' : 'LIAISON PERDUE · ÉCHELLE PUIS CONSOLE À GAUCHE';
  }
  drawAnnexHudV71(ctx) {
    super.drawAnnexHudV71(ctx);
    if (!this.exerciseSuspendedV89()) return;
    ctx.save(); ctx.fillStyle = 'rgba(2,8,7,.98)'; ctx.fillRect(30, 48, 475, 27);
    ctx.fillStyle = '#efd27b'; ctx.font = '700 16px ui-monospace, monospace';
    ctx.fillText(`SUSPENDU · CIBLES ${this.provingGroundStateV81.hits}/9 · CHRONO GELÉ`, 36, 68);
    ctx.restore();
  }
};
