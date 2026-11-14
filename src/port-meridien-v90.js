// Project-authored playable adaptation of PALISADE, chapter 2: Le quai des vivants.
// This is the arrival quay only, not the later persistent Port-Méridien city hub.
export const PORT_PHASES_V90 = Object.freeze(['pending', 'unload', 'carry', 'triage', 'power', 'escort', 'report', 'complete']);
export const PORT_RECEIPT_V90 = 'port-meridien:quai-des-vivants:v90';
export const PORT_WORLD_V90 = Object.freeze({ width: 2560, height: 720, floorY: 624 });
export const PORT_POSTS_V90 = Object.freeze({
  unload: { x: 220, y: 624, label: 'PRENDRE LE LOT DE SECOURS' },
  carry: { x: 780, y: 624, label: 'DÉPOSER LE LOT AU TRIAGE' },
  triage: { x: 780, y: 624, label: 'ASSISTER LE BLESSÉ · RESTER IMMOBILE' },
  power: { x: 1400, y: 432, label: 'RÉALIMENTER LE SAS · RESTER IMMOBILE' },
  escort: { x: 920, y: 624, label: 'RASSEMBLER LES CIVILS' },
  report: { x: 2310, y: 624, label: 'TRANSMETTRE LE CONSTAT' },
  complete: { x: 2310, y: 624, label: 'PRÉPARER LA SUITE DES OPÉRATIONS' }
});
// V188 coherence pass: the three residents wait beside the triage stretcher (712–824), not on it.
// Saved escort positions keep their historical lower bound (810 + 55 i), so older saves stay valid.
export const PORT_CIVILIANS_WAIT_V188 = Object.freeze([860, 915, 970]);
// Safe beyond the lit airlock (gate 1810–1918), clear of the report terminal (2270–2350) and its post.
// Lowered from 2160 + 55 i: escort saves above it are clamped back to it, never rejected.
export const PORT_CIVILIANS_SAFE_V188 = Object.freeze([2100, 2155, 2210]);
// V188 bug fix: escorted residents walk in file instead of stacking on one spot. The front resident
// (row 2) keeps the historical 40 px from the marine; each row behind keeps one more file gap.
// The design rule stays: a resident more than 390 px behind the marine waits where they are.
export const PORT_CIVILIANS_FILE_V188 = Object.freeze({ frontGap: 40, fileGap: 55, waitBeyond: 390 });
export function portCivilianFollowGapV188(index) {
  const rank = PORT_CIVILIANS_SAFE_V188.length - 1 - (Number.isInteger(index) ? index : 0);
  return PORT_CIVILIANS_FILE_V188.frontGap + Math.max(0, rank) * PORT_CIVILIANS_FILE_V188.fileGap;
}
/** True while the resident walks behind a grounded marine (also drives the walk cell). */
export function portCivilianWalkingV188(x, index, playerX, grounded) {
  const distance = playerX - x;
  return Boolean(grounded) && distance > portCivilianFollowGapV188(index) && distance < PORT_CIVILIANS_FILE_V188.waitBeyond;
}
export function stepPortCivilianV188(x, index, playerX, grounded, elapsed) {
  if (!portCivilianWalkingV188(x, index, playerX, grounded)) return x;
  const speed = index === 0 ? 95 : 110;
  return Math.min(PORT_CIVILIANS_SAFE_V188[index], playerX - portCivilianFollowGapV188(index), x + elapsed * speed);
}
const finite = (n, min, max, fallback) => Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
export function createPortMeridienV90() {
  return { schema: 90, phase: 'pending', revision: 0, freight: null, x: 112, y: 532,
    facing: 1, climbing: false, z: 0, civiliansX: [...PORT_CIVILIANS_WAIT_V188], following: false, receipt: null };
}
export function normalizePortMeridienV90(raw) {
  if (!raw || raw.schema !== 90 || !PORT_PHASES_V90.includes(raw.phase)) return null;
  const state = createPortMeridienV90();
  state.phase = raw.phase;
  if (raw.phase !== 'pending' && !['medical', 'energy'].includes(raw.freight)) return null;
  state.freight = raw.phase === 'pending' ? null : raw.freight;
  state.revision = Math.floor(finite(raw.revision, 0, 100000, 0));
  state.x = Math.round(finite(raw.x, 24, 2480, 112));
  state.y = Math.round(finite(raw.y, 0, 532, 532));
  state.facing = raw.facing === -1 ? -1 : 1;
  state.climbing = raw.climbing === true;
  // V188: depth on the quay floor (0 = against the back wall), additive.
  state.z = state.climbing ? 0 : Math.round(finite(Number(raw.z), -80, 0, 0) * 10) / 10;
  if (['escort', 'report', 'complete'].includes(state.phase)) {
    state.civiliansX = [0, 1, 2].map(i => Math.round(finite(raw.civiliansX?.[i], 810 + i * 55, PORT_CIVILIANS_SAFE_V188[i], PORT_CIVILIANS_WAIT_V188[i])));
    state.following = state.phase === 'escort' && raw.following === true;
  }
  if (['report', 'complete'].includes(state.phase)) state.civiliansX = [...PORT_CIVILIANS_SAFE_V188];
  if (state.phase === 'complete') {
    if (raw.receipt !== PORT_RECEIPT_V90) return null;
    state.receipt = PORT_RECEIPT_V90;
  }
  return state;
}
export function portTaskSecondsV90(state) {
  if (state?.phase === 'triage') return state.freight === 'medical' ? 2 : 5;
  if (state?.phase === 'power') return state.freight === 'energy' ? 2 : 5;
  return 0;
}
export function portPhysicalContactV90(state, actor) {
  const post = PORT_POSTS_V90[state?.phase];
  return Boolean(post && actor?.alive !== false && actor?.grounded
    && Number.isFinite(actor.x) && Number.isFinite(actor.y)
    && Math.abs(actor.x + actor.w / 2 - post.x) <= 94
    && Math.abs(actor.y + actor.h - post.y) <= 5);
}
export function advancePortMeridienV90(raw, action, proof = {}) {
  const state = normalizePortMeridienV90(raw);
  const fail = reason => ({ ok: false, state, reason });
  if (!state || proof.openingPhase !== 'ready' || proof.onboardingComplete !== true) return fail('opening-order');
  if (proof.revision !== state.revision) return fail('stale-revision');
  if (action === 'board') {
    if (state.phase !== 'pending' || proof.briefingContact !== true || !['medical', 'energy'].includes(proof.freight)) return fail('boarding-contact');
    state.phase = 'unload'; state.freight = proof.freight;
  } else {
    if (action !== state.phase || state.phase === 'complete') return fail('phase-order');
    if (action === 'escort' && state.following) {
      if (!Array.isArray(proof.civiliansX) || proof.civiliansX.length !== 3 || !proof.actor?.alive
        || !proof.civiliansX.every((x, i) => Number.isFinite(x) && x >= PORT_CIVILIANS_SAFE_V188[i])) return fail('civilians-not-safe');
      state.phase = 'report'; state.civiliansX = [...PORT_CIVILIANS_SAFE_V188]; state.following = false;
    } else {
      if (!portPhysicalContactV90(state, proof.actor)) return fail('physical-contact');
      if (['triage', 'power'].includes(action) && (!Number.isFinite(proof.taskSeconds) || proof.taskSeconds < portTaskSecondsV90(state))) return fail('task-incomplete');
      if (action === 'escort') state.following = true;
      else state.phase = PORT_PHASES_V90[PORT_PHASES_V90.indexOf(state.phase) + 1];
      if (state.phase === 'complete') state.receipt = PORT_RECEIPT_V90;
    }
    state.x = proof.actor.x; state.y = proof.actor.y;
    state.facing = proof.actor.facing; state.climbing = Boolean(proof.actor.climbing);
  }
  state.revision += 1;
  return { ok: true, state: normalizePortMeridienV90(state), reason: 'advanced' };
}
export function getPortMeridienObjectiveV90(raw, opening, onboarding) {
  const state = normalizePortMeridienV90(raw);
  if (!state || opening?.phase !== 'ready' || onboarding?.phase !== 'complete') return null;
  const texts = {
    pending: 'PORT-MÉRIDIEN · Salle de briefing : E pour embarquer vers le quai des vivants.',
    unload: `ARRIVÉE · Prenez le lot ${state.freight === 'medical' ? 'médical' : 'énergétique'} à la rampe de débarquement, à gauche.`,
    carry: 'FRET · Portez le lot au poste de triage, à droite. Aucun quartier n’est déclaré évacué.',
    triage: `TRIAGE · Assistez le blessé au poste (${portTaskSecondsV90(state)} s immobile). ${state.freight === 'medical' ? 'Votre lot médical accélère les soins.' : 'Le soignant utilise ses réserves ; votre batterie est destinée au sas.'}`,
    power: `ACCÈS · Échelle du quai, puis pupitre sur la passerelle : rétablissez le sas (${portTaskSecondsV90(state)} s).`,
    escort: state.following ? 'CIVILS · Guidez le groupe vers le sas éclairé à droite. Ils s’arrêtent si vous les distancez ; restez au sol.' : 'CIVILS · Revenez au triage et rassemblez les trois habitants avec E.',
    report: 'CONSTAT · Trois civils à l’abri. Le terminal du sas annonce pourtant « secteur normal ». Transmettez le constat avec E.',
    complete: 'QUAI SÉCURISÉ · Le constat contradictoire est enregistré. E au terminal pour préparer la suite ; Port-Méridien reste à explorer.'
  };
  return { phase: state.phase, roomId: state.phase === 'pending' ? 'briefing' : 'port-meridien-quay', text: texts[state.phase] };
}
