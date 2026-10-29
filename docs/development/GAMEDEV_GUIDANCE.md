# Guide gamedev — Aliens: Tantalus Frontier

Ce cadre relie les méthodes d’**awesome-gamedev-agent-skills** aux systèmes déjà présents dans Tantalus. Il sert aux reprises de développement, aux revues de PR et à la définition de critères vérifiables.

## Périmètre et provenance

- État du projet examiné le 29 octobre 2026 : commit [`c932d0dca69a`](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/c932d0dca69aad67e43e496e7fbeb39e0064ca4c).
- Catalogue examiné : commit [`19d93f97c9c1`](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/commit/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9).
- Guides lus : router, moteurs personnalisés et les six disciplines ci-dessous. Les liens figent cette révision ; une mise à jour doit être relue avant adoption.
- Le projet utilise JavaScript en modules ES et un moteur Canvas 2D composé de plusieurs couches. La version du paquet est `143.0.0` dans l’état examiné, avec des modules allant notamment jusqu’à V168. Relever le commit et les métadonnées effectives lors d’une nouvelle intervention.
- Ce document constitue une adaptation au projet. Il ne signifie pas qu’un catalogue de skills a été installé globalement, ni que les tests ou fonctionnalités décrits ont tous été exécutés ou terminés.

Le [router][router] et sa [référence pour moteurs personnalisés][custom] prévoient de relier les concepts aux véritables interfaces du projet. Les noms d’API Godot, Unity ou d’autres moteurs présents dans leurs exemples ne sont pas des interfaces de Tantalus.

## 1. Carte d’intégration à vérifier avant de coder

Les fichiers suivants sont des points d’entrée observés, pas une liste exhaustive des dépendances. Suivre les imports jusqu’à la méthode réellement appelée pour la tâche.

| Domaine | Fichiers existants | Contrat à préserver |
| --- | --- | --- |
| Application et missions | [app.js](../../src/app.js), [game-production-runtime.js](../../src/game-production-runtime.js), [game-production-core.js](../../src/game-production-core.js) | L’application importe le moteur de production. Celui-ci compose les mixins et contrôle les actions via `canPerformGameplayAction`. |
| Temps et cycle de vie | [game.js](../../src/game.js), puis les surcharges de la chaîne de production | Repérer l’unité du temps, les mises à jour, le rendu, la pause, le redémarrage et le nettoyage dans la couche active. Le moteur de base seul ne décrit pas tout le comportement final. |
| Corps et tenues | [player-appearance-runtime-v126.js](../../src/player-appearance-runtime-v126.js), [player-appearance-hub-v126.js](../../src/player-appearance-hub-v126.js), [player-modular-rig-v126.js](../../src/player-modular-rig-v126.js), [player-locomotion-rig-v129.js](../../src/player-locomotion-rig-v129.js) | Contrôler les deux surfaces mission/hub et la composition du corps avec ses animations. Les anciens suffixes restent actifs pour des contenus plus récents. |
| Armes et effets | [player-weapon-runtime-v125.js](../../src/player-weapon-runtime-v125.js), [weapon-effects-runtime-v124.js](../../src/weapon-effects-runtime-v124.js), [weapon-actions-v130.js](../../src/weapon-actions-v130.js) | Conserver les gardes d’action, le point de tir, les attaches et l’association entre action acceptée, effets et image effectivement dessinée. |
| IA et rencontres | [enemy-behavior-registry-v119.js](../../src/enemy-behavior-registry-v119.js), [enemy-tactics-v130.js](../../src/enemy-tactics-v130.js), [enemy-patrol-v140.js](../../src/enemy-patrol-v140.js), [horde-director-v132.js](../../src/horde-director-v132.js) | Déterminer le profil admissible, les capacités, la perception et le comportement spécialisé avant de modifier la logique commune. |
| Niveaux et Forge | [editor.js](../../src/editor.js), [forge-model-v130.js](../../src/forge-model-v130.js), [forge-journey-admission-v141.js](../../src/forge-journey-admission-v141.js), [forge-mission-runtime-v141.js](../../src/forge-mission-runtime-v141.js), [hub-door-passage-v142.js](../../src/hub-door-passage-v142.js) | Réutiliser édition, admission du parcours et exécution native ; vérifier aussi les passages du hub quand ils sont concernés. |
| Persistance | [save.js](../../src/save.js), [game-production-runtime.js](../../src/game-production-runtime.js), [forge-save-v62.js](../../src/forge-save-v62.js), [forge-playtest-checkpoint-v157.js](../../src/forge-playtest-checkpoint-v157.js) | Garder séparés profil de campagne, reprise de mission, espace Forge et checkpoint de playtest ; conserver identifiants et validations. |

