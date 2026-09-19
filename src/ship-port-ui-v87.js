import { SHIP_ANIMAL_ATLASES_V87, drawShipAnimalV87, isShipAnimalAtlasReadyV87 } from './ship-animal-art-v87.js';
import { SHIP_ANIMAL_DEFINITIONS_V87, SHIP_ANIMAL_OFFERS_V87, getShipAnimalOfferMembersV87 } from './ship-animal-state-v87.js';

// Definitions own identities and labels; model data cannot invent another
// animal or redirect its preview to an arbitrary/hostile asset.
const ANIMAL_IDS = Object.freeze(Object.keys(SHIP_ANIMAL_DEFINITIONS_V87));
const ABORTABLE_PHASES = new Set(['requesting', 'authorized', 'approach', 'approaching', 'alignment', 'aligning', 'docking']);
const PHASE_LABELS = Object.freeze({ undocked: 'Non amarré', idle: 'Non amarré', requesting: 'Autorisation demandée',
  authorized: 'Approche autorisée', approach: 'Approche locale', approaching: 'Approche locale', alignment: 'Alignement',
  aligning: 'Alignement', docking: 'Verrouillage du raccord', docked: 'Amarré', undocking: 'Largage', departing: 'Éloignement' });
const string = value => typeof value === 'string' ? value : '';
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const memberIds = offer => Array.isArray(offer?.animalIds) ? offer.animalIds : offer?.animalId ? [offer.animalId] : [];
const focus = element => { if (element?.isConnected !== false && typeof element?.focus === 'function') element.focus({ preventScroll: true }); };

/** Presentation only. Every action is revalidated and committed by the active game owner. */
export class ShipPortUiV87 {
  constructor({ getModel, onAction, onClose, documentRef = globalThis.document } = {}) {
    if (typeof getModel !== 'function' || typeof onAction !== 'function' || !documentRef?.createElement || !documentRef.body)
      throw new Error('ShipPortUiV87 requiert documentRef, getModel et onAction.');
    this.document = documentRef; this.window = documentRef.defaultView || globalThis;
    this.getModel = getModel; this.onAction = onAction; this.onClose = onClose;
    this.destroyed = false; this.opened = false; this.pending = false; this.mode = 'terminal';
    this.selectedAnimalId = ANIMAL_IDS[0] || null; this.examinedSignature = null; this.epoch = 0;
    this.frameHandle = null; this.animationSeconds = 0; this.lastFrameTime = null;
    this.error = ''; this.model = {}; this.images = new Map(); this.previousFocus = null;
    this.build();
    this.boundCancel = event => { event.preventDefault(); event.stopPropagation(); this.close(); };
    this.boundClose = () => { if (this.opened) this.close(); };
    this.boundKeydown = event => { if (this.isOpen) event.stopPropagation(); };
    this.boundVisibility = () => { this.lastFrameTime = null; this.syncAnimation(); };
    this.dialog.addEventListener('cancel', this.boundCancel);
    this.dialog.addEventListener('close', this.boundClose);
    this.dialog.addEventListener('keydown', this.boundKeydown);
    this.document.addEventListener('visibilitychange', this.boundVisibility);
  }

  get isOpen() { return !this.destroyed && this.opened && this.dialog.open === true; }

  node(tag, className, text = null) {
    const element = this.document.createElement(tag);
    if (className) element.className = className;
    if (text !== null) element.textContent = text;
    return element;
  }

  button(label, handler, action) {
    const button = this.node('button', 'ship-port-v87__button', label); button.type = 'button';
    if (action) button.dataset.portAction = action;
    button.addEventListener('click', handler); return button;
  }

