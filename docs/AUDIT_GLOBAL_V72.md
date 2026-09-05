# Audit global V72 — bilan vérifié et dettes ouvertes

Date : 5 septembre 2026. Projet : Aliens: Tantalus Frontier. Copie de travail : `D:/CodexWork/aliens-tantalus-frontier/project`.

## Verdict

Ce lot corrige des défauts réels de jouabilité, collision, sauvegarde, découverte narrative, proportion et lisibilité du catalogue. Une nouvelle table de commandement OpenAI est intégrée comme objet indépendant ; quatre feuilles ennemies supplémentaires sont produites mais restent candidates. Le jeu n'est pas déclaré commercial complet, fidèle 1:1 ou exhaustif par rapport à toutes les demandes historiques.

La synthèse couvre les trois audits parallèles et l'intégration catalogue/artistique V72. Elle ne signifie pas que tous les chats ChatGPT et toutes les lignes du fichier Excel ont été relus et rapprochés d'une fonctionnalité jouable. La réalisation complète de BIOFORGE, de tous les PNJ/props/véhicules/armes/ennemis et de leurs animations n'est pas acquise.

Sources détaillées : [gameplay](AUDIT_GAMEPLAY_V72.md), [level design et props](AUDIT_LEVEL_PROPS_V72.md), [narration et durée de vie](AUDIT_NARRATIVE_LONGEVITY_V72.md), [provenance artistique](ART_PROVENANCE_V72.md), [revue du candidat 083](references/V72_083_CANDIDATE_QA.md).

## Priorités corrigées dans ce lot

| Priorité | Domaine | Défaut et correction effective | Portée de la preuve |
| --- | --- | --- | --- |
| P0 | Combat et réseaux de conduits | Deux comparaisons `undefined === undefined` pouvaient supprimer les dégâts joueur et la mise à jour ennemie hors réseau. Les exemptions exigent maintenant un transit et un réseau réellement présents. | Tests de dégâts, protection en vrai transit et comportement hors réseau. |
| P1 | Commandes et pause | Les huit actions publiques sont suspendues lorsque la mission ne peut pas les accepter ; champs texte, dialogues, IME et raccourcis système ne déclenchent plus les commandes du jeu. | Tests de ressources et états inchangés en pause/chargement ; contrôle acteur vivant et co-op activée. |
| P1 | Focus et boucle de jeu | Blur/onglet masqué mettent en pause et vident les entrées tamponnées. Un jeton invalide les anciens callbacks RAF après stop/start. Fermer les archives ne réactive pas le combat après une perte de focus. | Tests de pause, saut tamponné, dialogue et boucle unique. |
| P1 | Sauvegarde et progression | Le chargeur du fusil est rétabli avant ses munitions. Oxygène, statuts temporaires et équipements déployés survivent à la reprise ; une sauvegarde de base rejetée ne modifie plus le niveau. | Reprise sérialisée, migration, validation des déploiements et idempotence ; victoire ordinaire sans récompense dupliquée. |
| P1 | Équipements et combat | Les ralentissements ne se multiplient plus à chaque frame ; la sentinelle vérifie une portée 2D et l'occlusion des murs, planchers et portes. | Comparaison à 30/60/120 mises à jour par seconde et tests d'obstacles. |
| P1 | Échelles, plafonds et annexes | Sorties latérales/sauts d'échelle, collision de tête, sous-pas physiques et placement des supports corrigés. Les portes et stations ont des volumes dégagés. | Dix annexes et leurs parcours/connexions ; ce n'est pas un playthrough de toutes les campagnes. |
| P1 | Reines et arènes | Queen/Ripper Queen passent à un rendu de 448 × 340 pixels de jeu ; corps, hitbox et pied suivent. Les arènes recherchent une surface libre sans réduire la reine pour une porte humaine. | Contrats de collision, mêlée bilatérale et migration ; 36 plans de trois templates et douze variantes testés. |
| P1/P2 | Props, profondeur et proportions | Bornes alpha V71 consommées ; foregrounds isolés ancrés dans la salle, accessoires réellement dessinés, caisses supportées et collisions cohérentes. Les humains partagent un étalon ; l'objet ne gonfle plus à proximité. | Trente bornes alpha contrôlées, tests de placement/rendu ; les bitmaps partagés ne deviennent pas autant de créations dédiées. |
| P1 | Table de commandement | La vue plongeante surdimensionnée est remplacée par une nouvelle élévation frontale OpenAI indépendante, en alpha, rendue 520 × 82,63 pixels avec pied au sol. | Hashes, transparence, cadrage, placement et reconstruction déterministe `--check`. Source conservée. |
| P1 | Archives et enquête | Un registre vide ne révèle plus les preuves ; relations et verdict exigent les découvertes réelles. Les déclarations sources ne sont pas remplacées par du texte inline ; un refus ne devient pas un succès affiché. | Régressions reproduites avant correction ; contrat QZ-17, choix exclusif et reprise préservés. |
| P2 | Catalogue et échelle | Cartes par incréments de 48, recherche sans plafond historique de 250, vignettes statiques et détail seul animé. Dimensions rectangulaires/pivots du runtime, comparaison facehugger/marine/reine à une échelle commune. | Tests catalogue, probe de 48 à 571 fiches avec un seul timer ; inspection navigateur du bestiaire à 1280 pixels. |
| P2 | Catalogue, états incomplets et clavier | La dernière page focalise sa première nouvelle carte. Un montage de média impossible affiche « MÉDIA VISUEL NON DOCUMENTÉ » en carte, portrait et comparaison, sans silhouette fabriquée. | Deux régressions testées en échec avant correction puis corrigées ; test avec animations autorisées et nettoyage des timers. |

