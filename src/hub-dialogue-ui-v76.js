const FOCUSABLE_SELECTOR = [
  'button:not([disabled]):not([hidden])',
  'a[href]:not([hidden])',
  'input:not([disabled]):not([hidden])',
  'select:not([disabled]):not([hidden])',
  'textarea:not([disabled]):not([hidden])',
  '[tabindex]:not([tabindex="-1"]):not([hidden])'
].join(', ');

const canFocus = (element) => Boolean(
  element
  && typeof element.focus === 'function'
  && element.isConnected !== false
  && !element.hidden
  && !element.disabled
  && element.getAttribute?.('aria-hidden') !== 'true'
);

function focusWithoutScroll(element) {
  if (!canFocus(element)) return false;
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
  return true;
}

function focusInsideDialogue(element) {
  if (!focusWithoutScroll(element)) return false;
  element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  return true;
}

export class HubDialogueUiV76 {
  constructor({
    layer,
    dialog,
    background,
    documentRef = globalThis.document,
    onRequestClose = null
  } = {}) {
    if (!layer || !dialog || !documentRef) {
      throw new Error('HubDialogueUiV76 requiert layer, dialog et documentRef.');
    }
    this.layer = layer;
    this.dialog = dialog;
    this.background = background || null;
    this.document = documentRef;
    this.onRequestClose = onRequestClose;
    this.previousFocus = null;
    this.previousBackgroundState = null;
    this.destroyed = false;
    this.boundKeydown = (event) => this.handleKeydown(event);
    this.dialog.addEventListener('keydown', this.boundKeydown);
    this.layer.hidden = true;
    this.layer.setAttribute('aria-hidden', 'true');
    this.dialog.hidden = true;
    this.dialog.setAttribute('aria-hidden', 'true');
    this.document.documentElement?.classList?.remove('hub-dialogue-mode');
  }

  get openState() {
    return !this.destroyed && !this.layer.hidden && !this.dialog.hidden;
  }

  getFocusableElements() {
    return [...this.dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(canFocus);
  }

  open({ initialFocus = null } = {}) {
    if (this.destroyed) return false;
    if (!this.openState) {
      this.previousFocus = this.document.activeElement || null;
      if (this.background) {
        this.previousBackgroundState = {
          inert: Boolean(this.background.inert),
          ariaHidden: this.background.getAttribute?.('aria-hidden')
        };
      }
    }

    this.layer.hidden = false;
    this.layer.setAttribute('aria-hidden', 'false');
    this.dialog.hidden = false;
    this.dialog.setAttribute('aria-hidden', 'false');
    this.document.documentElement?.classList?.add('hub-dialogue-mode');
    if (this.background) {
      this.background.inert = true;
      this.background.setAttribute?.('aria-hidden', 'true');
    }

    const requested = typeof initialFocus === 'string'
      ? this.dialog.querySelector(initialFocus)
      : initialFocus;
    const target = canFocus(requested) ? requested : this.getFocusableElements()[0];
    focusInsideDialogue(target || this.dialog);
    return true;
  }

  close({ restoreFocus = true } = {}) {
    const wasOpen = this.openState
      || this.layer.getAttribute?.('aria-hidden') === 'false'
      || this.dialog.getAttribute?.('aria-hidden') === 'false';
    this.layer.hidden = true;
    this.layer.setAttribute('aria-hidden', 'true');
    this.dialog.hidden = true;
    this.dialog.setAttribute('aria-hidden', 'true');
    this.document.documentElement?.classList?.remove('hub-dialogue-mode');

    if (this.background && this.previousBackgroundState) {
      this.background.inert = this.previousBackgroundState.inert;
      if (this.previousBackgroundState.ariaHidden === null) {
        this.background.removeAttribute?.('aria-hidden');
      } else {
        this.background.setAttribute?.('aria-hidden', this.previousBackgroundState.ariaHidden);
      }
    }
    this.previousBackgroundState = null;

    const previousFocus = this.previousFocus;
    this.previousFocus = null;
    if (restoreFocus && previousFocus && !this.layer.contains?.(previousFocus)) {
      focusWithoutScroll(previousFocus);
    }
    return wasOpen;
  }

  handleKeydown(event) {
    if (!this.openState) return;
    if (event.key === 'Escape' || event.code === 'Escape') {
      event.preventDefault?.();
      event.stopPropagation?.();
      if (typeof this.onRequestClose === 'function') this.onRequestClose('escape');
      else this.close();
      return;
    }
    if (event.key !== 'Tab' && event.code !== 'Tab') return;

    const focusable = this.getFocusableElements();
    if (!focusable.length) {
      event.preventDefault?.();
      focusInsideDialogue(this.dialog);
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    const active = this.document.activeElement;
    const focusIsOutside = !this.dialog.contains?.(active);
    if (event.shiftKey && (active === first || focusIsOutside)) {
      event.preventDefault?.();
      focusInsideDialogue(last);
    } else if (!event.shiftKey && (active === last || focusIsOutside)) {
      event.preventDefault?.();
      focusInsideDialogue(first);
    }
  }

  destroy({ restoreFocus = false } = {}) {
    if (this.destroyed) return false;
    this.close({ restoreFocus });
    this.dialog.removeEventListener('keydown', this.boundKeydown);
    this.onRequestClose = null;
    this.destroyed = true;
    return true;
  }
}
