# La Mer des Chagrins — bible de complétion des huit domaines

**Édition 0.10.3 : 126 PNG et 239 fiches détaillées.** Les cinq ajouts et leur niveau de vérification sont décrits dans la section de continuation ; le recensement de référence ci-dessous reste épinglé au checkpoint précédent.

**Référence : édition visuelle 0.10.2, PR #58, commit `ff6d538b32f9eb8946f2d296df1b790bf479eef9`.** Ce complément recense les définitions et les images réellement présentes à ce checkpoint, puis détaille le travail restant pour personnages, lieux, armes, props, véhicules, vaisseaux, terrain et planètes. Le roman intégral n’a pas été confronté : le recensement de toutes ses omissions et la fidélité globale 1:1 restent ouverts.

La [version structurée](BIBLE_COMPLETION_20261126.json) conserve les placements exacts, les portails, les conditions, les sources par fiche et les empreintes des 121 PNG. Le [guide d’intégration](INTEGRATION.md) reste l’entrée du jeu et de ses validations. Ce complément préserve les fichiers du module original.

## Lire les décomptes

| Mesure au checkpoint | Nombre | Portée |
| --- | ---: | --- |
| PNG distincts | 121 | 237 861 570 octets ; chaque image n’est comptée qu’une fois malgré ses réutilisations. |
| Profils humains | 17 | 15 noms + 2 composites ; 16 identités illustrées et 24 PNG d’identités/poses. |
| Placements statiques humains | 13 | 10 identités ; Decker et Manning ont des chemins propres de joueur/compagnon. |
| Salles | 50 | Pièces du jeu dont 10 annexes originales ; ce ne sont pas 50 stages PNG complets. |
| Liaisons / seuils | 59 / 113 | 54 réciproques + 5 transferts narratifs ; 5 arrivées sans retour actif. |
| Décors / obstacles placés | 355 / 120 | Occurrences de modules, distinctes des fichiers uniques. |
| Populations initiales | 40 | 35 adultes, 3 facehuggers, 1 reine, 1 adulte de capture ; captureAdult est un rôle, pas une nouvelle espèce. |
| Armes | 7 | 5 jouables et 2 références narratives ; chiffres de jeu séparés du canon. |
| Concepts d’équipement | 14 | Incluent une mention encore à vérifier ; illustration d’interface distincte du geste. |
| Familles de terrain | 22 | Valeurs room.kind effectivement présentes. |
| Fiches de production | 239 | 29 personnages/variantes, 50 lieux, 7 armes, 119 props, 5 véhicules, 5 vaisseaux, 22 terrains et 2 planètes. |

Le manifeste de référence déclare 117 raccordements de monde et quatre images d’interface. Cela ne signifie pas 117 sprites observés dans chaque parcours : Silas, Muller, Dave et Pritchett ont un portrait mais aucun placement `room.cast` dans les 50 salles. Les mesures de rendu restent celles du reçu qui les a réellement observées.

## Édition 0.10.3 — ajouts de cette publication

**126 PNG individuels, 246 478 952 octets** : les 121 du checkpoint et cinq nouvelles sources inchangées. Les métadonnées actuelles sont dans [SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), les prompts exacts dans [GENERATION_0_10_3.json](GENERATION_0_10_3.json), les preuves dans [VALIDATION_0_10_3.json](VALIDATION_0_10_3.json).

| Identifiant | Raccord livré | Qualification |
| --- | --- | --- |
| `creatures/queen` | Reine fixe raccordée au kind queen, pivot aux pieds et hauteur425. Cadavre natif conservé ; morphologie filmique adaptée, cycles et mécanisme des trois attaches non clôturés. | Placement fixe observé dans les fixtures Canvas ; parcours complet non certifié. |
| `weapons/flame` | Lance-flammes raccordé à l'arme native et à l'armurerie ; grip primaire et bouche mesurés dans les deux sens. La crosse dépasse le dos dans certaines poses ; seconde main et occlusion restent à corriger. Aucun nouveau cycle de recharge n'est produit. Arme originale au projet. | Placement fixe observé dans les fixtures Canvas ; parcours complet non certifié. |
| `characters/carlyle-physician` | Sprite du médecin anonyme utilisé pour le cast medic en s03 seulement. Le profil composite, ses portraits et ses usages dans les autres salles restent distincts. | Placement fixe observé dans les fixtures Canvas ; parcours complet non certifié. |
| `characters/decker-medical-gown` | Variante fixe non armée de Decker en s03 ; aucune mutation de santé, d'inventaire, de collision ou de sauvegarde. La tenue normale reprend hors de ce contexte. | Placement fixe observé dans les fixtures Canvas ; parcours complet non certifié. |
| `objectives/icc-handheld` | Appareil posé sur le pupitre natif de o02-01 avant achèvement, en conservant marqueur, action et état terminé. Les autres consoles ne sont pas remplacées. | Placement fixe observé dans les fixtures Canvas ; parcours complet non certifié. |

Les demandes `creatures/adult` et `weapons/plasma` ont été refusées : aucun fichier n’est compté pour ces deux images. Le rôle `captureAdult` utilise l’alias adulte lorsqu’une image sera disponible et garde actuellement son rendu natif. Les cadavres adulte/reine restent des états graphiques distincts.

La suite ciblée finale réussit **87/87**. La QA Canvas charge 126 images et dessine les 50 salles dans des états préparés. 
Les cinq placements ont été inspectés sur les captures de cette édition. Cela ne certifie ni une campagne jouée dans un navigateur, ni un cycle d’animation complet.

**Les tableaux et les descriptions « au checkpoint » ci-dessous restent le relevé historique 0.10.2 à 121 PNG.** Les cinq fiches concernées portent un ajout « Édition 0.10.3 » et le JSON conserve les deux états distincts. Les preuves de publication distante et de CI sont consignées dans la [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58).

## Sources et continuités

Les preuves primaires n’authentifient que ce qu’elles décrivent. Le chapitre 4 précise le Carlyle et la consultation médicale. L’échantillon Audible constitue une preuve de la dramatique audio, dont Kiangya, Piotrowicz et le crawler demeurent une couche optionnelle jusqu’à comparaison du roman. Les visages des interprètes ne sont pas des portraits canoniques.

