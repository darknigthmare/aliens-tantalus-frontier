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


---

## Annexe V174 — contrôle des découpes source des trois armureries

Le fichier local `ALIENS_TANTALUS_ARMURERIE_RASTER_QA_V174.json` compare
les **96 découpes RGBA** du pack armureries V172 à leurs rectangles
dans les trois vrais atlas sources. Résultat : 96/96 correspondances
octet-pixel, aucun crop entièrement vide, empreintes originales inchangées.

Une découpe séparée n'est pas nécessairement une *isolation graphique* :
neuf paires de rectangles **effectivement rendus par le moteur** se
chevauchent sur des pixels opaques (5 dans Tantalus, 2 dans la colonie,
2 dans la station). Leur destination à l'écran est indépendante ; les
pixels recopiés peuvent donc créer du mobilier doublé.

| Zone source partagée | Source actuelle (x,y,w,h) | Correction minimale proposée |
| --- | --- | --- |
| `main-sign` | 5,433,695,112 | largeur 689 |
| `weapon-rack-a` | 477,715,170,144 | largeur 167 |
| `weapon-rack-b` | 644,715,174,145 | largeur 170 |
| `ammo-wall` | 814,716,231,144 | largeur 227 |
| `glass-counter` | 8,722,361,134 | largeur 357 |

Ces cinq retouches évitent les neuf intersections géométriques entre les
éléments sélectionnés, sans changer les coordonnées des comptoirs,
terminaux, portes, vendeurs ou collisions. Elles ne doivent toutefois pas
être livrées comme un simple changement visuel aveugle : il faut
**recette de rendu à l'échelle native sur les trois vrais niveaux**,
vérification de l'alignement du mobilier et nouveau reçu de succession
SHA-256. Les cinq corrections sont proposées, **pas encore appliquées au
module runtime** dans cette annexe.

Le contact des pièces avec le sol et leur cohérence architecturale ne
peuvent pas être certifiés à partir d'un atlas isolé. Cette étape reste
ouverte pour la fidélité 1:1 et pour la validation des vendeurs des
colonies/stations, distincts de Sanaa Doyle sur le Tantalus.


## Lot de vérification V175 — extraction séparée (30 octobre 2026)

Le lot V175 a été produit **hors dépôt**, à partir des atlas sources des
quatre adaptations ci-dessus, sans modifier les 8 atlas originaux.

- Archive conversation : `ALIENS_TANTALUS_COSTUME_PARTS_V175.zip`
- Taille : 21 950 767 octets
- SHA-256 : `c965987eadc9c6eb4a7a3fd49065797253fe03b21f8b734aa95179bdaff5195d`
- Contenu : 4 tenues, 8 atlas source de vêtements, 112 membres/segments
  indépendants, 2 orientations du sac d'Andy et son atlas de provenance,
  un manifeste `manifest.json`, le relevé `CHECKS.json`, une galerie HTML
  et une planche de comparaison des atlas.
- Contrôle automatique : huit atlas 1 254 × 1 254 en RGBA, chacun avec
  exactement 14 composantes d'alpha majeures; noms de pièces, coupes et
  empreintes SHA-256 dans le manifeste. Les éléments sont extraits par
  masque de composantes plutôt que par cellules rectangulaires uniformes,
  empêchant la contamination par le sprite voisin.

**Périmètre non attesté :** ces sprites ne sont ni inscrits aux registres de
sprites du runtime ni importés dans la branche GitHub, et ils ne sont pas
homologués à l'identique des costumes canoniques. Avant inclusion dans un
prochain commit, exiger des contrôles visuels gauche/droite, pivots et
jointures, mouvement et armement, rendu natif, persistance des sauvegardes
et état des droits. La présence de PNG indépendants ne vaut pas
intégration moteur ni validation 1:1.


### Importateur V175 à contrôle d’intégrité

