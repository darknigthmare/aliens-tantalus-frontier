# QZ17, quarantaine et Cocon noir — art intégré

Date : **17 novembre 2026**, Europe/Paris. Base publiée : `da8b29fa4b7688d18686b1e28be4065c3a821d3b` ; arbre de base : `a02dd15d216228b0413bdee19c82ac8912a8f86b`.

## Résultat et périmètre

Ce lot ajoute **trois PNG, totalisant 7 770 075 octets**, et les raccorde aux consommateurs existants. Le catalogue partagé contient **18 images : trois nouvelles et quinze réemployées**. Sept cinématiques, soit 18 plans, utilisent ce catalogue ; le berceau est aussi visible dans l'alcôve physique QZ17 et le support de résine derrière le personnage jouable du Cocon noir.

| Image nouvelle | Format | Utilisation |
| --- | --- | --- |
| `qz17-cradle-breached.png` | 1536 × 1024, RGBA | Berceau vide et givré, couvercle forcé vers l'extérieur, trois sangles rompues ; CIN11 et alcôve de maintenance QZ17 |
| `depot-resin-helmet-corridor.png` | 1875 × 839, RGB | Galerie industrielle envahie de résine pour l'enregistrement casque de CIN50 ; poutre dégagée pour le drone de plafond existant |
| `human-resin-support.png` | 1024 × 1536, RGBA | Support creux de résine derrière le véritable acteur d'Echo-9 ; aucun corps ni lien frontal peint |

Les trois sorties du générateur ont été retenues. Les fichiers de production conservent leurs octets d'origine : aucun redimensionnement, détourage par script ou réencodage. Les transformations et fenêtres source sont appliquées par le renderer Canvas à l'exécution. Les deux sprites ont un canal alpha réel ; le centre du support de résine est transparent. Leur alpha maximal vaut 254, conservé tel quel.

## Références et limites artistiques

