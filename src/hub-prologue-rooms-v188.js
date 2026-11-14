// V188 — coherence pass on the prologue rooms of the Tantalus (bible §4 P-1, P-2,
// CIN-02, departure; §56.11 / §56.12). Primitive placeholders only (no generated
// image), drawn over the existing rooms; nothing here moves a door, a ladder, a
// collider or a saved field.
//
// - Cryo bay: four hypersleep capsules numbered 01–04 as in CIN-01; the room's
//   existing capsule is capsule 03 (Echo-9's), drawn open; a cryostasis station
//   at its head, where the woken marine stands. Capsules 01, 02 and 04 stand on
//   the near floor, below the walk rail (the cryo bay stays a 2D room).
// - Briefing: the operations table projects the holographic map of CIN-02;
//   Velez briefs the relief at the table, and before CIN-02 Vega, Harlow and
//   Velez wait at it.
// - Dropship hangar (depth room): floor markings of a working hangar — skid
//   tie-downs, the fuel line from its wall valve, the UD-4L boarding box.
// Scale: 1 m ≈ 51 px (marine 1.80 m = 92 px). Values marked [PROPOSÉ] in the report.
import { HUB_DECKS } from './hub-game.js';
import { getHubDropshipHangarPlacementV139 } from './hub-dropship-hangar-art-v139.js';

export const PX_PER_METRE_V188 = 51;
const FLOOR_Y = 624;
const lang = () => globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr';
const roomById = id => HUB_DECKS.flatMap(deck => deck.rooms).find(room => room.id === id) || null;

/** Hypersleep capsule reference: 2.3 m long, 1.1 m high with its canopy. */
export const HYPERSLEEP_CAPSULE_SIZE_V188 = Object.freeze({ w: 117, h: 56 });

export const PROLOGUE_CRYO_V188 = Object.freeze({
  roomId: 'cryo-bay', deck: 0,
  // Echo-9's capsule is the room's own capsule (bible §4 P-1: CAPSULE 03).
  echoCapsule: 3,
  // The other three, on the near floor (feet at FLOOR_Y + depth), numbered west to east around 03.
  frontCapsules: Object.freeze([
    Object.freeze({ number: 1, x: 3990, depth: 70 }),
    Object.freeze({ number: 2, x: 4250, depth: 70 }),
    Object.freeze({ number: 4, x: 4880, depth: 70 })
  ]),
  // The cryostasis station: a pedestal console at the head of capsule 03, beside the wake spawn (x 4560).
  station: Object.freeze({ x: 4606, w: 22, h: 46 }),
  wakeSpawnX: 4560
});

/** Onboarding posts at the room's real furniture: DAVID-8R at capsule 03, Velez at the briefing table. */
export const PROLOGUE_ONBOARDING_POSTS_V188 = Object.freeze({
  'crew-10-david-8r': Object.freeze({ deck: 0, roomId: 'cryo-bay', x: 4452, phases: Object.freeze(['wake', 'medical']) }),
  'crew-02-tamsin-velez': Object.freeze({ deck: 0, roomId: 'briefing', x: 1740, phases: Object.freeze(['briefing']) })
});

/** Before CIN-02 (bible §4): Vega, Harlow and Velez wait at the holographic table. */
export const PROLOGUE_BRIEFING_STAGING_V188 = Object.freeze({
  deck: 0, roomId: 'briefing',
  posts: Object.freeze([
    Object.freeze({ crewId: 'crew-01-mara-vega', x: 1706 }),
    Object.freeze({ crewId: 'crew-09-inez-harlow', x: 1770 }),
    Object.freeze({ crewId: 'crew-02-tamsin-velez', x: 1834 })
  ])
});

/** Working-hangar floor markings (flat decals: no footprint, nothing blocks). */
export const PROLOGUE_HANGAR_MARKINGS_V188 = Object.freeze({
  roomId: 'dropship-hangar', deck: 3,
  udDepth: 30, // the UD-4L stands at z = -30 (hub-depth-rooms-v188.js)
  fuelValve: Object.freeze({ x: 932, w: 22, h: 30, bottom: 596 }), // between the parked cart and the arrival airlock
  fuelInlet: Object.freeze({ x: 772, depth: 28 }),
  boarding: Object.freeze({ x0: 486, x1: 586, z0: -58, z1: -44 })
});

