import { NARRATIVE_COLLECTABLES_V68, NARRATIVE_RELATIONS_V68, normalizeNarrativeArchivesV68,
  getNarrativeInvestigationV68, markNarrativeCollectableReadV68, recordNarrativeDecisionV68 } from './narrative-collectables-v68.js';
import { ARCHIVE_RELAY_DOCUMENTS_V122, normalizeArchiveRelayArchiveV122, validateArchiveRelayStateV122 } from './archive-relay-state-v122.js';
import { firstProjectileObstacleV83 } from './projectile-collision-v83.js';

const list = value => Array.isArray(value) ? value : [];
const object = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const text = value => typeof value === 'string' ? value.slice(0, 160) : '';
const clone = value => structuredClone(value);
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const unique = value => [...new Set(list(value).filter(entry => typeof entry === 'string'))];
const claim = (id, subject, value, statement, confidence = 85) => ({ id, subject, value, statement, confidence, stance: 'supports' });
const qz18Id = id => `qz18-${id}`;

const QZ18_CLAIMS = {
  'pda-custody': [claim('qz18-badge-left', 'access-identity', 'badge-left-1839', 'Voss a laissé son badge au pupitre avant l’utilisation enregistrée.'),
    claim('qz18-identity-not-proven', 'access-identity', 'identity-unproven', 'La présence du nom sur un registre ne prouve pas la présence de son porteur.')],
  'engineering-clock': [claim('qz18-clocks-synchronized', 'distress-timing', 'common-clock', 'Les trois postes partageaient le même signal horaire avec moins d’une seconde d’écart.', 98),
    claim('qz18-clock-ticket-obsolete', 'distress-timing', 'old-ticket', 'Le ticket de dérive appartient à la veille et n’explique pas la séquence de ce soir.', 96)],
  'engineering-power': [claim('qz18-power-stable', 'distress-cause', 'stable-power', 'Aucune interruption électrique n’est enregistrée pendant le retard de détresse.', 99),
    claim('qz18-priority-changed', 'distress-cause', 'freight-priority', 'La priorité d’émission a été déplacée derrière le fret à 18:42.', 98)],
  'security-access': [claim('qz18-badge-used', 'access-identity', 'badge-used-1843', 'Le droit d’accès du badge a confirmé le profil cargaison à 18:43.', 97),
    claim('qz18-camera-no-face', 'access-identity', 'identity-unproven', 'La caméra masquée n’établit l’identité d’aucun utilisateur du badge.', 99)],
  'freight-manifest': [claim('qz18-technical-explanation', 'distress-cause', 'technical-failure', 'Le courriel officiel classe le retard comme incident technique sans responsabilité de procédure.', 60),
    claim('qz18-release-time', 'distress-timing', 'released-1854', 'Le rapport situe le départ du message de secours à 18:54.', 90)],
  'freight-draft': [claim('qz18-distress-queued', 'distress-cause', 'freight-priority', 'Le secours saisi à 18:41 est retenu dans la file après la modification de priorité.', 96),
    claim('qz18-queue-release', 'distress-timing', 'released-1854', 'La mémoire locale situe la libération de la demande à 18:54.', 97)]
};

/** Authored Tantalus records; no text is advertised as a recovered recording.
 * The actual black-box replay below contains observations from this deployment,
 * never invented historical CCTV frames or certified franchise evidence. */
