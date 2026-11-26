// The host catalog lists only installed expeditions. Each expedition keeps its
// own runtime and saves; this menu never reads or changes any save store.
export const DLC_EXPEDITIONS = Object.freeze([
  Object.freeze({ id: 'avp-2004', title: 'AVP · Sous la glace', version: '0.11.0',
    href: '/src/dlc/avp-2004/index.html' }),
  Object.freeze({ id: 'alien-isolation', title: 'Alien: Isolation · Dernière transmission', version: '0.8.0',
    href: '/dlc/alien-isolation/index.html' })
]);

const TEXT = Object.freeze({
  fr: Object.freeze({ title: 'Extensions', eyebrow: 'EXPÉDITIONS TANTALUS',
    back: 'Retour au menu principal',
    play: 'Ouvrir l’expédition', loading: 'Ouverture de l’expédition…',
    error: 'L’expédition n’a pas pu être ouverte. Réessayez ou revenez au menu.' }),
  en: Object.freeze({ title: 'Expansions', eyebrow: 'TANTALUS EXPEDITIONS',
    back: 'Back to the main menu',
    play: 'Open the expedition', loading: 'Opening the expedition…',
    error: 'The expedition could not be opened. Try again or return to the menu.' })
});

const EXPEDITION_TEXT = Object.freeze({
  'avp-2004': Object.freeze({
    fr: Object.freeze({ film: 'AVP · 2004', title: 'Sous la glace',
      description: 'Rejoignez l’expédition de Bouvetøya. Explorez la station baleinière et les profondeurs de la pyramide.',
      notebooks: 'Choisissez une nouvelle partie ou reprenez l’un de vos trois carnets dans le menu de l’expédition.',
      independence: 'Les carnets de cette expédition sont distincts de votre campagne Tantalus.' }),
    en: Object.freeze({ film: 'AVP · 2004', title: 'Under the Ice',
      description: 'Join the Bouvetøya expedition. Explore the whaling station and the depths of the pyramid.',
      notebooks: 'Start a new game or resume one of your three notebooks from the expedition menu.',
      independence: 'This expedition’s notebooks are separate from your Tantalus campaign.' })
  }),
  'alien-isolation': Object.freeze({
    fr: Object.freeze({ film: 'Alien: Isolation · Sevastopol', title: 'Dernière transmission',
      description: 'Accompagnez Amanda Ripley dans les coursives de Sevastopol. Cherchez un passage, économisez vos ressources et échappez au chasseur.',
      notebooks: 'Commencez une nouvelle partie ou reprenez votre sauvegarde. Le menu de l’expédition permet aussi de l’exporter et de l’importer.',
      independence: 'La sauvegarde de cette expédition est distincte de votre campagne Tantalus et des autres extensions.' }),
    en: Object.freeze({ film: 'Alien: Isolation · Sevastopol', title: 'Last Transmission',
      description: 'Follow Amanda Ripley through Sevastopol. Find a route, conserve your supplies and evade the hunter. This expedition is presented in French.',
      notebooks: 'Start a new game or resume your save. The expedition menu also lets you export and import it.',
      independence: 'This expedition’s save is separate from your Tantalus campaign and the other expansions.' })
  })
});

const CSS = `
.atf-dlc-menu{box-sizing:border-box;width:min(680px,calc(100vw - 32px));max-height:calc(100dvh - 32px);margin:auto;padding:28px;border:1px solid #48656a;border-radius:5px;background:#071419;color:#deeded;box-shadow:0 20px 90px #000b;font:16px/1.5 system-ui,sans-serif;overflow:auto;color-scheme:dark}
.atf-dlc-menu::backdrop{background:#01080def;backdrop-filter:blur(5px)}
.atf-dlc-menu h1{font-size:clamp(25px,5vw,36px);letter-spacing:.05em;margin:0 0 20px}.atf-dlc-menu h2{font-size:28px;line-height:1.2;margin:5px 0 18px}
.atf-dlc-menu .dlc-eyebrow{font-size:11px;letter-spacing:.2em;color:#8cc8ca;margin:0 0 8px}
.atf-dlc-menu .dlc-card{padding:24px;border:1px solid #36525c;background:linear-gradient(155deg,#15323d,#0a1920 70%);border-radius:4px}
.atf-dlc-menu .dlc-card+.dlc-card{margin-top:18px}
.atf-dlc-menu .dlc-card p{margin:12px 0}.atf-dlc-menu .dlc-meta{font-size:12px;color:#abc1c8}.atf-dlc-menu .dlc-note{font-size:14px;color:#abc1c8}
.atf-dlc-menu button{min-height:48px;max-width:100%;padding:10px 16px;font:600 15px/1.4 system-ui,sans-serif;white-space:normal;color:#def0f0;border:1px solid #5a7b83;background:#152c34;border-radius:3px;cursor:pointer}
.atf-dlc-menu button:focus-visible{outline:3px solid #a1f3e4;outline-offset:4px}.atf-dlc-menu .dlc-play{background:#a3dbd2;color:#071b20;border-color:#c6fff3;width:100%;margin-top:12px}
.atf-dlc-menu button:disabled{opacity:.65;cursor:wait}.atf-dlc-menu .dlc-back{margin-top:20px}.atf-dlc-menu .dlc-status{min-height:1.5em;margin:14px 0 0;font-size:14px;color:#c7dedf}
@media(max-width:480px){.atf-dlc-menu{padding:18px;width:calc(100vw - 20px);max-height:calc(100dvh - 20px)}.atf-dlc-menu .dlc-card{padding:18px}.atf-dlc-menu .dlc-back{width:100%}}
`;

