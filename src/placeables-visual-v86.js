// V86 reuses four authored V56 equipment bitmaps. It does not certify a new
// orthographic design or invent intermediate deployment/destruction frames.
import { getPlaceableDefinitionV86 } from './placeables-state-v86.js';
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const PLACEABLE_VISUAL_PROFILES_V86 = freeze([
  { kind: 'sentry', catalogId: 'equipment-020-portable-sentry', label: 'Sentinelle portable', imageKey: 'equipmentV56:20', file: 'portable-sentry-use-sheet.png', nativeFacing: -1, scale: 0.32, physicalSize: { w: 72, h: 70 }, limitedView: 'authored-three-quarter-inventory-view-not-orthographic',
    bounds: [[25,73,231,183],[16,22,239,233],[16,21,240,235],[20,66,236,189]], sha256: '283dfe1a7ae52beeb5fb88a8317779dfcdd8feb6c4ca68ff1921622529103cfc' },
  { kind: 'cryo-trap', catalogId: 'equipment-024-cryo-mine', label: 'Mine cryogénique', imageKey: 'equipmentV56:24', file: 'cryo-mine-use-sheet.png', nativeFacing: 1, scale: 2 / 7, physicalSize: { w: 64, h: 34 }, limitedView: 'authored-top-three-quarter-inventory-view-not-orthographic',
    bounds: [[34,72,222,183],[16,72,240,183],[34,72,222,184],[16,71,239,184]], sha256: '16f8e40ab8ceca04f87ed5b71a828b2d14279fbcf4df41eabdfa2d9129da311e' },
  { kind: 'shock-trap', catalogId: 'equipment-026-electroshock-trap', label: 'Piège électrique', imageKey: 'equipmentV56:26', file: 'electroshock-trap-use-sheet.png', nativeFacing: 1, scale: 2 / 7, physicalSize: { w: 64, h: 48 }, limitedView: null,
    bounds: [[37,65,218,191],[16,47,240,209],[21,51,235,204],[21,69,234,186]], sha256: 'fbf65b65bdd8466467cfc9a9104425096d928258397d3d03051efb5b2e22f804' },
  { kind: 'containment', catalogId: 'equipment-028-portable-quarantine', label: 'Confinement portable', imageKey: 'equipmentV56:28', file: 'portable-quarantine-use-sheet.png', nativeFacing: 1, scale: 3 / 7, physicalSize: { w: 96, h: 84 }, limitedView: null,
    bounds: [[16,72,240,183],[16,30,240,226],[16,69,240,187],[16,72,240,183]], sha256: 'cdf16032633ed1f603760b5f9557f842d5942b6059a1f77786743d19bfd7f95a' }
].map(profile => ({ ...profile, path: `/assets/openai/sprites/normalized/tools/${profile.file}`, width: 512, height: 512, cellSize: 256, anchorX: 128,
  contacts: profile.bounds.map(bounds => bounds[3]), artStatus: 'existing-project-art-no-new-animation-generated' })));

const profiles = new Map(PLACEABLE_VISUAL_PROFILES_V86.map(profile => [profile.kind, profile]));
const ownedImages = new WeakMap();
const validBox = item => item && ['x','y','w','h'].every(key => Number.isFinite(item[key])) && item.w > 0 && item.h > 0 && item.w <= 1024 && item.h <= 1024;
const values = value => value instanceof Map ? [...value.values()] : [];
const clamp01 = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const safeText = value => String(value || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 140);

export function resolvePlaceableDrawSpecV86(item, { packed = false, preview = false } = {}) {
  const definition = getPlaceableDefinitionV86(item?.catalogId);
  const profile = definition && profiles.get(definition.kind);
  if (!profile || item.kind !== profile.kind || !validBox(item)) return null;
  if (!preview && !packed && !['carried','deployed','spent','destroyed'].includes(item.status)) return null;
  let frame;
  if (packed || item.status === 'carried' && !preview) frame = 0;
  else if (preview) frame = 1;
  // The sentry's fourth cell is a folded case, not an empty deployed weapon.
  // Keep its legs deployed until a real recovery task finishes.
  else if (item.kind === 'sentry') frame = item.status === 'deployed' && item.firingClockV86 > 0 ? 2 : 1;
  else if (item.kind === 'containment') frame = item.status === 'deployed' && item.duration > 0 ? 1 : 2;
  else frame = item.status === 'deployed' && item.armed !== false ? 1 : 3;
  const facing = item.facing < 0 ? -1 : 1;
  const flip = facing !== profile.nativeFacing;
  const anchor = { x: item.x + item.w / 2, y: item.y + item.h };
  const bounds = profile.bounds[frame], scale = profile.scale;
  const sprite = { x: anchor.x - profile.anchorX * scale, y: anchor.y - profile.contacts[frame] * scale, w: 256 * scale, h: 256 * scale };
  const left = flip ? 256 - bounds[2] : bounds[0];
  return { profile, sourceCatalogId: item.catalogId, sharedVariant: item.catalogId !== profile.catalogId, frame, flip, anchor, scale, sprite, source: { x: frame % 2 * 256, y: Math.floor(frame / 2) * 256, w: 256, h: 256 },
    visible: { x: sprite.x + left * scale, y: sprite.y + bounds[1] * scale, w: (bounds[2] - bounds[0]) * scale, h: (bounds[3] - bounds[1]) * scale } };
}

