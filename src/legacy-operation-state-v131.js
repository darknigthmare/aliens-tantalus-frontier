// Playable adaptations of the project outlines. Dedicated missing artwork and
// the unproduced acts remain explicitly outside these three first chapters.
export const LEGACY_CAMPAIGNS_V131 = Object.freeze([
  { id: 'special-nostromo-v131', kind: 'nostromo', specialOperationId: 'mire-archive-001', name: 'MIRE · NOSTROMO',
    worldId: 'world-15-uscss-nostromo', year: 2122, mode: 'CHRONIQUE', templateId: 'ship-interior-vertical',
    objective: 'Rejouer la chaîne signal, quarantaine, chasse et fuite à bord de Narcissus.',
    summary: 'Chapitre solo : script physique, portes, synchronisation et compte à rebours.',
    limitations: 'Costume Nostromo existant adapté ; opérateur du casting actuel. Les sept membres et Jones ne disposent pas de leurs propres animations. Derelict et actes extérieurs non produits.' },
  { id: 'special-black-abyss-v131', kind: 'abyss', specialOperationId: 'black-abyss', name: 'ABYSSE NOIR · THALASSA-7',
    worldId: 'world-10-ceto', year: 2204, mode: 'SUBAQUATIQUE', templateId: 'planet-exterior',
    objective: 'Traverser le canyon, récupérer le noyau, stabiliser la ruche et revenir à la cloche.',
    summary: 'Nage libre, oxygène, pression, trois modes HADAL, MANTA et prédateur aquatique adapté.',
    limitations: 'HADAL et MANTA-6 : prototypes de gameplay à présentation procédurale. Boss adapté du Ceto Reef Predator existant ; arsenal, dix castes, second boss et actes ultérieurs non produits.' },
  { id: 'special-broodstorm-v131', kind: 'broodstorm', specialOperationId: 'broodstorm', name: 'BROODSTORM · CORRIDOR AÉRIEN',
    worldId: 'world-01-acheron-lv-426', year: 2204, mode: 'AÉRIEN', templateId: 'planet-exterior',
    objective: 'Bombarder les nids, protéger le transport et vaincre la reine volante adaptée.',
    summary: 'Vol libre de Cheyenne, aile alliée, escorte physique, bombes et directeur de vagues.',
    limitations: 'Cheyenne existant réutilisé. FlyingQueen : adaptation de gameplay de la Queen existante, sans planche dédiée. Modularité complète et autres actes non produits.' }
].map(campaign => Object.freeze({ ...campaign, source: 'Tantalus Special Operations', canon: 'project-adaptation',
  status: 'partial', playable: true, localPlayers: 1, routes: 1,
  description: `${campaign.summary} ${campaign.limitations}` })));

export const LEGACY_STATIONS_V131 = Object.freeze({
  nostromo: Object.freeze([
    { id: 'wake', label: 'RÉVEIL', x: 160, y: 518, seconds: 1.5 },
    { id: 'signal', label: 'SIGNAL / DERELICT · JOURNAL', x: 530, y: 518, seconds: 2 },
    { id: 'quarantine', label: 'QUARANTAINE', x: 900, y: 518, seconds: 3 },
    { id: 'hunt', label: 'CONTENTION / CHASSE', x: 1290, y: 518, seconds: 2 },
    { id: 'order937', label: 'ORDRE 937', x: 1680, y: 518, seconds: 2 },
    { id: 'destruct', label: 'AUTODESTRUCTION', x: 2020, y: 518, seconds: 4 },
    { id: 'escape', label: 'NARCISSUS · DÉPART', x: 270, y: 518, seconds: 3 }
  ]),
  abyss: Object.freeze([
    { id: 'briefing', label: 'CLOCHE · THALASSA-7', x: 190, y: 180, seconds: 1.5 },
    { id: 'survey', label: 'CANYON · BALISE', x: 940, y: 460, seconds: 2 },
    { id: 'core', label: 'NOYAU DU BATHYSCAPHE', x: 1220, y: 720, seconds: 3 },
    { id: 'vent', label: 'VANNE HYDROTHERMALE · HADAL LESTÉ', x: 1750, y: 870, seconds: 3 },
    { id: 'boss', label: 'PRÉDATEUR CETO · RENCONTRE ADAPTÉE', x: 2260, y: 790, seconds: 0 },
    { id: 'return', label: 'CLOCHE · EXTRACTION', x: 190, y: 180, seconds: 3 }
  ]),
  broodstorm: Object.freeze([
    { id: 'launch', label: 'CHEYENNE · LANCEMENT', x: 190, y: 260, seconds: 1.5 },
    { id: 'nests', label: 'BOMBARDER DEUX NIDS · B', x: 1100, y: 800, seconds: 0 },
    { id: 'escort', label: 'PROTÉGER LE TRANSPORT', x: 2110, y: 320, seconds: 0 },
    { id: 'queen', label: 'FLYINGQUEEN · ADAPTATION', x: 2320, y: 350, seconds: 0 },
    { id: 'extract', label: 'CORRIDOR · EXTRACTION', x: 2660, y: 240, seconds: 3 }
  ])
});
export const LEGACY_BOUNDS_V131 = Object.freeze({ nostromo: { width: 2400, height: 620 },
  abyss: { width: 2800, height: 1040 }, broodstorm: { width: 2900, height: 1040 } });
