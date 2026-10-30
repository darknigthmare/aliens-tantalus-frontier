# Costumes modulaires V170 — lot de revue graphique

Date : 30 octobre 2026. Statut : **sprites produits et découpés, non intégrés au build GitHub**.

Ce lot accompagne la continuation de la PR #23. Il s'appuie sur les PNG
générés au cours de la conversation : ni captures de films, ni éléments
certifiés à l'identique. L'archive a été fournie séparément dans la
conversation et **n'est pas un asset GitHub disponible au runtime**.

## Contenu livré séparément

- Ripley *Alien 3 / Fury 161* : haut matelassé brun, pantalon brun, bottes noires.
- Ripley 8 *Alien Resurrection* : haut de cuir roux sans manches, pantalon
  et bottes assortis.
- Andy *Alien: Romulus* : haut et pantalon gris, chaussures claires ;
  sac de ceinture gauche/droite **séparé du pantalon**.
- Navarro *Alien: Romulus* : veste de cuir caramel, haut à motif rouge,
  pantalon articulé et bottes de style western.

Par tenue : un atlas haut RGBA 1 254 × 1 254 et un atlas bas de même taille,
14 composants indépendants par atlas (6 torses + 8 bras/mains ; ou
2 bassins + 4 cuisses + 4 tibias + 4 pieds). Le sac d'Andy a deux vues.
**Total : 8 atlas sources, 112 pièces de vêtements et 2 accessoires,
soit 114 PNG séparés.**

Archive extérieure : `ALIENS_TANTALUS_COSTUMES_SPRITES_V170.zip`
(21 414 340 octets, SHA-256
`138aba808168b76898b0611db9aa7a7cc4b3ac86b183d724b86f9ee25144ef36`).
Ne pas construire d'URL de téléchargement GitHub pour ce fichier :
il n'est pas publié dans le dépôt.

## Contrôle technique déjà effectué hors moteur

Les huit sources sont en RGBA 1 254 × 1 254, avec une vraie plage alpha
0–255. L'extraction utilise les **14 composantes d'alpha** de chaque atlas
(seuil de segmentation > 40), plutôt qu'une grille fixe 4 × 4 qui aurait
coupé certaines pièces chevauchant leurs cellules théoriques. Le contrôle
vérifie l'identité des pièces et la couverture de tous les pixels opaques
admis ; chaque crop est recadré avec une marge transparente, avec son
rectangle source et son SHA-256 dans `manifest.json`.
Une galerie HTML `INDEX.html` et une planche de revue sont comprises.

Ce contrôle ne constitue PAS une réception de pivots, de collisions,
de contact des pieds, de l'orientation gauche/droite, de l'anatomie,
des poses animées, des visages, de la silhouette en jeu, des accessoires
ou des matériaux film à l'échelle native.

## Procédure d'intégration au moteur

1. Installer les PNG après revue dans un répertoire d'assets explicitement
   admis ; éviter les changements d'identifiants et les chemins implicites.
2. Associer chaque `id` du manifeste à l'emplacement déjà existant dans le
   rig. Régler les pivots sur le personnage réel, **pas** à l'aide d'un
   agrandissement artificiel des articulations. Utiliser les véritables
   coupes `sourceRect` pour garantir l'absence de fragments voisins.
3. Monter la pochette d'Andy dans un emplacement accessoire/dos ou taille
   indépendant, visible au-dessus du bassin mais sans doubler le sac.
4. Valider gauche/droite, idle, course, marche, accroupissement, couvert,
   visée, rechargement, escalade, blessure et nage selon les animations
   réellement disponibles. Vérifier chaque costume avec et sans arme :
   aucun fusil ne doit être dessiné par un vêtement.
5. Exécuter un aller-retour de sauvegarde pour chaque combinaison de pièces,
   un test avec assets absents, les contrôles de distribution et une
   inspection visuelle à la résolution native avant d'affirmer une
   intégration jouable.

## Périmètre non clos

Ces quatre adaptations ne ferment aucune ligne de **fidélité 1:1**
dans le registre. Les autres variantes de costumes, morphologies,
mains/casques/masques, sacs, marques, textures dorsales et les validations
de licences restent à traiter. Aucun changement de gameplay n'est
déclaré par le présent document.


---

## Annexe V173 — combinaison d'urgence Narcissus

Un lot autonome supplémentaire a été préparé à partir de références d'accessoires
et de costumes **utilisés pendant le tournage d'Alien (1979)** ; ne pas le confondre
avec les combinaisons de débarquement lourdes de Kane, Dallas et Lambert.

- Référence de l'ensemble d'urgence du Narcissus :
  https://propstoreauction.com/lot-details/index/catalog/138/lot/28190/
  (combinaison claire, conduites cousues, boîtier abdominal, casque à visière
  et gants caoutchoutés brun/jaune).
- Référence du costume de Ripley :
  https://entertainment.ha.com/itm/movie-tv-memorabilia/sigourney-weaver-ellen-ripley-spacesuit-from-alien/a/997049-1859.s
  (éléments matelassés et structure du casque).
- Archive locale remise dans la conversation :
  `ALIENS_TANTALUS_RIPLEY_NARCISSUS_UPPER_V173.zip`
  (6 182 047 octets, SHA-256
  `5ab306a3400c659167d2a5fe4887a4bb7c7f953a69c5ba485b0cb911ee4c6d26`).
- Contenu : **14 fichiers PNG RGBA réellement séparés** (six torses,
  huit bras/mains), atlas source et atlas corrigé, planche de contrôle et
  manifeste signé par empreintes de contenu.
- Correction technique : douze ouvertures cou/épaules délimitées en alpha
  au lieu de laisser une peinture noire opaque dans les cavités ; les
  silhouettes source restent identifiables et les quinze autres zones
  d'art ne sont pas recréées.

**État : PROTOTYPE PARTIEL, NON ÉQUIPABLE.** L'archive est un livrable
séparé, **pas** un nouvel asset GitHub. Manquent toujours : casque et
visière modulaires, jambes/cuisses/tibias/chaussures, couplage dorsal des
conduites, raccordements IK et pivots validés, animation en jeu, collision,
import et sauvegarde. Le volume des épaules a été adapté par la génération
et n'est **pas déclaré 1:1** avec les costumes de plateau.

Le compte de tenues équipables et toutes les preuves d'approbation
artistique restent donc inchangés. Le contrôle de conformité du projet
doit refuser toute tentative de rendre ce lot sélectionnable avant
installation des pièces manquantes et recette à la résolution native.
