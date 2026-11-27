# ALIEN — Fleuve de la Douleur

## Codex de level design · 0.7.0-candidate.1

Hadley’s Hope · Dans le souffle des gaines

DLC autonome avec lanceur additionnel, pas le jeu Tantalus complet ni son GameEngine natif. Aucun push GitHub ni déploiement Vercel. Dessins stylisés par code provisoires, pas atlas définitifs ou reconstitution 1:1. Roman intégral non consulté : plans, dialogues, tâches et documents sont une condensation originale. L’écho Frontière 2204 et les sauvegardes du moteur hôte ne sont pas modifiés.

## Périmètre de la passe 0.7

La même campagne conserve 16 chapitres de jeu, 42 pièces, 57 connexions jouables bidirectionnelles, 49 objectifs principaux, deux escortes et six détours facultatifs de trois étapes. Les 489 placements de décor ne sont pas 489 dessins uniques. Les éléments de crise, cachettes, habitants, réserves, volets et alarmes ne sont pas recomptés comme nouvelles pièces.

Cinq gaines techniques à deux extrémités ajoutent dix bouches de maintenance. Elles servent aux adultes xénomorphes existants et aux interactions locales de leurs grilles. Elles ne sont pas des portes pour le joueur, ni cinq nouvelles pièces. Les conduits jouables réservés à Newt sont distincts et inchangés. Ces tracés et toutes leurs durées sont des créations de gameplay, pas un plan officiel du roman.

## Entrée : déplacer une créature, ne pas en fabriquer une

À partir du stade de crise 2, un adulte vivant peut prendre une gaine proche lorsqu’il a perdu sa cible et sa mémoire de perception. La vue du joueur ou du compagnon, une mémoire récente, un repli devant une fusée et une attaque engagée restent prioritaires. Un petit parasite de type facehugger n’emprunte pas ce nouveau réseau. La gaine ne recrute aucun ennemi hors du contenu existant.

L’adulte rejoint la bouche par la navigation locale et prépare son entrée durant 1,1 seconde. Il reste dans la pièce et peut être touché pendant cette préparation. Une perception renouvelée annule l’entrée. Une balle mortelle supprime l’entrée en cours : un cadavre n’est pas transporté ni rendu vivant après import.

Au départ, la même créature, avec son identifiant et sa santé, est retirée du tableau de la pièce source et placée dans un registre de transfert. Elle n’a jamais deux propriétaires simultanément. La gaine conserve au plus un transfert et les temps de repos évitent une boucle instantanée : 12 secondes pour la liaison, 24 secondes pour l’adulte après arrivée. Les cinq trajets durent de 4 à 5,6 secondes de simulation.

Les deux grilles doivent être ouvertes ou arrachées pour qu’un nouveau départ soit autorisé. Verrouiller la bouche source derrière un adulte déjà engagé ne le rappelle pas, ne le duplique pas et ne le tue pas. Il se trouve déjà dans la liaison. Une grille fermée à destination après son départ peut le retenir.

## Sortie : annonce, dégagement et limites hors champ

Les minuteries de transport avancent pendant le jeu, même hors de la pièce courante et pendant un raccord engagé du personnage. Les menus et l’échec les suspendent. Ce registre temporel n’est pas une simulation physique de la gaine, ni une IA continue de toute la colonie.

La sortie ne se matérialise que lorsque la pièce de destination est active et que le joueur n’est pas en raccord. La grille vibre et un avertissement de 2,4 secondes précède l’arrivée. Une zone de dégagement de 300 unités internes doit rester libre autour du joueur et du compagnon. Il s’agit d’une distance de jeu x/z, pas de mètres. Une obstruction ou une population de douze entrées ennemies déjà atteinte empêche également la matérialisation.

Si le joueur ou son compagnon reste trop près, le moteur maintient le transfert et réinitialise le préavis ; il ne pousse, ne blesse et ne téléporte personne pour forcer une apparition. On peut donc volontairement retarder cette sortie en occupant sa zone. Ce garde-fou de prototype n’est pas un comportement naturel garanti du xénomorphe. Les créatures hors champ ne poursuivent pas un itinéraire autonome complet et ne traversent pas plusieurs gaines en chaîne sans simulation locale.

L’arrivée conserve identité et santé, engage une recherche locale et un bref délai de reprise d’attaque, pas une frappe instantanée. Elle ne livre pas à l’adversaire la position d’un joueur silencieux caché. Le nombre d’adultes n’augmente pas du seul fait du passage.

## Verrouiller, libérer, subir la pression

E ouvre le dossier lorsque la grille est l’interaction prioritaire. La touche 4 ouvre explicitement GAINES TECHNIQUES, également accessible depuis l’équipement. Le dossier ne liste que les bouches de la pièce courante. Les boutons expliquent les refus de distance, de personnage ou d’état. Aucune commande à distance n’existe.

Un adulte humain à portée verrouille en 2 secondes et libère en 1,2 seconde. La lecture du dossier met le monde en pause ; la manipulation se déroule ensuite avec dangers et ennemis actifs. Un déplacement ou une blessure interrompt le travail avant son effet. L’occupation de la bouche par un adulte xénomorphe est vérifiée au départ et à la fin. La fermeture ne retire pas une créature du monde pour libérer artificiellement la grille.

Une grille neuve possède 100 d’intégrité. Sa libération ne la répare pas. Une créature arrivée dans la gaine face à une grille fermée annonce des coups de 0,9 seconde qui retirent chacun 34 points. Trois coups suffisent donc à l’arracher. Les frappes n’avancent qu’avec la destination active, pas dans une pièce abandonnée hors champ. Après rupture, un préavis complet de sortie est encore requis. Les débris restent visibles et aucun verrou ne peut être reconstitué gratuitement.

Ces grilles ferment une bouche technique, pas le passage du joueur dans toute la pièce. Les stations restent non collisionnables pour ses déplacements et ne remplacent pas les huit volets de confinement de la 0.6. Elles ne sont pas de nouvelles couvertures balistiques. Les règles des portes soudées, des volets et de leurs petits parasites sont conservées séparément.

Newt peut écouter mais ne peut ni verrouiller ni libérer les grilles industrielles de cette passe. Elle ne reçoit ni arme, ni détecteur, ni recette supplémentaire. Anne peut actionner un verrou sans devenir un personnage armé.

## Écoute et détecteur : des indices locaux

L’écoute d’une grille demande 1,7 seconde de calme sur place. Un bruit excessif, un déplacement ou une blessure interrompt la manœuvre. Le dossier mémorise au plus douze relevés : identifiant de bouche, date de jeu et indice qualitatif. Frottements, pression contre un verrou ou signal masqué n’affichent pas l’identité exacte d’un ennemi hors champ. « Aucun mouvement perçu » ne constitue pas une certification de sécurité.

La lecture du dossier suspend le jeu mais ne rafraîchit pas les relevés. L’ancienne écoute N aux portes et son dossier O restent indépendants. Le détecteur de Brackett ou Paris peut recevoir un écho de gaine proche lorsqu’un transfert approche de sa sortie, à travers une grille non verrouillée. Le point affiché est celui de la bouche ; ce n’est pas la position précise d’une créature dans un réseau cartographié. Newt ne gagne pas ce capteur.

## Rendu, plan et accessibilité

Les dix stations sont ancrées sur le terrain, triées en profondeur et dessinées sous forme de montant, bouche, grille et verrou. Les états ouvert, fermé endommagé et arraché se distinguent. Les vibrations et poussières annoncent une arrivée ; l’option d’animations atténuées réduit les mouvements, pas le délai de sécurité. Les signaux sonores restent procéduraux et facultatifs.

L’intitulé du contact a été sorti du masque arrondi de l’écran radar, qui en rognait le début. Le plan local ajoute G01A à G05B sans les transformer en destinations du graphe de portes. Le registre reste défilant à 130 % de texte sur écran portrait et paysage court. La ligne de version du menu initial, héritée à tort en 0.5 dans le shell précédent, est corrigée en 0.7.

## Persistance, validation et retours au point de contrôle

Le format externe de campagne reste `river-of-pain`, schéma 1. Le registre `ducts.revision = 7` conserve grilles, dégâts, repos, créatures transportées, préavis, coups en cours et relevés. Les vrais exports 0.1 à 0.6 reçoivent des grilles ouvertes et aucun transfert fictif. Le contenu des coffres, les objectifs et les poches antérieures ne sont pas réinitialisés.

Un travail manuel de verrouillage inachevé est annulé à l’import, sans fausse manipulation validée. Un adulte déjà transporté reprend son temps restant, sa santé et son propriétaire unique. Les doublons entre pièce et gaine, liaisons inconnues, minuteries hors bornes, grilles incohérentes et entrées d’ennemis morts sont refusés. Un point de contrôle restaure tout le monde à son état enregistré ; une action effectuée ensuite n’est pas arbitrairement conservée après une mort.

Le protocole à deux copies locales reste éprouvé avec MemoryStorage simulé. Il ne certifie pas le stockage natif après fermeture du navigateur, les quotas réels, les onglets concurrents ou le mode privé. Les téléchargements et imports JSON par les boutons ordinaires sont éprouvés séparément. Les archives intégrales précédentes restent des livraisons distinctes ; le paquet courant n’imbrique pas leurs captures pour gonfler sa taille.

## Recette et limites de production

Les tests du modèle couvrent les deux sens, les deux vues, les priorités de perception, l’identité unique, la sécurité des sorties, la pression des grilles et les migrations. Cinq familles de six pilotes parcourent la campagne depuis une partie neuve. Le dernier tour ajoute les dix grilles, fermées, libérées et écoutées sur place pendant le calme, puis termine les activités héritées et la campagne. Les scènes de menace sous pression sont éprouvées séparément avec des sauvegardes préparées, pas revendiquées comme trente parties humaines.

Ces pilotes connaissent routes et solutions. Ils vérifient la continuité, pas la difficulté de découverte, la durée humaine ou des performances sur la machine du joueur. La recette navigateur courante est ciblée sur trois sessions 0.7 et n’additionne pas les 145 anciens contrôles 0.6 comme s’ils avaient été rejoués.

Les dessins restent stylisés et provisoires. Les véhicules ne sont toujours pas pilotables et les raccords d’escaliers ou monte-charges restent bornés, non des volumes verticaux continus. Aucune nouvelle issue canonique, évacuation de Newt ou mort de reine n’est ajoutée. Le moteur hôte, ses sauvegardes et l’écho Frontière 2204 ne sont pas modifiés. Aucun push GitHub ni déploiement Vercel.

## Cinq gaines et dix grilles techniques

| Gaine | Bouche / pièce / x / z | Bouche opposée / pièce / x / z | Temps de transfert |
|---|---|---|---|
| Reprise de manutention · `reprise` | G01A · Coursive centrale · 2575 / 0.7 | G01B · Garage des prospecteurs · 2125 / 0.7 | 4 s |
| Descente du fret · `fret` | G02A · Magasin de fret · 2375 / 0.7 | G02B · Distribution électrique · 1775 / 0.7 | 4.4 s |
| Collecteur de maintenance · `collecteur` | G03A · Galerie technique · 2450 / 0.7 | G03B · Station de pompage · 1800 / 0.7 | 4.8 s |
| Retour de filtration · `sterile` | G04A · Infirmerie · 1825 / 0.7 | G04B · Laboratoire de la Compagnie · 1800 / 0.7 | 5.2 s |
| Retour des échangeurs · `echangeur` | G05A · Soubassements envahis · 2625 / 0.7 | G05B · Galerie du refroidissement · 2375 / 0.7 | 5.6 s |

Ces liaisons transportent seulement des adultes existants : elles ne sont pas les 57 connexions jouables du plan colonial. Préparation 1,1 s, sortie annoncée 2,4 s, dégagement 300 unités internes. Verrouiller 2 s, libérer 1,2 s, écouter 1,7 s. Aucun volume de gaine librement exploratoire ajouté.

## Huit volets dans les pièces

| Volet | Pièce | Emprise x / z ; largeur / profondeur | Commandes gauche et droite x / z |
|---|---|---|---|
| Volet de la galerie · `shutter-concourse` | Coursive centrale | 630 / 0.66 ; 52 / 0.46 | 536 / 0.7 ; 724 / 0.7 |
| Volet du bloc habitat · `shutter-hab` | Coursive résidentielle | 1090 / 0.7 ; 52 / 0.1 | 996 / 0.7 ; 1184 / 0.7 |
| Séparation médicale · `shutter-med` | Infirmerie | 470 / 0.66 ; 52 / 0.46 | 376 / 0.7 ; 564 / 0.7 |
| Rideau de manutention · `shutter-garage` | Garage des prospecteurs | 2310 / 0.66 ; 52 / 0.46 | 2216 / 0.7 ; 2404 / 0.7 |
| Volet du magasin · `shutter-stores` | Magasin de fret | 450 / 0.66 ; 52 / 0.46 | 356 / 0.7 ; 544 / 0.7 |
| Volet technique · `shutter-service` | Galerie technique | 1710 / 0.7 ; 52 / 0.1 | 1616 / 0.7 ; 1804 / 0.7 |
| Séparation du répartiteur · `shutter-power` | Distribution électrique | 1370 / 0.66 ; 52 / 0.46 | 1276 / 0.7 ; 1464 / 0.7 |
| Rideau du hangar · `shutter-hangar` | Hangar scientifique | 2370 / 0.66 ; 52 / 0.46 | 2276 / 0.7 ; 2464 / 0.7 |

En vue classique, z = 0,7 et profondeur de volet = 0,10. L’emprise devient physique seulement à fermeture réussie. Intégrité 100 ; fermeture 2,6 s, ouverture adulte 1,6 s, libération Newt 1,1 s. Pas de réparation.

## Quatre avertisseurs locaux

| Avertisseur | Pièce / circuit | x / z | Programmation → délai → signal | Réarmement / cycles |
|---|---|---|---|---|
| Avertisseur de la galerie · `alarm-concourse` | Coursive centrale / habitat | 1010 / 0.7 | 1,2 s → 4 s → 10 s | 45 s / 2 |
| Avertisseur médical · `alarm-med` | Infirmerie / medical | 930 / 0.7 | 1,2 s → 4 s → 10 s | 45 s / 2 |
| Avertisseur du garage · `alarm-garage` | Garage des prospecteurs / industry | 2810 / 0.7 | 1,2 s → 4 s → 10 s | 45 s / 2 |
| Avertisseur technique · `alarm-service` | Galerie technique / industry | 2050 / 0.7 | 1,2 s → 4 s → 10 s | 45 s / 2 |

Les cycles expirent hors champ, pas les parcours des ennemis. Un circuit coupé éteint le signal sans rembourser le cycle. La commande exige la présence d’un adulte à portée.

## Douze personnes de service originales

### Iona Vale · `vale`

**Maintenance de l’habitat · Coursive résidentielle · stades 0 et 1 uniquement**

Silhouette : hauteur 93, accessoire `tools`, apparence `short`. Trajet local : (590 / 0.7) → (830 / 0.7) → (410 / 0.7). Retrait : {'x': 410, 'z': 0.7}.

Avant la crise : « Le chauffage finit toujours par gagner contre les coupe-circuits. Jusqu’au prochain quart. »

Premiers incidents : « J’ai fermé deux logements vides pour garder les autres au chaud. Je n’aime pas ce silence derrière les portes. »

**Votre poste et votre matériel** · `work`

Les plaques jaunes suivent le départ habitat. Le tableau est en bas, après le magasin de fret. Ne réarmez pas tout ensemble.

**Les passages du secteur** · `route`

L’escalier du personnel débouche près de la cuisine. Sa poignée manque : la relève l’a laissée au réfectoire.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Malik Rhee · `rhee`

**Cuisine collective · Réfectoire · stades 0 et 1 uniquement**

Silhouette : hauteur 96, accessoire `mug`, apparence `cap`. Trajet local : (1150 / 0.84) → (1390 / 0.84) → (970 / 0.84). Retrait : {'x': 970, 'z': 0.84}.

Avant la crise : « Le café est tiède, mais il est là. Aujourd’hui, c’est une réussite. »

Premiers incidents : « Je prépare des portions froides. Quand les gens restent près de l’infirmerie, ils oublient de manger. »

**Votre poste et votre matériel** · `work`

Les rations de service sont dans la caisse grise. Prenez seulement ce qui vous manque : personne ne la remplit entre deux passages.

**Les passages du secteur** · `route`

L’office a un autre accès vers l’habitat. Regardez le mécanisme avant de partir chercher sa pièce.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Vera Arden · `arden`

**Soins de proximité · Infirmerie · stades 0 et 1 uniquement**

Silhouette : hauteur 99, accessoire `tablet`, apparence `tied`. Trajet local : (1750 / 0.84) → (1990 / 0.84) → (2110 / 0.84). Retrait : {'x': 2110, 'z': 0.84}.

Avant la crise : « Posez les caisses près du mur. L’allée entre les lits doit rester libre. »

Premiers incidents : « On nous apporte des questions à chaque porte. J’aurais préféré des couvertures propres. »

**Votre poste et votre matériel** · `work`

Une trousse emportée n’est plus disponible dans le tiroir. Les réserves de cet atelier sont limitées, même si vous revenez avec un autre uniforme.

**Les passages du secteur** · `route`

L’atelier biomédical rejoint la réserve. Le contacteur du verrou est à remplacer ; ne comptez pas sur cette porte avant la réparation.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Arun Becker · `becker`

**Archivage des relevés · Salle des archives · stades 0 et 1 uniquement**

Silhouette : hauteur 102, accessoire `tablet`, apparence `short`. Trajet local : (590 / 0.7) → (830 / 0.7) → (410 / 0.7). Retrait : {'x': 410, 'z': 0.7}.

Avant la crise : « La machine a perdu une ligne. La feuille papier, elle, n’a pas bougé. »

Premiers incidents : « Je garde une copie locale de chaque message. Ce qui disparaît du réseau ne devrait pas disparaître de nos souvenirs. »

**Votre poste et votre matériel** · `work`

Les documents trouvés restent dans votre carnet. Mes échanges restent dans le registre des personnes rencontrées, pas dans le compteur des notes.

**Les passages du secteur** · `route`

Un coupleur de la terrasse a été rangé ici. Il concerne la liaison intérieure, pas un appel vers un vaisseau.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Solène Ferris · `ferris`

**Manutention du fret · Magasin de fret · stades 0 et 1 uniquement**

Silhouette : hauteur 93, accessoire `tools`, apparence `cap`. Trajet local : (1330 / 0.84) → (1570 / 0.84) → (1150 / 0.84). Retrait : {'x': 1150, 'z': 0.84}.

Avant la crise : « Chaque palette a sa place. C’est quand on les empile devant les issues que ça devient dangereux. »

Premiers incidents : « J’ai dégagé les allées. Les couvertures sont sur le côté, pas sous les charges. »

**Votre poste et votre matériel** · `work`

