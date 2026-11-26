# Codex de level design — Colonial Marines 0.10.0

## Doctrine actuelle

### R01 — État de fidélité

Le statut transposé signifie une présence fonctionnelle, pas une copie du plan. Aucun pourcentage de ressemblance globale ni métrique n’est calculé.

### R02 — Graphe local

Chaque seuil doit pointer vers une salle existante de la mission et nommer un retour correspondant. Les 107 liens sont appariés explicitement.

### R03 — Mur ou cage porteuse

Un accès latéral rejoint un bord de salle ; un accès de fond reçoit une cloison, cage ou passage architectural continu. Un simple rectangle de porte isolé n’est pas un raccord valide.

### R04 — Approche et visuel

Dans un passage latéral, le point d’interaction reste sur la ligne de marche ; le cadre peut appartenir au fond. Leur liaison est indiquée, pas confondue avec une profondeur libre.

### R05 — Dénivelé

Une différence de niveau est déclarée dans les deux sens. Escalier et ascenseur sont des transitions appariées, pas une cabine physique continue ou une montée animée de toutes les marches.

### R06 — Voyage extérieur

Le raccord skiff/Fiorina est marqué transit et embarquement. Il ne doit jamais être présenté comme deux pièces adjacentes ou comme une simulation de vol.

### R07 — Objets et dégagement

Les 20 déplacements de mobilier sont consignés. Les supports d’action, zones d’arrivée et axes de portes doivent rester utilisables avec leur collision réelle.

### R08 — Verrous

L’audit de graphe ignore les verrous ; les parcours automatisés les réalisent. Ces preuves ne doivent pas être confondues.

### R09 — Changements de scène

La position d’arrivée est contrôlée hors des meubles solides. Le groupe doit se regrouper avant les seuils imposant sa présence.

### R10 — Dimensions

Les unités et la profondeur sont des coordonnées du moteur. Aucune conversion vers des mètres du jeu de 2013 n’est revendiquée.

### R11 — Armes trouvées

Les dix-sept nouveaux profils possèdent une action physique de ramassage. Ouvrir l’armurerie ne donne aucune arme gratuitement.

### R12 — Légendaires

Les six variantes sont associées aux missions de référence 1, 4, 5, 6, 9 et 10. Leurs coordonnées locales sont originales.

### R13 — Semi-automatique

Le maintien du tir d’un pistolet ne doit pas devenir une rafale automatique. Il faut une nouvelle pression après relâchement.

### R14 — Double canon

Le profil scié produit plusieurs trajectoires et dépense deux cartouches. La gerbe est simulée, pas un dégât instantané derrière les murs.

### R15 — Plasma

Le XM99A consomme après la charge de 0,85 seconde. Relâcher avant terme l’annule. La charge est originale à cette transposition.

### R16 — Explosifs portatifs

Le M5 explose à l’impact ; le P9 accroché à un obstacle détonne après temporisation. Les collisions et protections s’appliquent au premier contact.

### R17 — Sous-canon

Grenade, cartouches et combustible disposent de réserves dédiées. La touche 5 tire ; 6 change uniquement parmi les modules compatibles.

### R18 — Sous-canon en défense

Trois achats reconstituent ces réserves dans Bug Hunt, sous plafond et contre crédits, auprès d’un poste accessible. Un refus ne débite rien.

### R19 — Économie non identique

Pistolets à munitions infinies, abandon des armes lourdes et progression XP du jeu commercial ne sont pas reproduits. Les règles tactiques antérieures sont conservées.

### R20 — Stasis séparé

Les objets débloqués dans la campagne principale ne donnent pas automatiquement l’ensemble de l’arsenal aux personnages de Stasis.

### R21 — Apparence

Chaque profil de personnage a ses signes visuels et son statut documentaire. Une silhouette différenciée ne certifie ni visage, mensurations, animations ou voix 1:1.

### R22 — O’Neal

Ses blessures, munitions, ordres et déplacements restent simulés. Sa tenue a un bandana, une barbe et des bras tatoués, pas seulement un autre nom sur Winter.

### R23 — Cruz

La silhouette inclut une prothèse de jambe et des cheveux courts. La gestuelle mécanique détaillée et le visage ne sont pas finalisés.

### R24 — PNJ de scène

Les personnages narratifs ajoutés aux pièces sont des silhouettes statiques contextuelles. Ils ne sont pas présentés comme une nouvelle IA complète.

### R25 — Escorte de Reid

Reid doit être rassemblée puis accompagnée jusqu’au relais. Le maintien de transmission et les renforts sont actifs ; la sortie exige l’arrivée du personnage.

### R26 — Chronologie Stasis

Asylum, Awakening, Deliverance et Redemption remplacent les titres inventés dans la présentation. Awakening accompagne Hicks, tout en conservant les anciens identifiants techniques de sauvegarde.

### R27 — Limites narratives

Le pont final, les parents du Legato, la capture ou le voyage vers Fiorina sont des dossiers ou séquences condensées. Le pont final n’est pas une cinématique de conclusion fidèle.

### R28 — Objets fragiles

Les 82 couvertures destructibles de la version précédente restent présentes. Le tir qui détruit une protection ne traverse pas aussi cette protection pour toucher ce qui est derrière.

### R29 — Sentinelle conservée

Structure, surchauffe, réserve, veille, transport, réparation et redéploiement partagent le même châssis. Aucun changement de version ne doit soigner ou recharger un poste par défaut.

### R30 — Mines et leurres

Les outils tactiques des versions précédentes sont conservés et identifiés comme adaptations. Leur fonctionnement ne suffit pas à déclarer la Claymore directionnelle authentique.

### R31 — Reprises V9

Les anciennes clés sont lues sans écriture. Les nouvelles armes sont initialisées vides, l’arsenal retrouvé est vide et les réserves secondaires sont à zéro.

### R32 — Réparation spatiale de reprise

Un acteur enregistré à l’intérieur d’un meuble déplacé est replacé sur un point libre voisin, sans modifier sa santé. Il s’agit d’une correction de compatibilité, pas d’un retour arbitraire au début.

### R33 — Exports par chronique

Campagne principale, Stasis et Bug Hunt restent indépendants ; un export retrouve aussi les anciens points V9 non actifs. Une chronique absente n’est pas créée.

### R34 — Version courante stricte

Un fichier 0.10 dépourvu du registre d’armes ou des réserves nécessaires est refusé. La migration ne doit pas cacher la corruption d’un fichier courant.

### R35 — Méthode de capture

Un cadrage préparé du moteur illustre l’apparence. Il n’est ni une partie humaine ni une preuve de fidélité au jeu original.

### R36 — Méthode d’agent

Les agents connaissent la carte et visent idéalement. Ils utilisent toutefois les déplacements, tirs, achats et interactions normaux ; leur réussite ne mesure pas la difficulté humaine.

### R37 — Persistance

Les contrôles Chromium utilisent un Storage Map explicite, car les navigations locales sont bloquées. Les exports sont testés ; la persistance native de l’utilisateur n’est pas certifiée.

### R38 — Moteur parent

L’installateur local ajoute un point d’entrée selon son contrat v86 et refuse les hôtes différents. Aucun succès d’intégration native à Tantalus n’est déduit de cet installateur.

### R39 — Équipements encore absents

La grenade G2, la tourelle WY téléopérée, l’armement de véhicule GAU-113/B et le catalogue complet de modifications ne sont pas tous jouables ; l’armement personnel 21 profils n’est pas l’ensemble de ces systèmes.

### R40 — Multijoueur

Les arènes Bug Hunt sont originales. Les cartes commerciales de coopération, Versus, Movie/Reconnaissance et Academy ne sont pas reproduites par ces trois arènes.

## 01 — Distress

Le Sulaco ne répond plus. O’Neal attend près du sas. Retrouvez Rhino avant que la liaison avec le Sephora ne cède.

Objectifs : keyes, recorder, purge, ref-casevac

### Ombilical du Sephora — acm-01-01

Largeur 1800, niveau 0, fonction transfer.

#### Portes

S1 | acm-01-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-01-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-01-01-p0 | Pupitre de commande | 432 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-01-01-p1 | Conduit de service | 756 / 0.13 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-01-01-p2 | Râtelier militaire | 1026 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-01-01-p3 | Balise de chantier | 1368 / 0.13 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-01-01-p4 | Garde-corps | 720 / 0.93 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-01-01-p5 | Garde-corps | 1260 / 0.93 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-01-01-p6 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-01-01-p7 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-01-01.

#### Rencontres

### Hypersommeil éventré — acm-01-02

Largeur 1500, niveau 0, fonction cryo.

#### Portes

S1 | acm-01-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-01-03 | door | bulkhead | 1412 / 0.62 | 0 → 0 | keyes

S3 | acm-01-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · keyes | Découper la résine autour de Keyes | cut | 840 / 0.62 | 2.4 s | Aucune

#### Mobilier

acm-01-02-p0 | Caisson de stase | 255 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

acm-01-02-p1 | Caisson de stase | 570 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

acm-01-02-p2 | Caisson de stase | 915 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

acm-01-02-p3 | Caisson de stase | 1200 / 0.85 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

acm-01-02-p4 | Corps au sol | 810 / 0.34 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-01-02-p5 | Nappe de résine | 1080 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-01-02-p6 | Conduit de service | 1320 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

#### Rencontres

acm-01-02-e0 | Soldier | 760 / 0.62 | 0 s

### Salle de navigation — acm-01-03

Largeur 2100, niveau 0, fonction navigation.

#### Portes

S1 | acm-01-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-01-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-01-ref-casevac | door | bulkhead | 2012 / 0.62 | 0 → 0 | keyes, recorder

#### Actions

A1 · recorder | Récupérer l’enregistreur du Sulaco | record | 1530 / 0.22 | 1.4 s | Aucune

#### Mobilier

acm-01-03-p0 | Bureau de dossier | 441 / 0.14 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-01-03-p1 | Siège de poste | 504 / 0.36 | 51 × 0.1 × 64 | Décor | Face à un bureau ou une console.

acm-01-03-p2 | Pupitre de commande | 966 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-01-03-p3 | Baie réseau | 1280 / 0.13 | 86 × 0.1 × 172 | Décor | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil.

acm-01-03-p4 | Baie réseau | 1428 / 0.14 | 86 × 0.1 × 172 | Décor | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil.

acm-01-03-p5 | Râtelier militaire | 672 / 0.86 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-01-03-p6 | Caisse de transport | 1743 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-01-03-p7 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-01-03-p8 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-01-03-p9 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-01-03-e0 | Lurker | 880 / 0.65 | 0 s

acm-01-03-e1 | Soldier | 1190 / 0.28 | 0 s

acm-01-03-e2 | Soldier | 1470 / 0.84 | 6 s

### Soute de transfert — acm-01-04

Largeur 1800, niveau 0, fonction cargo.

#### Portes

S1 | acm-01-ref-casevac | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · purge | Purger la soute | purge | 1480 / 0.2 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-01-04-p0 | Caisse de transport | 432 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-01-04-p1 | Caisse de transport | 828 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-01-04-p2 | Palette de fret | 1080 / 0.17 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-01-04-p3 | Caisse de transport | 1224 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-01-04-p4 | Crochet de manutention | 1512 / 0.13 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-01-04-p5 | Conduit de service | 684 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-01-04-p6 | Balise de chantier | 1476 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-01-04-p7 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-01-04-e0 | Soldier | 880 / 0.65 | 0 s

acm-01-04-e1 | Soldier | 1150 / 0.3 | 0 s

acm-01-04-e2 | Spitter | 1470 / 0.84 | 6 s

### Vestiaire de Rhino — acm-01-05

Largeur 1180, niveau 1, fonction locker.

#### Portes

S1 | acm-01-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-01-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-0 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-01-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-m4a3 | Récupérer M4A3 · Pistolet de service | weapon | 520 / 0.62 | 0.8 s | Aucune

A4 · weapon-hicks | Récupérer Ithaca M37 · Fusil de Hicks | weapon | 790 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-01-05-p0 | Vestiaire | 248 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

acm-01-05-p1 | Vestiaire | 484 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

acm-01-05-p2 | Banc de service | 767 / 0.12 | 128 × 0.12 × 50 | Fragile | Mobilier en rive de salle, passage arrière maintenu.

acm-01-05-p3 | Râtelier militaire | 991 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-01-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-0.

acm-01-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-01-05.

acm-01-05-pickup-m4a3 | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme m4a3

acm-01-05-pickup-hicks | Râtelier militaire | 790 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme hicks

#### Rencontres

### Contrôle du pont d’évacuation — acm-01-ref-casevac

Largeur 1780, niveau 0, fonction control.

#### Portes

S1 | acm-01-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-01-04 | door | bulkhead | 1692 / 0.62 | 0 → 0 | ref-casevac

#### Actions

A1 · ref-casevac | Rétablir le suivi des blessés | record | 1086 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-01-ref-casevac-p0 | Pupitre de commande | 400.0 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-01-ref-casevac-p1 | Baie réseau | 726.6666666666667 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

acm-01-ref-casevac-p2 | Armoire de consommables | 1053.3333333333335 / 0.14 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

acm-01-ref-casevac-p3 | Pompe verticale | 1380.0 / 0.86 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

## 02 — Battle for Sulaco

Des soldats de Weyland-Yutani ont pris le Sulaco. Bella est isolée dans les secteurs de quarantaine. Passez par les ateliers.

Objectifs : freight, bella, turret, ref-engineering

### Voie de fret — acm-02-01

Largeur 1800, niveau 0, fonction cargo.

#### Portes

S1 | acm-02-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-02-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-02-01-p0 | Caisse de transport | 432 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-02-01-p1 | Caisse de transport | 828 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-02-01-p2 | Palette de fret | 1080 / 0.17 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-02-01-p3 | Caisse de transport | 1224 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-02-01-p4 | Crochet de manutention | 1512 / 0.13 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-02-01-p5 | Conduit de service | 684 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-02-01-p6 | Balise de chantier | 1476 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-02-01-p7 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-02-01-p8 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-02-01.

#### Rencontres

acm-02-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

### Atelier du chargeur — acm-02-02

Largeur 1500, niveau 0, fonction workshop.

#### Portes

S1 | acm-02-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-02-03 | door | bulkhead | 1412 / 0.62 | 0 → 0 | freight

S3 | acm-02-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · freight | Déverrouiller la porte de fret | power | 1120 / 0.62 | 2 s | Aucune

#### Mobilier

acm-02-02-p0 | Bureau de dossier | 360 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-02-02-p1 | Râtelier militaire | 705 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-02-02-p2 | Générateur | 1050 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-02-02-p3 | Caisse de transport | 1230 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-02-02-p4 | Conduit de service | 1290 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-02-02-p5 | Balise de chantier | 480 / 0.86 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

