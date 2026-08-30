import {
  CATALOG_LABELS_V62,
  CATALOG_RECORDS_V62,
  CATALOG_TREE_V62,
  CATALOG_UNKNOWN_V62,
  getBiologicalRelationsV62,
  getCatalogEntryV62,
  getCatalogNodeV62,
  getHumanSizeComparisonV62,
  searchCatalogV62
} from './catalog-runtime-v62.js';

const VALID_CATALOGS = new Set(CATALOG_TREE_V62.map((root) => root.catalog));
const EMPTY_ARRAY = Object.freeze([]);
const UNKNOWN_LABEL = 'NON DOCUMENTÉ';

const LABELS = Object.freeze({
  actions: 'Actions',
  acid: 'Acide',
  armor: 'Armure',
  behavior: 'Comportement',
  canonExact: 'Exactitude canon',
  cargo: 'Cargo',
  category: 'Catégorie',
  caste: 'Caste',
  charges: 'Charges',
  claims: 'Faits documentés',
  damage: 'Dégâts',
  description: 'Description',
  exact: 'Identité exacte',
  family: 'Famille',
  fireRate: 'Cadence',
  fit: 'Gabarit',
  frequency: 'Fréquence',
  grade: 'Grade',
  habitats: 'Habitats',
  health: 'Points de vie',
  hull: 'Coque',
  identity: 'Identité visuelle',
  identityStatus: 'Statut identité',
  magazine: 'Chargeur',
  mass: 'Masse',
  penetration: 'Pénétration',
  provenance: 'Provenance',
  rarity: 'Rareté',
  referenceStatus: 'Statut référence',
  reload: 'Rechargement',
  seats: 'Postes',
  source: 'Source',
  species: 'Espèce',
  speed: 'Vitesse',
  stage: 'Stade',
  subspecies: 'Sous-espèce',
  tags: 'Marqueurs',
  type: 'Type',
  utility: 'Utilité'
});

const BIOLOGY_RELATION_LABELS = Object.freeze({
  produces: 'produit',
  contains: 'contient',
  precedes: 'précède',
  'matures-into': 'devient'
});

const isElementLike = (value) => value
  && typeof value === 'object'
  && typeof value.append === 'function'
  && typeof value.querySelector === 'function';

const toCatalogs = (value) => {
  const values = Array.isArray(value) ? value : [value];
  const catalogs = values
    .map((entry) => String(entry || '').trim().toLowerCase())
    .filter((entry, index, list) => VALID_CATALOGS.has(entry) && list.indexOf(entry) === index);
  return catalogs.length ? catalogs : [...VALID_CATALOGS];
};

const toDatasetKey = (value) => String(value || '')
  .trim()
  .replace(/^data-/u, '')
  .replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());

const isRenderableValue = (value) => value !== undefined && value !== null && value !== '';

const visibleEntries = (object = {}) => Object.entries(object)
  .filter(([, value]) => isRenderableValue(value));

const nodeContainsEntry = (node, entryId) => node?.descendantEntryIds?.includes(entryId) === true;

export function formatCatalogLabelV62(key) {
  if (LABELS[key]) return LABELS[key];
  return String(key || '')
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/[-_]+/gu, ' ')
    .replace(/^./u, (letter) => letter.toUpperCase());
}

export function formatCatalogValueV62(value) {
  if (value === CATALOG_UNKNOWN_V62) return UNKNOWN_LABEL;
  if (typeof value === 'boolean') return value ? 'OUI' : 'NON';
  if (Array.isArray(value)) {
    return value.length
      ? value.map((entry) => formatCatalogValueV62(entry)).filter(Boolean).join(' · ')
      : null;
  }
  if (typeof value === 'number') return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2
  }).format(value);
  if (typeof value === 'object' && value) return visibleEntries(value)
    .map(([key, entry]) => `${formatCatalogLabelV62(key)}: ${formatCatalogValueV62(entry)}`)
    .filter((entry) => !entry.endsWith(': null'))
    .join(' · ') || null;
  return isRenderableValue(value) ? String(value) : null;
}

