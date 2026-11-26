# La Mer des Chagrins — édition visuelle 0.10.5

## Résultat du 26 novembre 2026

**152 PNG individuels, 290 100 077 octets.** Cette continuation ajoute **13 images** aux 139 de l’édition 0.10.4. Les 139 sources antérieures et leurs lignes complètes de métadonnées sont conservées. La simulation 0.10.0 garde l’arbre Git `1024a04d3615e135a0a9de7cbff6819e107a2492`, ses identifiants, ses règles et ses sauvegardes.

La [bible détaillée](BIBLE_COMPLETION_20261126.md), sa [version structurée](BIBLE_COMPLETION_20261126.json) et la [bible centrale du DLC](../narrative/dlc/sea-of-sorrows.md) couvrent **239 fiches et 239 contrats de production**. Chaque contrat précise les références, la silhouette, les matières, l’échelle, le cadrage, les états, le raccordement au jeu, les vérifications et les critères de clôture. Les **576 descriptions de travaux historiques** sont conservées intégralement ; le registre courant en indique l’avancement.

| Famille de fiches | Nombre |
| --- | ---: |
| Personnages, créatures et variantes | 29 |
| Lieux | 50 |
| Armes | 7 |
| Props, équipements, effets et types de passages | 119 |
| Véhicules | 5 |
| Vaisseaux | 5 |
| Terrains | 22 |
| Planètes | 2 |

Ces comptes décrivent le périmètre de production. Une fiche détaillée n’atteste pas à elle seule l’existence d’une image ni l’achèvement d’un lieu ou d’un véhicule.

## Les treize images ajoutées

| Ajout | PNG | Usage livré et limite |
| --- | ---: | --- |
| Decker, marche avec pistolet | 2 | Deux contacts alternés à 4 Hz pour le vrai joueur équipé, debout et en mouvement. Les autres armes, la recharge, le travail, les postures et les mouvements réduits conservent les présentations existantes. |
| Manning, marche avec pistolet | 4 | Deux contacts et deux passages à 8 Hz pour le vrai compagnon en mouvement, avant le chapitre 17. Sa marche suit son propre état même si Decker recharge ou travaille. |
| Vanne consignée | 1 | Les quatre dispositifs d’isolation gardent leur silhouette PNG après leur vraie complétion ; libellé « CONSIGNÉ » et arrêt des dangers natifs conservés. |
| Console terminée | 1 | Les sept dispositifs concernés suivent leur propre état optional. Les consoles d’objectifs restent un autre chemin de rendu. |
| Capteur arrêté ou épuisé | 1 | Présent si le capteur n’est plus alimenté ou si sa charge est nulle. Déploiement, extinction, épuisement et récupération restent natifs. L’indicateur est replacé sur la lentille, source [924, 571], rayon 0,8 unité. |
| Attache détruite | 1 | Les trois attaches existantes de s33 changent d’image à zéro point de vie ; dégâts et progression du boss inchangés. |
| Brèche rocheuse | 1 | Encadrement réutilisé aux neuf seuils de fond ou de premier plan. Les vingt et un montages latéraux gardent leur dessin natif. |
| Rampe d’embarquement | 1 | Surface ajustée aux deux seuils boarding-ramp s11/s37. Murs, baie, indicateurs d’accès et repère d’approche restent présents ; le type boarding est distinct. |
| Sol de ruche | 1 | Surface basse limitée aux salles hive s28/s32, avec ancrage fixe et contraste adapté. Elle ne change ni les obstacles ni le terrain physique. |

Le pistolet est composé à partir de sa source existante ; aucune arme n’est peinte dans les six nouveaux corps. Les mains et la lampe de Decker utilisent leurs attaches mesurées. Les six poses sont des étapes de présentation, sans certification d’un cycle anatomique complet.

**148 PNG ont un raccordement déclaré au monde, quatre à l’interface ; les 152 figurent dans la galerie.** Le rendu réel de cette édition a observé **140 types de PNG**, dont les **13 nouveaux**. Les images chargées, les images effectivement dessinées et les fiches de production sont comptées séparément.

Les [prompts exacts et résultats](GENERATION_0_10_5.json) retracent **16 appels réussis pour 13 fichiers retenus**. Deux candidats de vanne et un contact de Decker ont été remplacés après inspection. Aucun nouveau refus n’est survenu et les anciennes demandes refusées d’adulte, de plasma et de lance-flammes compact n’ont pas été relancées. Les pixels source des PNG sont conservés sans réencodage par script.

## Accès et preuves

