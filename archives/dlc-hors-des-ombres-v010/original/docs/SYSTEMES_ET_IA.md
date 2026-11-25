# Architecture, IA et limites — V0.9

## État courant

38 pièces, 49 liens et 48 objectifs principaux conservés. Huit interventions annexes. Douze séquences, trente-six tableaux et au plus seize entrées de chapitre réellement enregistrées. Schéma 9, imports 1–9. Trente-deux instantanés historiques authentiques vérifiés. Les preuves courantes sont dans `../qa/RESULTATS_QA_V09.json`.

## Manutention V0.9

`DATA.handling` décrit six objets, leurs poignées, leur aire et les vitesses. Les coordonnées d’un objet sont dans `state.handling.positions`, avec stationnement initial en l’absence de transformation. `roomGeometry` dérive une pièce par état dans un WeakMap ; les données de base ne sont jamais mutées. Le cache de navigation est indexé par l’objet de géométrie et sa révision, pas seulement le nom de la pièce. Un mouvement renouvelle les détours pour les acteurs. Collision, visibilité, sons, lancer, flamme, dessin et plan local reçoivent la géométrie correspondante.

`gripCart` exige une proximité de poignée et deux mains libres. Aucun placement automatique du personnage : l’écart réel à la poignée est conservé. `stepCart` déplace le matériel et l’acteur par sous-pas ≤ 3 unités. Avant chaque sous-pas, il teste l’aire, les meubles, les points d’action, les acteurs et le boîtier au sol, puis la position résultante du personnage. En cas d’obstruction ni le corps ni le chariot ne franchissent le sous-pas. Pas de masse, d’empilement ni de dommage d’écrasement ; les mobiles restent dans leur salle.

X maintenu plus directions est une action de terrain, sans pause. Tirer est plus lent que pousser ; le caniveau garde son ralentissement. Maj n’accélère pas. Chaque déplacement accepté émet périodiquement `cart`, un son utilisant le réseau local/adjacent déjà existant. Rester aux poignées sans bouger ou pousser contre une butée n’émet pas de nouveau bruit de roues.

`releaseCart` libère les mains ; X relâché, dommage, action incompatible, dialogue, focus perdu ou départ de salle l’appellent. Après une action incompatible, `gripPressDone` exige le relâchement avant resaisie. Le panneau N consulte seulement `handling.observed`, pas de télécommande. Le bouton tactile X et une direction utilisent deux captures de pointeur distinctes ; le test CDP annule les deux contacts et vérifie l’arrêt.

La sauvegarde retient positions, observations et distance, jamais la prise active. `restoreHandling` filtre les coordonnées invalides, hors aire ou sur une interaction protégée. Le contrôle final des acteurs utilise les positions restaurées : un personnage à l’ancien emplacement désormais libre d’un chariot reste sur place. S’il se trouve dans du mobilier à cause d’un fichier ancien/incohérent, une recherche locale le remet à une position libre. Ce mécanisme n’est pas un anti-triche cryptographique.

Deux familles de dessin sont ajoutées, mais seulement deux placements nets : quatre anciens objets ont été convertis. Les six mobiles sont inclus dans 316 placements, pas additionnés. 216 fiches du carnet et 52 règles de codex. Les deux parcours de manutention manipulent les six objets avec les mêmes entrées `step` que le clavier, sans injection de transformation.

## Présentation détachée

`DATA.sequences` fournit id, seuil de progression, pièce, effet et trois tableaux (texte original, locuteur écrit, caméra X, durée). `pendingSequence` n’accepte aucune lecture pendant la mort, puzzle, autre document ou cachette. Il attend si une menace locale se trouve à moins de 620 unités pondérées, si une arrivée ennemie est annoncée ou si une fuite active est assez proche. La fenêtre tardive est limitée à trois objectifs après le seuil ; la galerie reste accessible après cette fenêtre.

`makeSequenceState` construit un état préparé séparé avec la progression correspondant au tableau, sans muter le carnet actif. Les adversaires de cette seule copie sont retirés afin de cadrer la scène, et non ceux de la campagne. `drawSequence` utilise les décors existants et des effets procéduraux de coque, terminal et transition. Les vues extérieures ne sont pas des niveaux pilotables.

