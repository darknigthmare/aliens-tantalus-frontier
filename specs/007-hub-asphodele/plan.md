# Implementation Plan: Hub Asphodèle, missions de la station, contrats, CIN-70 à CIN-72

**Spec**: [spec.md](spec.md) · **Research**: [research.md](research.md) · **Tasks**: [tasks.md](tasks.md)

## Contexte technique

Navigateur, modules ES, Canvas 2D, Node 22. Chaîne : `src/app.js` → `HubGame` (mixins) ; le nouveau mixin est appliqué en dernier. Aucun module Forge épinglé (`AUDIT_DEFERRED_FORGE_SOURCES`) ni `scripts/audit-*.mjs` n'est modifié.

## Modules

| Fichier | Rôle |
| --- | --- |
| `src/asphodele-missions-v188.js` (nouveau) | 7 missions annexes, 6 contrats, verrous, compteurs de contrats (pur, sans import) |
| `src/asphodele-hub-v188.js` (nouveau) | Pièces, portes, verrous, champ `asphodeleHubV188`, voyage, prédicat `asphodeleRelayReadyV188`, plaque de Kessler, textes FR/EN, `stationCinematicDueV188` |
| `src/asphodele-hub-slots-v188.js` (nouveau) | 20 emplacements d'art nommés et leurs placeholders en primitives |
| `src/hub-asphodele-v188.js` (nouveau) | Mixin d'exécution : physique d'annexe, profondeur V2, portes, invites, dessin, points de sauvegarde |
| `src/station-cinematics-v188.js` (nouveau) | CIN-70, CIN-71, CIN-72 ; plans `station-exterior`, `station-waveform` ; décors `control`, `lowerdeck` |
| `src/station-asphodele-v188.js` | Les listes de campagnes filtrent aussi les missions annexes et les contrats |
| `src/content.js` | +13 campagnes (472) |
| `src/save.js` | Champ additif `asphodeleHubV188` |
| `src/story-dossier-v188.js` | `relayRoomOpen` lit le prédicat par défaut |
| `src/story-cinematics-v188.js` | Étendu par les données de station |
| `src/hub-echo8-locker-v188.js` | Notes et dessin de la plaque de Kessler |
| `src/content-gap-ui-v188.js` | Les boutons d'un dialogue passent à la ligne |
| `src/app.js` | Chaîne du hub, navette, actions `asphodele:*`, contrats dans `finalizeOperation`, cinématiques, casier |
| `sw.js`, `package.json`, `src/i18n-en-catalog-v185.js`, `scripts/verify-public-release-v86.mjs` | Distribution, suite, anglais (bloc ajouté en fin d'objet), admission source |

## Vérifications

- `node --test scripts/verify-asphodele-hub-v188.mjs` (dans `test:priorities:v188`).
- Suites voisines : `verify-content-gaps-v188`, `verify-story-cinematics-v188`, `verify-cinematic-coherence-v188`, `verify-story-dossier-v188`, `verify-audit-v143` (compte de campagnes mis à jour).
- QA Chromium `scripts/qa-asphodele-hub-v188.mjs` (fixtures déclarées dans l'en-tête du script), serveur `PORT=4592 node scripts/dev.mjs`.
- Empreintes attendues en échec : `scripts/audit-tantalus-priorities-v188.mjs` épingle les SHA-256 des fichiers modifiés ; il n'est pas modifié ici.