| ID | Niveau / continuité | Référence et portée |
| --- | --- | --- |
| `titan` | primary / roman_2014 | [Titan Books — notice du roman](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/) — Decker, ICC, New Galveston/LV-178, sables toxiques, mission de capture. |
| `excerpt` | primary-excerpt / roman_2014 | [Extrait public du chapitre 5, Gizmodo](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409) — Chicago ; bureau de Harriman ; début 2497. |
| `manning` | secondary / roman_2014 | [Xenopedia — Manning](https://avp.fandom.com/wiki/Manning) — Carrure, cheveux noirs grisonnants ; chef mercenaire. |
| `adams` | secondary / roman_2014 | [Xenopedia — Adams](https://avp.fandom.com/wiki/Adams) — Peau hâlée, auburn court, taches de rousseur. |
| `rollins` | secondary / roman_2014 | [Xenopedia — Andrea Rollins](https://avp.fandom.com/wiki/Andrea_Rollins) — Mandataire, cheveux bruns ; apparence détaillée non recoupée. |
| `reaper` | secondary / roman_2014 | [Xenopedia — Reaper (désambiguïsation)](https://avp.fandom.com/wiki/Reaper) — Reaper : pistolet du roman. |
| `plasma` | secondary / roman_2014 | [Xenopedia — Plasma Rifle](https://avp.fandom.com/wiki/Plasma_Rifle) — Modèle 50 Watt, distinct des armes des autres jeux. |
| `plasma-description` | secondary / roman_2014 | [Yautja Encyclopedia — armement humain](https://yautjaencyclope.altervista.org/weapons-human.html) — Canon court, trois cellules, modes de tir, risque thermique. Données à confronter au roman. |
| `plot` | secondary / roman_2014 | [AvP Central — dossier Sea of Sorrows](https://www.avpcentral.com/alien-sea-of-sorrows) — Rôles et séquences générales : chantier, mine, fouilles, reine, hôtes, navette, consigne. Résumé secondaire, pas texte intégral. |
| `decker` | secondary / roman_2014 | [AvP Central — Alan Decker](https://www.avpcentral.com/alan-decker) — Inspection civile et blessures ; pas de portrait officiel confirmé. |
| `NOVEL-CH04` | primary-authorized-excerpt / roman_2014 | [James A. Moore, chapitre 4 Adrift — extrait JoBlo](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/) — Carlyle, médecin anonyme, tenue médicale, dossier papier, gobelets et appareil portable de rapport. |
| `AUDIO-SAMPLE` | primary-audio-script / audio_dirk_maggs_optional | [Audible — échantillon officiel du script Dirk Maggs, 13 pages](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf) — Variante audio : Kiangya, Piotrowicz, crawler et équipe de relevé. |
| `PROJECT-CAMPAIGN` | project-primary / project | [Campagne et placements originaux](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json) — 50 salles, 59 liaisons, 113 seuils, populations et objectifs. |
| `PROJECT-FIDELITY` | project-primary / project | [Registre de fidélité original](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json) — Profils, concepts d'armement et d'équipement, limites. |
| `PROJECT-ART` | project-primary / project | [Manifeste artistique 0.10.2](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json) — 121 PNG et provenance, raccordements et mesures. |
| `PROJECT-RUNTIME` | project-primary / project | [Adaptateur Canvas 0.10.2](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js) — Sélection des images et états de repli. |
| `PROJECT-CORE` | project-primary / project | [Simulation de la campagne 0.10.0](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js) — Règles, possessions, états, combat, capture et sauvegarde. |

Les références secondaires héritées ne sont pas promues en preuves primaires. Les plans locaux, unités de jeu, couleurs, visages, annexes et trois attaches de reine conservent leur origine d’adaptation. Markowitz et Herschel, cités dans une limite du registre ancien, demandent leur propre passage avant production ; ils ne remplacent pas le médecin anonyme.

## Architecture et connexions

Le contrôle documentaire retrouve toutes les destinations, les multiplicités attendues des 59 paires et une raison structurelle pour chacun des 113 seuils. **Il ne constitue pas une traversée physique jouée.** Les coordonnées, verrouillages, types, supports et arrivées sont conservés dans les fiches JSON.

| Type de passage | Occurrences |
| --- | ---: |
| `boarding` | 2 |
| `boarding-ramp` | 2 |
| `building-entrance` | 2 |
| `bulkhead` | 58 |
| `crawl-opening` | 2 |
| `exterior-path` | 4 |
| `interlude` | 1 |
| `lift-cage` | 2 |
| `rock-breach` | 30 |
| `stairwell` | 6 |
| `transit` | 2 |
| `urban-transit` | 2 |

Le cadre et le panneau PNG conviennent seulement aux baies industrielles compatibles. Roche, rampe, cage, escalier et ellipse narrative gardent leur nature. Chaque nouvelle représentation doit préserver support architectural, ouverture visible, interaction accessible, arrivée libre, groupe et état de sauvegarde.

## Personnages, créatures et variantes — 29 fiches

### MER-PERS-decker — Alan Decker

Inspecteur ICC, civil

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `characters/decker-crouch-ready`, `characters/decker-crouch`, `characters/decker-dodge-ready`, `characters/decker-dodge`, `characters/decker-ready`, `characters/decker-walk-a`, `characters/decker-walk-b`, `characters/decker`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Fonction ICC confirmée par Titan. Visage, yeux, coiffure et mesures non vérifiés.

**Qualification.** documented-role-incomplete-appearance. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Fonction ICC confirmée par Titan. Visage, yeux, coiffure et mesures non vérifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les deux contacts de marche puis course, visée, tir, recharge, interaction et franchissements réellement disponibles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · visual** — Recaler la seconde main et les proportions entre repos, accroupi, esquive et tenue d'arme longue. **À vérifier :** Attaches mesurées et anatomie cohérente dans les deux directions, sans modifier le collider.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-manning — Manning

Chef mercenaire

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`. Images : `characters/manning-ready`, `characters/manning`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Cheveux noirs grisonnants et forte carrure : notice Xenopedia. Tenue et visage interprétés.

**Qualification.** documented-role-incomplete-appearance. Références : [manning](https://avp.fandom.com/wiki/Manning), [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Cheveux noirs grisonnants et forte carrure : notice Xenopedia. Tenue et visage interprétés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Marche, arrêt, tir et reprise du compagnon ; les deux images présentes ne sont pas des cycles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Documenter précisément sa participation à la capture finale avant de la reconstruire. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-adams — Adams

Mercenaire puis porteuse

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s09`, `s12`. Images : `characters/adams`, `stretchers/adams`, `parasites/royal`.

**Placement.** `s09` : objectif 0 inclus à 9 exclu ; `s12` : objectif 0 inclus à 15 exclu

**Description et limite héritées.** Peau hâlée, cheveux auburn courts et taches de rousseur : notice Xenopedia. Parasite adhérent royal, plus volumineux et à doigts palmés : notice secondaire ; échelle graphique interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [adams](https://avp.fandom.com/wiki/Adams), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Peau hâlée, cheveux auburn courts et taches de rousseur : notice Xenopedia. Parasite adhérent royal, plus volumineux et à doigts palmés : notice secondaire ; échelle graphique interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — États vivants nécessaires, transport, halte et arrimage avec maintien du parasite. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · visual** — Rapprocher l'identité debout, le portrait et le patient transporté. **À vérifier :** Attache au visage et contamination cohérentes jusqu'à la stase.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-elway — Elway

Mercenaire puis porteur

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s10`. Images : `characters/elway`, `stretchers/elway`, `parasites/normal`.

**Placement.** `s10` : objectif 0 inclus à 10 exclu

**Description et limite héritées.** Rôle de porteur recoupé. Apparence non vérifiée.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Rôle de porteur recoupé. Apparence non vérifiée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — États vivants nécessaires, transport, halte et arrimage avec maintien du parasite. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · visual** — Rapprocher l'identité debout, le portrait et le patient transporté. **À vérifier :** Attache au visage et contamination cohérentes jusqu'à la stase.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-rollins — Andrea Rollins

Mandataire Weyland-Yutani

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s08`, `s38`. Images : `characters/rollins`.

**Placement.** `s08` : objectif 0 inclus à 8 exclu ; `s38` : objectif 30 inclus à 34 exclu

**Description et limite héritées.** Cheveux bruns indiqués par Xenopedia. Pas de visage emprunté à la comédienne audio ; tenue interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [rollins](https://avp.fandom.com/wiki/Andrea_Rollins), [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Cheveux bruns indiqués par Xenopedia. Pas de visage emprunté à la comédienne audio ; tenue interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-harriman — Walter Harriman

Commission, Chicago

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s04`. Images : `characters/harriman`.

**Placement.** `s04` : objectif 0 inclus à 8 exclu

**Description et limite héritées.** Nom et bureau à Chicago : extrait public. Apparence non vérifiée.

**Qualification.** documented-role-incomplete-appearance. Références : [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Nom et bureau à Chicago : extrait public. Apparence non vérifiée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-rand — Lucas Rand

Chantier de relevés

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s01`. Images : `characters/rand`.

**Placement.** `s01` : objectif 0 inclus à 2 exclu

**Description et limite héritées.** Rôle de chantier : référence secondaire. Apparence interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Rôle de chantier : référence secondaire. Apparence interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-bronson — Bronson

Technicien du chantier

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s02`. Images : `characters/bronson`.

**Placement.** `s02` : objectif 0 inclus à 2 exclu

**Description et limite héritées.** Nom dans le relevé secondaire. Apparence non vérifiée.

**Qualification.** documented-role-incomplete-appearance. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Nom dans le relevé secondaire. Apparence non vérifiée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-badejo — Badejo

Technicien du chantier

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s02`. Images : `characters/badejo`.

**Placement.** `s02` : objectif 0 inclus à 2 exclu

**Description et limite héritées.** Nom dans le relevé secondaire. Aucune apparence déduite du patronyme.

**Qualification.** documented-role-incomplete-appearance. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Nom dans le relevé secondaire. Aucune apparence déduite du patronyme. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-medic — Équipe médicale

Personnel non individualisé

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s03`, `s06`. Images : `characters/medic`.

**Placement.** `s03` : objectif 0 inclus à 33 exclu ; `s06` : objectif 0 inclus à 8 exclu

**Description et limite héritées.** Rôle composite de la mise en scène ; ne remplace pas un portrait de Markowitz ou Herschel.

**Qualification.** original-composite. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · design** — Conserver l'identité composite et ne pas la rebaptiser pour combler une identité nommée. **À vérifier :** Le statut original demeure visible.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-cho — Cho

Relais mercenaire

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s16`. Images : `characters/cho`.

**Placement.** `s16` : objectif 0 inclus à 21 exclu

**Description et limite héritées.** Rôle de relais établi par source secondaire. Apparence non vérifiée ; aucune origine déduite du nom.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Rôle de relais établi par source secondaire. Apparence non vérifiée ; aucune origine déduite du nom. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-silas — Silas

Équipe archéologique

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/silas`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Présence dans le dossier d’incident ; apparition vivante non ajoutée arbitrairement.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Présence dans le dossier d’incident ; apparition vivante non ajoutée arbitrairement. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-muller — Muller

Mercenaire de la remontée

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/muller`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Rôle attesté secondairement ; apparence interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Rôle attesté secondairement ; apparence interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-dave — Dave

Mercenaire de la remontée

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/dave`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Rôle attesté secondairement ; apparence interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Rôle attesté secondairement ; apparence interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-pritchett — Pritchett

Pilote de la navette

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/pritchett`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Pilote cité ; mort scénarisée détaillée non reconstituée dans cette passe.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Pilote cité ; mort scénarisée détaillée non reconstituée dans cette passe. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-cherbourg — Cherbourg

Commandement du transport

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s39`. Images : `characters/cherbourg`.

**Placement.** `s39` : objectif 31 inclus à 34 exclu

**Description et limite héritées.** Nom dans le relevé secondaire. Apparence et uniforme non vérifiés.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Nom dans le relevé secondaire. Apparence et uniforme non vérifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-worker — Personnel

Figuration composite

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Figuration originale.

**Qualification.** original-composite. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · design** — Conserver l'identité composite et ne pas la rebaptiser pour combler une identité nommée. **À vérifier :** Le statut original demeure visible.
- **P2 · visual** — Aucun PNG dédié : ce profil sert de repli humain natif. **À vérifier :** Produire seulement si une scène requiert une figuration individualisée.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-adult — Adulte xénomorphe

Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s34`, `s35`, `s36`, `s48`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `generation-refused-native-fallback`.

**Qualification.** adaptation-specific-body-unverified. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P0 · visual** — Le PNG correspondant est absent au checkpoint. **À vérifier :** Corps entier, alpha, pivot et raccord au kind exact ; repli natif disponible.
- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG de cadavre correspondant. **À vérifier :** Conserver le cadavre natif jusqu'à production d'un état de mort distinct.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-queen — Reine

Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s33`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Reine fixe raccordée au kind queen, pivot aux pieds et hauteur425. Cadavre natif conservé ; morphologie filmique adaptée, cycles et mécanisme des trois attaches non clôturés. Source : [creatures/queen.png](../../dlc/sea-of-sorrows-visual/sprites/creatures/queen.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** adaptation-specific-body-unverified. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P0 · visual** — Le PNG correspondant est absent au checkpoint. **À vérifier :** Corps entier, alpha, pivot et raccord au kind exact ; repli natif disponible.
- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG de cadavre correspondant. **À vérifier :** Conserver le cadavre natif jusqu'à production d'un état de mort distinct.
- **P1 · narrative** — Réexaminer les trois attaches du boss, mécanisme original. **À vérifier :** Conserver son étiquette d'adaptation ou proposer une scène attestée avec reprise compatible.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-facehugger — Facehugger libre

Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s32`, `s50`. Images : `creatures/facehugger`, `corpses/facehugger`.

**État de production.** `baseline`.

**Qualification.** adaptation-specific-body-unverified. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-captureAdult — Adulte de capture

Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s37`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `baseline`.

**Qualification.** adaptation-specific-body-unverified. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P0 · visual** — Rôle de simulation distinct, même adulte biologique : définir explicitement l'alias de présentation, sans inventer une espèce. **À vérifier :** Corps entier, alpha, pivot et raccord au kind exact ; repli natif disponible.
- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG de cadavre correspondant. **À vérifier :** Conserver le cadavre natif jusqu'à production d'un état de mort distinct.
- **P0 · integration** — L'alias ne doit modifier ni identité, ni vie, ni échec à la mort du spécimen. **À vérifier :** La capture reste conditionnée à un adulte vivant, immuable comme acteur.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-parasite-normal — Parasite adhérent normal

Superposition au visage du patient ; distinct du facehugger libre.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stretcher / stasisDisplay`. Salles concernées : `s34`, `s35`, `s36`, `s37`, `s38`. Images : `parasites/normal`.

**Qualification.** secondary-detail-project-scale. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Forme et rapport d'échelle détaillés à confronter au texte ; 1,27 est un réglage du projet. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Mouvements respiratoires ou doigts seulement si utiles et lisibles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Maintenir la contamination ; une seule application de l'échelle. Vérifier l'attache sur le patient.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-parasite-royal — Parasite adhérent royal

Superposition au visage du patient ; distinct du facehugger libre.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stretcher / stasisDisplay`. Salles concernées : `s34`, `s35`, `s36`, `s37`, `s38`. Images : `parasites/royal`.

**Qualification.** secondary-detail-project-scale. Références : [adams](https://avp.fandom.com/wiki/Adams), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Forme et rapport d'échelle détaillés à confronter au texte ; 1,27 est un réglage du projet. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Mouvements respiratoires ou doigts seulement si utiles et lisibles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Maintenir la contamination ; une seule application de l'échelle. Vérifier l'attache sur le patient.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-egg — Œuf xénomorphe

Élément de ponte distinct de la population adulte.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.egg`. Salles concernées : `s32`, `s33`. Images : `organic/egg`, `decor/eggs`.

**Qualification.** adaptation-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Apparence, dimensions et marquages sans référence primaire précise. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Créer ouvert/fermé et transition seulement si un déclenchement d'éclosion existe ; une image fixe ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Associer l'image à l'état natif du danger.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-carlyle-physician — Médecin anonyme du Carlyle

Identité non nommée du chapitre 4 ; distincte du composite médical.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Sprite du médecin anonyme utilisé pour le cast medic en s03 seulement. Le profil composite, ses portraits et ses usages dans les autres salles restent distincts. Source : [characters/carlyle-physician.png](../../dlc/sea-of-sorrows-visual/sprites/characters/carlyle-physician.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** primary-described-appearance-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travail restant et critère de clôture :**

- **P0 · visual** — Source générée : blouse blanche, chignon brun grisonnant, lunettes, corpulence forte ; visage exact interprété. **À vérifier :** Comparer les traits décrits, mesurer pivot et silhouette puis vérifier les octets publiés.
- **P0 · integration** — Raccorder au seul contexte médical s03 ; conserver medic ailleurs. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Posture de consultation et geste vers le dossier ; le sprite fixe ne fournit pas ces cycles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Ne lui attribuer ni Markowitz ni Herschel. Vérifier s03 et s06 pour empêcher un remplacement global.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-decker-medical-gown — Decker — tenue hospitalière du Carlyle

Variante de Decker ; aucune nouvelle identité.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Variante fixe non armée de Decker en s03 ; aucune mutation de santé, d'inventaire, de collision ou de sauvegarde. La tenue normale reprend hors de ce contexte. Source : [characters/decker-medical-gown.png](../../dlc/sea-of-sorrows-visual/sprites/characters/decker-medical-gown.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** primary-costume-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travail restant et critère de clôture :**

- **P0 · visual** — Source générée de la tenue hospitalière ; coupe, matière et portrait restent l'interprétation du projet. **À vérifier :** Pivot et proportions compatibles ; mesurer et vérifier les octets publiés.
- **P0 · integration** — Limiter le costume à s03 et conserver la présentation normale ailleurs. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Assis/allongé et lever si la scène est développée ; le sprite debout ne les prouve pas. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Ne changer ni inventaire, ni santé, ni collision. Vérifier le retour au costume normal.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-check-markowitz — Markowitz

Nom cité par une limite du registre historique, sans preuve primaire relue dans cette passe.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `blocked-by-reference`.

**Qualification.** unverified-historical-name. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Résoudre rôle, scène et statut dans le texte primaire avant portrait ou placement. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Ne pas rebaptiser le médecin anonyme ou le composite.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json).

### MER-PERS-check-herschel — Herschel

Nom cité par une limite du registre historique, sans preuve primaire relue dans cette passe.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `blocked-by-reference`.

**Qualification.** unverified-historical-name. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Résoudre rôle, scène et statut dans le texte primaire avant portrait ou placement. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Ne pas rebaptiser le médecin anonyme ou le composite.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json).

### MER-PERS-audio-piotrowicz — Piotrowicz

Rôle de la dramatique audio ; aucune incorporation automatique au parcours roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Définir une variante audio avant production. **À vérifier :** La version et la scène gardent leur provenance.
- **P1 · reference** — Apparence non décrite ; ne pas utiliser l'interprète comme portrait officiel. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Hors du compte des omissions certifiées du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json).

## Lieux et connexions — 50 fiches

Les cinquante salles existent déjà. Les travaux portent sur leur représentation, leurs états/scènes et leur validation ; ils ne déclarent pas le graphe absent.

| Salle | Territoire / famille | Sorties | Modules PNG associés |
| --- | --- | --- | ---: |
| `s01` — Poste de contrôle | New Galveston · LV-178 / sand | `s02` (exterior-path) | 9 |
| `s02` — Le carottier | New Galveston · LV-178 / sand | `s01` (exterior-path), `s03` (transit) | 11 |
| `s03` — Transport sanitaire | Transit sanitaire / medical | `s04` (transit) | 7 |
| `s04` — Commission · bureau de Harriman | Terre · Chicago / office | `s05` (urban-transit), `s06` (bulkhead) | 10 |
| `s05` — Appartement de Decker | Terre · Chicago / home | `s04` (urban-transit), `s07` (interlude) | 6 |
| `s06` — Consultation · retour sur Terre | Terre · Chicago / medical | `s04` (bulkhead) | 10 |
| `s07` — Coursive sous garde | Transport contractuel Weyland-Yutani / ship | `s08` (bulkhead) | 5 |
| `s08` — La salle d’entretien | Transport contractuel Weyland-Yutani / office | `s07` (bulkhead), `s09` (bulkhead) | 10 |
| `s09` — Réserve d’équipement | Transport contractuel Weyland-Yutani / armory | `s08` (bulkhead), `s10` (bulkhead) | 11 |
| `s10` — Baie d’embarquement | Transport contractuel Weyland-Yutani / hangar | `s09` (bulkhead), `s11` (boarding) | 9 |
| `s11` — Aire d’atterrissage | New Galveston · LV-178 / sand | `s12` (building-entrance), `s36` (exterior-path), `s37` (boarding-ramp), `s46` (building-entrance) | 9 |
| `s12` — Abri d’expédition · Quonset | New Galveston · LV-178 / camp | `s11` (bulkhead), `s13` (bulkhead) | 11 |
| `s13` — Décontamination | New Galveston · LV-178 / decon | `s12` (bulkhead), `s14` (bulkhead), `s41` (bulkhead) | 8 |
| `s14` — Tête de puits | New Galveston · LV-178 / lift | `s13` (bulkhead), `s15` (lift-cage) | 8 |
| `s15` — Recette de l’ancienne mine | New Galveston · LV-178 / lift | `s14` (lift-cage), `s16` (bulkhead) | 10 |
| `s16` — Relais de Cho | New Galveston · LV-178 / relay | `s15` (bulkhead), `s17` (bulkhead), `s19` (bulkhead) | 10 |
| `s17` — Atelier de maintenance | New Galveston · LV-178 / workshop | `s16` (bulkhead), `s18` (bulkhead), `s42` (bulkhead), `s47` (bulkhead) | 15 |
| `s18` — Galerie d’alimentation | New Galveston · LV-178 / power | `s17` (bulkhead), `s19` (bulkhead), `s42` (bulkhead), `s48` (bulkhead) | 8 |
| `s19` — La carène enfouie | New Galveston · LV-178 / derelict | `s18` (rock-breach), `s16` (rock-breach), `s20` (rock-breach), `s21` (stairwell) | 10 |
| `s20` — Brèche de coque | New Galveston · LV-178 / alien | `s19` (rock-breach), `s26` (rock-breach) | 8 |
| `s21` — Tranchée de fouille | New Galveston · LV-178 / ruins | `s19` (stairwell), `s22` (rock-breach), `s43` (rock-breach) | 10 |
| `s22` — Esplanade ensevelie | New Galveston · LV-178 / ruins | `s21` (rock-breach), `s23` (rock-breach), `s24` (rock-breach) | 8 |
| `s23` — Salle des restes | New Galveston · LV-178 / ossuary | `s22` (rock-breach), `s24` (crawl-opening) | 6 |
| `s24` — Poste de relevés | New Galveston · LV-178 / relay | `s22` (bulkhead), `s23` (crawl-opening), `s25` (bulkhead) | 11 |
| `s25` — Passerelle suspendue | New Galveston · LV-178 / bridge | `s24` (bulkhead), `s26` (bulkhead) | 7 |
| `s26` — Entrée des tubes | New Galveston · LV-178 / silica | `s25` (rock-breach), `s20` (rock-breach), `s27` (rock-breach) | 9 |
| `s27` — Le nœud ambré | New Galveston · LV-178 / silica | `s26` (rock-breach), `s28` (rock-breach), `s29` (rock-breach) | 9 |
| `s28` — Alcôve des disparus | New Galveston · LV-178 / hive | `s27` (rock-breach), `s29` (rock-breach) | 6 |
| `s29` — Le retour fermé | New Galveston · LV-178 / silica | `s28` (rock-breach), `s27` (rock-breach), `s30` (rock-breach), `s44` (rock-breach) | 10 |
| `s30` — Ascenseur secondaire | New Galveston · LV-178 / lift | `s29` (bulkhead), `s31` (bulkhead) | 12 |
| `s31` — Pied de l’escalier | New Galveston · LV-178 / stairs | `s30` (bulkhead), `s32` (bulkhead), `s34` (bulkhead), `s44` (bulkhead) | 9 |
| `s32` — Chambre des œufs | New Galveston · LV-178 / hive | `s31` (rock-breach), `s33` (rock-breach) | 10 |
| `s33` — La pondeuse | New Galveston · LV-178 / queen | `s32` (rock-breach), `s34` (rock-breach) | 8 |
| `s34` — Dérivation de secours | New Galveston · LV-178 / power | `s33` (bulkhead), `s31` (bulkhead), `s35` (stairwell) | 11 |
| `s35` — Paliers supérieurs | New Galveston · LV-178 / stairs | `s34` (stairwell), `s36` (stairwell), `s45` (bulkhead), `s49` (bulkhead) | 8 |
| `s36` — Ravin de service | New Galveston · LV-178 / sand | `s35` (stairwell), `s11` (exterior-path) | 11 |
| `s37` — Soute de la navette | New Galveston · LV-178 / hangar | `s11` (boarding-ramp), `s38` (boarding) | 13 |
| `s38` — Consigne cryogénique W-Y | Transport contractuel Weyland-Yutani / medical | `s39` (bulkhead) | 12 |
| `s39` — Poste d’observation | Transport contractuel Weyland-Yutani / ship | `s38` (bulkhead), `s40` (bulkhead) | 10 |
| `s40` — Hypersommeil | Transport contractuel Weyland-Yutani / medical | `s39` (bulkhead) | 6 |
| `s41` — Local des filtres | New Galveston · LV-178 / decon | `s13` (bulkhead) | 6 |
| `s42` — Pompes de desserte | New Galveston · LV-178 / power | `s17` (bulkhead), `s18` (bulkhead) | 11 |
| `s43` — Belvédère de fouille | New Galveston · LV-178 / ruins | `s21` (rock-breach) | 8 |
| `s44` — Conduit de retour | New Galveston · LV-178 / silica | `s29` (rock-breach), `s31` (rock-breach) | 7 |
| `s45` — Infirmerie de secours | New Galveston · LV-178 / medical | `s35` (bulkhead), `s50` (bulkhead) | 10 |
| `s46` — Poste de guidage | New Galveston · LV-178 / relay | `s11` (bulkhead) | 8 |
| `s47` — Vestiaire des équipes | New Galveston · LV-178 / workshop | `s17` (bulkhead), `s48` (bulkhead) | 10 |
| `s48` — Cour des échangeurs | New Galveston · LV-178 / power | `s47` (bulkhead), `s18` (bulkhead) | 10 |
| `s49` — Transit des blessés | New Galveston · LV-178 / medical | `s35` (bulkhead), `s50` (bulkhead) | 10 |
| `s50` — Magasin de la remontée | New Galveston · LV-178 / workshop | `s49` (bulkhead), `s45` (bulkhead) | 11 |

### MER-LIEU-s01 — Poste de contrôle

Des herbes rases butent sur une bande de sable noir. Le poste reste relié à la voie de service.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s01`. Images : `decor/checkpoint`, `decor/fence`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/rand`, `equipment/archive`.

**Implantation.** Largeur 1960 unités de jeu ; projection `DEPTH`. Portique de surveillance ; bornes météo ; clôture ouverte ; câbles enterrés ; traces de chenilles. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-01-a` → `s02` : Continuité du terrain au bord droit ; pas de porte industrielle isolée.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste de contrôle ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s02 — Le carottier

Le forage repose sur une plateforme dissymétrique au-dessus des tubes de silice. Une passerelle permet de contourner la machine.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s02`. Images : `decor/drill`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/bronson`, `characters/badejo`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2240 unités de jeu ; projection `DEPTH`. Carottier ancré ; vérins ; caisse de prélèvement ; manche à air ; balises de périmètre. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o01-01` — Relever le carottier (sample).

**Connexions.** `link-01-b` → `s01` : Continuité du terrain au bord gauche ; pas de porte industrielle isolée. `link-02-a` → `s03` : Point de départ médical au bord droit ; transfert narratif, pas de couloir continu.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Le carottier ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s03 — Transport sanitaire

Une courte cabine pressurisée : couchette à gauche, terminal médical au centre, sas à droite.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s03`. Images : `decor/medical`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `characters/medic`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1580 unités de jeu ; projection `SIDE`. Couchette ; moniteur ; écran de télémétrie ; rangement mural ; hublot oblong. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o02-01` — Transmettre les résultats (analyse).

**Connexions.** `link-03-a` → `s04` : Point de départ médical au bord droit ; transfert narratif, pas de couloir continu.

**Arrivées seules.** `link-02-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travail restant et critère de clôture :**

- **P0 · integration** — Rattacher Carlyle et les trois présentations médicales au seul contexte s03, avec o02-01 inchangé. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Transport sanitaire ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s04 — Commission · bureau de Harriman

Les guichets ouvrent sur une salle de consultation. Les fenêtres montrent la ville et non le chantier minier.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s04`. Images : `decor/office`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/harriman`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1960 unités de jeu ; projection `HYBRID`. Bureaux ; imprimante ; casiers ; rangements documentaires ; baie sur les voies urbaines. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o03-01` — Déposer les conclusions (terminal).

**Connexions.** `link-04-a` → `s05` : Accès au transport urbain au bord droit ; stations distinctes, pas de pièce adjacente. `link-05-a` → `s06` : Ouverture dans la paroi latérale gauche.

**Arrivées seules.** `link-03-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Commission · bureau de Harriman ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s05 — Appartement de Decker

Un logement habité, pas une arène. Des affaires familiales occupent le fond ; une circulation libre mène au terminal personnel.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s05`. Images : `decor/home`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1800 unités de jeu ; projection `SIDE`. Table ; assises ; rangement bas ; dessins ; terminal familial ; fenêtre sur la rue. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o03-03` — Écouter le message familial (message).

**Connexions.** `link-04-b` → `s04` : Accès au transport urbain au bord gauche ; stations distinctes, pas de pièce adjacente. `link-06-a` → `s07` : Départ de séquence au bord droit ; changement de lieu ou de temps clairement identifié.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Appartement de Decker ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s06 — Consultation · retour sur Terre

Le cabinet médical est relié à la Commission par la circulation publique. Un écran isole la table d’examen.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s06`. Images : `decor/medical`, `decor/wash`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/medic`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1660 unités de jeu ; projection `HYBRID`. Table d’examen ; rideau ; analyseur ; lave-mains ; dossier patient. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o03-02` — Passer les examens (medical).

**Connexions.** `link-05-b` → `s04` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Consultation · retour sur Terre ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s07 — Coursive sous garde

Une coursive surveillée relie l’infirmerie à la salle d’entretien. Les portes de service ne mènent pas à un autre monde.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s07`. Images : `decor/seal-equipment`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`.

**Implantation.** Largeur 1720 unités de jeu ; projection `SIDE`. Caméra ; grille de ventilation ; banc fixé ; canalisation ; voyant de verrou. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-07-a` → `s08` : Ouverture dans la paroi latérale droite.

**Arrivées seules.** `link-06-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Coursive sous garde ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s08 — La salle d’entretien

Deux sièges se font face, séparés par une console. Le vitrage laisse voir les coursives du bord.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s08`. Images : `decor/office`, `decor/briefing`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/rollins`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1760 unités de jeu ; projection `HYBRID`. Console ; deux fauteuils ; écran dossier ; armoire scellée ; vitrage technique. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o04-01` — Écouter Rollins (talk).

**Connexions.** `link-07-b` → `s07` : Ouverture dans la paroi latérale gauche. `link-08-a` → `s09` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de La salle d’entretien ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s09 — Réserve d’équipement

Trois travées stockent l’équipement de l’expédition. Les passages entre les racks permettent de changer de profondeur. Implantation v0.3 : magasins en vis-à-vis. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s09`. Images : `decor/armory`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `characters/adams`, `equipment/archive`, `equipment/supply`, `equipment/armory-rack`, `objectives/console`.

**Implantation.** Largeur 2080 unités de jeu ; projection `DEPTH`. Racks ancrés ; combinaisons ; chargeurs ; malle de filtres ; casiers numérotés. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o04-02` — Récupérer l’équipement (equipment).

**Connexions.** `link-08-b` → `s08` : Ouverture dans la paroi latérale gauche. `link-09-a` → `s10` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Réserve d’équipement ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s10 — Baie d’embarquement

Une rampe et un couloir de sécurité conduisent à la navette. Les volumes au fond ne sont pas jouables.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s10`. Images : `decor/dropship`, `decor/cargo`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/elway`, `equipment/archive`.

**Implantation.** Largeur 2480 unités de jeu ; projection `DEPTH`. Navette ; câbles ombilicaux ; treuil ; chariots ; balises de rampe. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-09-b` → `s09` : Ouverture dans la paroi latérale gauche. `link-10-a` → `s11` : Embarquement au bord droit ; trajet aérien distinct des liaisons pédestres.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Baie d’embarquement ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s11 — Aire d’atterrissage

La même aire sera retrouvée au retour. Le camp reste à l’est et le ravin d’accès au nord. Implantation v0.3 : aire ouverte et ligne de fret. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s11`. Images : `decor/landing`, `decor/antenna`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2560 unités de jeu ; projection `DEPTH`. Dalles prises dans le sable ; balises ; réservoir ; abri radio ; traces de moteurs. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o15-03` — Rallumer la balise d’approche (beacon).

**Connexions.** `link-11-a` → `s12` : Ouverture dans la paroi latérale droite. `link-41-b` → `s36` : Continuité du terrain au bord gauche ; pas de porte industrielle isolée. `link-42-a` → `s37` : Rampe d’embarquement raccordée au bord arrière et au transport. `link-51-a` → `s46` : Baie de premier plan ; linteau atténué à proximité.

**Arrivées seules.** `link-10-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Aire d’atterrissage ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s12 — Abri d’expédition · Quonset

L’abri possède une entrée, une zone de briefing et un passage vers la décontamination.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s12`. Images : `decor/briefing`, `decor/battery`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/adams`, `equipment/archive`, `equipment/supply`, `objectives/console`.

**Implantation.** Largeur 1940 unités de jeu ; projection `HYBRID`. Table de mission ; bancs ; cartes ; thermos ; casiers ; filtre d’air. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o05-01` — Rejoindre le briefing (brief).

**Connexions.** `link-11-b` → `s11` : Ouverture dans la paroi latérale gauche. `link-12-a` → `s13` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Abri d’expédition · Quonset ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s13 — Décontamination

Deux portes encadrent les buses de nettoyage. Les équipements humides restent dans la partie sale.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s13`. Images : `decor/wash`, `decor/filters`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 1760 unités de jeu ; projection `SIDE`. Buses ; caillebotis ; cuve de collecte ; combinaisons ; râtelier de bottes. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o05-02` — Vérifier les filtres (filter).

**Connexions.** `link-12-b` → `s12` : Ouverture dans la paroi latérale gauche. `link-13-a` → `s14` : Ouverture dans la paroi latérale droite. `link-46-a` → `s41` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Décontamination ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s14 — Tête de puits

Une cage d’ascenseur occupe le centre d’un chevalement. La rambarde laisse seulement deux passages balisés. Implantation v0.3 : contour de la cage. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s14`. Images : `decor/hoist-drive`, `decor/winch`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2240 unités de jeu ; projection `DEPTH`. Cage ; poulies ; commandes ; garde-corps ; câble principal ; barrières de bord. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o05-03` — Mettre la cage en service (power).

**Connexions.** `link-13-b` → `s13` : Ouverture dans la paroi latérale gauche. `link-14-a` → `s15` : Palier de cage au bord droit ; changement vertical identifié et arrivée réciproque.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Tête de puits ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s15 — Recette de l’ancienne mine

La cage arrive dans une recette protégée. Les rails sortent vers le relais, loin du bord du puits.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s15`. Images : `decor/hoist-drive`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Cage ; rails ; butoir ; boulonnage ; tuyauteries ; éclairage de secours. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-14-b` → `s14` : Palier de cage au bord gauche ; changement vertical identifié et arrivée réciproque. `link-15-a` → `s16` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Recette de l’ancienne mine ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s16 — Relais de Cho

Le relais distribue les voies de la mine. La radio se trouve contre un mur, sans bloquer les circulations. Implantation v0.3 : baie de relais décalée. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s16`. Images : `decor/antenna`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `characters/cho`, `equipment/archive`, `equipment/supply`, `objectives/console`.

**Implantation.** Largeur 2280 unités de jeu ; projection `DEPTH`. Table radio ; touret ; casiers ; antenne filaire ; lampe ; repères de secteur. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o06-01` — Établir le relais (radio).

**Connexions.** `link-15-b` → `s15` : Ouverture dans la paroi latérale gauche. `link-16-a` → `s17` : Ouverture dans la paroi latérale droite. `link-19-a` → `s19` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Relais de Cho ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s17 — Atelier de maintenance

Un établi, un passage central libre et une remise arrière. Le matériel lourd reste appuyé au sol.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s17`. Images : `decor/workbench`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/locker`, `equipment/locker-open`, `equipment/armory-rack`, `equipment/shutter-control`, `equipment/light-panel`, `devices/parts`.

**Implantation.** Largeur 1960 unités de jeu ; projection `HYBRID`. Établi ; outils ; bouteilles ; chariot ; caisses ; crochets ; établi secondaire. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-16-b` → `s16` : Ouverture dans la paroi latérale gauche. `link-17-a` → `s18` : Ouverture dans la paroi latérale droite. `link-47-a` → `s42` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-54-a` → `s47` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Atelier de maintenance ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s18 — Galerie d’alimentation

Les câbles longent le plafond. Le chemin de service évite les armoires haute tension.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s18`. Images : `decor/generator`, `decor/pump`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2420 unités de jeu ; projection `SIDE`. Armoires ; câbles ; disjoncteurs ; isolateurs ; tuyaux ; porte coupe-feu. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o06-02` — Rétablir la desserte (power).

**Connexions.** `link-17-b` → `s17` : Ouverture dans la paroi latérale gauche. `link-18-a` → `s19` : Ouverture dans la paroi latérale droite. `link-52-b` → `s42` : Baie de premier plan ; linteau atténué à proximité. `link-56-b` → `s48` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Galerie d’alimentation ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s19 — La carène enfouie

La coque apparaît dans une caverne bien plus vaste que le champ de déplacement. La zone de fouille se poursuit en contrebas. Implantation v0.3 : brèche et membrures rompues. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s19`. Images : `decor/carene`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`, `obstacles/rib`, `obstacles/silica-rubble`, `obstacles/resin`, `equipment/archive`, `devices/isolation`.

**Implantation.** Largeur 2880 unités de jeu ; projection `DEPTH`. Coque courbe ; échafaudage ; passerelle ; roche fracturée ; balises humaines. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-18-b` → `s18` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-19-b` → `s16` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-20-a` → `s20` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-21-a` → `s21` : Volée et palier raccordés au bord arrière ; pas un escalier décoratif sans liaison.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de La carène enfouie ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s20 — Brèche de coque

Une ouverture irrégulière suit la peau du vaisseau. Les ajouts humains s’arrêtent aux premiers renflements.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s20`. Images : `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/silica-rubble`, `obstacles/rib`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Arches non humaines ; peau nervurée ; jauges de relevé ; câbles humains temporaires. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o07-01` — Examiner la brèche (scan).

**Connexions.** `link-20-b` → `s19` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-28-a` → `s26` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Brèche de coque ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s21 — Tranchée de fouille

La fouille descend vers la ville ruinée. Les cordes, grilles et repères racontent le travail des chercheurs. Implantation v0.3 : tranchée et tables de fouille. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s21`. Images : `decor/excavator`, `decor/survey`, `decor/resinCable`, `decor/silicaShard`, `obstacles/silica-rubble`, `obstacles/crate`, `obstacles/rack`, `obstacles/rib`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2560 unités de jeu ; projection `DEPTH`. Strates rocheuses ; tamis ; cordes ; boîtes d’échantillons ; piquets ; passerelle. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o07-02` — Retrouver le balisage de fouille (survey).

**Connexions.** `link-21-b` → `s19` : Volée et palier raccordés au bord avant ; pas un escalier décoratif sans liaison. `link-22-a` → `s22` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-48-a` → `s43` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Tranchée de fouille ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s22 — Esplanade ensevelie

Des bâtiments non humains entourent une place partiellement dégagée. Les portes visibles ont des destinations cohérentes. Implantation v0.3 : esplanade à deux contournements. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s22`. Images : `decor/monolith`, `decor/survey`, `decor/resinCable`, `decor/silicaShard`, `obstacles/rib`, `obstacles/resin`, `obstacles/silica-rubble`, `equipment/archive`.

**Implantation.** Largeur 2860 unités de jeu ; projection `DEPTH`. Contreforts ; arches effondrées ; pierres ; éclairages sur trépied ; instruments. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-22-b` → `s21` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-23-a` → `s23` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-24-a` → `s24` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Esplanade ensevelie ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s23 — Salle des restes

Les restes sont des témoins archéologiques, pas des ennemis ressuscités. Le joueur traverse un passage balisé.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s23`. Images : `decor/ossuary`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 1860 unités de jeu ; projection `SIDE`. Tables de relevé ; fragments protégés ; toile ; scanner ; jalons ; niches. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o08-01` — Examiner les restes (scan).

**Connexions.** `link-23-b` → `s22` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-25-a` → `s24` : Ouverture basse dans la structure au bord droit ; liaison de conduit identifiée.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Salle des restes ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s24 — Poste de relevés

Une implantation humaine fragile occupe un seuil de la cité. La radio et le matériel restent visibles depuis l’entrée. Implantation v0.3 : baie de relevé protégée. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s24`. Images : `decor/survey`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Console portable ; caisses de capteurs ; panneaux ; fil guide ; bouteilles d’air. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o08-02` — Récupérer le détecteur (equipment).

**Connexions.** `link-24-b` → `s22` : Baie de premier plan ; linteau atténué à proximité. `link-25-b` → `s23` : Ouverture basse dans la structure au bord gauche ; liaison de conduit identifiée. `link-26-a` → `s25` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste de relevés ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s25 — Passerelle suspendue

Une passerelle suit la paroi ; des volumes descendent sous le plan jouable. Le vide n’est pas une seconde route.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s25`. Images : `decor/bridge`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`, `equipment/archive`, `devices/isolation`.

**Implantation.** Largeur 2680 unités de jeu ; projection `SIDE`. Platelage ; ancrages ; câble latéral ; contreventement ; balises cassées. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-26-b` → `s24` : Ouverture dans la paroi latérale gauche. `link-27-a` → `s26` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Passerelle suspendue ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s26 — Entrée des tubes

La mine humaine rejoint des tubes de silice. La transition architecturale est visible avant le changement de salle. Implantation v0.3 : gorge à bifurcation. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s26`. Images : `decor/silica`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/rib`, `obstacles/silica-rubble`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Silice ; roche ; repères arrachés ; lampe tombée ; peau translucide ; résine. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o09-01` — Écouter ce qui approche (sense).

**Connexions.** `link-27-b` → `s25` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-28-b` → `s20` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-29-a` → `s27` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Entrée des tubes ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s27 — Le nœud ambré

Trois passages composent une boucle. Les piliers de silice délimitent les bandes sans former un mur infranchissable. Implantation v0.3 : nœud à pilier central. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s27`. Images : `decor/amber`, `decor/silica`, `decor/resinCable`, `decor/silicaShard`, `obstacles/rib`, `obstacles/resin`, `obstacles/silica-rubble`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2680 unités de jeu ; projection `DEPTH`. Piliers ; gouttes minérales ; membranes ; débris d’équipement ; trace de traînée. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o10-01` — Marquer la dérivation (route).

**Connexions.** `link-29-b` → `s26` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-30-a` → `s28` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-32-a` → `s29` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Le nœud ambré ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s28 — Alcôve des disparus

Une alcôve accessible par un boyau étroit. Les cocons occupent le fond, le passage reste latéral.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s28`. Images : `decor/cocoon`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 1960 unités de jeu ; projection `SIDE`. Cocons ; casque ; balise ; arme vide ; résine ; réseaux organiques. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o09-02` — Retrouver la balise perdue (recover).

**Connexions.** `link-30-b` → `s27` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-31-a` → `s29` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Alcôve des disparus ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s29 — Le retour fermé

Le retour se bouche après le relevé. Une dérivation identifiée existe avant le changement d’état. Implantation v0.3 : dérivation derrière la membrane. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s29`. Images : `decor/membrane`, `decor/silica`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`, `obstacles/silica-rubble`, `obstacles/resin`, `obstacles/rib`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2220 unités de jeu ; projection `HYBRID`. Membrane de fermeture ; ancien repère ; fissure latérale ; tube de ventilation. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o10-02` — Vérifier le passage fermé (seal).

**Connexions.** `link-31-b` → `s28` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-32-b` → `s27` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-33-a` → `s30` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-49-a` → `s44` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Le retour fermé ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s30 — Ascenseur secondaire

La seconde installation ne garantit plus de sortie. Les commandes restent accessibles malgré les dommages.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s30`. Images : `decor/hoist-drive`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2300 unités de jeu ; projection `DEPTH`. Cage inclinée ; câbles rompus ; supports tordus ; panneau défaut ; rambardes. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o11-01` — Examiner le second ascenseur (inspect).

**Connexions.** `link-33-b` → `s29` : Ouverture dans la paroi latérale gauche. `link-34-a` → `s31` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Ascenseur secondaire ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s31 — Pied de l’escalier

La cage d’escalier possède des paliers lisibles et un itinéraire de maintenance, sans téléportation entre étages. Implantation v0.3 : palier et baie technique. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s31`. Images : `decor/cableTray`, `decor/winch`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `obstacles/crate`, `equipment/archive`, `devices/isolation`, `objectives/console`.

**Implantation.** Largeur 2420 unités de jeu ; projection `HYBRID`. Volées ; paliers ; échelle de secours ; numérotation ; main courante ; conduites. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o12-01` — Repérer la voie de secours (route).

**Connexions.** `link-34-b` → `s30` : Ouverture dans la paroi latérale gauche. `link-35-a` → `s32` : Ouverture dans la paroi latérale droite. `link-38-a` → `s34` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-53-b` → `s44` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Pied de l’escalier ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s32 — Chambre des œufs

Les œufs forment des îlots, jamais une grille décorative. Deux passages continus permettent de se replier. Implantation v0.3 : deux poches autour de la ponte. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s32`. Images : `decor/eggs`, `decor/cocoon`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/rib`, `obstacles/silica-rubble`, `creatures/facehugger`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2820 unités de jeu ; projection `DEPTH`. Œufs ; résine ; condensation ; carcasses minérales ; creux sombres ; gaines. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o12-02` — Repérer un passage entre les œufs (brood).

**Connexions.** `link-35-b` → `s31` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-36-a` → `s33` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Chambre des œufs ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s33 — La pondeuse

Une grande chambre distribue trois ancrages de résine autour d’un axe d’évacuation. Le boss ne remplit pas l’écran.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s33`. Images : `decor/throne`, `decor/eggs`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/silica-rubble`, `obstacles/rib`, `equipment/archive`.

**Implantation.** Largeur 3040 unités de jeu ; projection `DEPTH`. Reine ; attaches ; ovipositeur stylisé ; œufs périphériques ; arches ; sol corrodé. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o13-01` — Ouvrir la voie au groupe (boss).

**Connexions.** `link-36-b` → `s32` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-37-a` → `s34` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de La pondeuse ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.
- **P1 · narrative** — Trois attaches du boss restent des mécanismes originaux. **À vérifier :** Séparer scène du roman et règle de combat, ou proposer une variante justifiée.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s34 — Dérivation de secours

Le retour vers l’escalier passe par une galerie industrielle partiellement envahie. Une zone de soins improvisée ne promet aucune guérison. Les deux brancards doivent être préparés séparément puis escortés jusqu’à la navette. Implantation v0.3 : baie de stabilisation à deux brancards. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s34`. Images : `decor/triage`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `obstacles/crate`, `equipment/archive`, `equipment/supply`, `equipment/light-panel`, `devices/parts`.

**Implantation.** Largeur 2140 unités de jeu ; projection `HYBRID`. Civière ; couvertures ; éclairage mobile ; caisses ; conduites ; fermeture coupe-feu. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o14-01` — Mettre Adams à l’abri (rescue) ; `o14-02` — Mettre Elway à l’abri (rescue).

**Connexions.** `link-37-b` → `s33` : Ouverture dans la paroi latérale gauche. `link-38-b` → `s31` : Baie de premier plan ; linteau atténué à proximité. `link-39-a` → `s35` : Volée et palier raccordés au bord droit ; pas un escalier décoratif sans liaison.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Dérivation de secours ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s35 — Paliers supérieurs

Une succession de paliers comprimée pour le jeu, reliée explicitement au bas de la cage. Les marches sont une animation de liaison.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s35`. Images : `decor/cableTray`, `decor/winch`, `decor/warningStripe`, `decor/pipe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2660 unités de jeu ; projection `SIDE`. Treuil ; paliers ; câble de levage ; mains courantes ; bouche de surface. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o15-01` — Actionner le treuil (winch).

**Connexions.** `link-39-b` → `s34` : Volée et palier raccordés au bord gauche ; pas un escalier décoratif sans liaison. `link-40-a` → `s36` : Volée et palier raccordés au bord droit ; pas un escalier décoratif sans liaison. `link-50-a` → `s45` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-57-a` → `s49` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Paliers supérieurs ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s36 — Ravin de service

Le ravin rejoint le nord de l’aire initiale. Les mêmes tours et balises permettent de reconnaître le lieu. Implantation v0.3 : ravin et drainage latéral. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s36`. Images : `decor/ravine`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`, `obstacles/silica-rubble`, `obstacles/pipe`, `obstacles/crate`, `equipment/archive`, `devices/isolation`, `objectives/console`.

**Implantation.** Largeur 2700 unités de jeu ; projection `DEPTH`. Talus ; antenne ; câble enterré ; talweg sec ; route de service ; sable en mouvement. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o15-02` — Ouvrir le passage du ravin (route).

**Connexions.** `link-40-b` → `s35` : Volée et palier raccordés au bord gauche ; pas un escalier décoratif sans liaison. `link-41-a` → `s11` : Continuité du terrain au bord droit ; pas de porte industrielle isolée.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Ravin de service ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s37 — Soute de la navette

La rampe débouche sur une soute assez large pour l’opération de capture. Le caisson est ancré, et non posé devant une porte. Implantation v0.3 : berceaux et cage séparés. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s37`. Images : `decor/captureBay`, `decor/dropship`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/shutter-control`, `equipment/light-panel`, `devices/console`, `objectives/capture`.

**Implantation.** Largeur 2400 unités de jeu ; projection `DEPTH`. Caisson ; moussoir ; treuil ; sangles ; rampes ; rails de chargement ; banquettes. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o16-01` — Immobiliser puis enfermer l’adulte (capture).

**Connexions.** `link-42-b` → `s11` : Rampe d’embarquement raccordée au bord avant et au transport. `link-43-a` → `s38` : Embarquement au bord droit ; trajet aérien distinct des liaisons pédestres.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Soute de la navette ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.
- **P1 · narrative** — Capture condensée : reconstituer les interventions précises après comparaison du passage. **À vérifier :** Garder spécimen vivant, patients, convoi et arrimage.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s38 — Consigne cryogénique W-Y

Une vitre sépare le personnel des spécimens. Les hôtes ne sont pas soignés par une interaction magique.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s38`. Images : `decor/quarantine-instruments`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `characters/rollins`, `equipment/archive`, `equipment/stasis-canopy`, `stretchers/adams`, `stretchers/elway`, `parasites/royal`, `parasites/normal`, `objectives/console`.

**Implantation.** Largeur 1840 unités de jeu ; projection `SIDE`. Vitrage ; cryocuves ; dossier transfert ; caméra ; clapets ; sas sécurisé. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o17-01` — Confirmer le transfert (transfer).

**Connexions.** `link-44-a` → `s39` : Ouverture dans la paroi latérale droite.

**Arrivées seules.** `link-43-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Consigne cryogénique W-Y ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s39 — Poste d’observation

La baie montre la planète, pas une ville terrestre. La frappe est une séquence orbitale non jouable comme arme.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s39`. Images : `decor/viewport`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/cherbourg`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2080 unités de jeu ; projection `HYBRID`. Baie ; console ; écran de mission ; sièges fixés ; éclairage de veille. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o17-02` — Observer la surface (observe).

**Connexions.** `link-44-b` → `s38` : Ouverture dans la paroi latérale gauche. `link-45-a` → `s40` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste d’observation ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s40 — Hypersommeil

La dernière salle referme le récit. Des couchettes et des moniteurs encadrent un couloir presque vide.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s40`. Images : `decor/cryo`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `objectives/sleep`.

**Implantation.** Largeur 1820 unités de jeu ; projection `SIDE`. Couchettes ; casiers ; terminal ; lumière de veille ; hublot ; tubulures. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o18-01` — Entrer en hypersommeil (sleep).

**Connexions.** `link-45-b` → `s39` : Ouverture dans la paroi latérale gauche.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Hypersommeil ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s41 — Local des filtres

Un local fermé derrière le sas conserve les cartouches hors de la poussière.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s41`. Images : `decor/filters`, `decor/wash`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 1480 unités de jeu ; projection `SIDE`. Cartouches scellées ; banc de contrôle ; tuyaux de retour ; panneau de débit. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-46-b` → `s13` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Local des filtres ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s42 — Pompes de desserte

Un circuit secondaire rejoint la galerie d’alimentation sans repasser par le relais.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s42`. Images : `decor/pump`, `decor/generator`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `devices/console`.

**Implantation.** Largeur 2200 unités de jeu ; projection `DEPTH`. Deux volutes de pompe ; soupapes ; câble de commande ; jauges ; drain. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-47-b` → `s17` : Baie de premier plan ; linteau atténué à proximité. `link-52-a` → `s18` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Pompes de desserte ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s43 — Belvédère de fouille

Une passerelle d’observation domine la tranchée, mais ne descend pas directement jusqu’aux tubes.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s43`. Images : `decor/survey`, `decor/bridge`, `decor/resinCable`, `decor/silicaShard`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 1840 unités de jeu ; projection `HYBRID`. Table de relevés ; mât de visée ; balustrade ; sondes ; sacs. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-48-b` → `s21` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Belvédère de fouille ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s44 — Conduit de retour

Une desserte étroite contourne la membrane refermée et rejoint le pied de l’escalier.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s44`. Images : `decor/silica`, `decor/valve`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 2050 unités de jeu ; projection `SIDE`. Tubes gainés ; membrures fendues ; vanne de purge humaine posée à l’entrée. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-49-b` → `s29` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-53-a` → `s31` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Conduit de retour ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s45 — Infirmerie de secours

Un renfoncement de soins permet de reprendre souffle sans bloquer le palier du treuil.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s45`. Images : `decor/triage`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`, `devices/console`.

**Implantation.** Largeur 1860 unités de jeu ; projection `HYBRID`. Deux stations de brancards ; armoire de soins ; couvertures ; ventilation. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-50-b` → `s35` : Baie de premier plan ; linteau atténué à proximité. `link-59-b` → `s50` : Ouverture dans la paroi latérale gauche.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Infirmerie de secours ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s46 — Poste de guidage

Le poste donne une ligne dégagée vers l’aire d’atterrissage. La balise principale reste sur l’aire.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s46`. Images : `decor/antenna`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 2080 unités de jeu ; projection `DEPTH`. Antenne de guidage ; pupitre ; jalons ; vitrage blindé ; batteries. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-51-b` → `s11` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste de guidage ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s47 — Vestiaire des équipes

Des armoires de quart longent le mur des équipes. La réserve de quart donne sur une cour technique qui rejoint la galerie d’alimentation.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s47`. Images : `decor/locker`, `decor/wash`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2160 unités de jeu ; projection `HYBRID`. Les scellés protègent du matériel oublié, pas une réserve inépuisable. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-54-b` → `s17` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-55-a` → `s48` : Ouverture dans la paroi latérale droite.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Vestiaire des équipes ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s48 — Cour des échangeurs

Des échangeurs longent la cour encaissée. Une coursive latérale ramène vers l’alimentation sans repasser par l’atelier.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s48`. Images : `decor/generator`, `decor/pump`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2580 unités de jeu ; projection `DEPTH`. Regarder entre les machines avant de fouiller les casiers : le cliquetis de leur fermeture porte loin. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-55-b` → `s47` : Ouverture dans la paroi latérale gauche. `link-56-a` → `s18` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Cour des échangeurs ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s49 — Transit des blessés

Deux rails de guidage conduisent les châssis jusqu’au poste de transit. Un retour par le magasin rejoint l’infirmerie.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s49`. Images : `decor/triage`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2240 unités de jeu ; projection `HYBRID`. Cette boucle accepte les deux brancards. Elle ne remplace pas le treuil, la balise ou l’arrimage. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-57-b` → `s35` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-58-a` → `s50` : Ouverture dans la paroi latérale droite.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Transit des blessés ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s50 — Magasin de la remontée

Les établis ont été abandonnés en plein inventaire. Des renforts et des consommables subsistent derrière les portes des armoires.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s50`. Images : `decor/cargo`, `decor/battery`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `creatures/facehugger`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2420 unités de jeu ; projection `DEPTH`. Le détour offre un endroit où déposer un surplus pour le reprendre plus tard. Un bruit remue à l’arrière du magasin. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-58-b` → `s49` : Ouverture dans la paroi latérale gauche. `link-59-a` → `s45` : Ouverture dans la paroi latérale droite.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Magasin de la remontée ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

## Armes — 7 fiches

### MER-ARME-pistol — Reaper

Nom et type de pistolet

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Aucune salle dédiée ou occurrence statique. Images : `weapons/pistol`, `effects/muzzle`, `effects/impact`.

**Paramètres de gameplay, sans portée canonique.** magazine=12, reloadSeconds=1.1, shotIntervalSeconds=0.27, rangeGameUnits=1100, damage=24.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [reaper](https://avp.fandom.com/wiki/Reaper), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Silhouette, calibre, 12 coups et dégâts : interprétation de jeu. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Reaper. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-pulse — Fusil à impulsions

Arme citée lors de la destruction du puits

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Salles concernées : `s09`, `s17`. Images : `weapons/pulse`, `effects/muzzle`, `effects/impact`.

**Paramètres de gameplay, sans portée canonique.** magazine=30, initialReserve=60, reloadSeconds=1.1, shotIntervalSeconds=0.11, rangeGameUnits=1100, damage=20.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Attribution facultative à Decker originale. Aucun modèle M41A revendiqué ; 30 coups : équilibrage. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Fusil à impulsions. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-plasma — Fusil plasma · 50 W

Modèle cité dans le roman

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Salles concernées : `s09`, `s17`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Paramètres de gameplay, sans portée canonique.** cellShots=12, initialReserveCells=2, loadedCell=1, reloadOnlyEmpty=true, reloadSeconds=1.1, heatPerShot=28, lockHeat=100, shotIntervalSeconds=0.6, rangeGameUnits=1100, damage=45.

**État de production.** `generation-refused-native-fallback`.

**Qualification.** secondary-reference-partial. Références : [plasma](https://avp.fandom.com/wiki/Plasma_Rifle), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Silhouette, 12 tirs/cellule, cadence, dégâts et seuil thermique interprétés ; trois cellules dans le kit. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P0 · visual** — Génération refusée ; conserver le rendu natif et le besoin ouvert. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Fusil plasma · 50 W. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-foam — Foamer · projection de mousse

Outil de capture employé par Manning

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Aucune salle dédiée ou occurrence statique. Images : `weapons/foam`, `effects/foam`.

**Paramètres de gameplay, sans portée canonique.** shotIntervalSeconds=0.35, rangeGameUnits=790, foamIncrement=0.38, restraintThreshold=0.95.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Usage direct par Decker et jauge de mousse : adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Foamer · projection de mousse. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-flame — Lance-flammes de gameplay

Non certifié comme arme distincte dans le passage de référence

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Aucune salle dédiée ou occurrence statique. Images : `effects/flame`, `effects/spark`.

**Paramètres de gameplay, sans portée canonique.** fuelPerShot=2, shotIntervalSeconds=0.13, rangeGameUnits=390, damage=17, weakpointDamage=14.

**Édition 0.10.3.** Lance-flammes raccordé à l'arme native et à l'armurerie ; grip primaire et bouche mesurés dans les deux sens. La crosse dépasse le dos dans certaines poses ; seconde main et occlusion restent à corriger. Aucun nouveau cycle de recharge n'est produit. Arme originale au projet. Source : [weapons/flame.png](../../dlc/sea-of-sorrows-visual/sprites/weapons/flame.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Ancienne arme conservée ; ne pas la présenter comme modèle authentifié. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P0 · visual** — Source générée hors du checkpoint, publication et raccord à vérifier. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Lance-flammes de gameplay. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-grenades — Grenades de Silas

Employées contre le puits

**Présent au checkpoint.** Propriétaire : `Objectif/dossier de campagne`. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Pas de lancer libre par Decker dans cette version. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG distinct de cet armement au checkpoint. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P2 · narrative** — Représenter la référence dans sa séquence seulement. **À vérifier :** Aucun nouveau lancer libre, consommable ou pouvoir gratuit inventé.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-warheads — Charges plasma orbitales

Frappe commandée depuis le transport

**Présent au checkpoint.** Propriétaire : `Objectif/dossier de campagne`. Salles concernées : `s39`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Pas une arme de poche ni un pouvoir orbital libre du joueur. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG distinct de cet armement au checkpoint. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P2 · narrative** — Représenter la référence dans sa séquence seulement. **À vérifier :** Aucun nouveau lancer libre, consommable ou pouvoir gratuit inventé.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

## Props, équipements et effets — 119 fiches

### MER-EQUIP-radio — Radio de liaison

Liaisons et dialogues de gameplay ; forme, modèle et description matérielle non vérifiés dans le texte intégral.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / dialogues de mission`. Aucune salle dédiée ou occurrence statique. Images : `equipment/radio`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Liaisons et dialogues de gameplay ; forme, modèle et description matérielle non vérifiés dans le texte intégral. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-lamp — Lampe personnelle

État moteur ; modèle et tenue non certifiés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.toggleLamp`. Aucune salle dédiée ou occurrence statique. Images : `equipment/lamp`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — État moteur ; modèle et tenue non certifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-tracker — Détecteur de mouvement

Fonctionnel ; modèle, chiffres et interface originaux.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / Game.toggleTracker`. Aucune salle dédiée ou occurrence statique. Images : `equipment/tracker`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Fonctionnel ; modèle, chiffres et interface originaux. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-filter — Protection respiratoire

Les sables toxiques sont confirmés par Titan ; le filtre consommable et son apparence restent un mécanisme de jeu.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / Game.replaceFilter`. Salles concernées : `s13`, `s41`. Images : `equipment/filter`, `decor/filters`.

**Qualification.** secondary-context-project-design. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Les sables toxiques sont confirmés par Titan ; le filtre consommable et son apparence restent un mécanisme de jeu. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-sampler — Carottier

Interaction au début ; pas un outil de combat portable.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor/object / o01-01`. Salles concernées : `s02`, `s15`, `s17`, `s20`, `s21`, `s23`, `s26`, `s28`, `s32`. Images : `decor/drill`, `decor/reel`, `objectives/case`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Interaction au début ; pas un outil de combat portable. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-scanner — Relevés et terminal ICC

Le rôle ICC est confirmé ; cet ensemble de terminal et relevés jouables est une interprétation, pas un équipement authentifié par la notice.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor/object`. Salles concernées : `s03`, `s04`, `s05`, `s06`, `s08`, `s09`, `s11`, `s12`, `s13`, `s14`, `s16`, `s18`, `s21`, `s22`, `s24`, `s27`, `s29`, `s30`, `s31`, `s35`, `s36`, `s38`, `s39`, `s43`, `s46`. Images : `decor/survey`, `decor/terminal`, `objectives/console`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Le rôle ICC est confirmé ; cet ensemble de terminal et relevés jouables est une interprétation, pas un équipement authentifié par la notice. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-cage — Caisson de capture

État et capture réelle ; modèle dessiné original.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object / capture`. Salles concernées : `s37`. Images : `objectives/capture`, `decor/captureBay`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — État et capture réelle ; modèle dessiné original. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-cryo — Consigne cryogénique

Les deux porteurs restent contaminés, pas guéris par le sauvetage.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stasisDisplay/object`. Salles concernées : `s38`, `s40`. Images : `decor/cryo`, `equipment/stasis-canopy`, `objectives/sleep`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Les deux porteurs restent contaminés, pas guéris par le sauvetage. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Les capsules sont déjà illustrées ; manque de spécificité de scène et d'état, pas absence totale de visuel. **À vérifier :** Séparer s40, s38 et décor médical ; garder les hôtes contaminés.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-medkits — Trousses et consommables

Soins simplifiés, réserve finie.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / Game.useMedkit`. Aucune salle dédiée ou occurrence statique. Images : `equipment/medkit`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Soins simplifiés, réserve finie. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-sensors — Trois balises réutilisables

Création des v0.6, ne pas confondre avec une sonde canonique.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.sensor / balises`. Aucune salle dédiée ou occurrence statique. Images : `equipment/sensor`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Création des v0.6, ne pas confondre avec une sonde canonique. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-decoys — Leurres acoustiques

Création de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.emitter / Game.deployDecoy`. Aucune salle dédiée ou occurrence statique. Images : `equipment/decoy`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Création de gameplay. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-repair — Renforts de châssis

Réparation et économie originales.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device / réparation`. Salles concernées : `s17`, `s34`. Images : `devices/parts`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Réparation et économie originales. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-shocker — Shocker / neutralisation

Mention à confronter au texte ; non ajouté comme équipement canonique certifié.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Mention à confronter au texte ; non ajouté comme équipement canonique certifié. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · reference** — Nature et présence à vérifier avant production canonique. **À vérifier :** Retrouver le passage et distinguer arme, neutralisation médicale et traduction.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-PROP-decor-amber — Nœud ambré

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s27`. Images : `decor/amber`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-antenna — Antenne

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s11`, `s16`, `s46`. Images : `decor/antenna`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-armory — Module d'armurerie

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s09`. Images : `decor/armory`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-battery — Batterie

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s12`, `s50`. Images : `decor/battery`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-bridge — Passerelle suspendue

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s25`, `s43`. Images : `decor/bridge`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-briefing — Table de briefing

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s08`, `s12`. Images : `decor/briefing`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cable — Câble

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s25`, `s30`, `s34`, `s36`. Images : `decor/cable`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cableTray — Chemin de câbles

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s24`, `s25`, `s30`, `s31`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `decor/cableTray`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-captureBay — Baie de capture

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s37`. Images : `decor/captureBay`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cargo — Cargaison

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s10`, `s50`. Images : `decor/cargo`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-checkpoint — Poste de surveillance

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`. Images : `decor/checkpoint`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cocoon — Cocon

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s28`, `s32`. Images : `decor/cocoon`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cryo — Capsule cryogénique

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s40`. Images : `decor/cryo`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-drill — Carottier

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s02`. Images : `decor/drill`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-eggs — Groupe d'œufs

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s32`, `s33`. Images : `decor/eggs`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-fence — Clôture

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`. Images : `decor/fence`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-filters — Ensemble de filtration

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s13`, `s41`. Images : `decor/filters`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-generator — Générateur

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s18`, `s42`, `s48`. Images : `decor/generator`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-hoist-drive — Motorisation du treuil

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s14`, `s15`, `s30`. Images : `decor/hoist-drive`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-home — Mobilier domestique

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s05`. Images : `decor/home`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-landing — Infrastructure d'atterrissage

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s11`. Images : `decor/landing`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-locker — Armoire de décor

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s03`, `s05`, `s07`, `s09`, `s47`. Images : `decor/locker`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-medical — Module médical

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s03`, `s06`, `s38`, `s40`, `s45`, `s49`. Images : `decor/medical`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-membrane — Membrane organique

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s29`. Images : `decor/membrane`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-monolith — Monolithe

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s22`. Images : `decor/monolith`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-office — Mobilier de bureau

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s04`, `s08`. Images : `decor/office`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-ossuary — Restes et ossuaire

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s23`. Images : `decor/ossuary`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-pipe — Canalisation

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s25`, `s29`, `s35`, `s36`, `s42`, `s44`. Images : `decor/pipe`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-pump — Pompe

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s18`, `s42`, `s48`. Images : `decor/pump`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-quarantine-instruments — Instruments de quarantaine

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s38`. Images : `decor/quarantine-instruments`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-ravine — Ravin

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s36`. Images : `decor/ravine`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-reel — Dévidoir

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s02`, `s15`, `s17`. Images : `decor/reel`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-resinCable — Liaison de résine

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s26`, `s27`, `s28`, `s29`, `s32`, `s33`, `s43`, `s44`. Images : `decor/resinCable`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-rib — Nervure

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s20`, `s23`, `s26`, `s28`. Images : `decor/rib`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-seal-equipment — Équipement de scellement

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s07`. Images : `decor/seal-equipment`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-silica — Formation de silice

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s26`, `s27`, `s29`, `s44`. Images : `decor/silica`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-silicaShard — Éclat de silice

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s26`, `s27`, `s28`, `s29`, `s32`, `s33`, `s43`, `s44`. Images : `decor/silicaShard`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-survey — Machine de relevé/excavation

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s21`, `s22`, `s24`, `s43`. Images : `decor/survey`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-terminal — Terminal

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s04`, `s16`, `s24`, `s39`, `s46`. Images : `decor/terminal`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-throne — Structure de la chambre royale

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s33`. Images : `decor/throne`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-triage — Poste de triage

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s34`, `s45`, `s49`. Images : `decor/triage`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-valve — Vanne

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s44`. Images : `decor/valve`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-viewport — Hublot

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s39`. Images : `decor/viewport`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-warningStripe — Bande de signalisation

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s24`, `s25`, `s30`, `s31`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `decor/warningStripe`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-wash — Décontamination

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s06`, `s13`, `s41`, `s47`. Images : `decor/wash`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-winch — Treuil

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s14`, `s31`, `s35`. Images : `decor/winch`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-workbench — Établi

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s17`. Images : `decor/workbench`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-devices-console — devices / console

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device`. Salles concernées : `s37`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`. Images : `devices/console`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-devices-isolation — devices / isolation

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device`. Salles concernées : `s19`, `s25`, `s31`, `s36`. Images : `devices/isolation`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-devices-parts — devices / parts

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device`. Salles concernées : `s17`, `s34`. Images : `devices/parts`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-doors-bulkhead-frame — doors / bulkhead-frame

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door`. Aucune salle dédiée ou occurrence statique. Images : `doors/bulkhead-frame`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Pièce de baie industrielle ; ne couvre pas roche, rampe, cage, escalier ou mur oblique. **À vérifier :** Modules adaptés à chaque architecture ; ne pas étirer ce cadre sur une forme incompatible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-doors-bulkhead-panel — doors / bulkhead-panel

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door`. Aucune salle dédiée ou occurrence statique. Images : `doors/bulkhead-panel`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Pièce de baie industrielle ; ne couvre pas roche, rampe, cage, escalier ou mur oblique. **À vérifier :** Modules adaptés à chaque architecture ; ne pas étirer ce cadre sur une forme incompatible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-acid — effects / acid

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/acid`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement acid ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-flame — effects / flame

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/flame`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement flame ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-foam — effects / foam

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/foam`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement foam ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-impact — effects / impact

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/impact`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement impact ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-muzzle — effects / muzzle

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/muzzle`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement muzzle ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-spark — effects / spark

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/spark`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement spark ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-archive — equipment / archive

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `equipment/archive`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-armory-rack — equipment / armory-rack

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s09`, `s17`. Images : `equipment/armory-rack`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-decoy — equipment / decoy

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/decoy`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-filter — equipment / filter

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/filter`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-lamp — equipment / lamp

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/lamp`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-light-panel — equipment / light-panel

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s13`, `s15`, `s17`, `s18`, `s24`, `s30`, `s34`, `s35`, `s37`, `s42`. Images : `equipment/light-panel`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-locker-open — equipment / locker-open

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s17`, `s45`, `s47`, `s48`, `s49`, `s50`. Images : `equipment/locker-open`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-locker — equipment / locker

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s17`, `s45`, `s47`, `s48`, `s49`, `s50`. Images : `equipment/locker`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-medkit — equipment / medkit

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/medkit`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-radio — equipment / radio

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/radio`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-sensor — equipment / sensor

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/sensor`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-shutter-control — equipment / shutter-control

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s13`, `s15`, `s17`, `s18`, `s30`, `s35`, `s37`, `s42`. Images : `equipment/shutter-control`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Levier peint fixe et léger chevauchement ponctuel des textes natifs à corriger. **À vérifier :** Levier, témoin et libellé représentent le même état de cloison.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-stasis-canopy — equipment / stasis-canopy

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s38`. Images : `equipment/stasis-canopy`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-supply — equipment / supply

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s09`, `s12`, `s16`, `s17`, `s24`, `s30`, `s34`, `s37`. Images : `equipment/supply`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-tracker — equipment / tracker

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/tracker`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-weakpoint — equipment / weakpoint

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/weakpoint`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-capture — objectives / capture

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s37`. Images : `objectives/capture`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-case — objectives / case

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s02`, `s20`, `s21`, `s23`, `s26`, `s28`, `s32`. Images : `objectives/case`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-console — objectives / console

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s03`, `s04`, `s05`, `s06`, `s08`, `s09`, `s11`, `s12`, `s13`, `s14`, `s16`, `s18`, `s24`, `s27`, `s29`, `s30`, `s31`, `s35`, `s36`, `s38`, `s39`. Images : `objectives/console`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-sleep — objectives / sleep

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s40`. Images : `objectives/sleep`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-crate — obstacles / crate

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s01`, `s02`, `s04`, `s06`, `s08`, `s09`, `s10`, `s11`, `s12`, `s15`, `s16`, `s17`, `s21`, `s24`, `s30`, `s31`, `s34`, `s36`, `s37`, `s39`, `s47`, `s48`, `s49`, `s50`. Images : `obstacles/crate`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-pipe — obstacles / pipe

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s01`, `s02`, `s04`, `s06`, `s08`, `s10`, `s11`, `s12`, `s14`, `s15`, `s17`, `s24`, `s30`, `s31`, `s34`, `s36`, `s37`, `s39`, `s42`, `s43`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `obstacles/pipe`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-rack — obstacles / rack

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s01`, `s02`, `s04`, `s06`, `s08`, `s09`, `s10`, `s11`, `s12`, `s14`, `s15`, `s16`, `s17`, `s21`, `s24`, `s30`, `s31`, `s34`, `s37`, `s39`, `s42`, `s43`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `obstacles/rack`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-resin — obstacles / resin

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s19`, `s20`, `s22`, `s26`, `s27`, `s29`, `s32`, `s33`. Images : `obstacles/resin`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-rib — obstacles / rib

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s26`, `s27`, `s29`, `s32`, `s33`. Images : `obstacles/rib`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-silica-rubble — obstacles / silica-rubble

Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s26`, `s27`, `s29`, `s32`, `s33`, `s36`. Images : `obstacles/silica-rubble`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-portal-boarding — Seuil : boarding

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s10`, `s37`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-boarding-ramp — Seuil : boarding-ramp

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s11`, `s37`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-building-entrance — Seuil : building-entrance

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s11`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-bulkhead — Seuil : bulkhead

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s04`, `s06`, `s07`, `s08`, `s09`, `s10`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s24`, `s25`, `s30`, `s31`, `s34`, `s35`, `s38`, `s39`, `s40`, `s41`, `s42`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `doors/bulkhead-frame`, `doors/bulkhead-panel`.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-crawl-opening — Seuil : crawl-opening

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s23`, `s24`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-exterior-path — Seuil : exterior-path

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s01`, `s02`, `s11`, `s36`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-interlude — Seuil : interlude

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-lift-cage — Seuil : lift-cage

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s14`, `s15`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-rock-breach — Seuil : rock-breach

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s26`, `s27`, `s28`, `s29`, `s32`, `s33`, `s43`, `s44`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-stairwell — Seuil : stairwell

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s19`, `s21`, `s34`, `s35`, `s36`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-transit — Seuil : transit

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s02`, `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-urban-transit — Seuil : urban-transit

Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s04`, `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travail restant et critère de clôture :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-hazard-arc — Danger : arc

Danger cyclique original ; ne pas le traiter comme décor passif.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.fieldGround/fieldWarnings ; simulation`. Salles concernées : `s18`, `s31`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-CORE](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js).

**Travail restant et critère de clôture :**

- **P1 · animation** — Inactif, avertissement, phase dangereuse et consignation de arc. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Synchroniser période, désactivation, dommages et accessibilité.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-hazard-gas — Danger : gas

Danger cyclique original ; ne pas le traiter comme décor passif.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.fieldGround/fieldWarnings ; simulation`. Salles concernées : `s19`, `s36`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-CORE](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js).

**Travail restant et critère de clôture :**

- **P1 · animation** — Inactif, avertissement, phase dangereuse et consignation de gas. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Synchroniser période, désactivation, dommages et accessibilité.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-hazard-steam — Danger : steam

Danger cyclique original ; ne pas le traiter comme décor passif.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.fieldGround/fieldWarnings ; simulation`. Salles concernées : `s25`, `s29`, `s35`, `s42`, `s44`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-CORE](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js).

**Travail restant et critère de clôture :**

- **P1 · animation** — Inactif, avertissement, phase dangereuse et consignation de steam. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Synchroniser période, désactivation, dommages et accessibilité.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-icc-handheld — Appareil portable du rapport ICC

Présentation distincte de la console générique de o02-01.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Appareil posé sur le pupitre natif de o02-01 avant achèvement, en conservant marqueur, action et état terminé. Les autres consoles ne sont pas remplacées. Source : [objectives/icc-handheld.png](../../dlc/sea-of-sorrows-visual/sprites/objectives/icc-handheld.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** primary-object-unspecified-design. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travail restant et critère de clôture :**

- **P0 · visual** — Source générée de l'appareil portable ; boîtier et écran interprétés. **À vérifier :** Contrôler octets, alpha, dimensions et lisibilité avant admission.
- **P0 · integration** — Seulement o02-01 de s03 ; conserver durée, drapeau et état terminé. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Les autres consoles et objectifs restent distincts.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-medical-chart — Dossier médical papier

Accessoire du contexte médical, sans PNG individuel identifié.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-prop-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travail restant et critère de clôture :**

- **P2 · visual** — Créer l'accessoire séparé seulement s'il est lisible et nécessaire à la consultation. **À vérifier :** Support physique cohérent ; aucune donnée personnelle ou intrigue additionnelle inventée.

**Garde de continuité.** Ne pas compter un terminal générique comme ce prop.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-medical-cups — Gobelets médicaux

Accessoire du contexte médical, sans PNG individuel identifié.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-prop-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travail restant et critère de clôture :**

- **P2 · visual** — Créer l'accessoire séparé seulement s'il est lisible et nécessaire à la consultation. **À vérifier :** Support physique cohérent ; aucune donnée personnelle ou intrigue additionnelle inventée.

**Garde de continuité.** Ne pas compter un terminal générique comme ce prop.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-yellow-survey-flag — Balise jaune du relevé

Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s01`, `s02`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-restraint-chair — Siège et sangles de retenue

Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s08`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-hood — Cagoule de transport

Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s05`, `s07`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-tranquillizer — Dispositif de sédation

Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

## Véhicules et transports au sol — 5 fiches

### MER-EQUIP-stretchers — Brancards Adams / Elway

Transport des deux hôtes ; châssis motorisés, intégrité et allures originaux.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stretcher / état rescue`. Salles concernées : `s34`, `s35`, `s36`, `s37`, `s38`, `s45`, `s49`, `s50`. Images : `stretchers/adams`, `stretchers/elway`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Transport des deux hôtes ; châssis motorisés, intégrité et allures originaux. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Roues, arrêt, réparation, arrimage et seuil, sans téléportation. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-VEH-excavator — Excavateur du chantier

Images de machine de chantier déjà présentes ; elles ne donnent pas un véhicule pilotable.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s21`, `s22`, `s24`, `s43`. Images : `decor/excavator`, `decor/survey`.

**Qualification.** project-design-with-audio-context. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Ne pas confondre excavateur et crawler de transport ; modèle et silhouette industriels non authentifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Bras, outils, roues/chenilles seulement si une action de chantier les nécessite. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver la fonction décorative tant qu'aucune mécanique pilotable n'est définie.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-VEH-mine-cages — Cages et moyens de levage de la mine

Passages verticaux et treuils, distincts d'un véhicule routier.

**Présent au checkpoint.** Propriétaire : `Transitions lift-cage / SoSRenderer.door`. Salles concernées : `s14`, `s15`, `s30`. Images : `decor/winch`, `decor/hoist-drive`.

**Qualification.** secondary-context-original-layout. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Apparence, dimensions et marquages sans référence primaire précise. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Cabine, suspension, course et arrêts seulement si un trajet animé remplace l'ellipse. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Ne pas convertir une liaison verticale en porte horizontale sans justification. Vérifier les arrivées avec le groupe.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js).

### MER-VEH-tram — Transport urbain de Chicago

Liaison tram s04–s05 dans les données ; aucun véhicule entier PNG.

**Présent au checkpoint.** Propriétaire : `Seuil urban-transit`. Salles concernées : `s04`, `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay-not-confirmed-novel. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Moyen de transport romanesque à confirmer avant qualification canonique. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Station/voiture seulement si la transition en a besoin. **À vérifier :** Les stations restent distinctes ; ne pas accoler artificiellement les deux intérieurs.

**Garde de continuité.** Conserver le statut de liaison d'adaptation.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js).

### MER-VEH-audio-crawler — Crawler du relevé

Véhicule de transport audio ; non couvert par une image d'excavateur.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s01`, `s02`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Définir la variante audio avant ajout au prologue. **À vérifier :** Ne pas qualifier son absence comme omission romanesque sans passage correspondant.
- **P2 · visual** — Extérieur et accès utiles, sans modèle officiel ou pilotage inventé. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Séparer transport de l'équipe et machine de forage.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

## Vaisseaux et navettes — 5 fiches

### MER-SHIP-carlyle — Carlyle — transport sanitaire

Transport nommé au chapitre 4 ; s03 en condense le contexte.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s03`. Images : `decor/medical`, `decor/cryo`.

**Qualification.** primary-name-no-exterior-design. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P0 · reference** — Qualifier s03 comme Carlyle sans renommer le transport W-Y ultérieur. **À vérifier :** Les deux vaisseaux restent distincts.
- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-contractual-transport — Transport contractuel Weyland-Yutani

Intérieurs présents ; nom et extérieur non établis par les preuves romanesques examinées.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s07`, `s08`, `s09`, `s10`, `s38`, `s39`, `s40`. Images : `decor/cargo`, `decor/viewport`, `decor/cryo`.

**Qualification.** secondary-context-unnamed-in-current-novel-proof. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-shuttle — Navette d'expédition

L'extérieur existe sous decor/dropship ; la soute et la capture sont des surfaces séparées.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s10`, `s11`, `s36`, `s37`. Images : `decor/dropship`, `decor/landing`, `decor/captureBay`.

**Qualification.** secondary-context-project-exterior. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.
- **P2 · animation** — Approche, posé, accès et départ ; une image extérieure n'est pas un vol animé. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-buried-hull — Carène ancienne enfouie

Vestige et brèche ; aucune attribution automatique aux Ingénieurs.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s19`, `s20`. Images : `decor/carene`.

**Qualification.** secondary-context-unidentified-origin. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-audio-kiangya — Kiangya — variante audio

Nom du cargo audio, à conserver distinct de la preuve du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s07`, `s08`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P2 · continuity** — Décider d'une couche audio avant de reprendre ce nom dans le parcours roman. **À vérifier :** Aucune confusion avec Carlyle.
- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

## Terrain et matériaux — 22 fiches

### MER-TERRAIN-alien — Brèche de coque

Famille alien : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s20`. Images : `decor/rib`, `decor/resinCable`, `decor/silicaShard`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-armory — Armurerie

Famille armory : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s09`. Images : `decor/armory`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-bridge — Passerelle de fouille

Famille bridge : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s25`. Images : `decor/bridge`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-camp — Abri Quonset

Famille camp : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s12`. Images : `decor/briefing`, `decor/battery`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-decon — Sas et filtration

Famille decon : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s13`, `s41`. Images : `decor/wash`, `decor/filters`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-derelict — Carène enfouie

Famille derelict : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s19`. Images : `decor/carene`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-hangar — Hangar et soute

Famille hangar : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s10`, `s37`. Images : `decor/dropship`, `decor/cargo`, `decor/cableTray`, `decor/warningStripe`, `decor/captureBay`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-hive — Ruche et résine

Famille hive : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s28`, `s32`. Images : `decor/cocoon`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/eggs`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-home — Appartement habité

Famille home : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s05`. Images : `decor/home`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-lift — Puits et recettes

Famille lift : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s14`, `s15`, `s30`. Images : `decor/hoist-drive`, `decor/winch`, `decor/cableTray`, `decor/warningStripe`, `decor/reel`, `decor/cable`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-medical — Sols et parois médicales

Famille medical : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s03`, `s06`, `s38`, `s40`, `s45`, `s49`. Images : `decor/medical`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `decor/wash`, `decor/quarantine-instruments`, `decor/cryo`, `decor/triage`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-office — Bureaux et locaux civils

Famille office : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s04`, `s08`. Images : `decor/office`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `decor/briefing`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-ossuary — Restes enfouis

Famille ossuary : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s23`. Images : `decor/ossuary`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-power — Desserte énergétique

Famille power : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s18`, `s34`, `s42`, `s48`. Images : `decor/generator`, `decor/pump`, `decor/cableTray`, `decor/warningStripe`, `decor/triage`, `decor/cable`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-queen — Chambre royale

Famille queen : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s33`. Images : `decor/throne`, `decor/eggs`, `decor/resinCable`, `decor/silicaShard`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-relay — Postes de relais

Famille relay : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s16`, `s24`, `s46`. Images : `decor/antenna`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `decor/survey`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-ruins — Fouilles ensevelies

Famille ruins : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s21`, `s22`, `s43`. Images : `decor/excavator`, `decor/survey`, `decor/resinCable`, `decor/silicaShard`, `decor/monolith`, `decor/bridge`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-sand — Sable noir de surface

Famille sand : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s01`, `s02`, `s11`, `s36`. Images : `decor/checkpoint`, `decor/fence`, `decor/cableTray`, `decor/warningStripe`, `decor/drill`, `decor/reel`, `decor/landing`, `decor/antenna`, `decor/ravine`, `decor/cable`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-ship — Coursive et observatoire du transport

Famille ship : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s07`, `s39`. Images : `decor/seal-equipment`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `decor/viewport`, `decor/terminal`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-silica — Tubes de silice

Famille silica : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s26`, `s27`, `s29`, `s44`. Images : `decor/silica`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/amber`, `decor/membrane`, `decor/pipe`, `decor/valve`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-stairs — Escalier et paliers

Famille stairs : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s31`, `s35`. Images : `decor/cableTray`, `decor/winch`, `decor/warningStripe`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-workshop — Ateliers et magasins

Famille workshop : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s17`, `s47`, `s50`. Images : `decor/workbench`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `decor/locker`, `decor/wash`, `decor/cargo`, `decor/battery`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travail restant et critère de clôture :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

## Planètes — 2 fiches

### MER-PLANETE-lv178 — LV-178 / New Galveston

Cadre principal ; noms et sables toxiques confirmés, géographie globale non cartographiée.

**Présent au checkpoint.** Propriétaire : `Territoires et transferts narratifs`. Salles concernées : `s01`, `s02`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-context-no-global-map. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · visual** — Créer vue orbitale ou carte seulement pour une transition utile. **À vérifier :** Continent, lune, dimension ou atmosphère non décrits restent interprétés.
- **P1 · reference** — Coordonnées, distances et géographie complète à documenter. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Conserver alias d'un même corps dans une seule entrée. Ne pas inventer de planète pour remplir la catégorie.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PLANETE-earth — Terre

Retour terrestre et scènes civiles ; Chicago n'est pas une planète supplémentaire.

**Présent au checkpoint.** Propriétaire : `Territoires et transferts narratifs`. Salles concernées : `s04`, `s05`, `s06`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-context-no-global-map. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travail restant et critère de clôture :**

- **P2 · visual** — Créer vue orbitale ou carte seulement pour une transition utile. **À vérifier :** Continent, lune, dimension ou atmosphère non décrits restent interprétés.
- **P1 · reference** — Coordonnées, distances et géographie complète à documenter. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Conserver alias d'un même corps dans une seule entrée. Ne pas inventer de planète pour remplir la catégorie.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

## Ordre de réalisation

| Priorité | Périmètre | Résultat attendu |
| --- | --- | --- |
| P0 | Cinq sources générées et deux demandes refusées | Préserver les sources réellement produites ; contrôler leurs octets et raccords. Garder adulte/plasma et cadavres en repli natif. |
| P1 | Animations, prises et poses | Cycles et attaches observés dans les deux directions ; aucune certification par deux poses isolées. |
| P1 | 50 lieux, 113 seuils | Fond, sol, parois et couches cohérents ; ouvertures physiques, arrivées, groupe et reprise observés. |
| P1 | Scènes et distribution | Interventions des quatre portraits sans placement, capture et fins à rapprocher de passages primaires. |
| P2 | Véhicules, vaisseaux, terrain, planètes | Vues nécessaires avec échelles cohérentes ; silhouettes ou cartes interprétées qualifiées comme telles. |
| P2 | Variante audio | Couche de continuité distincte avant production d'éléments propres à ce support. |

## Règles de production et clôture

- Un PNG par objet, personnage ou pose ; chaque état produit possède provenance, empreintes, pivot et échelle.
- Ne pas modifier collision, inventaire, progression ou sauvegarde pour combler un manque de présentation.
- Une image générée est un candidat ; admission, raccordement et observation sont des étapes distinctes.
- Les cadavres, états consommés, portes intermédiaires et objets détruits ne réemploient pas une image contradictoire.
- Les mesures de gameplay ne deviennent pas des dimensions canoniques.
- Conserver le statut d'adaptation de chaque détail sans preuve primaire.
- Un portrait de dossier ne constitue pas une intervention narrative placée.

Le contrôle de cette bible valide les identifiants et liens de source, les 121 assets de référence, les 50 salles, les sept concepts d’armes, quatorze équipements, dix-sept profils humains et vingt-deux familles de terrain. Les données du graphe sont cohérentes dans ce périmètre. Cette vérification ne produit pas d’image et ne joue pas la campagne. Toute validation future doit citer sa propre version et ses conditions, sans transférer automatiquement les résultats historiques à un nouveau fichier.
