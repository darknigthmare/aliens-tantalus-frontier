# V72 — références et production des 33 profils sans atlas moderne

Relevé en lecture seule du 2026-09-05. Aucun appel ImageGen, aucune mutation de file, de référence globale, d'état ou de runtime dans cette étude.

## État réellement mesuré

`ENEMIES` contient 571 profils. La résolution `resolveSpriteSheet(resolveEnemyVisualProfile(profile).sheetId)` renvoie `null` pour **33 profils**, exactement trois familles de onze. Ce n'est pas « 33 personnages invisibles » : leur rendu actuel utilise encore les lignes legacy `neuroXeno:0`, `neuroXeno:1` et `synthetic:2`. Ces quatre poses historiques ne remplacent pas les clips modernes demandés.

Leur contrat V66 cumule **143 plaquettes sources** : 44 Red, 44 K-Series et 55 Combat Synthetic. **13 sources existent et leur provenance active passe `getJobStatus`** : les trois bases 019/020/042, statut `generated`, zéro erreur. Il reste 130 sources absentes pour ces 30 variantes, hors régénérations nécessaires des bases. Cinq références sont déjà verrouillées : les trois bases et Albino Red 071 / Albino K-Series 072. Les 28 autres profils sont `pending-reference`.

| Modificateur | Red : ID / lot | K-Series : ID / lot | Combat Synthetic : ID / lot | État actuel |
|---|---|---|---|---|
| Standard | 019 / 002 | 020 / 002 | 042 / 003 | 4/4, 4/4, 5/5 sources attestées ; non acceptées |
| Albino | 071 / 005 | 072 / 005 | 094 / 006 | 071/072 prêts référence ; 094 à définir |
| Armored | 123 / 007 | 124 / 007 | 146 / 008 | Références absentes |
| Acid-Blooded | 175 / 010 | 176 / 010 | 198 / 011 | Références absentes |
| Cryo-Adapted | 227 / 013 | 228 / 013 | 250 / 014 | Références absentes |
| Vacuum-Adapted | 279 / 015 | 280 / 015 | 302 / 016 | Références absentes |
| Hive-Guard | 331 / 018 | 332 / 018 | 354 / 019 | Références absentes |
| Apex | 383 / 020 | 384 / 020 | 406 / 021 | Références absentes |
| Juvenile | 435 / 023 | 436 / 023 | 458 / 024 | Références absentes |
| Elder | 487 / 026 | 488 / 026 | 510 / 027 | Références absentes |
| Neuro-Linked | 539 / 028 | 540 / 028 | 562 / 029 | Références absentes |

Les IDs complets et chemins immuables restent ceux de `V66_ENEMY_BATCH_QUEUE.json`; ne pas déplacer ces profils dans un nouveau lot physique. Les groupes de travail de 202 profils se superposent aux lots de stockage de vingt, sans changer les preuves ni les chemins.

## Sources réelles utilisables et portée

### Red Xenomorph

- Référence locale : `assets/openai/sprites/reference-masters/v66/batch-002/enemy-019-red-xenomorph/genocide-comic.webp`.
- Quatre masters : `assets/openai/sprites/frames/v66/batch-002/enemy-019-red-xenomorph/{idle,move,attack,death}.png` ; atlas candidat et métadonnées homonymes sous `normalized/enemy-profiles-v66/` et `metadata/v66/`.
- Le fabricant licencié confirme l'identité Genocide Warrior rouge/noir. Sa page a été relue pendant cet audit ; elle ne fournit pas nos huit poses ni une garantie pixel-exacte. [NECA — Genocide 2-Pack](https://store.necaonline.com/blogs/news/new-aliens-genocide-action-figure-2-pack-coming-in-june).
- Le fichier de comic local est une référence visuelle issue de la recherche historique, pas une preuve que son hébergeur secondaire est l'éditeur. Il reste hors assets publiés.
- Reprendre le verrou 019 ; 071 change le pigment selon son verrou propre, pas la silhouette en un autre ennemi. Ne pas transformer « Red » en Red King ou Prowler.

### K-Series Yellow

- Référence locale : `assets/openai/sprites/reference-masters/v66/batch-002/enemy-020-k-series-yellow-xenomorph/k-series-game.webp`.
- Quatre masters et atlas candidat existants, mêmes racines de dossiers, profil 020.
- Le verrou historique cible le Warrior jaune au premier plan gauche, pas la reine de l'image. Les URL documentées dans le verrou sont AVP Central / AVP Galaxy, donc secondaires : cette étude ne les rebaptise pas officielles et ne certifie pas une reconstruction du mesh d'origine. Aucune nouvelle source primaire K-Series n'a été vérifiée dans cette passe bornée.
- Le candidat et le verrou 072 peuvent servir de continuité de design projet ; leurs réserves d'adaptation restent explicites. Une exigence de reproduction canonique exacte nécessiterait une capture ou un modèle de production identifié et une vraie revue comparée.

