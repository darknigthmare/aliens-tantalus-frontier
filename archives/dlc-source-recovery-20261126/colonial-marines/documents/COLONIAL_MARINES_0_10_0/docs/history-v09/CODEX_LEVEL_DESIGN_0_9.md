# Codex de level design — Colonial Marines 0.9.0 « Couvertures fragiles »

La 0.9 prolonge la 0.8 : quinze chapitres, 85 salles et trois arènes Bug Hunt sont conservés. Parmi le mobilier existant, 82 éléments deviennent fragiles : projectiles, souffle, corrosion et griffes peuvent ouvrir de nouvelles lignes de tir. Aucun moteur parent, multijoueur réseau ou graphisme final n’est annoncé. Les valeurs sont originales à cette adaptation autonome.

## Registre exécuté

{
  "version": "0.9.0",
  "missions": 15,
  "mainMissions": 11,
  "stasisChapters": 4,
  "rooms": 85,
  "side": 29,
  "depth": 56,
  "doors": 174,
  "props": 580,
  "propTypes": 42,
  "kits": 41,
  "actions": 142,
  "archives": 22,
  "enemies": 9,
  "medalTypes": 3,
  "huntArenas": 3,
  "huntSectors": 9,
  "huntWavesPerArena": 30,
  "huntGates": 6,
  "huntBeacons": 6,
  "huntProps": 102,
  "huntActions": 33,
  "destructibleProps": 82,
  "destructibleCampaign": 76,
  "destructibleHunt": 6
}

## Doctrine et limites

### R01 — Données exécutées

Les quinze chapitres, 85 salles, trois arènes, placements et produits sont conservés. Le constructeur ajoute D.mobility ; game/data.js et docs/content-manifest.json décrivent les mêmes paramètres. Le transport et le point de ralliement sont dynamiques, pas des salles ou sprites nouveaux.

### R02 — Chronologie séparée

Cette chronique reprend le jeu Colonial Marines ; elle ne réécrit pas la campagne principale de Tantalus. MIRE est ici un habillage narratif, pas une API hôte déjà connectée.

### R03 — Un seul moteur actif

Engine appelle explicitement hunt, field, tactics et logistics. Campagnes et défenses partagent simulation, Renderer, tirs, collisions, acteurs et interface. Aucun moteur parallèle ni remplacement de prototype ; le HTML legacy reste non appelé.

### R04 — Lieux distincts, bibliothèque partagée

85 salles de campagne sont strictement conservées. Bug Hunt ajoute trois espaces continus comportant neuf secteurs, pas neuf salles séparées. La bibliothèque de 42 familles est partagée : aucune nouvelle famille de sprite final revendiquée.

### R05 — Passage latéral

En mode side, les pieds restent à z=.62. Les seuils visuels de fond possèdent un point d’usage sur cette voie ; le texte du seuil signale le changement de pièce.

### R06 — Profondeur continue

En mode depth, z varie de .10 à .92 ; les déplacements diagonaux sont normalisés. La profondeur sert le contournement et la visée, pas seulement l’échelle du dessin.

### R07 — Chemin réciproque

174 seuils dirigés forment 87 liaisons réciproques. Les préconditions sont contrôlées aussi sur les raccourcis. L’ordre des objectifs est celui du manifeste, pas une déduction d’un dessin.

### R08 — Retour sans réapparition

L’état de chaque salle est conservé dans la mission : ennemis, consommables, mécanismes et actions déjà effectuées ne se régénèrent pas au retour.

### R09 — Départ sans collision

Les apparitions aux seuils et les points de départ doivent être extérieurs aux meubles solides. Les contrôles automatisés échantillonnent aussi les chemins d’approche.

### R10 — Fonction avant quantité

Lits et médecine dans les soins ; bureaux dans l’administration ; caisses dans la manutention ; réseaux dans les locaux techniques. Un emplacement doit conserver son rôle déclaré.

### R11 — Volumes documentés

Les 42 familles déjà présentes en 0.3 sont conservées. Chacune a son dessin, largeur, profondeur et hauteur. Ce sont des fonctions de rendu, pas quarante-deux images externes définitives.

### R12 — Collisions explicitement levées

Un objet placé trop près d’une action ou d’un seuil peut rester décoratif. Sa fiche indique solid=false et la raison ; le registre n’en fait pas un obstacle physique.

### R13 — Origines ennemies contrôlées

Les rencontres sont placées dans le constructeur, puis confrontées aux emprises solides. Une position incompatible est déplacée vers une candidate proche dégagée ; les tests vérifient les positions finales, pas une fidélité métrique officielle.

### R14 — Tri par les pieds

Props, Marine, équipier, boss et mécanismes se composent selon z. Les plans proches ne doivent pas être interprétés comme des murs de collision s’ils sont décoratifs.

### R15 — Pas de plafond dehors

Les rues, aires aériennes et toitures utilisent un extérieur ouvert. Les conduites et mobiliers demeurent des objets séparés.

### R16 — Précondition visible

Les portes affichent destination et verrou ; le plan liste les objectifs restants. Une branche optionnelle ne doit pas permettre de sauter le portique ou la poursuite.

### R17 — Action locale

Engine.use retrouve l’action canonique de la salle et refuse un identifiant étranger ou une activation hors de portée. Un objet transmis ne peut pas remplacer le type de l’action.

### R18 — Maintien annulable

Le navigateur envoie E maintenu. Le relâchement, le déplacement au-delà du seuil et les dégâts interrompent la progression du maintien.

### R19 — Consommables finis

Le matériel d’une réserve n’est récupérable qu’une fois. Les sentinelles et l’équipier ont un stock de tirs limité.

### R20 — Poursuite sans canon miraculeux

Les trois nouvelles cloisons ralentissent le Raven. Le contact suit son avance mesurée ; une fermeture persistante arrête le segment, pas une simple image de cinématique.

### R21 — Pression par segment

Le contact de poursuite est initialisé par salle, à -260, puis démarre quand Winter dépasse x=290. Ce n’est pas une IA unique simulée dans les pièces hors écran.

### R22 — Vitesse lisible

Marche 170, course 240, accroupi 75, chargeur 118 unités par seconde. Le poursuivant avance à 196, ou 258 si le retard dépasse 780 unités.

### R23 — Boilers sur les rives

L’absence de bruit de pas en marche accroupie permet la traversée. Le fonctionnement sonore n’est pas une simulation de propagation acoustique à travers tout le bâtiment.

### R24 — Chargeur spécifique

Le Raven de la confrontation finale de sa mission reste insensible aux tirs ordinaires. Les pinces appliquent les dégâts de source loader.

### R25 — Armure de l’APC

Les balles frappent la coque mais ne détruisent pas le véhicule. Les deux fûts possèdent chacun 40 points, un effet d’explosion et un changement de position cible.

### R26 — Recul réel

L’APC avance vers x=1800 puis x=2150, à 220 unités par seconde. Sa collision suit sa position, puis disparaît après l’impact de la charge.

### R27 — Largage conditionné

La commande est refusée tant qu’un fût subsiste ou que x<2130. Le maintien lance une chute de 2,2 secondes ; apc-destroyed n’est produit qu’à l’impact.

### R28 — Danger du portique

Le véhicule prépare son tir pendant 1,1 seconde et conserve le point visé. Le point d’impact de la charge doit être évité, même après activation réussie.

### R29 — Fûts ciblables

Le moteur accepte balles et grenades sur les fûts. L’assistance de visée souris les reconnaît ; une cible fût explicitement indiquée n’est pas remplacée par le verrouillage du smartgun.

### R30 — Sauvetage fini

Les quatre arrivées du dropship se produisent à 0, 8, 15 et 22 secondes après stabilisation. Elles restent inactives avant celle-ci.

### R31 — Défendre puis accompagner

Après 28 secondes et neutralisation des contacts du dropship, le blessé devient une escorte mobile. La confirmation ne le téléporte plus en sécurité : il doit gagner la rampe via le drain et atteindre le poste survivor-delivered.

### R32 — Défense locale

L’horloge du sauvetage avance quand la salle est simulée ; quitter la pièce suspend cet état. L’évacuation du Sulaco, elle, emploie le compteur commun de sa mission.

### R33 — Pompe distincte du fusil

Le M37 émet sept trajectoires divergentes pour une seule cartouche. Ce cône déterministe ne prétend pas reproduire exactement la balistique commerciale.

### R34 — Esquive atteignable

Le saut a été relevé à une impulsion 370, car l’ancienne hauteur maximale restait sous le seuil d’esquive de 65. Le test vérifie maintenant le sommet et une attaque évitée.

### R35 — Reine non tuable aux balles

Quatre commandes arment la catapulte ; la position de la Reine, et non un compteur de dégâts, autorise l’éjection.

### R36 — Son facultatif

Neuf presets synthétisés, coupés au lancement, peuvent être activés par geste utilisateur. Les informations vitales restent affichées sans audio.

### R37 — Voix audio bornées

Au plus vingt oscillateurs sont actifs. L’arrêt nettoie les voix ; aucune banque sonore distante ou sample commercial n’est demandé.

### R38 — Trois profils, trois reprises

ATF_ACM_V9_PROFILE_1 à 3 conserve main, stasis et hunt, plus la dernière chronique active. Un seul point Bug Hunt par profil, pas un par arène. Les reprises des autres chroniques ne sont pas remplacées par le démarrage d’une nouvelle défense.

### R39 — Migration de campagne conservatrice

Une reprise 0.8 conserve salle, inventaire, compagnons, dossier, vague, équipements posés et transportés. Seuls environmentVersion=1 et le registre intact des nouveaux objets fragiles sont ajoutés. Les migrations historiques restent disponibles et documentent leurs redémarrages propres.

### R40 — Préserver l’ancienne clé

Les clés V1 à V8 sont lues sans écrasement ; les écritures passent dans V9. Trois fixtures main, stasis et hunt proviennent du moteur 0.8 réellement extrait et vérifié. Ce sont des états de test, pas les sauvegardes privées du joueur. Le Storage Map des contrôles ne certifie pas une persistance native.

### R41 — Reprise sûre

Une sortie au menu ou un export pendant la partie capture l’état actuel. Après décès, le dernier checkpoint valide est conservé. Les campagnes gardent leur convention antérieure sans projectiles transitoires ; Bug Hunt sérialise explicitement les projectiles pour préserver la pression d’une vague.

### R42 — Pas de bouton de triche distribué

La livraison fixe QA=false. Le navigateur de test active sa seule copie en mémoire ; le paramètre URL qa ne débloque rien dans la page publiée localement.

### R43 — Preuves séparées

Un test de règle peut placer des acteurs ; un agent de campagne doit emprunter les portes et les déplacements. Une capture préparée est légendée comme telle.

### R44 — Limite de la grille

Le parcours de sol utilise un échantillonnage, pas une preuve géométrique continue formelle. Il est complété par des parcours physiques du moteur.

### R45 — Intégration conservatrice

L’installateur ne fait qu’ajouter une page séparée et une entrée de menu au contrat hôte v86 connu. Il refuse les conflits ; aucun test du moteur hôte complet n’a été réalisé ici.

### R46 — Validation humaine restante

Les agents connaissent les positions et visent idéalement. Leur succès ne certifie ni le ressenti, ni la difficulté humaine, ni les performances sur le matériel de l’utilisateur.

### R47 — Deux progressions indépendantes

Stasis est accessible dès un profil neuf. Ses quatre chapitres sont débloqués séparément de la campagne principale ; finir Home ne débloque pas silencieusement le dernier chapitre Stasis.

### R48 — Trois points de vue

Lisbeth commence désarmée ; Stone a accès au fusil et au fusil à pompe ; Levy utilise une sélection de deux armes selon le chapitre. Le chiffre de quatre armes décrit le moteur commun, pas la dotation permanente de chaque protagoniste.

### R49 — Salles civiles, dessin provisoire

Lisbeth n’utilise pas le casque du Marine et Levy reçoit une tenue de chercheur. Les animations restent des silhouettes vectorielles partagées, pas des sprites finaux ni des portraits officiels.

### R50 — Escorte physique

Quatre occurrences d’escorte : blessé du dropship, Lisbeth, Hicks en détention et Hicks au relais. Hicks est le même personnage dans deux chapitres, pas deux nouveaux personnages distincts.

### R51 — Pas d’escorte hors écran

Une escorte inactive reste à son poste. Une fois active, elle possède une pièce, une position et des points de vie. Seule la salle courante est simulée ; la porte refuse de laisser un compagnon actif dans une autre pièce.

### R52 — Regroupement au seuil

Pour traverser, l’escorte doit être debout et à moins de 145 unités du seuil. Le passage applique l’arrivée réciproque du groupe. C’est un changement de salle, pas une marche continue dans un ascenseur en 3D.

### R53 — Navigation partagée

Équipier et escortes utilisent le même navigateur : trajet direct échantillonné, puis grille autour des solides. Vitesse d’escorte 155 unités/s. Aucun saut de secours à travers un meuble n’est utilisé pour combler un retard.

### R54 — Ordre d’attente

B, ou le bouton d’escorte, alterne suivre et attendre. L’ordre d’attente ne repositionne pas l’acteur. Repartir exige de lui demander de suivre ou de revenir près de lui.

### R55 — Blessure et relèvement

À zéro point de vie, l’escorte tombe et ne franchit plus de seuil. Maintenir E pendant 2,4 s à moins de 95 unités la relève à 45 points. Aucun kit obligatoire pour éviter une impasse permanente de ressources.

### R56 — Ligne de tir

Un projectile ennemi touche d’abord le corps intersecté. Les attaques de mêlée peuvent cibler l’escorte proche ; les flaques acides restent dangereuses. Un compagnon ne constitue pas une décoration invulnérable.

### R57 — Arrivée à la balise

L’action escort_deliver exige le compagnon actif, debout, dans la même pièce et à moins de 150 unités du poste. Après validation, extracted=true et active=false ; le simple fait de voir la sortie ne valide rien.

### R58 — Une salle de discrétion dédiée

La coursive du Legato possède un garde à patrouille et deux alcôves. Le garde combine orientation, ligne de vue, distance, bruit et soupçon ; ce système ne remplace pas toute l’IA des quinze chapitres.

### R59 — Dissimulation conditionnelle

Une alcôve cache le personnage accroupi. Le garde peut le reconnaître à très courte distance. Se tenir debout dans le dessin sombre n’est pas une invisibilité permanente.

### R60 — Mémoire du garde

Après détection, le garde recherche la dernière position connue pendant une durée finie. La reprise conserve soupçon et dernière position. Aucun accès automatique à la position actuelle à travers tous les murs.

### R61 — Transmission de 24 secondes

La copie des enregistreurs de Levy progresse uniquement à moins de 430 unités du pupitre. Trois renforts finis sont activés à 2, 11 et 19 secondes de transmission effective.

### R62 — Transmission de 30 secondes

Le signal final exige la présence à moins de 460 unités du relais. Trois renforts finis sont activés à 2, 11 et 23 secondes. Quitter le périmètre suspend la copie, sans effacer ce qui est déjà transmis.

### R63 — Fin de transmission doublement vérifiée

Le compteur doit être complet et les contacts neutralisés. Le terminal de confirmation reste bloqué autrement. La précondition de transmission est portée sur les branches qui rejoignent l’extraction.

### R64 — Reprise pendant la copie

Dans les campagnes, le booléen actif et le temps d’upload partiel appartiennent à la salle ; projectiles et effets visuels transitoires ne sont pas exportés. Ce contrat n’est pas modifié par la conservation supplémentaire des projectiles dans Bug Hunt.

### R65 — Objet utilisé visible

Les valises de ravitaillement et supports d’archive portent l’identifiant de leur action. Leur rendu change après utilisation ; revenir ne recrée ni la ressource ni une animation d’ouverture répétée.

### R66 — Son sans obligation

Les avertissements de combat, suspicion, escorte blessée et progression d’upload ont une représentation visuelle. Les sons restent synthétisés, sans voix enregistrées.

### R67 — Bornes de validation

Les identités, positions, états d’escorte, progressions, temps et soupçons sont validés à l’import. Cette validation de format n’est pas une solution anti-triche réseau ; le jeu reste local et solo.

### R68 — Régressions effectivement rejouées

Les 391 tests précédents sont conservés ou adaptés au nouveau contrat. La suite ajoute 48 tests de structure, acidité, tirs, mêlée et migration. Les totaux exécutés et les empreintes figurent dans les rapports courants, séparés des résultats historiques.

### R69 — Lisibilité du groupe

Les portes, pupitres et meubles au premier plan deviennent partiellement transparents lorsque leur volume graphique recouvre le joueur, un équipier ou une escorte. Cette transparence ne change ni collision ni détection du garde.

### R70 — Captures distinctes des parcours

Les 85 cadrages de salle sont des états préparés, figés pour examen. Les traces de parcours moteur documentent séparément les déplacements réels. Une capture du menu ne prouve pas une sauvegarde native sur disque.

### R71 — O’Neal vulnérable

Dans les secteurs où il est actif, O’Neal peut être ciblé au corps-à-corps et touché par projectiles ennemis, acide ou grenades proches. À zéro PV, il cesse de marcher et tirer. Aucun décès permanent du compagnon n’est simulé.

### R72 — Regroupement militaire

Les portes exigent O’Neal debout à moins de 240 unités du seuil. L’ordre tenir ne se corrige pas automatiquement : revenir à suivre ou couvrir et attendre son déplacement. Une action de fin de chapitre refuse un équipier à terre.

### R73 — Relève et pansement distincts

Maintenir E pendant 2,4 secondes à proximité relève O’Neal à 45 PV sans kit. Dans la tablette, un pansement consommé soigne 55 PV, avec plafond de 100. Le soin refuse l’acteur à terre et la distance supérieure à 130.

### R74 — Cartouches non créées

La tablette transfère au plus 60 cartouches de la réserve du fusil du joueur vers O’Neal, plafond 320. Les balles de l’équipier sont des projectiles, cadence 0,55 seconde et dégâts 15 ; elles ne touchent plus instantanément à travers un obstacle.