#### Rencontres

acm-02-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s

### Quarantaine de Bella — acm-02-03

Largeur 2100, niveau 0, fonction quarantine.

#### Portes

S1 | acm-02-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-02-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-02-ref-engineering | door | bulkhead | 2012 / 0.62 | 0 → 0 | freight, bella

#### Actions

A1 · bella | Libérer Bella de la quarantaine | rescue | 1450 / 0.24 | 2 s | Aucune

#### Mobilier

acm-02-03-p0 | Lit de soins | 525 / 0.14 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-02-03-p1 | Poste médical | 966 / 0.13 | 105 × 0.12 × 94 | Décor | Soin et munitions à usage unique par visite de campagne.

acm-02-03-p2 | Lit de soins | 1365 / 0.85 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-02-03-p3 | Nappe de résine | 1638 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-02-03-p4 | Œuf ouvert | 1596 / 0.3 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

acm-02-03-p5 | Conduit de service | 1806 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-02-03-p6 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-02-03-p7 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-02-03-e0 | Facehugger | 880 / 0.65 | 0 s

acm-02-03-e1 | Facehugger | 1190 / 0.28 | 0 s

acm-02-03-e2 | Soldier | 1470 / 0.84 | 6 s

### Passerelle occupée — acm-02-04

Largeur 1800, niveau 0, fonction bridge.

#### Portes

S1 | acm-02-ref-engineering | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · turret | Couper la tourelle de la passerelle | power | 1460 / 0.18 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-02-04-p0 | Pupitre de commande | 360 / 0.14 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-02-04-p1 | Pupitre de commande | 720 / 0.14 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-02-04-p2 | Siège de poste | 774 / 0.35 | 51 × 0.1 × 64 | Décor | Face à un bureau ou une console.

acm-02-04-p3 | Baie réseau | 1224 / 0.14 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-02-04-p4 | Bureau de dossier | 1386 / 0.84 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-02-04-p5 | Conduit de service | 1494 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

#### Rencontres

acm-02-04-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-02-04-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s

acm-02-04-e2 | Soldat Weyland-Yutani | 1510 / 0.82 | 6 s

### Niche de maintenance — acm-02-05

Largeur 1180, niveau 1, fonction maintenance.

#### Portes

S1 | acm-02-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-02-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-1 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-02-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-combat88 | Récupérer 88 Mod 4 · Pistolet de combat | weapon | 520 / 0.62 | 0.8 s | Aucune

A4 · weapon-m39 | Récupérer M39 · Pistolet-mitrailleur | weapon | 790 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-02-05-p0 | Pompe verticale | 283 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-02-05-p1 | Générateur | 519 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-02-05-p2 | Armoire de consommables | 767 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-02-05-p3 | Râtelier militaire | 1003 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-02-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-1.

acm-02-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-02-05.

acm-02-05-pickup-combat88 | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme combat88

acm-02-05-pickup-m39 | Râtelier militaire | 790 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme m39

#### Rencontres

### Ingénierie du Sulaco — acm-02-ref-engineering

Largeur 2120, niveau 0, fonction engineering.

#### Portes

S1 | acm-02-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-02-04 | door | bulkhead | 2032 / 0.62 | 0 → 0 | ref-engineering

#### Actions

A1 · ref-engineering | Isoler le retour d’énergie des canons | power | 1293 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-02-ref-engineering-p0 | Générateur | 400.0 / 0.14 | 140 × 0.12 × 104 | Solide | Mobilier de fonction, hors des seuils.

acm-02-ref-engineering-p1 | Pompe verticale | 840.0 / 0.86 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

acm-02-ref-engineering-p2 | Échangeur de toiture | 1280.0 / 0.14 | 165 × 0.18 × 116 | Solide | Mobilier de fonction, hors des seuils.

acm-02-ref-engineering-p3 | Enrouleur industriel | 1720.0 / 0.86 | 87 × 0.13 × 71 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

## 03 — Sulaco Falls

La coque s’ouvre. Reid prépare une navette. Réarmez les attaches d’urgence, puis gagnez le pont d’envol.

Objectifs : release, coolant, boarding, ref-bridge

### Coursive sous dépression — acm-03-01

Largeur 1800, niveau 0, fonction damaged.

#### Portes

S1 | acm-03-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-03-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-03-01-p0 | Débris structurels | 360 / 0.13 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-03-01-p1 | Conduit de service | 684 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-03-01-p2 | Débris structurels | 936 / 0.84 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-03-01-p3 | Corps au sol | 1116 / 0.3 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-03-01-p4 | Nappe de résine | 1404 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-03-01-p5 | Balise de chantier | 1530 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-03-01-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-03-01-p7 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-03-01.

#### Rencontres

acm-03-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

### Commande des attaches — acm-03-02

Largeur 1500, niveau 0, fonction generator.

#### Portes

S1 | acm-03-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-03-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

S3 | acm-03-ref-crane | door | bulkhead | 1412 / 0.62 | 0 → 0 | release

#### Actions

A1 · release | Armer le largage d’urgence | timer | 1000 / 0.62 | 2 s | Aucune

#### Mobilier

acm-03-02-p0 | Générateur | 300 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-03-02-p1 | Pompe verticale | 570 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-03-02-p2 | Baie réseau | 840 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-03-02-p3 | Pompe verticale | 1110 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-03-02-p4 | Armoire de consommables | 1275 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

#### Rencontres

acm-03-02-e0 | Soldier | 760 / 0.62 | 0 s

### Galerie en feu — acm-03-03

Largeur 2100, niveau 0, fonction damaged.

#### Portes

S1 | acm-03-04 | door | bulkhead | 2012 / 0.62 | 0 → 0 | release, coolant

S2 | acm-03-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-03-ref-crane | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · coolant | Fermer la conduite en rupture | valve | 1560 / 0.2 | 2 s | Aucune

#### Mobilier

acm-03-03-p0 | Débris structurels | 420 / 0.13 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-03-03-p1 | Conduit de service | 798 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-03-03-p2 | Débris structurels | 1092 / 0.84 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-03-03-p3 | Corps au sol | 1302 / 0.3 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-03-03-p4 | Nappe de résine | 1638 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-03-03-p5 | Balise de chantier | 1785 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-03-03-p6 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-03-03-p7 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-03-03-p8 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-03-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-03-03-e1 | Soldier | 1190 / 0.28 | 0 s

### Pont d’envol — acm-03-04

Largeur 1800, niveau 0, fonction flight.

#### Portes

S1 | acm-03-03 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · boarding | Ouvrir la rampe de la navette | power | 1320 / 0.3 | 1.5 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-03-04-p0 | Manifold de carburant | 396 / 0.13 | 84 × 0.1 × 96 | Décor | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette.

acm-03-04-p1 | Caisse de transport | 774 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-03-04-p2 | Palette de fret | 1080 / 0.17 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-03-04-p3 | Garde-corps | 1386 / 0.91 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-03-04-p4 | Balise de chantier | 1458 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-03-04-p5 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-03-04-e0 | Soldier | 880 / 0.65 | 0 s

acm-03-04-e1 | Spitter | 1190 / 0.28 | 0 s

### Infirmerie de secours — acm-03-05

Largeur 1180, niveau 1, fonction medical.

#### Portes

S1 | acm-03-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-03-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-2 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-03-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-sawed | Récupérer Double canon scié | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-03-05-p0 | Lit de soins | 271 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-03-05-p1 | Lit de soins | 543 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-03-05-p2 | Armoire de consommables | 802 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-03-05-p3 | Poste médical | 956 / 0.13 | 105 × 0.12 × 94 | Décor | Soin et munitions à usage unique par visite de campagne.

acm-03-05-p4 | Corps au sol | 460 / 0.32 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-03-05-p5 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-2.

acm-03-05-p6 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-03-05.

acm-03-05-pickup-sawed | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme sawed

#### Rencontres

### Puits de service — pont de grue — acm-03-ref-crane

Largeur 1960, niveau 0, fonction bridgecrane.

#### Portes

S1 | acm-03-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-03-03 | door | bulkhead | 1872 / 0.62 | 0 → 0 | ref-bridge

#### Actions

A1 · ref-bridge | Verrouiller la passerelle de grue | power | 570 / 0.55 | 1.4 s | Aucune

#### Mobilier

acm-03-ref-crane-p0 | Crochet de manutention | 400.0 / 0.14 | 120 × 0.1 × 155 | Décor | Mobilier de fonction, hors des seuils.

acm-03-ref-crane-p1 | Garde-corps | 786.6666666666667 / 0.86 | 165 × 0.04 × 74 | Décor | Mobilier de fonction, hors des seuils.

acm-03-ref-crane-p2 | Pupitre de commande | 1173.3333333333335 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-03-ref-crane-p3 | Garde-corps | 1560.0 / 0.86 | 165 × 0.04 × 74 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 04 — No Hope in Hadley’s

Cruz rassemble les survivants dans les opérations. Rétablissez le courant. Il faut une ligne de défense avant la nuit.

Objectifs : grid, sentry, defence, ref-orders, ref-morgue

### Rue des opérations — acm-04-01

Largeur 1800, niveau 0, fonction street.

#### Portes

S1 | acm-04-02 | door | exterior-passage | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-04-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-04-01-p0 | Débris structurels | 432 / 0.23 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-04-01-p1 | Grillage de chantier | 720 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-04-01-p2 | Caisse de transport | 1062 / 0.86 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-04-01-p3 | Balise de chantier | 1260 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-04-01-p4 | Grillage de chantier | 1494 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-04-01-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-01-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-01-p7 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-04-01.

#### Rencontres

acm-04-01-e0 | Soldier | 880 / 0.65 | 0 s

### Relais électrique — acm-04-02

Largeur 1500, niveau 0, fonction generator.

#### Portes

S1 | acm-04-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-04-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

S3 | acm-04-06 | stairs | stairwell | 550 / 0.62 | 0 → 1 | Libre

S4 | acm-04-ref-operations | lift | lift-shaft | 1412 / 0.62 | 0 → 1 | grid

#### Actions

A1 · grid | Rétablir le réseau local | power | 1040 / 0.62 | 2 s | Aucune

#### Mobilier

acm-04-02-p0 | Générateur | 300 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-04-02-p1 | Pompe verticale | 570 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-04-02-p2 | Baie réseau | 840 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-04-02-p3 | Pompe verticale | 1110 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-04-02-p4 | Armoire de consommables | 1275 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

#### Rencontres

acm-04-02-e0 | Lurker | 760 / 0.62 | 0 s

### Couloir de défense — acm-04-03

Largeur 2100, niveau 0, fonction defence.

#### Portes

S1 | acm-04-04 | door | bulkhead | 2012 / 0.62 | 0 → 0 | grid, sentry

S2 | acm-04-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-04-07 | stairs | stairwell | 480 / 0.16 | 0 → 1 | Libre

S4 | acm-04-ref-morgue | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · sentry | Installer la sentinelle | sentry | 620 / 0.6 | 2 s | Aucune

#### Mobilier

acm-04-03-p0 | Caisse de transport | 483 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-04-03-p1 | Râtelier militaire | 819 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-04-03-p2 | Caisse de transport | 1280 / 0.24 | 94 × 0.13 × 72 | Décor | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil.

acm-04-03-p3 | Conduit de service | 1512 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-04-03-p4 | Balise de chantier | 1806 / 0.85 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-04-03-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-03-p6 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-03-p7 | Sentinelle | 620 / 0.6 | 85 × 0.1 × 90 | Décor | Support visuel de l’interaction sentry.

#### Rencontres

acm-04-03-e0 | Soldier | 880 / 0.65 | 0 s

acm-04-03-e1 | Spitter | 1190 / 0.28 | 0 s

### Garage barricadé — acm-04-04

Largeur 1800, niveau 0, fonction garage.

#### Portes

S1 | acm-04-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · defence | Verrouiller le périmètre | defend | 1490 / 0.25 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

A3 · weapon-gorman | Récupérer VP70 · Pistolet de Gorman | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-04-04-p0 | Caisse de transport | 396 / 0.22 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-04-04-p1 | Râtelier militaire | 684 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-04-04-p2 | Palette de fret | 900 / 0.13 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-04-04-p3 | Caisse de transport | 1170 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-04-04-p4 | Crochet de manutention | 1422 / 0.12 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-04-04-p5 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-04-pickup-gorman | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme gorman

#### Rencontres

acm-04-04-e0 | Soldier | 880 / 0.65 | 0 s

acm-04-04-e1 | Soldier | 1190 / 0.28 | 0 s

acm-04-04-e2 | Lurker | 1470 / 0.84 | 6 s

acm-04-04-e3 | Spitter | 1660 / 0.5 | 7 s

### Magasin de la colonie — acm-04-05

Largeur 1180, niveau 1, fonction shop.

#### Portes

S1 | acm-04-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-04-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-3 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-04-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-m4ra | Récupérer M4RA · Fusil de précision | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-04-05-p0 | Armoire de consommables | 236 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-04-05-p1 | Bureau de dossier | 472 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-04-05-p2 | Râtelier militaire | 732 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-04-05-p3 | Vestiaire | 991 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

acm-04-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-3.

acm-04-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-04-05.

acm-04-05-pickup-m4ra | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme m4ra

#### Rencontres

### Escalier des opérations — acm-04-06

Largeur 1420, niveau 1, fonction stairs.

#### Portes

S1 | acm-04-02 | stairs | stairwell | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-04-07 | door | bulkhead | 1332 / 0.62 | 1 → 1 | Libre

#### Actions

A1 · archive-roof | Lire le plan d’évacuation | archive | 800 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-04-06-p0 | Garde-corps | 341 / 0.12 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-04-06-p1 | Balise de chantier | 582 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-04-06-p2 | Garde-corps | 852 / 0.12 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-04-06-p3 | Armoire de consommables | 1179 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-04-06-p4 | Enregistreur de terrain | 800 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-roof.

#### Rencontres

### Toit des échangeurs — acm-04-07

Largeur 1980, niveau 1, fonction rooftop.

#### Portes

S1 | acm-04-06 | door | exterior-passage | 88 / 0.62 | 1 → 1 | Libre

S2 | acm-04-03 | stairs | stairwell | 1892 / 0.62 | 1 → 0 | grid

#### Actions

A1 · supply-roof | Ouvrir le casier des techniciens | supply | 1250 / 0.25 | 0.8 s | Aucune

#### Mobilier

acm-04-07-p0 | Échangeur de toiture | 436 / 0.23 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente.

acm-04-07-p1 | Pompe verticale | 772 / 0.14 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-04-07-p2 | Échangeur de toiture | 1188 / 0.85 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente.

