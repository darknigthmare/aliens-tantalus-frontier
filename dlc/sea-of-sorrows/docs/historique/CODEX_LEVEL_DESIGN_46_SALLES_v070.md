# Codex de level design — La Mer des Chagrins
## v0.7.0 · 46 salles / 53 liaisons

Ce document est généré à partir des données réellement lues par le moteur. Les dimensions sont des unités de jeu, pas des mesures du roman. Les noms détaillés de salles sont des créations d’adaptation. La carte ne prétend pas reproduire un plan canonique.

## Doctrine et lecture des fiches

Chaque porte porte une paire de liaison. Le retour utilise cette même paire et restaure une position d’arrivée voisine du seuil ; les états de la salle persistent. Les coordonnées `x` sont horizontales, `z` indique la profondeur du sol. Les cadres du HUD restent hors du canvas.

Le mode global CLASSIC ramène toutes les profondeurs à 0,55 et ignore les couvertures déclarées non bloquantes pour cette vue. Les conditions d’objectif ne changent pas. Les cages, escaliers, vols et transferts sont des changements de salle explicites, pas une physique verticale continue.

Les « intentions de décor » reprises du champ `propNotes` constituent une direction de fabrication. Elles ne signifient pas que chaque accessoire nommé possède déjà un sprite dédié. Les tableaux de collision ci-dessous, eux, correspondent à des objets rendus et bloquants dans le prototype.

La sauvegarde de reprise est créée à chaque entrée de salle par le moteur. Le champ historique `checkpoint` des données ne filtre pas ce comportement dans la version 0.7.0.

## Parcours des chapitres

| Chapitre du jeu | Objectifs jouables | Note de mise en scène |
|---|---|---|
| 01 — La mer noire | Relever le carottier (s02) | Inspection civile. Aucun arsenal, aucun xénomorphe en patrouille sur le chantier. |
| 02 — Le rapport | Transmettre les résultats (s03) | Une traversée sanitaire relie explicitement les deux planètes. Le rapport devient un objet de l’intrigue. |
| 03 — Un rapport de trop | Déposer les conclusions (s04) ; Passer les examens (s06) ; Écouter le message familial (s05) | L’appartement et la Commission sont reliés par le tram, pas par un couloir de vaisseau. |
| 04 — La dette | Écouter Rollins (s08) ; Récupérer l’équipement (s09) | La pression de la compagnie reste institutionnelle. Pas de combat de boss contre Rollins. |
| 05 — Retour à Galveston | Rejoindre le briefing (s12) ; Vérifier les filtres (s13) ; Mettre la cage en service (s14) | Le camp de surface conserve son identité jusqu’au retour final. |
| 06 — Sous les installations | Établir le relais (s16) ; Rétablir la desserte (s18) | Premier raccourci permanent, atelier facultatif et retour lisible au relais. |
| 07 — La carène | Examiner la brèche (s20) ; Retrouver le balisage de fouille (s21) | Ne pas rebaptiser la coque en vaisseau d’Ingénieur sans source ; le relevé décrit ce qui est visible. |
| 08 — La ville muette | Examiner les restes (s23) ; Récupérer le détecteur (s24) | Les vestiges ne deviennent pas une faction ennemie vivante inventée. |
| 09 — Trois signaux | Écouter ce qui approche (s26) ; Retrouver la balise perdue (s28) | L’empathie est directionnelle et incertaine. Elle ne donne ni carte complète ni contrôle des créatures. |
| 10 — Un chemin qui change | Marquer la dérivation (s27) ; Vérifier le passage fermé (s29) | Une fermeture scénarisée modifie un lien précis, jamais le graphe au hasard. |
| 11 — La sortie perdue | Examiner le second ascenseur (s30) | La perte du puits est un événement du récit. Elle ne peut enfermer le joueur sans issue. |
| 12 — L’autre escalier | Repérer la voie de secours (s31) ; Repérer un passage entre les œufs (s32) | Les œufs occupent des îlots contournables ; les parasites proviennent de points identifiables. |
| 13 — La pondeuse | Ouvrir la voie au groupe (s33) | Affrontement collectif : Decker brûle les attaches et ouvre les angles de tir de Manning. |
| 14 — Ceux qu’on emporte | Mettre Adams à l’abri (s34) ; Mettre Elway à l’abri (s34) | Aucun soin ne supprime une implantation ; la mise à l’abri n’équivaut pas à une guérison. |
| 15 — Remonter | Actionner le treuil (s35) ; Ouvrir le passage du ravin (s36) ; Rallumer la balise d’approche (s11) | Retour à la vraie salle s11, recontextualisée ; aucune copie sans correspondance spatiale. |
| 16 — Un spécimen vivant | Immobiliser puis enfermer l’adulte (s37) | Utiliser le moussoir pour immobiliser l’adulte dans la soute. Le tuer impose de reprendre la séquence. |
| 17 — Réception de cargaison | Confirmer le transfert (s38) ; Observer la surface (s39) | La fin n’est pas réécrite en victoire parfaite de Decker. Le récit conserve le succès de la récupération. |
| 18 — Les voix persistent | Entrer en hypersommeil (s40) | Épilogue contemplatif. Aucun nouveau boss psychique ; aucun bonus ramenant les spécimens dans la campagne 2204. |

## Fiches de salles

### S01 — Poste de contrôle

**Secteur : Surface · Profil : sand · Vue hybride : DEPTH · Largeur : 1960 unités.**

Des herbes rases butent sur une bande de sable noir. Le poste reste relié à la voie de service.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Portique de surveillance ; bornes météo ; clôture ouverte ; câbles enterrés ; traces de chenilles.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-01 | s02 — Le carottier | door | 1860 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s01-hero-0 | checkpoint | 470 ; 0.075 | background |
| s01-hero-1 | fence | 1294 ; 0.075 | background |
| s01-detail-0 | cableTray | 176 ; 0.060 | background |
| s01-detail-1 | warningStripe | 706 ; 0.060 | background |
| s01-detail-2 | cableTray | 1000 ; 0.060 | background |
| s01-detail-3 | warningStripe | 1588 ; 0.960 | foreground |
| s01-detail-4 | cableTray | 1784 ; 0.960 | foreground |

Relevé facultatif `field-s01` : x = 706, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s01-block-0 — caisse industrielle | 588 ; 0.22 | 140 ; 0.12 | 75 |
| s01-block-1 — rayonnage | 1098 ; 0.77 | 140 ; 0.12 | 75 |
| s01-block-2 — faisceau de conduites | 1490 ; 0.22 | 140 ; 0.12 | 75 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S02 — Le carottier

**Secteur : Surface · Profil : sand · Vue hybride : DEPTH · Largeur : 2240 unités.**

Le forage repose sur une plateforme dissymétrique au-dessus des tubes de silice. Une passerelle permet de contourner la machine.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Carottier ancré ; vérins ; caisse de prélèvement ; manche à air ; balises de périmètre.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-01 | s01 — Poste de contrôle | door | 2140 ; 0.55 | accès ouvert selon la progression | Non |
| link-02 | s03 — Transport sanitaire | travel | 100 ; 0.55 | accident | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o01-01` : **Relever le carottier**, à x = 1142, z = 0.55. Déclenche `accident` après validation des conditions du type `sample`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s02-hero-0 | drill | 538 ; 0.075 | background |
| s02-hero-1 | reel | 1478 ; 0.075 | background |
| s02-detail-0 | cableTray | 202 ; 0.060 | background |
| s02-detail-1 | warningStripe | 806 ; 0.060 | background |
| s02-detail-2 | cableTray | 1142 ; 0.060 | background |
| s02-detail-3 | warningStripe | 1814 ; 0.960 | foreground |
| s02-detail-4 | cableTray | 2038 ; 0.960 | foreground |

Intervention `o01-01` : **3 secondes**, bruit **25** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s02` : x = 806, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s02-block-0 — caisse industrielle | 672 ; 0.22 | 164 ; 0.12 | 90 |
| s02-block-1 — rayonnage | 1254 ; 0.77 | 164 ; 0.12 | 90 |
| s02-block-2 — faisceau de conduites | 1702 ; 0.22 | 164 ; 0.12 | 90 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S03 — Transport sanitaire

**Secteur : Transit · Profil : medical · Vue hybride : SIDE · Largeur : 1580 unités.**

Une courte cabine pressurisée : couchette à gauche, terminal médical au centre, sas à droite.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Couchette ; moniteur ; écran de télémétrie ; rangement mural ; hublot oblong.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-03 | s04 — Bureau de la Commission | travel | 1480 ; 0.55 | report_sent | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o02-01` : **Transmettre les résultats**, à x = 806, z = 0.55. Déclenche `report_sent` après validation des conditions du type `analyse`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s03-hero-0 | medical | 379 ; 0.075 | background |
| s03-hero-1 | locker | 1043 ; 0.075 | background |
| s03-detail-0 | cableTray | 142 ; 0.060 | background |
| s03-detail-1 | warningStripe | 569 ; 0.060 | background |
| s03-detail-2 | cableTray | 806 ; 0.060 | background |
| s03-detail-3 | warningStripe | 1280 ; 0.960 | foreground |
| s03-detail-4 | cableTray | 1438 ; 0.960 | foreground |

Intervention `o02-01` : **2 secondes**, bruit **8** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s03` : x = 569, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S04 — Bureau de la Commission

**Secteur : Terre · Profil : office · Vue hybride : HYBRID · Largeur : 1960 unités.**

Les guichets ouvrent sur une salle de consultation. Les fenêtres montrent la ville et non le chantier minier.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Bureaux ; imprimante ; casiers ; rangements documentaires ; baie sur les voies urbaines.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-04 | s05 — Appartement de Decker | tram | 1860 ; 0.55 | accès ouvert selon la progression | Non |
| link-05 | s06 — Consultation | door | 100 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o03-01` : **Déposer les conclusions**, à x = 1000, z = 0.55. Déclenche `report_filed` après validation des conditions du type `terminal`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s04-hero-0 | office | 470 ; 0.075 | background |
| s04-hero-1 | terminal | 1294 ; 0.075 | background |
| s04-detail-0 | cableTray | 176 ; 0.060 | background |
| s04-detail-1 | warningStripe | 706 ; 0.060 | background |
| s04-detail-2 | cableTray | 1000 ; 0.060 | background |
| s04-detail-3 | warningStripe | 1588 ; 0.960 | foreground |
| s04-detail-4 | cableTray | 1784 ; 0.960 | foreground |

Intervention `o03-01` : **2 secondes**, bruit **8** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s04` : x = 706, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s04-block-0 — caisse industrielle | 588 ; 0.22 | 140 ; 0.12 | 120 |
| s04-block-1 — rayonnage | 1098 ; 0.77 | 140 ; 0.12 | 120 |
| s04-block-2 — faisceau de conduites | 1490 ; 0.22 | 140 ; 0.12 | 120 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S05 — Appartement de Decker

**Secteur : Terre · Profil : home · Vue hybride : SIDE · Largeur : 1800 unités.**

Un logement habité, pas une arène. Des affaires familiales occupent le fond ; une circulation libre mène au terminal personnel.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Table ; assises ; rangement bas ; dessins ; terminal familial ; fenêtre sur la rue.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-04 | s04 — Bureau de la Commission | tram | 1700 ; 0.55 | accès ouvert selon la progression | Non |
| link-06 | s07 — Coursive sous garde | story | 100 ; 0.55 | earth_done | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o03-03` : **Écouter le message familial**, à x = 918, z = 0.55. Déclenche `earth_done` après validation des conditions du type `message`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s05-hero-0 | home | 432 ; 0.075 | background |
| s05-hero-1 | locker | 1188 ; 0.075 | background |
| s05-detail-0 | cableTray | 162 ; 0.060 | background |
| s05-detail-1 | warningStripe | 648 ; 0.060 | background |
| s05-detail-2 | cableTray | 918 ; 0.060 | background |
| s05-detail-3 | warningStripe | 1458 ; 0.960 | foreground |
| s05-detail-4 | cableTray | 1638 ; 0.960 | foreground |

Relevé facultatif `field-s05` : x = 648, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S06 — Consultation

**Secteur : Terre · Profil : medical · Vue hybride : HYBRID · Largeur : 1660 unités.**

Le cabinet médical est relié à la Commission par la circulation publique. Un écran isole la table d’examen.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Table d’examen ; rideau ; analyseur ; lave-mains ; dossier patient.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-05 | s04 — Bureau de la Commission | door | 1560 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o03-02` : **Passer les examens**, à x = 1112, z = 0.55. Déclenche `exam_done` après validation des conditions du type `medical`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s06-hero-0 | medical | 398 ; 0.075 | background |
| s06-hero-1 | wash | 1096 ; 0.075 | background |
| s06-detail-0 | cableTray | 149 ; 0.060 | background |
| s06-detail-1 | warningStripe | 598 ; 0.060 | background |
| s06-detail-2 | cableTray | 847 ; 0.060 | background |
| s06-detail-3 | warningStripe | 1345 ; 0.960 | foreground |
| s06-detail-4 | cableTray | 1511 ; 0.960 | foreground |

