# Plan : complétion de l’arsenal

**Spec** : `specs/014-arsenal/spec.md`

## Architecture

| Élément | Fichier | Raccordement |
| --- | --- | --- |
| Ajouts sans plaque (194–196) | `src/weapon-catalog-additions-v188.js` (nouveau) | Fin de `WEAPONS` (`content-core-v50.js`) ; ligne « sans plaque » dans `weapon-reference-coverage-v122.js` (V121 les exclut comme les ajouts V122) ; catégorie de l’arbre via `placeholderCategoryV188` (`catalog-runtime-v62.js`) ; style « pompe » V124 par identifiant exact ; rapprochement de recherche par `researchId` (`weapon-research-index-v171.js`) |
| Profils d’arsenal | `src/weapon-arsenal-v188.js` (nouveau, pur) | Lit V124, V125, V130/V131, V122, V168, V174, V167, V193 ; table source = CSV recontrôlée par le test |
| Pont natif et effets | `src/weapon-arsenal-runtime-v188.js` (nouveau mixin `withArsenalFeedsV188`) | Inséré juste sous `withMagazineRecoveryWorldV168` dans `GameEngine` ; ordre des autres couches inchangé (contiguïtés épinglées intactes) |
| Mécanisme | `src/weapon-special-feeds-v171.js` (inchangé) | Machine d’état réutilisée ; `bridgeTemplateId` nomme la machine, jamais la source |
| Rechargement | `src/tactical-reload-v77.js` (inchangé) | V77 garde l’horloge et le transfert final ; le pont avance les temps forts strictement avant 100 % puis se règle sur les nombres |
| Hors ligne / distribution | `sw.js` (3 modules, cache renommé), `scripts/verify-public-release-v86.mjs` (chemins source exacts) | `verify-audit-v143.mjs` suit le nom de cache |

## Choix

- Pourquoi dans `WEAPONS` : les tables dérivées (actions V131, présentation V124, recherche, maîtrise) sont construites depuis le catalogue ; une liste séparée aurait laissé les ajouts sans projectiles ni effets. Les invariants « toute arme a une plaque » deviennent « toute arme hors des ajouts V188 listés a une plaque » (tests V125, V157).
- Capacité de mécanisme : tir unique = 1, .357 = 6 (CSV), finition d’un tube/barillet = capacité de sa base ; normalisation hors rechargement, surplus vers la réserve.
- Sons : indices V188 existants seulement (le compte de 41 indices est épinglé).