La matière de résine s'appuie sur deux sources primaires examinées : les [photographies de production de la ruche proposées par Propstore](https://propstore.com/product/aliens-1986/colour-photos-of-the-hive-featuring-miniature-queen-puppet/) et l'[article de Stan Winston School sur la scène de la coloniste](https://www.stanwinstonschool.com/blog/aliens-chestburster-mechanism-behind-the-scenes). Seules les trois photographies de décor de la colonne droite de la planche Propstore servent aux nouveaux prompts ; les photographies de Reine sont exclues. La photographie de Stan Winston School sert aux nervures, à la matière et au support mural, sans reprendre la personne, son costume ou les effets de blessure.

Les berceaux, le matériau de résine et le couloir déjà produits pour Asphodèle fixent la continuité visuelle du projet. Les photographies sources ne sont pas redistribuées dans le jeu. Les prompts complets, références, dimensions et empreintes des fichiers retenus sont conservés dans le document de provenance.

QZ17 et le dépôt de Cocyte sont des créations du projet. Le support vide est adapté au corps natif d'Echo-9 ; il ne reproduit pas la morphologie d'une actrice du film. La documentation des matériaux ne constitue pas une certification de reproduction canonique « 1:1 ».

## Raccordement au jeu

| Consommateur | Composition et informations conservées |
| --- | --- |
| CIN11, deux plans | Mur de cale et Echo-9 existants ; même berceau que dans le niveau, libellé natif `QZ17-04`, trois attaches rompues, torche et dialogue d'Inez |
| CIN31, trois plans | Quai existant, profil corrigé du M577, personnages et conteneurs existants ; manifeste natif limité à six personnes et trois conteneurs ; résultat biologique animé dans le CRT |
| CIN40, trois plans | Salle de support vital existante, alarme, personnage radio et dialogue natifs |
| CIN41, trois plans | CRT et laboratoire existants, journal de quarantaine, horodatage, statuts, Bishop et Inez |
| CIN50, deux plans | Nouvelle galerie, drone existant après 55 % du premier plan, bruit et coupure natifs ; indicateur REC dessiné après les bandes noires |
| CIN51, deux plans | Écran biologique et laboratoire existants, statut et dialogue de Noor |
| Retour QZ17, trois plans | Laboratoire existant, Inez et dialogues de retour |
| Alcôve physique | Berceau ancré au sol ; volet et accès de maintenance gouvernés par la route native ; pas de requête d'image avant ouverture |
| Cocon noir V158 | Support derrière le joueur personnalisé ; neuf liens devant lui, réveil, coupe, effort, libération et reprise toujours pilotés par les systèmes existants |

La largeur du corps métallique du berceau est mesurée indépendamment du couvercle et des poignées : 480 pixels en cinématique et 122 pixels dans le niveau. La transformation reste uniforme dans les deux usages. La hauteur visible dépend du PNG et du couvercle ouvert ; aucune déformation indépendante des axes n'est appliquée pour forcer la différence entre les anciennes boîtes primitives.

Les limites du choix narratif, les collisions, les durées de plans, les données FR/EN, les récompenses et le format de sauvegarde restent ceux de la base. Le cadrage illustré de CIN31 montre des passagers sortis à côté du M577 ; il n'invente pas de rampe arrière. Le support mural reste un décor, tandis que les liens à couper et la tenue du joueur restent des éléments séparés.

### Correction du gabarit de captivité révélée par les vrais pixels

La première composition native montrait un défaut hérité : l'enveloppe fixe de 146 × 86 pixels de V158 plaçait plusieurs liens au-dessus du personnage réellement dessiné. Le lot corrige ce gabarit. `resolveBlackCocoonResinLayoutV158` mesure une version debout neutre du même rig et de la même apparence, à l'ancre du mur. Les fixtures de revue donnent environ **90,29 × 55,98 pixels sans casque** et **92,27 × 57,21 pixels avec le casque Marine**. La taille ne suit ni le mouvement, ni l'accroupissement, ni la position de l'acteur libéré.

La plage des neuf liens commence sous le visage et descend vers les jambes. Leur épaisseur, leur écartement après coupe et leur mouvement suivent la même échelle ; les neuf seuils de coupe, le temps de réveil et le temps de libération sont conservés. La palette devient charbon, brun ambre et gris discret, cohérente avec le support. Le corps, les vêtements, les mains, les priorités de blessure et les interactions restent natifs. Les vérifications des fibres distinguent ce changement graphique intentionnel de leurs invariants de progression et d'état.

Une seconde revue a aussi supprimé le décalage vertical de quatre pixels réservé à l'ancien trait épais : le PNG, qui n'a pas ce trait, pose désormais sa racine mesurée directement sur `groundY`. Les courbes gardent leur propre marge pour rester au-dessus du plan de support. Le résidu demeure fixé au même mur et au même sol après la libération.

## Chargement et distribution

Chaque cinématique demande ses ressources et ses portraits utiles. Les deux consommateurs physiques préparent leur image à leur entrée effective ; le rendu ne crée pas de requête. Une entrée ultérieure peut réessayer une image en erreur, et une demande encore en cours est partagée. Le volet fermé de QZ17 ne charge ni ne dessine le berceau ; une reprise déjà ouverte retrouve le même consommateur.

Le worker source utilise `atf-v143-biological-art-20261117`. Le module partagé `src/biological-art-v188.js` est ajouté explicitement au shell hors ligne, portant celui-ci de **723 à 724 entrées**. Les trois PNG restent chargés à la demande, sur leurs trois chemins exacts. Les plafonds de cache et les refus de requêtes privées, étrangères, encodées ou non répertoriées restent actifs. Les quatre documents de ce lot sont admis comme sources de développement et exclus de la distribution publique.

## Vérifications et livraison

Le reçu commun identifie les fichiers et les fixtures réellement utilisés après le gel du runtime.

| Contrôle | Résultat |
| --- | --- |
| Intégration des CIN, cohérence QZ17 et présentation du Cocon noir | **52/52 tests**, zéro échec ou ignoré |
| Audit du cache et cycle de sauvegarde | **132/132 tests**, zéro échec ou ignoré |
| Revue indépendante des chargements et de la mécanique native | **24/24 contrôles** |
| Plans cinématiques FR/EN, avec art et repli en mémoire | **36 + 36 rendus** |
| Variantes de personnage, deux tenues, deux directions, mouvement normal/réduit | **56** |
| Comparaisons de progression des neuf fibres | **14**, sémantique conservée |
| Variantes d'alcôve / caméra casque | **8 / 12** |
| Nouveaux PNG contribuant visiblement au rendu | **3/3**, sur quatre consommateurs |
| Textes, légendes et sous-titres | **148 778 pixels de cœur de glyphes**, zéro masquage observé |
| Données natives d'écran et compteurs | **30 contrôles** |
| Comparaisons raster hors périmètre | **29**, zéro pixel différent |
| Cinématiques hors lot | **21 CIN, 63 plans, 252 variantes**, traces identiques |
| Erreurs / avertissements de la revue visuelle finale | **0 / 0** |
| Vérification finale des sources et admissions documentaires | **3 497 fichiers, 1 576 assets, zéro document privé** |

Les **54 PNG de QA** comprennent 53 captures et une planche de 27 vues, soit **34 655 286 octets**. Seule la planche est ajoutée au dépôt ; le reçu conserve les dimensions et les empreintes des captures. Le support pose ses racines sur le sol dans les 56 variantes de personnage ; aucun pixel de lien ne couvre le cœur du visage. La comparaison des 14 états de fibres normalise explicitement l'échelle et la plage de placement nouvelles pour contrôler leurs seuils et leur progression, sans exiger l'ancienne palette ou les mauvaises dimensions.

La sonde indépendante examine **216 variantes des 18 plans** et les ressources effectivement demandées et dessinées. Les listes finales, portraits compris, contiennent respectivement **4, 7, 2, 4, 2, 3 et 2 fichiers** pour CIN11, CIN31, CIN40, CIN41, CIN50, CIN51 et le retour QZ17. Dix-huit cas de cache `Map`/objet, les arrivées d'image en pause, les erreurs, les réentrées, l'arrêt et le remplacement de séquence sont contrôlés. Le choix natif de maintenance passe de zéro requête à une seule ; la mécanique V121 de coupe, d'effort et de reprise est comparée à la base publiée.

La revue du worker vérifie les **18 chemins du catalogue**, l'unique module ajouté au shell, **56 demandes négatives** et **33 réponses invalides**, ainsi que l'exclusion des quatre documents du lot. Les gardes de données privées sont identiques à la base.

Une observation complémentaire démarre la véritable mission `special-black-cocoon` avec `GameEngine`, sous l'hôte Node existant. Après 4,05 secondes de traitement natif de E, le joueur est libéré ; après une seconde de D, il s'est déplacé d'environ 229,69 pixels. L'ancre du support demeure à 1360/570 et sa hauteur à 92,270466 pixels. À chacune des trois étapes, le dessin laisse `captureResumeState()` strictement identique. Cette observation remplace DOM, Image et RAF, utilise les vraies images pour le dessin du personnage, et neutralise les rencontres comme le fait l'hôte de test. Elle vérifie les commandes du moteur via son ensemble de touches, pas les événements clavier du navigateur, le combat ou une mission entière. Le reçu conserve la commande exécutée et ces limites.

Après le gel biologique, les douze suites de succession passent **139/139**. La première exécution complète de `npm run test:all` passe ensuite **4 687 tests sur 4 688, zéro échec et un test ignoré hérité**, en 568,05 secondes. Le cas ignoré est `V176 optional physical V175 fixture has exact opaque reconstruction`. Ce résultat précède le correctif distinct du bilan de convoi révélé par la CI navigateur ; il n'est pas attribué à cette correction ultérieure.

Commandes ciblées :

```bash
node --test scripts/verify-story-cinematics-v188.mjs scripts/verify-cinematic-coherence-v188.mjs scripts/verify-qz17-coherence-v188.mjs scripts/verify-black-cocoon-presentation-v158.mjs
npm run test:audit
```

## Corrections révélées par la CI précédente

### Succession des sources

La CI de la base publiée `da8b29fa…` avait signalé 31 échecs de succession dans la release complète, également rencontrés par les contrats Excel. Quatre empreintes courantes étaient restées antérieures aux ajouts visuels : le vérificateur de distribution, l'audit du cache, l'application et le service worker. Elles sont actualisées dans le registre terminal V188. Les **106 prédécesseurs historiques restent exacts** ; aucun JSON historique ni classeur n'est réécrit.

La continuation biologique atteste séparément les octets publiés de ses sources et tests modifiés. Le témoin V158 conserve sa description procédurale historique ; le test reconnaît explicitement la nouvelle description du support raster et compare strictement tous les autres champs. Les refus de mutations de source et de prédécesseurs forgés restent actifs.

### Bilan du convoi après le combat d'embarquement

Le [workflow Gameplay V162 de la même base](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44068307184) avait passé ses 63 contrats Node ainsi que `check`, `build` et `check:built`. Son sous-parcours navigateur V161 avait atteint les deux Crushers, la Reine et l'extraction, avec huit contrôles et douze captures. Il restait ensuite bloqué dans l'attente du retour : `special-operation-reward-mismatch`.

La preuve CI montre un bilan à **1 300 crédits** alors que le snapshot final porte **21 victimes et un blindage de 340**. La formule déjà partagée par le producteur et le validateur exige alors **1 310 crédits**. Le dernier ennemi est tué par le tir de couverture pendant l'embarquement, après le premier calcul du bilan à vingt victimes. Le validateur refusait correctement cette contradiction.

Le correctif réutilise la même formule dans `apcConvoyRewardsV121`. Au terme de l'embarquement, il actualise les trois copies de la récompense et le nombre de victimes de l'événement **avant les callbacks**. Il ne rappelle ni `completeMission` ni la synchronisation du monde ; les effets de fin et les poses ne sont pas rejoués. Une séquence ancienne ou remplacée, un moteur arrêté ou une mission qui n'est plus complète ne peuvent plus clôturer cet événement.

Cinq régressions échouent sur l'ancien runtime puis passent avec le correctif. Leur situation initiale contrôlée est explicitement déclarée d'après le checkpoint CI ; le décès, la capture et l'admission du résultat passent ensuite par le moteur et `SaveSystem`. Elles couvrent le passage 20 → 21 victimes, la pause au callback, l'absence de victime supplémentaire, la reprise depuis une sauvegarde sanitisée, le saut de séquence avant/après le décès, l'abandon et le refus d'une seconde émission ou d'un second paiement. La suite d'embarquement passe **43/43** ; avec les suites de récit et d'historique du convoi, le groupe passe **55/55**.

`save.js` reste inchangé, au SHA-256 `6b8a71b39143f289775ad5b8a497fbdbcddacec774bb2387904d030274c1f125`. Le correctif ne modifie ni la formule de paiement ni le seuil d'admission. Les quatre sources graphiques gelées pour la QA biologique restent identiques. Ce correctif possède ses propres reçus de succession et de tests ; aucun succès de la CI précédente ne lui est attribué.

Le registre final comprend **116 successeurs exacts et une empreinte de module ajouté**. Son test terminal passe **3/3**, rejette 117 mutations de sources et 232 prédécesseurs forgés ou déjà courants, en conservant les 106 prédécesseurs historiques. Le contrôle complet des sources réussit avec **3 497 fichiers, 1 576 assets et zéro document privé**. Les quatre documents de ce lot sont présents et admis précisément comme sources de développement.

La suite release finale et le build sont exécutés sur la révision exacte préparée pour publication. Le SHA, les résultats finaux, l'identité du build et l'état des nouveaux workflows sont consignés dans la PR, afin de ne pas inscrire dans les sources un reçu appartenant à une autre révision.

## Méthode et limites des preuves

La QA native utilise les fonctions de production et les vrais PNG avec Canvas/Skia. Les doublures de DOM, d'images asynchrones, de stockage, de RAF et d'horloge sont déclarées dans les reçus. Les captures prouvent les compositions et les états inspectés ; elles ne valent pas un nouveau parcours dans Chromium. Le lancement du navigateur reste indisponible dans l'environnement avant toute page, sans nouveau résultat de gameplay navigateur revendiqué pour ce lot.

Les polices DejaVu Sans Mono et DejaVu Sans, normales et grasses, sont enregistrées avant la création des Canvas. Les textes gardent une tolérance de deux unités par canal sur leur cœur opaque. Deux exceptions héritées sont décrites séparément : les douze dessins de petits portraits d'Inez/Bishop conservent leur recadrage exact de la base ; l'atlas de visage sans casque ne contient aucun pixel d'alpha 255, et son cœur d'alpha au moins 253 est contrôlé avec la même tolérance RGB. Les nouveaux sprites, les bras et les textes ne reçoivent pas cette exception. La doublure d'image différée garde explicitement `complete=false` jusqu'à sa résolution, conformément au scénario qu'elle doit représenter.

Le lot ne termine pas la campagne prolongée de survivants du Cocon noir, l'ensemble des galeries et des preuves du dépôt, ni les mouvements de toutes les créatures. Une Reine générique et ses poses existent déjà dans les catalogues : leur présence ne ferme pas le chantier spécifique de la poursuite de l'Acte V ou de la Matriarche de Soute. Ces contenus conservent leurs statuts distincts.

## Traçabilité

- [Prompts complets, références et empreintes](BIOLOGICAL_ART_PROVENANCE_20261117.json).
- [Planche des compositions natives](BIOLOGICAL_ART_OVERVIEW_20261117.png).
- [Reçu de rendu et contrôles indépendants](BIOLOGICAL_ART_RENDER_RECEIPT_20261117.json).

La publication cible la branche de la [PR #49](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/49), conformément à l'autorisation explicite de l'utilisateur. Aucun merge de cette PR ou de la branche principale n'est inclus dans le lot.
