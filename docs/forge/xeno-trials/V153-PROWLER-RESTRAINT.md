# V153 — Saisie du Prowler et dégagement

Base : PR9 `15b4c7e02a47ff581b3c1f8d1e7a80ac09eee142` (V152).
Lot de développement V153 ; application 143.0.0, sauvegardes 52, dépendances inchangées.

## Ce qui est réalisé

Le bond existant du Prowler peut maintenir une **saisie de simulation** après un
contact rapproché sur trois identités humaines du roster. Le captif peut se
libérer en maintenant la commande GARDE pendant 0,6 seconde. Les deux acteurs
restent des corps physiques dans le duel ; aucune téléportation ou transformation
arbitraire de silhouette n'est utilisée.

Ce travail ne produit **aucune nouvelle pose articulée**. La ligne de contact et
la barre de dégagement sont des indicateurs procéduraux, pas un clip de mise au
sol certifié. Les 28 tâches artistiques des quatre participants sont ouvertes.

## Admission exacte et fidélité

Attaquant : `prowler` / `castes-game_afe_prowler`.
Cibles :
- `import-game-dd-wy-commando` / `pose-v106-import-game-dd-wy-commando` ;
- `import-game-dd-guardian` / `pose-v106-import-game-dd-guardian` ;
- `dd-darwin-era-cultist` / `pose-v118-dd-darwin-era-cultist`.

Ces rencontres inter-œuvres et leur compatibilité sont des **choix originaux de
Xeno Trials**, pas des affrontements canoniques. Le porteur de combinaison APE,
les synthétiques, les xénomorphes, les reines et les identités non admises
conservent le contact ordinaire V151. Aucun héritage automatique par famille,
nom ou variante. Le Prowler Altered n'est pas modifié.

La provenance limitée du Prowler reste celle du dossier V151 : descriptions
attribuées à Cold Iron / IGN First, page primaire inaccessible et reproduction
secondaire documentée. Elle ne devient pas une validation directe dans V153.
Les [notes officielles Fireteam](https://www.aliensfireteamelite.com/en/releasenotes/)
et les [notes Steam de Cold Iron](https://steamcommunity.com/app/3448650/allnews/),
consultées le 17 octobre 2026, documentent le système général de grapples, ses
interruptions et son contre-jeu. Elles **ne valident pas** les trois cibles de
cette adaptation, ses timings, dégâts ou une animation Prowler complète.
Les frames/timecodes de référence restent à relever. Zéro kit approuvé 1:1.

## Règles originales et contre-jeu

- La prise nécessite le bond L, un captif vivant et au sol et au maximum huit
  unités monde entre les corps. La portée générique d'attaque ne suffit plus
  pour accrocher une cible à distance. Les coups contre les autres morphologies
  ne sont pas raccourcis.
- La garde frontale alimentée bloque la prise avec son coût et son chip ordinaires.
  Sauter ou interrompre la préparation permet également d'éviter le contact.
- Le coût du bond existant est payé une fois, sans transaction supplémentaire
  à la capture. Une interruption ne rembourse ni ne redéclenche ce coût.
- La saisie dure au plus 180 pas à 120 Hz, soit 1,5 seconde. Ses trois ticks de
  six PV surviennent aux pas 48, 96 et 144. Le premier contact V151 est conservé.
- GARDE maintenue 72 pas, soit 0,6 seconde, libère sans martèlement de touche,
  tirage aléatoire, dépense supplémentaire ni immunité pendant l'attente.
  Relâcher la garde remet à zéro une tentative inachevée.
- Déplacement, attaques, supers, saut et régénération d'endurance sont bloqués
  pendant la saisie. La gravité et les projectiles déjà émis continuent.
- Un projectile touchant le captor peut libérer les deux acteurs. Une mort,
  séparation externe ou interdiction des spéciaux annule également la prise.
  Aucun acteur n'est replacé de force sur un ancien point d'ancrage.
- La sortie applique 0,25 seconde de récupération et conserve les verrous de
  relâchement : les commandes retenues pendant la saisie ne rejouent pas ensuite.
- `grapplesV153`, `grappleTicksV153` et `grappleEscapesV153` sont des statistiques
  du match. Les ticks ne gonflent pas le nombre de coups directs, ni les dégâts
  au-delà des PV restants. Le verdict et les récompenses restent aux propriétaires
  existants du match et de la progression.
- Pause entièrement figée, nettoyage aux fins et changements de manche. Aucune
  saisie n'est sauvegardée dans le profil, aucun schéma de sauvegarde modifié.

## Intégration

Le moteur, l'IA et le contrôleur utilisent le même état de prise. Le CPU prend sa
décision de dégagement à sa cadence ordinaire, puis émet la même garde qu'un
joueur ; il ne touche pas directement aux PV, positions ou compteurs.
Le briefing précise les trois cibles et les limites graphiques. La lecture
accessible et les indicateurs canvas décrivent le dégagement.

`src/xeno-trials-grapple-v153.js` est inclus une seule fois dans le shell hors
ligne. L'Excel, le JSON et ce guide restent des documents de source, exclus du
paquet distribué. Les suivis V146–V152 ne sont pas remplacés.

## Recette et distinction des preuves

`npm run test:trials:grapple` : 32 tests comportementaux et un contrôle documentaire.
Sur le moteur de départ, les mêmes 32 tests donnent 9 réussites et 23 échecs ;
sur le moteur V153 ils passent tous. Cela établit la nouvelle fonctionnalité,
pas 23 bugs historiques distincts. Les fixtures unitaires ajustent explicitement
les positions/PV initiaux pour isoler les frontières ; elles ne sont pas des
parties normales.

Le banc `qa-xeno-trials-grapple-v153.py` utilise un **hôte HTML isolé** qui fournit
une configuration humaine/Prowler au constructeur de production, puis conserve
les vrais sprites, l'IA, la simulation et le clavier. Aucun PV, position, temps,
jauge ou résultat n'est injecté après le démarrage. Le choix de l'hôte contourne
la progression de déblocage pour isoler le contrôleur : **ce n'est pas une recette
menus/déblocage/récompenses**. Les parcours historiques du jeu restent séparés et
bloquants dans la CI. Les conclusions navigateur ne sont valides qu'après lecture
du rapport de l'exécution correspondante.

Le classeur `XENO_TRIALS_SUIVI_V153.xlsx` contient sept onglets et conserve les
189 IDs. Il distingue moteur fonctionnel, provenance des références et travaux
artistiques à faire. Ses sept compteurs calculés sont 189 / 1 / 3 / 32 / 28 / 0 / 0.
