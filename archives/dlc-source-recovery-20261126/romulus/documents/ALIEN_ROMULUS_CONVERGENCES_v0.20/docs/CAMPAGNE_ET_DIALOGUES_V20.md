# ALIEN : ROMULUS - CONVERGENCES 0.20

> Document de travail de l'adaptation. Les dialogues affichés ici sont ceux du module et sont originaux; ce document n'est pas une transcription du film.

Version: `0.20.0-alpha` - 20 chapitres - 53 états de scène - 60 manipulations.

## 01 - Le contrat prolongé

Logement de Rain et Andy → Rue des équipes de nuit → Bureau des transferts

### S01 - Avant le service

Lieu physique: `JS-HOME` - Point de vue: **Rain**

Habitat exigu, affaires personnelles et couchage sans terminal de mission au milieu.

**Retrouver Andy** (`wake`)

- Dialogues originaux du module:
  - **Andy** (local): Tu regardais encore le ciel, dans ton sommeil.
  - **Rain** (local): Je vais au bureau des transferts. Viens avec moi.

### S02 - Le chemin des transferts

Lieu physique: `JS-STREET` - Point de vue: **Rain**

Les façades sont des logements et des services de la colonie, pas des magasins ajoutés pour remplir.

**Rejoindre Andy après l’altercation** (`helpAndy`)

- Mise en scène: 10.8 s, contrôle `directed`.
- Statut: chorégraphie locale originale fondée sur l’ordre narratif; issue dirigée
- Repères temporels:
  - 0 s - Rain revient du bureau. Deux travailleurs bloquent le passage.
  - 1.7 s - Andy tente de désamorcer l’altercation.
  - 3.3 s - Un coup le fait tomber contre la rambarde.
  - 5.2 s - Rain rejoint Andy dès que le passage se libère.
  - 7.2 s - Rain : Appuie-toi sur moi.
  - 9.1 s - Andy retrouve son équilibre.
- Dialogues originaux du module:
  - **Rain** (local): Regarde-moi. On ne reste pas ici.
  - **Andy** (local): Je peux marcher. Je reste près de toi.

### S03 - Dossier prolongé

Lieu physique: `JS-OFFICE` - Point de vue: **Rain**

Guichet derrière une séparation vitrée, dossier administratif et bancs en attente.

**Présenter le dossier de transfert** (`denied`)

- Mise en scène: 5.6 s, contrôle `directed`.
- Statut: chorégraphie locale originale; issue dirigée
- Repères temporels:
  - 0 s - Le dossier est présenté au guichet.
  - 1.7 s - Vérification de l’affectation…
  - 3.9 s - Transfert refusé.
- Dialogues originaux du module:
  - **Agent** (local): Le quota de départ a été révisé. Votre affectation continue.
  - **Rain** (local): J’ai déjà fait le travail demandé.
  - **Agent** (local): Cette décision ne dépend pas de ce guichet.

## 02 - Ceux qui partent

Logement de Tyler et Kay → plateforme pluvieuse → rampe du Corbelan IV → coursive et cabine persistantes

### S04 - Le projet de Tyler

Lieu physique: `JS-TRAILER` - Point de vue: **Rain**

Le projet de départ se discute dans un logement. Les membres du groupe ont chacun une place, sans armurerie.

**Écouter Tyler** (`plan`)

- Mise en scène: 7.8 s, contrôle `directed`.
- Statut: chorégraphie locale originale; issue dirigée
- Repères temporels:
  - 0 s - Tyler affiche le signal de la station.
  - 2.5 s - Navarro : On peut l’atteindre avec le transporteur.
  - 4.8 s - Rain : Les capsules ne suffiront pas sans leur réserve.
- Dialogues originaux du module:
  - **Tyler** (local): Le signal vient de là-haut. Venez voir.

### S05 - Embarquement

Lieu physique: `JS-PAD` - Point de vue: **Rain**

Vaisseau-hauler au quai industriel. Son embarquement est à la hauteur de sa rampe.

**Rejoindre le groupe à la rampe** (`board`)

- Mise en scène: 6.2 s, contrôle `directed`.
- Statut: chorégraphie locale originale; issue dirigée
- Repères temporels:
  - 0 s - Le groupe rejoint le transporteur.
  - 2.4 s - Navarro : Gardez le passage libre.
  - 4.9 s - Andy : Je suis là.
- Dialogues originaux du module:
  - **Navarro** (local): La cabine est prête. Ne restez pas sous la rampe.
  - **Rain** (local): Andy, avec moi.

