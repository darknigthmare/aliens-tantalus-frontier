# Audit d’implémentation V62

Date du constat : 30 août 2026. Cet audit compare le brief V62 au dépôt local tel qu’il existe à cette date. Il n’assimile ni la présence d’un fichier, ni un test unitaire à une validation visuelle en navigateur ou à une publication.

## Légende

- **VERIFIED** : le contrat est branché dans le runtime et couvert par une preuve automatisée exécutée pendant cet audit.
- **PARTIAL** : le socle fonctionne, mais un écart de contenu, de cohérence visuelle ou de gate finale subsiste.
- **BLOCKED** : aucune preuve fiable ne permet de déclarer l’élément terminé dans ce constat.

## Verdict synthétique

| # | Exigence du brief V62 | Statut | Constat principal |
| ---: | --- | --- | --- |
| 1 | Catalogues hiérarchiques et honnêteté des données | **PARTIAL** | Le contrat runtime/UI est vérifié sur quatre catalogues et 1 099 entrées, mais le périmètre Excel n’est pas intégralement modélisé. |
| 2 | Sauvegarde Frontier Forge indépendante | **VERIFIED** | Namespace, import hérité, playtests et non-mutation de la campagne sont testés. |
| 3 | Audit PNG fond blanc, alpha, halo et grilles | **PARTIAL** | L’audit reproductible ne relève plus aucune erreur sur 401 PNG ; 13 franges restent à revoir visuellement. |
| 4 | Dialogues à embranchements, mémoire et routines PNJ | **VERIFIED** | Les 16 identités disposent de choix conditionnels, mémoire persistante et positions physiques déterministes. |
| 5 | Hub physique : collisions, portes, échelles et profondeur | **VERIFIED** | Les 16 salles, leurs colliders, portes réciproques, verticalités, lifts et états persistants sont couverts par les tests. |
| 6 | Conduits réellement traversables | **VERIFIED** | Entrée, déplacement, branchement, sortie, reprise, IA, tracker et audio reposent sur une position physique sérialisable. |
| 7 | Séquences d’insertion de mission | **VERIFIED** | Briefing, préparation, approche, incident causal, déploiement et prise de contrôle sont interactifs et reprenables. |
| 8 | Ameublement déterministe et cohérent | **PARTIAL** | Le placement auteur est stable et fonctionnel, mais le kit de petits props annoncé P1 empêche encore un verdict commercial final. |
| 9 | Infestation strictement causale | **VERIFIED** | Sans événement d’exposition persistant, aucune crise du Tantalus n’est créée ; la progression et le confinement sont déterministes. |
| 10 | Gates release, navigateur et publication | **PARTIAL** | La QA locale complète passe : 366 tests, 165 modules lintés, audits sprites/PNG et build. La QA navigateur et la publication Vercel restent à attester séparément. |

## 1. Catalogues hiérarchiques — PARTIAL

### Vérifié

- `src/catalog-runtime-v62.js` indexe sans duplication 146 armes, 106 équipements, 568 ennemis et 279 véhicules, soit **1 099 entrées**.
- L’arborescence expose des chemins hiérarchiques, une recherche normalisée, des filtres et des détails séparant explicitement faits de référence et statistiques de gameplay.
- `src/catalog-ui-v62.js` cadre les vignettes à partir des vraies cellules et des clips des plaques existantes ; un visuel manquant reste `null` au lieu d’être remplacé par une image inventée.
- Les dimensions sont absentes tant qu’aucune source vérifiée n’existe. Le comparateur humain refuse une hauteur estimée ou non sourcée.
- Quatre relations biologiques sourcées relient Queen, Ovomorph, Facehugger, Chestburster et Drone / Big Chap ; les variantes générées n’héritent pas artificiellement de ces liens.
- Les tests `catalog-runtime-v62` et `catalog-ui-v62` passent : **18/18**.

### Écart restant

