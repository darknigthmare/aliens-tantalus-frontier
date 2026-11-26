# La Mer des Chagrins — édition visuelle 0.10.2

## Résultat de la continuation du 26 novembre 2026

Le lot contient **121 PNG individuels**, soit **237 861 570 octets** : **110 originaux récupérés**, **neuf images conservées du checkpoint suivant** et **deux nouvelles poses de marche de Decker**. Les 119 images déjà publiées restent identiques octet par octet. Les deux nouvelles images proviennent de l’outil intégré image_gen, à partir du sprite de Decker du projet ; leurs prompts et empreintes sont conservés dans [CONTINUATION_PROMPTS.json](CONTINUATION_PROMPTS.json).

Les 77 images historiques qui n’avaient pas de chemin publié ont été retrouvées par leurs identifiants Git dans le registre de la PR nº 67. Le snapshot des 110 originaux reste conservé. Le vérificateur protège séparément l’inventaire des 119 PNG du commit 8cb25462 et les SHA des deux nouveaux fichiers ; il ne dépend pas de l’historique Git disponible dans la CI.

**117 images disposent d’un raccordement au rendu du monde ; quatre autres illustrent exclusivement l’interface d’équipement. Les 121 sont consultables dans la galerie.** Ces nombres décrivent les raccordements disponibles. La QA Canvas de cette version a effectivement dessiné **103 types de PNG** dans sa sélection de cas ; elle n’est pas présentée comme une observation de chaque raccordement.

Les documents README.md, MANIFEST.json et RECOVERY.md de ce dossier décrivent le checkpoint historique de 27 images. Le présent guide et VALIDATION.json décrivent l’état courant.

## Accès et sauvegardes

Le catalogue /dlc/ propose l’édition visuelle, la galerie et la version originale.

- Jeu : dlc/sea-of-sorrows-visual/index.html.
- Galerie : dlc/sea-of-sorrows-visual/galerie.html, avec recherche, catégories, trois fonds, aperçu et téléchargement individuel.
- Métadonnées : dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json.
- Inventaire de distribution : dlc/sea-of-sorrows-visual/RUNTIME_MANIFEST.json.

L’édition visuelle charge les modules de la campagne 0.10.0 puis ses adaptateurs de présentation. Elle conserve le format et la clé de sauvegarde du DLC. La sauvegarde principale de Tantalus reste distincte.

Les images du jeu se chargent à la demande. Une image absente, invalide, non chargée, de dimensions incorrectes ou privée d’une attache nécessaire conserve le dessin natif. La sélection essaie les poses suivantes lorsqu’une pose prioritaire est inutilisable. Les états consommés, détruits, terminés et les ouvertures sans image adaptée conservent leur représentation native.

## Nouveaux raccordements

| Élément | Usage et état réel |
| --- | --- |
| Deux poses de marche | Decker debout, non armé et mobile. Les deux contacts alternent selon l’horloge de simulation ; le repos et les mouvements réduits gardent la pose fixe. |
| Lampe personnelle | Fixation à l’ancre du corps ; faisceau issu de la lentille. L’orientation et l’extinction sont respectées. |
| Éclair de bouche | Événements de tirs balistiques admis, au canon effectivement dessiné. |
| Flamme | Événement natif de tir ; le PNG remplace le trait opaque lorsqu’il est disponible. L’arme sans PNG conserve son dessin natif. |
| Impact et étincelles | Événements hit et spark existants, sans nouveau dégât. |
| Acide | Flaques réelles encore actives, dessinées au sol avant les acteurs ; marquage et avertissement natifs conservés. |
| Mousse | Amas au pied d’un ennemi dont l’état de mousse est actif ; quantité et transparence suivent cet état. Cette image ne représente pas un jet. |
| Cadre et panneau de porte | Vingt seuils industriels de face ou de fond compatibles. Même transformation du canevas pour les deux pièces ; panneau seulement lorsque la porte native est fermée. |
| Commande de cloison | Deux boîtiers aux deux positions réelles de commande. Cloison, intégrité, progression, état et instructions restent natifs. |
| Commande d’éclairage | Boîtier au pupitre réel ; voyant actif selon l’état réel du circuit. |

