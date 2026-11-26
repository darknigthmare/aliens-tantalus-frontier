# CODEX LEVEL DESIGN — ALIENS V110 / Tenir les accès

Branche autonome V109 poursuivie ; aucun raccord natif ni nouveau final.

## Règles de conception

### 01 — Conserver le parcours, changer la tenue des accès

Les huit lieux et les cinq objectifs de Repli sur Operations sont conservés. Sept lieux forment le réseau jouable ; le Sulaco reste une inspection séparée. V110 ne rajoute ni mission obligatoire, ni ennemi, ni couloir. Renforcer un accès est une décision facultative qui consomme une réserve et peut retarder aussi le retour du groupe.

### 02 — Un stock est un objet du niveau

Chaque réserve a un identifiant, une emprise métallique au sol, un point de travail, une portée et une quantité finie. La desserte bloque corps et balles. L’interaction ignore uniquement son propre support dans le rayon de travail, jamais les cloisons ou les autres meubles. Les scellés prennent 1,05 seconde à ouvrir ; les réserves ne sont créditées qu’au bout du geste.

### 03 — Conservation exacte des ressources

Les trois stocks apportent trois lots personnels, deux trousses et une cartouche pour sentinelle. Inventaire restant + ressources dépensées doit toujours correspondre à la somme des stocks effectivement ouverts. Aucun objet n’est gagné à l’entrée d’une pièce, à l’inspection suivante ou au chargement. Une caisse déjà récupérée reste ouverte et vide.

### 04 — Soigner un acteur présent

Le soin dure 1,6 seconde, exige un allié vivant et proche, et rend au maximum 30 PV, sans dépasser 100. Il consomme une trousse seulement à son achèvement. Newt peut être soignée une fois recrutée ; elle ne reçoit pas d’arme. Aucun soin ne ressuscite un acteur, ne répare une tourelle ou ne cible un équipier dans une autre pièce.

### 05 — Ravitailler ne signifie pas recharger gratuitement

Un lot personnel donne 18 cartouches en 0,85 seconde, avec plafond de 96. Une cartouche de sentinelle ajoute 40 coups en 1,35 seconde, plafond de 120. Le transfert n’a lieu que si un manque existe et si l’objet de réserve correspondant est réellement disponible. La sentinelle conserve ses tirs à ligne dégagée et n’a aucun rechargement automatique.

### 06 — Le travail reste exposé

Marcher, tirer, quitter la portée, subir un impact ou changer les données de la cible interrompt le geste. Le joueur et la cible ne doivent pas se déplacer ou tirer pendant l’assistance ; seul l’allié aidé est momentanément immobilisé, pas le reste de l’escouade. Un nouvel ordre à cet allié annule le soin. Les contacts continuent de simuler leurs attaques ; la pause seule suspend globalement le temps.

### 07 — Reprendre au milieu d’un soin

L’export contient durée, temps effectué, positions de départ, santé et munitions observées. L’import vérifie ces données contre l’état physique restauré et reprend en pause. Un fichier ne peut pas revendiquer une cible absente, modifier une durée, accorder des ressources inexpliquées ou soigner pendant le chargement. L’action interrompue ne consomme pas sa trousse.

### 08 — Une sirène attire, elle ne crée pas de menace

La commande de diagnostic demande 0,65 seconde, émet pendant 8 secondes et impose un délai total de 20 secondes avant réactivation. Les impulsions suivent le système sonore V108 : chemins libres, atténuation aux passages et limite de deux liaisons. Aucun Xéno n’est créé, tué ou téléporté par le diagnostic. Les contacts encore vivants peuvent chercher le dernier son et entrer par un seuil réellement accessible.

### 09 — Placer correctement la source sonore

Le point de commande peut appartenir au meuble ; l’émetteur de son doit être hors de son volume obstrué. Dans la réserve, la commande est à (1214, 238), l’émetteur à (1170, 238). Un émetteur enfoui dans le cabinet empêchait initialement la propagation par chemin : la géométrie a été corrigée, pas le filtre acoustique contourné.

### 10 — Fermer n’est plus une garantie illimitée

