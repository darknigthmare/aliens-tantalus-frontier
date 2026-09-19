# V87 — Audit privé des structures et traversées de mission

Date : 2026-09-19. Dépôt source observé : `D:/CodexWork/aliens-tantalus-frontier/project`.

**Document privé : ne pas publier avec le jeu.** Cette note décrit un sous-lot de correction du renderer et de la géométrie. Elle ne constitue ni une livraison complète V87, ni un audit de toutes les salles, ni une déclaration de jeu commercial terminé. Les audits historiques restent inchangés.

## Statut de vérification du 19 septembre

- Tests ciblés décrits ci-dessous : **96 réussis, zéro échec, zéro ignoré**.
- Vérification navigateur locale : **PASS** sur les trois gabarits, J1/J2, commandes clavier réelles. Non-régression combat clavier/souris/tactile, pause et accueil : **PASS**.
- Build public : **PASS** ; garde public **886 fichiers, 724 assets, zéro document privé** ; lint final **440 modules** ; suite complète **2 259 tests, 2 258 réussis, 1 ignoré, zéro échec**.
- Commit public **e9ff82dd80a55a964e106c9e6890d7f5162d520a**, poussé sur `main` et `codex/v86-public-release`. Déploiement Vercel **READY**, vérifications production HTTP/clavier/cache hors ligne **PASS**.

Ces résultats proviennent de contrôles propres au présent sous-lot. Les preuves de publication du précédent correctif blessure/mort dans `V87_SOURCE_RECOVERY_AND_PLAYER_HOTFIX.md` ne sont pas réutilisées comme preuve de ces changements de structure.

## Sources et périmètre documentaire

La matrice `references/V76_CHATGPT_PROJECT_GAP_MATRIX.md` fournit 26 conversations, avec 26 identifiants uniques. Trois discussions accessibles ont été récupérées depuis :

- « Vérification animations joueur » — `6aa7f902-2870-83eb-976c-e730afb364f3` ;
- « Créer une campagne complète » — `6aab8b2e-ce18-83ed-a55a-0f09cabc5c58` ;
- « Conception pièce hommage chat » — `6aa854a2-ebb0-83eb-9839-43572cd63f94`.

Cela forme **29 conversations connues/accessibles, pas un inventaire exhaustif du projet ChatGPT**. La liste récupérée était bornée à 50 conversations récentes ; plusieurs réponses sont tronquées à 20 000 caractères. Les sources du groupe niveaux se trouvent dans `references/v76-conversation-audit/group-levels.md`. Leurs constats du 8 septembre sont historiques : par exemple, le BIOFORGE décrit alors comme absent a depuis reçu une boucle V80 partielle. Une promesse ou un nombre de fichiers annoncé n'est jamais une preuve de livraison.

La demande reste un jeu 2D parcourable, composé de salles, portes, accessoires et couches indépendantes, avec des proportions, perspectives, collisions et reprises cohérentes. La correction des éléments communs sert cette demande ; elle ne remplace pas les cartes et missions dédiées encore absentes.

## Défauts racines constatés

### Images complètes utilisées comme modules

`V82_HUB_PROP_REVIEW.md` documente déjà les défauts des PNG historiques : `wall-ladder.png` contient une base séparée et des ouvertures blanches ; `maintenance-pipe.png` une conduite et sa base détachée ; `overhead-catwalk.png` plusieurs éléments dont des blancs entre les rails. Leur alpha extérieur ne garantit donc pas la transparence des ouvertures intérieures.

Le renderer de mission utilisait encore les images entières dans `drawLadder`, `drawPlatform` et `drawMaintenancePipes`, alors que le renderer d'annexe V82 employait des régions propres. Répéter l'image complète répétait aussi ses pièces parasites. Les conduites avaient une hauteur arbitraire de 176 px et étaient posées depuis des plateformes sans rejoindre systématiquement une autre surface. Le profil catwalk avait un décalage vertical de contact de 42 px pour une image rendue à 64 px.

### Étages et raccords physiques

Les nœuds du vaisseau et de la colonie recevaient chacun un décalage vertical aléatoire allant jusqu'à cinq pixels. Des segments d'un même pont se retrouvaient donc à plusieurs hauteurs. Les arêtes dessinées comme pentes étaient en réalité des plateformes horizontales espacées : leur nombre ne dépendait auparavant que de la distance totale, sans borner chaque marche à une hauteur franchissable.

À la balise planétaire, les anciens raccords `planet-e12` et `planet-e17` superposaient des pentes venant de la crête et de la grotte. Les embranchements devaient devenir des choix physiques explicites, sans supprimer les trois routes nommées.

### Prise et sortie d'échelle

