# Xeno Trials V196 · Six décors des films

Les six arènes sont disponibles dans **Xeno Trials → Contrats à la demande → Archives d’environnement → Films**. Le catalogue compte 126 arènes, dont 21 dans Films et 70 dans Simulations Tantalus. Les adaptations V194 classées comme simulations en V195 conservent leur place dans ce filtre et leurs identifiants de sauvegarde.

## Références et mise en scène

Les sources ci-dessous documentent les lieux et leurs repères. Les douze textures ont été créées avec ImageGen pour le jeu. La caméra latérale, la disposition des accessoires et les bandes de sol sont adaptées à l’espace de combat.

| Arène | Repères retenus | Animation du décor |
| --- | --- | --- |
| **Nostromo / Passerelle** · *Alien* | Le remorqueur minier et ses écrans de navigation se traduisent par des rangées de moniteurs cathodiques, des postes de pilotage et des verrières latérales. [20th Century Studios](https://www.20thcenturystudios.com/movies/alien) · [Archives de production de l’ASC](https://theasc.com/article/behind-the-scenes-of-alien/) | Balayage d’écran et impulsion électrique |
| **Nostromo / Infirmerie** · *Alien* | Située sur le pont supérieur comme la passerelle, l’infirmerie possède une table d’opération et des instruments suspendus. Le jeu les évoque avec du mobilier chirurgical isolé, des cloisons claires et du verre bleuté. [AFI](https://catalog.afi.com/Film/53908-Alien) · [Mediascene, 1979](https://www.gigerdb.com/articles/files/Mediascene_35_1979.pdf) | Lecture de confinement et cycle du sas |
| **Hadley’s Hope / Salle des opérations** · *Aliens* | Le scénario situe le centre de la colonie dans le bloc de contrôle, rempli de terminaux et d’afficheurs. Les consoles et la table de commandement structurent la version jouable. [Scénario de James Cameron](https://assets.scriptslug.com/live/pdf/scripts/aliens-1986.pdf) · [20th Century Studios](https://www.20thcenturystudios.com/movies/aliens) | Faisceau de recherche et balayage d’écran |
| **Fiorina 161 / Rivage de la capsule** · *Alien³* | Le crash de la capsule sur la planète-raffinerie et la côte grise de l’ouverture de l’Assembly Cut inspirent le rivage, l’épave et les silhouettes industrielles au loin. [AFI](https://catalog.afi.com/Catalog/moviedetails/59175) · [Lieux de tournage de l’ouverture](https://highwaytohorror.com/alien-3-filming-locations/) | Houle et front orageux |
| **Bouvetøya / Entrée de la pyramide** · *Alien vs. Predator* | La pyramide enfouie sous la glace et les grands escaliers de pierre deviennent le point de fuite de la grotte. Le duel se tient sur une terrasse en contrebas. [20th Century Studios](https://www.20thcenturystudios.com/movies/alien-vs-predator) · [Reportage sur les effets du film](https://www.cgw.com/Publications/CGW/2004/Volume-27-Issue-10-October-2004-/Creature-feature.aspx) | Neige soulevée et faisceau de recherche |
| **Renaissance / Laboratoire des échantillons** · *Alien: Romulus* | Le laboratoire de la station abandonnée reprend les grands volumes et le matériel d’expérimentation décrits par le chef décorateur. Des cuves givrées, des écrans et un éclairage cyan et rouge définissent le décor jouable. [20th Century Studios](https://www.20thcenturystudios.com/movies/alien-romulus) · [Entretien de Naaman Marshall](https://www.immersivemediaco.com/alien-romulus-production-designer-naaman-marshall-builds-a-bridge-between-alien-and-aliens/) | Lecture de confinement et vapeur de refroidissement |

## Parallaxe

Chaque arène utilise une image opaque pour les deux bandes de décor et un PNG RGBA indépendant pour les accessoires. Le fond, les accessoires et la bande sous les pieds se déplacent respectivement de 6,5, 42 et 118 pixels pour 100 pixels de déplacement de la caméra. Deux autres profondeurs accueillent les éléments animés et leurs points d’ancrage. Les événements sont visuels et suivent l’horloge du match. L’option de mouvement réduit les désactive.

La bande sous les pieds se raccorde par réflexion aux extrémités, comme vérifié lors du déplacement de caméra à Bouvetøya.

## Vérification en jeu

Chromium a validé 138 assertions sur le sélecteur français et anglais, les trois déplacements mesurés en combat, les deux événements par arène et les empreintes des douze textures servies. Le test couvre aussi la pause, le mouvement réduit, le rechargement d’un duel sauvegardé et l’abandon sans gain. Les 34 tests du lot et du compositeur, ainsi que les 109 tests de continuité des audits, passent.
