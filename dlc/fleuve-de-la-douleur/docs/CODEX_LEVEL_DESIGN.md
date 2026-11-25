# ALIEN — Fleuve de la Douleur

## Codex de level design · 0.9.0-candidate.1

Hadley’s Hope · Les lieux ont une mémoire

DLC autonome avec lanceur additionnel. Aucun GameEngine natif de Tantalus fusionné, aucun push GitHub ou déploiement Vercel. Plans et dialogues originaux ; roman intégral non disponible dans les sources consultées. Graphismes vectoriels stylisés provisoires, pas une ressemblance photoréaliste ni des atlas définitifs. L’objectif 1:1 n’est pas certifié.

## Ordre des références

Le roman reste la cible. Les preuves utilisées sont un extrait autorisé publié par Titan via Daily Dead, un entretien de Christopher Golden et des références visuelles du film ou sous licence. Une référence du film ne prouve pas la dotation d’un personnage dans le roman. Les ajouts jouables restent identifiés comme interprétations. Aucun pourcentage de fidélité n’est annoncé.

## Ce qui est réellement livré

47 pièces, 64 liaisons réciproques, 128 seuils orientés, 16 chapitres courts de jeu, 49 objectifs principaux, six détours de trois étapes et deux escortes. 547 placements de décor ne signifient pas autant d’images uniques. Les appareils interactifs sont comptés séparément.

Les cinq nouveaux volumes sont l’armurerie, la serre vitrée, la galerie biomécanique, la chambre du pilote et la cale aux œufs. Seule la présence de la serre est attestée par la nouvelle lecture du texte ; son mobilier végétal, sa distribution intérieure et ses connexions sont créés pour le jeu. Le découpage exact de l’épave et les dimensions des pièces ne sont pas un plan officiel.

## Cohérence des seuils et de la collision

Chaque extrémité porte un type, un support architectural, un point d’approche, un niveau et la référence réciproque. Une piste est dessinée comme une continuation du terrain avec un repère, pas une porte. Les passages de coque sont organiques. Les accès coloniaux sont reliés à des retours de cloison et à des supports ; escaliers, échelles, sas et monte-charges disposent de silhouettes distinctes.

Les volumes de support des portes sont des conventions de rendu 2D/2.5D ; cette passe ne prétend pas reconstituer toutes les cloisons en collision continue. Les obstacles actifs du sol restent la référence de déplacement et de tir. Les 74 couvertures statiques et les huit volets dynamiques conservent des emprises déclarées. Les grilles techniques ne sont pas des portes du joueur.

44 accessoires non collisionnables ont été déplacés pour dégager les apertures. Aucun objectif historique ou obstacle n’a été déplacé en cachette pour masquer un échec de navigation. E favorise maintenant une cible effectivement atteinte à 28 unités de projection avant une interaction distante ; les interdictions de personnage et de verrou restent en vigueur.

Les arrivées reprennent le portail inverse avec un retrait de sécurité de 75 unités vers l’intérieur. Si ce retrait rencontre une couverture, le moteur reste au seuil. Il ne faut pas comparer une arrivée normale au centre exact d’un repère de porte et en déduire une incohérence.

Les niveaux et dimensions sont des unités et choix de jeu. Les coordonnées du plan colonial forment un schéma de connexions, pas une carte à l’échelle du roman. Les 22 raccords temporisés restent des transitions animées bornées : le déplacement vertical n’est pas un volume librement explorable.

## Identités, apparences et époque

Le point familial représente Russ et non Brackett. Le point de retour médical emploie Komiskey. Louisa/Luisa est distincte de Newt dans le rendu d’escorte ; l’orthographe et les détails secondaires restent à recouper sur une édition intégrale. Le colon anonyme n’utilise plus la silhouette d’Anne. Une transmission de Brackett est représentée par un poste radio, pas par un corps placé arbitrairement.

Quatorze profils visuels distincts sont livrés. Les cheveux d’Anne et la morphologie de Komiskey utilisent des détails de l’extrait. La tenue de Newt suit une référence visuelle filmique sous licence, sans ajouter le casque de Hicks à cette époque. Les visages non documentés, tailles en pixels, couleurs et tenues des autres profils restent des interprétations.

Tim, Al Simpson, Greg Hansard, Joel et Bronagh Flaherty disposent de cinq points de conversation supplémentaires. Leurs rôles sont signalés par la source ; leur placement dans les scènes de 2179 et leurs répliques sont des créations du jeu. Ils ne remplacent pas les douze résidents originaux dotés de routines. Une conversation lue en pause ne constitue pas une simulation globale des habitants.

## Arsenal et garde-fous

La dotation de départ M41A et son chargeur de 30 restent des valeurs de gameplay. La 0.9 ajoute un M240 et un lance-grenades sous canon. Leur présence dans cette armurerie et leur attribution aux deux Marines sont optionnelles et originales ; aucun inventaire exhaustif du livre n’a été vérifié.

Le prélèvement exige Brackett ou Paris au râtelier et deux secondes de travail exposé. Chaque Marine reçoit au plus un lot de 60 unités de carburant et trois grenades, jamais renouvelé. Changer de point de vue conserve les dotations individuelles. Anne et Newt restent désarmées.

Le M240 applique un cône directionnel de 350 unités, 11 dégâts par impulsion et un intervalle minimal de 0,16 seconde. Le carburant remplace la consommation de cartouches ; aucun rechargement M41A ne remplit son réservoir. Les obstacles arrêtent les dégâts et limitent visuellement le cône. Il n’existe pas de nappe de feu persistante ni de simulation chimique.

La grenade parcourt un segment physique jusqu’au premier impact ou à sa portée de jeu. L’explosion affecte une zone de 135 unités sans traverser une paroi. Le joueur et son compagnon peuvent être blessés ; un volet peut être endommagé. Un seul projectile est actif à la fois. E et le franchissement sont bloqués jusqu’à l’impact pour ne pas abandonner une grenade gelée dans la pièce quittée.

Les tirs, réserves et dégâts sont des règles de jeu, pas des spécifications d’armes réelles. Le râtelier ne donne pas de smartgun, de tourelle, de pistolet ou de Power Loader simplement parce qu’ils existent dans la franchise. Le registre distingue absence, non-vérification et équipement effectivement utilisable.

## Persistance et héritage

Les vrais exports 0.1 à 0.8 sont acceptés. Le registre armory initialise des dotations vides ; il ne donne pas un équipement rétroactif. Les conteneurs, la mobilité, les gaines, les portes, les détours et les réserves héritées ne sont pas réinitialisés. Un import en cours de prélèvement annule le travail sans débiter un lot ; un projectile engagé conserve son propriétaire, sa position et sa munition déjà consommée.

Le protocole local à deux copies reste testé avec MemoryStorage simulé. La navigation HTTP locale a été refusée par l’environnement ; le HTML exact est exécuté avec set_content sans changement de politique. La persistance native après fermeture, les quotas réels et les onglets concurrents restent non qualifiés. Les téléchargements et imports JSON par le sélecteur ordinaire sont une preuve distincte.

Les systèmes antérieurs conservés comprennent les tableaux de courant et de pression, la lampe et le détecteur, les cachettes, l’écoute, les escortes, les réserves finies et fabrications, les alarmes et volets, le réseau de gaines pour adultes existants et le tracteur pilotable sur deux secteurs. Leurs définitions et valeurs détaillées sont présentes dans CONTENT_MANIFEST.json et les modules correspondants.

## Hors champ et chronologie

Les nouvelles salles n’engendrent aucune vague supplémentaire par elles-mêmes. Le pilote fossile est fixé dans sa chambre ; les œufs se trouvent dans la cale, et non répétés à l’entrée de l’épave. L’exploration facultative ne fabrique pas une nouvelle infection de Russ, ne tue pas une reine, n’évacue pas Newt et ne provoque pas de secours extérieur.

La baie de récupération spatiale, la navette retrouvée avec Ripley, le service médical de Gateway et la cabine de descente de Brackett restent manquants comme séquences jouables. Ils ne peuvent pas devenir des pièces derrière une porte de Hadley’s Hope. Le début de 2173 n’est pas rejoué comme un prologue complet. Ces manques restent visibles dans le registre intégré.

## Commandes ajoutées

6 : armement et râtelier. 3 : lancer une grenade avec le M41A équipé. 7 : références et écarts. Les boutons des dossiers existent aussi pour le tactile. P parle explicitement à une personne proche. Aucun dossier ne déplace le personnage ou n’attribue une ressource hors de portée.

## Campagne conservée

### 01 — La relève

Personnage : **Demian Brackett**. Stade : 0. Départ : **Aire d’atterrissage**.

Brackett prend ses fonctions dans une colonie qui ressemble encore à une ville.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Retrouver Paris | Aire d’atterrissage | `welcome` |
| Consulter le tableau de service | Contrôle colonial | `brief` |
| Prendre la dotation | Poste de la garnison | `locker` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 02 — Les gens d’ici

Personnage : **Anne Jorden**. Stade : 0. Départ : **Logement des Jorden**.

Anne traverse les lieux ordinaires que la crise rendra bientôt méconnaissables.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Préparer la tournée | Logement des Jorden | `family` |
| Récupérer les provisions | Réfectoire | `provisions` |
| Réarmer le départ habitat | Distribution électrique | `grid` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 03 — Sous pression

Personnage : **Demian Brackett**. Stade : 0. Départ : **Garage des prospecteurs**.

Une intervention industrielle expose les tensions de la garnison. Séquence de jeu condensée autour du processeur six.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Prendre le matériel de secours | Garage des prospecteurs | `rescue_kit` |
| Isoler la conduite endommagée | Processeur six | `pressure` |
| Récupérer le rapport d’intervention | Processeur six | `incident` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 04 — Les coordonnées

Personnage : **Anne Jorden**. Stade : 0. Départ : **Bureau des prospecteurs**.

La sortie des Jorden rejoint le lieu désigné par la Compagnie. La découverte de Russ est traitée hors champ.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Recevoir la grille de prospection | Bureau des prospecteurs | `coordinates` |
| Préparer le tracteur | Garage des prospecteurs | `tractor` |
| Poser une balise sur le plateau | Plateau des relevés | `beacon` |
| Examiner le seuil de l’épave | Seuil de l’épave | `threshold` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 05 — La porte blanche

Personnage : **Demian Brackett**. Stade : 1. Départ : **Aire d’atterrissage**.

Le retour des prospecteurs met l’infirmerie au centre de toutes les décisions.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Prendre en charge le retour des prospecteurs | Aire d’atterrissage | `stretcher` |
| Fermer l’isolement médical | Chambre d’isolement | `quarantine` |
| Transmettre le bilan à Komiskey | Infirmerie | `triage` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 06 — Priorité de recherche

Personnage : **Anne Jorden**. Stade : 1. Départ : **Infirmerie**.

Les priorités médicales et celles de la Compagnie divergent.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Consulter le registre des patients | Infirmerie | `patient_log` |
| Lire la directive scientifique | Laboratoire de la Compagnie | `orders` |
| Conserver une copie des échanges | Salle des archives | `copy` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 07 — Derrière les grilles

Personnage : **Rebecca « Newt » Jorden**. Stade : 1. Départ : **Logement des Jorden**.

Les jeux dans les conduits deviennent un apprentissage de la survie. Aucun combat pour Newt.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Retrouver les repères de Tim | Conduits de l’habitat | `marks` |
| Écouter derrière la grille | Conduits de l’infirmerie | `listen` |
| Préparer une petite cache | Cache des conduits | `cache` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 08 — Les absents

Personnage : **Demian Brackett**. Stade : 2. Départ : **Contrôle colonial**.

Les disparitions ont désormais une géographie. Les itinéraires sûrs commencent à se refermer.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Relever les dernières balises PDT | Contrôle colonial | `missing` |
| Suivre les traces dans la galerie | Galerie technique | `trail` |
| Détourner la pression du passage | Station de pompage | `reroute` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 09 — Les lumières rouges

Personnage : **Julisa Paris**. Stade : 2. Départ : **Infirmerie**.

Paris maintient une route pour les habitants. L’escorte représente une survie locale, pas une évacuation historique supplémentaire.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Prendre les soins d’urgence | Réserve médicale | `medstock` |
| Accompagner un colon jusqu’au magasin | Réfectoire | `civilian` |
| Mettre le refuge provisoire sous tension | Magasin de fret | `shelter` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 10 — Fermer, tenir

Personnage : **Anne Jorden**. Stade : 2. Départ : **Bureau des prospecteurs**.

Les prospecteurs transforment leurs outils en moyens de défense.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Récupérer un poste à souder | Magasin de fret | `welding` |
| Renforcer la fermeture du bureau | Bureau des prospecteurs | `barricade` |
| Rétablir le circuit de secours | Distribution électrique | `emergency` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 11 — Sous le processeur

Personnage : **Demian Brackett**. Stade : 3. Départ : **Accès au processeur un**.

Le passage dans la ruche est un échec de sauvetage, pas une chasse à la reine.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Commander le monte-charge | Monte-charge du processeur | `descent` |
| Retrouver la source des signaux | Soubassements envahis | `pdt` |
| Baliser la route de repli | Galerie du refroidissement | `fallback` |
| Fermer derrière le groupe | Distribution électrique | `withdraw` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 12 — La dernière porte

Personnage : **Anne Jorden**. Stade : 3. Départ : **Bureau des prospecteurs**.

La défense des Jorden ne change pas leur destin. Le point de vue quitte Anne au moment où Newt passe la grille.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Alimenter le verrou une dernière fois | Bureau des prospecteurs | `last_power` |
| Dégager l’accès au conduit | Bureau des prospecteurs | `vent_open` |
| Mettre Newt à l’abri | Bureau des prospecteurs | `newt_escape` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 13 — Une issue réservée

Personnage : **Julisa Paris**. Stade : 3. Départ : **Laboratoire de la Compagnie**.

Brackett transmet l’indication d’Hidalgo : la Compagnie dispose d’une issue. Luisa suit Paris jusqu’au hangar.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Recevoir la transmission de Brackett | Laboratoire de la Compagnie | `hidalgo` |
| Dégager Luisa et la conduire au hangar | Bureau des prospecteurs | `luisa` |
| Déverrouiller la navette scientifique | Hangar scientifique | `clearance` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 14 — La trajectoire imposée

Personnage : **Demian Brackett**. Stade : 3. Départ : **Hangar scientifique**.

Brackett, Paris, Mori et Luisa quittent la colonie. Newt n’est pas à bord.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Vérifier l’embarquement | Hangar scientifique | `boarding` |
| Désengager la trajectoire automatique | Navette de la Compagnie | `autopilot` |
| Décoller | Navette de la Compagnie | `departure` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 15 — Il reste quelqu’un

Personnage : **Rebecca « Newt » Jorden**. Stade : 3. Départ : **Cache des conduits**.

Le point de vue revient dans les conduits. Il faut survivre avec presque rien.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Récupérer de l’eau | Buanderie | `water` |
| Trouver de quoi manger | Réfectoire | `ration` |
| Passer sans attirer la créature | Conduits des prospecteurs | `silence` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

### 16 — Jusqu’au prochain bruit

Personnage : **Rebecca « Newt » Jorden**. Stade : 3. Départ : **Cache des conduits**.

La cache devient le dernier lieu habité du parcours. La suite appartient à l’arrivée du Sulaco.

| Objectif | Pièce | Identifiant |
|---|---|---|
| Vérifier le chemin de retour | Conduits de l’habitat | `route` |
| Regagner la cache | Cache des conduits | `hide` |

Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.

## Registre de fidélité : présence ne signifie pas exhaustivité

### Lieus

| Entrée | État actuel | Preuve / limite |
|---|---|---|
| Aire d’atterrissage | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R1 |
| Sas des arrivants | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Coursive centrale | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Contrôle colonial | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Poste de la garnison | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Coursive résidentielle | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Logement des Jorden | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R1 |
| Réfectoire | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Centre de loisirs | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R1 |
| Infirmerie | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R1 |
| Chambre d’isolement | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Laboratoire de la Compagnie | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Salle des archives | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Garage des prospecteurs | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Bureau des prospecteurs | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Magasin de fret | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Distribution électrique | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Station de pompage | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Galerie technique | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Piste du plateau | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Plateau des relevés | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Seuil de l’épave | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R2 |
| Processeur six | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Accès au processeur un | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Monte-charge du processeur | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Soubassements envahis | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Galerie du refroidissement | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Conduits de l’habitat | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Conduits de l’infirmerie | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Conduits des prospecteurs | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Cache des conduits | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Hangar scientifique | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Navette de la Compagnie | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Buanderie | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Relais de communications | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Réserve médicale | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Office de la cuisine | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Atelier biomédical | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Terrasse des antennes | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Atelier de manutention | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Dérivation des eaux grises | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Renfoncement des câbles | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Serre vitrée | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R1 |
| Armurerie de la garnison | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : preuve primaire insuffisante |
| Galerie biomécanique | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R2 |
| Chambre du pilote | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R2 |
| Cale aux œufs | présent · plan original | Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral. Références : R2 |
| Baie et sas du récupérateur | manquant | Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte. Références : R1 |
| Navette retrouvée / couchette de Ripley | manquant | Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte. Références : R1 |
| Service médical de Gateway Station | manquant | Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte. Références : R1 |
| Cabine de descente de Brackett | manquant | Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte. Références : R1 |

