# Changements 0.3.0 — La dernière voie

## Contrat de cette livraison

Cette version est une **extension locale du module autonome AVP-R 0.2**, pas une fusion au moteur hôte Tantalus. Les 14 séquences antérieures et leurs 47 identifiants d’objectif sont conservés. Une séquence aérienne de trois objectifs est insérée **après le duel et avant la clairière**. La partie au sol reste composée de 36 lieux, dont 35 reliés entre eux. La clairière est accessible après le vol, sans porte fictive depuis le toit. Le couloir aérien est un environnement de jeu distinct, pas une 37e salle pédestre.

Les layouts, coordonnées, appareils, verrous, renforts et la route aérienne sont des choix de cette adaptation de fan. Ils ne constituent ni des mesures du film, ni une carte réelle de Gunnison, ni une prétention à un nouveau canon. Le dénouement du module antérieur est conservé ; les écrans de transition et plusieurs événements restent narratifs.

Le rendu est dessiné par code Canvas, avec des silhouettes vectorielles et des matériaux procéduraux. Il ne contient pas de nouveaux sprites photoréalistes, de reconstitution 1:1, de musique officielle ou de séquences du film. Les comptes de placements ne sont pas des comptes de sprites uniques.

### Systèmes réellement ajoutés en 0.3

**Poursuite au passage.** Une créature non-boss en poursuite active, avec mémoire, assez proche du passage et avec visibilité géométrique vers celui-ci, peut franchir le même raccord. La distance de sélection est de 400 unités. Au maximum une créature est mise en transit lors d’un franchissement, et trois transits peuvent être en attente. Il ne s’agit pas d’une simulation de chasse globale à travers toute la ville : les escaliers et échelles sont exclus, et les files de transit sont vidées au changement de séquence. L’adversaire réapparaît uniquement au seuil réciproque après 2,4 secondes, puis 0,7 seconde d’entrée. Son identifiant et ses PV sont conservés ; les objectifs de nettoyage cherchent leurs cibles dans toutes les salles de la séquence, transits compris.

**Verrou de battant.** K agit sur une porte de type `door` à moins de 112 unités. Il ne verrouille ni une rue, ni un escalier, ni un sentier. Le même verrou est partagé entre les deux faces de la liaison. Un poursuivant le dégrade à raison de 14 points par seconde sur une intégrité initiale de 100 ; une fois arraché, le verrou reste inutilisable pendant cette séquence. Après rupture, l’arrivée reprend avec un délai de 0,75 seconde. Le joueur doit explicitement libérer son propre verrou pour franchir la porte. Les coups au seuil sont visibles, mais la carte ne révèle pas des adversaires cachés à distance.

**Entrées de rencontre.** Les 21 adversaires scénarisés possèdent chacun une définition d’entrée finie : identifiant, pièce, position et délai. Le rendu annonce une grille, une brèche ou un parapet ; l’émergence est vulnérable mais n’attaque pas avant d’être achevée. Les réserves ne se renouvellent pas au changement de pièce. Ces mises en scène utilisent des motifs procéduraux ; aucune animation de destruction intégrale des murs n’a été produite.

**Embarquement.** L’objectif `boarding` demande une interaction de 1,2 seconde, puis 22 secondes de présence dans un rayon de 560 unités autour du point d’embarquement. Molly doit être à moins de 240 unités de ce point pour que l’embarquement démarre. Molly, Ricky et Dallas sont enregistrés à bord respectivement à 5, 13 et 20 secondes. S’éloigner suspend la progression ; elle n’est pas remise à zéro. Trois adversaires sont prévus, avec des délais d’entrée de 0, 5,5 et 11 secondes. Leur apparition se rattache à l’activation de la rencontre, pas à une vague infinie. L’embarquement n’exige pas d’éliminer tous les ennemis. Ces passagers ont un état de montée, **pas une santé individuelle ni une IA d’escorte complète pour chacun**.

