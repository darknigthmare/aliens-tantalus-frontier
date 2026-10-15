import { QZ17_COLLECTABLES_SHEET_V68, resolveQz17CollectableCellV68 } from './narrative-collectables-visuals-v68.js';
import { resolveNarrativeMediaPlaybackV132 } from './narrative-evidence-v132.js';

const asArray = (value) => Array.isArray(value) ? value : [];
const asText = (value, fallback = '') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};
const identifier = (value) => asText(value).replace(/[^a-z0-9_-]+/giu, '-').replace(/^-+|-+$/gu, '').slice(0, 120);
let narrativeArchivesUiInstanceV68 = 0;

function archiveUiIdPrefixV68(root, requestedPrefix = '') {
  const explicit = identifier(requestedPrefix);
  if (explicit) return explicit;
  const rootId = identifier(root?.id || root?.getAttribute?.('id'));
  if (rootId) return rootId;
  narrativeArchivesUiInstanceV68 += 1;
  return `narrative-archives-instance-v68-${narrativeArchivesUiInstanceV68}`;
}

const mediaLabels = Object.freeze({
  text: 'DOCUMENT',
  pda: 'PDA',
  email: 'COURRIEL',
  blackbox: 'BOÎTE NOIRE',
  'black-box': 'BOÎTE NOIRE',
  seal: 'SCELLÉ CARGO',
  'cargo-seal': 'SCELLÉ CARGO',
  image: 'IMAGE',
  specimen: 'PRÉLÈVEMENT'
});

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

function ledgerIds(source, key) {
  const value = source?.[key];
  if (Array.isArray(value)) return new Set(value.map(String));
  if (value && typeof value === 'object') return new Set(Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([id]) => id));
  return new Set();
}

function normalizeClaim(raw, entry, index) {
  if (typeof raw === 'string') {
    return Object.freeze({ id: `${entry.id}-claim-${index + 1}`, entryId: entry.id, entryTitle: entry.title, subject: 'Déclaration', statement: raw, stance: '', confidence: null });
  }
  const claim = raw && typeof raw === 'object' ? raw : {};
  return Object.freeze({
    id: identifier(claim.id) || `${entry.id}-claim-${index + 1}`,
    entryId: entry.id,
    entryTitle: entry.title,
    subject: asText(claim.subject || claim.label || claim.topic, 'Déclaration'),
    statement: asText(claim.statement || claim.text || claim.value || claim.claim, 'Contenu classifié.'),
    stance: asText(claim.stance || claim.polarity || claim.status),
    confidence: Number.isFinite(Number(claim.confidence)) ? Math.max(0, Math.min(100, Number(claim.confidence))) : null
  });
}

function normalizeEntry(raw, index, discoveredIds, readIds) {
  const record = raw?.collectable && typeof raw.collectable === 'object' ? { ...raw.collectable, ...raw } : (raw || {});
  const id = identifier(record.id) || `archive-v68-${index + 1}`;
  const explicitlyDiscovered = record.discovered ?? record.isDiscovered ?? record.unlocked;
  // Absence of discovery is not permission to reveal the catalogue on a new save.
  const discovered = explicitlyDiscovered === undefined ? discoveredIds.has(id) : Boolean(explicitlyDiscovered);
  const explicitlyRead = record.read ?? record.isRead;
  const type = identifier(record.type || record.kind || record.mediaType || 'text').toLowerCase() || 'text';
  const atlasCell = resolveQz17CollectableCellV68(id);
  const entry = {
    id,
    title: asText(record.title || record.name, `Archive ${index + 1}`),
    type,
    typeLabel: asText(record.typeLabel, mediaLabels[type] || 'DOCUMENT'),
    source: asText(record.source || record.author || record.sender || record.origin, 'SOURCE INCONNUE'),
    location: asText(record.location || record.placement?.room || record.physical?.zoneId || record.zone),
    timestamp: asText(record.timestamp || record.date || record.timecode || record.sourceDetails?.recordedAt),
    summary: asText(record.summary || record.excerpt || record.description, 'Aperçu indisponible.'),
    body: asText(record.body || record.content || record.text || record.transcript, 'Contenu classifié.'),
    imagePath: asText(record.imagePath || record.image || record.visual?.path),
    imageAlt: asText(record.imageAlt || record.visual?.alt, `Illustration du dossier ${asText(record.title || record.name, index + 1)}`),
    atlasVisual: atlasCell ? Object.freeze({
      path: QZ17_COLLECTABLES_SHEET_V68.path,
      columns: QZ17_COLLECTABLES_SHEET_V68.columns,
      rows: QZ17_COLLECTABLES_SHEET_V68.rows,
      column: atlasCell.column,
      row: atlasCell.row,
      alt: `Preuve physique récupérée : ${asText(record.shortTitle || record.title || record.name, `archive ${index + 1}`)}`
    }) : null,
    discovered,
    read: explicitlyRead === undefined ? readIds.has(id) : Boolean(explicitlyRead),
    media: discovered ? resolveNarrativeMediaPlaybackV132(record.media) : null,
    pendingMedia: discovered && record.media && !resolveNarrativeMediaPlaybackV132(record.media) ? {
      title: asText(record.media.title), description: asText(record.media.description)
    } : null,
    provenance: asText(record.provenance),
    claims: []
  };
  entry.claims = asArray(record.claims).map((claim, claimIndex) => normalizeClaim(claim, entry, claimIndex));
  return Object.freeze(entry);
}

function relationEndpoint(relation, side) {
  const aliases = side === 'left'
    ? ['leftClaimId', 'fromClaimId', 'sourceClaimId', 'left', 'from', 'source']
    : ['rightClaimId', 'toClaimId', 'targetClaimId', 'right', 'to', 'target'];
  for (const key of aliases) {
    const candidate = relation?.[key];
    if (typeof candidate === 'string') return candidate;
    if (candidate && typeof candidate === 'object') return candidate.claimId || candidate.id || '';
  }
  return '';
}

