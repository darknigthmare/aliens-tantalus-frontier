export const ALIEN_SURVIVAL_POWER_CIRCUITS_V70 = Object.freeze([
  Object.freeze({ id: 'life-support', label: 'VIE' }),
  Object.freeze({ id: 'security', label: 'SÉCURITÉ' }),
  Object.freeze({ id: 'cctv', label: 'CCTV' })
]);

export const ALIEN_SURVIVAL_DOCK_REFRESH_HZ_V70 = 8;

export const ALIEN_SURVIVAL_ACTIONS_V70 = Object.freeze([
  ...ALIEN_SURVIVAL_POWER_CIRCUITS_V70.map((circuit) => Object.freeze({
    id: `power-${circuit.id}`, group: 'power', label: circuit.label, circuitId: circuit.id
  })),
  Object.freeze({ id: 'weld-door', group: 'field', label: 'SOUDER LA PORTE' }),
  Object.freeze({ id: 'cancel-action', group: 'field', label: 'ANNULER L’ACTION' }),
  Object.freeze({ id: 'cctv-open', group: 'cctv', label: 'OUVRIR CCTV' }),
  Object.freeze({ id: 'cctv-previous', group: 'cctv', label: 'FLUX PRÉCÉDENT' }),
  Object.freeze({ id: 'cctv-next', group: 'cctv', label: 'FLUX SUIVANT' }),
  Object.freeze({ id: 'cctv-close', group: 'cctv', label: 'FERMER CCTV' }),
  Object.freeze({ id: 'self-destruct-authorize', group: 'self-destruct', label: 'AUTORISER LE POSTE' }),
  Object.freeze({ id: 'self-destruct-arm', group: 'self-destruct', label: 'ARMER L’AUTO-DESTRUCTION' })
]);

const asArray = (value) => Array.isArray(value) ? value : [];
const asRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asText = (value, fallback = '') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, finite(value, minimum)));
const percent = (value, fallback = 0) => Math.round(clamp(value ?? fallback));

function element(documentRef, tagName, options = {}) {
  const node = documentRef.createElement(tagName);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  for (const [name, value] of Object.entries(options.attributes || {})) {
    if (value === null || value === undefined || value === false) continue;
    node.setAttribute(name, value === true ? '' : String(value));
  }
  return node;
}

function routeEnabled(routes, circuitId) {
  if (Array.isArray(routes)) {
    return routes.some((entry) => typeof entry === 'string'
      ? entry === circuitId
      : asText(entry?.id || entry?.circuitId) === circuitId && Boolean(entry.enabled ?? entry.active ?? entry.powered));
  }
  const source = asRecord(routes);
  const value = source[circuitId] ?? source[circuitId.replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase())];
  return typeof value === 'object' ? Boolean(value?.enabled ?? value?.active ?? value?.powered) : Boolean(value);
}

function normalizeWorldAction(candidate) {
  const action = asRecord(candidate);
  const rawProgress = finite(action.progress, 0);
  const progress = rawProgress >= 0 && rawProgress <= 1 ? rawProgress * 100 : rawProgress;
  const type = asText(action.type);
  if (!type && !asText(action.id)) return null;
  return Object.freeze({
    id: asText(action.id, `${type || 'world'}-action`),
    type,
    targetId: asText(action.targetId || action.stationId || action.doorId),
    label: asText(action.label, 'INTERACTION TERRAIN'),
    progress: percent(progress),
    durationSeconds: Math.max(0, finite(action.durationSeconds, 0)),
    canExecute: Boolean(action.canExecute),
    nearby: Boolean(action.nearby),
    blockedReason: asText(action.blockedReason)
  });
}

function normalizeDoor(candidate, index, worldAction) {
  const door = asRecord(candidate);
  const id = asText(door.id || door.doorId, `door-${index + 1}`);
  const linkedAction = worldAction?.type === 'weld-door' && worldAction.targetId === id ? worldAction : null;
  return Object.freeze({
    id,
    label: asText(door.label || door.name, id.toUpperCase()),
    welded: Boolean(door.welded),
    weldIntegrity: percent(door.weldIntegrity),
    canWeld: Boolean(door.canWeld),
    nearby: Boolean(door.nearby ?? linkedAction?.nearby),
    blockedReason: asText(door.blockedReason || linkedAction?.blockedReason)
  });
}

