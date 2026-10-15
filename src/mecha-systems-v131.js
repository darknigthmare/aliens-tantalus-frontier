// Original game tuning. These prototypes do not certify a canonical P-9000,
// TALOS design, Genocide loader configuration or dedicated production sprite.
export const MECHA_SUBSYSTEMS_V131 = Object.freeze(['cockpit', 'reactor', 'hydraulics', 'leftArm', 'rightArm']);
export const MECHA_LOADOUTS_V131 = Object.freeze({
  atlas: Object.freeze({ id: 'atlas', name: 'Atlas', role: 'Pince hydraulique / canon de rupture', color: '#bbab68',
    hull: 520, speed: 185, cooling: 13, insulation: 0.65, primary: Object.freeze({ damage: 48, energy: 9, heat: 12, interval: 0.4, speed: 760, count: 1, range: 1000 }),
    secondary: Object.freeze({ kind: 'grapple', damage: 112, energy: 12, heat: 10, interval: 1.05, range: 170 }) }),
  vulcain: Object.freeze({ id: 'vulcain', name: 'Vulcain', role: 'Projection thermique / coupe de siège', color: '#d88c5a',
    hull: 440, speed: 205, cooling: 17, insulation: 0.8, primary: Object.freeze({ damage: 34, energy: 6, heat: 14, interval: 0.24, speed: 620, count: 1, range: 420, status: 'burn' }),
    secondary: Object.freeze({ kind: 'cutter', damage: 138, energy: 18, heat: 22, interval: 1.2, range: 145 }) }),
  cerbere: Object.freeze({ id: 'cerbere', name: 'Cerbère', role: 'Deux canons / percussion blindée', color: '#a3b3a3',
    hull: 460, speed: 190, cooling: 11, insulation: 0.65, primary: Object.freeze({ damage: 34, energy: 12, heat: 16, interval: 0.5, speed: 850, count: 2, range: 1150 }),
    secondary: Object.freeze({ kind: 'bash', damage: 92, energy: 10, heat: 8, interval: 0.8, range: 150 }) }),
  meduse: Object.freeze({ id: 'meduse', name: 'Méduse', role: 'Gel cryogénique / arc de contention', color: '#7bc5d4',
    hull: 420, speed: 220, cooling: 15, insulation: 0.9, primary: Object.freeze({ damage: 38, energy: 8, heat: 8, interval: 0.38, speed: 690, count: 1, range: 850, status: 'frozen' }),
    secondary: Object.freeze({ kind: 'arc', damage: 76, energy: 15, heat: 6, interval: 0.9, range: 240, status: 'stun' }) })
});
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const record = value => value && typeof value === 'object' && !Array.isArray(value);

export function createMechaSystemsV131(loadoutId = 'atlas', { colossal = false } = {}) {
  const profile = MECHA_LOADOUTS_V131[loadoutId] || MECHA_LOADOUTS_V131.atlas;
  const maxHull = Math.round(profile.hull * (colossal ? 1.55 : 1));
  return { schema: 131, loadoutId: profile.id, colossal: Boolean(colossal), hull: maxHull, maxHull,
    energy: 100, heat: 0, corrosion: 0, gel: 0, overheated: false, destroyed: false,
    coolant: 4, repairKits: 2, coolingClock: 0, repairClock: 0, dashClock: 0,
    primaryClock: 0, secondaryClock: 0, hitClock: 0,
    systems: Object.fromEntries(MECHA_SUBSYSTEMS_V131.map(id => [id, 100])),
    shots: 0, strikes: 0, damageTaken: 0 };
}

export function mechaReadyV131(state) {
  return Boolean(state && !state.destroyed && state.hull > 0 && state.systems.cockpit > 0 && state.systems.reactor > 0);
}
export function mechaMobilityV131(state) {
  if (!mechaReadyV131(state) || state.repairClock > 0) return 0;
  return (0.3 + 0.7 * state.systems.hydraulics / 100) * (state.gel > 0 ? 0.58 : 1) * (state.overheated ? 0.45 : 1);
}

export function spendMechaActionV131(state, action = 'primary') {
  if (!['primary', 'secondary'].includes(action) || !mechaReadyV131(state) || state.overheated
    || state.coolingClock > 0 || state.repairClock > 0 || state[`${action}Clock`] > 0) return false;
  const profile = MECHA_LOADOUTS_V131[state.loadoutId], weapon = profile[action];
  if (state.energy < weapon.energy || state.systems[action === 'primary' ? 'rightArm' : 'leftArm'] <= 0) return false;
  state.energy -= weapon.energy; state.heat = Math.min(100, state.heat + weapon.heat);
  state[`${action}Clock`] = weapon.interval;
  if (action === 'primary') state.shots++; else state.strikes++;
  if (state.heat >= 100) state.overheated = true;
  return true;
}

