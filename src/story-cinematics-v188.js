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
  tantalus: '/assets/openai/ui/title/v79/orbitals/orbitals-01-tantalus-transport.png'
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
  'cin-p3-wren': Object.freeze({ id: 'cin-p3-wren', title: t('Le quai des vivants', 'The quay of the living'), music: null, shots: Object.freeze([
    shot(7, 'dialogue', { scene: 'quay', line: line('TOMAS WREN', null,
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
function fade(ctx, progress) {
  const alpha = progress < .08 ? 1 - progress / .08 : progress > .92 ? (progress - .92) / .08 : 0;
  if (alpha > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, alpha)})`; ctx.fillRect(0, 0, W, H); }
}
function caption(ctx, text, y = 640) {
  if (!text) return;
  ctx.textAlign = 'center'; ctx.font = '600 28px monospace'; ctx.fillStyle = '#d8e6d8'; ctx.fillText(text, W / 2, y); ctx.textAlign = 'left';
}
function rain(ctx, time, reducedMotion, color = 'rgba(160,190,200,.35)') {
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  for (let i = 0; i < 180; i++) {
    const x = (i * 97) % W, speed = 520 + (i % 7) * 40, y = ((i * 53) + (reducedMotion ? 0 : time * speed)) % (H + 40) - 40;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 26); ctx.stroke();
  }
}
function background(ctx, images, scene, time, reducedMotion) {
  if (scene === 'hologram') {
    ctx.fillStyle = '#05100e'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(95,210,180,.55)'; ctx.lineWidth = 2;
    const spin = reducedMotion ? 0 : time * .25;
    ctx.beginPath(); ctx.ellipse(640, 300, 170, 170, 0, 0, Math.PI * 2); ctx.stroke(); // Cocyte
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(640, 300, 170, 170 * Math.abs(Math.cos(spin + i * .45)), 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(640, 300, 290, 70, -.25, 0, Math.PI * 2); ctx.stroke(); // orbit
    const sx = 640 + Math.cos(spin * 1.6) * 290, sy = 300 + Math.sin(spin * 1.6) * 70 * .9;
    ctx.fillStyle = '#e15b4f'; ctx.fillRect(sx - 7, sy - 7, 14, 14); // Asphodèle, red quarantine light
    ctx.font = '13px monospace'; ctx.fillStyle = '#9fe7cf'; ctx.fillText('COCYTE', 600, 110); ctx.fillStyle = '#e15b4f'; ctx.fillText('ASPHODÈLE · QZ ROUGE', sx + 12, sy - 10);
    return;
  }
  const palette = { cryo: ['#0b1418', '#14262c'], range: ['#151510', '#24231a'], quay: ['#101317', '#1d232b'], triage: ['#121517', '#232a2e'], quarters: ['#120f0c', '#1f1a15'] }[scene] || ['#0b0f10', '#151b1d'];
  const g = ctx.createLinearGradient?.(0, 0, 0, H);
  if (g) { g.addColorStop(0, palette[1]); g.addColorStop(1, palette[0]); ctx.fillStyle = g; } else ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < W; x += 160) ctx.fillRect(x, 0, 2, H);
  if (scene === 'cryo') { ctx.strokeStyle = 'rgba(170,220,235,.4)'; ctx.strokeRect(120, 150, 220, 380); ctx.strokeRect(940, 150, 220, 380); }
  if (scene === 'quay') rain(ctx, time, reducedMotion, 'rgba(160,190,200,.18)');
  if (scene === 'triage') { // stretcher and a patient with a bandaged chest (primitives)
    ctx.fillStyle = '#3a4448'; ctx.fillRect(760, 360, 360, 22); ctx.fillRect(780, 382, 10, 60); ctx.fillRect(1090, 382, 10, 60);
    ctx.fillStyle = '#6b5a4c'; ctx.fillRect(800, 330, 240, 32); ctx.fillStyle = '#e8e2d0'; ctx.fillRect(880, 326, 90, 38);
    ctx.fillStyle = '#6b5a4c'; ctx.beginPath(); ctx.arc(1060, 338, 18, 0, Math.PI * 2); ctx.fill();
    const breath = reducedMotion ? 0 : Math.sin(time * 2.2) * 2; ctx.fillStyle = 'rgba(232,226,208,.5)'; ctx.fillRect(880, 322 - breath, 90, 4); }
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

export function drawCinematicFrameV188(ctx, id, time, { images = {}, language = 'fr', reducedMotion = false } = {}) {
  const at = cinematicShotAtV188(id, time); if (!ctx || !at) return null;
  const { shot: current, local, progress } = at, lang = language === 'en' ? 'en' : 'fr';
  ctx.save(); ctx.textAlign = 'left';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
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
      const typed = current.lines.map(entry => entry[lang]).join(' ');
      ctx.fillText(typed.slice(0, Math.ceil(typed.length * Math.min(1, progress * 2.2))), 240, 260);
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
    case 'title': {
      ctx.textAlign = 'center'; ctx.font = '700 54px sans-serif'; ctx.fillStyle = '#e6efe6';
      ctx.fillText(current.caption[lang], W / 2, H / 2); ctx.textAlign = 'left'; break;
    }
    case 'locker': {
      ctx.fillStyle = '#0d1517'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i === 2 ? '#2b3a3e' : '#1a2427'; ctx.fillRect(240 + i * 170, 140, 150, 440); }
      ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(590, 300); ctx.lineTo(730, 420); ctx.moveTo(730, 300); ctx.lineTo(590, 420); ctx.stroke(); // seal tape
      ctx.fillStyle = '#d8e6d8'; ctx.font = '700 22px monospace'; ctx.fillText('ECHO-8', 618, 190);
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
    case 'dialogue': {
      background(ctx, images, current.scene, local, reducedMotion);
      const speaker = current.line, frameY = 470;
      ctx.fillStyle = 'rgba(3,8,7,.88)'; ctx.fillRect(60, frameY, W - 120, 200); ctx.strokeStyle = 'rgba(131,213,161,.5)'; ctx.strokeRect(60.5, frameY + .5, W - 120, 200);
      portrait(ctx, images, speaker.crewId, speaker.speaker, 84, frameY + 24, 152);
      ctx.fillStyle = current.radio ? '#e9d07a' : '#83d5a1'; ctx.font = '700 18px monospace'; ctx.fillText(speaker.speaker, 266, frameY + 46);
      ctx.fillStyle = '#e6efe6'; ctx.font = '21px sans-serif';
      const text = speaker.text[lang], visible = text.slice(0, Math.ceil(text.length * Math.min(1, progress * 1.6)));
      wrap(ctx, visible, W - 380).slice(0, 5).forEach((row, index) => ctx.fillText(row, 266, frameY + 84 + index * 28));
      break;
    }
    default: break;
  }
  fade(ctx, progress);
  ctx.restore();
  return at;
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
  play(id, { language = 'fr', reducedMotion = false } = {}) {
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
        drawCinematicFrameV188(ctx, id, time, { images: this.images, language, reducedMotion });
        this.requestFrame?.(frame);
      };
      frame();
    });
  }
  stop(reason = 'stopped') { this.active?.finish?.(reason); }
}