La sélection cherchait la première échelle chevauchant le corps. Dans un puits à plusieurs étages, elle pouvait capturer prématurément le connecteur adjacent ou conserver le mauvais connecteur. La montée s'arrêtait douze pixels sous le palier et ne rendait pas proprement la main à la marche. Un saut de dégagement pouvait reprendre immédiatement l'échelle.

Les ascenseurs créés par Frontier Forge n'avaient pas de `kind: 'lift'`. Sans ce type, le nouveau regroupement visuel aurait pu les confondre avec un pont fixe ou les utiliser comme support d'une conduite.

## Correctifs présents dans le code

### Modules d'image indépendants

`src/mission-structure-art-v87.js` définit six régions de source en coordonnées `x, y, largeur, hauteur` :

| Module | Région source |
|---|---|
| Tablier latéral | `40, 43, 188, 27` |
| Rail gauche d'échelle | `53, 4, 9, 168` |
| Rail droit d'échelle | `100, 4, 9, 168` |
| Barreau | `62, 36, 38, 4` |
| Fût de conduite | `49, 34, 50, 86` |
| Panneau de sol | `4, 4, 210, 75` |

Le répéteur dessine des crops avec neuf arguments `drawImage`, conserve leur ratio et coupe la dernière portion à la largeur ou hauteur restante. Il ne réduit pas une tuile complète pour la faire rentrer. Les entrées invalides, débordements de source et nombres excessifs de répétitions sont refusés. L'échelle assemble deux rails et des barreaux en laissant ses ouvertures libres ; elle ne dessine pas la base détachée.

Ces crops réutilisent des pixels déjà présents. **Aucun nouveau PNG, aucune génération OpenAI et aucune réparation globale des fichiers historiques ne sont livrés par ce sous-lot.** D'autres renderers qui utiliseraient encore les sources entières ne sont pas automatiquement corrigés.

### Géométrie et rendu structurel

`src/mission-structure-layout-v87.js` regroupe uniquement les surfaces statiques de même hauteur et même matériau qui se chevauchent ou se touchent. Les données de collision d'origine ne sont pas mutées. Un trou, un changement d'étage et une plateforme mobile ne sont pas fusionnés.

Les montants arrière partent du dessous d'un pont existant et rejoignent le premier pont inférieur ou plancher existant sous leur position. Aucun montant n'est créé sans support. Ils ne prennent pas appui sur un ascenseur et ne constituent pas de nouveaux colliders. Les coordonnées doivent rester finies ; la production des points de support est bornée.

`src/game-v51-runtime.js` utilise ces modules pour sols, tabliers, échelles et conduites. Pour les plateformes ordinaires, le haut visible du crop correspond au collider ; l'épaisseur suit celle de la plateforme. Les ascenseurs sont dessinés séparément une seule fois et leur record physique demeure mobile. La création d'un ascenseur Frontier Forge possède maintenant explicitement `kind: 'lift'`.

`src/game-v52-level-runtime.js` ne choisit plus alternativement une image de rebord selon l'index d'une plateforme de route : les ponts artificiels partagent un rôle structurel, les marches de terrain gardent leur rôle propre.

### Niveaux et commandes physiques

Dans `src/mission-levels-v52.js`, les hauteurs auteurs du vaisseau et de la colonie sont conservées. Le générateur consomme néanmoins les mêmes échantillons de hasard ; les positions horizontales et les tirages de gameplay ne changent pas pour cette raison. Les coordonnées des nœuds de la planète conservent leur variation historique.

Le nombre de surfaces intermédiaires tient désormais aussi compte de la différence de hauteur, avec une cible de marche maximale de 10 px. Les marches de pente utilisent une largeur proportionnée à leur espacement. Les raccords `planet-e12` et `planet-e17` deviennent deux échelles séparées à -70/+70 px de la balise, avec approches des deux côtés ; les routes surface, crête et grotte restent nommées et distinctes. La signature topologique de la planète change intentionnellement, mais l'identité de reprise fondée sur le gabarit et la graine reste stable.

Dans `src/game-v51-runtime.js`, la sélection d'échelle utilise les pieds et l'intention haut/bas. Au palier commun, haut choisit le connecteur au-dessus et bas celui au-dessous. Les pieds atteignent exactement le palier, la vitesse verticale s'annule et la marche redevient disponible. L'état au sol dépend d'un support réel ; une extrémité sans plancher n'en invente pas. Le saut dégage l'acteur pendant 0,2 seconde avant une éventuelle nouvelle prise.

## Invariants vérifiés et portée des tests

Commande exécutée depuis la racine source :

```text
node --test tests/mission-structure-art-v87.test.mjs tests/mission-structure-layout-v87.test.mjs tests/mission-ladder-traversal-v87.test.mjs tests/mission-stair-traversal-v87.test.mjs tests/mission-level-runtime-v52.test.mjs tests/mission-physical-topology-v57.test.mjs tests/topology-coherence-v58.test.mjs
```

