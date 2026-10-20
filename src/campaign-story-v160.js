import { restoreMissionInsertionV62 } from './mission-insertion-v62.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122, normalizeArchiveRelayArchiveV122 } from './archive-relay-state-v122.js';

// Authored Tantalus fiction attached to the existing QZ-18 operation. These
// transmissions neither reconstruct a film scene nor identify an unseen culprit.
export const CAMPAIGN_STORY_ID_V160 = 'qz18-last-relay';
export const CAMPAIGN_STORY_PROVENANCE_V160 = 'tantalus-project-original';
export const CAMPAIGN_STORY_PROTOCOLS_V160 = Object.freeze([
  Object.freeze({ id: 'technical-audit', label: 'Audit technique',
    description: 'Confier à Inez la confrontation des six pièces. Dossier complet au retour : +2 recherche.',
    reward: Object.freeze({ resource: 'research', amount: 2 }) }),
  Object.freeze({ id: 'crew-prevention', label: 'Prévention à bord',
    description: 'Transformer le dossier en consigne de détresse pour le bord. Dossier complet au retour : +2 moral.',
    reward: Object.freeze({ system: 'morale', amount: 2 }) })
]);
const PROTOCOLS = new Map(CAMPAIGN_STORY_PROTOCOLS_V160.map(entry => [entry.id, entry]));
const TOPICS = new Set(['chronology', 'identity', 'return']);
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);

export function hasCampaignStoryV160(campaignId) {
  return campaignId === ARCHIVE_RELAY_CAMPAIGN_V122.id;
}

function insertionFor(value) {
  try {
    const state = restoreMissionInsertionV62(value);
    return hasCampaignStoryV160(state.campaignId) && state.worldId === ARCHIVE_RELAY_CAMPAIGN_V122.worldId ? state : null;
  } catch { return null; }
}

export function campaignStoryProtocolV160(value) {
  const state = insertionFor(value);
  if (!state) return null;
  const selection = state.phases.find(phase => phase.kind === 'preparation')?.payload?.campaignStoryV160;
  if (!record(selection) || selection.schema !== 160 || selection.operationId !== state.operationId
    || selection.campaignId !== state.campaignId || !PROTOCOLS.has(selection.protocolId)) return null;
  return PROTOCOLS.get(selection.protocolId);
}

/** Change only the currently visible preparation choice. Displaying, skipping,
 * an old callback or a foreign insertion never creates a selected protocol. */
export function chooseCampaignStoryProtocolV160(value, protocolId, { now = 0 } = {}) {
  const state = insertionFor(value);
  if (!state || !PROTOCOLS.has(protocolId)) return { ok: false, reason: 'protocol-unavailable' };
  const phase = state.phases[state.currentIndex];
  if (state.status !== 'active' || state.paused || phase.kind !== 'preparation') return { ok: false, reason: 'preparation-inactive' };
  if (campaignStoryProtocolV160(state)?.id === protocolId) return { ok: true, changed: false, state };
  phase.payload.campaignStoryV160 = { schema: 160, operationId: state.operationId,
    campaignId: state.campaignId, protocolId };
  state.updatedAt = finite(now) && now >= state.updatedAt ? now : state.updatedAt;
  return { ok: true, changed: true, state, protocol: PROTOCOLS.get(protocolId) };
}

