# V66 — audit technique complet `enemy-039-abomination`

Date : `2026-09-01`
Statut : revue locale autonome, non fusionnée, non acceptée et non intégrée au runtime.

## Résultat

- 32/32 poses inspectées individuellement; 32/32 restent tournées à droite.
- Quatre sources 1774×887 RGBA opaques, grille 4×2, zéro contact de cellule et support commun au pixel local y=428.
- 32 racines physiques sont proposées sous le bassin/centre de masse; un poing planté reste un contact secondaire.
- Les facteurs d’échelle sont des candidats de calibration post-génération, jamais une acceptation artistique.

## Échelle post-génération

| Clip | Médiane masse-poing | Facteur proposé | Médiane corde crânienne | Facteur crânien indicatif |
| --- | ---: | ---: | ---: | ---: |
| `idle` | 81.000 px | 1.000000 | 57.918 px | 1.000000 |
| `move` | 83.024 px | 0.975622 | 61.788 px | 0.937366 |
| `attack` | 79.000 px | 1.025316 | 42.446 px | 1.364510 |
| `death` | 79.000 px | 1.025316 | 37.669 px | 1.537551 |

La mesure primaire suit la même couture interne de la masse-poing terminale avant la moins occultée. L’allonge totale du bras, la boîte englobante, la largeur de l’impact et celle du cadavre sont exclues. La corde crânienne sert de recoupement; sa divergence reste explicitement visible au lieu d’être lissée.

## Racines et lecture des séquences

| Clip | Poses | Orientation | Racines | Lecture |
| --- | ---: | --- | --- | --- |
| `idle` | 8/8 | droite 8/8 | bassin → y=429, 8/8 | Subtle grounded breathing closes near neutral; motion amplitude is deliberately low. |
| `move` | 8/8 | droite 8/8 | bassin → y=429, 8/8 | Heavy knuckle-supported trudge reads in order; frames 4-5 create the largest horizontal extension and require cadence review after normalization. |
| `attack` | 8/8 | droite 8/8 | bassin → y=429, 8/8 | Braced anticipation, overhead double-growth wind-up, slam, compression and recovery read chronologically; source carries no painted shockwave. |
| `death` | 8/8 | droite 8/8 | bassin → y=429, 8/8 | Irreversible recoil-to-collapse progression ends in a stable corpse; frame 0 already reads post-impact and is retained as a reservation. |

Les GIF de contrôle bouclent uniquement pour permettre l’inspection. `attack` et `death` restent non bouclés dans le contrat runtime; leur dernière pose est prolongée dans le GIF de diagnostic.

## Réserves non masquées

- Idle far-arm shoulder-to-elbow-to-growth continuity is strongly occluded in several poses even though the second terminal mass remains visible.
- Move frames 4-5 carry a much longer horizontal silhouette; the rigid fist and cranial checks indicate pose extension rather than a whole-actor scale change, but the transition into frame 4 deserves runtime cadence review.
- Attack frames 2-3 hide most of the far arm behind the overhead growth. The double-growth wind-up remains readable as an action sequence, but full two-arm topology is not equally legible in every silhouette.
- Death frame 0 reads as an already reared post-impact pose, and the cranial chord becomes rotation-sensitive during collapse.
- The secondary cranial chord contracts sharply in late attack and early death compared with idle. Occlusion and rotation contribute, but the available pixels do not certify fully stable head scale; this blocks automatic artistic acceptance and makes the fist-derived factors low-confidence calibration candidates.
- All merge factors and roots are physical-registration candidates only. They do not grant artistic acceptance, normalization approval, or runtime integration.

## Fragments et preuves

- Scale merge-compatible : `docs/references/V66_WORKLOT_001_ABOMINATION_SCALE_REVIEW.json`
- Anchor merge-compatible : `docs/references/V66_WORKLOT_001_ABOMINATION_ANCHOR_REVIEW.json`
- Données 32 poses : `docs/references/V66_WORKLOT_001_ABOMINATION_TECHNICAL_QA.json`
- Validation merge sans écriture : `docs/references/V66_WORKLOT_001_ABOMINATION_FRAGMENT_VALIDATION.json`
- Provenance : `docs/references/V66_WORKLOT_001_ABOMINATION_QA_PROVENANCE.json`
- Overlays : `docs/references/v66-worklot-001-abomination-qa/`

Aucun global queue/state/reference/scale/anchor, autre profil, V65, metadata, source, normalisé, runtime, commit ou déploiement n’est modifié par cet audit.
