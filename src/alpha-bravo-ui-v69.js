const TEAM_IDS_V69 = Object.freeze(['alpha', 'bravo']);
const TEAM_SELECTIONS_V69 = Object.freeze([...TEAM_IDS_V69, 'all']);

export const ALPHA_BRAVO_ORDERS_V69 = Object.freeze([
  Object.freeze({ id: 'move', label: 'DÉPLACER / PING', shortLabel: 'DÉPL./PING', target: true }),
  Object.freeze({ id: 'hold', label: 'TENIR', shortLabel: 'TENIR', target: false }),
  Object.freeze({ id: 'focus', label: 'FOCUS', shortLabel: 'FOCUS', target: false }),
  Object.freeze({ id: 'rally', label: 'RALLIER', shortLabel: 'RALLIER', target: false })
]);

const asArray = (value) => Array.isArray(value) ? value : [];
const asText = (value, fallback = '') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const percent = (value, fallback = 0) => Math.round(clamp(value ?? fallback, 0, 100));

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

function normalizeMember(raw, index) {
  if (typeof raw === 'string') return Object.freeze({ id: raw, name: raw.toUpperCase(), downed: false, injured: false });
  const member = raw && typeof raw === 'object' ? raw : {};
  const health = member.health === undefined || member.health === null ? Number.NaN : Number(member.health);
  const injuries = asArray(member.injuries);
  const downed = Boolean(member.downed || member.incapacitated || member.alive === false || (Number.isFinite(health) && health <= 0));
  return Object.freeze({
    id: asText(member.id || member.crewId, `operator-${index + 1}`),
    name: asText(member.callsign || member.name || member.label, `OP ${index + 1}`),
    downed,
    injured: Boolean(member.injured || member.wounded || injuries.length || (Number.isFinite(health) && health < 70))
  });
}

function normalizeTask(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return Object.freeze({ id: raw, label: raw, progress: 0, complete: false });
  const task = raw && typeof raw === 'object' ? raw : {};
  const rawProgress = task.progressPercent ?? task.progress;
  const taskProgress = task.progressPercent === undefined && Number(rawProgress) >= 0 && Number(rawProgress) <= 1
    ? Number(rawProgress) * 100
    : rawProgress;
  return Object.freeze({
    id: asText(task.id || task.taskId),
    label: asText(task.label || task.title || task.name, 'TÂCHE RÉSERVÉE'),
    progress: percent(taskProgress),
    complete: Boolean(task.complete || task.completed)
  });
}

function sourceTeam(rawState, id, index) {
  const source = rawState?.teams || rawState?.fireteams || rawState?.groups;
  if (Array.isArray(source)) return source.find((team) => asText(team?.id || team?.teamId).toLowerCase() === id) || source[index] || {};
  if (source && typeof source === 'object') return source[id] || source[id.toUpperCase()] || {};
  return {};
}

function normalizeTeam(rawState, id, index) {
  const raw = sourceTeam(rawState, id, index);
  const reservationRef = raw.reservedTask || raw.reservation || raw.task || null;
  const taskId = typeof reservationRef === 'string' ? reservationRef : asText(reservationRef?.id || reservationRef?.taskId);
  const taskState = taskId ? asArray(rawState?.tasks).find((task) => asText(task?.id || task?.taskId) === taskId) : null;
  const reservation = taskState ? { ...taskState, ...(typeof reservationRef === 'object' ? reservationRef : {}) } : reservationRef;
  const order = asText(raw.order?.id || raw.orderId || raw.currentOrder || raw.order, 'follow').toLowerCase();
  return Object.freeze({
    id,
    label: id === 'alpha' ? 'ALPHA' : 'BRAVO',
    members: Object.freeze(asArray(raw.members || raw.operators || raw.crew || raw.memberIds).map(normalizeMember)),
    order,
    cohesion: percent(raw.cohesion ?? raw.cohesionPercent, 100),
    stress: percent(raw.stress ?? raw.stressPercent),
    reservedTask: normalizeTask(reservation)
  });
}

