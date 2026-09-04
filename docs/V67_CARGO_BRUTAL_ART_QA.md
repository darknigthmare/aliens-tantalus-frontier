# QA des assets Cargo Brutal V67

Date : 4 septembre 2026.

## Décision de release

Deux sorties normalisées sont **acceptées pour le runtime V67** après contrôle technique et visuel : l’atlas de props `4 × 2` et l’atlas d’états des trois survivants `4 × 3`. Leurs PNG RGBA sont copiés dans `assets/openai/sprites/normalized/`, déclarés par `cargo-brutal-visuals-v67.js`, chargés par la mission et précachés par le service worker.

La Matriarche de Soute reste **rejetée** et n’est jamais intégrée. Cette dette maintient le statut commercial de l’opération à `PARTIEL`, même si la boucle de jeu et les nouveaux visuels dédiés sont testés.

## Masters chroma et sorties normalisées

| Fichier | Dimensions/mode | SHA-256 | Verdict |
|---|---:|---|---|
| Master chroma `cargo-brutal-atlas-4x2-chroma-ff00ff.png` (hors dépôt) | 1774 × 887 RGB | `0f6212a2af6775cf066041c9d4e2799f913800a9ed8907b70275f1793c2cb621` | **Accepté par le pipeline** |
| `assets/openai/sprites/normalized/props/cargo-brutal-props-atlas-v67.png` | 1024 × 512 RGBA | `b237706cbb7807260c54788db2a96c21392c45c04cff0c6df0d0f49cb40c4830` | **Accepté** |
| Master chroma `cargo-survivors-shaw-ruiz-kessler-4x3-chroma-ff00ff.png` (hors dépôt) | 1448 × 1086 RGB | `1d33a0dab8f8e695d00a6fb99e66b2a0431326a90d14a16822a4f4d9baa1dc9c` | **Accepté par le pipeline** |
| `assets/openai/sprites/normalized/npcs/cargo-survivors-shaw-ruiz-kessler-v67.png` | 1024 × 768 RGBA | `14a8e7ce335b2513fb6b8743719417814a158c84c160c0a98fb6c74f39f132fd` | **Accepté** |
| Master chroma `matriarche-soute-4x4-chroma-ff00ff.png` (hors dépôt) | 1254 × 1254 RGB | `3c86f41edc5397670170d781d9df5e6bbb8153bb0c38b8f7fcfc7e135982e53f` | **Rejeté : chevauchements intercellules** |

Les deux PNG normalisés intégrés dérivent exclusivement des masters chroma listés ci-dessus. Ils ne dérivent pas des anciens candidats à damier peint.

## Historique rejeté distinct

| Ancien candidat hors dépôt | Dimensions/mode | SHA-256 | Motif |
|---|---:|---|---|
| `matriarche-soute-4x4-final.png` | 1254 × 1254 RGB | `1053b0f46d071795fb5d9457aefa869fd3c7540e1631c1d2d989ec9a6e294132` | Damier peint, aucun alpha ; identité/baseline non validées |
| `cargo-brutal-atlas-4x2-final.png` | 1774 × 887 RGB | `8b5c740567f564257b4841509e7a5599daf39d1e131152831594bb1ba62b5355` | Damier peint, aucun alpha ; perspective/couples ON-OFF non validés |

## Contrôles visuels

### Matriarche de Soute

- le master chroma contient bien une intention de plaque `4 × 4`, sans marque, interface ou texte ;
- plusieurs queues traversent cependant les limites de cellule ;
- l’appartenance de ces pixels à une pose devient ambiguë et empêche de prouver une extraction propre ;
- aucun PNG normalisé de Matriarche n’a donc été produit ni intégré, car corriger ces chevauchements modifierait le dessin source ;
- l’ancien candidat à damier reste un rejet historique séparé et ne constitue pas la provenance des deux assets acceptés.

### Atlas de props Cargo Brutal

- huit objets reconnaissables, contenus dans leur cellule et sans grille, cadre, fond peint ou matte résiduel ;
- perspective industrielle latérale/3-4 cohérente ;
- ordre runtime : barrières A/B/C, noyau OFF/ON, coupleur OFF/ON, capsule de convoi ;
- paires OFF/ON appariées et lisibles ;
- `8/8` cellules non vides, garde transparente de `16 px`, aucune fuite de couture, aucun RGB caché sous alpha zéro ;
- transparence : `55,9958 %`.

### Atlas des survivants

- rangées d’identité fixes : Dr. Imani Shaw, Dockmaster Ruiz, Tech Kessler ;
- vêtements, silhouette, échelle, pieds et orientation vers la droite stables par rangée ;
- `12/12` cellules non vides, garde transparente de `16 px`, aucune fuite de couture, aucun RGB caché sous alpha zéro ;
- transparence : `77,1290 %` ;
- l’atlas est un atlas **d’états**, pas une boucle temporelle : `idle=0`, `walk=1`, `hurt/brace/downed=2`, `evacuation/run=3` ;
- pendant l’évacuation, le runtime reste toujours sur la colonne `3`. La colonne blessée `2` n’est jamais cyclée comme une frame de marche.

## Intégration vérifiée

1. Le runtime charge les deux images sous des clés dédiées à `CARGO BRUTAL`.
2. Les trois obstacles, le noyau, le coupleur et la capsule utilisent chacun leur cellule dédiée ; les anciens assets génériques ne sont plus sollicités.
3. Shaw, Ruiz et Kessler sont résolus uniquement par leurs identités Cargo. `drawSquadActor` et ses identités d’équipage historiques ne sont pas utilisés.
4. En cas d’échec réseau/décodage, un dessin de secours neutre conserve la lisibilité des collisions sans emprunter l’apparence d’un autre personnage.
5. `tests/cargo-brutal-art-v67.test.mjs` vérifie SHA-256, IHDR RGBA, dimensions, alpha réel, RGB caché, gardes, cellules, registre, mapping d’états, appels de rendu et précache PWA.

Le rapport déterministe du pipeline est conservé hors dépôt avec les sources de travail : `C:\Users\chuck\Documents\Codex\_generated_assets\alien-cargo\processed\cargo-v67-processing-report.json`.

## Dette de release restante

La Matriarche n’a pas encore de plaque dédiée acceptable. Le candidat rejeté cumulait une identité royale insuffisante, une baseline/échelle instable et des éléments acides parasites. Le runtime conserve temporairement l’asset de reine de production existant avec le statut explicite `shared-production-asset` / `visualApproximation: true` ; il ne doit pas être présenté comme un visuel Cargo final.

Le passage de `PARTIEL` à complet exige encore une nouvelle plaque Matriarche réellement validée, son intégration sans approximation, puis une QA visuelle en moteur à `1280 × 720` sans halo, recadrage ni débordement.
