# Effets visuels de mission (V188)

Document source uniquement, exclu du build public. Code : [`src/vfx-v188.js`](../../src/vfx-v188.js) (pool, émetteurs, couche moteur) et [`src/vfx-slots-v188.js`](../../src/vfx-slots-v188.js) (emplacements nommés et primitives de repli). Tests : [`scripts/verify-vfx-v188.mjs`](../../scripts/verify-vfx-v188.mjs) (`npm run test:priorities:v188`).

## Principe

- **Présentation seulement** (guide `game-feel`) : chaque effet part d’un événement déjà accepté par le jeu — tir ayant produit un projectile, dégâts appliqués, mort, projectile arrêté par une paroi, impulsion du détecteur acceptée, pas compté par `withFootstepCuesV188`. Aucun effet ne modifie acteur, projectile, cible, collision ou sauvegarde ; le test « presentation only » compare tirs, dégâts, position et munitions avec et sans la couche.
- **Réutilisation** : les éclats de lumière de bouche et les douilles restent à `weapon-effects-v124`, le marqueur d’impact et les secousses à `combat-feel-v188`, la pluie de tempête à `game-v52-level-runtime`, l’affichage du détecteur à `motion-tracker-v160`. La couche V188 comble les manques.
- **Budget** : 320 particules préallouées et recyclées (48 en mouvement réduit), 24 brûlures au sol (fusion des gouttes proches, éviction de la plus ancienne), aucun dessin hors du champ (+48 px).
- **Accessibilité** : mouvement réduit = pas d’étoile de bouche, pas de balayage de gyrophare, pas de pause d’impact, teinte de blessure basse et sans pic, particules moitié moins nombreuses, plus courtes et plus lentes. La pause d’impact disparaît aussi quand la secousse d’écran est à 0. Mode daltonien : chaque effet garde une forme propre (étoile, trait, losange d’acide, goutte ronde, goutte cerclée synthétique, anneau, coin du détecteur) en plus de sa couleur.
- **Images** : pas de génération d’image pour l’instant (décision du propriétaire, 2026-11-15). Tout est dessiné en primitives Canvas, comme **placeholders**, derrière les emplacements ci-dessous. Pour livrer une image : la déposer à `assets/vfx/v188/<id>.png`, ajouter l’`id` à `VFX_SLOT_FILES_PRESENT_V188`, l’ajouter au cache de `sw.js`, puis l’observer en jeu.

## Emplacements

| id | couche | taille (px) | usage |
| --- | --- | --- | --- |
| `muzzle-star` | world-fx | 34×22 | Flash de fusil / PM / sentinelle, deux images alternées par tir accepté |
| `muzzle-flame` | world-fx | 60×26 | Langue de flamme du lance-flammes / incinérateur |
| `muzzle-arc` | world-fx | 20×20 | Décharge des armes électriques / à énergie |
| `muzzle-smoke` | world-fx | 24×24 | Fumée de bouche (tous les trois tirs, chaque tir explosif) |
| `smartgun-tracer` | world-fx | 48×4 | Traçante derrière chaque projectile M56 |
| `impact-spark` | world-fx | 20×20 | Projectile arrêté par une paroi métallique |
| `impact-acid` | world-fx | 24×24 | Touche sur xénomorphe : gouttes d’acide |
| `impact-blood` | world-fx | 16×16 | Touche organique |
| `impact-synthetic` | world-fx | 16×16 | Touche sur synthétique |
| `acid-burn` | decal | 48×12 | Brûlure laissée par l’acide qui atteint le pont ; fume 5 s, refroidit, disparaît en 14 s |
| `acid-smoke` | world-fx | 22×22 | Fumée âcre de la brûlure |
| `explosion-fireball` | world-fx | 120×120 | Explosif, gel incendiaire |
| `explosion-smoke` | world-fx | 64×64 | Fumée d’explosion |
| `debris-chunk` | world-fx | 6×6 | Éclats projetés |
| `ember` | world-fx | 4×4 | Braises |
| `panel-spark` | world-fx | 12×12 | Panneau mural endommagé (décor destructible V130 sous 70 %) |
| `steam-puff` | world-fx | 32×32 | Vapeur des grilles de conduit à bord |
| `footstep-dust` | world-fx | 20×10 | Poussière de pas (béton, résine, réception de saut, vent de tempête) |
| `footstep-splash` | world-fx | 20×12 | Éclaboussure de pas dans l’eau |
| `tracker-ping` | world-fx | 160×160 | Impulsion du détecteur dans le monde : anneau faible + coin orienté |
| `damage-vignette` | overlay | 1280×720 | Bords rouges quand le marine est blessé |
| `sodium-wash` | overlay | 1280×720 | Lavis orangé d’éclairage de secours au pic de tension |
| `alarm-strobe` | overlay | 1280×720 | Balayage de gyrophare ambre au pic de tension |

