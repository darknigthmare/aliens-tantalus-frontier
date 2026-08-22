# Historique de version — v54.0.0

## Objet

v54 est une release d’identité visuelle, de lisibilité du level design et de gameplay d’extraction. Elle conserve la boucle et le schéma de sauvegarde v53, ajoute cinq masters OpenAI réellement consommés, corrige les artefacts alpha historiques et remplace l’objectif textuel d’extraction par un holdout jouable et persistant.

## Livré

- nouvelle plaque combat Echo‑9 4×4, fidèle à l’identité locomotion et activée après alignement des événements tir/recul;
- nouvelle plaque Xenomorph Runner 4×4, comportement pouncer et mapping exact;
- nouvelle plaque Ripper Queen 4×4, comportement boss et mapping exact;
- nouvelle plaque Pathogen Mimic 4×4, mapping exact sur ses 11 variantes et orientation stable;
- nouvelle plaque Pale Crucible Hunter 4×4, mapping exact sur ses 11 variantes et orientation stable;
- manifeste porté à 31 plaques / 496 cellules, toutes normalisées en RGBA 1024×1024;
- contrôle anti-damier sur 80 cellules de xénomorphes sombres et nettoyage des plaques historiques Drone, Warrior et Queen;
- pipeline chroma renforcé par extraction des 16 plus grands composants connectés et despill vert avant/après resize;
- couverture des 568 profils ennemis passée à 110 exacts, 216 réemplois de famille et 242 sans art dédié;
- plateformes rendues et collisionnées depuis une même surface de référence;
- slots d’escouade basés sur la largeur visuelle, avec séparation runtime contre les superpositions;
- holdout d’extraction de 10/14/18 secondes selon difficulté, vague dédiée, sortie verrouillée, HUD, journal et reprise du temps restant;
- inventaire JSON/Markdown v54 régénéré depuis les registres;
- cache hors ligne porté à `atf-v54-runtime-2` avec les quatre nouvelles plaques ennemies;
- marqueurs publics, Forge et contrats de QA portés à v54.0.0.

## Non déclaré terminé

- 242 profils ennemis restent sans art dédié et 216 utilisent un réemploi de famille;
- 278 profils véhicules restent sans bitmap exact;
- les sets mission complets des 16 PNJ restent à produire;
- les couches propres à chaque salle/zone, le dropship physique et les hazards non-acides restent à produire.

Les dettes sont exposées dans `ASSET_RUNTIME_INVENTORY_V54.md`; aucune entrée catalogue n’est assimilée à une plaque réellement produite.
