# AVP 2004 — raccord des deux décors V002 et recette exécutée

## Résultat

Le Snowcat de la zone d’arrivée et les ossements de la station utilisent les deux PNG V002 dans le rendu jouable. Le carnet reprend l’image réellement décodée par le renderer. Les 145 SVG restent disponibles comme secours ; le HTML conserve ses 30 scripts, la version 0.11.0 et le schéma de sauvegarde 10.

Le bundle vérifié mesure **6 086 145 octets**. SHA-256 : `c757ea479d5f44e56ee9ec02553ef18652f8627a19eb2aa712db959512eb262b`.

Les contrôles ci-dessous portent sur ce HTML autonome et son propre jeu AVP. Ils ne constituent ni une recette de toute la campagne, ni une nouvelle vérification du moteur natif Tantalus, ni un résultat de CI distante. Les apparences et les tailles de mise en scène ne sont pas certifiées 1:1.

## Raccord effectivement livré

`scripts/dlc/avp-2004/RASTERS.json` contient deux chemins source précis, leurs tailles, dimensions et empreintes, ainsi que le cadrage et le pivot. `scripts/build-dlc-avp-2004.mjs` vérifie les originaux et incorpore leurs octets PNG intacts dans le script d’assets existant. Aucun fichier d’image externe n’est demandé par le HTML pour ces deux décors.

Le renderer attend la résolution des chargements SVG avant d’installer les deux remplacements PNG. Un échec de décodage laisse donc le SVG disponible ; le chargement tardif d’un SVG ne peut pas écraser un PNG réussi. Le découpage source, le pivot de contact et une boîte maximale de présentation préservent le rapport largeur/hauteur sans modifier les coordonnées, les collisions ou les seuils.

| Identifiant actif | Scène et position conservées | Cadrage source `[x,y,w,h]` | Pivot source | Boîte de présentation |
| --- | --- | --- | --- | --- |
| `film-snowcat` | `landing`, x520 / y77, hauteur demandée 185 | `[38,5,2098,710]` | `[1087,715]` | `[380,185]` |
| `whalebone` | `station`, x350 / y225, échelle 1,4 ; hauteur demandée 168 | `[67,38,1669,822]` | `[901.5,860]` | `[360,168]` |

Le cadrage provient de la boîte alpha ≥128 observée dans chaque PNG. Le pivot est au centre de son bord inférieur. Les boîtes de présentation sont exprimées dans les unités de la scène ; elles ne mesurent pas les objets du film. Le ratio du Snowcat limite sa hauteur à environ 129 unités pour une largeur de 380. Les côtes gardent une hauteur de 168 et une largeur de 341,1 unités. Leur position au premier plan explique qu’elles recouvrent partiellement les jambes de Lex lorsqu’elle passe derrière ; la porte du bureau reste dégagée.

| Source PNG intacte | Octets | Dimensions | SHA-256 |
| --- | ---: | --- | --- |
| `assets/openai/sprites/avp2004-reference-v002/snowcat-avp2004-v002.png` | 1 963 290 | 2172×724 | `b52a3a30a70c8a43fdc9b6390025a71804c8cde979eb9e309d0c70e2de579b98` |
| `assets/openai/sprites/avp2004-reference-v002/whalebone-avp2004-v002.png` | 1 763 267 | 1774×887 | `b3a6b036ff5328ec698635bd89ea0f8c589c22d7b97f0294a1d9fd5d68667c2c` |

La relecture des données PNG extraites du HTML produit exactement ces deux tailles et empreintes.

## Contrôles exécutés

### Construction et simulation Node

`node scripts/build-dlc-avp-2004.mjs --check` réussit : HTML strictement identique à la reconstruction, 30 modules, 6 086 145 octets.

`node scripts/verify-dlc-avp-2004.mjs` réussit **20/20**. La nouvelle vérification confirme que seuls les deux identifiants de décor reçoivent des PNG autonomes, que leurs SVG de secours subsistent, que les dimensions/cadrages/pivots sont cohérents et que `film-newborn` ne reçoit aucun remplacement. Les contrôles préexistants de sauvegarde, de simulation et de retour hôte restent réussis. Les doubles DOM/navigation/stockage de cette suite Node sont distincts des parcours Chromium ci-dessous.

