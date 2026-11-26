# 0.7.0 — De l’autre côté

## Périmètre de la 0.7

« De l’autre côté » prolonge le module autonome AVP-R 0.6 réellement extrait. Les 41 lieux au sol, le vol, les 54 liaisons, les quinze séquences et les cinquante objectifs principaux sont conservés. Huit liaisons existantes reçoivent un parcours architectural intermédiaire. Ce ne sont ni huit salles supplémentaires, ni huit nouvelles connexions ajoutées au graphe. Quatre escaliers, trois échelles et une passerelle sont dessinés et simulés comme des supports en coupe.

Le transport d’un adulte blessé ouvre une autre façon d’accomplir les quatre secours de la 0.6. Il n’ajoute pas de passager à l’hélicoptère, ne modifie pas la fin et ne certifie pas la survie ultérieure des personnes confiées aux abris temporaires. Ces parcours, dangers et gestes sont des créations de gameplay pour cette adaptation de fan, pas des plans authentifiés de Gunnison ou du film.

Le rendu reste procédural et vectoriel Canvas. Les nouveaux décors sont les huit raccords : volées, paliers, garde-corps, cages d’échelle, travée métallique, tours de sortie, lampes et conduites raccordées à leurs supports. Les anciens niveaux ne sont pas tous redessinés. Aucun nouvel extrait d’image, son ou dialogue du film n’est incorporé.

## Parcours des raccords

### Entrer, s’arrêter, rebrousser chemin

E près d’un seuil reconnu ouvre le parcours lorsque les deux lieux sont autorisés. Le joueur reste logiquement associé à la pièce de départ jusqu’à la sortie. Une traversée complète effectue exactement la porte réciproque existante, avec ses contraintes ; un demi-tour revient au départ sans incrémenter le nombre de portes franchies.

Les flèches suivent le support représenté. Sur un palier ou une volée, gauche et droite commandent la progression ; sur un segment vertical, haut et bas commandent l’échelle et l’horizontale n’avance pas. Le clavier ZQSD / WASD et le pavé tactile utilisent les mêmes axes. Relâcher les commandes immobilise le personnage. Le support est contraint : il n’y a ni saut libre, ni chute, ni physique de corps sur les marches, ni changement manuel de voie.

La position est calculée par longueur cumulée des segments, puis le rendu accroche les pieds aux marches visibles. Les portes des deux extrémités sont nommées. Le plan M présente la même ligne, le joueur et les intervalles dangereux ; il ne téléporte pas. Le dossier P donne les traversées, demi-tours, transports et remises au relais.

### Groupe, menace et simulation

Molly ou Jesse, lorsqu’elles accompagnent le protagoniste, doivent être proches du seuil. Un adulte facultatif qui suit doit également le rejoindre. Au-delà de 205 unités du passage, l’engagement est refusé et un rapprochement est demandé. Un adulte en attente ou au sol reste dans sa pièce tant qu’il n’est pas transporté. Les accompagnants engagés sont rendus sur le support et rejoignent la porte réciproque avec leur identité et leurs blessures.

Un ennemi vivant, visible et actif dans les abords immédiats empêche l’entrée : moins de 260 unités, ou attaque annoncée à moins de 450. Ce contrôle ne signifie pas qu’il faut nettoyer toute une salle. Les anciennes poursuites de pièce en pièce continuent de s’appliquer aux passages ordinaires compatibles, mais aucune créature n’emprunte un de ces nouveaux supports avec le joueur.

Pendant la traversée, l’intelligence artificielle de la pièce source est suspendue. Aucun combat n’est simulé à l’échelle de toute la ville. Le temps de campagne et le délai d’évacuation continuent ; les objets dépendant de leur horodatage, comme les fusées, vieillissent. Les menus mettent cette simulation en pause. Aucune régénération de santé, énergie ou kit n’est donnée sur le raccord. Les aides anciennes entre séquences, notamment la vitalité minimale, sont conservées et ne doivent pas être confondues avec un soin au passage.

### Trois dangers annoncés

La gaine inférieure et la passerelle possèdent chacune une conduite de vapeur ; la dernière volée vers le toit possède un câble électrique endommagé. Chaque danger suit un cycle de 6,4 secondes simulées : 4 secondes de repos, 1,4 seconde d’annonce et 1 seconde d’activité. Un signal visuel précède la zone active. Attendre hors de l’intervalle permet de passer pendant le repos.

Un passage dans l’intervalle actif inflige 14 dégâts de base, modulés par la difficulté et la protection après coup du personnage. Le même cycle ne peut infliger sa blessure une deuxième fois après rechargement. Les positions, l’horloge et le reçu de contact sont enregistrés. La garde n’est pas une protection contre ces dangers ; armes, outils, esquives et soins ne sont pas utilisables sur le support.

La blessure est simulée sur le protagoniste ou le porteur. Les compagnons n’ont pas de simulation de dégâts distincte sur le raccord : leurs anciennes blessures sont conservées, mais une vapeur ne leur applique pas une blessure individuelle supplémentaire. C’est une limite de cette version, pas une protection universelle dans les salles ordinaires.

## Porter un adulte blessé

### Conditions et gestes

Un personnage humain peut porter un des quatre adultes recrutés de sa séquence, à 40 PV ou moins sur 80, y compris à zéro. Il faut être à moins de 86 unités et avoir une ligne de vue dégagée. Une personne inconnue, en pleine santé, au relais, hors séquence ou éloignée n’est pas récupérée à distance. Wolf ne reçoit pas cette capacité ; U conserve pour lui la récupération des balises laser.

