# CODEX LEVEL DESIGN — ALIENS V109 / Logistique sous pression

Version 109.0.0-rc.1. Huit lieux inspectables, sept connectés ; deux nouveaux lieux. Branche autonome, aucune fusion des 64 salles natives.

## Deux lieux, un détour réellement facultatif

La galerie et la réserve créent la boucle Operations → Galerie logistique → Réserve technique → Maintenance. Les cinq objectifs ordonnés de Repli sur Operations restent inchangés. La liaison médicale de service et la route directe restent praticables. La reconnaissance du détour est un bilan local : elle ne remplace aucune mission historique.

## Un stock est un objet du niveau

Chaque réserve a un identifiant, une emprise métallique au sol, un point de travail, une portée et une quantité finie. La desserte bloque corps et balles. L’interaction ignore uniquement son propre support dans le rayon de travail, jamais les cloisons ou les autres meubles. Les scellés prennent 1,05 seconde à ouvrir ; les réserves ne sont créditées qu’au bout du geste.

## Conservation exacte des ressources

Les trois stocks apportent trois lots personnels, deux trousses et une cartouche pour sentinelle. Inventaire restant + ressources dépensées doit toujours correspondre à la somme des stocks effectivement ouverts. Aucun objet n’est gagné à l’entrée d’une pièce, à l’inspection suivante ou au chargement. Une caisse déjà récupérée reste ouverte et vide.

## Soigner un acteur présent

Le soin dure 1,6 seconde, exige un allié vivant et proche, et rend au maximum 30 PV, sans dépasser 100. Il consomme une trousse seulement à son achèvement. Newt peut être soignée une fois recrutée ; elle ne reçoit pas d’arme. Aucun soin ne ressuscite un acteur, ne répare une tourelle ou ne cible un équipier dans une autre pièce.

## Ravitailler ne signifie pas recharger gratuitement

Un lot personnel donne 18 cartouches en 0,85 seconde, avec plafond de 96. Une cartouche de sentinelle ajoute 40 coups en 1,35 seconde, plafond de 120. Le transfert n’a lieu que si un manque existe et si l’objet de réserve correspondant est réellement disponible. La sentinelle conserve ses tirs à ligne dégagée et n’a aucun rechargement automatique.

## Le travail reste exposé

Marcher, tirer, quitter la portée, subir un impact ou changer les données de la cible interrompt le geste. Le joueur et la cible ne doivent pas se déplacer ou tirer pendant l’assistance ; seul l’allié aidé est momentanément immobilisé, pas le reste de l’escouade. Un nouvel ordre à cet allié annule le soin. Les contacts continuent de simuler leurs attaques ; la pause seule suspend globalement le temps.

## Reprendre au milieu d’un soin

L’export contient durée, temps effectué, positions de départ, santé et munitions observées. L’import vérifie ces données contre l’état physique restauré et reprend en pause. Un fichier ne peut pas revendiquer une cible absente, modifier une durée, accorder des ressources inexpliquées ou soigner pendant le chargement. L’action interrompue ne consomme pas sa trousse.

## Une sirène attire, elle ne crée pas de menace

La commande de diagnostic demande 0,65 seconde, émet pendant 8 secondes et impose un délai total de 20 secondes avant réactivation. Les impulsions suivent le système sonore V108 : chemins libres, atténuation aux passages et limite de deux liaisons. Aucun Xéno n’est créé, tué ou téléporté par le diagnostic. Les contacts encore vivants peuvent chercher le dernier son et entrer par un seuil réellement accessible.

## Placer correctement la source sonore

Le point de commande peut appartenir au meuble ; l’émetteur de son doit être hors de son volume obstrué. Dans la réserve, la commande est à (1214, 238), l’émetteur à (1170, 238). Un émetteur enfoui dans le cabinet empêchait initialement la propagation par chemin : la géométrie a été corrigée, pas le filtre acoustique contourné.

## Fermer derrière l’équipe a une conséquence

Les huit liaisons sont réciproques et instancient seize volumes de seuil. Leur fermeture coupe corps, vue, tirs et trajets sonores. Un acteur présent ou en transit interdit l’écrasement du seuil. Les nouveaux raccords ne bénéficient d’aucune exemption : les trois Marines, Newt et les créatures doivent atteindre leur accès et attendre une arrivée libre.

## Conserver la menace et les pertes

Onze ennemis et une sentinelle existent dans le catalogue ; dix ennemis sont dans le réseau de l’opération, le Sulaco reste isolé en inspection. Une créature qui traverse conserve identité et vie. Quitter une pièce ne retire pas un ennemi de la condition de défense. Les blessures et munitions suivent le même registre d’équipe à travers les sept lieux.

## Respecter le vocabulaire des lieux