Le bridge `src/excel-content-bridge-v61.js` reste la frontière honnête avec le classeur : son test passe (**3/3**), mais il ne transforme pas tout le tableur en contenu jouable. Le rapprochement V61 compte 19 feuilles et 2 363 entités d’index global. Parmi 14 gaps d’armes suivis, neuf sont reliés à une plaque dédiée ; Harpoon Gun reste sans art, Heavy Pulse Rifle et Plasma Rifle restent ambigus, ES-4 Electroshock Pistol et Compound Bow restent absents. Trois châssis restent bloqués : M570 Series APC, M292 Self-Propelled Artillery et AD-19D Bearcat. Races, rituels, perceptions, flore et personnages canon n’ont toujours pas de registre gameplay de premier niveau. La hiérarchie V62 est donc vérifiée, mais pas l’exhaustivité Excel demandée à l’échelle commerciale.

## 2. Frontier Forge isolé — VERIFIED

- `src/forge-save-v62.js` utilise une clé de stockage distincte de celles des trois profils campagne.
- L’import historique est une copie unique, idempotente et non mutante ; les projets existants du Forge sont préservés.
- Les données importées sont bornées et assainies, et la validation des tuiles est recalculée au lieu de faire confiance au fichier.
- Les playtests mission et vaisseau restent dans le contexte `forge-playtest`. Les surfaces de développement ne sont plus exposées dans la navigation joueur.
- Les migrations campagne restent additives et conservent l’ancien payload éditeur pour compatibilité, sans que le runtime Forge réécrive la campagne.
- Tests Forge V62 : **8/8**.

## 3. PNG, alpha, fond blanc, halo et grilles — PARTIAL

L’outil `scripts/audit-png-alpha-v62.py`, son JSON et son test forment une gate reproductible. Il classe 401 PNG destinés au rendu parmi 649 PNG découverts et sépare les scènes opaques des éléments qui exigent une transparence.

Constats vérifiés :

- aucun PNG composite sans alpha effectif ;
- aucun fond quasi blanc opaque connecté au bord selon le seuil de production ;
- aucune grille incorrecte sur les 191 plaques normalisées ;
- **0 erreur** sur les 401 PNG audités par le dernier rapport machine ;
- les trois fallbacks historiques `tantalus-mission` utilisent désormais un contrat runtime `centered-cover` sur une toile cible **2:1** : le crop est centré, commun aux trois plans et n’étire pas les pixels ;
- les trois PNG sources conservent volontairement leurs dimensions et leur contenu d’origine ; la correction est appliquée au rendu, pas par une réécriture destructive des assets ;
- les trois insertions et le conduit V62 sont de vrais PNG 16:9 en 1672 × 941 ;
- gate ciblée audit + rendu centered-cover : **9/9**.

Écart restant :

- 13 assets sont des candidats de halo, ce qui nécessite une comparaison visuelle sur fonds clair et sombre avant correction ; ce signal n’est pas déclaré automatiquement comme bug.

Le statut reste **PARTIAL uniquement pour cette revue visuelle des 13 halos potentiels**. Le détail fichier par fichier et les compteurs machine demeurent dans `docs/references/V62_PNG_ALPHA_AUDIT.md` et son JSON associé.

## 4. Dialogues, mémoire et routines PNJ — VERIFIED

- `src/npc-dialogue-v62.js` couvre exactement les 16 membres d’équipage / PNJ physiques existants.
- Les conversations distinguent première rencontre et répétitions, proposent des choix conditionnels et prennent en compte confiance, blessures, stress, mission, crise et infestation.
- Les effets sont sérialisables, idempotents et limités au ledger prévu ; la migration des anciennes interactions est additive et bornée.
- Chaque PNJ résout une station, une route, un travail, une pause et une réponse d’alerte déterministes. Les affectations mission et l’hospitalisation modifient réellement la destination physique.
- `hub.dialogueMemory` et `hub.npcRoutineState` sont persistés ; un snapshot identique n’enfle pas le journal.
- Tests dialogue/routines V62 : **8/8** ; l’intégration hub valide en plus les 16 résolutions physiques.

