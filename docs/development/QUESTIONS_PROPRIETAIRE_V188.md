# Questions au propriétaire — lot V188

Questionnaire de décision établi le 2026-11-15 sur le commit `b45e9eb`. Il rassemble les points encore ouverts du jeu : bible des campagnes (`docs/narrative/CAMPAGNE_PRINCIPALE.md`), features Spec Kit `specs/001-salles-hybrides-2d-25d/` et `specs/002-cales-qz17-profondeur-combat/`, marqueurs `[PROPOSÉ]` du code (`src/`) et constats des dernières chasses aux bugs.

Ce document est un fichier source de développement. Il est exclu du build public (`scripts/verify-public-release-v86.mjs`).

## Réponses reçues (2026-11-15)

| # | Réponse |
| --- | --- |
| 31 | A — d'autres soutes ou cales de mission, après évaluation de la cale QZ-17 |
| 38 | Le surplus vient d'un bonus de conséquence présent sur toutes les missions de paire : **gardé et annoncé** dans le plan d'opération (confirmé) |
| 39 | A — réduire la pression ennemie pendant la phase P-5000, sans toucher au véhicule |
| 63 | A — défilement automatique du rail jusqu'à la phase active (appliqué par défaut) |
| 78 | B — portraits en primitives Canvas avec un signe distinctif |
| 79 | A — primitives Canvas pour tout nouvel élément |
| 80 | Garder la ligne du §45.1 telle quelle (l'exclusion vaut pour la session de travail) |
| 86 | A — noms propres gardés tels quels, avec accents |

Décisions prises hors questionnaire le même jour : grâce de 4 s seule pour QZ-17 ; mission de Jeri en solo ; l'objectif des conduits ne compte que le joueur ; un checkpoint par phase dans `special-cargo-brutal` (et avant la passerelle d'extraction en extérieur).

## Comment répondre

- Répondre par numéro et lettre, par exemple : `12: B`, `40: A`, `71: C`.
- Une réponse libre est possible : `12: B, mais seulement en Horreur`.
- **Toute question sans réponse prend l'option marquée (Recommandé).**
- Les étiquettes indiquent l'urgence :
  - **[BLOQUANT]** : le code ne peut pas avancer sans la réponse ;
  - **[PRODUCTION]** : la réponse est nécessaire avant de produire le contenu concerné ;
  - **[PLUS TARD]** : la réponse peut attendre.
- Les valeurs chiffrées `[PROPOSÉ]` restent réglables après les tests de jeu sans nouvelle décision (§56.1). Une question ne porte sur une valeur que lorsqu'elle change une règle ou un contenu.

**Déjà tranché, donc absent de ce questionnaire :** toutes les lignes **Validé** des §12, §27.4, §44.3 et §45 à §45.3 ; ainsi que, pendant cette session, la zone sûre à l'insertion, la seule période de grâce pour QZ-17, la mission de ruche de Jeri en solo, l'objectif des conduits qui ne compte que le joueur, un checkpoint par phase dans `special-cargo-brutal`, la règle « l'invite affichée a toujours raison » pour E, l'Interlude qui remplace toute crise ordinaire, le libellé « Récupérer les renseignements du synthétique », les libellés courts de la carte galactique sur téléphone, le libellé conservé de LV-895 et la mise en attente de la Forge.

**Franchise :** aucune option ci-dessous ne promet une fidélité « 1:1 ». Les questions distinguent l'**apparence documentée** (ce que montrent les œuvres de référence), l'**adaptation du projet** (ce que le jeu invente ou simplifie) et ce qui reste **à définir**.

## Synthèse

| Thème | Questions | Dont [BLOQUANT] |
| --- | --- | --- |
| 1. Narration et campagne principale | 12 | 0 |
| 2. Campagnes annexes et Partie III | 9 | 0 |
| 3. Hubs : Tantalus, Asphodèle, Port-Méridien | 9 | 0 |
| 4. Level design et 2,5D | 7 | 1 |
| 5. Combat et équilibrage | 9 | 2 |
| 6. Ennemis et castes | 6 | 0 |
| 7. Économie et progression | 6 | 0 |
| 8. Frontier Forge | 4 | 0 |
| 9. Interface, UX et mobile | 6 | 1 |
| 10. Accessibilité | 4 | 0 |
| 11. Audio | 5 | 0 |
| 12. Art sans génération d'image | 8 | 2 |
| 13. Localisation | 5 | 1 |
| 14. Sauvegardes | 5 | 0 |
| 15. Performance | 3 | 0 |
| 16. Diffusion et outils | 5 | 0 |
| **Total** | **103** | **7** |

---

## 1. Narration et campagne principale

### 1. Course APC de l'Acte V [PRODUCTION]
*Contexte : §5.6, étape 4 — « nouvelle course APC, à construire à partir du chapitre existant » ; `last-course-tantalus` pointe aujourd'hui vers `special-apc-convoy` (Acte III).*
- A. Un nouveau chapitre construit à partir du moteur de `special-apc-convoy`, avec son tracé et son état propres. **(Recommandé)** — la bible le demande, et l'Acte III garde sa sauvegarde et ses tests intacts.
- B. Rejouer le chapitre de l'Acte III avec un autre état de départ.
- C. Remplacer la course par une mission de siège au complexe.

### 2. Le pont qui cède [PRODUCTION]
*Contexte : §5.6, étape 5 — lâcher la remorque de fret ou celle des colons en retard.*
- A. Choix chronométré pendant la course, sans pause. **(Recommandé)** — le registre Action de l'Acte V vit de la pression du temps.
- B. Choix en pause, dans un cadre de dialogue.
- C. Pas de choix : la remorque de fret est perdue d'office.

### 3. Vega avec 5 pièces mais sans canal sûr [PRODUCTION]
*Contexte : §5.7.1 — cas non écrit, implémenté `[PROPOSÉ]` dans `src/story-dossier-v188.js` : Vega tient la colonie.*
- A. Valider : Vega tient la colonie (« Les vivants, sans preuve »). **(Recommandé)** — cohérent avec la règle « protéger avec 5 pièces ou plus » du §5.6.
- B. Vega cède le dépôt pour sauver l'équipage.
- C. Vega convoque une scène supplémentaire où Echo-9 doit la convaincre.

### 4. Seuil du face-à-face au quai [PRODUCTION]
*Contexte : §5.6, étape 8 — on gagne « si le dossier est assez solide » ; le seuil n'est pas chiffré.*
- A. 5 pièces, le même seuil que l'option *Transmettre*. **(Recommandé)** — une seule règle, lisible dans « DOSSIER QZ17 · n/7 ».
- B. 6 pièces, le seuil de l'identité du signataire.
- C. 5 pièces et palier *Rétablie* de la colonie.

### 5. Forme de l'épilogue [PLUS TARD]
*Contexte : §5.8 `[PROPOSÉ]` — épilogue jouable, sans combat, visite des trois lieux.*
- A. Épilogue jouable au Tantalus seulement, puis plans fixes pour Port-Méridien et Asphodèle. **(Recommandé)** — le Tantalus existe déjà ; les deux autres hubs ne sont pas construits.
- B. Visite jouable des trois lieux.
- C. Cinématique seule (CIN-90).

### 6. Missions de la station S1 à S4 [PRODUCTION]
*Contexte : §7.2, §5.7.1 — *Transmettre* exige Asphodèle reprise ; la pièce de CASSIUS (S2) est « pas encore jouable ».*
- A. Produire S1 à S4 comme missions, avant le hub Asphodèle. **(Recommandé)** — elles débloquent la fin « Le relais parle » et une pièce du dossier sans attendre le hub.
- B. Produire les missions et le hub ensemble.
- C. Reporter la station après l'Acte V.

### 7. Choix CASSIUS [PLUS TARD]
*Contexte : §5.7.1 et §38.12 — conserver ou effacer CASSIUS entre S2 et S4.*
- A. Choix définitif, pris une fois. **(Recommandé)** — les conséquences au conseil de guerre restent claires et testables.
- B. Choix réversible jusqu'à S4.
- C. Pas de choix : CASSIUS est toujours conservé.

### 8. Fil du dossier caviardé (`origin-20`) [PLUS TARD]
*Contexte : §2.4.3, §56.6 — quatre fragments placés dans des lieux qui n'existent pas encore.*
- A. L'intégrer avec le hub Asphodèle, comme proposé au §56.6. **(Recommandé)** — le placer ailleurs déplacerait des scènes de la bible.
- B. Placer provisoirement les fragments au Tantalus.
- C. Retirer le fil.

### 9. Premières quêtes du Tantalus [PRODUCTION]
*Contexte : §8.1 — 16 quêtes conçues, aucun ordre de production.*
- A. Les quêtes qui nourrissent le dossier et l'Acte V : DAVID-8R, Harlow, Rook, Vega. **(Recommandé)** — elles servent directement la fin de la campagne.
- B. Celles qui suivent le prologue : Velez, Kwan.
- C. Les 16 dans l'ordre des actes.

