# Provenance artistique OpenAI — vague v54

Date de production : 22 août 2026. Fournisseur : OpenAI ImageGen intégré. Les cinq masters de cette vague ont été générés pour le projet puis transformés par le pipeline déterministe local; aucun sprite officiel extrait d’un jeu n’est redistribué.

## Assets produits

| Sujet | Archive ImageGen retenue | Brut projet | Runtime normalisé | Variantes rejetées |
|---|---|---|---|---|
| Echo‑9 combat | `exec-744d65f3-d3cf-47ca-9dcd-f44f88548f38.png` | `assets/openai/sprites/player/echo9-marine-combat-sheet.png` | `assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png` | `identity drift` écarté avant activation |
| Xenomorph Runner | `exec-e72f9c81-a9f3-41b5-a3d7-5eb471c34532.png` | `assets/openai/sprites/enemies/xenomorph-runner-action-sheet.png` | `assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png` | aucune retenue |
| Ripper Queen | `exec-add68a9c-8572-4560-9c37-211eb0216047.png` | `assets/openai/sprites/enemies/ripper-queen-action-sheet.png` | `assets/openai/sprites/normalized/enemies/ripper-queen-action-sheet.png` | aucune retenue |
| Pathogen Mimic | `exec-bfc4c3c9-41a8-4ac8-b3dd-25afec01b38e.png` | `assets/openai/sprites/enemies/pathogen-mimic-action-sheet.png` | `assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png` | `exec-e7872a27-180d-4401-b6ef-06055e35426f.png`, `exec-0a69f5fe-ea00-4b75-95ab-acef9c369195.png` |
| Pale Crucible Hunter | `exec-336e71e1-6775-4dd0-8d8b-8dff38fd02f2.png` | `assets/openai/sprites/enemies/pale-crucible-hunter-action-sheet.png` | `assets/openai/sprites/normalized/enemies/pale-crucible-hunter-action-sheet.png` | `exec-352cb4ee-0a0c-44a5-8367-52f05e747b76.png`, `exec-539dcd9d-9e5f-477e-972c-ac4acce13ea4.png` |

Les prompts finaux complets, le contrat de grille et les décisions d’identité sont consignés dans [`prompts/V54_IMAGEGEN_WAVE.md`](prompts/V54_IMAGEGEN_WAVE.md).

## Traitement technique

ImageGen a renvoyé des images RGB avec damier de présentation malgré la demande de transparence. Le projet n’a pas redessiné les sujets : `scripts/process-v50-art.py` isole le fond neutre connecté, supprime les grandes îles de damier enfermées et les fragments minuscules, puis, pour les sorties chroma v54 tardives, récupère d’abord les 16 plus grands composants connectés avant normalisation sur une grille 4×4 de 1024×1024 avec garde de 16 px. Un despill vert est appliqué avant et après redimensionnement pour éviter toute contamination des bords.

`scripts/check-sprite-alpha-v54.py` vérifie :

- 31 atlas en mode RGBA, soit 496 cellules;
- dimensions 1024×1024 et gardes transparentes;
- absence de RGB caché dans les pixels alpha nuls;
- absence de grande île claire enfermée sur 80 cellules de xénomorphes sombres;
- absence de spill vert sur 32 cellules issues des masters chroma.

Le traitement a aussi été rejoué sur les plaques historiques Drone locomotion/combat, Warrior combat et Queen combat afin de retirer leurs trous blancs sans changer leur identité ni leur animation.

## Contrat d’usage

- Echo‑9 combat n’est activé que parce que son identité correspond au master locomotion et que les événements `weapon:shot`/`weapon:recoil` ont été recoupés avec les cellules visibles.
- Runner et Ripper Queen sont déclarés `exact` uniquement pour leurs sujets respectifs.
- Pathogen Mimic et Pale Crucible Hunter sont désormais déclarés `exact` uniquement pour leurs sujets respectifs et leurs 11 variantes.
- Dust Runner reste un réemploi de famille explicite.
- Les prochaines priorités ne sont plus ces deux sujets mais les 242 profils ennemis encore sans art dédié, les 278 profils véhicules sans bitmap exact et les sets mission complets des 16 PNJ.
