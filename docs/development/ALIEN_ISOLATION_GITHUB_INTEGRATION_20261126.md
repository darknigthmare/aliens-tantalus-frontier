# Intégration GitHub — Alien: Isolation V0.8

**26 novembre 2026.** Base cumulative : `b0df1877a058f0818f96437fdfdea3f21ba7f415`, branche `claude/nifty-shannon-qpy1hl`.

## Suivi du pack de fidélité 1.0.0

Ce rapport conserve ci-dessous les constats de l’intégration initiale. Le pack suivant est suivi dans la [PR #80](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/80), la [documentation de fidélité](alien-isolation-fidelity/README.md) et la [galerie source](alien-isolation-fidelity/index.html).

Le nouveau lot comporte **39 PNG produits : 28 raccordés au rendu et 11 candidats source**. Les candidats n’ajoutent pas de mécanique. Le runtime comporte **32 fichiers** admis par un manifeste à empreinte externe ; les 646 fichiers historiques restent immuables.

La [CI 45817718748](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45817718748), sur la tête `9b874e64a2b79def1150e94da30969bbe1cd4480`, avait échoué dans `npm run check` sur un chemin documentaire contenu dans l’URL des cartes. Les étapes de build et de navigateur n’avaient pas été exécutées. Le correctif du runtime retire uniquement ce champ documentaire et injecte le module de présentation ; aucune exemption générale de contrôle des métadonnées privées n’est ajoutée.

Avant une nouvelle interruption de l’environnement, **536 tests source, 18 tests d’intégration et 49 tests DLC** avaient réussi localement. **25 contrôles de rendu Skia**, sur les 28 PNG et 14 captures, avaient aussi réussi. Skia n’est pas un navigateur.

Le manifeste, l’adaptateur, le jeu dérivé et les 39 PNG ont été récupérés avec leurs empreintes exactes. Les scripts d’admission, de build et d’intégration ont ensuite été reconstruits fonctionnellement : les résultats antérieurs ne valident pas à eux seuls ces nouveaux octets. Après cette reconstitution, les nouveaux fichiers ont à leur tour passé localement **536/536 tests source, 18/18 tests d’intégration et 49/49 tests DLC**. Le test d’intégration a construit puis revérifié les 32 fichiers du runtime. L’inventaire des 646 sources et les contrôles publics des chemins et textes ont aussi été vérifiés. Les vérifications de la nouvelle tête de PR et les deux QA navigateur sont requises avant de présenter l’archive construite comme vérifiée. L’artefact téléchargeable du seul DLC est produit après leur réussite, pour 30 jours.

## Résultat

Le paquet Isolation était archivé dans la PR #73 mais absent du menu des expéditions. Cette intégration ajoute une deuxième carte à Extensions, un lanceur avec retour au Tantalus et les deux fichiers du jeu autonome au build. Elle réutilise le lanceur hôte existant pour arrêter les scènes et l’audio, sans migrer les profils natifs vers le DLC.

Le dossier `modules/alien-isolation/v0.8/` conserve **646 fichiers, 107 266 357 octets**. Chaque taille et empreinte est épinglée dans un manifeste lui-même épinglé. Dans cet état initial, le jeu public était identique à l’original. Sources, rapports et captures sont exclus de la distribution publique.

La galerie à deux cartes conserve AVP et ajoute Isolation en français et anglais. L’expédition reste en français. Clavier et manette parcourent les deux cartes et le retour ; tous les boutons sont verrouillés pendant une ouverture et le focus revient sur la carte concernée après un échec.

## Contrôles locaux exécutés avant l’interruption de l’environnement

| Contrôle | Résultat | Portée |
| --- | --- | --- |
| Tests Node du paquet | **536/536** | Moteur, sauvegardes, géométrie et systèmes V0.8 |
| Audit spatial | **76 lieux, 112 liaisons, 224 faces** | 2 197 trajets et 462 564 points, aucun échec |
| Campagnes principales | **9/9** | Trois difficultés, trois graines, 52 objectifs |
| Explorations géométriques | **2/2** | 76 lieux et 32 tâches, normal/CLASSIC, dégâts ordinaires désactivés |
| Explorations actives | **2/3** | Mort connue reproduite, détail ci-dessous |
| Reconstruction autonome | **Identique à l’octet** | 1 107 027 octets ; syntaxe JavaScript valide |
| Menu hôte | **19/19** | DOM/manette de test et corps réel du lanceur hôte en VM |
| Admission/build Isolation | **10/10** | Source complète, runtime de deux fichiers, intégrité, omissions et symlinks |
| Succession d’audits | **16/16** | Reçus historiques conservés et cinq chemins Isolation suivis |

Le parcours actif de graine `20141007` meurt dans `m_staff`, à `C05_03`, après **451,3 secondes simulées**, face au Xénomorphe. Cette mort est déjà enregistrée dans l’archive originale. Les deux autres graines actives terminent les 76 lieux, 32 tâches et 158 transitions. Les scripts historiques renvoient zéro même si leur matrice contient un échec ; les comptes ci-dessus proviennent des JSON.

Les pilotes lisent l’état interne pour planifier. L’audit structurel ignore les verrous, tandis que les campagnes contrôlent la progression. Aucun de ces contrôles ne remplace un parcours humain d’équilibrage.

## Reprise de publication et CI

L’environnement local est devenu indisponible avant le push. Les fichiers de l’intégration ont été reconstitués depuis leurs sources exactes et les transformations effectuées, avec comparaison des empreintes consignées des fichiers partagés. Les tests locaux précèdent cette reconstitution ; ils ne sont pas présentés comme de nouveaux tests exécutés après elle.

La récupération GitHub s’appuie uniquement sur le commit d’archive épinglé. `scripts/recover-alien-isolation-source.py` recompose les neuf fragments, vérifie SHA-256, CRC, chemins, inventaire et HTML, puis restitue le même manifeste. Le workflow de récupération publie seulement les 646 membres, leur manifeste et le HTML du runtime après les tests. Il est limité à la branche d’intégration et refuse une mise à jour non fast-forward.

La CI habituelle du DLC contrôle ensuite la source complète, le build Tantalus, puis le parcours navigateur servi. Lire les résultats sur le commit concerné. L’essai Chromium local s’est arrêté avant toute assertion car le binaire était absent ; **aucune réussite navigateur locale récente n’est revendiquée**. Les captures du paquet restent historiques.

Le script `scripts/qa-alien-isolation-integration.py` teste l’ouverture via Extensions, une nouvelle partie, le déplacement, la borne de sauvegarde, l’export, le rechargement, la reprise et le retour au Tantalus, avec profils natifs sentinelles et sans injection de position DLC.

## Continuité et fidélité

Les reçus historiques AVP, Aliens et Fiorina restent inchangés. Une succession depuis la base cumulative suit précisément `package.json`, `scripts/build.mjs`, `scripts/verify-public-release-v86.mjs`, `src/dlc-menu.js` et `scripts/verify-dlc-menu.mjs`. Les preuves historiques ne sont pas transférées aux nouvelles révisions.

La livraison porte sur **V0.8.0**, dernière version complète effectivement retrouvée. La candidate V0.9 n’est pas récupérée et n’est pas publiée. Le résultat est un prototype condensé 2D/2.5D, pas une reconstitution 1:1 certifiée. La suite reste à développer dans une nouvelle version : inventaire canonique des armes et équipements, apparence des personnages, correspondance des lieux et circulation physique, avec conservation des identifiants et migrations de sauvegarde.

## Récupération GitHub vérifiée

Le [workflow de récupération](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45815067075) a réussi. Il a réexécuté **536 tests du DLC, 10 tests d’intégration Isolation et 36 tests de régression des extensions**, tous réussis, puis publié les 646 fichiers originaux au commit `cea59ecf6f1f9e455b5df22184721f60456c32bf`. L’inventaire distant contient bien **107 266 357 octets**, et son SHA-256 correspond au manifeste vérifié localement.

Le scénario navigateur a ensuite passé la compilation syntaxique Python. Ses profils sentinelles représentent des parties natives déjà commencées ; après chaque reprise, il compare l’état réellement chargé en mémoire, en plus de l’export public. Son exécution complète et le build hôte sont suivis séparément par la CI de la pull request.


## Synchronisation avec les bibles des DLC

La base cumulative a avancé vers `c7a0339f86e1de0c2209800a81506cddbc71d804` pendant la publication. La jonction conserve les documents de cette base, les deux blocs de reçus Bibles et le bloc Isolation original à l’octet. Les deux prédécesseurs exacts du vérificateur public convergent vers `16e8bf01e569c4540391dc269604404505248406fd1240917d6e75c165454ccd` ; les empreintes inconnues restent refusées.

Les fichiers combinés ont repassé **536 tests du DLC, 10 tests d’intégration et 43 tests des extensions, soit 589 tests ciblés réussis**. Le contrôle d’intégrité confirme toujours 646 fichiers et 107 266 357 octets originaux. La revue indépendante de la jonction n’a identifié aucun blocage. Ces résultats proviennent d’un checkout local ciblé ; le build complet de l’hôte et le parcours navigateur restent à exécuter par la CI de la PR.
