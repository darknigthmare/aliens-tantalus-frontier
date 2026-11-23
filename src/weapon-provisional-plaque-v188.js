/** V188 — provisional armory plaques (owner decision 2026-11-23, spec 014 A1).
 *
 * The three franchise additions 194–196 have no admitted native plaque. The owner
 * opened them to purchase now, behind a PROVISIONAL plaque: a Canvas drawing in a
 * named slot, never an image and never presented as the final art. The slot name
 * is what a future native plaque replaces. The list is explicit, by exact id: any
 * other weapon without a plaque keeps the historical rule (no plaque, no purchase).
 *
 * Prices follow the ordinary armory rule (`getProcurementQuote`, save.js) applied to
 * the [PROPOSÉ] statistics of the catalogue entry; nothing here sets a price.
 * Identity, fidelity status and sources stay those of the catalogue entry
 * (docs/development/ARSENAL_COMPLETION_V188.md): a drawn plaque certifies nothing.
 */
import { ARSENAL_PLACEHOLDER_SLOTS_V188 } from './weapon-arsenal-runtime-v188.js';

export const PROVISIONAL_PLAQUE_WEAPON_IDS_V188 = Object.freeze([
  'weapon-194-hicks-ithaca-37-shotgun',
  'weapon-195-sevastopol-pump-shotgun',
  'weapon-196-sevastopol-flamethrower'
]);
const idOf = weapon => typeof weapon === 'string' ? weapon : weapon?.id;
/** True for the weapons the owner opened to purchase behind a provisional plaque. */
export const hasProvisionalPlaqueV188 = weapon => PROVISIONAL_PLAQUE_WEAPON_IDS_V188.includes(idOf(weapon));
/** Named slot a native plaque will replace. */
export const provisionalPlaqueSlotV188 = weapon => hasProvisionalPlaqueV188(weapon) ? `armory-plaque-provisional-${idOf(weapon)}` : null;
const silhouetteSlot = weapon => idOf(weapon) === 'weapon-196-sevastopol-flamethrower' ? 'held-weapon-placeholder-flamethrower' : 'held-weapon-placeholder-shotgun';

export const PROVISIONAL_PLAQUE_TEXT_V188 = Object.freeze({
  label: Object.freeze({ fr: 'PLAQUE PROVISOIRE', en: 'PROVISIONAL PLAQUE' }),
  note: Object.freeze({ fr: 'Dessin d’attente : la plaque d’armurerie définitive reste à produire.', en: 'Placeholder drawing: the final armory plaque is still to be produced.' })
});
const lang = language => language === 'en' ? 'en' : 'fr';

/** Draws the provisional plaque. Pure Canvas 2D calls; returns false when the weapon has none. */
export function drawProvisionalPlaqueV188(ctx, weapon, width, height, { language = 'fr', name = null } = {}) {
  if (!ctx || !hasProvisionalPlaqueV188(weapon) || !(width > 0) || !(height > 0)) return false;
  const unit = Math.max(1, height / 132), band = Math.round(14 * unit); // text and band follow the plaque size
  ctx.save();
  ctx.fillStyle = '#0b1210'; ctx.fillRect(0, 0, width, height);
  // Hatched band: reads as "provisional" without relying on colour alone.
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, width, band); ctx.clip();
  ctx.fillStyle = '#2a2414'; ctx.fillRect(0, 0, width, band);
  ctx.strokeStyle = '#c9a646'; ctx.lineWidth = 3 * unit;
  for (let x = -band; x < width + band; x += band) { ctx.beginPath(); ctx.moveTo(x, band); ctx.lineTo(x + band, 0); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = '#6fa482'; ctx.lineWidth = 1; ctx.setLineDash?.([6, 4]);
  ctx.strokeRect(4.5, band + 4.5, width - 9, height - band - 9); ctx.setLineDash?.([]);
  // Silhouette: the same named Canvas slot as the weapon held in mission, enlarged.
  const length = 46, scale = Math.max(1, Math.min((width - 40) / (length * 1.35), (height - 70 * unit) / 22));
  ctx.save(); ctx.translate(width / 2 - length * 0.35 * scale, height / 2 - 6 * unit); ctx.scale(scale, scale);
  ARSENAL_PLACEHOLDER_SLOTS_V188[silhouetteSlot(weapon)](ctx, length);
  ctx.restore();
  ctx.fillStyle = '#d3e1d6'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${Math.round(11 * unit)}px ui-monospace, monospace`;
  ctx.fillText(PROVISIONAL_PLAQUE_TEXT_V188.label[lang(language)], width / 2, height - 24 * unit, width - 16);
  const title = String(name || (typeof weapon === 'object' && weapon?.name) || '').toUpperCase();
  if (title) { ctx.fillStyle = '#9fb7a6'; ctx.font = `${Math.round(10 * unit)}px ui-monospace, monospace`; ctx.fillText(title, width / 2, height - 10 * unit, width - 16); }
  ctx.restore();
  return true;
}

/** Mounts the plaque as a <canvas> in the catalogue media slot. Returns the element, or null. */
export function mountProvisionalPlaqueV188(document, target, record, { detail = false, language = 'fr', name = null } = {}) {
  if (!document || !target || !hasProvisionalPlaqueV188(record)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = detail ? 520 : 260; canvas.height = detail ? 300 : 132;
  canvas.dataset.provisionalPlaqueV188 = idOf(record);
  canvas.dataset.slotV188 = provisionalPlaqueSlotV188(record);
  canvas.setAttribute('role', 'img');
  const text = PROVISIONAL_PLAQUE_TEXT_V188;
  canvas.setAttribute('aria-label', `${name || record.name || idOf(record)} — ${text.label[lang(language)].toLowerCase()}. ${text.note[lang(language)]}`);
  canvas.style.width = '100%'; canvas.style.height = detail ? '300px' : '132px'; canvas.style.objectFit = 'contain';
  let ctx = null;
  try { ctx = canvas.getContext('2d'); } catch { ctx = null; }
  if (ctx) drawProvisionalPlaqueV188(ctx, record, canvas.width, canvas.height, { language, name });
  target.append(canvas);
  return canvas;
}