  build() {
    const dialog = this.node('dialog', 'ship-port-v87'); dialog.setAttribute('aria-labelledby', 'ship-port-v87-heading');
    dialog.setAttribute('aria-describedby', 'ship-port-v87-description');
    const header = this.node('header', 'ship-port-v87__header');
    const heading = this.node('h2', 'ship-port-v87__heading', 'Relais civil de la Frontière'); heading.id = 'ship-port-v87-heading'; this.heading = heading;
    this.closeButton = this.button('Fermer', () => this.close(), 'close'); this.closeButton.setAttribute('aria-label', 'Fermer le comptoir et revenir au jeu');
    header.append(heading, this.closeButton);
    const description = this.node('p', 'ship-port-v87__description',
      'Relais mobile de proximité · rencontre et adoption dans votre secteur actuel.');
    description.id = 'ship-port-v87-description';
    this.phaseLabel = this.node('p', 'ship-port-v87__phase');
    this.progress = this.node('progress', 'ship-port-v87__progress'); this.progress.max = 1;
    this.progress.setAttribute('aria-label', 'Progression de la manœuvre locale');
    this.message = this.node('p', 'ship-port-v87__message'); this.message.setAttribute('role', 'status'); this.message.setAttribute('aria-live', 'polite');
    this.errorLabel = this.node('p', 'ship-port-v87__error'); this.errorLabel.setAttribute('role', 'alert'); this.errorLabel.hidden = true;
    this.terminalPanel = this.node('section', 'ship-port-v87__terminal'); this.terminalPanel.setAttribute('aria-label', 'Contrôle de l’escale');
    this.terminalPanel.append(this.node('p', '', 'Accès commercial uniquement après autorisation et amarrage physique. Frais d’escale : 0 CR.'));
    const terminalActions = this.node('div', 'ship-port-v87__actions');
    this.dockButton = this.button('Demander l’amarrage local', () => { void this.dispatch('dock'); }, 'dock');
    this.undockButton = this.button('Demander le largage', () => { void this.dispatch('undock'); }, 'undock');
    this.abortButton = this.button('Annuler l’approche', () => { void this.dispatch('abort'); }, 'abort');
    terminalActions.append(this.dockButton, this.undockButton, this.abortButton); this.terminalPanel.append(terminalActions);
    this.shopPanel = this.node('section', 'ship-port-v87__shop'); this.shopPanel.setAttribute('aria-label', 'Compagnons de la Frontière');
    this.tabs = this.node('div', 'ship-port-v87__tabs'); this.tabs.setAttribute('role', 'tablist'); this.tabs.setAttribute('aria-label', 'Individus disponibles');
    this.tabButtons = new Map();
    for (const id of ANIMAL_IDS) {
      const button = this.button(SHIP_ANIMAL_DEFINITIONS_V87[id].name, () => this.select(id));
      button.id = `ship-port-v87-tab-${id}`; button.dataset.animalId = id; button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'ship-port-v87-dossier');
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const ids = ANIMAL_IDS.filter(candidate => !this.tabButtons.get(candidate).hidden);
        if (!ids.length) return;
        const current = ids.indexOf(this.selectedAnimalId);
        const next = event.key === 'Home' ? ids[0] : event.key === 'End' ? ids.at(-1)
          : ids[(current + (event.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
        this.select(next); focus(this.tabButtons.get(next));
      });
      this.tabButtons.set(id, button); this.tabs.append(button);
    }
    const dossier = this.node('div', 'ship-port-v87__dossier'); dossier.id = 'ship-port-v87-dossier'; dossier.setAttribute('role', 'tabpanel');
    this.dossier = dossier;
    const visual = this.node('figure', 'ship-port-v87__visual');
    this.canvas = this.node('canvas', 'ship-port-v87__preview'); this.canvas.width = 320; this.canvas.height = 144;
    this.canvas.setAttribute('role', 'img');
    this.previewStatus = this.node('figcaption', 'ship-port-v87__caption'); visual.append(this.canvas, this.previewStatus);
    this.offerName = this.node('h3', 'ship-port-v87__name'); this.appearance = this.node('p', 'ship-port-v87__appearance');
    this.traits = this.node('p', 'ship-port-v87__traits');
    this.memberDossiers = this.node('section', 'ship-port-v87__members');
    this.memberDossiers.setAttribute('aria-label', 'Dossiers des deux membres du duo'); this.memberDossiers.hidden = true;
    this.details = this.node('div', 'ship-port-v87__details'); this.details.hidden = true;
    this.biography = this.node('p', 'ship-port-v87__biography'); this.habitat = this.node('p', 'ship-port-v87__habitat');
    this.price = this.node('p', 'ship-port-v87__price');
    this.details.append(this.biography, this.habitat, this.price,
      this.node('p', 'ship-port-v87__terms', 'Caisse et contrôle d’arrivée compris. Après l’adoption, transportez votre compagnon jusqu’à l’accueil animalier de l’USS Tantalus.'));
    this.conditions = this.node('ul', 'ship-port-v87__conditions'); this.conditions.setAttribute('aria-label', 'Conditions manquantes');
    const shopActions = this.node('div', 'ship-port-v87__actions');
    this.examineButton = this.button('Examiner le dossier', () => this.examine(), 'examine');
    this.confirmButton = this.button('Confirmation indisponible', () => { void this.dispatch('buy'); }, 'buy'); this.confirmButton.disabled = true;
    shopActions.append(this.examineButton, this.confirmButton);
    const information = this.node('div', 'ship-port-v87__information');
    information.append(this.offerName, this.appearance, this.traits, this.memberDossiers, this.details, this.conditions, shopActions);
    dossier.append(visual, information); this.shopPanel.append(this.tabs, dossier);
    dialog.append(header, description, this.phaseLabel, this.progress, this.message, this.errorLabel, this.terminalPanel, this.shopPanel);
    this.document.body.append(dialog); this.dialog = dialog;
  }

