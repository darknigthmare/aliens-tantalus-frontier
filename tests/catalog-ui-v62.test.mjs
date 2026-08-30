import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CatalogWorkbenchV62,
  formatCatalogValueV62,
  getCatalogSpriteFrameV62,
  normalizeCatalogActionsV62,
  resolveCatalogQueryStateV62
} from '../src/catalog-ui-v62.js';
import {
  CATALOG_UNKNOWN_V62,
  getCatalogEntryV62,
  getCatalogNodeV62
} from '../src/catalog-runtime-v62.js';

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
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
  setProperty(key, value) { this.values.set(key, String(value)); }
}

const datasetName = (attribute) => attribute.replace(/^data-/u, '').replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());

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
    this.disabled = false;
    this.value = '';
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
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  contains(element) {
    for (let current = element; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  matches(selector) {
    const datasetMatch = selector.match(/^\[data-([a-z0-9-]+)(?:="([^"]+)")?\]$/u);
    if (!datasetMatch) return false;
    const key = datasetName(`data-${datasetMatch[1]}`);
    return Object.hasOwn(this.dataset, key) && (datasetMatch[2] === undefined || this.dataset[key] === datasetMatch[2]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const matches = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches?.(selector)) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches?.(selector)) return current;
    return null;
  }
  focus() { this.focused = true; }
}

class FakeDocument {
  constructor() {
    this.documentElement = new FakeElement('html', this);
  }
  createElement(tagName) { return new FakeElement(tagName, this); }
}

const makeWorkbench = ({ catalogs = ['enemies'], query = '', getActions } = {}) => {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  const tree = documentRef.createElement('aside');
  const list = documentRef.createElement('main');
  const detail = documentRef.createElement('aside');
  const search = documentRef.createElement('input');
  search.value = query;
  root.append(tree, list, detail);
  const workbench = new CatalogWorkbenchV62({
    root,
    tree,
    list,
    detail,
    search,
    catalogs,
    getActions,
    limit: 8,
    reducedMotion: true
  });
  return { workbench, root, tree, list, detail, search };
};

test('la recherche UI sélectionne le meilleur résultat et ouvre tous ses ancêtres', () => {
  const state = resolveCatalogQueryStateV62({ catalogs: ['vehicles'], query: 'p 5000 powered', limit: 5 });
  assert.equal(state.bestEntry.id, 'vehicle-007-p-5000-powered-work-loader');
  assert.equal(state.selectedEntry.id, state.bestEntry.id);
  assert.ok(state.bestEntry.ancestryIds.every((id) => state.expandedNodeIds.includes(id)));
  assert.ok(state.records.every((record) => record.catalog === 'vehicles'));
});

test('un nœud actif filtre réellement ses descendants sans recherche textuelle', () => {
  const entry = getCatalogEntryV62('enemy-001-ovomorph');
  const casteNodeId = entry.ancestryIds.find((id) => id.includes('/caste:'));
  const node = getCatalogNodeV62(casteNodeId);
  const state = resolveCatalogQueryStateV62({ catalogs: ['enemies'], activeNodeId: casteNodeId });
  assert.equal(state.activeNode.id, casteNodeId);
  assert.equal(state.records.length, node.count);
  assert.ok(state.records.every((record) => node.descendantEntryIds.includes(record.id)));
});

test('le cadrage de sprite emploie les vraies cellules du clip idle', () => {
  const record = getCatalogEntryV62('enemy-004-drone-big-chap');
  const first = getCatalogSpriteFrameV62(record.visual, 0);
  const second = getCatalogSpriteFrameV62(record.visual, 1);
  assert.deepEqual(first, {
    path: record.visual.path,
    frame: 0,
    column: 0,
    row: 0,
    columns: 4,
    rows: 4,
    widthPercent: 400,
    heightPercent: 400,
    translateXPercent: -0,
    translateYPercent: -0
  });
  assert.equal(second.frame, 1);
  assert.equal(second.translateXPercent, -25);
  assert.equal(getCatalogSpriteFrameV62(null), null);
});

test('les actions conservent leurs datasets de gameplay sans perdre les valeurs vides valides', () => {
  const actions = normalizeCatalogActionsV62([{
    id: 'procure',
    label: 'ACQUÉRIR',
    dataset: {
      'data-procure-kind': 'weapon',
      procureId: 'weapon-001-m41a-pulse-rifle',
      selected: true,
      ignored: false
    }
  }]);
  assert.deepEqual(actions[0].dataset, {
    procureKind: 'weapon',
    procureId: 'weapon-001-m41a-pulse-rifle',
    selected: ''
  });
  assert.equal(Object.isFrozen(actions), true);
});

test('les valeurs inconnues sont signalées sans inventer de donnée', () => {
  assert.equal(formatCatalogValueV62(CATALOG_UNKNOWN_V62), 'NON DOCUMENTÉ');
  assert.equal(formatCatalogValueV62([]), null);
  assert.equal(formatCatalogValueV62(false), 'NON');
});

test('le contrôleur DOM rend arbre, cellules réelles, détail et actions délégables', () => {
  const { workbench, root, tree, list, detail } = makeWorkbench({
    catalogs: ['vehicles'],
    query: 'p 5000 powered',
    getActions: (record) => [{
      id: 'assign',
      label: 'AFFECTER',
      dataset: { selectVehicle: record.id }
    }]
  });
  assert.equal(workbench.getSnapshot().selectedEntryId, 'vehicle-007-p-5000-powered-work-loader');
  assert.ok(tree.querySelectorAll('[data-catalog-node]').length > 0);
  assert.ok(list.querySelector('[data-catalog-entry="vehicle-007-p-5000-powered-work-loader"]'));
  const actionButtons = root.querySelectorAll('[data-catalog-action]');
  assert.ok(actionButtons.length >= 2);
  assert.ok(actionButtons.every((button) => String(button.dataset.selectVehicle || '').startsWith('vehicle-')));
  assert.ok(actionButtons.some((button) => button.dataset.selectVehicle === 'vehicle-007-p-5000-powered-work-loader'));
  const frame = list.querySelector('[data-catalog-entry="vehicle-007-p-5000-powered-work-loader"]')
    .querySelector('[data-sheet-id]');
  assert.ok(frame);
  assert.match(frame.dataset.sheetId, /^vehicle\./u);
  assert.match(detail.textContent, /FAITS DE RÉFÉRENCE/u);
  assert.match(detail.textContent, /STATISTIQUES DE GAMEPLAY/u);
  assert.match(detail.textContent, /comparateur masqué/iu);
  workbench.destroy();
});

test('l’arborescence garde un nœud replié hors auto-ouverture de recherche', () => {
  const { workbench } = makeWorkbench({ catalogs: ['vehicles'] });
  assert.ok(workbench.getSnapshot().expandedNodeIds.includes('catalog:vehicles'));
  assert.equal(workbench.selectNode('catalog:vehicles'), true);
  assert.equal(workbench.getSnapshot().expandedNodeIds.includes('catalog:vehicles'), false);
  workbench.setQuery('p 5000 powered');
  assert.ok(workbench.getSnapshot().expandedNodeIds.includes('catalog:vehicles'));
  workbench.destroy();
});

test('une relation biologique révèle et sélectionne la cible hors du filtre courant', () => {
  const { workbench, detail } = makeWorkbench({ catalogs: ['enemies'], query: 'ovomorph' });
  assert.equal(workbench.getSnapshot().selectedEntryId, 'enemy-001-ovomorph');
  const relationButton = detail.querySelector('[data-catalog-relation-entry]');
  assert.ok(relationButton);
  assert.equal(workbench.selectEntry(relationButton.dataset.catalogRelationEntry), true);
  assert.equal(workbench.getSnapshot().selectedEntryId, relationButton.dataset.catalogRelationEntry);
  assert.equal(workbench.getSnapshot().query, '');
  workbench.destroy();
});
