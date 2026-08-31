# V66 — proposition non appliquée de calibrage interclips

Mise à jour : autorisation explicite reçue, implémentation et calibrage 010/011 effectués. Voir [le résultat vérifié](V66_BATCH_002_SCALE_IMPLEMENTATION.md). Le texte ci-dessous conserve la proposition historique précédant cette autorisation.

Date : 2026-08-31. Statut : changement de code non appliqué. L'autorisation automatique a refusé la modification du normaliseur partagé, susceptible d'affecter tous les profils et les portes de validation. Aucun changement n'a été appliqué à `process-v66-enemy-batch.py`, `enemy-batch-production.mjs` ou leurs tests par cette proposition. Il faut une autorisation explicite de ce changement global avant sa mise en œuvre.

Les mesures de `V66_BATCH_002_SCALE_A.json` restent des preuves indépendantes ; elles ne changent ni les sources ni les références ni les atlas. Ne pas les injecter dans le verrou de génération pour contourner l'absence de prise en charge.

## Contrat proposé

Fichier optionnel `docs/references/V66_BATCH_NNN_SCALE_REVIEW.json` : `schema: 1`, `batchId`, `coordinates: nominal-source-cell`, puis `profiles[profileId]`.

Chaque profil doit contenir `status: reviewed`, `reviewer`, `reviewedAt`, `note`, `baselineClip: idle`, `sourceSha256ByClip` couvrant tous les clips, `sourceScaleByClip` couvrant tous les clips, `measurements` et `evidencePaths` locaux non vides.

Chaque mesure : `clip`, `frame` local entier 0–7, `endpoints: [[x,y],[x,y]]`, `lengthPx`, `landmark` rigide identique entre clips, `note`. Les deux coordonnées sont celles de la cellule source nominale, pas celles du crop. Au moins deux poses distinctes pour idle et chaque clip corrigé ; les clips inchangés peuvent ne pas être mesurés. Toute mesure fournie doit avoir un second échantillon comparable.

Contrôles envisagés :

- Sources SHA-256 exactes et exhaustives, preuve et pièces de mesure hashées.
- Facteurs finis entre 0.25 et 4, idle strictement 1 ; jamais de facteur par pose.
- Longueur Euclidienne des extrémités conforme à `lengthPx` à un pixel près ; pas de mesure par boîte englobante.
- Facteur conforme à médiane(idle) / médiane(clip), tolérance relative 3 % maximum.
- Une seule échelle de packing finale par profil ; garde, détourage et transferts de cellules inchangés.
- Métadonnée optionnelle `postGenerationScaleReview` liant chemin, empreinte, facteurs, sources, nombre de mesures et preuves.
- Mode check et porte Node d'acceptation refusant revue, preuve, facteur ou source changé.
- Ancien calibrage de référence du pilote 001 conservé strictement ; conflit avec une nouvelle revue refusé, sans priorité silencieuse.

Tests à implémenter après autorisation : fallback historique 001 sans changement de métadonnées, correction synthétique 2× liée aux mesures, facteurs NaN/Infinity/hors borne, manque de mesures, ratio arbitraire, preuve/SHA source/facteur périmé, conflit legacy, absence de correction par pose et garde inchangée. Aucun de ces nouveaux tests n'est présenté comme déjà exécuté.

## Vérification indépendante déjà effectuée

Le fichier `V66_BATCH_002_SCALE_A_MATH_CHECK_B.json` contient le contrôle en lecture seule des deux profils mesurés par l'agent A : 17 mesures, huit sources dont les hashes concordent, six pièces présentes. Les longueurs annoncées correspondent aux extrémités à moins d'un pixel ; les facteurs concordent avec les ratios de médianes à moins de 0.00003 %. Ce contrôle arithmétique ne certifie ni le choix anatomique des extrémités ni une application aux atlas.
