# Fleuve de la Douleur — références visuelles des sprites

Recherche et comparaison : 25 novembre 2026. Périmètre : les sujets réellement
présents dans la base récupérée `0.9.0-candidate.1`, puis les lots graphiques
`visual-v1` et `visual-v2`. Ce document complète
[l’inventaire des entités](RIVER_OF_PAIN_SPRITE_INVENTORY.md) ; il ne transforme
pas une entrée documentaire en arme, personnage ou animation jouable.

## Ce que les références permettent de vérifier

L’objectif est une ressemblance aussi précise que possible avec la continuité
choisie. Une image générée reste une adaptation à contrôler, pas une preuve de
fidélité 1:1.

- **Film** : les images publiées par le studio donnent une référence directe
  d’apparence, mais uniquement pour le personnage, la scène et l’état montrés.
- **Roman** : l’extrait autorisé permet de conserver des traits explicitement
  décrits. Le texte intégral n’a pas été consulté pour cette recherche.
- **Accessoire original** : les catalogues documentent les objets et leur
  provenance. Leur état actuel peut inclure vieillissement, réparation,
  restauration, pièces manquantes ou éléments de présentation ajoutés.
- **Produit sous licence** : une figurine aide à lire une silhouette ou une
  superposition de vêtements. Ses articulations, supports et accessoires
  commercialisés ensemble ne constituent pas une scène du film.
- **Adaptation du jeu** : les visages non documentés, les palettes choisies,
  les états intermédiaires et les proportions utiles au rendu restent signalés
  comme des choix graphiques.

Les photos de recherche servent à comparer les formes. Elles ne sont pas
redistribuées dans le dépôt avec les sprites ; les liens publics sont conservés
ci-dessous.

## Armes, équipements et créatures présents

| Sujet / usage dans la base | Contraintes de silhouette pour la génération et la revue | Limite ou variante à éviter | Sources |
| --- | --- | --- | --- |
| **M41A**, mode `pulse` ; son module inférieur sert au mode `grenade` | Grande poignée supérieure ajourée ; corps compact brun/olive et noir ; ensemble inférieur du lance-grenades ; carénage inférieur brun, anguleux et ajouré autour de la zone du chargeur ; avant court et massif. La poignée, le chargeur et les deux niveaux de canon doivent rester distincts. | Ne pas remplacer le carénage par un long chargeur nu de fusil moderne ni ajouter un long canon supérieur générique. Crosse sortie/rentrée : vérifier la variante choisie. Les 30 cartouches du jeu sont une règle de gameplay. Un compteur peint dans un PNG n’affiche pas les munitions réelles. | [S01], [S02] |
| **M240**, mode `flame` | Long corps horizontal ; poignée de transport supérieure ajourée ; poignée pistolet à l’arrière ; grand cylindre vertical sous le corps ; avant perforé et embout de projection distinct. La photo du modèle statique sépare clairement ces volumes. | Le M240 et le M41A sont deux silhouettes différentes. Ne pas généraliser le montage scotché de Ripley. La poignée de l’exemplaire pratique [S04] a été remplacée après production ; préférer [S03] pour sa forme générale. | [S03], [S04] |
| **Détecteur M314**, équipement `tracker` | Boîtier principal tenu à la main et écran latéral identifiable ; sur l’écran original : boîtier compact gris/noir brun, surface acrylique, deux commandes et petits témoins inférieurs. Le corps de [S20] montre une poignée arrière ajourée, des câbles en boucle et un écran saillant. | Le lot [S05] est **l’écran seulement**. [S06] décrit un corps de réplique adapté portant un écran original. Le corps complet [S20] est une réplique commerciale de 2004 : exclure socle et supports. Aucun n’authentifie seul un détecteur complet original. | [S05], [S06], [S20] |
| **Soudeur portatif USCM**, équipement `weld` | Outil court à poignée, buse métallique, écran de protection rectangulaire, commandes et raccord de flexible à la base ; silhouette compacte permettant de travailler contre une porte. | Distinguer le soudeur de la lampe. L’exemplaire photographié a deux boutons manquants ; cette lacune actuelle n’est pas une caractéristique à reproduire systématiquement. | [S07] |
| **Lampe d’épaule USCM**, référence possible pour `light` | Boîtier rectangulaire, poignée à empreintes, bras articulé et tête carrée à lentille ronde ; lampe détachable et transportable à la main. Garder le faisceau séparé de l’objet. | L’équipement `light` du jeu ne prouve pas que chaque colon porte une lampe de Marine. La pochette et le bloc secteur présents dans ce lot ne sont pas des originaux utilisés dans le film ; les exclure de la tenue. | [S08] |
| **Facehugger**, ennemi `facehugger` | Corps bas ; huit membres articulés, quatre de chaque côté ; longue queue annelée distincte des pattes ; masses ventrales lisibles si l’angle les montre. Le profil de déplacement doit garder un centre de gravité bas. | La marionnette [S09] a reçu une restauration de mousse et une remise en peinture. L’utiliser pour l’organisation anatomique, sans présenter sa teinte actuelle comme un échantillon intact de 1986. Exclure socle et armatures de présentation. | [S09] |
| **Œuf**, props `egg-bed` et `sealed-egg` | Volume ovoïde organique, surface veinée/plissée, sommet formé de quatre lèvres refermées en croix ; une ouverture éventuelle doit réutiliser ces quatre parties. | Distinguer l’œuf grandeur nature d’une miniature. Les brûlures, fissures d’âge et pertes de peinture de l’objet de vente ne définissent pas tous les œufs du jeu. | [S10], [S11] |
| **Adulte inspiré du Warrior d’Aliens**, ennemi `adult` | Crâne allongé avec reliefs/cannelures visibles, dents et mâchoire distinctes, cou biomécanique. Pour le corps entier : côtes, appendices dorsaux, membres lisibles et longue queue ; vérifier leur continuité à l’échelle du jeu. | La tête [S12] ne valide pas à elle seule le corps entier. Éviter le dôme lisse de l’Alien de 1979 si la cible est le Warrior de 1986. Les variantes bleue/brune de [S13] sont des finitions de figurine, pas une preuve de deux castes. Ne pas copier les jointures du jouet ni le cou déformé de l’accessoire vieilli. | [S12], [S13] |

