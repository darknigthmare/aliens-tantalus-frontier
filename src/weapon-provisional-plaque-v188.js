/** V188 provisional weapon plaque (spec 014, owner decision of 23 November 2026):
 * a catalogue weapon whose native plaque does not exist yet is purchasable now
 * and shows a plaque DRAWN with Canvas primitives — never a generated image and
 * never a claim about the real prop. The same named slots draw the held weapon
 * in missions. Shared helper: any catalogue entry opts in with
 * `admissionV188: 'provisional-plaque-purchasable'`.
 */
export const PROVISIONAL_PLAQUE_SCHEMA_V188 = 188;
export const PROVISIONAL_PLAQUE_ADMISSION_V188 = 'provisional-plaque-purchasable';
export const PROVISIONAL_PLAQUE_LABEL_V188 = 'PLAQUE PROVISOIRE · ILLUSTRATION À PRODUIRE';

const METAL = '#3b3f3c', DARK = '#2a2c2b', WOOD = '#5b4632', LIGHT = '#6a706b';
/** Named Canvas placeholder slots. Origin = rear of the receiver on the bore
 * axis, +x toward the muzzle; `length` is the drawn weapon length in pixels. */
export const ARSENAL_PLACEHOLDER_SLOTS_V188 = Object.freeze({
  'held-weapon-placeholder-shotgun'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(-length * 0.18, -3, length * 1.0, 5);     // barrel + tube
    ctx.fillStyle = WOOD; ctx.fillRect(length * 0.28, 2, length * 0.3, 4);        // pump fore-end
    ctx.fillStyle = DARK; ctx.fillRect(-length * 0.3, -2, length * 0.16, 9);      // pistol grip
  },
  'held-weapon-placeholder-flamethrower'(ctx, length) {
    ctx.fillStyle = '#4a4d47'; ctx.fillRect(-length * 0.2, -4, length * 1.05, 7);
    ctx.fillStyle = '#8a3b22'; ctx.beginPath(); ctx.arc(length * 0.1, 7, 6, 0, Math.PI * 2); ctx.fill(); // fuel canister
    ctx.fillStyle = '#ffb34d'; ctx.fillRect(length * 0.82, -2, 3, 3);             // pilot light
  },
  'held-weapon-placeholder-pistol'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(length * 0.42, -3, length * 0.42, 5);     // slide
    ctx.fillStyle = DARK; ctx.fillRect(length * 0.42, 1, length * 0.13, 9);       // grip
  },
  'held-weapon-placeholder-rifle'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(-length * 0.2, -3, length * 0.78, 6);     // receiver
    ctx.fillRect(length * 0.58, -2, length * 0.28, 3);                            // barrel
    ctx.fillStyle = DARK; ctx.fillRect(length * 0.12, 3, length * 0.1, 9);        // magazine
    ctx.fillRect(-length * 0.32, -2, length * 0.14, 6);                           // stock
  },
  'held-weapon-placeholder-smg'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(length * 0.08, -3, length * 0.6, 6);
    ctx.fillStyle = DARK; ctx.fillRect(length * 0.3, 3, length * 0.08, 11);       // stick magazine
    ctx.fillRect(length * 0.1, 3, length * 0.08, 6);                              // grip
  },
  'held-weapon-placeholder-sniper'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(-length * 0.25, -2, length * 0.7, 5);
    ctx.fillRect(length * 0.45, -1, length * 0.6, 2);                             // long barrel
    ctx.fillStyle = LIGHT; ctx.fillRect(length * 0.02, -7, length * 0.3, 3);      // scope
    ctx.fillStyle = DARK; ctx.fillRect(-length * 0.38, -1, length * 0.14, 6);     // stock
  },
  'held-weapon-placeholder-heavy'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(-length * 0.22, -5, length * 0.8, 10);    // body
    ctx.fillRect(length * 0.58, -2, length * 0.4, 4);                             // barrel
    ctx.fillStyle = DARK; ctx.fillRect(length * 0.02, 5, length * 0.24, 7);       // ammunition box
    ctx.fillStyle = LIGHT; ctx.fillRect(length * 0.1, -9, length * 0.22, 3);      // carry handle
  },
  'held-weapon-placeholder-launcher'(ctx, length) {
    ctx.fillStyle = '#44483f'; ctx.fillRect(-length * 0.15, -5, length * 0.9, 9); // tube
    ctx.fillStyle = DARK; ctx.fillRect(length * 0.72, -6, length * 0.08, 11);     // muzzle ring
    ctx.fillRect(length * 0.1, 4, length * 0.08, 8);                              // grip
  },
  'held-weapon-placeholder-energy'(ctx, length) {
    ctx.fillStyle = METAL; ctx.fillRect(-length * 0.2, -3, length * 0.85, 6);
    ctx.fillStyle = '#4fb6c9'; ctx.fillRect(length * 0.05, 3, length * 0.2, 5);   // cell
    ctx.fillRect(length * 0.62, -1, length * 0.08, 2);                            // emitter
  },
  // Lot C: a thrown device (grenade, incendiary, mine) held in the hand.
  'held-weapon-placeholder-device'(ctx, length) {
    ctx.fillStyle = '#4a4f45'; ctx.fillRect(length * 0.62, -5, length * 0.2, 10);   // body
    ctx.fillStyle = DARK; ctx.fillRect(length * 0.66, -8, length * 0.12, 3);        // cap
    ctx.fillStyle = '#c9a23f'; ctx.fillRect(length * 0.62, -1, length * 0.2, 2);    // band
  },
  'held-weapon-placeholder-prod'(ctx, length) {
    ctx.fillStyle = DARK; ctx.fillRect(-length * 0.1, -2, length * 0.95, 3);      // pole
    ctx.fillStyle = '#9ad7ff'; ctx.fillRect(length * 0.82, -4, 3, 2); ctx.fillRect(length * 0.82, 1, 3, 2); // electrodes
  }
});
/** category → [slot, held type, role label]. */
export const ARSENAL_PLACEHOLDER_CATEGORIES_V188 = Object.freeze(Object.fromEntries(Object.entries({
  shotgun: ['held-weapon-placeholder-shotgun', 'shotgun', 'Shotgun'], flame: ['held-weapon-placeholder-flamethrower', 'heavy', 'Flamethrower'],
  flamethrower: ['held-weapon-placeholder-flamethrower', 'heavy', 'Flamethrower'], pistol: ['held-weapon-placeholder-pistol', 'pistol', 'Pistol'],
  rifle: ['held-weapon-placeholder-rifle', 'rifle', 'Rifle'], smg: ['held-weapon-placeholder-smg', 'rifle', 'SMG'],
  sniper: ['held-weapon-placeholder-sniper', 'rifle', 'Sniper'], heavy: ['held-weapon-placeholder-heavy', 'heavy', 'Heavy'],
  launcher: ['held-weapon-placeholder-launcher', 'heavy', 'Launcher'], energy: ['held-weapon-placeholder-energy', 'rifle', 'Energy'],
  melee: ['held-weapon-placeholder-prod', 'melee', 'Melee'], prod: ['held-weapon-placeholder-prod', 'melee', 'Melee'],
  device: ['held-weapon-placeholder-device', 'thrown', 'Thrown device']
}).map(([key, value]) => [key, Object.freeze(value)])));

