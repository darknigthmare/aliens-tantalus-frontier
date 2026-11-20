# Chœurs de la Reine-Mère — création originale et présentation native

17 novembre 2026. Parent R `ded6ef34dd35a659313e9361b407f6b94b62fb96`. Ce lot concerne uniquement les trois cibles locales du chapitre « Le chant de la Reine-Mère ». Les identités et les règles du chapitre restent celles du moteur existant.

## Résultat et périmètre artistique

Les trois Chœurs reçoivent une même silhouette originale Tantalus : une base basse à deux appuis fusionnés, une tige étranglée et deux lames costales formant une arche ouverte autour d'une membrane bordeaux/mauve. Cette forme possède quatre états de présentation. Elle ne crée ni une caste documentée, ni un organe de nurserie, ni une attaque, ni une anatomie du Chœur d'Éloïse.

La recherche locale définit le rôle des trois cibles mais ne fournit pas leur anatomie. Quatre images ont été réellement examinées : adulte rouge, atlas garde, œuf existant et scène native du chapitre. Seuls l'adulte et la scène ont été fournis à la génération, pour la matière et le contexte. L'œuf sert à distinguer les silhouettes ; il n'est pas une référence anatomique transférée. La création à arche costale est donc un choix du projet explicite, sans certification canonique 1:1.

Une seule génération intégrée `image_gen`, avec transparence demandée, fournit **un PNG RGBA de 1254 × 1254, 920 091 octets**, pour une demande de 2048². Le brut est copié intact dans `assets/queen-mother/v188/choirs-original.png`, SHA-256 `2284ad37841fa32c1c09b3351c26e9636b5e60df8dd4b5c51cfd397cca4e5db8`. Aucune correction générative n'a été nécessaire après revue ; aucun seuil d'alpha, détourage, recoloriage ou redimensionnement n'est appliqué aux pixels livrés.

Preuves : [prompt, références et provenance](QUEEN_MOTHER_CHOIR_ART_PROVENANCE_20261117.json), [planche native](QUEEN_MOTHER_CHOIR_ART_OVERVIEW_20261117.png), [reçu consolidé](QUEEN_MOTHER_CHOIR_ART_RENDER_RECEIPT_20261117.json). Les captures et scripts de développement référencés dans ces preuves ne deviennent pas des assets du jeu.

## Calibration et limites du fichier

Les quatre cellules complètes de **627 × 627** sont dessinées à une échelle commune de **90/525**. La présence A donne la référence : sommet source Y67, appui Y592. Le repère horizontal est lu à la jonction structurelle centrale de la tige et de la base, puis projeté vers l'appui ; ce n'est ni un bassin, ni un centre automatique de boîte alpha. L'incertitude manuelle retenue est ±4 pixels source, soit environ ±0,69 pixel rendu.

| État | Rectangle source | Pivot dans la cellule | Hauteur du corps à l'échelle commune |
| --- | --- | --- | ---: |
| Présence A | `[0, 0, 627, 627]` | `[327, 592]` | 90 px |
| Présence B | `[627, 0, 627, 627]` | `[303, 592]` | 87,94 px |
| Réaction | `[0, 627, 627, 627]` | `[327, 566]` | 72 px |
| Neutralisé | `[627, 627, 627, 627]` | `[303, 566]` | 37,2 px |

La vue est presque frontale. Le miroir inverse l'asymétrie des lames ; il n'est pas présenté comme un profil latéral observé dans une source franchise. La réaction est une contraction de 18 pixels, plus forte que les 6–8 pixels initialement visés. Le neutralisé est plus bas que l'objectif artistique initial de 45–50 pixels. Ces écarts sont acceptés après revue, à échelle constante : aucune mise à taille par pose ne les dissimule.

Le corps source est presque opaque, avec médiane et mode alpha 253 ; son intérieur n'est pas uniformément à 255. Une frange rougeâtre et du bruit très faible restent présents. Au-delà de huit pixels source du corps à alpha ≥128, le bruit ne dépasse pas 2/255. Au seuil alpha ≥16, trois cellules possèdent une seule composante ; le neutralisé conserve deux pixels isolés supplémentaires. Au seuil ≥32, les quatre cellules ne possèdent plus qu'une composante chacune. Les mesures lisent les pixels ; elles ne les corrigent pas.

Le prototype statique comporte **16 compositions**, soit quatre états, deux sens et deux fonds. Il reproduit les repères de nom, barre, physique et sol sans exécuter le moteur. Les marges à la barre mesurées pour les états vivants sont de 4, 6 et 22 pixels ; aucun pixel à alpha ≥8 ne dépasse de plus d'une ligne sous l'appui. Le neutralisé est montré avec une passe alpha 0,3. Son aspect sombre et les franges sont conservés. Root a réellement ouvert le brut, les deux fonds, les repères source et la planche de placement avant d'accepter la calibration.

