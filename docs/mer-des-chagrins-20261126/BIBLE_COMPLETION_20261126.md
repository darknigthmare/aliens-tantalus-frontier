# La Mer des Chagrins — bible de complétion des huit domaines

**Édition 0.10.5 : 152 PNG, dont 13 nouveaux, et 239 fiches détaillées.** Les 239 fiches et leurs contrats suivent toujours 576 travaux distincts. Chaque édition conserve ses chiffres, ses images et sa portée de preuve.

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

## Édition 0.10.5 — production, raccords et vérification

Cette continuation part du commit publié `7d90c5f81d046c9c8840c48dfed4051c809714e8`. **Treize nouveaux PNG représentent 19 505 614 octets ; le lot atteint 152 fichiers uniques et 290 100 077 octets.** Une seule brèche est réutilisée sur les montages avant et arrière. Les 139 sources et leurs lignes de métadonnées antérieures sont préservées. Le manifeste déclare 148 raccordements de monde et quatre images d’interface ; les 13 nouveaux PNG sont observés dans le rendu Canvas de cette édition. Les [prompts exacts](GENERATION_0_10_5.json) enregistrent 16 appels réussis, 13 images retenues et trois candidats remplacés : deux isolations et un contact de Decker. Aucun refus nouveau, aucune relance des demandes refusées historiquement.

| Source PNG livrée en 0.10.5 | Raccord vérifié et limite |
| --- | --- |
| Manning : quatre poses `manning-walk-…-ready` | Vrai compagnon équipé, chapitre avant 17, déplacement réel et mouvement réduit désactivé. Le pistolet existant est composé dans les mains ; arrêt et tir gardent leurs règles. Quatre poses clés ne certifient pas un cycle complet. |
| Decker : deux contacts `decker-walk-a-ready` et `decker-walk-b-ready` | Vrai joueur au pistolet, debout, en déplacement, hors recharge et travail actif ; les autres armes gardent leur présentation. Arme et lampe restent des compositions attachées. |
| `devices/isolation-closed` | Les quatre dispositifs s19, s25, s31 et s36 après validation de leur propre état `optional`. Aucune conduite ou ressource créée. |
| `devices/console-complete` | Sept dispositifs achevés : s37, s41 à s46. Cette présentation ne remplace ni les consoles d’objectif ni l’appareil ICC. |
| `equipment/sensor-off` | Balise réellement éteinte, après arrêt manuel ou charge nulle ; une balise allumée sans écho reste allumée. |
| `equipment/weakpoint-destroyed` | Les trois attaches de s33 quand leurs points de vie sont nuls. Le mécanisme reste une création de jeu, sans nouveau fait canonique. |
| `doors/rock-breach` | Un seul PNG pour neuf occurrences avant/arrière de sept salles ; les montages gauche/droite conservent leur rendu natif. |
| `doors/boarding-ramp` | Accès réciproque s11 arrière ↔ s37 avant, liaisons `link-42-a` et `link-42-b`. L’image ne crée ni un extérieur de vaisseau ni une animation de vol. |
| `terrain/hive` | Sol de s28 et s32, seules salles de kind `hive` ; parois, œufs, collisions et salle de reine restent distincts. |

### Historique, preuve et statut

Les **239 contrats de production et les 576 descriptions de travaux sont conservés**. Le JSON archive intégralement l’édition 0.10.4 dans `editionHistory[0]` et l’état de chaque fiche dans `productionHistory`. Le registre courant comporte **542 travaux ouverts, 26 réalisés en partie et huit résolus dans leur périmètre déclaré**. Dix travaux passent d’ouvert à partiel sur la preuve 0.10.5 ; la tâche de locomotion de Decker reste partielle avec une preuve supplémentaire. Les huit résolutions historiques — cinq de 0.10.3 et trois de 0.10.4 — sont conservées sans en ajouter. Un PNG produit, un raccord de code, une fixture Canvas et une campagne réellement parcourue restent des preuves de portée différente.

La rampe concerne deux seuils existants. Elle ne complète pas les vues extérieures, la propulsion, la soute ou le départ de la navette. Les cages livrées en 0.10.4 concernent s14/droite et s15/gauche ; elles restent fixes, sans course verticale animée. Les brèches nouvelles concernent s19/avant, s20/arrière, s22/arrière, s26/avant, s27/arrière, s29/avant et arrière, s44/avant et arrière. Les ouvertures, labels, conditions de passage, positions d’arrivée et replis natifs demeurent des obligations de raccord, pas des faits déduits de l’image.

### Vérifications de cette édition

Suite visuelle 0.10.5 : 128/128 tests réussis, zéro échec et zéro ignoré, dont 107 tests de renderer. La QA Canvas décode 152 PNG et observe 140 types d’images, dont les 13 ajouts. Elle comporte 270 cas structurés : 50 salles, 24 cas posture/arme, 16 cas de locomotion historiques, 38 diagnostics dont 19 comparaisons de repli natif, 11 cas médicaux/reine de 0.10.3, 35 cas de 0.10.4 et 96 nouveaux cas. Quinze captures totalisent 13 417 720 octets. Les 139 sources et métadonnées précédentes, la simulation et les sauvegardes des fixtures restent préservées. Ces fixtures ne sont pas une campagne parcourue dans un navigateur ; aucun cycle complet ni fidélité globale 1:1 n’est certifié.

Les 96 cas nouveaux couvrent 36 présentations de marche armée, 22 états de dispositifs, cinq états de capteur, six états d’attaches, 22 états de portes et cinq cas de sol. Les 22 états de portes représentent neuf brèches et deux rampes, chacune ouverte et fermée. Les 22 états de dispositifs représentent quatre isolations et sept consoles avant/après ; dix dispositifs passent par `finishDevice` natif après préparation du travail, tandis que l’embarquement est un état explicitement préparé. Les points d’attache des armes et de la lampe, l’indicateur réel du capteur, les parois, labels, marqueurs d’approche et replis des montages incompatibles ont leur portée de contrôle propre.

Le [reçu final 0.10.5](VALIDATION_0_10_5.json) consigne ces résultats. Les [poses armées](canvas-0.10.5/armed-gaits.png) et les [états, portes et sols](canvas-0.10.5/states-portals.png) sont des planches de diagnostic de fixtures déclarées. Aucun nouveau parcours navigateur, test global `test:all` ou build global n’est déclaré par cette preuve.

**Limite technique de QA.** Une exception `drawImage` injectée après la peinture des pans de façade peut les faire repeindre par le repli natif sur cette seule frame ; le PNG passe ensuite à l’état `failed`. Cette injection conserve l’état de simulation et une pile Canvas équilibrée ; elle ne décrit pas une panne du rendu normal. Le repli préalable d’une image absente, en chargement ou invalide demeure distinct.

### Manques qui restent ouverts dans les huit domaines

| Domaine | Travail encore nécessaire après cette production limitée |
| --- | --- |
| Personnages | Transitions réelles de Decker et Manning, tir, recharge et interactions ; anatomie et seconde main des armes longues ; interventions des portraits sans placement ; référence primaire des apparences et de la capture. |
| Lieux | Parcours des seuils avec verrouillage, retour, groupe et reprise ; plans, arrivées, parois et couches des 50 salles. Une image de sol ou d’ouverture ne constitue pas un stage complet. |
| Armes | Contrôle des prises et occlusions, de la crosse du lance-flammes et des cycles réellement disponibles. Les refus historiques adulte/plasma/flame-compact ne sont pas relancés. |
| Props | États intermédiaires et actions réellement jouées des dispositifs ; extinction, récupération et batterie des balises ; contrôles séparés des trois attaches détruites. Aucun état d’œuf ouvert n’est inventé. |
| Véhicules | Référence des modèles, dimensions et marquages ; cabine, suspension et course des cages seulement si un trajet animé est réellement implémenté. Aucun véhicule complet nouveau dans cette passe. |
| Vaisseaux | Vues extérieures cohérentes et accès documentés ; maintien de la distinction Carlyle, transport contractuel, navette, appareil enfoui et variante audio. La rampe couvre un accès, pas l’ensemble du vaisseau. |
| Terrain | Parois, plafonds, profondeur et raccord des deux projections sur les chemins réels ; le sol de ruche ne couvre que s28/s32. Matières et palettes restent interprétées. |
| Planètes | Données primaires et usages précis avant de produire d’autres vues. Le globe LV-178 de 0.10.4 ne certifie aucune géographie ; la Terre n’a pas de nouveau raccord orbital. |

### Références relues le 26 novembre 2026

La [notice officielle Titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/) étaye le cadre de Decker, LV-178/New Galveston et la mission. Le [chapitre 4 autorisé chez JoBlo](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/) étaye la scène médicale du Carlyle. Le [chapitre 5 chez Gizmodo](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409) situe Chicago et le bureau de Harriman. Ces références ne fournissent pas les dessins cotés des nouveaux états industriels, des brèches ou de la rampe. Les silhouettes héritées du projet restent des interprétations.

Le script audio demeure une référence historique de continuité distincte ; il n’a pas été relu pour cette édition. Le roman intégral n’a pas été confronté. **Ni l’exhaustivité de ses manquants, ni des cycles complets, ni une fidélité globale 1:1 ne sont certifiés.** Les refus de génération des éditions précédentes sont conservés sans relance.

### CI du checkpoint parent — observation séparée

La lecture du 26 novembre 2026 concerne uniquement le commit parent `7d90c5f81d046c9c8840c48dfed4051c809714e8`. Les workflows Full release et V162 étaient encore en cours. Deux jobs V163 étaient en échec : [rigs-v165](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45831807427/job/139950408573) et [trials](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45831807427/job/139950408644). Leurs symptômes relèvent de parcours Xeno Trials — attente d’introduction, capture Prowler et déploiement Broodstorm — sans import du DLC Mer dans ces parcours. Les causes n’ont pas été reproduites lors de cet audit. Cette observation ne certifie ni une indépendance causale absolue, ni la CI de 0.10.5, ni un succès global du dépôt.

## Édition 0.10.4 — checkpoint historique et production par état

**13 nouveaux PNG, 139 fichiers uniques dans le lot courant.** Le relevé de référence reste à 121 images ; les cinq ajouts 0.10.3 restent leur propre checkpoint. Les 13 sources de cette passe représentent 24 115 511 octets. Les [prompts exacts](GENERATION_0_10_4.json), le [manifeste 0.10.4 épinglé](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/7d90c5f81d046c9c8840c48dfed4051c809714e8/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json) et le [reçu de validation](VALIDATION_0_10_4.json) distinguent production, raccordement et vérification.

| Asset de cette passe | État ou usage couvert |
| --- | --- |
| `characters/decker-focus` | Concentration native, seulement à l’arrêt, non armé, hors s03, sans posture réduite ni travail actif ; aucune capacité ajoutée. |
| `characters/decker-medical-report` | Consultation debout de s03 pendant activeWork o02-01, à l’arrêt et non armé ; appareil tenu unique, pose de couchette non produite. |
| `characters/decker-walk-pass-a` | Pose de passage de marche A, distincte des deux contacts historiques ; usage soumis au déplacement non armé. |
| `characters/decker-walk-pass-b` | Pose de passage B intégrée entre les contacts historiques ; genou haut et transitions encore sommaires, cycle complet non certifié. |
| `decor/medical-chart` | Dossier papier posé sur la couchette existante de s03 ; pas de données personnelles ou de nouvelle action médicale. |
| `decor/medical-cups` | Deux contenants sur le meuble existant de s03 ; un seul PNG et aucune nouvelle consommation jouable. |
| `devices/parts-empty` | Dispositif après collecte/validation, avec indication VIDE ; marqueurs, ressources et interactions natifs conservés. |
| `doors/lift-cage` | Cage intégrée aux deux vrais seuils s14/droite et s15/gauche ; parois, rails, barres fermées, labels et transitions natifs conservés. Aucun trajet vertical animé. |
| `equipment/locker-stocked` | Casier ouvert avec réserves génériques ; l’image ne compte pas chaque objet réel. Après épuisement, ancien locker-open vide et dépôt encore possible. |
| `equipment/supply-empty` | État de fourniture épuisée selon supplyUsed ; aucun stock restitué. |
| `planets/lv178-orbital` | Illustration orbitale cadrée dans la baie de s39 ; globe interprété, cadre et signal strike_seen natifs conservés. |
| `terrain/sand` | Texture de surface limitée au sol sand ; aucune carte ou topographie canonique revendiquée. |
| `terrain/silica` | Texture de surface limitée au sol silica ; les gravats et passages gardent leur géométrie native. |

**Réemploi contrôlé.** Le PNG historique `equipment/locker-open` est déjà vide ; `equipment/armory-rack` est un cadre sans arme. Leur réemploi après épuisement ou acquisition ne compte pas comme une nouvelle image. Les états et ressources demeurent ceux de la simulation.

**Production et limites artistiques.** Seize appels de génération ont donné treize fichiers retenus, deux versions de cage remplacées et un refus pour `weapons/flame-compact`. Aucun PNG refusé ou remplacé n’entre dans les treize ajouts. La crosse du lance-flammes historique et l’appui de sa seconde main restent imparfaits. Le passage B de marche lève fortement le genou ; les transitions des quatre poses restent sommaires. Concentration et rapport sont des poses fixes conditionnelles, pas des cycles complets.

### Ce que signifie le statut courant

Les **576 travaux identifiés** du checkpoint sont conservés mot pour mot dans le JSON. Le nouveau registre `currentWorkLedger` donne leur statut courant et la version de la preuve. Les tâches de source, d’animation, de scène ou de parcours restent indépendantes de la simple présence du PNG.

| Statut du registre courant | Travaux |
| --- | ---: |
| Ouvert | 552 |
| Réalisé en partie | 16 |
| Résolu dans le périmètre déclaré | 8 |

Ces comptes ne sont pas une mesure de fidélité, de temps restant ou de pourcentage de jeu terminé. Les **239 fiches possèdent désormais un contrat de production propre à leur type**, en plus des placements, sources et critères historiques. Aucun des huit domaines n’est déclaré intégralement achevé.

**Vérifications 0.10.4.** Suite visuelle finale : 105/105 tests réussis, zéro échec et zéro ignoré. Les 139 PNG sont contrôlés (270 594 463 octets), les 126 images et lignes de métadonnées antérieures préservées. La QA Canvas finale décode 139 images, rend 50 salles, 24 cas posture/arme, 16 locomotions, 42 diagnostics dont 23 replis de porte identiques pixel par pixel, 11 cas médicaux/reine historiques et 35 cas de cette édition. Les 13 nouveaux PNG sont effectivement dessinés parmi 125 types observés. Treize captures finales totalisent 11 375 616 octets. Les salles, positions, états et grossissements sont des fixtures déclarées ; il ne s’agit pas d’une campagne parcourue dans un navigateur. Aucun cycle complet d’animation ni fidélité globale 1:1 n’est certifié.

**Fidélité.** Les dimensions, palettes, détails de matière, globe et dessins industriels sont des interprétations du projet. Le chapitre 4 étaye seulement les traits explicitement décrits de la scène médicale. Le roman intégral et les variantes audio ne sont pas confrontés ; `canonicalOneToOneCertified` reste faux.

## Édition 0.10.3 — checkpoint historique de cinq ajouts

**126 PNG individuels, 246 478 952 octets** : les 121 du checkpoint et cinq nouvelles sources inchangées. Les métadonnées de ce checkpoint sont dans le [manifeste 0.10.3 épinglé](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/fbab4f4a2f26d5a6561e70c0dfe76839aa3eb474/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), les prompts exacts dans [GENERATION_0_10_3.json](GENERATION_0_10_3.json), les preuves dans [VALIDATION_0_10_3.json](VALIDATION_0_10_3.json).

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

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `characters/decker-walk-a-ready`, `characters/decker-walk-b-ready`. Contact de marche au pistolet du vrai joueur debout ; mains vides rapprochées, arme existante composée et lampe attachée si équipée. Deux contacts ne certifient pas un cycle complet.

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Alan Decker entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.

**Ajouts 0.10.4 liés à cette fiche :** `characters/decker-focus`, `characters/decker-medical-report`, `characters/decker-walk-pass-a`, `characters/decker-walk-pass-b`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PERS-decker-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.


Inspecteur ICC, civil

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `characters/decker-crouch-ready`, `characters/decker-crouch`, `characters/decker-dodge-ready`, `characters/decker-dodge`, `characters/decker-ready`, `characters/decker-walk-a`, `characters/decker-walk-b`, `characters/decker`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Fonction ICC confirmée par Titan. Visage, yeux, coiffure et mesures non vérifiés.

**Qualification.** documented-role-incomplete-appearance. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Fonction ICC confirmée par Titan. Visage, yeux, coiffure et mesures non vérifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les deux contacts de marche puis course, visée, tir, recharge, interaction et franchissements réellement disponibles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · visual** — Recaler la seconde main et les proportions entre repos, accroupi, esquive et tenue d'arme longue. **À vérifier :** Attaches mesurées et anatomie cohérente dans les deux directions, sans modifier le collider.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-manning — Manning

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `characters/manning-walk-a-ready`, `characters/manning-walk-pass-a-ready`, `characters/manning-walk-b-ready`, `characters/manning-walk-pass-b-ready`. Pose clé du déplacement armé de Manning ; le pistolet existant est composé dans les mains. Le portrait et les copies de présentation restent distincts du vrai compagnon.

**Avancement des travaux du checkpoint :** `MER-PERS-manning-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Manning entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Chef mercenaire

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`. Images : `characters/manning-ready`, `characters/manning`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Cheveux noirs grisonnants et forte carrure : notice Xenopedia. Tenue et visage interprétés.