## 5. Hub physique — VERIFIED

Le V62 étend le niveau auteur existant au lieu de remplacer le vaisseau par un menu. Les preuves automatisées couvrent :

- quatre ponts et 16 salles avec profils mesurés ;
- un collider de prop auteur par salle et des bornes partagées entre rendu et collision des portes ;
- cinq portes runtime par pont, destinations réciproques entre les 16 salles et deux puits d’ascenseur ;
- approches praticables aux deux extrémités des échelles ; un lift est une plateforme mobile, jamais une fausse échelle ;
- topologie auteur sans sol de secours universel, limites horizontales et vide dérivés du plan ;
- sauvegarde des verrous événementiels, dangers actifs, crise et position ;
- sens des ennemis calculé depuis leur source réelle.

La suite physique/cohérence exécutée pendant cet audit passe : **39/39**. La vérification comportementale en navigateur reste toutefois une gate de release distincte, décrite au point 10.

## 6. Conduits — VERIFIED

- `src/vent-network-v62.js` fournit un réseau hub et trois réseaux mission auteur : vaisseau, colonie et extérieur planétaire.
- Les quatre types de bouche sont modélisés, avec validation des nœuds orphelins, références pendantes, sorties inaccessibles et destinations inutilisables.
- Entrée, mouvement, choix de branche, sélection de sortie et sortie sont des phases physiques séparées. Une entrée hors portée est refusée et aucune transition ne téléporte instantanément l’acteur.
- `ventTransitV62` conserve le segment, la progression et l’entité à travers une sérialisation JSON et une reprise.
- Les routes alliées et ennemies respectent leurs autorisations. Tracker et audio suivent la position interpolée dans le conduit.
- Le hub consomme le bitmap dédié `tantalus-duct-interior-v62.png` ; tests conduits et intégration hub : **13/13**.

## 7. Insertion de mission — VERIFIED

- `src/mission-insertion-v62.js` construit une suite déterministe : briefing, préparation, approche, incident seulement s’il possède une cause mission existante, déploiement, puis contrôle joueur.
- Les approches dropship, APC et à pied disposent chacune d’un bitmap dédié consommé par le runtime.
- Chaque phase possède une action réelle et des hooks audio, caméra et objectif. Une action hors séquence est rejetée.
- Pause, progression, retour au planning et reprise conservent exactement phase et avancement.
- `Skip` est refusé à la première lecture et n’est disponible qu’après un reçu de lecture complet persistant.
- Tests logique, UI et art d’insertion : **14/14**.

## 8. Ameublement et cohérence — PARTIAL

Le socle n’est pas aléatoire : chaque salle possède un FAR fonctionnel, un MID transparent, des couches foreground / overhead, un prop fonctionnel et des listes de traversée auteur. Les 16 coques intermédiaires, 16 fonds FAR et profils de salles sont validés ; la baie véhicules possède un M577 bitmap autonome, physique et interactif. Les missions emploient également des props et topologies auteur, sans placement de sol de secours universel.

`docs/V61_LEVEL_DESIGN_AUDIT.md` conserve explicitement le **kit de petits props supplémentaires en P1** ; le dépôt n’apporte pas encore une gate V62 attestant une densité et une variété finales par salle. C’est la seule raison maintenue ici pour empêcher le statut VERIFIED au niveau « commercial complet ».

Le placement auteur et la jouabilité sont vérifiés, mais la finition d’ameublement et la cohérence visuelle finale restent partielles.

## 9. Infestation causale — VERIFIED

