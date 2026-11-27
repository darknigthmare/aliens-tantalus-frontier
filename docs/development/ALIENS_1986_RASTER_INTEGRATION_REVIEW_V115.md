# Aliens (1986) V115 — pack raster et raccordement au jeu

## Résultat livré par ce chantier

Le pack place les nouveaux PNG individuels dans `assets/dlc/aliens-1986/v115/`. La galerie, le manifeste détaillé et les inventaires documentent leurs fichiers réels. Le runtime V114 conserve son rendu existant ; ce lot artistique ne constitue pas une nouvelle version jouable du rendu.

Instantané documentaire : `preparatory-snapshot` ; 70 fichiers déclarés dans le manifeste assemblé. Correspondance avec le ledger courant : **True**.

## Changements réels et admissions

| Chemin | Rôle |
|---|---|
| `assets/dlc/aliens-1986/v115/` | Images de production sélectionnées ; les PNG/WebP bénéficient de la politique d’images existante. |
| `docs/development/aliens-1986-sprites-v115/index.html` | Galerie de revue, source seulement. |
| `docs/development/aliens-1986-sprites-v115/manifest.json` | Métadonnées, dimensions, SHA, provenance, pose ou grille ; source seulement. |
| `docs/development/aliens-1986-sprites-v115/README.md` | Mode de revue et limites ; source seulement. |
| `docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.{json,md}` | Rapprochement des 81 besoins avec preuves et états réels ; sources seulement. |
| `docs/development/ALIENS_1986_RASTER_INTEGRATION_REVIEW_V115.md` | Présente revue ; source seulement. |
| `scripts/public-aliens1986-dlc-admissions.mjs` | Liste fermée des nouveaux documents et du test ; refus des membres de revue inconnus. |
| `scripts/verify-aliens1986-sprite-pack-admission-v115.mjs` | Quatre contrôles des frontières source/build, aliases et octets du runtime. |
| `scripts/verify-aliens1986-dlc-integration.mjs` | Charge ces quatre tests via l’alias déclaré existant. |

L’admission des images au dépôt est distincte de leur chargement en jeu. Le manifeste de revue sous `docs/` n’est pas une ressource distribuée au joueur. Aucun ajout d’image dans le dossier runtime historique `dlc/aliens-1986/` n’est nécessaire pour publier ce pack source.

## Archive et runtime conservés

L’archive récupérée conserve ses 1 159 fichiers et son manifeste épinglé. `dlc/aliens-1986/` reste limité à `index.html` et `game.html`. Le jeu autonome contient un registre de modules `{source, deps, sha256}` : `moduleUrl(id)` transforme les imports en URLs Blob avant de charger `preview/app.mjs`.

| Référence immuable | Valeur |
|---|---|
| SHA-256 du manifeste de récupération | `5bfb37cc785657a11e62fe1ca0b92093e2b8b5bd0935fb0bf2cedd0f87da0acd` |
| Taille de `game.html` | 780 305 octets |
| SHA-256 de `game.html` | `9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d` |
| Total des deux HTML runtime | 782 652 octets |

## Vérifications réellement exécutées

Reçu courant : 2026-11-25T21:18:57.255670+00:00 ; base `b89dc6ba47ee1ca90de29f3ccff47ddfe699d2d9` ; Node `v24.22.3`.

| Commande | Résultat enregistré |
|---|---|
| `npm run test:dlc:aliens1986` | 689 réussis, 0 échecs, 0 ignorés ; code 0 |
| `npm run check:dlc:aliens1986` | Code 0 ; résultat True |

Empreintes des scripts concernés par ce reçu :

| Script | SHA-256 |
|---|---|
| `scripts/public-aliens1986-dlc-admissions.mjs` | `154777886c59790a1a0c87d81b5b2f866610a4d144ef6727e7f6b71df6973e9b` |
| `scripts/verify-aliens1986-dlc-integration.mjs` | `ba92f2589f26b9d6604fa002d5407c079b158ab3b1719d9000431d7e22a807e9` |
| `scripts/verify-aliens1986-sprite-pack-admission-v115.mjs` | `e5cfadfb90871dc21039f0a6538b0ee3c2ef7542325fc0ae4a4a4357de19ecae` |

Ces gates couvrent le corpus historique, les frontières d’admission et l’intégrité du runtime. La QA des images, de la galerie et des grilles doit être reliée à ses propres empreintes. Aucune réussite de parcours raster en jeu ou de fidélité filmique ne découle des tests de code.

## Raccordement minimal à réaliser dans un chantier distinct

1. Garder les sources récupérées `modules/aliens-1986/v114/` et leurs hashes intacts. Générer une copie dérivée du bundle autonome avec un script déterministe vérifiant le hash d’entrée.
2. Embarquer un manifeste runtime restreint aux images et poses effectivement admises. Le manifeste de revue sous `docs/` ne doit pas être chargé par le jeu distribué.
3. Résoudre les images depuis `document.baseURI`, par exemple `new URL('../../assets/dlc/aliens-1986/v115/characters/ripley-idle-right.png', document.baseURI)`. Une résolution depuis `import.meta.url` échouerait pour les modules Blob.
4. Essayer le rendu raster dans les fonctions de personnage/prop puis conserver un repli explicite pour une image absente, un décodage échoué ou une pose non fournie.
5. Conserver projection, ligne de sol, tri par profondeur et passe de lumière. Recaler les pivots et attaches dans le jeu ; ne pas transformer une boîte alpha mesurée en calibration validée.
6. Contrôler séparément armes incluses ou séparées, marquages asymétriques, tenues par scène et transitions. Les planches de poses ne constituent pas automatiquement des boucles fluides ni des timings de tir/interactions.
7. Réviser précisément les attentes du bundle dérivé et les gates concernés, sans réécrire les déclarations d’archive ou élargir globalement les admissions.

## Points restant ouverts

- Les périmètres bloqués et toute correction refusée restent documentés ; aucun remplacement d’identité n’est inféré.
- Les états secondaires et animations sont suivis dans l’inventaire, même quand une base statique ou une planche existe.
- La position des portes, les passages physiques, les appuis de props, les collisions et les sauvegardes ne sont pas modifiés par le pack artistique.
- La validation en jeu doit couvrir au minimum une scène civile, un Marine équipé, Newt, un smartgunner et une créature, avec éclairage, occlusion, orientation et pose manquante.
- L’autonomie du chargement local et le coût mémoire doivent être mesurés après raccordement. Les dimensions natives sont dans le manifeste ; aucune performance n’est annoncée sans mesure.

La ressemblance au film se vérifie image par image avec les références adaptées à la scène. Le terme « généré » atteste un fichier, pas une fidélité 1:1.
