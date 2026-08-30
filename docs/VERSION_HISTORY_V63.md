# Historique de version — v63.0.0

Date : 30 août 2026.

## Contenu

- plaque OpenAI ImageGen 4 × 4 dédiée à la Harpoon Gun / ASSO-400, normalisée en RGBA et orientée vers la droite ;
- clips `idle`, `action`, `reload` et `service` branchés au joueur, au catalogue et à l'armurerie ;
- pont Excel `ARM-0053` passé de `art-required` à `dedicated-sheet-ready` ;
- manifeste porté à 192 atlas et 2 724 cellules ;
- contrat PWA mis à jour pour le module V63, le pont Excel, la plaque et la documentation ;
- provenance, références de fidélité et dette restante documentées sans revendiquer un fichier officiel copié.

## Contrat d'identité

La nouvelle plaque est une reconstruction originale fidèle aux références du prop et non un alias du Sonic Harpoon. Le runtime conserve les marqueurs `CANON_REFERENCE_RECONSTRUCTION`, `canonExact: false` et `approximate: true`. Les Heavy Pulse Rifle, Plasma Rifle, ES-4 et Compound Bow restent bloquées tant que leur source exacte n'est pas résolue.

## Validation ciblée

- manifeste : 192 atlas / 2 724 cellules synchronisés ;
- plaque ASSO-400 : 16 cellules gardées, coutures vides et zéro résidu magenta ;
- contrats runtime, Excel, catalogue, PWA et interface : couverts par les tests V63.

## Validation complète locale

- `npm.cmd run qa` : PASS ;
- tests : 370 réussites sur 370 ;
- lint : 171 modules ;
- audit PNG V63 : 402 PNG runtime, 0 erreur confirmée, 13 candidats halo, 230 masters bruts exclus ;
- build : ALIENS: TANTALUS FRONTIER 63.0.0, 3 443 entrées catalogue.

## Limites honnêtes

- la QA navigateur reste une gate séparée et n'est pas déclarée exécutée sans le navigateur choisi par l'utilisateur ;
- trois châssis, quatre identités d'armes, les couches complètes de costumes, la source UD-4L native, les petits props finaux par salle et les candidats halo restent dans la matrice V63.

## Publication

La branche de production et le déploiement public sont renseignés après réussite de la gate complète, du push GitHub et des vérifications HTTP V63.
