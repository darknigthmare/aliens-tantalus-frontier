import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS } from './xeno-trials-data-v96.js';

// Authored simulation curriculum: these incidents belong to Tantalus, not film canon.
export const XENO_TRIALS_BRANCHES_V119 = Object.freeze([
  { id: 'campaign', label: 'CAMPAGNE', description: 'Certification, confinement, poursuite, adaptation, ruche et apex.' },
  { id: 'contracts', label: 'CONTRATS', description: 'Cibles et conditions connues avant le choix du spécimen.' },
  { id: 'on-demand', label: 'CONTRATS À LA DEMANDE', description: 'Demandez une famille, un adversaire et vos règles.' },
  { id: 'challenges', label: 'DÉFIS', description: 'Épreuves fixes, contraintes physiques et séries de combats.' }
]);
const known = new Set(FIGHTERS.map(f => f.id));
const stages = ['containment-deck', 'reactor-ring', 'planet-surface', 'tantalus-cargo', 'hive-vault', 'tantalus-bridge'];
const acts = [
  ['certification', 'I · CERTIFICATION', 'MIRE / Accréditation initiale', 'Le terminal mesure les réponses du spécimen, puis ouvre les cellules de recherche.', ['runner', 'warrior', 'arachnoid'], ['Mobilité et contact', 'Fenêtre de contre-attaque', 'Validation tactique']],
  ['containment', 'II · CONFINEMENT', 'Contrôle des cages / Dr. Vale', 'Une dérive des verrous est reconstruite dans le simulateur. Préserver les protocoles sans exposer l’équipage.', ['defender', 'chrysalis', 'smasher'], ['Gardien de cellule', 'Résistance de confinement', 'Fermeture des sas']],
  ['pursuit', 'III · POURSUITE', 'MIRE / Cartographie cinétique', 'Les pistes de chasse sont comprimées en duels. L’analyse récompense les interceptions et la discipline.', ['prowler', 'grid', 'stalker-arcade'], ['Interception', 'Piste brisée', 'Dernier couloir']],
  ['adaptation', 'IV · ADAPTATION', 'Xenobiologie / Données historiques', 'Des lignées atypiques et machines sont reconstruites. Aucun contact historique entre ces individus n’est affirmé.', ['predalien', 'synth-trooper', 'synth-containment'], ['Lignée hybride', 'Doctrine de tir', 'Isolement chimique']],
  ['hive', 'V · RUCHE', 'MIRE / Réponse collective', 'Les castes d’une ruche simulée défendent une réserve. Chaque validation enrichit les dossiers de menace.', ['burster', 'crusher-acm', 'ravager'], ['Rupture des sentinelles', 'Front de charge', 'Noyau de défense']],
  ['apex', 'VI · APEX', 'Direction du programme / Accès restreint', 'Les données royales exigent l’accréditation précédente. Les organismes restent des reconstructions d’évaluation.', ['royal-guard', 'ultramorph', 'armored-ripper-queen'], ['Garde royale', 'Gabarit extrême', 'Épreuve du trône']]
];
const mission = (act, actIndex, opponentId, index) => Object.freeze({
  id: `xt119-${act[0]}-${index + 1}`, actId: act[0], act: act[1], title: act[5][index], supervisor: act[2], briefing: act[3],
  event: index === 2 ? 'Le niveau d’accréditation suivant devient accessible après validation.' : 'MIRE transmet les mesures du duel au dossier de l’adversaire.',
  opponentId, factionId: ['containment', 'containment', 'pursuit', 'rival-lab', 'hive', 'hive'][actIndex],
  stageId: stages[actIndex], difficulty: actIndex < 2 ? 'easy' : actIndex >= 5 ? 'hard' : 'normal',
  rules: Object.freeze(index === 0 && actIndex === 0 ? { noSpecial: true } : {}),
  secondary: Object.freeze(index === 0 ? { kind: 'no-special', label: 'Ne pas utiliser de spécial' } : index === 1 ? { kind: 'blocks', value: 2, label: 'Bloquer au moins deux attaques' } : { kind: 'duration', value: 120, label: 'Terminer en moins de 120 secondes de combat' }),
  reward: 100 + actIndex * 40, dossierId: opponentId, unlockId: opponentId, canonStatus: 'original-tantalus-simulation'
});
export const XENO_TRIALS_CAMPAIGN_V119 = Object.freeze([
  ...acts.flatMap((act, i) => act[4].map((opponentId, n) => mission(act, i, opponentId, n))),
  Object.freeze({ id: 'xt119-finale-1', actId: 'finale', act: 'FINALE · ACCRÉDITATION ROYALE', title: 'Souveraineté simulée', supervisor: 'MIRE / Direction Tantalus',
    briefing: 'La Reine mobile domine physiquement l’arène. La finale confirme une aptitude du programme, sans prétendre capturer un événement canonique.',
    event: 'Certification royale et dossier final accordés une seule fois.', opponentId: 'queen', factionId: 'hive', stageId: 'hive-vault', difficulty: 'hard',
    rules: Object.freeze({}), secondary: Object.freeze({ kind: 'no-special', label: 'Finale sans spécial' }), reward: 600, dossierId: 'queen', unlockId: 'queen', canonStatus: 'original-tantalus-simulation' })
]);
export const XENO_TRIALS_CHALLENGES_V119 = Object.freeze([
  { id: 'survive-queen', title: 'SURVIVRE À UNE REINE', opponentIds: ['queen'], rules: { goal: 'survive', timeLimitSeconds: 30 }, description: 'Rester en vie pendant 30 secondes, deux manches. La Reine conserve sa vraie stature.' },
  { id: 'runner-mirror', title: 'RUNNER VS RUNNER', opponentIds: ['runner'], forcedPlayerId: 'runner', rules: {}, description: 'Intercepter et punir un autre coureur.' },
  { id: 'hunter-pack', title: 'CHASSEUR CONTRE MEUTE', opponentIds: ['runner', 'prowler', 'grid'], rules: {}, description: 'Trois évaluations successives de chasseurs. Une défaite brise la série ; ce n’est pas un combat simultané.' },
  { id: 'synthetic-xeno', title: 'SYNTHÉTIQUE CONTRE XÉNOMORPHE', opponentIds: ['warrior'], requiredFamily: 'synthetic', rules: {}, description: 'Choisir un synthétique acquis pour éprouver sa doctrine contre un Warrior.' },
  { id: 'no-special', title: 'COMBAT SANS SPÉCIAL', opponentIds: ['defender'], rules: { noSpecial: true }, description: 'Les attaques spéciales des deux combattants sont réellement désactivées.' },
  { id: 'one-hp', title: '1 PV', opponentIds: ['arachnoid'], rules: { initialHp: 1 }, description: 'Les deux adversaires débutent chaque manche avec 1 PV.' },
  { id: 'thirty-seconds', title: 'CHRONO 30 SECONDES', opponentIds: ['warrior'], rules: { timeLimitSeconds: 30 }, description: 'Deux manches gagnantes, chacune limitée à 30 secondes.' },
  { id: 'boss-rush', title: 'BOSS RUSH', opponentIds: ['crusher-acm', 'royal-guard', 'queen'], rules: {}, description: 'Crusher, Royal Guard, Reine : trois duels réels consécutifs.' },
  { id: 'gauntlet', title: 'GANTELET', opponentIds: ['arachnoid', 'prowler', 'synth-enforcer', 'ravager', 'royal-guard'], rules: {}, description: 'Cinq duels successifs. Une défaite ou un abandon réinitialise la série.' }
].map(c => Object.freeze({ ...c, opponentIds: Object.freeze(c.opponentIds), rules: Object.freeze(c.rules), reward: 350 + (c.opponentIds.length - 1) * 100, canonStatus: 'original-tantalus-simulation' })));