Intervention `o03-02` : **2.5 secondes**, bruit **3** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s06` : x = 664, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s06-block-0 — caisse industrielle | 498 ; 0.22 | 188 ; 0.12 | 90 |
| s06-block-1 — rayonnage | 930 ; 0.77 | 188 ; 0.12 | 90 |
| s06-block-2 — faisceau de conduites | 1262 ; 0.22 | 188 ; 0.12 | 90 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S07 — Coursive sous garde

**Secteur : Vaisseau · Profil : ship · Vue hybride : SIDE · Largeur : 1720 unités.**

Une coursive surveillée relie l’infirmerie à la salle d’entretien. Les portes de service ne mènent pas à un autre monde.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Caméra ; grille de ventilation ; banc fixé ; canalisation ; voyant de verrou.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-07 | s08 — La salle d’entretien | door | 1620 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s07-hero-0 | airlock | 413 ; 0.075 | background |
| s07-hero-1 | locker | 1135 ; 0.075 | background |
| s07-detail-0 | cableTray | 155 ; 0.060 | background |
| s07-detail-1 | warningStripe | 619 ; 0.060 | background |
| s07-detail-2 | cableTray | 877 ; 0.060 | background |
| s07-detail-3 | warningStripe | 1393 ; 0.960 | foreground |
| s07-detail-4 | cableTray | 1565 ; 0.960 | foreground |

Relevé facultatif `field-s07` : x = 619, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S08 — La salle d’entretien

**Secteur : Vaisseau · Profil : office · Vue hybride : HYBRID · Largeur : 1760 unités.**

Deux sièges se font face, séparés par une console. Le vitrage laisse voir les coursives du bord.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Console ; deux fauteuils ; écran dossier ; armoire scellée ; vitrage technique.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-07 | s07 — Coursive sous garde | door | 1660 ; 0.55 | accès ouvert selon la progression | Non |
| link-08 | s09 — Réserve d’équipement | door | 100 ; 0.55 | contract | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o04-01` : **Écouter Rollins**, à x = 898, z = 0.55. Déclenche `contract` après validation des conditions du type `talk`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s08-hero-0 | office | 422 ; 0.075 | background |
| s08-hero-1 | briefing | 1162 ; 0.075 | background |
| s08-detail-0 | cableTray | 158 ; 0.060 | background |
| s08-detail-1 | warningStripe | 634 ; 0.060 | background |
| s08-detail-2 | cableTray | 898 ; 0.060 | background |
| s08-detail-3 | warningStripe | 1426 ; 0.960 | foreground |
| s08-detail-4 | cableTray | 1602 ; 0.960 | foreground |

Relevé facultatif `field-s08` : x = 634, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s08-block-0 — caisse industrielle | 528 ; 0.22 | 164 ; 0.12 | 120 |
| s08-block-1 — rayonnage | 986 ; 0.77 | 164 ; 0.12 | 120 |
| s08-block-2 — faisceau de conduites | 1338 ; 0.22 | 164 ; 0.12 | 120 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S09 — Réserve d’équipement

**Secteur : Vaisseau · Profil : armory · Vue hybride : DEPTH · Largeur : 2080 unités.**

Trois travées stockent l’équipement de l’expédition. Les passages entre les racks permettent de changer de profondeur. Implantation v0.3 : magasins en vis-à-vis. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Racks ancrés ; combinaisons ; chargeurs ; malle de filtres ; casiers numérotés.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-08 | s08 — La salle d’entretien | door | 1980 ; 0.55 | accès ouvert selon la progression | Non |
| link-09 | s10 — Baie d’embarquement | door | 100 ; 0.55 | equipped | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o04-02` : **Récupérer l’équipement**, à x = 1394, z = 0.55. Déclenche `equipped` après validation des conditions du type `equipment`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s09-hero-0 | armory | 499 ; 0.075 | background |
| s09-hero-1 | locker | 1373 ; 0.075 | background |
| s09-detail-0 | cableTray | 187 ; 0.060 | background |
| s09-detail-1 | warningStripe | 749 ; 0.060 | background |
| s09-detail-2 | cableTray | 1061 ; 0.060 | background |
| s09-detail-3 | warningStripe | 1685 ; 0.960 | foreground |
| s09-detail-4 | cableTray | 1893 ; 0.960 | foreground |

Intervention `o04-02` : **2.2 secondes**, bruit **15** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s09` : x = 749, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s09-v030-0 — rayonnage | 590 ; 0.23 | 240 ; 0.13 | 115 |
| s09-v030-1 — rayonnage | 1020 ; 0.79 | 380 ; 0.10 | 115 |
| s09-v030-2 — caisse industrielle | 1660 ; 0.23 | 290 ; 0.14 | 80 |
| s09-v030-3 — caisse industrielle | 1840 ; 0.74 | 170 ; 0.12 | 80 |

**Révision spatiale 0.3.** Magasins en vis-à-vis. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S10 — Baie d’embarquement

**Secteur : Vaisseau · Profil : hangar · Vue hybride : DEPTH · Largeur : 2480 unités.**

Une rampe et un couloir de sécurité conduisent à la navette. Les volumes au fond ne sont pas jouables.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Navette ; câbles ombilicaux ; treuil ; chariots ; balises de rampe.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-09 | s09 — Réserve d’équipement | door | 2380 ; 0.55 | accès ouvert selon la progression | Non |
| link-10 | s11 — Aire d’atterrissage | flight | 100 ; 0.55 | equipped | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s10-hero-0 | dropship | 595 ; 0.075 | background |
| s10-hero-1 | cargo | 1637 ; 0.075 | background |
| s10-detail-0 | cableTray | 223 ; 0.060 | background |
| s10-detail-1 | warningStripe | 893 ; 0.060 | background |
| s10-detail-2 | cableTray | 1265 ; 0.060 | background |
| s10-detail-3 | warningStripe | 2009 ; 0.960 | foreground |
| s10-detail-4 | cableTray | 2257 ; 0.960 | foreground |

Relevé facultatif `field-s10` : x = 893, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s10-block-0 — caisse industrielle | 744 ; 0.22 | 140 ; 0.12 | 90 |
| s10-block-1 — rayonnage | 1389 ; 0.77 | 140 ; 0.12 | 90 |
| s10-block-2 — faisceau de conduites | 1885 ; 0.22 | 140 ; 0.12 | 90 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S11 — Aire d’atterrissage

**Secteur : Camp · Profil : sand · Vue hybride : DEPTH · Largeur : 2560 unités.**

La même aire sera retrouvée au retour. Le camp reste à l’est et le ravin d’accès au nord. Implantation v0.3 : aire ouverte et ligne de fret. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Dalles prises dans le sable ; balises ; réservoir ; abri radio ; traces de moteurs.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-11 | s12 — Abri d’expédition | door | 2460 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-41 | s36 — Ravin de service | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-42 | s37 — Soute de la navette | ramp | 1178 ; 0.15 | beacon_lit | Non |
| link-51 | s46 — Poste de guidage | door | 2150 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-11 vers S12, link-41 vers S36, link-51 vers S46. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S12 (link-11), S36 (link-41), S46 (link-51), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o15-03` : **Rallumer la balise d’approche**, à x = 1306, z = 0.55. Déclenche `beacon_lit` après validation des conditions du type `beacon`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s11-hero-0 | landing | 614 ; 0.075 | background |
| s11-hero-1 | antenna | 1690 ; 0.075 | background |
| s11-detail-0 | cableTray | 230 ; 0.060 | background |
| s11-detail-1 | warningStripe | 922 ; 0.060 | background |
| s11-detail-2 | cableTray | 1306 ; 0.060 | background |
| s11-detail-3 | warningStripe | 2074 ; 0.960 | foreground |
| s11-detail-4 | cableTray | 2330 ; 0.960 | foreground |

Intervention `o15-03` : **5 secondes**, bruit **80** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s11` : x = 922, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s11-v030-0 — caisse industrielle | 600 ; 0.24 | 300 ; 0.14 | 80 |
| s11-v030-1 — caisse industrielle | 1100 ; 0.76 | 230 ; 0.14 | 80 |
| s11-v030-2 — faisceau de conduites | 1670 ; 0.26 | 240 ; 0.14 | 80 |
| s11-v030-3 — rayonnage | 1930 ; 0.73 | 230 ; 0.12 | 115 |

**Révision spatiale 0.3.** Aire ouverte et ligne de fret. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Retour structurant.** Cette salle est réutilisée après le ravin s36. Le départ final vers la soute s37 attend la balise. Ne pas créer un duplicata de cette aire au retour.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S12 — Abri d’expédition

**Secteur : Camp · Profil : camp · Vue hybride : HYBRID · Largeur : 1940 unités.**

L’abri possède une entrée, une zone de briefing et un passage vers la décontamination.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Table de mission ; bancs ; cartes ; thermos ; casiers ; filtre d’air.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-11 | s11 — Aire d’atterrissage | door | 1840 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-12 | s13 — Décontamination | door | 100 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-11 vers S11. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S11 (link-11), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o05-01` : **Rejoindre le briefing**, à x = 989, z = 0.55. Déclenche `briefed` après validation des conditions du type `brief`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s12-hero-0 | briefing | 466 ; 0.075 | background |
| s12-hero-1 | battery | 1280 ; 0.075 | background |
| s12-detail-0 | cableTray | 175 ; 0.060 | background |
| s12-detail-1 | warningStripe | 698 ; 0.060 | background |
| s12-detail-2 | cableTray | 989 ; 0.060 | background |
| s12-detail-3 | warningStripe | 1571 ; 0.960 | foreground |
| s12-detail-4 | cableTray | 1765 ; 0.960 | foreground |

Relevé facultatif `field-s12` : x = 698, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s12-block-0 — caisse industrielle | 582 ; 0.22 | 188 ; 0.12 | 120 |
| s12-block-1 — rayonnage | 1086 ; 0.77 | 188 ; 0.12 | 120 |
| s12-block-2 — faisceau de conduites | 1474 ; 0.22 | 188 ; 0.12 | 120 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S13 — Décontamination

**Secteur : Camp · Profil : decon · Vue hybride : SIDE · Largeur : 1760 unités.**

Deux portes encadrent les buses de nettoyage. Les équipements humides restent dans la partie sale.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Buses ; caillebotis ; cuve de collecte ; combinaisons ; râtelier de bottes.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-12 | s12 — Abri d’expédition | door | 1660 ; 0.55 | accès ouvert selon la progression | Non |
| link-13 | s14 — Tête de puits | door | 100 ; 0.55 | filters_ready | Non |
| link-46 | s41 — Local des filtres | door | 1373 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s13` à x = 470, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o05-02` : **Vérifier les filtres**, à x = 1179, z = 0.55. Déclenche `filters_ready` après validation des conditions du type `filter`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s13` — **Cloison de décontamination**. Séparer les deux moitiés du sas sans condamner l’accès au local des filtres.

Emprise : x = 910, largeur 36, toute la profondeur jouable. Pupitres x = 805 / 1015, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s13-hero-0 | wash | 422 ; 0.075 | background |
| s13-hero-1 | filters | 1162 ; 0.075 | background |
| s13-detail-0 | cableTray | 158 ; 0.060 | background |
| s13-detail-1 | warningStripe | 634 ; 0.060 | background |
| s13-detail-2 | cableTray | 898 ; 0.060 | background |
| s13-detail-3 | warningStripe | 1426 ; 0.960 | foreground |
| s13-detail-4 | cableTray | 1602 ; 0.960 | foreground |

