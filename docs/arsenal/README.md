# Arsenal encyclopédique — Aliens: Tantalus Frontier (V1, 2026-10-30)

**PR cible:** #23, `docs/gamedev-guidance-20261029` (ne pas merger seul).  
**Données:** docs/arsenal/ALIENS_TANTALUS_ARSENAL_EXHAUSTIF_SYSTEME_V1.xlsx et les deux CSV dans `data/`.  
**Statut:** référentiel de conception et d'intégration, **pas** une implémentation complète du système d'armes dans le moteur.

## Étendue vérifiée

- 200 armes, modèles et pistes d'identité répartis entre films Alien/Predator/AVP, série, jeux et DLC, comics, romans et RPG; les créations du projet et les jeux amateurs sont explicitement distincts du canon.
- 71 identités conservant les IDs du catalogue source (40 seeds + 31 admissions 147–177); 129 modèles supplémentaires ou pistes de recherches. La source historique contient **146 lignes**, soit 40 bases et 106 variantes générées, **pas** 146 armes officiellement distinctes.
- 460 lignes de références visuelles. Les liens d'art interne pointent vers des fichiers **déjà présents** dans le dépôt, avec de nombreuses planches de poses animées. Les liens externes pointent vers les œuvres, des galeries ou des recherches à vérifier. **Ce sont des liens de référence, pas 460 photos licenciées vérifiées ni des images embarquées.**
- 38 catégories de médias/sources, 158 profils proposés de conteneurs d'alimentation, 57 cas de vérification et 17 onglets.
- Revue actualisée pour la sortie officielle d'`Aliens: Fireteam Elite 2` le **25 août 2026**, plus la mise à jour du **22 octobre 2026**. Les ajouts non documentés directement restent signalés « à confirmer ».

## Onglets

`00_Dashboard`, `01_Armes_Master`, `02_Apparitions`, `03_References_Visuelles`, `04_Munitions`, `05_Chargeurs`, `06_Slots_Modulaires`, `07_Modules`, `08_XP_Progression`, `09_VFX_Shells`, `10_FSM_Rechargement`, `11_Schemas_Persistance`, `12_QA_Recettes`, `13_Roadmap_PR`, `14_Sources`, `15_Legacy_146`, `16_Evenements_Moteur`.

## Contrats à implémenter dans le moteur

### 1. Identité et progression

Conserver les `weapon-001` … `weapon-177` existants. Les identités proposées `proposed-*` doivent être examinées avant admission; ne pas leur attribuer arbitrairement des IDs qui casseront les sauvegardes. Une **instance physique** d'arme possède son propre `weaponInstanceId` distinct de `weaponDefinitionId`. Le carnet de maîtrise/XP par modèle monte de **LV 1 à 30**; XP nécessaire au niveau suivant `round(100 × LV^1.45)`, plafonds de puissance faibles, déblocages de compétences et accessoires. XP ajouté seulement après un événement de combat/objectif accepté, avec `receiptId` idempotent, contributions coop bornées, pas d'XP pour tirs à vide, décor, alliés ni double événement.

### 2. Chargeurs, chambre et alimentation secondaire

`MagazineInstance` possède un ID unique, `ammoTypeId`, `capacity`, `rounds`, `owner`, `location` et `revision`; les cartouches en chambre sont **séparées** du chargeur. `M41A` primaire/secondaire, arme combinée Ripley M41A+M240, barillet, fusil à pompe, bande de smartgun, cellule d'énergie et réservoir fonctionnent chacun avec règles dédiées. Speed reload jette un **véritable chargeur partiellement rempli**, récupérable; le rechargement tactique le conserve. Ne jamais faire apparaître de munitions lors d'interruption, reprise, changement d'arme, mort ou synchronisation coop. Contrôler le débit à `reload eject`, `insert`, `chamber` par une transaction persistante avec marqueur une seule fois.

### 3. Modularité et rigidité visuelle

Slots typés `optic`, `muzzle`, `underbarrel`, `stock`, `grip`, `magwell`, `chamber`, `belt_harness`, `cell_port`, `tank_mount`, `fire_control`, `side_rail`, `cosmetic`, `projectile_head`, `shield_arm`. Compatibilité par définition, fabricant et référence; pas d'accessoire qui dénature le modèle source sans statut « adaptation ». Toute modification doit déplacer de façon cohérente les attaches des mains, le pivot de bouche, les positions de couverture, l'animation de recharge, la pose 2D et les vêtements modulaires.

### 4. VFX, douilles et sons

N'émettre des effets qu'après `accepted shot`. `M41A` et `M56` utilisant des munitions sans étui : **pas de douille métallique à chaque tir**. Armes à pompe : éjection au cycle de pompe; revolver : douilles retenues jusqu'à l'ouverture/barillet; énergie : cellules/chaleur, pas de douilles balistiques; lance-flammes : aucune douille; grenade/rocket : effets propres au mécanisme. La physique et le pooling existent dans `weapon-effects-v124.js` (budgets consultés : 256 douilles, 12 lumières) et doivent être respectés. Impact, poussière, étincelles, sang acide, flash, lumière occultée, rebonds, sons et projection de chargeur suivent la matière et le profil d'arme.

### 5. Points d'intégration existants

