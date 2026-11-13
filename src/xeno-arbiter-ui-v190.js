import { ARBITER_MISSIONS_V190, arbiterCampaignAccessV190, normalizeArbiterCampaignProgressV190 } from './xeno-arbiter-campaign-v190.js';
import { getXenoArbiterCampaignArtV190 } from './campaign-art-v190.js';

/** The dossier reads extracted campaign receipts. Opening it or the existing
 * MIRE terminal never grants custody, evidence, progression or rewards. */
export function getArbiterDossierModelV190(raw) {
  const progress = normalizeArbiterCampaignProgressV190(raw), completed = progress.completedCampaignIds.length;
  return { completed, total: ARBITER_MISSIONS_V190.length,
    recovered: completed >= 3, isolated: completed >= 5, localMire: completed >= 6,
    status: completed >= 6 ? 'COPIE MIRE ISOLÉE · PRÊTE À CONSULTER'
      : completed >= 5 ? 'MODULE SOUS SCELLÉS · COPIE HORS RÉSEAU'
        : completed >= 3 ? 'AB-40 RÉCUPÉRÉ · AUTORISATIONS À NEUTRALISER'
          : 'RÉSEAU D’ARBITRAGE · ENQUÊTE OUVERTE',
    summary: completed >= 6
      ? 'Les dossiers ARBITER sont consultables sur le banc MIRE du Tantalus. Les corps et les environnements de Xeno Trials sont des modèles de simulation ; aucun captif réel n’est engagé.'
      : 'Des mandataires de Weyland-Yutani utilisaient des combats clandestins pour régler leurs différends, imposer des cessions et étendre leurs concessions. Retrouvez leurs traces, puis sécurisez le module AB-40.',
    chapters: ARBITER_MISSIONS_V190.map(mission => ({ ...mission,
      available: arbiterCampaignAccessV190(progress, mission.campaignId).available,
      completed: progress.completedCampaignIds.includes(mission.campaignId) })) };
}

const node = (document, tag, text, className = '') => {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
};

export function mountArbiterDossierV190(root, { progress, selectedCampaignId, activeOperation = null,
  worldAvailable = false, onPlan, onOpenTrials } = {}) {
  root.querySelector?.('[data-arbiter-dossier]')?.remove();
  const document = root.ownerDocument || globalThis.document, model = getArbiterDossierModelV190(progress);
  const section = node(document, 'details', null, 'arbiter-dossier-v190');
  section.dataset.arbiterDossier = 'ab40';
  section.open = model.chapters.some(chapter => chapter.campaignId === selectedCampaignId);
  section.append(node(document, 'summary', `ARBITER / AB-40 · ${model.completed}/${model.total} retours archivés`));
  section.append(node(document, 'p', model.status, 'eyebrow'), node(document, 'h3', 'Les comptes du vainqueur'),
    node(document, 'p', model.summary));
  section.append(node(document, 'p', 'AB-40 est une clef d’autorisation et un lecteur de dossiers biométriques. Les enceintes de confinement dépendaient d’opérateurs et d’installations physiques ; le module ne commande pas les créatures.'));
  if (model.recovered || selectedCampaignId === 'special-arbiter-03-custody') {
    const art = getXenoArbiterCampaignArtV190('special-arbiter-03-custody'), figure = node(document, 'figure');
    const image = node(document, 'img'); image.src = art.path; image.alt = art.alt; image.loading = 'lazy';
    image.width = art.width; image.height = art.height;
    figure.append(image, node(document, 'figcaption', 'Dossier de récupération · le module et les preuves suivent deux scellés distincts.'));
    section.append(figure);
  }
  const chapters = node(document, 'ol', null, 'arbiter-chapters-v190');
  for (const chapter of model.chapters) {
    const item = node(document, 'li'); item.dataset.arbiterChapter = chapter.campaignId;
    item.append(node(document, 'h4', chapter.name), node(document, 'p', chapter.objective));
    const active = activeOperation?.campaignId === chapter.campaignId;
    const blocked = Boolean(activeOperation) && !active;
    const label = active ? 'OPÉRATION ACTIVE' : chapter.completed ? 'DOSSIER ARCHIVÉ · REJOUER'
      : !chapter.available ? 'RETOUR PRÉCÉDENT REQUIS' : !worldAvailable ? 'ROUTE LETHE REQUISE' : 'PLANIFIER L’ENQUÊTE';
    const button = node(document, 'button', label, 'button compact'); button.type = 'button';
    button.dataset.arbiterPlan = chapter.campaignId;
    button.disabled = blocked || !chapter.available || !worldAvailable || typeof onPlan !== 'function';
    button.addEventListener('click', () => onPlan?.(chapter.campaignId));
    item.append(button); chapters.append(item);
  }
  section.append(chapters);
  if (model.localMire && typeof onOpenTrials === 'function') {
    const button = node(document, 'button', 'OUVRIR LA COPIE MIRE ISOLÉE', 'button primary');
    button.type = 'button'; button.dataset.arbiterOpenTrials = 'true';
    button.disabled = Boolean(activeOperation); button.addEventListener('click', onOpenTrials); section.append(button);
  }
  section.append(node(document, 'p', 'Le programme d’entraînement MIRE reste disponible pendant l’enquête. Seul un retour au sas avec les preuves archive un nouveau chapitre.', 'detail-copy'));
  root.append(section); return model;
}

export function renderArbiterTerminalDossierV190(root, raw, onOpenDossier) {
  const document = root.ownerDocument || globalThis.document, model = getArbiterDossierModelV190(raw);
  root.replaceChildren(node(document, 'h3', 'ARBITER / PROVENANCE DES ÉVALUATIONS'),
    node(document, 'p', model.status, 'eyebrow'), node(document, 'p', model.localMire ? model.summary
      : 'MIRE exécute des modèles de simulation. Le dossier ARBITER retrace l’origine clandestine des paramètres et l’acquisition de l’exemplaire AB-40.'));
  if (typeof onOpenDossier === 'function') {
    const button = node(document, 'button', 'CONSULTER LE DOSSIER ARBITER', 'button compact');
    button.type = 'button'; button.dataset.arbiterConsult = 'true';
    button.addEventListener('click', onOpenDossier); root.append(button);
  }
  return model;
}
