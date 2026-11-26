# AVP (2004) — références V002 et raccord de deux décors

**Deux images corrigées sont désormais visibles dans le jeu : le Snowcat de la zone d’arrivée et les ossements de la station baleinière.** Cette passe apporte cinq PNG guidés par des photographies effectivement inspectées, des fiches de production, les empreintes des originaux et six captures du navigateur. Le satellite, Celtic endommagé et la machine de ponte de la Reine restent des études dans la bible.

Le jeu conserve la version de contenu **0.11.0**, avec **révision d’intégration 2**. La fidélité 1:1 reste un objectif de production : aucune image n’est certifiée et aucune fiche manquante du catalogue n’est fermée par cette passe. Une présence en scène, une fonction jouable et une correspondance exacte au film demeurent trois constats différents.

## Navigation

- [Galerie : cinq images et six captures avant/après](GALLERY.md).
- [Validation exécutée, portée et limites](VALIDATION.md).
- [Manifeste des PNG, prompts, empreintes et résultats](manifest.json).
- [Références photographiques : provenance, résolution et usage réel](reference-sources.json).
- [Bible AVP centrale](../avp-2004.md).
- [Inventaire complet et spécifications de production V001](../avp-2004-production-20261126/README.md).

## Ce qui change dans le jeu

| Objet | Modification visuelle | Présence effective | Ce qui reste à établir |
| --- | --- | --- | --- |
| Snowcat Weyland | Cabine rouge, plateau gris, chenilles, lame et balises, d’après le plan de soute et une vue extérieure | Décor `film-snowcat`, salle `landing` ; vignette du carnet actualisée | Marquages de chaque engin, vues cachées, dimensions exactes, éventuelle conduite |
| Ossements baleiniers | Côtes distinctes de hauteurs inégales ; l’arche régulière et sa colonne supérieure sont abandonnées | Décor `whalebone`, salle `station`, au premier plan | Nombre total hors champ, position et échelle métriques |
| Satellite Weyland | Corps axial allongé et panneaux multiples d’après la maquette John Lee | Source de bible uniquement | Modèle final filmé, faces cachées, plan orbital et balayage |
| Celtic endommagé | Costume masqué, résille, armure asymétrique et dommages | Source de bible uniquement ; acteur SVG historique maintenu | Pose latérale, animation, attribution des dommages à l’instant du duel |
| Machine de la Reine | Arc nervuré, brides et sac organique lobé d’après deux vues de fabrication | Étude documentaire incomplète ; aucun remplacement du palan ou de la Reine | Attaches tronquées, états animés, ancrages à la salle, trajet des œufs |

Les originaux PNG sont conservés tels que générés. Le constructeur vérifie les deux images actives et incorpore leurs octets dans le HTML autonome. Les cinq fichiers PNG restent exclus de la copie des fichiers de production : seuls les pixels des deux images admises sont embarqués dans la page. Le HTML fonctionne donc aussi en fichier local sans téléchargement d’image. Les 145 SVG restent disponibles ; un PNG illisible laisse fonctionner son SVG de secours.

## Snowcat — livrée, structure et usage

