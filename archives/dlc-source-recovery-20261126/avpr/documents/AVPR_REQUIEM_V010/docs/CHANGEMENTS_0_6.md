# 0.6.0 — Rester ensemble

## Périmètre de la livraison

La 0.6 prolonge les sources complètes de la 0.5 autonome, extraites de l’archive fournie. Elle ajoute quatre adultes originaux, quatre rencontres conditionnelles finies, douze supports de mise à couvert liés à des objets solides existants, un dossier de suivi et une vraie pose accroupie humaine. Les salles, raccords, objectifs, armes et données antérieures ne sont pas remplacés. Ce n’est ni une fusion au GameEngine commun, ni une publication GitHub ou Vercel.

Ces personnes, leurs répliques et les replis sont des créations de cette adaptation de fan. « À l’abri » signifie un relais local temporaire ; leur sort après la séquence reste inconnu. L’hélicoptère garde ses passagers d’origine. Le duel, la frappe et le dénouement ne sont pas réécrits. Aucun adulte supplémentaire n’est présenté comme un survivant canonique.

Le rendu demeure vectoriel et procédural. Quatre silhouettes originales différenciées (tablier, tenue de mécanicien, veste de technicien et blouse) et une pose accroupie humaine ont été dessinées par code. Les pieds restent sur le plan du sol. Les acteurs peuvent se croiser pendant un déplacement ; aucun système de foule ni de collisions corporelles mutuelles n’est ajouté. Les anciens décors n’ont pas été redessinés intégralement. Les placements ne désignent pas autant de sprites uniques.

## Protocole d’assistance

### Rencontrer, recruter, rester proche

Chaque adulte n’existe comme interaction que dans sa séquence humaine autorisée. Luis attend l’acquisition des armes ; Owen attend l’ouverture du passage piéton. Une rencontre ignorée n’empêche jamais la suite principale. Approcher à moins de 100 unités de jeu, avec une ligne de vue dégagée, puis E engage 1,1 seconde de recrutement immobile. Un objectif principal à portée garde priorité. Se déplacer ou subir un coup interrompt l’action.

Après recrutement, l’adulte suit un point derrière le joueur. Le chemin utilise les mêmes obstacles et le même plan x / profondeur. Sa vitesse nominale vaut 168 unités par seconde ; elle tombe à 118 sous 35 points de vitalité. Il peut accélérer de 25 % lorsque le joueur s’éloigne à plus de 250 unités. Il ne vole pas et ne traverse pas les meubles. Aucun saut, arme ou tir d’appui ne lui est ajouté.

O ordonne à l’adulte facultatif de suivre ou d’attendre. Cette commande lui donne priorité lorsque Molly ou Jesse sont aussi présentes. Sans adulte facultatif actif, O conserve son fonctionnement antérieur. Attendre signifie rester dans la pièce, pas se téléporter au prochain seuil.

### Vitalité, blessures et soins

La limite commune aux quatre adultes est 80 points, mais ils commencent déjà blessés à des valeurs propres. Sous les attaques ou dans l’acide, leur vitalité diminue réellement. À zéro, la personne reste au sol et ne suit plus. Aucun compte à rebours de saignement, disparition définitive ou mort explicite n’est ajouté. Le joueur peut partir et revenir pendant la même séquence. Ce choix de prototype empêche un blocage permanent des objectifs principaux.

E à portée engage 1,6 seconde d’assistance immobile. Un kit du personnage joué n’est dépensé qu’à la réussite ; le soin restitue 45 points, plafonnés à 80, diminue le stress de 25 et redonne l’état « suit ». Il peut relever une personne au sol. Bouger, être touché ou voir la cible touchée annule l’action sans dépenser le kit. Sans kit, l’aide est refusée explicitement ; aucun objet n’est créé. L’assistance partage donc les réserves de soins du protagoniste.

Les dégâts aux adultes utilisent les facteurs 0,45 en Histoire, 1 en Standard et 1,25 en Survie, avec 1,2 seconde de protection après un coup. Ces réglages ne changent pas les dégâts du joueur. Les nappes acides et les champs des dispositifs 0.5 ne sont pas inoffensifs pour eux : une purge peut infliger 24 dégâts de base une seule fois ; un champ électrique peut infliger 12 par impulsion. L’ancienne vapeur n’explose pas de nouveau lorsqu’un adulte y entre tardivement.