### Personnages

| Entrée | État actuel | Preuve / limite |
|---|---|---|
| Demian Brackett | représenté · roman | interprétation ; visage non décrit par les sources consultées Références : preuve primaire insuffisante |
| Julisa Paris | représenté · roman | interprétation ; aucune ressemblance avec une comédienne audio revendiquée Références : preuve primaire insuffisante |
| Anne Jorden | représenté · roman | cheveux bouclés attestés ; teinte et tenue interprétées Références : R1 |
| Rebecca « Newt » Jorden | représenté · roman | silhouette inspirée du film/licence ; pas de casque de Hicks dans cette époque Références : R3 |
| Russ Jorden | représenté · roman | apparence fatiguée attestée ; détails du visage interprétés Références : R1 |
| Dr Theodora Komiskey | représenté · roman | silhouette petite et trapue, boucles brunes et yeux bleus attestés ; blouse interprétée Références : R1 |
| Luisa | représenté · roman | enfant distincte de Newt ; apparence provisoire non attestée Références : preuve primaire insuffisante |
| Colon du bloc C | représenté · original | personnage de gameplay Références : preuve primaire insuffisante |
| Dr Mori | représenté · roman | silhouette provisoire, visage non authentifié Références : preuve primaire insuffisante |
| Tim Jorden | représenté · roman | Enfant de la famille Jorden, attesté ; tenue et visage interprétés. Références : R1 |
| Al Simpson | représenté · roman | Administrateur attesté ; dialogue, tenue et poste local interprétés. Références : R1 |
| Greg Hansard | représenté · roman | Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés. Références : R1 |
| Joel | représenté · roman | Infirmier mince attesté ; visage, tenue et état en 2179 interprétés. Références : R1 |
| Bronagh Flaherty | représenté · roman | Cuisinière attestée ; visage, tenue et état en 2179 interprétés. Références : R1 |
| Frères Finch | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |
| Samantha Monet | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |
| Ellen Ripley | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |
| Carter Burke | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |
| Jonesy | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |
| Tressa, pilote de descente | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |
| Jernigan, Landers, Fleet et Moore | manquant ou non individualisé | Identité rencontrée dans l’extrait ; présence physique spécifique non livrée. Références : R1 |

### Équipements

| Entrée | État actuel | Preuve / limite |
|---|---|---|
| M41A | présent · tir et rechargement | silhouette retravaillée ; 30 coups = valeur de jeu Références : preuve primaire insuffisante |
| M240 | présent · tir directionnel facultatif | dotation originale depuis le râtelier ; présence exacte dans le roman non vérifiée Références : R4 |
| Lance-grenades | présent · projectile et explosion | munitions finies ; sans dégâts à travers un obstacle Références : preuve primaire insuffisante |
| Détecteur | présent · contacts locaux et échos | comportement simplifié Références : preuve primaire insuffisante |
| Lampe | présent · batterie et faisceau | règles de jeu Références : preuve primaire insuffisante |
| Poste à souder | présent · soudures physiques | autorisation requise Références : preuve primaire insuffisante |
| Trousse de soins | présent · soins et partage | règle de soin simplifiée Références : preuve primaire insuffisante |
| Fusée | présent · éclairage et repli | durée simulée Références : preuve primaire insuffisante |
| Balise sonore | présent · fabrication et diversion | création de gameplay Références : preuve primaire insuffisante |
| Balise de repli | présent · repères persistants | création de gameplay Références : preuve primaire insuffisante |
| Piles, fils, boîtiers | présent · récupération et recettes | création de gameplay Références : preuve primaire insuffisante |
| Tracteur | présent · conduite et entretien | existence évoquée R1 ; mécanique originale Références : R1 |
| Unité obstétricale | présent · visible et examinable | pas de chirurgie jouable ; emplacement interprété Références : R1 |
| Robot de découpe de récupération | manquant | Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines. Références : R1 |
| Scanner de récupération | manquant | Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines. Références : R1 |
| Scaphandre de récupération | manquant | Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines. Références : R1 |
| Grappin de la navette | manquant | Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines. Références : R1 |
| Smartgun | à vérifier | Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise. Références : preuve primaire insuffisante |
| Tourelle automatique | à vérifier | Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise. Références : preuve primaire insuffisante |
| Power Loader P-5000 | à vérifier | Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise. Références : preuve primaire insuffisante |
| Pistolet de service | à vérifier | Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise. Références : preuve primaire insuffisante |

## Apparences : paramètres livrés

### Demian Brackett · `brackett`

interprétation ; visage non décrit par les sources consultées

Identité : roman. Taille de dessin : 87 unités ; coefficient de carrure : 1.1. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `marine`. Couleurs du rendu : #7e8969, #5a6251.

### Julisa Paris · `paris`

interprétation ; aucune ressemblance avec une comédienne audio revendiquée

Identité : roman. Taille de dessin : 82 unités ; coefficient de carrure : 0.91. Ce ne sont pas des mensurations réelles.
Coiffure : `tied`. Tenue : `marine`. Couleurs du rendu : #83927b, #515c52.

### Anne Jorden · `anne`

cheveux bouclés attestés ; teinte et tenue interprétées

Identité : roman. Taille de dessin : 79 unités ; coefficient de carrure : 1.0. Ce ne sont pas des mensurations réelles.
Coiffure : `curls`. Tenue : `workwear`. Couleurs du rendu : #978366, #555c54.

### Rebecca « Newt » Jorden · `newt`

silhouette inspirée du film/licence ; pas de casque de Hicks dans cette époque

Identité : roman. Taille de dessin : 51 unités ; coefficient de carrure : 0.78. Ce ne sont pas des mensurations réelles.
Coiffure : `long`. Tenue : `overalls`. Couleurs du rendu : #a79b80, #4b6171.

### Russ Jorden · `russ`

apparence fatiguée attestée ; détails du visage interprétés

Identité : roman. Taille de dessin : 86 unités ; coefficient de carrure : 1.08. Ce ne sont pas des mensurations réelles.
Coiffure : `scruffy`. Tenue : `workwear`. Couleurs du rendu : #857b62, #515b55.

### Dr Theodora Komiskey · `komiskey`

silhouette petite et trapue, boucles brunes et yeux bleus attestés ; blouse interprétée

Identité : roman. Taille de dessin : 71 unités ; coefficient de carrure : 1.42. Ce ne sont pas des mensurations réelles.
Coiffure : `curls`. Tenue : `medical`. Couleurs du rendu : #c1c8bc, #717e79.

### Luisa · `luisa`

enfant distincte de Newt ; apparence provisoire non attestée

Identité : roman. Taille de dessin : 53 unités ; coefficient de carrure : 0.78. Ce ne sont pas des mensurations réelles.
Coiffure : `tied`. Tenue : `child-jacket`. Couleurs du rendu : #aa7870, #5a625e.

### Colon du bloc C · `civilian`

personnage de gameplay

Identité : original. Taille de dessin : 80 unités ; coefficient de carrure : 1. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `workwear`. Couleurs du rendu : #869296, #555f60.

### Dr Mori · `mori`

silhouette provisoire, visage non authentifié

Identité : roman. Taille de dessin : 81 unités ; coefficient de carrure : 0.9. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `medical`. Couleurs du rendu : #c1c8bd, #65736f.

### Tim Jorden · `tim`

Enfant de la famille Jorden, attesté ; tenue et visage interprétés.

Identité : roman. Taille de dessin : 61 unités ; coefficient de carrure : 0.85. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `child-jacket`. Couleurs du rendu : #6b805f, #58665e.

### Al Simpson · `simpson`

Administrateur attesté ; dialogue, tenue et poste local interprétés.

Identité : roman. Taille de dessin : 84 unités ; coefficient de carrure : 1.16. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `workwear`. Couleurs du rendu : #aaa18c, #58665e.

### Greg Hansard · `hansard`

Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés.

Identité : roman. Taille de dessin : 86 unités ; coefficient de carrure : 1.05. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `workwear`. Couleurs du rendu : #8b9278, #58665e.

### Joel · `joel`

Infirmier mince attesté ; visage, tenue et état en 2179 interprétés.

Identité : roman. Taille de dessin : 86 unités ; coefficient de carrure : 0.82. Ce ne sont pas des mensurations réelles.
Coiffure : `short`. Tenue : `medical`. Couleurs du rendu : #b8c5ba, #58665e.

### Bronagh Flaherty · `bronagh`

Cuisinière attestée ; visage, tenue et état en 2179 interprétés.

Identité : roman. Taille de dessin : 79 unités ; coefficient de carrure : 1.1. Ce ne sont pas des mensurations réelles.
Coiffure : `tied`. Tenue : `workwear`. Couleurs du rendu : #b6a386, #58665e.

## Fiches des 47 lieux

### 01 — Aire d’atterrissage · `pad`

**Secteur :** Périmètre. **Niveau :** 0. **Présentation :** exterior.
**Repère :** Tour de contrôle et feux d’approche.
**Dimensions de blocage :** [69.0, 9, 3.4] m proposés ; largeur de simulation 2900 ; profondeur 0.25 à 0.9.
**Plan schématique :** [0, 2]. **Circuit :** perimeter. **Profil :** exterior.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Sas des arrivants | sas / side-bulkhead | 170 / 0.69 | 170 / 0.7 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `pad-cover1` | crate | 1102 / 0.56 | 160 / 0.13 |
| `pad-cover2` | rock | 1943 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Retrouver Paris · `welcome` | `talk` | 667 / 0.81 | paris |
| Prendre en charge le retour des prospecteurs · `stretcher` | `talk` | 1102 / 0.81 | komiskey |
| Bordereau d’arrivée · `a01` | `archive` | 2378.0 / 0.43 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `pad-set-0` | `beacon` | 442 / 0.22 | Non | orientation du trajet |
| `pad-set-1` | `antenna` | 845 / 0.22 | Non | fonction propre au lieu |
| `pad-set-2` | `fuel` | 1248 / 0.22 | Non | fonction propre au lieu |
| `pad-set-3` | `beacon` | 1652 / 0.22 | Non | orientation du trajet |
| `pad-set-4` | `cable` | 2055 / 0.22 | Non | fonction propre au lieu |
| `pad-set-5` | `tractor` | 2458 / 0.22 | Non | fonction propre au lieu |
| `pad-cover1` | `crate` | 1102 / 0.56 | Oui | obstacle contournable et cachette basse |
| `pad-cover2` | `rock` | 1943 / 0.57 | Oui | obstacle contournable et cachette basse |
| `pad-detail-0` | `survey-stake` | 348 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-1` | `floodlight` | 899 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-2` | `cable-spool` | 1450 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-3` | `barrier` | 2001 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-4` | `rock-fragment` | 2552 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 02 — Sas des arrivants · `airlock`

**Secteur :** Accueil. **Niveau :** 0. **Présentation :** side.
**Repère :** Double porte pressurisée, douche de décontamination.
**Dimensions de blocage :** [42.9, 2.8, 3.4] m proposés ; largeur de simulation 1800 ; profondeur 0.7 à 0.7.
**Plan schématique :** [1, 2]. **Circuit :** habitat. **Profil :** decontamination.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Aire d’atterrissage | sas / side-bulkhead | 170 / 0.7 | 170 / 0.69 | 0 → 0 | Accès libre |
| Coursive centrale | porte / side-bulkhead | 1630 / 0.7 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Se cacher dans le placard de service · `hide-airlock` | `hide` | 520 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `airlock-set-0` | `shower` | 372 / 0.22 | Non | fonction propre au lieu |
| `airlock-set-1` | `locker` | 636 / 0.22 | Non | fonction propre au lieu |
| `airlock-set-2` | `fan` | 900 / 0.22 | Non | fonction propre au lieu |
| `airlock-set-3` | `panel` | 1164 / 0.22 | Non | fonction propre au lieu |
| `airlock-set-4` | `lamp` | 1428 / 0.22 | Non | fonction propre au lieu |
| `airlock-detail-0` | `oxygen` | 433 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-1` | `hose-reel` | 558 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-2` | `warning-board` | 900 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-3` | `vent-cover` | 1242 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-4` | `ceiling-light` | 438 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 414, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 882, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1332, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1584, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 03 — Coursive centrale · `concourse`

**Secteur :** Accueil. **Niveau :** 0. **Présentation :** depth.
**Repère :** Signalétique des blocs, galerie vitrée.
**Dimensions de blocage :** [71.4, 9, 3.4] m proposés ; largeur de simulation 3000 ; profondeur 0.25 à 0.9.
**Plan schématique :** [2, 2]. **Circuit :** habitat. **Profil :** concourse.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Sas des arrivants | porte / side-bulkhead | 170 / 0.69 | 1630 / 0.7 | 0 → 0 | Accès libre |
| Contrôle colonial | escalier / side-bulkhead | 2830 / 0.69 | 170 / 0.69 | 0 → 1 | Accès libre |
| Coursive résidentielle | escalier / rear-bay | 840 / 0.28 | 170 / 0.7 | 0 → 1 | Accès libre |
| Infirmerie | porte / rear-bay | 1440 / 0.28 | 170 / 0.69 | 0 → 0 | Accès libre |
| Garage des prospecteurs | porte / rear-bay | 2040 / 0.28 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `concourse-cover1` | bench | 1030 / 0.47 | 190 / 0.12 |
| `concourse-cover2` | vending | 1810 / 0.53 | 220 / 0.14 |
| `concourse-cover3` | bench | 2500 / 0.44 | 150 / 0.1 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `concourse-set-0` | `bench` | 420 / 0.22 | Non | fonction propre au lieu |
| `concourse-set-1` | `window` | 600 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `concourse-set-2` | `sign` | 1140 / 0.22 | Non | fonction propre au lieu |
| `concourse-set-3` | `vending` | 1680 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `concourse-set-4` | `window` | 1860 / 0.22 | Non | fonction propre au lieu |
| `concourse-set-5` | `fan` | 2220 / 0.22 | Non | fonction propre au lieu |
| `concourse-set-6` | `bench` | 2580 / 0.22 | Non | fonction propre au lieu |
| `concourse-detail-0` | `noticeboard` | 360 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-1` | `ceiling-light` | 1147 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-2` | `fire-cabinet` | 1717 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-3` | `wall-clock` | 2250 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `concourse-detail-4` | `pipe-elbow` | 2640 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-cover1` | `bench` | 1030 / 0.47 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `concourse-cover2` | `vending` | 1810 / 0.53 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `concourse-cover3` | `bench` | 2500 / 0.44 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 690, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1470, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2220, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2640, z 0.77 ; décor conditionnel.
- Résident : `kent` — Rosa Kent.
- Réserve : `supply-arrivals` — Casier de relève.
- Volet : `shutter-concourse` — Volet de la galerie.
- Avertisseur : `alarm-concourse` — Avertisseur de la galerie.
- Gaine : `duct-concourse` — Reprise de manutention · A.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 04 — Contrôle colonial · `ops`

**Secteur :** Administration. **Niveau :** 1. **Présentation :** depth.
**Repère :** Baie de supervision et consoles de communications.
**Dimensions de blocage :** [57.1, 9, 3.4] m proposés ; largeur de simulation 2400 ; profondeur 0.25 à 0.9.
**Plan schématique :** [2, 1]. **Circuit :** research. **Profil :** command.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Coursive centrale | escalier / side-bulkhead | 170 / 0.69 | 2830 / 0.69 | 1 → 0 | Accès libre |
| Poste de la garnison | porte / side-bulkhead | 2230 / 0.69 | 170 / 0.7 | 1 → 1 | Accès libre |
| Relais de communications | coursive / rear-bay | 672 / 0.28 | 1780 / 0.7 | 1 → 1 | Accès libre |
| Terrasse des antennes | escalier / rear-bay | 1320 / 0.28 | 2530 / 0.81 | 1 → 2 | service-aerial |
| Armurerie de la garnison | porte / rear-bay | 1770 / 0.28 | 2030 / 0.69 | 1 → 1 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `ops-cover1` | console | 960 / 0.49 | 210 / 0.16 |
| `ops-cover2` | console | 1660 / 0.55 | 170 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Consulter le tableau de service · `brief` | `terminal` | 552 / 0.81 | chapitre 1 |
| Relever les dernières balises PDT · `missing` | `terminal` | 912 / 0.81 | chapitre 8 |
| Grille de prospection · `a02` | `archive` | 1967.9999999999998 / 0.43 | interaction locale |
| Parler à Al Simpson · `contact-simpson` | `lore-contact` | 1040 / 0.8 | simpson |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `ops-set-0` | `console` | 400 / 0.22 | Non | poste de travail |
| `ops-set-1` | `screen` | 900 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `ops-set-2` | `console` | 1040 / 0.22 | Non | poste de travail |
| `ops-set-3` | `antenna` | 1540 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `ops-set-4` | `screen` | 1500 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `ops-set-5` | `map` | 2000 / 0.22 | Non | fonction propre au lieu |
| `ops-detail-0` | `chair` | 1156 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `ops-detail-1` | `noticeboard` | 924 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `ops-detail-2` | `radio-mast` | 1020 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `ops-detail-3` | `wall-clock` | 1476 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `ops-detail-4` | `ceiling-light` | 366 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `ops-cover1` | `console` | 960 / 0.49 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `ops-cover2` | `console` | 1660 / 0.55 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 552, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1176, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1776, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2112, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 05 — Poste de la garnison · `briefing`