function normalizedDecisionIds(state) {
  const source = state?.ledger || state?.archive || state || {};
  const ids = new Set([
    ...ledgerIds(source, 'decisionIds'),
    ...ledgerIds(source, 'appliedDecisionIds'),
    ...ledgerIds(source, 'decisions')
  ]);
  for (const decision of asArray(source.decisions)) if (decision?.applied || decision?.completed) ids.add(String(decision.id));
  return ids;
}

export function normalizeNarrativeArchivesUiStateV68(rawState = {}) {
  const state = rawState && typeof rawState === 'object' ? rawState : {};
  const ledger = state.ledger || state.archive || state;
  const discoveredIds = new Set([
    ...ledgerIds(ledger, 'discoveredIds'),
    ...ledgerIds(ledger, 'discovered'),
    ...ledgerIds(state, 'discoveredIds')
  ]);
  const readIds = new Set([
    ...ledgerIds(ledger, 'readIds'),
    ...ledgerIds(ledger, 'read'),
    ...ledgerIds(state, 'readIds')
  ]);
  const sourceEntries = asArray(state.entries).length
    ? state.entries
    : asArray(state.collectables).length
      ? state.collectables
      : asArray(state.items);
  const entries = sourceEntries.map((entry, index) => normalizeEntry(entry, index, discoveredIds, readIds)).filter((entry) => entry.discovered);
  const claimMap = new Map(entries.flatMap((entry) => entry.claims.map((claim) => [claim.id, claim])));
  const normalizedRelations = asArray(state.relations)
    .filter((relation) => relation?.active !== false)
    .map((relation, index) => {
    const rawType = asText(relation?.type || relation?.relation || relation?.status);
    const type = /contradict|conflict|oppos/iu.test(rawType)
      ? 'contradicts'
      : /qualif|inconclusive|nuanc|context/iu.test(rawType)
        ? 'qualifies'
        : '';
    if (!type) return null;
    const leftId = relationEndpoint(relation, 'left');
    const rightId = relationEndpoint(relation, 'right');
    const left = claimMap.get(leftId) || null;
    const right = claimMap.get(rightId) || null;
    if (!left || !right) return null;
    return Object.freeze({
      id: identifier(relation.id) || `${type === 'qualifies' ? 'qualification' : 'contradiction'}-v68-${index + 1}`,
      type,
      left,
      right,
      leftText: left.statement,
      rightText: right.statement,
      label: asText(relation.label || relation.title || relation.explanation, type === 'qualifies' ? 'Portée de la preuve à nuancer' : 'Contradiction détectée')
    });
  }).filter(Boolean);
  const relations = normalizedRelations.filter((relation) => relation.type === 'contradicts');
  const qualifications = normalizedRelations.filter((relation) => relation.type === 'qualifies');
  const evidenceIds = new Set([...entries.map((entry) => entry.id), ...claimMap.keys()]);
  const completedDecisionIds = normalizedDecisionIds(state);
  const unlockedFlags = new Set([
    ...ledgerIds(ledger, 'unlockedFlags'),
    ...ledgerIds(state, 'unlockedFlags')
  ]);
  const decisionSource = asArray(state.decisionDefinitions).length ? state.decisionDefinitions : asArray(state.decisions);
  const decisions = decisionSource.map((decision, index) => {
    const id = identifier(decision.id) || `decision-v68-${index + 1}`;
    const requirements = asArray(decision.requirements || decision.requiredClaimIds || decision.evidenceIds).map(String);
    const unlockFlag = asText(decision.routeUnlockFlag || decision.unlockFlag || decision.flag);
    const applied = Boolean(decision.selected || decision.applied || decision.completed || completedDecisionIds.has(id) || (unlockFlag && unlockedFlags.has(unlockFlag)));
    const lockedByChoice = Boolean(decision.lockedByChoice);
    const available = decision.available !== false && !applied && !lockedByChoice
      && requirements.every((requirement) => evidenceIds.has(requirement));
    return Object.freeze({
      id,
      label: asText(decision.label || decision.title, 'CONFRONTER LES DONNÉES'),
      description: asText(decision.description || decision.summary, 'Comparer les preuves avant de confirmer cette conclusion.'),
      requirements: Object.freeze(requirements),
      missingRequirements: Object.freeze(requirements.filter((requirement) => !evidenceIds.has(requirement))),
      unlockFlag,
      available,
      applied,
      lockedByChoice,
      reason: asText(decision.reason), journalOnly: Boolean(decision.journalOnly || state.schema === 132 && !unlockFlag)
    });
  });
  return Object.freeze({
    entries: Object.freeze(entries),
    relations: Object.freeze(relations),
    qualifications: Object.freeze(qualifications),
    decisions: Object.freeze(decisions),
    unreadCount: entries.filter((entry) => !entry.read).length,
    chains: Object.freeze(asArray(state.chains).map(chain => Object.freeze({ id: identifier(chain.id), title: asText(chain.title),
      total: asArray(chain.requirements).length, collected: Number(chain.collected) || 0, read: Number(chain.read) || 0,
      complete: chain.complete === true, hint: asText(chain.hint) }))),
    journal: Object.freeze(asArray(state.journal).map(entry => Object.freeze({ id: identifier(entry.id), kind: asText(entry.kind),
      target: identifier(entry.target), label: asText(entry.label) })).filter(entry => entry.label)),
    mediaNotice: asText(state.mediaCoverage?.notice),
    unlockedFlags: Object.freeze([...unlockedFlags])
  });
}

export function createOpenArchivesEventV68(entryId = '') {
  const detail = identifier(entryId) ? { entryId: identifier(entryId) } : {};
  if (typeof CustomEvent === 'function') return new CustomEvent('atf:open-archives', { detail });
  return Object.freeze({ type: 'atf:open-archives', detail: Object.freeze(detail) });
}

