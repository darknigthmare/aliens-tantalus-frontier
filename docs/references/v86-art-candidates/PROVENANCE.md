# B03 — plaque candidate, pas un équipement intégré

Outil : ImageGen intégré, génération réussie le 2026-09-13. Aucun appel API/CLI, conformément au choix explicite de l’utilisateur.

Source : `exec-68d5d175-9728-458f-84bd-b6354e4b77a4.png`. Copie brute conservée, sans retouche ni changement de design.

SHA-256 : `4c5bcd3b10fc07e327c014edf3ff97fc48734a9597a313e7813f9367b9cd5d61`.

1536 × 1024, RGBA ; grille 4 × 2, cellules 384 × 512. 65,089 % des pixels ont alpha=0, 29,588 % ont alpha>240. Les bandes intercellules testées ne contiennent aucun pixel alpha>16. L’apparence sombre de l’aperçu ne prouve donc pas un fond opaque : la mesure corrige cette première impression. Une tentative d’édition intégrée a échoué avant génération à cause du lecteur Windows de références (`apply deny-read ACLs`). Aucun contournement API.

Statut : CANDIDATE_NOT_RUNTIME. Les poses de déploiement, le contact au sol, la cohérence mécanique des roues/stabilisateurs, le découpage et la perspective doivent encore être validés. Les quatre images de poussée ne prouvent pas à elles seules une animation fluide. Aucun collider, fonction de barrage ou promesse B03 complète n’est attaché à cette image. Ni source canon officielle ni fidélité 1:1 revendiquée : B03 est un concept propre au cahier des charges Tantalus.

## Prompt de génération

Use case: stylized-concept. Asset type: production 2D side-scrolling science-fiction survival-horror game sprite sheet. Create a dedicated original Tantalus B03 mobile industrial armored barricade: a tall armored panel on a wheeled chassis, rear pushing handles, folding stabilizer legs, readable distressed gunmetal and muted military olive industrial materials. True orthographic SIDE VIEW for a 2D platformer, shield front faces RIGHT, rear handles face LEFT, no three-quarter/isometric/top-down view. Genuine transparent background, no floor, no shadow, no white matte or checkerboard baked in. One coherent object at identical scale in all cells. Exactly 4 columns by 2 rows of evenly spaced square cells, generous transparent margins with no clipping. Top row four successive deployment frames from folded transport state to full-height locked panel with extended stabilizers. Bottom row four successive wheel rolling/pushing frames, stabilizers raised, same fully extended armor, subtle wheel rotation only. All wheels/feet contact exactly the same baseline in each cell. No person, no vehicle, no extra objects, no text, no labels, no border, no watermark. Crisp detailed pixel-art raster with restrained 2D shading, strong readable silhouette at gameplay scale. Intended physical deployed size roughly 0.9 meters long and 1.2 meters high, handles left at waist height. Preserve mechanical identity across eight frames, smooth physically consistent unfolding.

## Tentative d’édition non aboutie

Use case: background-extraction. Input image is the edit target: a 4-column, 2-row B03 mobile armored barricade sprite sheet. Change ONLY the background: remove every dark gray and smoky pixel outside the barricade silhouettes and make all background pixels genuinely transparent alpha=0. Preserve exactly all eight mechanical barricades, wheel spokes, fine silhouette edges, pixel colors, scale, positions, 4x2 grid and folding states. Keep visible holes between frame members transparent. No new floor, no cast shadows, no opaque black/white/gray/checkerboard matte. Output the same sprite sheet as actual RGBA with a fully transparent background, no edge halos.
