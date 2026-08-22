import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CREW, ENEMIES, VEHICLES } from '../src/content-core-v50.js';
import {
  ENEMY_VISUAL_PROFILES,
  enemyVisualCoverageReport,
  resolveEnemyVisualProfile
} from '../src/enemy-visual-runtime-v53.js';
import {
  ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V55,
  ENEMY_VISUAL_OVERRIDE_EXACT_PROFILE_COUNT_V55,
  ENEMY_VISUAL_OVERRIDE_FAMILY_PROFILE_COUNT_V55,
  ENEMY_VISUAL_OVERRIDE_PROFILE_COUNT_V55
} from '../src/enemy-visual-overrides-v55.js';
import { MISSION_STRUCTURAL_PROP_FILES } from '../src/game-v51-runtime.js';
import { MISSION_LEVEL_LAYER_FILES_V52 } from '../src/game-v52-level-runtime.js';
import {
  DROPSHIP_HANGAR_ART_V55,
  ELECTRICAL_HAZARD_ART_V55
} from '../src/hub-art-runtime-v55.js';
import { HUB_DECKS, HUB_MODULAR_PROP_FILES } from '../src/hub-game.js';
import { NPC_MISSION_IDENTITIES_V55 } from '../src/npc-mission-runtime-v55.js';
import { CREW_SPRITE_IDS, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import {
  VEHICLE_VISUAL_CHASSIS_COUNT,
  VEHICLE_VISUAL_PROFILE_COUNT,
  VEHICLE_VISUAL_PROFILES,
  resolveVehicleVisualProfile,
  vehicleVisualCoverageReport
} from '../src/vehicle-visual-runtime-v55.js';
import {
  V55_EXPECTED_ATLASES,
  V55_EXPECTED_CELLS,
  V55_NEW_SHEET_IDS,
  V55_REPO_ROOT,
  V55_SPRITE_MANIFEST_PATH,
  V55_SHEET_DEFINITIONS,
  assertSpriteManifestV55,
  manifestCellCount
} from './sync-sprite-manifest-v55.mjs';

const modulePath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(modulePath), '..');
export const V55_INVENTORY_JSON_PATH = resolve(repoRoot, 'docs/ASSET_RUNTIME_INVENTORY_V55.json');
export const V55_INVENTORY_MARKDOWN_PATH = resolve(repoRoot, 'docs/ASSET_RUNTIME_INVENTORY_V55.md');

const BASE_ENEMY_COUNT = 52;
const BASE_VEHICLE_COUNT = 36;
const V54_EXACT_VEHICLE_BASE_ID = 'vehicle-001-m577-armored-personnel-carrier';
const v55IdSet = new Set(V55_NEW_SHEET_IDS);

