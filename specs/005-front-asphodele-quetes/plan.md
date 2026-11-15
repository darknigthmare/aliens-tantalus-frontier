# Implementation Plan: Front station Asphodèle, premières quêtes et temps de voyage

**Spec**: [spec.md](spec.md) · **Research**: [research.md](research.md)

## Technical Context

- Moteur navigateur en modules ES, Canvas 2D, Node 22 pour les tests (`node:test`).
- Les missions de station sont des campagnes ordinaires : `launchCampaign` → `beginOperation` → `buildCampaignMissionLevelV122` (gabarit `ship-interior-vertical`) → `finalizeOperation`. Aucun runtime de mission nouveau.
- La complétion vient de `galaxy.completedCampaignIds` (source unique). Le module ne garde que l'intro entendue, la décision CASSIUS et les scènes vues.

## Modules

| Module | Rôle |
| --- | --- |
| `src/station-asphodele-v188.js` | Données des quatre missions, verrous, choix CASSIUS, scènes de retour, résumé du Commandement |
| `src/crew-quests-v188.js` | Quatre quêtes, étapes d'analyse, composants de DAVID-8R, récompenses |
| `src/galaxy-travel-v188.js` | 14 jours par saut, texte de route, application unique à l'arrivée |
| `src/content-gap-slots-v188.js` | Six emplacements d'art, primitives Canvas |
| `src/content-gap-ui-v188.js` | Dialogue de scène avec image d'emplacement |

## Raccordements

- `src/content.js` : `STATION_CAMPAIGNS_V188` ajoutées au catalogue (455 → 459) ; `scripts/verify-audit-v143.mjs` suit le compte.
- `src/save.js` : champs additifs `stationV188`, `crewQuestsV188` (création et migration).
- `src/story-dossier-v188.js` : pièce CASSIUS lue depuis S2 ; `asphodeleRetaken` lu depuis S4 par défaut.
- `src/app.js` : filtre des listes et verrou au lancement ; panneaux « Station Asphodèle » et « Quêtes de l'équipage » au Commandement ; décision CASSIUS et scènes de retour à l'ouverture du Commandement ; boutons de quête dans la conversation du hub ; composants de DAVID-8R dans `finalizeOperation` ; temps du saut dans `tickGalaxyJumpV116`.
- `index.html` : deux sections hôtes ; `sw.js` : cinq modules.
- Anglais : catalogue `src/i18n-en-catalog-v185.js` (bloc commenté, fusion vérifiée par `i18n-catalog-maintenance-v186.mjs merge`) pour les textes DOM ; dictionnaires `{ fr, en }` dans les modules.

## Constraints

- Forge non touchée ; aucun `scripts/audit-*.mjs` modifié ; les empreintes de `app.js`, `save.js`, `content.js`, `story-dossier-v188.js`, `sw.js`, `index.html` et du catalogue changent (reçus à régénérer par le lead).
- Aucune règle de combat ni VFX modifiée.
