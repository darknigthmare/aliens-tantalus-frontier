import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  ALPHA_BRAVO_ORDERS_V69,
  AlphaBravoCommandDockV69,
  normalizeAlphaBravoUiStateV69,
  projectAlphaBravoTargetV69
} from '../src/alpha-bravo-ui-v69.js';

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

class FakeStyle {
  constructor() { this.values = new Map(); }
  setProperty(name, value) { this.values.set(name, String(value)); }
  getPropertyValue(name) { return this.values.get(name) || ''; }
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
    this.style = new FakeStyle();
    this._text = '';
    this.hidden = false;
    this.disabled = false;
    this.width = 0;
    this.height = 0;
    this.pointerCapture = null;
  }
  get className() { return [...this.classList.values].join(' '); }
  set className(value) {
    this.classList = new FakeClassList();
    String(value || '').split(/\s+/u).filter(Boolean).forEach((item) => this.classList.add(item));
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
    if (name === 'hidden') this.hidden = true;
  }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  hasAttribute(name) { return this.attributes.has(name); }
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
    if (selector === '*') return true;
    const data = selector.match(/^\[data-([a-z0-9-]+)(?:="([^"]+)")?\]$/u);
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
    const result = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) result.push(child);
        visit(child);
      }
    };
    visit(this);
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  focus() { this.ownerDocument.activeElement = this; }
  getBoundingClientRect() { return this.bounds || { left: 0, top: 0, width: this.width, height: this.height }; }
  setPointerCapture(pointerId) { this.pointerCapture = pointerId; }
}

