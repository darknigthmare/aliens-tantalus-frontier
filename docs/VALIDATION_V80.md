# Validation V80 — BIOFORGE jouable et isolé

Date de validation locale : 2026-09-12.

## Verdict

V80 livre un vertical slice BIOFORGE réellement jouable dans un niveau 2D séparé. Le parcours validé couvre la configuration, le contrôle physique, le double sas, l'imprimante, le combat, la purge atomique et le retour au hub. La racine de sauvegarde `bioforgeV80` reste isolée de la campagne, des ressources, de l'équipage et des statistiques stratégiques.

Ce verdict ne ferme pas la conversation source : BIOFORGE reste `PARTIAL`. Le roster V80 contient 11 profils terrestres validés, pas les 571 profils du catalogue, et les six assets modulaires V80 ne constituent pas le corpus artistique complet promis.

## Portes locales exécutées

### Contrats ciblés

La commande documentée dans `docs/VERSION_HISTORY_V80.md` produit :

- 76 tests réussis ;
- 0 échec ;
- 0 test ignoré.

Les contrats complémentaires shell, assets, session, sauvegarde, UI, PWA, titre et production produisent 56/56 tests réussis. Le test runtime dédié ajoute 12/12 réussites, dont l'ordre foreground vers acteurs, l'alpha du premier plan, les halos isolés et l'absence de fuite d'état Canvas.

### QA globale

`npm.cmd run qa` a été exécuté depuis le dépôt actif :

- audit BIOFORGE : 6/6 assets vérifiés, 0 erreur, 0 candidat rejeté ;
- lint : 357 modules validés ;
- tests : 1 508 au total, 1 507 réussis, 0 échec, 1 ignoré ;
- build : version 80.0.0, 3 450 entrées catalogue ;
- parité build : 22/22 chemins critiques et PNG V80 identiques aux sources par SHA-256.

La gate conserve deux dettes mesurées au lieu de les masquer : 0/8 banques audio finales et 559 profils ennemis encore inachevés.

## QA navigateur locale

Le scénario `tests/browser-bioforge-v80.mjs` a été rejoué après les dernières corrections visuelles sur `http://127.0.0.1:4176/`. Le rapport et sept captures sont conservés dans `docs/references/v80-release-qa/browser-local/`.

Résultat :

- `ok: true` ;
- six assets BIOFORGE décodés aux dimensions attendues ;
- sélection Facehugger et quantité 2 pilotées au clavier ;
- transfert physique contrôle vers double sas, imprimante puis arène, sans téléportation ;
- saut réel, tir réel par `pointerdown`, deux spécimens orientés vers le joueur et confinés ;
- purge atomique : zéro entité, projectile, danger, effet ou timer résiduel ;
- retour au hub autorisé seulement après purge ;
- mobile 390 × 844 : sept commandes atteignables, déplacement tactile de 211,07 px, interaction et purge réelles ;
- budget maximal : 12 spécimens et 120 mises à jour logiques sans résidu après purge ; cette mesure ne revendique aucun FPS ;
- état stratégique inchangé ;
- 0 exception, 0 erreur console, 0 log d'erreur, 0 requête échouée et 0 erreur HTTP.

La vignette Facehugger mesure 92 × 76 px et cadre la cellule 0 de l'atlas 4 × 8 (`background-size: 400% 800%`). Pendant la session, seules les commandes pertinentes restent visibles. Le premier plan est peint à alpha 0,34 avant les acteurs ; les différences de pixels mesurées confirment la contribution du joueur et des deux Facehuggers dans leurs rectangles écran.

Une seconde vérification isolée avec `agent-browser` a confirmé un document non vide, l'absence d'overlay d'erreur, le titre V80, le canvas BIOFORGE et les 11 choix du terminal.

## Publication

Le contenu V80 a été commité sous `e189da0ad1d1d5e12588c36d52b521e6b85bf0d0` puis poussé sur `origin/codex/v52-physical-worlds`.

La preview `dpl_FiQmGgL3pC4QkANNiyPYZYgqizat` a atteint l'état `Ready`. Sa protection Vercel est restée active. Le canal authentifié a confirmé le build-info 80.0.0, un asset BIOFORGE HTTP 200 avec SHA-256 identique au registre et le manifeste artistique privé HTTP 404.

La preview validée a ensuite été promue vers la production `dpl_9a5uTBimLQG6MoDxPPMgJixXkLD8`, état `Ready`, avec les alias :

- `https://aliens-tantalus-frontier.vercel.app` ;
- `https://aliens-tantalus-frontier-darknigthmares-projects.vercel.app`.

La gate HTTP canonique, exécutée le 2026-09-12 à `17:22:24.323Z`, valide le commit de contenu exact :

- 16/16 fichiers runtime critiques en HTTP 200 ;
- 13 fichiers identiques octet pour octet ;
- `index.html`, `sw.js` et `runtime-level.css` identiques après la seule normalisation CRLF vers LF ;
- 6/6 PNG BIOFORGE identiques octet pour octet au commit et aux hashes du registre ;
- 19/19 chemins de preuves privées en HTTP 404 ;
- cache `atf-v80-bioforge-shell-1` actif.

Le scénario navigateur a ensuite été rejoué sur la production canonique entre `17:23:44.658Z` et `17:24:02.297Z` : `ok: true`, sept captures, six assets décodés, parcours x2, purge, retour, mobile et x12 réussis. Les contributions de pixels mesurées sont 27,35 % pour le joueur, 22,44 % et 11,11 % pour les deux Facehuggers. Le déplacement tactile réel est de 202,85 px. Le rapport conserve 0 exception, 0 erreur console, 0 log d'erreur, 0 requête échouée et 0 erreur HTTP.

Les preuves sont enregistrées sous `docs/references/v80-release-qa/production-http.json` et `docs/references/v80-release-qa/browser-production/` ; elles restent exclues du site publié.

## Limites explicites

- Matrice des conversations : 0 `DONE`, 17 `PARTIAL`, 9 `MISSING`.
- BIOFORGE : 11 profils validés, budget pondéré 12, maximum 12 simultanés.
- Art V80 : six couches originales et modulaires ; roster complet, variations de dégâts, props additionnels et animation totale encore ouverts.
- Audio final : 0/8 fichiers réels ; synthèse/silence de secours seulement.
- Production ennemie : 11 profils intégrés et 559 profils encore inachevés dans la gate V75.
