export const PLAYER_VISUAL_ASSETS_V81 = Object.freeze([
  Object.freeze({ sheetId: 'player.echo9-marine.locomotion', imageKey: 'playerLocomotion', path: '/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png', sha256: 'f5b25ca6189d0a2891d1a6f60635417238d7dc52bfece7ae20a2cd9dffa21ca3' }),
  Object.freeze({ sheetId: 'player.echo9-marine.combat', imageKey: 'playerCombat', path: '/assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png', sha256: 'a0880c628fe8b4892bcbab525d7e56583f21b8e92229d75370a608ab0d370e55' }),
  Object.freeze({ sheetId: 'player.echo9-marine.melee', imageKey: 'playerMeleeV56', path: '/assets/openai/sprites/normalized/player/echo9-marine-melee-sheet.png', sha256: '5f04200b84c7d6bf0df84390c450fdf258e6c60e7c0993ddf4b236bf88a87a26' }),
  Object.freeze({ sheetId: 'player.echo9-marine.interaction', imageKey: 'playerInteractionV56', path: '/assets/openai/sprites/normalized/player/echo9-marine-interaction-sheet.png', sha256: 'c4b88d736089c23caf60d33baf2153482a57522e17ab345d390d805b3f2d5ab6' }),
  Object.freeze({ sheetId: 'player.echo9-marine.tool-use', imageKey: 'playerToolUseV56', path: '/assets/openai/sprites/normalized/player/echo9-marine-tool-use-sheet.png', sha256: '3cc7517794997202608308a493e2ac649a76671034e1d825a40f127d4a1a0053' })
]);
const ECHO9_SHEET_IDS = Object.freeze(PLAYER_VISUAL_ASSETS_V81.map((asset) => asset.sheetId));

const ECHO9_SHEET_ID_SET = new Set(ECHO9_SHEET_IDS);
const ECHO9_ASPECT = 110 / 148;

export const PLAYER_VISUAL_CONTRACT_V81 = Object.freeze({
  schema: 81,
  role: 'player',
  family: 'player',
  operatorId: 'echo-9',
  sheetIds: ECHO9_SHEET_IDS,
  fallback: Object.freeze({
    sheetId: 'player.echo9-marine.locomotion',
    clipId: 'idle',
    reason: 'echo9-explicit-fallback'
  }),
  source: Object.freeze({ width: 1024, height: 1024, columns: 4, rows: 4, cellWidth: 256, cellHeight: 256, guard: 16 }),
  pivot: Object.freeze({ id: 'humanoid-feet', kind: 'feet', x: 128, y: 240 }),
  surfaces: Object.freeze({
    mission: Object.freeze({ height: 148, width: 110 }),
    hub: Object.freeze({ height: 128, width: Math.round(128 * ECHO9_ASPECT) }),
    bioforge: Object.freeze({ height: 98, width: Math.round(98 * ECHO9_ASPECT) })
  })
});

export function normalizePlayerFacingV81(value) {
  return Number(value) < 0 ? -1 : 1;
}

export function isPlayerSheetAllowedV81(sheetOrId) {
  const id = typeof sheetOrId === 'string' ? sheetOrId : sheetOrId?.id;
  if (!ECHO9_SHEET_ID_SET.has(id)) return false;
  return typeof sheetOrId === 'string' || sheetOrId?.family === PLAYER_VISUAL_CONTRACT_V81.family;
}

export function enforcePlayerAnimationRequestV81(request, fallbackRequest = PLAYER_VISUAL_CONTRACT_V81.fallback) {
  if (isPlayerSheetAllowedV81(request?.sheetId)) return request;
  const fallback = isPlayerSheetAllowedV81(fallbackRequest?.sheetId)
    ? fallbackRequest
    : PLAYER_VISUAL_CONTRACT_V81.fallback;
  return Object.freeze({
    ...fallback,
    degraded: request?.sheetId ? 'player-sheet-family-rejected-v81' : 'player-request-missing-v81'
  });
}