- `src/infestation-chain-v62.js` exige une source reconnue : retour cargo, évacuation, spécimen vivant, épave, équipement contaminé, brèche, intrusion synthétique ou échantillon pathogène.
- Sans chaîne causale enregistrée, `deriveCausalHubCrisisV62` ne produit aucune crise. L’avance de temps peut faire progresser une exposition existante, mais ne crée pas seule l’exposition initiale.
- La chaîne passe par exposition, anomalie, indices, confirmation, confinement et infestation ; preuves, systèmes et actions de confinement déterminent le résultat.
- La crise physique n’apparaît qu’au stade infestation après échec du confinement. Le HUD masque source, emplacement et nombre exact tant que le niveau de preuve est insuffisant.
- Les événements sont idempotents et sérialisables ; `world-crisis.js` désactive la génération legacy de crise lors de la simulation de base puis demande la progression V62.
- Tests de chaîne causale : **5/5**.

## 10. Gates de release — PARTIAL

### Vérifié pendant cet audit

- suite ciblée V62 : **72/72** ;
- suite physique, topologique et de cohérence : **39/39** ;
- bridge Excel : **3/3** ;
- gate corrective PNG + centered-cover : **9/9** ;
- total distinct exécuté pour ce document : **122 tests, 122 réussites, 0 échec** ; le test PNG de la gate corrective avait déjà été compté dans les 72 tests V62 ;
- QA complète `npm.cmd run qa` : **PASS** ;
- suite globale `npm.cmd test` : **366 tests, 366 réussites, 0 échec** ;
- lint : **165 modules** ;
- manifeste sprites V61 : **191 atlas / 2 708 cellules** ;
- audit PNG V62 : **401 PNG runtime, 0 erreur, 13 candidats halo à revue visuelle, 229 masters raw exclus par règle** ;
- build : **3 443 entrées catalogue** ;
- version produit déclarée `62.0.0` ;
- cache PWA `atf-v62-runtime-1` et fermeture ESM / assets V62 couverts par le contrat hors-ligne ciblé ;
- le build exclut contractuellement les masters `raw` de production sans supprimer leurs sources de travail.

### Non attesté dans ce document

- **QA navigateur `npm run qa:browser:v62` : BLOCKED / non exécutée ici.** Les tests DOM synthétiques ne remplacent pas une session visuelle et jouable à 1280 × 720, mobile et manette.
- **Déploiement Vercel, URL publique et HTTP 200 : BLOCKED / aucune preuve collectée ici.**
- **Commit et push GitHub de la V62 : BLOCKED / aucune preuve collectée ici.**

La V62 dispose donc d’un socle automatisé substantiel, mais ne doit pas être déclarée « release commerciale vérifiée » avant réussite de la QA navigateur, publication GitHub/Vercel, vérification HTTP publique et revue des écarts PNG / ameublement.

## Commandes de reproduction

```powershell
node --test tests/catalog-runtime-v62.test.mjs tests/catalog-ui-v62.test.mjs tests/forge-save-isolation-v62.test.mjs tests/forge-runtime-isolation-v62.test.mjs tests/png-alpha-audit-v62.test.mjs tests/npc-dialogue-v62.test.mjs tests/hub-v62-runtime.test.mjs tests/vent-network-v62.test.mjs tests/mission-insertion-v62.test.mjs tests/mission-insertion-ui-v62.test.mjs tests/mission-insertion-art-v62.test.mjs tests/infestation-chain-v62.test.mjs tests/pwa-offline-contract.test.mjs tests/ui-v51-contract.test.mjs
node --test tests/hub.test.mjs tests/hub-gameplay-v51.test.mjs tests/hub-v52-runtime.test.mjs tests/hub-proportions-v53.test.mjs tests/hub-art-runtime-v58.test.mjs tests/topology-coherence-v58.test.mjs tests/mission-physical-topology-v57.test.mjs tests/asset-runtime-inventory-v53.test.mjs
node --test tests/excel-content-bridge-v61.test.mjs
node --test tests/png-alpha-audit-v62.test.mjs tests/mission-level-runtime-v52.test.mjs
py scripts/audit-png-alpha-v62.py --fail-on error
npm.cmd run qa
```