Un sas fermé continue à couper corps, vue et tirs. Un Warrior ne peut le forcer que s’il possède un souvenir valable situé au-delà, ne trouve pas de route ouverte et a réellement atteint la face du battant. Une porte fermée reste inconnue comme cible lorsqu’aucun indice ne guide la créature : pas d’omniscience ni de vague créée par la fermeture.

### 11 — Conserver la menace et les pertes

Onze ennemis et une sentinelle existent dans le catalogue ; dix ennemis sont dans le réseau de l’opération, le Sulaco reste isolé en inspection. Une créature qui traverse conserve identité et vie. Quitter une pièce ne retire pas un ennemi de la condition de défense. Les blessures et munitions suivent le même registre d’équipe à travers les sept lieux.

### 12 — Respecter le vocabulaire des lieux

La galerie utilise métal bleuté, rideau de fret, palettes, tracteur stationné et portiques. La réserve utilise comptoir médical, casiers, batteries et diagnostic ambre. Leur plan ne doit pas être copié sans fonction : le passage central ouvre une ligne de tir, les grandes masses offrent un contournement et les stocks sont placés après l’exposition, pas sur le point d’arrivée.

### 13 — Un appui graphique doit correspondre à un appui physique

Le tracteur est ancré au volume parked-tug, sans dessin posé artificiellement au-dessus d’une autre caisse. Les chariots de secours et de munitions utilisent leur bodyId. Le moniteur de réserve et la caisse sur palette ont une élévation explicite reliée à leur support. Les objets proches ne dérivent pas avec la caméra ; la parallaxe est réservée aux éléments lointains.

### 14 — Rendre lisible sans cacher le combat

La silhouette, les pieds, le volume de tir et l’emprise au sol utilisent les mêmes coordonnées. Les premiers plans proches sont atténués s’ils cachent un allié, mais conservent leurs collisions. Les scellés ouverts montrent un couvercle et un contenu vide ; la sirène montre un cycle puis un délai. Les textures et personnages sont encore procéduraux, pas des sprites finalisés.

### 15 — Protéger le terrain sur petit écran

Le HUD, le détecteur, les réserves, le génie et les ordres restent hors canvas. À moins de 460 pixels de haut en paysage, Réserves et Génie partagent un emplacement avec deux boutons de commutation ; O/U/J exposent le bon volet. En portrait, les bandes restent accessibles. La carte ne montre aucune identité, position ou santé ennemie. Les formats testés sont émulés, pas des téléphones certifiés.

### 16 — Migrer V109 sans cadeaux

Le validateur V109 doit d’abord accepter la partie source. Les pièces, membres, vies, chargeurs, stocks et objectifs restent identiques. Les nouvelles structures commencent intactes, la réserve de plaques à zéro et la pression ennemie sans préparation en cours. Une visite de maintenance antérieure ne vaut pas collecte de renforts. V108 et V107 passent par leurs vrais validateurs ; V106 reste une inspection.

### 17 — Recette d’un lieu et de son seuil

Vérifier les deux faces avec les gabarits, corps et tirs, fermer devant la piste d’un contact, interrompre une soudure, observer un impact annoncé, reconstruire uniquement à seuil libre, recharger à mi-geste puis finir le repli. Les images seules ne prouvent pas la géométrie. Le raccord aux 64 salles Tantalus exige leurs sources exactes et une recette dédiée.

### 18 — Un battant commun à deux pièces

Les huit liaisons ont chacune une structure unique : intégrité 100, renfort de 0 à 72, état de brèche et compte d’impacts. Les seize volumes de seuil sont dérivés de cet état partagé. Quand un battant cède, ses deux volumes disparaissent simultanément du chemin des corps, de la vision, des rayons et du graphe de passage.

### 19 — Trois plaques, réellement récupérées

La caisse service-crate est sur la table cable-rack de maintenance. Son point est (837,314), avec 82 unités de portée ; l’approche utilisée par le pilote est (793,314). Seul son support peut être ignoré dans le rayon d’interaction. E prépare la collecte pendant 1,1 seconde, puis crédite exactement trois plaques. Le couvercle reste ouvert et la caisse vide au retour.

