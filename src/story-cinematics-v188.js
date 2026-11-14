// V188 — prologue and first-hour cinematics (bible §4, §5.2, §10).
// Scripted Canvas 2D sequences: fixed shots, slow pans, dialogue frames with the
// reviewed crew portraits (npc-dialogue-portraits-v168.js). No pre-rendered
// video, no generated image: decors are drawn with primitives; space, planet and
// the Tantalus reuse the existing title-scene layers. Every cinematic can be
// skipped and replayed, and none grants a reward.
import { getNpcDialoguePortraitV168, drawNpcDialoguePortraitV168 } from './npc-dialogue-portraits-v168.js';

const t = (fr, en) => Object.freeze({ fr, en });
const shot = (seconds, kind, data = {}) => Object.freeze({ seconds, kind, ...data });
const line = (speaker, crewId, fr, en) => Object.freeze({ speaker, crewId, text: t(fr, en) });

export const CINEMATIC_IMAGES_V188 = Object.freeze({
  space: '/assets/openai/ui/title/v79/space/space-01-deep-frontier.png',
  stars: '/assets/openai/ui/title/v79/stars/stars-01-distant-field.png',
  planet: '/assets/openai/ui/title/v79/planet/planet-02-ceto-basin.png',
  tantalus: '/assets/openai/ui/title/v79/orbitals/orbitals-01-tantalus-transport.png',
  dropship: '/assets/openai/mission/insertion/tantalus-dropship-approach-v62.png'
});

// Names of the north-quay staff in CIN-20: [PROPOSÉ] in bible §56.7.
export const NORTH_QUAY_NAMES_V188 = Object.freeze(['E. Okonjo', 'P. Lindqvist', 'S. Arenas', 'D. Haddad', 'K. Brandt']);