Intervention `o05-02` : **3 secondes**, bruit **18** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s13` : x = 634, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S14 — Tête de puits

**Secteur : Camp · Profil : lift · Vue hybride : DEPTH · Largeur : 2240 unités.**

Une cage d’ascenseur occupe le centre d’un chevalement. La rambarde laisse seulement deux passages balisés. Implantation v0.3 : contour de la cage. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Cage ; poulies ; commandes ; garde-corps ; câble principal ; barrières de bord.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-13 | s13 — Décontamination | door | 2140 ; 0.55 | accès ouvert selon la progression | Non |
| link-14 | s15 — Recette inférieure | lift | 100 ; 0.55 | lift_ready ; condamné après lift_lost | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o05-03` : **Mettre la cage en service**, à x = 1142, z = 0.55. Déclenche `lift_ready` après validation des conditions du type `power`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s14-hero-0 | lift | 538 ; 0.075 | background |
| s14-hero-1 | winch | 1478 ; 0.075 | background |
| s14-detail-0 | cableTray | 202 ; 0.060 | background |
| s14-detail-1 | warningStripe | 806 ; 0.060 | background |
| s14-detail-2 | cableTray | 1142 ; 0.060 | background |
| s14-detail-3 | warningStripe | 1814 ; 0.960 | foreground |
| s14-detail-4 | cableTray | 2038 ; 0.960 | foreground |

Intervention `o05-03` : **4 secondes**, bruit **85** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s14` : x = 806, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s14-v030-0 — faisceau de conduites | 510 ; 0.24 | 220 ; 0.14 | 80 |
| s14-v030-1 — rayonnage | 1030 ; 0.78 | 330 ; 0.12 | 115 |
| s14-v030-2 — faisceau de conduites | 1590 ; 0.24 | 400 ; 0.14 | 80 |

**Révision spatiale 0.3.** Contour de la cage. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S15 — Recette inférieure

**Secteur : Mine · Profil : lift · Vue hybride : HYBRID · Largeur : 2120 unités.**

La cage arrive dans une recette protégée. Les rails sortent vers le relais, loin du bord du puits.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Cage ; rails ; butoir ; boulonnage ; tuyauteries ; éclairage de secours.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-14 | s14 — Tête de puits | lift | 2020 ; 0.55 | accès ouvert selon la progression ; condamné après lift_lost | Non |
| link-15 | s16 — Relais de Cho | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-15 vers S16. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s15` à x = 480, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S16 (link-15), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s15` — **Grille de recette**. Créer une limite physique entre le palier de la cage et le départ de la galerie.

Emprise : x = 970, largeur 36, toute la profondeur jouable. Pupitres x = 865 / 1075, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s15-hero-0 | lift | 509 ; 0.075 | background |
| s15-hero-1 | reel | 1399 ; 0.075 | background |
| s15-detail-0 | cableTray | 191 ; 0.060 | background |
| s15-detail-1 | warningStripe | 763 ; 0.060 | background |
| s15-detail-2 | cableTray | 1081 ; 0.060 | background |
| s15-detail-3 | warningStripe | 1717 ; 0.960 | foreground |
| s15-detail-4 | cableTray | 1929 ; 0.960 | foreground |

Relevé facultatif `field-s15` : x = 763, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s15-block-0 — caisse industrielle | 636 ; 0.22 | 188 ; 0.12 | 105 |
| s15-block-1 — rayonnage | 1187 ; 0.77 | 188 ; 0.12 | 105 |
| s15-block-2 — faisceau de conduites | 1611 ; 0.22 | 188 ; 0.12 | 105 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S16 — Relais de Cho

**Secteur : Mine · Profil : relay · Vue hybride : DEPTH · Largeur : 2280 unités.**

Le relais distribue les voies de la mine. La radio se trouve contre un mur, sans bloquer les circulations. Implantation v0.3 : baie de relais décalée. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Table radio ; touret ; casiers ; antenne filaire ; lampe ; repères de secteur.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-15 | s15 — Recette inférieure | door | 2180 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-16 | s17 — Atelier de maintenance | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-19 | s19 — La carène enfouie | shortcut | 1049 ; 0.15 | power_on | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-15 vers S15, link-16 vers S17, link-19 vers S19. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S15 (link-15), S17 (link-16), S19 (link-19), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o06-01` : **Établir le relais**, à x = 1163, z = 0.55. Déclenche `relay_ready` après validation des conditions du type `radio`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s16-hero-0 | antenna | 547 ; 0.075 | background |
| s16-hero-1 | terminal | 1505 ; 0.075 | background |
| s16-detail-0 | cableTray | 205 ; 0.060 | background |
| s16-detail-1 | warningStripe | 821 ; 0.060 | background |
| s16-detail-2 | cableTray | 1163 ; 0.060 | background |
| s16-detail-3 | warningStripe | 1847 ; 0.960 | foreground |
| s16-detail-4 | cableTray | 2075 ; 0.960 | foreground |

Intervention `o06-01` : **2 secondes**, bruit **20** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s16` : x = 821, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s16-v030-0 — rayonnage | 620 ; 0.26 | 350 ; 0.18 | 115 |
| s16-v030-1 — rayonnage | 1260 ; 0.76 | 300 ; 0.14 | 115 |
| s16-v030-2 — caisse industrielle | 1810 ; 0.28 | 180 ; 0.19 | 80 |

**Révision spatiale 0.3.** Baie de relais décalée. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S17 — Atelier de maintenance

**Secteur : Mine · Profil : workshop · Vue hybride : HYBRID · Largeur : 1960 unités.**

Un établi, un passage central libre et une remise arrière. Le matériel lourd reste appuyé au sol.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Établi ; outils ; bouteilles ; chariot ; caisses ; crochets ; établi secondaire.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-16 | s16 — Relais de Cho | door | 1860 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-17 | s18 — Galerie d’alimentation | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-47 | s42 — Pompes de desserte | door | 1680 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-16 vers S16, link-17 vers S18, link-47 vers S42. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s17` à x = 440, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S16 (link-16), S18 (link-17), S42 (link-47), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| parts-workshop | Récupérer les renforts de châssis | 1480 ; 0.55 | 2 s | Deux renforts récupérés. K, près d’un brancard arrêté, permet de réparer. |

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s17` — **Cloison de l’atelier**. Protéger temporairement le poste de pièces, avec commandes manuelles des deux côtés.

Emprise : x = 830, largeur 36, toute la profondeur jouable. Pupitres x = 725 / 935, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s17-hero-0 | workbench | 470 ; 0.075 | background |
| s17-hero-1 | reel | 1294 ; 0.075 | background |
| s17-detail-0 | cableTray | 176 ; 0.060 | background |
| s17-detail-1 | warningStripe | 706 ; 0.060 | background |
| s17-detail-2 | cableTray | 1000 ; 0.060 | background |
| s17-detail-3 | warningStripe | 1588 ; 0.960 | foreground |
| s17-detail-4 | cableTray | 1784 ; 0.960 | foreground |

Relevé facultatif `field-s17` : x = 706, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s17-block-0 — caisse industrielle | 588 ; 0.22 | 164 ; 0.12 | 75 |
| s17-block-1 — rayonnage | 1098 ; 0.77 | 164 ; 0.12 | 75 |
| s17-block-2 — faisceau de conduites | 1490 ; 0.22 | 164 ; 0.12 | 75 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S18 — Galerie d’alimentation

**Secteur : Mine · Profil : power · Vue hybride : SIDE · Largeur : 2420 unités.**

Les câbles longent le plafond. Le chemin de service évite les armoires haute tension.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Armoires ; câbles ; disjoncteurs ; isolateurs ; tuyaux ; porte coupe-feu.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-17 | s17 — Atelier de maintenance | door | 2320 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-18 | s19 — La carène enfouie | door | 100 ; 0.55 | power_on | Oui, sous conditions de contact |
| link-52 | s42 — Pompes de desserte | shortcut | 590 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-17 vers S17, link-18 vers S19, link-52 vers S42. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s18` à x = 710, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S17 (link-17), S19 (link-18), S42 (link-52), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o06-02` : **Rétablir la desserte**, à x = 1621, z = 0.55. Déclenche `power_on` après validation des conditions du type `power`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s18` — **Coupe-feu de desserte**. Isoler la partie électrique du couloir ; le dispositif n’éteint pas l’arc électrique.

Emprise : x = 1270, largeur 36, toute la profondeur jouable. Pupitres x = 1165 / 1375, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s18-hero-0 | generator | 581 ; 0.075 | background |
| s18-hero-1 | pump | 1597 ; 0.075 | background |
| s18-detail-0 | cableTray | 218 ; 0.060 | background |
| s18-detail-1 | warningStripe | 871 ; 0.060 | background |
| s18-detail-2 | cableTray | 1234 ; 0.060 | background |
| s18-detail-3 | warningStripe | 1960 ; 0.960 | foreground |
| s18-detail-4 | cableTray | 2202 ; 0.960 | foreground |
| arc-main-source | cableTray | 1250 ; 0.075 | background |

Intervention `o06-02` : **4 secondes**, bruit **85** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s18` : x = 871, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| arc-main — Desserte haute tension | 1250 ; 0.55 ; 160 ; 0.66 | 9 / 1.25 / 1.5 s | power_on OU device-pumps |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S19 — La carène enfouie

**Secteur : Vestiges · Profil : derelict · Vue hybride : DEPTH · Largeur : 2880 unités.**

La coque apparaît dans une caverne bien plus vaste que le champ de déplacement. La zone de fouille se poursuit en contrebas. Implantation v0.3 : brèche et membrures rompues. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Coque courbe ; échafaudage ; passerelle ; roche fracturée ; balises humaines.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-18 | s18 — Galerie d’alimentation | door | 2780 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-19 | s16 — Relais de Cho | shortcut | 100 ; 0.55 | power_on | Oui, sous conditions de contact |
| link-20 | s20 — Brèche de coque | door | 1325 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-21 | s21 — Tranchée de fouille | stairs | 1958 ; 0.85 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-18 vers S18, link-19 vers S16, link-20 vers S20, link-21 vers S21. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S18 (link-18), S16 (link-19), S20 (link-20), S21 (link-21), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| isolate-hull | Fermer la conduite de coque | 2450 ; 0.55 | 2.5 s | Le souffle cesse dans la brèche. La vanne restera fermée. |

**Lecture empathique facultative 0.4**

`echo-s19` — **La coque écoute**, x = 2110, z = 0.51. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** Une pression sourde vient du métal, sans mots ni image fiable. La brèche et la tranchée restent les seuls repères certains. Le frisson ne démontre rien sur les anciens occupants.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s19-hero-0 | carene | 691 ; 0.075 | background |
| s19-hero-1 | rib | 1901 ; 0.075 | background |
| s19-detail-0 | resinCable | 259 ; 0.060 | background |
| s19-detail-1 | silicaShard | 1037 ; 0.060 | background |
| s19-detail-2 | resinCable | 1469 ; 0.060 | background |
| s19-detail-3 | silicaShard | 2333 ; 0.960 | foreground |
| s19-detail-4 | resinCable | 2621 ; 0.960 | foreground |
| hull-vent-source | pipe | 1080 ; 0.075 | background |

Relevé facultatif `field-s19` : x = 1037, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s19-v030-0 — structure organique côtelée | 670 ; 0.25 | 360 ; 0.17 | 115 |
| s19-v030-1 — débris de silice | 1250 ; 0.76 | 200 ; 0.15 | 80 |
| s19-v030-2 — structure organique côtelée | 1690 ; 0.25 | 290 ; 0.13 | 115 |
| s19-v030-3 — masse de résine | 2390 ; 0.77 | 420 ; 0.13 | 80 |

**Révision spatiale 0.3.** Brèche et membrures rompues. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| hull-vent — Conduite fissurée | 1080 ; 0.31 ; 230 ; 0.18 | 11 / 1.5 / 2.0 s | isolate-hull |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1814 ; 0.35).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S20 — Brèche de coque

**Secteur : Vestiges · Profil : alien · Vue hybride : HYBRID · Largeur : 2120 unités.**

Une ouverture irrégulière suit la peau du vaisseau. Les ajouts humains s’arrêtent aux premiers renflements.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Arches non humaines ; peau nervurée ; jauges de relevé ; câbles humains temporaires.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-20 | s19 — La carène enfouie | door | 2020 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-28 | s26 — Entrée des tubes | shortcut | 100 ; 0.55 | tracker_ready | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-20 vers S19, link-28 vers S26. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S19 (link-20), S26 (link-28), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o07-01` : **Examiner la brèche**, à x = 1081, z = 0.55. Déclenche `hull_seen` après validation des conditions du type `scan`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Lecture empathique facultative 0.4**

