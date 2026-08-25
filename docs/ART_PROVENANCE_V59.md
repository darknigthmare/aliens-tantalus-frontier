# Provenance artistique V59

Date de traçabilité : 25 août 2026. Release : 59.0.0. Fournisseur : OpenAI ImageGen intégré.

## Méthode

Les masters normalisés existants ont servi de verrou d’identité. Chaque prompt impose le même profil droit, la même silhouette, les mêmes hardpoints, le même pivot et la même échelle; il interdit personnage, pilote, VFX, texte, logo, UI, grille et décor. Les sorties ImageGen RGB avec damier peint sont conservées comme sources brutes, jamais utilisées directement par le jeu. Le pipeline du projet extrait un alpha réel, replace chaque sujet dans une cellule 256×256, impose une garde de 16 px et efface tout RGB caché.

La lecture directe des chemins de référence par le helper ImageGen a été bloquée par l’ACL Windows. Les masters exacts ont donc été inspectés puis injectés comme images de contexte immédiat; aucune référence de substitution n’a été utilisée.

## Livrables

| Sujet | Master d’identité | Source ImageGen | Production normalisée | Génération |
| --- | --- | --- | --- | --- |
| M577 APC | `m577-apc-action-sheet.png` | `assets/openai/sprites/vehicles/m577-apc-access-damage-sheet.png` | `assets/openai/sprites/normalized/vehicles/m577-apc-access-damage-sheet.png` | `exec` lié à la session `01a03a3b-414a-7a22-b18f-80ca75815232` |
| M577 Command | `m577-command-apc-action-sheet.png` | `assets/openai/sprites/vehicles/m577-command-apc-access-damage-sheet.png` | `assets/openai/sprites/normalized/vehicles/m577-command-apc-access-damage-sheet.png` | `exec-67f0e7a2-51ec-4559-9675-4afd17c5f226` |
| P‑5000 | `p-5000-powered-work-loader-action-sheet.png` | `assets/openai/sprites/vehicles/p-5000-powered-work-loader-access-damage-sheet.png` | `assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-access-damage-sheet.png` | `exec-ec43f671-8859-4dc5-97cb-496d2eae1ad5` |
| UD‑4L | `ud-4l-cheyenne-dropship-action-sheet.png` | `assets/openai/sprites/vehicles/ud-4l-cheyenne-dropship-access-damage-sheet.png` | `assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-access-damage-sheet.png` | `exec-d32a71fd-9066-49eb-9a90-ccf085baa496` |

## QA artistique et technique

- quatre fichiers normalisés 1024×1024 RGBA ;
- 64/64 cellules occupées et distinctes ;
- alpha réel 0–255 ;
- zéro violation de garde 16 px ;
- zéro RGB caché sous alpha nul ;
- profils orientés à droite ;
- aucune personne, VFX, UI ou marque peinte ;
- comparaison visuelle master/action contre accès/dégâts dans `.qa/browser-v59/vehicle-access-reference-comparison.jpg`.

Le contrôle automatique global `scripts/check-sprite-alpha-v59.py` couvre aussi les 178 atlas antérieurs afin qu’une nouvelle vague ne masque pas une régression historique.

## Droit et fidélité

Ces bitmaps sont des productions du projet guidées par les masters déjà présents. Aucun fichier officiel extrait d’un jeu n’est redistribué. Les droits d’exploitation annoncés par le détenteur du dépôt restent une condition séparée de cette traçabilité technique.
