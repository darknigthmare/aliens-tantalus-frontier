# Alien : La Mer des Chagrins — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Continuation 0.10.4 — état courant

**139 PNG, dont 13 nouveaux, et 239 fiches de production.** Cette passe prolonge la [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58) depuis `a26188a1e63cd39daaee5167d8e940e48120794d`. La simulation originale 0.10.0 reste distincte de son édition visuelle.

La [bible détaillée](../../mer-des-chagrins-20261126/BIBLE_COMPLETION_20261126.md) et son [inventaire structuré](../../mer-des-chagrins-20261126/BIBLE_COMPLETION_20261126.json) conservent le checkpoint 0.10.2, les ajouts 0.10.3 et un registre courant des 576 travaux. Les 239 fiches couvrent toujours 29 personnages/créatures/variantes, 50 lieux, 7 armes, 119 props, 5 véhicules, 5 vaisseaux, 22 terrains et 2 planètes.

Les nouveaux états comprennent les passages intermédiaires de marche et les poses contextuelles de Decker, des objets disponibles ou épuisés, les accessoires médicaux, les cages des deux seuils s14/s15, deux familles de sol et la vue orbitale de LV-178 dans la baie de s39. Les conditions détaillées demeurent dans le manifeste et les fiches. Le cadre d’armurerie et le casier vide historiques sont réutilisés ; ils ne sont pas recomptés comme des générations.

**Périmètre de preuve.** Suite visuelle finale : 105/105 tests réussis, zéro échec et zéro ignoré. Les 139 PNG sont contrôlés (270 594 463 octets), les 126 images et lignes de métadonnées antérieures préservées. La QA Canvas finale décode 139 images, rend 50 salles, 24 cas posture/arme, 16 locomotions, 42 diagnostics dont 23 replis de porte identiques pixel par pixel, 11 cas médicaux/reine historiques et 35 cas de cette édition. Les 13 nouveaux PNG sont effectivement dessinés parmi 125 types observés. Treize captures finales totalisent 11 375 616 octets. Les salles, positions, états et grossissements sont des fixtures déclarées ; il ne s’agit pas d’une campagne parcourue dans un navigateur. Aucun cycle complet d’animation ni fidélité globale 1:1 n’est certifié.

La variante compacte du lance-flammes a été refusée : aucun nouveau fichier ni relance ; la crosse et la seconde main historiques restent à corriger. Le passage B de marche garde un genou haut et les transitions restent sommaires. La vue orbitale ne certifie aucune géographie canonique. Le revêtement de sol ne constitue pas un stage complet, la cage fixe ne constitue pas une animation d’ascenseur et les poses supplémentaires ne certifient pas les cycles de combat, de recharge ou de consultation. Les huit domaines conservent des travaux ouverts. Adulte et plasma restent sans PNG après refus ; les demandes refusées ne sont pas relancées dans cette passe.