`echo-s20` — **La déchirure**, x = 1340, z = 0.51. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** Une impression de passage répété. Decker regarde les bords polis de la brèche : un indice matériel, pas une carte transmise par la ruche. Garder le trajet du retour en tête.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s20-hero-0 | breach | 509 ; 0.075 | background |
| s20-hero-1 | rib | 1399 ; 0.075 | background |
| s20-detail-0 | resinCable | 191 ; 0.060 | background |
| s20-detail-1 | silicaShard | 763 ; 0.060 | background |
| s20-detail-2 | resinCable | 1081 ; 0.060 | background |
| s20-detail-3 | silicaShard | 1717 ; 0.960 | foreground |
| s20-detail-4 | resinCable | 1929 ; 0.960 | foreground |

Intervention `o07-01` : **2.4 secondes**, bruit **22** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s20` : x = 763, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s20-block-0 — masse de résine | 636 ; 0.22 | 164 ; 0.12 | 120 |
| s20-block-1 — débris de silice | 1187 ; 0.77 | 164 ; 0.12 | 120 |
| s20-block-2 — structure organique côtelée | 1611 ; 0.22 | 164 ; 0.12 | 120 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1336 ; 0.35).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S21 — Tranchée de fouille

**Secteur : Vestiges · Profil : ruins · Vue hybride : DEPTH · Largeur : 2560 unités.**

La fouille descend vers la ville ruinée. Les cordes, grilles et repères racontent le travail des chercheurs. Implantation v0.3 : tranchée et tables de fouille. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Strates rocheuses ; tamis ; cordes ; boîtes d’échantillons ; piquets ; passerelle.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-21 | s19 — La carène enfouie | stairs | 2460 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-22 | s22 — Esplanade ensevelie | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-48 | s43 — Belvédère de fouille | door | 2170 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-21 vers S19, link-22 vers S22, link-48 vers S43. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S19 (link-21), S22 (link-22), S43 (link-48), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o07-02` : **Retrouver le balisage de fouille**, à x = 1715, z = 0.55. Déclenche `dig_seen` après validation des conditions du type `survey`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s21-hero-0 | excavator | 614 ; 0.075 | background |
| s21-hero-1 | survey | 1690 ; 0.075 | background |
| s21-detail-0 | resinCable | 230 ; 0.060 | background |
| s21-detail-1 | silicaShard | 922 ; 0.060 | background |
| s21-detail-2 | resinCable | 1306 ; 0.060 | background |
| s21-detail-3 | silicaShard | 2074 ; 0.960 | foreground |
| s21-detail-4 | resinCable | 2330 ; 0.960 | foreground |

Intervention `o07-02` : **3 secondes**, bruit **22** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s21` : x = 1270, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s21-v030-0 — débris de silice | 610 ; 0.78 | 280 ; 0.14 | 80 |
| s21-v030-1 — caisse industrielle | 1060 ; 0.26 | 350 ; 0.17 | 80 |
| s21-v030-2 — rayonnage | 1540 ; 0.79 | 240 ; 0.10 | 115 |
| s21-v030-3 — structure organique côtelée | 2040 ; 0.29 | 130 ; 0.16 | 115 |

**Révision spatiale 0.3.** Tranchée et tables de fouille. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1613 ; 0.35).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S22 — Esplanade ensevelie

**Secteur : Vestiges · Profil : ruins · Vue hybride : DEPTH · Largeur : 2860 unités.**

Des bâtiments non humains entourent une place partiellement dégagée. Les portes visibles ont des destinations cohérentes. Implantation v0.3 : esplanade à deux contournements. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Contreforts ; arches effondrées ; pierres ; éclairages sur trépied ; instruments.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-22 | s21 — Tranchée de fouille | door | 2760 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-23 | s23 — Salle des restes | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-24 | s24 — Poste de relevés | door | 1316 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-22 vers S21, link-23 vers S23, link-24 vers S24. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S21 (link-22), S23 (link-23), S24 (link-24), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Lecture empathique facultative 0.4**

`echo-s22` — **Le détour**, x = 1830, z = 0.6. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** La masse au centre de l’esplanade semble couper le souffle autant que la vue. Ce malaise attire l’attention sur ses deux contours praticables ; il ne révèle aucune salle inconnue.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s22-hero-0 | monolith | 686 ; 0.075 | background |
| s22-hero-1 | survey | 1888 ; 0.075 | background |
| s22-detail-0 | resinCable | 257 ; 0.060 | background |
| s22-detail-1 | silicaShard | 1030 ; 0.060 | background |
| s22-detail-2 | resinCable | 1459 ; 0.060 | background |
| s22-detail-3 | silicaShard | 2317 ; 0.960 | foreground |
| s22-detail-4 | resinCable | 2603 ; 0.960 | foreground |

Relevé facultatif `field-s22` : x = 1030, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s22-v030-0 — structure organique côtelée | 730 ; 0.23 | 320 ; 0.12 | 115 |
| s22-v030-1 — masse de résine | 1120 ; 0.55 | 130 ; 0.15 | 80 |
| s22-v030-2 — débris de silice | 1570 ; 0.77 | 240 ; 0.12 | 80 |
| s22-v030-3 — structure organique côtelée | 2220 ; 0.23 | 350 ; 0.13 | 115 |
| s22-v030-4 — masse de résine | 2460 ; 0.71 | 180 ; 0.18 | 80 |

**Révision spatiale 0.3.** Esplanade à deux contournements. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1802 ; 0.35), adult à (2016 ; 0.71).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S23 — Salle des restes

**Secteur : Vestiges · Profil : ossuary · Vue hybride : SIDE · Largeur : 1860 unités.**

Les restes sont des témoins archéologiques, pas des ennemis ressuscités. Le joueur traverse un passage balisé.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Tables de relevé ; fragments protégés ; toile ; scanner ; jalons ; niches.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-23 | s22 — Esplanade ensevelie | door | 1760 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-25 | s24 — Poste de relevés | crawl | 100 ; 0.55 | survey_complete | Non |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-23 vers S22. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S22 (link-23), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o08-01` : **Examiner les restes**, à x = 949, z = 0.55. Déclenche `survey_complete` après validation des conditions du type `scan`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Lecture empathique facultative 0.4**

`echo-s23` — **Les restes muets**, x = 1010, z = 0.55. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** Un sentiment d’absence, impossible à dater. Decker choisit de ne pas donner une histoire à ces restes. Le relevé demeure une observation, la sensation demeure une sensation.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s23-hero-0 | ossuary | 446 ; 0.075 | background |
| s23-hero-1 | rib | 1228 ; 0.075 | background |
| s23-detail-0 | resinCable | 167 ; 0.060 | background |
| s23-detail-1 | silicaShard | 670 ; 0.060 | background |
| s23-detail-2 | resinCable | 949 ; 0.060 | background |
| s23-detail-3 | silicaShard | 1507 ; 0.960 | foreground |
| s23-detail-4 | resinCable | 1693 ; 0.960 | foreground |

Intervention `o08-01` : **2.4 secondes**, bruit **22** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s23` : x = 670, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1172 ; 0.55).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S24 — Poste de relevés

**Secteur : Vestiges · Profil : relay · Vue hybride : HYBRID · Largeur : 2120 unités.**

Une implantation humaine fragile occupe un seuil de la cité. La radio et le matériel restent visibles depuis l’entrée. Implantation v0.3 : baie de relevé protégée. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Console portable ; caisses de capteurs ; panneaux ; fil guide ; bouteilles d’air.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-24 | s22 — Esplanade ensevelie | door | 2020 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-25 | s23 — Salle des restes | crawl | 100 ; 0.55 | accès ouvert selon la progression | Non |
| link-26 | s25 — Passerelle suspendue | door | 975 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-24 vers S22, link-26 vers S25. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s24` à x = 440, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S22 (link-24), S25 (link-26), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o08-02` : **Récupérer le détecteur**, à x = 1420, z = 0.55. Déclenche `tracker_ready` après validation des conditions du type `equipment`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s24-hero-0 | survey | 509 ; 0.075 | background |
| s24-hero-1 | terminal | 1399 ; 0.075 | background |
| s24-detail-0 | cableTray | 191 ; 0.060 | background |
| s24-detail-1 | warningStripe | 763 ; 0.060 | background |
| s24-detail-2 | cableTray | 1081 ; 0.060 | background |
| s24-detail-3 | warningStripe | 1717 ; 0.960 | foreground |
| s24-detail-4 | cableTray | 1929 ; 0.960 | foreground |

Intervention `o08-02` : **2.2 secondes**, bruit **15** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s24` : x = 763, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s24-v030-0 — rayonnage | 610 ; 0.27 | 240 ; 0.18 | 115 |
| s24-v030-1 — caisse industrielle | 1210 ; 0.78 | 190 ; 0.12 | 80 |
| s24-v030-2 — faisceau de conduites | 1630 ; 0.23 | 200 ; 0.13 | 80 |

**Révision spatiale 0.3.** Baie de relevé protégée. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1336 ; 0.35), adult à (1495 ; 0.71).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S25 — Passerelle suspendue

**Secteur : Vestiges · Profil : bridge · Vue hybride : SIDE · Largeur : 2680 unités.**

Une passerelle suit la paroi ; des volumes descendent sous le plan jouable. Le vide n’est pas une seconde route.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Platelage ; ancrages ; câble latéral ; contreventement ; balises cassées.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-26 | s24 — Poste de relevés | door | 2580 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-27 | s26 — Entrée des tubes | door | 100 ; 0.55 | tracker_ready | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-26 vers S24, link-27 vers S26. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S24 (link-26), S26 (link-27), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| isolate-bridge | Isoler la purge de passerelle | 2250 ; 0.55 | 3 s | La passerelle est dégagée. La conduite ne se remettra pas en pression. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s25-hero-0 | bridge | 643 ; 0.075 | background |
| s25-hero-1 | cable | 1769 ; 0.075 | background |
| s25-detail-0 | cableTray | 241 ; 0.060 | background |
| s25-detail-1 | warningStripe | 965 ; 0.060 | background |
| s25-detail-2 | cableTray | 1367 ; 0.060 | background |
| s25-detail-3 | warningStripe | 2171 ; 0.960 | foreground |
| s25-detail-4 | cableTray | 2439 ; 0.960 | foreground |
| bridge-steam-source | pipe | 1290 ; 0.075 | background |

Relevé facultatif `field-s25` : x = 965, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| bridge-steam — Purge de passerelle | 1290 ; 0.55 ; 190 ; 0.66 | 10 / 1.5 / 2.0 s | isolate-bridge |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1688 ; 0.55), adult à (1889 ; 0.55).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S26 — Entrée des tubes

**Secteur : Ruche · Profil : silica · Vue hybride : HYBRID · Largeur : 2120 unités.**

La mine humaine rejoint des tubes de silice. La transition architecturale est visible avant le changement de salle. Implantation v0.3 : gorge à bifurcation. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Silice ; roche ; repères arrachés ; lampe tombée ; peau translucide ; résine.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-27 | s25 — Passerelle suspendue | door | 2020 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-28 | s20 — Brèche de coque | shortcut | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-29 | s27 — Le nœud ambré | door | 975 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-27 vers S25, link-28 vers S20, link-29 vers S27. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S25 (link-27), S20 (link-28), S27 (link-29), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o09-01` : **Écouter ce qui approche**, à x = 1081, z = 0.55. Déclenche `hive_sensed` après validation des conditions du type `sense`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Lecture empathique facultative 0.4**

`echo-s26` — **Deux rythmes**, x = 1150, z = 0.5. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** Le bourdonnement des tubes brouille la respiration. L’embranchement visible doit être relevé avant de poursuivre : une impression de proximité ne donne pas une position exacte.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s26-hero-0 | silica | 509 ; 0.075 | background |
| s26-hero-1 | rib | 1399 ; 0.075 | background |
| s26-detail-0 | resinCable | 191 ; 0.060 | background |
| s26-detail-1 | silicaShard | 763 ; 0.060 | background |
| s26-detail-2 | resinCable | 1081 ; 0.060 | background |
| s26-detail-3 | silicaShard | 1717 ; 0.960 | foreground |
| s26-detail-4 | resinCable | 1929 ; 0.960 | foreground |

Relevé facultatif `field-s26` : x = 763, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s26-v030-0 — masse de résine | 500 ; 0.75 | 300 ; 0.16 | 80 |
| s26-v030-1 — structure organique côtelée | 890 ; 0.32 | 140 ; 0.17 | 115 |
| s26-v030-2 — débris de silice | 1380 ; 0.78 | 200 ; 0.12 | 80 |
| s26-v030-3 — structure organique côtelée | 1770 ; 0.28 | 240 ; 0.17 | 115 |

**Révision spatiale 0.3.** Gorge à bifurcation. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1336 ; 0.35), adult à (1495 ; 0.71).

**Perception.** L’objectif demande une pression minimale obtenue par Espace. Le message de direction est un indice de salle, pas une connaissance de toute la ruche.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S27 — Le nœud ambré

**Secteur : Ruche · Profil : silica · Vue hybride : DEPTH · Largeur : 2680 unités.**

Trois passages composent une boucle. Les piliers de silice délimitent les bandes sans former un mur infranchissable. Implantation v0.3 : nœud à pilier central. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Piliers ; gouttes minérales ; membranes ; débris d’équipement ; trace de traînée.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-29 | s26 — Entrée des tubes | door | 2580 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-30 | s28 — Alcôve des disparus | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-32 | s29 — Le retour fermé | shortcut | 1233 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-29 vers S26, link-30 vers S28, link-32 vers S29. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S26 (link-29), S28 (link-30), S29 (link-32), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o10-01` : **Marquer la dérivation**, à x = 1367, z = 0.55. Déclenche `route_marked` après validation des conditions du type `route`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Lecture empathique facultative 0.4**

