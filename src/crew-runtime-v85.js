import { CREW, WEAPONS } from './content-core-v50.js';
import { RECRUIT_GEAR_CATALOG_V85, resolveCrewDefinitionV85 } from './crew-recruitment-v85.js';
import { captureTacticalReloadV77, restoreTacticalReloadV77, updateTacticalReloadV77 } from './tactical-reload-v77.js';

const bounded = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const copy = value => JSON.parse(JSON.stringify(value));
export const CREW_STANDARD_VISUAL_V85 = 'echo9-standard-v85';
export const CREW_APTITUDE_KEYS_V85 = Object.freeze(['tir', 'physique', 'mobilite', 'sangFroid', 'technique', 'secourisme', 'perception', 'cohesion']);

// Visual identity is a separately declared shared uniform, never a borrowed NPC ID.
export function hasCrewUniformV85(actor = {}) {
  const state = actor.crewV85;
  return Boolean(state?.schema === 85 && /^recruit-v85-[0-9a-f]{8}-[0-9]{6}$/.test(state.crewId || '') && state.crewId === (actor.crewId || actor.operatorId)
    && state.visualProfileId === CREW_STANDARD_VISUAL_V85 && actor.visualProfileId === CREW_STANDARD_VISUAL_V85);
}

export function buildCrewDeploymentV85(member) {
  if (!member?.recruitV85 && !member?.trainingV85 && !Array.isArray(member?.gearV85)) return null;
  const resolved = resolveCrewDefinitionV85(member, CREW);
  if (!resolved || resolved.id !== member.id) return null;
  const aptitudes = Object.fromEntries(CREW_APTITUDE_KEYS_V85.map(key => [key, bounded(resolved.aptitudesV85?.[key], 50, 0, 100)]));
  const seen = new Set();
  const gear = (Array.isArray(resolved.gearV85) ? resolved.gearV85 : []).flatMap(item => {
    if (!item || typeof item !== 'object' || typeof item.instanceId !== 'string' || !/^[a-zA-Z0-9:_-]{1,120}$/.test(item.instanceId)) return [];
    const definition = RECRUIT_GEAR_CATALOG_V85.find(entry => entry.catalogId === item.catalogId && entry.kind === item.kind);
    if (!definition || !item.instanceId || seen.has(item.instanceId)) return [];
    seen.add(item.instanceId);
    return [{ ...copy(item), ...definition, instanceId: item.instanceId }];
  });
  const weaponItem = gear.find(item => item.kind === 'weapon');
  const weapon = weaponItem && WEAPONS.find(entry => entry.id === weaponItem.catalogId);
  const magazine = weapon ? Math.round(bounded(weapon.magazine, 1, 1, 200)) : 0;
  const reserveMagazines = weapon ? bounded(weaponItem.reserveMagazines, 0, 0, 12)
    + gear.filter(item => item.function === 'ammo' && item.ammunitionWeaponId === weapon.id)
      .reduce((sum, item) => sum + bounded(item.reserveMagazines, 0, 0, 12), 0) : 0;
  return {
    schema: 85, crewId: resolved.id, name: resolved.name, callsign: resolved.callsign,
    visualProfileId: member.recruitV85 ? CREW_STANDARD_VISUAL_V85 : null,
    artStatus: member.recruitV85 ? 'shared-standard-uniform-no-individual-portrait' : 'existing-named-crew-art',
    personalEquipment: Boolean(member.recruitV85 || Array.isArray(member.gearV85)),
    aptitudes, gear, weaponRuntime: weapon ? copy(weapon) : null,
    mass: gear.reduce((sum, item) => sum + item.mass, 0), capacity: 12 + aptitudes.physique * 0.28,
    endurance: 100, stress: bounded(member.stress, 0, 0, 100), fatigue: bounded(member.fatigue, 0, 0, 100),
    charges: Object.fromEntries(gear.filter(item => ['medical', 'repair', 'scan'].includes(item.function))
      .map(item => [item.instanceId, Math.round(bounded(item.charges, 0, 0, 99))])),
    magazineSize: magazine, initialReserve: magazine * reserveMagazines,
    armor: Math.max(0, ...gear.filter(item => item.function === 'armor').map(item => bounded(item.armor, 0, 0, 100)))
  };
}

export function attachCrewDeploymentV85(actor, member) {
  const state = buildCrewDeploymentV85(member);
  if (!state) return false;
  actor.crewV85 = state;
  if (state.visualProfileId) actor.visualProfileId = state.visualProfileId;
  actor.callsign = state.callsign;
  actor.name = state.name;
  if (!state.personalEquipment) return true;
  actor.armor = state.armor;
  actor.maxArmor = Math.max(60, state.armor);
  actor.supportCharges = Object.values(state.charges).reduce((sum, value) => sum + value, 0);
  actor.supportClock = 0;
  actor.ammo = state.magazineSize;
  actor.ammoReserve = state.initialReserve;
  actor.magazineSize = state.magazineSize;
  actor.weaponMode = state.weaponRuntime ? 'rifle' : 'unarmed';
  actor.reloading = false;
  actor.reloadClock = 0;
  actor.tacticalReload = null;
  return true;
}

export function crewToolChargesV85(actor, kind) {
  const state = actor?.crewV85;
  return state ? state.gear.filter(item => item.function === kind)
    .reduce((sum, item) => sum + (state.charges[item.instanceId] || 0), 0) : 0;
}