function aggregateAlphaBravoTeamsV69(teams) {
  const first = teams[0] || {};
  const sameOrder = teams.length > 0 && teams.every((team) => team.order === first.order);
  const reservations = teams.map((team) => team.reservedTask);
  const sameReservation = reservations.length > 0
    && reservations.every((task) => task?.id && task.id === reservations[0]?.id);
  const average = (field, fallback) => teams.length
    ? Math.round(teams.reduce((total, team) => total + (Number(team[field]) || 0), 0) / teams.length)
    : fallback;
  return Object.freeze({
    id: 'all',
    label: 'TOUS',
    members: Object.freeze(teams.flatMap((team) => team.members)),
    order: sameOrder ? first.order : 'mixed',
    cohesion: average('cohesion', 100),
    stress: average('stress', 0),
    reservedTask: sameReservation ? reservations[0] : null
  });
}

export function normalizeAlphaBravoUiStateV69(rawState = {}) {
  const state = rawState && typeof rawState === 'object' ? rawState : {};
  const selected = asText(state.selectedTeam || state.selectedFireteam || state.activeTeam, 'alpha').toLowerCase();
  const target = state.ping || state.target || state.moveTarget || null;
  const active = Boolean(state.active ?? state.enabled ?? state.isAlphaBravoMission ?? state.doctrineActive);
  return Object.freeze({
    active,
    selectedTeam: TEAM_SELECTIONS_V69.includes(selected) ? selected : 'alpha',
    targeting: Boolean(state.targeting || state.awaitingPing || state.placingPing || state.targetMode),
    teams: Object.freeze(TEAM_IDS_V69.map((id, index) => normalizeTeam(state, id, index))),
    target: target && typeof target === 'object' ? Object.freeze({
      x: Number(target.x) || 0,
      y: Number(target.y) || 0,
      teamId: TEAM_SELECTIONS_V69.includes(asText(target.teamId || target.team).toLowerCase()) ? asText(target.teamId || target.team).toLowerCase() : ''
    }) : null,
    status: asText(state.status || state.prompt || state.message || state.lastMessage, active ? 'Doctrine Alpha / Bravo opérationnelle.' : '')
  });
}

export function projectAlphaBravoTargetV69(event, canvas) {
  const bounds = canvas?.getBoundingClientRect?.();
  if (!bounds || !(bounds.width > 0) || !(bounds.height > 0)) return null;
  const normalizedX = clamp((Number(event?.clientX) - bounds.left) / bounds.width, 0, 1);
  const normalizedY = clamp((Number(event?.clientY) - bounds.top) / bounds.height, 0, 1);
  return Object.freeze({
    x: normalizedX * (Number(canvas.width) || bounds.width),
    y: normalizedY * (Number(canvas.height) || bounds.height),
    normalizedX,
    normalizedY,
    clientX: bounds.left + normalizedX * bounds.width,
    clientY: bounds.top + normalizedY * bounds.height
  });
}

function engineState(engine) {
  let state = null;
  for (const method of ['getAlphaBravoUiStateV69', 'getAlphaBravoStateV69', 'getFireteamUiStateV69']) {
    if (typeof engine?.[method] === 'function') {
      state = engine[method]();
      break;
    }
  }
  state ||= engine?.alphaBravoStateV69 || engine?.alphaBravoState || {};
  if (state?.active === undefined && typeof engine?.isAlphaBravoMissionV69 === 'function') {
    return { ...state, active: engine.isAlphaBravoMissionV69() };
  }
  return state;
}

function callEngine(engine, methods, ...parameters) {
  for (const method of methods) if (typeof engine?.[method] === 'function') return engine[method](...parameters);
  return null;
}

