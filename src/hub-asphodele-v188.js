// V188 — runtime of the Asphodèle second hub (spec 007; bible §7.3, §42).
// One mixin over the hub chain, applied outermost in app.js. Inactive aboard
// the Tantalus. Aboard the station it owns the location, like the Port-Méridien
// quay (`hub-port-meridien-v90.js`): it reuses the proven annex physics
// (`updateAnnexPhysicsV71`), the hub player renderer, the spec 001 depth rules
// for the V2 corridors (`stepDepthMoveV188`) and the annex prompt plate. Rooms,
// doors and locks are the pure data of `asphodele-hub-v188.js`; drawings go
// through the named slots of `asphodele-hub-slots-v188.js` (primitives until art
// exists). Every state change reaches the save through `onAction` (app.js).
import { HubGame as PhysicalHub } from './hub-v71-runtime.js';
import { HubGame as PlayerRenderer } from './hub-game.js';
import { hubPlayerAppearanceSnapshotV126 } from './player-appearance-hub-v126.js';
import { currentLanguageV185 } from './i18n-v185.js';
import { stepDepthMoveV188, depthToScreenOffsetV188 } from './hub-depth-rooms-v188.js';
import { drawDepthPropV188 } from './depth-props-v188.js';
import { getAsphodeleRoomV188, asphodeleDepthRoomV188, resolveAsphodeleHubV188, normalizeAsphodeleHubV188, asphodeleDoorTargetV188,
  doorLockV188, asphodeleLockTextV188, asphodeleTextV188, ASPHODELE_DOOR_REACH_V188, ASPHODELE_STATION_REACH_V188, ASPHODELE_FLOOR_Y_V188 } from './asphodele-hub-v188.js';
import { AsphodeleHubAssetLoaderV188, drawAsphodeleWallV188, drawAsphodeleDoorV188, drawAsphodelePostV188, drawGrueV188, drawDockedVesselV188 } from './asphodele-hub-slots-v188.js';

const VERTICAL = new Set(['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown']);
const TRANSITION_SECONDS = 0.42;
const FLOOR = ASPHODELE_FLOOR_Y_V188;
const lang = () => currentLanguageV185() === 'en' ? 'en' : 'fr';
const label = pair => pair?.[lang()] || pair?.fr || '';
const VESSELS = Object.freeze({ 'docks-tantalus': 'ud4l', 'docks-echo8': 'echo8', 'docks-grue': 'crucible' });