Pour la fonction touchée, relever dans les notes de PR le symbole, son propriétaire, un appel réel et le contrôle adapté. Les points non vérifiés doivent rester identifiés comme tels.

## 2. Sélection des guides et critères pour Tantalus

### Sprites, costumes et animation — [create-game-assets][assets]

Définir un contrat commun pour la vue latérale, les proportions, la résolution utile, la ligne des pieds, les pivots et les attaches. Produire les variantes en familles à partir d’une référence visuelle cohérente. Conserver les conventions réellement utilisées par les rigs et atlas existants.

Pour une tenue modulaire : vérifier tête/casque, torse, bras, jambes, équipement dorsal et arme selon les pièces applicables ; puis observer les transitions idle, marche, visée, tir, rechargement, interaction et franchissement qui existent pour le personnage.

**Critère de validation :** la pièce est disponible, référencée par le registre, composée au bon endroit et observée en mouvement en mission et dans le hub lorsque ces surfaces l’utilisent. Contrôler l’alpha, les découpes et les proportions sur les références. Les états « généré », « intégré » et « vérifié visuellement » restent distincts. La fidélité franchise demande des références propres au costume ; le guide générique ne la certifie pas.

### Castes et comportements — [game-ai][ai]

Séparer décision, déplacement local et recherche d’itinéraire. Avant une modification, vérifier les états et la sélection de profils déjà présents dans `enemy-tactics-v130.js`, ainsi que les comportements spécialisés. Les boss et certaines familles ne passent pas par la même logique.

Pour la caste concernée, documenter stimuli, capacités de déplacement, contraintes d’accès, conditions d’attaque, recherche après perte de cible et reprise de l’état. Utiliser les références du codex pour les capacités de franchise ; marquer les inconnues « à définir ».

**Critère de validation :** tester une cible visible, une cible masquée, un chemin bloqué, la perte de cible et le retour/rechargement de scène si pertinent. Vérifier l’absence de transitions oscillantes et de recalculs inutiles. Choisir FSM, arbre ou score d’utilité selon le besoin démontré, sans introduire une seconde architecture concurrente.

### Salles, portes et parcours — [level-design][levels]

Partir des dimensions et capacités réelles des acteurs. Décrire le chemin entrée → objectifs → sortie, ses embranchements et ses conditions d’accès. Réutiliser les validations de Forge et compléter les cas absents plutôt que créer un autre système d’admission.

**Critère de validation :** une connexion correcte dans les données doit aussi être franchissable en jeu. Contrôler l’ouverture visible, les collisions, la zone d’interaction, l’arrivée dégagée, l’aller-retour, le raccord de profondeur et les effets d’une sauvegarde/reprise. Une vérification de graphe seule ne prouve pas la traversée physique.

Le modèle d’accès doit représenter les ressources consommables, portes qui se referment et capacités réellement acquises s’ils interviennent. Ne pas appliquer aveuglément un exemple supposant des clés permanentes. Prévoir un rythme alternant tension, exploration et récupération avant d’augmenter la densité de décors.

### Armes et retours d’action — [game-feel][feel]

Relier son, animation, recul, éclairage et particules à l’événement réellement accepté par le gameplay. Garder les effets de présentation indépendants des dégâts, collisions et règles d’action.

**Critère de validation :** l’effet part au bon moment et du bon point, reste lisible en tirs répétés, revient au repos et n’introduit ni commande perdue ni mouvement de hitbox. Doser secousses et pauses d’impact selon la direction militaire/horrifique ; conserver les réglages d’accessibilité applicables. Une nouvelle image d’arme ne suffit pas à valider sa tenue ou sa cadence.

### Sauvegardes et reprise — [save-systems][saves]

