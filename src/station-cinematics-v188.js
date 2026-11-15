// V188 — CIN-70 to CIN-72, the Asphodèle station cinematics (bible §10, §7.2;
// spec 007). They join `CINEMATICS_V188` in `story-cinematics-v188.js` and play
// through the same player (skippable, replayable, no reward). Shots reuse the
// existing kinds (`dialogue`, `helmet-cam`, `signal-lost`, `terminal`); two new
// kinds (`station-exterior`, `station-waveform`) and two staged sets (`control`,
// `lowerdeck`, sized in metres through `cinematicSetLayoutV188`) are drawn here
// in primitives: PLACEHOLDERS, no generated image. Asphodèle, CASSIUS, Echo-8
// and Kessler are project creations; lines are [PROPOSÉ] (bible §7.6).
// No import: `story-cinematics-v188.js` imports this module.

const t = (fr, en) => Object.freeze({ fr, en });
const shot = (seconds, kind, data = {}) => Object.freeze({ seconds, kind, ...data });
const line = (speaker, crewId, fr, en) => Object.freeze({ speaker, crewId, text: t(fr, en) });

export const STATION_CINEMATICS_V188 = Object.freeze({
  // CIN-70 · Six heures de silence (40 s), at the end of Rook's quest "Six heures" (§7.2 intro, §8.4).
  'cin-70': Object.freeze({ id: 'cin-70', title: t('Six heures de silence', 'Six hours of silence'), music: null, shots: Object.freeze([
    shot(9, 'dialogue', { scene: 'quarters', line: line('ROOK', 'crew-06-rook',
      'Six heures d’enregistrement casque. Rien, puis un bruit dans les conduits. Écoutez la fin.',
      'Six hours of helmet recording. Nothing, then a noise in the ducts. Listen to the end.') }),
    shot(9, 'station-waveform', { caption: t('ECHO-8 · CASQUE · 05:58 → 06:00', 'ECHO-8 · HELMET · 05:58 → 06:00') }),
    shot(14, 'station-exterior', { caption: t('COCYTE · STATION ASPHODÈLE · FEUX ÉTEINTS', 'COCYTE · ASPHODÈLE STATION · LIGHTS OUT') }),
    shot(8, 'dialogue', { scene: 'dropship', line: line('MAKSIM ORLOV', 'crew-08-maksim-orlov',
      'Je nous rapproche. Leur dropship est toujours au sas, et une navette Crucible tient l’anneau.',
      'Bringing us in. Their dropship is still at the airlock, and a Crucible shuttle holds the ring.') })
  ]) }),
  // CIN-71 · La voix de CASSIUS (40 s), after S2, before the decision (§7.2).
  'cin-71': Object.freeze({ id: 'cin-71', title: t('La voix de CASSIUS', 'The voice of CASSIUS'), music: null, shots: Object.freeze([
    shot(8, 'dialogue', { scene: 'control', radio: true, line: line('IDRIS KWAN · RADIO', 'crew-03-idris-kwan',
      'Énergie rétablie au pont de contrôle. Il se réveille. Parlez-lui.',
      'Power restored on the control deck. It is waking up. Talk to it.') }),
    shot(13, 'dialogue', { scene: 'control', line: line('CASSIUS', null,
      'Consignes actives : quarantaine de la station et de Cocyte. Priorité cargaison. Préservation des actifs. Aucune consigne ne m’autorise à lever la quarantaine sans accord de la compagnie.',
      'Active directives: quarantine of the station and of Cocyte. Cargo priority. Preservation of assets. No directive allows me to lift the quarantine without company approval.') }),
    shot(9, 'terminal', { clock: 'S2', lines: Object.freeze([
      t('ORDRES DE LIVRAISON QZ17 · ARCHIVÉS', 'QZ17 DELIVERY ORDERS · ARCHIVED'),
      t('PRIORITÉ CARGAISON · MAINTENUE PENDANT LA QUARANTAINE', 'CARGO PRIORITY · KEPT DURING THE QUARANTINE')]), status: t('COPIÉS AU DOSSIER', 'COPIED TO THE FILE') }),
    shot(10, 'dialogue', { scene: 'control', line: line('CASSIUS', null,
      'J’attends une décision.', 'I await a decision.') })
  ]) }),
  // CIN-72 · Le dernier enregistrement d'Echo-8 (30 s), after S3 (§7.4).
  'cin-72': Object.freeze({ id: 'cin-72', title: t('Le dernier enregistrement d’Echo-8', 'Echo-8’s last recording'), music: null, shots: Object.freeze([
    shot(12, 'helmet-cam', { caption: t('CAMÉRA CASQUE · SGT D. KESSLER · ECHO-8 · H+5:58', 'HELMET CAM · SGT D. KESSLER · ECHO-8 · H+5:58') }),
    shot(10, 'dialogue', { scene: 'lowerdeck', radio: true, line: line('SGT DARIO KESSLER · ENREGISTREMENT', null,
      'Les survivants sont barricadés au pont inférieur, l’administratrice avec eux. On sort chercher une issue. Si quelqu’un écoute : la station ne nous laissera pas partir.',
      'The survivors are barricaded on the lower deck, the administrator with them. We’re going out to find a way. If anyone is listening: the station won’t let us leave.') }),
    shot(8, 'signal-lost', { caption: t('FIN DE L’ENREGISTREMENT · 06:00:05', 'END OF RECORDING · 06:00:05') })
  ]) })
});
export const STATION_CINEMATIC_IDS_V188 = Object.freeze(Object.keys(STATION_CINEMATICS_V188));

