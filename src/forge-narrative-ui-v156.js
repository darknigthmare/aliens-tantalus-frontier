import { defaultForgeNarrativeV156, openForgeNarrativeV156, chooseForgeNarrativeV156,
  forgeNarrativeViewV156 } from './forge-narrative-v156.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const button = (action, label) => `<button type="button" data-forge-action="${action}">${label}</button>`;
export function forgeNarrativeFieldsV156(editor, cell, nodeId) {
  if (!cell || cell.type !== 'terminal' || ['background', 'foreground'].includes(cell.layer)) return '';
  const story = cell.narrative;
  if (!story) return `<section><h4>RÉCIT DU TERMINAL</h4><p class="forge-note">Un dialogue à choix peut exiger ou valider un objectif du projet. La progression reste dans le test.</p>${button('story-create', 'Ajouter un récit')}</section>`;
  const node = story.nodes.find(entry => entry.id === nodeId) || story.nodes[0];
  const objectives = editor.model.data.rooms.flatMap(room => room.cells.filter(entry => entry.type === 'objective' && !['background', 'foreground'].includes(entry.layer)).map(entry => ({ id: entry.id, name: `${room.name} / ${entry.label || entry.id}` })));
  const options = (entries, value, blank) => `<option value="">${blank}</option>` + entries.map(entry => `<option value="${escape(entry.id)}" ${entry.id === value ? 'selected' : ''}>${escape(entry.name || entry.id)}</option>`).join('');
  return `<section data-forge-story-cell="${escape(cell.id)}"><h4>RÉCIT DU TERMINAL</h4><p class="forge-note">8 pages et 2 réponses par page au maximum, sans boucle. Un objectif récompensé est validé immédiatement, y compris dans une autre salle. Une réponse sans destination termine l’échange.</p>
    <label>Titre<input data-forge-field="story-title" maxlength="100" value="${escape(story.title)}"></label>
    <label>Page<select data-forge-field="story-node">${story.nodes.map(entry => `<option value="${escape(entry.id)}" ${entry.id === node.id ? 'selected' : ''}>${escape(entry.id)}${entry.id === story.start ? ' · début' : ''}</option>`).join('')}</select></label>
    <label>Texte<textarea data-forge-field="story-text" maxlength="600" rows="5">${escape(node.text)}</textarea></label>
    ${[0, 1].map(index => { const choice = node.choices[index] || {}; return `<fieldset><legend>Réponse ${index + 1} · laisser vide pour retirer</legend>
      <label>Réponse<input data-forge-field="story-choice-${index}-label" maxlength="100" value="${escape(choice.label || '')}"></label>
      <label>Page suivante<select data-forge-field="story-choice-${index}-next">${options(story.nodes.filter(entry => entry.id !== node.id), choice.next, 'Fin de l’échange')}</select></label>
      <label>Objectif requis<select data-forge-field="story-choice-${index}-requires">${options(objectives, choice.requiresObjectiveId, 'Aucune condition')}</select></label>
      <label>Objectif validé<select data-forge-field="story-choice-${index}-reward">${options(objectives, choice.rewardObjectiveId, 'Aucune récompense')}</select></label></fieldset>`; }).join('')}
    ${button('story-save', 'Enregistrer cette page')}${button('story-branch', 'Ajouter une page liée')}${button('story-delete-page', 'Supprimer cette page')}${button('story-remove', 'Retirer tout le récit')}
    <p class="forge-note">Nouvelle page : ajoute une réponse vers une page finale. Supprimer une page retire aussi les réponses qui y conduisent. La page de début est conservée. Les modifications restent annulables.</p></section>`;
}
export function editForgeNarrativeV156(editor, action, read) {
  const cell = editor.selected()[0];
  if (!cell || editor.selected().length !== 1 || cell.type !== 'terminal') throw new Error('Sélectionnez un terminal physique.');
  editor.assertSelectionEditable();
  if (cell.locked) throw new Error('Déverrouillez le terminal avant de modifier son récit.');
  return editor.edit('Modifier le récit du terminal', () => {
    if (action === 'story-create') { cell.narrative = defaultForgeNarrativeV156(); return; }
    if (action === 'story-remove') { delete cell.narrative; return; }
    const story = cell.narrative, node = story?.nodes.find(entry => entry.id === read('story-node'));
    if (!node) throw new Error('Page narrative introuvable.');
    if (action === 'story-delete-page') {
      if (node.id === story.start) throw new Error('La page de début ne peut pas être supprimée.');
      story.nodes = story.nodes.filter(entry => entry.id !== node.id);
      for (const entry of story.nodes) entry.choices = entry.choices.filter(choice => choice.next !== node.id);
      return;
    }
    if (action === 'story-branch') {
      if (story.nodes.length >= 8 || node.choices.length >= 2) throw new Error('Choisissez une page avec une réponse libre (8 pages maximum).');
      let number = 1; while (story.nodes.some(entry => entry.id === `page-${number}`)) number++;
      const id = `page-${number}`;
      story.nodes.push({ id, text: 'Rédigez la suite de cet échange.', choices: [] });
      let answer = 1; while (node.choices.some(choice => choice.id === `answer-${answer}`)) answer++;
      node.choices.push({ id: `answer-${answer}`, label: 'Poursuivre', next: id });
      return;
    }
    story.title = read('story-title'); node.text = read('story-text');
    node.choices = [0, 1].flatMap(index => {
      const label = read(`story-choice-${index}-label`).trim();
      if (!label) return [];
      const choice = { id: `answer-${index + 1}`, label, next: read(`story-choice-${index}-next`) || null };
      const requires = read(`story-choice-${index}-requires`), reward = read(`story-choice-${index}-reward`);
      if (requires) choice.requiresObjectiveId = requires;
      if (reward) choice.rewardObjectiveId = reward;
      return [choice];
    });
  });
}
function clearInput(engine) {
  engine.clearGameplayInput?.(); engine.keys?.clear(); engine.jumpQueued = 0;
}
/** Temporary DOM controls are created only for an active playtest exchange.
 * Capture blocks gameplay keys; key releases remain owned by the engine. */