### 20 — Souder bloque aussi le joueur

O demande un sas fermé, intact et sans renfort. Après 1,8 seconde immobile, une plaque est dépensée et fournit 72 points de protection. R ne peut pas rouvrir ce sas soudé. Un deuxième renfort est refusé ; cette action n’empile pas les plaques pour créer un mur infini.

### 21 — Découper est un engagement

U découpe le renfort pendant 1,4 seconde puis ouvre le sas. Il ne demande pas de nouvelle plaque et n’en restitue pas. Le renfort et la collision restent en place jusqu’à la fin. Un déplacement, tir ou impact annule la découpe ; le groupe doit toujours effectuer son franchissement normal.

### 22 — Réparer seulement un seuil libre

J reconstitue un battant endommagé ou arraché pendant 2,2 secondes. Il consomme une plaque à la fin, remet 100 d’intégrité, supprime tout renfort résiduel et ferme le sas. Les deux faces et les réservations de franchissement sont testées au début et avant achèvement. Aucun acteur ne peut être enfermé dans le nouveau volume.

### 23 — Pression physique, pas une horloge de destruction

Seuls les Warriors préparent la brèche ; les Facehuggers ne percent pas les battants. Le Warrior atteint sa face de travail, annonce 0,8 seconde, frappe pour 28, puis récupère 0,7 seconde. Le renfort absorbe les chocs avant l’intégrité. À pleine résistance et sans réparation, il faut quatre impacts sans renfort et sept avec une plaque entière. Ces comptes ne sont pas des secondes de survie garanties.

### 24 — Interrompre sans ressources fantômes

Bouger, tirer, perdre des PV, perdre la portée ou subir une variation de structure annule le geste. Aucun débit n’a lieu avant la fin. La pause fige temps et IA ; elle n’accomplit pas le travail. Une préparation ancienne est abandonnée si son sas s’ouvre ou est reconstitué : un coup engagé contre un ancien panneau ne touche pas magiquement le nouveau.

### 25 — Une brèche doit rester visible et franchissable

Le rendu lit les mêmes états : croix soudée, rayures sur les battants touchés, montants déformés et débris non bloquants après rupture. Un battant arraché ne se referme pas avec R ; J est requis. Aucun sprite de porte intacte ni collision invisible ne doit rester devant un passage bréché. Les portes intérieures narratives et le final du Sulaco sont exclus de ce système.

### 26 — Reprendre une pression sans la réinitialiser

Schéma 110 : intégrité et renfort, source des plaques, total dépensé, gestes et attaques préparées sont validés avant toute mutation. Une reprise reste en pause. L’ennemi conserve sa résidence, sa vie et la piste qui justifie l’attaque. Les propres coups du frappeur ne remplacent pas sa mémoire par un son qu’il vient de produire ; les autres contacts peuvent néanmoins les entendre.

## Hadley’s Hope

La fuite ne fait pas disparaître la piste — Le premier parcours de brèche laisse les contacts résidentiels vivants et rejoint Operations. Ils atteignent le sas fermé en conservant leurs identités. Aucune injection de créature, dégât ou mémoire n’est nécessaire pour obtenir la pression testée.

### Accès

- Operations : seuil (1360,195), arrivée (1290,195), battant partagé residential-ops.

### Emprises et battants

- north-wall : x=610, z=0, w=44, d=138, h=166.

- south-wall : x=610, z=250, w=44, d=130, h=154.

- generator : x=348, z=78, w=100, d=62, h=84.

- crate-east : x=950, z=253, w=112, d=80, h=63.

- service-rack : x=1100, z=40, w=94, d=62, h=130.

- service-gate : x=610, z=138, w=44, d=112, h=174.

- hatch:hadley-to-ops : x=1348, z=158, w=24, d=74, h=155.

### Supports

- console : sol de la coursive, référence=mur / sol, élévation=0.

- lamp-west : mur nord, référence=mur / sol, élévation=0.

- lamp-east : mur nord, référence=mur / sol, élévation=0.

