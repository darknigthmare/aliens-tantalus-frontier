import { USER_EQUIPMENT_ART_V95 } from './user-equipment-art-v95.js';
import { resolveCombatAimV83, resolveCombatMuzzleV83 } from './combat-aim-v83.js';

// These are project balance values, not canonical weapon/armour specifications.
// The art manifest contains only real reviewed PNGs. No item exists before its
// art is admitted; equipment IDs never enter the enemy/Bioforge population.
const TUNING = Object.freeze({
  'item-v95-user-human-xeno-armor-female-queen': { armorBonus: 18 },
  'item-v95-user-human-xeno-armor-female': { armorBonus: 12 },
  'item-v95-user-human-xeno-armor-male-full': { armorBonus: 22 },
  'item-v95-user-human-xeno-armor-male': { armorBonus: 15 },
  'item-v95-user-engineer-acid-proto': { family: 'acid', damage: 32, fireRate: 2.5, magazine: 12, reload: 2.2, penetration: 24 },
  'item-v95-user-engineer-bone-gun': { family: 'ballistic', damage: 27, fireRate: 4, magazine: 18, reload: 1.8, penetration: 20 },
  'item-v95-user-engineer-bone-rifle': { family: 'ballistic', damage: 38, fireRate: 2, magazine: 10, reload: 2.4, penetration: 38 }
});
export const USER_EQUIPMENT_V95 = Object.freeze(USER_EQUIPMENT_ART_V95.map(art => Object.freeze({
  ...art, ...TUNING[art.id], enemyProfileId: art.kind === 'armor' ? art.profileId : null, source: 'Référence utilisateur · adaptation de jeu',
  provenance: 'user-provided-reference-openai-integrated', canonExact: false,
  animationStatus: 'missing', visualMode: 'static-pose', geometryStatus: 'project-adaptation',
  rarity: 'reference', mark: 'Adaptation V95', tags: Object.freeze(['user-reference', 'static-pose'])
})));
const BY_ID = new Map(USER_EQUIPMENT_V95.map(item => [item.id, item]));
export const getUserEquipmentV95 = id => BY_ID.get(id) || null;
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const ready = image => Boolean(image?.complete && image.naturalWidth > 0);
const facesLeft = art => art.sourceFacing === 'left' || art.sourceFacing === -1;

export function normalizeUserEquipmentV95(raw) {
  const selected = kind => getUserEquipmentV95(raw?.[`${kind}Id`])?.kind === kind ? raw[`${kind}Id`] : null;
  return { schema: 95, armorId: selected('armor'), weaponId: selected('weapon') };
}

/** The supplied reference set is an explicit optional issued loadout. Legacy
 * inventory/economy stays untouched and equipment cannot change mid-operation. */
export function equipUserEquipmentV95(save, itemId) {
  if (save?.strategy?.currentOperation) throw new Error('Opération active : manifeste verrouillé.');
  const item = getUserEquipmentV95(itemId);
  if (!item || !save?.player) throw new Error('Équipement de référence indisponible.');
  const state = normalizeUserEquipmentV95(save.player.userEquipmentV95);
  state[`${item.kind}Id`] = item.id;
  save.player.userEquipmentV95 = state;
  return state;
}

export function unequipUserEquipmentV95(save, kind) {
  if (save?.strategy?.currentOperation) throw new Error('Opération active : manifeste verrouillé.');
  if (!['armor', 'weapon'].includes(kind) || !save?.player) throw new Error('Emplacement inconnu.');
  const state = normalizeUserEquipmentV95(save.player.userEquipmentV95);
  state[`${kind}Id`] = null;
  save.player.userEquipmentV95 = state;
  return state;
}

export function resolveUserEquipmentLoadoutV95(raw) {
  const state = normalizeUserEquipmentV95(raw);
  return { state, armor: getUserEquipmentV95(state.armorId), weapon: getUserEquipmentV95(state.weaponId) };
}

