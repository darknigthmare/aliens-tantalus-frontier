// An original Tantalus investigation. These authored records are fiction, not recovered film files.
export const ARCHIVE_RELAY_OPERATION_V122 = 'archive-relay';
export const ARCHIVE_RELAY_CAMPAIGN_V122 = Object.freeze({
  id: 'special-archive-relay', name: 'QZ-18 · LE DERNIER RELAIS', mode: 'INVESTIGATION',
  worldId: 'world-05-lethe', year: 2204, canon: 'project-continuity', routes: 2,
  source: 'Tantalus Special Operations', specialOperationId: ARCHIVE_RELAY_OPERATION_V122,
  templateId: 'colony-multiroute', objective: 'Restaurer les archives locales et établir la cause du retard de détresse.',
  summary: 'PDA, alimentation, postes départementaux et confrontation des preuves.',
  description: 'Une enquête solo dans le relais QZ-18. Récupérer les traces locales, comparer leurs horaires, puis ouvrir le sas de retour.'
});
export const ARCHIVE_RELAY_DOCUMENTS_V122 = Object.freeze([
  { id: 'pda-custody', terminal: 'pda', type: 'PDA', department: 'Équipe de quai',
    title: 'Badge laissé au pupitre', author: 'I. Voss · contremaître', time: '18:39',
    summary: 'Le porteur du badge et son utilisation ne sont pas nécessairement la même personne.',
    body: 'Je laisse mon badge d’équipe au pupitre de sécurité. Il donne accès aux postes locaux, pas au réseau compagnie. Nous évacuons la galerie par l’escalier nord. Si le registre affiche encore mon nom après 18:39, vérifiez la caméra avant de conclure que je suis revenu. La photo jointe n’a pas survécu ; ce texte est tout ce que le module a conservé.' },
  { id: 'engineering-clock', terminal: 'engineering', type: 'TICKET', department: 'Ingénierie',
    title: 'Synchronisation des horloges', author: 'A. Mendel · maintenance', time: '18:40',
    summary: 'Les trois postes partageaient le même signal horaire au moment de l’incident.',
    body: 'Ticket 18-042. Contrôle du signal commun effectué à 18:00 et à 18:40. Écart inférieur à une seconde entre sécurité, fret et relais. Le ticket automatique suggérant une dérive de vingt minutes appartient à la veille et a été fermé. Ne pas l’utiliser pour expliquer les événements de ce soir. Mémoire locale intacte ; réseau extérieur indisponible depuis l’évacuation.' },
  { id: 'engineering-power', terminal: 'engineering', type: 'TÉLÉMÉTRIE', department: 'Ingénierie',
    title: 'Alimentation sans interruption', author: 'Relais QZ-18 · diagnostic local', time: '18:42',
    summary: 'L’alimentation était stable ; la priorité d’émission a été modifiée.',
    body: 'Le journal de tension indique une alimentation stable de 18:00 à 19:00. À 18:42, une commande administrative a déplacé les demandes de détresse derrière les transferts de fret. Aucun défaut matériel n’est enregistré à cette heure. La panne actuelle vient de l’isolement du relais après évacuation : elle ne prouve pas une panne antérieure. Les chiffres bruts et leurs horodatages sont conservés dans ce relevé.' },
  { id: 'security-access', terminal: 'security', type: 'REGISTRE', department: 'Sécurité',
    title: 'Une identité, deux traces', author: 'Service sécurité · journal des accès', time: '18:43',
    summary: 'Le badge de Voss a signé une commande après son départ, sans identification visuelle.',
    body: '18:39 : équipe de quai sortie par l’escalier nord. 18:43 : badge Voss utilisé au poste fret pour confirmer le profil « priorité cargaison ». Le capteur de porte confirme une ouverture mais la caméra était masquée par de la résine ; aucun visage ne peut être identifié. Ce registre confirme l’utilisation d’un droit d’accès, pas l’identité de la personne qui l’a employé. Attribution personnelle non établie.' },
  { id: 'freight-manifest', terminal: 'freight', type: 'COURRIEL', department: 'Fret',
    title: 'Retard classé technique', author: 'Poste fret → coordination', time: '18:55',
    summary: 'Le rapport officiel attribue à une panne le retard que les relevés ne montrent pas.',
    body: 'Objet : clôture provisoire QZ-18. La demande de secours a quitté le relais à 18:54. Le retard depuis 18:41 est classé comme incident technique, sans responsabilité de procédure. Continuer le transfert des conteneurs en priorité. Ce courriel est la version envoyée ; il ne contient ni le journal de tension ni la commande de priorité. Son explication doit donc être confrontée aux autres postes.' },
  { id: 'freight-draft', terminal: 'freight', type: 'BROUILLON', department: 'Fret',
    title: 'Message de secours retenu', author: 'M. Rami · opératrice fret', time: '18:41',
    summary: 'La détresse a été saisie avant la modification de priorité et retenue dans la file.',
    body: 'Brouillon restauré depuis la mémoire locale. « Secours immédiat, personnel coincé au quai nord. » Saisi à 18:41, placé en attente à 18:42, libéré à 18:54. Je n’ai pas réussi à joindre la coordination. Quelqu’un a confirmé le profil cargaison au poste après mon départ ; je ne sais pas qui. Conserver la file d’émission, elle vaut davantage que ma supposition. Ce message n’a jamais été envoyé comme courriel.' }
].map(record => Object.freeze(record)));
export const ARCHIVE_RELAY_DOCUMENT_IDS_V122 = Object.freeze(ARCHIVE_RELAY_DOCUMENTS_V122.map(record => record.id));
export const ARCHIVE_RELAY_TERMINALS_V122 = Object.freeze(['pda', 'engineering', 'security', 'freight', 'analysis']);
export const ARCHIVE_RELAY_VERDICTS_V122 = Object.freeze([
  Object.freeze({ id: 'clock-failure', label: 'Dérive horaire et panne matérielle',
    explanation: 'Le ticket horaire et le relevé de tension doivent confirmer cette hypothèse.' }),
  Object.freeze({ id: 'delayed-distress', label: 'Détresse retardée par la priorité de fret',
    explanation: 'Les horaires sont cohérents ; la file et le diagnostic documentent un retard administratif. Auteur non identifié.' })
]);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const ids = value => Array.isArray(value) ? [...new Set(value.filter(id => ARCHIVE_RELAY_DOCUMENT_IDS_V122.includes(id)))] : [];
const bounded = (value, max) => Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
export function archiveRelayPhaseV122(state) {
  return state.complete ? 'complete' : !state.badge ? 'pda' : !state.power ? 'power'
    : state.readIds.length < ARCHIVE_RELAY_DOCUMENT_IDS_V122.length ? 'records' : !state.verdict ? 'analysis' : 'extract';
}
export function createArchiveRelayStateV122() {
  return { schema: 122, operationId: ARCHIVE_RELAY_OPERATION_V122, phase: 'pda', badge: false, power: false,
    relayProgress: 0, restoredDraft: false, restoreProgress: 0, discoveredIds: [], readIds: [], verdict: null,
    complete: false, rewardClaimed: false, rewards: null, journal: ['arrival'], rejectedVerdicts: 0 };
}
export function sanitizeArchiveRelayStateV122(raw = {}) {
  const state = createArchiveRelayStateV122();
  for (const key of ['badge', 'power', 'restoredDraft', 'complete', 'rewardClaimed']) state[key] = raw[key] === true;
  state.relayProgress = bounded(raw.relayProgress, 3); state.restoreProgress = bounded(raw.restoreProgress, 4);
  state.discoveredIds = ids(raw.discoveredIds); state.readIds = ids(raw.readIds);
  state.verdict = raw.verdict === 'delayed-distress' ? raw.verdict : null;
  state.rejectedVerdicts = Math.floor(bounded(raw.rejectedVerdicts, 9999));
  state.journal = Array.isArray(raw.journal) ? [...new Set(raw.journal.filter(id =>
    ['arrival', 'badge', 'power', 'engineering', 'security', 'freight', 'draft', 'verdict', 'extracted'].includes(id)))].slice(0, 9) : ['arrival'];
  if (record(raw.rewards)) state.rewards = { credits: Math.floor(bounded(raw.rewards.credits, 10000)),
    salvage: Math.floor(bounded(raw.rewards.salvage, 999999)), intel: Math.floor(bounded(raw.rewards.intel, 999999)),
    retries: Math.floor(bounded(raw.rewards.retries, 9999)), elapsedSeconds: Math.floor(bounded(raw.rewards.elapsedSeconds, 604800)),
    noCasualty: raw.rewards.noCasualty === true, operationId: ARCHIVE_RELAY_OPERATION_V122, verdict: state.verdict };
  state.phase = archiveRelayPhaseV122(state); return state;
}
export function validateArchiveRelayStateV122(raw) {
  if (!record(raw) || raw.schema !== 122 || raw.operationId !== ARCHIVE_RELAY_OPERATION_V122) return { valid: false, reason: 'archive-relay-schema-mismatch' };
  const state = sanitizeArchiveRelayStateV122(raw);
  if (!Array.isArray(raw.discoveredIds) || !Array.isArray(raw.readIds)
    || state.discoveredIds.length !== raw.discoveredIds.length || state.readIds.length !== raw.readIds.length
    || raw.phase !== state.phase || (raw.verdict != null && raw.verdict !== state.verdict)
    || state.readIds.some(id => !state.discoveredIds.includes(id))
    || state.badge !== state.discoveredIds.includes('pda-custody')
    || state.power && (!state.badge || state.relayProgress !== 3)
    || state.relayProgress > 0 && !state.badge
    || !state.power && state.discoveredIds.some(id => id !== 'pda-custody')
    || state.restoredDraft !== state.discoveredIds.includes('freight-draft')
    || state.restoreProgress > 0 && (!state.power || !state.discoveredIds.includes('freight-manifest'))
    || state.restoredDraft && state.restoreProgress !== 4
    || state.verdict && (state.readIds.length !== 6 || !state.restoredDraft)
    || state.complete && (!state.verdict || !state.rewardClaimed || !state.rewards)
    || state.rewardClaimed !== state.complete || !state.complete && state.rewards !== null) {
    return { valid: false, reason: 'archive-relay-progress-inconsistent' };
  }
  return { valid: true, state };
}
export function archiveRelayReaderModelV122(state, terminal = 'analysis') {
  if (!ARCHIVE_RELAY_TERMINALS_V122.includes(terminal)) return null;
  const documents = ARCHIVE_RELAY_DOCUMENTS_V122.filter(entry => state.discoveredIds.includes(entry.id)
    && (terminal === 'analysis' || entry.terminal === terminal));
  return { title: terminal === 'analysis' ? 'QZ-18 · CONFRONTATION' : `POSTE LOCAL · ${documents[0]?.department || terminal.toUpperCase()}`,
    terminal, documents: documents.map(entry => ({ ...entry, read: state.readIds.includes(entry.id) })),
    readCount: state.readIds.length, total: 6, verdict: state.verdict,
    canDecide: terminal === 'analysis' && state.readIds.length === 6 && !state.verdict,
    decisions: terminal === 'analysis' ? ARCHIVE_RELAY_VERDICTS_V122.map(entry => ({ ...entry })) : [],
    notice: 'Archives locales rédigées pour le Tantalus. Photographies, vidéos et pistes audio absentes.' };
}
export function archiveRelayDossierV122(state) {
  const phase = archiveRelayPhaseV122(state);
  const stages = {
    pda: ['IDENTITÉ DU POSTE', 'E au PDA sur le quai ouest : récupérer le badge et lire la note.'],
    power: ['RÉTABLIR LE RELAIS', 'Maintenir E au relais pendant 3 s. Le badge autorise seulement les postes locaux.'],
    records: ['POSTES DÉPARTEMENTAUX', `Archives lues ${state.readIds.length}/6. Ingénierie et sécurité sur la passerelle ; fret au sol. E : ouvrir. Fret : F maintenu 4 s pour restaurer le brouillon.`],
    analysis: ['CONFRONTER LES PREUVES', 'E au poste de confrontation, avant le sas. Comparer les horaires sans inventer l’identité du responsable.'],
    extract: ['ROUTE AUTORISÉE', 'Le sas est ouvert. Rejoindre la balise à l’est et maintenir E pendant 2 s.'],
    complete: ['DOSSIER RECONSTITUÉ', 'Le transfert permanent et le versement dépendent de l’enregistrement du bilan de retour.']
  };
  return { phase, title: stages[phase][0], instruction: stages[phase][1], solo: true };
}
export function createArchiveRelayArchiveV122() { return { schema: 122, case: null }; }
export function normalizeArchiveRelayArchiveV122(raw) {
  const archive = createArchiveRelayArchiveV122(), entry = raw?.case;
  if (raw?.schema !== 122 || !record(entry) || entry.verdict !== 'delayed-distress'
    || !/^operation-[1-9][0-9]{0,8}-special-archive-relay$/.test(entry.operationId || '')
    || ids(entry.documentIds).length !== 6 || entry.documentIds.length !== 6) return archive;
  archive.case = { id: 'qz18-last-relay', operationId: entry.operationId, verdict: 'delayed-distress',
    documentIds: [...ARCHIVE_RELAY_DOCUMENT_IDS_V122], completedDay: Math.floor(bounded(entry.completedDay, 999999999)),
    completedHour: bounded(entry.completedHour, 24) };
  return archive;
}
export function getArchiveRelayArchiveV122(save) {
  const archive = normalizeArchiveRelayArchiveV122(save?.archiveRelayArchivesV122);
  if (!archive.case) return null;
  const state = { ...createArchiveRelayStateV122(), discoveredIds: [...archive.case.documentIds],
    readIds: [...archive.case.documentIds], verdict: archive.case.verdict };
  return { ...archiveRelayReaderModelV122(state, 'analysis'), receipt: archive.case, permanent: true };
}
