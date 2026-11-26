# PROMETHEUS — Les questions qui restent
## Codex V2 · Les chemins de l’expédition

**2.0.0-candidate.1 · 29 septembre 2026 · module autonome candidat.**

Ce codex est généré à partir des données effectivement utilisées par le jeu livré. Les dimensions sont des unités de gameplay, pas des relevés du tournage. Le socle V1 reste celui des vingt chapitres ; cette V2 approfondit la conduite, les relevés, l’escorte, la séquence de tempête et la lecture des lieux.

| Élément | V1 | V2 |
|---|---|---|
| Chapitres | 20 | 20 |
| Objectifs principaux | 41 | 41 |
| Lieux | 29 | 32 |
| Connexions bidirectionnelles | 32 | 36 |
| Documents | 18 | 24 |
| Placements statiques | 176 | 303 |
| Familles statiques | 36 | 51 |
| Volumes de relevé PUP | 0 | 10 |

Les quinze fiches de distribution héritées ne représentent pas quinze PNJ autonomes. Le compagnon réellement ajouté dans cette version est Holloway pour sa seule séquence de retour.

## Contrôles et fonctionnement

Q/D ou A/D, flèches : gauche/droite. Z/S ou W/S : profondeur dans les lieux adaptés. E : action ou maintien. R maintenu : scanner à main. Espace : esquive à pied / frein au volant. V : monter/descendre du RT01 arrêté. T : déployer/rappeler le PUP. G : Holloway attend/suit. I : instruments. M : plan local. J : journal. F6 : vue latérale/hybride. Échap : pause. F : lance-flammes uniquement pendant la défense du hangar. Enrouleur : E tirer, gauche/droite stabiliser, C relâcher la commande.

## Références et statut

- Base de code : archive locale Prometheus V1 fournie dans cette conversation ; SHA-256 de l’archive V1 : `06b88df944e83324c3ad60b80808d54fe3fa6d7ef17dbdfc24783f84ecdecd4a`. Les sources V2 modifient ce module, pas le dépôt Tantalus.
- Le commit Tantalus `496996f5ea557d970ec625aa346876f3eaed1c5f` est une référence consultée pendant la V1 ; il n’a pas été relu ni modifié pour cette livraison.
- Doctrine héritée de la V1 : vues Aliens V102 et exigences de cohérence spatiale de Resurrection V114. Aucun de leurs nouveaux modules natifs n’est importé dans cette V2.
- Film : https://www.20thcenturystudios.com/movies/prometheus — référence officielle de la prémisse.
- Effets : https://www.wetafx.co.nz/films/filmography/prometheus — MédPod et Trilobite ; pas un plan architectural complet.
- Entretien primaire avec les équipes VFX : https://www.fxguide.com/fxfeatured/prometheus-rebuilding-hallowed-vfx-space/ — PUP, relevés laser et interfaces holographiques. Les contrôles et récompenses de notre système sont propres à cette adaptation.
- Portfolio de production : https://www.behance.net/gallery/21578525/prometheus-concept_orrery — travail de conception de l’orrery. Aucun visuel de ce portfolio n’est embarqué comme asset de jeu.

## Règles de production exécutables ou vérifiables

### Chronologie

**P01.** Conserver les vingt chapitres et le préfixe ordonné des quarante et un objectifs. Les objectifs optionnels ne déplacent pas cette chronologie.

**P02.** Conserver Shaw comme rôle principal et la coupe annoncée vers Janek au hangar. Ni Holloway ni Fifield ne deviennent des ennemis réutilisables en vagues.

**P03.** La rampe, l’alcôve et la galerie sont trois aménagements de jeu. Leur existence et leurs dimensions dans le tournage ne sont pas affirmées.

**P04.** Les six nouveaux documents sont des textes de cette adaptation, pas des citations du film.

**P05.** Le MédPod garde son identité avant et après l’impact. Les accès au Prometheus détruit ne sont pas rouverts par la conduite.

**P06.** Ne pas ajouter de Reine, de ruche de Deacons ou de population de Xénomorphes ordinaires. L’épilogue reste non interactif.

**P07.** Le succès d’un relevé conserve une observation de forme ; il ne transforme pas une hypothèse sur les Ingénieurs en vérité scientifique.

**P08.** Le dispositif de récupération est une séquence de tension adaptée, pas une reproduction de tous les gestes et cadrages du film.

### Lieux et lisibilité

**P09.** Les trente-six liaisons relient chacune deux seuils réciproques. Les positions d’arrivée sont explicites et ne sont pas des boutons de téléportation sur la carte.

**P10.** Onze lieux SIDE gardent une ligne ; onze DEPTH ouvrent l’espace ; neuf HYBRID servent les croisements ; la rampe utilise SETPIECE.

**P11.** Le changement de vue conserve progression et réserves. En latéral, la profondeur effective vaut 0,6 ; c’est une projection de gameplay, pas le même problème d’évitement qu’en profondeur.

**P12.** Les emprises physiques sont les boîtes de données et la coque réelle du RT01 stationné. Une décoration de plafond ne génère jamais une collision automatiquement.

**P13.** La coque du RT01 occupe 244 unités horizontales et 0,21 de profondeur ; les pieds gardent leurs marges de collision.

**P14.** La navigation au sol utilise un graphe de visibilité autour des obstacles, avec des bandes libres. Aucun point aléatoire n’est choisi pour débloquer un compagnon.

**P15.** Une porte fermée n’est traversée ni par Shaw, ni par le suivi de l’Ingénieur, ni par le retour du PUP.

**P16.** Les ombres de contact ne sont pas dessinées sous gaines, panneaux muraux, câbles et décalcomanies. Les pieds et les objets posés gardent leur ancrage.

**P17.** Les 303 placements utilisent 51 familles vectorielles statiques. Le rover, le PUP et Holloway sont des objets dynamiques supplémentaires, pas des atlas finalisés.

**P18.** Le fond couvre le canevas depuis son bord supérieur. Le ciel, les strates, les architectures et le sol ont des coefficients de déplacement séparés.

**P19.** La caméra anticipe la vitesse horizontale du RT01. Le tri des entités reste lié à leur profondeur effective.

**P20.** La carte locale montre les boîtes et seuils de la salle réelle. La carte globale représente un graphe schématique ; aucune des deux n’autorise un déplacement par clic.

### RT01

**P21.** Un unique RT01 persistant remplace le décor de rover du hangar. Il n’est jamais recréé à chaque entrée de pièce.

**P22.** V embarque seulement à proximité, après récupération du matériel, si le châssis et la chronologie autorisent le véhicule.

**P23.** La vitesse maximale nominale est 465 unités/s, abaissée à 355 sous la tempête. Ce sont des réglages de jeu, pas des mesures du véhicule du film.

**P24.** L’accélération est 350 unités/s², la décélération libre 190 et le frein 970. Les sous-pas limitent la traversée d’obstacles en une image.

**P25.** Un contact au sol à vitesse élevée retire six points de châssis. Le véhicule ne franchit pas le rocher pendant la collision.

**P26.** Les cinq lieux de conduite sont hangar, rampe, plaine, crête et entrée. Le sas piéton et les couloirs sont interdits au rover.

**P27.** Une liaison véhicule exige une vitesse horizontale inférieure à 80. Une descente exige moins de 35 et une sortie physiquement libre.

**P28.** Le véhicule immobilisé reste visible et sauvegardé. La campagne peut continuer à pied ; un châssis détruit ne doit pas enfermer Shaw à l’intérieur.

**P29.** Le scanner à main, les documents et les consoles à pied ne sont pas utilisés depuis le siège du véhicule.

**P30.** L’oxygène reste limité ; sa consommation abritée est réduite, pas remplacée par une réserve infinie.

**P31.** La conduite prend fin avant la coupe de rôle et le RT01 est retiré après l’impact narratif. Il n’apparaît pas dans le vaisseau suivant.

### PUP et observations

**P32.** T déploie un seul PUP dans un des dix volumes de relevé. Il faut avoir récupéré le matériel et être à pied.

**P33.** Le PUP visite trois points successifs. Chaque point demande 1,6 seconde de mesure après son arrivée, pas après une simple pression sur T.

**P34.** La vitesse de trajet du PUP est 220 unités/s dans sa métrique. Son déplacement volant n’utilise pas les mêmes collisions de pieds que Shaw.

**P35.** Les lasers sont rattachés au vrai PUP et au point de relevé courant. Le résultat apparaît seulement après la troisième prise.

**P36.** Un rappel incomplet conserve les points déjà mesurés, sans accorder ceux qui manquent.

**P37.** Le retour utilise les portes actuellement ouvertes. Un accès fermé peut le laisser en attente ; il ne traverse pas la carte instantanément.

**P38.** La sauvegarde conserve phase, pièce, position, point, temporisation et relevés. Le chargement ne termine pas automatiquement la mesure en cours.

**P39.** Les instruments distinguent lieu inconnu, relevé incomplet et observation terminée. Une observation terminée n’accorde pas une récompense Tantalus native.

### Escorte et enrouleur

**P40.** Holloway est créé au point d’origine de son retour après l’objectif de seconde expédition, pas au seuil final.

