# Aliens (1986) — sept variantes d’accessoires V117

Ce supplément ajoute **7 PNG** au registre existant, soit **130 images** au total. Les 123 entrées V116 restent inchangées. Le rendu demeure V116, la révision des images devient V117 et le schéma de sauvegarde reste 114.

[Galerie des sept images](index.html) · [Manifeste et empreintes](manifest.json) · [Prompts et contrôles des images](generation-ledger.json) · [Références visuelles](references.md)

## Images ajoutées

| Identifiant | État | Dimensions |
| --- | --- | --- |
| `door-leaf-damaged` | Battant endommagé | 1024 × 1536 |
| `door-leaf-reinforced` | Battant renforcé | 1024 × 1536 |
| `door-leaf-breached` | Battant éventré | 1024 × 1536 |
| `meal-tray-food` | Sulaco — plateau garni | 1671 × 941 |
| `supply-case-medical-empty` | Caisse médicale vide | 1536 × 1024 |
| `supply-case-ammo-closed` | Caisse de munitions fermée | 1536 × 1024 |
| `supply-case-ammo-empty` | Caisse de munitions vide | 1536 × 1024 |

Les sept sorties totalisent **15 682 758 octets**. Chaque PNG est en RGBA, copié sans retouche depuis la génération, avec une boîte alpha ≥ 128 et un pivot mesurés. Les trois références V115 sont conservées : `door-leaf`, `supply-case` et `meal-tray`.

## Comportement obtenu

Les clés existaient déjà dans `raster-renderer-v116.mjs` : ce supplément fournit les images qui leur manquaient.

- Les sas structurels emploient l’image éventrée après une brèche, renforcée si leur renfort est positif, ou endommagée lorsque leurs points de structure sont inférieurs à 100. Les portes ordinaires conservent leur battant de base.
- Un sas ouvert garde son passage. S’il est éventré, le moteur découpe son image sur les deux montants latéraux ; s’il est intact, aucun battant n’est dessiné dans l’ouverture. Les nouvelles images ne changent ni les collisions ni la largeur du passage.
- Les plateaux dans les salles du Sulaco utilisent le plateau garni ; les autres conservent le plateau vide.
- Le stock médical collecté montre la caisse médicale vide. Les réserves de munitions et de sentinelles utilisent la caisse neutre fermée avant collecte puis vide après collecte.

Le chargeur, le renderer, le corpus V114 de 1 159 fichiers, les deux HTML source, les 123 PNG précédents et le manifeste V116 conservent leurs octets. Le dérivateur réunit les deux manifestes au build et en développement. Les contrôles de succession conservent les anciennes empreintes et admettent explicitement la nouvelle version du dérivateur ainsi que le manifeste V117. Les cinq fichiers de documentation V117 restent exclus du build public.

## Validation

Les sept images ont été inspectées en taille source. Les portes conservent leur ventilation centrale ; la brèche contient une véritable zone alpha transparente. Les trois caisses tiennent dans la limite de 76 × 44 sans couvercle haut réduisant excessivement leur corps. Le plateau garde ses cinq compartiments et tous les aliments restent contenus dans ses bords.

Les résultats d’intégration, du rendu navigateur et de la CI sont consignés dans la pull request du supplément. Le banc de rendu des variantes utilise des états déclarés et le véritable renderer Canvas ; cette fixture ne constitue pas un parcours de gameplay. Le workflow **Aliens 1986 DLC** exécute séparément les parcours du jeu et les actions du menu, puis conserve leurs preuves.

Avant publication, `npm run test:dlc:aliens1986` réussit les 665 contrôles V114 puis les 23 contrôles d’intégration, de succession et de présentation, dont 31 vérifications unitaires internes de présentation. `npm run check:dlc:aliens1986` confirme les 1 159 sources préservées et les 130 PNG. Le contrôle visuel reproductible est exécuté dans la CI ; l’environnement local ne dispose pas de Chromium utilisable.

Commandes de vérification du dépôt :

```sh
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
npm run check
npm run build
npm run check:built
```

Le contrôle des sept variantes nécessite Python Playwright et Chromium :

```sh
python3 -B scripts/qa-aliens1986-props-v117.py --source-root . --output .qa/aliens1986-props-v117
```

Il produit une capture et un rapport JSON avec les empreintes des sources, les appels `drawImage`, les états de fixture, la transparence des ouvertures et les mesures de socle. La CI conserve ces fichiers dans l’artefact `aliens1986-browser-evidence` ; ses résultats restent distincts d’une validation de fidélité au film.

## Récupération locale et limites restantes

Les sept fichiers sont **de nouvelles générations**, et non la récupération des sept anciens originaux utiles. Les **20 anciens PNG** et les **53 documents** recensés avant l’interruption précédente n’ont pas été retrouvés dans l’environnement de cette reprise. Ils ne sont pas déclarés publiés. L’inventaire antérieur distingue sept variantes utiles, une planche d’orientations de sentinelle et douze révisions remplacées. Les dix-neuf anciennes sources de poses déjà absentes restent également non récupérées.

Les quatre générations précédemment refusées — Hicks blessé, Warrior en marche, Facehugger en attaque et Facehugger en défaite — n’ont pas été retentées et restent absentes. Les poses de marche et d’interaction déjà présentes sont des images individuelles ; elles ne forment pas des cycles animés complets. Les limites de gameplay décrites dans le [module](../../../modules/aliens-1986/README.md) restent applicables.

La fidélité exacte au film n’est pas certifiée. Les portes dans leurs états de dégâts, les caisses génériques, la position de la plaque médicale et la disposition du repas sont des adaptations documentées. Le journal et le manifeste gardent `filmFidelityValidated: false`.
