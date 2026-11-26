import {
  ALIEN3_CAMPAIGN_ID_V88,
  ALIEN3_FIORINA_PALETTE_V88,
  ALIEN3_FIORINA_TEMPLATE_V88,
  ALIEN3_OPERATION_ID_V88,
  ALIEN3_TEMPLATE_ID_V88
} from './alien3-dlc-v88.js';

export const ALIEN3_DLC_SCHEMA_V89 = 89;
export const ALIEN3_OPERATION_ID_V89 = ALIEN3_OPERATION_ID_V88;
export const ALIEN3_CAMPAIGN_ID_V89 = ALIEN3_CAMPAIGN_ID_V88;
export const ALIEN3_TEMPLATE_ID_V89 = ALIEN3_TEMPLATE_ID_V88;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bool = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const boundedText = (value, fallback = '', max = 128) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
const unique = (value, allowed, max = 128) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, max)
  : [];

export const ALIEN3_ARCHIVE_CUTS_V89 = deepFreeze([
  {
    id: 'theatrical',
    label: 'MONTAGE CINÉMA 1992',
    host: 'Spike / chien',
    wasteTank: false,
    finalQueenEmergence: true,
    description: 'Route principale : naissance depuis le chien, piège incendiaire qui échoue et finale avec émergence de la reine.'
  },
  {
    id: 'assembly',
    label: 'ASSEMBLY CUT',
    host: 'Babe / bovin',
    wasteTank: true,
    finalQueenEmergence: false,
    description: 'Variante d’archive : naissance depuis le bovin, capture temporaire dans la cuve à déchets, libération par Golic et finale alternative.'
  }
]);

export const ALIEN3_FIORINA_PALETTE_V89 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V88),
  id: 'fiorina-161-leadworks-v89',
  light: 0.31,
  prop: 'penal-foundry-expanded'
});

/**
 * V89 keeps the V88 geometry compatible while adding a fourth continuous route
 * through the waste-containment infrastructure used by the Assembly Cut branch.
 */
const template = clone(ALIEN3_FIORINA_TEMPLATE_V88);
template.label = 'Fiorina 161 · prison, cuve à déchets et fonderie';
template.nodes.push(
  { id: 'f161-assembly-hall', x: 2300, y: 510, zoneId: 'f161-cellblock', anchor: null, width: 300 },
  { id: 'f161-waste-tank', x: 4070, y: 630, zoneId: 'f161-leadworks', anchor: null, width: 310 },
  { id: 'f161-sluice-low', x: 4500, y: 630, zoneId: 'f161-leadworks', anchor: null, width: 280 },
  { id: 'f161-furnace-gantry', x: 5740, y: 330, zoneId: 'f161-furnace', anchor: null, width: 280 }
);

// Split the ground spine through the assembly hall.
template.edges = template.edges.filter((entry) => entry.id !== 'f161-e04');
template.edges.push(
  { id: 'f161-e27', from: 'f161-cell-a', to: 'f161-assembly-hall', kind: 'walk', routeIds: ['f161-ground'] },
  { id: 'f161-e28', from: 'f161-assembly-hall', to: 'f161-cell-b', kind: 'walk', routeIds: ['f161-ground'] },
  { id: 'f161-e29', from: 'f161-assembly-hall', to: 'f161-mess-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e30', from: 'f161-tunnel-low', to: 'f161-waste-tank', kind: 'walk', routeIds: ['f161-containment'] },
  { id: 'f161-e31', from: 'f161-waste-tank', to: 'f161-sluice-low', kind: 'walk', routeIds: ['f161-containment'] },
  { id: 'f161-e32', from: 'f161-sluice-low', to: 'f161-leadworks', kind: 'ladder', routeIds: ['f161-containment'] },
  { id: 'f161-e33', from: 'f161-furnace-high', to: 'f161-furnace-gantry', kind: 'walk', routeIds: ['f161-containment'] },
  { id: 'f161-e34', from: 'f161-furnace-gantry', to: 'f161-company', kind: 'ladder', routeIds: ['f161-containment'] }
);

for (const routeEntry of template.routes) {
  if (routeEntry.id === 'f161-ground') {
    const next = [];
    for (const id of routeEntry.nodeIds) {
      next.push(id);
      if (id === 'f161-cell-a') next.push('f161-assembly-hall');
    }
    routeEntry.nodeIds = next;
  }
}
template.routes.push({
  id: 'f161-containment',
  role: 'waste-containment-and-high-gantry',
  nodeIds: [
    'f161-spawn', 'f161-eev', 'f161-infirmary', 'f161-service-deep', 'f161-tunnel-low',
    'f161-waste-tank', 'f161-sluice-low', 'f161-leadworks', 'f161-sprinkler',
    'f161-furnace-high', 'f161-furnace-gantry', 'f161-company', 'f161-extraction'
  ]
});

