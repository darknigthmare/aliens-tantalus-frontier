# Asphodèle — art des cinématiques CIN-70 à CIN-72

Date : **17 novembre 2026**, Europe/Paris. Base locale : `cd44257822a649a7532eec5a70d60f6663640a77`.

## Résultat et périmètre

Ce lot ajoute **six PNG**, soit **11 370 799 octets**, aux trois cinématiques d'Asphodèle déjà jouables. Les onze plans, leurs dialogues français et anglais et leurs durées restent ceux du projet : quatre plans et 40 secondes pour CIN-70, quatre plans et 40 secondes pour CIN-71, trois plans et 30 secondes pour CIN-72. Dix plans utilisent de l'art ; la perte finale du signal reste dessinée nativement.

Les six sorties sont retenues sans itération rejetée. Les fichiers du jeu sont identiques aux originaux du générateur, octet pour octet. Aucun détourage, redimensionnement ni retouche des PNG n'est effectué après génération ; les fenêtres source et l'échelle uniforme sont appliquées uniquement au rendu.

| Image nouvelle | Dimensions | Format | Fonction |
| --- | --- | --- | --- |
| `asph-cin-ring` | 1254 × 1254 | RGBA | Anneau axial à quatre rayons, centre transparent, rotation native |
| `asph-cin-hub` | 1254 × 1254 | RGBA | Moyeu fixe et logement du témoin de quarantaine |
| `asph-cin-rook-quarters` | 1939 × 811 | RGB | Poste de travail vide de Rook, CRT avec signal natif |
| `asph-cin-helmet-corridor` | 1939 × 811 | RGB | Couloir inférieur vide avant l'apparition de la menace |
| `asph-cin-ceiling-drone` | 1942 × 809 | RGBA | Créature accrochée sous la poutre, apparition après 55 % du plan |
| `asph-cin-bent-door` | 1071 × 1468 | RGBA | Variante déformée de la porte déjà établie dans le hub |

Ces six images constituent un catalogue cinématique distinct. Le catalogue de **42 emplacements jouables** du hub et de ses missions reste couvert par les lots précédents. Douze images existantes sont réutilisées à leur chemin d'origine, ainsi que les trois portraits d'équipage de Rook, Orlov et Kwan. Aucun portrait de Kessler n'est inventé.

## Composition et corrections

L'anneau et le moyeu sont deux images indépendantes. Les fenêtres carrées partagent le pivot source `(627, 627)` et conservent leurs proportions. L'anneau et ses deux vaisseaux amarrés tournent ; le moyeu garde son orientation. Le voyant rouge est dessiné dans le logement mesuré du moyeu. Le plan orbital conserve la planète et le fond d'étoiles existants.

Le CRT de Rook reçoit son onde dans l'ouverture mesurée `[1168, 238, 207, 144]`. Le bezel réutilisé encadre l'onde d'Echo-8 et les archives, dont les textes restent des données natives FR/EN. Le mauvais en-tête QZ18 du terminal partagé est corrigé en **ARCHIVES QZ17 / QZ17 ARCHIVES** uniquement pour CIN-71. La soute d'Orlov utilise l'image existante de compartiment de transport, sans la pluie du décor atmosphérique partagé.

Le contrôle et le pont inférieur reprennent les parois et accessoires du hub. CASSIUS conserve six écrans et une onde, sans visage ni corps humain. Les consoles, le marine et la porte gardent des échelles uniformes. La porte est dessinée dans son volume de 1,9 × 2,6 m ; le rectangle noir initialement ajouté derrière l'image a été retiré après inspection. Ses coins transparents laissent voir le mur et la brèche conserve le noir déjà présent dans le PNG.

La créature du plafond a deux bras, deux jambes et une queue attachée. Ses quatre contacts sont mesurés dans le sprite puis placés près de la face inférieure de la poutre. Elle reste absente jusqu'au seuil existant de 55 % du premier plan de CIN-72. Le témoin **REC**, auparavant masqué par la bande noire, est dessiné après restauration de la caméra et des bandes, à `(40, 124)` dans le repère écran. Le mouvement réduit fige les mouvements et bruits ciblés ; il ne change pas l'ordre des plans.