**P41.** G alterne suivi et attente. Le suivi utilise les sols et portes ; le joueur peut prendre de l’avance, mais cela ne valide pas le sas.

**P42.** Le déplacement de Holloway consomme son souffle. Le repos et une assistance proche lui permettent de reprendre, sans produire une guérison scénaristique définitive.

**P43.** Holloway peut monter dans le rover arrêté lorsqu’il est réellement proche. Ses coordonnées restent alors celles du véhicule.

**P44.** Le débarquement de Holloway suit celui de Shaw. Aucun compagnon ne reste marqué à bord d’un véhicule non conduit.

**P45.** La validation de son retour exige la même pièce et une distance de 185 unités pondérées au maximum.

**P46.** L’enrouleur fige les déplacements de Shaw pendant que gauche/droite contrôlent la stabilité. Ce n’est pas un maintien E qui se valide indépendamment du câble.

**P47.** La tension augmente lorsqu’on tire et diminue lorsqu’on relâche. Une surcharge prolongée fait céder du câble et perd une partie du progrès.

**P48.** C relâche la commande dès la pression initiale, même entre deux images. La longueur déjà récupérée est conservée.

**P49.** La capsule est dessinée en fonction du câble récupéré. Le sas ouvert fait partie du décor de la séquence, pas d’une image de concept présentée comme du jeu.

**P50.** Toutes les horloges de la séquence sont suspendues par les menus. Aucun changement de vue en pleine prise de l’enrouleur.

### Sauvegardes et qualification

**P51.** Le schéma et la clé V2 sont séparés de V1. Les autres DLC et le Tantalus natif ne sont ni lus ni modifiés par ce module.

**P52.** Un import V1 conserve ce que V1 enregistrait. Il ne peut conserver un historique de conduite ou de mesures qui n’a jamais été écrit.

**P53.** Un import incohérent est rejeté avant l’affectation du nouvel état. Les drapeaux de récit sont dérivés du préfixe des objectifs.

**P54.** La reprise est en pause, sans touches maintenues, transition caméra ni ancien sous-titre d’une autre scène.

**P55.** Le localStorage natif n’a pas été qualifié ici. L’export/import de fichiers JSON réels a été testé ; ne pas confondre ces deux résultats.

**P56.** Le launcher est une ouverture additive d’Opérations dans un onglet séparé, pas un mixin du moteur natif.

**P57.** L’installateur refuse les destinations existantes et protège les modifications apportées après installation. La V1 ne fait pas l’objet d’une mise à niveau destructive.

**P58.** Les tests ciblés, les parcours du modèle, le navigateur, le packaging et le dépôt natif ont des périmètres distincts. Ne jamais additionner leurs résultats comme une certification globale.

**P59.** Les captures de scènes préparées sont identifiées comme telles. Seul le début décrit dans la recette navigateur a été parcouru sans restauration au clavier.

**P60.** La livraison ne prétend ni à un asset final photoréaliste, ni à une fidélité filmique 1:1, ni à un jeu commercial achevé.

## Campagne : 20 chapitres et 41 objectifs

### 01 — Le réveil

David — Prenez votre temps. Vos muscles n’ont pas encore compris que le voyage est terminé.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Vérifier les constantes | Salle de cryostase | hold | 540 / 0.6 | None |
| Rejoindre David | Coursive des équipages | interact | 780 / 0.55 | None |

`vitals` — Le caisson relève vos constantes. Maintenez E pour terminer le contrôle.

`meetDavid` — David vous attend au carrefour. Le briefing peut commencer.

### 02 — L’invitation

Shaw — Des peuples séparés par des millénaires. Pourtant, ils regardaient tous le même ciel.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Examiner la carte stellaire | Salle de briefing | puzzle | 620 / 0.57 | None |
| Confirmer la zone d’atterrissage | Passerelle | hold | 1010 / 0.56 | landed |

`brief` — Accorder les trois relevés au motif affiché.

`landing` — Janek — Le terrain est dur, mais on peut poser le vaisseau.

### 03 — Première sortie

Vickers — Gardez le contact avec la passerelle. Je ne veux perdre personne avant d’avoir une carte.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Enfiler la combinaison | Vestiaire d’expédition | hold | 570 / 0.56 | suit |
| Vérifier le matériel du RT01 | Hangar des véhicules | interact | 900 / 0.64 | scanner |

`takeSuit` — Étanchéité contrôlée. Réserve d’oxygène prête.

`prepareRover` — L’expédition dispose du scanner, des balises et d’une liaison au vaisseau.

### 04 — Le seuil

Holloway — Cette ligne dans la roche… ce n’est pas de l’érosion.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Relever l’axe du complexe | Plaine d’atterrissage | scan | 660 / 0.55 | None |
| Analyser l’atmosphère intérieure | Vestibule | scan | 720 / 0.6 | None |
| Enregistrer les hologrammes | Couloir des hologrammes | scan | 1000 / 0.6 | holograms |

`surfaceMark` — Une ligne de terrain relie les structures. Le scanner enregistre le repère.

`airCheck` — L’air est différent ici. Gardez le casque fermé tant que les relevés ne sont pas confirmés.

`holoRecord` — Des Ingénieurs fuyaient quelque chose. Il ne reste que leur enregistrement.

### 05 — La chambre de la tête

Shaw — Ce visage… Pourquoi nous ressemble-t-il autant ?

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Documenter la tête monumentale | Chambre de la tête | scan | 900 / 0.6 | None |
| Prélever un relevé des ampoules | Galerie des ampoules | scan | 740 / 0.6 | disturbed |

`headScan` — La statue et les rangées d’ampoules appartiennent au même espace cérémoniel.

`urnScan` — Les ampoules réagissent à l’ouverture de la chambre. David a isolé un échantillon.

### 06 — La tempête

Janek — Le front arrive. Laissez les belles découvertes et rentrez maintenant.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Recevoir l’alerte météo | Entrée du complexe | interact | 1150 / 0.6 | storm |
| Récupérer la capsule avec l’enrouleur | Sas d’expédition | winch | 330 / 0.6 | headRecovered |
| Refermer le sas | Sas d’expédition | hold | 620 / 0.6 | stormEnded |

`weatherAlert` — Le vent se lève. La balise du vaisseau reste visible au scanner.

`tether` — Maintenez E pour ramener la capsule. Q/D ou A/D compensent le vent ; relâchez E si la tension monte.

`seal` — Pression stabilisée. La tempête reste à l’extérieur.

### 07 — Quarantaine

Ford — Je lance l’analyse. Personne ne touche au confinement.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Comparer les signatures biologiques | Laboratoire | puzzle | 520 / 0.6 | None |
| Consigner les premiers symptômes | Infirmerie | interact | 570 / 0.6 | None |

`analyzeHead` — Caler chaque canal sur sa valeur de référence.

`medicalReport` — Le résultat ne suffit pas à expliquer ce qui se passe à bord.

### 08 — Les voix perdues

Janek — Deux balises dans le complexe. Elles bougent, mais pas vers la sortie.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Recouper les dernières positions | Passerelle | puzzle | 610 / 0.56 | None |
| Écouter la dernière transmission | Passerelle | interact | 1090 / 0.55 | lostCrew |

`locateLost` — La liaison contient plusieurs retards. Recouper les trois horloges.

`lastSignal` — Le dernier signal de Millburn et Fifield est interrompu. Le casque transmet encore quelques secondes, puis la liaison se coupe.

### 09 — Le prix de la découverte

Holloway — Ce n’est rien. Je peux encore marcher.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Vérifier l’état de l’expédition | Entrée du complexe | interact | 590 / 0.6 | None |
| Accompagner Holloway au seuil | Sas d’expédition | interact | 870 / 0.6 | hollowayLost |

`secondExpedition` — Holloway ne peut plus continuer. Retour au sas, sans détour.

`hollowayReturn` — Holloway doit rejoindre le même seuil. Restez près de lui ; G lui demande de s’arrêter ou de vous suivre.

### 10 — L’intrusion

Janek — Quelque chose est devant le sas. Ce n’est plus l’homme qui est sorti ce matin.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Repousser Fifield avec le lance-flammes | Hangar des véhicules | combat | 1200 / 0.64 | fifieldDown |
| Sécuriser le hangar | Hangar des véhicules | hold | 1690 / 0.62 | None |

`burnFifield` — F : lance-flammes. Alignez-vous dans sa profondeur, gardez vos distances et laissez refroidir la buse.

`closeHangar` — Le sas tient. L’incursion est terminée.

### 11 — Ce qui grandit

Shaw — Je veux voir le relevé. Maintenant.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Consulter le diagnostic | Infirmerie | scan | 820 / 0.6 | None |
| Activer le MédPod | MédPod | medpod | 590 / 0.6 | surgery |

`diagnosis` — Le scanner détecte une présence anormale. Il faut rejoindre le module autonome.

`medpodCycle` — Rétablir les commandes, verrouiller le capot puis lancer le cycle autonome.

### 12 — Le passager caché

David — Certaines réponses n’étaient pas destinées à tout l’équipage.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Rejoindre Weyland | Module de Vickers | interact | 1030 / 0.55 | weyland |
| Préparer la dernière sortie | Vestiaire d’expédition | interact | 1000 / 0.6 | None |

