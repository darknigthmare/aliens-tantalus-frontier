// V188 — runtime side of the run options: custom difficulty extras (ammo found,
// alert frequency) and the origin abilities already connected to a hook.
import { originV188 } from './run-options-v188.js';

export function withRunOptionsRuntimeV188(Base) {
  if (Base.runOptionsRuntimeV188) return Base;
  return class RunOptionsRuntimeV188 extends Base {
    static runOptionsRuntimeV188 = true;
    start(options = {}) {
      this.originV188 = originV188(options.originV188);
      const result = super.start(options);
      const tuning = this.difficultyRuntime || {};
      this.ammoFoundV188 = Number.isFinite(tuning.ammoFound) ? tuning.ammoFound : 1;
      this.alertFrequencyV188 = Number.isFinite(tuning.alertFrequency) ? tuning.alertFrequency : 1;
      if (this.alertFrequencyV188 !== 1 && Number.isFinite(this.nextFalseEchoAtV188)) {
        this.nextFalseEchoAtV188 = this.nextFalseEchoAtV188 / this.alertFrequencyV188;
      }
      return result;
    }
    // More frequent alerts shorten the gap to the next false echo and horde wave.
    advanceFalseEchoV188(now) {
      const scheduled = this.nextFalseEchoAtV188, result = super.advanceFalseEchoV188(now);
      if (this.alertFrequencyV188 !== 1 && this.nextFalseEchoAtV188 !== scheduled && this.nextFalseEchoAtV188 > now) {
        this.nextFalseEchoAtV188 = now + (this.nextFalseEchoAtV188 - now) / this.alertFrequencyV188;
      }
      // origin-13 Triangulation: a false echo is identified as soon as it appears.
      const echo = this.falseEchoV188;
      if (echo && !echo.revealed && this.originV188?.value?.falseEchoIdentified) {
        echo.revealed = true; this.pushCaption?.('environment', `Écho filtré : ${echo.source}.`);
        this.onEvent?.({ type: 'false-echo-revealed-v188', source: echo.source, origin: this.originV188.id });
      }
      return result;
    }
    defeatEnemy(enemy, owner) {
      const before = this.drops?.length ?? 0, result = super.defeatEnemy(enemy, owner);
      if (this.ammoFoundV188 !== 1 && Array.isArray(this.drops)) for (const drop of this.drops.slice(before)) {
        if (drop.type === 'ammo') drop.amount = Math.max(1, Math.round(drop.amount * this.ammoFoundV188));
      }
      return result;
    }
    // origin-18 Convoy formation: the escorted vehicle takes 10% less damage.
    damageVehicle(amount, source) {
      const factor = 1 + (this.originV188?.value?.vehicleDamage || 0);
      return super.damageVehicle(Number.isFinite(amount) ? amount * factor : amount, source);
    }
  };
}
