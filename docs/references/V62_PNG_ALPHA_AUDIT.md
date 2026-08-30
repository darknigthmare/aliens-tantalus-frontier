# V62 — audit PNG alpha, fond blanc, halo et grilles

## Verdict

L’audit reproductible couvre **401 PNG destinés au rendu** parmi 649 PNG découverts : 191 plaques normalisées du manifeste, les calques du hub et des niveaux, les props, les effets, les UI et les scènes V62. Il distingue explicitement les assets à transparence obligatoire des panoramas opaques.

- **Aucun PNG composite sans alpha effectif**.
- **Aucun fond quasi blanc opaque connecté au bord** avec le seuil de production (`RGB >= 245`, au moins 256 px et 0,2 % de l’image).
- **Aucune dimension de grille incorrecte** sur les 191 plaques normalisées.
- **Aucune erreur de production confirmée** après normalisation runtime : les trois anciens calques `tantalus-mission` gardent leurs sources intactes et partagent désormais un contrat `centered-cover` 2:1 testé.
- **13 candidats de halo à revoir visuellement**, pas 13 bugs affirmés. Le signal exige une frange claire semi-transparente au contact d’un sujet opaque sombre, au moins 40 px et 25 % du contour alpha analysé.

Le rapport intégral machine lisible est dans `docs/references/V62_PNG_ALPHA_AUDIT.json`.

## Périmètre et règles

| Classe | Attente | Quantité | Raison |
| --- | --- | ---: | --- |
| Plaques `sprites/normalized` | Transparence obligatoire + grille manifeste | 191 | Les cellules sont compositées dans le jeu et le catalogue. |
| Calques hub / metroidvania hors `far` | Transparence obligatoire | 106 | Superposition far, mid, foreground et overhead. |
| Props hub / niveau | Transparence obligatoire | 39 | Placement indépendant sans rectangle de fond. |
| Drops, hazards, terminaux | Transparence obligatoire | inclus ci-dessus | Effets et objets composités. |
| UI customization | Transparence obligatoire | 1 | Mannequin superposé à l’interface. |
| Salles, parallax, `far`, portraits, titre, insertions, conduits | Opaque attendu | 64 | Scènes plein cadre ; l’alpha n’apporte rien. |
| Masters bruts | Exclus par règle | 229 | Le runtime utilise les dérivés `normalized` ou `*-clean`. |
| PNG non classés | Aucun verdict | 19 | Pas d’affirmation sans contrat de rendu explicite. |

Cette séparation évite de signaler à tort comme bug un panorama RGB volontairement opaque ou un master conservé pour la provenance.

## Normalisation de cohorte vérifiée

Les fichiers suivants appartiennent au même jeu de parallaxe historique et ne partagent pas les mêmes dimensions sources :

| Fichier | Dimensions |
| --- | ---: |
| `assets/openai/metroidvania/tantalus-mission-far.png` | 1717 × 916 |
| `assets/openai/metroidvania/tantalus-mission-mid.png` | 1774 × 887 |
| `assets/openai/metroidvania/tantalus-mission-foreground.png` | 1774 × 887 |

Le runtime V62 ne les étire pas et ne réécrit pas leurs pixels. Il applique uniquement à ces trois chemins un contrat `tantalus-mission-runtime-cover-v62` de ratio cible 2:1 :

- FAR : crop centré `x=0, y=28,75, largeur=1717, hauteur=858,5` ;
- MID et FOREGROUND : source complète `1774 × 887` ;
- destination commune à 720p et overscan 1,08 : `1555,2 × 777,6`.

Le rendu utilise `drawImage` à neuf arguments : la cohérence de toile est obtenue par recadrage proportionnel, sans déformation ni altération des fichiers et hashes de provenance. L’audit n’accepte cette différence que si les trois chemins exacts sont présents et attachés au contrat ; toute autre cohorte de parallaxe incohérente reste une erreur. Le rapport machine compte donc **3 assets normalisés au runtime, 0 erreur confirmée et 13 revues visuelles**.

## Candidats de halo — revue, pas verdict automatique

Le détecteur ne classe jamais ce signal en erreur, car une lampe, un équipement blanc ou une bordure métallique peut être légitime. Les 13 assets à examiner sur fond sombre et clair sont :

- `assets/openai/hub/layers/industrial-vehicle-bay-mid.png`
- `assets/openai/hub/props/bridge-terminal.png`
- `assets/openai/hub/props/workbench.png`
- `assets/openai/metroidvania/props/vent-entrance.png`
- `assets/openai/sprites/normalized/tools/atarax-control-rig-use-sheet.png`
- `assets/openai/sprites/normalized/tools/cryo-mine-use-sheet.png`
- `assets/openai/sprites/normalized/tools/maintenance-jack-use-sheet.png`
- `assets/openai/sprites/normalized/tools/medkit-use-sheet.png`
- `assets/openai/sprites/normalized/tools/pathogen-scanner-use-sheet.png`
- `assets/openai/sprites/normalized/tools/pressure-suit-use-sheet.png`
- `assets/openai/sprites/normalized/tools/seismic-surveyor-use-sheet.png`
- `assets/openai/sprites/normalized/tools/welding-kit-use-sheet.png`
- `assets/openai/sprites/normalized/weapons/ripper-acid-projector-action-sheet.png`

Les nombres exacts de pixels, de pixels de contour et les ratios sont conservés dans le JSON pour permettre un tri automatique ou une comparaison après correction.

## Vérification des nouvelles scènes

Les trois insertions V62 et le conduit V62 sont des scènes opaques RGB de **1672 × 941**, avec un ratio 16:9 valide et une résolution supérieure au contrat minimum 1280 × 720 :

- `assets/openai/mission/insertion/tantalus-dropship-approach-v62.png`
- `assets/openai/mission/insertion/tantalus-apc-approach-v62.png`
- `assets/openai/mission/insertion/tantalus-foot-approach-v62.png`
- `assets/openai/hub/vents/tantalus-duct-interior-v62.png`

Le fond de titre V61 employé par V62 possède le même contrat. L’absence d’alpha de ces cinq panoramas est attendue et ne figure dans aucune anomalie.

## Reproduction

```powershell
py scripts/audit-png-alpha-v62.py
node --test tests/png-alpha-audit-v62.test.mjs
```

La gate des erreurs confirmées est :

```powershell
py scripts/audit-png-alpha-v62.py --fail-on error
```

Cette commande passe avec le dépôt V62 courant. `--fail-on review` reste volontairement rouge tant que les 13 candidats de halo n’ont pas été comparés visuellement.

Le test fabrique des PNG synthétiques temporaires et vérifie sept contrats : sprite transparent valide, sprite RGB fautif, fond blanc connecté au bord, grille incohérente, scène opaque autorisée, cohorte incohérente sans contrat et cohorte `centered-cover` autorisée. Aucun asset du projet n’est modifié par l’audit.
