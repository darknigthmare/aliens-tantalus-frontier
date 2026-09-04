# V69 — Doctrine Alpha / Bravo

Date : 4 septembre 2026.

V69 transforme le troisième chat prioritaire en opération planifiable et réellement jouable. Cette release ne certifie pas encore le jeu commercial complet ni l’intégralité de la promesse coopérative.

## Campagne et règles de déploiement

- ajout de `special-alpha-bravo-doctrine` à Lethe ;
- objectif `defend the colony`, gabarit `colony-multiroute`, cinq routes ;
- briefing et lancement refusés avec moins de quatre opérateurs actifs ;
- le registre contient toujours 19 chats, dont 3 lots jouables ;
- le catalogue passe de 438 à 439 campagnes.

## Contrat de mission certifié

Une victoire V69 exige simultanément :

1. un payload schéma 69 marqué `certified` ;
2. l’identifiant exact du déploiement courant et la campagne V69 ;
3. les tâches `alpha-relay`, `bravo-perimeter` et `joint-certification`, chacune réservée au bon groupe et terminée ;
4. les résultats uniques des quatre opérateurs du manifeste ;
5. un score d’au moins 60/100.

Une tentative incomplète, falsifiée, réutilisée depuis une ancienne opération ou sous le seuil devient un échec enregistré et ne reçoit aucun bonus. Une victoire conforme verse une seule fois `+8 recherche` et `+6 morale`, en plus de la récompense normale de campagne.

## Sauvegarde et anti-tamper

- nouveau ledger top-level `alphaBravoDoctrine`, schéma 69 ;
- maximum 64 runs, déduplication par identifiant d’opération ;
- tâches, scores, santé, stress et blessures bornés ;
- bilan victoires/échecs, meilleur score et moyenne recalculés depuis les runs, jamais repris depuis un résumé importé ;
- dernier run exposé dans le snapshot stratégique et rattaché à `lastOperation` ;
- import/export et anciennes sauvegardes restent compatibles ;
- la résolution répétée ou la restauration d’une opération déjà comptée ne peut pas reverser les gains.

## Art et couverture

Ce lot systémique réutilise les planches OpenAI existantes et contrôlées pour les 16 membres Echo-9 et ajoute un atlas OpenAI dédié aux consoles physiques Alpha / Bravo. Il n’ajoute ni CSS représentant un personnage, ni sprite de substitution, ni copie de sprite officiel.

## Suite

La prochaine directive est `alien-survival-systems`, ordre de production 4.