U, ou le bouton Porter, engage 0,9 seconde d’immobilité. Bouger ou recevoir un coup interrompt le geste sans dépenser de kit. À la réussite, la personne est portée visiblement et son état suit la position physique du porteur. Ce n’est pas un objet d’inventaire : son identité, ses blessures et son destination restent celles du secours.

L’allure du porteur est réduite à 56 % de l’allure normale, sans course. Les deux mains sont occupées : pas de tir, rechargement, soin, esquive, couvert, fusée ou travail de verrou. La lampe tenue est éteinte et ne se rallume pas pendant le transport. Une dépose ou une assistance est nécessaire pour libérer les mains. Le porteur reste vulnérable ; la personne portée n’est pas ciblée séparément pendant ce geste.

Une seconde pression sur U engage une dépose de 0,6 seconde. Le moteur cherche un sol libre près du joueur et ne place pas le blessé dans un meuble. Il reste en attente s’il est debout, ou au sol s’il est à zéro. La dépose ne soigne pas et ne rend aucun kit. Une mort du porteur libère la personne près du point de chute logique avant la reprise.

### Portes, escaliers et destination

Le portage conserve les blessures lors d’un passage ordinaire, d’un escalier ou de la passerelle. Une échelle verticale est refusée explicitement : il faut emprunter un autre raccord autorisé, déposer la personne ou la relever avec un soin. Le portage ne contourne jamais une porte verrouillée, un chapitre fermé ou la condition d’accès au toit.

Au relais original, E peut confier directement la personne portée, même à zéro PV. La validation dure deux secondes, demande la proximité et une zone assez dégagée, et ne modifie aucun objectif principal. « Confiée au relais » est un état de lieu, pas un acte médical. Un blessé à zéro n’acquiert pas magiquement un point de vitalité au rechargement. Ce cas a fait l’objet d’un correctif et d’une régression dédiés.

Une personne laissée derrière conserve les règles de la 0.6. Le secours reste facultatif ; la fin de sa séquence marque son sort inconnu si le relais n’a pas été atteint. Aucun saignement chronométré ou décès permanent d’adulte facultatif n’est ajouté.

## Sauvegarde et reprise

Le namespace local reste `tantalus.mire.avpr.v1`. Le bloc v7 transporte le parcours courant, ses deux extrémités, la fraction de progression, le groupe, les dangers déjà subis, l’identité portée et les statistiques. Une exportation JSON peut donc être faite au milieu d’un escalier, puis rechargée au même endroit avec le même blessé.

Le chargement reconstruit le groupe depuis les véritables états des personnages. Une liste de passagers inventée ne crée pas de compagnon. Un groupe trop éloigné ou un raccord devenu incohérent est rejeté au seuil plutôt que de figer une sortie impossible. Une identité de transport falsifiée ne récupère pas un adulte lointain de la même pièce. Ce filtrage garantit de la cohérence locale, pas un système anti-triche serveur.

Un nouveau point de reprise automatique n’est pas créé pendant un passage ou un portage : le précédent point sécurisé reste disponible. La sauvegarde normale et l’export restent possibles. Les anciens formats sans v7 sont acceptés sans inventer de traversée ou transport, sans soin, kit ou récompense. Conserver l’export original avant migration ; le retour d’un fichier 0.7 vers une version plus ancienne n’est pas garanti.

## Installation et état du projet

Le HTML autonome contient le jeu complet de ce module. L’installateur ajoute ou met à niveau uniquement un accès dans un menu Tantalus reconnu. `--dry-run` et `--check` vérifient sans écrire ; les options inconnues sont refusées. La mise à niveau conserve l’ancien HTML et refuse un contenu non reconnu. La désinstallation restaure le menu original selon son reçu.

La vérification 0.6 → 0.7 utilise le véritable HTML et le véritable installateur 0.6, mais sur un menu temporaire, pas sur le moteur hôte complet. Aucune fusion avec GameEngine, MIRE ou les profils partagés, aucun push GitHub et aucun déploiement Vercel n’ont été effectués.

## Méthode de vérification

Les tests Node comparent les données héritées, parcourent les huit supports dans les deux sens et contrôlent les interruptions, blessures, exports, groupes et refus d’échelle. Les campagnes automatisées utilisent les commandes du moteur, pas des écritures de position, santé ou objectif : elles connaissent néanmoins les routes et visent précisément.

Trois campagnes ordinaires, trois avec les quatre secours soignés et trois avec transport de Mara terminent les cinquante objectifs. Les dernières utilisent trois soins pour les autres adultes et confient Mara à 38 PV, sans la soigner. Le bot la dépose pour combattre, la reprend et atteint le relais. Ces résultats ne constituent pas une partie humaine ni une estimation de difficulté ou de durée.

Chromium exécute le HTML assemblé par `set_content`, avec un Storage mémoire explicite pour l’import et l’export. La navigation native locale est bloquée dans cet environnement et n’a pas été contournée. Les vues mobiles sont émulées ; les contacts tactiles du nouveau test utilisent un véritable contact navigateur via DevTools, pas une simple propriété de progression. Aucun téléphone physique, stockage natif `file://` ou contrôle acoustique au casque n’est certifié.

Les captures distinguent un seuil préparé, une action clavier/tactile normale, un parcours par les commandes publiques Game.step et un état issu d’une campagne automatisée complète. Les huit vues architecturales ne sont pas des concept arts. Toutes restent des images du prototype vectoriel réellement exécuté.

