# V150 — Reprise des commandes et observation de mêlée

## Base et portée

PR nº 9, branche `fix/audit-hardening-v143`, base `ebc018785add5916cc1e894d53c63ffd58f304d9`.
Ce lot réconcilie le **pack local de commandes anciennement nommé V149** avec le **V149 feedback déjà publié**. Ce sont deux travaux distincts. Les cues des six arènes, la lecture des trajectoires par l’IA et les jauges CSS de V149 sont conservées, ainsi que ses documents et son classeur.

Application 143.0.0, sauvegardes schéma 52, 189 identifiants et dépendances conservés. Les cinq signatures V147 et cinq supers V148 ne sont pas de nouveaux développements V150. Aucun changement de dégâts, coût, portée, délai ou trajectoire dans les fiches d’attaque.

## Changements

1. Les huit commandes des deux côtés conservent leurs verrous de relâchement à la fin d’une manche et lors du passage direct ou automatique à la suivante.
2. La pause préserve une commande déjà masquée par un verrouillage. Des pauses répétées ne rendent pas artificiellement une touche disponible.
3. Ctrl, Meta et Alt ne sont plus convertis en commandes de combat ; leurs relâchements restent traités pour libérer un mouvement engagé.
4. Les boutons secondaires de souris/stylet ne déclenchent plus les commandes tactiles. Le tactile multipoint reste admis sans exclusion des contacts secondaires.
5. Les touches Espace/Entrée des boutons ont des propriétaires indépendants. Leur libération suit la touche d’origine, même si la cible du focus change. Elles ne partagent plus le stockage de l’API `setInput`.
6. Reprendre une scène déjà active est sans effet et ne crée plus une boucle de rendu concurrente depuis un callback d’état.
7. `releaseXenoTrialsControlsV150` signale les relâchements pendant les présentations sans avancer la simulation ni toucher les PV, positions, ressources ou résultats.
8. Le parcours tactique arme un observateur **avant** le clic CQC réel. La première pose correspondante, son canvas et ses données sont détachés ensemble dans une même évaluation, plutôt que relus après plusieurs allers-retours. Les assertions de personnage modulaire, d’outil, de munitions et de tirs sont conservées. Une pose de blessure déjà active n’est pas utilisée comme point de départ du contrôle graphique.

Le dernier échec du commit de base se produisait dans `freezeAction` après une mêlée acceptée : le rapport contient `meleeKind: rifle-bash` mais la pose est redevenue nulle. C’est un défaut de synchronisation possible de l’observation, pas une preuve que tous les coups de mêlée échouent. Le nouveau contrôle échoue encore si aucune pose de mêlée réelle n’est dessinée ; il ne substitue ni une image reconstruite ni une pose injectée.

## Vérification

Les mêmes **44 tests comportementaux** donnent 7 réussites / 37 échecs sur la base, puis 44 / 44 sur le code réconcilié. Les variantes de commande partagent des causes ; il ne s’agit pas de 37 bugs distincts.

Un test documentaire vérifie les 189 IDs, les huit points, les 44 noms de test, les compteurs du classeur, ses empreintes et la conservation du classeur V149 publié. `npm run test:trials:controls` enregistre cette suite pour la recette globale sans compter deux fois les alias. Aucun test historique retiré.

Le banc `qa-xeno-trials-controls-v150.py` utilise le contrôleur réel avec des images fictives : il est distinct du parcours complet du vrai paquet. La navigation locale peut être refusée par l’environnement ; seuls des résultats effectivement produits sont annoncés. Les résultats de CI sont consignés par commit dans la PR, jamais empruntés au commit précédent.

Référence API du contrôleur d’essai : https://playwright.dev/docs/api/class-page#page-wait-for-function — le résultat retourné est un JSHandle de la valeur observée. Ici l’instantané est copié avant de retourner la valeur pour éviter les références vivantes aux acteurs.

## Excel et suite

`XENO_TRIALS_SUIVI_V150.xlsx` possède sept onglets : tableau de bord, correctifs, recette, roster, travaux artistiques ouverts, preuves et guide. Ses sept compteurs calculés sont 189 / 8 / 44 / 5 / 5 / 0 / 0. Les documents sont autorisés par chemins exacts dans les sources et interdits dans le paquet du jeu. Aucun nouveau module de jeu : le shell hors ligne ne change pas.

Les classeurs V146–V149 restent intacts. **Aucun nouveau clip, finisher, moveset intégral ou pose R1 articulée** n’est livré dans cette consolidation. Les 35 lots artistiques des cinq pilotes restent ouverts ; aucune référence canonique supplémentaire n’est inventée et aucun kit n’est certifié 1:1. Les finitions terminales ne doivent toujours pas être confondues avec les défaites réversibles de première manche.

Aucun compte cloud réel, matériel physique, effacement de sauvegarde, fusion sur main ni changement de protection de branche.