Le reçu de calibration garde son statut historique de candidat, SHA-256 `404c963f4be3ea9a35539e936ea8c24706ce1d31cfc198f52b197f7037af0083`. L'acceptation root est un reçu distinct, SHA-256 `d6c030013dd0cff2ac9803f64faecb9327ac713a0fa02a4dde1036f8d4213ad0`. Cette acceptation statique ne remplace pas la vérification native ci-dessous.

## Raccord au moteur et aux règles existantes

Le helper exige l'opération `queen-mother-song`, l'identité de l'objet courant dans `enemies` et dans le lookup natif, un ID `eco131-target-0/1/2`, le rôle `target`, l'indice correspondant et un descripteur enregistré cohérent. Il ne limite pas l'admission à la phase `choirs` : le dernier corps demeure illustré après la transition à `mother-1`. Les anciens objets après reprise, les copies détachées, les cibles homonymes des autres écosystèmes, les gardes et l'adulte sont exclus.

Les trois acteurs gardent **66 × 90, 110 points de santé**, les sols 355/570/355 et leur absence de locomotion propre. Le recul générique provoqué par les dégâts natifs reste possible et inchangé. La présence A/B suit l'horloge native, à une cellule par seconde ; le mouvement réduit utilise A. La réaction lit uniquement `hurtClock` sur un vivant. La mort est prioritaire, avec la pose neutralisée, l'alpha 0,3 et le temps natif restant. Le rendu n'ajoute aucun hook dans le `GameEngine` final, aucun marqueur privé, aucune attaque, aucun mouvement ou champ sauvegardé.

L'entrée et la reprise réussie possèdent le chargement. La disponibilité du PNG C est indépendante des sources de l'adulte Q et des gardes R. Source absente, en cours, échouée, étrangère ou de dimensions incorrectes : le dessin vectoriel target reste entier. Les callbacks tardifs ne valident pas une autre image, et le dessin ne déclenche pas de requête. Une source arrivée après une blessure expirée représente l'état courant ; elle ne rejoue pas l'ancien coup.

Le nom et la barre restent hors du miroir du corps. Un `windup` résiduel conserve l'ellipse target inclinée à **+0,18 radian**, après le corps, sans les pointes du boss. Ce cas de compatibilité n'est pas une attaque de Chœur produite par l'IA. Les bornes de visibilité emploient les cellules complètes, leurs pivots et les deux sens, sans toucher collision ou portée. Les filtres de dormance, de mort expirée et l'ordre natif restent en place.

Une neutralisation conserve les effets existants : seul l'indice concerné est coché, la pression perd 16 avec plancher zéro, et le jalon/checkpoint est produit une fois. Le boss reste protégé avant la troisième cible ; sa composante de pression demeure ensuite. Nurseries, artères, balises, extraction et vagues ne sont pas redéfinies par l'art. Une reprise valide crée de nouveaux propriétaires, conserve santé/corps/temps restant et ne rejoue pas `hurtClock`, qui n'est pas sauvegardé.

## Validation de logique et contrôles négatifs

La première exécution du groupe C + écosystème + Q + R réussit **64/64, zéro échec et zéro ignoré**. Ce total comprend **17 cas C, 17 d'écosystème, 13 d'adulte Q et 17 de garde R** ; les sous-groupes ne sont pas additionnés une seconde fois. Aucune correction de production ou de fixture n'est nécessaire après cette première passe.

Le groupe utilise le vrai `GameEngine` et les niveaux écrits, avec hôtes DOM/RAF/Image déclarés. Les octets réels du PNG fournissent empreinte et dimensions ; Canvas enregistre les commandes sans les rasteriser. Les états précis de présence, windup résiduel, transparence générique et géométrie sont des fixtures explicites. Les dégâts, neutralisations et reprises empruntent leurs vraies chaînes natives. Le déplacement du joueur et sa santé élevée maintiennent les updates/attaques pendant l'observation du cadavre ; aucun timer de mort n'est réécrit.

Les contrôles couvrent les trois propriétaires, les refus de source, les chargements tardifs, le coup non létal, les dégâts refusés, la pause, le pas nul, l'expiration sans dessin, le passage modulo 60, le mouvement réduit, la neutralisation réelle des trois cibles, le déverrouillage du boss et les reprises d'un vivant blessé ou d'un cadavre. Le temps de disparition est éprouvé par les mises à jour complètes ; un appel isolé à `updateEnemy` ne possède pas cette expiration.

| Mutation en mémoire | Défaut introduit | Assertion effectivement déclenchée |
| --- | --- | --- |
| Admission limitée à `choirs` | Le dernier corps perd son propriétaire lorsque la phase passe à `mother-1` | L'admission attendue du vrai dernier mort retourne faux. |
| Réaction issue du cooldown | Un acteur encore intact peut se contracter sans coup reçu | L'assertion de présence avant le vrai dégât échoue. |

