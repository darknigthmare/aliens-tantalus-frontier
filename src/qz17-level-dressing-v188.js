// V188 — QZ-17 level dressing (Acte I, « La cargaison fantôme »). A coherence overlay applied
// only to the campaign special-narrative-qz17: the shared ship template (mission-levels-v52.js)
// and the other missions built from it are left untouched.
//
// Scale (project adaptation, docs fact sheet): 1 m ≈ 51 px. A 10-ft ISO container seen from its
// side is 2.99 × 2.59 m ≈ 150 × 132 px. Everything here is drawn in Canvas primitives
// (placeholders): no generated image, no claim of 1:1 fidelity to the franchise.
//
// What the overlay does, once the level is built:
// - the lower cargo deck (depth section, mission-depth-v188.js) holds the QZ17 series: a sealed
//   10-ft container (QZ17-01), a pallet of loose crates and the empty lashed bay of QZ17-04, the
//   "ghost cargo", under an overhead gantry crane; QZ17-02 and QZ17-03 are stacked on the service deck;
// - the wall of the hold is cleared: the data slate and the ammunition crate leave the back-wall
//   doorway, the rail crates cover gives way to the depth objects, the decompression strip stops
//   at the cargo bulkhead it closes;
// - dormant stalkers of the hold wait behind the rows instead of stacking on one spot;
// - CIN-11: the frosted transport cradle, opened from inside, stands in the maintenance alcove
//   where the maintenance duct comes out (ship-airlock-wall-exit). The alcove stays shut unless
//   the maintenance route was chosen;
// - « Quatre accès. Aucun ne répond. » (CIN-10): a docking-tube board lists the four accesses that
//   exist in the level (pressurised spine, service ladder, hull lift, maintenance duct).

import { drawDepthPropV188 } from './depth-props-v188.js';

export const QZ17_CAMPAIGN_ID_DRESSING_V188 = 'special-narrative-qz17';
export const QZ17_PX_PER_METRE_V188 = 51;
/** [PROPOSÉ] sizes, in px, derived from the 51 px/m scale. */
export const QZ17_SIZES_V188 = Object.freeze({
  container10ft: Object.freeze({ w: 150, h: 132 }), // 2.99 × 2.59 m (ISO 668, 10 ft), side-on
  pallet: Object.freeze({ w: 61, h: 46 }), // 1.2 m pallet, crates 0.9 m high
  cradle: Object.freeze({ w: 122, h: 61 }), // refrigerated transport cradle 2.4 × 1.2 m [PROPOSÉ]
  alcove: Object.freeze({ w: 160, h: 132 }) // maintenance alcove, a bulkhead door high
});
/** Depth lanes of the hold, in z units (0 = back wall, -80 = front edge). */
export const QZ17_HOLD_LANES_V188 = Object.freeze({ wallLane: 36, minimumGapPx: QZ17_PX_PER_METRE_V188 });

const SERIES = Object.freeze(['QZ17-01', 'QZ17-02', 'QZ17-03']);
export const QZ17_SEALED_CONTAINERS_V188 = SERIES; // three sealed in the hold; QZ17-04 is the missing one
export const QZ17_GHOST_CARGO_ID_V188 = 'QZ17-04';

/**
 * The hold layout from the depth section bounds (x0 = dock bulkhead, x1 = cargo bulkhead).
 * Measured on the generated level: a closed bulkhead is drawn 157 px wide, so the frames reach
 * x0 + 57 and x1 - 57. Kept clear in front: the service-duct mouth (x0 + 151 … x0 + 235) and the
 * back-wall doorway (x0 + 237 … x0 + 313). Only one 10-ft container fits beside them; a pallet,
 * drawn below the wall base line, hides nothing.
 */
