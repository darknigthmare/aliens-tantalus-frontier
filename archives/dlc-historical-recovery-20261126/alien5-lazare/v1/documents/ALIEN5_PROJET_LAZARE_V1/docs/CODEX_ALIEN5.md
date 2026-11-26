# ALIEN 5 — PROJET LAZARE
## Codex de production et de level design · v1.0.0-candidate.1

> Ce document décrit une adaptation originale jouable. Il ne prétend pas reconstituer un scénario intégral de Neill Blomkamp. Les règles notées « implémentées » correspondent au code livré ; les priorités finales ne sont pas livrées par anticipation.

## 1. Intention et frontière de la reconstitution

La campagne reprend la direction de travail demandée pour les DLC de Tantalus : mémoire MIRE autonome, lieux à fonction identifiable, couloirs latéraux et espaces à profondeur, portes et niveaux reliés, conséquences persistantes. Cette version n’est pas une fusion des runtimes des DLC antérieurs : les archives récentes de ces DLC n’ont pas été retrouvées dans les recherches de fichiers. Un lanceur additif est fourni pour une intégration locale prudente.

Le point de divergence de cette histoire se situe après Aliens. Ripley, Hicks et Rebecca Jorden ont survécu ; des années plus tard, leurs noms réapparaissent dans un transfert industriel clandestin. Aucun rêve n’est invoqué pour annuler Alien 3 : il s’agit d’une branche séparée. Aucun personnage ni objet de cette branche n’est injecté dans la chronologie principale de Tantalus.

Calder est un site original. Sa tour est un lieu de travail avant de devenir un lieu d’horreur : les dockers reçoivent les conteneurs, l’usine fournit énergie et chauffe, les bureaux valident les contrats, les laboratoires consomment des prélèvements, le bloc d’isolement collecte les rejets, la couronne assure les arrivées et départs. Chaque passage conserve cette logique de circulation.

Le programme Lazare est une invention de raccord : il exploite les données des survivants afin de poursuivre des essais de contention. Les comportements de Trematode, le plan du complexe, les choix, les scènes d’action et les fins sont des règles de jeu originales. Ils ne sont pas présentés comme des révélations du scénario perdu.

### Registre de sources

**S01 — Geoffroy Thoorens / PRIMARY_PORTFOLIO**
Alien 5 — portfolio du concept artist — https://djahalland.com/alien-5
Apport vérifié : Concepts de production : architecture industrielle et urbaine, espaces de recherche, personnages et créatures. Les légendes ne constituent pas un scénario.
Limite : Le fonctionnement des lieux, leur liaison, les dialogues et leur ordre dans cette campagne sont originaux.

**S02 — Alec Gillis / AVPGalaxy / PRIMARY_INTERVIEW**
Entretien studioADI — Alien 5 — https://www.avpgalaxy.net/website/interviews/alec-gillis/
Apport vérifié : Témoignage sur le travail conceptuel pendant l’écriture de Blomkamp, Carlos Huante et la maquette de Tim Martin ; discussion de membres supplémentaires.
Limite : Ne fournit pas le scénario intégral ni les statistiques ou comportements des créatures.

**S03 — AlloCiné / SECONDARY_CONTEXT**
Article rétrospectif sur le projet abandonné — https://www.allocine.fr/article/fichearticle_gen_carticle=1000053660.html
Apport vérifié : Contexte de la suite alternative envisagée après Aliens.
Limite : Les déclarations sur l’état du scénario ont varié : aucune restitution scène par scène revendiquée.

**S04 — darknigthmare / PROJECT_BASE**
Tantalus Frontier — main vérifié — https://github.com/darknigthmare/aliens-tantalus-frontier/commit/496996f5ea557d970ec625aa346876f3eaed1c5f
Apport vérifié : package.json v86, menu principal et copie récursive de assets au build.
Limite : Les archives cumulatives des autres DLC n’ont pas été retrouvées dans la recherche de fichiers. Pas de validation de régression du jeu entier.

### Méthode de provenance

**Document de production :** identification d’un concept ou témoignage d’un intervenant. **Interprétation :** une image inspire une ambiance, sans affirmer son ordre ni sa fonction scénaristique. **Création du jeu :** tout raccord, dialogue, statistique, nom de lieu et mécanisme absent des documents.

Un artwork ne démontre pas à lui seul un cycle de reproduction, le nom canonique d’une caste ou le pouvoir d’une combinaison. Le scénario intégral de Blomkamp n’a pas été obtenu et authentifié ici. Aucun texte provenant d’un autre projet intitulé Alien 5 n’a été fusionné discrètement dans cette campagne.

## 2. Distribution et fonctions implémentées

**Ripley :** personnage contrôlé. Sa boucle est observer, se déplacer, interagir, contenir la menace puis se retirer. Elle dispose du fusil et de l’incinérateur ; ce n’est pas un système d’évolution biologique. Les décisions d’échantillon et de diffusion passent par son opération.

**Hicks :** liaison tactique et présence visuelle dans les scènes d’arrivée / départ. Il interprète les risques, la chauffe et les amarrages. Il n’existe pas encore comme compagnon autonome capable de tirer, de mourir et d’être réanimé.

**Rebecca « Newt » Jorden :** liaison d’enquête, analyse des contrats et des essais. Son rôle exact et ses dialogues sont originaux. Aucun flashback jouable ni alternance de protagoniste n’est implémenté.

**Jax :** contact radio qui ouvre l’opération et prépare l’extraction. Le nom apparaît dans les recherches de production ; son rôle dans Calder est une invention de cette adaptation. **Miller :** technicienne captive ; la libérer ou l’abandonner change le bilan. Son transfert vers la navette est narratif, pas une simulation d’escorte.

Les autres noms rencontrés dans des concepts ne sont pas ajoutés comme figurants gratuits. Les classes civiles, leurs variantes vestimentaires, les conversations de proximité et les cinématiques restent des extensions à produire, non des fonctionnalités cachées prétendument terminées.

## 3. Campagne — déroulé exécutable

La campagne contient 27 jalons séquentiels. Un objectif ne peut être validé que dans sa pièce, à portée, et après les précédents. Des portes deviennent accessibles durablement. Il est possible de revenir chercher un dossier ou une réserve dans un lieu déjà visité. La carte ne téléporte pas le joueur.

### 01. Les noms rayés

Calder. Un ordre de transfert porte trois noms qui auraient dû rester oubliés.

**Écouter le message de Jax** — Quai d’approche (A5_00, niveau 00).
Dispositif : `radio` à x=850, profondeur=0.58. Prérequis : début de campagne. État durable : briefed.
Transmission originale de Jax : « J’ai un ordre de transfert. Ripley. Hicks. Jorden. Vos noms, et la date de demain. »

**Récupérer le sceau de fret** — Poste de fret (A5_03, niveau 00).
Dispositif : `console` à x=825, profondeur=0.50. Prérequis : brief. État durable : key_freight.
Transmission originale de Ripley : « Ils ont des cages assez grandes pour un véhicule. Pourquoi leur faut-il mon dossier médical ? »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 02. Une ville qui travaille

Le convoi n’emportait pas du minerai. Quelqu’un a tenté de prévenir les quais.

**Rétablir le relais des quais** — Gare suspendue (A5_04, niveau 00).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : freight. État durable : signal.
Transmission originale de Newt : « La dernière émission vient des laboratoires. Pas des bureaux. Quelqu’un a coupé la réponse. »

