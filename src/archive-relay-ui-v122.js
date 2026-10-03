import { MissionArchiveOverlayV68 } from './narrative-archives-ui-v68.js';
import { getArchiveRelayArchiveV122 } from './archive-relay-state-v122.js';
let readerSerialV122 = 0;
function node(documentRef, tag, text = '', attributes = {}) {
  const element = documentRef.createElement(tag); element.textContent = text;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}
// Uses the existing focus-loss-aware overlay contract. Never resumes a simulation
// that was paused before reading, or that lost browser focus while a file was open.
export class ArchiveRelayReaderV122 {
  constructor({ engine, canvas, documentRef = globalThis.document, parent = documentRef?.body } = {}) {
    if (!engine || !canvas || !documentRef || !parent) throw new TypeError('QZ-18 reader requires engine, canvas, document and parent.');
    this.engine = engine; this.document = documentRef; this.selected = null; this.terminal = null; this.status = '';
    const prefix = `qz18-reader-${++readerSerialV122}`;
    this.root = node(documentRef, 'section', '', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${prefix}-title`, tabindex: '-1' });
    this.root.hidden = true;
    this.root.setAttribute('style', 'position:fixed;inset:3vh 3vw;z-index:10000;background:#0b181e;color:#d7e7dd;border:2px solid #6b9690;padding:20px;overflow:auto;font-family:monospace;max-width:1100px;margin:auto');
    this.title = node(documentRef, 'h2', 'QZ-18 · ARCHIVES LOCALES', { id: `${prefix}-title` });
    this.closeButton = node(documentRef, 'button', 'FERMER ET REPRENDRE', { type: 'button', class: 'button' });
    this.content = node(documentRef, 'div'); this.root.append(this.title, this.closeButton, this.content); parent.append(this.root);
    this.overlay = new MissionArchiveOverlayV68({ root: this.root, canvas, closeButton: this.closeButton, engine,
      reader: { open: terminal => this.render(terminal) }, documentRef });
    const closeOverlay = this.overlay.close.bind(this.overlay);
    this.overlay.close = options => {
      const changed = closeOverlay(options); if (changed) { engine.closeArchiveRelayReaderV122?.(); this.terminal = null; }
      return changed;
    };
  }
  get openState() { return this.overlay.openState; }
  open(terminal) {
    if (!this.engine.canArchiveRelayReadV122?.() || terminal !== this.engine.archiveRelayReaderTerminalV122
      || !this.engine.getArchiveRelayReaderV122(terminal)) return false;
    this.terminal = terminal; this.selected = null; this.status = ''; return this.overlay.open(terminal);
  }
  close(options) { return this.overlay.close(options); }
  select(documentId) {
    const model = this.engine.getArchiveRelayReaderV122(this.terminal);
    if (!model?.documents.some(entry => entry.id === documentId)) return false;
    this.selected = documentId;
    const result = this.engine.markArchiveRelayReadV122(documentId);
    this.status = result.applied ? 'Lecture ajoutée au checkpoint local.' : result.reason === 'already-read' ? 'Document déjà lu.' : 'Lecture non enregistrée.';
    this.render(); return result.applied || result.reason === 'already-read';
  }
  decide(id) {
    const result = this.engine.decideArchiveRelayV122(id); this.status = result.message || 'Les preuves nécessaires ne sont pas encore toutes lues.';
    this.render(); return result;
  }
  render(terminal = this.terminal) {
    this.terminal = terminal;
    let model = this.engine.getArchiveRelayReaderV122(terminal); if (!model) return;
    if (!model.documents.some(entry => entry.id === this.selected)) {
      this.selected = model.documents[0]?.id || null;
      if (this.selected) this.engine.markArchiveRelayReadV122(this.selected);
      model = this.engine.getArchiveRelayReaderV122(terminal);
    }
    this.title.textContent = model.title;
    const previous = this.document.activeElement?.getAttribute?.('data-qz18-control');
    const controls = node(this.document, 'nav', '', { 'aria-label': 'Documents du poste' });
    for (const document of model.documents) {
      const button = node(this.document, 'button', `${document.read ? 'LU · ' : ''}${document.title}`, {
        type: 'button', class: 'button', 'data-qz18-control': document.id, 'aria-pressed': document.id === this.selected });
      button.addEventListener('click', () => this.select(document.id)); controls.append(button);
    }
    const selected = model.documents.find(entry => entry.id === this.selected);
    const article = node(this.document, 'article');
    if (selected) article.append(node(this.document, 'h3', selected.title),
      node(this.document, 'p', `${selected.type} · ${selected.department} · ${selected.author} · ${selected.time}`),
      node(this.document, 'p', selected.summary), node(this.document, 'p', selected.body));
    else article.append(node(this.document, 'p', 'Aucune donnée récupérée sur ce poste.'));
    const progress = node(this.document, 'p', `Dossier lu ${model.readCount}/${model.total} · ${model.notice}`);
    const comparison = node(this.document, 'section');
    if (model.terminal === 'analysis') {
      comparison.append(node(this.document, 'h3', 'CONFRONTATION · HORAIRES ET FILE D’ÉMISSION'));
      comparison.append(node(this.document, 'p', 'Vérifier alimentation, synchronisation, file de détresse et rapport envoyé. Un badge seul ne permet pas de nommer un coupable.'));
      for (const decision of model.decisions) {
        const button = node(this.document, 'button', model.verdict === decision.id ? 'VERDICT ENREGISTRÉ' : decision.label,
          { type: 'button', class: 'button', 'data-qz18-control': decision.id });
        button.disabled = !model.canDecide;
        button.addEventListener('click', () => this.decide(decision.id));
        comparison.append(node(this.document, 'p', decision.explanation), button);
      }
    }
    this.content.replaceChildren(progress, controls, article, comparison,
      node(this.document, 'p', this.status, { role: 'status', 'aria-live': 'polite' }));
    if (previous) this.content.querySelector(`[data-qz18-control="${previous}"]`)?.focus?.({ preventScroll: true });
  }
  snapshot() { return { ...this.overlay.snapshot(), terminal: this.terminal, selected: this.selected }; }
  destroy() { this.overlay.destroy(); this.root.remove?.(); }
}
export function renderArchiveRelayArchiveV122(root, save, documentRef = root?.ownerDocument || globalThis.document) {
  if (!root || !documentRef) return false;
  const model = getArchiveRelayArchiveV122(save);
  if (!model) { root.replaceChildren(node(documentRef, 'p', 'QZ-18 · Aucun dossier transféré. Récupérez et confrontez les archives du relais.')); return false; }
  const records = model.documents.map(document => {
    const details = node(documentRef, 'details'); details.append(node(documentRef, 'summary', `${document.time} · ${document.title}`),
      node(documentRef, 'p', `${document.type} · ${document.department} · ${document.author}`), node(documentRef, 'p', document.body)); return details;
  });
  root.replaceChildren(node(documentRef, 'h3', 'QZ-18 · LE DERNIER RELAIS · DOSSIER TRANSFÉRÉ'),
    node(documentRef, 'p', 'Cause documentée : détresse retardée par la priorité de fret. Auteur personnel non identifié.'),
    node(documentRef, 'p', `Archivé au jour ${model.receipt.completedDay}. ${model.notice}`), ...records);
  return true;
}
