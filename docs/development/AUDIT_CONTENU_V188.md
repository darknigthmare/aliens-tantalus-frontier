# Audit du contenu — bible contre code (lot V188)

Fichier source de développement, exclu du build public (`scripts/verify-public-release-v86.mjs`).

- **Base examinée :** commit `250d81a` (branche de travail du lot V188, 2026-11-15).
- **Référence :** bible `docs/narrative/CAMPAGNE_PRINCIPALE.md` (§4-§9, §13-§18, §26, §37.3, §38.12, §42-§44, §53, §56) et décisions du questionnaire `docs/development/QUESTIONS_PROPRIETAIRE_V188.md`. Une question sans réponse prend l'option **(Recommandé)**.
- **Méthode :** chaque élément prévu est cherché dans `src/` (identifiants, modules, raccordement à `app.js`, `save.js`, `content.js`). Un élément seulement listé, décrit ou « préparé hors dépôt » n'est pas compté comme fait.

## Statuts

| Statut | Sens |
| --- | --- |
| **Fait** | Jouable ou utilisé, raccordé au chargement, au jeu, à l'interface et à la sauvegarde. |
| **Partiel** | Existe mais incomplet : dialogue, mission, nœud ou condition manquant, valeur provisoire, ou bouchon. |
| **Manquant** | Aucun code ni donnée. |
| **Bloqué (art)** | Demande des images ou animations à produire (aucune génération dans ce lot, décisions Q79 et Q80). Le code peut exister en primitives Canvas. |

## Synthèse au commit `250d81a`

| Domaine | Fait | Partiel | Manquant | Bloqué (art) |
| --- | --- | --- | --- | --- |
| Prologue et tranche verticale (§4, §53.1) | 6 | 1 | 0 | 0 |
| Enquête Cocyte, actes I-V (§5) | 3 | 4 | 2 | 0 |
| Front colonie Port-Méridien (§6, §43) | 1 | 2 | 4 | 0 |
| Front station Asphodèle (§7, §42) | 0 | 0 | 5 | 1 |
| Quêtes du Tantalus (§8) | 0 | 1 | 3 | 0 |
| Opérations secondaires (§9) | 1 | 2 | 0 | 0 |
| Partie II : voyage et campagnes annexes (§13-§18) | 0 | 3 | 4 | 0 |
| Archives MIRE (§26) | 0 | 1 | 3 | 0 |
| Mécaniques nouvelles (§37.3, §38.12) | 2 | 3 | 11 | 0 |
| Renommage des noms hérités (§1.5, §52.3) | 1 | 1 | 0 | 1 |
| **Total (66 lignes)** | **14** | **18** | **32** | **2** |

Les comptes portent sur les lignes des tableaux ci-dessous ; une ligne peut regrouper plusieurs missions (S1-S4 en compte quatre). Trois éléments en dette d'art restent comptés « Partiel » parce que leur règle est jouable (Acte IV, Cargo brutal, chapitres de la campagne 1) ; ils sont signalés **art** dans la colonne Constat.

### Manques principaux, par impact joueur

1. **Front station Asphodèle (§7)** : aucune des missions `station-intro-silence`, S1-S4, aucun choix CASSIUS. La pièce *Ordres de livraison archivés par CASSIUS* du dossier QZ17 est affichée « pas encore jouable » et l'option finale *Transmettre* ne peut pas s'ouvrir. Q6 : produire S1-S4 avant le hub.
2. **Quêtes de l'équipage (§8.1)** : aucune des 16 quêtes ; le rapport `npc-dialogue-v62.js` n'a que ses six choix génériques. Q9 : commencer par DAVID-8R, Harlow, Rook et Vega.
3. **Acte V et fins (§5.6-§5.8)** : conseil de guerre, course APC, trois fins et épilogue absents ; la logique du choix final existe (`story-dossier-v188.js`) sans écran. Q1-Q5. *Mis à jour par la spec 006 : voir « Résultat du lot (spec 006) ».*
4. **Missions de la colonie C1-C5 et annexes (§6.2)** : aucune. La reconstruction est validée par n'importe quelle opération réussie sur Cocyte (adaptation provisoire). Q25.
5. **Voyage galactique (§13.2)** : le saut coûte du carburant, mais aucun temps ne passe. Q21 : coût fixe par saut, en carburant et en jours, affiché avant le départ.
6. **Campagnes annexes (§14-§18)** : les chapitres V131 sont jouables isolément, mais aucune campagne, aucun arc, aucun appel ; leur `worldId` reste `world-05-lethe`. Q13 et Q15 : après l'Acte V, campagne par campagne.
7. **Archives MIRE généralisées et protocoles (§26)** : seule l'archive 001 existe ; aucun protocole. Q18 et Q19 : archives originales d'abord.

