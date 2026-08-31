# V66 lot 002 — calibrage interclips appliqué

Date : 2026-08-31. L'utilisateur a répondu « Oui » à la demande d'autorisation de modifier le normaliseur partagé avec tests de non-régression. Cette évolution est maintenant implémentée et appliquée aux atlas candidats Spitter 010 et Lurker 011. Aucun de ces profils n'est accepté artistiquement ou intégré au jeu.

## Résultat mesuré dans les pixels des atlas

Les 17 segments crâniens précédemment annotés sont projetés avec les dimensions de raster réellement produites, arrondis compris. La longueur médiane de chaque animation est comparée à celle d'idle. Ces ratios ne sont pas une mesure de fidélité artistique ni une certification de toutes les proportions du corps.

| Profil / animation | Facteur source appliqué | Taille relative avant | Taille relative après |
| --- | ---: | ---: | ---: |
| Spitter death | 1,615297 | 61,926 % | 100,183 % |
| Lurker move | 1,062929 | 93,949 % | 99,691 % |
| Lurker attack | 1,858278 | 53,783 % | 99,920 % |
| Lurker death | 1,822337 | 54,666 % | 99,809 % |

Les quatre écarts de médiane restants sont inférieurs à 0,4 %. Pour Spitter, idle reste à 62,305 pixels et death passe de 38,583 à 62,419 pixels. Pour Lurker, les médianes finales se situent entre 49,745 et 49,899 pixels.

**L'échelle de packing du Lurker passe de 0,458677686 à 0,333702348, soit −27,2469 %.** Tous ses clips utilisent cette échelle commune afin que les queues et les membres entiers restent dans les cellules de 256 pixels avec la garde existante. Idle devient donc plus petit dans l'atlas ; il faudra régler la taille physique dans le monde lors de l'intégration, pas confondre taille de cellule et taille du personnage dans une salle. L'échelle de packing du Spitter reste 0,513761468.

Atlas produits :

- Spitter : `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-010-spitter.webp`, SHA `d199e6cc8d4e69636d022e957f2d87ff246b1e754eb365bde9bd5d5ba264a938`.
- Lurker : `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-011-lurker.webp`, SHA `3377ebb3c84617a44d0d9b91c2990ece2d200ae70d8671d22ef6ff5591858a39`.
- Leurs huit clips, leurs GIF et leurs métadonnées ont été régénérés. Les clips Spitter inchangés conservent leurs pixels ; aucun master OpenAI n'a été modifié et aucun nouvel appel de génération n'a été nécessaire.

## Implémentation et garde-fous

`V66_BATCH_002_SCALE_REVIEW.json` est la revue active post-génération, distincte du verrou des références originales. Elle conserve les valeurs exactes des 17 mesures du fragment A et les six contacts de preuve. SHA de la revue : `dcab1772242b00106219b5a5d12f595e1452d74f524f3cab95b9bd9db235e115`.

- Le normaliseur Python n'applique un facteur que pour un profil explicitement revu : sources exhaustives et SHA exacts, mesures comparables, au moins deux poses par clip mesuré, médianes, dates, coordonnées et preuves locales contrôlées.
- Les facteurs sont bornés à [0,25 ; 4], le facteur idle reste 1, la longueur des segments doit correspondre à leurs extrémités à un pixel près et le facteur au ratio de médianes à 3 % près. Aucun facteur par pose ni relâchement de la garde de cellule.
- La preuve `postGenerationScaleReview` lie le fichier de revue, ses pièces, les sources et les facteurs aux métadonnées. Les profils sans revue conservent le comportement et le format historique, sans champ ajouté. Une calibration de référence existante et une calibration post-génération ne peuvent pas se remplacer silencieusement.
- Le mode Python `--check` réextrait et recalcule les atlas calibrés **en mémoire**, puis compare tous les placements et les pixels RGBA. Une ancienne image avec seulement des métadonnées retouchées ne passe pas ce contrôle.
- La porte d'acceptation Node vérifie indépendamment les preuves, sources, mesures, facteurs et placements. Elle ne fait pas le repacking RGBA : cette vérification relève du contrôle Python, également exécuté sur les deux vrais atlas. Les deux validateurs ont produit la même preuve structurée pour les profils réels.
- Le lecteur affiche le facteur déjà incorporé au clip et sa provenance. Il ne redimensionne pas les poses individuellement et ne change pas l'état d'acceptation.