La galerie utilise métal bleuté, rideau de fret, palettes, tracteur stationné et portiques. La réserve utilise comptoir médical, casiers, batteries et diagnostic ambre. Leur plan ne doit pas être copié sans fonction : le passage central ouvre une ligne de tir, les grandes masses offrent un contournement et les stocks sont placés après l’exposition, pas sur le point d’arrivée.

## Un appui graphique doit correspondre à un appui physique

Le tracteur est ancré au volume parked-tug, sans dessin posé artificiellement au-dessus d’une autre caisse. Les chariots de secours et de munitions utilisent leur bodyId. Le moniteur de réserve et la caisse sur palette ont une élévation explicite reliée à leur support. Les objets proches ne dérivent pas avec la caméra ; la parallaxe est réservée aux éléments lointains.

## Rendre lisible sans cacher le combat

La silhouette, les pieds, le volume de tir et l’emprise au sol utilisent les mêmes coordonnées. Les premiers plans proches sont atténués s’ils cachent un allié, mais conservent leurs collisions. Les scellés ouverts montrent un couvercle et un contenu vide ; la sirène montre un cycle puis un délai. Les textures et personnages sont encore procéduraux, pas des sprites finalisés.

## HUD et carte hors du terrain

Santé, munitions, détecteur, ressources et ordres restent dans des bandes hors canvas. La carte et les archives remplacent temporairement le terrain. La carte ne dévoile que les lieux visités : ni positions ennemies, ni santé adverse, ni réserves non découvertes. Les contrôles 844 × 390 et 390 × 844 sont émulés ; aucun appareil physique n’est certifié.

## Migrer sans transformer l’ancien parcours

V108 est validée par son propre importeur avant migration. Les pièces et membres hérités gardent vies, ressources, ordres et progression. Les deux lieux supplémentaires sont initialisés au temps courant, les nouveaux contacts sont sans mémoire et les nouvelles liaisons sont ouvertes. Aucune réserve n’est offerte. V107 et V106 passent par leurs validateurs antérieurs ; V106 reste une inspection.

## Définition d’un lieu prêt à raccorder

Vérifier tous les seuils avec le gabarit du groupe, tirer contre chaque volume, contourner les props, interrompre une assistance, revenir après collecte, importer à mi-geste, déclencher la sirène portes ouvertes puis isolées, et terminer le repli. Les graphismes seuls ne prouvent ni la géométrie ni le raccord natif. La fusion au moteur Tantalus doit être testée sur ses sources exactes.

## Galerie logistique

Acheminement du bloc · stocks sous scellés

Galerie sous scellés — Le rideau coupe le couloir central. Le tracteur stationné occupe son vrai gabarit au nord et la palette laisse un passage par le sud. La réserve de munitions est au-delà du contact du quai : l’approche doit être nettoyée ou couverte avant les 1,05 seconde de travail.

### Liaisons

- Operations : seuil (64,195), arrivée (144,195), ops-logistics.

- Réserve technique : seuil (1366,195), arrivée (1275,195), logistics-reserve.

### Volumes

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

### Appuis

- tug-cabin : châssis du tracteur stationné, référence=parked-tug, élévation=0.

- pallet-crate : palette du quai, référence=pallet-bay, élévation=68.

- freight-lamp-a : portique nord, référence=mur/sol, élévation=0.

- freight-lamp-b : portique nord, référence=mur/sol, élévation=0.

- sealed-ammo : desserte de ravitaillement fixée au sol, référence=body-log-ammo, élévation=0.

- quay-console : colonne de commande du quai, référence=mur/sol, élévation=0.

- dispatch-sign : mur de livraison, référence=mur/sol, élévation=0.

### Stocks finis

{"id": "log-ammo", "roomId": "v109-logistics", "x": 1190, "z": 221, "reach": 70, "name": "Caisse de munitions", "bodyId": "body-log-ammo", "grant": {"ammo": 3, "medical": 0, "sentry": 0}}

## Réserve technique

Secours, munitions et sirène de diagnostic

Choisir le bon moment — Le premier berceau contient la cartouche de sentinelle ; les trousses sont derrière la cloison. La sirène se trouve côté maintenance pour offrir une option de détour, mais l’accès nord ouvert permet aussi l’arrivée d’un contact. La portée de commande et le point émetteur sont distincts.

### Liaisons

- Galerie logistique : seuil (64,195), arrivée (144,195), logistics-reserve.

- Maintenance : seuil (1328,43), arrivée (1300,137), reserve-service.

### Volumes

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

### Appuis

- sentry-cartridge : berceau de munitions au sol, référence=body-reserve-sentry, élévation=0.

- medical-pack : chariot de secours fixé au sol, référence=body-reserve-medical, élévation=0.

- alarm-desk : socle du testeur de sirène, référence=body-reserve-alarm, élévation=0.