**Vol 2D.** La route de 7 500 unités possède sept obstacles physiques et trois objectifs ordonnés. L’allure de croisière est de 110 unités ; les commandes gauche et droite règlent l’allure, et X la réduit vers 30. Haut et bas commandent la vitesse verticale avec inertie. Une réserve se consomme en vol ; vide, elle pénalise la portance. À x=3 200, une onde scénarisée retire 12 points de coque et déstabilise l’appareil pendant 7,5 secondes. Elle n’est pas un obstacle évitable. Un impact physique coûte 13 points en Histoire, 21 en Standard et 28 en Survie, avec une protection de 1,6 seconde entre deux impacts. Le masque de collision est une approximation de la cellule et des patins, pas la silhouette exacte de chaque pale.

**Approche et reprise.** La zone de poser couvre x=6 500 à 7 350, à hauteur 55. Il faut une allure au plus égale à 100 et une vitesse verticale absolue au plus égale à 90. Hors de la zone, ou trop vite, un contact endommage et fait rebondir l’appareil. À l’extrémité de la clairière, une assistance arcade arrête le déplacement horizontal à x=7 330, sans reculer l’appareil ; le joueur garde la descente. Il ne s’agit pas d’un simulateur de pilotage. La limite haute du vol est également assistée. Aucun tir embarqué, combat aérien, vol libre ou choix de destination n’est implémenté.

**Points de reprise.** Un objectif au sol terminé sans ennemi vivant local et sans poursuite en transit peut produire un point de reprise. Un nouveau chapitre dispose d’un point initial. En vol, les étapes atteintes peuvent produire un point lorsque la coque est au moins à 35, l’altitude supérieure à 380, l’onde terminée et la proximité immédiate d’un obstacle écartée. L’export contient au plus un niveau de reprise ; les exports répétés ne créent pas une récursion de sauvegardes. Ce système ne simule pas un réseau de bornes de sauvegarde dans le décor.

### Sauvegarde et séparation des campagnes

L’espace local reste `tantalus.mire.avpr.v1`. Les fichiers JSON 0.1/0.2 importés gardent leurs anciens objectifs. Une sauvegarde déjà à l’ancien index 13 de clairière est migrée vers `aftermath`, index 14, plutôt que vers `airlift`. Le marqueur `migratedPastAir` distingue ce cas : l’étape nouvelle est considérée passée pour la continuité, **pas attestée comme jouée**. Les sauvegardes 0.3 enregistrent aussi `chapterId` pour éviter une dépendance au seul index numérique.

Les sauvegardes conservent les appareils, les dégâts de verrou, les adversaires déplacés, l’embarquement et le vol. Les identités dupliquées sont filtrées ; les raccords de poursuite inconnus sont rejetés, et un reçu d’apparition incohérent est réparé pour ne pas bloquer un objectif. Un fichier volontairement édité n’est pas une preuve de progression légitime : le jeu reste local, sans anti-triche ni serveur d’autorité.

L’installateur ajoute uniquement le lanceur `src/dlc/avpr/index.html` au menu reconnu. Il ne fusionne ni GameEngine, ni MIRE partagé, ni récompenses Frontier. Aucun push GitHub ou déploiement Vercel n’a été effectué pour cette livraison.

## Commandes

| Action | Commande |
|---|---|
| Déplacement au sol / profondeur | Flèches, positions ZQSD / WASD |
| Interaction / porte / début d’embarquement | E |
| Verrouiller ou libérer un battant proche | K |
| Tir / attaque | Espace ou clic gauche ; souris pour viser |
| Choisir une arme | 1 à 4 selon le personnage |
| Recharger | R |
| Esquive au sol | X avec une direction |
| Garde de Wolf | B ou clic droit |
| Charger / relâcher le plasma | Maintenir T, puis relâcher |
| Soins immobiles | H |
| Faire attendre / rappeler l’escorte | O |
| Torche / vision / camouflage | F / V / G selon le personnage |
| Plan / carnet / pause | M / I / Échap ou les boutons |
| Vol : monter / descendre | ↑ / ↓ |
| Vol : régler l’allure | ← / → |
| Vol : freiner | Maintenir X ou le bouton Frein tactile |