Une comparaison supplémentaire avec le HTML de la base Git confirme l’identité exacte des données `rooms`, `chapters`, `filmProps`, `filmActors`, `operations` et `fidelityAudit`, ainsi que de tout `AVP_ASSETS`. Les **44 lieux, 104 faces de porte, 250 fiches et 145 SVG** conservent donc leurs données. Aucun défaut de porte nouveau n’a été démontré, et aucun seuil n’a été déplacé pour accompagner ces visuels.

Les statuts du catalogue restent : SCENE 113, ACTIF 35, LIEU 19, A_VERIFIER 15, ABSENT 19, HORS_CAMPAGNE 42, DOCUMENT 7. La présence de nouveaux pixels ne ferme aucune fiche manquante ni aucun contrôle canonique.

### Navigateur réel

**Chromium Headless Shell 143.0.7499.4**, déjà disponible dans le workspace, exécuté par Playwright. Aucun navigateur n’a été téléchargé. Le wrapper `/usr/bin/chromium` ne fonctionnait pas car son exécutable cible manquait ; la recette utilise le binaire réellement présent et testé.

| Profil | Fenêtre | Vues observées | Chargement | Parcours et reprise |
| --- | --- | ---: | --- | --- |
| Desktop HTTP | 1365×900 | 4 : deux scènes × hybride/classique | PNG décodés et dessinés | Réussis |
| Mobile HTTP | 390×844 | 4 : deux scènes × hybride/classique | PNG décodés et dessinés | Réussis avec commandes tactiles/pointeur |
| Desktop fichier local | 1365×900 | 4 : deux scènes × hybride/classique | PNG intégrés, `file://` | Réussis |
| Desktop PNG corrompus | 1365×900 | 4 : deux scènes × hybride/classique | Deux échecs de décodage simulés ; SVG dessinés | Réussis |

Les quatre profils totalisent **16 observations de scène**, dont 12 avec PNG et 4 avec SVG de secours, ainsi que **8 parcours**. Dans chaque profil :

1. Création d’une nouvelle partie par le bouton de production.
2. Import explicite d’un carnet de test construit par `AVP_CORE.fresh`, avancé au chapitre 2, avec une scène et une position de départ déclarées. L’import passe par le vrai champ de fichier du carnet. Aucun acteur, seuil, contrôle, collision, horloge ni mouvement n’est remplacé après cet import.
3. Déplacement vers la sortie de `landing`, interaction native, arrivée dans `station`, retour dans `landing`, sauvegarde réelle puis rechargement de la page et reprise. Les champs `room`, `chapter`, `mode`, `player`, `flags` et `inventory` sont comparés exactement avant/après reprise.
4. Depuis une autre fixture de départ dans la station, déplacement en profondeur vers la porte de façade du bureau, entrée native dans `office`, puis retour dans `station`.

Chaque position enregistrée est vérifiée libre avec le vrai contrôle de collision. L’arrivée extérieure est `station` x155/y172 ; le retour du bureau est `station` x565/y93. Les parcours couvrent les deux raccords choisis, sans prétendre traverser les 52 liaisons de la campagne.

Les pages sont chargées sans paramètre QA : `__AVP_TEST__` reste absent. Une observation non destructive de `CanvasRenderingContext2D.drawImage` relève le type réellement dessiné, les dimensions décodées et le cadrage utilisé. Pour le profil de panne seulement, le setter de source des images remplace explicitement les PNG par des octets invalides ; le vrai chemin de chargement et de secours du renderer s’exécute alors.

**Résultats : zéro erreur JavaScript, zéro requête distante, zéro débordement horizontal** sur les 16 vues. Les contrôles mobiles hérités recouvrent une partie importante du bas de la scène ; cette recette vérifie leur fonctionnement et ne revendique pas une nouvelle conception de l’interface tactile.

Le carnet a été contrôlé séparément dans Chromium : la vignette `film-snowcat` utilise le PNG réellement chargé, le compteur reste 250/250, l’ancienne affirmation « tout vectoriel » a disparu, la réserve de fidélité reste affichée.

## Captures et reçus

Les six captures de livraison sont des captures Chromium non retouchées. Les comparaisons desktop avant/après utilisent la même taille de fenêtre, les mêmes fixtures et le réglage de mouvement réduit.

- `before-desktop-landing.png`
- `before-desktop-station.png`
- `desktop-landing.png`
- `desktop-station.png`
- `mobile-landing.png`
- `mobile-station.png`

