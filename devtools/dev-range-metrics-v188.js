// Developer tools (spec 012; shipped hidden, see scripts/build-dev-tools-v188.mjs): pure measurement and tuning math of the
// shooting range. Times are engine seconds (animationTime, scaled by the dev time scale,
// so slow motion does not distort a rate); distances use the project scale 1 m = 51 px.
export const RANGE_METRE_PX_V188 = 51;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const round = (value, digits = 2) => finite(value) ? Math.round(value * 10 ** digits) / 10 ** digits : null;
const median = values => { const list = values.filter(finite).sort((a, b) => a - b); if (!list.length) return null;
  const mid = Math.floor(list.length / 2); return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2; };

/** Observed rate: shots per second from the median interval of the last `sample` accepted shots.
 * Intervals longer than `breakAfter` seconds (trigger released, reload) are not part of a burst. */
export function observedFireRateV188(shotTimes, { sample = 30, breakAfter = 1 } = {}) {
  const times = shotTimes.filter(finite).slice(-sample);
  const intervals = times.slice(1).map((time, index) => time - times[index]).filter(gap => gap > 0 && gap <= breakAfter);
  const gap = median(intervals);
  return { shots: times.length, intervals: intervals.length, rate: gap ? round(1 / gap) : null, interval: round(gap, 4) };
}

/** Damage per second over the sliding window ending at `now` (accepted damage only). */
export function windowDpsV188(damageEvents, { now, window = 3 } = {}) {
  if (!finite(now) || !(window > 0)) return { dps: null, damage: 0, hits: 0 };
  const inWindow = damageEvents.filter(event => finite(event.t) && finite(event.applied) && event.t > now - window && event.t <= now);
  const damage = inWindow.reduce((sum, event) => sum + event.applied, 0);
  return { dps: round(damage / window), damage: round(damage), hits: inWindow.length };
}

/** Catalogue figures of a weapon: burst DPS and sustained DPS including reloads. */
export function theoreticalDpsV188(weapon = {}) {
  const damage = Number(weapon.damage), rate = Number(weapon.fireRate), magazine = Number(weapon.magazine), reload = Number(weapon.reload);
  if (!(damage > 0 && rate > 0)) return { burst: null, sustained: null };
  const burst = damage * rate;
  const sustained = magazine > 0 && reload >= 0 ? damage * magazine / (magazine / rate + reload) : burst;
  return { burst: round(burst), sustained: round(sustained) };
}

/** Expected time-to-kill of a target with `health` (first shot at t = 0). */
export function theoreticalTtkV188(weapon = {}, health = 0) {
  const damage = Number(weapon.damage), rate = Number(weapon.fireRate), magazine = Math.max(1, Math.round(Number(weapon.magazine) || 1)), reload = Number(weapon.reload) || 0;
  if (!(damage > 0 && rate > 0 && health > 0)) return { shots: null, seconds: null, reloads: null };
  const shots = Math.ceil(health / damage), reloads = Math.floor((shots - 1) / magazine);
  return { shots, reloads, seconds: round((shots - 1) / rate + reloads * reload) };
}

/** Observed time-to-kill per caste from target records { caste, firstHit, death }. */
export function ttkByCasteV188(records = []) {
  const groups = {};
  for (const record of records) {
    if (!finite(record.firstHit) || !finite(record.death) || record.death < record.firstHit) continue;
    (groups[record.caste || 'unknown'] ||= []).push(record.death - record.firstHit);
  }
  return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([caste, list]) => [caste, {
    kills: list.length, mean: round(list.reduce((a, b) => a + b, 0) / list.length), min: round(Math.min(...list)), max: round(Math.max(...list)), median: round(median(list)) }]));
}

/** Spread / recoil trace: angles (radians) of the shots relative to the aim, in degrees. */
export function spreadStatsV188(samples = []) {
  const angles = samples.map(sample => sample.angle - (finite(sample.aim) ? sample.aim : 0)).filter(finite)
    .map(angle => Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI);
  if (!angles.length) return { shots: 0, meanDeg: null, stdDeg: null, maxDeg: null, climbDeg: null };
  const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
  const std = Math.sqrt(angles.reduce((sum, angle) => sum + (angle - mean) ** 2, 0) / angles.length);
  // Climb: average drift between consecutive shots (recoil pattern direction).
  const climb = angles.length > 1 ? (angles.at(-1) - angles[0]) / (angles.length - 1) : 0;
  return { shots: angles.length, meanDeg: round(mean), stdDeg: round(std), maxDeg: round(Math.max(...angles.map(Math.abs))), climbDeg: round(climb, 3) };
}

/** Reload durations (seconds) from start/end pairs. */
export function reloadStatsV188(reloads = []) {
  const durations = reloads.filter(entry => finite(entry.start) && finite(entry.end) && entry.end >= entry.start).map(entry => entry.end - entry.start);
  if (!durations.length) return { count: 0, mean: null, last: null };
  return { count: durations.length, mean: round(durations.reduce((a, b) => a + b, 0) / durations.length), last: round(durations.at(-1)) };
}

export const rangeDistancePxV188 = metres => Math.round(Math.max(0, Number(metres) || 0) * RANGE_METRE_PX_V188);
export const rangeDistanceMetresV188 = pixels => round(Math.abs(Number(pixels) || 0) / RANGE_METRE_PX_V188, 1);

// —— Tuning (in memory; the export is a review diff, never written to the sources) ——
/** Bounds of the runtime builders (game-runtime.js buildWeaponRuntime / buildEnemyRuntime). */
export const TUNABLE_FIELDS_V188 = Object.freeze({
  weapon: Object.freeze({ damage: [1, 500], fireRate: [0.2, 30], magazine: [1, 200], reload: [0.15, 10], penetration: [0, 100] }),
  equipment: Object.freeze({ charges: [0, 99], mass: [0, 100] }),
  enemy: Object.freeze({ health: [1, 5000], damage: [1, 200], speed: [0.1, 10], armor: [0, 100], acid: [0, 100] })
});
export function applyTuningV188(kind, entry, overrides = {}) {
  const fields = TUNABLE_FIELDS_V188[kind]; if (!fields || !entry) return entry;
  const tuned = { ...entry };
  for (const [field, [min, max]] of Object.entries(fields)) {
    if (!Object.hasOwn(overrides, field)) continue;
    const value = Number(overrides[field]);
    if (!finite(value)) continue;
    tuned[field] = Math.max(min, Math.min(max, field === 'magazine' ? Math.round(value) : value));
  }
  return tuned;
}
/** { schema, kind: { id: { field: { from, to } } } } for every override that changes a catalogue value. */
export function tuningDiffV188(catalogs, overrides, { note = '' } = {}) {
  const diff = { schema: 188, tool: 'tantalus-dev-range', note: String(note).slice(0, 500), changes: {} };
  for (const [kind, byId] of Object.entries(overrides || {})) {
    const fields = TUNABLE_FIELDS_V188[kind]; if (!fields) continue;
    for (const [id, values] of Object.entries(byId || {})) {
      const base = (catalogs[kind] || []).find(entry => entry.id === id); if (!base) continue;
      const tuned = applyTuningV188(kind, base, values);
      for (const field of Object.keys(fields)) if (tuned[field] !== base[field] && Object.hasOwn(values, field)) {
        ((diff.changes[kind] ||= {})[id] ||= {})[field] = { from: base[field] ?? null, to: tuned[field] };
      }
    }
  }
  diff.count = Object.values(diff.changes).reduce((n, byId) => n + Object.values(byId).reduce((m, fields) => m + Object.keys(fields).length, 0), 0);
  return diff;
}