Le nouveau script **source-only** `scripts/install-costume-art-v175.mjs` est
inclus dans la branche. Il n'effectue ni téléchargement ni activation
automatique des vêtements. Après décompression de l'archive V175 :

```bash
node scripts/install-costume-art-v175.mjs /chemin/vers/ALIENS_TANTALUS_COSTUME_PARTS_V175 --verify
node scripts/install-costume-art-v175.mjs /chemin/vers/ALIENS_TANTALUS_COSTUME_PARTS_V175 --stage
```

Le contrôle fige le manifeste exact, les 8 atlas des costumes, les 114
sprites distincts et l'atlas source du sac d'Andy (123 PNG au total).
Il vérifie les SHA-256, les dimensions et la sécurité des chemins.
`--stage` installe seulement dans
`assets/openai/sprites/player/costume-review-v175/`, sans réécrire
les ressources anciennes. Le répertoire n'est **pas** enregistré dans le
rig ni admis à la publication. Son admission exige un correctif distinct
et une QA des pivots, animations, dimensions, collisions et variantes
gauche/droite. Le contrôleur
`scripts/verify-costume-art-installer-v175.mjs` est déclaré aux
régressions de costumes, sans dépendance envers l'archive absente en CI.


### Critères de comparaison aux costumes originaux

Le dossier suit les références de **costumes de tournage**, en
séparant attributs attestés et hypothèses visuelles. Aucun lien ci-dessous
ne constitue une admission de reproduction 1:1 ou un droit d'utilisation
commerciale.

| Costume | Éléments explicitement attestés | Éléments V175 encore à comparer |
|---|---|---|
| Ripley, Fury 161 | Propstore décrit un blouson brun à capuche, poches latérales et oeillets métalliques (sans boutons ni zip); un autre uniforme comporte aussi manteau vert et insignes. | Piquage et usure, taille des oeillets; manteau vert/insignes comme variante séparée; tête et raccords aux animations |
| Ripley 8 | Julien's confirme veste et pantalon de cuir brun-roux matelassés, débardeur beige, bottes oxblood à nombreux crochets; Propstore atteste une variante utilisée sous l'eau. | Détails du relief biomécanique et crochets, variantes sous l'eau, peau et animation; échelle film du vêtement |
| Andy, Romulus | Carlos Rosario confirme le sac de ceinture du personnage; il indique que les chaussures d'Andy proviennent de Crafted Society. | Correspondance précise des baskets, sac aux deux orientations, col et écusson, silhouette et palette selon éclairage |
| Navarro, Romulus | Rosario décrit le motif spécifique de chemise hawaïenne à palmiers, la veste et les autres couches de cuir; les multiples de tournage diffèrent selon les étapes d'acide et de sang. | Motif de tissu **encore approximatif** et non certifié, accessoires de poignet/collier/gants, variants de salissure, coiffure/casque et vue arrière |

Sources primaires ou entretiens avec le chef costumier :
- Propstore Ripley Fury 161 : https://propstore.com/product/alien-1992/ripleys-sigourney-weaver-jacket/
- Propstore uniforme complet Fury 161 : https://propstoreauction.com/lot-details/index/catalog/138/lot/28200/ALIEN-3-1992-Ripley-s-Sigourney-Weaver-Prison-Uniform
- Julien's lot 788 Ripley 8 : https://www.juliensauctions.com/en/items/72008/sigourney-weaver-ripley-screen-used-costume-from-alien-resurrection-with-dvd
- Propstore Ripley 8 version sous-marine : https://propstore.com/product/alien-resurrection-1997/12-ellen-ripleys-sigourney-weaver-distressed-underwater-ensemble/
- Carlos Rosario (Dazed) : https://www.dazeddigital.com/fashion/article/64405/1/alien-romulus-costume-designer-carlos-rosario-fede-alvarez-cailee-spaeny
- Carlos Rosario (CAFTCAD) : https://www.caftcad.com/alien-romulus
- Carlos Rosario (No Film School) : https://nofilmschool.com/carlos-rosario-alien-romulus

