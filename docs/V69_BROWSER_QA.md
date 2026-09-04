# V69 — QA navigateur de sortie Alpha / Bravo

Date : 4 septembre 2026.

Cible : `ALIENS: TANTALUS FRONTIER v69.0.0`, servie localement sur `http://127.0.0.1:4174/`.

Surfaces vérifiées : Chromium bureau 1280 × 720 et portrait mobile 390 × 844.

## Parcours jouable vérifié

Le parcours réel a traversé l’écran titre, une nouvelle chronologie, le hub physique, le centre de commandement, l’onglet Opérations, la planification de **Doctrine Alpha / Bravo**, le déploiement Echo-9 et les cinq étapes d’insertion jusqu’au Canvas de mission.

À la prise de contrôle :

- les quatre opérateurs du manifeste étaient vivants et à 100 PV ;
- deux binômes Alpha/Bravo distincts étaient présents dans le niveau ;
- la relocalisation de sécurité d’insertion indiquait `applied: true` ;
- 15 contacts ont été contrôlés et 9 déplacés ;
- rayon de sécurité : `760` ;
- distance minimale mesurée à un opérateur : `793.040352` ;
- contacts encore dangereux : `unsafe: 0` ;
- contacts sans support physique : `unsupported: 0`.

La sélection Alpha, Bravo et Tous, les raccourcis `1` / `2` / `3`, l’armement et le placement d’un ping avec `C`, ainsi que les ordres `B` / `N` / `M` ont été exercés dans le runtime. Les pings sont apparus sur une surface physique valide du niveau et les commandes ont modifié l’état tactique du groupe ciblé.

## Mobile 390 × 844

La mise en page finale mesurée tient intégralement dans le viewport :

| Surface | Mesure CSS |
| --- | --- |
| Canvas / frame de mission | `390 × 219.375`, de `y=295.42` à `y=514.8` |
| Dock Alpha / Bravo | `378 × 194`, de `y=58` à `y=252` |
| Journal de mission | de `y=682` à `y=726` |
| Commandes tactiles | de `y=732` à `y=834` |

Aucun chevauchement n’a été observé entre le dock, le Canvas, le journal et les commandes tactiles. Les contrôles d’équipement redondants sont masqués en portrait, leurs actions restant disponibles dans la barre tactile.

## Accessibilité, console et erreurs

Dernier rapport axe-core conservé sur la mission :

- `violations: 0` ;
- `passes: 35` ;
- `incomplete: 1`.

Le contrôle incomplet n’est pas présenté comme une réussite automatique : axe ne peut pas déterminer le contraste de certains éléments à travers les dégradés et recouvrements. Le défaut sémantique précédemment détecté sur le groupe tactile a été corrigé avec un rôle explicite, puis le rapport a été rejoué. Le point restant n’est pas compté comme violation axe et demeure une revue visuelle explicite.

- console Chromium : aucune entrée ;
- erreurs de page : aucune entrée.

## Portée de cette preuve

Cette QA certifie l’accès utilisateur, le lancement, la lisibilité desktop/mobile, le placement initial sûr, les quatre opérateurs et les commandes tactiques de la mission V69. Les tests automatisés couvrent en complément tâches, score, blessures, reprise, certification et anti-tamper. Elle ne certifie ni les 19 conversations comme achevées, ni la couverture artistique dédiée de tout le catalogue, ni le jeu commercial complet.