export function normalizeAlienSurvivalUiStateV70(rawState = {}) {
  const state = asRecord(rawState);
  const room = asRecord(state.room);
  const power = asRecord(state.power);
  const cctv = asRecord(state.cctv);
  const selfDestruct = asRecord(state.selfDestruct);
  const acid = asRecord(state.acid);
  const worldAction = normalizeWorldAction(state.worldAction);
  const routes = Object.freeze(Object.fromEntries(ALIEN_SURVIVAL_POWER_CIRCUITS_V70.map((circuit) => [
    circuit.id,
    routeEnabled(power.routes, circuit.id)
  ])));
  const allocatedCircuits = ALIEN_SURVIVAL_POWER_CIRCUITS_V70.filter((circuit) => routes[circuit.id]).length;
  return Object.freeze({
    active: Boolean(state.active),
    phase: asText(state.phase, 'survival').toLowerCase(),
    room: Object.freeze({
      id: asText(room.id || room.roomId, 'secteur-inconnu'),
      pressure: Math.round(clamp(room.pressure, 0, 200) * 10) / 10,
      oxygen: percent(room.oxygen),
      breached: Boolean(room.breached)
    }),
    rooms: Object.freeze(asArray(state.rooms).map((entry) => Object.freeze({ ...asRecord(entry) }))),
    power: Object.freeze({
      capacity: Math.max(0, Math.min(ALIEN_SURVIVAL_POWER_CIRCUITS_V70.length, Math.floor(finite(power.capacity, 0)))),
      allocatedCircuits,
      routes,
      rerouteCount: Math.max(0, Math.floor(finite(power.rerouteCount, 0))),
      availableAtConsole: Boolean(power.availableAtConsole),
      blockedReason: asText(power.blockedReason, 'Approchez-vous d’une console électrique.')
    }),
    doors: Object.freeze(asArray(state.doors).map((door, index) => normalizeDoor(door, index, worldAction))),
    cctv: Object.freeze({
      active: Boolean(cctv.active),
      selectedFeedId: asText(cctv.selectedFeedId),
      visitedFeedIds: Object.freeze(asArray(cctv.visitedFeedIds).map((id) => asText(id)).filter(Boolean)),
      requiredFeedIds: Object.freeze(asArray(cctv.requiredFeedIds).map((id) => asText(id)).filter(Boolean)),
      scanComplete: Boolean(cctv.scanComplete),
      availableAtConsole: Boolean(cctv.availableAtConsole),
      blockedReason: asText(cctv.blockedReason, 'Approchez-vous d’une console de sécurité.')
    }),
    selfDestruct: Object.freeze({
      engineeringAuthorized: Boolean(selfDestruct.engineeringAuthorized),
      commandAuthorized: Boolean(selfDestruct.commandAuthorized),
      armed: Boolean(selfDestruct.armed),
      remaining: Math.max(0, finite(selfDestruct.remaining, 0)),
      expired: Boolean(selfDestruct.expired),
      canAuthorize: Boolean(selfDestruct.canAuthorize),
      canArm: Boolean(selfDestruct.canArm),
      stationId: asText(selfDestruct.stationId || (worldAction?.type === 'authorize-self-destruct' ? worldAction.targetId : '')),
      blockedReason: asText(selfDestruct.blockedReason || (worldAction?.type === 'authorize-self-destruct' ? worldAction.blockedReason : ''), 'Double autorisation physique requise.')
    }),
    acid: Object.freeze({
      activePoolCount: Math.max(0, Math.floor(finite(acid.activePoolCount, 0))),
      totalPoolCount: Math.max(0, Math.floor(finite(acid.totalPoolCount, 0)))
    }),
    worldAction,
    interactionPrompt: asText(state.interactionPrompt, 'Déplacez-vous jusqu’à un système physique pour agir.'),
    status: asText(state.status || state.message)
  });
}

function engineState(engine) {
  if (typeof engine?.getAlienSurvivalUiStateV70 === 'function') return engine.getAlienSurvivalUiStateV70();
  if (typeof engine?.getAlienSurvivalStateV70 === 'function') return engine.getAlienSurvivalStateV70();
  return engine?.alienSurvivalUiStateV70 || engine?.alienSurvivalV70 || {};
}

function weldTarget(state) {
  const actionTarget = state.worldAction?.type === 'weld-door' ? state.worldAction.targetId : '';
  return state.doors.find((door) => door.id === actionTarget)
    || state.doors.find((door) => door.canWeld && door.nearby)
    || state.doors.find((door) => door.canWeld)
    || null;
}

