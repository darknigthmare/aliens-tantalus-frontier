# ALIEN 5 — Projet Lazare / V4

## 01. Une branche autonome

Calder, Lazare, ces six pièces de service, les dialogues et les fins sont des créations du jeu. Le dossier ne revendique ni scénario de film retrouvé, ni continuité officielle. MIRE désigne ici une campagne isolée ; aucun registre natif du moteur principal n’est fusionné.

## 02. Une fonction avant le décor

Un atelier reçoit de l’outillage, un échangeur reçoit des pompes et un collecteur, la surveillance reçoit ses écrans et son raccord de retour. Les nouvelles liaisons restent dans leur service et à leur étage. Les 355 éléments décoratifs sont des placements réutilisant des formes, pas 355 images uniques.

## 03. Domaines et profondeur

18 pièces sont latérales, 24 permettent de se déplacer en profondeur. Largeur logique : 1500 ou 1800. Les positions de profondeur restent normalisées ; la navigation utilise 330 unités et les pieds sont projetés à 455 + z × 200. Ces unités ne sont pas des mesures certifiées en mètres.

## 04. Couches séparées

Le ciel lointain, la structure, les dispositifs, les acteurs et le premier plan sont séparés dans le rendu. Les repères de profondeur et les supports sont décrits dans chaque fiche. Une forme placée hors du chemin ne crée pas une collision invisible.

## 05. Collisions identiques au plan local

Les 48 emprises solides sont rendues dans la couche de jeu. La marche est subdivisée ; une ligne de tir traversant une emprise est bloquée. Le plan local provient des mêmes coordonnées que la simulation. Il n’affiche pas les positions des ennemis.

## 06. 56 connexions réciproques

Une porte associe deux entrées d’un même lien. Les 9 connexions nouvelles ajoutent trois boucles de service. Les parcours A* et les 28 états successifs du scénario sont testés pour empêcher une boucle facultative de contourner une autorisation principale.

## 07. Priorité d’interaction locale

L’action la plus proche est choisie avec un léger départage de type. Une commande distante de quelques dizaines d’unités ne vole plus une porte sur laquelle Ripley se tient. Le défaut rencontré aux archives pendant le parcours automatique a été corrigé et couvert par un test.

## 08. Interventions interruptibles

E commence ou annule le travail. Marcher, tirer ou subir des dommages l’interrompt. Une porte, un ascenseur, une charge et un équipement n’ont pas la même durée. Une interruption ne conserve pas une validation partielle.

## 09. Attendre au seuil

L’attente de l’équipe est active par défaut. Les équipiers présents en suivi et trop éloignés, bloqués ou au sol retardent le passage. Ils se rapprochent réellement. « Partir sans attendre » assume la séparation ; E ou le mouvement annule le regroupement. Les verrous et la portée sont revalidés, même lors du départ forcé.

## 10. Quatre ordres pour Hicks

Suivre autorise le tir ; Suivre en silence déplace Hicks sans ouvrir le feu ; Couvrir fixe sa position tout en autorisant le tir ; Attendre fixe sa position sans tirer. C alterne ces quatre ordres. B regroupe uniquement les équipiers de la pièce et place Hicks en suivi silencieux.

## 11. Un équipier n’est pas un téléporteur

Les personnes séparées restent dans leur pièce, que la carte et le menu Équipe affichent. Les soins exigent une proximité et une ressource. Un allié au sol peut être relevé ; une réserve vide ne le soigne pas gratuitement. G prélève jusqu’à 16 cartouches chez Ripley pour Hicks.

## 12. Miller doit être évacuée

La libération active une escorte lente et sans arme. Le sas du répartiteur de crise vérifie sa présence, sa santé et sa proximité. Le bilan distingue libération et prise en charge. Une V1 ayant déjà accordé l’évacuation narrative conserve cet acquis lors de l’import.

## 13. Chemins moins exposés

Le planificateur pénalise les emprises de sang acide, les jets de vapeur actifs et la bande noyée du bassin non purgé. La route directe est également vérifiée avant d’éviter le calcul A*. Cette préférence n’est pas une garantie d’invulnérabilité : un danger peut s’activer pendant le déplacement.

## 14. Outillage réel

Le détecteur et le découpeur sont à récupérer dans la soute des dépanneurs. La récupération exige 1,3 seconde. Le verrou D2 prend 2,4 secondes et produit du bruit. Le découpeur dispose de son alimentation autonome : il ne consomme pas le carburant de l’incinérateur.

