# AVP-R — Les lieux et les visages

## 0.10.0-candidate.1 · audit de fidélité et de cohérence

Cette candidate prolonge les sources réelles de la 0.9. Elle contient le module autonome complet, pas un correctif vide et pas le jeu Tantalus hôte. Les modifications concernent sept lieux, la structure des accès, les silhouettes et l’équipement. Les quinze séquences et cinquante objectifs principaux sont conservés.

**Objectif 1:1 : non atteint.** La cohérence locale des passages est testée ; les dimensions, implantations et costumes exacts ne sont pas authentifiés plan par plan. L’inventaire ne certifie pas que tous les lieux, armes et personnages du film sont présents. Les trois tableaux distants ne sont pas des niveaux. Plusieurs armes ne sont encore que répertoriées ou représentées dans un décor.

Le rendu reste original, vectoriel et procédural. Il ne contient pas de photogrammes ou de voix du film. Les expressions faciales, anatomies, matériaux et costumes secondaires restent stylisés. Le choix d’un montage unique n’est pas encore verrouillé : les différences cinéma / non censuré / scènes coupées sont signalées plutôt que mélangées sous l’étiquette « canon vérifié ».

## Ce que les références permettent de dire

Le dossier distingue l’identité de l’œuvre, les images de production, les descriptions spécialisées, l’identification secondaire des armes et un accessoire physique de production documenté. Consulter un index de photographies ne signifie pas avoir vu tous les grands fichiers ou relevé tous les plans. Aucun script complet authentifié, métrage image par image ou plan architectural mesuré n’a été obtenu.

Les noms et détenteurs d’armes servent de référents ; les dégâts, munitions, durées, réserves et dimensions appartiennent au jeu. Les identifications incertaines, notamment GUU-5P / Colt 723, restent incertaines. Le jeu PSP n’est pas utilisé pour compléter artificiellement l’arsenal du film.

## Registre quantitatif

| Définition | Nombre |
|---|---|
| Lieux au sol | 48 |
| Environnement aérien | 1 |
| Liaisons réciproques | 65 |
| Extrémités avec support déclaré | 130 |
| Nouveaux lieux au sol | 7 |
| Séquences / objectifs principaux | 15 / 50 |
| Props / détails placés | 373 / 678 |
| Observations de terrain | 48 |
| Fiches / règles héritées | 153 / 156 |
| Entrées arsenal-équipement | 30 |
| Profils visuels / placements secondaires | 11 / 8 |
| Tableaux distants non jouables | 3 |

## Contrat architectural appliqué

Les 65 connexions possèdent 130 extrémités. Chacune indique son bâtiment, son niveau de référence, sa destination, sa famille de support et sa position. Les 47 lieux au sol du réseau urbain sont liés ; la clairière finale forme le 48e lieu au sol, atteint par la séquence aérienne. Le couloir aérien est compté séparément. Les chapitres continuent de limiter les accès : une liaison réciproque n’est pas nécessairement ouverte à chaque instant.

Les routes et sentiers ne portent plus de battant magique : ils utilisent une continuité de sol et un repère de direction. Les jardins reçoivent un accès de clôture. Les entrées de bâtiment sont rattachées à des façades avec toit, retours de paroi et fenêtres ; les pièces intérieures emploient des enveloppes de coupe. Les accès descendants extérieurs sont rendus au sol comme regards ou descentes avec garde-corps, et non comme échelles dressées dans la rue. Le passage du Stryker est une rampe rattachée au véhicule.

Le raccord parking → sous-sol technique est désormais un escalier dans les deux sens. Les annexes appartiennent au bon ensemble : pharmacie et blanchisserie à l’hôpital, réserve froide au diner, atelier au shérif, relevage aux égouts. Les six props déplacés pour dégager les seuils conservent leur identité. Toutes les extrémités sont atteignables par la navigation avec les rayons 17 et 29 ; les sept nouveaux locaux ont des objets bornés et des empreintes solides sans intersection entre elles.