function imageFor(engine, profile) {
  const shared = engine.images?.get?.(profile.imageKey);
  if (shared) return shared;
  let cache = ownedImages.get(engine);
  if (!cache) { cache = new Map(); ownedImages.set(engine, cache); }
  if (!cache.has(profile.catalogId) && typeof globalThis.Image === 'function') {
    const image = new globalThis.Image(); image.decoding = 'async'; image.src = profile.path; cache.set(profile.catalogId, image);
  }
  return cache.get(profile.catalogId);
}

function bitmap(engine, ctx, spec, alpha = 1) {
  const image = imageFor(engine, spec.profile);
  const width = image && ('naturalWidth' in image ? image.naturalWidth : image.width);
  const height = image && ('naturalHeight' in image ? image.naturalHeight : image.height);
  if (!image?.complete || width !== 512 || height !== 512) return false;
  const { source, sprite } = spec;
  ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false;
  if (spec.flip) { ctx.translate(sprite.x + sprite.w, sprite.y); ctx.scale(-1, 1); ctx.drawImage(image, source.x, source.y, source.w, source.h, 0, 0, sprite.w, sprite.h); }
  else ctx.drawImage(image, source.x, source.y, source.w, source.h, sprite.x, sprite.y, sprite.w, sprite.h);
  ctx.restore(); return true;
}

function label(ctx, text, x, y, color = '#d8e7dc', maxWidth = 680) {
  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(2,8,6,.9)'; const width = Math.min(maxWidth, ctx.measureText(text).width + 10);
  ctx.fillRect(x - width / 2, y - 15, width, 17); ctx.fillStyle = color; ctx.fillText(text, x, y, Math.max(1, maxWidth - 10));
}

function signals(ctx, item, spec) {
  const x = spec.anchor.x, y = spec.visible.y - 5;
  if (item.status === 'destroyed') label(ctx, 'HORS SERVICE', x, y, '#edaaa0');
  else if (item.kind === 'sentry' && Number.isFinite(item.ammo)) label(ctx, `${Math.max(0, Math.floor(item.ammo))} MUN.`, x, y, item.ammo > 0 ? '#d8e7dc' : '#f2bb7f');
  else if (item.status === 'spent') label(ctx, 'DÉCHARGÉ', x, y, '#f2bb7f');
  if (Number.isFinite(item.health) && Number.isFinite(item.maxHealth) && item.maxHealth > 0 && item.health < item.maxHealth) {
    ctx.fillStyle = '#2c3632'; ctx.fillRect(x - 24, y - 24, 48, 3);
    ctx.fillStyle = '#d49b6b'; ctx.fillRect(x - 24, y - 24, 48 * clamp01(item.health / item.maxHealth), 3);
  }
}

function previewOverlay(ctx, preview, spec) {
  const color = preview.valid ? '#92e6ad' : '#efa098';
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
  // These are placement UI guides over a real bitmap, never replacement art.
  ctx.strokeRect(preview.x, preview.y, preview.w, preview.h); ctx.setLineDash([]);
  const facing = preview.facing < 0 ? -1 : 1;
  if (preview.kind === 'sentry' && Number.isFinite(preview.range) && preview.range > 0 && preview.range <= 4000
    && Number.isFinite(preview.halfAngleRadians) && preview.halfAngleRadians > 0 && preview.halfAngleRadians <= Math.PI) {
    const x = Number.isFinite(preview.muzzleX) ? preview.muzzleX : preview.x + preview.w / 2;
    const y = Number.isFinite(preview.muzzleY) ? preview.muzzleY : preview.y + 8;
    const angle = facing < 0 ? Math.PI : 0;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, preview.range, angle - preview.halfAngleRadians, angle + preview.halfAngleRadians); ctx.closePath();
    ctx.globalAlpha = 0.06; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 0.32; ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.beginPath(); ctx.moveTo(spec.anchor.x, preview.y - 8); ctx.lineTo(spec.anchor.x + facing * 26, preview.y - 8);
  ctx.lineTo(spec.anchor.x + facing * 20, preview.y - 12); ctx.moveTo(spec.anchor.x + facing * 26, preview.y - 8); ctx.lineTo(spec.anchor.x + facing * 20, preview.y - 4); ctx.stroke();
  label(ctx, preview.valid ? 'EMPLACEMENT VALIDE' : safeText(preview.reason) || 'EMPLACEMENT REFUSÉ', spec.anchor.x, preview.y - 20, color);
  ctx.restore();
}