`weylandReveal` — Weyland n’a pas confié ce voyage à une équipe. Il est venu lui-même.

`leaveOrder` — La même route conduit au complexe. La soute est désormais accessible.

### 13 — Le vaisseau

Janek — Ce n’est pas un sanctuaire. Regardez ce qu’ils entreposent ici.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Identifier la cargaison | Soute du Juggernaut | scan | 920 / 0.61 | None |
| Lire l’orrery | Salle de navigation | puzzle | 940 / 0.63 | navigation |

`holdScan` — Les ampoules sont un chargement, pas de simples offrandes.

`navigation` — Reconstituer l’alignement des trois anneaux.

### 14 — La rencontre

Shaw — Attendez. Il faut lui demander pourquoi.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Approcher le caisson actif | Hypersommeil des Ingénieurs | hold | 1050 / 0.59 | engineerAwake |
| Assister à la rencontre | Salle de navigation | interact | 610 / 0.6 | meeting |

`wakeEngineer` — Un seul Ingénieur est encore vivant. David se prépare à traduire.

`translate` — La rencontre tourne au désastre. La tête de David est arrachée de son corps. Quittez le vaisseau.

### 15 — Destination Terre

Shaw — Janek, ce vaisseau ne doit pas partir.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Sortir du complexe | Entrée du complexe | interact | 630 / 0.62 | None |
| Transmettre l’avertissement | Plaine d’atterrissage | hold | 1570 / 0.6 | collision |

`escapeTemple` — L’Ingénieur prépare le départ. Son objectif n’est pas LV-223.

`warnJanek` — Janek, Chance et Ravel maintiennent le Prometheus sur sa trajectoire.

### 16 — La chute

Janek — Éloignez-vous. Tout ce qui tient encore va retomber.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Quitter l’axe de chute | Crête basaltique | escape | 1190 / 0.88 | impact |
| Rejoindre le champ de débris | Champ de débris | interact | 910 / 0.6 | None |

`evadeWreck` — Gagnez le premier plan et abritez-vous derrière le relief. Ne restez pas sous sa trajectoire.

`reachWreck` — Le Prometheus est détruit. Le module autonome est votre seul abri.

### 17 — Le dernier abri

Shaw — Il reste de l’air. Il faut qu’il en reste.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Localiser l’entrée du module | Extérieur du module de survie | scan | 1090 / 0.6 | None |
| Rétablir l’alimentation du module | Module de Vickers | hold | 1290 / 0.58 | lifeboatAir |

`enterLifeboat` — Le module de Vickers a survécu à l’éjection. Son sas est accessible.

`oxygenSupply` — Pression suffisante. Quelque chose frappe contre la cloison.

### 18 — Le visiteur

David — Shaw… il vient vers vous.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Libérer le Trilobite | MédPod | trap | 310 / 0.6 | trapped |
| Quitter le module | Extérieur du module de survie | interact | 650 / 0.61 | None |

`releaseTrilobite` — Attirez l’Ingénieur jusque dans le module puis ouvrez le confinement. Il n’y a plus de temps pour une autre tentative.

`leaveLifeboat` — Le passage est libre. N’attendez pas la fin du combat.

### 19 — Une autre route

David — Je connais un autre vaisseau. Mais j’aurai besoin de vous.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Récupérer David | Salle de navigation | interact | 760 / 0.62 | davidRecovered |
| Préparer l’autre vaisseau | Second vaisseau | puzzle | 830 / 0.62 | None |

`recoverDavid` — La brèche mène au cockpit endommagé. Shaw emporte David et son savoir.

`newShip` — Ce cockpit appartient à un second vaisseau. Les coordonnées restent à déterminer.

### 20 — Les questions qui restent

Shaw — Nous avons trouvé une route. Pas une réponse.

| Objectif | Lieu | Action | Ancrage x/z | Drapeau |
|---|---|---|---|---|
| Enregistrer la dernière transmission | Second vaisseau | hold | 1240 / 0.57 | departed |

`lastMessage` — Shaw quitte LV-223 avec David. Dans le module abandonné, une autre vie commence.

## Atlas de level design : 32 fiches

Les boîtes de collision ci-dessous sont la vérité au sol. Les props dont `solid` vaut false ne deviennent pas des murs par leur simple apparence. La coque du rover est ajoutée dynamiquement. Les arrivées par seuil restent à 90 unités du seuil de retour ; le RT01 applique en plus sa marge de coque.

### Salle de cryostase — `cryo`

**Zone :** Prometheus · **Vue :** SIDE · **Largeur :** 1380 unités · **Thème :** `cryo`.

Les caissons composent une ligne lisible ; l’allée centrale ne traverse jamais un lit.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Coursive des équipages | 1320/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 11 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| cryo-p00 | pod | 240 | 0.32 | 1 |
| cryo-p01 | pod | 470 | 0.32 | 1 |
| cryo-p02 | pod | 710 | 0.32 | 1 |
| cryo-p03 | pod | 950 | 0.32 | 1 |
| cryo-p04 | console | 1120 | 0.35 | 1 |
| cryo-p05 | cabinet | 130 | 0.9 | 1 |
| cryo-p06 | pipe | 1250 | 0.25 | 1 |
| cryo-v2-07 | duct | 660 | 0.18 | 1.1 |
| cryo-v2-08 | vent | 350 | 0.22 | 1 |
| cryo-v2-09 | cable | 1210 | 0.24 | 1 |
| cryo-v2-10 | pupDock | 1110 | 0.3 | 0.55 |

**Documents :** `a01` Le long sommeil

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Coursive des équipages — `concourse`

**Zone :** Prometheus · **Vue :** HYBRID · **Largeur :** 1640 unités · **Thème :** `human`.

Un carrefour lisible relie habitat, laboratoire et préparation. Les portes sont séparées des vitrines.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Salle de cryostase | 90/0.6 | 1230/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Salle de briefing | 430/0.3 | 170/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Laboratoire | 1060/0.3 | 170/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Vestiaire d’expédition | 1560/0.65 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 10 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| concourse-p00 | bench | 360 | 0.32 | 1 |
| concourse-p01 | locker | 610 | 0.25 | 1 |
| concourse-p02 | plant | 900 | 0.28 | 1 |
| concourse-p03 | bench | 1170 | 0.3 | 1 |
| concourse-p04 | cabinet | 1390 | 0.86 | 1 |
| concourse-p05 | pipe | 1490 | 0.2 | 1 |
| concourse-v2-06 | junction | 430 | 0.2 | 1 |
| concourse-v2-07 | vent | 1040 | 0.19 | 1 |
| concourse-v2-08 | cable | 720 | 0.23 | 1.3 |
| concourse-v2-09 | worklight | 1260 | 0.28 | 0.8 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Salle de briefing — `briefing`

**Zone :** Prometheus · **Vue :** DEPTH · **Largeur :** 1260 unités · **Thème :** `briefing`.

La table holographique garde un passage libre sur ses deux côtés.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Coursive des équipages | 80/0.6 | 340/0.3 | chapitre≥1 ; — ; fermeture — | piéton |
| Passerelle | 1180/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 10 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| briefing-p00 | chair | 290 | 0.33 | 1 |
| briefing-p01 | chair | 420 | 0.33 | 1 |
| briefing-p02 | chair | 830 | 0.33 | 1 |
| briefing-p03 | chair | 940 | 0.33 | 1 |
| briefing-p04 | hologram | 620 | 0.46 | 1.6 |
| briefing-p05 | table | 600 | 0.76 | 1 |
| briefing-p06 | console | 1070 | 0.28 | 1 |
| briefing-v2-07 | screenwall | 630 | 0.17 | 1.1 |
| briefing-v2-08 | cable | 880 | 0.25 | 0.8 |
| briefing-v2-09 | vent | 190 | 0.22 | 0.65 |

**Documents :** `a02` Motifs convergents

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Passerelle — `bridge`

**Zone :** Prometheus · **Vue :** DEPTH · **Largeur :** 1450 unités · **Thème :** `bridge`.

Grande baie panoramique, consoles en couronne et axes de circulation extérieurs.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Salle de briefing | 90/0.6 | 1090/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Module de Vickers | 1370/0.6 | 1360/0.6 | chapitre≥11 ; — ; fermeture impact | piéton |

**Sol :** x 570–800, z 0.79–0.92

**Décors : 12 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| bridge-p00 | chair | 360 | 0.42 | 1 |
| bridge-p01 | chair | 710 | 0.4 | 1 |
| bridge-p02 | chair | 1020 | 0.42 | 1 |
| bridge-p03 | console | 270 | 0.26 | 1 |
| bridge-p04 | console | 570 | 0.26 | 1 |
| bridge-p05 | console | 910 | 0.26 | 1 |
| bridge-p06 | console | 1200 | 0.26 | 1 |
| bridge-p07 | table | 690 | 0.85 | 1 |
| bridge-v2-08 | screenwall | 1080 | 0.18 | 0.9 |
| bridge-v2-09 | junction | 170 | 0.24 | 0.7 |
| bridge-v2-10 | cable | 900 | 0.29 | 0.7 |
| bridge-v2-11 | worklight | 1330 | 0.27 | 0.7 |

