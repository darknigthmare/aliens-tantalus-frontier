import { campaignStoryReturnV161, hasCampaignStoryV161 } from './campaign-convoy-story-v161.js';

const element = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function mountCampaignDebriefV161(root, { save, campaignId, onReview } = {}) {
  root.querySelector?.('[data-convoy-story-return]')?.remove?.();
  if (!hasCampaignStoryV161(campaignId)) return null;
  const model = campaignStoryReturnV161(save);
  if (!model) return null;
  const document = root.ownerDocument || globalThis.document;
  const section = element(document, 'section', 'campaign-story-v160');
  section.dataset.convoyStoryReturn = model.id;
  section.setAttribute('aria-label', 'Compte rendu du convoi de Lethe');
  section.append(element(document, 'p', 'campaign-story-v160__status', model.status),
    element(document, 'h3', '', model.title), element(document, 'p', '', model.summary),
    element(document, 'p', 'campaign-story-v160__protocol', `Axe de lecture : ${model.protocolLabel}`));
  const questions = element(document, 'div', 'campaign-story-v160__questions');
  questions.setAttribute('role', 'group'); questions.setAttribute('aria-label', 'Questions au retour du convoi');
  const answer = element(document, 'div', 'campaign-story-v160__answer');
  answer.setAttribute('aria-live', 'polite'); answer.setAttribute('aria-atomic', 'true');
  const showAnswer = topic => {
    answer.dataset.convoyStoryAnswer = topic.id;
    answer.replaceChildren(element(document, 'strong', '', topic.speaker), element(document, 'p', '', topic.answer));
  };
  showAnswer(model.questions.find(topic => topic.id === model.selectedTopic));
  for (const topic of model.questions) {
    const button = element(document, 'button', '', `${topic.label}${topic.read ? ' · RELU' : ''}`);
    button.type = 'button'; button.dataset.convoyStoryTopic = topic.id;
    button.setAttribute('aria-pressed', String(model.selectedTopic === topic.id));
    button.disabled = !model.canReview || model.canPersistReview && typeof onReview !== 'function';
    button.addEventListener('click', () => {
      if (model.canPersistReview) { onReview?.(model.operationId, topic.id); return; }
      for (const sibling of questions.querySelectorAll('[data-convoy-story-topic]'))
        sibling.setAttribute('aria-pressed', String(sibling === button));
      showAnswer(topic);
    });
    questions.append(button);
  }
  section.append(questions, answer,
    element(document, 'p', 'campaign-story-v160__notice', !model.canReview
      ? 'Le compte rendu est consultable après la sortie active.'
      : !model.canPersistReview ? 'Ancien compte rendu de liaison.'
      : model.readingComplete ? 'Les trois points ont été relus. Journal de liaison à jour.'
      : 'Choisissez une question à reprendre avec la liaison.'),
    element(document, 'p', 'campaign-story-v160__notice', model.scopeNotice));
  root.append(section);
  return model;
}
