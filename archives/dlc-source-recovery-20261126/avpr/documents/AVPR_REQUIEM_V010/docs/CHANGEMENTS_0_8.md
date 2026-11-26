# 0.8.0 — Dans les conduits

## Ce qui change dans la 0.8

« Dans les conduits » prolonge le module autonome AVP-R 0.7 effectivement extrait. Les données des lieux, objectifs, armes, secours, coffrets, analyses, dispositifs et raccords 0.7 sont conservées. Douze fiches et douze règles sont ajoutées ; huit conduits à deux bouches deviennent utilisables par les adversaires existants. Aucun ennemi supplémentaire, aucune salle supplémentaire et aucune liaison inter-salles ne sont créés par ces conduits.

Ces aménagements, leurs positions et leurs réglages sont des choix originaux de gameplay pour cette adaptation non officielle. Ils ne représentent ni des mètres, ni un réseau technique réel de Gunnison, ni des plans authentifiés du film. Le dénouement, les protagonistes, les quinze séquences et les cinquante objectifs principaux ne sont pas réécrits par cette passe.

### Des adversaires qui changent d’angle

Huit pièces disposent chacune d’un circuit interne : bassin de rétention, salle des turbines, piscine, armurerie, couloir supérieur, sous-sol technique, réserve froide du diner et séjour des O’Brien. Deux bouches relient deux positions du sol dans la même pièce. Le personnage joué ne rampe pas dans ces conduits.

Un xénomorphe ordinaire ou un facehugger engagé en recherche ou poursuite peut choisir une bouche proche lorsque l’autre côté offre une approche utile. Le mouvement vers l’entrée utilise la navigation et les collisions ordinaires. Une créature ne disparaît pas à distance pour atteindre arbitrairement une grille. Le Predalien n’utilise pas ce système.

Chaque créature conserve son identifiant, ses blessures et son appartenance à la rencontre. Elle reste dans le tableau des adversaires de la pièce pendant tout le transit. Cachée ne signifie ni éliminée, ni remplacée. Un objectif de nettoyage attend toujours la mort du dernier adversaire, même lorsqu’il rampe derrière une paroi.

Un seul adversaire peut occuper chaque circuit. Une même créature dispose de deux tentatives de transit au maximum, puis reste au sol. Après une sortie, elle doit attendre dix-huit secondes simulées avant une nouvelle tentative. Une entrée interrompue par un tir compte comme une tentative ; le délai empêche de recommencer immédiatement la même animation.

### Quatre états, pas une téléportation offensive

L’entrée dure 1,05 seconde : l’ennemi reste visible et vulnérable. Un tir qui le blesse interrompt l’entrée et le laisse au sol, avec ses blessures. Le déplacement caché dure ensuite 3,2 secondes. Les armes ne peuvent pas le toucher au travers du mur pendant cette phase. Les balises laser ne réagissent pas à la translation logique d’un acteur invisible derrière la paroi.

La sortie dure 1,5 seconde et dispose d’un signal visuel au sol, d’un mouvement de grille et d’un message. La créature est de nouveau vulnérable pendant cette annonce mais n’attaque pas immédiatement. Une seconde de récupération supplémentaire suit l’émergence complète. Le système n’ajoute pas une attaque instantanée sur le joueur à l’autre bout du circuit.

Un quatrième état, la rupture d’une fermeture, intervient si aucune sortie libre n’est disponible. Les coups, l’intégrité et leur progression appartiennent au même adversaire et à la même bouche ; ce n’est pas une nouvelle apparition.

### Condamner une bouche

E, près d’une bouche accessible à moins de 78 unités et sans obstacle visuel, engage une action immobile de 1,4 seconde. Le contexte de l’objectif principal reste prioritaire. Une marche ou un coup interrompt le travail. Le coût n’est prélevé qu’après réussite, si les conditions sont toujours valides.

Les humains partagent six brides pour toute la campagne. Fermer une bouche en dépense une. Wolf utilise son propre outil et dépense 25 points d’énergie au lieu d’une bride humaine ; cet outil est indisponible lorsque la séquence le prive de son équipement. Aucune fermeture ne rend de soin, de kit, de munition ou d’objectif.

Chaque fermeture possède 100 points d’intégrité. Une bouche déjà fermée ne consomme rien ; une bouche occupée par une entrée, une émergence ou des coups refuse le travail. On ne peut pas condamner une grille à distance, depuis un escalier intermédiaire, en vol ou avec un adulte porté. La fermeture éteint le camouflage de Wolf.

