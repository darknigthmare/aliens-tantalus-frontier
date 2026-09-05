# Validation V71

Date : 5 septembre 2026. Workspace actif : `D:\CodexWork\aliens-tantalus-frontier\project`.

Les résultats ci-dessous distinguent les contrôles exécutés, les observations historiques et les vérifications encore en cours. Le hub reste **partial**, avec `productionReady = false` ; une recette technique réussie ne clôt pas ses cinq dettes de production.

## Contrôles exécutés

| Contrôle | État | Preuve observée |
|---|---|---|
| Récupération du workspace | **RÉUSSI** | 4 808 fichiers comparés avec empreintes identiques ; deux sources tronquées restaurées : `app.js` et `hub-annex-services-v71.js` |
| Transfert des fixtures | **RÉUSSI** | 3 864 dossiers, 1 459 999 407 octets, taille et SHA-256 de chaque fichier vérifiés avant retrait de la copie C ; zéro erreur |
| Syntaxe des sources récupérées | **RÉUSSI** | contenu récupéré comparé à la source conservée et `node --check` réussi |
| Art V71 | **RÉUSSI** | 50 WebP et sept masters contrôlés ; dimensions, alpha, placements et provenance conservés |
| Contact sheets | **RÉUSSI** | dix annexes inspectées ; damier et échelle des props corrigés ; BIOFORGE neutre et vide |
| Tests métier et app ciblés | **RÉUSSI** | passage consigné de 19 tests métier + 5 tests app, soit 24/24 |
| Suite complète — passage final | **RÉUSSI** | 952 tests : 951 réussis, 0 échec, 1 ignoré ; 22 secondes |
| Lint | **RÉUSSI** | 278 modules validés |
| Build | **RÉUSSI** | `71.0.0`, 3 450 entrées catalogue et 440 campagnes |
| Composition du build | **RÉUSSI** | 50 WebP V71 présents, sept masters exclus |
| Accueil et hub sur D | **RÉUSSI** | chargement navigateur revérifié, aucune erreur |
| Parcours BIOFORGE sur D | **RÉUSSI — APPROCHE PRÉPARÉE** | fixture positionnée près de la porte Quarantine ; interaction d’entrée, cinq assets prêts, traversée runtime de `x = 1646` à `x = 666`, `y = 532`, puis station et retour |
| Effet et sauvegarde de station | **RÉUSSI** | une utilisation en mémoire et stockée ; quarantaine 69, `galaxy.resources.research = 0`, heure 7, un cycle d’isolation |
| Reprise depuis JSON | **RÉUSSI** | localStorage relu puis arrêt/redémarrage du hub : BIOFORGE à `x = 666`, `y = 532`, une utilisation conservée |
| Retour physique | **RÉUSSI** | contrôle droit puis interaction : Quarantine à `x = 952`, `y = 290`, annexe inactive et une utilisation conservée |
| Tactile 390 × 844 | **RÉUSSI** | largeur 390, canvas `390 × 219.375`, neuf boutons accessibles nommés |
| Erreurs sur ce parcours | **RÉUSSI** | aucune erreur navigateur relevée |

Les fichiers de récupération sont conservés sous `D:\CodexWork\aliens-tantalus-frontier\recovery-20260905`. Les fixtures déplacées sont récupérables sous `D:\CodexWork\aliens-tantalus-frontier\recovered-test-fixtures-20260905` ; aucune suppression définitive de ces données n’est revendiquée.

Le rapport artistique porte le SHA-256 `61f4c34305b8565fc4fa5236930063c257da2b995bd6ede4d155456f57df964f`. La provenance des sources est OpenAI ImageGen, avec `canonExact: false`.

## Contrôle manuel restant

| Contrôle | État | Résultat attendu |
|---|---|---|
| Accessibilité actuelle | **À COMPLÉTER** | nouvelle observation sur la version finale ; contrôle manuel du contraste du gradient |

La recette navigateur prépare la position près de la porte par fixture, puis utilise les contrôles du runtime ; elle ne revendique pas un parcours manuel complet depuis le pont. Les tests couvrent la correction des nervures de plafond et les dix trajets au sol, la reprise sur passerelle/échelle, la déduplication des dossiers de morgue, les unités synthétiques indisponibles et l’invalidation des certificats attribués sans exercice. Les actions métier sont distinguées de leurs promesses encore absentes.

## Observations historiques conservées

La recette antérieure à ces dernières corrections avait réalisé le parcours Quarantine → plateformes → porte BIOFORGE → station → retour à 1280 × 720. Elle avait constaté l’absence de débordement à 390 × 844 et relevé, avec axe-core 4.12.1, zéro violation, 32 passes et un contrôle de contraste incomplet.

Ces observations historiques sont distinctes de la recette sur D consignée plus haut. Les anciens relevés de ressources et de position de retour ne sont pas reconduits ; les contrôles tactiles actuels comprennent neuf boutons.

## Publication

| Gate | État | Preuve attendue |
|---|---|---|
| Déploiement Vercel V71 | **À COMPLÉTER** | identifiant du déploiement, état `READY` et alias canonique |
| HTTP public | **À COMPLÉTER** | accueil, `build-info.json`, modules V71 et échantillons WebP servis ; masters exclus |

Les lignes de publication seront remplacées uniquement après observation du déploiement et des réponses HTTP.

## Invariants et limites

- version package/runtime/shell : `71.0.0` ; cache `atf-v71-shell-1` ;
- 19 conversations : **2 effective, 8 partial, 9 missing**, cinq surfaces jouables et **17 conversations encore inachevées** ;
- 440 campagnes : 436 historiques et quatre Special Operations ; le hub utilise `accessSurface: hub` ;
- 26 salles : 16 historiques et dix annexes ; sol continu et passages testés ;
- 50 WebP artistiques répartis en cinq couches par annexe et sept masters non publiés ;
- `valid` / `structureValid` décrivent la validation du contrat et de la géométrie ; `productionReady = false` et `complete = false` restent explicites ;
- cinq dettes : `independent-prop-bitmaps`, `dedicated-annex-npcs`, `physical-training-exercises`, `physical-archive-replay`, `cctv-lockdown-controls` ;
- CCTV fournit un scan ; MIRE un index ; Proving Ground une préparation ; Capsules une mitigation. Aucun de ces résultats ne certifie les exercices, replays physiques, commandes de lockdown ou scénario d’autodestruction encore absents ;
- BIOFORGE reste un vestibule : le niveau expérimental complet est une conversation distincte `missing`.
