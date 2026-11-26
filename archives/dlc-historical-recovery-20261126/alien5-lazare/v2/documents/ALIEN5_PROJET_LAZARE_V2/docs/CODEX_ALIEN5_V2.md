# ALIEN 5 — PROJET LAZARE
## Les survivants de Calder

**Version 1.1.0-candidate.1 · continuation V2 · 29 septembre 2026**

Ce document décrit le jeu contenu dans ce paquet, pas une promesse de fonctionnalités. La campagne de 36 lieux et 27 objectifs est conservée ; cette passe porte sur les compagnons, les interventions techniques, la lisibilité et la différenciation des salles. Le module demeure autonome. Aucun moteur natif de Tantalus n’a été fusionné et aucun déploiement n’a été exécuté.

### Une adaptation, pas un scénario retrouvé

Calder, le programme Lazare, les raccords de l’enquête, les dialogues, la topologie et les fins sont des créations de ce jeu. Le corpus de concepts et le témoignage de production recensés dans la V1 restent ses références. Aucun scénario intégral authentifié de Neill Blomkamp n’a été obtenu dans cette passe. Aucune nouvelle découverte scénaristique n’est revendiquée. Les recherches artistiques d’**Alien 5** ne constituent pas un plan de campagne validé par la production.

Le point de divergence reste une continuité alternative après *Aliens*. Cette branche n’efface pas les campagnes *Alien 3* et *Resurrection*, ni la progression de Tantalus. L’appellation MIRE indique ici une campagne séparée, non une intégration déjà terminée au registre natif du jeu principal.

### Ce qui a réellement changé

Hicks existe comme acteur mobile avec santé et munitions propres. Il suit Ripley, tient une position ou cesse le feu. Miller n’est plus considérée comme évacuée au simple choix de la libérer : une nouvelle partie V2 doit la conduire au sas médical. Les interactions techniques prennent du temps et peuvent être interrompues. Dix circuits d’éclairage, quatre dérivations de vapeur, trois dotations et un sas médical fonctionnent et conservent leur état.

Les 36 salles disposent d’un profil architectural et d’un assemblage d’objets distincts. Les 310 instances de décor et les 44 obstacles physiques ne doivent pas être présentés comme 354 images uniques. Les formes sont réutilisées comme dans une bibliothèque de pièces, avec des proportions et des placements propres aux fonctions des lieux. Cette livraison est toujours un rendu vectoriel programmatique stylisé, pas un jeu photoréaliste ni une reproduction 1:1 des concepts.

## Règles de circulation et de visibilité

Les pièces larges offrent une profondeur réelle de jeu ; les passages étroits contraignent la circulation latérale. Les connexions sont réciproques et nommées. Les ascenseurs et escaliers représentent des changements de pièce et d’étage après une courte action : ils ne simulent pas encore une cabine parcourant une gaine en continu. La carte est un graphe des accès, pas un relevé architectural à l’échelle.

Le moteur travaille sur un cadre logique de 1280 × 720, dessiné dans une surface Canvas de 1920 × 1080. La pièce mesure 1500 ou 1800 unités en largeur. La profondeur est normalisée ; la navigation utilise 330 unités pour une amplitude complète et le dessin place les pieds à `455 + z × 200`. Les objets solides ont une emprise distincte de leur illustration. Cette convention n’est pas une conversion certifiée en mètres. Les hauteurs indicatives de la direction artistique ne prétendent pas être des mesures issues du film.

Dans les salles à profondeur, les deux obstacles physiques se trouvent principalement dans la bande avant ; ils laissent les approches arrière et centrales libres. Les mouvements sont décomposés en petits pas pour empêcher de traverser une caisse en une seule mise à jour. Les lignes de tir utilisent une intersection segment/emprise, y compris pour les trajectoires presque verticales. Le compagnon et les ennemis mobiles utilisent des chemins passant autour des emprises solides. Les décorations derrière le chemin ou sur la bordure avant ne créent pas de collision cachée.

Le décor remplit le cadre dès le bord supérieur. Les horizons ont des facteurs de parallaxe 0,045 / 0,12 / 0,195 ; le bâtiment lointain 0,145 ; les parois distantes 0,14 ; les structures intermédiaires 0,36 ; les objets et acteurs 1 ; la bordure avant 1,055. Ces couches sont employées selon l’architecture de la salle : une pièce intérieure n’affiche pas artificiellement tous les horizons extérieurs. Les plaques de service sont accrochées à une structure ; la normalisation V2 limite notamment la taille des horloges, casques, lits, meubles et instruments médicaux.

Les silhouettes, équipements, pupitres et portes restent des objets séparés dans le rendu. Aucun tableau conceptuel plein écran ne remplace le niveau. Les transitions animent le panneau d’accès ; les escaliers possèdent un dessin de marches et les ascenseurs un indicateur d’étage. La petite ouverture conservée après une visite est un état visuel, pas un passage automatique à travers une porte.

## L’équipe sur le terrain

### Ripley

Le joueur contrôle toujours Ripley. Ses deux armes, ses réserves, ses soins, son leurre et ses décisions appartiennent à la campagne. Les entrées ZQSD, WASD ou flèches utilisent les mêmes contraintes. La marche silencieuse ralentit l’approche et réduit la détection du joueur ; les tirs doivent être alignés sur le bon plan. Le feu repousse les menaces compatibles, mais ne remplace pas les objectifs environnementaux de la fin.

`E` commence une action à portée. Marcher, tirer, subir un dommage effectif ou utiliser de nouveau `E` l’interrompt. Une porte normale demande 0,7 seconde, un escalier 1,2, un ascenseur 1,65. Les charges demandent 2,4 secondes. L’avancement d’une intervention interrompue n’est pas conservé : il faut recommencer. Une partie exportée pendant le travail ne reprend pas un dispositif à moitié validé.

### Hicks

Hicks commence avec 100 points de santé et 96 cartouches. Il dispose d’un tir distinct de celui de Ripley. L’ordre **Suivre** le déplace derrière elle et autorise le combat. **Couvrir** l’arrête sur place tout en conservant le tir. **Attendre** le laisse sur place sans engager les ennemis. `C` parcourt ces trois ordres ; le menu Équipe permet une sélection explicite.

Chaque balle consomme une cartouche. Le délai entre ses tirs est de 0,78 seconde ; le tir requiert une menace à moins de 610 unités, un écart de profondeur inférieur à 0,13 et une ligne de vue dégagée. Les dégâts ordinaires sont 22 ; la reine n’est que contenue par les tirs. `G` transfère jusqu’à 16 cartouches depuis la réserve du joueur, sous condition de proximité. Ce n’est pas une réserve gratuite. Les dotations spécifiquement ramassées peuvent fournir leur recharge prédéfinie lorsqu’il se trouve dans la même pièce.

Hicks n’apparaît pas magiquement à chaque porte. Il ne suit que s’il est debout, en ordre Suivre, dans la même pièce, à moins de 285 unités et avec un segment d’approche libre. À défaut, son emplacement est conservé et annoncé. Il faut retourner le chercher. Il peut être touché par un ennemi, par le sang acide ou par la vapeur. À zéro santé il reste au sol ; un soin consommé à proximité peut le remettre debout. La campagne principale reste possible même si l’équipe n’est pas sauvée intégralement.

### Miller

Le choix de libérer Miller crée une partenaire non armée dans le nid de rétention. Elle commence avec 60 points de santé, marche moins vite que Hicks et conserve sa pièce réelle. Le parcours de sauvetage relie le nid, la catalyse et le répartiteur de crise. Le sas médical n’accepte une évacuation que si Miller est debout, dans la pièce, active et à moins de 270 unités du dispositif. L’opération prend deux secondes. L’état évacué est ensuite sauvegardé et modifie le bilan.

Une partie **V1 importée** qui avait déjà choisi de la sauver conserve l’évacuation narrative acquise dans cette version. Elle n’est pas rétroactivement renvoyée au nid. Dans une nouvelle partie V2, la libération seule ne suffit plus. Le scénario de test d’escorte traverse réellement les portes par les entrées de déplacement du moteur, dans une copie de test sans ennemis actifs ; cela isole la navigation, pas l’équilibrage de cette mission sous combat.

### Soins, séparations et bilan

L’action de soin apparaît pour Hicks sous 65 points, et Miller sous 40. Elle dure 1,4 seconde, consomme un soin et ajoute jusqu’à 55 points sans dépasser le maximum du personnage. Elle nécessite une proximité effective au moment de sa résolution. Un allié séparé ne peut être soigné à distance. Le bilan final vérifie la situation de Miller et la présence de Hicks au hangar, au lieu d’annoncer systématiquement qu’ils sont à bord.

Newt demeure une liaison narrative et une présence dans les scènes d’accueil et de départ. Jax demeure le contact radio et le relais d’évacuation. Cette livraison n’ajoute ni alternance de protagoniste, ni troisième compagnon combattant, ni cinématique doublée.

## Équipements techniques persistants

### Circuits d’éclairage

Dix pièces permettent de couper ou de rétablir leurs plafonniers. L’éclairage de sécurité reste visible. Le circuit éteint multiplie la portée visuelle d’un garde par 0,48 et celle des autres menaces par 0,76. L’ouïe n’est pas désactivée. Un tir de Hicks peut donc trahir une approche silencieuse : l’ordre Attendre a une conséquence pratique. La torche de Ripley est commandée séparément par `L` ; son état est sauvegardé. Son cône est visuel dans cette passe et ne constitue pas un nouveau test de détection par faisceau.

### Vapeur

Quatre dérivations produisent un danger périodique : 1,7 seconde de sortie sur un cycle de 5,2 secondes, avec un décalage de phase propre à la salle. La vanne correspondante ferme le circuit ; le rouvrir réactive ce danger. La vapeur inflige 7 points bruts au contact, modulés par la difficulté et par les fenêtres d’invulnérabilité. Les points de sortie sont balisés dans le monde, et l’animation consulte le même état que les dégâts.

### Dotations et sas médical

Trois coffres supplémentaires ont un état consommé : ils donnent 32 cartouches de réserve, un soin et, si Hicks est dans la pièce, 24 cartouches pour lui, dans les limites des stocks. Leur ouverture ne peut pas être répétée après une sauvegarde/reprise. Le sas médical n’est pas un distributeur de soins : il sert uniquement à l’évacuation de Miller. Toutes les commandes techniques sont listées dans les fiches de pièces ci-dessous.

## Interface et sauvegarde

Le champ de jeu reste séparé des informations : transmissions, invite d’action, notifications et barre de travail figurent sous l’image. Le HUD inférieur affiche santé, arme, munitions ou carburant, objectif, état de Hicks et temps. Le texte long d’une transmission peut être relu dans le journal. Les menus suspendent le moteur et le compte à rebours ; un changement de focus ouvre une pause. Les contrôles tactiles restent eux aussi hors de l’image.

