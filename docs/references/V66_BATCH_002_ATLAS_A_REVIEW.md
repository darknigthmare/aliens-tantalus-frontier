# V66 batch-002 — revue des atlas A (enemy-007 à enemy-013)

Date : 2026-08-31. Auteur : Codex complete_royal.

## Livraison réelle et limites

Les sept atlas candidats ont été produits à partir des 32 sources OpenAI existantes : **256 poses, 32 clips WebP séparés, 32 GIF de clips, sept GIF d'ensemble et sept métadonnées**. Les sources originales sont conservées. Aucun nouvel appel ImageGen, aucune peinture algorithmique, aucune modification runtime, aucun commit dans cette passe.

Toutes les 32 planches sources ont été inspectées, puis les sept contacts construits à partir des pixels des atlas. Ce contrôle est une revue source + lecture séquentielle des poses, **pas une homologation de fluidité en jeu**. Les GIF sont fournis pour la lecture ; leur décodage, nombre de poses et temporisation font l'objet du contrôle d'export séparé. Aucun profil n'est accepté automatiquement : `acceptanceStatus=pending-visual-review`, `runtimeIntegrated=false`, `canonExact=false`.

Les quatre demandes distinctes restent séparées : fichier présent, découpage sûr, ancrage physique, puis qualité artistique/animation finale. Réussir les premières ne prouve pas la dernière ni une fidélité 1:1.

## Fichiers produits

Base atlas : `assets/openai/sprites/normalized/enemy-profiles-v66/`.
Base métadonnées : `assets/openai/sprites/metadata/v66/`.
Clips/GIF : les chemins exacts sont conservés par profil dans les métadonnées et le rapport de contrôle A.
Contacts réellement relus : `docs/references/v66-batch-002-atlas-review/<profile>.jpg`.

| Profil / atlas | Clips | Poses | Ancrage physique manuel |
| --- | ---: | ---: | --- |
| enemy-007-praetorian.webp | 5 | 40 | En attente |
| enemy-008-queen.webp | 5 | 40 | En attente |
| enemy-009-crusher.webp | 5 | 40 | 40 repères relus, fragment fusionné par le parent |
| enemy-010-spitter.webp | 4 | 32 | En attente |
| enemy-011-lurker.webp | 4 | 32 | 32 repères relus, fragment fusionné par le parent |
| enemy-012-carrier.webp | 5 | 40 | En attente |
| enemy-013-ravager.webp | 4 | 32 | En attente |

## Découpage et traitement du fond

Commande utilisée séparément pour chacun des sept profils :

```text
python scripts/process-v66-enemy-batch.py --profile <profile> --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe
```

Les sept normalisations initiales ont réussi, avec `validation.findings=[]`. Le premier essai du Praetorian avec seulement la réattribution sûre avait été refusé : cellule35, aire1,797× la médiane. L'inspection a confirmé du magenta enfermé dans la boucle de queue ; la suppression stricte du fond prouvé a résolu ce défaut sans changer le seuil de validation.

Les palettes examinées n'utilisent pas le magenta vif du fond comme couleur de carapace. Les deux options retirent uniquement le cœur magenta correspondant au fond et sa frange bornée à deux pixels source. Les hashes des masques et nombres de pixels retirés restent dans les métadonnées. Les courtes extensions connectées entre cases sont réattribuées avec preuve de propriétaire ; aucun membre ou bout de queue n'est jeté pour faire passer le contrôle.

Des zones fuchsia sombres demeurent dans certaines ombres : elles ne satisfont pas forcément cette preuve de fond et **n'ont pas été effacées arbitrairement**. Ce défaut visuel demeure une réserve de validation artistique.

## Ancrages A : 72 mesures physiques

Fragment : `docs/references/V66_BATCH_002_ANCHORS_A.json`.
Mesures explicites : `docs/references/V66_BATCH_002_MANUAL_ANCHORS_A.json`.
Preuves : neuf vues `docs/references/v66-batch-002-royal-qa/<profile>/anchor-<clip>.jpg`.

