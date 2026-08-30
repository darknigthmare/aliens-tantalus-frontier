# Provenance artistique V64 — Newborn, Offspring et Predalien

Date de production : 30 août 2026.

## Positionnement

La V64 ajoute trois familles d'animation créées avec l'outil intégré **OpenAI ImageGen**, puis normalisées par le pipeline déterministe du projet. Les références servent à verrouiller l'identité, la continuité, la morphologie, la palette et les interdits de redesign. Aucun sprite, rendu, scan, logo, texte ou HUD officiel n'est livré comme asset runtime.

Le résultat est une **adaptation originale source-locked**. « Source-locked » signifie que le modèle publié choisi contrôle le design ; cela ne signifie pas copie pixel-identique, fichier officiel ou reproduction forensique 1:1.

## Sources de contrôle

| Famille | Continuité verrouillée | Source officielle ou licenciée | Usage |
| --- | --- | --- | --- |
| Newborn | *Alien Resurrection* (1997) | [NECA — Deluxe Newborn](https://necaonline.com/2019/02/alien-resurrection-7-scale-action-figure-deluxe-newborn/) | sculpture licenciée multi-angle : crâne humanoïde compact, ventre pendant, membres et extrémités déformés |
| Offspring | *Alien: Romulus* (2024) | [Legacy Effects — Alien: Romulus](https://www.legacyefx.com/alien-romulus) | maquette et travail officiel du studio d'effets : face, profil, dos, proportions plateau et trois tubes dorsaux courts |
| Predalien | *Aliens vs. Predator: Requiem* (2007) | [NECA — The Hybrid](https://necaonline.com/2011/03/just-in-time-for-halloween-the-hybrid/) ; [ADI / Design Studio Press — AVP: Requiem](https://designstudiopress.com/products/avp-requiem) | sculpture licenciée et livre de production : masse, crête, mandibules, tendrils et queue du modèle 2007 |

Les fichiers de recherche temporaires utilisés pour guider ImageGen ne sont pas des livrables du projet :

- Newborn : `.tmp/v64-references/newborn-01.jpg`, `newborn-04.jpg`, `newborn-07.jpg`, `newborn-10.jpg` ;
- Offspring : `.tmp/v64-references/offspring-front.jpg`, `offspring-side.jpg`, `offspring-back.jpg`, `offspring-onset.jpg` ;
- Predalien : `.tmp/v64-references/predalien-book-4.jpg`, `predalien-book-5.jpg`, `predalien-book-6.jpg`.

Ils restent des entrées d'étude locales et ne doivent pas être publiés comme assets de jeu. Le détail structuré des sources se trouve dans `docs/references/V64_ENEMY_SOURCES.json`.

## Chaîne de production

1. verrouillage d'un modèle maître multi-vues à partir des références nommées ;
2. génération séquentielle des bandes `idle`, `chase`, `attack` et `death`, en conservant identité, orientation, échelle, caméra, lumière et ligne de sol ;
3. matte chroma magenta de travail et suppression déterministe du fond ;
4. isolation des composants de pose, récupération des silhouettes et contrôle des cellules ;
5. normalisation d'échelle, pivot de sol `creature-ground`, alignement et pack 4 × 4 ;
6. production de la plaque brute, de la plaque RGBA normalisée, des métadonnées et d'un GIF de prévisualisation.

Le pipeline déclaré dans `assets/openai/v64-art-normalization-report.json` est : `tolerant-magenta-chroma-key`, `connected-component-pose-isolation`, `canonical-scale-normalization`, `ground-pivot-alignment`, `guarded-4x4-atlas-pack`, `animated-preview`.

## Livrables par famille

| Rôle | Newborn | Offspring | Predalien |
| --- | --- | --- | --- |
| Modèle maître | `reference-masters/v64/newborn-model-master-v64.png` | `reference-masters/v64/offspring-model-master-v64.png` | `reference-masters/v64/predalien-model-master-v64.png` |
| Bandes source | `frames/v64/newborn/*.png` | `frames/v64/offspring/*.png` | `frames/v64/predalien/*.png` |
| Plaque brute | `enemies/newborn-action-sheet-v64.png` | `enemies/offspring-action-sheet-v64.png` | `enemies/predalien-action-sheet-v64.png` |
| Plaque runtime | `normalized/enemies/newborn-action-sheet-v64.png` | `normalized/enemies/offspring-action-sheet-v64.png` | `normalized/enemies/predalien-action-sheet-v64.png` |
| Métadonnées | `metadata/v64/newborn-animation-v64.json` | `metadata/v64/offspring-animation-v64.json` | `metadata/v64/predalien-animation-v64.json` |
| Aperçu | `previews/v64/newborn-animation-preview-v64.gif` | `previews/v64/offspring-animation-preview-v64.gif` | `previews/v64/predalien-animation-preview-v64.gif` |

Tous les chemins de ce tableau sont relatifs à `assets/openai/sprites/`.

## Consommation gameplay des animations

Les plaques ne sont pas seulement cataloguées comme preuves artistiques. Le runtime associe chaque famille à son profil V64 (`grappler`, `reach-hunter` ou `hybrid-boss`) et limite sa construction de rencontre aux `encounterWorldIds` déclarés. Les insertions dédiées utilisent respectivement les slots 5 pour Newborn, 10 pour Offspring et 15 pour Predalien, ce dernier étant le boss forcé de son monde déclaré.

Le clip `attack` accompagne une résolution en deux temps : l'attaque verrouille sa cible et est télégraphiée, puis l'impact n'est évalué qu'après le `windup`. Une cible invalide annule l'attaque et les murs ou portes fermées bloquent l'armement comme l'impact. Pour Newborn, le lunge précédant la saisie est résolu par la collision horizontale du monde. Si la saisie touche, son `grappledClock` est consommé aussi bien par le déplacement du joueur que par celui de l'escouade : pendant au moins 0,8 s, la vitesse de la cible est multipliée par 0,42. Une blessure non létale ne déclenche jamais le clip `death`.

Cette section décrit le branchement présent dans le code ; elle ne constitue pas un résultat de QA visuelle, de test navigateur ou de déploiement.

## Invariants visuels retenus

### Newborn

- crâne hybride compact, visage humanoïde osseux, orbites sombres, nez visible et large bouche charnue dentée ;
- torse étroit et côtelé, abdomen ventral gonflé, membres extrêmement longs, grandes mains et grands pieds malformés ;
- peau humide ivoire à olive rosé ;
- aucun dôme classique, queue, mâchoire interne, tube dorsal, dreadlock, vêtement, armure ou arme.

### Offspring

- tête humaine chauve très allongée, visage étroit, yeux noirs enfoncés et cou démesuré ;
- cage thoracique émaciée, bassin étroit, bras et jambes exceptionnellement longs, pieds larges ;
- colonne dorsale apparente et exactement trois tubes organiques courts ;
- aucune queue, aucun dôme ou appareil mandibulaire xénomorphe classique, aucune armure.

### Predalien

- cible exclusive : hybride lourd d'*AVP: Requiem* (2007), jamais l'Abomination du jeu 2010 ;
- masse féminine pratique, épaules larges, crête/dôme sombre ridgé, petits yeux Predator, quatre mandibules ;
- tendrils noirs épais, corps biomécanique brun-noir/olive, jambes digitigrades et queue xénomorphe attachée ;
- aucun masque, canon d'épaule, gauntlet, lame de poignet, filet, sangle ou technologie Predator.

## Contrat de redistribution et limites

- seules les adaptations ImageGen et leurs dérivés déterministes sont destinés au dépôt ;
- les pages sources et fichiers de recherche ne sont pas redistribués comme textures ;
- les animations ne reproduisent aucun plan de film image par image ;
- les sculptures licenciées peuvent différer du costume, de la lumière et de la matière écran ;
- aucune mention « exact », `canonExact` ou `identityStatus: exact` ne doit être interprétée comme une promesse de copie pixel-identique ;
- les prompts complets conservés pour audit sont dans `docs/references/V64_IMAGEGEN_PROMPTS.md`.
