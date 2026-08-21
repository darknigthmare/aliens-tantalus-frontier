# Architecture v51 — gameplay effectif

## But

La v51 transforme le projet en une boucle où les catalogues alimentent des décisions, des entités et des conséquences. La règle d'architecture est simple : une donnée n'est considérée comme du gameplay que si elle atteint un consommateur runtime, produit un changement observable et peut être vérifiée par un test.

Cette architecture sépare volontairement :

- les données exhaustives du projet ;
- leurs adaptateurs systémiques ;
- les scènes jouables mission/hub ;
- la simulation stratégique persistante ;
- les assets artisanaux effectivement disponibles.

Elle évite ainsi de présenter 568 fiches ennemies comme 568 IA uniques ou 800 graines comme 800 niveaux faits à la main.

## Carte des composants

```text
index.html
  -> src/app.js
       |-> src/content.js -> src/content-core-v50.js
       |-> src/save.js
       |-> src/advanced-systems.js -> src/advanced-systems-core.js
       |-> src/world-crisis.js -> src/world-crisis-core.js
       |-> src/campaign-consequences.js
       |-> src/hub-v51-runtime.js -> src/hub-game.js
       |-> src/editor.js
       `-> src/game-production-runtime.js
            -> src/game-production-core.js
               -> src/game-production-resume.js
                  -> src/game-production-base.js
                     -> src/game-final-runtime.js
                        -> src/game-complete.js
                           -> src/game-complete-core.js
                              -> src/game-runtime.js
                                 -> src/game-v51-runtime.js
```

Le shell public `index.html` charge `styles.css` et `src/app.js`. Cette application importe le runtime mission public `src/game-production-runtime.js` et le hub `src/hub-v51-runtime.js`; les artefacts candidats d’intégration ont été retirés du chemin de production après promotion.

## Source de données et contrats

`src/content-core-v50.js` conserve le contrat additif précédent. `src/content.js` le réexporte et ne change que l'enveloppe de release v51. Les compteurs validés sont :

| Catalogue | Entrées |
| --- | ---: |
| Mondes | 64 |
| Campagnes | 436 |
| Armes | 146 |
| Équipements | 106 |
| Ennemis | 568 |
| Véhicules | 279 |
| Dossiers Apex | 244 |
| Profils Neuro-Xeno | 234 |
| Membres d'équipage | 16 |
| Costumes | 392 |
| Modules de vaisseau | 158 |
| Graines de niveau | 800 |

`validateContent()` reste la barrière d'intégrité : identifiants, relations campagne/monde, paires MIRE/Frontier et volumes attendus doivent être valides avant le boot.

## Boucle stratégique persistante

La boucle complète suit cette séquence :

```text
décision de commandement
  -> coût + risque + temps
  -> simulation des mondes
  -> éventuelle crise du Tantalus
  -> recherche / achat / modules / escouade / véhicule
  -> plan d'opération
  -> niveau mission
  -> résultat mission
  -> conséquence campagne MIRE/Frontier
  -> monde + équipage + vaisseau + ressources
  -> sauvegarde schéma 51
