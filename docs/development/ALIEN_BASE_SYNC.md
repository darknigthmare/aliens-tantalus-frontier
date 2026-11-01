# Alien_base — liaison documentaire bidirectionnelle (V1)

**Référentiel commun** : [darknigthmare/alien_base](https://github.com/darknigthmare/alien_base) (privé). **Jeu** : `aliens-tantalus-frontier` (public). Cette intégration ne requiert pas d'autorisation GitHub côté navigateur.

## Ce qui fonctionne sur cette branche

- `src/alien-base-snapshot-v1.js` importe **46 dossiers transversaux** et **200 fiches d'armes** référencées, par IDs immuables ; il n'importe **aucune stat numérique**.
- `src/alien-base-bridge-v1.js` permet la résolution par ID commun `ab:*` ou ID jeu exact (`weapon-*`, `enemy-*`, etc.). L'absence de référence renvoie `null`, sans fusion de noms approximatifs.
- `src/content.js` réexporte la consultation documentaire pour les systèmes existants. Aucun ennemi, arme, véhicule, équipement, monde ou personnage n'est automatiquement instancié par cette fonction.
- `src/catalog-ui-v62.js` affiche désormais les références/traits partagés dans les dossiers du codex pour les IDs reconnus, avec liens HTTPS filtrés et une note explicite sur la fidélité non certifiée. Aucun réglage de combat n'est recopié.
- Les **129 entrées `proposed-*`** restent documentaires. `runtimePresent` et `researchOnly` sont deux indicateurs séparés. Une référence sur une arme en jeu ne prouve pas une vue/animation fidèle 1:1.
- Le registre existant des castes et les règles de combat ne sont pas modifiés. Les IDs de sauvegarde restent intacts.

## Sens Alien_base → Tantalus

Depuis deux clones Git disposés côte à côte :

```bash
cd aliens-tantalus-frontier
node scripts/sync-alien-base-v1.mjs --base ../alien_base
node scripts/sync-alien-base-v1.mjs --base ../alien_base --check
npm run test:alien-base
```

Le fichier généré doit être revu et commité dans une PR de Tantalus. La projection autorise `id`, famille, nom, média, liens et états, jamais `damage`, `health`, cadence ou autres statistiques propres à un jeu. Ne jamais ajouter de clé privée, image sous droits ou URL secrète à ce snapshot public.

## Sens Tantalus → Alien_base

```bash
cd aliens-tantalus-frontier
node scripts/export-alien-base-tantalus-v1.mjs --out ../alien_base/imports/tantalus/live-catalog-v1.json
```

L'export prend en compte les **catalogues vivants**, au-delà des 218 seeds du référentiel initial : armes, ennemis, véhicules, équipements, équipage, factions, lieux et roster AFE2. Les valeurs de gameplay sont exportées séparément dans `gameplayTuning`. Ce JSON n'est ni une preuve de référence franchise ni une mutation automatique du référentiel ; il nécessite un rapprochement par identifiant, audit et une PR dédiée avant admission dans le canon commun.

## Couverture encore à compléter

- Les 46 dossiers sont une première couche ; de nombreux personnages/castes/types et médias présents dans Tantalus doivent encore être individualisés par source et variante.
- Importer les identités propres aux DLC Alien 1–4, Prometheus, Covenant, Isolation, Blackout, Colonial Marines, Romulus, Alien: Earth et autres adaptations seulement après contrôle des sources.
- Couvrir accessoires, tenues modulaires, IA spécialisées, véhicules, androides, cartes et matériel Weyland-Yutani.
- Distinguer les sprites générés/placés des références exactes et des tests visuels accomplis. Une vignette d'archive ne prouve pas l'animation en mission.

## Contrôles

`npm run test:alien-base` est inclus automatiquement dans `npm run test:all` par `scripts/test-release-v143.mjs`. Les tests vérifient l'intégrité de la projection, sa reproductibilité, les identités exactes, les 129 propositions non admises, l'absence de mutation des registres et la séparation export `identity` / `gameplayTuning`.

## IDs maîtres : compatibilité réelle entre jeux

Le snapshot conserve désormais **84 entités maîtres** de `data/catalog.v1.json` et **45 liaisons exactes** depuis `links/tantalus-entity-links.v1.json`, à côté des 46 dossiers détaillés `ab:*`. Le jeu peut résoudre `enemy-008-queen`, `ab:organism:queen-aliens-1986` et `caste.queen` vers une même identité documentaire, sans changer les IDs existants ni les sauvegardes. La fonction publique `resolveAlienBaseMasterEntityV1()` renvoie la fiche du catalogue maître. Une fiche UPP reste sans correspondance certifiée. Aucune statistique d'équilibrage n'est copiée depuis la base.