  readModel() {
    try { const value = this.getModel(); return record(value) ? value : {}; }
    catch (error) { this.error = `Comptoir indisponible : ${string(error?.message) || 'état inaccessible'}`; return {}; }
  }

  offerFrom(model = this.model) {
    if (!ANIMAL_IDS.includes(this.selectedAnimalId)) return null;
    return Array.isArray(model.offers) ? model.offers.find(offer => record(offer) && memberIds(offer).includes(this.selectedAnimalId)) || null : null;
  }

  signature(offer) {
    return offer ? JSON.stringify([offer.offerId, offer.vendorId, memberIds(offer), offer.costCredits, string(offer.name), string(offer.appearance),
      string(offer.biography), string(offer.habitatLabel), Array.isArray(offer.traits) ? offer.traits.map(string) : [],
      Array.isArray(offer.members) ? offer.members.map(member => [member.id, string(member.name), string(member.appearance), string(member.biography), member.traits]) : []]) : null;
  }

  conditionsFor(offer) { return Array.isArray(offer?.conditions) ? offer.conditions.filter(value => typeof value === 'string' && value.trim()) : []; }

  canBuy(model, offer) {
    const ids = memberIds(offer), source = SHIP_ANIMAL_OFFERS_V87[offer?.offerId];
    const validGroup = ids.length <= 1 || source?.vendorId === offer.vendorId
      && JSON.stringify(ids) === JSON.stringify(getShipAnimalOfferMembersV87(source));
    return this.mode === 'shop' && !this.pending && model.busy !== true && offer?.owned !== true && offer?.canBuy === true
      && ids.length > 0 && ids.every(id => ANIMAL_IDS.includes(id)) && validGroup
      && Number.isSafeInteger(offer.costCredits) && offer.costCredits >= 0 && this.conditionsFor(offer).length === 0
      && this.examinedSignature !== null && this.examinedSignature === this.signature(offer);
  }

  open({ mode = 'terminal', animalId } = {}) {
    if (this.destroyed || !['terminal', 'shop'].includes(mode) || typeof this.dialog.showModal !== 'function') return false;
    const alreadyOpen = this.isOpen;
    if (!alreadyOpen) { this.previousFocus = this.document.activeElement; this.epoch++; this.error = ''; this.examinedSignature = null; }
    this.mode = mode;
    if (ANIMAL_IDS.includes(animalId)) this.selectedAnimalId = animalId;
    this.refresh();
    if (!alreadyOpen) {
      try { this.dialog.showModal(); this.opened = true; }
      catch (error) { this.error = `Ouverture impossible : ${string(error?.message)}`; this.stopAnimation(); return false; }
    }
    this.syncAnimation();
    focus(mode === 'shop' && !this.examineButton.disabled ? this.examineButton : this.closeButton);
    return true;
  }

  select(animalId) {
    if (!this.isOpen || this.pending || !ANIMAL_IDS.includes(animalId)) return false;
    this.selectedAnimalId = animalId; this.examinedSignature = null; this.error = ''; this.animationSeconds = 0;
    this.refresh(); return true;
  }

  examine() {
    if (!this.isOpen || this.mode !== 'shop' || this.pending) return false;
    this.model = this.readModel(); const offer = this.offerFrom();
    if (!offer || this.model.busy === true) { this.refresh(); return false; }
    this.examinedSignature = this.signature(offer); this.error = ''; this.refresh();
    if (!this.confirmButton.disabled) focus(this.confirmButton);
    return true;
  }

