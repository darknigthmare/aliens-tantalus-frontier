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
