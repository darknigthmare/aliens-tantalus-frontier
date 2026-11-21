# Xeno Trials V197 · Reprise et animations prioritaires

Ce lot part de V196 et s’appuie sur le [plan de production V146](xeno-trials-plan-v146.json) et les six lignes « restant » du [suivi V149](progress-v149.json). Les gestes décrits ci-dessous sont des adaptations pour Xeno Trials à partir des plaques admises dans le projet.

| Priorité | Disponible en jeu | Portée |
| --- | --- | --- |
| P0 · Intégrité et commandes | Un duel interrompu reprend en pause avec la manche, la santé, le score, le chrono, l’IA, les actions et effets actifs conservés. Le joueur peut aussi repartir de la première manche sur le même ticket. | La validation refuse les états incompatibles et le règlement reste unique. Les tickets anciens sans point de reprise proposent le redémarrage. |
| P0 · Synth Trooper et Warden | Dix poses de combat dessinées par identité, avec appuis, contact, garde, recul, chute et corps au sol. | Les six identités P0 du plan possèdent désormais au moins un geste dessiné admis. |
| P1 · Présentation des pilotes | Warden, Exploder, Harbinger, Brute Pathogen et Reine Pathogen possèdent chacun six séquences. Introduction, victoire et récupération entre les manches, victoire terminale, défaite au temps et chute sur KO terminal. | Les animations lisent les résultats natifs. Les appuis de la chute sont mesurés sur chaque plaque. La fin de première manche garde un retour récupérable. |
| P1 · Synth Guard | Dix nouvelles poses de combat incluant sa propre poussée à l’arme portée. | Le chronométrage et l’impact restent ceux de l’attaque native. |
| P2 · Articulation de douze identités | Douze rigs mesurés sur leurs propres textures. Chaque identité reçoit son introduction, deux présentations de manche et une récupération liée à une attaque acceptée. | Les 48 gestes sont articulés sur les plaques existantes. Le filtre « Gestes articulés » donne accès aux combattants concernés. |

Les trois planches contiennent 30 poses et portent à 24 le nombre de combattants qui disposent d’au moins un geste dessiné admis sur les 189 du catalogue. Chaque planche a été conçue en vue latérale et vérifiée pour sa transparence, ses découpes et ses appuis. La morphologie du Warden reprend la crête métallique et la queue du portrait du projet. Les deux synthétiques se lisent par leur armure et leur manière de porter l’arme. La conception n’ajoute aucune attaque à leur profil.

Les douze rigs P2 couvrent Ultramorph, Xeno-Rhino, Synthétique de combat blindé, Quadrupède squelettique, Carrier, Spiker, Antilope, Phantera Black, Drone bleu, Reine bleue, TRex King et TRex Queen. Les gestes de récupération suivent les fenêtres natives au sol et leurs appuis restent ancrés.

## Vérifications

La recette Chromium valide 116 contrôles sur 14 lancements natifs, avec un profil importé par l’interface et un solde de test déclaré. Deux rechargements couvrent la reprise pendant le combat et entre les manches. Un vrai KO vérifie le règlement unique. Le sélecteur français et anglais, les cinq intros, les douze rigs et les trois planches produisent des reçus de rendu sur la version vérifiée. Le contrôle source et le contrôle du paquet assemblé passent.

## Travail restant au plan

Les movesets entièrement dessinés, les cycles aériens, les supers, les finitions spécifiques à l’ensemble des anatomies et les relevés directs de chaque œuvre demeurent ouverts. Le registre contient aussi quinze propositions hors roster qui demandent des dossiers d’identité et des assets propres. Un geste partiel conserve son statut de couverture partielle.
