# V66 Worklot 001 — Reef Stalker source review

## Résultat borné

Le profil `enemy-027-reef-stalker` possède désormais quatre planches OpenAI ImageGen réelles — `idle`, `move`, `attack`, `death` — soit 32 poses actives. Sept appels intégrés ont été nécessaires : deux versions d’`idle`, une de `move`, trois d’`attack` et une de `death`. Les trois versions écartées sont conservées dans `rejected/` avec leurs empreintes.

Le design reste une **adaptation originale du projet** guidée par `V56_ENEMY_REFERENCE_MATRIX.md`, `enemy-visual-overrides-v56.js` et la planche V56 locale. Il ne constitue pas une reproduction canonique 1:1.

## Sources actives et provenance

| Clip | ID de génération | SHA-256 | Audit technique |
| --- | --- | --- | --- |
| `idle` | `exec-d9e74bfa-f7cc-4997-9486-1dc8c54ab6c4` | `78c70bf2e32c388477babfc8d4920e02d8015b30f68a52371527d3988828233c` | 8/8 poses distinctes, extraction par défaut réussie |
| `move` | `exec-ff0a1af4-e49d-479c-afe6-2e3d816988a8` | `bdd994b84ea2d3e5f4f7b833bf5a7a3c81df0f6b9e26ad4aa8e898abd05a8874` | 8/8 poses distinctes, extraction par défaut réussie |
| `attack` | `exec-0ebd7ab8-13b1-4291-bc36-b02a93305f87` | `cff954b47b01ce6089b331c6a99115551b43243c93dc9a39ba51bfda7cc7c8cc` | extraction par défaut bloquée ; réassignation courte prouvée sur 8/8 poses |
| `death` | `exec-c9e71caf-6cfd-4eb5-bbdd-909107579dac` | `4ea46b408add7438131fbb27649af90122e816ea3f8530261298ac4a1de701ee` | 8/8 poses distinctes, extraction par défaut réussie |

Les quatre PNG actifs font `1774 × 887`, donc exactement 2:1, en RGB sur fond magenta opaque, avec huit cellules distinctes par planche. Chaque SHA actif correspond à son événement de génération.

## Revue visuelle

- `idle` : la correction r2 a remplacé les pointes dorsales trop hautes et l’extrémité de queue en forme de harpon par des plaques plus basses et une lame organique contenue. La silhouette basse, le dôme et la respiration restent cohérents.
- `move` : cycle quadrupède lisible, avec alternance des appuis diagonaux, compression et extension ; orientation vers la droite et identité stables.
- `attack` : la r3 retrouve une taille proche d’`idle` et une frappe lisible, mais les poses 2 à 5 touchent les limites nominales de cellule. La sonde de réassignation courte extrait huit poses distinctes sans pixel de premier plan perdu ; cela ne vaut ni validation artistique ni normalisation. L’alignement des racines physiques et de la ligne de sol reste à contrôler avant toute intégration.
- `death` : effondrement irréversible en huit étapes, entièrement contenu, sans retour en position debout ni gore. Le rythme de lecture et les racines physiques restent à vérifier en atlas animé.

## Limites et statut

Trois planches sur quatre passent directement l’extracteur actuel. `attack` reste **bloquée en extraction par défaut** et n’est conservée que comme source candidate réassignable. Aucune planche n’a été acceptée, normalisée ou branchée au runtime.

Deux documents de prompt (`idle-r2`, `attack-r3`) diffèrent de leur texte exact d’appel uniquement par le saut de ligne terminal ; les événements conservent `actualPromptText` et son SHA-256 comme autorité. Lorsque certains appels intégrés ont fourni le PNG complet sans `output_hint` et laissé leur fichier par défaut vide, le payload exact renvoyé a été persisté une seule fois via PTY local. Aucun appel API de secours n’a été utilisé.

Le registre global, la queue, `STATE`, les manifestes et le runtime n’ont pas été modifiés.
