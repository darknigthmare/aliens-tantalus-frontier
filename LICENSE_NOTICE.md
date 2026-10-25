# Licence et provenance

Ce dépôt est préparé pour un titulaire de licence de la franchise *Alien*.
Les noms, personnages, créatures, lieux et designs appartenant à leurs ayants droit restent leur propriété.

Les images rangées sous `assets/openai/` sont générées avec OpenAI pour ce projet et documentées dans `docs/ART_PROVENANCE.md`, `docs/ART_PROVENANCE_V47_1.md`, `docs/ART_PROVENANCE_V48.md` et `docs/ART_PROVENANCE_V49.md`.

La v49 utilise dans le hub 36 assets runtime distincts : 16 salles, 4 couches lointaines et 16 props PNG indépendants. Les quatre panoramas v48 restent présents comme masters legacy et éléments de provenance, mais ne sont plus chargés par le runtime v49.
Les références officielles ne sont pas redistribuées comme fichiers sources dans le dépôt.

Les huit fichiers de `assets/audio/` sont des compositions et effets originaux
créés pour ce projet par synthèse hors ligne. Ils n'utilisent aucun échantillon
de film, de jeu ou de bibliothèque commerciale. La partition et le générateur
sont fournis dans `src/audio-score-v132.js` et `scripts/generate-audio-v132.mjs`.

## V163 native capture illustrations

The three RGBA pose atlases in `assets/openai/sprites/trials-v163/` are original OpenAI ImageGen adaptations of the existing native commando, guardian and cultist illustrations. They supply nine measured capture/recovery poses per identity. They are presentation assets for this fan project, not official franchise artwork or a claim of canonical visual fidelity. Atlas source hashes and geometry are recorded in `src/xeno-trials-capture-data-v163.js`.