### R75 — Désignation bornée

V ou la tablette désigne un ennemi actif, vivant, visible, à moins de 1000 unités du joueur. L’ordre passe à couvrir. O’Neal privilégie cette cible quand il peut lui-même la voir et l’atteindre à moins de 700 unités. Le marquage ne garantit pas un tir à travers la géométrie.

### R76 — Sentinelle entretenue sur place

La tablette permet veille, rotation et transfert de cartouches à proximité ; la ligne de vue est désormais requise aussi pour rotation et recharge. À zéro, le poste refuse repli, rotation et recharge : réparer d’abord. Une sentinelle repliée peut être redéployée sur un emplacement valide, sans kit gratuit.

### R77 — Premier impact du segment

Pour les balles, intersections des meubles solides, du blindé, des fûts et des corps sont triées par distance le long du segment. Une cible proche peut être touchée avant un meuble plus lointain ; l’ordre dans le tableau des ennemis ne choisit plus la victime.

### R78 — Grenades et géométrie approchée

Les grenades rebondissent sur les volumes solides et les limites. Leurs explosions sont occultées par la ligne de vue du mobilier haut, pas par une simulation acoustique ou volumétrique en 3D. Les grenades proches peuvent blesser le groupe ; les tirs directs ordinaires n’activent pas un système général de tir fratricide.

### R79 — Dossier de service local

Les bilans gardent nombre de fins, meilleur temps, exploration maximale et distinctions par difficulté et chapitre. Extraction demande une fin, reconnaissance demande toutes les pièces et archives locales collectées pendant ce parcours. Équipe intacte exige aucune mise à terre ni mort de joueur depuis son départ suivi en schéma 4.

### R80 — Pas de perfection rétroactive

Une reprise antérieure au dossier de service n’obtient pas Équipe intacte rétroactivement si ses blessures n’étaient pas suivies. Les traces déjà suivies restent conservées. Une même fin rechargée ne compte pas deux fois.

### R81 — Export de profil complet

Le JSON ATF_ACM_PROFILE contient les reprises disponibles main, stasis et hunt, et le mode actif. Une entrée absente n’est pas inventée. Toutes les entrées sont validées avant confirmation ; seules celles présentes remplacent les clés correspondantes du profil choisi. Les anciens JSON simples restent acceptés.

### R82 — Stockage faillible

Si une écriture d’import échoue, les clés concernées sont restaurées au mieux à leur valeur précédente. Le navigateur peut aussi refuser cette restauration : il ne s’agit pas d’une transaction garantie. Les essais utilisent Storage simulé. Exporter puis conserver le JSON indépendamment demeure utile.

### R83 — Trente vagues finies

Chaque arène se termine à trente vagues repoussées. Il ne s’agit ni d’un mode infini ni de trente nouvelles missions narratives. La première vague attend une demande explicite ; les suivantes ont une préparation de 25 secondes, abrégeable par N.

### R84 — Trois secteurs réellement continus

Chaque arène est une seule salle de profondeur. Les frontières sont deux murs hauts de 40 unités de large, couvrant toute la profondeur utile. Les payer retire leur collision et leur apparence fermée, sans téléporter le groupe.

### R85 — Économie distincte

Départ à 500 crédits. Solde = crédits gagnés − crédits dépensés. Un achat refusé ne retire rien. Les primes de neutralisation sont marquées une seule fois par ennemi ; les tirs du joueur, de l’équipier ou d’une sentinelle alimentent le même compte.

### R86 — Gains et coûts explicites

Neutralisations : 25 à 240 crédits selon le profil. Fin de vague : 100 + cinq fois son numéro. Ouvertures : 350 puis 650. Treize produits au registre ; leurre 150, mine 260, kit de réparation 180. Monnaie fictive, aucune boutique connectée.

### R87 — Ravitaillement de proximité

P ou E ouvre le magasin à moins de 150 unités d’une caisse du secteur accessible. Le menu suspend le temps, y compris pendant une vague. Cette pause est un choix solo ; elle ne représente pas le rythme de la coopération du jeu commercial.

### R88 — Armes achetées, munitions bornées

M41A et M37 sont autorisés au départ. M56 et M240 doivent être achetés avant leurs réserves. Une arme débloquée ne se rachète pas. Pansements plafonnés à cinq, grenades à neuf, armure à cent.

### R89 — Trois socles par défense

Chaque arène possède trois socles de construction. Chacun commande au plus un châssis ; une pose consomme un kit. Déplacer le poste ne libère pas un nouveau châssis sur le socle. Le registre garde les identités : somme des postes posés et du poste porté égale le nombre de socles commandés.

### R90 — Capture contestable

Deux balises par arène. Maintenir E pendant six secondes à proximité, sans ennemi vivant dans un rayon de 270 unités. Le relâchement ou le danger empêche une capture instantanée. Une balise paie 100 crédits une seule fois.

### R91 — Suppression prospective

Chaque balise enlève deux entrées des vagues suivantes, avec minimum quatre. Une capture ne supprime pas les ennemis vivants ni ceux déjà inscrits dans la file de la vague courante. Les Crushers prévus toutes les six vagues restent dans la composition réduite.

### R92 — Composition déterministe

Sans balise, nombre de contacts = min(24, 5 + plancher((vague − 1) × 0,65)). Soldats WY tous les cinq tours, Crusher tous les six. Six profils existants sont réutilisés ; aucune nouvelle caste biologique n’est annoncée.

### R93 — Pression bornée

Au plus sept ennemis vivants simultanés ; le reste attend en file. Un port d’arrivée n’est choisi que dans un secteur ouvert, assez loin du joueur et d’O’Neal. Si aucun port n’est admissible, la file attend au lieu de placer un corps dans le joueur.

### R94 — Annonce avant entrée

Une arrivée choisie est annoncée pendant 1,35 seconde par un repère ; un intervalle sépare les entrées. Le port et le temps restants sont sauvegardés. Il ne s’agit pas d’un déplacement physique dans une gaine hors écran.

### R95 — Même combat, navigation adaptée

Les ennemis Bug Hunt utilisent les collisions et projectiles existants. Leur navigation contourne les meubles ; les petits solides occultent aussi leur ligne de tir pour éviter un tireur qui gaspille indéfiniment sur un obstacle bas. Les campagnes ne changent pas de navigation.

### R96 — Fin de vague stricte

File vide, aucune entrée annoncée, aucun ennemi vivant, aucun projectile hostile en vol et aucune mine avec fusible engagé sont exigés avant la prime. La mort du dernier hostile n’annule pas son tir ou une explosion déjà amorcée.

### R97 — État de vague complet

Une reprise garde numéro, temps, file, annonce, ennemis, munitions, crédits, murs ouverts, balises, socles, flaques et projectiles en vol. Les effets graphiques seuls ne sont pas persistés. Une restauration conserve les identifiants de prime déjà accordée.

### R98 — Records séparés des médailles

Bug Hunt garde meilleure vague, victoires et meilleur temps par arène et difficulté. Une conclusion sauvegardée n’accorde pas une deuxième victoire au chargement. Aucun déblocage narratif, archive ou médaille de campagne n’est obtenu ainsi.

### R99 — Validation sans prétention anti-triche

L’import vérifie identités, bornes, structures, file, phases, géométrie, projectiles et cohérence comptable. Il refuse les valeurs non finies et les arènes étrangères. Un joueur peut toujours éditer une sauvegarde locale cohérente ; aucune garantie anti-triche réseau.

### R100 — Preuves Bug Hunt distinctes

Cinq agents rejouent les trente vagues de défense sur les trois arènes et trois difficultés. Deux agents supplémentaires, fret et laboratoire en Marine, déploient mines et leurres via leurs stocks réels et des achats normaux. Aucun crédit, ennemi, objectif ou résultat n’est injecté dans ces parcours.

### R101 — État structurel partagé

Une sentinelle commence à 160 points de structure. À zéro, elle reste sur son emplacement avec ses cartouches, sa température et son orientation. Le repli nécessite une structure positive ; la destruction ne crée ni nouvelle unité ni socle gratuit.

### R102 — Trajectoires de sentinelle

Les tirs sont des projectiles alliés de vitesse 1200 unités/s et portée maximale 1000, cadence minimale 0,15 s, dégâts de base 22. Le premier impact solide ou hostile décide de la collision ; pas de dégâts instantanés appliqués à une cible située derrière un meuble.

### R103 — Cycle thermique

Chaque tir ajoute dix points de chaleur. Refroidissement : quatorze points par seconde simulée. À cent, verrou thermique ; déverrouillage à trente-cinq ou moins. Couper le canon ne remet pas le thermomètre à zéro ; les menus suspendent le temps, donc aussi le refroidissement.

### R104 — Veille et remise en service

La tablette commande enabled sans changer HP, chaleur, munition ou orientation. Une sentinelle hors service reste indisponible ; la réparation conserve l’ordre de veille précédent. Réparer n’impose donc pas automatiquement de réactiver le canon.

### R105 — Réaction des hostiles au poste de tir

Un hostile peut privilégier une sentinelle proche ayant tiré récemment, ou située à moins de 160 unités. La sélection exige une ligne de vue et une proximité relative au joueur. Les structures détruites ne restent pas des appâts prioritaires.

### R106 — Plusieurs sources de dégâts

Projectiles hostiles, mêlée, flaques acides et grenade proche du joueur peuvent endommager la structure. Les volumes occultent les explosions selon la règle de ligne de vue. Une protection de 0,45 seconde borne les dégâts continus ; le facteur de difficulté est appliqué.

### R107 — Réparation sous exposition

Une structure endommagée exige 3,2 secondes de maintien E à moins de 125 unités, avec accès dégagé, personnage armé hors du chargeur et au moins un kit. Relâcher, quitter la portée, subir un impact ou tirer interrompt le maintien. Aucun kit n’est retiré avant la fin.

### R108 — Reconstruction bornée

À zéro structure, le maintien devient six secondes. Une réussite consomme exactement un kit et restaure quatre-vingt-dix points, plafond 160. Ni cartouches, ni refroidissement instantané, ni argent ne sont ajoutés. Un second kit est nécessaire pour atteindre le maximum depuis zéro.

### R109 — Kits de réparation distincts

Les kits de réparation et les kits de construction Bug Hunt sont deux stocks séparés. Plafond des réparations : trois. Départ armé : un ; Lisbeth désarmée : zéro. Récupérer son paquetage donne au moins un kit. Une réserve de campagne ajoute un kit une seule fois, sous le plafond.

### R110 — Achat de maintenance contrôlé

Le kit à 180 crédits exige la caisse accessible et de la place dans le stock. L’insuffisance de crédits ou le plafond de trois refuse l’achat sans retrait. Posséder un kit ne répare rien depuis le menu : retourner au terrain et tenir E est obligatoire.

### R111 — Brûlure persistante M240

L’impact réel du projectile de flammes applique une brûlure de 2,4 secondes. Six pulsations espacées de 0,4 seconde appliquent chacune six dégâts de base. L’impact initial et les modificateurs de cible restent séparés ; aucune nouvelle onde n’est créée à travers une cloison.

### R112 — Rafraîchissement sans empilement

Un nouvel impact renouvelle la durée de brûlure sans multiplier les pulsations ni réinitialiser leur horloge en cours. Raven et Reine ne s’enflamment pas. Une neutralisation par brûlure emploie le circuit normal de dégâts et ne paie pas une seconde prime.

### R113 — Briefing issu du directeur

Pendant la préparation Bug Hunt uniquement, le magasin affiche numéro, nombre et profils de la prochaine vague, calculés avec le même générateur que la vague jouée. Les balises déjà capturées sont prises en compte ; aucune composition d’une vague engagée n’est modifiée par cet affichage.

### R114 — État du groupe sans superposition

L’escorte s’affiche sous O’Neal lorsqu’ils sont présents ensemble ; leurs jauges ne se recouvrent plus. La tablette ajoute deux jauges distinctes de structure et de température, plus l’état de veille et le stock de réparation.

### R115 — Imports thermiques validés

fieldVersion=1 distingue les reprises qui possèdent ce contrat. Les seules anciennes versions 0.1 à 0.5 sans marqueur reçoivent les nouveaux champs. Une reprise courante incomplète, non finie ou hors bornes est refusée au lieu de voir sa structure, sa température ou ses stocks guéris silencieusement.

### R116 — Preuves de maintenance séparées

Les 31 contrôles de maintenance sont rejoués sur cette livraison. Scènes de dégâts préparées, maintiens et impacts réellement exécutés dans Chromium. Les 34 contrôles de mobilité sont séparés. Leurs chiffres ne constituent pas une certification d’usage humain.

### R117 — Dotation tactique distincte

Un départ armé fournit deux leurres et deux mines, un départ désarmé aucun. Trois unités portées au maximum pour chaque famille ; aucun partage avec grenades ou kits. Une réserve de campagne ajoute une unité de chaque sous plafond, une seule fois et seulement si le personnage est armé. Le chargeur interdit ces déploiements.

### R118 — Lancer avec obstacle

L lance vers la visée valide, sinon vers le regard ; le bouton du menu utilise le regard. Le dispositif suit une trajectoire au sol pendant au plus 0,7 seconde, vitesse 440 unités/s. Des pas de dix unités au maximum contrôlent collision et limites. L’arc graphique ne permet pas de traverser une cloison.

### R119 — Signal borné

Après atterrissage, le leurre émet dix secondes simulées, puis disparaît. Deux leurres actifs au maximum dans une salle ; ils possèdent chacun un identifiant persistant. Une nouvelle pose ne renouvelle pas un ancien dispositif. Les sons sont synthétisés et désactivés avec le réglage audio normal.

### R120 — Distraction sélective

Soldier, Lurker, Spitter, Facehugger et Boiler peuvent être attirés à moins de 640 unités avec ligne dégagée. Gardes, Crusher, Raven et Reine ignorent ces signaux. Un adversaire à moins de 110 unités de sa cible de combat ou touché depuis moins de 1,5 seconde garde la priorité au combat.

### R121 — Recherche puis contact

La créature navigue vers le signal avec les collisions normales. À moins de 45 unités, elle peut détruire le leurre ; le Boiler emploie son explosion normale. Aucun ennemi n’est téléporté, désactivé ou neutralisé gratuitement par un état de distraction.

### R122 — Pose vérifiée

O place la mine quarante-deux unités devant le personnage. Le sol, le segment d’accès, les limites et la proximité d’un autre dispositif sont vérifiés avant consommation. Pas de pose en plein saut. Trois mines placées au maximum par salle. Un refus ne retire ni stock ni argent.

### R123 — Armement puis fusible

Une mine s’arme pendant 1,5 seconde. Un hostile actif et vivant à moins de 90 unités, avec ligne dégagée, engage ensuite un fusible irréversible de 0,45 seconde. Les compagnons ne déclenchent pas seuls la mine. S’éloigner après le déclenchement ne désamorce pas le fusible.

### R124 — Souffle et occultation

Rayon de souffle 200 unités ; dégâts hostiles de base 170, atténués avec la distance et modulés par le profil de cible. Les volumes hauts occultent le souffle. Winter, O’Neal, escortes et sentinelles proches peuvent être blessés ; les protections habituelles restent appliquées. Raven et Reine conservent leurs mécanismes spécifiques.

### R125 — Récupération maintenue

Une mine non déclenchée, à moins de 105 unités et avec accès dégagé, se récupère par E maintenu 1,3 seconde. Il faut de la place dans le stock. L’action retire le dispositif avant de rembourser exactement une unité ; relâcher avant la fin ne rembourse rien. Un stock plein ne masque pas un objectif voisin.

### R126 — Horloges locales déclarées

Les mines et leurres persistent dans leur salle avec leurs temps restants. Ils évoluent seulement quand cette salle est simulée ; les dispositifs hors champ dans la même salle continuent, ceux d’une autre salle sont suspendus. Les menus suspendent tous ces temps. Aucune simulation distante continue n’est revendiquée.

### R127 — Mesures du détecteur

Le détecteur enregistre une mesure toutes les 0,8 seconde dans un rayon de 850 unités. Un acteur doit avoir parcouru au moins quatre unités depuis la mesure précédente. Un acteur immobile peut ne pas apparaître ; les coordonnées affichées sont celles de la mesure, pas sa position instantanée.

### R128 — Contacts sans affiliation

Les déplacements d’O’Neal et de l’escorte peuvent produire des points comme ceux des hostiles. Les points n’identifient pas leur faction. Le poursuivant du Raven est inclus lorsqu’il se déplace. Changer de salle ou restaurer une reprise vide les mesures transitoires au lieu de conserver des fantômes.

### R129 — Équipement accessible

I ouvre le menu ; les cartes montrent stocks, commandes et dispositifs du secteur. L et O déploient sur le terrain ; le menu possède les boutons équivalents. Le déploiement ferme le menu et nettoie les entrées retenues. À 390 pixels, cartes en colonne et défilement du dialogue, sans certification téléphone.

### R130 — Achats sous contraintes

Le magasin Bug Hunt vend un leurre pour 150 crédits et une mine pour 260, près d’une caisse accessible. Stock maximal de trois par famille. Un achat impossible est refusé avant débit. Les deux parcours tactiques supplémentaires emploient ces achats et leurs ressources initiales réelles.

### R131 — Format tactique strict

tacticsVersion=1 conserve ses validations de stocks, identifiants, positions, vitesses, vies et fusibles. Les reprises 0.7 à 0.9 doivent déjà posséder leurs champs tactiques ; les formats antérieurs reconnus suivent leur migration propre. Aucun secret anti-triche réseau n’est promis.

### R132 — Preuves tactiques séparées

35 contrôles Chromium tactiques rejoués distinguent lancement depuis le titre, pose et récupération au clavier, scènes de combat préparées, mesures de mouvement, achats réels et migrations de trois fixtures 0.6. Huit captures tactiques portent cette provenance. Les deux défenses instrumentées utilisent des entrées normales, mais leur agent reste omniscient.

### R133 — Identité unique du poste