Le stockage V2 utilise `atf.alien5.lazare.v2`. En l’absence d’une sauvegarde V2, la version V1 peut être détectée avec `atf.alien5.lazare.v1`. La reprise crée une copie normalisée V2 sans réécrire l’ancienne clé. L’import accepte uniquement le format `ATF_ALIEN5_LAZARE` de version 1 ou 2, valide les identifiants, filtre les états inconnus et normalise les positions et valeurs. Les ressources, choix, menaces, pièces, compagnons, circuits, dotations et points de contrôle sont exportés en JSON.

Le refus de stockage n’est pas masqué : Pause permet toujours d’exporter une copie. Une sauvegarde locale dépend de l’origine et des permissions du navigateur ; changer de fichier ou de site peut changer son compartiment. L’export/import reste le moyen prudent de transférer une opération. Les tests de cette livraison vérifient un aller-retour avec un substitut explicite de stockage et testent séparément le refus natif. Ils ne certifient pas une conservation native après fermeture du navigateur.

## Campagne conservée et interventions

L’ordre des 27 objectifs est préservé. Les noms de lieux et les dialogues ci-dessous sont des écritures du jeu. Les choix d’échantillon, d’émission et de Miller ne sont pas attribués à un scénario de film retrouvé. Chaque jalon requiert les précédents ; l’archive facultative d’une pièce ne remplace pas son objectif principal.

### 01. Les noms rayés

Calder. Un ordre de transfert porte trois noms qui auraient dû rester oubliés.

**Écouter le message de Jax** — Quai d’approche (`A5_00`). Point d’action : x 850, profondeur 0.58. Prérequis : début. État validé : briefed. Temps technique de référence : 0.8 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Jax : « J’ai un ordre de transfert. Ripley. Hicks. Jorden. Vos noms, et la date de demain. »

**Récupérer le sceau de fret** — Poste de fret (`A5_03`). Point d’action : x 825, profondeur 0.5. Prérequis : brief. État validé : key_freight. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Ils ont des cages assez grandes pour un véhicule. Pourquoi leur faut-il mon dossier médical ? »

### 02. Une ville qui travaille

Le convoi n’emportait pas du minerai. Quelqu’un a tenté de prévenir les quais.

**Rétablir le relais des quais** — Gare suspendue (`A5_04`). Point d’action : x 850, profondeur 0.58. Prérequis : freight. État validé : signal. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « La dernière émission vient des laboratoires. Pas des bureaux. Quelqu’un a coupé la réponse. »

**Ouvrir le refuge aux dockers** — Refuge des transitaires (`A5_01`). Point d’action : x 825, profondeur 0.5. Prérequis : signal. État validé : shelter. Temps technique de référence : 0.8 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « Les dockers entrent au refuge. Jorden reste avec eux. Hicks, nous prenons les ateliers. »

### 03. La relève ne viendra pas

Le dernier quart est entré dans la tour. Personne n’en est sorti.

**Réarmer le groupe auxiliaire** — Chaufferie centrale (`A5_09`). Point d’action : x 850, profondeur 0.58. Prérequis : shelter. État validé : power. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « Le groupe tient. Maintenant on coupe leur chaîne, pas l’air que respirent les ouvriers. »

**Immobiliser le convoi scellé** — Chaîne des conteneurs (`A5_07`). Point d’action : x 850, profondeur 0.58. Prérequis : generator. État validé : conveyor. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Une cage vide. Ses attaches ont fondu de l’intérieur. Personne ne charge la suivante. »

### 04. Le dernier service

Les ateliers alimentent autre chose que des chaînes de montage.

**Lire le registre des équipes** — Bureau des équipes (`A5_08`). Point d’action : x 825, profondeur 0.5. Prérequis : conveyor. État validé : roster. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Ils ont écrit « réaffectés ». Trente-deux fois. Les familles n’ont reçu que ce mot. »

**Armer le monte-charge M2** — Monte-charge M2 (`A5_11`). Point d’action : x 850, profondeur 0.58. Prérequis : roster. État validé : lift_ready. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Jax : « Je garde le canal ouvert. Au-dessus, ils auront déjà reçu votre signalement. »

### 05. Des murs sans fenêtres

Au-dessus de la suie, tout est blanc. Même les rapports d’accident.

**Déchiffrer le contrat de recherche** — Archives du personnel (`A5_13`). Point d’action : x 825, profondeur 0.5. Prérequis : lift. État validé : ledger. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Ce ne sont pas des prélèvements de routine. Ils ont payé pour que les dossiers disparaissent. »

**Couper l’autorité distante** — Contrôle de la tour (`A5_14`). Point d’action : x 850, profondeur 0.58. Prérequis : ledger. État validé : breach. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « Ils viennent de lâcher les verrous du vivarium. Quelqu’un préfère perdre l’étage que nous parler. »

### 06. Le prix du silence

La direction a conservé les survivants comme des variables de laboratoire.

**Copier les archives de direction** — Atrium des actionnaires (`A5_15`). Point d’action : x 850, profondeur 0.58. Prérequis : control. État validé : clearance. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Nous ne sommes pas leurs échantillons. Copie tout. Les noms des équipes aussi. »

**Récupérer le kit étanche** — Infirmerie du personnel (`A5_16`). Point d’action : x 825, profondeur 0.5. Prérequis : director. État validé : suit. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Ce kit est prévu pour les brûlures d’acide. Ils savaient exactement ce qui pouvait arriver. »

### 07. Une autre espèce de cage

Le bassin a cédé. Ce qui nage entre les consoles n’était pas prévu sur les plans.

**Analyser la fiche des prélèvements** — Salle des prélèvements (`A5_20`). Point d’action : x 825, profondeur 0.5. Prérequis : medical. État validé : specimen. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Un tissu qui réagit n’est pas une preuve de contrôle. Ils ont confondu les deux. »

**Purger le bassin de rétention** — Laboratoire submergé (`A5_19`). Point d’action : x 850, profondeur 0.58. Prérequis : specimen. État validé : drained. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « La passerelle tient encore. Les pompes ont besoin du groupe de l’usine. Restez hors du câble nu. »

### 08. La mémoire de la chair

Un organisme expérimental réagit aux échantillons. Il ne reconnaît aucun maître.

**Décider du sort de l’échantillon** — Vivarium expérimental (`A5_21`). Point d’action : x 850, profondeur 0.58. Prérequis : drain. État validé : sample_decided. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Une seule ampoule. Une seule excuse pour recommencer. On choisit maintenant. »

**Verrouiller le confinement local** — Centre de confinement (`A5_23`). Point d’action : x 850, profondeur 0.58. Prérequis : sample. État validé : quarantine. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Leur commande est morte. Le bloc est isolé. Ce qui reste en dessous ne recevra plus rien. »

### 09. Ce qui tient les murs

La résine cache une équipe entière. Un mouvement répond à la lampe.

**Débrancher la table de greffe** — Chambre des greffes (`A5_25`). Point d’action : x 850, profondeur 0.58. Prérequis : lockdown. État validé : graft. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Ce n’était pas une protection. C’était un autre moyen de rester près d’eux. »

**Libérer la technicienne Miller** — Nid de la rétention (`A5_26`). Point d’action : x 950, profondeur 0.32. Prérequis : graft. État validé : miller. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « Je peux marcher. Lentement. Il y a un sas médical au répartiteur de crise… ne me laissez pas ici. »

### 10. La machine à effacer

Le four peut rompre le cycle. Il peut aussi effacer les preuves.

**Dériver la chauffe du four** — Salle de catalyse (`A5_27`). Point d’action : x 850, profondeur 0.58. Prérequis : rescue. État validé : heat. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Les canaux rejoignent la rétention. Si les volets ferment, la chaleur ne remontera pas vers les logements. »

**Lancer la stérilisation du bloc** — Four de stérilisation (`A5_28`). Point d’action : x 850, profondeur 0.58. Prérequis : heat. État validé : sterilized. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Fermez le retour. Cette fois, ils ne garderont rien dans les cendres. »

### 11. Plus personne ne commande

Il reste une antenne, une navette et une voie d’accès déjà condamnée.

**Prendre les charges d’arrimage** — Réserve des charges (`A5_32`). Point d’action : x 825, profondeur 0.5. Prérequis : burn. État validé : charges. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « Pas assez pour la tour. Assez pour les attaches du bras. On lui enlève le sol sous les pieds. »

**Transmettre les preuves** — Antenne de diffusion (`A5_33`). Point d’action : x 850, profondeur 0.58. Prérequis : charges. État validé : broadcast. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Je peux envoyer tout le dossier, ou seulement l’ordre d’évacuation. Le réseau ne nous laissera pas deux essais. »

### 12. Ce qu’on emporte

La reine a rejoint la couronne. Les attaches du bras restent accessibles.

**Armer l’attache ouest** — Bras d’amarrage (`A5_31`). Point d’action : x 330, profondeur 0.64. Prérequis : broadcast. État validé : anchor_a. Temps technique de référence : 2.4 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Hicks : « Première attache armée. Ne restez pas au milieu du bras. »

**Armer l’attache centrale** — Bras d’amarrage (`A5_31`). Point d’action : x 930, profondeur 0.64. Prérequis : anchor_a. État validé : anchor_b. Temps technique de référence : 2.4 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « La deuxième tient. Jax, ouvrez la rampe. Personne ne revient chercher du matériel. »

**Armer l’attache est** — Bras d’amarrage (`A5_31`). Point d’action : x 1440, profondeur 0.64. Prérequis : anchor_b. État validé : anchor_c. Temps technique de référence : 2.4 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Jax : « Rampe ouverte. Je ne ferme pas tant que je vous vois dehors. »

**Rompre le bras d’amarrage** — Bras d’amarrage (`A5_31`). Point d’action : x 665, profondeur 0.2. Prérequis : anchor_c. État validé : queen_down. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Ripley : « Maintenant. »

**Rejoindre la navette** — Hangar d’extraction (`A5_35`). Point d’action : x 1120, profondeur 0.5. Prérequis : detonate. État validé : complete. Temps technique de référence : 1.45 s ; les choix ouvrent une décision plutôt qu’une attente automatique.

> Newt : « Les portes sont fermées. Cette fois, nous décidons de ce qui voyage avec nous. »

## Menaces et sorties sans impasse

Les six types sont conservés. Les gardes visent l’équipe selon visibilité et proximité. Les ennemis mobiles contournent les objets solides ; les organismes ancrés restent ancrés. Les statistiques ci-dessous sont des paramètres de jeu. Elles ne constituent pas une taille biologique canonique ni une fiche de production.

