# ALIEN 5 — PROJET LAZARE
## V3 — Les chemins de repli · 1.2.0-candidate.1

### Une branche autonome
Calder, Lazare, ces six pièces de service, les dialogues et les fins sont des créations du jeu. Le dossier ne revendique ni scénario de film retrouvé, ni continuité officielle. MIRE désigne ici une campagne isolée ; aucun registre natif du moteur principal n’est fusionné.

### Une fonction avant le décor
Un atelier reçoit de l’outillage, un échangeur reçoit des pompes et un collecteur, la surveillance reçoit ses écrans et son raccord de retour. Les nouvelles liaisons restent dans leur service et à leur étage. Les 347 éléments décoratifs sont des placements réutilisant des formes, pas 347 images uniques.

### Domaines et profondeur
18 pièces sont latérales, 24 permettent de se déplacer en profondeur. Largeur logique : 1500 ou 1800. Les positions de profondeur restent normalisées ; la navigation utilise 330 unités et les pieds sont projetés à 455 + z × 200. Ces unités ne sont pas des mesures certifiées en mètres.

### Couches séparées
Le ciel lointain, la structure, les dispositifs, les acteurs et le premier plan sont séparés dans le rendu. Les repères de profondeur et les supports sont décrits dans chaque fiche. Une forme placée hors du chemin ne crée pas une collision invisible.

### Collisions identiques au plan local
Les 48 emprises solides sont rendues dans la couche de jeu. La marche est subdivisée ; une ligne de tir traversant une emprise est bloquée. Le plan local provient des mêmes coordonnées que la simulation. Il n’affiche pas les positions des ennemis.

### 56 connexions réciproques
Une porte associe deux entrées d’un même lien. Les 9 connexions nouvelles ajoutent trois boucles de service. Les parcours A* et les 28 états successifs du scénario sont testés pour empêcher une boucle facultative de contourner une autorisation principale.

### Priorité d’interaction locale
L’action la plus proche est choisie avec un léger départage de type. Une commande distante de quelques dizaines d’unités ne vole plus une porte sur laquelle Ripley se tient. Le défaut rencontré aux archives pendant le parcours automatique a été corrigé et couvert par un test.

### Interventions interruptibles
E commence ou annule le travail. Marcher, tirer ou subir des dommages l’interrompt. Une porte, un ascenseur, une charge et un équipement n’ont pas la même durée. Une interruption ne conserve pas une validation partielle.

### Attendre au seuil
L’attente de l’équipe est active par défaut. Les équipiers présents en suivi et trop éloignés, bloqués ou au sol retardent le passage. Ils se rapprochent réellement. « Partir sans attendre » assume la séparation ; E ou le mouvement annule le regroupement. Les verrous et la portée sont revalidés, même lors du départ forcé.

### Quatre ordres pour Hicks
Suivre autorise le tir ; Suivre en silence déplace Hicks sans ouvrir le feu ; Couvrir fixe sa position tout en autorisant le tir ; Attendre fixe sa position sans tirer. C alterne ces quatre ordres. B regroupe uniquement les équipiers de la pièce et place Hicks en suivi silencieux.

### Un équipier n’est pas un téléporteur
Les personnes séparées restent dans leur pièce, que la carte et le menu Équipe affichent. Les soins exigent une proximité et une ressource. Un allié au sol peut être relevé ; une réserve vide ne le soigne pas gratuitement. G prélève jusqu’à 16 cartouches chez Ripley pour Hicks.

### Miller doit être évacuée
La libération active une escorte lente et sans arme. Le sas du répartiteur de crise vérifie sa présence, sa santé et sa proximité. Le bilan distingue libération et prise en charge. Une V1 ayant déjà accordé l’évacuation narrative conserve cet acquis lors de l’import.

### Chemins moins exposés
Le planificateur pénalise les emprises de sang acide, les jets de vapeur actifs et la bande noyée du bassin non purgé. La route directe est également vérifiée avant d’éviter le calcul A*. Cette préférence n’est pas une garantie d’invulnérabilité : un danger peut s’activer pendant le déplacement.