`echo-s27` — **L’ambre immobile**, x = 1840, z = 0.48. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** La matière renvoie une hostilité diffuse. Rester concentré plus longtemps attire l’attention plutôt qu’améliorer la précision. Couper le lien, puis écouter le détecteur.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s27-hero-0 | amber | 643 ; 0.075 | background |
| s27-hero-1 | silica | 1769 ; 0.075 | background |
| s27-detail-0 | resinCable | 241 ; 0.060 | background |
| s27-detail-1 | silicaShard | 965 ; 0.060 | background |
| s27-detail-2 | resinCable | 1367 ; 0.060 | background |
| s27-detail-3 | silicaShard | 2171 ; 0.960 | foreground |
| s27-detail-4 | resinCable | 2439 ; 0.960 | foreground |

Intervention `o10-01` : **3 secondes**, bruit **20** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s27` : x = 965, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s27-v030-0 — structure organique côtelée | 670 ; 0.25 | 360 ; 0.17 | 115 |
| s27-v030-1 — masse de résine | 1020 ; 0.62 | 130 ; 0.13 | 80 |
| s27-v030-2 — débris de silice | 1550 ; 0.78 | 330 ; 0.12 | 80 |
| s27-v030-3 — structure organique côtelée | 2140 ; 0.23 | 250 ; 0.14 | 115 |

**Révision spatiale 0.3.** Nœud à pilier central. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1688 ; 0.35), adult à (1889 ; 0.71), adult à (2090 ; 0.50).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S28 — Alcôve des disparus

**Secteur : Ruche · Profil : hive · Vue hybride : SIDE · Largeur : 1960 unités.**

Une alcôve accessible par un boyau étroit. Les cocons occupent le fond, le passage reste latéral.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Cocons ; casque ; balise ; arme vide ; résine ; réseaux organiques.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-30 | s27 — Le nœud ambré | door | 1860 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-31 | s29 — Le retour fermé | door | 100 ; 0.55 | accès ouvert selon la progression ; fermé après maze_known | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-30 vers S27, link-31 vers S29. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S27 (link-30), S29 (link-31), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o09-02` : **Retrouver la balise perdue**, à x = 1313, z = 0.55. Déclenche `tags_found` après validation des conditions du type `recover`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s28-hero-0 | cocoon | 470 ; 0.075 | background |
| s28-hero-1 | rib | 1294 ; 0.075 | background |
| s28-detail-0 | resinCable | 176 ; 0.060 | background |
| s28-detail-1 | silicaShard | 706 ; 0.060 | background |
| s28-detail-2 | resinCable | 1000 ; 0.060 | background |
| s28-detail-3 | silicaShard | 1588 ; 0.960 | foreground |
| s28-detail-4 | resinCable | 1784 ; 0.960 | foreground |

Intervention `o09-02` : **2.8 secondes**, bruit **8** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s28` : x = 706, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1235 ; 0.55), adult à (1382 ; 0.55).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S29 — Le retour fermé

**Secteur : Ruche · Profil : silica · Vue hybride : HYBRID · Largeur : 2220 unités.**

Le retour se bouche après le relevé. Une dérivation identifiée existe avant le changement d’état. Implantation v0.3 : dérivation derrière la membrane. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Membrane de fermeture ; ancien repère ; fissure latérale ; tube de ventilation.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-31 | s28 — Alcôve des disparus | door | 2120 ; 0.55 | accès ouvert selon la progression ; fermé après maze_known | Oui, sous conditions de contact |
| link-32 | s27 — Le nœud ambré | shortcut | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-33 | s30 — Ascenseur secondaire | door | 1021 ; 0.15 | maze_known | Oui, sous conditions de contact |
| link-49 | s44 — Conduit de retour | door | 1870 ; 0.15 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-31 vers S28, link-32 vers S27, link-33 vers S30, link-49 vers S44. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S28 (link-31), S27 (link-32), S30 (link-33), S44 (link-49), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o10-02` : **Vérifier le passage fermé**, à x = 1487, z = 0.55. Déclenche `maze_known` après validation des conditions du type `seal`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Lecture empathique facultative 0.4**

`echo-s29` — **Un chemin effacé**, x = 1460, z = 0.52. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** La fermeture laisse une impression d’étau. La dérivation est un vrai passage à vérifier avec les yeux ; aucune intuition ne permet de traverser une membrane condamnée.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s29-hero-0 | membrane | 533 ; 0.075 | background |
| s29-hero-1 | silica | 1465 ; 0.075 | background |
| s29-detail-0 | resinCable | 200 ; 0.060 | background |
| s29-detail-1 | silicaShard | 799 ; 0.060 | background |
| s29-detail-2 | resinCable | 1132 ; 0.060 | background |
| s29-detail-3 | silicaShard | 1798 ; 0.960 | foreground |
| s29-detail-4 | resinCable | 2020 ; 0.960 | foreground |
| amber-vent-source | pipe | 1810 ; 0.075 | background |

Intervention `o10-02` : **3.5 secondes**, bruit **50** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s29` : x = 540, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s29-v030-0 — débris de silice | 510 ; 0.77 | 240 ; 0.12 | 80 |
| s29-v030-1 — masse de résine | 865 ; 0.30 | 150 ; 0.15 | 80 |
| s29-v030-2 — structure organique côtelée | 1200 ; 0.78 | 270 ; 0.12 | 115 |
| s29-v030-3 — masse de résine | 1710 ; 0.28 | 120 ; 0.14 | 80 |

**Révision spatiale 0.3.** Dérivation derrière la membrane. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| amber-vent — Souffle de la dérivation | 1810 ; 0.55 ; 170 ; 0.66 | 10 / 1.5 / 1.8 s | device-vent |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1399 ; 0.35), adult à (1565 ; 0.71), adult à (1732 ; 0.50).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S30 — Ascenseur secondaire

**Secteur : Ruche · Profil : lift · Vue hybride : DEPTH · Largeur : 2300 unités.**

La seconde installation ne garantit plus de sortie. Les commandes restent accessibles malgré les dommages.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Cage inclinée ; câbles rompus ; supports tordus ; panneau défaut ; rambardes.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-33 | s29 — Le retour fermé | door | 2200 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-34 | s31 — Pied de l’escalier | door | 100 ; 0.55 | lift_lost | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-33 vers S29, link-34 vers S31. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s30` à x = 510, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S29 (link-33), S31 (link-34), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o11-01` : **Examiner le second ascenseur**, à x = 1173, z = 0.55. Déclenche `lift_lost` après validation des conditions du type `inspect`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s30` — **Grille de la machinerie**. Séparer le vestibule du volume de l’ascenseur. Aucun rétablissement du puits condamné.

Emprise : x = 1070, largeur 36, toute la profondeur jouable. Pupitres x = 965 / 1175, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s30-hero-0 | lift | 552 ; 0.075 | background |
| s30-hero-1 | cable | 1518 ; 0.075 | background |
| s30-detail-0 | cableTray | 207 ; 0.060 | background |
| s30-detail-1 | warningStripe | 828 ; 0.060 | background |
| s30-detail-2 | cableTray | 1173 ; 0.060 | background |
| s30-detail-3 | warningStripe | 1863 ; 0.960 | foreground |
| s30-detail-4 | cableTray | 2093 ; 0.960 | foreground |

Intervention `o11-01` : **2 secondes**, bruit **5** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s30` : x = 828, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s30-block-0 — caisse industrielle | 690 ; 0.22 | 188 ; 0.12 | 90 |
| s30-block-1 — rayonnage | 1288 ; 0.77 | 188 ; 0.12 | 90 |
| s30-block-2 — faisceau de conduites | 1748 ; 0.22 | 188 ; 0.12 | 90 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1449 ; 0.35), adult à (1622 ; 0.71).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S31 — Pied de l’escalier

**Secteur : Ruche · Profil : stairs · Vue hybride : HYBRID · Largeur : 2420 unités.**

La cage d’escalier possède des paliers lisibles et un itinéraire de maintenance, sans téléportation entre étages. Implantation v0.3 : palier et baie technique. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Volées ; paliers ; échelle de secours ; numérotation ; main courante ; conduites.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-34 | s30 — Ascenseur secondaire | door | 2320 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-35 | s32 — Chambre des œufs | door | 100 ; 0.55 | stairs_known | Oui, sous conditions de contact |
| link-38 | s34 — Dérivation de secours | shortcut | 1113 ; 0.15 | queen_down | Oui, sous conditions de contact |
| link-53 | s44 — Conduit de retour | shortcut | 680 ; 0.77 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-34 vers S30, link-35 vers S32, link-38 vers S34, link-53 vers S44. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S30 (link-34), S32 (link-35), S34 (link-38), S44 (link-53), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o12-01` : **Repérer la voie de secours**, à x = 1234, z = 0.55. Déclenche `stairs_known` après validation des conditions du type `route`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| isolate-stairs | Consigner le câble arraché | 2180 ; 0.55 | 3 s | Le départ est consigné. Le palier ne sera plus sous tension. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s31-hero-0 | stairs | 581 ; 0.075 | background |
| s31-hero-1 | winch | 1597 ; 0.075 | background |
| s31-detail-0 | cableTray | 218 ; 0.060 | background |
| s31-detail-1 | warningStripe | 871 ; 0.060 | background |
| s31-detail-2 | cableTray | 1234 ; 0.060 | background |
| s31-detail-3 | warningStripe | 1960 ; 0.960 | foreground |
| s31-detail-4 | cableTray | 2202 ; 0.960 | foreground |
| stairs-arc-source | cableTray | 905 ; 0.075 | background |

Intervention `o12-01` : **3 secondes**, bruit **20** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s31` : x = 871, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s31-v030-0 — faisceau de conduites | 650 ; 0.23 | 230 ; 0.14 | 80 |
| s31-v030-1 — rayonnage | 1050 ; 0.77 | 260 ; 0.13 | 115 |
| s31-v030-2 — faisceau de conduites | 1580 ; 0.25 | 260 ; 0.17 | 80 |
| s31-v030-3 — caisse industrielle | 2030 ; 0.78 | 190 ; 0.12 | 80 |

**Révision spatiale 0.3.** Palier et baie technique. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| stairs-arc — Retour de câble arraché | 905 ; 0.75 ; 180 ; 0.16 | 9 / 1.4 / 1.5 s | isolate-stairs |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1525 ; 0.35), adult à (1706 ; 0.71), adult à (1888 ; 0.50).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S32 — Chambre des œufs

**Secteur : Ruche · Profil : hive · Vue hybride : DEPTH · Largeur : 2820 unités.**

Les œufs forment des îlots, jamais une grille décorative. Deux passages continus permettent de se replier. Implantation v0.3 : deux poches autour de la ponte. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Œufs ; résine ; condensation ; carcasses minérales ; creux sombres ; gaines.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-35 | s31 — Pied de l’escalier | door | 2720 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-36 | s33 — La pondeuse | door | 100 ; 0.55 | brood_seen | Non |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-35 vers S31. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S31 (link-35), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o12-02` : **Repérer un passage entre les œufs**, à x = 1889, z = 0.55. Déclenche `brood_seen` après validation des conditions du type `brood`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Lecture empathique facultative 0.4**