- `src/content-core-v50.js` : identités sans renumérotation.
- `src/tactical-reload-v77.js` : rechargement actuellement basé sur `actor.ammo` et `ammoReserve`; adaptation requise pour les objets chargeurs.
- `src/weapon-actions-v131.js` et `src/projectile-collision-v83.js` : acceptation d'attaque / dégâts.
- `src/weapon-presentation-profiles-v124.js` et `src/weapon-effects-v124.js` : familles, douilles, lumière et budgets.
- `src/held-weapon-profiles-v125.js` et `src/player-weapon-runtime-v125.js` : poses, points d'ancrage et rigs.
- SaveSystem et coopération : migration depuis sauvegardes numériques et transactions idempotentes.

L'Excel fournit le plan en étapes P0–P3 et **57 recettes de tests**, à transformer en tests Node et parcours navigateur réels. Les 17 onglets/CSV sont de la **documentation de conception**, et leur présence ne signifie pas que les fonctionnalités XP, modules et chargeurs séparés sont intégrées au gameplay.

## Critères d'acceptation P0

1. Même action acceptée ⇒ un et un seul retrait de cartouche, VFX et ticket XP.
2. Recharger puis interrompre avant/après chaque marqueur ⇒ invariant de conservation et bon propriétaire.
3. Sauvegarder/reprendre dans toutes les phases de reload ⇒ aucune création d'objet ni duplication coop.
4. M41A, M56, fusil à pompe, revolver, canon inférieur, cellule et réservoir ⇒ chaque profil éjecte seulement ce qui existe dans l'œuvre.
5. Rig + changement costume ⇒ arme et mains ancrées sans flottement, même pendant couverture/sprint.
6. Hordes et frame rate 30/60/120 ⇒ effet plafonné et événements déterministes.

## Sources et limites

