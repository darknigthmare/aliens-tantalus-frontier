# La Mer des Chagrins — intégration GitHub du 25 novembre 2026

## Périmètre

Cet import reprend les 59 livrables du DLC fournis dans cette conversation : 10 archives de v0.1.0 à v0.10.0, 10 jeux HTML, 10 codex, 10 rapports illustrés, le registre de fidélité, le rapport de vérification et 17 captures. Les originaux représentent exactement **593 192 706 octets**. Ce reçu concerne ce lot ; il ne certifie pas la récupération d'autres campagnes ou d'autres conversations.

La dernière version retrouvée est **0.10.0**. Le travail 0.11 mentionné dans l'historique n'a pas été retrouvé sous forme de fichier sauvegardé. Il n'est pas reconstruit à partir d'un résumé ni présenté comme livré.

Base du dépôt : `001a20bdc0f9f1a3c835e84d8f3c9434bc159330`, branche cumulative `claude/nifty-shannon-qpy1hl`. Branche d'import : `codex/mer-des-chagrins-github-20261125`.

## Accès au jeu

Le menu titre propose **EXPÉDITIONS · DLC**. Le catalogue `/dlc/` ouvre **La Mer des Chagrins** à `/dlc/sea-of-sorrows/` et permet de télécharger le HTML autonome.

Pour jouer depuis le dépôt :

```sh
npm run dev
```

Ouvrir ensuite `http://127.0.0.1:4173/dlc/`. Le fichier `dlc/sea-of-sorrows/MER_DES_CHAGRINS_JOUABLE.html` contient lui-même les neuf modules, styles et données ; il peut être ouvert dans un navigateur sans serveur.

Le DLC conserve son moteur et son espace de sauvegarde. L'entrée du menu et la distribution sont raccordées au jeu hôte ; la campagne n'est pas convertie au GameEngine principal, et la progression du DLC ne s'écrit pas dans le profil de Tantalus. Exporter et importer la sauvegarde du DLC pour passer entre son entrée en ligne et le fichier téléchargé.

## Sources conservées

`dlc/sea-of-sorrows/` contient les **3 029 fichiers** décompressés de l'archive v0.10.0, sans modification de leurs octets. Le nouveau `IMPORT_MANIFEST.json` enregistre chacun de leurs chemins, tailles et SHA-256.

Archive d'origine :

```text
ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip
115170444 octets
SHA-256 7a2761f657d20c8c515f460df27b5701ca151aa1cd4ff1a81a7ef5b5dec6a56e
```

Les README, rapports, captures, résultats et mentions « aucun push » contenus dans l'import sont des documents historiques de la livraison originale. Ce document décrit le nouveau raccordement ; les preuves antérieures restent intactes.

## Archives et autres livrables

Le dossier `archives/mer-des-chagrins-20261125/` conserve les 59 fichiers séparés, y compris les variantes historiques absentes comme fichiers entiers du package actuel. Les fichiers volumineux sont divisés en parties ordonnées de 8 MiB au maximum. Leur concaténation restitue exactement l'original ; ce découpage ne modifie pas le ZIP ni son contenu.

Le manifeste public recense les tailles et empreintes des parties et des originaux. Il ne contient ni identifiants internes de stockage ni lien temporaire de téléchargement.

Vérifier les originaux sans les réécrire :

```sh
python3 scripts/restore-mer-des-chagrins-archives.py --verify-only
```

Restaurer les 59 fichiers dans un dossier :

```sh
python3 scripts/restore-mer-des-chagrins-archives.py --output /chemin/mer-des-chagrins
```

Le reconstructeur contrôle les chemins et les empreintes avant publication de chaque fichier. Une destination différente déjà existante est refusée ; une copie existante identique peut être réutilisée.

## Distribution

Seuls le catalogue et les 12 fichiers nécessaires au jeu sont admis dans la distribution : entrée modulaire, feuille de style, neuf modules et HTML autonome. Archives, fixtures, outils, sources documentaires et rapports historiques restent dans le dépôt.

Les deux manifestes sont épinglés dans `scripts/mer-des-chagrins-admission-20261125.mjs`. La vérification refuse les ajouts inconnus, changements d'empreinte, collisions de chemins et liens symboliques. Les règles existantes des autres campagnes et du lot Predator du 16 novembre restent applicables.

## Vérification

```sh
npm run test:dlc:sea-of-sorrows
npm run test:mer-des-chagrins-import
python3 scripts/verify-mer-des-chagrins-restore.py
```

Les résultats exécutés lors de cet import sont consignés dans [le reçu de vérification](MER_DES_CHAGRINS_VERIFICATION_20261125.json). Le check original passe ses **461 tests**. S'ajoutent **15 tests d'admission**, **21 fixtures de restauration**, la reconstruction physique des **59 originaux**, **10 tests du titre**, **17 tests des outils cachés** et **21 contrôles de parcours dans Chromium**. Les succès ne sont pas additionnés aux deux tests du wrapper CI, qui réexécutent le check original et les fixtures Python.

Les commandes globales **`npm run check`**, **`npm run build`** et **`npm run check:built`** passent sur l'arbre préparé. Le build vérifié contient **2 526 fichiers**, dont les treize fichiers du catalogue et du DLC. Sa référence de départ reste le commit de base indiqué plus haut ; la CI construira ensuite la révision de la PR.

L'alias `test:dlc:sea-of-sorrows` utilise un wrapper Node admis par le collecteur existant : les tests du DLC et de restauration sont ainsi inclus dans `npm run test:all` sans changer le workflow. Le workflow complet et la suite globale ne sont pas déclarés réussis avant leur propre exécution sur GitHub.

Le smoke navigateur emploie les commandes ordinaires du jeu, sans injection d'état. Il vérifie le trajet depuis le menu, les trois formats 1440 × 900, 390 × 844 et 768 × 480, le téléchargement exact, le déplacement, la sauvegarde et la reprise. La comparaison du stockage porte seulement sur le `localStorage` d'un profil neuf ; elle ne couvre pas IndexedDB ni un profil humain existant.

## Fidélité et limites

L'intégration conserve le prototype existant. Elle ne certifie pas une fidélité 1:1, ne remplace pas les graphismes provisoires et n'ajoute pas les développements 0.11 non retrouvés. Le registre du DLC continue de distinguer éléments documentés, interprétations et contenu narratif. La confrontation au texte intégral, le playtest humain complet et la validation sur manette physique restent ouverts.

La publication dans la branche d'import et sa PR ne vaut pas fusion de la PR cumulative dans `main`, ni publication en production.
