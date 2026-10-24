import { letheContinuityModelV163 } from './campaign-lethe-continuity-v163.js';

const element = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** The callback selects the existing native mission plan; it never deploys or
 * pays an operation. Questions persist only through the supplied owner guard. */
export function mountLetheContinuityV163(root, { save, onPlan, onReview } = {}) {
  root.querySelector?.('[data-lethe-continuity]')?.remove?.();
  const model = letheContinuityModelV163(save), document = root.ownerDocument || globalThis.document;
  const section = element(document, 'section', 'lethe-continuity-v163');
  section.dataset.letheContinuity = 'true';
  section.setAttribute('aria-label', model.title);
  const heading = element(document, 'div', 'lethe-continuity-v163__heading');
  const title = element(document, 'div');
  title.append(element(document, 'p', 'lethe-continuity-v163__eyebrow', 'CAMPAGNE TANTALUS · LETHE'),
    element(document, 'h3', '', model.title));
  const count = element(document, 'span', 'lethe-continuity-v163__count', `${model.completed}/${model.total} retours confirmés`);
  count.dataset.letheChapterCount = String(model.completed);
  heading.append(title, count); section.append(heading);
  const progress = element(document, 'progress', 'lethe-continuity-v163__progress');
  progress.max = model.total; progress.value = model.completed;
  progress.setAttribute('aria-label', 'Étapes du dossier confirmées au retour');
  section.append(progress, element(document, 'p', 'lethe-continuity-v163__recommendation', model.recommendation));
  const list = element(document, 'ol', 'lethe-continuity-v163__chapters');
  for (const [index, chapter] of model.chapters.entries()) {
    const row = element(document, 'li', 'lethe-continuity-v163__chapter');
    row.dataset.letheChapter = chapter.id; row.dataset.complete = String(chapter.complete);
    const heading = element(document, 'div', 'lethe-continuity-v163__chapter-heading');
    heading.append(element(document, 'span', 'lethe-continuity-v163__number', String(index + 1)),
      element(document, 'h4', '', chapter.title), element(document, 'span', 'lethe-continuity-v163__status',
        chapter.complete ? 'Retour confirmé' : chapter.active ? 'En cours' : chapter.latestReturn ? 'Reprise à préparer' : 'À entreprendre'));
    row.append(heading, element(document, 'p', 'lethe-continuity-v163__mission', chapter.campaignName),
      element(document, 'p', 'lethe-continuity-v163__objective', chapter.objective));
    const plan = element(document, 'button', 'lethe-continuity-v163__plan', chapter.complete ? 'Revoir le plan de mission' : 'Préparer cette mission');
    plan.type = 'button'; plan.dataset.lethePlan = chapter.campaignId;
    plan.disabled = !chapter.canPlan || typeof onPlan !== 'function';
    plan.addEventListener('click', () => {
      if (!plan.disabled) onPlan(chapter.campaignId);
    });
    row.append(plan);
    if (!chapter.available) row.append(element(document, 'p', 'lethe-continuity-v163__notice', 'La destination doit d’abord être accessible sur la carte stellaire.'));
    const entry = chapter.latestReturn;
    if (entry) {
      const details = element(document, 'details', 'lethe-continuity-v163__return');
      details.dataset.letheReturn = entry.operationId;
      const summary = element(document, 'summary', '', `Dernière sortie · ${entry.success ? 'retour confirmé' : entry.reason === 'retreat' ? 'repli' : 'liaison interrompue'}`);
      details.append(summary);
      if (chapter.complete && !entry.success)
        details.append(element(document, 'p', 'lethe-continuity-v163__notice', 'Un retour antérieur a déjà confirmé cette étape. La dernière sortie garde son propre bilan.'));
      const questions = element(document, 'div', 'lethe-continuity-v163__questions');
      questions.setAttribute('role', 'group'); questions.setAttribute('aria-label', `Compte rendu : ${chapter.title}`);
      const answer = element(document, 'div', 'lethe-continuity-v163__answer');
      answer.setAttribute('aria-live', 'polite'); answer.setAttribute('aria-atomic', 'true');
      const show = topic => {
        answer.dataset.letheAnswer = topic.id;
        answer.replaceChildren(element(document, 'strong', '', topic.speaker), element(document, 'p', '', topic.answer));
      };
      show(entry.questions.find(q => q.id === entry.selectedTopic));
      for (const topic of entry.questions) {
        const button = element(document, 'button', '', topic.label);
        button.type = 'button'; button.dataset.letheReview = topic.id;
        button.setAttribute('aria-pressed', String(topic.id === entry.selectedTopic));
        button.addEventListener('click', () => {
          if (entry.canReview && typeof onReview === 'function'
            && !onReview(chapter.id, entry.operationId, topic.id)) return;
          for (const sibling of questions.querySelectorAll('[data-lethe-review]'))
            sibling.setAttribute('aria-pressed', String(sibling === button));
          show(topic);
        });
        questions.append(button);
      }
      details.append(questions, answer, element(document, 'p', 'lethe-continuity-v163__notice', entry.canReview && typeof onReview === 'function'
        ? 'Les échanges sont conservés dans ce dossier. Leur lecture ne coûte ni temps ni ressource.'
        : 'Consultation du compte rendu précédent. Les lectures seront conservées après le retour de l’opération active.'));
      row.append(details);
    }
    list.append(row);
  }
  section.append(list); root.append(section);
  return model;
}
