# Validation V81 — État local

Date de validation locale : 2026-09-12.

## Verdict

Les portes locales V81 sont vertes pour le code, les tests et le build. Elles couvrent la qualification M41A physique, le verrouillage de l’identité Echo-9, les trois assets Proving Ground et les atlas/comportements Crusher et Spitter.

Cette validation inclut désormais une preuve navigateur locale complète. Elle n’est pas encore une preuve de publication canonique et ne ferme aucune des 26 conversations du projet.

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

`npm.cmd run qa:browser:v81` est vert sur `http://127.0.0.1:4176/` :

- parcours écran titre → hub → Armory → porte physique → console → échelle → pad → qualification ;
- 14 captures, dont trois preuves dédiées aux cibles 04, 07 et 08 auparavant hors écran ;
- 1 147 échantillons d’identité joueur, tous avec `fallback: false` et `reason: null` ;
- cinq feuilles Echo-9 décodées en 1 024 × 1 024 ; locomotion et combat observés dans ce scénario ;
- neuf cibles entièrement cadrées avec Echo-9, neuf impacts sur dix tirs et un rechargement ;
- reprise pendant un projectile puis après qualification, sans projectile sérialisé ni reçu rejoué ;
- cinq contrôles tactiles accessibles à 390 × 844 ;
- aucune exception, erreur console, requête échouée ou réponse HTTP en erreur.

Le rapport et les captures se trouvent sous `docs/references/v81-release-qa/browser-local/`.

## Publication

**En attente.** Aucun commit de contenu V81, push GitHub, déploiement Vercel, état `Ready`, promotion canonique ou contrôle HTTP n’est revendiqué ici. Après publication réelle, `npm.cmd run verify:production:v81 -- --commit=<sha>` devra vérifier le commit exact, les assets et l’exclusion des preuves privées.

## Critères de sortie restants

1. committer sélectivement sans inclure les candidats/revues protégés non liés ;
2. pousser le commit de contenu ;
3. déployer sur Vercel et attendre `Ready` ;
4. vérifier la production canonique et le commit exact ;
5. rejouer la QA navigateur sur la production ;
6. consigner uniquement les preuves réellement obtenues.

## Limites explicites

- matrice : **0 DONE / 17 PARTIAL / 9 MISSING** ;
- Proving Ground : M41A seulement ; P-5000 et tutoriels avancés absents ;
- joueur : identité Echo-9 sécurisée, mais prologue, créateur, art Neuro et animations dédiées restent ouverts ;
- ennemis : deux atlas intégrés, pas le corpus total ;
- art V81 : adaptations originales de projet, `canonExact: false` ;
- hub : props/PNJ, replay MIRE et commandes CCTV/verrouillage encore partiels.
