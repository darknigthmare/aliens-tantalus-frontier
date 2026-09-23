import { captureTacticalReloadV77, restoreTacticalReloadV77 } from './tactical-reload-v77.js';
import { captureOvomorphCycleResumeV66, getOvomorphChildIdV66,
  restoreOvomorphCycleResumeV66, OVOMORPH_CYCLE_V66 } from './enemy-ovomorph-cycle-v66.js';

export const BIOFORGE_PHYSICAL_SCHEMA_V87 = 1;
export const BIOFORGE_PHYSICAL_MAX_ENEMIES_V87 = 96;

const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const number = (value, min = 0, max = 1e9) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const integer = (value, min = 0, max = 1e6) => Number.isSafeInteger(value) && value >= min && value <= max;
const text = (value, max = 180) => typeof value === 'string' && value.length > 0 && value.length <= max && value.trim() === value;
const clone = value => JSON.parse(JSON.stringify(value));
const facing = value => value === -1 || value === 1;
const profile = value => typeof value === 'string' && /^enemy-[a-z0-9-]{1,140}$/.test(value);
const ownKeys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const PLAYER_CLOCKS = ['fireClock', 'reloadClock', 'actionClock', 'hazardClock', 'jumpBuffer', 'coyoteTime',
  'meleeClock', 'toolUseClock', 'interactionClock', 'bleedOut'];
const PLAYER_FLAGS = ['alive', 'grounded', 'climbing', 'crouching', 'downed', 'inVehicle', 'reloading'];
const ENEMY_CLOCKS = ['attackClock', 'rangedClock', 'staggerClock', 'hurtClock', 'v52HurtClock', 'pounceClock',
  'jammedClock', 'revealed', 'deathClock', 'attackWindupClock', 'attackAnimationClock'];
const ENEMY_FLAGS = ['alive', 'alert', 'attacking', 'captured', 'dormant', 'pendingMelee', 'bursterDetonatedV74'];
const BODY_KEYS = ['x', 'y', 'w', 'h', 'vx', 'vy', 'facing', 'health', 'maxHealth', 'armor'];
const PLAYER_KEYS = [...BODY_KEYS, ...PLAYER_CLOCKS, ...PLAYER_FLAGS, 'maxArmor', 'ammo', 'ammoReserve',
  'magazineSize', 'weaponMode', 'shots', 'kills', 'damageTaken', 'damageBlocked', 'tacticalReloadV77'];
const ENEMY_KEYS = [...BODY_KEYS, ...ENEMY_CLOCKS, ...ENEMY_FLAGS, 'id', 'profileId', 'parentId', 'groundY',
  'spawnX', 'pendingMeleeTargetId', 'ovomorphCycleV66', 'facehuggerAttackV65', 'batchAttackV66'];
const CHARGE_KEYS = ['medkits', 'grenades', 'trackerCharges', 'batteryCharges'];
const numericFields = (source, fields, fallback = 0) => Object.fromEntries(fields.map(key => [key, source[key] ?? fallback]));

function bodyValid(value) {
  return BODY_KEYS.every(key => Object.hasOwn(value, key))
    && number(value.x, 0, 2880) && number(value.y, 0, 720)
    && number(value.w, 1, 512) && number(value.h, 1, 512)
    && value.x + value.w <= 2880 && value.y + value.h <= 720
    && number(value.vx, -10000, 10000) && number(value.vy, -10000, 10000) && facing(value.facing)
    && number(value.maxHealth, 1, 10000) && number(value.health, 0, value.maxHealth)
    && number(value.armor, 0, 10000) && typeof value.alive === 'boolean'
    && (value.alive ? value.health > 0 : value.health === 0);
}

function checkedReload(player) {
  const raw = player.tacticalReloadV77;
  if (raw === null) return !player.reloading && player.reloadClock === 0 ? null : false;
  // Validate the existing clock without executing an interruption or moving rounds.
  const scratch = { ...player, alive: true, downed: false, inVehicle: false, ventTransit: false };
  if (!restoreTacticalReloadV77(scratch, raw, raw?.weaponKey)) return false;
  if (scratch.reloading !== player.reloading || Math.abs(scratch.reloadClock - player.reloadClock) > 1e-9) return false;
  return captureTacticalReloadV77(scratch);
}

function sanitizePlayer(raw) {
  if (!record(raw) || !ownKeys(raw, PLAYER_KEYS) || !bodyValid(raw)
    || !PLAYER_FLAGS.every(key => typeof raw[key] === 'boolean')
    || !PLAYER_CLOCKS.every(key => number(raw[key], 0, 86400))
    || !number(raw.maxArmor, 0, 10000) || raw.armor > raw.maxArmor
    || !integer(raw.magazineSize, 1, 99999) || !integer(raw.ammo, 0, raw.magazineSize)
    || !integer(raw.ammoReserve) || !text(raw.weaponMode, 160)
    || !integer(raw.shots, 0, Number.MAX_SAFE_INTEGER) || !integer(raw.kills, 0, Number.MAX_SAFE_INTEGER)
    || !number(raw.damageTaken) || !number(raw.damageBlocked)
    || !Object.hasOwn(raw, 'tacticalReloadV77')) return null;
  const reload = checkedReload(raw);
  if (reload === false) return null;
  return { ...clone(raw), tacticalReloadV77: reload };
}