  refresh() {
    if (this.destroyed) return false;
    this.model = this.readModel(); const model = this.model;
    const offerIds = Array.isArray(model.offers) ? model.offers.filter(record).flatMap(memberIds) : [];
    if (!offerIds.includes(this.selectedAnimalId)) this.selectedAnimalId = ANIMAL_IDS.find(id => offerIds.includes(id)) || null;
    const offer = this.offerFrom(), locked = this.pending || model.busy === true;
    if (this.examinedSignature !== this.signature(offer)) this.examinedSignature = null;
    const phaseLabel = Object.hasOwn(PHASE_LABELS, model.phase) ? PHASE_LABELS[model.phase] : string(model.phase);
    this.heading.textContent = this.mode === 'shop' && string(model.vendorName) ? model.vendorName : 'Relais civil de la Frontière';
    this.phaseLabel.textContent = `ESCALE · ${phaseLabel || 'État indisponible'}`;
    this.progress.value = typeof model.progress === 'number' && Number.isFinite(model.progress) ? Math.max(0, Math.min(1, model.progress)) : 0;
    this.message.textContent = string(model.message); this.errorLabel.textContent = this.error; this.errorLabel.hidden = !this.error;
    this.terminalPanel.hidden = this.mode !== 'terminal'; this.shopPanel.hidden = this.mode !== 'shop';
    this.dockButton.disabled = locked || model.canDock !== true;
    this.undockButton.disabled = locked || model.canUndock !== true;
    this.abortButton.disabled = locked || !ABORTABLE_PHASES.has(model.phase);
    for (const [id, button] of this.tabButtons) {
      const selected = id === this.selectedAnimalId; button.hidden = !offerIds.includes(id); button.disabled = locked;
      button.tabIndex = selected ? 0 : -1; button.setAttribute('aria-selected', String(selected));
      const entry = Array.isArray(model.offers) && model.offers.find(candidate => memberIds(candidate).includes(id));
      button.textContent = memberIds(entry).length > 1 ? SHIP_ANIMAL_DEFINITIONS_V87[id].name
        : string(entry?.name) || SHIP_ANIMAL_DEFINITIONS_V87[id].name;
    }
    this.dossier.setAttribute('aria-labelledby', `ship-port-v87-tab-${this.selectedAnimalId}`);
    this.offerName.textContent = string(offer?.name) || 'Aucune offre disponible';
    this.appearance.textContent = string(offer?.appearance);
    this.traits.textContent = Array.isArray(offer?.traits) ? offer.traits.map(string).filter(Boolean).join(' · ') : string(offer?.traits);
    this.biography.textContent = string(offer?.biography);
    const group = memberIds(offer).length > 1;
    this.memberDossiers.hidden = !group;
    this.appearance.hidden = group; this.traits.hidden = group; this.biography.hidden = group;
    this.memberDossiers.replaceChildren(...(group ? memberIds(offer).map(id => {
      const member = offer.members?.find(entry => entry.id === id) || SHIP_ANIMAL_DEFINITIONS_V87[id];
      const section = this.node('section', 'ship-port-v87__member'); section.dataset.animalId = id;
      section.append(this.node('h4', '', string(member?.name)), this.node('p', '', string(member?.appearance)),
        this.node('p', '', string(member?.biography)), this.node('p', '', Array.isArray(member?.traits) ? member.traits.map(string).join(' · ') : ''));
      return section;
    }) : []));
    this.habitat.textContent = `Habitat requis : ${string(offer?.habitatLabel) || 'non disponible'}`;
    const validCost = Number.isSafeInteger(offer?.costCredits) && offer.costCredits >= 0;
    this.price.textContent = validCost ? `Coût total${group ? ' du duo indivisible' : ''} : ${offer.costCredits} CR` : 'Tarif indisponible';
    this.details.hidden = !offer || this.examinedSignature === null;
    this.conditions.replaceChildren(...this.conditionsFor(offer).map(condition => this.node('li', '', condition)));
    this.conditions.hidden = this.conditions.children.length === 0;
    this.examineButton.disabled = locked || !offer;
    this.examineButton.textContent = this.examinedSignature === null ? 'Examiner le dossier' : 'Dossier examiné';
    this.confirmButton.textContent = offer?.owned === true ? (group ? 'Duo déjà acquis' : 'Individu déjà acquis') : validCost ? `Confirmer${group ? ' le duo —' : ''} ${offer.costCredits} CR` : 'Confirmation indisponible';
    this.confirmButton.disabled = !this.canBuy(model, offer);
    this.canvas.setAttribute('aria-label', `Prévisualisation de ${string(offer?.name) || 'l’individu'} à échelle constante`);
    this.paintPreview(); this.syncAnimation(); return true;
  }