// Shared edges must declare the new route to stay coherent with the route metadata.
for (const entry of template.edges) {
  if (['f161-e01', 'f161-e02', 'f161-e19', 'f161-e20', 'f161-e26', 'f161-e17', 'f161-e11'].includes(entry.id)
      && !entry.routeIds.includes('f161-containment')) entry.routeIds.push('f161-containment');
}

export const ALIEN3_FIORINA_TEMPLATE_V89 = deepFreeze(template);

export const ALIEN3_CODEX_V89 = deepFreeze([
  { id: 'f161-cut-theatrical', title: 'ARCHIVE : MONTAGE CINÉMA', category: 'MIRE', body: 'Cette reconstruction suit la continuité du montage cinéma : le Runner est issu du chien Spike et la séquence finale montre l’émergence de la reine.' },
  { id: 'f161-cut-assembly', title: 'ARCHIVE : ASSEMBLY CUT', category: 'MIRE', body: 'Cette variante suit les éléments restaurés : hôte bovin, capture temporaire du Runner dans la cuve à déchets, libération par Golic et finale sans émergence visible de la reine.' },
  { id: 'f161-host-spike', title: 'SPIKE — HÔTE CANIN', category: 'XÉNOBIOLOGIE', body: 'Le montage cinéma associe le Runner à un hôte canin. Le runtime conserve cette variante séparée de la version Assembly afin de ne pas fusionner deux continuités contradictoires.' },
  { id: 'f161-host-babe', title: 'BABE — HÔTE BOVIN', category: 'XÉNOBIOLOGIE', body: 'L’Assembly Cut remplace l’hôte canin par un bovin utilisé dans le complexe. Cette différence est traitée comme un choix de reconstruction MIRE.' },
  { id: 'f161-junior-redemption', title: 'JUNIOR — SACRIFICE', category: 'PERSONNEL', body: 'Dans la branche Assembly, Junior se rachète en servant d’appât pour enfermer temporairement le Runner dans la cuve à déchets.' },
  { id: 'f161-golic-release', title: 'GOLIC — LIBÉRATION', category: 'PERSONNEL', body: 'La fascination de Golic pour la créature provoque la rupture du confinement dans la branche Assembly, réintroduisant le Runner dans le complexe.' },
  { id: 'f161-waste-tank', title: 'CUVE À DÉCHETS', category: 'LIEU', body: 'Secteur industriel secondaire ajouté au graphe V89. Il forme une quatrième route continue et sert de séquence de confinement temporaire dans l’Assembly Cut.' },
  { id: 'f161-prison-roster', title: 'RÉSIDENTS DE FIORINA 161', category: 'PERSONNEL', body: 'Le registre V89 suit individuellement les détenus nommés et distingue les morts antérieures, les pertes du plan incendiaire, la poursuite finale et le seul survivant de l’archive.' },
  { id: 'f161-patna', title: 'USCSS PATNA / ÉQUIPE DE RÉCUPÉRATION', category: 'FACTION', body: 'La Compagnie dépêche une équipe scientifique et des commandos après transmission des données. L’archive les met en scène comme une force de récupération, non comme une nouvelle vague de combat.' },
  { id: 'f161-morse-witness', title: 'MORSE — TÉMOIN FINAL', category: 'PERSONNEL', body: 'Morse reste le témoin humain de la fermeture du site. V89 conserve son statut distinct des autres prisonniers et suit sa blessure lors de la confrontation finale.' },
  { id: 'f161-queen-sparing', title: 'COMPORTEMENT DU RUNNER : ÉPARGNE', category: 'XÉNOBIOLOGIE', body: 'Le Runner peut interrompre une attaque létale contre Ripley dans la première moitié de l’archive. Le comportement est associé à la présence de l’embryon royal et n’annule pas ses poursuites ultérieures.' },
  { id: 'f161-runner-director', title: 'DIRECTEUR DE TRAQUE', category: 'GAMEPLAY', body: 'Le Runner V89 alterne ombre, chasse, embuscade et attraction par flare. Le système repositionne la pression hors champ plutôt que de multiplier les créatures.' }
]);

