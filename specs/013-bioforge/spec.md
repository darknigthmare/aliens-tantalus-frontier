# Spécification : Bioforge, laboratoire de confinement

**Spec** : `013-bioforge` | **Date** : 2026-11-22 | **Audit** : `docs/development/BIOFORGE_AUDIT_V188.md` | **Bible** : §8.2 quête `ship-bioforge` « Ce qu'on garde en vie », tableau des salles du secteur industriel (Bioforge : cuves, sas biologique, liquides, bulles) de `docs/narrative/CAMPAGNE_PRINCIPALE.md`

## Contexte

L'audit relève un niveau dont les salles ne se distinguent pas, dont les portes sont des murs invisibles de 10 m, dont les passerelles sont invisibles et dont la sortie est inaccessible : on entre à pied et on repart par un bouton. Le propriétaire demande d'améliorer le level design. Les systèmes de la Bioforge (composition, file, admissions V132, état physique V87, tactique V132, purge, historique) sont solides et conservés.

## Exigences

- **FR-001 Plan du laboratoire.** Le ruban existant (2880×720, 1 m = 51 px) est réorganisé en huit zones nommées, dans l'ordre du flux d'un spécimen, chacune rattachée à une salle existante :
  1. `cold-storage` Stockage froid (0–170, `control-room`)
  2. `control` Salle de contrôle (170–440, `control-room`)
  3. `airlock-equalize` Sas biologique A · équilibrage (440–670, `airlock-inner`)
  4. `airlock-decon` Sas biologique B · décontamination (670–920, `airlock-outer`)
  5. `tank-hall` Admission · hall des cuves (920–1280, `printer-bay`)
  6. `containment-cell` Cellule de confinement (1280–2460, `containment-arena`), avec la **galerie d'observation** en profondeur, derrière verre blindé (non praticable)
  7. `analysis-incinerator` Baie d'analyse · incinérateur (2460–2660, `return-lock`)
  8. `exit-decon` Sas de sortie · décontamination (2660–2880, `return-lock`)
  Les zones couvrent le ruban sans trou ni chevauchement et restent dans leur salle.
- **FR-002 Architecture visible.** Chaque porte a un cadre de cloison du sol au plafond logique : le collisionneur de 40×536 px correspond à un mur visible. Les salles fermées (stockage, contrôle, sas, analyse, sortie) ont un plafond visuel à hauteur humaine (5 à 6 m) ; le hall des cuves et la cellule restent hauts. Libellé de zone, lumière propre, sol et plafond dessinés.
- **FR-003 Passerelles.** Les passerelles et échelles de la cellule sont dessinées ; elles sont signalées comme réservées aux spécimens (l'opérateur n'escalade pas).
- **FR-004 Arrivée praticable.** Dans la vue Bioforge, sans session active, l'opérateur peut marcher dans la salle de contrôle et le stockage froid (portes de sécurité fermées) ; la console de contrôle (E) ouvre le terminal ; « LANCER LE CYCLE » arrête cette promenade sans purge et garde la position s'il est dans la salle de contrôle.
- **FR-005 Flux d'admission.** Le hall des cuves montre la file réelle de la session : deux cuves de stase affichent les deux prochaines lignes de composition (profil, nombre en attente) ; une cuve se vide quand sa ligne est imprimée. Bulles et liquide passent par la couche VFX V188.
- **FR-006 Sas biologique.** L'entrée garde les trois étapes existantes (`transferStage` 0–3, mêmes événements). À l'ouverture de l'interlock, une brume de décontamination traverse le SAS B (présentation). À la sortie, la décontamination est une **condition** : voir FR-008.
- **FR-007 Sortie physique.** Après une purge réussie, si l'opérateur est vivant dans la cellule, une touche de déplacement ou E reprend la marche (sans relancer de session). Les portes de sortie sont ouvertes ; le cycle de purge (atlas existant) est animé dans la cellule.
- **FR-008 Décontamination de sortie.** Dans le sas de sortie, E à la console de retour démarre un cycle de 2,4 s **[PROPOSÉ]** ; quitter la cabine l'interrompt. Une fois le cycle terminé, la porte `hub-return` s'ouvre ; la franchir ramène au Tantalus (même chemin que le bouton « RETOUR AU HUB »). Avant, la porte reste fermée (raison `decontamination-required`).
- **FR-009 Interactions de laboratoire.** E au stockage froid : nombre d'échantillons conservés (somme des neutralisations enregistrées par profil). E à la table de dissection : analyse de la dernière session de l'historique. E à la console d'incinérateur : rapport de la dernière purge. Aucune de ces interactions ne modifie la sauvegarde.
- **FR-010 Invites et HUD.** Une invite « E — … » apparaît au-dessus de l'élément interactif à portée ; le HUD du canvas passe en haut à droite (le terminal réduit occupe le coin gauche) et donne la consigne de la phase courante, y compris la sortie.
- **FR-011 Conservation.** Identifiants de salles, portes, stations et emplacements, schémas de niveau (80) et de sauvegarde (`bioforgeV80`), admissions et règles de session inchangés. Les positions des stations `bioforge-control` (x 190 → 230) et `bioforge-purge` (x 2535 → 2490) changent ; elles ne sont pas sauvegardées. La marche hors session et la sortie ne sont pas persistées (pas d'écriture périodique) ; une reprise en phase `return` garde le retour par le terminal.
- **FR-012 Textes** FR + EN (catalogue relu, delta Tantalus).
- **FR-013 Mobile.** Les textes du terminal ne se chevauchent plus à 390 px.

## Références de fidélité

Rien n'est déclaré « 1:1 ».

| Élément | Documenté (source) | Adapté par le projet | À définir |
| --- | --- | --- | --- |
| Cuves de stase avec spécimens | Medlab de Hadley's Hope, facehuggers conservés dans des cylindres (*Aliens*, 1986) ; laboratoire de l'USM Auriga, spécimens en cuves (*Alien Resurrection*, 1997) | Deux cuves au premier plan montrant la file réelle ; silhouettes génériques | Image des cuves et des spécimens |
| Baie d'analyse | Infirmerie / laboratoire d'Ash, examen du facehugger (*Alien*, 1979) ; laboratoires du *Prometheus* (2012) et du *Covenant* (2017) | Table de dissection, bras de scanner, rapport de session | Image |
| Galerie d'observation | Observation des spécimens derrière vitre (*Alien Resurrection*, 1997) | Bande vitrée en profondeur au-dessus de la cellule, non praticable | Étage praticable ; présence d'Inez / BISHOP-9 (quête `ship-bioforge`) |
| Sas et décontamination | Sas et procédures de quarantaine (*Alien*, 1979) ; secteur médical et de recherche de Sevastopol (*Alien: Isolation*, 2014) | Deux sas d'entrée, brume ; cycle de sortie obligatoire de 2,4 s | Son, image |
| Stockage froid | Conservation d'échantillons en laboratoire (ensemble des films ; aucune scène précise citée) | Tiroirs cryogéniques, givre, compteur d'échantillons | Image |
| Purge / incinérateur | Lance-flammes et incinération comme réponse au confinement (*Aliens*, 1986 ; *Alien 3*, 1992) | Atlas de purge V80 animé, trappe d'incinérateur | Image |

## Hors périmètre

Étage d'observation praticable (monde à agrandir, validateurs V87/V132 à migrer) ; quête `ship-bioforge` et PNJ ; images définitives ; son ; reprise exacte de la position pendant la sortie.
