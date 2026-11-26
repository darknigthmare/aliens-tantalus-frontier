# Reproductibilité — version 0.7.0

Lancer depuis la racine du module avec les scripts package.json. Les jeux de données, programmes de compatibilité et pilotes sont inclus. Le pilote v6 est inchangé ; les helpers v7 chargent la totalité des couches courantes.

Les suites `test-construction-v7.mjs`, `test-field-v7.mjs`, `test-rescue-on-v7.mjs` et `test-inherited-on-v7.mjs` préparent des scènes isolées. Neutraliser une menace ou placer un acteur dans ces fixtures ne constitue pas une victoire de campagne. Le premier script produit à la fois les 3289 invariants de construction et les 309 tests comportementaux.

`matrix-v7.mjs` lance 16 parcours complets à graines fixées. Lire les résultats individuels, les points de contrôle et les snapshots d’échec ; ne pas transformer une défaite de gameplay en réussite. Le rapport retient neuf victoires et sept défaites ainsi que 406 restaurations réussies.

Les deux scripts Python de navigateur exécutent le HTML autonome exact via set_content. Ils utilisent Chromium et Playwright. L’environnement de livraison a refusé la navigation directe file:// ; l’absence de certification du stockage natif et du double-clic est conservée dans les rapports.

`test-browser-v7.py` : contrôles du jeu, campagne complète distincte en Survie graine 8675309, 43 captures.
`test-atlas-v7.py` : atlas, 56 vues de caméra préparées, 56 plans locaux, sept réseaux et interfaces ; 127 captures.
`test-documents-v7.py` : recherche, contenu, affichage et images des documents générés.

Les images préparées sont étiquetées ; aucune image artistique ne remplace une preuve navigateur. La somme des invariants, tests de comportement et vérifications de fichiers n’est pas un nombre de parties jouées.