**Documents :** `a03` Équipe de vol

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Laboratoire — `lab`

**Zone :** Prometheus · **Vue :** HYBRID · **Largeur :** 1360 unités · **Thème :** `lab`.

La tête est confinée sur une table d’analyse ; elle ne sert pas de décoration dans les couloirs.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Coursive des équipages | 80/0.6 | 970/0.3 | chapitre≥1 ; — ; fermeture — | piéton |
| Infirmerie | 1290/0.6 | 170/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 10 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| lab-p00 | table | 520 | 0.38 | 1 |
| lab-p01 | specimen | 520 | 0.38 | 1 |
| lab-p02 | console | 850 | 0.28 | 1 |
| lab-p03 | cabinet | 1080 | 0.3 | 1 |
| lab-p04 | canister | 950 | 0.85 | 1 |
| lab-p05 | pipe | 1200 | 0.2 | 1 |
| lab-v2-06 | sampleContainer | 550 | 0.36 | 1 |
| lab-v2-07 | pupDock | 1090 | 0.32 | 0.6 |
| lab-v2-08 | vent | 310 | 0.21 | 1 |
| lab-v2-09 | junction | 950 | 0.21 | 0.8 |

**Documents :** `a04` Confinement

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Infirmerie — `medbay`

**Zone :** Prometheus · **Vue :** SIDE · **Largeur :** 1400 unités · **Thème :** `medical`.

Lits et consoles contre le mur ; la zone d’examen reste identifiable.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Laboratoire | 80/0.6 | 1200/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Module de Vickers | 1310/0.6 | 170/0.6 | chapitre≥11 ; — ; fermeture impact | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 9 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| medbay-p00 | bed | 380 | 0.35 | 1 |
| medbay-p01 | bed | 820 | 0.35 | 1 |
| medbay-p02 | console | 600 | 0.3 | 1 |
| medbay-p03 | cabinet | 1070 | 0.3 | 1 |
| medbay-p04 | oxygen | 1230 | 0.35 | 1 |
| medbay-p05 | medical | 150 | 0.86 | 1 |
| medbay-v2-06 | duct | 590 | 0.18 | 1 |
| medbay-v2-07 | worklight | 720 | 0.23 | 1 |
| medbay-v2-08 | cable | 1120 | 0.24 | 0.7 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Module de Vickers — `executive`

**Zone :** Prometheus · **Vue :** HYBRID · **Largeur :** 1540 unités · **Thème :** `executive`.

Le module autonome conserve son identité après son éjection. Aucun nouveau MédPod n’est créé.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Infirmerie | 80/0.6 | 1220/0.6 | chapitre≥11 ; — ; fermeture impact | piéton |
| Passerelle | 1450/0.6 | 1280/0.6 | chapitre≥11 ; — ; fermeture impact | piéton |
| MédPod | 760/0.3 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Extérieur du module de survie | 1450/0.6 | 1350/0.6 | chapitre≥1 ; impact ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 9 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| executive-p00 | sofa | 380 | 0.37 | 1 |
| executive-p01 | table | 660 | 0.36 | 1 |
| executive-p02 | cabinet | 1000 | 0.28 | 1 |
| executive-p03 | plant | 1150 | 0.32 | 1 |
| executive-p04 | oxygen | 1300 | 0.3 | 1 |
| executive-p05 | console | 1360 | 0.8 | 1 |
| executive-v2-06 | screenwall | 920 | 0.18 | 0.8 |
| executive-v2-07 | junction | 1240 | 0.22 | 0.7 |
| executive-v2-08 | vent | 520 | 0.22 | 0.7 |

**Documents :** `a15` Module autonome

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### MédPod — `medpod`

**Zone :** Prometheus · **Vue :** SIDE · **Largeur :** 1160 unités · **Thème :** `medpod`.

Un seul appareil, une porte de confinement et un sas latéral. Le futur piège réutilise cet endroit.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Module de Vickers | 90/0.6 | 670/0.3 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 7 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| medpod-p00 | medpod | 630 | 0.4 | 1.45 |
| medpod-p01 | console | 260 | 0.33 | 1 |
| medpod-p02 | cabinet | 990 | 0.3 | 1 |
| medpod-p03 | medical | 130 | 0.86 | 1 |
| medpod-v2-04 | worklight | 820 | 0.22 | 0.9 |
| medpod-v2-05 | duct | 630 | 0.19 | 1 |
| medpod-v2-06 | cable | 1080 | 0.23 | 0.7 |

**Documents :** `a18` Confinement médical

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Vestiaire d’expédition — `equipment`

**Zone :** Prometheus · **Vue :** HYBRID · **Largeur :** 1450 unités · **Thème :** `equipment`.

Les équipements et bonbonnes sont rangés dans des alcôves, hors de l’axe de sortie.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Coursive des équipages | 90/0.6 | 1470/0.65 | chapitre≥1 ; — ; fermeture — | piéton |
| Hangar des véhicules | 1370/0.6 | 180/0.6 | chapitre≥3 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 11 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| equipment-p00 | suit | 290 | 0.3 | 1 |
| equipment-p01 | suit | 430 | 0.3 | 1 |
| equipment-p02 | suit | 580 | 0.3 | 1 |
| equipment-p03 | locker | 810 | 0.25 | 1 |
| equipment-p04 | oxygen | 1100 | 0.3 | 1 |
| equipment-p05 | case | 970 | 0.83 | 1 |
| equipment-p06 | console | 1280 | 0.26 | 1 |
| equipment-v2-07 | pupDock | 720 | 0.32 | 1 |
| equipment-v2-08 | cargoStrap | 1140 | 0.34 | 0.7 |
| equipment-v2-09 | worklight | 170 | 0.24 | 1 |
| equipment-v2-10 | vent | 990 | 0.19 | 1 |

**Documents :** `a05` Combinaison

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Hangar des véhicules — `garage`

**Zone :** Prometheus · **Vue :** DEPTH · **Largeur :** 1900 unités · **Thème :** `hangar`.

Le RT01 est à quai ; la circulation le contourne. L’incursion de Fifield reste dans le hangar.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

**Conduite :** bandes Z 0.32 à 0.76 ; marge latérale 170 unités.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Vestiaire d’expédition | 90/0.6 | 1280/0.6 | chapitre≥3 ; — ; fermeture — | piéton |
| Sas d’expédition | 1820/0.6 | 180/0.6 | chapitre≥3 ; — ; fermeture impact | piéton |
| Rampe des véhicules | 1630/0.73 | 260/0.6 | chapitre≥3 ; scanner ; fermeture impact | véhicule + pied |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 13 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| garage-p01 | case | 290 | 0.3 | 1 |
| garage-p02 | case | 1450 | 0.35 | 1 |
| garage-p03 | rack | 1160 | 0.27 | 1 |
| garage-p04 | oxygen | 1620 | 0.29 | 1 |
| garage-p05 | console | 1760 | 0.3 | 1 |
| garage-p06 | reel | 250 | 0.82 | 1 |
| garage-p07 | barrel | 1560 | 0.84 | 1 |
| garage-v2-07 | gantry | 960 | 0.19 | 1.35 |
| garage-v2-08 | pupDock | 1190 | 0.31 | 1 |
| garage-v2-09 | cargoStrap | 420 | 0.26 | 0.8 |
| garage-v2-10 | worklight | 1300 | 0.22 | 1.15 |
| garage-v2-11 | drainGrate | 930 | 0.77 | 1.2 |
| garage-v2-12 | cable | 1710 | 0.23 | 1 |

**Documents :** `a06` RT01, `a19` Avant de prendre le volant

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Sas d’expédition — `airlock`

**Zone :** Prometheus · **Vue :** SIDE · **Largeur :** 1150 unités · **Thème :** `airlock`.

Deux portes étanches et un enrouleur ancré. Le cycle de pression ne téléporte pas vers le temple.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Hangar des véhicules | 90/0.6 | 1730/0.6 | chapitre≥3 ; — ; fermeture impact | piéton |
| Plaine d’atterrissage | 1080/0.6 | 190/0.6 | chapitre≥3 ; suit ; fermeture impact | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| airlock-p00 | reel | 330 | 0.32 | 1 |
| airlock-p01 | console | 620 | 0.3 | 1 |
| airlock-p02 | oxygen | 850 | 0.33 | 1 |
| airlock-p03 | suit | 990 | 0.25 | 1 |
| airlock-v2-04 | junction | 440 | 0.2 | 0.8 |
| airlock-v2-05 | worklight | 940 | 0.24 | 0.8 |
| airlock-v2-06 | drainGrate | 640 | 0.76 | 1.2 |
| airlock-v2-07 | cable | 180 | 0.22 | 1 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Plaine d’atterrissage — `plain`

**Zone :** LV-223 · **Vue :** DEPTH · **Largeur :** 2300 unités · **Thème :** `surface`.

Le vaisseau est un volume au fond ; le chemin mène au relief et à l’entrée sans traverser ses moteurs.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

