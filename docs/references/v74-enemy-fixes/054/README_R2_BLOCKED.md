# 054 Albino Facehugger — retouche R2 encore bloquée

Revue du 2026-09-05, limitée au candidat `attack-clean-r2.png`. Aucun remplacement de source active, atlas actif, registre partagé, STATE ou seuil de détourage. Les prompts et reçus R1/R2 restent intacts.

## Décision

**Ne pas promouvoir R2.** Le halo violet de la pose 2 diminue fortement, mais la retouche a rempli l'ajour entre les doigts repliés par une zone rose/ivoire opaque. Le prompt demandait au contraire un fond magenta uniforme dans cet ajour, pour obtenir une vraie transparence. Le défaut reste visible au grossissement après la chaîne finale, pas seulement dans la source brute.

- Preuve décisive : `attack-r2-pose2-still-blocked.png`, comparaison V73/R2 à 12×, sur fonds sombre et clair, cellule normalisée pose 2, ROI `[140,205,178,241]`.
- Pixels du diagnostic violet large de la pose 2 : 35 dans V73, 8 dans R2. Les huit pixels R2 sont opaques (alpha 255). Les coordonnées et le diagnostic d'ajours sont reproductibles depuis le script ; le nombre large n'est pas un critère automatique, car il inclut aussi de vrais tissus roses.
- Magenta strict : zéro dans les deux versions. Ce compteur seul aurait donné un faux sentiment de réussite.
- Les huit poses complètes et leur ordre compression / lancement / vol / retombée restent lisibles, sans deuxième corps ni deuxième queue observés. Toutefois le remplissage de l'ajour altère ce détail anatomique. La retouche modifie aussi légèrement la position, le contour et la tonalité ; elle n'est pas un changement strictement limité au fond.

## Diagnostic technique effectué

`review-r2-final.py` compose en mémoire les 32 poses du profil : idle, move et death V73 inchangés, attack R2. Il appelle le normaliseur réel avec réattribution bornée des fragments, détourage des magentas enfermés et leur frange, puis **`normalize_frames(..., remove_magenta_spill=True)`**. Aucun élargissement de seuil ni retouche locale arbitraire des pixels.

Les 32 poses passent les contrôles techniques d'unicité, cellules et garde de 16 pixels. Atlas 1024×2048, cellules 256×256, pivot `(128,240)`, erreur maximale du repère après arrondi : 0,480 pixel. Le passage technique n'est pas une acceptation artistique.

Les huit racines d'attaque ont été re-mesurées à partir du centre ventral où s'attachent les doigts proximaux, avec incertitude de ±10 pixels source. Plans d'appui voisins `y417` / `y364`, conservant l'arc aérien. Les repères ne proviennent pas du centre de la boîte englobante, qui comprend la queue. Contre-vérification visible dans `attack-r2-root-review.jpg`.

L'échelle d'attaque `0.988875` est le rapport de la médiane des deux cordes dorsales idle déjà mesurées à deux nouvelles mesures R2 : pose 1 `[(221,346),(324,351)]`, pose 8 `[(180,302),(286,311)]`, incertitude ±5 pixels par extrémité. L'échelle commune de rangement reste `0.411017939`. Ce sont des repères d'enregistrement approximatifs de tissus souples, pas des dimensions canoniques. Les facteurs ne sont appliqués qu'une fois.

Les fichiers `attack-r2-anchor-review.proposed.json` et `attack-r2-scale-review.proposed.json` sont des propositions physiques diagnostiques avec `runtimePromotionAllowed:false`. Ils conservent les revues V73 des trois autres clips liées à leurs SHA. **Ils ne doivent pas être utilisés pour promouvoir cet art refusé.**

## Preuves et reproduction

Commande depuis la racine du dépôt : `py -3 docs/references/v74-enemy-fixes/054/review-r2-final.py` (TEMP/TMP sur D, bytecode désactivé).

| Élément | SHA-256 |
| --- | --- |
| Source R2 | `d6b06b49d08a409d4b2ba21a3595e0a382ec862bd7981b23e20102a7c4c2fa67` |
| Atlas diagnostique | `f80d875241796f305496db618a912be63eee7451d54a67b07a746fbb3b050c8b` |
| Diagnostic final JSON | `b01e765ae3b40e5a402dc2105994653592bf4c8e0b9beb25dce1a8d1cb9d8c72` |
| Gros plan du défaut | `0832e99102fcd8bb7a829488d6897260f4b5f79c3e7fd5c20e0a6414ce49b3fd` |

Le script vérifie la stabilité des SHA des sources lues, de l'attaque active V73, de son atlas et des deux revues physiques antérieures. La source active reste `7111891dde424e3f97f8b49638448e6dffc7abfb53b29203e8ca63f5eaf5c66e`, l'atlas actif `91d0c77c1354c2e367cc0a07a017ddf900357670441f37705a49064ddb9de31f`.

Prochaine correction nécessaire : restaurer l'ajour et ses bords ivoire/brun dans la pose 2 via une retouche localisée et revue, sans recolorer les vrais lobes roses. Cette nouvelle correction n'a pas été exécutée ici. Pas de nouvelle génération, pas de recette animée navigateur ni de certification 1:1 revendiquées pour R2.
