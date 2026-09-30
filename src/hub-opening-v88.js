import { HubGame as PreviousHub, HUB_DECKS } from './hub-onboarding-v84.js';
import { normalizePlayerOpeningV88, OPENING_POSTS_V88, OPENING_RELAY_SECONDS_V88 } from './player-opening-v88.js';
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';
import { HUB_WORLD, getHubDoorBounds } from './hub-game.js';
import { normalizeRefugeHubResumeV87 } from './refuge-save-v87.js';
import { withOpeningExerciseV89 } from './hub-opening-exercise-v89.js';
import { withPortMeridienV90 } from './hub-port-meridien-v90.js';
export * from './hub-onboarding-v84.js';

const overlaps = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Optional parent-ship height. Old saves and annex-local coordinates keep their own spawn rules. */
export function resolveHubResumeHeightV88(hub, value) {
  if (!Number.isFinite(value) || !hub.player || hub.editorPlaytest || hub.isAnnexActiveV71()
    || (hub.onboardingV84 && hub.onboardingV84.phase !== 'complete')) return null;
  const actor = { ...hub.player, y: value };
  if (value < 0 || value + actor.h > HUB_WORLD.floorY) return null;
  const solids = [...(hub.obstacles || []), ...(hub.v51Walls || []), ...(hub.v51Vents || []),
    ...(hub.v51Doors || []).filter(door => door.progress < .82),
    ...(hub.doorStates || []).filter(door => !door.lift && door.blocking !== false && door.progress < .82).map(getHubDoorBounds)];
  if (solids.some(item => item.collisionMode !== 'one-way-top' && overlaps(actor, item))) return null;
  const support = [...(hub.v51Platforms || []), ...(hub.obstacles || []), ...(hub.v51Walls || []),
    { x: 0, w: HUB_WORLD.width, y: HUB_WORLD.floorY }].find(item =>
    actor.x + actor.w > item.x + 4 && actor.x < item.x + item.w - 4 && Math.abs(value + actor.h - item.y) <= 1);
  // A valid airborne checkpoint resumes with gravity, not with invented grounded state or velocity.
  return { y: support ? support.y - actor.h : value, grounded: Boolean(support), vy: 0, climbing: false };
}

/** All steps use existing ship props, collision, doors and player locomotion. */
export class HubGame extends withPortMeridienV90(withOpeningExerciseV89(PreviousHub)) {
  start(state = {}, options = {}) {
    state = normalizeRefugeHubResumeV87(state);
    this.openingV88 = normalizePlayerOpeningV88(options.openingV88);
    this.openingRepairV88 = null;
    this.restoringHubPoseV88 = true;
    try { super.start(state, options); } finally { this.restoringHubPoseV88 = false; }
    const pose = resolveHubResumeHeightV88(this, state.positionY);
    if (pose) { Object.assign(this.player, pose); this.statusKey = ''; this.emitStatus(); this.draw(); }
  }
  setOpeningV88(state) {
    this.openingV88 = normalizePlayerOpeningV88(state);
    if (this.openingV88?.phase !== 'relay') this.openingRepairV88 = null;
    this.statusKey = ''; this.emitStatus(); this.draw();
  }
  openingContactV88() {
    if (!this.openingV88 || this.onboardingV84?.phase !== 'complete' || !this.player?.alive
      || this.editorPlaytest || this.isAnnexActiveV71() || this.state?.activeCrisis) return null;
    const post = OPENING_POSTS_V88[this.openingV88.phase];
    if (!post || post.deck !== this.state?.deck) return null;
    const room = HUB_DECKS[post.deck].rooms.find(entry => entry.id === post.roomId);
    const bounds = post.roomId === 'dropship-hangar'
      ? { ...DROPSHIP_HANGAR_ART_V55.controlBooth.interactionBounds, x: room.xStart + DROPSHIP_HANGAR_ART_V55.controlBooth.interactionBounds.x }
      : room.propInteractionBounds;
    if (this.currentRoom().id !== post.roomId || !overlaps(this.player, bounds)) return null;
    const center = this.player.x + this.player.w / 2;
    if ([...(this.doorStates || []), ...(this.v51Doors || [])].some(door => (door.progress || 0) < .82
      && door.x > Math.min(center, room.x) && door.x < Math.max(center, room.x))) return null;
    return { id: `opening-${this.openingV88.phase}`, action: `opening:${this.openingV88.phase}`,
      phase: this.openingV88.phase, roomId: post.roomId, deck: post.deck,
      description: this.openingRepairV88 ? `RELAIS · ${Math.round(this.openingRepairV88.elapsed / OPENING_RELAY_SECONDS_V88 * 100)} % · IMMOBILE` : post.label,
      interactionPriority: 110, interactionBounds: bounds };
  }
  nearestInteraction() { return this.openingContactV88() || super.nearestInteraction(); }
  interact() {
    if (!this.running) return;
    const contact = this.openingContactV88();
    if (!contact) return super.interact();
    if (contact.phase === 'relay') {
      if (!this.openingRepairV88) this.openingRepairV88 = { elapsed: 0, x: this.player.x, y: this.player.y, complete: false };
      return true;
    }
    this.onAction(contact);
    return true;
  }
  update(delta) {
    if (!this.running) return;
    super.update(delta);
    const task = this.openingRepairV88;
    if (!task || task.complete) return;
    if (!this.openingContactV88() || Math.abs(this.player.x - task.x) > 6 || Math.abs(this.player.y - task.y) > 6
      || ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'Space'].some(key => this.keys.has(key))) {
      this.openingRepairV88 = null;
      this.onAction({ action: 'opening:repair-cancelled' });
      return;
    }
    task.elapsed = Math.min(OPENING_RELAY_SECONDS_V88, task.elapsed + Math.max(0, Math.min(.1, Number(delta) || 0)));
    this.player.interactionClock = .2;
    this.statusKey = '';
    if (task.elapsed >= OPENING_RELAY_SECONDS_V88) {
      task.complete = true;
      this.onAction({ ...this.openingContactV88(), action: 'opening:relay' });
    }
  }
}
