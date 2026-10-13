const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const list = value => Array.isArray(value) ? value : [];
const number = value => Math.round(Number.isFinite(value) ? value : 0);
let serial = 0;

const reasons = Object.freeze({ 'interface-unavailable': 'Interface indisponible dans cet état de jeu.',
  'profile-unavailable': 'Ce profil est indisponible.', 'already-selected': 'Déjà sélectionné.',
  'charge-empty': 'Charge insuffisante.', 'recruit-not-local': 'Approchez cette recrue avec un passage dégagé.',
  'order-unavailable': 'Aucune recrue disponible pour cet ordre.', 'possession-unavailable': 'Contrôle indisponible.',
  'consciousness-unavailable': 'Conscience indisponible.', 'decision-not-local': 'Approchez le nexus pour conclure.',
  'unknown-action': 'Commande indisponible.', 'unknown-ending': 'Conclusion inconnue.' });
export const hiveCommandReasonV131 = reason => reasons[reason] || reason || 'Action indisponible.';

function button(action, value, label, { canApply = false, reason = '', selected = false, cost = 0 } = {}) {
  const key = `${action}:${value ?? ''}`, description = !canApply && reason ? hiveCommandReasonV131(reason) : '';
  return `<span class="hive-command-choice-v131"><button type="button" data-hive-command-action="${escape(action)}" data-hive-command-value="${escape(value)}" data-hive-command-key="${escape(key)}"${canApply ? '' : ' disabled'}${selected ? ' aria-pressed="true"' : ' aria-pressed="false"'}${description ? ` title="${escape(description)}" aria-label="${escape(label)} : ${escape(description)}"` : ''}>${escape(label)}${cost ? ` <small>−${number(cost)} charge</small>` : ''}</button>${description ? `<small class="hive-command-reason-v131">${escape(description)}</small>` : ''}</span>`;
}

/** Pure markup from the engine's command model: the UI never derives resource
 * grants, proximity or mission permissions from display text or DOM state. */
export function renderHiveCommandMarkupV131(model, { headingId = 'hive-command-heading-v131', status = '' } = {}) {
  if (!model || model.schema !== 131) return '';
  const allowed = model.canAct === true;
  const action = item => ({ ...item, canApply: allowed && item.canApply === true,
    reason: !allowed ? model.reason || 'interface-unavailable' : item.reason });
  const section = (label, content) => content ? `<section class="hive-command-group-v131"><h3>${escape(label)}</h3><div class="hive-command-choices-v131">${content}</div></section>` : '';
  const profiles = (model.operationId === 'jeri-false-son' ? list(model.profiles) : []).map(item => button('profile', item.id, item.label,
    { ...action(item), selected: model.profile === item.id })).join('');
  const orders = (list(model.recruits).length ? list(model.orders) : []).map(item => button('order', item.id, item.label, action(item))).join('');
  const consciousnesses = (model.operationId === 'eloise-uncrowned-queen' ? list(model.consciousnesses) : []).map(item => button('consciousness', item.id, item.label,
    { ...action(item), selected: model.consciousness === item.id })).join('');
  const recruits = list(model.recruits).map(item => {
    const orderLabel = list(model.orders).find(order => order.id === item.order)?.label;
    const recruitAction = item.recruited ? 'select-recruit' : 'recruit';
    const primary = button(recruitAction, item.id, item.recruited ? 'Sélectionner' : 'Recruter', {
      canApply: allowed && (item.recruited ? item.canSelect === true : item.canRecruit === true),
      reason: !allowed ? model.reason || 'interface-unavailable' : item.recruited ? item.selectReason : item.recruitReason,
      selected: item.recruited && model.selectedRecruit === item.id, cost: item.recruited ? 0 : 12 });
    const possess = item.recruited ? button('possess', item.id, 'Contrôler', {
      canApply: allowed && item.canPossess === true, cost: 6,
      reason: !allowed ? model.reason || 'interface-unavailable' : item.possessReason }) : '';
    return `<article class="hive-command-recruit-v131"><strong>${escape(item.label)}</strong><p>PV ${number(item.health)} · Loyauté ${number(item.loyalty)}${orderLabel ? ` · ${escape(orderLabel)}` : ''}${item.alive ? '' : ' · Perdue'}</p><div class="hive-command-choices-v131">${primary}${possess}</div></article>`;
  }).join('');
  const endings = (model.operationId === 'eloise-uncrowned-queen' ? list(model.endings) : []).map(item => `<article class="hive-command-ending-v131">${button('ending', item.id, item.label, action(item))}<p>${escape(item.description)}</p></article>`).join('');
  const release = model.possessedId ? section('Corps contrôlé', button('release', '', 'Revenir à l’opérateur', {
    canApply: allowed && model.canRelease === true, reason: !allowed ? model.reason || 'interface-unavailable' : model.releaseReason })) : '';
  return `<header class="hive-command-header-v131"><h2 id="${escape(headingId)}">${escape(model.title || 'Commandes de ruche')}</h2><button type="button" data-hive-command-action="close" data-hive-command-value="" data-hive-command-key="close:" aria-label="Fermer les commandes de ruche">Fermer</button></header>
    <p class="hive-command-resource-v131">Charge ${number(model.charge)} · Chœur ${number(model.choir)} · Douleur ${number(model.pain)} · Dissonance ${number(model.dissonance)}</p>
    <p class="hive-command-instruction-v131">${escape(model.instruction)}</p>
    ${release}${section('Profils', profiles)}${section('Ordres de la meute', orders)}${section('Consciences', consciousnesses)}${section('Recrues', recruits)}${section('Conclusion', endings)}
    <p class="hive-command-live-v131" role="status" aria-live="polite" aria-atomic="true">${escape(status)}</p>
    <p class="hive-command-help-v131">Le terrain reste actif. Échap ferme le panneau ; reprenez le canvas pour marcher, tirer ou mettre en pause.</p>`;
}