```

### `src/save.js`

Ce module possède les mutations stratégiques de base :

- cinq actions de commandement avec coût, durée et risque ;
- cinq projets de recherche qui changent les devis, risques ou résultats ;
- achat puis équipement d'armes et d'équipements ;
- acquisition et sélection de véhicule ;
- sélection d'une escouade de quatre membres, soins individuels et costume actif ;
- préparation, lancement, drapeaux de mission et résolution d'opération ;
- migration additive et trois profils locaux ;
- persistance sanitisée de `strategy.currentOperation.resumeState` et reprise du manifeste réellement lancé ;
- récupération industrielle et récupération de mission qui remettent du carburant dans l'économie.

`beginOperation` est la frontière transactionnelle : il vérifie l'escouade, les ressources et la disponibilité, paie le déploiement, avance le temps et crée `strategy.currentOperation`. `resolveOperation` transforme ensuite succès, échec ou extraction en ressources, fatigue, stress, blessures, statut d'équipage et historique.

### `src/advanced-systems*.js`

Ces modules portent :

- installation, charge électrique, intégrité, dégâts et réparation des 159 modules ;
- sélection d'un dossier Apex et résolution de sa cible ;
- sélection d'un profil Neuro-Xeno compatible ;
- modèle de signal, difficulté de contrôle et mode d'échec ;
- diplomatie temporisée qui vérifie route et opération active, avance l'horloge, applique une transaction monde/faction unique puis conserve un cooldown par monde.

Les effets de modules utilisent un vocabulaire fermé. Ajouter un nouvel effet exige d'abord un consommateur puis un test de catalogue.

### `src/world-crisis*.js`

La simulation avance les quatre états persistants de chaque monde : stabilité, infestation, quarantaine et population. Elle crée des alertes, ouvre des routes sous conditions et calcule une pression de crise depuis les mondes et les systèmes du Tantalus.

Trois incidents sont jouables dans le hub : xénomorphe, synthétique et pathogène. Une résolution ou un `player-down` modifie systèmes, ressources, stress, blessures et intégrité des modules. L'identifiant de crise empêche d'appliquer deux fois les mêmes conséquences.

### `src/campaign-consequences.js`

Les seize objectifs possèdent un contrat de conséquence. Pour les 218 paires :

- réussir une opération MIRE conserve l'archive et débloque son pendant Frontier ;
- résoudre ensuite Frontier détecte l'archive correspondante et applique son bonus ;
- une défaite inverse les deltas de stabilité/infestation et crée une alerte critique.

Les conséquences sont spécifiques au type d'objectif, au mode et au monde, mais restent systémiques plutôt que scénarisées à la main 436 fois.

## Runtime mission en couches

### 1. `src/game-v51-runtime.js` — simulation physique

Le noyau gère :

- boucle Canvas, caméra, hitboxes et collisions ;
- déplacement, saut, accroupissement, échelles, ascenseurs et conduits ;
- tir, projectiles, armure, santé, chargeur, rechargement et munitions ;
- couverture, tracker, portes, terminal d'alimentation, archive, boss et extraction ;
- coop locale, état à terre, réanimation, checkpoint et redémarrage ;
- véhicule de base avec coque, carburant, tourelle et collision ;
- compilation des treize tuiles Forge en mission ;
- consommation des plaques de sprites normalisées.

### 2. `src/game-runtime.js` — adaptateurs de catalogue

Cette couche traduit une fiche de contenu en contrat utilisable :

- arme : dégâts, cadence, chargeur, rechargement, pénétration, portée et famille ;
- ennemi : biologie, comportement, vie, armure, vitesse, acide, fréquence, habitats et mondes ;
- équipement : action, charges et magnitude ;
- équipier : santé, spécialité, rôle, stress et bonus ;
- véhicule : coque, vitesse, carburant, sièges et actions ;
- mission : monde, campagne, graine, difficulté, équipe, équipement, véhicule, Apex et Neuro-Xeno.

Cette couche applique aussi les multiplicateurs `story`, `standard` et `nightmare`.

### 3. `src/game-complete-core.js` et `src/game-complete.js` — objectifs

Les seize formulations de campagne deviennent seize contrats distincts : sauvetage, restauration, scellement, archive, escorte, purge, abordage, défense chronométrée, traque Apex, récupération synthétique, capture vivante, destruction de relais, défense d'objectif, conduits, récupération de véhicule et fuite de quarantaine.

Chaque objectif crée ses nœuds, prérequis, vagues, cible ou échec propre. L'extraction vérifie la mécanique concernée au lieu de se contenter d'un texte.

### 4. `src/game-final-runtime.js` — monde et dotation

Cette couche ajoute :

- six familles de véhicule avec axes et conduite distincts ;
- affectation des équipiers aux sièges et bonus conducteur/tireur/support ;
- largeur, hauteur, routes, biomes et dangers convertis en géométrie visible ;
- actions à charges pour les 106 équipements ;
- contrats pour les 392 costumes : armure, mobilité, furtivité, faction et marquage ;
- détection dynamique par lumière, bruit, mouvement, couverture et accroupissement ;
- règle d'éligibilité Apex déterministe par habitat, danger, restrictions et chance.

### 5. `src/game-production-runtime.js` — production et reprise native

Le point d'entrée mission public reste `src/game-production-runtime.js`. `src/game-production-core.js` expose la chaîne, `src/game-production-resume.js` porte le snapshot de reprise et `src/game-production-base.js` finalise le comportement de production :

- sélection d'ennemis pondérée par fréquence, habitats, mondes et adaptations ;
- boss contextuel : un royal inéligible reste exclu, sauf si le contrat de campagne exige explicitement une ruche ou une reine ;
- familles balistiques avec pénétration multi-cible, bypass d'armure, bruit et états ;
- adversaire brouilleur Neuro-Xeno, impulsions limitées et relais physique ;
- réglages d'accessibilité transmis au moteur, captions, visée assistée, réduction des particules et du tremblement ;
- télémétrie et snapshots utilisés par les tests de preuve.

`GameEngine.start({ resumeState })` génère d'abord le même niveau déterministe, vérifie l'identité graine/monde/campagne/niveau/objectif, puis applique uniquement les identifiants présents dans ce niveau et borne chaque nombre. `captureResumeState()` couvre checkpoint, joueur et coop, mission/objectifs, inventaire/tracker, portes/conduits, supplies et pickups arme/outil, alimentation/archive/nœuds d'objectif, ennemis vivants ou morts avec santé/position, drops pris ou disponibles, véhicule/occupants/carburant, charges d'équipement et signal/impulsions/relais Neuro-Xeno. Projectiles, particules et entrées clavier restent transitoires et sont vidés : recharger ne recrée ni tir en vol, ni ennemi mort, ni ressource déjà prise.

Une nouvelle mécanique de mission doit être ajoutée dans la couche la plus basse qui possède les données nécessaires. Les couches supérieures enrichissent mais ne doivent pas dupliquer la simulation physique.

## Runtime du Tantalus

`src/hub-v51-runtime.js` étend le hub physique v50 sans le remplacer. Il ajoute :

- routes verticales de secours, échelles et conduits accroupis ;
- tir et projectiles dans le vaisseau ;
- ennemis xénomorphes, synthétiques ou pathogènes selon la crise persistante ;
- santé du joueur, échec, réapparition et résolution de crise ;
- compilation du projet Forge vaisseau : sols, plateformes, murs, portes, conduits, échelles, ascenseurs, spawn, objectif, ennemis, terminaux et dangers ;
- snapshots avec route, menaces, santé et état du playtest.

Les services de salle restent accessibles par terminal, mais la navigation entre les seize compartiments est physique. Une interaction de terminal est un pont vers la stratégie, pas un substitut au niveau.

## Frontier Forge

`src/editor.js` stocke des coordonnées de grille, le type de tuile et le mode `mission` ou `ship`. Le contrat de validation exige :

- un spawn ;
- un objectif ;
- au moins un sol ou une plateforme ;
- des positions valides et des types connus.

Le moteur conserve historique et futur pour annuler/rétablir. `serialize()` produit le format sauvegardé/importable ; `load()` migre et notifie l'application ; le bouton de playtest est désactivé si la validation échoue.

Le même document est ensuite compilé par l'un des deux consommateurs :

- mission : `GameEngine.compileEditorProject` ;
- vaisseau : `compileShipProject`.

## Interface d'intégration v51

`src/app.js` est l'orchestrateur DOM. Il ne contient pas les règles de combat ni les formules de sauvegarde. Ses responsabilités sont :

- rendre les ressources, décisions, recherches, modules et journal ;
- rendre la carte et les états persistants des mondes ;
- acheter/équiper et planifier la prochaine opération ;
- relayer les événements mission/hub vers les mutations de domaine ;
- lancer le runtime avec le monde, la campagne, la graine, la difficulté, l'escouade, la dotation, le véhicule, le costume, l'Apex, le Neuro-Xeno et le `resumeState` sélectionnés ;
- transmettre réduction des mouvements, sous-titres, visée assistée et tremblement au moteur, puis afficher les événements `caption` sans écrire une sauvegarde à chaque tir ;
- initialiser Forge, les réglages et les contrôles tactiles ;
- capturer la reprise native après les mutations importantes de mission, puis sauvegarder l'opération.

Les écouteurs d'interface utilisent la délégation d'événements sur des attributs `data-*`. Toute action nouvellement visible doit appeler une fonction de domaine existante ou en ajouter une avec test ; un bouton qui ne fait que changer du texte est une régression de contrat.

## Contrôles

### Mission — joueur 1

| Action | Contrôle |
| --- | --- |
| Marcher | `A` / `D` ou flèches gauche/droite |
| Monter/descendre, échelle/conduit | `W` / `S` ou flèches haut/bas |
| Sauter | `Espace` |
| Tirer | `F` |
| Interagir / réanimer / neutraliser un relais | `E` |
| Tracker | `Q` |
| Entrer/sortir d'un véhicule | `V` |
| Recharger | `R` |
| Medkit | `H` |
| Contre-impulsion Neuro-Xeno (profil actif) | `X` |
| Pause | `P` ou `Échap` |
| Reprendre au checkpoint après échec | `Entrée` |

### Mission — coop locale

| Action | Contrôle |
| --- | --- |
| Déplacement | `J` / `L`, `I` / `K` |
| Saut | `U` |
| Tir | `O` |
| Interagir / réanimer | `Y` |
| Recharger | `T` |
| Medkit | `G` |

### Hub

| Action | Contrôle |
| --- | --- |
| Marcher | `A` / `D` ou flèches |
| Monter/descendre | `W` / `S` ou flèches |
| Sauter | `Espace` |
| Interagir | `E` |
| S'accroupir dans un conduit | `C` |
| Tirer pendant une crise | `F` ou `Entrée` |

### Éditeur

- clic gauche : placer ;
- `Maj` + clic ou clic droit : effacer ;
- boutons Annuler/Rétablir : historique local de la session ;
- Exporter/Importer : JSON validé ;
- Playtest : compile le projet courant dans le runtime approprié.

## Persistance : ce qui est sauvegardé

Le schéma 51 persiste :

- profil, horloge, scène, monde/campagne et statistiques ;
- santé/armure/dotation/classe/costume du joueur ;
- statut, santé, stress, fatigue, blessures et missions des seize membres ;
- position/pont/salle du hub, systèmes, services, modules, intégrités et crise active ;
- états des 64 mondes, routes débloquées, campagnes terminées, alertes et ressources ;
- inventaires, escouade, véhicule, recherches, plan, opération active/précédente, Apex et Neuro-Xeno ;
- `resumeState` natif de l'opération active, après sanitation et migration ;
- projets Forge et réglages d'accessibilité/coop.

La reprise de mission n'est toujours pas un instantané vidéo frame par frame : projectiles, particules, touches maintenues et effets purement visuels ne sont pas sérialisés. En revanche, le snapshot natif restaure désormais le checkpoint, les acteurs, objectifs, inventaires, portes/conduits, pickups, ennemis et leurs positions, drops, véhicule, charges et état Neuro-Xeno ; les IDs inconnus sont ignorés et les valeurs numériques bornées. `tests/mission-resume-state.test.mjs` et `tests/native-resume-persistence.test.mjs` vérifient qu'un nouvel engine de même graine ne permet ni refarm ni duplication après rechargement.

## Fermeture ESM hors ligne

`sw.js` met en cache toute la fermeture transitive des imports ESM atteignables depuis `src/app.js`, y compris les couches `game-production-core`, `game-production-resume` et `game-production-base`. En cas de panne réseau, le fallback `index.html` est réservé aux requêtes de navigation ; une requête de module absente reçoit une erreur au lieu d'un document HTML invalide. `tests/pwa-offline-contract.test.mjs` contrôle cette fermeture et le checkpoint navigateur `offline-pwa` vérifie l'application réellement pilotée hors ligne.

## Événements et frontières de mutation

Le runtime mission émet des événements (`shot`, `kill`, `player-down`, `objective-action`, `objective-failed`, `mission-complete`, récompenses). L'application les traduit en statistiques, drapeaux et résolution persistante. Le hub émet ses interactions, objectifs Forge et crises ; l'application appelle `resolveHubCrisisEvent` avant de sauvegarder.

Règles :

1. le runtime ne modifie pas directement `localStorage` ;
2. les fonctions de domaine modifient un objet de sauvegarde explicite ;
3. l'application effectue le commit après la mutation ;
4. chaque conséquence ne peut être appliquée qu'une fois ;
5. les snapshots servent à tester les états internes sans dépendre du rendu visuel.

## Validation de release

La gate finale locale atteint un lint de `59 modules`, `81/81` tests Node et un build statique v51 de `3 443 entrées`. Le critère reste zéro échec, pas un nombre figé.

Commandes obligatoires :

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Le gate navigateur automatisé exécute ensuite dix checkpoints nommés dans l'interface publique :

1. `boot-v51` : shell, surfaces et réglages d'accessibilité persistés ;
2. `strategy-ui` : commandement, transaction diplomatique temporisée et cooldown non répétable ;
3. `loadout-ui` : achats, équipement, équipage, véhicule, costume, Apex et Neuro-Xeno ;
4. `production-mission-input` : déplacement, tir, rechargement, équipement, contre-impulsion et caption visible ;
5. `native-mission-resume` : snapshot persisté, rechargement, checkpoint/joueur et absence de refarm ;
6. `retreat-persistence` : résolution et conséquence persistante ;
7. `hub-crisis-combat` : apparition puis résolution physique d'une crise ;
8. `forge-mission-ship` : création, sauvegarde et playtest mission/vaisseau ;
9. `reload-mobile-persistence` : rechargement et cadrage mobile ;
10. `offline-pwa` : application contrôlée et fermeture ESM disponible sans réseau.

`scripts/browser-qa-v51.mjs` a validé ces dix checkpoints dans un contexte Chrome local isolé : aucune exception, erreur console ou requête échouée.

Une capture ou une URL n'est pas une preuve suffisante si ce parcours n'a pas été exécuté. GitHub/Vercel ne doivent être déclarés livrés qu'après build vert, commit/push confirmé, déploiement `Ready` et HTTP 200 de l'URL publique.