**Conduite :** bandes Z 0.32 à 0.76 ; marge latérale 170 unités.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Sas d’expédition | 100/0.6 | 990/0.6 | chapitre≥3 ; suit ; fermeture impact | piéton |
| Crête basaltique | 2200/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | véhicule + pied |
| Rampe des véhicules | 480/0.73 | 1700/0.6 | chapitre≥3 ; suit ; fermeture impact | véhicule + pied |

**Sol :** x 1010–1170, z 0.79–0.92

**Décors : 10 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| plain-p00 | rock | 350 | 0.25 | 1.5 |
| plain-p01 | beacon | 660 | 0.42 | 1 |
| plain-p02 | rock | 1100 | 0.86 | 1 |
| plain-p03 | track | 1420 | 0.45 | 1 |
| plain-p04 | rock | 1800 | 0.3 | 1.7 |
| plain-p05 | beacon | 2070 | 0.75 | 1 |
| plain-v2-06 | strata | 580 | 0.21 | 1.5 |
| plain-v2-07 | dust | 1480 | 0.83 | 1.2 |
| plain-v2-08 | strata | 1960 | 0.21 | 1.3 |
| plain-v2-09 | worklight | 520 | 0.26 | 0.65 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Crête basaltique — `ridge`

**Zone :** LV-223 · **Vue :** DEPTH · **Largeur :** 1960 unités · **Thème :** `surface`.

Couloir de terrain ouvert avec un abri rocheux en avant-plan. Un décalage en profondeur permet l’esquive finale.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

**Conduite :** bandes Z 0.32 à 0.76 ; marge latérale 170 unités.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Plaine d’atterrissage | 90/0.6 | 2110/0.6 | chapitre≥1 ; — ; fermeture — | véhicule + pied |
| Faille abritée | 1200/0.84 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Entrée du complexe | 1870/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | véhicule + pied |
| Champ de débris | 540/0.83 | 180/0.6 | chapitre≥1 ; impact ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| ridge-p00 | rock | 300 | 0.26 | 2 |
| ridge-p01 | rock | 880 | 0.28 | 1.3 |
| ridge-p02 | beacon | 1140 | 0.74 | 1 |
| ridge-p03 | rock | 1460 | 0.9 | 1.4 |
| ridge-p04 | rock | 1790 | 0.26 | 1 |
| ridge-v2-05 | strata | 560 | 0.19 | 1.4 |
| ridge-v2-06 | strata | 1360 | 0.22 | 1.2 |
| ridge-v2-07 | dust | 1660 | 0.8 | 1.5 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Faille abritée — `shelter`

**Zone :** LV-223 · **Vue :** SIDE · **Largeur :** 1140 unités · **Thème :** `surface`.

Détour ajouté pour le jeu : la paroi protège du vent, sans devenir un laboratoire ou une base humaine.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Crête basaltique | 90/0.6 | 1110/0.84 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 7 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| shelter-p00 | rock | 280 | 0.3 | 1.8 |
| shelter-p01 | rock | 580 | 0.27 | 2.2 |
| shelter-p02 | rock | 840 | 0.84 | 1.2 |
| shelter-p03 | beacon | 970 | 0.33 | 1 |
| shelter-v2-04 | strata | 510 | 0.21 | 1.3 |
| shelter-v2-05 | cable | 920 | 0.24 | 0.7 |
| shelter-v2-06 | dust | 420 | 0.82 | 1 |

**Documents :** `a07` Relief basaltique

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Entrée du complexe — `entrance`

**Zone :** Temple · **Vue :** HYBRID · **Largeur :** 1680 unités · **Thème :** `entrance`.

Le relief s’ouvre sur une gorge monumentale. Transition de sol minéral vers la structure nervurée.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

**Conduite :** bandes Z 0.32 à 0.76 ; marge latérale 170 unités.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Crête basaltique | 90/0.6 | 1780/0.6 | chapitre≥1 ; — ; fermeture — | véhicule + pied |
| Vestibule | 1590/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Alcôve basaltique | 420/0.83 | 190/0.6 | chapitre≥4 ; scanner ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 9 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| entrance-p00 | rock | 270 | 0.28 | 1.6 |
| entrance-p01 | rib | 680 | 0.2 | 1 |
| entrance-p02 | rib | 1130 | 0.2 | 1 |
| entrance-p03 | urn | 1420 | 0.32 | 1 |
| entrance-p04 | marker | 980 | 0.8 | 1 |
| entrance-v2-05 | strata | 280 | 0.2 | 1.4 |
| entrance-v2-06 | reliefPanel | 880 | 0.17 | 1.3 |
| entrance-v2-07 | fracturedUrn | 1430 | 0.33 | 0.75 |
| entrance-v2-08 | dust | 630 | 0.88 | 1 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Vestibule — `vestibule`

**Zone :** Temple · **Vue :** SIDE · **Largeur :** 1510 unités · **Thème :** `temple`.

Une pente physique suggérée par le décor conduit à l’enfilade ; les passages fonctionnels sont au sol.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Entrée du complexe | 90/0.6 | 1500/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Couloir des hologrammes | 1420/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| vestibule-p00 | rib | 320 | 0.2 | 1 |
| vestibule-p01 | rib | 680 | 0.2 | 1 |
| vestibule-p02 | rib | 1050 | 0.2 | 1 |
| vestibule-p03 | urn | 1230 | 0.3 | 1 |
| vestibule-p04 | marker | 490 | 0.85 | 1 |
| vestibule-v2-05 | reliefPanel | 450 | 0.2 | 1.3 |
| vestibule-v2-06 | cable | 1300 | 0.29 | 0.7 |
| vestibule-v2-07 | dust | 1050 | 0.88 | 0.8 |

**Relevé PUP :** La mesure du seuil ; points 347/0.38, 800/0.71, 1208/0.4.

Les surfaces intérieures dessinent une continuité. Le scanner relève les volumes sans en expliquer la fonction.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Couloir des hologrammes — `holograms`

**Zone :** Temple · **Vue :** SIDE · **Largeur :** 1850 unités · **Thème :** `holograms`.

Les silhouettes enregistrées ne sont ni des ennemis ni des personnages vivants.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Vestibule | 90/0.6 | 1330/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Chambre de la tête | 1760/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Galerie latérale | 1210/0.6 | 190/0.6 | chapitre≥5 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 11 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| holograms-p00 | rib | 290 | 0.2 | 1 |
| holograms-p01 | rib | 740 | 0.2 | 1 |
| holograms-p02 | rib | 1240 | 0.2 | 1 |
| holograms-p03 | rib | 1660 | 0.2 | 1 |
| holograms-p04 | holoengineer | 540 | 0.32 | 1 |
| holograms-p05 | holoengineer | 1020 | 0.32 | 1 |
| holograms-p06 | helmet | 1510 | 0.83 | 1 |
| holograms-v2-07 | reliefPanel | 390 | 0.18 | 1.1 |
| holograms-v2-08 | reliefPanel | 930 | 0.21 | 0.9 |
| holograms-v2-09 | fracturedUrn | 1480 | 0.27 | 0.7 |
| holograms-v2-10 | dust | 1660 | 0.88 | 1 |

**Documents :** `a08` Échos

**Relevé PUP :** Le couloir des traces ; points 426/0.38, 980/0.71, 1480/0.4.

Le relevé distingue les niches et les passages. Les silhouettes lumineuses ne sont pas des contacts vivants.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Chambre de la tête — `head`

**Zone :** Temple · **Vue :** DEPTH · **Largeur :** 1780 unités · **Thème :** `head`.

Tête monumentale au fond, urnes ordonnées par rangées, allée sacrée centrale et contournements sur les côtés.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Couloir des hologrammes | 90/0.6 | 1670/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Galerie des ampoules | 1690/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** x 455–535, z 0.77–0.92; x 1240–1320, z 0.77–0.92

**Décors : 13 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| head-p00 | urn | 300 | 0.35 | 1 |
| head-p01 | urn | 460 | 0.35 | 1 |
| head-p02 | urn | 620 | 0.35 | 1 |
| head-p03 | urn | 1170 | 0.35 | 1 |
| head-p04 | urn | 1330 | 0.35 | 1 |
| head-p05 | urn | 1490 | 0.35 | 1 |
| head-p06 | urn | 500 | 0.83 | 1 |
| head-p07 | urn | 1280 | 0.83 | 1 |
| head-p08 | helmet | 900 | 0.68 | 1 |
| head-v2-09 | reliefPanel | 310 | 0.19 | 1.2 |
| head-v2-10 | reliefPanel | 1450 | 0.19 | 1.2 |
| head-v2-11 | fracturedUrn | 1130 | 0.3 | 0.8 |
| head-v2-12 | dust | 920 | 0.87 | 1.2 |

**Documents :** `a09` La tête

**Relevé PUP :** Une chambre organisée ; points 409/0.38, 943/0.71, 1424/0.4.

Les rangées et le socle composent un même volume. Le relevé conserve leur disposition, pas leur signification.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Galerie des ampoules — `ampoules`

**Zone :** Temple · **Vue :** DEPTH · **Largeur :** 1600 unités · **Thème :** `ampoules`.