Partir de `SaveSystem`, de ses migrations et des contrats `captureResumeState` / `applyResumeState`. Le schéma principal observé est 52 ; le numéro de release ne commande pas automatiquement une migration. Forge et ses checkpoints gardent leur propre périmètre.

**Critère de validation :** effectuer l’action, sauvegarder, recharger réellement et comparer l’état pertinent : sélection d’équipement, ressources, objectifs, position ou signatures de niveau selon le système. Vérifier une sauvegarde antérieure et les chemins d’erreur concernés, en préservant une récupération possible.

Les exemples de fichier temporaire puis renommage du catalogue doivent être adaptés aux garanties du stockage navigateur. Une détection optimiste de changement de profil ne constitue pas un verrou distribué. Toute modification de synchronisation demande une analyse dédiée du mécanisme réellement utilisé.

### Fluidité et mémoire — [performance-optimization][performance]

Définir une scène reproductible : même sauvegarde ou seed, même zone, nombre d’acteurs et d’effets, mêmes réglages, navigateur, résolution et matériel. Mesurer avant de choisir une optimisation, puis comparer après avec le même protocole.

**Critère de validation :** publier les mesures disponibles et leurs conditions, la durée du parcours, le coût dominant observé et les éventuels compromis visuels. Examiner allocations, fréquence des décisions IA, chargement des images et coût du rendu selon le profil mesuré. Ne pas promettre un nombre de FPS sur le PC du joueur à partir d’une seule exécution automatisée distante.

## 3. Commandes existantes et choix des vérifications

[package.json](../../package.json) est la source de vérité pour les alias. L’état examiné exige Node `>=22`. `npm ci --ignore-scripts --no-audit --no-fund` correspond à l’installation déclarée dans la CI de release.

| Chantier | Commandes existantes à sélectionner selon le changement |
| --- | --- |
| Personnage et tenues | `npm run test:player`, `npm run qa:wardrobe:parts`, `npm run qa:player:anatomy` |
| Armes et effets | `npm run test:weapons`, `npm run test:frontier` ; ajouter la suite de continuation concernée si elle couvre la modification |
| IA et patrouilles | `npm run test:frontier`, `npm run qa:enemy:patrol` |
| Hub, circulation et portes | `npm run test:tantalus`, `npm run test:coherence`, `npm run test:ship`, `npm run qa:tantalus:navigation` selon le périmètre |
| Frontier Forge | `npm run test:forge`, `npm run test:forge:native`, `npm run qa:editor:spatial` |
| Profils, migrations et reprise | `npm run test:audit` ; compléter par la suite et le parcours de la fonctionnalité reprise |
| Validation générale Node | `npm run test:all` |
| Sources et distribution | `npm run check`, puis `npm run build`, puis `npm run check:built` lorsque le périmètre exige un build |

Ces commandes sont des points de départ, pas une obligation d’exécuter toutes les lignes pour chaque correction. Inspecter également les suites récentes et les workflows concernés.

Le [runner de release](../../scripts/test-release-v143.mjs) collecte et déduplique les fichiers des scripts `test:*` déclarés sous la forme `node --test ...`. Il n’exécute pas les QA navigateur ni la construction. Aucun alias simple `npm test` n’est déclaré dans l’état examiné.

Pour jouer localement, `npm run dev` lance le serveur sur `http://127.0.0.1:4173` par défaut. Les QA navigateur nécessitent leur outillage et un serveur approprié ; lire chaque script et la [CI de release](../../.github/workflows/full-release-v143.yml) avant de les lancer. Le [parcours de navigation](../../scripts/qa-hub-navigation-v133.mjs) utilise notamment `ATF_BASE_URL`, Playwright et Chromium, avec des sorties hors du checkout. Il importe une fixture via l’interface puis déplace le personnage au clavier ; cette préparation doit être déclarée dans le rapport.

Les nouveaux documents sont admis explicitement dans le contrôle des sources. Ils restent refusés pour une distribution construite et ne font pas partie des fichiers copiés par le builder. Étendre une liste de chemins exacts ne doit pas se transformer en autorisation générale de documents ou de dossiers de travail.

## 4. Boucle de travail et définition de terminé

