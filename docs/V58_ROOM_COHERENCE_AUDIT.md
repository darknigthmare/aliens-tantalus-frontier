# Audit de cohérence des salles et du level design — V58

## Verdict

La V58 corrige les défauts de structure qui faisaient encore lire le projet comme un prototype : portes sans destination claire, ascenseurs placés sur des limites de salle, fonds répétés, grandes zones noires, raccords visuels non fonctionnels et cadrage mobile peu jouable.

Le hub est désormais un niveau continu de 16 salles, réparties sur quatre ponts, avec trois portes horizontales et deux puits d’ascenseur par pont. Les missions possèdent des graphes de salles réciproques, des serrures explicites et des décors dédiés par zone. Les images restent volontairement non collidables : le sol, les plateformes, les portes, les échelles et les conduits sont définis par la géométrie runtime afin qu’un détail peint ne promette jamais un passage inexistant.

## Références de level design

L’audit reprend les principes observables dans *Aliens: Infestation*, sans copier ses bitmaps :

- Le [guide GameFAQs](https://gamefaqs.gamespot.com/ds/636598-aliens-infestation/faqs/64273) décrit le Sulaco comme un réseau de 97 salles, 11 sauvegardes et 22 conduits, avec portes soudables, panneaux d’ascenseur et conduits parfois à sens unique.
- L’[entretien de WayForward](https://www.avpgalaxy.net/website/interviews/wayforward-technologies/) insiste sur des salles fonctionnelles, une carte et un détecteur visibles, des outils qui ouvrent de nouveaux itinéraires et une progression par verrous.
- Le [walkthrough vidéo complet](https://www.youtube.com/watch?v=hyLkPqTNeAg) montre l’alternance Sulaco, LV-426 et Phobos ainsi que le retour dans des espaces déjà connus après acquisition d’outils.
- Le [making-of](https://www.timeextension.com/features/the-making-of-aliens-infestation-the-nintendo-ds-metroidvania-classic) confirme l’intention metroidvania et la construction d’un environnement cohérent plutôt qu’une suite d’écrans indépendants.

La transposition retenue pour Tantalus Frontier est donc : une fonction lisible par salle, une destination nommée pour chaque porte, des raccourcis physiques, des retours possibles, des verrous avec cause et solution visibles, et une carte qui représente le vrai graphe.

## Matrice des défauts et corrections

| Priorité | Défaut constaté avant V58 | Correction effective |
|---|---|---|
| P0 | Le puits central était confondu avec la limite entre deux salles. | Deux puits intérieurs possèdent maintenant un identifiant stable, une salle d’accueil et la même abscisse sur les quatre ponts. |
| P0 | Le puits arrière débouchait presque hors du monde. | Sa cage et sa destination sont contenues dans la quatrième salle de chaque pont. |
| P0 | Les portes de mission ne donnaient pas toujours une origine, une destination et un retour explicites. | Chaque porte compilée expose ses deux nœuds, ses deux zones, sa réciprocité, son rôle visuel et, si nécessaire, sa condition d’ouverture. |
| P0 | Des détails peints pouvaient ressembler à des plateformes ou à de fausses portes. | Les couches dédiées sont rendues une seule fois par zone et ne créent aucun collider; toutes les interactions restent issues du plan physique. |
| P0 | Le hub portrait laissait un grand vide et éloignait les commandes de l’action. | Le canvas est centré dans la hauteur utile; commandes, journal et readout sont fixés sous la scène sans la recouvrir. |
| P1 | Les quatre salles d’un pont partageaient le même fond lointain et plusieurs salles avaient un vide noir central. | Chacune des 16 salles possède un FAR opaque et un MID transparent indépendants, en plus de ses couches overhead/foreground et de ses props. |
| P1 | Les profils de plateformes, échelles et conduits étaient trop uniformes. | Les 16 salles ont des positions de traversée dédiées, validées par salle. |
| P1 | Une porte ouverte changeait de taille par rapport à sa version fermée. | Un atlas 2 × 4 conserve la même empreinte, le même pivot et le même cadre pour quatre familles de portes, ouvertes ou fermées. |
| P1 | La mission utilisait une barre linéaire qui ne représentait pas les embranchements. | Le HUD dessine maintenant le graphe réel : salles, routes verticales, conduits, serrures et position courante. |
| P0 | Le profil Neuro Facehugger pouvait afficher une plaque Drone d’une autre caste. | Le contrat `neuro-002` résout exactement `enemy-002-facehugger` et `enemy.facehugger.locomotion`; le retrait du profil restaure la marine Echo-9. |
| P1 | Le premier plan masquait l’UD-4L et la baie véhicules n’exposait pas de châssis physique lisible. | Le crop du foreground libère le dropship; un M577 bitmap séparé possède maintenant collision, interaction et identifiant catalogue exact. |

## Contrats de taille, perspective et placement

- Canvas logique : 1280 × 720.
- Hub : 5120 unités de large, quatre modules de 1280 unités, sol physique à y = 624.
- Coques FAR/MID : sources 1774 × 887, composition 1280 × 640, ratio 2:1 constant.
- FAR : RGB opaque, dessiné au fond et découpé aux limites de sa salle.
- MID : RGBA à alpha réel, dessiné derrière acteurs, portes et props.
- Portes de mission : atlas RGBA 2048 × 2048, grille 2 × 4, cellules 1024 × 512; état fermé à gauche, ouvert à droite.
- Missions : monde auteur de 5200 unités, zones reliées à des nœuds physiques; les 54 bitmaps zonés couvrent six salles du vaisseau, six zones planétaires et six zones coloniales.
- Aucun bitmap V58 ne définit une collision, une porte, une échelle ou une plateforme.

## Inventaire artistique V58 branché

- 16 fonds FAR indépendants pour le hub.
- 16 coques MID transparentes indépendantes pour le hub.
- 18 bitmaps coloniaux : six zones × FAR, MID et foreground.
- 1 atlas de portes, huit cellules et quatre familles fonctionnelles.
- Les 18 bitmaps vaisseau et les 18 bitmaps planète des versions précédentes restent actifs, pour un total de 54 couches zonées de mission.

Ces assets ont été générés pour le projet avec ImageGen, puis contrôlés en dimensions, mode colorimétrique, alpha et composite. Ils sont des créations originales inspirées de la grammaire industrielle survival-horror; aucun fichier officiel n’est embarqué.

## Validation

Les contrôles automatisés couvrent :
- Le M577 de la Vehicle Bay et l’UD-4L du hangar réemploient leurs plaques normalisées existantes comme acteurs visuels séparés; ils ne gonflent pas le total des 51 nouveaux bitmaps.
- Medical et Life Support utilisent des ambiances dédiées afin de conserver leur fonction sans rompre l’exposition du pont; le bandeau d’interaction inférieur est réduit pour ne plus voler la lecture de la scène.


- les 16 contrats FAR et les 16 contrats MID, leur unicité, leurs dimensions et leur mode RGB/RGBA;
- les 54 bitmaps zonés et leur présence dans le cache hors ligne;
- les 16 salles du hub, 12 portes horizontales et six liaisons verticales réciproques;
- cinq éléments de transition par pont : trois bulkheads et deux cages;
- les destinations, surfaces, retours, serrures et feedbacks des trois familles de mission;
- la stabilité de taille des quatre familles de portes;
- le cadrage mobile, la montée d’échelle, le changement de pont et l’absence d’erreurs navigateur.

- le M577 autonome, son identité exacte, sa collision et son interaction dans la Vehicle Bay;
- l’identité Facehugger exacte du profil Neuro puis le retour à la marine standard;
Statut local prouvé au 25 août 2026 :

- `npm.cmd run qa` valide le lint de **126 modules**, **236/236 tests Node** et le build statique **58.0.0** de **3 443 entrées**;
- `npm.cmd run qa:browser:v58` valide **16 checkpoints et 21 captures**, les **16/16 salles**, desktop/mobile, le contrôle hors ligne et l’absence d’exception, d’erreur console ou de requête échouée.

Statut public prouvé au 25 août 2026 : le déploiement Vercel `dpl_6aEDKDA4cNvCrV8rbGJ4xPsty1mw` est **READY**, [l’alias public](https://aliens-tantalus-frontier.vercel.app) répond **HTTP 200**, et le même parcours distant valide **16 checkpoints, 21 captures et 16/16 salles** sans exception, erreur console ni requête échouée.

## Limite de ce verdict

Cet audit certifie la cohérence des salles, portes, parcours et couches de décor. Il ne transforme pas automatiquement chaque promesse de roster en sprite sheet terminée : l’inventaire personnages, ennemis, armes, outils et véhicules conserve ses propres tests de manifeste et d’alpha. Une plaque n’est considérée terminée que si elle est présente, normalisée, branchée au runtime et visible sans débordement.
