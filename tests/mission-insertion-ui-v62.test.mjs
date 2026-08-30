import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyMissionInsertionActionV62,
  createMissionInsertionV62,
  getMissionInsertionReadReceiptV62
} from '../src/mission-insertion-v62.js';
import {
  MissionInsertionUiV62,
  getMissionInsertionUiModelV62,
  normalizeMissionInsertionMediaV62,
  resolveMissionInsertionMediaV62
} from '../src/mission-insertion-ui-v62.js';

function createContract(overrides = {}) {
  const mission = {
    signature: 'insertion-ui-contract',
    campaign: { id: 'campaign-ui', objective: 'Sécuriser la zone d’atterrissage.' },
    world: { id: 'world-ui' },
    anchors: { spawn: { nodeId: 'spawn-ui', x: 180, y: 470 } },
    events: [{ id: 'ash-front', actions: ['visibility:low'] }],
    ...overrides.mission
  };
  return createMissionInsertionV62({
    operation: {
      id: overrides.operationId || 'operation-ui',
      campaignId: 'campaign-ui',
      worldId: 'world-ui',
      crewIds: ['crew-a', 'crew-b'],
      ...overrides.operation
    },
    campaign: { id: 'campaign-ui', objective: 'Sécuriser la zone d’atterrissage.' },
    world: { id: 'world-ui' },
    mission,
    vehicle: { id: 'vehicle-apc', family: 'ground', seats: ['driver', 'gunner'], deploymentReady: true },
    readReceipts: overrides.readReceipts || [],
    now: overrides.now || 1
  });
}

function complete(state, now = 10) {
  let current = state;
  while (current.status !== 'completed') {
    const phase = current.phases[current.currentIndex];
    current = applyMissionInsertionActionV62(current, phase.requiredAction, { now }).state;
    now += 1;
  }
  return current;
}

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  contains(value) { return this.values.has(value); }
}

class FakeStyle {
  constructor() { this.values = new Map(); }
  setProperty(key, value) { this.values.set(key, String(value)); }
}

function datasetName(attribute) {
  return attribute.replace(/^data-/u, '').replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.classList = new FakeClassList();
    this.style = new FakeStyle();
    this.attributes = new Map();
    this.listeners = new Map();
    this.hidden = false;
    this.type = '';
    this._text = '';
  }

  get className() { return [...this.classList.values].join(' '); }
  set className(value) {
    this.classList = new FakeClassList();
    String(value || '').split(/\s+/u).filter(Boolean).forEach((entry) => this.classList.add(entry));
  }

  get textContent() { return this._text + this.children.map((child) => child.textContent || '').join(''); }
  set textContent(value) { this._text = String(value || ''); this.children = []; }

  append(...nodes) {
    for (const node of nodes) {
      if (!node) continue;
      node.parentNode = this;
      this.children.push(node);
    }
  }

  replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[datasetName(name)] = String(value);
  }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  contains(element) {
    for (let current = element; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  matches(selector) {
    const match = selector.match(/^\[data-([a-z0-9-]+)(?:="([^"]+)")?\]$/u);
    if (!match) return false;
    const key = datasetName(`data-${match[1]}`);
    return Object.hasOwn(this.dataset, key) && (match[2] === undefined || this.dataset[key] === match[2]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const results = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches?.(selector)) results.push(child);
        visit(child);
      }
    };
    visit(this);
    return results;
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches?.(selector)) return current;
    return null;
  }
}

