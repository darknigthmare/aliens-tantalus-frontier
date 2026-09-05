# V71 — Extension physique de l’USS Tantalus

Date : 5 septembre 2026. Version de travail : **71.0.0**.

V71 ajoute dix annexes physiques au hub et constitue la cinquième surface jouable de Special Operations. La conversation `tantalus-hub-expansion` reste **partial**. L’accès utilise `accessSurface: hub` ; seules les quatre opérations possédant une campagne sont injectées dans le catalogue, qui conserve **440 campagnes**.

## Contenu réalisé

Les 16 salles historiques sont reliées à dix branches réciproques : Sas d’arrivée, Logistique, Archives MIRE / Palimpsest, Baie synthétique, CCTV, Proving Ground, Morgue, Capsules, DURANDAL Ω et vestibule BIOFORGE.

Chaque annexe mesure 1 920 × 720 et possède un sol continu, une porte et un retour physique, une station persistante, six placements logiques, trois colliders, une passerelle et une échelle. Les nervures qui bloquaient la traversée au sol ont été suspendues, laissant 112 px de passage. Les dix trajets sont couverts par test ; la reprise conserve également la hauteur et l’état d’échelle.

Les commandes tactiles de montée et de descente complètent les contrôles du hub. Les ordres de module passent par la station logistique : un seul ordre persistant, annulation explicite et refus d’un remplacement silencieux. Les services sont soumis aux ressources, au cooldown et à la validation de leur transaction.

## Portée des services

- MIRE indexe des preuves uniques et distingue rapports, médias déjà consultés et bilans de mission ; la relecture physique dans la salle reste à produire.
- CCTV effectue un scan et ajoute une preuve ; les commandes de lockdown ne sont pas réalisées.
- La baie synthétique ne traite que les unités disponibles et vivantes, à l’exclusion des capturées, disparues et décédées.
- La morgue déduplique les entrées et conserve jusqu’à 512 dossiers et 512 preuves traités.
- Le Proving Ground prépare un soutien tactique, sans exercice ni certificat de tir, P-5000 ou tutoriel. Les certificats hérités d’une simple visite sont invalidés ; aucun bonus de carburant P-5000 n’est accordé sur cette base.
- Les Capsules préparent une mitigation à usage unique pour une crise perdue ; aucun scénario d’autodestruction n’est joué dans cette annexe.
- DURANDAL prépare une charge de soutien consommée au départ. Une reprise d’opération ne consomme pas de nouvelle charge.
- Le BIOFORGE V71 reste un vestibule étanche et vide. Sélection d’ennemis, quantité, impression, confinement jouable et progression séparée appartiennent au niveau suivant, toujours absent.

## Art contrôlé

Le lot contient **50 WebP** : 20 panoramas RGB et 30 couches RGBA, issus de **sept sources OpenAI ImageGen**. Quatre atlas 5 × 2 couvrent backgrounds, props, foregrounds et portes ; trois correctifs neutres couvrent panorama, console et porte BIOFORGE.

Le traitement élimine le damier, crée l’alpha, recadre et normalise les placements. Les dix ensembles ont été inspectés et les échelles de props corrigées. Les sept PNG masters sont exclus du build, les 50 WebP sous `assets/openai/hub/annexes/v71/` sont conservés.

Le rapport artistique porte le SHA-256 `61f4c34305b8565fc4fa5236930063c257da2b995bd6ede4d155456f57df964f`. La provenance reste `OpenAI ImageGen`, `originalProjectAsset: true`, `canonExact: false`.

## Parité des conversations

| Mesure | Total |
|---|---:|
| Conversations recensées | 19 |
| `effective` | 2 |
| `partial` | 8 |
| `missing` | 9 |
| Conversations encore inachevées | 17 |
| Surfaces jouables | 5 |
| Campagnes Special Operations | 4 |
| Campagnes totales | 440 |

Cargo Brutal et Systèmes de survie Alien sont `effective`. QZ-17, Doctrine Alpha / Bravo et Hub commercial sont jouables mais `partial`.

Le validateur sépare la validité structurelle et contractuelle de la disponibilité commerciale : `productionReady = false` et `complete = false`. Les cinq dettes sont les bitmaps de props indépendants, les PNJ dédiés, les exercices physiques, la relecture physique des archives et les commandes CCTV/lockdown. Elles sont détaillées dans [l’audit V71](V71_HUB_COMMERCIAL_AUDIT.md).

## Récupération du workspace sur D

Le travail a été récupéré dans `D:\CodexWork\aliens-tantalus-frontier\project`. La comparaison a confirmé **4 808 fichiers aux empreintes identiques**. Deux sources tronquées lors de la saturation du disque C, `src/app.js` et `src/hub-annex-services-v71.js`, ont été restaurées.

Les **3 864 fixtures synthétiques de tests**, totalisant **1 459 999 407 octets**, ont été déplacées vers `D:\CodexWork\aliens-tantalus-frontier\recovered-test-fixtures-20260905`. Chaque fichier a été vérifié par taille et SHA-256 avant retrait de sa copie C ; les dossiers demeurent récupérables sur D.

## Validation et publication

Passage complet final : **952 tests, 951 réussis, 0 échec, 1 ignoré**, en 22 secondes. Le lint valide **278 modules**. Le build produit **71.0.0**, **3 450 entrées catalogue** et **440 campagnes**, avec 50 WebP V71 présents et les masters exclus. Les preuves sont consignées dans [VALIDATION_V71](VALIDATION_V71.md).

Sur D, accueil et hub chargent sans erreur navigateur. Une fixture prépare l’approche de la porte Quarantine ; l’entrée BIOFORGE, sa traversée par contrôles runtime, la station, la reprise depuis le JSON de localStorage et le retour sont vérifiés. Les cinq couches sont prêtes. La station reste à une utilisation après reprise et sortie. À 390 × 844, la largeur reste de 390 px, le canvas mesure 390 × 219.375 px et les neuf boutons tactiles sont nommés. Cette recette ne revendique pas un parcours manuel depuis le pont ; ses valeurs actuelles figurent dans la validation. Le contrôle d’accessibilité final reste à actualiser.

Publication Vercel et contrôles HTTP : **À COMPLÉTER**. V71 ne représente pas encore l’achèvement du hub commercial ou des 19 conversations.
