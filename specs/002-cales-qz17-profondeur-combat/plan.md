# Implementation Plan: Cales de QZ-17 en profondeur, avec combat

**Branch**: `claude/nifty-shannon-qpy1hl` (spec `002-cales-qz17-profondeur-combat`) | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

## Summary

Un mixin de mission, `withMissionDepthRoomsV188`, composé à l'extérieur de `GameEngine`, ajoute une section « profondeur » au pont bas des soutes de QZ-17 (zone `ship-cargo`, sol continu y = 868, entre `dock-bulkhead` et `cargo-bulkhead`). La section est calculée à partir de la géométrie réelle du niveau généré. Comme au hub (spec 001), la physique du rail reste intacte ; `z` sert aux emprises, au combat et au rendu. Les règles pures de `hub-depth-rooms-v188.js` sont réutilisées : emprises, pas balayé, recul vers une zone libre, bande de tir, recalage.

## Technical Context

**Language/Version**: JavaScript ES modules ; Node 22+ pour les tests

**Primary Dependencies**: aucune nouvelle ; chaîne `GameEngine` (`src/game-production-runtime.js:92`)

**Storage**: reprise de mission (`captureResumeState` / `applyResumeState`), champ additif `depthV188` ; les reprises natives acceptent les clés bien formées (`save.js:1611`)

**Testing**: `node --test` avec le harnais `scripts/engine-host-v188.mjs` (moteur réel, gabarit `ship-interior-vertical`), Chromium

**Target Platform**: navigateurs de bureau, manette, tactile

**Project Type**: jeu navigateur

**Performance Goals**: écart de temps d'image < 10 % dans la cale (même page, A/B)

**Constraints**: aucune régression des autres missions ni des autres sections de QZ-17 ; ennemis et tirs inchangés hors de la cale

**Scale/Scope**: une section (≈ 590 px de sol), trois rôdeurs de la dépressurisation, la couverture existante et trois rangées de conteneurs

## Constitution Check

La constitution est vide ; les règles d'AGENTS.md s'appliquent et sont respectées :

- moteur Canvas inchangé ;
- mixin composé dans la chaîne existante ;
- reprises additives ;
- comportement spécialisé des castes conservé (castes horizontales seulement) ;
- performances mesurées avant/après ;
- documents admis comme sources.

## Project Structure

```text
src/mission-depth-v188.js          # NOUVEAU : section de la cale (pure) + mixin withMissionDepthRoomsV188
src/game-production-runtime.js     # composition : withMissionDepthRoomsV188 le plus à l'extérieur
sw.js                              # coque hors ligne
scripts/verify-mission-depth-v188.mjs   # NOUVEAU : moteur réel, cale de QZ-17
```

## Complexity Tracking

| Choix | Pourquoi | Alternative rejetée |
| --- | --- | --- |
| Déclencheur de dégâts filtré par l'attaquant courant (ennemi en cours de mise à jour, ou projectile proche) | `damagePlayer` ne reçoit pas toujours sa source | Réécrire `updateEnemy` et `updateHostileProjectiles` : trop de surcharges en aval |
| Conteneurs ajoutés temporairement aux murs pendant `updateBullets`, selon la bande de la salve | La collision des balles est un balayage AABB contre les murs | Nouveau moteur de balistique |
