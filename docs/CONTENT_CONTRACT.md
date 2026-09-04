# Contrat de contenu v1→v68

## Règle fondamentale

Le projet est **additif** : une version ultérieure peut corriger, migrer ou enrichir un élément, jamais le supprimer silencieusement. Les identifiants sont stables, les sauvegardes anciennes sont migrées et chaque catalogue est validé au build.

## Invariants v68

`src/content.js` est la source exécutable. `validateContent()` bloque le démarrage et le build si un total change ou si des IDs sont dupliqués.

| Clé | Invariant | Surface runtime |
|---|---:|---|
| `campaigns` | 438 | Opérations MIRE, Frontier, Survival, Crucible et Special Operations |
| `worlds` | 64 | Carte galactique, états coloniaux |
| `weapons` | 146 | Armurerie, combat |
| `equipment` | 106 | Armurerie, utilitaires |
| `enemies` | 568 | Bestiaire, spawns, comportements |
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

Les 26 campagnes sans `pairId` regroupent les 24 campagnes signature de la continuité Tantalus, Echo-9, Apex, Crucible, Neuro-Xeno et Red Hive, plus les lots jouables `special-cargo-brutal` et `special-narrative-qz17`. Les 206 paires MIRE/Frontier restent inchangées.

## Special Operations V68

`src/special-operations-v67.js` recense exactement les 19 conversations auditées du projet ChatGPT « Aliens tantalus project ». Une entrée n'est ajoutée à `CAMPAIGNS` que lorsqu'elle dispose d'une route jouable réelle. V67 a ajouté **CARGO BRUTAL** ; V68 ajoute le premier lot jouable **QZ-17 — La cargaison fantôme** tout en conservant honnêtement le statut global `partial` tant que les autres chaînes et vrais médias ne sont pas produits. Le registre conserve `canonExact: false` : les assets sont des créations originales du projet et non des pixels officiels recopiés.

## Couverture fonctionnelle

Une entrée de catalogue est exploitable et pas seulement décorative : armes avec dégâts/cadence/chargeur, ennemis avec PV/dégâts/vitesse/armure/comportement/habitats, véhicules avec coque/vitesse/cargo et actions pour chaque siège, mondes avec danger/infestation/stabilité/atmosphère/faction, niveaux avec kit/taille/seed/objectifs/risques/routes.

## Ce que « complet » signifie ici

Le build contient l’intégralité des **contrats et quantités** annoncés jusqu'à la V68 ainsi qu’une surface consultable ou jouable pour chaque famille. Les centaines de variantes systémiques partagent volontairement des familles de logique et des masters artistiques; elles ne prétendent pas constituer 568 dessins uniques faits à la main. Une boucle mécaniquement jouable ne vaut toutefois pas validation artistique commerciale : cette dernière exige encore des assets dédiés branchés et une QA visuelle documentée.

## Contrat PWA V68

Le manifeste expose quatre icônes PNG exécutables : 192 px et 512 px avec `purpose: any`, puis 192 px et 512 px avec `purpose: maskable`. Les quatre chemins sont précachés par le service worker `atf-v68-shell-2`, existent dans le dépôt et correspondent à leurs dimensions encodées. Le master OpenAI 1254 px reste une source de production : il n’est ni déclaré dans le manifeste ni précaché. Le document `docs/V68_PWA_ICON_QA.md` fixe provenance, empreintes et contrôle de safe zone.
