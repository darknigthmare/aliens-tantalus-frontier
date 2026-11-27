# Fleuve de la Douleur — bible détaillée

[Ouvrir la bible HTML](BIBLE_FLEUVE_DOULEUR.html) pour rechercher une identité, une salle, un équipement ou un manque, filtrer les huit domaines et consulter les placements.

- [Version Markdown](BIBLE_FLEUVE_DOULEUR.md) : fiches détaillées et tableaux.
- [Données JSON](BIBLE_FLEUVE_DOULEUR.json) : identifiants, états, coordonnées, sources et métadonnées.
- [Notes éditoriales](EDITORIAL_NOTES.json) : compléments sourcés et distinctions de continuité.
- [Registre des illustrations](PRODUCTION_ASSETS.json) : images de production réservées à la bible, avec fichiers, références, interprétations et provenance de génération.

La bible couvre le modèle récupéré de **River of Pain** et les manquants identifiés dans les références consultées : **279 fiches**, **78 PNG runtime**, **547 placements de props**, **118 détails de phase**, **128 portails / 64 connexions**. Les 83 fiches avec PNG runtime peuvent partager une même image ; elles ne constituent pas 83 images distinctes. Les illustrations de production sont comptées séparément à partir de leur registre.

Cette édition contient **8 illustrations de production** totalisant **19 582 657 octets**, liées à **9 fiches**, dont **8 sujets principaux** et **1 fiche avec contexte uniquement**. **188 fiches restent sans image propre au sujet** et **187 sans aucune image associée**. La terrasse des antennes conserve son besoin d’illustration propre ; la tour Uplink dispose d’une fiche documentaire distincte.

La récupération spatiale est datée du **16 mai 2179**. Moore reste au poste de pilotage, séparé du groupe qui descend. Le **pistolet-grappin de la navette** et les **bras de capture de la baie** sont deux éléments distincts. La **Terre vue depuis Gateway** est un cadre orbital documentaire, séparé de **LV-426, lune de Hadley’s Hope**.

Les scènes spatiales et Gateway ne sont pas connectées à la colonie par une porte. Les dimensions du modèle sont des choix du projet, pas des mesures officielles. L’exhaustivité du roman intégral et la fidélité exacte de chaque visuel ne sont pas certifiées.

## Reconstruction

Depuis la racine du dépôt :

```sh
node scripts/build-river-of-pain-bible.mjs
```

Le générateur relit le modèle, les notes, le manifeste runtime, le registre de production et les PNG présents. Il vérifie les identifiants, sources, couvertures de placement, signatures PNG, SHA-256 et admission exacte des illustrations, puis reconstruit JSON, Markdown et HTML.

Les documents, d’abord préservés par une reconstruction distante lors de l’interruption, ont ensuite été régénérés localement depuis les 78 PNG réels. Leurs signatures, SHA-256, tailles et dimensions ont été relus et vérifiés. Aucun asset ne conserve de dimension globale ou de taille inconnue dans cette édition. Cette vérification des fichiers reste distincte d’une validation artistique ou d’un parcours en jeu.

## Illustrations de production

Le registre référence uniquement des PNG effectivement livrés dans `production/`. Une tentative sans fichier récupéré reste décrite parmi les manquants et ne devient pas un asset. Le lot d’essais M41A/M240 du 26 novembre 2026 a été refusé par le service ; aucun PNG exploitable n’a été récupéré pour ces entrées. La tentative de génération du Xénomorphe adulte a également été bloquée et n’a fourni aucun fichier image.

| Illustration livrée | Sujet principal | Contexte associé |
| --- | --- | --- |
| [Jonesy](production/jonesy-study-v1.png) | `rop:personnages:jonesy` | — |
| [Medlab](production/medlab-study-v1.png) | `rop:lieux:med` | — |
| [Daihotai](production/daihotai-study-v1.png) | `rop:vehicules:daihotai-reference` | — |
| [Épave](production/derelict-study-v1.png) | `rop:vaisseaux:prop-wreck` | — |
| [Terrain rocheux](production/exterior-terrain-study-v1.png) | `rop:terrains:material-exterior` | — |
| [Tour Uplink](production/uplink-study-v1.png) | `rop:props:colony-uplink-tower` | `rop:lieux:aerial` |
| [Surface de LV-426](production/lv426-surface-study-v1.png) | `rop:planetes:lv426` | `rop:terrains:material-exterior` |
| [Serre](production/greenhouse-study-v1.png) | `rop:lieux:greenhouse` | — |