- pipe : mur nord, référence=mur / sol, élévation=0.

## Infirmerie

Newt attend les vrais passages — Les vitrages continuent à séparer vue et tirs. Newt n’est pas un outil de génie ni une combattante ; elle suit les ouvertures disponibles avec les autres alliés. La décision de souder un sas peut imposer une découpe avant le retour vers Operations.

### Accès

- Operations : seuil (68,199), arrivée (143,199), battant partagé ops-medlab.

- Relais de maintenance : seuil (1320,77), arrivée (1314,171), battant partagé medical-service.

### Emprises et battants

- glass-north : x=690, z=0, w=30, d=133, h=144.

- glass-south : x=690, z=263, w=30, d=117, h=144.

- bed-west : x=340, z=67, w=160, d=74, h=42.

- med-cabinet : x=905, z=32, w=94, d=83, h=124.

- bed-east : x=1065, z=257, w=145, d=82, h=42.

- quarantine-gate : x=690, z=133, w=30, d=130, h=161.

- hatch:medlab-to-ops : x=56, z=162, w=24, d=74, h=155.

- hatch:medlab-to-service : x=1283, z=65, w=74, d=24, h=155.

### Supports

- med-console : sol de la baie, référence=mur / sol, élévation=0.

- med-lamp : rail mural, référence=mur / sol, élévation=0.

- tank-a : socle laboratoire, référence=mur / sol, élévation=0.

- tank-b : socle laboratoire, référence=mur / sol, élévation=0.

## Couloir des sentinelles

Tenir sans ressource infinie — La tourelle conserve ses propres munitions, ses rayons et son ravitaillement limité. Le sas de liaison peut être réparé ou renforcé, mais le rideau intérieur de défense reste un mécanisme distinct. Sortir un ennemi du couloir ne le retire pas du registre de menace de la défense.

### Accès

- Operations : seuil (68,194), arrivée (144,194), battant partagé ops-sentry.

### Emprises et battants

- bulkhead-north : x=686, z=0, w=46, d=134, h=184.

- bulkhead-south : x=686, z=254, w=46, d=126, h=184.

- ammo-rack : x=325, z=43, w=88, d=62, h=80.

- cover-a : x=465, z=86, w=106, d=45, h=52.

- cover-b : x=475, z=281, w=115, d=45, h=52.

- east-rack : x=1074, z=272, w=85, d=70, h=112.

- defense-gate : x=686, z=134, w=46, d=120, h=180.

- hatch:sentry-to-ops : x=56, z=157, w=24, d=74, h=155.

### Supports

- sentry-console : socle arrière, référence=mur / sol, élévation=0.

- ammo-box : sol de défense, référence=mur / sol, élévation=0.

- lamp-west : mur nord, référence=mur / sol, élévation=0.

- lamp-east : mur nord, référence=mur / sol, élévation=0.

## Hangar du Sulaco

Final natif préservé — Cette pièce reste inspectable seule. Elle n’est pas raccordée à Repli sur Operations. La représentation de la Reine et du loader n’est pas un nouveau final filmique ; la commande du sas reste réservée au système historique non fusionné ici.

### Accès

### Emprises et battants

- cargo-north : x=615, z=0, w=75, d=131, h=178.

- cargo-south : x=615, z=260, w=75, d=120, h=163.

- cargo-west : x=330, z=57, w=135, d=75, h=100.

- cargo-east : x=936, z=278, w=130, d=75, h=91.

- loader-stand : x=1030, z=44, w=135, d=85, h=150.

- cargo-gate : x=615, z=131, w=75, d=129, h=181.

- airlock-critical : x=1370, z=0, w=45, d=380, h=200.

### Supports

- cargo-console : sol de la coursive, référence=mur / sol, élévation=0.

- loader : plateforme technique, référence=mur / sol, élévation=0.

- hangar-lamp : poutre nord, référence=mur / sol, élévation=0.

- airlock-lamp : rail du sas, référence=mur / sol, élévation=0.

## Operations