- reserve-monitor : comptoir médical, référence=medical-counter, élévation=67.

- reserve-lamp : rail médical nord, référence=mur/sol, élévation=0.

- reserve-switch : potelet de commande, référence=mur/sol, élévation=0.

- reserve-conduit : mur de distribution, référence=mur/sol, élévation=0.

### Stocks finis

{"id": "reserve-sentry", "roomId": "v109-reserve", "x": 347, "z": 216, "reach": 70, "name": "Cartouche pour sentinelle", "bodyId": "body-reserve-sentry", "grant": {"ammo": 0, "medical": 0, "sentry": 1}}

{"id": "reserve-medical", "roomId": "v109-reserve", "x": 918, "z": 218, "reach": 70, "name": "Trousse de secours", "bodyId": "body-reserve-medical", "grant": {"ammo": 0, "medical": 2, "sentry": 0}}

### Diagnostic acoustique

{"id": "reserve-alarm", "roomId": "v109-reserve", "x": 1214, "z": 238, "reach": 70, "name": "Sirène de diagnostic", "bodyId": "body-reserve-alarm", "emitter": {"x": 1170, "z": 238}}

## Operations

Centre du bloc · regroupement et repli

Une branche de plus, pas un radar — L’accès sud mène maintenant à la galerie. Le meuble central conserve son rôle de couverture et de coupure visuelle. Un groupe doit encore rejoindre le seuil : Rallier ne téléporte personne. L’accès à la logistique ne modifie pas les conditions de Newt ni de défense.

### Liaisons

- Bloc résidentiel : seuil (64,195), arrivée (135,195), residential-ops.

- Maintenance : seuil (746,43), arrivée (746,115), ops-service.

- Infirmerie : seuil (1120,329), arrivée (1120,235), ops-medlab.

- Ligne de défense : seuil (1360,195), arrivée (1285,195), ops-sentry.

- Galerie logistique : seuil (164,326), arrivée (164,240), ops-logistics.

### Volumes

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

### Appuis

- ops-screen : table centrale, référence=ops-table, élévation=49.

- ops-console : sol de la coursive, référence=mur/sol, élévation=0.

- ops-lamp-west : rail nord, référence=mur/sol, élévation=0.

- ops-lamp-east : rail nord, référence=mur/sol, élévation=0.

- ops-pipe : mur nord, référence=mur/sol, élévation=0.

- ammo-bin : étagère arrière, référence=mur/sol, élévation=0.

## Relais de maintenance

Alimentation du bloc · liaison médicale

Le relais au bout de la boucle — La réserve rejoint la maintenance par le nord. Aucun obstacle hérité n’a été déplacé pour inventer un raccord ; l’arrivée libre est vérifiée contre la pompe et le transformateur. La commande du relais garde son rôle de jalon local, sans devenir un réseau électrique général.

### Liaisons

- Operations : seuil (68,195), arrivée (140,195), ops-service.

- Accès médical de service : seuil (1346,325), arrivée (1236,325), medical-service.

- Réserve technique : seuil (1300,43), arrivée (1300,137), reserve-service.

### Volumes

- service-north : x=610, z=0, w=40, d=132, h=190.

- service-south : x=610, z=257, w=40, d=123, h=164.

- pump-foundation : x=275, z=53, w=151, d=98, h=94.

- transformer-plinth : x=1000, z=55, w=138, d=90, h=141.

- cable-rack : x=828, z=275, w=115, d=72, h=69.

- maintenance-gate : x=610, z=132, w=40, d=125, h=183.

- hatch:service-to-ops : x=56, z=158, w=24, d=74, h=155.

- hatch:service-to-medlab : x=1334, z=288, w=24, d=74, h=155.

- hatch:service-to-reserve : x=1263, z=31, w=74, d=24, h=155.

### Appuis

- relay-console : pied de l’armoire de relais, référence=mur/sol, élévation=0.

- service-console : sol de maintenance, référence=mur/sol, élévation=0.

- pump-pipes : mur au-dessus du socle de pompage, référence=mur/sol, élévation=0.

- service-lamp : poutre nord, référence=mur/sol, élévation=0.

- transformer-cable : mur au-dessus du transformateur, référence=mur/sol, élévation=0.

- service-crate : table basse de câblage, référence=cable-rack, élévation=69.

## Hadley’s Hope

Bloc résidentiel · porte de service

Départ conservé — Porte résidentielle, contacts et raccord Operations sont conservés. Les stocks commencent à zéro. Les créatures peuvent suivre le groupe après le départ si elles possèdent un indice et une route ouverte.

### Liaisons

- Operations : seuil (1360,195), arrivée (1290,195), residential-ops.

### Volumes

- north-wall : x=610, z=0, w=44, d=138, h=166.