Les tableaux ne font pas avancer la simulation. Les touches de lecture sont capturées avant les commandes du terrain. La lecture automatique mesure ses propres délais ; le réglage de mouvement réduit supprime le déplacement ambiant, pas le texte. `acknowledgeSequence` marque la lecture mais ne valide ni action ni objectif. Les schémas précédents marquent leurs séquences passées comme vues afin d’éviter une rafale après import.

## Répétitions et entrées

`chapterEntry` exige une partie vivante, non terminée, au premier objectif du chapitre avec un préfixe exact d’objectifs. L’interface enregistre seulement les entrées réellement observées en campagne. Les miniatures sont produites par le moteur. `readChapterEntry` vérifie cohérence du chapitre, pièce et instantané ; les miniatures autorisées sont des données WebP bornées, jamais une URL distante.

`saveSlot` et `checkpointSlot` choisissent séparément campagne et répétition. Le passage sauvegarde d’abord la session active et refuse si l’écriture échoue. Rejouer depuis une entrée charge cet état de monde dans le créneau secondaire. Un import simple reste dans ce créneau et le bouton de reprise après mort utilise son point de contrôle. Le retour charge le carnet principal. La répétition peut continuer après le chapitre de départ, sans changer d’identité de session.

Les entrées absentes d’un ancien carnet ne sont pas fabriquées. Une entrée atteinte peut être conservée ultérieurement ; un import simple de campagne efface la collection précédente pour éviter les mélanges. Aucun verrou multi-onglets n’est implémenté.

## Paquet des mémoires

`validateMemoryBundle` vérifie un objet `atf-marion-memories` schéma 1, deux états sérialisés (répétition facultative) et au plus seize entrées uniques, sans avance sur la campagne contenue. Paquet borné à 5 000 000 caractères ; l’interface borne aussi la taille du fichier. La validation complète précède la confirmation.

L’export complet sérialise directement la session active, même après une erreur de sauvegarde locale, afin de ne pas exporter silencieusement un carnet périmé. L’autre session est lue dans son propre créneau. Une erreur d’écriture de copie préalable à migration ne fait pas rejeter un ancien carnet correctement lu. Ces deux cas sont vérifiés dans le navigateur de test.

`applyMemories` prépare les écritures et lit toutes les valeurs antérieures. Une exception entraîne retrait des nouvelles valeurs puis restauration tentée des précédentes. Un test échoue précisément sur l’écriture du checkpoint principal, troisième valeur non nulle du scénario préparé : le compteur d’une sauvegarde automatique concurrente ne doit pas consommer la panne injectée. Cette restauration n’est pas une transaction garantie contre l’arrêt du processus, une panne permanente ou un deuxième onglet. Les exports extérieurs restent la copie indépendante.

La comparaison du dernier objectif normalise le cas sans objectif, pour ne pas réécrire le checkpoint à chaque image une fois la campagne finie. Un essai navigateur vérifie cette absence de réécriture. Les erreurs de transition ne sont pas masquées, mais un avertissement périmé est effacé après une transition réussie. Les résultats navigateur décrivent un stockage de test en mémoire, pas un stockage natif certifié.

## Bilan

`journeySummary` sépare objectifs, pièces visitées, transcriptions physiques, réparations, opérations de pompage/relevé et passages de compagnon. Le relevé copié n’est pas une vingt-et-unième note physique. Les minutes sont les secondes de simulation divisées par soixante ; aucune durée humaine n’est inférée.

## Systèmes conservés et historique

Les sections ci-dessous conservent les descriptions des versions d’introduction, explicitement datées. Les comptes courants et schémas sont ceux du début de ce document et du manifeste V0.8, pas les anciens chiffres historiques.

---

# Historique V0.7 — archives noyées

## État courant

38 pièces / 49 liens / 48 objectifs principaux / 8 opérations facultatives. Schéma 7 ; imports 1–7. 24 instantanés hérités authentifiés par leurs empreintes. Dix-sept liaisons de poursuite et d’acoustique, pas une chasse globale. 789 contrôles de jeu passent (496 Node, 293 Chromium), plus un audit documentaire séparé.

## Circuit optionnel `DATA.excursion`

`excursionStatus` dérive niveau, phase et opération courante depuis le préfixe `done` et `pumpElapsed`, sans changer les flags principaux. `excursionOperation` contrôle chapitre, ordre, état de vie, portage et niveau d’eau. `stepExcursion` exige proximité, E tenu, absence d’action incompatible et relâchement entre deux validations. Seules les étapes terminées sont sauvegardées. Une étape en cours produit un bruit local toutes les 1,3 secondes ; un dommage annule le maintien avant sa résolution.

