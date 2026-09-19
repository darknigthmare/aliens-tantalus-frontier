import { createRefugePersonalStateV87, REFUGE_PERSONAL_MAX_PHOTO_DATA_URL_LENGTH_V87 } from './refuge-personal-state-v87.js';
const TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
export const REFUGE_PHOTO_INPUT_LIMIT_V87 = 8 * 1024 * 1024;
const focus = element => element?.isConnected !== false && element?.focus?.({ preventScroll: true });

/** Decode and re-encode on this device; never upload or preserve EXIF metadata. */
export async function prepareRefugePhotoV87(file, {
  createBitmap = globalThis.createImageBitmap,
  createCanvas = () => globalThis.document.createElement('canvas')
} = {}) {
  if (!file || !TYPES.has(file.type) || !Number.isSafeInteger(file.size) || file.size <= 0
    || file.size > REFUGE_PHOTO_INPUT_LIMIT_V87) throw new Error('Choisissez un PNG, JPEG ou WebP de 8 Mo maximum.');
  if (typeof createBitmap !== 'function') throw new Error('Ce navigateur ne permet pas le traitement local de cette image.');
  let bitmap;
  try {
    bitmap = await createBitmap(file);
    if (!Number.isInteger(bitmap.width) || !Number.isInteger(bitmap.height) || bitmap.width <= 0 || bitmap.height <= 0
      || bitmap.width > 8192 || bitmap.height > 8192 || bitmap.width * bitmap.height > 24000000)
      throw new Error('Image trop grande : 24 mégapixels et 8192 pixels par côté maximum.');
    const scale = Math.min(1, 384 / Math.max(bitmap.width, bitmap.height));
    const canvas = createCanvas();
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Le traitement local de la photo est indisponible.');
    ctx.fillStyle = '#171919'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', .88);
    if (!result.startsWith('data:image/jpeg;base64,') || result.length > REFUGE_PERSONAL_MAX_PHOTO_DATA_URL_LENGTH_V87)
      throw new Error('Cette image ne peut pas être enregistrée dans le portrait local.');
    createRefugePersonalStateV87({ ...createRefugePersonalStateV87(), photoDataUrl: result });
    return result;
  } catch (error) {
    if (error?.name === 'InvalidStateError' || error?.name === 'EncodingError')
      throw new Error('Fichier image illisible. Le portrait précédent est conservé.');
    throw error;
  } finally { bitmap?.close?.(); }
}

