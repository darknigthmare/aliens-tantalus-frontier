import { APTITUDE_DEFINITIONS_V85, deriveRecruitIdentityV119, sanitizeRecruitProfileV85 } from './crew-recruitment-v85.js';

const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const list = value => Array.isArray(value) ? value : [];
const text = (value, limit = 160) => typeof value === 'string' ? value.slice(0, limit) : '';
const percentage = value => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const topic = (id, label, answer, source, evidence = {}) => ({ id, label, answer, source, evidence });

// This is a read-only view of existing records, never a new service log or quest.
// Do not turn generated dialogue into evidence that an event actually happened.
function recordedMissions(member) {
  const seen = new Set();
  return list(member.serviceHistoryV85).slice(-128).filter(entry => record(entry)
    && entry.schema === 85 && entry.type === 'mission'
    && /^operation-\d{1,9}-/.test(text(entry.operationId, 180)) && Number(entry.operationId.match(/^operation-(\d+)-/)[1]) > 0 && entry.operationId.length <= 180
    && ['success', 'failure', 'retreat'].includes(entry.outcome)
    && typeof entry.day === 'number' && Number.isFinite(entry.day) && entry.day >= 1 && entry.day <= 100000
    && typeof entry.hour === 'number' && Number.isFinite(entry.hour) && entry.hour >= 0 && entry.hour <= 24
    && !seen.has(entry.operationId) && seen.add(entry.operationId)).slice(-64);
}

function currentReadiness(member, synthetic) {
  const health = percentage(member.health), stress = percentage(member.stress), fatigue = percentage(member.fatigue);
  const evidence = { status: text(member.status, 30), health, stress, fatigue };
  if (member.status === 'injured' || health !== null && health < 60) return {
    answer: synthetic ? 'Mon intégrité nécessite une intervention. Je ne confirme pas une remise en service avant réparation.' : 'Je dois passer à l’infirmerie avant de reprendre une sortie. Je ne veux pas mettre l’équipe en difficulté.', evidence
  };
  if (member.status === 'recovering') return {
    answer: synthetic ? 'La remise en service est en cours. Mon affectation reste soumise au contrôle technique.' : 'Je suis en récupération. Une relève est préférable tant que le suivi médical n’est pas terminé.', evidence
  };
  if (fatigue !== null && fatigue >= 65) return {
    answer: synthetic ? 'Ma charge de service est élevée. Un cycle de maintenance est recommandé avant la prochaine affectation.' : 'J’ai besoin d’une relève et de repos. La fatigue finira par se voir dans mes décisions.', evidence
  };
  if (stress !== null && stress >= 65) return {
    answer: synthetic ? 'La charge opérationnelle est élevée. Je recommande un contrôle des priorités avec le groupe.' : 'La tension reste élevée. Un briefing clair et le contact avec le groupe m’aideront davantage qu’une nouvelle urgence.', evidence
  };
  if (health === null || stress === null || fatigue === null || member.status !== 'active') return {
    answer: synthetic ? 'Je ne confirme pas la disponibilité : le relevé d’état doit être vérifié.' : 'Vérifiez mon relevé d’état avant de me compter parmi les effectifs disponibles.', evidence
  };
  return { answer: synthetic ? 'Le relevé de service est nominal. Je reste disponible pour l’affectation confirmée.' : 'Le relevé est bon. Je suis disponible pour la prochaine affectation, après le briefing.', evidence };
}

const AFTER_MISSION = Object.freeze({
  human: {
    success: 'La sortie est enregistrée comme réussie. Je préfère garder les contrôles qui ont fonctionné et revoir le rapport avant de repartir.',
    failure: 'Cette sortie a échoué. Je veux que le prochain briefing tienne compte de ce qui n’a pas fonctionné, sans réécrire le résultat.',
    retreat: 'Nous avons interrompu la sortie. Le retour est enregistré comme une retraite, pas comme une victoire.'
  },
  synthetic: {
    success: 'Résultat de la sortie : réussite. Je conserve le rapport comme point de comparaison pour la prochaine opération.',
    failure: 'Résultat de la sortie : échec. Les paramètres de la prochaine opération doivent être réexaminés.',
    retreat: 'Résultat de la sortie : retraite. Une interruption ne doit pas être enregistrée comme une réussite.'
  }
});

/** Dialogue authored for Tantalus, grounded only in the current dossier.
 * Candidate biographies are pre-transfer fiction; service memories use recorded
 * V85 events. Named legacy NPCs receive no invented childhood or service record.
 * Historical MIRE identities are never reachable through this live crew channel.
 */