`tickExcursion` avance le pompage sur 18 secondes de simulation après le démarreur. Ce tick fonctionne hors de la salle, mais pas dans une lecture en pause. Il émet un bruit à l’emplacement de la pompe toutes les deux secondes. Il n’instancie pas d’ennemi distant. `requiresDrain` sur l’accès échangeurs/front de trimonite est vérifié par le graphe, la transition et la recherche de route. Un détour physique via poste/réserve permet toujours de circuler sans attendre ce passage.

`floodAt` renvoie le niveau seulement dans deux bandes : retour X260–1720, Y≥105 ; échangeurs X230–2000, Y≥108. Au-dessus de 8 % d’eau, le facteur de marche est 0,62 et des pas audibles sont émis périodiquement. La bande arrière reste sèche. Pas de simulation hydrodynamique, de nage ou de dégâts de noyade. Le modèle est un état de jeu partagé avec les jauges et le plan.

## Enregistreur

`recover` crée un unique objet dans `s.excursion.recorder`. Tant qu’il est porté, l’allure est plafonnée et le sprint est refusé. `dropRecorder` stocke la position réelle et refuse la mort, fin ou lecture. `takeRecorder` exige la même pièce et une distance maximale de 76 unités. Le lectorat ne téléporte pas l’objet : `dock` exige `carried`. Les portages narratifs de Ripley/cellule restent incompatibles avec les interventions.

À la copie, seul `v07-pump-record` est ajouté au carnet. Ce n’est ni un signal externe, ni un nouveau chapitre. Le compteur de documents physiques filtre les identifiants de transcriptions pour que cette copie ne produise pas un total 21/20. O demeure consultatif ; la commande de pose dans son panneau ferme d’abord la lecture. M ne montre que le boîtier posé dans la pièce courante, pas d’ennemis.

## Reprise

`restoreExcursion` n’accepte que le préfixe ordonné des huit identifiants et le chapitre autorisé. Le délai est borné 0–18 ; les étapes qui suivent l’ouverture de l’armoire impliquent un cycle terminé. Le boîtier est conservé uniquement entre récupération et branchement. Une position absente/invalide possède un repli dans la réserve, hors collision. Les journaux facultatifs sont reconstruits depuis les textes des données, pas depuis du HTML importé. Les temps de maintien ne reprennent pas. Les copies de migration utilisent `:backup-before-v7`, la clé et `:checkpoint-v2` restant inchangées.

## Vérification et portée

Les huit parcours connus se terminent ; les deux plus complets visitent les 38 pièces et accomplissent toutes les opérations avec les contrôles moteur. Ils connaissent les routes et les solutions, sans prétendre à une exploration humaine autonome. Les tests UI partent de scènes préparées pour exercer les contrôles, interruptions et vues. HTTP et file sont bloqués dans Chromium : document par injection et stockage mémoire explicitement déclaré. Ni persistance native ni fusion avec le dernier hôte certifiées.

Les descriptions suivantes conservent l’historique des systèmes introduits avant V0.7. Les nombres de tests et schémas qui y figurent sont ceux de leur version d’introduction, pas des totaux courants.

---

# Historique des systèmes antérieurs (versions d’introduction)

## Extension V0.6 : maintenance et cartes locales

`DATA.maintenance` décrit trois réparations, trois recettes et les limites du stock. Les portes ajoutées sont des edges normaux avec `requiresRepair`. `activeEdges`, la transition, les routes et les enquêtes acoustiques vérifient cette condition en plus des conditions de chapitre. Réparer ne valide aucun des 48 objectifs. La traverse de décantation ajoute une quatorzième liaison autorisée ; les autres accès réparés ne sont pas des voies de traque.

`stepMaintenance` utilise la proximité du seuil et les maintiens E. Le capot demande 1,1 seconde, les connecteurs 2 secondes et trois pièces, puis l’essai 1,6 seconde. `maintenancePressDone` impose le relâchement entre gestes et avant le franchissement. La pose débite seulement au moment où l’étape se termine. Un dommage, mouvement, portage ou action incompatible annule le temps partiel, pas les étapes engagées. Une pulsation sonore de type machine est émise pendant le geste ; le monde reste actif. Les chantiers ne sont pas des puzzles en pause.

