import { HubGame as PhysicalHub } from './hub-v71-runtime.js';
import { HubGame as PlayerRenderer } from './hub-game.js';
import { CARGO_BRUTAL_SURVIVORS_SHEET_V67 } from './cargo-brutal-visuals-v67.js';
import { PORT_WORLD_V90, PORT_POSTS_V90, normalizePortMeridienV90, portPhysicalContactV90, portTaskSecondsV90, getPortMeridienObjectiveV90 } from './port-meridien-v90.js';

export const PORT_ASSETS_V90 = Object.freeze({
  far: '/assets/openai/metroidvania/colony-multiroute-far.png',
  mid: '/assets/openai/metroidvania/colony-multiroute-mid.png',
  floor: '/assets/openai/metroidvania/props/floor-segment.png',
  catwalk: '/assets/openai/metroidvania/props/overhead-catwalk.png',
  ladder: '/assets/openai/metroidvania/props/wall-ladder.png',
  crate: '/assets/openai/metroidvania/props/supply-crates.png',
  console: '/assets/openai/hub/props/sensor-console.png',
  medical: '/assets/openai/hub/props/medical-bed.png',
  door: '/assets/openai/hub/props/bulkhead-door.png',
  civilians: CARGO_BRUTAL_SURVIVORS_SHEET_V67.path
});
const ready = image => Boolean(image?.complete && image.naturalWidth);
const gateClosed = state => ['unload', 'carry', 'triage', 'power'].includes(state?.phase);
export function portGeometryV90(state) {
  return { id: 'port-meridien-quay', name: 'Le quai des vivants', parentRoomId: 'briefing',
    entranceLocalX: 112, entranceSide: 'west', entrance: { w: 90 }, world: PORT_WORLD_V90,
    platforms: [{ x: 0, y: 624, w: 2560, h: 96 }, { x: 1180, y: 432, w: 500, h: 24 }],
    ladders: [{ x: 1210, w: 44, y: 432, top: 432, bottom: 624, h: 192 }],
    colliders: [{ x: 420, y: 574, w: 100, h: 50 },
      ...(gateClosed(state) ? [{ x: 1824, y: 356, w: 82, h: 268 }] : [])] };
}