/** Pure: every capsule of the cryo bay, numbered, in world coordinates. */
export function cryoCapsulesV188() {
  const room = roomById(PROLOGUE_CRYO_V188.roomId), { w, h } = HYPERSLEEP_CAPSULE_SIZE_V188;
  const front = PROLOGUE_CRYO_V188.frontCapsules.map(entry => ({ number: entry.number, row: 'front', open: false,
    x: entry.x, y: FLOOR_Y + entry.depth - h, w, h, feetY: FLOOR_Y + entry.depth }));
  const echo = room?.propRenderBounds ? { number: PROLOGUE_CRYO_V188.echoCapsule, row: 'rail', open: true,
    x: room.propRenderBounds.x, y: room.propRenderBounds.y, w: room.propRenderBounds.w, h: room.propRenderBounds.h, feetY: FLOOR_Y } : null;
  return [...front, echo].filter(Boolean).sort((a, b) => a.number - b.number);
}

export const capsuleLabelV188 = (capsule, language = 'fr') =>
  `CAPSULE ${String(capsule.number).padStart(2, '0')}${capsule.open ? (language === 'en' ? ' · OPEN' : ' · OUVERTE') : ''}`;

/** Pure: where the briefing staging applies (opening step "ready", before CIN-02 and the quay). */
export function briefingStagingActiveV188({ openingPhase, portPhase, cinematicsSeen } = {}) {
  return openingPhase === 'ready' && (portPhase ?? 'pending') === 'pending' && !(cinematicsSeen || []).includes('cin-02');
}

/** Pure: crewId → x of the prologue posts on this deck (empty outside the prologue steps). */
export function prologuePostsForV188({ deck, onboardingPhase = null, staging = false } = {}) {
  const posts = new Map();
  if (onboardingPhase) {
    for (const [crewId, post] of Object.entries(PROLOGUE_ONBOARDING_POSTS_V188))
      if (post.deck === deck && post.phases.includes(onboardingPhase)) posts.set(crewId, post.x);
  } else if (staging && deck === PROLOGUE_BRIEFING_STAGING_V188.deck) {
    for (const post of PROLOGUE_BRIEFING_STAGING_V188.posts) posts.set(post.crewId, post.x);
  }
  return posts;
}

/** Pure: the prompt of the prologue contact that E serves first (hub-onboarding-v84, hub-opening-v88), or null. */
export function prologuePromptV188({ onboarding = null, opening = null, language = 'fr' } = {}) {
  const en = language === 'en';
  if (onboarding?.action === 'hub:onboarding-wake') return en ? 'E — CONFIRM YOUR WAKE · CRYOSTASIS STATION' : 'E — CONFIRMER LE RÉVEIL · POSTE DE CRYOSTASE';
  if (onboarding?.action === 'hub:onboarding-dialogue' && onboarding.npc?.name) return `${en ? 'E — LISTEN TO' : 'E — ÉCOUTER'} ${onboarding.npc.name.toUpperCase()}`;
  if (opening?.action === 'opening:ready') return en ? 'E — PREPARE THE FIRST SORTIE' : 'E — PRÉPARER LA PREMIÈRE SORTIE';
  return null;
}

const drawCapsule =(ctx, capsule, time, reducedMotion, language) => {
  const { x, y, w, h } = capsule;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 1, w * .52, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b2a31'; ctx.fillRect(x, y + h * .42, w, h * .5); // body
  ctx.fillStyle = 'rgba(160,215,235,.25)'; ctx.fillRect(x, y + h * .42, w, 2);
  ctx.fillStyle = '#121d22'; ctx.fillRect(x + 8, y + h - 5, 14, 5); ctx.fillRect(x + w - 22, y + h - 5, 14, 5); // feet
  const glass = ctx.createLinearGradient?.(0, y, 0, y + h * .45);
  if (glass) { glass.addColorStop(0, 'rgba(190,230,245,.32)'); glass.addColorStop(1, 'rgba(90,140,160,.14)'); ctx.fillStyle = glass; } else ctx.fillStyle = 'rgba(160,210,230,.22)';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .44, w * .46, h * .4, 0, Math.PI, 0); ctx.fill(); // closed, frosted canopy
  ctx.strokeStyle = 'rgba(200,235,245,.4)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(230,248,252,.3)'; for (let f = 0; f < 9; f++) ctx.fillRect(x + 18 + (f * 23) % (w - 36), y + 8 + (f * 7) % 14, 3, 2);
  const pulse = reducedMotion ? 1 : .6 + .4 * Math.sin(time * 2 + capsule.number);
  ctx.fillStyle = `rgba(120,220,170,${pulse.toFixed(2)})`; ctx.fillRect(x + w - 14, y + h * .5, 5, 4); // status light
  ctx.fillStyle = '#0a1316'; ctx.fillRect(x + 14, y + h * .62, 74, 12);
  ctx.fillStyle = '#9fe7cf'; ctx.font = '700 9px monospace'; ctx.textAlign = 'left'; ctx.fillText(capsuleLabelV188(capsule, language), x + 18, y + h * .62 + 9);
  ctx.restore();
};