export function getCatalogSpriteFrameV62(visual, frameIndex = 0) {
  const grid = visual?.grid;
  const frames = visual?.idleClip?.clip?.frames;
  if (!visual?.path || !grid || !Array.isArray(frames) || !frames.length) return null;
  const columns = Math.max(1, Math.trunc(Number(grid.columns) || 1));
  const rows = Math.max(1, Math.trunc(Number(grid.rows) || 1));
  const cellCount = columns * rows;
  const requestedFrame = Number(frames[Math.abs(Math.trunc(frameIndex)) % frames.length]);
  if (!Number.isInteger(requestedFrame) || requestedFrame < 0 || requestedFrame >= cellCount) return null;
  return Object.freeze({
    path: visual.path,
    frame: requestedFrame,
    column: requestedFrame % columns,
    row: Math.floor(requestedFrame / columns),
    columns,
    rows,
    widthPercent: columns * 100,
    heightPercent: rows * 100,
    translateXPercent: -(requestedFrame % columns) * (100 / columns),
    translateYPercent: -Math.floor(requestedFrame / columns) * (100 / rows)
  });
}

export function normalizeCatalogActionsV62(actions = []) {
  if (!Array.isArray(actions)) return EMPTY_ARRAY;
  return Object.freeze(actions.flatMap((action, index) => {
    if (!action || typeof action !== 'object' || !String(action.label || '').trim()) return [];
    const dataset = {};
    for (const [key, value] of Object.entries(action.dataset || {})) {
      if (value === undefined || value === null || value === false) continue;
      dataset[toDatasetKey(key)] = value === true ? '' : String(value);
    }
    return [Object.freeze({
      id: String(action.id || `action-${index}`),
      label: String(action.label).trim(),
      dataset: Object.freeze(dataset),
      disabled: action.disabled === true,
      title: String(action.title || '').trim(),
      className: String(action.className || '').trim(),
      variant: String(action.variant || 'default').trim()
    })];
  }));
}

export function resolveCatalogQueryStateV62({
  catalogs,
  query = '',
  activeNodeId = null,
  selectedEntryId = null,
  predicate = null,
  limit = 250
} = {}) {
  const scope = toCatalogs(catalogs);
  const filter = typeof predicate === 'function' ? predicate : () => true;
  const term = String(query || '').trim();
  const activeNode = getCatalogNodeV62(activeNodeId);
  let records;

  if (term) {
    records = scope.flatMap((catalog) => searchCatalogV62(term, { catalog, limit }))
      .sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name, 'fr'))
      .slice(0, limit)
      .map((result) => result.entry)
      .filter(filter);
  } else {
    const allowedIds = activeNode && scope.includes(activeNode.catalog)
      ? new Set(activeNode.descendantEntryIds)
      : null;
    records = CATALOG_RECORDS_V62.filter((record) => scope.includes(record.catalog)
      && (!allowedIds || allowedIds.has(record.id))
      && filter(record));
  }

  const bestEntry = term ? records[0] || null : records.find((record) => record.id === selectedEntryId) || records[0] || null;
  const selected = records.find((record) => record.id === selectedEntryId) || bestEntry;
  const expandedNodeIds = new Set();
  for (const catalog of scope) expandedNodeIds.add(`catalog:${catalog}`);
  if (selected) selected.ancestryIds.forEach((id) => expandedNodeIds.add(id));

  return Object.freeze({
    catalogs: Object.freeze(scope),
    query: term,
    records: Object.freeze(records),
    selectedEntry: selected,
    bestEntry,
    activeNode: activeNode && scope.includes(activeNode.catalog) ? activeNode : null,
    expandedNodeIds: Object.freeze([...expandedNodeIds])
  });
}

function clearElement(element) {
  if (typeof element.replaceChildren === 'function') element.replaceChildren();
  else element.textContent = '';
}