## 1. Prologue et tranche verticale (§4, §53.1, §56.2)

| Élément | Statut | Constat dans le code |
| --- | --- | --- |
| CIN-00 à CIN-03, P-1, P-2, P-3 | Fait | `story-cinematics-v188.js` (`cin-00` à `cin-03`, `cin-p2`, `cin-p3-*`), `intro-sequence-v188.js`, `hub-prologue-rooms-v188.js`, `port-meridien-v90.js` |
| État de campagne `storyCampaign` | Fait | `story-campaign-v188.js`, champ `storyCampaignV188` migré dans `save.js` |
| Briefing → QZ-18 → compte rendu (CIN-20, CIN-20-Rook) | Fait | `deriveStoryCampaignV188`, ★ au Commandement |
| Bruitages prioritaires (40) | Fait | `audio-cues-v188.js`, `scripts/generate-audio-v188.mjs` |
| Écran d'objectif (M, pause) | Fait | `mission-objective-panel-v188.js` |
| Emplacements musicaux alerte, boss, fins | Fait | Emplacements et accroches ; morceaux Flow attendus du propriétaire |
| Test de la tranche par 3 à 5 joueurs | Partiel | Protocole prêt, session non tenue (§53.11, Q100) |

Les statuts « À faire » du §53 (tir, tension, caste, accessibilité, répliques, sauvegarde) sont périmés : le §56 les donne faits en V188. Le §53 n'a pas été réécrit.

## 2. Enquête Cocyte (§5)

| Élément | Statut | Constat |
| --- | --- | --- |
| Acte I QZ-17 (`special-narrative-qz17`) | Fait | Chapitre et retour avec Inez (`cin-qz17-retour`) ; ascenseur de service « B » à placer (Q34) |
| Acte II QZ-18 (`special-archive-relay`) | Fait | Enquête et verdict |
| Acte III M577 → C-12 et manifeste | Fait | `special-apc-convoy`, `special-c12-horde`, `M577_MANIFEST_V188`, CIN-31 |
| Missions ajoutées §5.10 (`story-quai-nord`, `story-route-depot`, `story-moyeu`, `story-recuperation`) | Manquant | Aucun identifiant dans `src/` |
| Interlude « Quarantaine » | Partiel | Crise du pont 2, Jun Park, choix détruire/capturer ; scènes de BISHOP-9 complètes à écrire (§5.4) |
| Acte IV Cocon noir | Partiel | `special-black-cocoon`, CIN-51 ; **art** du cocon en dette |
| Dossier QZ17 (7 pièces) | Partiel | 5 pièces lisibles ; CASSIUS (S2) et Wren (`colony-a-quai`) affichées « pas encore jouables » |
| Choix final et fins (§5.7.1) | Partiel | Règles `finalChoiceOptionsV188`, `resolveFinalChoiceV188` testées, sans écran ni conseil de guerre. *Spec 006 : conseil et trois fins jouables (Partiel).* |
| Acte V « Non viable », course APC, épilogue | Manquant | Q1, Q2, Q5. *Spec 006 : Partiel, course APC dédiée absente.* |

## 3. Front colonie — Port-Méridien (§6, §43)