export const ALIEN3_PRISONER_ROSTER_V89 = deepFreeze([
  ['dillon', 'Dillon', 4020, 'molten-lead'],
  ['morse', 'Morse', 5220, null],
  ['golic', 'Golic', 2140, 'assembly-release'],
  ['junior', 'Junior', 2180, 'assembly-trap'],
  ['murphy', 'Murphy', 1720, 'pre-archive'],
  ['boggs', 'Boggs', 1840, 'pre-archive'],
  ['rains', 'Rains', 1940, 'pre-archive'],
  ['david', 'David', 4380, 'leadworks'],
  ['kevin', 'Kevin', 4500, 'leadworks'],
  ['jude', 'Jude', 4640, 'leadworks'],
  ['troy', 'Troy', 4760, 'leadworks'],
  ['william', 'William', 4880, 'leadworks'],
  ['gregor', 'Gregor', 5000, 'leadworks'],
  ['arthur', 'Arthur', 3880, 'assembly-release'],
  ['frank', 'Frank', 2500, 'fire-maze'],
  ['eric', 'Eric', 2660, 'fire-maze']
].map(([id, name, x, fate]) => ({ id, name, x, y: 422, fate })));

export const ALIEN3_V89_STATIONS = deepFreeze([
  { id: 'f161-cut-theatrical-terminal', kind: 'cut', cutId: 'theatrical', x: 300, y: 438, w: 66, h: 72, label: 'MIRE · MONTAGE CINÉMA' },
  { id: 'f161-cut-assembly-terminal', kind: 'cut', cutId: 'assembly', x: 400, y: 438, w: 66, h: 72, label: 'MIRE · ASSEMBLY CUT' },
  { id: 'f161-prison-register', kind: 'evidence', evidenceId: 'prison-roster', x: 2280, y: 438, w: 72, h: 72, label: 'REGISTRE DES RÉSIDENTS' },
  { id: 'f161-waste-tank-control', kind: 'waste-tank', x: 4034, y: 548, w: 72, h: 82, label: 'PORTE DE LA CUVE À DÉCHETS' },
  { id: 'f161-patna-manifest', kind: 'evidence', evidenceId: 'patna', x: 5640, y: 438, w: 72, h: 72, label: 'MANIFESTE PATNA' },
  { id: 'f161-morse-witness-log', kind: 'evidence', evidenceId: 'morse', x: 5890, y: 438, w: 72, h: 72, label: 'DÉPOSITION MORSE' }
]);

export const ALIEN3_RUNNER_AMBUSH_ANCHORS_V89 = deepFreeze([
  { id: 'cell-a', x: 1760, y: 420 },
  { id: 'assembly', x: 2440, y: 420 },
  { id: 'service', x: 3320, y: 420 },
  { id: 'waste', x: 4140, y: 540 },
  { id: 'lead', x: 4680, y: 420 },
  { id: 'mold', x: 5100, y: 420 }
]);

export const ALIEN3_V89_EVIDENCE_IDS = deepFreeze([
  'cut-selected', 'host-variant', 'prison-roster', 'waste-tank', 'junior-sacrifice',
  'golic-release', 'queen-sparing', 'patna', 'morse', 'runner-director'
]);

const prisonerIds = new Set(ALIEN3_PRISONER_ROSTER_V89.map((entry) => entry.id));
const codexIds = new Set(ALIEN3_CODEX_V89.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V89_EVIDENCE_IDS);