- Crusher : centre thoracique derrière l'épaule avant, projeté sur le sol d'appui. Les poses couchées suivent le thorax postérieur visible derrière le bouclier, avec une incertitude portée à12px source pour les trois dernières poses de mort.
- Lurker : centre du bassin devant la naissance de la queue, suivi à travers station bipède, déplacement bas, attaque et effondrement.
- Les abscisses sont des mesures anatomiques manuelles, pas le milieu des limites de queue ou de crâne. Le sol est le bas de la pose récupérée avec sa garde de trois pixels, confirmé visuellement sur les pieds/mains d'appui ou le corps couché.
- Toutes les sources et toutes les annotations ont été inspectées. Les hashes source et les coordonnées ont été revérifiés inchangés lors de la confirmation.
- Les attaques Lurker3/4 montrent une extension basse avec appui ; ces images ne suffisent pas à certifier une phase de bond aérien.

Le statut `reviewed` dans ce fragment ne valide que ces repères physiques, pas l'art, le timing, la taille interclips ni la fidélité exacte.

## Calibrage crânien A : mesuré mais NON APPLIQUÉ

Fragment de proposition : `docs/references/V66_BATCH_002_SCALE_A.json`.
Mesures manuelles : `docs/references/V66_BATCH_002_MANUAL_SCALE_A.json`.
Contre-vérification indépendante : `docs/references/V66_BATCH_002_SCALE_A_MATH_CHECK_B.json`.
Preuves : six vues `scale-<clip>.jpg` dans le dossier de contrôle A.

Dix-sept cordes crâniennes ont été mesurées dans des poses latérales comparables, avec deux extrémités en coordonnées de cellule source, distance euclidienne, incertitude4px et hash de chaque source. Ni les mâchoires, ni les tuyères, ni les queues ne servent de règle d'échelle. La médiane de référence est celle de l'animation idle.

| Profil / clip | Médiane du crâne source (px) | Facteur proposé |
| --- | ---: | ---: |
| Lurker idle | 149,2649 | 1 |
| Lurker move | 140,4279 | 1,062929 |
| Lurker attack | 80,3243 | 1,858278 |
| Lurker death | 81,9085 | 1,822337 |
| Spitter idle | 121,3796 | 1 |
| Spitter death | 75,14385 | 1,615297 |

Le Spitter dispose de trois mesures idle et deux mesures death. La troisième pose de mort a été exclue pour rotation/foreshortening du crâne. Ses clips move et attack ne sont pas calibrés dans cette passe : leurs facteurs restent1, ce qui **ne certifie pas** une égalité de taille.

Le contrôle indépendant confirme les17 distances, les huit SHA source, les six fichiers de preuve et les rapports de médianes. L'application nécessiterait une évolution du normaliseur partagé ; **cette modification a été refusée par auto-review pour autorisation explicite manquante**. Le parent a demandé cette autorisation à l'utilisateur. Il n'y a eu aucun contournement par édition des verrous de références, de la file ou de l'état.

Les atlas reconstruits avec le normaliseur existant conservent donc les facteurs interclips1 et leur rétrécissement visible. Le calibrage `reviewed` est une proposition mesurée non appliquée, pas une correction déjà livrée.

## Réserves artistiques réellement observées

