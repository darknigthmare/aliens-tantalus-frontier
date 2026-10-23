import { restoreMissionInsertionV62 } from './mission-insertion-v62.js';
import { APC_CONVOY_CAMPAIGN_V121, validateApcConvoyStateV121 } from './apc-convoy-state-v121.js';

// Original project dialogue. The mission rules, timing and M577 catalog identity
// remain owned by the existing convoy, not by these transmissions.
export const CONVOY_STORY_ID_V161 = 'lethe-corridor-return';
export const CONVOY_STORY_PROTOCOLS_V161 = Object.freeze([
  Object.freeze({ id: 'hull-review', label: 'Bilan du blindage',
    description: 'Relire au retour l’état réel du M577 et les limites de son compte rendu. Les relevés du véhicule guideront cet échange.' }),
  Object.freeze({ id: 'route-review', label: 'Mémoire du corridor',
    description: 'Relire au retour le parcours et les barrages effectivement franchis. Les relevés du parcours guideront cet échange.' })
]);
const protocols = new Map(CONVOY_STORY_PROTOCOLS_V161.map(value => [value.id, value]));
const topics = new Set(['vehicle', 'route', 'return']);
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const operationId = value => typeof value === 'string' && /^operation-[1-9][0-9]{0,8}-special-apc-convoy$/.test(value);

export const hasCampaignStoryV161 = campaignId => campaignId === APC_CONVOY_CAMPAIGN_V121.id;
function insertionFor(value) {
  try {
    const state = restoreMissionInsertionV62(value);
    return hasCampaignStoryV161(state.campaignId) && state.worldId === APC_CONVOY_CAMPAIGN_V121.worldId
      && operationId(state.operationId) ? state : null;
  } catch { return null; }
}
export function convoyStoryProtocolV161(value) {
  const state = insertionFor(value);
  const raw = state?.phases.find(phase => phase.kind === 'preparation')?.payload?.convoyStoryV161;
  return raw?.schema === 161 && raw.operationId === state.operationId && protocols.has(raw.protocolId)
    ? protocols.get(raw.protocolId) : null;
}
export function chooseConvoyStoryProtocolV161(value, protocolId, { now = 0 } = {}) {
  const state = insertionFor(value);
  if (!state || !protocols.has(protocolId)) return { ok: false, reason: 'protocol-unavailable' };
  const phase = state.phases[state.currentIndex];
  if (state.status !== 'active' || state.paused || phase.kind !== 'preparation') return { ok: false, reason: 'preparation-inactive' };
  if (convoyStoryProtocolV161(state)?.id === protocolId) return { ok: true, changed: false, state };
  phase.payload.convoyStoryV161 = { schema: 161, operationId: state.operationId, protocolId };
  if (Number.isFinite(now) && now >= state.updatedAt) state.updatedAt = now;
  return { ok: true, changed: true, state, protocol: protocols.get(protocolId) };
}

const line = (speaker, text) => Object.freeze({ speaker, text });
const phases = Object.freeze({
  briefing: { title: 'Ramener le blindé', location: 'TANTALUS · ORDRE DE CONVOYAGE', lines: [
    line('MU/TH/UR', 'Lethe. Le corridor de récupération est coupé. Le M577 doit rejoindre notre périmètre avec son opérateur.'),
    line('Rook · liaison reconnaissance', 'Deux barrages lourds sont signalés. Je garde la liaison ; l’état du véhicule compte davantage qu’un score.'),
    line('Echo-9', 'Je ramène le blindé. Je confirme le passage au sas avant de déclarer le corridor franchi.')
  ], objective: 'Traverser les trois voies, neutraliser les barrages et confirmer le passage au sas.' },
  preparation: { title: 'Ce que le retour devra raconter', location: 'TANTALUS · MANIFESTE DU M577', lines: [
    line('Rook · liaison reconnaissance', 'Choisissez le point à examiner en premier au retour : le véhicule ou la route. Je préparerai les questions pour que nous ne perdions aucun relevé.'),
    line('MU/TH/UR', 'Le bilan utilisera les relevés de cette sortie. Une interruption ne sera pas présentée comme une extraction.')
  ], objective: 'Choisir le premier point du compte rendu, puis confirmer le manifeste du M577.' },
  approach: { title: 'Trois voies, une sortie', location: 'LETHE · GALERIE DU CORRIDOR', lines: [
    line('Rook · liaison reconnaissance', 'Le couloir offre trois voies. Changez de voie pour reprendre un contact dans l’axe ; les impacts ne traversent pas les autres voies.'),
    line('Echo-9', 'Je surveille le contact, la chaleur et la bande. Une rafale sans marge de refroidissement ne nous ouvrira pas la route.')
  ], objective: 'W/S : voie supérieure/inférieure. Espace : accélérer ; F : tourelle ; R : recharger.' },
  deployment: { title: 'Dernier contrôle avant départ', location: 'LETHE · M577 AU POINT DE DÉPART', lines: [
    line('MU/TH/UR', 'Blindé de mission affecté. Le carburant, la bande et la réserve sont finis.'),
    line('Rook · liaison reconnaissance', 'Le mode fini rejoint le sas après les barrages. Le mode sans fin reste un choix distinct avant le départ ; son score ne vaut pas un retour.')
  ], objective: 'Le véhicule attend votre commande E ; aucun départ automatique.' },
  'player-control': { title: 'La liaison reste ouverte', location: 'LETHE · CONTRÔLE DU CONVOI', lines: [
    line('Rook · liaison reconnaissance', 'Je confirme chaque barrage sur la radio. Au périmètre, maintenez E trois secondes : c’est le passage du blindé qui clôt la sortie.'),
    line('Echo-9', 'Reçu. Si nous devons nous replier, le compte rendu gardera ce qui s’est réellement passé.')
  ], objective: 'E : engager le convoi. Garder une réserve de tir pour le barrage final.' }
});

