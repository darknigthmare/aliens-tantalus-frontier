# V87 — Actualisation privée de la couverture des sources

Date : 19 septembre 2026. Base privée contrôlée : `de1390d07ccbb88b2a63e95988b1a064a523cfa5`.

**Document privé, exclu de la publication du jeu.** Les conversations, leurs extraits, les références personnelles, le classeur et les preuves QA ne sont pas autorisés à entrer dans le dépôt public. Ce rapport complète les audits historiques sans les réécrire.

## 1. Portée et méthode

Le périmètre connu comprend **26 conversations du ledger V76 et trois conversations récentes V87**, soit 29 identifiants distincts identifiés ci-dessous. Ce nombre n'est ni un inventaire exhaustif certifié du projet ChatGPT, ni 29 exports intégraux, ni 29 contrats implémentés. D'autres conversations ajoutées par l'utilisateur peuvent encore manquer.

Cette passe a lu les sources privées disponibles, leurs limites de récupération, les registres et les raccords du code. Elle a importé en lecture seule les registres actuels et revérifié les empreintes des paquets indiquées plus bas. Aucun test navigateur, aucune suite complète, aucune nouvelle génération et aucune publication ne sont revendiqués pour cette passe documentaire. Les preuves de jeu antérieures sont identifiées comme telles.

Les recherches sont restées dans `D:/CodexWork/aliens-tantalus-frontier/project` et les sorties privées/paquets connus de `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien`. Aucun nouveau scan de Downloads ni examen d'autres projets.

Règles de statut : un concept, une ligne Excel, une fiche catalogue, un manifeste, une entrée non jouable ou une planche non raccordée ne prouvent pas une fonctionnalité. Un sous-lot joué ne clôt pas automatiquement la conversation plus large. Aucun compteur historique DONE/PARTIAL/MISSING n'est repris comme résultat global actuel.

## 2. Inventaire connu des conversations

### 2.1 Les 26 conversations du ledger

Index historique : `docs/references/V76_CHATGPT_PROJECT_GAP_MATRIX.md`.

Les références G, M et L désignent respectivement `docs/references/v76-conversation-audit/group-gameplay.md`, `group-missions.md` et `group-levels.md`. Les numéros de section permettent de retrouver la source. Certaines sections ont un titre éditorial de mission distinct du titre exact du chat présenté ici. Les groupes conservent des demandes et synthèses de réponses ; plusieurs longues réponses assistant étaient tronquées à 20 000 caractères. La pagination terminée ne rétablit pas ces fins de réponses.

