# Développement d’Aliens: Tantalus Frontier

## Point de départ

Lire [le guide gamedev du projet](docs/development/GAMEDEV_GUIDANCE.md), puis seulement la section utile au chantier. Ce guide adapte une sélection d’awesome-gamedev-agent-skills au moteur existant. Les demandes explicites du propriétaire priment sur ces conventions.

- Identifier la branche, le commit et les changements en cours avant une modification.
- Conserver le moteur navigateur JavaScript en modules ES et son rendu Canvas 2D. Les exemples d’autres moteurs servent à comprendre un concept ; les API doivent venir du code du projet.
- Partir de `src/app.js` : les missions importent `GameEngine` depuis `src/game-production-runtime.js`. Suivre la chaîne et ses mixins jusqu’au comportement concerné. Préserver leurs gardes, leur cycle de vie et leur ordre de composition.
- Un suffixe `v126`, `v143` ou `v165` identifie un module, pas nécessairement la version publique ni son obsolescence. Vérifier les imports et les métadonnées de release.

## Choisir les guides utiles

Le guide local contient des liens vers une révision précise du catalogue. Charger le minimum pertinent :

| Travail | Référence principale |
| --- | --- |
| Sprites, costumes, pièces du corps, animation | `create-game-assets` |
| Décisions et déplacements ennemis | `game-ai` |
| Salles, portes, parcours, Frontier Forge | `level-design` |
| Tir, impacts, recul, retours visuels et sonores | `game-feel` |
| Persistance, reprise, migrations | `save-systems` |
| Fluidité, mémoire, scènes chargées | `performance-optimization` |

Lire les références approfondies uniquement si la tâche en a besoin. Si une source externe est inaccessible, utiliser le cadre local et les interfaces vérifiées du projet ; signaler l’incertitude précise.

## Règles d’intégration

- Relier les ajouts aux systèmes existants de contenu, chargement, jeu, interface et persistance. Un prototype autonome reste un prototype tant que ces raccordements ne sont pas faits.
- Préserver les identifiants de contenu et les sauvegardes existantes. Distinguer campagne, reprise de mission, espace de travail Forge et checkpoints de playtest.
- Pour le personnage, vérifier mission et hub, attaches des pièces, ligne des pieds, proportions, transparence et transitions animées.
- Pour un ennemi, vérifier son admissibilité et son comportement spécialisé avant d’appliquer une logique commune. Documenter les capacités et références propres à sa caste.
- Pour un niveau, vérifier accès logique, passage physique, points d’arrivée, aller-retour et reprise. Une porte doit correspondre à l’architecture visible et à une interaction accessible.
- Référencer les sources franchise utilisées. Distinguer apparence documentée, adaptation du projet et élément à définir ; une génération d’image ne certifie pas une fidélité « 1:1 ».
- Maintenir les informations techniques dans la documentation et les outils de développement. Les écrans du joueur doivent garder une présentation cohérente avec l’univers.
- Pour les performances, comparer la même scène et la même configuration avant/après ; ne pas annoncer un gain sans mesure.

## Validation et livraison

- Utiliser les scripts réellement déclarés dans `package.json` ; Node 22 ou supérieur est requis par le projet.
- Commencer par les tests du système touché et un parcours représentatif. Élargir aux suites partagées et aux contrôles de distribution lorsque le risque ou la CI l’exige.
- `npm run test:all` regroupe les suites Node déclarées. Les QA navigateur, `check`, `build` et `check:built` restent des contrôles distincts.
- Déclarer les fixtures et les injections utilisées. Une capture de rendu ne remplace pas un parcours ; une commande disponible ne signifie pas qu’elle a réussi.
- Pour les changements purement documentaires, vérifier les chemins, les commandes et l’admission des fichiers. Ne pas ajouter une batterie de tests gameplay sans risque correspondant.
- Les documents de développement restent des fichiers source. Toute nouvelle admission doit être précise et préserver leur exclusion du build public.
- Dans la PR, expliquer le problème, le comportement obtenu, les vérifications réellement exécutées et les limites restantes. Mettre à jour le suivi existant concerné sans déclarer terminé un contenu seulement listé ou généré.

<!-- BEGIN:shared-ai-tooling -->
## Outils de développement IA

Ce dépôt peut utiliser [Spec Kit](https://github.com/github/spec-kit),
[Superpowers](https://github.com/obra/superpowers) et, avec Claude Code,
[Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios).

Lire le [guide d'intégration](.ai-tools/README.md) et les
[révisions de référence](.ai-tools/sources.json) avant leur première utilisation.

- **Spec Kit** : cadrer une fonctionnalité ou une évolution importante en
  spécification, plan et tâches ; réutiliser les documents et le suivi existants.
- **Superpowers** : choisir les pratiques pertinentes pour l'implémentation,
  le diagnostic, la revue et la vérification. Garder un seul plan de travail.
- **Claude Code Game Studios** : utiliser les agents spécialisés dans les
  sessions Claude Code pour les tâches de jeu concernées. Pour un autre type de
  projet, conserver cette possibilité sans imposer une organisation de studio.
- Adapter ces outils à la demande en cours et aux contrats du projet. Préserver
  l'architecture, les conventions, les consignes et les autorisations existantes.
- Vérifier leur disponibilité réelle avant d'annoncer une commande ou un plugin
  comme installé. Le guide fournit les étapes d'activation et un diagnostic local.

Ces consignes ajoutent des outils au projet ; leurs références externes ne
constituent pas une autorisation de modifier les permissions ou de publier.
<!-- END:shared-ai-tooling -->
