import {
  ALIEN3_CAMPAIGN_ID_V96,
  ALIEN3_FIORINA_PALETTE_V96,
  ALIEN3_FIORINA_TEMPLATE_V96,
  ALIEN3_OPERATION_ID_V96,
  ALIEN3_TEMPLATE_ID_V96
} from './alien3-dlc-v96.js';

export const ALIEN3_DLC_SCHEMA_V97 = 97;
export const ALIEN3_OPERATION_ID_V97 = ALIEN3_OPERATION_ID_V96;
export const ALIEN3_CAMPAIGN_ID_V97 = ALIEN3_CAMPAIGN_ID_V96;
export const ALIEN3_TEMPLATE_ID_V97 = ALIEN3_TEMPLATE_ID_V96;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bool = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const unique = (value, allowed, max = 256) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, max)
  : [];

export const ALIEN3_FIORINA_PALETTE_V97 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V96),
  id: 'fiorina-161-hybrid-depth-v97',
  light: 0.238,
  prop: 'penal-foundry-hybrid-depth-v97'
});

const template = clone(ALIEN3_FIORINA_TEMPLATE_V96);
template.label = 'Fiorina 161 · Hybrid depth / side tension / dedicated DLC codex';
export const ALIEN3_FIORINA_TEMPLATE_V97 = deepFreeze(template);

/**
 * V97 keeps the certified V95/V96 topology intact. Hybrid sectors are camera / combat
 * contracts over the same authored 6200-unit level, so they cannot create fake routes.
 */
export const ALIEN3_HYBRID_SECTORS_V97 = deepFreeze([
  { id: 'hybrid-storm-yard', label: 'COUR DE LA TEMPÊTE', x0: 0, x1: 720, mode: 'depth', reason: 'espace extérieur large', defaultLane: 1 },
  { id: 'hybrid-eev-infirmary', label: 'EEV / INFIRMERIE', x0: 720, x1: 1700, mode: 'side', reason: 'couloirs médicaux sous tension', defaultLane: 1 },
  { id: 'hybrid-cellblock', label: 'BLOC CARCÉRAL', x0: 1700, x1: 2840, mode: 'depth', reason: 'hall carcéral multi-plan', defaultLane: 1 },
  { id: 'hybrid-service-tunnels', label: 'GALERIES TECHNIQUES', x0: 2840, x1: 3520, mode: 'side', reason: 'conduits et angles morts', defaultLane: 1 },
  { id: 'hybrid-assembly-communications', label: 'ASSEMBLAGE / COMMUNICATIONS', x0: 3520, x1: 4020, mode: 'depth', reason: 'chambre industrielle ouverte', defaultLane: 1 },
  { id: 'hybrid-foundry-hall', label: 'FONDERIE LARGE', x0: 4020, x1: 4700, mode: 'depth', reason: 'rabattage multi-plan', defaultLane: 1 },
  { id: 'hybrid-piston-mold', label: 'PISTONS / MOULE', x0: 4700, x1: 5180, mode: 'side', reason: 'piège précis et corridor létal', defaultLane: 1 },
  { id: 'hybrid-furnace-patna', label: 'FOUR / ARRIVÉE PATNA', x0: 5180, x1: 5750, mode: 'depth', reason: 'plateforme ouverte et confrontation', defaultLane: 1 },
  { id: 'hybrid-final-platform', label: 'PLATEFORME FINALE', x0: 5750, x1: 6200, mode: 'side', reason: 'finale cadrée et extraction', defaultLane: 1 }
]);

export const ALIEN3_DEPTH_LANES_V97 = deepFreeze([
  { id: 'rear', index: 0, label: 'ARRIÈRE', renderScale: 0.82, renderYOffset: -42, stealth: 1.20, runnerPressure: 0.82 },
  { id: 'mid', index: 1, label: 'MÉDIAN', renderScale: 0.95, renderYOffset: 0, stealth: 1.00, runnerPressure: 1.00 },
  { id: 'front', index: 2, label: 'AVANT', renderScale: 1.08, renderYOffset: 42, stealth: 0.84, runnerPressure: 1.18 }
]);