Les six captures originales sont conservées dans [evidence](evidence). Leurs tailles et empreintes figurent dans [manifest.json](manifest.json). Les reçus navigateur avant/après y sont intégrés avec leurs états initiaux abrégés aux identifiants ; les drawImage observés, parcours, erreurs et requêtes y sont conservés. Le contrat Node détaillé y figure aussi. Le script de recette temporaire n’est pas une dépendance du jeu ; son empreinte et celles des reçus bruts sont enregistrées pour traçabilité.

## Limites conservées

Cette passe remplace deux décors déjà présents. Le Snowcat reste un véhicule de décor, les ossements restent un élément de scène. Aucun pilotage, aucune nouvelle arme, aucune mort de compagnon et aucune créature nouvelle ne sont ajoutés. L’épilogue garde son artwork `film-newborn`. Les photographies de référence, les inconnues de détail et les autres candidats sont suivis dans le dossier documentaire de la passe V002 ; les mesures ci-dessus concernent l’intégration graphique, pas une certification du film.

## Originaux, références et revue visuelle

Les cinq PNG nouveaux totalisent **9 917 937 octets**. Ils sont des copies exactes des sorties du générateur, avec dimensions, SHA-256 et identifiant de blob Git calculés dans le manifeste. Pillow a seulement inspecté le canal alpha, sans modifier les fichiers. Sept des huit images de référence inspectées ont fourni des pixels aux générations ; la photographie AVP Central est un contrôle auxiliaire. Les photographies externes ne sont pas redistribuées.

La revue des captures desktop confirme le contact au sol et le dégagement du bureau. Sur mobile, les commandes héritées couvrent encore une grande partie du bas de la vue. La revue des candidats écarte l’activation de Celtic (trois quarts frontal, état endommagé à attribuer) et de la machine Reine (chaînes tronquées, 64 pixels alpha128 en bordure). Le satellite demeure une étude de maquette sans scène orbitale raccordée. Aucun score de ressemblance automatique ou certification 1:1 n’est annoncé.

## Vérification des fichiers du dépôt

Les contrôles suivants ont été exécutés après la présence des cinq documents, cinq PNG et six captures :

| Commande ou contrôle | Résultat local |
| --- | --- |
| `npm run test:dlc` | **39/39 tests réussis** : 23 contrôles de succession/admission, 15 contrôles de menu et un test du bundle qui exécute les 20 contrats internes AVP |
| `npm run check:dlc:avp` | Reconstruction strictement identique : 6 086 145 octets, 30 modules |
| `verifyAvpAdmission(process.cwd())` | **182 fichiers vérifiés**, manifeste et runtime conformes |
| Admission des 33 fichiers modifiés ou nouveaux | **0 rejet** ; chemins exacts, originaux exclus de la copie de production |
| Liens des six Markdown de cette passe | **70 liens relatifs, 0 cassé** |
| Bible centrale | 17 autres DLC et 22 décisions préservés ; JSON hors entrée AVP inchangé |
| `git diff --check` | Réussi |

Les 39 tests Node et les 20 contrats internes se recouvrent : ils ne doivent pas être additionnés. Les tests incluent le refus des fichiers inattendus, la conservation des reçus historiques, les empreintes des PNG et l’activation de seulement deux identifiants. La révision du manifeste AVP vaut 2 ; son SHA-256 final est `f0e9001f450dab9ede06c3823130b84665dbc3d7218c26a65823fd40b7fe6adf`.

Le statut d’archive obsolète du manifeste et de son README a aussi été corrigé à partir du [reçu conservé](../../../../archives/local-recovery-20261125/PENDING_TRANSFER.json), identique à la base et de SHA-256 `cb4550b13e8bca6d2026753e3c98041797632bd1189db731cb7745c953b2a6d7`. Ce reçu confirme la conservation du ZIP AVP de 58 704 014 octets en six fragments au commit d’archives `6ed9b9210a097bbdf90ec3a22043a3fe5845e541`. Cette passe ne prétend pas l’avoir téléchargé et réassemblé une nouvelle fois.

Ces résultats sont locaux. Les exécutions de CI d’une ancienne PR ne sont pas attribuées à cette passe, et aucune réussite globale de la release n’en est déduite.