function createElement(documentRef, tagName, className = '', text = null) {
  const element = documentRef.createElement(tagName);
  if (className) element.className = className;
  if (text !== null && text !== undefined) element.textContent = String(text);
  return element;
}

function appendDefinitionRows(documentRef, target, values, options = {}) {
  for (const [key, rawValue] of visibleEntries(values)) {
    const value = formatCatalogValueV62(rawValue);
    if (value === null) continue;
    const row = createElement(documentRef, 'div', 'catalog-v62__data-row');
    const term = createElement(documentRef, 'dt', '', formatCatalogLabelV62(key));
    const description = createElement(documentRef, 'dd', rawValue === CATALOG_UNKNOWN_V62 ? 'catalog-v62__unknown' : '', value);
    if (options.status === 'canon') description.dataset.factStatus = 'canon';
    if (options.status === 'gameplay') description.dataset.factStatus = 'gameplay';
    row.append(term, description);
    target.append(row);
  }
}

function renderTaxonomyPath(documentRef, record) {
  const list = createElement(documentRef, 'ol', 'catalog-v62__breadcrumb');
  for (const segment of record.hierarchySegments) {
    const item = createElement(documentRef, 'li', segment.label === CATALOG_UNKNOWN_V62 ? 'is-unknown' : '',
      segment.label === CATALOG_UNKNOWN_V62 ? UNKNOWN_LABEL : segment.label);
    item.dataset.kind = segment.kind;
    list.append(item);
  }
  return list;
}

export class CatalogSpriteAnimatorV62 {
  constructor({ documentRef, reducedMotion = null } = {}) {
    this.document = documentRef || globalThis.document || null;
    this.reducedMotionOverride = reducedMotion;
    this.animations = new Set();
  }

  isReducedMotion() {
    if (typeof this.reducedMotionOverride === 'function') return this.reducedMotionOverride() === true;
    if (typeof this.reducedMotionOverride === 'boolean') return this.reducedMotionOverride;
    const rootReduced = this.document?.documentElement?.classList?.contains?.('reduced-motion') === true;
    const mediaReduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
    return rootReduced || mediaReduced;
  }

  mount(target, visual, label, { detail = false } = {}) {
    const firstFrame = getCatalogSpriteFrameV62(visual, 0);
    if (!isElementLike(target) || !firstFrame) return null;
    const documentRef = target.ownerDocument || this.document;
    const viewport = createElement(documentRef, 'figure', `catalog-v62__sprite${detail ? ' catalog-v62__sprite--detail' : ''}`);
    viewport.setAttribute('aria-label', `${label} — animation idle issue de la plaquette dédiée`);
    viewport.dataset.sheetId = visual.sheetId || '';
    viewport.dataset.clipId = visual.idleClip?.clip?.id || '';
    const image = createElement(documentRef, 'img', 'catalog-v62__sheet');
    image.src = firstFrame.path;
    image.alt = '';
    image.loading = detail ? 'eager' : 'lazy';
    image.decoding = 'async';
    viewport.append(image);
    target.append(viewport);

    const frames = visual.idleClip.clip.frames;
    const fps = Math.max(1, Math.min(24, Number(visual.idleClip.clip.fps) || 1));
    const state = { image, visual, index: 0, timer: null };
    const applyFrame = () => {
      const frame = getCatalogSpriteFrameV62(state.visual, state.index);
      if (!frame) return;
      image.style.width = `${frame.widthPercent}%`;
      image.style.height = `${frame.heightPercent}%`;
      image.style.transform = `translate(${frame.translateXPercent}%, ${frame.translateYPercent}%)`;
      viewport.dataset.frame = String(frame.frame);
    };
    applyFrame();
    if (!this.isReducedMotion() && frames.length > 1) {
      state.timer = globalThis.setInterval(() => {
        state.index = (state.index + 1) % frames.length;
        applyFrame();
      }, Math.round(1000 / fps));
    }
    this.animations.add(state);
    return viewport;
  }

