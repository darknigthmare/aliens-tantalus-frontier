# Reine-Mère adulte — art modulaire et vérification

## Périmètre vérifié

Le lot est intégré à partir de Broodstorm publié `b9aee06a0783bc7c0cf7094268a08618364df781`. Il fournit **trois PNG, huit poses de corps et quatre bras composés** pour l'adulte du chapitre existant. Les contrôles de comportement/rendu passent **39/39** et ceux du registre **49/49**. La matrice native comporte **54 captures candidates et huit comparateurs B2**, avec ses hôtes et injections déclarés. Les validations de release, build, publication et aperçu sont attribuées séparément au commit exact dans la PR #49.

Les images ont été capturées sur des sources candidates non committées, dont HEAD était encore B2. Les empreintes des modules et des PNG, identiques avant et après les rendus, établissent leur attribution ; aucun futur commit n'est présenté comme ayant déjà existé pendant les captures. Ces observations sous Canvas natif ne constituent pas un parcours navigateur.

## Référence et identité retenue

Le corpus du projet identifie `yhw:XEN-032` comme la **Red Queen Mother de Genocide**, rattachée à `yhw:X-S13`. La bible décrit une lignée Red Hive dans l'arc TR-0. La variante rouge est donc retenue pour illustrer l'adulte du chapitre existant « Le chant de la Reine-Mère » ; ce choix ne transforme pas la rencontre locale en reproduction du récit de *Genocide*.

