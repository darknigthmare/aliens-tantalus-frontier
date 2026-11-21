import { normalizeArbiterCampaignProgressV190 } from './xeno-arbiter-campaign-v190.js';
import { getXenoTrialsCorporateStageV190 } from './xeno-trials-stage-scenes-v190.js';

// Leaf content module: no import from the combat engine, horde director,
// operation controller, roster or modes registry. Those owners admit these
// authored records without changing their eighty/forty historical records.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const venues = freeze([
  { slug: 'vault', stageId: 'xt190-adjudication-vault', label: 'CHAMBRE D’ARBITRAGE', family: 'incoming', factionId: 'hive',
    pool: ['warrior', 'runner', 'prowler', 'burster'], bossId: 'chrysalis', bossHp: 260,
    record: 'Les archives de la chambre reconstituent la pression des séances privées. Les mises et concessions restent des pièces du dossier, jamais des enjeux de cette copie.' },
  { slug: 'transfer', stageId: 'xt190-specimen-transfer', label: 'TRANSIT DES SPÉCIMENS', family: 'quarantine', factionId: 'containment',
    pool: ['runner', 'armored-runner', 'warrior', 'prowler'], bossId: 'user-brute', bossHp: 220,
    record: 'Les séquences de convoyage montrent les ruptures de confinement dissimulées dans les registres de fret. Le rail et les contacts sont reconstruits sur le banc isolé.' },
  { slug: 'gallery', stageId: 'xt190-executive-gallery', label: 'GALERIE DES MANDATAIRES', family: 'blackout', factionId: 'rival-lab',
    pool: ['synth-trooper', 'synth-guard', 'combat-synth', 'synth-sniper'], bossId: 'smasher', bossHp: 200,
    record: 'La galerie conserve les relevés de sécurité des invités, dont une séance privée mêlant agents synthétiques et finale Smasher. Ces affrontements sont relus comme un exercice, sans exécuter leurs anciennes sanctions.' },
  { slug: 'archive', stageId: 'xt190-evidence-stack', label: 'ARCHIVES SOUS SCELLÉS', family: 'acid', factionId: 'hive',
    pool: ['spitter', 'acid-runner', 'acid-lurker', 'boiler'], bossId: 'defender', bossHp: 180,
    record: 'La copie des serveurs garde les relevés biologiques et les accès révoqués. Les contacts éprouvent la récupération des preuves, sans ouvrir le réseau compagnie.' }
]);
export const ARBITER_ARCHIVE_VENUES_V191 = venues;
const kinds = ['escort', 'relay', 'purge', 'beacon', 'extraction'];
const names = { escort: 'CONVOI SOUS SCELLÉS', relay: 'RELAIS HORS RÉSEAU', purge: 'PURGE DE CONFINEMENT',
  beacon: 'BALISES DE CONTRÔLE', extraction: 'RETOUR DES CAISSONS' };
const instructions = {
  escort: 'Maintenez E près du chariot et accompagnez-le jusqu’au sas. Sa progression s’arrête dès que vous vous éloignez. Les ennemis proches endommagent le chariot.',
  relay: 'Ralliez les trois relais dans l’ordre indiqué et maintenez E pour les charger. Quitter une charge inachevée la fait redescendre.',
  purge: 'Maintenez E près des conduits pour les purger et les sceller. Les foyers inachevés se régénèrent ; chaque foyer ouvert affaiblit le confinement.',
  beacon: 'Maintenez E près d’une balise pendant sa fenêtre verte. Une charge inachevée retombe hors de cette fenêtre. Synchronisez les trois balises.',
  extraction: 'Maintenez E près d’un caisson, rapportez-le au dépôt et maintenez E pour le livrer. Transportez un seul caisson à la fois, puis rejoignez le sas.'
};