### Outillage réel
Le détecteur et le découpeur sont à récupérer dans la soute des dépanneurs. La récupération exige 1,3 seconde. Le verrou D2 prend 2,4 secondes et produit du bruit. Le découpeur dispose de son alimentation autonome : il ne consomme pas le carburant de l’incinérateur.

### Détecter le mouvement, pas une identité
T relève le détecteur. Une impulsion est calculée toutes les 0,75 seconde, dans un rayon local de 740 unités. Les contacts mobiles récents peuvent être hostiles ou alliés ; le viseur ne fournit aucune espèce ni faction. Les acteurs immobiles et ceux des autres pièces ne sont pas affichés.

### Batterie et main disponible
Le détecteur consomme 9 points de batterie par seconde et regagne 5 points par seconde lorsqu’il est abaissé. Une batterie inférieure à 2 ne permet pas de le relever. Tirer le rabaisse ; changer de pièce efface les contacts. Les menus suspendent la consommation.

### La torche peut trahir Ripley
Le faisceau ne sert plus seulement à éclairer. Un garde situé devant Ripley, dans le faisceau et sans obstacle peut la détecter plus loin. Le test conserve les effets de l’éclairage de la pièce et de la marche silencieuse. Les gardes possèdent un sens de regard ; les xénomorphes conservent une perception plus large.

### Caméras locales
Cinq caméras surveillent des lieux précis à partir de la rupture du confinement. Leur balayage de 9 secondes et leur empreinte lumineuse proviennent du même calcul que la détection. La suspicion augmente lors d’une présence, décroît hors du faisceau et déclenche une alerte locale de six secondes.

### Pas d’apparition artificielle à l’alerte
L’alarme prévient les gardes déjà présents et leur donne une position à examiner. Elle ne génère pas une vague de renforts illimitée. Couper la vidéo désactive les cinq caméras et ouvre la coursive vers l’infirmerie ; les gardes restent en place.

### Refroidissement et procédure lisible
Après drainage, placer A sur RÉSERVE, B sur RÉSEAU et C sur FERMÉ. Le panneau et une note expliquent cette procédure. Chaque volant avance en 0,65 seconde. Une erreur déclenche une décharge localisée de 2,2 secondes, sans consommer de fusible unique ni bloquer définitivement la campagne.

### Deux minutes, une seule fois
Le refroidissement débloque le retour d’eau et ajoute 120 secondes à la stérilisation. Le marqueur d’application est sauvegardé. L’activation avant ou après le lancement et les importations successives sont couvertes par des tests afin d’éviter le cumul du bonus.

### Combat fini et attaques engagées
Les ennemis possèdent des instances persistantes ; les munitions et les caches sont finies. Une attaque préparée reste liée à la cible acquise : elle ne frappe plus un autre équipier simplement devenu plus proche durant l’animation. Les lignes de tir et la profondeur restent déterminantes.

### La reine reste une résolution environnementale
Trois attaches, puis la commande de rupture, puis le hangar. Les tirs contiennent la reine mais ne remplacent pas cette séquence. Les trois fins principales sont conservées ; les interventions facultatives sont ajoutées au bilan, sans créer une quatrième fin fictive.

### Deux cartes, aucun déplacement instantané
La vue d’ensemble organise le graphe par niveau. Une pièce connue peut recevoir un repère et le HUD indique le prochain accès ouvert. Le plan local affiche portes, emprises, dispositifs et compagnons. Choisir un nœud ne déplace jamais le personnage.

### L’interface laisse la scène visible
La radio, les notifications, le travail en cours, le détecteur et les commandes tactiques sont sous l’image. Les menus Équipe et Matériel donnent accès aux commandes sans clavier. Les armes, le soin, la torche et le leurre possèdent des boutons utilisables au tactile.

### V1, V2 et V3 restent séparées
La clé actuelle est atf.alien5.lazare.v3. L’export/import JSON accepte les trois formats et ajoute les nouvelles créatures lors de la migration d’un registre historique complet. Les anciennes clés ne sont pas écrasées. L’import normalise les nombres, positions, états et identifiants.

