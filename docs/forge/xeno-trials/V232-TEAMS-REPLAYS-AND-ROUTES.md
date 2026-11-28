# Xeno Trials V232 — Équipes, versus local, replays et parcours

Baseline : `762b9a775312c227af974cae5f49b8bf8ebd475a`. Le jeu intégré et l’édition autonome importent les mêmes modules. Ce lot conserve les 202 identités sélectionnables et les 131 arènes ; aucun personnage hors roster n’est ajouté.

## Comportements livrés

Le programme **Exhibitions MIRE** permet le duel contre le processeur ou entre deux opérateurs locaux, ainsi que le relais 2 contre 2 dans ces deux configurations. Chaque place vient de la collection acquise du propriétaire du terminal ; une même identité ne peut remplir les deux places d’une équipe. Les miroirs entre équipes représentent des modèles MIRE distincts. Les exhibitions n’ouvrent aucun ticket, ne donnent aucune prime et ne modifient aucun journal de progression.

Le clavier partage les propriétaires sans partager les flèches : J1 conserve Q/A, D, Z/W, S et ses techniques ; J2 utilise les flèches et le pavé numérique. Les manettes standard des ports 1 et 2 restent attribuées explicitement. Déconnexion, perte de focus, pause et changement de manche exigent le relâchement des commandes. Les explications restent dans le sous-menu Commandes de la pause. Le HUD et les états de réserve restent dans l’écran de la tablette Weyland-Yutani.

Un relais manuel exige un acteur vivant, neutre et au sol. Son entrée peut être interrompue et son délai interdit le rappel immédiat. Les PV, l’endurance, la jauge et les statistiques appartiennent au membre ; un KO appelle la réserve vivante et la manche se termine quand toute l’équipe tombe. Le verdict au temps compare la santé des équipes. Les décisions adverses utilisent une IA native déterministe.

Le soutien optionnel engage physiquement la réserve pour un coup rapide natif. Il débite 25 unités de jauge et impose 480 pas de récupération. La réserve peut recevoir de vrais dégâts, une garde ou une parade, être interrompue, puis revenir blessée. Une aide parée ne crée pas encore de fenêtre de riposte ciblant cette aide ; les ripostes entre acteurs actifs restent natives. Les aides projectiles, les équipes de campagne et les hordes en équipe restent ouvertes.

Les replays conservent les appels du moteur, les deux propriétaires de commandes, les transitions de manche et les relâchements. La lecture recalcule la simulation depuis sa configuration, vérifie ses empreintes et recherche une position en repartant du début. Elle ne charge aucun snapshot importé. Quatre archives au maximum sont conservées dans une clé locale distincte ; les anciens enregistrements deviennent incompatibles si les sources du moteur changent. Les limites sont de 20 minutes et 768 Kio par archive. La lecture ne peut remettre de résultat dans la progression. Ce premier raccordement concerne les exhibitions.

Neomorph, Deacon et Specimen Six disposent chacun de quatre nouveaux chapitres FR/EN, d’un prologue, d’un rival, d’un retournement et d’un épilogue. Leurs lieux proviennent respectivement de Covenant, Prometheus et AVP2010 ; les confrontations et les récits sont des compositions MIRE, sans dressage ni dialogue ajouté aux créatures. Le prêt reste limité au ticket de leur parcours et la validation finale autorise définitivement le modèle. Les primes sont uniques. Big Chap et ses quatre anciens checkpoints V231 restent pris en charge.

Quatre atlas de combat originaux ajoutent douze phases dessinées : préparation, contact et récupération des attaques rapide et lourde de Big Chap et Deacon. Les références, limites artistiques, ancres et octets sont documentés dans `combat-art-v232.json`. Les images restent distinctes des hitboxes et des règles. Aucun certificat de fidélité 1:1 n’est revendiqué.

## Vérification et limites

Les suites V232 couvrent les commandes locales, la sélection possédée, les relais et aides natifs, la resimulation des replays, la non-attribution de primes, les parcours et les anciens checkpoints, ainsi que le rendu et le nettoyage du runtime. Les parcours Chromium et reçus des deux builds sont des contrôles distincts ; leurs journaux externes ne sont pas inclus dans les paquets jouables.

Le suivi `combat-guide-coverage-v232.json` maintient une ligne par groupe de sections des trois documents fournis. Il ne déclare pas la Bible entièrement terminée. Restent notamment : réseau/rollback, coopération, tournoi, Clash QTE, variantes de soutien, nombreux parcours individuels, dessins de présentation et de combat, transitions entre arènes et droits d’abonnement liés à un service réel. Le lot ne simule aucun achat ni abonnement extérieur.