L'absence d'un élément ne doit pas être comblée par un costume générique
mis en statut « fidèle » : inscrire `A_REPRODUIRE` ou
`REFERENCES_INSUFFISANTES` avant génération et validation côte à côte.


### V176 — QA aller-retour pixels des PNG source

L'importateur V175 propose maintenant un second mode **plus strict**, qui
décode les huit atlas sources et les 112 pièces haut/bas en RGBA 8 bits, puis
reconstitue chaque atlas à ses coordonnées `source_bbox_px` :

```bash
node scripts/install-costume-art-v175.mjs /chemin/vers/ALIENS_TANTALUS_COSTUME_PARTS_V175 --verify-pixels
```

Ce contrôle exige **0 pixel opaque perdu, modifié, ajouté ou superposé**
(seuil de transparence alpha > 40). `--stage` doit également réussir le
même aller-retour avant de créer le répertoire de revue. Les métadonnées
SHA-256 et les 123 PNG restent contrôlés avant tout décodage.

Un contrôle direct sur les fichiers V175 livrés dans la conversation le
30 octobre 2026 a obtenu les huit reconstructions suivantes sans aucune
anomalie (nombre de pixels opaques par atlas) :

| Tenue | Haut | Bas |
|---|---:|---:|
| Ripley — Fury 161 | 618 536 | 443 559 |
| Ripley 8 — Resurrection | 516 087 | 482 847 |
| Andy — Romulus | 630 539 | 525 814 |
| Navarro — Romulus | 643 305 | 495 870 |

**Ce résultat est une certification de découpe, pas de fidélité film.**
Il ne vérifie pas les coutures, le placement d'articulations, les pivots,
les silhouettes de gauche à droite, les interactions d'armes, les
animations du joueur, la continuité visuelle des niveaux ou les droits.
Le test npm `verify-costume-art-installer-v175.mjs` permet d'exécuter
le même contrôle avec `TANTALUS_V175_ART_ROOT` lorsque l'archive
physique décompressée est disponible. L'absence de l'archive en CI
est un **skip déclaré**, pas un succès du rendu en jeu.


## QA topologique V177 — pièces détachées

Un audit hors moteur a réexaminé les octets du pack V176 fourni par
l'utilisateur (archive SHA-256
`ad52a6160f3a9dd21f99cdb0dc0f233bcc10123996a90f259c903b09b9a76090`).
Résultat indépendant de l'ancien aller-retour pixel :

- 8 atlas sources, 114 pièces séparées dont 112 membres et 2 pochettes.
- **24 torses** contiennent **48 ouvertures transparentes internes**
  d'au moins 30 pixels (deux par torse, correspondant aux emplacements
  de cou et d'épaule).
- Aucun sprite ne touche sa bordure opaque, et chacun conserve une
  composante visible principale de plus de 100 pixels.
- **0 défaut critique détecté** de topologie alpha à ce seuil.

L'importateur V175 contrôle maintenant ces contraintes avant
`--verify-pixels` et `--stage`, en plus des empreintes et de la
reconstruction des pixels. La réception ne garantit toujours pas le
**pivot, l'orientation, la position articulaire, l'animation, la
silhouette 1:1 ni les droits**. Une archive de suivi externe
`ALIENS_TANTALUS_V177_TOPOLOGY_QA.zip` fournit les résultats par sprite
et le modèle des coordonnées de rig, avec tous les pivots laissés à
`null` plutôt que fabriqués. SHA-256 de cette archive :
`ab3c661c08e764ad44c160558e8098e13295b28995d2961c7e51dfaf52a19461`.
Aucun des 123 PNG du lot n'a été ajouté à la distribution publique.


## V180 — matrice exhaustive des 31 tenues du catalogue V119