### Stress et appel de groupe

Une créature visible à moins de 350 unités augmente le stress de 12 points par seconde. Hors menace, il baisse de 13 par seconde près du joueur, ou de 5 lorsque le joueur est éloigné. À partir de 78, la marche est ralentie à 55 % ; il n’y a pas de fuite aléatoire incontrôlable ou de verrou de panique infini.

L’appel utilise la position physique KeyZ : W sur un clavier AZERTY, Z sur QWERTY. Le bouton tactile s’appelle Rassurer. Dans un rayon de 410 et sous condition de visibilité, il diminue le stress de 40, rappelle l’adulte debout et rappelle aussi l’escorte principale proche. Son délai de récupération est cinq secondes. Il émet un bruit localisé d’une portée de 470 : rassurer les autres n’est pas silencieux. Un appel sans personne joignable ne dépense pas de récupération. Une personne au sol entend mais ne se relève pas sans soin.

### Menace locale et réserves finies

Le recrutement autorise une seule rencontre additionnelle pour chaque secours. L’adversaire apparaît dans le lieu défini lorsque le joueur s’y rend, après une annonce d’émergence de 2,2 secondes. Quitter, revenir ou charger conserve l’identifiant, les blessures et l’état mort : aucune vague infinie ni duplication.

Un xénomorphe ou facehugger peut choisir l’adulte recruté lorsque ce dernier est visible, à moins de 330 unités et nettement plus proche que le joueur (écart de 55). Une attaque déjà commencée contre le joueur n’est pas détournée en cours d’animation. À portée, le coup contre l’adulte annonce sa zone pendant 0,85 seconde. Sa position est figée pendant l’annonce ; l’adulte peut en sortir. Un coup ne touche pas à la fois le joueur éloigné et sa cible adulte. Les dégâts de base sont 12 pour le facehugger et 16 pour le xénomorphe ; le Predalien ne participe pas à ce système.

Ce comportement reste local à la pièce simulée. Les personnages hors écran ne continuent pas à recevoir des dégâts simulés à l’échelle de toute la ville. Les poursuivants des versions antérieures conservent leur mécanisme propre.

### Portes et relais

Un adulte qui suit doit atteindre les environs du passage avant de le franchir avec le joueur. À plus de 205 unités du seuil, il reçoit un ordre de rapprochement et le joueur attend. La porte doit être disponible et déverrouillée. La traversée utilise la porte réciproque, conserve les blessures et replace la personne sur un point de sol libre près de l’arrivée. Une personne laissée en attente ou au sol reste dans sa pièce. Aucun changement de porte ne soigne.

Au point de repli, le joueur et l’adulte doivent être dans le rayon prévu (130 pour le joueur, 110 pour l’adulte), proches l’un de l’autre, et sans créature vivante visible à moins de 420 unités. E demande deux secondes immobiles. Le relais est validé une seule fois et n’ajoute ni soin, arme, munition, monnaie ni objectif principal. L’adulte reste visible à cet abri tant que la scène le permet.

À la fin de la séquence, les secours non terminés passent à « sort inconnu ». Ils ne suivent pas un nouveau protagoniste ni Wolf. Les quatre secours sont facultatifs et ne fournissent aucune échappatoire à l’ordre des chapitres. Dans le parking, le repli est placé du côté de l’arrivée depuis le barrage, avant de franchir le déclencheur de l’objectif principal : suivre le repère de l’abri avant de poursuivre vers les urgences.

## Mise à couvert humaine

B ou clic droit sélectionne un appui parmi douze objets solides explicitement référencés : voitures, comptoirs, bureaux, brancards et rangements. Le système ne crée aucun mur invisible. Il examine quatre côtés du meuble, refuse les points bloqués, hors limites, trop éloignés (210), ou demandant un chemin trop long (290). En présence d’une menace, il préfère un côté réellement masqué par la géométrie.

Le personnage marche vers ce point par le déplacement normal, puis reste accroupi. Ce n’est pas une téléportation, un aimant au mur ou une réduction abstraite des dégâts. Les projectiles continuent à heurter les meubles : il faut quitter l’appui et trouver une ligne dégagée pour tirer. Il n’y a pas de tir aveugle ou d’animation de penchement autour d’un angle.

