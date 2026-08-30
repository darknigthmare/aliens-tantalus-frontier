# Historique de version — v64.0.0

Date : 30 août 2026.

## Objet de la version

La V64 ajoute trois identités ennemies distinctes et jouables, chacune avec une plaque d'animation dédiée :

- **Newborn** — `enemy-569-newborn`, continuité *Alien Resurrection* (1997), Excel `CAS-0037` / `RAC-0040` ;
- **Offspring** — `enemy-570-offspring`, continuité *Alien: Romulus* (2024), Excel `CAS-0038` / `RAC-0041` ;
- **Predalien** — `enemy-571-predalien`, continuité *Aliens vs. Predator: Requiem* (2007), Excel `CAS-0036`.

Le registre passe ainsi à **571 ennemis**. Ce nombre désigne les entrées gameplay ; il ne signifie pas que 571 silhouettes bitmap indépendantes existent. Le manifeste V64 contient **56 atlas ennemis** au sein de **195 atlas / 2 772 cellules** toutes catégories confondues.

## Contenu livré

- trois modèles maîtres multi-vues verrouillés sur des références officielles ou licenciées ;
- quatre bandes de quatre poses par ennemi : `idle`, `chase`, `attack` et `death` ;
- trois plaques brutes puis trois plaques normalisées 4 × 4 de 1 024 × 1 024 px ;
- 48 nouvelles cellules substantielles et gardées, orientées vers la droite, équilibrées par ligne et alignées sur un pivot de sol commun ;
- un aperçu GIF et un fichier de métadonnées par ennemi ;
- trois profils gameplay et trois surcharges visuelles dédiées, sans alias vers une ancienne famille ;
- des rencontres hybrides construites depuis les données : chaque profil est limité à ses `encounterWorldIds` et injecté à son `defaultEncounter.slot` ;
- une résolution d'attaque en deux temps, avec télégraphe puis impact après le délai de préparation ;
- manifeste porté de 192 à 195 atlas et de 2 724 à 2 772 cellules.

## Contrat d'identité

| Ennemi | Plaque | Rôle gameplay | Hitbox | Référence d'identité |
| --- | --- | --- | --- | --- |
| Newborn | `enemy.newborn.action.v64` | `grappler` | `newborn-tall` | *Alien Resurrection* (1997) |
| Offspring | `enemy.offspring.action.v64` | `reach-hunter` | `offspring-tall` | *Alien: Romulus* (2024) |
| Predalien | `enemy.predalien.action.v64` | `hybrid-boss` | `predalien-large` | *AVP: Requiem* (2007), jamais l'Abomination du jeu 2010 |

Les identités et continuités sont verrouillées sur les modèles cités. Les bitmaps restent toutefois des **adaptations Tantalus originales produites avec OpenAI ImageGen** : ils ne sont ni des sprites officiels extraits, ni des copies pixel-identiques. Dans le runtime, `canonExact: true` qualifie l'identité ciblée, pas une identité de pixels avec une œuvre publiée.

## Corrections gameplay et rencontres

| Ennemi | Restriction de rencontre | Slot déclaré | Attaque V64 |
| --- | --- | ---: | --- |
| Newborn | uniquement dans ses `encounterWorldIds` | 5 | télégraphe de 0,22 s, puis impact ; lunge maximal de 54 px, arrêté à 62 px et résolu par la collision horizontale du monde |
| Offspring | uniquement dans ses `encounterWorldIds` | 10 | télégraphe de 0,21 s, puis impact de longue portée |
| Predalien | uniquement dans ses `encounterWorldIds` | 15, boss | télégraphe de 0,19 s, puis impact ; profil de boss forcé sur ce slot dans son monde déclaré |

La sélection de production réserve d'abord les `defaultEncounter` dont les `encounterWorldIds` correspondent, puis remplit le reste du catalogue par tirage pondéré. Les trois hybrides sont ainsi présents exactement une fois dans leur monde déclaré et ne sont jamais tirés hors contexte.

Pour les comportements V64, armer une attaque verrouille sa cible, crée un état d'attente et émet son télégraphe ; les dégâts ne sont évalués qu'à l'expiration du `windup`. Une cible devenue invalide annule l'attaque, tandis qu'un mur ou une porte fermée bloque l'armement comme l'impact. Le Newborn ajoute un lunge physique avant sa saisie : son déplacement passe par la résolution de collision horizontale, il ne traverse donc pas librement les obstacles du monde.

Une blessure non létale conserve une animation vivante : le clip `death` est désormais réservé à un ennemi réellement mort.

Une saisie Newborn réussie applique `grappledClock` pendant au moins 0,8 s. Cette donnée est effectivement consommée par les deux cibles prises en charge : le joueur et les membres de l'escouade voient leur vitesse ramenée à 42 % tant que le compteur reste actif.

## Preuves présentes dans le dépôt

- `assets/openai/v64-art-normalization-report.json` décrit l'extraction, le placement et l'échelle des 48 cellules ;
- `assets/openai/sprites/metadata/v64/*-animation-v64.json` fixe grille, clips, pivot, orientation, continuité, identifiants Excel et sources ;
- `assets/openai/sprites/enemies/*-action-sheet-v64.png` conserve les plaques brutes assemblées ;
- `assets/openai/sprites/normalized/enemies/*-action-sheet-v64.png` contient les plaques RGBA destinées au runtime ;
- `assets/openai/sprites/previews/v64/*-animation-preview-v64.gif` permet une revue rapide de la continuité des poses ;
- `docs/ART_PROVENANCE_V64.md` et `docs/references/V64_ENEMY_SOURCES.json` consignent la provenance et les limites d'usage ;
- `docs/references/V64_IMAGEGEN_PROMPTS.md` conserve les prompts de production disponibles.

## Limites honnêtes

- la fidélité est une adaptation visuelle source-locked ; aucune comparaison forensique ne permet de revendiquer une reproduction 1:1 pixel par pixel ;
- les références Newborn et Predalien comprennent des sculptures licenciées et un livre de production, qui ne remplacent pas un turnaround numérique officiel du costume écran ;
- les poses d'animation sont créées pour le gameplay et n'ont pas d'équivalent officiel image par image ;
- la présence de 571 entrées ennemies ne clôt pas automatiquement la dette de variantes morphologiques, de comportements, de placement d'affrontements ou de level design ;
- les dettes V63 sur certains véhicules, armes ambiguës, couches de costumes et petits props de salles ne sont pas déclarées résolues par cette version.

## Validation et publication

Les commandes de gate V64 existent dans le dépôt (`sprites:v64:check`, `art:v64:check`, `art:v64:png`, `qa` et `qa:browser:v64`). Ce document n'invente aucun résultat : il ne déclare ni QA complète, ni test navigateur, ni push GitHub, ni déploiement Vercel tant que leur exécution et leur résultat ne sont pas consignés séparément.
