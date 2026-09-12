# Validation V81 — État local et production

Date de validation : 2026-09-12.

## Verdict

Les portes locales V81 sont vertes pour le code, les tests et le build. Elles couvrent la qualification M41A physique, le verrouillage de l’identité Echo-9, les trois assets Proving Ground et les atlas/comportements Crusher et Spitter.

Cette validation inclut une preuve navigateur locale et une preuve distincte sur la production canonique. Elle ne ferme aucune des 26 conversations du projet.

## QA globale exécutée

Commande :

```powershell
npm.cmd run qa
```

Résultats observés :

- lint : **372 modules validés** ;
- tests : **1 554 au total** ;
- réussis : **1 553** ;
- échecs : **0** ;
- ignorés : **1** ;
- build : **version 81.0.0** ;
- catalogue du build : **3 450 entrées**.

La commande inclut les gates OpenAI/provenance/alpha des trois assets Proving Ground, le traitement V81 Crusher/Spitter, les inventaires historiques, les contrats sprites, le lint, tous les tests Node et le build filtré.
Le rapport alpha couvre 423 PNG runtime avec 0 erreur ; 13 candidats de halo historiques restent explicitement classés `review`.

## Contrats couverts

- Proving Ground : topologie, 9 cibles, 3 hauteurs, session, rechargement obligatoire, score, reçu et anti-rejeu ;
- hub : entrée/sortie physique, HUD, contrôles, tir, collisions, reprise et persistance ;
- service : une simple interaction ne donne plus de bonus ; seul un reçu valide arme le soutien ;
- joueur : cinq feuilles Echo-9, 80 cellules, pivot, tailles, facing, repli et migration ;
- ennemis : 40 poses Crusher, 32 poses Spitter, alpha, pivots, hitboxes, facings, charge et projectile acide ;
- PWA/build : version, cache V81, chemins runtime et exclusion des preuves privées.

## QA navigateur

`npm.cmd run qa:browser:v81` est vert sur `http://127.0.0.1:4176/` après le hotfix de sortie d’échelle :

- parcours écran titre → hub → Armory → porte physique → console → échelle → pad → qualification ;
- 14 captures, dont trois preuves dédiées aux cibles 04, 07 et 08 auparavant hors écran ;
- 1 143 échantillons d’identité joueur, tous avec `fallback: false` et `reason: null` ;
- cinq feuilles Echo-9 décodées en 1 024 × 1 024 ; locomotion et combat observés dans ce scénario ;
- neuf cibles entièrement cadrées avec Echo-9, neuf impacts sur dix tirs et un rechargement ;
- reprise pendant un projectile puis après qualification, sans projectile sérialisé ni reçu rejoué ;
- cinq contrôles tactiles accessibles à 390 × 844 ;
- aucune exception, erreur console, requête échouée ou réponse HTTP en erreur.

Le rapport et les captures se trouvent sous `docs/references/v81-release-qa/browser-local/`.

## Publication

La V81 est publiée sur [aliens-tantalus-frontier.vercel.app](https://aliens-tantalus-frontier.vercel.app) depuis le commit final `178ff8b5f3d3ffd51988e8287e53e200466683d3`, poussé sur `codex/v52-physical-worlds` et `main`. L’intégration GitHub/Vercel a terminé le déploiement `dpl_7D2pV41jGofDwgEUZngdmwRNHY8w` avec le statut `success`.

`npm.cmd run verify:production:v81 -- --commit=178ff8b5f3d3ffd51988e8287e53e200466683d3` est vert :

- version `81.0.0`, cache `atf-v81-proving-ground-shell-1` et HTTP 200 ;
- **34 fichiers runtime critiques** identiques octet pour octet au commit final ;
- **10 assets runtime V81** présents : 5 feuilles Echo-9, 3 assets Proving Ground et 2 atlas ennemis ;
- **30 chemins de preuves privées** confirmés absents de la publication par HTTP 404.

Le premier passage navigateur production a détecté une vitesse verticale résiduelle à la sortie haute de l’échelle. Le moteur a été corrigé pour ancrer le joueur, annuler cette vitesse et empêcher une ré-accroche en poussant au-delà de l’extrémité. Après redéploiement du commit final, le parcours production est vert avec **14 captures**, **1 167 échantillons d’identité sans fallback**, neuf impacts sur dix tirs, un rechargement, deux reprises et zéro exception, erreur console, requête échouée ou réponse HTTP en erreur. Les preuves sont conservées sous `docs/references/v81-release-qa/production-http.json` et `docs/references/v81-release-qa/browser-production/`.

## Limites explicites

- matrice : **0 DONE / 17 PARTIAL / 9 MISSING** ;
- Proving Ground : M41A seulement ; P-5000 et tutoriels avancés absents ;
- joueur : identité Echo-9 sécurisée, mais prologue, créateur, art Neuro et animations dédiées restent ouverts ;
- ennemis : deux atlas intégrés, pas le corpus total ;
- art V81 : adaptations originales de projet, `canonExact: false` ;
- hub : props/PNJ, replay MIRE et commandes CCTV/verrouillage encore partiels.
