# Rapport QA — 0.8.0 · Les réserves oubliées

## Résultat courant

352 tests Node réussis et 269 contrôles de jeu dans Chromium réussis sur le véritable HTML de cette version. Les six parcours continus visitent chacun 50 salles, terminent 33 objectifs et ouvrent dix casiers par maintien de l’interaction. 198 exports sont réimportés après les objectifs. Les huit cloisons, huit lectures, vingt manœuvres d’éclairage, trois choix d’allure, le capteur et la retraite poursuivie restent exercés.

Le pilote donne des commandes au moteur et utilise son calcul de chemins. Il ne force pas la santé, les ressources, les coordonnées du joueur ou la progression. Ce ne sont pas des parties humaines complètes. Les horloges de simulation ne sont pas des estimations de durée pour un joueur.

Les échanges emploient la même fonction que les boutons. À chaque transfert, le test compare la somme du contenu local et de la réserve portée. Il dépose une unité quand il peut, tente de la reprendre si le plafond le permet, puis prélève le disponible. Certains anciens postes de ravitaillement procurent déjà davantage que les nouveaux plafonds de prise : le surplus est conservé et les casiers restent partiellement pleins. Ce n’est pas un rééquilibrage général de l’économie.

## Corrections réellement nécessaires

Deux seuils initiaux se trouvaient trop près d’une commande de cloison et d’un dispositif médical. Ils ont été déplacés ; les douze extrémités des six nouvelles liaisons sont testées dans les deux vues pour détecter les interactions prioritaires incorrectes.

La reprise d’un patient déjà arrimé modifiait sa profondeur en vue latérale. La normalisation est désormais réservée aux châssis en train de suivre dans la salle active. Une régression dédiée et l’import des 198 sauvegardes historiques de schéma 7 contrôlent les états logiques ; les chemins transitoires sont recalculés, pas comparés comme des positions persistantes.

Le premier contrôle navigateur des capteurs attendait un temps mural trop court au lieu de vérifier l’écoulement du délai de simulation. Le contrôle d’ouverture de cloison avait le même défaut ; le lecteur Gamepad simulé devait également attendre de véritables images neutres entre deux états. Les essais échoués sont conservés dans v080/initial-sensor-timing.json v080/initial-shutter-timing.json et v080/initial-controller-timing.json. Les assertions attendent maintenant la fin du vrai délai tout en conservant les règles du moteur ; aucun temps de recharge ou d’ouverture n’a été raccourci.

Le pilote direct de difficulté termine quatre configurations mais échoue encore en Latérale / Survie (s28) et Latérale / Oppression (s25). Ses morts sont conservées dans difficulty-traversals.json avec les empreintes actuelles. L’équilibrage humain reste à évaluer. Les échecs historiques ne sont ni additionnés aux tests courants ni présentés comme corrigés sans essai.

## Rendu et provenance des captures

100 rendus généraux (50 salles × 2 présentations), 48 états de cloisons, 40 états d’éclairage et huit rendus ciblés des nouvelles annexes sont des situations préparées de contrôle graphique, pas autant de parties. Les 41 nouveaux tests Node préparent explicitement les situations isolées nécessaires.

Les neuf captures actuelles proviennent de Chromium. Le titre part d’un état neuf ; les scènes avancées reprennent des sauvegardes gagnées du parcours Hybride / Survie sans changer les positions. Le casier du vestiaire est réellement ouvert au clavier dans le navigateur puis manipulé avec ses boutons. Les menus suspendent la simulation ; le rendu est figé pour la photographie. Chaque PNG est accompagné de l’état exporté et des empreintes de sa source. Les 50 schémas du codex sont des dessins de données étiquetés, pas des captures.

## Limites mesurées

Les navigations natives file:// et localhost sont bloquées par ERR_BLOCKED_BY_ADMINISTRATOR. Le HTML livré est exécuté par chargement DOM avec une fixture mémoire explicite de stockage, sans contournement. L’ouverture native et la persistance locale dans le navigateur de l’utilisateur ne sont pas certifiées. Les commandes Gamepad sont simulées, pas testées sur du matériel physique. Les largeurs 360, 390 et 1024 px contrôlent la disposition et des commandes, pas une certification tactile complète.

Le rendu reste vectoriel stylisé provisoire. Les deux boucles, les textes et mécanismes nouveaux sont des créations originales du prototype. Pas de physique verticale continue, de coopération ou de population ordinaire entièrement simulée hors champ. Pas d’intégration native, de push GitHub ou de déploiement Vercel.

## Reproduction

npm run check > reports/node-tests.tap ; python3 tools/record_node_inputs.py ; npm run qa:storage ; npm run qa:baseline ; npm run qa:browser ; python3 tools/generate_docs.py ; python3 tools/build_reports.py ; npm run qa:docs ; python3 tools/verify_release.py.

Les contrôles navigateur utilisent Python Playwright et Chromium. Les noms historiques des fichiers de suite, notamment v060/browser.json, ne définissent pas la version testée : leurs empreintes et champs version identifient le HTML courant.

## Empreintes des entrées

HTML autonome : `685bb5f448f594cef7c18f84136f31434598cbbdf43d178666617c5ab814ff76`.

- `reports/browser-regression.json` : 41 réussis, 0 échecs.
- `reports/field-browser.json` : 40 réussis, 0 échecs.
- `reports/rearguard-browser.json` : 28 réussis, 0 échecs.
- `reports/trace-browser.json` : 40 réussis, 0 échecs.
- `reports/v060/browser.json` : 56 réussis, 0 échecs.
- `reports/v070/browser.json` : 36 réussis, 0 échecs.
- `reports/v080/browser.json` : 28 réussis, 0 échecs.
