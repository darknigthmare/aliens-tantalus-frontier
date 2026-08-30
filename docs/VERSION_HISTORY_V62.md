# Historique de version - v62.0.0

Date : 30 aout 2026

## Contenu

- catalogues hierarchiques armes, equipements, ennemis et vehicules avec recherche, arbre, relations biologiques et vignettes issues des vraies cellules de plaques ;
- sauvegarde Frontier Forge isolee du profil campagne, import legacy idempotent et playtests mission/vaisseau bornes ;
- audit PNG V62 reproductible pour alpha, fonds blancs, grilles, halos et masters raw exclus ;
- dialogues PNJ avec premiere rencontre, repetitions, choix conditionnels, memoire, confiance, stress, blessures, mission et crise ;
- routines physiques des 16 PNJ avec stations, routes, pauses, alertes et persistance ;
- hub Tantalus prolonge par un reseau de conduits jouable, sauvegardable, audible et lisible par tracker ;
- reseaux de conduits mission pour vaisseau, colonie et exterieur planetaire, avec entree, progression, embranchements et sortie sans teleportation ;
- insertion operationnelle interactive : briefing, preparation, approche dropship/APC/a pied, incident causal, deploiement et reprise exacte ;
- infestation strictement causale : aucune crise hub sans exposition persistante et containment determine par preuves, systemes et actions ;
- quatre nouveaux bitmaps OpenAI V62 consommes par le runtime : conduit Tantalus et trois approches d'insertion mission.

## Correctif de reprise

- `src/game-v52-level-runtime.js` corrige la priorite d'interaction des conduits mission : un acteur sans `ventTransit` et sans reseau actif ne peut plus etre capture par une comparaison `undefined === undefined`.
- Le relais Neuro-Xeno redevient une interaction physique prioritaire : le joueur peut neutraliser le brouillage a portee, apres contre-impulsion, sans etre bloque par la couche de conduits.

## Validation locale

- `node --test tests/production-gameplay-runtime.test.mjs tests/mission-vent-runtime-v62.test.mjs tests/mission-physical-topology-v57.test.mjs tests/hub-v62-runtime.test.mjs tests/vent-network-v62.test.mjs` : 40 tests, 40 reussites.
- `npm.cmd test` : 366 tests, 366 reussites.
- `npm.cmd run qa` : PASS.
- `npm.cmd run qa` couvre inventaire V56, manifeste sprites V61, audits alpha V61/V62, lint, tests complets et build.
- Audit sprites : 191 atlas / 2 708 cellules.
- Audit PNG V62 : 401 PNG runtime, 0 erreur, 13 candidats halo a revue visuelle, 229 masters raw exclus par regle.
- Lint : 165 modules.
- Build : ALIENS: TANTALUS FRONTIER 62.0.0, 3 443 entrees catalogue.

## Limites honnêtes

- La QA navigateur `npm.cmd run qa:browser:v62` n'a pas encore ete executee dans cette reprise.
- Les 13 candidats halo de l'audit PNG demandent une revue visuelle sur fonds clair et sombre avant correction manuelle.
- L'ameublement auteur est fonctionnel et teste, mais le kit de petits props final par salle reste une dette de finition commerciale.
- Les lacunes Excel deja identifiees restent honnetes : Harpoon Gun sans plaque dediee, Heavy Pulse Rifle et Plasma Rifle ambigus, ES-4 Electroshock Pistol et Compound Bow absents, trois chassis bloques.

## Publication

- Commit GitHub, push et deploiement Vercel seront ajoutes apres execution finale.