export const QZ17_DOOR_FRAME_REACH_V188 = 57;
export function qz17HoldLayoutV188(x0, x1) {
  const { container10ft: box, pallet } = QZ17_SIZES_V188, frame = QZ17_DOOR_FRAME_REACH_V188;
  return Object.freeze({
    // id, kind, x, w, h, draw z, footprint z0..z1
    blocking: Object.freeze([
      Object.freeze({ id: 'qz17-pallet', kind: 'pallet', x: x0 + frame + 16, w: pallet.w, h: pallet.h, z: -52, z0: -62, z1: -42 }),
      Object.freeze({ id: 'qz17-container-east', kind: 'container', x: x1 - frame - box.w, w: box.w, h: box.h, z: -62, z0: -90, z1: -36, stack: 1, labels: Object.freeze([SERIES[0]]) })
    ]),
    // The empty bay of QZ17-04: a floor marking with torn lashings, nothing to bump into.
    bay: Object.freeze({ id: 'qz17-bay-04', kind: 'bay', x: x0 + 157, w: box.w, z0: -90, z1: -36, label: QZ17_GHOST_CARGO_ID_V188 }),
    // The two other sealed containers, stacked against the back wall of the service deck (a 2D section):
    // background dressing behind the rail, clear of the service doorway (x0 + 245); 2 × 132 px under the hull deck.
    service: Object.freeze({ id: 'qz17-stack-service', kind: 'container', x: x0 + 10, w: box.w, h: box.h * 2, stack: 2, labels: Object.freeze([SERIES[1], SERIES[2]]) }),
    // Wall-side pickups, out of the doorway and in front of no container.
    wall: Object.freeze({ evidenceX: x0 + 315, ammoX: x0 + frame + 18 }),
    gantry: Object.freeze({ x0, x1, trolleyX: x0 + 157 + box.w / 2 })
  });
}

export const QZ17_ACCESS_POINTS_V188 = Object.freeze([
  Object.freeze({ id: 'spine', kind: 'door', ref: 'dock-bulkhead', fr: 'SAS PRINCIPAL · SOUTES', en: 'MAIN AIRLOCK · HOLDS' }),
  Object.freeze({ id: 'service', kind: 'ladder', ref: 'ship-e08', fr: 'ÉCHELLE DE SERVICE', en: 'SERVICE LADDER' }),
  Object.freeze({ id: 'hull', kind: 'lift', ref: 'ship-e14', fr: 'ASCENSEUR DE COQUE', en: 'HULL LIFT' }),
  Object.freeze({ id: 'maintenance', kind: 'vent', ref: 'ship-command-depth-entrance', fr: 'CONDUIT DE MAINTENANCE', en: 'MAINTENANCE DUCT' })
]);
export const QZ17_CRADLE_EXIT_VENT_V188 = 'ship-airlock-wall-exit';
const HOLD_SLEEPER_SPAWN = 'ship-cargo-stalkers';
const isEnglish = () => globalThis.document?.documentElement?.lang === 'en';
const list = value => Array.isArray(value) ? value : [];
/** Castes whose behaviour is not adapted to the depth section (spec 002, edge cases). */
export const unfitForHoldV188 = enemy => Boolean(enemy?.isBoss || (Number(enemy?.w) || 0) > 120 || /queen|crusher|praetorian|titan/i.test(String(enemy?.id || '')));