  clear() {
    for (const state of this.animations) {
      if (state.timer !== null) globalThis.clearInterval(state.timer);
    }
    this.animations.clear();
  }
}

export class CatalogWorkbenchV62 {
  constructor(options = {}) {
    const root = options.root;
    const documentRef = root?.ownerDocument || globalThis.document;
    if (!isElementLike(root) || !documentRef) throw new TypeError('CatalogWorkbenchV62 requiert un élément root valide.');
    for (const key of ['tree', 'list', 'detail']) {
      if (!isElementLike(options[key])) throw new TypeError(`CatalogWorkbenchV62 requiert un conteneur ${key} valide.`);
    }
    this.root = root;
    this.tree = options.tree;
    this.list = options.list;
    this.detail = options.detail;
    this.search = options.search || null;
    this.document = documentRef;
    this.catalogsSource = options.catalogs || options.catalog || [...VALID_CATALOGS];
    this.predicate = typeof options.predicate === 'function' ? options.predicate : null;
    this.getActions = typeof options.getActions === 'function' ? options.getActions : () => EMPTY_ARRAY;
    this.onAction = typeof options.onAction === 'function' ? options.onAction : null;
    this.onSelect = typeof options.onSelect === 'function' ? options.onSelect : null;
    this.dimensions = options.dimensions;
    this.limit = Math.max(1, Math.min(500, Number(options.limit) || 250));
    this.emptyMessage = String(options.emptyMessage || 'Aucune entrée documentée ne correspond à cette recherche.');
    this.state = {
      activeNodeId: null,
      selectedEntryId: null,
      expandedNodeIds: new Set(),
      query: String(this.search?.value || '')
    };
    this.catalogs.forEach((catalog) => this.state.expandedNodeIds.add(`catalog:${catalog}`));
    this.animator = new CatalogSpriteAnimatorV62({
      documentRef,
      reducedMotion: options.reducedMotion
    });
    this.boundInput = () => {
      this.state.query = String(this.search?.value || '');
      this.render({ selectBest: true });
    };
    this.boundClick = (event) => this.handleClick(event);
    this.root.classList.add('catalog-v62');
    this.tree.classList.add('catalog-v62__tree');
    this.list.classList.add('catalog-v62__results');
    this.detail.classList.add('catalog-v62__detail');
    this.search?.addEventListener?.('input', this.boundInput);
    this.root.addEventListener('click', this.boundClick);
    this.render({ selectBest: true });
  }

  get catalogs() {
    const source = typeof this.catalogsSource === 'function' ? this.catalogsSource() : this.catalogsSource;
    return toCatalogs(source);
  }

  setCatalogs(catalogs) {
    this.catalogsSource = catalogs;
    this.state.activeNodeId = null;
    this.state.selectedEntryId = null;
    this.state.expandedNodeIds.clear();
    this.catalogs.forEach((catalog) => this.state.expandedNodeIds.add(`catalog:${catalog}`));
    return this.render({ selectBest: true });
  }

  setPredicate(predicate) {
    this.predicate = typeof predicate === 'function' ? predicate : null;
    return this.render({ selectBest: true });
  }

  setQuery(query, { focus = false } = {}) {
    this.state.query = String(query || '');
    if (this.search) this.search.value = this.state.query;
    const result = this.render({ selectBest: true });
    if (focus) this.search?.focus?.();
    return result;
  }

  selectEntry(entryOrId, { focus = false } = {}) {
    const record = getCatalogEntryV62(entryOrId);
    if (!record || !this.catalogs.includes(record.catalog) || (this.predicate && !this.predicate(record))) return false;
    if (this.state.query) {
      const remainsVisible = searchCatalogV62(this.state.query, { catalog: record.catalog, limit: 250 })
        .some((result) => result.entry.id === record.id);
      if (!remainsVisible) {
        this.state.query = '';
        if (this.search) this.search.value = '';
      }
    }
    this.state.selectedEntryId = record.id;
    record.ancestryIds.forEach((id) => this.state.expandedNodeIds.add(id));
    this.render();
    if (focus) this.list.querySelector(`[data-catalog-entry="${record.id}"]`)?.focus?.();
    this.onSelect?.(record, this.getSnapshot());
    return true;
  }

