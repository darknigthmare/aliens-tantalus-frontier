# Fiorina V115 — sprites, provenance et validation

## Base de l'intégration

Le pack complète le DLC natif V114 sur la branche de continuation, à partir du commit [`b89dc6ba47ee1ca90de29f3ccff47ddfe699d2d9`](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/b89dc6ba47ee1ca90de29f3ccff47ddfe699d2d9). Le DLC avait été intégré par la [PR 56](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/56). Les archives historiques conservées dans le dépôt restent la preuve des livraisons locales antérieures.

L'audit du rendu V114 a identifié des personnages dessinés avec des primitives Canvas et des images Fiorina employées dans d'autres systèmes du jeu. Deux images de Runner existaient déjà sous `assets/user/castes-v87/` et `assets/user/drive-v123/enemies/` : elles représentent des poses statiques. Les trois images de Ripley examinées sous `assets/user/drive-v123/personnel/` montrent des cheveux longs, une tenue claire et des pieds nus. Elles ne remplacent pas la tenue de prisonnière au crâne rasé. Les fonds de Fiorina déjà présents dans Trials restent des décors de ce système.

## Sources et portée visuelle

Les nouveaux PNG sont des illustrations créées pour le jeu. Ils ne constituent pas des images extraites du film, une mesure des décors de tournage ou une certification de ressemblance des acteurs. Leur attribution, leur état et leurs dimensions doivent être lus dans le manifeste du pack. La génération d'une pose ne prouve pas la présence d'une animation complète.

Le fichier [`manifest.json`](../../assets/openai/sprites/alien3-fiorina-v115/manifest.json) constitue le contrat de rendu. Les fichiers PNG originaux sont conservés sans recoloration, recadrage destructif ou modification du canal alpha. Un rectangle `frame` sélectionne des pixels à l'affichage ; il ne réécrit pas le fichier image. La présence de couleurs dans les pixels entièrement transparents ne constitue pas à elle seule un halo visible : le contrôle se fait après composition sur deux fonds.

Le fichier [`FIORINA_SPRITES_V115.json`](FIORINA_SPRITES_V115.json) conserve la provenance par PNG, les prompts retrouvés, les sources de référence et les limites. Les six itérations écartées et les deux refus de génération n'entrent pas dans le pack. Deux prompts initiaux n'ont pas été récupérés ; cette absence est indiquée explicitement. Les images de référence externes ne sont pas distribuées dans le pack.

Les neuf détenus David, Arthur, Kevin, Gregor, William, Jude, Troy, Frank et Eric ont maintenant chacun un PNG propre, sélectionné par leur identité native. Les costumes restent des interprétations documentées, particulièrement pour les personnages secondaires dont les références sont limitées.

Les compteurs distinguent les PNG uniques, les entrées du manifeste et les frames d'animation. Deux poses de Ripley et l'entrée qui les assemble en boucle ne représentent pas trois personnages. Une pose peut aussi être employée comme frame d'une boucle sans être sélectionnée individuellement par les hooks natifs.

| Contenu livré | Quantité et portée |
| --- | --- |
| PNG uniques | 39 fichiers, 56 294 831 octets, conservés à l'identique. |
| Entrées du manifeste | 44 : 39 poses/fichiers et cinq boucles assemblées. |
| Frames référencées | 49 occurrences, toutes contrôlées sur Canvas/Skia. |
| Identités d'acteurs | 23 : vingt rôles de forme humaine, le synthétique Bishop endommagé, Runner et Spike. Le statut du représentant de la Compagnie reste non tranché. |
| Objet séparé | Une hache ; elle reste au catalogue de ressources. |
| Boucles | Ripley marche à 6 fps, Ripley course à 8 fps, Runner marche à 6 fps, Dillon marche à 6 fps, Morse marche à 6 fps. Chaque boucle comporte deux images distinctes. |

Vingt-deux identités ont un raccord au rendu natif : les vingt rôles de forme humaine, Runner et Bishop endommagé. Spike reste au catalogue. Le costume `ripley-coat-idle` existe mais son sélecteur utilise les phases `shore`/`coast`, absentes de la progression narrative actuelle ; il n'est pas présenté comme une apparition naturelle validée. La pose de grimpe A de Ripley et la pose de course B du Runner restent aussi des ressources de catalogue, faute de cycle complet. La grimpe et la course du Runner conservent leur animation vectorielle.