| # | Titre du chat | Identifiant | Source locale |
| --- | --- | --- | --- |
| 1 | Gérer sons et musique | `6a9f2a3e-ea20-83eb-bbac-49af1626675a` | G §1 |
| 2 | Améliorer le menu principal | `6a9e0753-f3a8-83eb-a165-d534d0da00ca` | G §2 |
| 3 | Créer items gameplay posables | `6a9e045a-917c-83ed-bea1-f95506cdeb19` | G §3 |
| 4 | Hordes d'ennemis occasionnelles | `6a9e030f-a2c4-83ed-9832-259fa7a7b0c0` | G §4 |
| 5 | Créer des marines uniques | `6a9df801-9e7c-83ed-8104-244ed10c8587` | G §5 |
| 6 | Ajouter rechargement tactique | `6a9df7c3-406c-83eb-9277-f30c778caa60` | G §6 |
| 7 | Décrire les bugfix Codex | `6a9cb8bc-d6fc-83ed-8ce7-d324e4b1a573` | G §7 |
| 8 | Mission moteur queen | `6a99e9b5-a7fc-83eb-96bc-b53baa1b9cbe` | G §8 |
| 9 | Mission Godzilla Planète | `6a99eb43-9ebc-83eb-868c-1c56f918e531` | G §9 |
| 10 | Mission contre Xenomorph Godzilla | `6a99eaec-f4a4-83ed-a3ea-88db3c94413a` | M §1 |
| 11 | Étendre la liste des collectables | `6a99e94f-ef7c-83ed-a229-7d42b85b6222` | M §2 |
| 12 | Étendre coopération équipe Marines | `6a99e7de-0d14-83eb-9074-0cc76c50989b` | M §3 |
| 13 | Écrire une mission xénomorphe | `6a99b3d2-0e58-83eb-abba-d955b5d73b2d` | M §4 |
| 14 | Créer mission préhistorique | `6a99b4e6-45f4-83eb-bdae-5b3ad2e57833` | M §5 |
| 15 | Créer mission Alien Queen | `6a9981b6-ec38-83eb-bcaf-eea1783e448f` | M §6 |
| 16 | Proposer mécaniques HUD Alien | `6a999dca-3efc-83eb-907a-623f11cf2388` | M §7 |
| 17 | Mission avec Jerry synthétique | `6a999847-94b4-83ed-af17-c3b6b57da810` | M §8 |
| 18 | Mission sous marine complète | `6a99988b-90c4-83ed-a4f6-0462baed528f` | M §9 |
| 19 | Audit du level hub USS Tentalus | `6a98fa78-6db8-83eb-bc72-cf41bc6833b1` | L §1 |
| 20 | Idée spawn ennemis Tentalus | `6a98c871-61ac-83ed-be5c-600c473690e2` | L §2 |
| 21 | Mission extermination Power Loader | `6a98dfeb-7284-83eb-a015-bf964b8b1229` | L §3 |
| 22 | Mission Alien 1 | `6a98e050-1748-83eb-8c5b-a7dd4bc1ac26` | L §4 |
| 23 | Mission aérienne xéno | `6a98d47d-68f4-83eb-9ed3-4063af4e7496` | L §5 |
| 24 | Mission extraction du Hive | `6a98e0e1-2b98-83eb-9cd4-e9772768b977` | L §6 |
| 25 | Mission APC contre Xenos | `6a98d3ea-99ac-83ed-b765-6932483ddbe1` | L §7 |
| 26 | Mission Power Loader | `6a98dfcb-a2e4-83ed-b3c2-606a9384c6e4` | L §8 |

Compléments directs déjà récupérés, sans ajouter de nouveaux identifiants à ce total :

- `docs/references/V85_CHATGPT_RECRUITMENT_SOURCE.md` : source intégrale retrouvée du chat #5 ; elle corrige l'ancienne limite de troncature du recrutement.
- `docs/references/V86_CHATGPT_PLACEABLES_SOURCE_TRUNCATED.md` : source directe de #3, sections 1 à 8 lisibles et section 9 coupée ; la suite demeure absente.
- Les rapports `CHATGPT_PROJECT_PARITY_V67` à `V70` sont des instantanés plus anciens. Leur inventaire de 19 conversations ne prouve pas l'exhaustivité actuelle.

### 2.2 Les trois conversations récentes V87

Base privée P : `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/privateoutput/v87`.

| Chat | Fichiers récupérés sous P | Limites précises |
| --- | --- | --- |
| Vérification animations joueur — `6aa7f902-2870-83eb-976c-e730afb364f3` | `player-animation-source.json` | Un tour et son texte disponibles ; cinq références internes de livrables, indices 6 à 10, sans URL ni pièce jointe exploitable. Les manifestes annoncés ne sont pas présents. |
| Créer une campagne complète — `6aab8b2e-ce18-83ed-a55a-0f09cabc5c58` | `campaign-source-visible.md`, `campaign-source-audit.md` | Deux tours visibles. Dernière réponse complète ; réponse initiale exactement 20 000 caractères, `truncated=true`, coupée pendant le chapitre 20. Le Word et le texte annoncés sont absents. |
| Conception pièce hommage chat — `6aa854a2-ebb0-83eb-9839-43572cd63f94` | `memorial-0-0.json`, `memorial-0-1.json`, `memorial-1-0.json`, `memorial-1-1.json`, `memorial-2-0.json`, `memorial-2-1.json`, `memorial-3-0.json`, `memorial-source-audit.md`, `memorial-audit-final.md` | Quatre messages utilisateur et trois réponses. `memorial-1-1.json` contient une réponse animaux de 20 000 caractères tronquée au début de « La caisse 27 ». La réponse consacrée au patch REFUGE dans `memorial-2-1.json` est complète, mais ses fichiers ne sont pas exposés. |

