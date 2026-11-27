# Alien: Covenant — lot de sprites V0.11

49 PNG sont livrés : 48 images nouvellement générées et 1 image du projet conservée avec ses octets d’origine. Ce lot poursuit uniquement le DLC Covenant.

**La totalité des sprites manquants n’est pas achevée, et aucune image n’est certifiée identique à 1:1.** Les photographies de plateau, accessoires, costumes et dessins de fabrication guident les silhouettes et matières. Les angles cachés, certains détails et les poses de jeu restent reconstruits.

## Ouvrir le catalogue

Décompresser l’archive puis ouvrir `index.html` dans un navigateur. Aucun serveur ni téléchargement supplémentaire n’est nécessaire pour parcourir les images. Les filtres permettent de rechercher un personnage, une catégorie ou une admission dans le rendu. Le fond sombre, clair ou en damier sert à examiner le détourage. Cliquer sur une image ouvre ses références et ses limites.

Les originaux sont dans `sprites/`. `APERCU.jpg` est une planche de contrôle dérivée ; elle ne remplace pas les PNG. `manifest.json` conserve les prompts et la provenance. `coverage.json` détaille chaque profil, arme, état de créature et famille d’objets. `SHA256SUMS.txt` et `QA.json` documentent l’intégrité des fichiers et les validations.

## Contenu livré

| Ensemble | PNG disponibles | Portée |
|---|---:|---|
| Humains | 25 | 23/23 profils attendus et variantes supplémentaires ; poses neutres, mains libres |
| Créatures | 4 | Néomorphe et facehugger : pose neutre et attaque ; 4/6 poses statiques attendues |
| Accessoires, EVA, mobilier, véhicules et spécimens | 20 | États et objets explicitement référencés dans le manifeste |
| Armes | 0/7 | Aucun PNG livré pour les familles d’armes |

29 PNG sont admis dans le rendu pour leurs conditions déclarées. 20 restent au catalogue : une pose sans consommateur, un costume d’une autre scène, un modèle approchant ou un objet sans emplacement validé ne remplace pas arbitrairement un élément du DLC.

Le catalogue de familles relève 50 objets candidats à documenter. 13 familles ont au moins une variante PNG, dont 11 avec un remplacement limité à son contexte. Ce chiffre n’est pas une couverture complète des 630 occurrences, réparties entre 126 familles de décors, effets, mécanismes et objets.

## Raccord au DLC

Les sources et modifications sont sur la [branche Covenant](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/codex/covenant-sprites-v011). Le module V0.10 d’origine a été restauré depuis son archive ; les 22 fichiers source d’origine totalisent 992 906 octets. Les adaptateurs V0.11 ajoutent les images et le menu d’accès.

Les humains n’emploient ces PNG que pour une pose neutre compatible. Les PNJ dont le profil porte toujours une arme conservent leur rendu d’origine ; aucune pose avec une arme n’est simulée à partir d’une silhouette aux mains vides. Les créatures utilisent leur PNG d’attaque pendant le bond `lunge`, avec anticipation et autres états conservés dans le rendu existant.

Le piano et le service à thé sont limités au prologue blanc. Le support de table de `teaset` reste celui du décor. Le Cargo Lifter ne remplace que l’objet de `plaza` ; la grue dynamique de `lifter` est conservée. Le caisson ouvert est limité à `cryo` et n’est pas appliqué aux capsules fermées des colons. Les affichages et mécanismes actifs restent fonctionnels.

Le format de sauvegarde 1, la révision 10, les règles, munitions, collisions et objectifs du module restent inchangés. Le paquet d’images contient le catalogue ; pour lancer le DLC intégré, utiliser le projet de la branche et son processus de compilation décrit dans `docs/covenant/README.md`.

## Éléments encore manquants

**Dix entrées statiques sont bloquées ou concernent un sujet lié déjà refusé par l’outil :** les sept familles `weapon-f90`, `weapon-beretta`, `weapon-ar15`, `weapon-shotgun`, `weapon-inox`, `weapon-sl40`, `weapon-eaa` ; `xenomorph` et `xenomorph-attack` ; `prop-classicalstatue`. Les sujets refusés n’ont pas été relancés par une autre voie.

Les cycles complets de marche, course, arme en main, rechargement, impact et mort ne sont pas livrés. Les deux poses de créature ne constituent pas un cycle d’animation.

Les familles candidates sans PNG dédié sont listées ci-dessous. Certaines sont des affichages ou mécanismes actifs conservés volontairement ; les autres nécessitent une référence visuelle et une correspondance de scène précises.

