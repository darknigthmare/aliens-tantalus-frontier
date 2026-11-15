# Research: Autres cales de mission en profondeur

Source : évaluation jouée dans Chromium (2026-11-15), cartographie des gabarits de mission et mesures sur le moteur réel.

## R1 — Évaluation jouée de la cale de QZ-17 (Q31)

**Protocole** : serveur local, Chromium sans affichage (Playwright), profil importé par l'écran Sauvegarde, QZ-17 lancée depuis le Commandement, cinématique d'insertion passée avec Échap. Echo-9 part du point d'insertion et rejoint la cale avec les touches réelles (D, E aux sas), puis W/S, F (tir), clic milieu (corps à corps), saut (Espace). Injections déclarées : santé remise à 100 pendant les rafales ; pour la sonde de saut, les ennemis de la cale et le vide retirés ; pour la mesure, positions replacées à chaque bloc. Captures dans le dossier de travail de la session (`holds/qz17-*.png`).

**Ce qui se lit bien**

- W/S répondent tout de suite (150 unités/s). La palette arrête S à −42, le conteneur QZ17-01 arrête la marche dans sa bande. Loin du mur, Echo-9 s'arrête au bord du sas (x0 + 2) ; W le ramène au rail et il sort.
- Les tirs dans la bande portent et recalent le tireur : le porteur blindé, réveillé dans la travée vide de QZ17-04 (−70), vient à −36 puis dans la bande d'Echo-9 et se fait toucher à −42.
- Le réveil des rôdeurs par la dépressurisation fonctionne : ils sortent de derrière QZ17-01 et de la travée vide, ce qui sert la peur voulue par la spec 002.
- L'occultation par QZ17-01 et le contour d'Echo-9 restent lisibles.

**Ce qui prête à confusion (classé)**

- **P1, corrigé** — saut dans une voie avant. Un acteur en l'air n'était plus « dans la cale » : Echo-9 sautait de −80 jusqu'à la ligne du mur (saut de 80 px à l'écran, capture `qz17-07-front-lane-jump.png`). Ses tirs en l'air partaient sans bande et touchaient toutes les profondeurs. Les coups d'un ennemi en bond ignoraient la bande. Le drone tombé du pont de service a ainsi été touché à z 0 par une rafale tirée de −42. Correction : `overDepthSectionV188` (au-dessus du sol de la cale, 300 px de hauteur) pour le dessin, les tirs, les coups, les invites et la conservation de la profondeur. Les pas en profondeur restent au sol.
- **P2, corrigé** — invite au mur affichée en plein saut depuis une voie avant ; même correction.
- **P2, corrigé** — coop : toutes les balles d'une image prenaient la profondeur de la première, et seul Echo-9 se recalait. Désormais une passe par profondeur, et le recalage va au propriétaire de la salve.
- **P3, consigné** — la palette ne laisse que 18 unités devant elle (règle des 20). Elle reste en place pour garder QZ-17 identique (FR-002 de la spec 004).
- **P3, consigné** — les projectiles ennemis (acide de cracheur) ne sont pas arrêtés par les conteneurs, alors que les salves du joueur le sont.
- **P3, consigné** — l'aide en bas d'écran annonce « MAJ + A/D/W/S pour viser » ; dans la cale, W/S restent la profondeur.
- **Observation** — la cale est dure : burster, porteur et drone du pont de service ont tué Echo-9 en une vingtaine de secondes sans couverture. Tous les ennemis rejoignent exactement la bande d'Echo-9 et s'y empilent ; c'est lisible mais peu varié.

**Coût d'image (QZ-17, après corrections)** : même page, Echo-9 derrière QZ17-01 (calque d'occultation à chaque image), deux créatures éveillées. 6 alternances de blocs de 300 images, ordre alterné : 18,8 ms mixin actif contre 18,65 ms inerte (+0,8 %). La dispersion d'un bloc à l'autre (16,4–22,7 ms) dépasse l'écart ; Chromium sans affichage, rendu logiciel.

## R2 — Choix des cales

- **Decision** : cale des cargos (missions procédurales de vaisseau) et cale de quarantaine de Léthé. Cargo Brutal reste en 2D.
- **Rationale** :
  - Le gabarit `ship-interior-vertical` est celui de 214 campagnes de `src/content.js` (FRONTIER et MIRE), en plus de QZ-17, Cargo Brutal, Systèmes de survie, Nostromo et des missions de ruche. Sa soute basse (`ship-cargo`, y 868, ≈ 580 px entre `dock-bulkhead` et `cargo-bulkhead`) est la même partout. Seuls changent, selon la graine : la couverture de caisses (≈ x0 + 307…403), la caisse de munitions (≈ 245…315), le conduit de service (≈ 138…236) et la porte arrière V130 (≈ 235…325).
  - **Cargos** : l'application choisit le gabarit par l'objectif et le monde de la campagne. La cale est active quand ce gabarit propre est le vaisseau, hors opérations spéciales.
  - **Léthé** : même soute, avec des systèmes qui gagnent à la profondeur : acide persistant, portes soudées, pression. Les postes de la survie sont dans d'autres salles ; la trousse de soudage et la première flaque tombent sur le pont supérieur de la zone (y 140) et restent hors de la cale.
  - **Cargo Brutal, rejeté** : le niveau est plat (sol 470, sans profil V130). Le P-5000 démarre à x 820, juste avant la soute, et le conteneur Alpha (1450…1688) chevauche le sas de cargaison. Le pilote est `inVehicle` et donc hors de toute profondeur. Les frappes du chargeur visent par x : un ennemi en profondeur serait touché depuis n'importe quelle voie, ou il faudrait une règle de bande pour le véhicule. Le couloir à dégager perdrait aussi son sens si l'on contournait les obstacles. La soute reste donc en 2D ; un test vérifie que les trois obstacles sont inchangés.
  - **Colonie, rejetée** : aucun entrepôt dans `colony-multiroute`. Les galeries techniques sont des tunnels à conduits et obscurité, et l'aire d'évacuation est extérieure ; un autre agent y prépare l'atterrissage du dropship.
  - **Ruche, rejetée** : JERI, A.T.A.X.-Q et Éloïse font jouer une créature qui marche aux murs et au plafond.

