# Aliens (1986) — machines industrielles et socle V121

Ce supplément ajoute **quatre PNG natifs transparents pour cinq corps** dans trois salles : un générateur à Hadley, une unité de pompage au relais, un échangeur partagé par deux emplacements dans les conduites et un socle vide pour le panneau de vanne existant. Le catalogue passe de **151 à 155 images distinctes**.

[Galerie](index.html) · [Bible des huit catégories](bible.md) · [Inventaire complet JSON](bible.json) · [Manifeste](manifest.json) · [Prompts et essais](generation-ledger.json) · [Références](references.md) · [Vérifications](verification.json)

## Emplacements et proportions

| Image | Salle / corps | Enveloppe maximale | Silhouette avec échelle uniforme |
| --- | --- | --- | --- |
| hadley-service-generator | v106-hadley / generator | 100 × 137.32 | 97.5935 × 137.32 |
| service-pump-unit | v107-service / pump-foundation | 151 × 178.28 | 149.9937 × 178.28 |
| conduit-heat-exchanger | v112-conduit / exchanger-west | 181 × 199.24 | 181.0 × 197.5297 |
| conduit-heat-exchanger | v112-conduit / exchanger-east | 194 × 204.52 | 187.4054 × 204.52 |
| conduit-valve-plinth | v112-conduit / valve-plinth | 125 × 128.9 | 125.0 × 124.4508 |

Le panneau `valve-indicator` reste séparé de son socle, à ses coordonnées et à son élévation existantes. La couche V121 le dessine après son support lorsque le PNG et le contrat du corps sont disponibles. Les deux échangeurs utilisent les mêmes octets, ajustés uniformément à leurs volumes respectifs.

## Conservation et intégration

La couche [modules/aliens-1986/v121/raster-furniture-v121.mjs](../../../modules/aliens-1986/v121/raster-furniture-v121.mjs) s’installe après V120 et partage le cache V116. Elle admet les cinq corps précis de leurs scènes ; les autres objets gardent leurs sélections précédentes. Les PNG sont ancrés au pivot alpha128 mesuré au sol ; leur échelle est uniforme dans l’enveloppe `h + d × 0,86`. Les fichiers PNG ne subissent aucun découpage, étirement, normalisation d’alpha ni modification de pixels externe ; le renderer utilise leurs limites mesurées pour le dessin.

La simulation V114, les collisions, portes, acteurs, transferts, armes et sauvegardes restent ceux de la base. La bible conserve les huit catégories, 155 images, 25 salles et leurs 202 solides / 135 props / 26 acteurs de scène. Les éditions antérieures restent intactes. Les quatre poses refusées et la sentinelle frontale ne sont pas relancées.

## Essais, qualité et fidélité

Quatre générations et une retouche ont produit les quatre fichiers retenus. La première pompe avait une silhouette trop large, un dessus trop peu profond et une frange sous le socle. Elle est tracée comme non retenue et reste hors du pack actif. Le journal préserve chaque prompt réellement envoyé, les empreintes et les liens entre essais.

Les silhouettes sont complètes. Les dessus présentent une légère convergence et leur profondeur visuelle reste adaptée ; de fines franges natives peuvent apparaître à très fort agrandissement. Les valeurs d’alpha et les dimensions effectivement mesurées restent publiées. Le socle présente un dessus nu permettant de tester les contacts réels du panneau.

**La fidélité exacte 1:1 au film reste non validée.** Un élément de décor du processeur a été inspecté pour les panneaux gris, les emboutis et les aérations ; cette source ne prouve pas l’identité des quatre machines du jeu. Les réemplois potentiels des tables du mess et le raccord du banc de smartgun déjà imagé restent à examiner dans une prochaine passe.

## Vérification

**16/16 contrôles natifs Canvas/Skia ont réussi**, avec 69 décodages. Les **62 contrôles unitaires V121 sont inclus dans les 224 contrôles de présentation** du runner ; ces nombres ne s’additionnent pas. Le preflight vérifie 155 PNG et les cinq manifestes historiques. Le script de QA navigateur est exécuté sous Node avec le renderer réel et des doublures déclarées du DOM et de `fetch`. Les buffers temporaires de décodage omettent seulement les chunks de provenance `caBX` ; les pixels et les fichiers PNG sources restent inchangés.

Les cinq placements tiennent dans leurs canevas. Les trois points du contour inférieur du panneau se trouvent dans le polygone du dessus et sur des pixels d’alpha 253. L’alpha d’occlusion et l’ordre support/panneau sont vérifiés. Le fallback de Hadley vers V120 présente zéro canal différent sur 3 686 400 canaux comparés. Les trois captures natives ont été relues visuellement : générateur, pompe et échangeurs sont entiers, et le panneau est bien posé sur le socle. La salle des conduits conserve son obscurité native hors du faisceau ; les fines franges restent discrètes à l’échelle de salle.

Le bas du tablier avant du socle est à 63,71 unités au-dessus du sol pour un corps de hauteur 73, soit un écart de **−9,29 unités**. Ce repère de façade est distinct de la surface du dessus où les appuis sont validés ; l’écart reste publié pour la revue artistique.

Le runner complet `npm run test:dlc:aliens1986` termine avec le code 0 : **665/665 contrôles historiques et 35/35 contrôles du runner**. Les 224 assertions de présentation sont exercées au sein de ce runner, dont les 62 assertions V121 ; elles ne sont pas des tests supplémentaires à additionner. `npm run check:dlc:aliens1986` termine aussi avec le code 0 : 1 159 fichiers historiques / 135 643 835 octets, 155 PNG et révisions de présentation 121.

Deux dérivations produisent le même HTML, SHA256 `e213d7c3251966e7062082ec37676cf8b0dc72eb3468cd820ce16a78dd78b397`. Le [rapport V121](verification.json) est un **reçu local prépublication figé**. **Chromium n’a pas été exécuté localement et la CI est encore en attente au moment de ce reçu.** Les résultats de CI ultérieurs sont consignés dans la PR avec le SHA exact, sans réécrire le reçu pour prétendre à une exécution antérieure. Les résultats historiques V120 restent rattachés à leur version ; aucun parcours complet ni fidélité film 1:1 n’est déduit de ces contrôles.
