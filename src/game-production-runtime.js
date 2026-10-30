import {
  GameEngine as ProductionCoreEngine,
  buildEnemyEncounterEligibility as buildCoreEnemyEncounterEligibility
} from './game-production-core.js';
import { withV52MissionRuntime } from './game-v52-runtime.js';
import { withV52LevelRuntime } from './game-v52-level-runtime.js';
import { withCargoBrutalRuntimeV67 } from './cargo-brutal-runtime-v67.js';
import { withNarrativeCollectablesRuntimeV68 } from './narrative-collectables-runtime-v68.js';
import { withAlphaBravoCoopRuntimeV69 } from './alpha-bravo-coop-runtime-v69.js';
import { withAlienSurvivalRuntimeV70 } from './alien-survival-runtime-v70.js';
import { captureGameplaySupportV72, restoreGameplaySupportV72 } from './gameplay-support-v72.js';
import { captureTacticalReloadV77, restoreTacticalReloadV77, cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import { drawTacticalReloadHudV77 } from './tactical-reload-hud-v77.js';
import { getWeaponPresentationProfileV124 } from './weapon-presentation-profiles-v124.js';
import { createLegacyWeaponFeedV167, captureWeaponFeedV167, restoreWeaponFeedV167,
  spendAcceptedRoundV167, weaponFeedLoadedRoundsV167, weaponFeedReserveRoundsV167 } from './weapon-magazine-inventory-v167.js';
import { createWeaponMasteryV167, awardAcceptedWeaponDamageV167,
  captureWeaponMasteryV167, restoreWeaponMasteryV167 } from './weapon-mastery-v167.js';
import { withPlaceablesRuntimeV86 } from './placeables-runtime-v86.js';
import { withUserCasteCampaignV88 } from './enemy-user-campaign-runtime-v88.js';
import { withBlackCocoonRuntimeV121 } from './black-cocoon-runtime-v121.js';
import { withBlackCocoonPresentationV158 } from './black-cocoon-presentation-v158.js';
import { withApcConvoyRuntimeV121 } from './apc-convoy-runtime-v121.js';
import { withC12HordeRuntimeV121 } from './c12-horde-runtime-v121.js';
import { withArchiveRelayRuntimeV122 } from './archive-relay-runtime-v122.js';
import { withPlayerFieldActionsV124 } from './player-field-actions-v124.js';
import { withWeaponEffectsV124 } from './weapon-effects-runtime-v124.js';
import { withPlayerWeaponRigV125 } from './player-weapon-runtime-v125.js';
import { withPlayerAppearanceV126 } from './player-appearance-runtime-v126.js';
import { withDirectionalAimV130 } from './directional-aim-v130.js';
import { withVerticalWorldV130 } from './vertical-world-v130.js';
import { withDestructibleSceneryV130 } from './destructible-scenery-v130.js';
import { withEnemyTacticsV130 } from './enemy-tactics-v130.js';
import { withWeaponActionsV130 } from './weapon-actions-v130.js';
import { withWeaponActionsV131 } from './weapon-actions-v131.js';
import { withApcCourseV131 } from './apc-course-v131.js';
import { withHiveMissionsV131 } from './hive-missions-v131.js';
import { withMechaMissionsV131 } from './mecha-missions-v131.js';
import { withEcosystemMissionsV131 } from './ecosystem-missions-v131.js';
import { withLegacyMissionsV131 } from './legacy-operations-v131.js';
import { withSquadDoctrineV132 } from './squad-doctrine-v132.js';
import { withHordeDirectorV132 } from './horde-director-v132.js';
import { withNarrativeEvidenceV132 } from './narrative-evidence-v132.js';
import { withPlaceablesExtensionV132 } from './placeables-extension-v132.js';
import { isolateForgeMissionOptionsV136 } from './editor-spatial-v136.js';
import { withForgeMissionRuntimeV141 } from './forge-mission-runtime-v141.js';
import { withForgeDecorationV141 } from './forge-decoration-v141.js';
import { withMotionTrackerV160 } from './motion-tracker-v160.js';
import { withArchiveRelayPresentationV160 } from './archive-relay-presentation-v160.js';

export * from './game-production-core.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const V52ProductionEngine = withV52MissionRuntime(withV52LevelRuntime(ProductionCoreEngine));
const V67ProductionEngine = withCargoBrutalRuntimeV67(V52ProductionEngine);
const V68ProductionEngine = withNarrativeCollectablesRuntimeV68(V67ProductionEngine);
const V69ProductionEngine = withAlphaBravoCoopRuntimeV69(V68ProductionEngine);
const V70ProductionEngine = withAlienSurvivalRuntimeV70(V69ProductionEngine);
const V86ProductionEngine = withPlaceablesRuntimeV86(V70ProductionEngine);
const V88ProductionEngine = withUserCasteCampaignV88(V86ProductionEngine);
const V121ProductionEngine = withC12HordeRuntimeV121(withApcConvoyRuntimeV121(withBlackCocoonRuntimeV121(V88ProductionEngine)));
const V122ProductionEngine = withArchiveRelayRuntimeV122(V121ProductionEngine);
const V124ProductionEngine = withWeaponEffectsV124(withPlayerFieldActionsV124(V122ProductionEngine));
const V125ProductionEngine = withPlayerWeaponRigV125(V124ProductionEngine);
const V126ProductionEngine = withPlayerAppearanceV126(V125ProductionEngine);
const V130ProductionEngine = withDirectionalAimV130(withWeaponActionsV130(withEnemyTacticsV130(
  withDestructibleSceneryV130(withVerticalWorldV130(V126ProductionEngine)))));
const V131ProductionEngine = withLegacyMissionsV131(withEcosystemMissionsV131(withMechaMissionsV131(
  withHiveMissionsV131(withApcCourseV131(withWeaponActionsV131(V130ProductionEngine))))));
const V132ProductionEngine = withNarrativeEvidenceV132(withHordeDirectorV132(
  withSquadDoctrineV132(withPlaceablesExtensionV132(V131ProductionEngine))));
const V158ProductionEngine = withBlackCocoonPresentationV158(V132ProductionEngine);

export function buildEnemyEncounterEligibility(enemy = {}, context = {}) {
  const result = buildCoreEnemyEncounterEligibility(enemy, context);
  const adapted = /vacuum-adapted|cryo-adapted/i.test(String(enemy.modifier || ''));
  if (result.eligible || !adapted || !result.modifierMatch) return result;
  return Object.freeze({
    ...result,
    eligible: true,
    reasons: Object.freeze(result.reasons.filter((reason) => reason !== 'world-mismatch' && reason !== 'habitat-mismatch').concat('adaptation-override'))
  });
}

export class GameEngine extends withMotionTrackerV160(withArchiveRelayPresentationV160(withForgeDecorationV141(withForgeMissionRuntimeV141(V158ProductionEngine)))) {
  start(options = {}) {
    options = isolateForgeMissionOptionsV136(options);
    this.expectedMissionSignatureV130 = options.missionLevel?.signature || null;
    this.weaponMasteryV167 ||= createWeaponMasteryV167();
    this.experimentalPhysicalMagazinesV167 = options.experimentalPhysicalMagazinesV167 === true;
    const snapshot = super.start(options);
    // An opt-in pilot only; legacy gameplay and older saves keep numeric ammo.
    if (this.experimentalPhysicalMagazinesV167) this.initializeWeaponFeedsV167();
    this.canvas.focus?.({ preventScroll: true });
    return snapshot;
  }

  initializeWeaponFeedsV167() {
    for (const role of ['player', 'coop']) {
      const actor = this[role];
      if (!actor || role === 'coop' && !this.coopEnabled || actor.weaponFeedV167) continue;
      const descriptor = this.reloadWeaponV77?.(actor);
      const weaponId = descriptor && typeof descriptor === 'object' ? descriptor.id : null;
      const presentation = getWeaponPresentationProfileV124(descriptor);
      const feed = presentation?.reload?.feed;
      if (!/^weapon-\d{3}-[a-z0-9-]+$/.test(weaponId || '')
        || !['box', 'drum', 'belt', 'cell', 'tank'].includes(feed)) continue;
      actor.weaponFeedV167 = createLegacyWeaponFeedV167({ weaponId,
        ownerId: role, ammoTypeId: presentation.ammunition || 'unspecified',
        magazineSize: actor.magazineSize, ammo: actor.ammo, reserve: actor.ammoReserve, feed });
    }
  }

  captureResumeState() {
    const state = super.captureResumeState();
    if (state.mission && this.mission?.rewards) state.mission.rewards = structuredClone(this.mission.rewards);
    for (const role of ['player', 'coop']) if (state[role]) {
      state[role].tacticalReloadV77 = captureTacticalReloadV77(this[role]);
      state[role].weaponFeedV167 = captureWeaponFeedV167(this[role]?.weaponFeedV167);
    }
    return { ...state, weaponMasteryV167: captureWeaponMasteryV167(this.weaponMasteryV167),
      gameplaySupportV72: captureGameplaySupportV72(this) };
  }

  applyResumeState(rawState) {
    const signature = this.expectedMissionSignatureV130 || this.missionLevelRuntime?.signature;
    if (signature && rawState?.missionLevel?.signature && rawState.missionLevel.signature !== signature) {
      return { applied: false, reason: 'level-signature-mismatch', missionLevelRestored: false };
    }
    rawState = this.migrateVerticalResumeV130?.(rawState) || rawState;
    const result = super.applyResumeState(rawState);
    if (!result?.applied) return result;
    const supportRestoredV72 = restoreGameplaySupportV72(this, rawState?.gameplaySupportV72);
    this.weaponMasteryV167 = restoreWeaponMasteryV167(rawState?.weaponMasteryV167);
    const tacticalReloadRestoredV77 = {};
    const weaponFeedRestoredV167 = {};
    for (const role of ['player', 'coop']) {
      const actor = this[role];
      const carried = Number(actor?.ammo) + Number(actor?.ammoReserve);
      actor.weaponFeedV167 = restoreWeaponFeedV167(rawState?.[role]?.weaponFeedV167, {
        ownerId: role, expectedCarriedRounds: Number.isSafeInteger(carried) && carried >= 0 ? carried : null });
      weaponFeedRestoredV167[role] = Boolean(actor.weaponFeedV167);
      tacticalReloadRestoredV77[role] = restoreTacticalReloadV77(actor, rawState?.[role]?.tacticalReloadV77, this.reloadWeaponV77(actor));
      if (this[role]?.reloading) this[role].actionClock = this[role].reloadClock;
    }
    const placeablesRestoredV86 = this.restorePlaceablesAfterSupportV86(rawState);
    return { ...result, supportRestoredV72, tacticalReloadRestoredV77,
      weaponFeedRestoredV167, placeablesRestoredV86 };
  }

  canPerformGameplayAction(actor = this.player, { allowVent = false, allowSquadTask = false } = {}) {
    return Boolean(this.running && !this.paused && !this.forgeNarrativeOpenV156 && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
      && this.mission?.state === 'active' && actor?.alive && !actor.downed && (allowVent || !actor.ventTransit)
      && !(actor.hazardKind === 'electrical' && actor.hazardClock > 0)
      && (actor !== this.coop || this.coopEnabled) && !this.isPlaceableBusyV86(actor) && !this.isFieldActionBusyV124(actor)
      && (allowSquadTask || !this.isSquadActionLockedV132?.(actor)));
  }

  // Guard the outermost runtime so keyboard, touch/UI and internal dispatch share the same contract.
  interact(actor = this.player) {
    return this.canPerformGameplayAction(actor, { allowVent: true, allowSquadTask: true }) ? super.interact(actor) : false;
  }

  fire(actor = this.player) {
    if (!this.canPerformGameplayAction(actor) || actor.climbing || actor.toolUseClock > 0
      || actor.interactionClock > 0 || this.playerWeaponFireBlockedV160?.(actor)) return false;
    const beforeShots = Number(actor?.shots) || 0;
    const fired = super.fire(actor);
    const feed = actor?.weaponFeedV167;
    if (feed && Number(actor.shots) > beforeShots) {
      // V131 burst shots may already have committed their own feed receipts.
      for (let serial = beforeShots + 1; serial <= Number(actor.shots); serial++) {
        const receipt = String(serial);
        if (!feed.receipts.includes('shot:' + receipt) && !spendAcceptedRoundV167(feed, receipt)) {
          actor.weaponFeedV167 = null;
          break;
        }
      }
      if (actor.weaponFeedV167 && (weaponFeedLoadedRoundsV167(feed) !== actor.ammo
        || weaponFeedReserveRoundsV167(feed) !== actor.ammoReserve)) actor.weaponFeedV167 = null;
    }
    return fired;
  }

  melee(actor = this.player) {
    if (this.isMechaMissionV131?.() && actor?.inVehicle
      || this.isHiveMissionV131?.() && actor === this.player && this.hiveV131?.possession) {
      return this.canPerformGameplayAction(actor) ? super.melee(actor) : false;
    }
    if (!this.canPerformGameplayAction(actor) || actor.climbing || actor.inVehicle || actor.reloading || actor.fireClock > 0
      || actor.toolUseClock > 0 || actor.interactionClock > 0) return false;
    if (this.neuro?.active && actor === this.player) return this.meleeAttack?.(actor) || false;
    // The outer guard must not replace an admitted knife, axe or stun baton
    // with a generic rifle bash. The weapon contract owns reach and effects.
    if (['melee', 'stun'].includes(this.weaponActionProfileV130?.(actor)?.kind)) return super.melee(actor);
    const accepted = this.performContextualMelee(actor);
    if (accepted) this.refreshStealth?.(actor);
    return accepted;
  }

  applyEnemyDamage(enemy, amount, source = {}) {
    const applied = super.applyEnemyDamage(enemy, amount, source);
    const actor = source?.owner;
    const ownerId = actor === this.player ? 'player' : actor === this.coop && this.coopEnabled ? 'coop'
      : actor?.squadMember && actor.crewId ? 'squad:' + actor.crewId : null;
    if (Number.isFinite(applied) && applied > 0 && ownerId && typeof source?.id === 'string'
      && typeof source?.weaponId === 'string' && typeof enemy?.id === 'string') {
      const earned = awardAcceptedWeaponDamageV167(this.weaponMasteryV167,
        { ownerId, weaponId: source.weaponId, receiptId: source.id,
          targetId: enemy.id, appliedDamage: applied });
      if (earned?.levelUp) this.onEvent?.({ type: 'weapon-mastery-level-v167',
        ownerId, weaponId: earned.weaponId, level: earned.level });
    }
    return applied;
  }

  enemyMeleePathClearV64(attacker, target) {
    // Dormant room occupants are retained for return journeys, not contacts.
    // Keep the existing depth, walls and closed-door checks in the base.
    if (attacker?.dormant || target?.dormant) return false;
    return super.enemyMeleePathClearV64(attacker, target);
  }

  reload(actor = this.player) {
    return this.canPerformGameplayAction(actor) && !actor.climbing && !(actor.meleeClock > 0)
      && !(actor.toolUseClock > 0) && !(actor.interactionClock > 0) ? super.reload(actor) : false;
  }

  useMedkit(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.useMedkit(actor) : false;
  }

  activateTracker(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.activateTracker(actor) : false;
  }

  toggleVehicle(actor = this.player) {
    if (this.forgeNarrativeOpenV156) return false;
    if (!this.paused && this.running) this.cancelPlaceableV86(actor, 'vehicle');
    if (!this.paused && this.running) this.cancelFieldActionV124(actor, 'vehicle');
    const changed = this.canPerformGameplayAction(actor) ? super.toggleVehicle(actor) : false;
    if (changed) cancelTacticalReloadV77(actor, 'vehicle');
    return changed;
  }

  drawHud(ctx) {
    super.drawHud(ctx);
    drawTacticalReloadHudV77(this, ctx);
  }

  useEquipment(equipmentId, actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.useEquipment(equipmentId, actor) : false;
  }

  activateNeuroCountermeasure(actor = this.player) {
    return this.canPerformGameplayAction(actor) ? super.activateNeuroCountermeasure(actor) : false;
  }

  applyCostumeRuntime() {
    if (!this.costumeRuntime?.active || !this.player) return;
    if (this.costumeRuntime.cosmeticOnly) { this.player.costumeId = this.costumeRuntime.id; return; }
    this.player.maxArmor = 100 + this.costumeRuntime.armor;
    this.player.armor = clamp(this.player.armor + this.costumeRuntime.armor, 0, this.player.maxArmor);
    this.player.costumeId = this.costumeRuntime.id;
    this.player.costumeMobility = this.costumeRuntime.mobility;
    this.player.stealthRating = this.costumeRuntime.stealth;
    this.player.factionMarking = this.costumeRuntime.faction;
  }
}