**Secteur :** Administration. **Niveau :** 1. **Présentation :** side.
**Repère :** Casiers individuels et table de service.
**Dimensions de blocage :** [52.4, 2.8, 3.4] m proposés ; largeur de simulation 2200 ; profondeur 0.7 à 0.7.
**Plan schématique :** [3, 1]. **Circuit :** habitat. **Profil :** barracks.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Contrôle colonial | porte / side-bulkhead | 170 / 0.7 | 2230 / 0.69 | 1 → 1 | Accès libre |
| Armurerie de la garnison | porte / rear-bay | 1230 / 0.7 | 170 / 0.69 | 1 → 1 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Prendre la dotation · `locker` | `supply` | 506 / 0.7 | chapitre 1 |
| Ordre du jour · `a03` | `archive` | 1804.0 / 0.7 | interaction locale |
| Réserve de terrain · `cache-briefing` | `pickup` | 1166.0 / 0.7 | interaction locale |
| Se cacher dans le placard de service · `hide-briefing` | `hide` | 725 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `briefing-set-0` | `locker` | 383 / 0.22 | Non | fonction propre au lieu |
| `briefing-set-1` | `rifle-rack` | 670 / 0.22 | Non | fonction propre au lieu |
| `briefing-set-2` | `table` | 957 / 0.22 | Non | fonction propre au lieu |
| `briefing-set-3` | `locker` | 1243 / 0.22 | Non | fonction propre au lieu |
| `briefing-set-4` | `radio` | 1530 / 0.22 | Non | fonction propre au lieu |
| `briefing-set-5` | `locker` | 1817 / 0.22 | Non | fonction propre au lieu |
| `briefing-detail-0` | `hanging-coat` | 698 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-1` | `rifle-case` | 682 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-2` | `noticeboard` | 920 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `briefing-detail-3` | `wall-clock` | 1518 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-4` | `ceiling-light` | 1936 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 506, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1078, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1628, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1936, z 0.77 ; décor conditionnel.
- Réserve : `supply-garrison` — Mallette de terrain.
- Établi : `bench-garrison` — Banc de préparation.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 06 — Coursive résidentielle · `hab`

**Secteur :** Habitat. **Niveau :** 1. **Présentation :** side.
**Repère :** Portes numérotées et fenêtres des logements.
**Dimensions de blocage :** [64.3, 2.8, 3.4] m proposés ; largeur de simulation 2700 ; profondeur 0.7 à 0.7.
**Plan schématique :** [3, 2]. **Circuit :** habitat. **Profil :** residential.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Coursive centrale | escalier / side-bulkhead | 170 / 0.7 | 840 / 0.28 | 1 → 0 | Accès libre |
| Logement des Jorden | porte / side-bulkhead | 2530 / 0.7 | 170 / 0.69 | 1 → 1 | Accès libre |
| Centre de loisirs | escalier / rear-bay | 756 / 0.7 | 170 / 0.69 | 1 → 0 | Accès libre |
| Buanderie | escalier / rear-bay | 1296 / 0.7 | 518 / 0.28 | 1 → 0 | Accès libre |
| Office de la cuisine | escalier / rear-bay | 1720 / 0.7 | 1930 / 0.81 | 1 → 0 | service-pantry |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Se cacher dans le placard de service · `hide-hab` | `hide` | 2349 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `hab-set-0` | `hab-door` | 425 / 0.22 | Non | fonction propre au lieu |
| `hab-set-1` | `window` | 795 / 0.22 | Non | fonction propre au lieu |
| `hab-set-2` | `hab-door` | 1165 / 0.22 | Non | fonction propre au lieu |
| `hab-set-3` | `plant` | 1535 / 0.22 | Non | fonction propre au lieu |
| `hab-set-4` | `hab-door` | 1905 / 0.22 | Non | fonction propre au lieu |
| `hab-set-5` | `drawing` | 2275 / 0.22 | Non | trace de vie familiale |
| `hab-detail-0` | `door-plaque` | 324 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-1` | `fire-cabinet` | 1054 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-2` | `pipe-elbow` | 1567 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-3` | `ceiling-light` | 1863 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-4` | `noticeboard` | 2376 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 621, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1323, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1998, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2376, z 0.77 ; décor conditionnel.
- Résident : `vale` — Iona Vale.
- Volet : `shutter-hab` — Volet du bloc habitat.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 07 — Logement des Jorden · `jorden`

**Secteur :** Habitat. **Niveau :** 1. **Présentation :** depth.
**Repère :** Table familiale, lits et dessins d’enfant.
**Dimensions de blocage :** [44.0, 9, 3.4] m proposés ; largeur de simulation 1850 ; profondeur 0.25 à 0.9.
**Plan schématique :** [4, 2]. **Circuit :** habitat. **Profil :** domestic.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Coursive résidentielle | porte / side-bulkhead | 170 / 0.69 | 2530 / 0.7 | 1 → 1 | Accès libre |
| Conduits de l’habitat | conduit / side-bulkhead | 1680 / 0.69 | 170 / 0.7 | 1 → 1 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `jorden-cover1` | table | 760 / 0.46 | 205 / 0.14 |
| `jorden-cover2` | cupboard | 1190 / 0.53 | 130 / 0.16 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Préparer la tournée · `family` | `talk` | 426 / 0.81 | russ |
| Une table pour quatre · `a04` | `archive` | 1517.0 / 0.43 | interaction locale |
| Se cacher dans le placard de service · `hide-jorden` | `hide` | 771 / 0.82 | interaction locale |
| Parler à Tim Jorden · `contact-tim` | `lore-contact` | 1250 / 0.8 | tim |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `jorden-set-0` | `bed` | 354 / 0.22 | Non | fonction propre au lieu |
| `jorden-set-1` | `table` | 582 / 0.22 | Non | fonction propre au lieu |
| `jorden-set-2` | `drawing` | 811 / 0.22 | Non | trace de vie familiale |
| `jorden-set-3` | `cupboard` | 1039 / 0.22 | Non | fonction propre au lieu |
| `jorden-set-4` | `bed` | 1268 / 0.22 | Non | fonction propre au lieu |
| `jorden-set-5` | `toy` | 1496 / 0.22 | Non | fonction propre au lieu |
| `jorden-detail-0` | `photo` | 222 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-1` | `mug` | 574 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-2` | `hanging-coat` | 925 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-3` | `bed-lamp` | 1276 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-4` | `vent-cover` | 1628 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-cover1` | `table` | 760 / 0.46 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `jorden-cover2` | `cupboard` | 1190 / 0.53 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 426, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 906, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1369, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1628, z 0.77 ; décor conditionnel.
- Réserve : `supply-habitat` — Tiroir du logement.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 08 — Réfectoire · `mess`

**Secteur :** Habitat. **Niveau :** 0. **Présentation :** depth.
**Repère :** Tables, cuisine et distributeurs.
**Dimensions de blocage :** [61.9, 9, 3.4] m proposés ; largeur de simulation 2600 ; profondeur 0.25 à 0.9.
**Plan schématique :** [4, 3]. **Circuit :** habitat. **Profil :** canteen.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Centre de loisirs | porte / side-bulkhead | 170 / 0.69 | 2080 / 0.69 | 0 → 0 | Accès libre |
| Buanderie | porte / side-bulkhead | 2430 / 0.69 | 1680 / 0.69 | 0 → 0 | Accès libre |
| Magasin de fret | porte / rear-bay | 728 / 0.28 | 868 / 0.28 | 0 → 0 | Accès libre |
| Office de la cuisine | porte / rear-bay | 1850 / 0.28 | 170 / 0.81 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `mess-cover1` | table | 910 / 0.48 | 185 / 0.13 |
| `mess-cover2` | table | 1580 / 0.49 | 250 / 0.14 |
| `mess-cover3` | table | 2060 / 0.53 | 130 / 0.1 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Récupérer les provisions · `provisions` | `supply` | 598 / 0.81 | chapitre 2 |
| Accompagner un colon jusqu’au magasin · `civilian` | `escort` | 988 / 0.81 | civilian |
| Trouver de quoi manger · `ration` | `supply` | 1378 / 0.81 | chapitre 15 |
| Se cacher dans le placard de service · `hide-mess` | `hide` | 2262 / 0.82 | interaction locale |
| Récupérer la poignée de rechange · `job-pantry-part` | `side-task` | 390 / 0.28 | interaction locale |
| Parler à Bronagh Flaherty · `contact-bronagh` | `lore-contact` | 1670 / 0.8 | bronagh |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `mess-set-0` | `vending` | 417 / 0.22 | Non | fonction propre au lieu |
| `mess-set-1` | `stove` | 950 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `mess-set-2` | `table` | 1123 / 0.22 | Non | fonction propre au lieu |
| `mess-set-3` | `table` | 1477 / 0.22 | Non | fonction propre au lieu |
| `mess-set-4` | `table` | 2010 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `mess-set-5` | `sink` | 2183 / 0.22 | Non | fonction propre au lieu |
| `mess-detail-0` | `chair` | 1180 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-1` | `mug` | 1240 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-2` | `kitchen-hood` | 1517 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-3` | `tray` | 1614 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `mess-detail-4` | `fire-cabinet` | 342 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `mess-cover1` | `table` | 910 / 0.48 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `mess-cover2` | `table` | 1580 / 0.49 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `mess-cover3` | `table` | 2060 / 0.53 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 598, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1274, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1924, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2288, z 0.77 ; décor conditionnel.
- Résident : `rhee` — Malik Rhee.
- Réserve : `supply-kitchen` — Réserve de portions froides.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 09 — Centre de loisirs · `recreation`

**Secteur :** Habitat. **Niveau :** 0. **Présentation :** depth.
**Repère :** Jeux, bancs et accès à la maintenance.
**Dimensions de blocage :** [53.6, 9, 3.4] m proposés ; largeur de simulation 2250 ; profondeur 0.25 à 0.9.
**Plan schématique :** [3, 3]. **Circuit :** habitat. **Profil :** leisure.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Coursive résidentielle | escalier / side-bulkhead | 170 / 0.69 | 756 / 0.7 | 0 → 1 | Accès libre |
| Réfectoire | porte / side-bulkhead | 2080 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |
| Conduits de l’habitat | grille / rear-bay | 630 / 0.28 | 1248 / 0.7 | 0 → 1 | Newt seule |
| Serre vitrée | coursive / rear-bay | 1590 / 0.81 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `recreation-cover1` | arcade | 810 / 0.48 | 125 / 0.17 |
| `recreation-cover2` | bench | 1430 / 0.51 | 240 / 0.12 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Les chemins de Tim · `a05` | `archive` | 1845.0 / 0.43 | interaction locale |
| Se cacher dans le placard de service · `hide-recreation` | `hide` | 462 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `recreation-set-0` | `arcade` | 417 / 0.22 | Non | fonction propre au lieu |
| `recreation-set-1` | `bench` | 771 / 0.22 | Non | fonction propre au lieu |
| `recreation-set-2` | `arcade` | 1125 / 0.22 | Non | fonction propre au lieu |
| `recreation-set-3` | `table` | 1479 / 0.22 | Non | fonction propre au lieu |
| `recreation-set-4` | `drawing` | 1833 / 0.22 | Non | trace de vie familiale |
| `recreation-detail-0` | `chair` | 921 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-1` | `noticeboard` | 878 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `recreation-detail-2` | `mug` | 1125 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-3` | `wall-clock` | 1553 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-4` | `fire-cabinet` | 384 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-cover1` | `arcade` | 810 / 0.48 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `recreation-cover2` | `bench` | 1430 / 0.51 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 518, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1102, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1665, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1980, z 0.77 ; décor conditionnel.
- Résident : `bell` — Tomas Bell.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 10 — Infirmerie · `med`

**Secteur :** Médical. **Niveau :** 0. **Présentation :** depth.
**Repère :** Lits isolés, vitres d’observation et moniteurs.
**Dimensions de blocage :** [66.7, 9, 3.4] m proposés ; largeur de simulation 2800 ; profondeur 0.25 à 0.9.
**Plan schématique :** [2, 3]. **Circuit :** medical. **Profil :** medical.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Coursive centrale | porte / side-bulkhead | 170 / 0.69 | 1440 / 0.28 | 0 → 0 | Accès libre |
| Chambre d’isolement | porte / side-bulkhead | 2630 / 0.69 | 170 / 0.7 | 0 → 0 | Accès libre |
| Réserve médicale | porte / rear-bay | 784 / 0.28 | 170 / 0.7 | 0 → 0 | Accès libre |
| Laboratoire de la Compagnie | sas / rear-bay | 1344 / 0.28 | 170 / 0.69 | 0 → 0 | Accès libre |
| Atelier biomédical | porte / rear-bay | 2000 / 0.28 | 170 / 0.81 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `med-cover1` | bed | 1050 / 0.48 | 210 / 0.14 |
| `med-cover2` | cart | 1830 / 0.51 | 165 / 0.16 |
| `med-cover3` | cart | 1630 / 0.865 | 140 / 0.04 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Transmettre le bilan à Komiskey · `triage` | `terminal` | 644 / 0.81 | chapitre 5 |
| Consulter le registre des patients · `patient_log` | `terminal` | 1064 / 0.81 | chapitre 6 |
| Priorité médicale · `a06` | `archive` | 2296.0 / 0.43 | interaction locale |
| Réserve de terrain · `cache-med` | `pickup` | 1484.0 / 0.86 | interaction locale |
| Se cacher dans le placard de service · `hide-med` | `hide` | 2436 / 0.82 | interaction locale |
| Examiner l’unité médicale · `medical-unit-v09` | `inspection` | 2280 / 0.32 | interaction locale |
| Parler à Joel · `contact-joel` | `lore-contact` | 1590 / 0.8 | joel |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `med-set-0` | `bed` | 433 / 0.22 | Non | fonction propre au lieu |
| `med-set-1` | `monitor` | 1000 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `med-set-2` | `bed` | 1207 / 0.22 | Non | fonction propre au lieu |
| `med-set-3` | `sink` | 1593 / 0.22 | Non | fonction propre au lieu |
| `med-set-4` | `medicine` | 2160 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `med-set-5` | `bed` | 2367 / 0.22 | Non | fonction propre au lieu |
| `med-detail-0` | `privacy-screen` | 336 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `med-detail-1` | `oxygen` | 1736 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `med-detail-2` | `medical-cross` | 1580 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `med-detail-3` | `wall-clock` | 1752 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `med-detail-4` | `gurney` | 2464 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `med-cover1` | `bed` | 1050 / 0.48 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `med-cover2` | `cart` | 1830 / 0.51 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `med-cover3` | `cart` | 1630 / 0.865 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `med-v09-14` | `natal-unit` | 2220 / 0.32 | Non | Implantation de jeu documentée |
| `med-v09-15` | `white-monitor` | 2250 / 0.3 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `med-v09-16` | `named-doctor` | 1810 / 0.38 | Non | Implantation de jeu documentée |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 644, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1372, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2072, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2464, z 0.77 ; décor conditionnel.
- Résident : `arden` — Vera Arden.
- Réserve : `supply-medical` — Coffret de soins.
- Volet : `shutter-med` — Séparation médicale.
- Avertisseur : `alarm-med` — Avertisseur médical.
- Gaine : `duct-med` — Retour de filtration · A.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 11 — Chambre d’isolement · `isolation`

**Secteur :** Médical. **Niveau :** 0. **Présentation :** side.
**Repère :** Lit d’observation et hublot de quarantaine.
**Dimensions de blocage :** [40.5, 2.8, 3.4] m proposés ; largeur de simulation 1700 ; profondeur 0.7 à 0.7.
**Plan schématique :** [1, 3]. **Circuit :** medical. **Profil :** medical.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Infirmerie | porte / side-bulkhead | 170 / 0.7 | 2630 / 0.69 | 0 → 0 | Accès libre |
| Conduits de l’infirmerie | grille / side-bulkhead | 1530 / 0.7 | 2230 / 0.7 | 0 → 1 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Fermer l’isolement médical · `quarantine` | `seal` | 391 / 0.7 | chapitre 5 |
| Le hublot · `a07` | `archive` | 1394.0 / 0.7 | interaction locale |
| Se cacher dans le placard de service · `hide-isolation` | `hide` | 533 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `isolation-set-0` | `bed` | 362 / 0.22 | Non | fonction propre au lieu |
| `isolation-set-1` | `monitor` | 606 / 0.22 | Non | fonction propre au lieu |
| `isolation-set-2` | `glass` | 850 / 0.22 | Non | fonction propre au lieu |
| `isolation-set-3` | `sink` | 1094 / 0.22 | Non | fonction propre au lieu |
| `isolation-set-4` | `specimen` | 1338 / 0.22 | Non | fonction propre au lieu |
| `isolation-detail-0` | `privacy-screen` | 638 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-1` | `oxygen` | 527 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-2` | `medical-cross` | 850 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-3` | `wall-clock` | 1173 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-4` | `gurney` | 667 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 391, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 833, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1258, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1496, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 12 — Laboratoire de la Compagnie · `science`

**Secteur :** Recherche. **Niveau :** 0. **Présentation :** depth.
**Repère :** Paillasses, cuves et racks de confinement.
**Dimensions de blocage :** [57.1, 9, 3.4] m proposés ; largeur de simulation 2400 ; profondeur 0.25 à 0.9.
**Plan schématique :** [1, 4]. **Circuit :** research. **Profil :** laboratory.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Infirmerie | sas / side-bulkhead | 170 / 0.69 | 1344 / 0.28 | 0 → 0 | Accès libre |
| Salle des archives | escalier / side-bulkhead | 2230 / 0.69 | 170 / 0.7 | 0 → 1 | Accès libre |
| Galerie technique | escalier / rear-bay | 672 / 0.28 | 2830 / 0.7 | 0 → -1 | Accès libre |
| Hangar scientifique | sas / rear-bay | 1152 / 0.28 | 170 / 0.69 | 0 → 0 | scienceClearance |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `science-cover1` | lab-bench | 840 / 0.51 | 210 / 0.15 |
| `science-cover2` | specimen | 1570 / 0.45 | 175 / 0.12 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Lire la directive scientifique · `orders` | `terminal` | 552 / 0.81 | chapitre 6 |
| Recevoir la transmission de Brackett · `hidalgo` | `terminal` | 912 / 0.81 | chapitre 13 |
| Mainmise · `a08` | `archive` | 1967.9999999999998 / 0.43 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `science-set-0` | `specimen` | 400 / 0.22 | Non | fonction propre au lieu |
| `science-set-1` | `console` | 900 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `science-set-2` | `specimen` | 860 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `science-set-3` | `sink` | 1360 / 0.22 | Non | fonction propre au lieu |
| `science-set-4` | `microscope` | 1680 / 0.22 | Non | fonction propre au lieu |
| `science-set-5` | `tank` | 2000 / 0.22 | Non | fonction propre au lieu |
| `science-detail-0` | `glass-cabinet` | 1373 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-1` | `lab-bench` | 1395 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-2` | `oxygen` | 1417 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-3` | `warning-board` | 1656 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-4` | `vent-cover` | 2112 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `science-cover1` | `lab-bench` | 840 / 0.51 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `science-cover2` | `specimen` | 1570 / 0.45 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 552, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1176, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1776, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2112, z 0.77 ; décor conditionnel.
- Gaine : `duct-science` — Retour de filtration · B.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 13 — Salle des archives · `records`

**Secteur :** Recherche. **Niveau :** 1. **Présentation :** side.
**Repère :** Bandes de données et baie réseau.
**Dimensions de blocage :** [42.9, 2.8, 3.4] m proposés ; largeur de simulation 1800 ; profondeur 0.7 à 0.7.
**Plan schématique :** [0, 4]. **Circuit :** research. **Profil :** archive.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Laboratoire de la Compagnie | escalier / side-bulkhead | 170 / 0.7 | 2230 / 0.69 | 1 → 0 | Accès libre |
| Relais de communications | coursive / side-bulkhead | 1630 / 0.7 | 170 / 0.7 | 1 → 1 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Conserver une copie des échanges · `copy` | `terminal` | 414 / 0.7 | chapitre 6 |
| Transmission conservée · `a09` | `archive` | 1476.0 / 0.7 | interaction locale |
| Se cacher dans le placard de service · `hide-records` | `hide` | 777 / 0.7 | interaction locale |
| Retrouver le coupleur de transmission · `job-aerial-part` | `side-task` | 1050 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `records-set-0` | `rack` | 372 / 0.22 | Non | fonction propre au lieu |
| `records-set-1` | `rack` | 636 / 0.22 | Non | fonction propre au lieu |
| `records-set-2` | `console` | 900 / 0.22 | Non | poste de travail |
| `records-set-3` | `rack` | 1164 / 0.22 | Non | fonction propre au lieu |
| `records-set-4` | `screen` | 1428 / 0.22 | Non | fonction propre au lieu |
| `records-detail-0` | `server` | 650 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-1` | `tape-reel` | 558 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-2` | `cable-tray` | 900 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-3` | `vent-cover` | 1242 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-4` | `wall-clock` | 1404 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 414, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 882, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1332, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1584, z 0.77 ; décor conditionnel.
- Résident : `becker` — Arun Becker.
- Réserve : `supply-archive` — Tiroir des transmissions.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 14 — Garage des prospecteurs · `garage`

**Secteur :** Logistique. **Niveau :** 0. **Présentation :** depth.
**Repère :** Tracteur de prospection sur sa voie de service.
**Dimensions de blocage :** [76.2, 9, 3.4] m proposés ; largeur de simulation 3200 ; profondeur 0.25 à 0.9.
**Plan schématique :** [3, 4]. **Circuit :** industry. **Profil :** hangar.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Coursive centrale | porte / side-bulkhead | 170 / 0.69 | 2040 / 0.28 | 0 → 0 | Accès libre |
| Bureau des prospecteurs | porte / side-bulkhead | 3030 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |
| Galerie technique | escalier / rear-bay | 896 / 0.28 | 840 / 0.7 | 0 → -1 | Accès libre |
| Piste du plateau | sas / rear-bay | 1536 / 0.28 | 170 / 0.69 | 0 → 0 | Accès libre |
| Atelier de manutention | porte / rear-bay | 2580 / 0.28 | 170 / 0.81 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `garage-cover1` | tools | 1230 / 0.47 | 230 / 0.17 |
| `garage-cover2` | wheel | 2070 / 0.52 | 240 / 0.13 |
| `garage-cover3` | crate | 2850 / 0.48 | 120 / 0.12 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Prendre le matériel de secours · `rescue_kit` | `supply` | 736 / 0.81 | chapitre 3 |
| Préparer le tracteur · `tractor` | `vehicle` | 1216 / 0.81 | chapitre 4 |
| Tracteur des prospecteurs · `a10` | `archive` | 2624.0 / 0.43 | interaction locale |
| Réserve de terrain · `cache-garage` | `pickup` | 1696.0 / 0.86 | interaction locale |
| Décrocher la chaîne d’entraînement · `job-workshop-part` | `side-task` | 450 / 0.28 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `garage-set-0` | `tools` | 512 / 0.22 | Non | Matériel de maintenance rangé |
| `garage-set-1` | `tools` | 1056 / 0.22 | Non | fonction propre au lieu |
| `garage-set-2` | `fuel` | 1780 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `garage-set-3` | `gantry` | 2144 / 0.22 | Non | fonction propre au lieu |
| `garage-set-4` | `wheel` | 2868 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `garage-detail-0` | `chain-hoist` | 384 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-1` | `warning-board` | 1172 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `garage-detail-2` | `hose-reel` | 1817 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-3` | `tool-board` | 2208 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-4` | `ceiling-light` | 2816 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `garage-cover1` | `tools` | 1230 / 0.47 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `garage-cover2` | `wheel` | 2070 / 0.52 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `garage-cover3` | `crate` | 2850 / 0.48 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 736, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1568, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2368, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2816, z 0.77 ; décor conditionnel.
- Résident : `hale` — Ezra Hale.
- Réserve : `supply-garage` — Caisse des prospecteurs.
- Volet : `shutter-garage` — Rideau de manutention.
- Avertisseur : `alarm-garage` — Avertisseur du garage.
- Gaine : `duct-garage` — Reprise de manutention · B.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 15 — Bureau des prospecteurs · `survey`