function boundsOf(art) {
  // All measured alpha bounds use exclusive right/bottom coordinates.
  const b = art.alphaBounds;
  if (Array.isArray(b)) return { left: b[0], top: b[1], right: b[2], bottom: b[3] };
  return { left: b?.left ?? b?.x ?? 0, top: b?.top ?? b?.y ?? 0,
    right: b?.right ?? ((b?.x ?? 0) + (b?.width ?? art.sourceWidth)),
    bottom: b?.bottom ?? ((b?.y ?? 0) + (b?.height ?? art.sourceHeight)) };
}

/** Keep the entire source canvas. Only its measured transparent padding affects
 * scale/grounding; the player retains the normal human collision box. */
export function getUserArmorTransformV95(actor, armor) {
  if (!actor || armor?.kind !== 'armor') return null;
  const b = boundsOf(armor);
  const scale = actor.h / Math.max(1, b.bottom - b.top);
  const width = armor.sourceWidth * scale, height = armor.sourceHeight * scale;
  const mirror = (actor.facing < 0 ? -1 : 1) !== (facesLeft(armor) ? -1 : 1);
  const pivot = armor.pivot || { x: (b.left + b.right) / (2 * armor.sourceWidth), y: b.bottom / armor.sourceHeight };
  const pivotX = mirror ? 1 - pivot.x : pivot.x;
  const x = actor.x + actor.w / 2 - width * pivotX;
  const y = actor.y + actor.h - height * pivot.y;
  const hand = armor.handPivot || { x: pivot.x, y: (b.top + (b.bottom - b.top) * 0.55) / armor.sourceHeight };
  return { x, y, width, height, mirror, hand: { x: x + width * (mirror ? 1 - hand.x : hand.x), y: y + height * hand.y } };
}

export function getUserWeaponTransformV95(actor, aim, weapon, armor = null) {
  if (!actor || weapon?.kind !== 'weapon') return null;
  const vector = aim || resolveCombatAimV83({ facing: actor.facing });
  const grip = weapon.gripPivot || { x: 0.35, y: 0.6 };
  const muzzle = weapon.muzzlePivot || { x: facesLeft(weapon) ? 0.08 : 0.92, y: 0.45 };
  const b = boundsOf(weapon);
  const scale = finite(weapon.renderWidth, 82) / Math.max(1, b.right - b.left);
  const width = weapon.sourceWidth * scale, height = weapon.sourceHeight * scale;
  const dx = (muzzle.x - grip.x) * width, dy = (muzzle.y - grip.y) * height;
  const mirror = (vector.facing < 0 ? -1 : 1) !== (facesLeft(weapon) ? -1 : 1);
  const sourceAngle = Math.atan2(dy, mirror ? -dx : dx);
  const angle = Math.atan2(vector.y, vector.x) - sourceAngle;
  const defaultPivot = resolveCombatMuzzleV83(actor, vector, { barrelLength: 0 });
  const hand = getUserArmorTransformV95(actor, armor)?.hand;
  const pivotX = hand?.x ?? defaultPivot.x, pivotY = hand?.y ?? defaultPivot.y;
  const barrelLength = Math.hypot(dx, dy);
  return { width, height, grip, angle, mirror, pivotX, pivotY, barrelLength,
    muzzle: resolveCombatMuzzleV83(actor, vector, { pivotX, pivotY, barrelLength }) };
}

export function resolveUserEquipmentMuzzleV95(actor, aim) {
  if (!actor || actor.inVehicle) return null;
  const { armor, weapon } = resolveUserEquipmentLoadoutV95(actor.userEquipmentV95);
  const transform = getUserWeaponTransformV95(actor, aim, weapon, armor);
  if (transform) return transform.muzzle;
  const hand = getUserArmorTransformV95(actor, armor)?.hand;
  return hand ? resolveCombatMuzzleV83(actor, aim, { pivotX: hand.x, pivotY: hand.y, barrelLength: 24 }) : null;
}