`adult` reste l’identifiant réel du jeu : cette référence graphique ne crée pas
un nouveau type d’ennemi `warrior`. De même, le lance-grenades est un module du
M41A, pas une troisième arme longue autonome. Les soins, balises, leurres et
outils originaux de gameplay ne reçoivent pas automatiquement une certification
filmique parce qu’ils utilisent une palette industrielle cohérente.

### Sujets documentés, absents du parcours récupéré

| Sujet | Repère utile pour une extension ultérieure | Statut actuel |
| --- | --- | --- |
| **M56 Smartgun** | Arme longue et lourde sur harnais/support articulé ; base MG42. Dans le lot [S14], certaines commandes et pièces de moto ont été recréées pour l’exposition : ne pas traiter tous les détails actuels comme originaux. | Entrée « à vérifier » ; pas d’arme jouable correspondante livrée dans la base. |
| **Tourelle automatique USCM** | Le pack sous licence [S15] montre des armes sur supports et leurs ordinateurs de contrôle. Cette source ne confirme pas à elle seule la désignation précise « UA571-C ». | Entrée « à vérifier ». Les volets et alarmes du module de défense ne sont pas des tourelles. |

Le P-5000 et le pistolet restent également à vérifier. Leur éventuelle image
future devra être accompagnée d’une intégration de gameplay explicite.

## Personnages et chronologie

### Newt : référence filmique, état adapté à la période

La photo officielle du studio [S16] montre Newt tête nue, avec une chevelure
longue blond foncé/châtain clair, un haut à manches longues et une bretelle
visible. La figurine NECA [S17] précise la superposition haut beige/brun et
salopette bleu gris. Sa photo sans casque montre une bretelle abaissée, un
vêtement déchiré et la tête de poupée : ce sont des repères de **survie tardive**,
pas un uniforme obligatoire pour toutes les scènes.

Pour l’état de départ avant la chute : conserver la petite silhouette, les
cheveux longs et les couches de vêtements ; deux bretelles en place et une
tenue moins endommagée sont une **adaptation de continuité**, pas une capture
authentifiée d’une scène antérieure. Le casque de Hicks fourni comme accessoire
par NECA appartient à une période ultérieure ; ne pas l’équiper au début du DLC.
La couleur lue sur une photo reste dépendante de la lumière, sans code couleur
canonique prétendu.

### Traits textuels à préserver

