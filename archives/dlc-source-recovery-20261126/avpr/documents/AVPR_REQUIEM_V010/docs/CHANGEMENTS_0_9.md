# 0.9.0 — La nuit en main

## Périmètre et continuité

« La nuit en main » prolonge le véritable pack autonome 0.8. Les niveaux, liaisons, personnages, objectifs, rencontres, coffrets, secours, outils, dangers et conduits conservent leurs définitions. Cette passe développe l’accès aux mécanismes, les commandes et la relecture ; elle n’ajoute ni salle, ni adversaire, ni mission principale.

Le moteur reste Canvas/JavaScript, avec graphismes vectoriels et procéduraux. Les pictogrammes de la roue et les silhouettes des cartes de chapitres sont des éléments d’interface dessinés par code. Ce ne sont pas des portraits photoréalistes, des captures du film ou des sprites officiels. Le récit, les plans et les raccords demeurent une adaptation de fan non officielle.

## Roue d’actions contextuelle

Tab ouvre la roue seulement sur un terrain actif, avec un personnage en vie et une séquence non terminée. Le temps de simulation est suspendu : intelligence artificielle, déplacements, dangers, vol et horloge d’évacuation. Ce n’est pas un ralenti pendant lequel une créature pourrait encore frapper.

Les quatre catégories sont Armes, Terrain, Groupe et Carnets. Les flèches changent l’action ; Tab / Maj+Tab changent de catégorie ; Entrée confirme ; Échap ferme sans exécuter. Les boutons se choisissent aussi à la souris ou par contact tactile. Les gestes indisponibles restent identifiables, avec une raison : santé maximale, réserve vide, masque retiré, mains occupées ou passage contraint. Une restriction de portée ou de terrain vérifiée par le moteur peut encore refuser une action après fermeture : la roue n’est pas un moyen de contourner les règles.

Choisir une arme l’équipe sans tirer. Un soin sélectionné démarre ensuite sa véritable durée d’immobilité, interrompable par une marche ou un coup. Les coûts sont ceux des mécanismes existants ; consulter ou annuler ne produit pas de récompense.

La balise et le plasma chargé utilisent deux étapes. Choisir l’outil ferme la roue et prépare l’action sur le terrain vivant. Il faut viser, puis confirmer avec Attaque : Espace, clic gauche, gâchette droite ou bouton tactile. Échap / bouton droit de la manette annule. La balise n’est payée qu’à la pose. La charge de plasma se déroule en temps normal et non derrière le menu. Les anciens raccourcis Y et T maintenus restent disponibles.

Pendant le portage, les outils demandant les mains sont refusés mais Déposer reste accessible. Dans un escalier ou le vol, la roue s’ouvre sur les Carnets ; les gestes à pied restent indisponibles. Le plan, le dossier et les commandes sont consultables sans téléportation. La roue ne remplace pas la recherche de chemin des compagnons ou les contraintes physiques des relais.

## Manettes standard

Le lecteur interroge la Gamepad API et accepte les périphériques déclarés `mapping: standard`. Une manette non standard est ignorée plutôt que de recevoir une correspondance improvisée. Le premier périphérique standard disponible est retenu, puis son index reste suivi tant qu’il est présent. Il n’y a ni multijoueur local, ni vibrations, ni gyroscope, ni configuration libre des touches dans cette version.

| Entrée standard | Terrain | Menu / roue |
|---|---|---|
| Stick gauche | Déplacement analogique ; altitude et allure en vol ; support dans les raccords | Navigation / choix radial |
| Stick droit | Visée sur le sol ; direction latérale dans une pièce de profil | Choix radial |
| Gâchette droite | Attaquer ; confirmer un outil préparé | Pas de tir derrière les menus |
| Gâchette gauche | Allure précise réduite ; frein dans le vol | Sans action de combat |
| Bouton bas | Interagir | Confirmer le contrôle sélectionné |
| Bouton droit | Esquiver ; annuler un outil préparé | Revenir / fermer lorsque permis |
| Bouton gauche | Recharger | Sans raccourci destructif |
| Bouton haut | Ouvrir / fermer la roue | Fermer la roue |
| Épaule gauche | Garde de Wolf ou mise à couvert humaine | Catégorie précédente de la roue |
| Épaule droite | Arme suivante | Catégorie suivante de la roue |
| Menu | Pause | Fermer la roue |
| Affichage / View | Carnet | Consultation |
| Bouton du stick gauche maintenu | Courir | Aucun saut de sélection |
| Bouton du stick droit | Basculer l’accroupissement | Aucun geste derrière le menu |
| Croix haut / bas | Plan / soin | Parcourir les contrôles |
| Croix gauche / droite | Vision ou lampe / ordre d’escorte | Parcourir ; modifier un curseur ou une liste ciblée |

