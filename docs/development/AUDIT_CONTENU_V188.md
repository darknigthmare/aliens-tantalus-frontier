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
| Dossier QZ17 (7 pièces) | Partiel | 5 pièces lisibles ; CASSIUS (S2) et Wren (`colony-a-quai`) affichées « pas encore jouables ». *Lot colonie et équipage : les 7 pièces sont jouables ; reste Partiel tant que les pièces 1-5 n'ont pas leur art.* |
| Choix final et fins (§5.7.1) | Partiel | Règles `finalChoiceOptionsV188`, `resolveFinalChoiceV188` testées, sans écran ni conseil de guerre. *Spec 006 : conseil et trois fins jouables (Partiel).* |
| Acte V « Non viable », course APC, épilogue | Manquant | Q1, Q2, Q5. *Spec 006 : Partiel, course APC dédiée absente.* |

## 3. Front colonie — Port-Méridien (§6, §43)

| Élément | Statut | Constat |
| --- | --- | --- |
| `colony-intro-quai`, `colony-intro-doyenne` | Fait | Séquence du quai et visite guidée `cin-doyenne` |
| Reconstruction : 7 chantiers, 3 niveaux, paliers (§6.3) | Partiel | `colony-reconstruction-v188.js` : règles, coûts [PROPOSÉ], table au Commandement. *Lot colonie et équipage : validation par mission locale après C1, annexes ouvertes à « Rétablie », contrats défensifs seuls en « Survie », volontaires.* Manquent : la console du quai (Q26), le palier *Libre*, le recrutement de Nadia Bensaïd |
| Gestion de la colonie : quartiers visitables V2 (§43, Q24) | Partiel | Seul le quai existe en salle ; les sept quartiers ne sont pas construits |
| Missions principales C1-C5 | Partiel (lot colonie et équipage) | C1-C4 jouables sur des gabarits existants, récompense unique, chantier construit ; C5 = `act5-port-walls` avec bonus des murs ; niveaux dédiés absents |
| Annexes (7) dont `colony-a-quai` (pièce Wren) | Partiel (lot colonie et équipage) | Les 7 jouables (gabarits génériques), effets uniques, décisions Grue et C4 ; pièce de Wren acquise ; art en placeholders |
| Contrats locaux rejouables (8) | Partiel (lot colonie et équipage) | 8 contrats `colony-l-*` rejouables, chacun valide son chantier ; « chantier Eau » rattaché à l'Énergie |
| Vie de la colonie : événements entre deux missions (Q29) | Manquant | — |

## 4. Front station — Asphodèle (§7, §42)

| Élément | Statut | Constat |
| --- | --- | --- |
| `station-intro-silence` (Calme, à bord) | Manquant | Débloqué par la quête de Rook (§8.1) |
| S1 L'arrimage, S2 La voix de CASSIUS, S3 Les ponts scellés, S4 Le hub Asphodèle | Manquant | Q6 : produire S1-S4 comme missions avant le hub ; Q103 : feature Spec Kit |
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
| Cargo brutal | Partiel | Jouable ; **art** de la Matriarche en dette |
| Doctrine Alpha / Bravo | Partiel | Jouable ; coop étendue absente |

## 7. Partie II — voyage et campagnes annexes (§13-§18)

| Élément | Statut | Constat |
| --- | --- | --- |
| Carte galactique et saut (`navigate:galaxy`) | Partiel | `galaxy-jump-v115.js` : carburant `2 + ⌈danger/3⌉`, séquence de 8 s ; **aucun temps de voyage** (Q21) |
| Messages en retard, colonies qui évoluent pendant le voyage (§13.2) | Partiel (lot colonie et équipage) | `travel-messages-v188.js` : 3 à 5 messages par saut, une fois, au journal des alertes, FR/EN ; les mondes évoluent déjà (simulation) ; vieillissement de l'équipage absent |
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

Cette liste décrit les manques constatés lors de l'audit initial. Les continuations du 16 novembre 2026 produisent les trois portraits de Port-Méridien, les dix-huit cartes de colonie et de quêtes, les six illustrations de scène Asphodèle et les neuf objets d'habillage de ses missions détaillés ci-dessous. Les lots du 17 novembre produisent les treize parois et les vingt détails du hub, achevant les 42 emplacements d'images déclarés, puis six images distinctes pour CIN-70 à CIN-72. Les autres besoins hors de ces catalogues restent ouverts. Les bilans successifs ci-dessous conservent les nombres de leur propre point de reprise.

- Décors jouables du hub Asphodèle (anneau, pont de contrôle, laboratoire, serre, salle des relais, mémorial), noyau de CASSIUS, récupérateurs de Grue et dropship d'Echo-8 (§29.4) : les 42 emplacements actuels sont illustrés et intégrés. Les ouvriers possèdent quatre poses chacun ; les animations supplémentaires, autres rôles de PNJ et nouveaux objets hors catalogue restent à produire. Les cartes d'extérieur et de CASSIUS illustrent séparément les scènes de dialogue.
- Quartiers de Port-Méridien en V2 et animations des habitants nommés. Les portraits de Wren, Ferro et Sarrazin sont désormais produits ; les primitives Q78 restent leur secours de chargement.
- Poses de dialogue de l'équipage et planches des recrues. Aux onze cartes d'objets et de preuves du lot colonie/équipage s'ajoutent celles de Rook, Vega, Harlow et DAVID-8R ; les illustrations ne fournissent ni poses ni objets animés en jeu.
- Art en dette des chapitres V131 et de Cargo brutal (`limitations` de `special-operations-v131.js`).
- Cinématiques CIN-70 à CIN-72 : les onze plans existants disposent désormais de six nouvelles images et d'éléments réutilisés ; dix plans emploient de l'art, le dernier conserve la perte du signal native. La continuation cinématique du 17 novembre est décrite ci-dessous. Les cinématiques suivantes et les autres besoins de mise en scène restent ouverts. Les six cartes de `content-gap-slots-v188.js` constituent toujours un autre catalogue.
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
| Acte V « Non viable » | Manquant | Partiel | Trois missions finales par ligne sur des gabarits existants, pont chronométré, face-à-face au quai, CIN-60, CIN-61 ; course APC et Reine dédiées absentes (Q1) |
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
