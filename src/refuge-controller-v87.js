import { createRefugePersonalStateV87, RefugePersonalStoreV87, REFUGE_PERSONAL_STORAGE_PREFIX_V87 } from './refuge-personal-state-v87.js';
import { getRefugeInteractionV87 } from './refuge-room-v87.js';
import { RefugeUiV87 } from './refuge-ui-v87.js';

const messages = Object.freeze({
  'quota-exceeded': 'Espace local insuffisant. Le précédent hommage reste conservé ; choisissez une photo plus petite.',
  'future-schema': 'Cet hommage provient d’une version plus récente. Ses données sont conservées sans modification.',
  'invalid-state': 'Les données de cet hommage sont illisibles. Elles sont conservées sans réinitialisation.',
  'invalid-envelope': 'Les données de cet hommage sont illisibles. Elles sont conservées sans réinitialisation.',
  'invalid-name': 'Le nom doit contenir au maximum 80 caractères, sans caractères de contrôle.',
  'invalid-dedication': 'La dédicace doit contenir au maximum 2000 caractères.',
  'invalid-photo': 'La photo locale est invalide. Votre portrait précédent est conservé.',
  'photo-too-large': 'La photo dépasse la capacité locale du portrait.',
  'rollback-failed': 'Le stockage local n’a pas pu être vérifié. Aucun succès d’enregistrement n’est annoncé.'
});
const errorText = code => messages[code] || 'Stockage personnel indisponible. Aucun changement n’a été confirmé.';
const moveKeys = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];