1. **Cadrer :** relever le commit de départ, le symptôme ou manque concret et le résultat attendu ; consulter le suivi existant concerné.
2. **Raccorder :** choisir le guide utile et identifier les interfaces actives, le propriétaire de l’état et le chemin jusqu’au jeu.
3. **Réaliser :** livrer un parcours complet pour la fonctionnalité ; préserver les identifiants et les comportements adjacents.
4. **Vérifier :** exécuter les contrôles ciblés ; essayer les interactions et transitions pertinentes ; comparer les images ou mesures quand elles constituent la preuve nécessaire.
5. **Documenter :** mettre à jour le codex ou le tableau de suivi existant avec les fichiers, la preuve et les points restant à traiter.
6. **Livrer :** dans la PR, expliquer ce qui change pour le joueur, les commandes réellement lancées, les résultats et les limites. Un contrôle CI en attente reste en attente.

| État de suivi | Preuve attendue |
| --- | --- |
| Défini | Règle ou référence et critère de validation identifiés |
| Produit | Fichier de contenu ou code réellement présent |
| Intégré | Chargement et raccordement au système actif établis |
| Vérifié automatiquement | Commande, commit et résultat disponibles |
| Vérifié en jeu | Parcours et conditions d’exécution décrits ; observation pertinente conservée |
| Terminé pour le périmètre | Critères du chantier satisfaits et limites explicitement résolues ou acceptées |

Les tests présents dans le dépôt ne prouvent pas leur réussite sur une nouvelle branche. Un inventaire Excel n’atteste pas à lui seul que les éléments sont jouables. Une capture isolée atteste un rendu, pas la réussite d’une mission entière.

## 5. Première application — 29 octobre 2026

Les guides `game-ai`, `level-design` et `save-systems` ont été appliqués à des défauts reproduits sur la base de la PR #23 (`ffea37ad83ef1fa1fdd0a1e0549b4b4035bb4c52`). Les corrections restent dans les modules actifs et leurs suites existantes.

| Système | Défaut reproduit | Comportement obtenu |
| --- | --- | --- |
| Perception IA | Le combat et la navigation pouvaient choisir un joueur plus proche mais hors du cône de vue, alors que la vigilance poursuivait un coopéquipier visible. | Vigilance, combat et navigation partagent les mêmes règles de portée, posture, angle, proximité et obstacles. Les contrôleurs spécialisés gardent leur comportement. |
| Investigation et reprise IA | Des dégâts sans propriétaire pouvaient identifier par accident un joueur sans `id`. Une investigation sans position mémorisée pouvait ensuite rester bloquée. | Un attaquant inconnu ne révèle aucune position. Sans destination mémorisée, l’ennemi cherche localement puis reprend sa patrouille, y compris après une reprise JSON incomplète. |
| Arrivées arrière | Une mise à jour franchissant la fin du délai comptait une partie du temps deux fois. | Seul le temps restant après le délai avance l’avertissement et l’approche ; les reprises conservent le temps écoulé sans rejouer l’avertissement. |
| Parcours Forge | Deux branches sans retour pouvaient chacune porter un objectif obligatoire : l’admission acceptait le projet, puis le runtime refusait les deux sorties. | L’admission détecte les branches incompatibles. Les chaînes, retours, cycles et objectifs validables par un dialogue distant restent admissibles. Une page de dialogue non reliée ne constitue pas une récompense accessible. |
| Arrivée dans une salle Forge | Une insertion inutilisée dans une salle secondaire pouvait bloquer le parcours malgré une arrivée par sas valide. | Les diagnostics propres à cette insertion deviennent des avertissements. Un objectif cloisonné reste une erreur sauf si son volume est connecté à une arrivée réellement libre et supportée. L’insertion de départ reste obligatoire. |

Les nouveaux scénarios ont d’abord été exécutés avec les sources d’origine injectées hors de la copie de travail : quatre régressions IA et douze régressions Forge échouaient. Les mêmes scénarios réussissent avec les corrections. Les tests utilisent les moteurs et compilateurs existants, avec leurs doublures d’API navigateur ; ils ne constituent pas une validation visuelle en navigateur.

Résultats locaux sous Node 24.22.1 :