const C = (id, title, category, body) => ({ id, title, category, body });
export const ALIEN3_DLC_CODEX_V97 = deepFreeze([
  C('a3c-overview-archive', 'CHRONIQUE FIORINA 161', 'ARCHIVE', 'Codex autonome du DLC Alien 3. Il rassemble lieux, personnages, créature, événements, machines, variantes de montage et règles du mode hybride.'),
  C('a3c-overview-continuity', 'TROIS CONTINUITÉS MIRE', 'ARCHIVE', 'Les profils Cinéma, Assembly et Workprint restent séparés. Le codex signale leurs différences sans fusionner artificiellement les événements.'),
  C('a3c-overview-hybrid', 'MODE HYBRIDE', 'GAMEPLAY', 'Les espaces ouverts utilisent trois plans de profondeur. Les couloirs, conduits et pièges précis repassent automatiquement en vue 2D latérale.'),
  C('a3c-overview-lanes', 'TROIS PLANS', 'GAMEPLAY', 'Arrière, médian et avant modifient échelle visuelle, furtivité et pression du Runner. Haut recule d’un plan ; bas avance d’un plan.'),
  C('a3c-overview-transition', 'TRANSITIONS PAR PORTES', 'GAMEPLAY', 'Le passage de certaines portes et limites de secteur commute automatiquement la mise en scène. Le joueur ne choisit pas une caméra incohérente avec le lieu.'),
  C('a3c-overview-one-runner', 'UN SEUL RUNNER', 'XÉNOBIOLOGIE', 'Toutes les réapparitions, perchoirs, interceptions et changements de plan utilisent le même acteur Runner persistant.'),

  C('a3c-place-fiorina', 'FIORINA 161', 'LIEUX', 'Monde pénitentiaire industriel isolé, balayé par les intempéries et organisé autour de blocs de détention, galeries techniques, fonderie et four principal.'),
  C('a3c-place-coast', 'CÔTE ET ÉPAVE EEV', 'LIEUX', 'Zone extérieure froide et humide. En V97 elle devient un espace de profondeur où l’épave, le terrain et les approches occupent plusieurs plans.'),
  C('a3c-place-eev', 'MODULE EEV', 'LIEUX', 'Capsule de secours issue du Sulaco. Les traces techniques et médicales y alimentent la reconstruction MIRE.'),
  C('a3c-place-infirmary', 'INFIRMERIE', 'LIEUX', 'Secteur médical resserré conservé en vue 2D latérale pour privilégier tension, cadrage et interactions précises.'),
  C('a3c-place-morgue', 'MORGUE', 'LIEUX', 'Annexe de l’infirmerie utilisée par la reconstruction pour les constats initiaux et les premiers indices biologiques.'),
  C('a3c-place-cellblock', 'BLOC CARCÉRAL', 'LIEUX', 'Grand volume à passerelles et lignes de fuite. Il devient une arène en profondeur inspirée du rythme des beat’em up arcade.'),
  C('a3c-place-mess', 'RÉFECTOIRE / ASSEMBLÉE', 'LIEUX', 'Espace collectif associé aux discussions, à la foi du groupe et aux préparatifs improvisés.'),
  C('a3c-place-service', 'GALERIES TECHNIQUES', 'LIEUX', 'Réseau étroit de tunnels, conduits, vapeur et angles morts. La vue revient en 2D stricte pour conserver la lisibilité des pièges.'),
  C('a3c-place-waste', 'CUVE À DÉCHETS', 'LIEUX', 'Secteur essentiel à la branche Assembly Cut : capture temporaire puis rupture de confinement.'),
  C('a3c-place-communications', 'COMMUNICATIONS', 'LIEUX', 'Poste stratégique reliant Fiorina à la Compagnie et déclenchant les ordres de récupération selon la continuité choisie.'),
  C('a3c-place-foundry', 'FONDERIE', 'LIEUX', 'Grand espace industriel multi-plan utilisé pour rabattre le Runner vers le moule.'),
  C('a3c-place-mold', 'COULOIR DU MOULE', 'LIEUX', 'Zone 2D latérale précise : pistons, plomb, eau et position du Runner doivent être cohérents avant le choc thermique.'),
  C('a3c-place-furnace', 'FOUR PRINCIPAL', 'LIEUX', 'Espace final à forte contrainte thermique, utilisé pour la confrontation avec la Compagnie et la conclusion de l’archive.'),
  C('a3c-place-patna', 'ZONE PATNA', 'LIEUX', 'Plateforme d’arrivée de l’équipe de récupération. En profondeur, les silhouettes et axes de confrontation restent lisibles sans figer le joueur.'),

  C('a3c-char-ripley', 'ELLEN RIPLEY', 'PERSONNAGES', 'Sujet central de la reconstruction. La campagne suit sa survie, sa découverte médicale, son rôle de leurre et sa décision finale.'),
  C('a3c-char-dillon', 'DILLON', 'PERSONNAGES', 'Figure d’autorité morale parmi les détenus. Il peut rallier le groupe et participe au rabattage final.'),
  C('a3c-char-clemens', 'CLEMONS', 'PERSONNAGES', 'Médecin de Fiorina. Son rôle relie l’accueil de Ripley, l’infirmerie et la découverte des menaces présentes sur le site.'),
  C('a3c-char-andrews', 'ANDREWS', 'PERSONNAGES', 'Responsable administratif de l’établissement. Sa disparition marque l’effondrement du contrôle institutionnel.'),
  C('a3c-char-aaron', 'AARON', 'PERSONNAGES', 'Adjoint d’Andrews. La reconstruction conserve sa présence jusqu’à la confrontation finale avec la Compagnie.'),
  C('a3c-char-morse', 'MORSE', 'PERSONNAGES', 'Détenu survivant et témoin final de plusieurs variantes de l’archive.'),
  C('a3c-char-golic', 'GOLIC', 'PERSONNAGES', 'Détenu associé à l’expédition Boggs/Rains et, dans l’Assembly Cut, à la libération du Runner capturé.'),
  C('a3c-char-junior', 'JUNIOR', 'PERSONNAGES', 'Détenu lié à la capture du Runner dans la branche Assembly Cut.'),
  C('a3c-char-murphy', 'MURPHY', 'PERSONNAGES', 'Sa séquence dans le conduit et le ventilateur est reproduite comme beat environnemental physique.'),
  C('a3c-char-boggs', 'BOGGS', 'PERSONNAGES', 'Membre de l’expédition souterraine avec Rains et Golic.'),
  C('a3c-char-rains', 'RAINS', 'PERSONNAGES', 'Membre de l’expédition souterraine ; sa disparition nourrit la montée de la peur dans les galeries.'),
  C('a3c-char-bishop', 'BISHOP ENDOMMAGÉ', 'PERSONNAGES', 'Le synthétique endommagé sert de relais forensique entre les données EEV et la reconstruction des événements du Sulaco.'),
  C('a3c-char-bishop2', 'BISHOP II', 'PERSONNAGES', 'Représentant de la récupération finale. Le codex le traite comme personnage de la scène Patna, sans interprétation spéculative.'),
  C('a3c-char-prisoners', 'DÉTENUS DE FIORINA', 'PERSONNAGES', 'Le DLC suit stress, fatigue, courage, panique, entraide, blessures et affectations de plusieurs détenus nommés.'),
  C('a3c-char-company-team', 'ÉQUIPE DE RÉCUPÉRATION', 'PERSONNAGES', 'Groupe de la Compagnie arrivant au terme de l’archive avec une priorité de conservation biologique.'),
  C('a3c-char-host-variant', 'HÔTE DU RUNNER', 'PERSONNAGES', 'Le profil Cinéma utilise l’hôte canin, tandis que l’Assembly Cut repose sur l’hôte bovin. Les deux variantes sont conservées séparément.'),

  C('a3c-xeno-runner', 'RUNNER', 'XÉNOBIOLOGIE', 'Prédateur quadrupède rapide adapté à l’architecture de Fiorina. Il demeure l’unique xénomorphe actif de la reconstruction.'),
  C('a3c-xeno-runner-hunt', 'COMPORTEMENT DE CHASSE', 'XÉNOBIOLOGIE', 'Le Hunter Director mémorise routes, outils répétés, vitesse du joueur, lumière, vapeur et plans de profondeur.'),
  C('a3c-xeno-depth', 'CHASSE EN PROFONDEUR', 'XÉNOBIOLOGIE', 'En vue profondeur, le Runner peut changer de plan. Une attaque de contact n’atteint le joueur que lorsqu’ils occupent le même plan.'),
  C('a3c-xeno-perches', 'PERCHOIRS', 'XÉNOBIOLOGIE', 'Trois positions hautes permettent au Runner de quitter brièvement le champ puis de réentrer sans duplication.'),
  C('a3c-xeno-queen-embryo', 'EMBRYON ROYAL', 'XÉNOBIOLOGIE', 'La révélation médicale intervient après l’échec du plan incendiaire dans la chronologie V90 corrigée.'),
  C('a3c-xeno-super-facehugger', 'FACEHUGGER SPÉCIAL', 'XÉNOBIOLOGIE', 'Le dossier MIRE conserve la notion d’un vecteur d’implantation particulier associée aux variantes étendues de l’archive.'),
  C('a3c-xeno-thermal', 'CHOC THERMIQUE', 'XÉNOBIOLOGIE', 'Le Runner ne peut être neutralisé par des armes conventionnelles dans cette archive. Le piège final combine plomb fondu et refroidissement brutal.'),
  C('a3c-xeno-spared-ripley', 'ÉPARGNE DE RIPLEY', 'XÉNOBIOLOGIE', 'Le comportement du Runner envers Ripley est reproduit comme événement de gameplay sans transformer la créature en allié.'),

  C('a3c-event-crash', 'CHUTE DE L’EEV', 'ÉVÉNEMENTS', 'Point de départ de la reconstruction sur Fiorina 161.'),
  C('a3c-event-funeral', 'CÉRÉMONIE FUNÈBRE', 'ÉVÉNEMENTS', 'Beat historique non bloquant synchronisé avec les premières manifestations de la menace.'),
  C('a3c-event-first-blood', 'PREMIÈRE CHASSE', 'ÉVÉNEMENTS', 'Le Runner commence à transformer les espaces industriels en terrain de chasse.'),
  C('a3c-event-bishop', 'INTERROGATION DE BISHOP', 'ÉVÉNEMENTS', 'La chaîne forensique lie l’épave EEV, le flight recorder et Bishop endommagé.'),
  C('a3c-event-fire-plan', 'PLAN INCENDIAIRE', 'ÉVÉNEMENTS', 'Quatre manifolds doivent être préparés avant la propagation du feu dans six fronts.'),
  C('a3c-event-fire-failure', 'ÉCHEC DU PLAN', 'ÉVÉNEMENTS', 'L’accident incendiaire disperse le groupe et impose le retour au scanner EEV.'),
  C('a3c-event-assembly-capture', 'CAPTURE ASSEMBLY', 'ÉVÉNEMENTS', 'Dans le profil Assembly, le Runner peut être enfermé dans la cuve à déchets avant la communication avec la Compagnie.'),
  C('a3c-event-golic-release', 'LIBÉRATION PAR GOLIC', 'ÉVÉNEMENTS', 'La libération du Runner ne peut se produire qu’après la chaîne de communications requise par l’Assembly Cut.'),
  C('a3c-event-final-bait', 'DERNIER RABATTAGE', 'ÉVÉNEMENTS', 'Le dernier bait-and-chase combine Hunter Director, trois reroutages et trois pistons avant le moule.'),
  C('a3c-event-lead', 'PLOMB FONDU', 'ÉVÉNEMENTS', 'Le piège de plomb n’est valide que si l’installation est préparée et le Runner correctement positionné.'),
  C('a3c-event-patna', 'ARRIVÉE PATNA', 'ÉVÉNEMENTS', 'La confrontation finale est découpée en pourparlers, cage de récupération, charge d’Aaron, blessure de Morse et confirmation du témoin.'),
  C('a3c-event-ending-variants', 'VARIANTES DE FINALE', 'ÉVÉNEMENTS', 'La mise en scène finale distingue le montage cinéma et les variantes étendues sans les fusionner.'),

  C('a3c-system-quinitricetyline', 'QUINITRICETYLINE', 'SYSTÈMES', 'Composant du plan incendiaire géré par quatre points de préparation et une propagation contrôlée.'),
  C('a3c-system-lead-mold', 'MOULE DE PLOMB', 'SYSTÈMES', 'Installation finale exigeant alimentation, positionnement du Runner et préparation de la matière.'),
  C('a3c-system-sprinkler', 'RÉSEAU D’EAU', 'SYSTÈMES', 'Le réseau doit être pressurisé avant le choc thermique.'),
  C('a3c-system-pistons', 'PISTONS INDUSTRIELS', 'SYSTÈMES', 'Trois pistons doivent être cyclés dans l’ordre pour rabattre le Runner vers le moule.'),
  C('a3c-system-shutters', 'VOLETS D’URGENCE', 'SYSTÈMES', 'Les volets peuvent contenir temporairement le Runner, mais celui-ci apprend à les forcer si le joueur répète trop la tactique.'),
  C('a3c-system-steam', 'PURGES DE VAPEUR', 'SYSTÈMES', 'La vapeur masque le bruit mais réduit la visibilité ; l’habituation du Runner diminue l’efficacité des abus.'),
  C('a3c-system-flares', 'FLARES', 'SYSTÈMES', 'Les leurres sont physiques, consommables et de moins en moins efficaces lorsqu’ils sont utilisés de façon répétitive.'),
  C('a3c-system-audio', 'AUDIO OPTIONNEL', 'SYSTÈMES', 'Les huit cues V96 utilisent un vrai fichier s’il existe ; sinon le jeu reste entièrement fonctionnel grâce aux fallbacks.'),
  C('a3c-system-mire-score', 'SCORE MIRE', 'SYSTÈMES', 'Le score récompense exploration, fidélité de la reconstruction, preuves, gestion des détenus, chasse propre et maîtrise du mode hybride.'),
  C('a3c-system-save', 'REPRISE D’ARCHIVE', 'SYSTÈMES', 'La sauvegarde conserve montage, Runner, détenus, pièges, microclimats, codex et désormais le plan de profondeur actif.')
]);

