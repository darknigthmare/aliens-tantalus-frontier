# V72 — QA du Red Xenomorph 019 existant

Date : 2026-09-05. Décision : **candidat non promotable**. Revue bornée du profil `enemy-019-red-xenomorph`, sans nouvelle génération ni modification de source, atlas, métadonnée, référence globale, queue, état ou runtime. Cette décision locale ne constitue pas un événement d'acceptation ou de rejet dans l'historique global.

## Contrôles exécutés

- `getJobStatus` sur la file et l'état actuels : `generated`, 4/4 clips attestés, `issues: []`.
- `py scripts/process-v66-enemy-batch.py --profile enemy-019-red-xenomorph --check` : succès, 32 poses, zéro finding de grille, zéro acceptation automatique. Le mode `--check` ne réécrit pas les assets.
- Lecture pixel/format de l'atlas : WebP RGBA 1024×2048 ; 1 690 304 pixels transparents ; zéro pixel blanc opaque avec RGB >244 ; 32 cellules RGBA distinctes.
- Les quatre GIF de revue contiennent chacun huit images. Aucun test de déplacement/collision ni playback runtime n'a été exécuté par cet audit : les contacts séquentiels sont une preuve d'inspection des poses, pas une certification de fluidité en jeu.
- Inspection réelle du comic de référence local et des quatre contacts `idle`, `move`, `attack`, `death`, sur fond sombre, plus `attack` sur fond clair. Le pont `view_image` a échoué sur l'ACL Windows ; l'affichage a été obtenu depuis les mêmes fichiers locaux par décodage PIL en mémoire et émission JPEG. Aucun fichier image dérivé n'a été sauvegardé ni réinjecté dans les assets.

## Ce que montrent les poses

| Critère | Résultat et réserve |
|---|---|
| Identité | Warrior rouge/noir identifiable, dôme côtelé et queue segmentée cohérents à l'échelle des contacts. Le comic est une scène oblique, pas une planche orthographique qui permettrait de garantir une copie 1:1. Le verrou reste une adaptation. |
| Anatomie | Deux bras, deux jambes et une queue identifiables dans les contacts ; mains, membres superposés et détails des poses terminales demandent encore la revue d'acceptation agrandie. Aucun « anatomy:true » global n'est inscrit. |
| Direction | Profil droit cohérent dans les quatre clips inspectés. |
| Mouvement | **Échec qualitatif du clip `move`** : les huit poses conservent pratiquement la même stance, avec des pieds avant/arrière proches de leurs positions initiales. Les phases de passage et l'échange d'appuis d'un cycle complet ne sont pas lisibles. Des pixels différents ne suffisent pas à en faire une vraie marche/course. |
| Attaque | Un bras se lève puis s'étend ; l'anticipation et la récupération existent sous forme de poses, mais le bassin et les appuis portent peu l'action. Transfert de poids et portée/contact à améliorer et à recaler sur le gameplay. La frappe ne doit pas être déclarée fluide sur ce seul contact. |
| Mort | Perte d'appui, passage à genoux et corps terminal couché réellement visibles. Ce n'est pas une ligne d'idle déguisée. Les raccords et l'échelle inter-clips restent à contrôler. |
| Échelle | Aucun examen métrique rigide propre au profil 019 dans `V66_BATCH_002_SCALE_REVIEW.json`. Les quatre facteurs valent 1. La taille apparente varie entre clips, mais on ne doit pas utiliser la bbox de la pose debout/accroupie pour calculer arbitrairement une correction. Mesurer le même segment du crâne, avec incertitude, avant tout facteur. |
| Ancrages | **32/32 non revus** : `anchorStatus: pending-body-root-review`, méthode `legacy-bounds-center-bottom`. Le centre variable de la silhouette/queue n'est pas une racine corporelle. Aucune entrée 019 dans `V66_BATCH_002_ANCHOR_REVIEW.json`. |
| Alpha | Fond global transparent, sans rectangle blanc. Toutefois 62 pixels opaques satisfont un détecteur fuchsia strict ; petites contaminations chromatiques candidates à inspecter/corriger, pas une autorisation de supprimer indistinctement toute couleur violette. |
| Cellules | Grille et garde contrôlées par le normaliseur ; zéro finding. Ce succès n'annule pas les défauts de mouvement et d'ancrage. |