  selectNode(nodeId) {
    const node = getCatalogNodeV62(nodeId);
    if (!node || !this.catalogs.includes(node.catalog)) return false;
    this.state.activeNodeId = node.id;
    this.state.query = '';
    if (this.search) this.search.value = '';
    if (node.children.length) {
      if (this.state.expandedNodeIds.has(node.id)) this.state.expandedNodeIds.delete(node.id);
      else this.state.expandedNodeIds.add(node.id);
    }
    this.state.selectedEntryId = null;
    this.render({ selectBest: true });
    return true;
  }

  getSnapshot() {
    return Object.freeze({
      catalogs: Object.freeze(this.catalogs),
      query: this.state.query,
      activeNodeId: this.state.activeNodeId,
      selectedEntryId: this.state.selectedEntryId,
      expandedNodeIds: Object.freeze([...this.state.expandedNodeIds])
    });
  }

  refresh(options = {}) {
    if (Object.hasOwn(options, 'query')) {
      this.state.query = String(options.query || '');
      if (this.search) this.search.value = this.state.query;
    } else if (this.search) this.state.query = String(this.search.value || '');
    if (Object.hasOwn(options, 'selectedEntryId')) this.state.selectedEntryId = options.selectedEntryId || null;
    return this.render({ selectBest: options.selectBest === true });
  }

  render({ selectBest = false } = {}) {
    const queryState = resolveCatalogQueryStateV62({
      catalogs: this.catalogs,
      query: this.state.query,
      activeNodeId: this.state.activeNodeId,
      selectedEntryId: selectBest ? null : this.state.selectedEntryId,
      predicate: this.predicate,
      limit: this.limit
    });
    const selectedStillVisible = queryState.records.some((record) => record.id === this.state.selectedEntryId);
    if (queryState.query && queryState.bestEntry && (selectBest || !selectedStillVisible)) {
      queryState.bestEntry.ancestryIds.forEach((id) => this.state.expandedNodeIds.add(id));
      this.state.selectedEntryId = queryState.bestEntry.id;
    } else if (!selectedStillVisible) {
      this.state.selectedEntryId = queryState.selectedEntry?.id || null;
    }
    this.renderTree();
    this.renderResults(queryState.records);
    this.renderDetail(getCatalogEntryV62(this.state.selectedEntryId));
    this.root.dataset.catalogCount = String(queryState.records.length);
    this.root.dataset.catalogQuery = queryState.query;
    return this.getSnapshot();
  }

  renderTree() {
    clearElement(this.tree);
    const label = createElement(this.document, 'p', 'catalog-v62__column-label', 'INDEX HIÉRARCHIQUE');
    this.tree.append(label);
    const list = createElement(this.document, 'ul', 'catalog-v62__tree-list');
    for (const root of CATALOG_TREE_V62.filter((entry) => this.catalogs.includes(entry.catalog))) {
      list.append(this.renderTreeNode(root, 0));
    }
    this.tree.append(list);
  }