acm-04-07-p3 | Garde-corps | 1505 / 0.92 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-04-07-p4 | Balise de chantier | 1683 / 0.13 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-04-07-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-07-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-07-p7 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-04-07-p8 | Poste médical | 1250 / 0.25 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-roof.

#### Rencontres

acm-04-07-e0 | Lurker | 1500 / 0.78 | 0 s

### Opérations de Hadley’s Hope — acm-04-ref-operations

Largeur 2100, niveau 1, fonction operations.

#### Portes

S1 | acm-04-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-04-ref-morgue | lift | lift-shaft | 2012 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · ref-orders | Recevoir le périmètre de Cruz | record | 1281 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-04-ref-operations-p0 | Bureau de dossier | 400.0 / 0.14 | 138 × 0.12 × 88 | Solide | Mobilier de fonction, hors des seuils.

acm-04-ref-operations-p1 | Baie réseau | 833.3333333333333 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

acm-04-ref-operations-p2 | Pupitre de commande | 1266.6666666666665 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-04-ref-operations-p3 | Siège de poste | 1700.0 / 0.86 | 51 × 0.1 × 64 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

### Morgue de la colonie — acm-04-ref-morgue

Largeur 1840, niveau 0, fonction morgue.

#### Portes

S1 | acm-04-ref-operations | lift | lift-shaft | 88 / 0.62 | 0 → 1 | Libre

S2 | acm-04-03 | door | bulkhead | 1752 / 0.62 | 0 → 0 | ref-orders, ref-morgue

#### Actions

A1 · ref-morgue | Réinitialiser le détecteur de la morgue | power | 1122 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-04-ref-morgue-p0 | Corps au sol | 400.0 / 0.14 | 100 × 0.09 × 27 | Décor | Mobilier de fonction, hors des seuils.

acm-04-ref-morgue-p1 | Lit de soins | 746.6666666666667 / 0.86 | 155 × 0.14 × 63 | Solide | Mobilier de fonction, hors des seuils.

acm-04-ref-morgue-p2 | Armoire de consommables | 1093.3333333333335 / 0.14 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

acm-04-ref-morgue-p3 | Corps au sol | 1440.0 / 0.86 | 100 × 0.09 × 27 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 05 — The Raven

Winter reprend conscience sans son arme. Quelque chose de massif circule derrière les murs. Marchez doucement. Les formes pâles écoutent. Trois cloisons de secours séparent les pompes du dépôt : elles ralentiront votre poursuivant.

Objectifs : pump, gear, loader, raven-seal-1, raven-seal-2, raven-seal-3, ref-reid, ref-uplink-end, ref-reid-safe

### Cocon sous Hadley — acm-05-01

Largeur 1800, niveau 0, fonction hive.

#### Portes

S1 | acm-05-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-05-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-05-01-p0 | Nappe de résine | 360 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-05-01-p1 | Nappe de résine | 684 / 0.84 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-05-01-p2 | Œuf ouvert | 990 / 0.17 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

acm-05-01-p3 | Œuf ouvert | 1170 / 0.86 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

acm-05-01-p4 | Nappe de résine | 1458 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-05-01-p5 | Corps au sol | 738 / 0.31 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-05-01-p6 | Nappe de résine | 680 / 0.1 | 120 × 0.1 × 125 | Décor | Infrastructure continue sur la paroi porteuse.

acm-05-01-p7 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-05-01.

#### Rencontres

acm-05-01-e0 | Boiler | 880 / 0.18 | 0 s

### Salle des pompes — acm-05-02

Largeur 1500, niveau 0, fonction pump.

#### Portes

S1 | acm-05-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-05-05 | lift | lift-shaft | 780 / 0.16 | 0 → 1 | Libre

S3 | acm-05-06 | door | bulkhead | 1412 / 0.62 | 0 → 0 | pump

#### Actions

A1 · pump | Mettre la pompe en marche | lure | 500 / 0.62 | 1.2 s | Aucune

#### Mobilier

acm-05-02-p0 | Pompe verticale | 345 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-02-p1 | Générateur | 560 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-05-02-p2 | Pompe verticale | 930 / 0.87 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-02-p3 | Pompe verticale | 1215 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-02-p4 | Œuf ouvert | 990 / 0.12 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

#### Rencontres

acm-05-02-e0 | Boiler | 760 / 0.18 | 0 s

acm-05-02-e1 | Boiler | 1050 / 0.88 | 0 s

acm-05-02-e2 | Boiler | 1200 / 0.3 | 6 s

### Dépôt d’O’Neal — acm-05-03

Largeur 2100, niveau 0, fonction workshop.

#### Portes

S1 | acm-05-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S2 | acm-05-08 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S3 | acm-05-ref-reid | door | bulkhead | 2012 / 0.62 | 0 → 0 | pump, gear, raven-seal-1, raven-seal-2, raven-seal-3

#### Actions

A1 · gear | Récupérer le paquetage | gear | 560 / 0.64 | 1.2 s | Aucune

A2 · weapon-hudson | Récupérer M41A · Fusil de Hudson | weapon | 840 / 0.62 | 0.8 s | gear

#### Mobilier

acm-05-03-p0 | Bureau de dossier | 504 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-05-03-p1 | Râtelier militaire | 987 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-05-03-p2 | Générateur | 1470 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-05-03-p3 | Caisse de transport | 1722 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-05-03-p4 | Conduit de service | 1806 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-05-03-p5 | Balise de chantier | 672 / 0.86 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-05-03-p6 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-05-03-p7 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-05-03-pickup-hudson | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme hudson

#### Rencontres

acm-05-03-e0 | Soldier | 880 / 0.65 | 0 s

### Hangar du chargeur — acm-05-04

Largeur 1800, niveau 0, fonction loaderbay.

#### Portes

S1 | acm-05-ref-tower | lift | lift-shaft | 88 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · loader | Monter dans le chargeur | loader | 460 / 0.64 | 1.6 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-05-04-p0 | Râtelier militaire | 360 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-05-04-p1 | Caisse de transport | 702 / 0.22 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-05-04-p2 | Crochet de manutention | 1044 / 0.12 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-05-04-p3 | Caisse de transport | 1350 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-05-04-p4 | Balise de chantier | 1530 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-05-04-p5 | Chargeur de manutention | 460 / 0.64 | 135 × 0.12 × 160 | Décor | Support visuel de l’interaction loader.

#### Rencontres

acm-05-04-e0 | Raven | 880 / 0.65 | 0 s

### Conduit de dérivation — acm-05-05

Largeur 1180, niveau 1, fonction drain.

#### Portes

S1 | acm-05-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-05-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | raven-seal-1, raven-seal-2, raven-seal-3

#### Actions

A1 · archive-4 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-05-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-05-05-p0 | Pompe verticale | 260 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-05-p1 | Nappe de résine | 507 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-05-05-p2 | Conduit de service | 743 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-05-05-p3 | Pompe verticale | 979 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-4.

acm-05-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-05-05.

#### Rencontres

### Écluse de maintenance — acm-05-06

Largeur 1460, niveau 0, fonction floodgate.

#### Portes

S1 | acm-05-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-05-07 | door | bulkhead | 1372 / 0.62 | 0 → 0 | pump, raven-seal-1

#### Actions

A1 · raven-seal-1 | Fermer la cloison 1 derrière Winter | seal | 1200 / 0.62 | 0.65 s | Aucune

#### Mobilier

acm-05-06-p0 | Pompe verticale | 321 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-06-p1 | Nappe de résine | 599 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-05-06-p2 | Pompe verticale | 920 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-06-p3 | Balise de chantier | 1212 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

#### Rencontres

### Passerelle du collecteur — acm-05-07

Largeur 1820, niveau 0, fonction collector.

#### Portes

S1 | acm-05-06 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-05-08 | door | bulkhead | 1732 / 0.62 | 0 → 0 | pump, raven-seal-1, raven-seal-2

#### Actions

A1 · raven-seal-2 | Fermer la cloison 2 derrière Winter | seal | 1560 / 0.62 | 0.65 s | Aucune

#### Mobilier

acm-05-07-p0 | Garde-corps | 328 / 0.12 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-05-07-p1 | Pompe verticale | 619 / 0.14 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-07-p2 | Garde-corps | 983 / 0.91 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-05-07-p3 | Pompe verticale | 1238 / 0.87 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-07-p4 | Garde-corps | 1511 / 0.12 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-05-07-p5 | Nappe de résine | 1090 / 0.1 | 120 × 0.1 × 125 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

### Vestibule du monte-charge — acm-05-08

Largeur 1440, niveau 0, fonction lift.

#### Portes

S1 | acm-05-07 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-05-03 | door | bulkhead | 1352 / 0.62 | 0 → 0 | pump, raven-seal-1, raven-seal-2, raven-seal-3

#### Actions

A1 · raven-seal-3 | Fermer la cloison 3 derrière Winter | seal | 1180 / 0.62 | 0.65 s | Aucune

#### Mobilier

acm-05-08-p0 | Garde-corps | 288 / 0.11 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-05-08-p1 | Générateur | 576 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-05-08-p2 | Pompe verticale | 893 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-05-08-p3 | Garde-corps | 1195 / 0.94 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-05-08-p4 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

### Cour de la tour — Reid isolée — acm-05-ref-reid

Largeur 1840, niveau 0, fonction street.

#### Portes

S1 | acm-05-03 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-05-ref-tower | lift | lift-shaft | 1752 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · ref-reid | Regrouper Reid pour rejoindre la tour | escort_start | 670 / 0.55 | 1.4 s | Aucune

#### Mobilier

acm-05-ref-reid-p0 | Pupitre de commande | 400.0 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-05-ref-reid-p1 | Baie réseau | 746.6666666666667 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

acm-05-ref-reid-p2 | Armoire de consommables | 1093.3333333333335 / 0.14 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

acm-05-ref-reid-p3 | Pompe verticale | 1440.0 / 0.86 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

### Tour de communication — acm-05-ref-tower

Largeur 2200, niveau 1, fonction comtower.

#### Portes

S1 | acm-05-ref-reid | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-05-04 | lift | lift-shaft | 2112 / 0.62 | 1 → 0 | ref-reid-safe

#### Actions

A1 · ref-uplink | Lancer le rétablissement de la liaison | upload_start | 850 / 0.45 | 1.4 s | Aucune

A2 · ref-uplink-end | Confirmer la liaison restaurée | upload_end | 850 / 0.45 | 1.4 s | ref-uplink

A3 · ref-reid-safe | Installer Reid dans le poste sécurisé | escort_deliver | 1560 / 0.62 | 1.4 s | ref-uplink-end

#### Mobilier

acm-05-ref-tower-p0 | Station de transmission | 400.0 / 0.14 | 95 × 0.12 × 148 | Décor | Mobilier de fonction, hors des seuils.

acm-05-ref-tower-p1 | Baie réseau | 866.6666666666667 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

acm-05-ref-tower-p2 | Enrouleur industriel | 1333.3333333333335 / 0.14 | 87 × 0.13 × 71 | Solide | Mobilier de fonction, hors des seuils.

acm-05-ref-tower-p3 | Extracteur mural | 1800.0 / 0.86 | 126 × 0.06 × 110 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

acm-05-ref-tower-enemy-0 | Soldier | 1700 / 0.62 | 0 s

acm-05-ref-tower-enemy-1 | Lurker | 1940 / 0.4 | 10 s

## 06 — For Bella

Il faut atteindre les installations de Weyland-Yutani. Le manifeste du prisonnier et les dossiers médicaux se trouvent au-delà du périmètre.

Objectifs : gate, manifest, lab-entry, ref-warehouse

### Périphérie dévastée — acm-06-01

Largeur 1800, niveau 0, fonction street.

#### Portes

S1 | acm-06-02 | door | exterior-passage | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-06-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-06-01-p0 | Débris structurels | 432 / 0.23 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-06-01-p1 | Grillage de chantier | 720 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-06-01-p2 | Caisse de transport | 1062 / 0.86 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-06-01-p3 | Balise de chantier | 1260 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-06-01-p4 | Grillage de chantier | 1494 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-06-01-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-06-01-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-06-01-p7 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-06-01.

#### Rencontres

acm-06-01-e0 | Soldier | 880 / 0.65 | 0 s

acm-06-01-e1 | Spitter | 1190 / 0.28 | 0 s

### Poste de surveillance — acm-06-02

Largeur 1500, niveau 0, fonction security.

#### Portes

S1 | acm-06-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-06-03 | door | bulkhead | 1412 / 0.62 | 0 → 0 | gate

S3 | acm-06-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · gate | Ouvrir l’accès du périmètre | cut | 1080 / 0.62 | 2.2 s | Aucune

#### Mobilier

acm-06-02-p0 | Baie réseau | 300 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-06-02-p1 | Pupitre de commande | 585 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-06-02-p2 | Râtelier militaire | 855 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-06-02-p3 | Caisse de transport | 1155 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-06-02-p4 | Conduit de service | 1275 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-06-02-p5 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-06-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s

### Bâtiment des manifestes — acm-06-03

Largeur 2100, niveau 0, fonction office.

#### Portes

S1 | acm-06-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-06-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-06-ref-warehouse | door | bulkhead | 2012 / 0.62 | 0 → 0 | gate, manifest

#### Actions

A1 · manifest | Copier le manifeste des prisonniers | record | 1510 / 0.22 | 2 s | Aucune

#### Mobilier

acm-06-03-p0 | Bureau de dossier | 462 / 0.13 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-06-03-p1 | Siège de poste | 525 / 0.34 | 51 × 0.1 × 64 | Décor | Face à un bureau ou une console.

acm-06-03-p2 | Armoire de consommables | 924 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-06-03-p3 | Bureau de dossier | 1302 / 0.84 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-06-03-p4 | Baie réseau | 1722 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-06-03-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-06-03-p6 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-06-03-p7 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-06-03-p8 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-06-03-p9 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-06-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-06-03-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s

### Approche du laboratoire — acm-06-04

Largeur 1800, niveau 0, fonction airlock.

#### Portes

S1 | acm-06-ref-warehouse | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · lab-entry | Déverrouiller le sas du laboratoire | power | 1450 / 0.22 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-06-04-p0 | Conduit de service | 414 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-06-04-p1 | Pupitre de commande | 792 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-06-04-p2 | Pompe verticale | 1170 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-06-04-p3 | Balise de chantier | 1512 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-06-04-p4 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-06-04-e0 | Lurker | 880 / 0.65 | 0 s

acm-06-04-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s

### Remise du chantier — acm-06-05

Largeur 1180, niveau 1, fonction workshop.

#### Portes

S1 | acm-06-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-06-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-5 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-06-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-mk221 | Récupérer MK221 · Fusil tactique | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-06-05-p0 | Bureau de dossier | 283 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-06-05-p1 | Râtelier militaire | 555 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-06-05-p2 | Générateur | 826 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-06-05-p3 | Caisse de transport | 968 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-06-05-p4 | Conduit de service | 1015 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-06-05-p5 | Balise de chantier | 378 / 0.86 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-06-05-p6 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-5.