| Type | Santé | Vitesse | Dégâts | Portée | Population |
|---|---|---|---|---|---|
| Agent de sécurité | 62 | 70 | 9 | 440 | 6 |
| Xénomorphe | 86 | 118 | 16 | 48 | 9 |
| Facehugger | 24 | 140 | 13 | 42 | 4 |
| Trematode expérimental | 115 | 0 | 18 | 130 | 2 |
| Spécimen à quatre bras | 225 | 93 | 24 | 76 | 1 |
| Reine de la couronne | 650 | 68 | 28 | 100 | 1 |


### Agent de sécurité

Patrouille courte, enquête sur le bruit, tir après acquisition visuelle ; obstacles opaques respectés.

**Provenance de l’interprétation :** Original : personnel chargé de verrouiller le fret.

### Xénomorphe

Enquête sur bruit ; accélère vers une cible visible ; attaque rapprochée ; recul face au feu ; sang acide à la mort.

**Provenance de l’interprétation :** Archétype de la franchise ; présence et comportement précis originaux.

### Facehugger

Rapide et bas ; bond télégraphié à portée ; détruit par tir ou flamme ; pas de ponte infinie.

**Provenance de l’interprétation :** Archétype de la franchise ; placements originaux en vivarium.

### Trematode expérimental

Organisme ancré ; palpe son périmètre ; rétraction à la flamme. Aucun cycle de vie canonique inventé.

**Provenance de l’interprétation :** Nom présent dans les concepts de Thoorens ; anatomie de jeu simplifiée et règles originales.

### Spécimen à quatre bras

Individu unique du centre de confinement ; approche lente et longue préparation de frappe. Combat ou purge thermique de sa cellule ; le levier offre une issue même sans munitions.

**Provenance de l’interprétation :** Inspiration des recherches de production discutées par studioADI ; rencontre originale.

### Reine de la couronne

Rencontre unique ; les tirs la font reculer mais ne la tuent pas. Trois attaches puis commande de rupture ; dégâts environnementaux décisifs.

**Provenance de l’interprétation :** Reine évoquée dans les concepts ; cet individu et cette fin sont une adaptation originale.

La purge du centre de confinement constitue une sortie prévue même sans munitions contre le spécimen à quatre bras. La reine, à l’inverse, exige les trois attaches puis la rupture du bras : tirer ne permet pas d’ignorer la séquence. La commande finale a priorité sur l’archive voisine, correction qui évite qu’un pupitre facultatif vole l’interaction pendant la fuite.

## Fiches de production des 36 lieux

Les valeurs de chaque fiche proviennent des données réellement chargées par le jeu. `mid` indique le décor arrière assemblé, `foreground` la bordure non praticable, `play` une emprise du chemin. Les dessins ont leur propre silhouette : la taille w/h décrit l’enveloppe d’art utilisée et non une collision implicite. Les 44 emprises solides sont indiquées séparément. Les positions des portes sont propres à chaque côté de la liaison ; aucun téléporteur n’est ajouté à la carte.

## A5_00 — Quai d’approche

