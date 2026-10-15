import { FIELD_MEDIA_LIMITS_V135, normalizeFieldMediaOwnerV135 } from './field-media-v135.js';

const formatBytes = bytes => `${(bytes / 1048576).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mio`;
const formatDate = timestamp => new Date(timestamp).toLocaleString('fr-FR');
const SCENE_LABELS = Object.freeze({ hub: 'Tantalus', mission: 'Terrain', cctv: 'Caméra de surveillance' });
function node(documentRef, tag, text, attributes = {}) {
  const element = documentRef.createElement(tag);
  if (tag === 'button' || tag === 'a') { element.className = 'button compact'; element.style.minHeight = '44px'; }
  if (text !== undefined) element.textContent = text;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}
function ownerKey(owner) { try { return normalizeFieldMediaOwnerV135(owner).ownerKey; } catch { return ''; } }
function sessionKey(owner) { return `${ownerKey(owner)}:${owner?.epoch ?? ''}:${owner?.timeline ?? ''}`; }
function failureMessage(cause) {
  return cause?.code ? cause.message : 'La photo n’a pas pu être conservée. Les photos déjà présentes restent disponibles.';
}

/** Native DOM gallery: no capture starts until the player presses a button. */
export function mountFieldMediaUiV135(root, { repository, getOwner, captureFrame, canCapture = () => true,
  onBusyChange = () => {}, urlApi = globalThis.URL } = {}) {
  if (!root?.ownerDocument || !repository || typeof getOwner !== 'function' || typeof captureFrame !== 'function') {
    throw new TypeError('La galerie nécessite un conteneur, un stockage et une vue du jeu.');
  }
  const documentRef = root.ownerDocument;
  let destroyed = false, busy = false, entries = [], currentOwnerKey = '', currentSessionKey = '', refreshSerial = 0, selectedId = '', photoUrl = '';
  let statusText = '', errorStatus = false;
  const heading = node(documentRef, 'h3', 'Photos de terrain');
  const notice = node(documentRef, 'p', 'Photos prises par vous dans le jeu, conservées uniquement dans ce navigateur et cette chronologie. Elles ne sont pas incluses dans la sauvegarde JSON. Téléchargez les photos à conserver.');
  notice.style.maxWidth = '76ch';
  const controls = node(documentRef, 'div'); controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:.6rem;align-items:center';
  const captureButton = node(documentRef, 'button', 'Photographier la vue du jeu', { type: 'button', 'data-field-media-gallery-capture-v135': '' });
  const refreshButton = node(documentRef, 'button', 'Actualiser les photos', { type: 'button', 'data-field-media-refresh-v135': '' });
  controls.append(captureButton, refreshButton);
  const summary = node(documentRef, 'p', '', { 'data-field-media-summary-v135': '' });
  const status = node(documentRef, 'p', '', { role: 'status', 'aria-live': 'polite', 'data-field-media-status-v135': '' });
  const list = node(documentRef, 'div', undefined, { 'data-field-media-list-v135': '' });
  list.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:.75rem';
  const viewer = node(documentRef, 'section', undefined, { 'data-field-media-viewer-v135': '', 'aria-label': 'Photo de terrain ouverte' });
  root.replaceChildren(heading, notice, controls, summary, status, viewer, list);

  function setStatus(message, failed = false) {
    statusText = message; errorStatus = failed;
    status.textContent = message; status.dataset.fieldMediaErrorV135 = failed ? 'true' : 'false';
  }
  function releaseUrl() {
    if (photoUrl) { urlApi.revokeObjectURL(photoUrl); photoUrl = ''; }
  }
  function closeViewer({ focus = false } = {}) {
    const previousId = selectedId; selectedId = ''; releaseUrl(); viewer.replaceChildren();
    if (focus && previousId) {
      [...list.querySelectorAll('[data-field-media-open-v135]')].find(button => button.dataset.fieldMediaOpenV135 === previousId)?.focus();
    }
  }
  function setBusy(value) {
    busy = value; captureButton.disabled = busy || !canCapture(); refreshButton.disabled = busy;
    root.setAttribute('aria-busy', String(value));
    for (const button of root.querySelectorAll('[data-field-media-delete-v135]')) button.disabled = busy;
    onBusyChange(value);
  }
  function stillOwner(owner) { return !destroyed && sessionKey(getOwner()) === sessionKey(owner); }
  function renderList() {
    list.replaceChildren();
    summary.textContent = `${entries.length}/${FIELD_MEDIA_LIMITS_V135.count} photos — ${formatBytes(entries.reduce((total, entry) => total + entry.byteLength, 0))} / 16 Mio`;
    if (!entries.length) { list.append(node(documentRef, 'p', 'Aucune photo locale pour cette partie.')); return; }
    for (const entry of entries) {
      const card = node(documentRef, 'article', undefined, { 'data-field-media-item-v135': entry.id });
      card.style.cssText = 'border:1px solid currentColor;padding:.8rem;border-radius:.35rem;min-width:0';
      card.append(node(documentRef, 'h4', `${SCENE_LABELS[entry.scene]} · ${entry.location}`));
      card.append(node(documentRef, 'p', `${formatDate(entry.capturedAt)} · ${entry.width} × ${entry.height} · ${formatBytes(entry.byteLength)}`));
      const open = node(documentRef, 'button', 'Ouvrir la photo', { type: 'button', 'data-field-media-open-v135': entry.id,
        'aria-label': `Ouvrir la photo : ${entry.location}, ${formatDate(entry.capturedAt)}` });
      open.addEventListener('click', () => openPhoto(entry.id)); card.append(open); list.append(card);
    }
  }
  function openPhoto(id) {
    if (destroyed || busy || currentOwnerKey !== ownerKey(getOwner()) || currentSessionKey !== sessionKey(getOwner())) return;
    const entry = entries.find(candidate => candidate.id === id); if (!entry) return;
    closeViewer(); selectedId = id;
    try { photoUrl = urlApi.createObjectURL(entry.blob); } catch (cause) { selectedId = ''; setStatus(failureMessage(cause), true); return; }
    const figure = node(documentRef, 'figure'); figure.style.cssText = 'margin:.75rem 0;min-width:0';
    const image = node(documentRef, 'img', undefined, { src: photoUrl, alt: `Photo prise dans le jeu : ${entry.location}, ${formatDate(entry.capturedAt)}`,
      width: entry.width, height: entry.height, 'data-field-media-image-v135': '' });
    image.style.cssText = 'display:block;max-width:100%;height:auto;object-fit:contain;background:#080d12';
    image.addEventListener('error', () => { if (!destroyed && selectedId === id) setStatus('Cette photo locale ne peut pas être affichée.', true); });
    figure.append(image, node(documentRef, 'figcaption', `${SCENE_LABELS[entry.scene]} · ${entry.location} · ${formatDate(entry.capturedAt)}`));
    const actions = node(documentRef, 'div'); actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:.6rem;align-items:center';
    const extension = entry.mimeType === 'image/jpeg' ? 'jpg' : entry.mimeType === 'image/webp' ? 'webp' : 'png';
    const download = node(documentRef, 'a', 'Télécharger la photo', { href: photoUrl, download: `${id}.${extension}`, 'data-field-media-download-v135': id });
    const close = node(documentRef, 'button', 'Fermer la photo', { type: 'button', 'data-field-media-close-v135': '' });
    close.addEventListener('click', () => closeViewer({ focus: true }));
    const remove = node(documentRef, 'button', 'Supprimer cette photo', { type: 'button', 'data-field-media-delete-v135': id });
    remove.addEventListener('click', () => removePhoto(id));
    actions.append(download, close, remove); viewer.append(figure, actions); close.focus();
  }

  async function refresh({ keepStatus = false } = {}) {
    if (destroyed) return false;
    const serial = ++refreshSerial, owner = getOwner(), key = ownerKey(owner);
    if (key !== currentOwnerKey || sessionKey(owner) !== currentSessionKey) {
      currentOwnerKey = key; currentSessionKey = sessionKey(owner); entries = []; closeViewer(); renderList(); setStatus('');
    }
    captureButton.disabled = busy || !canCapture();
    try {
      const next = await repository.list(owner);
      if (destroyed || serial !== refreshSerial || !stillOwner(owner)) return false;
      entries = next;
      if (selectedId && !entries.some(entry => entry.id === selectedId)) closeViewer();
      renderList();
      if (!keepStatus) setStatus(entries.length ? 'Photos locales disponibles.' : '');
      return true;
    } catch (cause) {
      if (destroyed || serial !== refreshSerial || !stillOwner(owner)) return false;
      // Preserve the existing gallery if a storage read fails.
      setStatus(failureMessage(cause), true); return false;
    }
  }
  async function capture() {
    if (destroyed || busy) return false;
    if (!canCapture()) { setStatus('Ouvrez une vue du jeu avant de prendre une photo.', true); return false; }
    const owner = getOwner(); setBusy(true); setStatus('Prise de la photo…');
    try {
      const frame = await captureFrame();
      if (!stillOwner(owner)) return false;
      await repository.capture(owner, frame);
      if (!stillOwner(owner)) return false;
      const refreshed = await refresh({ keepStatus: true });
      if (!stillOwner(owner)) return false;
      setStatus(refreshed ? 'Photo conservée dans les Archives de cette partie.' : 'Photo conservée localement. La galerie n’a pas pu être actualisée ; réessayez Actualiser les photos.', !refreshed); return true;
    } catch (cause) { if (stillOwner(owner)) setStatus(failureMessage(cause), true); return false; }
    finally { if (!destroyed) setBusy(false); }
  }
  async function removePhoto(id) {
    if (destroyed || busy) return false;
    const owner = getOwner(); setBusy(true); setStatus('Suppression de la photo…');
    try {
      const removed = await repository.remove(owner, id);
      if (!stillOwner(owner)) return false;
      await refresh({ keepStatus: true });
      if (!stillOwner(owner)) return false;
      setStatus(removed ? 'Photo supprimée de cette partie.' : 'Cette photo n’est plus disponible.');
      refreshButton.focus(); return removed;
    } catch (cause) { if (stillOwner(owner)) setStatus(failureMessage(cause), true); return false; }
    finally { if (!destroyed) setBusy(false); }
  }
  captureButton.addEventListener('click', capture);
  refreshButton.addEventListener('click', () => refresh());
  renderList(); setBusy(false); void refresh();
  return {
    capture, refresh,
    get busy() { return busy; },
    get status() { return { message: statusText, error: errorStatus }; },
    destroy() { if (destroyed) return; destroyed = true; refreshSerial += 1; closeViewer(); root.replaceChildren(); onBusyChange(false); }
  };
}