acm-06-05-p7 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-06-05.

acm-06-05-pickup-mk221 | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme mk221

#### Rencontres

### Entrepôt du périmètre WY — acm-06-ref-warehouse

Largeur 2140, niveau 0, fonction warehouse.

#### Portes

S1 | acm-06-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-06-04 | door | bulkhead | 2052 / 0.62 | 0 → 0 | ref-warehouse

#### Actions

A1 · ref-warehouse | Déverrouiller le transit vers l’ascenseur | power | 1305 / 0.5 | 1.4 s | Aucune

A2 · weapon-vasquez-smart | Récupérer M56 · Smartgun de Vasquez | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-06-ref-warehouse-p0 | Râtelier militaire | 400.0 / 0.14 | 126 × 0.1 × 135 | Décor | Mobilier de fonction, hors des seuils.

acm-06-ref-warehouse-p1 | Caisse de transport | 846.6666666666667 / 0.86 | 94 × 0.13 × 72 | Solide | Mobilier de fonction, hors des seuils.

acm-06-ref-warehouse-p2 | Vestiaire | 1293.3333333333335 / 0.14 | 90 × 0.1 × 150 | Décor | Mobilier de fonction, hors des seuils.

acm-06-ref-warehouse-p3 | Palette de fret | 1740.0 / 0.86 | 140 × 0.12 × 22 | Décor | Mobilier de fonction, hors des seuils.

acm-06-ref-warehouse-pickup-vasquez-smart | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme vasquez-smart

#### Rencontres

## 07 — One Bullet

Les laboratoires sont encore occupés. Neutralisez les alarmes, trouvez une aide pour Bella, puis coupez les trois cellules du module. Le blindé de la cour interdit le passage vers les cellules.

Objectifs : alarm, diagnostic, cell-a, cell-b, cell-c, shutdown, crane-drop, apc-destroyed

### Contrôle de sécurité — acm-07-01

Largeur 1800, niveau 0, fonction security.

#### Portes

S1 | acm-07-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | alarm

S2 | acm-07-ref-specimens | lift | lift-shaft | 1134 / 0.16 | 0 → 1 | alarm

#### Actions

A1 · alarm | Neutraliser le relais d’alarme | alarm | 1090 / 0.24 | 1.8 s | Aucune

A2 · supply-acm-07-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-07-01-p0 | Baie réseau | 360 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-07-01-p1 | Pupitre de commande | 702 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-07-01-p2 | Râtelier militaire | 1026 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-07-01-p3 | Caisse de transport | 1386 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-07-01-p4 | Conduit de service | 1530 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-07-01-p5 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-07-01.

#### Rencontres

acm-07-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

### Salle d’examen — acm-07-02

Largeur 1500, niveau 0, fonction medical.

#### Portes

S1 | acm-07-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-07-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

S3 | acm-07-06 | door | bulkhead | 1412 / 0.62 | 0 → 0 | alarm, diagnostic

#### Actions

A1 · diagnostic | Consulter le diagnostic de Bella | medical | 1050 / 0.62 | 2 s | Aucune

#### Mobilier

acm-07-02-p0 | Lit de soins | 345 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-07-02-p1 | Lit de soins | 690 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-07-02-p2 | Armoire de consommables | 1020 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-07-02-p3 | Poste médical | 1215 / 0.13 | 105 × 0.12 × 94 | Décor | Soin et munitions à usage unique par visite de campagne.

acm-07-02-p4 | Corps au sol | 585 / 0.32 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

#### Rencontres

acm-07-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s

### Cellules du module — acm-07-03

Largeur 2100, niveau 0, fonction reactor.

#### Portes

S1 | acm-07-04 | door | bulkhead | 2012 / 0.62 | 0 → 0 | alarm, diagnostic, cell-a, cell-b, cell-c, crane-drop, apc-destroyed

S2 | acm-07-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-07-06 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · cell-a | Isoler la cellule A | power | 570 / 0.2 | 1.4 s | Aucune

A2 · cell-b | Isoler la cellule B | power | 1080 / 0.85 | 1.4 s | Aucune

A3 · cell-c | Isoler la cellule C | power | 1650 / 0.2 | 1.4 s | Aucune

#### Mobilier

acm-07-03-p0 | Générateur | 378 / 0.12 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-07-03-p1 | Pompe verticale | 693 / 0.12 | 80 × 0.11 × 146 | Décor | Alimentation des conduites en plafond, jamais suspendue dans le vide. Volume de collision retiré : dégagement du poste ou du seuil.

acm-07-03-p2 | Générateur | 1190 / 0.86 | 140 × 0.12 × 104 | Décor | Machine fixe ; commande déportée accessible. Volume de collision retiré : dégagement du poste ou du seuil.

acm-07-03-p3 | Baie réseau | 1533 / 0.12 | 86 × 0.1 × 172 | Décor | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil.

acm-07-03-p4 | Pompe verticale | 1806 / 0.88 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-07-03-p5 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-07-03-p6 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-07-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-07-03-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s

acm-07-03-e2 | Facehugger | 1470 / 0.84 | 6 s

### Commande de coupure — acm-07-04

Largeur 1800, niveau 0, fonction control.

#### Portes

S1 | acm-07-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | apc-destroyed

#### Actions

A1 · shutdown | Couper le module | shutdown | 1420 / 0.2 | 2 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-07-04-p0 | Bureau de dossier | 378 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-07-04-p1 | Pupitre de commande | 720 / 0.12 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-07-04-p2 | Baie réseau | 1134 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-07-04-p3 | Baie réseau | 1550 / 0.13 | 86 × 0.1 × 172 | Décor | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil.

#### Rencontres

acm-07-04-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-07-04-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s

### Local des techniciens — acm-07-05

Largeur 1180, niveau 1, fonction maintenance.

#### Portes

S1 | acm-07-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-07-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | apc-destroyed

#### Actions

A1 · archive-6 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-07-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-nsg23 | Récupérer NSG 23 · Fusil d’assaut | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-07-05-p0 | Pompe verticale | 283 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-07-05-p1 | Générateur | 519 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-07-05-p2 | Armoire de consommables | 767 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-07-05-p3 | Râtelier militaire | 1003 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-07-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-6.

acm-07-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-07-05.

acm-07-05-pickup-nsg23 | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme nsg23

#### Rencontres

### Cour du portique — acm-07-06

Largeur 2540, niveau 0, fonction craneyard.

#### Portes

S1 | acm-07-02 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-07-03 | door | exterior-passage | 2452 / 0.62 | 0 → 0 | alarm, diagnostic, crane-drop, apc-destroyed

S3 | acm-07-07 | lift | lift-shaft | 730 / 0.16 | 0 → 1 | Libre

#### Actions

A1 · crane-drop | Larguer la charge au-dessus de l’APC | crane | 2270 / 0.2 | 1.1 s | Aucune

#### Mobilier

acm-07-06-p0 | Caisse de transport | 483 / 0.27 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-07-06-p1 | Grillage de chantier | 813 / 0.93 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-07-06-p2 | Caisse de transport | 1092 / 0.24 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-07-06-p3 | Caisse de transport | 1575 / 0.88 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-07-06-p4 | Garde-corps | 2159 / 0.94 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-07-06-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-07-06-p6 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-07-06-p7 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-07-06-p8 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-07-06-p9 | Conduit de service | 2320 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-07-06-e0 | Soldat Weyland-Yutani | 920 / 0.25 | 0 s

acm-07-06-e1 | Soldat Weyland-Yutani | 1720 / 0.87 | 6 s

### Galerie de maintenance du portique — acm-07-07

Largeur 1360, niveau 1, fonction control.

#### Portes

S1 | acm-07-06 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · supply-crane | Récupérer les munitions de maintenance | supply | 420 / 0.62 | 0.8 s | Aucune

A2 · archive-crane | Lire le plan du portique | archive | 900 / 0.62 | 0.8 s | Aucune

A3 · weapon-p9 | Récupérer P9 S.H.A.R.P. · Harpon explosif | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-07-07-p0 | Bureau de dossier | 286 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-07-07-p1 | Pupitre de commande | 544 / 0.12 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-07-07-p2 | Baie réseau | 857 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-07-07-p3 | Baie réseau | 1115 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-07-07-p4 | Poste médical | 420 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-crane.

acm-07-07-p5 | Enregistreur de terrain | 900 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-crane.

acm-07-07-pickup-p9 | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme p9

#### Rencontres

### Observation des sujets — acm-07-ref-specimens

Largeur 1740, niveau 1, fonction interrogation.

#### Portes

S1 | acm-07-01 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · ref-observation | Consigner les indices du laboratoire | record | 1061 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-07-ref-specimens-p0 | Siège de poste | 400.0 / 0.14 | 51 × 0.1 × 64 | Décor | Mobilier de fonction, hors des seuils.

acm-07-ref-specimens-p1 | Paillasse de prélèvement | 713.3333333333333 / 0.86 | 150 × 0.13 × 89 | Solide | Mobilier de fonction, hors des seuils.

acm-07-ref-specimens-p2 | Pupitre de commande | 1026.6666666666665 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-07-ref-specimens-p3 | Armoire de consommables | 1340.0 / 0.86 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 08 — Rampart

Le prisonnier a été déplacé vers le Derelict. Traversez le module de sécurité et suivez les traces du transfert.

Objectifs : security, trace, hicks, ref-pilot

### Pied du module de sécurité — acm-08-01

Largeur 1800, niveau 0, fonction airlock.

#### Portes

S1 | acm-08-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-08-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-08-01-p0 | Conduit de service | 414 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-08-01-p1 | Pupitre de commande | 792 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-08-01-p2 | Pompe verticale | 1170 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-08-01-p3 | Balise de chantier | 1512 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-08-01-p4 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-08-01-p5 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-08-01.

#### Rencontres

acm-08-01-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

### Contrôle de détention — acm-08-02

Largeur 1500, niveau 0, fonction security.

#### Portes

S1 | acm-08-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-08-03 | door | bulkhead | 1412 / 0.62 | 0 → 0 | security

S3 | acm-08-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · security | Couper le verrou de détention | power | 1040 / 0.62 | 2 s | Aucune

#### Mobilier

acm-08-02-p0 | Baie réseau | 300 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-08-02-p1 | Pupitre de commande | 585 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-08-02-p2 | Râtelier militaire | 855 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-08-02-p3 | Caisse de transport | 1155 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-08-02-p4 | Conduit de service | 1275 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-08-02-p5 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-08-02-e0 | Soldat Weyland-Yutani | 760 / 0.62 | 0 s

### Coursive du Derelict — acm-08-03

Largeur 2100, niveau 0, fonction derelict.

#### Portes

S1 | acm-08-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-08-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-08-06 | lift | lift-shaft | 600 / 0.16 | 0 → 1 | Libre

S4 | acm-08-ref-pilot | door | bulkhead | 2012 / 0.62 | 0 → 0 | security, trace

#### Actions

A1 · trace | Identifier le transfert du prisonnier | record | 1510 / 0.2 | 1.8 s | Aucune

#### Mobilier

acm-08-03-p0 | Nappe de résine | 399 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-08-03-p1 | Œuf ouvert | 693 / 0.22 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

acm-08-03-p2 | Nappe de résine | 1050 / 0.86 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-08-03-p3 | Œuf ouvert | 1344 / 0.84 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

acm-08-03-p4 | Nappe de résine | 1680 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-08-03-p5 | Balise de chantier | 1806 / 0.85 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-08-03-p6 | Nappe de résine | 1090 / 0.1 | 120 × 0.1 × 125 | Décor | Infrastructure continue sur la paroi porteuse.

acm-08-03-p7 | Nappe de résine | 1500 / 0.1 | 120 × 0.1 × 125 | Décor | Infrastructure continue sur la paroi porteuse.

acm-08-03-p8 | Nappe de résine | 1910 / 0.1 | 120 × 0.1 × 125 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-08-03-e0 | Soldier | 880 / 0.65 | 0 s

acm-08-03-e1 | Spitter | 1190 / 0.28 | 0 s

acm-08-03-e2 | Facehugger | 1470 / 0.84 | 6 s

### Cellule de transfert — acm-08-04

Largeur 1800, niveau 0, fonction cell.

#### Portes

S1 | acm-08-06 | lift | lift-shaft | 900 / 0.16 | 0 → 1 | Libre

S2 | acm-08-ref-pilot | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · hicks | Libérer Hicks | rescue | 1430 / 0.26 | 2.4 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-08-04-p0 | Grillage de chantier | 396 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-08-04-p1 | Lit de soins | 650 / 0.13 | 155 × 0.14 × 63 | Décor | Tête au moniteur ; couloir latéral de brancard. Volume de collision retiré : dégagement du poste ou du seuil.

acm-08-04-p2 | Grillage de chantier | 1100 / 0.13 | 170 × 0.07 × 165 | Décor | Séparation industrielle ; aucune clôture au milieu d’un salon. Volume de collision retiré : dégagement du poste ou du seuil.

acm-08-04-p3 | Pupitre de commande | 1440 / 0.84 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-08-04-p4 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-08-04-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-08-04-e1 | Soldier | 1190 / 0.28 | 0 s

### Annexe de surveillance — acm-08-05

Largeur 1180, niveau 1, fonction security.

#### Portes

S1 | acm-08-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-08-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-7 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-08-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-xm99a | Récupérer XM99A · Fusil à plasma | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-08-05-p0 | Baie réseau | 236 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-08-05-p1 | Pupitre de commande | 460 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-08-05-p2 | Râtelier militaire | 673 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-08-05-p3 | Caisse de transport | 909 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-08-05-p4 | Conduit de service | 1003 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-08-05-p5 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-7.

acm-08-05-p6 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-08-05.

acm-08-05-pickup-xm99a | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme xm99a

#### Rencontres

### Poste d’observation des cellules — acm-08-06

Largeur 1640, niveau 1, fonction observation.

#### Portes

S1 | acm-08-03 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-08-04 | lift | lift-shaft | 1552 / 0.62 | 1 → 0 | security, trace

#### Actions

A1 · archive-prison | Copier les mouvements du détenu | archive | 990 / 0.2 | 0.9 s | Aucune

#### Mobilier

acm-08-06-p0 | Pupitre de commande | 328 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-08-06-p1 | Bureau de dossier | 705 / 0.14 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-08-06-p2 | Siège de poste | 738 / 0.34 | 51 × 0.1 × 64 | Décor | Face à un bureau ou une console.