export function withQz17LevelDressingV188(Base) {
  if (Base.qz17LevelDressingV188) return Base;
  return class Qz17LevelDressingV188 extends Base {
    static qz17LevelDressingV188 = true;

    start(options = {}) {
      // Set before the level is built: the evidence placement below runs inside super.start().
      this.qz17DressingActiveV188 = options.campaign?.id === QZ17_CAMPAIGN_ID_DRESSING_V188;
      const result = super.start(options);
      this.qz17DressingV188 = this.qz17DressingActiveV188 ? this.applyQz17DressingV188() : null;
      return result;
    }

    qz17HoldBoundsFromLevelV188() {
      const doors = list(this.doors), dock = doors.find(door => door.id === 'dock-bulkhead'), cargo = doors.find(door => door.id === 'cargo-bulkhead');
      const decks = list(this.platforms).filter(entry => entry.zoneId === 'ship-cargo' && Number.isFinite(entry.y));
      if (!dock || !cargo || !decks.length) return null;
      return { x0: dock.x + dock.w, x1: cargo.x, floorY: Math.max(...decks.map(entry => entry.y)) };
    }

    // The QZ-17 data slate leaves the back-wall doorway (same deck surface, see validateNarrativeCollectablePlacementV68).
    buildNarrativeCollectableActorV68(spec, collected) {
      const actor = super.buildNarrativeCollectableActorV68(spec, collected);
      if (!this.qz17DressingActiveV188 || spec?.id !== 'qz17-email-logistics-denial') return actor;
      const bounds = this.qz17HoldBoundsFromLevelV188(), surface = list(this.platforms).find(entry => entry.id === actor.surfacePlatformIdV68);
      if (!bounds || !surface) return actor;
      const x = qz17HoldLayoutV188(bounds.x0, bounds.x1).wall.evidenceX;
      if (x >= surface.x && x + actor.w <= surface.x + surface.w) actor.x = x;
      return actor;
    }

    applyQz17DressingV188() {
      const bounds = this.qz17HoldBoundsFromLevelV188();
      if (!bounds || !(bounds.x1 - bounds.x0 > 500)) return null;
      const layout = qz17HoldLayoutV188(bounds.x0, bounds.x1), inHold = entity => entity && entity.x >= bounds.x0 - 1 && entity.x + (entity.w || 0) <= bounds.x1 + 1;
      // The ammunition crate stood in the back-wall doorway.
      const ammo = list(this.supplies).find(supply => supply.zoneId === 'ship-cargo' && inHold(supply) && Math.abs(supply.y + supply.h - bounds.floorY) < 2);
      if (ammo) ammo.x = layout.wall.ammoX;
      // The rail crates cover of the hold gives way to the depth objects (containers and pallet stop salvos in their band).
      const removedCovers = list(this.covers).filter(cover => cover.zoneId === 'ship-cargo' && inHold(cover) && Math.abs(cover.y + cover.h - bounds.floorY) < 2);
      if (removedCovers.length) this.covers = list(this.covers).filter(cover => !removedCovers.includes(cover));
      // The decompression strip stays inside the hold: the cargo bulkhead it closes is its edge.
      const vacuum = list(this.hazards).find(hazard => hazard.kind === 'vacuum' && hazard.zoneId === 'ship-cargo');
      if (vacuum && vacuum.x < bounds.x1 && vacuum.x + vacuum.w > bounds.x1) vacuum.w = Math.max(40, bounds.x1 - vacuum.x);
      // Castes not adapted to depth wait on the service deck instead of the hold.
      const service = list(this.platforms).find(entry => entry.id === 'node-platform-ship-service');
      for (const enemy of list(this.enemies)) {
        if (enemy.levelSpawnId !== HOLD_SLEEPER_SPAWN || !unfitForHoldV188(enemy) || Math.abs(enemy.y + enemy.h - bounds.floorY) > 2 || !service) continue;
        enemy.x = Math.round(service.x + service.w / 2 - enemy.w / 2); enemy.y = service.y - enemy.h; enemy.groundY = service.y; enemy.spawnX = enemy.x;
        this.initializeEnemyMissionNavigation?.(enemy);
      }
      const exit = list(this.vents).find(vent => vent.id === QZ17_CRADLE_EXIT_VENT_V188);
      const cradle = exit ? Object.freeze({ x: exit.x + exit.w + 12, floorY: exit.y + exit.h, ...QZ17_SIZES_V188.alcove }) : null;
      const dock = list(this.doors).find(door => door.id === 'dock-bulkhead');
      const serviceDeck = list(this.platforms).find(entry => entry.id === 'node-platform-ship-service');
      const board = dock ? Object.freeze({ x: Math.max(40, dock.x - 640), y: dock.y - 84, w: 196, h: 104 }) : null;
      return Object.freeze({ bounds, layout, ammoId: ammo?.id || null, removedCoverIds: Object.freeze(removedCovers.map(cover => cover.id)),
        vacuumId: vacuum?.id || null, cradle, board, serviceDeckY: serviceDeck?.y ?? null });
    }

    /** Hold sleepers wait behind the rows, not stacked on one spot (called once the depth section exists). */
    placeQz17HoldSleepersV188(section) {
      if (!this.qz17DressingV188 || !section) return [];
      const east = section.containers.find(entry => entry.id === 'qz17-container-east'), bay = this.qz17DressingV188.layout.bay;
      const vent = list(this.vents).find(entry => entry.id === 'ship-service-wall-entrance' && entry.x >= section.x0 && entry.x <= section.x1);
      const slots = [
        east && { x: east.x + east.w / 2, z: -12 }, // behind QZ17-01, hidden by it
        { x: bay.x + bay.w / 2, z: -70 }, // in the empty QZ17-04 bay
        vent && { x: vent.x + vent.w / 2, z: -4 } // in the duct mouth
      ].filter(Boolean);
      const sleepers = list(this.enemies).filter(enemy => enemy.levelSpawnId === HOLD_SLEEPER_SPAWN && enemy.dormant
        && Math.abs(enemy.y + enemy.h - section.floorY) < 2 && enemy.x + enemy.w / 2 >= section.x0 && enemy.x + enemy.w / 2 <= section.x1);
      sleepers.forEach((enemy, index) => {
        const slot = slots[index % slots.length], shift = Math.floor(index / slots.length) * 30;
        enemy.x = Math.round(Math.max(section.x0 + 2, Math.min(section.x1 - enemy.w - 2, slot.x - enemy.w / 2 + shift)));
        enemy.spawnX = enemy.x; enemy.depthZ = slot.z;
        this.initializeEnemyMissionNavigation?.(enemy);
      });
      return sleepers;
    }

    // M / pause panel: the campaign record keeps its English objective key; the player reads the chapter goal.
    objectivePanelContentV188(language = 'fr') {
      const inherited = super.objectivePanelContentV188?.(language) || null;
      if (!this.qz17DressingActiveV188) return inherited;
      return { ...(inherited || {}), campaignObjective: language === 'en'
        ? 'Investigate the ghost cargo: four pieces of evidence, a route verdict, then extraction.'
        : 'Enquêter sur la cargaison fantôme : quatre preuves, un verdict d’itinéraire, puis l’extraction.' };
    }

    qz17MaintenanceRouteOpenV188() {
      const route = this.narrativeCollectablesV68?.route;
      return Boolean(route?.applied && route.choiceId === 'follow-maintenance-trace');
    }

    // Background layer: drawn before covers, doors and actors.
    drawWorld(ctx) {
      const dressing = this.qz17DressingV188;
      if (dressing && ctx) {
        ctx.save();
        try {
          drawQz17GantryV188(ctx, dressing.layout.gantry, dressing.bounds);
          const box = dressing.layout.service;
          if (Number.isFinite(dressing.serviceDeckY)) drawDepthPropV188(ctx, box, { x: box.x, y: dressing.serviceDeckY - box.h, w: box.w, h: box.h });
          if (dressing.board) drawQz17AccessBoardV188(ctx, dressing.board, isEnglish());
          if (dressing.cradle) drawQz17CradleAlcoveV188(ctx, dressing.cradle, this.qz17MaintenanceRouteOpenV188(), isEnglish());
        } finally { ctx.restore(); }
      }
      return super.drawWorld(ctx);
    }
  };
}