### Une sauvegarde n’est pas une promesse de stockage
Le refus de stockage est affiché. L’export reste le moyen prudent de déplacer une opération entre fichiers ou origines. Les tests de persistance utilisent un substitut explicite ; la conservation native après fermeture du navigateur n’est pas certifiée dans cet environnement.

### Preuves, pas certification totale
Les suites enregistrent 295 contrôles. Les deux parcours complets sont pilotés par un automate connaissant les positions et la solution du puzzle. L’atlas utilise des états préparés. Aucun parcours manuel complet ni test de régression du moteur Tantalus entier n’est revendiqué.

## A5_00 — Quai d’approche

Le refuge de transit domine le quai ; deux portes mènent au refuge et à la promenade.

Vue sur la ville, pylône de dock, bollards, câbles d’amarrage, projecteurs de fret.

Niveau 00 ; mode depth ; largeur 1800.

Accès P00 : Refuge des transitaires ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P01 : Promenade des citernes ; x 1655 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_00 ; game/data.json.

## A5_01 — Refuge des transitaires

Le refuge reçoit les dockers de nuit et donne sur une galerie de service.

Lits superposés, casiers, table, distributeur, radio et sacs de transit.

Niveau 00 ; mode side ; largeur 1500.

Accès P00 : Quai d’approche ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P02 : Poste de fret ; x 1355 · profondeur 0.5 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_01 ; game/data.json.

## A5_02 — Promenade des citernes

La passerelle court entre la citerne industrielle et la gare suspendue.

Citernes rivetées, coursive au fond, grilles de ventilation et pompes.

Niveau 00 ; mode depth ; largeur 1800.

Accès P01 : Quai d’approche ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P03 : Poste de fret ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P04 : Gare suspendue ; x 560 · profondeur 0.16 ; verrou aucun.

Accès S37C : Passage de service D2 ; x 1210 · profondeur 0.23 ; verrou svc_dock.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_02 ; game/data.json.

## A5_03 — Poste de fret

Les manifestes et accréditations sont contrôlés avant la gare.

Guichet vitré, barrière levante, scanner, compteur de lots, palettes.

Niveau 00 ; mode side ; largeur 1500.

Accès P02 : Refuge des transitaires ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P03 : Promenade des citernes ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès P05 : Atelier des monteurs ; x 560 · profondeur 0.5 ; verrou aucun.

LIGHT_03 — Couper les plafonniers ; x 1180 · profondeur 0.5 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_03 ; game/data.json.

## A5_04 — Gare suspendue

Une navette de fret absente a laissé son relais radio sous tension.

Rails en arrière-plan, bancs, signalétique, porte palière et grue.

Niveau 00 ; mode depth ; largeur 1800.

Accès P04 : Promenade des citernes ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P06 : Atelier des monteurs ; x 1655 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_04 ; game/data.json.

## A5_05 — Atelier des monteurs

Le monte-charge dessert directement les sas ouvriers de l’étage 01.

Établis, pièces suspendues, bouteille de gaz, pont roulant et treuil.

Niveau 00 ; mode depth ; largeur 1800.

Accès P05 : Poste de fret ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P06 : Gare suspendue ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès L0 : Sas ouvrier ; x 560 · profondeur 0.16 ; verrou key_freight.

Accès S36A : Soute des dépanneurs ; x 1230 · profondeur 0.23 ; verrou aucun.

CACHE_05 — Ouvrir la dotation de secours ; x 1260 · profondeur 0.7 ; 1.7 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_05 ; game/data.json.

## A5_06 — Sas ouvrier

Le personnel se décontamine entre le dock et les chaînes.

Douches sèches, bancs, casiers fermés, filtre et porte étanche.

Niveau 01 ; mode side ; largeur 1500.

Accès P07 : Chaîne des conteneurs ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P08 : Bureau des équipes ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès L0 : Atelier des monteurs ; x 560 · profondeur 0.5 ; verrou key_freight.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_06 ; game/data.json.

