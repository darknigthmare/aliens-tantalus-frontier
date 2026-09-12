import { HubGame as HubGameV81, HUB_DECKS } from './hub-v81-runtime.js';
import { normalizePlayerOnboardingV84 } from './player-onboarding-v84.js';
export * from './hub-v81-runtime.js';

export const ONBOARDING_SPAWN_V84 = Object.freeze({ deck: 0, roomId: 'cryo-bay', positionX: 4560, facing: -1, visited: ['cryo-bay'] });
const POSTS = Object.freeze([
  { crewId: 'crew-10-david-8r', roomId: 'cryo-bay', x: 4290 },
  { crewId: 'crew-02-tamsin-velez', roomId: 'briefing', x: 1470 }
]);

/** Uses the actual ship geometry, doors and actors; no scene/menu teleport. */
export class HubGame extends HubGameV81 {
  start(state = {}, options = {}) {
    this.onboardingV84 = normalizePlayerOnboardingV84(options.onboardingV84);
    super.start(state, options);
    this.setPlayerIdentityV84();
  }
  setPlayerIdentityV84() {
    if (this.player && this.onboardingV84?.identity) Object.assign(this.player, {
      operatorId: this.onboardingV84.identity.id,
      name: this.onboardingV84.identity.name,
      callsign: this.onboardingV84.identity.callsign
    });
  }
  setOnboardingV84(state) {
    this.onboardingV84 = normalizePlayerOnboardingV84(state);
    this.setPlayerIdentityV84();
    if (this.state) this.npcs = this.createNpcs(this.state.deck);
    this.statusKey = '';
    this.emitStatus();
    this.draw();
  }
  onboardingActiveV84() { return !!this.onboardingV84 && this.onboardingV84.phase !== 'complete' && !this.editorPlaytest; }
  createNpcs(deck) {
    const normal = super.createNpcs(deck);
    if (!this.onboardingActiveV84()) return normal;
    // Routines can otherwise move the welcoming staff away during a reload.
    // Remove their normal instances on every deck before assigning one post.
    const result = normal.filter(npc => !POSTS.some(post => post.crewId === npc.crewId));
    if (deck !== 0) return result;
    const templates = new Map(HUB_DECKS.flatMap((_, index) => super.createNpcs(index)).map(npc => [npc.crewId, npc]));
    for (const post of POSTS) {
      const template = templates.get(post.crewId);
      if (!template) continue;
      result.push({ ...template, ...post, x: post.x, y: 624 - template.h,
        min: post.x, max: post.x, vx: 0, patrolSpeed: 0, resumeVx: 0, mobile: false,
        routinePhaseV62: 'onboarding-post', routineReasonV62: 'Relève Echo-9' });
    }
    return result;
  }
  onboardingContactV84() {
    if (!this.onboardingActiveV84() || !this.player?.alive || this.state?.deck !== 0 || this.isAnnexActiveV71()) return null;
    const phase = this.onboardingV84.phase;
    const room = this.currentRoom();
    const center = this.player.x + this.player.w / 2;
    if (phase === 'wake') return room.id === 'cryo-bay' && Math.abs(center - 4736) < 230 ? { phase, action: 'hub:onboarding-wake' } : null;
    const post = POSTS.find(entry => entry.roomId === (phase === 'medical' ? 'cryo-bay' : 'briefing'));
    if (!post || room.id !== post.roomId) return null;
    const npc = this.npcs.find(entry => entry.crewId === post.crewId && entry.alive !== false);
    if (!npc || Math.abs(center - (npc.x + npc.w / 2)) >= 118 || Math.abs(this.player.y + this.player.h - npc.y - npc.h) >= 64) return null;
    const middle = { left: Math.min(center, npc.x + npc.w / 2), right: Math.max(center, npc.x + npc.w / 2) };
    const blocked = [...(this.doorStates || []), ...(this.v51Doors || [])].some(door => (door.progress || 0) < .82 && door.x > middle.left && door.x < middle.right);
    if (blocked) return null;
    return { action: 'hub:onboarding-dialogue', phase, crewId: post.crewId, roomId: post.roomId, npc };
  }
  interact() {
    if (!this.running) return;
    const contact = this.onboardingContactV84();
    if (contact) { this.onAction(contact); return; }
    return super.interact();
  }
  update(delta) {
    if (this.onboardingActiveV84() && this.onboardingV84.phase === 'wake') {
      this.animationTime += delta;
      this.player.vx = 0;
      this.player.vy = 0;
      this.jumpQueued = 0;
      this.emitStatus();
      return;
    }
    super.update(delta);
  }
  useLift(...args) { if (this.onboardingActiveV84()) return false; return super.useLift(...args); }
  fire(...args) { if (this.onboardingActiveV84()) return false; return super.fire(...args); }
}
