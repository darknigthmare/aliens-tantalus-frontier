# V74 — comparateur du bestiaire, 3 et 4 silhouettes

## Défaut vérifié et correction

La [capture V73 de 055](../../v73-next50-audit/054-055/production-055-death.png) montrait la quatrième silhouette sous les trois références. Reproduction locale avant correction à 1280×720 : hauteur du comparateur 354,375 px, plans de sol à 713,125 et 886,3125 px. Le `flex-wrap: wrap` créait réellement deux sols malgré le texte annonçant un sol commun.

Le comparateur tient maintenant sur une seule rangée. Une unité CSS commune vaut `min(0.35px, (largeur disponible - espacements) / somme des largeurs de jeu)`. Elle pilote toutes les largeurs, hauteurs et compensations de pivot. Aucun atlas, aucune dimension de jeu ni aucun sprite n'a été modifié. Les trois références totalisent 670 pixels de jeu ; avec 055, le total est 858. La hauteur du plan est calculée à partir de l'encombrement maximal au-dessus du pivot, avec une réserve partagée sous le sol.

Les noms sont dans une légende numérotée indépendante des petits emplacements des sprites. Ainsi, un facehugger n'a plus son nom découpé dans une colonne de 35 px. La légende accessible comprend aussi le sujet choisi. Un média absent garde un emplacement signalé, sans lui attribuer de mesure physique fictive.

## Vérification réelle

Serveur de sources : `http://127.0.0.1:4173/`. Navigation depuis l'écran titre, entrée sur le Tantalus, retour au commandement, Xénobiologie, recherche de `Albino Chestburster` puis de `enemy-008-queen`. Redimensionnements dans la même session, sans rechargement requis pour adapter l'échelle.

| Sujet | Fenêtre | Largeur du comparateur | Hauteur du comparateur | Facteur commun théorique | Capture |
|---|---:|---:|---:|---:|---|
| 055, 4 silhouettes | 1280×720 | 296,719 px | 148,656 px | 0,317854 | [comparateur](055-1280x720-comparator.png) |
| 055, 4 silhouettes | 1280×900 | 296,719 px | 148,656 px | 0,317854 | [comparateur](055-1280x900.png) |
| 055, 4 silhouettes | 390×844 | 324 px | 159,453 px | 0,349650 | [comparateur](055-390x844.png) |
| Queen, 3 silhouettes | 1280×720 | 296,719 px | 159,594 px | 0,35 | [comparateur](008-1280x720.png) |
| Queen, 3 silhouettes | 1280×900 | 296,719 px | 159,594 px | 0,35 | [comparateur](008-1280x900.png) |
| Queen, 3 silhouettes | 390×844 | 324 px | 159,594 px | 0,35 | [comparateur](008-390x844.png) |

Les captures du comparateur utilisent un défilement normal du dossier/de la page pour montrer tout le module ; elles ne déplacent ni ne redimensionnent artificiellement le DOM. À 720 px de haut, la [vue initiale](055-1280x720.png) montre déjà les quatre silhouettes, mais la légende nécessite de défiler. Les contrôles d'animation restent avant le comparateur.

Assertions navigateur sur les six cas : tous les emplacements à l'intérieur du conteneur, aucun débordement horizontal, écart nul entre les lignes de sol, écart entre pivots physiques inférieur à 0,013 px et dispersion du facteur rendu inférieure à 0,000174 (arrondi de mise en page au 1/64 px). Les silhouettes et la légende sont ensemble visibles après défilement. Aucune erreur JavaScript signalée pendant la session.

Commandes exécutées :

```text
node --test tests/catalog-scale-v72.test.mjs tests/catalog-ui-v62.test.mjs
npm run lint
git diff --check
```

Résultats : 19 tests ciblés réussis ; lint syntaxe/sécurité réussi sur 292 modules ; pas d'erreur d'espacement du diff. Aucun build, déploiement ni statut d'ennemi accepté n'est revendiqué par cette sous-tâche. La session `atf-v74-catalog` est fermée après vérification.

## Reprise / non-régression

Le calcul partagé est dans `src/catalog-scale-v72.js`, son application seulement dans `CatalogWorkbenchV62.renderGameplayScaleV72`, et la mise en page dans `catalog-v62.css`. Les nouveaux tests vérifient 3/4 sujets, largeurs de conteneur 190–900 px, proportions conservées, pivots communs, légende séparée et média manquant. Le CSS utilise les unités de conteneur des navigateurs modernes.

Les compétences `vercel:agent-browser` et `vercel:agent-browser-verify` ont guidé la navigation réelle, les assertions de géométrie et l'inspection des captures. Cette correction concerne la lisibilité de l'échelle de rendu du jeu ; elle ne prouve ni fidélité graphique 1:1 ni dimensions canoniques en mètres.
