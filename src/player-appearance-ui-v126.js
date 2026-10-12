import {
  PLAYER_APPEARANCE_ITEMS_V126, PLAYER_APPEARANCE_SLOTS_V126,
  getPlayerAppearanceSelectionV126
} from './player-appearance-v126.js';
import { getCostumeV119 } from './franchise-costumes-v119.js';
import { normalizeUserEquipmentV95 } from './user-equipment-v95.js';
import {
  getPlayerAppearancePreviewModesV127, normalizePlayerAppearancePreviewAnimationV127
} from './player-appearance-preview-v126.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

/** Selected appearance and effective outfit are intentionally distinct: the
 * operator can prepare a kit while keeping a dedicated full-body costume.
 * Nothing here depends on whether an image happened to finish loading.
 */
export function playerAppearanceUiModelV126(save, owner = 'player') {
  const target = owner === 'coop' ? 'coop' : 'player';
  const state = getPlayerAppearanceSelectionV126(save, target);
  const locked = Boolean(save?.strategy?.currentOperation);
  const costume = target === 'player' ? getCostumeV119(save?.player?.costumeId) : null;
  const customArmor = target === 'player' && normalizeUserEquipmentV95(save?.player?.userEquipmentV95).armorId;
  const dedicated = Boolean(costume?.skinId && costume?.visualStatus === 'adapted-dedicated-atlas');
  const enabled = target === 'player' || save?.settings?.coop === true;
  const reason = customArmor ? 'custom-armor' : dedicated ? 'dedicated-costume' : !enabled ? 'coop-disabled' : null;
  const ownerLabel = target === 'player' ? `J1 · ${save?.player?.callsign || save?.player?.name || 'Echo9'}` : 'J2 · Opérateur coop';
  const status = reason === 'custom-armor'
    ? 'Choix conservés. En mission, l’armure de référence complète reste portée ; déséquipez-la dans la dotation ci-dessous pour afficher cette tenue.'
    : reason === 'dedicated-costume'
      ? `Choix conservés. La combinaison ${costume.name} garde son apparence complète. Choisissez une combinaison standard dans Équipage pour afficher cette tenue.`
      : reason === 'coop-disabled'
        ? 'Tenue préparée pour J2. Elle sera portée lorsque la coop locale sera activée.'
        : 'Tenue sélectionnée pour les déplacements, la visée et les actions de terrain.';
  return { owner: target, ownerLabel, state, locked, effective: reason === null, reason, status,
    slots: PLAYER_APPEARANCE_SLOTS_V126.map(slot => ({ ...slot, selectedItemId: state.slots[slot.id],
      choices: [
        ...(slot.optional ? [{ id: null, slot: slot.id, name: slot.emptyLabel, description: '' }] : []),
        ...PLAYER_APPEARANCE_ITEMS_V126.filter(item => item.slot === slot.id)
      ] })) };
}

export function playerAppearancePanelHtmlV126(save, { owner = 'player', facing = 1,
  animation = 'idle', weaponDescriptor = null } = {}) {
  const model = playerAppearanceUiModelV126(save, owner);
  const modes = getPlayerAppearancePreviewModesV127(weaponDescriptor);
  const selectedAnimation = normalizePlayerAppearancePreviewAnimationV127(animation, weaponDescriptor);
  return `<div class="appearance-heading-v126"><div><span class="eyebrow">ÉQUIPEMENT PERSONNEL</span><h3>Tenue de terrain</h3></div><div class="appearance-owners-v126" role="group" aria-label="Opérateur à habiller">${['player', 'coop'].map(target => `<button type="button" class="button compact ${target === model.owner ? '' : 'ghost'}" data-appearance-owner-v126="${target}" aria-pressed="${target === model.owner}">${target === 'player' ? 'J1' : 'J2'}</button>`).join('')}</div></div>
    <p class="appearance-intro-v126">Composez séparément le casque, le visage, le haut, les bras, les jambes et le paquetage. Vos choix sont enregistrés automatiquement. Cette dotation d’apparence est incluse ; les protections, les munitions et les outils restent ceux de votre équipement.</p>
    <div class="appearance-overview-v126">
      <figure class="appearance-preview-v126">
        <canvas id="player-appearance-preview-v126" width="360" height="320" role="img" aria-label="Aperçu de la tenue préparée pour ${escapeHtml(model.ownerLabel)}"></canvas>
        <figcaption>Aperçu de la tenue préparée</figcaption>
        <p data-appearance-preview-status-v126 role="status" aria-live="polite">Aperçu disponible dans l’armurerie.</p>
        <label class="appearance-preview-animation-v127" for="player-appearance-animation-v127"><span>Animation</span>
          <select id="player-appearance-animation-v127" data-appearance-animation-v127>${modes.map(mode => `<option value="${mode.id}"${mode.id === selectedAnimation ? ' selected' : ''}${mode.available ? '' : ' disabled'}>${escapeHtml(mode.label)}${mode.available ? '' : ` · ${escapeHtml(mode.unavailableLabel)}`}</option>`).join('')}</select>
        </label>
        <div class="appearance-preview-directions-v126" role="group" aria-label="Orientation de l’aperçu">${[-1, 1].map(direction => `<button type="button" class="button compact ${direction === (facing < 0 ? -1 : 1) ? '' : 'ghost'}" data-appearance-facing-v126="${direction}" aria-pressed="${direction === (facing < 0 ? -1 : 1)}">Profil ${direction < 0 ? 'gauche' : 'droit'}</button>`).join('')}</div>
      </figure>
      <div class="appearance-status-v126" data-appearance-effective-v126="${model.effective}" data-appearance-reason-v126="${model.reason || ''}"><strong>${escapeHtml(model.ownerLabel)}</strong><p>${escapeHtml(model.status)}</p>${model.locked ? '<p>Opération active : les choix de J1 et J2 sont verrouillés jusqu’au retour.</p>' : ''}</div>
    </div>
    <div class="appearance-slots-v126">${model.slots.map(slot => `<section class="appearance-slot-v126" aria-labelledby="appearance-title-${model.owner}-${slot.id}-v126"><h4 id="appearance-title-${model.owner}-${slot.id}-v126">${escapeHtml(slot.label)}</h4><div class="appearance-choices-v126" role="group" aria-label="${escapeHtml(slot.label)} — ${escapeHtml(model.ownerLabel)}">${slot.choices.map(choice => `<button type="button" class="button compact ${slot.selectedItemId === choice.id ? '' : 'ghost'}" data-appearance-owner-v126="${model.owner}" data-appearance-slot-v126="${slot.id}" data-appearance-item-v126="${choice.id || ''}" aria-pressed="${slot.selectedItemId === choice.id}"${choice.description ? ` title="${escapeHtml(choice.description)}"` : ''}${model.locked ? ' disabled' : ''}>${escapeHtml(choice.name)}</button>`).join('')}</div></section>`).join('')}</div>
    <div class="appearance-footer-v126"><p>Les tenues spéciales et les animations de transit gardent leur apparence dédiée ; vos choix sont conservés au retour.</p><button type="button" class="button compact ghost" data-appearance-reset-v126="${model.owner}"${model.locked ? ' disabled' : ''}>Rétablir la tenue Marine de ${model.owner === 'player' ? 'J1' : 'J2'}</button></div>`;
}