export function getAlienSurvivalActionStateV70(actionId, rawState = {}) {
  const state = normalizeAlienSurvivalUiStateV70(rawState);
  const action = ALIEN_SURVIVAL_ACTIONS_V70.find((entry) => entry.id === actionId);
  if (!action) return Object.freeze({ enabled: false, reason: 'Commande inconnue.', label: actionId });
  if (!state.active) return Object.freeze({ enabled: false, reason: 'Systèmes de survie hors ligne.', label: action.label });
  if (action.group === 'power') {
    const enabled = state.power.availableAtConsole;
    const active = Boolean(state.power.routes[action.circuitId]);
    return Object.freeze({ enabled, active, label: `${action.label} · ${active ? 'ON' : 'OFF'}`, reason: enabled ? '' : state.power.blockedReason });
  }
  if (action.id === 'weld-door') {
    const door = weldTarget(state);
    const linkedAction = state.worldAction?.type === 'weld-door' && state.worldAction.targetId === door?.id ? state.worldAction : null;
    const enabled = Boolean(door?.canWeld && door.nearby && (!linkedAction || linkedAction.canExecute));
    const reason = enabled ? '' : door?.blockedReason || linkedAction?.blockedReason || (door ? 'Approchez-vous de la porte.' : 'Aucune porte soudable à proximité.');
    const progress = linkedAction?.progress || door?.weldIntegrity || 0;
    return Object.freeze({ enabled, active: Boolean(door?.welded), targetId: door?.id || '', label: `${door?.welded ? 'RENFORCER' : 'SOUDER'} · ${door?.label || 'PORTE'}${progress ? ` · ${progress}%` : ''}`, reason });
  }
  if (action.id === 'cancel-action') {
    const enabled = Boolean(state.worldAction && state.worldAction.progress < 100);
    return Object.freeze({ enabled, active: false, label: action.label, reason: enabled ? '' : 'Aucune action terrain en cours.' });
  }
  if (action.id === 'cctv-open') {
    const enabled = state.cctv.availableAtConsole && !state.cctv.active;
    return Object.freeze({ enabled, active: state.cctv.active, label: action.label, reason: enabled ? '' : state.cctv.active ? 'CCTV déjà ouverte.' : state.cctv.blockedReason });
  }
  if (action.id === 'cctv-previous' || action.id === 'cctv-next' || action.id === 'cctv-close') {
    return Object.freeze({ enabled: state.cctv.active, active: state.cctv.active, label: action.label, reason: state.cctv.active ? '' : 'Ouvrez la console CCTV.' });
  }
  if (action.id === 'self-destruct-authorize') {
    const authorized = state.selfDestruct.engineeringAuthorized && state.selfDestruct.commandAuthorized;
    const enabled = state.selfDestruct.canAuthorize && !state.selfDestruct.armed && !state.selfDestruct.expired;
    return Object.freeze({ enabled, active: authorized, targetId: state.selfDestruct.stationId, label: authorized ? 'DOUBLE AUTORISATION VALIDÉE' : action.label, reason: enabled ? '' : state.selfDestruct.blockedReason });
  }
  if (action.id === 'self-destruct-arm') {
    const enabled = state.selfDestruct.canArm && !state.selfDestruct.armed && !state.selfDestruct.expired;
    const reason = enabled ? '' : state.selfDestruct.armed ? 'Auto-destruction déjà armée.' : state.selfDestruct.blockedReason;
    return Object.freeze({ enabled, active: state.selfDestruct.armed, label: state.selfDestruct.armed ? 'AUTO-DESTRUCTION ARMÉE' : action.label, reason });
  }
  return Object.freeze({ enabled: false, active: false, label: action.label, reason: 'Commande indisponible.' });
}

function callEngine(engine, method, ...parameters) {
  if (typeof engine?.[method] !== 'function') return { called: false, result: null };
  return { called: true, result: engine[method](...parameters) };
}

export class AlienSurvivalDockV70 {
  constructor({ root, engine, documentRef = root?.ownerDocument || globalThis.document } = {}) {
    if (!root || !engine || !documentRef) throw new TypeError('AlienSurvivalDockV70 requiert le dock et le moteur.');
    this.root = root;
    this.engine = engine;
    this.document = documentRef;
    this.collapsed = false;
    this.lastStatus = '';
    this.autoRefreshTimer = null;
    this.clearAutoRefreshTimer = null;
    this.boundClick = (event) => this.handleClick(event);
    this.boundKeydown = (event) => this.handleKeydown(event);
    this.root.addEventListener('click', this.boundClick);
    this.root.addEventListener('keydown', this.boundKeydown);
    this.mount();
    this.refresh();
  }

