# Aliens: Colonial Marines — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.10.0 — Retour aux références.** Adaptation autonome campagne/Stasis/Bug Hunt ; pas reproduction exhaustive du jeu commercial.

105 salles campagne/Stasis ; 15 chapitres ; 3 arènes Bug Hunt ; 107 liaisons / 214 seuils ; 21 profils d'armes ; 11 profils de personnages.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

ZIP récupéré et vérifié localement ; transfert GitHub des octets interrompu par l'indisponibilité de l'environnement. Intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Chemin de publication prévu : `archives/dlc-source-recovery-20261126/colonial-marines/`. Ce chemin a été préparé localement ; aucun octet de ce ZIP n'a été publié. Voir le [reçu des sept archives](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Acquisition physique de 17 ajouts d'armes ; trois modules sous canon à réserves séparées ; six légendaires placées dans leur mission de référence.
- Grue Sulaco Falls, escorte Reid/The Raven, trois valves Redemption.
- Hicks corrige l'étiquette Lisbeth dans Awakening sans changer les IDs de sauvegarde.
- Fiorina/Legato/Resolute et conclusion = scènes condensées/documentaires.

## Écarts concrets encore ouverts

- **COLONIAL-MARINES-01** — G2 électrochoc, tourelle WY téléopérée, GAU-113/B, modifications/progression absents ou incomplets.
- **COLONIAL-MARINES-02** — Mine non équivalente à une Claymore directionnelle ; économie/XP adaptées.
- **COLONIAL-MARINES-03** — Sous-secteurs, verticalité, cinématiques/animations/dialogues non reconstitués intégralement.
- **COLONIAL-MARINES-04** — Pas coop réseau/Versus ; Bug Hunt original, pas Broadside/Mercenary/Tribute ; Reconnaissance/Movie/Academy non reproduits.

## Reprise artistique et intégration

1. Commencer par les 21 profils réellement jouables et leurs utilisateurs ; ne pas compter les PNJ statiques comme scènes d'IA complètes.
2. Documenter armes/accessoires absents et leurs mécaniques propres avant de générer des images qui laisseraient croire au gameplay.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Documents examinés

Archive : nom exact non consigné dans ce reçu ; SHA-256 `5d7e921c787396377098457898f28b99424c306f340ec0b4973a01595cca6322` ; 62 621 653 octets. Les noms suivants sont relatifs à la racine extraite (préfixe ZIP non consigné) et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees) conserve le statut de transfert.

- `README.md` — contenu lu.
- `docs/ASSETS_STATUS.md` — contenu lu.
- `docs/ADAPTATION.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