Une sentinelle n’existe que posée dans une salle ou portée par le joueur. Le repli retire l’instance locale avant de créer le châssis porté ; la pose fait l’inverse. Les imports qui dupliquent l’identifiant sont refusés.

### R134 — Sélection de repli explicite

Tab propose le repli et U prépare le poste admissible le plus proche. Le poste doit être en veille, vivant, à moins de 110 unités, relié par une ligne dégagée. Préparer l’ordre ne retire encore aucun poste et ne consomme aucune ressource.

### R135 — Maintien de démontage

E maintenu pendant 2,8 secondes replie le poste sélectionné. Relâcher, sortir de portée ou subir des dégâts interrompt le maintien. Une progression partielle ne donne ni châssis ni crédit. Le maintien n’est pas conservé dans une reprise.

### R136 — Structure et réserves conservées

Le poste porté garde son identifiant, origine, structure, cartouches, chaleur et verrou thermique. Aucun soin, rechargement, réparation ou kit de construction n’est ajouté. À zéro point de structure, réparer avant de replier.

### R137 — Marche encombrée

Le portage limite la marche à 100 unités par seconde. Sprint, saut, tir, rechargement, grenade, outils, soin personnel et soutien matériel sont refusés jusqu’à la pose. Winter reste vulnérable. Les commandes du groupe et les passages normaux restent disponibles.

### R138 — Chaleur transportée

Le canon continue de refroidir de 14 points par seconde simulée pendant le transport. Le passage posé → porté ne double pas ce refroidissement dans la même image de simulation. Un menu suspend le temps ; aucun refroidissement gratuit pendant la pause.

### R139 — Pose anticipée au sol

E maintenu pendant deux secondes pose le poste à 62 unités devant le joueur. Une silhouette d’aperçu n’apparaît que pour une pose valide. La présence d’un acteur, d’un autre équipement, d’un volume solide, d’un seuil ou d’une commande trop proche interdit la pose.

### R140 — Limite de trois postes

Trois sentinelles déployées au maximum dans une salle. Un seul châssis porté. La pose libre ne fabrique pas un poste neuf : elle déplace celui transporté. Les sentinelles restent non solides selon la convention antérieure du moteur ; elles ne sont pas des caisses physiques poussables.

### R141 — Réactivation volontaire

La sentinelle se pose en veille et s’oriente dans le sens du regard de Winter. Sa structure, ses réserves et sa température restent conservées. La tablette est nécessaire pour la réactiver ; la pose ne provoque pas un tir immédiat gratuit.

### R142 — Transport entre salles

Le joueur peut franchir les portes ordinaires avec le châssis au sein de sa mission. Les contraintes habituelles de regroupement s’appliquent. L’embarquement dans le chargeur est refusé tant que le poste est porté. Le début d’une nouvelle mission réinitialise ce matériel local.

### R143 — Socle déplacé non recyclable

Bug Hunt conserve les socles déjà commandés même lorsque leur poste est ailleurs ou transporté. Le socle indique POSTE DÉPLACÉ. Il ne peut pas être réutilisé pour obtenir un second châssis avec la même identité.

### R144 — Ordre de position sur le sol

Un clic droit ou Y sous le pointeur désigne le sol ; Tab propose une sélection au clic gauche sans tir. La conversion de coordonnées utilise les pieds au sol, pas le décalage de visée ni l’accrochage d’un ennemi. Les bandes hors canevas ne sont pas une destination.

### R145 — Chemin connecté avant ordre

La cible doit appartenir au sol courant, rester à moins de 850 unités de Winter et être reliée au compagnon. Une grille bornée et des segments échantillonnés testent les cloisons : une destination libre mais inaccessible derrière une cloison fermée est refusée.

### R146 — Ralliement sans téléportation

O’Neal marche vers le point avec sa navigation et ses collisions, vitesse 200 unités par seconde. À moins de 22 unités, il tient la position et peut tirer selon ses réserves, portée et visibilité. Le marqueur passe de rejoindre à position tenue.

### R147 — Annulation et changement de pièce

Les ordres Suivre, Tenir ici, Couvrir et la relève annulent le ralliement précédent. Une transition efface un marqueur devenu étranger à la salle ; une reprise valide peut conserver le point courant. Un passage devenu impraticable conduit à tenir ici plutôt qu’à téléporter le compagnon.

### R148 — Contrat de mobilité strict

mobilityVersion=1, carriedSentry et buddy.rally sont exigés dans la reprise courante. Origine dans la mission, coordonnées, structure positive, état de veille et unicité sont validés. Un poste actif transporté, une identité doublée ou un point dans une autre salle est refusé.

### R149 — Interface et preuve de portage

La tablette affiche structure, chaleur et cartouches portées ; le HUD remplace l’arme par SENTINELLE TRANSPORTÉE. Le modèle montre le châssis porté et un aperçu de pose. Les captures 51 à 57 sont des scènes préparées puis actionnées, pas des images commerciales ni des parties humaines.

### R150 — Défense de mobilité instrumentée

Une défense Marine au fret atteint trente vagues avec achats normaux, construction, repli maintenu, marche puis pose, et ralliement d’O’Neal. La trace compte un transport à la vague 16 et un ralliement arrivé, sans ressources injectées. Elle ne prouve pas toutes les routes ou la difficulté humaine.

### R151 — Mobilier fragile identifié

Quatre familles seulement : caisses 140 PV, bureaux 110 PV, bancs 90 PV et amas de débris 70 PV. Le drapeau breakable s’applique à 82 placements existants : 76 en campagne et six dans Bug Hunt. Aucune nouvelle salle, coordonnée ou silhouette de famille n’est ajoutée.

### R152 — Commandes et murs protégés

Les props portant actionId, les objets non solides, les familles hors sélection, les murs et les cloisons payantes restent hors destruction. Briser du mobilier ne permet pas d’éviter une précondition, un achat d’ouverture ou un objectif de campagne.

### R153 — Définition immuable, état local

Chaque salle contient un registre structures indexé par les identifiants de son mobilier. Seuls les points de structure varient. La définition, le type, les coordonnées et l’identifiant demeurent inchangés ; deux parties ne partagent pas leurs dégâts.

### R154 — Premier impact unique

Un projectile de Winter, d’un garde, d’O’Neal ou d’une sentinelle s’arrête au premier corps rencontré. Le meuble touché perd sa structure ; la balle qui le détruit ne traverse pas aussi la brèche. Le projectile suivant profite du nouvel espace libre.

### R155 — Explosion et protection instantanée

Le souffle utilise les occultations présentes au début de l’explosion. Une protection qu’il détruit protège encore ce qui était derrière pour cette même détonation. Une autre explosion ultérieure peut franchir la brèche. Les mines partagent la règle ; les zones de souffle ne sont pas une physique volumétrique 3D.

### R156 — Corrosion par contact réel

Une flaque doit toucher l’emprise du meuble et posséder une ligne dégagée vers sa surface. La corrosion retire 18 PV par seconde simulée. Plusieurs flaques ne cumulent pas ce taux. Une flaque presque expirée ne contribue que pendant son temps restant.

### R157 — Griffe préparée, pas dégâts à travers

Soldier et Lurker peuvent frapper la première couverture fragile de leur axe, à proximité. La préparation dure 0,85 seconde avant 46 dégâts, puis 0,55 seconde de récupération. Le signal COUP DE GRIFFE est visible. Changer d’axe avant l’impact annule la préparation.

### R158 — Charge contre la couverture

Un Crusher arrêté par une couverture admissible sur son axe peut lui infliger 180 dégâts et poursuivre si le passage se libère. Les cloisons payantes et obstacles hors liste ne sont jamais cassés ainsi. Il ne supprime pas tous les murs de la carte.

### R159 — Couteau et pinces

Le coup de mêlée de Winter peut user la couverture proche devant lui : 22 dégâts, ou 125 dans le chargeur. Une cible occultée derrière le meuble ne reçoit pas le même coup. Les autres règles de portée, disponibilité et récupération restent celles de l’arme.

### R160 — Brèche partagée par tous

À zéro structure, le meuble laisse des débris non bloquants. Marche, navigation, ligne de vue, projectiles et positionnement de sentinelles consultent la même règle. Les chemins en cache sont invalidés à la rupture ; aucun déplacement instantané n’est utilisé.

### R161 — Dégâts et blessures sans traverser

La mêlée hostile et la collision offensive du Crusher doivent avoir une ligne dégagée vers leur cible. Le soin d’O’Neal et le transfert de cartouches demandent aussi un accès dégagé, en plus de la distance. Une cloison proche n’est plus ignorée par ces actions.

### R162 — Observation limitée au visible

I ouvre Équipement ; Examiner les couvertures visibles affiche le mobilier à 1 000 unités au maximum avec visibilité sur sa surface. Les débris restent consultables si visibles. Le panneau ne révèle pas le mobilier caché derrière la première protection et ne restaure aucune structure.

### R163 — Pas de butin ni reconstruction

Une caisse détruite ne donne rien. Ni crédit ni cartouche ne sont créés ; les statistiques de neutralisations ne changent pas. Les kits de réparation de sentinelle ne réparent pas le mobilier. Le début d’une nouvelle mission ou défense reconstruit son décor initial.

### R164 — Persistance de la détérioration

Les retours entre salles, les reprises, les exports et les vagues conservent les points restants et les ruptures. Seule la salle active subit la corrosion ; les menus suspendent le temps. Les fissures et particules sont un rendu procédural, pas des fragments physiques poussables.

### R165 — Registre de structure strict

environmentVersion=1 est requis en 0.9. Chaque prop admissible de chaque salle chargée possède exactement un objet {hp}. Identifiant étranger, registre absent, points non finis, négatifs ou supérieurs au plafond, champ inattendu ou cible de griffe étrangère font refuser l’import.

### R166 — Preuves de décor séparées

Les captures 58 à 64 utilisent les pièces et meubles originaux avec acteurs préparés. Tirs, traversée, menus, export et import sont réellement actionnés. Le scénario de griffe et la flaque sont des fixtures annoncées. Un parcours de défense distinct utilise ses seules ressources normales pour casser et traverser une caisse avant trente vagues.

## 01 — Distress

Chronique : main ; point de vue : Winter.

Le Sulaco ne répond plus. O’Neal attend près du sas. Retrouvez Rhino avant que la liaison avec le Sephora ne cède.

Préconditions : keyes, recorder, purge.

### Ombilical du Sephora — `acm-01-01`

acm-01-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : transfer

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Hypersommeil éventré | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-01-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Pupitre de commande · console | 432 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Conduit de service · vent | 756 / 0.13 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Râtelier militaire · rack | 1026 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Balise de chantier · lamp | 1368 / 0.13 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Garde-corps · rail | 720 / 0.93 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Garde-corps · rail | 1260 / 0.93 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-01-01. | supply-acm-01-01

#### Rencontres

Aucune.

### Hypersommeil éventré — `acm-01-02`

acm-01-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cryo

Voie latérale .62 continue.

#### Seuils

S1 | door | Ombilical du Sephora | 88 / 0.62 | Libre

S2 | door | Salle de navigation | 1412 / 0.62 | keyes

S3 | lift | Vestiaire de Rhino | 780 / 0.62 | Libre

#### Interactions

A1 · keyes | Découper la résine autour de Keyes | cut | 840 / 0.62 | 2.4 s | Aucune

#### Props : x/z, dimensions et collision

Caisson de stase · cryo | 255 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Caisson de stase · cryo | 570 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Caisson de stase · cryo | 915 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Caisson de stase · cryo | 1200 / 0.85 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Corps au sol · body | 810 / 0.34 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Nappe de résine · resin | 1080 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Conduit de service · vent | 1320 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

#### Rencontres

acm-01-02-e0 | Soldier | 760 / 0.62 | 0 s | —

### Salle de navigation — `acm-01-03`

acm-01-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : navigation

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Hypersommeil éventré | 88 / 0.62 | Libre

S2 | door | Soute de transfert | 2012 / 0.62 | keyes, recorder

S3 | lift | Vestiaire de Rhino | 1092 / 0.12 | Libre

#### Interactions

A1 · recorder | Récupérer l’enregistreur du Sulaco | record | 1530 / 0.22 | 1.4 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 441 / 0.14 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Siège de poste · chair | 504 / 0.36 | 51 × 0.1 × 64 | Décor non bloquant | Face à un bureau ou une console. | —

Pupitre de commande · console | 966 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Baie réseau · server | 1218 / 0.14 | 86 × 0.1 × 172 | Décor non bloquant | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil. | —

Baie réseau · server | 1428 / 0.14 | 86 × 0.1 × 172 | Décor non bloquant | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil. | —

Râtelier militaire · rack | 672 / 0.86 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1743 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-01-03-e0 | Lurker | 880 / 0.65 | 0 s | —

acm-01-03-e1 | Soldier | 1190 / 0.28 | 0 s | —

acm-01-03-e2 | Soldier | 1470 / 0.84 | 6 s | —

### Soute de transfert — `acm-01-04`

acm-01-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cargo

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Salle de navigation | 88 / 0.62 | Libre

#### Interactions

A1 · purge | Purger la soute | purge | 1480 / 0.2 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 432 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Caisse de transport · crate | 828 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Palette de fret · pallet | 1080 / 0.17 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Caisse de transport · crate | 1224 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1512 / 0.13 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Conduit de service · vent | 684 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 1476 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-01-04-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-01-04-e1 | Soldier | 1150 / 0.3 | 0 s | —

acm-01-04-e2 | Spitter | 1470 / 0.84 | 6 s | —

### Vestiaire de Rhino — `acm-01-05`

acm-01-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : locker

Voie latérale .62 continue.

#### Seuils

S1 | lift | Hypersommeil éventré | 88 / 0.62 | Libre

S2 | lift | Salle de navigation | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-0 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-01-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Vestiaire · locker | 248 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Vestiaire · locker | 484 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Banc de service · bench | 767 / 0.12 | 128 × 0.12 × 50 | Fragile · 90 PV → débris non bloquants à zéro | Mobilier en rive de salle, passage arrière maintenu. | —

Râtelier militaire · rack | 991 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-0. | archive-0

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-01-05. | supply-acm-01-05

#### Rencontres

Aucune.

## 02 — Battle for Sulaco

Chronique : main ; point de vue : Winter.

Des soldats de Weyland-Yutani ont pris le Sulaco. Bella est isolée dans les secteurs de quarantaine. Passez par les ateliers.

Préconditions : freight, bella, turret.

### Voie de fret — `acm-02-01`

acm-02-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cargo

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Atelier du chargeur | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-02-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 432 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Caisse de transport · crate | 828 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Palette de fret · pallet | 1080 / 0.17 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Caisse de transport · crate | 1224 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1512 / 0.13 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Conduit de service · vent | 684 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 1476 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-02-01. | supply-acm-02-01

#### Rencontres

acm-02-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

### Atelier du chargeur — `acm-02-02`

acm-02-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : workshop

Voie latérale .62 continue.

#### Seuils

S1 | door | Voie de fret | 88 / 0.62 | Libre

S2 | door | Quarantaine de Bella | 1412 / 0.62 | freight

S3 | lift | Niche de maintenance | 780 / 0.62 | Libre

#### Interactions

A1 · freight | Déverrouiller la porte de fret | power | 1120 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 360 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Râtelier militaire · rack | 705 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Générateur · generator | 1050 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Caisse de transport · crate | 1230 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1290 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 480 / 0.86 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

#### Rencontres

acm-02-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s | —

### Quarantaine de Bella — `acm-02-03`

acm-02-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : quarantine

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Atelier du chargeur | 88 / 0.62 | Libre

S2 | door | Passerelle occupée | 2012 / 0.62 | freight, bella

S3 | lift | Niche de maintenance | 1092 / 0.12 | Libre

#### Interactions

A1 · bella | Libérer Bella de la quarantaine | rescue | 1450 / 0.24 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Lit de soins · bed | 525 / 0.14 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Poste médical · medical | 966 / 0.13 | 105 × 0.12 × 94 | Décor non bloquant | Soin et munitions à usage unique par visite de campagne. | —

Lit de soins · bed | 1365 / 0.85 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Nappe de résine · resin | 1638 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Œuf ouvert · egg | 1596 / 0.3 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Conduit de service · vent | 1806 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-02-03-e0 | Facehugger | 880 / 0.65 | 0 s | —

acm-02-03-e1 | Facehugger | 1190 / 0.28 | 0 s | —

acm-02-03-e2 | Soldier | 1470 / 0.84 | 6 s | —

### Passerelle occupée — `acm-02-04`

acm-02-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : bridge

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Quarantaine de Bella | 88 / 0.62 | Libre

#### Interactions

A1 · turret | Couper la tourelle de la passerelle | power | 1460 / 0.18 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Pupitre de commande · console | 360 / 0.14 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pupitre de commande · console | 720 / 0.14 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Siège de poste · chair | 774 / 0.35 | 51 × 0.1 × 64 | Décor non bloquant | Face à un bureau ou une console. | —

Baie réseau · server | 1224 / 0.14 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Bureau de dossier · desk | 1386 / 0.84 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Conduit de service · vent | 1494 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

#### Rencontres

acm-02-04-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-02-04-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s | —

acm-02-04-e2 | Soldat Weyland-Yutani | 1510 / 0.82 | 6 s | —

### Niche de maintenance — `acm-02-05`

acm-02-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : maintenance

Voie latérale .62 continue.

#### Seuils

S1 | lift | Atelier du chargeur | 88 / 0.62 | Libre

S2 | lift | Quarantaine de Bella | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-1 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-02-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 283 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Générateur · generator | 519 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Armoire de consommables · cabinet | 767 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Râtelier militaire · rack | 1003 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-1. | archive-1

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-02-05. | supply-acm-02-05

#### Rencontres

Aucune.

## 03 — Sulaco Falls

Chronique : main ; point de vue : Winter.

La coque s’ouvre. Reid prépare une navette. Réarmez les attaches d’urgence, puis gagnez le pont d’envol.

Préconditions : release, coolant, boarding.

### Coursive sous dépression — `acm-03-01`