Marcher, attaquer, esquiver, être blessé, ouvrir un menu ou franchir une porte annule l’assistance. B permet aussi de sortir. La pose est transitoire et ne reprend pas seule au chargement. Wolf conserve sa garde, sans recevoir cet appui humain. Le vol n’offre pas cette action. Le dessin accroupi utilise des jambes fléchies ; la silhouette n’est plus tassée puis décalée sous le sol.

## Dossier, carte et commandes tactiles

P et Outils ouvrent le dossier en pause. Quatre cartes présentent l’état des contacts ; un nom non rencontré reste masqué. Pour une personne recrutée, le dossier affiche vitalité, stress, état, pièce et repli. Un compte « 4/4 » concerne uniquement les relais temporaires. Le bilan exporté porte explicitement `temporaryShelterOnly: true`.

La carte locale ajoute un point pour l’adulte rencontré et un repère de son repli dans la pièce correspondante. Elle ne téléporte aucun acteur. Une bande hors du terrain conserve le nom et la vitalité de l’adulte actif. Les boutons Couvert, Ordre et Rassurer sont visibles pour les humains quand applicables ; Wolf retrouve Garde et ses propres outils. Les formats portrait et paysage sont contrôlés en émulation navigateur, pas sur un téléphone physique.

## Sauvegarde, reprise et migration

L’espace local reste `tantalus.mire.avpr.v1`. Le bloc `v6` stocke les quatre identités, leurs positions, vitalités, stress, états, rencontres, appels et annonces en cours. Les déplacements temporaires de navigation et de mise à couvert ne sont pas restaurés. Le point de reprise transporte le même état cohérent du monde et des kits que la sauvegarde courante au moment où il est créé.

Les identifiants inconnus, personnes recrutées dans un chapitre futur, positions hors sol, doublons et attaques incohérentes sont filtrés. Un coup dont la cible importée est invalide est annulé, pas transformé en coup gratuit sur le joueur. Réimporter plusieurs fois ne double ni une personne ni le nombre de relais. La sauvegarde locale n’est pas un système anti-triche.

Les versions 0.1 à 0.5 dépourvues de bloc v6 sont chargées sans inventer de secours terminés, sans kit bonus et sans déplacer une partie déjà à la clairière. Les nouvelles personnes sont disponibles seulement dans leurs séquences encore accessibles. Exporter le JSON depuis l’ancien dossier et garder cet original avant import. La compatibilité inverse d’une sauvegarde 0.6 avec les versions antérieures n’est pas garantie.

La ligne de commande accepte `--dry-run` et son alias `--check` sans écrire ; les options inconnues sont refusées avant toute modification. Ce contrôle a corrigé une incohérence héritée : la documentation proposait `--dry-run` mais seul `--check` était interprété. Trois tests de véritable ligne de commande vérifient ces cas.

L’installateur conserve sa fonction limitée : ajout/mise à niveau réversible d’un accès dans un menu Tantalus reconnu. La validation utilise le véritable HTML et l’installateur 0.5 sur un menu temporaire, pas le moteur hôte complet. Aucune récompense Frontière, aucun profil commun et aucun dépôt distant ne sont modifiés.

## Vérifications et limites

Les tests Node couvrent les données, la navigation, les interactions, les réserves, les attaques et la migration. Les parcours intégrals emploient les commandes de simulation du moteur, sans injection de position, santé ou progression, mais connaissent la carte et visent précisément. Les parcours avec secours réalisent les quatre recrutements, soins et relais en plus des cinquante objectifs. Ils ne constituent ni une partie humaine ni une estimation de difficulté ou de durée.

Les contrôles Chromium exécutent le vrai HTML assemblé via `set_content`. La navigation locale a été refusée par la politique de cet environnement ; un Storage mémoire explicite sert à tester sérialisation et import. Les captures distinguent une scène préparée, une action clavier/tactile normale après préparation et un état réellement issu du parcours automatisé. Les profils mobiles sont émulés ; aucun enregistrement d’écoute au casque ni certification de stockage natif `file://` n’est revendiqué.

Des contrôles de capture ont rencontré des délais navigateur pendant l’exécution regroupée. Les séries sont isolées par processus et relancées avec des délais de capture adaptés ; le rapport final ne compte que les séries réussies sur l’empreinte finale. Le rendu reste provisoire, les anciens événements narratifs et les limites du vol sont conservés.

