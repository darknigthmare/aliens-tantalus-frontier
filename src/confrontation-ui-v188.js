// V188 — presentation of the no-shooting audience (spec 010). A native <dialog>
// that shares the story dialogs' frame (story-choice-v188 / content-scene-v188),
// with a Canvas 2D stage in the style of the cinematic lower third (portrait
// frame, speaker in radio amber, line in pale green-white, letterbox) and DOM
// buttons for the pieces, so that keyboard, mouse, touch and screen readers all
// use the same controls.
//
// Accessibility: no time limit by default (`roundSeconds` = 0); with reduced
// motion the citation is shown at once and the CRT scanlines stand still; shapes
// carry meaning as well as colour (filled / hollow pips, target tick, labels).
// Keyboard: 1-9 present the matching piece, S stays silent, Tab / arrows move
// between buttons, Enter or Space activates. Escape cannot dismiss a hearing.
//
// Portraits: no franchise likeness and no generated image. Halloran speaks over a
// QZ link (bible §2.3: « ne s'adresse au Tantalus que par messages différés »), so
// she is a CRT bust drawn with primitives behind the named slot of her entry;
// CASSIUS is its core. Both are Canvas placeholders [PROPOSÉ].
// Quest `ship-bioforge` (owner decision 2026-11-23): BISHOP-9 is a synthetic bust (project
// character, no actor's likeness: a pale even face, a neat parting, a status light at the collar)
// and Inez Harlow, who listens, a small scientist bust (lab coat, goggles pushed up). Canvas
// placeholders too, behind the named slots of the entry.

export const CONFRONTATION_STAGE_V188 = Object.freeze({ width: 960, height: 360 });
const W = CONFRONTATION_STAGE_V188.width, H = CONFRONTATION_STAGE_V188.height, BAR = 22;
const UI_TEXT = Object.freeze({
  ground: { fr: 'TERRAIN', en: 'GROUND' }, credibility: { fr: 'CRÉDIBILITÉ', en: 'CREDIBILITY' },
  round: { fr: 'ÉCHANGE', en: 'EXCHANGE' }, silence: { fr: 'SE TAIRE (S)', en: 'STAY SILENT (S)' },
  notHeld: { fr: 'non versée au dossier', en: 'not in the file' }, spent: { fr: 'déjà présentée', en: 'already presented' },
  present: { fr: 'Présenter', en: 'Present' }, continue: { fr: 'CONTINUER', en: 'CONTINUE' },
  pieces: { fr: 'Pièces du dossier QZ17', en: 'QZ17 file pieces' }, cites: { fr: 'cite', en: 'cites' },
  echo: { fr: 'ECHO-9 présente', en: 'ECHO-9 presents' }, echoSilent: { fr: 'ECHO-9 se tait.', en: 'ECHO-9 stays silent.' },
  won: { fr: 'AUDIENCE GAGNÉE', en: 'HEARING WON' }, lost: { fr: 'AUDIENCE PERDUE', en: 'HEARING LOST' },
  unwinnable: { fr: 'Le terrain restant ne suffit plus.', en: 'The remaining ground is no longer enough.' },
  result: { decisive: { fr: 'décisive', en: 'decisive' }, partial: { fr: 'partielle', en: 'partial' }, wrong: { fr: 'hors sujet', en: 'off the point' }, silence: { fr: 'silence', en: 'silence' } }
});
const tx = (entry, lang) => entry[lang === 'en' ? 'en' : 'fr'];

function wrap(ctx, text, width) {
  const words = String(text || '').split(/\s+/).filter(Boolean), rows = []; let row = '';
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (row && (ctx.measureText?.(next)?.width ?? next.length * 9) > width) { rows.push(row); row = word; } else row = next;
  }
  if (row) rows.push(row); return rows;
}

