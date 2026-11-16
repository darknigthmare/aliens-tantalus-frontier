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

Le raccordement graphique conserve les tailles de collision, les empreintes au sol, les voies de circulation et les règles de combat. Les adaptations visuelles s’appuient sur les références déjà présentes dans le projet ; aucune fidélité franchise « 1:1 » n’est certifiée. La correction de sauvegarde découverte pendant la vérification du retour de mission est décrite plus bas.

## Raccordement au moteur

`drawDepthHoldSlotV188` découpe au dessin les marges alpha mesurées, conserve les proportions, centre chaque silhouette et l’aligne au bas de sa boîte physique. Les recadrages sont conditionnés aux dimensions natives attendues. Les sources PNG restent intactes. Les caisses de fret reçoivent les codes de leur instance : `C-21/C-22` à l’ouest et `C-34/C-35` à l’est.

`drawDepthHoldDeckV188` répète la matière à une échelle de 192 pixels au bord avant, puis la projette vers le point de fuite des joints existants. Le motif ne s’étire pas sur la longueur entière de la cale. Les fragments de plateformes partagent le même dessin préparé et la même phase ; leurs découpes ne redémarrent pas la texture. Le caillebotis arrière, les joints, la lèvre avant et les ombres de contact restent dessinés par le moteur.

Les images sont chargées par les emplacements existants. Des caches distincts pour les replis et les ponts texturés évitent de conserver le repli après chargement. Les caches de pont sont bornés. Un échec ou une attente de chargement conserve le rendu en primitives. Les cinq chemins figurent dans `sw.js`, avec un nouvel identifiant de cache. L’admission hors ligne est vérifiée dans les fichiers ; aucune session réseau hors ligne n’est déduite de ce contrôle.

## Contrôles automatisés

| Contrôle | Résultat | Portée |
| --- | --- | --- |
| PNG et provenance | **5/5** | Décodage, dimensions, alpha, références, empreintes et égalité avec les originaux |
| Tests des cales et corrections visuelles | **24/24** | Registre, placement proportionnel, codes, fallback, projection, clips et géométrie |
| Suite ciblée élargie | **123/123** | Inclut les 24 précédents, profondeur de mission, QZ-17, cinématiques, transfert de contrôle, captures terminales du convoi et du Nostromo, archives et reçus source |
| Embarquement et historique du convoi | **50/50** | Capture terminale admissible, reprise, sortie propre au Nostromo et unicité du paiement ; recoupe partiellement la suite ciblée |
| Forge, contrats d’édition | **358/358** | Suite `test:forge` dans le checkout de travail |
| Forge, contrats natifs | **277/277** | Suite `test:forge:native` dans une copie reproduisant les chemins du checkout partiel de CI corrigé |
| Rendu natif | **12 vues, 0 exception** | Six vues de repli et six vues avec images ; les cinq PNG sont effectivement dessinés |
| Syntaxe | **Réussie** | Modules JavaScript, AST des six pilotes Python modifiés et `git diff --check` |
| Sources et distribution | **Réussies** | `npm run check`, `npm run build`, `npm run check:built` |

Les comptes des suites sont rapportés séparément : les 24 tests des cales sont inclus dans les 123 et ne doivent pas être ajoutés une deuxième fois. Aucun test ciblé n’est ignoré.

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

### Suite des parcours automatisés

Le passage distant sur `75c23afcc26b30162fd02c547b85f1aa99d03f40` confirme la réussite du workflow Forge. Les autres journaux ont permis de qualifier les attentes supplémentaires ci-dessous. Ces adaptations concernent les pilotes de contrôle ; elles conservent les règles du jeu, les ressources des profils et les assertions de résultat.