Le détecteur fuchsia utilise alpha=255, R>140, B>140, R−G>60 et B−G>60. Répartition : idle 5, move 14, attack 9, death 34. Exemples en coordonnées locales de cellule, frames indexées à zéro : idle/0 `(126,112)` = `[254,1,221,255]`, move/1 `(152,174)` = `[255,10,197,255]`, attack/0 `(138,140)` = `[255,50,221,255]`, death/1 `(159,196)` = `[213,0,230,255]`. Ce détecteur mesure des candidats résiduels, pas leur cause sémantique ; aucun pixel n'a été modifié.

## Travail à faire, dans l'ordre

1. Garder l'idle comme référence de continuité du candidat, sans le déclarer accepté. Régénérer `move` avec les huit phases explicites de contact, charge, passage et récupération, appuis proches/lointains alternés et boucle fermée ; conserver l'individu, la palette et le crâne. Ne pas décaler les images existantes pour simuler une marche.
2. Améliorer `attack` pour que l'anticipation, la poussée des appuis, la frappe et la récupération soient lisibles sans allonger arbitrairement le bras. Une nouvelle source doit conserver la précédente comme révision rejetée et fournir son prompt réel.
3. Mesurer l'échelle à partir du même repère crânien sur des poses comparables, puis examiner les 32 racines et plans d'appui des sources retenues. Une nouvelle génération remet à vérifier ses propres mesures ; ne pas recopier les racines du standard sur une variante Albino.
4. Corriger uniquement la contamination de fond démontrée avec les options techniques bornées du pipeline, puis refaire la QA sur fonds clair/sombre, les marges, l'égalité atlas/clips, les hashes et les raccords. Ne pas élargir aveuglément les seuils sur une identité rouge.
5. Seulement après résolution de ces portes, envisager l'événement `accepted` et l'intégration réelle avec test de déplacement, frappe, mort et reprise de sauvegarde. Le contrat `acceptedEvidence` refuse déjà les racines non revues ; aucune dérogation n'est justifiée.

## Empreintes des fichiers contrôlés

| Fichier | SHA-256 |
|---|---|
| `metadata/v66/enemy-019-red-xenomorph.json` | `815ad3b038ecf82a1d78dcf65a6b52521f17b5e3600a7f5e2f7e66ed583fb612` |
| `normalized/enemy-profiles-v66/enemy-019-red-xenomorph.webp` | `dc6978589be6b6ff213a2fa5de1933d96c4e12a1090e8ca2a57e02168eeef32d` |
| `frames/v66/batch-002/enemy-019-red-xenomorph/idle.png` | `66e0989f10785e6e850708f91cc33102fe95e390c6c3b60d6090b2a7aa70ce0f` |
| `frames/v66/batch-002/enemy-019-red-xenomorph/move.png` | `915b22fa094871212142fd13fef1cf1306aeaf5600d07d47f3e7f9a9dcab71d0` |
| `frames/v66/batch-002/enemy-019-red-xenomorph/attack.png` | `9bbcb93d5fb5679b5d59fc1cd4bbd6d6d55dc433a9e70f0c437853ad21d932e6` |
| `frames/v66/batch-002/enemy-019-red-xenomorph/death.png` | `90a4f356fb657e3758f9b8fbb6ec6fba7575d6ee1f1e89a8cc3f013c12bd7bf3` |

Ces chemins sont relatifs à `assets/openai/sprites/`. Provenance vérifiée par le normaliseur et `getJobStatus`, pas reconstituée à partir d'un nom de fichier. État final de cette revue : `accepted=false`, `runtimeIntegrated=false`, `canonExact=false`.
