# Alien: Covenant — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Sources examinées : 0.10.0 et raccord graphique 0.11.** Module autonome avec registre d'adaptation ; aucune ligne verified 1 to 1=true annoncée.

56 espaces physiques + tableau séparé ; 67 liaisons / 134 seuils ; 42 objectifs / 12 chapitres ; 315 fiches dont 224 cinéma : 150 correspondances partielles et 74 sans correspondance.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

PR #71 brouillon à aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9 : 49 PNG, 29 admis au rendu et 20 au catalogue ; module et menu raccordés sur cette branche. PR #69 conserve séparément trois candidats sources non activés.

[PR #69](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/69) — [manifeste des trois candidats](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/65e3c378b8dd4469a053eafff6a5ae4d5a9669e1/docs/development/covenant-sprites-20261126/manifest.json). Deux demandes n'ont créé aucun fichier : `neomorph-juvenile-hallett.png` et `xenomorph-covenant-idle.png`. La nouvelle série contient exactement trois PNG, soit 4 414 495 octets, sans intégration en jeu ni fidélité 1:1 certifiée.

Corpus d'archive repéré : `archives/local-recovery-20261125/alien-covenant/`. Voir la [branche d'archives épinglée](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125/alien-covenant/).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D14`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Support/matière/contact par seuil ; embarquement de berge distinct d'une porte.
- Pièce blanche séparée ; Origae-6 non inventée comme lieu visité ; lander condamné selon chronologie.
- Walter intact/amputé, David sanctuaire et David sous apparence Walter distincts.
- Quatre armes manipulables ; SL40 représenté sans projectile inventé.

## Écarts concrets encore ouverts

- **ALIEN-COVENANT-01** — 74 références cinéma sans correspondance dans le registre source.
- **ALIEN-COVENANT-02** — Cabine cargo lifter, volumes de lancement/amarrage, états biologiques et équipements particuliers partiels.
- **ALIEN-COVENANT-03** — Visages, plans cotés et chorégraphies non certifiés.

## Reprise artistique et intégration

1. Toute génération doit indiquer Covenant explicitement, conformément à la correction utilisateur du 26 novembre.
2. Prioriser les profils actifs distincts et les équipements déjà raccordés ; conserver apparence Walter après révélation.
3. Les données de jeu (munitions/dégâts) ne deviennent pas des spécifications canoniques.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Raccord V0.11 et limites de scènes

[PR #71 brouillon](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71), head `aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9` : **49 PNG**, dont 48 nouveaux et 1 réemploi. Le catalogue comprend 25 variantes humaines pour 23 profils, 4 poses de créatures et 20 éléments d’accessoires/EVA/mobilier/véhicules/spécimens. **29 PNG sont admis dans leurs contextes ; 20 restent au catalogue.** Le [registre et les limites](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9/docs/covenant/SPRITES_V011_STATUS.md) priment sur ce résumé.

- Walter blessé perd sa main anatomique gauche : son PNG n’est pas retourné horizontalement. Le sens inverse conserve le rendu existant.
- Oram du pont et Karine du terrain gardent leurs tenues propres. Les variantes `oram-field` et `karine-medical` restent distinctes ; une tenue de scène différente ne remplace pas le profil actif.
- Daniels en EVA souple et Tennessee en Big Yellow sont deux équipements distincts. Le piano et le thé sont limités au prologue blanc ; le support du service à thé demeure celui du décor.
- Le Cargo Lifter ne remplace que `plaza`, pas la grue active de `lifter`. Le caisson ouvert reste limité à `cryo`, sans substitution des caissons fermés des colons.
- Une pose aux mains libres ne remplace pas un PNJ armé ; les profils concernés conservent leur renderer. Les créations de catalogue sans consommateur restent hors distribution.

Les sept familles `weapon-f90`, `weapon-beretta`, `weapon-ar15`, `weapon-shotgun`, `weapon-inox`, `weapon-sl40`, `weapon-eaa`, les poses `xenomorph`/`xenomorph-attack` et `prop-classicalstatue` restent sans PNG après refus ou sujet lié. Les cycles marche/course/arme/rechargement/impact/mort ne sont pas produits. **37/50 familles d’objets candidats n’ont pas de PNG** ; 13 ont une variante, 11 une variante admise. Ces nombres ne couvrent pas automatiquement les 630 occurrences des 126 familles de décors/mécanismes.

Le [workflow Covenant](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45755581619) est réussi sur ce head. La CI globale n’est pas déclarée entièrement verte : au relevé, trois jobs V163 (`weapons-title`, `trials`, `rigs-v165`) échouent et `release` est annulé. Le [reçu de provenance](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9/docs/covenant/PROVENANCE_V011.json) conserve son état antérieur de contrôle autonome ; le résultat hôte plus récent reste attaché à la PR et au workflow. La présente reprise ne rejoue pas ces essais.

## Documents examinés

- `docs/CODEX_LEVEL_DESIGN_COVENANT.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