| Parcours | Cause observée | Adaptation du pilote |
| --- | --- | --- |
| Broodstorm / Trials | L’attente de 45 secondes expirait pendant la cinématique de 56 secondes, avant le premier contrôle de bombe | Bouton public « Passer » conditionnel au lancement et à la reprise, dans le budget de 45 secondes existant |
| Audio | L’instance observée avait 46 buffers valides ; le pilote attendait encore exactement cinq effets | Ensemble exact des effets et sources dérivé du manifeste publié : 46 effets et trois musiques ; égalité des identités, octets, empreintes et MIME, sans transferts absents, ajoutés ou dupliqués |
| Premier convoi M577 | Le manifeste public était ouvert, sans opération créée | Lecture et signature du choix affiché : zéro conteneur et six places ; contrôle de sa persistance avant le briefing |
| Lancements et retours du convoi | Le moteur peut démarrer avant la restitution des commandes ; l’embarquement précède l’enregistrement du retour et l’ascension masque le canevas | Attente du contrôle après le vrai bouton d’insertion ; embarquement, résolution du profil et bouton d’extraction dans les budgets déjà fixés de 30 et 210 secondes |
| Harpon tiré à gauche | L’ancien emplacement de tir plaçait le projectile près du relais QZ-18 ; « E » désignait le poste de mission, puis le harpon expirait | Marche dans la zone libre entre les deux postes, choix de l’action et ID du projectile vérifiés avant « E » ; disparition et gain exact d’une munition exigés ensemble |
| C12 / Léthé | La fin de mission peut précéder le reçu du profil pendant l’embarquement | Attente explicite de la phase d’extraction réelle, commandes de combat relâchées puis reçu du profil et fermeture de l’ascension ; budgets de lancement et de parcours conservés |
| Combat C12 | Le pilote restait au sol face à la nuée, ignorait les 160 munitions disponibles et tirait au-dessus des petites créatures | Prise de la réserve, défense de la première brèche, montée par l’échelle prévue au dossier, visée des contacts du même niveau, rechargements et soin par les commandes publiques, puis sortie après les 45 secondes réelles |

Les vérifications locales complémentaires comprennent **46/46 tests de continuation V162**, **18/18 contrôles Node adjacents audio et convoi**, **16 cas de contrôle audio exécutant les vrais blocs du pilote** avec des données observées et des cas invalides construits, ainsi que les contrôles de budget des helpers et l’analyse syntaxique des scripts Python. Ces groupes peuvent se recouper ; ils ne constituent pas un nouveau total de tests uniques. Les contrôles AST et les simulations locales ne sont pas présentés comme une nouvelle session navigateur.

### Qualification du pilote C12

La fonction `c12_controls` du fichier Python final est extraite par AST et décide des entrées sur le vrai `GameEngine`. Le profil initial est le déploiement par défaut non joué, à difficulté standard : seed `2203182776`, M4A3 sélectionné par la préparation native, 100 points de vie, 100 d’armure, 35 munitions chargées, 72 en réserve et sept trousses de soins. Après le démarrage, seuls des événements clavier et pointeur sont envoyés ; les points de vie, ennemis, ressources, chronomètres et états de victoire ne sont pas assignés. L’insertion et l’embarquement sont ceux de production.

| Simulation locale | Résultat observé |
| --- | --- |
| Moteur à 60 Hz, décision toutes les 100 ms | Victoire ; 45 secondes de défense ; 72 ennemis émis ; santé finale 100 |
| Moteur à 30 Hz, décision toutes les 500 ms | Victoire ; 45 secondes de défense ; 72 ennemis émis ; santé finale 91,495 |
| Exposition volontaire aux contacts natifs, puis reprise par le même pilote | Un soin `H` achevé, trousses de 7 à 6 ; victoire ; santé finale 93,3475 |

Les trois essais émettent chacun un seul événement d’embarquement terminé et un seul événement de mission terminée, avec une récompense de 650 crédits, aucune nouvelle tentative et aucune perte. La prise de la réserve de munitions est observée ; le cargo facultatif reste non pris. L’exposition aux contacts du troisième essai est un scénario déclaré de qualification du soin, pas la conduite du parcours navigateur. Le banc Node charge les dimensions des images et ne remplace pas la validation visuelle ou la session Chromium distante.

