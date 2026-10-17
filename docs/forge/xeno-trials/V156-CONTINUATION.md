# V156 — présentations, postures, vie des annexes et récits Forge

Base cumulative : V155 `a995cf197c2472185b994d1f7c2461b4ddb39efe`.
L’application reste en 143.0.0 et les sauvegardes en schéma 52. Les dépendances
et les quatre textures sources des rigs restent inchangées.

Cette passe reprend des manques précis du suivi Excel et des audits. Elle
raccorde des comportements techniques sur des ressources existantes. Les
40 présentations des quatre identités restent **partielles artistiquement** :
aucun lot de dessin complet n’est clos et aucun kit n’est certifié 1:1.

## Quarante présentations raccordées

Le catalogue historique `XENO_TRIALS_SEQUENCES_V155` conserve ses 20 séquences.
`XENO_TRIALS_ADDED_SEQUENCES_V156` ajoute les 20 raccordements manquants des
quatre mêmes identités : Prowler, Cultiste Darwin Era, Commando Weyland-Yutani
et Guardian. Le catalogue cumulatif `XENO_TRIALS_SEQUENCES_V156` contient
40 séquences de cinq points clés, soit 200 clés explicites.

Les cinq ajouts par identité sont les suivants :

- `intro-rival` : réaction à la famille effective de l’adversaire pendant son
  entrée, sur 1 200 ms. Aucune rivalité historique ou réplique canonique n’est
  postulée.
- `outro` : retour de la pose terminale réellement jouée vers la vigilance,
  sur 600 ms après la réaction finale V155 de 1 800 ms. La sortie spatiale par
  une ouverture reste à produire.
- `draw` : réaction de 1 800 ms sur une égalité effectivement résolue de manche
  ou de match, sans vainqueur inventé.
- `taunt` : défi de simulation sur 1 100 ms, par T ou le bouton DÉFI, au sol et
  pendant le combat actif. Le combat continue ; déplacement, garde, attaque
  ou impact interrompent la présentation. Ce geste n’ajoute aucun pouvoir.
- `rematch` : reprise pendant les 3 000 ms du décompte déjà utilisé pour les
  manches suivantes. La réinitialisation physique reste celle du moteur.

Les événements de match restent propriétaires du résultat. Les présentations
n’écrivent ni dégâts, ni récompenses, ni deuxième verdict. Pause, perte de
focus, mouvement réduit, fermeture et passage de séquence conservent leurs
contrats. Les 185 autres identités gardent leurs rendus et règles précédents.

## Abaissement articulé pendant une saisie

`XENO_TRIALS_RESTRAINT_POSE_V156` applique une flexion bornée aux trois cibles
humaines admises. Le bassin et le torse descendent ; une cage des deux jambes
suit les articulations mesurées. Les pieds et la bande des semelles restent
sur leur support. Les abaissements maximaux sont exprimés dans les pixels
sources : 72 pour le cultiste, 124 pour le commando et 150 pour le Guardian.
Ce ne sont pas des distances physiques ajoutées au moteur.

L’entrée dure 0,24 s. La libération revient depuis l’amplitude réellement
atteinte, avec la récupération V153 existante. Le Prowler conserve ses appuis
quadrupèdes. Une géométrie invalide conserve la pose V154 déjà admise ; le
mouvement réduit garde les textures natives sans ajouter cette flexion.

Les lignes ART153 de saisie, résistance et retour sont mises à jour sans
changer leurs IDs ni leur qualification artistique. Le bilan reste huit
adaptations techniques, neuf tâches partielles et onze relevés, productions
ou revues encore ouverts. Une victime couchée, un pin au sol complet, la
réception complète du bond, les dessins cachés et les relevés d’œuvre restent
à produire. Les tests de maillage ne valent pas approbation artistique.

## Présence conditionnelle dans les annexes

Les six affectations V141 demeurent la base. Quatorze rotations de service
répartissent les membres existants dans les autres espaces à des heures
déclarées. Le suivi liste les 19 annexes ; 18 possèdent une affectation
possible sur le planning. Aucun nouveau personnage ni double acteur n’est
créé.

La présence exige une phase de travail native. Repos, trajet, alerte, mission
et soins restent prioritaires. Les rondes locales utilisent les rails
physiques disponibles ; les postes de moins de 70 pixels restent fixes. Le
responsable de logistique utilise la vraie passerelle à y=468, les autres
postes le sol à y=624. Les retours de portes, échelles, consoles, mobilier et
silhouettes des deux orientations entrent dans les réservations de placement.