export class NarrativeArchivesUiV68 {
  constructor({ root, getState, onMarkRead, onDecision, onMediaPlayed, idPrefix = '', focusFallback = null, documentRef = root?.ownerDocument || globalThis.document } = {}) {
    if (!root || !documentRef) throw new TypeError('NarrativeArchivesUiV68 requiert un élément racine.');
    if (typeof getState !== 'function') throw new TypeError('NarrativeArchivesUiV68 requiert getState.');
    this.root = root;
    this.document = documentRef;
    this.idPrefix = archiveUiIdPrefixV68(root, idPrefix);
    this.getState = getState;
    this.onMarkRead = typeof onMarkRead === 'function' ? onMarkRead : () => null;
    this.onDecision = typeof onDecision === 'function' ? onDecision : () => null;
    this.onMediaPlayed = typeof onMediaPlayed === 'function' ? onMediaPlayed : () => null;
    this.replayV132 = null;
    this.focusFallback = focusFallback;
    this.selectedId = '';
    this.query = '';
    this.type = 'all';
    this.unreadOnly = false;
    this.pendingAction = '';
    this.lastStatus = '';
    this.boundClick = (event) => this.handleClick(event);
    this.boundInput = (event) => this.handleInput(event);
    this.boundChange = (event) => this.handleChange(event);
    this.boundKeydown = (event) => this.handleKeydown(event);
    this.root.addEventListener('click', this.boundClick);
    this.root.addEventListener('input', this.boundInput);
    this.root.addEventListener('change', this.boundChange);
    this.root.addEventListener('keydown', this.boundKeydown);
    this.render();
  }

  destroy() {
    this.replayV132?.destroy(); this.replayV132 = null;
    this.root.removeEventListener('click', this.boundClick);
    this.root.removeEventListener('input', this.boundInput);
    this.root.removeEventListener('change', this.boundChange);
    this.root.removeEventListener('keydown', this.boundKeydown);
    this.root.replaceChildren();
  }

  state() { return normalizeNarrativeArchivesUiStateV68(this.getState()); }

  domId(suffix) { return `${this.idPrefix}-${identifier(suffix)}`; }

  captureFocus() {
    const active = this.document?.activeElement;
    if (!active || !this.root.contains(active)) return null;
    const entry = active.closest?.('[data-archive-entry]');
    const decision = active.closest?.('[data-archive-decision]');
    let selector = '';
    if (entry) selector = `[data-archive-entry="${entry.dataset.archiveEntry}"]`;
    else if (decision) selector = `[data-archive-decision="${decision.dataset.archiveDecision}"]`;
    else if (active.matches?.('[data-archive-search]')) selector = '[data-archive-search]';
    else if (active.matches?.('[data-archive-type]')) selector = '[data-archive-type]';
    else if (active.matches?.('[data-archive-unread]')) selector = '[data-archive-unread]';
    else if (active.getAttribute?.('id')) selector = `#${active.getAttribute('id')}`;
    return {
      selector,
      selectionStart: Number.isInteger(active.selectionStart) ? active.selectionStart : null,
      selectionEnd: Number.isInteger(active.selectionEnd) ? active.selectionEnd : null
    };
  }

  restoreFocus(focusState) {
    if (!focusState) return false;
    const candidate = focusState.selector ? this.root.querySelector(focusState.selector) : null;
    if (candidate && !candidate.disabled && !candidate.hidden) {
      candidate.focus?.({ preventScroll: true });
      if (focusState.selectionStart !== null) candidate.setSelectionRange?.(focusState.selectionStart, focusState.selectionEnd);
      if (this.document?.activeElement === candidate) return true;
    }
    const configuredFallback = typeof this.focusFallback === 'function' ? this.focusFallback() : this.focusFallback;
    const fallback = configuredFallback || this.root.querySelector('[data-archive-search]');
    if (!fallback || fallback.disabled || fallback.hidden) return false;
    fallback.focus?.({ preventScroll: true });
    return this.document?.activeElement === fallback;
  }

  filteredEntries(state = this.state()) {
    const query = this.query.trim().toLocaleLowerCase('fr');
    return state.entries.filter((entry) => {
      if (this.type !== 'all' && entry.type !== this.type) return false;
      if (this.unreadOnly && entry.read) return false;
      if (!query) return true;
      return [entry.title, entry.source, entry.location, entry.summary, entry.body, ...entry.claims.flatMap((claim) => [claim.subject, claim.statement])]
        .join(' ').toLocaleLowerCase('fr').includes(query);
    });
  }

  open(entryId = '', { markRead = false } = {}) {
    const state = this.state();
    const requested = identifier(entryId);
    const entry = state.entries.find((candidate) => candidate.id === requested) || state.entries.find((candidate) => !candidate.read) || state.entries[0];
    this.selectedId = entry?.id || '';
    this.render();
    const selected = this.root.querySelector(`[data-archive-entry="${this.selectedId}"]`);
    selected?.focus?.({ preventScroll: true });
    if (markRead && entry && !entry.read) void this.runAction('read', entry.id, this.onMarkRead);
    return Boolean(entry);
  }

  async runAction(kind, id, callback) {
    if (this.pendingAction) return null;
    this.pendingAction = `${kind}:${id}`;
    this.lastStatus = kind === 'read' ? 'Ouverture du dossier…' : kind === 'media' ? 'Lecture de la séquence conservée…' : 'Analyse des preuves…';
    this.render();
    try {
      const result = await callback(id);
      const rejected = result === false || result?.applied === false || result?.ok === false;
      const fallback = rejected ? 'Action non appliquée.' : result === null || result === undefined
        ? 'Aucune modification confirmée.' : kind === 'read' ? 'Dossier marqué comme lu.' : kind === 'media' ? 'Séquence visionnée.' : 'Conclusion enregistrée.';
      this.lastStatus = asText(result?.message || (typeof result?.result === 'string' ? result.result : ''), fallback);
      return result;
    } catch (error) {
      this.lastStatus = asText(error?.message, 'Action impossible.');
      return null;
    } finally {
      this.pendingAction = '';
      this.render();
    }
  }