### S06 - À bord du Corbelan

Lieu physique: `CB-CORRIDOR` - Point de vue: **Rain**

Coursive étroite à couples répétitifs. Les accès restent au même endroit entre le départ, la maturation et le final.

### S06C - Les points d’arrimage

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

### S06S - Repérer les combinaisons

Lieu physique: `CB-SUIT` - Point de vue: **Rain**

Rangement EVA et accès au cargo inférieur. La descente est un connecteur vertical, pas une porte vers un vaisseau supplémentaire.

### S06F - Le conteneur inférieur

Lieu physique: `CB-CARGO` - Point de vue: **Rain**

Quatre attaches réparties sur le cadre du conteneur. Le local EVA reste au-dessus ; le largage ne se valide pas sur un bouton unique.

### S07 - Au-dessus des nuages

Lieu physique: `CB-COCKPIT` - Point de vue: **Rain**

Même pare-brise, sièges et consoles avant le vol, au crash, à la reprise et au cap final.

**Se préparer au décollage** (`launch`)

- Mise en scène: 16 s, contrôle `directed`.
- Statut: chorégraphie locale originale; issue dirigée
- Repères temporels:
  - 0 s - Navarro prépare la montée.
  - 3.2 s - La plateforme disparaît sous les nuages.
  - 7.8 s - Kay : Regarde…
  - 11.8 s - Le signal de Renaissance se précise.
- Dialogues originaux du module:
  - **Navarro** (local): Installez-vous. Je mets les propulseurs sous tension.

## 03 - Récupérer les capsules

Sas d’amarrage de Remus → baie des capsules → manutention sur rails → coupe de transfert vers le Corbelan

### S08 - Première équipe

Lieu physique: `RM-AIRLOCK` - Point de vue: **Tyler**

Étanchéité, mains courantes et accès au module ancien. Le point de vue passe ici à Tyler pour la récupération initiale.

**Faire ouvrir le sas à Andy** (`seal`)

- Mise en scène: 8.6 s, contrôle `directed`.
- Statut: chorégraphie locale originale; issue dirigée
- Repères temporels:
  - 0 s - Andy vérifie les verrouillages.
  - 2.5 s - Sas extérieur verrouillé. Équilibrage en cours.
  - 4.8 s - Andy : L’ouverture intérieure est libérée.
  - 6.3 s - Bjorn : Les capsules sont plus loin.
- Dialogues originaux du module:
  - **Andy** (local): La pression est stable. Je peux ouvrir.
  - **Bjorn** (local): Les capsules, et on ressort.

### S09 - Les capsules ne suffisent pas

Lieu physique: `RM-BAY` - Point de vue: **Tyler**

Capsules, rails de manutention, diagnostic du fluide. La chambre froide prolonge leur chaîne de service.

**Désarrimer et conduire les capsules vers le sas** (`pods`)

- Mise en scène: 13.2 s, contrôle `directed`.
- Statut: manutention locale animée; transfert complet jusqu’au Corbelan encore condensé
- Repères temporels:
  - 0 s - Les trois bâtis sont encore verrouillés sur leurs rails.
  - 2.2 s - Les brides de transport se libèrent.
  - 4.1 s - Le berceau de manutention prend la première capsule.
  - 7.4 s - Le groupe guide les capsules vers la voie du sas.
  - 10.8 s - Les bâtis fixes restent dans la baie. Le transfert vers le Corbelan commence.
- Dialogues originaux du module:
  - **Tyler** (local): On les a. Mais leur réserve ne couvrira pas le trajet.
  - **Andy** (local): La chambre froide est reliée au même circuit.

### S09K - Ce que Kay n’a pas dit

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

**Retrouver Kay derrière les capsules** (`pregnancy`)

- Dialogues originaux du module:
  - **Rain** (local): Tu es malade depuis le départ ?
  - **Kay** (local): Ce n’est pas seulement le départ. Je porte un enfant.
  - **Rain** (local): Tyler le sait ?
  - **Kay** (local): Pas encore. Laisse-moi le lui dire.

## 04 - La chambre froide

Chambre cryogénique

### S10 - Prélever le fluide

Lieu physique: `RM-CRYO` - Point de vue: **Tyler**

Tiroirs cryogéniques reliés au circuit dont le prélèvement rompt le refroidissement. Pas de facehuggers sortant de conduits sans origine.

**Débrancher la réserve cryogénique** (`thaw`)