class FakeDocument {
  constructor() { this.listeners = new Map(); }
  createElement(tagName) { return new FakeElement(tagName, this); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  dispatchEvent(event) {
    this.listeners.get(event.type)?.(event);
  }
}

function createRoot() {
  const documentRef = new FakeDocument();
  return documentRef.createElement('section');
}

test('le modèle UI expose réellement le vecteur APC, la phase et les hooks opérationnels', () => {
  const state = createContract();
  const model = getMissionInsertionUiModelV62(state);
  assert.equal(model.approachLabel, 'APC');
  assert.equal(model.phaseLabel, 'BRIEFING');
  assert.equal(model.actionLabel, 'VALIDER LE BRIEFING');
  assert.equal(model.phase.hooks.length, 3);
  assert.deepEqual(new Set(model.phase.hooks.map((hook) => hook.channel)), new Set(['audio', 'camera', 'objective']));
  assert.equal(model.skipVisible, false);
  assert.equal(model.media, null);
});

test('seul un média identifié et fourni par le registre est rendu, sans visuel de remplacement inventé', () => {
  const state = createContract();
  assert.equal(normalizeMissionInsertionMediaV62({ id: 'missing-path' }), null);
  assert.equal(normalizeMissionInsertionMediaV62({ id: 'unsafe', file: 'javascript:alert(1)' }), null);
  const media = resolveMissionInsertionMediaV62({
    state,
    mediaRegistry: {
      'apc:briefing': {
        id: 'insertion-apc-briefing',
        file: '/assets/openai/missions/apc-briefing.png',
        alt: 'APC au sas de déploiement',
        provider: 'OpenAI ImageGen'
      },
      default: { title: 'entrée incomplète' }
    }
  });
  assert.deepEqual(media, {
    id: 'insertion-apc-briefing',
    source: '/assets/openai/missions/apc-briefing.png',
    type: 'image',
    alt: 'APC au sas de déploiement',
    credit: 'OpenAI ImageGen',
    poster: null
  });
});

test('le contrôleur DOM rend média réel, rail, progression, hooks et actions actives', () => {
  const root = createRoot();
  const persisted = [];
  const hooks = [];
  let time = 10;
  const ui = new MissionInsertionUiV62({
    root,
    state: createContract(),
    mediaRegistry: {
      briefing: { id: 'briefing-frame', path: '/assets/openai/tantalus-hub-command-deck.png', alt: 'Pont commandement' }
    },
    now: () => time++,
    onPersist: (state, meta) => persisted.push({ state, meta }),
    onHooks: (entries, snapshot, metadata) => hooks.push({ entries, snapshot, metadata })
  });
  assert.equal(root.dataset.insertionApproach, 'apc');
  assert.equal(root.dataset.insertionPhase, 'briefing');
  assert.equal(root.querySelectorAll('[data-phase]').length, 5);
  assert.equal(root.querySelector('[data-media-id]').dataset.mediaId, 'briefing-frame');
  assert.equal(root.querySelectorAll('[data-hook-channel]').length, 3);
  const action = root.querySelector('[data-insertion-action="advance"]');
  assert.equal(action.dataset.requiredAction, 'acknowledge-briefing');
  assert.equal(hooks.length, 1);
  assert.equal(hooks[0].metadata.reason, 'initial-phase');
  assert.deepEqual(new Set(hooks[0].entries.map((entry) => entry.channel)), new Set(['audio', 'camera', 'objective']));

  const advanced = ui.advance();
  assert.equal(advanced.ok, true);
  assert.equal(root.dataset.insertionPhase, 'preparation');
  assert.equal(persisted.at(-1).meta.reason, 'phase-action');
  assert.equal(hooks.length, 2);
  assert.equal(hooks[1].metadata.reason, 'phase-action');
  assert.equal(ui.serialize().currentPhaseId, 'mission-insertion:preparation');
  ui.destroy();
});

test('la séquence progresse avec le temps, au clavier, et suspend réellement sa cadence', () => {
  const root = createRoot();
  const persisted = [];
  const hooks = [];
  let time = 100;
  const ui = new MissionInsertionUiV62({
    root,
    state: createContract(),
    now: () => time++,
    autoProgress: false,
    onPersist: (state, metadata) => persisted.push({ state, metadata }),
    onHooks: (_entries, snapshot, metadata) => hooks.push({ phaseId: snapshot.phaseId, reason: metadata.reason })
  });

  let prevented = 0;
  root.ownerDocument.dispatchEvent({
    type: 'keydown',
    key: 'Enter',
    target: root,
    preventDefault: () => { prevented += 1; }
  });
  assert.equal(ui.serialize().currentPhaseId, 'mission-insertion:preparation');
  ui.advance();
  assert.equal(ui.serialize().currentPhaseId, 'mission-insertion:approach');

  ui.tick(3250);
  assert.equal(ui.serialize().phases[2].progress, 0.5);
  assert.equal(persisted.at(-1).metadata.reason, 'progress');
  ui.tick(3250);
  assert.equal(ui.serialize().currentPhaseId, 'mission-insertion:deployment');
  assert.ok(hooks.some((entry) => entry.phaseId === 'mission-insertion:deployment'));

  root.ownerDocument.dispatchEvent({
    type: 'keydown',
    key: 'Escape',
    target: root,
    preventDefault: () => { prevented += 1; }
  });
  const pausedProgress = ui.serialize().phases[3].progress;
  assert.equal(ui.serialize().paused, true);
  assert.equal(ui.tick(5000).reason, 'paused');
  assert.equal(ui.serialize().phases[3].progress, pausedProgress);

  root.ownerDocument.dispatchEvent({
    type: 'keydown',
    key: 'p',
    target: root,
    preventDefault: () => { prevented += 1; }
  });
  assert.equal(ui.serialize().paused, false);
  ui.tick(5000);
  assert.equal(ui.serialize().currentPhaseId, 'mission-insertion:player-control');
  root.ownerDocument.dispatchEvent({
    type: 'keydown',
    key: ' ',
    target: root,
    preventDefault: () => { prevented += 1; }
  });
  assert.equal(ui.serialize().status, 'completed');
  assert.ok(prevented >= 3);
  ui.destroy();
  assert.equal(root.ownerDocument.listeners.has('keydown'), false);
});

test('pause, sérialisation et restauration conservent exactement phase et progression', () => {
  const root = createRoot();
  let time = 20;
  const ui = new MissionInsertionUiV62({ root, state: createContract(), now: () => time++ });
  ui.advance();
  ui.setPhaseProgress(0.64);
  const paused = ui.pause();
  assert.equal(paused.ok, true);
  assert.equal(ui.serialize().paused, true);
  assert.equal(ui.serialize().phases[1].progress, 0.64);
  assert.ok(root.querySelector('[data-insertion-action="resume"]'));
  const payload = JSON.stringify(ui.serialize());
  ui.restore(payload);
  const resumed = ui.resume();
  assert.equal(resumed.ok, true);
  assert.equal(ui.serialize().currentPhaseId, 'mission-insertion:preparation');
  assert.equal(ui.serialize().phases[1].progress, 0.64);
  assert.ok(root.querySelector('[data-insertion-action="advance"]'));
  ui.destroy();
});

test('un incident n’apparaît qu’avec sa cause mission et expose son action de résolution', () => {
  const incidentState = createContract({
    mission: {
      insertion: {
        incident: {
          id: 'ash-diversion',
          cause: { kind: 'event', id: 'ash-front' },
          resolutionActionId: 'confirm-ash-route'
        }
      }
    }
  });
  const root = createRoot();
  let time = 40;
  const ui = new MissionInsertionUiV62({ root, state: incidentState, now: () => time++ });
  ui.advance();
  ui.advance();
  ui.advance();
  assert.equal(root.dataset.insertionPhase, 'incident');
  assert.equal(root.querySelector('[data-incident-id]').dataset.incidentId, 'ash-diversion');
  assert.match(root.textContent, /confirm-ash-route/u);
  assert.equal(root.querySelector('[data-insertion-action="advance"]').dataset.requiredAction, 'confirm-ash-route');
  ui.destroy();
});

test('Skip reste absent à la première lecture puis termine réellement une relecture reçue', () => {
  const first = createContract();
  const completed = complete(first);
  const receipt = getMissionInsertionReadReceiptV62(completed);
  const replay = createContract({ operationId: 'operation-ui-replay', readReceipts: [receipt], now: 50 });
  assert.equal(replay.skipAllowed, true);
  const root = createRoot();
  const completions = [];
  const ui = new MissionInsertionUiV62({
    root,
    state: replay,
    now: () => 60,
    onComplete: (result) => completions.push(result)
  });
  assert.ok(root.querySelector('[data-insertion-action="skip"]'));
  const result = ui.skip();
  assert.equal(result.ok, true);
  assert.equal(ui.serialize().controlGranted, true);
  assert.equal(root.dataset.insertionStatus, 'completed');
  assert.ok(root.querySelector('[data-insertion-complete="true"]'));
  assert.equal(completions.length, 1);
  assert.equal(completions[0].skipped, true);
  assert.equal(completions[0].readReceipt.key, replay.readKey);
  ui.destroy();
});
