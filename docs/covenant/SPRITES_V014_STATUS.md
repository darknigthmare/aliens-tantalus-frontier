# Alien: Covenant — sprites et bible V0.14

La continuation ajoute **18 PNG originaux** et une **bible détaillée des éléments présents et manquants** dans les huit domaines demandés : personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes. Le cumul atteint **103 PNG**, dont **72 admis dans le rendu** et **31 réservés au catalogue**. Les 85 images précédentes et leurs trois manifestes conservent leurs octets.

**La production globale reste incomplète et la fidélité identique à 1:1 n’est pas certifiée.** Les fiches indiquent précisément les références consultées, les reconstitutions, les preuves insuffisantes, les variantes et les prochains travaux. Le registre récupéré contient 315 références ; il ne constitue pas une validation visuelle de chaque plan du film.

## Les 18 nouveaux PNG

| Ensemble | Images | Utilisation dans cette version |
|---|---:|---|
| Walter, uniforme de bord, marche en huit phases | 8 | PNJ `walter-cryo`, salle `cryo`, au sol, mains libres, déplacement réellement observé |
| Covenant, voiles repliées et déployées | 2 | Vues extérieures de catalogue |
| Berge de Planet 4 | 1 | Panorama lointain dans le ciel de `landing`, avant la géométrie native |
| Cité des Ingénieurs et Juggernaut dans la forêt morte | 2 | Panoramas de catalogue |
| Planet 4 vue de l’orbite | 1 | Référence planétaire de catalogue |
| Outil d’ouverture des cryopods, amortisseur de structure, patin de Lander One | 3 | Accessoires ou composants de production, sans nouveau consommateur de gameplay |
| Elizabeth Shaw, tête et épaules dans *The Crossing* | 1 | Portrait du bonus officiel, sans costume intégral ni personnage jouable |
| **Total V0.14** | **18** | **9 images admises au rendu, 9 images de catalogue** |

Les images restent à leurs dimensions natives de génération. Les quatre panoramas/vues orbitale sont des PNG opaques explicitement déclarés ; les autres originaux cumulés, au nombre de 99, conservent une transparence réelle. Aucun agrandissement artificiel n’est présenté comme une amélioration de fidélité.

## Bible du jeu et suivi des manques

La [bible principale de campagne](../narrative/CAMPAGNE_PRINCIPALE.md) contient un raccord vers cette annexe. La consolidation documentaire antérieure de la [PR 68](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68) reste identifiée séparément, à son commit de référence ; ses fichiers concurrents ne sont pas remplacés.

- [BIBLE_COVENANT_V014.html](BIBLE_COVENANT_V014.html) : consultation locale avec recherche, catégories, sources, images liées et données détaillées.
- [BIBLE_COVENANT_V014.xlsx](BIBLE_COVENANT_V014.xlsx) : tableur de suivi, feuilles par domaine, filtres et synthèse.
- [BIBLE_COVENANT_V014.md](BIBLE_COVENANT_V014.md) : version texte consultable dans le dépôt.
- [BIBLE_COVENANT_V014.json](BIBLE_COVENANT_V014.json) : données complètes et identifiants stables.

| Domaine | Couverture documentaire |
|---|---|
| Personnages | 38 références de personnages, reliées aux 23 profils d’apparence du module ; ces profils couvrent 17 personnages nommés, avec un profil composite Walter/David. Shaw est ajouté séparément au catalogue |
| Lieux | 57 entrées spatiales : 56 entrées de campagne et le tableau indépendant du prologue ; 55 clés de site physique distinctes, tableau compris |
| Connexions | 67 liaisons et 134 seuils orientés, avec les contraintes et coordonnées du jeu |
| Armes | 7 familles documentées ; 4 familles sont jouables dans le module |
| Props | 126 familles et leurs 630 occurrences, plus des candidats de production explicitement séparés |
| Véhicules et vaisseaux | 12 fiches de transport au sens large, comprenant des composants, du matériel et des groupes non résolus ; ce ne sont pas 12 véhicules jouables |
| Terrains | 16 familles de terrain et leur découpage en couches ou états |
| Planètes | Planet 4, Origae-6 et le contexte terrestre du prologue, avec leur portée propre |
| Registre général | 315 références, dont 49 fiches biologiques ; les espèces, états, scènes, bonus et concepts restent distincts |

Chaque fiche détaille autant que le permet la source : rôle, apparence, matériaux et variantes, scènes ou salles, contenu déjà présent, manques visuels et fonctionnels, limites de preuve et prochaine action. Les vues « Personnages », « Biologie » et « Références » se recoupent : leurs nombres ne s’additionnent pas en entités uniques.

Les 154 travaux du volet monde sont des familles d’assets ou des tâches de revue. Ils ne désignent pas 154 PNG précis. Les coordonnées du module ne sont pas des mesures des décors. Origae-6 reste une destination, sans surface visitable inventée, et le prologue conserve son indépendance géographique.

## Comportement de Walter et du panorama

La marche de Walter est limitée à son instance non blessée dans la salle de cryostase. Un cache du rendu observe son déplacement effectif entre deux instants ; il ne change ni sa route, ni sa vitesse, ni l’état de simulation. Les huit images doivent être décodées pour activer le cycle. Une image manquante conserve le rendu natif pour ce cycle ; la pause, les retours dans le temps et les changements de salle ne créent pas de faux déplacement.