- [Édition visuelle — point d’entrée](../../dlc/sea-of-sorrows-visual/index.html).
- [Galerie des 152 images](../../dlc/sea-of-sorrows-visual/galerie.html).
- [Manifeste des images et placements](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).
- [Inventaire de distribution](../../dlc/sea-of-sorrows-visual/RUNTIME_MANIFEST.json).
- [Reçu de validation 0.10.5](VALIDATION_0_10_5.json).
- [Marche armée dans les deux directions](canvas-0.10.5/armed-gaits.png).
- [États des objets, brèches, rampes et ruche](canvas-0.10.5/states-portals.png).
- [Salle s26 avec sa brèche de premier plan](canvas-0.10.5/s26.png).
- [PR GitHub #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58).

## Vérifications exécutées

| Vérification | Résultat | Portée |
| --- | --- | --- |
| Suite visuelle | **128/128 réussis**, 0 échec, 0 ignoré | 107 tests renderer, dont 23 nouveaux ; galerie, équipement et admission. Simulation réelle avec doublures Canvas/Image/DOM. |
| Catalogue DLC et succession des audits | **46/46 réussis** | Menus, intégration et protections des autres DLC. |
| Admissions import / récupération / visuel | **33/33 réussis** | Conservation des admissions précises ; aucun assouplissement de garde. |
| Sources et métadonnées | **152 PNG vérifiés** | Octets, empreintes, alpha, dimensions, découpes, pivots, attaches et portées ; 139 anciennes lignes préservées intégralement. |
| Canvas avec les sources originales | **152 décodés, 270 cas structurés** | 50 salles, 24 cas posture/arme, 16 locomotions non armées, 38 diagnostics, 11 cas de 0.10.3, 35 de 0.10.4 et 96 nouveaux cas. |
| Nouveaux états et placements | **96 cas** | 36 marches et exclusions, 22 états de dispositifs, 5 états de capteurs, 6 états d’attaches, 22 passages, 5 sols. |
| Portes conservées | **19 comparaisons de repli au pixel** | Les nouveaux cadres vérifient aussi murs, libellés, états d’accès et repères au sol. |
| Nouveaux visuels observés | **13/13** | Appels de dessin réels, hors passe préparatoire de sélection des images. |
| Captures finales | **15 PNG, 13 417 720 octets** | Deux nouvelles planches et les vues de contrôle ; les 32 captures antérieures restent inchangées. |
| Distribution de l’overlay | **159 fichiers publics**, 290 238 264 octets | Inventaire explicite ; métadonnées, documents, prompts et QA restent hors runtime public. |

Le manifeste source comporte **160 membres**, dont le manifeste des sprites. Le manifeste de distribution lui-même reste source uniquement, hors de ces 160 membres. Son empreinte SHA-256 est `7adbba0595ede8b655f9bbad5ccb1fc5018f6a083e495c4f34a4227f06abeb26`.

La QA utilise `@napi-rs/canvas 0.1.100`, avec 24 images natives maximum en cache et 21 sources au maximum pour un rendu. Le pic RSS échantillonné du dernier passage est 924 MiB ; cette mesure n’est pas un benchmark ni un pic continu. La capture retenue attend le chargement natif effectif ; les dessins de sélection sont exclus des observations. Le contournement de décodage caBX reste confiné aux buffers de QA, sans modification des fichiers ni des données de pixels IDAT.

Les dispositifs terminent leur travail par finishDevice natif dans dix cas ; l’état terminé d’embarquement est une fixture explicite car ses prérequis de convoi dépassent ce test isolé. Les capteurs emploient les actions natives de déploiement, arrêt, épuisement et récupération ; les attaches sont détruites par de vrais dégâts du lance-flammes du jeu. Ces rendus conservent les états sérialisés, les sauvegardes, le prototype de simulation et les méthodes natives protégées.

Les totaux des suites se recoupent et ne s’additionnent pas en un nombre de tests uniques. Aucun parcours complet au clavier, navigateur, écran tactile ou manette physique n’est certifié par ces fixtures. Les résultats distants de GitHub sont relevés séparément sur le commit publié.

## Fidélité et travail restant

**La fidélité canonique globale 1:1 reste non certifiée.** Les références éditoriales et extraits autorisés de la bible étayent le cadre et certaines scènes ; ils ne fournissent pas tous les portraits, plans, dimensions ou dessins industriels. Le roman intégral n’a pas été confronté. Les silhouettes, textures et détails de conception non attestés restent des interprétations signalées. Les continuités du roman et de la dramatique audio restent distinctes.

Le registre courant contient **542 travaux ouverts, 26 partiels et 8 résolus sur un périmètre précis**. Dix travaux passent d’ouvert à partiel ; la marche de Decker conserve son état partiel avec une preuve supplémentaire. Aucune animation complète, aucun vaisseau, aucune planète et aucun contrôle canonique global n’est clôturé par ces images. Les 239 contrats et les 576 descriptions historiques restent identiques.

Les points encore ouverts comprennent les transitions entre poses, le tir et la recharge animés, les mains des anciennes poses statiques, la crosse et la prise secondaire du lance-flammes, les visages exacts, les montages rocheux latéraux, les intérieurs/extérieurs complets de véhicules et vaisseaux, les plans des lieux et la géographie planétaire. La rampe n’achève pas la navette ; la surface de ruche n’ajoute pas une salle.

En cas d’image absente, en chargement ou de calibration inutilisable, les états concernés conservent leur présentation native. Une exception Canvas synchrone pendant le dessin d’un nouveau seuil peut repeindre sa façade translucide sur cette seule frame avant que l’image passe en erreur ; ce cas distinct du chargement normal reste consigné dans le reçu.

Les fichiers README.md, MANIFEST.json et RECOVERY.md de ce dossier décrivent toujours le checkpoint historique de 27 images. Les éditions précédentes restent documentées ci-dessous avec leurs preuves propres.

<details>
<summary>Guide historique 0.10.4 et éditions précédentes — preuves propres à leurs versions</summary>

# La Mer des Chagrins — édition visuelle 0.10.4

## Résultat du 26 novembre 2026

**139 PNG individuels, 270 594 463 octets.** Cette continuation ajoute **13 images** aux 126 de l’édition 0.10.3. Les 126 fichiers antérieurs et leurs lignes complètes de métadonnées sont conservés. La campagne originale 0.10.0 reste sur son arbre `1024a04d3615e135a0a9de7cbff6819e107a2492`.

La [bible détaillée](BIBLE_COMPLETION_20261126.md), sa [version structurée](BIBLE_COMPLETION_20261126.json) et la [bible centrale du DLC](../narrative/dlc/sea-of-sorrows.md) relient désormais **239 fiches à 239 contrats de production** : références, silhouette, matières, échelle, cadrage, états, raccordement, vérifications et critères de clôture. Les 576 travaux recensés au checkpoint historique restent traçables ; un registre courant précise les progrès sans réécrire ce point de départ.

| Famille de fiches | Nombre |
| --- | ---: |
| Personnages, créatures et variantes | 29 |
| Lieux | 50 |
| Armes | 7 |
| Props, équipements, effets et types de passages | 119 |
| Véhicules | 5 |
| Vaisseaux | 5 |
| Terrains | 22 |
| Planètes | 2 |

Ces nombres désignent des fiches de production, pas des images supplémentaires. Les descriptions de véhicules, vaisseaux, lieux et terrains détaillent aussi ce qu’il reste à produire.

## Les treize images ajoutées et leur usage

| Ajout | PNG | Comportement livré |
| --- | ---: | --- |
| Decker, passages de marche A et B | 2 | Les deux anciens contacts et les deux passages forment quatre poses successives pendant la marche non armée. Repos et mouvements réduits gardent la pose fixe. |
| Decker, écoute/concentration | 1 | Suit le mode de présentation focus du joueur immobile, sans arme ni action incompatible. |
| Decker, consultation du rapport ICC | 1 | Pose médicale dans s03 pendant l’action réelle o02-01 ; le lecteur posé disparaît pendant qu’un seul lecteur est tenu, puis revient si l’action est relâchée. |
| Dossier papier et gobelets médicaux | 2 | Posés sur le mobilier déjà présent dans s03. Ces accessoires visuels n’ajoutent aucune prise de médicament ni interaction. |
| Armoire ouverte avec réserves | 1 | Choisie uniquement si le contenu réel est non vide. L’ancienne armoire ouverte représente l’état vide, y compris après retrait et après dépôt. |
| Caisse de ravitaillement et panier de pièces épuisés | 2 | Suivent les vrais états de collecte et de complétion. Le rendu n’ajoute ni ne retire aucun stock. |
| Cage d’ascenseur | 1 | Cadre ajusté à l’ouverture native de s14/right et s15/left ; rails, seuil, commandes, barreaux de fermeture et règles de passage conservés. |
| Sable et silice au sol | 2 | Surfaces limitées aux matériaux natifs sand et silica, ancrées dans le monde et placées sous les acteurs et indications tactiques. |
| LV-178 depuis l’orbite | 1 | Globe confiné au hublot existant de s39 ; signal natif de frappe conservé. Géographie interprétée pour le projet. |

**135 images possèdent un raccordement au rendu du monde ; quatre restent réservées à l’interface. Les 139 sont disponibles dans la galerie.** La QA de cette édition a effectivement dessiné 125 types de PNG dans ses cas préparés, dont les treize nouveaux.

Le râtelier d’armurerie montre maintenant les deux armes natives tant que l’allocation n’a pas été retirée ; le PNG vide apparaît après le retrait réel. Les libellés d’armoire ont été relevés au-dessus des nouvelles images après inspection. Les ouvertures intermédiaires et tout cas dont l’image ou les attaches sont invalides gardent leur rendu natif.

Les [prompts exacts et résultats](GENERATION_0_10_4.json) distinguent 14 cibles demandées, 13 fichiers retenus, deux itérations de cage remplacées et un refus. Les PNG générés sont conservés sans retouche ni réencodage par script. La source précédente du personnage, du mobilier ou du terrain accompagne chaque édition visuelle qui en dérive.

La demande de correction du lance-flammes vers une crosse plus courte a été **refusée par l’outil d’image**. Aucun nouveau PNG n’est compté pour elle et aucune tentative de contournement n’a été effectuée. Les fichiers adulte xénomorphe et fusil plasma restent absents après les refus de la version précédente ; leur génération n’a pas été relancée dans cette passe.

## Accès et preuves

- [Édition visuelle — point d’entrée](../../dlc/sea-of-sorrows-visual/index.html).
- [Galerie des 139 images](../../dlc/sea-of-sorrows-visual/galerie.html).
- [Manifeste des images](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).
- [Inventaire exact de distribution](../../dlc/sea-of-sorrows-visual/RUNTIME_MANIFEST.json).
- [Reçu de validation 0.10.4](VALIDATION_0_10_4.json).
- [Planche des états, actions et environnements](canvas-0.10.4/states-and-world.png).
- [Marche dans les deux directions](canvas-0.10.4/locomotion.png).
- [Infirmerie s03](canvas-0.10.4/s03.png) et [hublot s39](canvas-0.10.4/s39.png).
- [PR GitHub #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58).

## Vérifications exécutées

| Vérification | Résultat | Portée |
| --- | --- | --- |
| `npm run test:mer-des-chagrins-visual` | **105/105 réussis**, 0 échec, 0 ignoré | Renderer, états réels, équipement, galerie et admission ; doublures Canvas/Image/DOM pour cette suite. |
| `npm run check:mer-des-chagrins-sprites` | **139 PNG vérifiés** | Octets, dimensions, alpha, découpes, pivots, attaches, portées et conservation des 126 lignes antérieures. |
| QA Canvas avec les PNG originaux | **139 décodés, 50 salles, 24 cas posture/arme/direction** | Rendu de pixels réels à partir de fixtures déclarées. |
| Locomotion | **16 cas** | Huit marches, quatre repos, quatre mouvements réduits ; repos et mouvements réduits stables au pixel. |
| Diagnostics | **42 existants, 11 de 0.10.3 et 35 de 0.10.4** | Inclut 23 replis de portes identiques pixel par pixel au natif et les états médicaux, stocks, sols, globe et cages. |
| Nouveaux visuels observés | **13/13** | Présence constatée dans les appels de dessin réels, hors passe préparatoire du décodeur. |
| Captures finales | **13 PNG, 11 375 616 octets** | Conservées, empreintes vérifiées, planches relues. |
| Distribution de l’overlay | **146 fichiers publics**, 270 715 549 octets | Copie du seul lot visuel puis contrôle de chaque chemin, taille et empreinte. |

Le manifeste source comporte 147 membres : les 146 fichiers publics et le manifeste des sprites. Le manifeste de distribution lui-même n’est pas compté comme membre et reste source uniquement. Les documents, prompts, rapports, scripts de QA et captures ne sont pas distribués avec le runtime.

La QA utilise `@napi-rs/canvas 0.1.100`. Son cache conserve au maximum 24 images natives à pleine résolution, avec au plus 21 images requises pour un rendu. Une première passe de sélection est jetée ; la capture retenue attend le chargement réel de toutes ses images. Cette adaptation concerne uniquement le banc de QA. Les chunks de provenance caBX sont omis dans son buffer de décodage en mémoire ; les fichiers PNG source et les chunks de pixels IDAT restent identiques. Le reçu consigne également la tentative initiale interrompue par manque de mémoire, sans lui attribuer de résultat réussi.

Les rendus vérifiés conservent les états sérialisés, les sauvegardes, le prototype de simulation et les méthodes natives protégées. Ces preuves ne représentent pas une campagne complète jouée au clavier. Le build global, le parcours navigateur, les commandes tactiles réelles et une manette physique n’ont pas été recertifiés pendant cette continuation. Les checks distants de la PR restent distincts de ces résultats locaux.

## Fidélité et limites encore ouvertes

Les sources du roman identifiées dans la bible étayent les identités, certains objets et certains traits de la scène médicale. Elles ne définissent pas tous les visages, silhouettes, plans, matériaux ni dimensions. Les détails issus de la dramatique audio sont séparés de ceux du roman. Le Carlyle, le Kiangya et le médecin anonyme conservent leurs identités distinctes.

La fidélité globale **1:1 reste non certifiée** : le roman intégral n’a pas été confronté. Le globe, les visages, les silhouettes de véhicules et les plans détaillés restent des interprétations signalées. Les quatre poses de marche améliorent la continuité mais n’achèvent pas l’animation : genou haut de la pose B, balancement des bras et transitions demandent encore un ajustement. La consultation médicale est une adaptation debout ; les mouvements allongé, assis et lever ne sont pas produits. Les paquets d’armoire représentent des réserves génériques, sans identifier chaque objet contenu.

L’ancien lance-flammes conserve sa crosse trop longue et une prise secondaire imparfaite dans certaines poses. La cage illustre l’accès et sa fermeture, sans nouvelle animation de déplacement vertical. Le registre courant distingue travaux techniquement résolus, partiels et encore ouverts ; une fiche ou un prompt n’équivaut pas à un asset finalisé.

Les documents README.md, MANIFEST.json et RECOVERY.md de ce dossier décrivent toujours le checkpoint historique de 27 images. Le présent guide, les manifestes courants et VALIDATION_0_10_4.json décrivent l’édition 0.10.4. Les guides et preuves précédents sont conservés ci-dessous avec leur portée propre.

<details>
<summary>Guide historique 0.10.3 et éditions précédentes — preuves propres à leurs versions</summary>

# La Mer des Chagrins — édition visuelle 0.10.3

## Résultat du 26 novembre 2026

**126 PNG individuels, 246 478 952 octets.** Cette édition ajoute cinq sprites sur fond transparent aux 121 fichiers du checkpoint 0.10.2, conservés sans changement d’octets. La campagne originale 0.10.0 reste sur son arbre `1024a04d3615e135a0a9de7cbff6819e107a2492`.

La [bible détaillée](BIBLE_COMPLETION_20261126.md) et sa [version structurée](BIBLE_COMPLETION_20261126.json) recensent **239 fiches** : 29 personnages/créatures/variantes, 50 lieux, 7 armes, 119 props/équipements/effets/passages, 5 véhicules, 5 vaisseaux, 22 terrains et 2 planètes. Chaque fiche associe contenu existant, source, qualification, travaux précis et critères de clôture. Les 50 salles sont reliées par 59 liaisons et 113 seuils fonctionnels documentés ; un contrôle du graphe ne certifie pas à lui seul leur traversée physique.

## Ajouts réellement produits et raccordés

| Sprite | Usage livré | Limite conservée |
| --- | --- | --- |
| Reine xénomorphe | Corps entier, quatre bras, queue, pivot aux pieds ; raccord au kind queen. | Morphologie inspirée de références filmiques ; états animés, cadavre PNG et exactitude romanesque non certifiés. |
| Lance-flammes | Arme native et illustration d’armurerie ; prise principale et bouche mesurées, retournement dans les deux sens. | Arme originale au gameplay du projet ; la crosse dépasse le dos dans certaines poses, la seconde main reste imparfaite et aucun nouveau cycle de recharge n’est produit. |
| Médecin anonyme du Carlyle | Remplace visuellement le cast medic dans s03 seulement. | Le profil composite et les portraits restent distincts ; visage exact interprété. |
| Decker en tenue médicale | Variante non armée dans s03 ; retour aux poses existantes hors contexte. | Sprite debout fixe, sans séquence assis/allongé/lever. |
| Appareil portatif ICC | Posé sur le pupitre natif de o02-01 dans s03, avant achèvement. | Boîtier et écran interprétés ; état terminé et autres consoles restent natifs. |

Les prompts exacts, sources et résultats sont conservés dans [GENERATION_0_10_3.json](GENERATION_0_10_3.json). Un objet ou une pose correspond à un PNG individuel. Les pixels générés ne sont pas retouchés par script.

**Deux demandes ont été refusées par l’outil d’image : adulte xénomorphe et fusil plasma.** Aucun fichier n’est compté pour ces sorties. Le rendu natif continue de les présenter. L’alias de présentation `captureAdult → adult` est prêt, sans changement d’espèce ni de simulation ; il reste en repli tant que l’image adulte est absente.

## Accès

- [Édition visuelle](../../dlc/sea-of-sorrows-visual/index.html).
- [Galerie des 126 images](../../dlc/sea-of-sorrows-visual/galerie.html).
- [Manifeste des images](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).
- [Manifeste exact de distribution](../../dlc/sea-of-sorrows-visual/RUNTIME_MANIFEST.json).
- [Preuves de cette édition](VALIDATION_0_10_3.json).
- [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58).

**122 images ont un raccord au monde, quatre sont réservées à l’interface et les 126 figurent dans la galerie.** Ce décompte décrit les chemins de présentation, pas le nombre de sprites aperçus dans une campagne jouée.

L’overlay conserve les contrôles, la collision, les identifiants, les objectifs et la clé de sauvegarde du DLC. Un PNG absent, incorrect ou sans ancre requise laisse fonctionner le rendu natif. Les personnages armés ne prennent pas la tenue médicale ; les portraits de dossier restent ceux des identités d’origine.

## Vérifications de cette édition

| Contrôle | Résultat | Portée |
| --- | --- | --- |
| `npm run test:mer-des-chagrins-visual` | **87/87 réussis**, 0 échec | Renderer, équipement, galerie, admission ; doublures Canvas/Image/DOM. |
| `npm run check:mer-des-chagrins-sprites` | **126 PNG vérifiés**, 246 478 952 octets | Dimensions, alpha, empreintes, pivots, sources, distinction des 119 historiques, des deux marches et des cinq ajouts. |
| QA Canvas avec les vrais PNG | **126 images chargées, 50 salles, 24 combinaisons posture/arme/direction** | États de jeu et projections préparés ; aucune campagne clavier complète. |
| Inspection des cinq ajouts | **Effectuée sur les captures Canvas de cette édition** | Corps, pieds, prise/bouche et pupitre ; n’authentifie pas un modèle canonique. |
| Distribution de l’overlay | 133 fichiers publics copiés et vérifiés ; manifestes, bible, prompts et QA source uniquement | La vérification du lot est séparée du build global et de la CI distante. |

L’environnement a été interrompu puis rétabli. Les tests et mesures finaux ci-dessus ont été réexécutés après restauration des sources. Les preuves antérieures restent dans [VALIDATION.json](VALIDATION.json) ; leurs résultats de build et de campagne ne sont pas transférés à cette édition.

Le build global et les parcours navigateur de cette continuation ne sont pas certifiés par ce guide. Leur éventuel résultat distant reste visible dans les checks de la PR. Le contrôle de distribution propre au lot, ses chemins exacts et ses empreintes sont consignés séparément.

## Fidélité et travail encore ouvert

La notice Titan et l’extrait autorisé du chapitre 4 étayent des identités, lieux, objets et traits décrits. Ils ne fixent pas tous les visages, plans, matières, dimensions et silhouettes. Les données de la dramatique Audible sont séparées du roman ; le Carlyle ne devient pas le Kiangya et le médecin anonyme n’est pas renommé Markowitz ou Herschel.

La fidélité globale **1:1 reste non certifiée**. Le roman intégral n’a pas été confronté. Les fiches signalent les éléments originaux du jeu, dont dix salles annexes, le lance-flammes et les trois attaches du boss. Deux poses de marche et des sprites statiques ne ferment pas les cycles de déplacement, tir, rechargement, consultation, interaction ou mort.

Les documents README.md, MANIFEST.json et RECOVERY.md de ce dossier décrivent le checkpoint historique de 27 images. Le présent guide, le manifeste courant et VALIDATION_0_10_3.json décrivent l’édition 0.10.3.

<details>
<summary>Guide historique 0.10.2 — preuves propres à la version précédente</summary>

## La Mer des Chagrins — édition visuelle 0.10.2

## Résultat de la continuation du 26 novembre 2026

Le lot contient **121 PNG individuels**, soit **237 861 570 octets** : **110 originaux récupérés**, **neuf images conservées du checkpoint suivant** et **deux nouvelles poses de marche de Decker**. Les 119 images déjà publiées restent identiques octet par octet. Les deux nouvelles images proviennent de l’outil intégré image_gen, à partir du sprite de Decker du projet ; leurs prompts et empreintes sont conservés dans [CONTINUATION_PROMPTS.json](CONTINUATION_PROMPTS.json).

Les 77 images historiques qui n’avaient pas de chemin publié ont été retrouvées par leurs identifiants Git dans le registre de la PR nº 67. Le snapshot des 110 originaux reste conservé. Le vérificateur protège séparément l’inventaire des 119 PNG du commit 8cb25462 et les SHA des deux nouveaux fichiers ; il ne dépend pas de l’historique Git disponible dans la CI.

**117 images disposent d’un raccordement au rendu du monde ; quatre autres illustrent exclusivement l’interface d’équipement. Les 121 sont consultables dans la galerie.** Ces nombres décrivent les raccordements disponibles. La QA Canvas de cette version a effectivement dessiné **103 types de PNG** dans sa sélection de cas ; elle n’est pas présentée comme une observation de chaque raccordement.

Les documents README.md, MANIFEST.json et RECOVERY.md de ce dossier décrivent le checkpoint historique de 27 images. Le présent guide et VALIDATION.json décrivent l’état courant.

## Accès et sauvegardes

Le catalogue /dlc/ propose l’édition visuelle, la galerie et la version originale.

- Jeu : dlc/sea-of-sorrows-visual/index.html.
- Galerie : dlc/sea-of-sorrows-visual/galerie.html, avec recherche, catégories, trois fonds, aperçu et téléchargement individuel.
- Métadonnées : dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json.
- Inventaire de distribution : dlc/sea-of-sorrows-visual/RUNTIME_MANIFEST.json.

L’édition visuelle charge les modules de la campagne 0.10.0 puis ses adaptateurs de présentation. Elle conserve le format et la clé de sauvegarde du DLC. La sauvegarde principale de Tantalus reste distincte.

Les images du jeu se chargent à la demande. Une image absente, invalide, non chargée, de dimensions incorrectes ou privée d’une attache nécessaire conserve le dessin natif. La sélection essaie les poses suivantes lorsqu’une pose prioritaire est inutilisable. Les états consommés, détruits, terminés et les ouvertures sans image adaptée conservent leur représentation native.

## Nouveaux raccordements

| Élément | Usage et état réel |
| --- | --- |
| Deux poses de marche | Decker debout, non armé et mobile. Les deux contacts alternent selon l’horloge de simulation ; le repos et les mouvements réduits gardent la pose fixe. |
| Lampe personnelle | Fixation à l’ancre du corps ; faisceau issu de la lentille. L’orientation et l’extinction sont respectées. |
| Éclair de bouche | Événements de tirs balistiques admis, au canon effectivement dessiné. |
| Flamme | Événement natif de tir ; le PNG remplace le trait opaque lorsqu’il est disponible. L’arme sans PNG conserve son dessin natif. |
| Impact et étincelles | Événements hit et spark existants, sans nouveau dégât. |
| Acide | Flaques réelles encore actives, dessinées au sol avant les acteurs ; marquage et avertissement natifs conservés. |
| Mousse | Amas au pied d’un ennemi dont l’état de mousse est actif ; quantité et transparence suivent cet état. Cette image ne représente pas un jet. |
| Cadre et panneau de porte | Vingt seuils industriels de face ou de fond compatibles. Même transformation du canevas pour les deux pièces ; panneau seulement lorsque la porte native est fermée. |
| Commande de cloison | Deux boîtiers aux deux positions réelles de commande. Cloison, intégrité, progression, état et instructions restent natifs. |
| Commande d’éclairage | Boîtier au pupitre réel ; voyant actif selon l’état réel du circuit. |

Les portes obliques, les brèches rocheuses, les ascenseurs, escaliers, rampes et transports conservent leur géométrie native. Le raccordement des PNG ne déplace ni ouverture, ni collision, ni point d’arrivée.

### Interface d’équipement

Le masque respiratoire, la trousse, le détecteur et la radio possèdent maintenant un usage dans l’interface. Les boutons existants, leurs gestionnaires, les stocks et leurs restrictions restent en place. Les trois armes disposant d’un PNG sont également illustrées dans l’armurerie.

Le dessin du filtre représente un **masque complet**, pas une cartouche isolée : la carte porte le titre « Protection respiratoire » et précise que le nombre affiché correspond aux cartouches de réserve. La lampe suit son état dès le prologue. Le détecteur suit sa possession et son activation natives. La radio reste une illustration des communications de mission ; aucun stock, événement d’acquisition ou niveau de batterie n’est inventé.

Les images ne remplacent pas les libellés. Un chargement en échec ou de mauvaises dimensions conserve le texte et les pictogrammes. La légende du masque occupe toute la largeur de la carte dans la disposition mobile.

## Inventaire artistique

| Famille | Images |
| --- | ---: |
| Personnages et poses | 24, dont 16 identités |
| Décors | 50 |
| Obstacles | 6, correspondant aux 120 placements de campagne |
| Équipements | 16 |
| Effets | 6 |
| Objectifs | 4 |
| Dispositifs | 3 |
| Armes | 3 |
| Portes, parasites, brancards | 2 par famille |
| Œuf, facehugger vivant et cadavre | 1 par famille |

Les découpes, pivots et attaches utilisent les pixels de l’image entière. L’enveloppe alpha ≥ 8 et sa marge de deux pixels sont calculées sans modifier les PNG. La hauteur dans le monde est divisée une seule fois par la hauteur de cette découpe.

Les pieds servent de pivots aux personnages. Le pistolet est composé devant le corps avec reprise des pixels autour des mains ; les deux armes longues restent derrière les mains. Le départ visuel du tir suit le canon dessiné sans déplacer les cibles, impacts ou dégâts. La prise secondaire demeure une limite artistique à affiner.

Le parasite royal mesure 31,75 unités et le parasite normal 25 : le rapport 1,27 est déjà inclus. Les brancards emploient l’orientation none, avec head-right conservé comme indication anatomique séparée.

## Campagne, distribution et correction de la CI

L’arbre original dlc/sea-of-sorrows demeure **1024a04d3615e135a0a9de7cbff6819e107a2492**. Ses 3 029 fichiers et les 59 livrables historiques restent conservés et vérifiés séparément. Les adaptateurs préservent le prototype du moteur de simulation, les interactions, les sélecteurs de cible, les états de mission et les sauvegardes.

La base de cette continuation est le commit **8cb25462b9b0328b09ae28b278356113d325c603** de la PR nº 58. Il réunissait déjà le checkpoint précédent, la récupération de la PR nº 67 et la branche cumulative b0df1877a058f0818f96437fdfdea3f21ba7f415.

La CI de ce checkpoint a révélé trois liens de validation oubliés pour .gitattributes, .vercelignore et title-screen-v61.css. Ils sont ajoutés après les reçus existants, avec les empreintes exactes des fichiers déjà publiés. Un palier suivant inscrit uniquement l’ajout du test d’équipement dans package.json. Les sept reçus de fusion Mer, les trois reçus visuels et tous leurs préfixes historiques sont conservés ; les modifications de mêmes tailles, les prédécesseurs inconnus et les répétitions restent refusés.

Le lot visuel distribué contient **128 fichiers** : **121 PNG, deux pages HTML, quatre scripts et une feuille de style**. L’admission fixe chaque chemin, taille et SHA-256. Les manifestes, archives, rapports, prompts, outils et captures restent des sources. Les fichiers supplémentaires, chemins ambigus, liens symboliques et octets altérés sont refusés.

## Validation et portée des preuves

[VALIDATION.json](VALIDATION.json) consigne les commandes réellement terminées, leur résultat et le commit utilisé pour le build.

- Les **59 tests du renderer** exécutent les vrais modules de simulation avec des doubles Canvas/Image. Ils couvrent notamment les tirs acceptés et refusés, les effets, les attaches, les portes, les commandes et les deux contacts de marche.
- Les **six tests d’équipement** utilisent le vrai modèle de partie avec un DOM simulé. Ils vérifient la conservation des boutons et des stocks, les états initiaux, l’absence de doublons et les replis d’image.
- La QA de pixels utilise **@napi-rs/canvas 0.1.100**. Elle charge **121 PNG**, rend **50 salles**, **18 combinaisons de posture/arme/direction**, **12 cas de locomotion** et **44 cas de détail**.
- Les 12 locomotions comprennent quatre marches, quatre repos et quatre mouvements réduits. Le repos et les mouvements réduits restent identiques au pixel entre les temps examinés.
- Les 44 détails comprennent six effets issus d’actions natives, quatre lampes, deux éclairages, trois cloisons, quatre portes compatibles et **25 replis de porte identiques pixel par pixel au renderer original**.
- Les rendus préservent les sauvegardes sérialisées, les checkpoints, les modules natifs, le prototype du jeu et les 121 fichiers PNG.

Huit captures sont conservées dans le dépôt : s01, s14, s26, s33, s34, s50, [locomotion.png](canvas/locomotion.png) et [details.png](canvas/details.png). La planche de détails montre 23 des 44 cas exécutés. Une neuvième planche de travail de poses/armes a été inspectée sans être ajoutée au lot distribué.

Le décodeur Skia refuse les chunks de provenance caBX ; la QA les omet uniquement dans son buffer en mémoire. Les PNG source, leurs métadonnées et leurs chunks de pixels IDAT conservent leurs octets d’origine.

Ces rendus sont des **fixtures déclarées**, pas une traversée jouée. Chromium reste indisponible dans l’environnement local ; le téléchargement tenté lors de la reprise précédente a renvoyé HTTP 403. Aucune nouvelle réussite de parcours navigateur Mer, de contrôle tactile réel ou de manette physique n’est revendiquée. Les résultats locaux et la CI distante restent distingués dans le reçu.

## Limites encore ouvertes

Quatre PNG restent absents : adulte xénomorphe, reine, fusil plasma et lance-flammes. Les demandes de génération précédemment refusées n’ont pas été relancées. Leur représentation native demeure disponible.

Les deux nouvelles marches sont **deux poses clés**, pas un cycle complet. Les cycles complets de marche, tir, rechargement et interaction restent à produire. La cohérence anatomique de la seconde main et des proportions entre poses reste à affiner. Le levier dessiné sur la commande de cloison est fixe ; son voyant et sa légende portent l’état réel. Un léger chevauchement des textes natifs G / E et de l’état de cloison reste visible dans une projection isolée.

Les sept images d’une passe locale distincte non retrouvée ne sont pas comprises dans les 121. Aucun identifiant vérifiable supplémentaire n’a pu être récupéré pour elles. Les onze anciennes versions de code dont les octets restent introuvables ont été remplacées par une reconstruction fonctionnelle ; leurs octets originaux ne sont pas déclarés récupérés.

Les identités et rôles du roman ne certifient pas les visages, costumes ou silhouettes de matériel. Les dessins restent des interprétations du projet. Le texte intégral n’a pas été confronté et **la fidélité globale 1:1 n’est pas certifiée**.

## Commandes

```sh
npm run test:mer-des-chagrins-visual
npm run check:mer-des-chagrins-sprites
node scripts/mer-des-chagrins-visual-admission-20261126.mjs
npm run test:dlc:sea-of-sorrows
npm run qa:mer-des-chagrins:canvas
npm run test:all
npm run check
npm run build
npm run check:built
```

La dépendance Canvas de QA est fournie par l’environnement de travail et ne devient pas une dépendance du jeu. L’existence de ces commandes ne constitue pas leur résultat : le reçu de validation indique précisément les exécutions terminées.


</details>


</details>

</details>
