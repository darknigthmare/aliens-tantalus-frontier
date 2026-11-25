# V107 RC1 — Rallier Operations

## Ajouts jouables

Une opération locale relie Hadley, Operations, la maintenance, l’infirmerie et la ligne des sentinelles. Deux salles nouvelles, Operations et maintenance, possèdent leurs propres appuis, mobilier et commandes. Cinq liaisons réciproques autorisent le retour et un raccourci de service.

Un registre persistant conserve les pièces inactives. L’équipe possède un seul état partagé entre les salles, au lieu d’être recréée à chaque entrée. Les ressources, les morts, les ordres et les ouvertures restent conservés.

Trois ordres sont utilisables par destinataire : Rallier, Tenir, Couvrir. Les tirs de couverture consomment les réserves des Marines. Newt ne reçoit jamais d’arme ni d’ordre de feu. Elle reste protégée des activations d’IA avant son recrutement, puis doit réellement accompagner l’équipe.

L’ouverture des portes est une action de 0,88 seconde annulable par mouvement, tir, impact ou éloignement. Les collisions restent fermées pendant le geste et la pause conserve son temps restant. Le départ vers une autre pièce exige un groupe proche, un seuil dégagé et une arrivée libre.

L’opération possède cinq étapes ordonnées et un bilan de repli sans score natif. La sentinelle garde sa réserve finie ; le compteur de défense n’avance que dans le lieu actif avec Newt présente et la porte ouverte.

## Présentation

Barre d’ordres et états d’équipe hors du canvas ; nouveau menu de parcours et inspections séparées ; carte topologique des lieux relevés ; signalétique des seuils issue des mêmes liaisons ; console montée sur table et caisse montée sur rack avec élévation explicite ; pompe, transformateur et armoires distincts ; état visuel du relais au poste Operations.

## Persistance

Schéma 107 validé avant toute mutation. Export de toute la session, imports en pause, contrôle des ressources/identités/positions/portes/ordres. Cadence du joueur sauvegardée pour qu’une reprise ne permette pas un tir anticipé. Migration des quatre formats d’inspection V106, sans octroyer de progression locale.

## Préservation

Le noyau spatial V106, ses quatre scènes source et son adaptateur natif sont conservés byte-for-byte. Leurs 56 tests restent dans la recette. La V107 ajoute 55 tests Node, deux parcours complets automatisés et 31 contrôles navigateur.

## Hors de cette version

Pas de fusion native V105 ni de campagne filmique complète ; pas de poursuite ennemie entre les salles ; pas de simulation des pièces inactives ; pas de nouvelle mécanique P-5000 ou de victoire du sas ; pas de sprites définitifs ni de doublage ; pas de publication distante.
