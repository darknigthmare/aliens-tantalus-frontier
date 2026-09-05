# Validation V73 — lot de 50 ennemis

Date : 5 septembre 2026. Livraison partielle et vérifiée, pas certification de 50 ennemis jouables ou de jeu commercial achevé. Voir [état de production](ENEMY_PRODUCTION_V73.md).

## Vérifications locales exécutées

- `npm test` : 1 068 tests, 1 067 réussis, aucun échec, un ignoré ; 18,2 secondes. Les six échecs initiaux ont révélé cinq assertions de registre/cache obsolètes et une vraie incohérence de version dans `src/content.js`, corrigées avant ce résultat.
- `npm run lint` : 290 modules valides. `npm run build` : version 73.0.0, 3 450 entrées catalogue (ce nombre ne représente pas des assets terminés).
- Normaliseur Python : 36 tests historiques et 11 tests autonomes V73 réussis.
- Contrat runtime ciblé 055 et régressions V66 : 126 tests réussis ; sortie exacte conservée dans `references/v73-next50-audit/054-055/runtime-test-output.txt`.
- Queue de production et synchronisation du manifeste V66 : contrôles réussis ; 7 profils intégrés V66 plus le Facehugger V65, soit 8 atlas et 256 poses. Un seul nouvel intégré dans le lot V73 : 055.
- `node scripts/enemy-next50-audit-v73.mjs --check` : 50 profils, 216 sources présentes avec provenance vérifiée, 4 anciens prompts incomplets, 41 normalisations actuelles. Présence et normalisation ne valent pas acceptation artistique.
- `py -3 scripts/process-v66-enemy-batch.py --profile enemy-055-albino-chestburster --check` : 32 poses, aucune anomalie technique, aucune acceptation automatique.
- Inclusion/exclusion réelle dans `dist` : 9 contrôles réussis. Atlas 055 présent ; sources V73, lecteur de revue, prompts, état de production et atlas candidats 053/054/056/057 absents. Le filtre possède aussi 11 tests automatisés réussis.

## Recette navigateur réellement effectuée

Le lecteur local affiche exactement les 50 identités figées (007 à 057, hors 020). Pour 055, les indices 0 à 7 ont été observés sur chacun des quatre clips ; repos et déplacement bouclent, attaque et mort se figent sur la dernière pose. Pas d'erreur JavaScript relevée pendant cette session.

Une scène isolée emploie le vrai `GameEngine`, son chargement d'atlas, `createEnemy`, `updateEnemy` et `drawEnemy`. L'atlas dédié 055 est chargé ; corps 35 × 20, pieds de l'ennemi et du joueur au même sol y930, orientation droite. La morsure inflige une seule fois 15 PV à l'indice local 4 ; aucun dégât supplémentaire après récupération, sauvegarde inchangée. Ce n'est pas un parcours complet de campagne.

Preuves dans le dépôt (volontairement exclues du site public) :

- `references/v73-next50-audit/054-055/browser-combat-fixture.mjs` et `browser-combat.json` ;
- `references/v73-next50-audit/054-055/browser-055-impact.png` et `browser-055-terminal.png` ;
- décisions centrales exactes dans `references/v73-next50-audit/release/`.

## Publication

Commits `bbcdfbd` (lot et intégration) et `c6bbf12` (préservation exacte de la preuve de réparation051) poussés sur `codex/v52-physical-worlds`, dépôt privé `darknigthmare/aliens-tantalus-frontier`.

La copie propre de publication, au commit `c6bbf12`, a passé de nouveau : queue, instantané V73, manifeste, normaliseur055, lint290, suite globale1 067 réussis/1 ignoré/0 échec et build73.0.0. Une normalisation Git des fins de ligne de la preuve051 a été détectée dans cette copie puis corrigée sans changer la source ni réécrire son empreinte historique.

Déploiement Vercel confirmé **Ready**, `dpl_CgLwdrSKobn2z3CeHvQwnMCZ13Y7`, version73.0.0 construite à `2026-09-05T18:42:14.953Z` depuis cette copie propre.

- Site : https://aliens-tantalus-frontier.vercel.app
- Déploiement immuable : https://aliens-tantalus-frontier-paje5gkm5-darknigthmares-projects.vercel.app
- `/`, `/build-info.json`, `/sw.js`, atlas runtime055 : HTTP200. Empreinte publique055 identique à l'acceptée : `c2ed130649fc57aeaf0509376f7601eb8987c853914595e5231689f636709ede`.
- Cache du service worker : `atf-v73-enemy-055-shell-1`.
- Ancien move055 refusé, candidat054 et reçu de génération055 : HTTP404, exclusions confirmées.

Recette sur le site public : accueil → continuer → hub → commandement → xénobiologie → recherche Albino Chestburster. À1280×900, les32 indices de l'atlas ont été observés : idle0–7, move8–15, attack16–23, death24–31. L'attaque et la mort terminent à23 et31, sans reboucler. Le bon WebP est chargé; aucun débordement horizontal ni erreur JavaScript de l'application relevé. Capture de mort inspectée avec les quatre silhouettes à échelle commune. Résultats exacts et captures dans `references/v73-next50-audit/054-055/production-browser.json`, `production-055-idle.png`, `production-055-death.png` (dépôt seulement).

La mise à jour documentaire de ces résultats intervient après le déploiement; elle ne constitue pas une seconde version du code de jeu publié. Les49 autres profils de ce lot restent non finalisés.
