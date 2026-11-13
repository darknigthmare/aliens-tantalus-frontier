// Native admitted identities, not new species or film-exact balance. This module
// deliberately does not import the roster: horde/modes/data form an ES cycle.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const XENO_TRIALS_HORDE_BOSS_COHORTS_V186 = freeze({
  incoming: ['crusher-acm', 'ravager', 'royal-guard', 'armored-ripper-queen', 'queen'],
  quarantine: ['synth-enforcer', 'synth-containment', 'import-game-afe2-bulwark', 'royal-guard', 'queen'],
  extraction: ['import-game-afe2-harbinger', 'crusher-acm', 'ravager', 'royal-guard', 'queen'],
  pursuit: ['predalien', 'razor-claws', 'ravager', 'armored-ravager', 'royal-guard'],
  blackout: ['synth-heavy', 'synth-enforcer', 'import-game-afe-synth-warden', 'synth-containment', 'import-game-afe2-bulwark'],
  acid: ['import-game-afe2-warden', 'acid-ravager', 'acid-crusher', 'acid-ripper-queen', 'acid-queen'],
  'sudden-death': ['crusher-acm', 'predalien', 'ravager', 'royal-guard', 'queen'],
  royal: ['royal-guard', 'armored-ripper-queen', 'import-xeno-kingrogue', 'drive-v123-fte-pathogen-queen-right-v13', 'queen']
});

/** Append a genuine mixed-health finale without changing any historical ID,
 * wave, save ticket, troop health, anatomy, special attack or earned reward.
 * Individual slots make the boss and its escorts reproducible on restoration.
 */
export function createXenoTrialsBossProtocolsV186(historical) {
  return freeze(historical.map(protocol => {
    const fighterId = XENO_TRIALS_HORDE_BOSS_COHORTS_V186[protocol.eventFamily]?.[protocol.level - 1];
    if (!fighterId) throw new Error(`Missing authored boss cohort: ${protocol.id}`);
    const hp = [140, 180, 220, 270, 310][protocol.level - 1];
    const damageScale = [ .70, .75, .80, .85, .90 ][protocol.level - 1];
    const troopWave = protocol.waves.at(-1), escorts = 2 + Math.floor((protocol.level - 1) / 2);
    const enemySlotsV186 = [ { fighterId, rank: 'boss', hp, damageScale },
      ...Array.from({ length: escorts }, (_, index) => ({ fighterId: protocol.opponentIds[index % protocol.opponentIds.length],
        rank: 'troop', hp: troopWave.hp, damageScale: troopWave.damageScale })) ];
    const bossFinaleV186 = { fighterId, hp, damageScale, wave: protocol.waves.length + 1, label: 'CONTACT MAJEUR' };
    const finale = { index: protocol.waves.length, label: 'FINALE · CONTACT MAJEUR',
      opponentIds: [...new Set(enemySlotsV186.map(slot => slot.fighterId))],
      total: enemySlotsV186.length, concurrent: enemySlotsV186.length,
      // Legacy hp remains the escort health. Boss hp is explicitly separate.
      hp: troopWave.hp, damageScale: troopWave.damageScale, enemySlotsV186 };
    return { ...protocol, id: protocol.id.replace('xth180-', 'xth186-'), sourceProtocolIdV180: protocol.id,
      title: `${protocol.title} · FINALE`, label: `${protocol.label} · FINALE`,
      description: `${protocol.waves.length} vagues de troupes à 15–35 PV, puis un contact majeur à ${hp} PV et ${escorts} gardes. Le gabarit et les attaques de chaque spécimen sont conservés. Aucune récupération entre les vagues.`,
      opponentIds: [...new Set([...protocol.opponentIds, fighterId])],
      roundSeconds: protocol.roundSeconds + 120, waves: [...protocol.waves, finale], bossFinaleV186,
      // At hard level five: 850 + 220 + 130 native win credits = 1,200,
      // within the existing persisted ledger receipt limit.
      totalEnemies: protocol.totalEnemies + finale.total, reward: protocol.reward + 220, protocolRevision: 186 };
  }));
}

/** Return the canonical spawn contract for a finite slot in a wave. */
export function getXenoTrialsHordeSlotV186(wave, slotIndex) {
  return Number.isInteger(slotIndex) && slotIndex >= 0 ? wave?.enemySlotsV186?.[slotIndex] || null : null;
}

/** Read-only data for the HUD and final receipt. Defeat follows the actual
 * absence of the spawned slot-zero boss; no separate kill flag is trusted.
 */
export function getXenoTrialsHordeBossViewV186(protocol, state, fighters = []) {
  const boss = protocol?.bossFinaleV186;
  if (!boss || !state) return null;
  const actor = fighters.find(fighter => fighter.enemyRankV186 === 'boss' && fighter.bossIdV186 === boss.fighterId && fighter.hp > 0);
  const reached = state.wave >= boss.wave;
  const defeated = reached && state.waveSpawned > 0 && !actor;
  return Object.freeze({ fighterId: boss.fighterId, maxHp: boss.hp, wave: boss.wave,
    phase: actor ? 'active' : defeated ? 'defeated' : reached || state.wave === boss.wave - 1 && state.phase === 'intermission' ? 'incoming' : 'pending',
    hp: actor?.hp ?? (defeated ? 0 : boss.hp), instanceId: actor?.instanceIdV180 || null, defeated });
}