- Mise en scène: 7.8 s, contrôle `free`.
- Repères temporels:
  - 0 s - Le raccord est sous charge.
  - 1.8 s - Bjorn: Le flexible est libre.
  - 3.2 s - Tyler: Andy, la porte !
  - 4.4 s - Andy: Mon autorisation ne suffit pas.
  - 6.1 s - Quelque chose bouge sous le givre.
- Dialogues originaux du module:
  - **Tyler** (local): Prends le réservoir. Je surveille le raccord.

## 05 - Le module de Rook

Laboratoire endommagé de Remus → Seuil de quarantaine

### S11 - Trouver une autorisation

Lieu physique: `RM-LAB` - Point de vue: **Rain**

Rook reste un corps endommagé dans ce laboratoire ; ailleurs sa présence passe par le réseau. Les vestiges de Big Chap ne deviennent pas un boss vivant.

**Récupérer le module du synthétique** (`module`)

- Mise en scène: 4.4 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Navarro: Le logement est derrière sa tête.
  - 2.2 s - Le module se déclipse.
  - 3.6 s - Rain: Retournons au seuil.
- Dialogues originaux du module:
  - **Rain** (local): Son autorisation peut ouvrir la porte. Aide-moi à le dégager.

### S12 - De l’autre côté du seuil

Lieu physique: `RM-DOOR` - Point de vue: **Rain**

Andy et les récupérateurs se trouvent derrière la porte. Rain passe le module par l’ouverture, elle ne traverse pas la paroi.

**Passer le module à Andy** (`upgrade`)

- Mise en scène: 12.6 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rain: Tyler, attrape le module.
  - 2.3 s - Tyler: Je l’ai. Ne bouge pas, Andy.
  - 5.8 s - Le synthétique répond.
  - 7.1 s - Andy: Reculez. Je déverrouille.
  - 9.5 s - Rain: Navarro !
- Dialogues originaux du module:
  - **Rain** (local): Le module passe par l’ouverture. Restez près d’Andy.

## 06 - Navarro

Laboratoire endommagé de Remus

### S13 - Navarro et le parasite

Lieu physique: `RM-LAB` - Point de vue: **Rain**

Rook reste un corps endommagé dans ce laboratoire ; ailleurs sa présence passe par le réseau. Les vestiges de Big Chap ne deviennent pas un boss vivant.

**Rétablir l’alimentation de Rook** (`rookAwake`)

- Mise en scène: 5.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rebrancher le poste de service.
  - 2 s - L’alimentation revient.
  - 4.2 s - Rook: Qui a interrompu le confinement ?
- Dialogues originaux du module:
  - **Rain** (local): Il peut nous dire ce qui lui arrive. Je remets le courant.
  - **Rook** (local): Le retirer de votre amie ne garantit pas sa survie.
  - **Tyler** (local): Alors on la laisse comme ça ?
  - **Rain** (local): Non. Nous allons desserrer cette queue, sans lui faire plus de mal.

**Refroidir la base de la queue** (`detach`)

- Mise en scène: 9.2 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rain: Tyler, le réservoir. Je la retiens.
  - 1.5 s - Maintenir le froid sur la base de la queue.
  - 5.5 s - La prise se relâche.
  - 7.2 s - Tyler: Elle respire.
- Dialogues originaux du module:
  - **Rain** (local): Pas de lame. Approche doucement le réservoir.
  - **Navarro** (local): Enlevez-le… loin de moi.
  - **Rain** (local): On l’a retiré. Ne te relève pas trop vite.

**Rejoindre l’accès au transporteur** (`flightBjorn`)

- Mise en scène: 6.6 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Bjorn: On retourne au vaisseau.
  - 2.7 s - Tyler: Bjorn, attends !
  - 5 s - Bjorn entraîne Navarro vers le transporteur.
- Dialogues originaux du module:
  - **Bjorn** (radio): Elle vient avec moi. Kay, prépare la cabine.

## 07 - La collision

Cabine du Corbelan IV → Coursive du Corbelan IV

### S14 - Le départ interrompu

Lieu physique: `CB-COCKPIT` - Point de vue: **Kay**

Même pare-brise, sièges et consoles avant le vol, au crash, à la reprise et au cap final.

**Regarder le scanner de Navarro** (`scan`)

- Mise en scène: 7.1 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Navarro: Regarde. Là…
  - 1.3 s - Navarro passe le scanner sur sa poitrine.
  - 4.7 s - Une forme bouge sous l’image.
  - 6 s - Kay: Bjorn, viens ici !
- Dialogues originaux du module:
  - **Kay** (local): Montre-moi ce que tu vois.