**Secteur :** Logistique. **Niveau :** 0. **Présentation :** depth.
**Repère :** Cartes topographiques et postes radio.
**Dimensions de blocage :** [59.5, 9, 3.4] m proposés ; largeur de simulation 2500 ; profondeur 0.25 à 0.9.
**Plan schématique :** [4, 4]. **Circuit :** habitat. **Profil :** command.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Garage des prospecteurs | porte / side-bulkhead | 170 / 0.69 | 3030 / 0.69 | 0 → 0 | Accès libre |
| Magasin de fret | porte / side-bulkhead | 2330 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |
| Conduits des prospecteurs | grille / rear-bay | 700 / 0.28 | 2180 / 0.7 | 0 → 0 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `survey-cover1` | table | 950 / 0.56 | 160 / 0.13 |
| `survey-cover2` | crate | 1675 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Recevoir la grille de prospection · `coordinates` | `terminal` | 575 / 0.81 | chapitre 4 |
| Renforcer la fermeture du bureau · `barricade` | `seal` | 950 / 0.81 | chapitre 10 |
| Alimenter le verrou une dernière fois · `last_power` | `power` | 1325 / 0.81 | chapitre 12 |
| Dégager l’accès au conduit · `vent_open` | `seal` | 1700 / 0.81 | chapitre 12 |
| Mettre Newt à l’abri · `newt_escape` | `talk` | 575 / 0.81 | newt |
| Dégager Luisa et la conduire au hangar · `luisa` | `escort` | 950 / 0.81 | luisa |
| Un bureau transformé · `a11` | `archive` | 2050.0 / 0.43 | interaction locale |
| Se cacher dans le placard de service · `hide-survey` | `hide` | 429 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `survey-set-0` | `map` | 442 / 0.22 | Non | fonction propre au lieu |
| `survey-set-1` | `console` | 846 / 0.22 | Non | poste de travail |
| `survey-set-2` | `radio` | 1250 / 0.22 | Non | fonction propre au lieu |
| `survey-set-3` | `tools` | 1654 / 0.22 | Non | fonction propre au lieu |
| `survey-set-4` | `shelf` | 2058 / 0.22 | Non | fonction propre au lieu |
| `survey-cover1` | `table` | 950 / 0.56 | Oui | obstacle contournable et cachette basse |
| `survey-cover2` | `crate` | 1675 / 0.57 | Oui | obstacle contournable et cachette basse |
| `survey-detail-0` | `chair` | 1168 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-1` | `noticeboard` | 955 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `survey-detail-2` | `radio-mast` | 1467 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-3` | `wall-clock` | 1725 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-4` | `ceiling-light` | 354 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 575, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1225, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1850, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2200, z 0.77 ; décor conditionnel.
- Résident : `voss` — Anton Voss.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 16 — Magasin de fret · `stores`

**Secteur :** Logistique. **Niveau :** 0. **Présentation :** depth.
**Repère :** Palettes, rack de levage et allées dégagées.
**Dimensions de blocage :** [73.8, 9, 3.4] m proposés ; largeur de simulation 3100 ; profondeur 0.25 à 0.9.
**Plan schématique :** [4, 5]. **Circuit :** industry. **Profil :** warehouse.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Bureau des prospecteurs | porte / side-bulkhead | 170 / 0.69 | 2330 / 0.69 | 0 → 0 | Accès libre |
| Distribution électrique | escalier / side-bulkhead | 2930 / 0.69 | 170 / 0.69 | 0 → -1 | Accès libre |
| Réfectoire | porte / rear-bay | 868 / 0.28 | 728 / 0.28 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `stores-cover1` | pallet | 1160 / 0.48 | 280 / 0.14 |
| `stores-cover2` | crate | 2110 / 0.52 | 180 / 0.13 |
| `stores-cover3` | pallet | 2430 / 0.86 | 120 / 0.04 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Mettre le refuge provisoire sous tension · `shelter` | `power` | 713 / 0.81 | chapitre 9 |
| Récupérer un poste à souder · `welding` | `supply` | 1178 / 0.81 | chapitre 10 |
| Refuge provisoire · `a12` | `archive` | 2542.0 / 0.43 | interaction locale |
| Réserve de terrain · `cache-stores` | `pickup` | 1643.0 / 0.86 | interaction locale |
| Se cacher dans le placard de service · `hide-stores` | `hide` | 2697 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `stores-set-0` | `crate` | 458 / 0.22 | Non | fonction propre au lieu |
| `stores-set-1` | `shelf` | 1075 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `stores-set-2` | `pallet` | 1332 / 0.22 | Non | fonction propre au lieu |
| `stores-set-3` | `gantry` | 1768 / 0.22 | Non | fonction propre au lieu |
| `stores-set-4` | `crate` | 2205 / 0.22 | Non | fonction propre au lieu |
| `stores-set-5` | `shelf` | 2642 / 0.22 | Non | fonction propre au lieu |
| `stores-detail-0` | `hand-truck` | 372 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-1` | `tool-board` | 1141 / 0.38 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `stores-detail-2` | `warning-board` | 1550 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-3` | `fire-cabinet` | 2139 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-4` | `cable-tray` | 2728 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `stores-cover1` | `pallet` | 1160 / 0.48 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `stores-cover2` | `crate` | 2110 / 0.52 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `stores-cover3` | `pallet` | 2430 / 0.86 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 713, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1519, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2294, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2728, z 0.77 ; décor conditionnel.
- Résident : `ferris` — Solène Ferris.
- Réserve : `supply-cargo` — Coffre de dotation.
- Volet : `shutter-stores` — Volet du magasin.
- Gaine : `duct-stores` — Descente du fret · A.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 17 — Distribution électrique · `power`

**Secteur :** Maintenance. **Niveau :** -1. **Présentation :** depth.
**Repère :** Deux banques de coupe-circuits et conduites.
**Dimensions de blocage :** [61.9, 9, 3.4] m proposés ; largeur de simulation 2600 ; profondeur 0.25 à 0.9.
**Plan schématique :** [3, 5]. **Circuit :** industry. **Profil :** industrial.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Magasin de fret | escalier / side-bulkhead | 170 / 0.69 | 2930 / 0.69 | -1 → 0 | Accès libre |
| Station de pompage | porte / side-bulkhead | 2430 / 0.69 | 170 / 0.69 | -1 → -1 | Accès libre |
| Galerie du refroidissement | échelle / rear-bay | 728 / 0.28 | 2530 / 0.69 | -1 → -2 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `power-cover1` | transformer | 1000 / 0.45 | 240 / 0.16 |
| `power-cover2` | coil | 1680 / 0.51 | 210 / 0.13 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Réarmer le départ habitat · `grid` | `power` | 598 / 0.81 | chapitre 2 |
| Rétablir le circuit de secours · `emergency` | `power` | 988 / 0.81 | chapitre 10 |
| Fermer derrière le groupe · `withdraw` | `seal` | 1378 / 0.81 | chapitre 11 |
| Deux circuits · `a13` | `archive` | 2132.0 / 0.43 | interaction locale |
| Se cacher dans le placard de service · `hide-power` | `hide` | 2262 / 0.82 | interaction locale |
| Récupérer la clé du collecteur · `job-drain-part` | `side-task` | 1950 / 0.28 | interaction locale |
| Parler à Greg Hansard · `contact-hansard` | `lore-contact` | 2060 / 0.8 | hansard |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `power-set-0` | `transformer` | 417 / 0.22 | Non | fonction propre au lieu |
| `power-set-1` | `panel` | 950 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `power-set-2` | `transformer` | 1123 / 0.22 | Non | fonction propre au lieu |
| `power-set-3` | `panel` | 1477 / 0.22 | Non | fonction propre au lieu |
| `power-set-4` | `cable` | 1830 / 0.22 | Non | fonction propre au lieu |
| `power-set-5` | `coil` | 2183 / 0.22 | Non | fonction propre au lieu |
| `power-detail-0` | `gauge` | 312 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-1` | `pipe-elbow` | 1240 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-2` | `pump-motor` | 1517 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-3` | `warning-board` | 1794 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-4` | `cable-tray` | 342 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `power-cover1` | `transformer` | 1000 / 0.45 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `power-cover2` | `coil` | 1680 / 0.51 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 598, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1274, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1924, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2288, z 0.77 ; décor conditionnel.
- Volet : `shutter-power` — Séparation du répartiteur.
- Gaine : `duct-power` — Descente du fret · B.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 18 — Station de pompage · `pump`