Les noms positionnels évitent de confondre les marquages A/B/X/Y ou les symboles selon les fabricants. La zone morte radiale est réglable de 12 à 38 %, 20 % par défaut. L’inversion de visée verticale est indépendante des commandes de déplacement. Les préférences de manette et de panneau tactile sont stockées séparément de la campagne et ne changent pas quand une relecture remplace l’état joué.

À la connexion, après certains changements d’écran et après la confirmation d’un outil, les boutons et sticks doivent revenir au neutre. Les gâchettes partiellement enfoncées sont aussi prises en compte. Un bouton tenu ne se transforme pas en plusieurs pressions de menu. Une attaque clavier ou souris maintenue pendant l’ouverture d’une roue ne repart pas automatiquement à sa fermeture. La déconnexion d’une manette utilisée sur le terrain provoque une pause et un message ; le clavier et la souris restent utilisables.

Les essais utilisent un périphérique synthétique déclaré à `navigator.getGamepads`, puis la boucle normale du navigateur. Ils ne certifient pas une DualSense, une manette Xbox, un pilote Bluetooth ou USB physique. Le navigateur peut exiger une première action sur le périphérique avant de le révéler. Le diagnostic indique ce que la page reçoit effectivement.

## Chapitres rejouables et sauvegardes séparées

Le menu propose une bibliothèque de quinze séquences. Seules les séquences déjà atteintes localement, ou reconnues dans une sauvegarde de campagne importée, sont sélectionnables. Les titres des séquences non atteintes restent masqués dans cette interface. L’archive garde le plus haut chapitre atteint ; lancer une nouvelle campagne ne retire pas les accès déjà acquis. Il ne s’agit pas d’un verrou anti-triche distant.

Deux origines sont explicitement distinguées. **Entrée mémorisée** : première arrivée au début de ce chapitre effectivement enregistrée par la 0.9 dans l’archive locale, avec ses blessures et ressources. **Dotation reconstituée** : équipement d’entraînement construit pour un ancien chapitre atteint, faute d’entrée historique enregistrée. Ce second cas ne prétend pas connaître l’ancien inventaire. Les drapeaux nécessaires à l’ordre narratif sont reconstruits ; les armes restent soumises à la séquence. Les trois difficultés sont sélectionnables. Les points de vie des rencontres initiales sont adaptés à la difficulté choisie, sans transposer les récompenses dans la campagne.

Une relecture s’arrête au bilan du chapitre choisi. Elle ne déroule pas automatiquement le suivant. Le bilan présente seulement les objectifs et deltas de cette tentative : temps simulé, éliminations, dégâts et échecs. Les reprises enregistrées dans les résultats ne débloquent aucun chapitre. Rejouer depuis le début restaure la graine de la relecture ; la reprise après un échec utilise son propre point sécurisé.

Il existe **un emplacement courant de relecture**, distinct de la campagne, pas quinze parties parallèles. Choisir une autre séquence remplace cette reprise courante. Exporter son JSON avant de la remplacer permet de la conserver. L’archive garde au maximum trente bilans locaux. Elle n’est ni un succès Steam/PlayStation ni un profil partagé avec Tantalus.

L’export de relecture est nommé `AVPR_REPRISE_CHAPITRE.json`. Il contient un format explicite `avpr.rehearsal.v1`, l’origine, la graine initiale et l’état courant. L’import reconnaît ce format et l’envoie vers l’emplacement de relecture, sans le traiter comme une campagne ordinaire. Le retour à la campagne restaure le dernier état principal enregistré. Les stocks, ressources, secours, relevés et objectifs obtenus en relecture ne s’y transfèrent pas.