Les portes obliques, les brèches rocheuses, les ascenseurs, escaliers, rampes et transports conservent leur géométrie native. Le raccordement des PNG ne déplace ni ouverture, ni collision, ni point d’arrivée.

### Interface d’équipement

Le masque respiratoire, la trousse, le détecteur et la radio possèdent maintenant un usage dans l’interface. Les boutons existants, leurs gestionnaires, les stocks et leurs restrictions restent en place. Les trois armes disposant d’un PNG sont également illustrées dans l’armurerie.

Le dessin du filtre représente un **masque complet**, pas une cartouche isolée : la carte porte le titre « Protection respiratoire » et précise que le nombre affiché correspond aux cartouches de réserve. La lampe suit son état dès le prologue. Le détecteur suit sa possession et son activation natives. La radio reste une illustration des communications de mission ; aucun stock, événement d’acquisition ou niveau de batterie n’est inventé.

Les images ne remplacent pas les libellés. Un chargement en échec ou de mauvaises dimensions conserve le texte et les pictogrammes. La légende du masque occupe toute la largeur de la carte dans la disposition mobile.

## Inventaire artistique

| Famille | Images |
| --- | ---: |
| Personnages et poses | 24, dont 16 identités |
| Décors | 50 |
| Obstacles | 6, correspondant aux 120 placements de campagne |
| Équipements | 16 |
| Effets | 6 |
| Objectifs | 4 |
| Dispositifs | 3 |
| Armes | 3 |
| Portes, parasites, brancards | 2 par famille |
| Œuf, facehugger vivant et cadavre | 1 par famille |

Les découpes, pivots et attaches utilisent les pixels de l’image entière. L’enveloppe alpha ≥ 8 et sa marge de deux pixels sont calculées sans modifier les PNG. La hauteur dans le monde est divisée une seule fois par la hauteur de cette découpe.

Les pieds servent de pivots aux personnages. Le pistolet est composé devant le corps avec reprise des pixels autour des mains ; les deux armes longues restent derrière les mains. Le départ visuel du tir suit le canon dessiné sans déplacer les cibles, impacts ou dégâts. La prise secondaire demeure une limite artistique à affiner.

Le parasite royal mesure 31,75 unités et le parasite normal 25 : le rapport 1,27 est déjà inclus. Les brancards emploient l’orientation none, avec head-right conservé comme indication anatomique séparée.

## Campagne, distribution et correction de la CI

L’arbre original dlc/sea-of-sorrows demeure **1024a04d3615e135a0a9de7cbff6819e107a2492**. Ses 3 029 fichiers et les 59 livrables historiques restent conservés et vérifiés séparément. Les adaptateurs préservent le prototype du moteur de simulation, les interactions, les sélecteurs de cible, les états de mission et les sauvegardes.

La base de cette continuation est le commit **8cb25462b9b0328b09ae28b278356113d325c603** de la PR nº 58. Il réunissait déjà le checkpoint précédent, la récupération de la PR nº 67 et la branche cumulative b0df1877a058f0818f96437fdfdea3f21ba7f415.

La CI de ce checkpoint a révélé trois liens de validation oubliés pour .gitattributes, .vercelignore et title-screen-v61.css. Ils sont ajoutés après les reçus existants, avec les empreintes exactes des fichiers déjà publiés. Un palier suivant inscrit uniquement l’ajout du test d’équipement dans package.json. Les sept reçus de fusion Mer, les trois reçus visuels et tous leurs préfixes historiques sont conservés ; les modifications de mêmes tailles, les prédécesseurs inconnus et les répétitions restent refusés.

Le lot visuel distribué contient **128 fichiers** : **121 PNG, deux pages HTML, quatre scripts et une feuille de style**. L’admission fixe chaque chemin, taille et SHA-256. Les manifestes, archives, rapports, prompts, outils et captures restent des sources. Les fichiers supplémentaires, chemins ambigus, liens symboliques et octets altérés sont refusés.

## Validation et portée des preuves