export function withHubAsphodeleV188(Base) {
  if (Base.hubAsphodeleV188) return Base;
  return class HubAsphodeleV188 extends Base {
    static hubAsphodeleV188 = true;

    start(state = {}, options = {}) {
      this.asphActiveV188 = false; this.asphStartingV188 = true;
      this.asphTransitionV188 = null; this.asphCommitBlockedV188 = false; this.asphPersistClockV188 = 0;
      try { super.start(state, options); } finally { this.asphStartingV188 = false; }
      const view = options.asphodeleSaveViewV188 || null;
      const hub = view ? resolveAsphodeleHubV188(view) : null;
      this.asphActiveV188 = Boolean(hub && hub.location === 'station' && !options.editorProject && !this.editorPlaytest
        && !this.forgeSessionV141 && !this.isPortMeridienV90?.());
      if (!this.asphActiveV188) return;
      this.asphViewV188 = view; this.asphStateV188 = hub;
      this.asphLoaderV188 ||= new AsphodeleHubAssetLoaderV188(); this.asphLoaderV188.preload();
      this.annexCameraV71 ||= { x: 0 };
      this.placeAsphodelePlayerV188(hub.x, hub.z, hub.facing);
      this.keys.clear(); this.jumpQueued = 0; this.statusKey = ''; this.emitStatus(); this.draw();
    }
    isAsphodeleV188() { return this.asphActiveV188 === true; }
    asphRoomV188() { return getAsphodeleRoomV188(this.asphStateV188?.roomId); }
    placeAsphodelePlayerV188(x, z = 0, facing = 1) {
      const room = this.asphRoomV188();
      Object.assign(this.player, { x, y: FLOOR - this.player.h, vx: 0, vy: 0, grounded: true, climbing: false, crouching: false,
        facing: facing === -1 ? -1 : 1, depthZ: room?.kind === 'depth' ? z : 0 });
      this.annexCameraV71.x = Math.max(0, Math.min((room?.width || 1280) - 1280, this.player.x - 640));
    }
    setAsphodeleViewV188(view) {
      if (!this.isAsphodeleV188() || !view) return;
      this.asphViewV188 = view; this.asphCommitBlockedV188 = false; this.statusKey = ''; this.emitStatus(); this.draw();
    }
    isAnnexActiveV71() { return this.isAsphodeleV188() || super.isAnnexActiveV71(); }
    currentAnnexV71() {
      if (!this.isAsphodeleV188()) return super.currentAnnexV71();
      const room = this.asphRoomV188();
      return { id: room.id, name: room.name.fr, parentRoomId: 'dropship-hangar', entranceLocalX: room.doors[0].x, entranceSide: 'west',
        entrance: { w: 96 }, world: { width: room.width, height: 720, floorY: FLOOR },
        platforms: [{ x: 0, y: FLOOR, w: room.width, h: 96 }], ladders: [], colliders: [] };
    }
    currentRoom() { return this.isAsphodeleV188() ? { id: this.asphStateV188.roomId, name: this.asphRoomV188().name.fr } : super.currentRoom(); }
    depthRoomV188() { return this.isAsphodeleV188() ? asphodeleDepthRoomV188(this.asphStateV188.roomId) : super.depthRoomV188?.() ?? null; }
    captureAsphodeleV188() {
      if (!this.isAsphodeleV188()) return null;
      return normalizeAsphodeleHubV188({ ...this.asphStateV188, ...this.asphViewV188?.asphodeleHubV188 && {
        relayOnline: this.asphViewV188.asphodeleHubV188.relayOnline, kesslerTag: this.asphViewV188.asphodeleHubV188.kesslerTag,
        grue: this.asphViewV188.asphodeleHubV188.grue, contracts: this.asphViewV188.asphodeleHubV188.contracts },
        location: 'station', x: this.player.x, z: this.player.depthZ || 0, facing: this.player.facing });
    }
    submitAsphodeleV188(action, extra = {}) { return this.onAction?.({ action: `asphodele:${action}`, roomId: this.asphStateV188.roomId, ...extra }) === true; }

    // —— Contacts ——
    asphContactV188() {
      if (!this.isAsphodeleV188() || !this.player?.grounded || this.asphTransitionV188) return null;
      const room = this.asphRoomV188(), cx = this.player.x + this.player.w / 2, z = Number(this.player.depthZ) || 0;
      const found = [];
      for (const entry of room.doors) if (Math.abs(cx - entry.x) <= ASPHODELE_DOOR_REACH_V188 && Math.abs(z) <= 20) found.push({ kind: 'door', entry, distance: Math.abs(cx - entry.x) });
      for (const entry of room.posts) if (Math.abs(cx - entry.x) <= ASPHODELE_STATION_REACH_V188 && Math.abs(z - (entry.z || 0)) <= 24) found.push({ kind: 'post', entry, distance: Math.abs(cx - entry.x) });
      return found.sort((a, b) => a.distance - b.distance)[0] || null;
    }
    nearestInteraction() {
      if (!this.isAsphodeleV188()) return super.nearestInteraction();
      const contact = this.asphContactV188();
      return contact ? { action: contact.kind === 'door' ? `asphodele:door:${contact.entry.id}` : contact.entry.action, description: label(contact.entry.label) } : null;
    }
    interact() {
      if (!this.isAsphodeleV188()) return super.interact();
      if (!this.running || !this.player.alive || this.asphTransitionV188) return false;
      if (this.asphCommitBlockedV188) { if (!this.submitAsphodeleV188('checkpoint')) return false; this.asphCommitBlockedV188 = false; }
      const contact = this.asphContactV188(); if (!contact) return false;
      if (contact.kind === 'post') return this.submitAsphodeleV188(contact.entry.action.slice('asphodele:'.length), { postId: contact.entry.id });
      const target = asphodeleDoorTargetV188(this.asphViewV188, this.asphStateV188.roomId, contact.entry.id);
      if (target.shuttle) return this.submitAsphodeleV188('return', { doorId: contact.entry.id });
      if (!target.ok) { this.submitAsphodeleV188('locked', { doorId: contact.entry.id, reason: target.reason }); return false; }
      this.asphTransitionV188 = { elapsed: 0, swapped: false, target, from: contact.entry.id };
      this.keys.clear(); return true;
    }
    persist() {
      if (this.asphStartingV188) return;
      if (!this.isAsphodeleV188()) return super.persist();
      return this.submitAsphodeleV188('checkpoint');
    }
    setControl(control, active) {
      if (this.isAsphodeleV188()) {
        if (['fire', 'reload', 'aim', 'depth'].includes(control)) return;
        if (['up', 'down'].includes(control)) { const code = control === 'up' ? 'KeyW' : 'KeyS'; active ? this.keys.add(code) : this.keys.delete(code); return; }
      }
      return super.setControl(control, active);
    }
    fire() { return this.isAsphodeleV188() ? false : super.fire(); }
    useLift(direction, wrap = false) { return this.isAsphodeleV188() ? false : super.useLift(direction, wrap); }

    // —— Movement ——
    update(delta) {
      if (!this.isAsphodeleV188()) return super.update(delta);
      if (!this.running || this.asphCommitBlockedV188) return;
      const dt = Math.max(0, Math.min(.1, Number(delta) || 0));
      if (this.asphTransitionV188) return this.stepAsphodeleTransitionV188(dt);
      const depth = this.depthRoomV188(), held = this.keys;
      const back = held.has('KeyW') || held.has('ArrowUp'), front = held.has('KeyS') || held.has('ArrowDown');
      const z0 = Number(this.player.depthZ) || 0, x0 = this.player.x + this.player.w / 2;
      const commercial = this.hubCommercialStateV71; // the annex physics records its pose there: keep the Tantalus one intact
      this.hubCommercialStateV71 = { ...(commercial || {}) };
      this.keys = new Set([...held].filter(code => !VERTICAL.has(code)));
      try { PhysicalHub.prototype.updateAnnexPhysicsV71.call(this, dt); }
      finally { this.keys = held; this.hubCommercialStateV71 = commercial; }
      if (depth && Math.abs(this.player.y + this.player.h - FLOOR) < 3) {
        const dz = (back ? 1 : 0) - (front ? 1 : 0);
        const step = stepDepthMoveV188(depth, { x: x0, z: z0 }, { x: this.player.x + this.player.w / 2 }, { dz, dt, halfWidth: this.player.w / 2 - 6 });
        this.player.depthZ = step.z;
        if (step.x !== this.player.x + this.player.w / 2) { this.player.x = step.x - this.player.w / 2; this.player.vx = 0; }
      } else if (!depth) this.player.depthZ = 0;
      Object.assign(this.asphStateV188, { x: Math.round(this.player.x), z: Math.round((Number(this.player.depthZ) || 0) * 10) / 10, facing: this.player.facing });
      this.asphPersistClockV188 += dt;
      if (this.asphPersistClockV188 >= 1) {
        this.asphPersistClockV188 = 0;
        if (!this.submitAsphodeleV188('checkpoint')) this.asphCommitBlockedV188 = true;
      }
      this.emitStatus();
    }
    stepAsphodeleTransitionV188(dt) {
      const transition = this.asphTransitionV188; transition.elapsed += dt; this.animationTime += dt;
      if (!transition.swapped && transition.elapsed >= TRANSITION_SECONDS / 2) {
        transition.swapped = true;
        const { roomId, x, z } = transition.target;
        this.asphStateV188 = { ...this.asphStateV188, roomId, x, z, visited: [...new Set([...(this.asphStateV188.visited || []), roomId])] };
        this.placeAsphodelePlayerV188(x, z, this.player.facing);
        if (!this.submitAsphodeleV188('checkpoint', { doorId: transition.target.doorId })) this.asphCommitBlockedV188 = true;
      }
      if (transition.elapsed >= TRANSITION_SECONDS) this.asphTransitionV188 = null;
      this.statusKey = ''; this.emitStatus();
    }

    // —— Status ——
    statusPrompt() {
      if (!this.isAsphodeleV188()) return super.statusPrompt();
      const language = lang();
      if (this.asphCommitBlockedV188) return asphodeleTextV188('saveBlocked', language);
      if (this.asphTransitionV188) return '';
      const contact = this.asphContactV188();
      if (contact?.kind === 'post') return `E · ${label(contact.entry.label)}`;
      if (contact?.kind === 'door') {
        if (contact.entry.shuttle) return `E · ${asphodeleTextV188('returnPrompt', language)}`;
        const lock = doorLockV188(this.asphViewV188, this.asphStateV188.roomId, contact.entry.id);
        if (lock) return `${label(contact.entry.label)} · ${asphodeleLockTextV188(lock, language)}`;
        return `E · ${asphodeleTextV188('enter', language)} · ${label(contact.entry.label)}`;
      }
      return asphodeleTextV188(this.asphRoomV188().kind === 'depth' ? 'moveHint' : 'moveHintFlat', language);
    }
    emitStatus() {
      if (!this.isAsphodeleV188()) return super.emitStatus();
      if (!this.player || !this.asphStateV188) return;
      const room = this.asphRoomV188();
      this.onStatus?.({ deck: this.state?.deck, deckName: asphodeleTextV188('deck', lang()), roomId: room.id, roomName: label(room.name),
        health: this.player.health, threats: 0, prompt: this.statusPrompt(), route: { source: 'ASPHODÈLE', nodeCount: 1 }, asphodeleHubV188: this.captureAsphodeleV188() });
    }
    getSnapshot() {
      if (!this.isAsphodeleV188()) return super.getSnapshot();
      const room = this.asphRoomV188();
      return { running: this.running, x: this.player.x, y: this.player.y, z: Number(this.player.depthZ) || 0, health: this.player.health,
        playerAppearanceV126: hubPlayerAppearanceSnapshotV126(this), roomId: room.id, roomKind: room.kind, prompt: this.statusPrompt(),
        transition: Boolean(this.asphTransitionV188), asphodeleHubV188: this.captureAsphodeleV188(), slotUsage: { ...(this.asphLoaderV188?.usage || {}) },
        doors: room.doors.map(entry => ({ id: entry.id, x: entry.x, lock: entry.shuttle ? null : doorLockV188(this.asphViewV188, room.id, entry.id), shuttle: Boolean(entry.shuttle), to: entry.to })) };
    }

    // —— Drawing ——
    draw() {
      if (!this.isAsphodeleV188()) return super.draw();
      if (!this.ctx || !this.player) return;
      const ctx = this.ctx, room = this.asphRoomV188(), camera = this.annexCameraV71.x, time = this.animationTime || 0, still = Boolean(this.reducedMotion);
      const loader = this.asphLoaderV188, language = lang(), view = this.asphViewV188;
      ctx.save(); ctx.clearRect(0, 0, 1280, 720); ctx.fillStyle = '#05080a'; ctx.fillRect(0, 0, 1280, 720);
      ctx.save(); ctx.translate(-camera, 0);
      const x0 = Math.max(0, Math.floor(camera / 128) * 128), x1 = Math.min(room.width, camera + 1280 + 128);
      loader.draw(ctx, `asph-wall-${room.id.slice(5)}`, x0, 120, x1 - x0, 504, () => drawAsphodeleWallV188(ctx, room.module, x0, x1 - x0, time));
      // Floor: a deck plate in V1; in V2 the spec 001 depth band, darker near the wall, with lane marks.
      ctx.fillStyle = '#12171a'; ctx.fillRect(x0, FLOOR, x1 - x0, 96);
      if (room.kind === 'depth') {
        const shade = ctx.createLinearGradient?.(0, FLOOR, 0, FLOOR + 80);
        if (shade) { shade.addColorStop(0, 'rgba(0,0,0,.22)'); shade.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = shade; ctx.fillRect(x0, FLOOR, x1 - x0, 80); }
        ctx.fillStyle = 'rgba(214,176,92,.2)'; for (const lane of [644, 664, 684]) for (let x = x0 + 24; x < x1; x += 64) ctx.fillRect(x, lane, 34, 2);
      } else { ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let x = x0; x < x1; x += 64) ctx.fillRect(x, FLOOR + 2, 2, 94); }
      ctx.fillStyle = '#2a3236'; ctx.fillRect(x0, FLOOR - 2, x1 - x0, 4);
      // Doors on the rail: each one is drawn where its interaction is, with its real state.
      ctx.font = '700 12px ui-monospace, monospace';
      for (const entry of room.doors) {
        if (entry.x < camera - 200 || entry.x > camera + 1480) continue;
        if (VESSELS[entry.id]) loader.draw(ctx, entry.id === 'docks-grue' ? 'asph-crucible-shuttle' : 'asph-ud4l-docked', entry.x - 110, 250, 220, 130, () => drawDockedVesselV188(ctx, entry.x, VESSELS[entry.id]));
        const state = entry.shuttle ? 'shuttle' : doorLockV188(view, room.id, entry.id) ? 'locked' : 'open';
        loader.draw(ctx, 'asph-door', entry.x - 48, FLOOR - 132, 96, 132, () => drawAsphodeleDoorV188(ctx, entry.x, state, time, still));
        this.drawAsphodeleSignV188(ctx, label(entry.label), entry.x, FLOOR - 166, state === 'locked' ? '#e8a090' : '#cfe0d6');
      }
      const postSlot = { 'control-board': 'asph-qz-map', 'control-cassius': 'asph-cassius-core', 'relay-bays': 'asph-relay-bays', 'lab-archives': 'asph-cradles',
        'memorial-plaques': 'asph-memorial-plaques', 'greenhouse-bays': 'asph-hydro-bays', 'market-counter': 'asph-crucible-stall', 'ring-plan': 'asph-qz-map' };
      const postState = { cassius: view?.stationV188?.cassius || null, relayOnline: Boolean(view?.asphodeleHubV188?.relayOnline) };
      for (const entry of room.posts) {
        if (entry.npc) continue;
        loader.draw(ctx, postSlot[entry.id], entry.x - 180, 360, 360, 264, () => drawAsphodelePostV188(ctx, entry.id, entry.x, { time, still, state: postState }));
        this.drawAsphodeleSignV188(ctx, label(entry.label), entry.x, 346, '#e8d9a6');
      }
      if (room.id === 'asph-lab') drawAsphodeleCradlesV188(ctx, 520);
      // Depth-ordered pass: floor props, Grue and the marine, far (wall) first.
      const items = room.props.map(entry => ({ z: entry.z, draw: () => drawDepthPropV188(ctx, entry, { x: entry.x, y: FLOOR + depthToScreenOffsetV188(entry.z) - entry.h, w: entry.w, h: entry.h }) }));
      for (const entry of room.posts.filter(item => item.npc === 'grue')) if (!(view?.asphodeleHubV188?.grue === 'expel'))
        items.push({ z: entry.z, draw: () => loader.draw(ctx, 'asph-grue', entry.x - 26, FLOOR + depthToScreenOffsetV188(entry.z) - 92, 52, 92, () => drawGrueV188(ctx, entry.x, FLOOR + depthToScreenOffsetV188(entry.z))) });
      items.push({ z: Number(this.player.depthZ) || 0, draw: () => {
        const offset = depthToScreenOffsetV188(this.player.depthZ); this.player.y += offset;
        try { PlayerRenderer.prototype.drawPlayer.call(this, ctx); } finally { this.player.y -= offset; }
      } });
      for (const item of items.sort((a, b) => b.z - a.z)) item.draw();
      ctx.restore();
      // Title plate, in the station's own register.
      ctx.fillStyle = 'rgba(2,9,12,.92)'; ctx.fillRect(18, 18, 1244, 62);
      ctx.font = '700 18px ui-monospace, monospace'; ctx.fillStyle = '#dce9dd'; ctx.fillText(`ASPHODÈLE // ${label(room.name).toUpperCase()}`, 34, 45);
      ctx.font = '600 13px ui-monospace, monospace'; ctx.fillStyle = '#edcf92';
      ctx.fillText(language === 'en' ? `${room.view} · ${room.kind === 'depth' ? 'corridor walked in depth' : 'profile module'} · the UD-4L waits at airlock 1` : `${room.view} · ${room.kind === 'depth' ? 'couloir parcouru en profondeur' : 'module de profil'} · l’UD-4L attend au sas 1`, 34, 68);
      const feet = this.player.y + this.player.h + depthToScreenOffsetV188(this.player.depthZ);
      ctx.save(); if (feet >= 650) ctx.translate(0, 126 - 662);
      PhysicalHub.prototype.drawSinglePromptV71.call(this, ctx, this.statusPrompt());
      ctx.restore();
      if (this.asphTransitionV188) { const p = this.asphTransitionV188.elapsed / TRANSITION_SECONDS; ctx.fillStyle = `rgba(0,0,0,${Math.max(0, 1 - Math.abs(p * 2 - 1))})`; ctx.fillRect(0, 0, 1280, 720); }
      ctx.restore();
    }
    drawAsphodeleSignV188(ctx, text, cx, y, color) {
      const width = ctx.measureText?.(text)?.width || text.length * 7;
      ctx.fillStyle = 'rgba(7,16,21,.9)'; ctx.fillRect(cx - width / 2 - 8, y - 15, width + 16, 22);
      ctx.fillStyle = color; ctx.fillText(text, cx - width / 2, y);
    }
  };
}
function drawAsphodeleCradlesV188(ctx, x) {
  // Three empty QZ17 cradles (1.0 × 2.4 m, lids open) along the bench, as in CIN-11 (asph-cradles slot brief).
  for (let i = 0; i < 3; i++) { const cx = x + i * 140; ctx.fillStyle = '#26323a'; ctx.fillRect(cx, 572, 122, 52); ctx.fillStyle = '#0e1517'; ctx.fillRect(cx + 6, 580, 110, 38);
    ctx.fillStyle = '#2f3c44'; ctx.fillRect(cx + 4, 548, 60, 10); ctx.fillStyle = '#e9d07a'; ctx.font = '700 10px monospace'; ctx.fillText('QZ17', cx + 70, 568); }
}