export function createAlien3StateV89({ cut = 'theatrical' } = {}) {
  const selectedCut = ALIEN3_ARCHIVE_CUTS_V89.some((entry) => entry.id === cut) ? cut : 'theatrical';
  return {
    schema: ALIEN3_DLC_SCHEMA_V89,
    operationId: ALIEN3_OPERATION_ID_V89,
    cut: selectedCut,
    cutLocked: false,
    codexUnlocked: selectedCut === 'assembly' ? ['f161-cut-assembly'] : ['f161-cut-theatrical'],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: ['cut-selected'],
    assembly: {
      juniorSacrifice: false,
      wasteTankTrapped: false,
      golicReleased: false,
      arthurKilled: false,
      releaseClock: 0,
      releaseNotified: false
    },
    director: {
      mode: 'dormant',
      tension: 0,
      modeClock: 0,
      relocationCooldown: 0,
      sparingClock: 0,
      sparingUsed: false,
      ambushes: 0,
      flaresConsumed: 0,
      conventionalHitsResisted: 0,
      lastAnchorId: null
    },
    flares: [],
    prisoners: Object.fromEntries([...prisonerIds].map((id) => [id, id === 'morse' ? 'active' : 'active'])),
    company: {
      visible: false,
      refusalLogged: false,
      morseWounded: false,
      aaronDefiant: false
    },
    finale: {
      started: false,
      clock: 0,
      stage: 'idle',
      queenEmerges: false,
      completed: false
    },
    stats: {
      flaresUsed: 0,
      damageTaken: 0,
      evidence: 1,
      blockedMilitaryActions: 0,
      routeAmbushes: 0
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV89(raw) {
  const fallback = createAlien3StateV89();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V89) return fallback;
  const cut = ALIEN3_ARCHIVE_CUTS_V89.some((entry) => entry.id === raw.cut) ? raw.cut : fallback.cut;
  const assembly = raw.assembly && typeof raw.assembly === 'object' ? raw.assembly : {};
  const director = raw.director && typeof raw.director === 'object' ? raw.director : {};
  const company = raw.company && typeof raw.company === 'object' ? raw.company : {};
  const finale = raw.finale && typeof raw.finale === 'object' ? raw.finale : {};
  const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  const prisoners = raw.prisoners && typeof raw.prisoners === 'object' ? raw.prisoners : {};
  const flareEntries = Array.isArray(raw.flares) ? raw.flares.slice(0, 8) : [];
  return {
    ...fallback,
    cut,
    cutLocked: bool(raw.cutLocked),
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    assembly: {
      juniorSacrifice: bool(assembly.juniorSacrifice),
      wasteTankTrapped: bool(assembly.wasteTankTrapped),
      golicReleased: bool(assembly.golicReleased),
      arthurKilled: bool(assembly.arthurKilled),
      releaseClock: clamp(assembly.releaseClock, 0, 60),
      releaseNotified: bool(assembly.releaseNotified)
    },
    director: {
      mode: ['dormant', 'shadow', 'hunt', 'ambush', 'lure', 'contained', 'cooldown'].includes(director.mode) ? director.mode : 'dormant',
      tension: clamp(director.tension, 0, 100),
      modeClock: clamp(director.modeClock, 0, 9999),
      relocationCooldown: clamp(director.relocationCooldown, 0, 60),
      sparingClock: clamp(director.sparingClock, 0, 30),
      sparingUsed: bool(director.sparingUsed),
      ambushes: Math.round(clamp(director.ambushes, 0, 99)),
      flaresConsumed: Math.round(clamp(director.flaresConsumed, 0, 99)),
      conventionalHitsResisted: Math.round(clamp(director.conventionalHitsResisted, 0, 999)),
      lastAnchorId: boundedText(director.lastAnchorId, '', 64) || null
    },
    flares: flareEntries.map((entry, index) => ({
      id: boundedText(entry?.id, `f161-flare-${index + 1}`, 96),
      x: clamp(entry?.x, 0, 6200),
      y: clamp(entry?.y, 0, 1080),
      life: clamp(entry?.life, 0, 12),
      maxLife: clamp(entry?.maxLife || 7.5, 0.1, 12),
      consumed: bool(entry?.consumed)
    })),
    prisoners: Object.fromEntries([...prisonerIds].map((id) => {
      const status = prisoners[id];
      return [id, ['active', 'deceased', 'wounded', 'missing'].includes(status) ? status : 'active'];
    })),
    company: {
      visible: bool(company.visible),
      refusalLogged: bool(company.refusalLogged),
      morseWounded: bool(company.morseWounded),
      aaronDefiant: bool(company.aaronDefiant)
    },
    finale: {
      started: bool(finale.started),
      clock: clamp(finale.clock, 0, 30),
      stage: ['idle', 'platform', 'morse-shot', 'aaron-last-stand', 'furnace', 'complete'].includes(finale.stage) ? finale.stage : 'idle',
      queenEmerges: bool(finale.queenEmerges),
      completed: bool(finale.completed)
    },
    stats: {
      flaresUsed: Math.round(clamp(stats.flaresUsed, 0, 999)),
      damageTaken: clamp(stats.damageTaken, 0, 99999),
      evidence: Math.round(clamp(stats.evidence, 0, ALIEN3_V89_EVIDENCE_IDS.length)),
      blockedMilitaryActions: Math.round(clamp(stats.blockedMilitaryActions, 0, 999)),
      routeAmbushes: Math.round(clamp(stats.routeAmbushes, 0, 99))
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 80)))].slice(0, 32)
      : []
  };
}