[VALIDATION.json](VALIDATION.json) consigne les commandes réellement terminées, leur résultat et le commit utilisé pour le build.

- Les **59 tests du renderer** exécutent les vrais modules de simulation avec des doubles Canvas/Image. Ils couvrent notamment les tirs acceptés et refusés, les effets, les attaches, les portes, les commandes et les deux contacts de marche.
- Les **six tests d’équipement** utilisent le vrai modèle de partie avec un DOM simulé. Ils vérifient la conservation des boutons et des stocks, les états initiaux, l’absence de doublons et les replis d’image.
- La QA de pixels utilise **@napi-rs/canvas 0.1.100**. Elle charge **121 PNG**, rend **50 salles**, **18 combinaisons de posture/arme/direction**, **12 cas de locomotion** et **44 cas de détail**.
- Les 12 locomotions comprennent quatre marches, quatre repos et quatre mouvements réduits. Le repos et les mouvements réduits restent identiques au pixel entre les temps examinés.
- Les 44 détails comprennent six effets issus d’actions natives, quatre lampes, deux éclairages, trois cloisons, quatre portes compatibles et **25 replis de porte identiques pixel par pixel au renderer original**.
- Les rendus préservent les sauvegardes sérialisées, les checkpoints, les modules natifs, le prototype du jeu et les 121 fichiers PNG.

Huit captures sont conservées dans le dépôt : s01, s14, s26, s33, s34, s50, [locomotion.png](canvas/locomotion.png) et [details.png](canvas/details.png). La planche de détails montre 23 des 44 cas exécutés. Une neuvième planche de travail de poses/armes a été inspectée sans être ajoutée au lot distribué.

Le décodeur Skia refuse les chunks de provenance caBX ; la QA les omet uniquement dans son buffer en mémoire. Les PNG source, leurs métadonnées et leurs chunks de pixels IDAT conservent leurs octets d’origine.

Ces rendus sont des **fixtures déclarées**, pas une traversée jouée. Chromium reste indisponible dans l’environnement local ; le téléchargement tenté lors de la reprise précédente a renvoyé HTTP 403. Aucune nouvelle réussite de parcours navigateur Mer, de contrôle tactile réel ou de manette physique n’est revendiquée. Les résultats locaux et la CI distante restent distingués dans le reçu.

## Limites encore ouvertes

Quatre PNG restent absents : adulte xénomorphe, reine, fusil plasma et lance-flammes. Les demandes de génération précédemment refusées n’ont pas été relancées. Leur représentation native demeure disponible.

Les deux nouvelles marches sont **deux poses clés**, pas un cycle complet. Les cycles complets de marche, tir, rechargement et interaction restent à produire. La cohérence anatomique de la seconde main et des proportions entre poses reste à affiner. Le levier dessiné sur la commande de cloison est fixe ; son voyant et sa légende portent l’état réel. Un léger chevauchement des textes natifs G / E et de l’état de cloison reste visible dans une projection isolée.

Les sept images d’une passe locale distincte non retrouvée ne sont pas comprises dans les 121. Aucun identifiant vérifiable supplémentaire n’a pu être récupéré pour elles. Les onze anciennes versions de code dont les octets restent introuvables ont été remplacées par une reconstruction fonctionnelle ; leurs octets originaux ne sont pas déclarés récupérés.

Les identités et rôles du roman ne certifient pas les visages, costumes ou silhouettes de matériel. Les dessins restent des interprétations du projet. Le texte intégral n’a pas été confronté et **la fidélité globale 1:1 n’est pas certifiée**.

## Commandes

```sh
npm run test:mer-des-chagrins-visual
npm run check:mer-des-chagrins-sprites
node scripts/mer-des-chagrins-visual-admission-20261126.mjs
npm run test:dlc:sea-of-sorrows
npm run qa:mer-des-chagrins:canvas
npm run test:all
npm run check
npm run build
npm run check:built
```

La dépendance Canvas de QA est fournie par l’environnement de travail et ne devient pas une dépendance du jeu. L’existence de ces commandes ne constitue pas leur résultat : le reçu de validation indique précisément les exécutions terminées.
