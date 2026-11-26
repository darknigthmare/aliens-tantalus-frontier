# Alien — Anthologie 40e anniversaire — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.6.0.** Six histoires indépendantes condensées ; édition autonome Canvas et intégration locale à publier.

6 histoires indépendantes ; 72 sous-espaces de jeu dont 12 galeries de raccord originales ; 84 connexions / 168 seuils orientés ; 72 actions principales, 24 travaux facultatifs, 796 placements / 46 familles.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR #72 préserve six ZIP originaux v0.1 à v0.6 : 174 243 911 octets, 20 fragments, 13 documents source. Ancien commit et bundle d’intégration non récupérés ; aucun raccord runtime ajouté.

[PR #72 de préservation](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/72) ; [manifeste des six archives](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/8e5338da2879ecb4ec793fdbd62c0990f5d57237/archives/40th-anniversary-recovery-20261126/MANIFEST.json).

La tête `ed08d329d3e037fbe1db4490896dfde6afde0ee7` complète cette sauvegarde par une [admission fermée des 37 fichiers source](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ed08d329d3e037fbe1db4490896dfde6afde0ee7/scripts/public-40th-source-recovery-20261126.mjs) et de leurs parents exacts, avec tailles et SHA-256 fixes. Les sources restent hors du build et identiques au commit de preuve `8ec16d6448e0833e932294456e3393674a4a79ad`. Les 13 contrôles ciblés de succession et d’admission sont réussis ; aucun succès global de CI ni raccord jouable n’est déduit de cette admission.

Chemins repérés : `dlc/40th-anniversary/`, `archives/40th-anniversary/`.

Voir le [reçu de récupération et le travail restant](RECUPERATION_20261126.md).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Containment = sous-volumes de navette ; pas douze grandes salles.
- Ore = transitions de palier, pas simulation d'ascenseur revendiquée.
- Seuils sur cloison et raccords originaux étiquetés.

## Écarts concrets encore ouverts

- **40TH-ANNIVERSARY-01** — Inventaire plan par plan des six courts non établi.
- **40TH-ANNIVERSARY-02** — Graphismes vectoriels provisoires, fragments écrits et épilogues textuels.
- **40TH-ANNIVERSARY-03** — Raccord natif non attesté par le README source ; intégration hôte distincte.

## Reprise artistique et intégration

1. Conserver une liste d'assets distincte pour chaque court ; ne pas fusionner leurs personnages/chronologies.
2. Comparer aux médias effectivement présents et au commit local d'intégration avant production.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Périmètre des six courts et sauvegarde retrouvée

Les six histoires **Harvest, Containment, Specimen, Night Shift, Ore et Alone** gardent des identités, personnages et chronologies indépendants. Les 72 sous-espaces du [compteur v0.6](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/8e5338da2879ecb4ec793fdbd62c0990f5d57237/archives/40th-anniversary-recovery-20261126/documents/docs/CONTENT_COUNTS.json) ne sont pas 72 lieux de tournage attestés : 60 proviennent du contenu précédent du module, 12 sont des galeries originales. Les modes sont cinq scènes SIDE, 43 DEPTH et 24 HYBRID ; ces comptes décrivent le jeu, pas des plans métriques des films.

Les [sources et règles d’adaptation](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/8e5338da2879ecb4ec793fdbd62c0990f5d57237/archives/40th-anniversary-recovery-20261126/documents/docs/SOURCES_ET_ADAPTATION.md) demandent de garder les distinctions suivantes :

- Harvest : détecteur, blessure d’Alec et fausse promesse de sauvetage ; une variante de quarantaine ne promet pas une évacuation saine.
- Containment : Nass et Mills inconscient ne sont pas interchangeables ; les sous-volumes de la navette ne deviennent pas de grandes salles supplémentaires.
- Night Shift : le dépôt n’est pas transformé en véritable hôpital.
- Specimen : ne pas inventer qui a déposé un œuf dans le substrat.
- Ore : la défense finale ne certifie pas une victoire laissée ouverte ; les changements de palier restent des transitions de secteur tant qu’aucune cage ou échelle animée n’est réalisée.
- Alone : la synthétique n’est pas un hôte humain, l’organisme n’est pas présenté comme domestiqué.

Les dialogues ajoutés, relevés, noms de subdivisions, itinéraires alternatifs et formulations d’épilogues sont originaux. Les étiquettes « ancrage film » et « ajout du jeu » restent distinctes. Les six films n’ont pas été annotés image par image par l’archive source ; aucune fidélité 1:1 n’en est déduite.

La PR #72 au commit `8e5338da2879ecb4ec793fdbd62c0990f5d57237` préserve **six ZIP v0.1 à v0.6, 174 243 911 octets** avec reconstruction et empreintes. Elle ne restitue ni le commit d’intégration local `1f39f0f2c41e6a8c80eca4fd5481b92ac372972d`, ni son bundle de 256 822 850 octets signalé précédemment. Aucun menu ou moteur actif n’est modifié par cette préservation.

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_40TH_V0_6.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