const cleanInteger = (n, max = 1000000) => Number.isInteger(n) && n >= 0 ? Math.min(max, n) : 0;
export function createXenoTrialsModesProgressV119() {
  return { schema: 119, campaignCleared: [], challengesCleared: [], dossiers: [], contractCycle: 0, claimedContracts: [], challengeRun: null };
}
export function normalizeXenoTrialsModesProgressV119(value) {
  const base = createXenoTrialsModesProgressV119();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return base;
  const ids = key => Array.isArray(value[key]) ? [...new Set(value[key].filter(x => typeof x === 'string'))] : [];
  base.campaignCleared = ids('campaignCleared').filter(id => XENO_TRIALS_CAMPAIGN_V119.some(m => m.id === id));
  base.challengesCleared = ids('challengesCleared').filter(id => XENO_TRIALS_CHALLENGES_V119.some(c => c.id === id));
  base.dossiers = ids('dossiers').filter(id => known.has(id));
  base.contractCycle = cleanInteger(value.contractCycle);
  base.claimedContracts = ids('claimedContracts').filter(id => /^xtc119-\d+-[0-4]$/.test(id)).slice(-128);
  const run = value.challengeRun, challenge = XENO_TRIALS_CHALLENGES_V119.find(c => c.id === run?.id);
  if (challenge && Number.isInteger(run.bout) && run.bout >= 1 && run.bout < challenge.opponentIds.length && known.has(run.playerId))
    base.challengeRun = { id: challenge.id, bout: run.bout, playerId: run.playerId };
  return base;
}
export function isXenoTrialsMissionOpenV119(id, modes) {
  const index = XENO_TRIALS_CAMPAIGN_V119.findIndex(m => m.id === id);
  return index >= 0 && (index === 0 || normalizeXenoTrialsModesProgressV119(modes).campaignCleared.includes(XENO_TRIALS_CAMPAIGN_V119[index - 1].id));
}
function generator(seed) { let n = seed >>> 0; return () => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; }; }
export function getXenoTrialsContractsV119(cycle = 0) {
  const generation = cleanInteger(cycle), random = generator(119983 + generation * 7919);
  const pool = FIGHTERS.filter(f => !/reference|unclassified/.test(f.id));
  return Array.from({ length: 5 }, (_, index) => {
    const opponent = pool[Math.floor(random() * pool.length)], restriction = index % 3;
    const rules = restriction === 0 ? { specialLockSeconds: 20 } : restriction === 1 ? { noSpecial: true } : { timeLimitSeconds: 60 };
    return Object.freeze({ id: `xtc119-${generation}-${index}`, cycle: generation, title: `CONTRAT XT-${generation + 1}${String(index + 1).padStart(3, '0')}`,
      description: 'Évaluation comparative renouvelable. Cible assignée par le programme, récompense unique par contrat.',
      opponentId: opponent.id, factionId: opponent.family === 'synthetic' ? 'rival-lab' : opponent.role === 'agile' ? 'pursuit' : 'containment',
      stageId: stages[Math.floor(random() * stages.length)], difficulty: index >= 3 ? 'hard' : 'normal', rules: Object.freeze(rules),
      reward: 200 + index * 55, dossierId: opponent.id, canonStatus: 'original-tantalus-simulation' });
  });
}
export function normalizeXenoTrialsRulesV119(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) value = {};
  return { noSpecial: value.noSpecial === true, specialLockSeconds: value.specialLockSeconds === 20 ? 20 : 0,
    initialHp: value.initialHp === 1 ? 1 : null, goal: value.goal === 'survive' ? 'survive' : 'eliminate',
    timeLimitSeconds: [30, 60, 75, 99, 120].includes(value.timeLimitSeconds) ? value.timeLimitSeconds : null };
}
export function getXenoTrialsRuleTextV119(rules = {}) {
  const r = normalizeXenoTrialsRulesV119(rules), labels = [];
  if (r.noSpecial) labels.push('Aucun spécial');
  if (r.specialLockSeconds) labels.push('Spéciaux verrouillés pendant 20 s');
  if (r.initialHp === 1) labels.push('1 PV au départ');
  if (r.goal === 'survive') labels.push(`Survivre ${r.timeLimitSeconds || 30} s`);
  else if (r.timeLimitSeconds) labels.push(`${r.timeLimitSeconds} secondes par manche`);
  return labels.join(' · ') || 'Deux manches gagnantes · Règles standard';
}
/** Resolve authored objectives from IDs, never trust a persisted/caller reward. */
export function resolveXenoTrialsActivityV119(activity, modesValue) {
  const modes = normalizeXenoTrialsModesProgressV119(modesValue);
  if (!activity || activity.branch === 'on-demand') return { branch: 'on-demand', id: 'on-demand', title: 'CONTRAT À LA DEMANDE', rules: normalizeXenoTrialsRulesV119(activity?.rules) };
  if (activity.branch === 'campaign') {
    const entry = XENO_TRIALS_CAMPAIGN_V119.find(m => m.id === activity.id);
    return entry && isXenoTrialsMissionOpenV119(entry.id, modes) ? { ...entry, branch: 'campaign' } : null;
  }
  if (activity.branch === 'contracts') {
    const parsed = /^xtc119-(\d+)-[0-4]$/.exec(activity.id || '');
    if (!parsed) return null;
    const cycle = Number(parsed[1]);
    // Saved tickets may finish after a board renewal, but new tickets use its current cycle.
    if (cycle > modes.contractCycle || cycle < modes.contractCycle - 128) return null;
    const entry = getXenoTrialsContractsV119(cycle).find(c => c.id === activity.id);
    return entry && !modes.claimedContracts.includes(entry.id) ? { ...entry, branch: 'contracts' } : null;
  }
  if (activity.branch === 'challenges') {
    const entry = XENO_TRIALS_CHALLENGES_V119.find(c => c.id === activity.id);
    if (!entry) return null;
    const bout = modes.challengeRun?.id === entry.id ? modes.challengeRun.bout : 0;
    return { ...entry, branch: 'challenges', bout, opponentId: entry.opponentIds[bout],
      factionId: 'hive', stageId: bout % 2 ? 'planet-surface' : 'containment-deck', difficulty: 'normal' };
  }
  return null;
}
export function getXenoTrialsSecondaryCompleteV119(secondary, result) {
  if (!secondary || !result?.playerStats) return false;
  if (secondary.kind === 'no-special') return result.playerStats.specials === 0;
  if (secondary.kind === 'blocks') return result.playerStats.blocks >= secondary.value;
  if (secondary.kind === 'duration') return result.durationTicks / 120 <= secondary.value;
  return false;
}
/** Pure settlement extension, called only after the V96 result/ticket guard passed. */
export function settleXenoTrialsActivityV119(modesValue, config, result) {
  const modes = normalizeXenoTrialsModesProgressV119(modesValue), activity = resolveXenoTrialsActivityV119(config.activityV119, modes);
  const receipt = { bonus: 0, secondary: false, dossierId: null, unlockId: null, continuing: false };
  if (!activity || activity.branch === 'on-demand') return { modes, receipt };
  if (result.winner !== 'player') { if (activity.branch === 'challenges') modes.challengeRun = null; return { modes, receipt }; }
  receipt.secondary = getXenoTrialsSecondaryCompleteV119(activity.secondary, result);
  if (activity.branch === 'campaign' && !modes.campaignCleared.includes(activity.id)) {
    modes.campaignCleared.push(activity.id); receipt.bonus = activity.reward + (receipt.secondary ? 50 : 0); receipt.unlockId = activity.unlockId;
  } else if (activity.branch === 'contracts' && !modes.claimedContracts.includes(activity.id)) {
    modes.claimedContracts = [...modes.claimedContracts, activity.id].slice(-128); receipt.bonus = activity.reward;
  } else if (activity.branch === 'challenges') {
    if (activity.bout + 1 < activity.opponentIds.length) {
      modes.challengeRun = { id: activity.id, bout: activity.bout + 1, playerId: config.playerId }; receipt.continuing = true;
    } else {
      modes.challengeRun = null;
      if (!modes.challengesCleared.includes(activity.id)) { modes.challengesCleared.push(activity.id); receipt.bonus = activity.reward; }
    }
  }
  receipt.dossierId = activity.dossierId || activity.opponentId;
  if (!modes.dossiers.includes(receipt.dossierId)) modes.dossiers.push(receipt.dossierId);
  return { modes, receipt };
}