/** Overhead bridge crane under the service deck: rail, trolley over the empty bay, hook and torn sling. */
export function drawQz17GantryV188(ctx, gantry, bounds) {
  const railY = bounds.floorY - 334; // just under the service deck (floor 504 + 22 deck + 8 px)
  ctx.fillStyle = '#2b3135'; ctx.fillRect(gantry.x0, railY, gantry.x1 - gantry.x0, 12);
  ctx.fillStyle = '#d0a63f'; for (let x = gantry.x0 + 6; x < gantry.x1 - 12; x += 28) ctx.fillRect(x, railY + 12, 14, 3); // hazard striping
  const tx = gantry.trolleyX;
  ctx.fillStyle = '#3d454a'; ctx.fillRect(tx - 26, railY + 12, 52, 16);
  ctx.fillStyle = '#151a1c'; ctx.fillRect(tx - 2, railY + 28, 4, 150); // cable
  ctx.fillStyle = '#c99a2e'; ctx.fillRect(tx - 9, railY + 176, 18, 14); // hook block
  ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tx, railY + 196, 7, 0, Math.PI); ctx.stroke();
  ctx.strokeStyle = '#d06b2a'; ctx.lineWidth = 4; ctx.beginPath(); // a sling still hooked, its two legs cut
  ctx.moveTo(tx - 4, railY + 200); ctx.lineTo(tx - 22, railY + 236); ctx.moveTo(tx + 4, railY + 200); ctx.lineTo(tx + 18, railY + 228); ctx.stroke();
}

