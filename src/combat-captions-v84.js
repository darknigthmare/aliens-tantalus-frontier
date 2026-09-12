/** Caption scheduling uses simulation seconds: no timers, DOM or audio side
 * effects. Shots are sampled, never queued for playback after the action ends.
 * Narrative/mission/unknown channels are never discarded by combat throttling.
 */
export const WEAPON_CAPTION_INTERVAL_V84 = 4;
export const captionReadingMillisecondsV84 = (text) => Math.min(12000, Math.max(2500, String(text ?? '').length / 18 * 1000));

export class CombatCaptionDirectorV84 {
  constructor() {
    this.sequence = 0;
    this.lastTime = 0;
    this.lastWeaponAt = -Infinity;
    this.protectedUntil = 0;
  }

  offer(channel, text, seconds = 0) {
    if (text === null || text === undefined || !String(text).trim()) return null;
    const at = Number.isFinite(seconds) ? Math.max(0, seconds) : this.lastTime;
    if (at < this.lastTime) {
      // A checkpoint/time rewind must not keep a cooldown from the old timeline.
      this.lastWeaponAt = -Infinity;
      this.protectedUntil = 0;
    }
    this.lastTime = at;
    const category = String(channel || 'dialogue');
    const content = String(text);
    if (category === 'weapon') {
      if (at < this.protectedUntil || at - this.lastWeaponAt < WEAPON_CAPTION_INTERVAL_V84) return null;
      this.lastWeaponAt = at;
    } else {
      // Keep exact text and every important event. Only repetitive weapon cues
      // yield this reading window; hazards and dialogue retain their delivery.
      this.protectedUntil = Math.max(this.protectedUntil, at + captionReadingMillisecondsV84(content) / 1000);
    }
    this.sequence += 1;
    return Object.freeze({ id: `caption-v84-${this.sequence}`, channel: category, text: content, at: Math.round(at * 10) / 10 });
  }
}