Ce tableau paraphrase uniquement l’extrait autorisé [S18]. Les traits ne
décrivent pas un portrait complet et ne doivent pas être complétés par une
ressemblance d’acteur inventée.

| Personnage | Élément attesté | Ce qui reste une interprétation du sprite |
| --- | --- | --- |
| **Anne Jorden** | Boucles abondantes et indisciplinées ; prospectrice. | Couleur exacte des cheveux, traits du visage, tenue et accessoires. |
| **Russ Jorden** | Prospecteur d’apparence négligée et fatiguée. | Barbe, couleur des cheveux et visage ; ce regard fatigué n’établit pas une ivresse permanente. |
| **Tim Jorden** | Fils déjà né avant Newt ; encore nourrisson à l’arrivée de sa famille sur LV-426. | Taille exacte, coupe de cheveux, visage et costume. |
| **Theodora Komiskey** | Femme petite et trapue, carrure ronde, yeux bleus, masse de boucles brunes. | Coupe de blouse, chaussures et autres détails non précisés. |
| **Joel** | Infirmier mince ; décrit par « slender and dark ». | Le mot « dark » ne suffit pas à fixer une carnation ou une origine précise. Visage et uniforme restent interprétés. |

Une référence de concept du tracteur des Jorden [S19] appartient bien à la
production du film. Elle n’authentifie pas les visages ou costumes d’Anne, Russ
et Tim. Le présent lot de recherches ne comporte pas de capture officielle
suffisante de chacun d’eux : ne pas annoncer leur ressemblance filmique comme
validée.

Les portraits de Brackett, Paris, Mori, Luisa et des autres personnages sans
visage vérifié demeurent des interprétations. Ne pas employer le visage d’une
interprète ou d’un interprète du livre audio comme apparence canonique du roman.
Les résidents créés pour le jeu restent des personnages originaux.

## Lot 2 — mobilier médical, habitat et équipements utilitaires

Contrat de référence du 25 novembre 2026 : **28 types de décor déjà présents**,
avec le nom de fichier `prop-<kind>.png`. Le périmètre vise leurs instances
décoratives sans collision ni empreinte physique. Les dimensions, la hauteur
d’accrochage et les points d’appui viennent du rendu du DLC ; les dessins de
production cités ici ne constituent pas un plan métrique des salles.

### Repères attestés et limites de la comparaison

L’extrait autorisé de *River of Pain* [S18] décrit des moniteurs blancs et lisses
près du lit et au-dessus, avec des témoins verts et bleus. Il décrit aussi une
grande unité de chirurgie natale coiffée d’un capot principalement transparent.
Ces traits soutiennent `white-monitor` et `natal-unit`. Le pied du moniteur,
le tracé ECG, le châssis de l’unité et son contrôleur latéral sont des choix du
jeu ; le texte ne fournit pas leur dessin technique.

Les notices des concepts originaux de Ron Cobb documentent un **Medlab** [S21],
une **salle d’opération et un sas** [S22], et un espace **A.P. Control and
Operations** [S23]. Elles établissent la provenance de ces dessins de
production. Elles ne valident pas une forme précise de microscope, de chaise,
de distributeur ou de pompe parmi les objets ci-dessous. Un concept ne prouve
pas non plus que tous ses détails figurent dans le décor filmé. Les descriptions
de ces notices servent ici à identifier les œuvres ; aucune couleur détaillée
des 28 sprites n’est déduite d’une image de concept non comparée directement.

L’habillage original d’Atmosphere Processor [S24] est décrit comme un dos de
téléviseur ancien en plastique, réemployé en élément de décor. Il documente
l’usage d’une coque utilitaire existante. Cela peut guider une construction
visuelle simple et fonctionnelle, mais cet objet n’est ni un moniteur médical
complet ni une preuve de présence de chacun des 28 équipements.

Pour le lot, les gris verts, les métaux mats, les crèmes médicaux et les petites
touches ocre reprennent donc **la palette native du DLC**, pas un nuancier
canonique du film. Les matériaux, boutons, joints et usures ajoutés à cette
base restent des interprétations graphiques. Aucun des 28 sujets n’a ici une
validation de ressemblance filmique 1:1.

### Contrat d’apparence par type