| Famille | Occurrences | Statut | Motif |
|---|---:|---|---|
| `bandages` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `bedroll` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `cabindrawing` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `classicalstatue` | 1 | blocked-generation | La génération de la statue a été refusée par l’outil ; aucun PNG livré. |
| `cloakstand` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `console` | 33 | procedural-preserved | Le rendu existant conserve les états, mécanismes, affichages ou effets. Aucun PNG statique de remplacement validé. |
| `corpse` | 9 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `coveredremains` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `crane` | 1 | procedural-preserved | Le rendu existant conserve les états, mécanismes, affichages ou effets. Aucun PNG statique de remplacement validé. |
| `damagedpod` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `eaarack` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `embryotray` | 1 | missing-reference-or-specific-state | La capsule d’embryon existe au catalogue, mais ne couvre ni le plateau complet ni ses autres éléments. |
| `fieldradio` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `fuelcase` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `gunrack` | 2 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `harnessrack` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `identification` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `medical` | 6 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `medtray` | 2 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `memorial` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `microscope` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `navigationdisplay` | 1 | procedural-preserved | Le rendu existant conserve les états, mécanismes, affichages ou effets. Aucun PNG statique de remplacement validé. |
| `necklace` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `notebook` | 2 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `optics` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `recorder` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `recordingscreen` | 2 | procedural-preserved | Le rendu existant conserve les états, mécanismes, affichages ou effets. Aucun PNG statique de remplacement validé. |
| `repairtool` | 2 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `shroud` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `specimen` | 7 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `specimencage` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `surgicaltray` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `tether` | 2 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `urnplatform` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `urnrack` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `utilityknife` | 2 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |
| `wastecase` | 1 | missing-reference-or-specific-state | Aucune référence visuelle suffisamment précise et correspondance de scène validée pour produire ce remplacement en 1:1. |

## Limites de fidélité à conserver

- Les variantes du pont et de la soute ont été distinguées des tenues de terrain ou de la séquence médicale d’Oram et Karine.
- La combinaison souple de Daniels et la tenue rigide Big Yellow de Tennessee sont deux constructions distinctes.
- La main manquante de Walter est sa main anatomique gauche. Sa pose PNG n’est pas retournée horizontalement : l’orientation opposée conserve le rendu d’origine. Pour les autres poses, la réflexion du rendu existant ne vaut pas une nouvelle vue documentée des vêtements ou inscriptions.
- Le camion de terraformation est une adaptation de dessin de production déjà présente en V122, réutilisée sans modification et gardée au catalogue.
- Le caisson fermé est une reconstruction guidée par les dessins de fabrication ; son détail final filmé n’est pas certifié.
- Le trône Bugatti est un modèle de galerie approchant, pas une reconstitution démontrée de la réplique du film.
- Le plateau E1027 possède un alpha translucide, mais son reflet reste plus laiteux que celui des photographies de référence.
- Les dessins d’ammonite et d’arthropode, la capsule d’embryon et les accessoires EVA lourds ont des identités précises : ils ne remplacent pas tous les papiers, spécimens ou équipements génériques.

## PNG réservés au catalogue

`walter-field`, `tennessee`, `prop-evasuit-heavy`, `prop-evahelmet-heavy`, `bio-facehugger-embryo`, `prop-drawing-ammonite`, `prop-drawing-arthropod`, `prop-terraformer`, `lope`, `branson-record`, `hallett`, `cole`, `prop-cryopod-closed-crew`, `prop-table-e1027`, `prop-chair-bugatti`, `rosenthal`, `ankor`, `ledward`, `oram-field`, `karine-medical`.

## Vérifications

Chaque PNG est comparé à son SHA de blob Git, mesuré et inspecté. L’extérieur comporte de l’alpha nul, la silhouette au seuil 32 est intérieure au cadre, et aucun pixel de bord ne dépasse l’alpha 16. Les originaux ne sont ni redimensionnés, ni recadrés, ni recompressés. Un canal d’alpha maximal à 254 peut venir de la génération ; il reste mesuré tel quel.

Les tests ciblés du renderer utilisent des doubles déclarés pour Image et Canvas. Neuf tests d’intégration contrôlent la conservation des sources, le contrôleur de titre, les admissions, le build autonome, le manifeste de provenance exact et l’import dans une arborescence partielle. Les 15 pilotes historiques emploient le moteur et ses commandes de simulation. Ils ne constituent pas une inspection visuelle. Le QA Chromium distingue le vrai parcours au clavier, la sauvegarde/reprise, le décodage des PNG et le prologue des poses de créatures préparées séparément. Les reçus de `QA.json` indiquent la portée effectivement testée.

Le registre de couverture et les limites priment sur toute formule générale de complétude ou de fidélité.