// Staged sets in metres (same contract as the sets of story-cinematics-v188.js).
const item = (kind, x, w, h, extra = {}) => Object.freeze({ kind, x, w, h, ...extra });
export const STATION_CINEMATIC_SETS_V188 = Object.freeze({
  // The control deck: a bank of Seegson consoles (0.9 m desks), CASSIUS's core (1.6 × 2.4 m), Echo-9.
  control: Object.freeze({ scale: 150, floor: 560, items: Object.freeze([
    item('console', 120, 1.6, .95), item('console', 400, 1.6, .95),
    item('core', 760, 1.6, 2.4, { label: 'CASSIUS' }),
    item('person', 1120, .5, 1.8, { who: 'ECHO-9', torch: false })
  ]) }),
  // The lower deck barricade of Echo-8: stacked crates and a bent door (2.6 m), the tag on the floor.
  lowerdeck: Object.freeze({ scale: 150, floor: 560, items: Object.freeze([
    item('barricade', 200, 3.2, 1.6), item('bent-door', 760, 1.9, 2.6),
    item('tag', 640, .06, .03, { label: 'KESSLER D.' })
  ]) })
});
export const STATION_CINEMATIC_PALETTES_V188 = Object.freeze({ control: ['#061008', '#0f1d15'], lowerdeck: ['#0a0806', '#1a120d'] });

/** Set items of the station scenes. Returns true when it drew the item. */
export function drawStationSetItemV188(ctx, entry, { x, w, h, top, floor, time = 0, reducedMotion = false } = {}) {
  switch (entry.kind) {
    case 'console': {
      ctx.fillStyle = '#1b2622'; ctx.fillRect(x, top, w, h); ctx.fillStyle = '#06200f'; ctx.fillRect(x + w * .1, top - h * .55, w * .8, h * .5);
      ctx.fillStyle = 'rgba(125,255,154,.45)'; for (let i = 0; i < 5; i++) ctx.fillRect(x + w * .14, top - h * .5 + i * h * .08, w * (.3 + (i % 3) * .15), 3);
      return true;
    }
    case 'core': {
      ctx.fillStyle = '#0a120d'; ctx.fillRect(x, top, w, h);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { ctx.fillStyle = '#06200f'; ctx.fillRect(x + w * (.06 + c * .48), top + h * (.06 + r * .3), w * .42, h * .24); }
      ctx.strokeStyle = 'rgba(125,255,154,.9)'; ctx.lineWidth = 3; ctx.beginPath();
      for (let px = 0; px <= w * .88; px += 6) ctx.lineTo(x + w * .06 + px, top + h * .5 + Math.sin(px * .08 + (reducedMotion ? 0 : time * 7)) * h * .05);
      ctx.stroke(); ctx.fillStyle = '#7dff9a'; ctx.font = '700 16px monospace'; ctx.fillText(entry.label, x + w * .3, top - 10);
      return true;
    }
    case 'barricade': {
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#3a3226' : '#2c2a22'; ctx.fillRect(x + (i % 3) * w * .3, floor - h * (i < 3 ? .5 : 1), w * .32, h * .48); }
      ctx.fillStyle = '#e9e4d8'; for (let i = 0; i < 6; i++) ctx.fillRect(x + w * .1 + i * 14, floor - h * .8, 3, 18); // chalk marks counting the hours
      return true;
    }
    case 'bent-door': {
      ctx.fillStyle = '#1d2328'; ctx.fillRect(x - 10, top - 10, w + 20, h + 10); ctx.fillStyle = '#2b333a';
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w * .45, top); ctx.lineTo(x + w * .55, top + h * .6); ctx.lineTo(x + w * .4, floor); ctx.lineTo(x, floor); ctx.fill();
      ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.moveTo(x + w * .55, top + h * .6); ctx.lineTo(x + w, top); ctx.lineTo(x + w, floor); ctx.lineTo(x + w * .4, floor); ctx.fill();
      return true;
    }
    case 'tag': {
      const glint = reducedMotion ? .7 : .5 + .5 * Math.abs(Math.sin(time * 2));
      ctx.fillStyle = `rgba(220,225,215,${glint})`; ctx.fillRect(x, floor - 8, 24, 12); ctx.strokeStyle = 'rgba(220,225,215,.6)'; ctx.beginPath(); ctx.moveTo(x + 12, floor - 8); ctx.lineTo(x + 30, floor - 30); ctx.stroke();
      return true;
    }
    default: return false;
  }
}

