# Changements 0.4.0 — Les pièces oubliées

## Nature de la version 0.4

Extension du **module AVP-R autonome 0.3** réellement extrait, pas une fusion au moteur actuel des autres DLC. Les quinze séquences et cinquante objectifs principaux de la 0.3 sont conservés intégralement, de même que les 283 props et 648 placements de détails hérités. Cinq locaux de service originaux sont ajoutés avec leurs dix raccords physiques, quarante-sept placements de props supplémentaires et trente détails. Ils créent des détours et des boucles ; ils ne constituent pas cinq nouvelles missions principales.

Les nouveaux locaux, panneaux, contenus de coffrets, dialogues et mécanismes sont des choix de cette adaptation de fan. Ils ne prétendent pas apparaître tels quels dans le film, ne sont pas des plans réels de Gunnison et ne modifient pas le dénouement du module. Les coordonnées sont des unités internes de gameplay, pas des mesures en mètres. Il reste des ellipses et des événements racontés.

Le rendu est dessiné par code Canvas : silhouettes vectorielles articulées et matériaux procéduraux. Aucun nouvel asset photoréaliste, aucune reconstitution 1:1, aucun extrait visuel ou sonore du film. Le travail de cette passe porte sur les cinq nouveaux intérieurs et leurs éléments interactifs ; les trente-six lieux antérieurs n’ont pas tous reçu une refonte artistique. Un placement n’est pas un sprite unique.

### Circulation des cinq annexes

Chaque annexe a un accès primaire franchissable lorsque la séquence autorise les deux extrémités. Son deuxième raccord doit être libéré par une commande placée à l’intérieur, avec E et une durée de 1,35 seconde. Bouger ou subir un coup interrompt cette action. Une fois ouvert, le raccord le reste pour la suite de la campagne, mais il ne contourne jamais une restriction de séquence. Le verrou K ne remplace pas la commande intérieure. La carte ne téléporte pas le joueur.

La station de relevage rejoint la chambre de répartition et la galerie de maintenance. Wolf peut l’explorer dans ses séquences ; Dallas peut aussi y retourner depuis le sous-sol durant la montée vers le toit. Le détour par le collecteur permet ainsi de récupérer la signalisation humaine. La réserve du diner possède un escalier depuis la cuisine et un escalier extérieur de livraison. L’atelier du shérif rejoint le poste et le quartier résidentiel ; la voiture de service en panne est un obstacle décoré, pas un véhicule pilotable. La pharmacie relie l’accueil au triage. La blanchisserie relie le sous-sol au palier inférieur de l’escalier protégé, pas directement au toit.

Les nouveaux volumes sont organisés autour d’un mur équipé, d’une allée dégagée et de rangements au premier plan. Les laveuses et pompes sont raccordées au mur technique ; les rayonnages et armoires restent distincts des machines. Les points d’interaction des coffrets de premier plan se trouvent du côté de l’allée, pas au-delà de la limite praticable. Les détails de décoration ne créent pas de collision cachée.

### Contenants physiques et stocks finis

Quinze contenants sont liés à quinze props identifiés : dix dans les nouveaux locaux, cinq dans les lieux existants. Ils s’ouvrent avec E en 1,15 seconde. Ils sont réservés aux humains ; Wolf ne prend pas leurs soins ou leurs fusées. Chaque contenant possède au moins un parcours humain autorisé. Les armes ne se débloquent pas simplement en ramassant des munitions.

Le stock de ces quinze contenants est **global à la campagne**, contrairement aux anciens points de ravitaillement procéduraux qui gardent leur fonctionnement par séquence. Quitter une pièce, changer de chapitre ou réimporter le JSON ne remplit pas les coffrets déjà pris. Le couvercle ou la porte reste ouvert dans le rendu. Quand la dotation est pleine, le reliquat demeure exactement dans le contenant ; le joueur pourra le reprendre après avoir dépensé des ressources. Capacité du groupe : six fusées ; limite interne de vingt kits par personnage et deux-cent-cinquante cartouches par réserve. Ces plafonds ne sont pas des quantités offertes.

La reprise après décès restaure un état antérieur cohérent : elle n’ajoute pas le stock d’un contenant une seconde fois au même inventaire. Les anciens changements de séquence gardent leurs aides de survie, notamment le minimum de vitalité et de soins. Cette version ne prétend pas rééquilibrer toute l’économie héritée.

### Fusées éclairantes

L ou le bouton tactile lance une fusée dans la direction de visée, jusqu’à 360 unités. La trajectoire visuelle dure 0,55 seconde et s’arrête avant un obstacle solide ; un lancer sans espace suffisant est refusé sans consommer l’objet. La lumière dure dix-huit secondes simulées à compter du lancer. Elle vieillit même si le joueur quitte la pièce ; les menus la mettent en pause. Quatre fusées actives au maximum, six dans la dotation.

L’impact produit un bruit bref à sa propre position. Une créature qui ne voit plus directement le joueur peut ensuite rechercher une fusée visible jusqu’à 520 unités, sous condition de ligne de vue. La lumière influence aussi la visibilité locale près d’elle. Un mur bloque le stimulus lumineux ; une cible humaine directement visible reste prioritaire. La fusée ne fait aucun dégât, ne confère aucune invulnérabilité, ne repousse pas magiquement les ennemis et n’est pas disponible dans le vol. Position et temps restant sont conservés par la sauvegarde.

