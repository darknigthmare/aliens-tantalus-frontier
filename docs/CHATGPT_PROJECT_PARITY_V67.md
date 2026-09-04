# Parité du projet ChatGPT « Aliens tantalus project » — V67

Date de l'audit : 4 septembre 2026.

Source inspectée : projet ChatGPT `g-p-6a945bfa0d3c8191befd9a84068b90a4`, contenant exactement les 19 conversations listées ci-dessous. L'état est évalué contre le runtime, l'interface et les tests présents dans le dépôt, pas contre les réponses textuelles des conversations.

## Règle de preuve

Une promesse n'est **pas** considérée comme implémentée parce qu'elle possède un texte, une fiche, un nombre dans un catalogue, un objectif générique, un bouton sans boucle jouable, un asset non branché ou une infrastructure partagée.

Le statut `IMPLÉMENTÉ` exige simultanément :

1. un accès joueur réel depuis l'interface publiée ;
2. une boucle jouable propre à la promesse, avec états et actions physiques ;
3. des conditions de victoire et d'échec ;
4. une sauvegarde/reprise sans rejouer les événements consommés ;
5. les assets dédiés effectivement chargés par le runtime ;
6. des tests du parcours complet et une vérification visuelle quand l'image ou le level design est concerné.

`PARTIEL` signifie qu'un sous-système fonctionnel existe mais que la promesse complète n'est pas livrée. `MANQUANT` signifie qu'il n'existe aucune mission dédiée accessible, même si un socle générique voisin est présent.

## Constat transversal

Le socle V67 recense désormais les 19 conversations dans `src/special-operations-v67.js` et ajoute une première route de mission spéciale à `CAMPAIGNS` sans modifier les 206 paires MIRE/Frontier : **CARGO BRUTAL** (`special-cargo-brutal`). Le mixin `src/cargo-brutal-runtime-v67.js` spécialise le moteur de production et le lanceur force son insertion à pied. Les 18 autres promesses restent non jouables ou seulement couvertes par des sous-systèmes partagés. Le compilateur conserve par ailleurs trois familles de niveau : vaisseau, colonie et extérieur planétaire (`src/mission-levels-v52.js:17-20`).

Conséquence vérifiable selon la règle commerciale stricte ci-dessus : **0 conversation entièrement validée, 10 partielles, 9 manquantes**. CARGO BRUTAL est la seule boucle désormais jouable et son registre technique la classe `effective`. Ses props et ses trois survivants possèdent maintenant deux atlas dédiés, branchés et testés ; elle reste néanmoins **PARTIELLE dans cet audit commercial** tant que la Matriarche dédiée et la QA visuelle complète en situation ne sont pas validées. Les noms propres encore absents ou incomplets comprennent notamment Éloïse, Jeri/Jerry, P-9000, TALOS, Z-110, MANTA-6, BIOFORGE et Broodstorm.

## Inventaire exact des 19 conversations