  destroy() {
    this.stopAutoRefresh();
    this.root.removeEventListener('click', this.boundClick);
    this.root.removeEventListener('keydown', this.boundKeydown);
    this.root.replaceChildren();
  }

  startAutoRefresh({
    frequencyHz = ALIEN_SURVIVAL_DOCK_REFRESH_HZ_V70,
    setIntervalRef = globalThis.setInterval?.bind(globalThis),
    clearIntervalRef = globalThis.clearInterval?.bind(globalThis)
  } = {}) {
    this.stopAutoRefresh();
    if (typeof setIntervalRef !== 'function') return false;
    const refreshHz = Math.max(5, Math.min(10, finite(frequencyHz, ALIEN_SURVIVAL_DOCK_REFRESH_HZ_V70)));
    this.clearAutoRefreshTimer = typeof clearIntervalRef === 'function' ? clearIntervalRef : null;
    this.autoRefreshTimer = setIntervalRef(() => {
      const state = this.snapshot();
      if (state.active || !this.root.hidden) this.refresh(state);
    }, 1000 / refreshHz);
    return true;
  }

  stopAutoRefresh() {
    if (this.autoRefreshTimer === null) return false;
    this.clearAutoRefreshTimer?.(this.autoRefreshTimer);
    this.autoRefreshTimer = null;
    this.clearAutoRefreshTimer = null;
    return true;
  }

  mount() {
    const headingId = 'alien-survival-heading-v70';
    const bodyId = 'alien-survival-body-v70';
    const promptId = 'alien-survival-prompt-v70';
    const header = element(this.document, 'header', { className: 'alien-survival-header-v70' });
    const heading = element(this.document, 'div');
    heading.append(
      element(this.document, 'span', { className: 'alien-survival-kicker-v70', text: 'MU/TH/UR · SURVIE' }),
      element(this.document, 'strong', { text: 'SYSTÈMES DU SECTEUR', attributes: { id: headingId } }),
      element(this.document, 'small', { attributes: { 'data-alien-survival-phase': '' } })
    );
    const collapse = element(this.document, 'button', {
      className: 'alien-survival-collapse-v70',
      text: '−',
      attributes: { type: 'button', 'data-alien-survival-collapse': '', 'aria-label': 'Replier les systèmes de survie', 'aria-expanded': 'true', 'aria-controls': bodyId }
    });
    header.append(heading, collapse);

    const body = element(this.document, 'div', { className: 'alien-survival-body-v70', attributes: { id: bodyId } });
    const metrics = element(this.document, 'div', { className: 'alien-survival-metrics-v70', attributes: { 'data-alien-survival-metrics': '', role: 'group', 'aria-label': 'État du secteur' } });
    body.append(metrics);
    const groups = [
      ['power', 'ROUTAGE ÉNERGIE'],
      ['field', 'INTERACTION PHYSIQUE'],
      ['cctv', 'SÉCURITÉ CCTV'],
      ['self-destruct', 'AUTO-DESTRUCTION']
    ];
    for (const [groupId, label] of groups) {
      const group = element(this.document, 'div', { className: `alien-survival-group-v70 ${groupId}`, attributes: { role: 'group', 'aria-label': label } });
      group.append(element(this.document, 'span', { className: 'alien-survival-group-label-v70', text: label }));
      for (const action of ALIEN_SURVIVAL_ACTIONS_V70.filter((entry) => entry.group === groupId)) {
        group.append(element(this.document, 'button', {
          className: 'alien-survival-action-v70',
          text: action.label,
          attributes: {
            type: 'button',
            'data-alien-survival-action': action.id,
            'aria-disabled': 'true',
            'aria-describedby': promptId,
            tabindex: '-1'
          }
        }));
      }
      body.append(group);
    }
    body.append(
      element(this.document, 'p', { className: 'alien-survival-prompt-v70', attributes: { id: promptId, 'data-alien-survival-prompt': '' } }),
      element(this.document, 'p', { className: 'alien-survival-live-v70 sr-only', attributes: { 'data-alien-survival-live': '', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } })
    );
    this.root.replaceChildren(header, body);
    this.root.setAttribute('data-alien-survival-dock', '');
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-labelledby', headingId);
  }

