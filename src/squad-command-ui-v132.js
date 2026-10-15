import { squadCommandReasonV132 } from './squad-doctrine-v132.js';
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const list = value => Array.isArray(value) ? value : [];
let serial = 0;
const button = (action, value, label, allowed, reason = null, selected = false) => `<button type="button" data-squad-action="${escape(action)}" data-squad-value="${escape(value)}" data-squad-key="${escape(action)}:${escape(value)}"${allowed ? '' : ' disabled'}${selected ? ' aria-pressed="true"' : ''}${!allowed && reason ? ` title="${escape(squadCommandReasonV132(reason))}"` : ''}>${escape(label)}</button>`;
export function renderSquadCommandMarkupV132(model, { headingId = 'squad-heading-v132', status = '' } = {}) {
  if (!model || model.schema !== 132) return '';
  const available = model.canAct;
  const section = (label, html) => html ? `<section><h3>${escape(label)}</h3><div class="squad-choices-v132">${html}</div></section>` : '';
  const choices = (action, items, selected) => list(items).map(item => button(action, item.id, item.label, available && item.canApply, item.reason || model.reason, selected === item.id)).join('');
  return `<header><h2 id="${escape(headingId)}">${escape(model.title)}</h2>${button('close', '', 'Fermer', true)}</header>
    <p>${escape(model.instruction)}</p>
    ${section('Groupe commandé', ['all', 'alpha', 'bravo'].map(id => button('select-team', id, id === 'all' ? 'Tous' : id === 'alpha' ? 'Alpha' : 'Bravo', available, model.reason, id === model.selectedTeam)).join(''))}
    ${section('Ordres', choices('order', model.orders))}${section('Formation', choices('formation', model.formations, model.formation))}${section('Doctrine', choices('doctrine', model.doctrines, model.doctrine))}
    ${section('Repères sur le terrain', choices('marker-platform', model.markerCandidates))}
    ${section('Humains et ressources', list(model.actors).map(actor => `<article><strong>${escape(actor.label)}${actor.team ? ` · ${escape(actor.team === 'alpha' ? 'Alpha' : 'Bravo')}` : ''}</strong><p>PV ${Math.round(actor.health || 0)}${actor.downed ? ` · À terre (${Math.ceil(actor.bleedOut || 0)} s)` : ''} · Réserve ${Math.round(actor.ammoReserve || 0)}</p><div class="squad-choices-v132">${button('rescue', actor.id, 'Secourir · 1 charge', available && actor.canRescue, actor.rescueReason)}${button('carry', actor.id, 'Porter seul', available && actor.canCarry, actor.carryReason)}${button('carry-assisted', actor.id, 'Porter en binôme', available && actor.canCarryAssisted, actor.carryReason || 'local')}${button('share-ammo', actor.id, 'Donner 12 munitions', available && actor.canShareAmmo, actor.ammoReason)}${button('share-medical', actor.id, 'Donner 1 charge médicale', available && actor.canShareMedical, actor.medicalReason)}</div></article>`).join(''))}
    ${model.carryingId ? section('Transport du blessé', button('drop', '', 'Poser au sol', available && model.canDrop, model.dropReason || model.reason)) : ''}
    ${model.canCancelTask ? section('Manipulation réservée', button('cancel-task', '', 'Annuler et conserver le matériel', true)) : ''}
    <p role="status" aria-live="polite">${escape(status || (!available ? squadCommandReasonV132(model.reason) : ''))}</p><small>Le terrain reste actif. Échap ferme le panneau ; C ouvre les commandes. Les charges proviennent des dotations réelles.</small>`;
}
const styles = `.squad-command-v132{position:absolute;z-index:82;top:1rem;right:1rem;width:min(32rem,calc(100% - 2rem));max-height:calc(100% - 2rem);overflow:auto;padding:1rem;background:#121e21f5;border:1px solid #809486;border-radius:8px;color:#e4ebe4;font:14px/1.45 system-ui,sans-serif;overscroll-behavior:contain}.squad-command-v132,.squad-command-v132 *{box-sizing:border-box;min-width:0}.squad-command-v132{overflow-wrap:anywhere}.squad-command-v132 header button{flex-shrink:0}.squad-command-v132[hidden]{display:none}.squad-command-v132 header{display:flex;gap:1rem;justify-content:space-between}.squad-command-v132 h2{font-size:17px;margin:0}.squad-command-v132 h3{font-size:14px;margin:0 0 .5rem}.squad-command-v132 section{border-top:1px solid #456054;padding-top:.75rem;margin-top:.75rem}.squad-command-v132 article{width:100%}.squad-command-v132 article p{margin:.2rem 0 .5rem}.squad-choices-v132{display:flex;gap:.5rem;flex-wrap:wrap}.squad-command-v132 button{min-height:44px;padding:.5rem .75rem;border:1px solid #799285;border-radius:5px;background:#243e37;color:#e9f1e8;font:inherit;cursor:pointer}.squad-command-v132 button:disabled{background:#202c2d;color:#abb7b0;cursor:default}.squad-command-v132 button[aria-pressed=true]{background:#466445}.squad-command-v132 button:focus-visible{outline:3px solid #e7efa8;outline-offset:3px}.squad-command-v132 small{display:block;color:#b9c8bd}`;
export class SquadCommandDockV132 {
  constructor({ root, engine } = {}) {
    if (!root?.ownerDocument || !engine?.getSquadCommandModelV132) throw new TypeError('SquadCommandDockV132 requiert une racine et un moteur.');
    this.root = root; this.engine = engine; this.document = root.ownerDocument;
    this.headingId = `squad-heading-v132-${++serial}`; this.element = this.document.createElement('aside');
    this.element.className = 'squad-command-v132'; this.element.hidden = true; this.element.setAttribute('aria-labelledby', this.headingId);
    this.style = this.document.createElement('style'); this.style.textContent = styles; root.append(this.style, this.element);
    this.boundClick = event => this.handleClick(event);
    this.boundKey = event => { event.stopPropagation(); if (event.key === 'Escape' || event.code === 'Escape') { event.preventDefault(); this.close(); } };
    this.boundKeyup = event => event.stopPropagation();
    this.element.addEventListener('click', this.boundClick); this.element.addEventListener('keydown', this.boundKey); this.element.addEventListener('keyup', this.boundKeyup);
    this.status = ''; this.signature = ''; this.opened = false;
  }
  open() {
    if (this.destroyed || !this.engine.getSquadCommandModelV132()) return false;
    this.opened = true; this.engine.clearGameplayInput?.('squad-dock-open'); this.element.hidden = false; this.refresh();
    this.element.querySelector('[data-squad-action="close"]')?.focus({ preventScroll: true });
    this.timer ||= setInterval(() => { if (!this.document.hidden) this.refresh(); }, 200); return true;
  }
  close({ restoreFocus = true } = {}) {
    const opened = this.opened; this.opened = false; this.element.hidden = true; clearInterval(this.timer); this.timer = null;
    if (opened) this.engine.closeSquadCommandV132?.();
    if (opened && restoreFocus) this.engine.canvas?.focus?.({ preventScroll: true }); return opened;
  }
  refresh() {
    if (this.destroyed) return false;
    const model = this.engine.getSquadCommandModelV132(); if (!model) { this.close(); return false; }
    const html = renderSquadCommandMarkupV132(model, { headingId: this.headingId, status: this.status });
    if (html === this.signature) return true;
    const focusKey = this.element.contains(this.document.activeElement) ? this.document.activeElement.dataset?.squadKey : null;
    this.signature = html; this.element.innerHTML = html;
    if (focusKey) { const current = [...this.element.querySelectorAll('[data-squad-key]')].find(node => node.dataset.squadKey === focusKey);
      (current && !current.disabled ? current : this.element.querySelector('[data-squad-action="close"]'))?.focus({ preventScroll: true }); }
    return true;
  }
  handleClick(event) {
    const target = event.target.closest?.('[data-squad-action]'); if (!this.opened || !target || !this.element.contains(target) || target.disabled) return;
    const { squadAction: action, squadValue: value, squadKey: key } = target.dataset;
    if (action === 'close') { this.close(); return; }
    this.refresh(); const current = [...this.element.querySelectorAll('[data-squad-key]')].find(node => node.dataset.squadKey === key);
    if (!current || current.disabled) return;
    const result = this.engine.performSquadActionV132(action, value);
    this.status = result?.applied ? 'Commande appliquée.' : squadCommandReasonV132(result?.reason);
    if (result?.applied && ['carry', 'carry-assisted', 'rescue', 'drop'].includes(action)) { this.close(); return; }
    this.refresh();
  }
  destroy() {
    this.close({ restoreFocus: false }); this.destroyed = true;
    this.element.removeEventListener('click', this.boundClick); this.element.removeEventListener('keydown', this.boundKey); this.element.removeEventListener('keyup', this.boundKeyup);
    this.element.remove(); this.style.remove();
  }
}