export function buildPlayerNeuroVisualContractV81(source = null) {
  if (!source) return null;
  return Object.freeze({
    schema: 81,
    role: PLAYER_VISUAL_CONTRACT_V81.role,
    family: PLAYER_VISUAL_CONTRACT_V81.family,
    operatorId: PLAYER_VISUAL_CONTRACT_V81.operatorId,
    profileId: String(source.profileId || ''),
    enemyId: String(source.enemyId || ''),
    enemyName: String(source.enemyName || source.enemyId || ''),
    biology: String(source.biology || 'xenomorph'),
    caste: String(source.caste || ''),
    spriteKey: 'echo9-marine',
    sheetId: PLAYER_VISUAL_CONTRACT_V81.fallback.sheetId,
    clipSet: 'player-locomotion',
    sourceFacing: 1,
    exact: false,
    degraded: 'neuro-player-art-unavailable-v81',
    source: 'echo9-player-only-neuro-fallback'
  });
}

export function validatePlayerSpriteSampleV81({ sheet, image, sample, pivot, entity, surface = 'mission' } = {}) {
  const contract = PLAYER_VISUAL_CONTRACT_V81;
  if (!isPlayerSheetAllowedV81(sheet)) return Object.freeze({ ok: false, reason: 'player-sheet-rejected' });
  if (sheet.columns !== contract.source.columns || sheet.rows !== contract.source.rows
    || sheet.cellWidth !== contract.source.cellWidth || sheet.cellHeight !== contract.source.cellHeight) {
    return Object.freeze({ ok: false, reason: 'player-grid-mismatch' });
  }
  if (sheet.pivot !== contract.pivot.id || pivot?.x !== contract.pivot.x || pivot?.y !== contract.pivot.y || pivot?.kind !== contract.pivot.kind) {
    return Object.freeze({ ok: false, reason: 'player-pivot-mismatch' });
  }
  const imageWidth = Number(image?.naturalWidth || image?.width);
  const imageHeight = Number(image?.naturalHeight || image?.height);
  if (!image?.complete || imageWidth !== contract.source.width || imageHeight !== contract.source.height) {
    return Object.freeze({ ok: false, reason: 'player-source-size-mismatch' });
  }
  const column = Number(sample?.column);
  const row = Number(sample?.row);
  if (!Number.isInteger(column) || !Number.isInteger(row)
    || column < 0 || column >= contract.source.columns || row < 0 || row >= contract.source.rows) {
    return Object.freeze({ ok: false, reason: 'player-source-cell-out-of-range' });
  }
  const values = [entity?.x, entity?.y, entity?.w, entity?.h].map(Number);
  if (!values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0) {
    return Object.freeze({ ok: false, reason: 'player-entity-geometry-invalid' });
  }
  const metrics = contract.surfaces[surface];
  if (!metrics || metrics.width <= 0 || metrics.height <= 0) return Object.freeze({ ok: false, reason: 'player-surface-size-invalid' });
  const source = Object.freeze({
    x: column * contract.source.cellWidth,
    y: row * contract.source.cellHeight,
    width: contract.source.cellWidth,
    height: contract.source.cellHeight
  });
  if (source.x + source.width > imageWidth || source.y + source.height > imageHeight) {
    return Object.freeze({ ok: false, reason: 'player-source-cell-overflow' });
  }
  const facing = normalizePlayerFacingV81(entity.facing);
  const flip = normalizePlayerFacingV81(sheet.sourceFacing) !== facing;
  const scaleX = metrics.width / contract.source.cellWidth;
  const scaleY = metrics.height / contract.source.cellHeight;
  const anchorX = values[0] + values[2] / 2;
  const anchorY = values[1] + values[3];
  const pivotX = flip ? contract.source.cellWidth - contract.pivot.x : contract.pivot.x;
  const sprite = Object.freeze({
    x: anchorX - pivotX * scaleX,
    y: anchorY - contract.pivot.y * scaleY,
    width: metrics.width,
    height: metrics.height
  });
  return Object.freeze({
    ok: true,
    reason: null,
    sheetId: sheet.id,
    facing,
    flip,
    source,
    sprite,
    pivot: Object.freeze({ id: contract.pivot.id, x: anchorX, y: anchorY })
  });
}

