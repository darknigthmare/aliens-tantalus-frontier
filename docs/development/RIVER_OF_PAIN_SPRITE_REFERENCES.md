# Fleuve de la Douleur — références visuelles des sprites

Recherche et comparaison : 25 novembre 2026. Périmètre : les sujets réellement
présents dans la base récupérée `0.9.0-candidate.1`, puis le lot graphique
`visual-v1`. Ce document complète
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
