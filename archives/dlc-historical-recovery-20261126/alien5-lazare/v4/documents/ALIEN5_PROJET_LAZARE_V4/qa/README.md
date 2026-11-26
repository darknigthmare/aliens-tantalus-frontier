# Preuves V4 — 29 septembre 2026

**summary-v4.json** est le bilan actuel : 377 contrôles exécutés de jeu, navigateur, installation et campagne. **docs-v4-results.json** ajoute 24 contrôles de documentation. Les résultats V3 conservés sont historiques et ne sont pas comptés comme une réexécution V4.

Les suites core, systems-v2 et systems-v3 sont réellement relancées sur les données actuelles, mais utilisent leurs couches historiques. systems-v4.test.cjs charge toute la chaîne et fournit 50 cas isolés V4. Les tests navigateur et campagnes chargent aussi le moteur V4 complet.

Les deux fichiers campaign-v4-*-results.json décrivent les parcours Récit et Survie. Les entrées du moteur, ennemis actifs, ressources finies et sérialisation après chaque objectif sont réels. Le pilote connaît la topologie, les ennemis et la solution du circuit. Pas de joueur directement déplacé, d’invulnérabilité de test ou de réserve créée. Ces parties visitent 39 lieux et ne sont pas une certification de difficulté humaine.

browser-v4-tactics-results.json vérifie les nouvelles commandes. La rencontre de départ de la fuite est une fixture déclarée, avec un drone existant réactivé. À partir de là, traversée, déplacement au panneau, fermeture, soudure, course vers la niche et entrée passent par les commandes clavier/souris ; le même individu rompt la cloison et arrive. Il n’y a pas d’apparition supplémentaire ni de déplacement direct du joueur pendant cette séquence. v4_browser_pursuit.json en conserve le résultat.

v4atlas/ : 42 captures du rendu actuel, en états préparés avec menaces neutralisées pour examiner les pièces. v4screens/ : 49 captures actuelles du jeu, des menus et situations de contrôle. Les quatre v4-contact-*.jpg sont des montages de contrôle, pas quatre nouvelles captures. Les captures avancées de reine et le bilan final chargent des états préparés/exports du pilote.

Chromium exécute le HTML en mémoire. La navigation HTTP locale a été bloquée par l’environnement et aucune politique n’a été changée. Une Map sert explicitement aux échanges de stockage ; le refus natif est vérifié sans substitut sur une autre page. La rétention après fermeture du navigateur n’est pas certifiée. Web Audio est testé techniquement, pas écouté sur un appareil physique.

fixture_*.json, v2_*.json et v3_*.json restent nécessaires aux essais d’import. Leur ancien nom n’en fait pas une autre livraison dans cette archive. L’installateur n’est éprouvé que sur des fixtures locales jetables, pas dans le dépôt connecté.