const styles = `
.hive-command-v131{position:absolute;z-index:80;top:1rem;right:1rem;width:min(29rem,calc(100% - 2rem));max-height:calc(100% - 2rem);overflow:auto;padding:1rem;border:1px solid #789d86;border-radius:8px;background:#101d1ff2;color:#e1e8df;font:14px/1.45 system-ui,sans-serif;box-shadow:0 12px 36px #0008;overscroll-behavior:contain;scrollbar-gutter:stable}
.hive-command-v131[hidden]{display:none}.hive-command-v131 *{box-sizing:border-box}.hive-command-v131 h2,.hive-command-v131 h3,.hive-command-v131 p{margin:0}.hive-command-v131 h2{font-size:16px;letter-spacing:.03em}.hive-command-v131 h3{font-size:14px;margin-bottom:.5rem;color:#c6dfb3}.hive-command-header-v131{display:flex;align-items:start;justify-content:space-between;gap:1rem}.hive-command-v131 button{min-height:44px;padding:.5rem .7rem;border:1px solid #719682;border-radius:5px;background:#203b37;color:#ecf3e6;font:inherit;cursor:pointer;text-align:left}.hive-command-v131 button[aria-pressed=true]{background:#496b48;border-color:#cfefa6}.hive-command-v131 button:focus-visible{outline:3px solid #e2f9a7;outline-offset:3px}.hive-command-v131 button:disabled{cursor:default;background:#192629;color:#adb9b4;border-color:#4b5c58}.hive-command-v131 button small{display:block;font-size:12px;color:inherit}.hive-command-resource-v131{margin-top:.8rem!important;font-variant-numeric:tabular-nums;color:#d7e7ab}.hive-command-instruction-v131{margin-top:.6rem!important}.hive-command-group-v131{margin-top:1rem;border-top:1px solid #43594c;padding-top:.8rem}.hive-command-choices-v131{display:flex;gap:.5rem;flex-wrap:wrap}.hive-command-choice-v131{flex:1 1 10rem;min-width:0}.hive-command-choice-v131 button{width:100%}.hive-command-reason-v131{display:block;line-height:1.35;color:#bdc9c0;margin-top:.25rem}.hive-command-recruit-v131,.hive-command-ending-v131{flex:1 1 100%;min-width:0}.hive-command-recruit-v131 p,.hive-command-ending-v131 p{margin:.3rem 0 .5rem;font-size:12px;color:#bfccc3}.hive-command-live-v131{min-height:1.4em;margin-top:.8rem!important;color:#dbeaac}.hive-command-help-v131{font-size:12px;color:#b6c4bf;margin-top:.5rem!important}@media(max-width:600px){.hive-command-v131{top:.5rem;right:.5rem;width:calc(100% - 1rem);max-height:calc(100% - 1rem);padding:.8rem}.hive-command-choice-v131{flex-basis:9rem}}`;

