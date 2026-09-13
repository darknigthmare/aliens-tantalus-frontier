const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const actorId = actor => actor?.crewId || actor?.operatorId || actor?.id || (actor?.coop ? 'coop' : 'player');
const depleted = item => item.kind === 'sentry' ? finite(item.ammo) <= 0 : item.kind === 'containment' ? finite(item.duration) <= 0 : /^(cryo|shock)-trap$/.test(item.kind) && item.armed === false;
export const placeableResourceLabelV86 = item => item.kind === 'sentry' ? `${Math.floor(finite(item.ammo))} coups` : item.kind === 'containment' ? `${Math.ceil(finite(item.duration))} s restantes` : item.armed ? 'Armé' : 'Consommé · boîtier inerte';

export function buildPlaceableDockModelV86(engine, role = 'player') {
  const resolvedRole = role === 'coop' && engine.coopEnabled && engine.coop ? 'coop' : 'player';
  const actor = resolvedRole === 'coop' ? engine.coop : engine.player;
  const snapshot = engine.getPlaceablesSnapshotV86?.() || { instances: [], previews: [], tasks: [] };
  const id = actorId(actor);
  const preview = snapshot.previews?.find(item => (item.actorCrewId || item.ownerCrewId || item.crewId) === id)
    || engine.placeablePreviewsV86?.get(id) || null;
  const task = snapshot.tasks?.find(item => item.actorCrewId === id) || engine.placeableTasksV86?.get(id) || null;
  const instances = snapshot.instances || [];
  const states = [...(engine.equipmentActions?.values() || [])];
  const reservedElsewhere = new Set([...(snapshot.previews || []), ...(snapshot.tasks || [])].filter(item => item.actorCrewId !== id).map(item => item.instanceId));
  const canAct = Boolean(engine.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && engine.mission?.state === 'active' && actor?.alive);
  const items = states.map(item => {
    const issued = instances.filter(instance => instance.catalogId === item.id);
    const carried = issued.filter(instance => instance.status === 'carried' && !reservedElsewhere.has(instance.instanceId));
    return { ...item, depleted: carried.filter(depleted).length, physical: issued.length > 0, available: issued.length ? carried.length : finite(item.remaining), disabled: !canAct || Boolean(task) || (issued.length ? carried.length < 1 || (typeof engine.canManipulatePlaceableV86 === 'function' && !engine.canManipulatePlaceableV86(actor)) : finite(item.remaining) < 1) };
  });
  const nearby = instances.filter(item => ['deployed', 'spent'].includes(item.status) && item.onGround === true && item.health > 0 && Math.hypot(
    finite(item.x) + finite(item.w) / 2 - finite(actor?.x) - finite(actor?.w) / 2,
    finite(item.y) + finite(item.h) / 2 - finite(actor?.y) - finite(actor?.h) / 2
  ) <= 140).map(item => ({ ...item, reserved: reservedElsewhere.has(item.instanceId), name: states.find(state => state.id === item.catalogId)?.name || item.kind }));
  return { role: resolvedRole, actorId: id, coopEnabled: Boolean(engine.coopEnabled), canAct,
    showMissionSave: Boolean(engine.running && engine.paused && engine.mission), items, preview, task, nearby };
}

