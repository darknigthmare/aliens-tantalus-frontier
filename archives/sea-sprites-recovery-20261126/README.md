# La Mer des Chagrins — sprites récupérés, code encore partiel

Ce répertoire préserve **115 des 126 fichiers du snapshot d'origine**, soit **215 587 160 octets uniques** : **les 110 PNG originaux et cinq fichiers de texte ou de configuration**. Il reste **11 fichiers de code/configuration à retrouver**, représentant **225 325 octets**.

Les 110 PNG sont regroupés sous `sprites-complete/`. Leur conservation exacte ne constitue pas leur activation dans le jeu ni une certification de fidélité visuelle 1:1.

## Reprises du 26 novembre 2026

1. Premier checkpoint : 33 fichiers, dont 28 PNG, préservés avant l'indisponibilité de l'environnement.
2. Commit `c4fbee8ce412e5456ef14167be1aa2428ea2c10e` : cinq PNG supplémentaires retrouvés avec les mêmes tailles et SHA dans la PR #58 ; total intermédiaire de 38 fichiers.
3. Commit concurrent `7efa1b55eb12c3c4b7401940048ffa2e30caf04a` : les **110 objets PNG originaux** sont rattachés à `sprites-complete/`, y compris les 77 encore absents du checkpoint précédent. La présente notice et le ledger sont réconciliés avec cette récupération.

Les 33 PNG déjà rangés dans `source/` restent disponibles à leur ancien chemin ; ces alias ne sont pas comptés deux fois dans les 115 fichiers ni dans les octets uniques.

## Origine et preuves

- Commit source relevé : `f62b3c008df41be6004cff5ea9400daa05f7aa9f`.
- Parent du snapshot : `232cbd2ecb0e370f911b008b2226dafee81bffde`.
- Arbre attendu du snapshot intégral : `dc83ab7c82ff9b626ae5f8e5f2b0940b67be6b1c`.
- [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58) : chantier d'intégration associé.
- `RECOVERY_LEDGER.json` : les 126 chemins originaux, modes Git, tailles, empreintes et états de préservation.
- `COMPLETE_SPRITES.json` : inventaire du corpus de 110 PNG publié par la récupération concurrente.

Une lecture indépendante de l'arbre distant du commit `7efa1b55eb12c3c4b7401940048ffa2e30caf04a` confirme **110/110 PNG conformes** au ledger historique en chemin, SHA Git et taille. Les cinq fichiers non PNG préservés sont également conformes. Les recherches individuelles des onze autres blobs de code ont toutes renvoyé `NOT_FOUND`.

## Code restant à récupérer

Les onze entrées non retrouvées sont les trois modules `art-pack.js`, `gallery.js`, `png-renderer.js`, ainsi que les versions du `package.json`, du filtre de build et des six fichiers d'admission ou de vérification listés exactement dans le ledger. Leurs tailles et empreintes attendues sont conservées.

Le commit source et les anciens dossiers locaux ne sont pas lisibles dans l'environnement repris. L'inventaire de 630 PNG du projet n'avait pas fourni de candidat de taille exacte ; la récupération ultérieure des objets Git montre que cette recherche négative ne prouvait pas une perte définitive.

## Portée et suite

Les fichiers rangés ici sont des **sources archivées**. Aucun fichier actif du menu, du moteur, du renderer ou de la distribution n'est remplacé. Les travaux concurrents sont conservés.

L'admission du répertoire, le raccord des images au renderer et les essais en jeu doivent être traités avant fusion. Aucun essai gameplay, décodage intégral des 110 images, cycle complet d'animation ou contrôle visuel 1:1 n'est revendiqué par ce reçu. Ces vérifications restent distinctes de la conformité des octets.

Aucun fichier local ni persistant n'a été supprimé pendant cette récupération. **Ne supprimer aucun des onze fichiers de code manquants sur la base de ce reçu partiel.**