## A5_07 — Chaîne des conteneurs

Les cages de transport suivent un convoyeur vers le centre de recherche.

Convoyeur arrêté, berceaux numérotés, crochet, pont de contrôle, caisses scellées.

Niveau 01 ; mode depth ; largeur 1800.

Accès P07 : Sas ouvrier ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P09 : Chaufferie centrale ; x 1655 · profondeur 0.16 ; verrou aucun.

LIGHT_07 — Couper les plafonniers ; x 1180 · profondeur 0.41 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_07 ; game/data.json.

## A5_08 — Bureau des équipes

Le contremaître conserve les heures et les affectations des équipes disparues.

Horloge, dossiers, armoire métallique, planning et écran de pointage.

Niveau 01 ; mode side ; largeur 1500.

Accès P08 : Sas ouvrier ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P10 : Chaufferie centrale ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès P11 : Galerie d’inspection ; x 560 · profondeur 0.5 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_08 ; game/data.json.

## A5_09 — Chaufferie centrale

Le groupe auxiliaire alimente le monte-charge et les pompes du laboratoire.

Chaudières, conduites chaudes isolées, vannes, jauges et bac de purge.

Niveau 01 ; mode depth ; largeur 1800.

Accès P09 : Chaîne des conteneurs ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P10 : Bureau des équipes ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P12 : Monte-charge M2 ; x 560 · profondeur 0.16 ; verrou aucun.

VALVE_09 — Fermer la dérivation de vapeur ; x 1240 · profondeur 0.4 ; 1.2 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_09 ; game/data.json.

## A5_10 — Galerie d’inspection

Une passerelle technique évite la chaîne et rejoint son extrémité haute.

Chemin de câbles, trappes, garde-corps, ventilateurs et boîtiers.

Niveau 01 ; mode side ; largeur 1500.

Accès P11 : Bureau des équipes ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P13 : Monte-charge M2 ; x 1355 · profondeur 0.5 ; verrou aucun.

VALVE_10 — Fermer la dérivation de vapeur ; x 900 · profondeur 0.5 ; 1.2 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_10 ; game/data.json.

## A5_11 — Monte-charge M2

Le grand ascenseur relie l’atelier 01 à l’accueil de l’étage 04.

Contrepoids, portes massives, rail-guide, commandes et marquages de charge.

Niveau 01 ; mode depth ; largeur 1800.

Accès P12 : Chaufferie centrale ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P13 : Galerie d’inspection ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès L1 : Réception Weyland ; x 560 · profondeur 0.16 ; verrou lift_ready.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_11 ; game/data.json.

## A5_12 — Réception Weyland

Le personnel administratif arrive par une réception séparée des cages de fret.

Arbre sous verre, banques d’accueil, vitrage, panneau mural et sièges.

Niveau 04 ; mode depth ; largeur 1800.

Accès P14 : Archives du personnel ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P15 : Contrôle de la tour ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès L1 : Monte-charge M2 ; x 560 · profondeur 0.16 ; verrou lift_ready.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_12 ; game/data.json.

## A5_13 — Archives du personnel

Les copies locales des contrats restent accessibles hors réseau.

Rayonnages de bandes, lecteurs, classeurs et chariot de stockage.

Niveau 04 ; mode side ; largeur 1500.

Accès P14 : Réception Weyland ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P16 : Atrium des actionnaires ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès S40A : Surveillance auxiliaire ; x 1130 · profondeur 0.5 ; verrou aucun.

LIGHT_13 — Couper les plafonniers ; x 1180 · profondeur 0.5 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_13 ; game/data.json.

## A5_14 — Contrôle de la tour

L’opérateur surveille toutes les alimentations sans pouvoir ouvrir une cage manuellement.

Consoles inclinées, écrans superposés, baie serveur et vitrage de contrôle.

Niveau 04 ; mode depth ; largeur 1800.

Accès P15 : Réception Weyland ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P17 : Atrium des actionnaires ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P18 : Infirmerie du personnel ; x 560 · profondeur 0.16 ; verrou aucun.

