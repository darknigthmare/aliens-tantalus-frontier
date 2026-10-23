# Tantalus Frontier — V162

Prépublication : continuation de quatre périmètres hors Forge. Forge est reportée à la demande utilisateur (`DEFERRED_BY_USER`) ; ses trente-deux modules restent inchangés. Les documents et résultats V161 restent historiques, avec 68 tâches Trials, 189 identités et seize classeurs antérieurs immuables.

## C162-HARPOON — Harpoon : préservation du tir à la fermeture

La sauvegarde du checkpoint de mission est capturée avant le nettoyage de fermeture du moteur. Dans le défaut reproduit sur le Harpoon natif 024, le moteur supprimait les projectiles et récupérables avant leur capture ; le nouvel ordre préserve le vrai état avant stop, sans modifier les modules d’armes. Le pilote natif contrôle achat, équipement, tir, impact, récupération et reprise des quatre variantes 024/064/104/144 dans QZ-18.

Le défaut de fermeture et le vieux blocage d’achat V61 sont deux constats distincts. Aucun nouveau module d’arme, dessin ou source canonique. La recette des quatre variantes sur le commit final reste à exécuter ; les parcours initiaux ne sont pas transférés comme résultats finaux.

## C162-AUDIO — Cycle audio natif et banques

Le correctif refuse les effets décodés et la synthèse lorsque le volume maître est nul, afin qu’une réactivation rapide ne révèle pas leur fin ou une alarme différée. Les nouvelles régressions exercent séparément les mécanismes hérités : annulation de la seconde note d’une alarme à la coupure des effets et rejet des transferts de musique devenus obsolètes. Les huit banques et les reprises natives disposent d’un pilote distinct, sans nouveau média.

Aucune nouvelle musique, voix, banque originale ou source de franchise. Le pilote Chromium headless active réellement un autre onglet et minimise la fenêtre, mais document.hidden n’y est pas observé : aucun parcours de scène masquée réussi n’est certifié. Un contrôle automatisé ne certifie pas le rendu sur haut-parleurs ou appareils physiques ; recette exacte à exécuter.

## C162-CREW — Circuit médical vers la morgue

Noor Okafor relie l’infirmerie à la morgue du pont 1 pour son service médico-légal. Le circuit reprend le même acteur de 44 × 92 unités, le sol 624, les sockets natifs et la fermeture opaque des portes. Le créneau de soins animaliers 09 h–10 h 30 est préservé par un retour réel à l’infirmerie puis une délégation native signalée comme non observée. Le pilote calcule l’arrivée de retour depuis le vrai cadre de porte, relâche les touches et observe le freinage avant de vérifier l’occupation durant au moins 0,15 seconde simulée. L’attente mesure la progression physique avec des bornes distinctes de simulation, de temps mural et de blocage ; cette adaptation de recette ne change pas le jeu.

Un circuit parent/annexe borné. Aucun ascenseur, déplacement physique entre ponts, nouveau dessin ou cycle de dos. Les soins, missions et autres priorités restent natifs ; le trajet après délégation n’est pas prouvé par ce lot.

## C162-APC — Archive bornée des retours APC

Une archive compacte conserve au plus huit résultats APC natifs distincts, avec leurs relevés de distance, barrages, reine, blindage réel, protocole et trois lectures validées. L’admission exige le même identifiant d’opération, campagne, monde, numéro de résolution, déploiement et état terminal ; le succès exige son reçu complet, et l’échec ne conserve que le checkpoint partiel réel clairement désigné. L’identité V84 de l’opérateur est figée lorsqu’elle est valide ; les anciens retours peuvent rester anonymes. La consultation est en lecture seule et ne verse aucune récompense.

Journal de huit retours au plus, pas campagne étendue, enregistrement vidéo ou nouveau canon. Seuls les vrais résultats admissibles sont capturés ; aucun résultat absent n’est inventé et la lecture ne rejoue pas de paiement.

## État et sources

Aucune archive Blackout/Earth, V10 ou encyclopédie brute supplémentaire n’a été récupérée. Aucun dessin ni cycle de franchise certifié 1:1 n’est déclaré. Les 185 autres rigs et 30 atlas restent ouverts ; les manquants Forge sont reportés, sans clôture. Les corpus étendus et les autres déplacements d’annexes demandent leurs propres lots.

Le classeur distingue sources, contrôles prévus, limites et recette à exécuter sur le commit final. Les vrais reçus de contrôle et de livraison seront conservés séparément.
