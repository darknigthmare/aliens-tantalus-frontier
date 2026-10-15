import { CREW } from './content.js';
import { getOperationBrief } from './save.js';
import { resolveCrewDefinitionV85 } from './crew-recruitment-v85.js';
import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { normalizeUserEquipmentV95 } from './user-equipment-v95.js';

/** Build a local deployment manifest without starting a campaign operation.
 * The native loadout resolver consumes this clone; readiness, costs, clocks,
 * opening progress and campaign receipts never participate in a Forge test.
 */
export function buildForgeMissionSandboxV140(save, { campaign, world } = {}) {
  if (!campaign?.id || !world?.id) throw new TypeError('Campagne et monde de référence requis pour le test Forge.');
  const sandbox = structuredClone(save);
  sandbox.strategy.currentOperation = null;
  sandbox.strategy.lastOperation = null;
  // This query supplies the native active/selected crew policy, including solo
  // reference missions. Its readiness result and strategic quotes are ignored.
  const brief = getOperationBrief(sandbox, campaign, world);
  const operation = {
    id: 'forge-playtest-v140',
    context: 'forge-playtest',
    campaignId: campaign.id,
    worldId: world.id,
    startedDay: sandbox.clock.day,
    startedHour: sandbox.clock.hour,
    risk: brief.risk,
    cost: {},
    reward: {},
    crewIds: [...brief.crewIds],
    crewManifestV85: brief.crewIds.map(id => resolveCrewDefinitionV85(
      sandbox.crew.find(member => member.id === id), CREW
    )).filter(Boolean),
    playerIdentityV84: sandbox.onboardingV84?.identity ? structuredClone(sandbox.onboardingV84.identity) : null,
    weaponIds: [...sandbox.player.weaponIds],
    equipmentIds: [...sandbox.player.equipmentIds],
    vehicleId: sandbox.strategy.selectedVehicleId || null,
    costumeId: sandbox.player.costumeId || null,
    userEquipmentV95: normalizeUserEquipmentV95(sandbox.player.userEquipmentV95),
    playerAppearanceV126: normalizePlayerAppearanceV126(sandbox.player.appearanceV126),
    coopAppearanceV126: normalizePlayerAppearanceV126(sandbox.player.coopAppearanceV126),
    neuroProfileId: sandbox.strategy.selectedNeuroProfileId || null,
    apexDossierId: sandbox.strategy.selectedApexDossierId || null,
    difficulty: sandbox.settings?.difficulty || sandbox.difficulty || 'standard',
    resumeState: null,
    insertionState: null,
    flags: {}
  };
  sandbox.strategy.currentOperation = operation;
  return { sandbox, deployment: { ok: true, resumed: false, operation } };
}