export const ALIEN3_DLC_CODEX_TERMINALS_V97 = deepFreeze([
  { id: 'a3c-terminal-eev', label: 'CODEX DLC · ARRIVÉE', x: 610, y: 438, w: 66, h: 72, lane: 1, batch: 'arrival' },
  { id: 'a3c-terminal-prison', label: 'CODEX DLC · FIORINA', x: 2290, y: 438, w: 66, h: 72, lane: 2, batch: 'prison' },
  { id: 'a3c-terminal-service', label: 'CODEX DLC · CHASSE', x: 3460, y: 438, w: 66, h: 72, lane: 1, batch: 'hunt' },
  { id: 'a3c-terminal-foundry', label: 'CODEX DLC · FONDERIE', x: 4320, y: 438, w: 66, h: 72, lane: 1, batch: 'foundry' },
  { id: 'a3c-terminal-patna', label: 'CODEX DLC · FINALE', x: 5540, y: 438, w: 66, h: 72, lane: 0, batch: 'finale' }
]);

const CODEX_BATCHES = deepFreeze({
  arrival: ALIEN3_DLC_CODEX_V97.slice(0, 18).map((entry) => entry.id),
  prison: ALIEN3_DLC_CODEX_V97.slice(18, 34).map((entry) => entry.id),
  hunt: ALIEN3_DLC_CODEX_V97.slice(34, 46).map((entry) => entry.id),
  foundry: ALIEN3_DLC_CODEX_V97.slice(46, 58).map((entry) => entry.id),
  finale: ALIEN3_DLC_CODEX_V97.slice(58).map((entry) => entry.id)
});
export const ALIEN3_DLC_CODEX_BATCHES_V97 = CODEX_BATCHES;

