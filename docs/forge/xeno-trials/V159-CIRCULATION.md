# V159 — BISHOP et références consultées

Ce suivi repart du V158 réellement finalisé : tête testée `66f0f5f7bc1e7d07a683e2cff9d95406f842af23`, fusion `f4c943a66e85153d9bf989c24d2fda0b5fe91897` de la PR12. Les 68 tâches, 17 priorités et 189 identités restent distinctes. La recette propre à V159 reste en prépublication ; les résultats V158 ne lui sont pas attribués.

## Un trajet entre laboratoire et baie synthétique

Le nouveau lot suit le même BISHOP (`crew-05-bishop-9`) entre `science-lab` et `synthetic-bay`, sur le pont 1. Le planning natif déclenche le départ, la visite et le retour. Il ne remplace pas le trajet par une nouvelle position échantillonnée à l’heure de travail. Une présence déjà native au chargement est une condition initiale, sans affirmer que son trajet antérieur a été parcouru.

BISHOP marche sur les supports existants. Le passage entre les deux systèmes de coordonnées attend l’occultation complète par les vantaux du sas apparié. Le corps retrouve le même décalage mesuré dans l’ouverture, sur le support d’arrivée ; le transfert occulté n’ajoute ni distance de marche fictive, ni récompense. Aucun sprite de dos, fondu, changement d’échelle ou glissement de profondeur n’est créé pour simuler ce passage.

Les modes effectivement résolus des deux pièces sont **2D intégrales**, `strict-side-elevation`, avec `dxPerY=0`, `serviceDepth=0` et `mixed=false`. Les pieds restent sur le sol `y=624`. Le champ de présentation ancien mentionnant 2.5D ne prévaut pas sur cette géométrie effective. Ce trajet de PNJ ne livre pas une nouvelle pièce en 2.5D et ne mélange pas les deux modes dans une pièce.

L’acteur, sa position, sa progression et les phases du sas sont bornés et persistés séparément du registre historique d’intentions. Mission, crise, infestation, soins et indisponibilité conservent leurs priorités. Une affectation hors de la paire restitue l’acteur à sa routine native V62, avec un reçu `nativeHandoff` marqué `observedTravel=false`. Cette restitution ne prouve pas une marche vers la quarantaine, une mission ou des soins. Le trajet n’étend pas le parcours jusqu’à la quarantaine ; il ne transforme pas les autres affectations en déplacements continus. Sous crise ou infestation pendant le passage, BISHOP rouvre le vantail de sa pièce courante, se retire réellement sur son sol puis laisse le sas se fermer une fois son corps entièrement dégagé. La réservation ne disparaît pas pendant que le corps occupe encore l’ouverture. Cette récupération, sauvegardable, ne change ni repère de pièce ni compteur de franchissement ; hors du sas, l’alerte conserve la pose appuyée. Le circuit ECHO-A du commandement V158 reste séparé. Les autres routes d’annexes, les ponts et ascenseurs demeurent à compléter.

## Références effectivement récupérées

Le complément distingue **15 contenus récupérés** : 11 pages HTML, deux index publics de projets et deux images officielles statiques vues. Les notices donnent URL, auteur ou éditeur, date de consultation, empreinte, apport et limite. Les 96 correspondances couvrent des IDs de tâches, identités, costumes, armes et priorités ; ce ne sont pas 96 nouveaux personnages ou 96 animations.

Les sources officielles documentent notamment l’identité des jeux et du film, certains noms, capacités et silhouettes. Les projets de Raymond Sebastien et le crédit de production distinguent Guardian Version.02, la recherche Guardian Version.01 rejetée, Fanatics, Androids et Commando. Une légende ou un index d’image ne prouve pas les pixels de la planche ; les quatre requêtes CDN restées bloquées ne deviennent pas des images consultées. L’image officielle de la Reine Pathogen est une référence statique de cette variante, pas une mesure de collision ou un cycle animé.

`references-v159.json` et les deux tables nouvelles conservent les correspondances du complément figé. Leur colonne d’état est explicitement le **relevé historique prépublication V158**. Elle ne remplace ni le V158 final ni l’inventaire courant. Les 65 fiches V146 restent à l’identique et ne comptent pas comme de nouvelles consultations. Aucun texte brut de page, extrait long ou fichier de référence n’est ajouté aux assets du jeu.

## Ce qui reste à prouver et produire

La table des 189 IDs conserve ses colonnes d’édition ou build, timecode ou page et capture approuvée. Ces preuves de mouvement absentes restent absentes. Les références d’identité, de conception et de lore ne certifient ni les 40 présentations, ni les 28 tâches ART153, ni une animation 1:1. Aucune clôture artistique, aucun nouveau pixel, atlas franchise ou rig supplémentaire n’est déclaré.

Les 185 autres rigs, les corpus de locomotion et de combat, les dessins de corps couchés et raccords cachés, les 30 atlas franchise, le cloud Forge et les scripts libres restent ouverts. Le classeur encyclopédie brut et les archives DLC Blackout/Earth ou V10 restent absents ; le catalogue courant et les métadonnées du pont Excel disponibles restent distincts de ce fichier brut. Aucune archive sandbox ancienne n’est réinventée depuis un manuel d’un autre jeu.

## Conservation et recette

Les 13 classeurs V146–V158 et les trois documents publics V158 restent à l’octet. La succession ancre le prédécesseur, déclare chaque ancien et nouveau SHA volontairement modifié et vérifie les sources courantes. Les ponts antérieurs restent contrôlés sans dépendre de commits Git absents d’une CI shallow. Le générateur XLSX ne rafraîchit jamais les pins.

Les contrôles Node, navigateur, CI, fusion et déploiement de V159 doivent fournir leurs propres reçus. La tête API d’une PR, le checkout réel d’un job CI, le commit source du build et le contenu HTTP déployé restent des identités distinctes. Captures automatiques et relecture d’images ne constituent pas un essai humain ou une approbation canonique.
