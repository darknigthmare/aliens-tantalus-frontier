# Alien: Blackout — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.7.0.** Sept secteurs distincts, module autonome et extensions Tantalus signalées.

56 pièces (4 SIDE/52 DEPTH) ; 66 cloisons /132 faces ; 21 gaines ; 41 familles /703 placements ; 5 silhouettes ; 16 équipements ; 11 écarts ; 271 fiches.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR #54 ouverte de récupération ; statut de publication distinct de la qualification du raccord hôte. ZIP original récupéré/contrôlé mais non transféré ; la préservation complémentaire prévue en PR #54 est interrompue.

[PR #54](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/54)

Chemins repérés : `dlc/alien-blackout/`, `modules/alien-blackout/`.

Voir le [reçu de récupération et le travail restant](RECUPERATION_20261126.md).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Studwick ingénieur, Thorncroft scientifique ; armes portatives non confirmées non ajoutées.
- Cartes/caméras ne téléportent personne ; gaines réservées aux Aliens.
- Refuge unique, deux Aliens finaux, balises/soins/secours = adaptations.

## Écarts concrets encore ouverts

- **ALIEN-BLACKOUT-01** — Feuille officielle de personnages non récupérée, silhouettes interprétées.
- **ALIEN-BLACKOUT-02** — Haldin intérieur/vol, refuge multiaccès et déroulé des objectifs incomplets.
- **ALIEN-BLACKOUT-03** — Plans métriques, correspondance caméras/pièces et timings non établis.

## Reprise artistique et intégration

1. Produire les personnages après références, pas à partir de rôles confondus.
2. Préserver explicitement les extensions Tantalus sans les attribuer au jeu original.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Documents examinés

Archive : `ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip` ; SHA-256 `b02538fafdc1a73aa88d80efa82e51d5852a6bf4fdaee85f90972ab32f21e35c` ; 33 103 752 octets. Les noms suivants sont relatifs à la racine extraite `ALIEN_BLACKOUT_v0.7.0` et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees) conserve le statut de transfert.

- `ALIEN_BLACKOUT_v0.7.0/README.md` dans `ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip` — contenu lu.
- `ALIEN_BLACKOUT_v0.7.0/docs/KNOWN_LIMITS.md` dans `ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
