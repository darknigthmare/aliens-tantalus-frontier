# Contrat de contenu v1→v46

## Règle fondamentale

Le projet est **additif** : une version ultérieure peut corriger, migrer ou enrichir un élément, jamais le supprimer silencieusement. Les identifiants sont stables, les sauvegardes anciennes sont migrées et chaque catalogue est validé au build.

## Invariants v46

`src/content.js` est la source exécutable. `validateContent()` bloque le démarrage et le build si un total change ou si des IDs sont dupliqués.

| Clé | Invariant | Surface runtime |
|---|---:|---|
| `campaigns` | 436 | Opérations MIRE, Frontier, Survival, Crucible |
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

Les 24 campagnes signature n’ont pas de `pairId`. Elles portent la continuité propre Tantalus, Echo-9, Apex, Crucible, Neuro-Xeno et Red Hive.

## Couverture fonctionnelle

Une entrée de catalogue est exploitable et pas seulement décorative : armes avec dégâts/cadence/chargeur, ennemis avec PV/dégâts/vitesse/armure/comportement/habitats, véhicules avec coque/vitesse/cargo et actions pour chaque siège, mondes avec danger/infestation/stabilité/atmosphère/faction, niveaux avec kit/taille/seed/objectifs/risques/routes.

## Ce que « complet » signifie ici

Le build contient l’intégralité des **contrats et quantités** annoncés par la v46 ainsi qu’une surface consultable ou jouable pour chaque famille. Les centaines de variantes systémiques partagent volontairement des familles de logique et des masters artistiques; elles ne prétendent pas constituer 568 dessins uniques faits à la main.