const LINE = (speaker, text) => Object.freeze({ speaker, text });
const PHASES = Object.freeze({
  briefing: Object.freeze({ title: 'Le message arrivé trop tard',
    location: 'TANTALUS · SALLE DE BRIEFING',
    lines: Object.freeze([
      LINE('MU/TH/UR', 'QZ-18. Le relais de Lethe ne répond plus. Sa mémoire locale est notre seule piste.'),
      LINE('Inez Harlow · liaison science', 'Ramenez les relevés, pas une accusation. Une panne aujourd’hui ne prouve pas une panne au moment de la détresse.'),
      LINE('Echo-9', 'Je remets le poste en service, puis je confronte les documents avant d’ouvrir la sortie.')
    ]),
    objective: 'Récupérer les six pièces de QZ-18 et établir ce qui a retardé la détresse.' }),
  preparation: Object.freeze({ title: 'Ce que nous ferons des preuves',
    location: 'TANTALUS · PRÉPARATION AU DÉPART',
    lines: Object.freeze([
      LINE('Inez Harlow · liaison science', 'La mission reste la même. Choisissez ce que nous préparerons au retour : une analyse technique ou une consigne pour l’équipage.'),
      LINE('MU/TH/UR', 'Le complément de bilan exige le dossier complet et un retour validé. Une retraite ne remplace pas les pièces manquantes.')
    ]), objective: 'Choisir un protocole de compte rendu, ou conserver le bilan standard.' }),
  approach: Object.freeze({ title: 'À portée du relais',
    location: 'LETHE · APPROCHE DE QZ-18',
    lines: Object.freeze([
      LINE('Rook · liaison reconnaissance', 'Les accès supérieurs desservent ingénierie et sécurité. Le fret reste au niveau du quai.'),
      LINE('Echo-9', 'Je commence par le PDA à l’ouest. Pas de réseau extérieur : je conserve les originaux locaux.')
    ]), objective: 'Rejoindre le PDA du quai ouest ; le badge autorise les postes locaux.' }),
  deployment: Object.freeze({ title: 'Un nom sur le pupitre',
    location: 'QZ-18 · QUAI OUEST',
    lines: Object.freeze([
      LINE('Inez Harlow · liaison science', 'Si un badge apparaît dans un registre, vérifiez ce qu’il prouve. Un droit d’accès ne montre pas le visage de la personne qui l’utilise.'),
      LINE('Echo-9', 'PDA, alimentation, postes départementaux. Je garde les horaires ensemble.')
    ]), objective: 'E au PDA, puis maintenir E au relais pour rétablir les postes.' }),
  'player-control': Object.freeze({ title: 'Votre enquête commence ici',
    location: 'QZ-18 · CONTRÔLE TACTIQUE',
    lines: Object.freeze([
      LINE('Rook · liaison reconnaissance', 'Ingénierie et sécurité en hauteur ; fret au sol. Au poste fret, maintenez F pour restaurer le brouillon.'),
      LINE('Inez Harlow · liaison science', 'Confrontez les six pièces au poste d’analyse. Le sas s’ouvrira après une conclusion étayée, pas après une supposition.')
    ]), objective: 'Lire et comparer les preuves avant de rejoindre la balise de retour à l’est.' })
});

export function campaignInsertionStoryV160(value) {
  const state = insertionFor(value);
  const scene = state && PHASES[state.phases[state.currentIndex]?.kind];
  if (!scene) return null;
  return { id: CAMPAIGN_STORY_ID_V160, provenance: CAMPAIGN_STORY_PROVENANCE_V160, canonExact: false,
    campaignName: ARCHIVE_RELAY_CAMPAIGN_V122.name, ...scene, protocol: campaignStoryProtocolV160(state),
    canChoose: state.status === 'active' && !state.paused && state.phases[state.currentIndex].kind === 'preparation',
    choices: CAMPAIGN_STORY_PROTOCOLS_V160 };
}

function latestResolvedOperation(save) {
  const operation = save?.strategy?.lastOperation;
  return record(operation) && hasCampaignStoryV160(operation.campaignId)
    && operation.worldId === ARCHIVE_RELAY_CAMPAIGN_V122.worldId
    && typeof operation.id === 'string' && /^operation-[1-9][0-9]{0,8}-special-archive-relay$/.test(operation.id) ? operation : null;
}

function resolvedOperation(save) {
  const latest = latestResolvedOperation(save);
  if (latest) return latest;
  const archived = normalizeArchiveRelayArchiveV122(save?.archiveRelayArchivesV122).lastReturnV160;
  return archived ? { ...archived, id: archived.operationId, archivedReturnV160: true } : null;
}