export const CINEMATICS_V188 = Object.freeze({
  'cin-00': Object.freeze({ id: 'cin-00', title: t('Ouverture', 'Opening'), music: 'menu', shots: Object.freeze([
    shot(6, 'telemetry'),
    shot(8, 'relay-rain', { caption: t('COCYTE · RELAIS QZ-18 · 18:41', 'COCYTE · QZ-18 RELAY · 18:41') }),
    shot(10, 'terminal', { lines: Object.freeze([t('SECOURS IMMÉDIAT — PERSONNEL COINCÉ AU QUAI NORD', 'IMMEDIATE AID — STAFF TRAPPED AT NORTH QUAY')]),
      status: t('EN ATTENTE', 'ON HOLD'), clock: '18:42' }),
    shot(8, 'badge'),
    shot(8, 'terminal', { lines: Object.freeze([t('MESSAGE ÉMIS', 'MESSAGE SENT')]), status: t('18:54', '18:54'), clock: '18:54',
      caption: t('TREIZE MINUTES', 'THIRTEEN MINUTES') }),
    shot(9, 'orbit-station', { caption: t('QZ · QUARANTAINE', 'QZ · QUARANTINE') }),
    shot(10, 'tantalus-orbit'),
    shot(6, 'title', { caption: t('ALIENS: TANTALUS FRONTIER', 'ALIENS: TANTALUS FRONTIER') })
  ]) }),
  'cin-01': Object.freeze({ id: 'cin-01', title: t('Le casier vide', 'The empty locker'), music: null, shots: Object.freeze([
    shot(8, 'dialogue', { scene: 'cryo', line: line('DAVID-8R', 'crew-10-david-8r',
      'Vous remplacez l’équipe Echo-8. Elle a abordé la station Asphodèle il y a trente et une heures. Le contact a été perdu à la sixième. Je n’ai pas d’autre information.',
      'You are replacing team Echo-8. They boarded Asphodèle station thirty-one hours ago. Contact was lost at hour six. I have no other information.') }),
    shot(12, 'locker', { caption: t('ECHO-8 · SCELLÉ', 'ECHO-8 · SEALED') })
  ]) }),
  'cin-p2': Object.freeze({ id: 'cin-p2', title: t('La liaison prioritaire', 'The priority link'), music: null, shots: Object.freeze([
    shot(9, 'message-burst', { caption: t('PORT-MÉRIDIEN · 37 MESSAGES EN RETARD · DERNIER : IL Y A 4 H', 'PORT-MÉRIDIEN · 37 DELAYED MESSAGES · LATEST: 4 H AGO') }),
    shot(7, 'dialogue', { scene: 'range', line: line('LT. MARA VEGA', 'crew-01-mara-vega',
      'Velez, on coupe l’exercice. Echo-9, rendez l’arme au pas de tir et montez en salle de briefing.',
      'Velez, we cut the exercise. Echo-9, return the weapon to the firing pad and get to the briefing room.') })
  ]) }),
  'cin-02': Object.freeze({ id: 'cin-02', title: t('Le briefing', 'The briefing'), music: 'briefing', shots: Object.freeze([
    shot(13, 'dialogue', { scene: 'hologram', line: line('LT. MARA VEGA', 'crew-01-mara-vega',
      'L’Administration nous a réquisitionnés : code de quarantaine rouge, émis par Asphodèle, plus de contact avec la station depuis trois semaines. Nos ordres : rétablir le contact, évaluer, appliquer la quarantaine, évacuer si nécessaire.',
      'The Administration has requisitioned us: a red quarantine code, issued by Asphodèle, no contact with the station for three weeks. Our orders: restore contact, assess, enforce the quarantine, evacuate if needed.') }),
    shot(11, 'dialogue', { scene: 'hologram', line: line('LT. MARA VEGA', 'crew-01-mara-vega',
      'La compagnie a ajouté une consigne : préserver le matériel sous scellés en transit. Elle est arrivée avec quatre jours de retard. Par leur propre réseau.',
      'The company added an instruction: preserve sealed material in transit. It arrived four days late. Over their own network.') }),
    shot(8, 'dialogue', { scene: 'hologram', line: line('INEZ HARLOW', 'crew-09-inez-harlow',
      'Personne ne déclenche une quarantaine rouge pour une panne de relais.',
      'Nobody triggers a red quarantine over a relay fault.') }),
    shot(10, 'dialogue', { scene: 'hologram', line: line('TAMSIN VELEZ', 'crew-02-tamsin-velez',
      'Echo-8 est monté voir. On n’a plus de nouvelles. Port-Méridien appelle encore. On commence par ceux qui répondent.',
      'Echo-8 went up to look. We’ve heard nothing since. Port-Méridien is still calling. We start with the ones who answer.') })
  ]) }),
  // [PROPOSÉ] bible §56.11: the descent between the briefing and the quay.
  'cin-03': Object.freeze({ id: 'cin-03', title: t('Descente sur Port-Méridien', 'Descent to Port-Méridien'), music: 'mission', shots: Object.freeze([
    shot(8, 'dropship-rain', { caption: t('COCYTE · DESCENTE VERS PORT-MÉRIDIEN', 'COCYTE · DESCENT TO PORT-MÉRIDIEN'), camera: Object.freeze({ from: [1.02, 0, -18], to: [1.12, 0, 10] }) }),
    shot(8, 'dialogue', { scene: 'dropship', line: line('MAKSIM ORLOV', 'crew-08-maksim-orlov',
      'Turbulences jusqu’à deux mille mètres. Le port n’émet plus de balise : je pose à vue.',
      'Turbulence down to two thousand metres. The port has no beacon left: I’m landing visual.') }),
    shot(8, 'dialogue', { scene: 'dropship', line: line('TAMSIN VELEZ', 'crew-02-tamsin-velez',
      'Quand la rampe touche, Echo-9 sort en premier. Les vivants d’abord. Le matériel ensuite.',
      'When the ramp touches down, Echo-9 goes out first. The living first. The cargo after.') }),
    shot(9, 'port-approach', { caption: t('PORT-MÉRIDIEN · QUAI SUD', 'PORT-MÉRIDIEN · SOUTH QUAY') })
  ]) }),
  'cin-p3-wren': Object.freeze({ id: 'cin-p3-wren', title: t('Le quai des vivants', 'The quay of the living'), music: null, shots: Object.freeze([
    shot(7, 'dialogue', { scene: 'quay', cast: 'arrival', line: line('TOMAS WREN', null,
      'Les conteneurs scellés partent avant nous depuis trois semaines.',
      'Sealed containers have been leaving before us for three weeks.') })
  ]) }),
  'cin-p3-ferro': Object.freeze({ id: 'cin-p3-ferro', title: t('Le blessé du quai nord', 'The north-quay patient'), music: null, shots: Object.freeze([
    shot(8, 'dialogue', { scene: 'triage', line: line('LUCIA FERRO', null,
      'Il est tombé malade après une nuit au quai nord. Il ne se souvient pas de la nuit.',
      'He fell ill after a night at the north quay. He doesn’t remember the night.') }),
    shot(6, 'dialogue', { scene: 'triage', radio: true, line: line('NOOR OKAFOR · RADIO', 'crew-04-noor-okafor',
      'Ramenez-le en quarantaine. Pas au triage.', 'Bring him into quarantine. Not to triage.') })
  ]) }),
  'cin-20': Object.freeze({ id: 'cin-20', title: t('Treize minutes', 'Thirteen minutes'), music: null, shots: Object.freeze([
    shot(14, 'dialogue', { scene: 'quarters', line: line('ASHA MBAYE', 'crew-12-asha-mbaye',
      '« Secours immédiat, personnel coincé au quai nord. » Saisi à 18:41. En attente à 18:42. Libéré à 18:54.',
      '“Immediate aid, staff trapped at north quay.” Typed at 18:41. On hold at 18:42. Released at 18:54.') }),
    shot(14, 'name-list', { caption: t('QUAI NORD · PERSONNEL', 'NORTH QUAY · STAFF') }),
    shot(12, 'dialogue', { scene: 'quarters', radio: true, line: line('DIRECTRICE HALLORAN · RÉSEAU QZ', null,
      'Priorité cargaison maintenue, conformément à la clause d’acheminement. Toute ouverture de scellé engage la responsabilité de l’unité.',
      'Cargo priority maintained, in accordance with the routing clause. Any opening of a seal engages the unit’s liability.') })
  ]) }),
  // Act I (bible §5.1): approach, the cradle opened from inside, and the return with Inez.
  'cin-10': Object.freeze({ id: 'cin-10', title: t('Les quais déserts', 'The empty docks'), music: null, shots: Object.freeze([
    shot(14, 'dropship-rain', { caption: t('COCYTE · QUAIS QZ-17', 'COCYTE · QZ-17 DOCKS') }),
    shot(16, 'dialogue', { scene: 'dropship', radio: true, line: line('ROOK · RADIO', 'crew-06-rook',
      'Quatre accès. Aucun ne répond. Le détecteur est calme. Trop calme.',
      'Four accesses. None answering. The tracker is quiet. Too quiet.') })
  ]) }),
  'cin-11': Object.freeze({ id: 'cin-11', title: t('Ouvert de l’intérieur', 'Opened from inside'), music: null, shots: Object.freeze([
    shot(15, 'cradle', { caption: t('BERCEAU DE TRANSPORT RÉFRIGÉRÉ · OUVERT DE L’INTÉRIEUR', 'REFRIGERATED TRANSPORT CRADLE · OPENED FROM INSIDE') }),
    shot(10, 'dialogue', { scene: 'cradle', radio: true, line: line('INEZ HARLOW · RADIO', 'crew-09-inez-harlow',
      'Ne concluez pas. Rapportez.', 'Don’t conclude. Report.') })
  ]) }),
  'cin-qz17-retour': Object.freeze({ id: 'cin-qz17-retour', title: t('Retour de QZ-17', 'Back from QZ-17'), music: null, shots: Object.freeze([
    shot(9, 'dialogue', { scene: 'lab', line: line('INEZ HARLOW', 'crew-09-inez-harlow',
      'Ce qui a bougé : une charge vivante, réfrigérée, non déclarée.',
      'What moved: a live, refrigerated, undeclared load.') }),
    shot(11, 'dialogue', { scene: 'lab', line: line('INEZ HARLOW', 'crew-09-inez-harlow',
      'Qui ment : le PDA et le courriel ne peuvent pas être vrais ensemble. La boîte noire soutient le PDA.',
      'Who is lying: the PDA and the email cannot both be true. The black box supports the PDA.') }),
    shot(9, 'dialogue', { scene: 'lab', line: line('INEZ HARLOW', 'crew-09-inez-harlow',
      'Ce qu’on transportait : non établi. Pas sans prélèvement.',
      'What was being carried: not established. Not without a sample.') })
  ]) }),
  // colony-intro-doyenne (bible §6.2): guided visit, calm, no combat ([PROPOSÉ] adaptation, §56.7).
  'cin-doyenne': Object.freeze({ id: 'cin-doyenne', title: t('La doyenne', 'The elder'), music: 'calm', shots: Object.freeze([
    shot(8, 'dialogue', { scene: 'quay', cast: 'elder', line: line('ASHA MBAYE', 'crew-12-asha-mbaye',
      'Echo-9, voici Adèle Sarrazin. C’est elle qui tient le port ensemble.',
      'Echo-9, this is Adèle Sarrazin. She’s the one holding the port together.') }),
    shot(6, 'port-tour', { place: 'docks', caption: t('PORT-MÉRIDIEN · QUAIS', 'PORT-MÉRIDIEN · DOCKS') }),
    shot(6, 'port-tour', { place: 'infirmary', caption: t('INFIRMERIE DE LUCIA FERRO', 'LUCIA FERRO’S INFIRMARY') }),
    shot(6, 'port-tour', { place: 'processor', caption: t('PROCESSEUR ATMOSPHÉRIQUE', 'ATMOSPHERE PROCESSOR') }),
    shot(6, 'port-tour', { place: 'wall', caption: t('MUR NORD', 'NORTH WALL') }),
    shot(11, 'dialogue', { scene: 'quay', cast: 'elder', line: line('ADÈLE SARRAZIN', null,
      'S’ils nous déclarent non viables, ils reprennent tout, nous compris.',
      'If they declare us non-viable, they take everything back, us included.') })
  ]) }),
  // Act III (bible §5.3): the closed airlock, drawn from the saved M577 manifest.
  'cin-31': Object.freeze({ id: 'cin-31', title: t('Le sas refermé', 'The closed airlock'), music: null, shots: Object.freeze([
    shot(10, 'ramp', { caption: t('PORT-MÉRIDIEN · RESCAPÉS DE C-12', 'PORT-MÉRIDIEN · C-12 SURVIVORS') }),
    shot(10, 'sealed-crates', { caption: t('SOUS SCELLÉS · VERS LE TANTALUS, SUR ORDRE', 'UNDER SEAL · TO THE TANTALUS, ON ORDERS') }),
    shot(10, 'bio-screen', { status: t('CONTRÔLE BIOLOGIQUE · 1 ANOMALIE', 'BIOLOGICAL SCREENING · 1 ANOMALY'), tone: 'alarm' })
  ]) }),
  // Act IV (bible §5.5): the last images before the capture, and the bio check on return.
  'cin-50': Object.freeze({ id: 'cin-50', title: t('Les dernières images', 'The last images'), music: null, shots: Object.freeze([
    shot(22, 'helmet-cam', { caption: t('CAMÉRA CASQUE · ECHO-9 · VERS LE DÉPÔT', 'HELMET CAM · ECHO-9 · TO THE DEPOT') }),
    shot(13, 'signal-lost', { caption: t('SIGNAL PERDU · AUCUN TÉMOIN EXPLOITABLE', 'SIGNAL LOST · NO USABLE WITNESS') })
  ]) }),
  'cin-51': Object.freeze({ id: 'cin-51', title: t('Contrôle biologique', 'Biological screening'), music: null, shots: Object.freeze([
    shot(13, 'bio-screen', { status: t('NÉGATIF', 'NEGATIVE'), tone: 'clear' }),
    shot(12, 'dialogue', { scene: 'lab', line: line('NOOR OKAFOR', 'crew-04-noor-okafor',
      'Bon retour. Cette fois, je l’écris.', 'Welcome back. This time, I’m writing it down.') })
  ]) }),
  // Interlude (bible §5.4). Lines and journal times are [PROPOSÉ] (§56.7).
  'cin-40': Object.freeze({ id: 'cin-40', title: t('Jun Park ne répond plus', 'Jun Park isn’t answering'), music: 'alert', shots: Object.freeze([
    shot(12, 'alarm-deck', { caption: t('TANTALUS · PONT 2 · ALERTE QUARANTAINE', 'TANTALUS · DECK 2 · QUARANTINE ALERT') }),
    shot(10, 'dialogue', { scene: 'alarm', radio: true, line: line('TAMSIN VELEZ · RADIO', 'crew-02-tamsin-velez',
      'Jun, répondez. Support-vie, ici Velez. Jun ?', 'Jun, respond. Life support, this is Velez. Jun?') }),
    shot(8, 'alarm-deck', { caption: t('SUPPORT-VIE · AUCUNE RÉPONSE', 'LIFE SUPPORT · NO RESPONSE') })
  ]) }),
  'cin-41': Object.freeze({ id: 'cin-41', title: t('Ce que BISHOP-9 savait', 'What BISHOP-9 knew'), music: null, shots: Object.freeze([
    shot(16, 'terminal', { clock: '02:31', lines: Object.freeze([
      t('02:14 · INCINÉRATION DEMANDÉE · QUARANTAINE', '02:14 · INCINERATION REQUESTED · QUARANTINE'),
      t('02:15 · BISHOP-9 · DIRECTIVE DE PRÉSERVATION', '02:15 · BISHOP-9 · PRESERVATION DIRECTIVE'),
      t('02:15 · PROCÉDURE RALENTIE', '02:15 · PROCEDURE SLOWED')]), status: t('JOURNAL NON CONSULTÉ', 'LOG NEVER READ') }),
    shot(15, 'dialogue', { scene: 'lab', line: line('BISHOP-9', 'crew-05-bishop-9',
      'J’ai appliqué la directive de préservation. Je ne l’ai pas cachée. Personne ne m’a interrogé.',
      'I applied the preservation directive. I did not hide it. Nobody asked me.') }),
    shot(14, 'dialogue', { scene: 'lab', line: line('INEZ HARLOW', 'crew-09-inez-harlow',
      'Maintenant, on t’interroge.', 'We’re asking now.') })
  ]) }),
  // Bible §5.2 weaving: Rook identifies the remote signature (line [PROPOSÉ], §56.7).
  'cin-20-rook': Object.freeze({ id: 'cin-20-rook', title: t('La signature', 'The signature'), music: null, shots: Object.freeze([
    shot(10, 'dialogue', { scene: 'quarters', line: line('ROOK', 'crew-06-rook',
      'Le profil « priorité cargaison » n’a pas été activé au relais. Il a été autorisé à distance. La signature vient de la station Asphodèle.',
      'The “cargo priority” profile wasn’t activated at the relay. It was authorised remotely. The signature comes from Asphodèle station.') })
  ]) })
});
export const CINEMATIC_IDS_V188 = Object.freeze(Object.keys(CINEMATICS_V188));