/** New shot kinds. `caption(text, y)` is the player's caption queue. Returns true when it drew the shot. */
export function drawStationShotV188(ctx, current, { local = 0, progress = 0, lang = 'fr', reducedMotion = false, caption = () => {}, W = 1280, H = 720 } = {}) {
  if (current.kind === 'station-exterior') {
    ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(230,240,255,.7)'; for (let i = 0; i < 160; i++) ctx.fillRect((i * 7919) % W, (i * 6271) % H, i % 7 ? 1 : 2, i % 7 ? 1 : 2);
    ctx.fillStyle = '#3a3d34'; ctx.beginPath(); ctx.arc(1180, 900, 520, 0, Math.PI * 2); ctx.fill(); // Cocyte's limb, below right
    const cx = 560, cy = 330, spin = reducedMotion ? 0 : local * .05; // slow rotation, lights out
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin);
    ctx.strokeStyle = '#4a5054'; ctx.lineWidth = 26; ctx.beginPath(); ctx.ellipse(0, 0, 250, 250, 0, 0, Math.PI * 2); ctx.stroke(); // outer ring
    ctx.strokeStyle = '#353a3d'; ctx.lineWidth = 10; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48); ctx.lineTo(Math.cos(a) * 238, Math.sin(a) * 238); ctx.stroke(); } // spokes
    ctx.fillStyle = '#5c5245'; ctx.save(); ctx.rotate(.6); ctx.fillRect(262, -18, 60, 36); ctx.restore(); // Crucible shuttle docked on the outer ring
    ctx.fillStyle = '#4a5440'; ctx.save(); ctx.rotate(2.4); ctx.fillRect(262, -14, 54, 28); ctx.fillStyle = '#e9d07a'; ctx.fillRect(290, -4, 10, 8); ctx.restore(); // Echo-8's UD-4L at an airlock
    ctx.restore();
    ctx.fillStyle = '#2b3236'; ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill(); // the hub does not turn
    const blink = reducedMotion ? 1 : (Math.floor(local * 1.2) % 2); ctx.fillStyle = blink ? '#e15b4f' : '#5a1f1b'; ctx.fillRect(cx - 6, cy - 6, 12, 12); // red QZ light, the only one
    caption(current.caption?.[lang], 640); return true;
  }
  if (current.kind === 'station-waveform') {
    ctx.fillStyle = '#050a07'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(125,255,154,.35)'; ctx.lineWidth = 1; for (let x = 140; x <= 1140; x += 100) { ctx.beginPath(); ctx.moveTo(x, 520); ctx.lineTo(x, 532); ctx.stroke(); }
    ctx.fillStyle = 'rgba(125,255,154,.7)'; ctx.font = '14px monospace'; ctx.fillText('05:58', 130, 552); ctx.fillText('06:00', 1110, 552);
    const reach = reducedMotion ? 1 : Math.min(1, progress * 1.2), cut = 1060;
    ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 140; x < Math.min(cut, 140 + reach * 1000); x += 3) { const loud = x > 900 ? 3 + (x - 900) / 14 : 3; ctx.lineTo(x, 360 + Math.sin(x * .37) * loud + Math.sin(x * 1.3) * loud * .5); }
    ctx.stroke();
    if (reach * 1000 + 140 >= cut) { ctx.fillStyle = '#e15b4f'; ctx.fillRect(cut, 300, 4, 120); ctx.font = '700 16px monospace'; ctx.fillText(lang === 'en' ? 'CUT' : 'COUPURE', cut + 10, 300); }
    caption(current.caption?.[lang], 640); return true;
  }
  return false;
}
