import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALIEN_SURVIVAL_ACTIONS_V70,
  ALIEN_SURVIVAL_DOCK_REFRESH_HZ_V70,
  ALIEN_SURVIVAL_POWER_CIRCUITS_V70,
  AlienSurvivalDockV70,
  getAlienSurvivalActionStateV70,
  normalizeAlienSurvivalUiStateV70
} from '../src/alien-survival-ui-v70.js';

const datasetName = (attribute) => attribute.replace(/^data-/u, '').replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const enabled = force === undefined ? !this.values.has(value) : Boolean(force);
    if (enabled) this.values.add(value);
    else this.values.delete(value);
    return enabled;
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = String(tagName).toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this._text = '';
    this.hidden = false;
  }
  get className() { return [...this.classList.values].join(' '); }
  set className(value) {
    this.classList = new FakeClassList();
    String(value || '').split(/\s+/u).filter(Boolean).forEach((entry) => this.classList.add(entry));
  }
  get textContent() { return this._text + this.children.map((child) => child.textContent).join(''); }
  set textContent(value) { this._text = String(value ?? ''); this.children = []; }
  append(...nodes) {
    for (const node of nodes) {
      node.parentNode = this;
      this.children.push(node);
    }
  }
  replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[datasetName(name)] = String(value);
  }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  removeAttribute(name) {
    this.attributes.delete(name);
    if (name.startsWith('data-')) delete this.dataset[datasetName(name)];
  }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  contains(candidate) {
    for (let current = candidate; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  matches(selector) {
    const data = selector.match(/^\[data-([a-z0-9-]+)(?:="([^"]*)")?\]$/u);
    if (data) {
      const key = datasetName(`data-${data[1]}`);
      return Object.hasOwn(this.dataset, key) && (data[2] === undefined || this.dataset[key] === data[2]);
    }
    if (selector.startsWith('#')) return this.attributes.get('id') === selector.slice(1);
    return this.tagName === selector.toUpperCase();
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches?.(selector)) return current;
    return null;
  }
  querySelectorAll(selector) {
    const matches = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  focus() { this.ownerDocument.activeElement = this; }
}

class FakeDocument {
  constructor() { this.activeElement = null; }
  createElement(tagName) { return new FakeElement(tagName, this); }
}

function stateFixture() {
  return {
    active: true,
    phase: 'restore-life-support',
    room: { id: 'airlock-03', pressure: 76.45, oxygen: 31, breached: true },
    rooms: [{ id: 'airlock-03' }, { id: 'security' }],
    power: {
      capacity: 2,
      routes: { 'life-support': true, security: false, cctv: false },
      rerouteCount: 2,
      availableAtConsole: false,
      blockedReason: 'Console électrique hors de portée.'
    },
    doors: [{ id: 'bulkhead-7', label: 'SAS 7', welded: false, weldIntegrity: 22, canWeld: true, nearby: false }],
    cctv: {
      active: false,
      selectedFeedId: '',
      visitedFeedIds: ['feed-a'],
      requiredFeedIds: ['feed-a', 'feed-b'],
      scanComplete: false,
      availableAtConsole: false,
      blockedReason: 'Terminal CCTV hors de portée.'
    },
    selfDestruct: {
      engineeringAuthorized: false,
      commandAuthorized: false,
      armed: false,
      remaining: 0,
      expired: false,
      canAuthorize: false,
      canArm: false,
      stationId: 'engineering-auth',
      blockedReason: 'Rejoignez un poste d’autorisation.'
    },
    acid: { activePoolCount: 3, totalPoolCount: 5 },
    worldAction: {
      id: 'weld-bulkhead-7', type: 'weld-door', targetId: 'bulkhead-7', label: 'Souder SAS 7',
      progress: 0.22, durationSeconds: 3, canExecute: false, nearby: false, blockedReason: 'Porte hors de portée.'
    },
    interactionPrompt: 'E · Interagir avec les équipements proches.'
  };
}

function mount() {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  const state = stateFixture();
  const calls = { power: [], weld: [], cancel: 0, open: 0, cycle: [], close: 0, authorize: [], arm: 0 };
  const engine = {
    getAlienSurvivalUiStateV70: () => state,
    setAlienSurvivalPowerRouteV70: (circuitId, enabled) => {
      calls.power.push([circuitId, enabled]);
      state.power.routes[circuitId] = enabled;
      return { ok: true, message: `${circuitId} routé.` };
    },
    beginAlienSurvivalWeldV70: (doorId) => { calls.weld.push(doorId); return { ok: true }; },
    cancelAlienSurvivalActionV70: () => { calls.cancel += 1; state.worldAction = null; return true; },
    openAlienSurvivalCctvV70: () => { calls.open += 1; state.cctv.active = true; state.cctv.selectedFeedId = 'feed-a'; return true; },
    cycleAlienSurvivalCctvV70: (direction) => { calls.cycle.push(direction); state.cctv.selectedFeedId = direction < 0 ? 'feed-a' : 'feed-b'; return true; },
    closeAlienSurvivalCctvV70: () => { calls.close += 1; state.cctv.active = false; return true; },
    authorizeAlienSurvivalSelfDestructV70: (stationId) => { calls.authorize.push(stationId); state.selfDestruct.engineeringAuthorized = true; return true; },
    armAlienSurvivalSelfDestructV70: () => { calls.arm += 1; state.selfDestruct.armed = true; state.selfDestruct.remaining = 90; return true; }
  };
  const ui = new AlienSurvivalDockV70({ root, engine, documentRef });
  return { documentRef, root, state, calls, engine, ui };
}

function keyEvent(target, key) {
  const counters = { prevented: 0, stopped: 0 };
  return {
    event: {
      target,
      key,
      preventDefault: () => { counters.prevented += 1; },
      stopPropagation: () => { counters.stopped += 1; }
    },
    counters
  };
}

test('normalise les métriques V70, les routes exactes et la proximité décidée par le runtime', () => {
  const state = normalizeAlienSurvivalUiStateV70({
    ...stateFixture(),
    power: { capacity: 2, routes: ['life-support', { id: 'cctv', enabled: true }], availableAtConsole: true },
    worldAction: { type: 'weld-door', targetId: 'bulkhead-7', progress: 0.4, canExecute: true, nearby: true },
    doors: [{ id: 'bulkhead-7', canWeld: true }]
  });
  assert.equal(state.room.pressure, 76.5);
  assert.equal(state.power.capacity, 2);
  assert.equal(state.power.allocatedCircuits, 2);
  assert.deepEqual(state.power.routes, { 'life-support': true, security: false, cctv: true });
  assert.equal(state.worldAction.progress, 40);
  assert.equal(state.doors[0].nearby, true);
  assert.equal(getAlienSurvivalActionStateV70('weld-door', state).enabled, true);
  assert.equal(getAlienSurvivalActionStateV70('self-destruct-arm', state).enabled, false);
});

test('le dock expose une région repliable, des métriques et des commandes natives accessibles', () => {
  const { root, ui } = mount();
  assert.equal(root.hidden, false);
  assert.equal(root.getAttribute('role'), 'region');
  assert.equal(root.getAttribute('aria-hidden'), 'false');
  assert.equal(root.querySelectorAll('[data-alien-survival-action]').length, ALIEN_SURVIVAL_ACTIONS_V70.length);
  assert.equal(root.querySelectorAll('div').filter((node) => node.getAttribute('role') === 'group').length >= 4, true);
  assert.match(root.textContent, /PRESSION 76\.5 kPa/u);
  assert.match(root.textContent, /O₂ 31%/u);
  assert.match(root.textContent, /ÉNERGIE 1\/2/u);
  assert.match(root.textContent, /ACIDE 3\/5/u);
  const powerMeter = root.querySelectorAll('span').find((node) => node.getAttribute('aria-label') === 'Circuits électriques alimentés');
  assert.equal(powerMeter.getAttribute('aria-valuenow'), '1');
  assert.equal(powerMeter.getAttribute('aria-valuemax'), '2');
  assert.equal(root.querySelector('[data-alien-survival-metrics]').getAttribute('aria-label'), 'État du secteur');
  const collapse = root.querySelector('[data-alien-survival-collapse]');
  assert.equal(collapse.getAttribute('aria-expanded'), 'true');
  ui.handleClick({ target: collapse });
  assert.equal(collapse.getAttribute('aria-expanded'), 'false');
  assert.equal(root.querySelector('#alien-survival-body-v70').hidden, true);
});

test('les actions distantes restent bloquées et le dock respecte les booléens de proximité runtime', () => {
  const { root, state, calls, ui } = mount();
  const power = root.querySelector('[data-alien-survival-action="power-security"]');
  const weld = root.querySelector('[data-alien-survival-action="weld-door"]');
  assert.equal(power.getAttribute('aria-disabled'), 'true');
  assert.equal(weld.getAttribute('aria-disabled'), 'true');
  assert.equal(ui.handleClick({ target: power }), false);
  assert.equal(ui.handleClick({ target: weld }), false);
  assert.deepEqual(calls.power, []);
  assert.deepEqual(calls.weld, []);
  assert.match(root.querySelector('[data-alien-survival-live]').textContent, /hors de portée/u);

  state.power.availableAtConsole = true;
  state.doors[0].nearby = true;
  state.worldAction.nearby = true;
  state.worldAction.canExecute = true;
  ui.refresh();
  assert.equal(power.getAttribute('aria-disabled'), 'false');
  assert.equal(weld.getAttribute('aria-disabled'), 'false');
  assert.equal(ui.handleClick({ target: power }), true);
  assert.equal(ui.handleClick({ target: weld }), true);
  assert.deepEqual(calls.power, [['security', true]]);
  assert.deepEqual(calls.weld, ['bulkhead-7']);
});

test('CCTV et auto-destruction appellent uniquement les méthodes V70 autorisées', () => {
  const { root, state, calls, ui } = mount();
  state.cctv.availableAtConsole = true;
  state.selfDestruct.canAuthorize = true;
  ui.refresh();
  assert.equal(ui.activate('cctv-open'), true);
  assert.equal(ui.activate('cctv-next'), true);
  assert.equal(ui.activate('cctv-previous'), true);
  assert.equal(ui.activate('cctv-close'), true);
  assert.equal(ui.activate('self-destruct-authorize'), true);
  assert.deepEqual(calls.authorize, ['engineering-auth']);

  state.selfDestruct.engineeringAuthorized = true;
  state.selfDestruct.commandAuthorized = true;
  state.selfDestruct.canArm = true;
  ui.refresh();
  assert.equal(ui.activate('self-destruct-arm'), true);
  assert.equal(calls.arm, 1);
  assert.equal(state.selfDestruct.armed, true);
  assert.match(root.textContent, /AUTO-DEST · 90 s/u);
  assert.deepEqual(calls.cycle, [1, -1]);
  assert.equal(calls.open, 1);
  assert.equal(calls.close, 1);
});

test('les flèches, Home et End assurent une navigation clavier circulaire sans action parasite', () => {
  const { documentRef, root, calls, ui } = mount();
  const buttons = root.querySelectorAll('[data-alien-survival-action]');
  const first = buttons[0];
  first.focus();
  const right = keyEvent(first, 'ArrowRight');
  assert.equal(ui.handleKeydown(right.event), true);
  assert.equal(documentRef.activeElement, buttons[1]);
  assert.equal(buttons[1].getAttribute('tabindex'), '0');
  assert.deepEqual(right.counters, { prevented: 1, stopped: 1 });
  const end = keyEvent(buttons[1], 'End');
  ui.handleKeydown(end.event);
  assert.equal(documentRef.activeElement, buttons.at(-1));
  const ignored = keyEvent(buttons.at(-1), 'Enter');
  assert.equal(ui.handleKeydown(ignored.event), false, 'Entrée reste gérée nativement par le bouton');
  assert.deepEqual(calls.power, []);
});

test('pression et acide restent des alertes physiques, puis destroy retire les écouteurs', () => {
  assert.equal(ALIEN_SURVIVAL_POWER_CIRCUITS_V70.map((entry) => entry.id).join(','), 'life-support,security,cctv');
  assert.equal(ALIEN_SURVIVAL_ACTIONS_V70.some((entry) => /pressure|acid/u.test(entry.id)), false);
  const { root, state, ui } = mount();
  state.active = false;
  ui.refresh();
  assert.equal(root.hidden, true);
  assert.equal(root.getAttribute('aria-hidden'), 'true');
  ui.destroy();
  assert.equal(root.listeners.has('click'), false);
  assert.equal(root.listeners.has('keydown'), false);
  assert.equal(root.children.length, 0);
});

test('le rafraîchissement 8 Hz suit salle, pression et proximité sans événement runtime', () => {
  const { root, state, ui } = mount();
  let intervalCallback = null;
  let intervalDelay = 0;
  const clearedTimers = [];
  const started = ui.startAutoRefresh({
    setIntervalRef: (callback, delay) => {
      intervalCallback = callback;
      intervalDelay = delay;
      return 'dock-refresh-v70';
    },
    clearIntervalRef: (timer) => clearedTimers.push(timer)
  });

  assert.equal(started, true);
  assert.equal(ALIEN_SURVIVAL_DOCK_REFRESH_HZ_V70, 8);
  assert.equal(intervalDelay, 125);
  assert.equal(typeof intervalCallback, 'function');
  assert.equal(root.querySelector('[data-alien-survival-action="power-security"]').getAttribute('aria-disabled'), 'true');
  assert.equal(root.querySelector('[data-alien-survival-action="weld-door"]').getAttribute('aria-disabled'), 'true');

  state.room = { id: 'ship-command', pressure: 101.25, oxygen: 88, breached: false };
  state.power.availableAtConsole = true;
  state.doors[0].nearby = true;
  state.worldAction.nearby = true;
  state.worldAction.canExecute = true;
  state.interactionPrompt = 'E · Poste de commandement à portée.';

  intervalCallback();

  const pressure = root.querySelectorAll('span').find((node) => node.getAttribute('aria-label') === 'Pression ship-command');
  assert.ok(pressure, 'le changement de salle doit remplacer le compteur de pression');
  assert.equal(pressure.getAttribute('aria-valuenow'), '101.3');
  assert.equal(root.querySelector('[data-alien-survival-action="power-security"]').getAttribute('aria-disabled'), 'false');
  assert.equal(root.querySelector('[data-alien-survival-action="weld-door"]').getAttribute('aria-disabled'), 'false');
  assert.equal(root.querySelector('[data-alien-survival-prompt]').textContent, 'E · Poste de commandement à portée.');

  ui.destroy();
  assert.deepEqual(clearedTimers, ['dock-refresh-v70']);
});