**R** = certains traits sont décrits dans le roman [S18], avec dessin adapté.
**N** = apparence définie par le jeu ; aucun accessoire filmique individuel
correspondant n’a été vérifié dans cette recherche. **N/I** = le rôle peut être
précisé graphiquement, mais cette précision dépasse le dessin natif partagé.

Les descriptions natives se lisent dans
[`render.js`](../../dlc/fleuve-de-la-douleur/src/river-of-pain/render.js),
[`architecture.js`](../../dlc/fleuve-de-la-douleur/src/river-of-pain/architecture.js)
et [`fidelity-visuals.js`](../../dlc/fleuve-de-la-douleur/src/river-of-pain/fidelity-visuals.js).

| Identifiant | Forme, couleur et montage à conserver ou expliciter | Base |
| --- | --- | --- |
| `natal-unit` | Unité vide, large et basse ; corps crème trapézoïdal ; capot transparent à pans inclinés ; contrôleur intégré à droite. Conserver la séparation entre la coque, le volume transparent et ce contrôleur. | **R** : grande unité et capot ; détail du châssis **N**. |
| `white-monitor` | Petit boîtier crème lisse, écran cyan sombre et tracé vert pâle, sur colonne mince. Le pied et l’ECG sont natifs ; ne pas transformer le dessin statique en indicateur clinique fonctionnel. | **R** : blanc et témoins vert/bleu ; support et interface **N**. |
| `microscope` | Volume compact gris vert. Le dessin actuel partage le pupitre et l’écran génériques de `monitor` ; une optique reconnaissable serait une interprétation du rôle de laboratoire à déclarer. | **N/I** ; aucun microscope du film identifié. |
| `fire-cabinet` | Armoire étroite rouge brun ; niche sombre, extincteur ocre et poignée distincte. Garder son décalage vertical natif, même lorsque l’instance est étiquetée au sol. | **N**. |
| `oxygen` | Bouteille verticale gris vert, col étroit, robinet et petit manomètre rond sur le côté ; pied sombre. Ne pas lui attribuer un modèle industriel précis. | **N**. |
| `privacy-screen` | Panneau rectangulaire translucide vert pâle ; deux montants métalliques, pieds en T et roulettes. La transparence fait partie de sa silhouette en jeu. | **N**. |
| `gurney` | Brancard vide, bas et large ; matelas vert désaturé sur plateau clair, pieds métalliques et petites roulettes. Les roues doivent rester entièrement visibles. | **N**. |
| `glass-cabinet` | Cadre mobile haut à vitrage vert bleuté, montants et pieds à roulettes. Le natif partage la structure du paravent ; un meuble opaque plein ne serait pas la même silhouette. | **N** ; détails de vitrine ajoutés à déclarer. |
| `medical-cross` | Plaque carrée ivoire avec croix verte centrée et cadre fin ; conserver son accrochage en hauteur. | **N** ; la signalétique exacte du film n’est pas attestée. |
| `sink` | Meuble gris vert intégrant un large bac sombre et un simple robinet coudé métallique à droite. Le bac appartient au meuble entier. | **N**. |
| `hose-reel` | Bobine circulaire métallique, flexible sombre en spires, extrémité pendante à droite presque jusqu’au sol. Garder la queue du flexible dans le cadre. | **N**. |
| `tool-board` | Tableau mural horizontal sombre, cadre gris vert et six outils longs suspendus, chacun distinct. Conserver la hauteur d’accrochage. | **N**. |
| `hand-truck` | Diable vide : deux montants tubulaires, barre de poignée, bavette basse et deux roues sombres. Une caisse ajoutée changerait le sujet et sa silhouette. | **N**. |
| `cable-spool` | Touret bas avec deux flasques métalliques circulaires, moyeux sombres et perforations. Le natif présente les deux disques côte à côte ; un support au sol supplémentaire serait une adaptation. | **N**. |
| `tape-reel` | Deux bobines métalliques côte à côte, moyeux et trois perforations par bobine ; montage en hauteur. Le boîtier et le trajet détaillé de bande restent interprétés. | **N**. |
| `radio` | Poste sur pupitre gris vert, petit écran sombre, commandes physiques inclinées et antenne verticale fine à droite. L’antenne appartient au contour complet. | **N**. |
| `monitor` | Écran cyan sombre au-dessus d’un large socle de pupitre gris vert, commandes physiques sur plan incliné. Garder cette base distincte de la colonne de `white-monitor`. | **N**. |
| `locker` | Casier haut vert bleu sombre, deux panneaux de porte, fentes d’aération, poignée claire et marquage de stockage. C’est le casier de décor, distinct de `hide-locker` et de `hab-door`. | **N**. |
| `chair` | Chaise sans accoudoirs ; assise vert pâle, dossier rectangulaire vert sombre et pieds tubulaires gris vert. | **N**. |
| `wall-clock` | Cadran rond crème, bord métallique, douze graduations et deux aiguilles sombres. Position murale et dessin statique ; ce n’est pas une horloge de simulation. | **N**. |
| `warning-board` | Plaque horizontale à cadre gris vert, fond ocre et triangle noir avec point d’exclamation. Toute nouvelle consigne lisible serait un ajout de contenu. | **N**. |
| `noticeboard` | Tableau horizontal, cadre métallique, fond vert pâle et petites fiches ou lignes claires. Les détails décoratifs ne doivent pas introduire une information de scénario inventée. | **N**. |
| `plant` | Une plante domestique en pot cubique gris vert ; cinq feuilles ou tiges olive en éventail. Aucune espèce botanique précise n’est établie. | **N**. |
| `hanging-coat` | Vêtement de travail vert désaturé suspendu à une petite barre ; deux manches, ouverture centrale et ourlet distincts. Le vêtement est vide. | **N**. |
| `lab-bench` | Établi bas et large, plateau clair sur deux pieds, support vert et deux récipients translucides. Les instances servant d’obstacles conservent leur rendu physique natif. | **N**. |
| `pump-motor` | Moteur de pompe horizontal, corps sombre à nombreuses ailettes gris vert, carter rond à droite et semelle rectangulaire. Les dimensions d’obstacle ne viennent pas de [S23] ou [S24]. | **N**. |
| `bench` | Banc bas et large, assise gris vert, dossier sombre à séparations verticales et deux pieds épais. Distinguer les exemplaires décoratifs des obstacles. | **N**. |
| `vending` | Distributeur haut gris vert ; fenêtre sombre montrant trois rangées de quatre produits, fente basse et petite commande à droite. Les produits font partie du même objet. | **N**. |

