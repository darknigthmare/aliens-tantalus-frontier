# AVP-R — Les lieux et les visages

## 0.10.0-candidate.1 · audit de fidélité et de cohérence

Cette candidate prolonge les sources réelles de la 0.9. Elle contient le module autonome complet, pas un correctif vide et pas le jeu Tantalus hôte. Les modifications concernent sept lieux, la structure des accès, les silhouettes et l’équipement. Les quinze séquences et cinquante objectifs principaux sont conservés.

**Objectif 1:1 : non atteint.** La cohérence locale des passages est testée ; les dimensions, implantations et costumes exacts ne sont pas authentifiés plan par plan. L’inventaire ne certifie pas que tous les lieux, armes et personnages du film sont présents. Les trois tableaux distants ne sont pas des niveaux. Plusieurs armes ne sont encore que répertoriées ou représentées dans un décor.

Le rendu reste original, vectoriel et procédural. Il ne contient pas de photogrammes ou de voix du film. Les expressions faciales, anatomies, matériaux et costumes secondaires restent stylisés. Le choix d’un montage unique n’est pas encore verrouillé : les différences cinéma / non censuré / scènes coupées sont signalées plutôt que mélangées sous l’étiquette « canon vérifié ».

## Installation et outils

Ouvrir `JOUER_AVPR.html` pour lancer le module autonome. `JOUER_WINDOWS.cmd` est un raccourci. Si l’ouverture locale n’est pas acceptée par le navigateur, le serveur fourni se lance avec `npm run serve` depuis le dossier ; sa compatibilité chez l’utilisateur n’est pas certifiée par les tests de cet environnement.

`npm run build` assemble les sources sans téléchargement. `npm test` exécute les tests Node. `npm run audit:fidelity` recalcule les contrôles du graphe et des seuils. Les contrôles navigateur demandent Python, Playwright et Chromium ; leur exécutable de référence est `/usr/bin/chromium` et doit être adapté sur un autre système. `npm run verify` contrôle les empreintes du pack tel que livré ; le reconstruire ou modifier un rapport peut naturellement modifier ces empreintes.

L’installateur ne fait qu’ajouter ou actualiser un lien vers `src/dlc/avpr/index.html` dans un menu hôte reconnu. La vraie charge utile 0.9 et son installateur sont conservés dans la fixture de test ; mise à niveau, copie de l’ancien HTML, absence de doublon et désinstallation sont vérifiées sur un menu temporaire. `--dry-run` n’écrit rien et les options inconnues sont refusées.

Aucune fusion au moteur GameEngine/MIRE partagé, aucun profil Frontier modifié, aucun push GitHub, déploiement Vercel ou modification de bibliothèque distante.

## Sauvegarde, arsenal et reprise

Le namespace de campagne reste `tantalus.mire.avpr.v1`. Le bloc `v10` conserve les acquisitions, observations, ouvertures, dotations attribuées et shurikens au sol. Les états de checkpoint conservent le même bloc. Reprendre après un échec ne doit ni recharger gratuitement une acquisition, ni perdre la trace d’un projectile récupérable. Un changement de chapitre refusé ne rappelle pas les shurikens à la main.

Les anciens états sans `v10` créent seulement les valeurs documentées : M4 vide et non acquis, trois shurikens pour Wolf, aucune nouvelle observation ou ouverture validée. Ils ne reçoivent pas de soin gratuit. Les limites et identifiants incohérents sont filtrés ; il ne s’agit pas d’un système anti-triche en ligne.

La bibliothèque de chapitres 0.9, la sauvegarde de relecture séparée et le retour à la campagne sont conservés. L’atlas peut être ouvert depuis le titre ou la pause et reste consultatif : il ne téléporte pas, ne récupère pas un objet et n’ouvre pas une zone de campagne. Lorsque neuf armes sont proposées, leur roue utilise une grille responsive pour éviter les recouvrements.

Conserver l’export JSON original avant import. Le retour d’un JSON 0.10 vers une version plus ancienne n’est pas garanti. Le stockage natif local n’a pas été certifié dans cet environnement ; l’export est la méthode explicite de conservation manuelle.

## Documents

`RAPPORT_ILLUSTRE.html` : vingt captures fonctionnelles et atlas des 49 environnements. `docs/AUDIT_FIDELITE_V0_10.md` : sources, état réel et manques. `docs/CODEX_V0_10.md` : pièce par pièce, seuils, props, objectifs et équipement.

Jeu SHA-256 : `763ea5e2bbcbc96af648824e1dd87b0262eab64fd0298d1cc623ed0bbb46a4ec`.