**Secteur :** Maintenance. **Niveau :** -1. **Présentation :** depth.
**Repère :** Collecteurs, vannes et caniveaux protégés.
**Dimensions de blocage :** [57.1, 9, 3.4] m proposés ; largeur de simulation 2400 ; profondeur 0.25 à 0.9.
**Plan schématique :** [2, 5]. **Circuit :** industry. **Profil :** industrial.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Distribution électrique | porte / side-bulkhead | 170 / 0.69 | 2430 / 0.69 | -1 → -1 | Accès libre |
| Galerie technique | porte / side-bulkhead | 2230 / 0.69 | 170 / 0.7 | -1 → -1 | Accès libre |
| Accès au processeur un | escalier / rear-bay | 672 / 0.28 | 170 / 0.69 | -1 → 0 | Accès libre |
| Dérivation des eaux grises | échelle / rear-bay | 1200 / 0.28 | 170 / 0.81 | -1 → -2 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `pump-cover1` | tank | 920 / 0.48 | 210 / 0.17 |
| `pump-cover2` | pump-motor | 1620 / 0.52 | 175 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Détourner la pression du passage · `reroute` | `valve` | 552 / 0.81 | chapitre 8 |
| Sous les logements · `a14` | `archive` | 1967.9999999999998 / 0.43 | interaction locale |
| Réserve de terrain · `cache-pump` | `pickup` | 1450 / 0.86 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `pump-set-0` | `tank` | 432 / 0.22 | Non | fonction propre au lieu |
| `pump-set-1` | `pipe` | 816 / 0.22 | Non | fonction propre au lieu |
| `pump-set-2` | `valve` | 1380 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `pump-set-3` | `tank` | 1584 / 0.22 | Non | fonction propre au lieu |
| `pump-set-4` | `valve` | 1968 / 0.22 | Non | fonction propre au lieu |
| `pump-detail-0` | `gauge` | 288 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-1` | `pipe-elbow` | 961 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-2` | `pump-motor` | 1417 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-3` | `warning-board` | 1656 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-4` | `cable-tray` | 366 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `pump-cover1` | `tank` | 920 / 0.48 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `pump-cover2` | `pump-motor` | 1620 / 0.52 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 552, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1176, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1776, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2112, z 0.77 ; décor conditionnel.
- Gaine : `duct-pump` — Collecteur de maintenance · B.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 19 — Galerie technique · `service`

**Secteur :** Maintenance. **Niveau :** -1. **Présentation :** side.
**Repère :** Passage sous les bâtiments, conduites continues.
**Dimensions de blocage :** [71.4, 2.8, 3.4] m proposés ; largeur de simulation 3000 ; profondeur 0.7 à 0.7.
**Plan schématique :** [2, 4]. **Circuit :** industry. **Profil :** maintenance.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Station de pompage | porte / side-bulkhead | 170 / 0.7 | 2230 / 0.69 | -1 → -1 | Accès libre |
| Laboratoire de la Compagnie | escalier / side-bulkhead | 2830 / 0.7 | 672 / 0.28 | -1 → 0 | Accès libre |
| Garage des prospecteurs | escalier / rear-bay | 840 / 0.7 | 896 / 0.28 | -1 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Suivre les traces dans la galerie · `trail` | `scan` | 690 / 0.7 | chapitre 8 |
| Se cacher dans le placard de service · `hide-service` | `hide` | 2610 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `service-set-0` | `pipe` | 492 / 0.22 | Non | fonction propre au lieu |
| `service-set-1` | `fan` | 996 / 0.22 | Non | fonction propre au lieu |
| `service-set-2` | `pipe` | 1500 / 0.22 | Non | fonction propre au lieu |
| `service-set-3` | `cable` | 2004 / 0.22 | Non | fonction propre au lieu |
| `service-set-4` | `pipe` | 2508 / 0.22 | Non | fonction propre au lieu |
| `service-detail-0` | `gauge` | 360 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-1` | `pipe-elbow` | 1147 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-2` | `vent-cover` | 1500 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-3` | `cable-tray` | 2070 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-4` | `fire-cabinet` | 2640 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 690, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1470, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2220, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2640, z 0.77 ; décor conditionnel.
- Volet : `shutter-service` — Volet technique.
- Avertisseur : `alarm-service` — Avertisseur technique.
- Gaine : `duct-service` — Collecteur de maintenance · A.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 20 — Piste du plateau · `road`

**Secteur :** Périmètre. **Niveau :** 0. **Présentation :** exterior.
**Repère :** Piquets de balisage, roches et ravines non praticables.
**Dimensions de blocage :** [88.1, 9, 3.4] m proposés ; largeur de simulation 3700 ; profondeur 0.25 à 0.9.
**Plan schématique :** [5, 4]. **Circuit :** perimeter. **Profil :** exterior.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Garage des prospecteurs | sas / side-bulkhead | 170 / 0.69 | 1536 / 0.28 | 0 → 0 | Accès libre |
| Plateau des relevés | piste / terrain | 3530 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |
| Processeur six | piste / terrain | 1036 / 0.28 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `road-cover1` | crate | 1406 / 0.56 | 160 / 0.13 |
| `road-cover2` | rock | 2479 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `road-set-0` | `beacon` | 562 / 0.22 | Non | orientation du trajet |
| `road-set-1` | `rock` | 1206 / 0.22 | Non | fonction propre au lieu |
| `road-set-2` | `rock` | 1850 / 0.22 | Non | fonction propre au lieu |
| `road-set-3` | `beacon` | 2494 / 0.22 | Non | orientation du trajet |
| `road-set-4` | `wreck` | 3138 / 0.22 | Non | fonction propre au lieu |
| `road-cover1` | `crate` | 1406 / 0.56 | Oui | obstacle contournable et cachette basse |
| `road-cover2` | `rock` | 2479 / 0.57 | Oui | obstacle contournable et cachette basse |
| `road-detail-0` | `survey-stake` | 444 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-1` | `floodlight` | 1364 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-2` | `cable-spool` | 1850 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-3` | `barrier` | 2553 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-4` | `rock-fragment` | 3256 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- Entretien du véhicule : `service-road` — Borne du périmètre.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 21 — Plateau des relevés · `plateau`

**Secteur :** Périmètre. **Niveau :** 0. **Présentation :** exterior.
**Repère :** Jalons de prospection, dépôt de service et accès à pied vers l’épave.
**Dimensions de blocage :** [69.0, 9, 3.4] m proposés ; largeur de simulation 2900 ; profondeur 0.25 à 0.9.
**Plan schématique :** [6, 4]. **Circuit :** perimeter. **Profil :** exterior.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Piste du plateau | piste / terrain | 170 / 0.69 | 3530 / 0.69 | 0 → 0 | Accès libre |
| Seuil de l’épave | brèche / organic-shell | 2730 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `plateau-cover1` | crate | 1102 / 0.56 | 160 / 0.13 |
| `plateau-cover2` | rock | 1943 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Poser une balise sur le plateau · `beacon` | `beacon` | 667 / 0.81 | chapitre 4 |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `plateau-set-0` | `rock` | 482 / 0.22 | Non | Affleurement rocheux hors trajectoire |
| `plateau-set-1` | `rock` | 966 / 0.22 | Non | fonction propre au lieu |
| `plateau-set-2` | `beacon` | 1450 / 0.22 | Non | orientation du trajet |
| `plateau-set-3` | `rock` | 1934 / 0.22 | Non | fonction propre au lieu |
| `plateau-set-4` | `cable` | 2418 / 0.22 | Non | fonction propre au lieu |
| `plateau-cover1` | `crate` | 1102 / 0.56 | Oui | obstacle contournable et cachette basse |
| `plateau-cover2` | `rock` | 1943 / 0.57 | Oui | obstacle contournable et cachette basse |
| `plateau-detail-0` | `survey-stake` | 348 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-1` | `floodlight` | 899 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-2` | `cable-spool` | 1450 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-3` | `barrier` | 2001 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-4` | `rock-fragment` | 2552 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- Entretien du véhicule : `service-plateau` — Dépôt de prospection.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 22 — Seuil de l’épave · `derelict`

**Secteur :** Épave. **Niveau :** 0. **Présentation :** derelict.
**Repère :** Arches biomécaniques et coque affaissée.
**Dimensions de blocage :** [59.5, 9, 3.4] m proposés ; largeur de simulation 2500 ; profondeur 0.25 à 0.9.
**Plan schématique :** [7, 4]. **Circuit :** perimeter. **Profil :** derelict.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Plateau des relevés | brèche / organic-shell | 170 / 0.69 | 2730 / 0.69 | 0 → 0 | Accès libre |
| Galerie biomécanique | brèche / organic-shell | 2330 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `derelict-cover1` | rib | 950 / 0.56 | 160 / 0.13 |
| `derelict-cover2` | rock | 1675 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner le seuil de l’épave · `threshold` | `scan` | 575 / 0.81 | chapitre 4 |
| Une coque étrangère · `a16` | `archive` | 2050.0 / 0.43 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `derelict-set-0` | `rib` | 442 / 0.22 | Non | fonction propre au lieu |
| `derelict-set-1` | `rib` | 846 / 0.22 | Non | fonction propre au lieu |
| `derelict-set-2` | `rib` | 1250 / 0.22 | Non | Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle |
| `derelict-set-3` | `rib` | 1654 / 0.22 | Non | fonction propre au lieu |
| `derelict-set-4` | `rib` | 2058 / 0.22 | Non | Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle |
| `derelict-cover1` | `rib` | 950 / 0.56 | Oui | obstacle contournable et cachette basse |
| `derelict-cover2` | `rock` | 1675 / 0.57 | Oui | obstacle contournable et cachette basse |
| `derelict-detail-0` | `rib` | 734 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-1` | `rib` | 775 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-2` | `rock-fragment` | 1250 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-3` | `rib` | 1725 / 0.38 | Non | Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle |
| `derelict-detail-4` | `rib` | 2200 / 0.38 | Non | Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 23 — Processeur six · `processor6`

**Secteur :** Terraformage. **Niveau :** 0. **Présentation :** depth.
**Repère :** Passerelle industrielle et conduites sous pression.
**Dimensions de blocage :** [71.4, 9, 3.4] m proposés ; largeur de simulation 3000 ; profondeur 0.25 à 0.9.
**Plan schématique :** [5, 5]. **Circuit :** industry. **Profil :** industrial.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Piste du plateau | piste / terrain | 170 / 0.69 | 1036 / 0.28 | 0 → 0 | Accès libre |
| Atelier de manutention | coursive / rear-bay | 1870 / 0.28 | 2830 / 0.81 | 0 → 0 | service-workshop |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `processor6-cover1` | turbine | 1090 / 0.47 | 260 / 0.16 |
| `processor6-cover2` | pipe | 2080 / 0.49 | 210 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Isoler la conduite endommagée · `pressure` | `valve` | 690 / 0.81 | chapitre 3 |
| Récupérer le rapport d’intervention · `incident` | `terminal` | 1140 / 0.81 | chapitre 3 |
| Intervention interrompue · `a15` | `archive` | 2460.0 / 0.43 | interaction locale |
| Réserve de terrain · `cache-processor6` | `pickup` | 1590.0 / 0.86 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `processor6-set-0` | `turbine` | 492 / 0.22 | Non | fonction propre au lieu |
| `processor6-set-1` | `valve` | 996 / 0.22 | Non | fonction propre au lieu |
| `processor6-set-2` | `turbine` | 1500 / 0.22 | Non | fonction propre au lieu |
| `processor6-set-3` | `gantry` | 2184 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `processor6-set-4` | `pipe` | 2508 / 0.22 | Non | fonction propre au lieu |
| `processor6-detail-0` | `gauge` | 360 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-1` | `pipe-elbow` | 930 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-2` | `pump-motor` | 1717 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-3` | `warning-board` | 2070 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-4` | `cable-tray` | 2640 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-cover1` | `turbine` | 1090 / 0.47 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `processor6-cover2` | `pipe` | 2080 / 0.49 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 690, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1470, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2220, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2640, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 24 — Accès au processeur un · `approach`

**Secteur :** Terraformage. **Niveau :** 0. **Présentation :** exterior.
**Repère :** Pylônes, sas de maintenance et énormes échangeurs.
**Dimensions de blocage :** [76.2, 9, 3.4] m proposés ; largeur de simulation 3200 ; profondeur 0.25 à 0.9.
**Plan schématique :** [1, 5]. **Circuit :** industry. **Profil :** exterior.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Station de pompage | escalier / side-bulkhead | 170 / 0.69 | 672 / 0.28 | 0 → -1 | Accès libre |
| Monte-charge du processeur | monte-charge / side-bulkhead | 3030 / 0.69 | 170 / 0.7 | 0 → -1 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `approach-cover1` | crate | 1216 / 0.56 | 160 / 0.13 |
| `approach-cover2` | rock | 2144 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `approach-set-0` | `tower` | 512 / 0.22 | Non | fonction propre au lieu |
| `approach-set-1` | `beacon` | 1056 / 0.22 | Non | orientation du trajet |
| `approach-set-2` | `pipe` | 1600 / 0.22 | Non | fonction propre au lieu |
| `approach-set-3` | `tower` | 2144 / 0.22 | Non | fonction propre au lieu |
| `approach-set-4` | `beacon` | 2688 / 0.22 | Non | orientation du trajet |
| `approach-cover1` | `crate` | 1216 / 0.56 | Oui | obstacle contournable et cachette basse |
| `approach-cover2` | `rock` | 2144 / 0.57 | Oui | obstacle contournable et cachette basse |
| `approach-detail-0` | `survey-stake` | 384 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-1` | `floodlight` | 992 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-2` | `cable-spool` | 1600 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-3` | `barrier` | 2208 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-4` | `rock-fragment` | 2816 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 25 — Monte-charge du processeur · `lift`

**Secteur :** Terraformage. **Niveau :** -1. **Présentation :** side.
**Repère :** Cabine de fret et paliers identifiés.
**Dimensions de blocage :** [42.9, 2.8, 3.4] m proposés ; largeur de simulation 1800 ; profondeur 0.7 à 0.7.
**Plan schématique :** [1, 6]. **Circuit :** industry. **Profil :** shaft.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Accès au processeur un | monte-charge / side-bulkhead | 170 / 0.7 | 3030 / 0.69 | -1 → 0 | Accès libre |
| Soubassements envahis | monte-charge / side-bulkhead | 1630 / 0.7 | 170 / 0.69 | -1 → -2 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Commander le monte-charge · `descent` | `terminal` | 414 / 0.7 | chapitre 11 |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `lift-set-0` | `cable` | 405 / 0.22 | Non | fonction propre au lieu |
| `lift-set-1` | `panel` | 735 / 0.22 | Non | fonction propre au lieu |
| `lift-set-2` | `gantry` | 1065 / 0.22 | Non | fonction propre au lieu |
| `lift-set-3` | `lamp` | 1395 / 0.22 | Non | fonction propre au lieu |
| `lift-detail-0` | `chain-hoist` | 650 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-1` | `warning-board` | 558 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-2` | `cable-tray` | 900 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-3` | `gauge` | 1242 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-4` | `ceiling-light` | 655 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 414, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 882, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1332, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1584, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 26 — Soubassements envahis · `hive`

**Secteur :** Terraformage. **Niveau :** -2. **Présentation :** hive.
**Repère :** Résine sur les structures industrielles, balises PDT.
**Dimensions de blocage :** [71.4, 9, 3.4] m proposés ; largeur de simulation 3000 ; profondeur 0.25 à 0.9.
**Plan schématique :** [2, 6]. **Circuit :** industry. **Profil :** hive.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Monte-charge du processeur | monte-charge / side-bulkhead | 170 / 0.69 | 1630 / 0.7 | -2 → -1 | Accès libre |
| Galerie du refroidissement | passerelle / side-bulkhead | 2830 / 0.69 | 170 / 0.69 | -2 → -2 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `hive-cover1` | resin | 1140 / 0.56 | 160 / 0.13 |
| `hive-cover2` | cocoon | 2010 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Retrouver la source des signaux · `pdt` | `scan` | 690 / 0.81 | chapitre 11 |
| Signaux immobiles · `a17` | `archive` | 2460.0 / 0.43 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `hive-set-0` | `resin` | 450 / 0.22 | Non | progression de la contamination |
| `hive-set-1` | `cocoon` | 870 / 0.22 | Non | fonction propre au lieu |
| `hive-set-2` | `rib` | 1290 / 0.22 | Non | fonction propre au lieu |
| `hive-set-3` | `resin` | 1710 / 0.22 | Non | progression de la contamination |
| `hive-set-4` | `egg` | 2130 / 0.22 | Non | fonction propre au lieu |
| `hive-set-5` | `cocoon` | 2550 / 0.22 | Non | fonction propre au lieu |
| `hive-cover1` | `resin` | 1140 / 0.56 | Oui | obstacle contournable et cachette basse |
| `hive-cover2` | `cocoon` | 2010 / 0.57 | Oui | obstacle contournable et cachette basse |
| `hive-detail-0` | `resin` | 360 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-1` | `resin` | 930 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-2` | `cocoon` | 1500 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-3` | `pipe-elbow` | 2070 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-4` | `cable-tray` | 2640 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 690, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1470, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2220, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2640, z 0.77 ; décor conditionnel.
- Gaine : `duct-hive` — Retour des échangeurs · A.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 27 — Galerie du refroidissement · `coolant`