L'échelle de rendu est exprimée en pixels de jeu, pas en mètres canoniques. Les gardes de sauvegarde ne constituent pas un anti-triche serveur. La référence de gabarit royale et la distinction adaptation/canon sont détaillées dans l'audit gameplay.

## Production artistique : compter le bon objet

État relu avec `node scripts/enemy-batch-production.mjs status` pendant cette synthèse :

| Mesure | Valeur | Ce qu'elle signifie, et ne signifie pas |
| --- | ---: | --- |
| Profils du roster | 571 | Catalogue d'identités, pas 571 profils nouveaux acceptés artistiquement. |
| Jobs de production | 570 | Le profil baseline est compté séparément. |
| Feuilles requises par la queue active | 2 457 | Budget de clips requis, pas nombre d'images créées. Le budget historique gelé de 2 437 est un autre instantané. |
| `verifiedGeneratedBoards` | 212 | Générations reconnues par la queue ; pas validation de fidélité/animation de tous les profils concernés. |
| `recoveredPromptGapBoards` | 4 | Une lacune de provenance de prompt subsiste ; ne pas transformer ces récupérations en acceptation finale. |
| Profils `integrated` | 5 | Acceptés puis intégrés selon le contrat de cette queue. |
| Baseline déjà intégrée | 1 | Héritage V65 ; ne pas la recompter comme nouvelle livraison V72. |
| Profils `pending-reference` | 487 | Références verrouillées encore manquantes. |
| Autres statuts | 34 prêts, 43 générés, 1 rejeté, 0 accepté en attente | Un profil généré n'est pas automatiquement promu. |

La nouvelle table est un prop accepté, distinct de cette queue ennemie. Enemy-083 Albino Dust Runner possède quatre feuilles de huit poses et un atlas candidat de 32 poses : attente, déplacement, attaque et mort corrigée. Son mouvement reste trop proche de l'attente. Ancrages, échelle inter-clips, timing et continuité ne sont pas approuvés : **zéro promotion runtime V72 pour ce candidat**. Les premiers essais incorrects restent rejetés ou hors livraison ; leurs fichiers ne servent pas à gonfler les compteurs.

Le catalogue possède 538 fiches ennemies avec une feuille et des dimensions résolvables, et 33 sans média de feuille exploitable lors de la revue. Ces 538 résolutions incluent des contrats/assets existants et ne prouvent ni 538 dessins originaux dédiés, ni 538 animations acceptées. Les flags historiques `canonExact`, `CANON_REFERENCE` ou `releaseReady` ne sont pas des certificats de reproduction pixel par pixel.

## Validation et état des preuves

