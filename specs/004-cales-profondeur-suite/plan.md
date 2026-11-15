# Implementation Plan: Autres cales de mission en profondeur

**Branch**: branche de travail existante (spec `004-cales-profondeur-suite`) | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

La construction de la section de QZ-17 devient un constructeur piloté par des définitions (`src/depth-hold-sections-v188.js`). Une définition décrit une cale : campagnes, mesure sur le niveau généré, bornes, objets placés par règle, emplacements des dormeurs, règle des grandes castes. QZ-17 est la première définition et garde sa disposition fixe (`qz17HoldLayoutV188`). Deux définitions s'ajoutent : la cale des cargos procéduraux et la cale de quarantaine de Léthé. Le mixin `withMissionDepthRoomsV188` choisit la définition au démarrage. Il reçoit aussi les corrections de l'évaluation jouée (saut, coop) et la profondeur de l'acide de Léthé.

## Technical Context

**Language/Version**: JavaScript ES modules ; Node 22+ pour les tests

**Primary Dependencies**: aucune nouvelle ; chaîne `GameEngine` inchangée (`src/game-production-runtime.js` n'est pas modifié)

**Storage**: reprise de mission, champ additif `depthV188.acid` ; format de sauvegarde inchangé

**Testing**: `node --test scripts/verify-depth-holds-v188.mjs` avec `scripts/engine-host-v188.mjs` (moteur réel), Chromium avec touches réelles

**Performance Goals**: écart de temps d'image < 10 % dans chaque cale (même page, A/B alterné)

**Constraints**: modules Forge épinglés et `scripts/audit-*.mjs` non modifiés ; texte joueur inchangé

## Constitution Check

La constitution est vide ; les règles d'AGENTS.md s'appliquent :

- moteur Canvas et ordre des mixins conservés ;
- reprise additive ;
- admissibilité des castes vérifiée par cale ;
- accès logique, passage physique, aller-retour et reprise testés ;
- performances mesurées avant/après ;
- documents admis comme sources.

## Project Structure

```text
src/depth-hold-sections-v188.js   # NOUVEAU : définitions, constructeur, éléments du mur, règle de voie, passage
src/depth-hold-slots-v188.js      # NOUVEAU : 4 emplacements d'art nommés + replis en primitives
src/mission-depth-v188.js         # constructeur QZ-17 délégué ; choix de la définition ; saut ; coop ; acide ; dormeurs
sw.js                             # coque hors ligne : 2 modules
scripts/verify-depth-holds-v188.mjs  # NOUVEAU : 9 tests sur le moteur réel
```

## Complexity Tracking

| Choix | Pourquoi | Alternative rejetée |
| --- | --- | --- |
| Placement par règle (« mur nu ouest/est », position relative) au lieu de coordonnées fixes | la caisse de munitions, la couverture et le conduit varient selon la graine | coordonnées fixes : la couverture masquée sur certaines graines |
| Grandes castes « sur toute la profondeur » dans les cales 004 | les rôles générés y placent des Reines ; les déplacer changerait les autres sections | les déplacer comme QZ-17 vers le pont de service |
| Filtre de l'acide par file des flaques actives pendant `updateAlienSurvivalAcidV70` | la boucle de base demande les acteurs une fois par flaque | réécrire la boucle de l'acide du module V70 |
| Cargo Brutal en 2D | voir research.md, R2 | une section devant le P-5000 |
