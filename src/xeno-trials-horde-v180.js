import { XENO_TRIALS_EVENTS_V179 } from './xeno-trials-events-v179.js';
import { XENO_TRIALS_BOSS_STAGES_V179 } from './xeno-trials-boss-stages-v179.js';
import { createXenoTrialsBossProtocolsV186, getXenoTrialsHordeSlotV186 } from './xeno-trials-horde-bosses-v186.js';
import { getArbiterHordeProtocolV191 } from './xeno-arbiter-protocols-v191.js';

/** Original simulation tuning, not canonical biology or animation evidence.
 * The director shares the native fighter, attacks and CPU with ordinary duels.
 * Only eight enemies can be alive; their native geometry is unchanged. */
export const XENO_TRIALS_HORDE_LIMITS_V180 = Object.freeze({ maxConcurrent: 8, minConcurrent: 3,
  minimumHp: 15, maximumHp: 35, maxProjectiles: 64, maxEffects: 32, spawnGraceTicks: 60,
  reinforcementTicks: 72, intermissionTicks: 120, playerContactCooldownTicks: 24 });

const pools = Object.freeze({
  incoming: ['runner', 'warrior', 'prowler', 'arachnoid'],
  quarantine: ['warrior', 'armored-runner', 'synth-guard', 'defender'],
  extraction: ['runner', 'prowler', 'spitter', 'warrior'],
  pursuit: ['runner', 'panther', 'grid', 'stalker-arcade'],
  blackout: ['synth-trooper', 'synth-sniper', 'synth-guard', 'combat-synth'],
  acid: ['spitter', 'acid-runner', 'acid-lurker', 'boiler'],
  'sudden-death': ['arachnoid', 'runner', 'warrior', 'prowler'],
  royal: ['warrior', 'armored-runner', 'armored-red', 'armored-k-series']
});
const labels = Object.freeze({ incoming: 'HORDE EN APPROCHE', quarantine: 'RUPTURE DE QUARANTAINE',
  extraction: 'COULOIR D’EXTRACTION', pursuit: 'MEUTE EN CHASSE', blackout: 'ESSAIM SYNTHÉTIQUE',
  acid: 'SATURATION CORROSIVE', 'sudden-death': 'CONTACTS FRAGILES', royal: 'CORDON DE LA RUCHE' });
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const XENO_TRIALS_HORDE_PROTOCOLS_V180 = freeze(XENO_TRIALS_EVENTS_V179.map((source, protocolIndex) => {
  const level = Number(source.id.split('-').at(-1)), family = source.eventFamily;
  const opponents = pools[family];
  const waves = Array.from({ length: level + 1 }, (_, index) => ({
    index, label: `PRESSION ${index + 1}`, opponentIds: [...opponents.slice(index % 2), ...opponents.slice(0, index % 2)],
    total: 4 + level + index * 2, concurrent: Math.min(8, 2 + level + index), hp: Math.min(35, 12 + level * 3 + index * 2),
    damageScale: .28 + level * .025
  }));
  const totalEnemies = waves.reduce((total, wave) => total + wave.total, 0);
  return { id: source.id.replace('xte179-', 'xth180-'), sourceEventId: source.id,
    title: `${labels[family]} · ${String(level).padStart(2, '0')}`, label: `${labels[family]} · ${String(level).padStart(2, '0')}`,
    description: `${waves.length} vagues de contacts simultanés. De 3 à 8 adversaires actifs, avec 15 à 35 PV par contact. Neutraliser toutes les vagues avec le même spécimen ; aucune récupération automatique entre les vagues.`,
    eventFamily: family, level, stageId: XENO_TRIALS_BOSS_STAGES_V179[protocolIndex].id,
    difficulty: level === 1 ? 'easy' : level >= 4 ? 'hard' : 'normal', factionId: family === 'blackout' ? 'rival-lab' : 'hive',
    opponentIds: [...opponents], rules: {}, roundSeconds: 180 + level * 60, waves,
    totalEnemies, reward: 350 + level * 100, canonExact: false, canonStatus: 'original-tantalus-simulation' };
}));

export const XENO_TRIALS_HORDE_BOSS_PROTOCOLS_V186 = createXenoTrialsBossProtocolsV186(XENO_TRIALS_HORDE_PROTOCOLS_V180);
export const XENO_TRIALS_HORDE_PROTOCOLS_V186 = Object.freeze([
  ...XENO_TRIALS_HORDE_PROTOCOLS_V180, ...XENO_TRIALS_HORDE_BOSS_PROTOCOLS_V186
]);

