export const TITLE_SCREEN_SCHEMA = 61;

export function resolveTitleContinueTarget(save) {
  if (save?.strategy?.currentOperation) return 'operations';
  if (save?.scene === 'mission') return 'operations';
  return save?.scene === 'command' ? 'command' : 'hub';
}

const START_KEYS = new Set(['Enter', 'Space', 'NumpadEnter']);
const MENU_KEYS = new Set([...START_KEYS, 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'Escape']);

export class TitleScreenController {
  constructor({ root, app, scene = null, getSave, getRecoveryStatus = () => null, onUnlock, onContinue, onNewTimeline, onForge, onOptions }) {
    if (!root || !app) throw new Error('Surface écran titre V61 absente.');
    this.root = root;
    this.app = app;
    this.scene = scene;
    this.getSave = getSave;
    this.getRecoveryStatus = getRecoveryStatus;
    this.onUnlock = onUnlock;
    this.onContinue = onContinue;
    this.onNewTimeline = onNewTimeline;
    this.onForge = onForge;
    this.onOptions = onOptions;
    this.state = 'idle';
    this.gamepadFrame = 0;
    this.gamepads = new Map();
    this.focusFrame = 0;
    this.listeners = [];
    this.confirmSave = null;
    this.confirmTimer = 0;
    this.startButton = root.querySelector('#title-start');
    this.menu = root.querySelector('#title-menu');
    this.continueButton = root.querySelector('#title-continue');
    this.newButton = root.querySelector('#title-new');
    this.forgeButton = root.querySelector('#title-forge');
    this.optionsButton = root.querySelector('#title-options');
    this.profileStatus = root.querySelector('#title-profile-status');
    this.liveStatus = root.querySelector('#title-live-status');
    this.recoveryWarning = root.querySelector('#title-recovery-warning');
    this.bind();
  }

  bind() {
    const listen = (target, type, listener) => {
      target.addEventListener(type, listener);
      this.listeners.push(() => target.removeEventListener(type, listener));
    };
    for (const [button, action] of [[this.startButton, 'openMenu'], [this.continueButton, 'continueGame'],
      [this.optionsButton, 'openOptions'], [this.newButton, 'requestNewTimeline'], [this.forgeButton, 'openForge']]) {
      listen(button, 'click', (event) => {
        // A double click is a single intention, never confirmation of an overwrite.
        if (event.detail > 1) return;
        this[action]();
      });
    }
    listen(this.newButton, 'blur', () => this.cancelNewTimelineConfirmation());
    listen(globalThis, 'keydown', (event) => this.handleKeydown(event));
    listen(globalThis, 'resize', () => this.resetHorizontalScroll());
    listen(globalThis, 'blur', () => this.suspendInput());
    listen(document, 'visibilitychange', () => { if (document.hidden) this.suspendInput(); });
  }

  suspendInput() {
    this.cancelNewTimelineConfirmation();
    this.gamepads.clear();
  }

  focusButton(button) {
    button?.focus({ preventScroll: true });
    button?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    this.resetHorizontalScroll();
  }

  resetHorizontalScroll() {
    if (this.root) this.root.scrollLeft = 0;
  }

  scheduleFocus(button, state) {
    if (this.focusFrame) cancelAnimationFrame(this.focusFrame);
    this.focusFrame = requestAnimationFrame(() => {
      this.focusFrame = 0;
      if (!this.root.hidden && this.state === state) this.focusButton(button);
    });
  }

  menuButtons() {
    return [this.continueButton, this.newButton, this.forgeButton, this.optionsButton]
      .filter((button) => button && !button.hidden && !button.disabled);
  }

  moveFocus(direction, absolute = false) {
    const buttons = this.menuButtons();
    if (!buttons.length) return;
    const current = buttons.indexOf(document.activeElement);
    const index = absolute ? (direction < 0 ? 0 : buttons.length - 1)
      : current < 0 ? (direction < 0 ? buttons.length - 1 : 0)
        : (current + direction + buttons.length) % buttons.length;
    this.focusButton(buttons[index]);
  }

  activateFocused() {
    if (this.root.hidden || this.state !== 'menu') return;
    const button = this.menuButtons().find((entry) => entry === document.activeElement);
    if (button) button.click();
    else this.focusButton(this.continueButton);
  }

