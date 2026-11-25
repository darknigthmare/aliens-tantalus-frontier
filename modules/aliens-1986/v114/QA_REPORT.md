# QA — ALIENS V114 / Lieux et identités / RC1

## Résultats et portée

**665 tests Node passent :579 historiques réexécutés et86 nouveaux. 377 contrôles navigateur gameplay passent :291 historiques adaptés au contrat114 et86 de fidélité.** Onze contextes Chromium indépendants, aucune erreur JavaScript/console observée. Les25 contrôles de distribution et195 essais de corpus sont séparés. Neuf variantes d’opération complètes, trois parcours réciproques d’inspection et un exercice de poursuite distinct.

Ces résultats concernent la branche autonome exacte livrée. Ils ne certifient ni une adaptation1:1, ni les64 salles natives, ni les transports/ascenseurs du film, ni un téléphone physique.

## Provenance

Archive source fournie :ALIENS_1986_V113_TENIR_LES_ANGLES_RC1.zip,93 623 236octets ; SHA-256079d01f8baa7c3ab7e7e6ea6cf38ee223fa506e2e57f7e2a2157265ed2726572. 30 sources V113 sont conservées byte-for-byte dans baseline/SOURCES_PRESERVEES_V113.json. Les nouveaux modules forkent les importeurs, ils ne falsifient pas les anciens valideurs.

## Catalogue et architecture

Contrat c9520d41. {"inspectableRooms": 25, "operationRooms": 11, "addedInspections": 15, "additionalOperationRooms": 2, "reciprocalLinks": 20, "directedFaces": 40, "operationLinks": 13, "internalDoors": 25, "vestibules": 40, "fixedSolids": 202, "props": 135, "enemies": 13, "sentries": 1, "namedNPCs": 12, "characterProfiles": 16, "weaponProfiles": 8, "equipmentReferences": 24, "locationReferences": 28, "mappedLocationReferences": 20, "absentLocationReferences": 8, "objectives": 5}.

Chaque porte intérieure est entre ses segments de paroi ou sur la limite critique prévue. Les40 faces de liaison disposent chacune de deux retours de mur fixés au périmètre. Les supports des props et les approches des deux stocks d’armement sont vérifiés. La validation géométrique ne constitue pas un relevé métrique du film.

## Fidélité : statut exact

28 repères documentés :20 associés à un lieu,8 absents explicites. Il ne s’agit pas d’un inventaire exhaustif plan par plan du film. Gateway, préparation Sulaco et processeur sont trois ensembles d’inspection connectés ; les transports et le hangar final restent séparés. Aucun ascenseur, vol ou conduite n’est simulé par un saut de porte. Les deux détours coloniaux appartiennent à l’opération.

16 profils de costume ;12 PNJ de préparation, non recrutable en renfort. Ripley civile à Gateway, Newt non armée, absence de Marines sains dans le hangar final. La chronologie locale Ripley/Hicks/Hudson/Newt reste adaptée. Les24 références d’équipement comportent des fiches et des décors explicitement non jouables ; huit profils ont un tir/contact fonctionnel.

## 86 tests V114 dirigés

25 créations et reprises de lieux,20 raccords et leurs arrivées, audit de parois/jambages, atlas et distribution ; huit profils consommant leurs réserves, huit tests de murs, shotgun multirayons pour une cartouche, trajectoires explosifs et fermeture dynamique, risque allié, pause/reprise à mi-vol, collecte interrompue/unique, interdiction Newt, munitions Hicks séparées, imports hostiles et vraies migrations V113.

Ces fixtures préparées testent les règles ; elles ne sont pas annoncées comme des parcours complets.

## Parcours à entrées publiques

Les pilotes lisent l’état pour choisir leurs chemins et cibles. Ils utilisent mouvement, tir, interaction, ordres, dotations, lumière et autres commandes publiques, sans réécrire coordonnées, vies, munitions, réserves ou objectifs. Les imports sont leurs exports non modifiés. Ils sont informés par l’état, pas des joueurs aveugles aux données internes. Les secondes simulées ne sont pas une estimation de durée humaine.

### Héritage — operation

{"variant": "direct", "complete": true, "inputs": 3294, "elapsed": 82.35}

{"variant": "service-link-reloads", "complete": true, "inputs": 2780, "elapsed": 69.5}

### Héritage — logistics

{"variant": "supply-loop", "complete": true, "inputs": 4566, "elapsed": 114.15000000000883, "team": [{"id": "ripley", "hp": 86, "ammo": 26}, {"id": "hicks", "hp": 100, "ammo": 22}, {"id": "hudson", "hp": 100, "ammo": 23}, {"id": "newt", "hp": 100, "ammo": 0}]}