acm-08-06-p3 | Baie réseau | 1100 / 0.13 | 86 × 0.1 × 172 | Décor | Groupe de baies en paroi et accès de maintenance. Volume de collision retiré : dégagement du poste ou du seuil.

acm-08-06-p4 | Armoire de consommables | 1328 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-08-06-p5 | Enregistreur de terrain | 990 / 0.2 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-prison.

#### Rencontres

acm-08-06-e0 | Soldat Weyland-Yutani | 1240 / 0.76 | 0 s

### Chambre du pilote du Derelict — acm-08-ref-pilot

Largeur 2520, niveau 0, fonction pilot.

#### Portes

S1 | acm-08-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-08-04 | door | bulkhead | 2432 / 0.62 | 0 → 0 | ref-pilot

#### Actions

A1 · ref-pilot | Relever le balisage de l’équipe scientifique | record | 1537 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-08-ref-pilot-p0 | Nappe de résine | 400.0 / 0.14 | 120 × 0.1 × 125 | Décor | Mobilier de fonction, hors des seuils.

acm-08-ref-pilot-p1 | Nappe de résine | 973.3333333333334 / 0.86 | 120 × 0.1 × 125 | Décor | Mobilier de fonction, hors des seuils.

acm-08-ref-pilot-p2 | Œuf ouvert | 1546.6666666666667 / 0.14 | 44 × 0.08 × 50 | Décor | Mobilier de fonction, hors des seuils.

acm-08-ref-pilot-p3 | Nappe de résine | 2120.0 / 0.86 | 120 × 0.1 × 125 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 09 — Hope in Hadley’s

Les survivants sont encerclés. Rejoignez les opérations, ouvrez le garage et préparez le départ de Reid.

Objectifs : survivors, sentry, fuel-a, fuel-b, ref-survivors

### Retour aux opérations — acm-09-01

Largeur 1800, niveau 0, fonction street.

#### Portes

S1 | acm-09-02 | door | exterior-passage | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-09-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

A2 · weapon-vasquez-pistol | Récupérer M1911 · Pistolet de Vasquez | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-09-01-p0 | Débris structurels | 432 / 0.23 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-09-01-p1 | Grillage de chantier | 720 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-09-01-p2 | Caisse de transport | 1062 / 0.86 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-09-01-p3 | Balise de chantier | 1260 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-09-01-p4 | Grillage de chantier | 1494 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

acm-09-01-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-09-01-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-09-01-p7 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-09-01.

acm-09-01-pickup-vasquez-pistol | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme vasquez-pistol

#### Rencontres

acm-09-01-e0 | Soldier | 880 / 0.65 | 0 s

acm-09-01-e1 | Soldier | 1190 / 0.28 | 0 s

### Couloir des survivants — acm-09-02

Largeur 1500, niveau 0, fonction habitat.

#### Portes

S1 | acm-09-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-09-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

S3 | acm-09-ref-operations | lift | lift-shaft | 1412 / 0.62 | 0 → 1 | survivors

#### Actions

A1 · survivors | Dégager les survivants | rescue | 1080 / 0.62 | 2 s | Aucune

#### Mobilier

acm-09-02-p0 | Banc de service | 315 / 0.12 | 128 × 0.12 × 50 | Fragile | Mobilier en rive de salle, passage arrière maintenu.

acm-09-02-p1 | Vestiaire | 645 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

acm-09-02-p2 | Corps au sol | 900 / 0.3 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-09-02-p3 | Poste médical | 1215 / 0.12 | 105 × 0.12 × 94 | Décor | Soin et munitions à usage unique par visite de campagne.

#### Rencontres

acm-09-02-e0 | Lurker | 760 / 0.62 | 0 s

### Garage du dernier carré — acm-09-03

Largeur 2100, niveau 0, fonction garage.

#### Portes

S1 | acm-09-04 | door | bulkhead | 2012 / 0.62 | 0 → 0 | survivors, sentry

S2 | acm-09-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-09-ref-operations | lift | lift-shaft | 88 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · sentry | Mettre la sentinelle en batterie | sentry | 430 / 0.65 | 1.8 s | Aucune

#### Mobilier

acm-09-03-p0 | Caisse de transport | 462 / 0.22 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-09-03-p1 | Râtelier militaire | 798 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-09-03-p2 | Palette de fret | 1050 / 0.13 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-09-03-p3 | Caisse de transport | 1365 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-09-03-p4 | Crochet de manutention | 1659 / 0.12 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-09-03-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-09-03-p6 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-09-03-p7 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-09-03-p8 | Sentinelle | 430 / 0.65 | 85 × 0.1 × 90 | Décor | Support visuel de l’interaction sentry.

#### Rencontres

acm-09-03-e0 | Crusher | 880 / 0.65 | 0 s

### Aire de ravitaillement — acm-09-04

Largeur 1800, niveau 0, fonction landing.

#### Portes

S1 | acm-09-03 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · fuel-a | Débrancher la conduite bâbord | power | 750 / 0.25 | 1.8 s | Aucune

A2 · fuel-b | Débrancher la conduite tribord | power | 1370 / 0.85 | 1.8 s | Aucune

A3 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

#### Mobilier

acm-09-04-p0 | Manifold de carburant | 450 / 0.12 | 84 × 0.1 × 96 | Décor | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette.

acm-09-04-p1 | Manifold de carburant | 1008 / 0.91 | 84 × 0.1 × 96 | Décor | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette.

acm-09-04-p2 | Caisse de transport | 920 / 0.24 | 94 × 0.13 × 72 | Décor | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil.

acm-09-04-p3 | Garde-corps | 1386 / 0.93 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-09-04-p4 | Balise de chantier | 1548 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-09-04-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-09-04-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-09-04-e0 | Soldier | 880 / 0.65 | 0 s

acm-09-04-e1 | Soldier | 1190 / 0.28 | 0 s

acm-09-04-e2 | Spitter | 1470 / 0.84 | 6 s

### Réserve du mess — acm-09-05

Largeur 1180, niveau 1, fonction mess.

#### Portes

S1 | acm-09-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-09-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-8 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-09-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-09-05-p0 | Bureau de dossier | 260 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-09-05-p1 | Banc de service | 519 / 0.12 | 128 × 0.12 × 50 | Fragile | Mobilier en rive de salle, passage arrière maintenu.

acm-09-05-p2 | Armoire de consommables | 755 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-09-05-p3 | Banc de service | 968 / 0.12 | 128 × 0.12 × 50 | Fragile | Mobilier en rive de salle, passage arrière maintenu.

acm-09-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-8.

acm-09-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-09-05.

#### Rencontres

### Opérations — dernier regroupement — acm-09-ref-operations

Largeur 2120, niveau 1, fonction operations.

#### Portes

S1 | acm-09-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-09-03 | lift | lift-shaft | 2032 / 0.62 | 1 → 0 | ref-survivors

#### Actions

A1 · ref-survivors | Confirmer le départ du groupe vers le garage | record | 1293 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-09-ref-operations-p0 | Bureau de dossier | 400.0 / 0.14 | 138 × 0.12 × 88 | Solide | Mobilier de fonction, hors des seuils.

acm-09-ref-operations-p1 | Baie réseau | 840.0 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

acm-09-ref-operations-p2 | Pupitre de commande | 1280.0 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-09-ref-operations-p3 | Siège de poste | 1720.0 / 0.86 | 51 × 0.1 × 64 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 10 — Derelict Reclaimed

Le transport s’apprête à décoller. Rétablissez l’ascenseur, détruisez les batteries antiaériennes et rejoignez la rampe. Un dropship abattu émet encore des signes de vie.

Objectifs : lift, aa-a, aa-b, aa-c, ramp, rescue-stabilize, rescue-extract, rescue-route, survivor-delivered

### Puits de l’ascenseur — acm-10-01

Largeur 1800, niveau 0, fonction lift.

#### Portes

S1 | acm-10-02 | door | bulkhead | 1712 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · supply-acm-10-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-10-01-p0 | Garde-corps | 360 / 0.11 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-10-01-p1 | Générateur | 720 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-10-01-p2 | Pompe verticale | 1116 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-10-01-p3 | Garde-corps | 1494 / 0.94 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-10-01-p4 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-01-p5 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-10-01.

#### Rencontres

acm-10-01-e0 | Soldier | 880 / 0.65 | 0 s

acm-10-01-e1 | Spitter | 1190 / 0.28 | 0 s

### Réseau d’alimentation — acm-10-02

Largeur 1500, niveau 0, fonction generator.

#### Portes

S1 | acm-10-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-10-03 | door | bulkhead | 1412 / 0.62 | 0 → 0 | lift

S3 | acm-10-05 | lift | lift-shaft | 780 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · lift | Rétablir l’ascenseur | power | 1060 / 0.62 | 2 s | Aucune

#### Mobilier

acm-10-02-p0 | Générateur | 300 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

acm-10-02-p1 | Pompe verticale | 570 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-10-02-p2 | Baie réseau | 840 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-10-02-p3 | Pompe verticale | 1110 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-10-02-p4 | Armoire de consommables | 1275 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

#### Rencontres

acm-10-02-e0 | Facehugger | 760 / 0.62 | 0 s

acm-10-02-e1 | Lurker | 1050 / 0.62 | 0 s

### Terrasse des batteries — acm-10-03

Largeur 2100, niveau 0, fonction antiair.

#### Portes

S1 | acm-10-02 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-10-05 | lift | lift-shaft | 1092 / 0.16 | 0 → 1 | Libre

S3 | acm-10-06 | door | exterior-passage | 2012 / 0.62 | 0 → 0 | lift, aa-a, aa-b, aa-c

S4 | acm-10-ref-aa-cache | door | exterior-passage | 1323 / 0.16 | 0 → 0 | Libre

#### Actions

A1 · aa-a | Saboter la batterie 01 | charge | 560 / 0.22 | 2.2 s | Aucune

A2 · aa-b | Saboter la batterie 02 | charge | 1070 / 0.84 | 2.2 s | Aucune

A3 · aa-c | Saboter la batterie 03 | charge | 1630 / 0.22 | 2.2 s | Aucune

#### Mobilier

acm-10-03-p0 | Caisse de transport | 462 / 0.22 | 94 × 0.13 × 72 | Décor | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil.

acm-10-03-p1 | Balise de chantier | 840 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-10-03-p2 | Caisse de transport | 1428 / 0.83 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-10-03-p3 | Garde-corps | 1785 / 0.93 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-10-03-p4 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-03-p5 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-03-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-03-p7 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-03-p8 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-10-03-e0 | Soldat Weyland-Yutani | 880 / 0.65 | 0 s

acm-10-03-e1 | Soldat Weyland-Yutani | 1190 / 0.28 | 0 s

acm-10-03-e2 | Soldat Weyland-Yutani | 1510 / 0.82 | 6 s

### Rampe du transport — acm-10-04

Largeur 1800, niveau 0, fonction flight.

#### Portes

S1 | acm-10-07 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · ramp | Abaisser la rampe du transport | power | 1480 / 0.22 | 1.8 s | Aucune

A2 · extract | Rejoindre l’équipe | exit | 1705 / 0.62 | 0.7 s | Aucune

A3 · survivor-delivered | Accompagner le blessé jusqu’à la rampe | escort_deliver | 1130 / 0.66 | 1.1 s | rescue-extract

#### Mobilier

acm-10-04-p0 | Manifold de carburant | 396 / 0.13 | 84 × 0.1 × 96 | Décor | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette.

acm-10-04-p1 | Caisse de transport | 774 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-10-04-p2 | Palette de fret | 1080 / 0.17 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-10-04-p3 | Garde-corps | 1386 / 0.91 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

acm-10-04-p4 | Balise de chantier | 1458 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-10-04-p5 | Conduit de service | 680 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

acm-10-04-e0 | Soldier | 880 / 0.65 | 0 s

acm-10-04-e1 | Spitter | 1190 / 0.28 | 0 s

acm-10-04-e2 | Soldier | 1470 / 0.84 | 6 s

### Cabine d’examen — acm-10-05

Largeur 1180, niveau 1, fonction medical.

#### Portes

S1 | acm-10-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | acm-10-03 | lift | lift-shaft | 1092 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-9 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-10-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-10-05-p0 | Lit de soins | 271 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-10-05-p1 | Lit de soins | 543 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

acm-10-05-p2 | Armoire de consommables | 802 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

acm-10-05-p3 | Poste médical | 956 / 0.13 | 105 × 0.12 × 94 | Décor | Soin et munitions à usage unique par visite de campagne.

acm-10-05-p4 | Corps au sol | 460 / 0.32 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

acm-10-05-p5 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-9.

acm-10-05-p6 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-10-05.

#### Rencontres

### Dropship abattu — acm-10-06

Largeur 2460, niveau 0, fonction crash.

#### Portes

S1 | acm-10-03 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-10-07 | door | exterior-passage | 2372 / 0.62 | 0 → 0 | lift, aa-a, aa-b, aa-c, rescue-stabilize, rescue-extract

#### Actions

A1 · rescue-stabilize | Stabiliser le blessé sous l’aile | rescue_start | 520 / 0.65 | 1.4 s | Aucune

A2 · rescue-extract | Rassembler le blessé pour le départ | rescue_end | 550 / 0.65 | 0.9 s | Aucune

A3 · supply-survivors | Ouvrir la trousse du dropship | supply | 290 / 0.3 | 0.8 s | Aucune

#### Mobilier

acm-10-06-p0 | Fragment de dropship | 713 / 0.13 | 380 × 0.18 × 145 | Solide | Épave fixe en rive ; blessé placé dans l’espace protégé.

acm-10-06-p1 | Débris structurels | 1107 / 0.84 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-10-06-p2 | Caisse de transport | 1353 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-10-06-p3 | Balise de chantier | 1599 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-10-06-p4 | Débris structurels | 2017 / 0.85 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

acm-10-06-p5 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-06-p6 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-06-p7 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-10-06-p8 | Poste médical | 520 / 0.65 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction rescue-stabilize.

acm-10-06-p9 | Poste médical | 290 / 0.3 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-survivors.

#### Rencontres

acm-10-06-e0 | Soldier | 1680 / 0.3 | 0 s

acm-10-06-e1 | Soldier | 1790 / 0.83 | 8 s

acm-10-06-e2 | Spitter | 2170 / 0.24 | 15 s

acm-10-06-e3 | Soldier | 2260 / 0.62 | 22 s

### Drain de l’aire d’embarquement — acm-10-07

Largeur 1560, niveau 0, fonction drain.

#### Portes

S1 | acm-10-06 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-10-04 | door | bulkhead | 1472 / 0.62 | 0 → 0 | lift, aa-a, aa-b, aa-c, rescue-stabilize, rescue-extract, rescue-route

#### Actions

A1 · rescue-route | Déverrouiller le passage vers la rampe | power | 1170 / 0.62 | 1.2 s | Aucune

