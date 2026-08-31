# V66 lot 002 — 20 atlas candidats, 87 animations

État du 31 août 2026, après la livraison des 87 sources décrite dans `V66_BATCH_002_DELIVERY.md`. Ce rapport décrit la continuation : 19 atlas auparavant absents produits, le candidat 026 actualisé, puis les 20 reconstruits et vérifiés ensemble.

## Réalisé

- **20 atlas RGBA lossless WebP**, 87 clips WebP séparés, 87 GIF de clips et 20 GIF d'ensemble : 696 poses issues des sources OpenAI. Les huit poses par clip sont réellement distinctes dans le lecteur. Aucun ajout de frames par interpolation ou duplication.
- **Deux retouches OpenAI retenues** : K-Series Yellow attack-r4 et Foundry Crusher death-r4. Six appels ImageGen ont été effectués dans cette continuation ; les quatre autres résultats ont été écartés après revue. Prompts, identifiants de génération, hashes et anciennes sources sont conservés. Le fond à damier opaque d'une tentative 026 n'a pas été présenté comme de la transparence.
- **208 racines physiques revues et appliquées** : Crusher 009 (40), Lurker 011 (32), Burster 016 (32), Neuro-Xeno 021 (32), ATARAX Ripper 023 (32), Foundry Crusher 026 (40). Ce statut concerne les repères anatomiques et les appuis, pas l'acceptation de l'art.
- **Lecteur local fonctionnel** : choix parmi les 20 profils et 87 clips, lecture au rythme contractuel, pause, pas-à-pas, vitesse, miroir, arrêt de la mort et affichage des huit poses. Il affiche les vrais pixels des atlas, pas des silhouettes CSS. Il reste un outil de revue privé, hors jeu et hors paquet Vercel.
- Fusion des preuves durcie : exactement huit indices entiers `0..7` requis avant écriture. Treize tests couvrent notamment `1..8`, doublons et valeurs invalides. Les textes de preuve et prompts V66 conservent leurs fins de lignes LF dans Git, sans imposer un traitement texte aux images.

**Aucun profil du lot 002 n'est encore accepté artistiquement ni intégré au runtime. Aucune fidélité 1:1 ni fluidité commerciale complète n'est certifiée.**

## Vérifications réellement effectuées

| Contrôle | Résultat |
| --- | --- |
| Audit des sources, 19:06:11 UTC | 87/87 présentes ; 49 extractions directes, 38 par réattribution courte prouvée ; zéro extraction encore bloquée. |
| Reconstruction avec le normaliseur existant | 20 profils, 696 poses, zéro anomalie de cellule signalée. |
| Vérification finale des atlas | 20 profils, hashes des sources/atlas/clips/GIF et revue d'ancrage cohérents ; garde et découpe validées. |
| Navigateur local isolé, 19:09:10 UTC | 20 profils, 87 clips, 696 poses affichées ; progression réelle de lecture, mort figée, miroir et largeur mobile 390 px contrôlés ; aucune exception ou erreur console. |
| `npm run qa` | 640 tests réussis, lint de 222 modules et build réussis ; audits des anciens lots réussis. |
| Audit des PNG runtime existants | 405 fichiers, zéro erreur, 13 anciens candidats à revue de halo toujours signalés. |
| État de production | 107 sources actuelles prouvées : 20 du pilote et 87 de ce lot ; cinq profils V66 déjà intégrés, 20 générés, 545 encore sans référence revue. |

La QA navigateur est celle du **lecteur d'atlas**, pas un test de combat du lot 002. Les tests du projet vérifient aussi que les candidats ne sont pas copiés dans le build ni le paquet Vercel. Aucun changement des fichiers du normaliseur partagé ou de la porte d'acceptation n'a été appliqué dans cette continuation.

## Calibrage mesuré, non appliqué

Le Lurker rétrécit entre idle et attack/death ; le Spitter rétrécit dans death. Dix-sept mesures de crânes dans des poses comparables ont été annotées, liées aux SHA des huit sources et contre-vérifiées. Les facteurs proposés sont :

| Profil | Clip | Facteur par rapport à idle |
| --- | --- | ---: |
| Lurker | move | 1,062929 |
| Lurker | attack | 1,858278 |
| Lurker | death | 1,822337 |
| Spitter | death | 1,615297 |