L’accueil animalier reste explicitement différé : ses couchages, plaques et
enclos ne laissent pas de poste adulte dégagé sûr dans tous les états
équipés/non équipés. Réserver ce poste constitue encore un travail de level
design. La distribution par horaire ne comprend pas de marche continue entre
les annexes ; les mouvements simulés restent locaux à la salle.

## Récits à choix sur les terminaux Forge

Les terminaux physiques peuvent recevoir un récit de schéma 1 dans le projet
Forge de schéma 3. Le contrat borne chaque projet à 64 terminaux narratifs,
chaque terminal à huit pages et chaque page à deux réponses. Un texte comporte
au plus 600 caractères, un titre ou une réponse au plus 100.

Les liens entre pages doivent exister et le graphe doit rester sans boucle,
y compris dans les pages de brouillon. Une réponse peut exiger un objectif
physique existant ou en valider un, y compris dans une autre salle. Une
récompense déjà appliquée n’est pas répétée ; exiger l’objectif que la même
réponse doit attribuer est refusé.

L’inspecteur permet l’édition avec annulation/rétablissement. L’import/export,
les versions et différences V136 conservent les récits ; les copies ne
remappent que les objectifs copiés avec elles. En playtest Mission et Vaisseau,
E ouvre le vrai terminal. Les choix se font dans une fenêtre DOM au clavier
ou au clic, avec le monde suspendu. Le curseur, l’historique et les objectifs
restent en mémoire au changement de salle puis au retour.

La progression du test reste limitée à la session en cours. Le cloud Forge,
les checkpoints durables, personnages parlants, conditions d’inventaire,
minuteries et scripts libres restent ouverts. Aucun récit ne modifie une
sauvegarde de campagne.

## Suivi Excel et vérification documentaire

`XENO_TRIALS_SUIVI_V156.xlsx` comporte dix feuilles et neuf tables. Il conserve
les 40 IDs de présentation du plan V146, les 28 IDs ART153 et les 189 IDs du
roster. Les lignes PNJ des annexes et contrats Forge sont séparées des tâches
Trials. Les dix classeurs V146–V155 restent présents avec les mêmes octets.

Les onze indicateurs utilisent de vraies formules, avec caches vérifiés contre
leurs cellules sources : 189 / 4 / 40 / 200 / 40 / 40 / 28 / 18 / 8 / 0 / 0.
Le compteur 18 utilise les affectations conditionnelles des 19 annexes listées.
Les deux zéros correspondent aux clôtures artistiques et approbations 1:1.
Ces nombres ne constituent pas un pourcentage de jeu terminé.

`progress-v156.json` reprend toutes les tables, les empreintes des dix classeurs
historiques et quatre PNG sources, les contrats runtime et le hash du nouveau
classeur. Les documents sont admis comme sources de revue et exclus du paquet
distribué. Les validateurs documentaires n’utilisent que Node et la bibliothèque
standard Python :

```sh
npm run test:audit:continuation
```

Le validateur compare les cellules JSON/XLSX, IDs hérités, exports effectifs,
formules et caches, statuts bornés, empreintes et exclusion de distribution.
La recette complète inclut aussi les suites comportementales, le build et les
parcours navigateur des présentations et de la Forge.

Ce suivi est **prépublication**. Les lignes de recette décrivent des contrôles
à exécuter ou vérifier sur le commit publié ; elles n’anticipent aucun résultat
GitHub. Les résultats locaux ciblés ne sont pas ajoutés aux comptes d’une suite
globale qui les contient déjà. Les fixtures explicites, parcours natifs et
éventuels essais sur matériel humain doivent rester identifiés séparément.

## Manques conservés des autres audits

Les mouvements complets, dessins et finitions du reste du roster, les costumes
franchise sans atlas dédié et les campagnes sans route jouable restent des
productions distinctes. Les illustrations fixes et kits modulaires déjà livrés
conservent leur périmètre réel.

L’encyclopédie Alien brute historique et les archives DLC Blackout/Earth ou
sprites V10 n’ont pas été récupérées dans cette passe. Les comptes d’un ancien
audit ou une clé de sauvegarde ne remplacent pas ces sources. Les nouveaux
classeurs Trials constituent un autre corpus. Aucun examen intégral de ces
archives absentes ni clôture des anciens chats n’est annoncé.