#### Mobilier

acm-10-07-p0 | Pompe verticale | 343 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

acm-10-07-p1 | Nappe de résine | 671 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

acm-10-07-p2 | Conduit de service | 983 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-10-07-p3 | Pompe verticale | 1295 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

#### Rencontres

### Conteneur de munitions antiaériennes — acm-10-ref-aa-cache

Largeur 1480, niveau 0, fonction warehouse.

#### Portes

S1 | acm-10-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · weapon-m5 | Récupérer M5 RPG · Lance-roquettes | weapon | 520 / 0.62 | 0.8 s | Aucune

A2 · weapon-frost | Récupérer M240 · Incinérateur de Frost | weapon | 790 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-10-ref-aa-cache-p0 | Râtelier militaire | 400.0 / 0.14 | 126 × 0.1 × 135 | Décor | Mobilier de fonction, hors des seuils.

acm-10-ref-aa-cache-p1 | Caisse de transport | 626.6666666666666 / 0.86 | 94 × 0.13 × 72 | Solide | Mobilier de fonction, hors des seuils.

acm-10-ref-aa-cache-p2 | Vestiaire | 853.3333333333333 / 0.14 | 90 × 0.1 × 150 | Décor | Mobilier de fonction, hors des seuils.

acm-10-ref-aa-cache-p3 | Palette de fret | 1080.0 / 0.86 | 140 × 0.12 × 22 | Décor | Mobilier de fonction, hors des seuils.

acm-10-ref-aa-cache-pickup-m5 | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme m5

acm-10-ref-aa-cache-pickup-frost | Râtelier militaire | 790 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme frost

#### Rencontres

## 11 — Home

La Reine est dans la soute. Les balles ne suffisent pas. Réarmez les quatre commandes du convoyeur, puis attirez-la dans l’axe de la catapulte.

Objectifs : reset-a, reset-b, reset-c, reset-d

### Soute du convoyeur — acm-11-01

Largeur 2460, niveau 0, fonction conveyor.

#### Portes

S1 | acm-11-02 | door | bulkhead | 140 / 0.08 | 0 → 0 | Libre

S2 | acm-11-03 | door | bulkhead | 820 / 0.16 | 0 → 0 | Libre

S3 | acm-11-04 | door | bulkhead | 1880 / 0.16 | 0 → 0 | Libre

#### Actions

A1 · reset-a | Réarmer la commande 01 | power | 520 / 0.2 | 1.6 s | Aucune

A2 · reset-b | Réarmer la commande 02 | power | 1030 / 0.86 | 1.6 s | Aucune

A3 · reset-c | Réarmer la commande 03 | power | 1570 / 0.2 | 1.6 s | Aucune

A4 · reset-d | Réarmer la commande 04 | power | 2020 / 0.86 | 1.6 s | Aucune

A5 · catapult | Déclencher la catapulte | catapult | 2200 / 0.56 | 1 s | Aucune

A6 · supply-acm-11-01 | Prendre les fournitures | supply | 360 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-11-01-p0 | Caisse de transport | 615 / 0.22 | 94 × 0.13 × 72 | Décor | Couverture basse ; passage conservé sur un autre plan. Volume de collision retiré : dégagement du poste ou du seuil.

acm-11-01-p1 | Râtelier militaire | 984 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-11-01-p2 | Caisse de transport | 1402 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-01-p3 | Balise de chantier | 1771 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-11-01-p4 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-11-01-p5 | Conduit de service | 1500 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-11-01-p6 | Poste médical | 360 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-11-01.

#### Rencontres

acm-11-01-e0 | Reine | 1450 / 0.55 | 0 s

### Coursive bâbord — acm-11-02

Largeur 1500, niveau 0, fonction cargo.

#### Portes

S1 | acm-11-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-11-05 | lift | lift-shaft | 1412 / 0.62 | 0 → 1 | Libre

#### Actions

#### Mobilier

acm-11-02-p0 | Caisse de transport | 360 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-02-p1 | Caisse de transport | 690 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-02-p2 | Palette de fret | 900 / 0.17 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-11-02-p3 | Caisse de transport | 1020 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-02-p4 | Crochet de manutention | 1260 / 0.13 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-11-02-p5 | Conduit de service | 570 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-11-02-p6 | Balise de chantier | 1230 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

#### Rencontres

### Coursive tribord — acm-11-03

Largeur 2100, niveau 0, fonction cargo.

#### Portes

S1 | acm-11-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

#### Mobilier

acm-11-03-p0 | Caisse de transport | 504 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-03-p1 | Caisse de transport | 966 / 0.84 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-03-p2 | Palette de fret | 1260 / 0.17 | 140 × 0.12 × 22 | Décor | Socle de chargement ; ne sert pas de barrière invisible.

acm-11-03-p3 | Caisse de transport | 1428 / 0.23 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

acm-11-03-p4 | Crochet de manutention | 1764 / 0.13 | 120 × 0.1 × 155 | Décor | Équipement du portique, établi près du poste de maintenance.

acm-11-03-p5 | Conduit de service | 798 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

acm-11-03-p6 | Balise de chantier | 1722 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

acm-11-03-p7 | Conduit de service | 270 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-11-03-p8 | Conduit de service | 1090 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

acm-11-03-p9 | Conduit de service | 1910 / 0.1 | 95 × 0.1 × 50 | Décor | Infrastructure continue sur la paroi porteuse.

#### Rencontres

### Vestibule du pont — acm-11-04

Largeur 1800, niveau 0, fonction bridge.

#### Portes

S1 | acm-11-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | acm-11-ref-bridge | lift | lift-shaft | 1134 / 0.16 | 0 → 1 | Libre

#### Actions

#### Mobilier

acm-11-04-p0 | Pupitre de commande | 360 / 0.14 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-11-04-p1 | Pupitre de commande | 720 / 0.14 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

acm-11-04-p2 | Siège de poste | 774 / 0.35 | 51 × 0.1 × 64 | Décor | Face à un bureau ou une console.

acm-11-04-p3 | Baie réseau | 1370 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

acm-11-04-p4 | Bureau de dossier | 1386 / 0.84 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

acm-11-04-p5 | Conduit de service | 1494 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

#### Rencontres

### Réserve de chargement — acm-11-05

Largeur 1180, niveau 1, fonction locker.

#### Portes

S1 | acm-11-02 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · archive-10 | Récupérer le dossier | archive | 660 / 0.62 | 0.8 s | Aucune

A2 · supply-acm-11-05 | Prendre les fournitures | supply | 850 / 0.62 | 0.8 s | Aucune

A3 · weapon-ripley | Récupérer Assemblage M41A / M240 de Ripley | weapon | 520 / 0.62 | 0.8 s | Aucune

#### Mobilier

acm-11-05-p0 | Vestiaire | 248 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

acm-11-05-p1 | Vestiaire | 484 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

acm-11-05-p2 | Banc de service | 767 / 0.12 | 128 × 0.12 × 50 | Fragile | Mobilier en rive de salle, passage arrière maintenu.

acm-11-05-p3 | Râtelier militaire | 991 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

acm-11-05-p4 | Enregistreur de terrain | 660 / 0.62 | 40 × 0.06 × 55 | Décor | Support visuel de l’interaction archive-10.

acm-11-05-p5 | Poste médical | 850 / 0.62 | 105 × 0.12 × 94 | Décor | Support visuel de l’interaction supply-acm-11-05.

acm-11-05-pickup-ripley | Râtelier militaire | 520 / 0.18 | 126 × 0.1 × 135 | Décor | Râtelier de l’arme ripley

#### Rencontres

### Pont du transport — dossier Weyland — acm-11-ref-bridge

Largeur 1960, niveau 1, fonction bridge.

#### Portes

S1 | acm-11-04 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · ref-weyland | Consulter le dossier de commandement | record | 1196 / 0.5 | 1.4 s | Aucune

#### Mobilier

acm-11-ref-bridge-p0 | Pupitre de commande | 400.0 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

acm-11-ref-bridge-p1 | Baie réseau | 786.6666666666667 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

acm-11-ref-bridge-p2 | Armoire de consommables | 1173.3333333333335 / 0.14 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

acm-11-ref-bridge-p3 | Pompe verticale | 1560.0 / 0.86 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

## 12 — Asylum

Le Legato a changé de cap. Lisbeth sort de l’hypersommeil dans une section isolée. Coupez la ventilation d’urgence, atteignez la sécurité et retrouvez un passage vers Stone.

Objectifs : stasis-wake, stasis-air, stasis-kit, stasis-meet

### Hypersommeil du Legato — stasis-01-01

Largeur 1780, niveau 0, fonction cryo.

#### Portes

S1 | stasis-01-02 | door | bulkhead | 1692 / 0.62 | 0 → 0 | stasis-wake

#### Actions

A1 · stasis-wake | Ouvrir le verrou de réveil | power | 1380 / 0.62 | 1 s | Aucune

A2 · supply-stasis-01-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-01-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-01-01-p0 | Caisson de stase | 303 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

stasis-01-01-p1 | Caisson de stase | 676 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

stasis-01-01-p2 | Caisson de stase | 1086 / 0.14 | 155 × 0.14 × 85 | Solide | Équipement de repos ; couloir de maintenance dégagé.

stasis-01-01-p3 | Caisson de stase | 1424 / 0.85 | 155 × 0.14 × 85 | Décor | Équipement de repos ; couloir de maintenance dégagé.

stasis-01-01-p4 | Corps au sol | 961 / 0.34 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

stasis-01-01-p5 | Nappe de résine | 1282 / 0.12 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

stasis-01-01-p6 | Conduit de service | 1566 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-01-01-p7 | Cryocouchette ouverte | 587 / 0.17 | 170 × 0.18 × 66 | Solide | Capot relevé et accès latéral pour le réveil de Lisbeth.

stasis-01-01-p8 | Cryocouchette ouverte | 1193 / 0.85 | 170 × 0.18 × 66 | Décor | Capot relevé et accès latéral pour le réveil de Lisbeth.

stasis-01-01-p9 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-01-01

stasis-01-01-p10 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-01-01

#### Rencontres

### Coursive sous surveillance — stasis-01-02

Largeur 2050, niveau 0, fonction security.

#### Portes

S1 | stasis-01-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-01-03 | door | bulkhead | 1170 / 0.16 | 0 → 0 | stasis-wake, stasis-air

S3 | stasis-01-04 | stairs | stairwell | 520 / 0.16 | 0 → 1 | Libre

S4 | stasis-01-05 | door | bulkhead | 1962 / 0.62 | 0 → 0 | stasis-wake, stasis-air, stasis-kit

#### Actions

A1 · stasis-air | Couper la ventilation d’urgence | power | 1540 / 0.81 | 1.4 s | stasis-wake

#### Mobilier

stasis-01-02-p0 | Baie réseau | 290 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-01-02-p1 | Pupitre de commande | 800 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-01-02-p2 | Râtelier militaire | 1168 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

stasis-01-02-p3 | Caisse de transport | 1640 / 0.86 | 94 × 0.13 × 72 | Décor | Couverture basse ; passage conservé sur un autre plan.

stasis-01-02-p4 | Conduit de service | 1742 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-01-02-p5 | Cloison de confinement | 1086 / 0.12 | 90 × 0.08 × 196 | Décor | Porte process représentée dans la paroi porteuse.

stasis-01-02-p6 | Extracteur mural | 1620 / 0.12 | 126 × 0.06 × 110 | Décor | Point d’aspiration au fond ; la circulation reste libre.

#### Rencontres

stasis-01-02-e0 | Soldat Weyland-Yutani | 970 / 0.28 | 0 s

### Réserve de sécurité — stasis-01-03

Largeur 1330, niveau 0, fonction locker.

#### Portes

S1 | stasis-01-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-01-04 | stairs | stairwell | 760 / 0.62 | 0 → 1 | Libre

S3 | stasis-01-05 | door | bulkhead | 1242 / 0.62 | 0 → 0 | stasis-wake, stasis-air, stasis-kit

#### Actions

A1 · stasis-kit | Prendre le matériel de Stone | gear | 510 / 0.62 | 1.1 s | stasis-air

#### Mobilier

stasis-01-03-p0 | Vestiaire | 279 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

stasis-01-03-p1 | Vestiaire | 545 / 0.12 | 90 × 0.1 × 150 | Décor | Rangement contre le mur, hors de la circulation.

stasis-01-03-p2 | Banc de service | 864 / 0.12 | 128 × 0.12 × 50 | Fragile | Mobilier en rive de salle, passage arrière maintenu.

stasis-01-03-p3 | Râtelier militaire | 1117 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

#### Rencontres

### Extraction d’air — stasis-01-04

Largeur 1660, niveau 1, fonction generator.

#### Portes

S1 | stasis-01-02 | stairs | stairwell | 88 / 0.62 | 1 → 0 | Libre

S2 | stasis-01-03 | stairs | stairwell | 1572 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · supply-stasis-01-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A2 · archive-stasis-01-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-01-04-p0 | Générateur | 332 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

stasis-01-04-p1 | Pompe verticale | 631 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-01-04-p2 | Baie réseau | 930 / 0.13 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-01-04-p3 | Pompe verticale | 1228 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-01-04-p4 | Armoire de consommables | 1411 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

stasis-01-04-p5 | Extracteur mural | 498 / 0.12 | 126 × 0.06 × 110 | Décor | Point d’aspiration au fond ; la circulation reste libre.

stasis-01-04-p6 | Extracteur mural | 1079 / 0.12 | 126 × 0.06 × 110 | Décor | Point d’aspiration au fond ; la circulation reste libre.

stasis-01-04-p7 | Valise d’évacuation | 470 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-01-04

stasis-01-04-p8 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-01-04

#### Rencontres

### Jonction avec Stone — stasis-01-05

Largeur 1930, niveau 0, fonction airlock.

#### Portes

S1 | stasis-01-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-01-02 | door | bulkhead | 1842 / 0.62 | 0 → 0 | Libre

S3 | stasis-01-ref-parents | door | bulkhead | 1216 / 0.16 | 0 → 0 | stasis-meet

#### Actions

A1 · stasis-meet | Établir la liaison avec Stone | power | 1490 / 0.3 | 1.3 s | stasis-kit

A2 · supply-stasis-01-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 1830 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-01-05-p0 | Conduit de service | 444 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-01-05-p1 | Pupitre de commande | 849 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-01-05-p2 | Pompe verticale | 1370 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-01-05-p3 | Balise de chantier | 1621 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-01-05-p4 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-01-05

#### Rencontres

stasis-01-05-e0 | Soldier | 1190 / 0.52 | 0 s

### Hypersommeil familial du Legato — stasis-01-ref-parents

Largeur 1980, niveau 0, fonction parents.

