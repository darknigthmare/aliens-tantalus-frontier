// User-provided cutouts are admitted individually. A file name, archive folder
// or biological family never grants a combat identity, animation or canon claim.
const BIOLOGIES = new Set(['xenomorph', 'pathogen', 'hybrid', 'human', 'synthetic', 'engineer', 'fauna']);
const ENCOUNTER_GROUPS = new Set(['nostromo', 'fiorina', 'acheron', 'engineer', 'avp2', 'avp2010',
  'colonial', 'fireteam', 'pathogen', 'frontierPathogen', 'crossover', 'engineered']);
const GROUPS = Object.freeze({ xenomorph: 'Xenomorphes', pathogen: 'Pathogen', human: 'Humains',
  synthetic: 'Synthétiques', engineer: "Mala'kak", hybrid: 'Hybrides', fauna: 'Faune' });
const positive = value => Number.isFinite(value) && value > 0;
const text = value => typeof value === 'string' && value.trim() === value && value.length > 0;
const publicLabel = value => text(value) && !/(?:https?:\/\/|[a-z]:[\\/]|plugin:\/\/|(?:drive|docs)\.google\.com|chatgpt\.com)/i.test(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

/** Presentation geometry and authored 2D combat tuning are separate contracts.
 * This factory accepts a reviewed transparent, terrestrial single-pose image;
 * an atlas, civilian portrait or documentary concept cannot pass as a fighter. */
export function createEnemyDriveImportV123({ asset, identity, tuning } = {}) {
  const fail = reason => { throw new Error(`Invalid V123 Drive enemy admission: ${reason}`); };
  if (!asset || !identity || !tuning) fail('missing contract');
  const slug = asset.slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')
    || asset.path !== `/assets/user/drive-v123/enemies/${slug}.png`
    || !/^[a-f0-9]{64}$/.test(asset.sha256 || '')) fail('asset identity');
  if (asset.reviewStatus !== 'accepted-static-adaptation' || asset.alphaVerified !== true
    || asset.geometryReviewed !== true || asset.nativeTransparent !== true
    || asset.frameCount !== 1 || asset.clipped === true) fail('unreviewed or non-static image');
  const bounds = asset.alphaBounds, pivot = asset.pivot;
  if (![asset.sourceWidth, asset.sourceHeight].every(n => Number.isInteger(n) && n > 0)
    || !Array.isArray(bounds) || bounds.length !== 4 || !bounds.every(Number.isInteger)
    || !(bounds[0] >= 0 && bounds[1] >= 0 && bounds[2] > bounds[0] && bounds[3] > bounds[1]
      && bounds[2] <= asset.sourceWidth && bounds[3] <= asset.sourceHeight)
    || !pivot || ![pivot.x, pivot.y].every(n => Number.isFinite(n) && n >= 0 && n <= 1)
    || Math.abs(pivot.y * asset.sourceHeight - bounds[3]) > .001
    || ![-1, 1].includes(asset.sourceFacing)) fail('measured geometry');
  if (identity.enemyConfirmed !== true || identity.identityReviewed !== true
    || identity.kind !== 'organism' || !BIOLOGIES.has(identity.biology)
    || ![identity.name, identity.lineage, identity.faction, identity.work].every(publicLabel)
    || !/^drive-v123-[a-z0-9-]+$/.test(identity.sourceReferenceId || '')) fail('unconfirmed combat identity');
  if (['human', 'engineer'].includes(identity.biology) && identity.stage !== 'adult'
    || identity.biology === 'synthetic' && identity.stage !== 'manufactured-unit'
    || !text(identity.stage) || !text(identity.caste)) fail('life stage');
  if (identity.mechanical === true && (identity.biology !== 'synthetic'
    || !/combat.?automaton/i.test(identity.lineage))) fail('automaton classification');
  if (identity.alteredOf != null && !/^(?:enemy-\d{3}-[a-z0-9-]+|castes-[a-z0-9_-]+|pose-v\d+-[a-z0-9-]+)$/.test(identity.alteredOf)) fail('altered identity');
  if (!['melee', 'ranged', 'idle'].includes(tuning.combatRole)
    || tuning.combatRole === 'ranged' && !text(tuning.combatWeapon)
    || ![tuning.targetOpaqueHeight, tuning.bodyWidth, tuning.bodyHeight, tuning.health].every(positive)
    || ![tuning.damage, tuning.speed, tuning.armor, tuning.acid].every(n => Number.isFinite(n) && n >= 0)
    || !Number.isInteger(tuning.cost) || tuning.cost < 1
    || tuning.locomotion !== 'ground' || typeof tuning.automaticEncounter !== 'boolean'
    || typeof tuning.arenaEligible !== 'boolean'
    || tuning.automaticEncounter && !ENCOUNTER_GROUPS.has(tuning.encounterGroup)) fail('explicit simulation tuning');
  const rangedBehavior = tuning.combatRole === 'ranged' ? tuning.rangedBehavior || 'shooter' : 'melee';
  if (!['melee', 'shooter', 'spitter'].includes(rangedBehavior)
    || rangedBehavior === 'spitter' && !['xenomorph', 'pathogen'].includes(identity.biology)
    || ['human', 'synthetic', 'engineer'].includes(identity.biology) && tuning.acid !== 0) fail('biological damage contract');
  if (tuning.arenaEligible && (['egg', 'larval', 'juvenile', 'parasite'].includes(identity.stage)
    || ['egg', 'juvenile', 'parasite'].includes(identity.caste) || tuning.combatRole === 'idle')) fail('arena stage');
  const id = `pose-v123-drive-${slug}`;
  const scale = tuning.targetOpaqueHeight / (bounds[3] - bounds[1]);
  const alteredOf = identity.alteredOf || null;
  return freeze({
    id, profileId: id, basename: slug, filename: `${slug}.png`,
    name: alteredOf && !/Altered$/.test(identity.name) ? `${identity.name} — Altered` : identity.name,
    family: 'enemy', group: identity.mechanical === true ? 'Automatons' : GROUPS[identity.biology],
    biology: identity.biology, faction: identity.faction, lineage: identity.lineage,
    stage: identity.stage, kind: 'organism', caste: identity.caste, work: identity.work, sourceWork: identity.work,
    mechanical: identity.mechanical === true, sourceReferenceId: identity.sourceReferenceId,
    alteredOf, legacyCounterpartId: alteredOf,
    relationship: alteredOf ? 'user-sprite-altered' : 'user-sprite-distinct',
    path: asset.path, imageKey: `user-drive-v123:${slug}`, sha256: asset.sha256,
    sourceWidth: asset.sourceWidth, sourceHeight: asset.sourceHeight,
    alphaBounds: [...bounds], alphaBoundsThreshold: asset.alphaBoundsThreshold || 8,
    pivot: { ...pivot }, sourceFacing: asset.sourceFacing,
    renderWidth: asset.sourceWidth * scale, renderHeight: asset.sourceHeight * scale,
    targetOpaqueHeight: tuning.targetOpaqueHeight, bodyWidth: tuning.bodyWidth, bodyHeight: tuning.bodyHeight,
    health: tuning.health, damage: tuning.damage, speed: tuning.speed, armor: tuning.armor, cost: tuning.cost,
    combatRole: tuning.combatRole, rangedBehavior,
    combatWeapon: tuning.combatWeapon || null, acid: tuning.acid,
    locomotion: 'ground', groundContact: true, arenaEligible: tuning.arenaEligible,
    bioforgeEligible: true, automaticEncounter: tuning.automaticEncounter,
    encounterGroup: tuning.encounterGroup || null, encounterWorldIds: [], states: [], referenceUrls: [],
    reviewStatus: 'accepted-static-adaptation', visualRevision: 123,
    visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
    identityStatus: 'user-provided-individually-reviewed-sprite', identityVerified: false, canonExact: false,
    referenceStatus: 'user-provided-project-adaptation', physicalSize: null,
    provenance: 'user-provided-imported-native-cutout', sourceProvenance: 'user-provided',
    geometryStatus: 'native-alpha-measured-project-tuning',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    specializedBehaviorStatus: 'explicit-project-combat-tuning',
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
    referenceNote: 'Sprite utilisateur importé avec ses pixels natifs et son alpha mesuré. Version originale et identité précédente conservées. Pose fixe ; taille, collisions et statistiques de simulation adaptées au projet. Aucune animation complète ni fidélité canonique 1:1 certifiée.'
  });
}