## Vérification et non-régression

- Comparaison indépendante avant/après : **133 fichiers protégés strictement inchangés**, soit les cinq atlas et cinq métadonnées du pilote, les 87 masters du lot 002, et les 18 autres atlas et 18 autres métadonnées de ce lot.
- Contrôle final du lot 002 : 20 atlas, 696 poses, aucune anomalie de cellule. Contrôle du pilote : cinq profils, 160 poses, aucune anomalie.
- `npm run qa` : **694 tests réussis, zéro échec, un test ignoré sur 695** ; lint de 225 modules et build réussis. Le test ignoré nécessite la création d'un lien symbolique, refusée par Windows avec `EPERM`. La vérification des chemins réels est implémentée ; ce scénario n'est pas présenté comme exécuté ici.
- La suite Python comporte 34 tests réussis, exécutés aussi à travers le test Node du normaliseur. Ne pas additionner ces 34 tests au total Node comme s'ils constituaient un second passage indépendant.
- Navigateur local isolé, contrôle final à 19:41:30 UTC : 20 profils, 87 clips, 696 poses distinctes affichées, les deux profils calibrés reconnus, facteurs affichés vérifiés, lecture réelle, arrêt de la mort, miroir et mobile contrôlés ; aucune exception ou erreur console.
- L'audit historique des 405 PNG runtime conserve zéro erreur et 13 candidats à revue de halo, sans prétendre les avoir corrigés dans cette passe.
- Les références de génération, QUEUE et STATE n'ont pas été modifiés. Le lot reste à 20 profils générés et zéro profil accepté/intégré ; les cinq profils du pilote restent intégrés.

Preuves : `V66_BATCH_002_SCALE_APPLICATION_BEFORE.json`, `V66_BATCH_002_SCALE_APPLICATION_AFTER.json`, contacts dans `v66-batch-002-scale-application/`, `V66_BATCH_002_PLAYER_QA.json`, métadonnées et contacts d'atlas actualisés. Les captures locales `.qa/v66-batch-002/*-calibrated.png` restent hors publication.

Le fragment `V66_BATCH_002_SCALE_A.json`, sa contre-vérification et les précédents rapports de livraison conservent leur état historique « non appliqué » ; ils ne décrivent pas l'état final de cette implémentation. Le hash brut Windows du fragment conservé dans le relevé avant est historique : la comparaison des mesures avant/après utilise un hash canonique indépendant des fins de lignes CRLF/LF, et la revue active est sauvegardée en LF.

## Ce qui reste à faire

La correction de taille n'enlève pas les résidus roses, ne redessine pas les articulations et ne certifie pas les transitions. Spitter attend toujours ses ancrages physiques ; Lurker attend notamment la reprise des traces roses et la validation artistique/animée. Les quatre clips recalibrés ne rendent pas les autres profils automatiquement cohérents. Les calibrages Queen, Carrier, Ripper Queen et Foundry Drone restent à mesurer et à revoir.

Avant toute intégration : définir les dimensions physiques en salle, contrôler les collisions et fenêtres d'attaque, puis accepter uniquement les profils répondant à tous les critères. **Aucun nouveau sprite de ce lot n'est annoncé déployé sur Vercel.**

## Reproduire les contrôles

```powershell
py scripts/process-v66-enemy-batch.py --batch batch-002 --check
py scripts/audit-v66-batch002-scale-application.py --phase after
node scripts/enemy-batch-production.mjs check
npm run qa
```

Le relevé avant ne doit pas être écrasé. Pour un futur profil, ajouter une revue de mesures puis reconstruire les profils calibrés dont l'empreinte de revue commune a changé. Une revue ajoutée ne doit pas être injectée dans les anciens verrous de génération.