`echo-s32` — **Le poids des œufs**, x = 1930, z = 0.52. Rayon 120 ; durée 3 s à partir de 28 de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.

**Texte original subjectif :** La pression devient presque tactile. Ne pas confondre silence et sécurité : les volumes de ponte coupent les lignes de tir. Manning doit voir le passage qu’il couvre.

**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s32-hero-0 | eggs | 677 ; 0.075 | background |
| s32-hero-1 | cocoon | 1861 ; 0.075 | background |
| s32-detail-0 | resinCable | 254 ; 0.060 | background |
| s32-detail-1 | silicaShard | 1015 ; 0.060 | background |
| s32-detail-2 | resinCable | 1438 ; 0.060 | background |
| s32-detail-3 | silicaShard | 2284 ; 0.960 | foreground |
| s32-detail-4 | resinCable | 2566 ; 0.960 | foreground |

Intervention `o12-02` : **2.5 secondes**, bruit **6** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s32` : x = 1015, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s32-v030-0 — masse de résine | 660 ; 0.24 | 360 ; 0.17 | 80 |
| s32-v030-1 — structure organique côtelée | 1230 ; 0.55 | 120 ; 0.16 | 115 |
| s32-v030-2 — débris de silice | 1530 ; 0.79 | 200 ; 0.10 | 80 |
| s32-v030-3 — masse de résine | 2310 ; 0.26 | 330 ; 0.16 | 80 |

**Révision spatiale 0.3.** Deux poches autour de la ponte. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : facehugger à (1777 ; 0.35), adult à (1988 ; 0.71), facehugger à (2200 ; 0.50), adult à (2411 ; 0.78).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S33 — La pondeuse

**Secteur : Ruche · Profil : queen · Vue hybride : DEPTH · Largeur : 3040 unités.**

Une grande chambre distribue trois ancrages de résine autour d’un axe d’évacuation. Le boss ne remplit pas l’écran.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Reine ; attaches ; ovipositeur stylisé ; œufs périphériques ; arches ; sol corrodé.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-36 | s32 — Chambre des œufs | door | 2940 ; 0.55 | accès ouvert selon la progression | Non |
| link-37 | s34 — Dérivation de secours | door | 100 ; 0.55 | queen_down | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o13-01` : **Ouvrir la voie au groupe**, à x = 2620, z = 0.55. Déclenche `queen_down` après validation des conditions du type `boss`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s33-hero-0 | throne | 730 ; 0.075 | background |
| s33-hero-1 | eggs | 2006 ; 0.075 | background |
| s33-detail-0 | resinCable | 274 ; 0.060 | background |
| s33-detail-1 | silicaShard | 1094 ; 0.060 | background |
| s33-detail-2 | resinCable | 1550 ; 0.060 | background |
| s33-detail-3 | silicaShard | 2462 ; 0.960 | foreground |
| s33-detail-4 | resinCable | 2766 ; 0.960 | foreground |

Relevé facultatif `field-s33` : x = 1094, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s33-block-0 — masse de résine | 912 ; 0.22 | 188 ; 0.12 | 75 |
| s33-block-1 — débris de silice | 1702 ; 0.77 | 188 ; 0.12 | 75 |
| s33-block-2 — structure organique côtelée | 2310 ; 0.22 | 188 ; 0.12 | 75 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : queen à (1915 ; 0.35).

**Rencontre dédiée.** Trois attaches à (980 ; 0,50), (1510 ; 0,38), (2220 ; 0,59). Le feu les détruit avant que la reine devienne vulnérable. Ces attaches et la règle d’invulnérabilité sont originales au jeu.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S34 — Dérivation de secours

**Secteur : Ruche · Profil : power · Vue hybride : HYBRID · Largeur : 2140 unités.**

Le retour vers l’escalier passe par une galerie industrielle partiellement envahie. Une zone de soins improvisée ne promet aucune guérison. Les deux brancards doivent être préparés séparément puis escortés jusqu’à la navette. Implantation v0.3 : baie de stabilisation à deux brancards. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Civière ; couvertures ; éclairage mobile ; caisses ; conduites ; fermeture coupe-feu.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-37 | s33 — La pondeuse | door | 2040 ; 0.55 | accès ouvert selon la progression | Non |
| link-38 | s31 — Pied de l’escalier | shortcut | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-39 | s35 — Paliers supérieurs | stairs | 984 ; 0.15 | hosts_secured | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-38 vers S31, link-39 vers S35. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s34` à x = 440, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S31 (link-38), S35 (link-39), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o14-01` : **Mettre Adams à l’abri**, à x = 920, z = 0.55. Déclenche `adams_secured` après validation des conditions du type `rescue`. La validation n’est possible que lorsque cette étape est l’objectif courant.
- `o14-02` : **Mettre Elway à l’abri**, à x = 1450, z = 0.55. Déclenche `hosts_secured` après validation des conditions du type `rescue`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| parts-rescue | Prendre les renforts de secours | 1800 ; 0.55 | 2 s | Deux renforts récupérés dans le poste de secours. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s34-hero-0 | triage | 514 ; 0.075 | background |
| s34-hero-1 | cable | 1412 ; 0.075 | background |
| s34-detail-0 | cableTray | 193 ; 0.060 | background |
| s34-detail-1 | warningStripe | 770 ; 0.060 | background |
| s34-detail-2 | cableTray | 1091 ; 0.060 | background |
| s34-detail-3 | warningStripe | 1733 ; 0.960 | foreground |
| s34-detail-4 | cableTray | 1947 ; 0.960 | foreground |

Intervention `o14-01` : **4 secondes**, bruit **12** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Intervention `o14-02` : **4 secondes**, bruit **12** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s34` : x = 770, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s34-v030-0 — faisceau de conduites | 570 ; 0.26 | 230 ; 0.18 | 80 |
| s34-v030-1 — rayonnage | 1050 ; 0.78 | 180 ; 0.13 | 115 |
| s34-v030-2 — caisse industrielle | 1760 ; 0.27 | 200 ; 0.17 | 80 |

**Révision spatiale 0.3.** Baie de stabilisation à deux brancards. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1348 ; 0.35), adult à (1509 ; 0.71).

**Porteurs.** Deux validations distinctes, sans guérison implicite. Les deux brancards suivent physiquement après préparation. Ordre B, intégrité propre et rassemblement à moins de 420 unités des sorties compatibles. Le transport est interdit tant que le second n’est pas prêt.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S35 — Paliers supérieurs

**Secteur : Sortie · Profil : stairs · Vue hybride : SIDE · Largeur : 2660 unités.**

Une succession de paliers comprimée pour le jeu, reliée explicitement au bas de la cage. Les marches sont une animation de liaison.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Treuil ; paliers ; câble de levage ; mains courantes ; bouche de surface.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-39 | s34 — Dérivation de secours | stairs | 2560 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-40 | s36 — Ravin de service | climb | 100 ; 0.55 | winch_ready | Oui, sous conditions de contact |
| link-50 | s45 — Infirmerie de secours | door | 2075 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-39 vers S34, link-40 vers S36, link-50 vers S45. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s35` à x = 480, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S34 (link-39), S36 (link-40), S45 (link-50), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o15-01` : **Actionner le treuil**, à x = 1357, z = 0.55. Déclenche `winch_ready` après validation des conditions du type `winch`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s35` — **Cloison des paliers**. Permettre le regroupement du convoi derrière une barrière ; passage de tous avant fermeture.

Emprise : x = 1310, largeur 36, toute la profondeur jouable. Pupitres x = 1205 / 1415, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s35-hero-0 | stairs | 638 ; 0.075 | background |
| s35-hero-1 | winch | 1756 ; 0.075 | background |
| s35-detail-0 | cableTray | 239 ; 0.060 | background |
| s35-detail-1 | warningStripe | 958 ; 0.060 | background |
| s35-detail-2 | cableTray | 1357 ; 0.060 | background |
| s35-detail-3 | warningStripe | 2155 ; 0.960 | foreground |
| s35-detail-4 | cableTray | 2421 ; 0.960 | foreground |
| winch-steam-source | pipe | 890 ; 0.075 | background |

Intervention `o15-01` : **6 secondes**, bruit **90** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s35` : x = 958, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| winch-steam — Refoulement du treuil | 890 ; 0.55 ; 180 ; 0.66 | 10 / 1.5 / 2.0 s | winch_ready |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1676 ; 0.55), adult à (1875 ; 0.55).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S36 — Ravin de service

**Secteur : Sortie · Profil : sand · Vue hybride : DEPTH · Largeur : 2700 unités.**

Le ravin rejoint le nord de l’aire initiale. Les mêmes tours et balises permettent de reconnaître le lieu. Implantation v0.3 : ravin et drainage latéral. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Talus ; antenne ; câble enterré ; talweg sec ; route de service ; sable en mouvement.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-40 | s35 — Paliers supérieurs | climb | 2600 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-41 | s11 — Aire d’atterrissage | door | 100 ; 0.55 | route_open | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-40 vers S35, link-41 vers S11. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S35 (link-40), S11 (link-41), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o15-02` : **Ouvrir le passage du ravin**, à x = 1809, z = 0.55. Déclenche `route_open` après validation des conditions du type `route`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| isolate-ravine | Fermer le collecteur du ravin | 2380 ; 0.55 | 3 s | Le collecteur est isolé ; le nuage se dissipe. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s36-hero-0 | ravine | 648 ; 0.075 | background |
| s36-hero-1 | cable | 1782 ; 0.075 | background |
| s36-detail-0 | cableTray | 243 ; 0.060 | background |
| s36-detail-1 | warningStripe | 972 ; 0.060 | background |
| s36-detail-2 | cableTray | 1377 ; 0.060 | background |
| s36-detail-3 | warningStripe | 2187 ; 0.960 | foreground |
| s36-detail-4 | cableTray | 2457 ; 0.960 | foreground |
| ravine-plume-source | pipe | 1630 ; 0.075 | background |

Intervention `o15-02` : **3 secondes**, bruit **20** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s36` : x = 1270, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s36-v030-0 — débris de silice | 570 ; 0.75 | 310 ; 0.16 | 80 |
| s36-v030-1 — faisceau de conduites | 1050 ; 0.25 | 230 ; 0.16 | 80 |
| s36-v030-2 — caisse industrielle | 1490 ; 0.76 | 260 ; 0.13 | 80 |
| s36-v030-3 — débris de silice | 2210 ; 0.25 | 250 ; 0.15 | 80 |

**Révision spatiale 0.3.** Ravin et drainage latéral. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| ravine-plume — Fuite dans le ravin | 1630 ; 0.31 ; 240 ; 0.18 | 12 / 2 / 2.5 s | isolate-ravine |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : adult à (1701 ; 0.35), adult à (1904 ; 0.71), adult à (2106 ; 0.50).

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S37 — Soute de la navette

**Secteur : Sortie · Profil : hangar · Vue hybride : DEPTH · Largeur : 2400 unités.**

La rampe débouche sur une soute assez large pour l’opération de capture. Le caisson est ancré, et non posé devant une porte. Implantation v0.3 : berceaux et cage séparés. Les emprises sont distinctes du décor et des zones dangereuses.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Caisson ; moussoir ; treuil ; sangles ; rampes ; rails de chargement ; banquettes.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-42 | s11 — Aire d’atterrissage | ramp | 2300 ; 0.55 | accès ouvert selon la progression | Non |
| link-43 | s38 — Quarantaine orbitale | flight | 100 ; 0.55 | live_capture | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s37` à x = 440, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o16-01` : **Immobiliser puis enfermer l’adulte**, à x = 1910, z = 0.55. Déclenche `live_capture` après validation des conditions du type `capture`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-embark | Arrimer les deux brancards | 720 ; 0.55 | 3 s | Les deux brancards sont à bord. Manning protège la rampe. |

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s37` — **Rideau de fret**. Séparer les berceaux de transport du caisson ; ouvrir avant d’attirer le spécimen.