Le rendu final doit conserver les différences utiles à la lecture : appareils
médicaux clairs, mobilier vert sombre, équipements de manutention bas ou
allongés, plaques et bobines accrochées à leur hauteur native. La présence d’un
type dans ce tableau ne signifie pas que toutes ses instances sont remplacées
ni qu’un nouvel équipement est devenu utilisable. La revue du PNG et de sa
position en jeu reste distincte de la présente recherche de références.

## Contrôles visuels avant acceptation d’un sprite

1. Comparer d’abord le contour et les grands volumes avec une photo précise,
   puis les détails. Un rendu convaincant de près peut garder une arme ou une
   anatomie incorrecte.
2. Vérifier le sujet entier : canon, crosse, queue, pieds et cheveux dans le
   cadre ; aucune fusion main/arme ou patte/queue ; orientation cohérente avec
   les autres sprites.
3. Contrôler la lecture à la taille réellement utilisée par le jeu : différence
   enfant/adulte, silhouette de chaque arme, attache des mains, pieds au sol,
   absence de détails lumineux trompeurs.
4. Séparer les variantes de période et d’action. Salissures, casque, blessure,
   bretelle abaissée, œuf ouvert et brûlures doivent correspondre à un état.
5. Contrôler transparence et marges avec les outils techniques du lot. Ces
   vérifications ne démontrent pas la fidélité au film ; la revue comparative
   reste nécessaire.

La première revue du M41A a notamment isolé deux erreurs à surveiller : chargeur
nu trop long à la place du carénage inférieur, et canon supérieur trop saillant.
Cette observation concerne le premier essai, pas une certification ou un rejet
automatique d’une version corrigée ultérieure.

## Registre des sources publiques

Liens consultés le 25 novembre 2026. Les descriptions d’état ci-dessus font
partie de la référence : les conserver lorsqu’une photo est réutilisée pour
guider une génération.