export const ARBITER_HORDE_PROTOCOLS_V191 = freeze(venues.flatMap((venue, venueIndex) => Array.from({ length: 5 }, (_, index) => {
  const level = index + 1, waveCount = level === 1 ? 2 : level <= 3 ? 3 : 4;
  const waves = Array.from({ length: waveCount }, (_, wave) => ({
    index: wave, label: `PRESSION ${wave + 1}`,
    opponentIds: [...venue.pool.slice(wave % venue.pool.length), ...venue.pool.slice(0, wave % venue.pool.length)],
    total: 4 + level + wave * 2, concurrent: Math.min(8, 2 + level + wave),
    hp: Math.min(35, 12 + level * 3 + wave * 2), damageScale: .24 + level * .025
  }));
  let bossFinaleV186;
  if (level === 5) {
    const troops = waves.at(-1), hp = venue.bossHp, damageScale = .72 + venueIndex * .03;
    const enemySlotsV186 = [{ fighterId: venue.bossId, rank: 'boss', hp, damageScale },
      ...venue.pool.slice(0, 2).map(fighterId => ({ fighterId, rank: 'troop', hp: troops.hp, damageScale: troops.damageScale }))];
    bossFinaleV186 = { fighterId: venue.bossId, hp, damageScale, wave: waves.length + 1, label: 'CONTACT MAJEUR' };
    waves.push({ index: waves.length, label: 'FINALE · CONTACT MAJEUR', opponentIds: enemySlotsV186.map(slot => slot.fighterId),
      total: enemySlotsV186.length, concurrent: enemySlotsV186.length, hp: troops.hp,
      damageScale: troops.damageScale, enemySlotsV186 });
  }
  const totalEnemies = waves.reduce((sum, wave) => sum + wave.total, 0);
  return { id: `xth191-arbiter-${venue.slug}-${level}`, title: `${venue.label} · PRESSION ${String(level).padStart(2, '0')}`,
    label: `${venue.label} · PRESSION ${String(level).padStart(2, '0')}`, act: 'ARCHIVES ARBITER',
    description: `${venue.record} ${waveCount} vagues de troupes à 15–35 PV.${bossFinaleV186 ? ` Finale : un contact majeur à ${bossFinaleV186.hp} PV et deux gardes.` : ''} Aucun soin automatique entre les vagues.`,
    eventFamily: venue.family, level, stageId: venue.stageId,
    difficulty: level === 1 ? 'easy' : level >= 4 ? 'hard' : 'normal', factionId: venue.factionId,
    opponentIds: [...venue.pool, ...(bossFinaleV186 && !venue.pool.includes(venue.bossId) ? [venue.bossId] : [])],
    rules: {}, roundSeconds: 180 + level * 45 + (bossFinaleV186 ? 90 : 0), waves, totalEnemies,
    reward: 320 + level * 60 + (bossFinaleV186 ? 100 : 0), ...(bossFinaleV186 ? { bossFinaleV186 } : {}),
    branch: 'horde', archiveV191: true, archiveKindV191: 'horde', archiveVenueV191: venue.slug, protocolRevision: 191,
    canonExact: false, canonStatus: 'original-tantalus-arbiter-replay' };
})));
const hordes = new Map(ARBITER_HORDE_PROTOCOLS_V191.map(entry => [entry.id, entry]));

export const ARBITER_OPERATIONS_V191 = freeze(venues.flatMap((venue, venueIndex) => kinds.map((kind, typeIndex) => {
  const reverse = venueIndex % 2 === 1, offset = (venueIndex - 1.5) * 16;
  let positions = [190 + offset, 680, 1180 - offset];
  if (reverse) positions = positions.reverse();
  if (kind === 'purge' || kind === 'beacon') positions = [positions[1], positions[0], positions[2]];
  const requiredTicks = kind === 'escort' ? 900 + venueIndex * 90 : kind === 'relay' ? 168 + venueIndex * 12
    : kind === 'purge' ? 192 + venueIndex * 12 : kind === 'beacon' ? 96 + venueIndex * 6 : 36 + venueIndex * 3;
  const objectives = kind === 'escort'
    ? [{ id: 'cargo-route', kind: 'cargo', label: 'Chariot de confinement', x: reverse ? 250 : 1250, y: 0, radius: 155, requiredTicks }]
    : positions.map((x, index) => ({ id: `${kind}-${index + 1}`,
      kind: kind === 'relay' ? 'terminal' : kind === 'purge' ? 'vent' : kind === 'beacon' ? 'beacon' : 'supply',
      label: `${kind === 'relay' ? 'Relais' : kind === 'purge' ? 'Conduit' : kind === 'beacon' ? 'Balise' : 'Caisson'} ${index + 1}`,
      x, y: 0, radius: 92, requiredTicks,
      ...(kind === 'beacon' ? { periodTicks: 720 + venueIndex * 24, windowStartTicks: 60 + index * 150, windowTicks: 240 } : {}) }));
  // Operations use levels 1..4 pressure only. The four authored level-five
  // major contacts belong to horde finales, never an unannounced objective.
  const pressure = Math.min(4, typeIndex + 1);
  return { id: `xto191-arbiter-${venue.slug}-${kind}`, kind, title: `${venue.label} · ${names[kind]}`,
    label: `${venue.label} · ${names[kind]}`, act: 'ARCHIVES ARBITER', stageId: venue.stageId,
    hordeProtocolId: `xth191-arbiter-${venue.slug}-${pressure}`, description: `${venue.record} ${instructions[kind]}`,
    instruction: instructions[kind], roundSeconds: 150 + venueIndex * 10 + typeIndex * 6, reward: 300 + venueIndex * 20 + typeIndex * 30,
    difficulty: typeIndex < 2 ? 'easy' : typeIndex === 4 ? 'hard' : 'normal', factionId: venue.factionId,
    startX: kind === 'escort' ? reverse ? 1250 : 250 : 500, cargoStartX: reverse ? 1250 : 250, cargoEndX: reverse ? 250 : 1250,
    depot: { id: 'depot', kind: 'depot', label: 'Dépôt de récupération', x: 500, y: 0, radius: 105, requiredTicks: 60 },
    exit: { id: 'exit', kind: 'exit', label: 'Sas d’extraction', x: 1350, y: 0, radius: 110, requiredTicks: 180 + venueIndex * 12 },
    objectives, branch: 'operations', archiveV191: true, archiveKindV191: 'operation', archiveVenueV191: venue.slug,
    canonStatus: 'original-tantalus-arbiter-replay', canonExact: false, revision: 191 };
})));
const operations = new Map(ARBITER_OPERATIONS_V191.map(entry => [entry.id, entry]));
export const ARBITER_PROGRAMS_V191 = freeze(venues.flatMap(venue => [
  ...ARBITER_HORDE_PROTOCOLS_V191.filter(entry => entry.archiveVenueV191 === venue.slug),
  ...ARBITER_OPERATIONS_V191.filter(entry => entry.archiveVenueV191 === venue.slug)
]));
const programs = new Map(ARBITER_PROGRAMS_V191.map(entry => [entry.id, entry]));
export const getArbiterHordeProtocolV191 = id => hordes.get(id) || null;
export const getArbiterOperationV191 = id => operations.get(id) || null;
export const getArbiterProgramV191 = id => programs.get(id) || null;

