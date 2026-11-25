# Fleuve de la Douleur — archives originales

Ces neuf archives proviennent des livraisons locales v0.1 à v0.9. Elles sont conservées intactes, avec leurs sources, captures, rapports, outils et sauvegardes de test. Les neuf contrôles CRC ont réussi lors de la récupération du 25 novembre 2026.

Le paquet courant extrait se trouve dans [le dossier du DLC](../../dlc/fleuve-de-la-douleur/). Le [suivi d’intégration](../../docs/development/RIVER_OF_PAIN_INTEGRATION.md) explique son raccordement au menu de Frontier.

| Version | Octets | SHA-256 |
| --- | ---: | --- |
| 0.1.0 | 8 329 372 | 706eeb6b49456e4c3a4d5505380da7a17f1ddb97e1fe015a2d66371bf5f2d01c |
| 0.2.0 | 12 655 098 | 4d66d6086c8a6243f70bde753704baca422fd1abb830df0469f22142f89ef404 |
| 0.3.0 | 21 376 938 | 9260cce77c3203a4b55838e2d68cb1cdfc8eab197881f376625fe5eff1634271 |
| 0.4.0 | 23 187 032 | 79856346cade99fd4eb25abd4b03337e11bf539d649bf78486ad979332889bcf |
| 0.5.0 | 29 818 613 | 6190237bf6f089e5a952533e35ce9242728ce0e29e8f5fcfd1e078aa1e8e98d8 |
| 0.6.0 | 65 259 430 | f6aca082c4f1712d2a5abbe67eba00c49b947ad92a0aa905287f6adbc965045f |
| 0.7.0 | 15 391 325 | 3a9f88c5c8405b8dac6661a6c5e9662a4edd047aa990e193ed85eda61ebd5470 |
| 0.8.0 | 13 073 188 | f82081a28540e0bce877b0513f434f95a976d7abf5a38e7ca4a22975479cb94f |
| 0.9.0 | 19 292 972 | 4122a3b3f86314fdb44659ad7621632b7d9f77f1855fbd28c0bb5da05c7aa48b |

Total : **208 383 968 octets** dans neuf ZIP, soit **1 456 entrées de fichiers**. Les doublons entre versions sont conservés pour garder les archives originales vérifiables. Les ZIP, captures, rapports et outils ne sont pas copiés dans la distribution web.

La version 0.10 mentionnée dans le travail précédent n’a pas été retrouvée sous forme de fichiers sauvegardés. Aucun contenu 0.10 n’est présenté comme récupéré.

## Preuves du raccordement actuel

RIVER_OF_PAIN_QA_LOCAL_20261125.tar.gz conserve trois parcours Chromium réels : intégration26/26, accès sans slash15/15 et campagne isolée18/18. Ce fichier de2644892 octets porte l’empreinte SHA-256 `02afdffa40872589c1955597d788848eaf254529353cbbf592e19fa4aa866f6d`. Il contient les rapports, captures, exports natifs et leur manifeste ; ce sont des preuves locales sur l’arbre de travail, sans résultat CI ni certification de fidélité1:1.