LIGHT_14 — Couper les plafonniers ; x 1180 · profondeur 0.41 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_14 ; game/data.json.

## A5_15 — Atrium des actionnaires

La galerie publique cache une archive de direction dans son noyau.

Piliers blancs, plants sous verre, passerelle haute et signalétique minimale.

Niveau 04 ; mode depth ; largeur 1800.

Accès P16 : Archives du personnel ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P17 : Contrôle de la tour ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P19 : Sas de sécurité N3 ; x 560 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_15 ; game/data.json.

## A5_16 — Infirmerie du personnel

Les blessures d’acide sont enregistrées comme accidents de maintenance.

Deux brancards, armoire stérile, lampe articulée, scanner et bac clinique.

Niveau 04 ; mode side ; largeur 1500.

Accès P18 : Contrôle de la tour ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P20 : Sas de sécurité N3 ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès S41C : Coursive des câbles ; x 1140 · profondeur 0.5 ; verrou svc_watch.

CACHE_16 — Ouvrir la dotation de secours ; x 1210 · profondeur 0.5 ; 1.7 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_16 ; game/data.json.

## A5_17 — Sas de sécurité N3

Une batterie d’urgence contrôle l’escalier étanche vers les laboratoires de l’étage 03.

Double porte, douche, coffre à cartes, filtre et hublots rayés.

Niveau 04 ; mode side ; largeur 1500.

Accès P19 : Atrium des actionnaires ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P20 : Infirmerie du personnel ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès L2 : Vestiaire étanche ; x 560 · profondeur 0.5 ; verrou clearance.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_17 ; game/data.json.

## A5_18 — Vestiaire étanche

Les combinaisons sont stockées avant le bassin de confinement.

Combinaisons suspendues, bancs, bottes, sas transparent et ventilation.

Niveau 03 ; mode side ; largeur 1500.

Accès P21 : Laboratoire submergé ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P22 : Salle des prélèvements ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès L2 : Sas de sécurité N3 ; x 560 · profondeur 0.5 ; verrou clearance.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_18 ; game/data.json.

## A5_19 — Laboratoire submergé

Le bassin recueille le liquide d’une canalisation rompue ; le sol n’est plus sûr avant la purge.

Cuves, plateforme surélevée, passerelle jaune, câbles hors eau et pompes.

Niveau 03 ; mode depth ; largeur 1800.

Accès P21 : Vestiaire étanche ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P23 : Vivarium expérimental ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès S38A : Local des échangeurs ; x 1250 · profondeur 0.25 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_19 ; game/data.json.

## A5_20 — Salle des prélèvements

Les sérums et fragments sont catalogués avant transfert dans le vivarium.

Microscope, cuve d’échantillonnage, chariot, terminal et tiroirs réfrigérés.

Niveau 03 ; mode side ; largeur 1500.

Accès P22 : Vestiaire étanche ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P24 : Vivarium expérimental ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès P25 : Conduit de filtration ; x 560 · profondeur 0.5 ; verrou aucun.

LIGHT_20 — Couper les plafonniers ; x 1180 · profondeur 0.5 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_20 ; game/data.json.

## A5_21 — Vivarium expérimental

Les cages visibles sont reliées à un même circuit de contention.

Cages, hublots épais, pinces de prélèvement, conduites et chambre opaque.

Niveau 03 ; mode depth ; largeur 1800.

Accès P23 : Laboratoire submergé ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P24 : Salle des prélèvements ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P26 : Centre de confinement ; x 560 · profondeur 0.16 ; verrou aucun.

LIGHT_21 — Couper les plafonniers ; x 1180 · profondeur 0.41 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_21 ; game/data.json.

## A5_22 — Conduit de filtration

Le conduit dessert le bassin sans traverser les cages.

Grosses hélices, filtre amovible, grilles, sac filtrant et maintenance.

Niveau 03 ; mode side ; largeur 1500.