### 10. Recrues (Mara Voss, Nadia Bensaïd, Jonas Reed, Jun Seo) [PRODUCTION]
*Contexte : §8.3, §56.8 — recrutement de Nadia au palier *Rétablie* encore à faire.*
- A. Recrues jouables avec une apparence composée dans le créateur de personnage existant. **(Recommandé)** — aucune image nouvelle n'est nécessaire.
- B. Recrues seulement narratives tant qu'aucun art propre n'existe.
- C. Reporter le recrutement.

### 11. Textes `[PROPOSÉ]` du prologue et de l'Interlude [PRODUCTION]
*Contexte : §56.7, §56.9, §56.11 — réplique de Vega, 37 messages retardés, personnel du quai nord, réplique de Jun Park, CIN-03, CIN-40/41.*
- A. Les valider en bloc. **(Recommandé)** — ils sont joués, traduits et testés ; une retouche ponctuelle reste possible.
- B. Les relire un par un avant validation.
- C. Les réécrire.

### 12. Cinématiques restantes [PRODUCTION]
*Contexte : §10 — CIN-21, CIN-59, CIN-60, CIN-61, CIN-70 à CIN-73, CIN-80, CIN-90 `[PROPOSÉ]`.*
- A. Le même lecteur Canvas que le prologue, décors en primitives provisoires. **(Recommandé)** — le lecteur existe et suit le §10 (`src/story-cinematics-v188.js`).
- B. Attendre un art définitif.
- C. Remplacer par des cartons de texte.

---

## 2. Campagnes annexes et Partie III

### 13. Ouverture du chantier des campagnes annexes [PLUS TARD]
*Contexte : §54, étape 10 — « une fois le cœur du jeu solide » ; §13.5 — déblocage à la fin de la campagne principale.*
- A. Après le premier test de joueurs de la tranche verticale.
- B. Après l'Acte V et la fin jouable de la campagne principale. **(Recommandé)** — le déblocage des annexes dépend d'une fin qui n'existe pas encore.
- C. En parallèle, dès maintenant.

### 14. Ordre de production des annexes [PLUS TARD]
*Contexte : §20 `[PROPOSÉ]` — 1 → 5 → 2 → 3 → 4 ; le déblocage progressif est validé (§13.5), pas l'ordre de production.*
- A. Valider 1 → 5 → 2 → 3 → 4. **(Recommandé)** — on commence par les campagnes qui réutilisent le plus de chapitres jouables.
- B. Suivre l'ordre de déblocage : 1 et 4, puis 2, 3, 5.
- C. Une seule campagne annexe complète avant de décider la suite.

### 15. Déplacement des `worldId` des chapitres V131 [PRODUCTION]
*Contexte : §13.4, §44.2 — déplacement validé, calendrier non fixé ; les chapitres sont sur `world-05-lethe`.*
- A. En une fois, dès maintenant, avec une migration de sauvegarde.
- B. Campagne par campagne, au moment où chacune est produite. **(Recommandé)** — chaque déplacement est testé avec le parcours et la reprise de sa campagne.
- C. Ne pas déplacer et garder Cocyte comme monde d'accueil.

### 16. Ampleur d'une première version des annexes [PLUS TARD]
*Contexte : §13.1 — 7 à 9 h d'histoire par campagne.*
- A. Garder 7 à 9 h dès la première version.
- B. Livrer d'abord un arc jouable par campagne, puis les compléter. **(Recommandé)** — on teste le fil QZ17 et la carte galactique sans produire 40 h de contenu d'un coup.
- C. Réduire définitivement chaque campagne à 4 h.

### 17. Première mécanique nouvelle à créer [PRODUCTION]
*Contexte : §37.3 — 16 mécaniques ; les chantiers de reconstruction et les faux signaux du détecteur sont déjà faits (V188).*
- A. Largage de remorque et face-à-face sans tir. **(Recommandé)** — elles servent l'Acte V de la campagne principale.
- B. Capture d'organisme vivant et test biologique.
- C. Apesanteur et gravité faible.
- D. Jauge de contamination.

### 18. Archives MIRE fidèles et licence [PLUS TARD]
*Contexte : §26.10 — reproduire des œuvres « relève de la licence et du propriétaire ; cette bible ne le vérifie pas » ; Hadley's Hope validée comme première archive fidèle.*
- A. Produire d'abord les archives originales et confirmer la licence avant toute archive fidèle. **(Recommandé)** — la condition juridique n'est pas vérifiée.
- B. Commencer Hadley's Hope sans attendre.
- C. Abandonner les archives fidèles.

### 19. Protocoles MIRE [PLUS TARD]
*Contexte : §26.9 — un protocole à la fois, effets proposés à équilibrer.*
- A. Valider la règle « un seul, jamais obligatoire » et les effets proposés. **(Recommandé)** — ils restent modestes et lisibles.
- B. Deux protocoles équipables.
- C. Supprimer les protocoles ; les archives donnent seulement une pièce de renseignement.

### 20. Missions des sites frontaliers [PLUS TARD]
*Contexte : §25 — 32 contrats uniques sur les mondes `frontier-adaptation`.*
- A. Gabarits de missions génériques existants, avec un texte et un objectif propres à chaque site. **(Recommandé)** — 32 niveaux faits à la main ne sont pas réalistes avant les campagnes.
- B. Niveaux faits à la main.
- C. Reporter ces contrats.

### 21. Coût du voyage galactique [PRODUCTION]
*Contexte : §13.2, §38.14 — temps et carburant à créer ; ressource `fuel` existante (`src/save.js`).*
- A. Coût fixe par saut, en carburant et en jours, affiché avant le départ. **(Recommandé)** — simple à lire et à équilibrer.
- B. Coût proportionnel à la distance sur la carte.
- C. Voyage gratuit, seul le temps passe.

---

## 3. Hubs : Tantalus, Asphodèle, Port-Méridien

### 22. Méthode de construction d'Asphodèle [PRODUCTION]
*Contexte : §7.3 — « la Frontier Forge est le chemin naturel » ; la Forge est en attente.*
- A. Construire les modules directement dans le moteur du hub, comme les pièces du Tantalus. **(Recommandé)** — on ne dépend pas d'un outil mis en attente.
- B. Attendre la réouverture de la Forge.
- C. Un menu de navigation provisoire.

### 23. Plan général d'Asphodèle sans vue V3 [PRODUCTION]
*Contexte : §42.1, §40.4 — hub explorable complet validé ; le mode `ground-plane` V3 et les planches 8 directions n'existent pas.*
- A. Anneau et rayons en couloirs de profondeur (V2), modules en V1, tout parcouru à pied. **(Recommandé)** — la station reste explorable avec le moteur et l'art existants.
- B. Construire d'abord le mode V3.
- C. Plan en carte cliquable.

### 24. Gestion de Port-Méridien [PRODUCTION]
*Contexte : §43.1 — vue de gestion V3 proposée ; §56.8 — la table de reconstruction est jouable au Commandement.*
- A. Garder la table du Commandement et ajouter des quartiers visitables en V2, un par un. **(Recommandé)** — le système existe ; la V3 attend un moteur et un art absents.
- B. Construire la vue V3 complète.
- C. Garder la table seule.

### 25. Missions locales C1 à C5 [PRODUCTION]
*Contexte : §6.2, §56.8 — la validation d'un chantier passe aujourd'hui par n'importe quelle opération réussie sur Cocyte.*
- A. C1 puis C5 d'abord. **(Recommandé)** — C1 remplace la validation provisoire et C5 est la finale de l'Acte V.
- B. Dans l'ordre C1 à C5.
- C. Garder la validation provisoire.

### 26. Console de reconstruction physique [PRODUCTION]
*Contexte : §56.8 — console dans la salle commune ou les quartiers, encore à faire.*
- A. Une console au Commandement du Tantalus, et une au quai de Port-Méridien. **(Recommandé)** — deux lieux qui existent déjà et que le joueur traverse.
- B. Seulement dans la salle commune de la colonie, quand elle existera.
- C. Pas de console : la table reste dans l'interface.

### 27. Valeurs `[PROPOSÉ]` de la reconstruction [PRODUCTION]
*Contexte : §56.8 — ouverture après QZ-18, coûts par niveau, +3 de stabilité, +150 crédits et +10 alliage au palier *Autonome*.*
- A. Valider les règles et attendre les tests pour les chiffres. **(Recommandé)** — les règles sont cohérentes avec le §6.3 ; les chiffres se règlent sans nouvelle décision.
- B. Ouvrir la reconstruction seulement après C2, comme au §6.3.
- C. Revoir les coûts dès maintenant.

### 28. Habitants nommés de Port-Méridien [PLUS TARD]
*Contexte : §43.3 — 12 habitants nommés à terme.*
- A. Wren, Ferro et Sarrazin d'abord, puis des habitants génériques. **(Recommandé)** — ils existent déjà dans le récit et les scènes.
- B. Les 12 dès le premier quartier.
- C. Aucun habitant nommé de plus.

### 29. Vie de la colonie : nuit et événements [PLUS TARD]
*Contexte : §43.3 — cycle jour/nuit, panne, réfugiés, intrusion, tempête, visite de la compagnie.*
- A. Un événement possible par cycle entre deux missions, sans cycle jour/nuit pour l'instant. **(Recommandé)** — le temps de la colonie avance déjà entre les missions (§45.1).
- B. Cycle jour/nuit complet.
- C. Aucun événement.