export function drawPlaceablesV86(engine, ctx) {
  const report = { drawn: 0, previews: 0, tasks: 0, missing: [], limitedView: 0 };
  if (!engine || !ctx) return report;
  const instances = Array.isArray(engine.placeablesV86?.instances) ? engine.placeablesV86.instances : [];
  const tasks = values(engine.placeableTasksV86), previews = values(engine.placeablePreviewsV86);
  const seen = new Set();
  ctx.save();
  const draw = (item, options = {}) => {
    const spec = resolvePlaceableDrawSpecV86(item, options); if (!spec) return null;
    if (!bitmap(engine, ctx, spec, options.preview ? 0.48 : item.status === 'destroyed' ? 0.5 : 1)) {
      report.missing.push(spec.profile.catalogId); label(ctx, 'VISUEL INDISPONIBLE', spec.anchor.x, item.y - 4, '#efa098'); return null;
    }
    if (spec.profile.limitedView) report.limitedView += 1;
    return spec;
  };
  for (const item of instances.slice(0, 256)) {
    if (!item?.instanceId || seen.has(item.instanceId) || item.status === 'carried' || item.onGround !== true) continue;
    seen.add(item.instanceId); const spec = draw(item); if (!spec) continue;
    signals(ctx, item, spec); report.drawn += 1;
  }
  for (const task of tasks.slice(0, 32)) {
    if (!task || !['deploy','recover'].includes(task.type)) continue;
    const instance = instances.find(item => item.instanceId === task.instanceId);
    if (!instance || !validBox(task) || !(task.duration > 0) || !Number.isFinite(task.elapsed)) continue;
    const item = { ...instance, x: task.x, y: task.y, w: task.w, h: task.h, facing: task.facing };
    let spec = resolvePlaceableDrawSpecV86(item);
    if (task.type === 'deploy' && instance.status === 'carried' && !seen.has(instance.instanceId)) { spec = draw(item, { packed: true }); seen.add(instance.instanceId); if (spec) report.drawn += 1; }
    if (!spec) continue;
    const progress = clamp01(task.elapsed / task.duration);
    label(ctx, `${task.type === 'deploy' ? 'INSTALLATION' : 'RÉCUPÉRATION'} ${Math.round(progress * 100)} %`, spec.anchor.x, task.y - 12);
    ctx.fillStyle = '#25362c'; ctx.fillRect(spec.anchor.x - 28, task.y - 9, 56, 4);
    ctx.fillStyle = '#98d4a8'; ctx.fillRect(spec.anchor.x - 28, task.y - 9, 56 * progress, 4); report.tasks += 1;
  }
  for (const preview of previews.slice(0, 32)) {
    const spec = draw(preview, { preview: true }); if (!spec) continue;
    previewOverlay(ctx, preview, spec); report.previews += 1;
  }
  ctx.restore(); return report;
}

// Optional screen-space caption for narrow viewports; the game's normal HUD
// remains responsible for its own layout and may omit this supplemental strip.
export function drawPlaceableHudV86(engine, ctx) {
  if (!engine || !ctx) return [];
  const preview = values(engine.placeablePreviewsV86).find(item => resolvePlaceableDrawSpecV86(item, { preview: true }));
  if (!preview) return [];
  const text = preview.valid ? `${safeText(getPlaceableDefinitionV86(preview.catalogId).name)} · emplacement valide` : safeText(preview.reason) || 'Emplacement refusé';
  const width = Math.max(240, Number(engine.canvas?.width) || 1280), height = Math.max(160, Number(engine.canvas?.height) || 720);
  ctx.save(); label(ctx, text, width / 2, height - 22, preview.valid ? '#a9e7b9' : '#efa098', width - 32); ctx.restore(); return [text];
}
