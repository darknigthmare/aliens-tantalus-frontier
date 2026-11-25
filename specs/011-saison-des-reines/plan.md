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

## Second lot (arcs 2 et 3, 2026-11-23)

| Élément | Fichier | Raccordement |
| --- | --- | --- |
| Monde TR-0 | `src/content-core-v50.js` : `GENERATED_WORLDS` (64, inchangés, indexés par les générateurs) et `TR0_WORLD_V188` ; `WORLDS = [...GENERATED_WORLDS, TR0_WORLD_V188]` | `save.js` crée et migre son état comme pour tout monde ; `hiddenUntilV188` lu par `world-crisis-core.js`, `world-crisis.js`, `save.js` (déblocages génériques) et par `renderGalaxy` via `queensWorldHiddenV188` |
| Arcs | `src/side-campaign-queens-v188.js` : table `QUEENS_ARCS_V188` (monde, ordre, annexes, contrats, clé d'arrivée) ; verrous, résultats, scènes, comptes rendus et panneau écrits une fois pour les trois arcs | Mêmes points d'appel d'`app.js` que le premier lot |
| Routes | `syncQueensRoutesV188` : appelé dans la transaction du choix de Rask et du résultat de mission ; à la table de briefing pour une sauvegarde du premier lot | `galaxy.unlockedWorldIds` |
| Chapitres | `src/legacy-operation-state-v131.js` (Broodstorm), `src/ecosystem-missions-v131.js` (Reine-Mère, Ruche-monde) : `worldId` et `legacyWorldIdsV188` | Contrôle du reçu inchangé (`campaignWorldIdsV188`) |
| Crise de l'œuf | `startQueensEggCrisisV188`, `resolveQueensEggCrisisV188`, `reconcileQueensEggCrisisV188` reçoivent `createHubCrisis` de l'appelant | `app.js` : transaction du saut (après l'arrivée), table de briefing (différé, rechargement), gestionnaire `crisis:*` du hub après `resolveHubCrisisEvent`. `story-campaign-v188.js` (Interlude) n'est pas modifié |
| Quêtes | `src/queens-crew-quests-v188.js` (nouveau) ajouté à `CREW_QUESTS_ALL_V188` | Conversation du hub et panneau des quêtes existants ; `crewQuestDoneV188` ouvre le bestiaire du panneau |
| Outils de développement | `devtools/dev-fixtures-v188.js` (`queensArc`, `queensJump`, `queensSeen`), `devtools/dev-catalog-v188.js` | Entrées générées depuis `QUEENS_ARCS_V188` |

Ordre de composition du moteur toujours inchangé : aucun mixin ajouté, les rosters sont filtrés avant `engine.start`.

## Vérification

- `scripts/verify-side-campaign-queens-v188.mjs` (dans `test:priorities:v188`) : données des trois arcs, déplacement des quatre chapitres, monde TR-0 (additif, caché, jamais ouvert par les déblocages génériques), sauvegarde, appel, vrais sauts, ordre et rejouabilité des chapitres, scènes, choix, comptes rendus et fin, crise de l'œuf par l'API du hub, rosters des lignées (moteur de production), cinématiques, quêtes, raccordement, catalogue.
- `scripts/verify-dev-tools-v188.mjs` : chaque entrée du lanceur produit une sauvegarde valide ; états des arcs 2 et 3.
- `scripts/qa-side-campaign-queens-v188.mjs` : parcours Chromium (fixtures et injections déclarées en tête).
- Suites partagées : `npm run test:all`, `check`, `build`, `check:built`, `i18n:check`.