export function expeditionById(id) {
  return DLC_EXPEDITIONS.find(entry => entry.id === id) || null;
}

export class DlcMenu {
  constructor({ documentRef = globalThis.document, windowRef = globalThis, onLaunch, onClose } = {}) {
    if (!documentRef?.createElement || typeof onLaunch !== 'function') throw new TypeError('DLC menu requires a document and launch handler.');
    this.document = documentRef;
    this.window = windowRef;
    this.onLaunch = onLaunch;
    this.onClose = onClose;
    this.isOpen = false;
    this.launching = false;
    this.frame = 0;
    this.pads = new Map();
    this.listeners = [];
    const node = (tag, className, text) => {
      const element = documentRef.createElement(tag);
      if (className) element.className = className;
      if (text) element.textContent = text;
      return element;
    };
    this.style = node('style', '', CSS);
    this.dialog = node('dialog', 'atf-dlc-menu');
    this.dialog.id = 'dlc-expeditions';
    this.dialog.setAttribute('aria-labelledby', 'dlc-expeditions-title');
    this.eyebrow = node('p', 'dlc-eyebrow');
    this.heading = node('h1'); this.heading.id = 'dlc-expeditions-title';
    this.cards = DLC_EXPEDITIONS.map(entry => {
      const card = node('article', 'dlc-card'); card.dataset.dlc = entry.id;
      const meta = node('p', 'dlc-meta'), title = node('h2'), description = node('p');
      const notebooks = node('p', 'dlc-note'), independence = node('p', 'dlc-note');
      title.id = `dlc-title-${entry.id}`; card.setAttribute('aria-labelledby', title.id);
      const playButton = node('button', 'dlc-play'); playButton.type = 'button';
      playButton.dataset.dlcLaunch = entry.id;
      card.append(meta, title, description, notebooks, independence, playButton);
      return { entry, card, meta, title, description, notebooks, independence, playButton };
    });
    this.playButtons = this.cards.map(card => card.playButton);
    // Preserve the original AVP element handles used by host QA and extensions.
    for (const name of ['card', 'meta', 'title', 'description', 'notebooks', 'independence', 'playButton']) this[name] = this.cards[0][name];
    this.backButton = node('button', 'dlc-back'); this.backButton.type = 'button';
    this.status = node('p', 'dlc-status'); this.status.setAttribute('role', 'status');
    this.dialog.append(this.eyebrow, this.heading, ...this.cards.map(card => card.card), this.backButton, this.status);
    documentRef.head.append(this.style);
    documentRef.body.append(this.dialog);
    const listen = (target, type, callback) => {
      target.addEventListener(type, callback);
      this.listeners.push(() => target.removeEventListener(type, callback));
    };
    for (const card of this.cards) listen(card.playButton, 'click', () => { void this.launch(card.entry.id); });
    listen(this.backButton, 'click', () => this.close());
    listen(this.dialog, 'cancel', event => { event.preventDefault(); this.close(); });
    listen(this.dialog, 'keydown', event => this.handleKeydown(event));
    listen(this.document, 'visibilitychange', () => this.pads.clear());
  }

  open({ language = 'fr' } = {}) {
    if (this.isOpen) return;
    const locale = Object.hasOwn(TEXT, language) ? language : 'fr';
    this.text = TEXT[locale];
    this.eyebrow.textContent = this.text.eyebrow;
    this.heading.textContent = this.text.title;
    for (const card of this.cards) {
      const text = EXPEDITION_TEXT[card.entry.id][locale];
      card.meta.textContent = `${text.film} · v${card.entry.version}`;
      card.title.textContent = text.title;
      card.description.textContent = text.description;
      card.notebooks.textContent = text.notebooks;
      card.independence.textContent = text.independence;
      card.playButton.textContent = this.text.play;
      card.playButton.setAttribute('aria-label', `${this.text.play} — ${text.film} : ${text.title}`);
    }
    this.backButton.textContent = this.text.back;
    this.status.textContent = '';
    this.launching = false;
    this.setLaunchingDisabled(false);
    this.isOpen = true;
    this.pads.clear();
    try { this.dialog.showModal(); }
    catch (error) { this.isOpen = false; throw error; }
    this.playButton.focus();
    this.startGamepads();
  }