export function getXenoTrialsHordeProtocolV180(id) {
  return XENO_TRIALS_HORDE_PROTOCOLS_V186.find(protocol => protocol.id === id) || getArbiterHordeProtocolV191(id);
}

export function createXenoTrialsHordeStateV180(id) {
  const protocol = getXenoTrialsHordeProtocolV180(id);
  if (!protocol) return null;
  return { schema: 180, protocolId: protocol.id, wave: 1, waveCount: protocol.waves.length,
    phase: 'active', waveSpawned: 0, waveKills: 0, wavesCleared: 0, totalKills: 0,
    totalEnemies: protocol.totalEnemies, totalRemaining: protocol.totalEnemies,
    alive: 0, remaining: protocol.waves[0].total, concurrent: protocol.waves[0].concurrent,
    maxConcurrent: XENO_TRIALS_HORDE_LIMITS_V180.maxConcurrent, serial: 0, nextSpawnTick: 0,
    nextWaveTick: 0, opponentStats: { hits: 0, damage: 0, blocks: 0, specials: 0 },
    ...(protocol.bossFinaleV186 ? { bossFinaleV186: { ...protocol.bossFinaleV186 } } : {}) };
}

/** Called once per fixed simulation tick and once at construction. The engine
 * supplies native fighters and owns damage, collision, time and final verdict. */
export function advanceXenoTrialsHordeDirectorV180(match, spawn, notify = () => {}) {
  const state = match.hordeV180, protocol = getXenoTrialsHordeProtocolV180(state?.protocolId);
  if (!protocol || state.phase === 'complete') return false;
  const living = [];
  for (const fighter of match.fighters.slice(1)) {
    if (fighter.hp > 0) living.push(fighter);
    else {
      state.totalKills++; state.waveKills++;
      for (const [key, value] of Object.entries(fighter.stats)) state.opponentStats[key] = (state.opponentStats[key] || 0) + value;
    }
  }
  match.fighters = [match.fighters[0], ...living];
  // A projectile cannot outlive its defeated owner and lose its source record.
  const owners = new Set(living.map(fighter => fighter.instanceIdV180));
  match.projectiles = match.projectiles.filter(projectile => projectile.owner === 'player' || owners.has(projectile.ownerInstanceV180));
  if (state.phase === 'intermission') {
    if (match.tick < state.nextWaveTick) { state.alive = 0; state.remaining = 0; return false; }
    state.wave++; state.waveSpawned = 0; state.waveKills = 0; state.phase = 'active'; state.nextSpawnTick = match.tick;
  }
  const wave = protocol.waves[state.wave - 1];
  const initial = state.waveSpawned === 0;
  if (initial || match.tick >= state.nextSpawnTick) {
    const count = Math.min(wave.concurrent - living.length, wave.total - state.waveSpawned, initial ? wave.concurrent : 1);
    for (let index = 0; index < count; index++) {
      const serial = ++state.serial, slotIndex = state.waveSpawned, slot = getXenoTrialsHordeSlotV186(wave, slotIndex);
      const id = slot?.fighterId || wave.opponentIds[(state.waveSpawned + state.wave - 1) % wave.opponentIds.length];
      const fighter = spawn(id, wave, serial, slotIndex);
      match.fighters.push(fighter); state.waveSpawned++;
    }
    if (count > 0) state.nextSpawnTick = match.tick + XENO_TRIALS_HORDE_LIMITS_V180.reinforcementTicks;
  }
  state.concurrent = wave.concurrent; state.alive = match.fighters.length - 1;
  state.remaining = Math.max(0, wave.total - state.waveSpawned);
  state.totalRemaining = Math.max(0, state.totalEnemies - state.totalKills);
  if (state.remaining === 0 && state.alive === 0) {
    state.wavesCleared++;
    if (state.wave >= state.waveCount) { state.phase = 'complete'; return true; }
    state.phase = 'intermission'; state.nextWaveTick = match.tick + XENO_TRIALS_HORDE_LIMITS_V180.intermissionTicks;
    if (protocol.bossFinaleV186?.wave === state.wave + 1)
      notify('horde-boss-incoming-v186', { ...protocol.bossFinaleV186, arrivalTick: state.nextWaveTick });
  }
  return false;
}
