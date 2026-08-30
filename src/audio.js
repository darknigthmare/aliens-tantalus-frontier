export class AudioDirector {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = true;
  }

  unlock() {
    if (!this.enabled) return;
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContext) return;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  tone(frequency = 220, duration = 0.08, type = 'square', volume = 0.08, glide = 0) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (glide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, frequency + glide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  shot() { this.tone(92, 0.06, 'sawtooth', 0.18, -35); }
  tracker() { this.tone(880, 0.055, 'sine', 0.12, 120); }
  vent(payload = {}) {
    const occluded = Boolean(payload.occluded);
    const distance = Math.max(0, Number(payload.distance) || 0);
    const volume = Math.max(0.025, 0.09 - Math.min(0.06, distance / 18000));
    const cue = String(payload.cue || '');
    if (cue.includes('hatch')) {
      this.tone(118, 0.14, 'square', volume, -42);
      return;
    }
    this.tone(occluded ? 72 : 96, 0.08, 'triangle', volume, -18);
    this.tone(occluded ? 54 : 68, 0.11, 'square', volume * 0.55, -8);
  }
  hit() { this.tone(55, 0.12, 'square', 0.12, -20); }
  ui() { this.tone(420, 0.035, 'square', 0.05, 40); }
  alarm() {
    this.tone(160, 0.28, 'sawtooth', 0.07, 80);
    setTimeout(() => this.tone(115, 0.24, 'sawtooth', 0.06, 45), 180);
  }
}