L’ancien pilote peut lui aussi réussir dans une simulation à cadence idéale de 100 ms, alors que la session Chromium observée sur `75c23af` meurt après environ 35,7 secondes de défense. Les simulations qualifient donc la nouvelle route à deux cadences et le soin réel ; elles ne reproduisent pas exactement le calendrier du navigateur défaillant et ne démontrent pas un défaut du moteur de combat.

### Première confirmation navigateur sur le commit publié

Le [job de campagne du commit `53a302d`](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/43919283677/job/133482089479) acquiert **29 assertions**, dont la victoire C12, son extraction réelle, son retour unique dans le profil, les questions du dossier et le rechargement conservant exactement le reçu et l’économie. La réserve est prise, les 45 secondes de défense et les deux secondes d’évacuation sont accomplies ; 72 ennemis sont émis et éliminés, la santé finale vaut 91,495, la récompense est de 650 crédits, sans nouvelle tentative ni perte. La capture terminale porte `extracted: true`.

Le même job échoue ensuite dans le chapitre Cocon, au maintien de `E` vers `freed === true`. Le marine est vivant, au centre du cocon et à la bonne hauteur, dans une mission active non pausée ; après l’attente de 90 secondes, la progression de coupe vaut zéro. Aucun échec JavaScript, HTTP ou réseau n’est enregistré. Le résultat du job complet reste donc un échec : la réussite du segment C12 n’est pas présentée comme une réussite de toute la campagne.

Un reproducteur sur le moteur de production démontre un mécanisme compatible : un ennemi entrant dans le champ déclenche son véritable chargement d’atlas ; un appui `E` pendant ce chargement est différé comme action discrète sans devenir une touche maintenue. Après chargement, la coupe commence puis s’annule, faute de maintien. L’artefact CI n’enregistre pas la chronologie initiale des touches : le lien avec cet échec reste une inférence, et le nouveau pilote journalise désormais ces états.

Le helper `hold_until` attend la disponibilité native et le focus, observe la touche réellement enregistrée, puis effectue un relâchement/appui public uniquement si le maintien a été perdu. Le délai absolu reste de 90 secondes et la condition reste `freed === true`. Sa fonction Python exacte est qualifiée dans six cas : disponibilité normale, chargement initial, course entre observation et appui, perte de focus, chargement ne finissant jamais et disponibilité à 88 secondes. Les quatre premiers libèrent par la coupe native ; les deux derniers échouent bien à 90 secondes, avec respectivement zéro et 1,9 seconde de progression. Les contrôles C12 et de lancement ne changent pas.

Le [job V162 du même commit](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/43919283685/job/133481871816) confirme également dans Chromium : **77 contrôles du harpon et 44 captures**, **19 contrôles et 16 captures du prélude convoi**, **17 contrôles et cinq captures de son historique**, ainsi que **23 contrôles et 11 captures du parcours médical**. Le contrôle audio s’arrête sur le changement de volume ; la réussite de ces parcours n’est pas assimilée à celle de tout le job V162.

Le volume observé après `Home` reste à 0,45 ; le contexte audio fonctionne, 46 effets sont décodés et les 47 transferts déjà reçus correspondent à ces effets et à la musique du menu. Le véritable `playIntroV188` permet de reproduire une course : pendant les 1 100 ms de fondu, les clics traversent déjà l’intro alors que son listener en capture intercepte encore le clavier. L’ancien artefact ne contient ni la phase d’intro ni le focus au moment de `Home` ; le mécanisme est démontré, sa chronologie distante exacte n’est pas attestée.

Les trois ouvertures Options du pilote attendent maintenant le retrait réel de l’intro et le panneau visible dans leur budget partagé de 45 secondes. Le helper du curseur vérifie visibilité, activation et focus, adresse `Home` ou `End` au range lui-même, puis observe sa valeur réelle, dans un budget partagé de 30 secondes. Les 32 appels de contrôle et attentes runtime préexistants sont identiques par AST : le volume nul, l’absence de voix tardive et l’intégrité des banques restent exigés. Les deux modes du vrai composant d’introduction et 11 cas de contrôle de l’ordre, des valeurs, des erreurs et des budgets qualifient ce raccord ; ils ne constituent pas une nouvelle session Chromium.