/** Only six ordered, validated strategic return receipts open these archives.
 * Existing Trials programs are outside this gate. A boolean unlock, forged
 * counts or a bare final mission ID are not evidence of a completed arc.
 */
export function getArbiterArchiveAccessV191(raw) {
  const progress = normalizeArbiterCampaignProgressV190(raw), completedReturns = progress.returns.length;
  const ready = completedReturns === 6;
  return Object.freeze({ available: ready, completed: completedReturns, total: 6,
    reason: ready ? 'archives-ready' : 'six-validated-returns-required',
    notice: ready ? 'ARCHIVES ARBITER · Copie locale isolée. 20 hordes et 20 opérations récupérées.'
      : `ARCHIVES ARBITER · ${completedReturns}/6 retours validés. Terminez les six extractions du dossier ARBITER.` });
}

// Physical machinery for NEW operations only, using the existing V188
// warning/collision/damage renderer and validator. These four definitions are
// separate from the harmless, presentation-only V190 background activities.
const machinery = [
  ['xt190-adjudication-vault', 'steam', 'DÉCHARGE DE VAPEUR', 'Quittez le conduit balisé avant la décharge.', '#b5d5d7', 150, 60, 6, [392, 908], 128],
  ['xt190-specimen-transfer', 'cryo', 'PURGE CRYOGÉNIQUE', 'Franchissez la purge après le signal.', '#a2c4ec', 22, 84, 5, [414, 892], 120],
  ['xt190-executive-gallery', 'debris', 'CHUTE DE DÉBRIS', 'Dégagez la zone de chute balisée.', '#dfb67c', 420, 12, 8, [900, 400], 112],
  ['xt190-evidence-stack', 'arc', 'ARC ÉLECTRIQUE', 'Sautez la bande au sol ou attendez hors de sa portée.', '#91d7ed', 38, 42, 7, [406, 898], 116]
];
export const ARBITER_STAGE_HAZARDS_V191 = freeze(machinery.map(([stageId, kind, label, hint, color, height, activeTicks, damage, anchors, width], index) => ({
  id: `xhz191-${venues[index].slug}`, stageId, kind, label, hint, color, height, activeTicks, damage, anchors, width, bottom: 0,
  graceTicks: 180 + index * 24, warningTicks: 660, periodTicks: 660 + activeTicks + 540,
  hitIntervalTicks: 120, affectsCombat: true, canonExact: false, canonStatus: 'original-tantalus-arbiter-replay'
})));

// Fail loudly at authoring time if an atlas identity is removed or renamed.
for (const venue of venues) if (!getXenoTrialsCorporateStageV190(venue.stageId)) throw new Error(`Unknown ARBITER stage: ${venue.stageId}`);
