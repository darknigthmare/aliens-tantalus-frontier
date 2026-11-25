// V188 — generic story choice dialog (bible §5.4 interlude choice). Native
// dialog, FR/EN, no persistence until a choice is confirmed.
export function openStoryChoiceDialogV188({ document = globalThis.document, title, intro, options = [], onChoose } = {}) {
  if (!document?.body || !options.length) return null;
  const dialog = document.createElement('dialog'); dialog.className = 'story-choice-v188 m577-manifest-v188';
  const heading = document.createElement('h2'); heading.textContent = title;
  const text = document.createElement('p'); text.textContent = intro;
  const footer = document.createElement('footer');
  for (const option of options) {
    const button = Object.assign(document.createElement('button'), { type: 'button', className: 'button', textContent: option.label });
    button.dataset.storyChoiceV188 = option.id;
    button.addEventListener('click', () => { dialog.close?.(); dialog.remove(); onChoose?.(option.id); });
    footer.append(button);
  }
  dialog.addEventListener('cancel', event => event.preventDefault()); // a story decision cannot be dismissed
  dialog.append(heading, text, footer); document.body.append(dialog); dialog.showModal?.();
  footer.querySelector('button')?.focus?.();
  return dialog;
}