export function resolveMechaHitRegionV131(vehicle, source = {}) {
  if (MECHA_SUBSYSTEMS_V131.includes(source.hitRegionV131)) return source.hitRegionV131;
  const impactY = finite(source.y, vehicle.y + vehicle.h * 0.5);
  const ratioY = (impactY - vehicle.y) / Math.max(1, vehicle.h);
  if (ratioY < 0.3) return 'cockpit';
  if (ratioY > 0.76) return 'hydraulics';
  const ratioX = (finite(source.x, vehicle.x + vehicle.w * 0.5) - vehicle.x) / Math.max(1, vehicle.w);
  if (ratioX < 0.3) return 'leftArm';
  if (ratioX > 0.7) return 'rightArm';
  return 'reactor';
}

export function damageMechaSystemsV131(state, amount, region = 'reactor', { acid = false, gel = false } = {}) {
  if (!mechaReadyV131(state) || !Number.isFinite(amount) || amount <= 0 || !MECHA_SUBSYSTEMS_V131.includes(region)) return 0;
  const damage = Math.min(state.hull, amount);
  state.hull -= damage; state.damageTaken += damage; state.hitClock = 0.22;
  state.systems[region] = Math.max(0, state.systems[region] - amount * (region === 'cockpit' ? 0.45 : 0.65));
  if (acid) state.corrosion = Math.min(100, state.corrosion + amount * (1 - MECHA_LOADOUTS_V131[state.loadoutId].insulation) + 8);
  if (gel) state.gel = Math.min(8, state.gel + 3);
  state.destroyed = state.hull <= 0 || state.systems.cockpit <= 0 || state.systems.reactor <= 0;
  return damage;
}

export function beginMechaCoolingV131(state) {
  if (!mechaReadyV131(state) || state.coolingClock > 0 || state.repairClock > 0 || state.coolant <= 0
    || (state.heat <= 0 && state.corrosion <= 0 && state.gel <= 0)) return false;
  state.coolant--; state.coolingClock = 1.4; return true;
}
export function beginMechaRepairV131(state) {
  if (!mechaReadyV131(state) || state.repairClock > 0 || state.coolingClock > 0 || state.repairKits <= 0
    || (state.hull === state.maxHull && MECHA_SUBSYSTEMS_V131.every(id => state.systems[id] === 100))) return false;
  state.repairKits--; state.repairClock = 2.4; return true;
}

export function advanceMechaSystemsV131(state, delta) {
  if (!state || !Number.isFinite(delta) || delta <= 0 || !mechaReadyV131(state)) return;
  const profile = MECHA_LOADOUTS_V131[state.loadoutId];
  const repairing = state.repairClock > 0, cooling = state.coolingClock > 0;
  for (const key of ['primaryClock', 'secondaryClock', 'hitClock', 'dashClock']) state[key] = Math.max(0, state[key] - delta);
  state.heat = Math.max(0, state.heat - delta * (cooling ? 62 : profile.cooling * (0.55 + state.systems.reactor * 0.0045)));
  state.energy = Math.min(100, state.energy + delta * (repairing || cooling ? 3 : 12) * state.systems.reactor / 100);
  state.gel = Math.max(0, state.gel - delta * (cooling ? 3 : 1));
  if (cooling) {
    state.corrosion = Math.max(0, state.corrosion - delta * 48);
    state.coolingClock = Math.max(0, state.coolingClock - delta);
  }
  if (state.overheated && state.heat <= 45) state.overheated = false;
  if (repairing) {
    state.repairClock = Math.max(0, state.repairClock - delta);
    if (state.repairClock === 0) {
      state.hull = Math.min(state.maxHull, state.hull + state.maxHull * 0.32);
      for (const id of MECHA_SUBSYSTEMS_V131) state.systems[id] = Math.min(100, state.systems[id] + 48);
    }
  }
  if (state.corrosion > 0 && !cooling) {
    const damage = delta * state.corrosion * 0.025;
    state.hull = Math.max(0, state.hull - damage); state.damageTaken += damage;
    state.systems.hydraulics = Math.max(0, state.systems.hydraulics - damage * 0.25);
    if (state.hull <= 0) state.destroyed = true;
  }
}