  show() {
    const save = this.getSave();
    const recovery = this.getRecoveryStatus();
    this.cancelNewTimelineConfirmation();
    this.root.hidden = false;
    this.resetHorizontalScroll();
    this.app.hidden = true;
    this.root.dataset.state = 'idle';
    this.state = 'idle';
    this.menu.hidden = true;
    this.startButton.hidden = false;
    this.continueButton.disabled = Boolean(recovery);
    if (this.recoveryWarning) {
      this.recoveryWarning.hidden = !recovery;
      this.recoveryWarning.textContent = recovery ? `Profil ${recovery.profile} inaccessible. Sauvegarde préservée. Ouvrez Système pour récupérer les données ou choisir un autre profil.` : '';
    }
    this.continueButton.textContent = save?.strategy?.currentOperation
      ? 'REPRENDRE L’OPÉRATION'
      : save?.statistics?.playSeconds > 0 ? 'CONTINUER' : 'ENTRER SUR LE TANTALUS';
    const day = String(save?.clock?.day || 1).padStart(2, '0');
    const hour = String(Math.floor(save?.clock?.hour || 0)).padStart(2, '0');
    const minute = String(Math.floor(((save?.clock?.hour || 0) % 1) * 60 + 0.000001)).padStart(2, '0');
    this.profileStatus.textContent = 'PROFIL ' + (save?.profile || 1) + ' · J' + day + ' ' + hour + ':' + minute + ' · SAUVEGARDE LOCALE';
    if (recovery) this.profileStatus.textContent = `PROFIL ${recovery.profile} · RÉCUPÉRATION REQUISE`;
    this.liveStatus.textContent = 'Écran titre. Appuyez pour ouvrir le menu principal.';
    document.documentElement.classList.add('title-mode');
    this.scene?.show?.(save);
    this.scheduleFocus(this.startButton, 'idle');
    this.startGamepadPolling();
  }

  hide() {
    this.cancelNewTimelineConfirmation();
    this.stopGamepadPolling();
    if (this.focusFrame) cancelAnimationFrame(this.focusFrame);
    this.focusFrame = 0;
    this.root.hidden = true;
    this.app.hidden = false;
    this.scene?.hide?.();
    document.documentElement.classList.remove('title-mode');
    this.state = 'closed';
    this.root.dataset.state = 'closed';
  }

  openMenu() {
    if (this.root.hidden || this.state !== 'idle') return;
    this.onUnlock?.();
    this.state = 'menu';
    this.root.dataset.state = 'menu';
    this.startButton.hidden = true;
    this.menu.hidden = false;
    this.liveStatus.textContent = 'Menu principal ouvert.';
    this.focusButton(this.menuButtons()[0]);
  }

  closeMenu() {
    if (this.root.hidden || this.state !== 'menu') return;
    this.cancelNewTimelineConfirmation();
    this.state = 'idle';
    this.root.dataset.state = 'idle';
    this.menu.hidden = true;
    this.startButton.hidden = false;
    this.liveStatus.textContent = 'Menu fermé. Appuyez pour commencer.';
    this.focusButton(this.startButton);
  }

  continueGame() {
    if (this.root.hidden || this.state !== 'menu' || this.getRecoveryStatus()) return;
    const target = resolveTitleContinueTarget(this.getSave());
    this.hide();
    this.onContinue?.(target);
  }

  openOptions() {
    if (this.root.hidden || this.state !== 'menu') return;
    this.hide();
    this.onOptions?.();
  }

  openForge() {
    if (this.root.hidden || this.state !== 'menu') return;
    this.hide();
    this.onForge?.();
  }

  requestNewTimeline() {
    if (this.root.hidden || this.state !== 'menu') return;
    if (this.newButton.dataset.confirm !== 'true') {
      this.confirmSave = this.getSave();
      this.confirmRecovery = this.getRecoveryStatus();
      this.newButton.dataset.confirm = 'true';
      this.newButton.textContent = 'CONFIRMER LA NOUVELLE PARTIE';
      this.liveStatus.textContent = 'Confirmez pour remplacer la partie du profil ' + (this.confirmRecovery?.profile || this.confirmSave?.profile || 1) + '.';
      clearTimeout(this.confirmTimer);
      this.confirmTimer = setTimeout(() => this.cancelNewTimelineConfirmation(), 5000);
      return;
    }
    if (this.confirmSave !== this.getSave() || this.confirmRecovery !== this.getRecoveryStatus()) {
      this.cancelNewTimelineConfirmation();
      this.liveStatus.textContent = 'Le profil a changé. Confirmez à nouveau la nouvelle partie.';
      return;
    }
    this.cancelNewTimelineConfirmation();
    try {
      if (this.onNewTimeline?.() === false) return;
    } catch (error) {
      this.liveStatus.textContent = 'Nouvelle partie non créée : ' + (error.message || 'sauvegarde indisponible');
      return;
    }
    this.hide();
    this.onContinue?.('hub');
  }

