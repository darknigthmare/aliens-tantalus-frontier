export const TITLE_SCREEN_SCHEMA = 61;

export function resolveTitleContinueTarget(save) {
  if (save?.strategy?.currentOperation) return 'operations';
  if (save?.scene === 'mission') return 'operations';
  return save?.scene === 'command' ? 'command' : 'hub';
}

const START_KEYS = new Set(['Enter', 'Space', 'NumpadEnter']);

export class TitleScreenController {
  constructor({ root, app, getSave, onUnlock, onContinue, onNewTimeline, onForge, onOptions }) {
    if (!root || !app) throw new Error('Surface écran titre V61 absente.');
    this.root = root;
    this.app = app;
    this.getSave = getSave;
    this.onUnlock = onUnlock;
    this.onContinue = onContinue;
    this.onNewTimeline = onNewTimeline;
    this.onForge = onForge;
    this.onOptions = onOptions;
    this.state = 'idle';
    this.gamepadFrame = 0;
    this.gamepadPressed = false;
    this.confirmTimer = 0;
    this.startButton = root.querySelector('#title-start');
    this.menu = root.querySelector('#title-menu');
    this.continueButton = root.querySelector('#title-continue');
    this.newButton = root.querySelector('#title-new');
    this.forgeButton = root.querySelector('#title-forge');
    this.optionsButton = root.querySelector('#title-options');
    this.profileStatus = root.querySelector('#title-profile-status');
    this.liveStatus = root.querySelector('#title-live-status');
    this.bind();
  }

  bind() {
    this.startButton.addEventListener('click', () => this.openMenu());
    this.continueButton.addEventListener('click', () => this.continueGame());
    this.optionsButton.addEventListener('click', () => this.openOptions());
    this.newButton.addEventListener('click', () => this.requestNewTimeline());
    this.forgeButton.addEventListener('click', () => this.openForge());
    globalThis.addEventListener('keydown', (event) => this.handleKeydown(event));
  }

  show() {
    const save = this.getSave();
    this.cancelNewTimelineConfirmation();
    this.root.hidden = false;
    this.app.hidden = true;
    this.root.dataset.state = 'idle';
    this.state = 'idle';
    this.menu.hidden = true;
    this.startButton.hidden = false;
    this.continueButton.textContent = save?.strategy?.currentOperation
      ? 'REPRENDRE L’OPÉRATION'
      : save?.statistics?.playSeconds > 0 ? 'CONTINUER' : 'ENTRER SUR LE TANTALUS';
    const day = String(save?.clock?.day || 1).padStart(2, '0');
    const hour = String(Math.floor(save?.clock?.hour || 0)).padStart(2, '0');
    this.profileStatus.textContent = 'PROFIL ' + (save?.profile || 1) + ' · J' + day + ' ' + hour + ':00 · SAUVEGARDE LOCALE';
    this.liveStatus.textContent = 'Écran titre. Appuyez pour ouvrir le menu principal.';
    document.documentElement.classList.add('title-mode');
    requestAnimationFrame(() => this.startButton.focus());
    this.startGamepadPolling();
  }

  hide() {
    this.cancelNewTimelineConfirmation();
    this.stopGamepadPolling();
    this.root.hidden = true;
    this.app.hidden = false;
    document.documentElement.classList.remove('title-mode');
    this.state = 'closed';
  }

  openMenu() {
    if (this.root.hidden) return;
    this.onUnlock?.();
    this.state = 'menu';
    this.root.dataset.state = 'menu';
    this.startButton.hidden = true;
    this.menu.hidden = false;
    this.liveStatus.textContent = 'Menu principal ouvert.';
    requestAnimationFrame(() => this.continueButton.focus());
  }

  closeMenu() {
    this.cancelNewTimelineConfirmation();
    this.state = 'idle';
    this.root.dataset.state = 'idle';
    this.menu.hidden = true;
    this.startButton.hidden = false;
    this.liveStatus.textContent = 'Menu fermé. Appuyez pour commencer.';
    this.startButton.focus();
  }

  continueGame() {
    const target = resolveTitleContinueTarget(this.getSave());
    this.hide();
    this.onContinue?.(target);
  }

  openOptions() {
    this.hide();
    this.onOptions?.();
  }

  openForge() {
    this.hide();
    this.onForge?.();
  }

  requestNewTimeline() {
    if (this.newButton.dataset.confirm !== 'true') {
      this.newButton.dataset.confirm = 'true';
      this.newButton.textContent = 'CONFIRMER LA NOUVELLE PARTIE';
      this.liveStatus.textContent = 'Confirmez pour remplacer la partie du profil actif.';
      clearTimeout(this.confirmTimer);
      this.confirmTimer = setTimeout(() => this.cancelNewTimelineConfirmation(), 5000);
      return;
    }
    this.cancelNewTimelineConfirmation();
    this.onNewTimeline?.();
    this.hide();
    this.onContinue?.('hub');
  }

  cancelNewTimelineConfirmation() {
    clearTimeout(this.confirmTimer);
    this.confirmTimer = 0;
    if (!this.newButton) return;
    this.newButton.dataset.confirm = 'false';
    this.newButton.textContent = 'NOUVELLE PARTIE';
  }

  handleKeydown(event) {
    if (this.root.hidden) return;
    if (this.state === 'idle' && START_KEYS.has(event.code)) {
      event.preventDefault();
      this.openMenu();
      return;
    }
    if (this.state === 'menu' && event.code === 'Escape') {
      event.preventDefault();
      this.closeMenu();
    }
  }

  startGamepadPolling() {
    this.stopGamepadPolling();
    if (!navigator.getGamepads) return;
    const poll = () => {
      if (this.root.hidden) return;
      const pressed = [...navigator.getGamepads()].some((gamepad) => gamepad
        && [0, 9].some((index) => gamepad.buttons[index]?.pressed));
      if (pressed && !this.gamepadPressed) {
        if (this.state === 'idle') this.openMenu();
        else if (this.state === 'menu') this.continueGame();
      }
      this.gamepadPressed = pressed;
      this.gamepadFrame = requestAnimationFrame(poll);
    };
    this.gamepadFrame = requestAnimationFrame(poll);
  }

  stopGamepadPolling() {
    if (this.gamepadFrame) cancelAnimationFrame(this.gamepadFrame);
    this.gamepadFrame = 0;
    this.gamepadPressed = false;
  }

  getSnapshot() {
    return {
      schema: TITLE_SCREEN_SCHEMA,
      visible: !this.root.hidden,
      state: this.state,
      menuVisible: !this.menu.hidden,
      forgeAvailable: Boolean(this.forgeButton),
      continueTarget: resolveTitleContinueTarget(this.getSave())
    };
  }
}