export function validateMechaSystemsV131(raw, { loadoutId, colossal } = {}) {
  if (!record(raw) || raw.schema !== 131 || !MECHA_LOADOUTS_V131[raw.loadoutId]
    || loadoutId && raw.loadoutId !== loadoutId || typeof raw.colossal !== 'boolean'
    || colossal !== undefined && raw.colossal !== colossal || !record(raw.systems)) return { valid: false, reason: 'mecha-systems-schema' };
  const state = createMechaSystemsV131(raw.loadoutId, { colossal: raw.colossal });
  const ranges = { hull: state.maxHull, energy: 100, heat: 100, corrosion: 100, gel: 8, coolant: 4, repairKits: 2,
    coolingClock: 1.4, repairClock: 2.4, dashClock: 1.5, primaryClock: 1.2, secondaryClock: 1.2,
    hitClock: 0.22, shots: 1000000, strikes: 1000000, damageTaken: 1000000 };
  if (raw.maxHull !== state.maxHull || Object.entries(ranges).some(([key, max]) => !Number.isFinite(raw[key]) || raw[key] < 0 || raw[key] > max)
    || ['coolant', 'repairKits', 'shots', 'strikes'].some(key => !Number.isInteger(raw[key]))
    || MECHA_SUBSYSTEMS_V131.some(id => !Number.isFinite(raw.systems[id]) || raw.systems[id] < 0 || raw.systems[id] > 100)
    || typeof raw.destroyed !== 'boolean' || typeof raw.overheated !== 'boolean'
    || raw.destroyed !== (raw.hull <= 0 || raw.systems.cockpit <= 0 || raw.systems.reactor <= 0)
    || raw.coolingClock > 0 && raw.repairClock > 0 || raw.overheated && raw.heat <= 45 || raw.heat >= 100 && !raw.overheated)
    return { valid: false, reason: 'mecha-systems-inconsistent' };
  Object.assign(state, raw, { systems: Object.fromEntries(MECHA_SUBSYSTEMS_V131.map(id => [id, raw.systems[id]])) });
  return { valid: true, state };
}

export function drawMechaPrototypeV131(ctx, vehicle, state, time = 0) {
  if (!vehicle || !state) return;
  const profile = MECHA_LOADOUTS_V131[state.loadoutId], { x, y, w, h } = vehicle;
  const moving = Math.abs(vehicle.vx) > 5, stride = moving ? Math.sin(time * 7) * w * 0.055 : 0;
  ctx.save(); ctx.translate(x + w / 2, y + h); ctx.scale(vehicle.facing < 0 ? -1 : 1, 1);
  ctx.fillStyle = '#253333'; ctx.fillRect(-w * 0.43, -h * 0.68, w * 0.86, h * 0.1);
  for (const side of [-1, 1]) {
    ctx.fillStyle = state.systems.hydraulics < 35 ? '#925c43' : '#516162';
    ctx.fillRect(side * w * 0.21 - w * 0.11, -h * 0.43, w * 0.22, h * 0.34);
    ctx.fillStyle = '#b0a770'; ctx.fillRect(side * w * 0.21 - w * 0.055, -h * 0.39, w * 0.06, h * 0.25);
    ctx.fillStyle = '#273e40'; ctx.fillRect(side * w * 0.21 - w * 0.14 + side * stride, -h * 0.1, w * 0.3, h * 0.1);
  }
  ctx.fillStyle = profile.color; ctx.fillRect(-w * 0.3, -h * 0.79, w * 0.58, h * 0.39);
  ctx.fillStyle = '#142b31'; ctx.fillRect(-w * 0.22, -h * 0.98, w * 0.4, h * 0.25);
  ctx.fillStyle = state.systems.cockpit < 35 ? '#df7860' : '#91c7c3'; ctx.fillRect(-w * 0.17, -h * 0.94, w * 0.29, h * 0.12);
  ctx.strokeStyle = '#d1c897'; ctx.lineWidth = 3;
  ctx.strokeRect(-w * 0.3, -h * 0.79, w * 0.58, h * 0.39);
  ctx.fillStyle = state.systems.reactor < 35 ? '#f98e61' : '#7eaaaa'; ctx.fillRect(-w * 0.18, -h * 0.69, w * 0.25, h * 0.1);
  const reach = state.secondaryClock > 0 ? w * 0.12 : 0;
  ctx.fillStyle = state.systems.leftArm > 0 ? '#606e65' : '#573f38';
  ctx.fillRect(-w * 0.49, -h * 0.7, w * 0.19, h * 0.33);
  ctx.fillStyle = state.systems.rightArm > 0 ? profile.color : '#573f38';
  ctx.fillRect(w * 0.18, -h * 0.66, w * 0.3 + reach, h * 0.12);
  ctx.fillStyle = '#182d30';
  const barrels = profile.id === 'cerbere' ? 2 : 1;
  for (let i = 0; i < barrels; i++) ctx.fillRect(w * 0.4, -h * 0.64 + i * h * 0.055, w * 0.12, h * 0.035);
  ctx.strokeStyle = profile.color; ctx.lineWidth = 5; ctx.beginPath();
  ctx.moveTo(-w * 0.4, -h * 0.37); ctx.lineTo(-w * 0.24 + reach, -h * 0.31);
  ctx.lineTo(-w * 0.12 + reach, -h * 0.38); ctx.stroke();
  if (state.primaryClock > profile.primary.interval * 0.7) {
    ctx.fillStyle = profile.id === 'vulcain' ? '#ffc875' : '#abedf0'; ctx.fillRect(w * 0.52, -h * 0.64, w * 0.1, h * 0.055);
  }
  if (state.hitClock > 0 || state.corrosion > 0 || state.overheated) {
    ctx.fillStyle = state.overheated ? '#e99851' : state.corrosion > 0 ? '#a6b842' : '#f4e5be';
    ctx.fillRect(-w * 0.26, -h * 0.75, w * 0.09, 4);
  }
  ctx.restore();
}