**Secteur :** Terraformage. **Niveau :** -2. **Présentation :** hive.
**Repère :** Passage étroit entre les échangeurs, ruche en arrière-plan.
**Dimensions de blocage :** [64.3, 9, 3.4] m proposés ; largeur de simulation 2700 ; profondeur 0.25 à 0.9.
**Plan schématique :** [3, 6]. **Circuit :** industry. **Profil :** hive.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Soubassements envahis | passerelle / side-bulkhead | 170 / 0.69 | 2830 / 0.69 | -2 → -2 | Accès libre |
| Distribution électrique | échelle / side-bulkhead | 2530 / 0.69 | 728 / 0.28 | -2 → -1 | Accès libre |
| Dérivation des eaux grises | échelle / rear-bay | 1500 / 0.28 | 2680 / 0.81 | -2 → -2 | service-drain |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `coolant-cover1` | tank | 1026 / 0.56 | 160 / 0.13 |
| `coolant-cover2` | resin | 1809 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Baliser la route de repli · `fallback` | `beacon` | 621 / 0.81 | chapitre 11 |
| Aucun trophée · `a18` | `archive` | 2214.0 / 0.43 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `coolant-set-0` | `tank` | 462 / 0.22 | Non | fonction propre au lieu |
| `coolant-set-1` | `resin` | 906 / 0.22 | Non | progression de la contamination |
| `coolant-set-2` | `cocoon` | 1350 / 0.22 | Non | fonction propre au lieu |
| `coolant-set-3` | `tank` | 1794 / 0.22 | Non | fonction propre au lieu |
| `coolant-set-4` | `rib` | 2238 / 0.22 | Non | fonction propre au lieu |
| `coolant-cover1` | `tank` | 1026 / 0.56 | Oui | obstacle contournable et cachette basse |
| `coolant-cover2` | `resin` | 1809 / 0.57 | Oui | obstacle contournable et cachette basse |
| `coolant-detail-0` | `resin` | 324 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-1` | `resin` | 837 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-2` | `cocoon` | 1350 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-3` | `pipe-elbow` | 1863 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-4` | `cable-tray` | 2376 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 621, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1323, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1998, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2376, z 0.77 ; décor conditionnel.
- Gaine : `duct-coolant` — Retour des échangeurs · B.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 28 — Conduits de l’habitat · `vent_hab`

**Secteur :** Ventilation. **Niveau :** 1. **Présentation :** vent.
**Repère :** Jonctions basses, grilles et câbles de repérage.
**Dimensions de blocage :** [61.9, 1.1, 3.4] m proposés ; largeur de simulation 2600 ; profondeur 0.7 à 0.7.
**Plan schématique :** [4, 1]. **Circuit :** habitat. **Profil :** vent.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Logement des Jorden | conduit / side-bulkhead | 170 / 0.7 | 1680 / 0.69 | 1 → 1 | Newt seule |
| Conduits de l’infirmerie | conduit / side-bulkhead | 2430 / 0.7 | 170 / 0.7 | 1 → 1 | Newt seule |
| Conduits des prospecteurs | conduit / rear-bay | 728 / 0.7 | 170 / 0.7 | 1 → 0 | Newt seule |
| Centre de loisirs | grille / rear-bay | 1248 / 0.7 | 630 / 0.28 | 1 → 0 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Retrouver les repères de Tim · `marks` | `trace` | 598 / 0.7 | chapitre 7 |
| Vérifier le chemin de retour · `route` | `trace` | 988 / 0.7 | chapitre 16 |
| Se glisser dans le renfoncement · `hide-vent_hab` | `hide` | 2262 / 0.7 | interaction locale |
| Retrouver le ruban de Tim · `job-nest-part` | `side-task` | 1670 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `vent_hab-set-0` | `grille` | 452 / 0.22 | Non | fonction propre au lieu |
| `vent_hab-set-1` | `cable` | 876 / 0.22 | Non | fonction propre au lieu |
| `vent_hab-set-2` | `grille` | 1300 / 0.22 | Non | fonction propre au lieu |
| `vent_hab-set-3` | `fan` | 1724 / 0.22 | Non | fonction propre au lieu |
| `vent_hab-set-4` | `drawing` | 2148 / 0.22 | Non | trace de vie familiale |
| `vent_hab-detail-0` | `duct-junction` | 1614 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-1` | `vent-cover` | 986 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `vent_hab-detail-2` | `cable-tray` | 1517 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-3` | `bolt-panel` | 1794 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-4` | `trace-mark` | 2288 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- Réserve : `supply-vent` — Petite boîte oubliée.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 29 — Conduits de l’infirmerie · `vent_med`

**Secteur :** Ventilation. **Niveau :** 1. **Présentation :** vent.
**Repère :** Grilles d’observation et courbe de service.
**Dimensions de blocage :** [57.1, 1.1, 3.4] m proposés ; largeur de simulation 2400 ; profondeur 0.7 à 0.7.
**Plan schématique :** [1, 1]. **Circuit :** medical. **Profil :** vent.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Conduits de l’habitat | conduit / side-bulkhead | 170 / 0.7 | 2430 / 0.7 | 1 → 1 | Newt seule |
| Chambre d’isolement | grille / side-bulkhead | 2230 / 0.7 | 1530 / 0.7 | 1 → 0 | Newt seule |
| Renfoncement des câbles | conduit / rear-bay | 1070 / 0.7 | 170 / 0.7 | 1 → 1 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Écouter derrière la grille · `listen` | `listen` | 552 / 0.7 | chapitre 7 |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `vent_med-set-0` | `grille` | 480 / 0.22 | Non | fonction propre au lieu |
| `vent_med-set-1` | `cable` | 960 / 0.22 | Non | fonction propre au lieu |
| `vent_med-set-2` | `grille` | 1440 / 0.22 | Non | fonction propre au lieu |
| `vent_med-set-3` | `pipe` | 1920 / 0.22 | Non | fonction propre au lieu |
| `vent_med-detail-0` | `duct-junction` | 722 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-1` | `vent-cover` | 744 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-2` | `cable-tray` | 1380 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `vent_med-detail-3` | `bolt-panel` | 1656 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-4` | `trace-mark` | 1932 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 30 — Conduits des prospecteurs · `vent_survey`

**Secteur :** Ventilation. **Niveau :** 0. **Présentation :** vent.
**Repère :** Grille de secours au-dessus de la dernière barricade.
**Dimensions de blocage :** [56.0, 1.1, 3.4] m proposés ; largeur de simulation 2350 ; profondeur 0.7 à 0.7.
**Plan schématique :** [5, 3]. **Circuit :** habitat. **Profil :** vent.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Conduits de l’habitat | conduit / side-bulkhead | 170 / 0.7 | 728 / 0.7 | 0 → 1 | Newt seule |
| Bureau des prospecteurs | grille / side-bulkhead | 2180 / 0.7 | 700 / 0.28 | 0 → 0 | Newt seule |
| Cache des conduits | conduit / rear-bay | 658 / 0.7 | 170 / 0.7 | 0 → 0 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Passer sans attirer la créature · `silence` | `listen` | 540 / 0.7 | chapitre 15 |
| Se glisser dans le renfoncement · `hide-vent_survey` | `hide` | 2044 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `vent_survey-set-0` | `grille` | 474 / 0.22 | Non | fonction propre au lieu |
| `vent_survey-set-1` | `cable` | 941 / 0.22 | Non | fonction propre au lieu |
| `vent_survey-set-2` | `grille` | 1409 / 0.22 | Non | fonction propre au lieu |
| `vent_survey-set-3` | `resin` | 1876 / 0.22 | Non | progression de la contamination |
| `vent_survey-detail-0` | `duct-junction` | 933 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-1` | `vent-cover` | 908 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `vent_survey-detail-2` | `cable-tray` | 1175 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-3` | `bolt-panel` | 1622 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-4` | `trace-mark` | 1888 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 31 — Cache des conduits · `refuge`

**Secteur :** Ventilation. **Niveau :** 0. **Présentation :** vent.
**Repère :** Petit renfoncement hors des axes de ventilation.
**Dimensions de blocage :** [41.7, 1.1, 3.4] m proposés ; largeur de simulation 1750 ; profondeur 0.7 à 0.7.
**Plan schématique :** [5, 2]. **Circuit :** habitat. **Profil :** refuge.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Conduits des prospecteurs | conduit / side-bulkhead | 170 / 0.7 | 658 / 0.7 | 0 → 0 | Newt seule |
| Buanderie | grille / side-bulkhead | 1580 / 0.7 | 170 / 0.69 | 0 → 0 | Newt seule |
| Renfoncement des câbles | conduit / rear-bay | 1180 / 0.7 | 1780 / 0.7 | 0 → 1 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Préparer une petite cache · `cache` | `stash` | 402 / 0.7 | chapitre 7 |
| Regagner la cache · `hide` | `stash` | 665 / 0.7 | chapitre 16 |
| La petite cache · `a21` | `archive` | 1435.0 / 0.7 | interaction locale |
| Se glisser dans le renfoncement · `hide-refuge` | `hide` | 1040 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `refuge-set-0` | `toy` | 399 / 0.22 | Non | fonction propre au lieu |
| `refuge-set-1` | `blanket` | 716 / 0.22 | Non | fonction propre au lieu |
| `refuge-set-2` | `ration` | 1034 / 0.22 | Non | fonction propre au lieu |
| `refuge-set-3` | `drawing` | 1351 / 0.22 | Non | trace de vie familiale |
| `refuge-detail-0` | `mug` | 861 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-1` | `photo` | 542 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-2` | `trace-mark` | 875 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-3` | `bolt-panel` | 1388 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `refuge-detail-4` | `vent-cover` | 1360 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 32 — Hangar scientifique · `hangar`

**Secteur :** Recherche. **Niveau :** 0. **Présentation :** depth.
**Repère :** Navette de service, passerelle et réserves de carburant.
**Dimensions de blocage :** [78.6, 9, 3.4] m proposés ; largeur de simulation 3300 ; profondeur 0.25 à 0.9.
**Plan schématique :** [0, 5]. **Circuit :** research. **Profil :** hangar.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Laboratoire de la Compagnie | sas / side-bulkhead | 170 / 0.69 | 1152 / 0.28 | 0 → 0 | scienceClearance |
| Navette de la Compagnie | passerelle / side-bulkhead | 3130 / 0.69 | 170 / 0.7 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `hangar-cover1` | fuel | 1270 / 0.46 | 245 / 0.16 |
| `hangar-cover2` | pallet | 2130 / 0.54 | 260 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Déverrouiller la navette scientifique · `clearance` | `terminal` | 759 / 0.81 | chapitre 13 |
| Vérifier l’embarquement · `boarding` | `talk` | 1254 / 0.81 | mori |
| Accès réservé · `a19` | `archive` | 2706.0 / 0.43 | interaction locale |
| Réserve de terrain · `cache-hangar` | `pickup` | 1749.0 / 0.86 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `hangar-set-0` | `shuttle` | 522 / 0.22 | Non | fonction propre au lieu |
| `hangar-set-1` | `fuel` | 1086 / 0.22 | Non | fonction propre au lieu |
| `hangar-set-2` | `gantry` | 1650 / 0.22 | Non | fonction propre au lieu |
| `hangar-set-3` | `console` | 2214 / 0.22 | Non | poste de travail |
| `hangar-set-4` | `pallet` | 2778 / 0.22 | Non | fonction propre au lieu |
| `hangar-detail-0` | `chain-hoist` | 396 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-1` | `warning-board` | 1023 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-2` | `hose-reel` | 1867 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-3` | `tool-board` | 2277 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-4` | `ceiling-light` | 2904 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-cover1` | `fuel` | 1270 / 0.46 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `hangar-cover2` | `pallet` | 2130 / 0.54 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 759, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1617, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 2442, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 2904, z 0.77 ; décor conditionnel.
- Volet : `shutter-hangar` — Rideau du hangar.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 33 — Navette de la Compagnie · `shuttle`

**Secteur :** Recherche. **Niveau :** 0. **Présentation :** side.
**Repère :** Sas arrière, sièges et commandes de navigation.
**Dimensions de blocage :** [51.2, 2.8, 3.4] m proposés ; largeur de simulation 2150 ; profondeur 0.7 à 0.7.
**Plan schématique :** [0, 6]. **Circuit :** research. **Profil :** shuttle.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Hangar scientifique | passerelle / side-bulkhead | 170 / 0.7 | 3130 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Désengager la trajectoire automatique · `autopilot` | `terminal` | 494 / 0.7 | chapitre 14 |
| Décoller · `departure` | `launch` | 817 / 0.7 | chapitre 14 |
| Quatre sièges occupés · `a20` | `archive` | 1763.0 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `shuttle-set-0` | `seat` | 407 / 0.22 | Non | fonction propre au lieu |
| `shuttle-set-1` | `seat` | 741 / 0.22 | Non | fonction propre au lieu |
| `shuttle-set-2` | `console` | 1075 / 0.22 | Non | poste de travail |
| `shuttle-set-3` | `screen` | 1409 / 0.22 | Non | fonction propre au lieu |
| `shuttle-set-4` | `hatch` | 1743 / 0.22 | Non | fonction propre au lieu |
| `shuttle-detail-0` | `hanging-coat` | 692 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-1` | `oxygen` | 666 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-2` | `warning-board` | 1075 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-3` | `vent-cover` | 1484 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-4` | `ceiling-light` | 1892 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 494, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 1054, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1591, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1892, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 34 — Buanderie · `wash`

**Secteur :** Habitat. **Niveau :** 0. **Présentation :** depth.
**Repère :** Machines, linge abandonné et évier de service.
**Dimensions de blocage :** [44.0, 9, 3.4] m proposés ; largeur de simulation 1850 ; profondeur 0.25 à 0.9.
**Plan schématique :** [5, 1]. **Circuit :** habitat. **Profil :** utility.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Cache des conduits | grille / side-bulkhead | 170 / 0.69 | 1580 / 0.7 | 0 → 0 | Newt seule |
| Réfectoire | porte / side-bulkhead | 1680 / 0.69 | 2430 / 0.69 | 0 → 0 | Accès libre |
| Coursive résidentielle | escalier / rear-bay | 518 / 0.28 | 1296 / 0.7 | 0 → 1 | Accès libre |
| Serre vitrée | coursive / rear-bay | 1030 / 0.81 | 2580 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `wash-cover1` | washer | 703 / 0.56 | 160 / 0.13 |
| `wash-cover2` | linen | 1240 / 0.57 | 190 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Récupérer de l’eau · `water` | `supply` | 426 / 0.81 | chapitre 15 |
| L’eau du lendemain · `a22` | `archive` | 1517.0 / 0.43 | interaction locale |
| Se cacher dans le placard de service · `hide-wash` | `hide` | 771 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `wash-set-0` | `washer` | 377 / 0.22 | Non | fonction propre au lieu |
| `wash-set-1` | `washer` | 831 / 0.22 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `wash-set-2` | `linen` | 925 / 0.22 | Non | fonction propre au lieu |
| `wash-set-3` | `sink` | 1199 / 0.22 | Non | fonction propre au lieu |
| `wash-set-4` | `washer` | 1473 / 0.22 | Non | fonction propre au lieu |
| `wash-cover1` | `washer` | 703 / 0.56 | Oui | obstacle contournable et cachette basse |
| `wash-cover2` | `linen` | 1240 / 0.57 | Oui | obstacle contournable et cachette basse |
| `wash-detail-0` | `hanging-coat` | 873 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-1` | `hose-reel` | 791 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-2` | `vent-cover` | 925 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-3` | `wall-clock` | 1276 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-4` | `fire-cabinet` | 866 / 0.38 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 426, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 906, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1369, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1628, z 0.77 ; décor conditionnel.
- Résident : `sato` — Lina Sato.
- Réserve : `supply-laundry` — Panier de dépannage.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 35 — Relais de communications · `relay`

**Secteur :** Administration. **Niveau :** 1. **Présentation :** side.
**Repère :** Baie relais et émetteurs directionnels.
**Dimensions de blocage :** [46.4, 2.8, 3.4] m proposés ; largeur de simulation 1950 ; profondeur 0.7 à 0.7.
**Plan schématique :** [0, 1]. **Circuit :** research. **Profil :** archive.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Salle des archives | coursive / side-bulkhead | 170 / 0.7 | 1630 / 0.7 | 1 → 1 | Accès libre |
| Contrôle colonial | coursive / side-bulkhead | 1780 / 0.7 | 672 / 0.28 | 1 → 1 | Accès libre |
| Terrasse des antennes | escalier / rear-bay | 480 / 0.7 | 170 / 0.81 | 1 → 2 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Ligne sans réponse · `a23` | `archive` | 1599.0 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `relay-set-0` | `rack` | 424 / 0.22 | Non | fonction propre au lieu |
| `relay-set-1` | `antenna` | 791 / 0.22 | Non | fonction propre au lieu |
| `relay-set-2` | `console` | 1159 / 0.22 | Non | poste de travail |
| `relay-set-3` | `rack` | 1526 / 0.22 | Non | fonction propre au lieu |
| `relay-detail-0` | `server` | 631 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `relay-detail-1` | `tape-reel` | 784 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `relay-detail-2` | `cable-tray` | 975 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `relay-detail-3` | `vent-cover` | 1346 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `relay-detail-4` | `wall-clock` | 1536 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 448, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 956, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1443, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1716, z 0.77 ; décor conditionnel.
- Résident : `corban` — Nils Corban.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 36 — Réserve médicale · `clinic_store`

**Secteur :** Médical. **Niveau :** 0. **Présentation :** side.
**Repère :** Tiroirs de soins et stockage réfrigéré.
**Dimensions de blocage :** [40.5, 2.8, 3.4] m proposés ; largeur de simulation 1700 ; profondeur 0.7 à 0.7.
**Plan schématique :** [2, 0]. **Circuit :** medical. **Profil :** medical.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Infirmerie | porte / side-bulkhead | 170 / 0.7 | 784 / 0.28 | 0 → 0 | Accès libre |
| Atelier biomédical | porte / rear-bay | 1160 / 0.7 | 2280 / 0.81 | 0 → 0 | service-biomed |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Prendre les soins d’urgence · `medstock` | `supply` | 391 / 0.7 | chapitre 9 |
| Dernière réserve · `a24` | `archive` | 1394.0 / 0.7 | interaction locale |
| Réserve de terrain · `cache-clinic_store` | `pickup` | 901.0 / 0.7 | interaction locale |
| Se cacher dans le placard de service · `hide-clinic_store` | `hide` | 533 / 0.7 | interaction locale |
| Prendre le contacteur de réserve · `job-biomed-part` | `side-task` | 720 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `clinic_store-set-0` | `medicine` | 392 / 0.22 | Non | fonction propre au lieu |
| `clinic_store-set-1` | `shelf` | 698 / 0.22 | Non | fonction propre au lieu |
| `clinic_store-set-2` | `fridge` | 1002 / 0.22 | Non | fonction propre au lieu |
| `clinic_store-set-3` | `medicine` | 1308 / 0.22 | Non | fonction propre au lieu |
| `clinic_store-detail-0` | `privacy-screen` | 638 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-1` | `oxygen` | 527 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-2` | `medical-cross` | 850 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-3` | `wall-clock` | 1353 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |
| `clinic_store-detail-4` | `gurney` | 1496 / 0.7 | Non | Usage quotidien, identité du lieu et orientation |