## R3 — Construction par définitions

- **Decision** : `src/depth-hold-sections-v188.js`. QZ-17 garde sa disposition fixe (`layout`), et un test de référence compare la section au constructeur de la spec 002. Les autres cales décrivent leurs objets avec une règle de placement :
  - `west-clear` / `east-clear` : milieu du premier ou du dernier mur nu assez large ;
  - `at` : position relative à x0.
- Un objet est « haut » si son sommet dépasse la ligne du mur (h > −z). Il n'est placé que devant un mur nu.
- Un objet qui violerait la règle de voie est écarté et consigné dans `section.skipped` ; aucun ne l'est sur les niveaux testés.
- **Échelle** : 1 m ≈ 51 px en largeur et en hauteur ; la profondeur du sol est raccourcie, ≈ 22 unités/m (le conteneur de 2,44 m de QZ-17 couvre 54 unités).

| Objet | Taille | Emprise z | Raison |
| --- | --- | --- | --- |
| Pile de deux caisses sur palette | 61 × 92 px (1,2 × 1,8 m) | −60…−34 (1,2 m) | 20 devant, 34 derrière ; mur nu ouest et est |
| Râtelier de trois fûts de 200 L | 96 × 52 px | −88…−66 (bord avant) | bas : devant le conduit et la porte arrière, 66 derrière |
| Caisse de quarantaine | 92 × 61 px (1,8 × 1,2 m) | −86…−54 (bord avant) | basse, 54 derrière ; 20 avec la couverture |
| Chariot à échantillons renversé | 76 × 40 px (1,5 × 0,8 m) | −58…−40 | 22 devant, 40 derrière |

## R4 — Castes, acide, dormeurs

- **Grandes castes** : Reine, Crusher, Praetorian, Titan, boss et largeur > 120 px (`unfitForHoldV188`). Dans les cales 004, elles occupent toute la profondeur : pas de guidage, coups et tirs dans toutes les voies. Les rôles générés y placent des Reines, que le rôle de la mission (Léthé, Node) ou la graine (cargos) produisent. QZ-17 garde sa règle : la dressing les envoie au pont de service.
- **Acide (Léthé)** : une flaque créée sur le sol de la cale prend la profondeur de la créature tuée et brûle dans ±24. Pendant `updateAlienSurvivalAcidV70`, la liste des acteurs exposés est filtrée flaque par flaque. La profondeur est dessinée par translation et sauvegardée dans `depthV188.acid`. Une flaque sans source, ou issue d'une reprise antérieure, garde son comportement au rail.
- **Dormeurs** : les rôdeurs de la dépressurisation (`ship-cargo-stalkers`) attendent derrière la pile est (−12), derrière les fûts (−50) et devant la pile ouest (−70). Pour Léthé : derrière la caisse est, devant le chariot, derrière la caisse ouest.

## R5 — Mesures (même page, ordre alterné)

Protocole de R1 : Echo-9 derrière l'objet le plus haut de la cale (calque d'occultation à chaque image), deux créatures éveillées. On compare le mixin actif (« après ») au mixin inerte, section retirée (« avant », la soute en 2D). Chromium sans affichage, rendu logiciel, ms par image `update + draw`.

| Cale | Essai | Actif | Inerte | Écart |
| --- | --- | --- | --- | --- |
| Cargo (pair-001-mire) | 1 : 6 × 300 images, objets dessinés à chaque image | 19,55 | 17,69 | +10,5 % |
| Léthé | 1 : idem | 21,61 | 18,76 | +15,2 % |
| Cargo | 2 : 10 × 300, dessin des objets mis en cache | 17,56 | 17,04 | +3,1 % |
| Léthé | 2 : idem | 18,49 | 17,40 | +6,3 % |
| QZ-17 (inchangée, contrôle) | 2 : 10 × 300 | 19,26 | 18,44 | +4,4 % |

- Le premier essai dépassait la cible de 10 %. Le repli en primitives de chaque emplacement est désormais rendu une fois dans un canvas hors écran, puis copié (`drawDepthHoldSlotV188`).
- La dispersion entre blocs reste de 2 à 4 ms. Les écarts du second essai sont donc sous la cible, sans être plus précis que ±3 %.
- Pas de mesure sur matériel cible.
