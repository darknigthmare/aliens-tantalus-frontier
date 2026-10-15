import { LAYERS, LABELS } from './forge-model-v130.js';
import { BLUEPRINTS_V135, BLUEPRINT_SHAPES_V135, normalizeBlueprintV135, planBlueprintV135,
  applyBlueprintV135, readBlueprintRecipeV135, exportBlueprintRecipeV135 } from './forge-blueprints-v135.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const button = (action, caption, attrs = '') => `<button type="button" data-build-action="${action}" ${attrs}>${caption}</button>`;
const choices = entries => entries.map(([id, caption]) => `<option value="${escape(id)}">${escape(caption)}</option>`).join('');
const fields = ['profile', 'shape', 'width', 'height', 'levels', 'seed', 'density', 'entry', 'threats', 'vehicle', 'name'];
const numeric = new Set(['width', 'height', 'levels', 'seed', 'density', 'threats']);
const ink = { wall: '#546f65', floor: '#91b7a4', platform: '#c3e2d1', ladder: '#dbb877', spawn: '#82edb3', objective: '#eedc7f', terminal: '#77cdd0', door: '#d2ae6c', vent: '#8baabc', vehicle: '#90b7de', enemy: '#ed8e97' };

/** UI is a client of the same pure planner as the tests. No runtime, campaign or auto-generation side effects. */
export function mountForgeConstructionV135(editor) {
  const doc = editor.canvas.ownerDocument, panel = editor.canvas.closest?.('[data-panel="editor"]');
  const work = panel?.querySelector('.forge-workbench-v133'); if (!doc || !work) return null;
  if (!doc.getElementById('forge-styles-v135')) {
    const css = doc.createElement('link'); css.id = 'forge-styles-v135'; css.rel = 'stylesheet';
    css.href = new URL('./forge-construction-v135.css', import.meta.url).href; doc.head.append(css);
  }
  const tab = doc.createElement('button'); tab.type = 'button'; tab.dataset.workAction = 'tab'; tab.dataset.tab = 'construction';
  tab.textContent = 'Construction'; tab.setAttribute('aria-pressed', 'false'); tab.setAttribute('aria-controls', 'forge-panel-construction-v135');
  work.querySelector('.forge-tabs-v133').insertBefore(tab, work.querySelector('[data-work-selection]'));
  const root = doc.createElement('section'); root.id = 'forge-panel-construction-v135'; root.dataset.workPanel = 'construction'; root.hidden = true;
  root.innerHTML = `<div class="forge-build-grid-v135"><div class="forge-build-settings-v135"><h3>CONSTRUIRE UN SECTEUR</h3>
    <label>Programme<select data-build-field="profile">${choices(Object.entries(BLUEPRINTS_V135).map(([id, p]) => [id, p.name]))}</select></label>
    <label>Nom du secteur<input data-build-field="name" maxlength="100" placeholder="Nom du programme par défaut"></label>
    <label>Silhouette<select data-build-field="shape">${choices(Object.entries(BLUEPRINT_SHAPES_V135))}</select></label>
    <div class="forge-build-pair"><label>Colonnes<input data-build-field="width" type="number" min="16" max="64" value="32"></label><label>Lignes<input data-build-field="height" type="number" min="12" max="36" value="18"></label></div>
    <div class="forge-build-pair"><label>Niveaux<select data-build-field="levels">${choices([[1, 'Un niveau'], [2, 'Deux niveaux'], [3, 'Trois niveaux']])}</select></label><label>Insertion<select data-build-field="entry">${choices([['left', 'À gauche'], ['right', 'À droite']])}</select></label></div>
    <div class="forge-build-pair"><label>Variante<input data-build-field="seed" type="number" min="0" max="999999" value="426"></label><label>Repères de décor<select data-build-field="density">${choices([[0, 'Aucun'], [1, 'Léger'], [2, 'Normal'], [3, 'Dense']])}</select></label></div>
    <div class="forge-build-pair"><label>Marqueurs de menace<input data-build-field="threats" type="number" min="0" max="6" value="0"></label><label class="forge-build-check"><input data-build-field="vehicle" type="checkbox">Emplacement véhicule</label></div>
    <label>Destination<select data-build-field="destination">${choices([['new', 'Nouvelle salle — garder l’existante'], ['replace', 'Remplacer la salle active']])}</select></label>
    <label>Relier depuis un sas libre<select data-build-field="source"><option value="">Sans liaison automatique</option></select></label>
    <p class="forge-work-note" data-build-program></p></div>
    <div class="forge-build-preview-v135"><header><h3>APERÇU AVANT CONSTRUCTION</h3><span data-build-validity>Pas d’aperçu</span></header>
    <canvas data-build-canvas width="960" height="540" aria-label="Aperçu symbolique du secteur à créer, sans modification du projet"></canvas>
    <div class="forge-work-row">${button('preview', 'Prévisualiser')}${button('variation', 'Variante suivante')}${button('apply', 'Construire', 'disabled')}${button('cancel', 'Annuler l’aperçu')}</div>
    <p data-build-summary class="forge-work-note">Choisissez les paramètres, puis prévisualisez. Aucune salle ne sera modifiée sans le bouton Construire.</p>
    <div data-build-report class="forge-build-report-v135"></div>
    <details><summary>Recettes reproductibles et limites</summary><div class="forge-work-row">${button('recipe-export', 'Exporter la recette')}<label>Importer une recette<input type="file" data-build-import accept=".json,application/json"></label></div>
    <p class="forge-work-note">La recette mémorise les paramètres, pas le projet. Son import ne construit rien. À version et paramètres identiques, le plan généré est identique.</p>
    <p class="forge-work-note">Les plans créent des blocs modifiables. Les calques décoratifs utilisent les ressources locales choisies dans l’inspecteur, sans collision. Les sas reliés se traversent avec E pendant le test du parcours. Les étages sont des plateformes dans la même salle. Vérifiez les dégagements dans Contrôle & versions ; les sauts ne sont pas simulés.</p>
    <p class="forge-work-note">Remplacer une salle conserve un sas relié seulement si sa nouvelle position est identique. Un bloc verrouillé ou un calque masqué concerné interdit l’opération. Exportez votre projet avant une reconstruction importante.</p></details></div></div>
    <p data-build-status class="forge-build-status-v135" role="status" aria-live="polite"></p>`;
  work.append(root);
  const field = name => root.querySelector(`[data-build-field="${name}"]`), output = name => root.querySelector(`[data-build-${name}]`);
  const canvas = output('canvas'), ctx = canvas.getContext('2d'), removers = [];
  let plan = null, disposed = false, request = 0, formEpoch = 0, sourceData = null, accessKey = '';
  const access = () => ({ visible: editor.visible, locked: editor.lockedLayers });
  const accessSignature = () => JSON.stringify([[...editor.visible].sort(), [...editor.lockedLayers].sort()]);
  const listen = (target, type, callback, options) => { target.addEventListener(type, callback, options); removers.push(() => target.removeEventListener(type, callback, options)); };
  const tell = (text, error = false) => { output('status').textContent = text; output('status').dataset.error = String(error); };
  const guard = fn => { try { return fn(); } catch (error) { tell(error.message, true); return false; } };
  const currentRecipe = () => normalizeBlueprintV135(Object.fromEntries(fields.map(name => [name, numeric.has(name) ? Number(field(name).value) : name === 'vehicle' ? field(name).checked : field(name).value])));
  const settings = () => { const [roomId, cellId] = field('source').value.split(':'); return { destination: field('destination').value, connectFrom: roomId && cellId && field('destination').value === 'new' ? { roomId, cellId } : null }; };
  const signature = () => JSON.stringify([currentRecipe(), settings(), editor.model.data.kind]);
  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#09120f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!plan) { ctx.fillStyle = '#9bb7a7'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Prévisualisez votre secteur', canvas.width / 2, canvas.height / 2); return; }
    const room = plan.blueprint.room, scale = Math.min((canvas.width - 48) / room.size[0], (canvas.height - 48) / room.size[1]);
    const x0 = (canvas.width - room.size[0] * scale) / 2, y0 = (canvas.height - room.size[1] * scale) / 2;
    ctx.save(); ctx.translate(x0, y0);
    for (const layer of LAYERS) for (const c of room.cells.filter(c => c.layer === layer)) {
      ctx.globalAlpha = ['background', 'foreground'].includes(layer) ? .36 : 1;
      ctx.fillStyle = ink[c.type] || '#9cb7a9';
      const x = c.x * scale, y = c.y * scale;
      ctx.fillRect(x + 1, y + 1, scale - 2, c.type === 'platform' ? Math.max(2, scale * .25) : scale - 2);
      if (scale >= 12 && ['spawn', 'objective', 'door', 'terminal', 'enemy', 'vehicle', 'ladder', 'vent'].includes(c.type)) {
        ctx.fillStyle = '#06150f'; ctx.font = `bold ${Math.max(10, scale * .48)}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText({ spawn: 'S', objective: 'O', door: 'D', terminal: 'T', enemy: 'X', vehicle: 'V', ladder: '↕', vent: '≈' }[c.type], x + scale / 2, y + scale / 2);
      }
    }
    ctx.restore();
  }
  function invalidate(reason = '') {
    plan = null; output('validity').textContent = 'Pas d’aperçu'; output('report').replaceChildren();
    root.querySelector('[data-build-action="apply"]').disabled = true; paint(); if (reason) tell(reason);
  }
  function preview() {
    editor.cancelGesture(); editor.workbenchV133?.cancelStamp(); invalidate();
    const prepared = planBlueprintV135(editor.model, currentRecipe(), settings(), access());
    plan = { ...prepared, formSignature: signature(), accessKey: accessSignature() };
    const { room, report, decks } = plan.blueprint;
    output('validity').textContent = 'Plan constructible';
    output('summary').textContent = `${room.name} · ${room.size.join(' × ')} cases · ${decks.length} niveau(x) · ${room.cells.length} blocs${plan.retainedLinks ? ` · ${plan.retainedLinks} sas relié(s) conservé(s)` : ''}. Une seule annulation pour toute la construction.`;
    output('report').innerHTML = `<p>Insertion, objectif, supports et dégagements de grille contrôlés. Pas de validation physique des sauts.</p><div>${Object.entries(report.counts).map(([type, count]) => `<span>${escape(LABELS[type])} : ${count}</span>`).join('')}<span>Repères décoratifs : ${report.decorations}</span></div>${report.issues.map(i => `<p>${escape(i.message)}</p>`).join('')}`;
    root.querySelector('[data-build-action="apply"]').disabled = false; paint(); tell('Aperçu prêt ; le projet est encore inchangé.');
  }
  const api = {
    refresh() {
      if (disposed) return;
      const permissions = accessSignature();
      if (plan && (plan.model !== editor.model || plan.source !== editor.model.data || plan.revision !== editor.model.revision || editor.model.pending || plan.accessKey !== permissions)) invalidate('Le projet ou les calques ont changé : prévisualisez de nouveau.');
      if (sourceData !== editor.model.data || accessKey !== permissions) {
        sourceData = editor.model.data; accessKey = permissions;
        const value = field('source').value, used = new Set(sourceData.links.flatMap(l => [l.from.cellId, l.to.cellId]));
        const available = sourceData.rooms.flatMap(r => r.cells.filter(c => c.type === 'door' && ['structure', 'gameplay'].includes(c.layer) && !c.locked && editor.visible.has(c.layer) && !editor.lockedLayers.has(c.layer) && !used.has(c.id)).map(c => [`${r.id}:${c.id}`, `${r.name} / ${c.label || c.id}`]));
        field('source').innerHTML = '<option value="">Sans liaison automatique</option>' + choices(available); field('source').value = available.some(([id]) => id === value) ? value : '';
      }
      field('source').disabled = field('destination').value !== 'new';
      field('vehicle').disabled = field('profile').value !== 'hangar' || editor.model.data.kind === 'ship';
      if (field('vehicle').disabled) field('vehicle').checked = false;
      output('program').textContent = BLUEPRINTS_V135[field('profile').value]?.note || '';
    },
    keyDown(event) {
      if (event.key === 'Escape' && plan && !root.hidden) { event.preventDefault(); event.stopPropagation(); invalidate('Aperçu annulé ; aucune salle modifiée.'); return true; }
      return false;
    },
    cancel() { invalidate(); },
    getPlan() { return plan; },
    destroy() { disposed = true; request++; removers.forEach(off => off()); root.remove(); tab.remove(); }
  };
  listen(root, 'click', event => {
    const action = event.target.closest('[data-build-action]')?.dataset.buildAction; if (!action) return;
    guard(() => {
      if (action === 'preview') preview();
      if (action === 'variation') { field('seed').value = (Number(field('seed').value) + 1) % 1000000; formEpoch++; preview(); }
      if (action === 'cancel') invalidate('Aperçu annulé ; aucune salle modifiée.');
      if (action === 'apply') {
        if (!plan || plan.formSignature !== signature()) { invalidate(); throw new Error('Paramètres modifiés : prévisualisez de nouveau.'); }
        if (plan.options.destination === 'replace' && editor.room.cells.length && !globalThis.confirm(`Remplacer « ${editor.room.name} » (${editor.room.cells.length} blocs) ? Les sas compatibles restent reliés. Cette action est annulable.`)) return;
        const result = applyBlueprintV135(editor.model, plan, access()); invalidate();
        if (result.changed) { editor.selection.clear(); editor.cursor = null; editor.notify(); editor.fit(); }
        api.refresh(); tell('Secteur construit. Ses blocs sont éditables ; Annuler restaure le projet précédent.');
      }
      if (action === 'recipe-export') {
        const url = URL.createObjectURL(new Blob([exportBlueprintRecipeV135(currentRecipe())], { type: 'application/json' }));
        const anchor = doc.createElement('a'); anchor.href = url; anchor.download = 'frontier-forge-recette-v135.json'; doc.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    });
  });
  const changed = event => { if (event.target.dataset.buildField) { formEpoch++; invalidate('Paramètres modifiés : prévisualisez le nouveau plan.'); api.refresh(); } };
  listen(root, 'input', changed); listen(root, 'change', changed);
  listen(output('import'), 'change', async event => {
    const input = event.target, file = input.files?.[0]; if (!file) return;
    const ticket = ++request, epoch = formEpoch, model = editor.model, revision = model.revision;
    try {
      if (file.size > 16384) throw new Error('Recette trop volumineuse (16 Kio).');
      const raw = await file.text(); if (disposed || ticket !== request) return;
      if (model !== editor.model || revision !== model.revision || epoch !== formEpoch || editor.gesture) throw new Error('L’atelier a changé pendant la lecture ; import annulé.');
      const recipe = readBlueprintRecipeV135(raw);
      if (recipe.vehicle && editor.model.data.kind === 'ship') throw new Error('Recette avec véhicule : ouvrez un projet Mission avant de l’importer.');
      for (const name of fields) name === 'vehicle' ? field(name).checked = recipe[name] : field(name).value = recipe[name];
      formEpoch++; invalidate(); api.refresh(); tell('Recette chargée, sans modifier le projet. Prévisualisez avant de construire.');
    } catch (error) { tell(error.message, true); } finally { if (ticket === request) input.value = ''; }
  });
  // This listener is on the panel, before the global app Escape handler, never on window.
  listen(panel, 'keydown', event => api.keyDown(event));
  listen(panel, 'click', () => api.refresh()); listen(panel, 'change', () => api.refresh());
  queueMicrotask(() => { if (!disposed) { field('density').value = '2'; api.refresh(); paint(); } });
  return api;
}