Les ampoules suivent le rythme des nervures ; les écoulements restent localisés au sol.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Chambre de la tête | 90/0.6 | 1600/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Galerie basse | 910/0.8 | 180/0.6 | chapitre≥8 ; — ; fermeture — | piéton |
| Antichambre | 1510/0.6 | 180/0.6 | chapitre≥13 ; — ; fermeture — | piéton |

**Sol :** x 450–530, z 0.78–0.92; x 1090–1170, z 0.78–0.92

**Décors : 12 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| ampoules-p00 | urn | 300 | 0.3 | 1 |
| ampoules-p01 | urn | 460 | 0.3 | 1 |
| ampoules-p02 | urn | 620 | 0.3 | 1 |
| ampoules-p03 | urn | 1040 | 0.3 | 1 |
| ampoules-p04 | urn | 1200 | 0.3 | 1 |
| ampoules-p05 | urn | 1360 | 0.3 | 1 |
| ampoules-p06 | urn | 490 | 0.85 | 1 |
| ampoules-p07 | urn | 1130 | 0.85 | 1 |
| ampoules-p08 | spill | 880 | 0.44 | 1 |
| ampoules-v2-09 | drainGrate | 800 | 0.31 | 1.2 |
| ampoules-v2-10 | fracturedUrn | 1410 | 0.36 | 0.9 |
| ampoules-v2-11 | reliefPanel | 940 | 0.19 | 1.1 |

**Documents :** `a10` Les ampoules

**Relevé PUP :** Le réseau au sol ; points 368/0.38, 848/0.71, 1280/0.4.

Les rigoles convergent sous les alignements d’ampoules. Éviter les écoulements lors du relevé.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Galerie basse — `drain`

**Zone :** Temple · **Vue :** HYBRID · **Largeur :** 1490 unités · **Thème :** `drain`.

Galerie optionnelle adaptée : trace du retour de Millburn et Fifield ; aucun serpent ne naît des murs.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Galerie des ampoules | 90/0.6 | 820/0.8 | chapitre≥8 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 10 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| drain-p00 | rib | 360 | 0.23 | 1 |
| drain-p01 | urn | 590 | 0.3 | 1 |
| drain-p02 | spill | 760 | 0.5 | 1 |
| drain-p03 | helmet | 1000 | 0.7 | 1 |
| drain-p04 | rib | 1190 | 0.22 | 1 |
| drain-p05 | urn | 1300 | 0.85 | 1 |
| drain-v2-06 | drainGrate | 490 | 0.52 | 1.2 |
| drain-v2-07 | drainGrate | 1110 | 0.53 | 1.2 |
| drain-v2-08 | fracturedUrn | 380 | 0.28 | 0.75 |
| drain-v2-09 | reliefPanel | 960 | 0.2 | 0.85 |

**Documents :** `a11` Dernier équipement

**Relevé PUP :** Le point bas ; points 343/0.38, 790/0.71, 1192/0.4.

La galerie concentre les écoulements. Le relevé ne permet pas de déclarer la substance sans danger.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Antichambre — `antechamber`

**Zone :** Temple · **Vue :** SIDE · **Largeur :** 1440 unités · **Thème :** `temple`.

Le changement de matériau annonce le passage vers la partie vaisseau du complexe.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Galerie des ampoules | 90/0.6 | 1420/0.6 | chapitre≥13 ; — ; fermeture — | piéton |
| Soute du Juggernaut | 1350/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| antechamber-p00 | rib | 340 | 0.2 | 1 |
| antechamber-p01 | rib | 800 | 0.2 | 1 |
| antechamber-p02 | urn | 570 | 0.31 | 1 |
| antechamber-p03 | consoleAlien | 1120 | 0.3 | 1 |
| antechamber-p04 | rib | 1280 | 0.2 | 1 |
| antechamber-v2-05 | reliefPanel | 580 | 0.21 | 1.2 |
| antechamber-v2-06 | fracturedUrn | 910 | 0.31 | 0.8 |
| antechamber-v2-07 | dust | 1200 | 0.87 | 1 |

**Relevé PUP :** Un changement d’échelle ; points 331/0.38, 763/0.71, 1152/0.4.

Le passage s’élargit avant la soute. Les nervures s’inscrivent dans le même axe.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Soute du Juggernaut — `hold`

**Zone :** Juggernaut · **Vue :** DEPTH · **Largeur :** 1950 unités · **Thème :** `hold`.

Stockage régulier des ampoules. La voie centrale ne coupe aucune rangée solide.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Antichambre | 90/0.6 | 1260/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Salle de navigation | 1850/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Coursive de contrôle | 1000/0.86 | 1000/0.6 | chapitre≥1 ; navigation ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 16 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| hold-p00 | urn | 280 | 0.27 | 1 |
| hold-p01 | urn | 420 | 0.27 | 1 |
| hold-p02 | urn | 560 | 0.27 | 1 |
| hold-p03 | urn | 700 | 0.27 | 1 |
| hold-p04 | urn | 1240 | 0.27 | 1 |
| hold-p05 | urn | 1380 | 0.27 | 1 |
| hold-p06 | urn | 1520 | 0.27 | 1 |
| hold-p07 | urn | 1660 | 0.27 | 1 |
| hold-p08 | urn | 400 | 0.86 | 1 |
| hold-p09 | urn | 1540 | 0.86 | 1 |
| hold-p10 | rib | 960 | 0.17 | 1 |
| hold-v2-11 | gantry | 980 | 0.18 | 1.4 |
| hold-v2-12 | reliefPanel | 370 | 0.2 | 1 |
| hold-v2-13 | reliefPanel | 1570 | 0.2 | 1 |
| hold-v2-14 | fracturedUrn | 1130 | 0.29 | 0.75 |
| hold-v2-15 | drainGrate | 950 | 0.78 | 1.2 |

**Documents :** `a14` Chargement

**Relevé PUP :** La géométrie du chargement ; points 448/0.38, 1034/0.71, 1560/0.4.

Les rangées remplissent un espace de stockage. La cartographie ne détermine pas la composition du contenu.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Salle de navigation — `orrery`

**Zone :** Juggernaut · **Vue :** DEPTH · **Largeur :** 1820 unités · **Thème :** `orrery`.

Le fauteuil et l’orrery dominent un espace annulaire, pas une ruche. Un accès mène aux caissons.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Soute du Juggernaut | 90/0.6 | 1760/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Hypersommeil des Ingénieurs | 1150/0.3 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Brèche du Juggernaut | 90/0.6 | 1290/0.6 | chapitre≥1 ; impact ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 11 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| orrery-p00 | consoleAlien | 410 | 0.3 | 1 |
| orrery-p01 | consoleAlien | 1420 | 0.3 | 1 |
| orrery-p02 | pilot | 940 | 0.46 | 1.25 |
| orrery-p03 | urn | 310 | 0.84 | 1 |
| orrery-p04 | urn | 1500 | 0.84 | 1 |
| orrery-p05 | rib | 620 | 0.18 | 1 |
| orrery-p06 | rib | 1250 | 0.18 | 1 |
| orrery-v2-07 | reliefPanel | 480 | 0.21 | 1 |
| orrery-v2-08 | reliefPanel | 1340 | 0.21 | 1 |
| orrery-v2-09 | drainGrate | 940 | 0.8 | 1.3 |
| orrery-v2-10 | fracturedUrn | 1660 | 0.3 | 0.7 |

**Relevé PUP :** Le poste central ; points 419/0.38, 965/0.71, 1456/0.4.

L’instrument central domine plusieurs postes périphériques. Une carte de formes n’est pas une traduction.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Hypersommeil des Ingénieurs — `hypersleep`

**Zone :** Juggernaut · **Vue :** HYBRID · **Largeur :** 1640 unités · **Thème :** `hypersleep`.

Quatre sarcophages, un seul survivant. Ils sont des supports scénaristiques, pas des générateurs de soldats.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Salle de navigation | 90/0.6 | 1060/0.3 | chapitre≥1 ; — ; fermeture — | piéton |
| Coursive de contrôle | 1550/0.6 | 180/0.6 | chapitre≥1 ; navigation ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| hypersleep-p00 | engineerPod | 390 | 0.32 | 1.25 |
| hypersleep-p01 | engineerPod | 720 | 0.32 | 1.25 |
| hypersleep-p02 | engineerPod | 1060 | 0.32 | 1.25 |
| hypersleep-p03 | engineerPod | 1370 | 0.32 | 1.25 |
| hypersleep-p04 | consoleAlien | 860 | 0.85 | 1 |
| hypersleep-v2-05 | reliefPanel | 550 | 0.2 | 1.1 |
| hypersleep-v2-06 | fracturedUrn | 1220 | 0.3 | 0.7 |
| hypersleep-v2-07 | drainGrate | 890 | 0.78 | 1 |

**Documents :** `a13` Le dernier dormeur

**Relevé PUP :** Les caissons ; points 377/0.38, 869/0.71, 1312/0.4.

Le relief des caissons est conservé dans le journal ; une mesure de volume ne remplace pas un diagnostic biologique.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Coursive de contrôle — `gallery`

**Zone :** Juggernaut · **Vue :** SIDE · **Largeur :** 1180 unités · **Thème :** `temple`.