Les **deux mutations sont détectées par les assertions attendues**, chacune dans un processus isolé, sans modifier les octets de production. Aucun échec de chargeur ne remplace ces verdicts. Elles sont des expériences négatives, pas deux tests positifs supplémentaires. Root a relu les deux erreurs d'assertion réelles ainsi que les chemins positifs de dégâts, mort et reprise.

Le log du groupe porte le SHA-256 `4796a3e8384e010f2b50b1406658a2eb33ff0f6daf61f9bbc161e0e79b7ed8f1`. Reçu de validation : `4b787e38b0c2cead4b6ca48783a4804856ccafd5a8e4746c2e09272ba610e6c4`. Gel runtime : `6ebc425741a02506b4260c0a2b6f984d6afc33da719da6b169afba48a6002fcc`. Reçu des mutations : `40d9194920e5b025bff84f6f93f54d4529960d6c1809adf55f8db7092682a145`.

## Vérification du rendu natif

La matrice exécute le vrai `GameEngine`, `drawEnemy`, `drawWorld`, le HUD et les mises à jour complètes dans un hôte Node avec Canvas natif. Le candidat non committé est attribué à ses empreintes exactes ; le comparateur est le parent R propre. Les inventaires avant/après concordent, y compris les deux propriétaires supplémentaires de la secousse relevés lors du complément. Cet inventaire ne prétend pas couvrir toutes les dépendances transitives.

| Ensemble | Observations de rendu | PNG conservés |
| --- | ---: | ---: |
| Première matrice candidate | 79 | 57 |
| Complément ciblé du dernier décès | 3 | 3 |
| **Total candidat** | **82** | **60** |
| Comparateurs R | 9 | 9 |

Les 24 poses imposées couvrent quatre fonctions, deux sens et trois acteurs. Les 40 audits isolés contrôlent les cellules complètes, l'échelle commune, le pivot structurel, la barre, le nom, l'appui et la restauration de l'état Canvas. Ils mesurent une erreur de pivot nulle à la précision de capture et les marges à la barre de 4/6/22 pixels. Les huit masques Q/R/C donnent 24 observations de disponibilité par famille. Les **30 comparaisons avec R passent** : 28 Canvas entiers et deux HUD hors des lignes 178–199 de la dernière notice, seul delta attendu. Les deux planches composées de revue ne sont pas comptées comme des captures supplémentaires du moteur.

Le vrai coup sélectionne la réaction, encore présente à 0,1 seconde et expirée après 0,25. Les dégâts nuls, négatifs, non finis et le coup pendant la pause ne la déclenchent pas. La pause conserve pixels et compteurs ; la reprise conserve santé et géométrie, crée un propriétaire courant et ne rejoue pas le hurt. La reprise incohérente ne change ni acteur, ni images, ni état. La comparaison causale R/C confirme le recul générique de **3,6 pixels après 12 dégâts** : il existait avant ce lot et ne provient pas du dessin.

Les trois neutralisations réelles cochent leurs seuls indices, retirent chacune 16 points de pression depuis le niveau de fixture déclaré et produisent leurs jalons une fois. Le boss refuse les dégâts avant la troisième cible, puis les accepte. Le dernier corps reste admis en `mother-1` : **un dessin à 0 seconde, un à 0,3, puis aucun à 1,25** quand son délai a expiré. La reprise à 0,3 seconde conserve les 0,9 seconde restantes. La pression de phase continue ensuite ; le relevé final est 16,225 et ne prétend pas qu'elle reste figée à 16.

La première tentative conserve son statut historique `failed`, ses 57 PNG et son reçu SHA-256 `787ea8af343ebd94b3f812b36b691aa352ce463b055869dcb8dffe7fdebf11a3`. Son unique écart provenait de l'attribution du sprite au dernier décès : la fixture soustrayait seulement la caméra, alors que le moteur ajoutait la secousse de neutralisation. L'erreur apparente était 1,519276 pixel. La transformation du nom natif, relevée indépendamment du sprite, retrouve le pivot à 0,000011325 pixel.

Le complément ne rejoue que trois instants sur un nouvel hôte. Il vérifie la formule de secousse contre la transformation Canvas et mesure 0,000007063 pixel, avec **la tolérance initiale de 0,01 pixel conservée**. Le shake, les sources et les pixels n'ont pas changé. Le complément ne reproduit pas l'historique aléatoire complet de la première matrice. Son reçu porte le SHA-256 `4dde46fee1a1bd2bf83eb207441b45ab39da8437bbfb67e8889402dd594bf65a` ; le consolidé final, qui garde l'échec initial explicite, porte `6a8c5b430d3408f148643391fffc473610ffb7c7059174c9f31998379a83e155`.