## 15. Détecter le mouvement, pas une identité

T relève le détecteur. Une impulsion est calculée toutes les 0,75 seconde, dans un rayon local de 740 unités. Les contacts mobiles récents peuvent être hostiles ou alliés ; le viseur ne fournit aucune espèce ni faction. Les acteurs immobiles et ceux des autres pièces ne sont pas affichés.

## 16. Batterie et main disponible

Le détecteur consomme 9 points de batterie par seconde et regagne 5 points par seconde lorsqu’il est abaissé. Une batterie inférieure à 2 ne permet pas de le relever. Tirer le rabaisse ; changer de pièce efface les contacts. Les menus suspendent la consommation.

## 17. La torche peut trahir Ripley

Le faisceau ne sert plus seulement à éclairer. Un garde situé devant Ripley, dans le faisceau et sans obstacle peut la détecter plus loin. Le test conserve les effets de l’éclairage de la pièce et de la marche silencieuse. Les gardes possèdent un sens de regard ; les xénomorphes conservent une perception plus large.

## 18. Caméras locales

Cinq caméras surveillent des lieux précis à partir de la rupture du confinement. Leur balayage de 9 secondes et leur empreinte lumineuse proviennent du même calcul que la détection. La suspicion augmente lors d’une présence, décroît hors du faisceau et déclenche une alerte locale de six secondes.

## 19. Pas d’apparition artificielle à l’alerte

L’alarme prévient les gardes déjà présents et leur donne une position à examiner. Elle ne génère pas une vague de renforts illimitée. Couper la vidéo désactive les cinq caméras et ouvre la coursive vers l’infirmerie ; les gardes restent en place.

## 20. Refroidissement et procédure lisible

Après drainage, placer A sur RÉSERVE, B sur RÉSEAU et C sur FERMÉ. Le panneau et une note expliquent cette procédure. Chaque volant avance en 0,65 seconde. Une erreur déclenche une décharge localisée de 2,2 secondes, sans consommer de fusible unique ni bloquer définitivement la campagne.

## 21. Deux minutes, une seule fois

Le refroidissement débloque le retour d’eau et ajoute 120 secondes à la stérilisation. Le marqueur d’application est sauvegardé. L’activation avant ou après le lancement et les importations successives sont couvertes par des tests afin d’éviter le cumul du bonus.

## 22. Combat fini et attaques engagées

Les ennemis possèdent des instances persistantes ; les munitions et les caches sont finies. Une attaque préparée reste liée à la cible acquise : elle ne frappe plus un autre équipier simplement devenu plus proche durant l’animation. Les lignes de tir et la profondeur restent déterminantes.

## 23. La reine reste une résolution environnementale

Trois attaches, puis la commande de rupture, puis le hangar. Les tirs contiennent la reine mais ne remplacent pas cette séquence. Les trois fins principales sont conservées ; les interventions facultatives sont ajoutées au bilan, sans créer une quatrième fin fictive.

## 24. Deux cartes, aucun déplacement instantané

La vue d’ensemble organise le graphe par niveau. Une pièce connue peut recevoir un repère et le HUD indique le prochain accès ouvert. Le plan local affiche portes, emprises, dispositifs et compagnons. Choisir un nœud ne déplace jamais le personnage.

## 25. L’interface laisse la scène visible

La radio, les notifications, le travail en cours, le détecteur et les commandes tactiques sont sous l’image. Les menus Équipe et Matériel donnent accès aux commandes sans clavier. Les armes, le soin, la torche et le leurre possèdent des boutons utilisables au tactile.

## 26. Quatre formats isolés

La clé de cette version est atf.alien5.lazare.v4. Les imports V1, V2 et V3 conservent la progression acquise, sans réécrire les anciennes clés. Une V2 ayant libéré Miller mais ne l’ayant pas évacuée ne reçoit pas gratuitement ce sauvetage. Le registre de 26 ennemis reste complet ; la V4 n’ajoute aucun individu. Les salles actuelles des poursuivants ne sont admises qu’à travers le graphe de portes autorisé.

## 27. Une sauvegarde n’est pas une promesse de stockage

Le refus de stockage est affiché. L’export reste le moyen prudent de déplacer une opération entre fichiers ou origines. Les tests de persistance utilisent un substitut explicite ; la conservation native après fermeture du navigateur n’est pas certifiée dans cet environnement.