**Niveau 00 · Les quais de Calder · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le refuge de transit domine le quai ; deux portes mènent au refuge et à la promenade. Vue sur la ville, pylône de dock, bollards, câbles d’amarrage, projecteurs de fret. Le repère propre à ce profil est `portique`. La signalétique affiche « CALDER / FRET 00 ». La structure choisie est `open`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P00 | Refuge des transitaires / A5_01 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P01 | Promenade des citernes / A5_02 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| crane · A5_00_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| cargo · A5_00_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| bollard · A5_00_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| winch · A5_00_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| bollard · A5_00_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| winch · A5_00_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| winch · A5_00_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_00_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| reel · A5_00_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_00_cover0 / cargo | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_00_cover1 / cargo | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Écouter le message de Jax** (`brief`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Le transfert** (`LOG_00`), x 650 / z 0.23.

> Les cases « consentement » ont été laissées vides. Les trois dossiers portent la même destination : Calder, tour de recherche.

**Réserve de campagne** (`SUP_00`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_01 — Refuge des transitaires

**Niveau 00 · Les quais de Calder · passage latéral · largeur 1500 unités**

### Fonction et repère

Le refuge reçoit les dockers de nuit et donne sur une galerie de service. Lits superposés, casiers, table, distributeur, radio et sacs de transit. Le repère propre à ce profil est `refuge`. La signalétique affiche « TRANSITAIRES / ABRI 01 ». La structure choisie est `low`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P00 | Quai d’approche / A5_00 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P02 | Poste de fret / A5_03 | Porte · 0,7 s | 1355 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| bunks · A5_01_fixture0 | 300 / -0.04 | 190 × 185 | mid | rear service floor |
| galley · A5_01_fixture1 | 730 / -0.04 | 205 × 125 | mid | rear service floor |
| notice · A5_01_fixture2 | 1140 / -0.16 | 155 × 145 | mid | backwall fixing |
| notice · A5_01_detail0 | 475 / -0.16 | 75 × 90 | mid | backwall fixing |
| locker · A5_01_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| duffel · A5_01_detail2 | 1280 / -0.03 | 75 × 42 | mid | rear service floor |
| duffel · A5_01_front0 | 75 / 1.08 | 78 × 42 | foreground | foreground apron |
| helmet · A5_01_front1 | 1425 / 1.08 | 42 × 43 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Ouvrir le refuge aux dockers** (`shelter`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : La chaise vide** (`LOG_01`), x 320 / z 0.5.

> Le refuge tient une liste des absents. Le dernier nom a été écrit ce matin, sans numéro de navette.

**Réserve de campagne** (`SUP_01`), x 1060 / z 0.5. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_02 — Promenade des citernes

**Niveau 00 · Les quais de Calder · profondeur jouable · largeur 1800 unités**

### Fonction et repère

La passerelle court entre la citerne industrielle et la gare suspendue. Citernes rivetées, coursive au fond, grilles de ventilation et pompes. Le repère propre à ce profil est `citernes`. La signalétique affiche « PROMENADE / EAU INDUSTRIELLE ». La structure choisie est `open`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P01 | Quai d’approche / A5_00 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P03 | Poste de fret / A5_03 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P04 | Gare suspendue / A5_04 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| silo · A5_02_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| pipe · A5_02_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| valve · A5_02_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| catwalk · A5_02_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| valve · A5_02_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| catwalk · A5_02_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| silo · A5_02_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_02_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| rail · A5_02_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_02_cover0 / cargo | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_02_cover1 / cargo | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Dossier facultatif : Pression de service** (`LOG_02`), x 650 / z 0.23.

> La pression est normale dans la conduite amont. Le siphon de laboratoire a donc rompu depuis l’intérieur.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_03 — Poste de fret

**Niveau 00 · Les quais de Calder · passage latéral · largeur 1500 unités**

### Fonction et repère

Les manifestes et accréditations sont contrôlés avant la gare. Guichet vitré, barrière levante, scanner, compteur de lots, palettes. Le repère propre à ce profil est `controle-fret`. La signalétique affiche « DOUANE / FRET SCELLÉ ». La structure choisie est `low`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P02 | Refuge des transitaires / A5_01 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P03 | Promenade des citernes / A5_02 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| P05 | Atelier des monteurs / A5_05 | Porte · 0,7 s | 560 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| security · A5_03_fixture0 | 300 / -0.04 | 130 × 170 | mid | rear service floor |
| window · A5_03_fixture1 | 730 / -0.04 | 260 × 245 | mid | rear service floor |
| cabinet · A5_03_fixture2 | 1140 / -0.04 | 110 × 155 | mid | rear service floor |
| cabinet · A5_03_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| notice · A5_03_detail1 | 970 / -0.16 | 75 × 90 | mid | backwall fixing |
| security · A5_03_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| scanner · A5_03_front0 | 75 / 1.08 | 95 × 54 | foreground | foreground apron |
| helmet · A5_03_front1 | 1425 / 1.08 | 42 × 43 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Récupérer le sceau de fret** (`freight`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Aucune cargaison** (`LOG_03`), x 320 / z 0.5.

> Le manifeste compte un poids, des températures et une escorte. Aucun nom de marchandise.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_03 | Couper les plafonniers | 1180 / 0.5 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_00 | Agent de sécurité | 1180 / 0.5 | Accès à la pièce |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_04 — Gare suspendue

**Niveau 00 · Les quais de Calder · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Une navette de fret absente a laissé son relais radio sous tension. Rails en arrière-plan, bancs, signalétique, porte palière et grue. Le repère propre à ce profil est `gare`. La signalétique affiche « CALDER / LIGNE DE RELÈVE ». La structure choisie est `open`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P04 | Promenade des citernes / A5_02 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P06 | Atelier des monteurs / A5_05 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| tram · A5_04_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| track · A5_04_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| signal · A5_04_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| clock · A5_04_fixture3 | 1460 / -0.38 | 56 × 74 | mid | backwall fixing |
| signal · A5_04_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| clock · A5_04_detail1 | 1020 / -0.38 | 56 × 74 | mid | backwall fixing |
| signal · A5_04_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| bench · A5_04_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| duffel · A5_04_front1 | 1725 / 1.08 | 78 × 42 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_04_cover0 / cargo | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_04_cover1 / cargo | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Rétablir le relais des quais** (`signal`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Dernière émission** (`LOG_04`), x 650 / z 0.23.

> « Ne nous envoyez personne. Fermez les quais. » La suite est remplacée par un signal de maintenance.

**Réserve de campagne** (`SUP_04`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_01 | Agent de sécurité | 1310 / 0.66 | Accès à la pièce |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_05 — Atelier des monteurs

**Niveau 00 · Les quais de Calder · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le monte-charge dessert directement les sas ouvriers de l’étage 01. Établis, pièces suspendues, bouteille de gaz, pont roulant et treuil. Le repère propre à ce profil est `atelier`. La signalétique affiche « MAINTENANCE / OUTILLAGE ». La structure choisie est `truss`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P05 | Poste de fret / A5_03 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P06 | Gare suspendue / A5_04 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| L0 | Sas ouvrier / A5_06 | Ascenseur · 1,65 s | 560 / 0.16 | key_freight |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| toolwall · A5_05_fixture0 | 300 / -0.16 | 190 × 215 | mid | backwall fixing |
| hoist · A5_05_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| workbench · A5_05_fixture2 | 1150 / -0.04 | 185 × 105 | mid | rear service floor |
| winch · A5_05_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| workbench · A5_05_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| winch · A5_05_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| toolwall · A5_05_detail2 | 1510 / -0.16 | 75 × 90 | mid | backwall fixing |
| reel · A5_05_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| helmet · A5_05_front1 | 1725 / 1.08 | 42 × 43 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_05_cover0 / cargo | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_05_cover1 / cargo | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Dossier facultatif : Le monte-charge** (`LOG_05`), x 650 / z 0.23.

> Le treuil M2 accepte les charges biologiques. La plaque de série a été remplacée deux fois.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| CACHE_05 | Ouvrir la dotation de secours | 1260 / 0.7 | 1.7 s |

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_06 — Sas ouvrier

**Niveau 01 · Les ateliers de relève · passage latéral · largeur 1500 unités**

### Fonction et repère

Le personnel se décontamine entre le dock et les chaînes. Douches sèches, bancs, casiers fermés, filtre et porte étanche. Le repère propre à ce profil est `sas-ouvrier`. La signalétique affiche « ACCÈS OUVRIER / DÉCONTAMINATION ». La structure choisie est `low`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P07 | Chaîne des conteneurs / A5_07 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P08 | Bureau des équipes / A5_08 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| L0 | Atelier des monteurs / A5_05 | Ascenseur · 1,65 s | 560 / 0.5 | key_freight |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| airlock · A5_06_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| shower · A5_06_fixture1 | 730 / -0.04 | 105 × 190 | mid | rear service floor |
| locker · A5_06_fixture2 | 1140 / -0.04 | 105 × 170 | mid | rear service floor |
| locker · A5_06_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| notice · A5_06_detail1 | 970 / -0.16 | 75 × 90 | mid | backwall fixing |
| security · A5_06_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| grille · A5_06_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_06_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Vestiaire** (`LOG_06`), x 320 / z 0.5.

> Une combinaison a été remise dans son casier avec ses gants encore mouillés.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_07 — Chaîne des conteneurs

**Niveau 01 · Les ateliers de relève · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Les cages de transport suivent un convoyeur vers le centre de recherche. Convoyeur arrêté, berceaux numérotés, crochet, pont de contrôle, caisses scellées. Le repère propre à ce profil est `chaine`. La signalétique affiche « LIGNE C-7 / FRET SOUS SCELLÉS ». La structure choisie est `truss`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P07 | Sas ouvrier / A5_06 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P09 | Chaufferie centrale / A5_09 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| conveyor · A5_07_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| cargo · A5_07_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| hoist · A5_07_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| security · A5_07_fixture3 | 1460 / -0.04 | 130 × 170 | mid | rear service floor |
| winch · A5_07_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| security · A5_07_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| gauge · A5_07_detail2 | 1510 / -0.03 | 70 × 90 | mid | rear service floor |
| reel · A5_07_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| barrier · A5_07_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_07_cover0 / machine | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_07_cover1 / machine | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Immobiliser le convoi scellé** (`conveyor`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Le berceau** (`LOG_07`), x 650 / z 0.23.

> Le berceau vide porte des sangles fondues. Le conteneur suivant a reçu un ordre de chargement automatique.

**Réserve de campagne** (`SUP_07`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_07 | Couper les plafonniers | 1180 / 0.41 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_02 | Agent de sécurité | 1320 / 0.58 | Accès à la pièce |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_08 — Bureau des équipes

**Niveau 01 · Les ateliers de relève · passage latéral · largeur 1500 unités**

### Fonction et repère

Le contremaître conserve les heures et les affectations des équipes disparues. Horloge, dossiers, armoire métallique, planning et écran de pointage. Le repère propre à ce profil est `equipes`. La signalétique affiche « RELÈVE / POINTAGE DU PERSONNEL ». La structure choisie est `low`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P08 | Sas ouvrier / A5_06 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P10 | Chaufferie centrale / A5_09 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| P11 | Galerie d’inspection / A5_10 | Porte · 0,7 s | 560 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| notice · A5_08_fixture0 | 300 / -0.16 | 155 × 145 | mid | backwall fixing |
| clock · A5_08_fixture1 | 730 / -0.38 | 56 × 74 | mid | backwall fixing |
| desk · A5_08_fixture2 | 1140 / -0.04 | 210 × 200 | mid | rear service floor |
| desk · A5_08_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| cabinet · A5_08_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| notice · A5_08_detail2 | 1280 / -0.16 | 75 × 90 | mid | backwall fixing |
| duffel · A5_08_front0 | 75 / 1.08 | 78 × 42 | foreground | foreground apron |
| helmet · A5_08_front1 | 1425 / 1.08 | 42 × 43 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Lire le registre des équipes** (`roster`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Heures supplémentaires** (`LOG_08`), x 320 / z 0.5.

> Les trente-deux techniciens ont été payés après leur disparition. Cela maintenait leurs accès actifs.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_09 — Chaufferie centrale

**Niveau 01 · Les ateliers de relève · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le groupe auxiliaire alimente le monte-charge et les pompes du laboratoire. Chaudières, conduites chaudes isolées, vannes, jauges et bac de purge. Le repère propre à ce profil est `chaufferie`. La signalétique affiche « CHAUFFERIE / CIRCUIT AUXILIAIRE ». La structure choisie est `truss`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P09 | Chaîne des conteneurs / A5_07 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P10 | Bureau des équipes / A5_08 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P12 | Monte-charge M2 / A5_11 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| boiler · A5_09_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| pipe · A5_09_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| gauge · A5_09_fixture2 | 1150 / -0.04 | 70 × 95 | mid | rear service floor |
| valve · A5_09_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| gauge · A5_09_detail0 | 460 / -0.03 | 70 × 90 | mid | rear service floor |
| valve · A5_09_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| boiler · A5_09_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_09_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| grille · A5_09_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_09_cover0 / machine | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_09_cover1 / machine | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Réarmer le groupe auxiliaire** (`generator`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Circuit séparé** (`LOG_09`), x 650 / z 0.23.

> La chauffe industrielle ne partage pas le circuit d’air des logements. Les volets sont testés chaque nuit.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| VALVE_09 | Fermer la dérivation de vapeur | 1240 / 0.4 | 1.2 s |

**STEAM_09** : vapeur à x 1050 / z 0.64, largeur 65, amplitude z 0.15. Cycle 5.2 s, ouverture 1.7 s, décalage 2.79 s. Dégâts bruts 7 avant difficulté/protection. La vanne `VALVE_09` pilote cette sortie.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_10 — Galerie d’inspection

**Niveau 01 · Les ateliers de relève · passage latéral · largeur 1500 unités**

### Fonction et repère

Une passerelle technique évite la chaîne et rejoint son extrémité haute. Chemin de câbles, trappes, garde-corps, ventilateurs et boîtiers. Le repère propre à ce profil est `inspection`. La signalétique affiche « INSPECTION / RETOUR D’AIR ». La structure choisie est `low`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P11 | Bureau des équipes / A5_08 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P13 | Monte-charge M2 / A5_11 | Porte · 0,7 s | 1355 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| duct · A5_10_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| fan · A5_10_fixture1 | 730 / -0.04 | 260 × 245 | mid | rear service floor |
| pipe · A5_10_fixture2 | 1140 / -0.04 | 210 × 200 | mid | rear service floor |
| pipe · A5_10_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| gauge · A5_10_detail1 | 970 / -0.03 | 70 × 90 | mid | rear service floor |
| duct · A5_10_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| grille · A5_10_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_10_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Filtre 08** (`LOG_10`), x 320 / z 0.5.

> Le filtre retiré pèse onze kilos de trop. La demande d’analyse a été annulée par la direction.

**Réserve de campagne** (`SUP_10`), x 1060 / z 0.5. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| VALVE_10 | Fermer la dérivation de vapeur | 900 / 0.5 | 1.2 s |

**STEAM_10** : vapeur à x 710 / z 0.5, largeur 65, amplitude z 0.15. Cycle 5.2 s, ouverture 1.7 s, décalage 3.10 s. Dégâts bruts 7 avant difficulté/protection. La vanne `VALVE_10` pilote cette sortie.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_03 | Agent de sécurité | 1140 / 0.5 | Accès à la pièce |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_11 — Monte-charge M2

**Niveau 01 · Les ateliers de relève · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le grand ascenseur relie l’atelier 01 à l’accueil de l’étage 04. Contrepoids, portes massives, rail-guide, commandes et marquages de charge. Le repère propre à ce profil est `monte-charge`. La signalétique affiche « M2 / CHARGE MAXIMALE 8 T ». La structure choisie est `shaft`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P12 | Chaufferie centrale / A5_09 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P13 | Galerie d’inspection / A5_10 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| L1 | Réception Weyland / A5_12 | Ascenseur · 1,65 s | 560 / 0.16 | lift_ready |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| liftmotor · A5_11_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| counterweight · A5_11_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| hoist · A5_11_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| grille · A5_11_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| winch · A5_11_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| grille · A5_11_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| liftmotor · A5_11_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| rail · A5_11_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| reel · A5_11_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_11_cover0 / machine | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_11_cover1 / machine | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Armer le monte-charge M2** (`lift`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : M2** (`LOG_11`), x 650 / z 0.23.

> La cabine monte aux bureaux. Les cages continuent par une autre branche, interdite au personnel.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_12 — Réception Weyland

**Niveau 04 · La façade blanche · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le personnel administratif arrive par une réception séparée des cages de fret. Arbre sous verre, banques d’accueil, vitrage, panneau mural et sièges. Le repère propre à ce profil est `reception`. La signalétique affiche « WEYLAND-YUTANI / RÉCEPTION ». La structure choisie est `vault`, dans la palette `ivory`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P14 | Archives du personnel / A5_13 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P15 | Contrôle de la tour / A5_14 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| L1 | Monte-charge M2 / A5_11 | Ascenseur · 1,65 s | 560 / 0.16 | lift_ready |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| reception · A5_12_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| window · A5_12_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| planter · A5_12_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| logo · A5_12_fixture3 | 1460 / -0.38 | 170 × 130 | mid | backwall fixing |
| planter · A5_12_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| logo · A5_12_detail1 | 1020 / -0.38 | 75 × 90 | mid | backwall fixing |
| notice · A5_12_detail2 | 1510 / -0.16 | 75 × 90 | mid | backwall fixing |
| bench · A5_12_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| planter · A5_12_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_12_cover0 / cart | 400 / 0.82 | 100 | 0.105 | Bloque déplacement et tir |
| A5_12_cover1 / cart | 1370 / 0.82 | 100 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Dossier facultatif : Hospitalité** (`LOG_12`), x 650 / z 0.23.

> Les visiteurs voient une serre, une fontaine et des vitrages opaques. Pas une porte sur le laboratoire.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_04 | Agent de sécurité | 1250 / 0.6 | Accès à la pièce |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_13 — Archives du personnel

**Niveau 04 · La façade blanche · passage latéral · largeur 1500 unités**

### Fonction et repère

Les copies locales des contrats restent accessibles hors réseau. Rayonnages de bandes, lecteurs, classeurs et chariot de stockage. Le repère propre à ce profil est `archives`. La signalétique affiche « ARCHIVES / DOSSIERS DU PERSONNEL ». La structure choisie est `low`, dans la palette `ivory`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P14 | Réception Weyland / A5_12 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P16 | Atrium des actionnaires / A5_15 | Porte · 0,7 s | 1355 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| archive · A5_13_fixture0 | 300 / -0.16 | 190 × 215 | mid | backwall fixing |
| server · A5_13_fixture1 | 730 / -0.04 | 260 × 245 | mid | rear service floor |
| cabinet · A5_13_fixture2 | 1140 / -0.04 | 110 × 155 | mid | rear service floor |
| cabinet · A5_13_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| clock · A5_13_detail1 | 970 / -0.38 | 56 × 74 | mid | backwall fixing |
| archive · A5_13_detail2 | 1280 / -0.16 | 75 × 90 | mid | backwall fixing |
| cart · A5_13_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| case · A5_13_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Déchiffrer le contrat de recherche** (`ledger`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Clauses** (`LOG_13`), x 320 / z 0.5.

> Le contrat ne promet pas le contrôle. Il promet seulement de poursuivre les essais jusqu’à son obtention.

**Réserve de campagne** (`SUP_13`), x 1060 / z 0.5. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_13 | Couper les plafonniers | 1180 / 0.5 | 0.85 s |

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_14 — Contrôle de la tour

**Niveau 04 · La façade blanche · profondeur jouable · largeur 1800 unités**

### Fonction et repère

L’opérateur surveille toutes les alimentations sans pouvoir ouvrir une cage manuellement. Consoles inclinées, écrans superposés, baie serveur et vitrage de contrôle. Le repère propre à ce profil est `controle-tour`. La signalétique affiche « SUPERVISION / AUTORITÉ DISTANTE ». La structure choisie est `vault`, dans la palette `ivory`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P15 | Réception Weyland / A5_12 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P17 | Atrium des actionnaires / A5_15 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P18 | Infirmerie du personnel / A5_16 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| monitorwall · A5_14_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| server · A5_14_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| desk · A5_14_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| window · A5_14_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| desk · A5_14_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| notice · A5_14_detail1 | 1020 / -0.16 | 75 × 90 | mid | backwall fixing |
| monitorwall · A5_14_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_14_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cart · A5_14_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_14_cover0 / cart | 400 / 0.82 | 100 | 0.105 | Bloque déplacement et tir |
| A5_14_cover1 / cart | 1370 / 0.82 | 100 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Couper l’autorité distante** (`control`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Un ordre humain** (`LOG_14`), x 650 / z 0.23.

> L’ouverture de confinement n’est pas une panne. Une autorité distante l’a signée.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_14 | Couper les plafonniers | 1180 / 0.41 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_05 | Agent de sécurité | 1220 / 0.5 | Accès à la pièce |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_15 — Atrium des actionnaires

**Niveau 04 · La façade blanche · profondeur jouable · largeur 1800 unités**

### Fonction et repère

La galerie publique cache une archive de direction dans son noyau. Piliers blancs, plants sous verre, passerelle haute et signalétique minimale. Le repère propre à ce profil est `atrium`. La signalétique affiche « DIRECTION / VISITEURS AUTORISÉS ». La structure choisie est `vault`, dans la palette `ivory`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P16 | Archives du personnel / A5_13 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P17 | Contrôle de la tour / A5_14 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P19 | Sas de sécurité N3 / A5_17 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| atrium · A5_15_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| window · A5_15_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| planter · A5_15_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| logo · A5_15_fixture3 | 1460 / -0.38 | 170 × 130 | mid | backwall fixing |
| planter · A5_15_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| logo · A5_15_detail1 | 1020 / -0.38 | 75 × 90 | mid | backwall fixing |
| logo · A5_15_detail2 | 1510 / -0.38 | 75 × 90 | mid | backwall fixing |
| bench · A5_15_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| planter · A5_15_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_15_cover0 / cart | 400 / 0.82 | 100 | 0.105 | Bloque déplacement et tir |
| A5_15_cover1 / cart | 1370 / 0.82 | 100 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Copier les archives de direction** (`director`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Les survivants** (`LOG_15`), x 650 / z 0.23.

> La liste de Calder ne s’arrête pas aux témoins. Elle contient leurs familles et leurs lieux de travail.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_06 | Xénomorphe | 1340 / 0.7 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_16 — Infirmerie du personnel

**Niveau 04 · La façade blanche · passage latéral · largeur 1500 unités**

### Fonction et repère

Les blessures d’acide sont enregistrées comme accidents de maintenance. Deux brancards, armoire stérile, lampe articulée, scanner et bac clinique. Le repère propre à ce profil est `infirmerie`. La signalétique affiche « MÉDICAL / PERSONNEL ». La structure choisie est `low`, dans la palette `ivory`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P18 | Contrôle de la tour / A5_14 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P20 | Sas de sécurité N3 / A5_17 | Porte · 0,7 s | 1355 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| surgical · A5_16_fixture0 | 300 / -0.04 | 180 × 145 | mid | rear service floor |
| bed · A5_16_fixture1 | 730 / -0.04 | 180 × 80 | mid | rear service floor |
| ivstand · A5_16_fixture2 | 1140 / -0.04 | 52 × 132 | mid | rear service floor |
| ivstand · A5_16_detail0 | 475 / -0.03 | 52 × 90 | mid | rear service floor |
| cabinet · A5_16_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| ivstand · A5_16_detail2 | 1280 / -0.03 | 52 × 90 | mid | rear service floor |
| cart · A5_16_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| stretcher · A5_16_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Récupérer le kit étanche** (`medical`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Diagnostic** (`LOG_16`), x 320 / z 0.5.

> Les brûlures chimiques ont été classées comme usure de l’équipement, sans examen des victimes.

**Réserve de campagne** (`SUP_16`), x 1060 / z 0.5. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| CACHE_16 | Ouvrir la dotation de secours | 1210 / 0.5 | 1.7 s |

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_17 — Sas de sécurité N3

**Niveau 04 · La façade blanche · passage latéral · largeur 1500 unités**

### Fonction et repère

Une batterie d’urgence contrôle l’escalier étanche vers les laboratoires de l’étage 03. Double porte, douche, coffre à cartes, filtre et hublots rayés. Le repère propre à ce profil est `sas-N3`. La signalétique affiche « N3 / CONTRÔLE BIOMÉTRIQUE ». La structure choisie est `low`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P19 | Atrium des actionnaires / A5_15 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P20 | Infirmerie du personnel / A5_16 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| L2 | Vestiaire étanche / A5_18 | Escalier · 1,2 s | 560 / 0.5 | clearance |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| airlock · A5_17_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| scanner · A5_17_fixture1 | 730 / -0.04 | 95 × 165 | mid | rear service floor |
| security · A5_17_fixture2 | 1140 / -0.04 | 130 × 170 | mid | rear service floor |
| security · A5_17_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| valve · A5_17_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| security · A5_17_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| grille · A5_17_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_17_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Seconde porte** (`LOG_17`), x 320 / z 0.5.

> L’escalier possède deux batteries. L’une alimente les serrures, l’autre empêche leur ouverture.

**Réserve de campagne** (`SUP_17`), x 1060 / z 0.5. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_07 | Xénomorphe | 1160 / 0.5 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_18 — Vestiaire étanche

**Niveau 03 · Les étages de recherche · passage latéral · largeur 1500 unités**

### Fonction et repère

Les combinaisons sont stockées avant le bassin de confinement. Combinaisons suspendues, bancs, bottes, sas transparent et ventilation. Le repère propre à ce profil est `vestiaire`. La signalétique affiche « ÉQUIPEMENTS / ÉTANCHÉITÉ ». La structure choisie est `low`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P21 | Laboratoire submergé / A5_19 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P22 | Salle des prélèvements / A5_20 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| L2 | Sas de sécurité N3 / A5_17 | Escalier · 1,2 s | 560 / 0.5 | clearance |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| suitrack · A5_18_fixture0 | 300 / -0.04 | 105 × 175 | mid | rear service floor |
| locker · A5_18_fixture1 | 730 / -0.04 | 105 × 170 | mid | rear service floor |
| shower · A5_18_fixture2 | 1140 / -0.04 | 105 × 190 | mid | rear service floor |
| valve · A5_18_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| ivstand · A5_18_detail1 | 970 / -0.03 | 52 × 90 | mid | rear service floor |
| helmet · A5_18_detail2 | 1280 / -0.03 | 42 × 43 | mid | rear service floor |
| cart · A5_18_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| grille · A5_18_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Protocole étanche** (`LOG_18`), x 320 / z 0.5.

> Le kit protège des éclaboussures. Il ne rend ni invisible, ni invulnérable.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_19 — Laboratoire submergé

**Niveau 03 · Les étages de recherche · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le bassin recueille le liquide d’une canalisation rompue ; le sol n’est plus sûr avant la purge. Cuves, plateforme surélevée, passerelle jaune, câbles hors eau et pompes. Le repère propre à ce profil est `bassin`. La signalétique affiche « RÉTENTION / LABORATOIRE 19 ». La structure choisie est `vault`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P21 | Vestiaire étanche / A5_18 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P23 | Vivarium expérimental / A5_21 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| tank · A5_19_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| glasscell · A5_19_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| pump · A5_19_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| gauge · A5_19_fixture3 | 1460 / -0.04 | 70 × 95 | mid | rear service floor |
| pump · A5_19_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| gauge · A5_19_detail1 | 1020 / -0.03 | 70 × 90 | mid | rear service floor |
| tank · A5_19_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| pipe · A5_19_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cart · A5_19_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_19_cover0 / cart | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_19_cover1 / cart | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Purger le bassin de rétention** (`drain`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Rétention** (`LOG_19`), x 650 / z 0.23.

> Le bassin n’est pas une piscine. Sa profondeur a doublé depuis le dernier contrôle.

**Réserve de campagne** (`SUP_19`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_08 | Xénomorphe | 1370 / 0.72 | breach |
| A5_EN_09 | Facehugger | 1150 / 0.32 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_20 — Salle des prélèvements

**Niveau 03 · Les étages de recherche · passage latéral · largeur 1500 unités**

### Fonction et repère

Les sérums et fragments sont catalogués avant transfert dans le vivarium. Microscope, cuve d’échantillonnage, chariot, terminal et tiroirs réfrigérés. Le repère propre à ce profil est `prelevements`. La signalétique affiche « PRÉLÈVEMENTS / CHAÎNE FROIDE ». La structure choisie est `low`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P22 | Vestiaire étanche / A5_18 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P24 | Vivarium expérimental / A5_21 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| P25 | Conduit de filtration / A5_22 | Porte · 0,7 s | 560 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| microscope · A5_20_fixture0 | 300 / -0.04 | 120 × 130 | mid | rear service floor |
| surgical · A5_20_fixture1 | 730 / -0.04 | 180 × 145 | mid | rear service floor |
| cabinet · A5_20_fixture2 | 1140 / -0.04 | 110 × 155 | mid | rear service floor |
| cabinet · A5_20_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| ivstand · A5_20_detail1 | 970 / -0.03 | 52 × 90 | mid | rear service floor |
| microscope · A5_20_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| cart · A5_20_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| case · A5_20_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Analyser la fiche des prélèvements** (`specimen`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Absence de preuve** (`LOG_20`), x 320 / z 0.5.

> L’organisme suit le prélèvement pendant quelques secondes. L’essai s’arrête avant le premier contact.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_20 | Couper les plafonniers | 1180 / 0.5 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_10 | Facehugger | 1140 / 0.5 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_21 — Vivarium expérimental

**Niveau 03 · Les étages de recherche · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Les cages visibles sont reliées à un même circuit de contention. Cages, hublots épais, pinces de prélèvement, conduites et chambre opaque. Le repère propre à ce profil est `vivarium`. La signalétique affiche « VIVARIUM / CONFINEMENT BIOLOGIQUE ». La structure choisie est `vault`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P23 | Laboratoire submergé / A5_19 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P24 | Salle des prélèvements / A5_20 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P26 | Centre de confinement / A5_23 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| glasscell · A5_21_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| incubator · A5_21_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| pump · A5_21_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| monitorwall · A5_21_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| pump · A5_21_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| monitorwall · A5_21_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| gauge · A5_21_detail2 | 1510 / -0.03 | 70 × 90 | mid | rear service floor |
| cart · A5_21_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_21_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_21_cover0 / cart | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_21_cover1 / cart | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Décider du sort de l’échantillon** (`sample`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Le tissu** (`LOG_21`), x 650 / z 0.23.

> L’ampoule est intacte. La fiche porte six signatures et aucune autorisation de transport.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_21 | Couper les plafonniers | 1180 / 0.41 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_11 | Trematode expérimental | 1180 / 0.65 | breach |
| A5_EN_12 | Facehugger | 1340 / 0.3 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_22 — Conduit de filtration

**Niveau 03 · Les étages de recherche · passage latéral · largeur 1500 unités**

### Fonction et repère

Le conduit dessert le bassin sans traverser les cages. Grosses hélices, filtre amovible, grilles, sac filtrant et maintenance. Le repère propre à ce profil est `filtration`. La signalétique affiche « FILTRATION / AIR EXTRAIT ». La structure choisie est `low`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P25 | Salle des prélèvements / A5_20 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P27 | Centre de confinement / A5_23 | Porte · 0,7 s | 1355 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| filter · A5_22_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| fan · A5_22_fixture1 | 730 / -0.04 | 260 × 245 | mid | rear service floor |
| duct · A5_22_fixture2 | 1140 / -0.04 | 210 × 200 | mid | rear service floor |
| duct · A5_22_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| valve · A5_22_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| filter · A5_22_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| grille · A5_22_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_22_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Griffe sur la grille** (`LOG_22`), x 320 / z 0.5.

> La déformation vient du côté de la cage. Aucun ouvrier n’a ouvert ce passage.

**Réserve de campagne** (`SUP_22`), x 1060 / z 0.5. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| VALVE_22 | Fermer la dérivation de vapeur | 910 / 0.5 | 1.2 s |

**STEAM_22** : vapeur à x 1090 / z 0.5, largeur 65, amplitude z 0.15. Cycle 5.2 s, ouverture 1.7 s, décalage 6.82 s. Dégâts bruts 7 avant difficulté/protection. La vanne `VALVE_22` pilote cette sortie.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_13 | Xénomorphe | 1160 / 0.5 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_23 — Centre de confinement

**Niveau 03 · Les étages de recherche · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le verrou de confinement coupe la commande à distance et isole le bloc de l’étage 02. Baies électriques, triple vitrage, retenues arrachées et blindages. Le repère propre à ce profil est `confinement`. La signalétique affiche « CELLULE 23 / PURGE THERMIQUE ». La structure choisie est `vault`, dans la palette `ice`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P26 | Vivarium expérimental / A5_21 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P27 | Conduit de filtration / A5_22 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| L3 | Palier des gaines / A5_24 | Ascenseur · 1,65 s | 560 / 0.16 | quarantine |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| containment · A5_23_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| glasscell · A5_23_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| security · A5_23_fixture2 | 1150 / -0.04 | 130 × 170 | mid | rear service floor |
| hoist · A5_23_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| security · A5_23_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| winch · A5_23_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| containment · A5_23_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| barrier · A5_23_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_23_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_23_cover0 / cart | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_23_cover1 / cart | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Verrouiller le confinement local** (`lockdown`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Quatre prises** (`LOG_23`), x 650 / z 0.23.

> Quatre marques distinctes sur le blindage. L’opérateur avait noté « même individu ».

**Réserve de campagne** (`SUP_23`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

**Dispositif trap** (`TRAP_23`), x 450 / z 0.38. La purge de contention sert de résolution alternative au combat.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_23 | Couper les plafonniers | 1180 / 0.41 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_14 | Spécimen à quatre bras | 1320 / 0.7 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_24 — Palier des gaines

**Niveau 02 · Le bloc d’isolement · passage latéral · largeur 1500 unités**

### Fonction et repère

Le palier reçoit les flux d’évacuation du laboratoire situé un étage au-dessus. Conduits verticaux, traverses, accès de câble et passerelle étroite. Le repère propre à ce profil est `gaines`. La signalétique affiche « PALIER / REJETS DE CONFINEMENT ». La structure choisie est `shaft`, dans la palette `rust`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P28 | Chambre des greffes / A5_25 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P29 | Nid de la rétention / A5_26 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| L3 | Centre de confinement / A5_23 | Ascenseur · 1,65 s | 560 / 0.5 | quarantine |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| counterweight · A5_24_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| pipe · A5_24_fixture1 | 730 / -0.04 | 260 × 245 | mid | rear service floor |
| duct · A5_24_fixture2 | 1140 / -0.04 | 210 × 200 | mid | rear service floor |
| duct · A5_24_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| grille · A5_24_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| counterweight · A5_24_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_24_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| rail · A5_24_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Drainage** (`LOG_24`), x 320 / z 0.5.

> Les gaines reçoivent les rejets de l’étage supérieur. Les supprimer couperait également la purge.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_15 | Facehugger | 1130 / 0.5 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_25 — Chambre des greffes

**Niveau 02 · Le bloc d’isolement · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Les tissus et appareils de maintien sont restés en circuit fermé. Tables expérimentales, sangles, carter ouvert, résine et poches organiques. Le repère propre à ce profil est `greffes`. La signalétique affiche « GREFFES / SUJETS HUMAINS ». La structure choisie est `vault`, dans la palette `rust`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P28 | Palier des gaines / A5_24 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P30 | Salle de catalyse / A5_27 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| surgical · A5_25_fixture0 | 300 / -0.04 | 180 × 145 | mid | rear service floor |
| vein · A5_25_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| suitrack · A5_25_fixture2 | 1150 / -0.04 | 105 × 175 | mid | rear service floor |
| ivstand · A5_25_fixture3 | 1460 / -0.04 | 52 × 132 | mid | rear service floor |
| helmet · A5_25_detail0 | 460 / -0.03 | 42 × 43 | mid | rear service floor |
| ivstand · A5_25_detail1 | 1020 / -0.03 | 52 × 90 | mid | rear service floor |
| ivstand · A5_25_detail2 | 1510 / -0.03 | 52 × 90 | mid | rear service floor |
| cart · A5_25_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| resin · A5_25_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_25_cover0 / resin | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_25_cover1 / resin | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Débrancher la table de greffe** (`graft`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Interface** (`LOG_25`), x 650 / z 0.23.

> La table ne décrit aucune armure. Elle enregistre un contact entre chair humaine et matière étrangère.

**Réserve de campagne** (`SUP_25`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_25 | Couper les plafonniers | 1180 / 0.41 | 0.85 s |

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_16 | Trematode expérimental | 1260 / 0.65 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_26 — Nid de la rétention

**Niveau 02 · Le bloc d’isolement · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Les captifs proviennent d’une équipe de nettoyage envoyée après la rupture. Cocons, barreaux noyés dans la résine, passerelle arrachée et drains. Le repère propre à ce profil est `retention`. La signalétique affiche « RÉTENTION / CHAMBRE 26 ». La structure choisie est `vault`, dans la palette `rust`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P29 | Palier des gaines / A5_24 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P31 | Salle de catalyse / A5_27 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P32 | Four de stérilisation / A5_28 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| cocoon · A5_26_fixture0 | 300 / -0.04 | 100 × 168 | mid | rear service floor |
| vein · A5_26_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| glasscell · A5_26_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| egg · A5_26_fixture3 | 1460 / -0.04 | 72 × 92 | mid | rear service floor |
| gauge · A5_26_detail0 | 460 / -0.03 | 70 × 90 | mid | rear service floor |
| egg · A5_26_detail1 | 1020 / -0.03 | 72 × 90 | mid | rear service floor |
| cocoon · A5_26_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| resin · A5_26_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_26_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_26_cover0 / resin | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_26_cover1 / resin | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Libérer la technicienne Miller** (`rescue`), x 950 / z 0.32. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Miller** (`LOG_26`), x 650 / z 0.23.

> Elle a fermé la vanne avant de perdre connaissance. Les captifs n’étaient pas tous morts à notre arrivée.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_17 | Xénomorphe | 1330 / 0.62 | breach |

Miller est ici. Le choix de la libérer crée son acteur mobile ; l’état final demeure non évacué tant que le sas médical n’a pas confirmé sa prise en charge.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_27 — Salle de catalyse

**Niveau 02 · Le bloc d’isolement · profondeur jouable · largeur 1800 unités**

### Fonction et repère

La commande de chauffe dévie le combustible vers les canaux de stérilisation. Trois réacteurs, volant de dérivation, collecteur, passerelles et calorifuge. Le repère propre à ce profil est `catalyse`. La signalétique affiche « CATALYSE / CHAUFFE DU FOUR ». La structure choisie est `truss`, dans la palette `rust`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P30 | Chambre des greffes / A5_25 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P31 | Nid de la rétention / A5_26 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P33 | Répartiteur de crise / A5_29 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| reactor · A5_27_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| pipe · A5_27_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| valve · A5_27_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| gauge · A5_27_fixture3 | 1460 / -0.04 | 70 × 95 | mid | rear service floor |
| valve · A5_27_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| gauge · A5_27_detail1 | 1020 / -0.03 | 70 × 90 | mid | rear service floor |
| gauge · A5_27_detail2 | 1510 / -0.03 | 70 × 90 | mid | rear service floor |
| cable · A5_27_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| grille · A5_27_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_27_cover0 / resin | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_27_cover1 / resin | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Dériver la chauffe du four** (`heat`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : La dérivation** (`LOG_27`), x 650 / z 0.23.

> La stérilisation exige une chauffe et une purge séparées. Sans les volets, la chaleur remonte.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_27 | Couper les plafonniers | 1180 / 0.41 | 0.85 s |
| VALVE_27 | Fermer la dérivation de vapeur | 1200 / 0.38 | 1.2 s |

**STEAM_27** : vapeur à x 1000 / z 0.64, largeur 65, amplitude z 0.15. Cycle 5.2 s, ouverture 1.7 s, décalage 8.37 s. Dégâts bruts 7 avant difficulté/protection. La vanne `VALVE_27` pilote cette sortie.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_18 | Xénomorphe | 1300 / 0.6 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_28 — Four de stérilisation

**Niveau 02 · Le bloc d’isolement · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le four est séparé de la zone de vie par des volets coupe-feu. Bouche réfractaire, bennes de résidus, bras hydraulique et protections thermiques. Le repère propre à ce profil est `four`. La signalétique affiche « STÉRILISATION / ACCÈS PROTÉGÉ ». La structure choisie est `truss`, dans la palette `rust`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P32 | Nid de la rétention / A5_26 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P34 | Répartiteur de crise / A5_29 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| furnace · A5_28_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| conveyor · A5_28_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| pipe · A5_28_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| fan · A5_28_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| pipe · A5_28_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| fan · A5_28_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| gauge · A5_28_detail2 | 1510 / -0.03 | 70 × 90 | mid | rear service floor |
| barrier · A5_28_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| reel · A5_28_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_28_cover0 / resin | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_28_cover1 / resin | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Lancer la stérilisation du bloc** (`burn`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Destruction** (`LOG_28`), x 650 / z 0.23.

> Le four peut détruire ce qui reste dans les canaux. Pas les copies déjà transmises hors de la tour.

**Réserve de campagne** (`SUP_28`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_19 | Xénomorphe | 1260 / 0.75 | breach |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_29 — Répartiteur de crise

**Niveau 02 · Le bloc d’isolement · passage latéral · largeur 1500 unités**

### Fonction et repère

La cage de secours remonte du bloc 02 à la couronne 08 sans desservir les bureaux. Pupitre sécurisé, câble d’acier, cylindres hydrauliques et porte d’ascenseur. Le repère propre à ce profil est `repartiteur`. La signalétique affiche « CRISE / ÉVACUATION MÉDICALE ». La structure choisie est `low`, dans la palette `rust`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P33 | Salle de catalyse / A5_27 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P34 | Four de stérilisation / A5_28 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| L4 | Ascenseur de la couronne / A5_30 | Ascenseur · 1,65 s | 560 / 0.5 | sterilized |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| switchboard · A5_29_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| stretcher · A5_29_fixture1 | 730 / -0.04 | 155 × 125 | mid | rear service floor |
| ivstand · A5_29_fixture2 | 1140 / -0.04 | 52 × 132 | mid | rear service floor |
| ivstand · A5_29_detail0 | 475 / -0.03 | 52 × 90 | mid | rear service floor |
| notice · A5_29_detail1 | 970 / -0.16 | 75 × 90 | mid | backwall fixing |
| switchboard · A5_29_detail2 | 1280 / -0.03 | 75 × 90 | mid | rear service floor |
| cart · A5_29_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| case · A5_29_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Dossier facultatif : Accès de crise** (`LOG_29`), x 320 / z 0.5.

> Le palier 08 ne reçoit que les équipes d’évacuation. Son câble traverse tous les étages sans arrêt.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| EVAC_MILLER | Installer Miller dans le sas médical | 915 / 0.5 | 2.0 s |

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Le sas médical constitue le terme de l’escorte, sans exiger d’emmener Miller sous la reine jusqu’au hangar. Sa validation conserve un point de contrôle.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_30 — Ascenseur de la couronne

**Niveau 08 · La couronne d’amarrage · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le palier abrite la sortie du monte-charge de crise. Moteurs, contreforts, bâches, console météo et caisse d’outils. Le repère propre à ce profil est `ascenseur-haut`. La signalétique affiche « COURONNE / NIVEAU 08 ». La structure choisie est `shaft`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P35 | Bras d’amarrage / A5_31 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P36 | Réserve des charges / A5_32 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| L4 | Répartiteur de crise / A5_29 | Ascenseur · 1,65 s | 560 / 0.16 | sterilized |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| liftmotor · A5_30_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| counterweight · A5_30_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| window · A5_30_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| grille · A5_30_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| notice · A5_30_detail0 | 460 / -0.16 | 75 × 90 | mid | backwall fixing |
| grille · A5_30_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| liftmotor · A5_30_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| rail · A5_30_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cable · A5_30_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_30_cover0 / winch | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_30_cover1 / winch | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Dossier facultatif : Météo** (`LOG_30`), x 650 / z 0.23.

> Les amarrages ne tiendront pas longtemps dans ce vent. La navette doit décoller avant la prochaine rafale.

**Réserve de campagne** (`SUP_30`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_20 | Xénomorphe | 1330 / 0.65 | sterilized |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_31 — Bras d’amarrage

**Niveau 08 · La couronne d’amarrage · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Une plateforme de levage supporte la voie d’accès au hangar ; ses attaches sont destructibles. Trois culées, bornes d’arrimage, poutres, treuils et contrepoids. Le repère propre à ce profil est `bras`. La signalétique affiche « AMARRAGE / RUPTURE D’URGENCE ». La structure choisie est `bridge`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P35 | Ascenseur de la couronne / A5_30 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P37 | Antenne de diffusion / A5_33 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| anchor · A5_31_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| winch · A5_31_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| truss · A5_31_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| signal · A5_31_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| truss · A5_31_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| signal · A5_31_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| anchor · A5_31_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_31_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| rail · A5_31_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_31_cover0 / winch | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_31_cover1 / winch | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Armer l’attache ouest** (`anchor_a`), x 330 / z 0.64. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Objectif : Armer l’attache centrale** (`anchor_b`), x 930 / z 0.64. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Objectif : Armer l’attache est** (`anchor_c`), x 1440 / z 0.64. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Objectif : Rompre le bras d’amarrage** (`detonate`), x 665 / z 0.2. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Trois attaches** (`LOG_31`), x 650 / z 0.23.

> Les culées ont des charges de rupture normalisées. Une seule n’emportera pas la plateforme.

**Réserve de campagne** (`SUP_31`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_21 | Reine de la couronne | 1630 / 0.5 | charges |

Les trois attaches sont distinctes. La reine demeure une menace tant que le pupitre de rupture n’a pas résolu la séquence. Les statistiques de fusil n’autorisent aucun raccourci de mise à mort.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_32 — Réserve des charges

**Niveau 08 · La couronne d’amarrage · passage latéral · largeur 1500 unités**

### Fonction et repère

Les charges de démolition servent au désassemblage des bras d’amarrage. Râteliers fermés, malle ignifugée, coffret de commande et établi. Le repère propre à ce profil est `charges`. La signalétique affiche « PYROTECHNIE / DOTATION RESTREINTE ». La structure choisie est `low`, dans la palette `warm`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P36 | Ascenseur de la couronne / A5_30 | Porte · 0,7 s | 145 / 0.5 | Aucun |
| P38 | Antenne de diffusion / A5_33 | Porte · 0,7 s | 1355 / 0.5 | Aucun |
| P39 | Piste d’envol / A5_34 | Porte · 0,7 s | 560 / 0.5 | Aucun |

Le passage reste latéral : haut/bas ne change pas de voie de combat. Les accès latéraux ouvrent de vraies pièces du réseau. Le décor arrière est non solide ; aucun bloc invisible ne ferme le couloir.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| armrack · A5_32_fixture0 | 300 / -0.16 | 190 × 215 | mid | backwall fixing |
| locker · A5_32_fixture1 | 730 / -0.04 | 105 × 170 | mid | rear service floor |
| workbench · A5_32_fixture2 | 1140 / -0.04 | 185 × 105 | mid | rear service floor |
| workbench · A5_32_detail0 | 475 / -0.03 | 75 × 90 | mid | rear service floor |
| cabinet · A5_32_detail1 | 970 / -0.03 | 75 × 90 | mid | rear service floor |
| armrack · A5_32_detail2 | 1280 / -0.16 | 75 × 90 | mid | backwall fixing |
| case · A5_32_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cart · A5_32_front1 | 1425 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

Aucun objet solide ajouté dans ce couloir. Le passage ne doit pas être artificiellement obstrué pour augmenter sa difficulté.

### Interactions et progression

**Objectif : Prendre les charges d’arrimage** (`charges`), x 825 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Charges civiles** (`LOG_32`), x 320 / z 0.5.

> L’explosif sert à démonter une grue. Il n’a pas été conçu pour tuer ce qui marche dessus.

### Équipements techniques V2

| Identifiant | Commande | Position x / z | Durée |
|---|---|---|---|
| LIGHT_32 | Couper les plafonniers | 950 / 0.5 | 0.85 s |
| CACHE_32 | Ouvrir la dotation de secours | 1190 / 0.5 | 1.7 s |

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_33 — Antenne de diffusion

**Niveau 08 · La couronne d’amarrage · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Le relais public possède un accès indépendant du réseau de la tour. Mât, paraboles, caisson électrique, isolateurs et antennes de secours. Le repère propre à ce profil est `antenne`. La signalétique affiche « DIFFUSION / LIAISON DES QUAIS ». La structure choisie est `open`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P37 | Bras d’amarrage / A5_31 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P38 | Réserve des charges / A5_32 | Porte · 0,7 s | 1655 / 0.16 | Aucun |
| P40 | Hangar d’extraction / A5_35 | Porte · 0,7 s | 560 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| dish · A5_33_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| server · A5_33_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| signal · A5_33_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| window · A5_33_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| signal · A5_33_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| notice · A5_33_detail1 | 1020 / -0.16 | 75 × 90 | mid | backwall fixing |
| dish · A5_33_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| cable · A5_33_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| rail · A5_33_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_33_cover0 / winch | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_33_cover1 / winch | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Transmettre les preuves** (`broadcast`), x 850 / z 0.58. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Fréquence publique** (`LOG_33`), x 650 / z 0.23.

> La fréquence d’évacuation échappe à la tour. Une émission suffit à atteindre les quais.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_34 — Piste d’envol

**Niveau 08 · La couronne d’amarrage · profondeur jouable · largeur 1800 unités**

### Fonction et repère

Une voie de roulage longe la tour ; les balises restent alimentées sur batterie. Balises, pare-vent, barrières, caniveau, éclairage et carburant. Le repère propre à ce profil est `piste`. La signalétique affiche « PISTE 08 / VENT LATÉRAL ». La structure choisie est `open`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P39 | Réserve des charges / A5_32 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P41 | Hangar d’extraction / A5_35 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| runway · A5_34_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| beacon · A5_34_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| winch · A5_34_fixture2 | 1150 / -0.04 | 210 × 200 | mid | rear service floor |
| cargo · A5_34_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| winch · A5_34_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| cargo · A5_34_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| runway · A5_34_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| rail · A5_34_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| reel · A5_34_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_34_cover0 / winch | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_34_cover1 / winch | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Dossier facultatif : Balises** (`LOG_34`), x 650 / z 0.23.

> La batterie de piste dispose d’un circuit indépendant. Les feux resteront allumés même après la rupture.

**Réserve de campagne** (`SUP_34`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

| Individu | Type | Point initial x / z | Activation |
|---|---|---|---|
| A5_EN_22 | Xénomorphe | 1400 / 0.75 | charges |

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## A5_35 — Hangar d’extraction

**Niveau 08 · La couronne d’amarrage · profondeur jouable · largeur 1800 unités**

### Fonction et repère

La navette attend derrière le sas atmosphérique, accessible depuis la piste et le bras. Navette, rampe, chariot à bagages, pylônes d’énergie et crochet. Le repère propre à ce profil est `hangar`. La signalétique affiche « EXTRACTION / BAIE DE DÉPART ». La structure choisie est `truss`, dans la palette `slate`. Ce dessin est une proposition originale de Calder, pas un plan retrouvé de la production.

### Entrées, sorties et seuils

| Liaison | Destination | Accès | Seuil x / z | Verrou |
|---|---|---|---|---|
| P40 | Antenne de diffusion / A5_33 | Porte · 0,7 s | 145 / 0.16 | Aucun |
| P41 | Piste d’envol / A5_34 | Porte · 0,7 s | 1655 / 0.16 | Aucun |

Les déplacements haut/bas changent réellement la profondeur. Les approches arrière rejoignent les seuils, tandis que les obstacles de la bande avant peuvent servir à couper une ligne de tir. Hicks doit être regroupé avant une transition.

### Assemblage décoratif et supports

| Objet / identifiant | Placement x / z | Enveloppe w × h | Plan | Support |
|---|---|---|---|---|
| hangar · A5_35_fixture0 | 300 / -0.04 | 190 × 215 | mid | rear service floor |
| hoist · A5_35_fixture1 | 740 / -0.04 | 260 × 245 | mid | rear service floor |
| workbench · A5_35_fixture2 | 1150 / -0.04 | 185 × 105 | mid | rear service floor |
| cargo · A5_35_fixture3 | 1460 / -0.04 | 180 × 260 | mid | rear service floor |
| workbench · A5_35_detail0 | 460 / -0.03 | 75 × 90 | mid | rear service floor |
| cargo · A5_35_detail1 | 1020 / -0.03 | 75 × 90 | mid | rear service floor |
| hangar · A5_35_detail2 | 1510 / -0.03 | 75 × 90 | mid | rear service floor |
| reel · A5_35_front0 | 75 / 1.08 | 135 × 54 | foreground | foreground apron |
| cart · A5_35_front1 | 1725 / 1.08 | 135 × 54 | foreground | foreground apron |

### Obstacles qui participent réellement au jeu

| Identifiant / famille | Centre x / z | Largeur | Épaisseur z | Règle |
|---|---|---|---|---|
| A5_35_cover0 / winch | 400 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |
| A5_35_cover1 / winch | 1370 / 0.82 | 115 | 0.105 | Bloque déplacement et tir |

### Interactions et progression

**Objectif : Rejoindre la navette** (`extract`), x 1120 / z 0.5. Il ne s’active qu’à son tour dans la campagne. Le dispositif dessiné reste en place après validation.

**Dossier facultatif : Inventaire de départ** (`LOG_35`), x 650 / z 0.23.

> Une navette, des survivants et ce qu’ils ont choisi de ne pas abandonner.

**Réserve de campagne** (`SUP_35`), x 1100 / z 0.84. Consommation persistante ; une visite suivante n’en recrée pas le contenu.

### Équipements techniques V2

Aucun nouvel équipement technique dans cette pièce. Les objets décoratifs non interactifs ne sont pas annoncés comme des commandes fonctionnelles.

### Présences et contrôle de livraison

Aucune menace de départ assignée à cette salle dans le registre. Cela ménage une respiration ; les dangers techniques éventuels restent distincts des ennemis.

Les contrôles automatiques vérifient les destinations et les positions d’approche. Une capture de ce profil existe dans le dossier `qa/rooms/`. Le balayage visuel charge une situation préparée, avec ennemis neutralisés pour lire la géométrie ; ce n’est pas une preuve de combat terminé manuellement. La vue contrôle le cadrage, la hiérarchie des objets et le support des silhouettes, sans certifier une qualité artistique finale.


## Contrat de livraison et reproduction des contrôles

`npm test` exécute le socle V1 conservé, les systèmes V2, le lanceur et sa mise à jour. Les tests du socle chargent volontairement `core.js` sans sa couche V2 pour garder la comparaison. Les tests de cette passe chargent ensuite `systems-v2.js`. Le parcours intégral du moteur utilise ses déplacements, ses accès et ses interventions, dans une copie invulnérable de vérification ; les cas de combat, de ressources et de blessures sont testés à part.

`python tests/browser_v2_qa.py` ouvre le document dans Chromium à l’aide de Playwright. Dans l’environnement de fabrication, la navigation locale était bloquée. Le HTML a donc été chargé en mémoire avec `page.set_content`, sans modifier la restriction. Les scénarios avancés et le balayage des pièces sont explicitement préparés ; pour ce balayage, la simulation est figée pendant les captures afin de garder une géométrie lisible. Les captures de menus et actions proviennent du même rendu exécutable, non d’illustrations générées pour le rapport.

Le stockage simulé des tests n’est pas une permission accordée au jeu : il ne sert qu’à vérifier les clés et les aller-retour. Un second document non instrumenté vérifie le comportement face au refus natif. Le parcours sous combat de toute la campagne, les manettes physiques, les performances sur des appareils réels et la régression avec les autres DLC restent à valider. Un compteur de contrôles réussis ne signifie pas absence absolue de bugs.

### Installation additive

Le HTML autonome peut être ouvert directement. Le lanceur peut être installé dans une copie de Tantalus avec `node integration/install.mjs --check CHEMIN`, puis `--apply`. `--upgrade` remplace uniquement la page propre au DLC lorsqu’une installation reconnue existe ; il conserve une copie précédente et refuse les fichiers modifiés ou inconnus. `--remove` restaure le menu original seulement si ses empreintes sont inchangées. Aucune de ces commandes ne transforme cette campagne autonome en missions natives de Tantalus.

Les validations d’installation utilisent des cibles minimales jetables. Le dépôt principal n’a été ni réécrit ni déployé dans cette passe. La base historique du lanceur est documentée dans `docs/base-audit.json` ; elle n’est pas présentée comme une nouvelle inspection du dépôt connecté.

### Limites restantes

Les 12 chapitres et 27 objectifs sont conservés, pas doublés artificiellement par des micro-objectifs. Le tir et la navigation existent, mais l’équilibrage global du nouvel accompagnement requiert des parties manuelles complètes. La direction artistique emploie encore des formes vectorielles réutilisables et des créatures schématiques. Les accès sont fonctionnels mais partagent une bibliothèque de portes. Newt et Jax ne sont pas des compagnons tactiques. Les animations, sons synthétiques, cinématiques et assets ne sont pas une finition commerciale. Il n’y a aucune voix ou musique copiée des films, aucun multijoueur ajouté, aucune promesse de performance UHD sur tout appareil.

### Suite de production recommandée

La prochaine passe devrait partir de ces captures et de ces emprises pour produire les sprites de personnages et créatures, puis les assets de lieux, sans déplacer au hasard les obstacles déjà testés. Le parcours de Miller sous combat et les réserves de Hicks doivent ensuite être évalués sur des parties intégrales en Survie. La fusion avec Tantalus devra enfin être faite à partir de sa version cumulative réelle, avec tests de régression des autres campagnes. Ces étapes ne sont pas comptées comme déjà livrées.

## Références héritées et créations de cette version

Les liens suivants sont conservés pour la traçabilité du corpus examiné lors de la V1. Ils ne signifient pas qu’un nouveau scénario a été trouvé pendant la V2. Les concepts ne sont pas redistribués dans l’archive.

### S01 — Geoffroy Thoorens

Alien 5 — portfolio du concept artist · PRIMARY_PORTFOLIO.

Concepts de production : architecture industrielle et urbaine, espaces de recherche, personnages et créatures. Les légendes ne constituent pas un scénario.

**Limite :** Le fonctionnement des lieux, leur liaison, les dialogues et leur ordre dans cette campagne sont originaux.

[Consulter la référence](https://djahalland.com/alien-5)


### S02 — Alec Gillis / AVPGalaxy

Entretien studioADI — Alien 5 · PRIMARY_INTERVIEW.

Témoignage sur le travail conceptuel pendant l’écriture de Blomkamp, Carlos Huante et la maquette de Tim Martin ; discussion de membres supplémentaires.

**Limite :** Ne fournit pas le scénario intégral ni les statistiques ou comportements des créatures.

[Consulter la référence](https://www.avpgalaxy.net/website/interviews/alec-gillis/)


### S03 — AlloCiné

Article rétrospectif sur le projet abandonné · SECONDARY_CONTEXT.

Contexte de la suite alternative envisagée après Aliens.

**Limite :** Les déclarations sur l’état du scénario ont varié : aucune restitution scène par scène revendiquée.

[Consulter la référence](https://www.allocine.fr/article/fichearticle_gen_carticle=1000053660.html)


### S04 — darknigthmare

Tantalus Frontier — main vérifié · PROJECT_BASE.

package.json v86, menu principal et copie récursive de assets au build.

**Limite :** Les archives cumulatives des autres DLC n’ont pas été retrouvées dans la recherche de fichiers. Pas de validation de régression du jeu entier.

[Consulter la référence](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/496996f5ea557d970ec625aa346876f3eaed1c5f)


### V2 — Projet Lazare

Les survivants de Calder — systèmes et architecture · ORIGINAL_GAME_EXTENSION.

Hicks compagnon, escorte de Miller, valves et circuits : créations de jeu. Aucun supplément de scénario de production authentifié.

**Limite :** Pas de reconstitution canonique revendiquée.

