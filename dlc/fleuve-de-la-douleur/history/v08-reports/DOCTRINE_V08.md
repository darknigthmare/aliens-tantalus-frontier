## Périmètre de la passe 0.8

La campagne conserve 16 chapitres de jeu, 42 pièces, 57 connexions jouables bidirectionnelles, 49 objectifs principaux, deux escortes et six détours de trois étapes. Le tracteur ne crée aucune nouvelle salle ni mission obligatoire. Les 489 placements de décor ne sont pas autant de sprites uniques. Deux anciennes copies décoratives de tracteur sont remplacées par du matériel ou un affleurement, pour ne pas laisser croire à plusieurs véhicules utilisables.

La nouvelle couche comprend un tracteur, deux pièces autorisées à la conduite, deux bandes de terrain ralentissant le véhicule et deux bornes à réserves finies. Leurs chiffres et règles sont des créations de gameplay, pas des caractéristiques techniques officielles de véhicule ou des mesures du roman. Les dessins sont intégrés au rendu Canvas ; aucune image d’intention n’est présentée comme un écran de jeu.

## Autorisation et présence physique

La préparation existante `tractor`, dans le chapitre « Les coordonnées », donne accès au véhicule garé dehors sur la Piste du plateau. Il faut ensuite le rejoindre. Le tracteur ne sort pas d’une animation de garage et n’apparaît pas à la position du personnage. Sa position initiale est x 660 / z 0,79, sa largeur 304 unités et sa profondeur physique 0,10. La coque n’occupe pas le terrain avant l’autorisation.

Les trois adultes peuvent le conduire après cette autorisation. Anne reste sans arme. Newt ne monte pas en cabine. Une escorte active interdit l’embarquement : aucun siège de compagnon, passager invisible ou transport collectif n’est ajouté. Les autres personnages ne reçoivent pas de réserves au simple changement de point de vue.

E près du véhicule ou 5 ouvre la cabine ; I fait de même lorsqu’on est au volant. L’équipement à pied contient aussi un bouton TRACTEUR. Consulter ce dossier ne déplace rien ; les boutons hors de portée expliquent le refus. La lecture est en pause. Monter, descendre, effectuer un demi-tour de manœuvre ou entretenir reprend la simulation normale, avec les dangers actifs.

## Monter, manœuvrer, descendre

La montée dure 1,5 seconde. Un déplacement ou une blessure interrompt le travail avant l’effet. Une montée réussie synchronise le conducteur au châssis, retire l’arme du rendu, éteint la lampe portative et le détecteur, et annule l’ancien maintien d’accroupissement. Les commandes de soins, tir personnel, soudure, cachette, balise et autres manipulations à pied restent indisponibles en cabine. Les balles précédentes sont retirées à l’embarquement.

Q/D ou A/D commandent le mouvement horizontal. En profondeur, Z/S braquent seulement lorsque le véhicule roule ; à l’arrêt il ne glisse pas de côté. Espace ou C maintenu freine. C en cabine n’est pas un frein à bascule hérité de l’accroupissement. F utilise l’avertisseur, pas une arme ; L agit sur les phares, pas sur la lampe de poche. La souris ne transforme pas le tracteur en tourelle.

Les maxima internes sont 520 unités/seconde vers l’avant et 220 en marche arrière. Accélération 300, freinage 850, résistance au roulement 135. Le compteur affiche une conversion de jeu fondée sur 42 unités par mètre, marquée « km/h simulés » ; cette échelle n’authentifie ni les dimensions de la colonie ni la vitesse d’un tracteur du film. Les roues défilent avec la distance parcourue. Le demi-tour est une manœuvre temporisée de 1,2 seconde à l’arrêt, pas une simulation de rayon de braquage automobile.

Descendre exige une vitesse absolue au plus égale à 14 unités/seconde, un appui libre et l’absence de créature sur cet appui. La manœuvre dure 1,1 seconde, ou 0,45 seconde lorsque le châssis est hors service. L’appui est revérifié au terme. Le conducteur n’est pas éjecté dans un obstacle pour simplifier la sortie. Une batterie vide ne verrouille pas la cabine.

Le véhicule reste où il est garé après la descente et après une visite dans une autre pièce. Il n’existe pas de rappel à distance. Un changement scénaristique de chapitre termine la conduite, laisse le tracteur sur sa piste et éteint ses phares ; il ne le répare ni ne le recharge. Une panne éloignée d’une borne n’est pas automatiquement récupérable : il n’y a ni remorquage ni véhicule de secours. Le parcours principal demeure faisable à pied.