**Limites de la coupe :** ces parois sont des volumes de représentation, pas un maillage architectural 3D intégralement collisionné. Les meubles, limites de sol, portails et restrictions de traversée conservent la simulation du moteur. Un graphe valide ne garantit pas la correspondance à une rue réelle. Les bâtiments lointains restent en partie des motifs de décor. Les huit traversées intermédiaires de la 0.7 et leurs dangers sont conservés.

## Tous les environnements du module

| Lieu | Ensemble / niveau | Raccords | Statut |
|---|---|---|---|
| Lisière de Gunnison | woods / 0 | Épave du vaisseau éclaireur, Ravine et ponceau, Bois — clairière des chasseurs | adapted-unmeasured |
| Épave du vaisseau éclaireur | scoutship / 0 | Lisière de Gunnison, Ravine et ponceau | adapted-unmeasured |
| Ravine et ponceau | woods / 0 | Lisière de Gunnison, Épave du vaisseau éclaireur, Descente du collecteur, Bois — clairière des chasseurs | adapted-unmeasured |
| Descente du collecteur | sewers / -1 | Ravine et ponceau, Chambre de répartition, Enceinte de la centrale, Collecteur — abri des sans-abri | adapted-unmeasured |
| Chambre de répartition | sewers / -1 | Descente du collecteur, Bassin de rétention, Galerie de maintenance, Station de relevage — pompes de secours | adapted-unmeasured |
| Galerie de maintenance | sewers / -1 | Chambre de répartition, Hôpital — sous-sol technique, Station de relevage — pompes de secours | adapted-unmeasured |
| Bassin de rétention | sewers / -1 | Chambre de répartition, Collecteur — abri des sans-abri | adapted-unmeasured |
| Enceinte de la centrale | powerplant / 0 | Descente du collecteur, Salle des turbines, Centre-ville — commerces | adapted-unmeasured |
| Salle des turbines | powerplant / 0 | Enceinte de la centrale, Poste de contrôle | adapted-unmeasured |
| Poste de contrôle | powerplant / 0 | Salle des turbines | adapted-unmeasured |
| Centre-ville — commerces | town / 0 | Enceinte de la centrale, Piscine du lycée, Vestiaires du lycée, Diner — salle, Quartier des O’Brien, Poste du shérif, Magasin de sport — chasse et pêche, Carrefour du barrage, Pizzeria — comptoir et livraison | adapted-unmeasured |
| Diner — salle | diner / 0 | Centre-ville — commerces, Diner — cuisine | adapted-unmeasured |
| Diner — cuisine | diner / 0 | Diner — salle, Ruelle des livraisons, Diner — réserve froide | adapted-unmeasured |
| Piscine du lycée | school / 0 | Centre-ville — commerces, Vestiaires du lycée | adapted-unmeasured |
| Vestiaires du lycée | school / 0 | Piscine du lycée, Centre-ville — commerces | adapted-unmeasured |
| Quartier des O’Brien | town / 0 | Centre-ville — commerces, Maison — séjour, Poste du shérif, Annexe du shérif — atelier automobile, Cimetière — allée et mausolée | adapted-unmeasured |
| Maison — séjour | obrien / 0 | Quartier des O’Brien, Maison — étage, Maison — jardin arrière | adapted-unmeasured |
| Maison — étage | obrien / 1 | Maison — séjour | adapted-unmeasured |
| Maison — jardin arrière | obrien / 0 | Maison — séjour, Ruelle des livraisons | adapted-unmeasured |
| Poste du shérif | sheriff / 0 | Quartier des O’Brien, Centre-ville — commerces, Annexe du shérif — atelier automobile | adapted-unmeasured |
| Magasin de sport — chasse et pêche | sports / 0 | Centre-ville — commerces, Magasin de sport — réserve | adapted-unmeasured |
| Magasin de sport — réserve | sports / 0 | Magasin de sport — chasse et pêche, Ruelle des livraisons | adapted-unmeasured |
| Carrefour du barrage | town / 0 | Ruelle des livraisons, Centre-ville — commerces, Place de rassemblement, Barrage routier | adapted-unmeasured |
| Place de rassemblement | rally / 0 | Carrefour du barrage | adapted-unmeasured |
| Barrage routier | convoy / 0 | Carrefour du barrage, Hôpital — parking, Stryker — compartiment des survivants | adapted-unmeasured |
| Hôpital — parking | hospital / 0 | Barrage routier, Hôpital — accueil des urgences, Hôpital — sous-sol technique | adapted-unmeasured |
| Hôpital — accueil des urgences | hospital / 0 | Hôpital — parking, Hôpital — triage, Hôpital — escalier protégé, Hôpital — sous-sol technique, Hôpital — pharmacie de garde | adapted-unmeasured |
| Hôpital — triage | hospital / 0 | Hôpital — accueil des urgences, Hôpital — couloir supérieur, Hôpital — pharmacie de garde | adapted-unmeasured |
| Hôpital — escalier protégé | hospital / 0 | Hôpital — accueil des urgences, Hôpital — couloir supérieur, Hôpital — blanchisserie technique | adapted-unmeasured |
| Hôpital — couloir supérieur | hospital / 1 | Hôpital — escalier protégé, Hôpital — gaine d’ascenseur, Hôpital — toiture technique, Hôpital — triage, Hôpital — service maternité | adapted-unmeasured |
| Hôpital — sous-sol technique | hospital / -1 | Hôpital — parking, Galerie de maintenance, Hôpital — gaine d’ascenseur, Hôpital — accueil des urgences, Hôpital — blanchisserie technique | adapted-unmeasured |
| Hôpital — gaine d’ascenseur | hospital / -1 | Hôpital — sous-sol technique, Hôpital — couloir supérieur | adapted-unmeasured |
| Hôpital — toiture technique | hospital / 2 | Hôpital — couloir supérieur, Hôpital — hélisurface | adapted-unmeasured |
| Hôpital — hélisurface | hospital / 2 | Hôpital — toiture technique | adapted-unmeasured |
| Ruelle des livraisons | town / 0 | Diner — cuisine, Maison — jardin arrière, Magasin de sport — réserve, Carrefour du barrage, Diner — réserve froide, Pizzeria — comptoir et livraison, Cimetière — allée et mausolée | adapted-unmeasured |
| Clairière — périmètre militaire | extraction / 0 | Transition narrative / vol | adapted-unmeasured |
| Vallée — couloir de fuite | airlift / 0 | Transition narrative / vol | adapted-unmeasured |
| Station de relevage — pompes de secours | sewers / -1 | Chambre de répartition, Galerie de maintenance | original-gameplay-annex |
| Diner — réserve froide | diner / -1 | Diner — cuisine, Ruelle des livraisons | original-gameplay-annex |
| Annexe du shérif — atelier automobile | sheriff / 0 | Poste du shérif, Quartier des O’Brien | original-gameplay-annex |
| Hôpital — pharmacie de garde | hospital / 0 | Hôpital — accueil des urgences, Hôpital — triage | original-gameplay-annex |
| Hôpital — blanchisserie technique | hospital / -1 | Hôpital — sous-sol technique, Hôpital — escalier protégé | original-gameplay-annex |
| Bois — clairière des chasseurs | woods / 0 | Ravine et ponceau, Lisière de Gunnison | nouveau · film-place-adapted-layout |
| Collecteur — abri des sans-abri | sewers / -1 | Descente du collecteur, Bassin de rétention | nouveau · film-place-adapted-layout |
| Pizzeria — comptoir et livraison | pizzeria / 0 | Centre-ville — commerces, Ruelle des livraisons | nouveau · inferred-workplace-adapted |
| Cimetière — allée et mausolée | cemetery / 0 | Quartier des O’Brien, Ruelle des livraisons | nouveau · film-place-adapted-layout |
| Hôpital — service maternité | hospital / 1 | Hôpital — couloir supérieur, Hôpital — nurserie contaminée | nouveau · film-place-adapted-layout |
| Hôpital — nurserie contaminée | hospital / 1 | Hôpital — service maternité | nouveau · film-place-adapted-layout |
| Stryker — compartiment des survivants | stryker / 0 | Barrage routier | nouveau · film-place-adapted-layout |

