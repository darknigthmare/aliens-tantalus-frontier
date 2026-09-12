# Validation V79 — scène titre modulaire

Date : 2026-09-12.

## Publication vérifiée

L'autorisation explicite de publication publique a été reçue avant le push. Le lot de contenu V79 est publié sur `darknigthmare/aliens-tantalus-frontier`, branche `codex/v52-physical-worlds`, au commit exact `1124f8b6cec6647e4aed9064045276d3211a52e9`.

La Preview Git `dpl_6af8PBsdpuyXLmCX2F4K8QPwSpkF` était `Ready` à l'URL `https://aliens-tantalus-frontier-hgz5lvbm0-darknigthmares-projects.vercel.app`, avec l'alias de branche `https://aliens-tantalus-frontier-git-cod-8a685a-darknigthmares-projects.vercel.app`. Son accès automatisé a rencontré la protection d'authentification Vercel et la page de challenge du tableau de bord ; il ne s'agissait pas d'un échec du contenu du jeu.

La promotion a créé le déploiement de production `dpl_GEjt7Nmkb631deuNCFB3jngr8Sap`, état `Ready`, URL unique `https://aliens-tantalus-frontier-bxk07y3ty-darknigthmares-projects.vercel.app`. L'alias canonique `https://aliens-tantalus-frontier.vercel.app` a ensuite été affecté explicitement à ce déploiement.

## Portée

- trois presets runtime Acheron, Ceto et Mire-9 ;
- onze rôles de composition indépendants ;
- modes Full, Reduced et Static ;
- dix-huit bitmaps OpenAI reliés, avec contrôle SHA-256 ;
- fallback procédural par strate et composite V61 de dernier recours ;
- responsive bureau, portrait et paysage compact ;
- cohérence package/runtime/index/build-info/service worker en `79.0.0`.

## Gates locales

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

## Gates de production

| Gate public | Résultat |
| --- | --- |
| Parité HTTP `npm run verify:production:v79 -- --commit=1124f8b6cec6647e4aed9064045276d3211a52e9` | **RÉUSSI** — `ok: true`, version `79.0.0`, cache `atf-v79-modular-title-shell-1` |
| Fichiers critiques | **RÉUSSI** — 13/13 servis en HTTP 200 et identiques octet par octet au commit de contenu |
| Bitmaps titre OpenAI | **RÉUSSI** — 18/18 servis en PNG et identiques aux SHA-256 du registre et du commit |
| Cloisonnement des preuves | **RÉUSSI** — 43/43 sources, reçus, rejets et rapports privés absents de Vercel en HTTP 404 |
| Navigateur Chrome 153 public isolé | **RÉUSSI** — 28 groupes, 4 layouts, 3 presets, 12 captures, modes Full/Reduced/Static, sauvegarde corrompue et retour mission, 0 issue, 0 erreur console/HTTP |

La vérification HTTP canonique a été effectuée le `2026-09-12T15:28:20.630Z` contre `https://aliens-tantalus-frontier.vercel.app`. Son rapport est `docs/references/v79-release-qa/production-http.json`, SHA-256 `d61308ab65c4782581feb5de6d23f46111d3689288d4c78c3af4c23882b0c912`.

Le lot navigateur public contient 14 fichiers pour 969 526 octets. Son rapport est `docs/references/v79-release-qa/browser-production/title-browser-report.json`, SHA-256 `3379058957f1019a7c8bc99f706ce0e39ec8f18b9d403b48f8c11ead9fdcdc7a`. L'arbre complet des preuves a le SHA-256 `fff850fde6d9bd701198d1f5e12a769e6ae6e35f4e07d3f4b6d5bfdd364cfa0f`. Les contrôles par preset sont Acheron 14/14, Ceto 13/13 et Mire-9 13/13 ; l'export de sauvegarde corrompu est resté byte-identique.

## Limites

Le manifeste de production prévoit 53 slots. Dix-huit sont intégrés dans cette release ; les 35 autres restent explicitement manquants et ne possèdent aucun chemin runtime fictif. Selon le preset, le premier titre transfère encore environ 7,20 à 7,72 Mio de PNG ; la conversion/adaptation réseau reste une optimisation P2. La fine couture violette du halo Acheron reste une note artistique P2, sans détachement géométrique ni défaut alpha détecté.