Cette matrice part des **31 IDs réellement enregistrés** dans
`src/franchise-costumes-v119.js` et de leurs raccords actifs à
`src/player-costume-outfits-v165.js` (état GitHub du 30 octobre 2026).
Elle ne confond pas un portrait de référence, une tenue en atlas séparé
hors du dépôt, et une combinaison effectivement équipable.

**Résultat source : 13 adaptations équipables, 18 références non équipables.**
Le premier groupe reste `exact: false`. Parmi les 18, les quatre
`fury-ripley`, `ripley8`, `andy-coveralls` et `navarro-jacket`
disposent d'un lot V175/V176 de sprites externes **non liés au rig**.
Les 14 autres n'ont pas ce lot à admettre. Les éventuelles photos de
production sont des références, jamais des sprites redistribuables.

### Les 13 adaptations jouables existantes (fidélité 1:1 non certifiée)

`nostromo-crew`, `ripley-bomber`, `hicks-combat`,
`hudson-combat`, `vasquez-bdu`, `bishop-utility`,
`amanda-working`, `sevastopol-security`,
`working-joe-uniform`, `rain-jacket`,
`fireteam-nostromo-jacket`, `fireteam-flightsuit`,
`fireteam-seegson-maintenance`.

### Les 18 admissions manquantes (identifiants stables conservés)

| Référence exacte V119 | Priorité | Statut vérifié | Travail concret avant admission |
|---|---|---|---|
| `fury-ripley` | P0 | Sprites V176 externes | Calibrer les membres; ajouter la couche grand manteau vert et sa fixation; comparer marques et usure, vue de dos, capuche et tee-shirt |
| `ripley8` | P0 | Sprites V176 externes | Calibrer gilet et peau des bras; variantes de vieillissement/eau; raccorder les mains, pantalon et bottes |
| `andy-coveralls` | P0 | Sprites V176 externes | Pivots réels, fermeture/col, fixation 2 orientations du sac banane sans double sac, chaussures et animations |
| `navarro-jacket` | P0 | Sprites V176 externes | Rechercher motif original de palmiers, cuir et état usé; gants/montre/collier, profil asymétrique et chaussures |
| `nostromo-dallas-compression` | P1 | Aucun atlas admis | Enveloppe pression, sous-couche, casque complet, col et visière, pack dorsal, tuyaux et bottes propres à Dallas |
| `nostromo-ripley-compression` | P1 | Aucun atlas admis | Variante Ripley distinguée de Dallas par marquages/accessoires vérifiés, casque, tuyaux, sac et transitions de combinaison |
| `prometheus-expedition` | P1 | Aucun atlas admis | Casque globe indépendant, col avec électronique, plaques pectorales, pack batterie, gants et bottes; ne pas confondre tenue d'expédition avec EVA |
| `covenant-expedition` | P1 | Aucun atlas admis | Isoler la tenue ECO survival de l'IVA spatiale : casque, anneau, visières, pack, éclairages et semelles magnétiques suivant le modèle |
| `rain-pressure` | P1 | Aucun atlas admis | Sous-vêtement, enveloppe spatiale, casque, connexion O₂, pack et couche supérieure; chaque état doit correspondre à la scène |
| `romulus-hazmat` | P1 | Aucun atlas admis | Protection contaminée, visière/respirateur, protection des mains et des pieds et degré d'usure, à rapprocher du rôle exact |
| `fury-inmate` | P2 | Aucun atlas admis | Décliner par détenu identifié, sans transférer le uniforme de Ripley à tous; vue de dos et vieillissement |
| `betty-crew` | P2 | Aucun atlas admis | Séparer Call et autres membres du Betty en costumes individuels, au lieu d'inventer une tenue collective unique |
| `david8` | P2 | Aucun atlas admis | Uniforme de David 8 selon scène, couches/col/chaussures et silhouettes synthétiques; distinguer tenue du personnage et simple cosmétique Echo9 |
| `walter` | P2 | Aucun atlas admis | Uniforme de Walter et ses variantes, sans recycler automatiquement la silhouette ou l'identité de David |
| `fireteam-specialist` | P2 | Aucun atlas admis | Costume Specialist exact selon mise à jour/kit, pièces de protection, accessoires et marquages séparés |
| `fireteam-ape-mk3` | P2 | Aucun atlas admis | Armure APE Mk.3, casque, joints de pression et silhouette avec équipement, variantes par classe à sourcer |
| `dark-descent-marine` | P2 | Aucun atlas admis | Armures et dotations de Lethe, séparation visuelle grade/équipement et vérification des accessoires |
| `dark-descent-technician` | P2 | Aucun atlas admis | Tenue technique de Lethe, protections et outillage distincts des marines de combat |