#### États de crise et appareils

- À partir du stade 1 : `paper-trail`, x 391, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `emergency-arrow`, x 833, z 0.77 ; décor conditionnel.
- À partir du stade 2 : `broken-light`, x 1258, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `scorch`, x 1496, z 0.77 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 37 — Office de la cuisine · `pantry`

**Secteur :** Habitat. **Niveau :** 0. **Présentation :** depth.
**Repère :** Passe-plats, chambre froide et escalier réservé au personnel.
**Dimensions de blocage :** [50.0, 9, 3.4] m proposés ; largeur de simulation 2100 ; profondeur 0.25 à 0.9.
**Plan schématique :** [6, 0]. **Circuit :** habitat. **Profil :** canteen.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Réfectoire | porte / side-bulkhead | 170 / 0.81 | 1850 / 0.28 | 0 → 0 | Accès libre |
| Coursive résidentielle | escalier / side-bulkhead | 1930 / 0.81 | 1720 / 0.7 | 0 → 1 | service-pantry |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `pantry-cover1` | table | 730 / 0.44 | 220 / 0.13 |
| `pantry-cover2` | fridge | 1220 / 0.53 | 160 / 0.16 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner · La porte du personnel · `job-pantry-inspect` | `side-task` | 470 / 0.81 | interaction locale |
| Ajuster la poignée et libérer l’escalier · `job-pantry-release` | `side-task` | 1630 / 0.81 | interaction locale |
| Se cacher dans le casier de service · `hide-pantry` | `hide` | 1218.0 / 0.81 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `pantry-set-0` | `fridge` | 1320 / 0.27 | Non | Chambre froide derrière la table |
| `pantry-set-1` | `stove` | 850 / 0.27 | Non | Cuisson sous la hotte |
| `pantry-set-2` | `sink` | 540 / 0.27 | Non | Point de lavage près de l’entrée |
| `pantry-set-3` | `cupboard` | 1500 / 0.27 | Non | Réserve sèche contre la paroi |
| `pantry-set-4` | `ration` | 1470 / 0.29 | Non | Caisses de provisions près de la réserve |
| `pantry-set-5` | `kitchen-hood` | 850 / 0.27 | Non | Hotte alignée sur le poste de cuisson |
| `pantry-set-6` | `mug` | 950 / 0.27 | Non | Tasse au poste de pause |
| `pantry-set-7` | `wall-clock` | 380 / 0.27 | Non | Horloge au point de prise de service |
| `pantry-set-8` | `hanging-coat` | 1790 / 0.27 | Non | Manteau près de la sortie du personnel |
| `pantry-set-9` | `noticeboard` | 460 / 0.27 | Non | Consignes près de la poignée absente |
| `pantry-cover1` | `table` | 730 / 0.44 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `pantry-cover2` | `fridge` | 1220 / 0.53 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 2 : `paper-trail`, x 1260.0, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `broken-light`, x 840.0, z 0.4 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 38 — Atelier biomédical · `biomed`

**Secteur :** Médical. **Niveau :** 0. **Présentation :** depth.
**Repère :** Banc de réparation, berceaux de moniteurs et porte de la réserve.
**Dimensions de blocage :** [58.3, 9, 3.4] m proposés ; largeur de simulation 2450 ; profondeur 0.25 à 0.9.
**Plan schématique :** [0, 0]. **Circuit :** medical. **Profil :** medical.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Infirmerie | porte / side-bulkhead | 170 / 0.81 | 2000 / 0.28 | 0 → 0 | Accès libre |
| Réserve médicale | porte / side-bulkhead | 2280 / 0.81 | 1160 / 0.7 | 0 → 0 | service-biomed |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `biomed-cover1` | bed | 720 / 0.46 | 205 / 0.13 |
| `biomed-cover2` | lab-bench | 1450 / 0.5 | 190 / 0.14 |
| `biomed-cover3` | cart | 1830 / 0.41 | 135 / 0.1 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner · L’atelier de garde · `job-biomed-inspect` | `side-task` | 470 / 0.81 | interaction locale |
| Remplacer le contacteur et libérer la réserve · `job-biomed-release` | `side-task` | 1980 / 0.81 | interaction locale |
| Se cacher dans le casier de service · `hide-biomed` | `hide` | 1421.0 / 0.81 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `biomed-set-0` | `gurney` | 540 / 0.27 | Non | Baie de réparation du brancard |
| `biomed-set-1` | `monitor` | 655 / 0.27 | Non | Moniteur associé à la baie |
| `biomed-set-2` | `oxygen` | 465 / 0.27 | Non | Bouteille à côté du brancard |
| `biomed-set-3` | `tool-board` | 1240 / 0.27 | Non | Outils fixés au-dessus de l’établi |
| `biomed-set-4` | `glass-cabinet` | 1570 / 0.27 | Non | Armoire de composants près du plan de travail |
| `biomed-set-5` | `medicine` | 1520 / 0.29 | Non | Trousse rangée au pied du poste |
| `biomed-set-6` | `medical-cross` | 970 / 0.27 | Non | Signalétique de la travée médicale |
| `biomed-set-7` | `privacy-screen` | 815 / 0.27 | Non | Écran de séparation de la baie |
| `biomed-set-8` | `bed-lamp` | 615 / 0.27 | Non | Lampe au poste du brancard |
| `biomed-set-9` | `sink` | 2090 / 0.27 | Non | Lavage avant retour en réserve |
| `biomed-cover1` | `bed` | 720 / 0.46 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `biomed-cover2` | `lab-bench` | 1450 / 0.5 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `biomed-cover3` | `cart` | 1830 / 0.41 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 2 : `paper-trail`, x 1470.0, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `broken-light`, x 980.0, z 0.4 ; décor conditionnel.
- Résident : `doran` — Mei Doran.
- Réserve : `supply-biomedical` — Pièces de diagnostic.
- Établi : `bench-biomed` — Établi biomédical.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 39 — Terrasse des antennes · `aerial`

**Secteur :** Administration. **Niveau :** 2. **Présentation :** exterior.
**Repère :** Mâts inclinés par le vent, boîtier de synchronisation et cage d’escalier.
**Dimensions de blocage :** [64.3, 9, 3.4] m proposés ; largeur de simulation 2700 ; profondeur 0.25 à 0.9.
**Plan schématique :** [0, -1]. **Circuit :** research. **Profil :** exterior.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Relais de communications | escalier / side-bulkhead | 170 / 0.81 | 480 / 0.7 | 2 → 1 | Accès libre |
| Contrôle colonial | escalier / side-bulkhead | 2530 / 0.81 | 1320 / 0.28 | 2 → 1 | service-aerial |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `aerial-cover1` | crate | 830 / 0.47 | 240 / 0.16 |
| `aerial-cover2` | fuel | 1670 / 0.52 | 180 / 0.13 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner · Une fréquence dans le vent · `job-aerial-inspect` | `side-task` | 470 / 0.81 | interaction locale |
| Raccorder la liaison et libérer le palier · `job-aerial-release` | `side-task` | 2230 / 0.81 | interaction locale |
| Se cacher dans le casier de service · `hide-aerial` | `hide` | 1566.0 / 0.81 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `aerial-set-0` | `radio-mast` | 460 / 0.27 | Non | Premier mât fixé au parapet |
| `aerial-set-1` | `radio-mast` | 1810 / 0.27 | Non | Mât principal voisin du boîtier |
| `aerial-set-2` | `antenna` | 2250 / 0.27 | Non | Antenne secondaire près du palier |
| `aerial-set-3` | `cable-spool` | 1710 / 0.29 | Non | Réserve de câble sous le mât principal |
| `aerial-set-4` | `floodlight` | 1150 / 0.27 | Non | Éclairage de la zone de passage |
| `aerial-set-5` | `barrier` | 1450 / 0.26 | Non | Garde-corps arrière de la terrasse |
| `aerial-set-6` | `radio` | 1970 / 0.27 | Non | Poste de service au pied du mât |
| `aerial-set-7` | `warning-board` | 1400 / 0.27 | Non | Avertissement au changement de travée |
| `aerial-set-8` | `cable-tray` | 2070 / 0.27 | Non | Chemin de câble vers le boîtier |
| `aerial-set-9` | `beacon` | 2440 / 0.27 | Non | Balise fixée au palier de sortie |
| `aerial-cover1` | `crate` | 830 / 0.47 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `aerial-cover2` | `fuel` | 1670 / 0.52 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 2 : `paper-trail`, x 1620.0, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `broken-light`, x 1080.0, z 0.4 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 40 — Atelier de manutention · `workshop`

**Secteur :** Logistique. **Niveau :** 0. **Présentation :** depth.
**Repère :** Chaîne de palan, établi moteur et galerie vers le processeur six.
**Dimensions de blocage :** [71.4, 9, 3.4] m proposés ; largeur de simulation 3000 ; profondeur 0.25 à 0.9.
**Plan schématique :** [6, 6]. **Circuit :** industry. **Profil :** hangar.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Garage des prospecteurs | porte / side-bulkhead | 170 / 0.81 | 2580 / 0.28 | 0 → 0 | Accès libre |
| Processeur six | coursive / side-bulkhead | 2830 / 0.81 | 1870 / 0.28 | 0 → 0 | service-workshop |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `workshop-cover1` | wheel | 890 / 0.45 | 290 / 0.17 |
| `workshop-cover2` | tools | 1800 / 0.5 | 210 / 0.14 |
| `workshop-cover3` | crate | 2370 / 0.52 | 150 / 0.12 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner · Le palan immobilisé · `job-workshop-inspect` | `side-task` | 470 / 0.81 | interaction locale |
| Remonter la chaîne et lever le rideau · `job-workshop-release` | `side-task` | 2530 / 0.81 | interaction locale |
| Se cacher dans le casier de service · `hide-workshop` | `hide` | 1739.9999999999998 / 0.81 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `workshop-set-0` | `chain-hoist` | 2140 / 0.27 | Non | Palan suspendu dans son portique |
| `workshop-set-1` | `tractor` | 610 / 0.27 | Non | Véhicule immobilisé dans la baie d’entrée |
| `workshop-set-2` | `wheel` | 765 / 0.29 | Non | Train de roue voisin du véhicule |
| `workshop-set-3` | `tool-board` | 1650 / 0.27 | Non | Panneau d’outils au poste moteur |
| `workshop-set-4` | `pump-motor` | 1570 / 0.27 | Non | Moteur au poste de réparation |
| `workshop-set-5` | `hand-truck` | 1320 / 0.27 | Non | Diable dans le rangement latéral |
| `workshop-set-6` | `cable-spool` | 1860 / 0.29 | Non | Touret à côté du poste de maintenance |
| `workshop-set-7` | `fuel` | 820 / 0.27 | Non | Réserve fermée à côté du véhicule |
| `workshop-set-8` | `gantry` | 2140 / 0.27 | Non | Portique portant le palan |
| `workshop-set-9` | `fire-cabinet` | 2660 / 0.27 | Non | Incendie à proximité de la galerie de sortie |
| `workshop-cover1` | `wheel` | 890 / 0.45 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `workshop-cover2` | `tools` | 1800 / 0.5 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `workshop-cover3` | `crate` | 2370 / 0.52 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 2 : `paper-trail`, x 1800.0, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `broken-light`, x 1200.0, z 0.4 ; décor conditionnel.
- Réserve : `supply-workshop` — Mallette du palan.
- Établi : `bench-workshop` — Établi de maintenance.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 41 — Dérivation des eaux grises · `drain`

**Secteur :** Maintenance. **Niveau :** -2. **Présentation :** depth.
**Repère :** Deux vannes de purge, cuves fermées et passerelle latérale sèche.
**Dimensions de blocage :** [67.9, 9, 3.4] m proposés ; largeur de simulation 2850 ; profondeur 0.25 à 0.9.
**Plan schématique :** [4, 7]. **Circuit :** industry. **Profil :** maintenance.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Station de pompage | échelle / side-bulkhead | 170 / 0.81 | 1200 / 0.28 | -2 → -1 | Accès libre |
| Galerie du refroidissement | échelle / side-bulkhead | 2680 / 0.81 | 1500 / 0.28 | -2 → -2 | service-drain |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `drain-cover1` | tank | 820 / 0.46 | 280 / 0.16 |
| `drain-cover2` | pump-motor | 1620 / 0.5 | 240 / 0.13 |
| `drain-cover3` | tank | 2180 / 0.44 | 190 / 0.1 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner · Le retour des eaux · `job-drain-inspect` | `side-task` | 470 / 0.81 | interaction locale |
| Ouvrir le retour et libérer la grille · `job-drain-release` | `side-task` | 2380 / 0.81 | interaction locale |
| Se cacher dans le casier de service · `hide-drain` | `hide` | 1652.9999999999998 / 0.81 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `drain-set-0` | `tank` | 490 / 0.27 | Non | Cuve fermée côté entrée |
| `drain-set-1` | `pipe` | 550 / 0.27 | Non | Conduite raccordée à la cuve |
| `drain-set-2` | `gauge` | 690 / 0.27 | Non | Manomètre du premier circuit |
| `drain-set-3` | `hose-reel` | 1100 / 0.27 | Non | Flexible au poste de maintenance |
| `drain-set-4` | `pump-motor` | 1390 / 0.27 | Non | Groupe moteur du retour |
| `drain-set-5` | `pipe-elbow` | 1500 / 0.27 | Non | Coude au départ du moteur |
| `drain-set-6` | `valve` | 1770 / 0.27 | Non | Volant de la dérivation |
| `drain-set-7` | `fire-cabinet` | 2450 / 0.27 | Non | Poste incendie près de l’échelle |
| `drain-set-8` | `warning-board` | 2110 / 0.27 | Non | Consigne avant le retour |
| `drain-set-9` | `floodlight` | 2570 / 0.27 | Non | Éclairage de la zone de sortie |
| `drain-cover1` | `tank` | 820 / 0.46 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `drain-cover2` | `pump-motor` | 1620 / 0.5 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `drain-cover3` | `tank` | 2180 / 0.44 | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### États de crise et appareils