| ID | Source et rôle | Lien |
| --- | --- | --- |
| S01 | Propstore, M41A léger original, lot 8 ; référence de contour | [Notice et photos](https://propstore.com/product/aliens-1986/lot-8-m41a-pulse-rifle/) · [photo comparée](https://images.propstore.com/4536cf0c1321fd7f214aaa34394b4816-1.jpg) |
| S02 | Propstore, autre M41A léger ; contre-vérification du carénage | [Notice](https://propstore.com/product/aliens-1986/lightweight-m41a-pulse-rifle/) · [photo de profil](https://images.propstore.com/9b35e71ad0026a9d54e2bd5fa563a811-1.jpeg) |
| S03 | Propstore, M240 statique original, lot 15 ; modèle en mousse rigide, usure visible | [Notice](https://propstore.com/product/aliens-1986/lot-15-colonial-marine-flamethrower/) · [photo](https://images.propstore.com/7d9a4e4b5ed91e402518ce2fd931cfdf-1.jpg) |
| S04 | Propstore, M240 pratique de Ripley ; poignée remplacée après production | [Notice](https://propstore.com/product/aliens-1986/19-ellen-ripleys-sigourney-weaver-practical-special-effects-m240-flamethrower/) |
| S05 | Propstore, écran M314 original seulement, lot 13 | [Notice](https://propstore.com/product/aliens-1986/lot-13-uscm-m314-motion-tracker-screen/) · [photo](https://images.propstore.com/a8e43ed61dddbce8e836fd502ba408fe-1.jpg) |
| S06 | Harry Harris Collection, provenance des composants et distinction réplique/écran original | [Motion Tracker](https://harryharris.com/tracker.htm) |
| S07 | Propstore, soudeur portatif original ; boutons manquants signalés | [Notice](https://propstore.com/product/aliens-1986/uscm-hand-welder/) · [photo](https://images.propstore.com/7728a77c222d7c09049c5fb6b510e9c6-1.jpg) |
| S08 | Propstore, lampe d’épaule originale ; accessoires non filmiques identifiés | [Notice](https://propstore.com/product/aliens-1986/lot-28-harry-harris-collection-uscm-shoulder-torch-pack/) · [lampe seule](https://images.propstore.com/978aedb4d91835b5487b671ab8d9728c-1.jpg) |
| S09 | Propstore, facehugger original restauré | [Notice](https://propstore.com/product/aliens-1986/13-facehugger-puppet/) · [photo](https://images.propstore.com/15b25f246883ae979b19868bc19e2909-1.jpg) |
| S10 | Propstore, œuf grandeur nature ; état actuel vieilli/brûlé | [Notice](https://propstore.com/product/aliens-1986/lot-12-full-size-xenomorph-egg/) · [photo](https://images.propstore.com/d668de6f238cf3beb14830f73d3a157e-1.jpeg) |
| S11 | Propstore, autre œuf original ; forme et sommet en croix | [Notice](https://uk.propstoreauction.com/view-auctions/catalog/id/78/lot/18103/index.html) |
| S12 | Propstore, tête de Warrior originale ; crâne strié et vieillissement du cou | [Notice](https://propstore.com/product/aliens-1986/lot-7-xenomorph-warrior-head/) · [photo](https://images.propstore.com/3d5941bf54da71f14d9a9b125a5eaeba-1.jpg) |
| S13 | NECA, Warriors sous licence ; référence complémentaire du corps, pas accessoire original | [Présentation du fabricant](https://store.necaonline.com/blogs/news/shipping-this-week-predator-series-18-aliens-ultimate-warriors-chucky-body-knocker-and-ultimate-chucky-restock-1) |
| S14 | Propstore, M56 original avec éléments recréés pour présentation | [Notice](https://propstoreauction.com/lot-details/index/catalog/319/lot/88712/Lot-9-Aliens-1986-M56-Smartgun) |
| S15 | NECA, USCM Arsenal Weapons Pack ; tourelles sous licence | [Présentation du fabricant](https://store.necaonline.com/blogs/news/shipping-this-week-30-groot-foam-figure-and-aliens-uscm-arsenal-weapons-pack-1) |
| S16 | 20th Century Studios, galerie officielle du film ; Newt sans casque | [Film](https://www.20thcenturystudios.com/movies/aliens) · [photo du studio](https://lumiere-a.akamaihd.net/v1/images/image_b464f4c0.jpeg?region=0%2C0%2C1600%2C750) |
| S17 | NECA, Newt SDCC 2016 ; ressemblance autorisée et casque amovible | [Présentation](https://store.necaonline.com/blogs/san-diego-comic-con/174995271-sdcc-2016-exclusives-complete-roundup-and-pre-order-details) · [photo sans casque](https://necaonline.com/wp-content/uploads/2016/05/1300x-Newt3-.jpg) |
| S18 | Christopher Golden, extrait fourni par Titan Books à Daily Dead ; chapitres Rebecca et Arrivals | [Extrait autorisé](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/) · [fiche de l’éditeur](https://titanbooks.com/6486-alien-river-of-pain-book-3/) |
| S19 | Propstore, dessin de production de Ron Cobb du tracteur des Jorden ; référence de véhicule uniquement | [Notice](https://usm.propstoreauction.com/lot-details/index/catalog/287/lot/73452/Lot-465-ALIENS-1986-Hand-Illustrated-Ron-Cobb-Daihotai-Tractor-Concept-Sketch) |
| S20 | Propstore, détecteur complet Master Replicas ; réplique commerciale, pas accessoire de tournage | [Notice](https://propstore.com/product/aliens-1986/lot-489-master-replicas-motion-tracker-replica/) · [côté clavier](https://images.propstore.com/5ee9ee095c1fd9f04a83aaa0f729264a-1.jpeg) · [côté écran](https://images.propstore.com/f96ce76c3afa96e8e7b7f57a01adc9f7-1.jpeg) |
| S21 | Propstore, concept original de Ron Cobb pour le Medlab, stock 103964 ; provenance de dessin de production, pas plan des 28 objets | [Notice](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-medlab-concept-sketch/) |
| S22 | Propstore, concepts originaux de Ron Cobb de salle d’opération et de sas, stock 103966 ; attribution des dessins seulement | [Notice](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-colony-air-lock-and-operating-room-concept-sketches/) |
| S23 | Propstore, concept original de Ron Cobb A.P. Control and Operations, stock 103965 ; contexte de salle technique, pas modèle individuel de moniteur ou de pompe | [Notice](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-a-pcontrol-and-operations-concept-sketch/) |
| S24 | Propstore, habillage original d’Atmosphere Processor, Harry Harris Collection, lot 655 / stock 144354 ; dos de téléviseur réemployé, état actuel avec usure | [Notice](https://propstore.com/product/aliens-1986/lot-655-harry-harris-collection-atmosphere-processor-set-dressing/) |


## Lot 3 — huit meubles supplémentaires, 26 novembre 2026

| PNG | Référence de forme réellement disponible | Limite |
| --- | --- | --- |
| `prop-rack.png` | Renderer v0.9, famille `rack`, quatre niveaux de rangement | Bacs et châssis interprétés |
| `prop-shelf.png` | Renderer v0.9, famille `shelf` | Contenants domestiques adaptés |
| `prop-medicine.png` | Renderer v0.9, famille `medicine` ; contexte médical des extraits du roman | Conditionnements pharmaceutiques interprétés |
| `prop-cupboard.png` | Renderer v0.9, famille `cupboard`, enveloppe de 158 unités | Deux portes et détails industriels adaptés |
| `prop-fridge.png` | Renderer v0.9, famille `fridge` | Armoire réfrigérée interprétée, modèle précis non établi |
| `prop-table.png` | Renderer v0.9, famille `table`, plateau, tasse et carnet natifs | Piétement et texture adaptés |
| `prop-stove.png` | Renderer v0.9, famille `stove`, trois plaques | Four et commandes adaptés |
| `prop-linen.png` | Renderer v0.9, famille `linen`, coffre et linge empilé | Matière et plis interprétés |

Les huit sources sont des PNG complets produits individuellement. Les tests
de géométrie confrontent leurs enveloppes au véritable rendu natif ; ils ne
certifient pas que chaque meuble ait existé à l’identique dans un plan du film.
Les détails provenant uniquement de la génération ne deviennent pas des faits
canoniques.

La [bible éditoriale](../../dlc/fleuve-de-la-douleur/visual-v1/bible/README.md)
réunit les sources supplémentaires consultées, dont l’extrait autorisé du
[chapitre 7](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)
et l’[extrait Titan publié par Daily Dead](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/).
Elle distingue les lieux de 2173/2179, la carte coloniale et les scènes
documentaires hors de cette carte. Les plans conceptuels de Ron Cobb et les
accessoires de production restent des références de design, sans plan métrique
du DLC ni attribution automatique aux personnages du roman.