**Ouvrir le refuge aux dockers** — Refuge des transitaires (A5_01, niveau 00).
Dispositif : `radio` à x=825, profondeur=0.50. Prérequis : signal. État durable : shelter.
Transmission originale de Hicks : « Fermez derrière nous. Si les sirènes changent de ton, gagnez les navettes. Ne nous attendez pas. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 03. La relève ne viendra pas

Le dernier quart est entré dans la tour. Personne n’en est sorti.

**Réarmer le groupe auxiliaire** — Chaufferie centrale (A5_09, niveau 01).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : shelter. État durable : power.
Transmission originale de Hicks : « Le groupe tient. Maintenant on coupe leur chaîne, pas l’air que respirent les ouvriers. »

**Immobiliser le convoi scellé** — Chaîne des conteneurs (A5_07, niveau 01).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : generator. État durable : conveyor.
Transmission originale de Ripley : « Une cage vide. Ses attaches ont fondu de l’intérieur. Personne ne charge la suivante. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 04. Le dernier service

Les ateliers alimentent autre chose que des chaînes de montage.

**Lire le registre des équipes** — Bureau des équipes (A5_08, niveau 01).
Dispositif : `console` à x=825, profondeur=0.50. Prérequis : conveyor. État durable : roster.
Transmission originale de Newt : « Ils ont écrit « réaffectés ». Trente-deux fois. Les familles n’ont reçu que ce mot. »

**Armer le monte-charge M2** — Monte-charge M2 (A5_11, niveau 01).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : roster. État durable : lift_ready.
Transmission originale de Jax : « Je garde le canal ouvert. Au-dessus, ils auront déjà reçu votre signalement. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 05. Des murs sans fenêtres

Au-dessus de la suie, tout est blanc. Même les rapports d’accident.

**Déchiffrer le contrat de recherche** — Archives du personnel (A5_13, niveau 04).
Dispositif : `console` à x=825, profondeur=0.50. Prérequis : lift. État durable : ledger.
Transmission originale de Newt : « Ce ne sont pas des prélèvements de routine. Ils ont payé pour que les dossiers disparaissent. »

**Couper l’autorité distante** — Contrôle de la tour (A5_14, niveau 04).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : ledger. État durable : breach.
Transmission originale de Hicks : « Ils viennent de lâcher les verrous du vivarium. Quelqu’un préfère perdre l’étage que nous parler. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 06. Le prix du silence

La direction a conservé les survivants comme des variables de laboratoire.

**Copier les archives de direction** — Atrium des actionnaires (A5_15, niveau 04).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : control. État durable : clearance.
Transmission originale de Ripley : « Nous ne sommes pas leurs échantillons. Copie tout. Les noms des équipes aussi. »

**Récupérer le kit étanche** — Infirmerie du personnel (A5_16, niveau 04).
Dispositif : `locker` à x=825, profondeur=0.50. Prérequis : director. État durable : suit.
Transmission originale de Newt : « Ce kit est prévu pour les brûlures d’acide. Ils savaient exactement ce qui pouvait arriver. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 07. Une autre espèce de cage

Le bassin a cédé. Ce qui nage entre les consoles n’était pas prévu sur les plans.

**Analyser la fiche des prélèvements** — Salle des prélèvements (A5_20, niveau 03).
Dispositif : `console` à x=825, profondeur=0.50. Prérequis : medical. État durable : specimen.
Transmission originale de Newt : « Un tissu qui réagit n’est pas une preuve de contrôle. Ils ont confondu les deux. »

**Purger le bassin de rétention** — Laboratoire submergé (A5_19, niveau 03).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : specimen. État durable : drained.
Transmission originale de Hicks : « La passerelle tient encore. Les pompes ont besoin du groupe de l’usine. Restez hors du câble nu. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 08. La mémoire de la chair

Un organisme expérimental réagit aux échantillons. Il ne reconnaît aucun maître.

**Décider du sort de l’échantillon** — Vivarium expérimental (A5_21, niveau 03).
Dispositif : `choice` à x=850, profondeur=0.58. Prérequis : drain. État durable : sample_decided.
Transmission originale de Ripley : « Une seule ampoule. Une seule excuse pour recommencer. On choisit maintenant. »

**Verrouiller le confinement local** — Centre de confinement (A5_23, niveau 03).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : sample. État durable : quarantine.
Transmission originale de Newt : « Leur commande est morte. Le bloc est isolé. Ce qui reste en dessous ne recevra plus rien. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 09. Ce qui tient les murs

La résine cache une équipe entière. Un mouvement répond à la lampe.

**Débrancher la table de greffe** — Chambre des greffes (A5_25, niveau 02).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : lockdown. État durable : graft.
Transmission originale de Ripley : « Ce n’était pas une protection. C’était un autre moyen de rester près d’eux. »

**Libérer la technicienne Miller** — Nid de la rétention (A5_26, niveau 02).
Dispositif : `rescue` à x=950, profondeur=0.32. Prérequis : graft. État durable : miller.
Transmission originale de Hicks : « Elle respire. On peut encore ouvrir ce cocon sans toucher aux poches. Lentement. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 10. La machine à effacer

Le four peut rompre le cycle. Il peut aussi effacer les preuves.

**Dériver la chauffe du four** — Salle de catalyse (A5_27, niveau 02).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : rescue. État durable : heat.
Transmission originale de Newt : « Les canaux rejoignent la rétention. Si les volets ferment, la chaleur ne remontera pas vers les logements. »

**Lancer la stérilisation du bloc** — Four de stérilisation (A5_28, niveau 02).
Dispositif : `console` à x=850, profondeur=0.58. Prérequis : heat. État durable : sterilized.
Transmission originale de Ripley : « Fermez le retour. Cette fois, ils ne garderont rien dans les cendres. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 11. Plus personne ne commande

Il reste une antenne, une navette et une voie d’accès déjà condamnée.

**Prendre les charges d’arrimage** — Réserve des charges (A5_32, niveau 08).
Dispositif : `locker` à x=825, profondeur=0.50. Prérequis : burn. État durable : charges.
Transmission originale de Hicks : « Pas assez pour la tour. Assez pour les attaches du bras. On lui enlève le sol sous les pieds. »

**Transmettre les preuves** — Antenne de diffusion (A5_33, niveau 08).
Dispositif : `choice` à x=850, profondeur=0.58. Prérequis : charges. État durable : broadcast.
Transmission originale de Newt : « Je peux envoyer tout le dossier, ou seulement l’ordre d’évacuation. Le réseau ne nous laissera pas deux essais. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

### 12. Ce qu’on emporte

La reine a rejoint la couronne. Les attaches du bras restent accessibles.

**Armer l’attache ouest** — Bras d’amarrage (A5_31, niveau 08).
Dispositif : `charge` à x=330, profondeur=0.64. Prérequis : broadcast. État durable : anchor_a.
Transmission originale de Hicks : « Première attache armée. Ne restez pas au milieu du bras. »

**Armer l’attache centrale** — Bras d’amarrage (A5_31, niveau 08).
Dispositif : `charge` à x=930, profondeur=0.64. Prérequis : anchor_a. État durable : anchor_b.
Transmission originale de Ripley : « La deuxième tient. Jax, ouvrez la rampe. Personne ne revient chercher du matériel. »

**Armer l’attache est** — Bras d’amarrage (A5_31, niveau 08).
Dispositif : `charge` à x=1440, profondeur=0.64. Prérequis : anchor_b. État durable : anchor_c.
Transmission originale de Jax : « Rampe ouverte. Je ne ferme pas tant que je vous vois dehors. »

**Rompre le bras d’amarrage** — Bras d’amarrage (A5_31, niveau 08).
Dispositif : `console` à x=665, profondeur=0.20. Prérequis : anchor_c. État durable : queen_down.
Transmission originale de Ripley : « Maintenant. »