Accès P25 : Salle des prélèvements ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P27 : Centre de confinement ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès S39C : Galerie de retour d’eau ; x 1170 · profondeur 0.5 ; verrou svc_coolant.

VALVE_22 — Fermer la dérivation de vapeur ; x 910 · profondeur 0.5 ; 1.2 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_22 ; game/data.json.

## A5_23 — Centre de confinement

Le verrou de confinement coupe la commande à distance et isole le bloc de l’étage 02.

Baies électriques, triple vitrage, retenues arrachées et blindages.

Niveau 03 ; mode depth ; largeur 1800.

Accès P26 : Vivarium expérimental ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P27 : Conduit de filtration ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès L3 : Palier des gaines ; x 560 · profondeur 0.16 ; verrou quarantine.

LIGHT_23 — Couper les plafonniers ; x 1180 · profondeur 0.41 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_23 ; game/data.json.

## A5_24 — Palier des gaines

Le palier reçoit les flux d’évacuation du laboratoire situé un étage au-dessus.

Conduits verticaux, traverses, accès de câble et passerelle étroite.

Niveau 02 ; mode side ; largeur 1500.

Accès P28 : Chambre des greffes ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P29 : Nid de la rétention ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès L3 : Centre de confinement ; x 560 · profondeur 0.5 ; verrou quarantine.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_24 ; game/data.json.

## A5_25 — Chambre des greffes

Les tissus et appareils de maintien sont restés en circuit fermé.

Tables expérimentales, sangles, carter ouvert, résine et poches organiques.

Niveau 02 ; mode depth ; largeur 1800.

Accès P28 : Palier des gaines ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P30 : Salle de catalyse ; x 1655 · profondeur 0.16 ; verrou aucun.

LIGHT_25 — Couper les plafonniers ; x 1180 · profondeur 0.41 ; 0.85 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_25 ; game/data.json.

## A5_26 — Nid de la rétention

Les captifs proviennent d’une équipe de nettoyage envoyée après la rupture.

Cocons, barreaux noyés dans la résine, passerelle arrachée et drains.

Niveau 02 ; mode depth ; largeur 1800.

Accès P29 : Palier des gaines ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P31 : Salle de catalyse ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P32 : Four de stérilisation ; x 560 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_26 ; game/data.json.

## A5_27 — Salle de catalyse

La commande de chauffe dévie le combustible vers les canaux de stérilisation.

Trois réacteurs, volant de dérivation, collecteur, passerelles et calorifuge.

Niveau 02 ; mode depth ; largeur 1800.

Accès P30 : Chambre des greffes ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P31 : Nid de la rétention ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P33 : Répartiteur de crise ; x 560 · profondeur 0.16 ; verrou aucun.

LIGHT_27 — Couper les plafonniers ; x 1180 · profondeur 0.41 ; 0.85 s.

VALVE_27 — Fermer la dérivation de vapeur ; x 1200 · profondeur 0.38 ; 1.2 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_27 ; game/data.json.

## A5_28 — Four de stérilisation

Le four est séparé de la zone de vie par des volets coupe-feu.

Bouche réfractaire, bennes de résidus, bras hydraulique et protections thermiques.

Niveau 02 ; mode depth ; largeur 1800.

Accès P32 : Nid de la rétention ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P34 : Répartiteur de crise ; x 1655 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_28 ; game/data.json.

## A5_29 — Répartiteur de crise

La cage de secours remonte du bloc 02 à la couronne 08 sans desservir les bureaux.

Pupitre sécurisé, câble d’acier, cylindres hydrauliques et porte d’ascenseur.

Niveau 02 ; mode side ; largeur 1500.

Accès P33 : Salle de catalyse ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P34 : Four de stérilisation ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès L4 : Ascenseur de la couronne ; x 560 · profondeur 0.5 ; verrou sterilized.

EVAC_MILLER — Installer Miller dans le sas médical ; x 915 · profondeur 0.5 ; 2.0 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_29 ; game/data.json.

## A5_30 — Ascenseur de la couronne

Le palier abrite la sortie du monte-charge de crise.

