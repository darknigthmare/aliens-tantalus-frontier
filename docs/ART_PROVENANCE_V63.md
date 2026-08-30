# Provenance artistique V63 — ASSO-400

Date de production : 30 août 2026.

La V63 ajoute une plaque d'animation originale dédiée à la **Harpoon Gun / SpaceSub ASSO-400 Harpoon Grappling Gun**. Le bitmap a été généré avec OpenAI ImageGen puis normalisé par un pipeline déterministe. Aucun fichier officiel, sprite extrait, logo, texte ou HUD commercial n'est redistribué.

## Livrables

| Rôle | Fichier | Contrat |
| --- | --- | --- |
| Master de génération | `assets/openai/sprites/weapons/asso-400-harpoon-gun-action-sheet-v63.png` | PNG RGB 1 254 × 1 254, matte magenta de détourage, grille 4 × 4 |
| Plaque runtime | `assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png` | PNG RGBA 1 024 × 1 024, 16 cellules, orientation droite, garde transparente de 16 px |
| Pipeline | `scripts/process-v63-weapon-art.py` | extraction chromatique, despill avant/après normalisation, centrage par cellule |
| Rapport | `assets/openai/v63-art-normalization-report.json` | boîtes sources et runtime, occupation, échelle et violations de garde |

Les lignes de la plaque sont affectées à `idle`, `action`, `reload` et `service`. Le runtime sélectionne ces clips dans `src/weapon-visual-runtime-v63.js`; le catalogue, l'armurerie, le joueur et le manifeste utilisent tous le même `sheetId`.

## Références de fidélité

- [Propstore — Ellen Ripley's Harpoon Gun, Aliens (1986)](https://usm.propstoreauction.com/lot-details/index/catalog/287/lot/72999/Lot-8-ALIENS-1986-Ellen-Ripley-s-Sigourney-Weaver-Harpoon-Gun) : silhouette noire, corps de prop, câble sous le canon et proportions de la réplique de continuité.
- [Xenopedia — ASSO-400 Harpoon Grappling Gun](https://avp.fandom.com/wiki/ASSO-400_Harpoon_Grappling_Gun) : identité ASSO-400, continuité Alien/Aliens et origine visuelle reliée au Seac Sub ASSO 40.
- [IMFDB Browser — Harpoon Gun](https://browser.imfdb.org/firearms/588) : index d'apparition du harpon avec Ellen Ripley dans Alien.

Ces références verrouillent l'identité et la fonction ; elles ne sont pas utilisées comme textures. La plaque est une reconstruction Tantalus originale en vue latérale de gameplay. Pour cette raison, le registre expose honnêtement `CANON_REFERENCE_RECONSTRUCTION`, `canonExact: false` et `approximate: true`, sans la confondre avec le Sonic Harpoon déjà présent.

## Contrôles réalisés

- 16 cellules occupées et lisibles dans une grille 4 × 4 ;
- aucune violation des gardes transparentes ;
- aucune occupation des coutures de grille ;
- aucun pixel de résidu magenta selon la gate V63 ;
- orientation source `right` enregistrée dans le manifeste ;
- fichiers master et normalisé tous deux présents et hashables.