Les scènes utilisent les sols natifs 355/570/355 ; le joueur est préparé à une position déclarée puis la caméra avance réellement pendant 1,2 seconde. Les sondes de culling sont séparées : l'extension verticale est observée, mais les bords gauche/droit étaient déjà admis par le viewport natif. L'ordre des autres acteurs et les exclusions lointain/dormant/cadavre expiré passent. Les windups résiduels sont imposés et ne prouvent aucune attaque de Chœur. Les masques de disponibilité manipulent la Map d'images ; ils ne sont pas des callbacks réseau observés.

Root a réellement vu la grille des 24 poses, les trois vues du complément, le vrai coup, la reprise blessée, les scènes FR/EN et la planche d'ensemble. Le corps neutralisé reste sombre sous l'alpha 0,3 ; au dernier site, garde, butin et particules le cachent partiellement. Les vues isolées montrent sa silhouette ; les traces mondiales prouvent son admission et son expiration. Acceptation finale : SHA-256 `84b74bf62777fc8685178ca0b69ed6d592bd99d513d6660ce8409fe714fd0776`. Aucun nouveau rendu ou correctif de production n'a suivi cette acceptation.

## Succession, distribution et publication

La succession C → R est une identité du registre : **21 opérations jouables, 19 partielles et deux effectives**, mêmes déclarations, mêmes dettes et `canonExact: false`. `complete-royal-cast` reste ouverte. Les onze successeurs ordinaires, le seul successeur de notice du test adulte Q et les deux nouvelles sources possèdent leurs empreintes et leurs liens exacts au parent R. Les historiques R/Q et les trois changements historiques Cargo/Broodstorm/Reine-Mère sont conservés ; aucune nouvelle opération changée n'est déclarée.

Les quatre suites du registre et de ses consommateurs passent **54/54**, sans échec ni saut. La première passe est conservée. Une seconde passe confirme uniquement la clarification documentaire du recul générique dans la Bible et son empreinte courante C ; aucun runtime, PNG ou historique n'a changé. Le reçu v2 a pour SHA-256 `930a531a331277b6c37e57462bef4ff2fb367adb44775d991e0fa87844ff353f`, son log `78abfdec8b8d33a3e3669a7771b226c654df34773b53e58bf39761b2c8808836`. Les 25 sources surveillées et l'identité Git sont stables pendant les contrôles.

Les contrôles de distribution passent **77/77**, puis `npm run check` réussit sur **3 571 fichiers et 1 602 assets**, avec zéro document privé. Les 29 fichiers surveillés, l'index, la branche et le parent restent stables pendant ces deux commandes. Le reçu porte le SHA-256 `c1aedeb36a557ca66e45f12cb4ac2bb3e9123e8aafb02115f68c5ab70fc5d072` ; le TAP `7da93805cd0ba75a332e76dc0e27352ee81deb99b033cef44edf3868e9e535cd` et le contrôle source `e7dadfabbf9d21dbeec7af2138a91c05e2d1a9dc1802b51b3db253b92a6f2579`.

Le shell possède **733 entrées** : seul le helper C est ajouté, sans précache du PNG. La source originale est admise par son chemin exact et reste chargée à la demande. Les quatre preuves, le test et les documents demeurent source-only ; les contrôles négatifs de fuite et de cache restent actifs. Le schéma de sauvegarde reste 52. Les rapports sont complétés après cette passe avec ses résultats réels ; cela ne change aucun fichier runtime gelé.

Les captures du candidat sont attribuées aux empreintes des fichiers effectivement chargés, puis comparées aux sources commitées. Les contrôles complets `test:all`, `check`, `build`, `check:built`, la comparaison de livraison, la publication et l'aperçu sont attestés séparément sur le commit exact dans la PR #49. Les résultats du parent R ne sont pas transférés à C.

## Limites conservées

Le casting local reçoit un habillage illustré, mais les trois objets ne définissent pas les « trois castes reliées » de l'arc proposé. `complete-royal-cast` reste ouverte. Ce lot ne réalise ni les ondes, ni la vibration collective CQ-05, ni les lieux, rencontres et cinématiques étendus de TR-0. Le registre conserve 21 opérations jouables, 19 partielles et deux effectives, sans promotion canonique.

La vue presque frontale, les écarts par rapport aux amplitudes initialement visées, les faibles franges et la lecture sombre du corps à alpha 0,3 restent déclarés. Aucun parcours local Chromium n'est revendiqué. Les tests de logique, les compositions statiques et les captures Canvas natives conservent leurs portées distinctes ; aucun de ces résultats ne certifie l'achèvement global du projet en fidélité 1:1.