export class AlphaBravoCommandDockV69 {
  constructor({ root, targetLayer, canvas, engine, documentRef = root?.ownerDocument || globalThis.document } = {}) {
    if (!root || !targetLayer || !canvas || !engine || !documentRef) {
      throw new TypeError('AlphaBravoCommandDockV69 requiert le dock, la couche de ciblage, le canvas et le moteur.');
    }
    this.root = root;
    this.targetLayer = targetLayer;
    this.canvas = canvas;
    this.engine = engine;
    this.document = documentRef;
    this.collapsed = false;
    this.localTargeting = false;
    this.keyboardTarget = { normalizedX: 0.5, normalizedY: 0.5 };
    this.previousFocus = null;
    this.lastStatus = '';
    this.suppressNextTargetClick = false;
    this.boundClick = (event) => this.handleClick(event);
    this.boundPointerDown = (event) => this.handleTargetPointerDown(event);
    this.boundPointerMove = (event) => this.handleTargetPointerMove(event);
    this.boundTargetClick = (event) => this.handleTargetClick(event);
    this.boundTargetContext = (event) => this.blockTargetEvent(event);
    this.boundTargetKeydown = (event) => this.handleTargetKeydown(event);
    this.boundCommandKeydown = (event) => this.handleCommandKeydown(event);
    this.root.addEventListener('click', this.boundClick);
    this.targetLayer.addEventListener('pointerdown', this.boundPointerDown);
    this.targetLayer.addEventListener('pointermove', this.boundPointerMove);
    this.targetLayer.addEventListener('click', this.boundTargetClick);
    this.targetLayer.addEventListener('contextmenu', this.boundTargetContext);
    this.targetLayer.addEventListener('keydown', this.boundTargetKeydown);
    this.document.addEventListener?.('keydown', this.boundCommandKeydown);
    this.mount();
    this.refresh();
  }

  destroy() {
    this.root.removeEventListener('click', this.boundClick);
    this.targetLayer.removeEventListener('pointerdown', this.boundPointerDown);
    this.targetLayer.removeEventListener('pointermove', this.boundPointerMove);
    this.targetLayer.removeEventListener('click', this.boundTargetClick);
    this.targetLayer.removeEventListener('contextmenu', this.boundTargetContext);
    this.targetLayer.removeEventListener('keydown', this.boundTargetKeydown);
    this.document.removeEventListener?.('keydown', this.boundCommandKeydown);
    this.root.replaceChildren();
    this.finishTargeting({ restoreFocus: false });
  }

  mount() {
    const headingId = 'alpha-bravo-command-heading-v69';
    const bodyId = 'alpha-bravo-command-body-v69';
    const header = element(this.document, 'header', { className: 'alpha-bravo-header-v69' });
    const heading = element(this.document, 'div');
    heading.append(
      element(this.document, 'span', { className: 'alpha-bravo-kicker-v69', text: 'DOCTRINE FEU CROISÉ' }),
      element(this.document, 'strong', { text: 'ALPHA / BRAVO', attributes: { id: headingId } })
    );
    const collapse = element(this.document, 'button', {
      className: 'alpha-bravo-collapse-v69',
      text: '−',
      attributes: { type: 'button', 'data-alpha-bravo-action': 'collapse', 'aria-label': 'Replier les commandes Alpha Bravo', 'aria-expanded': 'true', 'aria-controls': bodyId }
    });
    header.append(heading, collapse);

    const body = element(this.document, 'div', { className: 'alpha-bravo-body-v69', attributes: { id: bodyId } });
    const teams = element(this.document, 'div', { className: 'alpha-bravo-team-tabs-v69', attributes: { role: 'group', 'aria-label': 'Groupe tactique commandé' } });
    for (const id of TEAM_SELECTIONS_V69) {
      teams.append(element(this.document, 'button', {
        className: 'alpha-bravo-team-v69',
        text: id === 'all' ? 'TOUS' : id.toUpperCase(),
        attributes: { type: 'button', 'data-alpha-bravo-team': id, 'aria-pressed': 'false' }
      }));
    }
    const metrics = element(this.document, 'div', { className: 'alpha-bravo-metrics-v69', attributes: { 'data-alpha-bravo-metrics': '' } });
    const orders = element(this.document, 'div', { className: 'alpha-bravo-orders-v69', attributes: { role: 'group', 'aria-label': 'Ordres du groupe sélectionné' } });
    for (const order of ALPHA_BRAVO_ORDERS_V69) {
      orders.append(element(this.document, 'button', {
        className: `alpha-bravo-order-v69${order.target ? ' alpha-bravo-order-primary-v69' : ''}`,
        text: order.shortLabel,
        attributes: { type: 'button', 'data-alpha-bravo-order': order.id, 'aria-pressed': 'false', 'aria-label': order.label }
      }));
    }
    const task = element(this.document, 'p', { className: 'alpha-bravo-task-v69', attributes: { 'data-alpha-bravo-task': '' } });
    const live = element(this.document, 'p', { className: 'alpha-bravo-live-v69 sr-only', attributes: { 'data-alpha-bravo-live': '', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } });
    body.append(teams, metrics, orders, task, live);
    this.root.replaceChildren(header, body);
    this.root.setAttribute('aria-labelledby', headingId);
    this.root.setAttribute('data-alpha-bravo-dock', '');
    this.targetLayer.setAttribute('aria-label', 'Choisir une destination tactique sur le terrain. Échap annule.');
    this.targetLayer.setAttribute('aria-hidden', 'true');
    this.targetLayer.setAttribute('tabindex', '-1');
  }