  renderTreeNode(node, depth) {
    const item = createElement(this.document, 'li', 'catalog-v62__tree-item');
    const row = createElement(this.document, 'button', 'catalog-v62__tree-row');
    row.type = 'button';
    row.dataset.catalogNode = node.id;
    row.style.setProperty('--catalog-depth', String(depth));
    const expanded = this.state.expandedNodeIds.has(node.id);
    row.setAttribute('aria-expanded', node.children.length ? String(expanded) : 'false');
    row.classList.toggle('is-active', this.state.activeNodeId === node.id);
    row.classList.toggle('is-leaf', node.children.length === 0);
    if (this.state.selectedEntryId && nodeContainsEntry(node, this.state.selectedEntryId)) row.classList.add('is-in-path');
    const chevron = createElement(this.document, 'span', 'catalog-v62__tree-chevron', node.children.length ? (expanded ? '−' : '+') : '·');
    chevron.setAttribute('aria-hidden', 'true');
    const text = createElement(this.document, 'span', 'catalog-v62__tree-name', node.label === CATALOG_UNKNOWN_V62 ? UNKNOWN_LABEL : node.label);
    if (node.label === CATALOG_UNKNOWN_V62) text.classList.add('catalog-v62__unknown');
    const count = createElement(this.document, 'span', 'catalog-v62__tree-count', String(node.count));
    row.append(chevron, text, count);
    item.append(row);
    if (node.children.length) {
      const children = createElement(this.document, 'ul', 'catalog-v62__tree-list');
      children.hidden = !expanded;
      for (const child of node.children) children.append(this.renderTreeNode(child, depth + 1));
      item.append(children);
    }
    return item;
  }

  renderResults(records) {
    this.animator.clear();
    clearElement(this.list);
    const header = createElement(this.document, 'header', 'catalog-v62__results-header');
    header.append(
      createElement(this.document, 'p', 'catalog-v62__column-label', 'ENTRÉES'),
      createElement(this.document, 'span', 'catalog-v62__result-count', `${records.length} RÉSULTAT${records.length > 1 ? 'S' : ''}`)
    );
    this.list.append(header);
    if (!records.length) {
      const empty = createElement(this.document, 'p', 'catalog-v62__empty', this.emptyMessage);
      empty.setAttribute('role', 'status');
      this.list.append(empty);
      return;
    }
    const grid = createElement(this.document, 'div', 'catalog-v62__card-grid');
    for (const record of records) grid.append(this.renderCard(record));
    this.list.append(grid);
  }

  renderCard(record) {
    const card = createElement(this.document, 'article', 'catalog-v62__card');
    card.classList.toggle('is-selected', record.id === this.state.selectedEntryId);
    card.dataset.catalogEntryCard = record.id;
    const select = createElement(this.document, 'button', 'catalog-v62__card-select');
    select.type = 'button';
    select.dataset.catalogEntry = record.id;
    select.setAttribute('aria-pressed', String(record.id === this.state.selectedEntryId));
    const media = createElement(this.document, 'div', 'catalog-v62__card-media');
    if (record.visual) this.animator.mount(media, record.visual, record.name);
    else {
      const noMedia = createElement(this.document, 'span', 'catalog-v62__media-status', 'MÉDIA VISUEL NON DOCUMENTÉ');
      media.append(noMedia);
    }
    const body = createElement(this.document, 'span', 'catalog-v62__card-body');
    body.append(
      createElement(this.document, 'span', 'catalog-v62__eyebrow', `${CATALOG_LABELS_V62[record.catalog]} · ${record.taxonomy.family === CATALOG_UNKNOWN_V62 ? UNKNOWN_LABEL : record.taxonomy.family}`),
      createElement(this.document, 'strong', 'catalog-v62__card-title', record.name),
      createElement(this.document, 'span', 'catalog-v62__card-type', record.taxonomy.type === CATALOG_UNKNOWN_V62 ? UNKNOWN_LABEL : record.taxonomy.type),
      createElement(this.document, 'span', 'catalog-v62__card-id', record.id)
    );
    select.append(media, body);
    card.append(select);
    const actions = normalizeCatalogActionsV62(this.getActions(record));
    if (actions.length) card.append(this.renderActions(record, actions, 'catalog-v62__card-actions'));
    return card;
  }

