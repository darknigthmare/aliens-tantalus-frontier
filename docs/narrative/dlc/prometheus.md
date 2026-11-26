# Prometheus — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 12.0.0-candidate.1.** Module autonome cumulatif ; rendu vectoriel de travail et fusion native non attestée.

44 lieux ; 54 connexions / 108 seuils ; 41 objectifs principaux ; 37 entrées matériel.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

ZIP récupéré et vérifié localement ; transfert GitHub des octets interrompu par l'indisponibilité de l'environnement. Intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Chemin de publication prévu : `archives/dlc-source-recovery-20261126/prometheus/`. Ce chemin a été préparé localement ; aucun octet de ce ZIP n'a été publié. Voir le [reçu des sept archives](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Passerelle sur deux niveaux jouables reliés par escalier ; géométrie adaptée.
- Prologue et époques lointaines séparés du graphe physique.
- Pièces du film et aménagements de jeu distingués.

## Écarts concrets encore ouverts

- **PROMETHEUS-01** — Sacrifice de l'Ingénieur, découverte archéologique terrestre et rêve de Shaw absents comme lieux jouables.
- **PROMETHEUS-02** — Quartiers Weyland et tunnels du complexe partiels ; embarquement/extérieur du second vaisseau condensés.
- **PROMETHEUS-03** — RT01 sans cabine détaillée, quad de décor, équipe secondaire incomplète.

## Reprise artistique et intégration

1. Reprendre les 37 inspections matérielles avec statut exact ; la présence dans le codex ne prouve pas l'usage.
2. Qualifier les apparences de Shaw/David/Vickers et des techniciens contre la scène concernée ; ne pas remplacer un lieu absent par une chambre générique.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Documents examinés

Archive : `ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip` ; SHA-256 `b7d1e1324dd6e4e08ce5bb6574a68a204a4214e649dc8c79e2d705b6da336da1` ; 14 678 996 octets. Les noms suivants sont relatifs à la racine extraite (préfixe ZIP non consigné) et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees) conserve le statut de transfert.

- `README_V12.md` — contenu lu.
- `CODEX_PROMETHEUS_V12.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
