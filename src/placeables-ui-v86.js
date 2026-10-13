import { EQUIPMENT } from './content-core-v50.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const actorId = actor => actor?.crewId || actor?.operatorId || actor?.id || (actor?.coop ? 'coop' : 'player');
const depleted = item => item.kind === 'sentry' ? finite(item.ammo) <= 0 : ['containment', 'jammer'].includes(item.kind) ? item.modeV132 !== 'barrier' && finite(item.duration) <= 0
  : ['ammo-cache', 'battery', 'beacon'].includes(item.kind) ? finite(item.resourceRemainingV132) <= 0 : /^(cryo|shock)-trap$/.test(item.kind) && item.armed === false;
export const placeableResourceLabelV86 = item => item.kind === 'sentry' ? `${Math.floor(finite(item.ammo))} coups`
  : item.modeV132 === 'barrier' ? `Barrage ${item.lockedV132 ? 'verrouillé' : 'mobile'} · adaptation de l’armature`
  : ['containment', 'jammer'].includes(item.kind) ? `${Math.ceil(finite(item.duration))} s restantes`
  : item.kind === 'ammo-cache' ? `${Math.floor(finite(item.resourceRemainingV132))} cartouches disponibles`
  : item.kind === 'battery' ? `${Math.ceil(finite(item.resourceRemainingV132))} unités d’énergie`
  : item.kind === 'beacon' ? item.resourceRemainingV132 > 0 ? 'Relais prêt · une activation' : 'Relais utilisé'
  : item.armed ? 'Armé' : 'Consommé · boîtier inerte';

export function buildPlaceableDockModelV86(engine, role = 'player') {
  const resolvedRole = role === 'coop' && engine.coopEnabled && engine.coop ? 'coop' : 'player';
  const actor = resolvedRole === 'coop' ? engine.coop : engine.player;
  const snapshot = engine.getPlaceablesSnapshotV86?.() || { instances: [], previews: [], tasks: [] };
  const id = actorId(actor);
  const preview = snapshot.previews?.find(item => (item.actorCrewId || item.ownerCrewId || item.crewId) === id)
    || engine.placeablePreviewsV86?.get(id) || null;
  const task = snapshot.tasks?.find(item => item.actorCrewId === id) || engine.placeableTasksV86?.get(id) || null;
  const fieldAction = engine.getFieldActionSnapshotV124?.(actor) || null;
  const instances = snapshot.instances || [];
  const personal = actor?.crewV85?.personalEquipment;
  let states = personal ? (actor.crewV85.gear || []).filter(item => ['medical', 'repair', 'scan'].includes(item.function)).map(item => ({
    id: item.instanceId, name: EQUIPMENT.find(entry => entry.id === item.catalogId)?.name || item.catalogId,
    remaining: finite(actor.crewV85.charges?.[item.instanceId]), maxCharges: finite(item.charges), action: item.function
  })) : [...(engine.equipmentActions?.values() || [])];
  if (snapshot.extensionV132 && personal) {
    const owned = new Set(instances.filter(item => engine.canCarryPlaceableV86?.(item, actor)).map(item => item.catalogId));
    states = [...states, ...[...(engine.equipmentActions?.values() || [])].filter(item => owned.has(item.id) && !states.some(state => state.id === item.id))];
  }
  const reservedElsewhere = new Set([...(snapshot.previews || []), ...(snapshot.tasks || [])].filter(item => item.actorCrewId !== id).map(item => item.instanceId));
  const canAct = Boolean(engine.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88
    && engine.mission?.state === 'active' && actor?.alive && !actor.downed);
  const items = states.map(item => {
    const issued = instances.filter(instance => instance.catalogId === item.id);
    const carried = issued.filter(instance => instance.status === 'carried' && !reservedElsewhere.has(instance.instanceId)
      && (!snapshot.extensionV132 || engine.canCarryPlaceableV86?.(instance, actor)));
    const availability = engine.getFieldEquipmentAvailabilityV124?.(item.id, actor);
    const reusable = availability?.reusable || !personal && item.action === 'illumination';
    return { ...item, reusable, active: reusable && Boolean(actor?.fieldLightV124), reason: availability?.message || '',
      depleted: carried.filter(depleted).length, physical: issued.length > 0, available: issued.length ? carried.length : finite(item.remaining),
      disabled: !canAct || Boolean(task || fieldAction) || availability?.ok === false || (issued.length ? carried.length < 1
        || (typeof engine.canManipulatePlaceableV86 === 'function' && !engine.canManipulatePlaceableV86(actor)) : !reusable && finite(item.remaining) < 1) };
  });
  const nearby = instances.filter(item => ['deployed', 'spent'].includes(item.status) && item.onGround === true && item.health > 0 && Math.hypot(
    finite(item.x) + finite(item.w) / 2 - finite(actor?.x) - finite(actor?.w) / 2,
    finite(item.y) + finite(item.h) / 2 - finite(actor?.y) - finite(actor?.h) / 2
  ) <= 140).map(item => ({ ...item, reserved: reservedElsewhere.has(item.instanceId), usableV132: engine.canUseDeployedPlaceableV132?.(item.instanceId, actor), name: item.name || states.find(state => state.id === item.catalogId)?.name || item.kind }));
  return { role: resolvedRole, actorId: id, coopEnabled: Boolean(engine.coopEnabled), canAct,
    showMissionSave: Boolean(engine.running && engine.paused && engine.mission), extensionV132: Boolean(snapshot.extensionV132), items, preview, task, fieldAction, nearby };
}