export const FIELD_EVIDENCE_V132 = freeze([
  { id: 'qz17-service-cache-v132', type: 'black-box', title: 'Service B · boîte noire d’Echo-9', shortTitle: 'Trajet de service', family: 'ship', ratio: .17,
    source: 'Echo-9 · relevé de déplacement actuel', timestamp: 'Déploiement en cours',
    summary: 'Le cache historique reste absent ; le relevé joint montre le passage actuel de l’équipe dans le navire.',
    body: 'Les images historiques de 02:00 à 02:30 ne sont pas récupérables. Ce boîtier conserve uniquement le déplacement d’Echo-9 pendant le déploiement courant : positions, obstacles et contacts visibles. La lecture est une reconstitution des mesures du jeu, sans piste sonore ni visage identifié.\n\nLe passage de service est praticable aujourd’hui. Cela recoupe une destination possible dans le dossier FL-09, sans prouver qu’une caisse ou une personne a suivi cette route à l’heure contestée.',
    mediaId: 'echo9-blackbox-v132',
    claims: [claim('qz17-service-current-access', 'cargo-route-qz17-04', 'current-service-access', 'Le trajet actuel documente un accès de service, pas le passage historique de QZ17-04.'),
      claim('qz17-historical-cctv-missing', 'camera-outage-c12-c16', 'historical-cctv-missing', 'Aucune image historique ne permet d’attribuer le transfert à un visage.', 99)] },
  { id: 'cargo-service-queue-v132', type: 'email', title: 'Service B · double du registre de réception', shortTitle: 'Registre de réception', family: 'ship', ratio: .39,
    source: 'Service de maintenance · copie locale', timestamp: '2204-09-17 · 02:29',
    summary: 'Le registre de maintenance conserve un numéro de caisse que le courriel du quai affirme ne jamais avoir déplacé.',
    body: 'Réception de service : numéro de suivi QZ17-04. Destination suivante proposée : laboratoire de quarantaine de la colonie. La réception est locale et n’a pas été contresignée par le poste fret. Une proposition de destination ne constitue donc ni un reçu du laboratoire ni une identité de transporteur.\n\nLe registre contredit la négation absolue de tout mouvement ; il ne suffit pas à établir que le contenu de la caisse ou son destinataire soient ceux indiqués sur le bon initial.',
    claims: [claim('cargo-service-received', 'cargo-transfer-qz17-04', 'executed-at-02-14', 'La maintenance enregistre QZ17-04 dans son circuit local malgré la négation du quai.', 88),
      claim('cargo-lab-destination', 'specimen-custody', 'lab-destination-proposed', 'Le laboratoire est une destination proposée ; sa réception doit être vérifiée séparément.', 90)] },
  { id: 'colony-custody-ticket-v132', type: 'pda', title: 'Laboratoire · réception sans identité', shortTitle: 'Ticket du laboratoire', family: 'colony', ratio: .23,
    source: 'L. Senn · réception de laboratoire', timestamp: '2204-09-17 · 04:10',
    summary: 'La colonie reçoit un conteneur scellé et une référence QZ17-04 ; le personnel n’identifie pas son transporteur.',
    body: 'Un conteneur a été présenté avec la référence QZ17-04. Je n’ai pas assisté à son départ du navire. La personne qui l’a déposé portait une combinaison fermée ; le transpondeur transmis peut être celui d’un équipement prêté. Je ne signe pas d’identification personnelle.\n\nLe conteneur est placé en quarantaine. L’étiquette de transfert est conservée séparément du rapport d’analyse pour que la chaîne de garde ne soit pas confondue avec un diagnostic biologique.',
    claims: [claim('colony-lab-receipt', 'specimen-custody', 'lab-received', 'Le laboratoire consigne une réception portant QZ17-04, indépendamment de la proposition du navire.', 92),
      claim('colony-carrier-unknown', 'transfer-authorization-qz17-04', 'carrier-unidentified', 'Le transporteur reste non identifié ; un transpondeur ne vaut pas une identification visuelle.', 98)] },
  { id: 'colony-sterilization-report-v132', type: 'email', title: 'Laboratoire · clôture avant analyse', shortTitle: 'Clôture du laboratoire', family: 'colony', ratio: .52,
    source: 'Coordination de quarantaine · rapport envoyé', timestamp: '2204-09-17 · 04:18',
    summary: 'Le rapport conclut à une absence de matière active alors que l’examen extérieur du résidu reste à réaliser.',
    body: 'Le lot est déclaré inerte pour libérer le circuit de fret. Cette conclusion a été établie à partir de l’étiquette de stérilisation et du voyant du conteneur. Aucun résultat de scanner du résidu extérieur n’est annexé.\n\nLe prélèvement de terrain doit être comparé à ce rapport avant de retenir une conclusion. Un signal organique dans ce résidu ne prouverait ni une infestation du laboratoire entier ni l’origine exacte du conteneur.',
    claims: [claim('colony-residue-inert', 'quarantine-residue', 'no-active-residue', 'Le rapport de clôture classe le résidu comme inerte sans examen de terrain annexé.', 52),
      claim('colony-scan-absent', 'quarantine-residue', 'scan-required', 'Le classement repose sur une étiquette et doit être confronté à un scan du résidu.', 96)] },
  { id: 'field-residue-scan-v132', type: 'specimen', title: 'Résidu extérieur · analyse de terrain', shortTitle: 'Résidu à scanner', family: 'field', ratio: .24, requiresAction: 'deep-scan',
    source: 'Echo-9 · scanner de terrain', timestamp: 'Déploiement en cours',
    summary: 'Une vraie manipulation du scanner permet de conserver le prélèvement et de distinguer observation locale et origine inconnue.',
    body: 'Le prélèvement narratif présente une réponse organique locale dans le scénario original du Tantalus. Ce résultat est attaché à la manipulation réussie du scanner de l’opérateur et à la position du résidu. Il n’est pas attribué à une piste audio ou à un instrument historique absent.\n\nCette observation contredit la clôture générale « inerte » appliquée au résidu. Elle ne démontre pas une espèce précise ni un transport volontaire. Les charges du scanner sont celles réellement dépensées pendant l’analyse.',
    claims: [claim('field-residue-organic', 'quarantine-residue', 'organic-local-response', 'Le prélèvement de terrain est organique localement ; le classement global comme inerte est insuffisant.', 93),
      claim('field-origin-unproven', 'specimen-custody', 'origin-unproven', 'Le scanner n’établit ni l’identité du transporteur ni l’origine biologique du résidu.', 98)] },
  { id: 'field-custody-marker-v132', type: 'cargo-seal', title: 'Balise de terrain · transfert interrompu', shortTitle: 'Balise de garde', family: 'field', ratio: .55,
    source: 'Équipe de récupération · note matérielle', timestamp: '2204-09-17 · 05:02',
    summary: 'La balise relie le prélèvement au circuit de quarantaine tout en signalant une rupture de garde.',
    body: 'Une étiquette de garde porte la référence QZ17-04 et la destination de quarantaine. La dernière remise n’est pas signée. Le prélèvement a été retrouvé à l’extérieur ; personne ne peut certifier qu’il représente tout le contenu reçu par le laboratoire.\n\nConserver le prélèvement, le ticket de réception et cette rupture de garde ensemble. Une conclusion prudente peut établir le parcours documentaire et l’insuffisance du classement « inerte », sans désigner de responsable sur la seule présence d’un badge ou d’un nom.',
    claims: [claim('field-quarantine-label', 'specimen-custody', 'quarantine-link', 'La balise relie le prélèvement à la destination de quarantaine portant QZ17-04.', 87),
      claim('field-custody-broken', 'specimen-custody', 'custody-break', 'La remise finale non signée empêche de certifier l’intégrité de toute la chaîne de garde.', 98)] }
]);

export const NARRATIVE_EVIDENCE_RECORDS_V132 = freeze([
  ...NARRATIVE_COLLECTABLES_V68.map(entry => ({ ...clone(entry), source: `${entry.source.name} · ${entry.source.role}`,
    timestamp: entry.source.recordedAt, origin: 'legacy-qz17', provenance: 'tantalus-project-original', canonExact: false })),
  ...ARCHIVE_RELAY_DOCUMENTS_V122.map(entry => ({ ...clone(entry), id: qz18Id(entry.id), originalId: entry.id,
    type: 'text', source: `${entry.author} · ${entry.department}`, timestamp: entry.time, claims: QZ18_CLAIMS[entry.id],
    origin: 'legacy-qz18', provenance: 'tantalus-project-original', canonExact: false })),
  ...FIELD_EVIDENCE_V132.map(entry => ({ ...clone(entry), origin: 'field', format: 'text', provenance: 'tantalus-project-original', canonExact: false }))
]);
const records = new Map(NARRATIVE_EVIDENCE_RECORDS_V132.map(entry => [entry.id, entry]));
const claimRecords = new Map(NARRATIVE_EVIDENCE_RECORDS_V132.flatMap(entry => entry.claims.map(item => [item.id, entry.id])));

