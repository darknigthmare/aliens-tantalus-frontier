import { CATALOG_RECORDS_V62, searchCatalogV62 } from '../src/catalog-runtime-v62.js';
import { ENEMY_USER_CAMPAIGN_V88 } from '../src/enemy-user-campaign-v88.js';
import { BioforgeUiV80 } from '../src/bioforge-ui-v80.js';
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CatalogWorkbenchV62,
  CatalogSpriteAnimatorV62,
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
  appendChild(node) { this.append(node); return node; }
  set innerHTML(value) { throw new Error('Markup must never be interpreted by this renderer: ' + value); }
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
  focus() {
    if (this.ownerDocument.activeElement) this.ownerDocument.activeElement.focused = false;
    this.focused = true;
    this.ownerDocument.activeElement = this;
  }
}

class FakeDocument {
  constructor() {
    this.documentElement = new FakeElement('html', this);
  }
  createElement(tagName) { return new FakeElement(tagName, this); }
}

const makeWorkbench = ({ catalogs = ['enemies'], query = '', getActions, getDiscoveryV88, reducedMotion = true } = {}) => {
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
    getDiscoveryV88,
    limit: 8,
    reducedMotion
  });
  return { workbench, root, tree, list, detail, search };
};

const specialized = ENEMY_USER_CAMPAIGN_V88.filter(d => d.specializedBehaviorV90 || d.specializedBehaviorV89);
test('V90 catalog normalizes five immutable partial behaviours while preserving the three V89 fields', () => {
  assert.equal(specialized.length, 5);
  assert.equal(CATALOG_RECORDS_V62.filter(d => d.combatBehaviorV90 || d.combatBehaviorV89).length, 5);
  assert.equal(CATALOG_RECORDS_V62.filter(d => d.combatBehaviorV89).length, 3);
  assert.equal(CATALOG_RECORDS_V62.filter(d => d.combatBehaviorV90).length, 2);
  for (const d of specialized) {
    const record = getCatalogEntryV62(d.id), expected = d.specializedBehaviorV90 || d.specializedBehaviorV89;
    assert.deepEqual(record.combatBehavior, expected);
    assert.equal(record.combatBehavior, record.combatBehaviorV90 || record.combatBehaviorV89);
    assert.ok(Object.isFrozen(record.combatBehavior)); assert.ok(Object.isFrozen(record.combatBehavior.sourceUrls));
    assert.equal(record.visual.identity.canonExact, false); assert.equal(record.visual.animationStatus, 'missing');
    assert.equal(record.visual.visualMode, 'static-pose'); assert.equal(record.dimensions, null);
    assert.ok(searchCatalogV62(expected.label, { catalog: 'enemies' }).some(hit => hit.entry.id === d.id));
  }
});