export function showForgeNarrativeV156(engine, cellId, onChange = () => {}) {
  if (engine.forgeNarrativeOpenV156 || !engine.running) return false;
  const session = engine.forgeSessionV141;
  const view = openForgeNarrativeV156(session, cellId);
  if (!view) return false;
  clearInput(engine);
  engine.forgeNarrativeOpenV156 = cellId;
  let root = null, closed = false, choosing = false;
  const doc = engine.canvas?.ownerDocument || globalThis.document;
  const keyHost = doc?.defaultView || globalThis;
  const close = ({ focus = true } = {}) => {
    if (closed) return;
    closed = true; keyHost.removeEventListener?.('keydown', keydown, true); root?.remove();
    if (engine.closeForgeNarrativeV156 === close) {
      engine.forgeNarrativeOpenV156 = null; engine.closeForgeNarrativeV156 = null; engine.chooseForgeNarrativeV156 = null;
      if (engine.forgeSessionV141 === session) {
        clearInput(engine); if (focus) engine.canvas?.focus?.({ preventScroll: true });
      }
    }
  };
  const choose = choiceId => {
    if (closed || !engine.running || engine.forgeSessionV141 !== session || engine.forgeNarrativeOpenV156 !== cellId) return { ok: false, reason: 'dialogue-closed' };
    if (choosing) return { ok: false, reason: 'choice-in-progress' };
    choosing = true;
    try {
      const result = chooseForgeNarrativeV156(session, cellId, choiceId);
      if (!result.ok) return result;
      onChange(result);
      if (closed || !engine.running || engine.forgeSessionV141 !== session || engine.forgeNarrativeOpenV156 !== cellId) { close({ focus: false }); return result; }
      clearInput(engine); render(); return result;
    } finally { choosing = false; }
  };
  const keydown = event => {
    if (!engine.running || engine.forgeSessionV141 !== session || !engine.forgeNarrativeOpenV156) return;
    if (event.code === 'Tab') return; // Native focus order is trapped below in the actual dialog.
    if (['Enter', 'Space'].includes(event.code) && root?.contains(event.target)) {
      const button = event.target.closest?.('button');
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat && button && !button.disabled) button.click();
      return;
    }
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.repeat) return;
    if (event.code === 'Escape') return close();
    const current = forgeNarrativeViewV156(session, cellId);
    if (event.code === 'KeyE' && current.finished) return close();
    if (event.code === 'Digit1' || event.code === 'Digit2') {
      const choice = current.choices[Number(event.code.at(-1)) - 1]; if (choice?.available) choose(choice.id);
    }
  };
  function render() {
    if (!root) return;
    const current = forgeNarrativeViewV156(session, cellId);
    if (!current) return;
    const objectives = session.project.rooms.flatMap(room => room.cells.filter(cell => cell.type === 'objective').map(cell => ({ id: cell.id, label: `${room.name} / ${cell.label || cell.id}` })));
    root.innerHTML = `<section role="dialog" aria-modal="true" aria-label="${escape(current.title)}" tabindex="-1" style="background:#101b18;border:2px solid #90b5a0;padding:24px;max-width:620px;width:min(620px,90vw);max-height:80vh;overflow:auto;color:#e3f4e8;box-shadow:0 12px 60px #000"><h2>${escape(current.title)}</h2><p style="white-space:pre-wrap" aria-live="polite">${escape(current.text)}</p>
      ${current.choices.map((choice, index) => `<p><button type="button" data-story-choice="${escape(choice.id)}" ${choice.available ? '' : 'disabled'} style="padding:12px;width:100%;text-align:left">${index + 1} — ${escape(choice.label)}</button>${choice.available ? '' : `<small>Objectif requis : ${escape(objectives.find(entry => entry.id === choice.requiresObjectiveId)?.label || choice.requiresObjectiveId)}</small>`}${choice.rewardObjectiveId ? `<small>Valide : ${escape(objectives.find(entry => entry.id === choice.rewardObjectiveId)?.label || choice.rewardObjectiveId)}</small>` : ''}</p>`).join('')}
      <button type="button" data-story-close style="padding:10px">${current.finished ? 'Reprendre le parcours · E' : 'Fermer · Échap'}</button><p><small>Choisir : clic, Tab + Entrée, ou touches 1 / 2. Le monde attend pendant la lecture.</small></p></section>`;
    root.querySelector('[data-story-choice]:not(:disabled),[data-story-close]')?.focus();
  }
  engine.closeForgeNarrativeV156 = close;
  engine.chooseForgeNarrativeV156 = choose;
  if (doc?.createElement && doc.body?.append) {
    root = doc.createElement('div'); root.dataset.forgeNarrativeV156 = cellId;
    root.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;background:#000b;padding:16px;box-sizing:border-box';
    root.addEventListener('click', event => {
      const choice = event.target.closest?.('[data-story-choice]');
      if (choice && !choice.disabled) choose(choice.dataset.storyChoice);
      if (event.target.closest?.('[data-story-close]')) close();
    });
    root.addEventListener('keydown', event => {
      if (event.code !== 'Tab') return;
      const buttons = [...root.querySelectorAll('button:not(:disabled)')], index = buttons.indexOf(doc.activeElement);
      event.preventDefault(); buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    });
    doc.body.append(root); render();
  }
  keyHost.addEventListener?.('keydown', keydown, true);
  return true;
}