**Se retenir à la cabine** (`crash`)

- Mise en scène: 10.2 s, contrôle `directed`.
- Repères temporels:
  - 0 s - La douleur interrompt la manœuvre.
  - 2.8 s - Kay: Navarro !
  - 5.2 s - Bjorn: Accroche-toi !
  - 7.1 s - Le Corbelan heurte le hangar.
  - 8.8 s - L’alerte de trajectoire se déclenche.
- Dialogues originaux du module:
  - **Kay** (local): Bjorn… tu m’entends ?

### S15 - Après le choc

Lieu physique: `CB-CORRIDOR` - Point de vue: **Kay**

Coursive étroite à couples répétitifs. Les accès restent au même endroit entre le départ, la maturation et le final.

**Rejoindre Bjorn sans toucher la trace** (`followTrace`)

- Dialogues originaux du module:
  - **Kay** (local): Il est passé dans la coursive.
  - **Bjorn** (radio): Reste derrière moi.

## 08 - La chrysalide

Coursive du Corbelan IV → Hangar de Romulus

### S16 - La membrane dans la coursive

Lieu physique: `CB-CORRIDOR` - Point de vue: **Kay**

Coursive étroite à couples répétitifs. Les accès restent au même endroit entre le départ, la maturation et le final.

**Avertir Bjorn depuis le seuil** (`cocoonStrike`)

- Mise en scène: 10.4 s, contrôle `?`.
- Repères temporels:
  - 0 s - Bjorn s’approche de la membrane.
  - 2.1 s - Kay: Bjorn, recule.
  - 5.1 s - La paroi se contracte.
  - 7 s - Écartez-vous de l’acide.
- Dialogues originaux du module:
  - **Kay** (local): Bjorn, ça bouge encore. Ne t’en approche pas.

### S17 - Kay cherche une issue

Lieu physique: `RO-HANGAR` - Point de vue: **Kay**

Le transporteur accidenté reste du même côté du hangar lors du retour. La passerelle supérieure n’apparaît pas au hasard.

**Atteindre la cloison du hangar** (`kayGate`)

- Dialogues originaux du module:
  - **Kay** (radio): Tyler, je suis contre la grande porte. Réponds-moi.

## 09 - La traversée silencieuse

Liaison entre les modules → Escalier de liaison → Galerie de refroidissement

### S18 - Rejoindre Romulus

Lieu physique: `LN-PASSAGE` - Point de vue: **Rain**

La traversée conduit de Remus à Romulus, à pied par les liaisons et escaliers. Pas de téléportation entre les deux ailes.

**Confirmer le passage vers Romulus** (`transfer`)

- Dialogues originaux du module:
  - **Tyler** (local): Le Corbelan a heurté le hangar de l’autre module.
  - **Andy** (local): Nous pouvons encore l’atteindre par la liaison.

### S19 - L’escalier entre les modules

Lieu physique: `LN-STAIRS` - Point de vue: **Rain**

Montée continue. Les marches visibles ont un support physique ; le changement de hauteur reste perceptible.

### S20 - Traverser sans les attirer

Lieu physique: `RO-THERMAL` - Point de vue: **Rain**

Le chauffage masque partiellement la différence thermique. La marche lente reste possible ; il n’est pas nécessaire de crouler artificiellement sous une jauge magique.

**Régler la température du secteur** (`heat`)

- Dialogues originaux du module:
  - **Rain** (local): Réchauffons la pièce. On réduira la différence avec notre peau.
  - **Andy** (local): Ensuite, avancez doucement. Évitez le bruit et le contact.

**Rejoindre la sortie sans courir** (`thermalCross`)


## 10 - Derrière la porte

Cloison du hangar

### S21 - La porte qui n’ouvre pas

Lieu physique: `RO-GATE` - Point de vue: **Rain**

La vitre sépare réellement Kay du groupe. Le joueur ne peut pas sauver Kay en pressant une autre porte ni recevoir les coups d’une créature à travers la cloison.

**Demander à Andy d’ouvrir** (`denial`)

- Mise en scène: 7.4 s, contrôle `free`.
- Repères temporels:
  - 0 s - La cloison reste verrouillée.
  - 1.5 s - Kay: Il est derrière moi…
  - 5 s - Kay est emportée derrière la cloison.
- Dialogues originaux du module:
  - **Rain** (local): Kay est juste là. Ouvre le passage.
  - **Andy** (local): La créature attend notre ouverture. Elle entrera avec elle.
  - **Tyler** (local): Kay, éloigne-toi de la porte !

