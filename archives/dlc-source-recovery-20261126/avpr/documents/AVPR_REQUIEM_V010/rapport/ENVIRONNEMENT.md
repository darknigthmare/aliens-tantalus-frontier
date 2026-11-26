## Validation réellement exécutée

603 tests Node passent, dont 97 nouveaux. Les 506 tests hérités sont conservés avec des attentes de métadonnées explicitement mises à jour. `docs/FIDELITY_CHANGES.json` énumère 225 changements de données autorisés. Le comparateur vérifie d’abord les nouvelles valeurs, puis ne retire que ces changements déclarés pour comparer les éléments hérités. Il ne remplace pas les anciens résultats par un succès supposé. Les attentes de nombre de lieux, de version et de fiches dans les contrôles navigateur ont été révisées et consignées.

698 assertions Chromium passent dans 33 séries, dont 216 nouvelles. Les 130 extrémités sont rendues dans leur pièce, les 49 environnements sont ouverts dans l’atlas, et des actions E / Attaque / import de fichier utilisent les événements navigateur. Les préparations de scènes, choix d’équipement et positions imposées aux fixtures sont déclarés dans les légendes ; elles ne sont pas présentées comme des parties naturelles.

Douze campagnes automatisées couvrent quatre profils et trois difficultés, et terminent les cinquante objectifs. Quarante-cinq relectures isolées terminent chacune leur séquence. Sept tours dédiés contrôlent les nouveaux locaux, leurs retours, observations et imports ; ils partent d’états de chapitre préparés puis utilisent les commandes de mouvement. Les cinq annexes antérieures et les huit analyses de Wolf sont aussi revérifiées. Ces bots connaissent la carte et visent précisément ; ils ne constituent ni un test humain de difficulté, ni une estimation de durée.

Le navigateur utilisé est Chromium. La navigation native locale a été essayée et refusée par l’environnement ; les tests utilisent `set_content` avec un Storage mémoire explicite. Aucun contournement du blocage, téléphone ou contrôleur physique, sauvegarde `file://` native ou écoute au casque n’est revendiqué.

Les 49 vues de l’atlas ont été examinées sous forme de planches. Cette revue a conduit aux corrections des accès extérieurs et de la signalétique médicale. Elle ne garantit pas que chaque prop de chaque cadrage est parfait : les échelles, volumes, motifs récurrents et détails hérités demandent encore une production artistique dédiée. Les vingt captures fonctionnelles et les quarante-neuf vues d’audit sont les rendus du moteur, pas des images du film.

## Installation et outils

Ouvrir `JOUER_AVPR.html` pour lancer le module autonome. `JOUER_WINDOWS.cmd` est un raccourci. Si l’ouverture locale n’est pas acceptée par le navigateur, le serveur fourni se lance avec `npm run serve` depuis le dossier ; sa compatibilité chez l’utilisateur n’est pas certifiée par les tests de cet environnement.

`npm run build` assemble les sources sans téléchargement. `npm test` exécute les tests Node. `npm run audit:fidelity` recalcule les contrôles du graphe et des seuils. Les contrôles navigateur demandent Python, Playwright et Chromium ; leur exécutable de référence est `/usr/bin/chromium` et doit être adapté sur un autre système. `npm run verify` contrôle les empreintes du pack tel que livré ; le reconstruire ou modifier un rapport peut naturellement modifier ces empreintes.

L’installateur ne fait qu’ajouter ou actualiser un lien vers `src/dlc/avpr/index.html` dans un menu hôte reconnu. La vraie charge utile 0.9 et son installateur sont conservés dans la fixture de test ; mise à niveau, copie de l’ancien HTML, absence de doublon et désinstallation sont vérifiées sur un menu temporaire. `--dry-run` n’écrit rien et les options inconnues sont refusées.

Aucune fusion au moteur GameEngine/MIRE partagé, aucun profil Frontier modifié, aucun push GitHub, déploiement Vercel ou modification de bibliothèque distante.