**Rejoindre la navette** — Hangar d’extraction (A5_35, niveau 08).
Dispositif : `extract` à x=1120, profondeur=0.50. Prérequis : detonate. État durable : complete.
Transmission originale de Newt : « Les portes sont fermées. Cette fois, nous décidons de ce qui voyage avec nous. »

**Critère de sortie :** les jalons de ce chapitre sont enregistrés ; le chapitre suivant peut devenir actif. La sauvegarde conserve les réserves consommées et les individus éliminés.

## 4. Décisions et fins

**Échantillon :** détruire / conserver. **Diffusion :** publier les preuves / limiter l’émission aux ordres d’évacuation. **Miller :** libérer / laisser. Les choix sont validés par des valeurs autorisées à l’import, et ne peuvent pas être injectés comme noms de fonctions.

**Les noms rendus :** l’ampoule est détruite et les preuves sont publiées. Les familles des équipes reçoivent les noms et les contrats. **Le silence derrière nous :** l’ampoule est détruite, mais l’émission n’a servi qu’à l’évacuation. **La soute fermée :** l’échantillon est conservé ; une inquiétude demeure à bord. La phrase finale concernant Miller varie indépendamment. Ces trois fins sont entièrement originales.

## 5. Contrat de gameplay

### Déplacement et profondeur
Le plan logique utilise x horizontal et z de profondeur. Les grandes salles autorisent z entre 0,12 et 0,94 ; les couloirs imposent z=0,50. Le rendu projette les pieds à 455 + z × 200 pixels. Les personnages sont légèrement mis à l’échelle selon leur profondeur. Les tirs ne touchent pas automatiquement une cible située sur un autre plan. Il ne s’agit ni d’un moteur FPS ni d’une vraie géométrie 3D.

Les grands volumes sont des espaces de circulation plutôt que plusieurs lignes décoratives. Les obstacles de jeu ont un rectangle de collision ; leur rôle n’est pas confondu avec les machines du mur, placées hors de la zone de marche. Les portes se déclenchent seulement à proximité et conduisent toujours à leur contrepartie. Leur arrivée décale les pieds vers l’intérieur de la pièce.

### Combat et ressources
Le chargeur du fusil contient 16 cartouches ; le rechargement dure 1,1 seconde et débite la réserve. La flamme consomme 2 unités par impulsion. Le leurre détourne l’attention par le bruit et consomme 8 unités de carburant. Les soins consomment une trousse. Les réserves sont collectées une fois, avec identifiants stables.

Les obstacles opaques arrêtent la ligne de tir et la détection visuelle. Les ennemis ont une portée de vue, une portée sonore, une phase d’approche, une préparation d’attaque et une récupération. Les xénomorphes morts laissent une zone acide à durée restante sauvegardée. Le sang des agents humains ne crée pas de zone acide. Aucun individu n’est ressuscité par une transition de pièce.

### Mise en scène du dernier combat
La reine est un individu unique sur le bras d’amarrage. Les tirs ou la flamme provoquent une interruption, mais ses points de vie ne peuvent pas tomber sous 1 par ces armes. Le joueur arme trois attaches, puis utilise le pupitre de rupture. L’événement détruit le support et marque la reine neutralisée ; l’extraction ne s’ouvre narrativement qu’ensuite. La chute est actuellement un événement de lumière et d’état, pas une cinématique animée finalisée.

### Évitement des blocages irréversibles
Le centre de confinement propose un pupitre de purge thermique à x=450, z=0,38. Son effet ne frappe le spécimen à quatre bras que dans la plage x=1040..1490 de cette cellule. Ce dispositif permet de progresser même après épuisement des munitions. La portée du mécanisme est propre à cette pièce, pas une suppression globale de tous les ennemis.

Après une défaite, le jeu repart du dernier jalon validé. Il rétablit un minimum de 65 points de santé. Si l’évacuation est déjà engagée, un minimum de 120 secondes en Survie ou 180 secondes en Récit évite de répéter un point de contrôle devenu impossible. Ce délai de reprise est une règle de confort explicite, pas une promesse de réalisme temporel.

## 6. Bestiaire et comportements

### Agent de sécurité — `guard`
Original : personnel chargé de verrouiller le fret.

Patrouille courte, enquête sur le bruit, tir après acquisition visuelle ; obstacles opaques respectés.

Paramètres de cette version : santé 62, vitesse 70 unités/s, dégâts 9, distance d’attaque 440, vue 480, audition maximale 260. Ce sont des valeurs de jeu, pas des mesures canoniques.

### Xénomorphe — `drone`
Archétype de la franchise ; présence et comportement précis originaux.

Enquête sur bruit ; accélère vers une cible visible ; attaque rapprochée ; recul face au feu ; sang acide à la mort.

Paramètres de cette version : santé 86, vitesse 118 unités/s, dégâts 16, distance d’attaque 48, vue 350, audition maximale 440. Ce sont des valeurs de jeu, pas des mesures canoniques.

### Facehugger — `facehugger`
Archétype de la franchise ; placements originaux en vivarium.

Rapide et bas ; bond télégraphié à portée ; détruit par tir ou flamme ; pas de ponte infinie.

Paramètres de cette version : santé 24, vitesse 140 unités/s, dégâts 13, distance d’attaque 42, vue 240, audition maximale 200. Ce sont des valeurs de jeu, pas des mesures canoniques.

### Trematode expérimental — `trematode`
Nom présent dans les concepts de Thoorens ; anatomie de jeu simplifiée et règles originales.

Organisme ancré ; palpe son périmètre ; rétraction à la flamme. Aucun cycle de vie canonique inventé.

Paramètres de cette version : santé 115, vitesse 0 unités/s, dégâts 18, distance d’attaque 130, vue 240, audition maximale 220. Ce sont des valeurs de jeu, pas des mesures canoniques.

### Spécimen à quatre bras — `fourarm`
Inspiration des recherches de production discutées par studioADI ; rencontre originale.

Individu unique du centre de confinement ; approche lente et longue préparation de frappe. Combat ou purge thermique de sa cellule ; le levier offre une issue même sans munitions.

Paramètres de cette version : santé 225, vitesse 93 unités/s, dégâts 24, distance d’attaque 76, vue 420, audition maximale 520. Ce sont des valeurs de jeu, pas des mesures canoniques.

### Reine de la couronne — `queen`
Reine évoquée dans les concepts ; cet individu et cette fin sont une adaptation originale.

Rencontre unique ; les tirs la font reculer mais ne la tuent pas. Trois attaches puis commande de rupture ; dégâts environnementaux décisifs.

Paramètres de cette version : santé 650, vitesse 68 unités/s, dégâts 28, distance d’attaque 100, vue 700, audition maximale 900. Ce sont des valeurs de jeu, pas des mesures canoniques.

**Limite du directeur :** les individus sont simulés dans leur pièce. Il n’y a pas encore de poursuite systémique entre pièces par les conduits. Les effets d’infiltration distante, de chasse à l’échelle de la tour ou de coordination d’escouade ne sont pas annoncés comme livrés.

## 7. Codex spatial — les 36 lieux

Chaque fiche ci-dessous est générée depuis les mêmes données que le jeu. Les positions sont des coordonnées de plan, pas des mesures architecturales réelles. Les passerelles lointaines constituent des couches de décor ; seules les portes listées et le sol défini sont traversables. Le plan du menu représente les connexions et leurs étages, non une coupe à l’échelle.

### A5_00 — Quai d’approche

