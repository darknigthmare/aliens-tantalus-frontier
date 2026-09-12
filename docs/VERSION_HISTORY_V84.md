# V84 — identité du joueur, accueil physique et sûreté des profils

Source de besoin : conversation #7, `references/v76-conversation-audit/group-gameplay.md`, et audit `V83_GAMEPLAY_SOURCE_AUDIT.md`. Les dialogues V84 sont des textes originaux Tantalus Frontier, pas des répliques retrouvées dans une transcription ni du canon de franchise.

## Parcours branché

- Au premier lancement, à la création d'un profil vide ou après confirmation de nouvelle partie : dossier personnel avec nom et indicatif. Le brouillon ne remplace rien ; validation et écriture du candidat complet sont atomiques. Annuler conserve les octets de la campagne précédente. Une erreur d'écriture conserve le brouillon et la campagne.
- Début devant la capsule physique de la cryosalle. Confirmation par interaction, déplacement vers DAVID-8R, accueil en trois répliques, marche dans le CIC puis rencontre avec Tamsin Velez au briefing. Le personnel est placé dans le même niveau, sans duplication, avec contrôle de proximité et portes. Aucune téléportation vers le briefing.
- Phase, nœud, identité et acquittements persistent. Les anciens profils sans marqueur ne sont pas contraints à recommencer. Les boutons de navigation ne permettent pas de sauter le briefing ; paramètres et retour titre restent accessibles. Les déplacements sont conservés au retour titre/sauvegarde.
- DAVID donne une orientation, pas un diagnostic ou un soin. Tamsin reçoit un poste libéré des autres PNJ et des collisions, y compris lors de reprises à différents horaires.

## Identité et escouade

Le joueur porte l'identifiant `player-echo9`, distinct de la commandante Mara Vega. Son nom/indicatif sont figés séparément dans le manifeste d'opération et transmis au runtime. Pour ces nouvelles chronologies, J1 est un commandant physique indépendant des quatre Marines sélectionnés ; les quatre alliés existent dans le niveau, et J2 remplace son allié habituel. Les campagnes historiques sans identité explicite gardent leur comportement antérieur.

Alpha/Bravo conserve deux binômes et un certificat portant uniquement sur les quatre Marines. J1 peut donner les ordres, mais ne remplace pas un membre absent lors des comptages de proximité. Les tests couvrent solo, coop, reprise et validation stratégique du certificat. Cela ne constitue pas une validation d'équilibrage de toutes les campagnes avec cinq acteurs.

## Défauts effectivement corrigés

- Le pupitre CIC et son conduit supérieur formaient un passage de 60 px pour un Marine de 92 px. Le pupitre passe derrière la voie de marche avec un plateau supportant les atterrissages ; le conduit est repositionné sur sa passerelle élargie. Art, dimensions du conduit et paramètres globaux du saut sont inchangés. Marche et saut sont testés dans les deux sens à 30/60/120 FPS.
- Sous-titres placés dans un rail hors du canvas : ils ne masquent plus les acteurs ni les touches. Les répétitions de tirs sont régulées, la priorité des messages utiles est conservée, les textes longs restent défilables et l'option sous-titres fonctionne.
- Écritures du hub et BIOFORGE effectuées avant publication en mémoire. Les callbacks sont liés au profil et à sa génération. Un import différé invalide les anciennes modales et arrête BIOFORGE sans purger son ancien état dans le nouveau profil.

## Limites explicites

Aucune nouvelle image ni sheet n'est produite dans ce lot. Le démarrage emploie la capsule et les cinq sheets Echo-9 existantes : une séquence artistique dédiée de réveil/ouverture de capsule reste à produire. Le créateur ne livre pas encore un système d'apparences corporelles ou d'aptitudes, le recrutement causal, les portraits individuels ou l'historique relationnel. Les contrôles navigateur couvrent clavier/souris et dimensions mobiles, pas du matériel manette physique.

La conversation #7 demeure PARTIAL. La matrice des 26 conversations reste **0 DONE / 17 PARTIAL / 9 MISSING**. Les ennemis restent **14/571 intégrés**, avec 557 non intégrés. Aucun titre de jeu commercial complet, de fidélité graphique 1:1 ni de déploiement GitHub/Vercel V84 n'est revendiqué.