export const ALIEN3_V97_EVIDENCE_IDS = deepFreeze([
  'hybrid-runtime-ready', 'depth-view-entered', 'side-view-entered', 'lane-rear-used', 'lane-mid-used', 'lane-front-used',
  'runner-lane-evasion', 'runner-lane-contact', 'automatic-view-transition', 'all-hybrid-sectors',
  'codex-arrival', 'codex-prison', 'codex-hunt', 'codex-foundry', 'codex-finale',
  'codex-quarter', 'codex-half', 'codex-complete', 'balanced-hybrid-time', 'perfect-hybrid-archive'
]);

const codexIds = new Set(ALIEN3_DLC_CODEX_V97.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V97_EVIDENCE_IDS);
const sectorIds = new Set(ALIEN3_HYBRID_SECTORS_V97.map((entry) => entry.id));
const terminalIds = new Set(ALIEN3_DLC_CODEX_TERMINALS_V97.map((entry) => entry.id));

export function createAlien3StateV97() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V97,
    hybrid: {
      currentSectorId: 'hybrid-storm-yard', mode: 'depth', playerLane: 1, runnerLane: 1,
      visitedSectors: [], depthSeconds: 0, sideSeconds: 0, transitions: 0, laneChanges: 0,
      laneInputLatch: 0, transitionClock: 1.2, runnerLaneClock: 1.4, runnerLaneTelegraph: 0,
      lastTransitionReason: 'insertion', laneEvades: 0, laneContacts: 0
    },
    dlcCodex: {
      unlocked: [], viewed: [], currentId: null, openClock: 0, terminalsRead: [], pagesOpened: 0,
      lastTerminalId: null, category: 'ARCHIVE', complete: false
    },
    evidenceRecovered: [],
    perfectArchive: { inheritedV96: false, sectorsComplete: false, lanesComplete: false, balanceComplete: false, codexComplete: false, runnerDepthComplete: false, perfect: false },
    telemetry: { depthEntries: 0, sideEntries: 0, autoTransitions: 0, laneShifts: 0, runnerLaneShifts: 0, codexUnlocks: 0, codexTerminalUses: 0 },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV97(raw) {
  const fallback = createAlien3StateV97();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V97) return fallback;
  const hybrid = raw.hybrid && typeof raw.hybrid === 'object' ? raw.hybrid : {};
  const codex = raw.dlcCodex && typeof raw.dlcCodex === 'object' ? raw.dlcCodex : {};
  const perfect = raw.perfectArchive && typeof raw.perfectArchive === 'object' ? raw.perfectArchive : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  const lane = Math.round(clamp(hybrid.playerLane, 0, 2));
  const runnerLane = Math.round(clamp(hybrid.runnerLane, 0, 2));
  return {
    ...fallback,
    hybrid: {
      currentSectorId: sectorIds.has(hybrid.currentSectorId) ? hybrid.currentSectorId : fallback.hybrid.currentSectorId,
      mode: hybrid.mode === 'side' ? 'side' : 'depth', playerLane: lane, runnerLane,
      visitedSectors: unique(hybrid.visitedSectors, sectorIds, ALIEN3_HYBRID_SECTORS_V97.length),
      depthSeconds: clamp(hybrid.depthSeconds, 0, 999999), sideSeconds: clamp(hybrid.sideSeconds, 0, 999999),
      transitions: Math.round(clamp(hybrid.transitions, 0, 9999)), laneChanges: Math.round(clamp(hybrid.laneChanges, 0, 9999)),
      laneInputLatch: Math.round(clamp(hybrid.laneInputLatch, -1, 1)), transitionClock: clamp(hybrid.transitionClock, 0, 10),
      runnerLaneClock: clamp(hybrid.runnerLaneClock, 0, 30), runnerLaneTelegraph: clamp(hybrid.runnerLaneTelegraph, 0, 10),
      lastTransitionReason: typeof hybrid.lastTransitionReason === 'string' ? hybrid.lastTransitionReason.slice(0, 80) : 'resume',
      laneEvades: Math.round(clamp(hybrid.laneEvades, 0, 9999)), laneContacts: Math.round(clamp(hybrid.laneContacts, 0, 9999))
    },
    dlcCodex: {
      unlocked: unique(codex.unlocked, codexIds, ALIEN3_DLC_CODEX_V97.length),
      viewed: unique(codex.viewed, codexIds, ALIEN3_DLC_CODEX_V97.length),
      currentId: codexIds.has(codex.currentId) ? codex.currentId : null,
      openClock: clamp(codex.openClock, 0, 120), terminalsRead: unique(codex.terminalsRead, terminalIds, ALIEN3_DLC_CODEX_TERMINALS_V97.length),
      pagesOpened: Math.round(clamp(codex.pagesOpened, 0, 99999)), lastTerminalId: terminalIds.has(codex.lastTerminalId) ? codex.lastTerminalId : null,
      category: typeof codex.category === 'string' ? codex.category.slice(0, 32) : 'ARCHIVE', complete: bool(codex.complete)
    },
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds, ALIEN3_V97_EVIDENCE_IDS.length),
    perfectArchive: {
      inheritedV96: bool(perfect.inheritedV96), sectorsComplete: bool(perfect.sectorsComplete), lanesComplete: bool(perfect.lanesComplete),
      balanceComplete: bool(perfect.balanceComplete), codexComplete: bool(perfect.codexComplete), runnerDepthComplete: bool(perfect.runnerDepthComplete), perfect: bool(perfect.perfect)
    },
    telemetry: {
      depthEntries: Math.round(clamp(telemetry.depthEntries, 0, 9999)), sideEntries: Math.round(clamp(telemetry.sideEntries, 0, 9999)),
      autoTransitions: Math.round(clamp(telemetry.autoTransitions, 0, 9999)), laneShifts: Math.round(clamp(telemetry.laneShifts, 0, 9999)),
      runnerLaneShifts: Math.round(clamp(telemetry.runnerLaneShifts, 0, 9999)), codexUnlocks: Math.round(clamp(telemetry.codexUnlocks, 0, 9999)),
      codexTerminalUses: Math.round(clamp(telemetry.codexTerminalUses, 0, 9999))
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 128)
      : []
  };
}