function returnProtocol(operation) {
  return operation?.archivedReturnV160 ? PROTOCOLS.get(operation.protocolId) || null
    : campaignStoryProtocolV160(operation?.insertionState);
}

function returnedEvidence(save, operation) {
  const evidence = normalizeArchiveRelayArchiveV122(save?.archiveRelayArchivesV122).case;
  return operation?.success === true && evidence?.operationId === operation.id ? evidence : null;
}

function returnLedger(operation) {
  if (operation?.archivedReturnV160) return operation.ledger;
  const insertion = insertionFor(operation?.insertionState);
  if (!insertion || insertion.operationId !== operation.id) return null;
  const raw = insertion.phases.find(phase => phase.kind === 'preparation')?.payload?.campaignStoryReturnV160;
  const valid = raw?.schema === 160 && raw.operationId === operation.id;
  const protocol = campaignStoryProtocolV160(insertion);
  const receipt = protocol && valid && record(raw.receipt) && raw.receipt.operationId === operation.id
    && raw.receipt.protocolId === protocol?.id && raw.receipt.key === (protocol?.reward.resource || protocol?.reward.system)
    && finite(raw.receipt.amount) && raw.receipt.amount >= 0 && raw.receipt.amount <= 2 ? {
      operationId: operation.id, protocolId: protocol.id, key: raw.receipt.key, amount: raw.receipt.amount
    } : null;
  return { schema: 160, operationId: operation.id, receipt,
    readTopics: valid && Array.isArray(raw.readTopics) ? [...new Set(raw.readTopics.filter(topic => TOPICS.has(topic)))] : [],
    activeTopic: valid && TOPICS.has(raw.activeTopic) ? raw.activeTopic : 'return' };
}

function writeReturnLedger(operation, ledger) {
  if (operation?.archivedReturnV160) { operation.ledger = ledger; return true; }
  const insertion = insertionFor(operation.insertionState);
  if (!insertion || insertion.operationId !== operation.id) return false;
  insertion.phases.find(phase => phase.kind === 'preparation').payload.campaignStoryReturnV160 = ledger;
  operation.insertionState = insertion;
  return true;
}

function completionFields(save, operation) {
  const fields = value => Number.isInteger(value?.completedDay) && value.completedDay >= 1 && value.completedDay <= 999999999
    && finite(value.completedHour) && value.completedHour >= 0 && value.completedHour <= 24
    ? { completedDay: value.completedDay, completedHour: value.completedHour } : null;
  const direct = fields(operation);
  if (direct) return direct;
  // SaveSystem's historical lastOperation projection omits completion dates.
  // Keep strict validation and recover them only from the already validated
  // record of this exact return, never from today's strategic clock.
  if (operation.completedDay != null || operation.completedHour != null) return null;
  const archive = normalizeArchiveRelayArchiveV122(save?.archiveRelayArchivesV122);
  const stored = archive.lastReturnV160;
  if (save?.archiveRelayArchivesV122?.lastReturnV160 != null) {
    return stored?.operationId === operation.id && stored.success === operation.success ? fields(stored) : null;
  }
  // An older victory may predate lastReturnV160. Its native six-piece case
  // already owns the completion date; an incomplete/foreign case owns none.
  return operation.success === true && archive.case?.operationId === operation.id ? fields(archive.case) : null;
}

