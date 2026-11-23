// Developer tools (spec 012; shipped hidden, see scripts/build-dev-tools-v188.mjs): every entry of the hidden scene launcher.
// Entries are generated from the game's own registries (content.js campaigns, the hub
// decks, the Asphodèle rooms, the story cinematics, the dedicated levels' phases).
// An entry describes WHAT to open (`launch`) and the scene it must land on (`sceneId`);
// dev-fixtures-v188.js builds the save. An entry whose prerequisites cannot be produced
// without forging a runtime receipt is listed disabled with its reason (`blocked`).
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { HUB_DECKS } from '../src/hub-opening-v88.js';
import { ASPHODELE_ROOMS_V188 } from '../src/asphodele-hub-v188.js';
import { CINEMATICS_V188, CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';
import { COLONY_LEVEL_PHASES_V188 } from '../src/colony-mission-levels-v188.js';
import { STATION_LEVEL_PHASES_V188 } from '../src/station-mission-levels-v188.js';
import { ACT5_NAMES_EN_V188 } from '../src/story-act5-v188.js';
import { colonyCampaignNameV188 } from '../src/colony-missions-v188.js';
import { queensCampaignNameV188, QUEENS_ARC1_ORDER_V188, QUEENS_ARC2_ORDER_V188, QUEENS_ARC3_ORDER_V188, QUEENS_ARCS_V188, QUEENS_CHAPTER_IDS_V188,
  QUEENS_NAMES_EN_V188 } from '../src/side-campaign-queens-v188.js';
import { ASPHODELE_SIDE_NAMES_EN_V188, ASPHODELE_CONTRACT_NAMES_EN_V188 } from '../src/asphodele-missions-v188.js';
import { getArbiterMissionV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { DEV_PROLOGUE_STEPS_V188 } from './dev-fixtures-v188.js';

export const DEV_CATEGORIES_V188 = Object.freeze([
  { id: 'start', fr: 'Démarrage', en: 'Start' },
  { id: 'prologue', fr: 'Prologue', en: 'Prologue' },
  { id: 'hub-tantalus', fr: 'Hub · Tantalus', en: 'Hub · Tantalus' },
  { id: 'hub-asphodele', fr: 'Hub · Asphodèle', en: 'Hub · Asphodèle' },
  { id: 'main', fr: 'Campagne principale', en: 'Main campaign' },
  { id: 'endings', fr: 'Fins et épilogue', en: 'Endings and epilogue' },
  { id: 'colony', fr: 'Colonie · Port-Méridien', en: 'Colony · Port-Méridien' },
  { id: 'station', fr: 'Station · Asphodèle', en: 'Station · Asphodèle' },
  { id: 'queens', fr: 'Saison des Reines', en: 'Season of Queens' },
  { id: 'checkpoints', fr: 'Checkpoints de phase', en: 'Phase checkpoints' },
  { id: 'cinematics', fr: 'Cinématiques', en: 'Cinematics' },
  { id: 'special', fr: 'Opérations spéciales', en: 'Special operations' },
  { id: 'trials', fr: 'Xeno Trials et Bioforge', en: 'Xeno Trials and Bioforge' },
  { id: 'campaigns', fr: 'Toutes les campagnes', en: 'All campaigns' },
  { id: 'range', fr: 'Stand de tir', en: 'Shooting range' }
]);

const L = (fr, en = fr) => Object.freeze({ fr, en });
const campaignById = new Map(CAMPAIGNS.map(entry => [entry.id, entry]));
const worldName = id => WORLDS.find(world => world.id === id)?.name || id;
function campaignLabel(id) {
  const entry = campaignById.get(id), fr = entry?.name || id;
  const en = ACT5_NAMES_EN_V188[id] || ASPHODELE_SIDE_NAMES_EN_V188?.[id] || ASPHODELE_CONTRACT_NAMES_EN_V188?.[id]
    || (/^colony-/.test(id) ? colonyCampaignNameV188(id, 'en') : null) || (/^queens-/.test(id) ? queensCampaignNameV188(id, 'en') : null) || QUEENS_NAMES_EN_V188[id] || fr;
  return L(fr, en);
}
const entry = (id, category, label, launch, extra = {}) => Object.freeze({ id, category, label, launch: Object.freeze({ ...launch }),
  sceneId: extra.sceneId || sceneIdFor(launch), keywords: extra.keywords || '', blocked: extra.blocked || null });
function sceneIdFor(launch) {
  if (launch.kind === 'mission') return `mission:${launch.campaignId}${launch.phase ? `#${launch.phase.id}` : ''}`;
  if (launch.kind === 'hub') return launch.asphodele ? `asphodele:${launch.asphodele}` : `hub:${launch.hub?.roomId || 'saved'}`;
  if (launch.kind === 'view') return `view:${launch.view}`;
  if (launch.kind === 'cinematic') return `cinematic:${launch.cinematicId}`;
  return launch.kind;
}
const mission = (campaignId, recipe = {}) => ({ kind: 'mission', campaignId, ...recipe });

// —— Recipes: what must be behind the player for each story mission (bible §3 chronology). ——
const STATION_BEFORE = { 'station-s1': [], 'station-s2': ['station-s1'], 'station-s3': ['station-s1', 'station-s2'], 'station-s4': ['station-s1', 'station-s2', 'station-s3'] };
const COLONY_RECIPE = {
  'colony-c1': { milestone: 'act1' }, 'colony-c2': { milestone: 'act3' }, 'colony-c3': { milestone: 'act4' },
  'colony-c4': { milestone: 'act4', before: ['colony-c3'] }
};
function sideColonyRecipe(id) {
  if (id === 'colony-a-quai') return { milestone: 'act1', before: ['colony-c1'] };
  if (id === 'colony-a-converti') return { milestone: 'act4', before: ['colony-c3'] };
  return { milestone: 'act4', colonyTier: 'restored' };
}
const QUEENS_BASE = { milestone: 'complete', queens: 'arrived' };
// Arc 2 / Arc 3 (spec 011, second lot): the previous arcs finished, the Tantalus in the arc's orbit (dev-fixtures `queensArc`).
const QUEENS_ARC = arc => arc === 1 ? QUEENS_BASE : { ...QUEENS_BASE, queensArc: arc };
const QUEENS_DEBRIEFS = ['arc1-debrief', 'arc2-debrief'];
// What a side mission needs beyond its arc's first mission (§14.5): Rask let go with his case; Grue as an ally.
const QUEENS_SIDE_NEEDS = { 'queens-a-rask': { choices: { rask: 'release' } }, 'queens-a-grue': { before: ['station-a-grue'] } };

export function buildDevCatalogV188() {
  const list = [];
  const add = (...args) => list.push(entry(...args));
  // Start
  add('start-title', 'start', L('Écran titre (nouvelle partie)', 'Title screen (new game)'), { kind: 'title', base: 'default' }, { sceneId: 'title' });
  add('start-intro', 'start', L('Générique d’ouverture puis titre', 'Opening credit then title'), { kind: 'intro', base: 'default' }, { sceneId: 'intro' });
  add('start-creator', 'start', L('Création du personnage (CIN-00 puis dossier)', 'Player creation (CIN-00 then file)'), { kind: 'creator', base: 'default' }, { sceneId: 'creator' });
  // Prologue
  for (const step of DEV_PROLOGUE_STEPS_V188) add(`prologue-${step.id}`, 'prologue', L(step.fr, step.en), { kind: 'hub', base: 'prologue', step: step.id, ...(step.landRoom ? { landRoom: step.landRoom } : {}) },
    { sceneId: `prologue:${step.id}`, keywords: step.step });
  // Hub rooms (Tantalus)
  for (const [deck, definition] of HUB_DECKS.entries()) for (const room of definition.rooms) {
    add(`hub-${room.id}`, 'hub-tantalus', L(`Pont ${deck} · ${room.name}`, `Deck ${deck} · ${room.name}`),
      { kind: 'hub', milestone: 'act2', hub: { deck, roomId: room.id, positionX: Math.round(room.x), facing: 1 } }, { keywords: `${definition.id} ${room.id}` });
  }
  // Hub rooms (Asphodèle), with the record that opens each module.
  const ASPHODELE_OPEN = { 'asph-relay': { relay: true }, 'asph-memorial': { before: ['station-a-journaux'] }, 'asph-greenhouse': { before: ['station-a-hydro'] },
    'asph-market': { before: ['station-a-grue'] }, 'asph-repair': { before: ['station-c-pression'] }, 'asph-quarters': { milestone: 'colony', colonyTier: 'autonomous' } };
  for (const room of Object.values(ASPHODELE_ROOMS_V188)) {
    add(`asphodele-${room.id}`, 'hub-asphodele', L(`Asphodèle · ${room.name?.fr || room.name || room.id}`, `Asphodèle · ${room.name?.en || room.name || room.id}`),
      { kind: 'hub', milestone: 'stations', asphodele: room.id, ...(ASPHODELE_OPEN[room.id] || {}) }, { keywords: room.id });
  }
  // Main campaign (bible §5)
  const main = (id, label, launch, extra) => add(id, 'main', label, launch, extra);
  main('main-act2-qz18', L('Acte II · Le dernier relais (QZ-18)', 'Act II · The last relay (QZ-18)'), mission('special-archive-relay'));
  main('main-act1-qz17', L('Acte I · La cargaison fantôme (QZ-17)', 'Act I · The ghost cargo (QZ-17)'), mission('special-narrative-qz17', { milestone: 'act2' }));
  main('main-act3-convoy', L('Acte III · Corridor de feu (M577, manifeste à signer)', 'Act III · Corridor of fire (M577, manifest to sign)'), mission('special-apc-convoy', { milestone: 'act1' }));
  main('main-act3-c12', L('Acte III · La horde C-12', 'Act III · The C-12 horde'), mission('special-c12-horde', { milestone: 'act1', before: ['special-apc-convoy'] }));
  main('main-interlude-alert', L('Interlude · Quarantaine à bord (alerte)', 'Interlude · Quarantine aboard (alert)'),
    { kind: 'hub', milestone: 'act3', interlude: 'alert', hub: { deck: 2, roomId: 'quarantine', positionX: 760, facing: 1 } }, { sceneId: 'interlude:alert' });
  main('main-interlude-choice', L('Interlude · Choix : détruire ou capturer', 'Interlude · Choice: destroy or capture'),
    { kind: 'hub', milestone: 'act3', interlude: 'choice', hub: { deck: 2, roomId: 'quarantine', positionX: 760, facing: 1 } }, { sceneId: 'interlude:choice' });
  main('main-act4', L('Acte IV · Cocon noir', 'Act IV · Black cocoon'), mission('special-black-cocoon', { milestone: 'interlude' }));
  main('main-council', L('Acte V · Conseil de guerre (table tactique)', 'Act V · War council (tactical table)'), { kind: 'view', view: 'command', milestone: 'council' }, { sceneId: 'act5:council' });
  main('main-act5-last-run', L('Acte V · Course du convoi · Dernier départ', 'Act V · Convoy race · Last departure'), mission('act5-last-run', { milestone: 'act5-final' }));
  main('main-act5-depot-queen', L('Acte V · La Reine du dépôt', 'Act V · The Depot Queen'), mission('act5-depot-queen', { milestone: 'act5-final', before: ['act5-last-run'] }));
  main('main-act5-port-walls', L('Acte V · Les portes du port (C5 · La nuit des murs)', 'Act V · The port gates (C5 · Night of the walls)'), mission('act5-port-walls', { milestone: 'act5-final', before: ['act5-last-run', 'act5-depot-queen'] }));
  main('main-act5-evacuation', L('Acte V · L’évacuation (ligne « Céder »)', 'Act V · The evacuation ("Cede" line)'), mission('act5-evacuation', { milestone: 'act5-final', choices: { line: 'cede' }, before: ['act5-last-run', 'act5-depot-queen'] }));
  main('main-halloran-hearing', L('Acte V · Face-à-face Halloran au quai', 'Act V · Halloran hearing at the quay'), { kind: 'view', view: 'command', milestone: 'act5-done', act5Phase: 'audience' }, { sceneId: 'confrontation:act5-halloran-quay' });
  // Endings: one per final line (§5.7.1). « Transmettre » needs the Asphodèle relay online and five dossier pieces.
  const ENDING_LINES = [['relay-speaks', 'transmit', L('Fin · Le relais parle (Transmettre)', 'Ending · The relay speaks (Transmit)')],
    ['living-without-proof', 'hold', L('Fin · Les vivants, sans preuve (Tenir)', 'Ending · The living, without proof (Hold)')],
    ['freight-first', 'cede', L('Fin · Le fret d’abord (Céder)', 'Ending · Freight first (Cede)')]];
  for (const [ending, line, label] of ENDING_LINES) add(`ending-${ending}`, 'endings', label,
    { kind: 'view', view: 'command', milestone: 'act5-done', act5Phase: 'ending', choices: { line, relay: line === 'transmit' } }, { sceneId: `ending:${ending}` });
  add('ending-epilogue', 'endings', L('Épilogue à bord (après la fin)', 'Epilogue aboard (after the ending)'), { kind: 'hub', milestone: 'act5-done', act5Phase: 'epilogue', hub: { deck: 0, roomId: 'bridge', positionX: 900, facing: 1 } }, { sceneId: 'act5:epilogue' });
  add('ending-credits', 'endings', L('Générique de fin', 'End credits'), { kind: 'view', view: 'command', milestone: 'act5-done', act5Phase: 'credits' }, { sceneId: 'act5:credits' });
  add('ending-free-play', 'endings', L('Après le générique · jeu libre', 'After the credits · free play'), { kind: 'view', view: 'command', milestone: 'complete' }, { sceneId: 'act5:complete' });
  // Colony (§6)
  for (const id of ['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4']) add(`colony-${id.slice(7)}`, 'colony', campaignLabel(id), mission(id, COLONY_RECIPE[id]));
  add('colony-c5', 'colony', L('C5 · La nuit des murs (Acte V · Les portes du port)', 'C5 · Night of the walls (Act V · The port gates)'), mission('act5-port-walls', { milestone: 'act5-final', before: ['act5-last-run', 'act5-depot-queen'] }), { sceneId: 'mission:act5-port-walls' });
  add('colony-c4-decision', 'colony', L('C4 · Décision sur les convertis', 'C4 · Decision on the converts'), { kind: 'view', view: 'command', milestone: 'act4', before: ['colony-c3', 'colony-c4'], choices: { c4: false } }, { sceneId: 'colony:c4-decision' });
  for (const id of CAMPAIGNS.filter(c => /^colony-a-/.test(c.id)).map(c => c.id)) add(`colony-side-${id}`, 'colony', campaignLabel(id), mission(id, sideColonyRecipe(id)));
  for (const id of CAMPAIGNS.filter(c => /^colony-l-/.test(c.id)).map(c => c.id)) add(`colony-contract-${id}`, 'colony', campaignLabel(id), mission(id, { milestone: 'act4', colonyTier: 'restored' }));
  // Station (§7)
  add('station-intro', 'station', L('Station · Six heures de silence (intro, salle de briefing)', 'Station · Six hours of silence (intro, briefing room)'),
    { kind: 'hub', milestone: 'act2', choices: { stationIntro: false }, hub: { deck: 0, roomId: 'briefing', positionX: 1780, facing: 1 } }, { sceneId: 'station:intro' });
  for (const id of ['station-s1', 'station-s2', 'station-s3', 'station-s4']) add(`station-${id.slice(8)}`, 'station', campaignLabel(id), mission(id, { milestone: 'act2', before: STATION_BEFORE[id] }));
  add('station-cassius-choice', 'station', L('S2 · Décision CASSIUS', 'S2 · CASSIUS decision'), { kind: 'view', view: 'command', milestone: 'act2', before: ['station-s1', 'station-s2'], choices: { cassius: false } }, { sceneId: 'station:cassius-choice' });
  for (const id of CAMPAIGNS.filter(c => /^station-a-/.test(c.id)).map(c => c.id)) add(`station-side-${id}`, 'station', campaignLabel(id), mission(id, { milestone: 'stations' }));
  for (const id of CAMPAIGNS.filter(c => /^station-c-/.test(c.id)).map(c => c.id)) add(`station-contract-${id}`, 'station', campaignLabel(id), mission(id, { milestone: 'stations' }));
  // Saison des Reines (spec 011)
  add('queens-call', 'queens', L('Appel de Nacre-7 (à la table)', 'Nacre-7 call (at the table)'), { kind: 'view', view: 'command', milestone: 'complete', queens: 'call' }, { sceneId: 'queens:call' });
  add('queens-accepted', 'queens', L('Appel accepté · carte galactique', 'Call accepted · galaxy map'), { kind: 'view', view: 'galaxy', milestone: 'complete', queens: 'accepted' }, { sceneId: 'queens:accepted' });
  add('queens-travel', 'queens', L('Saut vers Nacre-7 en préparation', 'Jump to Nacre-7 charging'), { kind: 'view', view: 'galaxy', milestone: 'complete', queens: 'travel' }, { sceneId: 'queens:travel' });
  add('queens-arrival', 'queens', L('Arrivée en orbite de Nacre-7', 'Arrival in Nacre-7 orbit'), { kind: 'view', view: 'command', ...QUEENS_BASE }, { sceneId: 'queens:arrived' });
  for (const arc of QUEENS_ARCS_V188) {
    const recipe = QUEENS_ARC(arc.arc), world = worldName(arc.worldId);
    if (arc.arc > 1) add(`queens-arc${arc.arc}-arrival`, 'queens', L(`Arc ${arc.arc} · Arrivée en orbite de ${world}`, `Arc ${arc.arc} · Arrival in ${world} orbit`),
      { kind: 'view', view: 'command', ...recipe }, { sceneId: `queens:arc${arc.arc}-arrived` });
    // Story line in order (the reused chapters in their place), then the side missions and local contracts of the arc.
    for (const [index, id] of arc.order.entries()) add(`queens-arc${arc.arc}-${id}`, 'queens', campaignLabel(id), mission(id, { ...recipe, queensBefore: arc.order.slice(0, index) }));
    for (const item of [...arc.sides, ...arc.contracts]) add(`queens-side-${item.id}`, 'queens', campaignLabel(item.id),
      mission(item.id, { ...recipe, queensBefore: [arc.order[0]], ...(QUEENS_SIDE_NEEDS[item.id] || {}) }));
    if (arc.arc === 1) {
      add('queens-rask-choice', 'queens', L('1.5 · Choix de l’œuf de Rask', '1.5 · Rask egg choice'), { kind: 'view', view: 'command', ...QUEENS_BASE, queensBefore: [...QUEENS_ARC1_ORDER_V188], choices: { rask: false } }, { sceneId: 'queens:rask-choice' });
      add('queens-arc1-debrief', 'queens', L('Arc 1 · Compte rendu (route d’Echo Basin ouverte)', 'Arc 1 · Debrief (route to Echo Basin open)'), { kind: 'view', view: 'command', ...QUEENS_BASE, queensBefore: [...QUEENS_ARC1_ORDER_V188] }, { sceneId: 'queens:arc1-debrief' });
    }
  }
  add('queens-arc2-debrief', 'queens', L('Arc 2 · Compte rendu (TR-0 révélé)', 'Arc 2 · Debrief (TR-0 revealed)'),
    { kind: 'view', view: 'command', ...QUEENS_ARC(2), queensBefore: [...QUEENS_ARC2_ORDER_V188], queensSeen: ['arc1-debrief'] }, { sceneId: 'queens:arc2-debrief' });
  add('queens-tr0-map', 'queens', L('Arc 2 terminé · TR-0 sur la carte galactique', 'Arc 2 over · TR-0 on the galaxy map'),
    { kind: 'view', view: 'galaxy', ...QUEENS_ARC(2), queensBefore: [...QUEENS_ARC2_ORDER_V188], queensSeen: QUEENS_DEBRIEFS }, { sceneId: 'queens:tr0-revealed' });
  add('queens-crew-quests', 'queens', L('Quêtes du Tantalus liées (Doyle, Orlov, Harlow) · après l’arc 2', 'Linked Tantalus quests (Doyle, Orlov, Harlow) · after Arc 2'),
    { kind: 'view', view: 'command', ...QUEENS_ARC(2), queensBefore: [...QUEENS_ARC2_ORDER_V188], queensSeen: QUEENS_DEBRIEFS }, { sceneId: 'queens:crew-quests', keywords: 'ship-q-doyle ship-q-orlov ship-q-harlow' });
  add('queens-egg-crisis', 'queens', L('Arc 3 · Œuf saisi : crise à bord (pont de quarantaine)', 'Arc 3 · Seized egg: crisis aboard (quarantine deck)'),
    { kind: 'hub', ...QUEENS_ARC(3), choices: { rask: 'seize' }, queensEgg: 'alert', hub: { deck: 2, roomId: 'quarantine', positionX: 760, facing: 1 } }, { sceneId: 'queens:egg-crisis' });
  add('queens-egg-after', 'queens', L('Arc 3 · Œuf saisi : après la crise (table)', 'Arc 3 · Seized egg: after the crisis (table)'),
    { kind: 'view', view: 'command', ...QUEENS_ARC(3), choices: { rask: 'seize' }, queensSeen: [...QUEENS_DEBRIEFS, 'tr0-arrival', 'egg-crisis-alert'] }, { sceneId: 'queens:egg-after' });
  add('queens-specimen-choice', 'queens', L('Arc 3 · Choix du Praetorian vivant (Inez ou BISHOP-9)', 'Arc 3 · Live Praetorian choice (Inez or BISHOP-9)'),
    { kind: 'view', view: 'command', ...QUEENS_ARC(3), queensBefore: ['queens-3-1-peau', 'queens-a-echantillon'], choices: { specimen: false }, queensSeen: QUEENS_DEBRIEFS }, { sceneId: 'queens:specimen-choice' });
  for (const [choice, label] of [['inez', L('Fin de campagne · Praetorian confié à Inez', 'Campaign ending · Praetorian given to Inez')], ['bishop', L('Fin de campagne · Praetorian confié à BISHOP-9', 'Campaign ending · Praetorian given to BISHOP-9')]])
    add(`queens-ending-${choice}`, 'queens', label, { kind: 'view', view: 'command', ...QUEENS_ARC(3), queensBefore: ['queens-3-1-peau', 'queens-a-echantillon', ...QUEENS_ARC3_ORDER_V188.slice(1)],
      choices: { specimen: choice }, queensSeen: QUEENS_DEBRIEFS }, { sceneId: `queens:ending-${choice}` });
  add('queens-ending-egg', 'queens', L('Fin de campagne · œuf saisi, équipe évacuée pendant la crise', 'Campaign ending · seized egg, team extracted during the crisis'),
    { kind: 'view', view: 'command', ...QUEENS_ARC(3), choices: { rask: 'seize' }, queensEgg: 'extracted', queensBefore: [...QUEENS_ARC3_ORDER_V188], queensSeen: QUEENS_DEBRIEFS }, { sceneId: 'queens:ending-egg' });
  // Phase checkpoints of the dedicated levels (one checkpoint per phase)
  for (const [table, recipeFor] of [[COLONY_LEVEL_PHASES_V188, id => COLONY_RECIPE[id]], [STATION_LEVEL_PHASES_V188, id => ({ milestone: 'act2', before: STATION_BEFORE[id] })]]) {
    for (const [campaignId, phases] of Object.entries(table)) for (const [index, phase] of phases.entries()) {
      const system = campaignId.startsWith('colony-') ? 'colony' : 'station';
      add(`checkpoint-${campaignId}-${phase.id}`, 'checkpoints', L(`${campaignLabel(campaignId).fr} · ${phase.label.fr}`, `${campaignLabel(campaignId).en} · ${phase.label.en}`),
        mission(campaignId, { ...recipeFor(campaignId), phase: { system, index, id: phase.id } }));
    }
  }
  // Cinematics by id (CIN-xx, CQ-xx), replayed without recording them as seen.
  for (const id of CINEMATIC_IDS_V188) {
    const late = /^cin-(?:6\d|7\d|9\d)/.test(id), queens = /^cin-cq-/.test(id);
    add(`cinematic-${id}`, 'cinematics', L(`${id.toUpperCase()} · ${CINEMATICS_V188[id].title?.fr || CINEMATICS_V188[id].titleFr || ''}`.trim(), `${id.toUpperCase()} · ${CINEMATICS_V188[id].title?.en || ''}`.trim()),
      { kind: 'cinematic', cinematicId: id, ...(late || queens ? { milestone: 'act5-done' } : { milestone: 'act2' }) }, { keywords: id });
  }
  // Special operations (V131 and earlier), outside the chapters already listed.
  const listed = new Set(['special-archive-relay', 'special-narrative-qz17', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon', ...QUEENS_CHAPTER_IDS_V188]);
  for (const item of CAMPAIGNS.filter(c => /^special-/.test(c.id) && !listed.has(c.id))) {
    const arbiter = getArbiterMissionV190(item.id), first = item.id === 'special-arbiter-01-freight';
    add(`special-${item.id}`, 'special', campaignLabel(item.id), mission(item.id, { worldId: item.worldId }),
      { blocked: arbiter && !first ? 'ARBITER : le retour précédent doit être archivé par le runtime (reçu non falsifiable)' : null });
  }
  // Xeno Trials, Bioforge
  add('trials-xeno', 'trials', L('Xeno Trials (salle des épreuves)', 'Xeno Trials (trials hall)'), { kind: 'view', view: 'xenotrials', milestone: 'act2' });
  add('trials-bioforge', 'trials', L('Bioforge', 'Bioforge'), { kind: 'view', view: 'bioforge', milestone: 'act2' });
  // Every other campaign of content.js (search / filter by mode and world).
  const story = /^(?:special-|station-|colony-|queens-|act5-)/;
  for (const item of CAMPAIGNS.filter(c => !story.test(c.id))) add(`campaign-${item.id}`, 'campaigns', L(`${item.name} · ${worldName(item.worldId)}`),
    mission(item.id, { worldId: item.worldId, ...(/^orig-asphodele-/.test(item.id) ? { milestone: 'stations' } : {}) }), { keywords: `${item.mode} ${item.worldId} ${item.objective || ''}` });
  // Shooting range
  add('range', 'range', L('Stand de tir (armes, équipement, escouade, cibles)', 'Shooting range (weapons, equipment, squad, targets)'),
    { kind: 'range', milestone: 'act2', campaignId: DEV_RANGE_CAMPAIGN_V188 }, { sceneId: 'range' });
  return Object.freeze(list);
}

/** The range runs on a normal FRONTIER mission so the squad doctrine (V132) and every mixin are live. */
export const DEV_RANGE_CAMPAIGN_V188 = (CAMPAIGNS.find(c => c.mode === 'FRONTIER' && c.worldId === 'world-05-lethe' && !/^(?:special-|station-|colony-|queens-|act5-|orig-)/.test(c.id))
  || CAMPAIGNS.find(c => c.mode === 'FRONTIER' && !/^(?:special-|station-|colony-|queens-|act5-)/.test(c.id))).id;

/** The scene the dev session reports once landed (`__ATF_DEV_V188__.landed`) for a launch and its built save.
 * Story states (decisions, endings, hearings) land on the view or room that opens them. */
export function expectedLandedV188(launch, save = null) {
  if (launch.kind === 'mission') return `mission:${launch.campaignId}${launch.phase ? `#${launch.phase.id}` : ''}`;
  if (launch.kind === 'hub') return launch.asphodele ? `asphodele:${launch.asphodele}` : `hub:${launch.landRoom || launch.hub?.roomId || save?.hub?.roomId || 'unknown'}`;
  if (launch.kind === 'view') return `view:${launch.view}`;
  if (launch.kind === 'cinematic') return `cinematic:${launch.cinematicId}`;
  return launch.kind; // title, intro, creator, range
}

/** Search over label (FR/EN), id and keywords; `category` filters. */
export function filterDevCatalogV188(entries, { query = '', category = '' } = {}) {
  const words = String(query).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').split(/\s+/).filter(Boolean);
  return entries.filter(item => (!category || item.category === category) && words.every(word =>
    `${item.id} ${item.label.fr} ${item.label.en} ${item.keywords}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(word)));
}