| Élément | Statut | Constat |
| --- | --- | --- |
| `colony-intro-quai`, `colony-intro-doyenne` | Fait | Séquence du quai et visite guidée `cin-doyenne` |
| Reconstruction : 7 chantiers, 3 niveaux, paliers (§6.3) | Partiel | `colony-reconstruction-v188.js` : règles, coûts [PROPOSÉ], table au Commandement. Manquent : la console du quai (Q26), le palier *Libre*, la validation par une mission **locale** du chantier (toute opération réussie sur Cocyte valide le plus ancien niveau), les effets des paliers (annexes, recrutement de Nadia Bensaïd) |
| Gestion de la colonie : quartiers visitables V2 (§43, Q24) | Partiel | Seul le quai existe en salle ; les sept quartiers ne sont pas construits |
| Missions principales C1-C5 | Manquant | Q25 : C1 puis C5 |
| Annexes (7) dont `colony-a-quai` (pièce Wren) | Manquant | — |
| Contrats locaux rejouables (8) | Manquant | Les objectifs génériques existent (`content-core-v50.js`) sans contrat dédié |
| Vie de la colonie : événements entre deux missions (Q29) | Manquant | — |

## 4. Front station — Asphodèle (§7, §42)

| Élément | Statut | Constat |
| --- | --- | --- |
| `station-intro-silence` (Calme, à bord) | Manquant | Débloqué par la quête de Rook (§8.1) |
| S1 L'arrimage, S2 La voix de CASSIUS, S3 Les ponts scellés, S4 Le hub Asphodèle | Manquant | Q6 : produire S1-S4 comme missions avant le hub ; Q103 : feature Spec Kit |
| Choix CASSIUS (réécrire / brider / effacer) | Manquant | Q7 : choix définitif |
| Annexes (7) et contrats locaux (6) | Manquant | Dont *Relais en dérive* ×3, condition de la salle des relais |
| Hub Asphodèle : 7 modules (§7.3, §42) | Manquant | Q22 et Q23 : modules dans le moteur du hub, anneau en couloirs V2 |
| Décor de station, CASSIUS, récupérateurs, dropship d'Echo-8 (§29.4) | Bloqué (art) | Primitives Canvas possibles (Q79) |

## 5. Quêtes du Tantalus (§8)

| Élément | Statut | Constat |
| --- | --- | --- |
| Rapport et confiance de l'équipage (`npc-dialogue-v62.js`) | Partiel | Socle présent : 6 choix génériques, renouvellement 8 h ; aucune quête |
| 16 quêtes de l'équipage (§8.1) | Manquant | Q9 : DAVID-8R, Harlow, Rook, Vega d'abord |
| Vie à bord (6, §8.2) | Manquant | Le casier vide d'Echo-8 existe comme objet (`hub-echo8-locker-v188.js`), pas comme fil de quête |
| Recrutement (4, §8.3) | Manquant | Les quatre noms sont des candidats génériques de `crew-recruitment-v85.js`, sans quête ni condition de front |

## 6. Opérations secondaires (§9)

| Élément | Statut | Constat |
| --- | --- | --- |
| Systèmes de survie Alien | Fait | Chapitre effectif |
| Cargo brutal | Partiel | Jouable ; **art** de la Matriarche en dette |
| Doctrine Alpha / Bravo | Partiel | Jouable ; coop étendue absente |

## 7. Partie II — voyage et campagnes annexes (§13-§18)

| Élément | Statut | Constat |
| --- | --- | --- |
| Carte galactique et saut (`navigate:galaxy`) | Partiel | `galaxy-jump-v115.js` : carburant `2 + ⌈danger/3⌉`, séquence de 8 s ; **aucun temps de voyage** (Q21) |
| Messages en retard, colonies qui évoluent pendant le voyage (§13.2) | Manquant | — |
| Chapitres V131 raccordés à leur campagne (§13.4) | Partiel | Jouables isolément, `worldId` `world-05-lethe` ; déplacement campagne par campagne (Q15) |
| Campagne 1 *La Saison des Reines* (§14) | Partiel | Chapitres Abysse Noir, Broodstorm, Reine-Mère jouables ; **art** en dette ; TR-0 `missing` ; arcs, appels et quêtes absents |
| Campagnes 2 à 5 (§15-§18) | Manquant | Chapitres V131 réutilisables ; aucun arc, appel, cinématique ni quête liée. Q13 : après l'Acte V |
| Mondes proposés (Kéos, Murmure, Tyndare, Pangaea, Hiéron, *Clémence*, *Bonne-Espérance*) | Manquant | Absents du catalogue |
| Déblocage et ordre des campagnes (§13.5) | Manquant | — |

