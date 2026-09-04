# V68 — QA des icônes PWA Tantalus Frontier

Date : 4 septembre 2026.

## Provenance et statut

Le master `assets/openai/pwa/tantalus-frontier-app-icon-source-v68.png` est une création bitmap originale générée avec OpenAI ImageGen pour ce projet. Les quatre exports PWA sont des dérivés redimensionnés du même cadrage sécurisé. Aucun sprite, logo, key art ou autre asset officiel n’a été copié. Ces images relèvent de l’identité originale du projet et ne constituent pas un asset canon de franchise.

## Contrat runtime

| Fichier | Dimensions encodées | Octets | Usage manifeste | SHA-256 |
|---|---:|---:|---|---|
| `tantalus-frontier-app-icon-source-v68.png` | 1254 × 1254 | 1 642 052 | master seulement, hors manifeste et hors précache | `288384c4f88cd862eec2abfa486640af9ebbd0f6d140f0b7dc164b7ff0c2a41e` |
| `tantalus-frontier-icon-192-v68.png` | 192 × 192 | 45 917 | `any` | `9560b727c011e7d49de746a5994af342e2a6f3ab8dc58aa92bf680cefbe7e689` |
| `tantalus-frontier-icon-512-v68.png` | 512 × 512 | 291 254 | `any` | `17fcfc3707126d82aa3eb968b87bb722b7fbabf97f12146c17a31b39373d015e` |
| `tantalus-frontier-maskable-192-v68.png` | 192 × 192 | 45 917 | `maskable` | `9560b727c011e7d49de746a5994af342e2a6f3ab8dc58aa92bf680cefbe7e689` |
| `tantalus-frontier-maskable-512-v68.png` | 512 × 512 | 291 254 | `maskable` | `17fcfc3707126d82aa3eb968b87bb722b7fbabf97f12146c17a31b39373d015e` |

Les cinq fichiers sont des PNG truecolor RGB opaques, 8 bits, non entrelacés. Les exports `any` et `maskable` d’une même taille sont byte-identiques : ils ne sont pas présentés comme des variantes visuelles distinctes. Le cadrage source place déjà l’information centrale dans la zone sûre et conserve un fond plein jusqu’aux bords, ce qui autorise le même rendu pour les deux usages sans transparence périphérique.

## Safe zone maskable

La marque centrale est dimensionnée pour la safe zone circulaire de diamètre 80 % centrée dans le carré. Le cadre et la matière périphérique sont du fond perdu et peuvent être rognés par le masque du système sans supprimer l’information centrale. Une analyse de saillance du PNG 512 px place 85,56 % des gradients du décile supérieur dans ce cercle ; les 14,44 % restants correspondent au traitement périphérique destiné au fond perdu.

## Intégration vérifiée

- `manifest.webmanifest` déclare exactement les couples 192/512 pour `any` et `maskable`, avec le MIME `image/png` ;
- `index.html` expose favicon 192/512 et icône Apple 192 ;
- `sw.js` précache les quatre exports runtime sous `atf-v68-shell-2`, jamais le master 1,6 Mo ;
- `tests/pwa-icons-v68.test.mjs` relit les en-têtes PNG, les hashes, les usages, les chemins HTML et le contrat de cache.