Les 8 activités `salvage` offrent chacune trois composants une seule fois. Le maximum de transport est 30 ; un paquet entier doit tenir, sinon aucune collecte. Le registre `salvaged` est partagé avec le rendu ouvert/vide. Les deux activités `fabricator` ouvrent un panneau sur place. `craftPreview` contrôle quantité, capacité, distance, station et état du joueur ; `craftItem` exige aussi la bonne fenêtre d’établi ouverte. Les recettes produisent un leurre pour 2 pièces, 27 unités de carburant pour 3, un consommable de secours fictif pour 4. Assemblage immédiat en pause, pas une séquence physique animée. Une recette ne déverrouille jamais l’arme avant son objectif.

`maintenanceOverview` alimente le sac I. `trackMaintenance` n’accepte qu’un chantier observé et non terminé. Le suivi ne permet ni fabrication ni réparation à distance. `observeMaintenance` révèle un point à 210 unités pondérées. `localChart` transmet au SVG la pièce courante, les obstacles, le personnage et les points observés ; il ne transmet aucune liste ennemie. X est proportionnel à la largeur, Y est agrandi pour lecture. Il ne s’agit pas d’un système de brouillard géométrique fin couvrant chaque partie de mobilier.

### Schéma 6

Les schémas 1–6 sont acceptés. Les 20 vrais instantanés V0.1–V0.5 sont conservés avec leurs provenances. `restoreMaintenance` filtre les identifiants et dédoublonne les collectes, calcule un budget à partir des casiers puis réapplique les dépenses de chantiers et recettes valides ; la valeur arbitraire du champ parts n’est pas reprise aveuglément. Un chantier déclaré ouvert sans budget reste au stade d’inspection. Les maintiens, entrées et temps partiels sont remis à zéro. Cela borne un document de sauvegarde, sans signer cryptographiquement le carnet ni promettre une protection anti-triche.

Même clé principale ; sauvegarde pré-migration :backup-before-v6 ; checkpoint :checkpoint-v2 conservé. Les fenêtres sont fermées à l’import, les touches ne sont pas rejouées. Le navigateur ne pouvant ouvrir une origine native dans cet environnement, les essais d’interface utilisent explicitement un stockage en mémoire ; aucune certification de persistance réelle après fermeture.

### Validation historique de la V0.6

Lors de la livraison V0.6, les douze suites passaient : 409 tests Node et 250 contrôles Chromium. Les deux parcours obligatoires terminent 48 objectifs sans travaux ; deux parcours supplémentaires terminent les trois travaux et les 48 objectifs avec déplacements et interactions. Les scènes de test de sous-systèmes préparent leurs états. Les scripts savent où aller et quoi faire, pas une exploration humaine autonome. Les 73 captures sont des rendus Chromium, anciens scénarios recapturés compris.

## Systèmes hérités — détails de leurs versions d’introduction

Les sections suivantes conservent les paramètres et limitations lors de l’introduction des systèmes. Dans la V0.6, le schéma était 6, les anciennes migrations comptaient 20 instantanés, et le nombre de liaisons de chasse/acoustique était 14 après réparation de la traverse ; les autres constantes indiquées restent appliquées.


## Extension V0.5 : acoustique locale et observations

Les seuils acoustiques reprennent les treize liaisons autorisées, aux chapitres d’indice 6 à 10. `emitSound` reçoit un point dans une pièce et un type borné (pas rapides, flamme, machine, leurre). La distance est la somme source→seuil et seuil inverse→adulte ; portée maximale 980 unités × volume relatif. Seuls les adultes déjà dans `s.world` sont examinés ; le système n’appelle pas `roomWorld` pour peupler une pièce distante. Une cloison scellée empêche le départ, pas la poursuite déjà engagée. Un événement ne franchit qu’une adjacence. La configuration `sealedTransmission` est réservée et non utilisée dans cette version ; ne pas la présenter comme une atténuation physique implémentée.

L’adulte reçoit un `passage` reason=sound, source fixe, mémoire de douze secondes et franchissement de 1,4 seconde. Le système précédent de trajet et collision assure le déplacement et le transfert d’identité. Les appels ultérieurs n’écrasent pas la piste avec des positions continuellement actualisées. Pas de propagation à deux salles, pas de simulation acoustique par géométrie fine ou matériau. Les portes utilisent leurs disponibilités narratives existantes. Le monde hors champ ne simule que les pistes engagées et les cycles d’appareils/leurres, pas chaque créature à chaque instant.