export function createLegacyOperationStateV131(kind) {
  const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === kind);
  if (!campaign) throw new Error('Unknown legacy chapter.');
  return { schema: 131, kind, operationId: campaign.specialOperationId, stage: 0, elapsed: 0, hold: 0,
    oxygen: 100, pressure: 0, hadalMode: 'neutral', countdown: 150, synchronization: 100,
    fuel: 100, battery: 100, hull: 260, aboard: kind === 'broodstorm', bombs: 6, bombClock: 0,
    nests: [140, 140], escort: { x: 280, y: 320, hull: 180, arrived: false },
    wingMode: 'follow', wingClock: 0, wave: 0, directorClock: 4,
    actors: [], journal: [], complete: false, rewardClaimed: false, rewards: null };
}
const finite = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
export function validateLegacyOperationStateV131(raw) {
  const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === raw?.kind);
  if (!campaign || raw.schema !== 131 || raw.operationId !== campaign.specialOperationId)
    return { valid: false, reason: 'legacy-schema-mismatch' };
  const maxStage = LEGACY_STATIONS_V131[raw.kind].length - 1, bounds = LEGACY_BOUNDS_V131[raw.kind];
  const ranges = { stage: [0, maxStage], elapsed: [0, 604800], hold: [0, 4], oxygen: [0, 100], pressure: [0, 100],
    countdown: [0, 150], synchronization: [0, 100], fuel: [0, 100], battery: [0, 100], hull: [0, 260],
    bombs: [0, 6], bombClock: [0, 2], wingClock: [0, 2], wave: [0, 6], directorClock: [0, 8] };
  if (Object.entries(ranges).some(([key, range]) => !finite(raw[key], ...range))
    || raw.hold > LEGACY_STATIONS_V131[raw.kind][raw.stage]?.seconds
    || !['stage', 'bombs', 'wave'].every(key => Number.isInteger(raw[key]))
    || !['neutral', 'weighted', 'magnetic'].includes(raw.hadalMode) || !['follow', 'suppress'].includes(raw.wingMode)
    || !['aboard', 'complete', 'rewardClaimed'].every(key => typeof raw[key] === 'boolean')
    || !Array.isArray(raw.nests) || raw.nests.length !== 2 || raw.nests.some(hp => !finite(hp, 0, 140))
    || !raw.escort || !finite(raw.escort.x, 280, 2110) || !finite(raw.escort.y, 320, 320)
    || !finite(raw.escort.hull, 0, 180) || raw.escort.arrived !== (raw.escort.x === 2110)
    || !Array.isArray(raw.journal) || raw.journal.length !== raw.stage
    || raw.journal.some((id, index) => id !== LEGACY_STATIONS_V131[raw.kind][index].id)
    || raw.complete !== raw.rewardClaimed || raw.complete && (raw.stage !== maxStage || !raw.rewards
      || raw.hold !== LEGACY_STATIONS_V131[raw.kind][maxStage].seconds
      || raw.kind === 'nostromo' && raw.countdown <= 0 || raw.kind === 'abyss' && raw.oxygen <= 0
      || raw.kind === 'abyss' && raw.aboard && raw.battery <= 0
      || raw.kind !== 'nostromo' && (raw.hull <= 0 || raw.fuel <= 0)
      || raw.kind === 'broodstorm' && raw.escort.hull <= 0)
    || !raw.complete && raw.rewards !== null || raw.kind === 'broodstorm' && !raw.aboard
    || raw.kind === 'nostromo' && raw.aboard
    || raw.kind === 'broodstorm' && raw.stage >= 2 && raw.nests.some(hp => hp > 0)
    || raw.kind === 'broodstorm' && raw.stage >= 3 && !raw.escort.arrived
    || !Array.isArray(raw.actors) || raw.actors.length > 8
    || new Set(raw.actors.map(actor => actor?.id)).size !== raw.actors.length
    || raw.actors.some(actor => !actor || !['hunt', 'predator', 'queen', 'fighter'].includes(actor.role)
      || actor.role !== actor.id?.split('-')[0] || !/^(hunt|predator|queen)-0$|^fighter-[0-5]$/.test(actor.id) || !finite(actor.x, 0, bounds.width)
      || !finite(actor.y, 0, bounds.height) || !finite(actor.health, 0, 420)
      || typeof actor.alive !== 'boolean' || actor.alive !== (actor.health > 0)
      || !finite(actor.attackClock, 0, 2))) return { valid: false, reason: 'legacy-progress-inconsistent' };
  const roles = raw.actors.map(actor => actor.role);
  const expected = raw.kind === 'nostromo' ? raw.stage >= 3 ? ['hunt'] : []
    : raw.kind === 'abyss' ? raw.stage >= 4 ? ['predator'] : []
    : [...Array.from({ length: raw.wave }, () => 'fighter'), ...(raw.stage >= 3 ? ['queen'] : [])];
  if (roles.slice().sort().join() !== expected.sort().join()
    || raw.kind === 'broodstorm' && Array.from({ length: raw.wave }, (_, index) => `fighter-${index}`).some(id => !raw.actors.some(actor => actor.id === id))
    || raw.kind === 'nostromo' && raw.stage >= 4 && raw.actors.some(actor => actor.role === 'hunt' && actor.alive)
    || raw.kind === 'abyss' && raw.stage >= 5 && raw.actors.some(actor => actor.role === 'predator' && actor.alive)
    || raw.kind === 'broodstorm' && raw.stage >= 4 && raw.actors.some(actor => actor.role === 'queen' && actor.alive))
    return { valid: false, reason: 'legacy-actors-inconsistent' };
  if (raw.rewards && (raw.rewards.credits !== 620 || raw.rewards.operationId !== campaign.specialOperationId
    || raw.rewards.chapter !== raw.kind || raw.rewards.status !== 'partial' || raw.rewards.synchronization !== raw.synchronization
    || !Number.isInteger(raw.rewards.salvage) || !Number.isInteger(raw.rewards.intel)
    || !finite(raw.rewards.salvage, 0, 99999999) || !finite(raw.rewards.intel, 0, 99999999)))
    return { valid: false, reason: 'legacy-rewards-inconsistent' };
  return { valid: true, state: structuredClone(raw) };
}
export function legacyOperationDossierV131(state) {
  const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === state.kind);
  const station = LEGACY_STATIONS_V131[state.kind][state.stage];
  const controls = state.kind === 'nostromo' ? 'A/D déplacer · F tirer · R recharger · maintenir E au poste'
    : state.kind === 'abyss' ? 'A/D/W/S ou flèches : nage/vol MANTA · Q mode HADAL · E embarquer/sortir/poste · F tirer'
      : 'A/D/W/S ou flèches : vol · F tirer · B bombarder · Q aile suivi/suppression · maintenir E au poste';
  return { title: state.complete ? 'CHAPITRE TERMINÉ' : station.label, instruction: controls, station: { ...station },
    campaignId: campaign.id, operationId: state.operationId, status: 'partial', limitations: campaign.limitations, localPlayers: 1 };
}