### 30. Commerce Crucible d'Asphodèle [PLUS TARD]
*Contexte : §7.3, §42.2 — marché de l'anneau et commerce de pièces et d'armes.*
- A. Réutiliser l'économie existante (crédits et ressources) avec un stock limité par cycle. **(Recommandé)** — aucun nouveau système de monnaie.
- B. Troc contre ressources seulement.
- C. Pas de commerce.

---

## 4. Level design et 2,5D

### 31. Prochaines salles en profondeur [BLOQUANT]
*Contexte : §56.12 — « prochaines candidates : d'autres soutes ou cales de mission, après évaluation de QZ-17 » ; 7 pièces du Tantalus validées en V2 (§41.3).*
- A. D'autres soutes ou cales de mission, après une évaluation jouée de la cale QZ-17. **(Recommandé)** — c'est la suite prévue par la bible et le combat en profondeur y est déjà branché.
- B. Le briefing et le mess du Tantalus.
- C. La baie véhicules et la logistique.
- D. Aucune avant le test de joueurs.

### 32. Crises à bord dans les salles en profondeur [PLUS TARD]
*Contexte : `specs/001-salles-hybrides-2d-25d/spec.md` — aucune crise n'est placée dans une salle 2,5D tant que le combat en profondeur n'existe pas au hub.*
- A. Garder cette exclusion. **(Recommandé)** — le combat en profondeur n'est testé qu'en mission.
- B. Autoriser les crises au hangar.

### 33. Valeurs de profondeur [PRODUCTION]
*Contexte : §56.12 — tir à ±22, attaques à ±24, recalage de 30 %, 80 unités au hangar, allée de 36 dans la cale.*
- A. Les garder jusqu'au test de joueurs. **(Recommandé)** — elles sont testées sur le moteur réel ; seul le ressenti reste à mesurer.
- B. Élargir la bande de tir.
- C. Réduire la profondeur du hangar.

