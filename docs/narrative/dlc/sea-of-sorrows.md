# Alien : La Mer des Chagrins — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.10.0 + pack visuel local.** Module autonome ; plans/mécanismes/impressions Decker = adaptation.

50 salles ; 59 liaisons dont54 réciproques et5 transferts narratifs ; 113 seuils ; 5 armes jouables/7 documentaires ; 16 fiches distribution.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR58 de récupération ; PR67 conserve 33 fichiers / 48 916 609 octets dont 28 PNG du pack visuel. 93 fichiers sur 126 restent à transférer.

[PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58), [PR #67](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/67)

Chemins repérés : `dlc/sea-of-sorrows/`, `dlc/sea-of-sorrows-visual/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Râteliers à dotation finie unique, acquisition physique, pas ressources gratuites.
- Grenades Silas et charges orbitales narratives.
- Adams/Elway gardent parasites au transport/stase ; trois attaches reine = règle originale.

## Écarts concrets encore ouverts

- **SEA-OF-SORROWS-01** — Roman intégral/variantes audio non confrontés.
- **SEA-OF-SORROWS-02** — Silas/Muller/Dave/Pritchett seulement fiches dans la source.
- **SEA-OF-SORROWS-03** — Capture Manning, dernières actions Decker, décès/interventions secondaires à reconstituer.
- **SEA-OF-SORROWS-04** — Visage Decker et majorité distribution non authentifiés ; boss à trois attaches à revoir.

## Reprise artistique et intégration

1. Reprendre les 93 fichiers du pack visuel non transférés depuis le ledger PR67, puis comparer le renderer avant génération supplémentaire.
2. Ne pas confondre cinq armes jouables, sept références et seize fiches de distribution avec une reconstitution complète.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_DLC_MER_DES_CHAGRINS.md` — contenu lu.
- `fidelity.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