La fermeture interdit les nouvelles entrées par cette bouche. Si elle est posée sur la destination d’un acteur déjà caché, celui-ci cherche à ressortir de l’autre côté. Ce retour prend un délai supplémentaire. Si les deux bouches sont condamnées, il force la fermeture choisie à raison de 25 points d’intégrité par seconde : quatre secondes au plus depuis une fermeture intacte. L’émergence est encore annoncée après la rupture.

Fermer les deux côtés ne tue donc pas la créature et ne peut pas la retenir éternellement au détriment de l’objectif. Une fermeture arrachée reste visiblement endommagée. Elle peut être remplacée après dégagement en payant à nouveau le coût normal. Les brides ne sont pas récupérables ; quitter une salle ou changer de séquence ne les reconstitue pas. La réserve de six brides est distincte des cellules de balises, doses de neutralisant et fusées déjà présentes.

### Écouter sans radar omniscient

La position physique de touche KeyQ déclenche l’écoute : A sur un clavier AZERTY, Q sur QWERTY. Un bouton tactile Écouter utilise le même gestionnaire. Le personnage doit rester immobile pendant 1,1 seconde ; un déplacement ou un coup annule l’action. Aucun consommable n’est dépensé. Une fois le résultat obtenu, un délai de six secondes précède une nouvelle écoute.

Le résultat reste affiché 3,5 secondes. Il indique un côté et une proximité approximative, par exemple des frottements lointains à droite. Il ne fournit ni coordonnées, ni nombre exact de créatures, ni vitalité. L’écoute peut distinguer les pas d’un acteur au sol des frottements d’un transit. Les bruits forts proches peuvent masquer le résultat. « Aucun bruit distinct » n’est pas une garantie de pièce vide.

Les indications sont également textuelles : le jeu ne demande pas d’activer le son pour percevoir l’annonce. Les sons mécaniques supplémentaires utilisent le générateur local existant et, lorsque le navigateur le permet, une répartition gauche/droite. Ils sont synthétiques : pas de bande sonore du film, pas de voix d’acteur. Aucun jugement acoustique au casque n’a été effectué.

### Découverte, représentation et limites spatiales

Le plan M et le dossier P présentent les bouches observées, les fermetures et la réserve de brides. Une bouche se découvre par proximité visible ou par une annonce de grille suffisamment proche ; les deux bouches ne sont pas automatiquement révélées ensemble. Un circuit inconnu ne fournit pas à l’avance un relevé complet des pièces suivantes. Le plan reste consultatif, sans téléportation.

Seize modules graphiques de bouche sont rendus, avec leurs châssis, lamelles, vis et conduits montants. Sept familles de matériaux les adaptent aux huit pièces. Les brides sont visibles en croix, leur intégrité est affichée et les pièces arrachées restent déformées. Le passage des créatures utilise une pose fléchie et une translation contrôlée, pas une nouvelle animation squelettique 3D.

Ces modules ne créent pas de nouveaux obstacles invisibles au sol. Les 330 props et 678 placements de détails hérités conservent leurs données ; les seize bouches sont un jeu de modules de rendu séparé et non seize sprites photoréalistes. Le rendu reste vectoriel et procédural. La totalité des anciens décors n’a pas été redessinée.

Les transits ne franchissent pas les limites de la pièce. Les poursuivants aux portes restent gérés par le système précédent, qui exclut un acteur déjà caché dans un conduit. Un ennemi ne peut donc pas être à la fois dans une grille et dans la file d’une porte. Les escaliers intermédiaires, le vol et l’arène du Predalien restent distincts.

Les salles hors écran sont suspendues avec leurs conduits. Quitter la salle pendant un transit ou une rupture met cette simulation locale en attente ; elle reprend au retour. La campagne et les objets fondés sur une horloge globale conservent leurs règles antérieures. Ce n’est pas une intelligence simulant en continu tous les bâtiments de Gunnison.

## Persistance et reprise

Le namespace local reste `tantalus.mire.avpr.v1`. Le bloc v8 contient les brides, les fermetures, les bouches découvertes, les trajets actifs, leurs durées restantes, les limites de tentatives et les statistiques. L’identité et les blessures de la créature restent dans la même sauvegarde de rencontre. Le fichier JSON peut être exporté pendant une entrée, un transit caché, une rupture ou une émergence.

Le chargement vérifie les identités contre les adversaires réellement sauvegardés. Une route inconnue, impossible, trop éloignée ou dupliquée n’est pas acceptée comme moyen de déplacer gratuitement l’acteur. Un trajet refusé ne supprime pas l’ennemi de l’objectif. Un retour vers la bouche d’entrée dû à une fermeture reste, lui, un état valide. Le filtrage est une cohérence locale, pas un système anti-triche en ligne.

