# V82 — rendu et ancrage des accessoires des annexes

## Défauts constatés sur le rendu V81

La capture de production `docs/references/v81-release-qa/browser-production/04-proving-ground-entered.jpg` montre des conduites et leurs bases détachées suspendues au milieu de la salle, des boucles de câbles remplies de blanc, un pupitre posé en l'air et une passerelle dessinée comme un rectangle. Le décor peint de Proving Ground comporte aussi quatre grandes cibles non interactives et un sol en perspective, en conflit avec le plan de jeu latéral.

Les images sources ont été inspectées. `maintenance-pipe.png` (146×232) contient une conduite et une base séparée ; `wall-ladder.png` (169×232) contient une échelle aux ouvertures blanches et une base séparée ; `overhead-catwalk.png` (232×146) contient plusieurs pièces, avec du blanc entre les rails supérieurs. Le contour alpha extérieur ne garantit donc pas la transparence des ouvertures intérieures.

## Correction appliquée aux dix annexes

- Le tablier utilise uniquement la région `[40,43,228,70]` de la passerelle, répétée sans déformation. Sa limite supérieure, sa largeur et son épaisseur coïncident avec le collider auteur. Deux montants bitmap rejoignent le sol.
- L'échelle est assemblée avec ses rails `[53,4,62,172]`, `[100,4,109,172]` et un barreau `[62,36,100,40]`. Les ouvertures restent transparentes et la base séparée n'est jamais échantillonnée.
- Les nervures utilisent la conduite `[43,4,107,178]` et son fût `[49,34,99,120]`. Elles rejoignent le plafond ; la base détachée est exclue. Le passage libre sous les colliders est conservé.
- Les accessoires muraux utilisent uniquement le module écran `[25,8,183,99]` du pupitre. Le clavier et les pieds ne sont plus suspendus au mur.
- Les anciennes boucles blanches sont exclues au profit de la bande de raccordement `[4,4,186,29]` dans les neuf autres annexes.

Les coordonnées ci-dessus sont des régions sources mesurées, avec bord droit et bord inférieur exclus. Aucun fichier bitmap historique n'a été retouché ; les corrections sont dans le renderer.

## Remplacement spécifique Proving Ground

Le renderer charge séparément les nouveaux assets OpenAI du lot V82 :

- `/assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp` : mur orthographique, couche lointaine avec parallaxe 0,18 ;
- `/assets/openai/hub/proving-ground/v82/proving-ground-ceiling-beam-v82.png` : bande de plafond indépendante, répétée avec matière visible haute de 64 px. Les bornes solides `[11,141,1528,283]` sont ancrées à y=0 ; le padding transparent ne crée pas un vide au plafond.

Les anciens fonds `far.webp` et `mid.webp` de cette salle ne sont plus dessinés, y compris pendant le chargement du nouveau mur. La poutre reste indépendante du chargement des anciennes conduites. `getAssetReport().provingGroundEnvironmentReadyV82` expose la disponibilité réelle des deux nouvelles images.

## Supports des cibles et ordre de rendu

Les neuf socles ont chacun un rail mural bitmap de 6 px, continu depuis y=64, et un support de 44×6,32 px. Les pieds alpha des huit états de cible recouvrent le support. Toutes les structures arrière sont dessinées avant les neuf cibles ; les conduites ne peuvent plus masquer les silhouettes actives. Ces pièces appartiennent au mur arrière, sans ajouter de collision ni modifier les hitboxes, positions, munitions ou états de session.

## Vérification et limites

`node --test tests/hub-v71-runtime.test.mjs tests/hub-v81-runtime.test.mjs` : **23 tests réussis, aucun échec**. Les tests vérifient les dix annexes, la continuité des conduites et supports de cibles, les limites des régions propres, la correspondance passerelle/collider, le pivot plafond, le chargement indépendant et l'ordre de rendu, ainsi que le parcours des neuf cibles avec rechargement et reprise sauvegardée.

La validation navigateur locale V82 a réussi : 14 captures, 9 cibles touchées, 1 recharge, 2 reprises et zéro erreur navigateur. Les captures du stand et l'accueil entièrement composé ont été inspectés. Les preuves finales sont dans `docs/references/v82-release-qa/browser-local/`. Ce sous-lot ne certifie pas la transparence des assets historiques dans les autres moteurs de rendu ; leurs pixels blancs d'origine existent encore hors des régions utilisées ici. Les animations ennemies manquantes, les perspectives des autres fonds peints et la complétude commerciale restent des travaux séparés.