  snapshot(rawState = engineState(this.engine)) {
    const state = normalizeAlphaBravoUiStateV69(rawState);
    if (this.localTargeting && !state.targeting) return Object.freeze({ ...state, targeting: true });
    return state;
  }

  refresh(rawState = engineState(this.engine)) {
    const state = this.snapshot(rawState);
    this.root.hidden = !state.active;
    this.root.setAttribute('aria-hidden', state.active ? 'false' : 'true');
    if (!state.active) {
      this.finishTargeting({ restoreFocus: false });
      return state;
    }
    const selected = state.selectedTeam === 'all'
      ? aggregateAlphaBravoTeamsV69(state.teams)
      : state.teams.find((team) => team.id === state.selectedTeam) || state.teams[0];
    for (const button of this.root.querySelectorAll('[data-alpha-bravo-team]')) {
      const active = button.dataset.alphaBravoTeam === state.selectedTeam;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.classList.toggle?.('active', active);
    }
    for (const button of this.root.querySelectorAll('[data-alpha-bravo-order]')) {
      const active = button.dataset.alphaBravoOrder === selected.order || (button.dataset.alphaBravoOrder === 'move' && state.targeting);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.classList.toggle?.('active', active);
    }
    const body = this.root.querySelector('#alpha-bravo-command-body-v69');
    if (body) body.hidden = this.collapsed;
    const collapse = this.root.querySelector('[data-alpha-bravo-action="collapse"]');
    if (collapse) {
      collapse.textContent = this.collapsed ? '+' : '−';
      collapse.setAttribute('aria-expanded', this.collapsed ? 'false' : 'true');
      collapse.setAttribute('aria-label', this.collapsed ? 'Déplier les commandes Alpha Bravo' : 'Replier les commandes Alpha Bravo');
    }
    const metrics = this.root.querySelector('[data-alpha-bravo-metrics]');
    if (metrics) this.renderMetrics(metrics, selected);
    const task = this.root.querySelector('[data-alpha-bravo-task]');
    if (task) this.renderTask(task, selected);
    const nextStatus = this.lastStatus || state.status;
    const live = this.root.querySelector('[data-alpha-bravo-live]');
    if (live && nextStatus && live.textContent !== nextStatus) live.textContent = nextStatus;
    if (state.targeting && !this.localTargeting) this.startTargeting({ notifyEngine: false });
    if (!state.targeting && this.localTargeting) this.finishTargeting({ restoreFocus: false });
    return state;
  }