## 8. Archives MIRE (§26)

| Élément | Statut | Constat |
| --- | --- | --- |
| Archive 001 Nostromo | Partiel | `mire-archive-001`, dettes `complete-nostromo-cast`, `complete-historical-campaign` |
| Archives originales 002-006, `mire-nostromo-b` | Manquant | Q18 : originales d'abord |
| Archives fidèles (8) | Manquant | Condition de licence à confirmer (Q18) |
| Protocoles MIRE (5, un seul à la fois, §26.9) | Manquant | Q19 validée par défaut ; dépendent des archives 002-006 |

Les 206 paires `pair-NNN-mire` sont des reconstitutions génériques, pas les archives du §26.

## 9. Mécaniques nouvelles (§37.3, §38.12)

| Mécanique | Statut | Constat |
| --- | --- | --- |
| Lecture des faux signaux du détecteur | Fait | Fausses alertes V188 (§56.4) |
| Chantiers de reconstruction | Fait | Voir §3 ci-dessus (règles partielles) |
| Second hub (Asphodèle) | Manquant | Voir §4 |
| Choix de protocole MIRE | Manquant | Voir §8 |
| Capture d'organisme vivant | Partiel | Objectif générique `capture a live organism` et choix de l'Interlude ; pas de mécanique dédiée |
| Commande d'arrêt synthétique, accès avec indice de confiance | Partiel | Chapitres Jeri, A.T.A.X.-Q (`hive-control-v131.js`) ; aucun système commun |
| Largage de remorque, manifeste fret / passagers | Partiel | Manifeste du M577 (Acte III) ; largage absent (Q17) |
| Apesanteur, gravité faible | Manquant | — |
| Contamination et traitement, transformation d'un Marine | Manquant | Q57 : avec *Fièvre noire* |
| Test biologique avec incertitude | Manquant | — |
| Oxygène limité en plongée | Manquant | — |
| Face-à-face sans tir, audience à choix de pièces | Manquant | Q17 : première mécanique à créer |
| Retrait d'embryon | Manquant | — |
| Blocage de murs mobiles | Manquant | — |
| Choix CASSIUS, isolement des synthétiques du bord | Manquant | Voir §4 |
| Vue plan au sol `ground-plane` V2/V3 (§40.4) | Manquant | Salles hybrides 2D / 2,5D faites (§56.12) ; plan au sol V3 reporté (Q83) |

## 10. Renommage des noms hérités (§1.5, §52.3)