/** CRT bust (Halloran) — primitives only, transparent outside the frame. */
function drawCrtBust(ctx, x, y, size, time, still) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
  ctx.fillStyle = '#0b1a12'; ctx.fillRect(x, y, size, size);
  const glow = ctx.createRadialGradient?.(x + size / 2, y + size * .45, 8, x + size / 2, y + size * .45, size * .7);
  if (glow) { glow.addColorStop(0, 'rgba(131,213,161,.22)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = glow; ctx.fillRect(x, y, size, size); }
  ctx.fillStyle = '#5f9f78'; // shoulders and jacket with a high collar
  ctx.beginPath(); ctx.moveTo(x + size * .12, y + size); ctx.quadraticCurveTo(x + size * .18, y + size * .7, x + size * .5, y + size * .66);
  ctx.quadraticCurveTo(x + size * .82, y + size * .7, x + size * .88, y + size); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2f5a42'; ctx.beginPath(); ctx.moveTo(x + size * .42, y + size * .68); ctx.lineTo(x + size * .5, y + size * .86); ctx.lineTo(x + size * .58, y + size * .68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8fd5a8'; ctx.fillRect(x + size * .45, y + size * .54, size * .1, size * .14); // neck
  ctx.beginPath(); ctx.ellipse?.(x + size * .5, y + size * .4, size * .15, size * .19, 0, 0, Math.PI * 2); ctx.fill(); // head
  ctx.fillStyle = '#4f8a66'; ctx.beginPath(); ctx.ellipse?.(x + size * .5, y + size * .3, size * .17, size * .11, 0, Math.PI, Math.PI * 2); ctx.fill(); // hair, short and severe
  ctx.fillRect(x + size * .33, y + size * .28, size * .05, size * .2);
  ctx.fillStyle = 'rgba(11,26,18,.75)'; ctx.fillRect(x + size * .43, y + size * .39, size * .05, size * .015); ctx.fillRect(x + size * .53, y + size * .39, size * .05, size * .015);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; const offset = still ? 0 : Math.floor(time * 30) % 4;
  for (let row = y + offset; row < y + size; row += 4) ctx.fillRect(x, row, size, 1.5); // scanlines
  ctx.restore();
}
/** CASSIUS core — a ring and an eye; amber, never a face. */
function drawCoreEye(ctx, x, y, size, time, still) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
  ctx.fillStyle = '#0d0a06'; ctx.fillRect(x, y, size, size);
  const cx = x + size / 2, cy = y + size / 2, pulse = still ? .5 : .5 + .5 * Math.sin(time * 2.4);
  ctx.strokeStyle = '#7a5a22'; ctx.lineWidth = size * .05; ctx.beginPath(); ctx.arc(cx, cy, size * .36, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#e9b04a'; ctx.lineWidth = size * .02;
  for (let i = 0; i < 12; i += 1) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * size * .3, cy + Math.sin(a) * size * .3); ctx.lineTo(cx + Math.cos(a) * size * .4, cy + Math.sin(a) * size * .4); ctx.stroke(); }
  ctx.fillStyle = `rgba(233,176,74,${.55 + .35 * pulse})`; ctx.beginPath(); ctx.arc(cx, cy, size * .14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3cf'; ctx.beginPath(); ctx.arc(cx, cy, size * .05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Synthetic bust (BISHOP-9) — primitives only: even features, lab collar, one status light. */
function drawSyntheticBust(ctx, x, y, size, time, still) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
  ctx.fillStyle = '#0c1418'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#14242a'; for (let i = 0; i < 4; i += 1) ctx.fillRect(x + size * (.06 + i * .24), y + size * .08, size * .18, size * .5); // tank hall glass behind him
  ctx.fillStyle = '#c9d2d0'; // lab jacket, closed collar
  ctx.beginPath(); ctx.moveTo(x + size * .1, y + size); ctx.quadraticCurveTo(x + size * .16, y + size * .72, x + size * .5, y + size * .68);
  ctx.quadraticCurveTo(x + size * .84, y + size * .72, x + size * .9, y + size); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8e9a98'; ctx.fillRect(x + size * .43, y + size * .68, size * .14, size * .06);
  ctx.fillStyle = '#d9cfc2'; ctx.fillRect(x + size * .45, y + size * .54, size * .1, size * .15); // neck
  ctx.beginPath(); ctx.ellipse?.(x + size * .5, y + size * .4, size * .14, size * .19, 0, 0, Math.PI * 2); ctx.fill(); // face
  ctx.fillStyle = '#5a5148'; ctx.beginPath(); ctx.ellipse?.(x + size * .5, y + size * .27, size * .15, size * .08, 0, Math.PI, Math.PI * 2); ctx.fill(); // neat hair
  ctx.fillRect(x + size * .36, y + size * .26, size * .28, size * .03);
  ctx.fillStyle = '#2a2622'; ctx.fillRect(x + size * .43, y + size * .39, size * .04, size * .012); ctx.fillRect(x + size * .53, y + size * .39, size * .04, size * .012);
  ctx.fillRect(x + size * .46, y + size * .5, size * .08, size * .008);
  const pulse = still ? 1 : .6 + .4 * Math.sin(time * 1.6);
  ctx.fillStyle = `rgba(170,230,255,${.5 + .4 * pulse})`; ctx.beginPath(); ctx.arc(x + size * .6, y + size * .74, size * .018, 0, Math.PI * 2); ctx.fill(); // status light
  ctx.restore();
}
/** Scientist bust (Inez Harlow) — primitives only: lab coat, goggles pushed up, hair tied back. */
function drawScientistBust(ctx, x, y, size) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
  ctx.fillStyle = '#10181a'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#e4e2d6'; // lab coat
  ctx.beginPath(); ctx.moveTo(x + size * .1, y + size); ctx.quadraticCurveTo(x + size * .18, y + size * .7, x + size * .5, y + size * .67);
  ctx.quadraticCurveTo(x + size * .82, y + size * .7, x + size * .9, y + size); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3f6f6a'; ctx.beginPath(); ctx.moveTo(x + size * .42, y + size * .68); ctx.lineTo(x + size * .5, y + size * .84); ctx.lineTo(x + size * .58, y + size * .68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a9785a'; ctx.fillRect(x + size * .45, y + size * .54, size * .1, size * .14); // neck
  ctx.beginPath(); ctx.ellipse?.(x + size * .5, y + size * .4, size * .15, size * .19, 0, 0, Math.PI * 2); ctx.fill(); // face
  ctx.fillStyle = '#231a16'; ctx.beginPath(); ctx.ellipse?.(x + size * .5, y + size * .29, size * .17, size * .11, 0, Math.PI, Math.PI * 2); ctx.fill(); // hair tied back
  ctx.fillRect(x + size * .64, y + size * .28, size * .05, size * .16);
  ctx.strokeStyle = '#e0a33a'; ctx.lineWidth = Math.max(1, size * .025); ctx.strokeRect(x + size * .39, y + size * .24, size * .22, size * .05); // goggles on the forehead
  ctx.fillStyle = 'rgba(35,26,22,.8)'; ctx.fillRect(x + size * .43, y + size * .39, size * .04, size * .014); ctx.fillRect(x + size * .53, y + size * .39, size * .04, size * .014);
  ctx.restore();
}
const PORTRAITS = Object.freeze({ 'crt-bust': drawCrtBust, 'core-eye': drawCoreEye, 'synthetic-bust': drawSyntheticBust, 'scientist-bust': drawScientistBust });