function attackValid(raw, maxDuration = 30) {
  return raw === null || record(raw)
    && ownKeys(raw, ['targetId', 'targetInVehicle', 'facing', 'elapsed', 'distance', 'impactResolved'])
    && raw.targetId === 'player' && raw.targetInVehicle === false && facing(raw.facing)
    && number(raw.elapsed, 0, maxDuration) && number(raw.distance, 0, 1000)
    && typeof raw.impactResolved === 'boolean';
}

function cycleValid(raw, enemy) {
  if (enemy.profileId !== OVOMORPH_CYCLE_V66.profileId) return raw === null;
  if (!record(raw) || !ownKeys(raw, ['phase', 'elapsed', 'spawned', 'childId', 'releaseBlocked'])
    || !['sealed', 'opening', 'hatch', 'spent', 'destroyed'].includes(raw.phase)
    || typeof raw.spawned !== 'boolean' || typeof raw.releaseBlocked !== 'boolean'
    || raw.childId !== getOvomorphChildIdV66(enemy)) return false;
  const limit = raw.phase === 'sealed' ? 8 / 6 : raw.phase === 'opening' ? 1 : .8;
  if (!number(raw.elapsed, 0, limit) || raw.phase === 'spent' && (!raw.spawned || raw.elapsed !== .8)
    || ['sealed', 'opening'].includes(raw.phase) && raw.spawned
    || raw.phase === 'hatch' && !raw.spawned && raw.elapsed > .5
    || raw.phase === 'destroyed' && enemy.alive
    || !enemy.alive && raw.phase !== 'destroyed'
    || raw.releaseBlocked && (raw.phase !== 'hatch' || raw.spawned)) return false;
  return true;
}

function sanitizeEnemy(raw) {
  if (!record(raw) || !ownKeys(raw, ENEMY_KEYS) || !bodyValid(raw)
    || !text(raw.id) || !profile(raw.profileId) || !(raw.parentId === null || text(raw.parentId))
    || !number(raw.groundY, 0, 720) || !number(raw.spawnX, 0, 2880)
    || !ENEMY_FLAGS.every(key => typeof raw[key] === 'boolean')
    || !ENEMY_CLOCKS.every(key => number(raw[key], -86400, 86400))
    || !(raw.pendingMeleeTargetId === null || raw.pendingMeleeTargetId === 'player')
    || raw.pendingMelee !== (raw.pendingMeleeTargetId !== null)
    || !cycleValid(raw.ovomorphCycleV66, raw)
    || !attackValid(raw.facehuggerAttackV65, 8 / 12)
    || !attackValid(raw.batchAttackV66)
    || raw.facehuggerAttackV65 !== null && raw.profileId !== OVOMORPH_CYCLE_V66.childProfileId
    || raw.facehuggerAttackV65 !== null && raw.batchAttackV66 !== null
    || raw.parentId !== null && (raw.profileId !== OVOMORPH_CYCLE_V66.childProfileId
      || raw.id !== getOvomorphChildIdV66({ id: raw.parentId }))) return null;
  return clone(raw);
}

/** No coercion/clamping: a present invalid snapshot is not a legacy absent snapshot. */
export function sanitizeBioforgePhysicalV87(raw) {
  if (!record(raw) || raw.schema !== BIOFORGE_PHYSICAL_SCHEMA_V87
    || !ownKeys(raw, ['schema', 'player', 'enemies', 'inventory'])
    || !Array.isArray(raw.enemies) || raw.enemies.length > BIOFORGE_PHYSICAL_MAX_ENEMIES_V87
    || !record(raw.inventory) || !ownKeys(raw.inventory, CHARGE_KEYS)
    || !Object.values(raw.inventory).every(value => integer(value, 0, 99999))) return null;
  const player = sanitizePlayer(raw.player), enemies = raw.enemies.map(sanitizeEnemy);
  if (!player || enemies.some(enemy => !enemy)) return null;
  const byId = new Map(enemies.map(enemy => [enemy.id, enemy]));
  if (byId.size !== enemies.length) return null;
  for (const enemy of enemies) {
    if (enemy.parentId !== null) {
      const parent = byId.get(enemy.parentId);
      if (parent?.profileId !== OVOMORPH_CYCLE_V66.profileId || parent.ovomorphCycleV66?.spawned !== true) return null;
    }
    if (enemy.ovomorphCycleV66?.spawned) {
      const child = byId.get(enemy.ovomorphCycleV66.childId);
      if (!child || child.parentId !== enemy.id) return null;
    }
  }
  return { schema: BIOFORGE_PHYSICAL_SCHEMA_V87, player, enemies, inventory: { ...raw.inventory } };
}