Le [plan de soute](https://clip.cafe/alien-vs-predator-2004/seven-seasons-on-the-ice-and-ive-never-seen-a-gun-save-someones-life/) montre la cabine rouge plus clairement que les vues bleutées de nuit. Une image a été extraite à 27 secondes **dans cet extrait**, sans recadrage ni recoloration ; ce temps n’est pas celui du long métrage. La [vue extérieure IMCDb](https://www.imcdb.org/vehicle_100380-PistenBully-300.html) sert de contrôle de silhouette. Le nom commercial « 300 » reste une attribution communautaire. La [notice de la miniature](https://propstoreauction.com/lot-details/index/catalog/496/lot/192510/460-Light-Up-Weyland-Antarctic-Snowcat-Model-Miniature-AVP-ALIEN-VS-PREDATOR-2004) complète la provenance, mais sa photographie n’a pas servi d’entrée à cette génération.

La cabine, sa porte et son vitrage restent un seul assemblage, raccordé au châssis. La lame est attachée à l’avant ; le plateau repose sur les chenilles. Les inscriptions fines, le nombre de galets et les détails du dessous ne sont pas présentés comme relevés. Plusieurs véhicules figurent dans la soute : un marquage observé sur l’un ne doit pas être appliqué automatiquement aux autres.

Le décor garde x520/y77 dans `landing`. Son cadrage alpha et son pivot assurent le contact inférieur. Sa largeur maximale de présentation est de 380 unités ; sa hauteur visible vaut environ 129 unités. Ce sont des mesures du rendu, pas celles du film. La cabine ne devient pas une nouvelle sortie, et la fiche `AVP2004-115` reste `SCENE` : aucune mécanique de conduite n’est ajoutée.

## Ossements — disposition et circulation

La [capture de la station](https://clip.cafe/alien-vs-predator-2004/what-are-these-whale-bones/) montre un ensemble ouvert de côtes inégales, partiellement enfouies. Elle ne justifie ni une colonne vertébrale supérieure continue ni un squelette complet de musée. La nouvelle silhouette corrige ce point, sans inventer de crâne hors champ. Sa projection et ses espacements restent une adaptation graphique, à comparer à d’autres plans.

Le prop garde x350/y225 et son échelle historique dans `station`. La hauteur de présentation est 168 unités et la largeur environ 341. La rangée passe devant les jambes de Lex lorsqu’elle se trouve derrière : c’est une occlusion du premier plan. Le seuil du bureau du contremaître reste attaché à sa façade et accessible. Le parcours réel `station → office → station`, avec retour x565/y93, a réussi dans quatre profils de navigateur. Ces vérifications n’établissent pas une géographie métrique de toute la station.

## Satellite — distinguer l’étude de l’implantation

La [page du maquettiste John Lee](https://www.johnleemodelmaker.me/avp.aspx) fournit une image de 333×167 pixels de la maquette du satellite. Les pixels de cette photo ont été fournis au générateur. La correction suit le corps long blanc/gris et doré, ses bras radiaux, plusieurs panneaux bleus et sa tige axiale. Le précédent candidat à corps cubique et deux ailes demeure dans l’historique V001, avec sa réserve initiale.

La faible résolution laisse les articulations, petites antennes, faces cachées et éventuelles différences du modèle final ouvertes. La future implantation doit appartenir à une vue orbitale ou à un écran de détection cohérent. Poser le satellite entier dans la passerelle serait un faux raccord d’échelle. Aucune salle orbitale ou interface de balayage n’est ajoutée ici.

## Celtic — identité et état de costume

La photographie du [costume Celtic attribué à la production](https://propstoreauction.com/lot-details/index/catalog/449/lot/156867/13-Celtic-s-Ian-Whyte-Screen-Matched-Predator-Costume-Display-AVP-ALIEN-VS-PREDATOR-2004) guide le masque, les mèches, la peau marbrée, la résille, l’armure asymétrique et les jambières. L’image générée conserve ces indices mais reste de trois quarts frontal. Elle ne remplit pas le besoin de profil latéral demandé pour l’animation du jeu.

Le costume exposé mélange un état de scène et une conservation ultérieure : les défauts actuels ne sont pas tous des dommages à reproduire en jeu. Il faut affecter séparément les états intact, attaqué à l’acide, rayé et terminal à leurs plans. Le canon visible sur un mannequin ne suffit pas à armer Celtic à chaque instant ; aucun canon n’est ajouté dans le candidat. La fiche incertaine « Celtic démasqué » `AVP2004-037` reste `A_VERIFIER`. Les points d’accroche du filet et des lames devront suivre les mains, poignets et armures animés avant toute substitution de l’acteur.

## Reine — machine, anatomie et attaches

Les deux [photographies John Lee](https://www.johnleemodelmaker.me/avp.aspx), chacune de 333×167 pixels, montrent une structure circulaire nervurée autour d’une masse organique lobée. La photographie de levage contient du matériel de tournage ; la caméra n’est pas un élément de la fiction et ne figure pas dans le candidat.

Le résultat est une étude de forme : les chaînes sortent du bord supérieur, avec 64 pixels alpha≥128 touchant ce bord. **L’asset est incomplet pour une implantation autonome.** Ses détails de tête, de brides et de mécanismes reconstruisent des informations trop petites pour être certifiées. La mention d’une maquette au tiers ne donne pas les dimensions finales à appliquer au niveau.

La production suivante doit définir ensemble le plafond ou palan, les attaches visibles, les chaînes, la Reine, son sac, la voie d’évacuation des œufs et les états avant/après rupture. Un seul dessin fixe ne représente pas la cryostase, la ponte, la libération et la poursuite. Le candidat ne remplace donc pas `film-queen-hoist` et n’ajoute pas une seconde Reine dans `queenhold`.

## Continuité des lieux, armes et autres catégories

La passe conserve les données des **44 lieux, 104 faces de porte et 250 fiches**. Les 43 salles navigables restent reliées topologiquement, l’épilogue étant séparé. Les deux connexions parcourues dans Chromium sont examinées en déplacement réel ; les 52 liaisons de la campagne ne sont pas toutes rejouées dans cette recette. Aucun défaut nouveau de porte n’a été démontré et aucun seuil n’a été déplacé artificiellement pour accompagner les images.

Les [78 spécifications détaillées](../avp-2004-production-20261126/PRODUCTION_SPECIFICATIONS.md) et le [registre des 132 fiches de référence](../avp-2004-production-20261126/canon-research.json) couvrent toujours personnages, lieux, armes, props, véhicules, vaisseaux, terrains et Terre. Les 78 spécifications couvrent notamment les 22 lignes d’armes du catalogue runtime ; le registre canon compte séparément 16 fiches de référence d’armes. Cette passe n’en débloque aucune. Les armes humaines restent liées à leur propriétaire ; les armes Yautja exigent leurs états portés, sortis et utilisés. Une image de collection ne remplace pas la vérification du plan ni la mécanique de jeu.

Les **41 fiches ouvertes** du catalogue gardent leur statut : 19 `ABSENT`, 15 `A_VERIFIER`, 7 `DOCUMENT`. Les 8 PNG V001 sont préservés et ne sont pas activés par cette passe. Le Piper Maru, la Terre, le glacier et la façade de station de ce premier lot conservent leurs limites documentées. Aucun nouvel astre n’est inventé ; la Terre reste la planète du périmètre AVP 2004. Une coque entière ne doit pas être posée sur son propre pont, et une façade doit être raccordée à son sol, à ses seuils et aux collisions avant remplacement.

## Conditions de poursuite

La prochaine fermeture d’une fiche doit apporter une référence identifiable, un état de personnage ou d’objet déterminé, une implantation cohérente et une vérification de la fonction concernée. Pour un passage : embrasure réellement portée par la paroi, seuil au sol, dégagement, arrivée inverse et test de déplacement. Pour un personnage : silhouette, costume et équipement attribués au bon état, poses/animations et contacts. Pour un véhicule ou vaisseau : enveloppe, accès et contexte d’échelle, puis mécanique seulement si elle fait partie de la campagne.

Les sources consultées, les sept photos réellement données aux générations, les trois anciennes images utilisées comme cibles de correction et les prompts exacts sont distingués dans les fichiers JSON. La source précise ne prouve pas la précision du dessin généré : les cinq entrées gardent `exact:false`, `canonExact:false`, `productionReady:false`.
