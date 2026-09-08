# Art V75 — provenance, intégrations et rejets ennemis

Date : 8 septembre 2026. Fournisseur des sources générées : **OpenAI ImageGen**. Les deux atlas intégrés sont des créations/adaptations originales du projet avec `canonExact:false`. Aucun fichier officiel téléchargé ni sprite officiel recopié n’est déclaré comme source runtime, et cette documentation ne certifie aucune reproduction pixel à pixel ou fidélité 1:1.

Les quatre sources de chaque profil contiennent huit poses distinctes (`idle`, `move`, `attack`, `death`). Elles ont été normalisées en un atlas WebP RGBA sans interpolation ni duplication de frames. L’existence d’une source ou la réussite d’un contrôle technique ne vaut jamais acceptation visuelle : seules les décisions V75 séparées font foi.

## Prowler 015 — accepté et intégré

Le Prowler est une adaptation originale générée à partir d’une [référence de silhouette et d’anatomie sous licence](https://store.necaonline.com/products/aliens-fireteam-elite-7-scale-action-figure-prowler-alien). La référence guide l’identité ; elle n’est pas copiée dans l’atlas. Les 32 poses, le sens droit, l’échelle crânienne et les racines physiques de cage thoracique ont été revus. Le rendu runtime mesure 352 px de côté pour un corps logique de 96 × 88 px.

| Élément | Chemin | SHA-256 |
|---|---|---|
| Source attente | `assets/openai/sprites/frames/v66/batch-002/enemy-015-prowler/idle.png` | `ddcdb6a1da2b1cdba558f0f6c191029ab07b90a9dcbaa5e0661aeaabd2805c4f` |
| Source déplacement | `assets/openai/sprites/frames/v66/batch-002/enemy-015-prowler/move.png` | `c406d7a3383afa8d70053a9344763e7031a40d72a9e369fc69cbd5b8039af403` |
| Source attaque | `assets/openai/sprites/frames/v66/batch-002/enemy-015-prowler/attack.png` | `3e22f9bd66f51e8f82d81ff8358a3fc71055961673448365f8747ee88e288546` |
| Source mort | `assets/openai/sprites/frames/v66/batch-002/enemy-015-prowler/death.png` | `59f89194dbe40b1b3446b9a75d7c7055e50a751ee5632e94daf9ff14e1074cfa` |
| [Atlas runtime](../assets/openai/sprites/normalized/enemy-profiles-v66/enemy-015-prowler.webp) | `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-015-prowler.webp` | `5462eb30975dcdf83b29e02bf5aff8e65de5fbe92aecb0958c09af1e887e6b52` |
| [Métadonnées de normalisation](../assets/openai/sprites/metadata/v66/enemy-015-prowler.json) | `assets/openai/sprites/metadata/v66/enemy-015-prowler.json` | `f34736d503e6631079548e9c72f5d7b30760472d9835a8cbdef0b99c7af5e711` |

La revue V75 est traçable dans la [décision d’acceptation](references/v75-enemy-fixes/release/accepted-enemy-015-prowler.json), la [preuve d’intégration](references/v75-enemy-fixes/release/integrated-enemy-015-prowler.json), la [revue des racines](references/v75-enemy-fixes/015/anchor-review.json) et la [revue d’échelle](references/v75-enemy-fixes/015/scale-review.json).

## Ceto Reef Predator 051 — accepté et intégré

Ceto est une faune aquatique originale de Tantalus Frontier, sans modèle canon externe unique. L’identité générée conserve le prédateur amphibie bleu-noir, ses quatre membres-pagaies et sa nageoire caudale. Les 32 poses partagent une quille physique aquatique revue. Le rendu runtime mesure 384 px de côté pour un corps logique de 156 × 100 px et un pivot à 192 px. L’intégration est limitée au bassin de grotte Ceto écrit pour ce profil ; elle ne promet pas de nage libre.

| Élément | Chemin | SHA-256 |
|---|---|---|
| Source attente | `assets/openai/sprites/frames/v66/batch-004/enemy-051-ceto-reef-predator/idle.png` | `2712b5fb05271b5e149757c5cc8dbcc4a77fe9c2c809c2c2ad97238bfb4df281` |
| Source déplacement | `assets/openai/sprites/frames/v66/batch-004/enemy-051-ceto-reef-predator/move.png` | `c1b60283496ae8a5cc0a134d6572be5126d49d31880711b0bcbb63253f7b53f5` |
| Source attaque | `assets/openai/sprites/frames/v66/batch-004/enemy-051-ceto-reef-predator/attack.png` | `f5d0d9f3eeefd16ca8973eafeb11a331f7baa3e97d4e9463dedfae62da314fd0` |
| Source mort | `assets/openai/sprites/frames/v66/batch-004/enemy-051-ceto-reef-predator/death.png` | `b5591d1a278116e1ed82035d43c0e6fd2993a981f0cf7c885e334b23ac309a5a` |
| [Atlas runtime](../assets/openai/sprites/normalized/enemy-profiles-v66/enemy-051-ceto-reef-predator.webp) | `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-051-ceto-reef-predator.webp` | `0f40a56669c6a151ea02ffdcdf9ee18331bf495545a816eab75572c062142168` |
| [Métadonnées de normalisation](../assets/openai/sprites/metadata/v66/enemy-051-ceto-reef-predator.json) | `assets/openai/sprites/metadata/v66/enemy-051-ceto-reef-predator.json` | `c5b605b79c351209aaae59d344475f8a7c4558e3bb8acbfb01b465c9201d1200` |

La revue V75 est traçable dans la [décision d’acceptation](references/v75-enemy-fixes/release/accepted-enemy-051-ceto-reef-predator.json), la [preuve d’intégration](references/v75-enemy-fixes/release/integrated-enemy-051-ceto-reef-predator.json), la [revue des racines](references/v75-enemy-fixes/051/anchor-review.json) et la [revue d’échelle](references/v75-enemy-fixes/051/scale-review.json).

## Candidats rejetés, hors intégration V75

| Profil | État | Motif et preuve |
|---|---|---|
| Lurker 011 | `review-rejected`, `runtimeIntegrated:false` | Les essais de bond R1/R2 conservent une contamination magenta sur la créature et ne verrouillent pas encore une identité/animation commerciale stable. Les fichiers sont gardés pour traçabilité ; le runtime antérieur reste inchangé. Voir la [décision de rejet](references/v75-enemy-fixes/release/rejected-enemy-011-lurker.json) et les [diagnostics R1](references/v75-enemy-fixes/011/lurker-r1-diagnostics.json). |
| Atarax Ripper 023 | `review-rejected`, `runtimeIntegrated:false` | Le candidat de 32 poses satisfait les contrôles techniques, mais le déplacement manque de transfert de poids et l’attaque ressemble encore à une simple extension de bras. Voir la [décision de rejet](references/v75-enemy-fixes/release/rejected-enemy-023-atarax-ripper.json), la [revue des racines](references/v75-enemy-fixes/021-023/023-anchor-review.json) et la [revue d’échelle](references/v75-enemy-fixes/021-023/023-scale-review.json). |

Les métadonnées de normalisation V66 sont volontairement conservées octet pour octet et peuvent encore porter leur ancien état `pending-visual-review`. Elles ne sont pas réécrites pour fabriquer une antériorité : les décisions d’acceptation/intégration V75, leurs empreintes et le [snapshot central](references/V75_ENEMY_PROGRESS.json) constituent la couche d’état actuelle. La [matrice des écarts de conversations](references/V76_CHATGPT_PROJECT_GAP_MATRIX.md) reste la référence pour le travail qui dépasse ces quatre profils.