export function spendCrewToolV85(actor, kind) {
  const state = actor?.crewV85;
  const item = state?.gear.find(item => item.function === kind && state.charges[item.instanceId] > 0);
  if (!item) return false;
  state.charges[item.instanceId] -= 1;
  actor.supportCharges = Object.values(state.charges).reduce((sum, value) => sum + value, 0);
  return true;
}

export function crewMovementV85(actor) {
  const s = actor?.crewV85;
  if (!s) return { speed: 1, acceleration: 1, climb: 1, jump: 1 };
  const load = Math.max(0, s.mass / s.capacity - 0.4);
  const endurance = (0.72 + 0.28 * s.endurance / 100) * (1 - s.fatigue * 0.0015);
  const mobility = 0.8 + s.aptitudes.mobilite * 0.004;
  return { speed: mobility * endurance / (1 + load * 0.35), acceleration: mobility,
    climb: mobility * endurance / (1 + load * 0.25), jump: (0.94 + s.aptitudes.mobilite * 0.0012) * (0.92 + 0.08 * s.endurance / 100) };
}

// No dice roll: shot-index recoil pattern makes accuracy deterministic and resumable.
export function crewAimOffsetV85(actor) {
  const state = actor?.crewV85;
  if (!state) return 0;
  const pattern = [-1, 0.5, 1, -0.5, 0.75, -0.75, 0.25, -0.25];
  return pattern[(Math.max(0, Math.round(actor.shots || 0))) % pattern.length]
    * ((100 - state.aptitudes.tir) * 0.001 + state.stress * 0.00065);
}

export function crewSupportProfileV85(actor) {
  const a = actor.crewV85.aptitudes;
  return { heal: 14 + a.secourisme * 0.28, medicalInterval: 7 - a.secourisme * 0.04,
    repair: 12 + a.technique * 0.32, repairInterval: 9 - a.technique * 0.05,
    detectionRange: 320 + a.perception * 5, revealDuration: 2 + a.perception * 0.06 };
}

export function tickCrewRuntimeV85(actor, delta, allies = []) {
  const s = actor?.crewV85;
  if (!s || !actor.alive || actor.downed) return;
  const dt = bounded(delta, 0, 0, 0.25);
  const effort = !actor.inVehicle && (Math.abs(actor.vx || 0) > 40 || actor.climbing);
  const load = s.mass / s.capacity;
  s.endurance = bounded(s.endurance + dt * (effort ? -(2 + load * 7) * (1.35 - s.aptitudes.physique * 0.007) : 5 + s.aptitudes.physique * 0.08), 100, 0, 100);
  const nearby = allies.filter(ally => ally !== actor && ally?.alive && !ally.downed && !ally.inVehicle
    && Math.hypot((ally.x || 0) - actor.x, (ally.y || 0) - actor.y) < 240);
  const reassurance = nearby.reduce((sum, ally) => sum + (ally.crewV85?.aptitudes.cohesion ?? 50) / 100, 0);
  s.stress = Math.max(0, s.stress - dt * (0.4 + s.aptitudes.sangFroid * 0.012 + reassurance * (0.3 + s.aptitudes.cohesion * 0.01)));
  if (actor.squadMember) updateTacticalReloadV77(actor, dt, { weapon: s.weaponRuntime });
  else actor.supportClock = Math.max(0, (actor.supportClock || 0) - dt);
}

export function stressCrewOnDamageV85(actor, damage) {
  const s = actor?.crewV85;
  if (s) s.stress = Math.min(100, s.stress + Math.max(0, damage) * (0.9 - s.aptitudes.sangFroid * 0.006));
}

export function captureCrewRuntimeV85(actor) {
  const s = actor?.crewV85;
  if (!s) return null;
  return { schema: 85, crewId: s.crewId, weaponId: s.weaponRuntime?.id || null,
    ammo: actor.ammo, ammoReserve: actor.ammoReserve, endurance: s.endurance, stress: s.stress,
    charges: { ...s.charges }, fireClock: bounded(actor.fireClock, 0, 0, 30),
    supportClock: bounded(actor.supportClock, 0, 0, 30), tacticalReloadV77: captureTacticalReloadV77(actor) };
}

export function restoreCrewRuntimeV85(actor, raw) {
  const s = actor?.crewV85;
  if (!s || raw?.schema !== 85 || raw.crewId !== s.crewId || raw.weaponId !== (s.weaponRuntime?.id || null)) return false;
  if (s.personalEquipment) {
    actor.magazineSize = s.magazineSize;
    actor.weaponMode = s.weaponRuntime ? 'rifle' : 'unarmed';
    actor.ammo = Math.floor(bounded(raw.ammo, 0, 0, s.magazineSize));
    actor.ammoReserve = Math.floor(bounded(raw.ammoReserve, 0, 0, s.initialReserve));
  }
  s.endurance = bounded(raw.endurance, 100, 0, 100);
  s.stress = bounded(raw.stress, s.stress, 0, 100);
  for (const item of s.gear) if (Object.hasOwn(s.charges, item.instanceId)) {
    s.charges[item.instanceId] = Math.floor(bounded(raw.charges?.[item.instanceId], 0, 0, item.charges));
  }
  if (s.personalEquipment) actor.supportCharges = Object.values(s.charges).reduce((sum, value) => sum + value, 0);
  actor.fireClock = bounded(raw.fireClock, 0, 0, 30);
  actor.supportClock = bounded(raw.supportClock, 0, 0, 30);
  if (s.personalEquipment) restoreTacticalReloadV77(actor, raw.tacticalReloadV77, s.weaponRuntime);
  return true;
}