export const NARRATIVE_EVIDENCE_RELATIONS_V132 = freeze([
  ...clone(NARRATIVE_RELATIONS_V68),
  { id: 'qz18-power-mail-v132', type: 'contradicts', fromClaimId: 'qz18-power-stable', toClaimId: 'qz18-technical-explanation', explanation: 'Le diagnostic stable contredit l’explication d’une panne électrique pendant le retard.' },
  { id: 'qz18-priority-draft-v132', type: 'corroborates', fromClaimId: 'qz18-priority-changed', toClaimId: 'qz18-distress-queued', explanation: 'Le changement de priorité et la file de détresse documentent le même retard administratif.' },
  { id: 'qz18-release-times-v132', type: 'corroborates', fromClaimId: 'qz18-release-time', toClaimId: 'qz18-queue-release', explanation: 'Le brouillon et le courriel situent la libération du message à la même heure.' },
  { id: 'qz18-badge-identity-v132', type: 'qualifies', fromClaimId: 'qz18-badge-used', toClaimId: 'qz18-identity-not-proven', explanation: 'Un droit d’accès est utilisé ; la note de garde et la caméra masquée excluent une attribution personnelle certaine.' },
  { id: 'cargo-service-denial-v132', type: 'contradicts', fromClaimId: 'cargo-service-received', toClaimId: 'qz17-claim-transfer-cancelled-email', explanation: 'La réception de maintenance contredit la négation absolue d’un mouvement.' },
  { id: 'cargo-current-trace-v132', type: 'qualifies', fromClaimId: 'qz17-service-current-access', toClaimId: 'qz17-claim-route-service-lift-black-box', explanation: 'Le déplacement enregistré aujourd’hui confirme un accès actuel ; il ne remplace pas des images historiques manquantes.' },
  { id: 'cargo-lab-receipt-v132', type: 'corroborates', fromClaimId: 'cargo-lab-destination', toClaimId: 'colony-lab-receipt', explanation: 'La destination proposée est recoupée par un reçu indépendant de laboratoire.' },
  { id: 'residue-inert-scan-v132', type: 'contradicts', fromClaimId: 'field-residue-organic', toClaimId: 'colony-residue-inert', explanation: 'Le scan local impose de revoir la clôture générale comme inerte.' },
  { id: 'residue-custody-scope-v132', type: 'qualifies', fromClaimId: 'field-custody-broken', toClaimId: 'colony-lab-receipt', explanation: 'La réception est attestée, mais la rupture de garde limite l’attribution du prélèvement au contenu entier.' },
  { id: 'cross-identity-limit-v132', type: 'qualifies', fromClaimId: 'colony-carrier-unknown', toClaimId: 'qz18-camera-no-face', explanation: 'Les deux enquêtes illustrent une même limite d’identification ; elles ne prouvent pas un responsable commun.' }
]);

export const NARRATIVE_EVIDENCE_CHAINS_V132 = freeze([
  { id: 'cargo-route-v132', title: 'QZ-17 · recouper le passage de service',
    requirements: [...NARRATIVE_COLLECTABLES_V68.map(entry => entry.id), 'qz17-service-cache-v132', 'cargo-service-queue-v132'],
    optionId: 'record-cargo-route-v132', conclusion: 'Le circuit de maintenance est documenté. Le trajet actuel ne permet pas d’identifier le transporteur historique.',
    hint: 'Récupérer les quatre preuves de QZ-17 puis les deux relevés d’une mission de navire.' },
  { id: 'distress-audit-v132', title: 'QZ-18 · délais, priorité et identité',
    requirements: ARCHIVE_RELAY_DOCUMENTS_V122.map(entry => qz18Id(entry.id)), optionId: 'record-distress-audit-v132',
    conclusion: 'La priorité de fret explique le retard. L’utilisateur du badge reste non identifié.',
    hint: 'Lire les six documents de QZ-18 ou reprendre le dossier permanent d’une enquête terminée.' },
  { id: 'quarantine-custody-v132', title: 'Tantalus · chaîne de garde biologique',
    requirements: FIELD_EVIDENCE_V132.map(entry => entry.id), optionId: 'record-quarantine-custody-v132',
    conclusion: 'Le parcours documentaire et la réponse organique locale sont recoupés. La rupture de garde interdit une attribution personnelle ou biologique complète.',
    hint: 'Navire, colonie et terrain : deux preuves par milieu. Le prélèvement exige un scanner réellement disponible.' }
]);
const chains = new Map(NARRATIVE_EVIDENCE_CHAINS_V132.map(entry => [entry.id, entry]));
const options = new Map(NARRATIVE_EVIDENCE_CHAINS_V132.map(entry => [entry.optionId, entry]));
export const NARRATIVE_MEDIA_V132 = freeze([
  { id: 'echo9-blackbox-v132', evidenceId: 'qz17-service-cache-v132', kind: 'telemetry', title: 'Boîte noire · trajet réel du déploiement',
    description: 'Relecture visuelle des positions enregistrées dans le jeu. Aucune piste audio ni image historique reconstruite.' }
]);
const media = new Map(NARRATIVE_MEDIA_V132.map(entry => [entry.id, entry]));

export function createNarrativeEvidenceV132() {
  return { schema: 132, discovered: {}, readIds: [], decisions: {}, mediaCaptures: {}, playedIds: [], journal: [] };
}