export function drawEcho9FallbackV81(ctx, entity, { surface = 'mission', reason = 'player-sprite-unavailable' } = {}) {
  if (!ctx || !entity) return Object.freeze({ drawn: false, fallback: true, reason });
  const metrics = PLAYER_VISUAL_CONTRACT_V81.surfaces[surface] || PLAYER_VISUAL_CONTRACT_V81.surfaces.mission;
  const facing = normalizePlayerFacingV81(entity.facing);
  const x = Number(entity.x) + Number(entity.w) / 2 - metrics.width / 2;
  const y = Number(entity.y) + Number(entity.h) - metrics.height * (PLAYER_VISUAL_CONTRACT_V81.pivot.y / PLAYER_VISUAL_CONTRACT_V81.source.cellHeight);
  ctx.save?.();
  ctx.translate?.(x + (facing < 0 ? metrics.width : 0), y);
  ctx.scale?.(facing < 0 ? -1 : 1, 1);
  ctx.fillStyle = '#26372f';
  ctx.fillRect?.(metrics.width * 0.32, metrics.height * 0.18, metrics.width * 0.36, metrics.height * 0.55);
  ctx.fillStyle = '#95b596';
  ctx.fillRect?.(metrics.width * 0.36, metrics.height * 0.08, metrics.width * 0.28, metrics.height * 0.22);
  ctx.fillStyle = '#b8c5bd';
  ctx.fillRect?.(metrics.width * 0.58, metrics.height * 0.42, metrics.width * 0.36, Math.max(3, metrics.height * 0.06));
  ctx.fillStyle = '#1c2924';
  ctx.fillRect?.(metrics.width * 0.31, metrics.height * 0.7, metrics.width * 0.15, metrics.height * 0.25);
  ctx.fillRect?.(metrics.width * 0.54, metrics.height * 0.7, metrics.width * 0.15, metrics.height * 0.25);
  ctx.restore?.();
  return Object.freeze({
    drawn: true,
    fallback: true,
    reason,
    sheetId: PLAYER_VISUAL_CONTRACT_V81.fallback.sheetId,
    facing,
    sprite: Object.freeze({ x, y, width: metrics.width, height: metrics.height }),
    pivot: Object.freeze({ id: PLAYER_VISUAL_CONTRACT_V81.pivot.id, x: Number(entity.x) + Number(entity.w) / 2, y: Number(entity.y) + Number(entity.h) })
  });
}

export function drawPlayerSpriteV81(ctx, options = {}) {
  const validation = validatePlayerSpriteSampleV81(options);
  if (!validation.ok) return drawEcho9FallbackV81(ctx, options.entity, { surface: options.surface, reason: validation.reason });
  const { image } = options;
  const { source, sprite, flip } = validation;
  ctx.save?.();
  ctx.beginPath?.();
  ctx.rect?.(sprite.x, sprite.y, sprite.width, sprite.height);
  ctx.clip?.();
  if (flip) {
    ctx.translate?.(sprite.x + sprite.width, sprite.y);
    ctx.scale?.(-1, 1);
    ctx.drawImage?.(image, source.x, source.y, source.width, source.height, 0, 0, sprite.width, sprite.height);
  } else {
    ctx.drawImage?.(image, source.x, source.y, source.width, source.height, sprite.x, sprite.y, sprite.width, sprite.height);
  }
  ctx.restore?.();
  return Object.freeze({ ...validation, drawn: true, fallback: false });
}
