# Xeno Trials V155 — séquences natives multi-temps

Base : `703a2ab87166df39f31bdf8d37d59ab09a9a3af4` (V154), PR 9.
L'application reste 143.0.0, les sauvegardes 52, les dépendances et les PNG inchangés.

## Portée effective

20 séquences originales, cinq par identité : Prowler, Cultiste Darwin Era,
Commando Weyland-Yutani de Dark Descent et Guardian. Elles utilisent les quatre
rigs natifs V154, avec cinq points clés explicites par séquence (100 au total).
Les phases sont : intro, victoire R1, défaite R1, victoire finale et défaite finale.
Les 185 autres combattants gardent leur rendu et leur écran de résultat antérieurs.

Ce n'est ni 20 clips capturés dans les œuvres ni un moveset complet. Les angles,
les enchaînements et les durées sont des choix de présentation du versus. Les
preuves de source restent les quatre plaques du projet, pas des scènes canoniques.
Aucune nouvelle image, anatomie cachée, voix, relation historique ou capacité n'est
inventée. Zéro validation 1:1 et zéro clôture artistique complète.

## Présentation et manches

Une entrée passe par observation, identification et stabilisation. Les mouvements
sont distribués entre les os de tête, buste, bras ou queue ; ils ne consistent pas
à déplacer tout le portrait. Les pieds restent ancrés. Les armes des deux humains
armés suivent la zone rigide V154. Les amplitudes restent bornées ; des géométries
invalides sont refusées avant le premier triangle dessiné.

Les poses R1 passent par constat ou encaissement, récupération et retour au neutre.
Elles ne créent pas de blessures irréversibles avant la manche suivante. Le moteur
physique ne reçoit aucune écriture du rendu. Saisie/résistance/récupération V154,
locomotion et attaques ordinaires sont conservées.

Le bouton PASSER LA PRÉSENTATION saute l'entrée courante uniquement. Il ne saute
ni l'autre combattant ni les trois secondes de décompte. Les commandes maintenues
sont neutralisées ; un saut d'entrée ne peut devenir un coup d'ouverture.

## Résultat terminal et animation finie

Le moteur clôt le combat et émet son résultat avant l'outro. Le propriétaire
existant des sauvegardes reste seul chargé du règlement. Le rendu n'ajoute aucun
second événement de victoire ni aucune récompense. Le test de règlement historique
est conservé.

Une horloge de présentation indépendante, bornée à 1,8 s et 100 ms par frame,
commande la dernière réaction. Pendant ce temps, ticks de combat, points de vie,
positions, statistiques, RNG, projectiles et résultat sont gelés. L'issue est déjà
visible et transmise. Les acteurs au sol reçoivent leur réaction ; un vainqueur
sans PV ou un acteur encore en l'air ne reçoit pas de célébration artificielle.
Aucune séquence de victoire n'est ajoutée à une égalité ou un double KO.

La défaite est une réaction de petite amplitude puis une pose tenue. Ce n'est pas
une chute complète au sol et le personnage ne se relève pas après un KO. L'outro
ne reproduit pas encore la sortie vers une ouverture prévue dans le plan maître.

Pause et perte de focus figent la seule horloge de présentation. Reprise et saut
sont idempotents ; une deuxième boucle requestAnimationFrame n'est pas créée.
PASSER LA SÉQUENCE FINALE va à la pose finale, sans réouvrir le moteur. Au terme de
la durée, aucun redraw à fréquence d'image n'est conservé. Fermeture ou changement
d'activité annule le rendu et efface ses reçus. Le mouvement réduit garde la
texture native et ne fait pas attendre l'outro.

## Suivi Excel

`XENO_TRIALS_SUIVI_V155.xlsx` contient huit onglets et sept tables. Il reprend les
40 IDs de présentation V146 des quatre identités ; 20 reçoivent un raccordement
partiel. Les 20 autres restent dans leur état initial, sans déclaration de fin.
Les 28 ART153 sont conservées à l'identique : cette passe ne clôt pas la mise au
sol, les dessins de capture ou leur revue canonique. Les 189 IDs du roster restent
visibles dans le dernier onglet. Les neuf indicateurs sont calculés, pas peints :
189 / 4 / 20 / 100 / 40 / 20 / 28 / 0 / 0.

`progress-v155.json` porte les valeurs vérifiées et l'empreinte du classeur. Le
classeur est un suivi prépublication : les résultats finaux GitHub sont dans les
artefacts CI, et non anticipés dans ses cellules. Tous les documents restent
exclus du paquet distribué. Seul le module de présentation entre dans le shell.

## Recette et limites

- `npm run test:trials:sequences` : échantillonnage des 20 séquences à 121 instants,
  supports fixes, triangles non retournés, deux orientations, contexte strict,
  variantes invalides, passage d'intro, résultat naturel et callbacks réentrants.
- Horloge terminale testée à 30/60/120 Hz, pause/focus, préférence de mouvement
  réduit, saut, fermeture et aucune modification de l'état physique.
- Contrôle documentaire : IDs V146 et ART153, roster, points clés, empreinte XLSX,
  cellules source, neuf compteurs et absence d'erreur de formule.
- `qa-xeno-trials-sequences-v155.py` sépare les fixtures de rendu explicites du
  contrôleur natif humain/Prowler utilisant la règle ordinaire 1 PV. Après sa
  construction, aucune santé, position, horloge, jauge ou issue n'est injectée.
  Ce n'est pas le parcours complet de déblocage du menu ni un compte cloud réel.
- Les parcours historiques de menus, résultats/sauvegarde, personnages, rigs et
  saisies restent présents et bloquants dans la recette complète.

Le Chromium local est refusé avant navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`).
Zéro assertion navigateur locale validée. Les captures distantes doivent être
vérifiées avant d'annoncer la recette visuelle du commit comme réussie.
