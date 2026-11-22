// V188 — CQ-01 to CQ-06, the cinematics of « La Saison des Reines » (bible
// §14.7, §30; spec 011). They join `CINEMATICS_V188` (story-cinematics-v188.js)
// and play through the same Canvas player: skippable, replayable, no reward.
// PLACEHOLDERS: every picture below is a Canvas primitive drawn behind a named
// slot (`queens-*`); no image was generated or committed for this lot. The
// dialogue shots reuse the existing staged scenes (`lab`, `dropship`) and crew
// portraits. Lines are [PROPOSÉ] (bible §14.11). This module also draws the
// pictures of the campaign's return-scene dialogs (`QueensSceneLoaderV188`).
// No story-player import here (the player imports this file).

const t = (fr, en) => Object.freeze({ fr, en });
const shot = (seconds, kind, data = {}) => Object.freeze({ seconds, kind, ...data });
const line = (speaker, crewId, fr, en) => Object.freeze({ speaker, crewId, text: t(fr, en) });
const INEZ = 'crew-09-inez-harlow', ORLOV = 'crew-08-maksim-orlov';

export const QUEENS_CINEMATICS_V188 = Object.freeze({
  // CQ-01 · Trois lignées (≈ 34 s), with the call (§14.7 « Appel »).
  'cin-cq-01': Object.freeze({ id: 'cin-cq-01', title: t('Trois lignées', 'Three lineages'), music: null, shots: Object.freeze([
    shot(10, 'queens-shot', { scene: 'eggs', caption: t('LABORATOIRE DU TANTALUS · ŒUFS QZ17', 'TANTALUS LABORATORY · QZ17 EGGS') }),
    shot(10, 'dialogue', { scene: 'lab', line: line('INEZ HARLOW', INEZ,
      'Givrée, poussiéreuse, membraneuse. Trois coquilles, trois milieux. Elles ne viennent pas d’une seule Reine.',
      'Frosted, dusty, membranous. Three shells, three environments. They don’t come from a single Queen.') }),
    shot(8, 'dialogue', { scene: 'lab', line: line('INEZ HARLOW', INEZ,
      'Ce n’est pas une infestation. C’est un élevage.', 'This isn’t an infestation. It’s a breeding programme.') }),
    shot(6, 'queens-shot', { scene: 'map', caption: t('NACRE-7 · ECHO BASIN · ORIGINE INCONNUE', 'NACRE-7 · ECHO BASIN · ORIGIN UNKNOWN') })
  ]) }),
  // CQ-02 · Le fossé (≈ 24 s), end of 1.4 (the chapter's return).
  'cin-cq-02': Object.freeze({ id: 'cin-cq-02', title: t('Le fossé', 'The trench'), music: null, shots: Object.freeze([
    shot(12, 'queens-shot', { scene: 'trench', caption: t('NACRE-7 · FOSSÉ · PROJECTEURS DU MANTA-6', 'NACRE-7 · TRENCH · MANTA-6 FLOODLIGHTS') }),
    shot(6, 'queens-shot', { scene: 'trench-dark' }),
    shot(6, 'dialogue', { scene: 'dropship', radio: true, line: line('MAKSIM ORLOV · RADIO', ORLOV,
      'Elle est partie vers le fond. Je vous remonte.', 'She went for the bottom. Bringing you up.') })
  ]) }),
  // CQ-03 · L'aire (end of 2.4), CQ-04 · La peau du monde (3.1), CQ-05 · Le chant (3.3), CQ-06 · Effondrement (end of 3.5):
  // defined for the replay list; their missions (arcs 2 and 3) are not playable in this lot.
  'cin-cq-03': Object.freeze({ id: 'cin-cq-03', title: t('L’aire', 'The eyrie'), music: null, shots: Object.freeze([
    shot(12, 'queens-shot', { scene: 'canyon', caption: t('ECHO BASIN · COUCHER DE SOLEIL SUR LE CANYON', 'ECHO BASIN · SUNSET OVER THE CANYON') }),
    shot(6, 'queens-shot', { scene: 'canyon-dive' })
  ]) }),
  'cin-cq-04': Object.freeze({ id: 'cin-cq-04', title: t('La peau du monde', 'The skin of the world'), music: null, shots: Object.freeze([
    shot(12, 'queens-shot', { scene: 'tr0-orbit', caption: t('TR-0 · AUCUNE MER · AUCUNE FORÊT', 'TR-0 · NO SEA · NO FOREST') })
  ]) }),
  'cin-cq-05': Object.freeze({ id: 'cin-cq-05', title: t('Le chant', 'The song'), music: null, shots: Object.freeze([
    shot(10, 'queens-shot', { scene: 'choir', caption: t('TR-0 · LES TROIS CHŒURS', 'TR-0 · THE THREE CHOIRS') }),
    shot(7, 'dialogue', { scene: 'dropship', radio: true, line: line('MAKSIM ORLOV · RADIO', ORLOV,
      'La radio capte un bourdonnement. Ça vient de partout.', 'The radio is picking up a hum. It’s coming from everywhere.') })
  ]) }),
  'cin-cq-06': Object.freeze({ id: 'cin-cq-06', title: t('Effondrement', 'Collapse'), music: null, shots: Object.freeze([
    shot(12, 'queens-shot', { scene: 'collapse', caption: t('TR-0 · DÉCOLLAGE', 'TR-0 · LIFT-OFF') })
  ]) })
});
export const QUEENS_CINEMATIC_IDS_V188 = Object.freeze(Object.keys(QUEENS_CINEMATICS_V188));
// Played by the campaign in this lot; the others wait for their arcs (spec 011 « Reste »).
export const QUEENS_CINEMATICS_WIRED_V188 = Object.freeze(['cin-cq-01', 'cin-cq-02']);
/** Named placeholder slots of each shot (no file behind any of them yet). */
export const QUEENS_CINEMATIC_SLOTS_V188 = Object.freeze({
  eggs: 'queens-cin-three-shells', map: 'queens-cin-reach-map', trench: 'queens-cin-trench-queen', 'trench-dark': 'queens-cin-trench-queen',
  canyon: 'queens-cin-canyon-sunset', 'canyon-dive': 'queens-cin-canyon-sunset', 'tr0-orbit': 'queens-cin-tr0-orbit', choir: 'queens-cin-choir', collapse: 'queens-cin-collapse'
});
/** Primitives only: no image source to preload. Null means « not a campaign cinematic ». */
export const queensCinematicSourcesV188 = id => QUEENS_CINEMATICS_V188[id] ? [] : null;

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function stars(ctx, W, H, seed = 1) {
  ctx.fillStyle = 'rgba(230,240,255,.7)';
  for (let i = 0; i < 180; i++) ctx.fillRect((i * 7919 * seed) % W, (i * 6271 + seed * 31) % H, i % 9 ? 1 : 2, i % 9 ? 1 : 2);
}
function egg(ctx, x, y, s, tone) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = tone.shell; ctx.beginPath(); ctx.ellipse(0, 0, 46 * s, 64 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = tone.line; ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 14 * s, -58 * s); ctx.quadraticCurveTo(i * 22 * s, 0, i * 12 * s, 60 * s); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-20 * s, -50 * s); ctx.lineTo(0, -40 * s); ctx.lineTo(20 * s, -50 * s); ctx.stroke(); // closed petals
  if (tone.frost) { ctx.fillStyle = 'rgba(220,240,255,.45)'; for (let i = 0; i < 14; i++) ctx.fillRect(-40 * s + (i * 13) % 80 * s, -50 * s + (i * 29) % 100 * s, 3, 3); }
  if (tone.dust) { ctx.fillStyle = 'rgba(170,120,80,.4)'; ctx.beginPath(); ctx.ellipse(0, 40 * s, 40 * s, 20 * s, 0, 0, Math.PI * 2); ctx.fill(); }
  if (tone.membrane) { ctx.strokeStyle = 'rgba(200,170,190,.55)'; ctx.beginPath(); ctx.moveTo(-46 * s, 0); ctx.quadraticCurveTo(-90 * s, -30 * s, -70 * s, 30 * s); ctx.moveTo(46 * s, 0); ctx.quadraticCurveTo(90 * s, -30 * s, 70 * s, 30 * s); ctx.stroke(); }
  ctx.restore();
}
const EGG_TONES = Object.freeze([
  Object.freeze({ shell: '#4a5a62', line: '#7c94a0', frost: true }), // reef: cold water
  Object.freeze({ shell: '#5a4636', line: '#8a6a4e', dust: true }), // burrower: rock
  Object.freeze({ shell: '#4e3a48', line: '#87657c', membrane: true }) // aerial: altitude
]);
function queenSilhouette(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 150, 34, 0, 0, Math.PI * 2); ctx.fill(); // body
  ctx.beginPath(); ctx.moveTo(-150, -10); ctx.quadraticCurveTo(-230, -70, -300, -40); ctx.lineTo(-170, 10); ctx.fill(); // crest
  ctx.beginPath(); ctx.moveTo(140, 0); ctx.quadraticCurveTo(260, 30, 360, -10); ctx.lineTo(150, 18); ctx.fill(); // tail
  for (let i = 0; i < 4; i++) { ctx.fillRect(-90 + i * 50, 20, 8, 70); }
  ctx.restore();
}