  handleClick(event) {
    const entryButton = event.target?.closest?.('[data-archive-entry]');
    if (entryButton && this.root.contains(entryButton)) {
      this.selectedId = entryButton.dataset.archiveEntry;
      const entry = this.state().entries.find((candidate) => candidate.id === this.selectedId);
      this.render();
      if (entry && !entry.read) void this.runAction('read', entry.id, this.onMarkRead);
      return;
    }
    const decisionButton = event.target?.closest?.('[data-archive-decision]');
    if (decisionButton && this.root.contains(decisionButton) && !decisionButton.disabled) {
      void this.runAction('decision', decisionButton.dataset.archiveDecision, this.onDecision);
    }
  }

  handleInput(event) {
    if (!event.target?.matches?.('[data-archive-search]')) return;
    const selectionStart = Number.isInteger(event.target.selectionStart) ? event.target.selectionStart : String(event.target.value || '').length;
    const selectionEnd = Number.isInteger(event.target.selectionEnd) ? event.target.selectionEnd : selectionStart;
    this.query = asText(event.target.value);
    this.render();
    const search = this.root.querySelector('[data-archive-search]');
    search?.focus?.({ preventScroll: true });
    search?.setSelectionRange?.(selectionStart, selectionEnd);
  }

  handleChange(event) {
    if (!event.target?.matches?.('[data-archive-type], [data-archive-unread]')) return;
    if (event.target?.matches?.('[data-archive-type]')) this.type = asText(event.target.value, 'all');
    if (event.target?.matches?.('[data-archive-unread]')) this.unreadOnly = Boolean(event.target.checked);
    this.render();
  }

  handleKeydown(event) {
    const current = event.target?.closest?.('[data-archive-entry]');
    if (!current || !this.root.contains(current) || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...this.root.querySelectorAll('[data-archive-entry]')];
    if (!buttons.length) return;
    const currentIndex = Math.max(0, buttons.indexOf(current));
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault();
    this.selectedId = buttons[index].dataset.archiveEntry;
    this.render();
    this.root.querySelector(`[data-archive-entry="${this.selectedId}"]`)?.focus?.({ preventScroll: true });
  }

