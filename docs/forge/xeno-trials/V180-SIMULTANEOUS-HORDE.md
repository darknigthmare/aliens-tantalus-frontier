# V180 — Horde simultanée, borne MIRE et scènes multicouches

Suite du lot V179, conservé dans le commit `d516dda`. Les événements V179 restent des duels successifs ; **HORDE** est une nouvelle branche de 40 protocoles `xth180-*`.

## Parcours jouable

Le joueur choisit son spécimen acquis et un protocole dans la borne MIRE. Plusieurs ennemis sont vivants et actifs simultanément : trois à huit suivant la pression, avec 15 à 35 PV par troupe. Le même joueur conserve sa santé pendant toute l’évaluation. Renforts, intermissions et vagues appartiennent à une simulation continue ; une seule victoire clôt toutes les vagues. Le KO du joueur ou l’expiration du délai termine l’évaluation par une défaite. Une prime de validation ne peut être versée qu’une fois par protocole.

Les attaques, projectiles et cerveaux CPU restent ceux du moteur natif. Une frappe de zone peut toucher plusieurs adversaires ; un projectile touche sa première cible sur son trajet. Le directeur borne la population à huit, les projectiles et les effets. Deux ennemis au plus engagent une attaque en même temps et une brève fenêtre après contact évite une rafale de huit impacts simultanés. Ces réglages sont des règles originales de simulation, pas de la biologie canonique.

Le ticket durable permet de recommencer le protocole depuis la première vague après rechargement, sans gain préalable. Le restaurateur JSON du moteur est testé séparément ; **l’interface ne revendique pas de reprise exacte en milieu de vague**.

## Présentation

- **40 scènes :** trois images far/mid/foreground de leur propre famille, soit 120 fichiers existants. Les plans suivent des profondeurs de caméra distinctes, avec lumière et atmosphère liées au temps et à la phase. L’avant-plan reste sous la ligne des pieds ; les silhouettes et collisions sont conservées. Le mouvement réduit fige les détails décoratifs.
- **Borne et HUD :** terminal MIRE vert/ambre, écran de contrôle du spécimen, fiches de protocole, commandes accessibles au clavier, compteurs de contacts/vagues et jauge du joueur. Les intermissions avec un joueur seul et le résultat final ne sont pas présentés comme un duel à deux manches.
- **Sprites :** quarante poses de petits pas sur cinq castes — Runner, Warrior, Prowler, Spitter et Burster — et attaques synchronisées à leur horloge native. Les PNG sources sont conservés, avec maillage mesuré, appuis et directions vérifiés. Ce ne sont ni quarante nouveaux PNG ni cinq atlas complets.
- **Campagne :** quatre nouvelles illustrations Acheron/LV-426, LV-223, Fiorina 161 et Sevastopol ; quarante raccordements explicites sur vingt campagnes des mondes correspondants. Les quatre WebP lossless totalisent 7 085 980 octets, sans redimensionnement ni changement des pixels RGBA des PNG produits. Les sources et prompts sont conservés dans [la provenance artistique](campaign-art-v180.json), hors paquet jouable.

## Fidélité demandée et portée mesurée

L’objectif demandé est une fidélité 1:1. Les cinq sprites restent des illustrations natives du projet et leurs nouveaux mouvements sont des adaptations courtes de maillage. Les quatre nouvelles scènes sont des interprétations originales produites depuis les références picturales du projet, pas des reproductions mesurées de photogrammes ou de décors de franchise. Aucun relevé ne justifie de les certifier globalement 1:1. Les champs `canonExact` et `fullLocomotion` ne sont pas artificiellement fermés.

La revue complémentaire consulte sept pages primaires et cinq images officielles, en plus des neuf images du projet. Les [notes Fireteam](https://www.aliensfireteamelite.com/en/releasenotes/) documentent notamment l’éclatement et les projections acides du Burster ; le [synopsis Alien 3](https://www.20thcenturystudios.com/movies/alien-3) et le [manuel officiel Isolation](https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/) étayent des thèmes de Fiorina et Sevastopol. Ces éléments ne fournissent aucun cycle de mouvement comparable aux quarante poses. Runner et Warrior des films, ainsi que Spitter de Colonial Marines, ne sont pas assimilés à leurs variantes Fireteam. Le relevé détaillé, les pages et les empreintes restent dans `/workspace/tantalus-inventory/reprise-v180/fidelity-review.json`.

## Vérification et publication

Le [suivi V180](batch40-v180.json) distingue moteur natif, doubles DOM/RAF/Canvas, parcours Chromium et production. Les scénarios exhaustifs d’acteurs et d’économie ne sont pas comptés comme autant de parties navigateur. Le premier lot V179 et ses preuves historiques restent préservés.

Commandes : `npm run test:trials:horde:v180`, collecteur général de release, `npm run check`, `npm run build`, `npm run check:built`. Les fichiers privés de développement restent exclus de la distribution et les quatre nouveaux médias disposent d’une admission exacte par chemin et SHA-256.

Le commit et les reçus publics sont consignés après validation, séparément des contrôles locaux.

Résultat final local : **4 337 tests réussis, zéro échec, un test facultatif ignoré**, dans les 222 fichiers dédupliqués du collecteur officiel, avec six processus concurrents. Les 153 tests nouveaux et les 114 contrôles d’audit ciblés sont inclus dans la passe générale, pas ajoutés à son total.

La recette Chromium passe **28 contrôles et 7 captures**, zéro erreur JavaScript/HTTP/requête. Elle gagne réellement deux vagues et douze ennemis au clavier, observe un ennemi passer de 15 à 1 PV puis disparaître pendant que d’autres combattent, conserve la santé entre vagues et constate une défaite CPU. Les 561 fichiers observés restent identiques pendant le parcours ; les 14 modules HTTP concernés correspondent au disque. Le rechargement d’un ticket recommence bien la première vague sans prime. Une probe distincte décode les 120 couches et quatre nouvelles peintures ; elle ne constitue pas 124 parcours jouables. Le contrôle mobile à 375 px vérifie également absence de débordement, commandes tactiles et réduction des mouvements.

Admissions des sources réussies : 2 456 fichiers, 1 430 assets et aucun document de développement dans le paquet public. Le build et son contrôle passent avant commit ; une nouvelle construction attribuée au SHA publié est conservée séparément. Les originaux générés et les pages de référence restent hors du paquet jouable.

Reçus : `/workspace/tantalus-inventory/reprise-v180/validation-local-final.json`, `test-all-final.log`, `native-final/report.json` et, après publication, `publication-final.json`. Les succès locaux ne sont pas présentés comme des résultats CI GitHub.
