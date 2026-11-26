# Alien: Isolation — bible de production du pack visuel

## État courant après la passe de dérivation du 26 novembre 2026

**51 PNG sont conservés : 29 utilisés par le jeu et 22 candidats dans les sources.** Cette passe ajoute seulement `rewire-panel.png`. Les 50 PNG antérieurs, les 646 fichiers historiques V0.8, le jeu dérivé et l’adaptateur gardent leurs octets. Les inventaires et la galerie regroupent désormais les 11 candidats récupérés précédemment ; ils ne sont pas comptés comme de nouvelles générations.

Le nouveau boîtier reprend la vue fermée publiée par [Tunde Glover, son créateur](https://tunde_glover.artstation.com/projects/49VVLY). Il est limité aux **23 placements `interactive:'rewire'`**. Les **30 autres objets `relay`** restent en SVG. Le cycle natif normal → éclairage coupé → ventilation détournée pendant 24 secondes, son indicateur CIRCUIT et les règles de distance restent ceux du moteur. Aucune nouvelle pièce ni nouvelle mécanique n’est ajoutée.

Le [registre de cette passe](rewire-production-20261126.json) contient les deux prompts, la référence, l’empreinte du PNG natif et les 23 identifiants. La vue frontale presque orthographique est une adaptation de la capture en perspective ; les bouts des conduits sont extrapolés. Le canal alpha natif est conservé sans retouche de pixels : le corps est principalement à 253/255 et de faibles résidus <8 existent hors silhouette visible. La conformité 1:1 et un alpha mathématiquement parfait ne sont pas revendiqués.

Qualification obtenue : **18/18 tests d’intégration et d’admission**, build isolé de **33 fichiers / 43 632 190 octets**, **30/30 contrôles Chromium 143.0.7499.4**, aucune erreur JavaScript et galerie **51 images / 29 runtime / 22 candidates** vérifiée. La fixture indépendante dessine les 23 boîtiers et les 30 relais SVG, exerce le maintien et le cycle 0 → 1 → 2 → 0, contrôle la distance, le délai de 24 secondes et le secours après échec réseau du PNG. Elle ne constitue pas un parcours complet de la campagne. Les résultats historiques ci-dessous restent datés de leurs passes respectives.

## Inventaire historique initial (39 PNG)


Ce pack apporte **39 PNG indépendants** à l’adaptation 2D **Alien: Isolation · Dernière transmission**, fondée sur la V0.8. Il comprend **28 images admises par le manifeste du jeu** et **11 images candidates conservées dans les sources de développement**. Les références, prompts et empreintes permettent de retrouver chaque image et d’en poursuivre la comparaison visuelle.

La cible reste une fidélité aussi proche que possible de l’œuvre de référence. **La fidélité 1:1 n’est pas certifiée** : l’adaptation reste condensée, plusieurs animations et mécanismes manquent, et certaines formes sont extrapolées depuis des références partielles. La qualification reste `exact:false` et `canonExact:false`.

Le présent document est un nouvel inventaire de production établi à partir des PNG retrouvés, de leurs métadonnées de génération et du contenu réel V0.8. Le [registre de couverture](coverage.json) décrit cette livraison et les objets effectivement présents dans le module. Le contrat narratif et spatial demeure celui de la [bible de reprise](../../narrative/dlc/alien-isolation.md).

## Éléments vérifiables

| Ensemble | Nombre de PNG | Octets des PNG | Destination |
|---|---:|---:|---|
| Images admises dans le pack du jeu | 28 | 40 707 270 | `dlc/alien-isolation/fidelity/assets/` |
| Candidats conservés dans les sources | 11 | 10 493 335 | `docs/development/alien-isolation-fidelity/candidates/` |
| Total produit | **39** | **51 200 605** | Un fichier indépendant par objet, portrait ou pose |

Les comptes désignent des fichiers PNG, pas un nombre de personnages jouables, d’armes fonctionnelles ou de nouvelles pièces. Les deux registres d’admission sont le [manifeste du pack](../../../dlc/alien-isolation/fidelity/manifest.json) et le [manifeste des candidats](source-assets.json). Les fichiers originaux V0.8 demeurent les sources de référence ; les raccords visuels passent par l’adaptateur du pack et la version dérivée du jeu.

Les 15 PNG d’équipement ont été retrouvés et comparés aux SHA Git des blobs déposés lors de leur génération : les quinze correspondent exactement. Les 24 autres PNG disposent également de leurs références, prompts, SHA Git, SHA-256, tailles et dimensions dans le registre de récupération. Cette conservation des images ne qualifie pas à elle seule leur fidélité ni leur comportement en jeu.

## Les 28 images admises dans le pack

Les noms de fichiers ci-dessous sont relatifs à `dlc/alien-isolation/fidelity/assets/`.

| Usage | Fichiers | Raccord prévu par l’adaptateur |
|---|---|---|
| Amanda, tenue de travail — 6 PNG | `amanda-idle.png`, `amanda-crouch.png`, `amanda-walk-a.png`, `amanda-walk-b.png`, `amanda-crouch-walk-a.png`, `amanda-crouch-walk-b.png` | Repos, accroupissement, déplacement debout et accroupi d’Amanda. |
| Amanda en combinaison EVA — 3 PNG | `amanda-eva-idle.png`, `amanda-eva-walk-a.png`, `amanda-eva-walk-b.png` | Repos et déplacement d’Amanda dans les salles extérieures. |
| Working Joe standard — 3 PNG | `working-joe-idle.png`, `working-joe-walk-a.png`, `working-joe-walk-b.png` | Repos et déplacement du synthétique standard. |
| Éléments du décor — 2 PNG | `save-station.png`, `sevastolink-terminal.png` | Borne de sauvegarde et terminaux autorisés par le manifeste ; le socle ou bureau natif est conservé lorsque nécessaire. |
| Portraits de dossier — 6 PNG | `samuels-portrait.png`, `taylor-portrait.png`, `waits-portrait.png`, `axel-portrait.png`, `verlaine-portrait.png`, `marlow-portrait.png` | Illustrations des fiches correspondantes dans le codex. Aucun nouvel acteur physique n’est créé par ces portraits. |
| Objets rapides — 4 PNG | `medkit-injector.png`, `noisemaker.png`, `emp.png`, `flare.png` | Inventaire et commandes rapides. Les trois objets lançables bruit, EMP et fusée remplacent aussi le dessin du corps des projectiles existants. |
| Équipement permanent — 4 PNG | `motion-tracker.png`, `flamethrower.png`, `access-tuner.png`, `flashlight.png` | Vignettes de l’équipement réellement acquis dans l’inventaire. Les fonctions existantes restent celles du moteur. |

Le raccord utilise les clés existantes `medkit/noise/emp/flare` pour les objets rapides et `tracker/flame/tuner/torch` pour les outils permanents. L’apparition d’une vignette reste soumise à la possession de l’équipement. Le détecteur conserve son affichage dynamique natif ; sa nouvelle vignette ne remplace pas la mesure des mouvements.

Les **61 bornes de sauvegarde** conservent leur position d’interaction et reçoivent un support visuel dans leur empreinte existante. Le moniteur Sevastolink concerne **55 terminaux intérieurs explicitement identifiés** ; **11 autres terminaux** du Torrens, de l’Anesidora, du souvenir de Marlow ou des espaces ouverts gardent leur présentation d’origine. Voir les [notes d’intégration](#contrat-technique-du-pack) pour les règles exactes.

Le remplacement des silhouettes conserve les coordonnées et collisions du moteur. Les images sont cadrées par leur zone opaque, avec des dimensions et une ligne de pied cohérentes entre les poses. Le déplacement s’appuie sur la distance réellement parcourue. Les poses absentes et les images qui ne chargent pas conservent leur SVG de référence. L’état invisible du chasseur dans les conduits doit rester invisible.

## Les 11 candidats conservés dans les sources

Les noms suivants sont relatifs à `docs/development/alien-isolation-fidelity/candidates/`.

| Groupe | Fichiers | Travail encore nécessaire |
|---|---|---|
| Armes et outil de mêlée | `revolver.png`, `shotgun.png`, `boltgun.png`, `stunbaton.png` | Comparaison fine aux références ; acquisition, munitions ou charges, usage, effets, sauvegarde et équilibrage restent à intégrer avant toute admission comme équipement jouable. |
| Ouverture et découpe | `maintenancejack.png`, `plasma-cutter.png` | Comparaison des formes et variantes ; liaisons aux obstacles, conditions d’accès et interactions dédiées à construire. |
| Consommables supplémentaires | `smokebomb.png`, `flashbang.png` | Acquisition, fabrication éventuelle, lancement, effets, interactions avec l’IA et persistance à définir et à tester. |
| Extérieurs | `torrens-exterior.png`, `sevastopol-exterior.png`, `anesidora-exterior.png` | Illustrations candidates de vaisseaux ou station ; aucun espace navigable ni plan intérieur nouveau n’est créé. |

Ces images n’ajoutent aucune mécanique par leur seule présence. Le chasseur conserve sa non-mortalité. Un ajout d’arme exige une décision et une validation de gameplay compatibles avec la furtivité et les règles du module.

## Lieux, seuils et cohérence spatiale

La V0.8 contient **76 lieux, 112 liaisons et 224 seuils**, ainsi que **840 placements** répartis entre **52 types de props effectivement placés**. La référence de ces comptes est le [contenu du module](../../../modules/alien-isolation/v0.8/src/content.json), repris dans le registre de couverture.

L’audit du graphe retrouve les 76 lieux dans une seule composante. Les 224 seuils sont alignés sur les limites `L/R/N` déclarées pour leur salle. Leurs modes de montage se répartissent en **206 raccords muraux, 6 raccords de coque, 10 ouvertures et 2 transitions narratives**. Cette classification permet de vérifier la cohérence des connexions et de distinguer un passage physique d’une transition de récit.

Ces vérifications portent sur les données de l’adaptation. Un graphe connecté et des seuils ancrés aux limites ne prouvent pas que chaque trajet est praticable avec les collisions, les conditions de quête et l’état des portes. Les parcours navigateur et les contrôles de progression doivent confirmer ces cas. La carte globale reste schématique et les transports inter-salles condensés ; les plans métriques, toutes les pièces du jeu commercial et l’ensemble de ses extensions ne sont pas reproduits.

Le pack visuel n’annonce donc aucune nouvelle salle ou correction topologique implicite. Toute évolution spatiale doit préciser la salle source, la salle cible, les deux seuils, le type de transition, les prérequis, le point d’arrivée et le retour possible.

## Références de production

Les URL exactes et les prompts utilisés sont consignés dans les registres des assets. Les références ont servi à identifier la silhouette, le costume, la disposition visible des éléments et les matériaux. Leur consultation ne garantit pas que le dessin généré leur soit exactement conforme.

| Sujet | Références principales |
|---|---|
| Amanda, Samuels, Taylor, Waits, Axel, Verlaine | [Personnages — SEGA](https://alienisolation.sega.jp/story.html) ; [Amanda — Creative Assembly](https://creativeassembly.artstation.com/projects/Jr1BPm). |
| Working Joe et outils | [Présentation du jeu — SEGA](https://alienisolation.sega.jp/battle.html). |
| Combinaison EVA d’Amanda | [Référence d’artiste de production](https://zlu.artstation.com/projects/EXG8N). |
| Détecteur de mouvements | [Creative Assembly](https://creativeassembly.artstation.com/projects/xE5vY) ; [présentation officielle Xbox des appareils](https://news.xbox.com/en-us/2014/09/24/games-8-awesome-retro-gadgets-in-alien-isolation/). |
| Borne de sauvegarde et terminal | [Présentation officielle Xbox des appareils](https://news.xbox.com/en-us/2014/09/24/games-8-awesome-retro-gadgets-in-alien-isolation/), avec les vues de la borne et du terminal. |
| Équipements, silhouettes d’inventaire | [Captures du jeu relayées par AvP Galaxy](https://www.avpgalaxy.net/games/alien-isolation/weapons/), complétées par les captures officielles SEGA pour le syntoniseur et le lance-flammes. |
| Outil de maintenance et découpeur plasma | [Outil au niveau de la serrure](https://www.mobygames.com/game/68903/alien-isolation/screenshots/windows/736060/) ; [découpe au plasma](https://www.mobygames.com/game/68903/alien-isolation/screenshots/windows/736081/). |
| Torrens et Sevastopol | [Torrens — Creative Assembly](https://creativeassembly.artstation.com/projects/8xJzx) ; [Sevastopol — Creative Assembly](https://creativeassembly.artstation.com/projects/WZWxy). |
| Anesidora | [Brad Wright, artiste de production](https://bradwright.artstation.com/projects/b5LmE). |
| Marlow | [Référence d’artiste de production](https://sinhouse.artstation.com/projects/RxmZA). |

## Écarts connus et suite de production

**Xénomorphe :** les trois nouvelles poses demandées n’ont produit aucun PNG. Les SVG originaux du chasseur restent utilisés. La présence du personnage dans le module est donc distincte de la production d’un nouveau jeu de sprites.

**Molotov et bombe artisanale :** aucun nouveau PNG n’a été produit. Ces deux objets restent des manques dans ce lot ; aucune entrée d’asset fictive ne doit les compter comme disponibles.

**EVA :** le casque et le haut de combinaison ont été comparés à une référence partielle. Les jambes et chaussures sont extrapolées ; la conformité de la silhouette complète reste à établir. Les poses EVA accroupies manquent et conservent le rendu de référence.

**Animations :** les déplacements livrés utilisent deux images par cycle. Des cycles plus détaillés, des poses d’interaction, de blessure, d’attaque et d’autres variantes restent à produire et à qualifier selon le rôle concerné. La variante industrielle du Working Joe n’est pas couverte par le jeu de sprites standard.

**Équipements :** le lance-flammes est une icône stylisée simplifiée. Les inscriptions, proportions fines et éléments visibles de tous les appareils nécessitent encore une comparaison ciblée. Le PNG de découpeur plasma ne couvre pas automatiquement les autres variantes de la famille des découpeurs. Les mécanismes actuels restent ceux de l’adaptation : notamment, les fusées y sont fabricables et le détecteur y consomme des piles. Ces comportements demandent une comparaison canonique distincte du travail visuel. La [revue des extensions d’équipement](#ajouter-des-armes-et-des-outils) détaille les points d’appui, les risques de sauvegarde et les actions à implémenter.

**Personnages et décors :** les portraits n’apportent ni animation corporelle ni scène supplémentaire. Les autres personnages, variantes, éléments de décor et territoires restent évalués depuis leur contenu existant ; l’existence d’un SVG constitue déjà une représentation, même lorsqu’une reprise artistique est souhaitable. Les corps, poses de mort et la silhouette scénarisée du chasseur derrière la vitre utilisent encore des dessins SVG directs. Marlow conserve son rôle physique d’origine, y compris dans son souvenir en extérieur.

## Qualification et règles d’admission

Conserver la progression **candidat → admis → chargé → raccordé → observé en jeu**. La génération d’un PNG établit seulement sa production. L’admission vérifie son identité, ses dimensions, son empreinte et sa destination. La qualification en jeu exige une observation de l’usage réel, incluant le repli vers les SVG lorsqu’un fichier manque.

Les contrôles navigateur couvrent notamment le lancement depuis la galerie Tantalus, les commandes, l’inventaire sans pause, les autres panneaux avec pause, la sauvegarde et sa reprise, les sentinelles de sauvegarde de l’hôte, les silhouettes en déplacement, les portraits et les projectiles. Leur présence dans le dépôt ne vaut pas réussite : le résultat effectif appartient aux rapports de QA et à la CI du commit publié.

Pour admettre un candidat supplémentaire, compléter ses références, comparer son dessin, définir le raccord réel, préserver les sauvegardes existantes et vérifier le comportement. Une image absente ou refusée conserve un statut explicite ; un résultat chargé conserve `exact:false` tant que sa comparaison spécifique n’a pas été acquise.

## Contrat technique du pack

### Dérivation et chargement

Le corpus V0.8 récupéré reste immuable. La version jouable dérivée retire uniquement le champ documentaire `CONTENT.spatialRevision.reference` et ajoute ce module avant la fermeture de `body` :

```html
<script type="module" src="./fidelity/adapter.js"></script>
```

Le module charge `fidelity/manifest.json`. L’admission fixe l’empreinte de ce manifeste séparément, puis vérifie les octets de la version dérivée et de chaque fichier distribué. Le HTML source, les modules d’origine, le graphe des salles et le schéma de sauvegarde demeurent les références immuables. La distribution contient les seuls membres runtime admis ; les candidats et documents de développement restent exclus.

### Silhouettes et poses

Un raccord de personnage désigne un rôle réel du moteur et une pose. Les poses `idle` et `crouch` utilisent une image ; `walk` et `crouch-walk` acceptent deux ou huit images distinctes. Une séquence de deux images reste déclarée comme telle. Les raccords actuels couvrent Amanda en tenue de travail, Amanda en EVA pour le repos et la marche, et le Working Joe standard. Les poses absentes gardent les SVG d’origine.

La symétrie gauche/droite, la position dans le monde, l’ordre de profondeur, la dissimulation, les indications d’étourdissement et le rôle de l’acteur restent sous la responsabilité du renderer natif. L’apparence EVA est sélectionnée uniquement pour Amanda dans une salle extérieure ; elle ne s’applique pas à Marlow dans son souvenir. Un alien dans un conduit reste invisible.

L’adaptateur calcule le cadrage utile à partir des pixels dont l’alpha dépasse 127, puis ajuste le PNG aux limites utiles du sprite de référence en conservant les proportions et la ligne de pied. Les images d’une même pose mobile partagent une hauteur de corps commune : la pose de passage compacte ne devient pas plus grande que la foulée. Cette opération ne modifie aucun octet de l’image source. Elle ne supprime pas un éventuel halo situé dans le cadrage utile ; ce défaut exige une correction de l’asset avant son admission.

Chaque dessin dans le monde remplace temporairement une image, appelle la méthode native, puis restaure l’image dans un bloc `finally`. Les fournitures ouvertes gardent leur SVG sauf si une image ouverte a été explicitement fournie. Un PNG absent ou défaillant conserve le dessin de référence pour le raccord concerné ; le diagnostic indique le chargement en échec.

### Décors et objets

Les 61 bornes de sauvegarde gardent leurs coordonnées d’interaction. Le dessin de la borne murale est monté sur un support de service étroit, avec plaque arrière et pieds contenus dans l’empreinte existante. Ce support évite un dispositif visuellement suspendu sans inventer de nouveau mur de collision.

Le remplacement Sevastolink concerne uniquement le moniteur des 55 terminaux intérieurs listés. Le clavier, le bureau, les pieds et l’ombre sous l’écran conservent leurs pixels natifs. Les 11 terminaux exclus — Torrens, Anesidora, souvenir de Marlow et espaces extérieurs — gardent leur présentation d’origine. La sélection repose sur les identifiants réels des props et comprend les terminaux facultatifs et les ajouts des versions antérieures.

Les icônes rapides se limitent à `noise`, `flare`, `emp` et `medkit`. Les images des outils permanents se limitent à `tracker`, `torch`, `tuner` et `flame`, et apparaissent après acquisition. Le renderer natif continue de dessiner les mesures du détecteur.

Les images de `noise`, `flare` et `emp` remplacent aussi le petit corps de leurs projectiles lorsqu’ils sont en vol ou armés. La substitution ciblée dans l’appel natif `flightObjects()` conserve projection, rotation, ombre et anneau de temporisation. Elle ne crée aucun projectile et ne change ni trajectoire, ni délai, ni dégâts, ni consommation d’inventaire. Une image indisponible conserve les petites formes natives.

Les portraits sont associés aux noms exacts des dossiers. Ils ne créent aucun personnage physique. Le moteur V0.8 ne possède notamment pas de rôle physique de scène pour Samuels, Taylor, Axel ou Waits. Le raccord `joe` correspond au synthétique standard ; il n’ajoute aucune variante Hazmat ni nouveau comportement d’IA.

Aucune porte, destination, interaction, position d’acteur, collision, règle d’IA ou valeur sauvegardée n’est déplacée par ces substitutions.

### Vérifications et diagnostic

`scripts/qa-alien-isolation-fidelity.py` exerce l’iframe servie : commandes réelles, marche, accroupissement, inventaire, portraits, rechargement de page, stabilité du checkpoint et requête PNG volontairement interrompue. Ses fixtures de rôles hors écran utilisent leur propre moteur initialisé avec une graine et leur propre renderer. Les positions et poses de ces fixtures sont déclarées dans le rapport et ne sont pas écrites dans l’état du joueur.

`scripts/qa-alien-isolation-integration.py` complète ce parcours par l’interaction réelle avec une borne de sauvegarde et le retour à l’application hôte. Les conventions d’appel sont `--root`, `--source-root`, `--base` et `--output`.

L’observation locale utilisant `@napi-rs/canvas` et le vrai `IsolationRenderer` constitue un contrôle séparé. Elle sert à vérifier les appels de dessin raster, la distinction des frames, les rendus de repli et l’absence de modification d’état pendant l’installation et le dessin. Elle ne remplace pas un essai navigateur et ne prouve ni la ressemblance canonique ni une traversée complète de campagne.

`window.__isolationVisualV1.snapshot()` rapporte les assets chargés ou en échec, les raccords admis et les rôles ou props effectivement dessinés. `uninstall()` restaure la présentation d’origine. Ce diagnostic ne débloque aucun équipement et ne fait progresser aucune mission.

Les corps, poses de mort et silhouette scénarisée derrière la vitre restent des dessins SVG directs tant que des images et raccords correspondants n’ont pas été fournis. L’architecture, les portes et l’échelle des niveaux restent celles de l’adaptation récupérée.

## Ajouter des armes et des outils

### Décision proposée

Les armes et outils absents sont réalisables, mais ils demandent une nouvelle
révision du moteur et de la persistance. Le pack de présentation actuel peut
illustrer les quatre outils et quatre consommables déjà jouables sans changer
une sauvegarde. Ajouter un PNG de revolver au codex ne fournit ni acquisition,
ni visée, ni munitions, ni rechargement, ni comportement du Xénomorphe.

Je recommande de terminer le pack visuel, puis de construire une fondation
commune pour l’armement dans un runtime dérivé explicitement versionné, avec
une migration testée. Les 646 fichiers récupérés de 0.8 restent la référence
immuable. Aucun des ajouts mécaniques décrits ci-dessous n’a été implémenté
pendant cet audit.

### Constat directement vérifié

Dans `modules/alien-isolation/v0.8/src/engine.js`, `initialState()` crée seulement
`tools.torch/tracker/tuner/flame`, les ressources `scrap/chemical/battery` et les
objets `flare/noise/emp/medkit`. Le carburant est un champ séparé `fuel`.

Les points d’acquisition sont déjà définis : lampe à `C01_01` dans `t_cryo`,
syntoniseur à `C03_02` dans `y_workshop`, détecteur à `C04_01` dans `c_reception`,
lance-flammes à `C10_01` dans `w_bureau`. `finishGoal()` retire le lance-flammes
et son carburant à `C13_01`, puis les rend à `C14_01`. Ces opérations ne savent
pas encore consigner d’autres armes ou des munitions.

Le Xénomorphe principal n’a pas de champ de points de vie dans ce moteur. Les
ennemis ordinaires ont `hp`, `stun`, `cool`, une direction, une mémoire et un
identifiant stable. Il n’y a qu’un rôle `joe`, sans caste Hazmat distincte.
Un traitement générique « toute cible perd des PV » serait donc incorrect.

#### Preuve du risque de sauvegarde

Une fixture indépendante a ajouté `s.armory`, `s.tools.revolver` et
`s.inventory.revolverAmmo`, puis appelé le vrai `serialize()` et le vrai
`load()`. Le chargement a réussi, mais les trois ajouts ont disparu. Le même
texte avec une enveloppe `schema:2` a été refusé comme incompatible.

La raison est explicite dans `load()` : il reconstruit un état neuf avec
`initialState()`, puis recopie uniquement les clés connues. Il filtre également
les types de projectiles, les leurres, les drapeaux et les identifiants.
Ce constat provient de la fixture indépendante de l’audit des extensions ; le chargeur V0.8 filtre les clés ajoutées.

### Points d’extension déjà disponibles

| Besoin | Code existant utile | Travail à faire |
| --- | --- | --- |
| Action autorisée ou refusée | Gardes dans `flame`, `deploy`, `heal`, `craft`, `beginAim`; pause, mort, cachette, piratage, remplacement de pile | Factoriser un contrôle commun adapté au type d’action, sans supprimer les gardes spécifiques. |
| Visée et direction | `beginAim`, `setAim`, `renderer.unproject`, gestion de souris dans `app.js` | Distinguer visée d’une arme et visée d’un objet lancé. |
| Couvert et ligne de tir | `clearSight(room,a,b)` découpe un segment contre les empreintes de mobilier | Trouver le premier impact d’un tir, et non appliquer un cône de dégâts à tous les ennemis comme le lance-flammes. |
| Bruit et réactions | `emitNoise`, `heardAt`, `sees`, mémoire des ennemis, `IsolationEncounters.guard` | Relier le bruit à chaque tir effectivement accepté, avec réponse des humains et de l’alien. |
| Effets d’impact | `s.effects`, branche `shot` de `IsolationRenderer.render` | Relier effet, origine, destination, recul, son et pose à la même action. La ligne déjà dessinée est actuellement celle des tirs des humains. |
| Mêlée / étourdissement | `distance`, `clearSight`, `e.stun`, `updateEnemies` | Ajouter portée, amorçage, récupération, consommation éventuelle et réponses par rôle. |
| Objets lancés | `throwPlan`, `deploy`, `updateProjectiles`, `CONTENT.flight` | Étendre les types admis, les effets persistants, l’inventaire, les recettes et le chargement. |
| Intervention physique | `targets`, `interact`, `use`, maintien E, annulation, `requireRelease` | Ajouter des cibles d’outil stables, réellement accessibles, avec conditions d’outil et résultat persistant. |
| Accès et carte | `available`, `route`, `enter`, `portalApproach`, `passageReason` | Exprimer le même verrou dans le passage, le plan, les libellés et le cheminement. |
| Acquisition | `finishGoal`, `use('loot')`, cibles optionnelles | Prévoir de vrais points d’acquisition et des réserves limitées. Les coffres actuels donnent uniquement trois composants et du carburant. |
| Sauvegarde | `serialize`, `load`, `save`, `restore`, `IsolationSaveVault` | Enveloppe/migration, clés autorisées, bornes numériques, restauration après mort et sauvegardes de secours. |

### Coût relatif et risques par famille

Le coût ci-dessous exprime l’étendue d’implémentation et de validation, pas une
durée promise. « Moyen après fondation » suppose que sélection, munitions,
rechargement et sauvegarde des armes sont déjà en place.

| Ajout | Coût relatif | Fonctions à prolonger | Risque principal et preuve nécessaire |
| --- | --- | --- | --- |
| **Fondation commune d’armement** | Élevé ; traverse moteur, données, entrées, rendu, interface, sauvegarde et tests | Nouvel état d’armement validé; `step`, acquisition, sérialisation/chargement, sélection d’action | Perte ou duplication de munitions à la reprise, conflits de commandes, armes encore utilisables pendant un menu ou un piratage. |
| **Revolver** | Moyen après fondation | Premier impact de segment, cadence, réserve/chargement, bruit, pose et effets | Un coup doit consommer la ressource prévue et frapper seulement la cible ou le couvert réellement rencontré. L’alien ne doit pas recevoir artificiellement un système de PV. |
| **Shotgun** | Moyen à élevé après fondation | Plusieurs impacts ou dispersion définie, rechargement propre à l’arme, retour visuel | Cumuls de dégâts à travers les couverts, cadence pendant le rechargement, restitution de cartouches après interruption. Le nombre de plombs et le modèle de recharge doivent être documentés, pas supposés canoniques. |
| **Bolt gun** | Élevé après fondation | Charge avant tir, relâchement/annulation, recharge, premier impact | Charge ou tir fantôme après changement de salle, pause, mort ou reprise. Le compteur de charge est un état d’action à traiter explicitement. |
| **Stun baton** | Moyen après fondation | Portée courte, amorçage/récupération, charges, `e.stun`, réponse par rôle | Ne pas donner la même vulnérabilité à tous les ennemis ni inventer une caste Hazmat absente. Une tentative hors portée ou refusée ne doit pas dépenser une charge. |
| **Maintenance jack** | Moyen pour un verrou physique ; élevé si la mêlée complète est incluse | `targets/interact/use`, restrictions d’accès, animation d’intervention; pour la mêlée, système d’action commun | Une simple image de poignée ou un drapeau ne prouve pas l’usage du jack. Il faut traiter le verrou physique, le maintien de l’action, son interruption et l’état du mécanisme après reprise. |
| **Cutters et améliorations** | Moyen à élevé, surtout pour la campagne | Niveau d’outil, cible physique, `available/enter/route/passageReason`, état de découpe commun aux deux faces | Blocage définitif d’une route si l’outil est derrière son propre verrou; ouverture d’un seul côté; découpe perdue au chargement. Les variantes/niveaux documentés doivent avoir des conditions distinctes, pas seulement plusieurs icônes. |
| **Pipe bomb** | Moyen après extension des projectiles | `CONTENT.flight`, `deploy/updateProjectiles`, dégâts de zone avec couvert, recette et sauvegarde | Double explosion après rechargement, dégâts à travers un mur, interaction non définie avec les compagnons et le joueur. |
| **Molotov** | Élevé | Projectiles, zone de feu persistante, durée, dégâts, effets, sauvegarde, interaction avec `isVacuum` | Le lance-flammes actuel est ponctuel ; une flaque durable exige une simulation propre, pas seulement un effet orange à l’écran. |
| **Smoke bomb** | Élevé | Volume de fumée persistant, perception des humains/alien, rendu, sauvegarde | Le `clearSight` actuel ne connaît que le mobilier. Un disque visuel qui ne change aucune perception ne serait pas une vraie bombe fumigène. |
| **Flashbang** | Moyen à élevé | Explosion, visibilité/orientation, réponse par rôle, temporisation et rendu | Un étourdissement global qui ignore portée, couvert et type d’ennemi serait incohérent. Les règles franchise exactes restent à référencer. |
| **Nouveaux composants et stocks** | Moyen, transversal | `initialState/load`, loot, recettes du moteur et recettes affichées dans `app.js` | Les recettes sont actuellement dupliquées dans deux endroits. Une source de données commune évitera d’afficher un coût différent de celui consommé. |

Les quatre consommables actuellement jouables restent `noise`, `flare`, `emp`,
`medkit`. Leur amélioration visuelle est déjà raccordable. Leur comportement
actuel reste celui de l’adaptation : notamment, les fusées sont fabricables et
le détecteur consomme des piles dans cette version. Ces choix ne doivent pas
être présentés comme une conformité mécanique certifiée au jeu commercial.

### Schéma et reprise recommandés

1. Définir un état d’armement compact, par exemple une section versionnée contenant
   les possessions, l’arme sélectionnée, les munitions chargées/de réserve,
   les charges et niveaux d’outil, les équipements consignés et les opérations
   physiques terminées. Les types et bornes doivent être validés à l’entrée.
2. Admettre explicitement les sauvegardes 0.8 : les nouveaux équipements restent
   non possédés, les anciens objectifs/ressources conservent leur valeur, et
   aucune arme n’est accordée automatiquement parce qu’un PNG existe.
3. Isoler la nouvelle famille de sauvegardes de la clé 0.8 au premier lancement
   de cette révision. Importer une copie vérifiée de l’ancien point sans le
   remplacer. Un retour à l’ancien jeu ne doit ni effacer silencieusement les
   nouvelles clés, ni déclencher une restauration imprévisible de son ancien
   historique. Ce changement appartient à la révision mécanique, pas au pack
   d’images actuel, qui garde exactement la clé existante.
4. Décider comment reprendre les actions interrompues : rechargement en cours,
   charge du bolt gun, découpe, projectile en vol, feu/fumée déjà actifs. Une
   annulation sûre sans restitution de ressource peut être acceptable lorsqu’elle
   est déclarée ; il faut tester chaque politique.
5. Conserver l’ordre des **52 objectifs principaux**. `load()` dérive le chapitre
   et la liste des objectifs terminés depuis l’index `goal`. Insérer une acquisition
   au milieu de cette liste déplacerait les anciennes sauvegardes. Préférer des
   cibles secondaires stables, ou fournir une migration par identifiant.
6. Étendre la consignation/restitution d’APOLLO à l’ensemble pertinent de
   l’équipement. Le code actuel ne sauvegarde que `stashedFuel` et ne retire que
   `tools.flame` : les nouvelles armes ne doivent pas passer au travers de ce
   passage scénaristique par oubli.

### Contraintes de commandes et de rendu à résoudre

`R` tient le détecteur, `V` vise un lancer, `Espace` utilise le lance-flammes,
`T` agit sur les verrous et `G/L/X/H` utilisent les quatre objets rapides.
`1–4` servent aussi aux symboles du piratage. Ajouter « R = recharger » ou
remplacer la roue à quatre objets sans règle de priorité casserait des commandes
existantes. Le routage doit dépendre explicitement de l’action et du mode courant.

Les sprites Amanda livrés ici sont idle, marche et accroupissement. Ils ne
montrent pas une arme en main et ne fournissent pas des animations de visée,
tir, rechargement ou découpe. Il faudra prévoir ces poses/attaches et leurs
transitions en même temps que les nouvelles actions. Le pack visuel ne doit
pas transformer son pose-idle en fausse animation de tir.

Le code de l’application construit des `IsolationEngine` dans plusieurs chemins
(nouvelle partie, reprise, validation d’import). Patcher une seule instance
depuis un script après chargement manquerait ces chemins. Une surcharge de
prototype est techniquement possible, mais rendrait plus fragile le contrat de
chargeur, les checkpoints et le cycle de vie. Une révision du runtime dont la
fabrique de moteur et le validateur sont explicitement propriétaires de la
nouvelle version est préférable.

### Séquence d’implémentation contrôlable

- Fondation d’armement et migration, avec sélection et acquisitions explicites.
- Premier parcours de revolver : acquisition physique, tir sur cible et couvert,
  rechargement, bruit, sauvegarde à la borne, rechargement réel, mort/reprise.
- Stun baton et jack, puis shotgun et bolt gun en réutilisant cette fondation.
- Verrous d’outil et cutters, avec aller-retour par les deux faces et reprise.
- Nouveaux consommables, en commençant par l’explosion ponctuelle, puis fumée et
  feu persistant après prise en charge de leurs états et perceptions.

Les vérifications pertinentes existent déjà comme socle : suites Node du module,
fixtures legacy v01–v07, parcours de campagne, audit spatial et QA navigateur.
L’extension doit d’abord ajouter les cas spécifiques ci-dessus, puis rejouer
les parcours affectés. Le sweep actif historique possède déjà un échec connu
dans `m_staff` pour un seed ; il faut séparer cette référence d’une régression
nouvelle et inspecter les résultats JSON, car certains sweeps rendent zéro même
lorsqu’un cas interne échoue.


## Récupération locale du 26 novembre — 11 PNG de production

Les sprites produits après la livraison initiale sont conservés à l’octet dans cette même PR. [La galerie complémentaire](local-recovery-20261126.html) et [son inventaire SHA-256](local-recovery-20261126.json) permettent de les examiner individuellement.

| Famille | Fichiers ajoutés | État |
| --- | --- | --- |
| Casiers | Fermé, ouvert | Candidats à raccorder |
| Mallettes | Fermée, ouverte | Candidats à raccorder |
| Mobilier | Distributeur Hot Food, cryopod individuel du Torrens | Candidats à raccorder |
| Mécanisme | Verrou pour clé de maintenance | Mécanique à vérifier avant raccordement |
| Portraits | Amanda, Ricardo, Dr Kuhlman, Catherine Foster | Dossiers identifiés, raccordement à réaliser |

Les prompts et références restent disponibles dans [la production des props](props-production-local-20261126.json) et [celle des portraits](portraits-production-local-20261126.json). Les PNG restent les originaux générés, avec leurs dimensions et leur canal alpha. Aucune image de référence externe n’est redistribuée dans ce lot.

Le pack compte désormais **50 PNG** : **28 déjà utilisés par le jeu** et **22 candidats conservés dans les sources**. Le jeu, son adaptateur et ses 28 PNG gardent exactement les octets du commit `c2f4574e677d26e74439227c8e6bb8ccae03277c`. La distribution reste limitée aux **32 fichiers et 41 856 790 octets** admis. Les huit mécaniques supplémentaires d’équipement annoncées dans une autre passe restent non vérifiées et ne sont pas ajoutées par cette publication de sprites.

Contrôles réellement obtenus : **18/18 tests d’intégration et d’admission**, **646 fichiers source vérifiés à l’octet**, **22 PNG candidats vérifiés**, **11 nouveaux PNG décodés avec transparence**, puis build isolé réussi avec les **32 fichiers runtime inchangés**. Aucun nouveau résultat de parcours navigateur n’est revendiqué.

La fidélité 1:1 reste à qualifier face aux références de l’œuvre ; les champs `exact` et `canonExact` restent faux. Les raccordements aux scènes et les poses manquantes sont toujours ouverts.