**Qualification.** documented-role-incomplete-appearance. Références : [manning](https://avp.fandom.com/wiki/Manning), [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Cheveux noirs grisonnants et forte carrure : notice Xenopedia. Tenue et visage interprétés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Marche, arrêt, tir et reprise du compagnon ; les deux images présentes ne sont pas des cycles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Documenter précisément sa participation à la capture finale avant de la reconstruire. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-adams — Adams

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Adams entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 2 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Mercenaire puis porteuse

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s09`, `s12`. Images : `characters/adams`, `stretchers/adams`, `parasites/royal`.

**Placement.** `s09` : objectif 0 inclus à 9 exclu ; `s12` : objectif 0 inclus à 15 exclu

**Description et limite héritées.** Peau hâlée, cheveux auburn courts et taches de rousseur : notice Xenopedia. Parasite adhérent royal, plus volumineux et à doigts palmés : notice secondaire ; échelle graphique interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [adams](https://avp.fandom.com/wiki/Adams), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Peau hâlée, cheveux auburn courts et taches de rousseur : notice Xenopedia. Parasite adhérent royal, plus volumineux et à doigts palmés : notice secondaire ; échelle graphique interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — États vivants nécessaires, transport, halte et arrimage avec maintien du parasite. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · visual** — Rapprocher l'identité debout, le portrait et le patient transporté. **À vérifier :** Attache au visage et contamination cohérentes jusqu'à la stase.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-elway — Elway

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Elway entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Mercenaire puis porteur

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s10`. Images : `characters/elway`, `stretchers/elway`, `parasites/normal`.

**Placement.** `s10` : objectif 0 inclus à 10 exclu

**Description et limite héritées.** Rôle de porteur recoupé. Apparence non vérifiée.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Rôle de porteur recoupé. Apparence non vérifiée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — États vivants nécessaires, transport, halte et arrimage avec maintien du parasite. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · visual** — Rapprocher l'identité debout, le portrait et le patient transporté. **À vérifier :** Attache au visage et contamination cohérentes jusqu'à la stase.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-rollins — Andrea Rollins

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Andrea Rollins entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 2 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Mandataire Weyland-Yutani

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s08`, `s38`. Images : `characters/rollins`.

**Placement.** `s08` : objectif 0 inclus à 8 exclu ; `s38` : objectif 30 inclus à 34 exclu

**Description et limite héritées.** Cheveux bruns indiqués par Xenopedia. Pas de visage emprunté à la comédienne audio ; tenue interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [rollins](https://avp.fandom.com/wiki/Andrea_Rollins), [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Cheveux bruns indiqués par Xenopedia. Pas de visage emprunté à la comédienne audio ; tenue interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-harriman — Walter Harriman

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Walter Harriman entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Commission, Chicago

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s04`. Images : `characters/harriman`.

**Placement.** `s04` : objectif 0 inclus à 8 exclu

**Description et limite héritées.** Nom et bureau à Chicago : extrait public. Apparence non vérifiée.

**Qualification.** documented-role-incomplete-appearance. Références : [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Nom et bureau à Chicago : extrait public. Apparence non vérifiée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-rand — Lucas Rand

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Lucas Rand entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Chantier de relevés

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s01`. Images : `characters/rand`.

**Placement.** `s01` : objectif 0 inclus à 2 exclu

**Description et limite héritées.** Rôle de chantier : référence secondaire. Apparence interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Rôle de chantier : référence secondaire. Apparence interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-bronson — Bronson

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Bronson entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Technicien du chantier

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s02`. Images : `characters/bronson`.

**Placement.** `s02` : objectif 0 inclus à 2 exclu

**Description et limite héritées.** Nom dans le relevé secondaire. Apparence non vérifiée.

**Qualification.** documented-role-incomplete-appearance. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Nom dans le relevé secondaire. Apparence non vérifiée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-badejo — Badejo

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Badejo entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Technicien du chantier

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s02`. Images : `characters/badejo`.

**Placement.** `s02` : objectif 0 inclus à 2 exclu

**Description et limite héritées.** Nom dans le relevé secondaire. Aucune apparence déduite du patronyme.

**Qualification.** documented-role-incomplete-appearance. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Nom dans le relevé secondaire. Aucune apparence déduite du patronyme. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-medic — Équipe médicale

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Équipe médicale entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 2 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Personnel non individualisé

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s03`, `s06`. Images : `characters/medic`.

**Placement.** `s03` : objectif 0 inclus à 33 exclu ; `s06` : objectif 0 inclus à 8 exclu

**Description et limite héritées.** Rôle composite de la mise en scène ; ne remplace pas un portrait de Markowitz ou Herschel.

**Qualification.** original-composite. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · design** — Conserver l'identité composite et ne pas la rebaptiser pour combler une identité nommée. **À vérifier :** Le statut original demeure visible.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-cho — Cho

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Cho entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Relais mercenaire

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s16`. Images : `characters/cho`.

**Placement.** `s16` : objectif 0 inclus à 21 exclu

**Description et limite héritées.** Rôle de relais établi par source secondaire. Apparence non vérifiée ; aucune origine déduite du nom.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Rôle de relais établi par source secondaire. Apparence non vérifiée ; aucune origine déduite du nom. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-silas — Silas

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Silas entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Équipe archéologique

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/silas`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Présence dans le dossier d’incident ; apparition vivante non ajoutée arbitrairement.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Présence dans le dossier d’incident ; apparition vivante non ajoutée arbitrairement. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-muller — Muller

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Muller entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Mercenaire de la remontée

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/muller`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Rôle attesté secondairement ; apparence interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Rôle attesté secondairement ; apparence interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-dave — Dave

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Dave entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Mercenaire de la remontée

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/dave`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Rôle attesté secondairement ; apparence interprétée.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Rôle attesté secondairement ; apparence interprétée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-pritchett — Pritchett

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Pritchett entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Pilote de la navette

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Images : `characters/pritchett`.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Pilote cité ; mort scénarisée détaillée non reconstituée dans cette passe.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Pilote cité ; mort scénarisée détaillée non reconstituée dans cette passe. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · integration** — Le portrait existe, mais aucun room.cast ne place ce rôle ; documenter ses interventions et son devenir avant création de scène. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Produire les seules poses requises par ces scènes ; ne pas réintroduire vivant un rôle dont le devenir l'interdit. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-cherbourg — Cherbourg

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Cherbourg entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 1 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Commandement du transport

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Salles concernées : `s39`. Images : `characters/cherbourg`.

**Placement.** `s39` : objectif 31 inclus à 34 exclu

**Description et limite héritées.** Nom dans le relevé secondaire. Apparence et uniforme non vérifiés.

**Qualification.** documented-role-incomplete-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Nom dans le relevé secondaire. Apparence et uniforme non vérifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Prévoir parole, posture de consultation ou gestes professionnels seulement pour les actions de sa scène. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-worker — Personnel

**Contrat de production courant.** Conserver identité, visage de référence du projet, palette et tenue de Personnel entre ses vues. Raccorder uniquement aux actions natives : joueur/compagnon ou fenêtres des 0 placements statiques recensés ; un portrait ne crée pas de placement. Pose, ligne des pieds, pivot, mains et occlusion doivent rester cohérents dans les deux directions ; les mesures sont artistiques, pas canoniques.


Figuration composite

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.castForRoom ; voies propres au joueur et au compagnon`. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Placement.** Pas de placement statique room.cast ; voir la voie du protagoniste/compagnon ou le statut de portrait.

**Description et limite héritées.** Figuration originale.

**Qualification.** original-composite. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · design** — Conserver l'identité composite et ne pas la rebaptiser pour combler une identité nommée. **À vérifier :** Le statut original demeure visible.
- **P2 · visual** — Aucun PNG dédié : ce profil sert de repli humain natif. **À vérifier :** Produire seulement si une scène requiert une figuration individualisée.

**Garde de continuité.** Conserver les fenêtres d'objectifs, le rôle et le devenir. Distinguer portrait, acteur placé, patient et animation jouée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/main.js](../../dlc/sea-of-sorrows/src/main.js).

### MER-PERS-adult — Adulte xénomorphe

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.


Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s34`, `s35`, `s36`, `s48`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `generation-refused-native-fallback`.

**Qualification.** adaptation-specific-body-unverified. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · visual** — Le PNG correspondant est absent au checkpoint. **À vérifier :** Corps entier, alpha, pivot et raccord au kind exact ; repli natif disponible.
- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG de cadavre correspondant. **À vérifier :** Conserver le cadavre natif jusqu'à production d'un état de mort distinct.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-queen — Reine

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `equipment/weakpoint-destroyed`. Résidu des trois attaches après hp <= 0. Les attaches sont une mécanique du projet ; cette image ne constitue pas une description canonique de la reine.

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.

**Avancement des travaux du checkpoint :** `MER-PERS-queen-W01` — Résolu dans le périmètre déclaré (0.10.3). Les autres travaux de cette fiche restent ouverts.


Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s33`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Reine fixe raccordée au kind queen, pivot aux pieds et hauteur425. Cadavre natif conservé ; morphologie filmique adaptée, cycles et mécanisme des trois attaches non clôturés. Source : [creatures/queen.png](../../dlc/sea-of-sorrows-visual/sprites/creatures/queen.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** adaptation-specific-body-unverified. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · visual** — Le PNG correspondant est absent au checkpoint. **À vérifier :** Corps entier, alpha, pivot et raccord au kind exact ; repli natif disponible.
- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG de cadavre correspondant. **À vérifier :** Conserver le cadavre natif jusqu'à production d'un état de mort distinct.
- **P1 · narrative** — Réexaminer les trois attaches du boss, mécanisme original. **À vérifier :** Conserver son étiquette d'adaptation ou proposer une scène attestée avec reprise compatible.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-facehugger — Facehugger libre

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.


Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s32`, `s50`. Images : `creatures/facehugger`, `corpses/facehugger`.

**État de production.** `baseline`.

**Qualification.** adaptation-specific-body-unverified. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-captureAdult — Adulte de capture

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.

**Avancement des travaux du checkpoint :** `MER-PERS-captureAdult-W01` — Réalisé en partie (0.10.3); `MER-PERS-captureAdult-W05` — Réalisé en partie (0.10.3). Les autres travaux de cette fiche restent ouverts.


Population native, dimensions et statistiques de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.alien / populations persistées`. Salles concernées : `s37`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `baseline`.

**Qualification.** adaptation-specific-body-unverified. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · visual** — Rôle de simulation distinct, même adulte biologique : définir explicitement l'alias de présentation, sans inventer une espèce. **À vérifier :** Corps entier, alpha, pivot et raccord au kind exact ; repli natif disponible.
- **P1 · animation** — Locomotion, alerte, préparation, attaque, interruption, mousse et mort à raccorder aux états réels. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · reference** — Morphologie et proportions spécifiques au roman non authentifiées par une référence visuelle détaillée. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG de cadavre correspondant. **À vérifier :** Conserver le cadavre natif jusqu'à production d'un état de mort distinct.
- **P0 · integration** — L'alias ne doit modifier ni identité, ni vie, ni échec à la mort du spécimen. **À vérifier :** La capture reste conditionnée à un adulte vivant, immuable comme acteur.

**Garde de continuité.** Observer état avant/après et reprise. Ne pas confondre acteur actif et cadavre.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-parasite-normal — Parasite adhérent normal

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.


Superposition au visage du patient ; distinct du facehugger libre.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stretcher / stasisDisplay`. Salles concernées : `s34`, `s35`, `s36`, `s37`, `s38`. Images : `parasites/normal`.

**Qualification.** secondary-detail-project-scale. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Forme et rapport d'échelle détaillés à confronter au texte ; 1,27 est un réglage du projet. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Mouvements respiratoires ou doigts seulement si utiles et lisibles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Maintenir la contamination ; une seule application de l'échelle. Vérifier l'attache sur le patient.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-parasite-royal — Parasite adhérent royal

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.


Superposition au visage du patient ; distinct du facehugger libre.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stretcher / stasisDisplay`. Salles concernées : `s34`, `s35`, `s36`, `s37`, `s38`. Images : `parasites/royal`.

**Qualification.** secondary-detail-project-scale. Références : [adams](https://avp.fandom.com/wiki/Adams), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Forme et rapport d'échelle détaillés à confronter au texte ; 1,27 est un réglage du projet. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Mouvements respiratoires ou doigts seulement si utiles et lisibles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Maintenir la contamination ; une seule application de l'échelle. Vérifier l'attache sur le patient.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-egg — Œuf xénomorphe

**Contrat de production courant.** Préserver le kind de simulation et ses états biologiques ; aucune nouvelle caste créée par une variante graphique. Séparer silhouette vivante, parasite attaché, état immobilisé et mort quand ces états existent ; conserver leur repli natif. Vérifier contacts, proportions, direction, cible et interruption sur le propriétaire de rendu indiqué.


Élément de ponte distinct de la population adulte.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.egg`. Salles concernées : `s32`, `s33`. Images : `organic/egg`, `decor/eggs`.

**Qualification.** adaptation-appearance. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Apparence, dimensions et marquages sans référence primaire précise. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Créer ouvert/fermé et transition seulement si un déclenchement d'éclosion existe ; une image fixe ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Associer l'image à l'état natif du danger.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-carlyle-physician — Médecin anonyme du Carlyle

**Contrat de production courant.** La variante du médecin anonyme habille le cast medic existant de s03, sans renommer le profil composite ailleurs ni remplacer ses portraits. Conserver les traits explicitement décrits dans la source et l’identité graphique du projet ; le visage exact reste interprété. Consultation assise, geste vers le dossier et retour à la pose demeurent des besoins d’animation séparés du sprite debout.

**Avancement des travaux du checkpoint :** `MER-PERS-carlyle-physician-W01` — Résolu dans le périmètre déclaré (0.10.3); `MER-PERS-carlyle-physician-W02` — Réalisé en partie (0.10.3). Les autres travaux de cette fiche restent ouverts.


Identité non nommée du chapitre 4 ; distincte du composite médical.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Sprite du médecin anonyme utilisé pour le cast medic en s03 seulement. Le profil composite, ses portraits et ses usages dans les autres salles restent distincts. Source : [characters/carlyle-physician.png](../../dlc/sea-of-sorrows-visual/sprites/characters/carlyle-physician.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** primary-described-appearance-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · visual** — Source générée : blouse blanche, chignon brun grisonnant, lunettes, corpulence forte ; visage exact interprété. **À vérifier :** Comparer les traits décrits, mesurer pivot et silhouette puis vérifier les octets publiés.
- **P0 · integration** — Raccorder au seul contexte médical s03 ; conserver medic ailleurs. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Posture de consultation et geste vers le dossier ; le sprite fixe ne fournit pas ces cycles. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Ne lui attribuer ni Markowitz ni Herschel. Vérifier s03 et s06 pour empêcher un remplacement global.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-decker-medical-gown — Decker — tenue hospitalière du Carlyle

**Contrat de production courant.** Variante médicale du joueur limitée à s03 et à son état non armé ; les poses normales ou armées restent distinctes. Pendant la transmission native o02-01, utiliser la pose de rapport seulement si les conditions de travail sont satisfaites ; un seul appareil ICC visible. La consultation debout produite ne représente pas les positions assise/allongée ni le lever de la couchette ; ces actions restent ouvertes.

**Ajouts 0.10.4 liés à cette fiche :** `characters/decker-medical-report`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PERS-decker-medical-gown-W01` — Résolu dans le périmètre déclaré (0.10.3); `MER-PERS-decker-medical-gown-W02` — Réalisé en partie (0.10.3). Les autres travaux de cette fiche restent ouverts.


Variante de Decker ; aucune nouvelle identité.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Variante fixe non armée de Decker en s03 ; aucune mutation de santé, d'inventaire, de collision ou de sauvegarde. La tenue normale reprend hors de ce contexte. Source : [characters/decker-medical-gown.png](../../dlc/sea-of-sorrows-visual/sprites/characters/decker-medical-gown.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** primary-costume-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · visual** — Source générée de la tenue hospitalière ; coupe, matière et portrait restent l'interprétation du projet. **À vérifier :** Pivot et proportions compatibles ; mesurer et vérifier les octets publiés.
- **P0 · integration** — Limiter le costume à s03 et conserver la présentation normale ailleurs. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P2 · animation** — Assis/allongé et lever si la scène est développée ; le sprite debout ne les prouve pas. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Ne changer ni inventaire, ni santé, ni collision. Vérifier le retour au costume normal.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PERS-check-markowitz — Markowitz

**Contrat de production courant.** Résoudre identité, continuité et passage source avant une nouvelle silhouette. Ne pas transformer un nom à vérifier en acteur placé ; aucune apparence de comédien empruntée par défaut.


Nom cité par une limite du registre historique, sans preuve primaire relue dans cette passe.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `blocked-by-reference`.

**Qualification.** unverified-historical-name. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Résoudre rôle, scène et statut dans le texte primaire avant portrait ou placement. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Ne pas rebaptiser le médecin anonyme ou le composite.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json).

### MER-PERS-check-herschel — Herschel

**Contrat de production courant.** Résoudre identité, continuité et passage source avant une nouvelle silhouette. Ne pas transformer un nom à vérifier en acteur placé ; aucune apparence de comédien empruntée par défaut.


Nom cité par une limite du registre historique, sans preuve primaire relue dans cette passe.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `blocked-by-reference`.

**Qualification.** unverified-historical-name. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Résoudre rôle, scène et statut dans le texte primaire avant portrait ou placement. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Ne pas rebaptiser le médecin anonyme ou le composite.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json).

### MER-PERS-audio-piotrowicz — Piotrowicz

**Contrat de production courant.** Résoudre identité, continuité et passage source avant une nouvelle silhouette. Ne pas transformer un nom à vérifier en acteur placé ; aucune apparence de comédien empruntée par défaut.


Rôle de la dramatique audio ; aucune incorporation automatique au parcours roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

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

**Contrat de production courant.** Stage de Poste de contrôle : conserver la largeur de jeu 1960 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Portique de surveillance ; bornes météo ; clôture ouverte ; câbles enterrés ; traces de chenilles. Seuils à garder sur leur support : exterior-path ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/sand`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Des herbes rases butent sur une bande de sable noir. Le poste reste relié à la voie de service.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s01`. Images : `decor/checkpoint`, `decor/fence`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/rand`, `equipment/archive`.

**Implantation.** Largeur 1960 unités de jeu ; projection `DEPTH`. Portique de surveillance ; bornes météo ; clôture ouverte ; câbles enterrés ; traces de chenilles. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-01-a` → `s02` : Continuité du terrain au bord droit ; pas de porte industrielle isolée.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste de contrôle ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s02 — Le carottier

**Contrat de production courant.** Stage de Le carottier : conserver la largeur de jeu 2240 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Carottier ancré ; vérins ; caisse de prélèvement ; manche à air ; balises de périmètre. Seuils à garder sur leur support : exterior-path, transit ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/sand`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Le forage repose sur une plateforme dissymétrique au-dessus des tubes de silice. Une passerelle permet de contourner la machine.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s02`. Images : `decor/drill`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/bronson`, `characters/badejo`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2240 unités de jeu ; projection `DEPTH`. Carottier ancré ; vérins ; caisse de prélèvement ; manche à air ; balises de périmètre. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o01-01` — Relever le carottier (sample).

**Connexions.** `link-01-b` → `s01` : Continuité du terrain au bord gauche ; pas de porte industrielle isolée. `link-02-a` → `s03` : Point de départ médical au bord droit ; transfert narratif, pas de couloir continu.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Le carottier ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s03 — Transport sanitaire

**Contrat de production courant.** Stage de Transport sanitaire : conserver la largeur de jeu 1580 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Couchette ; moniteur ; écran de télémétrie ; rangement mural ; hublot oblong. Seuils à garder sur leur support : transit ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `characters/decker-medical-report`, `decor/medical-chart`, `decor/medical-cups`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-LIEU-s03-W01` — Réalisé en partie (0.10.3). Les autres travaux de cette fiche restent ouverts.


Une courte cabine pressurisée : couchette à gauche, terminal médical au centre, sas à droite.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s03`. Images : `decor/medical`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `characters/medic`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1580 unités de jeu ; projection `SIDE`. Couchette ; moniteur ; écran de télémétrie ; rangement mural ; hublot oblong. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o02-01` — Transmettre les résultats (analyse).

**Connexions.** `link-03-a` → `s04` : Point de départ médical au bord droit ; transfert narratif, pas de couloir continu.

**Arrivées seules.** `link-02-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · integration** — Rattacher Carlyle et les trois présentations médicales au seul contexte s03, avec o02-01 inchangé. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.
- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Transport sanitaire ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s04 — Commission · bureau de Harriman

**Contrat de production courant.** Stage de Commission · bureau de Harriman : conserver la largeur de jeu 1960 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Bureaux ; imprimante ; casiers ; rangements documentaires ; baie sur les voies urbaines. Seuils à garder sur leur support : bulkhead, urban-transit ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Les guichets ouvrent sur une salle de consultation. Les fenêtres montrent la ville et non le chantier minier.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s04`. Images : `decor/office`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/harriman`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1960 unités de jeu ; projection `HYBRID`. Bureaux ; imprimante ; casiers ; rangements documentaires ; baie sur les voies urbaines. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o03-01` — Déposer les conclusions (terminal).

**Connexions.** `link-04-a` → `s05` : Accès au transport urbain au bord droit ; stations distinctes, pas de pièce adjacente. `link-05-a` → `s06` : Ouverture dans la paroi latérale gauche.

**Arrivées seules.** `link-03-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Commission · bureau de Harriman ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s05 — Appartement de Decker

**Contrat de production courant.** Stage de Appartement de Decker : conserver la largeur de jeu 1800 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Table ; assises ; rangement bas ; dessins ; terminal familial ; fenêtre sur la rue. Seuils à garder sur leur support : interlude, urban-transit ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Un logement habité, pas une arène. Des affaires familiales occupent le fond ; une circulation libre mène au terminal personnel.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s05`. Images : `decor/home`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1800 unités de jeu ; projection `SIDE`. Table ; assises ; rangement bas ; dessins ; terminal familial ; fenêtre sur la rue. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o03-03` — Écouter le message familial (message).

**Connexions.** `link-04-b` → `s04` : Accès au transport urbain au bord gauche ; stations distinctes, pas de pièce adjacente. `link-06-a` → `s07` : Départ de séquence au bord droit ; changement de lieu ou de temps clairement identifié.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Appartement de Decker ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s06 — Consultation · retour sur Terre

**Contrat de production courant.** Stage de Consultation · retour sur Terre : conserver la largeur de jeu 1660 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Table d’examen ; rideau ; analyseur ; lave-mains ; dossier patient. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Le cabinet médical est relié à la Commission par la circulation publique. Un écran isole la table d’examen.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s06`. Images : `decor/medical`, `decor/wash`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/medic`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1660 unités de jeu ; projection `HYBRID`. Table d’examen ; rideau ; analyseur ; lave-mains ; dossier patient. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o03-02` — Passer les examens (medical).

**Connexions.** `link-05-b` → `s04` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Consultation · retour sur Terre ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s07 — Coursive sous garde

**Contrat de production courant.** Stage de Coursive sous garde : conserver la largeur de jeu 1720 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Caméra ; grille de ventilation ; banc fixé ; canalisation ; voyant de verrou. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une coursive surveillée relie l’infirmerie à la salle d’entretien. Les portes de service ne mènent pas à un autre monde.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s07`. Images : `decor/seal-equipment`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`.

**Implantation.** Largeur 1720 unités de jeu ; projection `SIDE`. Caméra ; grille de ventilation ; banc fixé ; canalisation ; voyant de verrou. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-07-a` → `s08` : Ouverture dans la paroi latérale droite.

**Arrivées seules.** `link-06-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Coursive sous garde ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s08 — La salle d’entretien

**Contrat de production courant.** Stage de La salle d’entretien : conserver la largeur de jeu 1760 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Console ; deux fauteuils ; écran dossier ; armoire scellée ; vitrage technique. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Deux sièges se font face, séparés par une console. Le vitrage laisse voir les coursives du bord.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s08`. Images : `decor/office`, `decor/briefing`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/rollins`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 1760 unités de jeu ; projection `HYBRID`. Console ; deux fauteuils ; écran dossier ; armoire scellée ; vitrage technique. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o04-01` — Écouter Rollins (talk).

**Connexions.** `link-07-b` → `s07` : Ouverture dans la paroi latérale gauche. `link-08-a` → `s09` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de La salle d’entretien ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s09 — Réserve d’équipement

**Contrat de production courant.** Stage de Réserve d’équipement : conserver la largeur de jeu 2080 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Racks ancrés ; combinaisons ; chargeurs ; malle de filtres ; casiers numérotés. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Trois travées stockent l’équipement de l’expédition. Les passages entre les racks permettent de changer de profondeur. Implantation v0.3 : magasins en vis-à-vis. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s09`. Images : `decor/armory`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `characters/adams`, `equipment/archive`, `equipment/supply`, `equipment/armory-rack`, `objectives/console`.

**Implantation.** Largeur 2080 unités de jeu ; projection `DEPTH`. Racks ancrés ; combinaisons ; chargeurs ; malle de filtres ; casiers numérotés. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o04-02` — Récupérer l’équipement (equipment).

**Connexions.** `link-08-b` → `s08` : Ouverture dans la paroi latérale gauche. `link-09-a` → `s10` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Réserve d’équipement ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s10 — Baie d’embarquement

**Contrat de production courant.** Stage de Baie d’embarquement : conserver la largeur de jeu 2480 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Navette ; câbles ombilicaux ; treuil ; chariots ; balises de rampe. Seuils à garder sur leur support : boarding, bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une rampe et un couloir de sécurité conduisent à la navette. Les volumes au fond ne sont pas jouables.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s10`. Images : `decor/dropship`, `decor/cargo`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/elway`, `equipment/archive`.

**Implantation.** Largeur 2480 unités de jeu ; projection `DEPTH`. Navette ; câbles ombilicaux ; treuil ; chariots ; balises de rampe. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-09-b` → `s09` : Ouverture dans la paroi latérale gauche. `link-10-a` → `s11` : Embarquement au bord droit ; trajet aérien distinct des liaisons pédestres.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Baie d’embarquement ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s11 — Aire d’atterrissage

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/boarding-ramp`. Un PNG de rampe pour le couple réel s11/link-42-a arrière vers s37 et s37/link-42-b avant vers s11. Support, approche, verrouillage, traversée et arrivée restent natifs ; ni extérieur complet de navette ni vol animé.

**Contrat de production courant.** Stage de Aire d’atterrissage : conserver la largeur de jeu 2560 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Dalles prises dans le sable ; balises ; réservoir ; abri radio ; traces de moteurs. Seuils à garder sur leur support : boarding-ramp, building-entrance, exterior-path ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/sand`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


La même aire sera retrouvée au retour. Le camp reste à l’est et le ravin d’accès au nord. Implantation v0.3 : aire ouverte et ligne de fret. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s11`. Images : `decor/landing`, `decor/antenna`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2560 unités de jeu ; projection `DEPTH`. Dalles prises dans le sable ; balises ; réservoir ; abri radio ; traces de moteurs. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o15-03` — Rallumer la balise d’approche (beacon).

**Connexions.** `link-11-a` → `s12` : Ouverture dans la paroi latérale droite. `link-41-b` → `s36` : Continuité du terrain au bord gauche ; pas de porte industrielle isolée. `link-42-a` → `s37` : Rampe d’embarquement raccordée au bord arrière et au transport. `link-51-a` → `s46` : Baie de premier plan ; linteau atténué à proximité.

**Arrivées seules.** `link-10-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Aire d’atterrissage ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s12 — Abri d’expédition · Quonset

**Contrat de production courant.** Stage de Abri d’expédition · Quonset : conserver la largeur de jeu 1940 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Table de mission ; bancs ; cartes ; thermos ; casiers ; filtre d’air. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


L’abri possède une entrée, une zone de briefing et un passage vers la décontamination.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s12`. Images : `decor/briefing`, `decor/battery`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/adams`, `equipment/archive`, `equipment/supply`, `objectives/console`.

**Implantation.** Largeur 1940 unités de jeu ; projection `HYBRID`. Table de mission ; bancs ; cartes ; thermos ; casiers ; filtre d’air. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o05-01` — Rejoindre le briefing (brief).

**Connexions.** `link-11-b` → `s11` : Ouverture dans la paroi latérale gauche. `link-12-a` → `s13` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Abri d’expédition · Quonset ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s13 — Décontamination

**Contrat de production courant.** Stage de Décontamination : conserver la largeur de jeu 1760 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Buses ; caillebotis ; cuve de collecte ; combinaisons ; râtelier de bottes. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Deux portes encadrent les buses de nettoyage. Les équipements humides restent dans la partie sale.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s13`. Images : `decor/wash`, `decor/filters`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 1760 unités de jeu ; projection `SIDE`. Buses ; caillebotis ; cuve de collecte ; combinaisons ; râtelier de bottes. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o05-02` — Vérifier les filtres (filter).

**Connexions.** `link-12-b` → `s12` : Ouverture dans la paroi latérale gauche. `link-13-a` → `s14` : Ouverture dans la paroi latérale droite. `link-46-a` → `s41` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Décontamination ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s14 — Tête de puits

**Contrat de production courant.** Stage de Tête de puits : conserver la largeur de jeu 2240 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Cage ; poulies ; commandes ; garde-corps ; câble principal ; barrières de bord. Seuils à garder sur leur support : bulkhead, lift-cage ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `doors/lift-cage`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Une cage d’ascenseur occupe le centre d’un chevalement. La rambarde laisse seulement deux passages balisés. Implantation v0.3 : contour de la cage. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s14`. Images : `decor/hoist-drive`, `decor/winch`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2240 unités de jeu ; projection `DEPTH`. Cage ; poulies ; commandes ; garde-corps ; câble principal ; barrières de bord. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o05-03` — Mettre la cage en service (power).

**Connexions.** `link-13-b` → `s13` : Ouverture dans la paroi latérale gauche. `link-14-a` → `s15` : Palier de cage au bord droit ; changement vertical identifié et arrivée réciproque.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Tête de puits ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s15 — Recette de l’ancienne mine

**Contrat de production courant.** Stage de Recette de l’ancienne mine : conserver la largeur de jeu 2120 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Cage ; rails ; butoir ; boulonnage ; tuyauteries ; éclairage de secours. Seuils à garder sur leur support : bulkhead, lift-cage ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `doors/lift-cage`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


La cage arrive dans une recette protégée. Les rails sortent vers le relais, loin du bord du puits.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s15`. Images : `decor/hoist-drive`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Cage ; rails ; butoir ; boulonnage ; tuyauteries ; éclairage de secours. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-14-b` → `s14` : Palier de cage au bord gauche ; changement vertical identifié et arrivée réciproque. `link-15-a` → `s16` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Recette de l’ancienne mine ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s16 — Relais de Cho

**Contrat de production courant.** Stage de Relais de Cho : conserver la largeur de jeu 2280 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Table radio ; touret ; casiers ; antenne filaire ; lampe ; repères de secteur. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Le relais distribue les voies de la mine. La radio se trouve contre un mur, sans bloquer les circulations. Implantation v0.3 : baie de relais décalée. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s16`. Images : `decor/antenna`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `characters/cho`, `equipment/archive`, `equipment/supply`, `objectives/console`.

**Implantation.** Largeur 2280 unités de jeu ; projection `DEPTH`. Table radio ; touret ; casiers ; antenne filaire ; lampe ; repères de secteur. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o06-01` — Établir le relais (radio).

**Connexions.** `link-15-b` → `s15` : Ouverture dans la paroi latérale gauche. `link-16-a` → `s17` : Ouverture dans la paroi latérale droite. `link-19-a` → `s19` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Relais de Cho ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s17 — Atelier de maintenance

**Contrat de production courant.** Stage de Atelier de maintenance : conserver la largeur de jeu 1960 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Établi ; outils ; bouteilles ; chariot ; caisses ; crochets ; établi secondaire. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `devices/parts-empty`, `equipment/locker-stocked`, `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Un établi, un passage central libre et une remise arrière. Le matériel lourd reste appuyé au sol.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s17`. Images : `decor/workbench`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/locker`, `equipment/locker-open`, `equipment/armory-rack`, `equipment/shutter-control`, `equipment/light-panel`, `devices/parts`.

**Implantation.** Largeur 1960 unités de jeu ; projection `HYBRID`. Établi ; outils ; bouteilles ; chariot ; caisses ; crochets ; établi secondaire. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-16-b` → `s16` : Ouverture dans la paroi latérale gauche. `link-17-a` → `s18` : Ouverture dans la paroi latérale droite. `link-47-a` → `s42` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-54-a` → `s47` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Atelier de maintenance ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s18 — Galerie d’alimentation

**Contrat de production courant.** Stage de Galerie d’alimentation : conserver la largeur de jeu 2420 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Armoires ; câbles ; disjoncteurs ; isolateurs ; tuyaux ; porte coupe-feu. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Les câbles longent le plafond. Le chemin de service évite les armoires haute tension.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s18`. Images : `decor/generator`, `decor/pump`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2420 unités de jeu ; projection `SIDE`. Armoires ; câbles ; disjoncteurs ; isolateurs ; tuyaux ; porte coupe-feu. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o06-02` — Rétablir la desserte (power).

**Connexions.** `link-17-b` → `s17` : Ouverture dans la paroi latérale gauche. `link-18-a` → `s19` : Ouverture dans la paroi latérale droite. `link-52-b` → `s42` : Baie de premier plan ; linteau atténué à proximité. `link-56-b` → `s48` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Galerie d’alimentation ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s19 — La carène enfouie

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/isolation-closed`, `doors/rock-breach`. État consigné des quatre dispositifs d’isolation ; conduite, danger, interaction, sauvegarde et drapeau restent ceux de la simulation. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de La carène enfouie : conserver la largeur de jeu 2880 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Coque courbe ; échafaudage ; passerelle ; roche fracturée ; balises humaines. Seuils à garder sur leur support : rock-breach, stairwell ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


La coque apparaît dans une caverne bien plus vaste que le champ de déplacement. La zone de fouille se poursuit en contrebas. Implantation v0.3 : brèche et membrures rompues. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s19`. Images : `decor/carene`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`, `obstacles/rib`, `obstacles/silica-rubble`, `obstacles/resin`, `equipment/archive`, `devices/isolation`.

**Implantation.** Largeur 2880 unités de jeu ; projection `DEPTH`. Coque courbe ; échafaudage ; passerelle ; roche fracturée ; balises humaines. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-18-b` → `s18` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-19-b` → `s16` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-20-a` → `s20` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-21-a` → `s21` : Volée et palier raccordés au bord arrière ; pas un escalier décoratif sans liaison.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de La carène enfouie ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s20 — Brèche de coque

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/rock-breach`. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de Brèche de coque : conserver la largeur de jeu 2120 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Arches non humaines ; peau nervurée ; jauges de relevé ; câbles humains temporaires. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une ouverture irrégulière suit la peau du vaisseau. Les ajouts humains s’arrêtent aux premiers renflements.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s20`. Images : `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/silica-rubble`, `obstacles/rib`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Arches non humaines ; peau nervurée ; jauges de relevé ; câbles humains temporaires. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o07-01` — Examiner la brèche (scan).

**Connexions.** `link-20-b` → `s19` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-28-a` → `s26` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Brèche de coque ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s21 — Tranchée de fouille

**Contrat de production courant.** Stage de Tranchée de fouille : conserver la largeur de jeu 2560 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Strates rocheuses ; tamis ; cordes ; boîtes d’échantillons ; piquets ; passerelle. Seuils à garder sur leur support : rock-breach, stairwell ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


La fouille descend vers la ville ruinée. Les cordes, grilles et repères racontent le travail des chercheurs. Implantation v0.3 : tranchée et tables de fouille. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s21`. Images : `decor/excavator`, `decor/survey`, `decor/resinCable`, `decor/silicaShard`, `obstacles/silica-rubble`, `obstacles/crate`, `obstacles/rack`, `obstacles/rib`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2560 unités de jeu ; projection `DEPTH`. Strates rocheuses ; tamis ; cordes ; boîtes d’échantillons ; piquets ; passerelle. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o07-02` — Retrouver le balisage de fouille (survey).

**Connexions.** `link-21-b` → `s19` : Volée et palier raccordés au bord avant ; pas un escalier décoratif sans liaison. `link-22-a` → `s22` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-48-a` → `s43` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Tranchée de fouille ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s22 — Esplanade ensevelie

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/rock-breach`. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de Esplanade ensevelie : conserver la largeur de jeu 2860 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Contreforts ; arches effondrées ; pierres ; éclairages sur trépied ; instruments. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Des bâtiments non humains entourent une place partiellement dégagée. Les portes visibles ont des destinations cohérentes. Implantation v0.3 : esplanade à deux contournements. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s22`. Images : `decor/monolith`, `decor/survey`, `decor/resinCable`, `decor/silicaShard`, `obstacles/rib`, `obstacles/resin`, `obstacles/silica-rubble`, `equipment/archive`.

**Implantation.** Largeur 2860 unités de jeu ; projection `DEPTH`. Contreforts ; arches effondrées ; pierres ; éclairages sur trépied ; instruments. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-22-b` → `s21` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-23-a` → `s23` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-24-a` → `s24` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Esplanade ensevelie ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s23 — Salle des restes

**Contrat de production courant.** Stage de Salle des restes : conserver la largeur de jeu 1860 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Tables de relevé ; fragments protégés ; toile ; scanner ; jalons ; niches. Seuils à garder sur leur support : crawl-opening, rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Les restes sont des témoins archéologiques, pas des ennemis ressuscités. Le joueur traverse un passage balisé.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s23`. Images : `decor/ossuary`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 1860 unités de jeu ; projection `SIDE`. Tables de relevé ; fragments protégés ; toile ; scanner ; jalons ; niches. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o08-01` — Examiner les restes (scan).

**Connexions.** `link-23-b` → `s22` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-25-a` → `s24` : Ouverture basse dans la structure au bord droit ; liaison de conduit identifiée.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Salle des restes ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s24 — Poste de relevés

**Contrat de production courant.** Stage de Poste de relevés : conserver la largeur de jeu 2120 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Console portable ; caisses de capteurs ; panneaux ; fil guide ; bouteilles d’air. Seuils à garder sur leur support : bulkhead, crawl-opening ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Une implantation humaine fragile occupe un seuil de la cité. La radio et le matériel restent visibles depuis l’entrée. Implantation v0.3 : baie de relevé protégée. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s24`. Images : `decor/survey`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Console portable ; caisses de capteurs ; panneaux ; fil guide ; bouteilles d’air. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o08-02` — Récupérer le détecteur (equipment).

**Connexions.** `link-24-b` → `s22` : Baie de premier plan ; linteau atténué à proximité. `link-25-b` → `s23` : Ouverture basse dans la structure au bord gauche ; liaison de conduit identifiée. `link-26-a` → `s25` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste de relevés ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s25 — Passerelle suspendue

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/isolation-closed`. État consigné des quatre dispositifs d’isolation ; conduite, danger, interaction, sauvegarde et drapeau restent ceux de la simulation.

**Contrat de production courant.** Stage de Passerelle suspendue : conserver la largeur de jeu 2680 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Platelage ; ancrages ; câble latéral ; contreventement ; balises cassées. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une passerelle suit la paroi ; des volumes descendent sous le plan jouable. Le vide n’est pas une seconde route.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s25`. Images : `decor/bridge`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`, `equipment/archive`, `devices/isolation`.

**Implantation.** Largeur 2680 unités de jeu ; projection `SIDE`. Platelage ; ancrages ; câble latéral ; contreventement ; balises cassées. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Connexions.** `link-26-b` → `s24` : Ouverture dans la paroi latérale gauche. `link-27-a` → `s26` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Passerelle suspendue ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s26 — Entrée des tubes

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/rock-breach`. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de Entrée des tubes : conserver la largeur de jeu 2120 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Silice ; roche ; repères arrachés ; lampe tombée ; peau translucide ; résine. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/silica`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


La mine humaine rejoint des tubes de silice. La transition architecturale est visible avant le changement de salle. Implantation v0.3 : gorge à bifurcation. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s26`. Images : `decor/silica`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/rib`, `obstacles/silica-rubble`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2120 unités de jeu ; projection `HYBRID`. Silice ; roche ; repères arrachés ; lampe tombée ; peau translucide ; résine. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o09-01` — Écouter ce qui approche (sense).

**Connexions.** `link-27-b` → `s25` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-28-b` → `s20` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-29-a` → `s27` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Entrée des tubes ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s27 — Le nœud ambré

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/rock-breach`. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de Le nœud ambré : conserver la largeur de jeu 2680 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Piliers ; gouttes minérales ; membranes ; débris d’équipement ; trace de traînée. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/silica`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Trois passages composent une boucle. Les piliers de silice délimitent les bandes sans former un mur infranchissable. Implantation v0.3 : nœud à pilier central. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s27`. Images : `decor/amber`, `decor/silica`, `decor/resinCable`, `decor/silicaShard`, `obstacles/rib`, `obstacles/resin`, `obstacles/silica-rubble`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2680 unités de jeu ; projection `DEPTH`. Piliers ; gouttes minérales ; membranes ; débris d’équipement ; trace de traînée. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o10-01` — Marquer la dérivation (route).

**Connexions.** `link-29-b` → `s26` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-30-a` → `s28` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-32-a` → `s29` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Le nœud ambré ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s28 — Alcôve des disparus

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `terrain/hive`. Surface du sol des deux salles de kind hive. Les parois, volumes, ouvertures, œufs et collisions restent distincts ; la salle de reine s33 n’est pas incluse par déduction.

**Contrat de production courant.** Stage de Alcôve des disparus : conserver la largeur de jeu 1960 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Cocons ; casque ; balise ; arme vide ; résine ; réseaux organiques. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une alcôve accessible par un boyau étroit. Les cocons occupent le fond, le passage reste latéral.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s28`. Images : `decor/cocoon`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 1960 unités de jeu ; projection `SIDE`. Cocons ; casque ; balise ; arme vide ; résine ; réseaux organiques. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o09-02` — Retrouver la balise perdue (recover).

**Connexions.** `link-30-b` → `s27` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-31-a` → `s29` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Alcôve des disparus ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s29 — Le retour fermé

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/rock-breach`. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de Le retour fermé : conserver la largeur de jeu 2220 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Membrane de fermeture ; ancien repère ; fissure latérale ; tube de ventilation. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/silica`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Le retour se bouche après le relevé. Une dérivation identifiée existe avant le changement d’état. Implantation v0.3 : dérivation derrière la membrane. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s29`. Images : `decor/membrane`, `decor/silica`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`, `obstacles/silica-rubble`, `obstacles/resin`, `obstacles/rib`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2220 unités de jeu ; projection `HYBRID`. Membrane de fermeture ; ancien repère ; fissure latérale ; tube de ventilation. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o10-02` — Vérifier le passage fermé (seal).

**Connexions.** `link-31-b` → `s28` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-32-b` → `s27` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-33-a` → `s30` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges. `link-49-a` → `s44` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Le retour fermé ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s30 — Ascenseur secondaire

**Contrat de production courant.** Stage de Ascenseur secondaire : conserver la largeur de jeu 2300 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Cage inclinée ; câbles rompus ; supports tordus ; panneau défaut ; rambardes. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


La seconde installation ne garantit plus de sortie. Les commandes restent accessibles malgré les dommages.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s30`. Images : `decor/hoist-drive`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2300 unités de jeu ; projection `DEPTH`. Cage inclinée ; câbles rompus ; supports tordus ; panneau défaut ; rambardes. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o11-01` — Examiner le second ascenseur (inspect).

**Connexions.** `link-33-b` → `s29` : Ouverture dans la paroi latérale gauche. `link-34-a` → `s31` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Ascenseur secondaire ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s31 — Pied de l’escalier

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/isolation-closed`. État consigné des quatre dispositifs d’isolation ; conduite, danger, interaction, sauvegarde et drapeau restent ceux de la simulation.

**Contrat de production courant.** Stage de Pied de l’escalier : conserver la largeur de jeu 2420 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Volées ; paliers ; échelle de secours ; numérotation ; main courante ; conduites. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


La cage d’escalier possède des paliers lisibles et un itinéraire de maintenance, sans téléportation entre étages. Implantation v0.3 : palier et baie technique. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s31`. Images : `decor/cableTray`, `decor/winch`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `obstacles/crate`, `equipment/archive`, `devices/isolation`, `objectives/console`.

**Implantation.** Largeur 2420 unités de jeu ; projection `HYBRID`. Volées ; paliers ; échelle de secours ; numérotation ; main courante ; conduites. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o12-01` — Repérer la voie de secours (route).

**Connexions.** `link-34-b` → `s30` : Ouverture dans la paroi latérale gauche. `link-35-a` → `s32` : Ouverture dans la paroi latérale droite. `link-38-a` → `s34` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-53-b` → `s44` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Pied de l’escalier ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s32 — Chambre des œufs

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `terrain/hive`. Surface du sol des deux salles de kind hive. Les parois, volumes, ouvertures, œufs et collisions restent distincts ; la salle de reine s33 n’est pas incluse par déduction.

**Contrat de production courant.** Stage de Chambre des œufs : conserver la largeur de jeu 2820 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Œufs ; résine ; condensation ; carcasses minérales ; creux sombres ; gaines. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Les œufs forment des îlots, jamais une grille décorative. Deux passages continus permettent de se replier. Implantation v0.3 : deux poches autour de la ponte. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s32`. Images : `decor/eggs`, `decor/cocoon`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/rib`, `obstacles/silica-rubble`, `creatures/facehugger`, `equipment/archive`, `objectives/case`.

**Implantation.** Largeur 2820 unités de jeu ; projection `DEPTH`. Œufs ; résine ; condensation ; carcasses minérales ; creux sombres ; gaines. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o12-02` — Repérer un passage entre les œufs (brood).

**Connexions.** `link-35-b` → `s31` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-36-a` → `s33` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Chambre des œufs ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s33 — La pondeuse

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `equipment/weakpoint-destroyed`. Résidu des trois attaches après hp <= 0. Les attaches sont une mécanique du projet ; cette image ne constitue pas une description canonique de la reine.

**Contrat de production courant.** Stage de La pondeuse : conserver la largeur de jeu 3040 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Reine ; attaches ; ovipositeur stylisé ; œufs périphériques ; arches ; sol corrodé. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une grande chambre distribue trois ancrages de résine autour d’un axe d’évacuation. Le boss ne remplit pas l’écran.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s33`. Images : `decor/throne`, `decor/eggs`, `decor/resinCable`, `decor/silicaShard`, `obstacles/resin`, `obstacles/silica-rubble`, `obstacles/rib`, `equipment/archive`.

**Implantation.** Largeur 3040 unités de jeu ; projection `DEPTH`. Reine ; attaches ; ovipositeur stylisé ; œufs périphériques ; arches ; sol corrodé. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o13-01` — Ouvrir la voie au groupe (boss).

**Connexions.** `link-36-b` → `s32` : Passage dans la limite rocheuse gauche ; pas de panneau métallique dans les vestiges. `link-37-a` → `s34` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de La pondeuse ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.
- **P1 · narrative** — Trois attaches du boss restent des mécanismes originaux. **À vérifier :** Séparer scène du roman et règle de combat, ou proposer une variante justifiée.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s34 — Dérivation de secours

**Contrat de production courant.** Stage de Dérivation de secours : conserver la largeur de jeu 2140 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Civière ; couvertures ; éclairage mobile ; caisses ; conduites ; fermeture coupe-feu. Seuils à garder sur leur support : bulkhead, stairwell ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `devices/parts-empty`, `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Le retour vers l’escalier passe par une galerie industrielle partiellement envahie. Une zone de soins improvisée ne promet aucune guérison. Les deux brancards doivent être préparés séparément puis escortés jusqu’à la navette. Implantation v0.3 : baie de stabilisation à deux brancards. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s34`. Images : `decor/triage`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `obstacles/crate`, `equipment/archive`, `equipment/supply`, `equipment/light-panel`, `devices/parts`.

**Implantation.** Largeur 2140 unités de jeu ; projection `HYBRID`. Civière ; couvertures ; éclairage mobile ; caisses ; conduites ; fermeture coupe-feu. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o14-01` — Mettre Adams à l’abri (rescue) ; `o14-02` — Mettre Elway à l’abri (rescue).

**Connexions.** `link-37-b` → `s33` : Ouverture dans la paroi latérale gauche. `link-38-b` → `s31` : Baie de premier plan ; linteau atténué à proximité. `link-39-a` → `s35` : Volée et palier raccordés au bord droit ; pas un escalier décoratif sans liaison.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Dérivation de secours ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s35 — Paliers supérieurs

**Contrat de production courant.** Stage de Paliers supérieurs : conserver la largeur de jeu 2660 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Treuil ; paliers ; câble de levage ; mains courantes ; bouche de surface. Seuils à garder sur leur support : bulkhead, stairwell ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une succession de paliers comprimée pour le jeu, reliée explicitement au bas de la cage. Les marches sont une animation de liaison.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s35`. Images : `decor/cableTray`, `decor/winch`, `decor/warningStripe`, `decor/pipe`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `objectives/console`.

**Implantation.** Largeur 2660 unités de jeu ; projection `SIDE`. Treuil ; paliers ; câble de levage ; mains courantes ; bouche de surface. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o15-01` — Actionner le treuil (winch).

**Connexions.** `link-39-b` → `s34` : Volée et palier raccordés au bord gauche ; pas un escalier décoratif sans liaison. `link-40-a` → `s36` : Volée et palier raccordés au bord droit ; pas un escalier décoratif sans liaison. `link-50-a` → `s45` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-57-a` → `s49` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Paliers supérieurs ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s36 — Ravin de service

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/isolation-closed`. État consigné des quatre dispositifs d’isolation ; conduite, danger, interaction, sauvegarde et drapeau restent ceux de la simulation.

**Contrat de production courant.** Stage de Ravin de service : conserver la largeur de jeu 2700 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Talus ; antenne ; câble enterré ; talweg sec ; route de service ; sable en mouvement. Seuils à garder sur leur support : exterior-path, stairwell ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/sand`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Le ravin rejoint le nord de l’aire initiale. Les mêmes tours et balises permettent de reconnaître le lieu. Implantation v0.3 : ravin et drainage latéral. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s36`. Images : `decor/ravine`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`, `obstacles/silica-rubble`, `obstacles/pipe`, `obstacles/crate`, `equipment/archive`, `devices/isolation`, `objectives/console`.

**Implantation.** Largeur 2700 unités de jeu ; projection `DEPTH`. Talus ; antenne ; câble enterré ; talweg sec ; route de service ; sable en mouvement. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o15-02` — Ouvrir le passage du ravin (route).

**Connexions.** `link-40-b` → `s35` : Volée et palier raccordés au bord gauche ; pas un escalier décoratif sans liaison. `link-41-a` → `s11` : Continuité du terrain au bord droit ; pas de porte industrielle isolée.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Ravin de service ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s37 — Soute de la navette

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`, `doors/boarding-ramp`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC. Un PNG de rampe pour le couple réel s11/link-42-a arrière vers s37 et s37/link-42-b avant vers s11. Support, approche, verrouillage, traversée et arrivée restent natifs ; ni extérieur complet de navette ni vol animé.

**Contrat de production courant.** Stage de Soute de la navette : conserver la largeur de jeu 2400 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Caisson ; moussoir ; treuil ; sangles ; rampes ; rails de chargement ; banquettes. Seuils à garder sur leur support : boarding, boarding-ramp ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


La rampe débouche sur une soute assez large pour l’opération de capture. Le caisson est ancré, et non posé devant une porte. Implantation v0.3 : berceaux et cage séparés. Les emprises sont distinctes du décor et des zones dangereuses.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s37`. Images : `decor/captureBay`, `decor/dropship`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/supply`, `equipment/shutter-control`, `equipment/light-panel`, `devices/console`, `objectives/capture`.

**Implantation.** Largeur 2400 unités de jeu ; projection `DEPTH`. Caisson ; moussoir ; treuil ; sangles ; rampes ; rails de chargement ; banquettes. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o16-01` — Immobiliser puis enfermer l’adulte (capture).

**Connexions.** `link-42-b` → `s11` : Rampe d’embarquement raccordée au bord avant et au transport. `link-43-a` → `s38` : Embarquement au bord droit ; trajet aérien distinct des liaisons pédestres.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Soute de la navette ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.
- **P1 · narrative** — Capture condensée : reconstituer les interventions précises après comparaison du passage. **À vérifier :** Garder spécimen vivant, patients, convoi et arrimage.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s38 — Consigne cryogénique W-Y

**Contrat de production courant.** Stage de Consigne cryogénique W-Y : conserver la largeur de jeu 1840 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Vitrage ; cryocuves ; dossier transfert ; caméra ; clapets ; sas sécurisé. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une vitre sépare le personnel des spécimens. Les hôtes ne sont pas soignés par une interaction magique.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s38`. Images : `decor/quarantine-instruments`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `characters/rollins`, `equipment/archive`, `equipment/stasis-canopy`, `stretchers/adams`, `stretchers/elway`, `parasites/royal`, `parasites/normal`, `objectives/console`.

**Implantation.** Largeur 1840 unités de jeu ; projection `SIDE`. Vitrage ; cryocuves ; dossier transfert ; caméra ; clapets ; sas sécurisé. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o17-01` — Confirmer le transfert (transfer).

**Connexions.** `link-44-a` → `s39` : Ouverture dans la paroi latérale droite.

**Arrivées seules.** `link-43-arrival` : Transfert narratif à sens unique : pas de porte de retour active.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Consigne cryogénique W-Y ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s39 — Poste d’observation

**Contrat de production courant.** Stage de Poste d’observation : conserver la largeur de jeu 2080 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Baie ; console ; écran de mission ; sièges fixés ; éclairage de veille. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `planets/lv178-orbital`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


La baie montre la planète, pas une ville terrestre. La frappe est une séquence orbitale non jouable comme arme.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s39`. Images : `decor/viewport`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/crate`, `obstacles/rack`, `obstacles/pipe`, `characters/cherbourg`, `equipment/archive`, `objectives/console`.

**Implantation.** Largeur 2080 unités de jeu ; projection `HYBRID`. Baie ; console ; écran de mission ; sièges fixés ; éclairage de veille. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o17-02` — Observer la surface (observe).

**Connexions.** `link-44-b` → `s38` : Ouverture dans la paroi latérale gauche. `link-45-a` → `s40` : Ouverture dans la paroi latérale droite.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste d’observation ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s40 — Hypersommeil

**Contrat de production courant.** Stage de Hypersommeil : conserver la largeur de jeu 1820 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Couchettes ; casiers ; terminal ; lumière de veille ; hublot ; tubulures. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


La dernière salle referme le récit. Des couchettes et des moniteurs encadrent un couloir presque vide.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s40`. Images : `decor/cryo`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `objectives/sleep`.

**Implantation.** Largeur 1820 unités de jeu ; projection `SIDE`. Couchettes ; casiers ; terminal ; lumière de veille ; hublot ; tubulures. Nom détaillé et plan créés pour le jeu ; aucun relevé métrique du roman authentifié.

**Objectifs.** `o18-01` — Entrer en hypersommeil (sleep).

**Connexions.** `link-45-b` → `s39` : Ouverture dans la paroi latérale gauche.

**Qualification.** documented-context-original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [plot](https://www.avpcentral.com/alien-sea-of-sorrows).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le lieu général peut être documenté ; le nom local, le plan et les métriques restent une adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Hypersommeil ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s41 — Local des filtres

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC.

**Contrat de production courant.** Stage de Local des filtres : conserver la largeur de jeu 1480 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Cartouches scellées ; banc de contrôle ; tuyaux de retour ; panneau de débit. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Un local fermé derrière le sas conserve les cartouches hors de la poussière.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s41`. Images : `decor/filters`, `decor/wash`, `decor/cableTray`, `decor/warningStripe`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 1480 unités de jeu ; projection `SIDE`. Cartouches scellées ; banc de contrôle ; tuyaux de retour ; panneau de débit. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-46-b` → `s13` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Local des filtres ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s42 — Pompes de desserte

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC.

**Contrat de production courant.** Stage de Pompes de desserte : conserver la largeur de jeu 2200 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Deux volutes de pompe ; soupapes ; câble de commande ; jauges ; drain. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Un circuit secondaire rejoint la galerie d’alimentation sans repasser par le relais.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s42`. Images : `decor/pump`, `decor/generator`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `equipment/shutter-control`, `equipment/light-panel`, `devices/console`.

**Implantation.** Largeur 2200 unités de jeu ; projection `DEPTH`. Deux volutes de pompe ; soupapes ; câble de commande ; jauges ; drain. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-47-b` → `s17` : Baie de premier plan ; linteau atténué à proximité. `link-52-a` → `s18` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Pompes de desserte ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s43 — Belvédère de fouille

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC.

**Contrat de production courant.** Stage de Belvédère de fouille : conserver la largeur de jeu 1840 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Table de relevés ; mât de visée ; balustrade ; sondes ; sacs. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Une passerelle d’observation domine la tranchée, mais ne descend pas directement jusqu’aux tubes.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s43`. Images : `decor/survey`, `decor/bridge`, `decor/resinCable`, `decor/silicaShard`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 1840 unités de jeu ; projection `HYBRID`. Table de relevés ; mât de visée ; balustrade ; sondes ; sacs. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-48-b` → `s21` : Passage dans la limite rocheuse droit ; pas de panneau métallique dans les vestiges.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Belvédère de fouille ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s44 — Conduit de retour

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`, `doors/rock-breach`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Contrat de production courant.** Stage de Conduit de retour : conserver la largeur de jeu 2050 et la présentation SIDE ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Tubes gainés ; membrures fendues ; vanne de purge humaine posée à l’entrée. Seuils à garder sur leur support : rock-breach ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/silica`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Une desserte étroite contourne la membrane refermée et rejoint le pied de l’escalier.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s44`. Images : `decor/silica`, `decor/valve`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 2050 unités de jeu ; projection `SIDE`. Tubes gainés ; membrures fendues ; vanne de purge humaine posée à l’entrée. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-49-b` → `s29` : Passage dans la limite rocheuse avant ; pas de panneau métallique dans les vestiges. `link-53-a` → `s31` : Passage dans la limite rocheuse arrière ; pas de panneau métallique dans les vestiges.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Conduit de retour ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s45 — Infirmerie de secours

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC.

**Contrat de production courant.** Stage de Infirmerie de secours : conserver la largeur de jeu 1860 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Deux stations de brancards ; armoire de soins ; couvertures ; ventilation. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Un renfoncement de soins permet de reprendre souffle sans bloquer le palier du treuil.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s45`. Images : `decor/triage`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`, `devices/console`.

**Implantation.** Largeur 1860 unités de jeu ; projection `HYBRID`. Deux stations de brancards ; armoire de soins ; couvertures ; ventilation. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-50-b` → `s35` : Baie de premier plan ; linteau atténué à proximité. `link-59-b` → `s50` : Ouverture dans la paroi latérale gauche.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Infirmerie de secours ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s46 — Poste de guidage

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC.

**Contrat de production courant.** Stage de Poste de guidage : conserver la largeur de jeu 2080 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Antenne de guidage ; pupitre ; jalons ; vitrage blindé ; batteries. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.


Le poste donne une ligne dégagée vers l’aire d’atterrissage. La balise principale reste sur l’aire.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s46`. Images : `decor/antenna`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `obstacles/pipe`, `obstacles/rack`, `equipment/archive`, `devices/console`.

**Implantation.** Largeur 2080 unités de jeu ; projection `DEPTH`. Antenne de guidage ; pupitre ; jalons ; vitrage blindé ; batteries. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-51-b` → `s11` : Baie fixée à la paroi de fond ; bande d’approche au sol.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Poste de guidage ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s47 — Vestiaire des équipes

**Contrat de production courant.** Stage de Vestiaire des équipes : conserver la largeur de jeu 2160 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Les scellés protègent du matériel oublié, pas une réserve inépuisable. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Des armoires de quart longent le mur des équipes. La réserve de quart donne sur une cour technique qui rejoint la galerie d’alimentation.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s47`. Images : `decor/locker`, `decor/wash`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2160 unités de jeu ; projection `HYBRID`. Les scellés protègent du matériel oublié, pas une réserve inépuisable. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-54-b` → `s17` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-55-a` → `s48` : Ouverture dans la paroi latérale droite.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Vestiaire des équipes ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s48 — Cour des échangeurs

**Contrat de production courant.** Stage de Cour des échangeurs : conserver la largeur de jeu 2580 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Regarder entre les machines avant de fouiller les casiers : le cliquetis de leur fermeture porte loin. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Des échangeurs longent la cour encaissée. Une coursive latérale ramène vers l’alimentation sans repasser par l’atelier.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s48`. Images : `decor/generator`, `decor/pump`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2580 unités de jeu ; projection `DEPTH`. Regarder entre les machines avant de fouiller les casiers : le cliquetis de leur fermeture porte loin. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-55-b` → `s47` : Ouverture dans la paroi latérale gauche. `link-56-a` → `s18` : Baie de premier plan ; linteau atténué à proximité.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Cour des échangeurs ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s49 — Transit des blessés

**Contrat de production courant.** Stage de Transit des blessés : conserver la largeur de jeu 2240 et la présentation HYBRID ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Cette boucle accepte les deux brancards. Elle ne remplace pas le treuil, la balise ou l’arrimage. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Deux rails de guidage conduisent les châssis jusqu’au poste de transit. Un retour par le magasin rejoint l’infirmerie.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s49`. Images : `decor/triage`, `decor/medical`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2240 unités de jeu ; projection `HYBRID`. Cette boucle accepte les deux brancards. Elle ne remplace pas le treuil, la balise ou l’arrimage. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-57-b` → `s35` : Baie fixée à la paroi de fond ; bande d’approche au sol. `link-58-a` → `s50` : Ouverture dans la paroi latérale droite.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Transit des blessés ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-LIEU-s50 — Magasin de la remontée

**Contrat de production courant.** Stage de Magasin de la remontée : conserver la largeur de jeu 2420 et la présentation DEPTH ; ces valeurs ne sont pas des mesures canoniques. Modules à coordonner : Le détour offre un endroit où déposer un surplus pour le reprendre plus tard. Un bruit remue à l’arrière du magasin. Seuils à garder sur leur support : bulkhead ; vérifier chaque connexion listée, ses conditions et son arrivée. Conserver objectifs, obstacles, cast et passages exacts du JSON ; aucune nouvelle géométrie jouable n’est déduite d’un fond peint.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Les établis ont été abandonnés en plein inventaire. Des renforts et des consommables subsistent derrière les portes des armoires.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture/worldDressing/door ; Game transitions`. Salles concernées : `s50`. Images : `decor/cargo`, `decor/battery`, `decor/cableTray`, `decor/warningStripe`, `obstacles/rack`, `obstacles/crate`, `obstacles/pipe`, `creatures/facehugger`, `equipment/archive`, `equipment/locker`, `equipment/locker-open`.

**Implantation.** Largeur 2420 unités de jeu ; projection `DEPTH`. Le détour offre un endroit où déposer un surplus pour le reprendre plus tard. Un bruit remue à l’arrière du magasin. Annexe de gameplay originale. Ne constitue pas un lieu supplémentaire attesté dans le roman.

**Connexions.** `link-58-b` → `s49` : Ouverture dans la paroi latérale gauche. `link-59-a` → `s45` : Ouverture dans la paroi latérale droite.

**Qualification.** original-game-annex. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · design** — Conserver cette annexe comme création du jeu. **À vérifier :** Ne la compter comme lieu attesté ni comme preuve littéraire.
- **P1 · visual** — Compléter sol, parois, fond et premier plan de Magasin de la remontée ; les modules PNG ne constituent pas un stage complet. **À vérifier :** Garder ouvertures sur leurs supports, échelle humaine et trajectoire lisible en SIDE/HYBRID.
- **P1 · verification** — Parcourir chaque seuil et point d'arrivée avec les entrées réelles. **À vérifier :** Aller-retour quand prévu, arrivée libre, groupe/brancards et sauvegarde/reprise ; résultat constaté distinct du graphe.

**Garde de continuité.** Conserver objectifs, conditions et transferts narratifs tant qu'un changement n'est pas vérifié. Distinguer décor non collidant et obstacle physique.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

## Armes — 7 fiches

### MER-ARME-pistol — Reaper

**Contrat de production courant.** Conserver weaponId=pistol, possessions, munitions, cadence et règles natives. Vue individuelle du modèle, grip primaire, appui secondaire et bouche du canon ; mesurer leur composition sur chaque posture. États repos, visée, tir, interruption et recharge doivent suivre les actions acceptées ; une animation graphique ne change pas les dégâts.


Nom et type de pistolet

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Aucune salle dédiée ou occurrence statique. Images : `weapons/pistol`, `effects/muzzle`, `effects/impact`.

**Paramètres de gameplay, sans portée canonique.** magazine=12, reloadSeconds=1.1, shotIntervalSeconds=0.27, rangeGameUnits=1100, damage=24.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [reaper](https://avp.fandom.com/wiki/Reaper), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Silhouette, calibre, 12 coups et dégâts : interprétation de jeu. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Reaper. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-pulse — Fusil à impulsions

**Contrat de production courant.** Conserver weaponId=pulse, possessions, munitions, cadence et règles natives. Vue individuelle du modèle, grip primaire, appui secondaire et bouche du canon ; mesurer leur composition sur chaque posture. États repos, visée, tir, interruption et recharge doivent suivre les actions acceptées ; une animation graphique ne change pas les dégâts.


Arme citée lors de la destruction du puits

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Salles concernées : `s09`, `s17`. Images : `weapons/pulse`, `effects/muzzle`, `effects/impact`.

**Paramètres de gameplay, sans portée canonique.** magazine=30, initialReserve=60, reloadSeconds=1.1, shotIntervalSeconds=0.11, rangeGameUnits=1100, damage=20.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Attribution facultative à Decker originale. Aucun modèle M41A revendiqué ; 30 coups : équilibrage. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Fusil à impulsions. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-plasma — Fusil plasma · 50 W

**Contrat de production courant.** Conserver weaponId=plasma, possessions, munitions, cadence et règles natives. Vue individuelle du modèle, grip primaire, appui secondaire et bouche du canon ; mesurer leur composition sur chaque posture. États repos, visée, tir, interruption et recharge doivent suivre les actions acceptées ; une animation graphique ne change pas les dégâts.


Modèle cité dans le roman

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Salles concernées : `s09`, `s17`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Paramètres de gameplay, sans portée canonique.** cellShots=12, initialReserveCells=2, loadedCell=1, reloadOnlyEmpty=true, reloadSeconds=1.1, heatPerShot=28, lockHeat=100, shotIntervalSeconds=0.6, rangeGameUnits=1100, damage=45.

**État de production.** `generation-refused-native-fallback`.

**Qualification.** secondary-reference-partial. Références : [plasma](https://avp.fandom.com/wiki/Plasma_Rifle), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Silhouette, 12 tirs/cellule, cadence, dégâts et seuil thermique interprétés ; trois cellules dans le kit. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P0 · visual** — Génération refusée ; conserver le rendu natif et le besoin ouvert. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Fusil plasma · 50 W. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-foam — Foamer · projection de mousse

**Contrat de production courant.** Conserver weaponId=foam, possessions, munitions, cadence et règles natives. Vue individuelle du modèle, grip primaire, appui secondaire et bouche du canon ; mesurer leur composition sur chaque posture. États repos, visée, tir, interruption et recharge doivent suivre les actions acceptées ; une animation graphique ne change pas les dégâts.


Outil de capture employé par Manning

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Aucune salle dédiée ou occurrence statique. Images : `weapons/foam`, `effects/foam`.

**Paramètres de gameplay, sans portée canonique.** shotIntervalSeconds=0.35, rangeGameUnits=790, foamIncrement=0.38, restraintThreshold=0.95.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Usage direct par Decker et jauge de mousse : adaptation. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Foamer · projection de mousse. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-flame — Lance-flammes de gameplay

**Contrat de production courant.** Conserver weaponId=flame, possessions, munitions, cadence et règles natives. Vue individuelle du modèle, grip primaire, appui secondaire et bouche du canon ; mesurer leur composition sur chaque posture. États repos, visée, tir, interruption et recharge doivent suivre les actions acceptées ; une animation graphique ne change pas les dégâts.

**Avancement des travaux du checkpoint :** `MER-ARME-flame-W02` — Réalisé en partie (0.10.3); `MER-ARME-flame-W04` — Réalisé en partie (0.10.3). Les autres travaux de cette fiche restent ouverts.


Non certifié comme arme distincte dans le passage de référence

**Présent au checkpoint.** Propriétaire : `Game.shoot/reload ; SoSRenderer.human/drawEffects`. Aucune salle dédiée ou occurrence statique. Images : `effects/flame`, `effects/spark`.

**Paramètres de gameplay, sans portée canonique.** fuelPerShot=2, shotIntervalSeconds=0.13, rangeGameUnits=390, damage=17, weakpointDamage=14.

**Édition 0.10.3.** Lance-flammes raccordé à l'arme native et à l'armurerie ; grip primaire et bouche mesurés dans les deux sens. La crosse dépasse le dos dans certaines poses ; seconde main et occlusion restent à corriger. Aucun nouveau cycle de recharge n'est produit. Arme originale au projet. Source : [weapons/flame.png](../../dlc/sea-of-sorrows-visual/sprites/weapons/flame.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Ancienne arme conservée ; ne pas la présenter comme modèle authentifié. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P0 · visual** — Source générée hors du checkpoint, publication et raccord à vérifier. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P1 · animation** — Prise, visée, tir, interruption et recharge adaptés à Lance-flammes de gameplay. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.
- **P1 · integration** — Seconde main et bouche au bon endroit, dans les deux sens ; les actions restent celles du moteur. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-grenades — Grenades de Silas

**Contrat de production courant.** Arme narrative : produire la vue liée à la scène de Grenades de Silas seulement après référence suffisante. Ne pas ajouter de possession, munitions, dégâts ou commande de tir au joueur. Une vue orbitale du lieu ne constitue pas un sprite de la charge ou de son effet.


Employées contre le puits

**Présent au checkpoint.** Propriétaire : `Objectif/dossier de campagne`. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Pas de lancer libre par Decker dans cette version. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG distinct de cet armement au checkpoint. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P2 · narrative** — Représenter la référence dans sa séquence seulement. **À vérifier :** Aucun nouveau lancer libre, consommable ou pouvoir gratuit inventé.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-ARME-warheads — Charges plasma orbitales

**Contrat de production courant.** Arme narrative : produire la vue liée à la scène de Charges plasma orbitales seulement après référence suffisante. Ne pas ajouter de possession, munitions, dégâts ou commande de tir au joueur. Une vue orbitale du lieu ne constitue pas un sprite de la charge ou de son effet.


Frappe commandée depuis le transport

**Présent au checkpoint.** Propriétaire : `Objectif/dossier de campagne`. Salles concernées : `s39`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**État de production.** `baseline`.

**Qualification.** secondary-reference-partial. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Pas une arme de poche ni un pouvoir orbital libre du joueur. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Aucun PNG distinct de cet armement au checkpoint. **À vérifier :** Contrôler l'objet/l'effet, l'échelle, prises et bouche avant admission.
- **P2 · narrative** — Représenter la référence dans sa séquence seulement. **À vérifier :** Aucun nouveau lancer libre, consommable ou pouvoir gratuit inventé.

**Garde de continuité.** Conserver possessions, munitions, refroidissement, dégâts et sauvegardes. Aucun M41A/XM99A imposé au fusil plasma du roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

## Props, équipements et effets — 119 fiches

### MER-EQUIP-radio — Radio de liaison

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Radio de liaison. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Liaisons et dialogues de gameplay ; forme, modèle et description matérielle non vérifiés dans le texte intégral.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / dialogues de mission`. Aucune salle dédiée ou occurrence statique. Images : `equipment/radio`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Liaisons et dialogues de gameplay ; forme, modèle et description matérielle non vérifiés dans le texte intégral. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-lamp — Lampe personnelle

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Lampe personnelle. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


État moteur ; modèle et tenue non certifiés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.human / Game.toggleLamp`. Aucune salle dédiée ou occurrence statique. Images : `equipment/lamp`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — État moteur ; modèle et tenue non certifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-tracker — Détecteur de mouvement

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Détecteur de mouvement. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Fonctionnel ; modèle, chiffres et interface originaux.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / Game.toggleTracker`. Aucune salle dédiée ou occurrence statique. Images : `equipment/tracker`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Fonctionnel ; modèle, chiffres et interface originaux. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-filter — Protection respiratoire

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Protection respiratoire. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Les sables toxiques sont confirmés par Titan ; le filtre consommable et son apparence restent un mécanisme de jeu.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / Game.replaceFilter`. Salles concernées : `s13`, `s41`. Images : `equipment/filter`, `decor/filters`.

**Qualification.** secondary-context-project-design. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Les sables toxiques sont confirmés par Titan ; le filtre consommable et son apparence restent un mécanisme de jeu. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-sampler — Carottier

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Carottier. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Interaction au début ; pas un outil de combat portable.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor/object / o01-01`. Salles concernées : `s02`, `s15`, `s17`, `s20`, `s21`, `s23`, `s26`, `s28`, `s32`. Images : `decor/drill`, `decor/reel`, `objectives/case`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Interaction au début ; pas un outil de combat portable. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-scanner — Relevés et terminal ICC

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Relevés et terminal ICC. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Le rôle ICC est confirmé ; cet ensemble de terminal et relevés jouables est une interprétation, pas un équipement authentifié par la notice.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor/object`. Salles concernées : `s03`, `s04`, `s05`, `s06`, `s08`, `s09`, `s11`, `s12`, `s13`, `s14`, `s16`, `s18`, `s21`, `s22`, `s24`, `s27`, `s29`, `s30`, `s31`, `s35`, `s36`, `s38`, `s39`, `s43`, `s46`. Images : `decor/survey`, `decor/terminal`, `objectives/console`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Le rôle ICC est confirmé ; cet ensemble de terminal et relevés jouables est une interprétation, pas un équipement authentifié par la notice. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-cage — Caisson de capture

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Caisson de capture. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


État et capture réelle ; modèle dessiné original.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object / capture`. Salles concernées : `s37`. Images : `objectives/capture`, `decor/captureBay`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — État et capture réelle ; modèle dessiné original. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-cryo — Consigne cryogénique

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Consigne cryogénique. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Les deux porteurs restent contaminés, pas guéris par le sauvetage.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stasisDisplay/object`. Salles concernées : `s38`, `s40`. Images : `decor/cryo`, `equipment/stasis-canopy`, `objectives/sleep`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Les deux porteurs restent contaminés, pas guéris par le sauvetage. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Les capsules sont déjà illustrées ; manque de spécificité de scène et d'état, pas absence totale de visuel. **À vérifier :** Séparer s40, s38 et décor médical ; garder les hôtes contaminés.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-medkits — Trousses et consommables

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Trousses et consommables. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Soins simplifiés, réserve finie.

**Présent au checkpoint.** Propriétaire : `SoSEquipmentArt / Game.useMedkit`. Aucune salle dédiée ou occurrence statique. Images : `equipment/medkit`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Soins simplifiés, réserve finie. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Une image d'inventaire ne couvre pas une manipulation corporelle. **À vérifier :** Définir seulement les gestes utiles, liés aux actions et aux stocks natifs.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-sensors — Trois balises réutilisables

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `equipment/sensor-off`. Balise réellement éteinte, après arrêt manuel ou batterie épuisée. Absence de signal et extinction restent deux conditions différentes ; charge, récupération et impulsions restent natives.

**Avancement des travaux du checkpoint :** `MER-EQUIP-sensors-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Trois balises réutilisables. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Création des v0.6, ne pas confondre avec une sonde canonique.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.sensor / balises`. Aucune salle dédiée ou occurrence statique. Images : `equipment/sensor`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Création des v0.6, ne pas confondre avec une sonde canonique. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-decoys — Leurres acoustiques

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Leurres acoustiques. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Création de gameplay.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.emitter / Game.deployDecoy`. Aucune salle dédiée ou occurrence statique. Images : `equipment/decoy`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Création de gameplay. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-repair — Renforts de châssis

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Renforts de châssis. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.

**Ajouts 0.10.4 liés à cette fiche :** `devices/parts-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Réparation et économie originales.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device / réparation`. Salles concernées : `s17`, `s34`. Images : `devices/parts`.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Réparation et économie originales. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler les variantes d'état utiles ; garder les replis natifs lorsque terminé, vide ou détruit. **À vérifier :** Aucune réserve pleine ni machine active affichée à contre-état.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-EQUIP-shocker — Shocker / neutralisation

**Contrat de production courant.** Conserver fonction, stock, accès et restrictions de Shocker / neutralisation. Distinguer illustration d’interface, objet posé et geste d’utilisation ; chaque surface a son propre critère de raccord. La réparation, collecte ou consommation doit conserver son état après sauvegarde et reprise.


Mention à confronter au texte ; non ajouté comme équipement canonique certifié.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Aucune salle dédiée ou occurrence statique. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Mention à confronter au texte ; non ajouté comme équipement canonique certifié. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · reference** — Nature et présence à vérifier avant production canonique. **À vérifier :** Retrouver le passage et distinguer arme, neutralisation médicale et traduction.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-PROP-decor-amber — Nœud ambré

**Contrat de production courant.** Module fixe decor/amber : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s27`. Images : `decor/amber`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-antenna — Antenne

**Contrat de production courant.** Module fixe decor/antenna : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s11`, `s16`, `s46`. Images : `decor/antenna`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-armory — Module d'armurerie

**Contrat de production courant.** Module fixe decor/armory : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s09`. Images : `decor/armory`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-battery — Batterie

**Contrat de production courant.** Module fixe decor/battery : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s12`, `s50`. Images : `decor/battery`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-bridge — Passerelle suspendue

**Contrat de production courant.** Module fixe decor/bridge : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s25`, `s43`. Images : `decor/bridge`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-briefing — Table de briefing

**Contrat de production courant.** Module fixe decor/briefing : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s08`, `s12`. Images : `decor/briefing`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cable — Câble

**Contrat de production courant.** Module fixe decor/cable : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s25`, `s30`, `s34`, `s36`. Images : `decor/cable`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cableTray — Chemin de câbles

**Contrat de production courant.** Module fixe decor/cableTray : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s24`, `s25`, `s30`, `s31`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `decor/cableTray`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-captureBay — Baie de capture

**Contrat de production courant.** Module fixe decor/captureBay : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s37`. Images : `decor/captureBay`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cargo — Cargaison

**Contrat de production courant.** Module fixe decor/cargo : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s10`, `s50`. Images : `decor/cargo`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-checkpoint — Poste de surveillance

**Contrat de production courant.** Module fixe decor/checkpoint : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`. Images : `decor/checkpoint`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cocoon — Cocon

**Contrat de production courant.** Module fixe decor/cocoon : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s28`, `s32`. Images : `decor/cocoon`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-cryo — Capsule cryogénique

**Contrat de production courant.** Module fixe decor/cryo : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s40`. Images : `decor/cryo`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-drill — Carottier

**Contrat de production courant.** Module fixe decor/drill : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s02`. Images : `decor/drill`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-eggs — Groupe d'œufs

**Contrat de production courant.** Module fixe decor/eggs : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s32`, `s33`. Images : `decor/eggs`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-fence — Clôture

**Contrat de production courant.** Module fixe decor/fence : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`. Images : `decor/fence`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-filters — Ensemble de filtration

**Contrat de production courant.** Module fixe decor/filters : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s13`, `s41`. Images : `decor/filters`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-generator — Générateur

**Contrat de production courant.** Module fixe decor/generator : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s18`, `s42`, `s48`. Images : `decor/generator`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-hoist-drive — Motorisation du treuil

**Contrat de production courant.** Module fixe decor/hoist-drive : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s14`, `s15`, `s30`. Images : `decor/hoist-drive`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-home — Mobilier domestique

**Contrat de production courant.** Module fixe decor/home : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s05`. Images : `decor/home`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-landing — Infrastructure d'atterrissage

**Contrat de production courant.** Module fixe decor/landing : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s11`. Images : `decor/landing`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-locker — Armoire de décor

**Contrat de production courant.** Module fixe decor/locker : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s03`, `s05`, `s07`, `s09`, `s47`. Images : `decor/locker`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-medical — Module médical

**Contrat de production courant.** Module fixe decor/medical : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s03`, `s06`, `s38`, `s40`, `s45`, `s49`. Images : `decor/medical`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-membrane — Membrane organique

**Contrat de production courant.** Module fixe decor/membrane : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s29`. Images : `decor/membrane`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-monolith — Monolithe

**Contrat de production courant.** Module fixe decor/monolith : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s22`. Images : `decor/monolith`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-office — Mobilier de bureau

**Contrat de production courant.** Module fixe decor/office : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s04`, `s08`. Images : `decor/office`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-ossuary — Restes et ossuaire

**Contrat de production courant.** Module fixe decor/ossuary : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s23`. Images : `decor/ossuary`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-pipe — Canalisation

**Contrat de production courant.** Module fixe decor/pipe : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s25`, `s29`, `s35`, `s36`, `s42`, `s44`. Images : `decor/pipe`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-pump — Pompe

**Contrat de production courant.** Module fixe decor/pump : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s18`, `s42`, `s48`. Images : `decor/pump`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-quarantine-instruments — Instruments de quarantaine

**Contrat de production courant.** Module fixe decor/quarantine-instruments : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s38`. Images : `decor/quarantine-instruments`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-ravine — Ravin

**Contrat de production courant.** Module fixe decor/ravine : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s36`. Images : `decor/ravine`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-reel — Dévidoir

**Contrat de production courant.** Module fixe decor/reel : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s02`, `s15`, `s17`. Images : `decor/reel`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-resinCable — Liaison de résine

**Contrat de production courant.** Module fixe decor/resinCable : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s26`, `s27`, `s28`, `s29`, `s32`, `s33`, `s43`, `s44`. Images : `decor/resinCable`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-rib — Nervure

**Contrat de production courant.** Module fixe decor/rib : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s20`, `s23`, `s26`, `s28`. Images : `decor/rib`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-seal-equipment — Équipement de scellement

**Contrat de production courant.** Module fixe decor/seal-equipment : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s07`. Images : `decor/seal-equipment`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-silica — Formation de silice

**Contrat de production courant.** Module fixe decor/silica : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s26`, `s27`, `s29`, `s44`. Images : `decor/silica`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-silicaShard — Éclat de silice

**Contrat de production courant.** Module fixe decor/silicaShard : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s26`, `s27`, `s28`, `s29`, `s32`, `s33`, `s43`, `s44`. Images : `decor/silicaShard`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-survey — Machine de relevé/excavation

**Contrat de production courant.** Module fixe decor/survey : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s21`, `s22`, `s24`, `s43`. Images : `decor/survey`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-terminal — Terminal

**Contrat de production courant.** Module fixe decor/terminal : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s04`, `s16`, `s24`, `s39`, `s46`. Images : `decor/terminal`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-throne — Structure de la chambre royale

**Contrat de production courant.** Module fixe decor/throne : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s33`. Images : `decor/throne`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-triage — Poste de triage

**Contrat de production courant.** Module fixe decor/triage : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s34`, `s45`, `s49`. Images : `decor/triage`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-valve — Vanne

**Contrat de production courant.** Module fixe decor/valve : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s44`. Images : `decor/valve`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-viewport — Hublot

**Contrat de production courant.** Module fixe decor/viewport : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.

**Ajouts 0.10.4 liés à cette fiche :** `planets/lv178-orbital`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s39`. Images : `decor/viewport`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-warningStripe — Bande de signalisation

**Contrat de production courant.** Module fixe decor/warningStripe : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s24`, `s25`, `s30`, `s31`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `decor/warningStripe`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-wash — Décontamination

**Contrat de production courant.** Module fixe decor/wash : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s06`, `s13`, `s41`, `s47`. Images : `decor/wash`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-winch — Treuil

**Contrat de production courant.** Module fixe decor/winch : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s14`, `s31`, `s35`. Images : `decor/winch`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Pièces mobiles uniquement liées à l'état actif de la machine. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-decor-workbench — Établi

**Contrat de production courant.** Module fixe decor/workbench : conserver silhouette, matériaux, pivot et échelle des occurrences décrites. Composer le décor selon sa profondeur sans masquer les acteurs, les objectifs ni les passages ; aucune animation artificielle requise.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s17`. Images : `decor/workbench`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-devices-console — devices / console

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/console-complete`. Console du dispositif achevé pour les sept usages hors pièces et isolation ; ce raccord ne remplace pas les consoles d’objectif ni l’appareil ICC.

**Avancement des travaux du checkpoint :** `MER-PROP-devices-console-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Module devices/console : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device`. Salles concernées : `s37`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`. Images : `devices/console`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-devices-isolation — devices / isolation

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `devices/isolation-closed`. État consigné des quatre dispositifs d’isolation ; conduite, danger, interaction, sauvegarde et drapeau restent ceux de la simulation.

**Avancement des travaux du checkpoint :** `MER-PROP-devices-isolation-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Module devices/isolation : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device`. Salles concernées : `s19`, `s25`, `s31`, `s36`. Images : `devices/isolation`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-devices-parts — devices / parts

**Contrat de production courant.** Module devices/parts : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.

**Ajouts 0.10.4 liés à cette fiche :** `devices/parts-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-devices-parts-W02` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.device`. Salles concernées : `s17`, `s34`. Images : `devices/parts`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-doors-bulkhead-frame — doors / bulkhead-frame

**Contrat de production courant.** Module doors/bulkhead-frame : conserver ancrage et ouverture du seuil compatible. Les positions intermédiaires ou supports incompatibles gardent un repli natif ; le PNG ne suffit pas à valider le passage.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door`. Aucune salle dédiée ou occurrence statique. Images : `doors/bulkhead-frame`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Pièce de baie industrielle ; ne couvre pas roche, rampe, cage, escalier ou mur oblique. **À vérifier :** Modules adaptés à chaque architecture ; ne pas étirer ce cadre sur une forme incompatible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-doors-bulkhead-panel — doors / bulkhead-panel

**Contrat de production courant.** Module doors/bulkhead-panel : conserver ancrage et ouverture du seuil compatible. Les positions intermédiaires ou supports incompatibles gardent un repli natif ; le PNG ne suffit pas à valider le passage.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door`. Aucune salle dédiée ou occurrence statique. Images : `doors/bulkhead-panel`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Pièce de baie industrielle ; ne couvre pas roche, rampe, cage, escalier ou mur oblique. **À vérifier :** Modules adaptés à chaque architecture ; ne pas étirer ce cadre sur une forme incompatible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-acid — effects / acid

**Contrat de production courant.** Effet acid : suivre l’événement natif, son origine et sa durée, avec retour au repos. Séparer phase de départ, maintien utile et disparition seulement si l’événement le justifie ; vérifier les tirs ou impacts répétés.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/acid`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement acid ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-flame — effects / flame

**Contrat de production courant.** Effet flame : suivre l’événement natif, son origine et sa durée, avec retour au repos. Séparer phase de départ, maintien utile et disparition seulement si l’événement le justifie ; vérifier les tirs ou impacts répétés.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/flame`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement flame ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-foam — effects / foam

**Contrat de production courant.** Effet foam : suivre l’événement natif, son origine et sa durée, avec retour au repos. Séparer phase de départ, maintien utile et disparition seulement si l’événement le justifie ; vérifier les tirs ou impacts répétés.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/foam`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement foam ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-impact — effects / impact

**Contrat de production courant.** Effet impact : suivre l’événement natif, son origine et sa durée, avec retour au repos. Séparer phase de départ, maintien utile et disparition seulement si l’événement le justifie ; vérifier les tirs ou impacts répétés.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/impact`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement impact ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-muzzle — effects / muzzle

**Contrat de production courant.** Effet muzzle : suivre l’événement natif, son origine et sa durée, avec retour au repos. Séparer phase de départ, maintien utile et disparition seulement si l’événement le justifie ; vérifier les tirs ou impacts répétés.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/muzzle`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement muzzle ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-effects-spark — effects / spark

**Contrat de production courant.** Effet spark : suivre l’événement natif, son origine et sa durée, avec retour au repos. Séparer phase de départ, maintien utile et disparition seulement si l’événement le justifie ; vérifier les tirs ou impacts répétés.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.drawEffects/tacticalGround/alien`. Aucune salle dédiée ou occurrence statique. Images : `effects/spark`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Compléter les phases utiles de l'événement spark ; une image ne forme pas un cycle. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-archive — equipment / archive

**Contrat de production courant.** Module equipment/archive : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`, `s38`, `s39`, `s40`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `equipment/archive`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-armory-rack — equipment / armory-rack

**Contrat de production courant.** Module equipment/armory-rack : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s09`, `s17`. Images : `equipment/armory-rack`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-decoy — equipment / decoy

**Contrat de production courant.** Module equipment/decoy : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/decoy`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-filter — equipment / filter

**Contrat de production courant.** Module equipment/filter : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/filter`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-lamp — equipment / lamp

**Contrat de production courant.** Module equipment/lamp : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/lamp`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-light-panel — equipment / light-panel

**Contrat de production courant.** Module equipment/light-panel : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s13`, `s15`, `s17`, `s18`, `s24`, `s30`, `s34`, `s35`, `s37`, `s42`. Images : `equipment/light-panel`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-locker-open — equipment / locker-open

**Contrat de production courant.** Module equipment/locker-open : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-equipment-locker-open-W02` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s17`, `s45`, `s47`, `s48`, `s49`, `s50`. Images : `equipment/locker-open`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-locker — equipment / locker

**Contrat de production courant.** Module equipment/locker : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/locker-stocked`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-equipment-locker-W02` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s17`, `s45`, `s47`, `s48`, `s49`, `s50`. Images : `equipment/locker`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-medkit — equipment / medkit

**Contrat de production courant.** Module equipment/medkit : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/medkit`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-radio — equipment / radio

**Contrat de production courant.** Module equipment/radio : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/radio`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-sensor — equipment / sensor

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `equipment/sensor-off`. Balise réellement éteinte, après arrêt manuel ou batterie épuisée. Absence de signal et extinction restent deux conditions différentes ; charge, récupération et impulsions restent natives.

**Avancement des travaux du checkpoint :** `MER-PROP-equipment-sensor-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Module equipment/sensor : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/sensor`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-shutter-control — equipment / shutter-control

**Contrat de production courant.** Module equipment/shutter-control : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s13`, `s15`, `s17`, `s18`, `s30`, `s35`, `s37`, `s42`. Images : `equipment/shutter-control`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Levier peint fixe et léger chevauchement ponctuel des textes natifs à corriger. **À vérifier :** Levier, témoin et libellé représentent le même état de cloison.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-stasis-canopy — equipment / stasis-canopy

**Contrat de production courant.** Module equipment/stasis-canopy : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s38`. Images : `equipment/stasis-canopy`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-supply — equipment / supply

**Contrat de production courant.** Module equipment/supply : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.

**Ajouts 0.10.4 liés à cette fiche :** `equipment/supply-empty`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-equipment-supply-W02` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Salles concernées : `s09`, `s12`, `s16`, `s17`, `s24`, `s30`, `s34`, `s37`. Images : `equipment/supply`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-tracker — equipment / tracker

**Contrat de production courant.** Module equipment/tracker : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/tracker`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-equipment-weakpoint — equipment / weakpoint

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `equipment/weakpoint-destroyed`. Résidu des trois attaches après hp <= 0. Les attaches sont une mécanique du projet ; cette image ne constitue pas une description canonique de la reine.

**Avancement des travaux du checkpoint :** `MER-PROP-equipment-weakpoint-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Module equipment/weakpoint : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer ou SoSEquipmentArt selon état`. Aucune salle dédiée ou occurrence statique. Images : `equipment/weakpoint`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-capture — objectives / capture

**Contrat de production courant.** Module objectives/capture : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s37`. Images : `objectives/capture`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-case — objectives / case

**Contrat de production courant.** Module objectives/case : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s02`, `s20`, `s21`, `s23`, `s26`, `s28`, `s32`. Images : `objectives/case`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-console — objectives / console

**Contrat de production courant.** Module objectives/console : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s03`, `s04`, `s05`, `s06`, `s08`, `s09`, `s11`, `s12`, `s13`, `s14`, `s16`, `s18`, `s24`, `s27`, `s29`, `s30`, `s31`, `s35`, `s36`, `s38`, `s39`. Images : `objectives/console`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-objectives-sleep — objectives / sleep

**Contrat de production courant.** Module objectives/sleep : distinguer disponible, utilisé/collecté et terminé selon son propriétaire natif. Employer la variante de l’état réel ; ne pas dessiner de stock après consommation ni réintroduire une action terminée. Si un état manque ou que l’image ne charge pas, conserver son rendu natif exact.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.object`. Salles concernées : `s40`. Images : `objectives/sleep`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — États intermédiaires, vides, consommés ou détruits encore natifs selon le cas. **À vérifier :** Conserver le repli tant qu'une image de l'état exact n'est pas disponible.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-crate — obstacles / crate

**Contrat de production courant.** Module crate : garder empreinte physique, hauteur, couche de profondeur et blocksClassic de chaque occurrence. La silhouette peut habiller le volume existant ; elle ne crée ni collision supplémentaire ni ouverture traversable.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s01`, `s02`, `s04`, `s06`, `s08`, `s09`, `s10`, `s11`, `s12`, `s15`, `s16`, `s17`, `s21`, `s24`, `s30`, `s31`, `s34`, `s36`, `s37`, `s39`, `s47`, `s48`, `s49`, `s50`. Images : `obstacles/crate`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-pipe — obstacles / pipe

**Contrat de production courant.** Module pipe : garder empreinte physique, hauteur, couche de profondeur et blocksClassic de chaque occurrence. La silhouette peut habiller le volume existant ; elle ne crée ni collision supplémentaire ni ouverture traversable.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s01`, `s02`, `s04`, `s06`, `s08`, `s10`, `s11`, `s12`, `s14`, `s15`, `s17`, `s24`, `s30`, `s31`, `s34`, `s36`, `s37`, `s39`, `s42`, `s43`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `obstacles/pipe`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-rack — obstacles / rack

**Contrat de production courant.** Module rack : garder empreinte physique, hauteur, couche de profondeur et blocksClassic de chaque occurrence. La silhouette peut habiller le volume existant ; elle ne crée ni collision supplémentaire ni ouverture traversable.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s01`, `s02`, `s04`, `s06`, `s08`, `s09`, `s10`, `s11`, `s12`, `s14`, `s15`, `s16`, `s17`, `s21`, `s24`, `s30`, `s31`, `s34`, `s37`, `s39`, `s42`, `s43`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `obstacles/rack`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-resin — obstacles / resin

**Contrat de production courant.** Module resin : garder empreinte physique, hauteur, couche de profondeur et blocksClassic de chaque occurrence. La silhouette peut habiller le volume existant ; elle ne crée ni collision supplémentaire ni ouverture traversable.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s19`, `s20`, `s22`, `s26`, `s27`, `s29`, `s32`, `s33`. Images : `obstacles/resin`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-rib — obstacles / rib

**Contrat de production courant.** Module rib : garder empreinte physique, hauteur, couche de profondeur et blocksClassic de chaque occurrence. La silhouette peut habiller le volume existant ; elle ne crée ni collision supplémentaire ni ouverture traversable.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s26`, `s27`, `s29`, `s32`, `s33`. Images : `obstacles/rib`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-obstacles-silica-rubble — obstacles / silica-rubble

**Contrat de production courant.** Module silica-rubble : garder empreinte physique, hauteur, couche de profondeur et blocksClassic de chaque occurrence. La silhouette peut habiller le volume existant ; elle ne crée ni collision supplémentaire ni ouverture traversable.


Module graphique existant ; fichier et occurrences de placement sont comptés séparément.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.prop`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s26`, `s27`, `s29`, `s32`, `s33`, `s36`. Images : `obstacles/silica-rubble`.

**Qualification.** project-adaptation. Références : [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Image du projet déjà publiée ; modèle, marquages et matière non authentifiés individuellement par une source primaire. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Contrôler silhouette, matière et échelle utile de ce module fixe ; aucune animation artificielle n'est exigée. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Préserver original, identifiant, empreintes et pivot ; toute nouvelle version garde sa provenance. Observer une occurrence et ses états avant clôture.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows-visual/src/art-pack.js](../../dlc/sea-of-sorrows-visual/src/art-pack.js), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-portal-boarding — Seuil : boarding

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : boarding. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s10`, `s37`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-boarding-ramp — Seuil : boarding-ramp

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/boarding-ramp`. Un PNG de rampe pour le couple réel s11/link-42-a arrière vers s37 et s37/link-42-b avant vers s11. Support, approche, verrouillage, traversée et arrivée restent natifs ; ni extérieur complet de navette ni vol animé.

**Avancement des travaux du checkpoint :** `MER-PROP-portal-boarding-ramp-W01` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : boarding-ramp. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s11`, `s37`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-building-entrance — Seuil : building-entrance

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : building-entrance. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s11`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-bulkhead — Seuil : bulkhead

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : bulkhead. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s04`, `s06`, `s07`, `s08`, `s09`, `s10`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s24`, `s25`, `s30`, `s31`, `s34`, `s35`, `s38`, `s39`, `s40`, `s41`, `s42`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Images : `doors/bulkhead-frame`, `doors/bulkhead-panel`.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-crawl-opening — Seuil : crawl-opening

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : crawl-opening. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s23`, `s24`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-exterior-path — Seuil : exterior-path

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : exterior-path. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s01`, `s02`, `s11`, `s36`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-interlude — Seuil : interlude

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : interlude. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-lift-cage — Seuil : lift-cage

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : lift-cage. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.

**Ajouts 0.10.4 liés à cette fiche :** `doors/lift-cage`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-portal-lift-cage-W01` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s14`, `s15`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-rock-breach — Seuil : rock-breach

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/rock-breach`. Un PNG frontal réutilisé aux neuf montages front/back : s19 avant, s20 arrière, s22 arrière, s26 avant, s27 arrière, s29 avant/arrière et s44 avant/arrière. Les montages latéraux gardent leur présentation native.

**Avancement des travaux du checkpoint :** `MER-PROP-portal-rock-breach-W01` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : rock-breach. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s19`, `s20`, `s21`, `s22`, `s23`, `s26`, `s27`, `s28`, `s29`, `s32`, `s33`, `s43`, `s44`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-stairwell — Seuil : stairwell

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : stairwell. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s19`, `s21`, `s34`, `s35`, `s36`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-transit — Seuil : transit

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : transit. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s02`, `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-portal-urban-transit — Seuil : urban-transit

**Contrat de production courant.** Produire cadre, ouverture et état de fermeture adaptés au type Seuil : urban-transit. Les montures gauche/droite/fond/sol ont des géométries différentes ; conserver le natif quand le PNG ne correspond pas. Comparer passage visible, zone d’interaction, arrivée, retour et transport de groupe sur les connexions de la fiche.


Type de passage natif et raison structurelle conservés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.door / transitions`. Salles concernées : `s04`, `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-layout. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-RUNTIME](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/src/png-renderer.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Définir les pièces et états propres à ce passage et aux montages utilisés. **À vérifier :** Support, ouverture et arrivée cohérents ; ellipse narrative explicitement identifiée.
- **P1 · verification** — Observer traversée, verrouillage, retour et groupe selon le passage. **À vérifier :** Un graphe connecté ne remplace pas un passage physique.

**Garde de continuité.** Conserver poursuite, ouverture et nature du transfert.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-hazard-arc — Danger : arc

**Contrat de production courant.** Représenter les phases inactif, avertissement, actif et consigné du danger Danger : arc. Déclencher l’effet sur le danger réel ; aucun dommage, chronomètre ou zone à risque ajouté par l’image.


Danger cyclique original ; ne pas le traiter comme décor passif.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.fieldGround/fieldWarnings ; simulation`. Salles concernées : `s18`, `s31`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-CORE](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · animation** — Inactif, avertissement, phase dangereuse et consignation de arc. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Synchroniser période, désactivation, dommages et accessibilité.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-hazard-gas — Danger : gas

**Contrat de production courant.** Représenter les phases inactif, avertissement, actif et consigné du danger Danger : gas. Déclencher l’effet sur le danger réel ; aucun dommage, chronomètre ou zone à risque ajouté par l’image.


Danger cyclique original ; ne pas le traiter comme décor passif.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.fieldGround/fieldWarnings ; simulation`. Salles concernées : `s19`, `s36`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-CORE](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · animation** — Inactif, avertissement, phase dangereuse et consignation de gas. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Synchroniser période, désactivation, dommages et accessibilité.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-hazard-steam — Danger : steam

**Contrat de production courant.** Représenter les phases inactif, avertissement, actif et consigné du danger Danger : steam. Déclencher l’effet sur le danger réel ; aucun dommage, chronomètre ou zone à risque ajouté par l’image.


Danger cyclique original ; ne pas le traiter comme décor passif.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.fieldGround/fieldWarnings ; simulation`. Salles concernées : `s25`, `s29`, `s35`, `s42`, `s44`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-CORE](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/src/core.js).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · animation** — Inactif, avertissement, phase dangereuse et consignation de steam. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Synchroniser période, désactivation, dommages et accessibilité.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PROP-icc-handheld — Appareil portable du rapport ICC

**Contrat de production courant.** Conserver un seul appareil visible pour le rapport électronique de s03 : posé hors consultation ou tenu dans la pose dédiée quand le raccord la sélectionne. La transmission conserve objectif o02-01, durée, marqueur et drapeau report_sent ; pas de nouvelle fonction du dispositif. La silhouette, les boutons et la dimension de présentation restent des choix du projet, distincts du dossier papier.

**Avancement des travaux du checkpoint :** `MER-PROP-icc-handheld-W01` — Résolu dans le périmètre déclaré (0.10.3); `MER-PROP-icc-handheld-W02` — Réalisé en partie (0.10.3). Les autres travaux de cette fiche restent ouverts.


Présentation distincte de la console générique de o02-01.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Édition 0.10.3.** Appareil posé sur le pupitre natif de o02-01 avant achèvement, en conservant marqueur, action et état terminé. Les autres consoles ne sont pas remplacées. Source : [objectives/icc-handheld.png](../../dlc/sea-of-sorrows-visual/sprites/objectives/icc-handheld.png). Placement fixe inspecté sur Canvas réel. Les critères détaillés ci-dessous décrivent le checkpoint et les états supplémentaires ; ils ne sont pas tous clôturés.

**Qualification.** primary-object-unspecified-design. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · visual** — Source générée de l'appareil portable ; boîtier et écran interprétés. **À vérifier :** Contrôler octets, alpha, dimensions et lisibilité avant admission.
- **P0 · integration** — Seulement o02-01 de s03 ; conserver durée, drapeau et état terminé. **À vérifier :** Vérifier action, état avant/après et sauvegarde/reprise ; une galerie seule ne suffit pas.

**Garde de continuité.** Les autres consoles et objectifs restent distincts.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-PROP-medical-chart — Dossier médical papier

**Contrat de production courant.** Dossier papier et porte-documents sont décrits ; le modèle représenté reste une adaptation. Support physique lisible en s03, feuilles sans données personnelles lisibles ; pas de nouvelle mécanique médicale. Ne pas confondre cet objet avec le rapport ICC électronique ou compter le médecin et son dossier comme une seule identité.

**Ajouts 0.10.4 liés à cette fiche :** `decor/medical-chart`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-medical-chart-W01` — Résolu dans le périmètre déclaré (0.10.4). Les autres travaux de cette fiche restent ouverts.


Accessoire du contexte médical, sans PNG individuel identifié.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-prop-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · visual** — Créer l'accessoire séparé seulement s'il est lisible et nécessaire à la consultation. **À vérifier :** Support physique cohérent ; aucune donnée personnelle ou intrigue additionnelle inventée.

**Garde de continuité.** Ne pas compter un terminal générique comme ce prop.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-medical-cups — Gobelets médicaux

**Contrat de production courant.** Un gobelet d’eau et un récipient plus petit avec deux comprimés blancs ; silhouette et matière fine restent interprétées. Poser les deux contenants sur un même support en s03, à une échelle lisible, sans consommation inventée. Un ensemble de deux objets dans un seul PNG ne compte ni comme deux fichiers ni comme une nouvelle action de soin.

**Ajouts 0.10.4 liés à cette fiche :** `decor/medical-cups`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PROP-medical-cups-W01` — Résolu dans le périmètre déclaré (0.10.4). Les autres travaux de cette fiche restent ouverts.


Accessoire du contexte médical, sans PNG individuel identifié.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s03`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-prop-partial. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · visual** — Créer l'accessoire séparé seulement s'il est lisible et nécessaire à la consultation. **À vérifier :** Support physique cohérent ; aucune donnée personnelle ou intrigue additionnelle inventée.

**Garde de continuité.** Ne pas compter un terminal générique comme ce prop.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-yellow-survey-flag — Balise jaune du relevé

**Contrat de production courant.** Variante audio à décider avant incorporation ; conserver la preuve et sa continuité. Produire seulement le support et l’état utilisés dans la scène choisie ; aucune apparence officielle présumée.


Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s01`, `s02`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-restraint-chair — Siège et sangles de retenue

**Contrat de production courant.** Variante audio à décider avant incorporation ; conserver la preuve et sa continuité. Produire seulement le support et l’état utilisés dans la scène choisie ; aucune apparence officielle présumée.


Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s08`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-hood — Cagoule de transport

**Contrat de production courant.** Variante audio à décider avant incorporation ; conserver la preuve et sa continuité. Produire seulement le support et l’état utilisés dans la scène choisie ; aucune apparence officielle présumée.


Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s05`, `s07`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

### MER-PROP-audio-tranquillizer — Dispositif de sédation

**Contrat de production courant.** Variante audio à décider avant incorporation ; conserver la preuve et sa continuité. Produire seulement le support et l’état utilisés dans la scène choisie ; aucune apparence officielle présumée.


Besoin possible de la version audio ; absence non déclarée comme omission certifiée du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · continuity** — Décider d'une variante audio avant incorporation. **À vérifier :** Source et scène propres à cette version.
- **P2 · visual** — Produire si la scène est retenue ; toute forme non décrite reste adaptation. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Aucune activation automatique dans le parcours roman.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

## Véhicules et transports au sol — 5 fiches

### MER-EQUIP-stretchers — Brancards Adams / Elway

**Contrat de production courant.** Deux châssis distincts pour Adams et Elway ; identité et parasite attaché conservés. Produire les états roulage, arrêt, réparation et arrimage seulement pour leurs états natifs. Vérifier largeur utile, roues au sol et franchissement groupé de s34 à s38 ; les détours annexes restent distincts.


Transport des deux hôtes ; châssis motorisés, intégrité et allures originaux.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.stretcher / état rescue`. Salles concernées : `s34`, `s35`, `s36`, `s37`, `s38`, `s45`, `s49`, `s50`. Images : `stretchers/adams`, `stretchers/elway`.

**Qualification.** secondary-context-project-design. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-FIDELITY](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/fidelity.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Transport des deux hôtes ; châssis motorisés, intégrité et allures originaux. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Roues, arrêt, réparation, arrimage et seuil, sans téléportation. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver stocks finis, accès physique et états persistés. Une illustration ne vaut pas une manipulation animée.

**Sources du projet :** [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js), [dlc/sea-of-sorrows-visual/src/equipment-ui.js](../../dlc/sea-of-sorrows-visual/src/equipment-ui.js).

### MER-VEH-excavator — Excavateur du chantier

**Contrat de production courant.** Conserver l’excavateur de fouille existant, son outil et sa base comme véhicule de chantier statique. Séparer bras, outil et train de roulement uniquement si une action de chantier les utilise. Comparer empreinte visuelle, dimensions du décor et dégagement des chemins en s21, s22, s24 et s43.


Images de machine de chantier déjà présentes ; elles ne donnent pas un véhicule pilotable.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.decor`. Salles concernées : `s21`, `s22`, `s24`, `s43`. Images : `decor/excavator`, `decor/survey`.

**Qualification.** project-design-with-audio-context. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Ne pas confondre excavateur et crawler de transport ; modèle et silhouette industriels non authentifiés. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · animation** — Bras, outils, roues/chenilles seulement si une action de chantier les nécessite. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Conserver la fonction décorative tant qu'aucune mécanique pilotable n'est définie.

**Sources du projet :** [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-VEH-mine-cages — Cages et moyens de levage de la mine

**Contrat de production courant.** Séparer cage, palier, porte, guides, câble et entraînement ; ne pas assimiler le treuil à un véhicule entier. La pièce lift-cage habille uniquement un seuil compatible ; le rendu des verrous et les destinations restent natifs. Course, suspension, arrêts et cabine occupée restent à réaliser si une ellipse est remplacée ; s30 doit être vérifiée indépendamment.

**Ajouts 0.10.4 liés à cette fiche :** `doors/lift-cage`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Passages verticaux et treuils, distincts d'un véhicule routier.

**Présent au checkpoint.** Propriétaire : `Transitions lift-cage / SoSRenderer.door`. Salles concernées : `s14`, `s15`, `s30`. Images : `decor/winch`, `decor/hoist-drive`.

**Qualification.** secondary-context-original-layout. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Apparence, dimensions et marquages sans référence primaire précise. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · animation** — Cabine, suspension, course et arrêts seulement si un trajet animé remplace l'ellipse. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** Ne pas convertir une liaison verticale en porte horizontale sans justification. Vérifier les arrivées avec le groupe.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/core.js](../../dlc/sea-of-sorrows/src/core.js), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js).

### MER-VEH-tram — Transport urbain de Chicago

**Contrat de production courant.** Le tram des données est une liaison originale de Chicago ; le modèle n’est pas authentifié par le roman. Avant de produire une voiture, définir entrée, station, cadre du transfert et sortie ; ne pas accoler artificiellement les salles. Extérieur, accès et intérieur doivent décrire le même véhicule si ce moyen est représenté.


Liaison tram s04–s05 dans les données ; aucun véhicule entier PNG.

**Présent au checkpoint.** Propriétaire : `Seuil urban-transit`. Salles concernées : `s04`, `s05`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** original-gameplay-not-confirmed-novel. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Moyen de transport romanesque à confirmer avant qualification canonique. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · visual** — Station/voiture seulement si la transition en a besoin. **À vérifier :** Les stations restent distinctes ; ne pas accoler artificiellement les deux intérieurs.

**Garde de continuité.** Conserver le statut de liaison d'adaptation.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js).

### MER-VEH-audio-crawler — Crawler du relevé

**Contrat de production courant.** Garder le crawler dans la variante audio tant que la continuité n’est pas décidée. Définir cabine, accès, plateau et empreinte seulement à partir des besoins de la scène retenue. Ne pas renommer l’excavateur existant ni ajouter une conduite jouable sans contrat de gameplay.


Véhicule de transport audio ; non couvert par une image d'excavateur.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s01`, `s02`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · continuity** — Définir la variante audio avant ajout au prologue. **À vérifier :** Ne pas qualifier son absence comme omission romanesque sans passage correspondant.
- **P2 · visual** — Extérieur et accès utiles, sans modèle officiel ou pilotage inventé. **À vérifier :** Comparer silhouette, alpha, échelle et référence ; conserver les règles natives.

**Garde de continuité.** Séparer transport de l'équipe et machine de forage.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

## Vaisseaux et navettes — 5 fiches

### MER-SHIP-carlyle — Carlyle — transport sanitaire

**Contrat de production courant.** Conserver le nom Carlyle dans le contexte médical de s03 ; distinguer le transport contractuel ultérieur. La consultation et ses props documentent un intérieur ; aucune silhouette, propulsion ou dimension extérieure n’en découle. Tout extérieur futur doit être qualifié d’adaptation et garder des accès cohérents avec la cabine produite.

**Ajouts 0.10.4 liés à cette fiche :** `characters/decker-medical-report`, `decor/medical-chart`, `decor/medical-cups`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-SHIP-carlyle-W01` — Résolu dans le périmètre déclaré (0.10.3). Les autres travaux de cette fiche restent ouverts.


Transport nommé au chapitre 4 ; s03 en condense le contexte.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s03`. Images : `decor/medical`, `decor/cryo`.

**Qualification.** primary-name-no-exterior-design. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P0 · reference** — Qualifier s03 comme Carlyle sans renommer le transport W-Y ultérieur. **À vérifier :** Les deux vaisseaux restent distincts.
- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-contractual-transport — Transport contractuel Weyland-Yutani

**Contrat de production courant.** Relier coursive, briefing, armurerie, hangar, quarantaine, observatoire et dernière salle comme lieux d’un même transport. Établir les accès et volumes utiles avant extérieur ; conserver les noms et silhouettes distincts du Carlyle. Aucune classe de vaisseau, propulsion, tonnage ou mesure canonique n’est déduite du graphe des salles.

**Ajouts 0.10.4 liés à cette fiche :** `planets/lv178-orbital`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Intérieurs présents ; nom et extérieur non établis par les preuves romanesques examinées.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s07`, `s08`, `s09`, `s10`, `s38`, `s39`, `s40`. Images : `decor/cargo`, `decor/viewport`, `decor/cryo`.

**Qualification.** secondary-context-unnamed-in-current-novel-proof. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-shuttle — Navette d'expédition

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `doors/boarding-ramp`. Un PNG de rampe pour le couple réel s11/link-42-a arrière vers s37 et s37/link-42-b avant vers s11. Support, approche, verrouillage, traversée et arrivée restent natifs ; ni extérieur complet de navette ni vol animé.

**Avancement des travaux du checkpoint :** `MER-SHIP-shuttle-W02` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Conserver une silhouette cohérente entre vue extérieure, aire de posé, rampe et soute. Présenter état au sol, ouverture de rampe, capture et embarquement selon les drapeaux existants. Approche, décollage, vol et pilote restent des besoins séparés ; l’image dropship ne prouve pas une animation de vol.


L'extérieur existe sous decor/dropship ; la soute et la capture sont des surfaces séparées.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s10`, `s11`, `s36`, `s37`. Images : `decor/dropship`, `decor/landing`, `decor/captureBay`.

**Qualification.** secondary-context-project-exterior. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.
- **P2 · animation** — Approche, posé, accès et départ ; une image extérieure n'est pas un vol animé. **À vérifier :** PNG individuels, proportions/pivots/attaches stables ; entrée, action et retour observés sur un état réel.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-buried-hull — Carène ancienne enfouie

**Contrat de production courant.** Maintenir continuité de coque entre s19 et s20 et cohérence de la brèche accessible. Les parties enfouies restent masquées ; ne pas extrapoler un plan intégral, constructeur ou espèce sans référence. Distinguer carène de décor, pièces d’obstacle et passage : chacun garde son propriétaire natif.


Vestige et brèche ; aucune attribution automatique aux Ingénieurs.

**Présent au checkpoint.** Propriétaire : `Décors, territoires et ellipses de campagne`. Salles concernées : `s19`, `s20`. Images : `decor/carene`.

**Qualification.** secondary-context-unidentified-origin. Références : [plot](https://www.avpcentral.com/alien-sea-of-sorrows), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-SHIP-audio-kiangya — Kiangya — variante audio

**Contrat de production courant.** Le nom Kiangya appartient à la preuve audio disponible ; pas de renommage automatique du transport du roman. Produire des vues seulement pour une variante audio explicitement retenue. Extérieur et plan interne demeurent non authentifiés ; un nouveau nom ne fournit pas une nouvelle silhouette.


Nom du cargo audio, à conserver distinct de la preuve du roman.

**Présent au checkpoint.** Aucun raccord distinct au checkpoint. Salles concernées : `s07`, `s08`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-audio-only. Références : [AUDIO-SAMPLE](https://m.media-amazon.com/images/G/02/AudibleUK/en_GB/cruk/email/merch/2019/May_AudibleNewcomersCompetition/ALIEN.pdf), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · continuity** — Décider d'une couche audio avant de reprendre ce nom dans le parcours roman. **À vérifier :** Aucune confusion avec Carlyle.
- **P1 · reference** — Extérieur, plan interne, dimensions et propulsion exacts non authentifiés pour cet appareil. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P1 · visual** — Compléter les vues nécessaires : extérieur, embarquement, soute/cabine et transitions. **À vérifier :** Même silhouette et mêmes accès entre extérieur et intérieur.

**Garde de continuité.** L'ordre des salles ne donne pas un plan métrique. Un intérieur ne prouve pas une silhouette extérieure produite.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json](../../dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

## Terrain et matériaux — 22 fiches

### MER-TERRAIN-alien — Brèche de coque

**Contrat de production courant.** Sol : coque courbe fracturée, raccord du seuil à la brèche. Parois et profondeur : nervures profondes, rebords de rupture. Contrôle de cohérence : la brèche doit laisser visible son passage effectif.


Famille alien : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s20`. Images : `decor/rib`, `decor/resinCable`, `decor/silicaShard`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-armory — Armurerie

**Contrat de production courant.** Sol : sol métallique sec et antidérapant. Parois et profondeur : panneaux porteurs et rangements de dotation. Contrôle de cohérence : les stocks et accès physiques restent lisibles devant le fond.


Famille armory : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s09`. Images : `decor/armory`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-bridge — Passerelle de fouille

**Contrat de production courant.** Sol : tablier et bords porteurs du pont. Parois et profondeur : structures de soutien et profondeur de fouille. Contrôle de cohérence : le vide figuré ne crée ni chute ni zone traversable supplémentaire.


Famille bridge : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s25`. Images : `decor/bridge`, `decor/cable`, `decor/cableTray`, `decor/warningStripe`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-camp — Abri Quonset

**Contrat de production courant.** Sol : sol d’abri et jonction au seuil. Parois et profondeur : paroi cintrée du Quonset, fixations et cloisonnement. Contrôle de cohérence : préserver l’espace du groupe et les fournitures.


Famille camp : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s12`. Images : `decor/briefing`, `decor/battery`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-decon — Sas et filtration

**Contrat de production courant.** Sol : grille de drainage et seuils de sas. Parois et profondeur : conduits de filtration, surfaces lavables. Contrôle de cohérence : le filtre et la consignation restent des états natifs.


Famille decon : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s13`, `s41`. Images : `decor/wash`, `decor/filters`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-derelict — Carène enfouie

**Contrat de production courant.** Sol : dépôt minéral au pied de la carène. Parois et profondeur : coque ancienne partiellement ensevelie. Contrôle de cohérence : distinguer une cavité décorative d’un accès.


Famille derelict : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s19`. Images : `decor/carene`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-hangar — Hangar et soute

**Contrat de production courant.** Sol : plancher de soute, lignes d’arrimage. Parois et profondeur : cloisons, ouverture de rampe et profondeur de hangar. Contrôle de cohérence : conserver le volume d’embarquement des brancards et du spécimen.


Famille hangar : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s10`, `s37`. Images : `decor/dropship`, `decor/cargo`, `decor/cableTray`, `decor/warningStripe`, `decor/captureBay`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-hive — Ruche et résine

**Continuation 0.10.5 — raccord observé dans les fixtures Canvas.** `terrain/hive`. Surface du sol des deux salles de kind hive. Les parois, volumes, ouvertures, œufs et collisions restent distincts ; la salle de reine s33 n’est pas incluse par déduction.

**Avancement des travaux du checkpoint :** `MER-TERRAIN-hive-W01` — Réalisé en partie (0.10.5). Les autres travaux de cette fiche restent ouverts.

**Contrat de production courant.** Sol : résine au niveau du sol et surfaces de passage. Parois et profondeur : nervures, poches et couches organiques. Contrôle de cohérence : aucun élément décoratif ne remplace une population ou un œuf actif.


Famille hive : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s28`, `s32`. Images : `decor/cocoon`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/eggs`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-home — Appartement habité

**Contrat de production courant.** Sol : sol domestique et raccord aux murs. Parois et profondeur : parois habitées et meubles civils. Contrôle de cohérence : conserver la rupture entre vie civile et espaces d’expédition.


Famille home : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s05`. Images : `decor/home`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-lift — Puits et recettes

**Contrat de production courant.** Sol : palier, seuil de cage et bord du puits. Parois et profondeur : guides, suspension et parois du puits. Contrôle de cohérence : une cage de seuil fixe ne prétend pas simuler une course verticale.

**Ajouts 0.10.4 liés à cette fiche :** `doors/lift-cage`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Famille lift : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s14`, `s15`, `s30`. Images : `decor/hoist-drive`, `decor/winch`, `decor/cableTray`, `decor/warningStripe`, `decor/reel`, `decor/cable`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-medical — Sols et parois médicales

**Contrat de production courant.** Sol : sol lavable, socles de couchette et circulation. Parois et profondeur : parois de cabine, équipements et surfaces sanitaires. Contrôle de cohérence : Carlyle, clinique terrestre, quarantaine et secours gardent leurs contextes propres.

**Ajouts 0.10.4 liés à cette fiche :** `decor/medical-chart`, `decor/medical-cups`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Famille medical : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s03`, `s06`, `s38`, `s40`, `s45`, `s49`. Images : `decor/medical`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `decor/wash`, `decor/quarantine-instruments`, `decor/cryo`, `decor/triage`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-office — Bureaux et locaux civils

**Contrat de production courant.** Sol : sol civil et dégagement devant les bureaux. Parois et profondeur : cloisons, portes et surfaces de travail. Contrôle de cohérence : Chicago et la salle contractuelle ne deviennent pas une même pièce.


Famille office : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s04`, `s08`. Images : `decor/office`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `decor/briefing`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-ossuary — Restes enfouis

**Contrat de production courant.** Sol : sédiment et zones de marche dégagées. Parois et profondeur : restes enfouis, parois et profondeur. Contrôle de cohérence : ne pas transformer des restes de décor en nouvelles identités biologiques.


Famille ossuary : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s23`. Images : `decor/ossuary`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-power — Desserte énergétique

**Contrat de production courant.** Sol : sol technique, caniveaux et passages de câble. Parois et profondeur : panneaux, alimentations et conduites. Contrôle de cohérence : arcs et consignations doivent rester lisibles dans leur phase réelle.


Famille power : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s18`, `s34`, `s42`, `s48`. Images : `decor/generator`, `decor/pump`, `decor/cableTray`, `decor/warningStripe`, `decor/triage`, `decor/cable`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-queen — Chambre royale

**Contrat de production courant.** Sol : aire de circulation autour de la reine. Parois et profondeur : résine, hauteur de chambre et profondeur du trône. Contrôle de cohérence : les trois attaches restent une mécanique originale déclarée.


Famille queen : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s33`. Images : `decor/throne`, `decor/eggs`, `decor/resinCable`, `decor/silicaShard`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-relay — Postes de relais

**Contrat de production courant.** Sol : sol de poste technique et supports des appareils. Parois et profondeur : panneaux, antennes, câbles et fonds de relevé. Contrôle de cohérence : les consoles utiles se distinguent des modules non interactifs.


Famille relay : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s16`, `s24`, `s46`. Images : `decor/antenna`, `decor/terminal`, `decor/cableTray`, `decor/warningStripe`, `decor/survey`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-ruins — Fouilles ensevelies

**Contrat de production courant.** Sol : sédiment de fouille et pistes accessibles. Parois et profondeur : coupes du terrain, vestiges et grandes masses enfouies. Contrôle de cohérence : les engins et fragments ne masquent ni sorties ni obstacles physiques.


Famille ruins : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s21`, `s22`, `s43`. Images : `decor/excavator`, `decor/survey`, `decor/resinCable`, `decor/silicaShard`, `decor/monolith`, `decor/bridge`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-sand — Sable noir de surface

**Contrat de production courant.** Sol : surface granuleuse sombre et petites ondulations. Parois et profondeur : coupes de dune, lointains minéraux et brume de surface. Contrôle de cohérence : la texture du sol ne porte ni lune, ni route, ni coordonnée géographique inventée.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/sand`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-TERRAIN-sand-W01` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Famille sand : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s01`, `s02`, `s11`, `s36`. Images : `decor/checkpoint`, `decor/fence`, `decor/cableTray`, `decor/warningStripe`, `decor/drill`, `decor/reel`, `decor/landing`, `decor/antenna`, `decor/ravine`, `decor/cable`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json), [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-ship — Coursive et observatoire du transport

**Contrat de production courant.** Sol : coursive pressurisée et seuils de cloison. Parois et profondeur : parois, conduits et baie d’observation. Contrôle de cohérence : le panorama orbital reste derrière la baie de s39 et hors de la marche.

**Ajouts 0.10.4 liés à cette fiche :** `planets/lv178-orbital`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.


Famille ship : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s07`, `s39`. Images : `decor/seal-equipment`, `decor/locker`, `decor/cableTray`, `decor/warningStripe`, `decor/viewport`, `decor/terminal`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-silica — Tubes de silice

**Contrat de production courant.** Sol : grain minéral et facettes de silice au sol. Parois et profondeur : parois tubulaires, joints et éclats de bord. Contrôle de cohérence : distinguer brillance décorative, gravats physiques et résine.

**Ajouts 0.10.4 liés à cette fiche :** `terrain/silica`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-TERRAIN-silica-W01` — Réalisé en partie (0.10.4). Les autres travaux de cette fiche restent ouverts.


Famille silica : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s26`, `s27`, `s29`, `s44`. Images : `decor/silica`, `decor/rib`, `decor/resinCable`, `decor/silicaShard`, `decor/amber`, `decor/membrane`, `decor/pipe`, `decor/valve`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-stairs — Escalier et paliers

**Contrat de production courant.** Sol : marches, paliers et jonctions praticables. Parois et profondeur : supports, garde-corps et volume de cage d’escalier. Contrôle de cohérence : la perspective doit suivre les points d’entrée et de sortie existants.


Famille stairs : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s31`, `s35`. Images : `decor/cableTray`, `decor/winch`, `decor/warningStripe`, `decor/pipe`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

### MER-TERRAIN-workshop — Ateliers et magasins

**Contrat de production courant.** Sol : sol de maintenance, caniveaux et zones de travail. Parois et profondeur : établis, gaines, rangements et séparations. Contrôle de cohérence : une pièce vide après collecte ne doit pas conserver un stock illustré.


Famille workshop : fond, sol et architecture procéduraux, modules PNG réutilisés.

**Présent au checkpoint.** Propriétaire : `SoSRenderer.backdrop/floor/architecture`. Salles concernées : `s17`, `s47`, `s50`. Images : `decor/workbench`, `decor/reel`, `decor/cableTray`, `decor/warningStripe`, `decor/locker`, `decor/wash`, `decor/cargo`, `decor/battery`.

**Qualification.** documented-context-original-materials. Références : [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json), [PROJECT-ART](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P1 · visual** — Textures ou modules sol/paroi/plafond et couches de profondeur cohérents pour cette famille. **À vérifier :** Ni ouverture fictive ni obstacle visuel contradictoire avec le chemin réel.
- **P1 · reference** — Couleurs exactes, matières fines et métriques non documentées ; un matériau cité n'authentifie pas ses pixels. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.
- **P2 · verification** — Comparer les deux projections sur les mêmes accès. **À vérifier :** Échelle, pieds, objectifs et sortie lisibles.

**Garde de continuité.** Réutiliser les assets sans les compter plusieurs fois. Aucun biome supplémentaire présenté comme canonique sans source.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js), [dlc/sea-of-sorrows/src/render.js](../../dlc/sea-of-sorrows/src/render.js), [dlc/sea-of-sorrows-visual/src/png-renderer.js](../../dlc/sea-of-sorrows-visual/src/png-renderer.js).

## Planètes — 2 fiches

### MER-PLANETE-lv178 — LV-178 / New Galveston

**Contrat de production courant.** Conserver LV-178 et New Galveston comme alias d’une seule planète. La vue orbitale de s39 est une illustration pour l’observation ; elle ne constitue ni carte ni vue métrique certifiée. Continents, atmosphère, distances, satellites et échelle globale restent non authentifiés ; ne pas les déduire des salles.

**Ajouts 0.10.4 liés à cette fiche :** `planets/lv178-orbital`. État de la passe : `integrated-and-static-canvas-verified`. Les usages et conditions de cette édition historique figurent dans `editionHistory[0].currentEdition.bindings` du JSON.

**Avancement des travaux du checkpoint :** `MER-PLANETE-lv178-W01` — Résolu dans le périmètre déclaré (0.10.4). Les autres travaux de cette fiche restent ouverts.


Cadre principal ; noms et sables toxiques confirmés, géographie globale non cartographiée.

**Présent au checkpoint.** Propriétaire : `Territoires et transferts narratifs`. Salles concernées : `s01`, `s02`, `s11`, `s12`, `s13`, `s14`, `s15`, `s16`, `s17`, `s18`, `s19`, `s20`, `s21`, `s22`, `s23`, `s24`, `s25`, `s26`, `s27`, `s28`, `s29`, `s30`, `s31`, `s32`, `s33`, `s34`, `s35`, `s36`, `s37`, `s41`, `s42`, `s43`, `s44`, `s45`, `s46`, `s47`, `s48`, `s49`, `s50`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-context-no-global-map. Références : [titan](https://titanbooks.com/6484-alien-sea-of-sorrows-book-2/), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

- **P2 · visual** — Créer vue orbitale ou carte seulement pour une transition utile. **À vérifier :** Continent, lune, dimension ou atmosphère non décrits restent interprétés.
- **P1 · reference** — Coordonnées, distances et géographie complète à documenter. **À vérifier :** Associer la preuve au trait concerné ; qualifier le reste comme adaptation.

**Garde de continuité.** Conserver alias d'un même corps dans une seule entrée. Ne pas inventer de planète pour remplir la catégorie.

**Sources du projet :** [dlc/sea-of-sorrows/data/campaign.json](../../dlc/sea-of-sorrows/data/campaign.json), [dlc/sea-of-sorrows/data/fidelity.json](../../dlc/sea-of-sorrows/data/fidelity.json), [dlc/sea-of-sorrows/src/world-art.js](../../dlc/sea-of-sorrows/src/world-art.js).

### MER-PLANETE-earth — Terre

**Contrat de production courant.** La Terre est le cadre des scènes civiles s04 à s06 ; Chicago reste un lieu terrestre. Aucune nouvelle vue planétaire n’est nécessaire pour prétendre couvrir les scènes locales existantes. Si une transition orbitale est retenue, définir son cadrage et son usage avant l’asset ; ne pas créer de planète ou satellite supplémentaire.


Retour terrestre et scènes civiles ; Chicago n'est pas une planète supplémentaire.

**Présent au checkpoint.** Propriétaire : `Territoires et transferts narratifs`. Salles concernées : `s04`, `s05`, `s06`. Aucun PNG distinct ; repli natif ou contenu documentaire selon le cas.

**Qualification.** primary-context-no-global-map. Références : [NOVEL-CH04](https://www.joblo.com/exclusive-book-preview-of-alien-sea-of-sorrows-178/), [excerpt](https://gizmodo.com/discover-weyland-yutanis-darkest-secrets-in-this-alien-1612140409), [PROJECT-CAMPAIGN](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/ff6d538b32f9eb8946f2d296df1b790bf479eef9/dlc/sea-of-sorrows/data/campaign.json).

**Travaux du checkpoint 0.10.2 et critères de clôture — voir leur statut courant ci-dessus :**

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