  close() {
    if (!this.isOpen || this.launching) return false;
    this.isOpen = false;
    this.stopGamepads();
    this.dialog.close();
    this.onClose?.();
    return true;
  }

  async launch(id) {
    const entry = expeditionById(id);
    if (!this.isOpen || this.launching || !entry) return false;
    this.launching = true;
    this.setLaunchingDisabled(true);
    this.status.textContent = this.text.loading;
    try {
      await this.onLaunch(entry);
      return true; // Navigation owns unloading. Do not briefly reopen the host.
    } catch {
      this.launching = false;
      this.setLaunchingDisabled(false);
      this.status.textContent = this.text.error;
      this.cards.find(card => card.entry.id === id).playButton.focus();
      return false;
    }
  }

  setLaunchingDisabled(disabled) {
    for (const button of [...this.playButtons, this.backButton]) button.disabled = disabled;
  }

  moveFocus(direction) {
    const buttons = [...this.playButtons, this.backButton];
    const current = buttons.indexOf(this.document.activeElement);
    const next = current < 0 ? (direction < 0 ? buttons.length - 1 : 0) : (current + direction + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  handleKeydown(event) {
    if (!this.isOpen || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'NumpadEnter', 'Space'].includes(event.code)) return;
    event.preventDefault(); event.stopPropagation();
    if (event.repeat || this.launching) return;
    if (event.code === 'Escape') this.close();
    else if (['Enter', 'NumpadEnter', 'Space'].includes(event.code)) this.document.activeElement?.click();
    else if (event.code === 'Home') this.playButton.focus();
    else if (event.code === 'End') this.backButton.focus();
    else this.moveFocus(event.code === 'ArrowUp' || event.code === 'ArrowLeft' || event.code === 'Tab' && event.shiftKey ? -1 : 1);
  }

  pollGamepads(pads) {
    if (!this.isOpen || this.document.hidden || this.document.hasFocus?.() === false || this.launching) { this.pads.clear(); return; }
    const connected = new Set();
    let consumed = false;
    for (const pad of Array.from(pads || [])) {
      if (!pad || pad.connected === false || pad.mapping !== 'standard') continue;
      const key = `${pad.index}:${pad.id}`;
      connected.add(key);
      const down = index => Boolean(pad.buttons?.[index]?.pressed || pad.buttons?.[index]?.value > .55);
      const axis = Number.isFinite(pad.axes?.[1]) ? pad.axes[1] : 0;
      const input = { accept: down(0) || down(9), back: down(1), up: down(12) || axis < -.55, down: down(13) || axis > .55 };
      const previous = this.pads.get(key) || { ...input, suppressed: true };
      if (previous.suppressed && !Object.values(input).some(Boolean) && Math.abs(axis) < .35) previous.suppressed = false;
      const edge = action => input[action] && !previous[action] && !previous.suppressed;
      if (!consumed) {
        if (edge('back')) { this.close(); consumed = true; }
        else if (edge('up') || edge('down')) { this.moveFocus(edge('up') ? -1 : 1); consumed = true; }
        else if (edge('accept')) { this.document.activeElement?.click(); consumed = true; }
      }
      if (!this.isOpen) return;
      this.pads.set(key, { ...input, suppressed: previous.suppressed });
    }
    for (const key of this.pads.keys()) if (!connected.has(key)) this.pads.delete(key);
  }

  startGamepads() {
    this.stopGamepads();
    if (!this.window.navigator?.getGamepads || !this.window.requestAnimationFrame) return;
    const poll = () => {
      this.frame = 0;
      if (!this.isOpen) return;
      try { this.pollGamepads(this.window.navigator.getGamepads()); }
      catch { this.pads.clear(); }
      if (this.isOpen) this.frame = this.window.requestAnimationFrame(poll);
    };
    this.frame = this.window.requestAnimationFrame(poll);
  }

  stopGamepads() {
    if (this.frame) this.window.cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pads.clear();
  }

  destroy() {
    this.isOpen = false;
    this.stopGamepads();
    this.listeners.splice(0).forEach(remove => remove());
    this.dialog.remove();
    this.style.remove();
  }
}
