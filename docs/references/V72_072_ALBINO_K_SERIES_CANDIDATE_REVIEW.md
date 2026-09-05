# V72 — contrôle indépendant Albino K-Series072

2026-09-05. Profil `enemy-072-albino-k-series-yellow-xenomorph`, batch005. **Candidat non promotable : le cycle de course répète une demi-foulée.** Cette passe écrit uniquement ce rapport. Aucun appel ImageGen, aucun changement de source, atlas, métadonnée, registre, queue, état ou runtime.

## Vérification réelle

Les quatre masters1774×887 ont été affichés intégralement. Les quatre prompts, la correction réelle `v72_072_idle_tailfix.txt`, les métadonnées et le statut de production ont été lus. Inspection des clips normalisés attack/death sur fond sombre et comparaison agrandie move/1 avec move/5 sur fond clair. Affichage local en mémoire via PIL, sans réécriture des images. Les contacts séquentiels ne remplacent pas un playback runtime/collision, non exécuté ici.

```powershell
py scripts/process-v66-enemy-batch.py --profile enemy-072-albino-k-series-yellow-xenomorph --check
```

Succès :32 poses distinctes, zéro finding, zéro acceptation automatique. Les quatre GIF contiennent chacun huit images. `getJobStatus` confirme `generated`,4/4 clips attestés, aucune erreur de provenance. Ce n'est donc pas une source manquante ; c'est une acceptation artistique/physique restant à terminer.

## Résultats visuels

| Point | Observation et décision |
|---|---|
| Course | **La deuxième rangée répète les phases de la première :1≈5,2≈6,3≈7,4≈8**, avec de petites différences de pose/pixels mais sans échange clairement lisible des jambes proche/lointaine. La comparaison1/5 montre la même jambe avancée. Les phases sont amples, mais huit images différentes ne font pas deux demi-foulées opposées. |
| Pied de course | En1/5, le contour du pied avant comporte une boucle ouverte sous la cheville, absente de l'idle. Détail anatomique à revoir sur le master agrandi ; ne pas l'effacer en le qualifiant de fond sans preuve. |
| Queue | **Grande lame crochue conservée** dans les quatre clips, y compris le corps mort. Elle ne redevient pas la fine pointe erronée du premier idle. Queue segmentée complète visible après normalisation ; aucun morceau manquant identifié dans les contacts. |
| Idle/crâne | Même dôme côtelé allongé, détails de crête et silhouette du thorax ; garde/respiration stable. L'identité générale est cohérente avec l'idle corrigé, sans garantie anatomique1:1. |
| Attaque | Flexion, abaissement du torse, fente longue, suivi et récupération réellement lisibles. Plus physique qu'un simple bras animé. La frappe doit encore être reliée/validée avec son timing et ses appuis runtime. |
| Mort | Descente, genou, chute et corps définitivement couché dans les dernières poses. Aucun redressement final. La grande lame reste attachée ; les positions de fin ne sont pas des cellules coupées. |
| Couleur/échelle | Palette os/paille peu saturée avec creux gris-olive et tissus rose-taupe globalement cohérente. Le crâne change d'inclinaison pendant la mort/l'attaque ; il faut mesurer le même segment rigide, pas la bbox, avant toute correction d'échelle. Pas de métrologie inter-clips certifiée ici. |

Le prochain essai de course doit être fondé sur une référence de locomotion montrant séparément les jambes proche/lointaine et leurs contacts, sans recopier une nouvelle fois la même demi-foulée. Aucune génération supplémentaire n'est lancée par cet audit. Ne pas inventer un cycle par miroir, décalage des pixels, interpolation ou duplication des poses existantes.

## Frontières, alpha et racines

Les transferts documentés concernent uniquement attack/4 et attack/5 (numérotation1–8) :

- attack/4 :1860 pixels de la cellule précédente rendus à leur composante réelle de28340 pixels, propriété93,4368%, emprise locale gauche−32px ;
- attack/5 :30 pixels de la cellule suivante rendus à la composante réelle de28196 pixels, propriété99,8936%, borne droite454px dans une cellule nominale444px.

Les seuils existants ≥90% de propriété et ≤15% d'excursion sont respectés. Les valeurs RGBA sont conservées, avec leurs preuves dans la métadonnée. Ce ne sont pas des suppressions de queue/doigts. En revanche, la consigne source de30px de gouttière partout n'est pas respectée ; seul le résultat normalisé passe la garde16.

Matte intérieur strict :1929 pixels cœur +1392 pixels de frange. Despill après redimensionnement :287 pixels neutralisés, zéro restant selon le détecteur strict. L'alpha affichée n'a pas de rectangle blanc ; les tissus rose-taupe du modèle ne doivent pas être confondus avec une autorisation de retirer toute teinte violette.

Les32 racines restent `pending-body-root-review`, sans fichier de revue physique batch005. Les poses aériennes4/8 exigent un plan de sol distinct du bas de leur silhouette. Le candidat utilise encore un centrage de bbox, non acceptable pour finaliser le mouvement en jeu. Échelle commune de pack0,497777778, quatre facteurs inter-clips1 ; aucune correction par pose ni racine héritée du020 n'est justifiée par cette QA.

## Empreintes contrôlées

| Fichier | SHA-256 |
|---|---|
| idle source corrigée | `572308512b0765d5e3b0e5c056561907e450acc8fa58986eae611977d5ca0f30` |
| move source | `353d21c03aab51f7449d03938fd89c0739598340665da7e635c06d084bf26dd4` |
| attack source | `3522daa76dae89fc8a64781e71b1a73425707565805754d627af1ba8266afc65` |
| death source | `ec60f60facf2dbcc4f380a6a4b36f44b842f2eb37cd20f24bfb097cf5ce2b806` |
| Atlas | `d675b08d099b25ee274221ead03122b320eb0ef858b1fb154a541346e3472bf3` |
| Métadonnée | `a41e8bf8712fb6c6a1efe90f000e3c9f44f6eec45db226ade4012415ce8e75b7` |

Chemins : sources sous `assets/openai/sprites/frames/v66/batch-005/enemy-072-albino-k-series-yellow-xenomorph/`, atlas sous `normalized/enemy-profiles-v66/`, métadonnée sous `metadata/v66/`. Tous sont relatifs à `assets/openai/sprites/` après le premier chemin complet.

Décision : conserver les candidats et les preuves ; reprendre la course/son anatomie de pied, puis mesurer l'échelle et les32 racines sur la révision retenue. `accepted=false`, `runtimeIntegrated=false`, `canonExact=false`. Aucune mutation de statut global par ce rapport.