acm-03-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : damaged

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Commande des attaches | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-03-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Débris structurels · debris | 360 / 0.13 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Conduit de service · vent | 684 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Débris structurels · debris | 936 / 0.84 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Corps au sol · body | 1116 / 0.3 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Nappe de résine · resin | 1404 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Balise de chantier · lamp | 1530 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-03-01. | supply-acm-03-01

#### Rencontres

acm-03-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

### Commande des attaches — `acm-03-02`

acm-03-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : generator

Voie latérale .62 continue.

#### Seuils

S1 | door | Coursive sous dépression | 88 / 0.62 | Libre

S2 | door | Galerie en feu | 1412 / 0.62 | release

S3 | lift | Infirmerie de secours | 780 / 0.62 | Libre

#### Interactions

A1 · release | Armer le largage d’urgence | timer | 1000 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Générateur · generator | 300 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 570 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Baie réseau · server | 840 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pompe verticale · pipe | 1110 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Armoire de consommables · cabinet | 1275 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

#### Rencontres

acm-03-02-e0 | Soldier | 760 / 0.62 | 0 s | —

### Galerie en feu — `acm-03-03`

acm-03-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : damaged

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Commande des attaches | 88 / 0.62 | Libre

S2 | door | Pont d’envol | 2012 / 0.62 | release, coolant

S3 | lift | Infirmerie de secours | 1092 / 0.12 | Libre

#### Interactions

A1 · coolant | Fermer la conduite en rupture | valve | 1560 / 0.2 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Débris structurels · debris | 420 / 0.13 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Conduit de service · vent | 798 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Débris structurels · debris | 1092 / 0.84 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Corps au sol · body | 1302 / 0.3 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Nappe de résine · resin | 1638 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Balise de chantier · lamp | 1785 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-03-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-03-03-e1 | Soldier | 1190 / 0.28 | 0 s | —

### Pont d’envol — `acm-03-04`

acm-03-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : flight

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Galerie en feu | 88 / 0.62 | Libre

#### Interactions

A1 · boarding | Ouvrir la rampe de la navette | power | 1320 / 0.3 | 1.5 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Manifold de carburant · fuel | 396 / 0.13 | 84 × 0.1 × 96 | Décor non bloquant | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette. | —

Caisse de transport · crate | 774 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Palette de fret · pallet | 1080 / 0.17 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Garde-corps · rail | 1386 / 0.91 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 1458 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-03-04-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-03-04-e1 | Spitter | 1190 / 0.28 | 0 s | —

### Infirmerie de secours — `acm-03-05`

acm-03-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : medical

Voie latérale .62 continue.

#### Seuils

S1 | lift | Commande des attaches | 88 / 0.62 | Libre

S2 | lift | Galerie en feu | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-2 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-03-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Lit de soins · bed | 271 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Lit de soins · bed | 543 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Armoire de consommables · cabinet | 802 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Poste médical · medical | 956 / 0.13 | 105 × 0.12 × 94 | Décor non bloquant | Soin et munitions à usage unique par visite de campagne. | —

Corps au sol · body | 460 / 0.32 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-2. | archive-2

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-03-05. | supply-acm-03-05

#### Rencontres

Aucune.

## 04 — No Hope in Hadley’s

Chronique : main ; point de vue : Winter.

Cruz rassemble les survivants dans les opérations. Rétablissez le courant. Il faut une ligne de défense avant la nuit.

Préconditions : grid, sentry, defence.

### Rue des opérations — `acm-04-01`

acm-04-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : street

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Relais électrique | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-04-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Débris structurels · debris | 432 / 0.23 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Grillage de chantier · fence | 720 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Caisse de transport · crate | 1062 / 0.86 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1260 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Grillage de chantier · fence | 1494 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-04-01. | supply-acm-04-01

#### Rencontres

acm-04-01-e0 | Soldier | 880 / 0.65 | 0 s | —

### Relais électrique — `acm-04-02`

acm-04-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : generator

Voie latérale .62 continue.

#### Seuils

S1 | door | Rue des opérations | 88 / 0.62 | Libre

S2 | door | Couloir de défense | 1412 / 0.62 | grid

S3 | lift | Magasin de la colonie | 780 / 0.62 | Libre

S4 | stairs | Escalier des opérations | 550 / 0.62 | Libre

#### Interactions

A1 · grid | Rétablir le réseau local | power | 1040 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Générateur · generator | 300 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 570 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Baie réseau · server | 840 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pompe verticale · pipe | 1110 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Armoire de consommables · cabinet | 1275 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

#### Rencontres

acm-04-02-e0 | Lurker | 760 / 0.62 | 0 s | —

### Couloir de défense — `acm-04-03`

acm-04-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : defence

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Relais électrique | 88 / 0.62 | Libre

S2 | door | Garage barricadé | 2012 / 0.62 | grid, sentry

S3 | lift | Magasin de la colonie | 1092 / 0.12 | Libre

S4 | stairs | Toit des échangeurs | 480 / 0.12 | Libre

#### Interactions

A1 · sentry | Installer la sentinelle | sentry | 620 / 0.6 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 483 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Râtelier militaire · rack | 819 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1218 / 0.25 | 94 × 0.13 × 72 | Décor non bloquant | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil. | —

Conduit de service · vent | 1512 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 1806 / 0.85 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Sentinelle · sentry | 620 / 0.6 | 85 × 0.1 × 90 | Décor non bloquant | Support visuel de l’interaction sentry. | —

#### Rencontres

acm-04-03-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-04-03-e1 | Spitter | 1190 / 0.28 | 0 s | —

### Garage barricadé — `acm-04-04`

acm-04-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : garage

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Couloir de défense | 88 / 0.62 | Libre

#### Interactions

A1 · defence | Verrouiller le périmètre | defend | 1490 / 0.25 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 396 / 0.22 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Râtelier militaire · rack | 684 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Palette de fret · pallet | 900 / 0.13 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Caisse de transport · crate | 1170 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1422 / 0.12 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-04-04-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-04-04-e1 | Soldier | 1190 / 0.28 | 0 s | —

acm-04-04-e2 | Lurker | 1470 / 0.84 | 6 s | —

acm-04-04-e3 | Spitter | 1660 / 0.5 | 7 s | —

### Magasin de la colonie — `acm-04-05`

acm-04-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : shop

Voie latérale .62 continue.

#### Seuils

S1 | lift | Relais électrique | 88 / 0.62 | Libre

S2 | lift | Couloir de défense | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-3 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-04-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Armoire de consommables · cabinet | 236 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Bureau de dossier · desk | 472 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Râtelier militaire · rack | 732 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Vestiaire · locker | 991 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-3. | archive-3

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-04-05. | supply-acm-04-05

#### Rencontres

Aucune.

### Escalier des opérations — `acm-04-06`

acm-04-06 · LATÉRAL · 1420 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : stairs

Voie latérale .62 continue.

#### Seuils

S1 | stairs | Relais électrique | 88 / 0.62 | Libre

S2 | stairs | Toit des échangeurs | 1332 / 0.62 | Libre

#### Interactions

A1 · archive-roof | Lire le plan d’évacuation | archive | 800 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Garde-corps · rail | 341 / 0.12 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 582 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Garde-corps · rail | 852 / 0.12 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Armoire de consommables · cabinet | 1179 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Enregistreur de terrain · archive | 800 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-roof. | archive-roof

#### Rencontres

Aucune.

### Toit des échangeurs — `acm-04-07`

acm-04-07 · PROFONDEUR · 1980 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : rooftop

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | stairs | Escalier des opérations | 88 / 0.62 | Libre

S2 | stairs | Couloir de défense | 1892 / 0.62 | grid

#### Interactions

A1 · supply-roof | Ouvrir le casier des techniciens | supply | 1250 / 0.25 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Échangeur de toiture · turbine | 436 / 0.23 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente. | —

Pompe verticale · pipe | 772 / 0.14 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Échangeur de toiture · turbine | 1188 / 0.85 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente. | —

Garde-corps · rail | 1505 / 0.92 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 1683 / 0.13 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 1250 / 0.25 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-roof. | supply-roof

#### Rencontres

acm-04-07-e0 | Lurker | 1500 / 0.78 | 0 s | —

## 05 — The Raven

Chronique : main ; point de vue : Winter.

Winter reprend conscience sans son arme. Quelque chose de massif circule derrière les murs. Marchez doucement. Les formes pâles écoutent. Trois cloisons de secours séparent les pompes du dépôt : elles ralentiront votre poursuivant.

Préconditions : pump, gear, loader, raven-seal-1, raven-seal-2, raven-seal-3.

### Cocon sous Hadley — `acm-05-01`

acm-05-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : hive

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Salle des pompes | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-05-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Nappe de résine · resin | 360 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Nappe de résine · resin | 684 / 0.84 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Œuf ouvert · egg | 990 / 0.17 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Œuf ouvert · egg | 1170 / 0.86 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Nappe de résine · resin | 1458 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Corps au sol · body | 738 / 0.31 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Nappe de résine · resin | 680 / 0.1 | 120 × 0.1 × 125 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-05-01. | supply-acm-05-01

#### Rencontres

acm-05-01-e0 | Boiler | 880 / 0.18 | 0 s | —

### Salle des pompes — `acm-05-02`

acm-05-02 · PROFONDEUR · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : pump

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Cocon sous Hadley | 88 / 0.62 | Libre

S2 | lift | Conduit de dérivation | 780 / 0.62 | Libre

S3 | door | Écluse de maintenance | 1412 / 0.62 | pump

#### Interactions

A1 · pump | Mettre la pompe en marche | lure | 500 / 0.62 | 1.2 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 345 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Générateur · generator | 630 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 930 / 0.87 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Pompe verticale · pipe | 1215 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Œuf ouvert · egg | 990 / 0.12 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

#### Rencontres

acm-05-02-e0 | Boiler | 760 / 0.18 | 0 s | —

acm-05-02-e1 | Boiler | 1050 / 0.88 | 0 s | —

acm-05-02-e2 | Boiler | 1200 / 0.3 | 6 s | —

### Dépôt d’O’Neal — `acm-05-03`

acm-05-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : workshop

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Hangar du chargeur | 2012 / 0.62 | pump, gear, raven-seal-1, raven-seal-2, raven-seal-3

S2 | lift | Conduit de dérivation | 1092 / 0.12 | Libre

S3 | door | Vestibule du monte-charge | 88 / 0.62 | Libre

#### Interactions

A1 · gear | Récupérer le paquetage | gear | 560 / 0.64 | 1.2 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 504 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Râtelier militaire · rack | 987 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Générateur · generator | 1470 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Caisse de transport · crate | 1722 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1806 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 672 / 0.86 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-05-03-e0 | Soldier | 880 / 0.65 | 0 s | —

### Hangar du chargeur — `acm-05-04`

acm-05-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : loaderbay

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Dépôt d’O’Neal | 88 / 0.62 | raven-seal-1, raven-seal-2, raven-seal-3

#### Interactions

A1 · loader | Monter dans le chargeur | loader | 460 / 0.64 | 1.6 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Râtelier militaire · rack | 360 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 702 / 0.22 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1044 / 0.12 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Caisse de transport · crate | 1350 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1530 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Chargeur de manutention · loader | 460 / 0.64 | 135 × 0.12 × 160 | Décor non bloquant | Support visuel de l’interaction loader. | —

#### Rencontres

acm-05-04-e0 | Raven | 880 / 0.65 | 0 s | —

### Conduit de dérivation — `acm-05-05`

acm-05-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : drain

Voie latérale .62 continue.

#### Seuils

S1 | lift | Salle des pompes | 88 / 0.62 | Libre

S2 | lift | Dépôt d’O’Neal | 1092 / 0.62 | raven-seal-1, raven-seal-2, raven-seal-3

#### Interactions

A1 · archive-4 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-05-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 260 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Nappe de résine · resin | 507 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Conduit de service · vent | 743 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pompe verticale · pipe | 979 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-4. | archive-4

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-05-05. | supply-acm-05-05

#### Rencontres

Aucune.

### Écluse de maintenance — `acm-05-06`

acm-05-06 · LATÉRAL · 1460 unités · niveau 0 · parcours principal

Poursuite du Raven, fermeture persistante de la cloison locale.

Fonction : floodgate

Voie latérale .62 continue.

#### Seuils

S1 | door | Salle des pompes | 88 / 0.62 | Libre

S2 | door | Passerelle du collecteur | 1372 / 0.62 | pump, raven-seal-1

#### Interactions

A1 · raven-seal-1 | Fermer la cloison 1 derrière Winter | seal | 1200 / 0.62 | 0.65 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 321 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Nappe de résine · resin | 599 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Pompe verticale · pipe | 920 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Balise de chantier · lamp | 1212 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

#### Rencontres

Aucune.

### Passerelle du collecteur — `acm-05-07`

acm-05-07 · PROFONDEUR · 1820 unités · niveau 0 · parcours principal

Poursuite du Raven, fermeture persistante de la cloison locale.

Fonction : collector

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Écluse de maintenance | 88 / 0.62 | Libre

S2 | door | Vestibule du monte-charge | 1732 / 0.62 | pump, raven-seal-1, raven-seal-2

#### Interactions

A1 · raven-seal-2 | Fermer la cloison 2 derrière Winter | seal | 1560 / 0.62 | 0.65 s | Aucune

#### Props : x/z, dimensions et collision

Garde-corps · rail | 328 / 0.12 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Pompe verticale · pipe | 619 / 0.14 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Garde-corps · rail | 983 / 0.91 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Pompe verticale · pipe | 1238 / 0.87 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Garde-corps · rail | 1511 / 0.12 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Nappe de résine · resin | 1090 / 0.1 | 120 × 0.1 × 125 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

Aucune.

### Vestibule du monte-charge — `acm-05-08`

acm-05-08 · LATÉRAL · 1440 unités · niveau 0 · parcours principal

Poursuite du Raven, fermeture persistante de la cloison locale.

Fonction : lift

Voie latérale .62 continue.

#### Seuils

S1 | door | Passerelle du collecteur | 88 / 0.62 | Libre

S2 | door | Dépôt d’O’Neal | 1352 / 0.62 | pump, raven-seal-1, raven-seal-2, raven-seal-3

#### Interactions

A1 · raven-seal-3 | Fermer la cloison 3 derrière Winter | seal | 1180 / 0.62 | 0.65 s | Aucune

#### Props : x/z, dimensions et collision

Garde-corps · rail | 288 / 0.11 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Générateur · generator | 576 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 893 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Garde-corps · rail | 1195 / 0.94 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

Aucune.

## 06 — For Bella

Chronique : main ; point de vue : Winter.

Il faut atteindre les installations de Weyland-Yutani. Le manifeste du prisonnier et les dossiers médicaux se trouvent au-delà du périmètre.

Préconditions : gate, manifest, lab-entry.

### Périphérie dévastée — `acm-06-01`

acm-06-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : street

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Poste de surveillance | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-06-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Débris structurels · debris | 432 / 0.23 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Grillage de chantier · fence | 720 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Caisse de transport · crate | 1062 / 0.86 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1260 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Grillage de chantier · fence | 1494 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-06-01. | supply-acm-06-01

#### Rencontres

acm-06-01-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-06-01-e1 | Spitter | 1190 / 0.28 | 0 s | —

### Poste de surveillance — `acm-06-02`

acm-06-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : security

Voie latérale .62 continue.

#### Seuils

S1 | door | Périphérie dévastée | 88 / 0.62 | Libre

S2 | door | Bâtiment des manifestes | 1412 / 0.62 | gate

S3 | lift | Remise du chantier | 780 / 0.62 | Libre

#### Interactions

A1 · gate | Ouvrir l’accès du périmètre | cut | 1080 / 0.62 | 2.2 s | Aucune

#### Props : x/z, dimensions et collision

Baie réseau · server | 300 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pupitre de commande · console | 585 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Râtelier militaire · rack | 855 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1155 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1275 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-06-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s | —

### Bâtiment des manifestes — `acm-06-03`

acm-06-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : office

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Poste de surveillance | 88 / 0.62 | Libre

S2 | door | Approche du laboratoire | 2012 / 0.62 | gate, manifest

S3 | lift | Remise du chantier | 1092 / 0.12 | Libre

#### Interactions

A1 · manifest | Copier le manifeste des prisonniers | record | 1510 / 0.22 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 462 / 0.13 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Siège de poste · chair | 525 / 0.34 | 51 × 0.1 × 64 | Décor non bloquant | Face à un bureau ou une console. | —

Armoire de consommables · cabinet | 924 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Bureau de dossier · desk | 1302 / 0.84 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Baie réseau · server | 1722 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-06-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-06-03-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s | —

### Approche du laboratoire — `acm-06-04`

acm-06-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : airlock

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Bâtiment des manifestes | 88 / 0.62 | Libre

#### Interactions

A1 · lab-entry | Déverrouiller le sas du laboratoire | power | 1450 / 0.22 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Conduit de service · vent | 414 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pupitre de commande · console | 792 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pompe verticale · pipe | 1170 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Balise de chantier · lamp | 1512 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-06-04-e0 | Lurker | 880 / 0.65 | 0 s | —

acm-06-04-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s | —

### Remise du chantier — `acm-06-05`

acm-06-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : workshop

Voie latérale .62 continue.

#### Seuils

S1 | lift | Poste de surveillance | 88 / 0.62 | Libre

S2 | lift | Bâtiment des manifestes | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-5 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-06-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 283 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Râtelier militaire · rack | 555 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Générateur · generator | 826 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Caisse de transport · crate | 968 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1015 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 378 / 0.86 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-5. | archive-5

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-06-05. | supply-acm-06-05

#### Rencontres

Aucune.

## 07 — One Bullet

Chronique : main ; point de vue : Winter.

Les laboratoires sont encore occupés. Neutralisez les alarmes, trouvez une aide pour Bella, puis coupez les trois cellules du module. Le blindé de la cour interdit le passage vers les cellules.

Préconditions : alarm, diagnostic, cell-a, cell-b, cell-c, shutdown, crane-drop, apc-destroyed.

### Contrôle de sécurité — `acm-07-01`

