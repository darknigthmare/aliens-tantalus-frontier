// V188 — runtime of the hybrid 2D / 2.5D rooms (specs/001-salles-hybrides-2d-25d).
// One mixin over the hub chain. Outside a depth room it is inert. Inside, the
// rail physics run unchanged; this layer adds the depth coordinate z of the
// player and of the room's crew, the floor footprints, the depth-filtered
// interactions, the save field hub.depthV188 and the depth-ordered drawing.
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';
import { HUB_DECKS } from './hub-game.js';
import { getHubVehiclePlacementV136 } from './hub-prop-placements-v136.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { HUB_DEPTH_ROOMS_V188, HUB_FLOOR_Y_V188, hubDepthRoomAtV188, depthToScreenOffsetV188, depthShadeV188, stepDepthMoveV188,
  canLeaveDepthRoomV188, depthInteractionAllowedV188, npcDepthTargetV188, stepNpcDepthV188, normalizeHubDepthV188,
  depthAnnouncementV188 } from './hub-depth-rooms-v188.js';

const VERTICAL_CODES = new Set(['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown']);
const ready = image => Boolean(image?.complete && image.naturalWidth > 0);
const roomsOfDeck = deck => Object.values(HUB_DEPTH_ROOMS_V188).filter(room => room.deck === deck);
// Screen box of a standing human sprite around its physical body.
const spriteBox = actor => ({ x: actor.x - 22, y: actor.y - 34, w: actor.w + 44, h: actor.h + 36 });
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function withHubDepthRoomsV188(Base) {
  if (Base.hubDepthRoomsV188) return Base;
  return class HubDepthRoomsV188 extends Base {
    static hubDepthRoomsV188 = true;

    /** The depth room the player stands in, or null (Forge, annexes, ducts, Port-Méridien stay 2D). */
    depthRoomV188() {
      if (!this.player || !this.state || this.editorPlaytest || this.forgeSessionV141 || this.currentAnnexV71?.()
        || this.isVentActiveV62?.() || this.isPortMeridienV90?.() || this.hubTrainingV132?.active) return null;
      return hubDepthRoomAtV188(this.state.deck, this.player.x + this.player.w / 2);
    }
    onDepthFloorV188() { return !this.player.climbing && Math.abs(this.player.y + this.player.h - HUB_FLOOR_Y_V188) < 3; }

    // —— Movement ——
    update(delta) {
      const room = this.depthRoomV188();
      if (!room) {
        if (this.player) this.player.depthZ = 0;
        const result = super.update(delta); this.updateNpcDepthsV188(delta); return result;
      }
      const z0 = Number(this.player.depthZ) || 0, x0 = this.player.x + this.player.w / 2;
      const held = this.keys, back = held.has('KeyW') || held.has('ArrowUp'), front = held.has('KeyS') || held.has('ArrowDown');
      this.depthLadderGrabV188 = Math.max(0, (this.depthLadderGrabV188 || 0) - delta);
      // W/S drive the depth; they reach the ladder physics only while climbing (E grabs the ladder).
      const passVertical = this.player.climbing || this.depthLadderGrabV188 > 0;
      const filtered = passVertical ? held : new Set([...held].filter(code => !VERTICAL_CODES.has(code)));
      this.keys = filtered;
      let result;
      try { result = super.update(delta); } finally {
        if (this.keys === filtered && filtered !== held) for (const code of [...held]) if (!VERTICAL_CODES.has(code) && !filtered.has(code)) held.delete(code);
        this.keys = held;
      }
      const stillInRoom = this.depthRoomV188() === room;
      if (stillInRoom && this.player.climbing) this.player.depthZ = 0;
      else if (stillInRoom) {
        const dz = this.onDepthFloorV188() ? (back ? 1 : 0) - (front ? 1 : 0) : 0;
        const step = stepDepthMoveV188(room, { x: x0, z: z0 }, { x: this.player.x + this.player.w / 2 }, { dz, dt: delta, halfWidth: this.player.w / 2 - 6 });
        this.player.depthZ = step.z;
        if (step.x !== this.player.x + this.player.w / 2) { this.player.x = step.x - this.player.w / 2; this.player.vx = 0; }
        this.player.depthMovingV188 = dz !== 0 && step.z !== z0;
      } else if (!canLeaveDepthRoomV188(room, z0)) {
        // The bulkhead is on the rail: far from it, the room's edge holds the player back.
        this.player.x = Math.max(room.x0 + 4, Math.min(room.x1 - this.player.w - 4, this.player.x)); this.player.vx = 0;
        this.player.depthZ = z0;
      } else this.player.depthZ = 0;
      this.updateNpcDepthsV188(delta);
      return result;
    }

    updateNpcDepthsV188(delta) {
      for (const npc of this.npcs || []) {
        const room = this.state && !this.currentAnnexV71?.() ? hubDepthRoomAtV188(this.state.deck, npc.x + (npc.w || 44) / 2) : null;
        if (!room) { npc.depthZ = 0; continue; }
        const target = npcDepthTargetV188(room, npc, { moving: Math.abs(npc.vx || 0) > .1 });
        npc.depthZ = stepNpcDepthV188(room, npc, target, Math.min(.1, delta || 0));
      }
    }

    useLift(direction, wrap = false) {
      // W/S never call a lift in a depth room (owner decision 2).
      if (this.depthRoomV188() && !this.depthLiftAllowedV188) return false;
      return super.useLift(direction, wrap);
    }

    setControl(control, active) {
      if (['up', 'down'].includes(control) && this.depthRoomV188()) {
        const code = control === 'up' ? 'KeyW' : 'KeyS';
        active ? this.keys.add(code) : this.keys.delete(code); return;
      }
      return super.setControl(control, active);
    }

    // —— Interactions ——
    interactionDepthV188(room, interaction) {
      if (interaction?.id === room.dropship.actorId) return room.dropship.interactZ;
      const crewId = interaction?.crewId || interaction?.npc?.crewId;
      const npc = crewId ? (this.npcs || []).find(entry => entry.crewId === crewId) : null;
      return npc ? Number(npc.depthZ) || 0 : 0; // wall stations, doors and ladders stand on the rail
    }
    nearestInteraction() {
      const result = super.nearestInteraction(), room = this.depthRoomV188();
      if (!result || !room) return result;
      return depthInteractionAllowedV188(room, Number(this.player.depthZ) || 0, this.interactionDepthV188(room, result)) ? result : null;
    }
    /** Away from the wall, the wall's own interactions (annex doors, ship-port desk, hatches, lifts) are out of reach. */
    awayFromRailV188() {
      const room = this.depthRoomV188();
      return Boolean(room && Math.abs(Number(this.player.depthZ) || 0) > room.interactBand);
    }
    nearestParentAnnexDoorV71() { return this.awayFromRailV188() ? null : super.nearestParentAnnexDoorV71?.() ?? null; }
    prioritizedParentAnnexDoorV133() { return this.awayFromRailV188() ? null : super.prioritizedParentAnnexDoorV133?.() ?? null; }
    getCompanionInteractionV87() { return this.awayFromRailV188() ? null : super.getCompanionInteractionV87?.() ?? null; }
    nearestVent() { return this.awayFromRailV188() ? null : super.nearestVent?.() ?? null; }
    nearestLift() { return this.awayFromRailV188() ? null : super.nearestLift?.() ?? null; }
    nearestTraversalLadder() {
      const room = this.depthRoomV188();
      if (room && !this.player.climbing && Math.abs(Number(this.player.depthZ) || 0) > 6) return null; // ladders stand against the wall
      return super.nearestTraversalLadder?.() ?? null;
    }
    nearestHubNpc() {
      const npc = super.nearestHubNpc?.(), room = this.depthRoomV188();
      if (!npc || !room) return npc;
      return depthInteractionAllowedV188(room, Number(this.player.depthZ) || 0, Number(npc.depthZ) || 0) ? npc : null;
    }
    interact() {
      const room = this.depthRoomV188();
      if (room && this.onDepthFloorV188() && !this.nearestInteraction() && !this.nearestHubNpc?.()) {
        const ladder = this.nearestTraversalLadder?.();
        if (ladder && Math.abs(Number(this.player.depthZ) || 0) <= 6) {
          // E at the foot of a ladder grabs it; W/S then climb.
          this.player.depthZ = 0; this.player.vx = 0; this.depthLadderGrabV188 = .6; this.player.climbing = true;
          this.statusKey = ''; this.emitStatus?.(); return { type: 'hub:depth-ladder', ladder: ladder.id || null };
        }
        if (ladder) return null;
      }
      if (room && this.awayFromRailV188()) {
        // Out on the floor only the crew within reach and the UD-4L answer E.
        const npc = this.nearestHubNpc?.();
        if (npc && typeof this.interactWithNpc === 'function') return this.interactWithNpc(npc);
        return this.nearestInteraction() ? super.interact() : null;
      }
      return super.interact();
    }

    statusPrompt() {
      const inherited = super.statusPrompt(), lang = globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr';
      const room = this.depthRoomV188();
      if (room) {
        if (this.player.climbing) return inherited;
        if (this.awayFromRailV188() && /PUPITRE D’AMARRAGE CIVIL|ENTRER DANS/.test(inherited || '')) return '';
        const ladder = this.nearestTraversalLadder?.();
        if (ladder && !this.nearestInteraction() && !this.nearestHubNpc?.() && Math.abs(Number(this.player.depthZ) || 0) <= 6) return lang === 'en' ? 'E — GRAB THE LADDER' : 'E — S’ACCROCHER À L’ÉCHELLE';
        // The room announces itself for a few seconds after the entrance, then only real prompts remain.
        if (this.depthEnteredRoomV188 !== room.roomId) { this.depthEnteredRoomV188 = room.roomId; this.depthEnteredAtV188 = this.animationTime || 0; }
        return inherited || ((this.animationTime || 0) - (this.depthEnteredAtV188 || 0) < 5 ? depthAnnouncementV188(lang) : '');
      }
      this.depthEnteredRoomV188 = null;
      if (this.player && this.state && !this.currentAnnexV71?.()) {
        const x = this.player.x + this.player.w / 2;
        const near = roomsOfDeck(this.state.deck).find(entry => x >= entry.announceFrom && x <= entry.announceTo);
        if (near) return inherited ? `${depthAnnouncementV188(lang)} · ${inherited}` : depthAnnouncementV188(lang);
      }
      return inherited;
    }

    /** The prompt plate moves to the top while the marine walks the front lane it would cover. */
    drawSinglePromptV71(ctx, prompt) {
      const feet = this.player ? this.player.y + this.player.h + depthToScreenOffsetV188(this.player.depthZ) : 0;
      if (!prompt || !this.depthRoomV188() || feet < 650) return super.drawSinglePromptV71(ctx, prompt);
      ctx.save(); ctx.translate(0, 112 - 662);
      try { return super.drawSinglePromptV71(ctx, prompt); } finally { ctx.restore(); }
    }

    // —— Save ——
    persist() {
      const room = this.depthRoomV188();
      const depth = room ? normalizeHubDepthV188({ roomId: room.roomId, z: this.player.depthZ }) : null;
      const original = this.onPersist;
      if (typeof original !== 'function') return super.persist();
      this.onPersist = (patch, ...rest) => original.call(this, { ...patch, depthV188: depth }, ...rest);
      try { return super.persist(); } finally { this.onPersist = original; }
    }
    start(hubState = {}, ...rest) {
      const result = super.start(hubState, ...rest);
      const saved = normalizeHubDepthV188(hubState?.depthV188), room = this.depthRoomV188();
      if (this.player) this.player.depthZ = saved && room && saved.roomId === room.roomId ? saved.z : 0;
      return result;
    }

    // —— Drawing ——
    depthDrawRoomV188() {
      if (!this.state || this.editorPlaytest || this.forgeSessionV141 || this.currentAnnexV71?.() || this.isPortMeridienV90?.()) return null;
      return roomsOfDeck(this.state.deck)[0] || null;
    }
    draw() {
      const room = this.depthDrawRoomV188();
      if (!room) return super.draw();
      const actors = [this.player, ...(this.npcs || [])].filter(actor => actor && (Number(actor.depthZ) || 0) !== 0);
      const offsets = actors.map(actor => depthToScreenOffsetV188(actor.depthZ));
      actors.forEach((actor, index) => { actor.y += offsets[index]; });
      this.depthDrawV188 = { room, actors };
      try { return super.draw(); } finally {
        actors.forEach((actor, index) => { actor.y -= offsets[index]; });
        this.depthDrawV188 = null;
      }
    }
    // The UD-4L leaves the wall plane: it is drawn with the floor props, after the floor.
    ensureHubLifeAssetsV136() {
      const images = super.ensureHubLifeAssetsV136();
      if (!this.depthHideDropshipV188) return images;
      const hidden = this.depthDropshipAssetV188;
      return { get: key => key === hidden ? undefined : images.get(key), has: key => key !== hidden && images.has(key) };
    }
    drawModularHangar(ctx, room, phase) {
      const depth = this.depthDrawV188;
      if (!depth || room?.id !== depth.room.roomId) return super.drawModularHangar(ctx, room, phase);
      if (phase === 'back') {
        this.depthDropshipAssetV188 = this.depthDropshipPlacementV188(room)?.asset;
        this.depthHideDropshipV188 = true;
        try { return super.drawModularHangar(ctx, room, phase); } finally { this.depthHideDropshipV188 = false; }
      }
      this.drawDepthOcclusionsV188(ctx, room, depth);
      return super.drawModularHangar(ctx, room, phase);
    }
    drawDepthFloorV116(ctx) {
      const result = super.drawDepthFloorV116(ctx), depth = this.depthDrawV188;
      if (!depth) return result;
      const hubRoom = this.hubRoomV188(depth.room);
      if (!hubRoom) return result;
      const { x0, x1, zMin } = depth.room, bottom = HUB_FLOOR_Y_V188 - zMin;
      // Floor light falls off towards the wall; lane markings give the depth scale.
      const shade = ctx.createLinearGradient(0, HUB_FLOOR_Y_V188, 0, bottom);
      shade.addColorStop(0, `rgba(0,0,0,${depthShadeV188(depth.room, 0)})`); shade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shade; ctx.fillRect(x0, HUB_FLOOR_Y_V188, x1 - x0, bottom - HUB_FLOOR_Y_V188);
      ctx.fillStyle = 'rgba(214,176,92,.22)';
      for (const z of [-20, -40, -60]) for (let x = x0 + 24; x < x1 - 24; x += 64) ctx.fillRect(x, HUB_FLOOR_Y_V188 - z, 34, 2);
      for (const occluder of [...this.depthOccludersV188(depth.room, hubRoom)].sort((a, b) => b.z - a.z)) this.drawDepthOccluderV188(ctx, occluder);
      return result;
    }

    hubRoomV188(depthRoom) { return HUB_DECKS[depthRoom.deck]?.rooms.find(entry => entry.id === depthRoom.roomId) || null; }
    depthDropshipPlacementV188(room) {
      const entry = DROPSHIP_HANGAR_ART_V55.renderStack.find(candidate => candidate.id === HUB_DEPTH_ROOMS_V188['dropship-hangar'].dropship.actorId);
      return entry ? getHubVehiclePlacementV136(room, entry) : null;
    }
    depthOccludersV188(depthRoom, hubRoom) {
      // One list per frame: the floor pass and the occlusion pass share it.
      const frame = this.animationTime;
      if (this.depthOccluderCacheV188?.frame === frame && this.depthOccluderCacheV188.room === depthRoom) return this.depthOccluderCacheV188.list;
      const occluders = [];
      const placement = this.depthDropshipPlacementV188(hubRoom);
      if (placement) occluders.push({ kind: 'dropship', z: depthRoom.dropship.z, footprint: depthRoom.dropship.footprint, placement,
        box: { ...placement.renderBounds, y: placement.renderBounds.y + depthToScreenOffsetV188(depthRoom.dropship.z) } });
      for (const prop of depthRoom.props) occluders.push({ kind: prop.kind, z: prop.z, footprint: prop.footprint, prop,
        box: { x: prop.x, y: HUB_FLOOR_Y_V188 + depthToScreenOffsetV188(prop.z) - prop.h, w: prop.w, h: prop.h } });
      this.depthOccluderCacheV188 = { frame, room: depthRoom, list: occluders };
      return occluders;
    }
    drawDepthOccluderV188(ctx, occluder) {
      if (occluder.kind === 'dropship') {
        const { placement } = occluder, image = super.ensureHubLifeAssetsV136?.().get(placement.asset);
        if (!ready(image)) return;
        const source = placement.source, target = occluder.box;
        ctx.drawImage(resolveSpriteDrawableV134(image), source.x, source.y, source.w, source.h, target.x, target.y, target.w, target.h);
        this.hubVehiclesRenderedV136 ||= new Map(); this.hubVehiclesRenderedV136.set(placement.actorId || 'dropship-hangar-ud4l', placement);
        return;
      }
      drawDepthPropV188(ctx, occluder.prop, occluder.box);
    }
    /** Actors standing behind a floor object (nearer the wall) are covered by it; the player keeps a faint outline. */
    drawDepthOcclusionsV188(ctx, room, depth) {
      const hubRoom = this.hubRoomV188(depth.room) || room;
      const people = [this.player, ...(this.npcs || [])].filter(actor => actor && hubDepthRoomAtV188(this.state.deck, actor.x + actor.w / 2) === depth.room);
      for (const occluder of this.depthOccludersV188(depth.room, hubRoom)) {
        const behind = people.filter(actor => (Number(actor.depthZ) || 0) > occluder.footprint.z1 && overlaps(spriteBox(actor), occluder.box));
        if (!behind.length) continue;
        const front = people.filter(actor => (Number(actor.depthZ) || 0) < occluder.footprint.z0 && overlaps(spriteBox(actor), occluder.box));
        const layer = this.depthLayerV188 ||= globalThis.document?.createElement?.('canvas');
        if (!layer) continue;
        const width = Math.ceil(occluder.box.w + 4), height = Math.ceil(occluder.box.h + 4);
        if (layer.width < width || layer.height < height) { layer.width = Math.max(layer.width, width); layer.height = Math.max(layer.height, height); } // reused, never shrunk
        const g = layer.getContext('2d'); g.clearRect(0, 0, layer.width, layer.height);
        g.save(); g.translate(-occluder.box.x + 2, -occluder.box.y + 2); this.drawDepthOccluderV188(g, occluder);
        g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#000';
        g.beginPath(); for (const actor of behind) { const b = spriteBox(actor); g.rect(b.x, b.y, b.w, b.h); } g.fill();
        g.globalCompositeOperation = 'destination-out';
        for (const actor of front) { const b = spriteBox(actor); g.fillRect(b.x, b.y, b.w, b.h); }
        g.restore();
        ctx.drawImage(layer, occluder.box.x - 2, occluder.box.y - 2);
        if (behind.includes(this.player)) { // where the marine is, behind the hull or the crates
          const p = this.player; ctx.save(); ctx.strokeStyle = 'rgba(131,213,161,.55)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect?.(p.x - 4, p.y - 6, p.w + 8, p.h + 8, 10) ?? ctx.rect(p.x - 4, p.y - 6, p.w + 8, p.h + 8); ctx.stroke(); ctx.restore();
        }
      }
    }
  };
}