export function alien3V89CodexEntry(id) {
  return ALIEN3_CODEX_V89.find((entry) => entry.id === id) || null;
}

export function alien3V89Cut(id) {
  return ALIEN3_ARCHIVE_CUTS_V89.find((entry) => entry.id === id) || ALIEN3_ARCHIVE_CUTS_V89[0];
}

export function alien3V89Grade({ synchronization = 100, evidence = 0, totalEvidence = ALIEN3_V89_EVIDENCE_IDS.length, damageTaken = 0 } = {}) {
  const sync = clamp(synchronization, 0, 100);
  const completion = totalEvidence > 0 ? clamp(evidence / totalEvidence, 0, 1) : 0;
  const score = sync * 0.72 + completion * 22 + Math.max(0, 6 - Math.min(6, damageTaken / 40));
  return score >= 94 ? 'S' : score >= 84 ? 'A' : score >= 72 ? 'B' : score >= 58 ? 'C' : 'D';
}

export function validateAlien3DlcV89() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V89.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V89.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V89.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V89.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const routeIds = new Set(routes.map((entry) => entry.id));
  const zoneIds = new Set(zones.map((entry) => entry.id));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const spawn = nodes.find((entry) => entry.anchor === 'spawn')?.id;
  const extraction = nodes.find((entry) => entry.anchor === 'extraction')?.id;
  if (ALIEN3_FIORINA_TEMPLATE_V89.id !== ALIEN3_TEMPLATE_ID_V89) failures.push('template id mismatch');
  if (routes.length < 4) failures.push('fourth containment route missing');
  if (new Set(routes.map((entry) => entry.nodeIds.join('>'))).size !== routes.length) failures.push('duplicate route geometry');
  if (new Set(nodes.map((entry) => entry.id)).size !== nodes.length) failures.push('duplicate node ids');
  if (new Set(edges.map((entry) => entry.id)).size !== edges.length) failures.push('duplicate edge ids');
  for (const entry of nodes) {
    const zoneEntry = zones.find((candidate) => candidate.id === entry.zoneId);
    if (!zoneIds.has(entry.zoneId)) failures.push(`unknown zone ${entry.zoneId} on ${entry.id}`);
    else if (entry.x < zoneEntry.x - 32 || entry.x > zoneEntry.x + zoneEntry.w + 32) failures.push(`node outside zone: ${entry.id}`);
  }
  for (const entry of edges) {
    if (!nodeIds.has(entry.from) || !nodeIds.has(entry.to)) failures.push(`edge endpoint missing: ${entry.id}`);
    for (const id of entry.routeIds) if (!routeIds.has(id)) failures.push(`unknown route ${id} on ${entry.id}`);
  }
  for (const routeEntry of routes) {
    if (routeEntry.nodeIds[0] !== spawn || routeEntry.nodeIds.at(-1) !== extraction) failures.push(`route endpoints invalid: ${routeEntry.id}`);
    for (let index = 1; index < routeEntry.nodeIds.length; index += 1) {
      const pair = `${routeEntry.nodeIds[index - 1]}>${routeEntry.nodeIds[index]}`;
      if (!edgePairs.has(pair)) failures.push(`broken route segment ${routeEntry.id}: ${pair}`);
    }
  }
  if (ALIEN3_ARCHIVE_CUTS_V89.length !== 2) failures.push('archive cuts incomplete');
  if (new Set(ALIEN3_CODEX_V89.map((entry) => entry.id)).size !== ALIEN3_CODEX_V89.length) failures.push('duplicate V89 codex ids');
  if (new Set(ALIEN3_PRISONER_ROSTER_V89.map((entry) => entry.id)).size !== ALIEN3_PRISONER_ROSTER_V89.length) failures.push('duplicate prisoner ids');
  if (!ALIEN3_PRISONER_ROSTER_V89.some((entry) => entry.id === 'morse')) failures.push('Morse witness missing');
  if (!nodes.some((entry) => entry.id === 'f161-waste-tank')) failures.push('waste tank node missing');
  return deepFreeze({
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      routes: routes.length,
      zones: zones.length,
      cuts: ALIEN3_ARCHIVE_CUTS_V89.length,
      codexV89: ALIEN3_CODEX_V89.length,
      prisoners: ALIEN3_PRISONER_ROSTER_V89.length,
      evidence: ALIEN3_V89_EVIDENCE_IDS.length
    }
  });
}