- Source du projet : `src/content-core-v50.js`, `src/weapon-*-v*.js`, et actifs existants de `assets/openai/equipment/` / `assets/openai/sprites/` tels que consultés sur la PR #23.
- [Cold Iron — Pathogen](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/)
- [Daybreak — sortie Fireteam Elite 2](https://www.daybreakgames.com/press/afe2/article/dbg-afe2-now-live)
- [Daybreak — correctifs d'octobre 2026](https://www.daybreakgames.com/press/afe2/article/afe2-102226-patchnotes)
- [Wētā Workshop — Alien: Romulus](https://www.wetaworkshop.com/projects/alien-romulus)
- Pages de sources spécifiques liées **ligne par ligne** dans le classeur. Les statistiques numériques inventées pour Tantalus ne sont pas des données canoniques. Un visuel de projet ne prouve pas la fidélité 1:1. Ne pas copier des images sous droits dans les sources publiques sans autorisation.

## Intégrité des livrables

- `ALIENS_TANTALUS_ARSENAL_EXHAUSTIF_SYSTEME_V1.xlsx` SHA-256 `3f9b5d0bee8bafd95819e7860d1a09a1357fb2bcd92facbe8ed0cc80fb6c4cbb`
- `tantalus_arsenal_master_v1.csv` SHA-256 `8f33064087e6025a450876db2068af285bd5251b180a4d8243fd5770aaeaa05a`
- `tantalus_arsenal_qa_v1.csv` SHA-256 `c500389eb71811d543312c60a10bd4199843f7a5dea673de6beb0d140e95f091`

Le classeur a été généré avec `artifact_tool` puis vérifié en lecture XLSX/ZIP, inspection du tableau de bord et de la formule XP. **Les tests de jeu `npm run test:weapons` n'ont pas été lancés** : aucune mécanique JS n'est modifiée par ce commit.


## Continuation V167 — gameplay, 30 octobre 2026

Le référentiel V1 reste **un catalogue de conception**, pas une preuve d'intégration de ses 200 fiches à l'écran. Cette passe relie une partie du système à la production JavaScript/Canvas de Tantalus et préserve les sauvegardes historiques.

| Domaine | Existant / réalisation V167 | Limite vérifiable |
| --- | --- | --- |
| Chargeurs et chambre | \`src/weapon-magazine-inventory-v167.js\` : instances identifiées, contenance et type, cartouche en chambre, stock séparé, transactions phase par phase, capture/restauration validées | **Optionnel** : pilote déclaré par \`experimentalPhysicalMagazinesV167: true\`; seule l'arme équipée dont l'ID et le feed sont admissibles est migrée |
| Reload | \`src/tactical-reload-v77.js\` : transfert synchronisé avec l'instance, retrait 35 %, insertion 75 %, chambrage 92 %, interruption sans rendre des munitions inexistantes | V77 historique conservé pour tous les autres flux ; speed-reload existe dans le module physique mais **pas de commande joueur** |
| Tir | \`src/weapon-actions-v131.js\` : réception des coups autorisés, y compris bursts V131, puis suivi du magasin ; une reprise invalide n'invente pas de munition | Les autres routes de tir et les entités au sol ne sont **pas toutes raccordées** |
| XP arme | \`src/weapon-mastery-v167.js\` : niveau 1–30, XP sur dégâts appliqués, reçu idempotent par projectile/cible, journal sauvegardable | Ne crédite pas un dégât qui ne porte pas de projectile/source stable ; progression et perks **non présentés à l'écran** |
| Combat / projectiles | \`src/weapon-actions-v130.js\` et \`src/game-production-runtime.js\` : identifiants de dégâts disc/explosion, capture et reprise de la maîtrise | Ni équilibrage final ni fidélité 1:1 attestés |
| VFX douilles | \`src/weapon-effects-v124.js\` et \`src/weapon-presentation-profiles-v124.js\` conservés | Aucun nouveau sprite shell, son ou effet de surface produit dans cette passe |
| Distribution | \`sw.js\` précache les deux modules V167 ; \`scripts/verify-public-release-v86.mjs\` n'admet le classeur et ses CSV **que parmi les sources** ; \`.vercelignore\` les exclut | Les documents sources ne doivent jamais entrer dans \`dist/\` |
| QA | 11 scénarios Node \`scripts/verify-weapon-arsenal-v167.mjs\` déclarés dans \`test:weapons\` ; essais directs des transitions physiques et du reload historique réussis | Tests navigateur, manette, multi, performances et validation artistique **à faire** |

### Invariants de conservation

- Le tir consomme exactement **une** munition sur **un** événement accepté ; une seconde livraison du même reçu ne consomme rien.
- Les magazines **montés**, **en inventaire** et **au sol** sont des états exclusifs ; les anciennes cartouches d'un chargeur tombé ne sont pas automatiquement recréditées.
- Une interruption après éjection ne provoque pas la réapparition artificielle de l'ancien chargeur dans le puits. Les phases sauvegardées sont monotones.
- \`actor.ammo\` et \`actor.ammoReserve\` restent la représentation numérique **de compatibilité** pour les anciennes armes, avec rapprochement lorsque le pilote physique est actif.
- Le grand schéma de sauvegarde préexistant (52) ne change pas ; les états optionnels portent leur propre \`schema: 167\`.
- Les statistiques, XP et temps des phases sont des choix de gameplay Tantalus, **pas** des chiffres officiels des films ou jeux.

### Prochaines intégrations prioritaires

1. Passer tous les rechargements détachables par les **vraies transactions** (joueur, co-op, équipiers, reprise de checkpoint) sans recourir à l'ancien stock numérique.
2. Ajouter la sélection et récupération de chargeurs réels dans le HUD et dans le monde ; pour les fusils à tube, revolvers, lanceurs, cellules et réservoirs, utiliser **les mécanismes corrects**, pas un chargeur générique.
3. Attacher les mods de chaque arme au rig, avec compatibilité et positions de mains/visée, puis mapper visuellement les parties de l'arme.
4. Étendre l'XP aux tirs legacy authentifiés, dégâts de statut, objectifs et perks persistants avec preuves de dégâts et anti-relecture.
5. Passer arme par arme pour la fidélité des **modèles / sprites / source canon / effets douilles** : 129 fiches V1 restent au niveau proposition ou recherche, pas approuvées comme canoniques 1:1.

### Vérification

\`\`\`bash
npm run test:weapons
npm run test:frontier
npm run check
npm run build
npm run check:built
\`\`\`

La présence de ces commandes dans le projet ne garantit pas leur réussite. Consulter les exécutions GitHub Actions exactes de la tête de PR ; ne pas revendiquer une validation de sortie avant leur conclusion. Un classeur de **suivi V167** distinct, mis à jour dans cette conversation, ajoute quatre feuilles de comparaison, tests et reste-à-faire au classeur V1 conservé dans le dépôt ; ce fichier ne remplace pas le V1 binaire de GitHub tant qu'un commit dédié au binaire n'a pas été attesté.


## Continuation V168 — récupération physique, accessoires et HUD

Cette passe continue V167 sur la PR #23. Le socle V1 de 200 fiches et 460 références
reste conservé dans GitHub. Le classeur **de suivi cumulatif V168 (27 onglets)** est un
livrable de cette conversation distinct du binaire V1 actuellement versionné.

### Implémentation dans le runtime

- \`src/weapon-magazine-world-v168.js\` : coordonnées, plan, zone, propriétaire,
  persistence des chargeurs éjectés, récupération à distance courte et ligne
  de vue vérifiée, refus en cas de monde, propriétaire ou position incompatibles.
  Le ramassage rend les cartouches déjà présentes dans le chargeur, jamais
  des munitions de remplacement.
- \`src/weapon-magazine-recovery-runtime-v168.js\` : couche de monde du
  \`GameEngine\`, silhouettes de chargeurs tombés, interaction native prioritaire,
  libellé contextuel et compteurs remis à jour, API speed-reload et maîtrise
  d'arme visible dans un petit widget HUD uniquement après gain d'XP.
- \`src/tactical-reload-v77.js\` conserve le chemin numérique et sélectionne
  la politique physique \`speed\` seulement si explicitement demandée.
  **Maj+R** sur clavier ; **R3+rechargement** sur une manette standard.
  Un monde sans chargeurs physiques actifs garde le rechargement historique.
- \`src/weapon-attachments-v168.js\` : 15 emplacements **typés**, 7
  prototypes d'accessoires explicitement étiquetés comme adaptations
  Tantalus pour certains M41A/M41A2/M56/M240, déblocage via maîtrise LV,
  reçu anti-relecture, séparation propriétaire/instance/arme et sauvegarde.
  **Aucun de ces sept prototypes ne dispose d'un sprite approuvé ni de
  modificateurs de dégâts actifs.** La pose des mains et les pivots doivent
  être approuvés avant visualisation.
- Trois nouvelles intégrations de QA sont ajoutées à \`npm run test:weapons\` :
  \`scripts/verify-weapon-arsenal-v167.mjs\` (11 tests),
  \`scripts/verify-weapon-magazine-world-v168.mjs\` (11 tests),
  \`scripts/verify-weapon-attachments-v168.mjs\` (7 tests).
  Les commandes source restent vérifiables sans importer l'Excel dans le jeu.
- \`sw.js\` précache les modules supplémentaires ; l'admission distribuable
  reste explicite et \`.vercelignore\` continue à exclure les feuilles et les
  documents de design de la version publique.

### Limites / P1 à terminer

1. **Activation pilote** : l'état physique est opt-in via
   \`experimentalPhysicalMagazinesV167: true\`, pas une migration forcée.
2. **Armes à alimentation différente** : bande M56, fusil à pompe à tube,
   barillet, flammes, cellules et lanceurs attendent des transactions propres,
   sans contredire leurs mécanismes canoniques.
3. **Persistance long terme** : confirmer la propagation des XP/modules
   au profil durable et au checkpoint, avec transactions serveur/coop
   anti-duplication et véritable gestion des chargeurs tombés dans
   plusieurs scènes.
4. **Modularité visuelle** : produire les sprites/poses validés, puis
   fixer rig, grips, canons, mains et animations pour chaque variante.
5. **Art, sons, balistique** : revoir les sprites source, douilles ou absence
   de douilles, impacts acides, lumière, sons et VFX à chaque arme.
6. **Exhaustivité de franchise** : les lignes proposées et non sourcées
   continuent de porter un statut de recherche. L'origine officielle
   ne donne pas une permission automatique de republier des images.

La CI Forge/Gameplay ne valide pas à elle seule tous les parcours navigateur,
la présentation ou les PNG. Consulter les conclusions GitHub Actions de la
tête exacte. Les vérificateurs de succession historique n'acceptent que les
empreintes **précises** des changements V167/V168, sans réécrire les XLSX
historiques ni les déclarer rétroactivement comme des tests récents.


## V170 — preuves d'armes, catalogue des absents et armureries

Cette continuation est volontairement **sans génération d'images**. Elle ne renumérote aucune arme historique ni ne duplique les entrées du marché; elle augmente les preuves disponibles et la lisibilité du reste-à-faire.

- \`src/weapon-fidelity-ledger-v170.js\`: 19 dossiers de référence **non achetables** : 12 identités ou apparitions repérées sur captures de gameplay d'*Aliens: Fireteam Elite 2* (source secondaire), 5 familles d'armes recensées dans le manuel officiel d'*Alien: Isolation*, et le M41E4 nommé dans les notes officielles d'*Aliens: Fireteam Elite*, plus le Mondo Heat 9000 attesté dans la mise à jour officielle AFE2 du 22 octobre 2026. Le même nom entre deux jeux ne prouve **pas** la même géométrie de modèle.
- Le registre comprend séparément **13 accessoires** nommés dans les notes officielles *Fireteam Elite*, sans inventer leurs compatibilités, leur apparence, leurs statistiques ni des sprites.
- \`docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv\`: **129 fiches proposées** de la base V1, réconciliées exactement par ID; 14 dossiers d'identification prioritaires P0, 27 P1, 88 P2. Ces niveaux indiquent **l'ordre du travail**, pas une valeur canonique.
- \`src/app.js\`: volet repliable *Archives d'armement* dans l'armurerie existante. L'interface affiche les noms et liens de preuve, **sans** exposer de \`data-procure-*\`, de munitions supplémentaires ou de fonction d'achat alternative. L'ancien système transactionnel de crédits/stock reste seul compétent.
- \`scripts/verify-weapon-fidelity-v170.mjs\`: test de l'identité de source, l'isolation des révisions AFE2, la présence des propositions dans le CSV historique, l'absence de statistiques inventées et la fermeture des routes d'achat.

### Art V169 : état des trois variantes

**Actualisation V172 (30 octobre 2026).** Les trois planches ont été **commitées dans la PR #23** et ne sont plus de simples chemins prévisionnels :
- Tantalus : `assets/openai/hub/armory-v169/tantalus_source_1448x1086.png`, SHA-256 `ce5d979dc84c4b8d34c0f8b5403abd6b3ec706e0cd50c819222be9cf323c1767`
- Colonie : `assets/openai/hub/armory-v169/colony_source_1448x1086.webp`, SHA-256 `7063cba4cbf2a7f63ee4934da09a7a352c4c322c75a3a8526e2ee276a8839d8a` (WebP sans perte, PNG source original `de220600940eec4471ac93e09a5a2d023f8c64f2b40c1fb6c1a8a969010f33c8`)
- Station hub : `assets/openai/hub/armory-v169/station_source_1448x1086.png`, SHA-256 `93d3d1c56463f8379ce063fa2721bddf2bba58fe435de4161c25b66d29bbb987`

Le contrôle `scripts/verify-armory-art-installer-v171.mjs` compare les octets réellement présents, le format et les dimensions. Leur présence dans le dépôt **ne vaut pas** validation canonique 1:1, rig PNJ, interaction visuelle réussie ni autorisation de réutiliser des visuels tiers. Les zones de circulation, portes et stations natives restent prioritaires.

La pose originale de l'armurière S. Doyle dans le pont industriel est conservée. Les vendeurs coloniaux et de station sont des concepts ; leurs rigs/animations 2D dédiés restent à réaliser. Les armes visibles sur les planches générées ne sont **pas** admises en tant que modèles authentifiés 1:1.

### Définition stricte de « fidélité 1:1 » pour une arme

Avant d'autoriser une arme source :
1. Modèle exact et révision/jeu/film précisés, au moins deux angles de référence comparables et droit d'utilisation des images établi.
2. Silhouette, proportions des parties mobiles et prises main/arme, rig latéral, animation idle/viser/tirer/recharger/service validés.
3. Feed réel (chargeur, bande, tube, barillet, cellule, réservoir), chambre et consommables indépendants ; test d'interruption et de duplication.
4. Douille *uniquement si éjectée par le mécanisme source*, chambre et gestes correspondants ; impacts, son, flash, fumée et surfaces adaptés.
5. Contrôle sur 3 scènes (Tantalus, colonie, station) et sur les variantes de tenue, avec rapport QA reproductible. La validation doit provenir des résultats courants, pas d'un classeur historique.

**Références textuelles V170 :** 
- https://www.gamewatcher.com/aliens-fireteam-elite-2/weapons (noms de captures de gameplay, secondaire)
- https://www.daybreakgames.com/press/afe2/article/dbg-afe2-now-live (sortie officielle, pas preuve des caractéristiques individuelles)
- https://www.aliensfireteamelite.com/en/releasenotes/ (noms de certaines armes et accessoires du jeu original)
- https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/ (armes disponibles dans le jeu *Alien: Isolation*)
- https://www.daybreakgames.com/press/afe2/article/afe2-102226-patchnotes (Mondo Heat 9000 et correctifs précis d'animations/VFX du 22 octobre 2026)


## V173 — matrice de réception 1:1 et correctifs de CI

Le suivi `ALIENS_TANTALUS_ARSENAL_SUIVI_1TO1_V173.xlsx` est exporté comme pièce jointe de conversation. Il reprend les **200 fiches** V1, les **460 références**, et ajoute : `22_V173_Audit_1to1`, `23_3_Armureries_V172`, `24_Feed_Mécaniques`, `25_QA_Mecanique_Source` et `26_Bilan_V173`. Ce binaire V173 n'a pas été commité dans GitHub (le V1, lui, l'est).

Une arme requiert huit contrôles indépendants : identité de révision, silhouette multi-angle, rig latéral, prise de mains, tir/recul, rechargement, alimentation physique et douilles/VFX. Chaque contrôle nécessite un verdict `VALIDÉ_QA` **étayé**, plus un statut `AUTORISÉ` sur les droits de réutilisation avant toute nouvelle admission dans la boutique. Le classeur ne confond pas présence d'une image de référence avec validation 1:1.

Les **129 dossiers non admis** restent dans `docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv` (14 P0, 27 P1, 88 P2). Les différences de versions (par exemple entre AFE1 et AFE2) ne sont jamais effacées. Les champs de fabricants, dimensions et mécanismes non vérifiés restent à préciser.

`src/weapon-special-feeds-v171.js` est un modèle **non encore activé globalement en production** : tube M37A2, barillet revolver, bande M56 sans étui, réservoir M240 et lanceur M83 à projectile unique. Les changements sont conservés par reçus, testés dans le module, mais ils exigent rig, timing et animations natifs avant d'être considérés comme fidèles.

Les notes officielles AFE2 du 22 octobre 2026 décrivent notamment la synchronisation du F44AA ADS, la main avant du shotgun, la prise du Revolver Rifle, l'état du sous-canon dans le HUD, le flash Cryo du Mondo Heat 9000 et l'expiration des DOT du Type 111. Ces détails sont des exigences de tests, **pas** des valeurs numériques ou sprites à recopier automatiquement :
https://www.daybreakgames.com/press/afe2/article/afe2-102226-patchnotes

L'armurière S. Doyle demeure la PNJ native du Tantalus. Les vendeurs de colonie et station nécessitent encore rigs, dialogues, stocks et animations spécifiques. Les contrôles V171/V172/V173 doivent passer sur le SHA exact de la tête de PR ; les audits historiques V163 ne sont pas réécrits.

## V174 — Boutique de ravitaillement et bilan d’intégration

Le système existant de crédits et de sauvegarde a désormais un comptoir de ravitaillement via `src/armory-resupply-v174.js` et l’interface `src/app.js` : +60 munitions principales pour 120 CR, +24 secondaires pour 90 CR, ou +2 grenades pour 220 CR. Ces tarifs sont des **valeurs originales de gameplay Tantalus**, pas des tarifs canoniques AFE/AFE2.

La recherche `ship-logistics` applique la remise existante de 15 %, arrondie à dix crédits. Les achats sont bloqués pendant une opération, si le joueur manque de crédits ou dépasse le plafond d’inventaire, et lors d’une récupération de sauvegarde. La transaction passe par `runTimedMutation`, qui revient à l’état précédent si le commit échoue. Aucun chargeur physique fictif, nouvelle arme ou bonus de dégâts n’est créé par ces achats.

Le test `scripts/verify-armory-resupply-v174.mjs` couvre 8 scénarios : coût, lot exact, remise, plafonds, refus, répétition explicitement payée, rendu HTML et transaction dans la boutique d’origine. Il est inclus dans `npm run test:weapons`. Le cache offline et la liste strictement autorisée des sources sont actualisés. L’audit V174 utilise ses propres digests au lieu d’effacer les empreintes historiques V163/V165.

**Classeur de suivi** : `ALIENS_TANTALUS_ARSENAL_COMPLET_SUIVI_V174.xlsx` a été exporté dans la conversation (non commité comme fichier binaire GitHub). Il reprend les 22 feuilles V167 et ajoute six feuilles de suivi pour les 129 modèles proposés, les trois armureries, les lots de munitions, les cinq mécanismes spécifiques, les tests et le bilan. Le classeur GitHub V1 demeure inchangé.

**Reste à finaliser pour une fidélité 1:1** : sources multi-angle et droits, variantes d’apparence spécifiques à chaque œuvre, squelette et prise en main latéraux, animations de cycle/rechargement, alimentation spéciale réellement raccordée au moteur, VFX/sons exacts, certification des vendeurs colonie/station, tests sur trois scènes et revue artistique. Le M41A 30 mm sous canon dispose d’un contrat séparé V174, mais pas encore d’une admission 1:1 complète.

**Validation** : ne conclure à la stabilité qu’après réussite des suites Forge, Gameplay, Excel et Full Release sur un seul et même SHA de tête de PR. Un test Node réussi ne constitue pas une vérification de fidélité visuelle canonique.


## V193 — admission des chargeurs détachables

Cette passe est dans [la PR #26](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/26), isolée des corrections parallèles #24 et #25. Aucune nouvelle arme n'est rendue achetable ni certifiée fidèle 1:1 par cette correction.

**Défaut historique :** le profil de présentation du M56 pouvait se décrire comme un tambour, et le pilote de magazines V167 acceptait aussi les bandes, cellules et réservoirs. La présentation ne décrit pourtant pas automatiquement un magasin d'arme détachable. Le garde source weapon-feed-admission-v193.js restreint désormais l'initialisation physique aux vrais profils box ou drum compatibles, sous activation expérimentale explicite.

| Arme | Mécanisme source / prévu | V167 physique | Reste à valider |
| --- | --- | --- | --- |
| M41A Pulse Rifle | Chargeur de fusil sans étui, lanceur 30 mm indépendant | Pilote opt-in admis | Main/arme, chambre, mode secondaire, poses et fidélité des props de film |
| M56 Smartgun | Bande/harnais sans étui | Refusé | Cycle de bande, rig et FX sans douilles métalliques |
| M240 Incinerator | Réservoir et ligne carburant | Refusé | Débit carburant, allumage et animations |
| M37A2 Pump Shotgun | Tube, pompe, cartouches individuelles | Refusé | Insertion, pompe et douille éjectée au bon temps |
| Revolver .357 | Barillet / extraction manuelle | Refusé | Chambres, étuis conservés, extraction au rechargement |
| M83 SADAR | Lanceur unitaire | Refusé | Projectile/tube, pas de magazine fictif |
| Armes à cellules/gel | Selon modèle, médias séparés | Refusé par défaut | Preuve de modèle exacte avant admission |

Le contrat pur de flux spécialisés V171 demeure **hors combat natif**. Le stock numérique V77 persiste pour ces mécanismes jusqu'à une intégration complète. Les sauvegardes historiques restent intactes ; l'arme équipée, sa taille de magasin et sa réserve sont contrôlées avant chaque initialisation de pilote.

Le vérificateur verify-weapon-feed-admission-v193.mjs couvre les refus M56/M240/M37A2/M83/revolver, la compatibilité réelle M41A et les paramètres forgés. Les modules importés sont inscrits explicitement au cache hors ligne. Les nouveaux SHA-256 V193 forment une chaîne de successeurs sans changer les tables d'audit V163–V176.

**Non certifiés :** apparences des armes, joints du rig, animation native de toutes les alimentations, sons, douilles/VFX exacts, achats de magasins individualisés et coop/synchronisation persistante. Un test Node vert n'est jamais une homologation artistique 1:1. Valider les quatre workflows sur le dernier SHA de PR avant fusion.


## V196 — classeur cumulatif des manquants inter-domaines (31 octobre 2026)

**Livrable réel, conservé hors GitHub pour ne pas changer les digests des XLSX historiques ni l'allowlist du build :**
[ALIENS_TANTALUS_EXCEL_MANQUANTS_CUMULATIF_V196_20261031.xlsx](https://docs.google.com/spreadsheets/d/10vecimyx19Lgrs1gWpQbZQpZw1jEA6QG/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true).
Emplacement Google Drive vérifié : `03_SUIVI_ET_SOURCES`.
Fichier `.xlsx` non converti, **370 286 octets**, SHA-256 exact
`6ab69d421d0e03399dc3028f49430a6b2b550797053325cf35e9e2ef49aa213d`.
Les feuilles anciennes restent dans leurs fichiers d'origine ; le classeur V196 est **un suivi documentaire**, pas une nouvelle admission de runtime.

| Famille contrôlée | Identités ou cas recensés | État réel / distinction |
| --- | ---: | --- |
| Arsenal exhaustif | 200 | 71 IDs natifs de catalogue ; 129 `proposed-*` strictement non admis |
| Propositions P0 / P1 / P2 | 14 / 27 / 88 | Recherche documentaire ; aucune homologation 1:1 |
| Costumes du catalogue V119 | 31 | 13 adaptations cosmétiques équipables mais non exactes, 4 lots PNG externes non liés au rig, 14 sans lot natif dédié |
| Tantalus — compartiments | 35 | 16 pièces principales + 19 annexes ; 31 assemblages de service et 4 exemptions délibérées |
| Armureries | 3 | Tantalus : Sanaa Doyle native ; colonie et station : vendeurs concepts, rigs incomplets |
| Médias / DLC à recouper | 36 | Périmètres de contrôle, non 36 DLC intégrés ou validés |
| Héros / variantes, inventaire V194 | 403 | Fiches conservées, non 403 identités finales certifiées |
| Vilains, source V194 | 33 | Fiches de manquants non fermées artificiellement |
| Sprites PNG, source V194 | 67 | Revue de présence/transparence, non animation 1:1 certifiée |
| Pièces de tenue, source V190 | 114 | 112 pivots encore explicitement manquants ; la découpe alpha n'atteste ni animation ni droit |
| QA de mouvement, source V190 | 288 | Cas à réaliser sur rig et scène réelle, non réussites |
| THE PIT, source V63 | 205 combattants / 174 stages | Identités et dossiers en suivi, non totalité des mouvements animés |
| THE PIT, événements natifs à documenter | 136 stages | Pas de registre spécifique V60–V63 trouvé ; cela **n'exclut pas** des effets hérités |
| Plan d'actions V196 | 1 617 lignes | 808 actions initiales + 809 rapprochements V190/PIT ; les domaines se recoupent, donc pas 1 617 assets distincts |
| Recettes documentées | 378 | 90 recettes V196 + 288 scénarios de mouvement V190 ; **non exécutées** au titre de la présente publication |

### Provenance et règles d'admission

- Armes : `docs/arsenal/data/tantalus_arsenal_master_v1.csv` (200 identifiants dont 129 propositions) et `tantalus_weapon_evidence_backlog_v170.csv` (129 dossiers, priorités 14/27/88) ; **aucune renumérotation** des ID source.
- Costumes : `src/franchise-costumes-v119.js`, `src/player-costume-outfits-v165.js`, `docs/development/SPRITE_PACK_V170.md`, et le classeur Google Drive V190 `ALIENS_TANTALUS_FIDELITE_COSTUMES_RIG_V190.xlsx`. Les PNG V175/V176 externes ne sont pas importés par le seul fait d'être décrits dans Excel.
- Plans et portes : `src/hub-game.js`, `src/hub-annex-registry-v137.js`, `src/hub-ship-layout-v137.js`, `src/hub-room-service-details-v165.js`. La présence d'une fiche de salle ne prouve ni porte franchissable ni parcours sauvegardé.
- Personnages et THE PIT : les six feuilles source du suivi V194 et le fichier Google Drive `THE_PIT_V63_SUIVI.xlsx` ; les états des tests et les preuves historiques ne sont **pas** transférés à la tête de cette PR.
- Xeno Trials : le classeur historique `docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V163.xlsx` reste inchangé, avec ses vérificateurs et preuves de branche propres ; cette consolidation n'en remplace pas les cellules originales.

La colonne `VALIDÉ_QA` et le droit d'utilisation `AUTORISÉ` doivent chacun disposer de **preuves réelles** avant qu'une nouvelle arme, texture, tenue, animation, pièce ou DLC soit marqué fidèle 1:1. Une ligne de classeur, une URL de référence, un sprite concept ou un test Node seul ne suffisent pas.

**PR de rattachement :** #26 ; les PR #24 et #25 continuent à porter des modifications d'audit en parallèle. La version V196 n'écrase ni les SHA historiques ni les fichiers sources des autres PR. Les CI doivent être revues sur chaque dernier SHA, puis les conflits de succession résolus avant toute fusion. Le binaire V196 est sur Drive et a été remis dans la conversation, **pas encore dans le Git tree**.


## V197 — Tous les Excel ouverts : registre de continuation (31 octobre 2026)

**Livrable vérifié et publié sur Drive dans `03_SUIVI_ET_SOURCES` :**
[ALIENS_TANTALUS_TOUT_LES_EXCEL_OUVERTS_V197_20261031.xlsx](https://docs.google.com/spreadsheets/d/1NwfgNhlx6CM1H9jqT_M4FsDTH-J8caYi/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true)

- Binaire `.xlsx` **830 494 octets**, SHA-256 `a13884b21107b53a277254564a6f704229d0a1d419934b63713466a141b5dd08`; 36 feuilles ; archive ZIP et réimport XLSX vérifiés.
- Les **27 onglets V196 sont préservés** et 9 nouveaux onglets V197 ajoutés (accueil calculé, ensemble des ouverts, priorités P0, matrice 1:1, 378 recettes, 288 entrées Xeno, CI des trois PR, ventilation par domaine et provenance).
- **1 905 identifiants distincts** dans la consolidation : 1 617 tâches V196, puis 189 IDs roster Xeno, 68 tâches de présentation/art historiques (40+28), 17 priorités V163 et 14 chantiers V163/V165. Les 288 lignes Xeno sont de nouveaux *rapprochements*, pas 288 créations graphiques ni 288 travaux tous non effectués.
- Priorisation dynamique : **204 P0**, **953 P1**, **748 P2** ; 1 490 objets/pièces à vérifier selon 9 contrôles distincts et autorisation des droits ; **0 verdict 1:1 admis automatiquement**.
- Les **378 recettes** sont les 90 contrôles V196 et les 288 essais de mouvement V190. Le classeur n'exécute aucun de ces 378 scénarios : l'état `NON TESTÉ` ou `À REJOUER` reste explicite.
- Les 170 rigs Xeno V165 sont des **rigs de présentation à mouvement limité**, avec 1 020 petites poses, et non 170 identités dénuées de sprites ou 1 020 animations complètes ; l'identité source 189 reste distincte de la validation artistique.
- Les 31 costumes, 114 pièces, 403 héros, 33 manquants vilains, 67 sprites, 200 armes, 205 combattants et 174 stages PIT demeurent séparés par source, révision, droits et statut d'intégration native. **Aucun contenu n'est promu simplement par sa présence dans une feuille**.

### Contrôle du blocage CI et réconciliation des PR

Au moment de cette consolidation, deux défauts ont été corrigés *dans leurs branches respectives*, sans fusion dans `main` :
- [PR #24](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/24) — `bf99d1a583e9342308d25237c160619f1b047587` : le registre V191 PNJ doit être admis dans la boucle exhaustive V163, et non uniquement après sa vérification historique.
- [PR #25](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/25) — `9a6239a4f52fccaa593ab38fd649feea4434fcc7` : import explicite de `ARSENAL_V167_NEW_SOURCES`, puis nouvelle empreinte SHA V197 pour le vérificateur V194/V195, **sans modifier les empreintes V195 historiques**.
- La [PR #26](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/26) possède ses propres modifications du moteur V193 et peut encore présenter un échec de parcours `ship-v165` à revoir sur son propre SHA. Les succès de Forge ou Gameplay ne valent pas réussite d'Excel/Full Release, et la compatibilité de chaque PR avec `main` ne prouve pas la compatibilité des trois successions entre elles.

**Règle d'admission finale :** aucun `VALIDÉ_QA` ni `AUTORISÉ` sans références item-spécifiques, source multi-angle, identité exacte par média, sprites séparés, rig/IK, animation et mécanique native, sauvegarde, parcours de portes/IA, et exécution des tests sur un SHA commun. Les droits de reproduction restent indépendants de la qualité visuelle. La PR reste brouillon tant que les quatre workflows ne sont pas vérifiés sur la tête exacte.

Le nouveau fichier XLSX V197 est conservé sur Drive et remis dans la conversation ; **il n'est pas dans l'arbre GitHub**, pour ne pas modifier implicitement les listes blanches de distribution ni les empreintes des anciens classeurs.


## V198 — continuation des 1 905 fiches ouvertes et QA physique (31 octobre 2026)

**Classeur Excel produit, vérifié et sauvegardé sur le dossier Drive `03_SUIVI_ET_SOURCES` :**
[ALIENS_TANTALUS_EXCEL_OUVERTS_CUMULATIF_V198_20261031.xlsx](https://docs.google.com/spreadsheets/d/1V5W-97ADGhych-8wYewWWvhUGHqbA3YB/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true).
Format source **XLSX**, 44 onglets, 1 069 182 octets, SHA-256
`be069649d81398b961d546d54c6dcc2d97ccb832d6e5d000ee36a1870d388b94`.
Le V197 (36 onglets) reste intact sur Drive. Le binaire V198 **n'est pas dans le Git tree** :
on évite de modifier sans revue l'allowlist stricte des classeurs et la provenance des livraisons historiques.

**Contenu cumulatif documenté, pas automatiquement implémenté :**

| Indicateur | Total | Interprétation exacte |
| --- | ---: | --- |
| Fiches/actions uniques | 1 905 | Obligations de développement de domaines pouvant se recouper ; pas 1 905 nouvelles ressources |
| Priorité P0 | 204 | Tâches identifiées pour la prochaine passe, sans promesse de fermeture globale |
| Grilles fidélité 1:1 héritées | 1 490 | Zéro homologation automatique tant que source/rig/art/QA/droits ne sont pas fournis |
| Recettes historiques et nouvelles | 455 | 378 existantes et 77 supplémentaires ; la création de la recette ne vaut pas son exécution |
| Incidents CI natifs documentés | 9 | Leila/Idris, Jun/Asha, captures Trials, portraits, services, portes et mouvements |
| Ressources historiques conservées | 200 armes, 31 tenues, 35 pièces, 189 Xeno | Statuts de catalogue inchangés, aucune arme proposée promue en catalogue ni 1:1 |

### Régression physique V198/V201 suivie séparément en PR #25

Le contrôle *Full release* sur #25 (`41201221791`, ancienne tête `03233bd`)
a observé **Jun** retour `crew-quarters`, `x=505`, `y=532`, pendant
qu'**Asha** occupait le même couloir à `x=561`, `y=532`.
Le premier V198 empêchait correctement un passager distant de monopoliser les
portes de Leila/Asha mais a découvert une véritable collision de deux corps.
La suite V201 réserve l'approche du couloir aux vrais trajets partagés sur le
même pont et au même niveau, sans fabriquer de transit ni désactiver les collisions.
Son test reproduit `x505/x561` et refuse les fausses réservations distantes.
Les SHA historiques V185/V188/V198 restent gelés ; les nouveaux successeurs
V201/V202 doivent réussir **Forge, Gameplay, Excel et Full Release sur le même
commit** avant approbation. Ne pas fusionner les PR #24/#25/#26 sans réconcilier
les vérificateurs et les preuves natives.

Les neuf défauts consignés restent **ouverts jusqu'à leurs preuves natives**.
Ni la publication de l'Excel ni l'existence des contrôles ne certifient
une fidélité de modèle, costume, DLC, arme, planète, animation ou PNJ 1:1.