## 28. Périmètre des preuves

377 contrôles ont été exécutés et réussis. Le total distingue moteurs historiques, couche V4 assemblée, interface, installateur et deux parcours de campagne. Les cas préparés et les parcours automatisés ne sont pas des parties humaines. La séquence de poursuite dans Chromium commence dans une rencontre préparée ; les déplacements et actions suivants passent par les commandes normales.

## 29. Une fermeture commune aux deux pièces

Chaque cloison utilise l’identifiant de son lien réciproque. Son boîtier se trouve à 105 unités du seuil, vers l’intérieur de la salle. Un état unique indique ouvert, fermé, soudé ou rompu. Fermer ne transforme pas une autorisation absente en accès valide. Une porte coupe-feu n’est pas un obstacle invisible ajouté au milieu de la pièce : elle contrôle le passage entre les deux lieux.

## 30. Une manipulation, pas un bouton à distance

Approchez-vous du boîtier à moins de 100 unités de distance simulée. La fermeture prend 0,75 seconde, la réouverture ordinaire 0,70. Le menu Tactique désactive ses boutons hors de portée. Marcher, tirer ou subir des dommages interrompt le travail, comme pour les autres interventions. Les raccourcis ne contournent ni la portée ni les prérequis.

## 31. Un joint, une seule réserve de renforcement

Le découpeur récupéré en soute permet de renforcer une cloison fermée pendant 2,4 secondes. Son intégrité passe alors à 120, contre 40 pour une fermeture ordinaire neuve. Cette capacité ne s’applique qu’une fois par joint. Ouvrir et refermer ne restaure pas les dégâts. Le travail produit du bruit mais ne prélève pas le carburant de l’incinérateur ; l’alimentation de l’outil reste celle de la V3.

## 32. Une sortie toujours explicable

Un joint soudé peut être découpé en deux secondes depuis son boîtier, de chaque côté, avec le même outil. Il redevient un passage ordinaire dont l’intégrité ne peut excéder 40. Le renforcement reste consommé. Une cloison rompue reste ouverte et n’est pas réparable dans cette version. CF-07 donne sur le sas protégé du répartiteur : la poursuite ne l’emprunte pas ; ne lui attribuez pas un assaut absent du moteur.

## 33. Huit lieux de dissimulation

Chaque niche est un objet séparé, posé au sol et trié avec les acteurs sur son plan. Sa silhouette porte REPLI et le numéro de pièce. X, E à proximité, ou le bouton du menu Tactique permet d’y entrer en 0,75 seconde. L’approche est vérifiée dans le domaine réellement parcourable ; le bref placement dans la niche se limite à sa portée d’interaction, sans téléportation vers une autre pièce.

## 34. Se cacher ne rend pas invulnérable

La porte de la niche se referme, le dessin de Ripley disparaît derrière elle, la torche s’éteint et le détecteur s’abaisse. Un déplacement, un tir, une blessure effective ou une sortie commandée met fin à cet état. Ni l’acide, ni la vapeur, ni le compte à rebours ne s’arrêtent. Les équipiers ne sont pas cachés avec Ripley. Un ordre silencieux évite leurs tirs, pas leur visibilité.

## 35. Une cachette n’efface pas une dernière position

La vue distante et les caméras ne détectent pas Ripley dissimulée. Un ennemi situé à moins de 72 unités avec une ligne dégagée peut toutefois inspecter la niche et la révéler. Une menace qui a vu ou entendu l’entrée poursuit sa recherche sur cette position. Une niche choisie hors de sa vue peut rompre la poursuite ; elle n’est pas une victoire automatique contre toute rencontre.

## 36. Un graphe de poursuite borné

Les 39 liens éligibles sont des portes existantes. Les escaliers, ascenseurs et six pièces protégées sont exclus. Seuls les drones et facehuggers déjà présents peuvent les franchir. Gardes, Trematodes, spécimen à quatre bras et reine restent dans leur pièce. Aucun renfort n’est créé et aucune caste n’est ajoutée. Les exclusions concernent le jeu, pas une capacité biologique attribuée au film.

## 37. Le seuil prend du temps à franchir