Les coffres gardent ce que vous y laissez. Un fermoir ouvert reste ouvert ; inutile de recommencer la fouille.

**Les passages du secteur** · `route`

Le garage mène à l’atelier de manutention. Le palan est immobilisé. La chaîne de rechange n’est pas ici, elle est au garage.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Nils Corban · `corban`

**Relais des transmissions · Relais de communications · stades 0 et 1 uniquement**

Silhouette : hauteur 96, accessoire `tablet`, apparence `short`. Trajet local : (1310 / 0.7) → (1550 / 0.7) → (1130 / 0.7). Retrait : {'x': 1130, 'z': 0.7}.

Avant la crise : « Le vent fait chanter les haubans avant qu’on l’entende dans les fenêtres. »

Premiers incidents : « Le réseau intérieur tient par intermittence. Je note les silences aussi soigneusement que les réponses. »

**Votre poste et votre matériel** · `work`

La terrasse sert aux liaisons de la colonie. Un voyant vert ici ne signifie pas que quelqu’un nous a entendus ailleurs.

**Les passages du secteur** · `route`

L’antenne a un palier vers le contrôle colonial. Tant que le coupleur manque, l’accès de service reste condamné.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Ezra Hale · `hale`

**Atelier des prospecteurs · Garage des prospecteurs · stades 0 et 1 uniquement**

Silhouette : hauteur 99, accessoire `tools`, apparence `cap`. Trajet local : (1050 / 0.84) → (1290 / 0.84) → (870 / 0.84). Retrait : {'x': 870, 'z': 0.84}.

Avant la crise : « Ne passez pas sous le palan. À l’arrêt, une machine reste une machine lourde. »

Premiers incidents : « Le tracteur est prêt, mais la piste n’a jamais été une promenade. Gardez les balises du même côté au retour. »

**Votre poste et votre matériel** · `work`

Un boîtier, un fil et une pile font une balise sonore sur un établi. Elle n’explose pas. Il faut la poser puis s’éloigner avant ses bips.

**Les passages du secteur** · `route`

Le bruit peut détourner une créature qui vous a perdu. Il ne lui fera pas oublier quelqu’un qu’elle voit déjà.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Mei Doran · `doran`

**Maintenance biomédicale · Atelier biomédical · stades 0 et 1 uniquement**

Silhouette : hauteur 102, accessoire `tablet`, apparence `tied`. Trajet local : (950 / 0.84) → (1190 / 0.84) → (770 / 0.84). Retrait : {'x': 770, 'z': 0.84}.

Avant la crise : « Il manque toujours une pièce. Aujourd’hui, au moins, je sais laquelle. »

Premiers incidents : « J’ai séparé les pièces réparables des appareils contaminés. Regardez les étiquettes avant de toucher. »

**Votre poste et votre matériel** · `work`

L’établi peut assembler une balise sonore ou utiliser une pile pour la lampe. Les composants ne sont consommés qu’à la fin de la manœuvre.

**Les passages du secteur** · `route`

Le travail au banc reste exposé. Éloignez-vous ou interrompez-vous plutôt que terminer coûte que coûte sous une attaque.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Lina Sato · `sato`

**Lingerie de service · Buanderie · stades 0 et 1 uniquement**

Silhouette : hauteur 93, accessoire `linen`, apparence `tied`. Trajet local : (1310 / 0.84) → (1550 / 0.84) → (1130 / 0.84). Retrait : {'x': 1130, 'z': 0.84}.

Avant la crise : « Les draps propres sont à gauche. Ceux qui attendent leur étiquette ne partent nulle part. »

Premiers incidents : « On demande plus de linge à l’infirmerie. J’attends qu’on me dise quelle porte garder fermée. »

**Votre poste et votre matériel** · `work`

Vous pouvez ouvrir un fermoir lentement, ou le forcer plus vite. Le bruit du second choix n’est pas seulement une animation.

**Les passages du secteur** · `route`

Les coursives mènent aux logements. Une porte de logement dessinée sur un panneau n’est pas forcément une issue praticable.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Tomas Bell · `bell`

**Entretien des loisirs · Centre de loisirs · stades 0 et 1 uniquement**

Silhouette : hauteur 96, accessoire `tools`, apparence `short`. Trajet local : (790 / 0.84) → (1030 / 0.84) → (610 / 0.84). Retrait : {'x': 610, 'z': 0.84}.

Avant la crise : « Le jeu de droite redémarre tout seul. Je lui accorde encore une chance. »

Premiers incidents : « Les machines sont coupées. On entend les conversations du couloir sans avoir besoin de hausser la voix. »

**Votre poste et votre matériel** · `work`

Les pas pressés couvrent les petits bruits. Pour écouter à une porte, restez immobile et laissez retomber votre propre vacarme.

**Les passages du secteur** · `route`

Les enfants connaissent les conduits. Ce n’est pas un accès de secours pour un adulte chargé de matériel.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Rosa Kent · `kent`

**Accueil des arrivants · Coursive centrale · stades 0 et 1 uniquement**

Silhouette : hauteur 99, accessoire `tablet`, apparence `tied`. Trajet local : (1010 / 0.84) → (1250 / 0.84) → (830 / 0.84). Retrait : {'x': 830, 'z': 0.84}.

Avant la crise : « Les nouveaux cherchent les bureaux. Les habitués cherchent la cafetière. »

Premiers incidents : « Je répète les dernières consignes tant que le haut-parleur répond. Après, il faudra parler aux gens un par un. »

**Votre poste et votre matériel** · `work`

Le plan vous aide à choisir une porte, pas à voyager à sa place. Les niveaux sont reliés par les vrais accès de la colonie.

**Les passages du secteur** · `route`

Les personnes du registre n’émettent pas de balise de suivi. Leur dernière position est un souvenir, pas une promesse de les y retrouver.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

### Anton Voss · `voss`

**Relevés des prospecteurs · Bureau des prospecteurs · stades 0 et 1 uniquement**

Silhouette : hauteur 102, accessoire `tablet`, apparence `short`. Trajet local : (1170 / 0.84) → (1410 / 0.84) → (990 / 0.84). Retrait : {'x': 990, 'z': 0.84}.

Avant la crise : « Le relief change de couleur à chaque éclaircie. Les coordonnées, elles, restent les mêmes. »

Premiers incidents : « Les feuilles du secteur sont revenues couvertes de poussière. Les questions suivent plus vite que les réponses. »

**Votre poste et votre matériel** · `work`

Les caisses d’outillage contiennent des pièces utiles aux adultes. Les enfants ne prennent ni munitions ni balises sonores.

**Les passages du secteur** · `route`

Un détour reste facultatif. Avant de réparer une issue, vérifiez de quel côté se trouve votre prochain objectif.

Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.

## Réserves finies et établis

| Réserve / identifiant | Pièce | Point x / z | Contenu initial |
|---|---|---|---|
| Casier de relève · `supply-arrivals` | Coursive centrale | 1870 / 0.84 | 2 Pile de service ; 1 Fil de raccordement |
| Mallette de terrain · `supply-garrison` | Poste de la garnison | 1330 / 0.7 | 1 Boîtier vide ; 1 Fil de raccordement ; 18 Munitions M41A |
| Réserve de portions froides · `supply-kitchen` | Réfectoire | 1690 / 0.84 | 2 Portion froide ; 1 Pile de service |
| Tiroir du logement · `supply-habitat` | Logement des Jorden | 1310 / 0.84 | 1 Portion froide ; 1 Trousse de soins |
| Coffret de soins · `supply-medical` | Infirmerie | 490 / 0.84 | 2 Trousse de soins ; 1 Pile de service |
| Pièces de diagnostic · `supply-biomedical` | Atelier biomédical | 1590 / 0.84 | 1 Pile de service ; 2 Fil de raccordement ; 1 Boîtier vide |
| Tiroir des transmissions · `supply-archive` | Salle des archives | 1210 / 0.7 | 1 Fil de raccordement ; 1 Boîtier vide |
| Caisse des prospecteurs · `supply-garage` | Garage des prospecteurs | 1850 / 0.84 | 2 Pile de service ; 1 Fil de raccordement ; 2 Boîtier vide |
| Coffre de dotation · `supply-cargo` | Magasin de fret | 1870 / 0.84 | 2 Fusée de détresse ; 24 Munitions M41A |
| Panier de dépannage · `supply-laundry` | Buanderie | 1130 / 0.84 | 1 Portion froide ; 1 Trousse de soins |
| Mallette du palan · `supply-workshop` | Atelier de manutention | 1970 / 0.84 | 2 Fil de raccordement ; 1 Pile de service ; 1 Boîtier vide |
| Petite boîte oubliée · `supply-vent` | Conduits de l’habitat | 1410 / 0.7 | 2 Portion froide |

Les contenus sont partagés entre les protagonistes. Les prises respectent les capacités ; les surplus restent dans le meuble.

| Établi / identifiant | Pièce | Point x / z | Recettes |
|---|---|---|---|
| Banc de préparation · `bench-garrison` | Poste de la garnison | 1970 / 0.7 | Balise sonore / recharge de lampe |
| Établi biomédical · `bench-biomed` | Atelier biomédical | 1810 / 0.84 | Balise sonore / recharge de lampe |
| Établi de maintenance · `bench-workshop` | Atelier de manutention | 2310 / 0.84 | Balise sonore / recharge de lampe |

Les stations ne sont pas des couvertures collisionnables supplémentaires. Le point ci-dessus est la cible physique de l’interaction, avec une portée de proximité.

## Registre des 21 liaisons temporisées

Les liaisons ci-dessous se parcourent dans les deux sens. Les points de départ et de retour détaillés dans chaque fiche de pièce restent les coordonnées de référence. Les temps sont des secondes de simulation, pas des mesures du film ou du roman.

| Origine | Destination | Nature | Niveaux | Préparation exposée | Trajet engagé |
|---|---|---|---|---:|---:|
| Aire d’atterrissage | Sas des arrivants | sas | 0 → 0 | 1.1 s | 1.1 s |
| Coursive centrale | Contrôle colonial | escalier | 0 → 1 | 0.45 s | 1.4 s |
| Coursive centrale | Coursive résidentielle | escalier | 0 → 1 | 0.45 s | 1.4 s |
| Contrôle colonial | Terrasse des antennes | escalier | 1 → 2 | 0.45 s | 1.4 s |
| Coursive résidentielle | Centre de loisirs | escalier | 1 → 0 | 0.45 s | 1.4 s |
| Coursive résidentielle | Buanderie | escalier | 1 → 0 | 0.45 s | 1.4 s |
| Coursive résidentielle | Office de la cuisine | escalier | 1 → 0 | 0.45 s | 1.4 s |
| Infirmerie | Laboratoire de la Compagnie | sas | 0 → 0 | 1.1 s | 1.1 s |
| Laboratoire de la Compagnie | Salle des archives | escalier | 0 → 1 | 0.45 s | 1.4 s |
| Laboratoire de la Compagnie | Galerie technique | escalier | 0 → -1 | 0.45 s | 1.4 s |
| Laboratoire de la Compagnie | Hangar scientifique | sas | 0 → 0 | 1.1 s | 1.1 s |
| Garage des prospecteurs | Galerie technique | escalier | 0 → -1 | 0.45 s | 1.4 s |
| Garage des prospecteurs | Piste du plateau | sas | 0 → 0 | 1.1 s | 1.1 s |
| Magasin de fret | Distribution électrique | escalier | 0 → -1 | 0.45 s | 1.4 s |
| Distribution électrique | Galerie du refroidissement | échelle | -1 → -2 | 0.5 s | 1.8 s |
| Station de pompage | Accès au processeur un | escalier | -1 → 0 | 0.45 s | 1.4 s |
| Station de pompage | Dérivation des eaux grises | échelle | -1 → -2 | 0.5 s | 1.8 s |
| Accès au processeur un | Monte-charge du processeur | monte-charge | 0 → -1 | 1.2 s | 2.4 s |
| Monte-charge du processeur | Soubassements envahis | monte-charge | -1 → -2 | 1.2 s | 2.4 s |
| Galerie du refroidissement | Dérivation des eaux grises | échelle | -2 → -2 | 0.5 s | 1.8 s |
| Relais de communications | Terrasse des antennes | escalier | 1 → 2 | 0.45 s | 1.4 s |

## Registre des six détours

### La porte du personnel · `pantry`

**Office de la cuisine · Personnage adulte**

Le passage du personnel a perdu sa poignée. Une pièce de rechange attend près de la cuisine.

Boucle : Réfectoire → Office de la cuisine → Coursive résidentielle. L’entrée depuis Réfectoire ne demande pas d’avoir déjà ouvert la sortie.

| Étape | Salle | Action | x / z | Temps sur place |
|---|---|---|---|---|
| 1 | Office de la cuisine | Examiner · La porte du personnel | 470 / 0.81 | 0.6 s |
| 2 | Réfectoire | Récupérer la poignée de rechange | 390 / 0.28 | 0.9 s |
| 3 | Office de la cuisine | Ajuster la poignée et libérer l’escalier | 1630 / 0.81 | 2.0 s |

Pièce emportée : **Poignée de service**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.

Effet : `service-pantry` autorise les deux portails. Récompense : une trousse de soins, une seule fois ; document `a25` — Relève de cuisine. Le compteur de campagne principale ne change pas.

### L’atelier de garde · `biomed`

**Atelier biomédical · Personnage adulte**

Le verrou de la porte de réserve ne répond plus. Le contacteur se trouve dans le tiroir de maintenance médicale.

Boucle : Infirmerie → Atelier biomédical → Réserve médicale. L’entrée depuis Infirmerie ne demande pas d’avoir déjà ouvert la sortie.

| Étape | Salle | Action | x / z | Temps sur place |
|---|---|---|---|---|
| 1 | Atelier biomédical | Examiner · L’atelier de garde | 470 / 0.81 | 0.6 s |
| 2 | Réserve médicale | Prendre le contacteur de réserve | 720 / 0.7 | 0.9 s |
| 3 | Atelier biomédical | Remplacer le contacteur et libérer la réserve | 1980 / 0.81 | 2.0 s |

Pièce emportée : **Contacteur biomédical**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.

Effet : `service-biomed` autorise les deux portails. Récompense : une trousse de soins, une seule fois ; document `a26` — Pièces de rechange. Le compteur de campagne principale ne change pas.

### Une fréquence dans le vent · `aerial`

**Terrasse des antennes · Personnage adulte**

La liaison interne de la terrasse est débranchée. Un coupleur compatible a été rangé avec les bandes du relais.

Boucle : Relais de communications → Terrasse des antennes → Contrôle colonial. L’entrée depuis Relais de communications ne demande pas d’avoir déjà ouvert la sortie.

| Étape | Salle | Action | x / z | Temps sur place |
|---|---|---|---|---|
| 1 | Terrasse des antennes | Examiner · Une fréquence dans le vent | 470 / 0.81 | 0.6 s |
| 2 | Salle des archives | Retrouver le coupleur de transmission | 1050 / 0.7 | 0.9 s |
| 3 | Terrasse des antennes | Raccorder la liaison et libérer le palier | 2230 / 0.81 | 2.0 s |

Pièce emportée : **Coupleur radio**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.

Effet : `service-aerial` autorise les deux portails. Récompense : réserve de lampe remise à 100 %, une seule fois ; document `a27` — Ligne intérieure. Le compteur de campagne principale ne change pas.

### Le palan immobilisé · `workshop`

**Atelier de manutention · Personnage adulte**

Le rideau de service bloque la galerie. Une chaîne de rechange est suspendue dans le garage des prospecteurs.

Boucle : Garage des prospecteurs → Atelier de manutention → Processeur six. L’entrée depuis Garage des prospecteurs ne demande pas d’avoir déjà ouvert la sortie.

| Étape | Salle | Action | x / z | Temps sur place |
|---|---|---|---|---|
| 1 | Atelier de manutention | Examiner · Le palan immobilisé | 470 / 0.81 | 0.6 s |
| 2 | Garage des prospecteurs | Décrocher la chaîne d’entraînement | 450 / 0.28 | 0.9 s |
| 3 | Atelier de manutention | Remonter la chaîne et lever le rideau | 2530 / 0.81 | 2.0 s |

Pièce emportée : **Chaîne de palan**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.

Effet : `service-workshop` autorise les deux portails. Récompense : deux fusées, une seule fois ; document `a28` — Ne pas laisser sous charge. Le compteur de campagne principale ne change pas.

### Le retour des eaux · `drain`

**Dérivation des eaux grises · Personnage adulte**

La grille de la dérivation est verrouillée. La clé du collecteur a été déposée au tableau électrique.

Boucle : Station de pompage → Dérivation des eaux grises → Galerie du refroidissement. L’entrée depuis Station de pompage ne demande pas d’avoir déjà ouvert la sortie.

| Étape | Salle | Action | x / z | Temps sur place |
|---|---|---|---|---|
| 1 | Dérivation des eaux grises | Examiner · Le retour des eaux | 470 / 0.81 | 0.6 s |
| 2 | Distribution électrique | Récupérer la clé du collecteur | 1950 / 0.28 | 0.9 s |
| 3 | Dérivation des eaux grises | Ouvrir le retour et libérer la grille | 2380 / 0.81 | 2.0 s |

Pièce emportée : **Clé de collecteur**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.

Effet : `service-drain` autorise les deux portails. Récompense : réserve de lampe remise à 100 %, une seule fois ; document `a29` — La conduite qui revient. Le compteur de campagne principale ne change pas.

### Le fil qui revient · `nest`

**Renfoncement des câbles · Newt seule**

Un fil usé rejoint la petite grille. Un ruban neuf permettrait de la tirer sans se coincer les doigts.

Boucle : Conduits de l’infirmerie → Renfoncement des câbles → Cache des conduits. L’entrée depuis Conduits de l’infirmerie ne demande pas d’avoir déjà ouvert la sortie.

| Étape | Salle | Action | x / z | Temps sur place |
|---|---|---|---|---|
| 1 | Renfoncement des câbles | Examiner · Le fil qui revient | 470 / 0.7 | 0.6 s |
| 2 | Conduits de l’habitat | Retrouver le ruban de Tim | 1670 / 0.7 | 0.9 s |
| 3 | Renfoncement des câbles | Nouer le ruban et soulever la petite grille | 1480 / 0.7 | 2.0 s |

Pièce emportée : **Ruban de repérage**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.

Effet : `service-nest` autorise les deux portails. Récompense : 25 points de santé, maximum 100, une seule fois ; document `a30` — Le ruban noué. Le compteur de campagne principale ne change pas.

## Rencontres ajoutées et annonce

