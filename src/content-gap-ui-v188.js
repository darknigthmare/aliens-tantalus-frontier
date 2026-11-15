// V188 — scene dialog for the content-gap features (station scenes, CASSIUS
// decision, crew quests). Native <dialog>, the existing story-choice styling,
// a Canvas picture drawn through a named art slot (content-gap-slots-v188.js).
// No persistence here: callers commit a candidate save in `onChoose`.
import { ContentGapAssetLoaderV188 } from './content-gap-slots-v188.js';

let sharedLoader = null;
const loaderOf = loader => loader || (sharedLoader ||= new ContentGapAssetLoaderV188());

/**
 * Opens the dialog. `onChoose(id)` may return { text, options, title } to show
 * the next step in the same dialog, or nothing to close it. A dialog without a
 * `dismissLabel` cannot be dismissed (a story decision).
 */
export function openContentSceneDialogV188({ document = globalThis.document, loader = null, language = 'fr', slot = null,
  title = '', text = '', options = [], dismissLabel = null, onChoose = null, onClose = null } = {}) {
  if (!document?.body) return null;
  const dialog = document.createElement('dialog'); dialog.className = 'story-choice-v188 m577-manifest-v188 content-scene-v188';
  dialog.dataset.contentSceneV188 = slot || 'none';
  const heading = document.createElement('h2');
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 280;
  Object.assign(canvas.style, { width: '100%', maxWidth: '640px', height: 'auto', display: 'block', margin: '0 auto 12px', borderRadius: '4px' });
  canvas.setAttribute('aria-hidden', 'true');
  const paragraph = document.createElement('p'); paragraph.setAttribute('aria-live', 'polite');
  const feedback = document.createElement('p'); feedback.className = 'hint'; feedback.hidden = true;
  const footer = document.createElement('footer');
  let closed = false;
  const close = () => { if (closed) return; closed = true; dialog.close?.(); dialog.remove(); onClose?.(); };
  const render = ({ title: nextTitle = title, text: nextText = '', options: nextOptions = [], feedback: note = null, slot: nextSlot = slot } = {}) => {
    heading.textContent = nextTitle; paragraph.textContent = nextText;
    feedback.hidden = !note; feedback.textContent = note || '';
    if (nextSlot) {
      const ctx = canvas.getContext?.('2d');
      if (ctx) { loaderOf(loader).draw(ctx, nextSlot, canvas.width, canvas.height, { language }); dialog.dataset.contentSceneV188 = nextSlot; }
      canvas.hidden = false;
    } else canvas.hidden = true;
    footer.replaceChildren();
    for (const entry of nextOptions) {
      const button = Object.assign(document.createElement('button'), { type: 'button', className: 'button', textContent: entry.label });
      button.dataset.contentChoiceV188 = entry.id;
      button.addEventListener('click', () => {
        let next = null;
        try { next = onChoose?.(entry.id) || null; } catch (error) { next = { text: nextText, options: nextOptions, feedback: error?.message || String(error) }; }
        if (next) render({ title: next.title || nextTitle, slot: nextSlot, ...next }); else close();
      });
      footer.append(button);
    }
    if (dismissLabel) {
      const button = Object.assign(document.createElement('button'), { type: 'button', className: 'button compact', textContent: dismissLabel });
      button.dataset.contentDismissV188 = 'true'; button.addEventListener('click', close); footer.append(button);
    }
    footer.querySelector('button')?.focus?.();
  };
  dialog.addEventListener('cancel', event => { event.preventDefault(); if (dismissLabel) close(); });
  dialog.append(heading, canvas, paragraph, feedback, footer); document.body.append(dialog);
  render({ title, text, options });
  dialog.showModal?.();
  return Object.freeze({ dialog, close, render });
}