## Nouvelles armes réellement exécutées

Le Combistick ajoute une attaque rapprochée d’allonge ; cette candidate ne lui donne pas de lancer. Le shuriken produit un projectile à six lames, puis un objet physique à récupérer avec E. Wolf commence avec trois exemplaires ; aucun retour automatique à la main n’est simulé. Une sauvegarde en plein vol de l’arme la convertit en objet posé cohérent, sans dupliquer sa munition. Les objets inutilisés sont rappelés lors d’un changement de séquence valide.

Le M4A1 est acquis par une interaction immobile de 1,1 seconde au râtelier du Stryker : trente cartouches chargées et soixante en réserve. L’acquisition ne se répète pas à chaque passage. L’accès militaire est partagé par la progression ; les dotations des protagonistes concernés sont distinctes et chacune n’est accordée qu’une fois. Il s’agit d’un choix d’économie du jeu, pas de chargeurs mesurés dans le film.

Le pistolet plasma transformé de Wolf utilise son énergie, tandis que celui de Dallas conserve le système de charges hérité. Après la lecture du masque, le second canon apparaît ; après reconfiguration, les canons d’épaule sont retirés du rendu et le pistolet devient l’arme correspondante. Après la perte, cette arme disparaît. Au duel sans équipement, seules les lames sont proposées. Deux canons visibles ne signifient pas deux systèmes de ciblage indépendants.

