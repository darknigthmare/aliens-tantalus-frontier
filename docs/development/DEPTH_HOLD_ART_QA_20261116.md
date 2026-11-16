# Images des cales en profondeur — recette du 16 novembre 2026

Document source uniquement, exclu du build public. Voir [la provenance des cinq PNG](DEPTH_HOLD_ART_PROVENANCE_20261116.json), [la planche avant/après](DEPTH_HOLD_ART_OVERVIEW_20261116.png) et [le reçu de rendu](DEPTH_HOLD_ART_RENDER_RECEIPT_20261116.json).

## Résultat

**Les cinq fichiers absents des emplacements de cale sont produits et raccordés au jeu.** Ils représentent **12 297 311 octets**. Les quatre objets possèdent un canal alpha ; le pont est une matière opaque. Les fichiers de production conservent exactement les octets de la génération, sans réencodage, détourage ou redimensionnement externe.

| Emplacement | Image native | Boîte physique existante | Usage |
| --- | --- | --- | --- |
| `freighter-crate-stack` | 1022 × 1538 | 61 × 92 | Deux caisses superposées sur palette ; sangles orange ; codes variables du cargo |
| `freighter-drum-rack` | 1705 × 923 | 96 × 52 | Trois fûts côte à côte sur un râtelier bas |
| `quarantine-crate` | 1536 × 1024 | 92 × 61 | Caisse scellée, joints givrés, pictogramme et marquage `UN 3373` |
| `quarantine-cart` | 1728 × 910 | 76 × 40 | Chariot renversé sur le côté, coffret fissuré |
| `hold-deck-plating` | 1254 × 1254 | Bande de profondeur du niveau | Matière d’acier antidérapant vue de dessus, projetée par le moteur |

Les tailles de collision, les empreintes au sol, les voies de circulation, les règles de combat et les sauvegardes restent inchangées. Les adaptations visuelles s’appuient sur les références déjà présentes dans le projet ; aucune fidélité franchise « 1:1 » n’est certifiée.

## Raccordement au moteur

`drawDepthHoldSlotV188` découpe au dessin les marges alpha mesurées, conserve les proportions, centre chaque silhouette et l’aligne au bas de sa boîte physique. Les recadrages sont conditionnés aux dimensions natives attendues. Les sources PNG restent intactes. Les caisses de fret reçoivent les codes de leur instance : `C-21/C-22` à l’ouest et `C-34/C-35` à l’est.

`drawDepthHoldDeckV188` répète la matière à une échelle de 192 pixels au bord avant, puis la projette vers le point de fuite des joints existants. Le motif ne s’étire pas sur la longueur entière de la cale. Les fragments de plateformes partagent le même dessin préparé et la même phase ; leurs découpes ne redémarrent pas la texture. Le caillebotis arrière, les joints, la lèvre avant et les ombres de contact restent dessinés par le moteur.

Les images sont chargées par les emplacements existants. Des caches distincts pour les replis et les ponts texturés évitent de conserver le repli après chargement. Les caches de pont sont bornés. Un échec ou une attente de chargement conserve le rendu en primitives. Les cinq chemins figurent dans `sw.js`, avec un nouvel identifiant de cache. L’admission hors ligne est vérifiée dans les fichiers ; aucune session réseau hors ligne n’est déduite de ce contrôle.

## Contrôles automatisés

| Contrôle | Résultat | Portée |
| --- | --- | --- |
| PNG et provenance | **5/5** | Décodage, dimensions, alpha, références, empreintes et égalité avec les originaux |
| Tests des cales et corrections visuelles | **24/24** | Registre, placement proportionnel, codes, fallback, projection, clips et géométrie |
| Suite ciblée élargie | **121/121** | Inclut les 24 précédents, profondeur de mission, QZ-17, cinématiques, transfert de contrôle, archives et reçus source |
| Forge, contrats d’édition | **358/358** | Suite `test:forge` dans le checkout de travail |
| Forge, contrats natifs | **277/277** | Suite `test:forge:native` dans une copie reproduisant les chemins du checkout partiel de CI corrigé |
| Rendu natif | **12 vues, 0 exception** | Six vues de repli et six vues avec images ; les cinq PNG sont effectivement dessinés |
| Syntaxe | **Réussie** | Deux modules JavaScript, AST du script Python de campagne et `git diff --check` |
| Sources et distribution | **Réussies** | `npm run check`, `npm run build`, `npm run check:built` |

Les comptes des suites sont rapportés séparément : les 24 tests des cales sont inclus dans les 121 et ne doivent pas être ajoutés une deuxième fois. Aucun test ciblé n’est ignoré.

Les cinq PNG sont présents dans la distribution octet pour octet. Celle-ci compte **2 122 fichiers contrôlés et 719 entrées de cache**. Les archives historiques et les documents de développement en restent exclus.

## Contrôles de rendu