- À partir du stade 2 : `paper-trail`, x 1710.0, z 0.77 ; décor conditionnel.
- À partir du stade 3 : `broken-light`, x 1140.0, z 0.4 ; décor conditionnel.

**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 42 — Renfoncement des câbles · `nest`

**Secteur :** Ventilation. **Niveau :** 1. **Présentation :** vent.
**Repère :** Rubans colorés, couverture pliée et petite grille d’observation.
**Dimensions de blocage :** [46.4, 1.2, 2.2] m proposés ; largeur de simulation 1950 ; profondeur 0.7 à 0.7.
**Plan schématique :** [6, 2]. **Circuit :** habitat. **Profil :** refuge.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Conduits de l’infirmerie | conduit / side-bulkhead | 170 / 0.7 | 1070 / 0.7 | 1 → 1 | Newt seule |
| Cache des conduits | conduit / side-bulkhead | 1780 / 0.7 | 1180 / 0.7 | 1 → 0 | Newt seule |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Examiner · Le fil qui revient · `job-nest-inspect` | `side-task` | 470 / 0.7 | interaction locale |
| Nouer le ruban et soulever la petite grille · `job-nest-release` | `side-task` | 1480 / 0.7 | interaction locale |
| Se glisser dans le renfoncement · `hide-nest` | `hide` | 1131.0 / 0.7 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `nest-set-0` | `drawing` | 380 / 0.7 | Non | Dessin servant de repère près de l’entrée |
| `nest-set-1` | `blanket` | 560 / 0.7 | Non | Couverture dans le renfoncement sec |
| `nest-set-2` | `toy` | 600 / 0.7 | Non | Jouet laissé près de la couverture |
| `nest-set-3` | `trace-mark` | 970 / 0.7 | Non | Trace au premier coude du conduit |
| `nest-set-4` | `duct-junction` | 870 / 0.7 | Non | Jonction fixée sur la paroi |
| `nest-set-5` | `bolt-panel` | 1190 / 0.7 | Non | Plaque vissée du coffrage |
| `nest-set-6` | `mug` | 650 / 0.7 | Non | Tasse au petit bivouac |
| `nest-set-7` | `vent-cover` | 1570 / 0.7 | Non | Grille alignée sur le passage de l’ombre |
| `nest-set-8` | `photo` | 720 / 0.7 | Non | Photo gardée à côté du bivouac |
| `nest-set-9` | `cable` | 1580 / 0.7 | Non | Dégagement visuel du seuil ; décoration déplacée, collision inchangée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 43 — Serre vitrée · `greenhouse`

**Secteur :** Habitat. **Niveau :** 0. **Présentation :** depth.
**Repère :** Dôme vitré hémisphérique : présence attestée, culture et plan interprétés.
**Dimensions de blocage :** [65.5, 9, 5.5] m proposés ; largeur de simulation 2750 ; profondeur 0.25 à 0.9.
**Plan schématique :** [6, 1]. **Circuit :** habitat. **Profil :** greenhouse.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Centre de loisirs | coursive / side-bulkhead | 170 / 0.69 | 1590 / 0.81 | 0 → 0 | Accès libre |
| Buanderie | coursive / side-bulkhead | 2580 / 0.69 | 1030 / 0.81 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `greenhouse-v09-0` | planter | 650 / 0.4 | 250 / 0.11 |
| `greenhouse-v09-1` | planter | 1300 / 0.4 | 250 / 0.11 |
| `greenhouse-v09-2` | planter | 1950 / 0.4 | 250 / 0.11 |
| `greenhouse-v09-3` | planter | 1260 / 0.58 | 250 / 0.11 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Observer la serre · `greenhouse-inspection` | `inspection` | 2240 / 0.81 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `greenhouse-v09-0` | `planter` | 650 / 0.4 | Oui | Implantation de jeu documentée |
| `greenhouse-v09-1` | `planter` | 1300 / 0.4 | Oui | Implantation de jeu documentée |
| `greenhouse-v09-2` | `planter` | 1950 / 0.4 | Oui | Implantation de jeu documentée |
| `greenhouse-v09-3` | `planter` | 1260 / 0.58 | Oui | Implantation de jeu documentée |
| `greenhouse-v09-4` | `planter` | 460 / 0.19 | Non | Implantation de jeu documentée |
| `greenhouse-v09-5` | `planter` | 900 / 0.19 | Non | Implantation de jeu documentée |
| `greenhouse-v09-6` | `planter` | 1650 / 0.19 | Non | Implantation de jeu documentée |
| `greenhouse-v09-7` | `planter` | 2180 / 0.19 | Non | Implantation de jeu documentée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 44 — Armurerie de la garnison · `armory`

**Secteur :** Administration. **Niveau :** 1. **Présentation :** depth.
**Repère :** Râteliers identifiés et dépôt séparé du poste de commandement.
**Dimensions de blocage :** [52.4, 9, 5.5] m proposés ; largeur de simulation 2200 ; profondeur 0.25 à 0.9.
**Plan schématique :** [3, 0]. **Circuit :** habitat. **Profil :** garrison.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Poste de la garnison | porte / side-bulkhead | 170 / 0.69 | 1230 / 0.7 | 1 → 1 | Accès libre |
| Contrôle colonial | porte / side-bulkhead | 2030 / 0.69 | 1770 / 0.28 | 1 → 1 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| — | Aucun obstacle statique déclaré | — | — |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Consulter le râtelier · `armory-rack-v09` | `armory` | 1080 / 0.28 | interaction locale |
| Râtelier sous scellés · `a31` | `archive` | 580 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `armory-v09-0` | `weapon-rack` | 390 / 0.22 | Non | Implantation de jeu documentée |
| `armory-v09-1` | `case` | 418 / 0.41 | Non | Implantation de jeu documentée |
| `armory-v09-2` | `weapon-rack` | 730 / 0.22 | Non | Implantation de jeu documentée |
| `armory-v09-3` | `case` | 758 / 0.41 | Non | Implantation de jeu documentée |
| `armory-v09-4` | `case` | 1128 / 0.41 | Non | Implantation de jeu documentée |
| `armory-v09-5` | `weapon-rack` | 1430 / 0.22 | Non | Implantation de jeu documentée |
| `armory-v09-6` | `case` | 1458 / 0.41 | Non | Implantation de jeu documentée |
| `armory-v09-7` | `weapon-rack` | 1800 / 0.22 | Non | Implantation de jeu documentée |
| `armory-v09-8` | `case` | 1828 / 0.41 | Non | Implantation de jeu documentée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 45 — Galerie biomécanique · `derelict_gallery`

**Secteur :** Épave. **Niveau :** 0. **Présentation :** derelict.
**Repère :** Coque nervurée ; le passage continue au-delà du seuil.
**Dimensions de blocage :** [57.1, 9, 5.5] m proposés ; largeur de simulation 2400 ; profondeur 0.25 à 0.9.
**Plan schématique :** [8, 4]. **Circuit :** perimeter. **Profil :** derelict.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Seuil de l’épave | brèche / organic-shell | 170 / 0.69 | 2330 / 0.69 | 0 → 0 | Accès libre |
| Chambre du pilote | brèche / organic-shell | 2230 / 0.69 | 170 / 0.69 | 0 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `derelict_gallery-v09-6` | rib | 768.0 / 0.54 | 145 / 0.11 |
| `derelict_gallery-v09-7` | rib | 1536.0 / 0.54 | 145 / 0.11 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Consigner : La courbe intérieure · `a32` | `archive` | 1110 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `derelict_gallery-v09-0` | `rib` | 380 / 0.22 | Non | Implantation de jeu documentée |
| `derelict_gallery-v09-1` | `rib` | 690 / 0.22 | Non | Implantation de jeu documentée |
| `derelict_gallery-v09-2` | `rib` | 1000 / 0.22 | Non | Implantation de jeu documentée |
| `derelict_gallery-v09-3` | `rib` | 1310 / 0.22 | Non | Implantation de jeu documentée |
| `derelict_gallery-v09-4` | `rib` | 1620 / 0.22 | Non | Implantation de jeu documentée |
| `derelict_gallery-v09-5` | `rib` | 1930 / 0.22 | Non | Implantation de jeu documentée |
| `derelict_gallery-v09-6` | `rib` | 768.0 / 0.54 | Oui | Implantation de jeu documentée |
| `derelict_gallery-v09-7` | `rib` | 1536.0 / 0.54 | Oui | Implantation de jeu documentée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 46 — Chambre du pilote · `pilot_chamber`

**Secteur :** Épave. **Niveau :** 0. **Présentation :** derelict.
**Repère :** Siège fossile central, sans déplacement du pilote vers la colonie.
**Dimensions de blocage :** [71.4, 9, 5.5] m proposés ; largeur de simulation 3000 ; profondeur 0.25 à 0.9.
**Plan schématique :** [9, 4]. **Circuit :** perimeter. **Profil :** derelict.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Galerie biomécanique | brèche / organic-shell | 170 / 0.69 | 2230 / 0.69 | 0 → 0 | Accès libre |
| Cale aux œufs | corde / organic-shell | 2830 / 0.69 | 170 / 0.69 | 0 → -1 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `pilot_chamber-v09-8` | rib | 960.0 / 0.54 | 145 / 0.11 |
| `pilot_chamber-v09-9` | rib | 1920.0 / 0.54 | 145 / 0.11 |
| `pilot_chamber-v09-10` | pilot-seat | 1470 / 0.34 | 280 / 0.17 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Consigner : Le poste immobile · `a33` | `archive` | 1980 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `pilot_chamber-v09-0` | `rib` | 380 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-1` | `rib` | 690 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-2` | `rib` | 1000 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-3` | `rib` | 1310 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-4` | `rib` | 1620 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-5` | `rib` | 1930 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-6` | `rib` | 2240 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-7` | `rib` | 2550 / 0.22 | Non | Implantation de jeu documentée |
| `pilot_chamber-v09-8` | `rib` | 960.0 / 0.54 | Oui | Implantation de jeu documentée |
| `pilot_chamber-v09-9` | `rib` | 1920.0 / 0.54 | Oui | Implantation de jeu documentée |
| `pilot_chamber-v09-10` | `pilot-seat` | 1470 / 0.34 | Oui | Implantation de jeu documentée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

### 47 — Cale aux œufs · `egg_vault`

**Secteur :** Épave. **Niveau :** -1. **Présentation :** derelict.
**Repère :** Nappe de brume et ovoides sous la coque ; parcours d’observation original.
**Dimensions de blocage :** [67.9, 9, 5.5] m proposés ; largeur de simulation 2850 ; profondeur 0.25 à 0.9.
**Plan schématique :** [9, 5]. **Circuit :** perimeter. **Profil :** derelict.
**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.

#### Accès et retours

| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |
|---|---|---|---|---|---|
| Chambre du pilote | corde / organic-shell | 170 / 0.69 | 2830 / 0.69 | -1 → 0 | Accès libre |

Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.

#### Obstacles physiques

| ID | Nature | Centre x/z | Largeur / profondeur |
|---|---|---|---|
| `egg_vault-v09-8` | rock | 912.0 / 0.54 | 145 / 0.11 |
| `egg_vault-v09-9` | rock | 1824.0 / 0.54 | 145 / 0.11 |
| `egg_vault-v09-10` | egg-bed | 1400 / 0.33 | 2060 / 0.14 |

#### Interactions

| Objet | Action | Position x/z | Personnage / stade |
|---|---|---|
| Consigner : Sous la chambre · `a34` | `archive` | 2380 / 0.82 | interaction locale |

#### Décor et implantation

| ID | Élément | Position x/z | Collision | Fonction |
|---|---|---|---|---|
| `egg_vault-v09-0` | `rib` | 380 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-1` | `rib` | 690 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-2` | `rib` | 1000 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-3` | `rib` | 1310 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-4` | `rib` | 1620 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-5` | `rib` | 1930 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-6` | `rib` | 2240 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-7` | `rib` | 2550 / 0.22 | Non | Implantation de jeu documentée |
| `egg_vault-v09-8` | `rock` | 912.0 / 0.54 | Oui | Implantation de jeu documentée |
| `egg_vault-v09-9` | `rock` | 1824.0 / 0.54 | Oui | Implantation de jeu documentée |
| `egg_vault-v09-10` | `egg-bed` | 1400 / 0.33 | Oui | Implantation de jeu documentée |
| `egg_vault-v09-11` | `sealed-egg` | 510 / 0.36 | Non | Implantation de jeu documentée |
| `egg_vault-v09-12` | `sealed-egg` | 735 / 0.3 | Non | Implantation de jeu documentée |
| `egg_vault-v09-13` | `sealed-egg` | 1010 / 0.36 | Non | Implantation de jeu documentée |
| `egg_vault-v09-14` | `sealed-egg` | 1260 / 0.36 | Non | Implantation de jeu documentée |
| `egg_vault-v09-15` | `sealed-egg` | 1510 / 0.36 | Non | Implantation de jeu documentée |
| `egg_vault-v09-16` | `sealed-egg` | 1770 / 0.36 | Non | Implantation de jeu documentée |
| `egg_vault-v09-17` | `sealed-egg` | 2040 / 0.36 | Non | Implantation de jeu documentée |
| `egg_vault-v09-18` | `sealed-egg` | 2260 / 0.36 | Non | Implantation de jeu documentée |

#### États de crise et appareils


**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.

## Sources consultées

### S1 — Titan Books — Alien: River of Pain

https://titanbooks.com/6486-alien-river-of-pain-book-3/

Auteur, prémisse, colonie, famille Jorden, garnison, épave

### S2 — Audible France — ALIEN Audible Original

https://www.audible.fr/series/ALIEN-Audible-Original-Livres-Audio/B07MXJYR1P

Titre français Le Fleuve des souffrances ; distinguer adaptation sonore et roman

### S3 — Christopher Golden — entretien AvPGalaxy

https://www.avpgalaxy.net/website/interviews/christopher-golden/

Intention de prélude à Aliens et liens avec les récits préexistants

### S4 — AvP Central — Demian Brackett

https://www.avpcentral.com/demian-brackett

Brackett, Paris, Mori, Luisa ; issue distincte du sort de Newt, navette distincte de l’Onager ; à recouper sur le roman intégral

### S5 — AvP Central — Hadley’s Hope colonists

https://www.avpcentral.com/hadleys-hope-colonists

Identification des personnages secondaires ; ne pas fusionner médecins et Draper de continuités différentes

### R1 — Titan Books / Daily Dead — extrait autorisé, chapitres Rebecca et Arrivals

https://dailydead.com/read-exclusive-excerpt-alien-river-pain/

Anne, Komiskey, matériel médical ; secteurs hors-colonie identifiés, pas roman intégral.

### R2 — Christopher Golden — entretien auteur, 30 octobre 2014

https://www.avpgalaxy.net/website/interviews/christopher-golden/

Intérieur de l’épave, groupes du récit ; pas de plan coté.

### R3 — NECA — Rescuing Newt, figurines sous licence

https://necaonline.com/2016/08/aliens-30th-anniversary-rescuing-newt-deluxe-action-figure-2-pack/

Silhouette filmique de Newt ; objets de scènes ultérieures exclus.

### R4 — Propstore — accessoire M240 employé dans Aliens

https://propstore.com/product/aliens-1986/19-ellen-ripleys-sigourney-weaver-practical-special-effects-m240-flamethrower/

Silhouette et nom M240 ; pas une preuve de dotation de Hadley’s Hope dans le roman.

## Limites persistantes

DLC autonome avec lanceur additionnel. Aucun GameEngine natif de Tantalus fusionné, aucun push GitHub ou déploiement Vercel. Plans et dialogues originaux ; roman intégral non disponible dans les sources consultées. Graphismes vectoriels stylisés provisoires, pas une ressemblance photoréaliste ni des atlas définitifs. L’objectif 1:1 n’est pas certifié.

La vérification du moteur ne prouve pas l’exhaustivité du roman. Le détail complet de la garnison, les armes effectivement employées scène par scène, les visages des personnages jamais filmés et les positions exactes des bâtiments restent à documenter. Aucun chapitre nouveau n’est inventé comme une scène authentifiée pour combler ce manque.
