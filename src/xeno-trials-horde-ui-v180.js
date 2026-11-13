import { getXenoTrialsHordeProtocolV180 } from './xeno-trials-horde-v180.js';
import { getXenoTrialsHordeBossViewV186 } from './xeno-trials-horde-bosses-v186.js';

/** Read-only terminal views. Counters come from the horde snapshot, never from
 * DOM state, a second clock, or the old successive-duel event checkpoint. */
const count = value => Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
export const isXenoTrialsHordeActivityV180 = activity => activity?.branch === 'horde' || activity?.hordeV180 === true;

export function getXenoTrialsHordeBriefingV180(activity) {
  if (!isXenoTrialsHordeActivityV180(activity)) return null;
  const waves = count(activity.waveCount), total = count(activity.totalEnemies);
  const minimum = count(activity.enemyHpMin), maximum = count(activity.enemyHpMax);
  const simultaneous = count(activity.maxConcurrent);
  return Object.freeze({ waves, total, minimum, maximum, simultaneous,
    waveLabel: waves ? `${waves} VAGUES` : 'VAGUES MULTIPLES',
    populationLabel: total ? `${total} CONTACTS` : 'RENFORTS MULTIPLES',
    healthLabel: minimum && maximum ? `${minimum}–${maximum} PV` : 'FAIBLE RÉSISTANCE',
    pressureLabel: simultaneous ? `${simultaneous} CONTACTS SIMULTANÉS MAX.` : 'ATTAQUES SIMULTANÉES',
    orders: 'Éliminez tous les contacts de chaque vague. Les renforts entrent pendant le combat ; gardez une voie de repli et surveillez vos deux flancs.' });
}

export function getXenoTrialsHordeViewV180(snapshot) {
  const state = snapshot?.hordeV180;
  if (!state || typeof state !== 'object') return null;
  const waveCount = Math.max(1, count(state.waveCount));
  const wave = Math.min(waveCount, Math.max(1, count(state.wave)));
  const alive = count(state.alive), remaining = count(state.remaining);
  const kills = count(state.totalKills), total = Math.max(kills, count(state.totalEnemies));
  const boss = getXenoTrialsHordeBossViewV186(getXenoTrialsHordeProtocolV180(state.protocolId), state, snapshot.fighters);
  const bossPhase = boss ? { pending: 'FINALE · CONTACT MAJEUR', incoming: 'CONTACT MAJEUR EN APPROCHE',
    active: 'CONTACT MAJEUR ACTIF', defeated: 'CONTACT MAJEUR NEUTRALISÉ' }[boss.phase] : '';
  const phase = snapshot.paused ? 'PAUSE' : snapshot.phase === 'match-over'
    ? snapshot.result?.winner === 'player' ? 'SECTEUR SÉCURISÉ' : 'CONTACT PERDU'
      : state.phase === 'intermission' ? 'VAGUE NEUTRALISÉE · RENFORTS EN APPROCHE'
        : state.phase === 'complete' ? 'SECTEUR SÉCURISÉ' : alive > 0 ? 'CONTACTS HOSTILES' : 'RENFORTS EN APPROCHE';
  return Object.freeze({ wave, waveCount, alive, remaining, kills, total, boss, bossPhase,
    totalRemaining: count(state.totalRemaining), concurrent: count(state.concurrent),
    maxConcurrent: count(state.maxConcurrent), phase,
    waveLabel: `VAGUE ${wave} / ${waveCount}`,
    // Live-region ownership stays at phase/wave granularity. Rapid kills and
    // arrivals update ordinary text, without flooding a screen reader.
    announcement: `${phase}. Vague ${wave} sur ${waveCount}.${bossPhase ? ` ${bossPhase}.` : ''}`,
    status: `${phase} · Vague ${wave}/${waveCount} · ${alive} contacts actifs · ${remaining} renforts · ${kills}/${total} neutralisés` });
}