| Suite existante | Résultat |
| --- | --- |
| `scripts/verify-enemy-tactics-v130.mjs` | 20/20 |
| `scripts/verify-enemy-patrol-v140.mjs` | 9/9 |
| `scripts/verify-forge-admission-v141.mjs` | 32/32 |
| `scripts/verify-forge-journey-v141.mjs` | 17/17 |
| `scripts/verify-forge-mission-v141.mjs` | 20/20 |
| `scripts/verify-save-lifecycle-v143.mjs` | 55/55 |
| `scripts/verify-campaign-story-v160.mjs` | 23/23 |
| `scripts/verify-audit-v143.mjs` | 71/71 |

Soit 247 tests dans ces huit suites. Les commandes ciblées sont `node scripts/<suite>.mjs` pour Forge, sauvegardes et audit ; pour les suites du moteur sous Node 24, `node --test --test-isolation=none --test-reporter=spec scripts/<suite>.mjs` expose les sous-tests. La campagne a été contrôlée avec `--test-reporter=tap --test-reporter-destination=/tmp/tantalus-campaign-final.log`. Les sprites et fichiers auxiliaires nécessaires proviennent des octets réels du dépôt, sans média de substitution.

**Traçabilité des corrections.** Le dépôt épingle aussi des sources et vérificateurs dans `docs/forge/xeno-trials/progress-v163.json`. Mettre à jour une empreinte courante ne doit pas remplacer une preuve historique : conserver les ancres V162/V163/V164, déclarer la transition précise et vérifier les nouveaux octets. Le bloc `followupGamedev20261029` décrit uniquement la correction du module d’admission et lie sa suite comportementale. Les contrôles de succession refusent un autre module Forge, une empreinte divergente, un test altéré ou une preuve publique inventée. Les empreintes courantes des vérificateurs modifiés par la documentation initiale sont également corrigées.

Dix contrôles ciblés supplémentaires passent dans les gardes de succession : 2 dans `verify-audit-continuation-v162.mjs`, 6 dans `verify-audit-continuation-v163.mjs` et 2 dans `verify-parallel-completion-v165.mjs`. Ils couvrent aussi la résolution V161 → V162 → V163 et le refus d’une succession absente ou mal formée. Les 59 empreintes courantes de vérificateurs correspondent aux fichiers. Ces résultats portent sur les cas sélectionnés, pas sur l’ensemble des tests documentaires et médias de ces trois suites.

**Limites de cette passe.** Les sauts et les conditions narratives ne sont pas simulés par l’admission statique. Les obstructions mobiles restent contrôlées au passage en jeu. Le build complet, le parcours clavier et la revue visuelle ne sont pas revendiqués par ces tests locaux. La CI navigateur présentait déjà des échecs sur `main`, notamment dans le [contrôle de release du commit de départ](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/40676003061/job/122774883422) ; les résultats de la nouvelle tête de PR doivent être suivis séparément. Aucune correction de sauvegarde de campagne n’est déduite de ce seul échec navigateur.

## 6. Entretien de cette adaptation

Conserver un ensemble réduit de références utiles. Ajouter une discipline complémentaire quand une tâche le demande, après lecture du guide correspondant. Pour les problèmes propres à Tantalus, les interfaces du dépôt, les références franchise et les résultats observés restent déterminants.

Cette PR apporte un cadre local immédiatement lisible via `AGENTS.md`. Une installation native éventuelle des skills est une opération distincte : elle doit conserver leurs fichiers annexes, leur provenance et leur licence, et être validée dans l’agent utilisé. Le simple ajout de cette documentation ne constitue pas une installation.

Attribution : **awesome-gamedev-agent-skills**, Abhishek Barali et ses contributeurs, sous licence Apache-2.0. Cette synthèse est rédigée pour Tantalus ; les fichiers upstream ne sont pas recopiés. Voir [LICENSE][license] et [NOTICE][notice] pour la source.

[router]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/router/SKILL.md
[custom]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/router/references/custom-engines.md
[assets]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/skills/disciplines/create-game-assets/SKILL.md
[ai]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/skills/disciplines/game-ai/SKILL.md
[levels]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/skills/disciplines/level-design/SKILL.md
[feel]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/skills/disciplines/game-feel/SKILL.md
[saves]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/skills/disciplines/save-systems/SKILL.md
[performance]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/skills/disciplines/performance-optimization/SKILL.md
[license]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/LICENSE
[notice]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9/NOTICE
