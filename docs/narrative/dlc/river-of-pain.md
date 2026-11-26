# Alien : Fleuve de la Douleur — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.9.0-candidate.1 + packs visuels.** Module autonome récupéré ; raccord et 42 sprites fusionnés dans main selon snapshot,28 props sur branche distincte.

47 lieux ; 64 connexions /128 seuils ; 16 chapitres ; 49 objectifs +6 détours ; 14 profils ; 93 entrées documentaires.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Module et 42 sprites fusionnés dans main ; 28 props supplémentaires en PR66, soit 70 PNG sur cette branche.

[PR #60](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/60) · [PR #62](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/62) · [PR #66](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/66)

Chemins repérés : `dlc/fleuve-de-la-douleur/`, `archives/river-of-pain/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Types de seuil/support ; pistes sans portes isolées ;44 props gênants déplacés.
- Corrections Russ/Brackett, Luisa/Newt et transmission Hidalgo.
- Anne/Newt désarmées ; M240/grenades facultatifs = adaptation.
- Plans reconstruits ; texte intégral non confronté.

## Écarts concrets encore ouverts

- **RIVER-OF-PAIN-01** — Séquences hors-colonie, certains personnages et équipements absents.
- **RIVER-OF-PAIN-02** — Unité médicale observable, sans chirurgie jouable.
- **RIVER-OF-PAIN-03** — Apparences source vectorielles : les packs plus récents doivent remplacer cette lecture historique.

## Reprise artistique et intégration

1. Intégrer/comparer les28 props déjà produits avant génération ; conserver42 sprites déjà fusionnés.
2. Raccorder les assets à leur scène, pas globalement à chaque type de prop.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_LEVEL_DESIGN.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