/** A native modal isolates typing/touch from the existing Marine controller. */
export class RefugeUiV87 {
  constructor({ onSave, onClose, documentRef = globalThis.document } = {}) {
    this.document = documentRef; this.onSave = onSave; this.onClose = onClose;
    this.epoch = 0; this.opened = false; this.pending = false; this.draftPhoto = null;
    this.build();
  }
  node(tag, text, className) {
    const node = this.document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  button(text, action, callback) {
    const node = this.node('button', text); node.type = 'button'; node.dataset.refugeAction = action;
    node.addEventListener('click', callback); return node;
  }
  build() {
    this.dialog = this.node('dialog', null, 'refuge-v87');
    this.dialog.setAttribute('aria-labelledby', 'refuge-v87-heading');
    this.heading = this.node('h2', 'REFUGE'); this.heading.id = 'refuge-v87-heading';
    const header = this.node('header'); this.closeButton = this.button('Revenir à la pièce', 'close', () => this.close());
    header.append(this.heading, this.closeButton);
    this.description = this.node('p', 'Un espace personnel, conservé sur cet appareil uniquement.', 'refuge-v87__description');
    this.description.id = 'refuge-v87-description'; this.dialog.setAttribute('aria-describedby', this.description.id);
    this.error = this.node('p', '', 'refuge-v87__error'); this.error.setAttribute('role', 'alert'); this.error.hidden = true;
    this.form = this.node('form'); this.form.addEventListener('submit', event => { event.preventDefault(); this.save(); });
    const nameLabel = this.node('label', 'Nom à afficher'); this.name = this.node('input');
    this.name.name = 'refuge-name'; this.name.maxLength = 80; this.name.autocomplete = 'off'; nameLabel.append(this.name);
    const dedicationLabel = this.node('label', 'Votre dédicace'); this.dedication = this.node('textarea');
    this.dedication.name = 'refuge-dedication'; this.dedication.maxLength = 2000; this.dedication.rows = 5; dedicationLabel.append(this.dedication);
    const photoLabel = this.node('label', 'Photo personnelle (PNG, JPEG ou WebP, 8 Mo maximum)'); this.file = this.node('input');
    this.file.type = 'file'; this.file.accept = 'image/png,image/jpeg,image/webp'; this.file.name = 'refuge-photo';
    this.file.addEventListener('change', () => { void this.importPhoto(this.file.files?.[0]); }); photoLabel.append(this.file);
    this.preview = this.node('img'); this.preview.alt = 'Aperçu du portrait personnel, traité localement'; this.preview.hidden = true;
    this.photoStatus = this.node('p', '', 'refuge-v87__photo-status'); this.photoStatus.setAttribute('role', 'status');
    this.removeButton = this.button('Retirer la photo du portrait', 'remove-photo', () => {
      if (this.pending || this.readOnly) return; this.draftPhoto = null; this.refreshPhoto();
    });
    this.saveButton = this.button('Enregistrer sur cet appareil', 'save', () => this.save());
    const notice = this.node('p', 'Aucun envoi sur Internet. La photo est réduite et ses métadonnées sont retirées. Cet hommage n’est pas inclus dans l’export de la partie.', 'refuge-v87__privacy');
    this.form.append(nameLabel, dedicationLabel, photoLabel, this.preview, this.photoStatus, this.removeButton, notice, this.saveButton);
    this.reading = this.node('section', null, 'refuge-v87__reading');
    this.readName = this.node('h3'); this.readText = this.node('p'); this.reading.append(this.readName, this.readText);
    this.dialog.append(header, this.description, this.error, this.form, this.reading);
    this.dialog.addEventListener('keydown', event => event.stopPropagation());
    this.dialog.addEventListener('keyup', event => event.stopPropagation());
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); this.close(); });
    this.dialog.addEventListener('close', () => { if (this.opened) this.close(); });
    this.document.body.append(this.dialog);
  }
  get isOpen() { return this.opened && this.dialog.open === true; }
  showError(message = '') { this.error.textContent = message; this.error.hidden = !message; }
  refreshPhoto() {
    this.preview.hidden = !this.draftPhoto;
    if (this.draftPhoto) this.preview.src = this.draftPhoto; else this.preview.removeAttribute('src');
    this.removeButton.disabled = this.pending || this.readOnly || !this.draftPhoto;
    this.file.disabled = this.pending || this.readOnly;
    this.saveButton.disabled = this.pending || this.readOnly;
    this.photoStatus.textContent = this.pending ? 'Traitement local de l’image…'
      : this.draftPhoto ? 'Photo prête. Enregistrez pour conserver les modifications.' : 'Aucune photo personnelle ajoutée. Le cadre reste vide.';
  }
  open({ mode = 'portrait', state, error = '' }) {
    if (!state || !['portrait', 'terminal'].includes(mode) || typeof this.dialog.showModal !== 'function') return false;
    this.previousFocus = this.document.activeElement; this.epoch++; this.pending = false; this.readOnly = Boolean(error);
    this.mode = mode; this.draftPhoto = state.photoDataUrl;
    this.name.value = state.name; this.dedication.value = state.dedication;
    this.name.disabled = this.readOnly; this.dedication.disabled = this.readOnly; this.file.value = '';
    this.heading.textContent = mode === 'portrait' ? 'Personnaliser le REFUGE' : 'Terminal souvenir';
    this.form.hidden = mode !== 'portrait'; this.reading.hidden = mode !== 'terminal';
    this.readName.textContent = state.name || 'Espace personnel';
    this.readText.textContent = state.dedication || 'Vous pouvez écrire votre dédicace depuis le portrait de la pièce.';
    this.showError(error); this.refreshPhoto();
    try { this.dialog.showModal(); this.opened = true; }
    catch { this.close({ notify: false, restoreFocus: false }); return false; }
    focus(mode === 'portrait' && !this.readOnly ? this.name : this.closeButton); return true;
  }
  async importPhoto(file) {
    if (!this.isOpen || this.readOnly || this.pending || !file) return false;
    const epoch = this.epoch; this.pending = true; this.showError(); this.refreshPhoto();
    try {
      const data = await prepareRefugePhotoV87(file);
      if (epoch !== this.epoch || !this.isOpen) return false;
      this.draftPhoto = data; return true;
    } catch (error) {
      if (epoch === this.epoch && this.isOpen) this.showError(error.message || 'Photo illisible. Le portrait précédent est conservé.');
      return false;
    } finally {
      if (epoch === this.epoch) { this.pending = false; this.file.value = ''; this.refreshPhoto(); }
    }
  }
  save() {
    if (!this.isOpen || this.mode !== 'portrait' || this.pending || this.readOnly) return false;
    let result;
    try { result = this.onSave?.({ name: this.name.value, dedication: this.dedication.value, photoDataUrl: this.draftPhoto }); }
    catch (error) { this.showError(error.message || 'Enregistrement refusé. Votre hommage précédent reste conservé.'); return false; }
    if (!result?.ok) { this.showError(result?.message || 'Enregistrement refusé. Votre hommage précédent reste conservé.'); return false; }
    this.close(); return true;
  }
  close({ notify = true, restoreFocus = true } = {}) {
    const opened = this.opened; this.opened = false; this.epoch++; this.pending = false;
    if (this.dialog.open) this.dialog.close();
    this.preview.removeAttribute('src'); this.draftPhoto = null; this.file.value = '';
    this.name.value = ''; this.dedication.value = ''; this.readName.textContent = ''; this.readText.textContent = '';
    this.showError(); this.photoStatus.textContent = ''; this.preview.hidden = true;
    if (opened && notify) this.onClose?.();
    if (opened && restoreFocus) focus(this.previousFocus);
    this.previousFocus = null;
  }
}