Emprise : x = 1040, largeur 36, toute la profondeur jouable. Pupitres x = 935 / 1145, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s37-hero-0 | captureBay | 576 ; 0.075 | background |
| s37-hero-1 | dropship | 1584 ; 0.075 | background |
| s37-detail-0 | cableTray | 216 ; 0.060 | background |
| s37-detail-1 | warningStripe | 864 ; 0.060 | background |
| s37-detail-2 | cableTray | 1224 ; 0.060 | background |
| s37-detail-3 | warningStripe | 1944 ; 0.960 | foreground |
| s37-detail-4 | cableTray | 2184 ; 0.960 | foreground |

Relevé facultatif `field-s37` : x = 864, z = 0.25. Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s37-v030-0 — rayonnage | 470 ; 0.25 | 200 ; 0.15 | 115 |
| s37-v030-1 — caisse industrielle | 1250 ; 0.24 | 210 ; 0.15 | 80 |
| s37-v030-2 — rayonnage | 1510 ; 0.78 | 150 ; 0.12 | 115 |
| s37-v030-3 — faisceau de conduites | 2080 ; 0.25 | 160 ; 0.13 | 80 |

**Révision spatiale 0.3.** Berceaux et cage séparés. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Rencontre finie, sans réapparition automatique : captureAdult à (1512 ; 0.35).

**Capture.** Le caisson est à x = 1910. Seuil : immobilisation ≥ 0,95, cible vivante et distance de la cible au caisson ≤ 255 unités, joueur à portée d’interaction. L’allié exclut cet adulte de ses cibles. Les deux brancards doivent auparavant être arrimés au dispositif x=720 (3 secondes). La mousse et le caisson doivent fonctionner avant l’accès à s38.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S38 — Quarantaine orbitale

**Secteur : Épilogue · Profil : medical · Vue hybride : SIDE · Largeur : 1840 unités.**

Une vitre sépare le personnel des spécimens. Les hôtes ne sont pas soignés par une interaction magique.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Vitrage ; cryocuves ; dossier transfert ; caméra ; clapets ; sas sécurisé.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-44 | s39 — Poste d’observation | door | 1740 ; 0.55 | specimens_delivered | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o17-01` : **Confirmer le transfert**, à x = 938, z = 0.55. Déclenche `specimens_delivered` après validation des conditions du type `transfer`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s38-hero-0 | isolation | 442 ; 0.075 | background |
| s38-hero-1 | medical | 1214 ; 0.075 | background |
| s38-detail-0 | cableTray | 166 ; 0.060 | background |
| s38-detail-1 | warningStripe | 662 ; 0.060 | background |
| s38-detail-2 | cableTray | 938 ; 0.060 | background |
| s38-detail-3 | warningStripe | 1490 ; 0.960 | foreground |
| s38-detail-4 | cableTray | 1674 ; 0.960 | foreground |

Intervention `o17-01` : **3 secondes**, bruit **20** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s38` : x = 662, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S39 — Poste d’observation

**Secteur : Épilogue · Profil : ship · Vue hybride : HYBRID · Largeur : 2080 unités.**

