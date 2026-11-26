# Alien — Anthologie40e anniversaire — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.6.0.** Six histoires indépendantes condensées ; édition autonome Canvas et intégration locale à publier.

6 histoires indépendantes ; 12 galeries de raccord originales.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Intégration locale et bundle de 256 822 850 octets repérés ; conservation GitHub du bundle non réalisée dans cette reprise.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Chemins repérés : `dlc/40th-anniversary/`, `archives/40th-anniversary/`.

Voir le [reçu de récupération et le travail restant](RECUPERATION_20261126.md).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

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

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_40TH_V0_6.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
