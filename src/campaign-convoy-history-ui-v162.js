import { convoyReturnHistoryV162 } from './campaign-convoy-history-v162.js';

const element = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** Archive navigation is local DOM state. No save callback or mission command
 * is accepted: opening a previous transmission cannot mark a new return read. */
export function mountConvoyReturnHistoryV162(root, { save } = {}) {
  root.querySelector?.('[data-convoy-return-history]')?.remove?.();
  const entries = convoyReturnHistoryV162(save);
  if (!entries.length) return null;
  const document = root.ownerDocument || globalThis.document;
  const section = element(document, 'section', 'convoy-history-v162');
  section.dataset.convoyReturnHistory = 'true';
  section.setAttribute('aria-label', 'Journal des sorties du convoi');
  section.append(element(document, 'p', 'convoy-history-v162__eyebrow', 'LIAISON LETHE · ARCHIVES'),
    element(document, 'h3', '', 'Journal du convoi'),
    element(document, 'p', 'convoy-history-v162__intro', 'Les transmissions conservées du corridor de Lethe. Les huit dernières sorties restent dans le journal.'));
  const list = element(document, 'div', 'convoy-history-v162__list');
  for (const entry of entries) {
    const details = element(document, 'details', 'convoy-history-v162__entry');
    details.dataset.convoyHistoryEntry = entry.operationId;
    const summary = element(document, 'summary', 'convoy-history-v162__summary');
    summary.append(element(document, 'strong', '', entry.title),
      element(document, 'span', '', `${entry.operatorLabel} · ${entry.readTopics.length}/3 échanges relus au retour`));
    details.append(summary, element(document, 'p', 'convoy-history-v162__protocol', `Compte rendu : ${entry.protocolLabel}`));
    const questions = element(document, 'div', 'convoy-history-v162__questions');
    questions.setAttribute('role', 'group'); questions.setAttribute('aria-label', `Transmissions de la sortie ${entry.serial}`);
    const answer = element(document, 'div', 'convoy-history-v162__answer');
    answer.setAttribute('aria-live', 'polite'); answer.setAttribute('aria-atomic', 'true');
    const showAnswer = topic => {
      answer.dataset.convoyHistoryAnswer = topic.id;
      answer.replaceChildren(element(document, 'strong', '', topic.speaker), element(document, 'p', '', topic.answer));
    };
    showAnswer(entry.questions.find(topic => topic.id === entry.selectedTopic));
    for (const topic of entry.questions) {
      const button = element(document, 'button', '', topic.label);
      button.type = 'button'; button.dataset.convoyHistoryTopic = topic.id;
      button.setAttribute('aria-pressed', String(topic.id === entry.selectedTopic));
      button.addEventListener('click', () => {
        for (const sibling of questions.querySelectorAll('[data-convoy-history-topic]'))
          sibling.setAttribute('aria-pressed', String(sibling === button));
        showAnswer(topic);
      });
      questions.append(button);
    }
    details.append(questions, answer);
    list.append(details);
  }
  section.append(list); root.append(section);
  return { entries: entries.length, operationIds: entries.map(entry => entry.operationId) };
}
