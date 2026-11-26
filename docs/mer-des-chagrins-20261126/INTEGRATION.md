# La Mer des Chagrins — reprise de l’édition visuelle

## Résultat de la reprise du 26 novembre 2026

Le lot comporte **119 PNG individuels**, soit **234 227 391 octets** : les 110 images du snapshot historique et les neuf images du checkpoint suivant. Les 77 images qui restaient sans chemin publié ont été retrouvées par leurs identifiants Git dans le registre de la PR #67. L’arbre `4796d5f3d91a860812cd64886242e2e501729c79` réunit les 110 originaux ; chaque chemin, blob et taille correspond au registre. Les fichiers locaux sont ensuite décodés et contrôlés par SHA-256 et SHA Git. Aucun PNG n’a été retouché ou réencodé.

Le checkpoint documentaire précédent, `README.md`, `MANIFEST.json` et `RECOVERY.md`, décrit l’étape de 27 images. Il reste conservé comme historique. Le présent document décrit le raccordement ultérieur ; les chiffres de l’étape précédente ne constituent plus l’état courant.

## Accès et comportement

Le catalogue `/dlc/` propose l’édition visuelle, la galerie et la version originale. L’édition visuelle charge les modules de la campagne originale puis un adaptateur de présentation. Elle conserve le format et la clé de sauvegarde du DLC. Le jeu principal Tantalus conserve sa sauvegarde distincte.

- Jeu : `dlc/sea-of-sorrows-visual/index.html`.
- Galerie : `dlc/sea-of-sorrows-visual/galerie.html`, avec recherche, catégories, trois fonds, aperçu et téléchargement de chaque PNG.
- Métadonnées : `dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json`.
- Inventaire de distribution : `dlc/sea-of-sorrows-visual/RUNTIME_MANIFEST.json`.

Les images du jeu se chargent à la demande. Une image absente, invalide, non chargée, de dimensions incorrectes ou privée d’une attache nécessaire laisse place au dessin natif. La sélection essaie les poses suivantes lorsqu’une pose prioritaire est inutilisable. Les états consommés, détruits, terminés et les ouvertures intermédiaires conservent leur représentation native lorsqu’aucun dessin correspondant n’existe.

**104 PNG possèdent un raccordement au rendu du monde.** Les 119 sont consultables dans la galerie. Les 15 dessins encore réservés à cette collection sont les deux éléments de porte, les six effets et sept équipements : filtre, lampe, panneau lumineux, trousse médicale, radio, commande de cloison et détecteur.

| Famille | Images disponibles |
| --- | ---: |
| Personnages et poses | 22, dont 16 identités |
| Décors | 50 |
| Obstacles | 6, correspondant aux 120 placements de la campagne |
| Équipements | 16 |
| Effets | 6 |
| Objectifs | 4 |
| Dispositifs | 3 |
| Armes | 3 |
| Portes, parasites, brancards | 2 par famille |
| Œuf, facehugger vivant et cadavre | 1 par famille |

## Calibration et corrections

Les découpes, pivots et attaches utilisent les pixels de l’image entière. L’enveloppe alpha ≥ 8 et sa marge de deux pixels sont calculées sans modifier la source. La hauteur dans le monde est divisée une seule fois par la hauteur de cette découpe. Cela supprime le risque de coordonnées multipliées deux fois par les dimensions du PNG identifié lors de la précédente reprise.

Les pieds servent de pivots aux personnages. Les prises, les bouches d’arme et les attaches de lampe et de visage sont définies dans le registre. Les proportions du pistolet, du fusil à impulsions et du foamer ont été ajustées après inspection des compositions. Le pistolet est composé devant le corps, avec reprise des pixels autour des mains ; les deux armes longues restent derrière les mains. Le départ visuel du tir suit le canon effectivement dessiné, sans déplacer la cible, les impacts ni les dégâts.

Le parasite royal mesure 31,75 unités et le parasite normal 25 : le rapport 1,27 est déjà inclus. Aucun second multiplicateur n’est appliqué. Les brancards emploient l’orientation valide `none` ; `head-right` demeure une indication anatomique séparée.

