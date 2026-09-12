# Validation locale V79 — scène titre modulaire

Date : 2026-09-12.

## Portée

- trois presets runtime Acheron, Ceto et Mire-9 ;
- onze rôles de composition indépendants ;
- modes Full, Reduced et Static ;
- dix-huit bitmaps OpenAI reliés, avec contrôle SHA-256 ;
- fallback procédural par strate et composite V61 de dernier recours ;
- responsive bureau, portrait et paysage compact ;
- cohérence package/runtime/index/build-info/service worker en `79.0.0`.

## Gates

| Gate local | Résultat |
| --- | --- |
| `node scripts/audit-title-assets-v79.mjs` | **RÉUSSI** — 18/53 intégrés, 35 manquants, 0 erreur |
| Contrats ciblés assets/runtime/titre/production | **34/34 RÉUSSIS** |
| `npm run qa` | **RÉUSSI** — 1 454 tests réussis, 0 échec, 1 test explicitement ignoré |
| Audit PNG global | **RÉUSSI** — 423 PNG runtime, dont les 18 V79, 0 erreur ; 13 revues halo historiques hors lot V79 |
| `npm run lint` | **RÉUSSI** — 341 modules |
| `npm run build` | **RÉUSSI** — `79.0.0`, 3 450 entrées catalogue |
| Navigateur Chrome 153 isolé | **RÉUSSI** — 28 groupes, 4 layouts, 3 presets, modes Full/Reduced/Static, fallback forcé, 0 issue, 0 erreur console/HTTP |
| Régression resize/scroll | **RÉUSSI** — `scrollLeft=0`, document à 0 et `scrollWidth=clientWidth` aux 5 étapes et pour les 3 presets |
| Packaging Vercel | **RÉUSSI** — 18 PNG runtime (11 812 707 octets), 0 preuve/source V79 sous `docs/references` dans `dist` |

Le lot navigateur canonique contient 17 fichiers. Le rapport est `docs/references/v79-browser-qa/final-local/title-browser-report.json`, SHA-256 `05c88e85d13f5252fc41e630e45918ccfb505cb137cc756b860bbe3c262a8120`. Les captures Acheron, Ceto, Mire-9, bureau, portrait et paysages ont été relues visuellement. Un refus de planète contrôlé conserve le fallback procédural sans réafficher inutilement le composite V61.

Aucun commit, push ou déploiement V79 n’est revendiqué dans cette passe.

## Limites

Le manifeste de production prévoit 53 slots. Dix-huit sont intégrés dans cette release ; les 35 autres restent explicitement manquants et ne possèdent aucun chemin runtime fictif. Selon le preset, le premier titre transfère encore environ 7,20 à 7,72 Mio de PNG ; la conversion/adaptation réseau reste une optimisation P2. La fine couture violette du halo Acheron reste une note artistique P2, sans détachement géométrique ni défaut alpha détecté.
