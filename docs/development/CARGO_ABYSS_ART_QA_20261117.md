# Matriarche de Soute et MANTA-6 — preuves du 17 novembre 2026

## Résultat et périmètre

Cinq PNG supplémentaires, **9 133 636 octets**, sont raccordés au jeu : quatre planches de quatre poses pour la Matriarche de Soute, et une coque statique pour le MANTA-6 du chapitre local Abysse Noir. Le prédécesseur est le quai publié `232693f1e0ed24e404bb2fb0dbcd779611ccd2fc`. Aucun PNG antérieur n'est remplacé dans Git. Les bruts sélectionnés ont été copiés sans redimensionnement ni réencodage.

La bible nomme ces éléments mais ne fixe pas leur modèle individuel détaillé. Leurs nouveaux détails sont donc des choix de design originaux de Tantalus, fondés sur les références du projet. `canonExact` demeure `false` ; cette livraison n'est pas une certification globale de fidélité canonique.

## Matriarche : quatre clips, seize poses

Les sources font chacune **1254 × 1254 RGBA**, en quatre cellules complètes de **627 × 627**. Leur identité commune conserve crête royale, carapace biomécanique sombre, griffes, jambes et queue segmentée. Les petites marges alpha sont conservées.

| Clip natif | Frames | Cadence native | Hauteur source de référence | Appuis Y mesurés |
| --- | --- | --- | --- | --- |
| `idle` | 0–3 | 4 fps, boucle | 515 | 549 / 549 / 549 / 549 |
| `advance` | 4–7 | 7 fps, boucle | 515 | 547 / 546 / 547 / 548 |
| `claw-tail` | 8–11 | 9 fps, action | 537 | 561 / 562 / 556 / 556 |
| `roar-hurt` | 12–15 | 7 fps, action | 541 | 553 / 554 / 554 / 553 |

L'ancre X commune est 350. Un seul facteur uniforme X/Y est appliqué par clip ; il n'existe pas de redimensionnement par frame. Les extensions d'action sont plafonnées à la stature native et les poses repliées restent plus basses. Les boucles en mouvement réduit suivent toujours la cadence native de 1 fps ; les actions gardent leurs cadences.

La première planche d'attaque a été écartée après revue : la queue culminait en frame 10 alors que `combat:tail-hit` survient en frame 11. La correction générée place la préparation en troisième cellule et le fouetté complet dirigé devant le corps en quatrième. Le contrat `CARGO_MATRIARCH_ATTACK_REVIEW_V188` lie le SHA du PNG aux cellules de `claw-hit` (9) et `tail-hit` (11). Le test observe les événements réels du contrôleur et la fenêtre réellement dessinée au même instant. La reconnaissance des gestes provient de la revue visuelle, pas d'un test qui classerait une image à partir d'une étiquette.

## Corps, identité et repli

Le dessin dédié appartient seulement à l'objet réel `this.cargoMatriarchV67`. Les autres reines et les clones de mesure passent toujours par le renderer historique. Les quatre sources sont admises ensemble, par propriétaire d'URL, dimensions et fenêtres. Le rendu attend également le reçu `creatureScaleV188`, afin de ne pas exposer le corps transitoire d'avant normalisation.

Le chemin de l'application — catalogue `content.js`, `levelSeed` explicite et options natives — choisit `enemy-180-acid-blooded-ripper-queen:15`. Le contrôle indépendant mesure **300 × 245**, centre **4908**, pieds **470**. L'ancien hôte core sans `levelSeed` séparé choisit `enemy-372-apex-queen:15` et conserve aussi 300 × 245. Ce choix ne dépend pas du seul catalogue. Le secours non catalogué conserve ses dimensions propres et son statut de mesure exempt.

Les positions, hitboxes, phases de santé, vagues, checkpoints, sauvegardes, récompenses et règles du P-5000 sont conservés. La mort reste le comportement Cargo existant : la Matriarche devient inactive et disparaît ; aucune nouvelle animation de mort n'est revendiquée. Les requêtes d'images partent à l'entrée ; les chargements en cours ou prêts sont partagés, les erreurs ne sont retentées qu'à une entrée suivante, et les callbacks ne relancent pas le jeu.

## MANTA-6

La source entière **1813 × 868** est contenue uniformément sur **179,629 × 86**, au centre du corps **180 × 86**, et retournée selon le cap. Le dessin n'ajoute ni pilote ni canon fixe. L'origine du tir, sa visée indépendante, l'embarquement, les sorties et les ressources gardent leurs règles. Le bloc de repli procédural est conservé byte pour byte.

Il s'agit d'une coque statique originale, avec matière bleu pétrole usée et verrière verte désaturée. Occupation, dégâts et destruction partagent cette image ; aucune animation de trappe, propulsion ou destruction n'est produite. La notice FR/EN précise la coque illustrée et la silhouette HADAL provisoire. Le MANTA du chapitre local ne signifie pas que l'arc Nacre-7 proposé est livré.

## Revue Canvas indépendante

Le reçu joint conserve les sources, fichiers décodés, empreintes de captures, fenêtres, matrices, états physiques et limites de l'hôte. Le moteur complet est réellement démarré avec les options déclarées ; les API navigateur sont celles de `engine-host-v188`, et les pixels proviennent des vrais PNG décodés par Canvas natif. Les poses, l'horloge et la caméra de contrôle sont explicitement choisies. Aucun parcours Chromium ni traversée complète du chapitre n'est simulé comme un succès réel.