export class HiveCommandDockV131 {
  constructor({ root, engine } = {}) {
    if (!root?.ownerDocument || !engine?.getHiveCommandModelV131 || !engine?.performHiveActionV131)
      throw new TypeError('HiveCommandDockV131 requiert une racine DOM et un moteur de ruche.');
    this.root = root; this.engine = engine; this.document = root.ownerDocument;
    this.headingId = `hive-command-heading-v131-${++serial}`;
    this.element = this.document.createElement('aside'); this.element.className = 'hive-command-v131';
    this.element.hidden = true; this.element.setAttribute('aria-labelledby', this.headingId);
    this.element.setAttribute('tabindex', '-1');
    this.style = this.document.createElement('style'); this.style.textContent = styles;
    root.append(this.style, this.element);
    this.boundClick = event => this.handleClick(event);
    this.boundKeydown = event => {
      event.stopPropagation();
      if (event.key === 'Escape' || event.code === 'Escape') { event.preventDefault(); this.close(); }
    };
    this.boundKeyup = event => event.stopPropagation();
    this.element.addEventListener('click', this.boundClick);
    this.element.addEventListener('keydown', this.boundKeydown);
    this.element.addEventListener('keyup', this.boundKeyup);
    this.status = ''; this.signature = ''; this.opened = false; this.destroyed = false;
  }

  open() {
    if (this.destroyed || !this.engine.getHiveCommandModelV131()) return false;
    if (!this.opened) this.previousFocus = this.document.activeElement;
    this.opened = true; this.element.hidden = false; this.refresh();
    this.element.querySelector('[data-hive-command-action="close"]')?.focus({ preventScroll: true });
    this.timer ||= setInterval(() => { if (!this.document.hidden) this.refresh(); }, 200);
    return true;
  }

  close({ restoreFocus = true } = {}) {
    const wasOpen = this.opened;
    this.opened = false; this.element.hidden = true; clearInterval(this.timer); this.timer = null;
    if (wasOpen) this.engine.closeHiveCommandV131?.();
    if (wasOpen && restoreFocus) {
      const previous = this.previousFocus;
      (previous?.isConnected !== false && previous?.focus ? previous : this.engine.canvas)?.focus?.({ preventScroll: true });
    }
    this.previousFocus = null;
    return wasOpen;
  }

  refresh() {
    if (this.destroyed) return false;
    const model = this.engine.getHiveCommandModelV131();
    if (!model) { this.close(); return false; }
    const markup = renderHiveCommandMarkupV131(model, { headingId: this.headingId, status: this.status });
    if (markup === this.signature) return true;
    const focusKey = this.element.contains(this.document.activeElement) ? this.document.activeElement.dataset?.hiveCommandKey : null;
    this.signature = markup; this.element.innerHTML = markup;
    if (focusKey) {
      const focused = [...this.element.querySelectorAll('[data-hive-command-key]')].find(node => node.dataset.hiveCommandKey === focusKey);
      (focused && !focused.disabled ? focused : this.element.querySelector('[data-hive-command-action="close"]'))?.focus({ preventScroll: true });
    }
    return true;
  }

  handleClick(event) {
    const target = event.target.closest?.('[data-hive-command-action]');
    if (!this.opened || !target || !this.element.contains(target) || target.disabled) return;
    const { hiveCommandAction: action, hiveCommandValue: value, hiveCommandKey: key } = target.dataset;
    if (action === 'close') { this.close(); return; }
    // Refresh first: a button that looked available can become out of range or
    // unaffordable while the non-paused mission continues behind the dock.
    this.refresh();
    const current = [...this.element.querySelectorAll('[data-hive-command-key]')].find(node => node.dataset.hiveCommandKey === key);
    if (!current || current.disabled) return;
    const result = this.engine.performHiveActionV131(action, value);
    this.status = result?.applied ? 'Commande appliquée.' : hiveCommandReasonV131(result?.reason);
    if (result?.applied && action === 'possess') { this.close(); return; }
    this.refresh();
  }

  destroy() {
    if (this.destroyed) return;
    this.close({ restoreFocus: false }); this.destroyed = true;
    this.element.removeEventListener('click', this.boundClick);
    this.element.removeEventListener('keydown', this.boundKeydown);
    this.element.removeEventListener('keyup', this.boundKeyup);
    this.element.remove(); this.style.remove();
  }
}