acm-07-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : security

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Salle d’examen | 1712 / 0.62 | alarm

#### Interactions

A1 · alarm | Neutraliser le relais d’alarme | alarm | 1090 / 0.24 | 1.8 s | Aucune

A2 · supply-acm-07-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Baie réseau · server | 360 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pupitre de commande · console | 702 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Râtelier militaire · rack | 1026 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1386 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1530 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-07-01. | supply-acm-07-01

#### Rencontres

acm-07-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

### Salle d’examen — `acm-07-02`

acm-07-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : medical

Voie latérale .62 continue.

#### Seuils

S1 | door | Contrôle de sécurité | 88 / 0.62 | Libre

S2 | lift | Local des techniciens | 780 / 0.62 | Libre

S3 | door | Cour du portique | 1412 / 0.62 | alarm, diagnostic

#### Interactions

A1 · diagnostic | Consulter le diagnostic de Bella | medical | 1050 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Lit de soins · bed | 345 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Lit de soins · bed | 690 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Armoire de consommables · cabinet | 1020 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Poste médical · medical | 1215 / 0.13 | 105 × 0.12 × 94 | Décor non bloquant | Soin et munitions à usage unique par visite de campagne. | —

Corps au sol · body | 585 / 0.32 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

#### Rencontres

acm-07-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s | —

### Cellules du module — `acm-07-03`

acm-07-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : reactor

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Commande de coupure | 2012 / 0.62 | alarm, diagnostic, cell-a, cell-b, cell-c, crane-drop, apc-destroyed

S2 | lift | Local des techniciens | 1092 / 0.12 | Libre

S3 | door | Cour du portique | 88 / 0.62 | Libre

#### Interactions

A1 · cell-a | Isoler la cellule A | power | 570 / 0.2 | 1.4 s | Aucune

A2 · cell-b | Isoler la cellule B | power | 1080 / 0.85 | 1.4 s | Aucune

A3 · cell-c | Isoler la cellule C | power | 1650 / 0.2 | 1.4 s | Aucune

#### Props : x/z, dimensions et collision

Générateur · generator | 378 / 0.12 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 693 / 0.12 | 80 × 0.11 × 146 | Décor non bloquant | Alimentation des conduites en plafond, jamais suspendue dans le vide. Volume de collision retiré : dégagement du poste ou du seuil. | —

Générateur · generator | 1113 / 0.88 | 140 × 0.12 × 104 | Décor non bloquant | Machine fixe ; commande déportée accessible. Volume de collision retiré : dégagement du poste ou du seuil. | —

Baie réseau · server | 1533 / 0.12 | 86 × 0.1 × 172 | Décor non bloquant | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil. | —

Pompe verticale · pipe | 1806 / 0.88 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-07-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-07-03-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s | —

acm-07-03-e2 | Facehugger | 1470 / 0.84 | 6 s | —

### Commande de coupure — `acm-07-04`

acm-07-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : control

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Cellules du module | 88 / 0.62 | apc-destroyed

#### Interactions

A1 · shutdown | Couper le module | shutdown | 1420 / 0.2 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 378 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Pupitre de commande · console | 720 / 0.12 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Baie réseau · server | 1134 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Baie réseau · server | 1476 / 0.12 | 86 × 0.1 × 172 | Décor non bloquant | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil. | —

#### Rencontres

acm-07-04-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-07-04-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s | —

### Local des techniciens — `acm-07-05`

acm-07-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : maintenance

Voie latérale .62 continue.

#### Seuils

S1 | lift | Salle d’examen | 88 / 0.62 | Libre

S2 | lift | Cellules du module | 1092 / 0.62 | apc-destroyed

#### Interactions

A1 · archive-6 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-07-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 283 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Générateur · generator | 519 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Armoire de consommables · cabinet | 767 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Râtelier militaire · rack | 1003 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-6. | archive-6

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-07-05. | supply-acm-07-05

#### Rencontres

Aucune.

### Cour du portique — `acm-07-06`

acm-07-06 · PROFONDEUR · 2540 unités · niveau 0 · parcours principal

Deux fûts destructibles, déplacement réel de l’APC puis largage conditionnel.

Fonction : craneyard

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Salle d’examen | 88 / 0.62 | Libre

S2 | door | Cellules du module | 2452 / 0.62 | alarm, diagnostic, crane-drop, apc-destroyed

S3 | lift | Galerie de maintenance du portique | 730 / 0.12 | Libre

#### Interactions

A1 · crane-drop | Larguer la charge au-dessus de l’APC | crane | 2270 / 0.2 | 1.1 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 483 / 0.27 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Grillage de chantier · fence | 813 / 0.93 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Caisse de transport · crate | 1092 / 0.24 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Caisse de transport · crate | 1575 / 0.88 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Garde-corps · rail | 2159 / 0.94 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 2320 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-07-06-e0 | Soldat Weyland-Yutani | 920 / 0.25 | 0 s | —

acm-07-06-e1 | Soldat Weyland-Yutani | 1720 / 0.87 | 6 s | —

### Galerie de maintenance du portique — `acm-07-07`

acm-07-07 · LATÉRAL · 1360 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : control

Voie latérale .62 continue.

#### Seuils

S1 | lift | Cour du portique | 88 / 0.62 | Libre

#### Interactions

A1 · supply-crane | Récupérer les munitions de maintenance | supply | 420 / 0.62 | 0.8 s | Aucune

A2 · archive-crane | Lire le plan du portique | archive | 900 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 286 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Pupitre de commande · console | 544 / 0.12 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Baie réseau · server | 857 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Baie réseau · server | 1115 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Poste médical · medical | 420 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-crane. | supply-crane

Enregistreur de terrain · archive | 900 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-crane. | archive-crane

#### Rencontres

Aucune.

## 08 — Rampart

Chronique : main ; point de vue : Winter.

Le prisonnier a été déplacé vers le Derelict. Traversez le module de sécurité et suivez les traces du transfert.

Préconditions : security, trace, hicks.

### Pied du module de sécurité — `acm-08-01`

acm-08-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : airlock

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Contrôle de détention | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-08-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Conduit de service · vent | 414 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pupitre de commande · console | 792 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pompe verticale · pipe | 1170 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Balise de chantier · lamp | 1512 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-08-01. | supply-acm-08-01

#### Rencontres

acm-08-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

### Contrôle de détention — `acm-08-02`

acm-08-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : security

Voie latérale .62 continue.

#### Seuils

S1 | door | Pied du module de sécurité | 88 / 0.62 | Libre

S2 | door | Coursive du Derelict | 1412 / 0.62 | security

S3 | lift | Annexe de surveillance | 780 / 0.62 | Libre

#### Interactions

A1 · security | Couper le verrou de détention | power | 1040 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Baie réseau · server | 300 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pupitre de commande · console | 585 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Râtelier militaire · rack | 855 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1155 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1275 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-08-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s | —

### Coursive du Derelict — `acm-08-03`

acm-08-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : derelict

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Contrôle de détention | 88 / 0.62 | Libre

S2 | door | Cellule de transfert | 2012 / 0.62 | security, trace

S3 | lift | Annexe de surveillance | 1092 / 0.12 | Libre

S4 | lift | Poste d’observation des cellules | 600 / 0.12 | Libre

#### Interactions

A1 · trace | Identifier le transfert du prisonnier | record | 1510 / 0.2 | 1.8 s | Aucune

#### Props : x/z, dimensions et collision

Nappe de résine · resin | 399 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Œuf ouvert · egg | 693 / 0.22 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Nappe de résine · resin | 1050 / 0.86 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Œuf ouvert · egg | 1344 / 0.84 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Nappe de résine · resin | 1680 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Balise de chantier · lamp | 1806 / 0.85 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Nappe de résine · resin | 1090 / 0.1 | 120 × 0.1 × 125 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Nappe de résine · resin | 1500 / 0.1 | 120 × 0.1 × 125 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Nappe de résine · resin | 1910 / 0.1 | 120 × 0.1 × 125 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-08-03-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-08-03-e1 | Spitter | 1190 / 0.28 | 0 s | —

acm-08-03-e2 | Facehugger | 1470 / 0.84 | 6 s | —

### Cellule de transfert — `acm-08-04`

acm-08-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cell

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Coursive du Derelict | 88 / 0.62 | Libre

S2 | lift | Poste d’observation des cellules | 900 / 0.12 | Libre

#### Interactions

A1 · hicks | Libérer Hicks | rescue | 1430 / 0.26 | 2.4 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Grillage de chantier · fence | 396 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Lit de soins · bed | 756 / 0.14 | 155 × 0.14 × 63 | Décor non bloquant | Tête au moniteur ; couloir latéral de brancard. Volume de collision retiré : dégagement du poste ou du seuil. | —

Grillage de chantier · fence | 1080 / 0.12 | 170 × 0.07 × 165 | Décor non bloquant | Séparation industrielle ; aucune clôture au milieu d’un salon. Volume de collision retiré : dégagement du poste ou du seuil. | —

Pupitre de commande · console | 1440 / 0.84 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-08-04-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-08-04-e1 | Soldier | 1190 / 0.28 | 0 s | —

### Annexe de surveillance — `acm-08-05`

acm-08-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : security

Voie latérale .62 continue.

#### Seuils

S1 | lift | Contrôle de détention | 88 / 0.62 | Libre

S2 | lift | Coursive du Derelict | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-7 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-08-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Baie réseau · server | 236 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pupitre de commande · console | 460 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Râtelier militaire · rack | 673 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 909 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1003 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-7. | archive-7

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-08-05. | supply-acm-08-05

#### Rencontres

Aucune.

### Poste d’observation des cellules — `acm-08-06`

acm-08-06 · PROFONDEUR · 1640 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : observation

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | lift | Coursive du Derelict | 88 / 0.62 | Libre

S2 | lift | Cellule de transfert | 1552 / 0.62 | security, trace

#### Interactions

A1 · archive-prison | Copier les mouvements du détenu | archive | 990 / 0.2 | 0.9 s | Aucune

#### Props : x/z, dimensions et collision

Pupitre de commande · console | 328 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Bureau de dossier · desk | 705 / 0.14 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Siège de poste · chair | 738 / 0.34 | 51 × 0.1 × 64 | Décor non bloquant | Face à un bureau ou une console. | —

Baie réseau · server | 1033 / 0.14 | 86 × 0.1 × 172 | Décor non bloquant | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil. | —

Armoire de consommables · cabinet | 1328 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Enregistreur de terrain · archive | 990 / 0.2 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-prison. | archive-prison

#### Rencontres

acm-08-06-e0 | Soldat Weyland-Yutani | 1240 / 0.76 | 0 s | —

## 09 — Hope in Hadley’s

Chronique : main ; point de vue : Winter.

Les survivants sont encerclés. Rejoignez les opérations, ouvrez le garage et préparez le départ de Reid.

Préconditions : survivors, sentry, fuel-a, fuel-b.

### Retour aux opérations — `acm-09-01`

acm-09-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : street

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Couloir des survivants | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-09-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Débris structurels · debris | 432 / 0.23 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Grillage de chantier · fence | 720 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Caisse de transport · crate | 1062 / 0.86 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1260 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Grillage de chantier · fence | 1494 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-09-01. | supply-acm-09-01

#### Rencontres

acm-09-01-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-09-01-e1 | Soldier | 1190 / 0.28 | 0 s | —

### Couloir des survivants — `acm-09-02`

acm-09-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : habitat

Voie latérale .62 continue.

#### Seuils

S1 | door | Retour aux opérations | 88 / 0.62 | Libre

S2 | door | Garage du dernier carré | 1412 / 0.62 | survivors

S3 | lift | Réserve du mess | 780 / 0.62 | Libre

#### Interactions

A1 · survivors | Dégager les survivants | rescue | 1080 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Banc de service · bench | 315 / 0.12 | 128 × 0.12 × 50 | Fragile · 90 PV → débris non bloquants à zéro | Mobilier en rive de salle, passage arrière maintenu. | —

Vestiaire · locker | 645 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Corps au sol · body | 900 / 0.3 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Poste médical · medical | 1215 / 0.12 | 105 × 0.12 × 94 | Décor non bloquant | Soin et munitions à usage unique par visite de campagne. | —

#### Rencontres

acm-09-02-e0 | Lurker | 760 / 0.62 | 0 s | —

### Garage du dernier carré — `acm-09-03`

acm-09-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : garage

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Couloir des survivants | 88 / 0.62 | Libre

S2 | door | Aire de ravitaillement | 2012 / 0.62 | survivors, sentry

S3 | lift | Réserve du mess | 1092 / 0.12 | Libre

#### Interactions

A1 · sentry | Mettre la sentinelle en batterie | sentry | 430 / 0.65 | 1.8 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 462 / 0.22 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Râtelier militaire · rack | 798 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Palette de fret · pallet | 1050 / 0.13 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Caisse de transport · crate | 1365 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1659 / 0.12 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Sentinelle · sentry | 430 / 0.65 | 85 × 0.1 × 90 | Décor non bloquant | Support visuel de l’interaction sentry. | —

#### Rencontres

acm-09-03-e0 | Crusher | 880 / 0.65 | 0 s | —

### Aire de ravitaillement — `acm-09-04`

acm-09-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : landing

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Garage du dernier carré | 88 / 0.62 | Libre

#### Interactions

A1 · fuel-a | Débrancher la conduite bâbord | power | 750 / 0.25 | 1.8 s | Aucune

A2 · fuel-b | Débrancher la conduite tribord | power | 1370 / 0.85 | 1.8 s | Aucune

A3 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Props : x/z, dimensions et collision

Manifold de carburant · fuel | 450 / 0.12 | 84 × 0.1 × 96 | Décor non bloquant | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette. | —

Manifold de carburant · fuel | 1008 / 0.91 | 84 × 0.1 × 96 | Décor non bloquant | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette. | —

Caisse de transport · crate | 810 / 0.22 | 94 × 0.13 × 72 | Décor non bloquant | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil. | —

Garde-corps · rail | 1386 / 0.93 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 1548 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-09-04-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-09-04-e1 | Soldier | 1190 / 0.28 | 0 s | —

acm-09-04-e2 | Spitter | 1470 / 0.84 | 6 s | —

### Réserve du mess — `acm-09-05`

acm-09-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : mess

Voie latérale .62 continue.

#### Seuils

S1 | lift | Couloir des survivants | 88 / 0.62 | Libre

S2 | lift | Garage du dernier carré | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-8 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-09-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 260 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Banc de service · bench | 519 / 0.12 | 128 × 0.12 × 50 | Fragile · 90 PV → débris non bloquants à zéro | Mobilier en rive de salle, passage arrière maintenu. | —

Armoire de consommables · cabinet | 755 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Banc de service · bench | 968 / 0.12 | 128 × 0.12 × 50 | Fragile · 90 PV → débris non bloquants à zéro | Mobilier en rive de salle, passage arrière maintenu. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-8. | archive-8

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-09-05. | supply-acm-09-05

#### Rencontres

Aucune.

## 10 — Derelict Reclaimed

Chronique : main ; point de vue : Winter.

Le transport s’apprête à décoller. Rétablissez l’ascenseur, détruisez les batteries antiaériennes et rejoignez la rampe. Un dropship abattu émet encore des signes de vie.

Préconditions : lift, aa-a, aa-b, aa-c, ramp, rescue-stabilize, rescue-extract, rescue-route, survivor-delivered.

### Puits de l’ascenseur — `acm-10-01`

acm-10-01 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : lift

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Réseau d’alimentation | 1712 / 0.62 | Libre

#### Interactions

A1 · supply-acm-10-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Garde-corps · rail | 360 / 0.11 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Générateur · generator | 720 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 1116 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Garde-corps · rail | 1494 / 0.94 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-10-01. | supply-acm-10-01

#### Rencontres

acm-10-01-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-10-01-e1 | Spitter | 1190 / 0.28 | 0 s | —

### Réseau d’alimentation — `acm-10-02`

acm-10-02 · LATÉRAL · 1500 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : generator

Voie latérale .62 continue.

#### Seuils

S1 | door | Puits de l’ascenseur | 88 / 0.62 | Libre

S2 | door | Terrasse des batteries | 1412 / 0.62 | lift

S3 | lift | Cabine d’examen | 780 / 0.62 | Libre

#### Interactions

A1 · lift | Rétablir l’ascenseur | power | 1060 / 0.62 | 2 s | Aucune

#### Props : x/z, dimensions et collision

Générateur · generator | 300 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 570 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Baie réseau · server | 840 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pompe verticale · pipe | 1110 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Armoire de consommables · cabinet | 1275 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

#### Rencontres

acm-10-02-e0 | Facehugger | 760 / 0.62 | 0 s | —

acm-10-02-e1 | Lurker | 1050 / 0.62 | 0 s | —

### Terrasse des batteries — `acm-10-03`

acm-10-03 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : antiair

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Réseau d’alimentation | 88 / 0.62 | Libre

S2 | lift | Cabine d’examen | 1092 / 0.12 | Libre

S3 | door | Dropship abattu | 2012 / 0.62 | lift, aa-a, aa-b, aa-c

#### Interactions

A1 · aa-a | Saboter la batterie 01 | charge | 560 / 0.22 | 2.2 s | Aucune

A2 · aa-b | Saboter la batterie 02 | charge | 1070 / 0.84 | 2.2 s | Aucune

A3 · aa-c | Saboter la batterie 03 | charge | 1630 / 0.22 | 2.2 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 462 / 0.22 | 94 × 0.13 × 72 | Décor non bloquant | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil. | —

Balise de chantier · lamp | 840 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Caisse de transport · crate | 1428 / 0.83 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Garde-corps · rail | 1785 / 0.93 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-10-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s | —

acm-10-03-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s | —

acm-10-03-e2 | Soldat Weyland-Yutani | 1510 / 0.82 | 6 s | —

### Rampe du transport — `acm-10-04`

acm-10-04 · PROFONDEUR · 1800 unités · niveau 0 · parcours principal

Poste d’arrivée : présence physique de l’escorte et seuil de proximité obligatoires.