  snapshot(rawState = engineState(this.engine)) {
    return normalizeAlienSurvivalUiStateV70(rawState);
  }

  refresh(rawState = engineState(this.engine)) {
    const state = this.snapshot(rawState);
    this.root.hidden = !state.active;
    this.root.setAttribute('aria-hidden', state.active ? 'false' : 'true');
    if (!state.active) return state;
    const phase = this.root.querySelector('[data-alien-survival-phase]');
    if (phase) phase.textContent = state.phase.toUpperCase().replaceAll('-', ' ');
    const body = this.root.querySelector('#alien-survival-body-v70');
    if (body) body.hidden = this.collapsed;
    const collapse = this.root.querySelector('[data-alien-survival-collapse]');
    if (collapse) {
      collapse.textContent = this.collapsed ? '+' : '−';
      collapse.setAttribute('aria-expanded', this.collapsed ? 'false' : 'true');
      collapse.setAttribute('aria-label', this.collapsed ? 'Déplier les systèmes de survie' : 'Replier les systèmes de survie');
    }
    this.renderMetrics(state);
    const prompt = this.root.querySelector('[data-alien-survival-prompt]');
    if (prompt) prompt.textContent = state.interactionPrompt;
    for (const button of this.root.querySelectorAll('[data-alien-survival-action]')) {
      const actionState = getAlienSurvivalActionStateV70(button.dataset.alienSurvivalAction, state);
      button.textContent = actionState.label;
      button.setAttribute('aria-disabled', actionState.enabled ? 'false' : 'true');
      button.setAttribute('aria-pressed', actionState.active ? 'true' : 'false');
      button.setAttribute('aria-label', `${actionState.label}${actionState.enabled ? '' : ` · indisponible : ${actionState.reason}`}`);
      button.setAttribute('title', actionState.enabled ? actionState.label : actionState.reason);
      if (actionState.targetId) button.setAttribute('data-target-id', actionState.targetId);
      else button.removeAttribute('data-target-id');
      button.classList.toggle?.('disabled', !actionState.enabled);
      button.classList.toggle?.('active', Boolean(actionState.active));
    }
    this.updateRovingTabIndex();
    const live = this.root.querySelector('[data-alien-survival-live]');
    const nextStatus = this.lastStatus || state.status;
    if (live && nextStatus && live.textContent !== nextStatus) live.textContent = nextStatus;
    return state;
  }