La baie montre la planète, pas une ville terrestre. La frappe est une séquence orbitale non jouable comme arme.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Baie ; console ; écran de mission ; sièges fixés ; éclairage de veille.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-44 | s38 — Quarantaine orbitale | door | 1980 ; 0.55 | accès ouvert selon la progression | Non |
| link-45 | s40 — Hypersommeil | door | 100 ; 0.55 | strike_seen | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o17-02` : **Observer la surface**, à x = 1394, z = 0.55. Déclenche `strike_seen` après validation des conditions du type `observe`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s39-hero-0 | viewport | 499 ; 0.075 | background |
| s39-hero-1 | terminal | 1373 ; 0.075 | background |
| s39-detail-0 | cableTray | 187 ; 0.060 | background |
| s39-detail-1 | warningStripe | 749 ; 0.060 | background |
| s39-detail-2 | cableTray | 1061 ; 0.060 | background |
| s39-detail-3 | warningStripe | 1685 ; 0.960 | foreground |
| s39-detail-4 | cableTray | 1893 ; 0.960 | foreground |

Relevé facultatif `field-s39` : x = 749, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s39-block-0 — caisse industrielle | 624 ; 0.22 | 188 ; 0.12 | 105 |
| s39-block-1 — rayonnage | 1165 ; 0.77 | 188 ; 0.12 | 105 |
| s39-block-2 — faisceau de conduites | 1581 ; 0.22 | 188 ; 0.12 | 105 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S40 — Hypersommeil

**Secteur : Épilogue · Profil : medical · Vue hybride : SIDE · Largeur : 1820 unités.**

La dernière salle referme le récit. Des couchettes et des moniteurs encadrent un couloir presque vide.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Couchettes ; casiers ; terminal ; lumière de veille ; hublot ; tubulures.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-45 | s39 — Poste d’observation | door | 1720 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

- `o18-01` : **Entrer en hypersommeil**, à x = 928, z = 0.55. Déclenche `finished` après validation des conditions du type `sleep`. La validation n’est possible que lorsque cette étape est l’objectif courant.

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s40-hero-0 | cryo | 437 ; 0.075 | background |
| s40-hero-1 | medical | 1201 ; 0.075 | background |
| s40-detail-0 | cableTray | 164 ; 0.060 | background |
| s40-detail-1 | warningStripe | 655 ; 0.060 | background |
| s40-detail-2 | cableTray | 928 ; 0.060 | background |
| s40-detail-3 | warningStripe | 1474 ; 0.960 | foreground |
| s40-detail-4 | cableTray | 1656 ; 0.960 | foreground |

Intervention `o18-01` : **3 secondes**, bruit **0** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.

Relevé facultatif `field-s40` : x = 655, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S41 — Local des filtres

**Secteur : Camp · Profil : decon · Vue hybride : SIDE · Largeur : 1480 unités.**

Un local fermé derrière le sas conserve les cartouches hors de la poussière.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Cartouches scellées ; banc de contrôle ; tuyaux de retour ; panneau de débit.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-46 | s13 — Décontamination | door | 100 ; 0.55 | accès ouvert selon la progression | Non |

**Poursuite inter-salles 0.5**

Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-filters | Préparer les cartouches | 947 ; 0.55 | 3.0 s | Deux cartouches sont prêtes. Gardez-les pour la remontée. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s41-hero-0 | filters | 355 ; 0.075 | background |
| s41-hero-1 | wash | 977 ; 0.075 | background |
| s41-detail-0 | cableTray | 133 ; 0.060 | background |
| s41-detail-1 | warningStripe | 533 ; 0.060 | background |
| s41-detail-2 | cableTray | 755 ; 0.060 | background |
| s41-detail-3 | warningStripe | 1199 ; 0.960 | foreground |
| s41-detail-4 | cableTray | 1347 ; 0.960 | foreground |

Relevé facultatif `field-s41` : x = 480, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S42 — Pompes de desserte

**Secteur : Mine · Profil : power · Vue hybride : DEPTH · Largeur : 2200 unités.**

Un circuit secondaire rejoint la galerie d’alimentation sans repasser par le relais.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Deux volutes de pompe ; soupapes ; câble de commande ; jauges ; drain.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-47 | s17 — Atelier de maintenance | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-52 | s18 — Galerie d’alimentation | shortcut | 2030 ; 0.55 | power_on | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-47 vers S17, link-52 vers S18. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Pupitre `light-s42` à x = 600, z = 0.55. Maintenir E pendant 2 secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S17 (link-47), S18 (link-52), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-pumps | Relancer la desserte | 1408 ; 0.55 | 4.0 s | Le secondaire tient. Le réarmement de la galerie sera plus rapide. |

**Cloison dynamique 0.4 — pas un verrou narratif**

`gate-s42` — **Cloison des pompes**. Interrompre la poursuite dans la salle de desserte, mais pas son cycle de vapeur.

Emprise : x = 1120, largeur 36, toute la profondeur jouable. Pupitres x = 1015 / 1225, z = 0,55. État initial ouvert ; fermeture 2.4 s, ouverture 1.6 s, intégrité 100.

Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.

**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.


**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s42-hero-0 | pump | 528 ; 0.075 | background |
| s42-hero-1 | generator | 1452 ; 0.075 | background |
| s42-detail-0 | cableTray | 198 ; 0.060 | background |
| s42-detail-1 | warningStripe | 792 ; 0.060 | background |
| s42-detail-2 | cableTray | 1122 ; 0.060 | background |
| s42-detail-3 | warningStripe | 1782 ; 0.960 | foreground |
| s42-detail-4 | cableTray | 2002 ; 0.960 | foreground |
| pump-steam-source | pipe | 1050 ; 0.075 | background |

Relevé facultatif `field-s42` : x = 480, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s42-block-0 — faisceau de conduites | 726 ; 0.22 | 150 ; 0.12 | 92 |
| s42-block-1 — rayonnage | 1496 ; 0.77 | 150 ; 0.12 | 92 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| pump-steam — Soupape de desserte | 1050 ; 0.55 ; 170 ; 0.66 | 10 / 1.5 / 2.0 s | device-pumps |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S43 — Belvédère de fouille

**Secteur : Vestiges · Profil : ruins · Vue hybride : HYBRID · Largeur : 1840 unités.**

Une passerelle d’observation domine la tranchée, mais ne descend pas directement jusqu’aux tubes.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Table de relevés ; mât de visée ; balustrade ; sondes ; sacs.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-48 | s21 — Tranchée de fouille | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-48 vers S21. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S21 (link-48), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-survey | Reconstituer les relevés | 1177 ; 0.55 | 3.0 s | La coupe a été conservée dans les dossiers. Aucun retour direct par la paroi. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s43-hero-0 | survey | 442 ; 0.075 | background |
| s43-hero-1 | bridge | 1214 ; 0.075 | background |
| s43-detail-0 | resinCable | 166 ; 0.060 | background |
| s43-detail-1 | silicaShard | 662 ; 0.060 | background |
| s43-detail-2 | resinCable | 938 ; 0.060 | background |
| s43-detail-3 | silicaShard | 1490 ; 0.960 | foreground |
| s43-detail-4 | resinCable | 1674 ; 0.960 | foreground |

Relevé facultatif `field-s43` : x = 480, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s43-block-0 — faisceau de conduites | 607 ; 0.22 | 150 ; 0.12 | 92 |
| s43-block-1 — rayonnage | 1251 ; 0.77 | 150 ; 0.12 | 92 |

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S44 — Conduit de retour

**Secteur : Ruche · Profil : silica · Vue hybride : SIDE · Largeur : 2050 unités.**

Une desserte étroite contourne la membrane refermée et rejoint le pied de l’escalier.

**Lecture spatiale.** Bande latérale ; profondeur verrouillée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Tubes gainés ; membrures fendues ; vanne de purge humaine posée à l’entrée.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-49 | s29 — Le retour fermé | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |
| link-53 | s31 — Pied de l’escalier | shortcut | 1920 ; 0.55 | maze_known | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-49 vers S29, link-53 vers S31. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S29 (link-49), S31 (link-53), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-vent | Fermer la purge bruyante | 1312 ; 0.55 | 4.0 s | La purge s’est tue. Les bruits portent moins loin entre la dérivation et le pied des escaliers. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s44-hero-0 | silica | 492 ; 0.075 | background |
| s44-hero-1 | valve | 1353 ; 0.075 | background |
| s44-detail-0 | resinCable | 184 ; 0.060 | background |
| s44-detail-1 | silicaShard | 738 ; 0.060 | background |
| s44-detail-2 | resinCable | 1046 ; 0.060 | background |
| s44-detail-3 | silicaShard | 1660 ; 0.960 | foreground |
| s44-detail-4 | resinCable | 1866 ; 0.960 | foreground |
| return-steam-source | pipe | 800 ; 0.075 | background |

Relevé facultatif `field-s44` : x = 480, z = 0.55. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.

**Danger et circulation**

Les zones de danger sont traversables mais nocives pendant leur phase active. Les couvertures bloquent mouvements et tirs ; les machines de fond n’ont pas de collision.

| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |
|---|---|---|---|
| return-steam — Purge dans le conduit | 800 ; 0.55 ; 190 ; 0.66 | 10 / 1.5 / 2.0 s | device-vent |

Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S45 — Infirmerie de secours

**Secteur : Sortie · Profil : medical · Vue hybride : HYBRID · Largeur : 1860 unités.**

Un renfoncement de soins permet de reprendre souffle sans bloquer le palier du treuil.

**Lecture spatiale.** Volume de transition ; profondeur resserrée. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Deux stations de brancards ; armoire de soins ; couvertures ; ventilation.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-50 | s35 — Paliers supérieurs | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-50 vers S35. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S35 (link-50), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-medical | Ouvrir la réserve de soins | 1190 ; 0.55 | 2.5 s | Deux trousses sont utilisables. On ne laisse personne derrière. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s45-hero-0 | triage | 446 ; 0.075 | background |
| s45-hero-1 | medical | 1228 ; 0.075 | background |
| s45-detail-0 | cableTray | 167 ; 0.060 | background |
| s45-detail-1 | warningStripe | 670 ; 0.060 | background |
| s45-detail-2 | cableTray | 949 ; 0.060 | background |
| s45-detail-3 | warningStripe | 1507 ; 0.960 | foreground |
| s45-detail-4 | cableTray | 1693 ; 0.960 | foreground |

Relevé facultatif `field-s45` : x = 480, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s45-block-0 — faisceau de conduites | 613 ; 0.22 | 150 ; 0.12 | 92 |
| s45-block-1 — rayonnage | 1264 ; 0.77 | 150 ; 0.12 | 92 |

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

### S46 — Poste de guidage

**Secteur : Camp · Profil : relay · Vue hybride : DEPTH · Largeur : 2080 unités.**

Le poste donne une ligne dégagée vers l’aire d’atterrissage. La balise principale reste sur l’aire.

**Lecture spatiale.** Surface de déplacement en profondeur ; obstacles contournables. La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.

**Intentions de décor.** Antenne de guidage ; pupitre ; jalons ; vitrage blindé ; batteries.

**Liaisons physiques et conditions initiales**

| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |
|---|---|---|---|---|---|
| link-51 | s11 — Aire d’atterrissage | door | 100 ; 0.55 | accès ouvert selon la progression | Oui, sous conditions de contact |

**Poursuite inter-salles 0.5**

Seuils utilisables par une créature déjà engagée : link-51 vers S11. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.
Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.

**Éclairage de travail — 0.7**

Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.

**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.

**Veille de capteur — 0.6**

Liaison radio de proximité possible depuis S11 (link-51), sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.
La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.

**Actions et ressources**

Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.

**Interventions de la salle**

| Identifiant | Action | Position | Durée | Effet confirmé |
|---|---|---|---|---|
| device-guidance | Aligner le faisceau de guidage | 1331 ; 0.55 | 3.5 s | Le faisceau porte jusqu’à l’aire. L’amorçage de la balise sera plus rapide. |

**Habillage effectivement placé hors des voies**

| Placement | Famille de dessin | Position (x ; z) | Couche |
|---|---|---|---|
| s46-hero-0 | antenna | 499 ; 0.075 | background |
| s46-hero-1 | terminal | 1373 ; 0.075 | background |
| s46-detail-0 | cableTray | 187 ; 0.060 | background |
| s46-detail-1 | warningStripe | 749 ; 0.060 | background |
| s46-detail-2 | cableTray | 1061 ; 0.060 | background |
| s46-detail-3 | warningStripe | 1685 ; 0.960 | foreground |
| s46-detail-4 | cableTray | 1893 ; 0.960 | foreground |

Relevé facultatif `field-s46` : x = 480, z = 0.25. Aucun ravitaillement automatique dans cette salle.

**Obstacles jouables**

| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |
|---|---|---|---|
| s46-block-0 — faisceau de conduites | 686 ; 0.22 | 150 ; 0.12 | 92 |
| s46-block-1 — rayonnage | 1414 ; 0.77 | 150 ; 0.12 | 92 |

**Danger et circulation**

Maintenir le chemin central libre pour les deux châssis ; s’arrêter avant un danger, attendre la fenêtre ou isoler sa source.
Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.

**Présences et rythme**

Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.

**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.

## Registre des 108 dossiers

| Identifiant | Titre | Catégorie | Statut de contenu |
|---|---|---|---|
| field-s01 | Poste de contrôle | Terrain | adaptation_originale |
| field-s02 | Le carottier | Terrain | adaptation_originale |
| field-s03 | Transport sanitaire | Terrain | adaptation_originale |
| field-s04 | Bureau de la Commission | Terrain | adaptation_originale |
| field-s05 | Appartement de Decker | Terrain | adaptation_originale |
| field-s06 | Consultation | Terrain | adaptation_originale |
| field-s07 | Coursive sous garde | Terrain | adaptation_originale |
| field-s08 | La salle d’entretien | Terrain | adaptation_originale |
| field-s09 | Réserve d’équipement | Terrain | adaptation_originale |
| field-s10 | Baie d’embarquement | Terrain | adaptation_originale |
| field-s11 | Aire d’atterrissage | Terrain | adaptation_originale |
| field-s12 | Abri d’expédition | Terrain | adaptation_originale |
| field-s13 | Décontamination | Terrain | adaptation_originale |
| field-s14 | Tête de puits | Terrain | adaptation_originale |
| field-s15 | Recette inférieure | Terrain | adaptation_originale |
| field-s16 | Relais de Cho | Terrain | adaptation_originale |
| field-s17 | Atelier de maintenance | Terrain | adaptation_originale |
| field-s18 | Galerie d’alimentation | Terrain | adaptation_originale |
| field-s19 | La carène enfouie | Terrain | adaptation_originale |
| field-s20 | Brèche de coque | Terrain | adaptation_originale |
| field-s21 | Tranchée de fouille | Terrain | adaptation_originale |
| field-s22 | Esplanade ensevelie | Terrain | adaptation_originale |
| field-s23 | Salle des restes | Terrain | adaptation_originale |
| field-s24 | Poste de relevés | Terrain | adaptation_originale |
| field-s25 | Passerelle suspendue | Terrain | adaptation_originale |
| field-s26 | Entrée des tubes | Terrain | adaptation_originale |
| field-s27 | Le nœud ambré | Terrain | adaptation_originale |
| field-s28 | Alcôve des disparus | Terrain | adaptation_originale |
| field-s29 | Le retour fermé | Terrain | adaptation_originale |
| field-s30 | Ascenseur secondaire | Terrain | adaptation_originale |
| field-s31 | Pied de l’escalier | Terrain | adaptation_originale |
| field-s32 | Chambre des œufs | Terrain | adaptation_originale |
| field-s33 | La pondeuse | Terrain | adaptation_originale |
| field-s34 | Dérivation de secours | Terrain | adaptation_originale |
| field-s35 | Paliers supérieurs | Terrain | adaptation_originale |
| field-s36 | Ravin de service | Terrain | adaptation_originale |
| field-s37 | Soute de la navette | Terrain | adaptation_originale |
| field-s38 | Quarantaine orbitale | Terrain | adaptation_originale |
| field-s39 | Poste d’observation | Terrain | adaptation_originale |
| field-s40 | Hypersommeil | Terrain | adaptation_originale |
| dossier-decker | Alan Decker | Personnel | adaptation_fondee_sur_roman |
| dossier-rollins | Andrea Rollins | Personnel | adaptation_fondee_sur_roman |
| dossier-manning | Manning | Personnel | adaptation_fondee_sur_roman |
| dossier-cho | Dae Cho | Personnel | adaptation_fondee_sur_roman |
| dossier-adams | Adams | Personnel | adaptation_fondee_sur_roman |
| dossier-elway | Elway | Personnel | adaptation_fondee_sur_roman |
| dossier-rand | Lucas Rand | Personnel | adaptation_fondee_sur_roman |
| dossier-silas | Nigel Silas | Personnel | adaptation_fondee_sur_roman |
| dossier-icc | La Commission | Dossiers | adaptation_fondee_sur_roman |
| dossier-company | L’ordre de mission | Dossiers | adaptation_fondee_sur_roman |
| dossier-lineage | La lignée | Dossiers | adaptation_fondee_sur_roman |
| dossier-memory | Une haine qui reconnaît | Dossiers | regle_de_jeu_originale |
| dossier-empathy | Se concentrer | Équipement | regle_de_jeu_originale |
| dossier-detector | Détecteur | Équipement | regle_de_jeu_originale |
| dossier-filter | Filtration | Équipement | regle_de_jeu_originale |
| dossier-lamp | Éclairage | Équipement | regle_de_jeu_originale |
| dossier-pistol | Arme de secours | Équipement | regle_de_jeu_originale |
| dossier-flame | Lance-flammes | Équipement | regle_de_jeu_originale |
| dossier-foam | Moussoir de capture | Équipement | regle_de_jeu_originale |
| dossier-adult | Adulte | Menaces | regle_de_jeu_originale |
| dossier-parasite | Parasite | Menaces | regle_de_jeu_originale |
| dossier-queen | La pondeuse | Menaces | regle_de_jeu_originale |
| dossier-map | Lire le réseau | Terrain | regle_de_jeu_originale |
| dossier-survivors | Une extraction incomplète | Dossiers | adaptation_fondee_sur_roman |
| field-s41 | Local des filtres | RELEVÉ DE TERRAIN | adaptation_originale |
| field-s42 | Pompes de desserte | RELEVÉ DE TERRAIN | adaptation_originale |
| field-s43 | Belvédère de fouille | RELEVÉ DE TERRAIN | adaptation_originale |
| field-s44 | Conduit de retour | RELEVÉ DE TERRAIN | adaptation_originale |
| field-s45 | Infirmerie de secours | RELEVÉ DE TERRAIN | adaptation_originale |
| field-s46 | Poste de guidage | RELEVÉ DE TERRAIN | adaptation_originale |
| dossier-convoy | Remonter ensemble | GUIDE DE TERRAIN | mecanique_originale |
| dossier-noisemaker | Leurre acoustique | ÉQUIPEMENT | mecanique_originale |
| dossier-fieldcare | Réserves de terrain | ÉQUIPEMENT | mecanique_originale |
| dossier-tracker-use | Lire les mouvements | GUIDE DE TERRAIN | mecanique_originale |
| dossier-windup | Lire une attaque | GUIDE DE TERRAIN | mecanique_originale |
| dossier-dodge | Pas d’esquive | GUIDE DE TERRAIN | mecanique_originale |
| dossier-hazards | Consigner avant de passer | GUIDE DE TERRAIN | mecanique_originale |
| dossier-repair | Réparer un châssis | GUIDE DE TERRAIN | mecanique_originale |
| dossier-waypoint | Choisir un passage | GUIDE DE TERRAIN | mecanique_originale |
| dossier-hazard-care | Patients sous protection | GUIDE DE TERRAIN | mecanique_originale |
| dossier-echo-s19 | La coque écoute | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s20 | La déchirure | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s22 | Le détour | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s23 | Les restes muets | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s26 | Deux rythmes | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s27 | L’ambre immobile | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s29 | Un chemin effacé | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-echo-s32 | Le poids des œufs | PERCEPTION — NON VÉRIFIÉE | adaptation |
| dossier-shutters | Cloisons manuelles | GUIDE DE TERRAIN | adaptation |
| dossier-breaches | Une protection temporaire | GUIDE DE TERRAIN | adaptation |
| dossier-rally | Position de couverture | GUIDE DE TERRAIN | adaptation |
| dossier-readings | Lectures empathiques | GUIDE DE TERRAIN | adaptation |
| dossier-pursuit | Une porte ne coupe pas la traque | TERRAIN | game_original |
| dossier-pursuit-limits | Rompre le contact | TERRAIN | game_original |
| dossier-group-threshold | Un passage pour tout le groupe | TERRAIN | game_original |
| dossier-field-journal | Journal de terrain | TERRAIN | game_original |
| dossier-sensors | Capteurs de mouvement | TERRAIN | game_original |
| dossier-sensor-radio | Liaison des capteurs | TERRAIN | game_original |
| dossier-sensor-power | Batteries et veille | TERRAIN | game_original |
| dossier-tactical-wheel | Roue tactique | TERRAIN | game_original |
| dossier-controller | Commande à la manette | TERRAIN | game_original |
| dossier-field-input | Reprise des commandes | TERRAIN | game_original |
| dossier-worklights | Éclairage de travail | TERRAIN | game_original |
| dossier-darkness | Une ombre n’est pas un refuge | TERRAIN | game_original |
| dossier-egress | Balisage de secours | TERRAIN | game_original |
| dossier-convoy-formations | Trois allures pour le retour | TERRAIN | game_original |
| dossier-convoy-noise | Le roulement des châssis | TERRAIN | game_original |
| dossier-escort-console | Commander sans abandonner | TERRAIN | game_original |