Murphy, Boggs et Rains n'ont pas de PNG dédié ; leur état historique est décédé dès la synchronisation V89. Le bovin, l'enregistreur de vol, la trousse médicale et le M41A autonome n'ont pas de PNG dédié dans ce pack. Le commando porte une arme dans son image, ce qui ne crée pas une arme autonome ni un nouvel objet jouable. La hache n'a pas de hook natif. Les portes, les scènes documentées et les lieux parcourus ne sont pas étendus par ce changement de présentation.

## Contrat de rendu

Le module [`alien3-sprites-v115.js`](../../src/alien3-sprites-v115.js) valide le manifeste, charge les images et dessine les frames admises. Le mixin [`alien3-production-v115.js`](../../src/alien3-production-v115.js) raccorde cette présentation au DLC natif V114. Il conserve les collisions, les gardes d'action et la progression de la campagne sous le rendu.

La banque devient disponible après validation du manifeste sans décoder toutes les images. Chaque moteur possède sa propre banque ; seul le JSON du manifeste est partagé. Au départ, le jeu demande la variante courante de Ripley, Runner et au plus quatre personnages actifs proches. Les autres poses sont demandées par leur hook visible. Un personnage hors champ ne déclenche pas de chargement de sprite. Chaque entrée peut apparaître dès que ses propres frames sont décodées.

Quatre images au maximum sont chargées simultanément. Le délai de 45 secondes de chaque image commence lorsqu'elle entre effectivement dans la file de chargement. Un échec ou un timeout conserve le rendu de secours pour l'entrée concernée, sans réessayer à chaque frame. Le cache évince les images les moins récemment utilisées au-delà de douze PNG ou d'un budget estimé de 80 Mio RGBA. Les frames d'une pose en cours de chargement sont protégées jusqu'à sa fin ; une pose dépassant seule ce budget reste utilisable. Ce budget décrit les références de la banque, pas une borne mesurée de mémoire totale du navigateur.

À l'arrêt ou au changement de campagne, la banque annule ses propres chargements et libère ses références d'images, sans toucher à une autre instance du moteur. Les PNG originaux ne sont ni redimensionnés ni réécrits. L'option `preloadAll` est réservée aux outils de contrôle et désactive l'éviction pour une inspection explicite du corpus entier.

| Champ | Signification |
| --- | --- |
| `src` | Chemin relatif exact d'un PNG du pack. |
| `frame` | Rectangle en pixels dans l'image source. |
| `pivot` | Coordonnées en pixels, relatives au rectangle source. |
| `world` | Taille affichée dans le monde, avant l'échelle de profondeur. |
| `facing` | Orientation de la silhouette dans l'image source. |
| `frames` | Rectangles animés ; chaque frame peut désigner son propre PNG, pivot et taille. |
| `fps` | Nombre de frames par seconde ; le temps fourni au renderer est en secondes. |

Le point `x,y` transmis au dessin est l'ancre au sol ou au support du prop. Le renderer translate ce point, applique le miroir et l'échelle de profondeur, puis positionne le rectangle à partir du pivot. Les dimensions de collision n'en dépendent pas. Les images non chargées, invalides ou insuffisantes pour une animation demandée conservent le rendu animé historique au lieu de figer un personnage en marche.

## Distribution et hors ligne

L'admission publique doit énumérer précisément le manifeste et ses PNG, et vérifier leurs empreintes et leurs dimensions. Un fichier supplémentaire dans le répertoire du pack n'est pas admis par proximité de nom. Les scripts de contrôle et la documentation sont des fichiers source ; ils ne sont pas livrés dans le build public.

Les deux modules et le manifeste rejoignent le shell du service worker. Les PNG suivent le cache de médias du jeu après leur chargement. Cette politique ne garantit pas que des images jamais téléchargées soient disponibles hors ligne ; la couche vectorielle conserve la présentation de secours.

Le workflow produit aussi `FIORINA_SPRITES_V115.zip`, contenant exactement 42 fichiers : les 39 PNG, le manifeste et les deux documents de provenance. Ce ZIP est un artefact téléchargeable de CI ; la provenance source n'est pas ajoutée au site public.

## Contrôles reproductibles

Les quinze tests du renderer couvrent le contrat de manifeste, les erreurs de chargement, les limites des frames, le choix des poses, les transformations, les gardes natives, les demandes différées, l'éviction, les timeouts et les transitions de campagne. Cinq tests supplémentaires vérifient les empreintes, le filtre de copie réel, les admissions source/build et le cache hors ligne. Les images simulées des tests unitaires ne prouvent pas le résultat visuel des PNG.