Références courantes : [manifeste des PNG](../../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [prompts 0.10.4](../../mer-des-chagrins-20261126/GENERATION_0_10_4.json), [validation 0.10.4](../../mer-des-chagrins-20261126/VALIDATION_0_10_4.json).

## Checkpoint publié 0.10.3

### Périmètre et version du checkpoint 0.10.3

**Simulation conservée : 0.10.0 ; édition visuelle publiée : 0.10.3, PR #58, commit `fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474`.** Le module garde sa simulation et sa sauvegarde propres ; plans, mécanismes et impressions de Decker restent une adaptation. Le complément de production contient **239 fiches dans les huit domaines demandés**.

50 salles ; 59 liaisons dont 54 réciproques et 5 transferts narratifs ; 113 seuils ; 5 armes jouables/7 documentaires ; 16 fiches distribution dans la source initiale. Les identités, variantes et poses ne sont pas additionnées comme de nouveaux personnages.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

### Publication et raccord au jeu 0.10.3

[PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58) publie l’édition visuelle **0.10.3 au commit `fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474` : 126 PNG distincts**, dont les 121 images du checkpoint 0.10.2 et **cinq nouveaux fichiers** : reine, lance-flammes, médecin anonyme du Carlyle, Decker en tenue hospitalière et appareil portable du rapport ICC. Leurs usages sont rattachés à la présentation existante ; les trois ajouts médicaux concernent uniquement `s03`, l’appareil concernant `o02-01`. Le composite médical reste disponible ailleurs.

La bible détaillée recense **239 fiches** : 29 personnages/créatures/variantes, 50 lieux, 7 armes, 119 props/équipements/effets, 5 véhicules, 5 vaisseaux, 22 terrains et 2 planètes. Son inventaire historique reste épinglé aux 121 PNG de la 0.10.2 ; le bloc de continuation décrit séparément les cinq ajouts. Ces fiches peuvent réutiliser la même image et ne représentent pas 239 nouveaux assets.

**La validation finale a été réexécutée après le retour de l’environnement : 87/87 tests ciblés de raccordement réussis.** Le contrôle Pillow porte sur **126 PNG, 246 478 952 octets**. La QA Canvas a chargé les **126 images**, rendu **50 salles**, **24 cas posture/arme/direction**, **12 cas de locomotion**, **44 diagnostics** et **11 cas médicaux/reine**. Elle a effectivement dessiné **108 PNG distincts, dont les cinq nouveaux**. **Onze captures** documentent ces fixtures ; elles ne sont pas présentées comme une campagne parcourue dans un navigateur.

La copie du lot visuel de **133 fichiers** a été vérifiée. Aucun build global ni nouveau parcours navigateur n’est déclaré pour cette édition. Le réglage de présentation de l’appareil ICC a été réduit de **42 à 30** après inspection. La crosse du lance-flammes reste trop en arrière et la prise de la seconde main demeure imparfaite : ces écarts restent ouverts dans la qualification artistique. L’adulte xénomorphe et le fusil plasma restent sans nouveau PNG après refus de génération ; leur repli natif est conservé.

La récupération [PR #67](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/67) demeure une preuve historique distincte : **115/126 sources uniques**, dont les 110 PNG d’origine, soit 215 587 160 octets à `e716f75318f243a981fdf6e64728cd6f039ad6dd`. Ses **11 anciennes versions de code/configuration, 225 325 octets**, restent introuvables ; la reconstruction fonctionnelle du renderer ne restitue pas ces octets. Le nombre 126 de ce ledger de sources ne désigne pas le catalogue courant de 126 PNG. Les lots qui se recouvrent ne sont pas additionnés.

Documents de l’édition 0.10.3 : [guide d’intégration](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/docs/mer-des-chagrins-20261126/INTEGRATION.md), [manifeste PNG](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [bible détaillée](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/docs/mer-des-chagrins-20261126/BIBLE_COMPLETION_20261126.md) et [inventaire structuré](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/docs/mer-des-chagrins-20261126/BIBLE_COMPLETION_20261126.json).

Preuves de cette tête : [reçu final 0.10.3](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/docs/mer-des-chagrins-20261126/VALIDATION_0_10_3.json), [onze captures Canvas 0.10.3](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/docs/mer-des-chagrins-20261126/canvas-0.10.3/) et [prompts/provenance des générations](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/docs/mer-des-chagrins-20261126/GENERATION_0_10_3.json).

Chemins conservés : `dlc/sea-of-sorrows/` et `dlc/sea-of-sorrows-visual/`. L’import original reste inchangé. Cette référence à PR #58 ne fusionne pas les branches et n’annonce pas un déploiement en production.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Râteliers à dotation finie unique, acquisition physique, pas ressources gratuites.
- Grenades Silas et charges orbitales narratives.
- Adams/Elway gardent parasites au transport/stase ; trois attaches reine = règle originale.

## Écarts concrets encore ouverts — réconciliés par le registre courant

- **SEA-OF-SORROWS-01** — Roman intégral/variantes audio non confrontés.
- **SEA-OF-SORROWS-02** — Silas/Muller/Dave/Pritchett possèdent des portraits, sans placements `room.cast` dans les 50 salles ; leurs interventions restent à réaliser.
- **SEA-OF-SORROWS-03** — Capture Manning, dernières actions Decker, décès/interventions secondaires à reconstituer.
- **SEA-OF-SORROWS-04** — Visage Decker et majorité distribution non authentifiés ; boss à trois attaches à revoir.
- **SEA-OF-SORROWS-05** — Adulte xénomorphe et fusil plasma sans nouveau PNG après refus ; cadavres adulte/reine et cycles complets d’animation restent à produire.
- **SEA-OF-SORROWS-06** — Les cinq images de la 0.10.3 sont observées dans sa QA Canvas ; la crosse du lance-flammes et la seconde main gardent des défauts documentés. Le parcours navigateur, les cycles complets et la qualification canonique restent ouverts.

## Reprise artistique et intégration

1. Préserver les 115 sources de PR #67 et les PNG désormais raccordés en PR #58 ; continuer à rechercher les 11 anciennes versions de code/configuration sans présenter la reconstruction fonctionnelle comme leur récupération exacte.
2. Ne pas confondre cinq armes jouables, sept références et seize fiches de distribution avec une reconstitution complète.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Historique de récupération — checkpoint remplacé par la 0.10.3

Les paragraphes conservés ci-dessous décrivent le checkpoint `994853bdd9d959980f0f8256cb39b1eadfe29911` et son rapprochement avec PR #67. Leurs anciens états « 27 PNG non activés », « correctifs à réappliquer » et « quatre images manquantes » sont remplacés par l’état courant ci-dessus. Les chiffres d’archives, preuves de récupération et limites de continuité restent conservés.

<details>
<summary>État historique et preuves du checkpoint de récupération</summary>

## Reprise PR #58 : sauvegarde et correctifs encore séparés

Le [manifeste du lot du 26 novembre](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/994853bdd9d959980f0f8256cb39b1eadfe29911/docs/mer-des-chagrins-20261126/MANIFEST.json) au commit `994853bdd9d959980f0f8256cb39b1eadfe29911` conserve **27 PNG, 50 302 608 octets : 9 nouveaux et 18 récupérés**. Ce lot source n’est pas activé. Le [ledger PR #67 actualisé](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/e716f75318f243a981fdf6e64728cd6f039ad6dd/archives/sea-sprites-recovery-20261126/RECOVERY_LEDGER.json) conserve désormais **115/126 sources uniques : les 110 PNG historiques et cinq fichiers texte, soit 215 587 160 octets**. Les 110 images rattachées dans `sprites-complete/` correspondent aux empreintes du snapshot ; elles ne sont pas de nouvelles générations. Les copies réutilisées entre les deux PR ne sont comptées qu’une fois dans la couverture unique.

La [note de reprise](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/994853bdd9d959980f0f8256cb39b1eadfe29911/docs/mer-des-chagrins-20261126/RECOVERY.md) préserve les corrections exactes à réappliquer : parcourir les poses candidates jusqu’à une image réellement prête avec les attaches nécessaires, puis enlever le second agrandissement du parasite royal d’Adams. Les points de pivot de 48 décors doivent rester dans les dimensions du PNG, en pixels source. Les brancards `adams` et `elway` utilisent une orientation admise ; `head-right` n’est pas une valeur valide, et l’orientation anatomique doit rester explicite.

Le foamer demande une prise et une bouche mesurées. Les six familles d’obstacles conservent leurs 120 placements et leurs dimensions physiques ; leurs images ne changent pas les collisions. Le lot documente 50 salles, sans prétendre un parcours complet ni une nouvelle QA navigateur.

Les anciens décomptes de 92 PNG absents en PR #58 et 88 fichiers absents en PR #67 sont supersédés par ce rapprochement. **Il reste 11 fichiers de code/configuration, 225 325 octets ; aucun des 110 PNG historiques ne manque au ledger.** Xénomorphe adulte, Reine, fusil plasma et lance-flammes n’ont toujours pas de nouvelle variante PNG après refus : les anciennes images conservées ne résolvent pas ces demandes artistiques. Les corrections publiées sous forme de note ne sont pas du code actif. L’ancien snapshot local n’est pas actuellement disponible ; sa disparition ne constitue pas un nettoyage vérifié effectué dans cette reprise.

</details>

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_DLC_MER_DES_CHAGRINS.md` — contenu lu.
- `fidelity.json` — contenu lu.
- `BIBLE_COMPLETION_20261126.md/.json` et `SPRITE_MANIFEST.json` — complément et état courant reliés au commit `fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474`.

Les nouvelles références distinguent le [chapitre 4 du roman publié en extrait](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/) et l’[échantillon officiel de la dramatique audio](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf). Le nom Carlyle et la consultation médicale sont documentés ; le visage exact reste interprété. Kiangya, Piotrowicz et le crawler conservent la qualification audio de ces preuves, sans incorporation automatique au roman.

## Qualification

Les données décrivent les sources récupérées et les reçus techniques cités. Les tests ciblés et les fixtures Canvas de chaque édition ont leur périmètre propre ; aucun résultat de campagne jouée, de build global ou de CI globale ne leur est attribué. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