| Profil | Réserves empêchant l'acceptation finale |
| --- | --- |
| 007 Praetorian | Les appuis ne sont pas encore mesurés. Le pivot fondé sur les limites déplace nettement le corps dans la frappe de queue4→5 ; l'arc/longueur de queue et les passages entre poses restent à contrôler en lecture animée. Les dernières corrections conservent deux bras visibles, mais la cohérence avec les petites formes de bras des sources idle/move/death ne vaut pas validation canonique. Quelques îlots fuchsia restent dans les ombres, notamment bassin et mort. |
| 008 Queen | Les deux longs bras et les petits bras thoraciques sont présents, avec des occlusions à vérifier pose par pose avant fidélité exacte. La planche tail-strike présente un corps sensiblement plus petit que idle ; les changements d'attitude et d'échelle avec attack/death restent à homogénéiser. Ancrages non mesurés, origine de queue partiellement masquée dans les phases d'extension. |
| 009 Crusher | Les appuis sont maintenant mesurés. Les volumes du bouclier et la perspective changent entre idle, coup de tête et effondrement ; la tête tournée n'est pas une preuve d'échelle uniforme. La charge contient des compressions/extensions lisibles mais sa continuité temporelle et son raccord de boucle ne sont pas homologués. |
| 010 Spitter | Rétrécissement marqué dès la première pose de death, facteur mesuré non appliqué. Ancrages et cohérence interclips restants non validés. Les appendices dorsaux et reservoirs jaunes restent reconnaissables ; la silhouette sombre et les petites traces fuchsia nécessitent une revue sur décors de jeu. |
| 011 Lurker | Attack/death nettement plus petits que idle/move ; facteurs mesurés non appliqués. Les32 appuis sont mesurés, pas la fluidité. Zone rose/fuchsia visible sous la hanche dans move1 et petites traces sur d'autres poses. La séquence d'attaque n'établit pas un véritable bond aérien. |
| 012 Carrier | Le lâcher est réellement dessiné : petit passager détaché visible dans les phases4–6 et contenu dans sa case. Mais le corps du Carrier dans release est nettement plus petit ; calibration et ancrages restent à faire. Les passagers deviennent très petits et rosés sur le fond sombre ; lisibilité, teinte et chronologie du détachement non acceptées. |
| 013 Ravager | Deux lames intégrales sont présentes, sans remplacement par des épées tenues. Leur courbure/longueur apparente et la transition attack6→7 restent à contrôler ; le déplacement possède peu d'amplitude d'appui. Ancrages non mesurés et îlots fuchsia encore visibles sur les articulations. |

Les contacts ont été relus sur fond sombre. Une revue en situation sur les décors du jeu, à l'échelle runtime, avec mouvement, tirs et collisions est encore requise. Aucun comportement de gameplay, déploiement ni état commercial complet n'est déduit de ces assets.

## Contrôle d'export et reconstruction

Outil de contrôle borné : `scripts/v66-batch-002-royal-export-check.py`.
Rapport final : `docs/references/V66_BATCH_002_ATLAS_A_QA.json`.

Ce contrôle appelle les garde-fous existants, compare les sources/atlas/clips/GIF à leurs hashes et vérifie le décodage de toutes les poses, la temporisation GIF et les boucles. Le premier contrôle après fusion des repères globaux a correctement refusé l'ancien atlas007 : hash de revue d'ancrage changé. Ce refus n'a pas été masqué et les anciens fichiers ont été conservés jusqu'à la reconstruction coordonnée par le parent.

La reconstruction coordonnée est terminée. Le contrôle final A a réussi pour les sept profils : **sept atlas, 32 clips, 256 poses, 39 WebP, 39 GIF et sept métadonnées**. Les32 hashes source, les hashes des atlas/clips/aperçus, l'égalité des pixels entre clips séparés et atlas, les garde-fous stricts de cellule et les preuves de fond sont vérifiés par le normaliseur existant. Les39 GIF ont été décodés : huit poses pour chaque clip et toutes les poses pour chaque aperçu d'ensemble, avec boucles conformes au contrat. Leur temporisation est quantifiée au centième de seconde par GIF :170ms pour le contrat6fps,80ms pour12fps,100ms pour10fps. Ce décodage n'est pas une certification de fluidité en situation.

Les72 poses des contacts recalés009/011 ont été relues après cette reconstruction : appuis enregistrés sous le thorax/bassin, aucune coupe au bord observée, taille interclips toujours imparfaite. Les cinq autres atlas ont conservé exactement leurs pixels précédemment relus ; seule leur preuve de revue d'ancrage globale a été rafraîchie.

- Revue globale d'ancrage incorporée : SHA256 `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`.
- Atlas Crusher relu : SHA256 `15db78d87c9c4b95aa6aad60e1f01631541563f0c309f9e7683ea731610c9f0e`.
- Atlas Lurker relu : SHA256 `04e47a0bcfff8e2135b6f21909189e68df86f4e7accb26b6ac9e4e714aed7f6c`.

Les sept exports restent `pending-visual-review`, non intégrés et sans certification canonique exacte. Tous les facteurs interclips constatés dans les métadonnées sont toujours1. **Le calibrage crânien proposé demeure non appliqué**, en attente d'autorisation ; les réserves artistiques listées ci-dessus restent ouvertes.