Le script [`qa-fiorina-sprites-v115.mjs`](../../scripts/qa-fiorina-sprites-v115.mjs) charge les vrais fichiers dans Canvas/Skia, appelle la fonction de rendu de production et produit des planches sur fonds clair et sombre. Chaque frame est affichée dans les deux orientations, avec le pivot et le rectangle monde. Les mesures vérifient la présence de pixels visibles et transparents, le miroir, l'échelle de profondeur, le retour au contexte initial et le mode de mouvement réduit. Le rapport enregistre les empreintes réellement mesurées du manifeste, du renderer et des PNG.

La passe exhaustive est répartie en huit processus de six entrées maximum. Ce découpage évite l'accumulation de mémoire du banc graphique local : les tentatives monolithiques ont été interrompues avec le code 137, sans résultat valide. Chaque processus utilise une banque bornée à quatre images et la réunion des rapports doit couvrir exactement les 44 entrées et les 39 PNG. `FIORINA_QA_PRELOAD_ALL=1` permet une passe monolithique explicite sur un hôte suffisamment dimensionné ; elle n'est pas le mode de production.

Le script [`qa-fiorina-native-sprites-v115.mjs`](../../scripts/qa-fiorina-native-sprites-v115.mjs) appelle ensuite les méthodes du vrai `GameEngine` avec ces PNG sur Canvas/Skia. Ses phases, poses et horloges sont des fixtures explicites, et son hôte DOM/RAF historique est simulé. Il vérifie les reçus de dessin, la dormance du Runner, les rendus de secours et la stabilité de l'état sauvegardable avant/après dessin. Il comprend le saut à son apogée et les deux frames de marche de Dillon/Morse pendant le rabattage. Sa banque de contrôle est bornée à six images/48 Mio ; le maximum observé dans cette recette est de six images et 37 754 128 octets RGBA estimés. Ces valeurs ne mesurent pas le RSS du navigateur.

Le champ historique `catalogueOnly` du rapport natif signifie « entrée non appelée directement par une fixture ». Certaines de ces entrées, comme les poses A/B de marche, sont effectivement dessinées au sein de leur boucle. La portée de catalogue réellement non raccordée est détaillée plus haut.

```sh
npm run test:fiorina:sprites
node scripts/qa-fiorina-sprites-v115.mjs /tmp/fiorina-sprites-v115-qa
node scripts/qa-fiorina-native-sprites-v115.mjs /tmp/fiorina-native-sprites-v115-qa
```

Le contrôle de pixels demande `@napi-rs/canvas` ; `CANVAS_MODULE` permet de désigner une installation temporaire. Il s'agit d'un rendu réel hors écran. Le parcours navigateur du DLC reste un contrôle distinct, assuré par le workflow natif avec `EXPECT_FIORINA_SPRITES_V115=1`. Ce parcours attend le vrai PNG de Ripley au lancement et après rechargement, dans les deux montages, et observe les reçus de dessin sans injecter de pose. Un résultat Canvas ne doit pas être présenté comme une validation du navigateur, des interactions ou de la fidélité filmique.

## État des preuves

Les vérifications locales du 25 novembre 2026 portent sur le manifeste SHA-256 `7a13489288e96be84958a159844c5d550d0e4bfa285a8748b49ac19e5b7a72a7`, avec Node 24.22.3 et Canvas/Skia `@napi-rs/canvas` 0.1.100.

| Contrôle exécuté | Résultat observé |
| --- | --- |
| Renderer et admission | 20 tests réussis, aucun échec. |
| PNG et frames réels | 251 contrôles réussis ; 39 PNG, 44 entrées, 49 frames référencées et 18 planches clair/sombre inspectées. |
| Hooks natifs avec PNG réels | 130 contrôles réussis ; 32 échantillons et 30 IDs de sprites dessinés directement. |
| Copie du pack par le filtre de build | Les 39 PNG et le manifeste sont conservés à l'identique ; les fichiers voisins non admis sont refusés. |
| Build complet et parcours navigateur | Exécutés par CI après publication ; aucun succès de ces étapes n'est déduit des tests locaux ci-dessus. |

Les tests du moteur émettent les avertissements `MaxListenersExceededWarning` de l'hôte V136 lorsque plusieurs fixtures démarrent le moteur dans le même processus. Ils ne sont pas comptés comme des échecs de rendu. Les rapports JSON et les planches de la CI sont les preuves réexécutables de cette livraison ; ils ne certifient pas une fidélité visuelle 1:1 au film.
