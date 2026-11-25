# V110 RC1 — Tenir les accès

## Génie de terrain
Les huit sas de liaison possèdent une structure partagée entre leurs deux faces : 100 d’intégrité et, après soudure, jusqu’à 72 de renfort. Une unique caisse sur la table de câblage de maintenance donne trois plaques, après 1,1 seconde de travail. La caisse est un prop existant ; aucune géométrie statique, salle ou population supplémentaire n’est introduite.

O renforce un sas fermé, intact et sans plaque (1,8 s / une plaque). U découpe puis ouvre (1,4 s / aucune plaque rendue). J refait un battant touché ou arraché (2,2 s / une plaque / ferme le sas). Les deux faces doivent rester libres pour une réfection, et les réservations de passage sont respectées. R refuse de rouvrir un renfort ou de refermer une brèche non réparée.

La consommation n’intervient qu’après achèvement. Marche, tir, impact, portée perdue ou variation de structure interrompent le geste. La pause conserve exactement le temps restant. Les commandes sont mutuellement exclusives avec les soins, ravitaillements et gestes de liaison hérités.

## Pression ennemie
Un Warrior suit une piste mémorisée. Sans route ouverte, il peut rejoindre la face intérieure d’un sas fermé, préparer un coup pendant 0,8 seconde, frapper pour 28, puis récupérer pendant 0,7 seconde. Le renfort est entamé avant le battant : quatre impacts pour 100 d’intégrité seule, sept pour 100 + 72 sans intervention. La mort, l’expiration de mémoire, l’éloignement ou la réouverture annulent l’attaque préparée. Les Facehuggers ne percent pas les structures.

La rupture retire réellement les volumes dérivés des deux côtés : corps, vue, tirs, chemins et franchissements utilisent le même état. Aucun acteur n’est créé, éliminé ou téléporté pour simuler une brèche. Une route ouverte est préférée à la destruction. Les propres coups du frappeur n’effacent pas sa piste en la remplaçant par son propre bruit.

## Rendu et interface
Croix de renfort, fissures, montants déformés et débris de seuil suivent la structure. Le joueur abaisse son arme pendant le travail, avec un outil et des effets de soudure/découpe liés au vrai geste. La progression reste dans l’instrumentation hors canvas, pour ne pas recouvrir la signalétique de porte.

Une barre Génie affiche le nombre de plaques et l’état du sas proche. Sur écran court en paysage, elle partage l’emplacement des réserves : commutation explicite, sans réduire la scène sous le minimum testé. Portrait et desktop conservent les deux instruments. Le son synthétique de travail et d’impact reste optionnel et désactivé par défaut.

## Sauvegardes
Schéma 110 : registre des huit battants, renforts, plaques gagnées/dépensées, gestes et coups préparés. Validation avant toute mutation et reprise en pause. Migration V109 par son validateur réel, sans modification d’équipe, chargeurs, vies, réserves ou objectifs. Les nouvelles structures commencent intactes et les plaques à zéro. V108/V107 conservent leur chaîne ; V106 reste une inspection.

## Hors périmètre
Aucune fusion dans les 64 salles natives Tantalus, aucun push/deploy, aucun nouveau final Reine/P-5000/sas, pas d’inventaire individuel avec poids, de recyclage de plaques, de destructibilité des portes intérieures ni de sprites finalisés. La branche reste autonome et procédurale stylisée.