Le Winchester remplace l’identification visuelle générique du fusil. Les pistolets de Ricky et Kelly reçoivent des silhouettes distinctes ; ils conservent cependant une mécanique commune héritée. Certains anciens accès aux armes par rôle restent adaptés au gameplay. Les trente entrées suivantes ne sont donc pas trente armes utilisables, ni une garantie d’exhaustivité.

| Entrée | Référent / détenteur | Statut dans le jeu | Implémentation | Référence |
|---|---|---|---|---|
| Lames de poignet | Wolf | jouable | Lames rapprochées, disponibles au duel. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Combistick | Wolf | jouable | Nouvelle attaque d’allonge ; pas de lancer de lance ajouté. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Shuriken à six lames | Wolf | jouable | Trois exemplaires initiaux, vol et récupération physique ; indisponible après abandon de l’équipement. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Canon(s) d’épaule | Wolf | jouable | Second canon visible après lecture du masque ; armement d’épaule retiré après reconfiguration. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Pistolet plasma transformé | Wolf / Dallas | jouable | Wolf : énergie ; Dallas : système de charges hérité, approximation explicitée. | [Hollywood History Online — Wolf’s Plasmacaster Pistol](https://www.hollywoodhistoryonline.com/product/wolfs-plasmacaster-pistol/) |
| Fouet | Wolf | jouable | Attaque longue et étourdissement conservés. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Gantelet de force | Wolf | contextuel | Rupture localisée de la dalle du collecteur, pas destruction universelle. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Mines / maillage laser | Wolf | jouable adapté | Balises de la 0.5 : faisceau unique, pas reproduction exacte de tout le maillage du film. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Liquide dissolvant | Wolf | jouable adapté | Neutralise acide et dépôts analysés, pas toutes les matières organiques du décor. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Bio-masque et visions | Wolf | jouable | État porté/retiré et visées ; reproduction graphique stylisée. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Camouflage | Wolf | jouable | Coût et détection réglés pour le jeu, pas mesures du film. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Trousse médicale | Wolf | jouable adapté | Soin immobile consommable ; procédure visuelle non reproduite intégralement. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Autodestruction du vaisseau | Wolf | objectif narratif | Interaction existante, explosion racontée ; pas destruction physique de toute la coque. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Winchester 1200 | Dallas | jouable | Ancien fusil générique renommé et redessiné ; réglages conservés. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Glock 17, 2e génération | Morales / Ricky | jouable adapté | Profil visuel du pistolet de Ricky ; réserve générique conservée, non modèle balistique distinct. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Beretta 92FS | Kelly | jouable adapté | Profil visuel du pistolet humain tardif ; magasin militaire, pas dotation de départ. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| M4A1 | Survivants / militaires | jouable | Râtelier du Stryker, chargeur de trente et réserve finie. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Remington 700 | Chasseurs | décor inspectable | Deux exemplaires dans la clairière ; pas remis à Wolf comme arme utilisable. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Remington 870 | Morales | représentation PNJ | Silhouette au rassemblement ; PNJ non combattant simulé. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Colt Python | Survivant au cimetière | registre seulement · montage long | Présence attribuée au montage long ; personnage et tir non rejoués. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| MP5A3 | Forces spéciales | représentation PNJ | Périmètre final ; non offert dans la campagne. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| MP5SD3 | Forces spéciales | registre seulement | Variante signalée, pas un nouveau PNJ actif. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| GUU-5P / Colt 723 ? | Garde nationale | registre seulement · incertain | Identification secondaire ambiguë, ne pas certifier GUU-5P. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Browning M2HB | Convoi / Kelly, scène coupée | décor | Tourelle fixée au Stryker ; pas de tir monté. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Daewoo K3 modifiée | Garde nationale | registre seulement | Accessoire pouvant représenter une M249 ; modèle exact non revalidé ici. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| M249 SAW Para | Forces spéciales | représentation PNJ | Silhouette au périmètre final, pas d’arme joueur. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Cobray CM203 | Garde nationale | registre seulement | Ne pas assimiler sans réserve à un M203 militaire. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Jumelles de vision nocturne | Molly | décor | Posées dans la chambre ; aucun mode jouable de Molly ajouté. | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| Radio de police et communication | Morales / groupe | contextuel | Ordres et dispositifs sonores existants. | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| Fusées / brides / soins humains | Survivants | jouable original | Consommables de gameplay ; aucun statut d’accessoire canonique garanti. | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |

## Personnages : repères, pas doubles numériques

Les quatre protagonistes restent Wolf, Kelly, Dallas et Ricky. Onze profils de silhouette sont définis ; huit placements de personnages secondaires sont ajoutés aux scènes autorisées. Ces placements sont des présences de scène, pas huit nouvelles intelligences de combat. Tim reste notamment un profil consultable, pas une campagne supplémentaire.

Les marqueurs de quête ne dessinent plus tous un Dallas générique : les rôles de Ricky et de Morales sont affectés aux situations correspondantes. Jesse et Molly disposent de morphologies distinctes ; la petite taille de Molly ne transforme pas le personnage en adulte miniature de même gabarit. La coiffure, les manches, le badge et le ceinturon différencient plusieurs humains. Wolf reçoit ses mèches baguées, trophées, masque gravé et états d’équipement. Les xénomorphes ordinaires reçoivent des stries crâniennes ; le Predalien conserve sa base précédente.

Les visages restent schématiques. Les vêtements ne sont pas validés sur chaque plan et les militaires utilisent encore une tenue de substitution. La table suivante est le registre des décisions de rendu, pas une certification d’identité visuelle parfaite.

| Profil | Repères dessinés | Niveau de certitude | Référence |
|---|---|---|---|
| wolf | Masque gravé, longues mèches baguées, filet, trophées, armure asymétrique ; cicatrice et mandibule absente sans masque. | silhouette et équipement retravaillés ; sculpture faciale approximative | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| kelly | Débardeur bordeaux, jean sombre, cheveux bruns attachés. | palette du cliché de production consulté ; visage stylisé | [Photographies de production — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/production-stills/) |
| dallas | Veste brune ouverte sur haut sombre, cheveux courts, barbe légère. | repères de silhouette ; détails vestimentaires à vérifier plan par plan | [Photographies de production — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/production-stills/) |
| ricky | Cheveux clairs bouclés, vêtement gris-bleu et silhouette plus jeune. | coiffure différenciée ; tenue exacte selon séquence non certifiée | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| jesse | Longs cheveux blonds, silhouette féminine et jean ; modèle adulte distinct. | tenue de fuite approximative ; pas de transformation du PNJ en homme générique | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| molly | Enfant de petite taille, longs cheveux bruns, tenue domestique claire. | proportions et coiffure distinctes ; motif du vêtement non certifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| morales | Uniforme de shérif, ceinturon, badge ; Glock et Remington identifiés au registre. | PNJ de scène ; visage approximatif | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| eddie | Adulte du groupe sur la place, non substitué à Dallas. | silhouette provisoire, costume non vérifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| dale | Adulte blond du groupe ; présence limitée aux scènes prévues. | silhouette provisoire, costume non vérifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| tim | Père de Molly ; ne rejoint pas les survivants après la maison. | silhouette provisoire, costume non vérifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| soldier | Casque, protection et arme militaire au périmètre final. | uniforme générique de substitution clairement déclaré | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |

## Tableaux distants

| Tableau | Statut | Limite |
|---|---|---|
| Monde des Yautja — salle de Wolf | tableau consultable, non niveau jouable | Architecture monumentale, lumière chaude et équipement avant départ. Il manque encore la préparation jouable et le voyage. Aucun portail pédestre vers Gunnison. |
| Poste de commandement du colonel Stevens | tableau consultable, non niveau jouable | Écrans et carte de confinement. Les décisions sont racontées ; aucune carte réelle militaire ou commande stratégique jouable. |
| Bureau de Yutani — remise du plasma | tableau consultable, non niveau jouable | Arme déposée sur une table dans un intérieur corporatif. La remise reste un épilogue raconté, pas un niveau d’exploration. |

## Écarts encore ouverts vers le 1:1

La préparation jouable de Wolf sur son monde, le prologue intérieur du vaisseau éclaireur et son détachement orbital ne sont pas reconstitués. Le commandement de Stevens et la remise à Yutani restent des tableaux consultatifs ou des ellipses. La morgue, certains intérieurs privés tels que la maison de Jesse et les espaces associés aux personnages secondaires ne sont pas tous présents comme pièces distinctes. Le dépôt de bus et les autres pistes de scénario supprimées ne doivent pas être ajoutés au montage cinéma comme s’ils y figuraient.

Le cimetière est un détour jouable lié à une variante de montage, mais il ne rejoue pas la scène avec Karl. La pizzeria découle du travail de Ricky ; son intérieur, son plan et ses raccords sont inventés pour cette adaptation. La zone des chasseurs ne rejoue pas leur prologue. La maternité et la nurserie sont des lieux vides explorables, pas une reproduction de toutes les actions du film. Le Stryker est immobilisé : pas de conduite, de trajet routier ou de mitrailleuse pilotée dans cette candidate.

Le répertoire contient encore des armes sans gameplay : variantes militaires, Colt Python, MP5SD3, K3 et CM203 notamment. Les armes représentées sur des PNJ ne produisent pas encore toutes leurs attaques. Les objets médicaux, le dissolvant et les lasers ont des fonctions adaptées et ne reproduisent pas chaque plan de manipulation.

L’architecture, les couleurs, les habits et les gabarits restent approximatifs. Aucun pourcentage de « fidélité » n’est attribué sans une grille d’observation filmique complète. Le résultat est une progression concrète et auditable, pas une certification d’intégralité.

## Validation réellement exécutée

603 tests Node passent, dont 97 nouveaux. Les 506 tests hérités sont conservés avec des attentes de métadonnées explicitement mises à jour. `docs/FIDELITY_CHANGES.json` énumère 225 changements de données autorisés. Le comparateur vérifie d’abord les nouvelles valeurs, puis ne retire que ces changements déclarés pour comparer les éléments hérités. Il ne remplace pas les anciens résultats par un succès supposé. Les attentes de nombre de lieux, de version et de fiches dans les contrôles navigateur ont été révisées et consignées.

698 assertions Chromium passent dans 33 séries, dont 216 nouvelles. Les 130 extrémités sont rendues dans leur pièce, les 49 environnements sont ouverts dans l’atlas, et des actions E / Attaque / import de fichier utilisent les événements navigateur. Les préparations de scènes, choix d’équipement et positions imposées aux fixtures sont déclarés dans les légendes ; elles ne sont pas présentées comme des parties naturelles.

Douze campagnes automatisées couvrent quatre profils et trois difficultés, et terminent les cinquante objectifs. Quarante-cinq relectures isolées terminent chacune leur séquence. Sept tours dédiés contrôlent les nouveaux locaux, leurs retours, observations et imports ; ils partent d’états de chapitre préparés puis utilisent les commandes de mouvement. Les cinq annexes antérieures et les huit analyses de Wolf sont aussi revérifiées. Ces bots connaissent la carte et visent précisément ; ils ne constituent ni un test humain de difficulté, ni une estimation de durée.

Le navigateur utilisé est Chromium. La navigation native locale a été essayée et refusée par l’environnement ; les tests utilisent `set_content` avec un Storage mémoire explicite. Aucun contournement du blocage, téléphone ou contrôleur physique, sauvegarde `file://` native ou écoute au casque n’est revendiqué.

Les 49 vues de l’atlas ont été examinées sous forme de planches. Cette revue a conduit aux corrections des accès extérieurs et de la signalétique médicale. Elle ne garantit pas que chaque prop de chaque cadrage est parfait : les échelles, volumes, motifs récurrents et détails hérités demandent encore une production artistique dédiée. Les vingt captures fonctionnelles et les quarante-neuf vues d’audit sont les rendus du moteur, pas des images du film.

## Sources et qualité des éléments

| Source | Nature | Usage et limite |
|---|---|---|
| [20th Century Studios — Aliens vs. Predator: Requiem](https://www.20thcenturystudios.com/movies/aliens-vs-predator-requiem) | studio | Identité du film ; pas de plan technique. |
| [Photographies de production — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/production-stills/) | photographies de production hébergées par un site spécialisé | Références visuelles. Accès aux grands JPEG incomplet ; aucune reconstruction mesurée. |
| [Photogrammes Blu-ray — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/blu-ray-captures/) | photogrammes hébergés | Index de scènes ; aucun relevé plan par plan exhaustif effectué. |
| [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) | source secondaire spécialisée | Arsenal, cicatrices, collecte du second canon, transformations. |
| [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) | source secondaire spécialisée | Rôles, travail de Ricky, parcours des survivants. |
| [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) | identifications secondaires sur photogrammes | Modèles d’armes. Incertitudes GUU-5P / Colt 723, K3 et variantes signalées. |
| [Hollywood History Online — Wolf’s Plasmacaster Pistol](https://www.hollywoodhistoryonline.com/product/wolfs-plasmacaster-pistol/) | objet de production documenté par son détenteur | Transformation du canon en pistolet, poignée distincte ; pas un prix ou une offre. |
| [Montage cinéma / non censuré — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/theatrical-vs-unrated/) | comparatif secondaire | Ne pas assimiler scènes coupées, film cinéma et jeu PSP. |


Vérification des pages le 29 septembre 2026. Le lien historique theatrical-vs-unrated redirige vers deleted-scenes. Les fichiers sources du jeu ne contiennent pas de copies des pages ou des photographies.

## Installation et outils

Ouvrir `JOUER_AVPR.html` pour lancer le module autonome. `JOUER_WINDOWS.cmd` est un raccourci. Si l’ouverture locale n’est pas acceptée par le navigateur, le serveur fourni se lance avec `npm run serve` depuis le dossier ; sa compatibilité chez l’utilisateur n’est pas certifiée par les tests de cet environnement.

`npm run build` assemble les sources sans téléchargement. `npm test` exécute les tests Node. `npm run audit:fidelity` recalcule les contrôles du graphe et des seuils. Les contrôles navigateur demandent Python, Playwright et Chromium ; leur exécutable de référence est `/usr/bin/chromium` et doit être adapté sur un autre système. `npm run verify` contrôle les empreintes du pack tel que livré ; le reconstruire ou modifier un rapport peut naturellement modifier ces empreintes.

L’installateur ne fait qu’ajouter ou actualiser un lien vers `src/dlc/avpr/index.html` dans un menu hôte reconnu. La vraie charge utile 0.9 et son installateur sont conservés dans la fixture de test ; mise à niveau, copie de l’ancien HTML, absence de doublon et désinstallation sont vérifiées sur un menu temporaire. `--dry-run` n’écrit rien et les options inconnues sont refusées.

Aucune fusion au moteur GameEngine/MIRE partagé, aucun profil Frontier modifié, aucun push GitHub, déploiement Vercel ou modification de bibliothèque distante.


Empreinte du jeu : `763ea5e2bbcbc96af648824e1dd87b0262eab64fd0298d1cc623ed0bbb46a4ec`.
