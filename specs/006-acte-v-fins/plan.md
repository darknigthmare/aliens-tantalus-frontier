# Implementation Plan: Acte V « Non viable », conseil de guerre, fins et épilogue

**Spec**: [spec.md](spec.md) · **Research**: [research.md](research.md)

## Technical Context

- Moteur navigateur en modules ES, Canvas 2D, Node 22 pour les tests (`node:test`).
- Les missions finales sont des campagnes ordinaires : `launchCampaign` → `beginOperation` → `buildCampaignMissionLevelV122` → `finalizeOperation`. Aucun runtime de mission nouveau, aucun module Forge touché.
- La complétion vient de `galaxy.completedCampaignIds`. Le dossier, la loyauté, CASSIUS, le manifeste et la colonie sont lus dans leurs enregistrements. L'Acte V ne garde que ses décisions, dans `storyCampaignV188.act5`.

## Modules

| Module | Rôle |
| --- | --- |
| `src/story-act5-state-v188.js` | Normalisation pure de `storyCampaignV188.act5` (aucun import) |
| `src/story-act5-v188.js` | Missions, verrous, conseil, décision, avantages, pont, quai, fins, épilogue, objectif, résumé de la table, contexte des cinématiques |
| `src/act5-slots-v188.js` | 15 emplacements d'art (6 dialogues 640×280, 9 plans 1280×720), primitives Canvas |
| `src/story-cinematics-v188.js` | CIN-60, CIN-61, CIN-90 ×3, CIN-92, générique ; plans `act5-slot`, `act5-lines`, `credits` |

## Raccordements

- Salle des relais : la salle des relais vient du hub Asphodèle (`asphodeleRelayReadyV188`, `src/asphodele-hub-v188.js`), lue par défaut par `finalChoiceOptionsV188` ; l'Acte V ne la reconstruit pas (consigne du lead, commit `ed5290a`).
- `src/story-campaign-v188.js` : `normalizeStoryCampaignV188` garde `act5` s'il existe (aucune clé ajoutée aux anciennes sauvegardes).
- `src/content.js` : `ACT5_CAMPAIGNS_V188` (459 → 463) ; `scripts/verify-audit-v143.mjs` suit le compte.
- `src/app.js` :
  - listes de missions par `unlockedCampaignsV188` ; verrou et avantages au lancement ;
  - défaut du pont dans `finalizeOperation` ;
  - `act5OnViewV188` dans `markStoryDebriefOnViewV188`, après les scènes de la station : conseil, quai, fin, générique ;
  - pont chronométré au premier `checkpoint` ;
  - bouton « ÉPILOGUE · Dernier mot » dans la conversation du hub ; casier d'Echo-8 ;
  - contexte des cinématiques de l'Acte V, aussi pour les relectures des Réglages ;
  - panneau « Acte V » au Commandement.
- `index.html` : section hôte `#act5-panel-v188` ; `sw.js` : trois modules.
- Anglais : bloc commenté du catalogue `src/i18n-en-catalog-v185.js` (fusion vérifiée par `i18n-catalog-maintenance-v186.mjs merge`) ; dictionnaires `{ fr, en }` dans les modules.

## Constraints

- Forge non touchée (`AUDIT_DEFERRED_FORGE_SOURCES`) ; aucun `scripts/audit-*.mjs` modifié ; `src/save.js` non modifié.
- `src/station-asphodele-v188.js` et `src/crew-quests-v188.js` lus seulement (chantier parallèle du hub Asphodèle).
- Les empreintes de `app.js`, `content.js`, `story-campaign-v188.js`, `story-cinematics-v188.js`, `sw.js`, `index.html`, `package.json` et du catalogue changent : reçus V188 à régénérer par le lead.
