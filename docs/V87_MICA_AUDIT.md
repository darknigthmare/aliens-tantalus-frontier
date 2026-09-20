# V87 — Mica, terrarium et locomotion adaptée

20 septembre 2026. Rapport privé : aucun document, prompt, capture ou essai graphique de ce dossier ne doit entrer dans la distribution publique.

## Périmètre réellement intégré

Mica est le huitième individu du paquet `ATF_Animaux_USS_Conception_Codex_v1` implémenté. Gecko original tacheté, offre individuelle `offer-animal-mica` à 180 CR, comptoir scientifique `station-shop`, habitat fermé `mica-terrarium-v87` d'une place. Zéro animal possédé par défaut ; limite globale existante de huit conservée. Pas de quête Mica inventée, de bonus de combat, de pénalité hors ligne, de caresse à travers une vitre ni de reptile libre au sol humain.

Deux images OpenAI intégrées sélectionnées : `mica-atlas-v2.png` (48 poses, 1536×1024) et `terrarium-props.png` (12 composants indépendants, 1536×1024). Le premier atlas à 32 poses est conservé dans `docs/references/v87-mica-unselected/`, exclu du runtime. L'édition guidée par référence a échoué sur l'accès Windows ; la planche complète a été générée directement. Aucune API alternative utilisée. Prompts et provenance : `docs/references/v87-mica-generation.json`.

Le décor emploie dos, mobilier, gecko et cadre avant distincts ; la fenêtre avant reste transparente. Rampe et perchoir possèdent leur propre sprite et support logique. Le gecko marche puis grimpe sur un trajet intérieur sérialisé par identifiants de nœuds. Les huit poses de descente ont leur orientation source gauche, sans inversion arbitraire de la pente.

## Raccords physiques et persistance

- Fenêtre intérieure : x1790/y548, 104×64 ; sol animal y612, sol humain y624. Taille physique gecko 20×10 et échelle d'art 0,11, sans modification de la hitbox humaine.
- Installation / réception humaines à x1800 ; achat au port x810 avec priorité vendeur conservée. Aucun déplacement des sept rencontres précédentes.
- Caisse de transport fermée adaptée aux reptiles ; achat atomique, réservation, portage réel, arrivée puis acclimatation.
- Trajets bed → food → branch-foot → branch-top → perch, supports calculés ; marche 10 unités/s, montée 7 ; progression suspendue avec la scène, pas d'avancement hors ligne.
- Rechargement en milieu de montée conserve la phase et la position ; route invalide rejetée, pas de durée arbitraire persistée.

## Défaut découvert pendant le test et corrigé

Le premier essai complet a mesuré des pixels de queue sous le plancher : y613,122 et y613,789. Il n'a pas été compté comme réussi. Les 16 ancres des poses inclinées ont été déplacées le long de leur même droite d'appui (`x - 32`, `y + 32×30/34` en source), sans rogner de pixels, déplacer le terrarium ou élargir la tolérance du test. La deuxième exécution emploie les mêmes assertions de volume et passe.

## Preuves locales

- Suite complète : 2 945 tests, 2 944 réussis, zéro échec, un ignoré sur Windows. Journal : `E:/CodexQA/AliensTantalus/v87-mica-20260920/unit-release.log`.
- Lint : 508 modules valides. Contrôle animalier ciblé : 497 réussis ; art/routines après correction : 64 réussis.
- Navigateur privé : `E:/CodexQA/AliensTantalus/v87-mica-20260920/e2e/private-02/report.json`, `ok: true`, 54 jalons, 20 captures, aucune erreur.
- Parcours réel après une unique fixture initiale : équipement, marche/échelles/ascenseurs, amarrage, achat, transport, accueil, observation, deux cycles complets et sauvegarde/reprise mi-montée. Pas de téléportation ou d'affectation d'horloge pendant ce parcours.
- 5 577 dessins de Mica contrôlés : au maximum un corps, toujours entre les deux couches du terrarium, aucun débordement au-delà de la tolérance existante d'un pixel au plancher. Les huit poses de descente ont été affichées. 1 312 dessins de caisse, dont 1 024 en mouvement.
- Capture `private-02/12-climb-down-1.jpg` inspectée visuellement après correction : échelle relative réduite du gecko et descente dans le terrarium.
- Build public assaini : 919 fichiers / 740 assets / zéro document privé. Arbre source : 930 fichiers. Contrôle HTTP local : 97 modules critiques, 14 images animalières et 263 chemins privés en vrai 404 ; correspondance au commit public `2fda1b42d989e6459cff380d33bc98302587dccd`.

## Publication

Commit public `2fda1b42d989e6459cff380d33bc98302587dccd`, parent `4f318e43c2b5ed61d2be644f0cd9588ff8435ed9`, poussé atomiquement sur `main` et `codex/v86-public-release`. Le commit privé n'est pas un ancêtre public.

Vercel production `dpl_J9RjhoztADaLBstgSzqWZMWRinRe` : **READY** sur ce SHA, alias `https://aliens-tantalus-frontier.vercel.app`, construction d'environ 26,6 secondes. Contrôle HTTP de production réussi : 97 modules critiques identiques au commit, 14 PNG animaliers contrôlés, 263 chemins privés renvoyant un vrai 404. Rapport : `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/privateoutput/v87-mica-public-http-production.json`.

PWA du build local et de production : cache public shell-12, 224 chemins, 28 modules structurels, 14 PNG animaliers, deux atlas REFUGE et ses six décors disponibles hors ligne ; 41 ressources privées restent exclues et en 404. Ce périmètre ne certifie pas toutes les missions hors ligne. Aucun log Vercel error/fatal retourné pour ce déploiement sur la fenêtre de 15 minutes interrogée ; cela ne remplace pas le contrôle navigateur du jeu statique.

Parcours navigateur **production-01 PASS** sur l'alias officiel, même harnais et mêmes assertions : 54 jalons, 20 captures, aucune erreur JS/HTTP. Achat unique à 180 CR, 3 020 CR finaux, une identité/un reçu/une réservation ; 1 180 dessins de caisse dont 933 en mouvement. Deux montées, deux descentes et reprise exacte mi-montée. Sur 4 878 dessins Mica, aucun doublon, aucun dépassement alpha, tous entre les panneaux ; 614 dessins en montée et 600 en descente. Rapport `E:/CodexQA/AliensTantalus/v87-mica-20260920/e2e/production-01/report.json`. Contexte isolé fermé. Aucun changement de donnée usager ou écriture publique par le harnais.

Rapport PWA production : `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/privateoutput/v87-mica-public-pwa-production.json`, `ok: true`, aucune exception navigateur. Les captures, rapports et prompts restent privés.

## Limites

Ce lot ne certifie pas la fluidité artistique de toutes les boucles, toutes les espèces, les 178 clips proposés ou un jeu complet. Huit individus source restent à réaliser : Rivet, Suie, Boulon, Sable, M-17, ARC-4, Bip et Clé, avec leurs comportements propres. Les quêtes, pension/restitution, systèmes animaux avancés et escalade des rats ne sont pas livrés par ce lot. Les quatre nouvelles planches ECHO-9 demeurent des candidates privées non raccordées : l'animation humaine dédiée au portage n'est pas corrigée ici.
