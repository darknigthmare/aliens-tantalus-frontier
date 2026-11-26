# Alien : Hors des Ombres — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.10.0.** Extrait autorisé et sources éditoriales ; roman/dramatique à distinguer.

41 pièces ; 52 liaisons /104 seuils ; 16 chapitres /48 objectifs ; 48 types /331 placements ; 228 notices ; 18 équipements ; 10 profils /28 présences.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR59 ouverte ; comparer les modifications locales aux octets de cette branche avant nettoyage.

[PR #59](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/59)

Chemins repérés : `dlc/alien-hors-des-ombres/`, `archives/dlc-hors-des-ombres-v010/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Portes dans retours de cloison ; plans originaux non cotés.
- Cinq outils utilisables distincts des références documentaires.
- Rôles civils et apparences provisoires sans portraits des comédiens vocaux.

## Écarts concrets encore ouverts

- **OUT-OF-THE-SHADOWS-01** — Quatre adultes au vestibule, vitres rompues et décompression partiels.
- **OUT-OF-THE-SHADOWS-02** — Carte minière/quartiers/systèmes épave incomplets.
- **OUT-OF-THE-SHADOWS-03** — Xénobiologie épave non authentifiée ; ne pas identifier automatiquement les vestiges aux Ingénieurs.

## Reprise artistique et intégration

1. Comparer les packs déjà générés et PR59 avant génération.
2. La morphologie non décrite par les sources doit rester interprétation de production, même si le PNG est détaillé.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `docs/AUDIT_FIDELITE_V010.json` — contenu lu.
- `docs/CODEX_LEVEL_DESIGN.html` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