  cancelNewTimelineConfirmation() {
    clearTimeout(this.confirmTimer);
    this.confirmTimer = 0;
    this.confirmSave = null;
    this.confirmRecovery = null;
    if (!this.newButton) return;
    this.newButton.dataset.confirm = 'false';
    this.newButton.textContent = 'NOUVELLE PARTIE';
  }

  handleKeydown(event) {
    if (this.root.hidden || document.hidden || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!MENU_KEYS.has(event.code)) return;
    event.preventDefault();
    event.stopImmediatePropagation?.();
    if (event.repeat) return;
    if (this.state === 'idle' && START_KEYS.has(event.code)) {
      this.openMenu();
      return;
    }
    if (this.state !== 'menu') {
      if (event.code === 'Tab') this.focusButton(this.startButton);
      return;
    }
    if (START_KEYS.has(event.code)) this.activateFocused();
    else if (event.code === 'Escape') this.goBack();
    else if (event.code === 'Home' || event.code === 'End') this.moveFocus(event.code === 'Home' ? -1 : 1, true);
    else this.moveFocus(event.code === 'ArrowUp' || (event.code === 'Tab' && event.shiftKey) ? -1 : 1);
  }

  goBack() {
    if (this.newButton.dataset.confirm === 'true') {
      this.cancelNewTimelineConfirmation();
      this.liveStatus.textContent = 'Nouvelle partie annulée. La sauvegarde est conservée.';
    } else this.closeMenu();
  }

  pollGamepads(pads) {
    if (this.root.hidden || document.hidden || document.hasFocus?.() === false) { this.gamepads.clear(); return; }
    const connected = new Set();
    let consumed = false;
    for (const pad of Array.from(pads || [])) {
      if (!pad || pad.connected === false || pad.mapping !== 'standard') continue;
      const key = pad.index + ':' + pad.id;
      connected.add(key);
      const down = (index) => Boolean(pad.buttons?.[index]?.pressed || pad.buttons?.[index]?.value > 0.55);
      const axisY = Number.isFinite(pad.axes?.[1]) ? pad.axes[1] : 0;
      const input = { accept: down(0) || down(9), back: down(1), up: down(12) || axisY < -0.55, down: down(13) || axisY > 0.55 };
      const neutral = !Object.values(input).some(Boolean) && Math.abs(axisY) < 0.35;
      let previous = this.gamepads.get(key);
      if (!previous) previous = { ...input, suppressed: true };
      if (previous.suppressed && neutral) previous.suppressed = false;
      const edge = (action) => input[action] && !previous[action] && !previous.suppressed;
      if (!consumed) {
        if (edge('back') && this.state === 'menu') { this.goBack(); consumed = true; }
        else if (edge('up') && this.state === 'menu') { this.moveFocus(-1); consumed = true; }
        else if (edge('down') && this.state === 'menu') { this.moveFocus(1); consumed = true; }
        else if (edge('accept')) {
          if (this.state === 'idle') this.openMenu();
          else this.activateFocused();
          consumed = true;
        }
      }
      if (this.root.hidden) { this.gamepads.clear(); return; }
      this.gamepads.set(key, { ...input, suppressed: previous.suppressed });
    }
    for (const key of this.gamepads.keys()) if (!connected.has(key)) this.gamepads.delete(key);
  }

  startGamepadPolling() {
    this.stopGamepadPolling();
    if (!globalThis.navigator?.getGamepads) return;
    const poll = () => {
      this.gamepadFrame = 0;
      if (this.root.hidden) return;
      try { this.pollGamepads(navigator.getGamepads()); }
      catch { this.gamepads.clear(); }
      if (!this.root.hidden) this.gamepadFrame = requestAnimationFrame(poll);
    };
    this.gamepadFrame = requestAnimationFrame(poll);
  }

  stopGamepadPolling() {
    if (this.gamepadFrame) cancelAnimationFrame(this.gamepadFrame);
    this.gamepadFrame = 0;
    this.gamepads.clear();
  }

  dispose() {
    this.hide();
    this.listeners.splice(0).forEach((remove) => remove());
    this.scene?.dispose?.();
  }

  getSnapshot() {
    return {
      schema: TITLE_SCREEN_SCHEMA,
      visible: !this.root.hidden,
      state: this.state,
      menuVisible: !this.menu.hidden,
      forgeAvailable: Boolean(this.forgeButton),
      continueTarget: resolveTitleContinueTarget(this.getSave()),
      scene: this.scene?.getSnapshot?.() || null
    };
  }
}