function preserveReturn(save, operation) {
  if (!operation) return { changed: false };
  const insertion = operation.archivedReturnV160 ? null : insertionFor(operation.insertionState);
  if (!operation.archivedReturnV160 && operation.insertionState && (!insertion || insertion.operationId !== operation.id
    || operation.success && (insertion.status !== 'completed' || !insertion.controlGranted))) return { changed: false };
  const completion = completionFields(save, operation);
  if (!completion) return { changed: false };
  const archive = normalizeArchiveRelayArchiveV122({ ...save.archiveRelayArchivesV122,
    lastReturnV160: { schema: 160, operationId: operation.id, campaignId: operation.campaignId, worldId: operation.worldId,
      success: operation.success, reason: operation.reason, ...completion,
      protocolId: returnProtocol(operation)?.id || null, ledger: returnLedger(operation) } });
  if (!archive.lastReturnV160 || JSON.stringify(archive.lastReturnV160) === JSON.stringify(save.archiveRelayArchivesV122?.lastReturnV160))
    return { changed: false };
  save.archiveRelayArchivesV122 = archive;
  return { changed: true, operationId: operation.id };
}

/** Preserve an already resolved QZ-18 return before a later operation replaces
 * strategy.lastOperation. This bounded migration neither awards nor reads it. */
export function preserveCampaignStoryReturnV160(save) {
  return preserveReturn(save, latestResolvedOperation(save));
}

/** Called only on the same transaction candidate as the native operation
 * resolution. The six-record permanent dossier owns the reward, never a UI
 * click, an insertion skip, a bare success flag or a previous run's archive. */
export function applyCampaignStoryReturnV160(save, campaign, result = {}) {
  // Payment can only belong to the just-resolved native lastOperation. The
  // durable historical return is deliberately never a payment input.
  const operation = latestResolvedOperation(save);
  if (!operation || campaign?.id !== operation.campaignId || save.strategy.currentOperation
    || typeof result.success !== 'boolean' || result.success !== operation.success) return { applied: false, reason: 'return-not-qualified' };
  const finish = outcome => { preserveReturn(save, operation); return outcome; };
  if (result.success !== true) return finish({ applied: false, reason: 'return-not-qualified' });
  const insertion = insertionFor(operation.insertionState);
  const protocol = insertion && campaignStoryProtocolV160(insertion);
  if (!insertion || insertion.operationId !== operation.id || insertion.status !== 'completed' || !insertion.controlGranted
    || !protocol || !returnedEvidence(save, operation)) return finish({ applied: false, reason: 'complete-evidence-required' });
  const ledger = returnLedger(operation);
  if (ledger?.receipt) return finish({ applied: false, reason: 'already-recorded', protocolId: protocol.id });
  const target = protocol.reward.resource ? save.galaxy?.resources : save.hub?.systems;
  const key = protocol.reward.resource || protocol.reward.system;
  const maximum = protocol.reward.resource ? 999999999 : 100;
  if (!record(target) || !finite(target[key]) || target[key] < 0 || target[key] > maximum)
    return finish({ applied: false, reason: 'return-ledger-invalid' });
  const previous = target[key];
  target[key] = Math.min(maximum, previous + protocol.reward.amount);
  writeReturnLedger(operation, { ...ledger, receipt: { operationId: operation.id,
    protocolId: protocol.id, key, amount: target[key] - previous } });
  return finish({ applied: true, protocolId: protocol.id, key, amount: target[key] - previous,
    expectedAmount: protocol.reward.amount, operationId: operation.id });
}