L’indice d’écoute éphémère n’est pas conservé ; son délai est conservé. Les fermetures et leur intégrité reprennent sans réparation gratuite. Les blessures restent inchangées après chargement. Aucun nouveau point de reprise sécurisé n’est créé tant qu’un conduit contient un trajet actif ; le point antérieur reste utilisable. Une reprise après mort restaure naturellement un état antérieur cohérent, comme pour les autres ressources.

Les formats 0.1 à 0.7 sans v8 sont acceptés et reçoivent seulement la dotation initiale de six brides, sans parcours, découvertes, soins ou secours inventés. Conserver l’export original avant de migrer. Le retour d’un JSON 0.8 dans une version plus ancienne n’est pas garanti.

## Systèmes conservés

Les quatre protagonistes, les escortes de Molly et Jesse, les quatre secours adultes facultatifs, le stress, le couvert et le portage restent actifs. Un adulte porté conserve ses blessures ; les échelles verticales restent refusées dans cet état. Les huit parcours architecturaux et leurs trois dangers annoncés sont conservés. Le portage occupe les mains et empêche de condamner une bouche.

Les annexes à deux accès, les quinze coffrets finis, les fusées, les douze appareils de diversion, les huit relevés de Wolf, ses balises et son neutralisant conservent leur fonctionnement. Le Predalien garde ses phases et annonces. Le vol reste un parcours contraint et non armé, avec sept obstacles et des limites assistées ; il n’est pas une carte réelle ni un pilotage libre.

Les aides de vitalité et de kit entre séquences, les réserves anciennes par séquence et les autres mécanismes hérités ne sont pas rééquilibrés intégralement dans cette version. Les anciens journaux CHANGEMENTS_0_2 à CHANGEMENTS_0_7 décrivent leur ajout d’origine ; leurs nombres de tests sont historiques et ne remplacent pas le rapport courant.

## Contrat de vérification

Les tests Node comparent les données 0.7 avec l’extraction réelle, contrôlent les seize accès, l’identité, les quatre états, les coûts, les annulations, les tirs, les balises, les objectifs, les deux fermetures, les migrations et la pause. Les contrôles Chromium exécutent le HTML assemblé. Le rapport associe chaque série navigateur à l’empreinte du HTML livré.

Douze parcours de campagne couvrent quatre profils dans les trois difficultés : principal, secours soignés, secours avec portage de Mara et secours avec observation des conduits. Les trois derniers profils d’observation retiennent volontairement le tir pendant les phases de grille afin de laisser un transit se terminer. Ils atteignent chacun cinquante objectifs et quatre relais avec au moins une émergence réelle. Les autres bots peuvent abattre une créature pendant son entrée : une tentative seule ne prouve pas un transit complet.

Ces bots connaissent la carte et visent précisément. Ils utilisent les déplacements, combats et commandes du moteur ; ce ne sont ni des parties humaines, ni une estimation de difficulté ou de durée. Les cinq tours d’annexes et le parcours des huit analyses et traitements de Wolf sont des vérifications complémentaires séparées.

La navigation native `file://` a été réellement tentée puis refusée par l’environnement. Les tests n’ont pas contourné cette restriction : ils utilisent `set_content` et un Storage mémoire de test explicitement déclaré. L’import JSON est aussi vérifié par le véritable champ de fichier du navigateur. Ni le stockage natif, ni un téléphone physique, ni un contrôle sonore au casque ne sont certifiés.

Les captures sont de vrais rendus du prototype. Elles précisent si le personnage ou la rencontre a été préparé pour isoler le test, puis quelles actions proviennent du clavier, de la souris, du toucher ou de l’IA. Elles ne sont pas des images promotionnelles ou des captures d’une partie humaine intégrale.

## Installation et statut de livraison

Le HTML autonome contient le module complet. L’installateur ajoute ou met à jour un accès dans un menu Tantalus reconnu ; il ne fusionne ni GameEngine, ni les profils, ni les récompenses du jeu hôte. La mise à niveau est testée avec le vrai HTML et le vrai installateur 0.7 sur un menu temporaire. Le contrôle à blanc n’écrit rien, l’ancien payload est conservé et la désinstallation restaure le menu selon le reçu.

Aucun dépôt distant, aucun déploiement Vercel et aucune bibliothèque personnelle ne sont modifiés par cette livraison. Le projet reste une adaptation autonome non officielle et évolutive, pas un jeu commercial certifié terminé.