Les audits sont des documents dérivés. Ils ne remplacent pas les fichiers sources annoncés ni les réponses intégrales manquantes.

## 3. Paquets, classeur et références réellement disponibles

### 3.1 Paquet animaux reçu, pas paquet artistique

Nom original : `ATF_Animaux_USS_PACK_CODEX_v1.zip`, 40 333 octets. Copie contrôlée : `P/animals-pack-84014cc3/source.zip`. SHA-256 revérifié dans cette passe : `84014cc335af5dee1ff7632aa6233c633a53e009bce604bec80aba37b7bc196e`.

Extraction : `P/animals-pack-84014cc3/ATF_Animaux_USS_Conception_Codex_v1/`. Quinze fichiers :

- `README.md`, `CONCEPTION_ANIMAUX_USS.md`, `PROMPT_CODEX_ANIMAUX_USS.txt`, `QA_ACCEPTATION.md`, `SOURCES_ET_INTEGRATION.md`, `MANIFEST_FICHIERS.json`, `VALIDATION_DONNEES.json`.
- `data/catalogue_familles.json`, `data/habitats.json`, `data/individus_originaux.json`, `data/manifest_animations_proposees.json`, `data/marchands.json`, `data/offres_auteurs.json`, `data/politique_navigation.json`, `data/quetes_proposees.json`.

Le paquet décrit 18 familles, 16 individus, 14 offres, huit habitats, quatre marchands, huit quêtes et 178 associations famille/clip proposées couvrant cinq familles. **Il ne livre aucun sprite, animation, audio ou runtime.** Son propre statut est `design_only_not_runtime_integrated`. Le nombre de critères QA du document n'est pas un nombre de tests exécutés. Voir `P/animals-pack-audit.md` pour l'audit du contenu.

### 3.2 Classeur

Le fichier réel `.tmp/Alien_Franchise_Encyclopedie_Exhaustive.xlsx` est présent dans le dépôt privé. SHA-256 revérifié : `2a82aca78fdad882d913f93833ca9a1cc50e9195aaad0478a4d8b6d0b1ea420b`.

Les anciens croisements se trouvent dans `docs/references/V56_EXCEL_CONTENT_CROSSMATCH.md` et `docs/references/V61_EXCEL_CONTENT_GAP_AUDIT.md`. Ils décrivent 19 feuilles, 17 tables thématiques et un index global de 2 363 entrées. Ces chiffres sont des inventaires source, pas une couverture jouable ou artistique. Les cellules de dashboard mises en cache ne constituent pas une mesure de réalisation. Cette passe ne réaudite pas chaque ligne Excel ni chaque modèle de véhicule ; elle ne transforme aucune ambiguïté de référence en asset certifié.

### 3.3 Images de référence déjà récupérées

`P/retrieved-image-references-sept19/` contient 79 JPG et son `manifest.json`. Ce sont des références visuelles existantes, pas de nouvelles productions de cette passe ni les fichiers de la pièce personnelle. Elles ne remplacent pas les manifestes joueur V87 ou le paquet REFUGE.

## 4. Sources strictement manquantes et récupération actuelle

« Manquant » signifie ici absent ou inexploitable dans le périmètre récupéré et inspecté ; cela ne prouve pas la suppression du fichier original dans ChatGPT.