Après le passage du joueur, au plus deux individus vus ou récemment engagés, à moins de 620 unités, peuvent suivre. Le délai dépend de leur distance et de leur vitesse, avec une borne entre 2,8 et 10 secondes. Le même enregistrement est retiré des acteurs actifs pendant le transit, puis replacé à la porte réciproque. Ce transit abstrait le hors-champ : aucune animation continue de marche dans un corridor invisible n’est simulée.

## 38. Pression et rupture

Une arrivée contre une cloison fermée entame son intégrité : 13 unités par seconde pour un drone, 5 pour un facehugger. Deux poursuivants peuvent donc accélérer la rupture. Les impacts visuels et sonores consultent cet état, et une courte marge de 0,9 seconde suit la rupture avant l’entrée. Un joint neuf de 120 oppose environ 9,2 secondes à un drone isolé, après son arrivée ; ce n’est pas un chronomètre garanti en présence de plusieurs menaces.

## 39. Retour, mort et persistance

Un retour précoce dans la pièce de départ révèle l’organisme encore en approche au lieu de le supprimer. Un individu mort n’est pas ressuscité. Si Ripley quitte la salle d’arrivée, la créature reste dans cette salle ; elle n’est pas replacée sur le joueur. Le jeu suit le transit hors champ, pas un combat complet entre acteurs dans toutes les salles. Export, import et point de contrôle conservent les déplacements admis, les attentes et les dégâts des cloisons.

## 40. Une attaque engage une cible et une position

La V4 conserve les dégâts et portées des six familles. Chaque attaque possède un délai de préparation et un délai de récupération. Au départ de l’attaque, l’identité de la cible et sa position sont enregistrées. Le dessin indique cette empreinte acquise. La résolution exige encore portée, profondeur, ligne dégagée et proximité de la marque. Un autre équipier n’hérite pas de la frappe quand la cible initiale se déplace.

## 41. Sortir de la marque a un sens

La tolérance spatiale est de 34 unités pour un tir de garde, 68 pour la reine et 46 pour les autres familles. Les attaques manquées sont distinguées des impacts. Le repère n’est pas une explosion frappant tout ce qui entre dans un cercle : le moteur garde une seule cible. Une attaque préparée avant une sauvegarde reprend en recherche, sans dommage immédiat invisible au chargement.

## 42. Aligner les traces et les outils

Le trait d’un tir du joueur s’arrête au premier ennemi ou solide du plan qu’utilise la simulation. Ripley prend une pose d’intervention pendant les commandes non liées aux portes ou aux soins ; le fusil n’est plus brandi pendant cette pose. Les cloisons se dessinent fermées, soudées ou rompues, et les niches ne sont plus de simples marqueurs. Les horloges reçoivent une fixation de paroi au lieu d’une ombre de contact au sol.

## 43. Une ambiance locale optionnelle

Le son est désactivé au départ. Pause permet d’activer un fond synthétique et des effets de pas, tirs, détecteur, impacts, rupture et menaces. Aucune musique ni voix officielle n’est embarquée, aucun microphone et aucun téléchargement audio n’interviennent. La spatialisation gauche/droite utilise la position de l’événement. Le volume général est borné, et les oscillateurs d’ambiance s’arrêtent dans les menus. Les réglages restent propres à la session, pas aux sauvegardes de campagne.

## 44. Un plan local compréhensible

Les niches sont marquées REPLI et les boîtiers CF avec leur numéro. Les accès fermés changent d’aspect sur le plan. Un itinéraire vers une porte fermée ne force pas le passage : elle reste ouvrable au boîtier si ses prérequis sont remplis. Les indications de travail, de dissimulation et de mouvement derrière un seuil demeurent sous l’image, et le menu Tactique est accessible au tactile.

## 45. Charger efface aussi la présentation précédente

L’import d’une partie et le lancement d’une nouvelle opération effacent les effets, notifications et transmissions temporaires de la précédente. Le journal conserve le texte enregistré. Ce nettoyage évite une étincelle, un impact ou un conseil de niche affiché à tort dans une autre scène. Le son de pas réinitialise aussi son échéance lorsque le temps de la nouvelle partie recule.

## 46. Ce qui reste à produire

La direction artistique reste vectorielle et stylisée. Les grandes structures sont réutilisées entre les pièces d’un même département. L’équilibrage humain, les voix et cinématiques, la validation sur appareils physiques et la fusion au moteur cumulatif de Tantalus ne sont pas livrés par anticipation. Les réserves finales du pilote sont généreuses : la campagne n’est pas certifiée comme un mode survie difficile.