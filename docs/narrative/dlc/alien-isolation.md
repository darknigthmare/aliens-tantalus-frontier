# Alien: Isolation — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.8.0 — Une station, des chemins.** Adaptation autonome condensée ; pas toutes les pièces ni tous les DLC commerciaux d'Alien: Isolation.

76 lieux ; 112 liaisons / 224 seuils ; 840 placements ; 246 règles ; 19 chapitres ; 52 objectifs ; 32 tâches facultatives ; 57 archives ; 155 SVG.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Archive originale sauvegardée en PR73 : 85 001 778 octets, SHA-256 identique au reçu initial. Les documents source sont consultables ; aucune activation gameplay nouvelle n’est effectuée par cette préservation.

[PR #73 de préservation](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/73) · [Manifeste exact](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/alien-isolation/MANIFEST.json) · [Documents extraits](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/alien-isolation/documents)

Chemin publié : `archives/dlc-source-recovery-20261126/alien-isolation/`, commit `6b46eaf8f574871e39487e0a10ef46acfb1f41a6`. Le ZIP peut être reconstruit à partir des fragments décrits par le manifeste. Les chemins, tailles et empreintes du lot ont été comparés au dépôt ; ils restent des sources exclues de la distribution. Voir le [reçu de cette reprise](RECUPERATION_20261126.md#sauvegardes-de-cette-reprise).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Ouverture, approche et arrivée distinctes ; neuf changements de pont représentés en escaliers.
- Morley requis à chaque entrée de pharmacie ; KG-348 verrouille ses annexes.
- Chasseur non tuable ; roue/équipement sans pause ; Nora/Elias escortes originales.
- Carte globale schématique et transports inter-salles condensés.

## Écarts concrets encore ouverts

- **ALIEN-ISOLATION-01** — Plan métrique complet, toutes les pièces et extensions commerciales non reproduits.
- **ALIEN-ISOLATION-02** — Rendu vectoriel provisoire, visages/animations et correspondance exacte des appareils à qualifier.
- **ALIEN-ISOLATION-03** — Persistance native et hôte Tantalus non qualifiés par les essais en mémoire du paquet.

## Reprise artistique et intégration

1. Inventorier Amanda, le chasseur, synthétiques et appareils depuis le vrai contenu, puis rapprocher les 155 SVG.
2. Conserver l'équilibre de furtivité et la non-mortalité du chasseur ; un nouvel asset ne justifie pas un arsenal létal contre lui.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Documents examinés

Archive : `ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip` ; SHA-256 `880f74e69551afd41af36b62c34778dd239a10386f573cb86eb170641855a978` ; 85 001 778 octets. Les noms suivants sont relatifs à la racine extraite (préfixe ZIP non consigné) et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sauvegardes-de-cette-reprise) conserve le statut de transfert.

- `README_FR.md` — contenu lu.
- `docs/CODEX_ISOLATION.md` — contenu lu.
- `docs/METRIQUES.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