Fonction : flight

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Drain de l’aire d’embarquement | 88 / 0.62 | Libre

#### Interactions

A1 · ramp | Abaisser la rampe du transport | power | 1480 / 0.22 | 1.8 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

A3 · survivor-delivered | Accompagner le blessé jusqu’à la rampe | escort_deliver | 1130 / 0.66 | 1.1 s | rescue-extract

#### Props : x/z, dimensions et collision

Manifold de carburant · fuel | 396 / 0.13 | 84 × 0.1 × 96 | Décor non bloquant | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette. | —

Caisse de transport · crate | 774 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Palette de fret · pallet | 1080 / 0.17 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Garde-corps · rail | 1386 / 0.91 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 1458 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 680 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

acm-10-04-e0 | Soldier | 880 / 0.65 | 0 s | —

acm-10-04-e1 | Spitter | 1190 / 0.28 | 0 s | —

acm-10-04-e2 | Soldier | 1470 / 0.84 | 6 s | —

### Cabine d’examen — `acm-10-05`

acm-10-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : medical

Voie latérale .62 continue.

#### Seuils

S1 | lift | Réseau d’alimentation | 88 / 0.62 | Libre

S2 | lift | Terrasse des batteries | 1092 / 0.62 | Libre

#### Interactions

A1 · archive-9 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-10-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Lit de soins · bed | 271 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Lit de soins · bed | 543 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Armoire de consommables · cabinet | 802 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Poste médical · medical | 956 / 0.13 | 105 × 0.12 × 94 | Décor non bloquant | Soin et munitions à usage unique par visite de campagne. | —

Corps au sol · body | 460 / 0.32 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-9. | archive-9

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-10-05. | supply-acm-10-05

#### Rencontres

Aucune.

### Dropship abattu — `acm-10-06`

acm-10-06 · PROFONDEUR · 2460 unités · niveau 0 · parcours principal

Stabilisation, défense finie de 28 s, rassemblement puis escorte jusqu’à la rampe. Poste de Marine blessé ; acteur inactif avant l’action de rassemblement, blessable ensuite.

Fonction : crash

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Terrasse des batteries | 88 / 0.62 | Libre

S2 | door | Drain de l’aire d’embarquement | 2372 / 0.62 | lift, aa-a, aa-b, aa-c, rescue-stabilize, rescue-extract

#### Interactions

A1 · rescue-stabilize | Stabiliser le blessé sous l’aile | rescue_start | 520 / 0.65 | 1.4 s | Aucune

A2 · rescue-extract | Rassembler le blessé pour le départ | rescue_end | 550 / 0.65 | 0.9 s | Aucune

A3 · supply-survivors | Ouvrir la trousse du dropship | supply | 290 / 0.3 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Fragment de dropship · wreck | 713 / 0.13 | 380 × 0.18 × 145 | Solide | Épave fixe en rive ; blessé placé dans l’espace protégé. | —

Débris structurels · debris | 1107 / 0.84 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Caisse de transport · crate | 1353 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1599 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Débris structurels · debris | 2017 / 0.85 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 520 / 0.65 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction rescue-stabilize. | —

Poste médical · medical | 290 / 0.3 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-survivors. | supply-survivors

#### Rencontres

acm-10-06-e0 | Soldier | 1680 / 0.3 | 0 s | —

acm-10-06-e1 | Soldier | 1790 / 0.83 | 8 s | —

acm-10-06-e2 | Spitter | 2170 / 0.24 | 15 s | —

acm-10-06-e3 | Soldier | 2260 / 0.62 | 22 s | —

### Drain de l’aire d’embarquement — `acm-10-07`

acm-10-07 · LATÉRAL · 1560 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : drain

Voie latérale .62 continue.

#### Seuils

S1 | door | Dropship abattu | 88 / 0.62 | Libre

S2 | door | Rampe du transport | 1472 / 0.62 | lift, aa-a, aa-b, aa-c, rescue-stabilize, rescue-extract, rescue-route

#### Interactions

A1 · rescue-route | Déverrouiller le passage vers la rampe | power | 1170 / 0.62 | 1.2 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 343 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Nappe de résine · resin | 671 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Conduit de service · vent | 983 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pompe verticale · pipe | 1295 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

#### Rencontres

Aucune.

## 11 — Home

Chronique : main ; point de vue : Winter.

La Reine est dans la soute. Les balles ne suffisent pas. Réarmez les quatre commandes du convoyeur, puis attirez-la dans l’axe de la catapulte.

Préconditions : reset-a, reset-b, reset-c, reset-d.

### Soute du convoyeur — `acm-11-01`

acm-11-01 · PROFONDEUR · 2460 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : conveyor

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Coursive bâbord | 140 / 0.08 | Libre

S2 | door | Coursive tribord | 820 / 0.08 | Libre

S3 | door | Vestibule du pont | 1880 / 0.08 | Libre

#### Interactions

A1 · reset-a | Réarmer la commande 01 | power | 520 / 0.2 | 1.6 s | Aucune

A2 · reset-b | Réarmer la commande 02 | power | 1030 / 0.86 | 1.6 s | Aucune

A3 · reset-c | Réarmer la commande 03 | power | 1570 / 0.2 | 1.6 s | Aucune

A4 · reset-d | Réarmer la commande 04 | power | 2020 / 0.86 | 1.6 s | Aucune

A5 · catapult | Déclencher la catapulte | catapult | 2200 / 0.56 | 1 s | Aucune

A6 · supply-acm-11-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 615 / 0.22 | 94 × 0.13 × 72 | Décor non bloquant | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil. | —

Râtelier militaire · rack | 984 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1402 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1771 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1500 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Poste médical · medical | 360 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-11-01. | supply-acm-11-01

#### Rencontres

acm-11-01-e0 | Reine | 1450 / 0.55 | 0 s | —

### Coursive bâbord — `acm-11-02`

acm-11-02 · LATÉRAL · 1500 unités · niveau 0 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cargo

Voie latérale .62 continue.

#### Seuils

S1 | door | Soute du convoyeur | 88 / 0.62 | Libre

S2 | lift | Réserve de chargement | 1412 / 0.62 | Libre

#### Interactions

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 360 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Caisse de transport · crate | 690 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Palette de fret · pallet | 900 / 0.17 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Caisse de transport · crate | 1020 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1260 / 0.13 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Conduit de service · vent | 570 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 1230 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

#### Rencontres

Aucune.

### Coursive tribord — `acm-11-03`

acm-11-03 · PROFONDEUR · 2100 unités · niveau 0 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cargo

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Soute du convoyeur | 88 / 0.62 | Libre

#### Interactions

#### Props : x/z, dimensions et collision

Caisse de transport · crate | 504 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Caisse de transport · crate | 966 / 0.84 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Palette de fret · pallet | 1260 / 0.17 | 140 × 0.12 × 22 | Décor non bloquant | Socle de chargement ; ne sert pas de barrière invisible. | —

Caisse de transport · crate | 1428 / 0.23 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Crochet de manutention · cargoHook | 1764 / 0.13 | 120 × 0.1 × 155 | Décor non bloquant | Équipement du portique, établi près du poste de maintenance. | —

Conduit de service · vent | 798 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 1722 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Conduit de service · vent | 270 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1090 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

Conduit de service · vent | 1910 / 0.1 | 95 × 0.1 × 50 | Décor non bloquant | Infrastructure continue sur la paroi porteuse. | —

#### Rencontres

Aucune.

### Vestibule du pont — `acm-11-04`

acm-11-04 · PROFONDEUR · 1800 unités · niveau 0 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : bridge

Deux rives meublées, bande centrale libre et contournements en profondeur.

#### Seuils

S1 | door | Soute du convoyeur | 88 / 0.62 | Libre

#### Interactions

#### Props : x/z, dimensions et collision

Pupitre de commande · console | 360 / 0.14 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pupitre de commande · console | 720 / 0.14 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Siège de poste · chair | 774 / 0.35 | 51 × 0.1 × 64 | Décor non bloquant | Face à un bureau ou une console. | —

Baie réseau · server | 1224 / 0.14 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Bureau de dossier · desk | 1386 / 0.84 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Conduit de service · vent | 1494 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

#### Rencontres

Aucune.

### Réserve de chargement — `acm-11-05`

acm-11-05 · LATÉRAL · 1180 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : locker

Voie latérale .62 continue.

#### Seuils

S1 | lift | Coursive bâbord | 88 / 0.62 | Libre

#### Interactions

A1 · archive-10 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-11-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Vestiaire · locker | 248 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Vestiaire · locker | 484 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Banc de service · bench | 767 / 0.12 | 128 × 0.12 × 50 | Fragile · 90 PV → débris non bloquants à zéro | Mobilier en rive de salle, passage arrière maintenu. | —

Râtelier militaire · rack | 991 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Enregistreur de terrain · archive | 660 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support visuel de l’interaction archive-10. | archive-10

Poste médical · medical | 850 / 0.62 | 105 × 0.12 × 94 | Décor non bloquant | Support visuel de l’interaction supply-acm-11-05. | supply-acm-11-05

#### Rencontres

Aucune.

## 12 — Réveil forcé

Chronique : stasis ; point de vue : Lisbeth.

Le Legato a changé de cap. Lisbeth sort de l’hypersommeil dans une section isolée. Coupez la ventilation d’urgence, atteignez la sécurité et retrouvez un passage vers Stone.

Préconditions : stasis-wake, stasis-air, stasis-kit, stasis-meet.

### Hypersommeil du Legato — `stasis-01-01`

stasis-01-01 · PROFONDEUR · 1780 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : cryo

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Coursive sous surveillance | 1692 / 0.62 | stasis-wake

#### Interactions

A1 · stasis-wake | Ouvrir le verrou de réveil | power | 1380 / 0.62 | 1 s | Aucune

A2 · supply-stasis-01-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-01-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Caisson de stase · cryo | 303 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Caisson de stase · cryo | 676 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Caisson de stase · cryo | 1086 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé. | —

Caisson de stase · cryo | 1424 / 0.85 | 155 × 0.14 × 85 | Décor non bloquant | Équipement de repos ; couloir de maintenance dégagé. | —

Corps au sol · body | 961 / 0.34 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Nappe de résine · resin | 1282 / 0.12 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Conduit de service · vent | 1566 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Cryocouchette ouverte · cryoOpen | 587 / 0.17 | 170 × 0.18 × 66 | Solide | Capot relevé et accès latéral pour le réveil de Lisbeth. | —

Cryocouchette ouverte · cryoOpen | 1193 / 0.85 | 170 × 0.18 × 66 | Décor non bloquant | Capot relevé et accès latéral pour le réveil de Lisbeth. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-01-01 | supply-stasis-01-01

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-01-01 | archive-stasis-01-01

#### Rencontres

Aucune.

### Coursive sous surveillance — `stasis-01-02`

stasis-01-02 · PROFONDEUR · 2050 unités · niveau 0 · parcours principal

Patrouille orientée, soupçon et deux zones d’ombre utilisables accroupi.

Fonction : security

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Hypersommeil du Legato | 88 / 0.62 | Libre

S2 | door | Réserve de sécurité | 1170 / 0.12 | stasis-wake, stasis-air

S3 | stairs | Extraction d’air | 520 / 0.87 | Libre

S4 | door | Jonction avec Stone | 1962 / 0.62 | stasis-wake, stasis-air, stasis-kit

#### Interactions

A1 · stasis-air | Couper la ventilation d’urgence | power | 1540 / 0.81 | 1.4 s | stasis-wake

#### Props : x/z, dimensions et collision

Baie réseau · server | 410 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pupitre de commande · console | 800 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Râtelier militaire · rack | 1168 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1578 / 0.85 | 94 × 0.13 × 72 | Décor non bloquant | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1742 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Cloison de confinement · bulkhead | 1086 / 0.12 | 90 × 0.08 × 196 | Décor non bloquant | Porte process représentée dans la paroi porteuse. | —

Extracteur mural · fan | 1620 / 0.12 | 126 × 0.06 × 110 | Décor non bloquant | Point d’aspiration au fond ; la circulation reste libre. | —

#### Rencontres

stasis-01-02-e0 | Soldat Weyland-Yutani | 970 / 0.28 | 0 s | [780, 1170]

### Réserve de sécurité — `stasis-01-03`

stasis-01-03 · LATÉRAL · 1330 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : locker

Coursive latérale .62.

#### Seuils

S1 | door | Coursive sous surveillance | 88 / 0.62 | Libre

S2 | stairs | Extraction d’air | 760 / 0.62 | Libre

S3 | door | Jonction avec Stone | 1242 / 0.62 | stasis-wake, stasis-air, stasis-kit

#### Interactions

A1 · stasis-kit | Prendre le matériel de Stone | gear | 510 / 0.62 | 1.1 s | stasis-air

#### Props : x/z, dimensions et collision

Vestiaire · locker | 279 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Vestiaire · locker | 545 / 0.12 | 90 × 0.1 × 150 | Décor non bloquant | Rangement contre le mur, hors de la circulation. | —

Banc de service · bench | 864 / 0.12 | 128 × 0.12 × 50 | Fragile · 90 PV → débris non bloquants à zéro | Mobilier en rive de salle, passage arrière maintenu. | —

Râtelier militaire · rack | 1117 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

#### Rencontres

Aucune.

### Extraction d’air — `stasis-01-04`

stasis-01-04 · PROFONDEUR · 1660 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : generator

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | stairs | Coursive sous surveillance | 88 / 0.62 | Libre

S2 | stairs | Réserve de sécurité | 1572 / 0.62 | Libre

#### Interactions

A1 · supply-stasis-01-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A2 · archive-stasis-01-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Générateur · generator | 332 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 631 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Baie réseau · server | 930 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pompe verticale · pipe | 1228 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Armoire de consommables · cabinet | 1411 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Extracteur mural · fan | 498 / 0.12 | 126 × 0.06 × 110 | Décor non bloquant | Point d’aspiration au fond ; la circulation reste libre. | —

Extracteur mural · fan | 1079 / 0.12 | 126 × 0.06 × 110 | Décor non bloquant | Point d’aspiration au fond ; la circulation reste libre. | —

Valise d’évacuation · evacCase | 470 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-01-04 | supply-stasis-01-04

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-01-04 | archive-stasis-01-04

#### Rencontres

Aucune.

### Jonction avec Stone — `stasis-01-05`

stasis-01-05 · PROFONDEUR · 1930 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : airlock

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Réserve de sécurité | 88 / 0.62 | Libre

S2 | door | Coursive sous surveillance | 1842 / 0.62 | Libre

#### Interactions

A1 · stasis-meet | Établir la liaison avec Stone | power | 1490 / 0.3 | 1.3 s | stasis-kit

A2 · supply-stasis-01-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 1830 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Conduit de service · vent | 444 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pupitre de commande · console | 849 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pompe verticale · pipe | 1254 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Balise de chantier · lamp | 1621 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-01-05 | supply-stasis-01-05

#### Rencontres

stasis-01-05-e0 | Soldier | 1190 / 0.52 | 0 s | —

## 13 — Liaison sous pression

Chronique : stasis ; point de vue : Stone.

Stone ouvre la route de la liaison. Remettez le réseau en service, récupérez le manifeste puis accompagnez Lisbeth au sas sécurisé.

Préconditions : stasis-feed, stasis-manifest, lisbeth-rally, lisbeth-safe.

### Atelier de liaison — `stasis-02-01`

stasis-02-01 · PROFONDEUR · 1740 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : workshop

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Passage de coque | 1652 / 0.62 | stasis-feed

#### Interactions

A1 · stasis-feed | Rétablir le réseau de liaison | power | 1340 / 0.27 | 1.5 s | Aucune

A2 · supply-stasis-02-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-02-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 418 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Râtelier militaire · rack | 818 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Générateur · generator | 1218 / 0.13 | 140 × 0.12 × 104 | Décor non bloquant | Machine fixe ; commande déportée accessible. | —

Caisse de transport · crate | 1427 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1496 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Balise de chantier · lamp | 557 / 0.86 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Enrouleur industriel · cableReel | 1166 / 0.84 | 87 × 0.13 × 71 | Décor non bloquant | Alimentation d’une zone provisoire de recherche. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-02-01 | supply-stasis-02-01

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-02-01 | archive-stasis-02-01

#### Rencontres

Aucune.

### Passage de coque — `stasis-02-02`

stasis-02-02 · LATÉRAL · 2280 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : damaged

Coursive latérale .62.

#### Seuils

S1 | door | Atelier de liaison | 88 / 0.62 | Libre

S2 | door | Contrôle du manifeste | 2192 / 0.62 | stasis-feed

S3 | stairs | Poste sanitaire | 910 / 0.62 | Libre

#### Interactions

#### Props : x/z, dimensions et collision

Débris structurels · debris | 456 / 0.13 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Conduit de service · vent | 866 / 0.11 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Débris structurels · debris | 1186 / 0.84 | 105 × 0.12 × 43 | Décor non bloquant | Au pied de la rupture de coque, pas au hasard. | —

Corps au sol · body | 1414 / 0.3 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Nappe de résine · resin | 1778 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Balise de chantier · lamp | 1938 / 0.84 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

#### Rencontres

stasis-02-02-e0 | Soldat Weyland-Yutani | 940 / 0.62 | 0 s | —

stasis-02-02-e1 | Soldier | 1770 / 0.62 | 9 s | —

### Contrôle du manifeste — `stasis-02-03`

stasis-02-03 · PROFONDEUR · 1780 unités · niveau 0 · parcours principal

Poste de Lisbeth ; acteur inactif avant l’action de rassemblement, blessable ensuite.

Fonction : office

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Passage de coque | 88 / 0.62 | Libre

S2 | door | Sas de regroupement | 1692 / 0.62 | stasis-feed, stasis-manifest, lisbeth-rally

S3 | stairs | Poste sanitaire | 670 / 0.85 | Libre

#### Interactions

A1 · stasis-manifest | Copier l’ordre de transfert | power | 1190 / 0.3 | 1.8 s | Aucune