  renderActions(record, actions, className) {
    const row = createElement(this.document, 'div', className);
    for (const action of actions) {
      const button = createElement(this.document, 'button', `button compact catalog-v62__action ${action.className}`.trim(), action.label);
      button.type = 'button';
      button.dataset.catalogAction = action.id;
      button.dataset.catalogEntryId = record.id;
      button.disabled = action.disabled;
      if (action.title) button.title = action.title;
      if (action.variant !== 'default') button.dataset.variant = action.variant;
      for (const [key, value] of Object.entries(action.dataset)) button.dataset[key] = value;
      row.append(button);
    }
    return row;
  }

  renderDetail(record) {
    clearElement(this.detail);
    this.detail.append(createElement(this.document, 'p', 'catalog-v62__column-label', 'DOSSIER'));
    if (!record || !this.catalogs.includes(record.catalog) || (this.predicate && !this.predicate(record))) {
      this.detail.append(createElement(this.document, 'p', 'catalog-v62__empty', 'Sélectionnez une entrée documentée.'));
      return;
    }
    const header = createElement(this.document, 'header', 'catalog-v62__detail-header');
    if (record.visual) this.animator.mount(header, record.visual, record.name, { detail: true });
    const heading = createElement(this.document, 'div', 'catalog-v62__detail-heading');
    heading.append(
      createElement(this.document, 'span', 'catalog-v62__eyebrow', CATALOG_LABELS_V62[record.catalog]),
      createElement(this.document, 'h3', '', record.name),
      createElement(this.document, 'code', '', record.id)
    );
    header.append(heading);
    this.detail.append(header, renderTaxonomyPath(this.document, record));

    const canonSection = this.renderSection('FAITS DE RÉFÉRENCE', 'canon');
    const canonData = createElement(this.document, 'dl', 'catalog-v62__data-list');
    appendDefinitionRows(this.document, canonData, record.canonFacts.source, { status: 'canon' });
    appendDefinitionRows(this.document, canonData, record.canonFacts.claims, { status: 'canon' });
    canonSection.append(canonData);
    this.detail.append(canonSection);

    const gameplaySection = this.renderSection('STATISTIQUES DE GAMEPLAY', 'gameplay');
    const gameplayData = createElement(this.document, 'dl', 'catalog-v62__data-list');
    appendDefinitionRows(this.document, gameplayData, record.gameplayStats, { status: 'gameplay' });
    gameplaySection.append(gameplayData);
    this.detail.append(gameplaySection);

    this.renderMediaSection(record);
    this.renderBiologySection(record);
    this.renderSizeSection(record);

    const actions = normalizeCatalogActionsV62(this.getActions(record));
    if (actions.length) this.detail.append(this.renderActions(record, actions, 'catalog-v62__detail-actions'));
  }

  renderSection(title, kind = '') {
    const section = createElement(this.document, 'section', 'catalog-v62__detail-section');
    if (kind) section.dataset.sectionKind = kind;
    section.append(createElement(this.document, 'h4', '', title));
    return section;
  }

  renderMediaSection(record) {
    const section = this.renderSection('MÉDIA ET IDENTITÉ VISUELLE', 'media');
    const data = createElement(this.document, 'dl', 'catalog-v62__data-list');
    if (record.visual) {
      appendDefinitionRows(this.document, data, {
        sheetId: record.visual.sheetId,
        clip: record.visual.idleClip?.clip?.id,
        referenceStatus: record.visual.identity?.referenceStatus,
        identityStatus: record.visual.identity?.status,
        exact: record.visual.identity?.exact,
        canonExact: record.visual.identity?.canonExact
      });
    } else {
      const row = createElement(this.document, 'div', 'catalog-v62__data-row');
      row.append(
        createElement(this.document, 'dt', '', 'Média'),
        createElement(this.document, 'dd', 'catalog-v62__unknown', 'AUCUN MÉDIA VISUEL DOCUMENTÉ')
      );
      data.append(row);
    }
    section.append(data);
    this.detail.append(section);
  }