function capturedBody(actor) {
  return { ...numericFields(actor, BODY_KEYS), facing: actor.facing, health: actor.health,
    maxHealth: actor.maxHealth, w: actor.w, h: actor.h };
}

function captureEnemy(enemy) {
  const profileId = enemy.profileId || /^enemy\.profile\.(enemy-[a-z0-9-]+)\./.exec(enemy.visualSheetId || '')?.[1];
  // Existing capture helpers initialize an absent egg cycle: only give them a clone.
  const scratch = { ...enemy, ...(enemy.ovomorphCycleV66 ? { ovomorphCycleV66: clone(enemy.ovomorphCycleV66) } : {}) };
  // Existing data must not be silently clamped/reseeded by a forgiving legacy helper.
  const egg = scratch.ovomorphCycleV66
    ? clone(scratch.ovomorphCycleV66)
    : captureOvomorphCycleResumeV66(scratch).ovomorphCycleV66;
  return {
    ...capturedBody(enemy), ...numericFields(enemy, ENEMY_CLOCKS),
    ...Object.fromEntries(ENEMY_FLAGS.map(key => [key, enemy[key] ?? false])),
    id: enemy.id, profileId, parentId: enemy.ovomorphParentIdV66 ?? null,
    groundY: enemy.groundY ?? enemy.y + enemy.h, spawnX: enemy.spawnX ?? enemy.x,
    pendingMeleeTargetId: enemy.pendingMeleeTargetId ?? null,
    ovomorphCycleV66: egg ? { ...egg, releaseBlocked: scratch.ovomorphCycleV66?.releaseBlocked ?? false } : null,
    facehuggerAttackV65: enemy.facehuggerAttackV65 ? clone(enemy.facehuggerAttackV65) : null,
    batchAttackV66: enemy.batchAttackV66 ? clone(enemy.batchAttackV66) : null
  };
}

/** Pure capture. No engine mutation, Date.now, offline ticks, or free resource refill. */
export function captureBioforgePhysicalV87(engine) {
  if (!record(engine?.player) || !Array.isArray(engine?.enemies)) return null;
  const actor = engine.player;
  try {
    return sanitizeBioforgePhysicalV87({
      schema: BIOFORGE_PHYSICAL_SCHEMA_V87,
      player: {
        ...capturedBody(actor), ...numericFields(actor, PLAYER_CLOCKS),
        ...Object.fromEntries(PLAYER_FLAGS.map(key => [key, actor[key] ?? false])),
        maxArmor: actor.maxArmor ?? actor.armor, ammo: actor.ammo, ammoReserve: actor.ammoReserve,
        magazineSize: actor.magazineSize, weaponMode: actor.weaponMode,
        ...numericFields(actor, ['shots', 'kills', 'damageTaken', 'damageBlocked']),
        tacticalReloadV77: captureTacticalReloadV77(actor)
      },
      enemies: engine.enemies.map(captureEnemy),
      inventory: Object.fromEntries(CHARGE_KEYS.filter(key => Object.hasOwn(engine.inventory || {}, key))
        .map(key => [key, engine.inventory[key]]))
    });
  } catch { return null; }
}

/** Returns the restored actor or null; invalid data leaves the target untouched. */
export function restoreBioforgePlayerPhysicalV87(player, saved) {
  const safe = sanitizePlayer(saved);
  if (!record(player) || !safe || player.w !== safe.w || player.h !== safe.h) return null;
  const next = { ...safe };
  delete next.tacticalReloadV77;
  const scratch = { ...next, alive: true, downed: false, inVehicle: false, ventTransit: false };
  restoreTacticalReloadV77(scratch, safe.tacticalReloadV77, safe.tacticalReloadV77?.weaponKey);
  Object.assign(player, next, { tacticalReload: captureTacticalReloadV77(scratch) });
  return player;
}

/** Canonical factory identity/dimensions must already be validated by the host runtime. */
export function restoreBioforgeEnemyPhysicalV87(enemy, saved) {
  const safe = sanitizeEnemy(saved);
  const identity = enemy?.profileId || /^enemy\.profile\.(enemy-[a-z0-9-]+)\./.exec(enemy?.visualSheetId || '')?.[1];
  if (!record(enemy) || !safe || enemy.id !== safe.id || identity !== safe.profileId
    || enemy.w !== safe.w || enemy.h !== safe.h) return null;
  const next = { ...safe };
  delete next.parentId;
  // Restore the established cycle on a scratch object, never partially on the live actor.
  if (safe.ovomorphCycleV66) {
    const scratch = { ...enemy, ...next };
    if (!restoreOvomorphCycleResumeV66(scratch, safe)) return null;
    next.ovomorphCycleV66 = { ...scratch.ovomorphCycleV66, releaseBlocked: safe.ovomorphCycleV66.releaseBlocked };
  }
  Object.assign(enemy, next);
  if (safe.parentId === null) delete enemy.ovomorphParentIdV66;
  else enemy.ovomorphParentIdV66 = safe.parentId;
  return enemy;
}
