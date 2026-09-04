# Contrat de contenu v1→v70

## Règle fondamentale

Le projet est **additif** : une version ultérieure peut corriger, migrer ou enrichir un élément, jamais le supprimer silencieusement. Les identifiants sont stables, les sauvegardes anciennes sont migrées et chaque catalogue est validé au build.

## Invariants v70

`src/content.js` est la source exécutable. `validateContent()` bloque le démarrage et le build si un total change ou si des IDs sont dupliqués.

| Clé | Invariant | Surface runtime |
|---|---:|---|
| `campaigns` | 440 | Opérations MIRE, Frontier, Survival, Crucible et Special Operations |
| `worlds` | 64 | Carte galactique, états coloniaux |
| `weapons` | 146 | Armurerie, combat |
| `equipment` | 106 | Armurerie, utilitaires |
| `enemies` | 571 | Bestiaire, spawns, comportements |
| `vehicles` | 279 | Parc, sièges et actions |
| `apexDossiers` | 244 | Xénobiologie |
| `neuroXenoProfiles` | 234 | Harnais ATARAX/Ripper/Echo Override |
| `crew` | 16 | Echo-9 et persistance |
| `costumes` | 392 | Personnalisation |
| `shipModules` | 158 | USS Tantalus |
| `levelSeeds` | 800 | Génération et playtest |

## Double continuité

Les 206 paires ont exactement deux membres partageant `pairId` :

1. `MIRE` — reconstitution historique isolée qui protège le contexte de la source.
2. `FRONTIER` — descendant, clone, trace, programme corporatif ou conséquence cohérente en 2204.

Les 28 campagnes sans `pairId` regroupent les 24 campagnes signature de la continuité Tantalus, Echo-9, Apex, Crucible, Neuro-Xeno et Red Hive, plus les quatre lots jouables `special-cargo-brutal`, `special-narrative-qz17`, `special-alpha-bravo-doctrine` et `special-alien-survival-systems`. Les 206 paires MIRE/Frontier, soit 412 campagnes appariées, restent inchangées et chaque paire contient exactement deux membres.

## Special Operations V70

`src/special-operations-v67.js` recense exactement les 19 conversations auditées du projet ChatGPT « Aliens tantalus project ». Une entrée n'est ajoutée à `CAMPAIGNS` que lorsqu'elle dispose d'une route jouable réelle. V67 a ajouté **CARGO BRUTAL**, V68 **QZ-17 — La cargaison fantôme**, V69 **DOCTRINE ALPHA / BRAVO** et V70 **SYSTÈMES DE SURVIE ALIEN**. Le registre mesuré contient 4 lots jouables : 2 promesses `effective`, 8 `partial` et 9 `missing`. Cargo Brutal et Systèmes de survie Alien sont effectifs ; QZ-17 et Alpha/Bravo restent partiels à l’échelle de leur conversation complète. Le registre conserve `canonExact: false` : les assets sont des créations originales du projet et non des pixels officiels recopiés.

Le lot V70 doit conserver exactement six mécaniques exécutables : `self-destruct`, `weldable-doors`, `room-pressure`, `power-routing`, `security-cameras` et `persistent-acid`. Le HUD diégétique expose ces systèmes mais ne remplace jamais l’action physique dans les six salles du niveau.

## Couverture fonctionnelle

Une entrée de catalogue est exploitable et pas seulement décorative : armes avec dégâts/cadence/chargeur, ennemis avec PV/dégâts/vitesse/armure/comportement/habitats, véhicules avec coque/vitesse/cargo et actions pour chaque siège, mondes avec danger/infestation/stabilité/atmosphère/faction, niveaux avec kit/taille/seed/objectifs/risques/routes.

## Ce que « complet » signifie ici

Le contrat de build V70 exige l’intégralité des **contrats et quantités** annoncés jusqu'à la V70 ainsi qu’une surface consultable ou jouable pour chaque famille. Sa gate locale est validée par 888 tests sans échec, le lint des 268 modules, le build de 3 450 entrées et les parcours navigateur documentés. Les centaines de variantes systémiques partagent volontairement des familles de logique et des masters artistiques ; elles ne prétendent pas constituer 571 dessins uniques faits à la main. Une boucle mécaniquement jouable ne vaut toutefois pas validation artistique commerciale : cette dernière exige encore des assets dédiés branchés et une QA visuelle documentée.

## Contrat PWA V70

Le manifeste continue d’exposer quatre icônes PNG exécutables : 192 px et 512 px avec `purpose: any`, puis 192 px et 512 px avec `purpose: maskable`. Le service worker V70 utilise le cache `atf-v70-shell-1` et précache les modules V70 ainsi que l’atlas normalisé, jamais le master ni ses métadonnées de production. La validation PWA locale est **RÉUSSIE** ; le document `docs/V68_PWA_ICON_QA.md` conserve la provenance, les empreintes et le contrôle de safe zone des icônes.