// Individually matched against the preserved V122 profiles and visually reviewed.
// Only these 32 exact native PNGs are admitted; no archive/filename wildcard.
export const ENEMY_DRIVE_ADMISSIONS_V123 = freeze([
  {
    "asset": {
      "slug": "acm-boiler",
      "path": "/assets/user/drive-v123/enemies/acm-boiler.png",
      "sha256": "aa46ca7430e0a61d8387217b07393609e82e36f52eea48dd2c5278bf20af8109",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        63,
        16,
        1377,
        999
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6740625000000001,
        "y": 0.9755859375
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Boiler",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "explosive",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Aliens: Colonial Marines (2013)",
      "sourceReferenceId": "drive-v123-acm-boiler",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_acm_boiler"
    },
    "tuning": {
      "targetOpaqueHeight": 132,
      "bodyWidth": 62,
      "bodyHeight": 92,
      "cost": 2,
      "health": 95,
      "damage": 18,
      "speed": 0.6,
      "armor": 2,
      "acid": 38,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "acm-crusher",
      "path": "/assets/user/drive-v123/enemies/acm-crusher.png",
      "sha256": "7c4ec54415712f6ff0a03cda10d39c04b5114ae4fdf75f52fb5d46d2fb21db25",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        30,
        139,
        1507,
        921
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6349479166666666,
        "y": 0.8994140625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Crusher",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "siege",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Aliens: Colonial Marines (2013)",
      "sourceReferenceId": "drive-v123-acm-crusher",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_acm_crusher"
    },
    "tuning": {
      "targetOpaqueHeight": 152,
      "bodyWidth": 152,
      "bodyHeight": 102,
      "cost": 5,
      "health": 340,
      "damage": 28,
      "speed": 0.8,
      "armor": 26,
      "acid": 33,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "afe-burster",
      "path": "/assets/user/drive-v123/enemies/afe-burster.png",
      "sha256": "35387c3dd2b2f1ca1cc1e4d68fc2703b55c9fe8d4a5d50e621ecfec351a3f8bd",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        34,
        77,
        1496,
        956
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6313020833333334,
        "y": 0.93359375
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Burster",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "explosive",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Aliens: Fireteam Elite (2021)",
      "sourceReferenceId": "drive-v123-afe-burster",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_afe_burster"
    },
    "tuning": {
      "targetOpaqueHeight": 88,
      "bodyWidth": 76,
      "bodyHeight": 58,
      "cost": 2,
      "health": 105,
      "damage": 20,
      "speed": 1.5,
      "armor": 3,
      "acid": 40,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "afe-prowler",
      "path": "/assets/user/drive-v123/enemies/afe-prowler.png",
      "sha256": "ec7d6be2ecdbf0b02a6b6148ead52338f483b8a8813d7cf7b2cea6f07f6d2d1f",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        36,
        35,
        1514,
        1000
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6681380208333335,
        "y": 0.9765625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Prowler",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "ambush",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Aliens: Fireteam Elite (2021)",
      "sourceReferenceId": "drive-v123-afe-prowler",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_afe_prowler"
    },
    "tuning": {
      "targetOpaqueHeight": 88,
      "bodyWidth": 84,
      "bodyHeight": 58,
      "cost": 3,
      "health": 130,
      "damage": 19,
      "speed": 1.5,
      "armor": 7,
      "acid": 39,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "afe-runner",
      "path": "/assets/user/drive-v123/enemies/afe-runner.png",
      "sha256": "c361545e0844989ed704d29b9549cbc3c28fc95fe847c65226777841c695ddfd",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        55,
        65,
        1514,
        970
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6247265625,
        "y": 0.947265625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Runner",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "runner",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Aliens: Fireteam Elite (2021)",
      "sourceReferenceId": "drive-v123-afe-runner",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "enemy-006-runner"
    },
    "tuning": {
      "targetOpaqueHeight": 82,
      "bodyWidth": 82,
      "bodyHeight": 58,
      "cost": 2,
      "health": 115,
      "damage": 15,
      "speed": 1.7,
      "armor": 5,
      "acid": 30,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "afe-spitter",
      "path": "/assets/user/drive-v123/enemies/afe-spitter.png",
      "sha256": "74b67a559ce5f6fb7ed7a3ee4ffdcb31163027480ed0ca3cbad188a85355ddca",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        40,
        35,
        1496,
        992
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6327083333333333,
        "y": 0.96875
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Spitter",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "ranged",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Aliens: Fireteam Elite (2021)",
      "sourceReferenceId": "drive-v123-afe-spitter",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "enemy-010-spitter"
    },
    "tuning": {
      "targetOpaqueHeight": 144,
      "bodyWidth": 62,
      "bodyHeight": 98,
      "cost": 3,
      "health": 145,
      "damage": 18,
      "speed": 0.9,
      "armor": 8,
      "acid": 34,
      "combatRole": "ranged",
      "rangedBehavior": "spitter",
      "combatWeapon": "acid-spit-project-adaptation",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "comic-rogue-king",
      "path": "/assets/user/drive-v123/enemies/comic-rogue-king.png",
      "sha256": "2a68e0b0a65555a137ae813ee143cb7aa11301211e9bf91a5f7c69e0e68d7744",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        11,
        6,
        1518,
        1018
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.60564453125,
        "y": 0.994140625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Rogue — King",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "royal",
      "lineage": "Rogue",
      "faction": "Hive",
      "work": "Aliens: Rogue",
      "sourceReferenceId": "drive-v123-comic-rogue-king",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v106-import-xeno-kingrogue"
    },
    "tuning": {
      "targetOpaqueHeight": 198,
      "bodyWidth": 80,
      "bodyHeight": 166,
      "cost": 6,
      "health": 350,
      "damage": 28,
      "speed": 0.7,
      "armor": 24,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "creature-alien3-runner",
      "path": "/assets/user/drive-v123/enemies/creature-alien3-runner.png",
      "sha256": "5b98514567e4e9d2ed3bdd6b5182634907d2ef0e2c1cd2548d61fa5c1a75b3c6",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        28,
        162,
        1504,
        877
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5851822916666666,
        "y": 0.8564453125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Runner — Dog Alien",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "runner",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Alien 3 (1992)",
      "sourceReferenceId": "drive-v123-creature-alien3-runner",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_runner_alien3_1992"
    },
    "tuning": {
      "targetOpaqueHeight": 82,
      "bodyWidth": 82,
      "bodyHeight": 58,
      "cost": 2,
      "health": 115,
      "damage": 15,
      "speed": 1.7,
      "armor": 5,
      "acid": 30,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-aliens-queen-mobile",
      "path": "/assets/user/drive-v123/enemies/creature-aliens-queen-mobile.png",
      "sha256": "08a4647601a947d94a09b6723363ececdac41a1a4411119a2fc83e02a8996568",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        68,
        17,
        1446,
        1013
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.672265625,
        "y": 0.9892578125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Reine mobile",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "royal",
      "lineage": "Xenomorph royal",
      "faction": "Hive",
      "work": "Aliens (1986)",
      "sourceReferenceId": "drive-v123-creature-aliens-queen-mobile",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_queen_aliens_1986"
    },
    "tuning": {
      "targetOpaqueHeight": 298,
      "bodyWidth": 142,
      "bodyHeight": 258,
      "cost": 6,
      "health": 520,
      "damage": 34,
      "speed": 0.8,
      "armor": 24,
      "acid": 32,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-lifecycle-chestburster-1979",
      "path": "/assets/user/drive-v123/enemies/creature-lifecycle-chestburster-1979.png",
      "sha256": "e9007d7a6ddf9936d5ff3a40a03b7b379b046203a1cf04e17b0e2376f9e2f039",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        37,
        147,
        1501,
        877
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6817447916666666,
        "y": 0.8564453125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Chestburster",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "larval",
      "caste": "juvenile",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Alien (1979)",
      "sourceReferenceId": "drive-v123-creature-lifecycle-chestburster-1979",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_chestburster_alien_1979"
    },
    "tuning": {
      "targetOpaqueHeight": 22,
      "bodyWidth": 32,
      "bodyHeight": 22,
      "cost": 1,
      "health": 35,
      "damage": 6,
      "speed": 1.7,
      "armor": 0,
      "acid": 27,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": false,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-lifecycle-egg-closed",
      "path": "/assets/user/drive-v123/enemies/creature-lifecycle-egg-closed.png",
      "sha256": "8148b0653b029fdd2b212f2e5143b401a11369ee2f2f3812ddcc7aaf09967ccf",
      "sourceWidth": 1287,
      "sourceHeight": 1222,
      "alphaBounds": [
        263,
        93,
        1041,
        1143
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5066045066045066,
        "y": 0.9353518821603928
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Œuf — fermé",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "egg",
      "caste": "egg",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Alien (1979)",
      "sourceReferenceId": "drive-v123-creature-lifecycle-egg-closed",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_ovomorphe_aliens_1986"
    },
    "tuning": {
      "targetOpaqueHeight": 56.00000000000001,
      "bodyWidth": 48,
      "bodyHeight": 80,
      "cost": 1,
      "health": 90,
      "damage": 0,
      "speed": 0,
      "armor": 8,
      "acid": 25,
      "combatRole": "idle",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": false,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-lifecycle-egg-open",
      "path": "/assets/user/drive-v123/enemies/creature-lifecycle-egg-open.png",
      "sha256": "0b3bf9e4f4e3b0a37e84e5aba6b6a406ebc74b24474dbb616c7bf0fce2fdbc81",
      "sourceWidth": 1286,
      "sourceHeight": 1223,
      "alphaBounds": [
        213,
        93,
        1088,
        1169
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5058320373250389,
        "y": 0.955846279640229
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Œuf — ouvert",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "egg",
      "caste": "egg",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Alien (1979)",
      "sourceReferenceId": "drive-v123-creature-lifecycle-egg-open",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_ovomorphe_aliens_1986"
    },
    "tuning": {
      "targetOpaqueHeight": 56.00000000000001,
      "bodyWidth": 48,
      "bodyHeight": 80,
      "cost": 1,
      "health": 90,
      "damage": 0,
      "speed": 0,
      "armor": 8,
      "acid": 25,
      "combatRole": "idle",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": false,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-lifecycle-facehugger-1979",
      "path": "/assets/user/drive-v123/enemies/creature-lifecycle-facehugger-1979.png",
      "sha256": "b325260b9f5d0304b941eaa08c42a8479b8ff17ae80ba927c9e11bc362186ad7",
      "sourceWidth": 1774,
      "sourceHeight": 887,
      "alphaBounds": [
        40,
        209,
        1741,
        790
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6553889515219843,
        "y": 0.8906426155580609
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Facehugger",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "parasite",
      "caste": "parasite",
      "lineage": "Xenomorph",
      "faction": "Hive",
      "work": "Alien (1979)",
      "sourceReferenceId": "drive-v123-creature-lifecycle-facehugger-1979",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_facehugger_alien_1979"
    },
    "tuning": {
      "targetOpaqueHeight": 20,
      "bodyWidth": 30,
      "bodyHeight": 16,
      "cost": 1,
      "health": 30,
      "damage": 7,
      "speed": 1.8,
      "armor": 0,
      "acid": 26,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": false,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-lifecycle-queen-chestburster",
      "path": "/assets/user/drive-v123/enemies/creature-lifecycle-queen-chestburster.png",
      "sha256": "7c17e676b4fc1638b22689d48e2f803594dc2e2036fa275e262c8b6f6d958b78",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        44,
        48,
        1513,
        956
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6407291666666667,
        "y": 0.93359375
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Chestburster royal",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "larval",
      "caste": "juvenile",
      "lineage": "Xenomorph royal",
      "faction": "Hive",
      "work": "Alien 3 (1992)",
      "sourceReferenceId": "drive-v123-creature-lifecycle-queen-chestburster",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-film_queen_chestburster_alien3_1992"
    },
    "tuning": {
      "targetOpaqueHeight": 28.000000000000004,
      "bodyWidth": 38,
      "bodyHeight": 28,
      "cost": 1,
      "health": 45,
      "damage": 8,
      "speed": 1.4,
      "armor": 2,
      "acid": 27,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": false,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-prometheus-engineer-biosuit",
      "path": "/assets/user/drive-v123/enemies/creature-prometheus-engineer-biosuit.png",
      "sha256": "27e88b31e5a6089e8fc3f29030e60679adcd9f212a7c515b2baf1842f040c8b9",
      "sourceWidth": 1024,
      "sourceHeight": 1536,
      "alphaBounds": [
        374,
        11,
        654,
        1480
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.501953125,
        "y": 0.9635416666666666
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Engineer — Combinaison biologique",
      "biology": "engineer",
      "kind": "organism",
      "stage": "adult",
      "caste": "engineer",
      "lineage": "Engineer",
      "faction": "Engineers",
      "work": "Prometheus (2012)",
      "sourceReferenceId": "drive-v123-creature-prometheus-engineer-biosuit",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v106-import-engineer-suit-open"
    },
    "tuning": {
      "targetOpaqueHeight": 170,
      "bodyWidth": 50,
      "bodyHeight": 154,
      "cost": 3,
      "health": 215,
      "damage": 20,
      "speed": 0.85,
      "armor": 14,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "engineer"
    }
  },
  {
    "asset": {
      "slug": "creature-prometheus-hammerpede",
      "path": "/assets/user/drive-v123/enemies/creature-prometheus-hammerpede.png",
      "sha256": "c481d557caf1055a30025deff331d804deebc18155101429eae7c884e7235504",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        18,
        104,
        1513,
        908
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5762369791666666,
        "y": 0.88671875
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Hammerpede",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "parasite",
      "lineage": "Hammerpede",
      "faction": "Pathogen",
      "work": "Prometheus (2012)",
      "sourceReferenceId": "drive-v123-creature-prometheus-hammerpede",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v96-film-hammerpede"
    },
    "tuning": {
      "targetOpaqueHeight": 92.3828125,
      "bodyWidth": 34,
      "bodyHeight": 64,
      "cost": 2,
      "health": 58,
      "damage": 13,
      "speed": 1.35,
      "armor": 2,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": false,
      "encounterGroup": "engineer"
    }
  },
  {
    "asset": {
      "slug": "creature-resurrection-newborn-v2",
      "path": "/assets/user/drive-v123/enemies/creature-resurrection-newborn-v2.png",
      "sha256": "60350fb7a6097a4986dea51b2b4211d6cddac065dc4df8753e22af3a244eb3fd",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        629,
        20,
        908,
        996
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5003255208333334,
        "y": 0.97265625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Newborn",
      "biology": "hybrid",
      "kind": "organism",
      "stage": "adult",
      "caste": "apex",
      "lineage": "Newborn",
      "faction": "independent",
      "work": "Alien Resurrection (1997)",
      "sourceReferenceId": "drive-v123-creature-resurrection-newborn-v2",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "enemy-569-newborn"
    },
    "tuning": {
      "targetOpaqueHeight": 159.5625,
      "bodyWidth": 65.625,
      "bodyHeight": 155.25,
      "cost": 5,
      "health": 420,
      "damage": 38,
      "speed": 0.94,
      "armor": 18,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "creature-romulus-offspring",
      "path": "/assets/user/drive-v123/enemies/creature-romulus-offspring.png",
      "sha256": "56e0a9200983dff0591fdd3dd9bce0d48d70c7b6f69f9720166ed21186e60eaf",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        242,
        14,
        1109,
        1011
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5244466145833334,
        "y": 0.9873046875
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Offspring",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "apex",
      "lineage": "Offspring",
      "faction": "independent",
      "work": "Alien: Romulus (2024)",
      "sourceReferenceId": "drive-v123-creature-romulus-offspring",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "enemy-570-offspring"
    },
    "tuning": {
      "targetOpaqueHeight": 164.765625,
      "bodyWidth": 56.25,
      "bodyHeight": 166.25,
      "cost": 5,
      "health": 390,
      "damage": 36,
      "speed": 1.15,
      "armor": 12,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "fte-pathogen-brute-profile-v13",
      "path": "/assets/user/drive-v123/enemies/fte-pathogen-brute-profile-v13.png",
      "sha256": "88ecdfbbbf8cf6e64aa210a646174e1989f675794561b5c0198df857733e992a",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        51,
        24,
        1485,
        983
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6400390625,
        "y": 0.9599609375
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Pathogen Brute",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "assault",
      "lineage": "Pathogen Brute",
      "faction": "Pathogen",
      "work": "Aliens: Fireteam Elite — Pathogen (2022)",
      "sourceReferenceId": "drive-v123-fte-pathogen-brute-profile-v13",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_pathogen_brute"
    },
    "tuning": {
      "targetOpaqueHeight": 166,
      "bodyWidth": 108,
      "bodyHeight": 118,
      "cost": 4,
      "health": 300,
      "damage": 28,
      "speed": 0.8,
      "armor": 20,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "fte-pathogen-popper-profile-v13",
      "path": "/assets/user/drive-v123/enemies/fte-pathogen-popper-profile-v13.png",
      "sha256": "2814abceca3840aa8a9e57595369e29a10864350c40a6e0d65c4fa0e24cd9bea",
      "sourceWidth": 1585,
      "sourceHeight": 992,
      "alphaBounds": [
        151,
        76,
        1455,
        931
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5066246056782334,
        "y": 0.938508064516129
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Pathogen Popper",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "explosive",
      "lineage": "Xenoixodida",
      "faction": "Pathogen",
      "work": "Aliens: Fireteam Elite (2021)",
      "sourceReferenceId": "drive-v123-fte-pathogen-popper-profile-v13",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_afe_pathogen_popper"
    },
    "tuning": {
      "targetOpaqueHeight": 32,
      "bodyWidth": 38,
      "bodyHeight": 32,
      "cost": 1,
      "health": 55,
      "damage": 12,
      "speed": 1.2,
      "armor": 0,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "fte-pathogen-queen-right-v13",
      "path": "/assets/user/drive-v123/enemies/fte-pathogen-queen-right-v13.png",
      "sha256": "fc89279a6f535760115052b5efd33935ab7ec4c4f974bdd865fbba6cda409827",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        22,
        16,
        1505,
        1012
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5936197916666667,
        "y": 0.98828125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Pathogen Queen",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "royal",
      "lineage": "Pathogen Queen",
      "faction": "Pathogen",
      "work": "Aliens: Fireteam Elite — Pathogen (2022)",
      "sourceReferenceId": "drive-v123-fte-pathogen-queen-right-v13",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_pathogen_queen"
    },
    "tuning": {
      "targetOpaqueHeight": 298,
      "bodyWidth": 156,
      "bodyHeight": 246,
      "cost": 6,
      "health": 540,
      "damage": 35,
      "speed": 0.7,
      "armor": 24,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "fte-pathogen-runner-nodules-v13",
      "path": "/assets/user/drive-v123/enemies/fte-pathogen-runner-nodules-v13.png",
      "sha256": "4cdadb4fd4a9592c4015e931cf43593a40673eb55e068842a399f0db2a68732f",
      "sourceWidth": 1672,
      "sourceHeight": 941,
      "alphaBounds": [
        48,
        94,
        1638,
        878
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6183014354066986,
        "y": 0.9330499468650372
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Pathogen Runner",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "runner",
      "lineage": "Pathogen Runner",
      "faction": "Pathogen",
      "work": "Aliens: Fireteam Elite — Pathogen (2022)",
      "sourceReferenceId": "drive-v123-fte-pathogen-runner-nodules-v13",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_pathogen_runner"
    },
    "tuning": {
      "targetOpaqueHeight": 82,
      "bodyWidth": 84,
      "bodyHeight": 58,
      "cost": 2,
      "health": 120,
      "damage": 17,
      "speed": 1.7,
      "armor": 5,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "fte-pathogen-stalker-profile-v13",
      "path": "/assets/user/drive-v123/enemies/fte-pathogen-stalker-profile-v13.png",
      "sha256": "31d64b37d7e8321e968ec2c4765386d289020969dff101cb2e6ec066d3f8221b",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        95,
        56,
        1511,
        973
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5965364583333334,
        "y": 0.9501953125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Pathogen Stalker",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "caste": "stalker",
      "lineage": "Pathogen Stalker",
      "faction": "Pathogen",
      "work": "Aliens: Fireteam Elite (2021)",
      "sourceReferenceId": "drive-v123-fte-pathogen-stalker-profile-v13",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "castes-game_afe_pathogen_stalker"
    },
    "tuning": {
      "targetOpaqueHeight": 96,
      "bodyWidth": 88,
      "bodyHeight": 72,
      "cost": 3,
      "health": 175,
      "damage": 22,
      "speed": 1.4,
      "armor": 8,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  },
  {
    "asset": {
      "slug": "kenner-gorilla",
      "path": "/assets/user/drive-v123/enemies/kenner-gorilla.png",
      "sha256": "262fbfcedf22db9973c99aa925c5b98bfeeffc57680efb61d7f66e917dff1602",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        99,
        24,
        1477,
        996
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6565625,
        "y": 0.97265625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Gorilla Alien",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "assault",
      "lineage": "Gorilla Alien",
      "faction": "Hive",
      "work": "Aliens — Kenner / NECA (figurines)",
      "sourceReferenceId": "drive-v123-kenner-gorilla",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v94-kenner-gorilla"
    },
    "tuning": {
      "targetOpaqueHeight": 233.25518341307819,
      "bodyWidth": 70,
      "bodyHeight": 130,
      "cost": 4,
      "health": 230,
      "damage": 24,
      "speed": 1,
      "armor": 14,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "neca-panther-kenner-tribute-v14",
      "path": "/assets/user/drive-v123/enemies/neca-panther-kenner-tribute-v14.png",
      "sha256": "e9656951a04ad058bcd17ee80a829e7c201f0067aa18341a9120fdfc89c52b52",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        25,
        52,
        1521,
        993
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.6590885416666666,
        "y": 0.9697265625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Panther Alien",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "runner",
      "lineage": "Panther Alien",
      "faction": "Hive",
      "work": "Aliens — Kenner / NECA (figurines)",
      "sourceReferenceId": "drive-v123-neca-panther-kenner-tribute-v14",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v94-kenner-panther"
    },
    "tuning": {
      "targetOpaqueHeight": 248.82442748091606,
      "bodyWidth": 108,
      "bodyHeight": 76,
      "cost": 3,
      "health": 190,
      "damage": 23,
      "speed": 1.5,
      "armor": 10,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "neca-rhino-kenner-orange-v14",
      "path": "/assets/user/drive-v123/enemies/neca-rhino-kenner-orange-v14.png",
      "sha256": "9b46647433f09dc4c0e9494396ab4773472c2e0e6933ad2096e22ae4aaf13b85",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        51,
        73,
        1472,
        946
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5790299479166666,
        "y": 0.923828125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Rhino Alien — orange",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "siege",
      "lineage": "Rhino Alien",
      "faction": "Hive",
      "work": "Aliens — Kenner / NECA (figurines)",
      "sourceReferenceId": "drive-v123-neca-rhino-kenner-orange-v14",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v94-kenner-rhino"
    },
    "tuning": {
      "targetOpaqueHeight": 248.6290076335878,
      "bodyWidth": 140,
      "bodyHeight": 124,
      "cost": 5,
      "health": 320,
      "damage": 28,
      "speed": 0.8,
      "armor": 24,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "neca-rhino-kenner-version2-blue-v14",
      "path": "/assets/user/drive-v123/enemies/neca-rhino-kenner-version2-blue-v14.png",
      "sha256": "bd955bec16dc7c4fb8d3502268109b02fa13efcc46ea76dbf83844958d6fcd91",
      "sourceWidth": 1536,
      "sourceHeight": 1024,
      "alphaBounds": [
        48,
        78,
        1511,
        970
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5932096354166666,
        "y": 0.947265625
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Rhino Alien — bleu",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "siege",
      "lineage": "Rhino Alien",
      "faction": "Hive",
      "work": "Aliens — Kenner / NECA (figurines)",
      "sourceReferenceId": "drive-v123-neca-rhino-kenner-version2-blue-v14",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v94-kenner-rhino"
    },
    "tuning": {
      "targetOpaqueHeight": 248.6290076335878,
      "bodyWidth": 140,
      "bodyHeight": 124,
      "cost": 5,
      "health": 320,
      "damage": 28,
      "speed": 0.8,
      "armor": 24,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "neca-snake-series13-v14",
      "path": "/assets/user/drive-v123/enemies/neca-snake-series13-v14.png",
      "sha256": "3d2ffa2d4e41238b35f7f007f0490e195b54677b1dda1867106264acbe3fbb46",
      "sourceWidth": 1122,
      "sourceHeight": 1402,
      "alphaBounds": [
        91,
        16,
        1064,
        1391
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.5233778966131908,
        "y": 0.9921540656205421
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Snake Alien",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "caste": "stalker",
      "lineage": "Snake Alien",
      "faction": "Hive",
      "work": "Aliens — Kenner / NECA (figurines)",
      "sourceReferenceId": "drive-v123-neca-snake-series13-v14",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v94-kenner-snake"
    },
    "tuning": {
      "targetOpaqueHeight": 205.50458715596332,
      "bodyWidth": 64,
      "bodyHeight": 150,
      "cost": 3,
      "health": 165,
      "damage": 22,
      "speed": 1.1,
      "armor": 10,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "game-working-joe-hazard",
      "path": "/assets/user/drive-v123/enemies/game-working-joe-hazard.png",
      "sha256": "15f264d12367d9bc3377839864ade8e9eb502126f16fc58bff832456ceec8b07",
      "sourceWidth": 1024,
      "sourceHeight": 1536,
      "alphaBounds": [
        377,
        24,
        639,
        1495
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.49609375,
        "y": 0.9733072916666666
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Working Joe — combinaison de protection",
      "biology": "synthetic",
      "kind": "organism",
      "stage": "manufactured-unit",
      "caste": "synthetic",
      "lineage": "Working Joe",
      "faction": "Seegson",
      "work": "Alien: Isolation (2014)",
      "sourceReferenceId": "drive-v123-game-working-joe-hazard",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v103-import-synth-workingjoe-hazmat"
    },
    "tuning": {
      "targetOpaqueHeight": 126,
      "bodyWidth": 36,
      "bodyHeight": 112,
      "cost": 3,
      "health": 180,
      "damage": 17,
      "speed": 0.58,
      "armor": 14,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "game-working-joe-standard",
      "path": "/assets/user/drive-v123/enemies/game-working-joe-standard.png",
      "sha256": "012742134db3e9844a9f3152cd5ef4bec5fd5fac26391a41aae75833a3503fc6",
      "sourceWidth": 1024,
      "sourceHeight": 1536,
      "alphaBounds": [
        380,
        31,
        699,
        1496
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.52685546875,
        "y": 0.9739583333333334
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Working Joe — unité standard",
      "biology": "synthetic",
      "kind": "organism",
      "stage": "manufactured-unit",
      "caste": "synthetic",
      "lineage": "Working Joe",
      "faction": "Seegson",
      "work": "Alien: Isolation (2014)",
      "sourceReferenceId": "drive-v123-game-working-joe-standard",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v103-import-synth-workingjoe-classic"
    },
    "tuning": {
      "targetOpaqueHeight": 126.00000000000001,
      "bodyWidth": 26,
      "bodyHeight": 112,
      "cost": 3,
      "health": 165,
      "damage": 15,
      "speed": 0.62,
      "armor": 10,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "crossover"
    }
  },
  {
    "asset": {
      "slug": "prometheus-engineer-chair-suit-v16",
      "path": "/assets/user/drive-v123/enemies/prometheus-engineer-chair-suit-v16.png",
      "sha256": "8c39f9677bd34a97ff3e64e8189c9c31dcbea8b34d792f5372312d340d8da743",
      "sourceWidth": 1024,
      "sourceHeight": 1536,
      "alphaBounds": [
        331,
        13,
        677,
        1491
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.4921875,
        "y": 0.970703125
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Engineer — Combinaison de pilotage",
      "biology": "engineer",
      "kind": "organism",
      "stage": "adult",
      "caste": "engineer",
      "lineage": "Mala'kak",
      "faction": "Engineers",
      "work": "Prometheus (2012)",
      "sourceReferenceId": "drive-v123-prometheus-engineer-chair-suit-v16",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "pose-v106-import-engineer-spacejokey"
    },
    "tuning": {
      "targetOpaqueHeight": 176,
      "bodyWidth": 50,
      "bodyHeight": 162,
      "cost": 4,
      "health": 245,
      "damage": 22,
      "speed": 0.7,
      "armor": 20,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": "engineer"
    }
  },
  {
    "asset": {
      "slug": "game-combat-synthetic-avp2",
      "path": "/assets/user/drive-v123/enemies/game-combat-synthetic-avp2.png",
      "sha256": "152450addbfcb4bdd7e8ec35c7c1f43a465d51056028551b26261090cb091ed6",
      "sourceWidth": 1024,
      "sourceHeight": 1536,
      "alphaBounds": [
        360,
        71,
        655,
        1477
      ],
      "alphaBoundsThreshold": 16,
      "pivot": {
        "x": 0.49560546875,
        "y": 0.9615885416666666
      },
      "sourceFacing": 1,
      "reviewStatus": "accepted-static-adaptation",
      "alphaVerified": true,
      "geometryReviewed": true,
      "nativeTransparent": true,
      "frameCount": 1,
      "clipped": false
    },
    "identity": {
      "name": "Combat Synthetic — unité désarmée",
      "biology": "synthetic",
      "kind": "organism",
      "stage": "manufactured-unit",
      "caste": "synthetic",
      "lineage": "Combat Synthetic",
      "faction": "Weyland-Yutani",
      "work": "Aliens versus Predator 2 (2001)",
      "sourceReferenceId": "drive-v123-game-combat-synthetic-avp2",
      "identityReviewed": true,
      "enemyConfirmed": true,
      "alteredOf": "enemy-042-combat-synthetic"
    },
    "tuning": {
      "targetOpaqueHeight": 126,
      "bodyWidth": 42,
      "bodyHeight": 116,
      "cost": 3,
      "health": 108,
      "damage": 49,
      "speed": 0.8200000000000001,
      "armor": 34,
      "acid": 0,
      "combatRole": "melee",
      "locomotion": "ground",
      "automaticEncounter": false,
      "arenaEligible": true,
      "encounterGroup": null
    }
  }
]);
export const ENEMY_DRIVE_IMPORTS_V123 = Object.freeze(ENEMY_DRIVE_ADMISSIONS_V123.map(createEnemyDriveImportV123));
export const ENEMY_DRIVE_IMPORT_IDS_V123 = Object.freeze(ENEMY_DRIVE_IMPORTS_V123.map(p => p.id));
export const ENEMY_DRIVE_IMPORT_PATHS_V123 = Object.freeze(ENEMY_DRIVE_IMPORTS_V123.map(p => p.path));
if (ENEMY_DRIVE_IMPORTS_V123.length !== 32
  || new Set(ENEMY_DRIVE_IMPORT_IDS_V123).size !== 32
  || new Set(ENEMY_DRIVE_IMPORT_PATHS_V123).size !== 32)
  throw new Error('Invalid V123 Drive enemy roster');

// These explicit aliases select existing arena tuning, never an image, taxonomy,
// animation or campaign identity. AFE Runner/Spitter share their seeded archetype.
const ARENA_TUNING_ALIASES_V123 = Object.freeze({
  'afe-runner': 'runner', 'afe-spitter': 'spitter'
});
// No historical arena entry exists for these exact dossiers. Values are authored
// arena balance from their preserved project threat/locomotion, not canon powers.
const ARENA_NEW_TUNING_V123 = freeze({
  'creature-resurrection-newborn-v2': ['tank', 305, 175, 1.15, 1.1, 'ram'],
  'creature-romulus-offspring': ['tank', 295, 195, 1.12, 1.12, 'ram'],
  'fte-pathogen-brute-profile-v13': ['tank', 280, 165, 1.1, 1.05, 'ram'],
  'fte-pathogen-popper-profile-v13': ['agile', 140, 235, .85, .8, 'pounce'],
  'fte-pathogen-queen-right-v13': ['tank', 310, 145, 1.15, 1.25, 'tail'],
  'fte-pathogen-runner-nodules-v13': ['agile', 180, 285, .95, .9, 'pounce'],
  'fte-pathogen-stalker-profile-v13': ['agile', 205, 260, 1, 1, 'slash'],
  'neca-snake-series13-v14': ['balanced', 215, 220, 1, 1.05, 'tail'],
  'game-combat-synthetic-avp2': ['balanced', 225, 200, 1.05, 1, 'ram']
});

/** Append reviewed adults only. Historical entries, unlock IDs and properties
 * are read-only; an unarmed synthetic can never inherit a rifle/pulse special. */
export function createXenoTrialsDriveImportsV123(historicalRoster) {
  if (!Array.isArray(historicalRoster)) throw new Error('V123 requires the preserved arena roster');
  const imports = ENEMY_DRIVE_IMPORTS_V123.filter(pose => pose.arenaEligible).map(pose => {
    const alias = ARENA_TUNING_ALIASES_V123[pose.basename];
    const parent = historicalRoster.find(entry => alias ? entry.id === alias : entry.profileId === pose.alteredOf);
    const custom = ARENA_NEW_TUNING_V123[pose.basename];
    if (!parent && !custom) throw new Error(`V123 requires explicit arena tuning: ${pose.id}`);
    const [role, hp, speed, power, reach, special] = parent
      ? [parent.role, parent.hp, parent.speed, parent.power, parent.reach, parent.special] : custom;
    if (pose.biology === 'synthetic' && (pose.combatRole !== 'melee' || special !== 'ram'))
      throw new Error(`V123 unarmed synthetic cannot inherit ranged tuning: ${pose.id}`);
    const factionId = ['synthetic', 'engineer'].includes(pose.biology)
      ? 'containment' : role === 'agile' ? 'pursuit' : role === 'ranged' ? 'rival-lab' : 'hive';
    return { id: `drive-v123-${pose.basename}`, profileId: pose.id, label: pose.name,
      role, hp, speed, power, reach, special, factionId, importRevision: 123,
      sourceReferenceId: pose.sourceReferenceId, alteredOf: pose.alteredOf,
      tuningCounterpartFighterId: parent?.id || null,
      tuningBasis: parent ? 'preserved-counterpart-arena-tuning' : 'explicit-project-arena-balance',
      combatRole: pose.combatRole, combatWeapon: pose.combatWeapon,
      canonExact: false, animationStatus: 'missing' };
  });
  if (imports.length !== 26) throw new Error('V123 adult arena roster must contain exactly 26 entries');
  return freeze(imports);
}