Échelle du projet : 1 m ≈ 51 px, marine debout 44×92 px.

## Sources et fidélité

Les scènes sont décrites de mémoire de visionnage ; elles servent de référence documentée, à revérifier sur la source avant toute production d’image. Les placeholders Canvas sont des **adaptations du projet** : ils n’atteignent ni ne certifient une fidélité « 1:1 », et une image générée plus tard ne la certifiera pas davantage.

| Effet | Référence documentée (scène, en mots) | Adaptation du projet | À définir |
| --- | --- | --- | --- |
| Flash du M41A | *Aliens* (1986), embuscade sous le processeur atmosphérique : dans le noir, les fusils à impulsions éclairent les marines d’un flash en étoile à plusieurs branches qui scintille au rythme de la cadence. | Deux images alternées (A : longue branche avant et barre courte ; B : étoile en X trapue), une par tir accepté, 50 ms ; la lueur reste à `weapon-effects-v124`. | Cadence image par image du flash à l’écran ; forme exacte des branches. |
| Traçantes du smartgun | *Aliens* (1986), même embuscade : Vasquez et Drake tirent au M56 depuis le harnais, flamme de bouche nourrie. | Trait jaune chaud à queue orangée derrière chaque projectile M56 (famille `smart`), plus court en mouvement réduit. | La présence de traçantes visibles à l’écran n’est pas établie : élément à vérifier, traité ici comme lisibilité de jeu. |
| Sang acide et pont rongé | *Alien* (1979), infirmerie : la patte du facehugger coupée, l’acide traverse plusieurs ponts successifs en fumant. *Aliens* (1986), évacuation vers l’ascenseur : Hicks est brûlé par une gerbe d’acide en abattant un xénomorphe à bout portant. | Losanges jaune-vert projetés à la touche et à la mort ; à l’arrivée au pont, brûlure noire à bord bouillonnant qui fume 5 s puis refroidit ; fusion des gouttes proches. | Le pont ne se perce pas (règle de jeu hors périmètre). |
| Détecteur de mouvement | *Aliens* (1986), opérations de Hadley’s Hope : l’écran du M314 en éventail avec ses échos et la distance en mètres, le bip dont la hauteur monte quand la cible approche. | Affichage existant (`motion-tracker-v160`) inchangé ; la couche V188 ajoute dans le monde un anneau faible et un coin de deux arcs orienté vers le regard de l’opérateur, seulement pour une impulsion acceptée. | Le film ne montre pas d’onde dans l’espace : c’est une transposition de l’écran au décor. |
| Éclairage de secours | *Aliens* (1986), dernier acte : compte à rebours du processeur atmosphérique, gyrophares ambre tournants, vapeur et sirènes pendant la descente de Ripley. | Au pic du directeur de tension : lavis orangé « sodium » respirant lentement (0,35 Hz) et balayage de gyrophare ambre en haut d’écran ; mouvement réduit = lavis fixe seul. Aucun clignotement au-delà de 1 Hz. | Couleur sodium : choix du projet ; pas de stroboscope blanc (risque photosensible). |
| Étincelles, vapeur, explosions, poussière | Ambiances générales des coursives et du complexe de *Aliens* (1986). | Primitives génériques. | — |

## Mesures

Chromium headless (rendu logiciel), 1280×720 à deviceScaleFactor 2, même build avec la couche activée (`on`) ou désactivée (`vfxV188Enabled = false`, `off`) après l’atterrissage, tir continu pendant 3 s ; ordre alterné off/on/on/off/on/off ; durée moyenne de `draw()` en ms (moyenne des trois exécutions, extrêmes entre crochets).

| Scène | Série A (save/restore par particule) off → on | Série B (lot unique, deux passes de fusion) off → on |
| --- | --- | --- |
| QZ-17, soute en profondeur, xénomorphe au contact (~25 particules, 4–5 brûlures) | 18,71 [18,58–18,95] → 21,02 [18,78–23,33] | 19,36 [18,71–20,49] → 19,45 [18,44–21,08] |
| Cargo Sevastopol (pair-004), soute du cargo, tir sur paroi (~10 particules) | 16,98 [14,56–19,96] → 15,21 [13,35–16,21] | 17,21 [15,74–18,65] → 16,57 [14,18–18,03] |
| Colonie LV-426 (pair-001) | 16,80 [15,55–18,45] → 16,73 [16,47–16,89] | — |

La série A montrait un surcoût d’environ 2,3 ms sur la scène QZ-17 ; après regroupement du dessin (série B), l’écart reste dans le bruit de mesure. Aucun gain n’est annoncé.