Résultat de cette exécution : **96 tests, 96 réussites, 0 échec, 0 ignoré**.

| Fichier | Nombre | Contrat effectivement exercé |
|---|---:|---|
| `mission-structure-art-v87.test.mjs` | 21 | Crops immuables, répétitions sur les deux axes, coupe finale exacte, ouvertures des échelles, géométries invalides et garde-fous de coût |
| `mission-structure-layout-v87.test.mjs` | 9 | Fusion sans pont artificiel, absence de mutation, supports fixes réels, 50 graines par gabarit, coordonnées historiques et deux puits planétaires explicites |
| `mission-ladder-traversal-v87.test.mjs` | 12 | J1/J2 sur les trois gabarits, montée/descente/sortie, puits empilé, pause, saut, chute, intentions indépendantes, absence de faux sol |
| `mission-stair-traversal-v87.test.mjs` | 23 | Parcours J1/J2 aller-retour des deux nouveaux puits, marche sans saut sur trois anciennes pentes problématiques, marches/recouvrements sur 24 variantes de chacun des trois gabarits, mutations volontairement invalides rejetées |
| `mission-level-runtime-v52.test.mjs` | 13 | Consommation réelle du plan, couches, événements, props, collider de porte, haut visible du module, reprise à -5/0/+5 px, ascenseur Frontier Forge, sauvegarde refusée, volume royal et autres régressions conservées |
| `mission-physical-topology-v57.test.mjs` | 11 | Approches de connecteurs, vraie plateforme mobile, absence de plancher universel, dangers au contact de leur support, verrous et reprises de boss |
| `topology-coherence-v58.test.mjs` | 7 | Destinations et retours de portes, serrures, contrôles négatifs, graphe du hub et traversées associées |

Les empreintes historiques de 50 graines contrôlent identités de reprise, coordonnées horizontales, dangers, événements et spawns. Pour la planète, seules les deux arêtes volontairement converties sont normalisées lors de la comparaison historique ; leur nouveau contrat est testé séparément. La position verticale d'un danger et son identifiant de surface d'appui ne sont pas assimilés à un tirage aléatoire : ils sont vérifiés contre la surface réelle après recalage.

Le test de reprise utilise les vraies méthodes `captureResumeState`, `applyResumeState` et `updatePlayer`. Six cas vaisseau/colonie aux offsets -5/0/+5 px retrouvent le pont corrigé en conservant PV, munitions et porte ouverte. Il ne prétend pas parcourir toutes les anciennes sauvegardes de campagne.

Les parcours physiques gardent les plateformes auteurs et le résolveur de collision de production. Le combat, les dangers et certains obstacles interactifs sont neutralisés pour isoler la traversée ; les portes sont ouvertes. Pour vérifier les deux paliers de chaque échelle individuellement, la liste des connecteurs est temporairement isolée ; les puits empilés et les nouvelles jonctions disposent aussi de tests avec leurs connecteurs réels. Ce sont des fixtures moteur, **pas des parties complètes jouées en navigateur**.

`validateMissionTopologyV52` n'est que le contrôle de graphe ; `buildMissionLevelV52` le compose déjà avec `validateMissionPhysicalTopologyV57` et `validateMissionTopologyV58`. La présente passe ajoute des parcours et contrôles complémentaires, sans prétendre que les anciennes validations étaient exclusivement textuelles.

## Limites et travaux encore ouverts

- La composition visuelle complète, les proportions de chaque salle, les blancs de tous les props et l'absence d'occlusion gênante doivent encore être vérifiés en navigateur. Les crops propres ne prouvent pas à eux seuls le rendu final.
- Les fonds historiques en perspective, les accessoires spécialisés de chaque salle, les PNJ dédiés, les animations fluides et les sprites manquants ne sont pas produits par ce sous-lot.
- Les trois gabarits restent génériques. Les régions et vingt chapitres PALISADE, leurs raccourcis permanents, leurs retours après mission et leurs conséquences dédiées ne sont pas livrés. Une reprise de mission ne remplace pas cette persistance régionale. Les sept composantes demandées par grande mission restent à respecter : capacité, raccourci, optionnel, horreur, action, changement d'état et raison de revenir.
- Le hub garde ses dettes de props indépendants, PNJ, exercices avancés, replay MIRE et commandes CCTV. Corriger le renderer des missions ne ferme pas ces conversations.
- REFUGE reste une salle hommage distincte du mémorial militaire et des animaux. Ni cette salle ni la boucle boutique/transport/acclimatation/vie animale ne sont ajoutées ici.
- Le pack `ATF_Animaux_USS_PACK_CODEX_v1.zip` récupéré est un ensemble de spécifications : 15 fichiers, 18 familles, 16 individus, 14 offres, 8 habitats, 4 marchands, 8 quêtes et 178 associations famille/animation. **Zéro image, audio ou runtime animal livré dans ce ZIP**, conformément à `V87_SOURCE_RECOVERY_AND_PLAYER_HOTFIX.md` et à l'audit privé du pack. Ses critères QA ne sont pas des tests du jeu déjà exécutés.
- Le dernier bilan ennemi consigné dans `references/V76_CHATGPT_PROJECT_GAP_MATRIX.md`, suivi V85, est **14/571 profils intégrés, 557 non intégrés**. Cette correction de structure n'ajoute aucun ennemi ; elle ne constitue pas un nouvel audit exhaustif de leurs images.
- Les 79 JPG récupérés restent des références privées, pas 79 sprites branchés. Aucune fidélité 1:1, aucune couverture artistique exhaustive ni nouvelle génération ne sont revendiquées ici.