  async dispatch(type) {
    if (!this.isOpen || this.pending) return false;
    const model = this.readModel(), offer = this.offerFrom(model);
    const allowed = model.busy !== true && (type === 'buy' ? this.canBuy(model, offer)
      : this.mode === 'terminal' && (type === 'dock' ? model.canDock === true : type === 'undock' ? model.canUndock === true
        : type === 'abort' && ABORTABLE_PHASES.has(model.phase)));
    if (!allowed) { this.refresh(); return false; }
    const epoch = this.epoch, action = type === 'buy' ? memberIds(offer).length > 1
      ? { type, offerId: offer.offerId } : { type, animalId: offer.animalId } : { type };
    this.pending = true; this.error = ''; this.refresh();
    try {
      const result = await this.onAction(action);
      if (result === false && this.epoch === epoch) this.error = 'Action non appliquée. Vérifiez les conditions affichées.';
      return result !== false;
    } catch (error) {
      if (this.epoch === epoch) this.error = `Action non enregistrée : ${string(error?.message) || 'erreur de sauvegarde'}`;
      return false;
    } finally {
      if (this.epoch === epoch && !this.destroyed) { this.pending = false; if (this.isOpen) this.refresh(); }
    }
  }

  imageFor(animalId) {
    if (!ANIMAL_IDS.includes(animalId) || !Object.hasOwn(SHIP_ANIMAL_ATLASES_V87, animalId)) return null;
    if (!this.images.has(animalId)) {
      const image = this.document.createElement('img');
      image.onload = () => { if (this.isOpen) this.paintPreview(); };
      image.onerror = () => { if (this.isOpen) this.paintPreview(); };
      image.src = SHIP_ANIMAL_ATLASES_V87[animalId].path; this.images.set(animalId, image);
    }
    return this.images.get(animalId);
  }

  paintPreview() {
    if (this.destroyed || this.mode !== 'shop') return;
    const ctx = this.canvas.getContext?.('2d'), offer = this.offerFrom();
    if (!ctx) { this.previewStatus.textContent = 'Prévisualisation indisponible sur cet appareil.'; return; }
    ctx.clearRect(0, 0, 320, 144);
    const ids = memberIds(offer), images = ids.map(id => this.imageFor(id));
    if (!ids.length || images.some((image, index) => !image || !isShipAnimalAtlasReadyV87(ids[index], image))) {
      this.previewStatus.textContent = offer ? 'Planche dédiée indisponible ou en chargement.' : 'Aucune planche à afficher.'; return;
    }
    ctx.imageSmoothingEnabled = false;
    ids.forEach((animalId, index) => drawShipAnimalV87(ctx, images[index], { animalId, x: ids.length === 1 ? 160 : 112 + index * 96,
      y: 122, facing: 1, clipId: 'idle', elapsed: this.model.reducedMotion === true ? 0 : this.animationSeconds }));
    this.previewStatus.textContent = 'Échelle constante entre individus · marine de référence : 92 px.';
  }

  stopAnimation() {
    if (this.frameHandle !== null) this.window.cancelAnimationFrame?.(this.frameHandle);
    this.frameHandle = null; this.lastFrameTime = null;
  }

  syncAnimation() {
    const animate = this.isOpen && this.mode === 'shop' && this.model.reducedMotion !== true && this.document.visibilityState !== 'hidden';
    if (!animate || typeof this.window.requestAnimationFrame !== 'function') { this.stopAnimation(); return; }
    if (this.frameHandle !== null) return;
    this.frameHandle = this.window.requestAnimationFrame(time => {
      this.frameHandle = null;
      if (!this.isOpen || this.document.visibilityState === 'hidden') return;
      if (this.lastFrameTime !== null) this.animationSeconds += Math.max(0, Math.min(.1, (time - this.lastFrameTime) / 1000));
      this.lastFrameTime = time; this.paintPreview(); this.syncAnimation();
    });
  }

  close({ notify = true } = {}) {
    if (this.destroyed || !this.opened) return false;
    this.opened = false; this.epoch++; this.pending = false; this.examinedSignature = null; this.stopAnimation();
    if (this.dialog.open) this.dialog.close();
    const previous = this.previousFocus; this.previousFocus = null; focus(previous);
    if (notify && typeof this.onClose === 'function') this.onClose();
    return true;
  }

  destroy() {
    if (this.destroyed) return false;
    this.close({ notify: false }); this.stopAnimation(); this.epoch++; this.destroyed = true;
    this.dialog.removeEventListener('cancel', this.boundCancel); this.dialog.removeEventListener('close', this.boundClose);
    this.dialog.removeEventListener('keydown', this.boundKeydown); this.document.removeEventListener('visibilitychange', this.boundVisibility);
    for (const image of this.images.values()) { image.onload = null; image.onerror = null; }
    this.images.clear(); this.dialog.remove(); this.onAction = null; this.onClose = null; this.getModel = null;
    return true;
  }
}
