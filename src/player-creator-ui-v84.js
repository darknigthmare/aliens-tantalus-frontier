import { validatePlayerIdentityV84 } from './player-onboarding-v84.js';
import { tV185, tFromFrenchV185, applyStaticTranslationsV185 } from './i18n-v185.js';

/** Draft-only native modal: no persistence occurs until the owner accepts submit. */
export class PlayerCreatorUiV84 {
  constructor({ onSubmit, onComplete, onCancel, documentRef = globalThis.document }) {
    this.document = documentRef;
    this.onSubmit = onSubmit;
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    this.dialog = documentRef.createElement('dialog');
    this.dialog.id = 'player-creator-v84';
    this.dialog.setAttribute('aria-labelledby', 'player-creator-heading-v84');
    this.dialog.innerHTML = `<form id="player-creator-form-v84">
      <header><span class="eyebrow" data-i18n="creator.eyebrow">DOSSIER PERSONNEL · ECHO-9</span><h1 id="player-creator-heading-v84" data-i18n="creator.heading">Votre relève commence ici.</h1><p id="player-creator-profile-v84"></p></header>
      <div class="creator-grid-v84"><figure><img src="/assets/openai/ui/customization/echo9-customization-mannequin-v61.png" alt="Présentation de la tenue Echo-9 existante" data-i18n-attr="alt:creator.figureAlt" width="280" height="330"><figcaption data-i18n="creator.figure">Tenue Echo-9 · apparence de départ existante</figcaption></figure>
      <section aria-label="Identité du marine" data-i18n-aria="creator.identity"><label for="player-name-v84" data-i18n="creator.name">Nom du marine</label><input id="player-name-v84" name="name" autocomplete="off" minlength="2" maxlength="40" required placeholder="Prénom et nom" data-i18n-attr="placeholder:creator.namePlaceholder">
      <label for="player-callsign-v84" data-i18n="creator.callsign">Indicatif radio</label><input id="player-callsign-v84" name="callsign" autocomplete="off" minlength="2" maxlength="16" required placeholder="ECHO-9" autocapitalize="characters">
      <p data-i18n="creator.intro">Vous rejoignez les Marines coloniaux à bord du Tantalus. Votre nom et votre indicatif suivront cette campagne. Mara Vega reste votre commandante.</p>
      <p class="creator-note-v84" data-i18n="creator.note">Dotation initiale : M41A, M4A3, détecteur de mouvements et kit médical. Ce dossier ne propose pas encore de variantes corporelles animées.</p></section></div>
      <p id="player-creator-error-v84" role="alert"></p><footer><button type="button" data-creator-cancel-v84 data-i18n="creator.cancel">ANNULER</button><button type="submit" data-i18n="creator.submit">VALIDER ET SORTIR DE CRYOSTASE</button></footer>
      </form>`;
    documentRef.body.append(this.dialog);
    this.dialog.addEventListener('cancel', (event) => { event.preventDefault(); this.cancel(); });
    this.dialog.querySelector('[data-creator-cancel-v84]').addEventListener('click', () => this.cancel());
    this.dialog.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (this.submitting || !this.dialog.open) return;
      const result = validatePlayerIdentityV84({
        name: this.dialog.querySelector('[name="name"]').value,
        callsign: this.dialog.querySelector('[name="callsign"]').value
      });
      if (!result.ok) { this.error(Object.values(result.errors).map(tFromFrenchV185).join(' ')); return; }
      this.submitting = true;
      try {
        this.onSubmit(result.identity);
      } catch (error) { this.error(tFromFrenchV185(error.message) || tV185('creator.saveFailed', 'Sauvegarde impossible. Votre ancienne partie est conservée.')); return; }
      finally { this.submitting = false; }
      this.dialog.close();
      this.onComplete();
    });
  }

  error(message) { this.dialog.querySelector('[role="alert"]').textContent = message; }
  open(profile) {
    if (this.dialog.open) return false;
    this.dialog.querySelector('form').reset();
    this.error('');
    // V185: the dialog is built once; translate it each time it opens.
    applyStaticTranslationsV185(this.dialog);
    this.dialog.querySelector('#player-creator-profile-v84').textContent = tV185('creator.profile', `Profil ${profile} : la partie précédente ne sera remplacée qu’à la validation. Annuler la conserve intégralement.`, { profile });
    this.dialog.showModal();
    this.dialog.querySelector('[name="name"]').focus();
    return true;
  }
  cancel() {
    if (!this.dialog.open || this.submitting) return;
    this.dialog.close();
    this.onCancel();
  }
}