- **264/264 contrôles**, zéro erreur.
- Matriarche : **39 captures finales et 39 références R**, dont les seize poses dans les deux orientations, quatre absences de source, la dormance et deux vues du monde. Les **32 rendus de pose** gardent l'échelle uniforme, le corps physique et les appuis ; écart géométrique maximal du bas opaque à la ligne d'appui : **0 px**, seuil alpha 128.
- Les quatre replis atomiques et la dormance sont **identiques à R pixel pour pixel**, tolérance zéro. Les vues du monde Cargo n'ont **aucun pixel modifié hors de l'union des fenêtres d'art**.
- MANTA : **quatre vues du monde** sous les sélections FR/EN et les deux caps. La notice ajoutée est traduite. Certains anciens libellés sans entrée de traduction restent français, comme le prévoit le localiseur ; aucune traduction exhaustive n'est annoncée.
- Revue MANTA séparée : **dix conditions Canvas**, zéro erreur ; cinq comparaisons de repli/inactivité à **zéro pixel d'écart** avec R. Ses quatre observations des getters de couleur sont reproduites par R et restent signalées.
- Les observations de prélèvement anisotrope concernent les éléments hérités : 32 pour chaque série Cargo et 12 pour les quatre mondes MANTA. Les nouveaux PNG sont échantillonnés uniformément.

La planche d'ensemble a été inspectée après la correction du coup de queue. Les textes de contrôle et les vignettes de cette planche sont des annotations de QA ; les cinq PNG du jeu restent les bruts générés.

## Tests comportementaux et relectures

Le raccord MANTA et la suite Legacy passent **32/32** (sept nouveaux et vingt-cinq existants). Le résultat initial est conservé comme résumé fidèle de l'output outil, explicitement distinct d'un journal stdout brut. La revue indépendante du code et des pixels est favorable.

La Matriarche corrigée passe **7/7**, sans échec ni skip, dans `qa/matriarch-art-corrected-final.tap`. Le premier candidat avait également passé **15/15 contrôles ciblés**, dont ces sept tests et huit contrats historiques ; ce journal reste attribué au premier candidat, sans addition fictive des totaux. La dernière correction de pixels/métadonnées n'a pas relancé ces huit contrats inchangés séparément. La validation complète du commit publiable les exécute avec le reste du projet ; ses résultats exacts sont consignés dans le reçu de publication et la PR.

Les tests dédiés utilisent le vrai moteur et le contrôleur avec des hôtes déclarés. Ils couvrent admission atomique, chargement/reprise, sources étrangères, attente de la mesure physique, clones/acteurs voisins, toutes les frames et directions, réduction de mouvement, événements, barre de vie, dormance, éveil par l'interaction native, phases, reprise et défaite. Une relecture indépendante confirme les gardes de défaite unique ; le test de cycle lui-même ne revendique pas un double appel qu'il n'exécute pas.

## Registre et histoire

La seule dette d'art de Cargo est clôturée dans le registre courant ; son statut local redevient `effective`. Le registre compte **19 partiels et 2 effectifs**, toujours 21 chapitres jouables. Cocon et HADAL restent partiels et toutes les valeurs `canonExact` restent fausses.

Les JSON/XLS V157/V158 restent des instantanés historiques à **20/1**. Une succession explicite vérifie le seul delta Cargo à partir de V158, sans effacer le changement historique de dette du Cocon entre V157 et V158. Les titres TR-0 et QZ-17 déjà publiés dans R sont traités comme renommages antérieurs. Les contrôles négatifs refusent les promotions, identités, dettes, compteurs, valeurs canoniques ou snapshots étrangers. La fermeture de cette dette ne modifie pas rétroactivement les audits antérieurs.

## Sources finales

| PNG | Dimensions | Octets | SHA-256 |
| --- | --- | ---: | --- |
| `assets/abyss/v188/manta-6-hull.png` | 1813 × 868 | 1 963 093 | `9aa46795758c27e5871fdb561e3508e5298d6771109c9f5014618a287d629a07` |
| `assets/cargo/v188/matriarch-idle.png` | 1254 × 1254 | 1 783 411 | `85fd67760c5ebc8d8509468428bc284da84e8793bd1c6597e3a7001209e05326` |
| `assets/cargo/v188/matriarch-advance.png` | 1254 × 1254 | 1 764 956 | `c2bec6b148ee4d7349b0515ad960b960e53e9a91d757a00caae567ac95a06acb` |
| `assets/cargo/v188/matriarch-claw-tail.png` | 1254 × 1254 | 1 821 646 | `37ec3207b6aa4bdffd214b79f7f34b557892760b5ad54ca337067218e8fd4298` |
| `assets/cargo/v188/matriarch-roar-hurt.png` | 1254 × 1254 | 1 800 530 | `1b6428ee180ce52d6eb8762f8681c39d81bd7b57ae14a26b7d3dcfa30620dd0f` |

## Limites conservées

Les poses et pièces modulaires HADAL, le bestiaire aquatique, les animations supplémentaires du MANTA et les campagnes proposées restent ouverts. L'illustration ne constitue pas une certification canonique globale. Les parcours Chromium nouveaux sont distingués des tests locaux et suivis dans la PR ; aucun succès d'un prédécesseur n'est attribué au nouveau commit.