for (const d of specialized) test(d.basename + ': encyclopedia renders one documented mission behaviour, native pose and safe official link', () => {
  const { workbench, detail } = makeWorkbench({ query: d.id }); workbench.refresh();
  const behavior = d.specializedBehaviorV90 || d.specializedBehaviorV89;
  const sections = detail.querySelectorAll('[data-combat-behavior]'); assert.equal(sections.length, 1);
  assert.equal(sections[0].dataset.combatBehavior, behavior.id);
  assert.ok(detail.textContent.includes(behavior.label)); assert.ok(detail.textContent.includes(behavior.summary));
  assert.match(detail.textContent, /COMPORTEMENT EN MISSION/);
  assert.match(detail.textContent, /Pose fixe native · animations manquantes/);
  assert.match(detail.textContent, /fidélité canonique non certifiée/);
  assert.match(detail.textContent, /Documentée, adaptation partielle/);
  assert.doesNotMatch(detail.textContent, /source-grounded-partial-v8[9]|source-grounded-partial-v90|canonExact/);
  const links = detail.querySelectorAll('[data-combat-behavior-source]'); assert.equal(links.length, 1);
  assert.match(links[0].href, /^https:\/\/www\.aliensfireteamelite\.com\//);
  assert.equal(links[0].rel, 'noopener noreferrer'); assert.equal(links[0].referrerPolicy, 'no-referrer');
  assert.equal(links[0].target, '_blank');
  const figure = detail.querySelector('[data-visual-mode="static-pose"]');
  assert.equal(figure.dataset.animationStatus, 'missing'); assert.equal(figure.children[0].style.objectFit, 'contain');
  workbench.destroy();
});

test('V90 renderer prefers its metadata over V89 and never interprets labels/summary as HTML', () => {
  const { workbench, detail } = makeWorkbench();
  workbench.renderCombatBehaviorV89({ catalog: 'enemies', combatBehaviorV89: { id: 'old', label: 'NOT_SELECTED', summary: 'OLD' },
    combatBehaviorV90: { id: 'new', label: '<img onerror=alert(1)>', summary: '<script>bad</script>', adaptationNote: '<iframe>no</iframe>',
      sourceUrls: ['javascript:alert(1)', 'data:text/html,bad', 'https://user:password@example.com/', 'http://example.com/',
        'not a url', 'https://example.com/source', 'https://example.com/source'] } });
  assert.equal(detail.querySelector('[data-combat-behavior]')?.dataset.combatBehavior, 'new');
  assert.match(detail.textContent, /<img onerror=alert\(1\)>/); assert.match(detail.textContent, /<script>bad<\/script>/);
  assert.match(detail.textContent, /<iframe>no<\/iframe>/); assert.doesNotMatch(detail.textContent, /NOT_SELECTED/);
  const links = detail.querySelectorAll('[data-combat-behavior-source]'); assert.equal(links.length, 1);
  assert.equal(links[0].href, 'https://example.com/source');
  workbench.destroy();
});

function bioforgeSelection(profileId) {
  // Calls the production selection renderer against DOM nodes, not a rewritten label helper.
  const documentRef = new FakeDocument(), ui = Object.create(BioforgeUiV80.prototype);
  ui.document = documentRef; ui.profile = { value: profileId };
  for (const field of ['preview', 'thumbnail', 'profileName', 'cost', 'missionBehaviorV90']) ui[field] = documentRef.createElement('span');
  ui.syncSelection(); return ui;
}

for (const d of specialized) test(d.basename + ': BIOFORGE states mission-only behaviour and retains simplified lab disclosure', () => {
  const ui = bioforgeSelection(d.id), behavior = d.specializedBehaviorV90 || d.specializedBehaviorV89;
  assert.match(ui.cost.textContent, /Pose fixe · animations manquantes · comportement labo simplifié/);
  assert.equal(ui.missionBehaviorV90.hidden, false); assert.equal(ui.missionBehaviorV90.dataset.missionBehavior, behavior.id);
  assert.ok(ui.missionBehaviorV90.textContent.includes(behavior.label));
  assert.match(ui.missionBehaviorV90.textContent, /EN MISSION/);
  assert.match(ui.missionBehaviorV90.textContent, /Non reproduit dans le labo simplifié/);
  const link = ui.missionBehaviorV90.querySelector('[data-mission-behavior-source]');
  assert.match(link.href, /^https:\/\/www\.aliensfireteamelite\.com\//); assert.equal(link.rel, 'noopener noreferrer');
  assert.equal(ui.preview.src, d.path); assert.equal(ui.thumbnail.dataset.atlasColumns, '1'); assert.equal(ui.thumbnail.dataset.atlasRows, '1');
  assert.equal(ui.model, undefined, 'Selection rendering does not start/change a simulation');
});

test('BIOFORGE clears specialised caption and source when switching to a generic native or legacy Altered profile', () => {
  const ui = bioforgeSelection('castes-game_pathogen_queen'); assert.equal(ui.missionBehaviorV90.hidden, false);
  ui.profile.value = 'castes-film_warrior_aliens_1986'; ui.syncSelection();
  assert.equal(ui.missionBehaviorV90.hidden, true); assert.equal(ui.missionBehaviorV90.textContent, '');
  assert.equal(ui.missionBehaviorV90.dataset.missionBehavior, undefined); assert.equal(ui.thumbnail.dataset.atlasColumns, '1');
  ui.profile.value = 'enemy-005-warrior'; ui.syncSelection();
  assert.equal(ui.missionBehaviorV90.hidden, true); assert.equal(ui.thumbnail.dataset.atlasColumns, '4');
  assert.match(ui.profileName.textContent, /Altered/);
});

test('BIOFORGE renders untrusted metadata as text and rejects script/http/credential links', () => {
  const ui = bioforgeSelection('castes-game_pathogen_queen');
  ui.renderMissionBehaviorV90({ id: 'test', label: '<script>alert(1)</script>',
    sourceUrls: ['javascript:alert(1)', 'data:text/html,bad', 'http://example.com/', 'https://user:secret@example.com/',
      'broken', 'https://example.com/source', 'https://example.com/source'] });
  assert.match(ui.missionBehaviorV90.textContent, /<script>alert\(1\)<\/script>/);
  const links = ui.missionBehaviorV90.querySelectorAll('[data-mission-behavior-source]'); assert.equal(links.length, 1);
  assert.equal(links[0].href, 'https://example.com/source'); assert.equal(links[0].referrerPolicy, 'no-referrer');
});

test('generic native and historical Altered entries never gain an invented specific behaviour', () => {
  for (const id of ['castes-film_warrior_aliens_1986', 'enemy-005-warrior']) {
    const record = getCatalogEntryV62(id); assert.equal(record.combatBehavior, undefined);
    const { workbench, detail } = makeWorkbench({ query: id }); workbench.refresh();
    assert.equal(detail.querySelector('[data-combat-behavior]'), null); workbench.destroy();
  }
  assert.equal(formatCatalogValueV62('source-grounded-partial-v90'), 'Documentée, adaptation partielle');
});