## Deux présentations et une route bornée

Seules la Piste du plateau et le Plateau des relevés acceptent la conduite. Le garage, les installations intérieures et l’épave restent accessibles à pied. Le passage entre les deux zones utilise leur vraie connexion existante, à proximité, à l’arrêt, via le bouton du dossier cabine. La destination et l’ensemble du volume du véhicule doivent être libres. Une occupation bloque le passage ; elle ne téléporte pas un ennemi ou un compagnon pour dégager la route. Le graphe des 57 connexions n’augmente pas.

Cette jonction de zones est discrète. Le véhicule ne traverse pas un monde extérieur continu et la transition n’est pas une nouvelle route panoramique animée. Les franchissements de piétons et leurs autorisations antérieures restent séparés. Passer près de la balise de mission ne la pose pas à distance : il faut descendre et accomplir l’objectif.

En mode hybride, le châssis stationné garde son emprise et sa profondeur et peut servir de couverture physique. En mode classique, le véhicule sans conducteur se range sur le plan décoratif arrière z = 0,42 tandis que la bande piétonne reste à z = 0,7 ; l’embarquement remet le véhicule sur le plan de conduite z = 0,7 après vérification. Il s’agit d’une convention discrète de projection, pas d’une manœuvre de stationnement latérale simulée. Changer de mode au volant est refusé. Les garanties de sortie à pied restent prioritaires.

## Sol, obstacles et collisions

Le sol extérieur possède des gravillons, stries et repères de piste plutôt que le quadrillage d’un plancher intérieur. Deux bandes identifiées ralentissent le tracteur : gravier meuble sur la piste (limite 260) et ornières sur le plateau (225). Ce sont des contraintes locales de vitesse, pas une simulation de suspension ou de déformation du terrain.

La collision utilise le rectangle complet du châssis, agrandi selon l’obstacle pertinent, et des sous-pas de mouvement de six unités au plus. Le véhicule ne se réduit pas à un point central qui traverserait un poteau ou un rocher. Les limites de pièce restent physiques. Un choc suffisamment rapide endommage le châssis ; une touche lente ne lui retire pas arbitrairement la même quantité. La variation et le délai entre dommages sont des règles de jeu.

Un contact avec une créature arrête le tracteur sans l’écraser. Il ne constitue pas une arme illimitée. Le corps du véhicule stationné peut intercepter un tir dans le monde hybride ; les impacts respectent le premier obstacle rencontré. Les anciens volets et les 62 couvertures statiques gardent leurs règles propres. Les deux bornes de service sont des stations non collisionnables, pas deux nouvelles couvertures.

## Batterie, bruit et attaques

Le véhicule possède sa batterie et son intégrité, distinctes de la santé humaine et de la lampe portative. Le moteur en cabine, le roulement et les phares consomment la réserve selon les coefficients du modèle. À zéro, l’accélération cesse ; la friction et le frein continuent d’agir. Les phares ou une panne ne changent pas la météo globale.

L’avertisseur émet 1,2 seconde, avec cinq secondes de repos et un coût de 0,2 point de batterie. Il reste local et ne crée aucun adversaire. L’activation sonore générale est volontaire ; le signal et le bruit du véhicule restent évalués par le gameplay même avec le son utilisateur coupé.

Une créature existante peut percevoir le conducteur par les règles de vue et de bruit, rejoindre un point extérieur du châssis et annoncer son attaque pendant 0,85 seconde. Le châssis absorbe d’abord les coups : 18 points de base pour un adulte, six pour un petit parasite, avant coefficient de difficulté. La navigation n’invente pas d’accès à travers un rocher pour atteindre la cabine. La mémoire continue de viser la dernière position perçue, pas un personnage silencieux omniscient.

À zéro d’intégrité, le véhicule s’immobilise et ses lumières s’éteignent. Les attaques suivantes peuvent atteindre le personnage : rester en cabine n’accorde pas l’invulnérabilité. La descente demeure possible lorsque son appui est libre. La coque n’explose pas et aucune nouvelle arme ni mort canonique n’est ajoutée.

## Entretien à réserves finies

La borne du périmètre se trouve sur la Piste du plateau (900 / 0,38) ; le dépôt de prospection sur le Plateau des relevés (2430 / 0,38). Chaque poste possède une seule trousse de châssis et un seul accumulateur pour toute la reconstitution. Il faut garer le tracteur dans les 290 unités internes de la borne puis s’en approcher à pied. Le menu interdit une réparation à distance et l’usage depuis la cabine.

