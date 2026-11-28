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
| **Bloqué (art)** | Demande des images ou animations à produire. La phase initiale de cet audit n'en générait pas (Q79 et Q80) ; les lots de continuation explicitement demandés sont consignés en fin de document. Le code peut exister en primitives Canvas. |

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

Ces comptes conservent l'instantané du commit `250d81a` ; une ligne peut regrouper plusieurs missions (S1-S4 en compte quatre). Dans cet état initial, trois éléments en dette d'art étaient comptés « Partiel » parce que leur règle était jouable (Acte IV, Cargo brutal, chapitres de la campagne 1). Les annotations et continuations ci-dessous décrivent les livraisons ultérieures sans réécrire ces totaux historiques.

### Manques principaux, par impact joueur

1. **Front station Asphodèle (§7)** : aucune des missions `station-intro-silence`, S1-S4, aucun choix CASSIUS. La pièce *Ordres de livraison archivés par CASSIUS* du dossier QZ17 est affichée « pas encore jouable » et l'option finale *Transmettre* ne peut pas s'ouvrir. Q6 : produire S1-S4 avant le hub.
2. **Quêtes de l'équipage (§8.1)** : aucune des 16 quêtes ; le rapport `npc-dialogue-v62.js` n'a que ses six choix génériques. Q9 : commencer par DAVID-8R, Harlow, Rook et Vega.
3. **Acte V et fins (§5.6-§5.8)** : conseil de guerre, course APC, trois fins et épilogue absents ; la logique du choix final existe (`story-dossier-v188.js`) sans écran. Q1-Q5. *Mis à jour par la spec 006 : voir « Résultat du lot (spec 006) ».*
4. **Missions de la colonie C1-C5 et annexes (§6.2)** : aucune. La reconstruction est validée par n'importe quelle opération réussie sur Cocyte (adaptation provisoire). Q25.
5. **Voyage galactique (§13.2)** : le saut coûte du carburant, mais aucun temps ne passe. Q21 : coût fixe par saut, en carburant et en jours, affiché avant le départ.
6. **Campagnes annexes (§14-§18)** : les chapitres V131 sont jouables isolément, mais aucune campagne, aucun arc, aucun appel ; leur `worldId` reste `world-05-lethe`. Q13 et Q15 : après l'Acte V, campagne par campagne. *Mise à jour du 22 novembre 2026 (spec 011) : campagne 1 partielle — appel, voyage, arc 1 (Nacre-7) et compte rendu de l'arc jouables ; Abysse Noir déplacé sur Nacre-7 ; arcs 2-3 et campagnes 2-5 manquants. Les `worldId` relevés n'étaient pas tous `world-05-lethe` (bible §13.4).* *Mise à jour du 23 novembre 2026 (spec 011, second lot) : arcs 2 (Echo Basin) et 3 (TR-0, 65e monde, caché jusqu'à l'arc 3) jouables de bout en bout sur gabarits génériques, chapitres Broodstorm, Reine-Mère et Ruche-monde déplacés, choix, fin et crise de l'œuf saisi ; niveaux dédiés, art et campagnes 2-5 manquants.*
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
| Dossier QZ17 (7 pièces) | Partiel | 5 pièces lisibles ; CASSIUS (S2) et Wren (`colony-a-quai`) affichées « pas encore jouables ». *Lot colonie et équipage : les 7 pièces sont jouables ; reste Partiel tant que les pièces 1-5 n'ont pas leur art.* |
| Choix final et fins (§5.7.1) | Partiel | Règles `finalChoiceOptionsV188`, `resolveFinalChoiceV188` testées, sans écran ni conseil de guerre. *Spec 006 : conseil et trois fins jouables (Partiel).* |
| Acte V « Non viable », course APC, épilogue | Manquant | Q1, Q2, Q5. *Spec 006 : Partiel, course APC dédiée absente.* *2026-11-21 : course, pont et poursuite jouables ; Reine en substitut Canvas, toujours Partiel.* |

## 3. Front colonie — Port-Méridien (§6, §43)

| Élément | Statut | Constat |
| --- | --- | --- |
| `colony-intro-quai`, `colony-intro-doyenne` | Fait | Séquence du quai et visite guidée `cin-doyenne` |
| Reconstruction : 7 chantiers, 3 niveaux, paliers (§6.3) | Partiel | `colony-reconstruction-v188.js` : règles, coûts [PROPOSÉ], table au Commandement. *Lot colonie et équipage : validation par mission locale après C1, annexes ouvertes à « Rétablie », contrats défensifs seuls en « Survie », volontaires.* Manquent : la console du quai (Q26), le palier *Libre*, le recrutement de Nadia Bensaïd |
| Gestion de la colonie : quartiers visitables V2 (§43, Q24) | Partiel | Seul le quai existe en salle ; les sept quartiers ne sont pas construits |
| Missions principales C1-C5 | Partiel (lot colonie et équipage ; niveaux dédiés du 21 novembre) | C1-C4 jouables, récompense unique, chantier construit ; C5 = `act5-port-walls` avec bonus des murs. *21 novembre : niveaux dédiés de C1-C4 posés sur les gabarits (C1 en couloir V2, C2-C4 en V1), voir la section finale ; décors en primitives, voix absentes* |
| Annexes (7) dont `colony-a-quai` (pièce Wren) | Partiel (lot colonie et équipage) | Les 7 jouables (gabarits génériques), effets uniques, décisions Grue et C4 ; pièce de Wren acquise ; art en placeholders |
| Contrats locaux rejouables (8) | Partiel (lot colonie et équipage) | 8 contrats `colony-l-*` rejouables, chacun valide son chantier ; « chantier Eau » rattaché à l'Énergie |
| Vie de la colonie : événements entre deux missions (Q29) | Manquant | — |

## 4. Front station — Asphodèle (§7, §42)

| Élément | Statut | Constat |
| --- | --- | --- |
| `station-intro-silence` (Calme, à bord) | Manquant | Débloqué par la quête de Rook (§8.1) |
| S1 L'arrimage, S2 La voix de CASSIUS, S3 Les ponts scellés, S4 Le hub Asphodèle | Partiel (spec 005 ; niveaux dédiés du 22 novembre) | Q6 : produire S1-S4 comme missions avant le hub ; Q103 : feature Spec Kit. *22 novembre : niveaux dédiés de S1-S4 posés sur le gabarit vaisseau (V1), voir la section finale ; dix emplacements en primitives, voix absentes* |
| Choix CASSIUS (réécrire / brider / effacer) | Manquant | Q7 : choix définitif |
| Annexes (7) et contrats locaux (6) | Partiel (spec 007) | Les 13 sont lançables après S4, verrous [PROPOSÉ] ; contrats comptés ; seul *Relais en dérive* a un effet ; décor générique d'intérieur de vaisseau |
| Hub Asphodèle : 7 modules (§7.3, §42) | Partiel (spec 007 et suite) | 12 modules de §42.2 atteignables à pied (Q22 A, Q23 A) ; quartiers, infirmerie, ponts inférieurs et hangar de réparation rouverts (§7.7) ; commerce Crucible (Q30 A) ; effets des six contrats ; foules ; treize parois et vingt détails PNG intégrés dans les treize salles, trois atlas d'ouvriers animés ; plan V3 non fait |
| Décor de station, CASSIUS, récupérateurs, dropship d'Echo-8 (§29.4) | Catalogue jouable illustré ; suite ouverte | Les 42 emplacements déclarés disposent de PNG : neuf objets de mission, treize parois et vingt accessoires/éléments intermédiaires/acteurs. Les écrans, textes, témoins et états restent natifs. Les six illustrations de scène, les cinématiques et les besoins hors catalogue sont distincts |

## 5. Quêtes du Tantalus (§8)

| Élément | Statut | Constat |
| --- | --- | --- |
| Rapport et confiance de l'équipage (`npc-dialogue-v62.js`) | Partiel | Socle présent : 6 choix génériques, renouvellement 8 h ; aucune quête |
| 16 quêtes de l'équipage (§8.1) | Partiel (lot colonie et équipage) | 16/16 jouables (spec 005 + `crew-quests-tantalus-v188.js`) ; illustrations de onze quêtes produites par le lot colonie/équipage, puis quatre cartes pour Rook, Vega, Harlow et DAVID-8R par la continuation Asphodèle ; poses de dialogue et props jouables encore provisoires ; deux preuves adaptées (pas de tir, charges de brèche) |
| Vie à bord (6, §8.2) | Manquant | Le casier vide d'Echo-8 existe comme objet (`hub-echo8-locker-v188.js`), pas comme fil de quête |
| Recrutement (4, §8.3) | Manquant | Les quatre noms sont des candidats génériques de `crew-recruitment-v85.js`, sans quête ni condition de front |

## 6. Opérations secondaires (§9)

| Élément | Statut | Constat |
| --- | --- | --- |
| Systèmes de survie Alien | Fait | Chapitre effectif |
| Cargo brutal | Fait (continuation art V188) | Chapitre local jouable ; quatre planches dédiées, seize poses de Matriarche intégrées. Registre courant `effective`, `canonExact: false` ; voir continuation Matriarche/MANTA du 17 novembre. |
| Doctrine Alpha / Bravo | Partiel | Jouable ; coop étendue absente |

## 7. Partie II — voyage et campagnes annexes (§13-§18)

| Élément | Statut | Constat |
| --- | --- | --- |
| Carte galactique et saut (`navigate:galaxy`) | Partiel | `galaxy-jump-v115.js` : carburant `2 + ⌈danger/3⌉`, séquence de 8 s ; **aucun temps de voyage** (Q21) |
| Messages en retard, colonies qui évoluent pendant le voyage (§13.2) | Partiel (lot colonie et équipage) | `travel-messages-v188.js` : 3 à 5 messages par saut, une fois, au journal des alertes, FR/EN ; les mondes évoluent déjà (simulation) ; vieillissement de l'équipage absent |
| Chapitres V131 raccordés à leur campagne (§13.4) | Partiel | Campagne 1 raccordée (spec 011) : Abysse Noir sur `world-31-nacre-7`, Broodstorm sur `world-27-echo-basin`, Reine-Mère et Ruche-monde sur `world-65-tr-0` (ancien monde accepté pour un déploiement en cours ; verrouillés jusqu'à leur place, puis librement rejouables) ; les chapitres des campagnes 2 à 5 restent isolés sur leur monde actuel (Ceto n'était pas Cocyte : relevé en bible §13.4) ; déplacement campagne par campagne (Q15) |
| Campagne 1 *La Saison des Reines* (§14) | Partiel | Spec 011 : appel après l'Acte V, acceptation, sauts vers Nacre-7, Echo Basin et TR-0 ; trois arcs jouables de bout en bout (9 missions propres d'histoire, 4 chapitres réutilisés, 9 annexes, 6 contrats) sur gabarits génériques ; choix de Rask et du Praetorian, crise de l'œuf saisi à bord, comptes rendus et fin nuancée ; CQ-01 à CQ-06 jouées en primitives ; quêtes `ship-q-*` et bestiaire. Manquent : niveaux dédiés, **art**, variantes de castes, arme anti-Reine, statistiques Cheyenne/smartgun, recrue Navarre, effets sur la campagne 5 |
| Campagnes 2 à 5 (§15-§18) | Manquant | Chapitres V131 réutilisables ; aucun arc, appel, cinématique ni quête liée. Q13 : après l'Acte V |
| Mondes proposés (Kéos, Murmure, Tyndare, Pangaea, Hiéron, *Clémence*, *Bonne-Espérance*) | Manquant | Absents du catalogue |
| Déblocage et ordre des campagnes (§13.5) | Partiel | Campagne 1 après le générique de l'Acte V (spec 011) ; campagnes 2 à 5 non raccordées |

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
| Largage de remorque, manifeste fret / passagers | Partiel | Manifeste du M577 (Acte III) ; largage absent (Q17). *2026-11-21 : largage jouable dans la course de l'Acte V (`act5-convoy-race-v188.js`), contenu des remorques lu dans le manifeste, conséquences additives `act5.convoyV188` ; voir « Course du convoi de l'Acte V ».* |
| Apesanteur, gravité faible | Manquant | — |
| Contamination et traitement, transformation d'un Marine | Manquant | Q57 : avec *Fièvre noire* |
| Test biologique avec incertitude | Manquant | — |
| Oxygène limité en plongée | Manquant | — |
| Face-à-face sans tir, audience à choix de pièces | Partiel | Q17 : première mécanique à créer. *2026-11-22 (spec 010) : système d'audience réutilisable piloté par des données (`confrontation-v188.js`), raccordé au quai de l'Acte V avec Halloran (issue → `act5.standoff`) ; entrée CASSIUS S2 prête, non raccordée ; portraits en substituts Canvas.* |
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

Cette liste décrit les manques constatés lors de l'audit initial. Les continuations du 16 novembre 2026 produisent les trois portraits de Port-Méridien, les dix-huit cartes de colonie et de quêtes, les six illustrations de scène Asphodèle et les neuf objets d'habillage de ses missions détaillés ci-dessous. Les lots du 17 novembre produisent les treize parois et les vingt détails du hub, achevant les 42 emplacements d'images déclarés, puis six images distinctes pour CIN-70 à CIN-72 et neuf images pour les consommateurs de l'Acte V. Les autres besoins hors de ces catalogues restent ouverts. Les bilans successifs ci-dessous conservent les nombres de leur propre point de reprise.

- Décors jouables du hub Asphodèle (anneau, pont de contrôle, laboratoire, serre, salle des relais, mémorial), noyau de CASSIUS, récupérateurs de Grue et dropship d'Echo-8 (§29.4) : les 42 emplacements actuels sont illustrés et intégrés. Les ouvriers possèdent quatre poses chacun ; les animations supplémentaires, autres rôles de PNJ et nouveaux objets hors catalogue restent à produire. Les cartes d'extérieur et de CASSIUS illustrent séparément les scènes de dialogue.
- Quartiers de Port-Méridien en V2 et animations des habitants nommés. Les portraits de Wren, Ferro et Sarrazin sont désormais produits ; les primitives Q78 restent leur secours de chargement.
- Poses de dialogue de l'équipage et planches des recrues. Aux onze cartes d'objets et de preuves du lot colonie/équipage s'ajoutent celles de Rook, Vega, Harlow et DAVID-8R ; les illustrations ne fournissent ni poses ni objets animés en jeu.
- Art en dette des chapitres V131 (`limitations` de `special-operations-v131.js`) ; la dette dédiée de Cargo est clôturée par la continuation Matriarche du 17 novembre.
- Cinématiques CIN-70 à CIN-72 : les onze plans existants disposent désormais de six nouvelles images et d'éléments réutilisés ; dix plans emploient de l'art, le dernier conserve la perte du signal native. La continuation cinématique du 17 novembre est décrite ci-dessous. Les autres cinématiques hors de ce lot et du lot Acte V ci-dessous, ainsi que les besoins de mise en scène supplémentaires, restent ouverts. Les six cartes de `content-gap-slots-v188.js` constituent toujours un autre catalogue.
- Art de l'Acte V : les quatorze emplacements actifs de `act5-slots-v188.js` sont illustrés par neuf nouveaux PNG et 23 réemplois. Les sept cinématiques et leurs dix-sept plans sont raccordés. Le quinzième emplacement, `relay-room`, n'a aucun consommateur et reste sans PNG ; la course APC dédiée, son pont physique et la Reine restent proposés.
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

## Résultat du lot (spec 007)

| Élément | Avant | Après | Preuve |
| --- | --- | --- | --- |
| Hub Asphodèle | Manquant | Partiel | Navette depuis le hangar du Tantalus ; 13 pièces (les 12 modules de §42.2) parcourues au clavier, portes à retour, reprise ; marché, effets des contrats, foules (suite du 2026-11-16) ; art en primitives |
| Annexes et contrats | Manquant | Partiel | 7 annexes et 6 contrats au catalogue (472 campagnes) ; salle des relais à trois *Relais en dérive* |
| *Transmettre* | Bloqué (salle des relais absente) | Condition jouable | `asphodeleRelayReadyV188(save)` ; le choix final reste à l'Acte V (spec 006) |
| CIN-70 à CIN-72 | Manquant | Partiel | Jouées une fois aux moments de §7.2 ; placeholders Canvas |
| Plaque de Kessler au casier d'Echo-8 | Manquant | Fait (geste et notes), art provisoire | Casier du Tantalus après S3 |

Vérifications : `node --test scripts/verify-asphodele-hub-v188.mjs` ; parcours Chromium au clavier `scripts/qa-asphodele-hub-v188.mjs` (fixtures déclarées). Quatre modules, le commerce, les effets des autres contrats et l'art restent à faire.
## Résultat du lot (spec 006)

