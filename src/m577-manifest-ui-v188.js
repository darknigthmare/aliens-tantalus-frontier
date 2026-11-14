// V188 — Act III moral choice (bible §5.3): the M577 manifest. Native dialog,
// no persistence until the player confirms. FR/EN text, keyboard reachable.
import { M577_MANIFEST_V188, m577ManifestFromContainersV188 } from './story-campaign-v188.js';

const TEXT = Object.freeze({
  fr: { title: 'Manifeste du M577', intro: 'La consigne de la compagnie exige de ramener trois conteneurs scellés du complexe. Asha demande des places pour les ouvriers retranchés à C-12. Chaque conteneur retire deux places.',
    containers: 'Conteneurs scellés', seats: 'Places pour les ouvriers', confirm: 'SIGNER LE MANIFESTE', cancel: 'ANNULER' },
  en: { title: 'M577 manifest', intro: 'The company order requires bringing back three sealed containers from the complex. Asha asks for seats for the workers holed up at C-12. Each container removes two seats.',
    containers: 'Sealed containers', seats: 'Seats for the workers', confirm: 'SIGN THE MANIFEST', cancel: 'CANCEL' }
});

export function openM577ManifestDialogV188({ document = globalThis.document, language = 'fr', onConfirm, onCancel } = {}) {
  if (!document?.body) return null;
  const text = TEXT[language === 'en' ? 'en' : 'fr'];
  const dialog = document.createElement('dialog'); dialog.className = 'm577-manifest-v188'; dialog.setAttribute('aria-labelledby', 'm577-title-v188');
  dialog.innerHTML = `<form method="dialog"><h2 id="m577-title-v188"></h2><p class="m577-intro-v188"></p>
    <label><span class="m577-containers-label-v188"></span> <output id="m577-containers-v188">0</output>
    <input id="m577-range-v188" type="range" min="0" max="${M577_MANIFEST_V188.maxContainers}" step="1" value="0"></label>
    <p><span class="m577-seats-label-v188"></span> : <output id="m577-seats-v188">${M577_MANIFEST_V188.seats}</output></p>
    <footer><button type="button" class="button" data-m577-cancel></button><button type="submit" class="button primary" data-m577-confirm></button></footer></form>`;
  dialog.querySelector('#m577-title-v188').textContent = text.title;
  dialog.querySelector('.m577-intro-v188').textContent = text.intro;
  dialog.querySelector('.m577-containers-label-v188').textContent = text.containers;
  dialog.querySelector('.m577-seats-label-v188').textContent = text.seats;
  dialog.querySelector('[data-m577-confirm]').textContent = text.confirm;
  dialog.querySelector('[data-m577-cancel]').textContent = text.cancel;
  const range = dialog.querySelector('#m577-range-v188');
  const update = () => { const manifest = m577ManifestFromContainersV188(range.value);
    dialog.querySelector('#m577-containers-v188').textContent = String(manifest.containers);
    dialog.querySelector('#m577-seats-v188').textContent = String(manifest.colonists); };
  range.addEventListener('input', update);
  const close = () => { dialog.close?.(); dialog.remove(); };
  dialog.querySelector('[data-m577-cancel]').addEventListener('click', () => { close(); onCancel?.(); });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); const manifest = m577ManifestFromContainersV188(range.value); close(); onConfirm?.(manifest); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); onCancel?.(); });
  document.body.append(dialog); dialog.showModal?.(); range.focus?.();
  return dialog;
}