| Élément absent | Ce qui est réellement exposé | Conséquence |
| --- | --- | --- |
| Livrables joueur V87 | Cinq `chatgpt-content-reference`, indices 6–10 ; cahier des charges, manifeste intégral, P0 et sockets annoncés dans le texte | Aucun nom de ZIP/JSON, URL ou manifeste complet récupéré. Ne pas inventer de noms de fichiers ni reconstruire les 507 lignes en prétendant les avoir reçues. |
| Dossier PALISADE complet | Références internes 0–1 : Word annoncé de trente pages et version texte | Aucun `.docx`/`.txt` correspondant trouvé. Le chapitre 20 initial est coupé ; les vingt secondaires et six arcs compagnons ne peuvent pas être prétendus intégralement lus. |
| Patch REFUGE | Références 0–3 : paquet ZIP, capture, démonstration, consignes | Aucun paquet/module/démo correspondant récupéré. Le texte cite seulement le nom technique `apply_tribute.py` ; ce fichier est absent des paquets inspectés. Les « 27 + 9 + 7 tests » sont des affirmations du chat, pas des résultats exécutés ici. |
| Références personnelles REFUGE | Aucun nom, dédicace ou portrait personnel exploitable dans les fragments récupérés | Ne pas inventer l'identité ou les dates du chat personnel, ni présenter une image générique comme fidèle. |
| Fin de la réponse posables et autres réponses tronquées du ledger | Extraits textuels réels mais limités à 20 000 caractères dans certains messages | Les demandes déjà visibles restent utilisables ; une pagination sans autre tour ne prouve pas la lecture de leur fin. |

Point de récupération communiqué par l'agent principal pendant cette passe :

- Nouvelle lecture des trois chats via `read_thread` réussie, sans nouveau livrable téléchargeable ; références internes sans URL et sans pièce jointe exploitable.
- CUA, y compris après reset, et `node_repl` restent en échec Windows `apply deny-read ACLs`.
- L'onglet ChatGPT accessible par CDP sur le port `54837` affiche « Un instant… » avec un corps vide. Ce n'est pas une lecture réussie du projet ou de ses fichiers.
- Aucun cookie, identifiant ou profil de navigateur n'a été extrait et aucun contrôle d'accès contourné.
- **Aucun nouvel asset ni nouveau paquet récupéré dans cette passe.** Le ZIP animaux et les 79 JPG précités étaient déjà disponibles. Le problème de récupération des pièces jointes n'empêche pas de poursuivre les éléments dont le contrat textuel et le code sont suffisants, mais interdit de revendiquer la fidélité à des fichiers non reçus.

## 5. Constats historiques remplacés par l'état actuel

| Ancien constat à ne plus répéter comme actuel | État réel à la base contrôlée | Limite conservée |
| --- | --- | --- |
| Aucun parcours créateur/prologue | V84 possède identité persistante, réveil, accueil DAVID-8R, déplacement cryo/CIC/briefing et dialogue Tamsin ; raccord de sauvegarde dans `src/save.js` | Ce sous-lot n'apporte pas les nouvelles animations de réveil ni toutes les variantes corporelles/portraits. Voir `docs/VERSION_HISTORY_V84.md` et `docs/VALIDATION_V84.md`. |
| Aucun recrutement causal ; source tronquée | Source complète V85, quatre candidats persistants, huit aptitudes, recrutement/formation/dotation et consommateurs moteur ; `src/crew-recruitment-v85.js`, `src/crew-runtime-v85.js`, sauvegarde racine | Les portraits/silhouettes individuels, missions personnelles et corpus d'animations ne sont pas livrés par ce socle. |
| Tir diagonal global absent | Visée et projectiles huit directions V83 déjà raccordés ; `src/combat-aim-v83.js`, `src/projectile-collision-v83.js` | Le haut du corps huit directions et les armes détachées du contrat joueur V87 restent manquants. |
| Blessure et mort toujours confondues | Le correctif distingue leurs clips et interdit les poses de cadavre à un acteur vivant ; voir `docs/V87_SOURCE_RECOVERY_AND_PLAYER_HOTFIX.md` | Ce correctif ne crée pas les cycles détaillés de dégâts ou le système d'animation complet. |
| Dix annexes / aucun accueil animalier ou comptoir physique | Import direct du registre actuel : douze annexes, dont `animal-care` et `frontier-civil-counter`. Audit port : 28 salles et 30 connexions | Ni REFUGE, ni station civile complète, ni toutes les annexes annoncées dans les chats ne sont certifiés par ce nombre. |
| Animaux seulement en catalogue, sans acquisition ou transfert | Moka et Brume ont acquisition, stock/reçu uniques, habitat requis, caisse à récupérer, transport physique, réception puis routines et reprise | Seulement deux individus et deux logements raccordés. Quatorze individus source et les systèmes avancés demeurent ouverts. |
| Le paquet animaux/REFUGE n'a jamais été reçu | Le paquet **animaux** est réellement récupéré et audité | Le paquet **REFUGE**, distinct, est toujours absent. Ne pas confondre les deux. |

