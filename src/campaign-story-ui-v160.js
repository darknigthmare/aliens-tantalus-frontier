import { campaignStoryReturnV160 } from './campaign-story-v160.js';

const element = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** Mount after the operation-plan owner has replaced its own contents.
 * The callback must commit a candidate save, then rerender from durable state.
 * A failed write therefore never displays a newly accepted reading receipt. */
export function mountCampaignDebriefV160(root, { save, onReview } = {}) {
  root.querySelector?.('[data-campaign-story-return]')?.remove?.();
  const model = campaignStoryReturnV160(save);
  if (!model) return null;
  const document = root.ownerDocument || globalThis.document;
  const section = element(document, 'section', 'campaign-story-v160');
  section.dataset.campaignStoryReturn = model.id;
  section.setAttribute('aria-label', 'Compte rendu QZ-18');
  section.append(element(document, 'p', 'campaign-story-v160__status', model.status),
    element(document, 'h3', '', model.title), element(document, 'p', '', model.summary),
    element(document, 'p', 'campaign-story-v160__protocol', `Protocole : ${model.protocolLabel}`));
  const questions = element(document, 'div', 'campaign-story-v160__questions');
  questions.setAttribute('role', 'group'); questions.setAttribute('aria-label', 'Questions au retour');
  let answer;
  for (const topic of model.questions) {
    const button = element(document, 'button', '', `${topic.label}${topic.read ? ' · RELU' : ''}`);
    button.type = 'button'; button.dataset.campaignStoryTopic = topic.id;
    button.setAttribute('aria-pressed', String(model.selectedTopic === topic.id));
    button.disabled = !model.canReview || model.canPersistReview && typeof onReview !== 'function';
    button.addEventListener('click', () => {
      if (model.canPersistReview) { onReview?.(model.operationId, topic.id); return; }
      // Legacy returns may predate insertion receipts. Keep their dossier
      // consultable without fabricating a persisted reading ledger.
      for (const sibling of questions.querySelectorAll('[data-campaign-story-topic]'))
        sibling.setAttribute('aria-pressed', String(sibling === button));
      answer.dataset.campaignStoryAnswer = topic.id;
      answer.replaceChildren(element(document, 'strong', '', topic.speaker), element(document, 'p', '', topic.answer));
    });
    questions.append(button);
  }
  section.append(questions);
  const selected = model.questions.find(topic => topic.id === model.selectedTopic);
  answer = element(document, 'div', 'campaign-story-v160__answer');
  answer.dataset.campaignStoryAnswer = selected.id;
  answer.setAttribute('aria-live', 'polite'); answer.setAttribute('aria-atomic', 'true');
  answer.append(element(document, 'strong', '', selected.speaker), element(document, 'p', '', selected.answer));
  section.append(answer, element(document, 'p', 'campaign-story-v160__notice', !model.canReview
    ? 'Compte rendu précédent. Les échanges reprennent après l’opération active.'
    : !model.canPersistReview ? 'Archive antérieure : consultation disponible, sans carnet de lecture de cette sortie.'
    : model.readingComplete ? 'Les trois points du compte rendu ont été relus. Dossier conservé.'
      : 'Choisissez une question pour conserver cet échange. La relecture ne coûte ni temps ni ressource.'));
  root.append(section);
  return model;
}
