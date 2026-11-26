# Aliens (1986) — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Sources examinées : V114 RC1, V115 et présentation V116 publiée.** Opération autonome et inspections ; raccord hôte documenté dans le dépôt, distinct d'une conversion native.

25 lieux inspectables ; 11 lieux d'opération ; 20 raccords réciproques ; 5 objectifs locaux ; 80 règles ; 8 repères absents.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR #70 fusionnée dans main au commit 5f38b7bad2c6401424b23fda11aeb86068f0f354 ; 123 PNG dans le manifeste V116. La branche V115/PR #65 reste une provenance historique distincte.

[PR #57](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/57) · [PR #65](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/65)

Chemins repérés : `modules/aliens-1986/v114/`, `dlc/aliens-1986/`, `assets/dlc/aliens-1986/v115/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D10`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Ensembles Sulaco/planète séparés, sans porte magique.
- Newt désarmée ; M240/grenades avec dotation finie ; shotgun propre à Hicks.
- Inspections, objectifs locaux et campagne film distincts.

## Écarts concrets encore ouverts

- **ALIENS-1986-01** — Boss Reine, duel P-5000 et expulsion finale non joués dans cette branche.
- **ALIENS-1986-02** — Narcissus/récupération et appartement Gateway seulement références.
- **ALIENS-1986-03** — Façades/extérieurs, transports et ascenseurs partiels.

## Reprise artistique et intégration

1. Comparer les 123 PNG du manifeste V116 avant de produire les variantes encore manquantes ; préserver la provenance des 70 V115, 11 réemplois et 42 nouveaux.
2. Raccorder chaque tenue/arme à son propriétaire ; une Reine d'inspection ou un loader de décor ne clôture pas le final.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Reprise V116 vérifiée dans la PR #70

[PR #70 fusionnée](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/70) dans `main` à `5f38b7bad2c6401424b23fda11aeb86068f0f354` ; dernier head testé `1c20e87e8656dc0996523fd27319917b6215cdf7`. Le [manifeste V116](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/1c20e87e8656dc0996523fd27319917b6215cdf7/docs/development/aliens-1986-sprites-v116/manifest.json) compte **123 PNG : 70 V115, 11 réutilisés et 42 nouveaux**. Les 16 personnages possèdent chacun `idle`, `walk` et `interact`, sous forme d’images clés. Cela ne fournit pas les cycles complets.

Quatre poses restent absentes après refus : `hicks-wounded`, `warrior-walk-right`, `facehugger-attack-right`, `facehugger-death-right`. La Reine et les véhicules du catalogue ne créent pas un combat final ni une conduite de véhicule. Le montage M41A/M240 de Ripley reste à comparer.

La PR #70 signale **20 PNG anciens (40 024 719 octets) et 53 documents (1 759 979 octets) non envoyés**, ainsi que 19 sources de poses déjà absentes. Les sept variantes identifiées sont `door-leaf-damaged`, `door-leaf-reinforced`, `door-leaf-breached`, `meal-tray-food`, `supply-case-medical-empty`, `supply-case-ammo-closed` et `supply-case-ammo-empty`. Une planche d’orientations de sentinelle et douze révisions complètent les 20 PNG. Une nouvelle génération ne constitue pas la récupération des octets perdus.

Le [workflow Aliens du head testé](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45753007668) documente 665/665 contrôles V114, 20/20 d’intégration, 24/24 Chromium et 18 cas de menu/146 assertions. Ce sont les résultats de cette PR, pas des tests rejoués pour la présente bible ; la fidélité exacte au film reste non certifiée. Voir le [README V116](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/1c20e87e8656dc0996523fd27319917b6215cdf7/docs/development/aliens-1986-sprites-v116/README.md).

## Documents examinés

- `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1/README.md` dans `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1.zip` — contenu lu.
- `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1/CODEX_LEVEL_DESIGN_V114.md` dans `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1.zip` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