function normalizeCapture(raw) {
  if (!object(raw) || raw.schema !== 132 || raw.origin !== 'live-game-telemetry' || !media.has(raw.mediaId)
    || !Number.isFinite(raw.width) || !Number.isFinite(raw.height) || raw.width <= 0 || raw.width > 16000 || raw.height <= 0 || raw.height > 6000) return null;
  const frames = [];
  for (const frame of list(raw.frames).slice(0, 12)) {
    if (!Number.isFinite(frame?.t) || frame.t < 0 || frame.t > 604800 || frames.length && frame.t <= frames.at(-1).t) return null;
    const actors = list(frame.actors).slice(0, 10).flatMap(actor => {
      if (!['operator', 'coop', 'enemy'].includes(actor?.role) || ![actor.x, actor.y, actor.w, actor.h].every(Number.isFinite)
        || actor.x < 0 || actor.y < 0 || actor.w <= 0 || actor.h <= 0 || actor.x + actor.w > raw.width + 1 || actor.y + actor.h > raw.height + 1) return [];
      return [{ role: actor.role, x: actor.x, y: actor.y, w: actor.w, h: actor.h }];
    });
    if (!actors.some(actor => actor.role === 'operator')) return null;
    frames.push({ t: frame.t, actors });
  }
  if (frames.length < 2 || frames.at(-1).t - frames[0].t > 4) return null;
  const surfaces = list(raw.surfaces).slice(0, 48).flatMap(surface => [surface?.x, surface?.y, surface?.w, surface?.h].every(Number.isFinite)
    && surface.x >= 0 && surface.y >= 0 && surface.w > 0 && surface.h > 0 && surface.x + surface.w <= raw.width + 1
    && surface.y + surface.h <= raw.height + 1 ? [{ x: surface.x, y: surface.y, w: surface.w, h: surface.h }] : []);
  return { schema: 132, mediaId: raw.mediaId, origin: 'live-game-telemetry', campaignId: text(raw.campaignId),
    missionSignature: text(raw.missionSignature), width: raw.width, height: raw.height, frames, surfaces,
    duration: frames.at(-1).t - frames[0].t };
}

function deriveJournal(state) {
  return [...Object.keys(state.discovered).map(id => `evidence:${id}`), ...state.readIds.map(id => `read:${id}`),
    ...Object.keys(state.decisions).map(id => `conclusion:${id}`), ...state.playedIds.map(id => `played:${id}`)];
}

export function normalizeNarrativeEvidenceV132(raw, context = {}) {
  const source = object(raw) && raw.schema === 132 ? raw : {}, state = createNarrativeEvidenceV132();
  for (const [id, receipt] of Object.entries(object(source.discovered) ? source.discovered : {})) {
    if (!records.has(id) || !object(receipt)) continue;
    state.discovered[id] = { id, campaignId: text(receipt.campaignId), worldId: text(receipt.worldId),
      missionSignature: text(receipt.missionSignature), operationId: text(receipt.operationId),
      source: records.get(id).origin === 'field' ? records.get(id).requiresAction ? 'scan' : 'physical' : records.get(id).origin,
      elapsed: clamp(finite(receipt.elapsed), 0, 604800) };
  }
  const legacy = normalizeNarrativeArchivesV68(context.narrativeArchives);
  for (const [id, receipt] of Object.entries(legacy.discovered)) if (!state.discovered[id]) state.discovered[id] = {
    id, campaignId: receipt.campaignId, worldId: receipt.worldId, missionSignature: receipt.levelId,
    operationId: 'qz17-ghost-cargo', source: 'legacy-qz17', elapsed: 0 };
  const qz18 = normalizeArchiveRelayArchiveV122(context.archiveRelayArchivesV122).case;
  if (qz18) for (const originalId of qz18.documentIds) {
    const id = qz18Id(originalId); state.discovered[id] ||= { id, campaignId: 'special-archive-relay', worldId: 'world-05-lethe',
      missionSignature: '', operationId: qz18.operationId, source: 'legacy-qz18', elapsed: 0 };
  }
  state.readIds = unique([...list(source.readIds), ...legacy.readIds, ...(qz18 ? qz18.documentIds.map(qz18Id) : [])]).filter(id => state.discovered[id]);
  for (const chain of chains.values()) if (source.decisions?.[chain.id] === chain.optionId
    && chain.requirements.every(id => state.discovered[id] && state.readIds.includes(id))) state.decisions[chain.id] = chain.optionId;
  for (const [id, rawCapture] of Object.entries(object(source.mediaCaptures) ? source.mediaCaptures : {})) {
    const definition = media.get(id), capture = normalizeCapture(rawCapture);
    if (definition && capture?.mediaId === id && state.discovered[definition.evidenceId]) state.mediaCaptures[id] = capture;
  }
  state.playedIds = unique(source.playedIds).filter(id => state.mediaCaptures[id]);
  state.journal = deriveJournal(state);
  return state;
}

export function validateNarrativeEvidenceV132(raw, context = {}) {
  if (!object(raw) || raw.schema !== 132 || !object(raw.discovered) || !object(raw.decisions) || !object(raw.mediaCaptures)
    || !Array.isArray(raw.readIds) || !Array.isArray(raw.playedIds) || !Array.isArray(raw.journal)) return { valid: false, reason: 'narrative-evidence-schema' };
  const state = normalizeNarrativeEvidenceV132(raw, context);
  if (Object.keys(raw.discovered).some(id => !records.has(id) || !object(raw.discovered[id]))
    || unique(raw.readIds).length !== raw.readIds.length || raw.readIds.some(id => !state.discovered[id])
    || unique(raw.playedIds).length !== raw.playedIds.length || raw.playedIds.some(id => !state.mediaCaptures[id])
    || Object.keys(raw.decisions).some(id => state.decisions[id] !== raw.decisions[id])
    || Object.keys(raw.mediaCaptures).some(id => !state.mediaCaptures[id])
    || raw.journal.some(id => !state.journal.includes(id))) return { valid: false, reason: 'narrative-evidence-inconsistent' };
  return { valid: true, state };
}

