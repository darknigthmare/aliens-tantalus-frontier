# Implementation Plan: Insertion et extraction cinématiques

**Branch**: `worktree-agent-a05e3b511f604fc7e` (spec `003-insertion-extraction-cinematiques`) | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

Un module pur et dessinable, `src/insertion-cinematic-v188.js`, dérive le profil d'un monde (type de lieu, météo, couleurs, coordonnées), construit une séquence de plans (complète ou courte, insertion ou extraction) et calcule à chaque instant un état de vol unique. Cet état alimente les plans extérieurs, le cockpit (quatre écrans CRT et la radio) et la soute de troupe. Un lecteur plein écran, sur le modèle de `CinematicPlayerV188`, joue la séquence, mesure le temps d'image et se passe avec Échap, Entrée ou un bouton tactile. Tous les visuels passent par `src/insertion-asset-slots-v188.js` : image si le fichier est déclaré présent, primitive sinon.

`src/app.js` joue la séquence entre la fin du plan d'insertion V62 et `engine.start`, à qui il passe l'option additive `insertionHandoverV188`. À l'extraction, il attend l'événement `extraction-boarding-complete-v188` du moteur, met la mission en pause, joue la montée, puis la reprend ; sans événement, rien ne change.

## Technical Context

**Language/Version**: JavaScript ES modules ; Node 22+ pour les tests

**Primary Dependencies**: aucune nouvelle ; `CinematicPlayerV188` comme modèle, `AudioDirector` (repères procéduraux), `colorblind-palette-v188.js`

**Storage**: `strategy.insertionSeenWorldIdsV188`, `strategy.extractionSeenWorldIdsV188` (listes d'id bornées à 256) et `settings.insertionAlwaysFullV188`, tous additifs et assainis par `migrateSave`

**Testing**: `node --test scripts/verify-insertion-cinematic-v188.mjs` ; Chromium (Playwright) : parcours réel par `launchCampaign`, captures, temps d'image

**Target Platform**: navigateurs de bureau et mobiles

**Performance Goals**: dessin < 4 ms au 95e centile ; aucune allocation d'image ; pas de requête réseau pour un emplacement vide

**Constraints**: ne pas toucher aux moteurs de mission ni aux modules Forge épinglés ; contenus et sauvegardes inchangés

**Scale/Scope**: 3 types de lieu × 2 directions × 2 longueurs ; 25 types de plans ; 19 emplacements d'art

## Constitution Check

La constitution est vide ; les règles d'AGENTS.md s'appliquent :

- moteur Canvas et modules ES conservés ;
- additions reliées au chargement (sw.js), au jeu (`engine.start`), à l'interface (réglages) et à la persistance ;
- sauvegardes additives ;
- sources franchise citées, sans revendication de fidélité « 1:1 » ;
- performances mesurées, conditions publiées ;
- documents de développement admis comme sources, exclus du build.

## Project Structure

```text
src/insertion-cinematic-v188.js        # NOUVEAU : profils, séquences, état de vol, écrans, dessin, lecteur, flux d'extraction
src/insertion-asset-slots-v188.js      # NOUVEAU : emplacements d'art + chargeur image/primitive
src/app.js                             # câblage : plan, lecture, engine.start, événement d'embarquement, réglage
src/save.js                            # champs additifs + migration
src/audio.js                           # insertionCueV188 : repères procéduraux
src/i18n-en-catalog-v185.js            # bloc commenté ajouté en fin d'objet
index.html, styles.css, sw.js          # réglage, bouton 44 px, cache hors ligne
docs/development/INSERTION_ART_SLOTS_V188.md
docs/narrative/CAMPAGNE_PRINCIPALE.md  # §10.1 tableau de fidélité
scripts/verify-insertion-cinematic-v188.mjs
```

## Contract with the engine agent

- Lancement : `engine.start({ …, insertionHandoverV188: { mode: 'foot'|'apc', placeType: 'atmosphere'|'airless'|'space', dropshipId: 'ud4l', short } })`, ou `null` pour une reprise en cours de mission.
- Extraction : `engine.onEvent({ type: 'extraction-boarding-complete-v188', mode, placeType })` avant le flux `mission-complete`.

## Complexity Tracking

| Choix | Pourquoi | Alternative rejetée |
| --- | --- | --- |
| Liste explicite des fichiers d'art présents | Ne jamais demander au réseau un fichier absent du dépôt | Sonder chaque chemin (404 en console, requêtes inutiles) |
| Liste des gabarits APC recopiée et testée contre celle du moteur | Importer le runtime moteur dans le module de rendu alourdirait le chargement | Import direct |
| Persistance du résultat de mission avant la fin de l'extraction | Ne pas perdre un résultat si l'onglet se ferme pendant la séquence | Différer la résolution derrière la cinématique |