  render() {
    const previousReplay = this.replayV132 && { id: this.replayV132.media.id, time: this.replayV132.time, playing: this.replayV132.playing };
    this.replayV132?.destroy(); this.replayV132 = null;
    const focusState = this.captureFocus();
    const state = this.state();
    const filtered = this.filteredEntries(state);
    if (!state.entries.some((entry) => entry.id === this.selectedId)) this.selectedId = state.entries.find((entry) => !entry.read)?.id || state.entries[0]?.id || '';
    const selected = state.entries.find((entry) => entry.id === this.selectedId) || null;
    this.root.className = 'narrative-archives-v68';
    this.root.setAttribute('aria-label', 'Bibliothèque des archives de mission');
    this.root.setAttribute('aria-busy', this.pendingAction ? 'true' : 'false');

    const toolbar = element(this.document, 'div', { className: 'archives-toolbar-v68' });
    const summary = element(this.document, 'div', { className: 'archives-summary-v68' });
    summary.append(
      element(this.document, 'strong', { text: `${state.entries.length} PREUVE${state.entries.length === 1 ? '' : 'S'}` }),
      element(this.document, 'span', { text: `${state.unreadCount} NON LUE${state.unreadCount === 1 ? '' : 'S'}` }),
      element(this.document, 'span', { text: `${state.relations.length} CONTRADICTION${state.relations.length === 1 ? '' : 'S'}` })
    );
    const searchLabel = element(this.document, 'label', { className: 'archive-control-v68', text: 'RECHERCHER' });
    const search = element(this.document, 'input', { attributes: { type: 'search', value: this.query, placeholder: 'Source, lieu, déclaration…', 'data-archive-search': '', 'aria-label': 'Rechercher dans les archives' } });
    search.value = this.query;
    searchLabel.append(search);
    const typeLabel = element(this.document, 'label', { className: 'archive-control-v68', text: 'TYPE' });
    const typeSelect = element(this.document, 'select', { attributes: { 'data-archive-type': '', 'aria-label': 'Filtrer les archives par type' } });
    const types = [...new Set(state.entries.map((entry) => entry.type))];
    const allOption = element(this.document, 'option', { text: 'Tous les documents', attributes: { value: 'all' } });
    allOption.value = 'all';
    typeSelect.append(allOption);
    for (const type of types) {
      const option = element(this.document, 'option', { text: state.entries.find((entry) => entry.type === type)?.typeLabel || type, attributes: { value: type } });
      option.value = type;
      typeSelect.append(option);
    }
    typeSelect.value = this.type;
    typeLabel.append(typeSelect);
    const unreadLabel = element(this.document, 'label', { className: 'archive-unread-toggle-v68' });
    const unread = element(this.document, 'input', { attributes: { type: 'checkbox', 'data-archive-unread': '' } });
    unread.type = 'checkbox';
    unread.checked = this.unreadOnly;
    unreadLabel.append(unread, element(this.document, 'span', { text: 'NON LUS UNIQUEMENT' }));
    toolbar.append(summary, searchLabel, typeLabel, unreadLabel);

    const layout = element(this.document, 'div', { className: 'archives-layout-v68' });
    const list = element(this.document, 'nav', { className: 'archives-list-v68', attributes: { 'aria-label': 'Dossiers récupérés' } });
    if (!filtered.length) {
      list.append(element(this.document, 'p', { className: 'archives-empty-v68', text: state.entries.length ? 'Aucun dossier ne correspond aux filtres.' : 'Aucune archive récupérée. Explorez les missions et leurs postes pour alimenter ce terminal.' }));
    }
    for (const entry of filtered) {
      const button = element(this.document, 'button', {
        className: `archive-entry-v68${entry.id === this.selectedId ? ' active' : ''}${entry.read ? '' : ' unread'}`,
        attributes: {
          type: 'button',
          'data-archive-entry': entry.id,
          'aria-current': entry.id === this.selectedId ? 'true' : 'false',
          'aria-label': `${entry.read ? '' : 'Non lu, '}${entry.title}, ${entry.typeLabel}`
        }
      });
      button.append(
        element(this.document, 'span', { className: 'archive-entry-meta-v68', text: `${entry.typeLabel}${entry.timestamp ? ` · ${entry.timestamp}` : ''}` }),
        element(this.document, 'strong', { text: entry.title }),
        element(this.document, 'span', { text: entry.source }),
        element(this.document, 'i', { text: entry.read ? 'LU' : 'NOUVEAU' })
      );
      list.append(button);
    }

    const detail = element(this.document, 'article', { className: 'archive-detail-v68', attributes: { 'aria-live': 'polite', tabindex: '-1' } });
    if (!selected) {
      detail.append(element(this.document, 'h3', { text: 'TERMINAL VIDE' }), element(this.document, 'p', { text: 'Les documents récupérés apparaîtront ici sans contenu simulé.' }));
    } else {
      const meta = [selected.typeLabel, selected.source, selected.location, selected.timestamp].filter(Boolean).join(' · ');
      detail.append(element(this.document, 'p', { className: 'eyebrow', text: meta }), element(this.document, 'h3', { text: selected.title }));
      if (selected.provenance) detail.append(element(this.document, 'p', { className: 'archive-provenance-v132', text: 'Dossier original du Tantalus.' }));
      if (selected.atlasVisual) {
        const visual = element(this.document, 'div', {
          className: 'archive-evidence-visual-v68',
          attributes: { role: 'img', 'aria-label': selected.atlasVisual.alt, 'data-archive-visual': selected.id }
        });
        visual.style.backgroundImage = `url("${selected.atlasVisual.path}")`;
        visual.style.backgroundSize = `${selected.atlasVisual.columns * 100}% ${selected.atlasVisual.rows * 100}%`;
        visual.style.backgroundPosition = `${selected.atlasVisual.column ? 100 : 0}% ${selected.atlasVisual.row ? 100 : 0}%`;
        detail.append(visual);
      } else if (selected.imagePath) {
        detail.append(element(this.document, 'img', { className: 'archive-image-v68', attributes: { src: selected.imagePath, alt: selected.imageAlt, loading: 'lazy', decoding: 'async' } }));
      }
      detail.append(element(this.document, 'p', { className: 'archive-lead-v68', text: selected.summary }));
      if (selected.media) {
        const replay = element(this.document, 'section', { className: 'archive-replay-v132', attributes: { 'aria-label': selected.media.title } });
        detail.append(replay);
        this.replayV132 = new NarrativeEvidenceReplayV132({ root: replay, media: selected.media,
          idPrefix: this.domId(`replay-${selected.id}`), onPlayed: id => this.runAction('media', id, this.onMediaPlayed) });
        if (previousReplay?.id === selected.media.id) {
          this.replayV132.time = Math.min(previousReplay.time, this.replayV132.capture.duration);
          this.replayV132.draw(); this.replayV132.pause();
          if (previousReplay.playing) this.replayV132.play();
        }
      } else if (selected.pendingMedia) detail.append(element(this.document, 'p', { className: 'archive-media-pending-v132',
        text: 'Relevé de déplacement en attente : reprendre le terrain pour laisser la boîte noire conserver deux observations réelles. Aucun audio ou film historique n’est joint.' }));
      for (const paragraph of selected.body.split(/\n{2,}/u).map((value) => value.trim()).filter(Boolean)) detail.append(element(this.document, 'p', { text: paragraph }));
      if (selected.claims.length) {
        const claimsHeading = element(this.document, 'h4', { text: 'DÉCLARATIONS INDEXÉES' });
        const claims = element(this.document, 'dl', { className: 'archive-claims-v68' });
        for (const claim of selected.claims) {
          claims.append(
            element(this.document, 'dt', { text: claim.subject }),
            element(this.document, 'dd', { text: `${claim.statement}${claim.confidence === null ? '' : ` · CONFIANCE ${Math.round(claim.confidence)}%`}` })
          );
        }
        detail.append(claimsHeading, claims);
      }
    }
    layout.append(list, detail);

    const contradictionsHeadingId = this.domId('contradictions');
    const investigation = element(this.document, 'section', { className: 'archive-investigation-v68', attributes: { 'aria-labelledby': contradictionsHeadingId } });
    investigation.append(element(this.document, 'h3', { text: 'COMPARAISON DES SOURCES', attributes: { id: contradictionsHeadingId } }));
    const comparisons = element(this.document, 'div', { className: 'archive-comparisons-v68' });
    if (!state.relations.length) comparisons.append(element(this.document, 'p', { className: 'archives-empty-v68', text: 'Aucune contradiction vérifiable avec les preuves récupérées.' }));
    for (const relation of state.relations) {
      const article = element(this.document, 'article', { className: 'archive-comparison-v68' });
      article.append(element(this.document, 'h4', { text: relation.label }));
      const sides = element(this.document, 'div');
      const left = element(this.document, 'blockquote', { text: relation.leftText });
      left.append(element(this.document, 'cite', { text: relation.left?.entryTitle || relation.left?.entryId || 'SOURCE A' }));
      const right = element(this.document, 'blockquote', { text: relation.rightText });
      right.append(element(this.document, 'cite', { text: relation.right?.entryTitle || relation.right?.entryId || 'SOURCE B' }));
      sides.append(left, right);
      article.append(sides);
      comparisons.append(article);
    }
    investigation.append(comparisons);
    if (state.chains.length) {
      const chainSection = element(this.document, 'section', { className: 'archive-chains-v132', attributes: { 'aria-label': 'Enquêtes liées entre les missions' } });
      chainSection.append(element(this.document, 'h4', { text: 'ENQUÊTES ENTRE LES MISSIONS' }));
      for (const chain of state.chains) {
        const card = element(this.document, 'article', { className: 'archive-comparison-v68' });
        card.append(element(this.document, 'strong', { text: chain.title }),
          element(this.document, 'p', { text: `${chain.collected}/${chain.total} preuves · ${chain.read}/${chain.total} lues${chain.complete ? ' · Conclusion conservée' : ''}` }),
          element(this.document, 'p', { text: chain.hint }));
        chainSection.append(card);
      }
      investigation.append(chainSection);
    }
    if (state.qualifications.length) {
      const qualificationsHeadingId = this.domId('qualifications');
      const qualifications = element(this.document, 'section', { className: 'archive-qualifications-v68', attributes: { 'aria-labelledby': qualificationsHeadingId } });
      qualifications.append(element(this.document, 'h4', { text: 'QUALIFICATIONS ET LIMITES', attributes: { id: qualificationsHeadingId } }));
      for (const relation of state.qualifications) {
        const article = element(this.document, 'article', { className: 'archive-comparison-v68 archive-qualification-v68' });
        article.append(element(this.document, 'h4', { text: relation.label }));
        const sides = element(this.document, 'div');
        const left = element(this.document, 'blockquote', { text: relation.leftText });
        left.append(element(this.document, 'cite', { text: relation.left?.entryTitle || relation.left?.entryId || 'SOURCE A' }));
        const right = element(this.document, 'blockquote', { text: relation.rightText });
        right.append(element(this.document, 'cite', { text: relation.right?.entryTitle || relation.right?.entryId || 'SOURCE B' }));
        sides.append(left, right);
        article.append(sides);
        qualifications.append(article);
      }
      investigation.append(qualifications);
    }
    const actions = element(this.document, 'div', { className: 'archive-decisions-v68' });
    for (const decision of state.decisions) {
      const decisionDescriptionId = this.domId(`decision-description-${decision.id}`);
      const card = element(this.document, 'article');
      card.append(element(this.document, 'strong', { text: decision.label }), element(this.document, 'p', { text: decision.description }));
      const button = element(this.document, 'button', {
        className: `button${decision.applied ? '' : ' primary'}`,
        text: decision.applied ? decision.journalOnly ? 'CONCLUSION CONSERVÉE' : 'ROUTE DÉJÀ DÉBLOQUÉE'
          : decision.lockedByChoice ? 'CHOIX EXCLU PAR LA DÉCISION' : decision.available ? 'CONFIRMER LA CONFRONTATION'
            : decision.reason || `PREUVES MANQUANTES · ${decision.missingRequirements.length}`,
        attributes: { type: 'button', 'data-archive-decision': decision.id, disabled: decision.applied || decision.lockedByChoice || !decision.available || Boolean(this.pendingAction), 'aria-describedby': decisionDescriptionId }
      });
      button.disabled = decision.applied || decision.lockedByChoice || !decision.available || Boolean(this.pendingAction);
      card.children[1].setAttribute('id', decisionDescriptionId);
      card.append(button);
      actions.append(card);
    }
    investigation.append(actions);
    if (state.journal.length) {
      const journal = element(this.document, 'details', { className: 'archive-journal-v132' });
      journal.append(element(this.document, 'summary', { text: `JOURNAL PERSISTANT · ${state.journal.length} ÉTAPES` }));
      const events = element(this.document, 'ol');
      const labels = { evidence: 'Récupéré', read: 'Lu', conclusion: 'Conclusion', played: 'Séquence visionnée' };
      for (const entry of state.journal) events.append(element(this.document, 'li', { text: `${labels[entry.kind] || 'Étape'} · ${entry.label}` }));
      journal.append(events); investigation.append(journal);
    }
    if (state.mediaNotice) investigation.append(element(this.document, 'p', { className: 'archive-media-notice-v132', text: state.mediaNotice }));
    const status = element(this.document, 'p', { className: 'archive-status-v68 sr-only', text: this.lastStatus, attributes: { role: 'status', 'aria-live': 'polite' } });
    this.root.replaceChildren(toolbar, layout, investigation, status);
    this.restoreFocus(focusState);
  }
}