Les preuves antérieures du premier lot animaux sont consignées dans `docs/V87_PORT_DELIVERY_AUDIT.md` et sous `I:/CodexQA/AliensTantalus/v87-port-20260919/`. Les parcours Moka et Brume localement et en production ont chacun 24 jalons rapportés : achat unique, marche au clavier, trajet 4/4, réception 2+4 secondes actives, contact, marche et sauvegarde/reprise ; une seule fixture initiale isolée, sans affectation de position après. Ce rapport ne prétend pas les avoir réexécutés pendant la passe documentaire.

Le comportement de récupération physique d'une caisse interrompue, les protections de quota/profil et le premier plan du hangar corrigé sont aussi des acquis du lot port. L'animation humaine dédiée au portage n'est pas générée, le dropship historique reste moins net, et toutes les animations de la responsable ne sont pas certifiées. Ces réserves restent ouvertes.

## 6. Priorités d'implémentation encore prouvées

### P0 — Joueur V87 : mouvements et animations réellement séparés

Source : `P/player-animation-source.json`, sections « Architecture recommandée », « Lot P0 », « Sockets indispensables » et « Livrables ». Le texte annonce 507 clips/variantes et 14 198 cellules directionnelles ; sans manifeste reçu, ce sont des objectifs de conception et non un décompte validé de fichiers ou de poses existantes.

Contrôle actuel : `src/player-visual-contract-v81.js:1` autorise cinq feuilles Echo-9 ; `src/sprite-animation-runtime.js:126` conserve `walk-run` à quatre cellules, `jump-fall` à quatre et `climb` à deux. Le sélecteur `resolvePlayerAnimation` les utilise toujours. La recherche des sockets `ladder_hand_l`, `grip_primary`, `carry_shoulder`, des couches `upper-body`/`lower-body` et de l'événement `ammo:transfer` dans `src` n'a pas trouvé le système V87 demandé.

Premier lot substantiel : **P0-A** avec idle/transitions, marche/course/sprint distincts, phases de saut/chute/atterrissage pilotées par la physique, accroupissement et conduits, montée/descente d'échelle indépendantes et contacts cohérents. Conserver le contrôleur, la caméra et la hitbox humains ; les assets ne doivent pas décider de la collision. L'échelle reste dans le décor.

Puis : poses complètes cohérentes exportées en couches synchronisées, deux orientations réellement dessinées, haut du corps huit directions, sockets par image, armes/outils/effets détachés, sept familles de recharge avec transfert réel au bon événement. La phase de pieds doit être conservée entre vitesses, les événements idempotents après reprise, les atlas chargés par contexte. Un rendu porté/tenu n'est pas une nouvelle animation humaine dédiée.

### P1 — REFUGE : pièce personnelle autonome, non boutique

