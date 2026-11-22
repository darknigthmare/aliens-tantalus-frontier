# Plan : outils de développement (spec 012)

## Exposition retenue

Recommandation suivie : disponible sur le serveur de développement et dans l'arbre source, **exclue du build public**.

| Élément | Chemin | Rôle |
| --- | --- | --- |
| Lanceur | `devtools/index.html`, `devtools/dev-launcher-v188.js` | Liste filtrable, options de session, construit la fixture et écrit la session dans `sessionStorage` (cet onglet) |
| Catalogue | `devtools/dev-catalog-v188.js` | Entrées générées depuis `CAMPAIGNS`, `HUB_DECKS`, `ASPHODELE_ROOMS_V188`, `CINEMATIC_IDS_V188`, phases des niveaux dédiés ; scène attendue par entrée |
| Fixtures | `devtools/dev-fixtures-v188.js` | Échelle de progression par les règles du jeu ; `migrateSave` ; `inspectSaveSlotV78` ; injections déclarées |
| Stockage isolé | `devtools/dev-storage-v188.js` | Script classique injecté en premier : `localStorage` → mémoire de l'onglet |
| Pont de session | `devtools/dev-session-v188.js` | Titre → Continuer, `showView`, `launchCampaign`, transition de phase des niveaux, lecteur de cinématiques ; options et surcouches ; panneau DEV |
| Stand de tir | `devtools/dev-range-v188.js`, `devtools/dev-range-metrics-v188.js` | Relance du niveau avec un autre chargement, cibles, mesures, réglages, export |
| Serveur | `scripts/dev.mjs`, `scripts/dev-tools-server-v188.mjs` | `/dev` → `/devtools/` ; injection des deux scripts seulement pour `/?atf-dev=v188` |
| Point d'accroche du jeu | `src/app.js` | Ajout d'un crochet QA `__ATF_STORY_V188__.playCinematic(id)` (rejoue sans marquer vu), à côté des crochets existants `__ATF_V51__`, `__ATF_XENO_TRIALS_V96__` |

Le build (`scripts/build.mjs`) ne copie que ses fichiers racine listés, `src/` et `assets/` : `devtools/` n'y entre pas. `scripts/verify-public-release-v86.mjs` admet ces chemins exacts en source seulement (`FORGE_TOOLING_V140`, rejet quand `built`). Aucun module de `src/` n'importe `devtools/` (contrôlé par la suite Node) ; `sw.js` ne les met pas en cache (`/?atf-dev=…` a une requête, donc réseau seulement).

## Ouvrir

```
npm run dev                       # PORT=4711 npm run dev pour un autre port
# puis http://127.0.0.1:4173/devtools/  (ou /dev)
```

Choisir la langue, la difficulté et les options, puis une entrée. Le panneau DEV en haut à droite reprend les options, la pause, l'image par image, « Relancer l'entrée » (fixture d'origine) et « Quitter vers le lanceur » (session supprimée). Le stand de tir ajoute son panneau en bas à gauche : Armes, Équipement, Escouade, Cibles, Mesures, Réglages, Journal. API de console : `__ATF_DEV_V188__` (état, `range.measures()`, `range.setWeapon(id)`, `range.spawn({...})`, `range.squad(action, valeur)`, `range.exportDiff()`).

## Raccordement au jeu

- Mission : `__ATF_V51__.launchCampaign(campagne)` — mêmes verrous, insertion réelle (boutons du joueur), atterrissage réel.
- Checkpoint de phase : `advanceColonyPhaseV188()` / `advanceStationPhaseV188()` jusqu'à l'index, puis placement au checkpoint comme une reprise.
- Hub, vues : bouton Continuer du titre, puis `showView`.
- Cinématique : `playStoryCinematicV188(id, { once: false, record: false })` par le crochet QA.
- Stand : `engine.start(options capturées)` avec `weapon`, `equipment`, `experimentalPhysicalMagazinesV167`, sans atterrissage ; cibles `engine.createEnemy` ; mesures par enveloppes d'instance de `fire`, `applyEnemyDamage`, `reload`, `onEvent` et des méthodes du directeur audio.

## Vérification

- `node --test scripts/verify-dev-tools-v188.mjs` (dans `test:priorities:v188`) : toutes les entrées actives (≈650) → sauvegarde valide et scène attendue ; prologue, histoire, fins ; couverture ; ordre des prérequis ; exclusion du build ; injection serveur ; stockage isolé (vm) ; mathématiques des mesures et du diff.
- `node scripts/qa-dev-tools-v188.mjs <sortie>` (Chromium) : un échantillon par catégorie, options du panneau, stand avec 3 armes, un équipement, deux ordres d'escouade, export ; profil réel inchangé ; 0 erreur de page.