## 11 - Projet Prometheus

Laboratoire de Romulus : Z-01 → casier blanc → convoyeur (un seul lieu, deux étapes)

### S22 - Le véritable objectif de la station

Lieu physique: `RO-LAB` - Point de vue: **Rain**

Volume ovale et îlot central sous un plafond abaissé. Les deux cuves de prélèvement horizontales ont tuyaux, accès et poste de commande.

**Examiner le stockage Z-01** (`z01`)

- Dialogues originaux du module:
  - **Rook** (screen): Le contenu de ce réfrigérateur doit être préservé.
  - **Rain** (local): Ce n’est pas ce que nous sommes venus chercher.
  - **Rook** (screen): Ce travail devait permettre aux humains de survivre à des conditions qui les détruisent.

### S23 - Le casier du laboratoire

Lieu physique: `RO-LAB` - Point de vue: **Rain**

Râteliers d’armes, poste de surveillance et consigne coque basse. Aucun stock infini de munitions.

**Prendre le F44AA** (`rifle`)

- Dialogues originaux du module:
  - **Tyler** (local): Le casier est ici. Prends celui-là, je vais te montrer.
  - **Andy** (local): Ce pont donne sur la coque. Une seule mare d’acide peut suffire.

**Vérifier l’assistance sans tirer** (`aimLesson`)

- Dialogues originaux du module:
  - **Tyler** (local): Épaule-le. Laisse le viseur se stabiliser. Pas besoin de tirer.
  - **Rain** (local): D’accord. On trouve Kay, puis on sort.

## 12 - La voie du convoyeur

Entrée du convoyeur → Galerie du convoyeur infestée

### S24 - Par le convoyeur de service

Lieu physique: `RO-CONVEYOR` - Point de vue: **Rain**

Le passage bas sort du laboratoire par des lamelles de caoutchouc. La bande rejoint une galerie de manutention, pas une ventilation magique.

**Sortir du convoyeur sous les lamelles** (`conveyorExit`)


### S25 - Kay dans l’alcôve

Lieu physique: `RO-HIVE` - Point de vue: **Rain**

Même charpente au sauvetage, au retour et en gravité coupée. Kay est fixée à une alcôve latérale. La résine conserve la lecture des structures.

**Dégager Kay de la résine** (`kayFreed`)

- Mise en scène: 6.4 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Dégager les épaules, puis le bassin.
  - 1.5 s - Tyler: Doucement. Je la retiens.
  - 4.8 s - Rain: C’est fini. On te sort de là.
- Dialogues originaux du module:
  - **Tyler** (local): Je te tiens. Rain, aide-moi à la dégager.
  - **Kay** (local): Ne me laissez pas ici.

**Préparer le trajet jusqu’au monte-charge** (`noInjection`)

- Dialogues originaux du module:
  - **Andy** (local): L’échantillon pourrait agir sur ses blessures.
  - **Rain** (local): On la met en cryostase. On ne lui injecte rien ici.
  - **Rain** (local): Appuie-toi sur moi. On prend notre temps jusqu’à la porte.

## 13 - Sortir Kay

Vestibule du monte-charge → entrée de Kay dans la cabine → fermeture → départ vertical visible

### S26 - Le passage se referme

Lieu physique: `RO-LOBBY` - Point de vue: **Rain**

La bouche de conduit surplombe le passage au lift. La séparation de Kay et Rain mène au même ascenseur que l’évasion.

**Soutenir Kay jusqu’au monte-charge** (`lossTyler`)

- Mise en scène: 8.2 s, contrôle `free`.
- Repères temporels:
  - 0 s - Quelque chose bouge dans la gaine.
  - 2 s - Tyler: Ne vous arrêtez pas !
  - 5.4 s - Andy est à terre. Le monte-charge est tout près.
- Dialogues originaux du module:
  - **Tyler** (local): Continuez ! Amène-la au lift !

**Confier Kay au monte-charge** (`sendKay`)

- Mise en scène: 9.8 s, contrôle `directed`.
- Statut: cabine fermée et déplacement vertical visible; trajet intégral entre ponts encore condensé
- Repères temporels:
  - 0 s - Rain: Tiens la rampe. Le hangar est au-dessus.
  - 2.4 s - Kay entre dans la cabine.
  - 4.2 s - La grille se referme.
  - 5.5 s - Le monte-charge quitte le palier.
  - 8.2 s - La cabine disparaît dans la cage.
