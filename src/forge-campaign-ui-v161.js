import { ForgeCampaignStoreV161, ForgeCampaignControllerV161, forgeCampaignCursorV161 } from './forge-campaign-v161.js';

/** Explicit ordered local campaigns, using saved authoring projects. Controls
 * never propagate movement/fire keys and never mutate the campaign profile. */
export function mountForgeCampaignUIV161({ document: doc = globalThis.document, roots = [], storage,
  getProjects, saveCurrentProject, launch, getEngine, isVisible = () => true, onMessage = () => {} } = {}) {
  if (!doc || typeof getProjects !== 'function' || typeof launch !== 'function' || typeof getEngine !== 'function') return null;
  const store = new ForgeCampaignStoreV161(storage); store.load();
  let dead = false, message = store.error || 'Composez une suite de projets Mission et Vaisseau.', failed = Boolean(store.error);
  const rows = [], removers = [], draft = [];
  const controller = new ForgeCampaignControllerV161(store, { launch, getEngine });
  const node = (tag, text = '') => { const el = doc.createElement(tag); el.textContent = text; return el; };
  const publish = (text, error = false) => { message = text; failed = error; update(); onMessage(text, error); };
  const guard = callback => {
    try { return callback(); } catch (error) { publish(error.message || 'Campagne locale indisponible.', true); return false; }
  };
  const download = () => {
    const raw = store.export(); if (raw === null) throw new Error('Aucune campagne locale à exporter.');
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const anchor = doc.createElement('a'); anchor.download = 'frontier-forge-campagne-locale-v161.json'; anchor.href = url;
    doc.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  function renderDraft(row) {
    if (!row.draftList) return;
    row.draftList.replaceChildren();
    draft.forEach((entry, index) => {
      const item = node('li', `${index + 1}. ${entry.name} · ${entry.kind === 'ship' ? 'Vaisseau' : 'Mission'} `);
      for (const [action, label, disabled] of [['up', 'Monter', index === 0], ['down', 'Descendre', index === draft.length - 1], ['remove', 'Retirer', false]]) {
        const button = node('button', label); button.type = 'button'; button.disabled = disabled; button.dataset.forgeCampaignDraftV161 = `${action}-${index}`;
        button.setAttribute('aria-label', `${label} l’étape ${index + 1} : ${entry.name}`);
        button.addEventListener('click', () => {
          if (action === 'remove') draft.splice(index, 1);
          else { const other = index + (action === 'up' ? -1 : 1); [draft[index], draft[other]] = [draft[other], draft[index]]; }
          renderDraft(row); update();
        }); item.append(button);
      }
      row.draftList.append(item);
    });
  }
  function update() {
    if (dead) return;
    const campaign = store.data, cursor = forgeCampaignCursorV161(campaign);
    for (const row of rows) {
      row.section.hidden = !isVisible(row.root);
      row.status.textContent = message; row.status.dataset.error = String(failed);
      // Store writes replace the admitted object. Do not stringify up to 8 MiB
      // every half-second while a native action scene is running.
      if (row.signature !== campaign || row.errorSignature !== store.error) {
        row.signature = campaign; row.errorSignature = store.error; row.progress.replaceChildren();
        if (campaign) {
          row.progress.append(node('strong', `${campaign.name} · ${cursor < 0 ? 'CAMPAGNE LOCALE TERMINÉE' : `ÉTAPE ${cursor + 1}/${campaign.stages.length}`}`));
          const list = node('ol');
          for (const [index, stage] of campaign.stages.entries()) {
            const item = node('li', `${stage.project.name} · ${stage.project.kind === 'ship' ? 'Vaisseau' : 'Mission'} · ${stage.result ? 'TERMINÉE' : index === cursor ? 'À JOUER' : 'VERROUILLÉE'}`);
            if (stage.result) {
              const lines = stage.result.narrative.flatMap(receipt => receipt.history.map(choice => {
                const cell = stage.project.rooms.flatMap(room => room.cells).find(cell => cell.id === receipt.cellId);
                const choiceLabel = cell.narrative.nodes.find(node => node.id === choice.nodeId).choices.find(entry => entry.id === choice.choiceId).label;
                return `${cell.narrative.title} : ${choiceLabel}`;
              }));
              item.append(node('small', ` · ${stage.result.objectiveIds.length} objectif(s) validé(s)${lines.length ? ` · ${lines.join(' / ')}` : ''}`));
            }
            list.append(item);
          }
          row.progress.append(list);
        } else row.progress.append(node('p', store.error ? 'Original local conservé. Exportez-le avant de l’effacer.' : 'Aucune campagne locale enregistrée.'));
      }
      if (row.projectSelect) {
        const projects = getProjects() || [], key = JSON.stringify(projects.map(project => [project.id, project.name, project.kind]));
        if (key !== row.projectKey) {
          row.projectKey = key; const value = row.projectSelect.value;
          row.projectSelect.replaceChildren();
          for (const project of projects) { const option = node('option', `${project.name} · ${project.kind === 'ship' ? 'Vaisseau' : 'Mission'}`); option.value = project.id; row.projectSelect.append(option); }
          if (projects.some(project => project.id === value)) row.projectSelect.value = value;
        }
        row.create.disabled = Boolean(campaign || store.error || store.expectedRaw !== null || draft.length < 2);
        row.add.disabled = !projects.length || draft.length >= 16;
      }
      row.launch.disabled = !campaign || cursor < 0 || Boolean(controller.owner);
      row.retry.disabled = !controller.owner;
      row.clear.disabled = store.expectedRaw === null;
      row.export.disabled = store.expectedRaw === null;
    }
  }
  controller.onChange = update;
  const completeNative = engine => {
    try {
      const completed = controller.completeNative(engine);
      if (completed) publish(forgeCampaignCursorV161(store.data) < 0 ? 'Campagne locale terminée et enregistrée sur cet appareil.' : 'Étape terminée et enregistrée. Lancez la suivante dans « Campagne Forge locale ».');
      return completed;
    } catch (error) {
      publish(`${error.message} Ouvrez « Campagne Forge locale » puis réessayez l’enregistrement de fin.`, true);
      // null distinguishes a failed durable write from an unrelated playtest.
      // The application must keep this alert visible instead of replacing it.
      return null;
    }
  };
  for (const root of roots.filter(Boolean)) {
    const runtime = ['hub', 'play'].includes(root.dataset?.panel), section = node('section');
    section.className = `panel forge-campaign-v161${runtime ? ' forge-campaign-runtime-v161' : ''}`; section.setAttribute('aria-label', 'Campagne Forge locale');
    const details = node('details'); details.open = !runtime;
    const summary = node('summary', 'Campagne Forge locale'); summary.className = 'button'; summary.dataset.forgeCampaignToggleV161 = '';
    details.append(summary);
    const body = node('div'); body.className = 'forge-campaign-controls-v161';
    const row = { root, section, signature: undefined, progress: node('div'), status: node('p') };
    row.status.setAttribute('role', 'status'); row.status.setAttribute('aria-live', 'polite');
    body.append(row.progress);
    if (!runtime) {
      const label = node('label', 'Nom de la campagne '), input = node('input'); input.maxLength = 120; input.value = 'Ma campagne Forge'; input.dataset.forgeCampaignNameV161 = ''; label.append(input); body.append(label);
      const projectLabel = node('label', 'Projet enregistré '); row.projectSelect = node('select'); row.projectSelect.dataset.forgeCampaignProjectV161 = ''; projectLabel.append(row.projectSelect); body.append(projectLabel);
      row.add = node('button', 'Ajouter une étape'); row.add.type = 'button'; row.add.dataset.forgeCampaignV161 = 'add';
      row.add.addEventListener('click', () => guard(() => {
        saveCurrentProject?.();
        const project = getProjects().find(project => project.id === row.projectSelect.value);
        if (!project) throw new Error('Projet introuvable ; choisissez-le de nouveau.');
        if (draft.length >= 16) throw new Error('16 étapes maximum.');
        // IDs/order are a draft. Documents are freshly frozen at Create, after
        // a confirmed workspace write, so edits between Add and Create count.
        draft.push({ id: project.id, name: project.name, kind: project.kind }); renderDraft(row); update();
      })); body.append(row.add); row.draftList = node('ol'); body.append(row.draftList);
      row.create = node('button', 'Créer la campagne locale'); row.create.type = 'button'; row.create.dataset.forgeCampaignV161 = 'create';
      row.create.addEventListener('click', () => guard(() => {
        saveCurrentProject?.();
        const projects = getProjects(), selected = draft.map(entry => {
          const project = projects.find(project => project.id === entry.id);
          if (!project) throw new Error(`Projet supprimé : ${entry.name}. Retirez cette étape et choisissez un projet présent.`);
          return project;
        });
        store.create(input.value, selected); draft.length = 0; renderDraft(row);
        publish('Campagne locale créée. Ses plans sont figés ; les originaux restent éditables. Lancez la première étape.');
      })); body.append(row.create);
    }
    const actions = node('div'); actions.className = 'button-row';
    const addAction = (name, label, callback) => {
      const button = node('button', label); button.type = 'button'; button.className = 'button'; button.dataset.forgeCampaignV161 = name;
      const listener = () => guard(callback); button.addEventListener('click', listener); removers.push(() => button.removeEventListener('click', listener)); actions.append(button); return button;
    };
    row.launch = addAction('launch', 'Jouer l’étape suivante', () => { controller.launchCurrent(); publish('Étape ouverte. Sa réussite native sera enregistrée automatiquement.'); });
    row.retry = addAction('retry', 'Réessayer l’enregistrement de fin', () => {
      if (controller.completeNative(getEngine())) publish('Fin d’étape enregistrée sur cet appareil.');
      else publish('Terminez les objectifs natifs de cette étape avant de l’enregistrer.');
    });
    addAction('reload', 'Recharger la progression locale', () => { controller.detach(); store.load(); publish(store.error || 'Progression locale rechargée. Rejouez l’étape en cours ; les étapes terminées sont conservées.', Boolean(store.error)); });
    row.export = addAction('export', 'Exporter la campagne locale', download);
    row.clear = addAction('clear', 'Effacer la campagne locale', () => { store.clear(); controller.detach(); publish('Campagne locale effacée. Projets, checkpoint et profil conservés.'); });
    body.append(actions, node('p', '2 à 16 étapes · un emplacement local · plans figés à la création. Seules les fins d’étapes sont persistées ici ; une étape interrompue repart au début. Le checkpoint du playtest reste séparé. Chaque étape garde son propre équipement et ses objets de récit ; les choix terminés sont consultables dans le bilan. Aucun cloud, script libre ou récompense du profil.'), row.status);
    details.append(body); section.append(details); root.append(section); rows.push(row);
    const key = event => { event.stopPropagation(); if (event.type === 'keydown' && event.key === 'Escape' && details.open) { event.preventDefault(); details.open = false; summary.focus({ preventScroll: true }); } };
    const toggle = () => { if (runtime && details.open) { const engine = getEngine(); engine?.clearGameplayInput?.(); engine?.keys?.clear(); } };
    section.addEventListener('keydown', key); section.addEventListener('keyup', key); details.addEventListener('toggle', toggle);
    removers.push(() => section.removeEventListener('keydown', key), () => section.removeEventListener('keyup', key), () => details.removeEventListener('toggle', toggle));
  }
  update(); const timer = globalThis.setInterval(update, 500);
  return { store, controller, completeNative, detach: () => controller.detach(), refresh: update,
    destroy() { dead = true; clearInterval(timer); controller.owner = null; removers.forEach(remove => remove()); rows.forEach(row => row.section.remove()); } };
}
