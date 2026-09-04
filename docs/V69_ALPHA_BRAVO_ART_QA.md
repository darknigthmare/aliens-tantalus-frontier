# QA art V69 — consoles Doctrine Alpha / Bravo

Date : 4 septembre 2026.

## Source originale

`assets/openai/sprites/frames/v69/alpha-bravo-task-consoles-atlas-openai-v69.png`

- création originale OpenAI ImageGen pour le projet, sans copie de planche officielle ;
- grille source `4 × 2`, `1774 × 887 px`, huit silhouettes cohérentes ;
- rangée Alpha verte : liaison tactique disponible, réservée, travail, terminée ;
- rangée Bravo ambre : relais périmétrique disponible, réservé, travail, terminé ;
- SHA-256 source : `ca1fa6e44b5f6bcc766f8003d0f1e4af25b111aa6b2be15ff0f1281d7e63608f`.

## Atlas de production

`assets/openai/sprites/normalized/props/alpha-bravo-task-consoles-atlas-v69.png`

- traitement reproductible : `py scripts/process-alpha-bravo-art-v69.py` ;
- PNG RGBA `1024 × 512 px`, cellules `256 × 256 px`, garde de `10 px` ;
- huit cellules occupées et huit empreintes de pixels distinctes ;
- `62,606 %` de pixels entièrement transparents ;
- `0` pixel RGB caché sous alpha zéro ;
- SHA-256 runtime : `6b78cfd57a2daadd761d069ba714ed37be375932ca23fa1c6a9ec9fb1c30a327`.

## Décision de production

La plaque est acceptée comme source primaire des deux consoles physiques. Les primitives Canvas ne sont qu’un filet de sécurité si le bitmap ne peut pas être décodé. Les 16 opérateurs continuent d’utiliser leurs propres plaques OpenAI locomotion et mission déjà protégées par le contrôle d’identité ; aucun personnage emprunté ni placeholder n’est introduit.