### 34. Ascenseur de service « B » de QZ-17 [PRODUCTION]
*Contexte : §56.12, limites — preuve du fragment de sceau, ascenseur non placé ; `AGENTS.md` demande qu'un accès corresponde à l'architecture visible.*
- A. Placer un ascenseur physique et accessible. **(Recommandé)** — la preuve désigne un lieu qui doit exister.
- B. Remplacer la mention par un accès qui existe (l'ascenseur de coque).
- C. Laisser tel quel.

### 35. Rôdeurs dans la cale [PRODUCTION]
*Contexte : §56.12, limites — « le nombre de rôdeurs peut dépasser trois ».*
- A. Plafonner à trois dans la cale. **(Recommandé)** — la profondeur se lit mal avec trop d'ennemis superposés.
- B. Laisser le directeur de tension décider.

### 36. Annonce des salles en profondeur [PLUS TARD]
*Contexte : §56.12 — bandeau « SALLE EN PROFONDEUR · W/S : AVANCER / RECULER ».*
- A. Garder le bandeau à la première entrée, puis un pictogramme discret. **(Recommandé)** — on apprend la règle sans écran technique répété.
- B. Garder le bandeau à chaque entrée.
- C. Le retirer.

### 37. Rues de défense de Port-Méridien en profondeur [PLUS TARD]
*Contexte : §43.1 — missions de défense en V2 (C1, C5, contrats locaux).*
- A. Décider après le test de la cale QZ-17. **(Recommandé)** — les hordes en profondeur n'ont pas encore été mesurées.
- B. Les prévoir en V2 dès maintenant.
- C. Les garder en V1.

---

## 5. Combat et équilibrage

### 38. Surplus de recherche de `pair-030-mire` [BLOQUANT]
*Contexte : chasse aux bugs (parcours `scripts/verify-bugfix-playthrough-v188.mjs`) — la mission verse 7 points de recherche de plus que les missions comparables.*
- A. Ramener le gain au barème des missions comparables. **(Recommandé)** — un écart isolé fausse l'économie de la recherche.
- B. Garder le surplus comme récompense propre à cette mission, et l'annoncer au briefing.
- C. Convertir le surplus en crédits.

### 39. Difficulté de `special-cargo-brutal` avec le P-5000 [BLOQUANT]
*Contexte : chasse aux bugs — phase de pilotage du P-5000 trop punitive ; un checkpoint par phase est déjà décidé.*
- A. Réduire la pression ennemie pendant la phase P-5000 (nombre ou cadence), sans toucher au véhicule. **(Recommandé)** — le P-5000 sert aussi dans d'autres chapitres.
- B. Renforcer le P-5000 (blindage, vitesse).
- C. Garder la difficulté et l'annoncer au briefing.
- D. N'adoucir qu'en difficulté `story`.

### 40. Bornes de la difficulté à la carte [PRODUCTION]
*Contexte : §55.4 — identifiant `custom` livré en P1-4 ; bornes non fixées dans la bible.*
- A. De 50 % à 150 % du niveau `standard` pour chaque réglage. **(Recommandé)** — assez large pour l'accessibilité, sans casser les rencontres écrites.
- B. De 25 % à 200 %.
- C. Trois crans par réglage (faible, normal, fort).

### 41. Munitions en registre Horreur [PRODUCTION]
*Contexte : §45.1 — « Horreur : peu d'ennemis, munitions rares, fuite » ; la rareté n'est pas chiffrée.*
- A. −30 % de munitions trouvées en Horreur, modulé par la difficulté. **(Recommandé)** — la règle du registre devient visible sans rendre les missions impossibles.
- B. −50 %.
- C. Pas de modification : les niveaux écrits suffisent.

### 42. Mort définitive pour une nouvelle partie [PRODUCTION]
*Contexte : §55.5, P1-2 — option choisie à la création ; les anciennes parties gardent la mort activée.*
- A. Désactivée par défaut (blessures et convalescence). **(Recommandé)** — un premier joueur ne perd pas un personnage d'histoire sans l'avoir choisi.
- B. Activée par défaut.
- C. Aucun choix par défaut : le joueur doit choisir.

### 43. Valeurs du directeur de tension [PLUS TARD]
*Contexte : §56.4 `[PROPOSÉ]` — pic à 85, relâche 30/20/10 s, multiplicateurs 0,5/0,8/1,2.*
- A. Les garder jusqu'au test de joueurs. **(Recommandé)** — seule une mesure humaine dira si la peur fonctionne.
- B. Allonger les relâches dès maintenant.

### 44. Capacités des origines [PLUS TARD]
*Contexte : §56.4, §56.6 — 10 à 15 % quand elles sont chiffrées ; 03, 11 et 16 réinterprétées.*
- A. Valider les 19 valeurs et les trois réinterprétations. **(Recommandé)** — elles sont modestes et raccordées.
- B. Revoir 03, 11 et 16.

### 45. Calendrier de la coop locale jusqu'à cinq [PLUS TARD]
*Contexte : §55.2, étape 1 ; hors P0/P1 (§56.3).*
- A. Après le test de joueurs et l'Acte V. **(Recommandé)** — c'est le lot le plus lourd et il dépend des autres (§55.9).
- B. Juste après la tranche verticale.

### 46. Mesure de la coop en ligne [PLUS TARD]
*Contexte : §55.2, étape 3 — mesurer latence et quotas de Supabase Realtime avant de s'engager.*
- A. Autoriser un prototype de mesure isolé, sans branchement au jeu. **(Recommandé)** — on décide sur des chiffres, sans risque pour la sauvegarde.
- B. Reporter toute coop en ligne.
- C. Passer directement au pair à pair (WebRTC).

---

## 6. Ennemis et castes

### 47. Enfants de l'Hôte Parfait [PRODUCTION]
*Contexte : §1.5 — renommés, mais « les visuels actuels sont adaptés d'un concept du jeu d'origine : l'art doit être refait pour être original » ; pas de génération d'image.*
- A. Les retirer du tirage des ennemis jusqu'à un art original. **(Recommandé)** — renommer ne suffit pas, et aucun art de remplacement n'est prévu.
- B. Les redessiner en primitives Canvas comme adaptation du projet.
- C. Garder les visuels actuels.

### 48. Noms français des castes [PRODUCTION]
*Contexte : `src/group-glossary-v188.js` — noms de castes `[PROPOSÉ]`, formulation du projet et non terminologie de la franchise.*
- A. Les valider. **(Recommandé)** — ils sont déjà affichés et traduits ; une retouche reste possible.
- B. Garder les noms anglais des castes en français aussi.
- C. Les relire un par un.

### 49. Reine du dépôt (Acte V) [PRODUCTION]
*Contexte : §5.6, §37.2 — Reine `[À CRÉER]`, nourrie par les livraisons QZ17.*
- A. Variante de la Reine existante, avec un comportement de poursuite propre. **(Recommandé)** — on réutilise l'art et on documente le comportement propre à la caste (`AGENTS.md`).
- B. Nouvelle créature.
- C. Pas de Reine : la poursuite est faite par une horde.

### 50. Castes suivantes à spécialiser [PRODUCTION]
*Contexte : §53.3, P1-1 — drone (recul, plafond), rôdeur et embusqué sont faits.*
- A. Guerrier et cracheur. **(Recommandé)** — ce sont les castes les plus fréquentes après celles déjà traitées.
- B. Facehugger et chestburster.
- C. Crusher et Reine.

### 51. Admissibilité des castes en profondeur [PRODUCTION]
*Contexte : §56.12 — Reine et Crusher, trop larges, sont reportés au pont de service de QZ-17.*
- A. En faire une règle générale : une caste trop large pour les allées est reportée hors de la salle en profondeur. **(Recommandé)** — la règle vérifie l'admissibilité avant la logique commune (`AGENTS.md`).
- B. Décider salle par salle.

### 52. Apparitions brèves des Yautja [PLUS TARD]
*Contexte : §21.2, §22.16 — traces surtout, apparitions brèves validées ; la règle de combat n'est pas écrite.*
- A. Le chasseur ne peut pas être combattu ; il disparaît s'il est visé. **(Recommandé)** — cela garde l'apparition brève et ne crée pas de boss imprévu.
- B. Il peut être blessé et fuit.
- C. Il peut être tué.

---

## 7. Économie et progression

### 53. Tableau « ce que le joueur gagne à chaque heure » [PRODUCTION]
*Contexte : §53.5 — à faire.*
- A. L'établir à partir des données actuelles des missions et du compte rendu. **(Recommandé)** — il révèle les écarts comme celui de `pair-030-mire`.
- B. L'établir après le test de joueurs.

### 54. Acquis de la nouvelle partie + [PLUS TARD]
*Contexte : §55.8 — « ce qui passe d'une partie à l'autre est à décider ».*
- A. Origine, apparence et archives MIRE débloquées. **(Recommandé)** — on garde l'identité du joueur sans rompre l'équilibre de l'arsenal.
- B. A, plus une partie de l'arsenal.
- C. Rien : seulement les cinématiques revisitables.

### 55. Score par mission [PLUS TARD]
*Contexte : §53.7 — à faire.*
- A. Pas de score chiffré : un bilan narratif (survivants, pièces, pertes). **(Recommandé)** — un score pousse au jeu d'action, contre le registre Horreur.
- B. Score et rang par mission.
- C. Score seulement pour les archives MIRE.

### 56. Modificateurs de partie [PLUS TARD]
*Contexte : §53.7 — cauchemar, mort définitive, ressources rares.*
- A. Ajouter seulement « ressources rares » comme réglage de difficulté à la carte. **(Recommandé)** — les deux autres existent déjà.
- B. Un écran de modificateurs séparé.

### 57. Système de prélèvement biologique [PLUS TARD]
*Contexte : §56.6 — `origin-16` donne +1 échantillon `pathogen` en attendant « un vrai système de prélèvement ».*
- A. Le créer avec la campagne annexe 4 (*Fièvre noire*). **(Recommandé)** — c'est là que la contamination et le test biologique servent.
- B. Le créer maintenant.
- C. Garder la règle actuelle.

### 58. Détail des récompenses au compte rendu [PLUS TARD]
*Contexte : commit `9d52d96` — le compte rendu montre ce qui est réellement versé.*
- A. Afficher en plus la part due à la difficulté et à l'origine, repliée par défaut. **(Recommandé)** — le joueur comprend ses gains sans écran technique.
- B. Garder seulement le total versé.

---

## 8. Frontier Forge

### 59. Quand rouvrir la Forge [PLUS TARD]
*Contexte : la Forge est en attente par décision du propriétaire ; §7.3 la cite pour Asphodèle.*
- A. Après le test de joueurs de la tranche verticale, au lancement d'Asphodèle. **(Recommandé)** — c'est le premier chantier où beaucoup de salles sont à construire.
- B. Avec les campagnes annexes.
- C. Pas avant la sortie.

### 60. Comment la rouvrir : salles en profondeur [PLUS TARD]
*Contexte : §56.12 — « Frontier Forge n'édite pas les salles en profondeur ».*
- A. Ajouter l'édition en profondeur avant toute réouverture. **(Recommandé)** — une Forge qui ne voit pas la profondeur produirait des salles incomplètes.
- B. Rouvrir en 2D seulement.

### 61. Espaces de travail Forge existants [PLUS TARD]
*Contexte : `AGENTS.md` distingue l'espace de travail Forge de la campagne et de la reprise.*
- A. Les conserver tels quels, avec une migration additive à la réouverture. **(Recommandé)** — aucune perte de travail.
- B. Repartir d'un espace vide.

### 62. Public de la Forge [PLUS TARD]
*Contexte : `AGENTS.md` — les informations techniques restent dans les outils de développement.*
- A. Outil de développement seulement. **(Recommandé)** — les écrans du joueur gardent la présentation de l'univers.
- B. Éditeur proposé aux joueurs.

---

## 9. Interface, UX et mobile

### 63. Rail des phases d'insertion sur téléphone [BLOQUANT]
*Contexte : chasse aux bugs — sur téléphone, le rail des phases (`src/mission-insertion-ui-v62.js`) cache la phase active.*
- A. Faire défiler automatiquement le rail jusqu'à la phase active. **(Recommandé)** — on garde toutes les phases et la phase active reste visible.
- B. Sur téléphone, n'afficher que la phase active et un compteur « 2/5 ».
- C. Rail vertical sur téléphone.

### 64. Audit « aucun écran technique pour le joueur » [PRODUCTION]
*Contexte : §53.9 — à faire.*
- A. Le faire avant le premier test de joueurs. **(Recommandé)** — un identifiant visible gâche la première impression.
- B. Après le test.

### 65. Carte du Tantalus pour le joueur [PRODUCTION]
*Contexte : §53.9 — « Prêt » en conception (§41).*
- A. Carte simple des ponts, ouverte depuis la pause, avec la position du joueur. **(Recommandé)** — elle aide sans changer le moteur du hub.
- B. Pas de carte.

### 66. Format du journal de bord [PRODUCTION]
*Contexte : `src/narrative-archives-ui-v68.js` — format de journal `[PROPOSÉ]` (année, jour de l'année).*
- A. Le valider. **(Recommandé)** — il évite les dates ISO techniques et reste dans l'univers.
- B. Date complète en clair selon la langue.

### 67. Niveau de soutien du téléphone [PLUS TARD]
*Contexte : §45.1 — PC clavier-souris de référence ; tactile secondaire.*
- A. Jouable au tactile, avec correctifs de lisibilité, sans optimisation dédiée. **(Recommandé)** — l'effort reste sur la plateforme de référence.
- B. Tablette seulement.
- C. Optimisation complète du téléphone.

### 68. Manette [PLUS TARD]
*Contexte : §53.8 — manette présente, qualité non évaluée.*
- A. Une passe de vérification sur la tranche verticale. **(Recommandé)** — on connaît l'état réel avant de promettre la manette.
- B. Laisser en l'état.

---

## 10. Accessibilité

### 69. Mode daltonien : panneaux HTML [PRODUCTION]
*Contexte : §56.10 — reste à faire : signaux d'interface HTML et autres codes couleur du canvas.*
- A. Étendre la palette Okabe–Ito aux panneaux et aux autres signaux. **(Recommandé)** — la décision « tout » (§45.1) n'est pas encore tenue.
- B. Limiter aux portes et au déplacement.

### 70. Étendue des sous-titres des sons [PRODUCTION]
*Contexte : P1-5 — sous-titres des sons importants.*
- A. Tous les sons de menace et d'état (détecteur, cris, alarmes, portes). **(Recommandé)** — ce sont ceux qui décident d'une action.
- B. Seulement les alarmes et le détecteur.

### 71. Lecteur d'écran [PLUS TARD]
*Contexte : §55.1 — vérification mobile et lecteur d'écran ouverte.*
- A. Menus, Système et compte rendu lisibles au lecteur d'écran. **(Recommandé)** — le jeu en Canvas ne peut pas tout exposer.
- B. Pas de soutien.

### 72. Option « moins de sursauts » [PLUS TARD]
*Contexte : §56.4 — fausses alertes du détecteur en Horreur et Tension.*
- A. Un réglage de la difficulté à la carte qui coupe les fausses alertes. **(Recommandé)** — utile aux joueurs sensibles, sans changer les registres.
- B. Pas d'option.

---

## 11. Audio

### 73. Musique pendant la pause [PLUS TARD]
*Contexte : conception actuelle — la musique continue pendant la pause.*
- A. La garder telle quelle.
- B. L'atténuer pendant la pause et couper les bruitages. **(Recommandé)** — la pause se lit clairement sans silence brutal.
- C. La couper.

### 74. Musiques en attente des morceaux Flow [PRODUCTION]
*Contexte : §53.2, P0-3 — les emplacements sans fichier rejouent la musique du menu.*
- A. Garder la musique du menu partout.
- B. Synthétiser des boucles originales provisoires pour l'alerte et le boss, hors ligne. **(Recommandé)** — la musique du menu casse la tension d'une alerte ; le dépôt sait déjà synthétiser des sons.
- C. Silence dans ces emplacements.

### 75. Sons de voix courts [PRODUCTION]
*Contexte : §45.1 — « texte + portraits, sons de voix courts, pas de doublage ».*
- A. Un grain vocal synthétisé par personnage, joué au début d'une réplique. **(Recommandé)** — il distingue les voix sans doublage ni échantillon externe.
- B. Aucun son de voix.

### 76. Ambiances des pièces [PLUS TARD]
*Contexte : §38.13 — une ambiance par pièce du Tantalus (35) et par module.*
- A. Une ambiance par secteur, pas par pièce. **(Recommandé)** — beaucoup moins de boucles pour un effet proche.
- B. Une par pièce.

### 77. Provenance des morceaux Flow [PRODUCTION]
*Contexte : §53.2 — `LICENSE_NOTICE.md` décrit une synthèse hors ligne ; il faudra y mentionner l'outil.*
- A. Ajouter une ligne par morceau livré (outil, date, prompt du §47-51). **(Recommandé)** — la provenance reste vérifiable morceau par morceau.
- B. Une mention globale.

---

## 12. Art sans génération d'image

### 78. Portraits de Wren, Ferro et Sarrazin [BLOQUANT]
*Contexte : `src/story-cinematics-v188.js`, `src/npc-dialogue-portraits-v168.js` — ces trois personnages n'affichent que leurs initiales ; la génération d'image est exclue.*
- A. Garder les initiales.
- B. Portraits en primitives Canvas avec un signe distinctif : gilet haute visibilité pour Wren, brassard à croix pour Ferro, écharpe de doyenne pour Sarrazin. **(Recommandé)** — cohérent avec les décors provisoires et avec les tenues déjà décrites au §56.12.
- C. Composer leurs portraits avec les pièces du créateur de personnage.
- D. Silhouette neutre identique pour tous.

### 79. Règle générale pour l'art provisoire [BLOQUANT]
*Contexte : §53.4, §56.11 — décors, terminal et conteneurs en primitives ; génération d'image exclue.*
- A. Primitives Canvas pour tout nouvel élément, avec échelle et proportions vérifiées. **(Recommandé)** — c'est la méthode des lots V188, testée par les passes de cohérence.
- B. Dessin à la main, hors outil, fourni par le propriétaire.
- C. Réutiliser seulement l'art existant et ne rien ajouter.

### 80. Mise à jour du §45.1 « Source des images » [PRODUCTION]
*Contexte : §45.1 indique « génération par IA, faite par le propriétaire » ; elle est désormais exclue.*
- A. Remplacer la ligne : pas de génération ; art en primitives ou fourni à la main. **(Recommandé)** — la bible doit dire la règle en vigueur.
- B. Noter une exclusion temporaire et garder les listes de commandes d'images.

### 81. Portraits d'archive des 20 origines [PRODUCTION]
*Contexte : §2.4.4 — 20 portraits prévus par génération.*
- A. Une fiche de dossier typographique (matricule, tampons, caviardage), sans photo. **(Recommandé)** — elle ne montre pas le visage du joueur, comme le prévoyait la bible.
- B. Silhouette en primitives.

### 82. Terminal de sauvegarde [PRODUCTION]
*Contexte : P0-8 — terminal placeholder dessiné au checkpoint sécurisé ; art définitif à produire.*
- A. Le garder en primitives, avec une passe de cohérence (échelle, lumière, état). **(Recommandé)** — il fonctionne et suit la règle 79.
- B. Attendre un art définitif.

### 83. Planches 8 directions et vue V3 [PLUS TARD]
*Contexte : §40.4, §44.1 — planches 8 directions pour chaque personnage présent en V2/V3.*
- A. Reporter la V3 tant qu'aucune source d'art n'existe. **(Recommandé)** — les planches 8 directions ne se font pas en primitives à une qualité acceptable.
- B. Faire la V3 avec des silhouettes simplifiées.

### 84. Expressions des portraits [PLUS TARD]
*Contexte : §53.6 — 3 expressions par membre d'équipage.*
- A. Les reporter ; l'expression passe par le texte et le cadre (couleur, neige radio). **(Recommandé)** — sans nouvelle image, c'est le seul moyen fiable.
- B. Variantes de cadre seulement.

### 85. Chapitres à art en dette [PRODUCTION]
*Contexte : §37.2, §53.4 — boss et créatures `[DETTE]` dans les chapitres V131.*
- A. Les signaler « en préparation » au joueur tant que leur art est en dette. **(Recommandé)** — on évite la mauvaise impression sans retirer le contenu.
- B. Les masquer.
- C. Les laisser tels quels.

---

## 13. Localisation

### 86. Noms propres en anglais [BLOQUANT]
*Contexte : catalogue `src/i18n-en-catalog-v185.js` — Orphée, Hiémale, Asphodèle et Port-Méridien sont gardés tels quels en anglais.*
- A. Les garder tels quels, avec accents. **(Recommandé)** — ce sont des noms originaux du projet, déjà validés (§45) ; les traduire créerait deux identités.
- B. Les garder sans accents (Orphee, Hiemale…).
- C. Les traduire (Orpheus, Asphodel, Meridian Port…).

### 87. Format des nombres [PRODUCTION]
*Contexte : commit `e935345` — nombres et dates formatés selon la langue.*
- A. Format de la langue (`1 600` en français, `1,600` en anglais), sans abréviation. **(Recommandé)** — lisible et déjà en place.
- B. Abréviations au HUD (`1,6 k`).
- C. Format unique pour les deux langues.

### 88. Panneaux dont le texte est dans l'image [PRODUCTION]
*Contexte : §55.1 — « panneaux dont les lettres sont intégrées aux images » restent ouverts.*
- A. Les redessiner en texte Canvas traduisible. **(Recommandé)** — c'est déjà la méthode des panneaux FR/EN du quai (§56.12).
- B. Les laisser en français.

### 89. Relecture anglaise [PLUS TARD]
*Contexte : §55.1 — relecture par un anglophone ouverte.*
- A. Une relecture de la tranche verticale avant toute présentation publique. **(Recommandé)** — c'est la partie la plus vue.
- B. Une relecture complète à la fin.

### 90. Autres langues [PLUS TARD]
*Contexte : §45.1 — français et anglais.*
- A. Rester en français et anglais. **(Recommandé)** — le catalogue anglais n'est pas encore relu.
- B. Prévoir une troisième langue.

---

## 14. Sauvegardes

### 91. Valeurs de la sauvegarde hors combat [PLUS TARD]
*Contexte : §56.4 — 640 px sans ennemi, 8 s sans dégât, terminal de 3 s.*
- A. Les garder jusqu'au test de joueurs. **(Recommandé)** — elles se règlent sans nouvelle décision.
- B. Rendre le terminal instantané.

### 92. Levée de protection pour les prochains lots [PRODUCTION]
*Contexte : §55, §56.1 — `src/save.js` est protégé ; levée accordée pour le lot V188.*
- A. Une levée par lot, avec son reçu d'audit, comme V188. **(Recommandé)** — chaque changement de sauvegarde reste tracé.
- B. Une levée générale pour la suite.

### 93. Conflit de synchronisation entre appareils [PLUS TARD]
*Contexte : §45.2 — synchronisation via Supabase (`src/cloud-sync-v119.js`) ; la règle à présenter au joueur n'est pas décrite dans la bible.*
- A. Montrer les deux sauvegardes (date, lieu, progression) et laisser choisir. **(Recommandé)** — aucune partie n'est écrasée sans accord.
- B. Garder toujours la plus récente.

### 94. Emplacements de partie [PLUS TARD]
*Contexte : §55.8 — la nouvelle partie + crée un nouveau profil.*
- A. Trois emplacements de partie. **(Recommandé)** — de la place pour une partie, une nouvelle partie + et un essai.
- B. Un seul emplacement.
- C. Sans limite.

### 95. Export local de sauvegarde [PLUS TARD]
*Contexte : `AGENTS.md` — préserver les sauvegardes existantes.*
- A. Ajouter un export et un import de fichier dans Système. **(Recommandé)** — une sécurité pour les testeurs, hors du nuage.
- B. Non.

---

## 15. Performance

### 96. Machine et cible de référence [PRODUCTION]
*Contexte : `AGENTS.md` — comparer la même scène et la même configuration ; aucune cible n'est fixée.*
- A. 60 images par seconde sur un PC portable de milieu de gamme, dans un navigateur Chromium. **(Recommandé)** — c'est la plateforme de référence (§45.1).
- B. 30 images par seconde.

### 97. Scènes de mesure [PRODUCTION]
*Contexte : `docs/development/GAMEDEV_GUIDANCE.md`, `performance-optimization`.*
- A. Trois scènes fixes : la cale de QZ-17, le hangar en profondeur et une horde de C-12. **(Recommandé)** — elles couvrent la profondeur, le hub et la charge maximale.
- B. Une scène par chantier, au cas par cas.

### 98. Qualité réduite sur téléphone [PLUS TARD]
*Contexte : §56.11 — grain, vignettage, pluie animée.*
- A. Un réglage « effets réduits », proposé par défaut sur téléphone. **(Recommandé)** — on garde l'image sur PC.
- B. Pas de réglage.

---

## 16. Diffusion et outils

### 99. Mode de diffusion [PLUS TARD]
*Contexte : §45.1, §53.10 — entre gratuite publique et privée, non tranché ; `LICENSE_NOTICE.md` indique un dépôt « préparé pour un titulaire de licence ».*
- A. Gratuite publique.
- B. Privée, pour un cercle de testeurs, jusqu'à une vérification de la licence. **(Recommandé)** — la condition de propriété intellectuelle n'est pas vérifiée.
- C. Privée sans limite de durée.

### 100. Premier test de joueurs [PRODUCTION]
*Contexte : §53.1, §53.11 — protocole prêt, première session bloquée par la tranche, désormais jouable (P0-1).*
- A. L'organiser maintenant sur la tranche verticale, avec 3 à 5 joueurs. **(Recommandé)** — beaucoup de valeurs `[PROPOSÉ]` attendent ce test.
- B. Après l'Acte V.

### 101. Numéro de version publique [PLUS TARD]
*Contexte : `AGENTS.md` — un suffixe `v188` identifie un module, pas la version publique.*
- A. Une version publique séparée (`0.x`), indépendante des suffixes de modules. **(Recommandé)** — elle évite de confondre lots internes et sorties.
- B. Garder V188 comme version publique.

### 102. Présentation publique [PLUS TARD]
*Contexte : §53.10 — page, bande-annonce, captures.*
- A. Après le test de joueurs et la relecture anglaise. **(Recommandé)** — les captures doivent venir d'une tranche validée.
- B. Dès maintenant.

### 103. Spec Kit pour les prochains chantiers [PLUS TARD]
*Contexte : `.ai-tools/README.md`, `specs/001-*`, `specs/002-*`.*
- A. Une feature Spec Kit pour chaque chantier majeur : Acte V, station S1–S4, prochaine salle en profondeur. **(Recommandé)** — les deux features livrées ont tenu leur périmètre.
- B. Seulement pour Asphodèle.
- C. Ne plus l'utiliser.

## Décisions du propriétaire (2026-11-22) — appliquées

Décisions reçues hors questionnaire après la course du convoi de l'Acte V (`c042b565`) et les niveaux dédiés de la colonie (`79df744c`). Elles sont appliquées sur la base `79df744c` ; le détail des règles et des valeurs est dans la bible (§5.7.1, §5.11 « Course du convoi », §6.4 « Niveaux dédiés C1-C4 ») et dans `AUDIT_CONTENU_V188.md`.

| # | Décision | Application | Reste ouvert |
| --- | --- | --- | --- |
| D1 | **Le M577 à l'échelle** dans toutes les missions APC (course du convoi et autres modes APC), au lieu des 190 px de l'ancienne planche d'action | `src/m577-scale-v188.js` : 8,8 m **[À VÉRIFIER]** à 51 px/m, soit 449 px ; boîte de collision de 449 × 112 px (coque de 2,2 m **[PROPOSÉ]**) ; substitut Canvas derrière l'emplacement nommé `m577-mission-side-scale` (aucun fichier demandé) ; deux roues par flanc sur la ligne des pieds, attelage arrière à 24 px, tourelle de toit arrière, cabine derrière le nez. Appliqué à *Dernier départ*, *La Reine du dépôt* et au convoi de l'Acte III (`special-apc-convoy`, avec ses voies). Remorques : 4,6 m **[PROPOSÉ]** (235 px), sur l'attelage. Cadrage : convoi entier dans la vue de 1 280 px ; M577 de l'Acte III à x 805 (nez à gauche) au lieu de 955 | La longueur n'est documentée dans aucune source du projet ; les sources extérieures divergent (AvP Central : 9,22 m tourelle rentrée, 8,58 m tourelle levée ; wiki de fans Weyland-Yutani : environ 7 m ; aucune ne cite de source primaire). La valeur de 8,8 m est celle de la question au propriétaire. Le M577 conduit librement dans les niveaux ordinaires et le M577 descendu du UD-4L quand il n'est pas le véhicule du joueur gardent leurs tailles (190 px et 236 px) : ce ne sont pas des missions APC (levé par D5) |
| D2 | **La perte de la remorque de fret compte** : les conteneurs perdus ne sont plus rapportés | `act5FreightLossV188`, `act5ContainersBroughtBackV188`, `act5RestitutionHeldV188` (`src/story-act5-v188.js`). *Céder le dépôt* n'est plus présenté comme « restitution » si le fret a été lâché au pont (choix ou délai) ou perdu sur la route : le coût moral (stress +10) s'applique une fois, au passage à la fin, et le champ additif `act5.restitutionLostV188` l'enregistre. La fin et l'épilogue mentionnent le fret perdu (FR + EN). Au conseil, une note précise que les conteneurs voyagent dans la remorque de fret | Le coût moral reprend la valeur [PROPOSÉ] existante de *Céder* sans restitution |
| D3 | **La Reine atteint toujours le carrefour** : blessée, déséquilibrée et repoussée pendant la poursuite, elle ne peut mourir qu'au face-à-face du carrefour du port | Machine à états dédiée conservée, état `recoil` ajouté (repoussée de 8 m en 0,8 s **[PROPOSÉ]**, retour à la traque) ; plancher de santé à 30 % **[PROPOSÉ]** tant que le convoi n'est pas arrêté au carrefour ; mort seulement en phase `stand` | — |
| D4a | C3 : **Noor Okafor** n'est pas à la fois équipière et figure de l'infirmerie | Retirée de l'escouade pour C3 seulement (rétablie ensuite, l'opération n'est pas modifiée) ; réplique FR/EN « Noor Okafor reste à l'infirmerie pour le contrôle biologique… » | Les écrans de préparation de l'opération listent encore Noor parmi l'équipe affectée (levé par D7) |
| D4b | Le **M577 du joueur** n'apparaît pas dans les rues de C1, C3, C4 | Véhicule rangé au démarrage (comme dans les gabarits de vaisseau), insertion et extraction à pied (couche UD-4L et cinématique d'insertion) | Le M577 garé au quai de C3, qui a amené les rescapés, reste un décor (primitive du largage, 236 px) : à confirmer s'il doit disparaître ou passer à l'échelle (levé par D6) |
| D4c | C4 : fermer la galerie technique, **second chemin** vers le rassemblement ; les conduits deviennent obligatoires | Grille de service soudée dans la galerie (entre l'échelle de la rue B et celle de la sécurité, du sol au plafond), et porte du toit soudée contre la structure du bloc des communications : le toit permettait lui aussi de contourner les conduits malgré le « cul-de-sac » décrit. Raison visible (emplacements `colony-utility-grate-sealed`, `colony-roof-hatch-sealed`) et invite. Contrôle logique (`colonyC4AccessV188`) et physique (marche et sauts) | Le chalumeau de la galerie reste accessible (à l'ouest de la grille) : il ouvre les conduits |
| D4d | C1 : **adoucir la perspective** excessive aux deux bouts du couloir de profondeur | Plafond de perspective du pont (`deckPerspectiveSpan` 640 px **[PROPOSÉ]**) : au-delà d'un demi-écran du centre, les joints gardent l'inclinaison qu'ils ont à cette distance (≈ 85 px au lieu de ≈ 296 px aux extrémités) ; les autres cales sont inchangées | — |

Aucune de ces décisions ne certifie une fidélité « 1:1 ».

## Face-à-face sans tir (2026-11-22, spec 010) — décisions par défaut et questions

Lot de la première mécanique nouvelle de Q17 A. Valeurs et règles appliquées par défaut (option recommandée), réglables sans nouvelle décision ; détail dans la bible (§5.11, « Audience au quai ») et `specs/010-face-a-face/`.

### Q-010-1. Le quai peut-il être perdu avec 5 pièces ou plus ? [PRODUCTION]
*Contexte : Q4 A fixait le retrait des commandos à 5 pièces, sans jeu. L'audience garde ce seuil comme borne (impossible sous 5, gagnable à partir de 5), mais une audience mal menée est perdue même avec 7 pièces.*
- A. Oui : l'audience décide, le dossier ouvre seulement la possibilité. **(Appliqué par défaut)** — c'est le sens d'un face-à-face joué.
- B. Non : avec 5 pièces ou plus, une audience perdue est rejouable jusqu'au retrait.
- C. L'audience devient facultative : un bouton « lire le dossier » applique directement Q4 A.

### Q-010-2. Effet de l'interrogatoire de CASSIUS sur la décision S2 [PRODUCTION]
*Contexte : entrée prête (`station-s2-cassius`), non raccordée ; aucune fin ni option nouvelle.*
- A. Gagné : CASSIUS « ne résiste pas » à *Réécrire* (texte seulement) ; perdu : rien ne change. **(Recommandé)**
- B. Perdu : *Réécrire* fermé, seuls *Brider* et *Effacer* restent.
- C. Aucun effet, l'interrogatoire est seulement narratif.

### Q-010-3. Interroger BISHOP-9 après CIN-41 (Interlude) [PLUS TARD]
*Contexte : CIN-41 dit que « personne ne l'a interrogé ». Le système le permet, mais aucune décision existante n'est à nourrir.*
- A. Plus tard, avec la quête `station-a-bishop` (« Accès administrateur »). **(Recommandé)**
- B. Ne pas l'ajouter.

### Q-010-4. Halloran : directrice ou représentant [PRODUCTION]
*Contexte : la bible (§2.3, §5.2, CIN-20) dit « Directrice Halloran » ; des répliques plus anciennes de l'Acte V disent « le représentant Halloran » et « il bluffe » (`story-act5-v188.js`, conseil de guerre). L'audience suit la bible (féminin).*
- A. Directrice : corriger les deux répliques du conseil. **(Recommandé)**
- B. Garder les deux formes.

## Niveaux dédiés de la station S1-S4 (2026-11-22) — valeurs par défaut appliquées

Demande reçue : des niveaux dédiés pour S1-S4 sur le modèle du lot colonie (spec `009-niveaux-station`, bible §7.10). Les choix ci-dessous sont appliqués par défaut **[PROPOSÉ]** et restent révisables.

| # | Question | Défaut appliqué | Autres options |
| --- | --- | --- | --- |
| S9-1 | Rendu des quatre niveaux | V1 (intérieur de station) ; la cale de cargo procédurale (caisses d'un cargo) est retirée de S1-S4 | V2 pour le collier d'arrimage de S1 (nouvelle définition de cale) |
| S9-2 | Faut-il enregistrer l'issue des récupérateurs de S1 (négociés / forcés) pour l'arrivée de S4 (« récupérateurs alliés si négociés », §7.2) ? | Non enregistrée ; S4 montre Grue si Port-Méridien a accepté son prix (`colonyMissionsV188.grue = accept`) | Champ additif `stationV188.s1Salvagers` (migration testée) |
| S9-3 | Conduits de la station pendant S1-S4 | Scellés (aucune traversée), pour que chaque cloison soit le seul passage | Ouvrir un réseau de conduits dédié dans S3 (ventilation) |
| S9-4 | Valeurs de jeu (minuteur de S3 150 s, tenue du quai 60 s, œufs, effectifs) | Celles de la bible §7.10 | À régler après playtest |
| S9-5 | Arrivée des colons volontaires en S4 (§7.2) | Non représentée (équipe technique et Grue seulement) | Silhouettes de colons de Port-Méridien selon le palier de la colonie |

Aucune de ces valeurs ne certifie une fidélité « 1:1 ».

## Décisions du propriétaire (2026-11-22, second tour) — appliquées

Décisions reçues après la livraison `48b0a599` (D1-D4d ci-dessus). Elles lèvent les réserves « Reste ouvert » de D1, D4a et D4b. Base : `48b0a599`.

| # | Décision | Application | Reste ouvert |
| --- | --- | --- | --- |
| D5 | **Le M577 à l'échelle partout** : le M577 conduit dans les niveaux ordinaires (190 px) et celui que le UD-4L descend (236 px) passent à 449 px | Véhicules 001 et 002 (la variante de commandement partage la coque ; deux antennes et un coffre radio **[PROPOSÉ]** la distinguent) : boîte de 449 × 112 px, substitut Canvas `m577-mission-side-scale` (la planche d'action de 250 px n'est pas à cette échelle). Le véhicule est **garé sans toucher à la géométrie** : sur une voie de sol continue à la ligne des pieds (une cabine d'ascenseur de 120-144 px, moins de 3 m, ne le porte jamais ; un pont plus bas que ses 140 px dessinés coupe la voie ; une porte sépare les places de stationnement), sur la voie qui mène à l'extraction, sans franchir de porte depuis le point d'origine, à l'écart des pieds d'échelle et des points d'interaction (`m577LanesV188`, `m577ParkingV188`). Conduite bornée à cette voie ; sortie par la porte latérale entre les roues ; conducteur en cabine ; tir depuis la tourelle de toit arrière. Vérifié sur tous les niveaux ordinaires où il roule (gabarits `colony-multiroute` et `planet-exterior`, 001 et 002) : coque entièrement au sol, aucune porte, cabine, mur ni pont dans sa silhouette, dans les limites, caméra cadrant la coque entière. Exemple : dans la rue de la colonie il était garé **au-dessus de la cage d'ascenseur de la sécurité** ; il est maintenant à l'est de la cage, sur la voie du pad et de l'extraction. Reprises : la largeur est ajoutée à l'enregistrement du véhicule (champ additif `w`) ; un enregistrement antérieur (boîte de 190 px) est accepté et garde son centre, sans dérive d'une reprise à l'autre. **Largage** : sur ses patins, le ventre du UD-4L n'est qu'à 36 px du sol ; en mode APC le vaisseau **reste en vol stationnaire** (150 px **[PROPOSÉ]**), le M577 pend sous la soute (tourelle rentrée de 20 px), est descendu au sol, roule au plus 220 px dans sa voie (jamais à travers une porte ni hors du sol) et, s'il n'est pas le véhicule de la mission, revient sous le ventre et repart hissé avec le vaisseau (il disparaissait auparavant en roulant hors du sol). Extraction à bord : le point de levage reste au-dessus de la coque, sur sa voie, vaisseau en stationnaire au-dessus du toit | La longueur reste **[À VÉRIFIER]** (D1). La forge (projets et playtests) garde l'ancienne boîte : ses fichiers sont gelés (`AUDIT_DEFERRED_FORGE_SOURCES`) et ses niveaux sont dessinés par l'auteur ; à décider. Dans la cinématique hors niveau (`insertion-cinematic-v188.js`), le M577 est dessiné à environ 0,47 de la longueur du UD-4L au lieu de 0,52 : non modifié, à confirmer. Un planétaire où la voie la plus proche est le pad d'évacuation y gare le M577 sur le point d'extraction (l'interaction reste accessible) |
| D6 | C3 : **le M577 qui a amené les rescapés reste garé au quai**, à l'échelle, décor non conduisible | Coque de 449 px entièrement sur le sol du quai (marge de 8 px depuis le début de la rue), nez vers le début du niveau, porte arrière vers les rescapés ; dessiné avec l'art du mur du fond, sur le tablier du quai derrière la voie des marines : il passe derrière le UD-4L qui se pose devant lui (aucune intersection) et n'est pas un obstacle. Le M577 du joueur reste à bord (D4b) | — |
| D7 | C3 : **Noor Okafor reste listée** sur l'écran de préparation, marquée indisponible « à l'infirmerie », avec la raison | Plan opérationnel : l'escouade déployée sans elle, puis `INDISPONIBLE · Noor Okafor · À L'INFIRMERIE` et `MOTIF · Indisponible pour C3 : elle tient l'infirmerie de Port-Méridien pour le contrôle biologique des rescapés du M577.` (FR à l'écran, EN au catalogue : « AT THE INFIRMARY », « Unavailable for C3: … »). Affiché seulement si elle fait partie de l'escouade ; l'opération et la sauvegarde ne changent pas | — |
| D8 | Acte V : **la Reine coupée au bord gauche** à courte portée depuis que le convoi est plus long ; rendre son **recul** (`recoil`) observable dans la QA navigateur | Cadrage de poursuite **[PROPOSÉ]** (`ACT5_CHASE_FRAMING_V188`) : quand la Reine approche, la caméra cadre sa silhouette entière à 24 px du bord gauche en gardant la tourelle de toit du M577 à 48 px du bord droit ; elle se décale d'abord (la cabine et le nez peuvent sortir à droite), puis recule (zoom jusqu'à 0,78, autour de la ligne de route, échelle uniforme) quand les deux ne tiennent pas, cas du rejeu avec deux remorques. Les règles de la course gardent leurs coordonnées. Mesure (Node, deux remorques gardées attachées) : à moins de 3 m, queue jamais coupée de plus de 16 px. QA : quatrième parcours en rejeu de *La Reine du dépôt* (deux remorques), avec une injection déclarée qui maintient l'intégrité des remorques à 100 pour qu'aucune ne soit arrachée et dévorée : la Reine atteint son plancher et recule | Pendant le recul lui-même (8 m en 0,8 s), la queue peut sortir de quelques dizaines de pixels pendant une fraction de seconde (mesuré jusqu'à 44 px en Node). Le zoom est une proposition : à confirmer, ou préférer une vue plus large fixe pour la poursuite |
| — | Correction trouvée par la QA du largage | La touche E qui confirme l'extraction atteignait aussi l'écoute « passer » de la séquence qu'elle venait de lancer : l'embarquement en niveau était sauté. Un « passer » n'est accepté qu'après 0,25 s de séquence | — |

Aucune de ces décisions ne certifie une fidélité « 1:1 » ; tous les visuels du M577 en niveau restent des substituts Canvas.

## Réponses du propriétaire aux questions Q-010-1 à Q-010-4 (2026-11-22)

| Question | Réponse | Application |
| --- | --- | --- |
| Q-010-1 | **A** : l'audience décide ; 5 pièces ou plus rendent la victoire possible, pas automatique | Comportement actuel conservé (aucun changement de code) |
| Q-010-2 | **A** : l'issue de l'interrogatoire de CASSIUS ne change que le texte de la décision S2 | Réponse enregistrée ; l'entrée `station-s2-cassius` reste à raccorder dans ce sens (aucune option ni fin nouvelle) |
| Q-010-3 | **A** : l'interrogatoire de BISHOP-9 viendra plus tard, avec la quête `station-a-bishop` (« Accès administrateur ») | Reporté, rien n'est ajouté maintenant |
| Q-010-4 | **A** : Halloran est une femme, « Directrice » comme en §2.3 | Les deux répliques anciennes du conseil de guerre sont corrigées en FR et EN (`src/story-act5-v188.js`) : « devant la directrice Halloran » / "before Director Halloran", « elle bluffe sur les délais » / "she bluffs about deadlines". Recherche faite dans `src/`, `docs/` et `specs/` : aucune autre forme masculine pour Halloran |

## Campagne annexe 1 « La Saison des Reines » (2026-11-22, spec 011) — valeurs par défaut appliquées

Décisions déjà prises et appliquées : Q13 B (après l'Acte V), Q15 B (déplacement des `worldId` campagne par campagne), Q16 B (un arc jouable d'abord), Q21 A (coût fixe par saut). Valeurs par défaut de ce lot, à confirmer :

| # | Question | Valeur appliquée | Autre possibilité |
| --- | --- | --- | --- |
| R1 | Moment exact de « fin de la campagne principale » (§13.5) | Après le générique de l'Acte V (`act5.phase === 'complete'`) | Dès la fin choisie (phase `ending`) |
| R2 | Abysse Noir après son déplacement sur Nacre-7 | Lancé seulement dans la campagne (appel accepté, orbite de Nacre-7, après 1.2) ; un ancien succès reste enregistré sans compter pour l'arc ; rejouable dans l'arc | Garder aussi une rejouabilité libre depuis le registre des opérations |
| R3 | 1.3 et 1.4 (§14.4) | Une seule partie du chapitre couvre les deux lignes (HADAL puis MANTA-6 et le boss) | Découper le chapitre en deux missions |
| R4 | Orbite requise | Les missions de la campagne se planifient depuis l'orbite de Nacre-7 | Planification à distance, comme les autres missions |
| R5 | Retard de l'appel | 9 j par le réseau QZ, 2 j par la salle des relais d'Asphodèle | Autres délais |
| R6 | Missions rejouées | Histoire et annexes une fois par campagne ; contrats rejouables | Tout rejouable |
| R7 | Œuf saisi | Enregistré (pièce du fil QZ17, risque à bord) sans crise immédiate | Déclencher une crise biologique à bord au retour |
| R8 | TR-0 | Absent du catalogue des 64 mondes ; l'arc 3 attend sa création | Réutiliser un monde existant |

Aucune de ces valeurs ne certifie une fidélité « 1:1 ».

## Parcours complet de la campagne principale (2026-11-22) — questions ouvertes

Le run est consigné dans `docs/development/PLAYTHROUGH_V188_20261122.md`. Aucune valeur n'a été changée sur ces points. Ils attendent une décision.

| # | Question | Constat du parcours | Options |
| --- | --- | --- | --- |
| P-1 | Ravitaillement de la ligne principale | 78 au départ, environ 6 par sortie sur Cocyte. Il reste 5 avant C4, après 13 sorties (actes, colonie, station). Le jeu n'affiche aucune source évidente. | Source visible (marché, annexe logistique) ; coût réduit pour les missions de la ligne principale ; stock de départ plus haut |
| P-2 | Infestation à bord avant le saut de la Saison des Reines | Le retour de « La Reine du dépôt » ouvre une chaîne pathogène qui bloque le saut vers Nacre-7 avec « Infestation à bord non résolue », sans indiquer le remède. | Guider vers les annexes (sas d'arrivée, CCTV, Bioforge) ; ne pas ouvrir de chaîne sur les missions finales ; ne pas bloquer le saut |
| P-3 | Ordre conseillé | QZ-18 est recommandé avant QZ-17. Le conseil de guerre s'ouvre avant C4 et l'Interlude avant C3. | Garder ; suivre l'ordre de la bible (Acte I d'abord) |
| P-4 | Crise de l'Interlude | L'objectif indique le pont 2, mais les menaces apparaissent sur le pont où se trouve le joueur (ancien système de crise du hub). | Placer la crise sur son pont ; ajuster le texte |
| P-5 | Texte du conseil avec un seul conteneur | « Sans conteneur à rendre… » s'affiche alors qu'un conteneur a été ramené (la restitution demande 2 conteneurs). | Reformuler (« Pas assez de conteneurs pour une restitution ») |

## Arsenal — complétion du lot A (2026-11-22, spec 014) — valeurs par défaut appliquées

Demande : « fidélité 1:1 comme le reste, compléter toutes les armes avec chargeurs, VFX, etc. ». La règle du projet est appliquée : rien n'est déclaré « 1:1 » ; documenté / adapté / à définir sont séparés dans `docs/development/ARSENAL_COMPLETION_V188.md`.

| # | Question | Valeur appliquée | Autre possibilité |
| --- | --- | --- | --- |
| A1 | Armes de franchise sans plaque native | Ajoutées au catalogue (194–196), jouables par chargement, **non achetables** (règle « plaque dédiée requise ») avec silhouette Canvas | Les garder en dossiers de recherche jusqu'aux plaques |
| A2 | Capacité des lanceurs M6B / M83 / M5 (72 dans le tube au catalogue historique) | Une roquette par tube, le reste en réserve (total conservé) | Garder le chiffre historique |
| A3 | Capacité du .357 (44 au catalogue historique) | 6 chambres (CSV « Capacité canon ») ; finitions identiques | Garder 44 |
| A4 | Finitions d'un fusil à pompe (p. ex. 90 cartouches) | Capacité de la base (4) | Garder les chiffres générés |
| A5 | Pompe | Automatique, 0,4 s après chaque tir [PROPOSÉ] | Pompe sur une touche dédiée |
| A6 | Chargeurs physiques hors M41A (VP70, M4A3, F44AA…) | Aucun sans preuve propre au modèle consignée | Fournir des sources par modèle |
| A7 | Sons | Indices existants partagés | Commander/synthétiser des sons propres par arme |
| A8 | Nostromo (lance-flammes, aiguillon), combinaison de Ripley | Non ajoutés : à inscrire d'abord à l'index avec source ; la combinaison demande deux alimentations | Les prioriser au prochain lot |
| A9 | Cadence « 900 coups/min » du M41A (Technical Manual, 1995) | Non appliquée (cadence de jeu 7,7/s inchangée) | Décision du propriétaire |

Option de développement : `arsenalFeedsV188: false` dans les options de `engine.start` rétablit le transfert numérique historique.

## Outils de développement : lanceur de scènes caché et stand de tir (2026-11-22, spec 012) — valeurs par défaut appliquées

| # | Question | Valeur appliquée | Autre possibilité |
| --- | --- | --- | --- |
| D-012-1 | Exposition de la page de développement | Serveur de développement seulement (`/devtools/`, `/dev`, session `/?atf-dev=v188`) ; fichiers admis en source seulement, absents du build public | Page déployée derrière un paramètre secret (refusé : un paramètre n'est pas une protection) |
| D-012-2 | Sauvegarde utilisée par une session de développement | Stockage en mémoire de l'onglet, alimenté par la fixture ; le profil réel n'est ni lu ni écrit ; supprimée en quittant | Emplacement de profil dédié dans `localStorage` (risque d'écrasement par erreur) |
| D-012-3 | Prérequis impossibles à produire sans falsifier un reçu runtime (retours ARBITER 02-06) | Entrées affichées désactivées avec leur raison | Forger les reçus (refusé : état impossible) |
| D-012-4 | Réglages du stand | En mémoire, appliqués par relance du niveau, exportés en diff JSON pour revue ; jamais écrits dans les sources | Écriture directe dans `content.js` |
| D-012-5 | Mission support du stand | Première campagne FRONTIER ordinaire de Cocyte (`pair-005-frontier`), pour que la doctrine d'escouade V132 et les posables soient actifs | Niveau de stand dédié à construire |

## Bioforge, laboratoire de confinement (2026-11-22, spec 013) — valeurs par défaut appliquées

Demande : « améliorer la Bio Forge — le level design est mal fait ». Audit : `docs/development/BIOFORGE_AUDIT_V188.md`. Valeurs appliquées, à confirmer :

| # | Question | Valeur appliquée | Autre possibilité |
| --- | --- | --- | --- |
| B1 | Galerie d'observation | Décor de profondeur au-dessus de la cellule, derrière verre blindé, non praticable (le monde reste 2880 px) | Étage praticable (monde agrandi, migration des sauvegardes V87/V132) |
| B2 | Décontamination | Brume de présentation à l'entrée ; cycle obligatoire de 2,4 s à la sortie avant la porte du Tantalus | Cycle obligatoire aussi à l'entrée ; autre durée |
| B3 | Sortie après la purge | À pied (D ou E) si l'opérateur est vivant dans la cellule ; sinon bouton « RETOUR AU HUB » | Sortie à pied seulement ; terminal seulement |
| B4 | Marche sans session | Autorisée dans la salle de contrôle et le stockage froid, portes de sécurité fermées | Scène fixe jusqu'au lancement |
| B5 | Passerelles de la cellule | Réservées aux spécimens, signalées ; l'opérateur n'escalade pas | Escalade des échelles |
| B6 | Quête `ship-bioforge` | Non codée ; deux lieux préparés (stockage froid, galerie) | Lot dédié : débat Inez / BISHOP-9 et choix de conservation |

Aucune de ces valeurs ne certifie une fidélité « 1:1 ».
