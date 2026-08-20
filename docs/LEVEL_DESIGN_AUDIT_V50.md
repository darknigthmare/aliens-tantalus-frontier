# Audit level design v50 — USS Tantalus

Date de l'audit : 21 août 2026
Périmètre : hub jouable `src/hub-game.js`, mission `src/game.js`, assets modulaires et plaques/couches v50.
Référence comparative : *Aliens: Infestation* sur Nintendo DS, utilisée comme étalon de lisibilité et de structure 2D — pas comme source d'assets à copier.

## Verdict exécutif

La v49 avait déjà remplacé un menu de salles par un espace 2D parcourable, mais son level design restait celui de quatre couloirs horizontaux illustrés : une seule ligne de sol, des obstacles très bas et répétés, aucune branche, aucun conduit, aucune échelle et aucune progression par capacité. Elle était donc jouable au sens déplacement/interactions, mais pas encore construite comme un niveau Metroidvania moderne.

La v50 corrige plusieurs défauts techniques importants : une salle du hub occupe désormais exactement une largeur de caméra, les portes ont une collision, les props gardent leur ratio, les rectangles de fenêtre flottants sont supprimés et une vraie couche de premier plan remplace la porte répétée. Les `18/18` plaques v50 sont normalisées en RGBA `1024 × 1024`, divisées en `16` cellules et possèdent toutes un consommateur déclaré dans le runtime ou son registre visuel.

La mission v50 constitue maintenant une vraie première tranche verticale : monde `6200 × 1080`, `15` plateformes plus le sol, `6` échelles, `4` portes, verrou d'alimentation, raccourci de conduit, caméra bidimensionnelle anticipatrice et couches far/mid/foreground. Le pivot de pied est corrigé par le facteur `240/256` pour le joueur, les PNJ et les acteurs de mission. Le verdict global devient donc **« vertical slice Metroidvania présent dans la mission, hub encore plat et linéaire »** : les quatre ponts du Tantalus restent des rubans horizontaux sans embranchement ni verticalité jouée.

## Ce que montre la référence *Aliens: Infestation*

Nintendo présente officiellement le jeu comme un shooter 2D à défilement latéral fondé sur le tir, l'exploration, la furtivité, le combat et la survie, à travers de vastes lieux emblématiques. Cette définition associe donc l'action et l'exploration spatiale, au lieu de réduire le vaisseau à une suite d'écrans d'interface : [fiche officielle Nintendo](https://www.nintendo.com/en-gb/Games/Nintendo-DS/Aliens-Infestation-270000.html).