export function buildCrewConversationV120(member, { roster = [], campaignCatalog = [], equipmentCatalog = [] } = {}) {
  if (!record(member) || member.archive || typeof member.id !== 'string') return null;
  const profile = sanitizeRecruitProfileV85(member.recruitV85);
  const known = list(roster).find(entry => record(entry) && entry.id === member.id && !entry.archive);
  if (profile && profile.id !== member.id || !profile && (!known || known.candidate)) return null;
  // A malformed generated dossier must not be downgraded into a permanent NPC.
  if (member.recruitV85 && !profile) return null;
  const candidate = Boolean(member.candidate);
  if (candidate && !profile) return null;
  const synthetic = (profile?.species || known?.species) === 'synthetic';
  const speaker = profile?.callsign || text(known?.callsign) || profile?.name || text(known?.name) || 'Personnel Echo-9';
  const identity = profile ? deriveRecruitIdentityV119(profile) : null;
  const missions = candidate ? [] : recordedMissions(member);
  const last = missions.at(-1);
  const topics = [];
  if (member.status === 'deceased') {
    return { schema: 120, crewId: member.id, mode: 'memorial', speaker,
      heading: 'Mémoire de service', message: 'Ce membre ne répond plus au canal de liaison. Son dossier et ses événements enregistrés restent consultables.',
      topics: [], defaultTopic: null, recordedMissions: missions.length, provenance: 'project-authored-contextual-dialogue',
      voiceStatus: 'authored-text-not-recorded-audio', mechanicalBonus: false, mutatesSave: false };
  }
  if (candidate) topics.push(topic('transfer', 'Le transfert', `Affectation proposée : ${profile.background.assignment.toLowerCase()}. Motivation : ${profile.background.motivation}`, 'pre-transfer-biography', { activityId: profile.background.activityId }));
  else {
    const readiness = currentReadiness(member, synthetic);
    topics.push(topic('readiness', 'Comment se passe le quart ?', readiness.answer, 'current-service-state', readiness.evidence));
  }
  if (profile) {
    topics.push(topic('background', 'Avant le Tantalus', `Mon activité : ${profile.background.activity.toLowerCase()}. Ma formation : ${profile.background.formation.toLowerCase()}. Mon dossier conserve cet événement : ${profile.background.event}`, 'pre-transfer-biography', { activityId: profile.background.activityId, formationId: profile.background.formationId, eventId: profile.background.eventId }));
    topics.push(topic('anchor', 'Ce qui compte à bord', `${profile.background.habit} ${profile.background.attachment} Mon objet personnel : ${profile.background.personalObject}.`, 'pre-transfer-biography'));
    topics.push(topic('approach', 'La façon de travailler', `${identity.profession}. ${identity.traits[0].description} ${identity.tacticalRole} reste une possibilité, pas une spécialisation imposée.`, 'derived-recruit-identity', { identitySchema: 119 }));
  }
  if (!candidate) {
    if (last) {
      const campaignName = text(list(campaignCatalog).find(entry => entry?.id === last.campaignId)?.name);
      const hour = `${Math.floor(last.hour).toString().padStart(2, '0')}:${Math.floor((last.hour % 1) * 60).toString().padStart(2, '0')}`;
      topics.push(topic('debrief', 'La dernière sortie', `${campaignName ? `${campaignName} — ` : ''}jour ${Math.floor(last.day)}, ${hour}. ${AFTER_MISSION[synthetic ? 'synthetic' : 'human'][last.outcome]}`, 'recorded-service-event', {
        operationId: last.operationId, campaignId: text(last.campaignId, 120), outcome: last.outcome, day: last.day, hour: last.hour
      }));
    } else topics.push(topic('debrief', 'La dernière sortie', 'Aucune sortie n’est encore enregistrée dans ce dossier. Je ne peux pas tirer de bilan d’une opération absente du registre.', 'no-recorded-service-event'));
    const peers = list(roster).filter(entry => record(entry) && entry.id !== member.id && !entry.archive && !entry.candidate);
    const peerMap = new Map(peers.map(entry => [entry.id, entry]));
    const relationships = list(member.relationsV85).slice(0, 128).filter(entry => record(entry) && peerMap.has(entry.crewId)
      && Number.isInteger(entry.sharedMissions) && entry.sharedMissions > 0 && entry.sharedMissions <= 9999)
      .sort((left, right) => right.sharedMissions - left.sharedMissions || left.crewId.localeCompare(right.crewId));
    const relationship = relationships[0];
    if (relationship) {
      const peer = peerMap.get(relationship.crewId), peerName = text(peer.name) || 'un membre Echo-9';
      const answer = peer.status === 'deceased'
        ? `${peerName} figure dans ${relationship.sharedMissions} sortie(s) commune(s) de mon registre. Son dossier reste une mémoire de service, pas une liaison active.`
        : synthetic ? `${relationship.sharedMissions} sortie(s) commune(s) avec ${peerName} sont enregistrées. Ces rapports constituent nos repères de coordination.`
          : `Le registre compte ${relationship.sharedMissions} sortie(s) commune(s) avec ${peerName}. Je garde nos comptes rendus comme repères pour préparer le prochain briefing.`;
      topics.push(topic('team', 'Les liens de l’équipe', answer, 'recorded-crew-relationship', { peerId: peer.id, sharedMissions: relationship.sharedMissions }));
    }
    const training = APTITUDE_DEFINITIONS_V85.map(entry => ({ ...entry, gain: member.trainingV85?.[entry.id] }))
      .filter(entry => Number.isInteger(entry.gain) && entry.gain > 0 && entry.gain <= 100 - (profile?.aptitudes[entry.id] ?? 50))
      .sort((left, right) => right.gain - left.gain || left.id.localeCompare(right.id));
    if (training.length) topics.push(topic('training', 'La formation', `Mon registre de formation indique +${training[0].gain} en ${training[0].label.toLowerCase()}. Cette progression est acquise ; mon activité antérieure ne m’interdit aucune autre formation.`, 'current-training-record', { aptitudeId: training[0].id, gain: training[0].gain }));
  }
  const gear = candidate ? profile.gear : list(member.gearV85);
  const catalog = new Map(list(equipmentCatalog).filter(record).map(entry => [entry.id, entry]));
  const labels = [...new Set(gear.map(item => catalog.get(item?.catalogId)?.name).filter(label => typeof label === 'string'))].slice(0, 12);
  if (labels.length) topics.push(topic('equipment', 'La dotation actuelle', `${candidate ? 'Le dossier de transfert prévoit' : 'Ma dotation actuelle comprend'} : ${labels.join(' · ')}. ${candidate ? 'Ce matériel sera affecté uniquement si le transfert est confirmé.' : 'Je ne compte pas sur un outil qui a été transféré à quelqu’un d’autre.'}`, candidate ? 'canonical-candidate-kit' : 'current-equipment-record'));
  return { schema: 120, crewId: member.id, mode: candidate ? 'candidate' : 'service', speaker,
    heading: candidate ? 'Entretien de transfert' : 'Notes de liaison', message: 'Échanges textuels adaptés au dossier. Aucune voix enregistrée, aucune aptitude supplémentaire.',
    topics: topics.map(entry => ({ ...entry, answer: `${speaker} : ${entry.answer}` })), defaultTopic: topics[0]?.id || null,
    recordedMissions: missions.length, provenance: 'project-authored-contextual-dialogue', voiceStatus: 'authored-text-not-recorded-audio', mechanicalBonus: false, mutatesSave: false };
}

export function selectCrewConversationTopicV120(conversation, selectedId) {
  return list(conversation?.topics).find(entry => entry.id === selectedId)
    || list(conversation?.topics).find(entry => entry.id === conversation?.defaultTopic) || null;
}

/** Escaping stays at the HTML boundary, including campaign names and peer names. */
export function renderCrewConversationV120(conversation, selectedId) {
  if (!conversation) return '';
  const selected = selectCrewConversationTopicV120(conversation, selectedId);
  return `<section class="crew-conversation-v120" aria-labelledby="crew-conversation-title-v120"><h3 id="crew-conversation-title-v120">${esc(conversation.heading)}</h3><p>${esc(conversation.message)}</p>${selected ? `<div class="button-row" role="group" aria-label="Sujets de liaison">${conversation.topics.map(entry => `<button type="button" class="button compact ${selected.id === entry.id ? 'primary' : ''}" data-v120-conversation-topic="${esc(entry.id)}" aria-pressed="${selected.id === entry.id}">${esc(entry.label)}</button>`).join('')}</div><blockquote aria-live="polite" aria-atomic="true" data-v120-conversation-answer>${esc(selected.answer)}</blockquote>` : ''}</section>`;
}