Liaison additionnelle de gameplay ; aucun ascenseur invisible. Sa porte crée un raccourci après activation.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Hypersommeil des Ingénieurs | 90/0.6 | 1460/0.6 | chapitre≥1 ; navigation ; fermeture — | piéton |
| Soute du Juggernaut | 1090/0.6 | 910/0.86 | chapitre≥1 ; navigation ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 7 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| gallery-p00 | rib | 310 | 0.2 | 1 |
| gallery-p01 | consoleAlien | 570 | 0.31 | 1 |
| gallery-p02 | rib | 890 | 0.2 | 1 |
| gallery-p03 | urn | 1020 | 0.85 | 1 |
| gallery-v2-04 | reliefPanel | 490 | 0.2 | 1.1 |
| gallery-v2-05 | drainGrate | 830 | 0.77 | 0.8 |
| gallery-v2-06 | dust | 210 | 0.85 | 0.8 |

**Documents :** `a12` Commande de maintenance

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Champ de débris — `wreck`

**Zone :** LV-223 · **Vue :** DEPTH · **Largeur :** 2130 unités · **Thème :** `wreck`.

Après l’impact, les structures détruites ne sont plus des passages du Prometheus. Les débris encadrent la route.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Crête basaltique | 90/0.6 | 450/0.83 | chapitre≥1 ; impact ; fermeture — | piéton |
| Extérieur du module de survie | 2020/0.6 | 180/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Brèche du Juggernaut | 1250/0.82 | 180/0.6 | chapitre≥1 ; trapped ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 10 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| wreck-p00 | wreckage | 350 | 0.3 | 1.5 |
| wreck-p01 | wreckage | 700 | 0.85 | 1.5 |
| wreck-p02 | rock | 1080 | 0.25 | 1.5 |
| wreck-p03 | wreckage | 1430 | 0.3 | 1.8 |
| wreck-p04 | oxygen | 1720 | 0.74 | 1 |
| wreck-p05 | beacon | 1930 | 0.4 | 1 |
| wreck-v2-06 | strata | 620 | 0.21 | 1.2 |
| wreck-v2-07 | cable | 1190 | 0.24 | 1 |
| wreck-v2-08 | dust | 1660 | 0.81 | 1.5 |
| wreck-v2-09 | fracturedUrn | 1780 | 0.31 | 0.8 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Extérieur du module de survie — `lifeboat`

**Zone :** LV-223 · **Vue :** HYBRID · **Largeur :** 1540 unités · **Thème :** `lifeboat`.

Le module de Vickers détaché est maintenant accessible depuis la surface ; son intérieur est le même.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Champ de débris | 90/0.6 | 1930/0.6 | chapitre≥1 ; — ; fermeture — | piéton |
| Module de Vickers | 1440/0.6 | 1360/0.6 | chapitre≥1 ; impact ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 7 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| lifeboat-p00 | wreckage | 320 | 0.28 | 1.4 |
| lifeboat-p01 | beacon | 700 | 0.7 | 1 |
| lifeboat-p02 | oxygen | 1030 | 0.28 | 1 |
| lifeboat-p03 | rock | 1290 | 0.86 | 1 |
| lifeboat-v2-04 | worklight | 1000 | 0.25 | 0.9 |
| lifeboat-v2-05 | cable | 600 | 0.3 | 1 |
| lifeboat-v2-06 | dust | 1240 | 0.79 | 1.2 |

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Brèche du Juggernaut — `breach`

**Zone :** Juggernaut · **Vue :** SIDE · **Largeur :** 1470 unités · **Thème :** `wreck`.

La brèche, créée par l’impact, remplace l’entrée ensevelie et mène aux mêmes coordonnées du cockpit.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Champ de débris | 90/0.6 | 1160/0.82 | chapitre≥1 ; trapped ; fermeture — | piéton |
| Salle de navigation | 1380/0.6 | 180/0.6 | chapitre≥1 ; impact ; fermeture — | piéton |
| Second vaisseau | 650/0.8 | 180/0.6 | chapitre≥1 ; davidRecovered ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 7 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| breach-p00 | wreckage | 350 | 0.3 | 1.7 |
| breach-p01 | rib | 730 | 0.2 | 1 |
| breach-p02 | wreckage | 1050 | 0.85 | 1 |
| breach-p03 | consoleAlien | 1250 | 0.31 | 1 |
| breach-v2-04 | reliefPanel | 830 | 0.22 | 1 |
| breach-v2-05 | fracturedUrn | 540 | 0.3 | 0.7 |
| breach-v2-06 | dust | 1030 | 0.85 | 1 |

**Documents :** `a16` Après l’impact

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Second vaisseau — `second`

**Zone :** LV-223 · **Vue :** DEPTH · **Largeur :** 1650 unités · **Thème :** `second`.

Un autre vaisseau, distinct de l’épave. Le trajet extérieur est condensé et annoncé comme une ellipse de marche.

**Statut :** Lieu hérité du parcours V1 ; dimensions d’adaptation.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Brèche du Juggernaut | 90/0.6 | 560/0.8 | chapitre≥1 ; davidRecovered ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| second-p00 | pilot | 830 | 0.44 | 1.25 |
| second-p01 | consoleAlien | 430 | 0.32 | 1 |
| second-p02 | consoleAlien | 1240 | 0.32 | 1 |
| second-p03 | rib | 290 | 0.19 | 1 |
| second-p04 | rib | 1400 | 0.19 | 1 |
| second-v2-05 | reliefPanel | 440 | 0.2 | 1.1 |
| second-v2-06 | reliefPanel | 1210 | 0.2 | 1.1 |
| second-v2-07 | drainGrate | 830 | 0.79 | 1.2 |

**Documents :** `a17` Au-delà de LV-223

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Rampe des véhicules — `apron`

**Zone :** LV-223 · **Vue :** SETPIECE · **Largeur :** 1960 unités · **Thème :** `surface`.

Rampe large réservée au RT01 ; la sortie piétonne reste le sas. Limites latérales lisibles et balises sur le bord de circulation.

**Statut :** Nouveau lieu de cette adaptation, pas une géométrie certifiée canonique.

**Conduite :** bandes Z 0.39 à 0.72 ; marge latérale 170 unités.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Hangar des véhicules | 170/0.6 | 1540/0.73 | chapitre≥3 ; scanner ; fermeture impact | véhicule + pied |
| Plaine d’atterrissage | 1790/0.6 | 570/0.73 | chapitre≥3 ; suit ; fermeture impact | véhicule + pied |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 9 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| apron-v2-00 | gantry | 500 | 0.17 | 1.5 |
| apron-v2-01 | worklight | 320 | 0.26 | 1 |
| apron-v2-02 | worklight | 1410 | 0.28 | 1 |
| apron-v2-03 | track | 1030 | 0.6 | 1.5 |
| apron-v2-04 | cargoStrap | 480 | 0.29 | 0.8 |
| apron-v2-05 | strata | 1710 | 0.23 | 1.2 |
| apron-v2-06 | beacon | 1610 | 0.82 | 1 |
| apron-v2-07 | beacon | 940 | 0.82 | 1 |
| apron-v2-08 | cable | 640 | 0.26 | 1 |

**Documents :** `a20` Le retour au vaisseau

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Alcôve basaltique — `survey`

**Zone :** LV-223 · **Vue :** SIDE · **Largeur :** 1280 unités · **Thème :** `surface`.

Détour de relevé à pied. Une caisse d’expédition et deux traces géologiques ; le RT01 ne franchit pas ce boyau.

**Statut :** Nouveau lieu de cette adaptation, pas une géométrie certifiée canonique.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Entrée du complexe | 100/0.6 | 510/0.83 | chapitre≥4 ; scanner ; fermeture — | piéton |

**Sol :** aucune boîte fixe ; la géométrie de bord reste appliquée.

**Décors : 6 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| survey-v2-00 | strata | 370 | 0.23 | 1.5 |
| survey-v2-01 | strata | 1000 | 0.21 | 1.7 |
| survey-v2-02 | surveyCache | 760 | 0.32 | 1 |
| survey-v2-03 | marker | 580 | 0.78 | 1 |
| survey-v2-04 | sampleContainer | 780 | 0.32 | 0.7 |
| survey-v2-05 | dust | 980 | 0.84 | 1.1 |

**Documents :** `a21` Mesures de terrain, `a22` Une trace n’est pas une preuve

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

### Galerie latérale — `annexe`

**Zone :** Complexe · **Vue :** HYBRID · **Largeur :** 1540 unités · **Thème :** `temple`.

Détour architectural de l’adaptation : dépôts, parements brisés et porte condamnée. Aucun nouveau peuple ni créature ajouté au récit.

**Statut :** Nouveau lieu de cette adaptation, pas une géométrie certifiée canonique.

| Destination | Seuil x/z | Arrivée x/z | Ouverture | Type |
|---|---|---|---|---|
| Couloir des hologrammes | 100/0.6 | 1120/0.6 | chapitre≥5 ; — ; fermeture — | piéton |

**Sol :** x 952–1026, z 0.76–0.9

**Décors : 8 placements**

