# Fleuve de la Douleur — présentation PNG

Cette présentation dérive de la version récupérée `0.9.0-candidate.1`. Elle ajoute
des sprites PNG individuels au jeu existant. Ce travail ne constitue pas une
récupération de la version 0.10 autrefois restée locale.

## Lot 4 — huit illustrations documentées dans la bible

Le 26 novembre 2026, huit études visuelles complètent la
[bible de production](bible/README.md) : Jonesy, le Medlab, le Daihotai,
l’épave extraterrestre, le sol rocheux, la surface de LV-426, la serre et la
tour de communications Uplink. Ces huit PNG représentent **19 582 657 octets**.
Ils sont conservés entiers dans `bible/production/`, avec leurs prompts,
références, dimensions, empreintes et limites dans
[PRODUCTION_ASSETS.json](bible/PRODUCTION_ASSETS.json).

La tour Uplink possède une nouvelle fiche documentaire distincte. Son image
illustre cette fiche et fournit un contexte visuel au lieu « antenne » ; elle
ne valide pas le plan ou l’implantation de ce lieu. Les fiches distinguent
les illustrations du sujet, les références de contexte et les PNG du jeu.

La bible comprend **279 fiches** : 83 reliées à un PNG runtime, huit autres
dont le sujet est illustré en production et une fiche avec seulement une
image de contexte. **188 fiches restent sans image de leur sujet**, dont
**187 sans aucune image**. Le filtre « Sans image du sujet » conserve les
fiches qui ne disposent que d’un contexte.

Les **78 PNG runtime** et leurs raccordements restent ceux du lot 3. Les
nouvelles images sont des études de production : elles ne créent ni acteur
animé, ni véhicule pilotable, ni intérieur traversable. Les fichiers de la
bible sont admis précisément comme sources et exclus de la distribution publique.

La version retenue de Jonesy est sur fond gris opaque, après deux essais de
détourage écartés. Les découpes du Daihotai, de l’épave et de la tour conservent
un faible bruit alpha périphérique, documenté avant toute éventuelle intégration.
Le terrain ne constitue pas une texture sans couture certifiée et le panorama
de LV-426 ne définit pas une carte officielle.

Le service de génération a refusé le lot d’essais M41A/M240 et l’essai de
Xénomorphe adulte ; aucun PNG exploitable de ces essais n’est déclaré livré.
Les fiches correspondantes conservent les manquants et la trace des tentatives.
Le [rapport de qualification](../../../docs/development/RIVER_OF_PAIN_SPRITE_QA.md)
précise les vérifications réalisées pour ce lot.

## Lot 3 — huit meubles et bible de production

Le 26 novembre 2026, huit PNG individuels complètent les familles `rack`,
`shelf`, `medicine`, `cupboard`, `fridge`, `table`, `stove` et `linen`.
Les nouveaux fichiers totalisent **18 171 047 octets**. Le corpus actif contient
**78 PNG**, soit **137 932 789 octets**, sans modification des pixels des lots antérieurs.

Ces huit familles concernent 35 placements existants : 26 décors sont admissibles
à la présentation PNG et neuf obstacles gardent leur dessin natif. Avec le lot 2,
les 36 familles de décor supplémentaires couvrent **148 décors admissibles** et
**17 instances physiques conservées**. L’enveloppe des étagères descend à +1
unité : leur hauteur logique est 171, mesurée dans le renderer d’origine.

Les ancrages du lot 3 utilisent les bornes alpha ≥ 16. Le PNG entier est dessiné
sans découpe ni retouche de pixels. Aucun des huit nouveaux fichiers ne touche
un bord à ce seuil ; de faibles pixels alpha 1–15 peuvent subsister autour du
détourage. Les meubles reprennent les types du projet : leur modèle individuel
n’est pas authentifié comme accessoire précis du film.

### Bible détaillée

La [bible de production](bible/README.md) regroupe personnages, lieux,
armes et équipements, props, véhicules, vaisseaux, terrains et mondes.
Elle conserve les identifiants, les placements, les connexions et les sources,
et distingue production d’une image, intégration au jeu et validation de fidélité.
Elle inclut des fiches manquantes attestées dans les extraits du roman.

### Chargement et validation

Le chargement est limité à quatre PNG simultanés. Les navigateurs disposant de
`createImageBitmap` préparent des textures de rendu dont le plus grand côté est
limité à 1 024 pixels, tout en conservant les PNG sources, leurs dimensions et
les coordonnées des ancrages. Le navigateur conserve le chemin de chargement
classique si cette API n’est pas disponible.