| Élément | Statut | Constat |
| --- | --- | --- |
| Mondes, secteur, Station Orphée, TR-0 (PR #42) | Fait | `content-core-v50.js` affiche Cocyte, Tantalus Reach, Station Orphée ; `hive-world` titré « TR-0 : LA RUCHE-MONDE » |
| Libellés de scène `LETHE · …` restants | Partiel | Trois libellés dans `campaign-lethe-story-v163.js` (accès C-12, galeries) |
| Enfants de l'Hôte Parfait | Bloqué (art) | Q47 : retirer du tirage tant que l'art original manque |

Les fiches de référence `premium-personnel-v119.js` et `franchise-costumes-v119.js` gardent volontairement leurs noms d'œuvre (§52.3). Les identifiants (`world-05-lethe`, `campaign-lethe-*`, `special-*`) ne changent pas.

## 11. Éléments qui demandent des images générées

Aucun n'est produit ici. Chaque élément jouable utilise des primitives Canvas ou attend son art.

- Décor de station Asphodèle (anneau, pont de contrôle, laboratoire, serre, salle des relais, mémorial), noyau et interface de CASSIUS, récupérateurs de Grue, dropship d'Echo-8 (§29.4).
- Quartiers de Port-Méridien en V2, habitants nommés (portraits de Wren, Ferro, Sarrazin en primitives selon Q78).
- Poses de dialogue de l'équipage, objets de quête (§29.5), planches des recrues.
- Art en dette des chapitres V131 et de Cargo brutal (`limitations` de `special-operations-v131.js`).
- Cinématiques CIN-70 à CIN-72 et suivantes.
- Ennemis originaux de l'Hôte Parfait (Q47).

## 12. Choix pour ce lot

Critères : impact joueur, faisabilité sans art final, raccordement aux systèmes existants.

| Élément choisi | Pourquoi |
| --- | --- |
| Front station Asphodèle, première version jouable (S1-S4, choix CASSIUS, pièce du dossier) | Débloque une pièce du dossier et la reprise d'Asphodèle, condition de *Transmettre* ; Q6, Q7, Q103 |
| Quatre quêtes de l'équipage : Rook, Vega, Harlow, DAVID-8R | Q9 ; la quête de Rook ouvre `station-intro-silence` ; celle de Vega sert l'Acte V |
| Temps de voyage galactique | Q21 ; petit changement, effet visible sur la carte |

Reportés : Acte V (feature à part, Q103), C1-C5 (niveaux dédiés), hub Asphodèle (modules du hub, après S1-S4), archives MIRE (licence et archives originales d'abord), campagnes annexes (après l'Acte V).

La section « Résultat du lot » ci-dessous dit ce qui a réellement été fait.

## Résultat du lot (spec 005)

| Élément | Avant | Après | Preuve |
| --- | --- | --- | --- |
| S1-S4 et choix CASSIUS | Manquant | Partiel | Missions `station-s1`…`s4` jouables dans l'ordre, décision unique, pièce CASSIUS acquise ; hub, annexes et art absents |
| `station-intro-silence` | Manquant | Partiel | Jouée en fin de quête de Rook (dialogue de scène), pas en cinématique CIN-70 |
| Quêtes de l'équipage | Manquant | Partiel | 4 sur 16 (Rook, Vega, Harlow, DAVID-8R) |
| Dossier QZ17 | Partiel (5/7 possibles) | Partiel (6/7 possibles) | Reste le témoignage de Wren |
| Temps de voyage | Partiel | Partiel | 14 jours par saut affichés et appliqués ; messages en retard absents |

Vérifications : `node --test scripts/verify-content-gaps-v188.mjs` (13 tests) ; parcours Chromium sur fixture importée (13 contrôles). Rien n'est déclaré terminé.

## Résultat du lot (spec 006)

| Élément | Avant | Après | Preuve |
| --- | --- | --- | --- |
| Choix final et fins (§5.7.1) | Partiel (règles sans écran) | Partiel | Conseil de guerre à la table tactique, décision unique, trois fins atteignables ; textes [PROPOSÉ] à valider |
| Acte V « Non viable » | Manquant | Partiel | Trois missions finales par ligne sur des gabarits existants, pont chronométré, face-à-face au quai, CIN-60, CIN-61 ; course APC et Reine dédiées absentes (Q1) |
| Épilogue (§5.8) | Manquant | Partiel | Au Tantalus : derniers mots, casier d'Echo-8, CIN-92, générique, partie libre ; plans fixes ailleurs (Q5 A) |
| Option *Transmettre* | Bloquée (salle des relais) | Jouable | Trois *Relais en dérive* (`act5-drift-relay`) après S4 [PROPOSÉ] |
| Cinématiques CIN-60, CIN-61, CIN-90 (×3) | Manquant | Partiel | Lecteur Canvas du prologue, 15 emplacements en primitives (`src/act5-slots-v188.js`) |

Vérifications : `node --test scripts/verify-act5-endings-v188.mjs` (19 tests) ; parcours Chromium de la fin « Le relais parle » sur fixture importée, avec deux injections déclarées (checkpoint du pont, événement de fin de mission). Rien n'est déclaré terminé.