export function campaignStoryReturnV160(save) {
  const operation = resolvedOperation(save);
  if (!operation) return null;
  const evidence = returnedEvidence(save, operation);
  const protocol = returnProtocol(operation);
  const ledger = returnLedger(operation);
  const success = operation.success === true;
  const completion = completionFields(save, operation);
  const selectedTopic = ledger?.activeTopic || 'return';
  const questions = [
    { id: 'chronology', label: 'Qu’établissent les horaires ?', speaker: 'Inez Harlow · liaison science',
      answer: evidence ? 'Le brouillon de détresse est saisi à 18:41, mis en attente à 18:42 et libéré à 18:54. Le signal horaire et la tension étaient stables. Le dossier étaye une priorité de fret qui a retardé la détresse.'
        : 'Le dossier complet de cette sortie n’est pas revenu avec un bilan validé. Je ne peux pas transformer les traces partielles en chronologie démontrée.' },
    { id: 'identity', label: 'Peut-on accuser Voss ?', speaker: 'Inez Harlow · liaison science',
      answer: evidence ? 'Non. Voss laisse son badge au pupitre à 18:39 ; il est utilisé à 18:43 sans image exploitable. Le droit d’accès est identifié, la personne ne l’est pas. Cette limite reste dans le compte rendu.'
        : 'Aucune identification personnelle n’est établie. Un nom de badge ou un indice isolé ne remplace pas les pièces manquantes.' },
    { id: 'return', label: success ? 'Quel bilan pour le Tantalus ?' : 'Comment reprendre l’enquête ?', speaker: 'MU/TH/UR',
      answer: !success ? 'La sortie est close sans dossier validé. Les pertes, blessures et conséquences stratégiques du bilan restent enregistrées. Une nouvelle sortie exige un nouvel ordre ; relire cette transmission n’efface rien.'
        : !evidence ? 'Le résultat opérationnel est conservé, mais les six pièces permanentes ne correspondent pas à cette sortie. Aucun complément de protocole n’est attribué.'
          : ledger?.receipt && protocol ? `Le dossier est conservé. Le protocole « ${protocol.label} » a été traité au retour : +${ledger.receipt.amount} ${ledger.receipt.key === 'research' ? 'recherche' : 'moral'}${ledger.receipt.amount < 2 ? ' (plafond de stockage atteint)' : ''}. Relire les échanges ne verse aucun second complément.`
            : 'Le dossier est conservé et le bilan standard est enregistré. Aucun protocole complémentaire n’a été payé pour cette sortie.' }
  ].map(question => ({ ...question, read: ledger?.readTopics.includes(question.id) === true }));
  return { id: CAMPAIGN_STORY_ID_V160, provenance: CAMPAIGN_STORY_PROVENANCE_V160, canonExact: false,
    operationId: operation.id, title: success && evidence ? 'QZ-18 · Les heures retrouvées' : 'QZ-18 · Retour incomplet',
    status: success && evidence ? 'DOSSIER VALIDÉ' : success ? 'BILAN À VÉRIFIER' : operation.reason === 'retreat' ? 'RETRAITE ENREGISTRÉE' : 'ÉCHEC ENREGISTRÉ',
    summary: success && evidence ? 'La cause du retard est étayée ; l’identité de son auteur reste inconnue.'
      : 'Les faits établis restent séparés des pièces manquantes et des suppositions.',
    protocolLabel: protocol?.label || 'Bilan standard', evidenceComplete: Boolean(evidence), selectedTopic,
    questions, readingComplete: questions.every(question => question.read), canReview: !save.strategy.currentOperation,
    canPersistReview: Boolean(ledger && completion),
    completedDay: completion?.completedDay, completedHour: completion?.completedHour };
}

/** Reading is a bounded, zero-cost ledger entry on this returned operation.
 * It never runs strategic resolution, heals crew, pays rewards or advances time. */
export function recordCampaignStoryReviewV160(save, operationId, topicId) {
  const operation = resolvedOperation(save);
  if (!operation || save.strategy.currentOperation || operation.id !== operationId || !TOPICS.has(topicId))
    return { ok: false, changed: false, reason: 'return-unavailable' };
  const ledger = returnLedger(operation);
  if (!ledger) return { ok: false, changed: false, reason: 'legacy-return-read-only' };
  if (!completionFields(save, operation)) return { ok: false, changed: false, reason: 'return-date-unavailable' };
  const changed = !ledger.readTopics.includes(topicId) || ledger.activeTopic !== topicId;
  if (!changed) return { ok: true, changed: false };
  writeReturnLedger(operation, { ...ledger, readTopics: [...new Set([...ledger.readTopics, topicId])], activeTopic: topicId });
  preserveReturn(save, operation);
  return { ok: true, changed: true, operationId, topicId };
}
