# Alien : La Mer des Chagrins — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.10.0 + pack visuel local.** Module autonome ; plans/mécanismes/impressions Decker = adaptation.

50 salles ; 59 liaisons dont 54 réciproques et 5 transferts narratifs ; 113 seuils ; 5 armes jouables/7 documentaires ; 16 fiches distribution.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR #58 conserve 27 PNG sources non activés à 994853bdd9d959980f0f8256cb39b1eadfe29911. PR #67 conserve maintenant 115/126 sources uniques, dont les 110 PNG historiques, soit 215 587 160 octets à e716f75318f243a981fdf6e64728cd6f039ad6dd ; 11 fichiers de code/configuration (225 325 octets) restent à retrouver. Les lots se recouvrent et ne doivent pas être additionnés.

[PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58), [PR #67](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/67)

Chemins repérés : `dlc/sea-of-sorrows/`, `dlc/sea-of-sorrows-visual/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

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

1. Préserver les 115 sources de PR #67, dont les 110 PNG historiques retrouvés ; rechercher les 11 fichiers de code/configuration avant de reconstituer et activer le renderer.
2. Ne pas confondre cinq armes jouables, sept références et seize fiches de distribution avec une reconstitution complète.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Reprise PR #58 : sauvegarde et correctifs encore séparés

Le [manifeste du lot du 26 novembre](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/994853bdd9d959980f0f8256cb39b1eadfe29911/docs/mer-des-chagrins-20261126/MANIFEST.json) au commit `994853bdd9d959980f0f8256cb39b1eadfe29911` conserve **27 PNG, 50 302 608 octets : 9 nouveaux et 18 récupérés**. Ce lot source n’est pas activé. Le [ledger PR #67 actualisé](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/e716f75318f243a981fdf6e64728cd6f039ad6dd/archives/sea-sprites-recovery-20261126/RECOVERY_LEDGER.json) conserve désormais **115/126 sources uniques : les 110 PNG historiques et cinq fichiers texte, soit 215 587 160 octets**. Les 110 images rattachées dans `sprites-complete/` correspondent aux empreintes du snapshot ; elles ne sont pas de nouvelles générations. Les copies réutilisées entre les deux PR ne sont comptées qu’une fois dans la couverture unique.

La [note de reprise](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/994853bdd9d959980f0f8256cb39b1eadfe29911/docs/mer-des-chagrins-20261126/RECOVERY.md) préserve les corrections exactes à réappliquer : parcourir les poses candidates jusqu’à une image réellement prête avec les attaches nécessaires, puis enlever le second agrandissement du parasite royal d’Adams. Les points de pivot de 48 décors doivent rester dans les dimensions du PNG, en pixels source. Les brancards `adams` et `elway` utilisent une orientation admise ; `head-right` n’est pas une valeur valide, et l’orientation anatomique doit rester explicite.

Le foamer demande une prise et une bouche mesurées. Les six familles d’obstacles conservent leurs 120 placements et leurs dimensions physiques ; leurs images ne changent pas les collisions. Le lot documente 50 salles, sans prétendre un parcours complet ni une nouvelle QA navigateur.

Les anciens décomptes de 92 PNG absents en PR #58 et 88 fichiers absents en PR #67 sont supersédés par ce rapprochement. **Il reste 11 fichiers de code/configuration, 225 325 octets ; aucun des 110 PNG historiques ne manque au ledger.** Xénomorphe adulte, Reine, fusil plasma et lance-flammes n’ont toujours pas de nouvelle variante PNG après refus : les anciennes images conservées ne résolvent pas ces demandes artistiques. Les corrections publiées sous forme de note ne sont pas du code actif. L’ancien snapshot local n’est pas actuellement disponible ; sa disparition ne constitue pas un nettoyage vérifié effectué dans cette reprise.

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_DLC_MER_DES_CHAGRINS.md` — contenu lu.
- `fidelity.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