/** Crates and a cart drawn in primitives (placeholders, no generated image). */
export function drawDepthPropV188(ctx, prop, box) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 2, w * .55, 6, 0, 0, Math.PI * 2); ctx.fill(); // contact shadow
  if (prop.kind === 'cart') {
    ctx.fillStyle = '#2d3536'; ctx.fillRect(x, y + h - 18, w, 10); // bed
    ctx.fillStyle = '#5b6466'; ctx.fillRect(x + 4, y + h - 46, w * .45, 28); ctx.fillStyle = '#c9a54a'; ctx.fillRect(x + 4, y + h - 40, w * .45, 4); // canister
    ctx.fillStyle = '#121617'; for (const wx of [x + 10, x + w - 16]) { ctx.beginPath(); ctx.arc(wx, y + h - 4, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#3a4344'; ctx.fillRect(x + w - 6, y + h - 40, 4, 26); // handle
  } else {
    const rows = h > 70 ? 2 : 1, rowH = h / rows;
    for (let r = 0; r < rows; r++) {
      const ry = y + h - (r + 1) * rowH, inset = r * 6;
      ctx.fillStyle = r ? '#4a4434' : '#3f3a2c'; ctx.fillRect(x + inset, ry, w - inset * 2, rowH - 2);
      ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x + inset, ry, w - inset * 2, 4); // top edge light
      ctx.strokeStyle = '#1e1b14'; ctx.lineWidth = 2; ctx.strokeRect(x + inset + 3, ry + 3, w - inset * 2 - 6, rowH - 8);
      ctx.beginPath(); ctx.moveTo(x + inset + 3, ry + 3); ctx.lineTo(x + w - inset - 3, ry + rowH - 5); ctx.stroke(); // brace
      ctx.fillStyle = '#c9a54a'; ctx.font = '700 9px monospace'; ctx.fillText(r ? 'QZ' : `CARGO ${prop.id.endsWith('west') ? '07' : '12'}`, x + inset + 8, ry + rowH / 2 + 3);
    }
  }
  ctx.restore();
}
