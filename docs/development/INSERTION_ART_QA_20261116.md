# Recette des images d’insertion et d’extraction — 16 novembre 2026

Document source uniquement, exclu du build public. Voir [les emplacements](INSERTION_ART_SLOTS_V188.md), [les prompts et la provenance](INSERTION_ART_PROVENANCE_20261116.json) et [le reçu de rendu](INSERTION_ART_RENDER_RECEIPT_20261116.json).

## Résultat du lot complet

**19 emplacements disposent de leur source raster : 17 PNG nouveaux et 2 références réutilisées sans copie.** Les nouveaux fichiers représentent **27 813 449 octets**. Les références supplémentaires du Nostromo, du Sulaco et de l’Auriga restent sélectionnées selon le monde. La cible originale est réservée à Nacre-7 et à sa variante de profondeur.

La passe finale utilise les 19 emplacements comme images et produit **59 plans et 9 vues complémentaires, sans exception Canvas**. Les empreintes des modules et des PNG vérifiés sont consignées dans le reçu. Les fichiers de production conservent les octets exacts de la génération.

## Vérifications exécutées

| Contrôle | Résultat | Portée |
| --- | --- | --- |
| Nouveaux PNG | **17/17 décodés** | Dimensions, SHA-256 et alpha mesurés sur les vrais fichiers ; 17 empreintes distinctes |
| Références des slots | **2/2 vérifiées** | Cheyenne frontal V87 et atlas d’Orlov, à leur chemin d’origine |
| Registre et cache hors ligne | **19/19 sources inscrites** | Existence et admission dans `sw.js` vérifiées ; aucune session hors ligne revendiquée |
| Tests cinématiques | **22/22 réussis** | Registres, alias, géométrie, composition, opacité, raccords, caches, portrait et interfaces |
| Tests moteur adjacents | **52/52 réussis** | Passage entre cinématique et moteur, insertion et modes de jeu |
| Tests archives | **6/6 réussis** | Inventaire exact, intégrité, refus des fichiers inconnus et exclusion de la distribution |
| Reçus des sources | **3/3 réussis** | Succession des empreintes et préservation des ancres antérieures |
| Rendu des séquences | **59 plans ; 0 exception** | Insertion et extraction sur monde atmosphérique, sans atmosphère, Nostromo et Nacre-7 |
| Vues complémentaires | **9 vues ; 0 exception** | Quatre contacts au sol, deux embarquements du M577, deux états thermiques et un cockpit avec mouvements |
| Sources, build, distribution | **3/3 réussis** | `npm run check`, `npm run build`, `npm run check:built` |

**Total : 83 tests ciblés réussis, zéro échec et zéro test ignoré.** La première passe de huit décors est conservée dans la provenance comme historique ; ses résultats ne sont pas ajoutés à ce total.

## Rendu réellement observé

Le protocole appelle le véritable `drawInsertionFrameV188` avec les données des mondes et les images livrées. Les séquences complètes sont échantillonnées au milieu de chaque plan, avec réduction des mouvements. Les neuf vues complémentaires contrôlent les autres instants et les variantes indiquées dans le reçu.

Les PNG originaux sont décodés par Pillow en RGBA pour la préparation de contrôle, puis leurs pixels sont fournis à Canvas natif `@napi-rs/canvas`. Le décodeur Skia installé refusait certains PNG portant leurs métadonnées annexes ; aucun fichier de production n’a été réencodé pour contourner ce comportement. Le harness fournit `document.createElement('canvas')` aux traitements du moteur.

Le portrait utilise la préparation V164 réelle : aucune divergence de signature et aucun échec de préparation. Les teintes, le cache du cockpit, les motifs de nuages et les recadrages passent ensuite par le code de production. Les polices de ces captures dépendent du fallback natif et ne certifient pas la typographie du navigateur.

Les vues suivantes correspondent au lot final :

- [Séquences atmosphériques](INSERTION_ART_ATMOSPHERE_20261116.png).
- [Séquences sans atmosphère](INSERTION_ART_AIRLESS_20261116.png).
- [Séquences spatiales](INSERTION_ART_SPACE_20261116.png).
- [Cockpits, radio et soutes](INSERTION_ART_INTERIORS_20261116.png).

## Raccordements vérifiés

| Élément | Comportement observé |
| --- | --- |
| Baie | Ouverture orbitale dynamique, clamp séparé et alarmes conservées |
| Coques et disques | Proportions conservées ; planète et lune placées selon leurs vrais centre et rayon |
| Étoiles | Défilement et disparition atmosphérique ; composition `screen` sans voile noir sur le ciel |
| Nuages | Période en cache avec recouvrement de 16 %, fondus complémentaires et motif continu ; raccords droits corrigés |
| Cheyenne et M577 | Profils proportionnés, train et blindé raccordés au pad ; moteur, feux, rampe et chaleur restent actifs |
| Plasma | Centre dégagé, composition additive et intensité liée à la chaleur |
| Cockpit et CRT | Remappage du cadre par bandes et colonnes ; verrière protégée et données lisibles dans les cinq écrans |
| Radio | Crop d’Orlov `(95, 9, 80, 82)` depuis l’atlas 1024² ; portrait limité à ses propres répliques |
| Soute | Quatre occupants en mode APC, six à pied ; boîtes 184 × 276, `y=250`, `x=[160,336,512,684,860,1030]` |
| Repli | Primitives disponibles lorsque les images ne sont pas chargées ; fond de soute de secours en boîtes 52 × 80 |

Le cadrage rapproché de la soute ne change pas l’échelle du gameplay. Les modifications de présentation ne changent ni les états de vol, ni leurs durées, ni les règles de mission.

Les périodes de nuages préparées mesurent 1824 × 724. Sur les périodes teintées utilisées, l’écart moyen prémultiplié entre bords passe de 3,207 à 0,573 sur 255 pour le lointain et de 6,100 à 0,258 pour le proche. Les lignes verticales de la capture de contact ont disparu. Le moteur réalise ce raccord ; les bords des PNG originaux restent intacts. Cette mesure ne prétend pas que les textures générées étaient parfaitement périodiques.

## Commandes exécutées

```bash
node --test scripts/verify-insertion-cinematic-v188.mjs scripts/verify-dropship-handover-v188.mjs scripts/verify-bugfix-insertion-v188.mjs scripts/verify-bugfix-playthrough-modes-v188.mjs
node --test scripts/verify-project-recovery-admission-20261116.mjs scripts/verify-tantalus-priorities-v188.mjs
```

`npm run check`, `npm run build` et `npm run check:built` ont réussi. La distribution contient 2 117 fichiers contrôlés et 714 entrées de cache. Les 17 PNG générés y sont présents octet pour octet ; les archives et les documents de développement en sont exclus.

## Limites de cette recette

Chromium n’a pas pu démarrer localement lors de l’essai précédent (`socket() EPERM`). Ces captures natives ne constituent pas un parcours joueur complet, une session navigateur ou une mesure de performances. Aucun nouveau succès navigateur n’est déduit des tests Node.

Les visuels sont des adaptations du projet fondées sur les références consignées. Aucune fidélité franchise « 1:1 » n’est certifiée. Les trois packs historiques conservés dans les archives restent des sources de prototypes ; cette recette ne les transforme pas en DLC natifs intégralement jouables.