Les décisions, récompenses et sauvegardes ne sont pas modifiées. La divergence historique entre les secondes de coupure des différentes sources narratives d'Echo-8 n'est pas réécrite dans ce lot.

## Chargement et continuité

| Cinématique | Ressources demandées et utilisées | Détail |
| --- | ---: | --- |
| CIN-70 | 11 / 11 | Neuf éléments de décor et les portraits de Rook et Orlov |
| CIN-71 | 6 / 6 | Cinq éléments de décor et le portrait de Kwan |
| CIN-72 | 5 / 5 | Couloir, menace, paroi, barricade et porte |

Les trois séquences utilisent **21 fichiers distincts**, le bezel étant partagé. La revue indépendante inspecte 132 frames FR/EN, avec mouvement normal et réduit : aucun fichier manquant, aucune demande inutile, aucun dessin hors de la liste du CIN et aucun préchargement d'objet de mission ou de planche de l'Acte V.

Le premier rendu accepte l'absence des images et leurs replis. Les images qui arrivent tardivement apparaissent au RAF suivant. Les promesses de lecture, fin naturelle, relecture, avance par Espace, interruption par Échap et remplacement d'une séquence sont contrôlés avec DOM, Image et RAF explicitement simulés. Aucun ancien RAF ne dessine après l'arrêt et aucun écouteur clavier ne subsiste.

La politique préexistante après erreur définitive de chargement reste documentée : un objet Image échoué n'est pas redemandé lors d'une relecture ; le repli persiste jusqu'au rechargement de la page. Ce cas est distinct d'une image simplement lente, dont le redessin fonctionne.

Les six nouveaux chemins sont admis explicitement au cache runtime. Le total Asphodèle est désormais de **54 chemins** : six cartes de scène, 42 emplacements jouables et six images de cinématiques. Le shell de **723 entrées** reste identique ; aucune de ces six images n'est ajoutée au précache. Les quatre documents de ce lot sont admis comme sources de développement et exclus de la distribution publique.

## Vérification exécutée

| Contrôle | Résultat |
| --- | --- |
| Cinématiques et cohérence | **20/20** tests réussis, zéro échec ou ignoré |
| Audit et sauvegardes | **132/132** tests réussis, zéro échec ou ignoré |
| Succession V163 et V188 | **40/40** tests réussis, zéro échec ou ignoré |
| Vérification de la source complète | **3 476 fichiers, 1 564 assets, zéro document privé** |
| Plans illustrés dans le renderer de production | **22 vues** : onze plans en français et anglais |
| Replis dans le même renderer | **22 vues** sans images |
| Contribution des nouveaux PNG | **6/6**, mesurée en pixels |
| Noms, sous-titres et légendes | **36 lignes**, **42 932 pixels opaques** contrôlés, aucun masquage à la tolérance de deux unités par canal |
| REC | Quatre vues normales/replis, aucun pixel masqué |
| Preuves dans les CRT | Huit vues, **28 textes** contenus dans l'ouverture |
| Comparaisons raster hors du lot | Huit comparaisons, **zéro pixel changé** |
| Autres cinématiques, revue indépendante | **25 cinématiques, 70 plans, 280 frames** : scénarios, chargements et opérations Canvas identiques à la base |

Les contrôles produisent **60 captures individuelles et une planche**, soit 61 PNG de QA. La planche est conservée dans le dépôt ; les noms, dimensions, tailles et empreintes des captures individuelles inspectées sont conservés dans le reçu. Les six contributions visibles mesurées sont de 72 010 pixels pour l'anneau, 8 247 pour le moyeu, 676 305 pour les quartiers, 670 228 pour le couloir, 21 796 pour la créature et 122 146 pour la porte.

Les angles de l'anneau sont mesurés à 0,175 / 0,35 / 0,56 rad ; ceux du moyeu restent à 0 / 0 / 0 rad. La menace est absente au prélèvement de 30 % et présente à celui de 82 %. Les comparaisons de l'onde et de l'orbite en mouvement réduit donnent zéro pixel différent après apparition du texte. Les tests de composition contrôlent aussi les pivots, les quatre appuis et le seuil exact de révélation.

