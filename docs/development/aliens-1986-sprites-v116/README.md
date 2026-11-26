# Aliens (1986) — sprites et intégration V116

Cette livraison raccorde le DLC Aliens (1986) au menu de Tantalus Frontier et ajoute une couche de rendu PNG au module V114 conservé. Le schéma de sauvegarde du DLC reste 114.

## Contenu du registre

| Origine | PNG individuels |
| --- | ---: |
| Lot V115 préservé | 70 |
| Images déjà présentes dans le dépôt | 11 |
| Nouvelles images V116 | 42 |
| Total du registre | 123 |

Chaque entrée du [manifeste](manifest.json) indique son fichier, ses dimensions, sa taille, son SHA-256 et son état de contrôle. [Ouvrir la galerie](index.html). Le [journal de génération](generation-ledger.json) conserve les demandes de création et les références publiques disponibles. Le lot V115 historique est conservé dans le commit `30353c828cca199a7c1f2b07fa05b438326db86e`.

## Comportement livré

- Le menu conserve Le Fleuve de la douleur et propose séparément Aliens (1986).
- La construction dérive le jeu V116 depuis les octets V114 vérifiés ; le corpus de 1 159 fichiers reste inchangé.
- Le moteur choisit uniquement les poses effectivement présentes. Le rendu original sert de secours lors du chargement et pour les poses absentes.
- Les nouvelles silhouettes sont mesurées sur leur canal alpha au décodage, puis ancrées au sol. Les armes séparées sont dessinées une fois.
- Les dimensions physiques des portes, collisions et ouvertures restent celles de V114.
- Les images de Reine et certains véhicules restent disponibles dans le catalogue ; leur présence ne crée ni combat de boss ni scène supplémentaire.

## Vérification

Le workflow **Aliens 1986 DLC** de la pull request exécute les tests du module, les contrôles de présentation et de succession des fichiers de main, la validation de distribution, la construction et un parcours Chromium. Les résultats de cette CI constituent la preuve du commit testé. La génération d'une image ou la présence d'un fichier ne remplace pas une validation en jeu.

```sh
npm ci
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
npm run check
npm run build
npm run check:built
npm run dev
```

Le serveur de développement sert la version dérivée de `dlc/aliens-1986/game.html` sans modifier le fichier V114 suivi. Les commandes de construction écrivent dans `dist`.

## Limites encore ouvertes

La fidélité exacte au film n'est pas certifiée. Les détails du montage M41A/M240 de Ripley nécessitent notamment une comparaison supplémentaire. Chaque fichier contient une pose ; les états marche, interaction ou attaque ne sont pas des cycles d'animation complets. Quatre variantes restent absentes après des refus du générateur : Hicks blessé, Warrior en marche, Facehugger en attaque et Facehugger en défaite.

L'arrêt de l'environnement local a empêché l'envoi de 20 anciens PNG et de 53 documents repérés avant la panne. Ces éléments ne sont pas comptés comme publiés. Ils comprennent sept variantes utiles, une planche d'orientations de sentinelle et douze révisions antérieures. Dix-neuf anciens fichiers sources de poses étaient déjà absents lors de l'inventaire. Le manifeste énumère les poses encore manquantes et les sept variantes concernées.

Les nouvelles générations remplacent certains besoins de pose ; elles ne sont pas présentées comme la récupération des octets des anciens fichiers.
