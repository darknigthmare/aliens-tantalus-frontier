# 0.6.0 — Les veilleurs du silence

Extension du moteur 0.5, pas une réécriture de démonstration.

- Pool persistant de trois capteurs : pose à ses pieds, récupération locale, batterie finie de 180 s, mesure de déplacements effectifs, filtrage par distance et visibilité, même réponse au groupe et aux créatures.
- Liaison locale ou voisine par passage compatible, coupure et reprise depuis la fiche, dernier signal horodaté, pas de recharge ni d’information hors liaison.
- Roue de pause à trois pages / 24 entrées. Commandes réellement raccordées ; actions interdites gardées visibles et inactives ; choix du travail sans validation instantanée.
- Lecteur de manette standard, zone morte radiale, déplacement analogique, viseur sans auto-aim, boutons de jeu et navigation de menus. Retour au neutre après pause et reconnexion, pause à la déconnexion. Test par profils synthétiques, aucun matériel physique.
- Protection contre les répétitions clavier après changement de panneau, guide manette au titre, repères de capteur et signal dans le HUD primaire / carte locale.
- Migration 1–5 → 6, schéma strict et imports atomiques. Sauvegarde des appareils, charge et dernier signal ; échantillons de position transitoires reconstruits après chargement.
- Six notices originales ajoutées, 102 dossiers. 46 fiches de salle conservées et complétées sur les liaisons radio.
- 58 nouveaux tests Node, 56 nouveaux contrôles navigateur. Six parcours complets avec observation distante d’un poursuivant existant, mise en veille puis récupération ; fixtures gagnées et photographiées incluses.

Correction lors de la validation : une pose test derrière un obstacle ne mesurait légitimement pas le poursuivant. Le pilote a déplacé le matériel par les commandes de jeu sur une autre portion du sol, sans retirer l’obstacle ni traverser sa ligne de vue. Le parcours exige maintenant un signal daté APRÈS le départ de Decker, pas un signal local antérieur.

Limites conservées : graphisme vectoriel provisoire, populations ordinaires hors champ figées, pas d’intégration hôte, pas de publication, native file/localhost bloqués par l’environnement, équilibrage humain non certifié.

Revue visuelle finale : largeur des boutons de roue réduite pour supprimer les intersections entre secteurs, notamment à 390 et 360 px ; trois contrôles géométriques ajoutés après correction.