#### Portes

S1 | stasis-01-05 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-01-ref-reactor | door | bulkhead | 1892 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · ref-parents | Consulter les moniteurs des cryocouches | record | 1208 / 0.5 | 1.4 s | Aucune

#### Mobilier

stasis-01-ref-parents-p0 | Cryocouchette ouverte | 400.0 / 0.14 | 170 × 0.18 × 66 | Solide | Mobilier de fonction, hors des seuils.

stasis-01-ref-parents-p1 | Cryocouchette ouverte | 793.3333333333333 / 0.86 | 170 × 0.18 × 66 | Solide | Mobilier de fonction, hors des seuils.

stasis-01-ref-parents-p2 | Lit de soins | 1186.6666666666665 / 0.14 | 155 × 0.14 × 63 | Solide | Mobilier de fonction, hors des seuils.

stasis-01-ref-parents-p3 | Corps au sol | 1580.0 / 0.86 | 100 × 0.09 × 27 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

### Ingénierie du Legato — commande générale — stasis-01-ref-reactor

Largeur 1890, niveau 0, fonction engineering.

#### Portes

S1 | stasis-01-ref-parents | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · ref-legato-system | Examiner la commande d’autodestruction | record | 1153 / 0.5 | 1.4 s | Aucune

#### Mobilier

stasis-01-ref-reactor-p0 | Générateur | 400.0 / 0.14 | 140 × 0.12 × 104 | Solide | Mobilier de fonction, hors des seuils.

stasis-01-ref-reactor-p1 | Pompe verticale | 763.3333333333333 / 0.86 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

stasis-01-ref-reactor-p2 | Échangeur de toiture | 1126.6666666666665 / 0.14 | 165 × 0.18 × 116 | Solide | Mobilier de fonction, hors des seuils.

stasis-01-ref-reactor-p3 | Enrouleur industriel | 1490.0 / 0.86 | 87 × 0.13 × 71 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

## 13 — Awakening

Stone progresse à bord du Sulaco avec Hicks. Les archives relient le départ du skiff à l’arrivée sur Fiorina 161 ; les scènes intermédiaires restent condensées.

Objectifs : stasis-feed, stasis-manifest, lisbeth-rally, lisbeth-safe

### Atelier de liaison — stasis-02-01

Largeur 1740, niveau 0, fonction workshop.

#### Portes

S1 | stasis-02-02 | door | bulkhead | 1652 / 0.62 | 0 → 0 | stasis-feed

S2 | stasis-02-ref-cryo | door | bulkhead | 1096 / 0.16 | 0 → 0 | stasis-feed

#### Actions

A1 · stasis-feed | Rétablir le réseau de liaison | power | 1340 / 0.27 | 1.5 s | Aucune

A2 · supply-stasis-02-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-02-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-02-01-p0 | Bureau de dossier | 418 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

stasis-02-01-p1 | Râtelier militaire | 818 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

stasis-02-01-p2 | Générateur | 1280 / 0.13 | 140 × 0.12 × 104 | Décor | Machine fixe ; commande déportée accessible.

stasis-02-01-p3 | Caisse de transport | 1427 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

stasis-02-01-p4 | Conduit de service | 1496 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-02-01-p5 | Balise de chantier | 557 / 0.86 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-02-01-p6 | Enrouleur industriel | 1166 / 0.84 | 87 × 0.13 × 71 | Décor | Alimentation d’une zone provisoire de recherche.

stasis-02-01-p7 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-02-01

stasis-02-01-p8 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-02-01

#### Rencontres

### Passage de coque — stasis-02-02

Largeur 2280, niveau 0, fonction damaged.

#### Portes

S1 | stasis-02-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-02-03 | door | bulkhead | 2192 / 0.62 | 0 → 0 | stasis-feed

S3 | stasis-02-04 | stairs | stairwell | 910 / 0.62 | 0 → 1 | Libre

#### Actions

#### Mobilier

stasis-02-02-p0 | Débris structurels | 456 / 0.13 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

stasis-02-02-p1 | Conduit de service | 866 / 0.11 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-02-02-p2 | Débris structurels | 1186 / 0.84 | 105 × 0.12 × 43 | Décor | Au pied de la rupture de coque, pas au hasard.

stasis-02-02-p3 | Corps au sol | 1414 / 0.3 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

stasis-02-02-p4 | Nappe de résine | 1778 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

stasis-02-02-p5 | Balise de chantier | 1938 / 0.84 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

#### Rencontres

stasis-02-02-e0 | Soldat Weyland-Yutani | 940 / 0.62 | 0 s

stasis-02-02-e1 | Soldier | 1770 / 0.62 | 9 s

### Contrôle du manifeste — stasis-02-03

Largeur 1780, niveau 0, fonction office.

#### Portes

S1 | stasis-02-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-02-05 | door | bulkhead | 1692 / 0.62 | 0 → 0 | stasis-feed, stasis-manifest, lisbeth-rally

S3 | stasis-02-04 | stairs | stairwell | 670 / 0.16 | 0 → 1 | Libre

#### Actions

A1 · stasis-manifest | Copier l’ordre de transfert | power | 1190 / 0.3 | 1.8 s | Aucune

A2 · lisbeth-rally | Demander à Hicks de suivre | escort_start | 590 / 0.62 | 1 s | stasis-manifest

#### Mobilier

stasis-02-03-p0 | Bureau de dossier | 392 / 0.13 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

stasis-02-03-p1 | Siège de poste | 445 / 0.34 | 51 × 0.1 × 64 | Décor | Face à un bureau ou une console.

stasis-02-03-p2 | Armoire de consommables | 783 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

stasis-02-03-p3 | Bureau de dossier | 1104 / 0.84 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

stasis-02-03-p4 | Baie réseau | 1460 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-02-03-p5 | Station de transmission | 1139 / 0.14 | 95 × 0.12 × 148 | Décor | Borne à garder à portée pendant la copie des preuves.

#### Rencontres

stasis-02-03-e0 | Soldat Weyland-Yutani | 1370 / 0.73 | 0 s

### Poste sanitaire — stasis-02-04

Largeur 1380, niveau 1, fonction medical.

#### Portes

S1 | stasis-02-02 | stairs | stairwell | 88 / 0.62 | 1 → 0 | Libre

S2 | stasis-02-03 | stairs | stairwell | 1292 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · supply-stasis-02-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A2 · archive-stasis-02-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-02-04-p0 | Lit de soins | 317 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

stasis-02-04-p1 | Lit de soins | 635 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

stasis-02-04-p2 | Armoire de consommables | 938 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

stasis-02-04-p3 | Poste médical | 1118 / 0.13 | 105 × 0.12 × 94 | Décor | Soin et munitions à usage unique par visite de campagne.

stasis-02-04-p4 | Corps au sol | 538 / 0.32 | 100 × 0.09 × 27 | Décor | Trace narrative placée hors des interactions de porte.

stasis-02-04-p5 | Valise d’évacuation | 470 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-02-04

stasis-02-04-p6 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-02-04

#### Rencontres

### Sas de regroupement — stasis-02-05

Largeur 2100, niveau 0, fonction airlock.

#### Portes

S1 | stasis-02-03 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-02-ref-skiff | door | bulkhead | 1323 / 0.16 | 0 → 0 | lisbeth-safe

#### Actions

A1 · lisbeth-safe | Conduire Hicks au sas sécurisé | escort_deliver | 1710 / 0.74 | 1 s | lisbeth-rally

A2 · supply-stasis-02-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 2000 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-02-05-p0 | Conduit de service | 483 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-02-05-p1 | Pupitre de commande | 924 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-02-05-p2 | Pompe verticale | 1550 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-02-05-p3 | Balise de chantier | 1764 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-02-05-p4 | Balise d’extraction | 1701 / 0.77 | 59 × 0.08 × 98 | Décor | Destination lumineuse de l’escorte, jamais un simple dossier.

stasis-02-05-p5 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-02-05

#### Rencontres

stasis-02-05-e0 | Lurker | 1490 / 0.43 | 0 s

### Cryostase du Sulaco — EEV — stasis-02-ref-cryo

Largeur 2050, niveau 0, fonction cryo.

#### Portes

S1 | stasis-02-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · ref-eev | Consulter l’état du module de survie | record | 1250 / 0.5 | 1.4 s | Aucune

#### Mobilier

stasis-02-ref-cryo-p0 | Pupitre de commande | 400.0 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

stasis-02-ref-cryo-p1 | Baie réseau | 816.6666666666667 / 0.86 | 86 × 0.1 × 172 | Solide | Mobilier de fonction, hors des seuils.

stasis-02-ref-cryo-p2 | Armoire de consommables | 1233.3333333333335 / 0.14 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

stasis-02-ref-cryo-p3 | Pompe verticale | 1650.0 / 0.86 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

### Hangar du skiff de service — stasis-02-ref-skiff

Largeur 2040, niveau 0, fonction skiff.

#### Portes

S1 | stasis-02-05 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-02-ref-fiorina | transit | transport-boarding | 1952 / 0.62 | 0 → 0 | ref-skiff

#### Actions

A1 · ref-skiff | Préparer le registre du skiff | power | 1244 / 0.5 | 1.4 s | Aucune

#### Mobilier

stasis-02-ref-skiff-p0 | Manifold de carburant | 400.0 / 0.14 | 84 × 0.1 × 96 | Décor | Mobilier de fonction, hors des seuils.

stasis-02-ref-skiff-p1 | Crochet de manutention | 813.3333333333333 / 0.86 | 120 × 0.1 × 155 | Décor | Mobilier de fonction, hors des seuils.

stasis-02-ref-skiff-p2 | Râtelier militaire | 1226.6666666666665 / 0.14 | 126 × 0.1 × 135 | Décor | Mobilier de fonction, hors des seuils.

stasis-02-ref-skiff-p3 | Enrouleur industriel | 1640.0 / 0.86 | 87 × 0.13 × 71 | Solide | Mobilier de fonction, hors des seuils.

#### Rencontres

### Fiorina 161 — fonderie — stasis-02-ref-fiorina

Largeur 2300, niveau 0, fonction foundry.

#### Portes

S1 | stasis-02-ref-skiff | transit | transport-boarding | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · ref-fiorina | Consigner l’arrivée à la fonderie | record | 1403 / 0.5 | 1.4 s | Aucune

#### Mobilier

stasis-02-ref-fiorina-p0 | Pompe verticale | 400.0 / 0.14 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

stasis-02-ref-fiorina-p1 | Générateur | 900.0 / 0.86 | 140 × 0.12 × 104 | Solide | Mobilier de fonction, hors des seuils.

stasis-02-ref-fiorina-p2 | Garde-corps | 1400.0 / 0.14 | 165 × 0.04 × 74 | Décor | Mobilier de fonction, hors des seuils.

stasis-02-ref-fiorina-p3 | Extracteur mural | 1900.0 / 0.86 | 126 × 0.06 × 110 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 14 — Deliverance

Levy rompt avec la Compagnie. Il doit copier les dossiers de confinement et conduire Hicks hors du module. La transmission ne progresse qu’à proximité de sa borne.

Objectifs : levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof, hicks-rally, hicks-lab-safe

### Accueil de confinement — stasis-03-01

Largeur 1830, niveau 0, fonction security.

#### Portes

S1 | stasis-03-02 | door | bulkhead | 1742 / 0.62 | 0 → 0 | levy-clearance

S2 | stasis-03-ref-resolute | door | bulkhead | 1153 / 0.16 | 0 → 0 | levy-clearance

#### Actions

A1 · levy-clearance | Utiliser l’habilitation de Levy | power | 1410 / 0.27 | 1.2 s | Aucune

A2 · supply-stasis-03-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-03-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-03-01-p0 | Baie réseau | 366 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-03-01-p1 | Pupitre de commande | 714 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-03-01-p2 | Râtelier militaire | 1043 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

stasis-03-01-p3 | Caisse de transport | 1409 / 0.85 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

stasis-03-01-p4 | Conduit de service | 1556 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-03-01-p5 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-03-01

stasis-03-01-p6 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-03-01

#### Rencontres

### Laboratoire des échantillons — stasis-03-02

Largeur 2280, niveau 0, fonction reactor.

#### Portes

S1 | stasis-03-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-03-03 | door | bulkhead | 2192 / 0.62 | 0 → 0 | levy-clearance, levy-isolate-0, levy-isolate-1

S3 | stasis-03-04 | lift | lift-shaft | 870 / 0.16 | 0 → 1 | levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof

#### Actions

A1 · levy-isolate-0 | Isoler la branche A | power | 680 / 0.34 | 1.3 s | Aucune

A2 · levy-isolate-1 | Isoler la branche B | power | 1660 / 0.76 | 1.3 s | Aucune

#### Mobilier

stasis-03-02-p0 | Générateur | 410 / 0.12 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

stasis-03-02-p1 | Pompe verticale | 650 / 0.13 | 80 × 0.11 × 146 | Décor | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-03-02-p2 | Générateur | 1208 / 0.88 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

stasis-03-02-p3 | Baie réseau | 1664 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-03-02-p4 | Pompe verticale | 1961 / 0.88 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-03-02-p5 | Paillasse de prélèvement | 547 / 0.18 | 150 × 0.13 × 89 | Décor | Poste sec, verrerie et outillage en laboratoire.

stasis-03-02-p6 | Cylindre de confinement | 1163 / 0.15 | 98 × 0.13 × 178 | Solide | Cuve d’observation raccordée au collecteur technique.

stasis-03-02-p7 | Cylindre de confinement | 1820 / 0.86 | 98 × 0.13 × 178 | Décor | Cuve d’observation raccordée au collecteur technique.

#### Rencontres

stasis-03-02-e0 | Facehugger | 1050 / 0.48 | 0 s

stasis-03-02-e1 | Soldat Weyland-Yutani | 1760 / 0.44 | 0 s

### Salle des enregistreurs — stasis-03-03

Largeur 2080, niveau 0, fonction control.

#### Portes

S1 | stasis-03-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-03-04 | lift | lift-shaft | 1992 / 0.62 | 0 → 1 | levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof

#### Actions

A1 · levy-upload | Lancer la copie des dossiers | upload_start | 790 / 0.38 | 1.2 s | Aucune

A2 · levy-proof | Récupérer la copie achevée | upload_end | 790 / 0.38 | 1 s | levy-upload

#### Mobilier

stasis-03-03-p0 | Bureau de dossier | 437 / 0.12 | 138 × 0.12 × 88 | Fragile | Dossiers administratifs hors de la voie de fret.

stasis-03-03-p1 | Pupitre de commande | 832 / 0.12 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-03-03-p2 | Baie réseau | 1310 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-03-03-p3 | Baie réseau | 1706 / 0.12 | 86 × 0.1 × 172 | Solide | Groupe de baies en paroi et accès de maintenance.