  renderMetrics(root, team) {
    const memberNames = team.members.length ? team.members.map((member) => `${member.name}${member.downed ? ' HS' : member.injured ? ' blessé' : ''}`).join(' · ') : 'BINÔME EN APPROCHE';
    const cohesion = element(this.document, 'span', {
      className: 'alpha-bravo-metric-v69',
      text: `COHÉSION ${team.cohesion}%`,
      attributes: { role: 'meter', 'aria-label': `Cohésion ${team.label}`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': team.cohesion }
    });
    cohesion.style.setProperty?.('--metric-value', `${team.cohesion}%`);
    const stress = element(this.document, 'span', {
      className: `alpha-bravo-metric-v69${team.stress >= 70 ? ' danger' : ''}`,
      text: `STRESS ${team.stress}%`,
      attributes: { role: 'meter', 'aria-label': `Stress ${team.label}`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': team.stress }
    });
    stress.style.setProperty?.('--metric-value', `${team.stress}%`);
    root.replaceChildren(element(this.document, 'small', { text: memberNames }), cohesion, stress);
  }

  renderTask(root, team) {
    const task = team.reservedTask;
    root.classList.toggle?.('complete', Boolean(task?.complete));
    if (!task) {
      root.textContent = 'AUCUNE TÂCHE RÉSERVÉE';
      root.removeAttribute('role');
      root.removeAttribute('aria-valuenow');
      return;
    }
    root.textContent = `${task.complete ? 'VALIDÉ' : 'RÉSERVÉ'} · ${task.label} · ${task.progress}%`;
    root.setAttribute('role', 'progressbar');
    root.setAttribute('aria-label', `${team.label}, ${task.label}`);
    root.setAttribute('aria-valuemin', '0');
    root.setAttribute('aria-valuemax', '100');
    root.setAttribute('aria-valuenow', task.progress);
  }

  handleClick(event) {
    const collapse = event.target?.closest?.('[data-alpha-bravo-action="collapse"]');
    if (collapse && this.root.contains(collapse)) {
      this.collapsed = !this.collapsed;
      this.refresh();
      return;
    }
    const teamButton = event.target?.closest?.('[data-alpha-bravo-team]');
    if (teamButton && this.root.contains(teamButton)) {
      const teamId = teamButton.dataset.alphaBravoTeam;
      callEngine(this.engine, ['selectAlphaBravoFireteamV69', 'selectAlphaBravoTeamV69'], teamId);
      this.lastStatus = `Groupe ${teamId.toUpperCase()} sélectionné.`;
      this.refresh();
      return;
    }
    const orderButton = event.target?.closest?.('[data-alpha-bravo-order]');
    if (!orderButton || !this.root.contains(orderButton)) return;
    const order = orderButton.dataset.alphaBravoOrder;
    if (order === 'move') {
      this.startTargeting();
      return;
    }
    callEngine(this.engine, ['issueAlphaBravoOrderV69', 'setAlphaBravoOrderV69'], order);
    this.lastStatus = `${orderButton.getAttribute('aria-label')} transmis.`;
    this.refresh();
  }

  commandHotkeysAvailable(event) {
    if (event?.defaultPrevented || event?.repeat || event?.altKey || event?.ctrlKey || event?.metaKey || this.engine?.paused) return false;
    const state = this.snapshot();
    if (!state.active || state.targeting || this.localTargeting) return false;
    const target = event?.target || this.document.activeElement;
    const tagName = asText(target?.tagName).toLowerCase();
    return !['input', 'textarea', 'select'].includes(tagName)
      && !target?.isContentEditable
      && target?.getAttribute?.('role') !== 'textbox';
  }

  handleCommandKeydown(event) {
    if (!this.commandHotkeysAvailable(event)) return false;
    const code = asText(event.code || event.key);
    const teamId = { Digit1: 'alpha', Numpad1: 'alpha', Digit2: 'bravo', Numpad2: 'bravo', Digit3: 'all', Numpad3: 'all' }[code];
    const order = { KeyB: 'hold', KeyN: 'focus', KeyM: 'rally' }[code];
    if (!teamId && !order && code !== 'KeyC') return false;
    event.preventDefault?.();
    event.stopPropagation?.();
    if (teamId) {
      callEngine(this.engine, ['selectAlphaBravoFireteamV69', 'selectAlphaBravoTeamV69'], teamId);
      this.lastStatus = `Groupe ${teamId === 'all' ? 'TOUS' : teamId.toUpperCase()} sélectionné.`;
      this.refresh();
      return true;
    }
    if (code === 'KeyC') {
      this.startTargeting();
      return true;
    }
    callEngine(this.engine, ['issueAlphaBravoOrderV69', 'setAlphaBravoOrderV69'], order);
    const label = ALPHA_BRAVO_ORDERS_V69.find((entry) => entry.id === order)?.label || order.toUpperCase();
    this.lastStatus = `${label} transmis.`;
    this.refresh();
    return true;
  }

  startTargeting({ notifyEngine = true } = {}) {
    if (this.localTargeting) return false;
    this.localTargeting = true;
    this.previousFocus = this.document.activeElement || null;
    this.lastStatus = 'Ciblage actif : touchez le terrain, ou utilisez les flèches puis Entrée.';
    if (notifyEngine) callEngine(this.engine, ['beginAlphaBravoPingV69', 'beginAlphaBravoTargetingV69']);
    this.targetLayer.hidden = false;
    this.targetLayer.setAttribute('aria-hidden', 'false');
    this.targetLayer.setAttribute('tabindex', '0');
    this.updateTargetReticle(this.keyboardTarget.normalizedX, this.keyboardTarget.normalizedY);
    this.targetLayer.focus?.({ preventScroll: true });
    this.refresh();
    return true;
  }

  finishTargeting({ restoreFocus = true } = {}) {
    const wasTargeting = this.localTargeting || !this.targetLayer.hidden;
    this.localTargeting = false;
    this.targetLayer.hidden = true;
    this.targetLayer.setAttribute('aria-hidden', 'true');
    this.targetLayer.setAttribute('tabindex', '-1');
    if (restoreFocus && wasTargeting) (this.previousFocus || this.root.querySelector('[data-alpha-bravo-order="move"]') || this.canvas)?.focus?.({ preventScroll: true });
    this.previousFocus = null;
    return wasTargeting;
  }

  cancelTargeting() {
    callEngine(this.engine, ['cancelAlphaBravoPingV69', 'cancelAlphaBravoTargetingV69']);
    this.lastStatus = 'Ciblage annulé.';
    this.finishTargeting();
    this.refresh();
  }

  blockTargetEvent(event, { force = false } = {}) {
    if (this.targetLayer.hidden && !force) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
  }

  handleTargetClick(event) {
    if (this.targetLayer.hidden && !this.suppressNextTargetClick) return;
    this.blockTargetEvent(event, { force: true });
    this.suppressNextTargetClick = false;
  }

  handleTargetPointerMove(event) {
    if (this.targetLayer.hidden) return;
    this.blockTargetEvent(event);
    const target = projectAlphaBravoTargetV69(event, this.canvas);
    if (target) this.updateTargetReticle(target.normalizedX, target.normalizedY);
  }

  handleTargetPointerDown(event) {
    if (this.targetLayer.hidden) return;
    this.blockTargetEvent(event);
    this.suppressNextTargetClick = true;
    if (Number(event.button ?? 0) !== 0) {
      this.cancelTargeting();
      return;
    }
    this.targetLayer.setPointerCapture?.(event.pointerId);
    const target = projectAlphaBravoTargetV69(event, this.canvas);
    if (target) this.placeTarget(target);
  }

  handleTargetKeydown(event) {
    if (this.targetLayer.hidden) return;
    if (event.key === 'Escape' || event.code === 'Escape') {
      this.blockTargetEvent(event);
      this.cancelTargeting();
      return;
    }
    const directions = { ArrowLeft: [-0.03, 0], ArrowRight: [0.03, 0], ArrowUp: [0, -0.04], ArrowDown: [0, 0.04] };
    const direction = directions[event.key];
    if (direction) {
      this.blockTargetEvent(event);
      this.keyboardTarget.normalizedX = clamp(this.keyboardTarget.normalizedX + direction[0], 0, 1);
      this.keyboardTarget.normalizedY = clamp(this.keyboardTarget.normalizedY + direction[1], 0, 1);
      this.updateTargetReticle(this.keyboardTarget.normalizedX, this.keyboardTarget.normalizedY);
      return;
    }
    if (event.key === 'Enter' || event.code === 'Enter' || event.key === ' ') {
      this.blockTargetEvent(event);
      const bounds = this.canvas.getBoundingClientRect?.();
      if (!bounds) return;
      const target = projectAlphaBravoTargetV69({
        clientX: bounds.left + bounds.width * this.keyboardTarget.normalizedX,
        clientY: bounds.top + bounds.height * this.keyboardTarget.normalizedY
      }, this.canvas);
      if (target) this.placeTarget(target);
    }
  }

  updateTargetReticle(normalizedX, normalizedY) {
    this.keyboardTarget = { normalizedX, normalizedY };
    this.targetLayer.style.setProperty?.('--alpha-bravo-target-x', `${Math.round(normalizedX * 10000) / 100}%`);
    this.targetLayer.style.setProperty?.('--alpha-bravo-target-y', `${Math.round(normalizedY * 10000) / 100}%`);
  }

  placeTarget(target) {
    const state = this.snapshot();
    const payload = Object.freeze({ ...target, teamId: state.selectedTeam });
    callEngine(this.engine, ['placeAlphaBravoPingV69', 'placeAlphaBravoTargetV69'], payload);
    this.lastStatus = `Point de déplacement ${state.selectedTeam.toUpperCase()} transmis.`;
    this.finishTargeting();
    this.refresh();
    return payload;
  }
}