| Surface | Dernier résultat disponible | Limite à respecter |
| --- | --- | --- |
| Suite globale | 989 tests : 988 réussis, 1 ignoré, 0 échec, dernière réexécution après les retouches mobiles. | Tests automatiques, pas une recette humaine de toutes les campagnes. |
| Lint / build | Lint de 286 modules et build V72 réussis ; build également réexécuté après navigation mobile. | La publication est vérifiée séparément dans VALIDATION_V72.md. |
| Catalogue ciblé | 27/27 tests runtime/UI/échelle après focus et états de média manquant ; syntaxe et diff contrôlés. | Faux DOM pour ces tests ; la mise en page exige la recette navigateur. |
| Accueil navigateur | Écran d'accueil inspecté, ouverture correcte dans la capture d'intégration. | Cela ne prouve pas une partie complète. |
| Bestiaire desktop | Inspection à 1280 pixels : échelle commune facehugger/marine/reine, portrait à ratio corrigé. | La visibilité d'un clip n'est pas une revue de continuité de tout le roster. |
| Bestiaire mobile | À390×844, largeur document390px ; liste bornée360px et sélection défilant vers le dossier. Capture finale inspectée : comparateur complet, commandes du clip accessibles. | La première inspection plaçait le dossier à3568px ; après correction il commence à827px avant sélection et s'aligne sous l'en-tête au clic. |
| Table OpenAI | Export accepté et branché, contrôles alpha/hash/cadrage/placement et extraction reproductible réussis. Capture de la salle de briefing inspectée : table frontale entière, acteurs et table au même sol, sans fond blanc. | Approche préparée dans une session QA locale ; ce n'est pas un parcours complet de toutes les salles. |
| Publication | Commit, push et déploiement relèvent de la clôture par l'intégrateur. | Aucune réussite de publication n'est déduite ici d'un build local. |

Les rapports de sous-audit gardent leurs compteurs intermédiaires : ils documentent le moment de chaque preuve, pas un échec du dernier lot. La clôture doit enregistrer les nouvelles preuves navigateur et les résultats de revalidation après les dernières retouches, puis seulement l'identifiant de commit et l'état de déploiement réellement obtenus.

## Dettes ouvertes et critères de fermeture

| Priorité | Dette restante | Preuve nécessaire pour la fermer |
| --- | --- | --- |
| P1 | Couverture des demandes V1 → dernière version, chats et Excel non exhaustive ; BIOFORGE complet non réalisé. | Matrice de chaque exigence vers code, contenu jouable, sauvegarde et preuve de recette ; ne pas fermer une ligne avec un bouton ou une simple description. |
| P1 | Majorité des profils ennemis non acceptés par la chaîne dédiée ; PNJ, véhicules, armes, objets et clips manquants. | Références verrouillées, générations dédiées, revue de chaque clip, ancrages/échelle, intégration réelle et combat testés. Les lots seuls ne garantissent pas la fidélité. |
| P1 | Course du candidat 083 insuffisamment distincte de l'attente. | Nouveau cycle et revue animée des appuis, récupération, impact, racine et transitions avant promotion. |
| P1 | Traversée de toutes les campagnes, softlocks rares et cohérence de tous les retours de salle non démontrés. | Playthroughs persistants multi-difficulté, chemins aller/retour, portes conditionnelles, morts/reprises, arènes et équipements. |
| P1/P2 | Fonctions des annexes partiellement couvertes : props de métier, PNJ dédiés, exercices physiques, archives jouables et CCTV complets restent à produire. | Fonction jouable et médias dédiés vérifiés par salle ; le drapeau `independent-prop-bitmaps` n'est pas retiré par cet audit. |
| P2 | Autres perspectives et liserés clairs sur les anciens props. | Inspection et correction ciblée de chaque ancien bitmap ; l'alpha présent ne certifie pas à lui seul des contours propres. |
| P2 | Lore complet et fidélité 1:1 non certifiés. | Vérification sourcée des identités et variantes, statut explicite des adaptations, revue visuelle comparée ; ne pas extrapoler un label de référence vers une garantie sur l'image. |
| P2 | Durée de vie, rythme et variété non mesurés. | Playthroughs chronométrés par difficulté et parcours, inventaire des niveaux/situations réellement distincts et retours joueurs. |
| P2 | Finition commerciale : lisibilité prolongée, continuité animée, audio-visuel, performance et accessibilité sur la cible complète. | Sessions longues sur appareils cibles et recette de bout en bout ; nombre de tests ou de campagnes insuffisant à lui seul. |

QZ-17 vérifié comprend quatre preuves et un verdict à deux options exclusives, avec conséquences persistantes. Ce sont deux routes de progression, pas deux campagnes nouvelles entièrement écrites. Les textes sources sont conservés et QZ-17 reste une fiction du projet, pas une scène officielle de la franchise. **Aucune durée de vie en heures n'est annoncée** : elle n'a pas été mesurée.

Conclusion : des P0/P1 concrets sont fermés et une nouvelle pièce artistique est utilisée en jeu. L'objectif « jeu commercial complet, sans manquants et fidèle 1:1 » reste une cible à produire et à vérifier, pas le statut de cette livraison.
