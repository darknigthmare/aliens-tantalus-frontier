# Plan : « La Saison des Reines », cadre de campagne et arc 1

**Spec** : `specs/011-saison-des-reines/spec.md` | **Modèles** : front station (spec 005), colonie (lot du 16 novembre), Acte V (spec 006)

## Architecture

| Élément | Fichier | Raccordement |
| --- | --- | --- |
| Règles et données (appel, acceptation, arrivée, verrous, résultats, choix, scènes, compte rendu, panneau, roster) | `src/side-campaign-queens-v188.js` (nouveau, pur, sans import) | Lu par `content.js`, `save.js`, `travel-messages-v188.js`, `app.js` |
| Missions de l'arc 1 (9) | même module, `QUEENS_CAMPAIGNS_V188` | Ajoutées à la fin de `CAMPAIGNS` (`content.js`, cible 511) |
| Chapitre déplacé | `src/legacy-operation-state-v131.js` (`worldId`, `legacyWorldIdsV188`) | `operation-receipts-v131.js` : `campaignWorldIdsV188`, identité du reçu comparée au monde du déploiement |
| Sauvegarde | `src/save.js` : `createSideCampaignsV188()` et `normalizeSideCampaignsV188()` | Additif, comme `stationV188` ; aucun autre champ changé |
| Messages | `src/travel-messages-v188.js` : type `campaign`, `pushCampaignTravelMessageV188` | Journal des alertes existant |
| Cinématiques | `src/queens-cinematics-v188.js` (nouveau) | Fusionnées dans `CINEMATICS_V188` ; nouveau type de plan `queens-shot` essayé avant le chemin station dans `drawCinematicFrameV188` |
| Interface | `index.html` (section `#side-campaign-queens-v188`), `src/app.js` | Panneau à la table de briefing ; `queensOnViewV188` après les scènes de la colonie dans `markStoryDebriefOnViewV188` ; verrou au lancement ; résultat dans `finalizeOperation` ; arrivée dans le règlement du saut ; roster passé à `engine.start` |

Ordre de composition du moteur inchangé : aucun mixin ajouté. Le roster est filtré avant `engine.start` (le catalogue fourni au moteur), ce qui laisse `selectEnemyEncounterCatalog` et le registre des comportements tels quels.

## Transactions

- L'appel est enregistré et classé dans le journal par un seul `commitCandidateV188`, avant la cinématique.
- L'arrivée est écrite dans `runTimedMutation` du saut, après `deliverTravelMessagesV188`.
- Le résultat d'une mission est appliqué au candidat de `finalizeOperation`, avant `advanceGalaxy` et l'écriture.
- Choix et scènes : un `commitCandidateV188` chacun.

## Vérification

- `scripts/verify-side-campaign-queens-v188.mjs` (dans `test:priorities:v188`) : données, déplacement du chapitre, sauvegarde, appel, vrai saut, ordre, scènes, choix, compte rendu, rosters (moteur de production), cinématiques, raccordement, catalogue.
- `scripts/qa-side-campaign-queens-v188.mjs` : parcours Chromium (fixtures et injections déclarées en tête).
- Suites partagées : `npm run test:all`, `check`, `build`, `check:built`, `i18n:check`.