**Secteur :** Les quais de Calder. **Niveau :** 00. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le refuge de transit domine le quai ; deux portes mènent au refuge et à la promenade.
**Décor justifié :** Vue sur la ville, pylône de dock, bollards, câbles d’amarrage, projecteurs de fret.

**Portes et destinations exactes :**

- `P00` · door à (145, 0.16) → Refuge des transitaires (A5_01, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P01` · door à (1655, 0.16) → Promenade des citernes (A5_02, niveau 00). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `brief` · Écouter le message de Jax · x=850, z=0.58. Type : quest.
- `LOG_00` · Le transfert · x=650, z=0.23. Type : log.
- `SUP_00` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `bollard` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `tank` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `brief` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_01 — Refuge des transitaires

**Secteur :** Les quais de Calder. **Niveau :** 00. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Le refuge reçoit les dockers de nuit et donne sur une galerie de service.
**Décor justifié :** Lits superposés, casiers, table, distributeur, radio et sacs de transit.

**Portes et destinations exactes :**

- `P00` · door à (145, 0.50) → Quai d’approche (A5_00, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P02` · door à (1355, 0.50) → Poste de fret (A5_03, niveau 00). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `shelter` · Ouvrir le refuge aux dockers · x=825, z=0.50. Type : quest.
- `LOG_01` · La chaise vide · x=320, z=0.50. Type : log.
- `SUP_01` · Réserve de terrain · x=1060, z=0.50. Type : supply.

**Implantation des éléments de décor :**

- `bed` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `locker` à x=443, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `bench` à x=607, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `radio` à x=770, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `lamp` à x=933, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `case` à x=1097, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `shelter` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_02 — Promenade des citernes

**Secteur :** Les quais de Calder. **Niveau :** 00. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** La passerelle court entre la citerne industrielle et la gare suspendue.
**Décor justifié :** Citernes rivetées, coursive au fond, grilles de ventilation et pompes.

**Portes et destinations exactes :**

- `P01` · door à (145, 0.16) → Quai d’approche (A5_00, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P03` · door à (1655, 0.16) → Poste de fret (A5_03, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P04` · door à (560, 0.16) → Gare suspendue (A5_04, niveau 00). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `LOG_02` · Pression de service · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `tank` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `vent` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `crate` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_03 — Poste de fret

**Secteur :** Les quais de Calder. **Niveau :** 00. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Les manifestes et accréditations sont contrôlés avant la gare.
**Décor justifié :** Guichet vitré, barrière levante, scanner, compteur de lots, palettes.

**Portes et destinations exactes :**

- `P02` · door à (145, 0.50) → Refuge des transitaires (A5_01, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P03` · door à (1355, 0.50) → Promenade des citernes (A5_02, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P05` · door à (560, 0.50) → Atelier des monteurs (A5_05, niveau 00). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `freight` · Récupérer le sceau de fret · x=825, z=0.50. Type : quest.
- `LOG_03` · Aucune cargaison · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `barrier` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=443, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `locker` à x=607, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `case` à x=933, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=1097, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :**

- `A5_EN_00` : Agent de sécurité à (1180, 0.50). Activation : `sécurité de site dès le départ`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `freight` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_04 — Gare suspendue

**Secteur :** Les quais de Calder. **Niveau :** 00. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Une navette de fret absente a laissé son relais radio sous tension.
**Décor justifié :** Rails en arrière-plan, bancs, signalétique, porte palière et grue.

**Portes et destinations exactes :**

- `P04` · door à (145, 0.16) → Promenade des citernes (A5_02, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P06` · door à (1655, 0.16) → Atelier des monteurs (A5_05, niveau 00). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `signal` · Rétablir le relais des quais · x=850, z=0.58. Type : quest.
- `LOG_04` · Dernière émission · x=650, z=0.23. Type : log.
- `SUP_04` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `bench` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `rail` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `console` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `crate` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_01` : Agent de sécurité à (1310, 0.66). Activation : `sécurité de site dès le départ`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `signal` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_05 — Atelier des monteurs

**Secteur :** Les quais de Calder. **Niveau :** 00. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le monte-charge dessert directement les sas ouvriers de l’étage 01.
**Décor justifié :** Établis, pièces suspendues, bouteille de gaz, pont roulant et treuil.

**Portes et destinations exactes :**

- `P05` · door à (145, 0.16) → Poste de fret (A5_03, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `P06` · door à (1655, 0.16) → Gare suspendue (A5_04, niveau 00). Verrou : `aucun`. Retour par la même liaison.
- `L0` · lift à (560, 0.16) → Sas ouvrier (A5_06, niveau 01). Verrou : `key_freight`. Retour par la même liaison.

**Actions situées :**

- `LOG_05` · Le monte-charge · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `bench` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `machine` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `cable` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_06 — Sas ouvrier

**Secteur :** Les ateliers de relève. **Niveau :** 01. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Le personnel se décontamine entre le dock et les chaînes.
**Décor justifié :** Douches sèches, bancs, casiers fermés, filtre et porte étanche.

**Portes et destinations exactes :**

- `P07` · door à (145, 0.50) → Chaîne des conteneurs (A5_07, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P08` · door à (1355, 0.50) → Bureau des équipes (A5_08, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `L0` · lift à (560, 0.50) → Atelier des monteurs (A5_05, niveau 00). Verrou : `key_freight`. Retour par la même liaison.

**Actions situées :**

- `LOG_06` · Vestiaire · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `locker` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `bench` à x=443, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `vent` à x=607, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `tank` à x=933, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=1097, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_07 — Chaîne des conteneurs

**Secteur :** Les ateliers de relève. **Niveau :** 01. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Les cages de transport suivent un convoyeur vers le centre de recherche.
**Décor justifié :** Convoyeur arrêté, berceaux numérotés, crochet, pont de contrôle, caisses scellées.

**Portes et destinations exactes :**

- `P07` · door à (145, 0.16) → Sas ouvrier (A5_06, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P09` · door à (1655, 0.16) → Chaufferie centrale (A5_09, niveau 01). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `conveyor` · Immobiliser le convoi scellé · x=850, z=0.58. Type : quest.
- `LOG_07` · Le berceau · x=650, z=0.23. Type : log.
- `SUP_07` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `conveyor` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `machine` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `crate` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `pipe` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `lamp` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_02` : Agent de sécurité à (1320, 0.58). Activation : `sécurité de site dès le départ`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `conveyor` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_08 — Bureau des équipes

**Secteur :** Les ateliers de relève. **Niveau :** 01. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Le contremaître conserve les heures et les affectations des équipes disparues.
**Décor justifié :** Horloge, dossiers, armoire métallique, planning et écran de pointage.

**Portes et destinations exactes :**

- `P08` · door à (145, 0.50) → Sas ouvrier (A5_06, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P10` · door à (1355, 0.50) → Chaufferie centrale (A5_09, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P11` · door à (560, 0.50) → Galerie d’inspection (A5_10, niveau 01). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `roster` · Lire le registre des équipes · x=825, z=0.50. Type : quest.
- `LOG_08` · Heures supplémentaires · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `desk` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `cabinet` à x=443, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=607, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `console` à x=770, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `bench` à x=933, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `case` à x=1097, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `roster` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_09 — Chaufferie centrale

**Secteur :** Les ateliers de relève. **Niveau :** 01. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le groupe auxiliaire alimente le monte-charge et les pompes du laboratoire.
**Décor justifié :** Chaudières, conduites chaudes isolées, vannes, jauges et bac de purge.

**Portes et destinations exactes :**

- `P09` · door à (145, 0.16) → Chaîne des conteneurs (A5_07, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P10` · door à (1655, 0.16) → Bureau des équipes (A5_08, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P12` · door à (560, 0.16) → Monte-charge M2 (A5_11, niveau 01). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `generator` · Réarmer le groupe auxiliaire · x=850, z=0.58. Type : quest.
- `LOG_09` · Circuit séparé · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `boiler` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `console` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `cable` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `generator` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_10 — Galerie d’inspection

**Secteur :** Les ateliers de relève. **Niveau :** 01. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Une passerelle technique évite la chaîne et rejoint son extrémité haute.
**Décor justifié :** Chemin de câbles, trappes, garde-corps, ventilateurs et boîtiers.

**Portes et destinations exactes :**

- `P11` · door à (145, 0.50) → Bureau des équipes (A5_08, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P13` · door à (1355, 0.50) → Monte-charge M2 (A5_11, niveau 01). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `LOG_10` · Filtre 08 · x=320, z=0.50. Type : log.
- `SUP_10` · Réserve de terrain · x=1060, z=0.50. Type : supply.

**Implantation des éléments de décor :**

- `vent` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=443, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=607, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `grille` à x=933, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `case` à x=1097, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :**

- `A5_EN_03` : Agent de sécurité à (1140, 0.50). Activation : `sécurité de site dès le départ`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_11 — Monte-charge M2

**Secteur :** Les ateliers de relève. **Niveau :** 01. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le grand ascenseur relie l’atelier 01 à l’accueil de l’étage 04.
**Décor justifié :** Contrepoids, portes massives, rail-guide, commandes et marquages de charge.

**Portes et destinations exactes :**

- `P12` · door à (145, 0.16) → Chaufferie centrale (A5_09, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `P13` · door à (1655, 0.16) → Galerie d’inspection (A5_10, niveau 01). Verrou : `aucun`. Retour par la même liaison.
- `L1` · lift à (560, 0.16) → Réception Weyland (A5_12, niveau 04). Verrou : `lift_ready`. Retour par la même liaison.

**Actions situées :**

- `lift` · Armer le monte-charge M2 · x=850, z=0.58. Type : quest.
- `LOG_11` · M2 · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `machine` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `rail` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `lift` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_12 — Réception Weyland

**Secteur :** La façade blanche. **Niveau :** 04. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le personnel administratif arrive par une réception séparée des cages de fret.
**Décor justifié :** Arbre sous verre, banques d’accueil, vitrage, panneau mural et sièges.

**Portes et destinations exactes :**

- `P14` · door à (145, 0.16) → Archives du personnel (A5_13, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P15` · door à (1655, 0.16) → Contrôle de la tour (A5_14, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `L1` · lift à (560, 0.16) → Monte-charge M2 (A5_11, niveau 01). Verrou : `lift_ready`. Retour par la même liaison.

**Actions situées :**

- `LOG_12` · Hospitalité · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `plant` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `desk` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `bench` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `glass` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `console` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_04` : Agent de sécurité à (1250, 0.60). Activation : `sécurité de site dès le départ`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_13 — Archives du personnel

**Secteur :** La façade blanche. **Niveau :** 04. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Les copies locales des contrats restent accessibles hors réseau.
**Décor justifié :** Rayonnages de bandes, lecteurs, classeurs et chariot de stockage.

**Portes et destinations exactes :**

- `P14` · door à (145, 0.50) → Réception Weyland (A5_12, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P16` · door à (1355, 0.50) → Atrium des actionnaires (A5_15, niveau 04). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `ledger` · Déchiffrer le contrat de recherche · x=825, z=0.50. Type : quest.
- `LOG_13` · Clauses · x=320, z=0.50. Type : log.
- `SUP_13` · Réserve de terrain · x=1060, z=0.50. Type : supply.

**Implantation des éléments de décor :**

- `cabinet` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `cabinet` à x=443, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `console` à x=607, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `case` à x=933, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `cart` à x=1097, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `ledger` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_14 — Contrôle de la tour

**Secteur :** La façade blanche. **Niveau :** 04. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** L’opérateur surveille toutes les alimentations sans pouvoir ouvrir une cage manuellement.
**Décor justifié :** Consoles inclinées, écrans superposés, baie serveur et vitrage de contrôle.

**Portes et destinations exactes :**

- `P15` · door à (145, 0.16) → Réception Weyland (A5_12, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P17` · door à (1655, 0.16) → Atrium des actionnaires (A5_15, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P18` · door à (560, 0.16) → Infirmerie du personnel (A5_16, niveau 04). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `control` · Couper l’autorité distante · x=850, z=0.58. Type : quest.
- `LOG_14` · Un ordre humain · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `console` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `server` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `console` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `desk` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `glass` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_05` : Agent de sécurité à (1220, 0.50). Activation : `sécurité de site dès le départ`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `control` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_15 — Atrium des actionnaires

**Secteur :** La façade blanche. **Niveau :** 04. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** La galerie publique cache une archive de direction dans son noyau.
**Décor justifié :** Piliers blancs, plants sous verre, passerelle haute et signalétique minimale.

**Portes et destinations exactes :**

- `P16` · door à (145, 0.16) → Archives du personnel (A5_13, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P17` · door à (1655, 0.16) → Contrôle de la tour (A5_14, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P19` · door à (560, 0.16) → Sas de sécurité N3 (A5_17, niveau 04). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `director` · Copier les archives de direction · x=850, z=0.58. Type : quest.
- `LOG_15` · Les survivants · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `plant` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `glass` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `bench` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `plant` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_06` : Xénomorphe à (1340, 0.70). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `director` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_16 — Infirmerie du personnel

**Secteur :** La façade blanche. **Niveau :** 04. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Les blessures d’acide sont enregistrées comme accidents de maintenance.
**Décor justifié :** Deux brancards, armoire stérile, lampe articulée, scanner et bac clinique.

**Portes et destinations exactes :**

- `P18` · door à (145, 0.50) → Contrôle de la tour (A5_14, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P20` · door à (1355, 0.50) → Sas de sécurité N3 (A5_17, niveau 04). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `medical` · Récupérer le kit étanche · x=825, z=0.50. Type : quest.
- `LOG_16` · Diagnostic · x=320, z=0.50. Type : log.
- `SUP_16` · Réserve de terrain · x=1060, z=0.50. Type : supply.

**Implantation des éléments de décor :**

- `bed` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `cabinet` à x=443, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=607, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `cart` à x=770, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=933, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=1097, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `medical` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_17 — Sas de sécurité N3

**Secteur :** La façade blanche. **Niveau :** 04. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Une batterie d’urgence contrôle l’escalier étanche vers les laboratoires de l’étage 03.
**Décor justifié :** Double porte, douche, coffre à cartes, filtre et hublots rayés.

**Portes et destinations exactes :**

- `P19` · door à (145, 0.50) → Atrium des actionnaires (A5_15, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `P20` · door à (1355, 0.50) → Infirmerie du personnel (A5_16, niveau 04). Verrou : `aucun`. Retour par la même liaison.
- `L2` · stairs à (560, 0.50) → Vestiaire étanche (A5_18, niveau 03). Verrou : `clearance`. Retour par la même liaison.

**Actions situées :**

- `LOG_17` · Seconde porte · x=320, z=0.50. Type : log.
- `SUP_17` · Réserve de terrain · x=1060, z=0.50. Type : supply.

**Implantation des éléments de décor :**

- `locker` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `bench` à x=443, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `vent` à x=607, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `tank` à x=933, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=1097, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :**

- `A5_EN_07` : Xénomorphe à (1160, 0.50). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_18 — Vestiaire étanche

**Secteur :** Les étages de recherche. **Niveau :** 03. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Les combinaisons sont stockées avant le bassin de confinement.
**Décor justifié :** Combinaisons suspendues, bancs, bottes, sas transparent et ventilation.

**Portes et destinations exactes :**

- `P21` · door à (145, 0.50) → Laboratoire submergé (A5_19, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P22` · door à (1355, 0.50) → Salle des prélèvements (A5_20, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `L2` · stairs à (560, 0.50) → Sas de sécurité N3 (A5_17, niveau 04). Verrou : `clearance`. Retour par la même liaison.

**Actions situées :**

- `LOG_18` · Protocole étanche · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `locker` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `bench` à x=443, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `vent` à x=607, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `tank` à x=933, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=1097, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_19 — Laboratoire submergé

**Secteur :** Les étages de recherche. **Niveau :** 03. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le bassin recueille le liquide d’une canalisation rompue ; le sol n’est plus sûr avant la purge.
**Décor justifié :** Cuves, plateforme surélevée, passerelle jaune, câbles hors eau et pompes.

**Portes et destinations exactes :**

- `P21` · door à (145, 0.16) → Vestiaire étanche (A5_18, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P23` · door à (1655, 0.16) → Vivarium expérimental (A5_21, niveau 03). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `drain` · Purger le bassin de rétention · x=850, z=0.58. Type : quest.
- `LOG_19` · Rétention · x=650, z=0.23. Type : log.
- `SUP_19` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `tank` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `glass` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `console` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `machine` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_08` : Xénomorphe à (1370, 0.72). Activation : `breach`. Individu fini ; état de mort conservé.
- `A5_EN_09` : Facehugger à (1150, 0.32). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `drain` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_20 — Salle des prélèvements

**Secteur :** Les étages de recherche. **Niveau :** 03. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Les sérums et fragments sont catalogués avant transfert dans le vivarium.
**Décor justifié :** Microscope, cuve d’échantillonnage, chariot, terminal et tiroirs réfrigérés.

**Portes et destinations exactes :**

- `P22` · door à (145, 0.50) → Vestiaire étanche (A5_18, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P24` · door à (1355, 0.50) → Vivarium expérimental (A5_21, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P25` · door à (560, 0.50) → Conduit de filtration (A5_22, niveau 03). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `specimen` · Analyser la fiche des prélèvements · x=825, z=0.50. Type : quest.
- `LOG_20` · Absence de preuve · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `desk` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `tank` à x=443, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `console` à x=607, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `cart` à x=770, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `glass` à x=933, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `cabinet` à x=1097, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :**

- `A5_EN_10` : Facehugger à (1140, 0.50). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `specimen` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_21 — Vivarium expérimental

**Secteur :** Les étages de recherche. **Niveau :** 03. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Les cages visibles sont reliées à un même circuit de contention.
**Décor justifié :** Cages, hublots épais, pinces de prélèvement, conduites et chambre opaque.

**Portes et destinations exactes :**

- `P23` · door à (145, 0.16) → Laboratoire submergé (A5_19, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P24` · door à (1655, 0.16) → Salle des prélèvements (A5_20, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P26` · door à (560, 0.16) → Centre de confinement (A5_23, niveau 03). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `sample` · Décider du sort de l’échantillon · x=850, z=0.58. Type : quest.
- `LOG_21` · Le tissu · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `cage` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `glass` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `pipe` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `cage` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_11` : Trematode expérimental à (1180, 0.65). Activation : `breach`. Individu fini ; état de mort conservé.
- `A5_EN_12` : Facehugger à (1340, 0.30). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `sample` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_22 — Conduit de filtration

**Secteur :** Les étages de recherche. **Niveau :** 03. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Le conduit dessert le bassin sans traverser les cages.
**Décor justifié :** Grosses hélices, filtre amovible, grilles, sac filtrant et maintenance.

**Portes et destinations exactes :**

- `P25` · door à (145, 0.50) → Salle des prélèvements (A5_20, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P27` · door à (1355, 0.50) → Centre de confinement (A5_23, niveau 03). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `LOG_22` · Griffe sur la grille · x=320, z=0.50. Type : log.
- `SUP_22` · Réserve de terrain · x=1060, z=0.50. Type : supply.

**Implantation des éléments de décor :**

- `vent` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=443, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=607, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `grille` à x=933, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `case` à x=1097, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :**

- `A5_EN_13` : Xénomorphe à (1160, 0.50). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_23 — Centre de confinement

**Secteur :** Les étages de recherche. **Niveau :** 03. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le verrou de confinement coupe la commande à distance et isole le bloc de l’étage 02.
**Décor justifié :** Baies électriques, triple vitrage, retenues arrachées et blindages.

**Portes et destinations exactes :**

- `P26` · door à (145, 0.16) → Vivarium expérimental (A5_21, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `P27` · door à (1655, 0.16) → Conduit de filtration (A5_22, niveau 03). Verrou : `aucun`. Retour par la même liaison.
- `L3` · lift à (560, 0.16) → Palier des gaines (A5_24, niveau 02). Verrou : `quarantine`. Retour par la même liaison.

**Actions situées :**

- `lockdown` · Verrouiller le confinement local · x=850, z=0.58. Type : quest.
- `LOG_23` · Quatre prises · x=650, z=0.23. Type : log.
- `SUP_23` · Réserve de terrain · x=1100, z=0.84. Type : supply.
- `TRAP_23` · Purge de la cellule · x=450, z=0.38. Type : trap.

**Implantation des éléments de décor :**

- `cage` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `server` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `glass` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `resin` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `crate` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `crate` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_14` : Spécimen à quatre bras à (1320, 0.70). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `lockdown` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_24 — Palier des gaines

**Secteur :** Le bloc d’isolement. **Niveau :** 02. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Le palier reçoit les flux d’évacuation du laboratoire situé un étage au-dessus.
**Décor justifié :** Conduits verticaux, traverses, accès de câble et passerelle étroite.

**Portes et destinations exactes :**

- `P28` · door à (145, 0.50) → Chambre des greffes (A5_25, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P29` · door à (1355, 0.50) → Nid de la rétention (A5_26, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `L3` · lift à (560, 0.50) → Centre de confinement (A5_23, niveau 03). Verrou : `quarantine`. Retour par la même liaison.

**Actions situées :**

- `LOG_24` · Drainage · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `pipe` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `cable` à x=443, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `vent` à x=607, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `grille` à x=933, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `resin` à x=1097, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :**

- `A5_EN_15` : Facehugger à (1130, 0.50). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_25 — Chambre des greffes

**Secteur :** Le bloc d’isolement. **Niveau :** 02. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Les tissus et appareils de maintien sont restés en circuit fermé.
**Décor justifié :** Tables expérimentales, sangles, carter ouvert, résine et poches organiques.

**Portes et destinations exactes :**

- `P28` · door à (145, 0.16) → Palier des gaines (A5_24, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P30` · door à (1655, 0.16) → Salle de catalyse (A5_27, niveau 02). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `graft` · Débrancher la table de greffe · x=850, z=0.58. Type : quest.
- `LOG_25` · Interface · x=650, z=0.23. Type : log.
- `SUP_25` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `bed` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `resin` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `cage` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `resin` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_16` : Trematode expérimental à (1260, 0.65). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `graft` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_26 — Nid de la rétention

**Secteur :** Le bloc d’isolement. **Niveau :** 02. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Les captifs proviennent d’une équipe de nettoyage envoyée après la rupture.
**Décor justifié :** Cocons, barreaux noyés dans la résine, passerelle arrachée et drains.

**Portes et destinations exactes :**

- `P29` · door à (145, 0.16) → Palier des gaines (A5_24, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P31` · door à (1655, 0.16) → Salle de catalyse (A5_27, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P32` · door à (560, 0.16) → Four de stérilisation (A5_28, niveau 02). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `rescue` · Libérer la technicienne Miller · x=950, z=0.32. Type : quest.
- `LOG_26` · Miller · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `cocoon` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `resin` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `cocoon` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `pipe` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `resin` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `grille` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_17` : Xénomorphe à (1330, 0.62). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `rescue` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_27 — Salle de catalyse

**Secteur :** Le bloc d’isolement. **Niveau :** 02. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** La commande de chauffe dévie le combustible vers les canaux de stérilisation.
**Décor justifié :** Trois réacteurs, volant de dérivation, collecteur, passerelles et calorifuge.

**Portes et destinations exactes :**

- `P30` · door à (145, 0.16) → Chambre des greffes (A5_25, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P31` · door à (1655, 0.16) → Nid de la rétention (A5_26, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P33` · door à (560, 0.16) → Répartiteur de crise (A5_29, niveau 02). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `heat` · Dériver la chauffe du four · x=850, z=0.58. Type : quest.
- `LOG_27` · La dérivation · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `boiler` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `pipe` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `machine` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `console` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `tank` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_18` : Xénomorphe à (1300, 0.60). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `heat` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_28 — Four de stérilisation

**Secteur :** Le bloc d’isolement. **Niveau :** 02. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le four est séparé de la zone de vie par des volets coupe-feu.
**Décor justifié :** Bouche réfractaire, bennes de résidus, bras hydraulique et protections thermiques.

**Portes et destinations exactes :**

- `P32` · door à (145, 0.16) → Nid de la rétention (A5_26, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P34` · door à (1655, 0.16) → Répartiteur de crise (A5_29, niveau 02). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `burn` · Lancer la stérilisation du bloc · x=850, z=0.58. Type : quest.
- `LOG_28` · Destruction · x=650, z=0.23. Type : log.
- `SUP_28` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `furnace` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `machine` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `tank` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `lamp` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `crate` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_19` : Xénomorphe à (1260, 0.75). Activation : `breach`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `burn` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_29 — Répartiteur de crise

**Secteur :** Le bloc d’isolement. **Niveau :** 02. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** La cage de secours remonte du bloc 02 à la couronne 08 sans desservir les bureaux.
**Décor justifié :** Pupitre sécurisé, câble d’acier, cylindres hydrauliques et porte d’ascenseur.

**Portes et destinations exactes :**

- `P33` · door à (145, 0.50) → Salle de catalyse (A5_27, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `P34` · door à (1355, 0.50) → Four de stérilisation (A5_28, niveau 02). Verrou : `aucun`. Retour par la même liaison.
- `L4` · lift à (560, 0.50) → Ascenseur de la couronne (A5_30, niveau 08). Verrou : `sterilized`. Retour par la même liaison.

**Actions situées :**

- `LOG_29` · Accès de crise · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `machine` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `rail` à x=443, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=607, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=770, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=933, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1097, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_30 — Ascenseur de la couronne

**Secteur :** La couronne d’amarrage. **Niveau :** 08. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le palier abrite la sortie du monte-charge de crise.
**Décor justifié :** Moteurs, contreforts, bâches, console météo et caisse d’outils.

**Portes et destinations exactes :**

- `P35` · door à (145, 0.16) → Bras d’amarrage (A5_31, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P36` · door à (1655, 0.16) → Réserve des charges (A5_32, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `L4` · lift à (560, 0.16) → Répartiteur de crise (A5_29, niveau 02). Verrou : `sterilized`. Retour par la même liaison.

**Actions situées :**

- `LOG_30` · Météo · x=650, z=0.23. Type : log.
- `SUP_30` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `machine` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `rail` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_20` : Xénomorphe à (1330, 0.65). Activation : `sterilized`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_31 — Bras d’amarrage

**Secteur :** La couronne d’amarrage. **Niveau :** 08. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Une plateforme de levage supporte la voie d’accès au hangar ; ses attaches sont destructibles.
**Décor justifié :** Trois culées, bornes d’arrimage, poutres, treuils et contrepoids.

**Portes et destinations exactes :**

- `P35` · door à (145, 0.16) → Ascenseur de la couronne (A5_30, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P37` · door à (1655, 0.16) → Antenne de diffusion (A5_33, niveau 08). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `anchor_a` · Armer l’attache ouest · x=330, z=0.64. Type : quest.
- `anchor_b` · Armer l’attache centrale · x=930, z=0.64. Type : quest.
- `anchor_c` · Armer l’attache est · x=1440, z=0.64. Type : quest.
- `detonate` · Rompre le bras d’amarrage · x=665, z=0.20. Type : quest.
- `LOG_31` · Trois attaches · x=650, z=0.23. Type : log.
- `SUP_31` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `bollard` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `rail` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `lamp` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `crate` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `pipe` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_21` : Reine de la couronne à (1630, 0.50). Activation : `charges`. Individu fini ; état de mort conservé.

**État et retour :** les jalons `anchor_a`, `anchor_b`, `anchor_c`, `detonate` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_32 — Réserve des charges

**Secteur :** La couronne d’amarrage. **Niveau :** 08. **Vue :** couloir latéral. **Largeur logique :** 1500.

**Fonction :** Les charges de démolition servent au désassemblage des bras d’amarrage.
**Décor justifié :** Râteliers fermés, malle ignifugée, coffret de commande et établi.

**Portes et destinations exactes :**

- `P36` · door à (145, 0.50) → Ascenseur de la couronne (A5_30, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P38` · door à (1355, 0.50) → Antenne de diffusion (A5_33, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P39` · door à (560, 0.50) → Piste d’envol (A5_34, niveau 08). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `charges` · Prendre les charges d’arrimage · x=825, z=0.50. Type : quest.
- `LOG_32` · Charges civiles · x=320, z=0.50. Type : log.

**Implantation des éléments de décor :**

- `locker` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `crate` à x=443, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `bench` à x=607, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `case` à x=770, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=933, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `lamp` à x=1097, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `charges` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_33 — Antenne de diffusion

**Secteur :** La couronne d’amarrage. **Niveau :** 08. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Le relais public possède un accès indépendant du réseau de la tour.
**Décor justifié :** Mât, paraboles, caisson électrique, isolateurs et antennes de secours.

**Portes et destinations exactes :**

- `P37` · door à (145, 0.16) → Bras d’amarrage (A5_31, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P38` · door à (1655, 0.16) → Réserve des charges (A5_32, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P40` · door à (560, 0.16) → Hangar d’extraction (A5_35, niveau 08). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `broadcast` · Transmettre les preuves · x=850, z=0.58. Type : quest.
- `LOG_33` · Fréquence publique · x=650, z=0.23. Type : log.

**Implantation des éléments de décor :**

- `antenna` à x=280, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `console` à x=493, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `cable` à x=707, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `machine` à x=920, z=-0.10 ; largeur 90, hauteur de référence 90 ; implantation de mur hors circulation.
- `lamp` à x=1133, z=-0.10 ; largeur 115, hauteur de référence 112 ; implantation de mur hors circulation.
- `rail` à x=1347, z=-0.10 ; largeur 140, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `broadcast` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_34 — Piste d’envol

**Secteur :** La couronne d’amarrage. **Niveau :** 08. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** Une voie de roulage longe la tour ; les balises restent alimentées sur batterie.
**Décor justifié :** Balises, pare-vent, barrières, caniveau, éclairage et carburant.

**Portes et destinations exactes :**

- `P39` · door à (145, 0.16) → Réserve des charges (A5_32, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P41` · door à (1655, 0.16) → Hangar d’extraction (A5_35, niveau 08). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `LOG_34` · Balises · x=650, z=0.23. Type : log.
- `SUP_34` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `bollard` à x=280, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `lamp` à x=493, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=707, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `cable` à x=920, z=-0.10 ; largeur 115, hauteur de référence 90 ; implantation de mur hors circulation.
- `crate` à x=1133, z=-0.10 ; largeur 140, hauteur de référence 112 ; implantation de mur hors circulation.
- `rail` à x=1347, z=-0.10 ; largeur 90, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :**

- `A5_EN_22` : Xénomorphe à (1400, 0.75). Activation : `charges`. Individu fini ; état de mort conservé.

**État et retour :** les dossiers et les réserves restent collectés après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

### A5_35 — Hangar d’extraction

**Secteur :** La couronne d’amarrage. **Niveau :** 08. **Vue :** latérale avec profondeur jouable. **Largeur logique :** 1800.

**Fonction :** La navette attend derrière le sas atmosphérique, accessible depuis la piste et le bras.
**Décor justifié :** Navette, rampe, chariot à bagages, pylônes d’énergie et crochet.

**Portes et destinations exactes :**

- `P40` · door à (145, 0.16) → Antenne de diffusion (A5_33, niveau 08). Verrou : `aucun`. Retour par la même liaison.
- `P41` · door à (1655, 0.16) → Piste d’envol (A5_34, niveau 08). Verrou : `aucun`. Retour par la même liaison.

**Actions situées :**

- `extract` · Rejoindre la navette · x=1120, z=0.50. Type : quest.
- `LOG_35` · Inventaire de départ · x=650, z=0.23. Type : log.
- `SUP_35` · Réserve de terrain · x=1100, z=0.84. Type : supply.

**Implantation des éléments de décor :**

- `ship` à x=280, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `machine` à x=493, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `crate` à x=707, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `cable` à x=920, z=-0.10 ; largeur 140, hauteur de référence 90 ; implantation de mur hors circulation.
- `lamp` à x=1133, z=-0.10 ; largeur 90, hauteur de référence 112 ; implantation de mur hors circulation.
- `tank` à x=1347, z=-0.10 ; largeur 115, hauteur de référence 134 ; implantation de mur hors circulation.
- `resin` à x=420, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.
- `resin` à x=1350, z=0.82 ; largeur 115, hauteur de référence 58 ; obstacle opaque et solide.

**Présences causales :** aucune menace hostile ajoutée à cette pièce. Pas de vague générée pour remplir artificiellement le lieu.

**État et retour :** les jalons `extract` restent accomplis après sortie et sauvegarde. Les portails restent identiques ; aucune re-randomisation des décors ou ennemis.
**Contrôle qualité de la fiche :** références croisées de portes, limites x/z, absence d’obstacle sur le point d’arrivée et cohérence des identifiants contrôlées automatiquement. Le parcours de toutes les salles avec les accès ouverts est vérifié ; la lecture esthétique et le temps de traversée restent à valider par jeu manuel.

## 8. Direction visuelle et sonore livrée

Le renderer exécute des formes distinctes pour les cuves, chaudières, consoles, lits, plantes, armoires, cages, fours, antennes, navette et résine. Les murs, structures, volumes, plans de sol, personnages et obstacles sont séparés. Les extérieurs affichent une ville en plusieurs vitesses de parallaxe ; les salles utilisent des panneaux, tuyaux, poutres et éclairages. Les pieds suivent un même plan de projection.

Le HUD principal se situe au-dessus et au-dessous du cadre jouable. Le journal et la carte suspendent le jeu au lieu de masquer la scène pendant un combat. Les transmissions sont fermables. Le menu titre masque les commandes tactiles, le HUD de combat et la bande d’aide. Les scènes ne s’appuient sur aucune image de film placée comme un fond unique.

La limite est visible : ce sont des formes vectorielles stylisées de prototype. Les silhouettes ne sont pas des reproductions 1:1 des recherches de production et les kits structurels sont encore répétés. Les 260 placements ne signifient pas 260 modèles artistiques uniques. Les images originales d’artistes ne sont pas incluses dans le paquet.

Le son est facultatif : impulsions de tir, signal d’interface et dégâts sont synthétisés via Web Audio après activation utilisateur. Aucune musique, voix de comédien, citation audio ou bruitage de film n’est intégré. Une ambiance continue mixée, l’occlusion acoustique, les voix et les sous-titres synchronisés sur des prises vocales restent à produire.

## 9. Architecture technique et sauvegarde

`game/data.js` / `data.json` : campagne, graphe, rôles, placements et sources. `core.js` : simulation pure testable sans DOM. `render.js` : rendu Canvas. `ui.js` : entrées, fenêtres, cartes, fichiers et son. `style.css` : interface adaptative. `tools/build_standalone.py` réunit les sources sans dépendance de réseau.

Le schéma exporté contient format, version, état courant et point de contrôle. L’import refuse un autre format, une version différente, une suite de jalons désordonnée, un lieu inconnu, un registre d’ennemis incomplet ou des identifiants incorrects. Les valeurs numériques sont bornées et les drapeaux de progression sont dérivés des jalons. Le contenu textuel de la sauvegarde n’est jamais évalué comme du JavaScript.

La clé de sauvegarde est `atf.alien5.lazare.v1`. Aucun `localStorage.clear()` n’est appelé. Le lanceur ne lit pas l’état natif du Tantalus. À ce stade, les récompenses, dossiers MIRE et résultats ne sont pas transférés à ses catalogues. La fiche d’intégration ne prétend pas le contraire.

## 10. Statut des validations

Les rapports JSON donnent le résultat réellement exécuté. Le moteur est contrôlé sans DOM, le parcours des jalons avec invulnérabilité de test, les combats dans des scénarios distincts. L’installateur est testé sur de petites fixtures de menu. La vérification visuelle exécute le vrai renderer dans Chromium avec document local injecté en mémoire.

Les navigations locales HTTP et file ont été refusées par l’environnement. Aucune restriction n’a été modifiée. La logique de stockage a été testée avec un substitut explicite ; un autre cas vérifie la gestion du refus natif. Il reste à vérifier une partie normale dans un navigateur utilisateur, la persistance native après fermeture / réouverture, les périphériques physiques, les performances et le build du Tantalus entier.

## 11. Prochaines priorités de production — non livrées

1. Fusion native avec la version cumulative effective des autres DLC : catalogues MIRE, routage, retours au hub, migrations et service worker, avec régression de chaque DLC.
2. Remplacer le rendu de prototype par des assets dédiés : héros, menaces, props et décors séparés, avec silhouettes et échelles revues contre les sources autorisées.
3. Individualiser les pièces : masses de salle, portes latérales crédibles, passerelles et ascenseurs animés, distribution des accessoires, éclairage et lignes de fuite par niveau.
4. Transformer les transmissions en scènes : déplacements des interlocuteurs, escortes physiques, poursuites inter-pièces et chute finale réellement animée, sans ajouter de prétendues scènes authentifiées.
5. Parcours manuel complet sur plusieurs profils : survie / récit, collecte minimale / complète, munitions épuisées, retours tardifs, sauvegarde avant chaque crise, clavier et manette. Mesurer la durée et l’équilibrage plutôt que les annoncer arbitrairement.