Le sas résidentiel devient une décision — Le contrôle ouest est la cible de la recette principale : fermeture après fuite, quatre impacts, franchissement ennemi, récupération des plaques, réfection, soudure puis découpe. Le meuble central permet de rester hors de la gorge. Les réservations d’arrivée empêchent d’empiler les alliés dans le seuil.

### Accès

- Bloc résidentiel : seuil (64,195), arrivée (135,195), battant partagé residential-ops.

- Maintenance : seuil (746,43), arrivée (746,115), battant partagé ops-service.

- Infirmerie : seuil (1120,329), arrivée (1120,235), battant partagé ops-medlab.

- Ligne de défense : seuil (1360,195), arrivée (1285,195), battant partagé ops-sentry.

- Galerie logistique : seuil (164,326), arrivée (164,240), battant partagé ops-logistics.

### Emprises et battants

- ops-table : x=430, z=100, w=238, d=93, h=49.

- ops-rack : x=303, z=274, w=133, d=75, h=126.

- north-partition : x=874, z=0, w=40, d=114, h=166.

- south-partition : x=874, z=255, w=40, d=125, h=156.

- ops-display : x=1054, z=68, w=174, d=71, h=103.

- ops-bulkhead : x=874, z=114, w=40, d=141, h=174.

- hatch:ops-to-hadley : x=52, z=158, w=24, d=74, h=155.

- hatch:ops-to-service : x=709, z=31, w=74, d=24, h=155.

- hatch:ops-to-medlab : x=1083, z=317, w=74, d=24, h=155.

- hatch:ops-to-sentry : x=1348, z=158, w=24, d=74, h=155.

- hatch:ops-to-logistics : x=127, z=314, w=74, d=24, h=155.

### Supports

- ops-screen : table centrale, référence=ops-table, élévation=49.

- ops-console : sol de la coursive, référence=mur / sol, élévation=0.

- ops-lamp-west : rail nord, référence=mur / sol, élévation=0.

- ops-lamp-east : rail nord, référence=mur / sol, élévation=0.

- ops-pipe : mur nord, référence=mur / sol, élévation=0.

- ammo-bin : étagère arrière, référence=mur / sol, élévation=0.

## Relais de maintenance

Chercher les renforts sur un support réel — La caisse sur la table de câblage reçoit les trois plaques de génie. L’emprise cable-rack et la géométrie héritée restent identiques. On l’atteint après le relais ; ouvrir la caisse exige 1,1 seconde à portée. Les plaques ne sont pas données au seul fait d’entrer dans la salle.

### Accès

- Operations : seuil (68,195), arrivée (140,195), battant partagé ops-service.

- Accès médical de service : seuil (1346,325), arrivée (1236,325), battant partagé medical-service.

- Réserve technique : seuil (1300,43), arrivée (1300,137), battant partagé reserve-service.

### Emprises et battants

- service-north : x=610, z=0, w=40, d=132, h=190.

- service-south : x=610, z=257, w=40, d=123, h=164.

- pump-foundation : x=275, z=53, w=151, d=98, h=94.

- transformer-plinth : x=1000, z=55, w=138, d=90, h=141.

- cable-rack : x=828, z=275, w=115, d=72, h=69.

- maintenance-gate : x=610, z=132, w=40, d=125, h=183.

- hatch:service-to-ops : x=56, z=158, w=24, d=74, h=155.

- hatch:service-to-medlab : x=1334, z=288, w=24, d=74, h=155.

- hatch:service-to-reserve : x=1263, z=31, w=74, d=24, h=155.

### Supports

- relay-console : pied de l’armoire de relais, référence=mur / sol, élévation=0.

- service-console : sol de maintenance, référence=mur / sol, élévation=0.

- pump-pipes : mur au-dessus du socle de pompage, référence=mur / sol, élévation=0.

- service-lamp : poutre nord, référence=mur / sol, élévation=0.

- transformer-cable : mur au-dessus du transformateur, référence=mur / sol, élévation=0.

- service-crate : table basse de câblage, référence=cable-rack, élévation=69.

### Kit de génie

{"id": "service-plates", "roomId": "v107-service", "propId": "service-crate", "bodyId": "cable-rack", "x": 837, "z": 314, "reach": 82, "grant": 3, "name": "Renforts de maintenance"}