### Écoute V et synthèse audio

`listenReport` ne modifie aucun état. Portée locale de 780 unités, réduite à 55 % si un obstacle coupe la ligne, ou si un contact voisin se trouve derrière une cloison scellée. Les adultes/facehuggers immobiles sans attaque ou passage ne sont pas révélés. Les contacts voisins ne sont lus que sur une piste en cours, par un seuil autorisé. Les indications répétées sont regroupées par direction et libellé, au plus trois ; le rendu n’affiche ni identifiants ni coordonnées. Le champ `edge` interne n’est pas un radar donnant une position au joueur.

V immobilise le protagoniste et bloque les actions incompatibles, pas `elapsed`, les collisions offensives ou les dangers. À moins de 540 unités horizontales d’une machine active, le relevé indique le masquage plutôt qu’un faux contact précis. Le dessin de l’onde est une aide de lecture stylisée, pas une mesure d’amplitude réaliste. Le journal garde au plus seize propres émissions, rapprochant les répétitions identiques ; il ne consigne aucune position d’ennemi invisible.

`playCue` synthétise des oscillateurs, enveloppes et panoramiques simples. Aucune bande-son ou voix officielle n’est distribuée. Le test vérifie les appels audio, leur compteur et la suspension/reprise du contexte ; il ne prouve ni une écoute humaine ni un mixage final. Le contexte audio est suspendu dans les fenêtres de pause ; les indications visuelles restent disponibles sans son.

### Leurres, adaptation et traces

`dropDecoy` échantillonne le segment de lancer par pas de huit unités et s’arrête avant une collision ; un trajet trop court est refusé sans dépense. Chaque appui R ne dépense qu’une charge jusqu’au relâchement. Les leurres actifs conservent pièce et coordonnées, durée de cinq secondes, pulsation toutes les deux secondes, six leurres au maximum. Le dernier leurre de la pièce sert de cible locale ; les leurres des autres salles poursuivent leur cycle sonore sans téléportation. La vue directe sur le joueur garde la priorité.

Une inspection physique par un adulte demande une proximité de 44 unités et 0,75 seconde au point visé. Une bande de 180 unités en X dans la pièce définit l’emplacement approximatif. Deux inspections terminées dans cette bande rendent les nouveaux leurres de cette bande ignorables pendant quatre-vingts secondes de simulation. Le deuxième leurre en cours n’est pas rétroactivement ignoré. Au plus six bandes sont retenues par individu ; mémoire et identité traversent le seuil ensemble. Les facehuggers ne reçoivent pas cette adaptation. Changer de bande ou laisser expirer la mémoire reste possible ; la flamme n’est pas concernée.

`addResidue` garde douze marques au maximum par pièce. Les boîtiers vides apparaissent après expiration, même hors champ. Les brûlures proches fusionnent et les griffures apparaissent des deux côtés d’une cloison réellement forcée. Elles sont dessinées au sol/sur la porte, ne donnent pas de ressource et ne changent aucune collision. Le compteur des familles et placements statiques reste inchangé.

### Compagnons et lisibilité

Un accompagnant voit un adulte à moins de 370 unités pondérées, avec ligne de vue, avant de lancer une alerte de trois secondes et un délai de douze secondes. Son animation de main et sa posture basse sont raccordées au rendu. Son ordre suivre/attendre reste maître de sa locomotion ; ce comportement ne lui ajoute ni arme, ni santé, ni nouvelle issue narrative.

`occlusionAlpha` abaisse à 0,3 l’opacité d’un objet de premier plan qui recouvre le protagoniste. Props, points d’activité et supports d’objectif sont concernés. Une cachette occupée est explicitement exclue. Il s’agit d’une correction de lecture, pas d’une modification des empreintes ou de la vision ennemie. L’échelle de rendu reste schématique.

### Schéma 5

Les schémas 1–5 sont acceptés. Leurs tableaux de sons, leurres, mémoires et résidus sont filtrés par types, identifiants, pièce, position, taille et durée. Le nouveau modèle conserve les cycles encore actifs, mais pas une touche maintenue, la fenêtre de lecture ou l’écoute active. L’alias `decoy` est reconstruit à partir des leurres de la pièce. Seize carnets issus des anciennes archives sont vérifiés avec provenance ; ce contrôle ne valide pas le stockage natif du navigateur.