/** Playback of actual deployment telemetry, with a seekable visual trace and
 * the same observations in text. This is not an audio/video-file substitute. */
export class NarrativeEvidenceReplayV132 {
  constructor({ root, media, onPlayed = () => {}, idPrefix = 'narrative-replay-v132' } = {}) {
    this.root = root; this.document = root.ownerDocument; this.media = resolveNarrativeMediaPlaybackV132(media);
    if (!this.media) throw new TypeError('La séquence de boîte noire doit contenir des observations réelles valides.');
    this.capture = this.media.capture; this.onPlayed = onPlayed; this.time = 0; this.playing = false; this.destroyed = false;
    this.root.style.display = 'grid'; this.root.style.gap = '.5rem'; this.root.style.margin = '1rem 0';
    this.canvas = element(this.document, 'canvas', { attributes: { width: '640', height: '240', role: 'img',
      'aria-label': 'Trajet enregistré : opérateur en vert, second opérateur en bleu, contacts visibles en orange.' } });
    this.canvas.width = 640; this.canvas.height = 240; this.canvas.style.width = '100%'; this.canvas.style.maxWidth = '640px';
    const controls = element(this.document, 'div', { attributes: { role: 'group', 'aria-label': 'Lecture de la boîte noire' } });
    controls.style.display = 'flex'; controls.style.flexWrap = 'wrap'; controls.style.gap = '.5rem'; controls.style.alignItems = 'center';
    this.playButton = element(this.document, 'button', { className: 'button', text: 'Lire la séquence', attributes: { type: 'button',
      id: `${idPrefix}-play`, 'data-archive-media-play': this.media.id, 'aria-pressed': 'false' } });
    this.playButton.style.minHeight = '44px';
    const seekLabel = element(this.document, 'label', { text: 'Position de lecture ', attributes: { for: `${idPrefix}-seek` } });
    this.seek = element(this.document, 'input', { attributes: { type: 'range', min: '0', max: String(this.capture.duration), step: '.01',
      value: '0', id: `${idPrefix}-seek`, 'data-archive-media-seek': this.media.id } });
    this.seek.style.minHeight = '44px'; seekLabel.append(this.seek); controls.append(this.playButton, seekLabel);
    this.positionText = element(this.document, 'p', { attributes: { 'data-archive-media-position': this.media.id } });
    this.root.append(element(this.document, 'h4', { text: this.media.title }),
      element(this.document, 'p', { text: this.media.description }), this.canvas, controls, this.positionText);
    this.context = this.canvas.getContext?.('2d');
    const view = this.document.defaultView || globalThis;
    this.requestFrame = view.requestAnimationFrame?.bind(view) || (callback => setTimeout(() => callback(Date.now()), 16));
    this.cancelFrame = view.cancelAnimationFrame?.bind(view) || clearTimeout;
    this.boundPlay = () => this.playing ? this.pause() : this.play();
    this.boundSeek = () => { this.pause(); this.time = Math.max(0, Math.min(this.capture.duration, Number(this.seek.value) || 0)); this.draw(); };
    this.playButton.addEventListener('click', this.boundPlay); this.seek.addEventListener('input', this.boundSeek);
    this.draw();
  }