Jonesy utilise la version finale sur fond opaque ; les essais de détourage rejetés restent dans l’historique de génération. Pour Daihotai, l’épave et Uplink, les silhouettes principales sont entières au seuil alpha 16 ; quelques pixels faibles en périphérie restent signalés. Ces découpes sont des illustrations de production, sans validation de leur emploi comme sprites.

Chaque entrée contient un identifiant `prod-…`, un chemin PNG concret, un titre, un type d’étude, des cibles `rop:…`, les sources utilisées et les faits qu’elles établissent, les interprétations, la chronologie, les mesures du fichier, le prompt exact et la revue visuelle. Une échelle physique non établie reste `null` ; une illustration de scène ne reçoit pas artificiellement une ancre de sol.

| Champ | Contrat |
| --- | --- |
| `kind` | `character_study`, `environment_study`, `vehicle_study`, `ship_study`, `terrain_study`, `world_study` ou `equipment_study` |
| `targets` | Objets `{recordId, role}` ; rôle `subject` pour le sujet principal, `context` pour un contexte associé |
| `sourceIds` et `sourceClaims` | Références connues et objets `{sourceId, claim}` décrivant les seuls faits établis |
| `interpretations` et `chronology` | Choix de représentation et période explicitement qualifiés |
| `sha256`, `bytes`, `pixels` | Empreinte, taille et dimensions mesurées puis revérifiées par le générateur |
| `generation` | `{tool, createdOn, prompt, referenceUrls}` ; date réelle au format `AAAA-MM-JJ`, URLs de référence si utilisées |
| `scale` | `null` ou description avec `officialMeasurements: false` |
| `validation` | `{visual, fidelity1to1, notes}` ; revue `pending` ou `reviewed_with_limitations`, fidélité `not_certified` |
| `usage` | `bible_only` |

Les champs `assets` et `status.integration` des fiches continuent à décrire le runtime. Les champs `productionAssets` et `productionStatus` décrivent les illustrations documentaires. Une image de contexte est identifiée comme telle ; elle ne clôt pas les besoins propres au sujet de la fiche.

La provenance de génération conserve les prompts exacts, les références HTTPS publiques, les identifiants d’essais stables et leur historique. Un `parentAttemptId` renvoie à une entrée de cet historique. Les chemins locaux transitoires de sortie ou de références ne font pas partie du registre ; le validateur les refuse. Le fichier canonique et son SHA-256 identifient l’image effectivement livrée.

Les filtres distinguent PNG runtime, illustrations de production, sujet illustré en production, absence de PNG runtime, absence d’image du sujet et absence de toute image. Le compteur « sans aucune image » inclut uniquement les fiches sans PNG runtime et sans illustration associée. Le compteur « sans image du sujet » inclut les fiches sans PNG runtime et sans illustration de production au rôle `subject` ; il conserve donc les fiches illustrées uniquement en contexte parmi les manquants dédiés.

## Validation et distribution

Définition, PNG présent, intégration sélective et validation en jeu restent distincts. Un élément listé ne devient pas jouable par cette documentation.

Le générateur, les documents de ce dossier, le registre et ses illustrations sont des sources de production exclues du build public. Chaque nouveau chemin est admis individuellement dans `visualSourceFiles` de `scripts/river-of-pain-manifest.json`. Les images de ce registre n’entrent pas dans `visualAssets` ou `runtimeFiles`. Le générateur exige l’égalité entre les PNG déclarés et leurs chemins admis, puis contrôle les fichiers réels. Les archives v0.9, sauvegardes, dialogues et collisions ne sont pas réécrits.

Le HTML utilise une pagination de 20 fiches et des images chargées à la demande. La recette finale des 279 fiches et huit illustrations a validé **29 contrôles sur 29** dans Chromium 143, sans erreur JavaScript : compteurs, pagination, filtres runtime/production/sujet, filtre `dedicated-missing`, quatre cas de la fiche `aerial`, décodage des huit images et consultation des métadonnées. Les captures d’ensemble et du Medlab en 1280 × 900, ainsi que celle de Jonesy en 390 × 844, ont été relues sans débordement. Une revue indépendante a également vérifié les fichiers, l’admission source et les rôles sujet/contexte. La validation artistique et le parcours en jeu conservent leurs états propres.
