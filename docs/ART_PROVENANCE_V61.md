# Provenance artistique V61

Les bitmaps V61 ont été produits avec Built-in OpenAI ImageGen à partir des références privées fournies et explicitement autorisées par le titulaire du projet. Les références servent au cadrage, à l’échelle, aux matériaux et à l’ergonomie ; les livrables sont des créations originales Tantalus Frontier et ne recopient aucun fichier officiel.

## Livrables

- assets/openai/ui/title/tantalus-frontier-title-background-v61.png
- assets/openai/ui/dialogue/mara-vega-operations-v61.png
- assets/openai/ui/dialogue/sanaa-doyle-armory-v61.png
- assets/openai/ui/customization/echo9-customization-mannequin-v61.png
- assets/openai/hub/props/operations-table-v61.png
- assets/openai/hub/props/armory-counter-v61.png
- assets/openai/hub/props/hangar-control-booth-v61.png
- assets/openai/sprites/weapons/m39-submachine-gun-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/m42a-scope-rifle-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/m6b-rocket-launcher-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/m83-sadar-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/m5-rpg-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/m94-impact-grenade-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/f44aa-pulse-rifle-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/type-88-heavy-assault-rifle-action-sheet.png et son normalisé
- assets/openai/sprites/weapons/ak-4047-pulse-rifle-action-sheet.png et son normalisé
- quatre remplacements MID : médical, laboratoire, quarantaine et support-vie

Les PNG nécessitant une transparence ont été régénérés sur un fond uniforme #FF00FF, puis détourés mécaniquement par scripts/chroma-key-v61.ps1. Le script ne crée ni ne redessine le contenu ; il produit l’alpha et neutralise le liseré chromatique.

La M39 suit la continuité Armat M39 de Aliens: Colonial Marines reliée à ARM-0027. Les M42A, M6B, M83 SADAR et M5 RPG sont des reconstructions originales depuis les références techniques disponibles ; aucun turntable officiel complet n’est revendiqué. Les M94, F44AA et AK-4047 suivent leurs références canoniques reliées au classeur. La Type 88 conserve sa silhouette de référence, avec une finition de terrain UPP explicitement documentée comme adaptation et non comme variante canonique officielle. Les animations d’action, recul, recharge et maintenance sont des créations du projet.

Empreintes finales après nettoyage alpha :

- M39 normalisée : 0A4BA0C68ECA9F4C2BCB355714411D1600A9AD62DE08D683BB57E0A8B563ED1F
- M42A normalisée : 7BD8A84DCDCE5842ECE6D838FE8E3DB74A92FBF91BF69933AED335CD9932C189
- M6B normalisée : DC4F4C2361C0325F89AB69C3EABFA820DADB3C3DCA5D9768C44123EFA76CC318
- M83 SADAR normalisée : 4A65555B30A18B26E883D186CD4638A86F36A29EF6998C60E2F59F08A0A2921B
- M5 RPG normalisée : 81DD4A49D36E61BF8124AADBD0305440819F92BF30B75FD207B769F07478F696
- M94 normalisée : 57D1575251C7C4C45702A18569BE044B7050882D73891B6A3EDE187E5D57A8C2
- F44AA normalisée : 4A54073BC7F48966BADC8DEC4DBC86592CEEE3B28360B4859CE11584921FE662
- Type 88 normalisée : C7245E4AF44278A3441C0EB56B6AD667F7A0753795DA297277BA35B600E67C1C
- AK-4047 normalisée : D80033EFE88439FC3C683595EFD41A45C5DE70F40F41C12237E8847E7E830EA2
- booth hangar : C3BEF8063C93C62B340CF7027A9FEAA10541C2109284339197759E29B9AF06CF

Les plaquettes du manifeste sprite restent séparées des assets d’interface et de hub. Les neuf vraies grilles 4 × 4 ajoutées en V61 portent donc le total final à 191 atlas, 2 708 cellules, 191 sources et 191 normalisés (382 chemins raw/normalisés). La F44AA et l’AK-4047 sont enregistrées dans le manifeste, validées par la gate d’assets et leurs empreintes finales sont figées ci-dessus.
