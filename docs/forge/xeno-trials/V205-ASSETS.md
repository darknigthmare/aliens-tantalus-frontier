# Xeno Trials — visuels V205

Lot produit le **20 novembre 2026**, à partir de la branche
`feat/xeno-trials-priorities-v204`, commit
`2e784c74a8ad0779438d5f44e8184dd6f7423ddf`.

## Contenu livré

**26 PNG originaux sélectionnés** : 16 visuels raccordés à la présentation
existante du jeu et 10 poses de personnages conservées pour la production.
Les fichiers générés restent à leurs dimensions natives ; aucun redimensionnement
ou détourage destructif n'a été appliqué aux PNG après génération.

| Catégorie | Nombre | Contenu | Statut |
| --- | ---: | --- | --- |
| Décors | 3 | Banc de confinement, Anneau réacteur simulé, Chambre de ruche simulée | Raccordés aux trois arènes existantes |
| Projectiles | 5 | Grappe acide, jet acide dirigé, projectile à impulsion, onde au sol, goutte acide | Présentation facultative des projectiles existants |
| VFX | 8 | Éclaboussure acide, flaque acide, vapeur, décharge cryogénique, arc électrique, impact de débris, détonation, cône de flammes | Présentation des événements et dangers existants |
| Grid | 1 | Contact de l'attaque lourde | Pose isolée de production |
| Gorilla | 3 | Préparation, contact et récupération de l'attaque lourde | Trois poses de production |
| Arachnoid | 6 | Préparation, contact et récupération de l'attaque légère ; préparation, phase active et récupération du spécial | Six poses de production |

Les images se trouvent sous
[`assets/openai/xeno-trials-v205`](../../../assets/openai/xeno-trials-v205).
Le [manifeste du lot](ASSET_LOT_V205.json) contient chaque chemin, empreinte SHA-256,
taille, dimension, mesure de transparence, prompt exact et référence de génération,
ainsi que l'inventaire détaillé des 131 arènes et des 189 combattants au départ.
Il conserve aussi la trace des deux effets corrigés et les limites de chaque pose.

## Raccordement au jeu

Les trois décors complètent les trois entrées qui n'avaient pas d'image de fond.
Les lignes de sol mesurées dans les images sont alignées sur le sol du combat.
Le renderer conserve les proportions et les autres arènes gardent leur traitement
existant. Si un décor n'est pas disponible, le dessin de secours reste utilisable.

Les projectiles et VFX se chargent à leur première utilisation. Une image absente,
non décodée ou chargée après l'arrêt de la partie n'empêche pas le rendu
procédural existant. Les projectiles suivent leur vitesse réelle ; l'illustration
ne recalcule pas leur cible. Les dangers gardent leurs zones, avertissements et
bordures. Les effets sont contenus dans ces zones. La flaque corrigée est assez
basse pour rester lisible à la hauteur native ; l'éclaboussure corrigée est entière.

Les images transparentes sont cadrées par des rectangles source mesurés
dans leur canal alpha. Ce cadrage de rendu ne modifie pas les fichiers originaux.
Les dégâts, trajectoires, fenêtres de collision, identifiants de contenu et formats
de sauvegarde ne sont pas modifiés.

Les **10 poses de personnages ne sont ni chargées par le jeu, ni admises dans le
build public**. Elles restent dans les sources et dans le pack de production.
Seuls les 16 visuels utilisés par le runtime sont admis comme nouveaux PNG de
distribution. Le module de rendu rejoint le shell hors ligne ; les images ne sont
pas toutes précachées au démarrage.

## Références et fidélité

La cible demandée est une fidélité 1:1. Le lot suit les références visuelles du
projet, sans certifier une identité pixel par pixel ou une exactitude canonique :

- Grid : [`film_grid_avp_2004.png`](../../../assets/user/castes-v87/film_grid_avp_2004.png).
- Gorilla : [`kenner-gorilla-neca.png`](../../../assets/openai/sprites/static-enemy-v94/kenner-gorilla-neca.png).
- Arachnoid : [`game_avp_capcom_arachnoid.png`](../../../assets/user/castes-v87/game_avp_capcom_arachnoid.png), identité arcade Capcom ; aucune substitution par une variante NECA « Movie Deco ».

Chaque PNG de personnage représente un seul sujet, de profil vers la droite,
avec une transparence réelle. La revue visuelle a contrôlé les extrémités et la
queue, la silhouette, la palette et les signes distinctifs des références.
L'anatomie latérale non visible sur une référence de trois quarts demeure une
interprétation. Les trois décors sont des simulations originales de Tantalus ;
ils ne sont pas présentés comme des reproductions de plans de films.

## Vérifications

Les contrôles suivants ont été exécutés après le gel des 26 images et du manifeste :