function ledger(save) { return normalizeNarrativeEvidenceV132(save?.narrativeEvidenceV132, save); }
export function markNarrativeEvidenceReadV132(save, id) {
  if (NARRATIVE_COLLECTABLES_V68.some(entry => entry.id === id)) return markNarrativeCollectableReadV68(save, id);
  const state = ledger(save);
  if (!state.discovered[id]) return { applied: false, reason: 'not-discovered' };
  if (state.readIds.includes(id)) return { applied: false, reason: 'already-read' };
  state.readIds.push(id); save.narrativeEvidenceV132 = normalizeNarrativeEvidenceV132(state, save);
  return { applied: true, reason: 'read', rewards: {} };
}
export function recordNarrativeEvidenceDecisionV132(save, optionId) {
  const chain = options.get(optionId);
  if (!chain) return recordNarrativeDecisionV68(save, optionId);
  const state = ledger(save);
  if (state.decisions[chain.id]) return { applied: false, reason: 'already-applied' };
  if (!chain.requirements.every(id => state.discovered[id] && state.readIds.includes(id))) return { applied: false, reason: 'requirements-not-met' };
  state.decisions[chain.id] = optionId; save.narrativeEvidenceV132 = normalizeNarrativeEvidenceV132(state, save);
  return { applied: true, reason: 'conclusion-recorded', message: chain.conclusion, rewards: {} };
}
export function markNarrativeMediaPlayedV132(save, mediaId) {
  const state = ledger(save);
  if (!state.mediaCaptures[mediaId]) return { applied: false, reason: 'media-unavailable' };
  if (state.playedIds.includes(mediaId)) return { applied: false, reason: 'already-played' };
  state.playedIds.push(mediaId); save.narrativeEvidenceV132 = normalizeNarrativeEvidenceV132(state, save);
  return { applied: true, reason: 'media-played', rewards: {} };
}

export function resolveNarrativeMediaPlaybackV132(value) {
  const definition = media.get(value?.id), capture = normalizeCapture(value?.capture);
  return definition && capture?.mediaId === definition.id ? freeze({ ...clone(definition), available: true, capture, played: value.played === true }) : null;
}

export function getNarrativeEvidenceModelV132(save) {
  const state = ledger(save), legacy = getNarrativeInvestigationV68(save), discovered = new Set(Object.keys(state.discovered));
  const entries = NARRATIVE_EVIDENCE_RECORDS_V132.map(entry => ({ ...clone(entry), discovered: discovered.has(entry.id),
    read: state.readIds.includes(entry.id), location: entry.family ? { ship: 'Mission de navire', colony: 'Mission de colonie', field: 'Mission de terrain' }[entry.family] : entry.origin === 'legacy-qz18' ? 'Relais QZ-18' : 'Quai QZ-17',
    media: entry.mediaId ? { ...clone(media.get(entry.mediaId)), available: Boolean(state.mediaCaptures[entry.mediaId]),
      capture: clone(state.mediaCaptures[entry.mediaId] || null), played: state.playedIds.includes(entry.mediaId) } : null }));
  return { ...legacy, schema: 132, entries,
    relations: NARRATIVE_EVIDENCE_RELATIONS_V132.map(relation => ({ ...clone(relation),
      active: discovered.has(claimRecords.get(relation.fromClaimId)) && discovered.has(claimRecords.get(relation.toClaimId)) })),
    decisions: [...legacy.decisions, ...NARRATIVE_EVIDENCE_CHAINS_V132.map(chain => ({ id: chain.optionId, decisionId: chain.id,
      label: chain.title, description: chain.conclusion, requirements: [...chain.requirements],
      available: !state.decisions[chain.id] && chain.requirements.every(id => discovered.has(id) && state.readIds.includes(id)),
      selected: Boolean(state.decisions[chain.id]), lockedByChoice: false,
      reason: chain.requirements.some(id => !discovered.has(id)) ? chain.hint : 'Lire toutes les preuves liées avant de conclure.' }))],
    chains: NARRATIVE_EVIDENCE_CHAINS_V132.map(chain => ({ ...clone(chain), collected: chain.requirements.filter(id => discovered.has(id)).length,
      read: chain.requirements.filter(id => state.readIds.includes(id)).length, complete: Boolean(state.decisions[chain.id]) })),
    journal: state.journal.map(id => { const [kind, target] = id.split(':'); return { id, kind, target,
      label: kind === 'conclusion' ? chains.get(target)?.title : kind === 'played' ? media.get(target)?.title : records.get(target)?.title }; }),
    discoveredCount: discovered.size, totalCount: entries.length, unreadCount: entries.filter(entry => entry.discovered && !entry.read).length,
    mediaCoverage: { playableCaptures: Object.keys(state.mediaCaptures).length, audioFiles: 0, historicalVideoFiles: 0,
      notice: 'Les textes restent des documents. Le corpus de voix, vidéos historiques et enregistrements sonores reste à produire.' } };
}

const center = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });
const distance = (a, b) => { const left = center(a), right = center(b); return Math.hypot(left.x - right.x, left.y - right.y); };
const active = engine => engine.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88 && engine.mission?.state === 'active';
const available = (engine, actor) => active(engine) && actor?.alive && !actor.downed && !actor.inVehicle && !actor.climbing && !actor.ventTransit
  && actor.grounded && engine.canPerformGameplayAction(actor) && !actor.reloading && !(actor.meleeClock > 0)
  && !(actor.toolUseClock > 0) && !(actor.interactionClock > 0);
const bounds = engine => engine.missionLevelBounds || engine.missionLevelRuntime?.dimensions || { width: 6200, height: 1080 };
const clear = (engine, actor, target) => {
  const from = center(actor), to = center(target);
  return !firstProjectileObstacleV83({ ...from, w: 0, h: 0 }, { x: to.x - from.x, y: to.y - from.y }, {
    walls: [...list(engine.walls), ...list(engine.covers)].filter(item => !item.destroyed),
    doors: engine.closedDoorColliders?.() || list(engine.doors).filter(door => !door.open), platforms: list(engine.platforms) });
};

/** Returns one supported physical surface in an ordinary authored level. */
function placeEvidence(engine, definition) {
  const dimensions = bounds(engine), desired = dimensions.width * definition.ratio, w = 46, h = 32;
  const surfaces = list(engine.platforms).filter(surface => surface.w >= 140 && surface.h > 0 && surface.y > 100
    && surface.x >= 0 && surface.x + surface.w <= dimensions.width + 1 && surface.y <= dimensions.height);
  const obstructions = [...list(engine.walls), ...list(engine.covers), ...list(engine.doors), ...list(engine.hazards),
    ...list(engine.lifts), ...list(engine.ladders), engine.powerNode, engine.archiveTerminal, engine.objective,
    engine.weaponPickup, engine.toolPickup].filter(Boolean);
  const candidates = [];
  for (const surface of surfaces) {
    for (let x = surface.x + 42; x + w < surface.x + surface.w - 30; x += 64) {
      const point = { x, y: surface.y - h, w, h };
      if (obstructions.some(obstacle => Number.isFinite(obstacle.x) && Number.isFinite(obstacle.y)
        && x < obstacle.x + finite(obstacle.w, 40) + 110 && x + w > obstacle.x - 110
        && point.y < obstacle.y + finite(obstacle.h, 90) + 70 && point.y + h > obstacle.y - 70)) continue;
      const priority = Math.abs(x + w / 2 - desired) + (surface.floor ? 0 : 350);
      candidates.push({ ...point, id: definition.id, surfaceId: surface.id, priority });
    }
  }
  return candidates.sort((a, b) => a.priority - b.priority)[0] || null;
}