/** Capsule 03 as it is after the wake: canopy raised, empty bed, label and station. */
const drawEchoCapsuleOverlay = (ctx, capsule, wakePhase, time, reducedMotion, language) => {
  const { x, y, w, h } = capsule;
  // Measured on the unchanged bitmap: the canopy spans 17.6–74.4 % of the width, 5.6–53 % of the height.
  const gx = x + w * .176, gw = w * .568, gy = y + h * .056, gh = h * .474;
  ctx.save();
  const bed = ctx.createLinearGradient?.(0, gy, 0, gy + gh);
  if (bed) { bed.addColorStop(0, '#0d1a1f'); bed.addColorStop(1, '#22343a'); ctx.fillStyle = bed; } else ctx.fillStyle = '#16262b';
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(gx - 3, gy - 1, gw + 6, gh + 3, 12); else ctx.rect(gx - 3, gy - 1, gw + 6, gh + 3); ctx.fill(); // empty interior, canopy gone
  ctx.fillStyle = '#3c5157'; ctx.fillRect(gx + 8, gy + gh - 9, gw - 16, 6); // the bed, empty
  ctx.fillStyle = '#5d7479'; ctx.fillRect(gx + 10, gy + gh - 14, 22, 5); // pillow
  // The canopy, hinged at the foot end and raised.
  ctx.translate(gx + gw, gy + gh); ctx.rotate(.78);
  ctx.fillStyle = 'rgba(170,220,238,.18)'; ctx.strokeStyle = 'rgba(200,235,245,.55)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(-gw / 2, 0, gw / 2, gh * .95, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.restore(); ctx.save();
  if (!reducedMotion) { // the last of the cold, drifting off the bed
    ctx.fillStyle = 'rgba(200,235,245,.05)';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(gx + gw * (.2 + i * .2), gy + gh - 10 - ((time * 6 + i * 9) % 18), 16, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = '#0a1316'; ctx.fillRect(x + 34, y + h - 26, 118, 12);
  ctx.fillStyle = '#e9d07a'; ctx.font = '700 9px monospace'; ctx.textAlign = 'left'; ctx.fillText(capsuleLabelV188(capsule, language), x + 38, y + h - 17);
  // Cryostasis station at the head of the capsule.
  const s = PROLOGUE_CRYO_V188.station, top = FLOOR_Y - s.h;
  ctx.fillStyle = '#1f2c30'; ctx.fillRect(s.x + 6, top + 16, s.w - 12, s.h - 16); // pedestal
  ctx.fillStyle = '#2c3d42'; ctx.fillRect(s.x, top, s.w, 18); // head
  const blink = reducedMotion ? 1 : .55 + .45 * Math.abs(Math.sin(time * 3));
  ctx.fillStyle = wakePhase ? `rgba(233,208,122,${blink.toFixed(2)})` : '#7fe0a8'; ctx.fillRect(s.x + 3, top + 3, s.w - 6, 9);
  ctx.fillStyle = '#071012'; ctx.font = '700 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('03', s.x + s.w / 2, top + 10);
  ctx.restore();
};

const drawHologram = (ctx, table, time, reducedMotion, showCocyte, language) => {
  const cx = table.x + table.w / 2, base = table.y + 4, cy = base - 70, r = 24;
  const flicker = reducedMotion ? 1 : .82 + .18 * Math.sin(time * 23), spin = reducedMotion ? 0 : time * .25;
  ctx.save();
  ctx.fillStyle = 'rgba(70,190,160,.10)'; ctx.beginPath(); ctx.moveTo(cx - 16, base); ctx.lineTo(cx + 16, base); ctx.lineTo(cx + 62, cy - 34); ctx.lineTo(cx - 62, cy - 34); ctx.closePath(); ctx.fill(); // beam
  ctx.fillStyle = 'rgba(120,240,200,.7)'; ctx.fillRect(cx - 14, base - 2, 28, 3); // emitter
  ctx.globalAlpha = flicker; ctx.strokeStyle = 'rgba(95,210,180,.65)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, r * Math.abs(Math.cos(spin + i * .8)), r, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (showCocyte) {
    ctx.beginPath(); ctx.ellipse(cx, cy, 44, 11, -.25, 0, Math.PI * 2); ctx.stroke(); // orbit
    const sx = cx + Math.cos(spin * 1.6) * 44, sy = cy + Math.sin(spin * 1.6) * 11 * .9;
    ctx.fillStyle = '#e15b4f'; ctx.fillRect(sx - 3, sy - 3, 6, 6); // Asphodèle, red quarantine light
    ctx.font = '8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#9fe7cf'; ctx.fillText('COCYTE', cx, cy - r - 6);
    ctx.fillStyle = '#e15b4f'; ctx.textAlign = 'left'; ctx.fillText(language === 'en' ? 'ASPHODÈLE · RED QZ' : 'ASPHODÈLE · QZ ROUGE', cx + 50, cy + 3); // clear of the heads below
  }
  ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(150,240,210,.05)'; for (let y = cy - 30; y < base; y += 4) ctx.fillRect(cx - 50, y, 100, 1); // scanlines
  ctx.restore();
};

function drawHangarMarkings(ctx, time, language) {
  const marks = PROLOGUE_HANGAR_MARKINGS_V188, room = roomById(marks.roomId);
  const placement = getHubDropshipHangarPlacementV139(room);
  const skidY = FLOOR_Y + marks.udDepth;
  ctx.save();
  // Tie-downs: a ring in the deck at each end of both skids, chained to the skid.
  for (const skid of placement?.landingSupports || []) for (const [ring, foot] of [[skid.x0 - 12, skid.x0 + 8], [skid.x1 + 12, skid.x1 - 8]]) {
    ctx.strokeStyle = '#7d8a86'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(ring, skidY + 8, 5, 2.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#c9a54a'; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(ring, skidY + 7); ctx.lineTo(foot, skidY - 3); ctx.stroke(); ctx.setLineDash([]);
  }
  // Fuel line: wall valve, then the hose across the floor to the forward skid.
  const v = marks.fuelValve, valveTop = v.bottom - v.h;
  ctx.fillStyle = '#2e2a20'; ctx.fillRect(v.x, valveTop, v.w, v.h); ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 1.5; ctx.strokeRect(v.x + .5, valveTop + .5, v.w - 1, v.h - 1);
  ctx.fillStyle = '#d14a3c'; ctx.beginPath(); ctx.arc(v.x + v.w / 2, valveTop + 12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9a54a'; ctx.font = '7px monospace'; ctx.textAlign = 'center'; ctx.fillText(language === 'en' ? 'FUEL' : 'CARBURANT', v.x + v.w / 2, valveTop - 3);
  const inlet = marks.fuelInlet, ex = inlet.x, ey = FLOOR_Y + inlet.depth;
  ctx.strokeStyle = '#2b2b26'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.x + v.w / 2, v.bottom);
  ctx.bezierCurveTo(v.x + v.w / 2, FLOOR_Y + 14, ex + 70, ey + 18, ex, ey); ctx.stroke();
  ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 2; ctx.setLineDash([3, 9]); ctx.stroke(); ctx.setLineDash([]);
  // Boarding box in front of the side hatch (the UD-4L answers E from z −26 to −74).
  const b = marks.boarding, top = FLOOR_Y - b.z1, bottom = FLOOR_Y - b.z0;
  ctx.strokeStyle = 'rgba(233,208,122,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(b.x0, top, b.x1 - b.x0, bottom - top); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(233,208,122,.7)'; ctx.font = '700 8px monospace'; ctx.fillText(language === 'en' ? 'UD-4L BOARDING' : 'EMBARQUEMENT UD-4L', (b.x0 + b.x1) / 2, bottom - 3);
  ctx.restore();
}

export function withHubPrologueRoomsV188(Base) {
  if (Base.hubPrologueRoomsV188) return Base;
  return class HubPrologueRoomsV188 extends Base {
    static hubPrologueRoomsV188 = true;

    prologueSceneryAllowedV188() {
      return Boolean(this.state && !this.editorPlaytest && !this.forgeSessionV141 && !this.isPortMeridienV90?.() && !this.currentAnnexV71?.());
    }
    briefingStagingActiveV188() {
      return briefingStagingActiveV188({ openingPhase: this.openingV88?.phase, portPhase: this.portStateV90?.phase,
        cinematicsSeen: this.npcRoutineContextV62?.save?.storyCampaignV188?.cinematicsSeen });
    }

    // —— Crew posts ——
    createNpcs(deck) {
      const npcs = super.createNpcs(deck);
      if (this.editorPlaytest || this.forgeSessionV141) return npcs;
      const onboarding = this.onboardingActiveV84?.() ? this.onboardingV84?.phase : null;
      const pin = (npc, x) => Object.assign(npc, { x, min: x, max: x, vx: 0, resumeVx: 0, patrolSpeed: 0, mobile: false });
      if (onboarding) {
        for (const npc of npcs) {
          const post = PROLOGUE_ONBOARDING_POSTS_V188[npc.crewId];
          if (post && post.deck === deck && post.phases.includes(onboarding) && npc.routinePhaseV62 === 'onboarding-post') pin(npc, post.x);
        }
        return npcs;
      }
      if (!this.briefingStagingActiveV188()) return npcs;
      const staging = PROLOGUE_BRIEFING_STAGING_V188, ids = new Set(staging.posts.map(post => post.crewId));
      // One instance each, at the table: their routine instances leave every deck while the staging lasts.
      const result = npcs.filter(npc => !ids.has(npc.crewId));
      if (deck !== staging.deck) return result;
      const templates = new Map();
      for (let index = 0; index < HUB_DECKS.length; index++) {
        for (const npc of index === deck ? npcs : super.createNpcs(index)) if (ids.has(npc.crewId) && !templates.has(npc.crewId)) templates.set(npc.crewId, npc);
      }
      for (const post of staging.posts) {
        const template = templates.get(post.crewId);
        if (!template) continue;
        result.push(pin({ ...template, roomId: staging.roomId, y: FLOOR_Y - template.h, depthZ: 0,
          routinePhaseV62: 'briefing-staging', routineReasonV62: 'CIN-02' }, post.x));
      }
      return result;
    }

    /** The service-traffic layer (V163) re-seats crew bodies (sometimes its own body object) from its
     * own state every frame; a welcoming or briefing post holds its place while the prologue step lasts. */
    prologuePostsV188() {
      if (!this.state || this.editorPlaytest || this.forgeSessionV141 || this.isPortMeridienV90?.()) return null;
      return prologuePostsForV188({ deck: this.state.deck, onboardingPhase: this.onboardingActiveV84?.() ? this.onboardingV84?.phase : null,
        staging: this.briefingStagingActiveV188() });
    }
    /** E serves the prologue step before a nearby door or crew member: the prompt says so. */
    statusPrompt() {
      const inherited = super.statusPrompt();
      if (!this.running || this.annexTransitionV71) return inherited;
      const label = prologuePromptV188({ onboarding: this.onboardingContactV84?.(), opening: this.openingContactV88?.(), language: lang() });
      return label || inherited;
    }
    update(delta) {
      const result = super.update(delta), posts = this.prologuePostsV188();
      if (posts) for (const npc of this.npcs || []) {
        const x = posts.get(npc.crewId);
        if (Number.isFinite(x)) Object.assign(npc, { x, min: x, max: x, vx: 0, mobile: false });
      }
      return result;
    }

    // —— Drawing ——
    drawInteractionProp(ctx, room) {
      const result = super.drawInteractionProp(ctx, room);
      if (!ctx || !this.prologueSceneryAllowedV188()) return result;
      const time = this.animationTime || 0, language = lang();
      if (room?.id === PROLOGUE_CRYO_V188.roomId && this.state.deck === PROLOGUE_CRYO_V188.deck) {
        const echo = cryoCapsulesV188().find(capsule => capsule.open);
        if (echo) drawEchoCapsuleOverlay(ctx, echo, this.onboardingV84?.phase === 'wake', time, this.reducedMotion, language);
      }
      if (room?.id === 'briefing' && this.state.deck === 0 && room.propRenderBounds) {
        const save = this.npcRoutineContextV62?.save, world = save?.galaxy?.shipWorldIdV116 ?? save?.worldId;
        const showCocyte = !world || world === 'world-05-lethe' || this.openingV88?.phase !== 'complete';
        drawHologram(ctx, room.propRenderBounds, time, this.reducedMotion, showCocyte, language);
      }
      return result;
    }
    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      // The near-floor capsules stand below the walk rail: they never cover an actor standing on it.
      if (ctx && this.prologueSceneryAllowedV188() && this.state.deck === PROLOGUE_CRYO_V188.deck) {
        const time = this.animationTime || 0, language = lang();
        for (const capsule of cryoCapsulesV188()) if (capsule.row === 'front') drawCapsule(ctx, capsule, time, this.reducedMotion, language);
      }
      return result;
    }
    drawDepthFloorV116(ctx) {
      const result = super.drawDepthFloorV116(ctx);
      if (ctx && this.prologueSceneryAllowedV188() && this.state.deck === PROLOGUE_HANGAR_MARKINGS_V188.deck) drawHangarMarkings(ctx, this.animationTime || 0, lang());
      return result;
    }
  };
}