- south-wall : x=610, z=250, w=44, d=130, h=154.

- generator : x=348, z=78, w=100, d=62, h=84.

- crate-east : x=950, z=253, w=112, d=80, h=63.

- service-rack : x=1100, z=40, w=94, d=62, h=130.

- service-gate : x=610, z=138, w=44, d=112, h=174.

- hatch:hadley-to-ops : x=1348, z=158, w=24, d=74, h=155.

### Appuis

- console : sol de la coursive, référence=mur/sol, élévation=0.

- lamp-west : mur nord, référence=mur/sol, élévation=0.

- lamp-east : mur nord, référence=mur/sol, élévation=0.

- pipe : mur nord, référence=mur/sol, élévation=0.

## Infirmerie

Quarantaine · baie vitrée

Secourir avant d’assister — Le vitrage laisse voir sans autoriser les tirs au travers. Newt reste protégée avant recrutement, puis doit rejoindre le groupe. Une trousse peut la soigner à portée ; le ravitaillement ne peut jamais lui donner de cartouches.

### Liaisons

- Operations : seuil (68,199), arrivée (143,199), ops-medlab.

- Relais de maintenance : seuil (1320,77), arrivée (1314,171), medical-service.

### Volumes

- glass-north : x=690, z=0, w=30, d=133, h=144.

- glass-south : x=690, z=263, w=30, d=117, h=144.

- bed-west : x=340, z=67, w=160, d=74, h=42.

- med-cabinet : x=905, z=32, w=94, d=83, h=124.

- bed-east : x=1065, z=257, w=145, d=82, h=42.

- quarantine-gate : x=690, z=133, w=30, d=130, h=161.

- hatch:medlab-to-ops : x=56, z=162, w=24, d=74, h=155.

- hatch:medlab-to-service : x=1283, z=65, w=74, d=24, h=155.

### Appuis

- med-console : sol de la baie, référence=mur/sol, élévation=0.

- med-lamp : rail mural, référence=mur/sol, élévation=0.

- tank-a : socle laboratoire, référence=mur/sol, élévation=0.

- tank-b : socle laboratoire, référence=mur/sol, élévation=0.

## Couloir des sentinelles

Ligne de défense · repli protégé

Quarante coups, pas une réserve infinie — La cartouche de réserve se transfère à proximité de la sentinelle vivante. Il faut trouver une fenêtre de 1,35 seconde sans déplacement de cible ni variation de ses munitions. Un tir de la sentinelle pendant le geste l’interrompt ; son ravitaillement est une action protégée, pas un bouton instantané au milieu de la rafale.

### Liaisons

- Operations : seuil (68,194), arrivée (144,194), ops-sentry.

### Volumes

- bulkhead-north : x=686, z=0, w=46, d=134, h=184.

- bulkhead-south : x=686, z=254, w=46, d=126, h=184.

- ammo-rack : x=325, z=43, w=88, d=62, h=80.

- cover-a : x=465, z=86, w=106, d=45, h=52.

- cover-b : x=475, z=281, w=115, d=45, h=52.

- east-rack : x=1074, z=272, w=85, d=70, h=112.

- defense-gate : x=686, z=134, w=46, d=120, h=180.

- hatch:sentry-to-ops : x=56, z=157, w=24, d=74, h=155.

### Appuis

- sentry-console : socle arrière, référence=mur/sol, élévation=0.

- ammo-box : sol de défense, référence=mur/sol, élévation=0.

- lamp-west : mur nord, référence=mur/sol, élévation=0.

- lamp-east : mur nord, référence=mur/sol, élévation=0.

## Hangar du Sulaco

Fret · accès au sas

Final natif préservé — Cette pièce reste inspectable seule. Elle n’est pas raccordée à Repli sur Operations. La représentation de la Reine et du loader n’est pas un nouveau final filmique ; la commande du sas reste réservée au système historique non fusionné ici.

### Liaisons

### Volumes

- cargo-north : x=615, z=0, w=75, d=131, h=178.

- cargo-south : x=615, z=260, w=75, d=120, h=163.

- cargo-west : x=330, z=57, w=135, d=75, h=100.

- cargo-east : x=936, z=278, w=130, d=75, h=91.

- loader-stand : x=1030, z=44, w=135, d=85, h=150.

- cargo-gate : x=615, z=131, w=75, d=129, h=181.

- airlock-critical : x=1370, z=0, w=45, d=380, h=200.

### Appuis

- cargo-console : sol de la coursive, référence=mur/sol, élévation=0.

- loader : plateforme technique, référence=mur/sol, élévation=0.

- hangar-lamp : poutre nord, référence=mur/sol, élévation=0.

- airlock-lamp : rail du sas, référence=mur/sol, élévation=0.
