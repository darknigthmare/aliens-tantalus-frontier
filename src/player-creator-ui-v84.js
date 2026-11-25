import { validatePlayerIdentityV84 } from './player-onboarding-v84.js';
import { tV185, tFromFrenchV185, applyStaticTranslationsV185, currentLanguageV185 } from './i18n-v185.js';
import { ORIGINS_V188, DEFAULT_ORIGIN_V188, normalizeOriginV188 } from './run-options-v188.js';

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
      <label for="player-callsign-v84" data-i18n="creator.callsign">Indicatif radio</label><input id="player-callsign-v84" name="callsign" value="ECHO-9" autocomplete="off" minlength="2" maxlength="16" required placeholder="ECHO-9" autocapitalize="characters">
      <label for="player-origin-v188">Origine</label><select id="player-origin-v188" name="originV188"></select><p id="player-origin-ability-v188" class="creator-note-v84"></p>
      <label class="creator-check-v188"><input id="player-permadeath-v188" name="crewPermadeathV188" type="checkbox" checked> Mort définitive de l’équipage (peut être désactivée plus tard, jamais réactivée)</label>
            <p data-i18n="creator.intro">Vous rejoignez les Marines coloniaux à bord du Tantalus. Votre nom et votre indicatif suivront cette campagne. Mara Vega reste votre commandante.</p>
      <p class="creator-note-v84" data-i18n="creator.note">Dotation initiale : M41A, M4A3, détecteur de mouvements et kit médical. Ce dossier ne propose pas encore de variantes corporelles animées.</p></section></div>
      <p id="player-creator-error-v84" role="alert"></p><footer><button type="button" data-creator-cancel-v84 data-i18n="creator.cancel">ANNULER</button><button type="submit" data-i18n="creator.submit">VALIDER ET SORTIR DE CRYOSTASE</button></footer>
      </form>`;
    documentRef.body.append(this.dialog);
    this.renderOriginsV188();
    this.dialog.addEventListener('cancel', (event) => { event.preventDefault(); this.cancel(); });
    this.dialog.querySelector('[data-creator-cancel-v84]').addEventListener('click', () => this.cancel());
    // A correction clears the previous refusal instead of leaving it beside the new field.
    this.dialog.querySelector('form').addEventListener('input', () => this.error(''));
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
        this.onSubmit(result.identity, {
          originV188: normalizeOriginV188(this.dialog.querySelector('[name="originV188"]')?.value),
          crewPermadeathV188: this.dialog.querySelector('[name="crewPermadeathV188"]')?.checked !== false
        });
      } catch (error) { this.error(tFromFrenchV185(error.message) || tV185('creator.saveFailed', 'Sauvegarde impossible. Votre ancienne partie est conservée.')); return; }
      finally { this.submitting = false; }
      this.dialog.close();
      this.onComplete();
    });
  }

  error(message) { this.dialog.querySelector('[role="alert"]').textContent = message; }
  renderOriginsV188(reset = false) {
    const select = this.dialog.querySelector('#player-origin-v188'), note = this.dialog.querySelector('#player-origin-ability-v188');
    if (!select) return;
    let language = 'fr'; try { language = currentLanguageV185(); } catch {}
    const lang = language === 'en' ? 'en' : 'fr', previous = reset ? DEFAULT_ORIGIN_V188 : select.value || DEFAULT_ORIGIN_V188;
    select.replaceChildren(...ORIGINS_V188.map(origin => Object.assign(this.document.createElement('option'), {
      value: origin.id, textContent: `${origin.id.slice(-2)} · ${origin.label[lang]}` })));
    select.value = normalizeOriginV188(previous);
    const describe = () => { if (note) note.textContent = ORIGINS_V188.find(origin => origin.id === select.value)?.ability[lang] || ''; };
    select.onchange = describe; describe();
  }
  open(profile) {
    if (this.dialog.open) return false;
    this.dialog.querySelector('form').reset();
    this.error('');
    // V185: the dialog is built once; translate it each time it opens.
    applyStaticTranslationsV185(this.dialog);
    this.renderOriginsV188(true);
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