La recette locale finale valide **31/31 tests de sprites**, **183/183 contrôles
HTTP du DLC** et **175/175 contrôles file://** sous Chromium 143.0.7499.4.
Les **78 PNG** chargent avant et après la reprise réelle de sauvegarde.
La construction canonique du HTML et de la galerie est identique à la version
publiée. Les 222 fichiers historiques v0.9 restent identiques à leurs empreintes.

La bible comprend **278 fiches** et les dimensions vérifiées des **78 PNG** ;
ses neuf contrôles HTML et ses vues desktop/mobile ont été validés. Les tests
de production et du parcours complet depuis le titre hôte sont suivis dans
le workflow associé à la PR. La bible et la galerie ne prouvent ni la jouabilité
des fiches absentes, ni une fidélité 1:1 complète.

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

### Lot 1 intégré — PR 62

Le premier lot a retenu **42 PNG individuels** : 26 identités humaines, un
facehugger, quatre images de décor et onze objets ou équipements. Sa recette
Chromium a été réalisée et validée dans le cadre de la PR 62.

Les personnages nommés disposent d’une pose fixe ; les Marines ont une pose
avec arme rangée. Les résidents originaux portent leur accessoire métier dans le PNG.
Le moteur n’ajoute pas un second outil vectoriel lorsque cette image est utilisée.
Le facehugger, les œufs, les mallettes, la vitre et les bocaux ont des correspondances
sélectives. Les objets illustrent les poches, les réserves et les commandes existantes.

### Lot 2 admis — 28 types de décor supplémentaires

Le deuxième lot ajoute **28 PNG admis**, un par type, pour le mobilier médical,
l’atelier, la manutention, les appareils de contrôle et l’habitat. Le manifeste
validé par le builder contenait alors **70 PNG individuels**, avec les
42 images du premier lot. Le dossier conserve le nom `visual-v1` pour
accueillir les deux lots.

Les 28 types représentent **130 instances existantes dans le plan du DLC** :
122 sont des décors sans collision ni empreinte physique, admissibles au nouvel
habillage ; huit restent dessinées par le moteur natif, avec leurs obstacles et
leurs emprises. Ces huit exemplaires appartiennent aux types `lab-bench`,
`pump-motor`, `bench` et `vending`. Le décompte détaillé se trouve dans
[l’inventaire](../../../docs/development/RIVER_OF_PAIN_SPRITE_INVENTORY.md).

L’adaptateur retrouve chaque décor par son identifiant et son type dans sa
salle. Les appareils synthétisés pour les objectifs et les conteneurs
interactifs suivent leurs propres chemins de rendu. Pour les décors admis,
le PNG entier est redimensionné uniformément dans l’enveloppe visible du
modèle natif : proportions conservées, largeur plafonnée, ancre basse et
hauteur d’accrochage respectées. Le contrôle de l’image complète porte aussi
sur les pieds, roues, antennes et flexibles. Les textes `UNITÉ OBSTÉTRICALE`, `FIRE`, `STOCK` et `!`
sont conservés par le moteur et réservés hors des inscriptions du PNG, afin
de garder une seule légende au bon emplacement.

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

Pour le lot 2, l’extrait autorisé de *River of Pain* documente la grande unité
natale sous un capot principalement transparent et les moniteurs blancs aux
témoins verts et bleus. Ces repères concernent `natal-unit` et `white-monitor` ;
leur châssis détaillé, le contrôleur, le pied et le tracé ECG restent adaptés.
L’apparence des 26 autres types reprend le modèle et la palette du DLC. Aucun
accessoire précis du film n’est certifié pour ces objets. L’optique de
`microscope` précise notamment un rôle que le dessin natif représentait par
un pupitre générique.

Le détecteur utilise une réplique Master Replicas pour la forme complète et une
photo d’écran original comme référence complémentaire. Les photos de recherche ne
sont pas redistribuées. Le journal `GENERATION_LOG.json` conserve les prompts et les
résultats retenus ; le [registre des références](../../../docs/development/RIVER_OF_PAIN_SPRITE_REFERENCES.md)
détaille les sources et les limites de chaque comparaison.

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

Les versions retenues de `natal-unit` et `glass-cabinet` corrigent leurs vitrages
avec une transparence réelle dans le canal alpha. Les PNG admis restent les
fichiers complets produits par le générateur, sans modification de leurs pixels
par les scripts de contrôle ou d’intégration.

La construction historique du lot 2 a validé le manifeste de 70 images et reconstruit le standalone
dérivé. La recette du lot 2 porte sur les proportions, les légendes et la
composition dans les scènes réelles ; le bilan historique du lot 1 reste
identifié séparément.