| # | ID ChatGPT | Titre exact du chat | Promesse de production | Statut actuel | Preuves et écart matériel |
|---:|---|---|---|---|---|
| 1 | `6a99e9b5-a7fc-83eb-96bc-b53baa1b9cbe` | Mission moteur queen | **LE CHANT DE LA REINE-MÈRE** : influence maternelle, trois chœurs, route royale, nursery et Queen Mother multi-phase. | **MANQUANT** | Le moteur sait sélectionner une créature royale comme boss, sans cette mission ni ses jauges/phases (`src/game-v51-runtime.js:251-275`, `src/game-v51-runtime.js:448-472`). |
| 2 | `6a99eb43-9ebc-83eb-868c-1c56f918e531` | Mission Godzilla Planète | **LV-XENO / LA RUCHE-MONDE** : planète vivante, biomes-organes, alerte, boss internes et Planet Queen. | **MANQUANT** | Le template planétaire est un extérieur générique à six zones ; aucun monde-organisme ou organe jouable (`src/mission-levels-v52.js:275-349`). |
| 3 | `6a99eaec-f4a4-83ed-a3ea-88db3c94413a` | Mission contre Xenomorph Godzilla | Combat égalitaire **P-9000/TALOS contre Xeno Titan**, systèmes de chaleur/énergie/corrosion et arène destructible. | **MANQUANT** | L'exosuit ne fournit qu'une locomotion générique, un saut et un impact (`src/game-final-runtime.js:42-48`, `src/game-final-runtime.js:499-581`). Aucun P-9000, TALOS ou Titan. |
| 4 | `6a99e94f-ef7c-83ed-a229-7d42b85b6222` | Étendre la liste des collectables | PDA, e-mails, journaux audio/vidéo, boîtes noires, preuves physiques, enquêtes, chaînes contradictoires et déblocages Metroidvania. | **PARTIEL** | Une boîte noire générique mène à un terminal qui donne seulement `+3 intel` (`src/game-complete-core.js:8-18`, `src/game-v51-runtime.js:1401-1408`). Les drops ne gèrent que salvage et munitions (`src/game-v51-runtime.js:981-989`). Aucun PDA, courrier ou lecteur média. |
| 5 | `6a99e7de-0d14-83eb-9074-0cc76c50989b` | Étendre coopération équipe Marines | Équipes Alpha/Bravo, rôles, ordres, pings, formations, réservations/binômes, contre-mécaniques, ressources, blessures, réanimation, stress et cohésion. | **PARTIEL** | Coop locale, rôles, formation automatique et réanimation existent (`src/game-v51-runtime.js:617-622`, `src/game-v52-runtime.js:243-351`, `src/game-v52-runtime.js:1667-1808`). Il manque Alpha/Bravo, ordres, pings, binômes, réservation de tâches et cohésion dynamique. |
| 6 | `6a99b3d2-0e58-83eb-abba-d955b5d73b2d` | Écrire une mission xénomorphe | **ÉLOÏSE : LA REINE SANS COURONNE** : conscience humaine/hybride/ruche, jauge de chœur, carte transformée, pylônes, HUSH-6, boss et fins divergentes. | **MANQUANT** | Le Neuro-Xeno générique possède signal, stabilité et mode d'échec (`src/advanced-systems-core.js:101-152`), mais aucun personnage Éloïse, scénario, pylône, chœur ou branche finale. |
| 7 | `6a99b4e6-45f4-83eb-bdae-5b3ad2e57833` | Créer mission préhistorique | **PANGAEA : LA SECONDE EXTINCTION** : dinosaures sains/infectés, intégrité d'écosystème, sept castes Sauria-XX121, biomes et boss. | **MANQUANT** | Aucun dinosaure, Sauria-XX121 ou système d'écosystème dans le code. Les zones extérieures restent génériques (`src/mission-levels-v52.js:330-349`). |
| 8 | `6a9981b6-ec38-83eb-bcaf-eea1783e448f` | Créer mission Alien Queen | **A.T.A.X.-Q : LA FAUSSE REINE** : armure de Reine, ressources royales, recrutement et contrôle direct de castes, ordres Griffe/Ombre/Rempart. | **MANQUANT** | Des profils Neuro-Xeno et un équipement Ripper Xenoarmor sont catalogués (`src/content-core-v50.js:200-203`, `src/content-core-v50.js:430-440`), sans recrutement, ordres, ressources ou mission A.T.A.X.-Q. |
| 9 | `6a999dca-3efc-83eb-907a-623f11cf2388` | Proposer mécaniques HUD Alien | HUD contextuel, auto-destruction, couverture, chalumeau/soudure, tracker, pression/sas, reroutage, terminaux/CCTV, acide persistant, synthétiques et commandes d'escouade. | **PARTIEL** | HUD, couverture simple et tracker sont jouables (`src/game-v51-runtime.js:729-739`, `src/game-v51-runtime.js:1230-1245`, `src/game-v51-runtime.js:2146-2185`). Le chalumeau ouvre seulement un conduit (`src/game-v51-runtime.js:1412-1423`). Auto-destruction, portes soudées, pression par salle, CCTV, réseau électrique, acide persistant et ordres manquent. |
| 10 | `6a999847-94b4-83ed-af17-c3b6b57da810` | Mission avec Jerry synthétique | **JERI : LE FAUX FILS** : dissonance de ruche, profils phéromonaux, inspections de castes, corps synthétique segmenté, routes de ruche et boss SAINT. | **MANQUANT** | Il existe uniquement l'objectif générique `recover-synthetic` et un nœud de récupération (`src/game-complete-core.js:18`, `src/game-complete-core.js:106-124`). Aucun Jeri/Jerry ni système promis. |
| 11 | `6a99988b-90c4-83ed-a4f6-0462baed528f` | Mission sous marine complète | **OPÉRATION ABYSSE NOIR** : nage libre, combinaison M-17 HADAL, sous-marin MANTA-6, arsenal, castes aquatiques et deux niveaux de boss. | **PARTIEL** | Le véhicule maritime gère déplacement horizontal, profondeur et immunité à l'inondation (`src/game-final-runtime.js:42-48`, `src/game-final-runtime.js:531-535`, `src/game-final-runtime.js:595-610`). Aucun nageur libre, HADAL, MANTA-6, arsenal ou mission dédiée. |
| 12 | `6a98fa78-6db8-83eb-bc72-cf41bc6833b1` | Audit du level hub USS Tentalus | Corriger échelle/perspective/éclairage des 16 salles et ajouter dix annexes : sas d'arrivée, logistique, archives MIRE, baie synthétique, CCTV, terrain d'essai, morgue, pods, DURANDAL et BIOFORGE. | **PARTIEL** | Les 16 salles sont physiques, profilées et réparties sur quatre ponts (`src/hub-game.js:163-214`), avec FAR/MID et traversées dédiées (`src/hub-art-runtime-v58.js:8-70`, `src/hub-v51-runtime.js:227-319`). Aucune des dix annexes n'existe ; le kit de petits props reste explicitement incomplet (`docs/V62_IMPLEMENTATION_AUDIT.md:114-118`). |
| 13 | `6a98c871-61ac-83ed-be5c-600c473690e2` | Idée spawn ennemis Tentalus | **BIOFORGE** : zone isolée physique, terminal ennemi+quantité, plaques dédiées, impression, confinement inviolable et progression séparée. | **MANQUANT** | Le catalogue expose 571 menaces (`index.html:149-154`) et la Quarantaine existe (`src/hub-game.js:194`), mais aucune salle BIOFORGE, imprimante ou sélection quantité/ennemi. La capture générique sous 25 % ne constitue pas BIOFORGE (`src/game-complete-core.js:218-229`). |
| 14 | `6a98dfeb-7284-83eb-a015-bf964b8b1229` | Mission extermination Power Loader | **PROTOCOLE Z-110** : quatre variantes Atlas/Vulcain/Cerbère/Méduse, systèmes hydrauliques/thermiques/givre/cockpit, choix de ruche et Reine Morrigan. | **MANQUANT** | Seul le socle exosuit commun existe (`src/game-final-runtime.js:48`, `src/game-final-runtime.js:536-550`). Aucun Z-110, variante, système de dégâts localisé ou Morrigan. |
| 15 | `6a98e050-1748-83eb-8c5b-a7dd4bc1ac26` | Mission Alien 1 | **MIRE Archive 001 — Nostromo** : relecture jouable d'Alien 1, équipage, Derelict, quarantaine, Order 937, auto-destruction, Narcissus et score de synchronisation historique. | **PARTIEL** | Alien 1979 et l'USCSS Nostromo sont des entrées de catalogue (`src/content-core-v50.js:60`, `src/content-core-v50.js:106-111`). Les paires MIRE/Frontier et leur déblocage fonctionnent (`src/content-core-v50.js:120-141`, `src/campaign-consequences.js:54-97`), mais aucun scénario, casting, événement canonique ou score de synchronisation dédié. |
| 16 | `6a98d47d-68f4-83eb-9ed3-4063af4e7496` | Mission aérienne xéno | **BROODSTORM** : dropship modulaire, avions alliés, castes volantes, aile stratégique, escortes/bombardements/extractions et Flying Queen. | **PARTIEL** | Le vol horizontal/vertical et l'UD-4L sont jouables (`src/game-final-runtime.js:44`, `src/game-final-runtime.js:499-530`) et l'insertion reconnaît un véhicule aérien (`src/mission-insertion-v62.js:119-138`). Aucun mode stratégique aérien, escorte, caste volante ou Flying Queen. |
| 17 | `6a98e0e1-2b98-83eb-9cd4-e9772768b977` | Mission extraction du Hive | **COCON NOIR** : réveil coconné/blessé, semi-infiltration, récupération du matériel, survivants, œufs/Facehuggers, deux routes, fausse extraction et retour en quarantaine. | **PARTIEL** | Le cycle Ovomorph→Facehugger est réel (`src/enemy-ovomorph-cycle-v66.js:122-191`, `src/enemy-facehugger-combat-v65.js:183-228`) et l'évasion de quarantaine possède une limite de temps (`src/game-complete-core.js:24`, `src/game-complete-core.js:173-177`). Le départ, la récupération, les survivants, les routes et la fausse extraction manquent. |
| 18 | `6a98d3ea-99ac-83ed-b765-6932483ddbe1` | Mission APC contre Xenos | **LA DERNIÈRE COURSE DE TANTALUS** : APC maintenu à droite, hordes à gauche, voies, frein/overdrive, armements, réparation, Crushers, poursuite de Reine, score/endless/coop. | **PARTIEL** | L'APC possède déplacement, carburant, frein, collision, éperonnage, tourelle et coque (`src/game-v51-runtime.js:746-792`, `src/game-v51-runtime.js:1131-1194`, `src/game-v51-runtime.js:1324-1328`). Il manque la structure de course, les voies, la horde, les boss, le score et l'endless. |
| 19 | `6a98dfcb-a2e4-83ed-b3c2-606a9384c6e4` | Mission Power Loader | **CARGO BRUTAL** : départ à pied, activation du Loader, manipulation physique de cargo, escorte, transport de module lourd et Matriarche cargo. | **PARTIEL — BOUCLE JOUABLE** | La campagne `special-cargo-brutal` est exposée par le registre V67 et démarre à pied. Le runtime dédié enchaîne remise sous tension, montée dans le P-5000, trois obstacles physiques, escorte avec intégrité et vagues, port du noyau avec mobilité réduite, Matriarche en trois phases, extraction, échecs Loader/convoi et reprise sérialisée (`src/cargo-brutal-runtime-v67.js`, `tests/cargo-brutal-v67.test.mjs`). Un atlas dédié rend les huit états de props et un second garde les identités exactes de Shaw, Ruiz et Kessler sans emprunter un PNJ historique (`src/cargo-brutal-visuals-v67.js`, `tests/cargo-brutal-art-v67.test.mjs`). Le statut commercial reste PARTIEL : la plaque Matriarche a été rejetée et la QA visuelle complète du level design/HUD reste requise (`docs/V67_CARGO_BRUTAL_ART_QA.md`). |