### Carnet, découverte et parole

Les nouvelles annexes ne sont révélées sur le plan qu’après visite ou observation de leur entrée proche, à moins de 190 unités sans obstacle visuel. Leurs raccords secondaires s’affichent après activation. Les anciens lieux conservent la présentation héritée : ce n’est pas un brouillard de guerre appliqué à toute la ville. La liste textuelle des passages suit la même règle que le schéma.

Le carnet présente les fusées du groupe, les soins du personnage courant, les locaux visités et les raccords libérés. Huit déclencheurs contextuels originaux ajoutent des sous-titres et un historique consultable : trois après des actions principales, cinq à l’entrée des annexes. Ils ne sont joués qu’une fois par campagne. Aucune voix d’acteur, synthèse vocale ou citation du film n’est incluse.

### Son local facultatif

Le son est désactivé par défaut. La case des réglages initialise un véritable AudioContext après une action utilisateur. Six catégories d’ambiance sont définies : forêt, rue, industrie, médical, intérieur domestique et vol. Le moteur module les pas selon le terrain et distingue notamment armes à feu, plasma, pièces métalliques, mécanismes et fusées. Il s’agit de bruit et d’oscillateurs synthétisés, pas d’enregistrements réalistes ou d’une bande originale.

Le volume est réglable, les menus suspendent le contexte, les effets transitoires sont plafonnés à vingt voix et leurs nœuds sont libérés après lecture. Les tests vérifient l’exécution et la gestion des nœuds, pas une appréciation acoustique sur casque, une normalisation sonore ou une compatibilité universelle des navigateurs.

### Sauvegarde et continuité

L’espace local reste `tantalus.mire.avpr.v1`. Le JSON 0.4 transporte `v4.stock`, les cinq commandes, les découvertes, les fusées, leurs âges et les sous-titres déjà déclenchés, ainsi que le point de reprise. Les identifiants inconnus, quantités hors limites et lumières incohérentes sont filtrés. L’export reste local, sans anti-triche ni serveur d’autorité.

Les versions 0.1, 0.2 et 0.3 se chargent sans inventer de nouvelles récompenses. Une ancienne partie déjà à la clairière n’est pas replacée au début du vol. L’export JSON depuis l’ancien dossier, puis l’import dans le nouveau, est la méthode explicite pour changer de chemin. Conserver l’original avant migration ; le retour d’une sauvegarde 0.4 vers une ancienne version n’est pas garanti.

L’installateur ne fait qu’ajouter ou mettre à jour un lien vers `src/dlc/avpr/index.html` dans un menu reconnu. Il garde l’ancien HTML lors d’une mise à niveau et refuse les fichiers modifiés. Aucun GameEngine commun, récompense Frontier, profil du jeu hôte, dépôt distant ou déploiement n’est modifié.

## Validation exécutée et limites

173/173 tests Node et 128 contrôles Chromium réussis (48 de socle, 34 de séquences 0.3, 46 de nouveautés 0.4). Les trois campagnes Histoire / Standard / Survie terminent chacune cinquante objectifs, quarante-neuf passages et zéro décès. Le bot connaît la carte et vise précisément ; il utilise les actions et déplacements du moteur sans modifier positions, santé ou objectifs pour réussir. Ce n’est ni un parcours humain ni une mesure de durée / difficulté.

Cinq tours facultatifs indépendants partent de vrais checkpoints produits par ces campagnes, puis utilisent la marche, les portes et E. Ils ouvrent les dix coffrets des annexes, cinq commandes et cinq notes, sortent par le deuxième raccord et reviennent. Les objectifs principaux et la vitalité sont conservés. Les tests unitaires et scénarios navigateur emploient aussi des états préparés pour isoler des cas : ils ne doivent pas être confondus avec ces parcours.

Playwright exécute le HTML assemblé avec Chromium via `set_content`. La navigation HTTP locale a été refusée par l’environnement et l’outil agent-browser n’était pas installé. La sauvegarde est testée sur un Storage mémoire ; les vrais contrôles d’import/export de fichiers JSON sont exercés. Un scénario sans stockage est aussi exécuté. Ces preuves ne certifient pas la persistance native `file://`, le déploiement, Firefox / Safari ou un téléphone physique. Les tests audio contrôlent un AudioContext réel et ses nœuds, pas une appréciation à l’écoute.

L’installateur 0.3 et son vrai HTML sont appliqués à un menu temporaire, puis mis à niveau par la 0.4. Le menu reste identique pendant la mise à niveau, le payload précédent est préservé, une répétition ne crée pas de doublon et la désinstallation restaure le menu original. Il ne s’agit pas d’un test du jeu hôte complet.

Les traces sont dans `rapport/tests-node.tap`, `browser_qa.json`, `browser-v03.json`, `browser-v04.json`, `campaign-*.json`, `annex-tours.json` et `upgrade-v03.json`. Empreinte SHA-256 du jeu testé : `5bd2daf3c91ff76f7a727e9e6b5ea2e73e289be2cf7059eb0c329a0a2f438344`.

Le module demeure autonome et non publié : aucune fusion MIRE commune, aucune récompense partagée, aucun push GitHub et aucun déploiement Vercel. Pas de nouveaux boss, de passagers à santé individuelle complète, de voix d’acteurs, de vol libre ou de graphismes photoréalistes. La validation humaine prolongée et la production artistique détaillée restent à poursuivre.