Source directe : `P/memorial-2-1.json` ; contrat consolidé : `P/memorial-audit-final.md`, section A.

Contrôle actuel : `src/hub-annex-registry-v87.js:11` n'ajoute que les annexes animaux et relais civil. L'import direct des douze IDs ne contient pas REFUGE. Aucune implémentation du contrat REFUGE n'a été trouvée dans `src`.

Livrer une pièce 2D de 1 920 × 720 depuis une porte des quartiers du pont Habitat, avec retour physique. Cinq interactions réelles : portrait/nom/dédicace et import PNG/JPEG/WebP local, lecture au terminal, LED, salutation du chat holographique animé, contemplation puis retour à la marche. Décor modulaire : coussin, bibliothèque, cadre, terminal, lumière, hologramme, banquette et hublots/parallaxe. Réutiliser le Marine du jeu ; aucun ennemi, tir, coût ou bonus de combat.

Confidentialité : traitement d'image local sans upload/synchronisation ; éviter toute exportation publique de la photo. La sauvegarde pendant la visite ne déplace pas le joueur ; une reprise le replace devant la porte des quartiers, conformément au texte reçu. Ne pas assimiler le REFUGE à la morgue, au mémorial militaire, à un logement animalier imposé ou à une amélioration achetable. Le hologramme n'est pas un animal biologique possédé. La photo et le nom réels restent à obtenir ou à saisir localement, sans fausse reproduction.

### P1 — PALISADE : campagne Metroidvania authorée et persistante

Sources : `P/campaign-source-visible.md` et `P/campaign-source-audit.md`, sections « Demandes concrètes nouvelles », « Cohérence à préserver » et « Prochaine tranche honnête ».

Contrôle direct : import de `CAMPAIGNS` depuis `src/content.js` = **440 entrées**, avec zéro correspondance à PALISADE, Port-Méridien, Hadley-9, ORISON ou Ixion dans leurs données. Les chapitres nommés et leurs conséquences ne sont pas présents sous ces identités dans le code inspecté. Ni un template générique ni un nombre de campagnes ne remplace cette campagne.

Le texte visible demande vingt chapitres, 100 sous-chapitres principaux, vingt secondaires et six arcs compagnons. Les durées 54 h / 70–80 h sont des objectifs annoncés, jamais une durée de jeu mesurée. Les vingt chapitres incluent notamment l'invasion du Tantalus, Port-Méridien, l'industrie Hadley-9, Ferrum, Thalassa, la mine, Carène, Nysa, Lysan, Halden, le puits PALISADE, ORISON, Ixion, la reine industrielle et un dernier départ sous compte à rebours de 18 minutes.

Premier lot substantiel : identifiants stables de région/chapitre, migration de progression et un chapitre entièrement traversable avec capacité/verrou, raccourci permanent, zone optionnelle, horreur/action, changement d'état et vraie raison de revenir. Brancher son accès au jeu et prouver sauvegarde/reprise, échec/réussite et retour sur zone avant de déclarer un chapitre livré.

Le puits PALISADE à sept strates, les boucles de transport, les sauvetages nominatifs, les régions mutées et l'aide causale des survivants à la finale restent à construire. Ne pas effacer un choix antérieur de quarantaine réussie pour imposer une intrusion ; ne pas remplacer DAVID-8R par Ivo, ni confondre Hélène Voss avec Mara Voss. Le Word manquant interdit de prétendre connaître toutes les vingt secondaires et les six arcs complets.

### P1 — Compagnons : quatorze individus restant après Moka et Brume

Source : paquet reçu, notamment `data/individus_originaux.json`, `habitats.json`, `offres_auteurs.json`, `quetes_proposees.json` et `politique_navigation.json`.

Contrôle actuel : `src/ship-animal-state-v87.js:2` définit seulement `animal-moka` et `animal-brume` ; `src/ship-animal-habitat-v87.js:24` ne définit que leurs deux logements. Leurs états sont conservés sous `shipAnimalsV1` par `src/save.js`, avec routines et livraison dédiées. Aucun deuxième inventaire d'animaux possédés n'est nécessaire.

