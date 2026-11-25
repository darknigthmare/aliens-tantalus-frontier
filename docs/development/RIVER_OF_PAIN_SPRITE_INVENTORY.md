# Fleuve de la Douleur — inventaire des sprites et références

## Périmètre et état de départ

Cet inventaire décrit les données du DLC `river-of-pain`, version récupérée
`0.9.0-candidate.1`, intégrée dans `dlc/fleuve-de-la-douleur/`. Il sert de base
à la présentation `visual-v1` et à ses lots successifs. Il ne décrit ni les autres DLC ni tout l'arsenal de
la franchise Alien.

Les 29 fichiers runtime de cette base ont été comparés aux empreintes Git du
répertoire publié sur `main` après l'intégration PR 60 : ils correspondent.
La base ne contient **aucun atlas ou fichier image de sprite runtime** et ne
charge pas d'image avec `drawImage`. Les personnages, créatures, armes, véhicules
et décors sont dessinés par code Canvas. Les PNG historiques sont des captures
de validation, pas des sprites découpés pour le jeu.

Ce document distingue trois situations :

- **Présent, rendu provisoire** : entité réellement intégrée, dessinée par code.
- **Représentation non individualisée** : donnée présente, mais dessin générique
  sans forme spécifique au type.
- **Absent du parcours** : entrée documentaire sans acteur, objet ou scène
  correspondants. Produire son image ne suffit pas à l'ajouter au jeu.

Les palettes et hauteurs ci-dessous proviennent du code existant. Ce sont des
choix d'adaptation, sauf précision contraire sur une caractéristique documentée.
Les hauteurs sont des **unités logiques du rendu**, pas une taille obligatoire de
PNG ni une mesure physique des personnes.

## Sources et niveau de fidélité

Sources internes examinées :

