# Intégration GitHub — Alien: Isolation V0.8

**26 novembre 2026.** Base cumulative : `b0df1877a058f0818f96437fdfdea3f21ba7f415`, branche `claude/nifty-shannon-qpy1hl`.

## Résultat

Le paquet Isolation était archivé dans la PR #73 mais absent du menu des expéditions. Cette intégration ajoute une deuxième carte à Extensions, un lanceur avec retour au Tantalus et les deux fichiers du jeu autonome au build. Elle réutilise le lanceur hôte existant pour arrêter les scènes et l’audio, sans migrer les profils natifs vers le DLC.

Le dossier `modules/alien-isolation/v0.8/` conserve **646 fichiers, 107 266 357 octets**. Chaque taille et empreinte est épinglée dans un manifeste lui-même épinglé. Le jeu public est identique à l’original. Sources, rapports et captures sont exclus de la distribution publique.

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