La [présentation officielle NECA du 14 août 2015](https://store.necaonline.com/blogs/behind-the-scenes/172394311-closer-look-aliens-genocide-red-queen-mother-ultra-deluxe-action-figure) rattache cette figurine à *Aliens: Genocide*, publié par Dark Horse. L'[annonce officielle du 17 novembre 2015](https://store.necaonline.com/blogs/news/shipping-aliens-genocide-red-queen-mother-and-avengers-age-of-ultron-head-knockers) fournit les photographies réellement inspectées. Les vues isolées 09, 10 et 11 servent de références : crête allongée rouge, cou côtelé, deux grands et deux petits bras, deux jambes, visage ivoire et queue articulée. La vue comparative 01, où figure aussi une autre Reine bleue, est exclue de la génération.

Les photos sont des vues en perspective d'une figurine articulée. Le profil latéral vivant et les poses de jeu demandent une interprétation. Les valeurs `visual1to1:false` du dossier et `canonExact:false` du chapitre ne sont pas promues. L'œuf historique `xeno-queenmother-ovomorph.png` n'est pas employé comme anatomie adulte ; la Reine-Mère n'est pas assimilée automatiquement à une Empress.

## Itérations conservées et quatre bras

Les deux premières planches complètes sont refusées : trois groupes de mains restent clairement traçables et le quatrième bras se confond avec le torse. La correction V2 ne résout pas ce défaut. Leurs sources, prompts et revues restent conservés ; leur génération n'est pas comptée comme une livraison jouable.

Le kit suivant sépare le corps et les quatre bras. La première source contient quatre corps de repos et d'anticipation ; la deuxième fournit un grand bras proche, un grand lointain, un petit proche et un petit lointain. Les pixels de génération restent intacts. La capsule allongée au flanc du corps est conservée : le grand bras proche doit la recouvrir sans pointe doublée dans les orientations retenues.

La première composition modulaire, examinée à 1,52×, laisse le petit bras lointain trop proche du grand proche. Une correction des seuls placements produit huit compositions — quatre corps dans les deux sens — à **210 px et zoom 1×**. Root et un second lecteur voient quatre mains distinctes, un menton dégagé et un raccord proche sans doublage manifeste. Le grand et le petit bras lointains passent derrière le corps ; les deux proches passent devant. Le miroir porte sur l'ensemble et conserve cet ordre.

Le diagnostic de cette composition projette des fenêtres manuelles de mains à partir des pixels alpha ≥128. La plus petite séparation entre leurs rectangles projetés est d'environ **4,20 px** ; les deux petites mains sont séparées d'environ **26,51 px**. Aucun échantillon retenu n'est occulté à demi-opacité par une couche suivante. Ces mesures qualifient le placement proposé, avec l'incertitude des repères et de l'anticrénelage ; elles ne constituent ni une mesure anatomique canonique ni une preuve d'animation native.

La première planche de corps d'action et de mort est refusée pour son voile gris/rouge semi-transparent, visible au-dessus des poses debout et autour des silhouettes. Une correction ciblée de transparence est générée, puis inspectée sur le PNG brut et sur fonds clair et sombre. Le grand voile est supprimé ; quatorze sondes de fond reviennent à alpha zéro. À plus de trois pixels du noyau alpha ≥128, le nombre de pixels alpha ≥16 passe de 22 287 à 40, dont quatre au seuil ≥32. Ce diagnostic local ne prétend pas que tous les pixels hors silhouette sont parfaitement vides : des franges de très faible alpha et de fins détails restent présents.

La source corrigée est acceptée et copiée à l'octet près. La demande de nettoyage visait à préserver les positions ; les pieds mesurés ne sont pas pour autant supposés identiques à ceux de la génération précédente. Les quatre supports au seuil alpha ≥32 sont à y614, y614, y570 et y549 dans leurs cellules, et servent au recalage des poses. Aucun seuillage, effacement ou réencodage logiciel des PNG n'est employé pour masquer le défaut initial.

| Source intégrée | Usage | Octets | SHA-256 |
| --- | --- | ---: | --- |
| `adult-rest-anticipation.png` | Quatre corps de repos et d'anticipation | 1 397 419 | `f22750aa4da56bf7200087acc5fe727052da076c8ecaf8f61bde64a4ebc7eb72` |
| `adult-action-death.png` | Quatre corps d'émission, réaction et mort | 1 417 281 | `d4fe4d25f496f1245de056666c96851a7ca41fc9342e8ef1a0f88eb2713ce725` |
| `adult-arms.png` | Deux grands bras et deux petits bras | 677 912 | `d6e34554ffbb5a0b0a444c4e3f91d956691c8f3fd248ed99baa0481bd92bf593` |

Les trois PNG RGBA de 1254 × 1254 totalisent **3 492 612 octets**. Chaque source comporte quatre cellules de 627 × 627. Une pose vivante ou morte compose un corps et quatre membres ; les douze pièces dessinées représentent **huit poses composées**, et non douze images d'animation indépendantes.

## Raccord au contrat natif

La cible est l'objet courant `eco131-boss`, de rôle `boss`, appartenant à l'opération `queen-mother-song`. Les autres écosystèmes réemploient cet identifiant et doivent être exclus par le contexte et l'appartenance à la liste courante.

Le corps physique reste **170 ×210**, au sol 570 à l'apparition. Le boss possède 600 points de santé, protégés par trois Chœurs puis répartis en quatre paliers. Les salves natives comportent un ou trois projectiles selon la phase ; leur origine demeure `x + w/2`, `y + h×0,48`. Une pose d'émission accompagne une vraie salve ; elle ne signifie pas que ce point physique a été déplacé vers la bouche dessinée.

Le raccord utilise l'horloge native et un marqueur visuel privé déclenché après l'ajout réel d'un projectile de cet acteur, avec le garde de grâce d'insertion expliqué ci-dessous. Un changement de palier de santé ne crée pas d'émission. Le marqueur expire dans l'update, avant les retours de l'IA, pour éviter le rejeu au bouclage de l'horloge. Le dessin reste sans mutation, la pause fige le temps et une reprise réussie crée un nouveau propriétaire.

Le nom, la barre de santé et l'avertissement jaune d'anticipation appartiennent au passage natif. La durée du corps mort reste **1,2 seconde**, avec alpha **0,3** ; aucun fondu de Broodstorm n'est transféré à cette rencontre. Comme les primitives vectorielles précédentes, les cinq composants sont dessinés successivement avec cet alpha : leurs recouvrements peuvent accumuler de l'opacité et laisser transparaître un membre lointain. Il ne s'agit pas d'un alpha de groupe garanti par un tampon intermédiaire. Les limites de visibilité concernent les cellules de dessin, sans agrandir les collisions. Les règles de Chœurs, de nurserie, de défense des balises et d'extraction conservent leurs propriétaires.

## Diagnostic causal et tests de production

Le premier groupe ciblé exécute **39 tests : 35 réussites et quatre échecs**. Les échecs concernent les véritables salves, malgré des cibles et une ligne de tir valides. Le diagnostic montre que la cadence du contrôleur est bien passée (`attackClock =2,15`, `windup =0`), puis que `withInsertionSafeZoneV188.updateEnemy` retire les nouveaux projectiles dans son `finally` pendant les quatre secondes de grâce. Le premier marqueur visuel, pris dans le contrôleur intérieur, pouvait donc annoncer une émission retenue par le propriétaire extérieur.

Le correctif reste limité à la présentation : le helper refuse ce marqueur lorsque `insertionGraceEnemyV188` désigne l'acteur courant. Le système d'insertion, sa durée, les dégâts et les projectiles restent inchangés. Les fixtures de vraies salves laissent désormais expirer la grâce par 4,05 secondes de mises à jour natives, et un contrôle distinct conserve la salve retenue sans émission visuelle. La première version du vérificateur et son journal d'échec sont préservés ; leurs résultats ne sont pas réattribués à la correction.

Le groupe corrigé rassemble `verify-queen-mother-art-v188.mjs`, `verify-ecosystem-missions-v131.mjs` et `verify-broodstorm-queen-art-v188.mjs` : **39/39, zéro échec, zéro saut**, en 2 833,713484 ms. Il utilise le moteur de production et le catalogue complet, avec des hôtes DOM/RAF/Image déclarés, les dimensions et empreintes des vrais PNG et des commandes Canvas enregistrées. La vérification des pixels décodés est distincte ci-dessous. Le journal positif a pour SHA-256 `8ae3779c06597c4af0732bff550a49a5b91d4abbc59193c1b05a91af340bcbc4`.

Trois mutations isolées sont refusées par leurs assertions de comportement : sans raccord de salve, le repos remplace l'émission attendue ; sans avancement du marqueur, l'émission persiste au lieu de la récupération ; sans garde d'insertion, une émission apparaît malgré le projectile retenu. Les trois premiers essais du loader s'étaient arrêtés avant les assertions à cause d'un double enregistrement Node. Ils restent conservés et ne comptent pas comme des détections causales. Le loader corrigé accepte seulement son propre marqueur lors du second passage ; aucun fichier du dépôt n'est transformé par ces essais.

| Source finale vérifiée | SHA-256 |
| --- | --- |
| Helper d'art et marqueur privé | `a22492e65b278c4bce30552e8fd85a748a8171305e73aae87d151cd1b0841187` |
| Contrôleur d'écosystème et raccords | `3b90f5739b4ff282d29304f0dc2aa7ad12150efb80e4b7459d60071ad4f03ec7` |
| Vérificateur dédié | `cabf01a56b817a86ff16f026a51f4614e9ff78764a76c391bbdf86d64a121d80` |

## Matrice Canvas et comparateurs

Le véritable `GameEngine`, ses mixins, `drawEnemy`, `drawWorld` et `drawHud` rendent les PNG décodés par `@napi-rs/canvas`. Le catalogue, la topologie d'écosystème et les traductions de production sont employés. Les hôtes document/événements/RAF sont des doubles déclarés ; les polices natives sont DejaVu. Les fixtures isolent les observations sans changer les dimensions de l'adulte ni remplacer ses fonctions de rendu. Les états de pose explicitement préparés sont distingués des séquences de vraies mises à jour, salves, pause, reprise et mort.

La matrice principale produit 51 images ; un complément de trois images vérifie ensuite la mort dans le monde. Les **54 captures candidates** comprennent les huit poses dans les deux orientations, deux repos avec mouvement réduit, les huit disponibilités possibles des trois images, trois propriétaires exclus, le HUD FR/EN, les séquences de salve/pause/reprise/mort et les deux autres écosystèmes. Huit captures B2 servent de comparateurs. Les **14 comparaisons de pixels** sont exactes dans leur périmètre : sept replis, trois exclusions, deux HUD et les deux autres écosystèmes. La comparaison des HUD exclut uniquement les lignes 178–199, où la notice Reine-Mère a volontairement changé ; Hive World et Pangaea ne comportent aucune exclusion de pixels.

Les sept observations de visibilité couvrent les bords de champ, l'éloignement et les refus natifs. Les cellules entières et leurs quatre membres entrent dans une enveloppe conservatrice ; cette enveloppe ne remplace jamais les collisions. Les dix-huit empreintes de sources et les trois PNG correspondent avant/après. La reprise crée un nouvel objet, vide les projectiles natifs et ne rejoue pas l'émission ; les différences de coordonnées et dimensions observées sont `[0,0,0,0]`.

La crête d'émission conserve **un pixel raster** sous la barre de santé ; le calcul à partir de la source donne **1,1669477 px**. Le doigt proche de la pose finale reste à **0,149787 px** au-dessus du sol géométrique. Aucun pixel de l'art isolé d'alpha ≥16 ne dépasse le sol de plus d'une rangée. Ces marges sont étroites et leur précision ne constitue pas une certification d'anatomie. Les sources conservent leurs franges alpha faibles.

L'ellipse jaune et ses sept pointes restent au-dessus des cinq couches. Les cinq alpha demandés à 0,3 apparaissent dans le Canvas natif à environ 0,2980392 par quantification ; ce n'est pas un fondu de groupe. Les bras lointains du cadavre peuvent se superposer au torse et transparaître dans les couches suivantes. Les mains des poses vivantes dégagées sont lisibles ; quatre mains toujours visibles dans le corps replié ne sont pas promises.

### Présence puis disparition du cadavre

La première séquence de mort dessine le corps avec `drawEnemy`, alors que la caméra réelle est encore à l'insertion : `nativeVisibility:false` dès le départ ne prouvait donc pas la sortie du champ d'un cadavre qui y aurait été présent. Le reçu initial est conservé séparément.

Le complément laisse la caméra rejoindre réellement la scène par les mises à jour du moteur. Le cadavre est visible à 0, 0,15, 0,3 et 1,1 seconde ; à1,25 seconde, `deathClock` vaut zéro, il est hors de la liste visible et aucun dessin d'art ne reste. Les captures du monde sont prises à 0, 0,3 et 1,25 ; les deux autres instants sont des observations de contrôleur/visibilité, sans image supplémentaire. Le corps physique reste 170 × 210. Les renforts natifs et leurs noms masquent une partie du corps ; ce complément établit la présence et la disparition, sans prétendre le lire entièrement à travers ces acteurs. L'avertissement résiduel natif peut rester tant que `windup>0`, puis disparaît avec le corps.

Root et un second lecteur ont revu la planche intégrée, la scène FR et le complément de mort. La revue indépendante est scellée sur le reçu natif final `583e5cf2736b5082fac97e62e7c0a6416f9fad0532ce9f0ada3a2623e75ec149` ; son propre SHA-256 est `7c3c09810de70a9d216d50d900eb50ba5c24ac5105759e96e21ad311acfa0eeb`. Aucun défaut supplémentaire de raccord, d'appui ou d'admission visuelle n'a été relevé dans ce périmètre.

## Registre, diffusion et limites restantes

La seule dette retirée est `dedicated-queen-mother-animation`. `complete-royal-cast` reste ouverte ; les Chœurs et gardes restent vectoriels, le chapitre partiel et `canonExact:false`. Le registre conserve **21 opérations jouables, 19 partielles et deux effectives**. La projection Q→B2→H→Cargo vérifie la déclaration antérieure exacte sans modifier les snapshots historiques, les blocs Cargo/Broodstorm ni les autres dettes. Les quatre suites du registre, V157, V158 et Cocon passent **49/49** ; leur journal porte le SHA-256 `5724747e7495280c46320eb76a2b773b8addaee1971875535f8dbd7e2713f89c`.

Les trois PNG sont chargés à la demande ; le helper porte le shell à **731 entrées** en conservant l'ordre précédent. Les quatre preuves de ce lot et le vérificateur dédié sont admis seulement dans les sources et restent exclus de la distribution publique. L'audit de distribution passe **77/77** ; son journal a pour SHA-256 `ab94d6410c8676b39cb010b5b01564dae703e1efd8928861f1ab5edd84206e23`. Le contrôle source réussit sur **3 558 fichiers, 1 601 assets et zéro document privé**, journal `be4603a7a9fd336733b35a2285bc1cdd163a4d959bec88b4376a42ced30f712b`. Les cinq gates de release sont ensuite attribuées au commit exact dans la PR.

Le mouvement réduit dispose de deux captures de repos ; ses autres conditions appartiennent aux tests de code. Cette QA n'établit aucun parcours Chromium, test audio, fonctionnement réseau ou accomplissement de la campagne complète. Les lieux, cinématiques, rencontres et castes de l'arc étendu de TR-0 restent à produire. La génération et la calibration ne certifient pas une fidélité canonique globale 1:1.

Les [sources, références et prompts](QUEEN_MOTHER_ART_PROVENANCE_20261117.json), la [planche intégrée](QUEEN_MOTHER_ART_OVERVIEW_20261117.png) et le [reçu consolidé](QUEEN_MOTHER_ART_RENDER_RECEIPT_20261117.json) conservent les données nécessaires pour distinguer génération, intégration, tests et observation native.