### Sources primaires et témoins vérifiables

- [Propstore, ensemble Ripley *Alien 3*](https://propstoreauction.com/lot-details/index/catalog/138/lot/28200/ALIEN-3-1992-Ripley-s-Sigourney-Weaver-Prison-Uniform) : manteau vert, veste brune matelassée, tee-shirt et pantalon, insignes Fury 161.
- [Propstore, combinaison *Prometheus*](https://propstoreauction.com/lot-details/index/catalog/347/lot/113009) : casque globe avec écrans, col, plaques et pack batteries, gants et bottes.
- [Propstore, combinaison Tennessee *Covenant*](https://propstoreauction.com/lot-details/index/catalog/359/lot/118657/Lot-20-ALIEN-COVENANT-2017-Tennessee-s-Danny-McBride-Screen-matched-Light-up-Hero-Spacesuit-Display) : casques/visières et feux, pack, chaussures à témoin magnétique; **ne pas transférer cette configuration à tous les personnages**.
- [Entretien Carlos Rosario, *Alien: Romulus*](https://www.motionpictures.org/2024/09/alien-romulus-costume-designer-carlos-rosarios-retro-vision-vintage-style-blends-part-one/) : vêtements industriels d'Andy, chemise de Navarro conçue pour la production, chaussures de Rain.
- [Entretien complémentaire, *Alien: Romulus*](https://nofilmschool.com/carlos-rosario-alien-romulus) : motif de palmiers imprimé pour Navarro, cuir et veste rouge de Rain.

### Gates qui doivent réussir pour déclarer UNE tenue « 1:1 » en jeu

1. **Provenance par état de scène** : œuvre, personnage, partie de l'histoire, source comparative et pièces visibles attestées; la source doit être accessible pour vérification, sans copie redistribuée non autorisée.
2. **Parties réellement séparées** : torse, manches, mains, bassin, cuisses, tibias, bottes, casque/masque, dos, accessoires. Aucun fusil ou décor pré-peint sur le vêtement.
3. **Rig** : pivots mesurés cou/épaules/coudes/poignets/hanche/genoux/chevilles et calage des pieds; aucune valeur `null` restante pour une articulation active.
4. **Deux orientations** : asymétries conservées, absence de logo inversé, tête et éléments dorsaux compatibles avec les deux profils.
5. **Animations natives** : idle, marche, course, accroupissement, visée, tir, rechargement, couverture, escalade, actions, dégâts, mort et retour au calme, sans membre flottant.
6. **Usage réel** : inventaire et changement cosmétique existants, enregistrement et rechargement, refus en opération active, absence de bonus ou déblocages d'armes inventés.
7. **Régression de publication** : validation des SHA et des médias chargés, captures de hub + mission, contrôle navigateur de tenue complète et variantes, revue humaine visuelle. Les tests de découpe V176/V177 ne peuvent pas valider ce point à eux seuls.

Le registre d'armes `docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv`
reste **séparé** : ses 129 candidats ne deviennent ni achetables ni
« 1:1 » parce qu'un nom d'arme ou un lien de référence est connu.

**Droits :** une preuve film ou costume de collection permet la comparaison
artistique, pas la redistribution commerciale automatique d'un élément
protégé. Les modèles finaux et les licences nécessaires doivent être
contrôlés avant toute publication commerciale.