- Dialogues originaux du module:
  - **Rain** (local): Monte jusqu’au hangar. Je retourne chercher Andy.
  - **Kay** (local): Tu vas revenir ?
  - **Rain** (local): Je ne le laisse pas là.

### S26K - Seule au poste de pilotage

Lieu physique: `CB-COCKPIT` - Point de vue: **Kay**

Même pare-brise, sièges et consoles avant le vol, au crash, à la reprise et au cap final.

**S’asseoir et examiner la blessure** (`kayInjection`)

- Mise en scène: 7.6 s, contrôle `directed`.
- Statut: chorégraphie locale originale; issue dirigée
- Repères temporels:
  - 0 s - Kay s’assoit, seule dans la cabine.
  - 2.4 s - Elle sort l’échantillon du sac.
  - 4.6 s - L’injection est effectuée.
  - 6.3 s - La compagnie insiste à l’écran.
- Dialogues originaux du module:
  - **Rook** (screen): Activez le pilotage à distance. Le chargement doit quitter la station.
  - **Kay** (local): Je n’abandonne pas les autres.

## 14 - Revenir pour Andy

Retour au vestibule du monte-charge, à l’endroit où Andy est tombé.

### S27 - Revenir au même seuil

Lieu physique: `RO-LOBBY` - Point de vue: **Rain**

La bouche de conduit surplombe le passage au lift. La séparation de Kay et Rain mène au même ascenseur que l’évasion.

**Retirer le module de Rook** (`andyRestored`)

- Mise en scène: 6.6 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Ouvrir le logement du module.
  - 2.3 s - Le module de Rook est retiré.
  - 4.6 s - Andy: Rain… je suis là.
- Dialogues originaux du module:
  - **Rain** (local): Tu es toujours là. Je vais enlever ce module.
  - **Rain** (local): On repart ensemble.

## 15 - Le sang en suspension

Galerie du convoyeur infestée

### S28 - La même galerie, sans gravité

Lieu physique: `RO-HIVE` - Point de vue: **Rain**

Même charpente au sauvetage, au retour et en gravité coupée. Kay est fixée à une alcôve latérale. La résine conserve la lecture des structures.

**Couper la gravité depuis le relais** (`gravity`)

- Dialogues originaux du module:
  - **Rook** (screen): Le réseau restera fermé. Les échantillons ne doivent pas revenir ici.
  - **Rain** (local): Alors on passe autrement. Andy, reste contre moi.

**Atteindre l’issue du monte-charge** (`acidCross`)


## 16 - La cage d’ascenseur

Cage du monte-charge

### S29 - La remontée

Lieu physique: `RO-SHAFT` - Point de vue: **Rain**

Rails, cabine supérieure et échelles se raccordent verticalement. L’issue de Scorched est un événement situé dans la cage.

**Rejoindre Andy au niveau des rails** (`shaftGravity`)

- Mise en scène: 8.6 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Les rails vibrent.
  - 1.1 s - Andy: Accroche-toi !
  - 3.2 s - Le poids revient. La queue interrompt la chute.
  - 6.8 s - Rain retrouve un appui sur le palier.
- Dialogues originaux du module:
  - **Andy** (local): Les générateurs redémarrent. Attrape un barreau !

**Atteindre l’échelle supérieure** (`shaftClimb`)

- Mise en scène: 7.2 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rain: Sous l’échelle !
  - 2.2 s - Andy rejoint le fusil.
  - 3.3 s - La cabine rabat le spécimen vers les rails.
  - 6 s - Andy: Viens. On peut passer.
- Dialogues originaux du module:
  - **Andy** (local): Reste près de l’échelle. Je retiens la cabine.
  - **Rain** (local): Il est en dessous de moi !

## 17 - Quitter Renaissance

Palier du hangar → hangar → rampe et coursive → cabine → coursive de retour vers les capsules.

### S30 - Le palier du hangar

Lieu physique: `RO-UPPER` - Point de vue: **Rain**

Palier donnant sur le même hangar, avec les anneaux visibles au-dehors. Aucun détour inventé en promenade EVA.

### S31 - Le même hangar accidenté

Lieu physique: `RO-HANGAR` - Point de vue: **Rain**

Le transporteur accidenté reste du même côté du hangar lors du retour. La passerelle supérieure n’apparaît pas au hasard.

**Rejoindre la rampe du Corbelan** (`returnShip`)


### S31C - À bord du Corbelan

Lieu physique: `CB-CORRIDOR` - Point de vue: **Rain**

Même coursive ; état du retour. Aucun nouvel objectif de remplissage.