## Extension V0.4 : trajets, verrous et services

`markExitTrail` crée une piste seulement pour un adulte non étourdi, hors appui, avec une sortie vue à portée de détection ou un bruit >0,55 à moins de 520 unités. `passage` contient from/to/edge, 18 s de mémoire et 1,4 s de franchissement ; aucune position suivante du joueur. `updatePursuit` ne simule hors champ que ces pistes déjà engagées. Il utilise le même `navigateActor` et les mêmes empreintes d’obstacle. Une arrivée transfère le même objet ennemi d’une liste de salle à l’autre. Revenir dans la pièce d’origine annule ce transit. Gagner une autre salle ne transmet pas une nouvelle cible. La sortie peut être suivie dans les deux sens sur treize liaisons validées.

Les limites de chapitre et la liste blanche sont revérifiées avant toute traversée. Les refontes narratives de confinement ne sont pas contournées. `roomWorld` conserve ses apparitions locales préexistantes ; cette extension ne rajoute pas d’apparition de poursuite. Une pièce déjà occupée par deux adultes retarde le transfert jusqu’à libération ou expiration de piste. Aucun facehugger ne reçoit cette logique inter-pièces. Pas de directeur global autonome ni de graphe de pistage omniscient.

`doors[edge]` est commun aux deux seuils d’une liaison. Délai 14 s ; pression cumulative 5,5 s quand l’adulte a atteint le seuil ; endommagement 35 s après rupture. Une libération manuelle impose 3 s de retour mécanique avant réarmement. `activeEdges` exclut les verrous actifs, mais sa variante `includeSealed` conserve les accès de chapitre pour autoriser la libération. B se manipule à proximité (135 unités pondérées en profondeur), jamais à distance. E tenu une seconde libère sans franchir dans la même mise à jour. L’entrée de portage médical refuse cette manipulation. La touche doit être relâchée après une bascule.

`lightsOff` nomme uniquement les six salles équipées. `lightAt` y conserve au moins 0,1 d’éclairage relatif ; les lampes de secours restent dessinées et la lampe personnelle conserve son réglage. La pénombre ajoute un voile de fond, pas une obscurité qui cache toute l’interface. `machines[id]` utilise 10 s actives puis 18 s de refroidissement ; pas de dépense de ressource portative. Une machine attire à moins de 1150 unités seulement si le joueur n’est pas vu et n’est pas à moins de 100 unités. Ce n’est pas une simulation acoustique par matériaux. La cible sonore est le point réel de l’appareil.

K ne contient aucune action distante. Les dix services sont des activités non solides, séparées d’au moins 170 unités des autres commandes. Leur rendu est traité séparément du catalogue de 46 props ; les huit verrous apparaissent sur leurs seize extrémités. Ne pas additionner ces éléments au compteur de 268 placements de décor sans changer de définition.

Les appels `step` sont suspendus dans les dialogues UI ; le moteur lui-même refuse d’avancer lorsqu’une lecture ou un puzzle est actif. Les nouveaux délais, lumières et pistes sont repris en schéma 4. Les champs autorisés sont bornés ; from/edge/to doit correspondre à une liaison réelle, et les identités ne peuvent pas se dupliquer entre salles. Douze instantanés authentiquement extraits des versions précédentes ont été importés, avec provenance dans qa/fixtures.

## Séparation du code
`src/oth-v1/oth-data.js` porte le contenu ; `oth-engine.js` ne dépend pas du DOM ; `oth-render.js` dessine le monde ; `oth-ui.js` gère les entrées et fenêtres ; `oth-bridge.js` est un lanceur additif, pas un adaptateur natif de moteur. Le nom stable `oth-v1` ne désigne pas la version du package. Le bundle autonome et l’entrée modulaire utilisent ces mêmes modules.

## Progression et déplacement
Les objectifs sont un préfixe ordonné de 48 identifiants. Une sauvegarde ne peut pas insérer une fin au milieu de ce préfixe. Les 40 liaisons ont deux extrémités dans 34 salles. Chapitres minimum, blocages de puits et largage du Narcissus gouvernent le graphe et les portes. Le déplacement est 2D avec profondeur de sol 0…180 ; les couloirs de profil maintiennent y=88. Ce n’est pas une caméra 3D libre.

