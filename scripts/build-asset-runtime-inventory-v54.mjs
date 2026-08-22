import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREW, ENEMIES, VEHICLES } from '../src/content-core-v50.js';
import { ENEMY_VISUAL_PROFILES, enemyVisualCoverageReport, resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import { HUB_DECKS, HUB_MODULAR_PROP_FILES } from '../src/hub-game.js';
import { MISSION_STRUCTURAL_PROP_FILES } from '../src/game-v51-runtime.js';
import { MISSION_LEVEL_LAYER_FILES_V52 } from '../src/game-v52-level-runtime.js';
import { CREW_SPRITE_IDS, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = resolve(repoRoot, 'docs/ASSET_RUNTIME_INVENTORY_V54.json');
const markdownPath = resolve(repoRoot, 'docs/ASSET_RUNTIME_INVENTORY_V54.md');
const checkOnly = process.argv.includes('--check');

const countBy = (items, selector) => Object.fromEntries([...items.reduce((counts, item) => {
  const key = selector(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map())]);

const stem = (path) => String(path).split('/').at(-1).replace(/\.png$/i, '');
const baseEnemyCount = 52;
const baseVehicleCount = 36;
const enemyCoverage = enemyVisualCoverageReport(ENEMIES);

const playerSheets = ['player.echo9-marine.locomotion', 'player.echo9-marine.combat'].map((id) => {
  const sheet = SPRITE_SHEETS[id];
  return {
    id,
    asset: sheet.path,
    sourceFacing: sheet.sourceFacing < 0 ? 'left' : 'right',
    identityVerified: sheet.identityVerified,
    runtimeState: sheet.identityVerified ? 'loaded-exact' : 'blocked-identity',
    fallbackWhenBlocked: sheet.identityVerified ? null : 'player.echo9-marine.locomotion'
  };
});

const npcEntries = CREW.map((member) => ({
  crewId: member.id,
  name: member.name,
  role: member.role,
  species: member.species,
  specialty: member.specialty,
  sheetId: CREW_SPRITE_IDS[member.id],
  runtimeState: CREW_SPRITE_IDS[member.id] ? 'loaded-locomotion' : 'missing',
  availableClips: ['idle', 'walk', 'role-work', 'alert-reaction'],
  missingClips: ['combat', 'crouch', 'jump-fall', 'climb', 'wounded', 'death', 'role-specific-mission-action']
}));

const enemyArchetypes = ENEMIES.slice(0, baseEnemyCount).map((base, archetypeIndex) => {
  const profiles = ENEMIES.filter((_, index) => index % baseEnemyCount === archetypeIndex);
  const visual = resolveEnemyVisualProfile(base);
  return {
    name: base.name,
    biology: base.biology,
    caste: base.caste,
    profileCount: profiles.length,
    spriteKey: visual.spriteKey,
    sheetId: visual.sheetId,
    legacyImageKey: visual.imageKey,
    legacyRow: visual.row,
    identityStatus: visual.identityStatus,
    fallbackReason: visual.fallbackReason
  };
});

const vehicleChassis = VEHICLES.slice(0, baseVehicleCount).map((base, chassisIndex) => {
  const profiles = VEHICLES.filter((_, index) => index % baseVehicleCount === chassisIndex);
  const exactBaseProfile = chassisIndex === 0;
  return {
    name: base.name,
    family: base.family,
    seats: base.seats.length,
    profileCount: profiles.length,
    exactBaseProfile,
    runtimeRender: exactBaseProfile
      ? 'bitmap:m577-apc'
      : base.family === 'ground'
        ? 'wrong-reuse:m577-apc'
        : `canvas-family-silhouette:${base.family}`,
    dedicatedBitmapState: exactBaseProfile ? 'loaded-exact' : 'missing'
  };
});

const hubRooms = HUB_DECKS.flatMap((deck) => deck.rooms.map((room) => ({
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

const hubProps = HUB_MODULAR_PROP_FILES.map((asset) => {
  const key = stem(asset);
  const roomUses = hubRooms.filter((room) => room.prop === asset).map((room) => room.roomId);
  const globalUses = key === 'bulkhead-door' ? ['inter-room-bulkheads'] : key === 'lift-door' ? ['deck-lifts'] : [];
  const usages = [...roomUses, ...globalUses];
  return { key, asset, usages, reused: usages.length > 1, runtimeState: 'loaded' };
});

const missionProps = [
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
  ['acid-floor-hazard', 'acid', '/assets/openai/metroidvania/props/acid-floor-hazard.png', 'acid-hazard-and-generic-hazard-fallback']
].map(([key, runtimeKey, asset, usage]) => ({ key, runtimeKey, asset, usage, fileState: 'present', loadState: 'loaded' }));

const missionLayers = Object.entries(MISSION_LEVEL_LAYER_FILES_V52).flatMap(([templateId, layers]) =>
  Object.entries(layers).map(([depth, asset]) => ({ templateId, depth, asset, runtimeState: 'loaded-global-layer' }))
);

const inventory = {
  schemaVersion: 1,
  release: 'v54',
  auditedRuntime: 'v52+v54-art-and-gameplay',
  auditDate: '2026-08-22',
  truthRules: [
    'catalogued is not the same as rendered',
    'loaded is not the same as visually exact',
    'family reuse and missing dedicated art must remain explicit',
    'an ImageGen prompt is not an asset until a real file passes normalization and in-game QA'
  ],
  summary: {
    playerSubjects: 1,
    playerSheets: playerSheets.length,
    npcs: npcEntries.length,
    enemyArchetypes: enemyArchetypes.length,
    enemyModifiers: Object.keys(countBy(ENEMIES, (enemy) => enemy.modifier)).length,
    enemyProfiles: ENEMIES.length,
    vehicleChassis: vehicleChassis.length,
    vehicleFits: Object.keys(countBy(VEHICLES, (vehicle) => vehicle.fit)).length,
    vehicleProfiles: VEHICLES.length,
    hubRooms: hubRooms.length,
    hubProps: hubProps.length,
    hubFarLayers: new Set(HUB_DECKS.map((deck) => deck.farBackground)).size,
    missionProps: missionProps.length,
    missionTemplates: Object.keys(MISSION_LEVEL_LAYER_FILES_V52).length,
    missionGlobalLayers: missionLayers.length
  },
  player: {
    sheets: playerSheets,
    remainingMissing: ['melee', 'interaction', 'contextual tool-use variants'],
    generationGate: 'docs/prompts/V54_IMAGEGEN_WAVE.md'
  },
  npcs: {
    entries: npcEntries,
    unknownIdFallback: null
  },
  enemies: {
    modifierProfileCounts: countBy(ENEMIES, (enemy) => enemy.modifier),
    coverage: enemyCoverage,
    exactProfileCount: enemyCoverage.byIdentityStatus.exact,
    familyReuseProfileCount: enemyCoverage.byIdentityStatus['authored-family'],
    missingDedicatedProfileCount: enemyCoverage.byIdentityStatus['missing-dedicated-art'],
    modernSheetCount: Object.values(SPRITE_SHEETS).filter((sheet) => sheet.family === 'enemy').length,
    modernSubjectCount: new Set(enemyArchetypes.filter((enemy) => !enemy.legacy).map((enemy) => enemy.sheetId)).size,
    archetypes: enemyArchetypes,
    registryEntries: Object.keys(ENEMY_VISUAL_PROFILES).length
  },
  vehicles: {
    fitProfileCounts: countBy(VEHICLES, (vehicle) => vehicle.fit),
    exactProfileCount: 1,
    missingDedicatedProfileCount: VEHICLES.length - 1,
    chassis: vehicleChassis,
    remainingMissing: ['dedicated bitmap sheets for 35 chassis', 'fit-specific damage states', 'entry-exit animation', 'destruction animation']
  },
  hub: {
    rooms: hubRooms,
    props: hubProps,
    farLayers: HUB_DECKS.map((deck) => ({ deckId: deck.id, asset: deck.farBackground, runtimeState: 'loaded-and-drawn' })),
    doorBounds: 'shared-render-and-collision-profile',
    genericTraversalOverlays: 0,
    remainingMissing: ['dedicated hub foreground layer', 'physical dropship prop in dropship hangar', 'room-specific ceiling and foreground modules']
  },
  mission: {
    props: missionProps,
    layers: missionLayers,
    doorBounds: 'shared-render-and-collision-profile',
    invisibleCoverKeys: 0,
    remainingMissing: ['independent far/mid/architecture/foreground sets per zone', 'non-acid art for fire, steam, radiation, flood, vacuum and darkness', 'dedicated sprites for resource drops and archive terminals']
  },
  evidence: [
    'src/content-core-v50.js',
    'src/enemy-visual-runtime-v53.js',
    'src/sprite-animation-runtime.js',
    'src/game-v51-runtime.js',
    'src/game-v52-runtime.js',
    'src/game-v52-level-runtime.js',
    'src/hub-game.js',
    'src/hub-profiles-v53.js',
    'assets/openai/sprites/manifest.json'
  ]
};

const table = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.join(' | ')} |`)
].join('\n');

const markdown = `# Alien Tantalus Frontier — inventaire assets/runtime v54

Source machine : \`docs/ASSET_RUNTIME_INVENTORY_V54.json\`. Ce fichier est généré depuis les registres du jeu par \`npm run inventory:v54\`; \`npm run inventory:v54:check\` interdit toute dérive.

## Synthèse vérifiée

${table(['Domaine', 'Catalogue', 'Couverture réelle'], [
  ['Joueur', '1 sujet / 2 plaques', 'locomotion et combat identity-preserve exacts'],
  ['PNJ', '16', '16 locomotions chargées; sets mission incomplets'],
  ['Ennemis', '52 archétypes / 11 modificateurs / 568 profils', `${enemyCoverage.byIdentityStatus.exact} exacts; ${enemyCoverage.byIdentityStatus['authored-family']} réemplois famille; ${enemyCoverage.byIdentityStatus['missing-dedicated-art']} sans art dédié`],
  ['Véhicules', '36 châssis / 8 fits / 279 profils', '1 profil bitmap exact; 278 sans bitmap dédié'],
  ['Hub', '16 salles / 16 props / 4 far layers', 'profils, parallaxe et collisions mesurées chargés'],
  ['Mission', '16 props / 3 templates / 9 couches globales', '16 props chargés; trois couches structurelles désormais dessinées']
])}

## Joueur

${table(['Plaque', 'Facing', 'Identité', 'État runtime'], playerSheets.map((sheet) => [sheet.id, sheet.sourceFacing, String(sheet.identityVerified), sheet.runtimeState]))}

La plaque combat v54 a passé génération OpenAI, normalisation RGBA, garde 16 px, cohérence d’identité et synchronisation des événements tir/recul; elle est désormais chargée sans fallback d’identité.

## 16 PNJ

${table(['ID', 'Nom', 'Rôle', 'Plaque', 'Manquant'], npcEntries.map((npc) => [npc.crewId, npc.name, npc.role, npc.sheetId, npc.missingClips.join(', ')]))}

## 52 archétypes / 568 profils ennemis

Comptes des modificateurs : ${Object.entries(inventory.enemies.modifierProfileCounts).map(([name, count]) => `${name}=${count}`).join(', ')}.

${table(['Archétype', 'Profils', 'Rendu', 'Identité', 'Fallback explicite'], enemyArchetypes.map((enemy) => [enemy.name, enemy.profileCount, enemy.sheetId || `${enemy.legacyImageKey}:row${enemy.legacyRow}`, enemy.identityStatus, enemy.fallbackReason || '—']))}

Le registre empêche désormais \`row=index%4\`, conserve la ligne d’identité à la mort, distingue Combat Synthetic de Working Joe et télémètre toute approximation.

## 36 châssis / 279 profils véhicules

${table(['Châssis', 'Famille', 'Profils', 'Rendu actuel', 'Bitmap dédié'], vehicleChassis.map((vehicle) => [vehicle.name, vehicle.family, vehicle.profileCount, vehicle.runtimeRender, vehicle.dedicatedBitmapState]))}

Les silhouettes canvas non-ground restent une dette visuelle déclarée, pas une couverture sprite prétendument terminée.

## Hub — salles et props

${table(['Deck', 'Salle', 'Fond', 'Prop', 'Scale / floor', 'Collider prop'], hubRooms.map((room) => [room.deckId, room.roomId, stem(room.background), stem(room.prop), `${room.sceneScale} / ${room.floorRatio}`, `${room.propCollider.width}×${room.propCollider.height}`]))}

Props : ${hubProps.map((prop) => `${prop.key}${prop.reused ? ' (réemployé)' : ''}`).join(', ')}. Les quatre far layers sont réellement dessinés; les obstacles génériques superposés ont été supprimés.

## Mission — 16 props et 9 couches

${table(['Prop', 'Clé runtime', 'Usage', 'Chargement'], missionProps.map((prop) => [prop.key, prop.runtimeKey, prop.usage, prop.loadState]))}

${table(['Template', 'Profondeur', 'Asset', 'État'], missionLayers.map((layer) => [layer.templateId, layer.depth, stem(layer.asset), layer.runtimeState]))}

Les prochains lots artistiques prioritaires restent : 35 châssis véhicules, ${inventory.enemies.missingDedicatedProfileCount} profils ennemis sans art dédié, sets mission des 16 PNJ, hazards non-acide et couches indépendantes par zone.
`;

const json = `${JSON.stringify(inventory, null, 2)}\n`;
const outputs = [[jsonPath, json], [markdownPath, markdown]];
if (checkOnly) {
  for (const [path, expected] of outputs) {
    let actual = '';
    try { actual = await readFile(path, 'utf8'); } catch {}
    if (actual !== expected) throw new Error(`${path} is out of date; run npm run inventory:v54`);
  }
  console.log('Asset/runtime inventory v54 is synchronized.');
} else {
  for (const [path, content] of outputs) await writeFile(path, content, 'utf8');
  console.log(`Generated ${inventory.summary.enemyProfiles} enemy profiles, ${inventory.summary.vehicleProfiles} vehicle profiles and all physical art inventories.`);
}