export function cinematicDurationV188(id) {
  return (CINEMATICS_V188[id]?.shots || []).reduce((sum, entry) => sum + entry.seconds, 0);
}

/** Pure: which shot plays at a time, and the progress inside it. */
export function cinematicShotAtV188(id, time) {
  const shots = CINEMATICS_V188[id]?.shots || [];
  let start = 0;
  for (let index = 0; index < shots.length; index++) {
    const end = start + shots[index].seconds;
    if (time < end) return { index, shot: shots[index], local: Math.max(0, time - start), progress: Math.max(0, (time - start) / shots[index].seconds) };
    start = end;
  }
  return null;
}

// —— Drawing (primitives only; images are existing repository layers) ——
const W = 1280, H = 720;
const ready = image => Boolean(image?.complete && image.naturalWidth > 0);
function wrap(ctx, text, width) {
  const words = String(text).split(/\s+/), lines = []; let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && (ctx.measureText?.(next)?.width || next.length * 9) > width) { lines.push(current); current = word; } else current = next;
  }
  if (current) lines.push(current); return lines;
}
function fade(ctx, progress, { fadeIn = true, fadeOut = true } = {}) {
  const alpha = fadeIn && progress < .08 ? 1 - progress / .08 : fadeOut && progress > .92 ? (progress - .92) / .08 : 0;
  if (alpha > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, alpha)})`; ctx.fillRect(0, 0, W, H); }
}
// Cinemascope frame (2.39:1): the picture sits between two black bars; captions
// and subtitles live in the bars, outside the camera move.
export const LETTERBOX_V188 = Math.round((H - W / 2.39) / 2);
let pendingCaptions = [];
function caption(ctx, text, y = 640) {
  if (text) pendingCaptions.push({ text, top: y < 200 });
}
function drawCaptions(ctx) {
  ctx.textAlign = 'center'; ctx.font = '600 24px monospace'; ctx.fillStyle = '#d8e6d8';
  for (const entry of pendingCaptions) ctx.fillText(entry.text, W / 2, entry.top ? LETTERBOX_V188 / 2 + 9 : H - LETTERBOX_V188 / 2 + 9);
  ctx.textAlign = 'left'; pendingCaptions = [];
}
const ease = value => value < .5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
const SLOW_KINDS = new Set(['telemetry', 'terminal', 'message-burst', 'name-list', 'title', 'bio-screen', 'signal-lost']);
/** Camera for a shot: explicit `camera: { from: [zoom, x, y], to: [...] }`, else a slow push-in. */
export function cinematicCameraV188(entry, progress, reducedMotion = false) {
  if (reducedMotion) return { zoom: 1, x: 0, y: 0 };
  const fallback = SLOW_KINDS.has(entry.kind) ? { from: [1, 0, 0], to: [1.025, 0, 0] } : entry.kind === 'dialogue' ? { from: [1.02, 12, 0], to: [1.07, -12, -6] } : { from: [1.03, -14, 0], to: [1.09, 14, -6] };
  const camera = entry.camera || fallback, k = ease(Math.max(0, Math.min(1, progress)));
  const mix = index => camera.from[index] + (camera.to[index] - camera.from[index]) * k;
  return { zoom: mix(0), x: mix(1), y: mix(2) };
}
/** A scene key: consecutive shots with the same key cut without a black fade. */
const sceneKey = (entry, index) => entry?.kind === 'dialogue' ? `dialogue:${entry.scene}` : `${entry?.kind}:${index}`;
function shake(local, amount, reducedMotion) {
  return reducedMotion ? [0, 0] : [Math.sin(local * 37) * amount + Math.sin(local * 13) * amount * .6, Math.cos(local * 29) * amount * .7];
}
function light(ctx, x, y, radius, color) {
  const g = ctx.createRadialGradient?.(x, y, 0, x, y, radius); if (!g) return;
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}
function cone(ctx, x, top, width, bottom, color) {
  const g = ctx.createLinearGradient?.(0, top, 0, bottom); if (g) { g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; } else ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x - 10, top); ctx.lineTo(x + 10, top); ctx.lineTo(x + width / 2, bottom); ctx.lineTo(x - width / 2, bottom); ctx.closePath(); ctx.fill();
}
function mist(ctx, time, reducedMotion, color = 'rgba(190,220,230,.05)', y = 520) {
  ctx.fillStyle = color;
  for (let i = 0; i < 9; i++) { const drift = reducedMotion ? 0 : time * (8 + i * 2); ctx.beginPath(); ctx.ellipse(((i * 173 + drift) % (W + 300)) - 150, y + (i % 3) * 14, 320, 16, 0, 0, Math.PI * 2); ctx.fill(); }
}
function grain(ctx, time, reducedMotion) {
  const seed = reducedMotion ? 7 : Math.floor(time * 24); ctx.fillStyle = 'rgba(220,230,225,.045)';
  for (let i = 0; i < 420; i++) ctx.fillRect((i * 7919 + seed * 104729) % W, (i * 6271 + seed * 1299709) % H, 2, 2);
  const v = ctx.createRadialGradient?.(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95);
  if (v) { v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
}
function rain(ctx, time, reducedMotion, color = 'rgba(160,190,200,.35)') {
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  for (let i = 0; i < 180; i++) {
    const x = (i * 97) % W, speed = 520 + (i % 7) * 40, y = ((i * 53) + (reducedMotion ? 0 : time * speed)) % (H + 40) - 40;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 26); ctx.stroke();
  }
}
// —— Staged sets: what each shot shows, sized in metres ——
// Adaptation du projet: every set has one scale (px per metre inside that shot)
// so a person (1.8 m), a hypersleep capsule (2.3 × 1.1 m), a stretcher (2 m), a
// door (2.6 m) or a 10-ft container (2.99 × 2.59 m) keep plausible proportions.
// The arrangements follow the in-game rooms: the hub cryo bay shows the ECHO-8
// locker to the west, the CAPSULES bay door, DAVID-8R "à gauche de la capsule",
// then the single horizontal capsule where Echo-9 wakes (capsule 03); the
// briefing table gathers the three named officers and Echo-9; the quay of
// Port-Méridien holds Tomas Wren and the three residents to escort.
const PERSON_M = 1.8;
const item = (kind, x, w, h, extra = {}) => Object.freeze({ kind, x, w, h, ...extra });
const SETS_V188 = Object.freeze({
  cryo: Object.freeze({ scale: 140, floor: 510, items: Object.freeze([
    item('locker', 120, .9, 2.2, { label: 'ECHO-8', sealed: true }),
    item('bay-door', 310, 1.6, 2.6, { label: 'CAPSULES' }),
    item('person', 640, .5, PERSON_M, { who: 'DAVID-8R', crewId: 'crew-10-david-8r', android: true }),
    item('capsule', 770, 2.3, 1.1, { number: '03', open: true })
  ]) }),
  locker: Object.freeze({ scale: 190, floor: 610, items: Object.freeze([
    item('shelf', 250, .9, .8, { mount: 1.3 }),
    item('locker', 555, .9, 2.2, { label: 'ECHO-8', sealed: true }),
    item('trolley', 820, .8, .9)
  ]) }),
  hologram: Object.freeze({ scale: 220, floor: 700, items: Object.freeze([
    item('table', 299, 3.1, .9),
    item('person', 140, .5, PERSON_M, { who: 'INEZ HARLOW', crewId: 'crew-09-inez-harlow' }),
    item('person', 320, .5, PERSON_M, { who: 'LT. MARA VEGA', crewId: 'crew-01-mara-vega' }),
    item('person', 960, .5, PERSON_M, { who: 'TAMSIN VELEZ', crewId: 'crew-02-tamsin-velez' }),
    item('person', 1140, .5, PERSON_M, { who: 'ECHO-9' })
  ]) }),
  triage: Object.freeze({ scale: 180, floor: 560, items: Object.freeze([
    item('person', 640, .5, 1.7, { who: 'LUCIA FERRO' }),
    item('stretcher', 760, 2, .85),
    item('patient', 785, 1.75, .25, { bandaged: true })
  ]) }),
  quay: Object.freeze({ scale: 80, floor: 520, items: Object.freeze([
    item('container', 20, 2.99, 2.59, { stack: 2, label: 'QZ17' }), item('container', 270, 2.99, 2.59, { stack: 1 }),
    item('container', 940, 2.99, 2.59, { stack: 1, label: 'QZ17' }), item('container', 1180, 2.99, 2.59, { stack: 2 }),
    item('airlock', 600, 2.4, 2.6, { lit: true })
  ]) }),
  cradle: Object.freeze({ scale: 200, floor: 560, items: Object.freeze([
    item('person', 170, .5, PERSON_M, { who: 'ECHO-9', torch: true }),
    item('cradle', 470, 2.4, 1, { label: 'QZ17', restraints: 3, torn: true })
  ]) })
});
// Who stands on the quay, per shot (`cast` on the shot).
const QUAY_CASTS_V188 = Object.freeze({
  arrival: Object.freeze([item('person', 470, .5, PERSON_M, { who: 'TOMAS WREN' }),
    item('resident', 820, .45, 1.75, { who: 'HABITANT 1' }), item('resident', 868, .45, 1.6, { who: 'HABITANT 2' }), item('resident', 906, .4, 1.3, { who: 'HABITANT 3' })]),
  elder: Object.freeze([item('person', 480, .5, 1.75, { who: 'ASHA MBAYE', crewId: 'crew-12-asha-mbaye' }), item('person', 860, .5, 1.62, { who: 'ADÈLE SARRAZIN', elder: true })])
});
/** Pure: the set of a scene, in pixels, with the metres it was built from. */
export function cinematicSetLayoutV188(scene, { cast = null } = {}) {
  const set = SETS_V188[scene]; if (!set) return null;
  const items = [...set.items, ...(scene === 'quay' && QUAY_CASTS_V188[cast] ? QUAY_CASTS_V188[cast] : [])];
  return { scene, scale: set.scale, floor: set.floor, items: items.map(entry => ({ ...entry, metres: [entry.w, entry.h],
    px: { x: entry.x, w: Math.round(entry.w * set.scale), h: Math.round(entry.h * set.scale) } })) };
}
export const CINEMATIC_SET_SCENES_V188 = Object.freeze(Object.keys(SETS_V188));
export const QUAY_CAST_IDS_V188 = Object.freeze(Object.keys(QUAY_CASTS_V188));

/** Standing human silhouette: feet on `floor`, height in px (head ≈ 1/7.5 of the body). */
function figure(ctx, x, floor, height, color = '#020504', { rim = null, elder = false, android = false } = {}) {
  const head = height / 7.5, shoulders = height * .26, top = floor - height;
  ctx.fillStyle = color;
  ctx.save(); if (elder) { ctx.translate(x, floor); ctx.rotate(.05); ctx.translate(-x, -floor); } // a slight stoop
  ctx.beginPath(); ctx.ellipse(x, top + head / 2, head * .4, head / 2, 0, 0, Math.PI * 2); ctx.fill(); // head
  ctx.fillRect(x - head * .16, top + head * .9, head * .32, head * .4); // neck
  ctx.beginPath(); ctx.moveTo(x - shoulders / 2, top + head * 1.25); ctx.lineTo(x + shoulders / 2, top + head * 1.25); // torso
  ctx.lineTo(x + shoulders * .38, floor - height * .47); ctx.lineTo(x - shoulders * .38, floor - height * .47); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - shoulders * .36, floor - height * .48, shoulders * .32, height * .48); ctx.fillRect(x + shoulders * .04, floor - height * .48, shoulders * .32, height * .48); // legs
  ctx.fillRect(x - shoulders * .62, top + head * 1.3, shoulders * .14, height * .36); ctx.fillRect(x + shoulders * .48, top + head * 1.3, shoulders * .14, height * .36); // arms
  if (android) { ctx.fillStyle = 'rgba(235,240,235,.35)'; ctx.fillRect(x - head * .3, top + head * .4, head * .6, 2); } // DAVID's even pale eyeline
  if (rim) { ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, top + head / 2, head * .4, head / 2, 0, -Math.PI * .9, -Math.PI * .1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - shoulders / 2, top + head * 1.25); ctx.lineTo(x + shoulders / 2, top + head * 1.25); ctx.stroke(); }
  ctx.restore();
}
function drawSet(ctx, scene, { cast = null, time = 0, reducedMotion = false, speakerId = null } = {}) {
  const layout = cinematicSetLayoutV188(scene, { cast }); if (!layout) return null;
  const { floor, scale } = layout;
  for (const entry of layout.items) {
    const { x, w, h } = entry.px, top = floor - h;
    switch (entry.kind) {
      case 'locker': { // standalone steel locker, label plate, seal tape across the door
        ctx.fillStyle = '#1d2a2e'; ctx.fillRect(x, top, w, h); ctx.strokeStyle = 'rgba(160,200,205,.25)'; ctx.lineWidth = 2; ctx.strokeRect(x + .5, top + .5, w - 1, h - 1);
        ctx.fillStyle = '#0d1517'; ctx.fillRect(x + w * .12, top + h * .13, w * .76, h * .82);
        ctx.fillStyle = 'rgba(180,210,210,.18)'; for (let i = 0; i < 4; i++) ctx.fillRect(x + w * .25, top + h * (.2 + i * .03), w * .5, 2); // vents
        ctx.fillStyle = '#d8e6d8'; ctx.font = `700 ${Math.max(12, Math.round(w * .16))}px monospace`; ctx.textAlign = 'center'; ctx.fillText(entry.label, x + w / 2, top + h * .09); ctx.textAlign = 'left';
        if (entry.sealed) { ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = Math.max(4, w * .05); ctx.beginPath();
          ctx.moveTo(x + w * .16, top + h * .45); ctx.lineTo(x + w * .84, top + h * .78); ctx.moveTo(x + w * .84, top + h * .45); ctx.lineTo(x + w * .16, top + h * .78); ctx.stroke(); }
        break;
      }
      case 'bay-door': { // the CAPSULES bay door, two upright stasis windows behind it (as in the room)
        ctx.fillStyle = '#2a2a20'; ctx.fillRect(x, top, w, h); ctx.fillStyle = '#14191a'; ctx.fillRect(x + w * .1, top + h * .08, w * .8, h * .9);
        for (const side of [.16, .54]) { ctx.fillStyle = 'rgba(120,200,210,.22)'; ctx.fillRect(x + w * side, top + h * .18, w * .3, h * .55);
          ctx.fillStyle = 'rgba(10,20,22,.8)'; ctx.beginPath(); ctx.ellipse(x + w * (side + .15), top + h * .3, w * .05, h * .04, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x + w * (side + .1), top + h * .34, w * .1, h * .3); }
        ctx.fillStyle = '#9fe7cf'; ctx.font = '700 14px monospace'; ctx.fillText(entry.label, x + w * .22, top - 12); break;
      }
      case 'capsule': { // horizontal hypersleep capsule: body, raised canopy when open, frost, number plate
        const body = h * .55, canopy = h - body;
        ctx.fillStyle = '#1b2a31'; ctx.fillRect(x, floor - body, w, body - h * .12); ctx.fillStyle = 'rgba(160,215,235,.25)'; ctx.fillRect(x, floor - body, w, 3);
        ctx.fillStyle = '#121d22'; ctx.fillRect(x + w * .08, floor - h * .12, w * .1, h * .12); ctx.fillRect(x + w * .82, floor - h * .12, w * .1, h * .12); // feet
        ctx.fillStyle = '#26363d'; ctx.fillRect(x + w * .86, floor - body - canopy * .4, w * .14, body * .9 + canopy * .4); // head-end machinery
        light(ctx, x + w / 2, floor - body, w * .5, entry.open ? 'rgba(120,200,230,.14)' : 'rgba(120,200,230,.24)');
        ctx.save(); ctx.translate(x + w * .03, floor - body); if (entry.open) ctx.rotate(-.38);
        ctx.fillStyle = 'rgba(160,215,235,.22)'; ctx.beginPath(); ctx.ellipse(w * .42, 0, w * .42, canopy, 0, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(200,235,245,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(w * .42, 0, w * .42, canopy, 0, Math.PI, 0); ctx.stroke();
        const melt = entry.open ? 6 : 16; ctx.fillStyle = 'rgba(230,248,252,.3)'; for (let f = 0; f < melt; f++) ctx.fillRect(w * .08 + (f * 41) % (w * .68), -canopy * .8 + (f * 17) % (canopy * .7), 4, 3);
        ctx.restore();
        if (entry.open) mist(ctx, time, reducedMotion, 'rgba(200,230,240,.05)', floor - body - 6);
        ctx.fillStyle = '#0c1416'; ctx.fillRect(x + w * .2, floor - body * .62, w * .5, 20); ctx.fillStyle = entry.open ? '#e9d07a' : '#9fe7cf'; ctx.font = '700 13px monospace';
        ctx.fillText(`CAPSULE ${entry.number}${entry.open ? ' · OUVERTE' : ''}`, x + w * .22, floor - body * .62 + 15); break;
      }
      case 'shelf': { const y = floor - entry.mount * scale - h; ctx.fillStyle = '#2b281f'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#d8d2bd';
        for (let i = 0; i < 6; i++) ctx.fillRect(x + 10 + (i % 3) * (w / 3.2), y + 12 + Math.floor(i / 3) * (h / 2), w / 5, h / 3.2); break; }
      case 'trolley': { ctx.fillStyle = '#2a2f2c'; ctx.fillRect(x, top, w, 8); ctx.fillRect(x, top + h * .5, w, 8); ctx.fillRect(x + 4, top, 6, h); ctx.fillRect(x + w - 10, top, 6, h); break; }
      case 'table': { ctx.fillStyle = '#0c1a16'; ctx.fillRect(x, top, w, 30); ctx.fillStyle = '#071210'; ctx.fillRect(x + 20, top + 30, w - 40, h - 30); break; }
      case 'stretcher': { // 2 m wheeled stretcher
        ctx.fillStyle = '#3a4448'; ctx.fillRect(x, top, w, 20); ctx.fillRect(x + w * .06, top + 20, 10, h - 34); ctx.fillRect(x + w * .9, top + 20, 10, h - 34);
        ctx.fillRect(x + w * .06, floor - 26, w * .86, 6); for (const wx of [.08, .92]) { ctx.beginPath(); ctx.arc(x + w * wx, floor - 8, 8, 0, Math.PI * 2); ctx.fill(); } break;
      }
      case 'patient': { // lying adult on the stretcher, bandaged chest, breathing
        const deck = layout.items.find(other => other.kind === 'stretcher'), y = floor - (deck ? deck.px.h : 0) - h, head = PERSON_M / 7.5 * scale;
        ctx.fillStyle = '#6b5a4c'; ctx.fillRect(x, y, w - head, h); ctx.beginPath(); ctx.ellipse(x + w - head / 2, y + h * .4, head / 2, head * .42, 0, 0, Math.PI * 2); ctx.fill();
        const breath = reducedMotion ? 0 : Math.sin(time * 2.2) * 2; ctx.fillStyle = '#e8e2d0'; ctx.fillRect(x + w * .52, y - 3 - breath, w * .22, h + 6);
        ctx.fillStyle = 'rgba(160,40,30,.45)'; ctx.fillRect(x + w * .6, y + h * .3 - breath, w * .05, h * .3); break;
      }
      case 'container': { // 10-ft containers, stacked; QZ17 marks the sealed ones
        for (let level = 0; level < entry.stack; level++) { const y = floor - h * (level + 1);
          ctx.fillStyle = (Math.round(x / 60) + level) % 2 ? '#222b33' : '#2d261d'; ctx.fillRect(x, y, w, h - 2);
          ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let r = 8; r < w - 4; r += 12) ctx.fillRect(x + r, y + 6, 2, h - 14);
          if (entry.label && level === 0) { ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 2; ctx.strokeRect(x + w * .28, y + h * .35, w * .44, h * .22);
            ctx.fillStyle = '#e9d07a'; ctx.font = '700 13px monospace'; ctx.fillText(entry.label, x + w * .34, y + h * .51); } }
        break;
      }
      case 'airlock': { ctx.fillStyle = '#1d2328'; ctx.fillRect(x - 10, top - 10, w + 20, h + 10); ctx.fillStyle = '#0b1013'; ctx.fillRect(x, top, w, h);
        if (entry.lit) { light(ctx, x + w / 2, top - 14, 70, 'rgba(240,200,120,.5)'); ctx.fillStyle = '#e9d07a'; ctx.fillRect(x + w * .3, top - 18, w * .4, 6); } break; }
      case 'resident': figure(ctx, x, floor, h, '#2a2c2e', { rim: 'rgba(240,200,120,.6)' }); break;
      case 'person': {
        const speaking = speakerId && entry.crewId === speakerId;
        figure(ctx, x, floor, h, '#020504', { rim: speaking ? 'rgba(120,230,190,.7)' : 'rgba(120,190,170,.22)', elder: entry.elder, android: entry.android });
        if (entry.torch) cone(ctx, x + 20, floor - h * .7, 300, floor + 40, 'rgba(230,240,210,.08)');
        break;
      }
      case 'cradle': { // refrigerated transport cradle, human-sized cavity, lid forced outward, restraints snapped
        ctx.fillStyle = '#26323a'; ctx.fillRect(x, top, w, h); ctx.fillStyle = '#0e1517'; ctx.fillRect(x + w * .05, top + h * .15, w * .9, h * .75); // cavity
        ctx.fillStyle = 'rgba(200,230,240,.3)'; for (let i = 0; i < 30; i++) ctx.fillRect(x + w * .06 + (i * 37) % (w * .88), top + h * .17 + (i * 23) % (h * .7), 5, 5); // frost
        ctx.save(); ctx.translate(x + w, top); ctx.rotate(-.55); ctx.fillStyle = '#2f3c44'; ctx.fillRect(0, -14, w * .5, 14); ctx.restore(); // lid bent outward, upward
        for (let i = 0; i < entry.restraints; i++) { const sx = x + w * (.22 + i * .26); // anchored low, snapped mid-span
          ctx.strokeStyle = '#8b8f86'; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(sx, top + h * .88); ctx.lineTo(sx + 8, top + h * .55); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx + w * .12, top + h * .17); ctx.lineTo(sx + w * .1, top + h * .36 + i * 6); ctx.stroke();
          if (entry.torn) { ctx.strokeStyle = '#c4c08a'; ctx.lineWidth = 2; ctx.beginPath(); // frayed ends
            ctx.moveTo(sx + 8, top + h * .55); ctx.lineTo(sx + 1, top + h * .48); ctx.moveTo(sx + 8, top + h * .55); ctx.lineTo(sx + 16, top + h * .49); ctx.stroke(); } }
        ctx.fillStyle = '#e9d07a'; ctx.font = '700 16px monospace'; ctx.fillText(entry.label, x + 12, top + h * .11 + 2);
        break;
      }
      default: break;
    }
  }
  return layout;
}
function background(ctx, images, scene, time, reducedMotion, { cast = null, speakerId = null } = {}) {
  const set = { cast, time, reducedMotion, speakerId };
  if (scene === 'hologram') {
    ctx.fillStyle = '#030907'; ctx.fillRect(0, 0, W, H);
    cone(ctx, 640, 560, 760, 140, 'rgba(70,190,160,.16)'); // the table projects upwards
    ctx.strokeStyle = 'rgba(95,210,180,.55)'; ctx.lineWidth = 2;
    const spin = reducedMotion ? 0 : time * .25, flicker = reducedMotion ? 1 : .85 + .15 * Math.sin(time * 23);
    ctx.globalAlpha = flicker;
    ctx.beginPath(); ctx.ellipse(640, 300, 170, 170, 0, 0, Math.PI * 2); ctx.stroke(); // Cocyte
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(640, 300, 170, 170 * Math.abs(Math.cos(spin + i * .45)), 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(640, 300, 290, 70, -.25, 0, Math.PI * 2); ctx.stroke(); // orbit
    const sx = 640 + Math.cos(spin * 1.6) * 290, sy = 300 + Math.sin(spin * 1.6) * 70 * .9;
    ctx.fillStyle = '#e15b4f'; ctx.fillRect(sx - 7, sy - 7, 14, 14); // Asphodèle, red quarantine light
    ctx.font = '13px monospace'; ctx.fillStyle = '#9fe7cf'; ctx.fillText('COCYTE', 600, 110); ctx.fillStyle = '#e15b4f'; ctx.fillText('ASPHODÈLE · QZ ROUGE', sx + 12, sy - 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(150,240,210,.05)'; for (let y = 110; y < 520; y += 6) ctx.fillRect(420, y, 440, 1); // projection scanlines
    drawSet(ctx, 'hologram', set); // the table and, backlit around it, Harlow, Vega, Velez and Echo-9
    return;
  }
  const palette = { cryo: ['#061014', '#10232a'], range: ['#100f0a', '#22200f'], quay: ['#070a0d', '#141b22'], triage: ['#0d1112', '#1e2629'], quarters: ['#0d0a08', '#1d1712'], dropship: ['#0a0606', '#1c0f0d'], cradle: ['#0b1113', '#162024'], lab: ['#0d1214', '#1b2428'], alarm: ['#140606', '#2a0e0c'] }[scene] || ['#0b0f10', '#151b1d'];
  const g = ctx.createLinearGradient?.(0, 0, 0, H);
  if (g) { g.addColorStop(0, palette[1]); g.addColorStop(1, palette[0]); ctx.fillStyle = g; } else ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.025)'; for (let x = 0; x < W; x += 160) ctx.fillRect(x, 0, 2, H);
  if (scene === 'cryo') { // the hub cryo bay as played: ECHO-8 locker, CAPSULES bay door, DAVID-8R, capsule 03 open
    for (const x of [260, 700, 1000]) { ctx.fillStyle = 'rgba(200,235,245,.55)'; ctx.fillRect(x - 70, 110, 140, 6); cone(ctx, x, 116, 360, 510, 'rgba(150,210,230,.09)'); }
    ctx.fillStyle = '#0b161b'; ctx.fillRect(0, 510, W, 210); // deck
    drawSet(ctx, 'cryo', set);
    mist(ctx, time, reducedMotion, 'rgba(190,225,235,.025)', 490);
  }
  if (scene === 'range') { // firing lanes, man-shaped boards, sodium work lights
    for (const x of [320, 960]) { ctx.fillStyle = 'rgba(255,200,110,.7)'; ctx.fillRect(x - 40, 96, 80, 5); cone(ctx, x, 101, 420, 600, 'rgba(255,190,100,.09)'); }
    ctx.fillStyle = '#1b1a12'; ctx.fillRect(0, 540, W, 180);
    for (let i = 0; i < 5; i++) { const x = 180 + i * 230; ctx.fillStyle = '#2a281c'; ctx.fillRect(x, 300, 6, 240); // lane divider
      ctx.fillStyle = '#4c4a3a'; ctx.beginPath(); ctx.arc(x + 110, 330, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x + 88, 350, 44, 80); }
  }
  if (scene === 'quay' || scene === 'dropship') {
    if (scene === 'quay') { // cranes and container stacks against floodlights
      ctx.fillStyle = '#05080a'; ctx.fillRect(140, 150, 20, 400); ctx.fillRect(140, 150, 300, 16); ctx.fillRect(980, 190, 18, 360); ctx.fillRect(820, 190, 260, 14);
      ctx.fillStyle = '#0d1216'; ctx.fillRect(0, 520, W, 200); // quay slab
      drawSet(ctx, 'quay', set); // 10-ft containers (two marked QZ17), the lit airlock, and who stands on the quay
      for (const x of [300, 900]) { light(ctx, x, 140, 60, 'rgba(255,236,190,.6)'); cone(ctx, x, 140, 520, 640, 'rgba(255,230,180,.08)'); }
      ctx.fillStyle = 'rgba(255,230,180,.06)'; for (let i = 0; i < 12; i++) ctx.fillRect(240 + (i * 97) % 760, 580 + (i % 4) * 8, 60, 2); // wet reflections
      rain(ctx, time, reducedMotion, 'rgba(170,200,210,.22)');
    } else { // dropship troop bay: red cabin light, seats, straps; the hull shakes
      const [dx, dy] = shake(time, 2.4, reducedMotion); ctx.save(); ctx.translate(dx, dy);
      light(ctx, 640, 120, 520, 'rgba(200,40,30,.22)');
      for (const x of [300, 980]) { ctx.fillStyle = '#081013'; ctx.beginPath(); ctx.arc(x, 180, 34, 0, Math.PI * 2); ctx.fill(); // portholes, rain outside
        ctx.save(); ctx.beginPath(); ctx.arc(x, 180, 30, 0, Math.PI * 2); ctx.clip(); rain(ctx, time, reducedMotion, 'rgba(170,200,210,.5)'); ctx.restore();
        ctx.strokeStyle = '#3a2a24'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, 180, 34, 0, Math.PI * 2); ctx.stroke(); }
      for (let i = 0; i < 6; i++) { const x = 90 + i * 190; ctx.fillStyle = '#1e1110'; ctx.fillRect(x, 300, 120, 200); ctx.fillStyle = '#2c1a17'; ctx.fillRect(x + 10, 250, 100, 60);
        ctx.strokeStyle = '#4a2f26'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 30, 260); ctx.lineTo(x + 60, 420); ctx.moveTo(x + 90, 260); ctx.lineTo(x + 60, 420); ctx.stroke(); }
      ctx.fillStyle = (Math.floor(time * 1.4) % 2) ? '#e15b4f' : '#5a1f1b'; ctx.fillRect(620, 112, 40, 10); ctx.restore();
    }
  }
  if (scene === 'triage') { // curtains, surgical lamp, stretcher and a patient with a bandaged chest (primitives)
    ctx.fillStyle = 'rgba(190,200,190,.08)'; for (let x = 80; x < 640; x += 36) ctx.fillRect(x, 130, 20, 380);
    light(ctx, 940, 150, 70, 'rgba(240,250,255,.55)'); cone(ctx, 940, 150, 420, 520, 'rgba(230,240,245,.10)');
    ctx.fillStyle = '#151b1d'; ctx.fillRect(0, 560, W, 160); // floor
    drawSet(ctx, 'triage', set); // Lucia Ferro beside the 2 m stretcher, the patient's chest bandaged
  }
  if (scene === 'cradle') { ctx.fillStyle = '#0a1012'; ctx.fillRect(0, 560, W, 160); drawSet(ctx, 'cradle', set); } // the maintenance alcove
  if (scene === 'lab') { // Inez's bench: lamp, sample rack, screen
    light(ctx, 900, 220, 300, 'rgba(200,230,240,.12)'); ctx.fillStyle = '#1a2226'; ctx.fillRect(560, 430, 640, 24); ctx.fillRect(590, 454, 14, 140); ctx.fillRect(1160, 454, 14, 140);
    ctx.fillStyle = '#0d1611'; ctx.fillRect(980, 300, 170, 120); ctx.fillStyle = 'rgba(120,230,170,.3)'; for (let y = 316; y < 404; y += 12) ctx.fillRect(994, y, 90 + (y % 5) * 10, 3);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i === 3 ? 'rgba(233,208,122,.6)' : 'rgba(160,220,230,.35)'; ctx.fillRect(640 + i * 26, 396, 10, 34); }
  }
  if (scene === 'quarters') { // one desk lamp, a terminal, the rest in shadow
    light(ctx, 860, 300, 340, 'rgba(255,190,110,.16)'); ctx.fillStyle = '#1a140f'; ctx.fillRect(620, 420, 520, 26); ctx.fillStyle = '#0d1611'; ctx.fillRect(760, 300, 200, 120);
    ctx.fillStyle = 'rgba(120,230,170,.35)'; for (let y = 316; y < 404; y += 12) ctx.fillRect(776, y, 120 + (y % 5) * 10, 3);
  }
}
function portrait(ctx, images, crewId, name, x, y, size) {
  ctx.fillStyle = '#0a1210'; ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = 'rgba(131,213,161,.6)'; ctx.strokeRect(x + .5, y + .5, size - 1, size - 1);
  const profile = crewId ? getNpcDialoguePortraitV168(crewId) : null, image = profile ? images[profile.source] : null;
  if (profile && ready(image) && ctx.drawImage) {
    const crop = profile.crop; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, x + 4, y + 4, size - 8, size - 8); return true;
  }
  const initials = String(name).split(/[\s·.]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  ctx.fillStyle = '#83d5a1'; ctx.font = `700 ${Math.round(size / 3)}px monospace`; ctx.textAlign = 'center';
  ctx.fillText(initials, x + size / 2, y + size / 2 + size / 9); ctx.textAlign = 'left'; return false;
}

export function drawCinematicFrameV188(ctx, id, time, { images = {}, language = 'fr', reducedMotion = false, context = {} } = {}) {
  const at = cinematicShotAtV188(id, time); if (!ctx || !at) return null;
  const { shot: current, local, progress, index } = at, lang = language === 'en' ? 'en' : 'fr';
  pendingCaptions = []; let subtitle = null;
  ctx.save(); ctx.textAlign = 'left';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const camera = cinematicCameraV188(current, progress, reducedMotion);
  ctx.save(); ctx.translate(W / 2 + camera.x, H / 2 + camera.y); ctx.scale(camera.zoom, camera.zoom); ctx.translate(-W / 2, -H / 2);
  switch (current.kind) {
    case 'telemetry': {
      ctx.strokeStyle = '#59d27f'; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= W; x += 8) { const beat = (x / 8 + Math.floor(local * 12)) % 40 === 0 ? -60 : 0; const y = 360 + beat + Math.sin(x * .05) * 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); break;
    }
    case 'relay-rain': {
      ctx.fillStyle = '#0b1014'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1b242b'; ctx.fillRect(520, 220, 240, 380); ctx.fillRect(610, 90, 60, 140); // relay mast and hut
      ctx.fillStyle = (Math.floor(local * 1.5) % 2) ? '#e15b4f' : '#5a1f1b'; ctx.fillRect(632, 80, 16, 10);
      ctx.fillStyle = 'rgba(140,220,200,.65)'; ctx.fillRect(560, 300, 60, 34);
      rain(ctx, local, reducedMotion); caption(ctx, current.caption?.[lang]); break;
    }
    case 'terminal': {
      ctx.fillStyle = '#071009'; ctx.fillRect(200, 120, 880, 420); ctx.strokeStyle = '#2f6d45'; ctx.strokeRect(200.5, 120.5, 880, 420);
      ctx.font = '22px monospace'; ctx.fillStyle = '#8df0b0';
      ctx.fillText(`QZ-18 · FILE DE DÉTRESSE · ${current.clock}`, 240, 180);
      const rows = current.lines.map(entry => entry[lang]), total = rows.join('').length;
      let budget = Math.ceil(total * Math.min(1, progress * 2.2));
      rows.forEach((row, index) => { const visible = row.slice(0, Math.max(0, budget)); budget -= row.length; if (visible) ctx.fillText(visible, 240, 250 + index * 34); });
      if (progress > .5) { ctx.fillStyle = (Math.floor(local * 2) % 2) ? '#e9d07a' : '#7c6c38'; ctx.font = '700 34px monospace'; ctx.fillText(current.status[lang], 240, 380); }
      caption(ctx, current.caption?.[lang]); break;
    }
    case 'badge': {
      ctx.fillStyle = '#121414'; ctx.fillRect(0, 380, W, 340); // console desk
      ctx.fillStyle = '#c8c3b2'; ctx.fillRect(560, 430, 160, 100); ctx.fillStyle = '#6f6a5d'; ctx.fillRect(580, 450, 50, 60);
      ctx.fillStyle = '#9a958a'; for (let i = 0; i < 3; i++) ctx.fillRect(645, 455 + i * 18, 60, 7); // illegible name
      if (progress > .45) { const reach = Math.min(1, (progress - .45) / .4); ctx.fillStyle = '#2a2622'; ctx.fillRect(W - reach * 620, 470, 620, 70); }
      break;
    }
    case 'orbit-station': {
      if (ready(images[CINEMATIC_IMAGES_V188.space])) ctx.drawImage(images[CINEMATIC_IMAGES_V188.space], 0, 0, W, H);
      if (ready(images[CINEMATIC_IMAGES_V188.planet])) ctx.drawImage(images[CINEMATIC_IMAGES_V188.planet], 380, 300, 900, 520);
      const x = 380 - (reducedMotion ? 0 : local * 6); ctx.fillStyle = '#2b3236'; ctx.fillRect(x, 220, 260, 26); ctx.fillRect(x + 110, 160, 40, 150); // dark station
      ctx.fillStyle = (Math.floor(local * 1.2) % 2) ? '#e15b4f' : '#6a1d18'; ctx.fillRect(x + 124, 150, 12, 12);
      caption(ctx, current.caption?.[lang], 120); break;
    }
    case 'tantalus-orbit': {
      if (ready(images[CINEMATIC_IMAGES_V188.space])) ctx.drawImage(images[CINEMATIC_IMAGES_V188.space], 0, 0, W, H);
      if (ready(images[CINEMATIC_IMAGES_V188.stars])) ctx.drawImage(images[CINEMATIC_IMAGES_V188.stars], 0, 0, W, H);
      if (ready(images[CINEMATIC_IMAGES_V188.planet])) ctx.drawImage(images[CINEMATIC_IMAGES_V188.planet], 520, 360, 900, 520);
      const ship = images[CINEMATIC_IMAGES_V188.tantalus];
      if (ready(ship)) { const width = 620, height = width * ship.naturalHeight / ship.naturalWidth, x = -width + (reducedMotion ? 1 : progress) * (W * .62);
        ctx.drawImage(ship, x, 220, width, height); }
      break;
    }
    case 'dropship-rain': {
      ctx.fillStyle = '#0a0f13'; ctx.fillRect(0, 0, W, H);
      const ship = images[CINEMATIC_IMAGES_V188.dropship];
      if (ready(ship)) { // existing full painting, slow push-in (cover crop)
        const zoom = 1.04 + (reducedMotion ? 0 : progress * .08), scale = Math.max(W / ship.naturalWidth, H / ship.naturalHeight) * zoom;
        const width = ship.naturalWidth * scale, height = ship.naturalHeight * scale;
        ctx.drawImage(ship, (W - width) / 2, (H - height) / 2, width, height);
        ctx.fillStyle = 'rgba(4,8,10,.35)'; ctx.fillRect(0, 0, W, H);
      } else { ctx.fillStyle = '#141b20'; for (let i = 0; i < 4; i++) ctx.fillRect(80 + i * 300, 470, 220, 250); }
      rain(ctx, local, reducedMotion); caption(ctx, current.caption?.[lang]); break;
    }
    case 'cradle': {
      ctx.fillStyle = '#0b1113'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#0a1012'; ctx.fillRect(0, 560, W, 160);
      drawSet(ctx, 'cradle', { time: local, reducedMotion }); // a cradle sized for a lying adult, restraints torn from inside
      caption(ctx, current.caption?.[lang]); break;
    }
    case 'port-tour': {
      ctx.fillStyle = '#0d1114'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1a2026'; ctx.fillRect(0, 520, W, 200); // ground
      const pan = reducedMotion ? 0 : progress * 60;
      if (current.place === 'docks') { for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#3a3226' : '#2c3640'; ctx.fillRect(120 + i * 180 - pan, 420, 150, 100); } ctx.fillStyle = '#4a4f55'; ctx.fillRect(0, 300 - pan * .2, W, 10); }
      if (current.place === 'infirmary') { ctx.fillStyle = '#e8e2d0'; for (let i = 0; i < 4; i++) { ctx.fillRect(180 + i * 240 - pan, 450, 160, 20); ctx.fillStyle = '#3a4448'; ctx.fillRect(190 + i * 240 - pan, 470, 8, 50); ctx.fillStyle = '#e8e2d0'; } ctx.fillStyle = '#c94a42'; ctx.fillRect(600, 200, 80, 20); ctx.fillRect(630, 170, 20, 80); }
      if (current.place === 'processor') { ctx.fillStyle = '#26303a'; ctx.fillRect(430 - pan, 120, 420, 400); ctx.fillStyle = 'rgba(233,160,90,.35)'; ctx.fillRect(470 - pan, 160, 340, 30); ctx.fillStyle = 'rgba(180,190,200,.25)';
        for (let i = 0; i < 8; i++) { const y = 110 - ((reducedMotion ? 0 : local * 30) + i * 25) % 110; ctx.beginPath(); ctx.arc(640 - pan + Math.sin(i) * 60, y, 30, 0, Math.PI * 2); ctx.fill(); } }
      if (current.place === 'wall') { ctx.fillStyle = '#2a2f33'; ctx.fillRect(0, 300, W, 220); ctx.fillStyle = '#3c4247'; for (let x = 0; x < W; x += 90) ctx.fillRect(x - pan % 90, 290, 60, 20);
        ctx.fillStyle = '#e9d07a'; for (let x = 40; x < W; x += 300) ctx.fillRect(x - pan, 340, 18, 18); rain(ctx, local, reducedMotion, 'rgba(160,190,200,.15)'); }
      caption(ctx, current.caption?.[lang]); break;
    }
    case 'ramp': {
      ctx.fillStyle = '#0d1114'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#2a3036'; ctx.beginPath(); ctx.moveTo(300, 560); ctx.lineTo(980, 560); ctx.lineTo(820, 380); ctx.lineTo(460, 380); ctx.fill(); // M577 ramp
      const count = Math.max(0, Math.min(6, Number(context?.m577?.colonists) || 0));
      for (let i = 0; i < count; i++) { const walk = reducedMotion ? .5 : Math.min(1, progress * 1.3 - i * .08), x = 520 + i * 40, y = 400 + walk * 170;
        ctx.fillStyle = '#b8b0a0'; ctx.fillRect(x, y - 46, 16, 46); ctx.beginPath(); ctx.arc(x + 8, y - 54, 8, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#d8e6d8'; ctx.font = '600 22px monospace'; ctx.textAlign = 'center';
      ctx.fillText(count ? `${count} / 6` : (lang === 'en' ? 'NO SEAT GIVEN' : 'AUCUNE PLACE DONNÉE'), W / 2, 596); ctx.textAlign = 'left';
      caption(ctx, current.caption?.[lang], 90); break;
    }
    case 'sealed-crates': {
      ctx.fillStyle = '#0b0f12'; ctx.fillRect(0, 0, W, H);
      const count = Math.max(0, Math.min(3, Number(context?.m577?.containers) || 0));
      for (let i = 0; i < count; i++) { const x = 360 + i * 200; ctx.fillStyle = '#3a3226'; ctx.fillRect(x, 380, 160, 120); ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 3; ctx.strokeRect(x + 6, 386, 148, 108);
        ctx.fillStyle = '#e9d07a'; ctx.font = '700 14px monospace'; ctx.fillText('QZ17', x + 56, 448); }
      ctx.fillStyle = '#d8e6d8'; ctx.font = '600 22px monospace'; ctx.textAlign = 'center';
      ctx.fillText(count ? `${count} / 3` : (lang === 'en' ? 'NO CONTAINER ABOARD' : 'AUCUN CONTENEUR À BORD'), W / 2, 596); ctx.textAlign = 'left';
      caption(ctx, current.caption?.[lang], 90); break;
    }
    case 'bio-screen': {
      ctx.fillStyle = '#060a09'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#2f6d45'; ctx.strokeRect(220.5, 160.5, 840, 400);
      ctx.strokeStyle = 'rgba(141,240,176,.4)'; for (let y = 200; y < 540; y += 22) { ctx.beginPath(); ctx.moveTo(240, y); ctx.lineTo(1040, y); ctx.stroke(); }
      const scan = 240 + ((reducedMotion ? .5 : progress) * 800) % 800; ctx.fillStyle = 'rgba(141,240,176,.25)'; ctx.fillRect(scan, 170, 8, 380);
      if (progress > .45) { ctx.font = '700 40px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = current.tone === 'alarm' ? ((Math.floor(local * 2) % 2) ? '#e15b4f' : '#8a2a24') : '#8df0b0';
        ctx.fillText(current.status[lang], W / 2, 380); ctx.textAlign = 'left'; }
      break;
    }
    case 'helmet-cam': {
      ctx.fillStyle = '#070a08'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#121a16'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(560, 300); ctx.lineTo(720, 300); ctx.lineTo(W, H); ctx.fill(); // corridor
      if (progress > .55) { ctx.fillStyle = '#020302'; ctx.beginPath(); ctx.ellipse(700, 110, 120, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(640, 60, 10, 90); ctx.fillRect(760, 70, 8, 80); } // silhouette on the ceiling
      const seed = Math.floor(local * 20); ctx.fillStyle = 'rgba(200,220,210,.08)';
      for (let i = 0; i < (reducedMotion ? 40 : 260); i++) ctx.fillRect(((i * 7919 + seed * 104729) % W), ((i * 6271 + seed * 1299709) % H), 2, 2); // degraded feed
      ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
      ctx.fillStyle = '#e15b4f'; ctx.font = '14px monospace'; ctx.fillText('● REC', 40, 50); caption(ctx, current.caption?.[lang]); break;
    }
    case 'signal-lost': {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const seed = Math.floor(local * 30);
      if (progress < .2) { ctx.fillStyle = 'rgba(220,230,225,.5)'; for (let i = 0; i < 900; i++) ctx.fillRect(((i * 7919 + seed * 104729) % W), ((i * 6271 + seed * 1299709) % H), 3, 3); }
      caption(ctx, current.caption?.[lang], 380); break;
    }
    case 'alarm-deck': {
      const pulse = reducedMotion ? .5 : .5 + .5 * Math.sin(local * 5);
      ctx.fillStyle = '#0c0707'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(200,40,30,${.12 + pulse * .22})`; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1d1414'; ctx.fillRect(0, 520, W, 200); for (let x = 60; x < W; x += 220) { ctx.fillStyle = '#2a1d1d'; ctx.fillRect(x, 200, 140, 320); }
      ctx.fillStyle = `rgba(255,80,60,${.4 + pulse * .6})`; for (let x = 120; x < W; x += 300) ctx.fillRect(x, 140, 40, 14);
      caption(ctx, current.caption?.[lang]); break;
    }
    case 'title': {
      ctx.textAlign = 'center'; ctx.font = '700 54px sans-serif'; ctx.fillStyle = '#e6efe6';
      ctx.fillText(current.caption[lang], W / 2, H / 2); ctx.textAlign = 'left'; break;
    }
    case 'locker': { // the ECHO-8 locker as it stands in the cryo bay: alone, emptied, sealed
      ctx.fillStyle = '#0d1517'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < W; x += 120) ctx.fillRect(x, 0, 2, 610);
      ctx.fillStyle = '#0a1113'; ctx.fillRect(0, 610, W, 110);
      drawSet(ctx, 'locker', { time: local, reducedMotion });
      caption(ctx, current.caption?.[lang]); break;
    }
    case 'message-burst': {
      ctx.fillStyle = '#071009'; ctx.fillRect(0, 0, W, H); ctx.font = '16px monospace';
      const count = Math.min(37, Math.floor(progress * 46));
      for (let i = 0; i < count; i++) { ctx.fillStyle = i === count - 1 ? '#e9d07a' : '#59d27f';
        const age = i === 36 ? '4 H' : `${lang === 'en' ? 'D' : 'J'}-${Math.max(1, 6 - Math.floor(i / 7))}`;
        ctx.fillText(`PORT-MÉRIDIEN · ${age} · ${lang === 'en' ? 'DISTRESS RELAY' : 'RELAIS DE DÉTRESSE'} #${String(i + 1).padStart(2, '0')}`, i < 19 ? 90 : 680, 90 + (i % 19) * 26); }
      caption(ctx, current.caption?.[lang], 650); break;
    }
    case 'name-list': {
      ctx.fillStyle = '#0c0a08'; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center';
      ctx.font = '600 22px monospace'; ctx.fillStyle = '#b9b2a2'; ctx.fillText(current.caption[lang], W / 2, 150);
      ctx.font = '30px monospace'; ctx.fillStyle = '#e6e0d0';
      NORTH_QUAY_NAMES_V188.forEach((name, index) => { if (progress > index / (NORTH_QUAY_NAMES_V188.length + 1)) ctx.fillText(name, W / 2, 240 + index * 64); });
      ctx.textAlign = 'left'; break;
    }
    case 'port-approach': { // night descent: ridge, the port's lights, the pad beacons, heavy rain
      const sky = ctx.createLinearGradient?.(0, 0, 0, H); if (sky) { sky.addColorStop(0, '#0d1a1f'); sky.addColorStop(1, '#05080a'); ctx.fillStyle = sky; } else ctx.fillStyle = '#081014';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#04070a'; ctx.beginPath(); ctx.moveTo(0, 380); for (let x = 0; x <= W; x += 80) ctx.lineTo(x, 330 + Math.sin(x * .013) * 40 + Math.cos(x * .031) * 18); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      ctx.fillStyle = '#0a0f12'; ctx.fillRect(760, 250, 70, 200); ctx.fillRect(560, 360, 520, 120); ctx.beginPath(); ctx.ellipse(470, 420, 110, 60, 0, Math.PI, 0); ctx.fill(); // processor, blocks, dome
      light(ctx, 795, 250, 80, 'rgba(233,160,90,.35)'); ctx.fillStyle = 'rgba(180,190,200,.12)';
      for (let i = 0; i < 6; i++) { const y = 240 - ((reducedMotion ? 0 : local * 18) + i * 22) % 120; ctx.beginPath(); ctx.arc(795 + Math.sin(i) * 20, y, 26, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,214,150,.75)'; for (let i = 0; i < 40; i++) ctx.fillRect(570 + (i * 53) % 500, 372 + (i * 29) % 90, 4, 3); // windows
      ctx.strokeStyle = 'rgba(140,220,200,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(380, 560, 210, 40, 0, 0, Math.PI * 2); ctx.stroke(); // landing pad
      for (let i = 0; i < 8; i++) { const on = reducedMotion ? true : (Math.floor(local * 3) + i) % 2 === 0; const a = i / 8 * Math.PI * 2;
        ctx.fillStyle = on ? '#e15b4f' : '#4a1612'; ctx.fillRect(380 + Math.cos(a) * 210 - 3, 560 + Math.sin(a) * 40 - 3, 6, 6); }
      rain(ctx, local, reducedMotion, 'rgba(170,200,210,.3)'); caption(ctx, current.caption?.[lang]); break;
    }
    case 'dialogue': {
      background(ctx, images, current.scene, local, reducedMotion, { cast: current.cast, speakerId: current.line?.crewId });
      subtitle = current; break;
    }
    default: break;
  }
  ctx.restore();
  if (current.kind !== 'title') grain(ctx, local, reducedMotion);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, LETTERBOX_V188); ctx.fillRect(0, H - LETTERBOX_V188, W, LETTERBOX_V188);
  if (subtitle) drawSubtitleV188(ctx, images, subtitle, progress, lang, local, reducedMotion);
  drawCaptions(ctx);
  // Fade to black only where the scene changes; lines of one conversation cut directly.
  const shots = CINEMATICS_V188[id].shots;
  fade(ctx, progress, { fadeIn: !(index > 0 && sceneKey(shots[index - 1], index - 1) === sceneKey(current, index)),
    fadeOut: !(index < shots.length - 1 && sceneKey(shots[index + 1], index + 1) === sceneKey(current, index)) });
  ctx.restore();
  return at;
}