export function renderPlaceableDockMarkupV86(model) {
  const save = model.showMissionSave ? '<button type="button" id="mission-save-v86" class="button compact" data-placeable-action="save">Sauvegarder la mission</button>' : '';
  const actor = model.coopEnabled ? `<label class="placeable-operator-v86">Opérateur <select data-placeable-operator aria-label="Opérateur des équipements"><option value="player" ${model.role === 'player' ? 'selected' : ''}>J1</option><option value="coop" ${model.role === 'coop' ? 'selected' : ''}>J2</option></select></label>` : '';
  const equipment = model.items.map((item, index) => `<button type="button" class="button compact" data-use-equipment="${escape(item.id)}"${item.reason ? ` title="${escape(item.reason)}"` : ''} ${item.disabled ? 'disabled' : ''}>${index + 1}. ${escape(item.name)} · ${item.reusable ? item.active ? 'ÉTEINDRE' : 'ALLUMER' : item.available + (item.physical ? ' porté(s)' : '/' + item.maxCharges)}${item.depleted ? ' · ' + item.depleted + ' épuisé(s)' : ''}</button>`).join('');
  const preview = model.preview;
  const task = model.task;
  const context = model.fieldAction ? `<div class="placeable-context-v86"><span role="status">${escape(model.fieldAction.label)} · restez en position.</span><button type="button" class="button compact" data-placeable-action="cancel-field">Annuler</button></div>`
    : task ? `<div class="placeable-context-v86"><span role="status">${({ recover: 'Repli', deploy: 'Installation', mode: 'Changement de mode', push: 'Poussée', lock: 'Verrouillage', supply: 'Transfert', activate: 'Activation du relais' }[task.type] || 'Manipulation')} en cours · restez en position. Les tirs sont suspendus.</span><button type="button" class="button compact" data-placeable-action="cancel">Annuler</button></div>`
    : preview ? `<div class="placeable-context-v86"><span role="status">${preview.valid ? 'Emplacement valide · vérifiez le secteur dans le niveau.' : escape(preview.reason || 'Emplacement impossible.')}</span>${model.extensionV132 && preview.kind === 'containment' ? `<button type="button" class="button compact" data-placeable-mode="barrier" data-placeable-instance="${escape(preview.instanceId)}">Mode barrage mobile</button><button type="button" class="button compact" data-placeable-mode="containment" data-placeable-instance="${escape(preview.instanceId)}">Mode confinement</button>` : ''}<button type="button" class="button compact" data-placeable-action="confirm" ${!preview.valid || !model.canAct ? 'disabled' : ''}>Installer ici</button><button type="button" class="button compact" data-placeable-action="cancel">Annuler l’aperçu</button></div>` : '';
  const nearby = model.nearby.length ? `<details class="placeable-nearby-v86"><summary>Matériel à portée · ${model.nearby.length}</summary>${model.nearby.map(item => {
    const id = escape(item.instanceId || item.id), disabled = !model.canAct || task || model.fieldAction || item.reserved ? 'disabled' : '';
    const action = (type, label, off = false) => `<button type="button" class="button compact" data-placeable-extension="${type}" data-placeable-instance="${id}" ${disabled || off ? 'disabled' : ''}>${label}</button>`;
    const controls = !model.extensionV132 ? '' : item.kind === 'containment' ? `${action(item.modeV132 === 'barrier' ? 'containment' : 'barrier', item.modeV132 === 'barrier' ? 'Confinement' : 'Barrage mobile', item.modeV132 === 'barrier' && item.duration <= 0)}${item.modeV132 === 'barrier' ? action('lock', item.lockedV132 ? 'Déverrouiller' : 'Verrouiller') + action('push-left', 'Pousser ←', item.lockedV132) + action('push-right', 'Pousser →', item.lockedV132) : ''}`
      : ['ammo-cache', 'battery', 'beacon'].includes(item.kind) ? action('use', item.kind === 'beacon' ? 'Activer le point de reprise' : item.kind === 'battery' ? 'Charger le détecteur' : 'Prendre les cartouches', !(item.resourceRemainingV132 > 0) || item.usableV132 === false) : '';
    return `<div><span>${escape(item.name)} · PV ${Math.ceil(finite(item.health))} · ${placeableResourceLabelV86(item)}</span>${controls}<button type="button" class="button compact" data-placeable-recover="${id}" ${disabled}>Replier sans ravitailler</button></div>`;
  }).join('')}</details>` : '';
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
        else if (button.dataset.placeableMode) result = engine.setPlaceableModeV132(button.dataset.placeableInstance, button.dataset.placeableMode, actor);
        else if (button.dataset.placeableExtension) {
          const id = button.dataset.placeableInstance, action = button.dataset.placeableExtension;
          if (action === 'use') result = engine.useDeployedPlaceableV132(id, actor);
          else if (action === 'lock') result = engine.togglePlaceableLockV132(id, actor);
          else if (action.startsWith('push-')) result = engine.pushPlaceableV132(id, action === 'push-left' ? -1 : 1, actor);
          else result = engine.setPlaceableModeV132(id, action, actor);
        }
        else if (button.dataset.placeableAction === 'confirm') result = engine.confirmPlaceableV86(actor);
        else if (button.dataset.placeableAction === 'cancel') result = engine.cancelPlaceableV86(actor);
        else if (button.dataset.placeableAction === 'cancel-field') result = engine.cancelFieldActionV124(actor);
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
    const focusKey = focused ? ['useEquipment', 'placeableRecover', 'placeableMode', 'placeableExtension', 'placeableAction', 'placeableOperator'].find(key => Object.hasOwn(focused.dataset, key)) : null;
    const focusValue = focused?.dataset[focusKey];
    const focusInstance = focused?.dataset.placeableInstance;
    const open = this.root.querySelector('details')?.open;
    this.signature = markup; this.root.innerHTML = markup;
    if (open && this.root.querySelector('details')) this.root.querySelector('details').open = true;
    if (focusKey) [...this.root.querySelectorAll('button,select')].find(node => node.dataset[focusKey] === focusValue && node.dataset.placeableInstance === focusInstance)?.focus({ preventScroll: true });
  }

  dispose() { clearInterval(this.timer); }
}
