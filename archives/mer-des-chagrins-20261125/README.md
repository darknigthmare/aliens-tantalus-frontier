# Conservation de Mer des Chagrins — 25 novembre 2026

Ce dossier conserve les **59 fichiers originaux** fournis au fil du développement de Mer des Chagrins : dix archives de v0.1.0 à v0.10.0, dix jeux HTML, dix codex, dix rapports illustrés, un registre de fidélité, un rapport de vérification JSON et dix-sept captures PNG. Leur taille totale d'origine est de **593 192 706 octets**.

La dernière version récupérée est **v0.10.0**. Le travail v0.11 « Le sang du Destroyer » est mentionné dans le suivi antérieur, mais aucun fichier correspondant n'a été retrouvé. Ce dossier ne présente donc pas ce travail comme récupéré ou livré.

## Organisation

- artifacts/archives/ : les dix ZIP historiques, découpés en parties ordonnées.
- artifacts/documents/ : les HTML et le JSON d'origine.
- artifacts/captures/ : les dix-sept PNG d'origine.
- INVENTAIRE.json : noms, dates disponibles, tailles, empreintes et correspondances avec les parties.
- MANIFEST.json : inventaire exact de tous les membres du dossier sauf le manifeste lui-même, et recettes de reconstruction des 59 originaux.

Chaque partie fait au maximum **8 MiB (8 388 608 octets)**. Un fichier plus petit reste intact ; un fichier plus grand est découpé en .part001, .part002, etc. La concaténation dans l'ordre du manifeste restitue les octets exacts de l'original. Les archives ne sont pas recompressées et les documents historiques ne sont pas réécrits.

## Vérifier sans restaurer

Depuis la racine du dépôt, avec Python 3.10 ou supérieur :

    python3 scripts/restore-mer-des-chagrins-archives.py --verify-only

La commande contrôle l'arborescence exacte, les tailles et SHA-256 de chaque membre, puis les SHA-256 des 59 fichiers reconstitués en mémoire par flux. Elle refuse les parties manquantes, les membres supplémentaires, les chemins hors périmètre, les liens symboliques et les données altérées.

## Restaurer les noms et octets originaux

    python3 scripts/restore-mer-des-chagrins-archives.py --output ./mer-des-chagrins-restaure

La destination doit être extérieure à ce dossier de conservation. Les fichiers sont remis à plat sous leurs noms originaux. Un fichier déjà présent et identique est conservé. Un fichier différent provoque un refus avant le début de la restauration ; les autres fichiers de la destination sont préservés.

Chaque fichier est d'abord écrit dans un temporaire, avec vérification des parties et de l'ensemble, puis publié atomiquement sans écrasement. Le système de fichiers doit permettre les liens physiques dans la destination ; en cas d'impossibilité la commande échoue sans utiliser de renommage susceptible d'écraser un fichier.

La publication est atomique par fichier, pas pour les 59 fichiers ensemble. En cas d'interruption, les fichiers déjà restaurés et vérifiés restent utilisables ; relancer la commande les reconnaît. Les originaux conservés ici ne sont jamais modifiés par le reconstructeur.

## Vérifier le reconstructeur

    python3 scripts/verify-mer-des-chagrins-restore.py
    python3 scripts/verify-mer-des-chagrins-restore.py --real

La première commande utilise de petites fixtures pour contrôler corruption, ordre des parties, traversées de chemin, liens symboliques, fichiers supplémentaires et destinations existantes. L'option --real restaure aussi une fois chacun des 59 originaux dans un dossier temporaire, vérifie les empreintes, puis supprime uniquement ces copies de test au fur et à mesure.

## Portée des preuves

Les rapports de tests contenus dans les fichiers historiques décrivent leurs exécutions passées. Leur conservation n'est pas une nouvelle exécution et ne certifie ni une fidélité canonique 1:1, ni une intégration au moteur principal. Les commandes ci-dessus vérifient la conservation et la reconstruction des fichiers. Elles fonctionnent sans réseau et n'installent aucune dépendance.