class FakeDocument {
  constructor() { this.activeElement = null; this.listeners = new Map(); }
  createElement(tagName) { return new FakeElement(tagName, this); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
}

function createState() {
  return {
    active: true,
    selectedTeam: 'alpha',
    awaitingPing: false,
    prompt: 'Deux groupes prêts.',
    teams: [
      {
        id: 'alpha', order: 'follow', cohesion: 87, stress: 24,
        members: [{ id: 'vega', callsign: 'VEGA' }, { id: 'hicks', callsign: 'HICKS', injured: true }],
        reservedTask: { id: 'power', label: 'RÉTABLIR LE RELAIS', progress: 35 }
      },
      {
        id: 'bravo', order: 'hold', cohesion: 71, stress: 63,
        members: [{ id: 'park', callsign: 'PARK' }, { id: 'ellis', callsign: 'ELLIS' }]
      }
    ]
  };
}

function mount() {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  const targetLayer = documentRef.createElement('div');
  targetLayer.hidden = true;
  const canvas = documentRef.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  canvas.bounds = { left: 100, top: 50, width: 640, height: 360 };
  const state = createState();
  const calls = { select: [], order: [], begin: 0, cancel: 0, place: [] };
  const engine = {
    paused: false,
    getAlphaBravoUiStateV69: () => state,
    selectAlphaBravoFireteamV69: (teamId) => { calls.select.push(teamId); state.selectedTeam = teamId; },
    issueAlphaBravoOrderV69: (order) => {
      calls.order.push(order);
      for (const team of state.teams) if (state.selectedTeam === 'all' || team.id === state.selectedTeam) team.order = order;
    },
    beginAlphaBravoPingV69: () => { calls.begin += 1; state.awaitingPing = true; },
    cancelAlphaBravoPingV69: () => { calls.cancel += 1; state.awaitingPing = false; },
    placeAlphaBravoPingV69: (target) => {
      calls.place.push(target);
      state.awaitingPing = false;
      for (const team of state.teams) if (state.selectedTeam === 'all' || team.id === state.selectedTeam) team.order = 'move';
    }
  };
  const ui = new AlphaBravoCommandDockV69({ root, targetLayer, canvas, engine, documentRef });
  return { documentRef, root, targetLayer, canvas, engine, state, calls, ui };
}

function eventGuard(properties = {}) {
  const counters = { prevented: 0, stopped: 0, immediate: 0 };
  return {
    event: {
      ...properties,
      preventDefault: () => { counters.prevented += 1; },
      stopPropagation: () => { counters.stopped += 1; },
      stopImmediatePropagation: () => { counters.immediate += 1; }
    },
    counters
  };
}

test('normalise les groupes, le ping en attente, les blessures et la tâche réservée', () => {
  const state = normalizeAlphaBravoUiStateV69({
    enabled: true,
    selectedFireteam: 'BRAVO',
    awaitingPing: true,
    fireteams: {
      alpha: { operators: [{ name: 'Vega', wounded: true }], cohesionPercent: 82, stressPercent: 31 },
      bravo: { crew: [{ callsign: 'Park', incapacitated: true }], currentOrder: 'focus', reservation: { taskId: 'airlock', title: 'SAS', progressPercent: 66 } }
    }
  });
  assert.equal(state.active, true);
  assert.equal(state.selectedTeam, 'bravo');
  assert.equal(state.targeting, true);
  assert.equal(state.teams[0].members[0].injured, true);
  assert.equal(state.teams[1].members[0].downed, true);
  assert.equal(state.teams[1].order, 'focus');
  assert.deepEqual(state.teams[1].reservedTask, { id: 'airlock', label: 'SAS', progress: 66, complete: false });
});

test('normalise les états runtime alive, health et injuries en HS ou blessé', () => {
  const state = normalizeAlphaBravoUiStateV69({
    active: true,
    selectedTeam: 'all',
    teams: [
      { id: 'alpha', members: [{ crewId: 'a', name: 'A', alive: false, health: 90, injuries: [] }] },
      { id: 'bravo', members: [{ crewId: 'b', name: 'B', alive: true, health: 55, injuries: ['impact-trauma'] }] }
    ]
  });
  assert.equal(state.selectedTeam, 'all');
  assert.equal(state.teams[0].members[0].downed, true);
  assert.equal(state.teams[1].members[0].downed, false);
  assert.equal(state.teams[1].members[0].injured, true);
});

test('projette le tap dans le repère natif 1280x720 et borne les coordonnées', () => {
  const canvas = { width: 1280, height: 720, getBoundingClientRect: () => ({ left: 100, top: 50, width: 640, height: 360 }) };
  assert.deepEqual(projectAlphaBravoTargetV69({ clientX: 420, clientY: 230 }, canvas), {
    x: 640, y: 360, normalizedX: 0.5, normalizedY: 0.5, clientX: 420, clientY: 230
  });
  assert.deepEqual(projectAlphaBravoTargetV69({ clientX: -500, clientY: 900 }, canvas), {
    x: 0, y: 720, normalizedX: 0, normalizedY: 1, clientX: 100, clientY: 410
  });
});

test('le dock conserve le Canvas et expose équipes, ordres, métriques et état live accessibles', () => {
  const { root } = mount();
  assert.equal(root.hidden, false);
  assert.equal(root.getAttribute('aria-hidden'), 'false');
  assert.equal(root.querySelectorAll('[data-alpha-bravo-team]').length, 3);
  assert.equal(root.querySelectorAll('[data-alpha-bravo-order]').length, ALPHA_BRAVO_ORDERS_V69.length);
  assert.equal(root.querySelector('[data-alpha-bravo-team="alpha"]').getAttribute('aria-pressed'), 'true');
  assert.equal(root.querySelector('[data-alpha-bravo-team="bravo"]').getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelector('[data-alpha-bravo-team="all"]').textContent, 'TOUS');
  assert.equal(root.querySelector('[data-alpha-bravo-action="collapse"]').getAttribute('aria-expanded'), 'true');
  assert.equal(root.querySelector('[data-alpha-bravo-live]').getAttribute('aria-live'), 'polite');
  assert.match(root.textContent, /COHÉSION 87%/u);
  assert.match(root.textContent, /STRESS 24%/u);
  assert.match(root.textContent, /RÉTABLIR LE RELAIS · 35%/u);
  assert.equal(root.querySelector('[data-alpha-bravo-task]').getAttribute('role'), 'progressbar');
});

test('la sélection A/B et les ordres directs appellent une seule fois le moteur', () => {
  const { root, calls, ui } = mount();
  const bravo = root.querySelector('[data-alpha-bravo-team="bravo"]');
  ui.handleClick({ target: bravo });
  assert.deepEqual(calls.select, ['bravo']);
  assert.equal(root.querySelector('[data-alpha-bravo-team="bravo"]').getAttribute('aria-pressed'), 'true');

  const focus = root.querySelector('[data-alpha-bravo-order="focus"]');
  ui.handleClick({ target: focus });
  assert.deepEqual(calls.order, ['focus']);
  assert.equal(root.querySelector('[data-alpha-bravo-order="focus"]').getAttribute('aria-pressed'), 'true');

  const collapse = root.querySelector('[data-alpha-bravo-action="collapse"]');
  ui.handleClick({ target: collapse });
  assert.equal(collapse.getAttribute('aria-expanded'), 'false');
  assert.equal(root.querySelector('#alpha-bravo-command-body-v69').hidden, true);
});

test('les raccourcis 1/2/3 et C/B/N/M commandent les groupes sans voler la saisie', () => {
  const { documentRef, root, targetLayer, engine, state, calls, ui } = mount();
  const keydown = documentRef.listeners.get('keydown');
  assert.equal(typeof keydown, 'function');

  const selectAll = eventGuard({ code: 'Digit3', target: root });
  keydown(selectAll.event);
  assert.deepEqual(calls.select, ['all']);
  assert.equal(root.querySelector('[data-alpha-bravo-team="all"]').getAttribute('aria-pressed'), 'true');
  assert.deepEqual(selectAll.counters, { prevented: 1, stopped: 1, immediate: 0 });

  const hold = eventGuard({ code: 'KeyB', target: root });
  keydown(hold.event);
  assert.deepEqual(calls.order, ['hold']);
  assert.equal(state.teams.every((team) => team.order === 'hold'), true);

  const input = documentRef.createElement('input');
  const ignored = eventGuard({ code: 'KeyN', target: input });
  keydown(ignored.event);
  assert.deepEqual(calls.order, ['hold']);
  assert.deepEqual(ignored.counters, { prevented: 0, stopped: 0, immediate: 0 });

  const ping = eventGuard({ code: 'KeyC', target: root });
  keydown(ping.event);
  assert.equal(calls.begin, 1);
  assert.equal(targetLayer.hidden, false);
  assert.deepEqual(ping.counters, { prevented: 1, stopped: 1, immediate: 0 });
  ui.cancelTargeting();

  engine.paused = true;
  const paused = eventGuard({ code: 'KeyM', target: root });
  keydown(paused.event);
  assert.deepEqual(calls.order, ['hold']);
  assert.deepEqual(paused.counters, { prevented: 0, stopped: 0, immediate: 0 });
  ui.destroy();
  assert.equal(documentRef.listeners.has('keydown'), false);
});

test('le ciblage tactile intercepte pointer et clic synthétique sans pause ni tir parasite', () => {
  const { root, targetLayer, engine, calls, ui } = mount();
  const move = root.querySelector('[data-alpha-bravo-order="move"]');
  move.focus();
  ui.handleClick({ target: move });
  assert.equal(calls.begin, 1);
  assert.equal(targetLayer.hidden, false);
  assert.equal(targetLayer.getAttribute('aria-hidden'), 'false');
  assert.equal(engine.paused, false);

  const pointer = eventGuard({ button: 0, pointerId: 7, clientX: 580, clientY: 320 });
  targetLayer.listeners.get('pointerdown')(pointer.event);
  assert.deepEqual(pointer.counters, { prevented: 1, stopped: 1, immediate: 1 });
  assert.equal(targetLayer.pointerCapture, 7);
  assert.equal(calls.place.length, 1);
  assert.equal(calls.place[0].teamId, 'alpha');
  assert.equal(calls.place[0].normalizedX, 0.75);
  assert.equal(calls.place[0].normalizedY, 0.75);
  assert.equal(targetLayer.hidden, true);
  assert.equal(engine.paused, false);

  const syntheticClick = eventGuard({ type: 'click' });
  targetLayer.listeners.get('click')(syntheticClick.event);
  assert.deepEqual(syntheticClick.counters, { prevented: 1, stopped: 1, immediate: 1 });
  assert.equal(calls.place.length, 1, 'le click suivant le pointerdown ne place pas un second ping');
});

test('Échap annule et le clavier déplace puis valide le réticule', () => {
  const { root, targetLayer, calls, ui } = mount();
  const move = root.querySelector('[data-alpha-bravo-order="move"]');
  ui.handleClick({ target: move });
  const escape = eventGuard({ key: 'Escape' });
  targetLayer.listeners.get('keydown')(escape.event);
  assert.equal(calls.cancel, 1);
  assert.equal(targetLayer.hidden, true);
  assert.deepEqual(escape.counters, { prevented: 1, stopped: 1, immediate: 1 });

  ui.handleClick({ target: move });
  const right = eventGuard({ key: 'ArrowRight' });
  targetLayer.listeners.get('keydown')(right.event);
  assert.equal(targetLayer.style.getPropertyValue('--alpha-bravo-target-x'), '53%');
  const enter = eventGuard({ key: 'Enter' });
  targetLayer.listeners.get('keydown')(enter.event);
  assert.equal(calls.place.length, 1);
  assert.equal(calls.place[0].normalizedX, 0.53);
  assert.equal(calls.place[0].normalizedY, 0.5);
});

test('hors mission Doctrine le dock et le ciblage restent totalement absents du jeu', () => {
  const fixture = mount();
  fixture.state.active = false;
  fixture.ui.refresh();
  assert.equal(fixture.root.hidden, true);
  assert.equal(fixture.root.getAttribute('aria-hidden'), 'true');
  assert.equal(fixture.targetLayer.hidden, true);
});

test('le shell et app raccordent le dock, les événements fireteam et le ciblage accessible', async () => {
  const [html, styles, app] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/app.js', import.meta.url), 'utf8')
  ]);
  assert.match(html, /id="mission-runtime-v62"[\s\S]*?id="game-canvas"[\s\S]*?id="alpha-bravo-targeting-v69"[\s\S]*?id="alpha-bravo-command-dock-v69"/u);
  assert.match(html, /id="alpha-bravo-targeting-v69"[^>]+aria-hidden="true"[^>]+tabindex="-1"[^>]+hidden/u);
  assert.match(html, /1\/2\/3 GROUPES · C PING · B\/N\/M ORDRES/u);
  assert.match(styles, /\.alpha-bravo-collapse-v69,[\s\S]*?min-width: 44px;[\s\S]*?min-height: 44px;/u);
  assert.match(styles, /\.alpha-bravo-targeting-v69 \{[\s\S]*?background: transparent;[\s\S]*?touch-action: none;/u);
  assert.doesNotMatch(styles, /\.alpha-bravo-targeting-v69 \{[^}]*backdrop-filter/iu);
  assert.match(app, /import \{ AlphaBravoCommandDockV69 \} from '\.\/alpha-bravo-ui-v69\.js';/u);
  assert.match(app, /new AlphaBravoCommandDockV69\([\s\S]*?alpha-bravo-command-dock-v69[\s\S]*?alpha-bravo-targeting-v69/u);
  assert.match(app, /event\.type\.startsWith\('fireteam-'\) \|\| \(event\.type === 'special-operation-started'[\s\S]*?event\.operationId === 'alpha-bravo-coop'/u);
  assert.match(app, /ALPHA_BRAVO_PERSISTENT_EVENTS_V69\.has\(event\.type\)/u);
  assert.match(app, /currentOperation\?\.specialOperationId === 'alpha-bravo-coop'[\s\S]*?engine\.isAlphaBravoMissionV69\?\.\(\)/u);
  const forgeHandler = app.slice(app.indexOf('function handleForgePlaytestEvent'), app.indexOf('function handleGameEvent'));
  assert.doesNotMatch(forgeHandler, /recordOperationFlag|saveSystem\.commit|persistMissionResumeState/u);
});