const countBy = (items, selector) => Object.fromEntries([...items.reduce((counts, item) => {
  const key = selector(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map())]);

const stem = (path) => String(path).split('/').at(-1).replace(/\.png$/i, '');
const runtimeIds = (runtimeSheets) => {
  if (runtimeSheets instanceof Set) return new Set(runtimeSheets);
  if (Array.isArray(runtimeSheets)) return new Set(runtimeSheets.map((entry) => typeof entry === 'string' ? entry : entry?.id));
  return new Set(Object.keys(runtimeSheets || {}));
};
const runtimeEntry = (runtimeSheets, id) => {
  if (!runtimeSheets || runtimeSheets instanceof Set || Array.isArray(runtimeSheets)) return null;
  return runtimeSheets[id] || null;
};
const runtimeHas = (runtimeSheets, id) => runtimeIds(runtimeSheets).has(id);
const sheetAsset = (sheet) => sheet?.path || sheet?.files?.normalized || null;
const sourceFacingName = (value) => value === 'left' || Number(value) < 0 ? 'left' : 'right';

export function inspectRuntimeWiringV55(runtimeSheets = SPRITE_SHEETS) {
  const ids = runtimeIds(runtimeSheets);
  const missingSheetIds = V55_NEW_SHEET_IDS.filter((id) => !ids.has(id));
  const invalidSheetIds = [];
  for (const definition of V55_SHEET_DEFINITIONS) {
    const entry = runtimeEntry(runtimeSheets, definition.id);
    if (!entry) continue;
    const path = sheetAsset(entry);
    if (path && path !== definition.files.normalized) invalidSheetIds.push(definition.id);
    else if (entry.family && entry.family !== definition.family) invalidSheetIds.push(definition.id);
    else if (sourceFacingName(entry.sourceFacing) !== 'right') invalidSheetIds.push(definition.id);
    else if (entry.identityVerified === false) invalidSheetIds.push(definition.id);
  }
  return Object.freeze({
    expectedSheetCount: V55_NEW_SHEET_IDS.length,
    wiredSheetCount: V55_NEW_SHEET_IDS.length - missingSheetIds.length,
    ready: missingSheetIds.length === 0 && invalidSheetIds.length === 0,
    missingSheetIds: Object.freeze(missingSheetIds),
    invalidSheetIds: Object.freeze([...new Set(invalidSheetIds)])
  });
}

export function assertRuntimeWiredV55(runtimeSheets = SPRITE_SHEETS) {
  const wiring = inspectRuntimeWiringV55(runtimeSheets);
  if (!wiring.ready) {
    const details = [
      wiring.missingSheetIds.length ? `missing: ${wiring.missingSheetIds.join(', ')}` : '',
      wiring.invalidSheetIds.length ? `invalid: ${wiring.invalidSheetIds.join(', ')}` : ''
    ].filter(Boolean).join('; ');
    throw new Error(`Runtime v55 is not fully wired; inventory output is blocked (${details}).`);
  }
  return wiring;
}

const playerInventory = (runtimeSheets) => ['player.echo9-marine.locomotion', 'player.echo9-marine.combat'].map((id) => {
  const sheet = runtimeEntry(runtimeSheets, id) || SPRITE_SHEETS[id];
  return {
    id,
    asset: sheetAsset(sheet),
    sourceFacing: sourceFacingName(sheet?.sourceFacing),
    identityVerified: sheet?.identityVerified === true,
    runtimeState: sheet?.identityVerified === true ? 'loaded-exact' : 'blocked-identity'
  };
});

const npcInventory = (runtimeSheets) => CREW.map((member) => {
  const mission = NPC_MISSION_IDENTITIES_V55[member.id] || null;
  const missionWired = mission ? runtimeHas(runtimeSheets, mission.missionSheetId) : false;
  return {
    crewId: member.id,
    name: member.name,
    role: member.role,
    species: member.species,
    specialty: member.specialty,
    locomotionSheetId: CREW_SPRITE_IDS[member.id] || null,
    locomotionRuntimeState: CREW_SPRITE_IDS[member.id] ? 'loaded-locomotion' : 'missing',
    missionSheetId: mission?.missionSheetId || null,
    missionClipSetId: mission?.missionClipSetId || null,
    missionClips: mission ? Object.keys(mission.missionClips) : [],
    missionRuntimeState: !mission ? 'missing-dedicated-mission-sheet' : missionWired ? 'loaded-exact' : 'authored-not-wired'
  };
});

const enemyInventory = (runtimeSheets) => ENEMIES.slice(0, BASE_ENEMY_COUNT).map((base, archetypeIndex) => {
  const profiles = ENEMIES.filter((_, index) => index % BASE_ENEMY_COUNT === archetypeIndex);
  const visual = resolveEnemyVisualProfile(base);
  const coverage = countBy(profiles, (profile) => resolveEnemyVisualProfile(profile).identityStatus);
  return {
    name: base.name,
    biology: base.biology,
    caste: base.caste,
    profileCount: profiles.length,
    exactProfileCount: coverage.exact || 0,
    familyReuseProfileCount: coverage['authored-family'] || 0,
    missingDedicatedProfileCount: coverage['missing-dedicated-art'] || 0,
    spriteKey: visual.spriteKey,
    sheetId: visual.sheetId,
    legacyImageKey: visual.imageKey,
    legacyRow: visual.row,
    identityStatus: visual.identityStatus,
    fallbackReason: visual.fallbackReason,
    runtimeState: visual.sheetId
      ? runtimeHas(runtimeSheets, visual.sheetId) ? 'loaded' : 'authored-not-wired'
      : visual.legacy ? 'legacy-atlas' : 'missing'
  };
});

const vehicleInventory = (runtimeSheets) => VEHICLES.slice(0, BASE_VEHICLE_COUNT).map((base, chassisIndex) => {
  const profiles = VEHICLES.filter((_, index) => index % BASE_VEHICLE_COUNT === chassisIndex);
  const dedicatedVisual = resolveVehicleVisualProfile(base);
  const resolvedProfiles = profiles.map((profile) => resolveVehicleVisualProfile(profile));
  const exactV55Profiles = resolvedProfiles.filter((profile) => profile?.identityStatus === 'exact').length;
  const familyReuseProfileCount = resolvedProfiles.filter((profile) => profile?.identityStatus === 'authored-family').length;
  const legacyExactProfiles = base.id === V54_EXACT_VEHICLE_BASE_ID ? 1 : 0;
  const exactProfileCount = exactV55Profiles + legacyExactProfiles;
  const missingDedicatedProfileCount = profiles.length - exactProfileCount - familyReuseProfileCount;
  const sheetId = dedicatedVisual?.sheetId || (legacyExactProfiles ? 'vehicle.m577-apc.action' : null);
  return {
    id: base.id,
    name: base.name,
    family: base.family,
    seats: base.seats.length,
    profileCount: profiles.length,
    exactProfileCount,
    familyReuseProfileCount,
    missingDedicatedProfileCount,
    withoutExactBitmapProfileCount: familyReuseProfileCount + missingDedicatedProfileCount,
    sheetId,
    runtimeRender: dedicatedVisual
      ? `bitmap:${dedicatedVisual.sheetId}`
      : legacyExactProfiles
        ? 'bitmap:vehicle.m577-apc.action'
        : base.family === 'ground'
          ? 'wrong-reuse:vehicle.m577-apc.action'
          : `canvas-family-silhouette:${base.family}`,
    runtimeState: !sheetId ? 'missing' : runtimeHas(runtimeSheets, sheetId) ? 'loaded-exact' : 'authored-not-wired'
  };
});

const hubRoomInventory = () => HUB_DECKS.flatMap((deck) => deck.rooms.map((room) => ({
  deckId: deck.id,
  roomId: room.id,
  name: room.name,
  background: room.background,
  parallax: deck.farBackground,
  prop: room.prop,
  sceneScale: room.profile.sceneScale,
  floorRatio: room.profile.floorRatio,
  propCollider: { ...room.profile.propCollider },
  collisionSource: room.collisionSource,
  runtimeState: 'loaded-profiled'
})));

const hubPropInventory = (hubRooms) => HUB_MODULAR_PROP_FILES.map((asset) => {
  const key = stem(asset);
  const roomUses = hubRooms.filter((room) => room.prop === asset).map((room) => room.roomId);
  const globalUses = key === 'bulkhead-door' ? ['inter-room-bulkheads'] : key === 'lift-door' ? ['deck-lifts'] : [];
  const usages = [...roomUses, ...globalUses];
  return { key, asset, usages, reused: usages.length > 1, runtimeState: 'loaded' };
});

const missionPropInventory = () => [
  ['floor-segment', 'floor', '/assets/openai/metroidvania/props/floor-segment.png', 'terrain'],
  ['overhead-catwalk', 'catwalk', '/assets/openai/metroidvania/props/overhead-catwalk.png', 'platform'],
  ['short-ledge', 'ledge', '/assets/openai/metroidvania/props/short-ledge.png', 'platform'],
  ['drop-platform', 'drop', '/assets/openai/metroidvania/props/drop-platform.png', 'platform'],
  ['wall-ladder', 'ladder', '/assets/openai/metroidvania/props/wall-ladder.png', 'traversal'],
  ['maintenance-pipe', 'maintenancePipe', MISSION_STRUCTURAL_PROP_FILES.maintenancePipe, 'ship-architecture-layer'],
  ['vent-entrance', 'vent', '/assets/openai/metroidvania/props/vent-entrance.png', 'shortcut'],
  ['breakable-panel', 'breakable', '/assets/openai/metroidvania/props/breakable-panel.png', 'breakable-and-objective'],
  ['locked-bulkhead', 'lockedDoor', '/assets/openai/metroidvania/props/locked-bulkhead.png', 'closed-door'],
  ['open-bulkhead', 'openDoor', '/assets/openai/metroidvania/props/open-bulkhead.png', 'open-door'],
  ['cargo-cover', 'cover', '/assets/openai/metroidvania/props/cargo-cover.png', 'cover'],
  ['supply-crates', 'crates', '/assets/openai/metroidvania/props/supply-crates.png', 'resource-and-objective'],
  ['ceiling-cables', 'ceilingCables', MISSION_STRUCTURAL_PROP_FILES.ceilingCables, 'ship-ceiling-layer'],
  ['foreground-pipes', 'foregroundPipes', MISSION_STRUCTURAL_PROP_FILES.foregroundPipes, 'ship-foreground-layer'],
  ['warning-lamp', 'lamp', '/assets/openai/metroidvania/props/warning-lamp.png', 'terminal-and-objective'],
  ['acid-floor-hazard', 'acid', '/assets/openai/metroidvania/props/acid-floor-hazard.png', 'acid-hazard'],
  ['electrical-arc-hazard', 'electricalArc', ELECTRICAL_HAZARD_ART_V55.asset, 'electrical-damage-and-stun-hazard']
].map(([key, runtimeKey, asset, usage]) => ({
  key,
  runtimeKey,
  asset,
  usage,
  fileState: 'present',
  loadState: key === 'electrical-arc-hazard' ? 'runtime-contract-v55' : 'loaded'
}));

const missionLayerInventory = () => Object.entries(MISSION_LEVEL_LAYER_FILES_V52).flatMap(([templateId, layers]) =>
  Object.entries(layers).map(([depth, asset]) => ({ templateId, depth, asset, runtimeState: 'loaded-global-layer' }))
);

export function buildAssetRuntimeInventoryV55({
  manifest,
  runtimeSheets = SPRITE_SHEETS,
  auditDate = '2026-08-22'
} = {}) {
  assertSpriteManifestV55(manifest);
  const wiring = inspectRuntimeWiringV55(runtimeSheets);
  const playerSheets = playerInventory(runtimeSheets);
  const npcEntries = npcInventory(runtimeSheets);
  const enemyArchetypes = enemyInventory(runtimeSheets);
  const enemyCoverage = enemyVisualCoverageReport(ENEMIES);
  const vehicleChassis = vehicleInventory(runtimeSheets);
  const v55VehicleCoverage = vehicleVisualCoverageReport(VEHICLES);
  const legacyVehicleExactCount = VEHICLES.some((vehicle) => vehicle.id === V54_EXACT_VEHICLE_BASE_ID) ? 1 : 0;
  const vehicleExactProfileCount = v55VehicleCoverage.exactProfileCount + legacyVehicleExactCount;
  const vehicleFamilyReuseProfileCount = v55VehicleCoverage.familyReuseProfileCount;
  const vehicleMissingDedicatedProfileCount = v55VehicleCoverage.missingDedicatedProfileCount - legacyVehicleExactCount;
  const vehicleWithoutExactBitmapProfileCount = vehicleFamilyReuseProfileCount + vehicleMissingDedicatedProfileCount;
  const hubRooms = hubRoomInventory();
  const hubProps = hubPropInventory(hubRooms);
  const missionProps = missionPropInventory();
  const missionLayers = missionLayerInventory();
  const hangarLayers = [DROPSHIP_HANGAR_ART_V55.overhead, DROPSHIP_HANGAR_ART_V55.foreground].map((layer) => ({
    id: layer.id,
    phase: layer.phase,
    asset: layer.asset,
    sourceCrop: { ...layer.sourceCrop },
    renderBounds: { ...layer.renderBounds },
    collidable: layer.collidable,
    runtimeState: 'runtime-contract-v55'
  }));
  const v55Sheets = manifest.sheets.filter((sheet) => v55IdSet.has(sheet.id));

  const inventory = {
    schemaVersion: 1,
    release: 'v55',
    auditedRuntime: 'v52+v55-dedicated-sprites-and-modular-hangar-art',
    auditDate,
    truthRules: [
      'catalogued is not the same as rendered',
      'loaded is not the same as visually exact',
      'a modifier or fit reusing its base atlas is authored-family, never exact',
      'family reuse and missing dedicated art remain explicit',
      'inventory files are blocked until every v55 sheet is wired in SPRITE_SHEETS',
      'an ImageGen output counts only after a normalized runtime asset exists'
    ],
    runtimeGate: wiring,
    summary: {
      spriteAtlases: manifest.sheets.length,
      spriteCells: manifestCellCount(manifest),
      v55NewAtlases: v55Sheets.length,
      playerSubjects: 1,
      playerSheets: playerSheets.length,
      npcs: npcEntries.length,
      npcMissionSheets: npcEntries.filter((entry) => entry.missionSheetId).length,
      enemyArchetypes: enemyArchetypes.length,
      enemyModifiers: Object.keys(countBy(ENEMIES, (enemy) => enemy.modifier)).length,
      enemyProfiles: ENEMIES.length,
      vehicleChassis: vehicleChassis.length,
      vehicleFits: Object.keys(countBy(VEHICLES, (vehicle) => vehicle.fit)).length,
      vehicleProfiles: VEHICLES.length,
      hubRooms: hubRooms.length,
      hubProps: hubProps.length,
      hubFarLayers: new Set(HUB_DECKS.map((deck) => deck.farBackground)).size,
      hubModularHangarLayers: hangarLayers.length,
      missionProps: missionProps.length,
      missionElectricalHazards: missionProps.filter((prop) => prop.runtimeKey === 'electricalArc').length,
      missionTemplates: Object.keys(MISSION_LEVEL_LAYER_FILES_V52).length,
      missionGlobalLayers: missionLayers.length
    },
    sprites: {
      totalAtlases: manifest.sheets.length,
      totalCells: manifestCellCount(manifest),
      v55: v55Sheets.map((sheet) => ({
        id: sheet.id,
        family: sheet.family,
        subject: sheet.subject,
        normalized: sheet.files.normalized,
        clips: sheet.clips,
        hitbox: sheet.hitbox,
        sourceFacing: sheet.sourceFacing,
        runtimeState: runtimeHas(runtimeSheets, sheet.id) ? 'wired' : 'authored-not-wired'
      }))
    },
    player: {
      sheets: playerSheets,
      remainingMissing: ['melee', 'interaction', 'contextual tool-use variants']
    },
    npcs: {
      entries: npcEntries,
      locomotionSheetCount: npcEntries.filter((entry) => entry.locomotionSheetId).length,
      missionSheetCount: npcEntries.filter((entry) => entry.missionSheetId).length,
      remainingMissionSheetCount: npcEntries.filter((entry) => !entry.missionSheetId).length,
      unknownIdFallback: null
    },
    enemies: {
      modifierProfileCounts: countBy(ENEMIES, (enemy) => enemy.modifier),
      coverage: enemyCoverage,
      exactProfileCount: enemyCoverage.byIdentityStatus.exact || 0,
      familyReuseProfileCount: enemyCoverage.byIdentityStatus['authored-family'] || 0,
      missingDedicatedProfileCount: enemyCoverage.byIdentityStatus['missing-dedicated-art'] || 0,
      withoutExactBitmapProfileCount: (enemyCoverage.byIdentityStatus['authored-family'] || 0)
        + (enemyCoverage.byIdentityStatus['missing-dedicated-art'] || 0),
      modernSheetCount: manifest.sheets.filter((sheet) => sheet.family === 'enemy').length,
      v55DedicatedArchetypeCount: ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V55.length,
      v55ResolvedProfileCount: ENEMY_VISUAL_OVERRIDE_PROFILE_COUNT_V55,
      v55ExactProfileCount: ENEMY_VISUAL_OVERRIDE_EXACT_PROFILE_COUNT_V55,
      v55FamilyReuseProfileCount: ENEMY_VISUAL_OVERRIDE_FAMILY_PROFILE_COUNT_V55,
      archetypes: enemyArchetypes,
      registryEntries: Object.keys(ENEMY_VISUAL_PROFILES).length
    },
    vehicles: {
      fitProfileCounts: countBy(VEHICLES, (vehicle) => vehicle.fit),
      exactProfileCount: vehicleExactProfileCount,
      familyReuseProfileCount: vehicleFamilyReuseProfileCount,
      legacyExactProfileCount: legacyVehicleExactCount,
      missingDedicatedProfileCount: vehicleMissingDedicatedProfileCount,
      withoutExactBitmapProfileCount: vehicleWithoutExactBitmapProfileCount,
      v55DedicatedChassisCount: VEHICLE_VISUAL_CHASSIS_COUNT,
      v55ResolvedProfileCount: v55VehicleCoverage.dedicated,
      v55ExactProfileCount: v55VehicleCoverage.exactProfileCount,
      v55FamilyReuseProfileCount: v55VehicleCoverage.familyReuseProfileCount,
      v55RegistryProfileCount: VEHICLE_VISUAL_PROFILE_COUNT,
      chassis: vehicleChassis,
      remainingMissing: ['dedicated bitmap sheets for 31 chassis', 'fit-specific damage markings', 'entry-exit animation']
    },
    hub: {
      rooms: hubRooms,
      props: hubProps,
      farLayers: HUB_DECKS.map((deck) => ({ deckId: deck.id, asset: deck.farBackground, runtimeState: 'loaded-and-drawn' })),
      dropshipHangar: {
        composition: DROPSHIP_HANGAR_ART_V55.composition,
        allowsMonolith: DROPSHIP_HANGAR_ART_V55.allowsMonolith,
        layers: hangarLayers,
        physicalDropship: {
          id: DROPSHIP_HANGAR_ART_V55.dropship.id,
          asset: DROPSHIP_HANGAR_ART_V55.dropship.asset,
          renderBounds: { ...DROPSHIP_HANGAR_ART_V55.dropship.renderBounds },
          collisionBounds: { ...DROPSHIP_HANGAR_ART_V55.dropship.collisionBounds },
          interactionBounds: { ...DROPSHIP_HANGAR_ART_V55.dropship.interactionBounds },
          runtimeState: 'runtime-contract-v55'
        },
        electricalHazard: {
          id: ELECTRICAL_HAZARD_ART_V55.id,
          asset: ELECTRICAL_HAZARD_ART_V55.asset,
          collisionBounds: { ...ELECTRICAL_HAZARD_ART_V55.collisionBounds },
          damage: ELECTRICAL_HAZARD_ART_V55.damage,
          stunSeconds: ELECTRICAL_HAZARD_ART_V55.stunSeconds,
          runtimeState: 'runtime-contract-v55'
        }
      },
      doorBounds: 'shared-render-and-collision-profile',
      genericTraversalOverlays: 0,
      remainingMissing: ['room-specific overhead and foreground modules for the other hub rooms']
    },
    mission: {
      props: missionProps,
      layers: missionLayers,
      doorBounds: 'shared-render-and-collision-profile',
      invisibleCoverKeys: 0,
      remainingMissing: ['independent layer sets per zone', 'dedicated fire, steam, radiation, flood, vacuum and darkness hazards', 'dedicated resource-drop and archive-terminal sprites']
    },
    evidence: [
      'src/content-core-v50.js',
      'src/enemy-visual-runtime-v53.js',
      'src/enemy-visual-overrides-v55.js',
      'src/npc-mission-runtime-v55.js',
      'src/vehicle-visual-runtime-v55.js',
      'src/sprite-animation-runtime.js',
      'src/hub-art-runtime-v55.js',
      'src/hub-game.js',
      'src/game-v51-runtime.js',
      'src/game-v52-level-runtime.js',
      'assets/openai/sprites/manifest.json'
    ]
  };

  if (inventory.summary.spriteAtlases !== V55_EXPECTED_ATLASES || inventory.summary.spriteCells !== V55_EXPECTED_CELLS) {
    throw new Error('Inventory v55 atlas totals do not match the manifest contract.');
  }
  if (inventory.summary.v55NewAtlases !== V55_NEW_SHEET_IDS.length) throw new Error('Inventory v55 is missing authored sprite atlases.');
  if (inventory.summary.hubModularHangarLayers !== 2) throw new Error('Inventory v55 must contain two independent hangar layers.');
  if (inventory.summary.missionElectricalHazards !== 1) throw new Error('Inventory v55 must contain the electrical hazard.');
  return inventory;
}

const markdownCell = (value) => String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const table = (headers, rows) => [
  `| ${headers.map(markdownCell).join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`)
].join('\n');

export function renderAssetRuntimeInventoryMarkdownV55(inventory) {
  const exactEnemy = inventory.enemies.exactProfileCount;
  const familyEnemy = inventory.enemies.familyReuseProfileCount;
  const missingEnemy = inventory.enemies.missingDedicatedProfileCount;
  const hangar = inventory.hub.dropshipHangar;
  return `# Alien Tantalus Frontier — inventaire assets/runtime v55

Source machine : \`docs/ASSET_RUNTIME_INVENTORY_V55.json\`. Les sorties v55 ne sont écrites que lorsque les 20 nouveaux atlas sont présents dans le registre runtime.

## Synthèse vérifiée

${table(['Domaine', 'Catalogue', 'Couverture réelle v55'], [
  ['Sprite runtime', `${inventory.summary.spriteAtlases} atlas / ${inventory.summary.spriteCells} cellules`, `${inventory.summary.v55NewAtlases} atlas v55 normalisés et branchés`],
  ['Joueur', '1 sujet / 2 plaques', 'locomotion et combat exacts'],
  ['PNJ', `${inventory.summary.npcs} identités`, `${inventory.summary.npcMissionSheets} plaques mission dédiées; ${inventory.npcs.remainingMissionSheetCount} encore sans plaque mission`],
  ['Ennemis', `${inventory.summary.enemyArchetypes} archétypes / ${inventory.summary.enemyProfiles} profils`, `${exactEnemy} exacts; ${familyEnemy} réemplois famille; ${missingEnemy} sans art dédié`],
  ['Véhicules', `${inventory.summary.vehicleChassis} châssis / ${inventory.summary.vehicleProfiles} profils`, `${inventory.vehicles.exactProfileCount} exacts; ${inventory.vehicles.familyReuseProfileCount} réemplois de châssis; ${inventory.vehicles.missingDedicatedProfileCount} sans art de châssis; ${inventory.vehicles.withoutExactBitmapProfileCount} sans bitmap exact`],
  ['Hub', `${inventory.summary.hubRooms} salles`, `${inventory.summary.hubModularHangarLayers} couches hangar indépendantes + dropship physique + hazard électrique`],
  ['Mission', `${inventory.summary.missionProps} props / ${inventory.summary.missionGlobalLayers} couches`, `${inventory.summary.missionElectricalHazards} hazard électrique dédié`]
])}

## 20 atlas v55

${table(['ID', 'Famille', 'Sujet', 'Clipset', 'Facing', 'Runtime'], inventory.sprites.v55.map((sheet) => [
  sheet.id, sheet.family, sheet.subject, sheet.clips, sheet.sourceFacing, sheet.runtimeState
]))}

## PNJ mission

${table(['ID équipage', 'Nom', 'Plaque mission', 'Clips mission', 'État'], inventory.npcs.entries.map((npc) => [
  npc.crewId,
  npc.name,
  npc.missionSheetId || '—',
  npc.missionClips.join(', ') || '—',
  npc.missionRuntimeState
]))}

## Ennemis

Huit archétypes supplémentaires disposent d’une identité bitmap dédiée. Leurs ${inventory.enemies.v55ResolvedProfileCount} profils restent routés vers la bonne plaque, mais seuls ${inventory.enemies.v55ExactProfileCount} profils de base sont exacts; ${inventory.enemies.v55FamilyReuseProfileCount} modifiers sont des réemplois de famille déclarés.

${table(['Archétype', 'Profils', 'Exact / famille / absent', 'Rendu', 'Runtime'], inventory.enemies.archetypes.map((enemy) => [
  enemy.name,
  enemy.profileCount,
  `${enemy.exactProfileCount} / ${enemy.familyReuseProfileCount} / ${enemy.missingDedicatedProfileCount}`,
  enemy.sheetId || `${enemy.legacyImageKey}:row${enemy.legacyRow}`,
  enemy.runtimeState
]))}

## Véhicules

${table(['Châssis', 'Famille', 'Exact / famille / absent', 'Rendu', 'Runtime'], inventory.vehicles.chassis.map((vehicle) => [
  vehicle.name,
  vehicle.family,
  `${vehicle.exactProfileCount} / ${vehicle.familyReuseProfileCount} / ${vehicle.missingDedicatedProfileCount}`,
  vehicle.runtimeRender,
  vehicle.runtimeState
]))}

## Hangar modulaire et hazard électrique

Le hangar interdit l’image monolithique : \`allowsMonolith=${String(hangar.allowsMonolith)}\`.

${table(['Couche', 'Phase', 'Asset', 'Bounds rendu'], hangar.layers.map((layer) => [
  layer.id,
  layer.phase,
  layer.asset,
  `${layer.renderBounds.w}×${layer.renderBounds.h}@${layer.renderBounds.x},${layer.renderBounds.y}`
]))}

- Dropship physique : \`${hangar.physicalDropship.asset}\`, collision et interaction séparées.
- Hazard électrique : \`${hangar.electricalHazard.asset}\`, dégâts ${hangar.electricalHazard.damage}, stun ${hangar.electricalHazard.stunSeconds} s.

## Mission

${table(['Prop', 'Clé runtime', 'Usage', 'Chargement'], inventory.mission.props.map((prop) => [
  prop.key, prop.runtimeKey, prop.usage, prop.loadState
]))}

Dettes restantes déclarées : ${[...inventory.vehicles.remainingMissing, ...inventory.hub.remainingMissing, ...inventory.mission.remainingMissing].join('; ')}.
`;
}

export async function runAssetRuntimeInventoryV55(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const previewOnly = argv.includes('--preview') || argv.includes('--dry-run');
  const manifest = JSON.parse(await readFile(V55_SPRITE_MANIFEST_PATH, 'utf8'));
  const inventory = buildAssetRuntimeInventoryV55({ manifest, runtimeSheets: SPRITE_SHEETS });

  if (previewOnly) {
    console.log(JSON.stringify({
      release: inventory.release,
      runtimeGate: inventory.runtimeGate,
      summary: inventory.summary,
      wroteInventory: false
    }, null, 2));
    return inventory;
  }

  assertRuntimeWiredV55(SPRITE_SHEETS);
  const json = `${JSON.stringify(inventory, null, 2)}\n`;
  const markdown = renderAssetRuntimeInventoryMarkdownV55(inventory);
  const outputs = [
    [V55_INVENTORY_JSON_PATH, json],
    [V55_INVENTORY_MARKDOWN_PATH, markdown]
  ];

  if (checkOnly) {
    for (const [path, expected] of outputs) {
      let actual = '';
      try {
        actual = await readFile(path, 'utf8');
      } catch {}
      if (actual !== expected) throw new Error(`${path} is out of date; run node scripts/build-asset-runtime-inventory-v55.mjs.`);
    }
    console.log('Asset/runtime inventory v55 is synchronized.');
    return inventory;
  }

  for (const [path, content] of outputs) await writeFile(path, content, 'utf8');
  console.log(`Generated v55 inventory: ${inventory.summary.spriteAtlases} atlases / ${inventory.summary.spriteCells} cells.`);
  return inventory;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) {
  runAssetRuntimeInventoryV55().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

// Keep the root contract explicit for callers that need to locate generated outputs.
export { V55_REPO_ROOT };