/** Draws one `queens-shot`; returns false for any other kind (the caller keeps its own path). */
export function drawQueensShotV188(ctx, current, { local = 0, progress = 0, lang = 'fr', reducedMotion = false, caption = () => {}, W = 1280, H = 720 } = {}) {
  if (current?.kind !== 'queens-shot') return false;
  const p = reducedMotion ? .5 : clamp(progress, 0, 1), time = reducedMotion ? 0 : local;
  switch (current.scene) {
    case 'eggs': { // three shells side by side on Inez's bench (CQ-01)
      ctx.fillStyle = '#081012'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#111c1e'; ctx.fillRect(0, 520, W, 200);
      const glow = ctx.createRadialGradient?.(W / 2, 330, 40, W / 2, 330, 520);
      if (glow) { glow.addColorStop(0, 'rgba(140,200,190,.18)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H); }
      EGG_TONES.forEach((tone, index) => { if (p > index * .18) egg(ctx, 370 + index * 270, 420, 1.4, tone); });
      ctx.fillStyle = '#8df0b0'; ctx.font = '600 16px monospace'; ctx.textAlign = 'center';
      const labels = lang === 'en' ? ['COLD WATER', 'ROCK', 'ALTITUDE'] : ['EAU FROIDE', 'ROCHE', 'ALTITUDE'];
      labels.forEach((label, index) => { if (p > .55) ctx.fillText(label, 370 + index * 270, 540); });
      ctx.textAlign = 'left'; break;
    }
    case 'map': { // the three lineages lead to one source (CQ-01)
      ctx.fillStyle = '#04080a'; ctx.fillRect(0, 0, W, H); stars(ctx, W, H, 3);
      const points = [[320, 380], [640, 250], [940, 420]], source = [700, 470];
      ctx.strokeStyle = 'rgba(141,240,176,.55)'; ctx.lineWidth = 2;
      for (const [x, y] of points) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (source[0] - x) * p, y + (source[1] - y) * p); ctx.stroke(); }
      ctx.fillStyle = '#8df0b0'; for (const [x, y] of points) { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); }
      if (p > .7) { ctx.fillStyle = (Math.floor(time * 2) % 2) ? '#e15b4f' : '#7a221b'; ctx.beginPath(); ctx.arc(...source, 10, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'trench': case 'trench-dark': { // the reef Queen rises in MANTA-6's floodlights, then is gone (CQ-02)
      ctx.fillStyle = '#01060a'; ctx.fillRect(0, 0, W, H);
      const dark = current.scene === 'trench-dark';
      ctx.fillStyle = 'rgba(120,170,190,.06)'; for (let i = 0; i < 70; i++) ctx.fillRect((i * 977 + time * 9) % W, (i * 389 - time * 14 + 2000) % H, 2, 2); // particles
      if (!dark) {
        const g = ctx.createLinearGradient?.(0, 0, 0, H); if (g) { g.addColorStop(0, 'rgba(200,230,240,.20)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; }
        else ctx.fillStyle = 'rgba(200,230,240,.12)';
        ctx.beginPath(); ctx.moveTo(560, 0); ctx.lineTo(720, 0); ctx.lineTo(1000, H); ctx.lineTo(280, H); ctx.closePath(); ctx.fill(); // floodlight cone
        const rise = H + 120 - p * 520; queenSilhouette(ctx, 640, rise, 1.1, '#0c1418');
        ctx.fillStyle = 'rgba(190,255,230,.75)'; if (p > .55) { ctx.fillRect(480, rise - 36, 10, 4); ctx.fillRect(520, rise - 30, 6, 4); } // wet sheen
      } else {
        queenSilhouette(ctx, 640 + p * 80, 420 + p * 220, 1.1 - p * .5, `rgba(12,20,24,${1 - p})`);
      }
      ctx.fillStyle = '#1a2a30'; ctx.fillRect(560, 40, 160, 30); ctx.fillStyle = '#e9d07a'; ctx.fillRect(570, 64, 20, 8); ctx.fillRect(690, 64, 20, 8); // MANTA-6 above
      break;
    }
    case 'canyon': case 'canyon-dive': { // CQ-03 (arc 2, not wired)
      const g = ctx.createLinearGradient?.(0, 0, 0, H); if (g) { g.addColorStop(0, '#3a1810'); g.addColorStop(.6, '#a2482a'); g.addColorStop(1, '#2a0f0a'); ctx.fillStyle = g; } else ctx.fillStyle = '#7a3420';
      ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#1c0c08';
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 300); ctx.lineTo(260, 340); ctx.lineTo(380, 520); ctx.lineTo(900, 520); ctx.lineTo(1020, 320); ctx.lineTo(W, 280); ctx.lineTo(W, H); ctx.fill();
      const dive = current.scene === 'canyon-dive';
      queenSilhouette(ctx, dive ? 640 + p * 200 : 200 + p * 700, dive ? 200 + p * 380 : 200 - Math.sin(p * Math.PI) * 40, dive ? .7 : .55, '#120806');
      break;
    }
    case 'tr0-orbit': { // CQ-04 (arc 3, not wired): no sea, no forest, a black veined surface
      ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, W, H); stars(ctx, W, H, 5);
      ctx.fillStyle = '#0b0a0c'; ctx.beginPath(); ctx.arc(820, 900, 620, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(150,40,40,.5)'; ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.moveTo(820 + Math.cos(i) * 200, 900 - 520 + i * 9); ctx.bezierCurveTo(400 + i * 40, 500 + i * 6, 700 + i * 20, 420, 1100 - i * 10, 400 + i * 12); ctx.stroke(); }
      break;
    }
    case 'choir': { // CQ-05 (arc 3, not wired)
      ctx.fillStyle = '#080404'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(225,91,79,.7)'; ctx.lineWidth = 2;
      for (let voice = 0; voice < 3; voice++) { ctx.beginPath(); for (let x = 0; x <= W; x += 6) { const y = 250 + voice * 110 + Math.sin(x * .02 + time * (2 + voice)) * 30; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      break;
    }
    case 'collapse': { // CQ-06 (arc 3, not wired)
      ctx.fillStyle = '#0a0606'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#1e0f0d';
      ctx.fillRect(0, 520 + p * 120, W, H); ctx.fillStyle = '#2c3a40'; ctx.fillRect(560, 420 - p * 300, 160, 46); // dropship climbing
      break;
    }
    default: return false;
  }
  caption(current.caption?.[lang]);
  ctx.fillStyle = 'rgba(233,208,122,.8)'; ctx.font = '12px monospace';
  ctx.fillText(lang === 'en' ? 'PLACEHOLDER · CANVAS' : 'PROVISOIRE · CANVAS', 24, H - 100);
  return true;
}

// —— Return-scene pictures (content-gap-ui-v188 `loader` contract: draw / preload / subscribe) ——
export const QUEENS_SCENE_SLOTS_V188 = Object.freeze(['queens-call', 'queens-quay', 'queens-pools', 'queens-trench', 'queens-rask', 'queens-debrief']);
export class QueensSceneLoaderV188 {
  preload() {}
  subscribe() { return () => {}; }
  draw(ctx, slot, width, height, { language = 'fr' } = {}) {
    if (!ctx?.fillRect) return false;
    ctx.save(); ctx.fillStyle = '#060b0d'; ctx.fillRect(0, 0, width, height);
    const sx = width / 1280, sy = height / 720; ctx.scale(sx, sy);
    const W = 1280, H = 720;
    if (slot === 'queens-call') { EGG_TONES.forEach((tone, index) => egg(ctx, 380 + index * 260, 380, 1.6, tone)); }
    else if (slot === 'queens-quay' || slot === 'queens-pools') { // stilts over black water, rain
      ctx.fillStyle = '#02070a'; ctx.fillRect(0, 470, W, 250);
      ctx.fillStyle = '#1d2a2e'; ctx.fillRect(80, 330, 1120, 30); for (let x = 120; x < 1200; x += 160) ctx.fillRect(x, 360, 18, 200);
      if (slot === 'queens-pools') { ctx.fillStyle = '#14201f'; ctx.fillRect(260, 420, 300, 120); ctx.fillRect(700, 420, 300, 120);
        ctx.fillStyle = '#4a5a62'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(290 + (i % 3) * 110 + (i > 5 ? 440 : 0), 450 + Math.floor(i / 3) % 2 * 40, 16, 22, 0, 0, Math.PI * 2); ctx.fill(); } }
      ctx.strokeStyle = 'rgba(160,190,200,.3)'; for (let i = 0; i < 120; i++) { const x = (i * 97) % W, y = (i * 53) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 24); ctx.stroke(); }
    } else if (slot === 'queens-trench') { ctx.fillStyle = '#01060a'; ctx.fillRect(0, 0, W, H); queenSilhouette(ctx, 640, 470, 1, '#0d171b');
      ctx.fillStyle = '#1a2a30'; ctx.fillRect(560, 60, 160, 30); }
    else if (slot === 'queens-rask') { ctx.fillStyle = '#10171a'; ctx.fillRect(0, 500, W, 220); ctx.fillStyle = '#d8dccf'; ctx.fillRect(560, 390, 160, 110);
      ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 4; ctx.strokeRect(566, 396, 148, 98); ctx.fillStyle = '#2b3438'; for (const x of [360, 420, 860, 920]) { ctx.fillRect(x, 330, 34, 170); ctx.beginPath(); ctx.arc(x + 17, 318, 16, 0, Math.PI * 2); ctx.fill(); } }
    else { ctx.fillStyle = '#0b1210'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#2f6d45'; ctx.strokeRect(200.5, 140.5, 880, 420);
      ctx.fillStyle = 'rgba(141,240,176,.5)'; for (let i = 0; i < 8; i++) ctx.fillRect(240, 190 + i * 40, 300 + (i * 97) % 400, 6); }
    ctx.fillStyle = 'rgba(233,208,122,.85)'; ctx.font = '600 22px monospace';
    ctx.fillText(`${language === 'en' ? 'PLACEHOLDER' : 'PROVISOIRE'} · ${slot}`, 32, H - 32);
    ctx.restore(); return true;
  }
}