export function alien3HybridSectorV97(x = 0) {
  return ALIEN3_HYBRID_SECTORS_V97.find((entry) => Number(x) >= entry.x0 && Number(x) < entry.x1) || ALIEN3_HYBRID_SECTORS_V97.at(-1);
}
export function alien3DepthLaneV97(index = 1) { return ALIEN3_DEPTH_LANES_V97[Math.round(clamp(index, 0, 2))] || ALIEN3_DEPTH_LANES_V97[1]; }
export function alien3DlcCodexEntryV97(id) { return ALIEN3_DLC_CODEX_V97.find((entry) => entry.id === id) || null; }
export function alien3DlcCodexBatchV97(id) { return [...(CODEX_BATCHES[id] || [])]; }

export function alien3V97Grade({ gradeV96 = 'D', evidence = 0, sectors = 0, lanes = 0, codex = 0, transitions = 0, laneEvades = 0, balanced = false, perfect = false } = {}) {
  const base = { 'S+++++++': 210, 'S++++++': 196, 'S+++++': 182, 'S++++': 170, 'S+++': 158, 'S++': 146, 'S+': 134, S: 120, A: 104, B: 88, C: 72, D: 56 }[gradeV96] || 56;
  const score = base
    + clamp(evidence / ALIEN3_V97_EVIDENCE_IDS.length, 0, 1) * 8
    + clamp(sectors / ALIEN3_HYBRID_SECTORS_V97.length, 0, 1) * 6
    + clamp(lanes / ALIEN3_DEPTH_LANES_V97.length, 0, 1) * 4
    + clamp(codex / ALIEN3_DLC_CODEX_V97.length, 0, 1) * 8
    + clamp(transitions / 8, 0, 1) * 3
    + clamp(laneEvades / 3, 0, 1) * 3
    + (balanced ? 4 : 0) + (perfect ? 6 : 0);
  return score >= 246 ? 'S++++++++'
    : score >= 230 ? 'S+++++++'
      : score >= 214 ? 'S++++++'
        : score >= 198 ? 'S+++++'
          : score >= 184 ? 'S++++'
            : score >= 170 ? 'S+++'
              : score >= 156 ? 'S++'
                : score >= 142 ? 'S+'
                  : score >= 128 ? 'S'
                    : score >= 112 ? 'A'
                      : score >= 96 ? 'B'
                        : score >= 80 ? 'C' : 'D';
}

