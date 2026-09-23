# BIOFORGE MIX — état de livraison du 20 septembre 2026

Le contrat de conversation exige un catalogue imprimable, des compositions mixtes, une limite simultanée indépendante du total, des renforts, l'annulation de la file, une enceinte physique et une isolation de la campagne. Cette livraison couvre ce sous-ensemble ; elle ne certifie pas toutes les autres conversations ou tous les ennemis du projet.

## Implémentation

- Éditeur ordonné multi-profils utilisant les onze profils actuellement autorisés ; 48 entrées au total, 1 à 12 corps simultanés et budget actif de coût 12. Le total n'est plus la limite des douze positions physiques.
- File initiale entrelacée par groupes, renforts idempotents et annulation des seules entrées en attente. Les identités ne sont pas recyclées ; un rejeu de requête ne recrée pas de corps.
- Prévalidation de la taille native, du support, des murs, du joueur et des autres ennemis avant de consommer une impression. Saturation sans impression fantôme ; IA de combat active pendant l'impression progressive.
- Vraie factory/IA/dégâts/armure des ennemis. Rechargement tactique effectif. Prêt local explicite : 600 cartouches en réserve initiale, sans mutation de l'inventaire de campagne ni loot transférable.
- Ovomorphes et Facehuggers utilisent les routines existantes. Les naissances respectent les capacités et les limites physiques ; corps morts et preuve parent/enfant conservés contre les éclosions dupliquées.
- Instantané physique validé : vie, armure, munitions, timers, rechargement, états d'attaque, corps et charges locales. Une reprise ne soigne ni ne recharge gratuitement. Identité/factory/dimensions doivent correspondre. Snapshot absent legacy distingué du snapshot invalide ; purge de sécurité et payload rejeté conservé.
- Raccord réel du terminal avec garde profil/epoch/timeline, population vivante, brouillon/focus préservés, aucune commande de tir depuis un champ texte. Échecs de quota ne deviennent pas des succès de sauvegarde.

## Corrections trouvées pendant la vérification

Le collider mission hérité transformait une porte logique de 40 pixels en obstacle d'environ 554 pixels et bloquait les attaques. BIOFORGE utilise désormais les rectangles déclarés par son propre niveau. Le spawnX des nouveaux acteurs est initialisé à leur vraie position. Les plateformes hautes bornent la patrouille pour éviter les corps flottants.

Une entrée de file supplémentaire étrangère doit être rejetée, pas supprimée silencieusement. Le contrôle de cardinalité et ses tests hostiles complètent les contrôles d'identité.

Le callback réel beforeunload suspend maintenant avec checkpoint au lieu de purger la population. La migration legacy de douze Facehuggers respecte les collisions réelles sans imposer rétroactivement la marge de confort des nouvelles impressions. Le bandeau affiche la composition mixte au lieu de « AUCUN PROFIL ».

## Portée et limites assumées

- Les 48 entrées ne signifient pas 48 ennemis simultanés, ni 48 nouveaux dessins.
- Navigation inter-étages par échelles et modes avancés de vagues/préréglages ne sont pas livrés dans ce lot.
- Les projectiles déjà en vol ne sont pas sérialisés : aucune promesse de reprise balistique à la frame exacte.
- Onze profils imprimables ne signifient pas que tous les profils du projet sont terminés.
- Les rapports navigateur distinguent la préparation du contexte QA et les actions réellement jouées (double sas, tirs, recharge, renforts, annulations, reprise, purge).

## Preuves

205 tests ciblés BIOFORGE/Ovomorph validés, zéro échec. Suite générale finale : 3064 tests, 3063 réussis, 0 échec, 1 ignoré ; lint sur 521 modules. Parcours browser-private-04 : 17 jalons joués, zéro erreur JS/HTTP ; sas, tir, recharge, saturation, renforts, annulations, reprise exacte et purge validés. Le temps de jeu mural augmente normalement au rechargement, le reste de la campagne est comparé exactement. Les rapports et captures restent sur E:/CodexQA/AliensTantalus/v87-bioforge-mix-20260920 et ne sont jamais publiés.

Ce document et les conversations source restent privés ; seul le jeu est destiné à GitHub/Vercel.

## Revalidation du 23 septembre 2026

Suite complète relancée avec TEMP/TMP sur E (C saturé) : 3064 tests, 3063 réussis, zéro échec, un ignoré ; lint 521 modules. Le premier essai sur le répertoire temporaire système a échoué par ENOSPC et ne constitue pas une validation.

Le parcours navigateur isolé E:/CodexQA/AliensTantalus/v87-release-20260923/bioforge/private/report.json valide maintenant 18 jalons, zéro erreur JS/HTTP. Après le vrai rechargement, les six assets sont redécodés et la simulation avance via requestAnimationFrame avec les munitions conservées et sans soin offert. Préparation QA explicitement distinguée des actions physiques.