  draw() {
    const capture = this.capture, t = capture.frames[0].t + this.time;
    const frame = capture.frames.filter(item => item.t <= t + 1e-8).at(-1) || capture.frames[0];
    const operator = frame.actors.find(actor => actor.role === 'operator');
    this.seek.value = String(this.time);
    this.positionText.textContent = `${this.time.toFixed(2)} / ${capture.duration.toFixed(2)} s · Opérateur (${Math.round(operator.x)}, ${Math.round(operator.y)}) · ${frame.actors.length - 1} contact(s) enregistré(s).`;
    this.seek.setAttribute('aria-valuetext', this.positionText.textContent);
    const ctx = this.context; if (!ctx) return;
    const all = capture.frames.flatMap(item => item.actors.filter(actor => actor.role === 'operator'));
    const left = Math.max(0, Math.min(...all.map(actor => actor.x)) - 160), right = Math.min(capture.width, Math.max(...all.map(actor => actor.x + actor.w)) + 160);
    const top = Math.max(0, Math.min(...all.map(actor => actor.y)) - 110), bottom = Math.min(capture.height, Math.max(...all.map(actor => actor.y + actor.h)) + 80);
    const scale = Math.min(620 / Math.max(1, right - left), 220 / Math.max(1, bottom - top));
    ctx.fillStyle = '#0d1d21'; ctx.fillRect(0, 0, 640, 240);
    ctx.save(); ctx.translate(10, 10); ctx.scale(scale, scale); ctx.translate(-left, -top);
    ctx.fillStyle = '#465c55';
    for (const surface of capture.surfaces) ctx.fillRect(surface.x, surface.y, surface.w, surface.h);
    ctx.strokeStyle = '#719b7d'; ctx.lineWidth = 1 / scale; ctx.beginPath();
    for (const [index, observation] of capture.frames.entries()) {
      const subject = observation.actors.find(actor => actor.role === 'operator');
      ctx[index ? 'lineTo' : 'moveTo'](subject.x + subject.w / 2, subject.y + subject.h / 2);
    }
    ctx.stroke();
    for (const actor of frame.actors) {
      ctx.fillStyle = actor.role === 'operator' ? '#b5eda3' : actor.role === 'coop' ? '#82bddf' : '#daab72';
      ctx.fillRect(actor.x, actor.y, actor.w, actor.h);
    }
    ctx.restore();
  }

  play() {
    if (this.destroyed || this.playing) return;
    if (this.time >= this.capture.duration) this.time = 0;
    this.playing = true; this.lastFrame = null;
    this.playButton.textContent = 'Suspendre la lecture'; this.playButton.setAttribute('aria-pressed', 'true');
    const advance = now => {
      if (!this.playing || this.destroyed) return;
      if (this.document.hidden || this.root.isConnected === false || this.root.getClientRects?.().length === 0) { this.pause(); return; }
      if (this.lastFrame !== null) this.time = Math.min(this.capture.duration, this.time + Math.max(0, now - this.lastFrame) / 1000);
      this.lastFrame = now; this.draw();
      if (this.time >= this.capture.duration) {
        this.pause(); this.playButton.textContent = 'Relire la séquence'; this.onPlayed(this.media.id); return;
      }
      this.frame = this.requestFrame(advance);
    };
    this.frame = this.requestFrame(advance);
  }

  pause() {
    this.playing = false; if (this.frame !== undefined) this.cancelFrame(this.frame); this.frame = undefined;
    this.playButton.textContent = this.time >= this.capture.duration ? 'Relire la séquence' : 'Lire la séquence';
    this.playButton.setAttribute('aria-pressed', 'false');
  }

  destroy() {
    if (this.destroyed) return; this.pause(); this.destroyed = true;
    this.playButton.removeEventListener('click', this.boundPlay); this.seek.removeEventListener('input', this.boundSeek);
  }
}