| ID / pièce | Nature | Stade minimum | Seuil x | Ancrage x / z | Préavis |
|---|---|---:|---:|---|---:|
| `workshop-hatch` / Atelier de manutention | intrusion | 2 | 1400 | 2800 / 0.7 | 3.2 s |
| `biomed-cabinet` / Atelier biomédical | intrusion | 2 | 1080 | 2250 / 0.7 | 3.0 s |
| `drain-return` / Dérivation des eaux grises | intrusion | 2 | 1230 | 2660 / 0.7 | 3.5 s |
| `nest-shadow` / Renfoncement des câbles | shadow | 1 | 1030 | 1570 / 0.7 | 4 s |
| `aerial-wind` / Terrasse des antennes | sound | 0 | 1150 | 2150 / 0.7 | 4.2 s |
| `pantry-tap` / Office de la cuisine | sound | 1 | 1030 | 1720 / 0.7 | 3.5 s |

**workshop-hatch** — La trappe du fond se déforme. Écartez-vous de l’axe.

**biomed-cabinet** — Un bruit sec derrière la cloison de l’atelier.

**drain-return** — Quelque chose heurte la grille au bout de la passerelle.

**nest-shadow** — Une ombre passe derrière la grille. Elle ne peut pas entrer ici.

**aerial-wind** — Le mât grince. La passerelle tient, mais le vent couvre les pas.

**pantry-tap** — Dans la cuisine vide, la vaisselle vibre au rythme de la ventilation.

## Campagne principale : 49 objectifs conservés

### 01 — La relève

**Demian Brackett · Avant la crise · Aire d’atterrissage**

Brackett prend ses fonctions dans une colonie qui ressemble encore à une ville.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Aire d’atterrissage | Retrouver Paris | `talk` |
| 2 | Contrôle colonial | Consulter le tableau de service | `terminal` |
| 3 | Poste de la garnison | Prendre la dotation | `supply` |

Dialogue original de jeu : **Paris** — « Vous verrez la tempête plus souvent que le ciel. Les familles, elles, sont ici toute l’année. »

### 02 — Les gens d’ici

**Anne Jorden · Avant la crise · Logement des Jorden**

Anne traverse les lieux ordinaires que la crise rendra bientôt méconnaissables.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Logement des Jorden | Préparer la tournée | `talk` |
| 2 | Réfectoire | Récupérer les provisions | `supply` |
| 3 | Distribution électrique | Réarmer le départ habitat | `power` |

Dialogue original de jeu : **Anne** — « On peut retarder les relevés. Pas le chauffage du bloc. »

### 03 — Sous pression

**Demian Brackett · Avant la crise · Garage des prospecteurs**

Une intervention industrielle expose les tensions de la garnison. Séquence de jeu condensée autour du processeur six.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Garage des prospecteurs | Prendre le matériel de secours | `supply` |
| 2 | Processeur six | Isoler la conduite endommagée | `valve` |
| 3 | Processeur six | Récupérer le rapport d’intervention | `terminal` |

Dialogue original de jeu : **Paris** — « Coupez l’arrivée avant de toucher aux vannes. Ici, une mauvaise décision se propage à tout le réseau. »

### 04 — Les coordonnées

**Anne Jorden · Avant la crise · Bureau des prospecteurs**

La sortie des Jorden rejoint le lieu désigné par la Compagnie. La découverte de Russ est traitée hors champ.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Bureau des prospecteurs | Recevoir la grille de prospection | `terminal` |
| 2 | Garage des prospecteurs | Préparer le tracteur | `vehicle` |
| 3 | Plateau des relevés | Poser une balise sur le plateau | `beacon` |
| 4 | Seuil de l’épave | Examiner le seuil de l’épave | `scan` |

Dialogue original de jeu : **Anne** — « La radio passe mal. Je laisse une balise : personne ne retrouvera cette passe de nuit. »

### 05 — La porte blanche

**Demian Brackett · Premiers incidents · Aire d’atterrissage**

Le retour des prospecteurs met l’infirmerie au centre de toutes les décisions.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Aire d’atterrissage | Prendre en charge le retour des prospecteurs | `talk` |
| 2 | Chambre d’isolement | Fermer l’isolement médical | `seal` |
| 3 | Infirmerie | Transmettre le bilan à Komiskey | `terminal` |

Dialogue original de jeu : **Komiskey** — « Gardez le couloir libre. Je veux des gens qui respirent, pas une foule autour du lit. »

### 06 — Priorité de recherche

**Anne Jorden · Premiers incidents · Infirmerie**

Les priorités médicales et celles de la Compagnie divergent.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Infirmerie | Consulter le registre des patients | `terminal` |
| 2 | Laboratoire de la Compagnie | Lire la directive scientifique | `terminal` |
| 3 | Salle des archives | Conserver une copie des échanges | `terminal` |

Dialogue original de jeu : **Anne** — « Ce n’est pas une cargaison. C’est mon mari. »

### 07 — Derrière les grilles

**Rebecca « Newt » Jorden · Premiers incidents · Logement des Jorden**

Les jeux dans les conduits deviennent un apprentissage de la survie. Aucun combat pour Newt.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Conduits de l’habitat | Retrouver les repères de Tim | `trace` |
| 2 | Conduits de l’infirmerie | Écouter derrière la grille | `listen` |
| 3 | Cache des conduits | Préparer une petite cache | `stash` |

Dialogue original de jeu : **Newt** — « Le tuyau qui vibre revient vers la cuisine. Celui qui siffle va à l’infirmerie. »

### 08 — Les absents

**Demian Brackett · La colonie se ferme · Contrôle colonial**

Les disparitions ont désormais une géographie. Les itinéraires sûrs commencent à se refermer.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Contrôle colonial | Relever les dernières balises PDT | `terminal` |
| 2 | Galerie technique | Suivre les traces dans la galerie | `scan` |
| 3 | Station de pompage | Détourner la pression du passage | `valve` |

Dialogue original de jeu : **Brackett** — « On marque chaque porte derrière nous. Je refuse de perdre quelqu’un à un embranchement. »

### 09 — Les lumières rouges

**Julisa Paris · La colonie se ferme · Infirmerie**

Paris maintient une route pour les habitants. L’escorte représente une survie locale, pas une évacuation historique supplémentaire.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Réserve médicale | Prendre les soins d’urgence | `supply` |
| 2 | Réfectoire | Accompagner un colon jusqu’au magasin | `escort` |
| 3 | Magasin de fret | Mettre le refuge provisoire sous tension | `power` |

Dialogue original de jeu : **Paris** — « Restez derrière moi. Nous allons jusqu’à la lumière suivante, puis à la suivante. »

### 10 — Fermer, tenir

**Anne Jorden · La colonie se ferme · Bureau des prospecteurs**

Les prospecteurs transforment leurs outils en moyens de défense.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Magasin de fret | Récupérer un poste à souder | `supply` |
| 2 | Bureau des prospecteurs | Renforcer la fermeture du bureau | `seal` |
| 3 | Distribution électrique | Rétablir le circuit de secours | `power` |

Dialogue original de jeu : **Anne** — « La porte n’a pas besoin de tenir toute la nuit. Seulement assez longtemps pour les enfants. »

### 11 — Sous le processeur

**Demian Brackett · La chute · Accès au processeur un**

Le passage dans la ruche est un échec de sauvetage, pas une chasse à la reine.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Monte-charge du processeur | Commander le monte-charge | `terminal` |
| 2 | Soubassements envahis | Retrouver la source des signaux | `scan` |
| 3 | Galerie du refroidissement | Baliser la route de repli | `beacon` |
| 4 | Distribution électrique | Fermer derrière le groupe | `seal` |

Dialogue original de jeu : **Brackett** — « N’approchez pas des parois. Repliez-vous par les balises ; ne tirez que pour ouvrir le passage. »

### 12 — La dernière porte

**Anne Jorden · La chute · Bureau des prospecteurs**

La défense des Jorden ne change pas leur destin. Le point de vue quitte Anne au moment où Newt passe la grille.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Bureau des prospecteurs | Alimenter le verrou une dernière fois | `power` |
| 2 | Bureau des prospecteurs | Dégager l’accès au conduit | `seal` |
| 3 | Bureau des prospecteurs | Mettre Newt à l’abri | `talk` |

Dialogue original de jeu : **Anne** — « Ne te retourne pas. Compte les virages comme quand vous jouiez. »

### 13 — Une issue réservée

**Julisa Paris · La chute · Laboratoire de la Compagnie**

Brackett transmet l’indication d’Hidalgo : la Compagnie dispose d’une issue. Luisa suit Paris jusqu’au hangar.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Laboratoire de la Compagnie | Recevoir la transmission de Brackett | `talk` |
| 2 | Bureau des prospecteurs | Dégager Luisa et la conduire au hangar | `escort` |
| 3 | Hangar scientifique | Déverrouiller la navette scientifique | `terminal` |

Dialogue original de jeu : **Paris** — « La sortie existe. Nous allons la rendre accessible à ceux qui sont encore avec nous. »

### 14 — La trajectoire imposée

**Demian Brackett · La chute · Hangar scientifique**

Brackett, Paris, Mori et Luisa quittent la colonie. Newt n’est pas à bord.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Hangar scientifique | Vérifier l’embarquement | `talk` |
| 2 | Navette de la Compagnie | Désengager la trajectoire automatique | `terminal` |
| 3 | Navette de la Compagnie | Décoller | `launch` |

Dialogue original de jeu : **Brackett** — « Aucune trajectoire imposée. Nous choisissons où nous allons. »

### 15 — Il reste quelqu’un

**Rebecca « Newt » Jorden · La chute · Cache des conduits**

Le point de vue revient dans les conduits. Il faut survivre avec presque rien.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Buanderie | Récupérer de l’eau | `supply` |
| 2 | Réfectoire | Trouver de quoi manger | `supply` |
| 3 | Conduits des prospecteurs | Passer sans attirer la créature | `listen` |

Dialogue original de jeu : **Newt** — « Pas la grande porte. Jamais la grande porte quand on entend les tuyaux. »

### 16 — Jusqu’au prochain bruit

**Rebecca « Newt » Jorden · La chute · Cache des conduits**

La cache devient le dernier lieu habité du parcours. La suite appartient à l’arrivée du Sulaco.

| Ordre | Lieu | Action réelle | Type |
|---|---|---|---|
| 1 | Conduits de l’habitat | Vérifier le chemin de retour | `trace` |
| 2 | Cache des conduits | Regagner la cache | `stash` |

Dialogue original de jeu : **Newt** — « Je suis là. Je suis encore là. »

## Tableaux et collecteurs : solutions de recette

### Départ du bloc habitat · `grid`

Distribution électrique · circuit `habitat` · capacité 4.

Alimentez le chauffage et les logements. La buanderie peut attendre.

| Commande | Charge | État requis | Initial |
|---|---:|---|---|
| Chauffage | 3 | Actif | Coupé |
| Éclairage des logements | 1 | Actif | Coupé |
| Buanderie | 2 | Coupé | Actif |

### Tableau du refuge provisoire · `shelter`

Magasin de fret · circuit `industry` · capacité 3.

Gardez la lumière et l’air. Le treuil doit rester coupé.

| Commande | Charge | État requis | Initial |
|---|---:|---|---|
| Éclairage du refuge | 1 | Actif | Coupé |
| Ventilation du refuge | 2 | Actif | Coupé |
| Treuil de fret | 3 | Coupé | Actif |

### Secours de la maintenance · `emergency`

Distribution électrique · circuit `industry` · capacité 4.

Répartissez la réserve entre les pompes et les paliers.

| Commande | Charge | État requis | Initial |
|---|---:|---|---|
| Pompes de circulation | 2 | Actif | Coupé |
| Éclairage des paliers | 2 | Actif | Coupé |
| Atelier des prospecteurs | 3 | Coupé | Actif |

### Dernière réserve du bureau · `last_power`

Bureau des prospecteurs · circuit `habitat` · capacité 2.

Le verrou et la balise. Rien d’autre ne doit tirer sur cette batterie.

| Commande | Charge | État requis | Initial |
|---|---:|---|---|
| Verrou de la porte | 1 | Actif | Coupé |
| Balise du conduit | 1 | Actif | Coupé |
| Radio générale | 2 | Coupé | Actif |

### Collecteur du processeur six · `pressure`

Processeur six · circuit `industry` · capacité 2.

Fermez l’arrivée principale, ouvrez la purge et la dérivation.

| Commande | Charge | État requis | Initial |
|---|---:|---|---|
| Arrivée principale | 1 | Coupé | Actif |
| Purge protégée | 1 | Actif | Coupé |
| Dérivation de secours | 1 | Actif | Coupé |

### Collecteur de la station de pompage · `reroute`

Station de pompage · circuit `industry` · capacité 2.

Isolez le passage, puis ouvrez le retour et la soupape.

| Commande | Charge | État requis | Initial |
|---|---:|---|---|
| Conduite du passage | 1 | Coupé | Actif |
| Retour au réservoir | 1 | Actif | Coupé |
| Soupape de sécurité | 1 | Actif | Coupé |

## Les 42 fiches de pièce

### Aire d’atterrissage · `pad`

**Périmètre · niveau 0 · exterior · 2900 unités · z 0.25–0.9**

Repère d’orientation : Tour de contrôle et feux d’approche. Profil `exterior` / `approach_lights`, circuit `perimeter`, emprise `inherited-pad`.

