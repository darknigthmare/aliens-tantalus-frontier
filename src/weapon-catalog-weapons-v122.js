/** Append-only models backed by a viewed primary render and a fixed native plaque.
 * All numerical values are original Tantalus tuning, not canonical game statistics. */
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
export const WEAPON_CATALOG_ADDITIONS_V122 = freeze([
  {
    "id": "weapon-171-x1-fireball",
    "name": "X1 Fireball",
    "canonicalName": "X1 Fireball",
    "provenance": "licensed-reference-project-adaptation",
    "family": "flame",
    "source": "USCM",
    "mark": "Standard",
    "damage": 48,
    "fireRate": 1.8,
    "magazine": 12,
    "reload": 3.3,
    "penetration": 0,
    "rarity": "rare",
    "tags": [
      "flame-projectile",
      "launcher",
      "cqw",
      "portable"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-3-deep-dive/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "X1 Fireball identifié sur la vue officielle complète saison 3. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source. La source décrit un projectile de gel D17 explosant à l’impact, pas un jet continu.",
    "sourceMechanism": "D17-gel-projectile-impact-explosion",
    "sourceMechanismUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-3-deep-dive/"
  },
  {
    "id": "weapon-172-lem-stg24-storm-rifle",
    "name": "LEM StG24 Storm Rifle",
    "canonicalName": "LEM StG24 Storm Rifle",
    "provenance": "licensed-reference-project-adaptation",
    "family": "ballistic",
    "source": "USCM",
    "mark": "Standard",
    "damage": 24,
    "fireRate": 7.8,
    "magazine": 36,
    "reload": 2.5,
    "penetration": 31,
    "rarity": "rare",
    "tags": [
      "rifle",
      "automatic",
      "portable"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "LEM StG24 Storm Rifle identifié sur la vue officielle complète Pathogen. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source."
  },
  {
    "id": "weapon-173-u1a2-gl-conversion",
    "name": "U1A2 GL Conversion",
    "canonicalName": "U1A2 GL Conversion",
    "provenance": "licensed-reference-project-adaptation",
    "family": "explosive",
    "source": "USCM",
    "mark": "Standard",
    "damage": 73,
    "fireRate": 1.6,
    "magazine": 5,
    "reload": 2.8,
    "penetration": 19,
    "rarity": "rare",
    "tags": [
      "launcher",
      "handgun",
      "explosive",
      "portable"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "U1A2 GL Conversion identifié sur la vue officielle complète Pathogen. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source."
  },
  {
    "id": "weapon-174-4c2-astra",
    "name": "4C2 Astra",
    "canonicalName": "4C2 Astra",
    "provenance": "licensed-reference-project-adaptation",
    "family": "ballistic",
    "source": "USCM",
    "mark": "Standard",
    "damage": 21,
    "fireRate": 7.1,
    "magazine": 42,
    "reload": 2.7,
    "penetration": 27,
    "rarity": "rare",
    "tags": [
      "rifle",
      "burst",
      "portable"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "4C2 Astra identifié sur la vue officielle complète Pathogen. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source.",
    "sourceMechanism": "repeating-three-round-burst",
    "sourceMechanismUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/"
  },
  {
    "id": "weapon-175-2b1-vajra",
    "name": "2B1 Vajra",
    "canonicalName": "2B1 Vajra",
    "provenance": "licensed-reference-project-adaptation",
    "family": "explosive",
    "source": "USCM",
    "mark": "Standard",
    "damage": 91,
    "fireRate": 1.2,
    "magazine": 7,
    "reload": 3.9,
    "penetration": 24,
    "rarity": "legendary",
    "tags": [
      "launcher",
      "heavy",
      "explosive",
      "portable"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "2B1 Vajra identifié sur la vue officielle complète Pathogen. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source. La désignation 2B1 suit l'image et les notes ; 2N1 apparaît dans la prose Pathogen.",
    "sourceMechanism": "small-area-impact-grenades",
    "sourceMechanismUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/"
  },
  {
    "id": "weapon-176-6a-jaipur-smg",
    "name": "6A Jaipur Submachine Gun",
    "canonicalName": "6A Jaipur Submachine Gun",
    "provenance": "licensed-reference-project-adaptation",
    "family": "ballistic",
    "source": "USCM",
    "mark": "Standard",
    "damage": 17,
    "fireRate": 10.5,
    "magazine": 44,
    "reload": 2.3,
    "penetration": 16,
    "rarity": "rare",
    "tags": [
      "smg",
      "cqw",
      "automatic",
      "portable",
      "scattershot"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "6A Jaipur Submachine Gun identifié sur la vue officielle complète Pathogen. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source.",
    "sourceMechanism": "four-piece-splintering-sabot",
    "sourceMechanismUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/"
  },
  {
    "id": "weapon-177-8a7-dambulla-machine-pistol",
    "name": "8A7 Dambulla Machine Pistol",
    "canonicalName": "8A7 Dambulla Machine Pistol",
    "provenance": "licensed-reference-project-adaptation",
    "family": "ballistic",
    "source": "USCM",
    "mark": "Standard",
    "damage": 16,
    "fireRate": 9.8,
    "magazine": 28,
    "reload": 2.1,
    "penetration": 14,
    "rarity": "rare",
    "tags": [
      "sidearm",
      "handgun",
      "automatic",
      "portable"
    ],
    "sourceWork": "Aliens: Fireteam Elite",
    "appearances": [
      "Aliens: Fireteam Elite"
    ],
    "sourceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
    "identityVerified": true,
    "canonExact": false,
    "statsPolicy": "v122-original-project-tuning-not-source-statistics",
    "visualStatus": "static-pose-action-animation-missing",
    "description": "8A7 Dambulla Machine Pistol identifié sur la vue officielle complète Pathogen. Plaque fixe dédiée ; détails et dimensions non certifiés 1:1. Statistiques et comportement propres à Tantalus, pas valeurs extraites du jeu source.",
    "sourceMechanism": "automatic-machine-pistol",
    "sourceMechanismUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/"
  }
]);
