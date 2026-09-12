# V80 — Audit level design BIOFORGE

## Verdict

Le vestibule V71 était cohérent comme sas de sécurité, mais pas comme niveau : une interaction de station ne remplaçait ni espace jouable, ni combat, ni portes physiques. V80 corrige ce défaut avec une carte latérale séparée de 2 880 × 720 et conserve le hub comme zone sûre.

Le lot est recevable comme vertical slice. Il n’est pas recevable comme promesse BIOFORGE entièrement terminée tant que son roster et son art total restent partiels.

## Audit des défauts et corrections

| Axe | Défaut avant V80 | Correction V80 | État |
|---|---|---|---|
| Jouabilité | Bouton de station sans niveau de combat | Monde 2D parcourable, arène, passerelles, échelles et vraie boucle de combat | Corrigé dans le vertical slice |
| Confinement | Sas vérifié mais aucune session à purger | Double sas, cinq portes synchronisées aux phases et sortie verrouillée avant purge nulle | Corrigé |
| Échelle | Aucun gabarit de niveau dédié | Joueur auteur 42 × 92, monde 720 px de haut et props placés sur un sol commun | Corrigé au niveau contrat |
| Perspective | Risque de props trois-quarts flottants | Rendu strictement latéral, bandes `far/mid/foreground` et props transparents séparés | Corrigé au niveau contrat |
| Densité | Une seule station décorative | Contrôle, imprimante, purge, retour, cinq portes, deux passerelles et douze emplacements | Corrigé |
| Progression | Risque de récompenses ou pertes de campagne | Racine `bioforgeV80` isolée, sans mutation stratégique | Corrigé |
| Population | Quantité arbitraire ou surcharge | Budget pondéré 12 et plafond dur de 12 | Corrigé |
| Direction des ennemis | Apparition possible dos au joueur | Chaque point calcule un facing vers l’opérateur, placé à gauche de l’arène | Corrigé |
| Art complet | Corpus annoncé non livré | Six slots modulaires V80, mais dette du corpus complet maintenue | Partiel |

## Topologie et circulation

La circulation suit une séquence lisible de gauche à droite :

`contrôle → sas A → sas B → imprimante → arène → sas retour → hub`

Cette organisation sépare les fonctions et rend la sécurité visible. Les volumes ont les bornes suivantes :

| Volume | X | Largeur | Fonction |
|---|---:|---:|---|
| Salle de contrôle | 0 | 440 | Configuration et préparation |
| Sas intérieur | 440 | 230 | Première barrière |
| Sas extérieur | 670 | 250 | Deuxième barrière |
| Baie d’impression | 920 | 360 | Matérialisation des spécimens |
| Arène | 1 280 | 1 180 | Combat et verticalité |
| Sas retour | 2 460 | 420 | Validation de purge et sortie |

Le sol commun est à `y = 620`. Deux passerelles à `y = 470` créent une route haute dans l’arène ; deux échelles l’atteignent. Les points de spawn restent contenus dans les bornes de l’arène, sans chevauchement d’identité.

## Portes et lisibilité de l’état

Les portes `control-seal`, `inner-interlock`, `arena-containment`, `arena-return` et `hub-return` forment la chaîne de confinement.

- pendant la préparation active, les sas ne peuvent pas être traversés ;
- pendant le combat, `arena-return` signale explicitement `combat-active` ;
- après résultat, la sortie reste fermée avec `purge-required` ;
- seule la phase `return` ouvre l’arène retour et la frontière du hub ;
- les autres portes restent closes pour éviter une traversée de bout en bout.

## Placement, taille et perspective

Les règles de placement V80 sont :

1. toutes les surfaces de marche partagent la même ligne de sol ;
2. les éléments de structure ne changent jamais la hitbox d’un spécimen ;
3. les arrière-plans sont opaques seulement lorsque leur rôle le nécessite ;
4. les couches `mid`, `foreground`, props et VFX conservent leur alpha ;
5. aucun texte, logo ou HUD n’est peint dans le décor ;
6. la porte et l’imprimante restent des éléments indépendants animables ;
7. la taille d’affichage d’un ennemi vient de son profil validé, pas d’une cellule CSS uniforme.

Le bestiaire et le terminal doivent afficher une échelle relative : un petit parasite ne doit jamais occuper la même enveloppe qu’un Drone ou qu’une future caste royale.

## Risques encore ouverts

- La validation géométrique ne remplace pas une revue visuelle de chaque asset à sa taille runtime.
- Les six couches V80 ne constituent pas le corpus complet de props, dégâts, variations lumineuses et animations promis.
- Les castes aquatiques, royales, géantes ou volantes doivent disposer d’une arène et de règles de sécurité adaptées avant admission.
- Un test de charge réel à douze entités sur mobile reste nécessaire pour certifier la performance commerciale.
- Les transitions d’animation doivent être revues profil par profil afin d’éviter saut de pose, mélange d’identité ou débordement de cellule.

## Critères de sortie

Le niveau ne pourra être déclaré complet que lorsque :

- toutes les voies clavier, tactile et manette ont une preuve navigateur ;
- chaque porte affiche et applique le même état ;
- aucune entité, balle, acide, VFX ou timer ne survit à la purge ;
- une reprise corrompue force la purge sûre ;
- chaque profil admis a son atlas dédié, ses pivots, hitboxes, tailles et deux orientations validés ;
- les captures desktop/mobile ne montrent ni halo blanc, ni prop flottant, ni couche trois-quarts incompatible.
