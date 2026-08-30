# Matrice de complétude artistique V64

## Résumé quantitatif

| Indicateur | V63 | V64 | Delta |
| --- | ---: | ---: | ---: |
| Entrées ennemies gameplay | 568 | 571 | +3 |
| Atlas ennemis | 53 | 56 | +3 |
| Atlas toutes catégories | 192 | 195 | +3 |
| Cellules toutes catégories | 2 724 | 2 772 | +48 |

Répartition du manifeste V64 : **56 enemy, 29 equipment, 32 npc, 5 player, 37 vehicle et 36 weapon**, soit 195 atlas.

Les 571 entrées ennemies ne correspondent pas à 571 plaques uniques : elles comprennent des variantes et modificateurs qui réutilisent une famille visuelle lorsque leur morphologie ne change pas. La V64 ferme précisément trois identités qui nécessitaient une silhouette autonome.

## Trois familles fermées en V64

| Ennemi | Profil / Excel | Continuité | État artistique V64 | Preuve dédiée |
| --- | --- | --- | --- | --- |
| Newborn | `enemy-569-newborn` ; `CAS-0037`, `RAC-0040` | *Alien Resurrection* (1997) | adaptation source-locked, plaque 4 × 4 dédiée | `enemy.newborn.action.v64` |
| Offspring | `enemy-570-offspring` ; `CAS-0038`, `RAC-0041` | *Alien: Romulus* (2024) | adaptation source-locked, plaque 4 × 4 dédiée | `enemy.offspring.action.v64` |
| Predalien | `enemy-571-predalien` ; `CAS-0036` | *AVP: Requiem* (2007) | adaptation source-locked, plaque 4 × 4 dédiée | `enemy.predalien.action.v64` |

« Source-locked » indique que la continuité et les invariants visuels sont fixés par les références officielles documentées. Les bitmaps ne sont pas des copies pixel-identiques et ne doivent pas être présentés comme des fichiers officiels.

## Contrat commun des plaques

| Ligne | Clip | Cellules | Fonction |
| ---: | --- | --- | --- |
| 0 | `idle` | 0–3 | respiration / maintien |
| 1 | `chase` | 4–7 | locomotion de poursuite |
| 2 | `attack` | 8–11 | attaque propre à la morphologie |
| 3 | `death` | 12–15 | perte d'équilibre et effondrement non graphique |

Chaque plaque normalisée utilise une grille 4 × 4 de 1 024 × 1 024 px, des cellules 256 × 256, une garde de 16 px, le pivot `creature-ground` en `(128, 240)` et une orientation source `right`.

## Surface de production réellement présente

| Famille | Modèle maître | Bandes sources | Plaque brute | Plaque normalisée | Métadonnées | Aperçu |
| --- | --- | --- | --- | --- | --- | --- |
| Newborn | présent | 4 présentes | présente | présente | présentes | présent |
| Offspring | présent | 4 présentes | présente | présente | présentes | présent |
| Predalien | présent | 4 présentes | présente | présente | présentes | présent |

Chemins de contrôle :

- modèles maîtres : `assets/openai/sprites/reference-masters/v64/` ;
- bandes : `assets/openai/sprites/frames/v64/{newborn,offspring,predalien}/` ;
- plaques brutes : `assets/openai/sprites/enemies/*-action-sheet-v64.png` ;
- plaques runtime : `assets/openai/sprites/normalized/enemies/*-action-sheet-v64.png` ;
- métadonnées : `assets/openai/sprites/metadata/v64/*-animation-v64.json` ;
- aperçus : `assets/openai/sprites/previews/v64/*-animation-preview-v64.gif` ;
- rapport d'assemblage : `assets/openai/v64-art-normalization-report.json`.

## Différenciation fonctionnelle et placement effectif

| Ennemi | Silhouette lisible | Profil | Placement data-driven | Contrat d'attaque |
| --- | --- | --- | --- | --- |
| Newborn | hybride pâle, ventre pendant, très grandes mains | `grappler` | uniquement ses `encounterWorldIds`, slot 5 | portée 122 px ; télégraphe 0,22 s ; lunge jusqu'à 54 px avec arrêt à 62 px et collision monde ; saisie 0,8 s |
| Offspring | humanoïde pathogène extrêmement haut, trois tubes dorsaux | `reach-hunter` | uniquement ses `encounterWorldIds`, slot 10 | portée 168 px ; télégraphe 0,21 s avant impact |
| Predalien | hybride royal lourd, mandibules, tendrils et queue | `hybrid-boss` | uniquement ses `encounterWorldIds`, slot 15 forcé comme boss | portée 158 px ; télégraphe 0,19 s avant impact |

Le filtre `encounterWorldIds` est appliqué avant le tirage pondéré puis l'affectation des slots : aucun de ces trois profils n'est ajouté depuis le catalogue général dans un monde non déclaré. Le télégraphe verrouille sa cible jusqu'à l'impact ; une cible invalide annule l'attaque et un mur ou une porte fermée bloque l'armement comme l'impact. Le clip `death` reste réservé à une mort réelle, jamais à une simple blessure.

La saisie du Newborn est consommée des deux côtés du gameplay : sur le joueur comme sur un membre d'escouade, `grappledClock` décroît avec le temps et applique un multiplicateur de vitesse de 0,42 pendant son activité. Le lunge passe par la résolution de collision horizontale plutôt que par une téléportation de pose.

Ces rôles évitent trois simples recolorations numériques et ferment les points précis de placement, télégraphe, lunge et consommation du grapple décrits ici. La présence de ce contrat dans le code ne vaut toutefois pas résultat de QA visuelle ou navigateur.

## Frontières de la complétude

- V64 clôt les **plaques dédiées** de Newborn, Offspring et Predalien ; elle ne prétend pas clore toutes les variantes morphologiques du registre ;
- les poses sont des adaptations de gameplay et non des animations officielles reproduites image par image ;
- les sources, leur statut et leurs limites sont consignés dans `V64_ENEMY_SOURCES.json` ;
- les prompts disponibles sont conservés dans `V64_IMAGEGEN_PROMPTS.md` ;
- les dettes V63 sur certains véhicules, armes sans identité non ambiguë, couches de costumes, petits props de salles et candidats halo restent ouvertes tant qu'une preuve séparée ne les ferme pas.

## Gates non présumées

Le dépôt fournit des commandes de contrôle V64, mais cette matrice n'enregistre aucun résultat non observé. Elle ne déclare donc pas, à elle seule, que la QA complète, la QA navigateur, le push GitHub ou le déploiement Vercel ont réussi.