## Détail des dettes transversales prioritaires

### Collectables narratifs

La chaîne d'infestation stocke des preuves abstraites `id/type/label/confidence/date/source`, sans contenu, média, auteur, relation ni contradiction (`src/infestation-chain-v62.js:94-104`). Son ajout public existe (`src/infestation-chain-v62.js:237-249`), mais le runtime de mission ne crée pas de collecte physique correspondante. Il faut un registre de documents, des instances placées dans les niveaux, un lecteur, une persistance par entrée et des effets de progression.

### Coopération tactique

Le stress et la fatigue modifient l'efficacité initiale des rôles (`src/game-v52-runtime.js:282-295`) ; la « cohésion » actuelle est seulement un multiplicateur fixe si un diplomate est présent (`src/game-v52-runtime.js:516-518`, `src/game-v52-runtime.js:1741-1745`). Les compagnons choisissent automatiquement leur action (`src/game-v52-runtime.js:1417-1456`, `src/game-v52-runtime.js:1667-1708`). Il faut donc un état d'ordre, des fireteams Alpha/Bravo, des pings, des formations choisies et une réservation déterministe des tâches/interactions.

### Systèmes Alien

- portes : simple booléen ouvert/fermé (`src/game-v51-runtime.js:1425-1433`) ;
- énergie : un seul nœud passe instantanément à `active` (`src/game-v51-runtime.js:1392-1399`) ;
- pression : oxygène et dégâts de vide globaux, sans volume de salle ni égalisation (`src/game-final-runtime.js:598-629`) ;
- acide : le projectile disparaît à l'impact, sans flaque persistante ni corrosion du décor (`src/game-v51-runtime.js:960-978`) ;
- CCTV et auto-destruction : aucun système runtime trouvé.