export function validateAlien3DlcV97() {
  const failures = [];
  const { nodes, edges, routes, zones, dimensions } = ALIEN3_FIORINA_TEMPLATE_V97;
  if (nodes.length !== 72) failures.push(`node count ${nodes.length} != 72`);
  if (edges.length !== 119) failures.push(`edge count ${edges.length} != 119`);
  if (routes.length !== 4) failures.push(`route count ${routes.length} != 4`);
  if (zones.length !== 6) failures.push(`zone count ${zones.length} != 6`);
  if (ALIEN3_HYBRID_SECTORS_V97.length !== 9) failures.push('hybrid sector count mismatch');
  if (ALIEN3_DEPTH_LANES_V97.length !== 3) failures.push('depth lane count mismatch');
  if (ALIEN3_DLC_CODEX_TERMINALS_V97.length !== 5) failures.push('codex terminal count mismatch');
  if (ALIEN3_DLC_CODEX_V97.length !== 66) failures.push(`dedicated codex count ${ALIEN3_DLC_CODEX_V97.length} != 66`);
  if (ALIEN3_V97_EVIDENCE_IDS.length !== 20) failures.push(`evidence count ${ALIEN3_V97_EVIDENCE_IDS.length} != 20`);
  if (new Set(ALIEN3_DLC_CODEX_V97.map((entry) => entry.id)).size !== ALIEN3_DLC_CODEX_V97.length) failures.push('duplicate dedicated codex ids');
  if (new Set(ALIEN3_V97_EVIDENCE_IDS).size !== ALIEN3_V97_EVIDENCE_IDS.length) failures.push('duplicate evidence ids');
  if (new Set(ALIEN3_HYBRID_SECTORS_V97.map((entry) => entry.id)).size !== ALIEN3_HYBRID_SECTORS_V97.length) failures.push('duplicate hybrid sector ids');
  if (new Set(ALIEN3_DLC_CODEX_TERMINALS_V97.map((entry) => entry.id)).size !== ALIEN3_DLC_CODEX_TERMINALS_V97.length) failures.push('duplicate codex terminal ids');
  const sectors = [...ALIEN3_HYBRID_SECTORS_V97].sort((a, b) => a.x0 - b.x0);
  if (sectors[0]?.x0 !== 0 || sectors.at(-1)?.x1 !== dimensions.width) failures.push('hybrid sectors do not cover full world width');
  for (let i = 1; i < sectors.length; i += 1) if (sectors[i - 1].x1 !== sectors[i].x0) failures.push(`hybrid gap/overlap ${sectors[i - 1].id}/${sectors[i].id}`);
  if (!sectors.some((entry) => entry.mode === 'depth') || !sectors.some((entry) => entry.mode === 'side')) failures.push('both hybrid modes are required');
  for (const terminal of ALIEN3_DLC_CODEX_TERMINALS_V97) {
    if (terminal.x < 0 || terminal.x > dimensions.width || terminal.lane < 0 || terminal.lane > 2) failures.push(`invalid codex terminal ${terminal.id}`);
    if (!CODEX_BATCHES[terminal.batch]?.length) failures.push(`empty codex batch ${terminal.id}`);
  }
  const batchCoverage = new Set(Object.values(CODEX_BATCHES).flat());
  if (batchCoverage.size !== ALIEN3_DLC_CODEX_V97.length) failures.push(`codex batches cover ${batchCoverage.size}/${ALIEN3_DLC_CODEX_V97.length}`);
  return {
    ok: failures.length === 0,
    failures,
    counts: { nodes: nodes.length, edges: edges.length, routes: routes.length, zones: zones.length, hybridSectors: ALIEN3_HYBRID_SECTORS_V97.length, depthLanes: ALIEN3_DEPTH_LANES_V97.length, dedicatedCodex: ALIEN3_DLC_CODEX_V97.length, codexTerminals: ALIEN3_DLC_CODEX_TERMINALS_V97.length, evidence: ALIEN3_V97_EVIDENCE_IDS.length }
  };
}