| Individu restant | ID source | Famille | Contrainte particulière |
| --- | --- | --- | --- |
| Rivet | `animal-rivet` | `cat-domestic` | Quête proposée « La caisse 27 » ; adoption/refuge/restitution, pas possession imposée. |
| Suie | `animal-suie` | `cat-domestic` | Identité et art propres. |
| Luciole | `animal-luciole` | `cat-domestic` | Identité et art propres. |
| Boulon | `animal-boulon` | `dog-companion` | Navigation de chien, pas échelle humaine. |
| Sable | `animal-sable` | `dog-working` | Ancienne chienne de recherche ; quête « Un autre service ». |
| M-17 | `animal-m17` | `dog-synthetic` | Batterie/maintenance, pas besoins biologiques copiés. |
| ARC-4 | `animal-arc4` | `dog-synthetic` | Batterie/maintenance, identité séparée de M-17. |
| Noisette | `animal-noisette` | `rabbit-domestic` | Groupe lié `noisette-cafe`. |
| Café | `animal-cafe` | `rabbit-domestic` | Même adoption groupée, deux individus et capacité adaptée. |
| Bip | `animal-bip` | `cockatiel` | Habitat et navigation d'oiseau, sans reprendre une locomotion de Marine. |
| Clé | `animal-cle` | `ferret-domestic` | Gabarit/habitat et animations propres. |
| Tic | `animal-tic` | `rat-domestic` | Groupe lié `tic-tac`. |
| Tac | `animal-tac` | `rat-domestic` | Même adoption groupée, deux individus persistants. |
| Mica | `animal-mica` | `gecko` | Terrarium et comportement de reptile adaptés. |

Ce n'est pas seulement un lot de quatorze images : il reste à relier les offres/conditions, les autres habitats et capacités, les huit quêtes source, les marchands externes, les liens individuels et l'ensemble des interactions/routines avancées. Les duos ne doivent pas devenir un seul individu ni recevoir deux achats indépendants incompatibles avec l'offre groupée. Les cinq familles dotées d'un manifeste d'animations proposé ne couvrent pas les dix-huit familles du catalogue.

Conserver zéro possédé par défaut, acquisition et stock atomiques, transport physique, étapes d'accueil persistantes, absence de faim/mort hors ligne, permissions de portes et zones interdites. Les animaux biologiques et synthétiques ne partagent pas aveuglément les mêmes besoins. Les appels/jeux/suivis et la navigation hors écran doivent conserver une identité et un trajet réels, sans téléportation, sans buffs et sans modification de la hitbox/caméra humaines. Le relais civil actuel est un socle local, pas la livraison des quatre marchands et de tous les voyages de station.

## 7. Conclusion de couverture

La progression V84/V85/V87 est réelle à son périmètre ; elle ne justifie ni « tout le dossier ChatGPT est fait », ni « tous les ennemis sont terminés », ni « fidélité 1:1 certifiée », ni « jeu commercial complet ». Les nombres historiques de sprites ou de campagnes ne sont pas une certification fraîche de leurs animations, leur accessibilité, leur cohérence artistique ou leur durée de vie.

Les quatre priorités ci-dessus sont établies par des sources identifiées et des points de code contrôlés. Les trois premières restent des chantiers majeurs distincts ; le premier lot animaux est accompli à son périmètre, mais quatorze individus et les systèmes avancés du paquet restent à implémenter. Les autres promesses des 26 conversations ne sont pas annulées par cette sélection et nécessitent leur propre vérification actuelle.

Ce document n'ajoute aucun asset, module de gameplay, test exécuté, commit ou déploiement. Il conserve explicitement la différence entre contenu reçu, contenu annoncé, code intégré, preuve de jeu et limites restantes.
