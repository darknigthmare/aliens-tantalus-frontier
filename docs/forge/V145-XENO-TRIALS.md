# Continuation PR9 — Xeno Trials (V145 tests; application 143.0.0)

Base : c49ad8423bb50e3b95518d949ed0b1e274ae31ca. Aucun nouveau sprite, aucune nouvelle
campagne historique, aucune certification visuelle 1:1. Les statistiques de combat
restent des règles originales de la simulation, pas des propriétés canoniques.

## Correctifs

- L'IA dont le spécial à distance est interdit par les règles approche pour utiliser
  sa mêlée autorisée, au lieu de rester à une distance de tir inutilisable.
- Maintenir le spécial pendant ses vingt secondes de verrouillage ne déclenche
  plus une attaque différée. Le relâchement puis une nouvelle pression sont requis
  pour les deux combattants ; les règles sans spécial restent absolues.
- Le focus passant du canvas vers un menu suspend le duel et libère les commandes.
  Les boutons de combat accessibles et la commande explicite pause/reprise gardent
  leurs rôles. Les répétitions de touches issues d'une autre surface ne sont pas
  transformées en commandes nouvelles. La fermeture libère les captures tactiles.
- Une fenêtre toujours masquée ou sans focus ne reprend pas le combat à la fin du
  chargement. L'interface ne vole plus le focus après cette décision du runtime.
- Une pause ne conserve plus une boucle de dessin à chaque frame. La reprise
  relance une seule boucle ; le résultat terminal arrête aussi cette boucle.
- Fermeture réentrante depuis onState et arrivées d'images tardives : aucun nouveau
  RAF ou résultat vers une scène fermée. La sortie ne notifie son propriétaire
  qu'une fois. Les images invalides suspendent le duel sans remplacer le spécimen ;
  un décor facultatif absent conserve l'arène procédurale.

## Vérifications

`npm run test:trials` exécute 28 tests Node du moteur/runtime réels, avec un hôte
DOM/images/RAF simulé. Les tests couvrent les scénarios de régression, une matrice
sur les 31 identités de tir acide/impulsion/flamme admises, la détermination à
30/60/120 Hz, la clôture d'un ticket réel et le refus d'une seconde récompense.
Cette matrice ne représente ni 31 campagnes jouées ni une revue de chaque sprite.

`python scripts/qa-xeno-trials-v145.py --output /tmp/atf-trials-qa` utilise le vrai
paquet HTTP et les menus dans un profil isolé. Un duel standard vérifie la pause,
les commandes accessibles et l'abandon. Un duel à 1 PV se termine par le combat
réel de l'IA ; sa récompense est contrôlée puis relue après rechargement. Aucun
acteur, horloge, résultat ou compteur de progression n'est injecté par le parcours.

Les résultats CI et les empreintes doivent être associés au commit publié, et non
recopiés depuis une passe précédente. La recette ne valide pas un périphérique
physique, l'ensemble du roster en navigateur, un compte cloud ou la production
Vercel. Aucun statut d'opération historique n'est promu par ces corrections.

## Fiabilité de la recette

Les trois parcours du paquet (personnage, profils et Trials) s'exécutent même
si l'un échoue ; l'état final reste un échec lorsqu'une assertion échoue. Cela
conserve les preuves des autres systèmes sans masquer la régression.

Le contrôle de marche en armurerie attend maintenant, pendant cinq secondes au
maximum, un framebuffer réellement différent avec le bon mode et les images
prêtes. Deux captures espacées de 180 ms pouvaient tomber sur une même pose ou
avant le dessin suivant d'un navigateur occupé. Un aperçu toujours immobile
échoue encore : aucun mouvement, pixel ou compteur n'est injecté dans ce test.