export function drawUserArmorV95(ctx, actor, image, armor) {
  if (!ready(image) || armor?.kind !== 'armor') return false;
  const t = getUserArmorTransformV95(actor, armor);
  ctx.save();
  if (actor.alive === false) ctx.globalAlpha *= 0.45;
  ctx.translate(t.x + (t.mirror ? t.width : 0), t.y);
  if (t.mirror) ctx.scale(-1, 1);
  ctx.drawImage(image, 0, 0, t.width, t.height);
  ctx.restore();
  actor.playerVisualV95 = { schema: 95, itemId: armor.id, path: armor.path, visualMode: 'static-pose', animationStatus: 'missing', worn: true };
  return true;
}

export function drawUserWeaponV95(ctx, actor, image, weapon, armor = null) {
  if (!ready(image) || !actor?.alive || actor.inVehicle || weapon?.kind !== 'weapon') return false;
  const t = getUserWeaponTransformV95(actor, actor.combatAimV83, weapon, armor);
  ctx.save();
  ctx.translate(t.pivotX, t.pivotY);
  ctx.rotate(t.angle);
  if (t.mirror) ctx.scale(-1, 1);
  ctx.drawImage(image, -t.grip.x * t.width, -t.grip.y * t.height, t.width, t.height);
  ctx.restore();
  actor.heldWeaponVisualV95 = { itemId: weapon.id, path: weapon.path, muzzle: { x: t.muzzle.x, y: t.muzzle.y }, animationStatus: 'missing' };
  return true;
}

/** On-demand image loading: no full catalogue preload and no unreviewed fallback. */
export function loadUserEquipmentImagesV95(images, raw, ImageType = globalThis.Image) {
  const { armor, weapon } = resolveUserEquipmentLoadoutV95(raw);
  return Promise.all([armor, weapon].filter(Boolean).map(item => new Promise(resolve => {
    const cached = images?.get(item.imageKey);
    if (ready(cached)) return resolve({ id: item.id, ready: true });
    if (typeof ImageType !== 'function' || !images) return resolve({ id: item.id, ready: false });
    const image = new ImageType();
    image.onload = () => resolve({ id: item.id, ready: true });
    image.onerror = () => resolve({ id: item.id, ready: false });
    images.set(item.imageKey, image);
    image.src = item.path;
  })));
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function userEquipmentPanelHtmlV95(save) {
  if (!USER_EQUIPMENT_V95.length) return '';
  const state = normalizeUserEquipmentV95(save?.player?.userEquipmentV95);
  const locked = Boolean(save?.strategy?.currentOperation);
  return `<h3>Dotation des références utilisateur</h3><p>Armures portées et armes tenues en pose fixe, sans animation dédiée. Dotation optionnelle incluse ; statistiques adaptées au jeu, canon non certifié.</p><div class="catalog-grid">${USER_EQUIPMENT_V95.map(item => {
    const active = state[`${item.kind}Id`] === item.id;
    return `<article class="catalog-card ${active ? 'selected' : ''}"><img src="${escapeHtml(item.path)}" alt="${escapeHtml(item.name)}" loading="lazy" width="180" height="150" style="object-fit:contain"><span class="eyebrow">${item.kind === 'armor' ? 'ARMURE HUMAINE' : 'ARME'} · POSE FIXE</span><h4>${escapeHtml(item.name)}</h4><p>${item.kind === 'armor' ? `Protection +${item.armorBonus || 0} · ${item.enemyProfileId ? 'également ennemi humain' : 'équipement joueur'}` : `Dégâts ${item.damage} · chargeur ${item.magazine}`}</p><button class="button compact" data-user-equipment-v95="${escapeHtml(item.id)}" data-unequip-v95="${active ? item.kind : ''}" ${locked ? 'disabled' : ''}>${locked ? 'OPÉRATION ACTIVE' : active ? 'DÉSÉQUIPER' : 'ÉQUIPER'}</button></article>`;
  }).join('')}</div>`;
}
