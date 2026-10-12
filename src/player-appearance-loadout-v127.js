import { WEAPONS, CREW } from './content.js';
import { resolveCrewDefinitionV85 } from './crew-recruitment-v85.js';
import { buildCrewDeploymentV85 } from './crew-runtime-v85.js';
import { getUserEquipmentV95 } from './user-equipment-v95.js';

const list = value => Array.isArray(value) ? value : [];

/** Read the issued weapon without starting an operation or changing the save.
 * The same role assignment as deployment applies: an independent Echo9 is J1,
 * legacy J1 uses the first active Marine, and J2 uses the second active Marine.
 * A personal kit with no weapon stays unarmed. An active manifest owns its kit
 * even when a caller's current profile contains newer choices.
 */
export function resolvePlayerAppearancePreviewWeaponV127(save, owner = 'player') {
  const operation = save?.strategy?.currentOperation;
  const source = operation || save?.player || {};
  const issued = getUserEquipmentV95(source.userEquipmentV95?.weaponId);
  const custom = issued?.kind === 'weapon' ? issued : null;
  const shared = custom || list(source.weaponIds).map(id => WEAPONS.find(item => item.id === id)).filter(Boolean).at(-1) || null;
  const identity = operation ? operation.playerIdentityV84 : save?.onboardingV84?.identity;
  const crewIds = operation ? list(operation.crewIds) : list(save?.strategy?.selectedCrewIds);
  const crew = crewIds.map(id => {
    if (operation && Array.isArray(operation.crewManifestV85)) return operation.crewManifestV85.find(member => member.id === id);
    return resolveCrewDefinitionV85(list(save?.crew).find(member => member.id === id) || { id }, CREW);
  }).filter(member => member?.status === 'active');
  if (owner !== 'coop' && custom) return custom;
  const member = owner === 'coop' ? crew[1] : identity?.id === 'player-echo9' ? null : crew[0];
  const personal = member && buildCrewDeploymentV85(member);
  return personal?.personalEquipment ? personal.weaponRuntime || null : shared;
}