**Ces facteurs ne sont pas appliqués aux atlas.** Le contrôle d'autorisation a refusé l'évolution du normaliseur partagé, car elle pourrait affecter les autres lots et leurs validations. Une autorisation explicite a été demandée à l'utilisateur. Aucun contournement par modification des verrous de génération, de la file ou de l'état n'a été effectué.

Les preuves restent dans `V66_BATCH_002_SCALE_A.json`, leur contre-vérification dans `V66_BATCH_002_SCALE_A_MATH_CHECK_B.json`. La proposition de code et ses tests à réaliser sont décrits dans `V66_POST_GENERATION_SCALE_REVIEW_PROPOSAL.md` ; ce document ne prétend pas que ce code existe déjà.

## Ce qui empêche encore l'intégration

1. Terminer les racines physiques des 14 autres profils, soit 488 poses non validées à ce titre. Prowler possède des repères partiels, mais son profil entier reste en attente à cause de trois poses aériennes dont le plan d'appui n'est pas établi.
2. Appliquer et contrôler les calibrages après autorisation ; mesurer aussi Queen tail-strike, Carrier release, Ripper Queen tail-strike et Foundry Drone death, où des écarts de taille restent visibles.
3. Reprendre les résidus roses non prouvés comme simple fond, les variations d'anatomie, de perspective et de queue, les attaques trop peu lisibles et les raccords de boucle. Aucun effacement large ni ajout de membres algorithmique n'a servi à faire passer les contrôles.
4. Valider chaque profil avec ses références, puis en situation dans les salles : dimensions physiques, déplacement, collisions, fenêtre d'impact, mort et orientation. Ne pas promouvoir les vingt profils ensemble simplement parce que leurs fichiers existent.

Rapports détaillés : `V66_BATCH_002_ATLAS_A_REVIEW.md` (007–013), `V66_BATCH_002_ATLAS_B_REVIEW.md` (014–020), `V66_BATCH_002_ATLAS_ROOT_REVIEW.md` (021–025), `V66_BATCH_002_ATLAS_C_REVIEW.md` (026). Foundry Crusher conserve 135 indices de rose au diagnostic, contre 142 avant cette continuation ; c'est une amélioration partielle, pas un détourage déclaré parfait.

## Fichiers et reproduction

- Atlas : `assets/openai/sprites/normalized/enemy-profiles-v66/<profile>.webp`.
- Clips : `assets/openai/sprites/normalized/enemy-clips-v66/<profile>/<clip>.webp`.
- Métadonnées : `assets/openai/sprites/metadata/v66/<profile>.json`.
- GIF : `assets/openai/sprites/previews/v66/<profile>/`.
- Contacts : `docs/references/v66-batch-002-atlas-review/`, avec index des hashes.
- Lecteur : `docs/references/v66-batch-002-player/index.html`, à servir par le serveur local du projet.
- Preuve navigateur : `V66_BATCH_002_PLAYER_QA.json`. Capture locale non publiée : `.qa/v66-batch-002/player.png`.

```powershell
py scripts/audit-v66-batch-sources.py --batch batch-002 --probe-safe-reassignment
py scripts/process-v66-enemy-batch.py --batch batch-002 --check
node scripts/enemy-batch-production.mjs check
npm run qa
```

Pour ouvrir le lecteur : lancer `npm run dev`, puis ouvrir `/docs/references/v66-batch-002-player/index.html` sur l'adresse locale affichée. Le script `qa-v66-review-player.mjs` utilise un Chrome isolé déjà lancé en CDP loopback sur 9236 et le serveur local sur 4177 ; il n'installe pas de navigateur ni de paquet.

La livraison reste séparée des fichiers V65 préexistants non liés à cette tâche. Aucun nouvel ennemi de ce lot n'est annoncé déployé sur Vercel.

Les quatorze photos externes de référence des profils 007 à 017, 019, 020 et 022 restent volontairement hors Git. Les masters OpenAI, métadonnées, mesures et preuves actives sont conservés ; aucune preuve active d'atlas ne dépend d'un fichier temporaire manquant. Une nouvelle comparaison visuelle avec ces photos nécessite de les récupérer depuis leurs sources documentées. Les chemins historiques d'environnement dans les reçus de génération ne sont pas des chemins de chargement du jeu.
