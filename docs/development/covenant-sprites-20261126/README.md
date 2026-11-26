# Covenant — sprites sources du 26 novembre 2026

Ce lot conserve **3 PNG originaux générés**, soit **4 414 495 octets**, pour le DLC Covenant. Les fichiers sont des **candidats graphiques à revoir** : ils ne sont pas intégrés au jeu et aucune fidélité 1:1 n'est certifiée.

La [galerie](gallery.html) permet de comparer les silhouettes. Le [manifeste](manifest.json) conserve les prompts exacts, les références de production, les dimensions et les empreintes de chaque fichier. La consolidation documentaire des DLC est suivie dans la [PR #68](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68).

## Fichiers livrés

| Candidat | Dimensions | Octets | SHA-256 |
| --- | ---: | ---: | --- |
| [Néomorphe adulte — citadelle](neomorph-adult-citadel.png) | 1774 × 887 | 981223 | `204df7dba4df40b6c7c3580e804fcbd6f2fd82d9f727c4feca9ca8d436876ccf` |
| [Facehugger — Covenant](facehugger-covenant.png) | 2172 × 724 | 966212 | `4431c66ab1697ea7d83e784f70f629e1378f690f60de77e54cb8f8af6841094b` |
| [Ovomorphe — Covenant](ovomorph-covenant.png) | 1166 × 1349 | 2467060 | `b9eb1cca63258c796763d59847a86d13b036e03493badb164efbdfdcab4f27d8` |

Les octets des trois images sont conservés tels que produits et transférés. Leurs SHA Git distants ont été comparés aux SHA Git recalculés avant publication.

## Contrôles et limites

La signature PNG, les en-têtes IHDR, le format RGBA à 8 bits, les CRC de tous les chunks et la présence du chunk final IEND ont été contrôlés avant publication. Ces contrôles portent sur la structure des fichiers.

La revue visuelle se limite à la silhouette globale. Le décodage complet des pixels, la répartition des valeurs alpha, les bordures, l'échelle en jeu, les animations et la comparaison exhaustive aux plans du film restent à vérifier. Le format RGBA garantit la présence possible d'un canal alpha ; il ne garantit pas la qualité de tous les contours.

Les champs `runtimeIntegrated` et `verified1to1` restent `false`. Le fichier du Néomorphe adulte est associé à l'entrée de fidélité `ACOV-045` dans le manifeste. Les candidats ne changent ni le catalogue jouable, ni les collisions, ni les animations.

## Fichiers toujours manquants

| Candidat attendu | Résultat de cette session |
| --- | --- |
| `neomorph-juvenile-hallett.png` | Génération refusée ; aucun fichier créé. |
| `xenomorph-covenant-idle.png` | Génération refusée ; aucun fichier créé. |

Ces deux entrées restent dans le travail à reprendre. Aucun substitut n'est présenté comme un résultat obtenu.

## Admission dans le dépôt

Le répertoire `docs/development/covenant-sprites-20261126` et ses **6 fichiers exacts** sont admis uniquement dans les sources par `scripts/verify-public-release-v86.mjs`. Les noms inconnus, sous-répertoires supplémentaires et variantes de casse sont refusés. Aucun de ces chemins n'est admis dans une distribution construite.

Le constructeur et son filtre d'actifs ne changent pas. La copie des sources de jeu reste limitée à `src/` et `assets/` ; cette documentation reste hors build.

Le seul nouveau reçu de succession concerne le vérificateur de chemins :

- Base : `b0df1877a058f0818f96437fdfdea3f21ba7f415`.
- SHA-256 précédent : `6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f`.
- SHA-256 proposé : `7b5d58ef982af1c20dc1940afbc061da652245304ea19d6c70f55d0e3b097844`.
- Les blocs de reçus historiques restent inchangés.
- Aucun résultat antérieur de CI, de contrôle visuel ou de fidélité n'est transféré à ce lot.

Les tests de succession sont étendus à ce reçu précis et aux admissions positives/négatives du lot. L'exécution des tests Node, du build et des contrôles en jeu reste **en attente** : l'environnement local n'était pas disponible lors de la publication. La PR demeure en brouillon.

## Références

Les références de contexte de production et les prompts complets sont conservés dans le manifeste. Elles servent au travail de comparaison ; elles ne constituent pas une validation automatique de ces images :

- [MPC — Alien: Covenant](https://www.mpcvfx.com/en/filmography/alien-covenant/)
- [Odd Studio — creature effects and character design](https://oddstudio.com/creature-effects-character-design/)