## Preuves locales et cache structurel

Le scénario reproductible `tests/browser-mission-structure-v87.mjs` utilise un contexte Chromium isolé, le build réel et les commandes clavier CDP dans la boucle RAF normale. Les acteurs sont initialement placés à un connecteur et les combats, obstacles et dangers sont neutralisés pour isoler la traversée. Aucun déplacement n'est ensuite injecté par téléportation. Il contrôle les deux personnages sur vaisseau, colonie et planète, ainsi que la chaîne verticale `ship-e19`/`ship-e20`, la marche après sortie et les ouvertures transparentes d'échelle. Quatre captures, zéro erreur console/réseau. Ce n'est pas un parcours complet de campagne.

Les captures vaisseau et planète ont été relues visuellement : les tabliers étroits et échelles ouvertes sont visibles. Les grands fonds historiques, éléments de plafond et props en perspective restent une dette visuelle distincte. Ni les blancs de tous les autres props ni la composition de toutes les salles ne sont certifiés.

`getMissionStructureLayoutV87` met en cache les ponts et supports fixes, avec contrôle O(n) des objets et champs structuraux. Un remplacement de tableau, ajout ou changement en place invalide le cache ; le déplacement vertical d'un lift ne l'invalide pas et conserve l'objet mobile réel. Les supports choisissent le premier pont inférieur avant de rejeter une distance inférieure à 28 px : ils ne sautent plus un palier proche pour rejoindre un sol plus bas. Les 18 tests de `mission-structure-cache-v87.test.mjs` sont inclus dans la suite complète.

Preuves privées sous l'espace nominal `privateoutput/v87/` :

- `structure-tests-final.log` : suite complète, 2 258 réussites et un ignoré ;
- `structure-local/report.json` et quatre JPG : parcours clavier/rendu, capture 1280 × 720 ;
- `structure-combat-local/` : non-régression combat, accueil et tactile ;
- `structure-pwa-local.json` : cache `atf-v86-public-shell-4`, 175 chemins, deux nouveaux modules et quatre équipements disponibles hors ligne ; quatre URL de documents interdites répondent encore 404 hors ligne ;
- `structure-http-local.json` : comparaison au SHA public exact, 68 modules critiques/assainis et 16 assets conformes ; 216 chemins privés répondent 404.

Ces rapports et captures ne sont pas dans l'arbre public. La séparation d'historique est conservée ; cette publication ne prétend pas effacer l'ancien historique déjà public.

## Publication vérifiée

Déploiement `dpl_2NsmXh8Vtqb27UE6wDC2uefde1B6`, branche `main`, commit public ci-dessus. Le connecteur Vercel confirme `READY`, cible `production`, `aliasError: null` et alias canonique `https://aliens-tantalus-frontier.vercel.app`. Build du timestamp 1789836469397 à 1789836560825, soit 91,428 secondes. L'état et les empreintes HTTP ont été contrôlés ; aucune lecture de logs serveur indisponibles n'est revendiquée.

- `privateoutput/v87/structure-http-production.json` : **68 modules critiques/assainis**, **16 assets**, **216 URL privées 404**, comparés au commit public `e9ff82dd80a55a964e106c9e6890d7f5162d520a`.
- `privateoutput/v87/structure-production/report.json` : trois gabarits, J1/J2, vraies commandes clavier, sorties de palier et chaîne de puits, quatre captures ; zéro erreur runtime/réseau. Les mêmes limites de fixture que le contrôle local s'appliquent.
- `privateoutput/v87/structure-pwa-production.json` : cache `atf-v86-public-shell-4`, **175 chemins**, deux nouveaux modules disponibles hors ligne, quatre URL de documents interdites toujours 404.

Le nom de release reste **86.0.0** : ce lot ne prétend pas livrer la totalité des demandes V87. Aucun document privé, aucune capture ni référence récupérée n'a été transféré au dépôt public. Le dépôt source et ses tests/audits sont committés localement, sans push de sa branche privée.