La cadence de Walter est de 2,1 radians par seconde, soit environ 2,99 secondes pour les huit phases. Elle accompagne sa vitesse native de 26 unités de jeu par seconde. Les quatre cycles joueurs précédents gardent leurs définitions et leur cadence. Il y a désormais **cinq cycles et quarante phases** au total.

Les ancrages de bassin sont estimés sur les huit poses finales. Toutes les phases emploient la même échelle, dérivée de la hauteur visible du Walter neutre existant ; la hauteur n’est pas normalisée séparément par image. Les contacts opposés 01/05 et les passages 03/07 ont été revus. Les phases 04, 05 et 06 ont été corrigées pour rendre lisible la jambe proche vers l’arrière. La foulée 04 reste relativement ample et les plis, les visages et les trajectoires des pieds présentent de petites variations.

Le panorama du lac intervient uniquement dans la passe de ciel de `landing`, avec un cadrage proportionnel aligné sur le bas. Le sol jouable, la rive, les arbres, les acteurs, les props, les collisions et les seuils conservent leur géométrie. Les deux autres panoramas et la vue orbitale ne sont pas étendus automatiquement à d’autres salles.

## Références et limites

Les vues du Covenant et de Planet 4 s’appuient sur les images finales du [portfolio Framestore](https://www.framestore.com/work/alien-covenant/). Les paysages et la cité sont rapprochés des travaux de [Levente Peterffy](https://www.artoflevi.com/alien-covenant) et de [MPC](https://www.mpcvfx.com/en/filmography/alien-covenant/). Le cadrage du Juggernaut utilise une référence de son épave ; une image de site d’atterrisseur incendié a été écartée de cette association.

Les trois pièces de matériel reprennent des références de conception de [Tony Drew](https://www.tonydrew.com.au/film). Un dessin de production renseigne la forme et l’intention de la pièce ; il ne prouve pas sa présence à toutes les prises du montage final. L’outil d’ouverture conserve la variante `jaws1newhandle`, sans fusionner les autres propositions. Le patin est un composant détaché, pas un véhicule supplémentaire.

Le portrait de Shaw utilise des vignettes officielles de [The Crossing](https://www.youtube.com/watch?v=XeMVrnYNwus), vers 62–64 secondes, en faible définition. La restitution des traits fins reste approximative. Le portrait ne clôt pas les fiches du corps, des autres apparitions ou du montage cinéma. La fin du bonus, telle qu’observée dans les vignettes échantillonnées, montre l’approche de la cité et David dans la baie ; elle ne prouve pas à elle seule le bombardement développé dans le flashback cinéma.

Les références, prompts exacts, tentatives écartées, réaffectations de phases et empreintes se trouvent dans le [manifeste V0.14](../../assets/openai/sprites/alien-covenant-v014/manifest.json). Les limites héritées des sprites V0.11 restent attachées à Walter. Toutes les nouvelles images portent `verified1to1: false`.

## Manques qui restent ouverts

- **15 profils mobiles de PNJ**, couvrant 17 présences, n’ont pas encore de cycle PNG de marche. Les trois profils sans consommateur actuel sont suivis séparément.
- Les **quatre profils jouables** n’ont pas de cycle PNG de course. Les états de rampement, d’arme et d’action particulière, ainsi que les mouvements des créatures, restent à compléter selon leurs consommateurs.
- Les **sept familles d’armes** restent sans PNG. Les refus de génération antérieurs et les variantes apparentées non tentées sont conservés dans le registre ; aucune tentative de contournement n’a été entreprise.
- Sur les **50 familles candidates de props du film**, 14 ont un PNG direct, 15 ont un PNG direct ou une variante liée, et 13 ont une occurrence précisément admise au rendu. Les trois nouveaux accessoires de production ne clôturent pas ces manques de gameplay.
- Les 137 occurrences de ces familles comprennent 23 admissions précises, deux occurrences supprimées et 112 autres occurrences sans PNG admissible. Ces 112 occurrences ne sont pas 112 images à produire : elles peuvent partager une famille, un mécanisme ou une variante.
- Les costumes intégraux de Shaw, les vues supplémentaires des vaisseaux, les composants animés, les couches de sol et les états particuliers des lieux conservent leurs fiches de production ou de recherche.

## Vérification et livraison

Les contrôles locaux de cette version passent : **59/59 contrats et contrôles d’intégration Covenant**, **19/19 contrôles de succession des audits** et **103/103 PNG conformes aux dimensions et aux empreintes attendues**. Les 63 admissions précédentes, les quatre cycles joueurs et les 85 anciens PNG restent identiques. Les originaux représentent 168 824 471 octets vérifiés.

Le workflow dédié contrôle ensuite le rendu Chromium, les huit phases de Walter dans les deux directions, les conditions de repli, le chargement du panorama, le catalogue et ses liens vers la bible. Aucun ancien succès CI n’est présenté comme une validation de ce nouveau contenu. Le résultat exact du commit courant est lié dans la [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71), et le pack final peut joindre son reçu dans `validation/CI_V014.json`.

Le ZIP reproductible est construit par `scripts/package-covenant-sprites-v014.py`. Il contient les 103 PNG originaux, le catalogue, les quatre manifestes sources exacts, les empreintes et les quatre formats de bible dans `bible/`. Après extraction, ouvrir `index.html` ; les images de la bible utilisent les mêmes originaux locaux. Les fichiers de documentation et les images de catalogue restent hors distribution publique du jeu.

La continuation reste portée par la PR de travail en brouillon. Cette livraison ne réalise pas de fusion ni de mise en production.