/** Docking-tube board, CIN-10: four accesses, none answering. */
export function drawQz17AccessBoardV188(ctx, board, english = false) {
  const { x, y, w, h } = board;
  ctx.fillStyle = '#0b1210'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#5d6f62'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.font = '700 9px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#c9d6c4';
  ctx.fillText(english ? 'QZ17 · ACCESS STATUS' : 'QZ17 · ÉTAT DES ACCÈS', x + 8, y + 14);
  QZ17_ACCESS_POINTS_V188.forEach((access, index) => {
    const ly = y + 30 + index * 14;
    ctx.fillStyle = '#b8332b'; ctx.fillRect(x + 8, ly - 7, 7, 7); // no answer
    ctx.fillStyle = '#9fb3a2'; ctx.fillText(`${index + 1} ${english ? access.en : access.fr}`, x + 20, ly);
  });
  ctx.fillStyle = '#d65a4c'; ctx.fillText(english ? 'NONE ANSWERING' : 'AUCUN NE RÉPOND', x + 8, y + h - 6);
}

/** CIN-11: the maintenance alcove; the cradle is frosted, its lid forced from inside, restraints torn. */
export function drawQz17CradleAlcoveV188(ctx, alcove, open, english = false) {
  const { x, w, h, floorY } = alcove, y = floorY - h;
  ctx.fillStyle = '#0d1416'; ctx.fillRect(x, y, w, h); // recess
  ctx.strokeStyle = '#3b4a4f'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, w - 4, h - 2);
  ctx.font = '700 9px monospace'; ctx.textAlign = 'center';
  if (!open) { // shutter down: the alcove belongs to the maintenance route
    ctx.fillStyle = '#2a3236'; ctx.fillRect(x + 6, y + 6, w - 12, h - 6);
    ctx.fillStyle = '#1c2225'; for (let sy = y + 14; sy < floorY - 4; sy += 10) ctx.fillRect(x + 6, sy, w - 12, 3);
    ctx.fillStyle = '#d0a63f'; ctx.fillRect(x + 20, y + h / 2 - 9, w - 40, 16);
    ctx.fillStyle = '#111'; ctx.fillText(english ? 'MAINTENANCE · SEALED' : 'MAINTENANCE · SCELLÉ', x + w / 2, y + h / 2 + 3);
    ctx.textAlign = 'left'; return;
  }
  const c = QZ17_SIZES_V188.cradle, cx = x + (w - c.w) / 2, cy = floorY - c.h;
  ctx.fillStyle = 'rgba(170,215,235,.10)'; ctx.fillRect(x + 6, y + 6, w - 12, h - 6); // cold light
  ctx.fillStyle = '#3c474c'; ctx.fillRect(cx, cy + 14, c.w, c.h - 14); // tub
  ctx.fillStyle = '#2a3236'; ctx.fillRect(cx + 4, floorY - 8, 10, 8); ctx.fillRect(cx + c.w - 14, floorY - 8, 10, 8); // skids
  ctx.fillStyle = '#cfe7f2'; for (let i = 0; i < 9; i++) ctx.fillRect(cx + 6 + i * 13, cy + 16 + (i % 3) * 4, 7, 2); // frost on the rim
  ctx.save(); ctx.translate(cx + c.w - 6, cy + 16); ctx.rotate(-1.05); // lid forced up and back
  ctx.fillStyle = '#56656b'; ctx.fillRect(0, -6, c.w * .8, 8); ctx.fillStyle = 'rgba(207,231,242,.65)'; ctx.fillRect(4, -5, c.w * .7, 3); ctx.restore();
  ctx.strokeStyle = '#e3eef2'; ctx.lineWidth = 2; ctx.beginPath(); // claw scores, from the inside out
  for (let i = 0; i < 3; i++) { ctx.moveTo(cx + 30 + i * 8, cy + 40); ctx.lineTo(cx + 40 + i * 8, cy + 22); } ctx.stroke();
  ctx.strokeStyle = '#d06b2a'; ctx.lineWidth = 3; ctx.beginPath(); // restraints torn off their anchors
  ctx.moveTo(cx + 10, cy + 18); ctx.lineTo(cx + 2, cy + 40); ctx.moveTo(cx + c.w - 30, cy + 18); ctx.lineTo(cx + c.w - 18, cy + 44); ctx.stroke();
  ctx.fillStyle = '#e9d07a'; ctx.fillText(QZ17_GHOST_CARGO_ID_V188, cx + c.w / 2, cy + c.h - 8);
  ctx.fillStyle = '#a7c4cf'; ctx.fillText(english ? 'COLD CHAIN · BROKEN' : 'CHAÎNE DU FROID · ROMPUE', x + w / 2, y + 14);
  ctx.textAlign = 'left';
}
