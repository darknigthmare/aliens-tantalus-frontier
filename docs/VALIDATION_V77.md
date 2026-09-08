# Validation V77 — contrôle local réussi

Date : 2026-09-08. Branche : `codex/v52-physical-worlds`.

## Périmètre livré

Rechargement tactique à seconde pression, quatre résultats, inventaire transactionnel, bonus plafonné, sauvegarde exacte et commandes des deux joueurs locaux. Annulation sûre lors d’un conduit ou d’une autre interruption. HUD lisible et boutons accessibles en paysage mobile. Catalogue M41A corrigé sans création de munitions à la reprise. Infrastructure audio optionnelle, volumes séparés, réglage Musique persistant et cache hors ligne.

Cette validation ne certifie ni campagne complète, ni multijoueur réseau, ni fidélité artistique des plaques historiques.

## Contrôle complet exécuté

`npm run qa` : **réussi**, code de sortie 0.

- Audio : manifeste déterministe vérifié, **0/8 slots** finaux présents ; synthèse/silence conservés.
- Inventaire et manifests : 195 atlas RGBA historiques / 2 772 cellules, puis 12 atlas ennemis validés / 384 poses dédiées.
- Audit PNG courant : **405 images runtime, 0 erreur, 13 candidats à halo à revoir** ; 231 masters exclus. Le rapport V64 avait seulement un compteur périmé après l’ajout de deux sources de production au Git : 229→231 exclus. Aucune image n’a été modifiée lors de sa régénération.
- Contrôles V65/V66, état de production V75 et preuves de revue : réussis ; aucun nouveau profil ennemi promu.
- Lint syntaxe/sûreté : réussi.
- Suite complète : **1 361 tests, 1 360 réussis, 0 échec, 1 ignoré** (contrat de lien symbolique indisponible sous Windows).
- Build : **77.0.0, 3 450 entrées catalogue**. Une entrée catalogue n’est pas une preuve de contenu terminé.

Les essais précédents avaient révélé des attentes audio fragiles : les tests attendent maintenant les promesses réelles (chargement, SHA, décodage et démarrage média), sans cinq tours arbitraires de boucle. Stress supplémentaire : **24 exécutions × 15 tests = 360 réussites**, huit processus concurrents avec un worker libuv chacun. L’ancien test de boss vérifie désormais l’égalité entre tirs réels et cartouches dépensées, sans supposer qu’un M41A de 99 cartouches doit entamer la réserve pour tuer.

## Navigateur réel

Preuves dans `docs/references/v77-browser-qa/` ; `final-local/` désigne la passe complète finale, les autres dossiers gardent les échecs intermédiaires et correctifs pour traçabilité.

- Clavier natif sur le M41A du catalogue, sans surcharge privée de ses statistiques : normal 1,45 s ; réussi 1,189 s ; parfait 1,015 s ; raté 1,95 s. Trois tirs à ×1,15 puis quatrième à ×1, sans consommation en double.
- Coop indépendante et annulation de conduit contrôlées pour les deux joueurs. Deux manettes standard simulées vérifient les fronts d’appui ; **aucun périphérique physique n’a été testé**.
- Paysage 844 × 390 : contacts tactiles réels, panneaux à 12/11 pixels CSS ; journal y218–246, jauges y252–308, commandes y328–380, sans chevauchement.
- Paysage compact 480 × 320 : jauges sous le bouton de retraite et au-dessus des deux rangées tactiles. Les intersections rectangulaires complètent les points de hit-test ; un recouvrement initial de 5,34 pixels a été corrigé, pas ignoré.
- Audio natif : clic réel, AudioContext, décodage PCM, HTMLAudioElement, transitions, mute pendant lecture en attente et libération des ressources. PCM de test silencieux, en mémoire uniquement.
- Application : les curseurs effets à 25 % et musique à 80 % restent indépendants et reviennent après rechargement. Mission→planification/paramètres arrête le moteur et les effets retardés. Aucun contexte audio avant le geste utilisateur. Banque vide affichée comme `silent-missing`, jamais comme morceau livré.

## Publication

Le contrôle local V77 est réussi. Le lot est conservé dans un commit local ; **push et déploiement V77 non exécutés**, en attente d’accord explicite sur la visibilité publique.

Vérification GitHub en lecture seule : `origin` pointe vers `https://github.com/darknigthmare/aliens-tantalus-frontier.git`, compte connecté `darknigthmare`, permission `ADMIN`, **`isPrivate: false`**. Le dépôt est public, contrairement à l’hypothèse de confidentialité antérieure. Le contrôle de sécurité a refusé la commande combinée avant son exécution, puis de nouveau après vérification du propriétaire, faute d’accord utilisateur explicite sur l’exposition publique de ce lot de code/captures/preuves. Aucun autre chemin de publication n’a été utilisé pour contourner ce refus.

La dernière production déjà vérifiée reste V76, contenu `7804645`, preuves `d025400`. Après accord, pousser le commit local puis publier et exécuter `scripts/verify-production-v77.mjs --commit=<commit-contenu>` et la QA navigateur publique avant de déclarer V77 publiée.

## Restes explicites

- Identité visuelle Echo-9 locomotion/combat non corrigée ; nouveaux clips tactiques non produits. `dedicatedBranchAnimations` reste `false`.
- Générateur OpenAI intégré en erreur de lecture locale `apply deny-read ACLs` avant génération. Aucun asset ni identifiant de génération inventé. Le passage API/CLI demande un accord explicite distinct et n’a pas été utilisé.
- Banque audio finale absente ; les micro-WAV sont des fixtures, pas du contenu commercial.
- **559 profils de production ennemie restent inachevés**, selon le compteur V75 vérifié. Les 142 statistiques d’armes hors M41A restent à auditer.
- Aucun des 26 chats n’est intégralement clôturé : **15 PARTIAL, 11 MISSING**. Le reste du plan demeure actif dans la matrice maîtresse.