export function withNarrativeEvidenceV132(Base) {
  if (Base.narrativeEvidenceRuntimeV132) return Base;
  return class NarrativeEvidenceRuntimeV132 extends Base {
    static narrativeEvidenceRuntimeV132 = true;
    #scanCommitV132 = null;

    start(options = {}) {
      this.evidenceSaveV132 = object(options.narrativeArchiveSave) ? options.narrativeArchiveSave
        : { narrativeEvidenceV132: options.narrativeEvidenceV132, narrativeArchives: options.narrativeArchives,
          archiveRelayArchivesV122: options.archiveRelayArchivesV122 };
      this.evidenceSaveV132.narrativeEvidenceV132 = ledger(this.evidenceSaveV132);
      this.evidenceActorsV132 = []; this.evidenceFrameBufferV132 = []; this.evidenceFrameClockV132 = 0;
      this.evidencePersistV132 = typeof options.onNarrativeArchivesChange === 'function' ? options.onNarrativeArchivesChange : null;
      this.evidenceConfiguredV132 = false;
      const result = super.start(options);
      this.configureNarrativeEvidenceV132(); this.syncLegacyEvidenceV132();
      return { ...result, narrativeEvidenceV132: this.narrativeEvidenceSnapshotV132() };
    }

    configureNarrativeEvidenceV132() {
      this.evidenceActorsV132 = []; this.evidenceConfiguredV132 = true;
      const template = this.missionLevelRuntime?.templateId;
      const family = { 'ship-interior-vertical': 'ship', 'colony-multiroute': 'colony', 'planet-exterior': 'field' }[template];
      // Dedicated authored operations retain their own stations and extraction
      // rules. These optional physical clues belong to ordinary mission routes.
      if (!family || String(this.campaign?.id || '').startsWith('special-') || this.neuro?.active || this.editorMode) return;
      for (const definition of FIELD_EVIDENCE_V132.filter(entry => entry.family === family)) {
        const placement = placeEvidence(this, definition);
        if (placement) this.evidenceActorsV132.push({ ...placement, label: definition.shortTitle, requiresAction: definition.requiresAction || null });
      }
      if (this.evidenceActorsV132.length) this.loadNarrativeCollectableVisualsV68?.();
    }

    syncLegacyEvidenceV132() {
      const previous = this.evidenceSaveV132.narrativeEvidenceV132;
      let state = ledger(this.evidenceSaveV132);
      if (this.isArchiveRelayV122?.() && validateArchiveRelayStateV122(this.archiveRelayV122).valid) {
        for (const originalId of this.archiveRelayV122.discoveredIds) {
          const id = qz18Id(originalId); state.discovered[id] ||= this.evidenceReceiptV132(id, 'legacy-qz18');
        }
        state.readIds = unique([...state.readIds, ...this.archiveRelayV122.readIds.map(qz18Id)]);
        state = normalizeNarrativeEvidenceV132(state, this.evidenceSaveV132);
      }
      this.evidenceSaveV132.narrativeEvidenceV132 = state;
      return JSON.stringify(previous) !== JSON.stringify(state);
    }

    evidenceReceiptV132(id, source = 'physical') {
      return { id, campaignId: this.campaign?.id || '', worldId: this.world?.id || '',
        missionSignature: this.missionLevelRuntime?.signature || '', operationId: this.missionPlan?.operation?.id || this.campaign?.id || '',
        source, elapsed: finite(this.mission?.elapsed) };
    }

    persistEvidenceV132(next, mutation) {
      const previous = this.evidenceSaveV132.narrativeEvidenceV132;
      this.evidenceSaveV132.narrativeEvidenceV132 = normalizeNarrativeEvidenceV132(next, this.evidenceSaveV132);
      try { this.evidencePersistV132?.(clone(this.evidenceSaveV132.narrativeEvidenceV132), clone(mutation)); }
      catch (error) {
        this.evidenceSaveV132.narrativeEvidenceV132 = previous;
        this.onEvent?.({ type: 'narrative-evidence-save-failed-v132', message: 'Preuve non sauvegardée ; réessayez au même point.', evidenceId: mutation.evidenceId });
        return false;
      }
      this.onEvent?.({ type: 'narrative-evidence-updated-v132', evidenceId: mutation.evidenceId || null, mediaId: mutation.mediaId || null,
        campaignId: this.campaign?.id, rewards: {} });
      return true;
    }

    nearestNarrativeEvidenceV132(actor = this.player, { includeCollected = false } = {}) {
      const state = ledger(this.evidenceSaveV132);
      return this.evidenceActorsV132.filter(item => includeCollected || !state.discovered[item.id])
        .filter(item => distance(actor, item) <= 118 && clear(this, actor, item))
        .sort((a, b) => distance(actor, a) - distance(actor, b))[0] || null;
    }

    captureEvidenceTraceV132(state, evidenceId) {
      const definition = records.get(evidenceId);
      if (!definition?.mediaId || state.mediaCaptures[definition.mediaId] || this.evidenceFrameBufferV132.length < 2) return false;
      const dimensions = bounds(this);
      const capture = normalizeCapture({ schema: 132, mediaId: definition.mediaId, origin: 'live-game-telemetry',
        campaignId: this.campaign?.id || '', missionSignature: this.missionLevelRuntime?.signature || '',
        ...dimensions, frames: this.evidenceFrameBufferV132.slice(-12),
        surfaces: [...list(this.platforms), ...list(this.walls), ...list(this.covers), ...(this.closedDoorColliders?.() || [])].slice(0, 48) });
      if (!capture) return false;
      state.mediaCaptures[definition.mediaId] = capture; return true;
    }

    collectNarrativeEvidenceV132(actor = this.player, evidenceId = this.nearestNarrativeEvidenceV132(actor)?.id) {
      const physical = this.evidenceActorsV132.find(item => item.id === evidenceId), definition = records.get(evidenceId);
      const scan = this.#scanCommitV132?.actor === actor && this.#scanCommitV132?.evidenceId === evidenceId;
      if (!available(this, actor) || !physical || !definition || distance(actor, physical) > 118 || !clear(this, actor, physical)) return false;
      if (definition.requiresAction && !scan) return false;
      const state = ledger(this.evidenceSaveV132);
      if (state.discovered[evidenceId]) return false;
      state.discovered[evidenceId] = this.evidenceReceiptV132(evidenceId, scan ? 'scan' : 'physical');
      this.captureEvidenceTraceV132(state, evidenceId);
      if (!this.persistEvidenceV132(state, { type: 'discovered', evidenceId, rewards: {} })) return false;
      this.setInteractionAnimation?.(actor, 'ground-interact', .55);
      this.onEvent?.({ type: 'archive-reader-open', collectableId: evidenceId, operationId: 'narrative-evidence-v132' });
      return true;
    }

    interact(actor = this.player) {
      if (available(this, actor)) {
        const item = this.nearestNarrativeEvidenceV132(actor);
        if (item) {
          if (item.requiresAction) return this.startNarrativeEvidenceScanV132(actor, item);
          return this.collectNarrativeEvidenceV132(actor, item.id);
        }
      }
      return super.interact(actor);
    }

    startNarrativeEvidenceScanV132(actor, item) {
      if (!available(this, actor) || item.requiresAction !== 'deep-scan' || !clear(this, actor, item)) return false;
      const equipment = this.evidenceScannerV132(actor);
      if (!equipment) { this.onEvent?.({ type: 'narrative-evidence-locked-v132', evidenceId: item.id, message: 'Scanner chargé requis pour analyser ce résidu.' }); return false; }
      const accepted = this.useEquipment(equipment.instanceId || equipment.id, actor);
      const task = this.fieldActionsV124?.get(actor);
      if (accepted && task?.kind === 'deep-scan') task.narrativeEvidenceIdV132 = item.id;
      return Boolean(accepted && task?.narrativeEvidenceIdV132 === item.id);
    }

    evidenceScannerV132(actor) {
      if (actor.crewV85?.personalEquipment) return actor.crewV85.gear.find(entry => entry.function === 'scan'
        && this.getFieldEquipmentAvailabilityV124(entry.instanceId, actor).ok) || null;
      return [...(this.equipmentActions?.values() || [])].find(entry => entry.action === 'deep-scan'
        && this.getFieldEquipmentAvailabilityV124(entry.id, actor).ok) || null;
    }

    commitFieldActionV124(actor, task) {
      const evidenceId = task?.narrativeEvidenceIdV132, item = this.evidenceActorsV132?.find(entry => entry.id === evidenceId);
      if (evidenceId && (!item || distance(actor, item) > 118 || !clear(this, actor, item))) return false;
      let result = super.commitFieldActionV124(actor, task);
      // The original personal recon tool targets living contacts. A tagged
      // physical sample is also a valid analysis target, while retaining the
      // selected instance and its native charge/consequence transaction.
      if (!result && item?.requiresAction === 'deep-scan' && task.kind === 'deep-scan' && task.source === 'crew'
        && task.crewFunction === 'scan' && available(this, actor) && !(actor.supportClock > 0)) {
        const gear = actor.crewV85?.gear, selected = gear?.find(entry => entry.instanceId === task.equipmentId && entry.function === 'scan');
        if (selected && actor.crewV85.charges?.[selected.instanceId] > 0) {
          actor.crewV85.gear = [selected, ...gear.filter(entry => entry !== selected)];
          try { result = this.spendCrewSupportV85(actor, 'scan'); } finally { actor.crewV85.gear = gear; }
          if (result) {
            actor.supportClock = 6; this.trackerPulse = 1; this.squadTelemetry.scans += 1;
            this.recordSquadConsequence(actor, 'scan', { evidenceId, contacts: 0 });
          }
        }
      }
      // Native completion has already removed the working task and committed
      // its actual equipment charge. No second or fabricated resource is used.
      if (result && task.kind === 'deep-scan') {
        const target = item || this.nearestNarrativeEvidenceV132(actor);
        if (target?.requiresAction === 'deep-scan') {
          this.#scanCommitV132 = { actor, evidenceId: target.id };
          try { this.collectNarrativeEvidenceV132(actor, target.id); } finally { this.#scanCommitV132 = null; }
        }
      }
      return result;
    }

    markArchiveRelayReadV122(id) {
      const result = super.markArchiveRelayReadV122(id);
      if (result?.applied) {
        this.syncLegacyEvidenceV132();
        this.persistEvidenceV132(ledger(this.evidenceSaveV132), { type: 'legacy-read', evidenceId: qz18Id(id), rewards: {} });
      }
      return result;
    }

    update(delta) {
      const result = super.update(delta);
      if (!active(this) || !this.player?.alive || !this.evidenceActorsV132.length) return result;
      this.evidenceFrameClockV132 += Math.max(0, finite(delta));
      if (this.evidenceFrameClockV132 < .25) return result;
      this.evidenceFrameClockV132 %= .25;
      const dimensions = bounds(this), actorList = [this.player, this.coopEnabled ? this.coop : null,
        ...list(this.getVisibleEnemiesV65?.() || this.enemies).filter(enemy => enemy.alive && !enemy.dormant && !enemy.ventTransit
          && (!enemy.rearEntryV130 || enemy.rearEntryV130.phase === 'active'))].filter(Boolean).slice(0, 10);
      const frame = { t: finite(this.mission.elapsed), actors: actorList.filter(actor => actor.x >= 0 && actor.y >= 0
        && actor.x + actor.w <= dimensions.width && actor.y + actor.h <= dimensions.height).map(actor => ({
        role: actor === this.player ? 'operator' : actor === this.coop ? 'coop' : 'enemy', x: actor.x, y: actor.y, w: actor.w, h: actor.h })) };
      if (frame.actors.some(actor => actor.role === 'operator')) this.evidenceFrameBufferV132.push(frame);
      this.evidenceFrameBufferV132 = this.evidenceFrameBufferV132.slice(-12);
      const state = ledger(this.evidenceSaveV132);
      for (const definition of FIELD_EVIDENCE_V132) if (definition.mediaId && state.discovered[definition.id]
        && !state.mediaCaptures[definition.mediaId] && this.evidenceActorsV132.some(actor => actor.id === definition.id)
        && this.captureEvidenceTraceV132(state, definition.id)) this.persistEvidenceV132(state, { type: 'media-captured', mediaId: definition.mediaId, rewards: {} });
      return result;
    }

    getNarrativeEvidenceObjectivesV132() {
      const state = ledger(this.evidenceSaveV132);
      return this.evidenceActorsV132.filter(item => !state.discovered[item.id]).map(item => ({
        id: item.id, label: `${item.requiresAction ? 'Analyser' : 'Récupérer'} · ${item.label}`, x: item.x + item.w / 2,
        y: item.y + item.h, kind: item.requiresAction ? 'scan' : 'evidence', optional: true }));
    }
    getInteractionPrompt(actor = this.player) {
      const item = this.nearestNarrativeEvidenceV132(actor);
      if (item?.requiresAction && available(this, actor) && !this.evidenceScannerV132(actor)) return `SCANNER CHARGÉ REQUIS · ${item.label}`;
      return item ? `E · ${item.requiresAction ? 'ANALYSER AU SCANNER' : 'RÉCUPÉRER'} · ${item.label}` : super.getInteractionPrompt(actor);
    }
    missionNavigationMapV121() {
      const model = super.missionNavigationMapV121();
      if (!this.evidenceActorsV132.length) return model;
      if (model) return { ...model, goals: [...list(model.goals), ...this.getNarrativeEvidenceObjectivesV132()] };
      const surfaces = list(this.platforms), dimensions = bounds(this);
      return { mode: 'local', label: 'PLAN LOCAL · INDICES FACULTATIFS', width: dimensions.width,
        minY: Math.min(...surfaces.map(surface => surface.y)), maxY: Math.max(...surfaces.map(surface => surface.y)),
        surfaces: surfaces.map(surface => ({ id: surface.id, x: surface.x, end: surface.x + surface.w, y: surface.y })),
        ladders: list(this.ladders).map(ladder => ({ id: ladder.id, x: ladder.x, top: ladder.top ?? ladder.y,
          bottom: ladder.bottom ?? ladder.y + ladder.h })), goals: this.getNarrativeEvidenceObjectivesV132(),
        player: { x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h } };
    }

    drawWorld(ctx) {
      const result = super.drawWorld(ctx), state = ledger(this.evidenceSaveV132);
      for (const item of this.evidenceActorsV132) if (!state.discovered[item.id]) {
        ctx.save(); ctx.fillStyle = item.requiresAction ? '#a3ba79' : '#78baa5'; ctx.strokeStyle = '#daecd2';
        ctx.fillRect(item.x + 6, item.y + 4, item.w - 12, item.h - 4); ctx.strokeRect(item.x + 6, item.y + 4, item.w - 12, item.h - 4);
        ctx.fillStyle = '#122524'; ctx.fillRect(item.x + 12, item.y + 9, item.w - 24, 8);
        ctx.fillStyle = '#d9e4c5'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(item.requiresAction ? 'SCAN' : 'PREUVE', item.x + item.w / 2, item.y - 5); ctx.restore();
      }
      return result;
    }

    captureResumeState() {
      this.syncLegacyEvidenceV132();
      return { ...super.captureResumeState(), narrativeEvidenceV132: ledger(this.evidenceSaveV132) };
    }
    applyResumeState(raw) {
      // Reject an inconsistent narrative payload before the base runtime can
      // change any actor, inventory, objective or geometry.
      const saved = raw?.narrativeEvidenceV132;
      const check = saved ? validateNarrativeEvidenceV132(saved, this.evidenceSaveV132) : null;
      if (check && !check.valid) return { applied: false, reason: check.reason };
      const result = super.applyResumeState(raw);
      if (!result?.applied) return result;
      if (check) {
        const current = ledger(this.evidenceSaveV132), next = check.state;
        // Physical evidence and read history already committed to the global
        // journal survive a rewind to an earlier local checkpoint.
        next.discovered = { ...next.discovered, ...current.discovered };
        next.readIds = unique([...next.readIds, ...current.readIds]); next.decisions = { ...next.decisions, ...current.decisions };
        next.mediaCaptures = { ...next.mediaCaptures, ...current.mediaCaptures }; next.playedIds = unique([...next.playedIds, ...current.playedIds]);
        this.evidenceSaveV132.narrativeEvidenceV132 = normalizeNarrativeEvidenceV132(next, this.evidenceSaveV132);
      }
      this.evidenceFrameBufferV132 = []; this.evidenceFrameClockV132 = 0;
      if (this.evidenceConfiguredV132) this.configureNarrativeEvidenceV132();
      this.syncLegacyEvidenceV132();
      return { ...result, narrativeEvidenceRestoredV132: Boolean(check) };
    }
    stop(...args) {
      const result = super.stop(...args); this.evidenceFrameBufferV132 = []; this.evidenceActorsV132 = []; return result;
    }
    narrativeEvidenceSnapshotV132() {
      const state = ledger(this.evidenceSaveV132);
      return { schema: 132, discovered: Object.keys(state.discovered).length, read: state.readIds.length,
        conclusions: Object.keys(state.decisions).length, objectives: this.getNarrativeEvidenceObjectivesV132(),
        placements: this.evidenceActorsV132.map(item => ({ id: item.id, x: item.x, y: item.y, w: item.w, h: item.h,
          surfaceId: item.surfaceId, collected: Boolean(state.discovered[item.id]) })), mediaCaptures: Object.keys(state.mediaCaptures).length };
    }
    getSnapshot() { return { ...super.getSnapshot(), narrativeEvidenceV132: this.narrativeEvidenceSnapshotV132() }; }
  };
}