stasis-03-03-p4 | Station de transmission | 790 / 0.35 | 95 × 0.12 × 148 | Décor | Borne à garder à portée pendant la copie des preuves.

#### Rencontres

stasis-03-03-e0 | Soldier | 1470 / 0.42 | 2 s

stasis-03-03-e1 | Soldat Weyland-Yutani | 1820 / 0.81 | 11 s

stasis-03-03-e2 | Lurker | 1640 / 0.28 | 19 s

### Galerie du détenu — stasis-03-04

Largeur 1880, niveau 1, fonction cell.

#### Portes

S1 | stasis-03-03 | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

S2 | stasis-03-05 | lift | lift-shaft | 1792 / 0.62 | 1 → 0 | levy-clearance, levy-isolate-0, levy-isolate-1, levy-upload, levy-proof, hicks-rally

S3 | stasis-03-02 | lift | lift-shaft | 820 / 0.16 | 1 → 0 | Libre

#### Actions

A1 · hicks-rally | Libérer Hicks et partir ensemble | escort_start | 550 / 0.62 | 1.3 s | levy-proof

A2 · supply-stasis-03-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-03-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-03-04-p0 | Grillage de chantier | 414 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

stasis-03-04-p1 | Lit de soins | 1010 / 0.13 | 155 × 0.14 × 63 | Solide | Tête au moniteur ; couloir latéral de brancard.

stasis-03-04-p2 | Grillage de chantier | 1128 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

stasis-03-04-p3 | Pupitre de commande | 1504 / 0.84 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-03-04-p4 | Paillasse de prélèvement | 1429 / 0.86 | 150 × 0.13 × 89 | Solide | Poste sec, verrerie et outillage en laboratoire.

stasis-03-04-p5 | Valise d’évacuation | 470 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-03-04

stasis-03-04-p6 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-03-04

#### Rencontres

stasis-03-04-e0 | Soldat Weyland-Yutani | 1340 / 0.34 | 0 s

### Décontamination de sortie — stasis-03-05

Largeur 2160, niveau 0, fonction airlock.

#### Portes

S1 | stasis-03-04 | lift | lift-shaft | 88 / 0.62 | 0 → 1 | Libre

#### Actions

A1 · hicks-lab-safe | Faire passer Hicks en zone sûre | escort_deliver | 1750 / 0.73 | 1.2 s | hicks-rally

A2 · supply-stasis-03-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 2060 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-03-05-p0 | Conduit de service | 497 / 0.12 | 95 × 0.1 × 50 | Décor | Point d’entrée visible des créatures.

stasis-03-05-p1 | Pupitre de commande | 950 / 0.13 | 100 × 0.1 × 85 | Décor | Interface à proximité du réseau qu’elle commande.

stasis-03-05-p2 | Pompe verticale | 1404 / 0.12 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-03-05-p3 | Balise de chantier | 1814 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-03-05-p4 | Douche de décontamination | 648 / 0.13 | 108 × 0.12 × 194 | Décor | Portique de traitement du sas et point de raccord sanitaire.

stasis-03-05-p5 | Balise d’extraction | 1728 / 0.74 | 59 × 0.08 × 98 | Décor | Destination lumineuse de l’escorte, jamais un simple dossier.

stasis-03-05-p6 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-03-05

#### Rencontres

stasis-03-05-e0 | Soldier | 1450 / 0.45 | 0 s

### Résolute — salle d’interrogatoire — stasis-03-ref-resolute

Largeur 1840, niveau 0, fonction interrogation.

#### Portes

S1 | stasis-03-01 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

#### Actions

A1 · ref-resolute | Consigner la détention de Hicks et Stone | record | 1122 / 0.5 | 1.4 s | Aucune

#### Mobilier

stasis-03-ref-resolute-p0 | Siège de poste | 400.0 / 0.14 | 51 × 0.1 × 64 | Décor | Mobilier de fonction, hors des seuils.

stasis-03-ref-resolute-p1 | Paillasse de prélèvement | 746.6666666666667 / 0.86 | 150 × 0.13 × 89 | Solide | Mobilier de fonction, hors des seuils.

stasis-03-ref-resolute-p2 | Pupitre de commande | 1093.3333333333335 / 0.14 | 100 × 0.1 × 85 | Décor | Mobilier de fonction, hors des seuils.

stasis-03-ref-resolute-p3 | Armoire de consommables | 1440.0 / 0.86 | 87 × 0.1 × 137 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres

## 15 — Redemption

Rejoignez le relais extérieur. Les preuves doivent être transmises depuis une zone exposée avant de conduire Hicks au point de départ.

Objectifs : hicks-depart, stasis-relay-power, hicks-signal, hicks-signal-confirm, hicks-final-safe, ref-gas-0, ref-gas-1, ref-gas-2

### Abri sous l’épave — stasis-04-01

Largeur 1920, niveau 0, fonction derelict.

#### Portes

S1 | stasis-04-02 | door | bulkhead | 1832 / 0.62 | 0 → 0 | hicks-depart

#### Actions

A1 · hicks-depart | Repartir avec Hicks | escort_start | 530 / 0.62 | 1.2 s | Aucune

A2 · supply-stasis-04-01 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · archive-stasis-04-01 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-04-01-p0 | Nappe de résine | 365 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

stasis-04-01-p1 | Œuf ouvert | 634 / 0.22 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

stasis-04-01-p2 | Nappe de résine | 960 / 0.86 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

stasis-04-01-p3 | Œuf ouvert | 1229 / 0.84 | 44 × 0.08 × 50 | Décor | Trace de contamination, distincte des ennemis mobiles.

stasis-04-01-p4 | Nappe de résine | 1536 / 0.13 | 120 × 0.1 × 125 | Décor | Infestation sur support architectural existant.

stasis-04-01-p5 | Balise de chantier | 1651 / 0.85 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-04-01-p6 | Cylindre de confinement | 672 / 0.18 | 98 × 0.13 × 178 | Solide | Cuve d’observation raccordée au collecteur technique.

stasis-04-01-p7 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-04-01

stasis-04-01-p8 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-04-01

#### Rencontres

### Tranchée des câbles — stasis-04-02

Largeur 2210, niveau 0, fonction street.

#### Portes

S1 | stasis-04-01 | door | exterior-passage | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-04-04 | door | exterior-passage | 880 / 0.16 | 0 → 0 | Libre

S3 | stasis-04-ref-gas | door | exterior-passage | 2122 / 0.62 | 0 → 0 | hicks-depart, stasis-relay-power

#### Actions

A1 · stasis-relay-power | Rétablir la ligne du relais | power | 1640 / 0.27 | 1.4 s | Aucune

#### Mobilier

stasis-04-02-p0 | Débris structurels | 530 / 0.23 | 105 × 0.12 × 43 | Fragile | Au pied de la rupture de coque, pas au hasard.

stasis-04-02-p1 | Grillage de chantier | 1100 / 0.13 | 170 × 0.07 × 165 | Décor | Séparation industrielle ; aucune clôture au milieu d’un salon.

stasis-04-02-p2 | Caisse de transport | 1304 / 0.86 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

stasis-04-02-p3 | Balise de chantier | 1547 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-04-02-p4 | Grillage de chantier | 1834 / 0.12 | 170 × 0.07 × 165 | Solide | Séparation industrielle ; aucune clôture au milieu d’un salon.

stasis-04-02-p5 | Enrouleur industriel | 650 / 0.13 | 87 × 0.13 × 71 | Décor | Alimentation d’une zone provisoire de recherche.

stasis-04-02-p6 | Enrouleur industriel | 1414 / 0.87 | 87 × 0.13 × 71 | Solide | Alimentation d’une zone provisoire de recherche.

#### Rencontres

stasis-04-02-e0 | Soldier | 1040 / 0.43 | 0 s

stasis-04-02-e1 | Spitter | 1780 / 0.82 | 0 s

### Relais de transmission — stasis-04-03

Largeur 2360, niveau 1, fonction rooftop.

#### Portes

S1 | stasis-04-05 | stairs | stairwell | 2272 / 0.62 | 1 → 0 | hicks-depart, stasis-relay-power, hicks-signal, hicks-signal-confirm

S2 | stasis-04-ref-gas | lift | lift-shaft | 88 / 0.62 | 1 → 0 | Libre

#### Actions

A1 · hicks-signal | Émettre le signal de détresse | upload_start | 850 / 0.39 | 1.3 s | Aucune

A2 · hicks-signal-confirm | Confirmer la transmission | upload_end | 850 / 0.39 | 1 s | hicks-signal

#### Mobilier

stasis-04-03-p0 | Échangeur de toiture | 519 / 0.23 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente.

stasis-04-03-p1 | Pompe verticale | 920 / 0.14 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-04-03-p2 | Échangeur de toiture | 1416 / 0.85 | 165 × 0.18 × 116 | Solide | Machine extérieure sur socle ; conduite adjacente.

stasis-04-03-p3 | Garde-corps | 1794 / 0.92 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

stasis-04-03-p4 | Balise de chantier | 2006 / 0.13 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-04-03-p5 | Station de transmission | 850 / 0.36 | 95 × 0.12 × 148 | Décor | Borne à garder à portée pendant la copie des preuves.

#### Rencontres

stasis-04-03-e0 | Soldier | 1730 / 0.62 | 2 s

stasis-04-03-e1 | Lurker | 1960 / 0.3 | 11 s

stasis-04-03-e2 | Soldat Weyland-Yutani | 2070 / 0.84 | 23 s

### Réserve de chantier — stasis-04-04

Largeur 1320, niveau 0, fonction maintenance.

#### Portes

S1 | stasis-04-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-04-05 | door | bulkhead | 1232 / 0.62 | 0 → 0 | hicks-depart, stasis-relay-power, hicks-signal, hicks-signal-confirm

#### Actions

A1 · supply-stasis-04-04 | Ouvrir la valise de survie | supply | 470 / 0.62 | 0.8 s | Aucune

A2 · archive-stasis-04-04 | Lire le rapport de service | archive | 1110 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-04-04-p0 | Pompe verticale | 317 / 0.13 | 80 × 0.11 × 146 | Solide | Alimentation des conduites en plafond, jamais suspendue dans le vide.

stasis-04-04-p1 | Générateur | 581 / 0.13 | 140 × 0.12 × 104 | Solide | Machine fixe ; commande déportée accessible.

stasis-04-04-p2 | Armoire de consommables | 858 / 0.12 | 87 × 0.1 × 137 | Décor | Médical ou maintenance, jamais sur un seuil.

stasis-04-04-p3 | Râtelier militaire | 1122 / 0.12 | 126 × 0.1 × 135 | Décor | Armes rangées derrière le poste de sécurité.

stasis-04-04-p4 | Valise d’évacuation | 470 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-04-04

stasis-04-04-p5 | Enregistreur de terrain | 1110 / 0.62 | 40 × 0.06 × 55 | Décor | Support persistant de archive-stasis-04-04

#### Rencontres

### Aire de départ — stasis-04-05

Largeur 2390, niveau 0, fonction landing.

#### Portes

S1 | stasis-04-03 | stairs | stairwell | 88 / 0.62 | 0 → 1 | Libre

S2 | stasis-04-04 | door | exterior-passage | 830 / 0.16 | 0 → 0 | Libre

#### Actions

A1 · hicks-final-safe | Accompagner Hicks à la balise | escort_deliver | 1940 / 0.73 | 1.2 s | hicks-signal-confirm

A2 · supply-stasis-04-05 | Ouvrir la valise de survie | supply | 360 / 0.62 | 0.8 s | Aucune

A3 · extract | Rejoindre le point de départ | exit | 2290 / 0.62 | 0.8 s | Aucune

#### Mobilier

stasis-04-05-p0 | Manifold de carburant | 598 / 0.12 | 84 × 0.1 × 96 | Décor | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette.

stasis-04-05-p1 | Manifold de carburant | 1338 / 0.91 | 84 × 0.1 × 96 | Décor | Raccord de ravitaillement ; ne bloque jamais l’accès à la navette.

stasis-04-05-p2 | Caisse de transport | 1076 / 0.22 | 94 × 0.13 × 72 | Fragile | Couverture basse ; passage conservé sur un autre plan.

stasis-04-05-p3 | Garde-corps | 1840 / 0.93 | 165 × 0.04 × 74 | Décor | Bord de passerelle non franchissable hors de la zone de jeu.

stasis-04-05-p4 | Balise de chantier | 2055 / 0.12 | 38 × 0.05 × 122 | Décor | Jalon de parcours et éclairage ponctuel.

stasis-04-05-p5 | Balise d’extraction | 1912 / 0.73 | 59 × 0.08 × 98 | Décor | Destination lumineuse de l’escorte, jamais un simple dossier.

stasis-04-05-p6 | Valise d’évacuation | 360 / 0.62 | 80 × 0.12 × 44 | Décor | Support persistant de supply-stasis-04-05

#### Rencontres

stasis-04-05-e0 | Soldat Weyland-Yutani | 1570 / 0.3 | 0 s

stasis-04-05-e1 | Soldier | 2040 / 0.51 | 6 s

### Traitement des gaz — trois évents — stasis-04-ref-gas

Largeur 2320, niveau 0, fonction gas.

#### Portes

S1 | stasis-04-02 | door | bulkhead | 88 / 0.62 | 0 → 0 | Libre

S2 | stasis-04-03 | lift | lift-shaft | 2232 / 0.62 | 0 → 1 | ref-gas-0, ref-gas-1, ref-gas-2

#### Actions

A1 · ref-gas-0 | Ouvrir l’évent de purge 1 | valve | 600 / 0.69 | 1.4 s | Aucune

A2 · ref-gas-1 | Ouvrir l’évent de purge 2 | valve | 1120 / 0.43 | 1.4 s | Aucune

A3 · ref-gas-2 | Ouvrir l’évent de purge 3 | valve | 1770 / 0.69 | 1.4 s | Aucune

#### Mobilier

stasis-04-ref-gas-p0 | Extracteur mural | 400.0 / 0.14 | 126 × 0.06 × 110 | Décor | Mobilier de fonction, hors des seuils.

stasis-04-ref-gas-p1 | Cylindre de confinement | 906.6666666666667 / 0.86 | 98 × 0.13 × 178 | Solide | Mobilier de fonction, hors des seuils.

stasis-04-ref-gas-p2 | Pompe verticale | 1413.3333333333335 / 0.14 | 80 × 0.11 × 146 | Solide | Mobilier de fonction, hors des seuils.

stasis-04-ref-gas-p3 | Douche de décontamination | 1920.0 / 0.86 | 108 × 0.12 × 194 | Décor | Mobilier de fonction, hors des seuils.

#### Rencontres