  renderMetrics(state) {
    const metrics = this.root.querySelector('[data-alien-survival-metrics]');
    if (!metrics) return;
    const pressure = element(this.document, 'span', {
      className: `alien-survival-metric-v70${state.room.breached ? ' danger' : ''}`,
      text: `PRESSION ${state.room.pressure} kPa`,
      attributes: { role: 'meter', 'aria-label': `Pression ${state.room.id}`, 'aria-valuemin': '0', 'aria-valuemax': '200', 'aria-valuenow': state.room.pressure }
    });
    const oxygen = element(this.document, 'span', {
      className: `alien-survival-metric-v70${state.room.oxygen < 35 ? ' danger' : ''}`,
      text: `O₂ ${state.room.oxygen}%`,
      attributes: { role: 'meter', 'aria-label': `Oxygène ${state.room.id}`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': state.room.oxygen }
    });
    const power = element(this.document, 'span', {
      className: 'alien-survival-metric-v70',
      text: `ÉNERGIE ${state.power.allocatedCircuits}/${state.power.capacity}`,
      attributes: { role: 'meter', 'aria-label': 'Circuits électriques alimentés', 'aria-valuemin': '0', 'aria-valuemax': Math.max(1, state.power.capacity), 'aria-valuenow': state.power.allocatedCircuits }
    });
    const acid = element(this.document, 'span', {
      className: `alien-survival-metric-v70${state.acid.activePoolCount ? ' danger' : ''}`,
      text: `ACIDE ${state.acid.activePoolCount}/${state.acid.totalPoolCount}`,
      attributes: { role: 'status', 'aria-label': `${state.acid.activePoolCount} flaques d’acide actives sur ${state.acid.totalPoolCount}` }
    });
    const children = [pressure, oxygen, power, acid];
    if (state.selfDestruct.armed || state.selfDestruct.expired) {
      children.push(element(this.document, 'span', {
        className: 'alien-survival-metric-v70 danger',
        text: state.selfDestruct.expired ? 'AUTO-DEST · IMPACT' : `AUTO-DEST · ${Math.ceil(state.selfDestruct.remaining)} s`,
        attributes: { role: 'timer', 'aria-label': state.selfDestruct.expired ? 'Auto-destruction arrivée à terme' : `Auto-destruction dans ${Math.ceil(state.selfDestruct.remaining)} secondes` }
      }));
    }
    metrics.replaceChildren(...children);
  }

  updateRovingTabIndex(preferred = null) {
    const buttons = [...this.root.querySelectorAll('[data-alien-survival-action]')];
    if (!buttons.length) return;
    const active = preferred && buttons.includes(preferred) ? preferred : buttons.find((button) => button.getAttribute('tabindex') === '0');
    const fallback = buttons.find((button) => button.getAttribute('aria-disabled') !== 'true') || buttons[0];
    const selected = active || fallback;
    for (const button of buttons) button.setAttribute('tabindex', button === selected ? '0' : '-1');
  }

  announce(message) {
    this.lastStatus = asText(message);
    const live = this.root.querySelector('[data-alien-survival-live]');
    if (live) live.textContent = this.lastStatus;
  }

  handleClick(event) {
    const collapse = event.target?.closest?.('[data-alien-survival-collapse]');
    if (collapse && this.root.contains(collapse)) {
      this.collapsed = !this.collapsed;
      this.refresh();
      return true;
    }
    const button = event.target?.closest?.('[data-alien-survival-action]');
    if (!button || !this.root.contains(button)) return false;
    return this.activate(button.dataset.alienSurvivalAction);
  }

  handleKeydown(event) {
    const button = event.target?.closest?.('[data-alien-survival-action]');
    if (!button || !this.root.contains(button)) return false;
    const directions = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);
    if (!directions.has(event.key)) return false;
    event.preventDefault?.();
    event.stopPropagation?.();
    const buttons = [...this.root.querySelectorAll('[data-alien-survival-action]')];
    const current = Math.max(0, buttons.indexOf(button));
    const backwards = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const index = event.key === 'Home' ? 0
      : event.key === 'End' ? buttons.length - 1
        : (current + (backwards ? -1 : 1) + buttons.length) % buttons.length;
    const next = buttons[index];
    this.updateRovingTabIndex(next);
    next?.focus?.({ preventScroll: true });
    return true;
  }

  activate(actionId) {
    const state = this.snapshot();
    const action = ALIEN_SURVIVAL_ACTIONS_V70.find((entry) => entry.id === actionId);
    const actionState = getAlienSurvivalActionStateV70(actionId, state);
    if (!action || !actionState.enabled) {
      this.announce(actionState.reason || 'Commande indisponible.');
      return false;
    }
    let invocation = { called: false, result: null };
    if (action.group === 'power') invocation = callEngine(this.engine, 'setAlienSurvivalPowerRouteV70', action.circuitId, !state.power.routes[action.circuitId]);
    else if (action.id === 'weld-door') invocation = callEngine(this.engine, 'beginAlienSurvivalWeldV70', actionState.targetId);
    else if (action.id === 'cancel-action') invocation = callEngine(this.engine, 'cancelAlienSurvivalActionV70');
    else if (action.id === 'cctv-open') invocation = callEngine(this.engine, 'openAlienSurvivalCctvV70');
    else if (action.id === 'cctv-previous') invocation = callEngine(this.engine, 'cycleAlienSurvivalCctvV70', -1);
    else if (action.id === 'cctv-next') invocation = callEngine(this.engine, 'cycleAlienSurvivalCctvV70', 1);
    else if (action.id === 'cctv-close') invocation = callEngine(this.engine, 'closeAlienSurvivalCctvV70');
    else if (action.id === 'self-destruct-authorize') invocation = callEngine(this.engine, 'authorizeAlienSurvivalSelfDestructV70', actionState.targetId);
    else if (action.id === 'self-destruct-arm') invocation = callEngine(this.engine, 'armAlienSurvivalSelfDestructV70');
    if (!invocation.called) {
      this.announce('Commande moteur V70 indisponible.');
      return false;
    }
    if (invocation.result === false || invocation.result?.ok === false) {
      this.announce(invocation.result?.reason || invocation.result?.message || 'Action refusée par le système physique.');
      this.refresh();
      return false;
    }
    this.announce(invocation.result?.message || `${actionState.label} · commande transmise.`);
    this.refresh();
    return true;
  }
}