export function campaignInsertionStoryV161(value) {
  const state = insertionFor(value), phase = state?.phases[state.currentIndex];
  const scene = phase && phases[phase.kind];
  if (!scene) return null;
  return { id: CONVOY_STORY_ID_V161, provenance: 'tantalus-project-original', canonExact: false,
    campaignName: APC_CONVOY_CAMPAIGN_V121.name, ...scene, protocol: convoyStoryProtocolV161(state),
    canChoose: state.status === 'active' && !state.paused && phase.kind === 'preparation',
    choices: CONVOY_STORY_PROTOCOLS_V161,
    protocolNotice: 'Liaison de retour standard. Rook conservera les relevés du convoi.' };
}

/** A milestone can speak only after the convoy's own controller recorded it.
 * No wall-clock timer, new progression flag or second event is introduced. */
export function convoyMilestoneTransmissionV161(id, fallback) {
  const copy = {
    depart: 'Echo-9 : M577 engagé. Rook, gardez la liaison sur les trois voies. Je conserve du tir pour les barrages.',
    'crusher-1': 'Rook : premier contact lourd. Reprenez sa voie dans l’axe et gardez une marge pour refroidir la tourelle.',
    'crusher-1-cleared': 'Echo-9 : premier barrage franchi. Le blindé poursuit ; le corridor reste ouvert devant nous, pas encore sécurisé.',
    'crusher-2': 'Rook : second barrage lourd. Vérifiez la bande avant le contact ; aucune réserve ne se renouvelle en route.',
    'crusher-2-cleared': 'Echo-9 : deuxième barrage franchi. Je garde le M577 roulant jusqu’au périmètre.',
    queen: 'Rook : dernier barrage devant le sas. Pas de récupération tant que le passage du blindé n’est pas confirmé.',
    'queen-cleared': 'MU/TH/UR : barrage final neutralisé. Maintenez E au sas pour confirmer le passage du M577.'
  };
  return copy[id] || fallback;
}

function resolvedOperation(save) {
  const operation = save?.strategy?.lastOperation;
  return record(operation) && operationId(operation.id) && hasCampaignStoryV161(operation.campaignId)
    && operation.worldId === APC_CONVOY_CAMPAIGN_V121.worldId && typeof operation.success === 'boolean' ? operation : null;
}
function matchingInsertion(operation) {
  const state = insertionFor(operation.insertionState);
  return state?.operationId === operation.id ? state : null;
}
function readingLedger(operation, insertion) {
  const raw = insertion?.phases.find(phase => phase.kind === 'preparation')?.payload?.convoyReturnV161;
  const valid = raw?.schema === 161 && raw.operationId === operation.id;
  return { schema: 161, operationId: operation.id,
    readTopics: valid && Array.isArray(raw.readTopics) ? [...new Set(raw.readTopics.filter(topic => topics.has(topic)))] : [],
    activeTopic: valid && topics.has(raw.activeTopic) ? raw.activeTopic : null };
}
function nativeEvidence(operation) {
  const raw = operation.resumeState, special = raw?.specialOperation;
  const checked = validateApcConvoyStateV121(special?.apcConvoyV121);
  if (!checked.valid || raw?.schema !== 1 || raw.identity?.campaignId !== operation.campaignId
    || raw.identity.worldId !== operation.worldId || special.operationId !== 'apc-convoy'
    || special.deploymentOperationIdV121 !== operation.id) return null;
  const state = checked.state;
  if (operation.success && (raw.mission?.state !== 'complete' || !state.complete || !state.rewardClaimed
    || raw.vehicle?.destroyed !== false || !(raw.vehicle.hull > 0 && raw.vehicle.hull <= 340))) return null;
  // Failure may preserve a real partial checkpoint, never imply that the
  // current death or hull condition was recorded when only an earlier save was.
  return { state, complete: operation.success && state.complete,
    hull: Number.isFinite(raw.vehicle?.hull) && raw.vehicle.hull >= 0 && raw.vehicle.hull <= 340 ? raw.vehicle.hull : null };
}