## Conservation de la campagne et distribution

L’arbre original `dlc/sea-of-sorrows` demeure `1024a04d3615e135a0a9de7cbff6819e107a2492`. Ses 3 029 fichiers et les 59 livrables historiques sont vérifiés séparément. L’adaptateur conserve les collisions, ouvertures, sélecteurs de cible, interactions, états de mission et sauvegardes du moteur original.

La branche réunit le checkpoint PR #58, la récupération PR #67 et la branche cumulative `b0df1877a058f0818f96437fdfdea3f21ba7f415`. Les menus et contrôles de distribution des autres DLC sont conservés. Les reçus de succession sont prolongés pour les fichiers hôtes modifiés ; leurs étapes historiques ne sont pas réécrites.

Le lot visuel public comporte **124 fichiers** : 119 PNG, deux pages HTML et trois scripts. L’admission épinglée fixe chaque chemin, taille et SHA-256. Les deux manifestes, les archives, les rapports, les scripts de vérification et les captures restent des sources. Les fichiers supplémentaires, chemins ambigus, liens symboliques et octets altérés sont refusés.

## Validation et portée des preuves

Le reçu courant est `VALIDATION.json`. Les suites du renderer utilisent les vrais modules de simulation et des doubles Canvas/Image. La QA visuelle distincte utilise `@napi-rs/canvas` 0.1.100 : elle charge les 119 PNG, rend les 50 salles et 18 combinaisons de posture, arme et direction. Elle observe 90 types de PNG effectivement dessinés. Les équipements, objectifs et états de sauvetage sont des fixtures explicitement déclarées ; ces rendus ne sont pas une traversée jouée de la campagne.

Les six captures conservées correspondent aux salles s01, s14, s26, s33, s34 et s50. Le décodeur Skia utilisé par cette QA refuse les chunks de provenance `caBX` : le script les omet uniquement dans son buffer de décodage en mémoire. Les PNG source, leurs métadonnées de provenance et les chunks de pixels `IDAT` conservent leurs octets d’origine.

Chromium n’est pas disponible dans l’environnement ; son téléchargement renvoie HTTP 403. Aucune nouvelle réussite de parcours navigateur, de contrôle tactile réel ou de manette physique n’est revendiquée.

## Travail artistique restant

Quatre PNG restent absents : adulte xénomorphe, reine, fusil plasma et lance-flammes. Les dernières demandes de génération correspondantes ont été refusées ; elles ne sont pas relancées par cette reprise. Leur rendu natif demeure disponible. Les cycles complets de marche, tir, rechargement et interaction ne sont pas fournis. La cohérence anatomique de la seconde main et des proportions entre poses reste à affiner.

Les sept images signalées dans une autre passe locale, dont le répertoire n’a pas été retrouvé, ne sont pas comprises dans les 119 fichiers vérifiés. Le registre récupéré permet de certifier les 110 images de son snapshot ; il ne reconstitue pas ces sept fichiers sans leurs octets ou leurs identités vérifiables. De même, les onze versions anciennes de code dont les octets n’ont pas été retrouvés ont été remplacées par une reconstruction fonctionnelle, sans prétendre retrouver leurs octets d’origine.

Les visages, costumes et silhouettes de matériel insuffisamment décrits par les références sont des interprétations du projet. L’[édition du roman chez Titan Books](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/) fournit le cadre narratif ; elle ne certifie pas ces dessins. La fidélité globale 1:1 n’est pas certifiée.

## Commandes de vérification

```sh
npm run test:mer-des-chagrins-visual
npm run check:mer-des-chagrins-sprites
node scripts/mer-des-chagrins-visual-admission-20261126.mjs
npm run test:dlc:sea-of-sorrows
npm run qa:mer-des-chagrins:canvas
npm run check
npm run build
npm run check:built
```

La QA Canvas exige `@napi-rs/canvas`, fourni dans l’environnement de travail ; ce paquet ne devient pas une dépendance du jeu. Les résultats réellement obtenus et les éventuels blocages des commandes globales sont consignés dans `VALIDATION.json`.