L’empreinte d’un obstacle solide est sa largeur déclarée et une bande de 36 unités centrée sur son Y. Le déplacement applique une marge de personnage, en pas subdivisés. La silhouette dessinée, sa hauteur et les mètres indicatifs du catalogue ne définissent pas cette collision. Les objets d’activité sont non solides, accessibles depuis la circulation. La couche purement visuelle de services et de lumière ne bloque pas le joueur.

## Navigation locale
`findPath` construit un graphe de visibilité à partir des coins des rectangles d’obstacle élargis. Les segments ne sont acceptés que s’ils laissent passer l’empreinte du mobile. Le trajet le plus court sur ce graphe est ensuite suivi ; un cache évite de reconstruire inutilement le graphe statique. La cible mobile peut faire recalculer sa trajectoire. C’est un graphe de visibilité, pas un A*, un navmesh 3D ou un système de circulation inter-pièces autonome.

`navigateActor` partage le contrôle de collision avec les mobiles. Les tests font contourner 90 obstacles sélectionnés dont les points de départ et d’arrivée sont libres, et traversent la circulation centrale des 34 salles. Une cible dans un obstacle retourne une impasse ; elle n’autorise jamais à traverser ce meuble. Ces tests ne représentent pas toutes les positions possibles ni chaque enchaînement humain.

## Compagnons
Trois définitions gouvernent le suivi. Le compagnon apparaît dans sa salle initiale uniquement si le joueur la rejoint pendant sa plage narrative. Sa position suit ensuite la simulation, sans recalage permanent près du joueur. Les placements statiques du même personnage sont exclus.

G alterne attendre/suivre. Un personnage en attente ne change pas de salle à distance et ne peut pas être rappelé depuis une autre pièce. Un personnage suiveur à plus de 240 unités du joueur empêche le franchissement immédiat ; attendre sa venue ou lui demander de rester. Quand il est proche, les deux acteurs franchissent la même liaison vers le même côté d’arrivée. Ce changement de salle reste une transition discrète, pas une marche animée continue à travers les deux plans.

L’accompagnant garde environ 94 unités de séparation, vise une position en retrait, réduit sa vitesse quand le joueur s’accroupit et attend devant une fuite active proche. Il possède une position, un ordre, un état de locomotion et une direction. Il n’a ni barre de santé indépendante, ni tir autonome, ni mort alternative. Les fins de suivi sont liées aux objectifs et ne modifient pas les conséquences scénarisées. Les interruptions médicales et le portage restent des séquences distinctes.

## Perception et combat
`lightAt` calcule l’intensité en utilisant l’ambiance de la pièce et ses sources locales ; `detectionRange` ajoute la posture et la lampe du joueur. La portée de base est plus faible accroupi. Les objets solides coupent la ligne de vue. L’indicateur résume une exposition relative, sans carte des positions ennemies. Ce n’est pas une simulation photométrique ni un cône de vision directionnel.

Une menace visible suit le joueur ; une menace attirée par le bruit ou un leurre enquête sur une position. Hors perception, la dernière cible est conservée pendant un court temps de recherche avant le retour à la patrouille. La perception ordinaire et les facehuggers restent locaux. Un adulte peut toutefois engager le transit V0.4 décrit plus haut sur treize liaisons, à partir d’une sortie perçue ; il n’y a pas de directeur global de chasse à travers les 34 lieux.

À courte distance, l’adulte prépare son coup pendant 0,62 s ; le facehugger pendant 0,36 s. Le coup vérifie encore portée, obstacle et protection à sa résolution. S’écarter à temps évite la blessure. Une flamme met la créature en recul et annule la préparation. Une attaque terminée crée une récupération. Ces délais sont mesurés dans le temps de simulation, pas garantis à la milliseconde réelle sur une machine ralentie.

Le chalumeau n’est disponible qu’après préparation, utilise du carburant et repousse au lieu de tuer automatiquement l’adulte. Les leurres restent locaux et temporaires. Les œufs conservent leur état dormant, ouverture et éclosion ; le facehugger éclos est un mobile séparé. Aucun cycle biologique complet n’est simulé.