Le [job Trials associé au même commit](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/43919283677/job/133482089509) franchit désormais le lancement Broodstorm. Ses six premières assertions valident les six charges finies, les deux ratés, les dégâts des bombes aux nids, la dernière charge en vol et le gel de ses ressources pendant la pause. La sauvegarde suivante est refusée par le véritable contrôle public, qui affiche une menace à proximité : un chasseur reste vivant et alerté. Le profil conserve donc son checkpoint antérieur. Cet échec ne démontre pas une perte de sérialisation de la bombe et ne justifie pas d’assouplir la règle de sauvegarde.

Le pilote protège maintenant l’escorte et neutralise les six chasseurs finis avec le vol, la visée souris et `F`, avant de larguer sa dernière charge. Il revient au deuxième nid et exige que la vraie politique autorise la sauvegarde. Cette séquence partage les 45 secondes déjà attribuées au second déplacement, sans nouveau délai. Les directions sont relâchées avant les observations du déplacement pour éviter qu’une lecture lente prolonge involontairement le vol ; les cibles hors champ sont visées par un point du même rayon situé dans le canevas. Les 28 contrôles d’origine restent présents, avec un contrôle supplémentaire du droit de sauvegarde.

Les helpers Python exacts sont exercés sur le moteur de production, avec le profil non joué et la seed `141510777`, les vrais événements d’entrée et un host qui refuse un clic hors canevas. À 60 Hz avec lectures de 25 ms, la fenêtre prend **34,809 secondes** ; à 30 Hz avec lectures de 200 ms, **33,751 secondes**. Ces durées appartiennent à l’horloge monotone simulée du banc, pas à une mesure Chromium. Dans les deux cas, six chasseurs sont détruits par les armes natives, 17 ou 18 obus sont dépensés, le Cheyenne reste à 260 points de coque et l’escorte est vivante. La dernière bombe est capturée intacte avec zéro charge restante ; le vrai enregistrement, la migration et la reprise sont admis, les équations balistiques restent vérifiées et son impact laisse les deux nids détruits avec le chapitre encore actif. Le prochain passage navigateur doit confirmer ces trois derniers ajustements QA.

### Sauvegarde après l’embarquement du M577

Le parcours natif du convoi a révélé un défaut distinct dans `mission-dropship-handover-v188.js` : la séquence d’embarquement était effacée avant le callback de fin de mission. La capture perdait alors la projection des positions admissibles et conservait la position du M577 dans l’animation. Le véritable validateur rejetait le checkpoint avec `apc-identity-mismatch` : abscisse 945 au lieu de 955 ; l’ordonnée était déjà ramenée à 466 par la normalisation existante V131.

La fin d’embarquement conserve maintenant uniquement les positions natives nécessaires à la capture, dans un relevé borné à la mission. Pendant la capture, ces positions sont projetées temporairement, puis les positions de dessin sont restaurées. Les ressources courantes, la santé, le carburant et les munitions sont conservés par la sérialisation native. La capture terminale ne retient aucun événement de récompense ni embarquement à rejouer. Le relevé reste utilisable après un arrêt ordinaire et est vidé au prochain lancement.

Un marqueur explicite `extracted` distingue désormais un embarquement effectivement terminé d’une mission qui conserve sa propre sortie. Une reprise terminale marquée garde les marines à bord sans nouvelle animation, paiement ou événement ; une ancienne capture `landed: true, boarding: null` ne suffit pas à inventer un embarquement. Le test dédié au Nostromo couvre une mission sans extraction UD-4L, avec le nouveau champ faux et avec son absence dans une ancienne capture.

Le test de régression du convoi parcourt la vraie mission par entrées de jeu, capture dans le callback terminal, vérifie l’admissibilité, l’enregistrement dans le profil, l’arrêt, la reprise sans option de handover et l’absence de second paiement. Le même test rejoué avec les octets du module précédent échoue sur l’abscisse inadmissible ; il ne s’appuie pas sur un validateur assoupli. Le cache du service worker est renouvelé pour distribuer ce correctif.

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