export function campaignStoryReturnV161(save) {
  const operation = resolvedOperation(save);
  if (!operation) return null;
  const insertion = matchingInsertion(operation), evidence = nativeEvidence(operation);
  const protocol = insertion && convoyStoryProtocolV161(insertion);
  const ledger = readingLedger(operation, insertion);
  const success = operation.success, complete = Boolean(evidence?.complete);
  const route = evidence?.state;
  const selectedTopic = ledger.activeTopic || (protocol?.id === 'hull-review' ? 'vehicle' : protocol?.id === 'route-review' ? 'route' : 'return');
  const questions = [
    { id: 'vehicle', label: 'Dans quel état revient le M577 ?', speaker: 'MU/TH/UR',
      answer: complete ? `Le M577 est rentré au périmètre. Blindage au retour : ${Math.round(evidence.hull)}/340. Le relevé est transmis à l’atelier.`
        : success ? 'Le retour est enregistré. Le relevé de blindage est indisponible pour cette sortie.'
          : 'Le retour du M577 n’a pas été confirmé. Les dernières positions reçues restent dans le journal de la liaison.' },
    { id: 'route', label: 'Que prouve le relevé du corridor ?', speaker: 'Rook · liaison reconnaissance',
      answer: route ? `${complete ? 'Relevé du retour' : 'Dernière position reçue avant la coupure de liaison'} : progression du parcours ${Math.round(route.distance / 3200 * 100)} %. Barrages lourds franchis : ${route.crushersDefeated.filter(Boolean).length}/2. Barrage final : ${route.queenDefeated ? 'neutralisé' : 'non confirmé'}. Nous devrons reconnaître la route à nouveau avant un prochain passage.`
        : 'Les relevés de route de cette sortie sont indisponibles. Nous ne pouvons pas confirmer l’état des barrages.' },
    { id: 'return', label: success ? 'Qu’allons-nous conserver à bord ?' : 'Que reste-t-il après le repli ?', speaker: 'Echo-9',
      answer: complete ? 'Le corridor a été traversé et le sas a confirmé le blindé. Je conserve le journal de bord et les deux points de barrage. L’atelier pourra commencer par les impacts relevés sur le M577.'
        : 'Nous n’avons pas de retour complet. Rook garde les dernières transmissions ; je signalerai les points sans réponse au prochain briefing. Il faudra un nouvel ordre pour repartir.' }
  ].map(question => ({ ...question, read: ledger.readTopics.includes(question.id) }));
  return { id: CONVOY_STORY_ID_V161, provenance: 'tantalus-project-original', canonExact: false,
    operationId: operation.id, title: 'Corridor de feu · compte rendu',
    status: success ? complete ? 'PASSAGE DU BLINDÉ CONFIRMÉ' : 'RÉSULTAT CONSERVÉ · RELEVÉ INCOMPLET' : 'SORTIE CLOSE · RETOUR NON CONFIRMÉ',
    summary: 'Liaison de retour du convoi de Lethe. Les observations de la sortie restent séparées des objectifs annoncés.',
    protocolLabel: protocol?.label || 'Bilan standard', questions, selectedTopic,
    readingComplete: questions.every(question => question.read),
    canReview: !save.strategy.currentOperation,
    canPersistReview: Boolean(insertion && (!success || insertion.status === 'completed' && insertion.controlGranted)),
    scopeNotice: 'Journal de la dernière sortie du convoi.' };
}

/** Only the bounded reading notebook changes. This never resolves an operation,
 * advances its clock, clears injuries or pays a resource. */
export function recordCampaignStoryReviewV161(save, id, topicId) {
  const operation = resolvedOperation(save);
  const model = operation && campaignStoryReturnV161(save);
  if (!model?.canReview || !model.canPersistReview || id !== operation.id || !topics.has(topicId))
    return { ok: false, changed: false, reason: 'return-unavailable' };
  const insertion = matchingInsertion(operation), ledger = readingLedger(operation, insertion);
  const changed = !ledger.readTopics.includes(topicId) || ledger.activeTopic !== topicId;
  if (!changed) return { ok: true, changed: false };
  insertion.phases.find(phase => phase.kind === 'preparation').payload.convoyReturnV161 = {
    ...ledger, readTopics: [...new Set([...ledger.readTopics, topicId])], activeTopic: topicId };
  operation.insertionState = insertion;
  return { ok: true, changed: true, operationId: id, topicId };
}