A2 · lisbeth-rally | Demander à Lisbeth de suivre | escort_start | 590 / 0.62 | 1 s | stasis-manifest

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 392 / 0.13 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Siège de poste · chair | 445 / 0.34 | 51 × 0.1 × 64 | Décor non bloquant | Face à un bureau ou une console. | —

Armoire de consommables · cabinet | 783 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Bureau de dossier · desk | 1104 / 0.84 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Baie réseau · server | 1460 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Station de transmission · uplink | 1139 / 0.14 | 95 × 0.12 × 148 | Décor non bloquant | Borne à garder à portée pendant la copie des preuves. | —

#### Rencontres

stasis-02-03-e0 | Soldat Weyland-Yutani | 1370 / 0.73 | 0 s | —

### Poste sanitaire — `stasis-02-04`

stasis-02-04 · PROFONDEUR · 1380 unités · niveau 1 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : medical

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | stairs | Passage de coque | 88 / 0.62 | Libre

S2 | stairs | Contrôle du manifeste | 1292 / 0.62 | Libre

#### Interactions

A1 · supply-stasis-02-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A2 · archive-stasis-02-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Lit de soins · bed | 317 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Lit de soins · bed | 635 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Armoire de consommables · cabinet | 938 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Poste médical · medical | 1118 / 0.13 | 105 × 0.12 × 94 | Décor non bloquant | Soin et munitions à usage unique par visite de campagne. | —

Corps au sol · body | 538 / 0.32 | 100 × 0.09 × 27 | Décor non bloquant | Trace narrative placée hors des interactions de porte. | —

Valise d’évacuation · evacCase | 470 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-02-04 | supply-stasis-02-04

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-02-04 | archive-stasis-02-04

#### Rencontres

Aucune.

### Sas de regroupement — `stasis-02-05`

stasis-02-05 · PROFONDEUR · 2100 unités · niveau 0 · parcours principal

Poste d’arrivée : présence physique de l’escorte et seuil de proximité obligatoires.

Fonction : airlock

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Contrôle du manifeste | 88 / 0.62 | Libre

#### Interactions

A1 · lisbeth-safe | Conduire Lisbeth au sas sécurisé | escort_deliver | 1710 / 0.74 | 1 s | lisbeth-rally

A2 · supply-stasis-02-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 2000 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Conduit de service · vent | 483 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pupitre de commande · console | 924 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pompe verticale · pipe | 1365 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Balise de chantier · lamp | 1764 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Balise d’extraction · evacBeacon | 1701 / 0.77 | 59 × 0.08 × 98 | Décor non bloquant | Destination lumineuse de l’escorte, jamais un simple dossier. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-02-05 | supply-stasis-02-05

#### Rencontres

stasis-02-05-e0 | Lurker | 1490 / 0.43 | 0 s | —

## 14 — Les preuves de Levy

Chronique : stasis ; point de vue : Rick Levy.

Levy rompt avec la Compagnie. Il doit copier les dossiers de confinement et conduire Hicks hors du module. La transmission ne progresse qu’à proximité de sa borne.

Préconditions : levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof, hicks-rally, hicks-lab-safe.

### Accueil de confinement — `stasis-03-01`

stasis-03-01 · PROFONDEUR · 1830 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : security

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Laboratoire des échantillons | 1742 / 0.62 | levy-clearance

#### Interactions

A1 · levy-clearance | Utiliser l’habilitation de Levy | power | 1410 / 0.27 | 1.2 s | Aucune

A2 · supply-stasis-03-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-03-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Baie réseau · server | 366 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pupitre de commande · console | 714 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Râtelier militaire · rack | 1043 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Caisse de transport · crate | 1409 / 0.85 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Conduit de service · vent | 1556 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-03-01 | supply-stasis-03-01

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-03-01 | archive-stasis-03-01

#### Rencontres

Aucune.

### Laboratoire des échantillons — `stasis-03-02`

stasis-03-02 · PROFONDEUR · 2280 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : reactor

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Accueil de confinement | 88 / 0.62 | Libre

S2 | door | Salle des enregistreurs | 2192 / 0.62 | levy-clearance, levy-isolate-0, levy-isolate-1

S3 | lift | Galerie du détenu | 870 / 0.12 | levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof

#### Interactions

A1 · levy-isolate-0 | Isoler la branche A | power | 680 / 0.34 | 1.3 s | Aucune

A2 · levy-isolate-1 | Isoler la branche B | power | 1660 / 0.76 | 1.3 s | Aucune

#### Props : x/z, dimensions et collision

Générateur · generator | 410 / 0.12 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Pompe verticale · pipe | 752 / 0.12 | 80 × 0.11 × 146 | Décor non bloquant | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Générateur · generator | 1208 / 0.88 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Baie réseau · server | 1664 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Pompe verticale · pipe | 1961 / 0.88 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Paillasse de prélèvement · research | 547 / 0.18 | 150 × 0.13 × 89 | Décor non bloquant | Poste sec, verrerie et outillage en laboratoire. | —

Cylindre de confinement · specimen | 1163 / 0.15 | 98 × 0.13 × 178 | Solide | Cuve d’observation raccordée au collecteur technique. | —

Cylindre de confinement · specimen | 1733 / 0.84 | 98 × 0.13 × 178 | Décor non bloquant | Cuve d’observation raccordée au collecteur technique. | —

#### Rencontres

stasis-03-02-e0 | Facehugger | 1050 / 0.48 | 0 s | —

stasis-03-02-e1 | Soldat Weyland-Yutani | 1760 / 0.44 | 0 s | —

### Salle des enregistreurs — `stasis-03-03`

stasis-03-03 · PROFONDEUR · 2080 unités · niveau 0 · parcours principal

Transmission : 24 s dans un rayon de 430 unités ; fin après neutralisation des renforts.

Fonction : control

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Laboratoire des échantillons | 88 / 0.62 | Libre

S2 | lift | Galerie du détenu | 1992 / 0.62 | levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof

#### Interactions

A1 · levy-upload | Lancer la copie des dossiers | upload_start | 790 / 0.38 | 1.2 s | Aucune

A2 · levy-proof | Récupérer la copie achevée | upload_end | 790 / 0.38 | 1 s | levy-upload

#### Props : x/z, dimensions et collision

Bureau de dossier · desk | 437 / 0.12 | 138 × 0.12 × 88 | Fragile · 110 PV → débris non bloquants à zéro | Dossiers administratifs hors de la voie de fret. | —

Pupitre de commande · console | 832 / 0.12 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Baie réseau · server | 1310 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Baie réseau · server | 1706 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance. | —

Station de transmission · uplink | 790 / 0.35 | 95 × 0.12 × 148 | Décor non bloquant | Borne à garder à portée pendant la copie des preuves. | —

#### Rencontres

stasis-03-03-e0 | Soldier | 1470 / 0.42 | 2 s | —

stasis-03-03-e1 | Soldat Weyland-Yutani | 1820 / 0.81 | 11 s | —

stasis-03-03-e2 | Lurker | 1640 / 0.28 | 19 s | —

### Galerie du détenu — `stasis-03-04`

stasis-03-04 · PROFONDEUR · 1880 unités · niveau 1 · parcours principal

Poste de Hicks ; acteur inactif avant l’action de rassemblement, blessable ensuite.

Fonction : cell

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | lift | Salle des enregistreurs | 88 / 0.62 | Libre

S2 | lift | Décontamination de sortie | 1792 / 0.62 | levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof, hicks-rally

S3 | lift | Laboratoire des échantillons | 820 / 0.84 | Libre

#### Interactions

A1 · hicks-rally | Libérer Hicks et partir ensemble | escort_start | 550 / 0.62 | 1.3 s | levy-proof

A2 · supply-stasis-03-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-03-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Grillage de chantier · fence | 414 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Lit de soins · bed | 790 / 0.14 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard. | —

Grillage de chantier · fence | 1128 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Pupitre de commande · console | 1504 / 0.84 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Paillasse de prélèvement · research | 1429 / 0.86 | 150 × 0.13 × 89 | Solide | Poste sec, verrerie et outillage en laboratoire. | —

Valise d’évacuation · evacCase | 470 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-03-04 | supply-stasis-03-04

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-03-04 | archive-stasis-03-04

#### Rencontres

stasis-03-04-e0 | Soldat Weyland-Yutani | 1340 / 0.34 | 0 s | —

### Décontamination de sortie — `stasis-03-05`

stasis-03-05 · PROFONDEUR · 2160 unités · niveau 0 · parcours principal

Poste d’arrivée : présence physique de l’escorte et seuil de proximité obligatoires.

Fonction : airlock

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | lift | Galerie du détenu | 88 / 0.62 | Libre

#### Interactions

A1 · hicks-lab-safe | Faire passer Hicks en zone sûre | escort_deliver | 1750 / 0.73 | 1.2 s | hicks-rally

A2 · supply-stasis-03-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 2060 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Conduit de service · vent | 497 / 0.12 | 95 × 0.1 × 50 | Décor non bloquant | Point d’entrée visible des créatures. | —

Pupitre de commande · console | 950 / 0.13 | 100 × 0.1 × 85 | Décor non bloquant | Interface à proximité du réseau qu’elle commande. | —

Pompe verticale · pipe | 1404 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Balise de chantier · lamp | 1814 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Douche de décontamination · shower | 648 / 0.13 | 108 × 0.12 × 194 | Décor non bloquant | Portique de traitement du sas et point de raccord sanitaire. | —

Balise d’extraction · evacBeacon | 1728 / 0.74 | 59 × 0.08 × 98 | Décor non bloquant | Destination lumineuse de l’escorte, jamais un simple dossier. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-03-05 | supply-stasis-03-05

#### Rencontres

stasis-03-05-e0 | Soldier | 1450 / 0.45 | 0 s | —

## 15 — Le signal de Hicks

Chronique : stasis ; point de vue : Rick Levy.

Rejoignez le relais extérieur. Les preuves doivent être transmises depuis une zone exposée avant de conduire Hicks au point de départ.

Préconditions : hicks-depart, stasis-relay-power, hicks-signal, hicks-signal-confirm, hicks-final-safe.

### Abri sous l’épave — `stasis-04-01`

stasis-04-01 · PROFONDEUR · 1920 unités · niveau 0 · parcours principal

Poste de Hicks ; acteur inactif avant l’action de rassemblement, blessable ensuite.

Fonction : derelict

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Tranchée des câbles | 1832 / 0.62 | hicks-depart

#### Interactions

A1 · hicks-depart | Repartir avec Hicks | escort_start | 530 / 0.62 | 1.2 s | Aucune

A2 · supply-stasis-04-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-04-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Nappe de résine · resin | 365 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Œuf ouvert · egg | 634 / 0.22 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Nappe de résine · resin | 960 / 0.86 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Œuf ouvert · egg | 1229 / 0.84 | 44 × 0.08 × 50 | Décor non bloquant | Trace de contamination, distincte des ennemis mobiles. | —

Nappe de résine · resin | 1536 / 0.13 | 120 × 0.1 × 125 | Décor non bloquant | Infestation sur support architectural existant. | —

Balise de chantier · lamp | 1651 / 0.85 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Cylindre de confinement · specimen | 672 / 0.18 | 98 × 0.13 × 178 | Solide | Cuve d’observation raccordée au collecteur technique. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-04-01 | supply-stasis-04-01

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-04-01 | archive-stasis-04-01

#### Rencontres

Aucune.

### Tranchée des câbles — `stasis-04-02`

stasis-04-02 · PROFONDEUR · 2210 unités · niveau 0 · parcours principal

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : street

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | door | Abri sous l’épave | 88 / 0.62 | Libre

S2 | stairs | Relais de transmission | 2122 / 0.62 | hicks-depart, stasis-relay-power

S3 | door | Réserve de chantier | 880 / 0.12 | Libre

#### Interactions

A1 · stasis-relay-power | Rétablir la ligne du relais | power | 1640 / 0.27 | 1.4 s | Aucune

#### Props : x/z, dimensions et collision

Débris structurels · debris | 530 / 0.23 | 105 × 0.12 × 43 | Fragile · 70 PV → débris non bloquants à zéro | Au pied de la rupture de coque, pas au hasard. | —

Grillage de chantier · fence | 884 / 0.12 | 170 × 0.07 × 165 | Décor non bloquant | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Caisse de transport · crate | 1304 / 0.86 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Balise de chantier · lamp | 1547 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Grillage de chantier · fence | 1834 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon. | —

Enrouleur industriel · cableReel | 774 / 0.14 | 87 × 0.13 × 71 | Décor non bloquant | Alimentation d’une zone provisoire de recherche. | —

Enrouleur industriel · cableReel | 1414 / 0.87 | 87 × 0.13 × 71 | Solide | Alimentation d’une zone provisoire de recherche. | —

#### Rencontres

stasis-04-02-e0 | Soldier | 1040 / 0.43 | 0 s | —

stasis-04-02-e1 | Spitter | 1780 / 0.82 | 0 s | —

### Relais de transmission — `stasis-04-03`

stasis-04-03 · PROFONDEUR · 2360 unités · niveau 1 · parcours principal

Transmission : 30 s dans un rayon de 460 unités ; fin après neutralisation des renforts.

Fonction : rooftop

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | stairs | Tranchée des câbles | 88 / 0.62 | Libre

S2 | stairs | Aire de départ | 2272 / 0.62 | hicks-depart, stasis-relay-power, hicks-signal, hicks-signal-confirm

#### Interactions

A1 · hicks-signal | Émettre le signal de détresse | upload_start | 850 / 0.39 | 1.3 s | Aucune

A2 · hicks-signal-confirm | Confirmer la transmission | upload_end | 850 / 0.39 | 1 s | hicks-signal

#### Props : x/z, dimensions et collision

Échangeur de toiture · turbine | 519 / 0.23 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente. | —

Pompe verticale · pipe | 920 / 0.14 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Échangeur de toiture · turbine | 1416 / 0.85 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente. | —

Garde-corps · rail | 1794 / 0.92 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 2006 / 0.13 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Station de transmission · uplink | 850 / 0.36 | 95 × 0.12 × 148 | Décor non bloquant | Borne à garder à portée pendant la copie des preuves. | —

#### Rencontres

stasis-04-03-e0 | Soldier | 1730 / 0.62 | 2 s | —

stasis-04-03-e1 | Lurker | 1960 / 0.3 | 11 s | —

stasis-04-03-e2 | Soldat Weyland-Yutani | 2070 / 0.84 | 23 s | —

### Réserve de chantier — `stasis-04-04`

stasis-04-04 · LATÉRAL · 1320 unités · niveau 0 · annexe

Exploration et interactions locales ; état conservé au retour, pas de génération infinie de rencontres.

Fonction : maintenance

Coursive latérale .62.

#### Seuils

S1 | door | Tranchée des câbles | 88 / 0.62 | Libre

S2 | door | Aire de départ | 1232 / 0.62 | hicks-depart, stasis-relay-power, hicks-signal, hicks-signal-confirm

#### Interactions

A1 · supply-stasis-04-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A2 · archive-stasis-04-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Pompe verticale · pipe | 317 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide. | —

Générateur · generator | 581 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible. | —

Armoire de consommables · cabinet | 858 / 0.12 | 87 × 0.1 × 137 | Décor non bloquant | Médical ou maintenance, jamais sur un seuil. | —

Râtelier militaire · rack | 1122 / 0.12 | 126 × 0.1 × 135 | Décor non bloquant | Armes rangées derrière le poste de sécurité. | —

Valise d’évacuation · evacCase | 470 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-04-04 | supply-stasis-04-04

Enregistreur de terrain · archive | 1110 / 0.62 | 40 × 0.06 × 55 | Décor non bloquant | Support persistant de archive-stasis-04-04 | archive-stasis-04-04

#### Rencontres

Aucune.

### Aire de départ — `stasis-04-05`

stasis-04-05 · PROFONDEUR · 2390 unités · niveau 0 · parcours principal

Poste d’arrivée : présence physique de l’escorte et seuil de proximité obligatoires.

Fonction : landing

Voie centrale et rives praticables, passages physiques vers les postes.

#### Seuils

S1 | stairs | Relais de transmission | 88 / 0.62 | Libre

S2 | door | Réserve de chantier | 830 / 0.13 | Libre

#### Interactions

A1 · hicks-final-safe | Accompagner Hicks à la balise | escort_deliver | 1940 / 0.73 | 1.2 s | hicks-signal-confirm

A2 · supply-stasis-04-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 2290 / 0.62 | 0.8 s | Aucune

#### Props : x/z, dimensions et collision

Manifold de carburant · fuel | 598 / 0.12 | 84 × 0.1 × 96 | Décor non bloquant | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette. | —

Manifold de carburant · fuel | 1338 / 0.91 | 84 × 0.1 × 96 | Décor non bloquant | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette. | —

Caisse de transport · crate | 1076 / 0.22 | 94 × 0.13 × 72 | Fragile · 140 PV → débris non bloquants à zéro | Couverture basse ; passage conservé sur un autre plan. | —

Garde-corps · rail | 1840 / 0.93 | 165 × 0.04 × 74 | Décor non bloquant | Bord de passerelle non franchissable hors de la zone de jeu. | —

Balise de chantier · lamp | 2055 / 0.12 | 38 × 0.05 × 122 | Décor non bloquant | Jalon de parcours et éclairage ponctuel. | —

Balise d’extraction · evacBeacon | 1912 / 0.73 | 59 × 0.08 × 98 | Décor non bloquant | Destination lumineuse de l’escorte, jamais un simple dossier. | —

Valise d’évacuation · evacCase | 360 / 0.62 | 80 × 0.12 × 44 | Décor non bloquant | Support persistant de supply-stasis-04-05 | supply-stasis-04-05

#### Rencontres

stasis-04-05-e0 | Soldat Weyland-Yutani | 1570 / 0.3 | 0 s | —

stasis-04-05-e1 | Soldier | 2040 / 0.51 | 6 s | —

## BUG HUNT — trois espaces continus, neuf secteurs

Adaptation originale solo ; moteur partagé, progression distincte.