Moteurs, contreforts, bâches, console météo et caisse d’outils.

Niveau 08 ; mode depth ; largeur 1800.

Accès P35 : Bras d’amarrage ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P36 : Réserve des charges ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès L4 : Répartiteur de crise ; x 560 · profondeur 0.16 ; verrou sterilized.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_30 ; game/data.json.

## A5_31 — Bras d’amarrage

Une plateforme de levage supporte la voie d’accès au hangar ; ses attaches sont destructibles.

Trois culées, bornes d’arrimage, poutres, treuils et contrepoids.

Niveau 08 ; mode depth ; largeur 1800.

Accès P35 : Ascenseur de la couronne ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P37 : Antenne de diffusion ; x 1655 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_31 ; game/data.json.

## A5_32 — Réserve des charges

Les charges de démolition servent au désassemblage des bras d’amarrage.

Râteliers fermés, malle ignifugée, coffret de commande et établi.

Niveau 08 ; mode side ; largeur 1500.

Accès P36 : Ascenseur de la couronne ; x 145 · profondeur 0.5 ; verrou aucun.

Accès P38 : Antenne de diffusion ; x 1355 · profondeur 0.5 ; verrou aucun.

Accès P39 : Piste d’envol ; x 560 · profondeur 0.5 ; verrou aucun.

LIGHT_32 — Couper les plafonniers ; x 950 · profondeur 0.5 ; 0.85 s.

CACHE_32 — Ouvrir la dotation de secours ; x 1190 · profondeur 0.5 ; 1.7 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_32 ; game/data.json.

## A5_33 — Antenne de diffusion

Le relais public possède un accès indépendant du réseau de la tour.

Mât, paraboles, caisson électrique, isolateurs et antennes de secours.

Niveau 08 ; mode depth ; largeur 1800.

Accès P37 : Bras d’amarrage ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P38 : Réserve des charges ; x 1655 · profondeur 0.16 ; verrou aucun.

Accès P40 : Hangar d’extraction ; x 560 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_33 ; game/data.json.

## A5_34 — Piste d’envol

Une voie de roulage longe la tour ; les balises restent alimentées sur batterie.

Balises, pare-vent, barrières, caniveau, éclairage et carburant.

Niveau 08 ; mode depth ; largeur 1800.

Accès P39 : Réserve des charges ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P41 : Hangar d’extraction ; x 1655 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_34 ; game/data.json.

## A5_35 — Hangar d’extraction

La navette attend derrière le sas atmosphérique, accessible depuis la piste et le bras.

Navette, rampe, chariot à bagages, pylônes d’énergie et crochet.

Niveau 08 ; mode depth ; largeur 1800.

Accès P40 : Antenne de diffusion ; x 145 · profondeur 0.16 ; verrou aucun.

Accès P41 : Piste d’envol ; x 1655 · profondeur 0.16 ; verrou aucun.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_35 ; game/data.json.

## A5_36 — Soute des dépanneurs

L’atelier stocke ici ses instruments de maintenance. Le passage D2 ramène les mécaniciens derrière les citernes sans emprunter les quais.

Râteliers fixés au mur, établi de vérification, chargeur électrique, placard de découpe et détecteur posé sur son berceau.

Niveau 00 ; mode side ; largeur 1500.

Accès S36A : Atelier des monteurs ; x 140 · profondeur 0.5 ; verrou aucun.

Accès S36B : Passage de service D2 ; x 1350 · profondeur 0.5 ; verrou aucun.

TOOLS — Prendre le détecteur et le découpeur ; x 790 · profondeur 0.5 ; 1.3 s.

LIGHT_36 — Couper les plafonniers ; x 560 · profondeur 0.5 ; 0.6 s.

CACHE_36 — Ouvrir la dotation des dépanneurs ; x 1045 · profondeur 0.5 ; 0.9 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_36 ; game/data.json.

## A5_37 — Passage de service D2

Ce retour technique longe la promenade. Sa dernière porte a été soudée après le dernier incident de manutention.