| Contrôle | Résultat observé |
| --- | --- |
| `npm run test:trials:visuals:v205` | **16 tests réussis, 0 échec** |
| Signatures V147, acide V152, dangers V188 | **173 tests réussis, 0 échec** |
| `node --test scripts/verify-xeno-priorities-audit-v204.mjs` | **3 tests réussis, 0 échec**, après matérialisation des huit images de référence V202/V203 requises |
| Syntaxe des JS/MJS concernés | **31 fichiers valides** |
| Registre chargé depuis les modules du jeu | **131 arènes sur 131 avec un `backdrop`**, aucun identifiant sans décor |
| Intégrité des 26 PNG et du manifeste | Tailles, dimensions, SHA-256 et bornes alpha contrôlés ; 23 PNG transparents et 3 décors opaques |
| Admissions V205 | 16 PNG autorisés dans la distribution ; 10 poses réservées aux sources ; un fichier inconnu dans le dossier est refusé |
| Rendus Canvas à taille native | Trois arènes et les types de projectiles/effets inspectés visuellement, avec flammes dans les deux directions |

Commande exacte de la régression ciblée :

```sh
node --test scripts/verify-xeno-trials-signatures-v147.mjs scripts/verify-xeno-trials-acid-v152.mjs scripts/verify-xeno-trials-stage-hazards-v188.mjs
```

Les tests V205 exécutent le contrôleur et le moteur réels avec des doubles
d'interface pour Canvas, le DOM, les images décodées et l'ordonnanceur de frames.
Quatre parcours par entrées de jeu — Spitter, Reine Pathogène, Incinérateur et
Détonateur — comparent une image disponible avec un échec de chargement et
retrouvent le même état de combat. Les cas de chargement tardif après arrêt,
le cadrage alpha, l'orientation, les bornes des dangers et les avertissements
sont également vérifiés. Les tests d'audit vérifient les empreintes et le relais
V204 → V205, en conservant les déclarations historiques.

Les planches de contrôle utilisent les fonctions de rendu de production avec
`@napi-rs/canvas`, les PNG réellement décodés et des paramètres de scène déclarés.
Elles ont permis de corriger les appuis des décors, le cadrage des deux effets
acides et le triangle procédural qui apparaissait derrière les flammes. Le cône
généré a une silhouette de **2,71:1**, plus longue que la cible d'environ 2:1 du
prompt ; le rendu conserve cette proportion dans les bornes natives, sans
étirement ni extrémité coupée.

Ces résultats ne constituent pas un parcours complet en navigateur. Le checkout
utilisé est partiel : **le build global, `check:built` et l'ensemble des suites
historiques ne sont pas déclarés validés**. Un contrôle historique V192 qui lit
les anciens PNG rencontre des ressources hors de ce checkout ; les trois ajouts
de décor sont, eux, vérifiés explicitement. Les autres champs des arènes et les
déclarations historiques conservent leurs comparaisons de référence.

## Travail encore nécessaire

L'audit de départ compte **131 arènes**, dont **128 avaient déjà un décor**, et
**189 combattants**, tous dotés d'une image statique. **37** combattants disposent
d'au moins un geste dessiné intégré ; **152** n'en disposent pas. Un geste dessiné
ne signifie pas qu'un ensemble complet d'animations existe. Le manifeste détaille
les actions dessinées, déformées par maillage ou encore statiques pour chacun.

Les nouvelles poses ne diminuent pas encore ces 152 cas. Les formats Arachnoid
varient entre les actions ; les trois poses Gorilla ont des appuis à des hauteurs
différentes dans leurs canevas. Il faut donc mesurer l'échelle anatomique, les
pivots des pieds et des contacts, puis vérifier les transitions et le minutage.
Grid conserve une main complète mais une marge droite étroite de 9 px au seuil
alpha supérieur à 16 ; aucun recadrage supplémentaire n'est admis par défaut.

Les avertissements de flaques et de dangers restent ceux du moteur, ainsi que
les dessins de secours lorsque les nouvelles textures ne sont pas disponibles.
Scorched, Siren et Striker ne figurent pas dans le roster V204 audité. Aucune
pose d'une identité canonique n'est automatiquement attribuée à ses variantes
« Altered ».

Un ancien lot de 18 PNG est mentionné dans le suivi antérieur. Son archive n'a
pas été récupérée lors de cette intervention et ses fichiers ne figurent pas dans
le commit de départ. Les **26 fichiers livrés ici ne sont pas un total cumulé avec
ces 18 fichiers**. Leur rapprochement reste ouvert.

La production de ce lot ne clôt donc pas l'ensemble des animations ou la
validation visuelle 1:1 de Xeno Trials. Les statuts « produit », « intégré » et
« vérifié en jeu » restent distincts.