export const hasProvisionalPlaqueV188 = weapon => Boolean(weapon && typeof weapon === 'object'
  && weapon.admissionV188 === PROVISIONAL_PLAQUE_ADMISSION_V188 && /^weapon-\d{3}-[a-z0-9-]+$/.test(weapon.id || ''));
/** Named armory slot a native plaque will replace (owner decisions of 2026-11-23). */
export const armoryPlaqueSlotV188 = weapon => hasProvisionalPlaqueV188(weapon) ? `armory-plaque-provisional-${weapon.id}` : null;
export function provisionalPlaqueSlotV188(weapon) {
  const entry = ARSENAL_PLACEHOLDER_CATEGORIES_V188[weapon?.placeholderCategoryV188]
    || ARSENAL_PLACEHOLDER_CATEGORIES_V188[weapon?.family === 'flame' ? 'flame' : 'shotgun'];
  return entry[0];
}
/** Draw the plaque: a dashed frame (provisional status) and the class silhouette. */
export function drawProvisionalPlaqueV188(ctx, weapon, width = 320, height = 160) {
  const draw = ARSENAL_PLACEHOLDER_SLOTS_V188[provisionalPlaqueSlotV188(weapon)];
  if (!ctx || !draw) return false;
  ctx.save();
  ctx.fillStyle = '#10161a'; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#5d6d68'; ctx.lineWidth = 2; ctx.setLineDash?.([8, 6]);
  ctx.strokeRect(6, 6, width - 12, height - 12); ctx.setLineDash?.([]);
  const length = 46, scale = Math.min(width / 80, height / 34);
  ctx.translate(width / 2 - length * 0.35 * scale, height / 2);
  ctx.scale(scale, scale);
  draw(ctx, length);
  ctx.restore();
  return true;
}
/** DOM mount for the armory card and dossier. Returns the figure, or null when no 2D canvas exists. */
export function mountProvisionalPlaqueV188(document, target, weapon, label = '') {
  if (!document || !target || !hasProvisionalPlaqueV188(weapon)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 320; canvas.height = 160;
  const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
  if (!ctx || !drawProvisionalPlaqueV188(ctx, weapon, canvas.width, canvas.height)) return null;
  const figure = document.createElement('figure');
  figure.className = 'provisional-plaque-v188';
  figure.dataset.provisionalPlaqueV188 = weapon.id;
  figure.dataset.placeholderSlot = provisionalPlaqueSlotV188(weapon);
  figure.dataset.slotV188 = armoryPlaqueSlotV188(weapon);
  figure.setAttribute('aria-label', `${label || weapon.name} — plaque provisoire dessinée, illustration à produire`);
  figure.style.margin = '0'; figure.style.width = '100%'; figure.style.textAlign = 'center';
  canvas.style.width = '100%'; canvas.style.height = 'auto'; canvas.setAttribute('aria-hidden', 'true');
  const caption = document.createElement('figcaption');
  caption.className = 'catalog-v62__media-status';
  caption.textContent = PROVISIONAL_PLAQUE_LABEL_V188;
  figure.append(canvas, caption);
  target.append(figure);
  return figure;
}
