# V73 — Albino Facehugger 054 : candidat non accepté

Date : 2026-09-05. Profil : `enemy-054-albino-facehugger`.

Les quatre sources dédiées et les 32 poses ont été inspectées, leurs racines physiques et leur échelle recalées, puis un atlas transparent techniquement valide a été produit. Cette production **ne constitue pas une acceptation runtime** : 054 demeure absent de la readylist et des contrats de combat.

## Blocage visuel précis

Dans le clip attack, pose 2 (index 1), un petit trou entre les doigts repliés conserve une bordure violette sombre opaque. Le ROI de la cellule normalisée est `[156,220,168,229]` ; 35 pixels du diagnostic violet s'y trouvent. La preuve `enemy-054-attack-pose2-alpha-defect.png` montre cette zone agrandie sur fonds clair et sombre. Il s'agit bien d'un résidu de détourage, et pas d'un membre supplémentaire.

Le seuil strict magenta du normaliseur ne détecte aucun pixel résiduel. Le diagnostic violet plus large en compte 237 dans l'ensemble de l'atlas, **dont certains sont du tissu rose réellement dessiné**. Il ne faut donc pas assimiler 237 à un nombre de pixels à supprimer automatiquement ni déclarer le détourage propre sur la seule base du contrôle strict.

Les options locales actuelles retirent la frange AA enfermée sur deux pixels source et le magenta fort ; elles ne suffisent pas à corriger sans risque ce halo sombre. Élargir globalement le seuil ou le rayon risquerait d'effacer le tissu rosé et de périmer les preuves d'autres profils. Les suites possibles sont une correction ImageGen ciblée ou un masque ROI explicite lié à la pose, à la couleur observée et au hash source, avec preuve rejouée. Aucune de ces modifications n'a été appliquée par cette revue.

## Ce qui a réellement été vérifié

- Anatomie inspectée : plaque corporelle basse, doigts locomoteurs multiples, une queue ; pas de corps doublé identifié dans les quatre clips. L'attaque montre une préparation, une extension aérienne et une réception ; le clip death se termine par l'affaissement des doigts.
- 32 racines manuelles sur le centre ventral d'origine des doigts ; incertitude moyenne ±10 pixels source. Le repère n'est pas le centre de la boîte de la queue. Les poses d'attaque aériennes conservent leur hauteur de saut, sans aplatir artificiellement tout au sol.
- Huit cordes de plaque dorsale centrale, deux poses peu tournées par clip, de la jonction arrière corps/queue à l'origine antérieure des doigts. Ce repère de tissu mou donne un recalage approximatif de projet, pas une mesure osseuse rigide ni une échelle canonique ; incertitude des extrémités ±5 pixels source.
- Facteurs de clip : idle `1`, move `1.003945`, attack `0.982782`, death `1.001809`, puis une seule échelle de placement `0.411017939`.
- Atlas 4 × 8, cellules 256 × 256, pivot `(128,240)`, 32 poses distinctes, bords transparents, erreur de rendu des racines inférieure à un pixel.
- Première pose idle : enveloppe opaque `[23,187,185,239]`, soit 162 × 52 pixels natifs, queue comprise.

Le Facehugger 002 actuel utilise encore un autre calage et un rendu 112 × 72 non isotrope. Copier ces dimensions sur le nouvel atlas carré déformerait 054 ; une future intégration demande une recette d'échelle propre. Aucun changement de 002 n'a été effectué.

| Preuve | SHA-256 |
| --- | --- |
| Atlas candidat | `91d0c77c1354c2e367cc0a07a017ddf900357670441f37705a49064ddb9de31f` |
| Métadonnée technique | `9c67e40ccdf74d41d1f0cb5803a08e438442ef771a067a46b6d154720ced1ad0` |
| Fragment de racines | `af26adbc765bc4f76452221b35d0bbfd5c24a08a1cef56a38f31170ad098a439` |
| Fragment d'échelle | `7e8aff4c572d2279940fad352270f43e3368670edf24fd77a6481c7b2277eff9` |

Les quatre overlays `enemy-054-albino-facehugger-*-root-review.jpg`, les fragments autonomes, le contact normalisé et le JSON de mesures se trouvent dans ce dossier. Ils conservent les hashes exacts des quatre sources. Ni source partagée, ni registre global de revue, ni STATE, ni acceptation centrale n'ont été modifiés par cette sous-tâche. L'absence de défaut anatomique observé n'est pas une certification de fidélité 1:1.
