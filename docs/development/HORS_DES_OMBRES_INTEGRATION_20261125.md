# Hors des ombres — intégration au dépôt, 25 novembre 2026

## Périmètre

Le DLC **ALIEN — Hors des ombres V0.10.0**, « Le Marion, pièce par pièce », est récupéré depuis la livraison originale et raccordé à la branche cumulative de Tantalus Frontier au commit parent `001a20bdc0f9f1a3c835e84d8f3c9434bc159330`.

L'entrée **HORS DES OMBRES · DLC** du menu principal lance la chronique après une sauvegarde hôte confirmée. Le bouton est inclus dans la navigation au clavier et à la manette du menu. Un refus de sauvegarde conserve le menu et la partie hôte. La carte Opérations historique conserve le même contrôle de sauvegarde ; ce panneau est réservé aux développeurs dans cette branche.

Le DLC conserve son moteur Canvas séparé, son inventaire, ses 16 chapitres, 48 objectifs, 41 salles, 52 liaisons et sa clé `atf:mire:out-of-shadows:v1`. Ce raccord ne transforme pas le DLC en campagne native de GameEngine, MIRE ou Frontier Forge. Le bouton **Retour au Tantalus** sauvegarde le carnet et revient à l'hôte ; son comportement autonome original reste disponible dans le HTML archivé.

## Conservation de tout le lot récupéré

Les **321 fichiers** de l'archive originale sont préservés : **320 fichiers directs**, sans modification, sous [archives/dlc-hors-des-ombres-v010/original](../../archives/dlc-hors-des-ombres-v010/original), et le rapport intégral `RAPPORT_ILLUSTRE.html` dans le ZIP original exact. Ce rapport de 16 882 212 octets est déclaré dans `sourceArchive.zipOnlyMembers` du manifeste avec son SHA-256 ; sa copie directe dépasse la capacité de transport utilisée pour GitHub. Les sources, l'installateur, les outils, les changelogs, le jeu autonome, les autres rapports, les captures et les preuves historiques restent directement accessibles. **Aucune donnée originale n'est perdue.**

Le ZIP original de **93 449 215 octets** est conservé en **douze fragments de 8 Mio au maximum** sous `archives/dlc-hors-des-ombres-v010/archive`. Il est reconstituable à l'identique :

```sh
npm run archive:dlc:hors-des-ombres -- /chemin/ALIEN_HORS_DES_OMBRES_V0_10.zip
```

SHA-256 du ZIP : `8faa1e9c18e8db3ecefc99605ced070cf3acdae1f74b1f65017cadfed5db0bf3`.

Le [manifeste](../../archives/dlc-hors-des-ombres-v010/manifest.json) décrit chaque octet attendu et la correspondance entre source historique et copie active. Les preuves historiques n'ont pas été réécrites pour simuler une nouvelle validation. Le helper de lancement est nouveau ; le bridge et le retour UI sont adaptés au dépôt. Données, moteur, rendu et styles de la V0.10 restent identiques.

Seuls les huit fichiers de jeu approuvés sont distribués : l'entrée HTML, les six modules/styles du DLC et le helper de lancement. L'archive, les sources historiques en double, les rapports et les captures restent exclus du build public. L'admission vérifie les chemins exacts, tailles et SHA, refuse les fichiers non déclarés et les liens symboliques.

## Vérification reproductible

```sh
npm run qa:dlc:hors-des-ombres
npm run test:dlc:hors-des-ombres
npm run qa:dlc:hors-des-ombres:browser
npm run check
npm run build
npm run check:built
```

Le premier runner copie la livraison historique dans un dossier temporaire, exécute son build et ses onze suites, puis compare le bundle reconstruit à l'original. Il écrit ses nouvelles preuves dans `../audit/hors-des-ombres` et ne modifie aucun résultat historique. Les tests de raccord et la QA navigateur sont distincts des **772 tests moteur/installateur**.

La QA navigateur requiert Python, Playwright, Chromium et ses bibliothèques système ; elle a été exécutée dans un environnement Python isolé. Le script accepte `--base-url`, `--output` et `--chromium`.

Le [rapport QA de cette intégration](HORS_DES_OMBRES_INTEGRATION_20261125_QA.json) contient les résultats réellement obtenus, les journaux, les limites et les empreintes du code testé :

| Vérification | Résultat |
| --- | ---: |
| Moteur et installateur du DLC, onze suites | 772/772 |
| Raccord, continuation et gardes historiques, cinq suites | 51/51 |
| Parcours Chromium réel, sauvegarde persistante et mobile | 13/13 |
| Build complet et contrôle de la distribution produite | Codes 0 |
| Reconstruction du ZIP original | Taille et SHA-256 identiques |

Les **836 contrôles distincts** sont réussis ; les huit tests de continuation font déjà partie des 51 et ne sont pas comptés deux fois. Le build a été testé dans le checkout modifié basé sur `001a20b`, avant publication du commit d'intégration. Ce rapport ne prétend pas être le résultat d'une CI du futur commit.

## État de la V0.11 et fidélité

Le travail V0.11 évoqué dans la conversation n'a pas été retrouvé dans les fichiers locaux disponibles ni dans les archives sauvegardées. La copie de travail ancienne sous `/mnt/data/ALIEN_HORS_DES_OMBRES_V0_11` n'était plus disponible. **Cette livraison récupère V0.10 ; elle ne certifie pas l'intégration des 49 salles annoncées pour V0.11.**

Les pistes V0.11 à reprendre comprennent Heaven, la salle des machines, les nacelles, le sas du Narcissus, la ruche, la grande caverne, la cité enfouie et le puits de la jeune reine. Leur état évoqué comportait encore des chemins bloqués et trois tests en échec ; ces notes ne constituent pas des fichiers source récupérés ni une validation de fidélité.

Les plans, les personnages et une partie des interactions restent des reconstructions provisoires. L'audit original distingue attestations primaires, sources secondaires, adaptations et absences. Ni cette importation GitHub ni ses tests techniques ne certifient une fidélité franchise 1:1. Les données originales de référence sont conservées intégralement.

## Autres travaux locaux

Covenant, Mer des chagrins et Alien Resurrection ont été retrouvés dans d'autres répertoires actifs et font l'objet de reprises séparées. Cette branche contient l'ensemble récupéré de **Hors des ombres**. Elle ne certifie pas la publication de ces autres DLC.

Le chantier historique `archive/local-deliverables-20261125` a aussi été retrouvé : son index annonçait **2 256 fichiers prévus**, un état `initializing` et une liste `files` vide lors de la vérification. Cet inventaire ne prouve pas leur transfert. Les PR Blackout #54 et AVP 2004 #55 sont des publications distinctes, avec leur propre périmètre et leurs réserves explicites.