/** Lower-third subtitle: small portrait, speaker, typewritten line flowing into the bottom bar. */
function drawSubtitleV188(ctx, images, entry, progress, lang, local, reducedMotion) {
  const speaker = entry.line, top = H - LETTERBOX_V188 - 96;
  const band = ctx.createLinearGradient?.(0, top - 40, 0, H - LETTERBOX_V188);
  if (band) { band.addColorStop(0, 'rgba(0,0,0,0)'); band.addColorStop(1, 'rgba(0,0,0,.78)'); ctx.fillStyle = band; ctx.fillRect(0, top - 40, W, H - LETTERBOX_V188 - top + 40); }
  portrait(ctx, images, speaker.crewId, speaker.speaker, 70, top + 4, 88);
  if (entry.radio) { const seed = reducedMotion ? 3 : Math.floor(local * 18); ctx.fillStyle = 'rgba(233,208,122,.18)'; for (let i = 0; i < 60; i++) ctx.fillRect(74 + (i * 37 + seed * 11) % 80, top + 8 + (i * 53 + seed * 7) % 80, 2, 2); }
  ctx.fillStyle = entry.radio ? '#e9d07a' : '#83d5a1'; ctx.font = '700 16px monospace'; ctx.fillText(speaker.speaker, 180, top + 22);
  ctx.fillStyle = '#eef4ee'; ctx.font = '21px sans-serif';
  const text = speaker.text[lang], visible = text.slice(0, Math.ceil(text.length * Math.min(1, progress * 1.6)));
  wrap(ctx, visible, W - 260).slice(0, 5).forEach((row, row_) => ctx.fillText(row, 180, top + 54 + row_ * 27));
}