Blocage métrique déclaré : [69.0, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Sas des arrivants | sas | 170 / 0.69 | 170 / 0.7 | Libre |

Raccord vers **Sas des arrivants** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `pad-cover1` | crate | 1102 / 0.56 | 160 / 0.13 |
| `pad-cover2` | rock | 1943 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `pad-set-0` / beacon | 442 / 0.22 | FIXTURES | Non | orientation du trajet |
| `pad-set-1` / antenna | 845 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pad-set-2` / fuel | 1248 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pad-set-3` / beacon | 1652 / 0.22 | FIXTURES | Non | orientation du trajet |
| `pad-set-4` / cable | 2055 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pad-set-5` / tractor | 2458 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pad-cover1` / crate | 1102 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `pad-cover2` / rock | 1943 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `pad-detail-0` / survey-stake | 348 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-1` / floodlight | 899 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-2` / cable-spool | 1450 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-3` / barrier | 2001 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pad-detail-4` / rock-fragment | 2552 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `welcome` · Retrouver Paris | 667 / 0.81 | Chapitre 1 | talk |
| `stretcher` · Prendre en charge le retour des prospecteurs | 1102 / 0.81 | Chapitre 5 | talk |
| `a01` · Bordereau d’arrivée | 2378 / 0.43 | Facultatif | archive |

#### Garde-fous de cette pièce

Les 1 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Sas des arrivants · `airlock`

**Accueil · niveau 0 · side · 1800 unités · z 0.7–0.7**

Repère d’orientation : Double porte pressurisée, douche de décontamination. Profil `decontamination` / `double_bulkhead`, circuit `habitat`, emprise `inherited-airlock`.

Blocage métrique déclaré : [42.9, 2.8, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Aire d’atterrissage | sas | 170 / 0.7 | 170 / 0.69 | Libre |
| Coursive centrale | porte | 1630 / 0.7 | 170 / 0.69 | Libre |

Raccord vers **Aire d’atterrissage** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `airlock-set-0` / shower | 372 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `airlock-set-1` / locker | 636 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `airlock-set-2` / fan | 900 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `airlock-set-3` / panel | 1164 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `airlock-set-4` / lamp | 1428 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `airlock-detail-0` / oxygen | 433 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-1` / hose-reel | 558 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-2` / warning-board | 900 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-3` / vent-cover | 1242 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `airlock-detail-4` / ceiling-light | 438 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `hide-airlock` · Se cacher dans le placard de service | 520 / 0.7 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 414 / 0.77 | 1 |
| emergency-arrow | 882 / 0.77 | 2 |
| broken-light | 1332 / 0.77 | 2 |
| scorch | 1584 / 0.77 | 3 |

#### Garde-fous de cette pièce

Les 2 retours, 1 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Coursive centrale · `concourse`

**Accueil · niveau 0 · depth · 3000 unités · z 0.25–0.9**

Repère d’orientation : Signalétique des blocs, galerie vitrée. Profil `concourse` / `glazed_gallery`, circuit `habitat`, emprise `authored-concourse`.

Blocage métrique déclaré : [71.4, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Sas des arrivants | porte | 170 / 0.69 | 1630 / 0.7 | Libre |
| Contrôle colonial | escalier | 2830 / 0.69 | 170 / 0.69 | Libre |
| Coursive résidentielle | escalier | 840 / 0.28 | 170 / 0.7 | Libre |
| Infirmerie | porte | 1440 / 0.28 | 170 / 0.69 | Libre |
| Garage des prospecteurs | porte | 2040 / 0.28 | 170 / 0.69 | Libre |

Raccord vers **Contrôle colonial** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Coursive résidentielle** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `concourse-cover1` | bench | 1030 / 0.47 | 190 / 0.12 |
| `concourse-cover2` | vending | 1810 / 0.53 | 220 / 0.14 |
| `concourse-cover3` | bench | 2500 / 0.44 | 150 / 0.1 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `concourse-set-0` / bench | 420 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-set-1` / window | 780 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-set-2` / sign | 1140 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-set-3` / vending | 1500 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-set-4` / window | 1860 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-set-5` / fan | 2220 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-set-6` / bench | 2580 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `concourse-detail-0` / noticeboard | 360 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-1` / ceiling-light | 1147 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-2` / fire-cabinet | 1717 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-3` / wall-clock | 2070 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-detail-4` / pipe-elbow | 2640 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `concourse-cover1` / bench | 1030 / 0.47 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `concourse-cover2` / vending | 1810 / 0.53 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `concourse-cover3` / bench | 2500 / 0.44 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 690 / 0.77 | 1 |
| emergency-arrow | 1470 / 0.77 | 2 |
| broken-light | 2220 / 0.77 | 2 |
| scorch | 2640 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Rosa Kent** · Accueil des arrivants. Routine 0/1 : (1010 / 0.84) → (1250 / 0.84) → (830 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Casier de relève** · `supply-arrivals` à (1870 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Pile de service ; 1 Fil de raccordement. Pas de remplissage après une visite.


#### Dispositifs physiques de la 0.6

**Volet de la galerie** · `shutter-concourse`. Centre 630 / 0.66, emprise 52 / 0.46. Commandes : (536 / 0.7) ; (724 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.

**Avertisseur de la galerie** · `alarm-concourse` à (1010 / 0.7). Circuit `habitat`, adulte proche. 1,2 s de travail, 4 s de délai, 10 s de signal, 45 s de réarmement et deux cycles maximum. Portées de jeu 950 / 470 selon obstruction. Une cible visible reste prioritaire. Aucune apparition d’ennemi n’est produite par ce poste.


#### Bouche technique de la 0.7

**G01A · Reprise de manutention · A** · `duct-concourse` à (2575 / 0.7). Gaine `reprise` vers **Garage des prospecteurs**, bouche G01B. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 5 retours, 0 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Contrôle colonial · `ops`

**Administration · niveau 1 · depth · 2400 unités · z 0.25–0.9**

Repère d’orientation : Baie de supervision et consoles de communications. Profil `command` / `observation_bay`, circuit `research`, emprise `authored-ops`.

Blocage métrique déclaré : [57.1, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Coursive centrale | escalier | 170 / 0.69 | 2830 / 0.69 | Libre |
| Poste de la garnison | porte | 2230 / 0.69 | 170 / 0.7 | Libre |
| Relais de communications | coursive | 672 / 0.28 | 1780 / 0.7 | Libre |
| Terrasse des antennes | escalier | 1320 / 0.28 | 2530 / 0.81 | service-aerial |

Raccord vers **Coursive centrale** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Terrasse des antennes** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `ops-cover1` | console | 960 / 0.49 | 210 / 0.16 |
| `ops-cover2` | console | 1660 / 0.55 | 170 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `ops-set-0` / console | 400 / 0.22 | FIXTURES | Non | poste de travail |
| `ops-set-1` / screen | 720 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `ops-set-2` / console | 1040 / 0.22 | FIXTURES | Non | poste de travail |
| `ops-set-3` / antenna | 1360 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `ops-set-4` / screen | 1680 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `ops-set-5` / map | 2000 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `ops-detail-0` / chair | 1156 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `ops-detail-1` / noticeboard | 744 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `ops-detail-2` / radio-mast | 1200 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `ops-detail-3` / wall-clock | 1656 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `ops-detail-4` / ceiling-light | 366 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `ops-cover1` / console | 960 / 0.49 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `ops-cover2` / console | 1660 / 0.55 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `brief` · Consulter le tableau de service | 552 / 0.81 | Chapitre 1 | terminal |
| `missing` · Relever les dernières balises PDT | 912 / 0.81 | Chapitre 8 | terminal |
| `a02` · Grille de prospection | 1968 / 0.43 | Facultatif | archive |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 552 / 0.77 | 1 |
| emergency-arrow | 1176 / 0.77 | 2 |
| broken-light | 1776 / 0.77 | 2 |
| scorch | 2112 / 0.77 | 3 |

#### Garde-fous de cette pièce

Les 4 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Poste de la garnison · `briefing`

**Administration · niveau 1 · side · 2200 unités · z 0.7–0.7**

Repère d’orientation : Casiers individuels et table de service. Profil `barracks` / `locker_bays`, circuit `habitat`, emprise `inherited-briefing`.

Blocage métrique déclaré : [52.4, 2.8, 3.4] ; intention originale, pas mesure du roman. 6 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Contrôle colonial | porte | 170 / 0.7 | 2230 / 0.69 | Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `briefing-set-0` / locker | 383 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `briefing-set-1` / rifle-rack | 670 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `briefing-set-2` / table | 957 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `briefing-set-3` / locker | 1243 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `briefing-set-4` / radio | 1530 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `briefing-set-5` / locker | 1817 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `briefing-detail-0` / hanging-coat | 698 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-1` / rifle-case | 682 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-2` / noticeboard | 1100 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-3` / wall-clock | 1518 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `briefing-detail-4` / ceiling-light | 1936 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `locker` · Prendre la dotation | 506 / 0.7 | Chapitre 1 | supply |
| `a03` · Ordre du jour | 1804 / 0.7 | Facultatif | archive |
| `cache-briefing` · Réserve de terrain | 1166 / 0.7 | Facultatif | pickup |
| `hide-briefing` · Se cacher dans le placard de service | 725 / 0.7 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 506 / 0.77 | 1 |
| emergency-arrow | 1078 / 0.77 | 2 |
| broken-light | 1628 / 0.77 | 2 |
| scorch | 1936 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Mallette de terrain** · `supply-garrison` à (1330 / 0.7). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 1 Boîtier vide ; 1 Fil de raccordement ; 18 Munitions M41A. Pas de remplissage après une visite.

**Banc de préparation** · `bench-garrison` à (1970 / 0.7). Adulte proche ; deux recettes, coût débité seulement au terme. Aucun usage à distance ni atelier pour Newt.


#### Garde-fous de cette pièce

Les 1 retours, 4 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Coursive résidentielle · `hab`

**Habitat · niveau 1 · side · 2700 unités · z 0.7–0.7**

Repère d’orientation : Portes numérotées et fenêtres des logements. Profil `residential` / `numbered_alcoves`, circuit `habitat`, emprise `inherited-hab`.

Blocage métrique déclaré : [64.3, 2.8, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Coursive centrale | escalier | 170 / 0.7 | 840 / 0.28 | Libre |
| Logement des Jorden | porte | 2530 / 0.7 | 170 / 0.69 | Libre |
| Centre de loisirs | escalier | 756 / 0.7 | 170 / 0.69 | Libre |
| Buanderie | escalier | 1296 / 0.7 | 518 / 0.28 | Libre |
| Office de la cuisine | escalier | 1720 / 0.7 | 1930 / 0.81 | service-pantry |

Raccord vers **Coursive centrale** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Centre de loisirs** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Buanderie** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Office de la cuisine** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `hab-set-0` / hab-door | 425 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hab-set-1` / window | 795 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hab-set-2` / hab-door | 1165 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hab-set-3` / plant | 1535 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hab-set-4` / hab-door | 1905 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hab-set-5` / drawing | 2275 / 0.22 | FIXTURES | Non | trace de vie familiale |
| `hab-detail-0` / door-plaque | 324 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-1` / fire-cabinet | 1054 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-2` / pipe-elbow | 1567 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-3` / ceiling-light | 1863 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hab-detail-4` / noticeboard | 2376 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `hide-hab` · Se cacher dans le placard de service | 2349 / 0.7 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 621 / 0.77 | 1 |
| emergency-arrow | 1323 / 0.77 | 2 |
| broken-light | 1998 / 0.77 | 2 |
| scorch | 2376 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Iona Vale** · Maintenance de l’habitat. Routine 0/1 : (590 / 0.7) → (830 / 0.7) → (410 / 0.7). P permet de sélectionner sa conversation sans emprunter un accès voisin.


#### Dispositifs physiques de la 0.6

**Volet du bloc habitat** · `shutter-hab`. Centre 1090 / 0.7, emprise 52 / 0.1. Commandes : (996 / 0.7) ; (1184 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.


#### Garde-fous de cette pièce

Les 5 retours, 1 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Logement des Jorden · `jorden`

**Habitat · niveau 1 · depth · 1850 unités · z 0.25–0.9**

Repère d’orientation : Table familiale, lits et dessins d’enfant. Profil `domestic` / `low_ceiling`, circuit `habitat`, emprise `authored-jorden`.

Blocage métrique déclaré : [44.0, 9, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Coursive résidentielle | porte | 170 / 0.69 | 2530 / 0.7 | Libre |
| Conduits de l’habitat | conduit | 1680 / 0.69 | 170 / 0.7 | Newt ; Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `jorden-cover1` | table | 760 / 0.46 | 205 / 0.14 |
| `jorden-cover2` | cupboard | 1190 / 0.53 | 130 / 0.16 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `jorden-set-0` / bed | 354 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `jorden-set-1` / table | 582 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `jorden-set-2` / drawing | 811 / 0.22 | FIXTURES | Non | trace de vie familiale |
| `jorden-set-3` / cupboard | 1039 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `jorden-set-4` / bed | 1268 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `jorden-set-5` / toy | 1496 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `jorden-detail-0` / photo | 222 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-1` / mug | 574 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-2` / hanging-coat | 925 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-3` / bed-lamp | 1276 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-detail-4` / vent-cover | 1628 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `jorden-cover1` / table | 760 / 0.46 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `jorden-cover2` / cupboard | 1190 / 0.53 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `family` · Préparer la tournée | 426 / 0.81 | Chapitre 2 | talk |
| `a04` · Une table pour quatre | 1517 / 0.43 | Facultatif | archive |
| `hide-jorden` · Se cacher dans le placard de service | 771 / 0.82 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 426 / 0.77 | 1 |
| emergency-arrow | 906 / 0.77 | 2 |
| broken-light | 1369 / 0.77 | 2 |
| scorch | 1628 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Tiroir du logement** · `supply-habitat` à (1310 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 1 Portion froide ; 1 Trousse de soins. Pas de remplissage après une visite.


#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Réfectoire · `mess`

**Habitat · niveau 0 · depth · 2600 unités · z 0.25–0.9**

Repère d’orientation : Tables, cuisine et distributeurs. Profil `canteen` / `kitchen_pass`, circuit `habitat`, emprise `authored-mess`.

Blocage métrique déclaré : [61.9, 9, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Centre de loisirs | porte | 170 / 0.69 | 2080 / 0.69 | Libre |
| Buanderie | porte | 2430 / 0.69 | 1680 / 0.69 | Libre |
| Magasin de fret | porte | 728 / 0.28 | 868 / 0.28 | Libre |
| Office de la cuisine | porte | 1850 / 0.28 | 170 / 0.81 | Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `mess-cover1` | table | 910 / 0.48 | 185 / 0.13 |
| `mess-cover2` | table | 1580 / 0.49 | 250 / 0.14 |
| `mess-cover3` | table | 2060 / 0.53 | 130 / 0.1 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `mess-set-0` / vending | 417 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `mess-set-1` / stove | 770 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `mess-set-2` / table | 1123 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `mess-set-3` / table | 1477 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `mess-set-4` / table | 1830 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `mess-set-5` / sink | 2183 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `mess-detail-0` / chair | 1180 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-1` / mug | 1240 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-2` / kitchen-hood | 1517 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-3` / tray | 1794 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `mess-detail-4` / fire-cabinet | 342 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `mess-cover1` / table | 910 / 0.48 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `mess-cover2` / table | 1580 / 0.49 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `mess-cover3` / table | 2060 / 0.53 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `provisions` · Récupérer les provisions | 598 / 0.81 | Chapitre 2 | supply |
| `civilian` · Accompagner un colon jusqu’au magasin | 988 / 0.81 | Chapitre 9 | escort |
| `ration` · Trouver de quoi manger | 1378 / 0.81 | Chapitre 15 | supply |
| `hide-mess` · Se cacher dans le placard de service | 2262 / 0.82 | Facultatif | hide |
| `job-pantry-part` · Récupérer la poignée de rechange | 390 / 0.28 | Détour pantry / étape 2 | side-task |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 598 / 0.77 | 1 |
| emergency-arrow | 1274 / 0.77 | 2 |
| broken-light | 1924 / 0.77 | 2 |
| scorch | 2288 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Malik Rhee** · Cuisine collective. Routine 0/1 : (1150 / 0.84) → (1390 / 0.84) → (970 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Réserve de portions froides** · `supply-kitchen` à (1690 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Portion froide ; 1 Pile de service. Pas de remplissage après une visite.


#### Garde-fous de cette pièce

Les 4 retours, 5 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Centre de loisirs · `recreation`

**Habitat · niveau 0 · depth · 2250 unités · z 0.25–0.9**

Repère d’orientation : Jeux, bancs et accès à la maintenance. Profil `leisure` / `recessed_arcades`, circuit `habitat`, emprise `authored-recreation`.

Blocage métrique déclaré : [53.6, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Coursive résidentielle | escalier | 170 / 0.69 | 756 / 0.7 | Libre |
| Réfectoire | porte | 2080 / 0.69 | 170 / 0.69 | Libre |
| Conduits de l’habitat | grille | 630 / 0.28 | 1248 / 0.7 | Newt ; Libre |

Raccord vers **Coursive résidentielle** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `recreation-cover1` | arcade | 810 / 0.48 | 125 / 0.17 |
| `recreation-cover2` | bench | 1430 / 0.51 | 240 / 0.12 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `recreation-set-0` / arcade | 417 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `recreation-set-1` / bench | 771 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `recreation-set-2` / arcade | 1125 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `recreation-set-3` / table | 1479 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `recreation-set-4` / drawing | 1833 / 0.22 | FIXTURES | Non | trace de vie familiale |
| `recreation-detail-0` / chair | 921 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-1` / noticeboard | 698 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-2` / mug | 1125 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-3` / wall-clock | 1553 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-detail-4` / fire-cabinet | 384 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `recreation-cover1` / arcade | 810 / 0.48 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `recreation-cover2` / bench | 1430 / 0.51 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `a05` · Les chemins de Tim | 1845 / 0.43 | Facultatif | archive |
| `hide-recreation` · Se cacher dans le placard de service | 462 / 0.82 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 518 / 0.77 | 1 |
| emergency-arrow | 1102 / 0.77 | 2 |
| broken-light | 1665 / 0.77 | 2 |
| scorch | 1980 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Tomas Bell** · Entretien des loisirs. Routine 0/1 : (790 / 0.84) → (1030 / 0.84) → (610 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.


#### Garde-fous de cette pièce

Les 3 retours, 2 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Infirmerie · `med`

**Médical · niveau 0 · depth · 2800 unités · z 0.25–0.9**

Repère d’orientation : Lits isolés, vitres d’observation et moniteurs. Profil `medical` / `observation_partitions`, circuit `medical`, emprise `authored-med`.

Blocage métrique déclaré : [66.7, 9, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Coursive centrale | porte | 170 / 0.69 | 1440 / 0.28 | Libre |
| Chambre d’isolement | porte | 2630 / 0.69 | 170 / 0.7 | Libre |
| Réserve médicale | porte | 784 / 0.28 | 170 / 0.7 | Libre |
| Laboratoire de la Compagnie | sas | 1344 / 0.28 | 170 / 0.69 | Libre |
| Atelier biomédical | porte | 2000 / 0.28 | 170 / 0.81 | Libre |

Raccord vers **Laboratoire de la Compagnie** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `med-cover1` | bed | 1050 / 0.48 | 210 / 0.14 |
| `med-cover2` | cart | 1830 / 0.51 | 165 / 0.16 |
| `med-cover3` | cart | 1630 / 0.865 | 140 / 0.04 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `med-set-0` / bed | 433 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `med-set-1` / monitor | 820 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `med-set-2` / bed | 1207 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `med-set-3` / sink | 1593 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `med-set-4` / medicine | 1980 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `med-set-5` / bed | 2367 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `med-detail-0` / privacy-screen | 336 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `med-detail-1` / oxygen | 1736 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `med-detail-2` / medical-cross | 1400 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `med-detail-3` / wall-clock | 1932 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `med-detail-4` / gurney | 2464 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `med-cover1` / bed | 1050 / 0.48 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `med-cover2` / cart | 1830 / 0.51 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `med-cover3` / cart | 1630 / 0.865 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `triage` · Transmettre le bilan à Komiskey | 644 / 0.81 | Chapitre 5 | terminal |
| `patient_log` · Consulter le registre des patients | 1064 / 0.81 | Chapitre 6 | terminal |
| `a06` · Priorité médicale | 2296 / 0.43 | Facultatif | archive |
| `cache-med` · Réserve de terrain | 1484 / 0.86 | Facultatif | pickup |
| `hide-med` · Se cacher dans le placard de service | 2436 / 0.82 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 644 / 0.77 | 1 |
| emergency-arrow | 1372 / 0.77 | 2 |
| broken-light | 2072 / 0.77 | 2 |
| scorch | 2464 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Vera Arden** · Soins de proximité. Routine 0/1 : (1750 / 0.84) → (1990 / 0.84) → (2110 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Coffret de soins** · `supply-medical` à (490 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Trousse de soins ; 1 Pile de service. Pas de remplissage après une visite.


#### Dispositifs physiques de la 0.6

**Séparation médicale** · `shutter-med`. Centre 470 / 0.66, emprise 52 / 0.46. Commandes : (376 / 0.7) ; (564 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.

**Avertisseur médical** · `alarm-med` à (930 / 0.7). Circuit `medical`, adulte proche. 1,2 s de travail, 4 s de délai, 10 s de signal, 45 s de réarmement et deux cycles maximum. Portées de jeu 950 / 470 selon obstruction. Une cible visible reste prioritaire. Aucune apparition d’ennemi n’est produite par ce poste.


#### Bouche technique de la 0.7

**G04A · Retour de filtration · A** · `duct-med` à (1825 / 0.7). Gaine `sterile` vers **Laboratoire de la Compagnie**, bouche G04B. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 5 retours, 5 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Chambre d’isolement · `isolation`

**Médical · niveau 0 · side · 1700 unités · z 0.7–0.7**

Repère d’orientation : Lit d’observation et hublot de quarantaine. Profil `medical` / `sealed_observation`, circuit `medical`, emprise `inherited-isolation`.

Blocage métrique déclaré : [40.5, 2.8, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Infirmerie | porte | 170 / 0.7 | 2630 / 0.69 | Libre |
| Conduits de l’infirmerie | grille | 1530 / 0.7 | 2230 / 0.7 | Newt ; Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `isolation-set-0` / bed | 362 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `isolation-set-1` / monitor | 606 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `isolation-set-2` / glass | 850 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `isolation-set-3` / sink | 1094 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `isolation-set-4` / specimen | 1338 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `isolation-detail-0` / privacy-screen | 638 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-1` / oxygen | 527 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-2` / medical-cross | 850 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-3` / wall-clock | 1173 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `isolation-detail-4` / gurney | 667 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `quarantine` · Fermer l’isolement médical | 391 / 0.7 | Chapitre 5 | seal |
| `a07` · Le hublot | 1394 / 0.7 | Facultatif | archive |
| `hide-isolation` · Se cacher dans le placard de service | 533 / 0.7 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 391 / 0.77 | 1 |
| emergency-arrow | 833 / 0.77 | 2 |
| broken-light | 1258 / 0.77 | 2 |
| scorch | 1496 / 0.77 | 3 |

#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Laboratoire de la Compagnie · `science`

**Recherche · niveau 0 · depth · 2400 unités · z 0.25–0.9**

Repère d’orientation : Paillasses, cuves et racks de confinement. Profil `laboratory` / `containment_bays`, circuit `research`, emprise `authored-science`.

Blocage métrique déclaré : [57.1, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Infirmerie | sas | 170 / 0.69 | 1344 / 0.28 | Libre |
| Salle des archives | escalier | 2230 / 0.69 | 170 / 0.7 | Libre |
| Galerie technique | escalier | 672 / 0.28 | 2830 / 0.7 | Libre |
| Hangar scientifique | sas | 1152 / 0.28 | 170 / 0.69 | scienceClearance |

Raccord vers **Infirmerie** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Salle des archives** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Galerie technique** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Hangar scientifique** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `science-cover1` | lab-bench | 840 / 0.51 | 210 / 0.15 |
| `science-cover2` | specimen | 1570 / 0.45 | 175 / 0.12 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `science-set-0` / specimen | 400 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `science-set-1` / console | 720 / 0.22 | FIXTURES | Non | poste de travail |
| `science-set-2` / specimen | 1040 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `science-set-3` / sink | 1360 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `science-set-4` / microscope | 1680 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `science-set-5` / tank | 2000 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `science-detail-0` / glass-cabinet | 1373 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-1` / lab-bench | 1395 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-2` / oxygen | 1417 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-3` / warning-board | 1656 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `science-detail-4` / vent-cover | 2112 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `science-cover1` / lab-bench | 840 / 0.51 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `science-cover2` / specimen | 1570 / 0.45 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `orders` · Lire la directive scientifique | 552 / 0.81 | Chapitre 6 | terminal |
| `hidalgo` · Recevoir la transmission de Brackett | 912 / 0.81 | Chapitre 13 | talk |
| `a08` · Mainmise | 1968 / 0.43 | Facultatif | archive |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 552 / 0.77 | 1 |
| emergency-arrow | 1176 / 0.77 | 2 |
| broken-light | 1776 / 0.77 | 2 |
| scorch | 2112 / 0.77 | 3 |

#### Bouche technique de la 0.7

**G04B · Retour de filtration · B** · `duct-science` à (1800 / 0.7). Gaine `sterile` vers **Infirmerie**, bouche G04A. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 4 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Salle des archives · `records`

**Recherche · niveau 1 · side · 1800 unités · z 0.7–0.7**

Repère d’orientation : Bandes de données et baie réseau. Profil `archive` / `server_aisles`, circuit `research`, emprise `inherited-records`.

Blocage métrique déclaré : [42.9, 2.8, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Laboratoire de la Compagnie | escalier | 170 / 0.7 | 2230 / 0.69 | Libre |
| Relais de communications | coursive | 1630 / 0.7 | 170 / 0.7 | Libre |

Raccord vers **Laboratoire de la Compagnie** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `records-set-0` / rack | 372 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `records-set-1` / rack | 636 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `records-set-2` / console | 900 / 0.22 | FIXTURES | Non | poste de travail |
| `records-set-3` / rack | 1164 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `records-set-4` / screen | 1428 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `records-detail-0` / server | 650 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-1` / tape-reel | 558 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-2` / cable-tray | 900 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-3` / vent-cover | 1242 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `records-detail-4` / wall-clock | 1584 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `copy` · Conserver une copie des échanges | 414 / 0.7 | Chapitre 6 | terminal |
| `a09` · Transmission conservée | 1476 / 0.7 | Facultatif | archive |
| `hide-records` · Se cacher dans le placard de service | 777 / 0.7 | Facultatif | hide |
| `job-aerial-part` · Retrouver le coupleur de transmission | 1050 / 0.7 | Détour aerial / étape 2 | side-task |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 414 / 0.77 | 1 |
| emergency-arrow | 882 / 0.77 | 2 |
| broken-light | 1332 / 0.77 | 2 |
| scorch | 1584 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Arun Becker** · Archivage des relevés. Routine 0/1 : (590 / 0.7) → (830 / 0.7) → (410 / 0.7). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Tiroir des transmissions** · `supply-archive` à (1210 / 0.7). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 1 Fil de raccordement ; 1 Boîtier vide. Pas de remplissage après une visite.


#### Garde-fous de cette pièce

Les 2 retours, 4 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Garage des prospecteurs · `garage`

**Logistique · niveau 0 · depth · 3200 unités · z 0.25–0.9**

Repère d’orientation : Tracteur de prospection sur sa voie de service. Profil `hangar` / `overhead_crane`, circuit `industry`, emprise `authored-garage`.

Blocage métrique déclaré : [76.2, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Coursive centrale | porte | 170 / 0.69 | 2040 / 0.28 | Libre |
| Bureau des prospecteurs | porte | 3030 / 0.69 | 170 / 0.69 | Libre |
| Galerie technique | escalier | 896 / 0.28 | 840 / 0.7 | Libre |
| Piste du plateau | sas | 1536 / 0.28 | 170 / 0.69 | Libre |
| Atelier de manutention | porte | 2580 / 0.28 | 170 / 0.81 | Libre |

Raccord vers **Galerie technique** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Piste du plateau** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `garage-cover1` | tools | 1230 / 0.47 | 230 / 0.17 |
| `garage-cover2` | wheel | 2070 / 0.52 | 240 / 0.13 |
| `garage-cover3` | crate | 2850 / 0.48 | 120 / 0.12 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `garage-set-0` / tractor | 512 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `garage-set-1` / tools | 1056 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `garage-set-2` / fuel | 1600 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `garage-set-3` / gantry | 2144 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `garage-set-4` / wheel | 2688 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `garage-detail-0` / chain-hoist | 384 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-1` / warning-board | 992 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-2` / hose-reel | 1817 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-3` / tool-board | 2208 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `garage-detail-4` / ceiling-light | 2816 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `garage-cover1` / tools | 1230 / 0.47 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `garage-cover2` / wheel | 2070 / 0.52 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `garage-cover3` / crate | 2850 / 0.48 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `rescue_kit` · Prendre le matériel de secours | 736 / 0.81 | Chapitre 3 | supply |
| `tractor` · Préparer le tracteur | 1216 / 0.81 | Chapitre 4 | vehicle |
| `a10` · Tracteur des prospecteurs | 2624 / 0.43 | Facultatif | archive |
| `cache-garage` · Réserve de terrain | 1696 / 0.86 | Facultatif | pickup |
| `job-workshop-part` · Décrocher la chaîne d’entraînement | 450 / 0.28 | Détour workshop / étape 2 | side-task |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 736 / 0.77 | 1 |
| emergency-arrow | 1568 / 0.77 | 2 |
| broken-light | 2368 / 0.77 | 2 |
| scorch | 2816 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Ezra Hale** · Atelier des prospecteurs. Routine 0/1 : (1050 / 0.84) → (1290 / 0.84) → (870 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Caisse des prospecteurs** · `supply-garage` à (1850 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Pile de service ; 1 Fil de raccordement ; 2 Boîtier vide. Pas de remplissage après une visite.


#### Dispositifs physiques de la 0.6

**Rideau de manutention** · `shutter-garage`. Centre 2310 / 0.66, emprise 52 / 0.46. Commandes : (2216 / 0.7) ; (2404 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.

**Avertisseur du garage** · `alarm-garage` à (2810 / 0.7). Circuit `industry`, adulte proche. 1,2 s de travail, 4 s de délai, 10 s de signal, 45 s de réarmement et deux cycles maximum. Portées de jeu 950 / 470 selon obstruction. Une cible visible reste prioritaire. Aucune apparition d’ennemi n’est produite par ce poste.


#### Bouche technique de la 0.7

**G01B · Reprise de manutention · B** · `duct-garage` à (2125 / 0.7). Gaine `reprise` vers **Coursive centrale**, bouche G01A. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 5 retours, 5 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Bureau des prospecteurs · `survey`

**Logistique · niveau 0 · depth · 2500 unités · z 0.25–0.9**

Repère d’orientation : Cartes topographiques et postes radio. Profil `command` / `survey_wall`, circuit `habitat`, emprise `inherited-survey`.

Blocage métrique déclaré : [59.5, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Garage des prospecteurs | porte | 170 / 0.69 | 3030 / 0.69 | Libre |
| Magasin de fret | porte | 2330 / 0.69 | 170 / 0.69 | Libre |
| Conduits des prospecteurs | grille | 700 / 0.28 | 2180 / 0.7 | Newt ; Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `survey-cover1` | table | 950 / 0.56 | 160 / 0.13 |
| `survey-cover2` | crate | 1675 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `survey-set-0` / map | 442 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `survey-set-1` / console | 846 / 0.22 | FIXTURES | Non | poste de travail |
| `survey-set-2` / radio | 1250 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `survey-set-3` / tools | 1654 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `survey-set-4` / shelf | 2058 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `survey-cover1` / table | 950 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `survey-cover2` / crate | 1675 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `survey-detail-0` / chair | 1168 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-1` / noticeboard | 775 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-2` / radio-mast | 1467 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-3` / wall-clock | 1725 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `survey-detail-4` / ceiling-light | 354 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `coordinates` · Recevoir la grille de prospection | 575 / 0.81 | Chapitre 4 | terminal |
| `barricade` · Renforcer la fermeture du bureau | 950 / 0.81 | Chapitre 10 | seal |
| `last_power` · Alimenter le verrou une dernière fois | 1325 / 0.81 | Chapitre 12 | power |
| `vent_open` · Dégager l’accès au conduit | 1700 / 0.81 | Chapitre 12 | seal |
| `newt_escape` · Mettre Newt à l’abri | 575 / 0.81 | Chapitre 12 | talk |
| `luisa` · Dégager Luisa et la conduire au hangar | 950 / 0.81 | Chapitre 13 | escort |
| `a11` · Un bureau transformé | 2050 / 0.43 | Facultatif | archive |
| `hide-survey` · Se cacher dans le placard de service | 429 / 0.82 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 575 / 0.77 | 1 |
| emergency-arrow | 1225 / 0.77 | 2 |
| broken-light | 1850 / 0.77 | 2 |
| scorch | 2200 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Anton Voss** · Relevés des prospecteurs. Routine 0/1 : (1170 / 0.84) → (1410 / 0.84) → (990 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.


#### Garde-fous de cette pièce

Les 3 retours, 8 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Magasin de fret · `stores`

**Logistique · niveau 0 · depth · 3100 unités · z 0.25–0.9**

Repère d’orientation : Palettes, rack de levage et allées dégagées. Profil `warehouse` / `loading_racks`, circuit `industry`, emprise `authored-stores`.

Blocage métrique déclaré : [73.8, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Bureau des prospecteurs | porte | 170 / 0.69 | 2330 / 0.69 | Libre |
| Distribution électrique | escalier | 2930 / 0.69 | 170 / 0.69 | Libre |
| Réfectoire | porte | 868 / 0.28 | 728 / 0.28 | Libre |

Raccord vers **Distribution électrique** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `stores-cover1` | pallet | 1160 / 0.48 | 280 / 0.14 |
| `stores-cover2` | crate | 2110 / 0.52 | 180 / 0.13 |
| `stores-cover3` | pallet | 2430 / 0.86 | 120 / 0.04 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `stores-set-0` / crate | 458 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `stores-set-1` / shelf | 895 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `stores-set-2` / pallet | 1332 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `stores-set-3` / gantry | 1768 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `stores-set-4` / crate | 2205 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `stores-set-5` / shelf | 2642 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `stores-detail-0` / hand-truck | 372 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-1` / tool-board | 961 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-2` / warning-board | 1550 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-3` / fire-cabinet | 2139 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `stores-detail-4` / cable-tray | 2728 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `stores-cover1` / pallet | 1160 / 0.48 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `stores-cover2` / crate | 2110 / 0.52 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `stores-cover3` / pallet | 2430 / 0.86 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `shelter` · Mettre le refuge provisoire sous tension | 713 / 0.81 | Chapitre 9 | power |
| `welding` · Récupérer un poste à souder | 1178 / 0.81 | Chapitre 10 | supply |
| `a12` · Refuge provisoire | 2542 / 0.43 | Facultatif | archive |
| `cache-stores` · Réserve de terrain | 1643 / 0.86 | Facultatif | pickup |
| `hide-stores` · Se cacher dans le placard de service | 2697 / 0.82 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 713 / 0.77 | 1 |
| emergency-arrow | 1519 / 0.77 | 2 |
| broken-light | 2294 / 0.77 | 2 |
| scorch | 2728 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Solène Ferris** · Manutention du fret. Routine 0/1 : (1330 / 0.84) → (1570 / 0.84) → (1150 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Coffre de dotation** · `supply-cargo` à (1870 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Fusée de détresse ; 24 Munitions M41A. Pas de remplissage après une visite.


#### Dispositifs physiques de la 0.6

**Volet du magasin** · `shutter-stores`. Centre 450 / 0.66, emprise 52 / 0.46. Commandes : (356 / 0.7) ; (544 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.


#### Bouche technique de la 0.7

**G02A · Descente du fret · A** · `duct-stores` à (2375 / 0.7). Gaine `fret` vers **Distribution électrique**, bouche G02B. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 3 retours, 5 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Distribution électrique · `power`

**Maintenance · niveau -1 · depth · 2600 unités · z 0.25–0.9**

Repère d’orientation : Deux banques de coupe-circuits et conduites. Profil `industrial` / `busbar_banks`, circuit `industry`, emprise `authored-power`.

Blocage métrique déclaré : [61.9, 9, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Magasin de fret | escalier | 170 / 0.69 | 2930 / 0.69 | Libre |
| Station de pompage | porte | 2430 / 0.69 | 170 / 0.69 | Libre |
| Galerie du refroidissement | échelle | 728 / 0.28 | 2530 / 0.69 | Libre |

Raccord vers **Magasin de fret** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Galerie du refroidissement** : préparation exposée 0.5 s, puis trajet borné 1.8 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `power-cover1` | transformer | 1000 / 0.45 | 240 / 0.16 |
| `power-cover2` | coil | 1680 / 0.51 | 210 / 0.13 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `power-set-0` / transformer | 417 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `power-set-1` / panel | 770 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `power-set-2` / transformer | 1123 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `power-set-3` / panel | 1477 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `power-set-4` / cable | 1830 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `power-set-5` / coil | 2183 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `power-detail-0` / gauge | 312 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-1` / pipe-elbow | 1240 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-2` / pump-motor | 1517 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-3` / warning-board | 1794 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `power-detail-4` / cable-tray | 342 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `power-cover1` / transformer | 1000 / 0.45 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `power-cover2` / coil | 1680 / 0.51 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `grid` · Réarmer le départ habitat | 598 / 0.81 | Chapitre 2 | power |
| `emergency` · Rétablir le circuit de secours | 988 / 0.81 | Chapitre 10 | power |
| `withdraw` · Fermer derrière le groupe | 1378 / 0.81 | Chapitre 11 | seal |
| `a13` · Deux circuits | 2132 / 0.43 | Facultatif | archive |
| `hide-power` · Se cacher dans le placard de service | 2262 / 0.82 | Facultatif | hide |
| `job-drain-part` · Récupérer la clé du collecteur | 1950 / 0.28 | Détour drain / étape 2 | side-task |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 598 / 0.77 | 1 |
| emergency-arrow | 1274 / 0.77 | 2 |
| broken-light | 1924 / 0.77 | 2 |
| scorch | 2288 / 0.77 | 3 |

#### Dispositifs physiques de la 0.6

**Séparation du répartiteur** · `shutter-power`. Centre 1370 / 0.66, emprise 52 / 0.46. Commandes : (1276 / 0.7) ; (1464 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.


#### Bouche technique de la 0.7

**G02B · Descente du fret · B** · `duct-power` à (1775 / 0.7). Gaine `fret` vers **Magasin de fret**, bouche G02A. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 3 retours, 6 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Station de pompage · `pump`

**Maintenance · niveau -1 · depth · 2400 unités · z 0.25–0.9**

Repère d’orientation : Collecteurs, vannes et caniveaux protégés. Profil `industrial` / `collector_wall`, circuit `industry`, emprise `authored-pump`.

Blocage métrique déclaré : [57.1, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Distribution électrique | porte | 170 / 0.69 | 2430 / 0.69 | Libre |
| Galerie technique | porte | 2230 / 0.69 | 170 / 0.7 | Libre |
| Accès au processeur un | escalier | 672 / 0.28 | 170 / 0.69 | Libre |
| Dérivation des eaux grises | échelle | 1200 / 0.28 | 170 / 0.81 | Libre |

Raccord vers **Accès au processeur un** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Dérivation des eaux grises** : préparation exposée 0.5 s, puis trajet borné 1.8 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `pump-cover1` | tank | 920 / 0.48 | 210 / 0.17 |
| `pump-cover2` | pump-motor | 1620 / 0.52 | 175 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `pump-set-0` / tank | 432 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pump-set-1` / pipe | 816 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pump-set-2` / valve | 1200 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pump-set-3` / tank | 1584 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pump-set-4` / valve | 1968 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `pump-detail-0` / gauge | 288 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-1` / pipe-elbow | 961 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-2` / pump-motor | 1417 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-3` / warning-board | 1656 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `pump-detail-4` / cable-tray | 366 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `pump-cover1` / tank | 920 / 0.48 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `pump-cover2` / pump-motor | 1620 / 0.52 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `reroute` · Détourner la pression du passage | 552 / 0.81 | Chapitre 8 | valve |
| `a14` · Sous les logements | 1968 / 0.43 | Facultatif | archive |
| `cache-pump` · Réserve de terrain | 1450 / 0.86 | Facultatif | pickup |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 552 / 0.77 | 1 |
| emergency-arrow | 1176 / 0.77 | 2 |
| broken-light | 1776 / 0.77 | 2 |
| scorch | 2112 / 0.77 | 3 |

Danger local `jet-pump` : x 1870, z 0.82. Valeurs de recette : `{"id": "jet-pump", "room": "pump", "x": 1870, "z": 0.82, "period": 6.8, "activeFor": 2.0, "disableFlag": "reroute", "damage": 10}`.

#### Bouche technique de la 0.7

**G03B · Collecteur de maintenance · B** · `duct-pump` à (1800 / 0.7). Gaine `collecteur` vers **Galerie technique**, bouche G03A. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 4 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Galerie technique · `service`

**Maintenance · niveau -1 · side · 3000 unités · z 0.7–0.7**

Repère d’orientation : Passage sous les bâtiments, conduites continues. Profil `maintenance` / `pipe_trench`, circuit `industry`, emprise `inherited-service`.

Blocage métrique déclaré : [71.4, 2.8, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Station de pompage | porte | 170 / 0.7 | 2230 / 0.69 | Libre |
| Laboratoire de la Compagnie | escalier | 2830 / 0.7 | 672 / 0.28 | Libre |
| Garage des prospecteurs | escalier | 840 / 0.7 | 896 / 0.28 | Libre |

Raccord vers **Laboratoire de la Compagnie** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Garage des prospecteurs** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `service-set-0` / pipe | 492 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `service-set-1` / fan | 996 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `service-set-2` / pipe | 1500 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `service-set-3` / cable | 2004 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `service-set-4` / pipe | 2508 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `service-detail-0` / gauge | 360 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-1` / pipe-elbow | 1147 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-2` / vent-cover | 1500 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-3` / cable-tray | 2070 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `service-detail-4` / fire-cabinet | 2640 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `trail` · Suivre les traces dans la galerie | 690 / 0.7 | Chapitre 8 | scan |
| `hide-service` · Se cacher dans le placard de service | 2610 / 0.7 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 690 / 0.77 | 1 |
| emergency-arrow | 1470 / 0.77 | 2 |
| broken-light | 2220 / 0.77 | 2 |
| scorch | 2640 / 0.77 | 3 |

#### Dispositifs physiques de la 0.6

**Volet technique** · `shutter-service`. Centre 1710 / 0.7, emprise 52 / 0.1. Commandes : (1616 / 0.7) ; (1804 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.

**Avertisseur technique** · `alarm-service` à (2050 / 0.7). Circuit `industry`, adulte proche. 1,2 s de travail, 4 s de délai, 10 s de signal, 45 s de réarmement et deux cycles maximum. Portées de jeu 950 / 470 selon obstruction. Une cible visible reste prioritaire. Aucune apparition d’ennemi n’est produite par ce poste.


#### Bouche technique de la 0.7

**G03A · Collecteur de maintenance · A** · `duct-service` à (2450 / 0.7). Gaine `collecteur` vers **Station de pompage**, bouche G03B. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 3 retours, 2 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Piste du plateau · `road`

**Périmètre · niveau 0 · exterior · 3700 unités · z 0.25–0.9**

Repère d’orientation : Piquets de balisage, roches et ravines non praticables. Profil `exterior` / `rock_cutting`, circuit `perimeter`, emprise `inherited-road`.

Blocage métrique déclaré : [88.1, 9, 3.4] ; intention originale, pas mesure du roman. 11 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Garage des prospecteurs | sas | 170 / 0.69 | 1536 / 0.28 | Libre |
| Plateau des relevés | piste | 3530 / 0.69 | 170 / 0.69 | Libre |
| Processeur six | piste | 1036 / 0.28 | 170 / 0.69 | Libre |

Raccord vers **Garage des prospecteurs** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `road-cover1` | crate | 1406 / 0.56 | 160 / 0.13 |
| `road-cover2` | rock | 2479 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `road-set-0` / beacon | 562 / 0.22 | FIXTURES | Non | orientation du trajet |
| `road-set-1` / rock | 1206 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `road-set-2` / rock | 1850 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `road-set-3` / beacon | 2494 / 0.22 | FIXTURES | Non | orientation du trajet |
| `road-set-4` / wreck | 3138 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `road-cover1` / crate | 1406 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `road-cover2` / rock | 2479 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `road-detail-0` / survey-stake | 444 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-1` / floodlight | 1364 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-2` / cable-spool | 1850 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-3` / barrier | 2553 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `road-detail-4` / rock-fragment | 3256 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|

#### Garde-fous de cette pièce

Les 3 retours, 0 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Plateau des relevés · `plateau`

**Périmètre · niveau 0 · exterior · 2900 unités · z 0.25–0.9**

Repère d’orientation : Tracteur arrêté au pied de formations rocheuses. Profil `exterior` / `survey_ridge`, circuit `perimeter`, emprise `inherited-plateau`.

Blocage métrique déclaré : [69.0, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Piste du plateau | piste | 170 / 0.69 | 3530 / 0.69 | Libre |
| Seuil de l’épave | brèche | 2730 / 0.69 | 170 / 0.69 | Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `plateau-cover1` | crate | 1102 / 0.56 | 160 / 0.13 |
| `plateau-cover2` | rock | 1943 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `plateau-set-0` / tractor | 482 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `plateau-set-1` / rock | 966 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `plateau-set-2` / beacon | 1450 / 0.22 | FIXTURES | Non | orientation du trajet |
| `plateau-set-3` / rock | 1934 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `plateau-set-4` / cable | 2418 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `plateau-cover1` / crate | 1102 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `plateau-cover2` / rock | 1943 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `plateau-detail-0` / survey-stake | 348 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-1` / floodlight | 899 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-2` / cable-spool | 1450 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-3` / barrier | 2001 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `plateau-detail-4` / rock-fragment | 2552 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `beacon` · Poser une balise sur le plateau | 667 / 0.81 | Chapitre 4 | beacon |

#### Garde-fous de cette pièce

Les 2 retours, 1 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Seuil de l’épave · `derelict`

**Épave · niveau 0 · derelict · 2500 unités · z 0.25–0.9**

Repère d’orientation : Arches biomécaniques et coque affaissée. Profil `derelict` / `organic_vault`, circuit `perimeter`, emprise `inherited-derelict`.

Blocage métrique déclaré : [59.5, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Plateau des relevés | brèche | 170 / 0.69 | 2730 / 0.69 | Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `derelict-cover1` | rib | 950 / 0.56 | 160 / 0.13 |
| `derelict-cover2` | rock | 1675 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `derelict-set-0` / rib | 442 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `derelict-set-1` / rib | 846 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `derelict-set-2` / fossil | 1250 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `derelict-set-3` / rib | 1654 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `derelict-set-4` / egg | 2058 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `derelict-cover1` / rib | 950 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `derelict-cover2` / rock | 1675 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `derelict-detail-0` / rib | 734 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-1` / rib | 775 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-2` / rock-fragment | 1250 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-3` / fossil | 1725 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `derelict-detail-4` / egg | 2200 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `threshold` · Examiner le seuil de l’épave | 575 / 0.81 | Chapitre 4 | scan |
| `a16` · Une coque étrangère | 2050 / 0.43 | Facultatif | archive |

#### Garde-fous de cette pièce

Les 1 retours, 2 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Processeur six · `processor6`

**Terraformage · niveau 0 · depth · 3000 unités · z 0.25–0.9**

Repère d’orientation : Passerelle industrielle et conduites sous pression. Profil `industrial` / `heat_exchangers`, circuit `industry`, emprise `authored-processor6`.

Blocage métrique déclaré : [71.4, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Piste du plateau | piste | 170 / 0.69 | 1036 / 0.28 | Libre |
| Atelier de manutention | coursive | 1870 / 0.28 | 2830 / 0.81 | service-workshop |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `processor6-cover1` | turbine | 1090 / 0.47 | 260 / 0.16 |
| `processor6-cover2` | pipe | 2080 / 0.49 | 210 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `processor6-set-0` / turbine | 492 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `processor6-set-1` / valve | 996 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `processor6-set-2` / turbine | 1500 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `processor6-set-3` / gantry | 2004 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `processor6-set-4` / pipe | 2508 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `processor6-detail-0` / gauge | 360 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-1` / pipe-elbow | 930 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-2` / pump-motor | 1717 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-3` / warning-board | 2070 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-detail-4` / cable-tray | 2640 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `processor6-cover1` / turbine | 1090 / 0.47 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `processor6-cover2` / pipe | 2080 / 0.49 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `pressure` · Isoler la conduite endommagée | 690 / 0.81 | Chapitre 3 | valve |
| `incident` · Récupérer le rapport d’intervention | 1140 / 0.81 | Chapitre 3 | terminal |
| `a15` · Intervention interrompue | 2460 / 0.43 | Facultatif | archive |
| `cache-processor6` · Réserve de terrain | 1590 / 0.86 | Facultatif | pickup |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 690 / 0.77 | 1 |
| emergency-arrow | 1470 / 0.77 | 2 |
| broken-light | 2220 / 0.77 | 2 |
| scorch | 2640 / 0.77 | 3 |

Danger local `jet-processor6` : x 2350, z 0.82. Valeurs de recette : `{"id": "jet-processor6", "room": "processor6", "x": 2350, "z": 0.82, "period": 6, "activeFor": 2.1, "disableFlag": "pressure", "damage": 12}`.

#### Garde-fous de cette pièce

Les 2 retours, 4 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Accès au processeur un · `approach`

**Terraformage · niveau 0 · exterior · 3200 unités · z 0.25–0.9**

Repère d’orientation : Pylônes, sas de maintenance et énormes échangeurs. Profil `exterior` / `processor_columns`, circuit `industry`, emprise `inherited-approach`.

Blocage métrique déclaré : [76.2, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Station de pompage | escalier | 170 / 0.69 | 672 / 0.28 | Libre |
| Monte-charge du processeur | monte-charge | 3030 / 0.69 | 170 / 0.7 | Libre |

Raccord vers **Station de pompage** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Monte-charge du processeur** : préparation exposée 1.2 s, puis trajet borné 2.4 s. Circuit coupé : +1,6 s de trajet. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `approach-cover1` | crate | 1216 / 0.56 | 160 / 0.13 |
| `approach-cover2` | rock | 2144 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `approach-set-0` / tower | 512 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `approach-set-1` / beacon | 1056 / 0.22 | FIXTURES | Non | orientation du trajet |
| `approach-set-2` / pipe | 1600 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `approach-set-3` / tower | 2144 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `approach-set-4` / beacon | 2688 / 0.22 | FIXTURES | Non | orientation du trajet |
| `approach-cover1` / crate | 1216 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `approach-cover2` / rock | 2144 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `approach-detail-0` / survey-stake | 384 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-1` / floodlight | 992 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-2` / cable-spool | 1600 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-3` / barrier | 2208 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `approach-detail-4` / rock-fragment | 2816 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|

#### Garde-fous de cette pièce

Les 2 retours, 0 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Monte-charge du processeur · `lift`

**Terraformage · niveau -1 · side · 1800 unités · z 0.7–0.7**

Repère d’orientation : Cabine de fret et paliers identifiés. Profil `shaft` / `counterweights`, circuit `industry`, emprise `inherited-lift`.

Blocage métrique déclaré : [42.9, 2.8, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Accès au processeur un | monte-charge | 170 / 0.7 | 3030 / 0.69 | Libre |
| Soubassements envahis | monte-charge | 1630 / 0.7 | 170 / 0.69 | Libre |

Raccord vers **Accès au processeur un** : préparation exposée 1.2 s, puis trajet borné 2.4 s. Circuit coupé : +1,6 s de trajet. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Soubassements envahis** : préparation exposée 1.2 s, puis trajet borné 2.4 s. Circuit coupé : +1,6 s de trajet. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `lift-set-0` / cable | 405 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `lift-set-1` / panel | 735 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `lift-set-2` / gantry | 1065 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `lift-set-3` / lamp | 1395 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `lift-detail-0` / chain-hoist | 650 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-1` / warning-board | 558 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-2` / cable-tray | 900 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-3` / gauge | 1242 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `lift-detail-4` / ceiling-light | 655 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `descent` · Commander le monte-charge | 414 / 0.7 | Chapitre 11 | terminal |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 414 / 0.77 | 1 |
| emergency-arrow | 882 / 0.77 | 2 |
| broken-light | 1332 / 0.77 | 2 |
| scorch | 1584 / 0.77 | 3 |

#### Garde-fous de cette pièce

Les 2 retours, 1 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Soubassements envahis · `hive`

**Terraformage · niveau -2 · hive · 3000 unités · z 0.25–0.9**

Repère d’orientation : Résine sur les structures industrielles, balises PDT. Profil `hive` / `resin_on_steel`, circuit `industry`, emprise `inherited-hive`.

Blocage métrique déclaré : [71.4, 9, 3.4] ; intention originale, pas mesure du roman. 9 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Monte-charge du processeur | monte-charge | 170 / 0.69 | 1630 / 0.7 | Libre |
| Galerie du refroidissement | passerelle | 2830 / 0.69 | 170 / 0.69 | Libre |

Raccord vers **Monte-charge du processeur** : préparation exposée 1.2 s, puis trajet borné 2.4 s. Circuit coupé : +1,6 s de trajet. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `hive-cover1` | resin | 1140 / 0.56 | 160 / 0.13 |
| `hive-cover2` | cocoon | 2010 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `hive-set-0` / resin | 450 / 0.22 | FIXTURES | Non | progression de la contamination |
| `hive-set-1` / cocoon | 870 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hive-set-2` / rib | 1290 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hive-set-3` / resin | 1710 / 0.22 | FIXTURES | Non | progression de la contamination |
| `hive-set-4` / egg | 2130 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hive-set-5` / cocoon | 2550 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hive-cover1` / resin | 1140 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `hive-cover2` / cocoon | 2010 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `hive-detail-0` / resin | 360 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-1` / resin | 930 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-2` / cocoon | 1500 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-3` / pipe-elbow | 2070 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hive-detail-4` / cable-tray | 2640 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `pdt` · Retrouver la source des signaux | 690 / 0.81 | Chapitre 11 | scan |
| `a17` · Signaux immobiles | 2460 / 0.43 | Facultatif | archive |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 690 / 0.77 | 1 |
| emergency-arrow | 1470 / 0.77 | 2 |
| broken-light | 2220 / 0.77 | 2 |
| scorch | 2640 / 0.77 | 3 |

#### Bouche technique de la 0.7

**G05A · Retour des échangeurs · A** · `duct-hive` à (2625 / 0.7). Gaine `echangeur` vers **Galerie du refroidissement**, bouche G05B. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 2 retours, 2 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Galerie du refroidissement · `coolant`

**Terraformage · niveau -2 · hive · 2700 unités · z 0.25–0.9**

Repère d’orientation : Passage étroit entre les échangeurs, ruche en arrière-plan. Profil `hive` / `buried_exchangers`, circuit `industry`, emprise `inherited-coolant`.

Blocage métrique déclaré : [64.3, 9, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Soubassements envahis | passerelle | 170 / 0.69 | 2830 / 0.69 | Libre |
| Distribution électrique | échelle | 2530 / 0.69 | 728 / 0.28 | Libre |
| Dérivation des eaux grises | échelle | 1500 / 0.28 | 2680 / 0.81 | service-drain |

Raccord vers **Distribution électrique** : préparation exposée 0.5 s, puis trajet borné 1.8 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Dérivation des eaux grises** : préparation exposée 0.5 s, puis trajet borné 1.8 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `coolant-cover1` | tank | 1026 / 0.56 | 160 / 0.13 |
| `coolant-cover2` | resin | 1809 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `coolant-set-0` / tank | 462 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `coolant-set-1` / resin | 906 / 0.22 | FIXTURES | Non | progression de la contamination |
| `coolant-set-2` / cocoon | 1350 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `coolant-set-3` / tank | 1794 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `coolant-set-4` / rib | 2238 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `coolant-cover1` / tank | 1026 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `coolant-cover2` / resin | 1809 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `coolant-detail-0` / resin | 324 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-1` / resin | 837 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-2` / cocoon | 1350 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-3` / pipe-elbow | 1863 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `coolant-detail-4` / cable-tray | 2376 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `fallback` · Baliser la route de repli | 621 / 0.81 | Chapitre 11 | beacon |
| `a18` · Aucun trophée | 2214 / 0.43 | Facultatif | archive |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 621 / 0.77 | 1 |
| emergency-arrow | 1323 / 0.77 | 2 |
| broken-light | 1998 / 0.77 | 2 |
| scorch | 2376 / 0.77 | 3 |

#### Bouche technique de la 0.7

**G05B · Retour des échangeurs · B** · `duct-coolant` à (2375 / 0.7). Gaine `echangeur` vers **Soubassements envahis**, bouche G05A. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.

Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.


#### Garde-fous de cette pièce

Les 3 retours, 2 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Conduits de l’habitat · `vent_hab`

**Ventilation · niveau 1 · vent · 2600 unités · z 0.7–0.7**

Repère d’orientation : Jonctions basses, grilles et câbles de repérage. Profil `vent` / `habitat_branch`, circuit `habitat`, emprise `inherited-vent_hab`.

Blocage métrique déclaré : [61.9, 1.1, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Logement des Jorden | conduit | 170 / 0.7 | 1680 / 0.69 | Newt ; Libre |
| Conduits de l’infirmerie | conduit | 2430 / 0.7 | 170 / 0.7 | Newt ; Libre |
| Conduits des prospecteurs | conduit | 728 / 0.7 | 170 / 0.7 | Newt ; Libre |
| Centre de loisirs | grille | 1248 / 0.7 | 630 / 0.28 | Newt ; Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `vent_hab-set-0` / grille | 452 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_hab-set-1` / cable | 876 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_hab-set-2` / grille | 1300 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_hab-set-3` / fan | 1724 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_hab-set-4` / drawing | 2148 / 0.22 | FIXTURES | Non | trace de vie familiale |
| `vent_hab-detail-0` / duct-junction | 1614 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-1` / vent-cover | 806 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-2` / cable-tray | 1517 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-3` / bolt-panel | 1794 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `vent_hab-detail-4` / trace-mark | 2288 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `marks` · Retrouver les repères de Tim | 598 / 0.7 | Chapitre 7 | trace |
| `route` · Vérifier le chemin de retour | 988 / 0.7 | Chapitre 16 | trace |
| `hide-vent_hab` · Se glisser dans le renfoncement | 2262 / 0.7 | Facultatif | hide |
| `job-nest-part` · Retrouver le ruban de Tim | 1670 / 0.7 | Détour nest / étape 2 | side-task |

#### Vie coloniale et stations de la 0.5

**Petite boîte oubliée** · `supply-vent` à (1410 / 0.7). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Portion froide. Pas de remplissage après une visite.


#### Garde-fous de cette pièce

Les 4 retours, 4 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Conduits de l’infirmerie · `vent_med`

**Ventilation · niveau 1 · vent · 2400 unités · z 0.7–0.7**

Repère d’orientation : Grilles d’observation et courbe de service. Profil `vent` / `observation_grille`, circuit `medical`, emprise `inherited-vent_med`.

Blocage métrique déclaré : [57.1, 1.1, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Conduits de l’habitat | conduit | 170 / 0.7 | 2430 / 0.7 | Newt ; Libre |
| Chambre d’isolement | grille | 2230 / 0.7 | 1530 / 0.7 | Newt ; Libre |
| Renfoncement des câbles | conduit | 1070 / 0.7 | 170 / 0.7 | Newt ; Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `vent_med-set-0` / grille | 480 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_med-set-1` / cable | 960 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_med-set-2` / grille | 1440 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_med-set-3` / pipe | 1920 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_med-detail-0` / duct-junction | 722 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-1` / vent-cover | 744 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-2` / cable-tray | 1200 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-3` / bolt-panel | 1656 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `vent_med-detail-4` / trace-mark | 2112 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `listen` · Écouter derrière la grille | 552 / 0.7 | Chapitre 7 | listen |

#### Garde-fous de cette pièce

Les 3 retours, 1 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Conduits des prospecteurs · `vent_survey`

**Ventilation · niveau 0 · vent · 2350 unités · z 0.7–0.7**

Repère d’orientation : Grille de secours au-dessus de la dernière barricade. Profil `vent` / `survey_branch`, circuit `habitat`, emprise `inherited-vent_survey`.

Blocage métrique déclaré : [56.0, 1.1, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Conduits de l’habitat | conduit | 170 / 0.7 | 728 / 0.7 | Newt ; Libre |
| Bureau des prospecteurs | grille | 2180 / 0.7 | 700 / 0.28 | Newt ; Libre |
| Cache des conduits | conduit | 658 / 0.7 | 170 / 0.7 | Newt ; Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `vent_survey-set-0` / grille | 474 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_survey-set-1` / cable | 941 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_survey-set-2` / grille | 1409 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `vent_survey-set-3` / resin | 1876 / 0.22 | FIXTURES | Non | progression de la contamination |
| `vent_survey-detail-0` / duct-junction | 933 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-1` / vent-cover | 728 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-2` / cable-tray | 1175 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-3` / bolt-panel | 1622 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `vent_survey-detail-4` / trace-mark | 2068 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `silence` · Passer sans attirer la créature | 540 / 0.7 | Chapitre 15 | listen |
| `hide-vent_survey` · Se glisser dans le renfoncement | 2044 / 0.7 | Facultatif | hide |

#### Garde-fous de cette pièce

Les 3 retours, 2 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Cache des conduits · `refuge`

**Ventilation · niveau 0 · vent · 1750 unités · z 0.7–0.7**

Repère d’orientation : Petit renfoncement hors des axes de ventilation. Profil `refuge` / `service_recess`, circuit `habitat`, emprise `inherited-refuge`.

Blocage métrique déclaré : [41.7, 1.1, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Conduits des prospecteurs | conduit | 170 / 0.7 | 658 / 0.7 | Newt ; Libre |
| Buanderie | grille | 1580 / 0.7 | 170 / 0.69 | Newt ; Libre |
| Renfoncement des câbles | conduit | 1180 / 0.7 | 1780 / 0.7 | Newt ; service-nest |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `refuge-set-0` / toy | 399 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `refuge-set-1` / blanket | 716 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `refuge-set-2` / ration | 1034 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `refuge-set-3` / drawing | 1351 / 0.22 | FIXTURES | Non | trace de vie familiale |
| `refuge-detail-0` / mug | 861 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-1` / photo | 542 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-2` / trace-mark | 875 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-3` / bolt-panel | 1208 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `refuge-detail-4` / vent-cover | 1540 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `cache` · Préparer une petite cache | 402 / 0.7 | Chapitre 7 | stash |
| `hide` · Regagner la cache | 665 / 0.7 | Chapitre 16 | stash |
| `a21` · La petite cache | 1435 / 0.7 | Facultatif | archive |
| `hide-refuge` · Se glisser dans le renfoncement | 1040 / 0.7 | Facultatif | hide |

#### Garde-fous de cette pièce

Les 3 retours, 4 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Hangar scientifique · `hangar`

**Recherche · niveau 0 · depth · 3300 unités · z 0.25–0.9**

Repère d’orientation : Navette de service, passerelle et réserves de carburant. Profil `hangar` / `shuttle_bay`, circuit `research`, emprise `authored-hangar`.

Blocage métrique déclaré : [78.6, 9, 3.4] ; intention originale, pas mesure du roman. 10 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Laboratoire de la Compagnie | sas | 170 / 0.69 | 1152 / 0.28 | scienceClearance |
| Navette de la Compagnie | passerelle | 3130 / 0.69 | 170 / 0.7 | Libre |

Raccord vers **Laboratoire de la Compagnie** : préparation exposée 1.1 s, puis trajet borné 1.1 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `hangar-cover1` | fuel | 1270 / 0.46 | 245 / 0.16 |
| `hangar-cover2` | pallet | 2130 / 0.54 | 260 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `hangar-set-0` / shuttle | 522 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hangar-set-1` / fuel | 1086 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hangar-set-2` / gantry | 1650 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hangar-set-3` / console | 2214 / 0.22 | FIXTURES | Non | poste de travail |
| `hangar-set-4` / pallet | 2778 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `hangar-detail-0` / chain-hoist | 396 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-1` / warning-board | 1023 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-2` / hose-reel | 1867 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-3` / tool-board | 2277 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-detail-4` / ceiling-light | 2904 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `hangar-cover1` / fuel | 1270 / 0.46 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `hangar-cover2` / pallet | 2130 / 0.54 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `clearance` · Déverrouiller la navette scientifique | 759 / 0.81 | Chapitre 13 | terminal |
| `boarding` · Vérifier l’embarquement | 1254 / 0.81 | Chapitre 14 | talk |
| `a19` · Accès réservé | 2706 / 0.43 | Facultatif | archive |
| `cache-hangar` · Réserve de terrain | 1749 / 0.86 | Facultatif | pickup |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 759 / 0.77 | 1 |
| emergency-arrow | 1617 / 0.77 | 2 |
| broken-light | 2442 / 0.77 | 2 |
| scorch | 2904 / 0.77 | 3 |

#### Dispositifs physiques de la 0.6

**Rideau du hangar** · `shutter-hangar`. Centre 2370 / 0.66, emprise 52 / 0.46. Commandes : (2276 / 0.7) ; (2464 / 0.7). Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.

Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.


#### Garde-fous de cette pièce

Les 2 retours, 4 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Navette de la Compagnie · `shuttle`

**Recherche · niveau 0 · side · 2150 unités · z 0.7–0.7**

Repère d’orientation : Sas arrière, sièges et commandes de navigation. Profil `shuttle` / `pressure_shell`, circuit `research`, emprise `inherited-shuttle`.

Blocage métrique déclaré : [51.2, 2.8, 3.4] ; intention originale, pas mesure du roman. 6 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Hangar scientifique | passerelle | 170 / 0.7 | 3130 / 0.69 | Libre |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `shuttle-set-0` / seat | 407 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `shuttle-set-1` / seat | 741 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `shuttle-set-2` / console | 1075 / 0.22 | FIXTURES | Non | poste de travail |
| `shuttle-set-3` / screen | 1409 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `shuttle-set-4` / hatch | 1743 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `shuttle-detail-0` / hanging-coat | 692 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-1` / oxygen | 666 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-2` / warning-board | 1075 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-3` / vent-cover | 1484 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `shuttle-detail-4` / ceiling-light | 1892 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `autopilot` · Désengager la trajectoire automatique | 494 / 0.7 | Chapitre 14 | terminal |
| `departure` · Décoller | 817 / 0.7 | Chapitre 14 | launch |
| `a20` · Quatre sièges occupés | 1763 / 0.7 | Facultatif | archive |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 494 / 0.77 | 1 |
| emergency-arrow | 1054 / 0.77 | 2 |
| broken-light | 1591 / 0.77 | 2 |
| scorch | 1892 / 0.77 | 3 |

#### Garde-fous de cette pièce

Les 1 retours, 3 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Buanderie · `wash`

**Habitat · niveau 0 · depth · 1850 unités · z 0.25–0.9**

Repère d’orientation : Machines, linge abandonné et évier de service. Profil `utility` / `laundry_racks`, circuit `habitat`, emprise `inherited-wash`.

Blocage métrique déclaré : [44.0, 9, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Cache des conduits | grille | 170 / 0.69 | 1580 / 0.7 | Newt ; Libre |
| Réfectoire | porte | 1680 / 0.69 | 2430 / 0.69 | Libre |
| Coursive résidentielle | escalier | 518 / 0.28 | 1296 / 0.7 | Libre |

Raccord vers **Coursive résidentielle** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `wash-cover1` | washer | 703 / 0.56 | 160 / 0.13 |
| `wash-cover2` | linen | 1240 / 0.57 | 190 / 0.14 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `wash-set-0` / washer | 377 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `wash-set-1` / washer | 651 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `wash-set-2` / linen | 925 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `wash-set-3` / sink | 1199 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `wash-set-4` / washer | 1473 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `wash-cover1` / washer | 703 / 0.56 | ACTORS | Oui | obstacle contournable et cachette basse |
| `wash-cover2` / linen | 1240 / 0.57 | ACTORS | Oui | obstacle contournable et cachette basse |
| `wash-detail-0` / hanging-coat | 873 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-1` / hose-reel | 791 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-2` / vent-cover | 925 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-3` / wall-clock | 1276 / 0.38 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `wash-detail-4` / fire-cabinet | 866 / 0.38 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `water` · Récupérer de l’eau | 426 / 0.81 | Chapitre 15 | supply |
| `a22` · L’eau du lendemain | 1517 / 0.43 | Facultatif | archive |
| `hide-wash` · Se cacher dans le placard de service | 771 / 0.82 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 426 / 0.77 | 1 |
| emergency-arrow | 906 / 0.77 | 2 |
| broken-light | 1369 / 0.77 | 2 |
| scorch | 1628 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Lina Sato** · Lingerie de service. Routine 0/1 : (1310 / 0.84) → (1550 / 0.84) → (1130 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Panier de dépannage** · `supply-laundry` à (1130 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 1 Portion froide ; 1 Trousse de soins. Pas de remplissage après une visite.


#### Garde-fous de cette pièce

Les 3 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Relais de communications · `relay`

**Administration · niveau 1 · side · 1950 unités · z 0.7–0.7**

Repère d’orientation : Baie relais et émetteurs directionnels. Profil `archive` / `relay_backbone`, circuit `research`, emprise `inherited-relay`.

Blocage métrique déclaré : [46.4, 2.8, 3.4] ; intention originale, pas mesure du roman. 6 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Salle des archives | coursive | 170 / 0.7 | 1630 / 0.7 | Libre |
| Contrôle colonial | coursive | 1780 / 0.7 | 672 / 0.28 | Libre |
| Terrasse des antennes | escalier | 480 / 0.7 | 170 / 0.81 | Libre |

Raccord vers **Terrasse des antennes** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `relay-set-0` / rack | 424 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `relay-set-1` / antenna | 791 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `relay-set-2` / console | 1159 / 0.22 | FIXTURES | Non | poste de travail |
| `relay-set-3` / rack | 1526 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `relay-detail-0` / server | 451 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `relay-detail-1` / tape-reel | 604 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `relay-detail-2` / cable-tray | 975 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `relay-detail-3` / vent-cover | 1346 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `relay-detail-4` / wall-clock | 1716 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `a23` · Ligne sans réponse | 1599 / 0.7 | Facultatif | archive |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 448 / 0.77 | 1 |
| emergency-arrow | 956 / 0.77 | 2 |
| broken-light | 1443 / 0.77 | 2 |
| scorch | 1716 / 0.77 | 3 |

#### Vie coloniale et stations de la 0.5

**Nils Corban** · Relais des transmissions. Routine 0/1 : (1310 / 0.7) → (1550 / 0.7) → (1130 / 0.7). P permet de sélectionner sa conversation sans emprunter un accès voisin.


#### Garde-fous de cette pièce

Les 3 retours, 1 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Réserve médicale · `clinic_store`

**Médical · niveau 0 · side · 1700 unités · z 0.7–0.7**

Repère d’orientation : Tiroirs de soins et stockage réfrigéré. Profil `medical` / `cold_storage`, circuit `medical`, emprise `inherited-clinic_store`.

Blocage métrique déclaré : [40.5, 2.8, 3.4] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Infirmerie | porte | 170 / 0.7 | 784 / 0.28 | Libre |
| Atelier biomédical | porte | 1160 / 0.7 | 2280 / 0.81 | service-biomed |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `clinic_store-set-0` / medicine | 392 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `clinic_store-set-1` / shelf | 698 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `clinic_store-set-2` / fridge | 1002 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `clinic_store-set-3` / medicine | 1308 / 0.22 | FIXTURES | Non | fonction propre au lieu |
| `clinic_store-detail-0` / privacy-screen | 638 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-1` / oxygen | 527 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-2` / medical-cross | 850 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-3` / wall-clock | 1173 / 0.7 | FIXTURES | Non | Usage quotidien, identité du lieu et orientation |
| `clinic_store-detail-4` / gurney | 1496 / 0.7 | ACTORS | Non | Usage quotidien, identité du lieu et orientation |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `medstock` · Prendre les soins d’urgence | 391 / 0.7 | Chapitre 9 | supply |
| `a24` · Dernière réserve | 1394 / 0.7 | Facultatif | archive |
| `cache-clinic_store` · Réserve de terrain | 901 / 0.7 | Facultatif | pickup |
| `hide-clinic_store` · Se cacher dans le placard de service | 533 / 0.7 | Facultatif | hide |
| `job-biomed-part` · Prendre le contacteur de réserve | 720 / 0.7 | Détour biomed / étape 2 | side-task |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 391 / 0.77 | 1 |
| emergency-arrow | 833 / 0.77 | 2 |
| broken-light | 1258 / 0.77 | 2 |
| scorch | 1496 / 0.77 | 3 |

#### Garde-fous de cette pièce

Les 2 retours, 5 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Office de la cuisine · `pantry`

**Habitat · niveau 0 · depth · 2100 unités · z 0.25–0.9**

Repère d’orientation : Passe-plats, chambre froide et escalier réservé au personnel. Profil `canteen` / `pantry-service-loop`, circuit `habitat`, emprise `authored-pantry`.

Blocage métrique déclaré : [50.0, 9, 3.4] ; intention originale, pas mesure du roman. 6 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Réfectoire | porte | 170 / 0.81 | 1850 / 0.28 | Libre |
| Coursive résidentielle | escalier | 1930 / 0.81 | 1720 / 0.7 | service-pantry |

Raccord vers **Coursive résidentielle** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `pantry-cover1` | table | 730 / 0.44 | 220 / 0.13 |
| `pantry-cover2` | fridge | 1220 / 0.53 | 160 / 0.16 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `pantry-set-0` / fridge | 1320 / 0.27 | FIXTURES | Non | Chambre froide derrière la table |
| `pantry-set-1` / stove | 850 / 0.27 | FIXTURES | Non | Cuisson sous la hotte |
| `pantry-set-2` / sink | 540 / 0.27 | FIXTURES | Non | Point de lavage près de l’entrée |
| `pantry-set-3` / cupboard | 1500 / 0.27 | FIXTURES | Non | Réserve sèche contre la paroi |
| `pantry-set-4` / ration | 1470 / 0.29 | FIXTURES | Non | Caisses de provisions près de la réserve |
| `pantry-set-5` / kitchen-hood | 850 / 0.27 | FIXTURES | Non | Hotte alignée sur le poste de cuisson |
| `pantry-set-6` / mug | 950 / 0.27 | FIXTURES | Non | Tasse au poste de pause |
| `pantry-set-7` / wall-clock | 380 / 0.27 | FIXTURES | Non | Horloge au point de prise de service |
| `pantry-set-8` / hanging-coat | 1790 / 0.27 | FIXTURES | Non | Manteau près de la sortie du personnel |
| `pantry-set-9` / noticeboard | 460 / 0.27 | FIXTURES | Non | Consignes près de la poignée absente |
| `pantry-cover1` / table | 730 / 0.44 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `pantry-cover2` / fridge | 1220 / 0.53 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `job-pantry-inspect` · Examiner · La porte du personnel | 470 / 0.81 | Détour pantry / étape 1 | side-task |
| `job-pantry-release` · Ajuster la poignée et libérer l’escalier | 1630 / 0.81 | Détour pantry / étape 3 | side-task |
| `hide-pantry` · Se cacher dans le casier de service | 1218 / 0.81 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 1260 / 0.77 | 2 |
| broken-light | 840 / 0.4 | 3 |

Rencontre `pantry-tap` : annonce de 3.5 s au passage x ≥ 1030, à partir du stade 1. Consulter son état de sauvegarde avant tout ajout d’ennemi.

#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Atelier biomédical · `biomed`

**Médical · niveau 0 · depth · 2450 unités · z 0.25–0.9**

Repère d’orientation : Banc de réparation, berceaux de moniteurs et porte de la réserve. Profil `medical` / `biomed-service-loop`, circuit `medical`, emprise `authored-biomed`.

Blocage métrique déclaré : [58.3, 9, 3.4] ; intention originale, pas mesure du roman. 6 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Infirmerie | porte | 170 / 0.81 | 2000 / 0.28 | Libre |
| Réserve médicale | porte | 2280 / 0.81 | 1160 / 0.7 | service-biomed |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `biomed-cover1` | bed | 720 / 0.46 | 205 / 0.13 |
| `biomed-cover2` | lab-bench | 1450 / 0.5 | 190 / 0.14 |
| `biomed-cover3` | cart | 1830 / 0.41 | 135 / 0.1 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `biomed-set-0` / gurney | 540 / 0.27 | FIXTURES | Non | Baie de réparation du brancard |
| `biomed-set-1` / monitor | 655 / 0.27 | FIXTURES | Non | Moniteur associé à la baie |
| `biomed-set-2` / oxygen | 465 / 0.27 | FIXTURES | Non | Bouteille à côté du brancard |
| `biomed-set-3` / tool-board | 1240 / 0.27 | FIXTURES | Non | Outils fixés au-dessus de l’établi |
| `biomed-set-4` / glass-cabinet | 1570 / 0.27 | FIXTURES | Non | Armoire de composants près du plan de travail |
| `biomed-set-5` / medicine | 1520 / 0.29 | FIXTURES | Non | Trousse rangée au pied du poste |
| `biomed-set-6` / medical-cross | 970 / 0.27 | FIXTURES | Non | Signalétique de la travée médicale |
| `biomed-set-7` / privacy-screen | 815 / 0.27 | FIXTURES | Non | Écran de séparation de la baie |
| `biomed-set-8` / bed-lamp | 615 / 0.27 | FIXTURES | Non | Lampe au poste du brancard |
| `biomed-set-9` / sink | 2090 / 0.27 | FIXTURES | Non | Lavage avant retour en réserve |
| `biomed-cover1` / bed | 720 / 0.46 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `biomed-cover2` / lab-bench | 1450 / 0.5 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `biomed-cover3` / cart | 1830 / 0.41 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `job-biomed-inspect` · Examiner · L’atelier de garde | 470 / 0.81 | Détour biomed / étape 1 | side-task |
| `job-biomed-release` · Remplacer le contacteur et libérer la réserve | 1980 / 0.81 | Détour biomed / étape 3 | side-task |
| `hide-biomed` · Se cacher dans le casier de service | 1421 / 0.81 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 1470 / 0.77 | 2 |
| broken-light | 980 / 0.4 | 3 |

Rencontre `biomed-cabinet` : annonce de 3.0 s au passage x ≥ 1080, à partir du stade 2. Consulter son état de sauvegarde avant tout ajout d’ennemi.

#### Vie coloniale et stations de la 0.5

**Mei Doran** · Maintenance biomédicale. Routine 0/1 : (950 / 0.84) → (1190 / 0.84) → (770 / 0.84). P permet de sélectionner sa conversation sans emprunter un accès voisin.

**Pièces de diagnostic** · `supply-biomedical` à (1590 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 1 Pile de service ; 2 Fil de raccordement ; 1 Boîtier vide. Pas de remplissage après une visite.

**Établi biomédical** · `bench-biomed` à (1810 / 0.84). Adulte proche ; deux recettes, coût débité seulement au terme. Aucun usage à distance ni atelier pour Newt.


#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Terrasse des antennes · `aerial`

**Administration · niveau 2 · exterior · 2700 unités · z 0.25–0.9**

Repère d’orientation : Mâts inclinés par le vent, boîtier de synchronisation et cage d’escalier. Profil `exterior` / `aerial-service-loop`, circuit `research`, emprise `authored-aerial`.

Blocage métrique déclaré : [64.3, 9, 3.4] ; intention originale, pas mesure du roman. 7 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Relais de communications | escalier | 170 / 0.81 | 480 / 0.7 | Libre |
| Contrôle colonial | escalier | 2530 / 0.81 | 1320 / 0.28 | service-aerial |

Raccord vers **Relais de communications** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Contrôle colonial** : préparation exposée 0.45 s, puis trajet borné 1.4 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `aerial-cover1` | crate | 830 / 0.47 | 240 / 0.16 |
| `aerial-cover2` | fuel | 1670 / 0.52 | 180 / 0.13 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `aerial-set-0` / radio-mast | 460 / 0.27 | FIXTURES | Non | Premier mât fixé au parapet |
| `aerial-set-1` / radio-mast | 1810 / 0.27 | FIXTURES | Non | Mât principal voisin du boîtier |
| `aerial-set-2` / antenna | 2250 / 0.27 | FIXTURES | Non | Antenne secondaire près du palier |
| `aerial-set-3` / cable-spool | 1710 / 0.29 | FIXTURES | Non | Réserve de câble sous le mât principal |
| `aerial-set-4` / floodlight | 1150 / 0.27 | FIXTURES | Non | Éclairage de la zone de passage |
| `aerial-set-5` / barrier | 1450 / 0.26 | FIXTURES | Non | Garde-corps arrière de la terrasse |
| `aerial-set-6` / radio | 1970 / 0.27 | FIXTURES | Non | Poste de service au pied du mât |
| `aerial-set-7` / warning-board | 1400 / 0.27 | FIXTURES | Non | Avertissement au changement de travée |
| `aerial-set-8` / cable-tray | 2070 / 0.27 | FIXTURES | Non | Chemin de câble vers le boîtier |
| `aerial-set-9` / beacon | 2440 / 0.27 | FIXTURES | Non | Balise fixée au palier de sortie |
| `aerial-cover1` / crate | 830 / 0.47 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `aerial-cover2` / fuel | 1670 / 0.52 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `job-aerial-inspect` · Examiner · Une fréquence dans le vent | 470 / 0.81 | Détour aerial / étape 1 | side-task |
| `job-aerial-release` · Raccorder la liaison et libérer le palier | 2230 / 0.81 | Détour aerial / étape 3 | side-task |
| `hide-aerial` · Se cacher dans le casier de service | 1566 / 0.81 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 1620 / 0.77 | 2 |
| broken-light | 1080 / 0.4 | 3 |

Rencontre `aerial-wind` : annonce de 4.2 s au passage x ≥ 1150, à partir du stade 0. Consulter son état de sauvegarde avant tout ajout d’ennemi.

#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 2 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Atelier de manutention · `workshop`

**Logistique · niveau 0 · depth · 3000 unités · z 0.25–0.9**

Repère d’orientation : Chaîne de palan, établi moteur et galerie vers le processeur six. Profil `hangar` / `workshop-service-loop`, circuit `industry`, emprise `authored-workshop`.

Blocage métrique déclaré : [71.4, 9, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Garage des prospecteurs | porte | 170 / 0.81 | 2580 / 0.28 | Libre |
| Processeur six | coursive | 2830 / 0.81 | 1870 / 0.28 | service-workshop |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `workshop-cover1` | wheel | 890 / 0.45 | 290 / 0.17 |
| `workshop-cover2` | tools | 1800 / 0.5 | 210 / 0.14 |
| `workshop-cover3` | crate | 2370 / 0.52 | 150 / 0.12 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `workshop-set-0` / chain-hoist | 2140 / 0.27 | FIXTURES | Non | Palan suspendu dans son portique |
| `workshop-set-1` / tractor | 610 / 0.27 | FIXTURES | Non | Véhicule immobilisé dans la baie d’entrée |
| `workshop-set-2` / wheel | 765 / 0.29 | FIXTURES | Non | Train de roue voisin du véhicule |
| `workshop-set-3` / tool-board | 1650 / 0.27 | FIXTURES | Non | Panneau d’outils au poste moteur |
| `workshop-set-4` / pump-motor | 1570 / 0.27 | FIXTURES | Non | Moteur au poste de réparation |
| `workshop-set-5` / hand-truck | 1320 / 0.27 | FIXTURES | Non | Diable dans le rangement latéral |
| `workshop-set-6` / cable-spool | 1860 / 0.29 | FIXTURES | Non | Touret à côté du poste de maintenance |
| `workshop-set-7` / fuel | 820 / 0.27 | FIXTURES | Non | Réserve fermée à côté du véhicule |
| `workshop-set-8` / gantry | 2140 / 0.27 | FIXTURES | Non | Portique portant le palan |
| `workshop-set-9` / fire-cabinet | 2660 / 0.27 | FIXTURES | Non | Incendie à proximité de la galerie de sortie |
| `workshop-cover1` / wheel | 890 / 0.45 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `workshop-cover2` / tools | 1800 / 0.5 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `workshop-cover3` / crate | 2370 / 0.52 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `job-workshop-inspect` · Examiner · Le palan immobilisé | 470 / 0.81 | Détour workshop / étape 1 | side-task |
| `job-workshop-release` · Remonter la chaîne et lever le rideau | 2530 / 0.81 | Détour workshop / étape 3 | side-task |
| `hide-workshop` · Se cacher dans le casier de service | 1740 / 0.81 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 1800 / 0.77 | 2 |
| broken-light | 1200 / 0.4 | 3 |

Rencontre `workshop-hatch` : annonce de 3.2 s au passage x ≥ 1400, à partir du stade 2. Consulter son état de sauvegarde avant tout ajout d’ennemi.

#### Vie coloniale et stations de la 0.5

**Mallette du palan** · `supply-workshop` à (1970 / 0.84). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : 2 Fil de raccordement ; 1 Pile de service ; 1 Boîtier vide. Pas de remplissage après une visite.

**Établi de maintenance** · `bench-workshop` à (2310 / 0.84). Adulte proche ; deux recettes, coût débité seulement au terme. Aucun usage à distance ni atelier pour Newt.


#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Dérivation des eaux grises · `drain`

**Maintenance · niveau -2 · depth · 2850 unités · z 0.25–0.9**

Repère d’orientation : Deux vannes de purge, cuves fermées et passerelle latérale sèche. Profil `maintenance` / `drain-service-loop`, circuit `industry`, emprise `authored-drain`.

Blocage métrique déclaré : [67.9, 9, 3.4] ; intention originale, pas mesure du roman. 8 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Station de pompage | échelle | 170 / 0.81 | 1200 / 0.28 | Libre |
| Galerie du refroidissement | échelle | 2680 / 0.81 | 1500 / 0.28 | service-drain |

Raccord vers **Station de pompage** : préparation exposée 0.5 s, puis trajet borné 1.8 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Raccord vers **Galerie du refroidissement** : préparation exposée 0.5 s, puis trajet borné 1.8 s. Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès.

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| `drain-cover1` | tank | 820 / 0.46 | 280 / 0.16 |
| `drain-cover2` | pump-motor | 1620 / 0.5 | 240 / 0.13 |
| `drain-cover3` | tank | 2180 / 0.44 | 190 / 0.1 |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `drain-set-0` / tank | 490 / 0.27 | FIXTURES | Non | Cuve fermée côté entrée |
| `drain-set-1` / pipe | 550 / 0.27 | FIXTURES | Non | Conduite raccordée à la cuve |
| `drain-set-2` / gauge | 690 / 0.27 | FIXTURES | Non | Manomètre du premier circuit |
| `drain-set-3` / hose-reel | 1100 / 0.27 | FIXTURES | Non | Flexible au poste de maintenance |
| `drain-set-4` / pump-motor | 1390 / 0.27 | FIXTURES | Non | Groupe moteur du retour |
| `drain-set-5` / pipe-elbow | 1500 / 0.27 | FIXTURES | Non | Coude au départ du moteur |
| `drain-set-6` / valve | 1770 / 0.27 | FIXTURES | Non | Volant de la dérivation |
| `drain-set-7` / fire-cabinet | 2450 / 0.27 | FIXTURES | Non | Poste incendie près de l’échelle |
| `drain-set-8` / warning-board | 2110 / 0.27 | FIXTURES | Non | Consigne avant le retour |
| `drain-set-9` / floodlight | 2570 / 0.27 | FIXTURES | Non | Éclairage de la zone de sortie |
| `drain-cover1` / tank | 820 / 0.46 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `drain-cover2` / pump-motor | 1620 / 0.5 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |
| `drain-cover3` / tank | 2180 / 0.44 | ACTORS | Oui | Emprise physique visible, contournable par le fond ou l’avant. |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `job-drain-inspect` · Examiner · Le retour des eaux | 470 / 0.81 | Détour drain / étape 1 | side-task |
| `job-drain-release` · Ouvrir le retour et libérer la grille | 2380 / 0.81 | Détour drain / étape 3 | side-task |
| `hide-drain` · Se cacher dans le casier de service | 1653 / 0.81 | Facultatif | hide |

#### État de crise visible

| Élément | x / z | Stade minimum |
|---|---|---:|
| paper-trail | 1710 / 0.77 | 2 |
| broken-light | 1140 / 0.4 | 3 |

Rencontre `drain-return` : annonce de 3.5 s au passage x ≥ 1230, à partir du stade 2. Consulter son état de sauvegarde avant tout ajout d’ennemi.

#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 3 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

### Renfoncement des câbles · `nest`

**Ventilation · niveau 1 · vent · 1950 unités · z 0.7–0.7**

Repère d’orientation : Rubans colorés, couverture pliée et petite grille d’observation. Profil `refuge` / `nest-service-loop`, circuit `habitat`, emprise `inherited-nest`.

Blocage métrique déclaré : [46.4, 1.2, 2.2] ; intention originale, pas mesure du roman. 5 travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.

#### Entrées, retours et droits

| Sortie | Nature | Départ x / z | Retour x / z | Condition |
|---|---|---|---|---|
| Conduits de l’infirmerie | conduit | 170 / 0.7 | 1070 / 0.7 | Newt ; Libre |
| Cache des conduits | conduit | 1780 / 0.7 | 1180 / 0.7 | Newt ; service-nest |

Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.

#### Obstacles : emprise commune au rendu et au moteur

| ID | Nature | Centre x / z | Largeur / profondeur |
|---|---|---|---|
| Aucun | Passage latéral dégagé | — | — |

#### Décors : fonction avant densité

| ID / objet | x / z | Couche | Solide | Rôle et placement |
|---|---|---|---|---|
| `nest-set-0` / drawing | 380 / 0.7 | FIXTURES | Non | Dessin servant de repère près de l’entrée |
| `nest-set-1` / blanket | 560 / 0.7 | FIXTURES | Non | Couverture dans le renfoncement sec |
| `nest-set-2` / toy | 600 / 0.7 | FIXTURES | Non | Jouet laissé près de la couverture |
| `nest-set-3` / trace-mark | 970 / 0.7 | FIXTURES | Non | Trace au premier coude du conduit |
| `nest-set-4` / duct-junction | 870 / 0.7 | FIXTURES | Non | Jonction fixée sur la paroi |
| `nest-set-5` / bolt-panel | 1190 / 0.7 | FIXTURES | Non | Plaque vissée du coffrage |
| `nest-set-6` / mug | 650 / 0.7 | FIXTURES | Non | Tasse au petit bivouac |
| `nest-set-7` / vent-cover | 1570 / 0.7 | FIXTURES | Non | Grille alignée sur le passage de l’ombre |
| `nest-set-8` / photo | 720 / 0.7 | FIXTURES | Non | Photo gardée à côté du bivouac |
| `nest-set-9` / cable | 1760 / 0.7 | FIXTURES | Non | Câble guidant le retour vers la cache |

#### Interactions et cachettes

| ID / action | x / z | Condition d’apparition | Type |
|---|---|---|---|
| `job-nest-inspect` · Examiner · Le fil qui revient | 470 / 0.7 | Détour nest / étape 1 | side-task |
| `job-nest-release` · Nouer le ruban et soulever la petite grille | 1480 / 0.7 | Détour nest / étape 3 | side-task |
| `hide-nest` · Se glisser dans le renfoncement | 1131 / 0.7 | Facultatif | hide |

Rencontre `nest-shadow` : annonce de 4 s au passage x ≥ 1030, à partir du stade 1. Consulter son état de sauvegarde avant tout ajout d’ennemi.

#### Garde-fous de cette pièce

Les 2 retours, 3 points d’interaction et 0 obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.

Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.

## Documents originaux

### a01 — Bordereau d’arrivée

Bienvenue à Hadley’s Hope. Les nouveaux arrivants doivent se présenter au contrôle colonial avant l’attribution des logements. Ne laissez pas de bagages dans le sas : les équipes de nuit y font passer le matériel lourd.

### a02 — Grille de prospection

Secteur de relevé ajouté à la tournée des Jorden. Coordonnées transmises par liaison Compagnie. Priorité haute. L’équipe de prospection demande une raison ; aucune précision reçue à ce jour.

### a03 — Ordre du jour

Relève du poste central à six heures. Révision des joints du garage reportée. Les patrouilles devront signaler toute conduite qui siffle : le processeur six nous a déjà coûté assez de sommeil.

### a04 — Une table pour quatre

Anne — Il reste des provisions au réfectoire. Tim a encore déplacé ses affaires dans les conduits. J’ai remis la petite couverture sur le lit de Becky. On rentrera avant que le chauffage recommence à faire du bruit.

### a05 — Les chemins de Tim

Après la grille qui vibre, tourner à gauche. Ne pas poser le pied sur la plaque claire. Elle résonne jusque dans le couloir. Tim dit qu’il connaît un chemin encore plus court.

### a06 — Priorité médicale

Couloir médical dégagé en permanence. Un seul membre de la famille admis auprès des patients. Les demandes de transfert vers le laboratoire doivent être validées par le personnel soignant.

### a07 — Le hublot

L’isolement reste fermé. La vitre ne doit pas être ouverte pour faciliter une observation. Toute intervention sur le patient nécessite deux personnes et un accès libre au sas.

### a08 — Mainmise

L’échantillon doit demeurer sur place. Les résultats d’observation passent par le canal scientifique avant toute transmission extérieure. Les urgences médicales ne dispensent pas de renseigner la chaîne de possession.

### a09 — Transmission conservée

Copie locale créée. Si la liaison est coupée, garder les bandes hors de la baie principale. La suppression d’un message ne doit pas supprimer la preuve qu’il a été reçu.

### a10 — Tracteur des prospecteurs

Le tracteur revient couvert d’une poussière que les filtres n’arrêtent pas correctement. Vérifier les joints avant toute autre sortie. Ne pas déposer les bottes de prospection dans les casiers propres.

### a11 — Un bureau transformé

Des familles attendent près des cartes. Elles veulent savoir quel bâtiment tient encore. Ne pas donner une destination tant qu’une patrouille n’a pas confirmé le passage.

### a12 — Refuge provisoire

Le fret peut attendre. Dégager deux allées jusqu’à la porte et réserver les couvertures aux enfants. Les caisses contre le mur ne seront ouvertes qu’en présence d’un responsable.

### a13 — Deux circuits

Les départs habitat et médical partagent encore un relais. En cas de surcharge, couper les appareils non essentiels avant de réarmer. Un deuxième claquement signifie qu’il faut laisser le coupe-circuit ouvert.

### a14 — Sous les logements

La vanne de retour résiste à froid. Ne pas la forcer tant que le manomètre indique une différence de pression. On a besoin d’eau, pas d’une galerie noyée.

### a15 — Intervention interrompue

Balisage incomplet sur la piste. Rester du même côté des piquets au retour. La tempête efface les traces de roues en quelques minutes.

### a16 — Une coque étrangère

Le métal n’a pas la couleur du métal. Les arches se poursuivent au-delà du faisceau et la radio ne tient plus. Balise posée près du seuil. Ne pas déplacer le tracteur sans prévenir.

### a17 — Signaux immobiles

Plusieurs balises répondent sous le processeur. Aucun déplacement depuis la dernière lecture. Garder une distance avec les parois et ne pas rompre le contact radio.

### a18 — Aucun trophée

Repli par le refroidissement. Les lampes portatives indiquent la sortie, pas les embranchements. Si une lampe s’éteint, revenir vers la précédente plutôt que suivre un bruit.

### a19 — Accès réservé

Embarquement scientifique réservé. Réservoirs vérifiés. Le code d’accès ne doit pas être communiqué sur le réseau général. Un officier de service conteste la restriction ; demande en attente.

### a20 — Quatre sièges occupés

Brackett. Paris. Mori. Luisa. Quatre présences à bord. Le sas est fermé. La liste n’est pas celle que nous espérions remplir.

### a21 — La petite cache

La couverture reste au fond. On peut voir le couloir sans coller les yeux à la grille. Quand les pas s’arrêtent, attendre encore. Toujours attendre encore.

### a22 — L’eau du lendemain

L’eau coule moins fort à cet évier. Ne pas ouvrir le robinet entièrement. Une bouteille pleine tient dans le passage si on la pousse devant soi.

### a23 — Ligne sans réponse

Relais alimenté, aucune réponse. Les contrôles locaux sont bons. Répéter l’appel à intervalle court et conserver chaque tentative dans la mémoire de secours.

### a24 — Dernière réserve

Dernier relevé des réserves. Les trousses emportées ne seront pas remplacées avant réapprovisionnement. Signaler un tiroir vide au lieu de le refermer comme si de rien n’était.

### a25 — Relève de cuisine

Les repas du matin restent sur le tableau, même quand le réfectoire se vide. Le personnel a laissé une poignée de rechange côté cuisine pour ne plus emprunter les couloirs publics.

### a26 — Pièces de rechange

Un moniteur en panne ne doit pas condamner tout un lit. Les composants compatibles sont stockés dans la réserve, à portée de l’équipe de garde.

### a27 — Ligne intérieure

L’émetteur rétabli ne porte pas au-delà de la colonie. Il ne promet ni secours ni évacuation : il remet seulement les deux cages d’escalier en communication.

### a28 — Ne pas laisser sous charge

Quand le moteur de levage s’arrête, soulager le contrepoids avant toute intervention. Le passage de service reste un chemin de maintenance, pas une voie pour le tracteur.

### a29 — La conduite qui revient

Deux repères jaunes identifient le retour vers les cuves fermées. Cette dérivation permet d’éviter les soubassements. Ne jamais ouvrir un réservoir à l’air libre.

### a30 — Le ruban noué

Un nœud au ras du sol, puis deux au prochain embranchement. On peut retrouver le passage avec les doigts quand la lumière s’éteint. Personne n’a écrit de nom sur le ruban.

## Qualification courante

830 groupes/cas du modèle, dont 118 pour les seuils et 18 pour le stockage abstrait. Trente parcours complets retestés. 28 cas d’installateur sur projets de test et 4 avec les vrais fichiers 0.6. 47 contrôles dans Chromium et 12 captures décrites. Voir QA_REPORT.md pour les périmètres et limites.

DLC autonome avec lanceur additionnel, pas le jeu Tantalus complet ni son GameEngine natif. Aucun push GitHub ni déploiement Vercel. Dessins stylisés par code provisoires, pas atlas définitifs ou reconstitution 1:1. Roman intégral non consulté : plans, dialogues, tâches et documents sont une condensation originale. L’écho Frontière 2204 et les sauvegardes du moteur hôte ne sont pas modifiés.