/** A dedicated ground location, sharing the proven hub locomotion and player renderer only. */
export function withPortMeridienV90(Base) {
  return class PortMeridienHubV90 extends Base {
    start(state = {}, options = {}) {
      this.portActiveV90 = false;
      this.portStartingV90 = true;
      this.portStateV90 = normalizePortMeridienV90(options.portMeridienV90);
      this.portTaskV90 = null; this.portPersistClockV90 = 0; this.portCommitBlockedV90 = false;
      try { super.start(state, options); } finally { this.portStartingV90 = false; }
      this.portActiveV90 = Boolean(!options.editorProject && options.openingV88?.phase === 'ready'
        && options.onboardingV84?.phase === 'complete' && this.portStateV90 && this.portStateV90.phase !== 'pending');
      if (!this.portActiveV90) return;
      this.portImagesV90 ||= new Map();
      for (const [key, path] of Object.entries(PORT_ASSETS_V90)) if (!this.portImagesV90.has(key)) {
        const image = new Image(); image.decoding = 'async'; image.src = path; this.portImagesV90.set(key, image);
      }
      const pose = PhysicalHub.prototype.restoreAnnexPlayerPoseV71.call(this, this.currentAnnexV71(), {
        annexPositionX: this.portStateV90.x, annexPositionY: this.portStateV90.y, annexClimbing: this.portStateV90.climbing
      });
      Object.assign(this.player, pose, { facing: this.portStateV90.facing, vx: 0, vy: 0 });
      this.annexCameraV71.x = Math.max(0, Math.min(1280, this.player.x - 640));
      this.keys.clear(); this.jumpQueued = 0; this.statusKey = ''; this.emitStatus(); this.draw();
    }
    isPortMeridienV90() { return this.portActiveV90 === true; }
    isAnnexActiveV71() { return this.isPortMeridienV90() || super.isAnnexActiveV71(); }
    currentAnnexV71() { return this.isPortMeridienV90() ? portGeometryV90(this.portStateV90) : super.currentAnnexV71(); }
    currentRoom() { return this.isPortMeridienV90() ? { id: 'port-meridien-quay', name: 'Le quai des vivants' } : super.currentRoom(); }
    portContactV90() { return this.isPortMeridienV90() && portPhysicalContactV90(this.portStateV90, this.player); }
    nearestInteraction() {
      if (!this.isPortMeridienV90()) return super.nearestInteraction();
      return this.portContactV90() ? { action: `port:${this.portStateV90.phase}`, description: PORT_POSTS_V90[this.portStateV90.phase].label } : null;
    }
    setPortMeridienV90(state) {
      this.portStateV90 = normalizePortMeridienV90(state);
      this.portTaskV90 = null; this.portCommitBlockedV90 = false;
      this.statusKey = ''; this.emitStatus(); this.draw();
    }
    capturePortMeridienV90() {
      return normalizePortMeridienV90({ ...this.portStateV90, x: this.player.x, y: this.player.y,
        facing: this.player.facing, climbing: this.player.climbing });
    }
    submitPortV90(action) {
      return this.onAction({ action: `port:${action}`, revision: this.portStateV90.revision }) === true;
    }
    persist() {
      if (this.portStartingV90) return;
      if (!this.isPortMeridienV90()) return super.persist();
      return this.submitPortV90('checkpoint');
    }
    interact() {
      if (!this.isPortMeridienV90()) return super.interact();
      if (!this.running || !this.player.alive) return false;
      if (this.portCommitBlockedV90) {
        if (!this.submitPortV90('checkpoint')) return false;
        this.portCommitBlockedV90 = false;
      }
      if (this.portStateV90.phase === 'escort' && this.portStateV90.following) {
        if (this.portStateV90.civiliansX.every((x, i) => x >= 2160 + i * 55)) return this.submitPortV90('escort');
        return false;
      }
      if (!this.portContactV90()) return false;
      if (['triage', 'power'].includes(this.portStateV90.phase)) {
        this.portTaskV90 ||= { x: this.player.x, y: this.player.y, elapsed: 0, complete: false };
        return true;
      }
      return this.submitPortV90(this.portStateV90.phase);
    }
    setControl(control, active) {
      if (this.isPortMeridienV90() && ['fire', 'reload', 'aim', 'depth'].includes(control)) return;
      return super.setControl(control, active);
    }
    fire() { return this.isPortMeridienV90() ? false : super.fire(); }
    useLift(direction, wrap = false) { return this.isPortMeridienV90() ? false : super.useLift(direction, wrap); }
    update(delta) {
      if (!this.isPortMeridienV90()) return super.update(delta);
      if (!this.running || this.portCommitBlockedV90) return;
      const elapsed = Math.max(0, Math.min(.1, Number(delta) || 0));
      PhysicalHub.prototype.updateAnnexPhysicsV71.call(this, elapsed);
      const state = this.portStateV90;
      const task = this.portTaskV90;
      if (task && !task.complete) {
        if (!this.portContactV90() || Math.abs(this.player.x - task.x) > 5 || Math.abs(this.player.y - task.y) > 5
          || ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'Space'].some(key => this.keys.has(key))) this.portTaskV90 = null;
        else {
          task.elapsed = Math.min(portTaskSecondsV90(state), task.elapsed + elapsed);
          this.player.interactionClock = .2;
          if (task.elapsed >= portTaskSecondsV90(state)) { task.complete = true; if (!this.submitPortV90(state.phase)) this.portTaskV90 = null; }
        }
      }
      if (state.phase === 'escort' && state.following) {
        // A civilian advances only within sight of the grounded player. They never teleport to the exit.
        state.civiliansX = state.civiliansX.map((x, i) => {
          const distance = this.player.x - x;
          return this.player.grounded && distance > 40 && distance < 390
            ? Math.min(2160 + i * 55, x + elapsed * (i === 0 ? 95 : 110)) : x;
        });
        if (state.civiliansX.every((x, i) => x >= 2160 + i * 55)) this.submitPortV90('escort');
      }
      this.portPersistClockV90 += elapsed;
      if (this.portPersistClockV90 >= 1) {
        this.portPersistClockV90 = 0;
        if (!this.submitPortV90('checkpoint')) this.portCommitBlockedV90 = true;
      }
      this.emitStatus();
    }
    statusPrompt() {
      if (!this.isPortMeridienV90()) return super.statusPrompt();
      if (this.portCommitBlockedV90) return 'SAUVEGARDE BLOQUÉE · E pour réessayer sans perdre le groupe';
      if (this.portTaskV90) return `IMMOBILE · ${Math.floor(this.portTaskV90.elapsed / portTaskSecondsV90(this.portStateV90) * 100)} % · bouger annule`;
      const contact = this.nearestInteraction();
      return contact ? `E · ${contact.description}` : 'A/D marcher · W/S échelle · ESPACE franchir · E utiliser';
    }
    emitStatus() {
      if (!this.isPortMeridienV90()) return super.emitStatus();
      if (!this.player) return;
      this.onStatus({ deck: this.state.deck, deckName: 'PORT-MÉRIDIEN · SOL', roomId: 'port-meridien-quay',
        roomName: 'Le quai des vivants', health: this.player.health, threats: 0, prompt: this.statusPrompt(),
        route: { source: 'QUAI CIVIL', nodeCount: 1 }, portMeridienV90: this.capturePortMeridienV90() });
    }
    getSnapshot() {
      if (!this.isPortMeridienV90()) return super.getSnapshot();
      return { running: this.running, x: this.player.x, y: this.player.y, health: this.player.health,
        roomId: 'port-meridien-quay', prompt: this.statusPrompt(), portMeridienV90: this.capturePortMeridienV90(),
        portAssetsReadyV90: [...(this.portImagesV90?.values() || [])].filter(ready).length };
    }
    draw() {
      if (!this.isPortMeridienV90()) return super.draw();
      if (!this.ctx || !this.player) return;
      const ctx = this.ctx, state = this.portStateV90, camera = this.annexCameraV71.x;
      const bitmap = (key, x, y, w, h) => { const image = this.portImagesV90?.get(key); if (ready(image)) ctx.drawImage(image, x, y, w, h); };
      ctx.save(); ctx.clearRect(0, 0, 1280, 720); ctx.fillStyle = '#071015'; ctx.fillRect(0, 0, 1280, 720);
      for (let x = -camera * .2; x < 1280; x += 1536) bitmap('far', x, 0, 1536, 720);
      ctx.save(); ctx.translate(-camera, 0);
      // Distant industrial structures are scenery, not additional traversable platforms.
      ctx.globalAlpha = .3;
      for (let x = 0; x < 2560; x += 1280) bitmap('mid', x, 0, 1280, 624);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(2,9,12,.35)'; ctx.fillRect(0, 0, 2560, 624);
      const floor = this.portImagesV90?.get('floor');
      if (ready(floor)) for (let x = 0; x < 2560; x += 240) ctx.drawImage(floor, 4, 4, floor.naturalWidth - 4, 74, x, 624, 240, 96);
      const catwalk = this.portImagesV90?.get('catwalk');
      if (ready(catwalk)) ctx.drawImage(catwalk, 40, 43, 188, 27, 1180, 432, 500, 24);
      const ladder = this.portImagesV90?.get('ladder');
      if (ready(ladder)) {
        // Reuse the approved V82 independent metal regions; the source's white openings are not ladder art.
        ctx.drawImage(ladder, 53, 4, 9, 168, 1210, 432, 6, 192);
        ctx.drawImage(ladder, 100, 4, 9, 168, 1248, 432, 6, 192);
        for (let y = 439; y < 624; y += 24) ctx.drawImage(ladder, 62, 36, 38, 4, 1216, y, 32, 4);
      }
      bitmap('crate', 420, 574, 100, 50);
      if (state.phase === 'unload') bitmap('crate', 190, 576, 60, 48);
      bitmap('medical', 705, 539, 125, 85);
      bitmap('console', 1360, 347, 80, 85);
      bitmap('console', 2270, 539, 80, 85);
      if (gateClosed(state)) bitmap('door', 1810, 356, 108, 268);
      else {
        // Keep the structural jambs when the shutter retracts, not a floating door above the lane.
        const door = this.portImagesV90?.get('door');
        if (ready(door)) {
          const w = door.naturalWidth, h = door.naturalHeight;
          ctx.drawImage(door, 0, 0, w * .16, h, 1810, 356, 17, 268);
          ctx.drawImage(door, w * .84, 0, w * .16, h, 1901, 356, 17, 268);
          ctx.drawImage(door, 0, 0, w, h * .12, 1810, 356, 108, 32);
        }
      }
      ctx.fillStyle = gateClosed(state) ? '#d7a060' : '#87e6be'; ctx.fillRect(1818, 336, 92, 8);
      const civilians = this.portImagesV90?.get('civilians');
      if (ready(civilians)) state.civiliansX.forEach((x, row) => {
        const column = row === 0 && ['unload', 'carry', 'triage'].includes(state.phase) ? 2
          : state.following && this.player.grounded && this.player.x - x > 40 && this.player.x - x < 390 ? 1 : 0;
        this.drawSheetCell(ctx, civilians, column, row, x - 55, 515, 116, 116, false, 4, 3);
      });
      PlayerRenderer.prototype.drawPlayer.call(this, ctx);
      if (state.phase === 'carry') bitmap('crate', this.player.x + (this.player.facing > 0 ? 22 : -20), this.player.y + 36, 40, 32);
      const label = (text, x, y, color = '#aac6c5') => { ctx.fillStyle = '#071015'; ctx.fillRect(x - 8, y - 17, ctx.measureText(text).width + 16, 24); ctx.fillStyle = color; ctx.fillText(text, x, y); };
      ctx.font = '700 12px ui-monospace, monospace';
      label('RAMPE · FRET', 85, 500); label('TRIAGE · HABITANTS', 675, 493);
      label('RELAIS DU SAS', 1310, 325); label('SECTEUR NORMAL ?', 2190, 490, '#e8ba77');
      const target = PORT_POSTS_V90[state.phase];
      if (target && !(state.phase === 'escort' && state.following)) {
        ctx.strokeStyle = '#f3d995'; ctx.lineWidth = 2; ctx.strokeRect(target.x - 44, target.y - 114, 88, 116);
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(2,9,12,.94)'; ctx.fillRect(18, 18, 1244, 89);
      ctx.font = '700 18px ui-monospace, monospace'; ctx.fillStyle = '#dce9dd'; ctx.fillText('PORT-MÉRIDIEN // LE QUAI DES VIVANTS', 34, 45);
      ctx.font = '600 13px ui-monospace, monospace'; ctx.fillStyle = '#edcf92';
      const objective = getPortMeridienObjectiveV90(state, { phase: 'ready' }, { phase: 'complete' }).text;
      const words = objective.split(' '); let line = '', y = 69;
      for (const word of words) { if (ctx.measureText(`${line} ${word}`).width > 1190) { ctx.fillText(line, 34, y); line = word; y += 19; } else line += `${line ? ' ' : ''}${word}`; }
      ctx.fillText(line, 34, y);
      PhysicalHub.prototype.drawSinglePromptV71.call(this, ctx, this.statusPrompt());
      ctx.restore();
    }
  };
}