### Combat Synthetic

- Prédécesseur projet : `assets/openai/synthetic-android-animation-sheet.png`, ligne 2 ; prompt dans `docs/ART_PROVENANCE_V47_1.md`.
- Cinq masters réellement présents : `assets/openai/sprites/frames/v66/batch-003/enemy-042-combat-synthetic/{idle,move,attack,death,reload}.png`. Aucun atlas/métadonnée V66 au premier relevé ; la QA suivante a préparé un atlas candidat de 40 poses, toujours non accepté : voir `V72_COMBAT_SYNTHETIC042_CANDIDATE_REVIEW.md`.
- Référence et réserves détaillées : `V66_WORKLOT_001_COMBAT_SYNTHETIC_REFERENCE_AUDIT.md`, `V66_WORKLOT_001_COMBAT_SYNTHETIC_TECHNICAL_AUDIT.md`. Les contrôles de provenance actuels passent ; les anciens rapports « aucune génération » sont des étapes historiques, pas l'état actuel.
- Le site officiel confirme des ennemis synthétiques Weyland-Yutani, pas notre modèle blindé et sa carabine. Le modèle Esther documenté est un autre rôle et ne doit pas lui être substitué. Les deux pages ont été relues : [Fireteam Elite](https://www.aliensfireteamelite.com/en/), [Esther](https://www.aliensfireteamelite.com/en/community/meet-the-crew-esther/).
- Le verrou 042 est explicitement `PROJECT_ADAPTATION`. Réserves existantes : échelles `move` et `death` différentes de l'idle, causalité du passage de chargeur à revoir, matte/chroma, racines et marges après correction. Les cinq fichiers ne sont pas une acceptation.

## Préparer la suite sans fausse référence

1. Terminer la QA/réparation des trois bases avant de décliner leurs défauts. Lancer 071/072 en parallèle est possible : leurs verrous existent, mais chaque clip doit conserver sa propre provenance et ses propres mesures.
2. Pour chacun des 28 verrous absents, créer un fragment de référence indépendant avec base examinée, distinction visuelle positive, anatomie, palette, matériaux, arme et vue latérale. Conserver `canonExact:false`. Un modificateur de statistiques n'est pas un design officiel.
3. Définir explicitement les modificateurs problématiques du synthétique : `Juvenile` ne prouve pas un enfant androïde, `Acid-Blooded` ne prouve pas du sang xénomorphe, `Albino` ne décrit pas une pigmentation organique, `Hive-Guard` ne suffit pas à inventer une assimilation. Ce sont des propositions de design/lore à résoudre, pas des prompts prêts à générer. Ne pas masquer le problème par une recoloration automatique.
4. Après revue seulement, `merge-v66-reference-fragments.mjs` peut fusionner de nouveaux profils sans écraser un verrou existant ; `enemy-batch-production.mjs init` doit préserver les IDs et l'historique. Contrôler le diff et `check` avant generation. Une modification d'un verrou déjà utilisé invalide ses preuves de génération jusqu'à revue explicite.
5. Produire une source par vrai clip : Red/K-Series `idle,move,attack,death` ; Combat Synthetic ajoute `reload`. Chaque source a huit poses 4×2, orientation droite, identité verrouillée et une échelle physique cohérente. Pas de copie d'une autre variante, pas d'interpolation pour augmenter le compte.

## Portes de promotion obligatoires

`generated` → sources et prompts réels/hash ; revue anatomie, identité, direction et action → mesures rigides inter-clips et **32/40 racines corporelles examinées** → normalisation déterministe (masters intacts, alpha, garde et bornes) → playback des boucles/raccords et huit critères de `accepted` → branchement réel des clips et preuve de tests/runtime pour `integrated`.

Le normaliseur laisse volontairement `pending-visual-review`, `runtimeIntegrated:false`, `canonExact:false`. Un fichier propre ou 32 hashes distincts ne prouve ni course fluide ni mouvement d'attaque. Le corps ne doit pas être ancré au centre variable de la queue, du canon ou de la boîte englobante. Le contrôleur runtime doit réellement jouer la recharge du synthétique ; ajouter son atlas au registre seul serait insuffisant.

Contrats contrôlés : `scripts/enemy-batch-contracts.mjs`, `scripts/enemy-batch-production.mjs` (`getJobStatus`, `acceptedEvidence`), `scripts/enemy-batch-scale-review.mjs`, `scripts/process-v66-enemy-batch.py`, `docs/references/V66_ENEMY_BATCH_WORKFLOW.md`. Aucun statut global n'a été modifié par ce plan.
