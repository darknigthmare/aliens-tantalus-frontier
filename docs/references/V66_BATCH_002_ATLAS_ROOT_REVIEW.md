# V66 lot 002 — revue des atlas 021 à 025

Date : 2026-08-31. Revue : Codex root. Périmètre : cinq profils, 22 clips, 176 poses. Candidats uniquement ; zéro acceptation artistique ou intégration runtime.

Les 22 planches sources et les cinq contacts d'atlas ont été examinés. Les atlas utilisent les masters OpenAI existants, le détourage strict existant et une échelle de packing commune à chaque profil. Aucun pixel de source n'est repeint par les outils de revue. Le contrôle final des 20 profils et le lecteur local passent ; cela ne remplace pas le contrôle du personnage en salle, de ses collisions et de ses attaques.

## Observations

| Profil | Résultat et défauts restant ouverts |
| --- | --- |
| 021 Neuro-Xeno Drone | 32 poses, 32 racines thoraciques revues et appliquées. Appuis et effondrement relus après reconstruction. Des traces roses restent sur les attaches dorsales, la hanche et certaines articulations. La posture du cou change fortement dans les poses d'attaque ; la lisibilité de l'impact et les raccords temporels ne sont pas validés. |
| 022 Xenoborg | 40 poses, dont une recharge. Canons présents et recharge par capacité/ventilation plutôt que chargeur de fusil. La recharge ressemble encore beaucoup à idle ; le changement d'état est trop discret. Haut du corps partiellement de trois quarts, variation de perspective à contrôler face au profil latéral du jeu. Rose résiduel sur certains tuyaux d'arme et au cou. Racines physiques non mesurées dans cette passe. |
| 023 ATARAX Ripper | 32 poses, 32 racines thoraciques revues et appliquées. Les huit repères de mort ont été corrigés après qu'un premier tracé suivait trop l'avant du corps ; le repère final suit le thorax à travers l'effondrement. Contact final relu. Rose résiduel épaule/bras et attaques peu amples ; continuité et fidélité restent ouvertes. |
| 024 Ripper Queen | 40 poses, dont tail-strike. Corps plus petit dans la frappe de queue que dans idle/attack ; longueur et volume apparent de l'arc caudal variables. Petites zones roses sombres sur bras/tête. Racines et calibrage interclips non validés ; réussite de la découpe ne vaut pas uniformité de proportions. |
| 025 Foundry Drone | 32 poses. La séquence de mort rétrécit nettement par rapport à idle/move. L'attaque à mâchoire interne est présente mais sa lisibilité à l'échelle du jeu reste insuffisamment établie. Petites traces roses sur le haut du corps. Racines et calibrage interclips à produire. |

## 64 racines physiques

Preuves : `V66_BATCH_002_ANCHORS_ROOT.json`, fusionnées dans `V66_BATCH_002_ANCHOR_REVIEW.json`. Overlays : `v66-batch-002-anchor-review/enemy-021-neuro-xeno-drone/` et `enemy-023-atarax-ripper/`.

Les abscisses sont des repères thoraciques observés, pas des centres de boîte incluant la queue. Les ordonnées suivent les appuis visibles au sol ou le corps effondré, avec la garde d'extraction documentée. Les 64 poses ont été inspectées avec une incertitude déclarée de 14 pixels source : il ne s'agit pas de données de capture certifiées.

`V66_BATCH_002_ROOT_MEASUREMENTS.json` conserve le premier relevé. Pour Ripper death, les coordonnées finales sont celles du fragment ROOT et des overlays finaux, pas celles de ce brouillon. `V66_BATCH_002_ROOT_OVERLAY_REVIEW.md` documente cette correction. Les contacts finaux 021 et 023 ont été relus après reconstruction ; ils correspondent aux atlas d'empreintes préfixées `3760958067610620` et `0a2ed906baca014b`.

## Limites

Les poses sont distinctes et affichables, mais huit images par clip ne prouvent pas à elles seules la fluidité, le transfert de poids ou l'identité 1:1. Aucun seuil de suppression des couleurs n'a été élargi pour masquer les défauts restants. Les cinq profils restent `pending-visual-review`, `runtimeIntegrated=false`, `canonExact=false`.
