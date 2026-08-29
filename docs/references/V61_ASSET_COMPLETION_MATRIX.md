# Matrice de complétude artistique V61

## Livré dans cette passe

| Domaine | Livrable | État |
|---|---|---|
| Titre | fond planète/vaisseau 16:9 | intégré |
| Briefing | table d’opérations RGBA 1 024 × 512 | intégré, collision et interaction |
| Armurerie | comptoir/racks RGBA 1 024 × 512 | intégré, collision et interaction |
| Hangar | booth de contrôle RGBA 1 024 × 512 | intégré comme prop indépendant et interactif |
| Dialogue | Mara Vega et Sanaa Doyle | intégré |
| Personnalisation | mannequin Echo-9 | intégré à l’interface |
| Salles | médical, laboratoire, quarantaine, support-vie | MID 1 774 × 887 remplacés |
| Excel | audit local hashé + pont de quatorze armes et trois véhicules, sans publier le classeur brut | intégré |
| Armes | M39, M42A, M6B, M83 SADAR, M5 RPG, M94, F44AA, Type 88 et AK-4047, neuf plaques 4 × 4 | intégrées au runtime, au manifeste et au pont Excel |

## Manifeste d’animation V61

- 191 plaquettes ;
- 2 708 cellules ;
- 53 enemy, 29 equipment, 32 npc, 5 player, 37 vehicle, 35 weapon ;
- 191 sources et 191 normalisés présents, soit 382 chemins raw/normalisés ;
- 516 variantes ennemies réemploient leur famille ;
- 392 costumes n’ont pas encore de couches dédiées.

## Bloqué ou non terminé

- Harpoon Gun : seule famille d’arme encore reliée sans ambiguïté, plaque à produire ;
- Heavy Pulse et Plasma : ID canon à choisir ;
- ES-4 et Compound Bow : absents du classeur sous un nom exact ;
- M570, M292 et AD-19D : BLOCKED_EXACT_SPRITE_REQUIRED ;
- UD-4L : source actuelle agrandie au-delà de sa résolution opaque ;
- costumes : mannequin UI livré, composition bitmap multi-parties runtime non livrée ;
- variantes ennemies : produire seulement les modificateurs visuellement matériels ;
- races, rituels, perceptions, flore et personnages canon : registres de gameplay absents.

Cette matrice interdit d’appeler « dédiée » une entrée qui réemploie une famille ou une coloration procédurale.