### S32 - Rompre avec la station

Lieu physique: `CB-COCKPIT` - Point de vue: **Rain**

Même pare-brise, sièges et consoles avant le vol, au crash, à la reprise et au cap final.

**Dégager le transporteur du hangar** (`undock`)

- Mise en scène: 8.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Libération des amarres…
  - 2.2 s - Andy: Le transporteur se dégage.
  - 5.2 s - La station atteint les anneaux.
- Dialogues originaux du module:
  - **Rook** (screen): Le transport doit retourner à Jackson’s Star.
  - **Rain** (local): Les amarres sont libres. Éloigne-nous du hangar.

**Couper la liaison avec Rook** (`rookCut`)

- Dialogues originaux du module:
  - **Andy** (local): L’accès distant est coupé. Le cap nous appartient.

### S32C - À bord du Corbelan

Lieu physique: `CB-CORRIDOR` - Point de vue: **Rain**

Même coursive ; état du retour. Aucun nouvel objectif de remplissage.

## 18 - Le répit

Retour à bord → capsule de Kay → repos d’Andy dans le même compartiment → alerte de cryostase.

### S33 - Installer Kay dans la capsule

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

**Installer Kay en cryostase** (`kayPod`)

- Mise en scène: 7.2 s, contrôle `directed`.
- Repères temporels:
  - 0 s - La capsule est prête.
  - 2.2 s - Rain: Laisse-toi glisser. Je te tiens.
  - 5.1 s - Fermeture du couvercle.

### S34 - Une place pour deux

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

**Mettre Andy au repos près des capsules** (`together`)

- Mise en scène: 6.2 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rain: Je reste avec toi.
  - 3 s - La liaison d’Andy passe au repos.
- Dialogues originaux du module:
  - **Andy** (local): Ma présence risque de compliquer l’arrivée.
  - **Rain** (local): On décidera là-bas. Ton voyage ne s’arrête pas ici.

**Lire l’alerte de la capsule de Kay** (`alarm`)

- Mise en scène: 3.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - La capsule de Kay signale une anomalie.
  - 2 s - Rain: Kay ?

## 19 - La descendance

Compartiment de capsules → chute de l’enveloppe → inspection du fret inférieur → retour au compartiment → fuite dans la coursive → local des combinaisons.

### S35 - L’alerte de Kay

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

**Ouvrir la capsule en alarme** (`birth`)

- Mise en scène: 11.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Déverrouillage d’urgence.
  - 2.1 s - Rain: Kay, reste avec moi.
  - 6 s - L’enveloppe réagit.
  - 8.4 s - Rain: Elle a traversé la grille.

### S35B - L’enveloppe vide

Lieu physique: `CB-CARGO` - Point de vue: **Rain**

Quatre attaches réparties sur le cadre du conteneur. Le local EVA reste au-dessus ; le largage ne se valide pas sur un bouton unique.

**Examiner l’enveloppe dans le fret** (`emptyEnvelope`)

- Mise en scène: 4.7 s, contrôle `directed`.
- Repères temporels:
  - 0 s - L’enveloppe ne contient plus rien.
  - 2.1 s - Rain: Andy ? Réponds-moi.
  - 3.8 s - Un bruit vient du compartiment supérieur.

### S35R - Quelque chose est remonté

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

**Approcher du compartiment des capsules** (`offspringAttack`)

- Mise en scène: 10.2 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Andy se retourne vers la trappe.
  - 2.1 s - Rain: Derrière toi !
  - 6.3 s - Rain: Kay…
  - 8.1 s - Il faut sortir du compartiment.

**Libérer le raccord de refroidissement** (`coldEscape`)

- Mise en scène: 3.8 s, contrôle `?`.
- Repères temporels:
  - 0 s - La conduite cède.
  - 2 s - Rain: Les combinaisons…
- Dialogues originaux du module:
  - **Rain** (local): Andy, lève-toi… La conduite a lâché. Je dois trouver une combinaison.

### S36 - La silhouette dans la coursive

Lieu physique: `CB-CORRIDOR` - Point de vue: **Rain**

Coursive étroite à couples répétitifs. Les accès restent au même endroit entre le départ, la maturation et le final.

**Atteindre l’accès aux combinaisons** (`reachSuit`)


### S37 - La combinaison avant le vide

Lieu physique: `CB-SUIT` - Point de vue: **Rain**

Rangement EVA et accès au cargo inférieur. La descente est un connecteur vertical, pas une porte vers un vaisseau supplémentaire.

**Enfiler et fermer la combinaison EVA** (`suit`)