  renderBiologySection(record) {
    if (record.catalog !== 'enemies') return;
    const relations = getBiologicalRelationsV62(record.id);
    const section = this.renderSection('RELATIONS BIOLOGIQUES', 'biology');
    if (!relations.length) {
      section.append(createElement(this.document, 'p', 'catalog-v62__fact-note', 'Aucune relation biologique sourcée dans le registre actuel.'));
    } else {
      const list = createElement(this.document, 'ul', 'catalog-v62__relations');
      for (const relation of relations) {
        const item = createElement(this.document, 'li');
        const button = createElement(this.document, 'button', 'catalog-v62__relation');
        button.type = 'button';
        button.dataset.catalogRelationEntry = relation.relatedEntry.id;
        const relationLabel = BIOLOGY_RELATION_LABELS[relation.type] || relation.type;
        const direction = relation.direction === 'incoming' ? `${relation.relatedEntry.name} ${relationLabel}` : `${relationLabel} ${relation.relatedEntry.name}`;
        button.append(
          createElement(this.document, 'span', '', direction),
          createElement(this.document, 'small', '', relation.status)
        );
        item.append(button);
        list.append(item);
      }
      section.append(list);
    }
    this.detail.append(section);
  }

  renderSizeSection(record) {
    const comparison = getHumanSizeComparisonV62(record.id, this.dimensions ? { dimensions: this.dimensions } : {});
    const section = this.renderSection('COMPARAISON HUMAINE', 'dimensions');
    if (!comparison) {
      section.append(createElement(this.document, 'p', 'catalog-v62__fact-note', 'Aucune dimension physique vérifiée et sourcée : comparateur masqué.'));
      this.detail.append(section);
      return;
    }
    const comparisonBox = createElement(this.document, 'div', 'catalog-v62__size-comparison');
    const human = createElement(this.document, 'div', 'catalog-v62__size-figure catalog-v62__size-figure--human');
    const subject = createElement(this.document, 'div', 'catalog-v62__size-figure catalog-v62__size-figure--subject');
    human.style.setProperty('--size-ratio', String(1 / Math.max(1, comparison.ratioToHuman)));
    subject.style.setProperty('--size-ratio', String(Math.min(1, comparison.ratioToHuman)));
    human.append(createElement(this.document, 'span', '', `${comparison.humanHeightMeters} m`));
    subject.append(createElement(this.document, 'span', '', `${comparison.heightMeters} m`));
    comparisonBox.append(human, subject);
    section.append(comparisonBox, createElement(this.document, 'p', 'catalog-v62__fact-note', `Source vérifiée : ${comparison.source}`));
    this.detail.append(section);
  }

  handleClick(event) {
    const relation = event.target?.closest?.('[data-catalog-relation-entry]');
    if (relation && this.root.contains(relation)) {
      this.selectEntry(relation.dataset.catalogRelationEntry, { focus: true });
      return;
    }
    const entryButton = event.target?.closest?.('[data-catalog-entry]');
    if (entryButton && this.root.contains(entryButton)) {
      this.selectEntry(entryButton.dataset.catalogEntry);
      return;
    }
    const nodeButton = event.target?.closest?.('[data-catalog-node]');
    if (nodeButton && this.root.contains(nodeButton)) {
      this.selectNode(nodeButton.dataset.catalogNode);
      return;
    }
    const actionButton = event.target?.closest?.('[data-catalog-action]');
    if (actionButton && this.root.contains(actionButton)) {
      const record = getCatalogEntryV62(actionButton.dataset.catalogEntryId);
      if (record && this.onAction) this.onAction({
        id: actionButton.dataset.catalogAction,
        record,
        button: actionButton,
        event
      });
    }
  }

  destroy() {
    this.animator.clear();
    this.search?.removeEventListener?.('input', this.boundInput);
    this.root.removeEventListener('click', this.boundClick);
    this.root.classList.remove('catalog-v62');
  }
}

export function createCatalogWorkbenchV62(options) {
  return new CatalogWorkbenchV62(options);
}