Un collecteur court sous le plafond. Les petites armoires restent derrière la bande de circulation ; les soudures de la porte sont visibles.

Niveau 00 ; mode side ; largeur 1500.

Accès S36B : Soute des dépanneurs ; x 140 · profondeur 0.5 ; verrou aucun.

Accès S37C : Promenade des citernes ; x 1350 · profondeur 0.5 ; verrou svc_dock.

CUT_D2 — Découper le verrou D2 ; x 1170 · profondeur 0.5 ; 2.4 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_37 ; game/data.json.

## A5_38 — Local des échangeurs

Le bassin d’urgence reçoit un traitement indépendant. Trois voies hydrauliques isolent la purge, le réseau et la réserve avant remise sous pression.

Pompes jumelles, échangeur à plaques, collecteur A/B/C relié aux conduites et panneau de mise en pression. Une barrière garde la zone arrière hors marche.

Niveau 03 ; mode depth ; largeur 1800.

Accès S38A : Laboratoire submergé ; x 145 · profondeur 0.48 ; verrou aucun.

Accès S38B : Galerie de retour d’eau ; x 1650 · profondeur 0.48 ; verrou aucun.

WHEEL_A — Tourner la voie A ; x 590 · profondeur 0.5 ; 0.65 s.

WHEEL_B — Tourner la voie B ; x 900 · profondeur 0.5 ; 0.65 s.

WHEEL_C — Tourner la voie C ; x 1210 · profondeur 0.5 ; 0.65 s.

COOLANT — Remettre le circuit sous pression ; x 900 · profondeur 0.23 ; 1.8 s.

LIGHT_38 — Couper les plafonniers ; x 1510 · profondeur 0.58 ; 0.6 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_38 ; game/data.json.

## A5_39 — Galerie de retour d’eau

Le retour de filtration contourne le bassin et rejoint le conduit N03. La porte aval attend une pression stabilisée aux échangeurs.

Tuyaux continus, regards fermés, jauge de pression et pupitre de consignation. Une ligne sèche dessert les deux seuils.

Niveau 03 ; mode side ; largeur 1500.

Accès S38B : Local des échangeurs ; x 140 · profondeur 0.5 ; verrou aucun.

Accès S39C : Conduit de filtration ; x 1350 · profondeur 0.5 ; verrou svc_coolant.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_39 ; game/data.json.

## A5_40 — Surveillance auxiliaire

Les caméras locales sont câblées vers ce poste, indépendant de l’autorité distante. Le contrat des archives permet d’identifier et de couper la boucle vidéo sans toucher aux portes médicales.

Moniteurs séparés, magnétoscopes de service, baie de distribution et table du quart. Les câbles sortent vers la coursive attenante.

Niveau 04 ; mode side ; largeur 1500.

Accès S40A : Archives du personnel ; x 140 · profondeur 0.5 ; verrou aucun.

Accès S40B : Coursive des câbles ; x 1350 · profondeur 0.5 ; verrou aucun.

VIDEO — Isoler la boucle de surveillance ; x 710 · profondeur 0.5 ; 1.8 s.

LIGHT_40 — Couper les plafonniers ; x 480 · profondeur 0.5 ; 0.6 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_40 ; game/data.json.

## A5_41 — Coursive des câbles

La maintenance contourne les bureaux par une coursive arrière. Le contrôle vidéo maintient fermé le passage de retour près de l’infirmerie.

Baies de câbles, alimentation séparée, passerelle latérale, garde-corps et deux points d’éclairage. Les obstacles n’occupent que l’avant du sol.

Niveau 04 ; mode depth ; largeur 1800.

Accès S40B : Surveillance auxiliaire ; x 145 · profondeur 0.48 ; verrou aucun.

Accès S41C : Infirmerie du personnel ; x 1650 · profondeur 0.48 ; verrou svc_watch.

LIGHT_41 — Couper les plafonniers ; x 1480 · profondeur 0.58 ; 0.6 s.

Données détaillées, placements et capture : CODEX_ALIEN5.html#A5_41 ; game/data.json.