export class MissionArchiveOverlayV68 {
  constructor({ root, reader, engine, canvas, closeButton, backgrounds = null, background = null, documentRef = root?.ownerDocument || globalThis.document } = {}) {
    if (!root || !reader || !engine || !canvas || !closeButton) throw new TypeError('MissionArchiveOverlayV68 requiert son dialogue, son lecteur, le moteur, le canvas et le bouton de fermeture.');
    this.root = root;
    this.reader = reader;
    this.engine = engine;
    this.canvas = canvas;
    this.closeButton = closeButton;
    const siblings = [...(root.parentElement || root.parentNode)?.children || []].filter((element) => element !== root);
    this.backgrounds = asArray(backgrounds).length ? [...new Set(backgrounds.filter(Boolean))] : background ? [background] : siblings;
    this.document = documentRef;
    this.previousPaused = null;
    this.previousBackgroundStates = [];
    this.previousFocus = null;
    this.previousRootState = null;
    this.active = false;
    this.boundClose = () => this.close();
    this.boundKeydown = (event) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault?.();
        event.stopPropagation?.();
        this.close();
        return;
      }
      if (event.key === 'Tab' || event.code === 'Tab') this.trapTab(event);
    };
    this.closeButton.addEventListener('click', this.boundClose);
    this.root.addEventListener('keydown', this.boundKeydown);
  }

  get openState() { return this.active; }

  focusableElements() {
    return [...this.root.querySelectorAll('*')].filter((candidate) => {
      if (candidate.hidden || candidate.disabled || candidate.getAttribute?.('aria-hidden') === 'true') return false;
      if (candidate.getAttribute?.('tabindex') === '-1') return false;
      const tag = String(candidate.tagName || '').toLowerCase();
      if (['button', 'input', 'select', 'textarea'].includes(tag)) return true;
      if (tag === 'a') return Boolean(candidate.getAttribute?.('href'));
      const tabIndex = candidate.getAttribute?.('tabindex');
      return tabIndex !== null && Number(tabIndex) >= 0;
    });
  }

  trapTab(event) {
    const focusable = this.focusableElements();
    if (!focusable.length) {
      event.preventDefault?.();
      this.closeButton.focus?.({ preventScroll: true });
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = this.document?.activeElement;
    if (event.shiftKey && (current === first || !this.root.contains(current))) {
      event.preventDefault?.();
      last.focus?.({ preventScroll: true });
    } else if (!event.shiftKey && (current === last || !this.root.contains(current))) {
      event.preventDefault?.();
      first.focus?.({ preventScroll: true });
    }
  }

  open(entryId = '') {
    if (!this.engine.running) return false;
    if (!this.openState) {
      this.active = true;
      this.previousPaused = Boolean(this.engine.paused);
      this.previousFocusLossVersionV72 = this.engine.focusLossVersionV72;
      const activeElement = this.document?.activeElement;
      this.previousFocus = activeElement && !this.root.contains(activeElement) ? activeElement : this.canvas;
      this.previousRootState = {
        hidden: Boolean(this.root.hidden),
        ariaHidden: this.root.getAttribute?.('aria-hidden')
      };
      this.engine.paused = true;
      if (this.engine.clearGameplayInput) this.engine.clearGameplayInput();
      else this.engine.keys?.clear?.();
      this.previousBackgroundStates = this.backgrounds.map((element) => ({
        element,
        ariaHidden: element.getAttribute?.('aria-hidden'),
        inertAttribute: element.hasAttribute?.('inert') ? element.getAttribute('inert') : null,
        hadInertAttribute: Boolean(element.hasAttribute?.('inert')),
        inertProperty: Boolean(element.inert)
      }));
      for (const state of this.previousBackgroundStates) {
        state.element.setAttribute('aria-hidden', 'true');
        state.element.setAttribute('inert', '');
        state.element.inert = true;
      }
      this.root.hidden = false;
      this.root.setAttribute('aria-hidden', 'false');
    }
    this.reader.open(entryId, { markRead: Boolean(entryId) });
    this.closeButton.focus?.({ preventScroll: true });
    return true;
  }

  close({ restoreFocus = true, resume = true } = {}) {
    if (!this.openState) return false;
    this.reader.replayV132?.pause();
    this.active = false;
    this.root.hidden = this.previousRootState?.hidden ?? true;
    if (this.previousRootState?.ariaHidden === null || this.previousRootState?.ariaHidden === undefined) this.root.removeAttribute?.('aria-hidden');
    else this.root.setAttribute('aria-hidden', this.previousRootState.ariaHidden);
    for (const state of this.previousBackgroundStates) {
      if (state.ariaHidden === null || state.ariaHidden === undefined) state.element.removeAttribute?.('aria-hidden');
      else state.element.setAttribute('aria-hidden', state.ariaHidden);
      if (state.hadInertAttribute) state.element.setAttribute('inert', state.inertAttribute ?? '');
      else state.element.removeAttribute?.('inert');
      state.element.inert = state.inertProperty;
    }
    // Profile replacement/navigation revokes the old simulation. Restore DOM
    // isolation without reactivating that engine, even for a single frame.
    if (resume && this.engine.running && this.previousPaused !== null && this.previousFocusLossVersionV72 === this.engine.focusLossVersionV72) this.engine.paused = this.previousPaused;
    const focusTarget = this.previousFocus?.isConnected === false ? this.canvas : (this.previousFocus || this.canvas);
    this.previousPaused = null;
    this.previousBackgroundStates = [];
    this.previousFocus = null;
    this.previousRootState = null;
    if (this.engine.clearGameplayInput) this.engine.clearGameplayInput();
    else this.engine.keys?.clear?.();
    if (restoreFocus && this.engine.running) focusTarget.focus?.({ preventScroll: true });
    return true;
  }

  destroy() {
    this.close({ restoreFocus: false });
    this.closeButton.removeEventListener('click', this.boundClose);
    this.root.removeEventListener('keydown', this.boundKeydown);
  }

  snapshot() {
    return Object.freeze({
      open: this.openState,
      engineRunning: Boolean(this.engine.running),
      enginePaused: Boolean(this.engine.paused),
      previousPaused: this.previousPaused,
      isolatedBackgrounds: this.previousBackgroundStates.filter(({ element }) => element.inert && element.getAttribute?.('aria-hidden') === 'true').length
    });
  }
}