/** Owns only local remembrance and transient interactions, never campaign rewards. */
export class RefugeControllerV87 {
  constructor({ hub, saveSystem, isActive, toast = () => {}, documentRef = globalThis.document } = {}) {
    Object.assign(this, { hub, saveSystem, isActive, toast, documentRef });
    this.store = new RefugePersonalStoreV87({ storage: saveSystem.storage });
    this.state = createRefugePersonalStateV87(); this.ownerStamp = null; this.error = '';
    this.photoImage = null; this.photoSource = null; this.imageEpoch = 0;
    this.contemplating = false; this.greetingRemaining = 0; this.modalOwner = null;
    this.ui = new RefugeUiV87({ documentRef, onSave: patch => this.savePortrait(patch),
      onClose: () => this.resumeAfterDialog() });
    hub.onRefugeTickV87 = delta => this.tick(delta);
    hub.getRefugePresentationV87 = () => this.presentation();
    hub.getRefugeSnapshotV87 = () => this.snapshot();
    this.onStorage = event => {
      if (event.key === null || typeof event.key === 'string' && event.key.startsWith(REFUGE_PERSONAL_STORAGE_PREFIX_V87)) {
        this.refreshOwner(true); if (this.hub.isRefugeActiveV87?.()) this.hub.draw();
      }
    };
    documentRef.defaultView?.addEventListener('storage', this.onStorage);
  }
  owner() {
    const save = this.saveSystem.data;
    return { profileId: String(this.saveSystem.profile),
      gameId: `${save.createdAt}:${save.onboardingV84?.identity?.id || 'legacy'}` };
  }
  stamp() { return JSON.stringify(this.owner()); }
  available() { return this.isActive() && this.hub.isRefugeActiveV87?.() && this.hub.player?.alive === true; }
  refreshOwner(force = false) {
    const stamp = this.stamp();
    if (!force && stamp === this.ownerStamp) return;
    this.ownerStamp = stamp;
    const result = this.store.load(this.owner());
    this.state = result.state || createRefugePersonalStateV87();
    this.error = result.ok ? '' : errorText(result.code);
    this.syncPhoto();
  }
  syncPhoto() {
    const source = this.state.photoDataUrl;
    if (source === this.photoSource) return;
    this.photoSource = source; this.photoImage = null; const epoch = ++this.imageEpoch;
    if (!source) return;
    const image = this.documentRef.createElement('img');
    image.onload = () => {
      if (epoch !== this.imageEpoch || source !== this.photoSource) return;
      this.photoImage = image;
      if (this.available()) this.hub.draw();
    };
    image.onerror = () => {
      if (epoch === this.imageEpoch) { this.photoImage = null; this.error = 'La photo enregistrée ne peut pas être affichée. Son contenu est conservé.'; }
    };
    image.src = source;
  }
  updatePersonal(patch) {
    if (!this.available()) return { ok: false, message: 'Le profil ou la pièce a changé. Rouvrez le portrait.' };
    const result = this.store.commit(this.owner(), patch);
    if (result.ok) { this.state = result.state; this.error = ''; this.syncPhoto(); this.hub.draw(); }
    return { ...result, message: result.ok ? '' : errorText(result.code) };
  }
  savePortrait(patch) {
    if (!this.ui.isOpen || !this.modalOwner || this.modalOwner.stamp !== this.stamp() || !this.available())
      return { ok: false, message: 'Le profil a changé. Les modifications n’ont pas été enregistrées.' };
    const latest = this.store.load(this.owner());
    if (!latest.ok) return { ok: false, message: errorText(latest.code) };
    if (latest.state.revision !== this.modalOwner.revision)
      return { ok: false, message: 'L’hommage a changé dans un autre onglet. Fermez puis rouvrez le portrait avant de modifier.' };
    const result = this.updatePersonal(patch);
    if (result.ok) this.toast('Hommage enregistré sur cet appareil, sans envoi de photo.');
    return result;
  }
  handle(interaction) {
    if (!this.available() || !this.hub.running || this.ui.isOpen || this.hub.annexTransitionV71) return false;
    if (this.contemplating) { this.cancelContemplation(); return true; }
    const verified = getRefugeInteractionV87(this.hub);
    if (!verified || verified.action !== interaction?.action) return false;
    this.refreshOwner();
    if (['refuge:portrait', 'refuge:terminal'].includes(verified.action)) {
      try { this.hub.pause(); } catch (error) { this.toast('Pause non enregistrée : ' + error.message); return false; }
      this.hub.keys.clear(); this.hub.jumpQueued = 0; this.hub.player.vx = 0; this.hub.player.vy = 0;
      this.modalOwner = { stamp: this.stamp(), revision: this.state.revision };
      const opened = this.ui.open({ mode: verified.action.slice(7), state: this.state, error: this.error });
      if (!opened) { this.modalOwner = null; this.hub.resume(); this.toast('Cette interface ne peut pas être ouverte sur ce navigateur.'); }
      return opened;
    }
    if (verified.action === 'refuge:light') {
      const result = this.updatePersonal({ lightOn: !this.state.lightOn });
      this.toast(result.ok ? (this.state.lightOn ? 'Lumière souvenir allumée.' : 'Lumière souvenir éteinte.') : result.message);
      return result.ok;
    }
    if (verified.action === 'refuge:hologram') {
      this.greetingRemaining = 2; this.toast('L’hologramme félin vous salue. Sa silhouette est générique.'); return true;
    }
    if (verified.action === 'refuge:contemplate') {
      this.contemplating = true; this.hub.refugeMovementLockedV87 = true;
      this.hub.keys.clear(); this.hub.jumpQueued = 0; this.hub.player.vx = 0; this.hub.player.vy = 0;
      this.hub.statusKey = ''; this.hub.emitStatus(); return true;
    }
    return false;
  }
  cancelContemplation() {
    if (!this.contemplating) return false;
    this.contemplating = false; this.hub.refugeMovementLockedV87 = false;
    this.hub.statusKey = ''; this.hub.emitStatus(); return true;
  }
  tick(delta) {
    if (!this.available()) {
      this.contemplating = false; this.greetingRemaining = 0; this.hub.refugeMovementLockedV87 = false; return;
    }
    this.refreshOwner();
    if (this.documentRef.hidden || !this.hub.running || this.ui.isOpen) return;
    this.greetingRemaining = Math.max(0, this.greetingRemaining - Math.max(0, Math.min(.25, Number(delta) || 0)));
    if (this.contemplating && moveKeys.some(key => this.hub.keys.has(key))) this.cancelContemplation();
    this.hub.refugeMovementLockedV87 = this.contemplating;
  }
  presentation() {
    if (!this.available()) return {};
    this.refreshOwner();
    return { personal: { name: this.state.name, dedication: this.state.dedication,
      lightOn: this.state.lightOn, photoImage: this.photoImage },
    greetingRemaining: this.greetingRemaining, contemplating: this.contemplating };
  }
  snapshot() {
    return { active: Boolean(this.available()), modal: this.ui.isOpen, contemplating: this.contemplating,
      greetingRemaining: this.greetingRemaining, personalRevision: this.state.revision,
      hasPhoto: Boolean(this.state.photoDataUrl), storageError: Boolean(this.error) };
  }
  resumeAfterDialog() {
    const owner = this.modalOwner; this.modalOwner = null;
    this.hub.keys.clear(); this.hub.jumpQueued = 0;
    if (owner?.stamp === this.stamp() && this.available()) this.hub.resume();
  }
  close() {
    this.modalOwner = null; this.ui.close({ notify: false, restoreFocus: false });
    this.contemplating = false; this.greetingRemaining = 0; this.hub.refugeMovementLockedV87 = false;
    this.imageEpoch++; this.photoImage = null; this.photoSource = null; this.ownerStamp = null;
    this.state = createRefugePersonalStateV87(); this.error = '';
  }
}