Commandes des suites ciblées :

```bash
node --test scripts/verify-story-cinematics-v188.mjs scripts/verify-cinematic-coherence-v188.mjs
npm run test:audit
node --test scripts/verify-audit-continuation-v163.mjs scripts/verify-tantalus-priorities-v188.mjs
```

## Méthode et limites des captures

Les rendus utilisent `drawCinematicFrameV188`, les vrais PNG et `@napi-rs/canvas`, dans un cadre de 1280 × 720. Le décodage natif se fait par chemin : le binding installé refuse les Buffers PNG mais accepte les mêmes fichiers. Aucune conversion des sources n'est nécessaire. Les empreintes des images et des sources sont identiques avant et après les contrôles.

Les familles génériques `monospace` et `sans-serif` du jeu sont résolues vers DejaVu Sans Mono et DejaVu Sans, en normal et gras, enregistrées avant la création des Canvas. Le reçu conserve les empreintes des polices. Les premières captures utilisaient un repli serif inadapté ; elles ont été remplacées après correction des alias. Le raster des polices peut encore différer de celui d'un navigateur.

Pour mesurer la contribution d'un PNG, la fixture remplace uniquement cette image par un Canvas transparent de mêmes dimensions, en conservant la branche de rendu, les transformations et les éléments natifs. Ce Canvas n'est ni un nouvel asset ni un dérivé sauvegardé de l'original. Les seules initiales décoratives des portraits, recouvertes volontairement par le bruit radio existant, sont exclues du masque textuel ; noms complets, sous-titres, légendes et REC restent contrôlés.

L'inspection visuelle finale porte sur la planche et sur les vues en 1280 × 720, notamment les quartiers, le plafond avant/après apparition, le contrôle et CASSIUS en anglais, les archives en anglais et la porte corrigée. Aucun nouveau parcours Chromium n'est revendiqué : son lancement était bloqué par l'environnement avant l'ouverture d'une page lors de la continuation précédente. Cette QA ne certifie pas le réseau réel, le reflow mobile, une partie complète, les combats ou les récompenses.

## Références et fidélité

Les trois références de matériaux et de construction viennent du [travail de Paul Abbott sur Alien: Isolation](https://www.pauldavidabbott.co.uk/alien-isolation). La créature s'appuie sur les [photographies d'une tête de tournage d'Aliens (1986)](https://propstore.com/product/aliens-1986/lot-7-xenomorph-warrior-head/) et sur deux vues du [Warrior licencié publiées par NECA](https://store.necaonline.com/collections/latest-drops/products/aliens-ultimate-blue-warrior-7-inch-scale-action-figure). Les photographies de référence ne sont pas recopiées dans les assets distribués.

La tête nervurée est celle du type Warrior de 1986 ; le nom de fichier `ceiling-drone` désigne ici la menace du plan. La sculpture NECA sert de référence de corps, sans présenter ses articulations de jouet comme de l'anatomie. La pose au plafond est reconstruite et n'est pas la reproduction vérifiée d'un photogramme. Asphodèle, CASSIUS, Echo-8, Kessler et Crucible restent des créations du projet. Les proportions, matériaux et raccords sont contrôlés ; une reproduction canonique ou pixel pour pixel « 1:1 » n'est pas démontrée par ce lot.

## Preuves et état de livraison

- [Planche intégrée des onze plans](ASPHODELE_CINEMATIC_ART_OVERVIEW_20261117.png).
- [Prompts, références, empreintes et réutilisations](ASPHODELE_CINEMATIC_ART_PROVENANCE_20261117.json).
- [Reçu de rendu, mesures et revue indépendante](ASPHODELE_CINEMATIC_ART_RENDER_RECEIPT_20261117.json).

Le lot est préparé localement. Le contrôle automatique a rejeté le push vers GitHub, faute d'autorisation explicite de cette publication dans le dernier message de continuation. Aucune autre voie de publication n'a été utilisée. Les anciens succès de CI ne qualifient pas ce nouveau travail.

Les autres cinématiques, poses et animations hors de ce lot, le plan V3 et la rotation du hub jouable restent des chantiers distincts. Ce lot ne clôt pas l'ensemble de la bible.