/** DOM player: one fullscreen canvas overlay; Escape or the button skips,
 * Space or a click advances to the next shot. Resolves 'complete' or 'skipped'. */
export class CinematicPlayerV188 {
  constructor({ document = globalThis.document, now = () => globalThis.performance?.now?.() ?? Date.now(),
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis), ImageCtor = globalThis.Image } = {}) {
    Object.assign(this, { document, now, requestFrame, ImageCtor }); this.images = {}; this.active = null;
  }
  preload(id) {
    const sources = new Set(Object.values(CINEMATIC_IMAGES_V188));
    for (const entry of CINEMATICS_V188[id]?.shots || []) {
      const profile = entry.line?.crewId ? getNpcDialoguePortraitV168(entry.line.crewId) : null; if (profile) sources.add(profile.source);
    }
    for (const source of sources) if (!this.images[source] && this.ImageCtor) { const image = new this.ImageCtor(); image.src = source; this.images[source] = image; }
  }
  play(id, { language = 'fr', reducedMotion = false, context = {} } = {}) {
    if (!CINEMATICS_V188[id] || !this.document?.body) return Promise.resolve('unavailable');
    this.stop('replaced'); this.preload(id);
    const overlay = this.document.createElement('div'); overlay.className = 'cinematic-v188'; overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', CINEMATICS_V188[id].title[language === 'en' ? 'en' : 'fr']);
    const canvas = this.document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const skip = this.document.createElement('button'); skip.type = 'button'; skip.className = 'button cinematic-skip-v188';
    skip.textContent = language === 'en' ? 'SKIP (ESC)' : 'PASSER (ÉCHAP)';
    overlay.append(canvas, skip); this.document.body.append(overlay);
    const ctx = canvas.getContext('2d'), duration = cinematicDurationV188(id);
    return new Promise(resolve => {
      const state = { id, start: this.now(), offset: 0, overlay, resolve, done: false };
      const finish = reason => { if (state.done) return; state.done = true; this.document.removeEventListener?.('keydown', onKey, true); overlay.remove(); this.active = null; resolve(reason); };
      const elapsed = () => (this.now() - state.start) / 1000 + state.offset;
      const next = () => { const at = cinematicShotAtV188(id, elapsed()); if (!at) return finish('complete'); state.offset += at.shot.seconds - at.local; };
      const onKey = event => {
        if (event.code === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); finish('skipped'); }
        else if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); event.stopImmediatePropagation(); next(); }
      };
      skip.onclick = () => finish('skipped'); canvas.onclick = () => next();
      this.document.addEventListener?.('keydown', onKey, true);
      state.finish = finish; this.active = state;
      const frame = () => {
        if (state.done) return;
        const time = elapsed();
        if (time >= duration) return finish('complete');
        drawCinematicFrameV188(ctx, id, time, { images: this.images, language, reducedMotion, context });
        this.requestFrame?.(frame);
      };
      frame();
    });
  }
  stop(reason = 'stopped') { this.active?.finish?.(reason); }
}