| Élément | Avant | Après | Preuve |
| --- | --- | --- | --- |
| Choix final et fins (§5.7.1) | Partiel (règles sans écran) | Partiel | Conseil de guerre à la table tactique, décision unique, trois fins atteignables ; textes [PROPOSÉ] à valider |
| Acte V « Non viable » | Manquant | Partiel | Trois missions finales par ligne sur des gabarits existants, pont chronométré, face-à-face au quai (audience sans tir avec Halloran pour *Tenir*, spec 010), CIN-60, CIN-61 ; course APC et Reine dédiées absentes (Q1). *2026-11-21 : course et poursuite dédiées jouables, sprite de la Reine à produire.* |
| Épilogue (§5.8) | Manquant | Partiel | Au Tantalus : derniers mots, casier d'Echo-8, CIN-92, générique, partie libre ; plans fixes ailleurs (Q5 A) |
| Option *Transmettre* | Bloquée (salle des relais) | Dépend du hub Asphodèle | Lue par défaut (`asphodeleRelayReadyV188`, hub Asphodèle) ; l'Acte V la propose quand elle est vraie |
| Cinématiques CIN-60, CIN-61, CIN-90 (×3) | Manquant | Partiel | Lecteur Canvas du prologue, 15 emplacements en primitives (`src/act5-slots-v188.js`) |

Vérifications : `node --test scripts/verify-act5-endings-v188.mjs` (19 tests) ; parcours Chromium de la fin « Les vivants, sans preuve » (et, avant le retrait du relais provisoire, « Le relais parle ») sur fixture importée, avec deux injections déclarées (checkpoint du pont, événement de fin de mission). Rien n'est déclaré terminé.

## Résultat du lot (colonie et équipage, 2026-11-16)

Base : commit `891d3cd`. Décisions par défaut : Q9 A (étendue aux 12 autres quêtes), Q21 A, Q25 A, Q27 A, Q78 B, Q79 A. Détail et valeurs : bible §6.4, §8.5, §13.7.

| Élément | Avant | Après | Preuve |
| --- | --- | --- | --- |
| C1-C5 (§6.2) | Manquant | Partiel | C1-C4 lancés depuis l'ordre de mission, verrous par acte, chantier construit une fois ; C5 joué comme `act5-port-walls` (§5.6 étape 7) avec bonus des murs ; niveaux dédiés absents |
| Annexes de la colonie (7) | Manquant | Partiel | Jouables, effets uniques, décisions C4 et Grue ; gabarits génériques |
| Contrats locaux (8) | Manquant | Partiel | Rejouables, validation du chantier ; « Eau » rattaché à l'Énergie |
| Validation par mission locale (§6.3) | Partiel (toute opération) | Partiel | Après C1, seule une mission locale valide un niveau ; palier *Libre* et console du quai absents |
| Dossier QZ17 | 6/7 possibles | 7/7 possibles | `colony-a-quai` donne le témoignage de Wren |
| Quêtes de l'équipage | 4/16 | 16/16 jouables (Partiel) | Analyse, collecte et preuves de hub ; conseillers de l'Acte V à portée de 75 ; art et poses absents |
| Messages en retard (§13.2) | Manquant | Partiel | Une fois par saut, journal des alertes FR/EN, valeurs d'avant le voyage et du jour |
| Vie à bord (§8.2), recrues (§8.3) | Manquant | Manquant | Non traités dans ce lot |