### Bastion de fret — dock

BROADSiDE · inspiration, plan original

1 | Quai de réception | 30 → 1260 | Libre

2 | Atelier des grues | 1260 → 2580 | 350 crédits

3 | Soute de réserve | 2580 → 3970 | 650 crédits

#### Actions

shop-0 | Ouvrir le ravitaillement | hunt_shop | 340 / 0.64 | 0.35 s

socket-0 | Installer une sentinelle | hunt_sentry | 830 / 0.6 | 1.6 s

shop-1 | Ouvrir le ravitaillement | hunt_shop | 1570 / 0.64 | 0.35 s

socket-1 | Installer une sentinelle | hunt_sentry | 2118 / 0.6 | 1.6 s

beacon-1 | Capturer la balise 1 | hunt_beacon | 1986 / 0.36 | 6 s

shop-2 | Ouvrir le ravitaillement | hunt_shop | 2890 / 0.64 | 0.35 s

socket-2 | Installer une sentinelle | hunt_sentry | 3484 / 0.6 | 1.6 s

beacon-2 | Capturer la balise 2 | hunt_beacon | 3344 / 0.72 | 6 s

gate-1 | Ouvrir Atelier des grues · 350 crédits | hunt_gate | 1155 / 0.62 | 1.2 s

gate-2 | Ouvrir Soute de réserve · 650 crédits | hunt_gate | 2475 / 0.62 | 1.2 s

wave-start | Lancer la prochaine vague | hunt_ready | 585.0 / 0.3 | 0.6 s

#### Mobilier

hunt-dock-p00 | Caisse de transport | 210 / 0.17 | 94 × 0.13 × 72 | Fragile · 140 PV

hunt-dock-p01 | Palette de fret | 386 / 0.86 | 140 × 0.12 × 22 | Décor

hunt-dock-p02 | Râtelier militaire | 562 / 0.16 | 126 × 0.1 × 135 | Décor

hunt-dock-p03 | Crochet de manutention | 738 / 0.84 | 120 × 0.1 × 155 | Décor

hunt-dock-p04 | Enrouleur industriel | 914 / 0.26 | 87 × 0.13 × 71 | Solide

hunt-dock-p05 | Générateur | 1090 / 0.85 | 140 × 0.12 × 104 | Solide

hunt-dock-p06 | Valise d’évacuation | 340 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-dock-p07 | Pupitre de commande | 260 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-dock-p08 | Conduit de service | 120 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-dock-p09 | Conduit de service | 1105 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-dock-p10 | Caisse de transport | 1440 / 0.17 | 94 × 0.13 × 72 | Fragile · 140 PV

hunt-dock-p11 | Palette de fret | 1634 / 0.86 | 140 × 0.12 × 22 | Décor

hunt-dock-p12 | Râtelier militaire | 1828 / 0.16 | 126 × 0.1 × 135 | Décor

hunt-dock-p13 | Crochet de manutention | 2022 / 0.84 | 120 × 0.1 × 155 | Décor

hunt-dock-p14 | Enrouleur industriel | 2216 / 0.26 | 87 × 0.13 × 71 | Solide

hunt-dock-p15 | Générateur | 2410 / 0.85 | 140 × 0.12 × 104 | Solide

hunt-dock-p16 | Valise d’évacuation | 1570 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-dock-p17 | Pupitre de commande | 1490 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-dock-p18 | Conduit de service | 1350 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-dock-p19 | Conduit de service | 2425 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-dock-p20 | Station de transmission | 1986 / 0.36 | 95 × 0.12 × 148 | Décor

hunt-dock-p21 | Caisse de transport | 2760 / 0.17 | 94 × 0.13 × 72 | Fragile · 140 PV

hunt-dock-p22 | Palette de fret | 2968 / 0.86 | 140 × 0.12 × 22 | Décor

hunt-dock-p23 | Râtelier militaire | 3176 / 0.16 | 126 × 0.1 × 135 | Décor

hunt-dock-p24 | Crochet de manutention | 3384 / 0.84 | 120 × 0.1 × 155 | Décor

hunt-dock-p25 | Enrouleur industriel | 3592 / 0.26 | 87 × 0.13 × 71 | Solide

hunt-dock-p26 | Générateur | 3800 / 0.85 | 140 × 0.12 × 104 | Solide

hunt-dock-p27 | Valise d’évacuation | 2890 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-dock-p28 | Pupitre de commande | 2810 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-dock-p29 | Conduit de service | 2670 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-dock-p30 | Conduit de service | 3815 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-dock-p31 | Station de transmission | 3344 / 0.72 | 95 × 0.12 × 148 | Décor

#### Ports

vent-0-0 | 1 | 120 / 0.4

vent-0-1 | 1 | 1105 / 0.6

vent-1-0 | 2 | 1350 / 0.4

vent-1-1 | 2 | 2425 / 0.6

vent-2-0 | 3 | 2670 / 0.4

vent-2-1 | 3 | 3815 / 0.6

### Complexe des preuves — lab

MERCENARY · inspiration, plan original

1 | Poste de sûreté | 30 → 1430 | Libre

2 | Confinement biologique | 1430 → 2920 | 350 crédits

3 | Relais scientifique | 2920 → 4390 | 650 crédits

#### Actions

shop-0 | Ouvrir le ravitaillement | hunt_shop | 340 / 0.64 | 0.35 s

socket-0 | Installer une sentinelle | hunt_sentry | 940 / 0.6 | 1.6 s

shop-1 | Ouvrir le ravitaillement | hunt_shop | 1740 / 0.64 | 0.35 s

socket-1 | Installer une sentinelle | hunt_sentry | 2398 / 0.6 | 1.6 s

beacon-1 | Capturer la balise 1 | hunt_beacon | 2250 / 0.36 | 6 s

shop-2 | Ouvrir le ravitaillement | hunt_shop | 3230 / 0.64 | 0.35 s

socket-2 | Installer une sentinelle | hunt_sentry | 3876 / 0.6 | 1.6 s

beacon-2 | Capturer la balise 2 | hunt_beacon | 3728 / 0.72 | 6 s

gate-1 | Ouvrir Confinement biologique · 350 crédits | hunt_gate | 1325 / 0.62 | 1.2 s

gate-2 | Ouvrir Relais scientifique · 650 crédits | hunt_gate | 2815 / 0.62 | 1.2 s

wave-start | Lancer la prochaine vague | hunt_ready | 670.0 / 0.3 | 0.6 s

#### Mobilier

hunt-lab-p00 | Cylindre de confinement | 210 / 0.17 | 98 × 0.13 × 178 | Solide

hunt-lab-p01 | Paillasse de prélèvement | 420 / 0.84 | 150 × 0.13 × 89 | Solide

hunt-lab-p02 | Cryocouchette ouverte | 630 / 0.16 | 170 × 0.18 × 66 | Solide

hunt-lab-p03 | Baie réseau | 840 / 0.82 | 86 × 0.1 × 172 | Solide

hunt-lab-p04 | Armoire de consommables | 1050 / 0.17 | 87 × 0.1 × 137 | Décor

hunt-lab-p05 | Douche de décontamination | 1260 / 0.84 | 108 × 0.12 × 194 | Décor

hunt-lab-p06 | Extracteur mural | 1010 / 0.08 | 126 × 0.06 × 110 | Décor

hunt-lab-p07 | Valise d’évacuation | 340 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-lab-p08 | Pupitre de commande | 260 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-lab-p09 | Conduit de service | 120 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-lab-p10 | Conduit de service | 1275 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-lab-p11 | Cylindre de confinement | 1610 / 0.17 | 98 × 0.13 × 178 | Solide

hunt-lab-p12 | Paillasse de prélèvement | 1838 / 0.84 | 150 × 0.13 × 89 | Solide

hunt-lab-p13 | Cryocouchette ouverte | 2066 / 0.16 | 170 × 0.18 × 66 | Solide

hunt-lab-p14 | Baie réseau | 2294 / 0.82 | 86 × 0.1 × 172 | Solide

hunt-lab-p15 | Armoire de consommables | 2522 / 0.17 | 87 × 0.1 × 137 | Décor

hunt-lab-p16 | Douche de décontamination | 2750 / 0.84 | 108 × 0.12 × 194 | Décor

hunt-lab-p17 | Extracteur mural | 2473 / 0.08 | 126 × 0.06 × 110 | Décor

hunt-lab-p18 | Valise d’évacuation | 1740 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-lab-p19 | Pupitre de commande | 1660 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-lab-p20 | Conduit de service | 1520 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-lab-p21 | Conduit de service | 2765 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-lab-p22 | Station de transmission | 2250 / 0.36 | 95 × 0.12 × 148 | Décor

hunt-lab-p23 | Cylindre de confinement | 3100 / 0.17 | 98 × 0.13 × 178 | Solide

hunt-lab-p24 | Paillasse de prélèvement | 3324 / 0.84 | 150 × 0.13 × 89 | Solide

hunt-lab-p25 | Cryocouchette ouverte | 3548 / 0.16 | 170 × 0.18 × 66 | Solide

hunt-lab-p26 | Baie réseau | 3772 / 0.82 | 86 × 0.1 × 172 | Solide

hunt-lab-p27 | Armoire de consommables | 3996 / 0.17 | 87 × 0.1 × 137 | Décor

hunt-lab-p28 | Douche de décontamination | 4220 / 0.84 | 108 × 0.12 × 194 | Décor

hunt-lab-p29 | Extracteur mural | 3949 / 0.08 | 126 × 0.06 × 110 | Décor

hunt-lab-p30 | Valise d’évacuation | 3230 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-lab-p31 | Pupitre de commande | 3150 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-lab-p32 | Conduit de service | 3010 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-lab-p33 | Conduit de service | 4235 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-lab-p34 | Station de transmission | 3728 / 0.72 | 95 × 0.12 × 148 | Décor

#### Ports

vent-0-0 | 1 | 120 / 0.4

vent-0-1 | 1 | 1275 / 0.6

vent-1-0 | 2 | 1520 / 0.4

vent-1-1 | 2 | 2765 / 0.6

vent-2-0 | 3 | 3010 / 0.4

vent-2-1 | 3 | 4235 / 0.6

### Opérations abandonnées — colony

TRIBUTE · inspiration, plan original

1 | Cour des opérations | 30 → 1350 | Libre

2 | Échangeurs extérieurs | 1350 → 2800 | 350 crédits

3 | Dernier garage | 2800 → 4170 | 650 crédits

#### Actions

shop-0 | Ouvrir le ravitaillement | hunt_shop | 340 / 0.64 | 0.35 s

socket-0 | Installer une sentinelle | hunt_sentry | 888 / 0.6 | 1.6 s

shop-1 | Ouvrir le ravitaillement | hunt_shop | 1660 / 0.64 | 0.35 s

socket-1 | Installer une sentinelle | hunt_sentry | 2292 / 0.6 | 1.6 s

beacon-1 | Capturer la balise 1 | hunt_beacon | 2148 / 0.36 | 6 s

shop-2 | Ouvrir le ravitaillement | hunt_shop | 3110 / 0.64 | 0.35 s

socket-2 | Installer une sentinelle | hunt_sentry | 3690 / 0.6 | 1.6 s

beacon-2 | Capturer la balise 2 | hunt_beacon | 3554 / 0.36 | 6 s

gate-1 | Ouvrir Échangeurs extérieurs · 350 crédits | hunt_gate | 1245 / 0.62 | 1.2 s

gate-2 | Ouvrir Dernier garage · 650 crédits | hunt_gate | 2695 / 0.62 | 1.2 s

wave-start | Lancer la prochaine vague | hunt_ready | 630.0 / 0.3 | 0.6 s

#### Mobilier

hunt-colony-p00 | Échangeur de toiture | 210 / 0.15 | 165 × 0.18 × 116 | Solide

hunt-colony-p01 | Fragment de dropship | 730 / 0.83 | 380 × 0.18 × 145 | Solide

hunt-colony-p02 | Débris structurels | 598 / 0.18 | 105 × 0.12 × 43 | Fragile · 70 PV

hunt-colony-p03 | Manifold de carburant | 792 / 0.82 | 84 × 0.1 × 96 | Décor

hunt-colony-p04 | Grillage de chantier | 986 / 0.15 | 170 × 0.07 × 165 | Solide

hunt-colony-p05 | Balise de chantier | 1180 / 0.86 | 38 × 0.05 × 122 | Décor

hunt-colony-p06 | Garde-corps | 690 / 0.97 | 165 × 0.04 × 74 | Décor

hunt-colony-p07 | Valise d’évacuation | 340 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-colony-p08 | Pupitre de commande | 260 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-colony-p09 | Conduit de service | 120 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-colony-p10 | Conduit de service | 1195 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-colony-p11 | Échangeur de toiture | 1530 / 0.15 | 165 × 0.18 × 116 | Solide

hunt-colony-p12 | Fragment de dropship | 2118 / 0.83 | 380 × 0.18 × 145 | Solide

hunt-colony-p13 | Débris structurels | 1970 / 0.18 | 105 × 0.12 × 43 | Fragile · 70 PV

hunt-colony-p14 | Manifold de carburant | 2190 / 0.82 | 84 × 0.1 × 96 | Décor

hunt-colony-p15 | Grillage de chantier | 2410 / 0.15 | 170 × 0.07 × 165 | Solide

hunt-colony-p16 | Balise de chantier | 2630 / 0.86 | 38 × 0.05 × 122 | Décor

hunt-colony-p17 | Garde-corps | 2075 / 0.97 | 165 × 0.04 × 74 | Décor

hunt-colony-p18 | Valise d’évacuation | 1660 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-colony-p19 | Pupitre de commande | 1580 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-colony-p20 | Conduit de service | 1440 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-colony-p21 | Conduit de service | 2645 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-colony-p22 | Station de transmission | 2148 / 0.36 | 95 × 0.12 × 148 | Décor

hunt-colony-p23 | Échangeur de toiture | 2980 / 0.15 | 165 × 0.18 × 116 | Solide

hunt-colony-p24 | Fragment de dropship | 3526 / 0.83 | 380 × 0.18 × 145 | Solide

hunt-colony-p25 | Débris structurels | 3388 / 0.18 | 105 × 0.12 × 43 | Fragile · 70 PV

hunt-colony-p26 | Manifold de carburant | 3592 / 0.82 | 84 × 0.1 × 96 | Décor

hunt-colony-p27 | Grillage de chantier | 3796 / 0.15 | 170 × 0.07 × 165 | Solide

hunt-colony-p28 | Balise de chantier | 4000 / 0.86 | 38 × 0.05 × 122 | Décor

hunt-colony-p29 | Garde-corps | 3485 / 0.97 | 165 × 0.04 × 74 | Décor

hunt-colony-p30 | Valise d’évacuation | 3110 / 0.64 | 80 × 0.12 × 44 | Décor

hunt-colony-p31 | Pupitre de commande | 3030 / 0.17 | 100 × 0.1 × 85 | Décor

hunt-colony-p32 | Conduit de service | 2890 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-colony-p33 | Conduit de service | 4015 / 0.11 | 95 × 0.1 × 50 | Décor

hunt-colony-p34 | Station de transmission | 3554 / 0.36 | 95 × 0.12 × 148 | Décor

#### Ports

vent-0-0 | 1 | 120 / 0.4

vent-0-1 | 1 | 1195 / 0.6

vent-1-0 | 2 | 1440 / 0.4

vent-1-1 | 2 | 2645 / 0.6

vent-2-0 | 3 | 2890 / 0.4

vent-2-1 | 3 | 4015 / 0.6

### Magasin

rifle-ammo | M41A · 120 cartouches | 100 | ammo

shotgun-ammo | M37 · 24 cartouches | 100 | ammo

smartgun | Débloquer le M56 Smartgun | 550 | weapon

smartgun-ammo | M56 · 160 cartouches | 150 | ammo

flame | Débloquer le M240 | 400 | weapon

flame-ammo | M240 · 150 unités | 130 | ammo

medkit | Un pansement · plafond 5 | 90 | medkit

armor | Réparer 50 points d’armure | 120 | armor

grenade | Une grenade · plafond 9 | 100 | grenade

sentry | Kit de sentinelle · 160 tirs | 450 | sentry

repair-kit | Kit de réparation · plafond 3 | 180 | repair

decoy | Leurre sonore · plafond 3 | 150 | decoy

mine | Mine de proximité · plafond 3 | 260 | mine

### Trente vagues

1 | 5 | 4 | 4 | — | — | 105

2 | 5 | 4 | 4 | — | — | 110

3 | 6 | 4 | 4 | — | — | 115

4 | 6 | 4 | 4 | — | — | 120

5 | 7 | 5 | 4 | WY | — | 125

6 | 8 | 6 | 4 | — | Crusher | 130

7 | 8 | 6 | 4 | — | — | 135

8 | 9 | 7 | 5 | — | — | 140

9 | 10 | 8 | 6 | — | — | 145

10 | 10 | 8 | 6 | WY | — | 150

11 | 11 | 9 | 7 | — | — | 155

12 | 12 | 10 | 8 | — | Crusher | 160

13 | 12 | 10 | 8 | — | — | 165

14 | 13 | 11 | 9 | — | — | 170

15 | 14 | 12 | 10 | WY | — | 175

16 | 14 | 12 | 10 | — | — | 180

17 | 15 | 13 | 11 | — | — | 185

18 | 16 | 14 | 12 | — | Crusher | 190

19 | 16 | 14 | 12 | — | — | 195

20 | 17 | 15 | 13 | WY | — | 200

21 | 18 | 16 | 14 | — | — | 205

22 | 18 | 16 | 14 | — | — | 210

23 | 19 | 17 | 15 | — | — | 215

24 | 19 | 17 | 15 | — | Crusher | 220

25 | 20 | 18 | 16 | WY | — | 225

26 | 21 | 19 | 17 | — | — | 230

27 | 21 | 19 | 17 | — | — | 235

28 | 22 | 20 | 18 | — | — | 240

29 | 23 | 21 | 19 | — | — | 245

30 | 23 | 21 | 19 | WY | Crusher | 250
