# Aliens (1986) — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : V114 RC1 + branche sprites V115.** Opération autonome et inspections ; raccord hôte documenté dans le dépôt, distinct d'une conversion native.

25 lieux inspectables ; 11 lieux d'opération ; 20 raccords réciproques ; 5 objectifs locaux ; 80 règles ; 8 repères absents.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

V114 fusionnée dans la cumulative ; 70 PNG V115 en PR65 brouillon, qualification/raccord à achever.

[PR #57](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/57) · [PR #65](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/65)

Chemins repérés : `modules/aliens-1986/v114/`, `dlc/aliens-1986/`, `assets/dlc/aliens-1986/v115/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D10`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Ensembles Sulaco/planète séparés, sans porte magique.
- Newt désarmée ; M240/grenades avec dotation finie ; shotgun propre à Hicks.
- Inspections, objectifs locaux et campagne film distincts.

## Écarts concrets encore ouverts

- **ALIENS-1986-01** — Boss Reine, duel P-5000 et expulsion finale non joués dans cette branche.
- **ALIENS-1986-02** — Narcissus/récupération et appartement Gateway seulement références.
- **ALIENS-1986-03** — Façades/extérieurs, transports et ascenseurs partiels.

## Reprise artistique et intégration

1. Préserver et qualifier les 70 PNG de la branche V115 avant de régénérer les mêmes identités.
2. Raccorder chaque tenue/arme à son propriétaire ; une Reine d'inspection ou un loader de décor ne clôture pas le final.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1/README.md` dans `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1.zip` — contenu lu.
- `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1/CODEX_LEVEL_DESIGN_V114.md` dans `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1.zip` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