{"variant": "supply-loop-reloads", "complete": true, "inputs": 4565, "elapsed": 114.12500000000882, "team": [{"id": "ripley", "hp": 86, "ammo": 26}, {"id": "hicks", "hp": 100, "ammo": 22}, {"id": "hudson", "hp": 100, "ammo": 23}, {"id": "newt", "hp": 100, "ammo": 0}]}

### Héritage — breach

{"complete": true, "inputs": 4466, "elapsed": 111.65000000000826, "team": [{"id": "ripley", "hp": 100, "ammo": 7}, {"id": "hicks", "hp": 100, "ammo": 22}, {"id": "hudson", "hp": 86, "ammo": 22}, {"id": "newt", "hp": 100, "ammo": 0}]}

### Héritage — lighting

{"complete": true, "inputs": 4131, "elapsed": 103.27500000000636, "team": [{"id": "ripley", "hp": 100, "ammo": 14}, {"id": "hicks", "hp": 100, "ammo": 23}, {"id": "hudson", "hp": 86, "ammo": 23}, {"id": "newt", "hp": 100, "ammo": 0}]}

### Héritage — beacon

{"complete": true, "inputs": 4710, "elapsed": 117.75000000000965, "team": [{"id": "ripley", "hp": 100, "ammo": 8}, {"id": "hicks", "hp": 100, "ammo": 22}, {"id": "hudson", "hp": 100, "ammo": 22}, {"id": "newt", "hp": 100, "ammo": 0}]}

### Héritage — tactics

{"complete": true, "inputs": 4421, "elapsed": 110.525000000008, "team": [{"id": "ripley", "hp": 100, "ammo": 18}, {"id": "hicks", "hp": 100, "ammo": 19}, {"id": "hudson", "hp": 100, "ammo": 20}, {"id": "newt", "hp": 100, "ammo": 0}], "sentryAmmo": 111}

### sulaco-inspections

{"visited": ["v114-sulaco-cryo", "v114-sulaco-mess", "v114-sulaco-armory", "v114-sulaco-cargo"], "transitions": 6, "publicInputs": 2623, "shots": [{"id": "pulse", "before": 48, "after": 47}, {"id": "shotgun", "before": 12, "after": 11}, {"id": "flame", "before": 80, "after": 79}, {"id": "smartgun", "before": 120, "after": 119}, {"id": "pistol", "before": 30, "after": 29}, {"id": "launcher", "before": 4, "after": 3}, {"id": "grenade", "before": 2, "after": 1}, {"id": "knife", "before": null, "after": null}]}

### gateway-inspections

{"visited": ["v114-gateway-medical", "v114-gateway-inquiry"], "transitions": 2, "publicInputs": 677}

### processor-inspections

{"visited": ["v114-processor-entry", "v114-processor-gallery", "v114-hive-cocoons", "v114-queen-nursery"], "transitions": 6, "publicInputs": 1905}

### operation-m240

{"complete": true, "publicInputs": 5041, "elapsed": 126.02500000001153, "team": [{"id": "ripley", "hp": 100, "ammo": 18}, {"id": "hicks", "hp": 100, "ammo": 24}, {"id": "hudson", "hp": 100, "ammo": 24}, {"id": "newt", "hp": 100, "ammo": 0}]}

La nouvelle opération ouvre le détour Hadley–réfectoire, récupère la caisse M240 en maintenance avec reprise à mi-geste, recrute Newt et visite la canalisation par le nouveau sas médical. La flamme est réellement utilisée devant la défense de la sentinelle. Le bilan conserve18 cartouches M41A et57 unités de carburant pour Ripley,6 cartouches shotgun intactes pour Hicks et0 pour Newt. Les23 unités de carburant consommées ne sont pas remplacées. La reprise en infirmerie ne prétend pas être un combat au M240 : les dégâts confirmés sont dans le couloir de défense.

Les trois essais d’inspection traversent six fois les raccords Sulaco, deux fois Gateway, six fois le réseau processeur. L’armurerie teste les huit profils, hors chronologie, contre des surfaces de test et non une population ajoutée. La nurserie reste un décor inspectable, pas le nouveau boss. L’exercice de poursuite hérité termine également mais n’est pas compté comme une dixième opération.

## Navigateur : octets exacts

Le HTML final est chargé par set_content avec son chargeur Blob inchangé. Aucun hook d’édition de session. Les exports sont de véritables téléchargements, les imports des champs fichier. Les commandes de début se jouent à l’interface ; les séquences tardives utilisent les exports intacts des pilotes puis effectuent les gestes annoncés.

| Recette | Contrôles |
|---|---:|

| core | 17 |

| tail | 11 |

| contact-a | 15 |

| contact-b | 11 |

| touch | 10 |

| logistics | 39 |

| engineering | 45 |

| lighting | 39 |

| beacons | 49 |

| tactics | 55 |