## Cachettes
Les neuf caches d’ombre sont des activités de proximité dans une salle précise. Le joueur doit s’en approcher puis maintenir E. La ligne de vue d’une créature empêche l’entrée, tout comme le portage de Ripley ou d’une cellule. Le corps passe en pose basse et la lampe n’éclaire plus visuellement la cachette ; l’état de préférence de lampe lui-même n’est pas détruit.

Un mouvement, une flamme ou un leurre annule la dissimulation. Une créature non étourdie à moins de 58 unités pendant plus de 1,6 s inspecte le renfoncement et force la sortie, avec un avertissement et une protection brève. La cachette active n’est pas restaurée à l’import. L’absence d’un cône de vision directionnel implique qu’il faut rompre la ligne de vue ou la portée, et non simplement passer derrière la tête du dessin.

## Éclairage, rendu, carte
Les positions des sources de lumière proviennent du même registre que le calcul de visibilité. Les faisceaux visibles restent stylisés ; pas d’ombres géométriques dynamiques promises. Le tri de profondeur utilise le pied des objets et acteurs. Les réserves collectées restent sous forme de conteneurs ouverts sans contenu. Les niches de l’épave utilisent des nervures plutôt que de la tôlerie humaine. Les nouveaux services muraux et rails de lumière ne sont pas des nouvelles portes utilisables.

Le plan utilise `chart`, limité aux lieux visités et aux seuils approchés à moins de 210 unités. Les noms des destinations non visitées restent inconnus. Les connexions entre lieux visités peuvent être montrées une fois reconnues ; la carte est topologique, non métrique. Les plans complets du codex externe sont des documents de production et contiennent donc des spoilers ; le joueur ne les voit pas dans le plan d’exploration.

## Interventions et récit
Seize commandes à étapes sont conservées : cinq dérivations, huit procédures, deux pressions et une fréquence. Elles gardent leurs réglages quand on ferme le panneau. Les fenêtres mettent le monde en pause. Une erreur n’avance pas l’objectif et peut influer sur le bruit après retour au jeu.

Vingt transcriptions, huit réserves et trois vannes sont physiques et persistantes. Une ressource déjà pleine ne consomme pas la réserve. Trois fuites alternent leurs phases ; leurs dégâts ont un délai de récupération. Les 24 placements statiques d’équipage, dix interlocuteurs et quatorze événements d’histoire sont conservés. Une perte ou blessure change les présences ; les scènes individuelles ne sont pas toutes animées.

## Sauvegarde et intégration
Le schéma 9 accepte les états 1 à 9, borne ressources et coordonnées, filtre les identifiants connus et conserve le préfixe d’objectifs. Les champs compagnons, découvertes, métriques et options sont ajoutés sans toucher aux clés des autres DLC. L’import annule fenêtres, cachette, trajectoires temporaires et attaque imminente ; une protection d’arrivée évite une blessure instantanée. La mémoire de recherche est conservée quand elle est valide.

L’installateur ajoute une carte Opérations et un jeu dans sa page distincte. Sept fichiers sont copiés, le point d’entrée est sauvegardé et les empreintes protègent l’upgrade/retrait. Cette livraison n’est ni une intégration native GameEngine/SaveSystem/MIRE ni une mise à jour du dernier hôte complet.

## Portée des preuves
Les contrôles Node couvrent règles, régressions, installateur, serveur, cartes et trajectoires. Les contrôles navigateur opèrent des commandes DOM, clavier et pointeur. Les scènes sont préparées, à l’exception des états explicitement issus des parcours moteur. Le test d’esquive est distinct de la capture de préparation : capturer une image peut prendre plus longtemps que le délai d’attaque.

Chromium a refusé les navigations HTTP/fichier avec ERR_BLOCKED_BY_ADMINISTRATOR. Le document est exécuté via set_content et un double mémoire déclaré de localStorage. Les routes HTTP ont été testées séparément par Node. Le lancement double-clic, la persistance native après fermeture, la manette et un parcours humain complet ne sont pas certifiés. La médiane d’images d’une courte séquence de test n’est pas une promesse de performances sur le poste du joueur.

## Production restante
Art et animations définitifs ; mise en scène fine de toutes les pertes ; playtests humains et appareils supplémentaires ; validation native du stockage ; traque globale avancée non implémentée ; fusion avec la dernière pile du projet hôte. Aucune de ces limites n’est effacée par les compteurs de tests.