Vérifications : `node --test scripts/verify-colony-crew-v188.mjs` (18 tests) ; `npm run test:priorities:v188` (472 tests, 471 réussis ; l'échec restant est l'empreinte de `package.json` épinglée dans `scripts/audit-tantalus-priorities-v188.mjs`, modifié pour ajouter le test) ; parcours Chromium `scripts/qa-colony-crew-v188.mjs` (20 contrôles, fixture et deux injections déclarées : fin d'objectif par le moteur, événement de conversation du hub). Rien n'est déclaré terminé.

## Résultat du lot images (continuation du 16 novembre 2026)

Base : `f5ae9de64c36af1de6eda11f76902e8ba4e8412f`, PR #49. Le propriétaire demande de continuer et de générer les images manquantes ; ce lot prolonge la phase initiale Q78/Q79. Il ajoute **21 PNG de jeu**, après les 22 images d'insertion et de soutes déjà publiées.

| Élément | Résultat actuel | Limite conservée |
| --- | --- | --- |
| Wren, Ferro, Sarrazin | Trois portraits transparents, intégrés aux dialogues et cinématiques, proportions conservées, secours en primitives | Détails physiques [PROPOSÉ] ; animations de PNJ et expressions supplémentaires absentes |
| Cartes de la colonie | Sept images aux emplacements existants, dont les deux carnets de Wren | Niveaux dédiés et quartiers visitables non ajoutés |
| Cartes des quêtes de l'équipage | Onze images aux emplacements existants | Poses de dialogue supplémentaires absentes ; les six cartes distinctes d'Asphodèle appartiennent au lot suivant, décrit ci-dessous |
| Chargement des scènes | Requête du seul emplacement courant, redessin après chargement, anciens callbacks annulés ; cache runtime limité aux dix-huit chemins exacts après consultation | Primitive conservée pendant le chargement et après une erreur ; pas de précache des dix-huit cartes |
| Preuves narratives | Sept cartes composées avec les données exactes en Canvas, FR/EN | Aucun texte secret, nom d'Echo-8 ou horaire absent de la bible inventé |

Contrôles du lot : 54 captures de cartes et 6 captures de cinématiques en Canvas natif, 54/54 tests colonie/contenu/fins et 28/28 tests portraits/cinématiques. Ces captures utilisent un hôte déclaré et ne sont pas présentées comme un parcours Chromium. Les résultats de la suite de priorités et du build final sont consignés dans [le reçu du lot](COLONY_ART_RENDER_RECEIPT_20261116.json).

Traçabilité complète : [contrôle et périmètre](COLONY_ART_QA_20261116.md), [prompts et empreintes des 21 PNG](COLONY_ART_PROVENANCE_20261116.json), [planche des cartes](COLONY_ART_OVERVIEW_20261116.png), [planche des portraits](COLONY_PORTRAITS_OVERVIEW_20261116.png). Les totaux historiques des 66 lignes ne sont pas requalifiés en missions terminées par la seule présence de ces images.

## Résultat du lot images Asphodèle (continuation du 16 novembre 2026)

Base : `1abd0528515e5db460aea06c0e438ca3ceff8ee3`, après les 21 PNG du lot précédent. La demande de continuation du propriétaire couvre les **six illustrations de scène** de `src/content-gap-slots-v188.js`, sous `assets/content/v188/`. Le cadre logique reste de 640 × 280 px. Ce lot ne constitue ni un nouveau niveau ni l'achèvement du front Asphodèle.

| Emplacement | Illustration ajoutée | Preuve ou invariant conservé |
| --- | --- | --- |
| `asphodele-exterior` | Station vue à l'approche | Anneau, rayons et moyeu sombre ; feux éteints ; navette Crucible sur l'anneau et dropship d'Echo-8 au sas |
| `cassius-core` | Console de CASSIUS | CRT verts, une onde, aucun visage ; consignes présentées comme archives, sans imposer l'état actif après le choix de S2 |
| `echo8-recording` | Écran de capteurs de Rook | Onde, coupure rouge et règle 05:58 / 05:59 / 06:00 composées par Canvas ; aucune nouvelle seconde de coupure inscrite dans le PNG |
| `order-documents` | Deux ordres sous une lampe | Articles 2 et 5 de l'Administration, points 4 et 7 de la compagnie : citations exactes FR/EN, deux contradictions ; aucun logo ni signataire inventé |
| `seal-fragment` | Sceau rompu sous la lentille du laboratoire | Résine sur la face interne, lot QZ17-04 et tampon Asphodèle natifs FR/EN ; continuité de matière avec l'atlas de collectables QZ17 |
| `david-memory` | Carte mémoire et composants de relais | Grille native, un secteur cible et trois composants ; aucun résultat de restauration ni effacement des journaux affirmé avant la fin de la quête |

Les cinq cartes de preuve conservent leurs libellés, nombres et graphes dans Canvas, indépendamment des PNG. Les identifiants de quête, décisions, récompenses et sauvegardes ne sont pas modifiés par ces illustrations. La chronologie d'Echo-8 reste celle des sources existantes : ce lot ne réconcilie pas la fin à 06:00:05 de CIN-72 avec le verrouillage à 6:00:05 puis la coupure à 6:00:07 de la quête de Rook.

**Périmètre restant ouvert à la fin du lot de cartes :** les 42 emplacements `asph-*` du hub et de l'habillage des missions. La continuation ci-dessous complète ensuite neuf emplacements de mission. Les acteurs et leurs poses, la rotation visuelle de l'anneau et les plans de CIN-70 à CIN-72 restent des chantiers distincts. La carte `cassius-core` n'est pas le prop jouable `asph-cassius-core`. Les statuts des missions, du hub et des quêtes restent **Partiel** ; les totaux historiques de cet audit ne changent pas.

**Fidélité :** Asphodèle, CASSIUS, Echo-8, Kessler, Crucible et les preuves des quêtes sont des créations du projet. Les repères documentés restent ceux de la bible §7.6 et §8.4 : UD-4L, caméras de casque et moniteurs d'*Aliens* (1986), matériel Seegson d'*Alien: Isolation* (2014), priorité de la compagnie illustrée par « Special Order 937 » dans *Alien* (1979). Les PNG prolongent les références existantes du dépôt ; leur génération ne certifie pas une reproduction canonique « 1:1 ».

Traçabilité du lot : [prompts, références et empreintes](ASPHODELE_ART_PROVENANCE_20261116.json), [contrôles réellement exécutés et limites](ASPHODELE_ART_QA_20261116.md), [planche des six illustrations](ASPHODELE_ART_OVERVIEW_20261116.png), [primitive extérieure employée comme référence de composition](ASPHODELE_ART_PRIMITIVE_REFERENCE_20261116.png). Une capture de composition des cartes n'est pas un parcours complet du hub ou des missions.

## Résultat du lot objets de mission Asphodèle (continuation du 16 novembre 2026)

Base : `3be2a402aa2e8149b4fb3bc557d9ba67a75523d8`. Les neuf PNG `assets/asphodele/v188/asph-msn-*.png` remplacent les primitives d'habillage des sept missions annexes, six contrats et de l'inspection de nuit. Panneau, CRT, plaque de secteur, conduits et cinq éléments propres aux missions sont produits ; les quantités de trois enregistreurs, deux caisses et trois manomètres sont contrôlées.

Les textes FR/EN, lignes du CRT, aiguilles et voyant restent natifs. Les images sont proportionnées et découpées dans leurs cadres existants. Le calcul du plan et le renderer du hub sont inchangés ; les marges de 18 px autour des passages, le rythme de 306 px et les sauvegardes sont préservés. Les neuf images sont demandées en mission et admises au cache runtime après leur premier chargement public valide ; elles ne sont pas précachées lors de l'installation.

**État de l'art Asphodèle : neuf emplacements jouables complétés sur 42 ; 33 emplacements du hub restent ouverts.** Les six cartes de scène constituent un lot distinct. Les références visuelles primaires inspectées proviennent de Paul Abbott et de l'article de Gary Napper sur *Alien: Isolation*. Les formes d'assemblage Asphodèle et les libellés restent des créations du projet ; aucune reproduction canonique « 1:1 » non démontrée n'est annoncée.

Validation acquise : 35 contrôles Asphodèle, 132 contrôles audit/sauvegarde, 27 rendus natifs de sprites et dix compositions du moteur. Ces captures utilisent le host Canvas déclaré et ne constituent pas un parcours navigateur. Les échecs navigateur du commit précédent restent suivis séparément.

Traçabilité : [provenance des neuf PNG](ASPHODELE_MISSION_ART_PROVENANCE_20261116.json), [contrôles et limites](ASPHODELE_MISSION_ART_QA_20261116.md), [planche du rendu intégré](ASPHODELE_MISSION_ART_OVERVIEW_20261116.png), [reçu de rendu](ASPHODELE_MISSION_ART_RENDER_RECEIPT_20261116.json).

## Résultat du lot parois du hub Asphodèle (continuation du 17 novembre 2026)

Base : `8fe5d58c33a6ddb9473eb0148019a5f46eaef8bf`. Les treize fonds `asph-wall-*` sont générés et intégrés dans les treize salles existantes : docks, anneau, rayon technique, contrôle, relais, laboratoire, mémorial, serre, marché, quartiers, infirmerie, ponts inférieurs et atelier. **22 des 42 emplacements ont maintenant un PNG ; vingt restent ouverts.** Les neuf objets de mission du lot précédent sont conservés.

Le renderer préserve le rapport réel des PNG à une hauteur de 504 px, répète leur contenu depuis l'origine du monde et découpe au cadre visible. Cette composition corrige l'étirement dépendant de la caméra et le filet sous-pixel observé à une jonction. Les portes, postes, personnages, libellés FR/EN et bandes natives restent séparés ; les géométries de salle, collisions et sauvegardes sont conservées.

Validation : **39 contrôles Asphodèle, 132 contrôles audit/sauvegarde, 40 contrôles de succession**, tous réussis. Le rendu natif inspecte treize fonds, 46 vues FR/EN, treize répétitions et treize replis : zéro débordement, zéro dérive caméra et 61 masques de portes/postes inchangés. Le lancement Chromium est bloqué avant l'ouverture de page par l'environnement ; aucun nouveau parcours navigateur n'est revendiqué.

Les références primaires de Paul Abbott pour *Alien: Isolation* guident matériaux et construction. Asphodèle reste un lieu original du projet ; aucune réplique canonique « 1:1 » n'est certifiée. Les vingt éléments restants comprennent les treize accessoires, trois éléments intermédiaires et quatre acteurs ; les animations et cinématiques restent distinctes.

Traçabilité : [prompts et empreintes des treize PNG](ASPHODELE_HUB_WALL_ART_PROVENANCE_20261117.json), [QA et limites](ASPHODELE_HUB_WALL_ART_QA_20261117.md), [treize salles dans le renderer](ASPHODELE_HUB_WALL_ART_OVERVIEW_20261117.png), [reçu de rendu](ASPHODELE_HUB_WALL_ART_RENDER_RECEIPT_20261117.json).

## Résultat du lot détails du hub Asphodèle (continuation du 17 novembre 2026)

Base : `e1d5b9a4e8167e0f5193695f2cea9db4508df35b`. Les **vingt derniers emplacements du catalogue** disposent de leurs PNG transparents : treize accessoires, la porte, les deux vaisseaux amarrés, Grue et les trois métiers d'ouvriers. Avec les treize parois de ce jour et les neuf objets de mission précédents, **42 emplacements sur 42 sont illustrés et intégrés**. Ce résultat ne clôt ni les cinématiques ni l'ensemble des besoins de la bible.

Vingt sorties sont retenues sur vingt-trois, soit 37 822 924 octets, copiés sans modification de pixels. Les itérations rejetées sont tracées : relais à sept tiroirs corrigés à huit par baie ; scanner dont le linteau réduisait trop le passage ; première interprétation masculine de Grue corrigée en capitaine récupératrice conformément à la bible §2.3. Les références primaires d'environnement, de costume et de maquette du Cheyenne sont enregistrées avec leurs limites ; aucune certification canonique « 1:1 » n'est déduite de la génération.

Le renderer utilise des fenêtres source mesurées et une échelle uniforme. Les deux lits sont échantillonnés séparément à 102 px de largeur, les six couchettes occupent 360 × 130 px et l'arche médicale conserve environ 96,5 px de passage pour un marine de 92 px. Les trois atlas d'ouvriers fournissent quatre poses chacun, avec pivots de pieds fixes, retournement et pose de repos en mouvement réduit. Grue dispose d'une pose. Le plan de station, la carte QZ, le terminal d'archives et les berceaux gardent leurs fonctions distinctes.

Les textes FR/EN, six écrans de CASSIUS, 24 témoins des relais, ECG, scanner, bougies, rondes, marquages Echo-8 et états de réparation restent pilotés par le jeu. Les deux améliorations Cheyenne existantes sont conservées ; le troisième point lumineux du dessin ne crée aucun troisième niveau de progression. Le chargement se limite à la salle courante : six ressources aux quais, aucune image de mission préchargée par le hub. Les 48 chemins Asphodèle admis au cache runtime comprennent six cartes et 42 emplacements ; le shell précaché reste à 723 entrées.

Validation : **46 contrôles Asphodèle, 132 contrôles audit/sauvegarde et 40 contrôles de succession**, tous réussis. Le contrôle natif comprend les treize salles en 46 vues FR/EN et les poses/directions des acteurs ; le reçu détaille les états et mesures. La revue indépendante de 26 combinaisons salle/choix de Grue confirme que les ressources dessinées sont déjà dans le chargement de leur salle. Le lancement Chromium reste bloqué par l'environnement avant toute page : aucun nouveau parcours navigateur ni contrôle réseau réel n'est revendiqué.

Traçabilité : [prompts et empreintes des vingt PNG](ASPHODELE_HUB_DETAIL_ART_PROVENANCE_20261117.json), [QA et limites](ASPHODELE_HUB_DETAIL_ART_QA_20261117.md), [planche du rendu intégré](ASPHODELE_HUB_DETAIL_ART_OVERVIEW_20261117.png), [reçu de rendu](ASPHODELE_HUB_DETAIL_ART_RENDER_RECEIPT_20261117.json).

## Résultat du lot cinématiques Asphodèle (continuation du 17 novembre 2026)

Base : `cd44257822a649a7532eec5a70d60f6663640a77`. **Six PNG cinématiques** sont produits et intégrés : anneau à quatre rayons, moyeu fixe, quartiers de Rook, couloir casque, créature au plafond et porte déformée. Les six sorties retenues totalisent **11 370 799 octets** et restent identiques aux originaux du générateur. Douze images existantes et trois portraits d'équipage sont réutilisés à leur chemin d'origine. Le catalogue jouable reste à 42/42 ; les six nouvelles images sont déclarées séparément.

Les onze plans de CIN-70 à CIN-72 conservent leurs durées de **40/40/30 secondes**, leurs dialogues FR/EN, leurs horodatages et leur comportement de lecture. Dix plans utilisent de l'art ; la perte finale du signal reste native. L'anneau et ses vaisseaux tournent autour du moyeu sans rotation de celui-ci. Les écrans de Rook et CASSIUS, l'onde d'Echo-8, les preuves et les légendes restent natifs. Le titre d'archives de CIN-71 est corrigé en QZ17, le REC de CIN-72 devient visible hors de la caméra, et la soute spatiale de CIN-70 n'utilise plus la pluie du décor atmosphérique partagé. La porte conserve ses coins transparents après retrait d'un rectangle noir parasite.

Le chargement demande et utilise respectivement **11, 6 et 5 fichiers** pour CIN-70, CIN-71 et CIN-72, soit 21 fichiers distincts. Aucun objet de mission ni planche de l'Acte V n'est préchargé par ces trois séquences. Le cache runtime admet désormais 54 chemins Asphodèle exacts, sans ajout aux 723 entrées du shell. Les replis, l'arrivée tardive des images, la relecture, l'avance, l'interruption et le remplacement sont contrôlés. La politique préexistante de non-réessai après erreur définitive d'une Image reste documentée.

Validation : **20 tests cinématiques, 132 tests audit/sauvegarde et 40 tests de succession**, tous réussis. Les captures natives couvrent 22 vues FR/EN avec art et 22 replis. Les six PNG ont une contribution visible ; 36 lignes et 42 932 pixels opaques de noms, sous-titres et légendes sont contrôlés sans masquage. Quatre contrôles REC et huit vues de preuves CRT passent. Huit comparaisons raster hors du lot ont zéro pixel changé ; la revue indépendante des 25 autres cinématiques et 70 plans conserve les mêmes opérations Canvas sur 280 frames. Les vrais PNG sont décodés par chemin, avec polices mono/sans déclarées ; aucun nouveau parcours navigateur n'est revendiqué.

La fidélité de construction repose sur trois références de Paul Abbott pour *Alien: Isolation*, complétées pour la créature par une tête de tournage d'*Aliens* (1986) et deux vues de sculpture licenciée NECA. La pose au plafond est reconstruite et Asphodèle reste un lieu original. Le lot ne certifie ni une copie de photogramme « 1:1 » ni l'achèvement de toutes les cinématiques et animations de la bible. La publication reste en attente après le refus du push par le contrôle automatique ; aucune voie de contournement n'est employée.

Traçabilité : [prompts, références et empreintes des six PNG](ASPHODELE_CINEMATIC_ART_PROVENANCE_20261117.json), [QA et limites](ASPHODELE_CINEMATIC_ART_QA_20261117.md), [onze plans dans le renderer](ASPHODELE_CINEMATIC_ART_OVERVIEW_20261117.png), [reçu de rendu et revue indépendante](ASPHODELE_CINEMATIC_ART_RENDER_RECEIPT_20261117.json).

## Résultat du lot art de l'Acte V (continuation du 17 novembre 2026)

Base : `6b34f3097cbc3fd73d692e7e295f7615cab1a510`. Après l'autorisation explicite de l'utilisateur, les trois lots Asphodèle précédemment en attente ont été publiés sur la PR #49 ; le blocage de publication décrit dans leur bilan historique est donc levé. Le lot Acte V ajoute **neuf PNG de jeu, totalisant 20 244 249 octets**, copiés sans modification des pixels générés. Les cinq fonds couvrent le départ du complexe, le pont, le quai, les portes du port et le panorama d'épilogue ; les quatre détourages fournissent le M577 corrigé, les deux remorques et le casier ECHO-8. Le catalogue d'intégration comprend **32 ressources : neuf nouvelles et 23 réemplois à leur chemin d'origine**.

Les **quatorze emplacements actifs sur quinze** sont maintenant illustrés et raccordés : cinq scènes de dialogue et neuf compositions cinématiques alimentent **sept CIN et dix-sept plans** — CIN-60, CIN-61, les trois CIN-90, CIN-92 et CIN-99. `relay-room` n'a aucun consommateur de production : il conserve sa primitive, ne demande aucune image et ne représente pas une image manquante dans le périmètre actif. Le résultat complète l'art des scènes existantes de la spec 006 ; les bilans historiques en primitives et leurs comptes de tests restent ceux de leur livraison initiale.

| Composition | Résultat intégré |
| --- | --- |
| Conseil et ordre de Halloran | Salle, table et équipage réemployés ; itinéraire du complexe au port et ordre FR/EN composés dans Canvas |
| Départ et pont | M577 corrigé d'après la miniature de tournage : deux roues par flanc, porte centrale et tourelles distinctes ; convoi dans l'ordre M577 → colons → fret, quatre retardataires dans les fenêtres, six contacts de pneus et deux attelages mesurés |
| Quai et portes du port | Ouvriers des trois atlas Asphodèle, marine et commandos existants ; proportions humaines revues ; vantaux prélevés dans le fond, anciennes positions masquées pendant la fermeture, compteur cumulatif natif |
| Fins et épilogue | État d'Asphodèle, légendes et générique pilotés par le jeu ; quatre caissons de taille adulte en deux rangées avec couvercles articulés ; casier scellé et libellé ECHO-8 sur sa plaque ; navette de la fin « Les vivants, sans preuve » visible pendant tout le mouvement de caméra |

Le chargement demande seulement les couches du slot ou de la CIN courante. Les scènes de dialogue et le choix du pont se redessinent à l'arrivée tardive des images ; les callbacks se détachent à la fermeture. Les replis partiels, le réessai des images Acte V en erreur, la relecture, l'avance, l'interruption et le mouvement réduit sont contrôlés. Textes FR/EN, durées, choix, nombres issus de la sauvegarde et récompenses restent régis par les systèmes existants. Les neuf nouveaux chemins sont admis au cache runtime exact ; le shell précaché reste à 723 entrées.

**Validation : 69/69 tests d'intégration, 132/132 tests audit/sauvegarde et 37/37 contrôles indépendants du cycle de vie**, tous réussis. La QA produit **166 captures PNG** avec les vrais fichiers décodés dans un hôte Canvas natif et des polices déclarées : 28 vues de slots avec art et 28 replis, 34 vues de plans FR/EN avec art et 34 replis, puis les états et contrôles complémentaires détaillés dans le reçu. Les neuf nouvelles images contribuent au rendu ; les six contacts de pneus, les quatre passagers et les quatre charnières passent leurs contrôles. Les **29 comparaisons raster hors périmètre ont zéro pixel différent** ; **256 traces Canvas des 21 autres CIN et 64 plans sont identiques** à la base. Les sources, les PNG et les sauvegardes de fixture restent stables pendant les vérifications.

Ces preuves portent sur le renderer de production sous **Canvas natif**, avec fixtures et doubles de chargement déclarés ; elles ne constituent pas un nouveau parcours navigateur. La course APC dédiée avec remorques physiques, l'effondrement jouable du pont et la poursuite de la Reine restent **[PROPOSÉ]**. Le sprite dédié de la Reine reste à produire. Les lieux, remorques et accessoires originaux du projet ne deviennent pas des répliques canoniques « 1:1 » par leur seule génération ; le statut global de l'Acte V reste **Partiel** et les totaux initiaux de l'audit ne sont pas réécrits.

Traçabilité : [prompts, références et empreintes des neuf PNG](ACT5_ART_PROVENANCE_20261117.json), [QA et limites](ACT5_ART_QA_20261117.md), [planche des compositions intégrées](ACT5_ART_OVERVIEW_20261117.png), [reçu de rendu et revues indépendantes](ACT5_ART_RENDER_RECEIPT_20261117.json).

## Résultat du lot preuves biologiques et résine (continuation du 17 novembre 2026)

Base : `da8b29fa4b7688d18686b1e28be4065c3a821d3b`, qui publie le lot Acte V précédent. Ce nouveau lot ajoute **trois PNG bruts, soit 7 770 075 octets** : le berceau QZ17 ouvert de l'intérieur, la galerie du dépôt envahie de résine et le support vide de captivité humaine. Le catalogue de rendu contient **18 images, dont quinze réemplois à leur chemin existant**.

| Consommateur | Résultat |
| --- | --- |
| CIN11 et alcôve QZ17 | Même berceau givré, trois sangles rompues, plaque native QZ17-04, corps mesuré à 480 pixels en cinématique et 122 pixels dans le niveau ; transformation uniforme et appui au sol |
| CIN31 | Quai, M577, passagers, conteneurs et CRT existants ; compteurs issus du manifeste, dans les limites de six passagers et trois conteneurs |
| CIN40, CIN41, CIN51 et retour QZ17 | Support vital, laboratoire et CRT réemployés ; textes, horodatages, statuts et personnages natifs |
| CIN50 | Galerie contaminée, drone existant sur la poutre après 55 % du premier plan, REC visible hors de la transformation de caméra ; coupure du signal conservée |
| Cocon noir V158 | Support vide derrière le véritable joueur, neuf liens natifs devant lui, tenue personnalisée et cycle de réveil/coupe/effort/libération préservés |

Les sept cinématiques comprennent **18 plans**. Les 21 autres cinématiques, soit 63 plans et 252 variantes FR/EN avec mouvement normal/réduit, conservent leurs traces de dessin et leurs demandes d'images. Le volet fermé de QZ17 ne provoque aucune requête ; l'ouverture native de la route ou la reprise déjà ouverte prépare seulement le berceau. Le nouveau module partagé porte le shell à **724 entrées** ; les trois images restent chargées à la demande sur des chemins exacts.

La revue des vrais pixels a corrigé le gabarit de captivité hérité : son enveloppe de 146 × 86 pixels plaçait plusieurs liens au-dessus du personnage. Le support et les liens sont maintenant proportionnés au rig natif debout, avec visage dégagé, palette charbon/ambre, racines au sol et résidu fixé au mur après le déplacement du joueur libéré. Les neuf seuils de coupe et les horloges restent inchangés. Les références de résine viennent des photographies de tournage publiées par Propstore et Stan Winston School ; QZ17 et Cocyte restent des lieux et objets originaux du projet.

La QA finale comprend **54 PNG** — 53 captures et une planche —, **36 vues cinématiques FR/EN et 36 replis en mémoire**, **56 variantes de personnage**, **14 contrôles de progression des fibres**, huit alcôves, douze variantes de caméra casque et 29 comparaisons raster hors lot identiques. Les trois PNG ont une contribution visible mesurée ; aucun pixel de lien ne masque le cœur du visage. Les 52 tests d'intégration, les 132 tests d'audit/sauvegarde et les 24 contrôles indépendants de chargement passent. Les 139 contrôles de succession puis une première release complète de **4 688 cas, 4 687 réussis et un ignoré hérité**, passent sans échec sur le gel biologique.

La lecture de la CI précédente a ensuite révélé un blocage distinct du retour APC : le tir de couverture abat un dernier ennemi après le calcul initial du bilan, donnant 21 victimes mais seulement 1 300 crédits au lieu des 1 310 exigés par la formule. Le bilan est désormais finalisé après ce combat et avant les callbacks, avec une seule émission. Le validateur `save.js` et la formule restent inchangés. Cinq régressions échouent avant correction puis réussissent ; le groupe embarquement/récit/historique passe **55/55**. Le registre final conserve ses 106 prédécesseurs historiques et atteste 116 successeurs exacts plus le nouveau module.

Le build et la suite release finale sont attestés sur la révision exacte publiée dans la PR #49. Les observations de mission et les rendus sont exécutés sous l'hôte natif avec doublures déclarées ; ils ne constituent pas un nouveau parcours Chromium. Ce lot ne clôt pas la campagne prolongée du Cocon noir, les autres preuves/galeries du dépôt ou les identités de créatures restant à produire. Aucune certification globale de fidélité canonique « 1:1 » n'est ajoutée.

Traçabilité : [prompts, références et empreintes](BIOLOGICAL_ART_PROVENANCE_20261117.json), [QA et correctifs de CI](BIOLOGICAL_ART_QA_20261117.md), [planche des compositions intégrées](BIOLOGICAL_ART_OVERVIEW_20261117.png), [reçu commun et revues indépendantes](BIOLOGICAL_ART_RENDER_RECEIPT_20261117.json).

## Résultat du lot prologue et Port-Méridien (continuation du 17 novembre 2026)

Base : `d54f13cc55983ddb5f55851071c9144198fe1155`, qui publie le lot biologique et le correctif du retour APC. Cette continuation ajoute **onze PNG bruts, soit 20 246 573 octets**, et raccorde **onze CIN / 35 plans**. Le catalogue partagé réemploie 32 images existantes à leur chemin d’origine, soit 43 sources, auxquelles le lecteur ajoute les portraits des locuteurs. Les octets des générations et des réemplois sont préservés.

Les nouveaux fichiers fournissent les corps entiers de Wren, Ferro et Sarrazin, un enfant dédié, le patient et son brancard séparés, le port nocturne, le badge et la main, ainsi que l’étagère et le chariot du casier ECHO-8. Les trois identités adultes dérivent de leurs portraits du projet. Le panorama conserve l’architecture de l’épilogue sous un éclairage nocturne. Les six sachets, les deux plateaux et les quatre roulettes sont contrôlés ; aucun diagnostic, nom de badge ou usage narratif supplémentaire n’est ajouté aux images.

Les corps gardent leurs proportions et pivots de pieds. La calibration de 2 m porte sur le matelas du brancard, avec les poignées à l’extérieur de cette mesure ; les contacts de tête, talons et main tiennent compte de ses deux bords visibles. Le thorax seul suit la respiration native. La main apparaît après 45 % du plan et conserve sa course de 620 pixels. Le réveil garde 03 ouverte, 01/02/04 fermées, David, le scellé ECHO-8 et les deux silhouettes verticales natives de la baie de secours. Les huit balises d’approche sont placées sur le bord mesuré de la piste.

La revue corrige les deux premières lignes de colonnes du tableau de 37 messages et le libellé COCYTE, auparavant masqués par la bande supérieure. Les deux plans orbitaux utilisent le globe entier avec une échelle uniforme : la coupe rectangulaire du plan de station et l’aplatissement du plan Tantalus disparaissent. Textes FR/EN, 28 scénarios, 81 plans, durées, choix, sauvegardes, déplacements de caméra et trajectoire du Tantalus restent inchangés.

Le lecteur précharge uniquement les ressources de la CIN courante et ses portraits, partage les chargements en cours et réessaie les images en erreur à l’entrée ou au rejeu. Le dessin ne demande aucune image et conserve les replis partiels. Une image arrivée tardivement ne fait pas avancer le récit et un ancien RAF ne réactive pas une séquence fermée. Le nouveau module porte le shell à **725 entrées uniques** ; les onze PNG sont admis sur des chemins exacts et restent chargés à la demande. Les quatre documents de preuve sont exclus du build public.

Validation ciblée : **39/39 tests cinématiques et 132/132 tests audit/sauvegarde**. Le reçu indépendant contrôle **70 rendus FR/EN et 70 replis**, onze contributions raster effectives, les textes et leurs seuils. Les **17 autres CIN / 46 plans** conservent leurs **46 rendus raster et 184 traces Canvas**. Les 28 scénarios et les images restent identiques à leurs références contrôlées. Les observations de transformation héritées et les bandes de respiration sont détaillées dans la QA, sans être présentées comme un résultat « zéro avertissement ».

Le parcours Chromium de la CI précédente confirme désormais le retour APC avec **21 victimes / 1 310 crédits**, sans second paiement. Trois pilotes devenus incompatibles avec les séquences natives sont corrigés : passage par l’extraction publique avant retour à bord, acquisition de pause Broodstorm observée, et sauvegarde du Cocon pendant les trois secondes actives du terminal. **Six nouvelles régressions passent du rouge au vert ; les trois suites ciblées passent 68/68.** Le runtime de sauvegarde reste inchangé. Deux échecs navigateur restent à diagnostiquer, interaction Forge et menu mobile : une trace passive ciblée est ajoutée sans retry, modification de délai ou assouplissement des assertions.

Les contrôles de release et de distribution du commit de publication sont consignés séparément dans la PR #49. Les captures de ce lot utilisent le renderer de production sous Canvas natif avec les hôtes déclarés ; elles ne constituent pas un nouveau parcours local Chromium. Les groupes du catalogue existant de **28 CIN** disposent désormais d’une intégration artistique documentée, avec les calques de texte, projections et effets qui restent natifs. Ce bilan ne clôt pas les missions proposées, les animations et la bible entière, et ne certifie pas une reproduction canonique « 1:1 » des lieux originaux.

Traçabilité : [onze prompts, références et empreintes](PROLOGUE_ART_PROVENANCE_20261117.json), [QA et suivi des pilotes](PROLOGUE_ART_QA_20261117.md), [planche des 35 plans](PROLOGUE_ART_OVERVIEW_20261117.png), [reçu indépendant](PROLOGUE_ART_RENDER_RECEIPT_20261117.json).

## Résultat du raccord artistique du quai jouable (continuation du 17 novembre 2026)

Base : `ee565717bdc698594c41f76fe1e1c72c2a730656`, qui publie les onze images du prologue. Le quai physique utilisait encore les silhouettes provisoires de Wren, Ferro et du patient. Cette continuation raccorde **quatre PNG existants, soit 6 316 935 octets**, sans nouvelle génération ni modification de leurs pixels. Les corps et le brancard sont désormais communs aux cinématiques et à la salle jouable.

Wren garde son pivot `(330,628)` et sa hauteur de 91 px, avec un retournement vers la rampe ; Ferro garde `(690,626)` et 86 px, tournée vers le patient. Les deux corps restent dans la passe triée de profondeur. Le matelas du brancard mesure **102 px = 2 m** à l’échelle native de 51 px/m, les roues touchent le sol y624 et le patient mesure 89,25 px = 1,75 m. Les écarts mesurés de tête, talons et main au bord correspondant du matelas sont respectivement **0,038 / 0,123 / 0,002 px**. Le brancard roulant remplace visuellement l’ancien lit lourd et son bras de monitoring ; cette différence est déclarée dans la provenance.

La respiration conserve sa fonction native positive de 0 à 1 px et ne déplace que le thorax. Wren et Ferro gardent des replis indépendants ; patient et brancard basculent ensemble pour ne pas mélanger deux hauteurs de support. Les quatre demandes partent uniquement à l’entrée du quai, partagent les images prêtes ou en cours et retentent une erreur lors d’une nouvelle entrée. Le dessin et les callbacks tardifs ne créent pas de nouvelle boucle de jeu. Le shell passe à **726 entrées uniques** avec le seul adaptateur ; les images utilisent leurs chemins runtime déjà admis, sans nouveau précache.

Les **19 contrôles ciblés du quai**, dont cinq nouveaux tests des vrais `start()` et `draw()`, et les **132 contrôles audit/sauvegarde** passent. La revue indépendante compare **12 conditions à 12 références de P** et ajoute une vue générale : **66/66 contrôles, zéro erreur et zéro pixel modifié hors des zones remplacées**. Le repli complet est identique à P ; les deux indisponibilités du couple médical donnent la même composition. Les 479 observations de transformation sont classées en 471 prélèvements hérités et huit mouvements locaux de respiration ; ce n’est pas un résultat « zéro observation ».

La géométrie des sept phases, les postes, collisions, positions physiques, trois habitants animés, textes, progression et sauvegardes restent inchangés. Les 607 autres sources de jeu antérieures gardent leurs octets. Les preuves du prologue ne sont pas réécrites et les quatre documents du quai sont exclus du build. Les contrôles complets de la révision publiée et les résultats CI sont consignés séparément dans la PR #49.

Les captures reposent sur le renderer de production et les vrais PNG dans une fixture Canvas native, avec le marine modulaire et des polices déclarées ; elles ne constituent pas un nouveau parcours Chromium ou une sauvegarde jouée. Le repli complet suppose les anciennes ressources disponibles : l’échec simultané de l’ancien lit conserve sa limite historique. Les autres accessoires natifs du quai, la Matriarche de Soute dédiée, le MANTA-6 et les poses HADAL restent hors de ce lot ; aucune certification globale « 1:1 » n’est ajoutée.

Traçabilité : [réemplois, mesures et empreintes](PORT_QUAY_ART_PROVENANCE_20261117.json), [QA et périmètre](PORT_QUAY_ART_QA_20261117.md), [vue du quai et détails](PORT_QUAY_ART_OVERVIEW_20261117.png), [reçu indépendant](PORT_QUAY_ART_RENDER_RECEIPT_20261117.json).

Le pilote Trials attend aussi le retrait effectif de l’introduction avant ses trois entrées du titre, dans les 45 secondes déjà prévues et avant tout lancement de mission. La course entre clics admis et clavier encore capturé est reproduite avec le véritable fondu de 1 100 ms ; le mutant sans attente échoue et les deux nouvelles régressions passent, ainsi que la suite Legacy **25/25**. Les fonctions de pause, de sauvegarde et de bombe conservent leurs octets. Cette preuve locale ne suffit pas à attribuer l’échec distant de Trials à l’introduction ; sa reprise Chromium reste ouverte dans T028. Le menu titre de P est, lui, observé réussi sur 18 cas ordinateur/mobile et 128 contrôles, sans nouvelle modification de son pilote.

La fin du run Full release du prologue confirme le **Cocon 9/9** et le retour à bord QZ-18 sans second paiement. Deux arrêts ultérieurs sont qualifiés : Forge restaure le bon checkpoint mais sa trace ne reçoit que keyup après E ; la campagne cherche son débrief alors que les films Halloran/Rook jouent et que le plan a été réorienté vers QZ-17. Le débrief QZ-18 durable reste intact. Les pilotes attendent maintenant l’introduction avant Forge, puis les deux films et la sélection publique QZ-18 avant la consultation. Les budgets restent bornés, aucune écriture directe du runtime ou des sauvegardes n’est ajoutée, et toutes les assertions existantes sont conservées. Les suites Legacy, Forge NPC et campagne passent **25/25 + 31/31 + 31/31 = 87/87**, dont six nouvelles régressions, avec mutants causaux en échec. Le premier candidat du quai n’a pas été publié ; ces corrections sont incorporées dans son candidat final. Les reprises Chromium complètes restent à qualifier sur ce dernier commit, séparément des rendus Canvas et des succès du parent.

## Continuation — Matriarche de Soute et MANTA-6 (17 novembre 2026)

Après le quai publié `232693f1`, cinq PNG supplémentaires sont raccordés à deux consommateurs réels : quatre planches de Matriarche (seize poses, quatre clips natifs) et une coque MANTA-6 statique. Les sources font respectivement 1254 × 1254 et 1813 × 868 ; elles sont copiées sans réencodage. Le boss conserve son corps normalisé 300 × 245, ses pieds, phases, checkpoints et sauvegardes. La coque est contenue uniformément dans 180 × 86, avec miroir, origine de tir et accès inchangés. Les autres Reines gardent leur rendu ; quatre sources valides sont requises ensemble pour l'identité Matriarche.

La première attaque générée a été corrigée après revue : l'impact de griffes correspond à la frame 9 et le fouetté de queue à la frame 11. L'attestation lie le SHA du PNG aux deux cellules revues ; le test observe les véritables événements du contrôleur et les prélèvements de rendu. Les trois autres planches sont inchangées.

La revue finale donne **264/264 contrôles, zéro erreur** : 39 captures Cargo et 39 références R, dont 16 poses dans les deux directions ; quatre replis atomiques et la dormance identiques à R ; aucun pixel changé hors des fenêtres d'art dans les deux vues du monde. Quatre vues de MANTA complètent ses dix conditions Canvas isolées et cinq comparaisons de repli à zéro écart. Les dimensions, appuis, sources, transformations et limites d'hôte sont consignés dans `CARGO_ABYSS_ART_RENDER_RECEIPT_20261117.json`. La planche `CARGO_ABYSS_ART_OVERVIEW_20261117.png` a été inspectée. Ces preuves utilisent le moteur et Canvas natifs sous hôtes déclarés ; ce ne sont pas des parcours Chromium.

La Matriarche corrigée passe 7/7 tests dédiés. Le MANTA et Legacy passent 32/32. Le premier candidat Matriarche avait passé 15/15 contrôles ciblés, dont les sept dédiés : ces nombres ne sont pas additionnés et restent attribués à leur candidat. Les validations complètes sur le commit final sont données séparément dans la PR.

La seule dette d'art Cargo est clôturée : le registre courant passe de 20 partiels/1 effectif à **19 partiels/2 effectifs**, sur 21 chapitres jouables. Les JSON/XLS historiques V157/V158 restent inchangés à 20/1. Une succession stricte, avec mutations négatives, vérifie uniquement le delta Cargo ; les titres TR-0/QZ-17 déjà publiés dans R sont conservés. Cocon et HADAL ne sont pas promus. Toutes les valeurs `canonExact` restent fausses.

La silhouette HADAL, ses poses de nage, le bestiaire aquatique, les animations supplémentaires du MANTA et les arcs proposés restent ouverts. La coque ne livre pas la campagne Nacre-7. La provenance complète, les prompts et les limites sont dans `CARGO_ABYSS_ART_PROVENANCE_20261117.json` et `CARGO_ABYSS_ART_QA_20261117.md`.

La CI Chromium de R confirme désormais Trials : **47 contrôles et 30 captures originales conservées**, zéro erreur de page/requête/HTTP, acquisition de pause par un seul P avant et après reprise et conservation des équations balistiques. Le merge de test a R pour parent et exactement son arbre. Ce succès appartient à R, pas au nouveau lot. Le parcours titre mobile de R échoue après dix cas et 70 contrôles : sa trace montre Entrée pendant le fondu, avant le retrait de l'écouteur global de l'introduction. Le pilote attend maintenant le détachement réel, observe l'état natif puis envoie une seule Entrée si le titre est encore idle ; le budget total de 30 s, les douze fonctions existantes et les neuf assertions sont conservés. Les deux nouvelles régressions et la suite Intro **6/6** passent ; le mutant retirant la seule attente échoue. Elles exécutent le vrai bloc Python, `playIntroV188` et le contrôleur de titre avec des hôtes DOM/RAF/transport explicitement déclarés. La qualification Chromium de ce correctif reste ouverte dans T028, séparément des rendus artistiques.


## Continuation — Scaphandre HADAL modulaire (17 novembre 2026)

Après le lot Cargo/MANTA publié `a3634de7`, **trois PNG de 1254 × 1254, totalisant 3 235 815 octets**, fournissent les 19 pièces du scaphandre HADAL : trois torses, huit pièces de bras/gants, bassin, six pièces de jambes/bottes et casque fermé. Quinze pièces se composent dans une pose courante. Les sources sont copiées intactes et mesurées par composant, sans découpe aveugle sur la grille. L'identité prolonge la combinaison pressurisée du projet ; aucun modèle canonique individuel « 1:1 » n'est prétendu.

Le vrai joueur admissible d'Abysse Noir, hors MANTA, partage une posture entre casque, col, thorax, bassin, bras et arme. Le volume vitré entre dans la sonde d'oxygène native. Le gabarit physique 42 × 92, les os, semelles, modes, règles de pression/O2 et sauvegardes conservent leurs propriétaires. Le muzzle peut changer par rapport à l'ancienne pose aérienne ; projectile admis, mains et arme dessinée restent cohérents indépendamment des images. Les autres acteurs et costumes restent exclus.

La revue a rejeté l'appui initial trop accroupi, puis une variante au torse trop petit. La version retenue garde un casque de référence de 18,5 px, un torse ajusté uniformément et un appui prêt légèrement fléchi : hanche environ 3,95 px sous le parent, sans prétendre conserver sa pose au pixel. Les captures mesurent 88 px de hauteur opaque en appui et 80 px en suspension, arme comprise, distincts de la référence interne à 96,5 px. Le soin garde une pose propre.

Les trois images sont admises ensemble ou le corps natif est conservé entier avec la même posture recalée. Les sept sous-ensembles incomplets donnent le même repli, qui n'est pas déclaré identique à l'ancienne posture du parent. La bande cyan Legacy ne disparaît qu'après un dessin HADAL neuf dans la passe courante. Le cache reste limité à 16 images, avec priorité au matériel natif ; le shell passe à 729 entrées par ajout du seul helper, sans précache des PNG. Les quatre preuves sont exclues du build.

Le contrôle indépendant donne **1 069/1 069**, zéro erreur, **59 conditions et 107 rasters** : deux directions, trois modes, visées, actions natives admises, soins réellement terminés, huit masques d'images, perte à la même horloge, six exclusions et transitions MANTA. Les six exclusions gardent exactement les pixels du parent. Les sources, mesures, états, observations anatomiques et hôtes sont déclarés dans le reçu. Deux vues du monde et la planche des poses sont inspectées ; ces preuves Canvas ne sont pas des parcours Chromium.

La suite finale passe **151/151** ; la revue indépendante confirme les neuf empreintes gelées et le mutant causal de stature. L'ancien 150/150 appartient au premier candidat rejeté. Les quatre fichiers de distribution conservent leur contrôle 77/77. La fin d'un soin était auparavant bloquée par le chemin de mouvement Legacy : un seul appel à son propriétaire natif rétablit 2,2 secondes actives, +48 santé plafonnée et un kit, avec pause et interruptions contrôlées. L'annulation par intention clavier n'est pas ajoutée.

Ce lot clôt le manque de silhouette modulaire locale, sans inventer un cycle dédié de nage, une animation de MANTA, dix castes aquatiques, un second boss ou les actes de Nacre-7. La dette combinée reste ouverte ; **21 chapitres jouables, 19 partiels et deux effectifs**, `canonExact: false`. Les résultats de release et de CI sont attribués séparément au commit exact dans la PR #49.

Traçabilité : [provenance et paramètres](HADAL_ART_PROVENANCE_20261117.json), [QA et limites](HADAL_ART_QA_20261117.md), [planche intégrée](HADAL_ART_OVERVIEW_20261117.png), [reçu indépendant](HADAL_ART_RENDER_RECEIPT_20261117.json).


### Qualification CI des pilotes précédents

Les cinq workflows du parent Cargo `a3634de7` sont désormais réussis : Forge, Alien_base, Gameplay V162, [Full release](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44126735894) et [Excel V163](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44126735899), ce dernier avec ses 15 jobs. Le [job titre](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44126735899/job/134192459856) confirme le correctif d'attente de l'introduction : **128 contrôles, 18 configurations et zéro erreur de page/requête/HTTP**. Ses 36 captures sont déclarées dans l'artefact distant ; aucun de ces PNG n'est téléchargé dans ce travail.

Le rapport conservé a pour SHA-256 `9ea43a9e11f4c761a2f2e88613e255b766afc15a4ce69e86b7797b439e4f5933`. L'identité du build reste `143.0.0+f23c5a2a16f5` avant/après ; ce merge a C pour parent et son arbre est exactement `3b1f99dd9e695542197ba11844250117a634de38`, celui de C. La trace mobile avec mouvement réduit envoie Entrée après le retrait réel de l'introduction puis atteint le menu. Cela qualifie T040 et clôt le suivi T028, en complément des preuves Trials, Forge, campagne et Cocon de R. **Ce succès est attribué à C ; il ne remplace pas les contrôles ou la CI du nouveau commit HADAL.** Vercel reste distinct : le quota de déploiements empêche encore de confirmer un nouvel aperçu web.

### Publication et aperçu du lot HADAL

Le lot HADAL est publié dans la PR #49 sous [`361e40670c393dd548b4faa081f12edb0e9b05c4`](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/361e40670c393dd548b4faa081f12edb0e9b05c4). La vérification complète de cette révision passe **4 750 tests : 4 749 réussis, zéro échec et un saut hérité**, puis `check`, `build`, `check:built` et le contrôle de livraison. Une première exécution dont le journal s'était arrêté sans verdict reste conservée comme incomplète ; elle n'est comptée ni comme réussite ni comme échec. La reprise complète et ses résultats appartiennent au même arbre exact. Le reçu final a pour SHA-256 `571a08ca4681a62ad6f0d180de052edae1feab21b67fc9e27936d4123948b679`.

Le blocage Vercel mentionné au-dessus appartenait au suivi du parent Cargo. L'[aperçu HADAL](https://aliens-tantalus-frontier-gawn875fw-darknigthmares-projects.vercel.app) est désormais `READY` et son `build-info.json` répond HTTP 200 avec **`143.0.0+361e40670c39`** et le commit exact. Les 2 235 entrées du manifeste servi correspondent au build local vérifié : 2 233 sont identiques, dont toutes les images ; seules `src/release-info-v143.js` et `sw.js` changent par l'horodatage et le nom de cache du nouveau build. Cette comparaison porte sur le manifeste servi, sans retéléchargement de chaque image ni nouveau parcours navigateur. La PR reste ouverte, sans fusion.

## Continuation — Reine ailée de Broodstorm (17 novembre 2026)

À partir de HADAL publié `361e4067`, trois PNG intacts de **1254 × 1254**, soit **3 796 671 octets**, apportent douze poses : quatre phases de poursuite, quatre de repos/réaction et quatre de mort en suspension. L'identité suit la référence 36 du projet : profil droit, crête et corps biomécaniques sombres, membranes orangées. La référence 37 n'est pas mélangée aux poses. Cette continuité d'une adaptation Tantalus conserve `identityVerified:false` et `canonExact:false`.

Le véritable acteur `legacy-queen-0` utilise ces planches dans `drawEnemy` Legacy, avec ses clips V56, ses cadences natives et sa boîte physique **336 × 268,28125**. La hanche reçoit un pivot mesuré par pose ; chaque famille garde une échelle anatomique uniforme. Les trois feuilles doivent être valides ensemble. Les acteurs étrangers, objets détachés et anciens propriétaires de reprise sont exclus. Le corps reste admissible après le passage natif à l'extraction, jusqu'à sa disparition après 2,8 secondes ; aucune chute, attaque animée ou mécanique d'atterrissage n'est ajoutée.

La revue V1 a montré que la barre de santé traversait l'aile haute. V2 la place au-dessus de l'union des douze silhouettes, à une hauteur indépendante du battement. Largeur, couleurs et ratio de santé restent natifs. La visibilité inclut les cellules complètes et l'ombre, sans agrandir les collisions. Le repli conserve le rendu et la barre antérieurs.

Les suites de comportement et d'intégration passent **72/72**, dont neuf tests dédiés ; deux mutants isolés prouvent l'appel au dessin dédié et le déplacement de la barre. Les contrôles du registre et des trois consommateurs historiques passent **47/47**. Le terminal ajoute douze successeurs et deux nouvelles sources, portant sa couverture à 133 successeurs et onze ajouts. Les six blocs historiques, le registre Cargo et son vérificateur conservent leurs octets.

La revue native réussit **51 captures candidates et trois comparateurs H**, sans échec final : 24 poses orientées, huit masques d'images, deux exclusions, pause, reprise, six états de mort, quatre bords et deux vues de poursuite FR/EN. Sept kits incomplets et deux exclusions donnent les pixels exacts du parent. Les huit secondes de poursuite utilisent une position initiale de véhicule déclarée puis les vraies mises à jour, sans déplacer artificiellement le HUD ou la caméra. Les contrôles en mouvement réduit restent unitaires ; les vues EN gardent certains libellés dynamiques français. La minuscule différence de y lors de la reprise et l'omission de vx/vy sont reproduites identiquement sur H et le candidat. Les captures ne certifient ni un parcours navigateur ni toutes les étapes du fondu de mort.

La distribution passe **77/77**, puis le contrôle source réussit sur **3 549 fichiers et 1 598 assets**, sans document privé. Les quatre preuves et le vérificateur restent source-only ; le helper porte le shell à 730 entrées, sans précache des PNG. Une seconde revue indépendante confirme les empreintes, les 55 images référencées (captures et planche) et la cohérence des limites, sans ajouter de tests aux comptes.

Le premier candidat non publié rencontre un échec parmi ses 4 761 tests complets : la notice du dossier ne contenait plus le mot « adaptation », exigé par un contrôle Legacy existant. Le correctif rétablit « adaptation aérienne » et sa traduction anglaise, sans modifier le test, l'art ou les comportements. Les preuves conservent le candidat refusé, son journal et les sources de capture ; cette correction purement textuelle est ajoutée comme succession explicite dans la provenance et le reçu. Les suites ciblées Legacy et terminal passent ensuite **31/31**, sans échec ni saut, puis le contrôle source réussit à nouveau sur 3 549 fichiers et 1 598 assets. Le reçu de cette passe porte le SHA-256 `e17b7097b654631c21b0a6c93f8cf6a6e3b603b6063f2688942438491d442907`. Les gates complets du candidat corrigé sont consignés sur sa révision exacte dans la PR #49.

Seule la dette `dedicated-flying-queen-art` est clôturée. Broodstorm reste partiel, avec `complete-modular-dropship-corpus` ; le registre garde **21 opérations jouables, 19 partielles et deux effectives**. Les notices FR/EN et la bible distinguent désormais cette Reine illustrée du Cheyenne réemployé et des actes ou atterrissages non produits. Les résultats de captures, de distribution et de publication sont attribués à leurs révisions dans la QA et la PR #49.

Traçabilité : [prompts et calibration](BROODSTORM_QUEEN_ART_PROVENANCE_20261117.json), [QA et limites](BROODSTORM_QUEEN_ART_QA_20261117.md), [planche intégrée](BROODSTORM_QUEEN_ART_OVERVIEW_20261117.png), [reçu natif indépendant](BROODSTORM_QUEEN_ART_RENDER_RECEIPT_20261117.json).

### Publication et aperçu de Broodstorm

Le candidat corrigé est publié dans la PR #49 sous [`b9aee06a0783bc7c0cf7094268a08618364df781`](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/b9aee06a0783bc7c0cf7094268a08618364df781), enfant unique de HADAL. Cette révision exacte passe **4 761 tests : 4 760 réussis, zéro échec et un saut hérité**, puis `check`, `build`, `check:built` et la comparaison de livraison. Le reçu des cinq gates a pour SHA-256 `de58a55c24976a4dea79c8326a348053b5f37ce6e24f2390091389ff526d6125`. Le premier candidat refusé pour sa notice et ses journaux restent conservés ; ils ne sont pas réattribués au succès du correctif.

Le build `143.0.0+b9aee06a0783` contient 2 239 entrées et conserve les octets des 73 PNG ajoutés depuis le début de cette continuation, soit 144 039 986 octets. Le reçu de livraison porte le SHA-256 `5b69580b71f607b85a7895d61f9deab0165a2148dff22e719dbb47a0344a171d`. Une seule mise à jour conditionnelle de la branche est effectuée depuis HADAL ; la PR reste ouverte et non fusionnée.

L'[aperçu Broodstorm](https://aliens-tantalus-frontier-9maez4vrt-darknigthmares-projects.vercel.app) est `READY`. Son `build-info.json` répond HTTP 200 et identifie le commit publié et le même build. **2 237 entrées de manifeste sur 2 239 sont identiques** au build local contrôlé, dont toutes les images ; seules les métadonnées générées de `src/release-info-v143.js` et `sw.js` diffèrent avec l'heure et le cache du build distant. Le reçu de comparaison a pour SHA-256 `9af9a41a5dd232b9b571aec55ce420efe9f5a47d4bd5b6a805572491e4105517`. Cette vérification ne retélécharge pas tous les corps d'images et n'est pas un parcours navigateur. Les cinq workflows distants de HADAL sont désormais réussis ; les nouveaux workflows Broodstorm restent suivis sous leur propre SHA.


## Continuation — Reine-Mère adulte rouge (17 novembre 2026)

Base : Broodstorm publié `b9aee06a0783bc7c0cf7094268a08618364df781`. Le chapitre existant « Le chant de la Reine-Mère » reçoit **trois PNG intacts de 1254 × 1254, 3 492 612 octets**, pour huit poses de corps et quatre bras séparés. Une pose compose cinq couches ; les douze pièces dessinées ne sont pas douze frames. Le dossier `yhw:XEN-032` et trois photographies officielles NECA de la Red Queen Mother de *Genocide* fournissent la référence. La reconstruction latérale et les poses vivantes restent une adaptation documentée, sans promotion de `visual1to1` ou `canonExact`.

Les deux premières planches complètes sont rejetées pour un quatrième bras mêlé au torse. Le kit modulaire distingue les deux grands et les deux petits bras. Le premier corps d'action/mort est aussi rejeté pour son voile gris/rouge ; une correction de génération, inspectée sur fond clair et sombre, est copiée intacte. Les pieds et les attaches sont mesurés avec une échelle commune 210/593, sans redimensionnement selon la boîte de chaque pose.

Seul l'objet boss courant de `queen-mother-song` reçoit cet art. Les trois sources sont admises ensemble ; les sept masques incomplets gardent le dessin vectoriel entier. Les autres écosystèmes et les anciens propriétaires après reprise restent exclus. La boîte 170 × 210, les 600 points de santé, les quatre phases, les trois Chœurs, les vraies salves, la nurserie, les balises, l'extraction et les sauvegardes conservent leurs règles.

Un défaut du premier raccord est réellement détecté : la grâce d'insertion retire les projectiles après l'appel du contrôleur intérieur, qui avait déjà créé le marqueur visuel. Le helper refuse désormais l'acteur retenu par ce propriétaire extérieur. Les tests de vraies salves laissent expirer la protection par 4,05 secondes d'updates natifs ; ils ne la désactivent pas artificiellement. Le premier groupe reste enregistré à 35/39, le groupe corrigé passe **39/39** et trois mutations causales sont refusées. Les premiers échecs techniques du loader ne sont pas comptés comme des détections.

La matrice de pixels comporte **54 captures candidates, huit comparateurs B2, 14 comparaisons exactes et sept observations de visibilité**, sans échec final. La comparaison des HUD exclut seulement la dernière notice volontairement modifiée ; les deux autres écosystèmes restent identiques sans masque. Un complément de trois images montre le cadavre dans le champ, puis sa disparition à 1,25 seconde observée après la durée native de 1,2 seconde. La première séquence, dont la caméra restait à l'insertion, conserve sa limite. Le nom, la barre et l'avertissement natifs restent au-dessus de l'art ; la crête dégage la barre d'un pixel raster. Les recouvrements de l'alpha 0,3 par composant, les bras partiellement masqués du cadavre, ses renforts et leurs noms sont documentés. Deux captures couvrent le repos en mouvement réduit ; les autres cas appartiennent aux tests de code.

La seule dette close est `dedicated-queen-mother-animation`. `complete-royal-cast` demeure ouverte : Chœurs, gardes et renforts gardent leur présentation provisoire. Les quatre suites de succession passent **49/49** et préservent les archives et les blocs Cargo/Broodstorm à l'octet près. Le registre reste à **21 opérations jouables, 19 partielles et deux effectives**. La clôture de l'art adulte ne termine pas l'arc étendu de TR-0.

Le helper porte le shell à 731 entrées ; les trois images restent chargées à la demande. Les quatre preuves et le vérificateur dédié restent source-only. Distribution **77/77** et contrôle source réussi : **3 558 fichiers, 1 601 assets, zéro document privé**. Les sources et images observées concordent avant/après. Le candidat n'était pas encore committé pendant les captures : leur attribution repose sur les empreintes réelles, et les gates complètes de release, le build, la publication et l'aperçu sont suivis séparément sur le commit exact dans la PR #49. Aucun parcours local Chromium ni achèvement global 1:1 n'est revendiqué.

Preuves : [références et six générations, dont trois sources livrées](QUEEN_MOTHER_ART_PROVENANCE_20261117.json), [rapport et limites](QUEEN_MOTHER_ART_QA_20261117.md), [planche intégrée](QUEEN_MOTHER_ART_OVERVIEW_20261117.png), [reçu natif consolidé avec tests et calibration](QUEEN_MOTHER_ART_RENDER_RECEIPT_20261117.json).

### Publication vérifiée de la Reine-Mère

Le commit `c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c`, arbre `9d4ce1a26c43d2c4fcbd4642dc940d0ffa4cd1d5` et parent unique Broodstorm B2, est publié dans la [PR #49](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/49), ouverte et non fusionnée. Les cinq contrôles effectués sur ce commit exact passent : `test:all` (**4 776 tests, 4 775 réussis, zéro échec, un ignoré hérité**), `check`, `build`, `check:built` et la comparaison de livraison. Le build contient 2 243 fichiers et 731 entrées de shell, garde le schéma de sauvegarde 52 et conserve à l'octet près les **76 PNG ajoutés depuis le début de la continuation, 147 532 598 octets**. Le reçu des cinq contrôles a pour SHA-256 `82bdabf82148f3377cc14e7e8bd70bd866d5f770ec03d8d01ef179d14edf130a` ; le reçu de livraison exacte, `0df80e645f1fe1bd2d5757adff4fb7f5e4bfc56eac2ce7322bea142bf3bca244`.

L'[aperçu de la Reine-Mère](https://aliens-tantalus-frontier-op91c8vpu-darknigthmares-projects.vercel.app) est `READY`. Son manifeste servi par HTTP 200 identifie le même commit et le build `143.0.0+c1d4c6363472`. **2 241 entrées sur 2 243 sont identiques** au manifeste local, dont les 76 PNG de la continuation. Les deux différences attendues portent sur les métadonnées générées de `src/release-info-v143.js` et `sw.js`, liées à l'heure du build distant. Le SHA-256 du reçu de comparaison est `d833c04bb3c51d478baac9cc8ea04f3422f244304adf09fc3849bfb6a04c77f1`. Ce contrôle relit les empreintes publiées dans le manifeste ; il ne retélécharge pas individuellement les corps d'images et ne constitue pas un parcours navigateur. Les workflows distants restent suivis sous leur propre SHA.


Les cinq workflows distants associés au commit Q sont ensuite observés terminés avec succès entre 21:39:52 et 21:39:53 UTC : Full release regression, Excel continuation V163, Gameplay continuation V162, Frontier Forge regression et Alien_base bridge verification. Cette réussite appartient au SHA Q ; les contrôles du lot suivant sont suivis séparément.

## Continuation — Gardes de la Reine-Mère (17 novembre 2026)

Base : Reine-Mère Q publiée `c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c`. Les **six gardes initiaux et douze renforts possibles** reçoivent les seize cellules de l'atlas praetorian normalisé existant : 1024 × 1024 RGBA et **540 822 octets**, SHA-256 `f4c778139b8018952bbd5c27c2fbd57449310b6ef973803750173e8ba769ecda`. Le lot ne crée ni ne modifie aucun asset PNG. Le réemploi illustre le rôle `guard` sans attribuer une caste aux descripteurs du chapitre ni importer le profil de combat du catalogue.

Les seize cellules sont calibrées à l'échelle commune **70/161**, avec l'appui Y240 et des pivots horizontaux par pose. Les 32 compositions statiques et leurs comparateurs distinguent l'alignement construit de la fluidité observée. Les pieds, flexions et effondrements peints sont conservés ; le corps natif reste 58 × 70, à 105 points de santé, vitesse 72 et dégâts de contact 14. La frange cyan/magenta historique et les détails denses restent documentés.

La marche suit le déplacement réellement accepté après le retour de toutes les couches de `updateEnemy`, y compris la grâce d'insertion qui peut rétablir la position. L'impact suit uniquement le retour fini et positif du vrai `damagePlayer`. Les deux observations privées ne sont pas sauvegardées ; l'expiration avance avec l'horloge native, avant les sorties précoces. Le dessin reste sans effet de bord, le chargement appartient à l'entrée et à la reprise, et toute indisponibilité conserve le corps vectoriel complet. Le groupe moteur réussit **56/56**, dont dix-sept cas dédiés ; trois mutations causales sont détectées. Les erreurs techniques initiales des pilotes de mutation restent séparées de ces détections.

La passe native finale réunit **76 PNG candidates, huit comparateurs Q, 86 observations candidates et douze comparaisons conformes**. Elle couvre les seize poses et leurs miroirs, les dix-huit propriétaires, les deux sols, la marche acceptée, le contact, la reprise et la mort visible. Les 32 poses imposées, les dix observations sans PNG, les seuils de balise préparés juste avant 7/14/21 secondes et les sondes synthétiques de caméra sont déclarés. La défense temporelle complète et le mouvement réduit appartiennent aux tests de code. Le vrai cadavre est observé dans le monde à 0 / 0,3 / 1,25 s, sans réécriture du timer ; son alpha natif 0,3 et son occultation partielle par le butin restent visibles. L'essai 01 interrompu par le code système 137 conserve ses dix PNG hors résultat validé ; l'essai 02 réussit avec les mêmes sources et le même atlas.

La revue visuelle accepte les appuis, miroirs, marges de noms et de barres, et l'ellipse d'anticipation native. Les 22 empreintes de sources/hôtes/tests et les quatre PNG surveillés restent identiques avant/après. Cette preuve utilise le vrai moteur et un Canvas raster natif avec hôtes déclarés ; elle ne constitue pas un parcours local Chromium. Le reçu natif final porte le SHA-256 `df51e71a4fa920d69f7c5aae4724bacc17d517dbc44d4f3dac0f990b1368d7c4`.

Les quatre suites du registre et de ses consommateurs réussissent **51/51**. R → Q est une projection identité : les opérations et leurs déclarations restent exactes, les trois changements cumulés restent Cargo, Broodstorm et l'adulte Q. La succession admet douze fichiers ordinaires, deux nouvelles sources et le seul changement de notice du vérificateur adulte Q, dont tous les autres octets sont protégés. Aucune dette n'est refermée ; **21 opérations restent jouables, 19 partielles et deux effectives**. Les Chœurs restent vectoriels et `complete-royal-cast`, comme les actes étendus de TR-0, demeure ouvert. Les notices FR/EN et la bible décrivent cet état sans promotion de `canonExact` ou de fidélité globale 1:1.

La distribution réussit **77/77**, puis le contrôle source passe sur **3 564 fichiers et 1 601 assets**, sans document privé. Le shell compte **732 entrées**, l'atlas reste chargé à la demande et les quatre preuves restent source-only. Le schéma de sauvegarde demeure 52. Le reçu de cette passe ciblée a pour SHA-256 `43d910e75575fe6b30169855ae862aa717415c71c25a42aff23e3b5c1bfe5364`. Les sources gelées ne changent pas pendant ces contrôles ; les rapports sont ensuite complétés à partir des résultats. Les cinq gates complètes, le build exact, la publication et l'aperçu sont attestés séparément dans la PR #49, sans fusion.

Preuves : [réemploi et références](QUEEN_MOTHER_GUARD_ART_PROVENANCE_20261117.json), [QA et limites](QUEEN_MOTHER_GUARD_ART_QA_20261117.md), [planche native](QUEEN_MOTHER_GUARD_ART_OVERVIEW_20261117.png), [reçu consolidé](QUEEN_MOTHER_GUARD_ART_RENDER_RECEIPT_20261117.json).


## Livraison du parent R — gardes de la Reine-Mère

La continuation R est publiée sous `ded6ef34dd35a659313e9361b407f6b94b62fb96`, arbre `f11cbb3f2a6ca846c481d9169396802877e2fc7b`, parent unique Q `c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c`. Les cinq gates ont été exécutées sur ce commit API exact dans un checkout distinct et propre : **4 795 tests, 4 794 réussis, zéro échec et un saut hérité**, puis `check`, `build`, `check:built` et comparaison de livraison réussis. Le build `143.0.0+ded6ef34dd35` contient 2 244 fichiers, un shell de 732 entrées et le schéma 52 ; les 76 PNG cumulés depuis la base de continuation, 147 532 598 octets, concordent avec les sources.

Une seule mise à jour conditionnelle du parent Q attendu vers R, avec `force:false`, est confirmée par le connecteur. La branche puis la PR #49 sont relues sur R à 22:02:42 et 22:02:47 UTC le 17 novembre 2026. La PR reste ouverte et non fusionnée. Reçu des cinq gates : SHA-256 `5ddab6e9cfd0d9bc0b391de90780ce3d7e0b128394ed2067abdbb794eda533ba` ; reçu du build exact : `a92e09c4a233141ef2bc4840e5a61428d55a6fbb811c83023facc49bac5afe72` ; reçu de publication : `7f9e257dabdf158be6d25364603af535bf2f759a901b556293a0bfcb97ff4db6`. Ces résultats concernent R et ne sont pas attribués au candidat C suivant.

## Continuation — Chœurs locaux de la Reine-Mère

Le lot C illustre les trois cibles natives `eco131-target-0/1/2` par une **création originale Tantalus**, sans leur attribuer une anatomie de caste. La recherche locale établit leur rôle, mais aucune anatomie propre documentée. Une seule génération fournit quatre fonctions — présence A/B, réaction et neutralisé — dans un PNG RGBA de 1254 × 1254, **920 091 octets**, copié intact. Le dessin conserve la matière bordeaux/mauve et une arche costale distincte de l'œuf, de l'adulte et des gardes. La source presque frontale, ses franges et son alpha dominant 253 restent déclarés.

Les seize compositions statiques et la revue root retiennent des cellules complètes de 627², une échelle commune **90/525** et des pivots structurels. Les hauteurs de réaction 72 px et de neutralisé 37,2 px s'écartent des amplitudes initialement visées ; elles sont acceptées sans mise à taille individuelle. Le PNG n'est ni nettoyé ni redécoupé. Les corps physiques restent 66 × 90 et 110 PV ; aucune attaque, locomotion propre ou donnée sauvegardée n'est ajoutée. Le recul générique après un vrai coup existait dans R et reste inchangé.

Le helper vérifie l'opération, le propriétaire courant, le rôle, l'indice, l'ID et le descripteur natif. Il lit les horloges existantes, ne charge rien depuis le dessin et conserve un repli vectoriel indépendant des familles Q/R. Le dernier corps demeure admis après la transition à `mother-1`. Le groupe moteur passe **64/64**, dont dix-sept cas dédiés, sans correction de production après la première passe ; deux mutants causaux déclenchent les assertions attendues, sans erreur de chargeur. Les objectifs, jalons, protection du boss, pression, pause/reprise et temporisation de mort restent natifs.

La QA conserve **60 PNG candidates, neuf comparateurs R et 82 observations candidates**, avec 24 poses imposées, 40 audits anatomiques et 30 comparaisons conformes. L'unique échec initial est une attribution de fixture omettant la secousse native : il reste dans l'historique. Trois captures ciblées, appuyées sur la transformation indépendante du nom, confirment le dessin du dernier corps à 0 et 0,3 seconde puis son absence à 1,25, sans changer shake, tolérance ou moteur. La lecture sombre et les occultations par garde/butin/particules sont acceptées et documentées. Les captures Canvas ne sont pas un parcours navigateur.

Le registre demeure une identité C → R, avec **54/54** dans ses quatre suites : onze successeurs ordinaires, le seul successeur de notice du vérificateur Q et deux nouvelles sources. La clarification de la Bible sur le recul produit une seconde passe documentaire, en préservant le premier résultat et les historiques. **21 opérations restent jouables, 19 partielles et deux effectives**. `complete-royal-cast`, les trois castes liées de l'arc étendu et T055 restent ouverts ; les trois cibles illustrées ne clôturent pas ce périmètre.

La distribution réussit **77/77**, puis le contrôle source passe sur **3 571 fichiers et 1 602 assets**, avec zéro document privé. Un seul helper rejoint le shell de **733 entrées** ; le PNG reste chargé à la demande et les quatre preuves sont source-only. Le schéma reste 52. Les 29 fichiers surveillés et l'identité Git sont stables pendant cette passe, dont le reçu a pour SHA-256 `c1aedeb36a557ca66e45f12cb4ac2bb3e9123e8aafb02115f68c5ab70fc5d072`. Les rapports sont ensuite complétés ; les cinq gates, le build et la publication C sont attribués séparément au commit exact dans la PR #49.

Preuves : [provenance et calibration](QUEEN_MOTHER_CHOIR_ART_PROVENANCE_20261117.json), [QA et limites](QUEEN_MOTHER_CHOIR_ART_QA_20261117.md), [planche native](QUEEN_MOTHER_CHOIR_ART_OVERVIEW_20261117.png), [reçu consolidé](QUEEN_MOTHER_CHOIR_ART_RENDER_RECEIPT_20261117.json).

## Course du convoi de l'Acte V (continuation du 21 novembre 2026)

Base : `7bce88d6`. *Dernier départ* (`act5-last-run`) et *La Reine du dépôt* (`act5-depot-queen`) deviennent une course APC dédiée, sans changer leurs identifiants ni l'enchaînement du conseil. Règles : [`act5-convoy-race-v188.js`](../../src/act5-convoy-race-v188.js) ; mission : [`act5-convoy-race-runtime-v188.js`](../../src/act5-convoy-race-runtime-v188.js), composée juste au-dessus de la chaîne V158, sous toutes les couches V188 dont l'ordre est inchangé ; détail et valeurs [PROPOSÉ] dans la bible (§5.11, « Course du convoi »).

| Élément | Statut | Constat |
| --- | --- | --- |
| Remorques physiques | Partiel | Chaîne M577 → colons → fret sur timons à ressort amorti avec butées ; masse et traînée ralentissent le convoi ; art existant des deux remorques réemployé à son chemin d'origine |
| Largage de remorque | Partiel | `C` / `X` ; la première remorque lâchée pendant *Dernier départ* est la décision du pont ; une remorque abandonnée arrête coureurs ou Reine ; conséquences additives `storyCampaignV188.act5.convoyV188` (colons perdus après le pont retirés de l'appel de CIN-61) |
| Pont jouable | Partiel | Tablier qui s'affaisse sous deux remorques (fenêtre 15 s, +6 avec Orlov), attelage arrière qui cède sans décision, effondrement qui suit le convoi et l'emporte s'il s'arrête ; primitives Canvas |
| Poursuite de la Reine | Partiel | Admission du profil royal de stature 4,8 m avant toute logique, machine à états explicite, 245 px ; **substitut Canvas**, emplacement `act5-queen-chase-side` déclaré sans fichier. *2026-11-22 : elle atteint toujours le carrefour (plancher de santé et recul pendant la poursuite, mort seulement au carrefour) ; voir « Décisions du propriétaire du 22 novembre 2026 ».* |
| Checkpoints, reprise, extraction | Partiel | Un checkpoint par phase ; capture et reprise validées ; insertion et extraction UD-4L en mode `apc` |

Vérifications : `scripts/verify-act5-convoy-race-v188.mjs` (12 tests, dans `test:priorities:v188`) ; parcours Chromium `scripts/qa-act5-convoy-race-v188.mjs` sur deux fixtures importées par l'écran Options, au clavier réel, sans injection de position : 12/12 contrôles, aucune erreur de page ni de console. Les captures attestent le rendu de ce parcours, pas une fidélité « 1:1 ». Le M577 de mission garde sa planche d'action existante ; la Reine, le pont et les coureurs sont des primitives en attente d'art. Le statut global de l'Acte V reste **Partiel**. *2026-11-22 : le M577 de mission n'utilise plus la planche d'action : il est dessiné et heurté à l'échelle (449 px, substitut Canvas) ; voir la section suivante.*

## Continuation — Niveaux dédiés des missions de colonie C1-C4 (21 novembre 2026)

Spec `specs/008-niveaux-colonie` ; bible §6.4 (« Niveaux dédiés C1-C4 »). Code : `src/colony-mission-levels-v188.js` (phases, apparitions, interactions maintenues, checkpoints, dessin), `src/colony-level-places-v188.js` (lieux mesurés sur les gabarits), `src/colony-level-art-v188.js` (18 emplacements nommés), quatrième définition de cale `colony-c1-port-corridor` (`src/depth-hold-sections-v188.js`), coût de stabilité de C4 appliqué au règlement (`src/app.js`).

| Élément | Avant | Après | Reste |
| --- | --- | --- | --- |
| C1 Tenir le port | Gabarit générique (reine, générateur, tenue de zone) | Couloir V2 ≈ 4 450 px : rideau de l'entrepôt QZ17-04, 3 patients menés à la plate-forme, sas A et B soudés 6 s (pause aux coups), 2 sentinelles UA 571-C posées, pic au sas B, retour calme | Art des emplacements ; voix de Lucia Ferro |
| C2 L'air du port | Gabarit vaisseau générique (et cale procédurale en profondeur) | V1 : passerelle et radio de Jun Park, embuscade des conduits, purge du nid des échangeurs, 3 disjoncteurs et console, surpression, route éclairée, extraction sur le pont haut | Le gabarit n'a que trois ponts : les « ponts » 3 et 4 du brief sont deux secteurs du pont bas ; art |
| C3 Le convoi des rescapés | Gabarit générique (nœuds de sauvetage) | V1 : quai du M577, file de triage, scanner de 5 rescapés, porteur déterministe conservé au checkpoint, jauge de panique et dispersion récupérable, éclosion à 240 s, Noor Okafor | ~~Noor est aussi un équipier IA de l'escouade quand elle est recrutée~~ *réglé le 2026-11-22 : retirée de l'escouade pour C3 seulement* ; la silhouette de l'infirmerie reste un placeholder ; art |
| C4 Le culte du port | Gabarit générique (conduits) | V1 de nuit : 3 indices, réseau de conduits V62 à deux branches (cul-de-sac et cache facultative), volet scellé, 3 convertis évitables / maîtrisables / tuables (stabilité −1, au plus −3), élu à libérer du cocon, décision C4 existante | ~~Les galeries techniques restent un second chemin vers le rassemblement~~ *réglé le 2026-11-22 : grille soudée dans la galerie et porte de toit soudée (le toit était un troisième chemin, malgré le cul-de-sac annoncé)* ; art des convertis (sprite « Cult Host » existant) |

Inchangés : identifiants, objectifs de campagne et objectif d'exécution correspondant (`defend-colony`, `restore-atmosphere`, `rescue-survivors`, `navigate-vents`), récompenses, `colonyMissionsV188`, `colonyC4DecisionPendingV188`, règles de reconstruction, annexes et contrats (gabarits génériques). Aucun nouveau champ dans la sauvegarde de campagne ; la reprise de mission reçoit le champ additif `colonyLevelV188`. Toutes les valeurs de temps, de nombre et de distance sont [PROPOSÉ].

Fidélité : rien n'est déclaré « 1:1 ». Documenté : sas soudés et sentinelles UA 571-C (*Aliens*, 1986 ; édition spéciale, 1991), ruche du processeur atmosphérique et colons cocoonés (*Aliens*), embryon détecté au scanner médical (*Alien 3*, 1992). Adapté : panique, compte à rebours, convertis des Enfants de l'Hôte Parfait (§1.5), deux sentinelles posées par le joueur. À définir : l'art des 18 emplacements (primitives Canvas ; aucune image générée) ; les civils réemploient la planche des survivants du cargo (V67) comme placeholder.

Vérifications réellement exécutées : voir le rapport de la PR et `scripts/verify-colony-levels-v188.mjs` (dans `test:priorities:v188`) ; parcours Chromium `scripts/qa-colony-levels-v188.mjs` avec fixtures et injections déclarées en tête du script (déplacements du marine entre les lieux, suppression des apparitions encore vivantes pendant une interaction maintenue, touche de visée tenue pour la panique). Ces parcours injectés ne valent pas une partie jouée sans aide ; les combats et l'équilibrage restent à éprouver en playtest.

## Décisions du propriétaire du 22 novembre 2026

Base : `79df744c`. Décisions enregistrées dans `QUESTIONS_PROPRIETAIRE_V188.md` (« Décisions du propriétaire (2026-11-22) ») ; règles et valeurs dans la bible (§5.7.1, §5.11, §6.4). Identifiants de contenu et sauvegardes conservés ; un seul champ additif de campagne (`storyCampaignV188.act5.restitutionLostV188`, absent des anciennes sauvegardes).

| Élément | Statut | Constat |
| --- | --- | --- |
| M577 à l'échelle dans les missions APC | Partiel | `src/m577-scale-v188.js` : 449 px pour 8,8 m **[À VÉRIFIER]** (aucune source du projet ne mesure le véhicule ; sources extérieures divergentes, sans source primaire, citées dans la bible) ; collision 449 × 112 ; substitut Canvas derrière `m577-mission-side-scale`, **aucune image produite** ; course de l'Acte V et convoi de l'Acte III (voies comprises). Le M577 conduit dans les niveaux ordinaires (190 px) et celui que descend le UD-4L quand il n'est pas le véhicule du joueur (236 px) ne sont pas changés |
| Fret perdu et fin | Fait (règle) | La remorque de fret lâchée au pont ou sur la route retire les conteneurs du compte ; plus de « restitution » à la cession, coût moral une fois ; fin et épilogue FR/EN mentionnent le fret perdu. Textes [PROPOSÉ] |
| Reine jusqu'au carrefour | Fait (règle) | État `recoil` ajouté à la machine dédiée ; plancher de santé 30 % et recul 8 m [PROPOSÉ] jusqu'au carrefour ; mort seulement au carrefour. Le sprite reste un substitut Canvas |
| C3 : Noor Okafor | Fait | Retirée de l'escouade de C3 (et de C3 seulement), réplique FR/EN ; l'opération et ses affectations ne sont pas modifiées (l'écran de préparation la liste encore) |
| C1, C3, C4 : pas de M577 dans les rues | Fait | Véhicule rangé au démarrage, insertion et extraction à pied. Le M577 garé au quai de C3 (décor de l'arrivée des rescapés) est conservé : à confirmer |
| C4 : conduits obligatoires | Partiel | Grille soudée (galerie technique) et porte de toit soudée, en primitives (`colony-utility-grate-sealed`, `colony-roof-hatch-sealed`, sans image) ; invite de raison ; accès logique et passage physique vérifiés |
| C1 : perspective du couloir | Partiel | Joints du pont plafonnés à un demi-écran du centre (640 px [PROPOSÉ]) ; vérifié par géométrie et captures, pas par un retour de playtest |

Vérifications exécutées : tests Node étendus `verify-act5-convoy-race-v188` (15/15), `verify-act5-endings-v188` (27/27), `verify-colony-levels-v188` (15/15), `verify-dropship-handover-v188` (44/44) ; parcours Chromium `qa-act5-convoy-race-v188.mjs` 18/18 et `qa-colony-levels-v188.mjs` 44/44, sans erreur de page, fixtures et injections déclarées en tête des scripts. Dans ce parcours navigateur, la Reine a été blessée et déséquilibrée mais n'a pas atteint son plancher (une remorque abandonnée l'a retenue) : le recul n'y a pas été observé ; il est couvert par le test Node déterministe. Rien n'est déclaré « 1:1 » ; aucune image n'a été générée.

## Niveaux dédiés de la station S1-S4 (2026-11-22)

Spec `specs/009-niveaux-station` ; bible §7.10. Code : `src/station-mission-levels-v188.js` (phases, apparitions, interactions maintenues, checkpoints, cadres scellés, dessin), `src/station-level-places-v188.js` (lieux mesurés sur le gabarit), `src/station-level-art-v188.js` (20 emplacements : 10 réemploient un PNG Asphodèle admis, 10 en primitives). Modèle : niveaux dédiés de la colonie (spec 008).

| Élément | Avant | Après | Reste |
| --- | --- | --- | --- |
| S1 L'arrimage | Gabarit vaisseau générique (roster, générateur, archives) et cale de cargo procédurale V2 | V1 : sas manuel, anneau éteint, ventilateurs et détecteur saturé, deux traces d'Echo-8, récupérateurs négociés ou forcés, alimentation de secours du pont de contrôle | Art de la manivelle, du ventilateur, de la craie ; issue des récupérateurs sauvegardée et collier en profondeur depuis le 23 novembre 2026 (section dédiée en fin de document) |
| S2 La voix de CASSIUS | Idem | V1 : trois disjoncteurs avec Kwan à la radio, réacteur relancé, interrogatoire de CASSIUS (spec 010, sur la mission en pause), ordres QZ17 copiés ; décision CASSIUS inchangée au Commandement, son texte reprend la dernière réponse de l'interrogatoire | Voix de CASSIUS et de Kwan ; art du disjoncteur et du panneau du réacteur |
| S3 Les ponts scellés | Idem, minuteur générique de 105 s | V1 : sas 3 selon la décision CASSIUS, laboratoire (berceaux, journaux, deux œufs), routage d'énergie, combat confiné, plaque de Kessler, compte à rebours de 150 s | Art de l'œuf, du journal, de la plaque, du routeur, du scellé |
| S4 Le hub Asphodèle | Idem, tenue de zone générique de 12 s | V1 : dernier nid, trois vannes, quai tenu 60 s, arrivée de l'équipe (et de Grue si alliée), extraction au quai | Colons volontaires et Grue selon S1 : faits le 23 novembre 2026 (section dédiée en fin de document) ; silhouettes en primitives |
| Parcours | Les conduits V62 et les ponts supérieurs contournaient chaque cloison | Conduits scellés, deux cadres scellés sur les ponts supérieurs ; chaque cloison est le seul passage (accès logique `stationAccessV188`, passage physique vérifié) | Art des cadres scellés |

Inchangés : identifiants, objectifs de campagne et objectifs d'exécution (`board-vessel`, `restore-atmosphere`, `escape-quarantine`, `hold-extraction`), récompenses, `stationV188` (forme vérifiée), chaîne d'accès, décision CASSIUS, scènes de retour, pièces du dossier, annexes et contrats (gabarit générique et habillage `asph-msn-*`). L'intro *Six heures de silence* n'a pas de gabarit de mission (fin de quête et CIN-70).

Fidélité : rien n'est déclaré « 1:1 ». Documenté : système Seegson obéissant, sas manuels, détecteur trompé par l'air en mouvement (*Alien: Isolation*, 2014 ; références de Paul Abbott) ; équipe perdue et caméras de casque (*Aliens*, 1986) ; œufs (*Alien*, 1979 ; *Aliens*). Adapté : plan de la station sur le gabarit, routage d'énergie, compte à rebours, issue des récupérateurs.

Vérifications réellement exécutées : voir le rapport de la PR, `scripts/verify-station-levels-v188.mjs` (dans `test:priorities:v188`) et le parcours Chromium `scripts/qa-station-levels-v188.mjs` (fixtures et injections déclarées en tête du script : marine déplacé entre les lieux, apparitions encore vivantes retirées par `defeatEnemy`, tenue du quai de S4 ramenée à 3 s).

## Décisions du propriétaire du 22 novembre 2026 — second tour

Le M577 à l'échelle partout, le M577 de C3, Noor sur l'écran de préparation, le cadrage de la poursuite (`QUESTIONS_PROPRIETAIRE_V188.md`, D5-D8).

| Élément | Statut | Constat |
| --- | --- | --- |
| M577 conduit des niveaux ordinaires à l'échelle | Partiel | 449 × 112 px pour les véhicules 001 et 002 (substitut Canvas `m577-mission-side-scale`, la planche d'action de 250 px n'étant pas à cette échelle). Stationnement dérivé de la géométrie existante (voie de sol continue, ni cabine d'ascenseur, ni pont bas, ni porte, voie de l'extraction), conduite bornée à la voie, sortie par la porte latérale, tir depuis la tourelle de toit. Contrôlé sur tous les niveaux ordinaires où il roule (`colony-multiroute`, `planet-exterior`). Dans la rue de la colonie il était garé au-dessus de la cage d'ascenseur de la sécurité. Reprises : champ additif `vehicle.w`, anciens enregistrements acceptés au même centre. La forge garde l'ancienne boîte (fichiers gelés) |
| M577 du largage à l'échelle | Partiel | Même coque ; le UD-4L reste en vol stationnaire (150 px [PROPOSÉ]) pour le descendre ou le hisser, le M577 roule dans sa voie sans franchir de porte et repart hissé ; extraction à bord : levage au-dessus de la coque, sur sa voie. Substituts Canvas |
| C3 : M577 garé au quai | Partiel | 449 px, entièrement sur le sol du quai, derrière la voie des marines (le UD-4L se pose devant lui), non conduisible ; substitut Canvas |
| C3 : Noor sur l'écran de préparation | Fait | Listée « INDISPONIBLE · Noor Okafor · À L'INFIRMERIE » avec le motif, FR à l'écran et EN au catalogue ; seulement pour C3 et si elle est dans l'escouade |
| Acte V : Reine coupée à courte portée | Partiel | Cadrage de poursuite [PROPOSÉ] (décalage puis recul jusqu'à 0,78) ; à moins de 3 m, queue coupée de 16 px au plus (Node), quelques dizaines de pixels pendant le recul lui-même ; à valider en jeu |
| Recul de la Reine en QA navigateur | Fait (QA) | Rejeu avec deux remorques maintenues attachées (injection déclarée) : recul observé |
| Embarquement d'extraction sauté par la touche E | Corrigé | La touche qui confirme l'extraction ne compte plus comme « passer » (0,25 s de séquence minimum) |

Vérifications exécutées : voir le rapport de la PR (suite `verify-m577-everywhere-v188.mjs` dans `test:priorities:v188`, parcours Chromium `qa-apc-levels-v188.mjs`, `qa-colony-levels-v188.mjs` et `qa-act5-convoy-race-v188.mjs` étendus, fixtures et injections déclarées en tête des scripts). Les captures attestent ces parcours, pas une fidélité « 1:1 » ; aucune image n'a été générée.

## Campagne annexe 1 « La Saison des Reines » — cadre et arc 1 (2026-11-22)

Spec `specs/011-saison-des-reines` ; bible §13.4, §13.5, §13.7, §14.11, §30.1. Code : `src/side-campaign-queens-v188.js`, `src/queens-cinematics-v188.js`, raccordement dans `src/app.js`, `src/save.js`, `src/content.js`, `src/travel-messages-v188.js`, `src/legacy-operation-state-v131.js`, `src/operation-receipts-v131.js`, `index.html`.

| Élément | Avant | Après | Reste |
| --- | --- | --- | --- |
| Appel et acceptation | Aucun | Après le générique de l'Acte V : message daté au journal, CQ-01, briefing avec le coût du saut, acceptation qui ouvre la route | Appels des campagnes 2-5 |
| Voyage | Saut sans lien avec une campagne | Saut existant vers Nacre-7 (carburant, 14 jours), arrivée enregistrée une fois avec le message de Navarre ; missions planifiées depuis l'orbite | Vieillissement de l'équipage |
| Arc 1 | Abysse Noir isolé sur Ceto | 1.1, 1.2, chapitre (1.3-1.4), 1.5 dans l'ordre ; 3 annexes, 3 contrats ; lignée récifale | Niveaux dédiés (gabarits génériques), art |
| Choix et retour | — | Œuf de Rask (une fois), scènes de retour, CQ-02, compte rendu de l'arc 1 | Effets sur les campagnes 4-5, crise à bord |
| Arcs 2 et 3, quêtes §14.9, récompenses §14.10 | Manquant | Manquant (listés au panneau « à produire ») | Tout |

Inchangés : identifiants de contenu (le chapitre garde `special-black-abyss-v131`), succès déjà enregistrés, toutes les autres sauvegardes ; un seul champ de sauvegarde additif (`sideCampaignsV188`). Le moteur et l'ordre des mixins ne changent pas : le roster est filtré avant `engine.start`. Toutes les valeurs de délai, d'ordre et de roster sont [PROPOSÉ].

Fidélité : rien n'est déclaré « 1:1 » ; aucune image générée ; CQ-01 à CQ-06 et les scènes sont des primitives Canvas nommées.

Vérifications réellement exécutées : voir le rapport de la PR, `scripts/verify-side-campaign-queens-v188.mjs` (dans `test:priorities:v188`) et le parcours Chromium `scripts/qa-side-campaign-queens-v188.mjs` (fixtures et injections déclarées en tête : fin de l'Acte V posée dans la sauvegarde importée, objectif générique marqué atteint avant `completeMission()`, chapitre Abysse Noir posé comme fait dans le second profil faute de reçu V131 sans partie jouée). Un parcours injecté ne vaut pas une partie jouée sans aide ; combats et équilibrage restent à éprouver.

## Campagne annexe 1 « La Saison des Reines » — arcs 2 et 3, monde TR-0 (2026-11-23)

Spec `specs/011-saison-des-reines` (second lot) ; bible §13.4, §14.11. Décisions du propriétaire du 2026-11-23 : R1 confirmé ; chapitres verrouillés jusqu'à leur place puis librement rejouables ; crise de l'œuf saisi plus tard, à l'arc 2 ou 3 ; TR-0 comme 65e monde, caché jusqu'à l'arc 3. Code : `src/side-campaign-queens-v188.js`, `src/queens-crew-quests-v188.js` (nouveau), `src/queens-cinematics-v188.js`, `src/content-core-v50.js`, `src/legacy-operation-state-v131.js`, `src/ecosystem-missions-v131.js`, `src/crew-quests-v188.js`, `src/world-crisis-core.js`, `src/world-crisis.js`, `src/save.js`, `src/app.js`, `devtools/`.

| Élément | Avant | Après | Reste |
| --- | --- | --- | --- |
| Monde TR-0 | Absent du catalogue (64 mondes) | `world-65-tr-0`, 65e monde, `project-canon`, ajouté à la fin de `WORLDS` ; les 64 mondes générés et tout ce qui en dérive sont identiques (empreintes comparées avec la base) ; caché jusqu'à la fin de l'arc 2, jamais ouvert par les déblocages génériques | État du monde après la campagne ; mission `orig-tr0-1` (§39.3) |
| Arc 2 (Echo Basin) | Manquant | 2.1, 2.2, Broodstorm (2.3), 2.4, 2.5 dans l'ordre ; 4 annexes (deux conditionnelles), 3 contrats ; lignées fouisseuse et aérienne ; CQ-03 ; compte rendu | Niveaux dédiés (faux signaux, sol qui s'ouvre, combat en hauteur), art, biomes d'Echo Basin |
| Arc 3 (TR-0) | Manquant | 3.1, 3.2, Reine-Mère (3.3-3.4), Ruche-monde (3.5) dans l'ordre ; 2 annexes ; lignée Mère ; CQ-04, CQ-05, CQ-06 ; fin de campagne nuancée | Niveaux dédiés (alerte au bruit, Base Ombelle), art |
| Chapitres réutilisés | Abysse Noir seul déplacé ; rejouable seulement en orbite | Les quatre déplacés avec `legacyWorldIdsV188` ; verrouillés jusqu'à leur place, puis rejouables depuis toute orbite sans refaire avancer la campagne | Chapitres des campagnes 2 à 5 |
| Œuf saisi | Risque enregistré, aucune crise | Crise du hub existante (pont 2, quarantaine) au réveil en orbite de TR-0, par `createHubCrisis` ; deux issues ; l'arc 3 attend ; l'Interlude n'est pas modifié | — |
| Choix et fin | Œuf de Rask | + Praetorian vivant (Inez / BISHOP-9), Rask sauvé (dérivé), fin unique nuancée | Effets sur la campagne 5 |
| Quêtes §14.9, récompenses §14.10 | Manquant | Trois quêtes d'analyse après l'arc 2 ; bestiaire des adaptations | Statistiques smartgun et Cheyenne, arme anti-Reine, HADAL hors chapitre, recrue Navarre |
| Outils de développement | Entrées de l'arc 1 | Une entrée par mission, arrivée, choix, compte rendu, crise et fin des arcs 2 et 3 | — |

Compteurs : `WORLDS` 64 → 65 ; `CAMPAIGNS` 511 → 526 (15 missions propres aux arcs 2 et 3) ; quêtes d'équipage 16 → 19. Inchangés : identifiants de contenu, succès déjà enregistrés, validateur de sauvegarde (champs additifs dans `sideCampaignsV188.queens` ; état du monde TR-0 créé par la migration existante). Le moteur et l'ordre des mixins ne changent pas.

Honnêteté : « jouable » signifie ici une mission lancée sur un gabarit de niveau existant, avec son objectif de base et le roster de sa lignée ; les situations propres décrites par la bible (détecteur trompé par l'écho, attaques par le sol, vent et chutes, silence obligatoire) ne sont pas produites. La Reine volante de 2.4 est la caste royale du catalogue, au sol. Aucune image générée : scènes et cinématiques en primitives Canvas nommées. Rien n'est déclaré « 1:1 ».

Vérifications réellement exécutées : voir le rapport de la PR, `scripts/verify-side-campaign-queens-v188.mjs`, `scripts/verify-dev-tools-v188.mjs` et le parcours Chromium `scripts/qa-side-campaign-queens-v188.mjs` (fixtures et injections déclarées en tête).

## Parcours complet de la campagne principale (2026-11-22)

Une nouvelle partie a été jouée dans Chromium, du titre au saut vers Nacre-7 : prologue, Actes I à V, colonie C1-C4, station S1-S4, Interlude, audience Halloran sur « Tenir », fin, épilogue et appel de la Saison des Reines. Le détail est dans `docs/development/PLAYTHROUGH_V188_20261122.md`, avec les entrées réelles et les injections déclarées (téléportations, `defeatEnemy`, deux attentes raccourcies, deux modifications de sauvegarde pour le ravitaillement et l'infestation à bord).

Quatre bogues ont été corrigés, avec les tests `scripts/verify-bugfix-full-run-v188.mjs` :
- point de reprise du boss sous le sol (QZ-17) ;
- table tactique de la salle de briefing masquée par l'équipage ;
- dossier QZ17 non redessiné après CIN-20-ROOK ;
- départ refusé sans nommer les ressources manquantes.

Restent ouverts : la crise de l'Interlude sur le pont du joueur, l'ancien point de reprise faux des sauvegardes existantes, des textes d'objectif (P-2, conseil), le ravitaillement et l'infestation avant le saut (questions P-1 à P-5 du questionnaire). Le parcours utilise des injections : il ne vaut pas une partie jouée sans aide, et l'équilibrage reste à éprouver.

## Arsenal — complétion du lot A (2026-11-22, spec 014)

État honnête. **Fait** : profil lisible par arme (181 identifiants, `src/weapon-arsenal-v188.js`) ; pont natif des alimentations tube / barillet / bande / réservoir / tir unique pour 31 identifiants du lot A (`src/weapon-arsenal-runtime-v188.js`) avec conservation, interruption, pompe et reprise ; capacités de mécanisme ; effets de bouche des armes V131, traînée de roquette, impacts de surface et explosions sans cible ; sons par profil (indices existants) ; trois armes ajoutées 194–196 **sans plaque** (silhouettes Canvas, non achetables). **Non fait** : plaques natives, animations de pompe/barillet/bande/réservoir, chargeurs physiques hors M41A, pont natif hors lot A (cellules, harpons, bandes et réservoirs des armes AFE et Tantalus), sons propres, sous-canon M41A natif. Une silhouette provisoire n'est pas un art terminé. Inventaire et sources : `docs/development/ARSENAL_COMPLETION_V188.md`. Vérifications : `scripts/verify-weapon-arsenal-v188.mjs` (`test:weapons`) et `scripts/qa-arsenal-v188.mjs` (Chromium).

## Arsenal — lot B, armes de la franchise (2026-11-23, spec 014)

État honnête. **Fait** : 38 armes ajoutées en fin de catalogue (197–235, numéros 191 et 216 sautés) pour *Alien* (1979), *Aliens* (1986), *Alien Resurrection*, *Prometheus*, *Alien: Covenant*, *Alien: Earth*, *Aliens: Dark Descent*, *Aliens vs Predator* (2010) et *Aliens versus Predator 2* — chacune jouable (classe de tir existante, alimentation raccordée, rechargement, effets, sons existants, maîtrise, textes FR/EN) et achetable avec une **plaque provisoire dessinée** (`src/weapon-provisional-plaque-v188.js`) ; registre à trois statuts par arme (`WEAPON_FRANCHISE_LEDGER_V188`) ; pont natif étendu hors lot A aux cellules, réservoirs, bandes et au barillet du Frontier (75 identifiants raccordés, capacités inchangées) ; chargeur physique du VP70 sur preuve propre au modèle (décision A6) ; cadence documentée du M41A citée en fiche (décision A9, source secondaire, aucun changement de jeu). **Non fait** : plaques natives et poses tenues (les silhouettes Canvas sont provisoires, pas un art terminé) ; six armes d'*Alien Resurrection* reposent sur le seul nom du suivi (page non relue) ; lance-grenades U1 natif et combinaison de Ripley (tir secondaire à concevoir) ; modes secondaires documentés des armes ajoutées ; familles *Fireteam Elite*, *Colonial Marines*, *Fireteam Elite 2*, *Alien RPG*, engins d'*Isolation*, comics, romans et *Technical Manual* (sources inaccessibles ou absentes pendant le lot) ; armes des Predators exclues. Aucune arme n'est déclarée fidèle « 1:1 ». Inventaire, sources et reste : `docs/development/ARSENAL_COMPLETION_V188.md`. Vérifications : `scripts/verify-weapon-franchise-v188.mjs` (`test:weapons`), `scripts/qa-arsenal-franchise-v188.mjs` et `scripts/qa-dev-tools-v188.mjs range-arsenal` (Chromium).

## Arsenal — lot C, reste de la franchise et tir secondaire (2026-11-23, spec 014)

État honnête. **Fait** : 64 armes ajoutées en fin de catalogue (236–301, numéros 256 et 296 sautés ; 283 armes au total) pour *Aliens: Fireteam Elite* (16), *Aliens: Colonial Marines* (13, armes légendaires comprises), la combinaison M41A + M240 de Ripley (*Aliens*, 1986), *Aliens: Fireteam Elite 2* (16), *Alien RPG* (5), les engins lancés d’*Alien: Isolation* (4), *Aliens: Dark Descent* (Lacrima A20, mine GEM-80), *Aliens versus Predator: Extinction* (2, armes humaines), comics (3) et romans (2) — chacune jouable (classe de tir existante ou action de lancer V130 pour les huit engins, alimentation raccordée, rechargement, effets, sons existants, maîtrise, textes FR/EN) et achetable avec la **plaque provisoire dessinée** du lot B ; registre à trois statuts (`WEAPON_FRANCHISE_LEDGER_V188`, colonne `lot`) ; **tir secondaire** sur une action réaffectable (N), bouton tactile, manette, second compteur du HUD, reprise additive et stand de tir (`src/weapon-secondary-fire-v188.js`) : lance-grenades 30 mm natif du M41A sur le contrat V174, flammes du M240 sur la combinaison de Ripley, SL40 du F90, lance-grenades du M41A/2 et du Draco, deux canons du ZX-76, coup par coup du VP78 ; 94 identifiants sur le pont natif. **Non fait / limites** : 17 entrées ne reposent que sur le nom du suivi (aucune page lisible : rien de documenté, tout [PROPOSÉ]) ; presque aucune capacité n’est sourcée ; plaques natives, animations et sons propres absents (silhouettes Canvas, indices partagés) ; mines lancées et non posées ; tir secondaire du joueur seulement ; modes documentés d’un autre mécanisme non implémentés (visée automatique, types de grenades, surcharges, armes sous canon aux sources contradictoires) ; comics, romans et *Technical Manual* non consultés (résumés de fans). Aucune arme n’est déclarée fidèle 1:1. Détail : `docs/development/ARSENAL_COMPLETION_V188.md` (section « Lot C ») ; questions C-1 à C-8 dans `docs/development/QUESTIONS_PROPRIETAIRE_V188.md`.

## Outils de développement : lanceur de scènes et stand de tir (2026-11-22, spec 012)

Outil de développement, pas du contenu joueur. Livré : lanceur caché (`/devtools/` sur `npm run dev` ; dans le build public sous un dossier discret, `labo-tantalus-v188` par défaut ou `ATF_DEV_TOOLS_PATH`, depuis la décision du propriétaire du 2026-11-23 ; environ 650 entrées générées depuis les registres : prologue, hubs Tantalus et Asphodèle, campagne principale, fins, colonie, station, Saison des Reines, cinématiques, opérations spéciales, toutes les campagnes, checkpoints de phase des niveaux dédiés), fixtures construites par les règles du jeu et validées (`migrateSave`, `inspectSaveSlotV78`), stockage isolé, options et surcouches, stand de tir dans le moteur réel avec mesures et export des réglages. Livré caché dans le build public : discrétion sans contrôle d'accès, isolation côté client par le premier script de `index.html` (actif pour `?atf-dev=v188` seulement), hors précache du service worker, panneaux utilisables au doigt à 390×844 (émulation Chromium). Non livré (spec 012, `tasks.md`) : essai sur l'hébergeur et sur un téléphone réels, contrôle d'accès, checkpoints internes de la course du convoi et des chapitres V131, retours ARBITER 02-06 (reçus runtime), réglage des ordres d'escouade gelés, traces des tirs instantanés, surcouches en profondeur.

## Bioforge — laboratoire de confinement (2026-11-22)

Spec `specs/013-bioforge` ; audit de level design `docs/development/BIOFORGE_AUDIT_V188.md` ; bible §8.2 (`ship-bioforge`) et tableau du secteur industriel. Code : `src/bioforge-lab-layout-v188.js`, `src/bioforge-lab-render-v188.js`, `src/bioforge-lab-runtime-v188.js` (mixin ajouté en fin de chaîne dans `src/bioforge-runtime-v80.js`), `src/bioforge-level-v80.js` (trois stations et la cabine de sortie déplacées), `src/bioforge-ui-v80.js`, `src/app.js`, `bioforge-v80.css`, `src/vfx-v188.js` et `src/vfx-slots-v188.js` (type `bubble`). Hors de la Frontier Forge gelée.

| Élément | Avant | Après | Reste |
| --- | --- | --- | --- |
| Plan | 6 salles identiques, portes = murs invisibles de 10 m | 8 zones nommées dans les 6 salles, cloisons pleine hauteur, plafonds à hauteur humaine | Étage d'observation praticable |
| Arrivée et sortie | Scène inerte avant session ; sortie seulement par le terminal | Promenade sans session ; sortie à pied après purge, décontamination de 2,4 s **[PROPOSÉ]**, retour à l'annexe du hub | Reprise exacte pendant la sortie |
| Flux d'admission | File seulement dans le terminal | Tableau de file et deux cuves de stase dans le monde | — |
| Fonctions de laboratoire | Absentes | Stockage froid, analyse, incinérateur (lecture seule), galerie en profondeur | PNJ dans le laboratoire (la quête `ship-bioforge` est jouable depuis le 23 novembre 2026, section dédiée en fin de document) |
| Art | PNG V80 | PNG V80 conservés + primitives `bioforge-lab-*` | Images des emplacements (aucune générée) |

Inchangés : identifiants de salles, portes, stations et emplacements, monde 2880×720, arène, sauvegarde `bioforgeV80` (aucun champ ajouté), admissions V132, règles de session. Fidélité : références citées dans la spec (Alien 1979, Aliens 1986, Alien Resurrection 1997, Prometheus 2012, Covenant 2017, Alien: Isolation 2014), séparées en documenté / adapté / à définir ; rien n'est « 1:1 ».

Vérifications réellement exécutées : `scripts/verify-bioforge-lab-v188.mjs` (dans `test:priorities:v188`), parcours Chromium `scripts/qa-bioforge-lab-v188.mjs` à 1366×768 et 390×844 (fixture et crochet de reprise déclarés en tête), mesure de rendu avant/après dans l'audit ; voir le rapport de la PR pour les suites complètes.

## Décisions du propriétaire du 23 novembre 2026 — station (S9-1, S9-2, S9-5, noms des zones) et quête `ship-bioforge`

Base : `f8b22e68`. Décisions enregistrées dans `QUESTIONS_PROPRIETAIRE_V188.md` (« Décisions du propriétaire (2026-11-23) ») ; règles et valeurs dans la bible (§7.11, §8.6). Identifiants de contenu et sauvegardes conservés ; un champ additif (`stationV188.s1Salvagers`, absent tant que S1 ne l'écrit pas) ; la quête écrit dans des champs existants (`crewQuestsV188`, `storyCampaignV188.confrontationsV188`). Aucune image générée ; aucun nouveau fichier source.

| Élément | Statut | Constat |
| --- | --- | --- |
| S1 : collier d'arrimage en profondeur (S9-1) | Partiel | Définition `station-s1-docking-collar` (5ᵉ cale en profondeur), du plancher du collier à la cloison du quai ; reste de S1 en vue de côté ; monte-charge du collier au repos ; manivelle et sas sur le rail seulement. Objets du collier : emplacements d'art des cales réemployés (pas d'art propre à la station) ; dropship d'Echo-8 inchangé (PNG admis, au mur) |
| S1 → S4 : issue des récupérateurs (S9-2) | Fait (règle) | `stationV188.s1Salvagers` écrit une fois par la première réussite de S1 ; S4 : alliée (tenue 9 → 6, 3 à la fois, Grue à bord), hostile (2 récupérateurs armés dans la tenue), absente, ou comportement antérieur si rien n'est enregistré. Les récupérateurs alliés sont des silhouettes : leur aide réduit la vague, ils ne tirent pas |
| S4 : tenue du quai | Corrigé | Une apparition dont l'écart tombait derrière la cloison de l'anneau fermée était abandonnée : la tenue recevait 2 créatures sur 9. Elle apparaît maintenant au bord de la zone sûre. L'équilibrage de la tenue complète n'a pas été éprouvé par un playtest |
| S4 : colons volontaires (S9-5) | Partiel | Nombre lu dans `colonyMissionsV188.population`, 6 silhouettes au plus, marche d'entrée depuis le collier, texte FR/EN avec le nombre réel. Emplacement `station-volunteer-colonist` en primitive Canvas (21ᵉ emplacement, 11 en primitives) |
| S1-S4 : noms des zones | Fait | Plaques des cloisons, ligne de zone et plan local lisent la station (FR/EN, 11 noms **[PROPOSÉ]**) ; identifiants de zone, art et signature du niveau inchangés ; annexes et contrats gardent les noms du gabarit |
| Quête `ship-bioforge` « Ce qu'on garde en vie » | Partiel | Entrée `ship-bioforge-care` du face-à-face (5 arguments, 3 relevés du bord toujours disponibles, 3 pièces du dossier selon la sauvegarde) ; deux protocoles, effets sur des valeurs existantes (loyauté, stress, recherche) et texte dans le laboratoire ; aucune fin touchée. Portraits de BISHOP-9 et d'Inez en substituts Canvas ; pas de voix ; les deux personnages ne sont pas dans le laboratoire |
| Accès narratif à la Bioforge | Fait (règle) | Porte fermée tant que le débat n'est pas tranché ; une sauvegarde qui a déjà créé une session garde son accès et reçoit le débat par Inez ; le lanceur de développement ouvre la vue directement |
| Face-à-face (spec 010) | Étendu | Extension additive : arguments propres à une entrée (`ownPieces`), petit portrait du témoin, libellés d'issue propres ; les entrées Halloran et CASSIUS et leurs règles sont inchangées |

Fidélité : rien n'est déclaré « 1:1 ». Les repères documentés, les adaptations et ce qui reste à définir sont séparés dans la bible (§7.11, §8.6).

Vérifications réellement exécutées : voir le rapport du lot. Suites Node étendues : `scripts/verify-station-levels-v188.mjs` (collier, issue enregistrée, quai de S4, colons, noms), `scripts/verify-depth-holds-v188.mjs`, `scripts/verify-confrontation-v188.mjs` (entrée, quête, accès, portraits), `scripts/verify-bioforge-lab-v188.mjs` (protocole affiché), `scripts/verify-colony-crew-v188.mjs`. Parcours Chromium : `scripts/qa-station-levels-v188.mjs` (S1, S4 négocié, `station-s4@forced`) et `scripts/qa-bioforge-lab-v188.mjs` (débat joué avec les boutons du dialogue) ; fixtures et injections déclarées en tête de chaque script.
## Décisions du propriétaire du 23 novembre 2026

Détail : `docs/development/QUESTIONS_PROPRIETAIRE_V188.md` (section du 2026-11-23) ; tests `scripts/verify-owner-decisions-20261123-v188.mjs`.

| Sujet | Fait | Reste |
| --- | --- | --- |
| Ravitaillement (P-1) | La colonie rend du ravitaillement (+8 par mission réussie, +4 par niveau de chantier validé, **[PROPOSÉ]**) ; sources affichées au Commandement ; refus de départ conservé ; simulation de la ligne principale testée | Carburant non décidé (stock de départ égal au coût des 16 sorties) ; équilibrage non éprouvé en partie réelle |
| Saut bloqué par l'infestation (P-2) | Blocage conservé ; raison et marche à suivre affichées à la carte galactique (FR/EN) | Pas de mission dédiée ; clôture de la chaîne non rejouée de bout en bout |
| Ordre des actes (P-3) | Acte I recommandé avant l'Acte II ; QZ-18 non verrouillé | Ouverture du conseil avant C4 et de l'Interlude avant C3 inchangée |
| Interlude (P-4) | Crise liée au pont 2, menaces en attente nommées au relevé du hub | Autres crises du hub inchangées |
| Conseil (P-5) | Phrase propre au cas d'un seul conteneur | — |
| Armes 194–196 (A1) | Achetables à l'armurerie derrière une **plaque provisoire dessinée** (Canvas, emplacement nommé) | **Art non livré** : plaques natives à produire ; identité et statistiques inchangées, rien n'est certifié « 1:1 » |
| Pompe (A5) | Option « pompe manuelle » : touche dédiée réaffectable, bouton tactile, invite texte ; automatique par défaut | Sons et animation propres à la pompe manuelle |
| Capacités (A2-A4) | Conservées, décision consignée | — |
| Petits défauts du parcours | Texte de l'objectif P-2 unifié, groupe de commandes du pupitre réellement masqué, conflit de profil affiché, boutons du verdict QZ-17 distincts | R1 (anciennes sauvegardes), Q4 (arme affichée au plan) |

Vérifié dans Chromium sur le lanceur de développement (stockage isolé) : objectif et étoile de fin de prologue, ligne des sources au Commandement, panneau de saut, plaque et achat de l'Ithaca 37, réglage et bouton de pompe, pompe manuelle en mission (QZ-17), crise de l'Interlude selon le pont. Injections déclarées dans le rapport de livraison.