## Ordre de production recommandé

Cet ordre minimise les réécritures. Chaque ligne reste ouverte jusqu'aux six preuves de la règle d'implémentation.

0. **Socle Special Operations V67** — registre des 19 opérations, route UI, contrat de runtime spécialisé, sauvegarde/reprise, victoire/échec et télémétrie de validation.
1. **Cargo Brutal** (`6a98dfcb…`) — boucle Loader, props et survivants dédiés jouables/testés ; produire une plaque Matriarche acceptable, effectuer la QA visuelle complète du level design/HUD puis valider l'accès joueur publié avant de passer à `IMPLÉMENTÉ`.
2. **Dernière Course de Tantalus** (`6a98d3ea…`) — réutiliser le contrat véhicule spécialisé et ajouter voies/horde/boss/score.
3. **Collectables étendus** (`6a99e94f…`) — fondation narrative commune à MIRE, Jeri, Éloïse et Cocon Noir.
4. **HUD et systèmes Alien** (`6a999dca…`) — portes, soudure, pression, énergie, CCTV, acide et auto-destruction.
5. **Coop Marines Alpha/Bravo** (`6a99e7de…`) — commandes, pings, réservations et cohésion dynamique utilisables par toutes les missions suivantes.
6. **USS Tantalus — annexes** (`6a98fa78…`) — produire les dix zones physiques, portes, props et raccords.
7. **BIOFORGE** (`6a98c871…`) — construire l'annexe isolée sur les registres ennemis et la quarantaine validés.
8. **MIRE Archive 001 — Nostromo** (`6a98e050…`) — premier scénario historique artisanal et test du score de synchronisation.
9. **Cocon Noir** (`6a98e0e1…`) — exploiter collectables, pression/sas, œufs et équipement progressif.
10. **Jeri : Le Faux Fils** (`6a999847…`) — ajouter phéromones, inspections et corps synthétique segmenté.
11. **Éloïse : Reine sans couronne** (`6a99b3d2…`) — étendre Neuro-Xeno vers chœur, carte mutable et embranchements.
12. **A.T.A.X.-Q : Fausse Reine** (`6a9981b6…`) — recrutement de castes, ordres et ressources royales.
13. **Opération Abysse Noir** (`6a99988b…`) — nage, HADAL, MANTA-6, armes et castes aquatiques.
14. **Broodstorm** (`6a98d47d…`) — combat aérien, alliés, mission stratégique et Flying Queen.
15. **Protocole Z-110** (`6a98dfeb…`) — dégâts localisés, quatre variantes et Morrigan.
16. **P-9000/TALOS contre Xeno Titan** (`6a99eaec…`) — combat de grande échelle construit sur le mecha validé.
17. **Chant de la Reine-Mère** (`6a99e9b5…`) — influence, chœurs et boss royal multi-phase.
18. **Pangaea : Seconde Extinction** (`6a99b4e6…`) — simulation d'écosystème et roster Sauria.
19. **LV-XENO / Ruche-Monde** (`6a99eb43…`) — dernier lot, car il dépend du streaming de monde vivant, des boss géants et de plusieurs biomes spécialisés.

## Gate de mise à jour du registre

Une ligne ne peut passer de `MANQUANT` à `PARTIEL` que lorsqu'un accès ou une mécanique dédiée entre réellement dans le runtime. Elle ne peut passer de `PARTIEL` à `IMPLÉMENTÉ` qu'après : tests de boucle complète, test de reprise, assets branchés, contrôle visuel, build de production et vérification de l'accès joueur. Tout échec conserve le statut antérieur avec l'écart documenté.