| Clé locale | Fonction |
|---|---|
| `tantalus.mire.avpr.v1` | Campagne principale, identique aux anciennes versions |
| `tantalus.mire.avpr.v1.checkpoint` | Point sécurisé de campagne |
| `tantalus.mire.avpr.v1.chapters.v9` | Plus haut chapitre atteint, premières entrées mémorisées et bilans |
| `tantalus.mire.avpr.v1.replay.v9` | Relecture courante isolée |
| `tantalus.mire.avpr.v1.replay-checkpoint.v9` | Point de reprise isolé |
| `tantalus.mire.avpr.v1.controls.v9` | Zone morte, visée et panneau tactile |

Les formats ordinaires 0.1 à 0.8 passent toujours par le même chargeur du moteur. Les archives de chapitres absentes ne donnent pas de souvenirs fictifs : elles reconnaissent seulement le chapitre atteint et utilisent la reconstruction quand nécessaire. Conserver le fichier original avant import ; le retour d’un export 0.9 dans une version plus ancienne n’est pas garanti. L’export de campagne ne contient pas toute l’archive locale des entrées ; pour changer d’appareil, les chapitres anciens restent rejouables par reconstruction. Exporter séparément la reprise en cours pour emporter son état exact.

Un refus de stockage local ou une saturation laisse l’ancien texte sauvegardé intact et signale l’indisponibilité. Ce mécanisme ne promet pas de stockage infini, de synchronisation cloud ou de récupération d’un fichier supprimé. L’export JSON reste la méthode explicite de conservation manuelle.

## Tactile et présentation

Le panneau compact est activé par défaut. Il conserve les directions, l’attaque, l’esquive, l’interaction et la roue. Les autres outils passent par cette dernière. En vol, le frein reste accessible. Le panneau complet des versions antérieures est réactivable dans les réglages. La commande tactile de roue vérifie que le contact a commencé sur son propre bouton avant de valider le clic ; elle ignore un clic de compatibilité retargeté après déplacement des contrôles : masquer le bouton Utiliser à l’entrée d’un escalier ne déclenche pas la roue à sa place. Les contrôles mobiles sont testés par émulation de viewport et contacts navigateur, pas sur un téléphone physique.

Le bandeau supérieur est réorganisé en trois rangées sur petit écran pour conserver le cinquième bouton sans empiéter sur le terrain. Les largeurs radiales s’adaptent aux écrans étroits afin de ne pas chevaucher les boutons voisins. En paysage très bas, le dialogue de roue peut défiler verticalement ; les cibles ne sont pas écrasées pour faire tenir toute la roue dans quelques pixels. Le jeu reste en composition 16:9 ; le portrait conserve des marges, sans nouveau cadrage vertical du monde.

## Installation et limites

`JOUER_AVPR.html` est le module autonome assemblé, utilisable sans requête réseau. Les sources sont séparées pour modification ; `npm run build` reconstruit le HTML. Le lanceur et le serveur local de secours restent dans le pack.

L’installateur facultatif ajoute ou met à niveau uniquement l’accès AVP-R dans un menu Tantalus reconnu. La mise à niveau emploie le véritable HTML et le véritable installateur 0.8, sur un menu temporaire de test. L’ancien payload est conservé, les modifications inconnues sont refusées, le contrôle à blanc n’écrit pas et la désinstallation restaure le menu selon le reçu. Aucun GameEngine commun, profil Frontier, récompense partagée, dépôt distant ou déploiement n’est modifié.

Les campagnes automatisées utilisent le cheminement et les attaques du moteur, mais connaissent la carte et visent précisément. Les relectures standardisées terminées ne remplacent pas une partie humaine ni un équilibrage du stock. Chromium exécute le HTML avec un Storage mémoire explicite après un refus effectif de la navigation HTTP locale dans cet environnement. Pas de validation native `file://`, de téléphone ou de manette physique, ni d’écoute au casque. Plusieurs événements restent narratifs et le rendu reste procédural.

## Résultats

506 tests Node, 482 contrôles Chromium, 12 campagnes et 45 relectures terminées. Voir les fichiers de rapport pour les méthodes.
