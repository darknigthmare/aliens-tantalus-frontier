# Fleuve de la Douleur — habillage visuel 1

Cette présentation dérive de la version récupérée `0.9.0-candidate.1`. Elle ajoute
des sprites PNG individuels au jeu existant. Ce travail ne constitue pas une
récupération de la version 0.10 autrefois restée locale.

## Jouer et examiner les images

- Ouvrir le DLC depuis le menu de Tantalus Frontier : le wrapper lance cette présentation.
- Dans un dossier extrait, ouvrir `JOUER.html` en conservant `assets/` à côté.
- Ouvrir `GALLERY.html` pour comparer chaque sprite sur fond sombre, clair ou damier,
  filtrer par catégorie et télécharger les PNG séparément.
- Le lien « Version d’origine » du wrapper conserve l’accès au jeu 0.9 historique.

Les nouvelles images n’ajoutent ni objet dans une sauvegarde ni arme dans la dotation.
Les sauvegardes utilisent toujours le préfixe historique du DLC.

## Couverture réelle

Le fichier `sprite-manifest.json` est la liste exacte des images admises, de leurs
identités, poses, accessoires, ancrages et empreintes. Une image représente un
seul personnage, objet ou élément de décor, sans planche de sprites découpée.

Les personnages nommés disposent d’une pose fixe ; les Marines ont une pose
avec arme rangée. Les résidents originaux portent leur accessoire métier dans le PNG.
Le moteur n’ajoute pas un second outil vectoriel lorsque cette image est utilisée.
Le facehugger, les œufs, les mallettes, la vitre et les bocaux ont des correspondances
sélectives. Les objets illustrent les poches, les réserves et les commandes existantes.

Les mouvements, tirs, blessures, accroupissements et autres poses absentes conservent
le dessin natif. Le Warrior adulte et les sprites d’armes ne sont pas remplacés par
des images non validées. Les collisions, alertes, passages et états de mission restent
ceux du modèle récupéré.

## Références et limites de fidélité

La fidélité 1:1 est un objectif de travail, pas une propriété certifiée de ce lot.
Les notes de chaque entrée distinguent référence filmique, accessoire original,
réplique commerciale, description du roman et création propre au DLC. Les visages
non documentés demeurent des interprétations. Le miroir gauche retourne l’image ;
il ne valide pas la position des détails asymétriques d’un costume.

Le détecteur utilise une réplique Master Replicas pour la forme complète et une
photo d’écran original comme référence complémentaire. Les photos de recherche ne
sont pas redistribuées. Le journal `GENERATION_LOG.json` conserve les prompts et les
résultats retenus ; les références publiques détaillées se trouvent dans
`docs/development/RIVER_OF_PAIN_SPRITE_REFERENCES.md` à la racine du dépôt.

## Construction reproductible

Depuis la racine du dépôt :

```sh
node scripts/build-river-of-pain-visuals.mjs
node scripts/build-river-of-pain-sprite-gallery.mjs
node --test scripts/verify-river-of-pain-sprites.mjs
```

Le build hôte appelle les deux générateurs. Ils lisent le standalone original sans
le réécrire. Les 222 fichiers récupérés et les neuf archives historiques gardent
leurs empreintes. Les métadonnées, prompts, scripts de production et rapports ne
sont pas servis dans la distribution publique ; seuls les fichiers runtime
explicitement admis y sont copiés.

Les images sont les PNG complets produits par le générateur, sans recadrage ni
retouche par un script. Leur canal alpha est contrôlé : des couleurs RGB peuvent
subsister sous un alpha nul et apparaître dans certains aperçus bruts, sans être
visibles dans une composition normale.