## Galerie logistique

Le détour garde sa fonction — Les lots personnels restent finis. Le sas d’Operations peut être isolé, mais un contact ayant suivi une piste peut désormais revenir forcer son battant. Le rideau de fret intérieur garde sa logique précédente ; il n’est pas devenu une cible de brèche V110.

### Accès

- Operations : seuil (64,195), arrivée (144,195), battant partagé ops-logistics.

- Réserve technique : seuil (1366,195), arrivée (1275,195), battant partagé logistics-reserve.

### Emprises et battants

- freight-north : x=670, z=0, w=38, d=137, h=186.

- freight-south : x=670, z=253, w=38, d=127, h=175.

- parked-tug : x=300, z=56, w=178, d=86, h=92.

- pallet-bay : x=307, z=282, w=170, d=70, h=68.

- storage-plinth : x=1030, z=283, w=175, d=58, h=80.

- north-shelf : x=1090, z=52, w=176, d=80, h=118.

- body-log-ammo : x=1156, z=203, w=68, d=36, h=43.

- freight-shutter : x=670, z=137, w=38, d=116, h=182.

- hatch:logistics-to-ops : x=52, z=158, w=24, d=74, h=155.

- hatch:logistics-to-reserve : x=1354, z=158, w=24, d=74, h=155.

### Supports

- tug-cabin : châssis du tracteur stationné, référence=parked-tug, élévation=0.

- pallet-crate : palette du quai, référence=pallet-bay, élévation=68.

- freight-lamp-a : portique nord, référence=mur / sol, élévation=0.

- freight-lamp-b : portique nord, référence=mur / sol, élévation=0.

- sealed-ammo : desserte de ravitaillement fixée au sol, référence=body-log-ammo, élévation=0.

- quay-console : colonne de commande du quai, référence=mur / sol, élévation=0.

- dispatch-sign : mur de livraison, référence=mur / sol, élévation=0.

## Réserve technique

Attirer sans créer de contacts — Trousses, cartouche sentinelle et sirène sont conservées. Une diversion et un sas soudé agissent sur les mêmes créatures existantes. Aucun soin ou diagnostic ne restaure une plaque. La liaison maintenance permet d’obtenir le matériel de génie sans revenir par Operations.

### Accès

- Galerie logistique : seuil (64,195), arrivée (144,195), battant partagé logistics-reserve.

- Maintenance : seuil (1328,43), arrivée (1300,137), battant partagé reserve-service.

### Emprises et battants

- reserve-north : x=620, z=0, w=34, d=135, h=179.

- reserve-south : x=620, z=254, w=34, d=126, h=162.

- service-locker : x=286, z=54, w=110, d=91, h=128.

- battery-stack : x=280, z=281, w=134, d=67, h=88.

- medical-counter : x=835, z=65, w=188, d=90, h=67.

- reserve-cabinet : x=967, z=282, w=157, d=67, h=119.

- body-reserve-sentry : x=313, z=198, w=68, d=36, h=43.

- body-reserve-medical : x=884, z=200, w=68, d=36, h=43.

- body-reserve-alarm : x=1180, z=220, w=68, d=36, h=64.

- reserve-door : x=620, z=135, w=34, d=119, h=177.

- hatch:reserve-to-logistics : x=52, z=158, w=24, d=74, h=155.

- hatch:reserve-to-service : x=1291, z=31, w=74, d=24, h=155.

### Supports

- sentry-cartridge : berceau de munitions au sol, référence=body-reserve-sentry, élévation=0.

- medical-pack : chariot de secours fixé au sol, référence=body-reserve-medical, élévation=0.

- alarm-desk : socle du testeur de sirène, référence=body-reserve-alarm, élévation=0.

- reserve-monitor : comptoir médical, référence=medical-counter, élévation=67.

- reserve-lamp : rail médical nord, référence=mur / sol, élévation=0.

- reserve-switch : potelet de commande, référence=mur / sol, élévation=0.

- reserve-conduit : mur de distribution, référence=mur / sol, élévation=0.