La recette compare trois cales déterministes, avec le personnage devant puis derrière un objet : QZ-17, cargo et quarantaine de Léthé. Les douze vues utilisent le véritable moteur de production, ses définitions de niveaux, ses images et ses règles de dessin. Dans les six vues « avant », seules les cinq nouvelles images sont rendues indisponibles pour observer leurs replis en primitives ; les six vues « après » les utilisent. Il ne s’agit pas de deux versions différentes du moteur. La seed 7, la caméra et les positions du personnage sont identiques de part et d’autre ; ces positions sont injectées pour le rendu et contrôlées comme libres d’obstacle par le calcul d’empreinte. Le reçu détaille les paramètres, les surfaces de contrôle et les empreintes des fichiers réellement rendus.

Les PNG de production sont décodés en RGBA pour fournir leurs pixels au backend natif `@napi-rs/canvas`. Cette préparation de contrôle ne réécrit pas les fichiers du jeu. Les polices natives peuvent différer de celles d’un navigateur.

La mise en place du banc a révélé une divergence du backend natif : un masque `destination-in` sous translation pouvait devenir entièrement transparent alors que le même rectangle sans transformation était correctement rendu. Le banc rejoue les coins de ces seuls chemins rectangulaires en coordonnées de la surface, sous transformation identité, puis restaure le contexte. Un reproducteur confirme l’égalité pixel par pixel avec le rectangle sans translation ; le reçu conserve ce résultat et son empreinte RGBA. Trois remplissages sont normalisés dans chacun des deux lots de six vues, uniquement pour les positions derrière les objets. Les vues avant et après utilisent le même adaptateur, sans modification du moteur de mission.

La revue des captures observe les objets posés sur le pont, les bons codes sur les deux piles cargo, la continuité de la matière et les jambes correctement masquées derrière la caisse de quarantaine. Aucun raccord dur du pont n’est visible à l’échelle de ces vues ; cette observation ne certifie pas une périodicité mathématique des bords du PNG généré.

Les images natives ne sont ni un parcours joueur complet, ni une session navigateur, ni une mesure de performances. Le démarrage local de Chromium reste bloqué par `socket() EPERM`. La recette joueur du propriétaire reste explicitement distincte dans le suivi de la spec 004.

## Corrections des vérifications GitHub

La publication du lot d’insertion précédent a permis d’identifier deux causes d’échec déjà observées dans la dernière série CI disponible de la PR #47, sur `891d3cdb10214dff14a3ec96a1cd598dbf6c74ac` :

1. **Forge : manifeste absent du checkout partiel.** Le fichier `.ai-tools/adopted-v188.json` est suivi dans le dépôt et chargé par le garde de distribution, mais le workflow ne téléchargeait pas son répertoire. Le checkout inclut maintenant `.ai-tools` ; le manifeste est aussi conservé avec l’artefact de reproduction et déclenche les contrôles lorsqu’il change.
2. **Campagne C12 : cinématique toujours active.** Le test attendait le moteur immédiatement après la dernière étape de l’ancien panneau d’insertion. La capture d’échec montrait la nouvelle entrée atmosphérique V188, sans erreur JavaScript ou HTTP. Le harness attend maintenant le véritable bouton visible « Passer » ou un runtime déjà actif, clique ce contrôle public lorsqu’il est présent, puis conserve les assertions originales sur le moteur, la campagne et le panneau. Aucun état de jeu n’est injecté et aucun délai arbitraire n’est ajouté.

La reproduction Forge a également exposé un problème d’ordre de validation introduit lors de l’admission des archives : le contrôle d’inventaire complet précédait la lecture d’une fixture partielle destinée à tester la confidentialité. Il s’exécute désormais juste après le parcours des chemins et textes. La vérification complète exige toujours toutes les archives et leurs empreintes exactes ; le contrôle de confidentialité peut de nouveau signaler son erreur propre. La suite native de 277 tests réussit avec ce comportement.

Le correctif Python de campagne est vérifié syntaxiquement et relu contre les contrôles de l’interface. Sa validation par un nouveau parcours navigateur appartient au passage CI du commit publié ; aucun succès distant n’est présumé dans cette recette locale.

## Commandes exécutées

```bash
node --test scripts/verify-depth-holds-v188.mjs scripts/verify-visual-fixes-v188.mjs scripts/verify-mission-depth-v188.mjs scripts/verify-qz17-coherence-v188.mjs scripts/verify-insertion-cinematic-v188.mjs scripts/verify-dropship-handover-v188.mjs scripts/verify-bugfix-insertion-v188.mjs scripts/verify-bugfix-playthrough-modes-v188.mjs scripts/verify-project-recovery-admission-20261116.mjs scripts/verify-tantalus-priorities-v188.mjs
npm run test:forge
npm run test:forge:native
npm run check
npm run build
npm run check:built
```

La commande Forge native réussie a été exécutée dans la reproduction du checkout partiel décrite plus haut. Les images existantes de l’arsenal, les atlas VFX et les portraits volontairement provisoires ne sont pas assimilés à des fichiers manquants dans ce lot.