/**
 * Paints one frame of the stage from a view (confrontationViewV188). Pure drawing:
 * `reveal` in [0, 1] is the share of the citation already shown (1 with reduced motion).
 */
export function drawConfrontationStageV188(ctx, view, { language = 'fr', time = 0, reveal = 1, reducedMotion = false } = {}) {
  if (!ctx || !view) return null;
  const lang = language === 'en' ? 'en' : 'fr', still = Boolean(reducedMotion), shown = still ? 1 : Math.max(0, Math.min(1, reveal));
  ctx.save(); ctx.textAlign = 'left';
  ctx.fillStyle = '#05080a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0b1114'; ctx.fillRect(0, BAR, W, H - BAR * 2);
  // portrait frame, as in the cinematic lower third
  const px = 28, py = BAR + 30, size = 176;
  ctx.fillStyle = '#0a1210'; ctx.fillRect(px - 4, py - 4, size + 8, size + 8);
  (PORTRAITS[view.portrait] || drawCrtBust)(ctx, px, py, size, time, still);
  ctx.strokeStyle = 'rgba(131,213,161,.6)'; ctx.lineWidth = 1; ctx.strokeRect(px - 3.5, py - 3.5, size + 7, size + 7);
  ctx.fillStyle = '#7f9a8a'; ctx.font = '12px monospace'; wrap(ctx, view.role, size + 8).slice(0, 2).forEach((row, i) => ctx.fillText(row, px - 4, py + size + 22 + i * 15));
  // speaker and citation
  const tx0 = 236, width = W - tx0 - 210;
  ctx.fillStyle = '#e9d07a'; ctx.font = '700 15px monospace'; ctx.fillText(view.interlocutor, tx0, BAR + 34);
  ctx.fillStyle = '#7f9a8a'; ctx.font = '12px monospace';
  if (view.source) ctx.fillText(`${tx(UI_TEXT.cites, lang)} · ${view.source}`, tx0, BAR + 54);
  ctx.fillStyle = '#eef4ee'; ctx.font = '19px sans-serif';
  const body = view.status === 'open' ? view.citation : view.ending;
  const visible = String(body || '').slice(0, Math.ceil(String(body || '').length * shown));
  wrap(ctx, visible, width).slice(0, 6).forEach((row, i) => ctx.fillText(row, tx0, BAR + 86 + i * 26));
  // last exchange
  if (view.last) {
    const label = view.last.piece ? `${tx(UI_TEXT.echo, lang)} · ${view.pieces.find(piece => piece.id === view.last.piece)?.label || view.last.piece} (${tx(UI_TEXT.result[view.last.result], lang)})` : tx(UI_TEXT.echoSilent, lang);
    ctx.fillStyle = view.last.result === 'wrong' ? '#e39a7a' : '#83d5a1'; ctx.font = '700 13px monospace';
    wrap(ctx, label, width).slice(0, 2).forEach((row, i) => ctx.fillText(row, tx0, H - BAR - 64 + i * 16));
    ctx.fillStyle = '#c9d6cc'; ctx.font = '14px sans-serif';
    wrap(ctx, view.last.reply, width).slice(0, 2).forEach((row, i) => ctx.fillText(row, tx0, H - BAR - 30 + i * 17));
  }
  // gauges: ground (bar with the target tick) and credibility (pips: filled = left, hollow = lost)
  const gx = W - 186, gw = 160;
  ctx.fillStyle = '#9fb6a6'; ctx.font = '700 12px monospace';
  ctx.fillText(`${tx(UI_TEXT.round, lang)} ${Math.min(view.round + (view.status === 'open' ? 1 : 0), view.rounds)}/${view.rounds}`, gx, BAR + 34);
  ctx.fillText(`${tx(UI_TEXT.ground, lang)} ${view.ground}/${view.target}`, gx, BAR + 70);
  ctx.strokeStyle = '#83d5a1'; ctx.strokeRect(gx + .5, BAR + 78.5, gw, 14);
  ctx.fillStyle = '#83d5a1'; ctx.fillRect(gx + 2, BAR + 81, Math.max(0, (gw - 3) * Math.min(1, view.ground / view.target)), 9);
  ctx.fillStyle = '#e9d07a'; ctx.fillRect(gx + gw - 2, BAR + 74, 3, 22); // target tick
  ctx.fillStyle = '#9fb6a6'; ctx.fillText(`${tx(UI_TEXT.credibility, lang)} ${view.credibility}/${view.credibilityMax}`, gx, BAR + 122);
  for (let i = 0; i < view.credibilityMax; i += 1) {
    ctx.beginPath(); ctx.arc(gx + 10 + i * 26, BAR + 142, 8, 0, Math.PI * 2);
    if (i < view.credibility) { ctx.fillStyle = '#e9d07a'; ctx.fill(); } else { ctx.strokeStyle = '#6a5a3a'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  ctx.lineWidth = 1;
  // The witness who listens (quest `ship-bioforge`): a small portrait under the gauges, with the name.
  if (view.witnessPortrait && PORTRAITS[view.witnessPortrait]) {
    const ws = 64, wx = gx, wy = H - BAR - ws - 30;
    PORTRAITS[view.witnessPortrait](ctx, wx, wy, ws, time, still);
    ctx.strokeStyle = 'rgba(131,213,161,.6)'; ctx.strokeRect(wx - .5, wy - .5, ws + 1, ws + 1);
    ctx.fillStyle = '#7f9a8a'; ctx.font = '11px monospace'; wrap(ctx, view.witness || '', gw - ws - 8).slice(0, 3).forEach((row, i) => ctx.fillText(row, wx + ws + 8, wy + 14 + i * 14));
  }
  if (view.status !== 'open') {
    // A weighed debate words its two outcomes itself (labels); neither is drawn as a defeat.
    ctx.fillStyle = view.status === 'won' || view.labels ? '#83d5a1' : '#e39a7a'; ctx.font = view.labels ? '700 12px monospace' : '700 14px monospace';
    wrap(ctx, view.labels ? view.labels[view.status] : tx(UI_TEXT[view.status], lang), gw).slice(0, 2).forEach((row, i) => ctx.fillText(row, gx, BAR + 182 + i * 15));
  } else if (!view.winnable) { ctx.fillStyle = '#e39a7a'; ctx.font = '12px monospace'; wrap(ctx, tx(UI_TEXT.unwinnable, lang), gw).forEach((row, i) => ctx.fillText(row, gx, BAR + 182 + i * 15)); }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR); // letterbox
  ctx.restore();
  return { status: view.status, round: view.round, ground: view.ground, credibility: view.credibility };
}

/**
 * Opens the hearing. `getView()` returns the current confrontationViewV188 (read from
 * the save); `onMove(pieceId|null)` commits one exchange and returns its result or null;
 * `onClose(view)` runs once when the player leaves the concluded hearing.
 * `roundSeconds` > 0 is an optional pressure mode (silence when it runs out); 0 by default.
 */
export function openConfrontationDialogV188({ document = globalThis.document, language = 'fr', reducedMotion = false, getView, onMove, onClose = null,
  roundSeconds = 0, now = () => globalThis.performance?.now?.() ?? Date.now(), requestFrame = globalThis.requestAnimationFrame?.bind(globalThis) } = {}) {
  if (!document?.body || typeof getView !== 'function' || typeof onMove !== 'function' || !getView()) return null;
  const lang = language === 'en' ? 'en' : 'fr';
  const dialog = document.createElement('dialog'); dialog.className = 'story-choice-v188 content-scene-v188 confrontation-v188';
  dialog.dataset.confrontationV188 = getView().id; dialog.setAttribute('aria-labelledby', 'confrontation-title-v188');
  Object.assign(dialog.style, { maxWidth: 'min(96vw, 980px)', width: 'min(96vw, 980px)' });
  const heading = Object.assign(document.createElement('h2'), { id: 'confrontation-title-v188' });
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { width: '100%', height: 'auto', display: 'block', margin: '0 auto 10px', borderRadius: '4px' });
  const live = document.createElement('p'); live.setAttribute('aria-live', 'polite'); live.style.whiteSpace = 'pre-line'; live.dataset.confrontationLiveV188 = 'true';
  const status = document.createElement('p'); status.className = 'hint'; status.dataset.confrontationStatusV188 = 'true';
  const list = document.createElement('div'); list.setAttribute('role', 'group'); list.setAttribute('aria-label', getView().labels?.pieces || tx(UI_TEXT.pieces, lang));
  Object.assign(list.style, { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '6px', margin: '8px 0' });
  const footer = document.createElement('footer'); footer.style.flexWrap = 'wrap';
  const ctx = canvas.getContext?.('2d');
  let closed = false, shownAt = now(), lastKey = '', timerStart = now();
  const view = () => getView();
  const paint = () => {
    if (closed || !ctx) return;
    const current = view(), key = `${current.status}:${current.round}`;
    if (key !== lastKey) { lastKey = key; shownAt = now(); timerStart = now(); }
    const elapsed = (now() - shownAt) / 1000;
    drawConfrontationStageV188(ctx, current, { language: lang, time: elapsed, reveal: elapsed / 1.4, reducedMotion });
    if (roundSeconds > 0 && current.status === 'open' && (now() - timerStart) / 1000 >= roundSeconds) { timerStart = now(); act(null); return; }
    if (!reducedMotion || roundSeconds > 0) requestFrame?.(paint);
  };
  const close = () => {
    if (closed) return;
    closed = true; document.removeEventListener?.('keydown', onKey, true);
    const final = view(); dialog.close?.(); dialog.remove(); onClose?.(final);
  };
  function act(pieceId) {
    if (closed || view().status !== 'open') return;
    const result = onMove(pieceId);
    if (!result) return;
    render(); if (reducedMotion && roundSeconds <= 0) paint();
  }
  function render() {
    const current = view();
    heading.textContent = current.title;
    const lines = current.status === 'open'
      ? [current.round === 0 && !current.last ? current.intro : null, current.last ? current.last.reply : null, `${current.interlocutor} · ${current.source || ''}`, current.citation]
      : [current.last?.reply || null, current.ending];
    live.textContent = lines.filter(Boolean).join('\n');
    status.textContent = `${tx(UI_TEXT.round, lang)} ${Math.min(current.round + (current.status === 'open' ? 1 : 0), current.rounds)}/${current.rounds} · ${tx(UI_TEXT.ground, lang)} ${current.ground}/${current.target} · ${tx(UI_TEXT.credibility, lang)} ${current.credibility}/${current.credibilityMax}${current.status === 'open' && !current.winnable ? ` · ${tx(UI_TEXT.unwinnable, lang)}` : ''}`;
    list.replaceChildren(); footer.replaceChildren();
    if (current.status === 'open') {
      current.pieces.forEach((piece, index) => {
        const button = Object.assign(document.createElement('button'), { type: 'button', className: 'button' });
        const note = !piece.held ? tx(UI_TEXT.notHeld, lang) : piece.spent ? tx(UI_TEXT.spent, lang) : null;
        button.textContent = `${index + 1} · ${piece.label}${note ? ` — ${note}` : ''}`;
        button.disabled = !piece.held || piece.spent; button.dataset.confrontationPieceV188 = piece.id;
        button.setAttribute('aria-label', `${tx(UI_TEXT.present, lang)} : ${piece.label}${note ? ` (${note})` : ''}`);
        Object.assign(button.style, { minHeight: '44px', textAlign: 'left', whiteSpace: 'normal' });
        button.addEventListener('click', () => act(piece.id));
        list.append(button);
      });
      const silence = Object.assign(document.createElement('button'), { type: 'button', className: 'button compact', textContent: tx(UI_TEXT.silence, lang) });
      silence.dataset.confrontationSilenceV188 = 'true'; silence.style.minHeight = '44px'; silence.addEventListener('click', () => act(null));
      footer.append(silence);
      (list.querySelector('button:not([disabled])') || silence).focus?.();
    } else {
      const next = Object.assign(document.createElement('button'), { type: 'button', className: 'button', textContent: tx(UI_TEXT.continue, lang) });
      next.dataset.confrontationContinueV188 = 'true'; next.style.minHeight = '44px'; next.addEventListener('click', close);
      footer.append(next); next.focus?.();
    }
  }
  function onKey(event) {
    if (closed) return;
    const current = view();
    if (event.key === 'Escape') { event.preventDefault(); return; }
    if (current.status !== 'open') return;
    const digit = /^[1-9]$/.test(event.key) ? Number(event.key) - 1 : -1;
    if (digit >= 0 && digit < current.pieces.length) { event.preventDefault(); event.stopImmediatePropagation?.(); const piece = current.pieces[digit]; if (piece.held && !piece.spent) act(piece.id); return; }
    if (event.key === 's' || event.key === 'S') { event.preventDefault(); event.stopImmediatePropagation?.(); act(null); return; }
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      const buttons = [...dialog.querySelectorAll('button:not([disabled])')];
      const index = buttons.indexOf(document.activeElement); if (!buttons.length) return;
      event.preventDefault();
      const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
      buttons[(index + step + buttons.length) % buttons.length].focus?.();
    }
  }
  dialog.addEventListener('cancel', event => event.preventDefault()); // a hearing cannot be dismissed
  document.addEventListener?.('keydown', onKey, true);
  dialog.append(heading, canvas, live, status, list, footer); document.body.append(dialog);
  render(); dialog.showModal?.(); paint();
  return Object.freeze({ dialog, close, render, act });
}