| Identifiant | Famille | X | Z | Échelle |
|---|---|---|---|---|
| annexe-v2-00 | reliefPanel | 500 | 0.18 | 1.4 |
| annexe-v2-01 | reliefPanel | 1110 | 0.18 | 1.2 |
| annexe-v2-02 | fracturedUrn | 750 | 0.29 | 1 |
| annexe-v2-03 | fracturedUrn | 1320 | 0.31 | 0.8 |
| annexe-v2-04 | urn | 370 | 0.32 | 1 |
| annexe-v2-05 | urn | 990 | 0.82 | 1 |
| annexe-v2-06 | drainGrate | 710 | 0.42 | 1.1 |
| annexe-v2-07 | dust | 1230 | 0.82 | 1 |

**Documents :** `a23` La porte condamnée, `a24` Ne rien déplacer

**Relevé PUP :** Une liaison condamnée ; points 354/0.38, 816/0.71, 1232/0.4.

La paroi interrompue correspond à une ouverture scellée. Aucun trajet traversable n’a été identifié derrière elle.

**Contrôle de lecture :** vérifier l’entrée, la sortie et l’approche de chaque objectif ; garder une bande de circulation distincte des décorations murales. Une capture seule ne certifie pas tous les trajets possibles.

## Journal des documents

### a01 — Le long sommeil
Salle de cryostase · x=1110, z=0.6

Les constantes reviennent lentement. Les caissons ont maintenu l’équipage pendant la traversée.

### a02 — Motifs convergents
Salle de briefing · x=1030, z=0.6

Plusieurs relevés anciens partagent un même arrangement d’astres. Des peuples qui ne se connaissaient pas regardaient dans la même direction.

### a03 — Équipe de vol
Passerelle · x=310, z=0.6

Janek commande le vaisseau. Chance et Ravel assurent la navigation et le pilotage.

### a04 — Confinement
Laboratoire · x=1080, z=0.6

Les outils de recherche ne transforment pas une substance inconnue en remède utilisable.

### a05 — Combinaison
Vestiaire d’expédition · x=310, z=0.6

Joint du casque vérifié. Réserve nominale. Recharger les bouteilles uniquement dans un espace pressurisé.

### a06 — RT01
Hangar des véhicules · x=330, z=0.65

RT01 arrimé. Les caisses de relevé sont chargées et les instruments de terrain attendent leur contrôle.

### a07 — Relief basaltique
Faille abritée · x=740, z=0.6

La paroi coupe le vent. Au-delà des marques laissées par notre équipe, aucune trace d’une présence humaine.

### a08 — Échos
Couloir des hologrammes · x=1450, z=0.6

Les silhouettes traversent le couloir sans nous regarder. Le même mouvement recommence. Un enregistrement, pas une présence.

### a09 — La tête
Chambre de la tête · x=460, z=0.62

Le visage domine la chambre. Les récipients sont disposés face à lui. Pourquoi donner un visage à cet endroit ?

### a10 — Les ampoules
Galerie des ampoules · x=1200, z=0.63

La substance réagit au contact de son environnement. Les prélèvements ne permettent pas encore d’en comprendre tous les effets.

### a11 — Dernier équipement
Galerie basse · x=990, z=0.7

Un casque, des empreintes, une transmission coupée. Millburn et Fifield sont passés par cette galerie.

### a12 — Commande de maintenance
Coursive de contrôle · x=560, z=0.6

Le conduit rejoint les caissons depuis la soute. La commande de maintenance répond à nouveau.

### a13 — Le dernier dormeur
Hypersommeil des Ingénieurs · x=1380, z=0.6

Un seul des caissons renvoie une activité. Quelqu’un est resté ici pendant tout ce temps.

### a14 — Chargement
Soute du Juggernaut · x=1520, z=0.62

Les ampoules sont alignées en rangées régulières. Le complexe n’était pas seulement un lieu de culte : ce vaisseau transportait quelque chose.

### a15 — Module autonome
Module de Vickers · x=370, z=0.6

Réserves indépendantes, alimentation de secours, confinement médical. Ce module a été conçu pour survivre au reste du vaisseau.

### a16 — Après l’impact
Brèche du Juggernaut · x=1070, z=0.6

Le métal a cédé sous l’impact. La brèche offre un accès, mais aucune des cloisons qui l’entourent ne paraît stable.

### a17 — Au-delà de LV-223
Second vaisseau · x=470, z=0.6

Il existe d’autres routes. David pense pouvoir les lire. Je n’ai plus que lui pour les suivre.

### a18 — Confinement médical
MédPod · x=980, z=0.6

L’organisme extrait est enfermé derrière cette cloison. Les capteurs signalent une croissance anormale.

### a19 — Avant de prendre le volant
Hangar des véhicules · x=1160, z=0.6

Le RT01 sort par la rampe des véhicules. Ralentir avant chaque passage ; les couloirs restent réservés aux piétons.

### a20 — Le retour au vaisseau
Rampe des véhicules · x=970, z=0.84

Les deux balises de la rampe restent alignées sur l’axe de retour. Le sas piéton n’est pas une entrée pour le rover.

### a21 — Mesures de terrain
Alcôve basaltique · x=770, z=0.6

L’équipe a laissé un point de relevé dans l’alcôve. Les observations comparent les strates sans leur attribuer d’âge certain.

### a22 — Une trace n’est pas une preuve
Alcôve basaltique · x=1080, z=0.6

La cassure suit la pente. La carte conserve cette observation, pas une hypothèse sur ses auteurs.

### a23 — La porte condamnée
Galerie latérale · x=660, z=0.6

Le PUP suit la paroi mais ne trouve aucun accès praticable. Le passage s’arrête ici.

### a24 — Ne rien déplacer
Galerie latérale · x=1280, z=0.6

Un fragment et sa position constituent un même relevé. Photographier d’abord ; laisser le dépôt en place.

## Contrat d’état et migration

La V2 utilise `atf.mire.prometheus.v2` et ne remplace pas la clé V1. Le bouton de reprise V1 apparaît seulement si le navigateur expose cette ancienne sauvegarde sur la même origine et qu’aucune V2 n’existe. Le moyen portable est l’import du fichier JSON V1 depuis le menu. La migration conserve la progression et les ressources, mais n’invente aucun ancien trajet ou relevé PUP. Une escorte V1 en cours reprend à son point d’origine. Le RT01 reprend à son emplacement initial, et est retiré si l’impact a déjà eu lieu.

La position du RT01, les mesures PUP, Holloway et l’enrouleur sont inclus dans l’export V2. L’import vérifie le schéma, les bornes et la cohérence avec les objectifs ; il demande confirmation puis reste en pause. Un refus d’import ne remplace pas la partie en mémoire. L’import ne constitue pas un dispositif anti-triche cryptographique.

Une sauvegarde automatique est tentée toutes les huit secondes et aux transitions significatives. Le navigateur peut interdire le stockage local. **Dans ce cas, le jeu le signale : utiliser l’export JSON. La persistance native localStorage n’a pas pu être qualifiée dans l’environnement de cette livraison.**

## Recette réelle

| Catégorie | Résultat | Périmètre |
|---|---|---|
| unit | 80/80 | Contrats, collisions, sauvegardes et rencontres ; états préparés nommés. |
| expedition | 89/89 | Véhicule, PUP, escorte, enrouleur, migration et navigation ; états préparés explicitement identifiés. |
| walkthrough | 6/6 | Six parcours continus du modèle ; entrées simulées, solutions des puzzles soumises à leur API, pas de réassignation des positions ou ressources. |
| browser | 47/47 | Début réellement joué au clavier, puis scènes préparées ; menus, commandes, rendu et fichiers JSON. Pas un parcours clavier intégral. |
| installer | 11/11 | Coque de test ; copie additive, refus d’écrasement, protection des modifications et retour arrière. Pas le dépôt Tantalus complet. |

Les tests ciblés V2 sont **80 + 89 = 169**, et non les anciens 77 additionnés à une nouvelle campagne. Les résultats V1 conservés dans `history` sont des archives, pas des passes de validation de cette V2.

Les quatre parcours à pied couvrent Récit/Expédition × latéral/hybride ; les deux parcours supplémentaires utilisent le RT01 en Expédition × latéral/hybride. Les quarante et un objectifs sont atteints dans chacun. Les séquences PUP complètes sont testées séparément dans dix scènes préparées, pas comme dix campagnes intégrales supplémentaires.

Le navigateur charge le HTML via `set_content` : le vrai code s’exécute, mais la navigation HTTP/file et le localStorage natif restent non qualifiés. Les exports/imports JSON passent par de vrais fichiers du navigateur.

## Limites maintenues visibles

Rendu vectoriel illustré provisoire : ni photoréalisme ni reproduction 1:1 du film. Les nouveaux locaux et la géométrie sont des adaptations. Ni vol libre, ni coopération, ni verticalité continue, ni jeu de plateforme. Les autres personnages restent majoritairement des rôles narratifs. Les cinématiques sont condensées et aucun doublage n’est livré. Aucune recette de manette matérielle ou Safari/iOS. L’affichage compact a été vérifié, pas une campagne tactile complète.

Le MédPod, les puzzles et les relevés sont des mécanismes fictifs de jeu, pas des instructions scientifiques ou médicales réelles. Le Deacon reste un épilogue sans rencontre de combat.
