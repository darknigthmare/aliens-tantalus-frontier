# V83 — exigences sources : prologue, Echo-9 et recrutement

## Portée et statut

Audit des sources **locales** des 26 conversations, recoupé avec le runtime présent au début du lot V83. Aucun réseau, aucune génération d'image et aucune implémentation du prologue/recrutement ne sont revendiqués par ce document. Les comptes rendus V76 sont des preuves de demandes, pas des preuves d'exécution.

| Demande | Statut constaté | Ce qui manque fondamentalement |
| --- | --- | --- |
| Créer des marines uniques, chat #5 | **MISSING** | Génération causale, candidats persistants, matériel individuel, histoire et relations |
| Lot bugfix Echo-9/prologue, chat #7 | **PARTIAL** | Créateur, réveil cryo physique, portraits et costumes individuels, refonte Echo-9 complète |
| Prologue et création de personnage, sous-demande #7 | **MISSING** | Parcours de nouvelle partie, scène physique, dialogue dédié et reprise à chaque étape |

Le progrès de combat V83 est un travail parallèle : il ne ferme ni ces demandes ni les 26 conversations. Aucun statut commercial complet n'en découle.

## Exigences explicitement retrouvées

Sources : [group-gameplay.md, section 5](references/v76-conversation-audit/group-gameplay.md#5-créer-des-marines-uniques), lignes 154–181 ; [section 7](references/v76-conversation-audit/group-gameplay.md#7-décrire-les-bugfix-codex), lignes 213–268. La [matrice V76](references/V76_CHATGPT_PROJECT_GAP_MATRIX.md), lignes 36 et 38, consolide les mêmes demandes. Le [backlog V78](BUGFIX_BACKLOG_V78.md), lignes 7 et 51, confirme qu'elles restent à produire.

### Recrutement

La demande utilisateur est que chaque nouveau Marine ait un passé, des stats et un équipement en rapport pour éviter des recrutements répétitifs. Le compte rendu conserve le contrat présenté :

- Origine, activité antérieure, formation, événement, motivation, attaches et objet personnel structurés.
- Passé → huit aptitudes justifiées → équipement cohérent, sans classe rigide.
- Budgets statistiques et matériels séparés ; incompatibilités contrôlées.
- Identité stable, candidats persistants, anti-répétition ; aucun reroll ni duplication lors d'un transfert.
- Équipement échangeable, historique de campagne réel et relations.
- Résumé, fiche détaillée et comparaison dans Echo-9.

### Echo-9 et prologue

- Équipe active séparée de la réserve ; portraits et santé/stress/fatigue lisibles.
- Signaux animés demandés pour ces jauges : ils doivent représenter les valeurs du jeu, sans inventer une mesure physiologique réelle.
- Personnalisation par `crewId`, ouverte depuis la fiche individuelle, miniatures dans une fenêtre interne défilante.
- Nouvelle partie : création du joueur, validation, réveil de cryostase, personnel situé à proximité, dialogue expliquant le lieu et sa mission dans les Marines coloniaux.
- Prologue physique et reprise de sauvegarde ; pas une succession de boutons tenant lieu de déplacement.

### Limites des sources

La section 7, ligne 245, mentionne trois documents/prompts préparés : diagnostic V74, audit global, prologue/synthétiques/tir diagonal. Leurs pièces jointes autonomes n'ont pas été retrouvées dans les sources locales inspectées. Le compte rendu ne contient ni dialogue exact du prologue, ni nom des huit aptitudes, ni table de génération chiffrée. Toute future définition de ces éléments doit être identifiée comme une proposition de conception du projet, pas comme une transcription retrouvée ou un fait canonique.

## Constats runtime et risques de persistance

1. `src/app.js:574–582` crée une sauvegarde immédiatement ; `TitleScreenController.requestNewTimeline()` dans `src/title-screen-v61.js` poursuit vers `hub`. Aucun parcours créateur/cryo n'est exécuté.
2. `src/save.js:191–200` nomme le joueur « Mara Vega », également PNJ commandant indépendant `crew-01-mara-vega` dans `src/content-core-v50.js:423–437` et `src/hub-v52-runtime.js:61`. L'identité personnalisée du joueur doit être distincte : ne pas renommer le PNJ par effet de bord.
3. `src/save.js:1656–1677` reconstruit l'équipage exclusivement depuis les 16 membres de `base.crew`. Une recrue ajoutée naïvement serait perdue au chargement. `knownCrewIds` vient aussi de ce catalogue fixe et filtre affectations/opérations ; le changement doit couvrir les deux mécanismes.
4. `src/app.js:961–994` affiche `CREW.map(...)` : grille fixe, pas de portraits, candidats, biographie ni réserve séparée. La personnalisation lit `save.player.costumeId` et `applyCostume()` ne modifie que le joueur (`src/save.js:1040–1045`).
5. Le manifeste d'opération et `resolveOperationLoadout()` dans `src/save.js` associent catalogue fixe et état sauvegardé. Une nouvelle identité nécessite un résolveur commun au manifeste, aux missions, aux dialogues et à l'interface.
6. `src/player-visual-contract-v81.js` autorise exactement cinq feuilles Echo-9, une grille 4×4 de cellules 256×256, garde 16, pivot pieds (128,240). Remplacer au hasard cette identité par une feuille PNJ reproduirait le mélange de personnages corrigé en V81.

## Lore et ressources réutilisables

Les personnages V62 sont explicitement des créations Tantalus Frontier : `src/npc-dialogue-v62.js:73–75,234–235`, `canonStatus: project-fiction-not-franchise-canon`. Conserver les identités, les attributions et les textes existants. Mara coordonne la relève ; Noor Okafor assure triage, soins et suivi du stress. Ne pas attribuer leurs répliques à un personnage canonique de la franchise.

| Ressource existante | Usage possible et réserve |
| --- | --- |
| `src/hub-game.js`, salle `cryo-bay`, pont 0 | Réveil dans un espace déjà traversable ; `hub.positionX`, `deck`, `roomId`, `facing` existent |
| `assets/openai/hub/layers/command-cryo-{far,mid,foreground,overhead}.png` | Composition modulaire existante, à auditer visuellement pour la scène ; pas preuve d'animation de capsule |
| `assets/openai/hub/props/cryopod.png` | Prop indépendant ; pas une séquence d'ouverture/réveil dédiée |
| `assets/openai/sprites/normalized/npcs/noor-okafor-locomotion-sheet.png` et `noor-okafor-mission-sheet.png` | Personnel médical déjà représenté ; déplacement temporaire à écrire sans dupliquer Noor |
| `src/hub-v52-runtime.js:64,67` | DAVID-8R est actuellement affecté à la cryo, Noor au bloc médical : ne pas écraser silencieusement ces affectations |
| `src/hub-dialogue-ui-v76.js`, `src/npc-dialogue-v62.js` | Modale/focus, mémoire et routines existantes, réutilisables sans réintroduire le voile bloquant |
| `assets/openai/ui/dialogue/mara-vega-operations-v61.png`, `sanaa-doyle-armory-v61.png` | Deux portraits dédiés présents ; aucun portrait Noor dédié retrouvé dans ce répertoire |
| `assets/openai/ui/customization/echo9-customization-mannequin-v61.png` | Illustration de présentation existante, pas preuve d'apparences individuelles animées |

## Séquence d'implémentation proposée — non livrée ici

1. **Persistance versionnée.** `playerIdentityV83` distinct du PNJ Mara ; `prologueV83` avec version, étape, nœud, choix et événements consommés. Migration déterministe et validation bornée. Les anciennes campagnes sont des parcours antérieurs : aucun réveil imposé rétroactivement.
2. **Parcours physique minimal complet.** Créateur → validation atomique → cryopod → reprise des déplacements → interaction de proximité avec l'accueil → marche jusqu'au briefing. Les déplacements et dialogues terminés se sauvegardent ; aucune récompense ni transition ne peut se répéter après reprise.
3. **Recrutement transactionnel.** Proposition de contrat `recruitmentV83 { seed, generatorVersion, nextId, candidates, usedSignatures }`. Chaque personnage possède son ID, identité, passé, aptitudes et leurs justifications, matériel individuel, apparence, historique et relations. Recruter transfère le même candidat ; le matériel ne se recopie pas dans deux inventaires.
4. **Consommateurs communs.** Généraliser migrations, Echo-9, manifeste, dialogues, escouades et résolution visuelle. Le manifeste fige les caractéristiques et équipements engagés pour préserver l'opération en cours.
5. **Art dédié.** Portraits, ouverture/réveil cryo et apparences réellement compatibles avec le contrat V81 ; conserver des statuts art explicites tant que les variantes n'existent pas.

## Critères de fermeture

- Reprise à chaque étape du prologue, sans rejouer choix/objets/effets ; annulation du créateur sans écraser l'ancienne partie ; isolation des profils.
- Identité du joueur distincte de Mara et persistante jusque dans le hub, le manifeste et les missions.
- Même pool de candidats après rechargement ; IDs uniques ; transfert unique ; équipement et inventaire sans duplication ; recrues non supprimées par migration.
- Effets observables des aptitudes et du matériel pendant les missions, et retours de campagne dans l'historique individuel : pas seulement une fiche descriptive.
- Équipe/réserve, comparaison et personnalisation individuelle contrôlables au clavier/manette/tactile ; fermeture/focus et défilement vérifiés.
- Contrôle visuel de l'identité, du pivot, de l'échelle, de la perspective et des animations. Les fichiers existants ne suffisent pas à certifier les nouveaux usages.

Ces critères restent **MISSING/PARTIAL** tant que leur implémentation et leurs preuves runtime n'existent pas. Ce document ne modifie pas les audits historiques V76/V78/V81.


## Addendum V85 — 2026-09-13 : source directe du recrutement retrouvée

Ce complément ne réécrit pas le constat historique fondé sur les seules archives locales. Une nouvelle lecture directe de la conversation **Créer des marines uniques**, thread `6a9df801-9e7c-83ed-8104-244ed10c8587`, a retourné son unique tour complet, sans message tronqué (`hasMore: false`, `nextCursor: null`). Le verbatim et les horodatages sont conservés dans [V85_CHATGPT_RECRUITMENT_SOURCE.md](references/V85_CHATGPT_RECRUITMENT_SOURCE.md).

La réserve ancienne « ni nom des huit aptitudes, ni table de génération chiffrée » concernait le compte rendu local alors disponible. La source directe précise maintenant **Tir, Physique, Mobilité, Sang-froid, Technique, Secourisme, Perception et Cohésion**, la formule **socle de formation + expériences antérieures + formations complémentaires**, un exemple expliqué **Technique 74 = 50 + 16 + 8**, ainsi que quatre recrues originales indicatives de total égal (400, les aptitudes non mentionnées valant 50). Elle impose des budgets séparés pour aptitudes et matériel, sans chiffrer le budget matériel ni les formules finales de gameplay.

Ces éléments sont désormais des exigences retrouvées, et non une reconstruction à inventer. Leurs exemples demeurent des propositions originales Tantalus Frontier, pas des personnages canoniques. Les IDs techniques de recrues, objets, aptitudes et événements ne sont pas définis par le chat et doivent être conçus explicitement dans le projet. Les pièces jointes autonomes évoquées pour #7 ne sont pas récupérées par cette nouvelle preuve. Aucune implémentation du recrutement ni clôture de #5 n'est revendiquée par cet addendum.