export function renderPlaceableDockMarkupV86(model) {
  const save = model.showMissionSave ? '<button type="button" id="mission-save-v86" class="button compact" data-placeable-action="save">Sauvegarder la mission</button>' : '';
  const actor = model.coopEnabled ? `<label class="placeable-operator-v86">Opérateur <select data-placeable-operator aria-label="Opérateur des équipements"><option value="player" ${model.role === 'player' ? 'selected' : ''}>J1</option><option value="coop" ${model.role === 'coop' ? 'selected' : ''}>J2</option></select></label>` : '';
  const equipment = model.items.map((item, index) => `<button type="button" class="button compact" data-use-equipment="${escape(item.id)}" ${item.disabled ? 'disabled' : ''}>${index + 1}. ${escape(item.name)} · ${item.available}${item.physical ? ' porté(s)' : '/' + item.maxCharges}${item.depleted ? ' · ' + item.depleted + ' épuisé(s)' : ''}</button>`).join('');
  const preview = model.preview;
  const task = model.task;
  const context = task ? `<div class="placeable-context-v86"><span role="status">${task.type === 'recover' ? 'Repli' : 'Installation'} en cours · restez en position. Les tirs sont suspendus.</span><button type="button" class="button compact" data-placeable-action="cancel">Annuler</button></div>`
    : preview ? `<div class="placeable-context-v86"><span role="status">${preview.valid ? 'Emplacement valide · vérifiez le secteur dans le niveau.' : escape(preview.reason || 'Emplacement impossible.')}</span><button type="button" class="button compact" data-placeable-action="confirm" ${!preview.valid || !model.canAct ? 'disabled' : ''}>Installer ici</button><button type="button" class="button compact" data-placeable-action="cancel">Annuler l’aperçu</button></div>` : '';
  const nearby = model.nearby.length ? `<details class="placeable-nearby-v86"><summary>Matériel à portée · ${model.nearby.length}</summary>${model.nearby.map(item => `<div><span>${escape(item.name)} · PV ${Math.ceil(finite(item.health))} · ${placeableResourceLabelV86(item)}</span><button type="button" class="button compact" data-placeable-recover="${escape(item.instanceId || item.id)}" ${!model.canAct || task || item.reserved ? 'disabled' : ''}>Replier sans ravitailler</button></div>`).join('')}</details>` : '';
  return `${save}${actor}<div class="placeable-items-v86">${equipment || '<span class="hint">Aucun équipement actif.</span>'}</div>${context}${nearby}`;
}

// One dock for keyboard, mouse and touch; polling only updates changed state.
// No DOM churn for the per-frame progress bar (drawn inside the actual level).
export class PlaceablesDockV86 {
  constructor(root, engine, { onError = () => {}, onActivate = () => {}, onSave = () => false } = {}) {
    this.root = root; this.engine = engine; this.role = 'player'; this.signature = ''; this.onError = onError; this.onActivate = onActivate; this.onSave = onSave;
    root.classList.add('placeables-dock-v86');
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled || !root.contains(button)) return;
      if (button.dataset.placeableAction === 'save') {
        if (!engine.running || !engine.paused || !engine.mission) return;
        // The shared application handler owns all commit, ownership and error feedback.
        try { this.onSave(); } catch (error) { this.onError(error.message); }
        return;
      }
      const actor = this.role === 'coop' && engine.coopEnabled ? engine.coop : engine.player;
      this.onActivate();
      try {
        let result;
        if (button.dataset.useEquipment) result = engine.useEquipment(button.dataset.useEquipment, actor);
        else if (button.dataset.placeableRecover) result = engine.recoverPlaceableV86(button.dataset.placeableRecover, actor);
        else if (button.dataset.placeableAction === 'confirm') result = engine.confirmPlaceableV86(actor);
        else if (button.dataset.placeableAction === 'cancel') result = engine.cancelPlaceableV86(actor);
        else return;
        if (result === false) this.onError('Action impossible : vérifiez la distance, le terrain, la disponibilité et l’état de l’opérateur.');
        this.render();
        engine.canvas?.focus?.({ preventScroll: true });
      } catch (error) { this.onError(error.message); }
    });
    root.addEventListener('change', event => {
      if (!event.target.matches('[data-placeable-operator]')) return;
      this.role = event.target.value === 'coop' ? 'coop' : 'player'; this.render();
    });
    this.timer = setInterval(() => { if (!globalThis.document?.hidden && engine.running) this.render(); }, 200);
  }

  render() {
    const model = buildPlaceableDockModelV86(this.engine, this.role);
    this.role = model.role;
    const markup = renderPlaceableDockMarkupV86(model);
    if (markup === this.signature) return;
    const focused = this.root.contains(globalThis.document?.activeElement) ? globalThis.document.activeElement : null;
    const focusKey = focused ? ['useEquipment', 'placeableRecover', 'placeableAction', 'placeableOperator'].find(key => Object.hasOwn(focused.dataset, key)) : null;
    const focusValue = focused?.dataset[focusKey];
    const open = this.root.querySelector('details')?.open;
    this.signature = markup; this.root.innerHTML = markup;
    if (open && this.root.querySelector('details')) this.root.querySelector('details').open = true;
    if (focusKey) [...this.root.querySelectorAll('button,select')].find(node => node.dataset[focusKey] === focusValue)?.focus({ preventScroll: true });
  }

  dispose() { clearInterval(this.timer); }
}