- [Données, profils et registre structuré](../../dlc/fleuve-de-la-douleur/src/river-of-pain/data.js).
- [Registre de fidélité v0.9](../../dlc/fleuve-de-la-douleur/docs/REGISTRE_FIDELITE.md).
- [Sources et continuité](../../dlc/fleuve-de-la-douleur/docs/SOURCES_ET_CONTINUITE.md).
- [Rendu des personnages et objets v0.9](../../dlc/fleuve-de-la-douleur/src/river-of-pain/fidelity-visuals.js).
- [Rendu général et créatures](../../dlc/fleuve-de-la-douleur/src/river-of-pain/render.js).
- [Résidents et objets de colonie](../../dlc/fleuve-de-la-douleur/src/river-of-pain/life-visuals.js).
- [Détails d'architecture](../../dlc/fleuve-de-la-douleur/src/river-of-pain/architecture.js).
- [Tracteur et stations](../../dlc/fleuve-de-la-douleur/src/river-of-pain/mobility-visuals.js).

Le registre source distingue le roman, les références visuelles du film ou de
produits sous licence, et les créations de gameplay. Le texte intégral du roman
n'a pas été consulté lors de la construction de cette base. Les repères suivants
reprennent les références enregistrées, sans prétendre à une nouvelle expertise
du roman intégral :

| Repère | Référence enregistrée | Portée utile et limite |
| --- | --- | --- |
| R1 | Extrait autorisé Titan Books / Daily Dead, chapitres Rebecca et Arrivals | Traits d'Anne et Komiskey, rôles et matériel ; ne couvre pas le roman entier |
| R2 | Entretien de Christopher Golden du 30 octobre 2014 | Intérieur de l'épave et groupes du récit ; pas de plan coté |
| R3 | NECA, Rescuing Newt, figurines sous licence | Silhouette filmique de Newt ; exclure les accessoires de scènes ultérieures |
| R4 | Propstore, accessoire M240 employé dans Aliens | Forme de l'accessoire ; ne prouve pas sa dotation à Hadley's Hope dans le roman |

**La fidélité 1:1 des visages issus du roman n'est pas certifiée.** Les visages
de Brackett, Paris, Mori ou Luisa restent des interprétations. Un rendu plus
détaillé doit conserver ce statut. L'identité d'un personnage et son apparence
exacte sont deux niveaux de preuve différents.

### Complément visuel pour l'armure des Marines

Deux photographies primaires de Propstore ont été consultées le 25 novembre
2026 pour préparer Brackett et Paris. Elles documentent des accessoires
filmiques, sans établir l'apparence exacte de ces deux personnages du roman.

| Repère | Source primaire | Ce qu'elle permet de vérifier |
| --- | --- | --- |
| R5 | [Armure d'Apone, lot 126944](https://propstore.com/product/aliens-1986/sergeant-apones-al-matthews-screen-matched-u-s-colonial-marines-armor-costume/) | Forme du plastron, du dos et des épaules en aluminium ; camouflage et sangles. L'ensemble exposé associe cette armure originale à des éléments d'autres personnages et à des répliques. |
| R6 | [Casque de Frost, lot 126941](https://propstore.com/product/aliens-1986/pvtfrosts-ricco-ross-screen-matched-helmet/) | Base de casque M1, couvre-casque camouflage, plaques de nuque, caméra, oreillette et viseur rabattable. Le vendeur identifie l'accessoire comme celui visible dans le film. |

Ces images servent à contrôler les volumes, les matériaux et la disposition
de l'équipement. Les noms APONE et FROST, les marques personnelles et les
attributions propres à ces personnages ne doivent pas être reportés sur
Brackett ou Paris. La photo R5 n'authentifie pas ses bottes et toutes ses
pièces de présentation comme accessoires originaux d'Apone. Les photographies
de référence ne constituent pas des sprites du jeu.

Les limitations historiques concernant l'absence de publication dans les
documents v0.9 décrivent leur livraison d'origine. Elles ne contredisent pas
l'intégration GitHub ultérieure du paquet.

## Comptage des entités présentes

| Ensemble | Nombre dans les données | Statut graphique de départ |
| --- | ---: | --- |
| Profils nommés `appearances` | 14 | Vectoriels provisoires ; 13 identités du roman et 1 colon original |
| Joueurs `characters` | 4, inclus dans les 14 | Brackett, Paris, Anne, Newt |
| Contacts nommés `canonicalContacts` | 5, inclus dans les 14 | Tim, Simpson, Hansard, Joel, Bronagh |
| Résidents `life.residents` | 12 | Personnages originaux, autres profils de rendu |
| Familles d'ennemis | 2 | `adult` et `facehugger` |
| Modes d'arme | 3 | Deux armes distinctes et le module lance-grenades du M41A |
| Props statiques `rooms[].props` | 547 instances / 113 types | Modèles réutilisés ; pas 547 sprites uniques |
| Types sans dessin dédié | 2 types / 6 instances | `glass` et `case`, détail ci-dessous |
| Conteneurs dynamiques | 12 | Cinq types de conteneur |
| Établis | 3 | Rendu partagé |
| Volets / alarmes | 8 / 4 | États graphiques dynamiques |
| Conduits de maintenance | 5 routes / 10 bouches | Ne pas compter les routes comme dix lieux supplémentaires |
| Stations de maintenance | 2 | Rendu partagé |
| Tracteur pilotable | 1 | `prospector-01` |

Ces ensembles ne sont pas tous disjoints : `named-doctor` est un prop qui
dessine Komiskey, et certains types de mobilier statique ressemblent aux
conteneurs interactifs. Aucun total artificiel de « sprites définitifs » ne
peut être déduit en additionnant ces lignes.

## P0 — quatre personnages jouables

Les codes de couleur ci-dessous désignent tenue, pantalon et cheveux. Le rendu
v0.9 de `appearances` remplace les anciennes proportions de `characters`.

| ID exact | Personnage et rôle | Hauteur / carrure | Tenue / pantalon / cheveux | Référence et interprétation |
| --- | --- | --- | --- | --- |
| `brackett` | Demian Brackett, capitaine de garnison | 87 / 1,10 | `#7e8969` / `#5a6251` / `#554737` | Marine casqué et armé ; visage non décrit dans les sources consultées |
| `paris` | Julisa Paris, Marine et accueil au pad | 82 / 0,91 | `#83927b` / `#515c52` / `#302924` | Cheveux attachés, Marine casquée ; aucune ressemblance avec une interprète audio revendiquée |
| `anne` | Anne Jorden, prospectrice | 79 / 1,00 | `#978366` / `#555c54` / `#6d503b` | Cheveux bouclés attestés R1 ; teinte, visage et tenue interprétés |
| `newt` | Rebecca Jorden, enfant et parcours des conduits | 51 / 0,78 | `#a79b80` / `#4b6171` / `#b3a076` | Cheveux longs, haut beige et salopette bleu gris ; référence R3 ; aucun casque de Hicks à cette époque |

Le jeu montre ces acteurs de profil, pieds ancrés au sol, avec orientation
`facing` positive ou négative. La profondeur MIRE modifie l'échelle. Il faut
conserver la différence de taille enfant/adulte, les silhouettes distinctes et
la place de l'arme dans les mains des deux Marines.

États visuels à couvrir : repos, marche, accroupissement, déplacement accroupi,
traversée des connecteurs et, pour les Marines, port/visée de l'arme. Le code
existant articule les membres ; il ne possède pas déjà un nombre de frames
d'atlas à reproduire. Les phases tardives ajoutent des salissures et modifient
une bretelle de Newt.

## P1 — dix autres profils présents

| ID exact | Usage réel | Hauteur / carrure | Tenue / pantalon / cheveux | Trait documenté ou interprétation |
| --- | --- | --- | --- | --- |
| `russ` | Discussion familiale dans `jorden` | 86 / 1,08 | `#857b62` / `#515b55` / `#66513a` | Apparence fatiguée attestée R1 ; visage interprété |
| `komiskey` | Retour des prospecteurs et infirmerie | 71 / 1,42 | `#c1c8bc` / `#717e79` / `#694c36` | Petite et trapue, boucles brunes, yeux bleus attestés R1 ; yeux actuels `#76a2bc` ; blouse interprétée |
| `luisa` | Enfant escortée de `survey` au hangar | 53 / 0,78 | `#aa7870` / `#5a625e` / `#574133` | Autre enfant, distincte de Newt ; cheveux attachés et vêtements interprétés |
| `civilian` | Colon escorté du réfectoire au magasin | 80 / 1,00 | `#869296` / `#555f60` / `#635951` | Personnage original de gameplay |
| `mori` | Vérification de l'embarquement au hangar | 81 / 0,90 | `#c1c8bd` / `#65736f` / `#3b3330` | Médecin nommé ; visage non authentifié |
| `tim` | `contact-tim`, logement des Jorden | 61 / 0,85 | `#6b805f` / `#58665e` / `#62513b` | Enfant de la famille attesté R1 ; tenue et visage interprétés |
| `simpson` | `contact-simpson`, contrôle `ops` | 84 / 1,16 | `#aaa18c` / `#58665e` / `#706554` | Administrateur attesté R1 ; mise en scène et apparence interprétées |
| `hansard` | `contact-hansard`, distribution `power` | 86 / 1,05 | `#8b9278` / `#58665e` / `#5d5042` | Ingénieur en chef attesté R1 ; apparence interprétée |
| `joel` | `contact-joel`, infirmerie `med` | 86 / 0,82 | `#b8c5ba` / `#58665e` / `#3e342d` | Infirmier mince attesté R1 ; visage et tenue interprétés |
| `bronagh` | `contact-bronagh`, réfectoire `mess` | 79 / 1,10 | `#b6a386` / `#58665e` / `#6a5342` | Cuisinière attestée R1 ; cheveux attachés, visage et tenue interprétés |

Les cinq `contact-*` reprennent des identités rencontrées dans l'extrait situé
en 2173. Leur placement, leurs dialogues et leur état dans la campagne 2179
sont explicitement originaux dans les données.

## P2 — douze résidents originaux

Tous portent `origin: original_gameplay_resident`. Ils utilisent un autre
chemin de dessin que les 14 profils nommés et ne doivent pas devenir des
personnages prétendument attestés du roman.

| ID | Nom | Activité / lieu | Hauteur | Tenue | Cheveux / accessoire |
| --- | --- | --- | ---: | --- | --- |
| `vale` | Iona Vale | Maintenance habitat / `hab` | 93 | `#658b89` | Courts / outils |
| `rhee` | Malik Rhee | Cuisine collective / `mess` | 96 | `#ab9066` | Casquette / mug |
| `arden` | Vera Arden | Soins / `med` | 99 | `#b2c6ba` | Attachés / tablette |
| `becker` | Arun Becker | Archives / `records` | 102 | `#7385a0` | Courts / tablette |
| `ferris` | Solène Ferris | Fret / `stores` | 93 | `#b59258` | Casquette / outils |
| `corban` | Nils Corban | Transmissions / `relay` | 96 | `#648995` | Courts / tablette |
| `hale` | Ezra Hale | Atelier prospecteurs / `garage` | 99 | `#aa7961` | Casquette / outils |
| `doran` | Mei Doran | Biomédical / `biomed` | 102 | `#85a59b` | Attachés / tablette |
| `sato` | Lina Sato | Lingerie / `wash` | 93 | `#958799` | Attachés / linge |
| `bell` | Tomas Bell | Loisirs / `recreation` | 96 | `#82985e` | Courts / outils |
| `kent` | Rosa Kent | Accueil / `concourse` | 99 | `#9b8464` | Attachés / tablette |
| `voss` | Anton Voss | Relevés / `survey` | 102 | `#879aa3` | Courts / tablette |

Une base partagée avec têtes, tenues et accessoires différenciés correspond
au modèle actuel. Les skins déjà enregistrés dans `life.residents` doivent
être conservés lors du raccordement des variantes.

## P0 — deux familles de créatures

| ID exact | Rôle | Forme et palette de départ | Points à vérifier visuellement |
| --- | --- | --- | --- |
| `adult` | Ennemi adulte des secteurs envahis et intrusions | Dôme allongé, côtes biomécaniques, tubes dorsaux, queue ; corps `#182d38`, dôme `#162d38`, reflets `#68837c` / `#66868b` | Silhouette entière, queue non coupée, membres distincts, anatomie lisible au format du jeu |
| `facehugger` | Ennemi bas et rapide ; infirmerie, buanderie et intrusion biomédicale | Quatre paires de pattes, corps bas et queue recourbée ; `#b3a074`, `#b9aa79`, `#97835d`, `#b8aa80` | Huit pattes anatomiques, queue identifiable, profil bas ; ne pas compter une patte comme la queue |

Le modèle connaît `patrol`, `search`, `chase`, `windup`, `retreat`, `dead`.
Le rendu actuel ne fournit pas six animations distinctes : il anime la marche,
étend l'attaque et bascule le corps mort. Aucun ennemi `queen`, `chestburster`
ou sous-type `warrior` n'existe dans ces données. Il faut distinguer leur
éventuelle création future de l'amélioration des deux ennemis déjà jouables.

## Armes et équipements

### P0 — trois modes, deux armes

| ID | Modèle | Palette et forme actuelles | Statut de référence |
| --- | --- | --- | --- |
| `pulse` | M41A | Olive `#576349`, canon `#283a3b`, partie inférieure `#46574b` ; chargeur, poignée, compteur | Référence visuelle du film ; 30 cartouches est une règle de jeu |
| `flame` | M240 | Corps `#4a5946`, avant `#2b3634`, conduite et poignée | Accessoire du film référencé R4 ; dotation dans le roman à confirmer |
| `grenade` | Lance-grenades sous le M41A | Module sous canon, projectile séparé et explosion | Ne pas générer un troisième fusil autonome |

Le panneau d'armement de départ est textuel. Il ne contient pas déjà trois
images d'inventaire utilisables comme référence graphique finale.

### P1 — inventaire portatif

Clés exactes de `life.items` : `cell`, `wire`, `casing`, `decoy`, `ration`,
`medkit`, `ammo`, `flare`. Autres IDs d'équipement du registre : `tracker`,
`light`, `weld`, `marker`.

Les objets sont actuellement représentés par du texte, quelques rectangles
dans les conteneurs, des effets ou des petits dessins de boîtier. Le `decoy`
est un boîtier à antenne et voyant déjà dessiné ; il reste une création de
gameplay. Les balises et composants de fabrication ne constituent pas un
inventaire intégral attesté du roman.

## P1 — deux types de prop sans dessin dédié

Les types suivants existent dans les données mais n'ont pas de branche
spécifique dans le rendu général, les détails d'architecture ou les overrides
v0.9. Ils retombent sur la petite caisse générique marquée `SERVICE`.

| Type | Instances exactes | Correction visuelle attendue |
| --- | --- | --- |
| `glass` | `isolation-set-2` | Vitre identifiable de l'isolement, avec transparence et montage cohérent |
| `case` | `armory-v09-1`, `armory-v09-3`, `armory-v09-4`, `armory-v09-6`, `armory-v09-8` | Caisse/coffre d'armurerie identifiable ; modèle réutilisable pour les cinq instances |

Cette observation concerne l'état de départ. Une fois les nouveaux assets
raccordés, le rapport de validation doit préciser lesquels remplacent
effectivement ce dessin générique.

## P1 — props et véhicule emblématiques déjà présents

| Type / ID | Implantation | Forme à conserver et limite |
| --- | --- | --- |
| `weapon-rack` | 4 props dans `armory`, interaction `armory-rack-v09` | Râtelier sombre `#1b3037`, armes olive `#58684e` ; implantation originale |
| `rifle-rack`, `rifle-case` | Un de chaque dans `briefing` | Armes longues et coffre, formes encore simplifiées |
| `natal-unit` / `med-v09-14` | Infirmerie | Unité obstétricale claire, capot transparent ; existence référencée R1, emplacement interprété |
| `white-monitor` / `med-v09-15` | Infirmerie | Moniteur clair sur pied, écran sombre cyan |
| `pilot-seat` / `pilot_chamber-v09-10` | Chambre du pilote | Fossile assis fusionné au siège et à son poste ; cage thoracique ouverte et visée biomécanique ; pas une statue debout |
| `sealed-egg` | 8 dans `egg_vault` | Œuf nervuré à sommet lobé ; `#536448`, `#839073`, `#3f5543` |
| `egg-bed` / `egg_vault-v09-10` | Cale aux œufs | Socle organique ; ne pas compter comme ennemi |
| `egg` / `hive-set-4` | Ruche | Autre œuf statique, très simplifié |
| `specimen` | 4 props | Bocal translucide, organisme actuellement peu individualisé |
| `cocoon` | 6 props | Cocons de ruche avec silhouette humaine suggérée |
| `prospector-01` | Tracteur jouable, `road` / `plateau` | Corps `#596d64`, vitres `#183542`, quatre roues visibles et marquage 01 ; modèle original, existence de tracteurs évoquée R1 |
| `shuttle` / `hangar-set-0` | Hangar scientifique | Navette de la Compagnie ; modèle interprété, à ne pas rebaptiser Onager |

Les états ouverts/fermés, allumés/éteints et endommagés restent nécessaires
pour les conteneurs, volets, alarmes, stations et véhicule. Une image unique
ne doit pas effacer ces informations de gameplay.

## P3 — entrées documentées mais absentes ou à vérifier

### Personnes absentes ou non individualisées

| ID de registre | Entrée | Situation actuelle |
| --- | --- | --- |
| `finch` | Frères Finch | Entrée collective, aucun profil individuel |
| `monet` | Samantha Monet | Aucun acteur dédié |
| `ripley` | Ellen Ripley | Aucun acteur dédié |
| `burke` | Carter Burke | Aucun acteur dédié |
| `jonesy` | Jonesy | Aucun acteur dédié |
| `tressa` | Pilote de descente | Aucun acteur dédié |
| `jernigan` | Jernigan, Landers, Fleet et Moore | Une seule entrée regroupée ; ne pas inventer des IDs existants pour les trois derniers |

Ce sont **sept entrées de registre**, pas sept corps déjà définis. Le paquet
ne fournit pas de palette ou de visage authentifié pour ces entrées. Leur
présence future exige aussi une scène et un raccordement au jeu.

### Matériel absent

`cutter`, `scanner`, `suit`, `grappler` désignent le robot de découpe, le scanner,
le scaphandre et le grappin de récupération spatiale. Le registre les rattache
à la séquence de récupération de l'extrait, pas à la dotation gratuite des
Marines de la colonie.

### Matériel dont la présence reste à vérifier

`smartgun`, `sentry`, `p5000`, `pistol` n'ont pas une présence validée dans
River of Pain par le registre. Ils ne font pas partie de l'armement jouable
actuel. Une référence visuelle de la franchise ne suffirait pas à établir
leur place dans cette campagne.

### Scènes associées encore absentes

`salvage_bay`, `salvage_shuttle`, `orbital_medical`, `dropship_arrival` sont
des entrées documentaires, hors du plan colonial jouable. Leur absence ne
doit pas être masquée en plaçant les personnages ou appareils concernés dans
une pièce sans rapport, ni en reliant une station orbitale par une porte.

## Livraison historique — lot 1 intégré par la PR 62

Le premier lot de `visual-v1`, intégré par la PR 62, a retenu **42 PNG individuels**. Ils remplacent
des représentations déjà présentes pour les états explicitement couverts ;
ce nombre ne désigne ni 42 animations, ni la totalité des décors du DLC.

| Famille | PNG sélectionnés | Couverture effective |
| --- | ---: | --- |
| Profils nommés | 14 | Douze poses debout sans arme ; Brackett et Paris avec arme rangée |
| Résidents originaux | 12 | Les douze identités de `life.residents`, au repos, avec leur accessoire professionnel dans les mains |
| Créature mobile | 1 | Facehugger au repos ; les états mobiles et agressifs gardent leur dessin natif |
| Décors | 4 | Œuf fermé pour `egg` et `sealed-egg`, coffre `case`, vitre `glass`, bocal `specimen` admissible |
| Objets et équipement | 11 | `cell`, `wire`, `casing`, `decoy`, `ration`, `medkit`, `ammo`, `flare`, `weld`, `light`, `tracker` |
| **Total** | **42** | **26 identités humaines, une créature, quatre décors et onze objets** |

Les armes M41A et M240 n'ont pas de nouveau PNG admis dans ce lot. Le brouillon
M41A écarté n'est pas livré ; les tentatives de correction, de M240 et
d'adulte Alien n'ont pas fourni d'image utilisable après refus du générateur.
Les rendus d'origine restent actifs pour ces éléments. Le bocal ne remplace
pas le spécimen large servant de couverture physique, et l'œuf vertical ne
remplace pas l'emprise de sol `egg-bed`.

Les traits des douze résidents sont adaptés à leurs profils originaux du jeu :
palette, coiffure, carnation, proportions et outil. Leurs visages ne sont pas
présentés comme des portraits attestés du roman ou du film. L'outil peint est
pris en charge par le rendu de résident, sans ajout d'un second objet flottant.

Les consignes de génération et les limites de provenance sont conservées dans
[GENERATION_LOG.json](../../dlc/fleuve-de-la-douleur/visual-v1/GENERATION_LOG.json).
Les quatre consignes exactes d'Arden, Becker, Ferris et Corban n'ont pas été
récupérées après l'interruption de session ; leurs descriptions reconstituées
sont identifiées comme telles. Leurs PNG réels ont été récupérés et contrôlés.

## Lot 2 — 28 types de décor admis

Le lot défini le 25 novembre 2026 comprend **28 PNG supplémentaires admis**, un
fichier `prop-<kind>.png` pour chacun des types ci-dessous. Avec les 42 images
du premier lot, le [manifeste de production](../../dlc/fleuve-de-la-douleur/visual-v1/sprite-manifest.json)
contient **70 PNG individuels**. Le builder a validé ce manifeste et reconstruit
le standalone dérivé.

Ces types existent déjà dans `rooms[].props` : ils totalisent **130 instances**,
dont **122 décors admissibles** sans collision ni empreinte physique et
**huit exemplaires physiques conservés en rendu natif**. Le tableau distingue
les emplacements admissibles aux PNG et les obstacles gardant leur dessin natif.

| Type exact | Instances dans la base | Décor admissible au PNG | Instance physique en rendu natif |
| --- | ---: | ---: | ---: |
| `natal-unit` | 1 | 1 | 0 |
| `white-monitor` | 1 | 1 | 0 |
| `microscope` | 1 | 1 | 0 |
| `fire-cabinet` | 9 | 9 | 0 |
| `oxygen` | 7 | 7 | 0 |
| `privacy-screen` | 4 | 4 | 0 |
| `gurney` | 4 | 4 | 0 |
| `glass-cabinet` | 2 | 2 | 0 |
| `medical-cross` | 4 | 4 | 0 |
| `sink` | 7 | 7 | 0 |
| `hose-reel` | 5 | 5 | 0 |
| `tool-board` | 5 | 5 | 0 |
| `hand-truck` | 2 | 2 | 0 |
| `cable-spool` | 6 | 6 | 0 |
| `tape-reel` | 2 | 2 | 0 |
| `radio` | 3 | 3 | 0 |
| `monitor` | 3 | 3 | 0 |
| `locker` | 4 | 4 | 0 |
| `chair` | 4 | 4 | 0 |
| `wall-clock` | 12 | 12 | 0 |
| `warning-board` | 12 | 12 | 0 |
| `noticeboard` | 7 | 7 | 0 |
| `plant` | 1 | 1 | 0 |
| `hanging-coat` | 5 | 5 | 0 |
| `lab-bench` | 3 | 1 | 2 |
| `pump-motor` | 7 | 5 | 2 |
| `bench` | 6 | 3 | 3 |
| `vending` | 3 | 2 | 1 |
| **Total : 28 types** | **130** | **122** | **8** |

### Raccordement au décor existant

L’adaptateur vérifie l’identifiant et le type dans la liste des props de la
salle. Un appareil créé temporairement pour représenter un objectif ne devient
pas un décor PNG parce qu’il utilise le même nom de type. Les conteneurs
interactifs de `life` et leurs états ouverts, fermés ou vidés conservent leur
chemin de rendu. Les huit instances physiques du tableau gardent leur dessin
et leur empreinte d’obstacle.

Chaque PNG entier est redimensionné avec un facteur uniforme pour tenir dans
l’enveloppe visible du corps natif. Sa hauteur de référence vient de cette
enveloppe ; sa largeur est plafonnée en conservant ses proportions. L’ancre
est le centre du bord inférieur de sa boîte alpha. Le décalage horizontal du
modèle et son point bas restent appliqués : une plaque murale garde sa hauteur,
et les roues restent sous leur point d’appui prévu. La boîte alpha calibre le
dessin ; elle ne découpe pas un morceau de l’image.

Les quatre inscriptions `UNITÉ OBSTÉTRICALE`, `FIRE`, `STOCK` et `!` restent
des textes natifs à leurs coordonnées, taille et couleur d’origine. Les
consignes de génération réservent leur place sans les peindre dans le PNG.
Le contrôle final doit vérifier l’unicité et l’alignement de ces légendes dans
la composition réelle. Les états animés et les éléments dont l’apparence
dépend de l’alimentation, du temps ou de la mission gardent leur rendu natif.

### Provenance du dessin

Dans l’extrait autorisé R1 / S18, les moniteurs sont blancs et lisses, avec
des témoins verts et bleus ; la grande unité de chirurgie natale possède un
capot principalement transparent. Ces traits étayent `white-monitor` et
`natal-unit`. Le châssis, le contrôleur latéral, le pied et le tracé ECG restent
des adaptations du jeu.

Pour les 26 autres types, les formes, montages et couleurs sont ceux du DLC ou
des précisions graphiques de leur fonction. Le `microscope` natif partage un
pupitre à écran générique : lui donner une optique reconnaissable est une
interprétation déclarée. Les concepts de production et l’accessoire utilitaire
répertoriés dans le [registre des références](RIVER_OF_PAIN_SPRITE_REFERENCES.md)
donnent un contexte de décor ; ils ne certifient pas la ressemblance 1:1 de
chacun de ces objets.

## Contrôle des PNG générés

Le lot visuel se trouve dans
`dlc/fleuve-de-la-douleur/visual-v1/assets/`, un fichier par image.
Les sections sur la base v0.9 décrivent l’état de départ ; le bilan du lot 1
décrit ses 42 images, et le lot 2 ajoute 28 images admises pour un total de
70 PNG. Le tableau du lot 2 détaille les types couverts et l’admissibilité de
leurs emplacements. Le manifeste reste la liste exacte de la sélection.

Les versions retenues de `natal-unit` et `glass-cabinet` corrigent la
transparence des vitrages au moyen de leur véritable canal alpha. Tous les
PNG admis sont les images complètes issues du générateur ; leurs pixels
restent inchangés par les scripts de contrôle et d’intégration.

Le [manifeste de production](../../dlc/fleuve-de-la-douleur/visual-v1/sprite-manifest.json)
déclare les seuls fichiers sélectionnés, leurs cibles, poses, empreintes,
boîtes alpha et ancrages. La présence d'une pose `idle` ou `stowed` ne prouve
pas la couverture de la marche, de l'accroupissement ou du tir. Le lot ne
fabrique pas de frames d'animation à partir d'une pose fixe.
L'orientation opposée peut être obtenue par miroir dans le renderer ; elle
ne constitue pas une seconde vue dessinée ni une validation des accessoires
asymétriques sous deux angles.

Pour les 14 profils `appearances`, la hauteur affichée du PNG est calibrée sur
la hauteur visible de l'ancien dessin, soit
`0.79 * appearances[id].height + 36`. Les 12 résidents passent par un autre
dessin natif et conservent sa formule `0.78 * resident.height + 29`. Ces
valeurs diffèrent donc des hauteurs internes de profil des tableaux.
Le champ `accessory`, lorsqu'il est présent pour un résident, désigne l'objet
déjà dessiné dans sa pose (`tools`, `mug`, `tablet` ou `linen`). Il ne change
pas le métier ni l'inventaire du résident. Les ancrages sont repérés dans le canevas original à partir de la ligne
des pieds ou du centre de l'objet. Pour les dix derniers résidents, le centre
horizontal est mesuré sur la bande inférieure de 10 % de la silhouette à
alpha >= 200, et la ligne de sol suit le dernier pixel des bornes alpha >= 16.
La recette Chromium du lot 1 a été réalisée et validée dans le cadre de la
PR 62. La recette du lot 2 doit confirmer les nouveaux décors admis dans leurs
scènes réelles. La boîte alpha sert à l'échelle et ne découpe pas l'image.

Le script [inspect-river-of-pain-sprites.py](../../scripts/inspect-river-of-pain-sprites.py)
est un inspecteur en lecture seule. Il mesure chaque PNG avec Pillow,
ne sauvegarde aucune image et exige un rapport JSON **hors du projet** :

```sh
python3 scripts/inspect-river-of-pain-sprites.py \
  dlc/fleuve-de-la-douleur/visual-v1/assets \
  --report /tmp/river-of-pain-sprite-inspection.json
```

Le rapport contient dimensions, mode, canaux, nombre de frames, SHA256,
histogramme alpha, pixels transparents et boîtes utiles aux seuils
**alpha >= 16** et **alpha >= 200**. Les coordonnées de droite et du bas
sont exclusives. Chaque bord est compté séparément ; un pixel d'angle peut
donc être compté sur deux bords. Les PNG animés sont signalés et seule leur
frame 0 est mesurée. Les valeurs d'alpha d'une palette PNG sont décodées en
mémoire pour l'analyse, sans modification du fichier.

Un contact avec le bord signale une vérification visuelle à faire, pas une
preuve automatique de découpe. Un personnage volontairement cadré n'a pas le
même usage qu'un sprite entier. L'absence de pixels entièrement transparents
est signalée ; un damier peint ou un fond opaque ne constitue pas une vraie
transparence.

Un PNG peut conserver des couleurs RGB dans ses pixels d'alpha nul. Certains
aperçus affichent ces couleurs cachées et donnent l'impression d'un halo ou
d'un fond. Il faut vérifier l'alpha réel avant de rejeter le fichier : un
pixel brun d'alpha 0 est invisible dans une composition qui respecte le canal
alpha. Inversement, une mention de génération « fond transparent » ne remplace
pas la mesure du fichier reçu.

La lecture humaine doit ensuite vérifier la silhouette, les accessoires,
les membres et articulations visibles, la queue et les huit pattes du
facehugger, les proportions enfant/adulte, ainsi que l'absence d'élément
important coupé. Les mesures de pixels ne certifient ni l'anatomie ni une
ressemblance canonique. Les fichiers source restent inchangés pendant ce
contrôle ; une correction visuelle doit produire une nouvelle génération
identifiée, pas une retouche silencieuse par cet inspecteur.

## Annexe — les 113 types de props réellement instanciés

Le tableau suivant compte uniquement `rooms[].props` de la base v0.9. Il
n'inclut ni les objets d'objectif, ni les conteneurs interactifs de `life`,
ni le tracteur pilotable. Les IDs de type sont conservés tels quels.

| Type exact | Instances |
| --- | ---: |
| `antenna` | 4 |
| `arcade` | 3 |
| `barrier` | 5 |
| `beacon` | 8 |
| `bed` | 8 |
| `bed-lamp` | 2 |
| `bench` | 6 |
| `blanket` | 2 |
| `bolt-panel` | 5 |
| `cable` | 9 |
| `cable-spool` | 6 |
| `cable-tray` | 14 |
| `cart` | 3 |
| `case` | 5 |
| `ceiling-light` | 10 |
| `chain-hoist` | 4 |
| `chair` | 4 |
| `cocoon` | 6 |
| `coil` | 2 |
| `console` | 10 |
| `crate` | 11 |
| `cupboard` | 3 |
| `door-plaque` | 1 |
| `drawing` | 6 |
| `duct-junction` | 4 |
| `egg` | 1 |
| `egg-bed` | 1 |
| `fan` | 4 |
| `fire-cabinet` | 9 |
| `floodlight` | 6 |
| `fridge` | 3 |
| `fuel` | 6 |
| `gantry` | 6 |
| `gauge` | 6 |
| `glass` | 1 |
| `glass-cabinet` | 2 |
| `grille` | 6 |
| `gurney` | 4 |
| `hab-door` | 3 |
| `hand-truck` | 2 |
| `hanging-coat` | 5 |
| `hatch` | 1 |
| `hose-reel` | 5 |
| `kitchen-hood` | 2 |
| `lab-bench` | 3 |
| `lamp` | 2 |
| `linen` | 2 |
| `locker` | 4 |
| `map` | 2 |
| `medical-cross` | 4 |
| `medicine` | 4 |
| `microscope` | 1 |
| `monitor` | 3 |
| `mug` | 6 |
| `named-doctor` | 1 |
| `natal-unit` | 1 |
| `noticeboard` | 7 |
| `oxygen` | 7 |
| `pallet` | 5 |
| `panel` | 4 |
| `photo` | 3 |
| `pilot-seat` | 1 |
| `pipe` | 9 |
| `pipe-elbow` | 9 |
| `plant` | 1 |
| `planter` | 8 |
| `privacy-screen` | 4 |
| `pump-motor` | 7 |
| `rack` | 5 |
| `radio` | 3 |
| `radio-mast` | 4 |
| `ration` | 2 |
| `resin` | 10 |
| `rib` | 38 |
| `rifle-case` | 1 |
| `rifle-rack` | 1 |
| `rock` | 12 |
| `rock-fragment` | 5 |
| `screen` | 4 |
| `sealed-egg` | 8 |
| `seat` | 2 |
| `server` | 2 |
| `shelf` | 4 |
| `shower` | 1 |
| `shuttle` | 1 |
| `sign` | 1 |
| `sink` | 7 |
| `specimen` | 4 |
| `stove` | 2 |
| `survey-stake` | 4 |
| `table` | 12 |
| `tank` | 10 |
| `tape-reel` | 2 |
| `tool-board` | 5 |
| `tools` | 5 |
| `tower` | 2 |
| `toy` | 3 |
| `trace-mark` | 5 |
| `tractor` | 2 |
| `transformer` | 3 |
| `tray` | 1 |
| `turbine` | 3 |
| `valve` | 4 |
| `vending` | 3 |
| `vent-cover` | 13 |
| `wall-clock` | 12 |
| `warning-board` | 12 |
| `washer` | 4 |
| `weapon-rack` | 4 |
| `wheel` | 4 |
| `white-monitor` | 1 |
| `window` | 3 |
| `wreck` | 1 |

Total : **113 types / 547 instances**.