Une réparation dure 3,2 secondes et restaure au plus 55 points. Une recharge dure 2,8 secondes et rend au plus 65 points. À pleine intégrité ou pleine batterie, la commande est refusée pour ne pas gaspiller la réserve. Les conditions et les stocks sont vérifiés au début puis à la fin. Une interruption ne consomme pas le composant. Le service n’est pas une nouvelle recette de l’établi personnel et ne puise pas magiquement dans les poches d’un autre protagoniste.

## Persistance et migrations

Le format externe reste `river-of-pain`, schéma 1. Le registre `mobility.revision = 8` garde pièce et position du véhicule, santé, batterie, vitesse, orientation, conducteur, phares, roues, délais d’impact et d’avertisseur, réserves des postes et statistiques. Les commandes de travail non achevées sont annulées à l’import, sans action ni débit inventé. Un véhicule qui roulait reprend sa vitesse puis continue avec la simulation normale ; il ne subit pas une seconde montée ni une recharge à l’import.

Les sept vrais exports 0.1 à 0.7 reçoivent une couche véhicule initiale sans conduite antérieure fictive. Si le nouveau stationnement recouvre la position d’une ancienne sauvegarde, la migration cherche un autre stationnement libre pour le véhicule et laisse le personnage à ses coordonnées. Aucun objectif, soin ou tir n’est attribué par cette migration. Les anciens transferts de gaines conservent leurs identifiants et santé.

Les imports incohérents sont refusés : mauvaise pièce, conducteur enfant, conducteur dans une autre position, escorte embarquée, châssis placé dans un obstacle, vitesse impossible, cabine vide en mouvement, état détruit roulant, batterie vide avec phares et stocks de borne hors limites. Un retour au point de contrôle restaure l’ensemble de l’état enregistré ; il ne conserve pas gratuitement tout ce qui s’est passé après ce point.

Le protocole local à deux copies reste testé avec MemoryStorage simulé. Ce résultat ne certifie ni localStorage natif après fermeture, ni quota réel, navigation privée ou onglets concurrents. Les véritables téléchargements et imports JSON sont testés séparément avec le fichier HTML courant. L’environnement a bloqué HTTP local ; Chromium a exécuté le HTML exact via set_content dans l’origine opaque autorisée, sans contournement de politique.

## Héritage maintenu

Les douze habitants restent des routines locales aux stades 0/1, pas une population simulée hors champ. Leurs 24 sujets se lisent sur place. Les douze réserves finies et les trois établis conservent leurs contenus et recettes. Les 24 cachettes ne rendent pas invincible ; les compagnons d’escorte gardent santé, tension et ordres. Les six tableaux, deux jets, alarmes et leurres conservent leur comportement local.

Les 21 liaisons temporisées du piéton restent des raccords bornés, pas des volumes verticaux libres. Le combat normal se suspend pendant leur trajet engagé ; préparation et écoute restent exposées. Les gaines transportent des adultes existants sans duplication ; leurs sorties attendent un préavis et le dégagement de la bouche. Les plans, volets, tirs et dernières positions perçues utilisent les règles des versions antérieures retestées.

La reconstitution ne provoque ni secours extérieur réussi supplémentaire, ni évacuation de Newt, ni mort de reine. Le nouveau tracteur est une mécanique originale ajoutée aux mêmes objectifs, pas une scène revendiquée comme authentifiée sur le texte intégral. Le GameEngine, le SaveSystem, les atlas et l’écho Frontière 2204 du jeu Tantalus ne sont pas modifiés.

## Portée des tests courants

Six familles de six pilotes terminent le modèle depuis une partie neuve. La nouvelle famille ajoute la montée, la conduite piste → plateau → piste → plateau, la recharge sur place, la descente, puis le reste des objectifs, escortes et détours. Elle connaît les solutions et utilise les commandes autorisées, sans forcer les objectifs ni téléporter le personnage. Ce tour anticipé ne qualifie pas l’équilibrage de la conduite sous attaque tardive.

Les collisions, l’attaque du châssis, les restrictions, le carburant électrique épuisé, les imports incohérents et les appuis occupés sont éprouvés dans des scènes préparées distinctes. Les premières interactions navigateur démarrent une partie neuve ; les scènes ciblées importent des sauvegardes déclarées. Une capture de fixture n’est ni une partie complète humaine ni un nouvel événement certifié du roman. Les tailles d’écran sont émulées, pas une qualification de téléphone, de Safari ou de manette physique.