- Mise en scène: 6.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Fermer la combinaison.
  - 2.5 s - Contrôler la bague du casque.
  - 5.4 s - Rain: Le circuit est fermé.

## 20 - Quatre attaches

Fret inférieur → local EVA → coursive → cabine → coursive → compartiment cryogénique.

### S38 - Les quatre attaches

Lieu physique: `CB-CARGO` - Point de vue: **Rain**

Quatre attaches réparties sur le cadre du conteneur. Le local EVA reste au-dessus ; le largage ne se valide pas sur un bouton unique.

**Accrocher la ligne de sécurité** (`tetherAttach`)

- Dialogues originaux du module:
  - **Rain** (local): La ligne tiendra. Il faut libérer le conteneur.

**Libérer l’attache avant gauche** (`latch1`)


**Libérer l’attache arrière gauche** (`latch2`)


**Libérer l’attache arrière droite** (`latch3`)


**Renverser l’enveloppe au sol** (`acidBreach`)

- Mise en scène: 7.2 s, contrôle `?`.
- Repères temporels:
  - 0 s - L’enveloppe se renverse.
  - 2.4 s - Le plancher se ronge sous l’acide.
  - 5 s - La ligne retient la chute.

### S38E - La dernière attache

Lieu physique: `CB-CARGO` - Point de vue: **Rain**

Quatre attaches réparties sur le cadre du conteneur. Le local EVA reste au-dessus ; le largage ne se valide pas sur un bouton unique.

**Mettre le câble en tension sur la dernière attache** (`latch4`)

- Mise en scène: 4.6 s, contrôle `?`.
- Repères temporels:
  - 0 s - La dernière attache résiste.
  - 2.6 s - Le conteneur se détache.

### S39 - Reprendre pied

Lieu physique: `CB-SUIT` - Point de vue: **Rain**

Rangement EVA et accès au cargo inférieur. La descente est un connecteur vertical, pas une porte vers un vaisseau supplémentaire.

**Verrouiller l’accès au cargo largué** (`climbBack`)


### S39C - À bord du Corbelan

Lieu physique: `CB-CORRIDOR` - Point de vue: **Rain**

Même coursive ; état du retour. Aucun nouvel objectif de remplissage.

### S40 - Corriger la trajectoire

Lieu physique: `CB-COCKPIT` - Point de vue: **Rain**

Même pare-brise, sièges et consoles avant le vol, au crash, à la reprise et au cap final.

**Éloigner le Corbelan des anneaux** (`course`)

- Mise en scène: 7.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Reprise des commandes de vol.
  - 3.4 s - Les anneaux s’éloignent.
  - 6.4 s - Le cap est enregistré.
- Dialogues originaux du module:
  - **Rain** (local): Le cap est stable. Yvaga reste la seule route.

### S40C - À bord du Corbelan

Lieu physique: `CB-CORRIDOR` - Point de vue: **Rain**

Même coursive ; état du retour. Aucun nouvel objectif de remplissage.

### S41 - Le silence du départ

Lieu physique: `CB-CRYO` - Point de vue: **Rain**

Les capsules récupérées sont fixées dans le même compartiment de fret. Aucun hôpital autonome n’est inventé à bord.

**Installer Andy dans sa capsule** (`andyPod`)

- Mise en scène: 8.8 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rain rejoint Andy.
  - 3 s - Elle le ramène vers la capsule.
  - 6.7 s - Fermeture de la capsule.
- Dialogues originaux du module:
  - **Rain** (local): Je te remettrai en état. Pas ici, mais je le ferai.

**Enregistrer le départ et entrer en cryostase** (`ending`)

- Mise en scène: 10 s, contrôle `directed`.
- Repères temporels:
  - 0 s - Rain: Journal de bord du Corbelan.
  - 2.5 s - Rain: Je ne sais pas ce qu’il y aura là-bas. Mais nous partons ensemble.
  - 7 s - La seconde capsule se ferme.

## Réserves de fidélité

- Les deux emplacements du prologue ajoutés au registre restent des séquences temporelles, pas des niveaux libres.
- La manutention des capsules est désormais visible dans la baie; le transfert complet jusqu’au Corbelan reste une ellipse.
- Le monte-charge ferme sa grille et descend visiblement; sa course intégrale entre tous les ponts reste condensée.
- Le lieu précis de l’injection de Kay reste non certifié et n’est pas présenté comme résolu.
- Le couloir de sécurité séparé reste exclu conformément à la référence de production utilisée par le module.