| fidelity | 86 |

La recette fidélité vérifie réellement les25 inspections, l’atlas28/16/24 et ses manques, la collecte, les huit tirs viaUI et leurs réserves séparées, la reprise à mi-vol, le blocage Newt/Gateway, le choix shotgun, les imports invalides atomiques et une migrationV113 réelle. 844×390 et390×844 sont émulés, pas des téléphones physiques. Les instruments sont hors canvas ; le terrain reste petit sur les écrans courts.

## Captures et Codex

76 PNG directs de Chromium,12 embarqués byte-for-byte dans le rapport. Aucune génération d’image, retouche ou reconstruction depuis des coordonnées. Les sources de chaque image sont report/browser-fidelity-v114.json et report/browser-results-v114.json. Le Codex contient80 règles,25 fiches spatiales,28 repères,16 profils et24 équipements avec statuts. Ses25 schémas sont identifiés comme des plans calculés, pas des captures.

## Corpus de sauvegardes : une incompatibilité signalée

110 exports114 sur110 se rechargent. 84 exportsV113 sur85 passent la migration. **states-v113/03-relais.json est refusé** : son parasite-a vivant se trouve à un emplacement incompatible avec la nouvelle architecture de l’infirmerie. Aucun téléport ni déplacement arbitraire n’est fait pour lui faire passer le validateur. Le fichier est refusé avant mutation. Ce résultat n’est pas présenté comme195migrations réussies. Le joueur doit reprendre un autre point compatible ou démarrer une nouvelle session.

## Corrections pendant la recette

Les retours physiques des sas empêchaient certaines formations latérales d’approcher : le regroupement utilise maintenant une file sur la normale intérieure du seuil. Les acteurs marchent et contournent réellement les meubles. Les bancs M56 ont été abaissés visuellement pour ne plus masquer Vasquez/Drake ; la géométrie support reste fixe. Le HUD civil de Gateway ne montre plus une arme disponible.

Les attentes des recettes historiques ont été adaptées au catalogue25/20 et aux nouveaux identifiants géométriques, sans réduire PV, obstacles ou stocks. Les recettes qui reconstruisent plusieurs documents ouvrent un nouveau document pour éviter les anciens listeners. Le contrôle d’ouverture relève son état avant la capture : une capture lente ne peut plus faire passer la préparation entière avant la mesure. Aucune de ces adaptations ne modifie le programme pour forcer un résultat.

## Distribution

25 contrôles séparés :46 modules exacts, imports complets et sans cycle, CSS identique, aucune requête externe nécessaire, documents, recherche, images et portrait. Le transport file:// :

```json
{
  "validated": false,
  "reason": "Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR at file:///mnt/data/ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1/JOUER_ALIENS_V114.html\nCall log:\n  - navigating to \"file:///mnt/data/ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1/JOUER_ALIENS_V114.html\", waiting until \"domcontentloaded\"\n"
}
```

## Limites explicites

Pas de fusion native64 salles, ni push, ni Vercel.15 inspections nouvelles ne sont pas15 missions. 8 repères restent absents :Narcissus, appartementGateway, extérieurHadley, plafondOperations, conduits du repli, ascenseurs, familleJorden, Derelict. La Reine, le pilotageM577/UD-4L, les chutes et le final P-5000/sas ne sont pas joués dans cette branche. Le hangar de préparation ne remplace pas le final.

Figures et décors procéduraux stylisés, silhouettes différenciées mais nonressemblance1:1. Chronologie de repli adaptée. Pas de rebond de grenade, destruction géométrique ou combustion persistante ; les dégâts secondaires sont des valeurs d’équilibrage. La sécurité de tir automatique historique est conservée ; les explosifs manuels restent dangereux pour l’équipe.

## Reproduire

```text
npm run check
npm run drive
npm run build
npm run browser
npm run docs
python qa/distribution-smoke-v114.py
python tools/write-qa-v114.py
python tools/release-check-v114.py
```

HTML de recette : `9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d`. `tools/verify-package.py` est en lecture seule ; reconstruire les preuves peut changer leurs hashes et ne doit pas être confondu avec un contrôle d’intégrité.

## Contrôle final de distribution

388 contrôles de liaison entre sources, catalogue, HTML et reçus passent dans `report/release-check-v114.json`. Ils ne sont pas ajoutés aux 665 tests de gameplay ou aux 377 contrôles navigateur.

Six essais d’intégrité supplémentaires passent sur une copie jetable : paquet intact accepté, manifeste inchangé par son vérificateur, fichier modifié refusé, fichier non listé refusé, fichier requis absent refusé, puis nouvelle acceptation après restitution exacte. Voir `report/integrity-probe-v114.json`. Le contrôle d’intégrité est en lecture seule ; le scellement intentionnel utilise un outil séparé.