La Nintendo DS affiche chaque écran en `256 × 192`. Cette petite résolution impose des silhouettes nettes, peu de HUD sur l'écran d'action et des contrastes immédiatement lisibles : [caractéristiques officielles Nintendo DS](https://www.nintendo.com/fr-fr/Assistance/Consoles-plus-anciennes/Informations-produit-619794.html).

Dans l'entretien direct avec WayForward, l'équipe explique avoir reconstruit le Sulaco à partir des plans du film, avec ses dortoirs, mess, douches, atrium, quais de chargement et réacteurs dans un espace explorable cohérent. Elle décrit également une boucle « exploration + clés/capacités », une carte et un détecteur de mouvement sur l'écran inférieur, ainsi qu'un ensemble de mouvements comprenant marche, recul, accroupissement, roulade, couverture, tir à l'aveugle et rechargement tactique : [entretien WayForward / AvPGalaxy](https://www.avpgalaxy.net/website/interviews/wayforward-technologies/).

Le retour de production avec le réalisateur Adam Tierney confirme une structure pensée comme un Metroidvania, influencée par *Super Metroid* et *Symphony of the Night*, enrichie par les prises de rebord et l'escalade de plateformes. Il rappelle aussi que les xénomorphes exploitent murs et plafonds, ce qui transforme la géométrie en espace de menace et pas seulement en décor : [making-of avec Adam Tierney](https://www.timeextension.com/features/the-making-of-aliens-infestation-the-nintendo-ds-metroidvania-classic).

Les analyses de jeu corroborent les conséquences concrètes de cette structure : ascenseurs, cartes d'accès, outils comme la lampe ou le chalumeau, conduits et pièces cachées, retours dans des zones déjà traversées, échelles, espaces verticaux, zones sûres rares et ennemis pouvant surgir du sol, des murs ou du plafond : [Nintendo Life](https://www.nintendolife.com/reviews/2011/10/aliens_infestation_ds) et [GameSpot](https://www.gamespot.com/reviews/aliens-infestation-review/1900-6346310/).

La bande-annonce de gameplay publiée par SEGA permet de vérifier directement la cadence de caméra, les silhouettes, la densité des couloirs et les transitions entre combat et exploration : [vidéo SEGA officielle](https://www.youtube.com/watch?v=_H1iKeQW-Ag). Une image de gameplay hébergée par Nintendo constitue aussi une référence visuelle directe : [capture Nintendo](https://assets.nintendo.eu/video/private/f_auto%2Cq_auto/c4lbkz99mypvd9jaxt2d.jpg).

Sur les captures presse en résolution native, le marine mesure typiquement environ `34–38 px` sur les `192 px` de hauteur de l'écran d'action, soit approximativement `18–20 %`. Les portes lisibles font couramment `1,5–2 ×` la hauteur du personnage. Ces deux valeurs sont des **mesures visuelles indicatives réalisées pour cet audit**, pas des spécifications publiées par le studio. Les captures vérifiées sont regroupées ici : [captures de gameplay en 256 × 384](https://nintendoeverything.com/first-aliens-infestation-screenshots/).

### Principes transposables au Tantalus

1. La silhouette et les menaces doivent se lire avant le détail du décor.
2. Une salle doit porter une fonction spatiale : traverser, grimper, contourner, se couvrir, déverrouiller ou revenir par un raccourci.
3. Les portes, ascenseurs, conduits et plateformes doivent appartenir au graphe du niveau et avoir une conséquence physique.
4. Le fond, le plan de jeu et le premier plan doivent être indépendants, avec des vitesses et des valeurs différentes.
5. Les actions d'interface doivent partir d'un objet diégétique placé dans la salle, puis rendre le contrôle au joueur rapidement.
6. L'exploration doit alterner compression, respiration, menace, récompense et retour, pas seulement aligner des terminaux.

## Mesures précises de la v49

Les mesures ci-dessous proviennent du code v49 de `src/hub-game.js` et des dimensions réelles des assets utilisés.

| Élément v49 | Mesure | Conséquence de level design |
|---|---:|---|
| Résolution logique | `1280 × 720` | Surface moderne confortable, mais exige une composition plus riche que la DS. |
| Monde par pont | `3840 × 720` | Un seul ruban horizontal. |
| Salles par pont | `4` | `16` salles au total sur quatre ponts. |
| Largeur d'une salle | `960 px` | La caméra de `1280 px` montre `1,333` salle à la fois ; les seuils et fonctions de salle se mélangent. |
| Sol | `y = 624`, soit `86,7 %` de l'écran | Seulement `96 px` sous le sol ; aucune strate basse ni conduit jouable. |
| Collision joueur | `58 × 104 px` | Hauteur physique `14,4 %` de l'écran. |
| Boîte de rendu joueur | `130 × 154 px` à `x − 36`, `y − 28` | Rendu `2,24 ×` plus large et `1,48 ×` plus haut que la collision. |
| Débordement joueur | bas du rendu `22 px` sous le bas de la collision | Les pieds et certaines animations dépassent sous le sol. |
| Atlas joueur | `1254 × 1254`, lu comme `8 × 8` | Cellules théoriques `156,75 px` : découpe non entière et états mal adressés. |
| États joueur réellement lus | ligne `0`, colonnes `0–3` | Les lignes d'animation restantes sont ignorées. |
| PNJ | rendu/collision `72 × 118 px` | Proportion incohérente avec la boîte visuelle du joueur `130 × 154`. |
| Portes | `198 px` ; ascenseurs `216 px` | Seulement `1,29 ×` et `1,40 ×` la boîte visuelle du joueur : impression de portes trop petites. |
| Géométrie par salle | `3` obstacles | Seulement `12` obstacles par pont. |
| Hauteur des obstacles | `27–54 px` | Tous restent sous la moitié d'un saut ; aucune vraie plateforme ni décision verticale. |
| Variantes de géométrie | `4` templates pour `16` salles | Répétition immédiatement perceptible. |
| Images d'obstacle | `3` props réutilisés | `vehicle-lift`, `mess-table` et `workbench` sont redimensionnés comme obstacles génériques. |
| Fond de salle source | `1672 × 941` | Dessiné à environ `960 × 540`; le calcul `FLOOR_Y − hauteur × 0,82` aligne correctement le sol peint. |
| Parallaxe lointain | facteur `0,14` | Base correcte pour un fond lointain. |
| Parallaxe de fenêtre | facteur `0,19` | Même image lointaine, avec risque de bande vide lié au cadrage v49. |
| « Premier plan » v49 | porte répétée, facteur `1,075`, alpha `0,085` | Mouvement techniquement différent, mais pas une couche artistique indépendante. |
| Caméra | centrage horizontal à `50 %` | Aucun regard vers l'avant, aucun cadrage vertical, aucune anticipation du danger. |
| Topologie | quatre lignes plates reliées par ascenseurs | Changement de pont, mais aucune verticalité jouée à l'intérieur d'une salle. |

### Lecture par rapport à *Aliens: Infestation*

- **Silhouette :** la boîte de rendu v49 occupe `21,4 %` de la hauteur, mais son écart avec la collision et son débordement détruisent l'ancrage. La référence DS est très lisible à environ `18–20 %`, avec des pieds et une ombre de contact stables.
- **Salles :** la v49 possède des noms et des images distincts, mais pas de forme de traversée distincte. Dans la référence, un ascenseur, un conduit, une carte d'accès ou un outil modifie réellement le chemin.
- **Verticalité :** la v49 propose un saut au-dessus de petits obstacles ; la référence combine échelles, rebords, niveaux superposés, conduits et attaques depuis murs/plafonds.
- **Profondeur :** la v49 a des vitesses de parallaxe, mais la couche centrale RGB et le faux premier plan empêchent une séparation franche. La référence utilise fenêtres, masses avant-plan, ombres et lumières pour hiérarchiser les plans.
- **Exploration :** la v49 relie correctement les terminaux aux écrans stratégiques, mais la progression spatiale reste linéaire et sans retour motivé.

## Mesures de contrôle de la v50 actuelle

### Hub USS Tantalus

| Élément v50 | État mesuré | Verdict |
|---|---:|---|
| Monde par pont | `5120 px` | Corrigé : quatre salles de `1280 px`. |
| Salle / caméra | `1280 / 1280 = 1,0` | Corrigé : une fonction de salle peut occuper un écran complet. |
| Collision joueur | `44 × 92 px` | Plus compacte et stable. |
| Rendu joueur | `110 × 148 px` | Silhouette utile d'environ `112 px`; le débordement v49 est supprimé. |
| Pivot de pied | `240/256` de cellule | Corrigé dans le calcul de destination; le pied rejoint la baseline physique. |
| PNJ runtime | collision `44 × 92`, rendu `92 × 140` | Proportion relative harmonisée et même pivot corrigé. |
| Portes / silhouette utile | `198/112 = 1,77`; `216/112 = 1,93` | Proportion lisible proche de la référence. |
| Collision de porte | active jusqu'à ouverture `≥ 0,82` | Corrigé dans le code. |
| Fenêtres | anciens rectangles flottants supprimés | Le décor n'est plus recouvert par des cadres artificiels mal placés. |
| Props obstacles | ratio source conservé | Déformation corrigée; choix de traversée encore générique dans le hub. |
| Premier plan | hauteur `220 px`, facteur `1,10`, alpha `0,25` | Couche indépendante moins intrusive. |
| Rapport d'assets hub | `36` modulaires + `9` runtime art = `45` | Joueur, sept PNJ et foreground sont maintenant inclus. |
| HUD / portrait | readout HTML masqué en jeu; Canvas recentré; contrôles hors scène | Confirmé par la QA navigateur desktop/mobile. |
| Verticalité/topologie | sol toujours à `y = 624`, mêmes petits obstacles | Non corrigé dans le hub. |
| Caméra hub | cible toujours centrée à `50 %` | Aucun look-ahead ni zone morte verticale dans le hub. |

### Mission Metroidvania v50

| Élément v50 | État mesuré | Verdict |
|---|---:|---|
| Monde | `6200 × 1080` | Défilement horizontal et vertical effectif. |
| Géométrie | `15` plateformes + sol | Plusieurs altitudes jouables. |
| Échelles | `6` | Liaison physique entre le sol et les plateformes. |
| Portes | `4` | Seuils physiques répartis dans la mission. |
| Verrou | une porte `lockedBy: power` | Progression conditionnée par le nœud auxiliaire. |
| Raccourci | conduit `ventShortcut` | Retour spatial distinct du chemin principal. |
| Caméra | look-ahead horizontal et suivi vertical | Anticipe vitesse, saut et descente. |
| Décors | couches far/mid/foreground; foreground alpha `0,30` | Les trois plans sont intégrés à la mission. |
| Props | sol, passerelle, rebord, drop, échelle, conduit, portes, couvertures et danger | Kit de traversée physiquement consommé. |
| Plaques | `18/18` RGBA `1024²`, `16` cellules, toutes référencées | Chaîne de normalisation et de consommation fermée. |
| Gate finale | `26` modules, `20/20` tests, build `3443` entrées | QA navigateur mission `31/31 assets`, escalade et power confirmés. |

## Priorités de production

### P0 — résolus dans la gate finale v50

1. **Gate statique et build : passée.** `npm run qa` valide `26` modules, `20/20` tests et le build `50.0.0` de `3443` entrées.
2. **Parcours hub et mission : passés.** Le hub charge `45/45` assets; la mission `31/31`, avec `6200 × 1080`, `16` plateformes sol compris, `6` échelles, `4` portes, escalade et verrou power fonctionnels.
3. **Plaques et responsive : passés.** La galerie desktop/mobile couvre `71` cartes, `27` plaques et `432` cellules, dont les `18` plaques v50 normalisées. Aucun bloqueur P0 connu ne reste dans ce périmètre.

### P1 — nécessaires pour obtenir un vrai hub Metroidvania moderne

1. Transposer au hub le kit déjà consommé par la mission : plateformes, échelles, conduits, sas verrouillés, rebords, couvertures et dangers.
2. Transformer les 16 salles du hub en graphe : chemin principal, boucle secondaire, verrou, raccourci, retour par nouvelle capacité et connexion verticale lisible.
3. Intégrer réellement les couches `far`, `mid` et `foreground` dans le hub, sans laisser l'image RGB de salle neutraliser le fond lointain.
4. Porter au hub le look-ahead et le cadrage vertical déjà présents dans `GameEngine`.
5. Exploiter les lignes `idle / walk / work / react` des sept PNJ selon leur contexte, au lieu de lire seulement la marche.
6. Faire de chaque terminal un court geste physique : approche, animation de travail, feedback du prop, puis ouverture de l'interface ciblée.
7. Donner à chaque salle une forme de traversée propre plutôt que l'un des quatre templates d'obstacles bas.

### P2 — finition, tension et longévité

1. Donner à chaque pont une grammaire de lumière, de profondeur et de danger distincte, avec une carte de valeurs contrôlée.
2. Ajouter des séquences de tension : éclairage défaillant, bruit hors champ, porte lente, détour, zone sûre et récompense lisible.
3. Réserver les attaques murs/plafonds et les systèmes de couverture aux zones de mission ou aux événements du hub où elles ont un sens systémique.
4. Valider sur appareils réels le HUD masqué, le Canvas portrait recentré et les contrôles tactiles désormais placés hors de la scène.
5. Créer des métriques automatiques : taux d'occlusion du joueur, distance entre décisions, nombre de routes, temps jusqu'au premier retour, hauteur de silhouette et contraste local.
6. Produire des variantes cohérentes des props de traversée par biome, sans étirer le même objet pour plusieurs fonctions.

## Tableau de statut v50

La colonne « corrigé » signifie que le changement est présent, mesurable et, lorsqu'il concerne l'affichage ou le parcours, couvert par la QA navigateur finale v50.

| Statut | Sujet | Preuve dans l'état v50 | Reste à faire |
|---|---|---|---|
| **Corrigé dans v50** | Largeur des salles du hub | `WORLD_WIDTH = 5120`, donc `ROOM_WIDTH = 1280` | Transitions confirmées en navigateur. |
| **Corrigé dans v50** | Collision des portes du hub | Collider actif jusqu'à `progress >= 0,82` | Parcours hub validé avec `45/45` assets. |
| **Corrigé dans v50** | Pivot et taille des personnages | Pivot `240/256`; joueur `110 × 148`, silhouette ~`112`; PNJ `92 × 140` | Contrôle visuel des 16 cellules. |
| **Corrigé dans v50** | Fenêtres flottantes | Rectangles de viewport supprimés | Confirmer sur les seize salles. |
| **Corrigé dans v50** | Foregrounds | Hub `220 px`/alpha `0,25`; mission alpha `0,30` | Lisibilité confirmée par la QA finale. |
| **Corrigé dans v50** | Plaques v50 | `18/18` RGBA `1024²`, `4 × 4`, toutes référencées, zéro violation de garde | Aucun manque statique connu. |
| **Corrigé dans v50** | Rapports d'assets | Le hub compte ses `45` ressources; la mission rapporte ses assets chargés | Conserver ce contrôle à chaque vague. |
| **Corrigé dans v50** | Mission verticale | `6200 × 1080`, `15` plateformes + sol, `6` échelles, `4` portes | Étendre ce niveau de densité aux autres missions. |
| **Corrigé dans v50** | Verrou et raccourci mission | Porte power et `ventShortcut` physiques | Escalade et power confirmés en navigateur. |
| **Corrigé dans v50** | Caméra et couches mission | Look-ahead 2D et far/mid/foreground intégrés | Mission validée avec `31/31` assets. |
| **Corrigé dans v50** | Présentation portrait | Readout masqué, Canvas recentré, contrôles hors scène | Vérification sur appareils réels. |
| **Corrigé dans v50** | Gate v50 | `26` modules, `20/20` tests, build `3443` entrées | QA navigateur finale également passée. |
| **Partiellement corrigé** | Décors multicouches du hub | Foreground dédié et far layers présents | Le hub n'utilise pas encore le trio mission far/mid/foreground. |
| **Partiellement corrigé** | Props de traversée | Le kit est placé et collisionné dans la mission | Le hub conserve ses quatre templates bas. |
| **Partiellement corrigé** | PNJ nommés | Sept plaques normalisées sont sélectionnées dans le hub | Utiliser aussi `work/react` selon les interactions. |
| **Partiellement corrigé** | Hub diégétique | Déplacement, portes, ascenseurs et terminaux sont physiques | Ajouter gestes de travail et feedbacks de salle. |
| **Corrigé dans v50** | Validation visuelle | Hub `45/45`, mission `31/31`, sprites desktop/mobile `71` cartes | `27` plaques / `432` cellules, dont `18` v50 normalisées. |
| **Production future** | Verticalité du hub | Un sol unique et obstacles `27–54 px` | Passerelles, conduits, échelles, descentes et trois altitudes. |
| **Production future** | Graphe Metroidvania du hub | Pas de branche, verrou, raccourci ni retour par capacité | Concevoir le graphe avant de produire davantage de fonds. |
| **Production future** | Caméra moderne du hub | Centrage horizontal fixe | Look-ahead, zones mortes et cadrage vertical. |
| **Production future** | Exploration systémique du hub | Interactions locales sans boucle de déverrouillage | Accès, outils, dangers, récompenses et backtracking motivé. |
| **Production future** | Menaces murs/plafonds | Non démontrées par le runtime actuel | Implémenter dans les missions où elles ont un sens systémique. |
| **Production future** | Variantes de biome | Kit de traversée unique | Déclinaisons commandement, habitat, industriel et ingénierie. |

## Critères d'acceptation du prochain jalon

La mission satisfait désormais les critères structurels et visuels d'une tranche verticale : code, `20/20` tests et parcours navigateur sont validés. Le prochain jalon du **hub** ne pourra être qualifié de Metroidvania que si :

- le joueur traverse au moins six salles du Tantalus sur deux altitudes jouées ;
- une branche du hub est d'abord verrouillée, puis ouverte par un outil obtenu ailleurs ;
- un raccourci ramène vers une salle déjà vue sans reprendre exactement le chemin aller ;
- une échelle, un conduit, une plateforme, une couverture, une porte et un danger possèdent chacun leur art et leur collision ;
- la silhouette conserve son pivot à `± 1 px` après l'ajout des nouvelles traversées du hub ;
- les trois plans du hub se déplacent indépendamment sans masquer la navigation ;
- les rapports d'assets du hub et de la mission restent complets pour les `18/18` plaques ;
- le parcours desktop et mobile se termine sans erreur console ni interaction bloquée.

## Conclusion

La v50 franchit un cap réel et vérifié : mission verticale, plateformes, échelles, verrou, raccourci, caméra 2D, décors multicouches, pivots et `18/18` plaques passent les gates Node, build et navigateur. Le prochain gain décisif concerne le **hub USS Tantalus**, toujours horizontal : son graphe, sa verticalité et ses retours doivent atteindre la densité déjà démontrée par la mission. C'est ce passage de « salles illustrées alignées » à « espaces qui imposent des décisions, des retours et des risques » qui le rapprochera réellement de la lisibilité et de la structure d'*Aliens: Infestation*.
