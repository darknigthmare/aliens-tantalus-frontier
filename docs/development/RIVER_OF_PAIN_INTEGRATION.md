# Fleuve de la Douleur — intégration GitHub du 25 novembre 2026

## Contenu récupéré et intégré

Le DLC **0.9.0-candidate.1** est raccordé au menu titre de Tantalus Frontier. Le bouton **FLEUVE DE LA DOULEUR** est disponible à la souris, au clavier et à la manette. Il ouvre /dlc/fleuve-de-la-douleur/, une page à bandeau compact qui exécute le fichier original JOUER.html. Le lien **REVENIR À TANTALUS** retourne au jeu hôte. **F6** replace le focus sur ce lien ; **Échap** reste la commande de pause du DLC.

Il s’agit de la campagne autonome raccordée au lanceur du projet. Le simulateur Fleuve de la Douleur conserve son format de sauvegarde et ses règles ; il ne devient pas une mission native du GameEngine Frontier par ce seul raccordement. Le départ normal du menu peut déclencher la sauvegarde de session existante de Frontier. Le DLC n’importe pas cette sauvegarde et ne la remplace pas.

Les **222 fichiers** du dernier paquet restent identiques à la livraison d’origine : 29 fichiers de runtime, 82 tests et fixtures, 39 documents et rapports, 22 captures et exports courants, 22 fichiers historiques, 20 outils et huit livrables de premier niveau. Les cinq dernières pièces livrées séparément — jeu, rapport illustré, codex, registre de fidélité et rapport QA — ont été comparées octet pour octet au paquet : elles sont déjà incluses.

Les [neuf archives originales v0.1 à v0.9](../../archives/river-of-pain/) conservent l’historique antérieur, y compris les anciennes captures et les sources qui ne figuraient pas dans la dernière archive. Leur volume total est de 208 383 968 octets. L’inventaire et les empreintes de chaque fichier récupéré sont dans [river-of-pain-manifest.json](../../scripts/river-of-pain-manifest.json).

Le chantier local **0.10** décrit dans le suivi précédent n’a pas été retrouvé dans les fichiers sauvegardés. Il n’est ni recréé de mémoire ni compté parmi les fichiers intégrés. La récupération ne constitue pas une certification de fidélité 1:1 : les limites et les distinctions entre références documentées et interprétations restent celles du registre 0.9.

## Sources et distribution

- [Paquet complet, sources et documents courants](../../dlc/fleuve-de-la-douleur/)
- [Jeu autonome original](../../dlc/fleuve-de-la-douleur/JOUER.html)
- [Rapport illustré original](../../dlc/fleuve-de-la-douleur/RAPPORT_ILLUSTRE.html)
- [Codex des lieux](../../dlc/fleuve-de-la-douleur/docs/CODEX_LEVEL_DESIGN.md)
- [Registre de fidélité](../../dlc/fleuve-de-la-douleur/docs/REGISTRE_FIDELITE.md)
- [Licence et provenance](../../dlc/fleuve-de-la-douleur/LICENSE_NOTICE.md)

Le build déploie exactement cinq fichiers : la page d’accueil du DLC, son CSS et son module de focus, JOUER.html et la notice de licence. Aucun ZIP, test, rapport, capture ou export de partie n’entre dans dist. Les chemins source et publics sont admis individuellement ; un fichier arbitraire ajouté au dossier reste refusé. Les routes DLC inconnues ne deviennent pas la page principale de Frontier. Le serveur de développement n’expose que les cinq fichiers jouables et leur dossier d’entrée.

Le jeu autonome original fonctionne depuis son fichier téléchargé. Cette intégration n’ajoute pas le DLC au préchargement hors ligne du service worker Frontier.

Les README et rapports contenus dans le paquet et dans les archives décrivent leur date de livraison historique. La présente note décrit l’intégration actuelle.

## Contrôles reproductibles

    npm run test:dlc:river
    npm run test:dlc:river:source
    npm run check
    npm run build
    npm run check:built
    npm run qa:dlc:river -- --root dist --output /tmp/atf-river-qa

Node 22 ou ultérieur et Python 3 sont requis. La QA navigateur utilise Playwright et un Chromium réel. La variable ATF_CHROMIUM_EXECUTABLE permet de désigner le navigateur installé.

Le runner de sources crée des copies temporaires hors du dépôt. Il exécute les suites d’origine, la vérification du paquet intact et la montée réelle depuis l’archive 0.8. Les résultats historiques et leurs empreintes restent donc inchangés dans les 222 fichiers récupérés.

La qualification modèle rejouée avant l’interruption du poste local a réussi : **1 246 cas du modèle, 42 parcours, 28 tests d’installation, quatre tests de montée réelle**. Le vérificateur du paquet intact a réussi **246 contrôles**, dont la reconstruction identique du jeu et des données. Les **35 cas navigateur historiques** présents dans le paquet ne sont pas présentés comme une nouvelle exécution. Les contrôles du lanceur ajoutés utilisent le vrai contrôleur avec des doublures DOM.

Les nouvelles exécutions d’intégration sont consignées dans [RIVER_OF_PAIN_VALIDATION.json](RIVER_OF_PAIN_VALIDATION.json) et dans les artefacts de la CI dédiée **River of Pain integration**. Un résultat CI doit être associé à sa propre tête de branche ; celui d’un parent n’est pas transféré au commit suivant.

## Identité préservée

- Base Frontier examinée : 882ffdee7ed83a549bf2c1c4b9fa38de8e70edc2.
- Jeu autonome : SHA-256 91ae538879b939018cea5dc3ba2eb9e45faea7693fdd952efbe8531b33cdfced.
- Archive 0.9 originale : SHA-256 4122a3b3f86314fdb44659ad7621632b7d9f77f1855fbd28c0bb5da05c7aa48b.
- Les identifiants de contenu et de sauvegarde de Frontier et du DLC sont conservés.
